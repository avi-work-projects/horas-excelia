const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-08-21T10:00:00'));
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
});
async function eventAlarm(page){
  await page.locator('#eventsBtn').click();await page.evaluate(()=>{appStorage.setItem('excelia-alarm-url','https://alarm.invalid/audit');const event={id:'delivery-test',kind:'puntual',type:'Otros',title:'Prueba ficticia',start:'2026-08-22',end:'2026-08-22',time:'18:00',color:'#537b78'};EVENTS=[event];openEvAlarm(event,new Date(event.start+'T00:00:00'));});
}
test('La respuesta opaca nunca se presenta como creación confirmada',async({page})=>{
  await page.route('https://alarm.invalid/**',route=>route.fulfill({body:'ok'}));await eventAlarm(page);await page.locator('#evAlarmCreate').click();
  await expect(page.locator('#toast')).toContainText('Solicitud enviada');await expect(page.locator('#toast')).toContainText('Comprueba el reloj');await expect(page.locator('#toast')).not.toContainText('creada');
  expect(await page.evaluate(()=>isEvAlarmSet('delivery-test'))).toBe(true);expect(await page.evaluate(()=>ALARMS.length)).toBe(1);
  expect(await page.evaluate(()=>ALARM_REQUESTS.map(r=>Object.keys(r).sort().join(',')))).toEqual(['durationMs,startedAt,state']);
});
test('Un fallo no marca ni registra una alarma enviada y no reintenta',async({page})=>{
  let count=0;await page.route('https://alarm.invalid/**',route=>{count++;return route.abort();});await eventAlarm(page);await page.locator('#evAlarmCreate').click();
  await expect(page.locator('#toast')).toContainText('Entrega sin confirmar');await expect(page.locator('#toast')).toContainText('antes de repetir');await expect(page.locator('#evAlarmCreate')).toBeEnabled();
  expect(await page.evaluate(()=>isEvAlarmSet('delivery-test'))).toBe(false);expect(await page.evaluate(()=>ALARMS.length)).toBe(0);expect(count).toBe(1);
});
test('Solicitud lenta: aviso, sin reenvíos ni éxito prematuro',async({page})=>{
  await eventAlarm(page);await page.evaluate(()=>{window.alarmCallCount=0;window.fetch=()=>{alarmCallCount++;return new Promise(resolve=>window.finishAlarm=resolve);};});await page.locator('#evAlarmCreate').click();await expect(page.locator('#evAlarmCreate')).toBeDisabled();
  expect(await page.evaluate(()=>isEvAlarmSet('delivery-test'))).toBe(false);expect(await page.evaluate(()=>ALARMS.length)).toBe(0);
  await page.clock.fastForward(10001);await expect(page.locator('#toast')).toContainText('sigue sin confirmar');expect(await page.evaluate(()=>alarmCallCount)).toBe(1);
  await page.evaluate(()=>finishAlarm({type:'opaque'}));await expect(page.locator('#toast')).toContainText('Solicitud enviada');
});
test('Las peticiones evitan la caché y el diagnóstico no guarda datos privados',async({page})=>{
  const options=await page.evaluate(async()=>{window.fetch=async(url,opts)=>{window.alarmOptions=opts;return {type:'opaque'};};await requestMacroAlarm('https://alarm.invalid/private?alarmMsg=FICTICIO');return {options:alarmOptions,trace:JSON.stringify(ALARM_REQUESTS)};});
  expect(options.options).toEqual({mode:'no-cors',cache:'no-store'});expect(options.trace).not.toMatch(/FICTICIO|https|alarmMsg/);
});
