const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-06T09:00:00'));
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
  await page.goto('/');await page.locator('#eventsBtn').click();
  await page.locator('#evViewUpcoming').click();
});
test('todas las categorías de eventos abren el panel de alarmas, sin exigir hora',async({page})=>{
  test.setTimeout(90000);
  const categories=await page.evaluate(()=>Object.entries(EV_KINDS).flatMap(([kind,v])=>v.types.map(type=>({kind,type}))));
  for(const category of categories){
    await page.evaluate(({kind,type})=>{
      RUTINAS=[];BDAYS=[];EVENTS=[{id:'alarm-kind-test',kind,type,title:'Evento de prueba',start:'2026-10-07',end:'2026-10-07',color:'#a78bfa'}];
      refreshEvents();
    },category);
    await page.locator('.ev-upcoming-item[data-id="alarm-kind-test"]').click();
    await expect(page.locator('#evAlarmCreate')).toBeVisible();
    await expect(page.locator('#evAlarmOv')).toContainText('07/10');
    await page.locator('#evAlarmClose').click();await expect(page.locator('#evAlarmWrap')).toHaveCount(0);
  }
});
test('rutina: alarma de la sesión correcta, ficha y edición conservadas',async({page})=>{
  const requests=[];
  await page.route('https://alarm.invalid/**',async route=>{requests.push(route.request().url());await route.fulfill({status:200,body:'ok'});});
  await page.evaluate(()=>{
    appStorage.setItem('excelia-alarm-url','https://alarm.invalid/test');
    EVENTS=[];BDAYS=[];RUTINAS=[{id:'alarm-routine',name:'Rutina de prueba',icon:'gym',start:'2026-10-01',weekDays:[3],time:'18:00',dur:60}];
    EV_UP_SHOW_RUT=true;refreshEvents();
  });
  const card=page.locator('.ev-upcoming-item[data-id="rut-alarm-routine-2026-10-07"]');
  await card.click();await expect(page.locator('#evAlarmOv')).toContainText('18:00');
  await expect(page.locator('#evAlarmEdit')).toContainText('Editar rutina');
  await expect(page.locator('#evAlarmInfo')).toBeVisible();
  await page.locator('#evAlarmCreate').click();await expect(page.locator('#evAlarmWrap')).toHaveCount(0);
  await expect.poll(()=>requests.length).toBe(1);
  const url=new URL(requests[0]);expect(url.searchParams.get('alarmH')).toBe('17');expect(url.searchParams.get('alarmM')).toBe('0');
  expect(url.searchParams.get('alarmMsg')).toContain('Rutina de prueba 07/10');
  await expect(card.locator('.ev-upcoming-bell')).toHaveClass(/set/);
  expect(await page.evaluate(()=>isEvAlarmSet('rut-alarm-routine-2026-10-14'))).toBe(false);
  await card.click();await page.locator('#evAlarmEdit').click();await expect(page.locator('#rutFName')).toHaveValue('Rutina de prueba');
});
