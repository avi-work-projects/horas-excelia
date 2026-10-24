const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00'));
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
 await page.goto('/');await page.locator('#eventsBtn').click();
});
test('alarma iniciada: sin acceso; panel abierto: no envía ni guarda al vencer',async({page})=>{
 const requests=[];await page.route('https://alarm.invalid/**',async r=>{requests.push(r.request().url());await r.fulfill({body:'ok'});});
 await page.evaluate(()=>{
  appStorage.setItem('excelia-alarm-url','https://alarm.invalid/test');
  EVENTS=[{id:'clock-test',kind:'puntual',type:'Otros',title:'Cita',start:'2026-08-21',end:'2026-08-21',time:'10:01',color:'#537b78'}];
  openEvDetail(EVENTS[0],null,null,'2026-08-21');
 });
 await expect(page.locator('#evDAlarm')).toContainText('Alarma');await expect(page.locator('#evDAlarm')).toContainText('🔔');
 await page.locator('#evDAlarm').click();await expect(page.locator('#evAlarmOv')).toBeVisible();
 await page.clock.setFixedTime(new Date('2026-08-21T10:02:00'));
 await page.locator('#evAlarmCreate').click();await expect(page.locator('.toast')).toContainText('ya ha empezado');
 expect(requests).toHaveLength(0);expect(await page.evaluate(()=>ALARMS.length)).toBe(0);
 await page.locator('#evAlarmClose').click();await expect(page.locator('#evAlarmWrap')).toHaveCount(0);
 await page.evaluate(()=>openEvDetail(EVENTS[0],null,null,'2026-08-21'));
 await expect(page.locator('#evDAlarm')).toHaveCount(0);
});
for(const width of [320,400,440])test(`paneles reservan sus acciones y restauran Tareas ${width}`,async({page})=>{
 await page.setViewportSize({width,height:880});
 await expect(page.locator('#tasksFab')).toBeVisible();
 await page.evaluate(()=>openBodaClaseForm(null));await expect(page.locator('#bodaFormSave')).toBeVisible();
 await expect(page.locator('#tasksFab')).toBeHidden();
 const save=page.locator('#bodaFormSave');const box=await save.boundingBox();
 await save.click({trial:true,position:{x:box.width-5,y:box.height/2}});
 await page.evaluate(()=>closeBodaClaseForm());
 await expect(page.locator('#tasksFab')).toBeVisible();
});
test('recuperación anterior se guarda y reaparece tras recargar',async({page})=>{
 await page.evaluate(()=>{
  RUTINAS=[{id:'earlier-test',name:'Clase',icon:'gym',start:'2026-08-01',weekDays:[4],time:'18:00',dur:60,skips:{'2026-08-20':1},weeks:{}}];saveRutinas();openRutHistory(RUTINAS[0]);
 });
 await page.locator('#rutHistoryAdd').click();await page.locator('[data-addition-mode="recover"]').click();
 await page.locator('[data-recover-origin="2026-08-20"]').click();
 await page.locator('.rut-dpick-real .ev-cell[data-ds="2026-08-19"]').click();await page.locator('#rutRecoveryConfirm').click();
 await page.locator('#rutExtraSave').click();await expect(page.locator('#rutAdditionOv')).toHaveCount(0);
 await page.reload();expect(await page.evaluate(()=>RUTINAS[0].extraSessions[0].date)).toBe('2026-08-19');
 expect(await page.evaluate(()=>RUTINAS[0].extraSessions[0].recoveryOf)).toBe('2026-08-20');
});
