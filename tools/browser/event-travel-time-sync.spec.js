const {test,expect}=require('@playwright/test');
const {chooseTime}=require('./time-picker-helper');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-11-09T10:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');});
  await page.goto('/');await page.locator('#eventsBtn').click();
  await page.evaluate(()=>{EVENTS=[];RUTINAS=[];EV_YEAR=2026;EV_MONTH=10;EV_VIEW='cal';refreshEvents(false);});
  await page.locator('#evViewCal').click();await page.locator('.ev-cell[data-ds="2026-11-14"]').click();
  await page.locator('.ev-kind-btn[data-kind="grande"]').click();await page.locator('#evFTypePicker [data-type="Asturias"]').click();
});
test('inicio e ida, fin y vuelta se sincronizan en ambos sentidos y Ninguno conserva las horas',async({page},info)=>{
  await page.locator('#evFEnd').fill('2026-11-15');
  await chooseTime(page,'#evFTime','14:30');await chooseTime(page,'#evFEndTime','18:00');
  for(const part of ['ida','vuelta'])await page.locator('.ev-viaje-chk[data-tramo="'+part+'"]').check();
  await expect(page.locator('.ev-viaje-time[data-tramo="ida"]')).toHaveValue('14:30');
  await expect(page.locator('.ev-viaje-time[data-tramo="vuelta"]')).toHaveValue('18:00');
  await chooseTime(page,'.ev-viaje-time[data-tramo="ida"]','15:00');await expect(page.locator('#evFTime')).toHaveValue('15:00');
  await chooseTime(page,'.ev-viaje-time[data-tramo="vuelta"]','19:30');await expect(page.locator('#evFEndTime')).toHaveValue('19:30');
  await chooseTime(page,'#evFTime','16:00');await expect(page.locator('.ev-viaje-time[data-tramo="ida"]')).toHaveValue('16:00');
  await page.locator('.ev-viaje-modo[data-tramo="ida"]').selectOption('coche');await page.locator('.ev-viaje-cond[data-tramo="ida"]').fill('Persona ficticia');
  await page.locator('.ev-viaje-modo[data-tramo="ida"]').selectOption('ninguno');await page.locator('.ev-viaje-modo[data-tramo="vuelta"]').selectOption('ninguno');
  await expect(page.locator('.ev-viaje-cond[data-tramo="ida"]')).toBeHidden();
  await page.locator('#evFViajeBox').screenshot({path:info.outputPath('trayectos-sin-transporte.png')});
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  const event=await page.evaluate(()=>EVENTS[0]);expect(event).toMatchObject({time:'16:00',endTime:'19:30',viaje:{ida:{time:'16:00',modo:'ninguno'},vuelta:{time:'19:30',modo:'ninguno'}}});expect(event.viaje.ida.conductor).toBeUndefined();
  await page.evaluate(()=>openEvForm(EVENTS[0]));await expect(page.locator('#evFTime')).toHaveValue('16:00');await expect(page.locator('.ev-viaje-modo[data-tramo="ida"]')).toHaveValue('ninguno');
  await page.locator('#evFTime').click();await page.locator('#timePickerClear').click();await expect(page.locator('.ev-viaje-time[data-tramo="ida"]')).toHaveValue('');
  await expect(page.locator('#evFEndTime')).toHaveValue('19:30');await expect(page.locator('#evFEndTime')).toBeEnabled();
  await page.locator('#evFClose').click();expect(await page.evaluate(()=>EVENTS[0].time)).toBe('16:00');
});
test('editar un evento antiguo presenta las horas usadas en calendario sin escribir hasta Guardar',async({page})=>{
  await page.locator('#evFClose').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  await page.evaluate(()=>{EVENTS=[{id:'legacy',kind:'grande',type:'Asturias',title:'Asturias',color:evTypeColor('grande','Asturias'),start:'2026-11-14',end:'2026-11-15',time:'09:00',viaje:{ida:{time:'15:00',modo:'tren'},vuelta:{time:'18:30',modo:'bus'}}}];openEvForm(EVENTS[0]);});
  const previous=await page.evaluate(()=>JSON.stringify(EVENTS));
  await expect(page.locator('#evFTime')).toHaveValue('15:00');await expect(page.locator('#evFEndTime')).toHaveValue('18:30');
  expect(await page.evaluate(()=>JSON.stringify(EVENTS))).toBe(previous);
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({time:'15:00',endTime:'18:30'});
});

test('un grande puede guardar solo la vuelta y un transporte Ninguno',async({page})=>{
  await page.locator('.ev-viaje-chk[data-tramo="vuelta"]').check();
  await chooseTime(page,'.ev-viaje-time[data-tramo="vuelta"]','18:30');
  await page.locator('.ev-viaje-modo[data-tramo="vuelta"]').selectOption('ninguno');
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({endTime:'18:30',viaje:{vuelta:{time:'18:30',modo:'ninguno'}}});
  expect(await page.evaluate(()=>EVENTS[0].time)).toBeUndefined();
  expect(await page.evaluate(()=>evEndTime(EVENTS[0]))).toBe('18:30');
});

test('cambiar de clase y volver a Grande no deja horas antiguas en el trayecto',async({page})=>{
  await page.locator('.ev-viaje-chk[data-tramo="ida"]').check();await chooseTime(page,'#evFTime','14:30');
  await page.locator('.ev-kind-btn[data-kind="puntual"]').click();await page.locator('#evFTypePicker [data-type="Otros"]').click();
  await chooseTime(page,'#evFTime','16:00');await page.locator('.ev-kind-btn[data-kind="grande"]').click();
  await page.locator('#evFTypePicker [data-type="Asturias"]').click();await expect(page.locator('.ev-viaje-time[data-tramo="ida"]')).toHaveValue('16:00');
});
