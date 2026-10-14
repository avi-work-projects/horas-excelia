const {test,expect}=require('@playwright/test');
const {chooseTime}=require('./time-picker-helper');
test.use({serviceWorkers:'block'});
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date(2026,9,13,10));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
});
test('botones principales con el peso de Próximos en las cuatro ventanas',async({page},info)=>{
 for(const width of [320,400]){
  await page.setViewportSize({width,height:880});
  for(const [open,close,selector] of [['openEvents','closeEvents','#eventsOverlay .ev-hdr-sub .ev-view-toggle'],['openEcon','closeEcon','.econ-tab-btn'],['openFiscal','closeFiscal','.fiscal-tab-btn'],['openEstudio','closeEstudio','.est-nav .est-btn']]){
   await page.evaluate(name=>window[name](),open);
   const buttons=page.locator(selector);await expect(buttons.first()).toBeVisible();
   for(const button of await buttons.all()){await expect(button).toHaveCSS('font-weight','600');expect(await button.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);}
   await page.screenshot({path:info.outputPath(open+'-'+width+'.png'),animations:'disabled'});
   await page.evaluate(name=>window[name](),close);
   await expect.poll(()=>buttons.first().evaluate(el=>el.closest('.full-overlay').style.display)).toBe('none');
  }
 }
});
test('alarma desde calendario conserva la ocurrencia y se configura como en Próximos',async({page},info)=>{
 const requests=[];await page.route('https://alarm.invalid/**',async route=>{requests.push(route.request().url());await route.fulfill({status:200,body:'ok'});});
 await page.locator('#eventsBtn').click();
 await page.evaluate(()=>{appStorage.setItem('excelia-alarm-url','https://alarm.invalid/test');EVENTS=[{id:'weekly',title:'Gestión semanal',kind:'puntual',type:'Rec. Gestiones',color:'#9874aa',start:'2026-09-01',end:'2026-09-01',time:'18:00',repeat:{type:'weekly',weekDays:[2]}}];EV_YEAR=2026;EV_MONTH=9;EV_VIEW='cal';refreshEvents();});
 await page.locator('.ev-cell[data-ds="2026-10-20"] [data-id="weekly"]').click();
 await expect(page.locator('#evDAlarm')).toBeVisible();await page.screenshot({path:info.outputPath('ficha-alarma.png'),animations:'disabled'});
 await page.locator('#evDAlarm').click();await expect(page.locator('#evAlarmOv')).toContainText('20/10');await expect(page.locator('#evAlarmH')).toHaveValue('17');
 await page.locator('#evAlarmCreate').click();await expect.poll(()=>requests.length).toBe(1);expect(new URL(requests[0]).searchParams.get('alarmMsg')).toContain('20/10');
 await expect(page.locator('#evAlarmWrap')).toHaveCount(0);
 await page.evaluate(()=>{EV_VIEW='week';refreshEvents();});
 await page.locator('.ev-wk-chip[data-id="weekly"][data-ds="2026-10-27"]').click();await page.locator('#evDAlarm').click();await expect(page.locator('#evAlarmOv')).toContainText('27/10');
});
test('límite de 14 días, días pasados y fechas discontinuas',async({page})=>{
 expect(await page.evaluate(()=>{
  const event={id:'days',start:'2026-10-01',end:'2026-10-28',dates:['2026-10-12','2026-10-13','2026-10-27','2026-10-28']};
  return [null,'2026-10-12','2026-10-13','2026-10-14','2026-10-27','2026-10-28'].map(ds=>{const d=evDetailAlarmDate(event,ds);return d?evDk(d):null;});
 })).toEqual(['2026-10-13',null,'2026-10-13',null,'2026-10-27',null]);
});
test('cumpleaños permite cruzar 1 y 31 en ambos sentidos',async({page},info)=>{
 await page.locator('#eventsBtn').click();await page.evaluate(()=>openBdayDatePicker('day',1,value=>window.chosenDay=value));
 const drum=page.locator('#bdDayDrum');await expect(drum).toHaveAttribute('aria-valuenow','1');
 await expect.poll(()=>drum.evaluate(el=>Math.round(el.scrollTop/44))).toBe(31);
 await drum.focus();await drum.press('ArrowUp');await expect(drum).toHaveAttribute('aria-valuenow','31');await drum.press('ArrowDown');await expect(drum).toHaveAttribute('aria-valuenow','1');
 await drum.press('End');await drum.press('ArrowDown');await expect(drum).toHaveAttribute('aria-valuenow','1');
 await expect(drum.locator('.drum-selected')).toHaveCount(1);await page.screenshot({path:info.outputPath('dias.png'),animations:'disabled'});
 await page.locator('#bdDateApply').click();expect(await page.evaluate(()=>chosenDay)).toBe(1);
});
test('rutinas usa cuartos de hora y conserva un horario antiguo al editar',async({page},info)=>{
 await page.locator('#eventsBtn').click();await page.evaluate(()=>openRutForm(null));await chooseTime(page,'#rutFTime','19:45');
 await page.locator('#rutFTime').click();await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow','45');
 expect(await page.locator('#timePickerMinutes [data-val]').evaluateAll(items=>[...new Set(items.map(el=>el.dataset.val))])).toEqual(['0','15','30','45']);
 await page.locator('#timePickerMinutes').focus();await page.locator('#timePickerMinutes').press('ArrowDown');await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow','0');
 await page.screenshot({path:info.outputPath('rutina-cuartos.png'),animations:'disabled'});await page.locator('#timePickerSave').click();await expect(page.locator('#rutFTime')).toHaveValue('19:00');
 await expect(page.locator('#timePickerWrap')).toHaveCount(0);await page.locator('#rutFTime').evaluate(el=>el.value='19:37');await page.locator('#rutFTime').click();await expect(page.locator('#timePickerMinutes')).toHaveAttribute('aria-valuenow','37');await page.locator('#timePickerSave').click();await expect(page.locator('#rutFTime')).toHaveValue('19:37');
});

test('la rueda de minutos de la campana cruza de hora sin perder la selección',async({page})=>{
 await page.locator('#eventsBtn').click();await page.locator('#eventsOverlay [data-nav="alarm"]').click();
 await expect(page.locator('#drumMin .drum-selected')).toHaveText('20');
 await page.locator('#drumMin').evaluate(el=>el.scrollTo({top:125*44,behavior:'instant'}));
 await expect(page.locator('#drumHour .drum-selected')).toHaveText('10');await expect(page.locator('#drumMin .drum-selected')).toHaveText('05');
 await expect.poll(()=>page.locator('#drumMin').evaluate(el=>Math.round(el.scrollTop/44))).toBe(65);
 await page.locator('#drumMin').evaluate(el=>el.scrollTo({top:59*44,behavior:'instant'}));
 await expect(page.locator('#drumHour .drum-selected')).toHaveText('09');await expect(page.locator('#drumMin .drum-selected')).toHaveText('59');
});
