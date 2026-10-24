const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00'));
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
 await page.goto('/');await page.locator('#eventsBtn').click();
});
for(const mode of ['midnight','return'])test(`alarma ${mode}: fecha real del aviso y envío simulado`,async({page})=>{
 const requests=[];await page.route('https://alarm.invalid/**',async route=>{requests.push(route.request().url());await route.fulfill({body:'ok'});});
 await page.evaluate(mode=>{
  appStorage.setItem('excelia-alarm-url','https://alarm.invalid/test');
  const event={id:'target-test',kind:'puntual',type:'Otros',title:'Evento de prueba',start:'2026-08-22',end:'2026-08-22',time:'00:15',color:'#537b78'};
  if(mode==='return')Object.assign(event,{kind:'grande',type:'Viaje',start:'2026-08-21',end:'2026-08-23',viaje:{ida:{time:'08:00',modo:'coche'},vuelta:{time:'18:00',modo:'tren'}}});
  EVENTS=[event];openEvAlarm(event,new Date(event.start+'T00:00:00'));
 },mode);
 await expect(page.locator('#evAlarmOv')).toBeVisible();
 if(mode==='return'){
  await expect(page.locator('.ev-alarm-pre')).toHaveCount(1);
  await expect(page.locator('.ev-alarm-pre')).toContainText('Vuelta · 23 ago 2026');
  await expect(page.locator('.bd-alarm-date')).toContainText('23/08');
 }else await expect(page.locator('.ev-alarm-pre-btn.on')).toContainText('23:15 · 21/08');
 await page.locator('#evAlarmCreate').click();await expect.poll(()=>requests.length).toBe(1);
 const saved=await page.evaluate(()=>ALARMS[0]);
 expect(saved.targetDate).toBe(mode==='return'?'2026-08-23':'2026-08-21');
 expect(saved.hour).toBe(mode==='return'?17:23);expect(saved.minute).toBe(mode==='return'?0:15);
 const url=new URL(requests[0]);expect(url.searchParams.get('alarmDays')).toBe(mode==='return'?'1':'');
});
