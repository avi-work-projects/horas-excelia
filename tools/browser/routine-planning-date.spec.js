const {test,expect}=require('@playwright/test');
const {chooseTime}=require('./time-picker-helper');
test.use({timezoneId:'Europe/Madrid'});
async function setup(page){
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  localStorage.setItem('excelia-nav-icons-v1','professional');
  if(!localStorage.getItem('excelia-rutinas-v1'))localStorage.setItem('excelia-rutinas-v1',JSON.stringify([{id:'plan',name:'Pádel de prueba',icon:'padel',color:'#a3e635',start:'2026-10-01',weekDays:[],weeks:{},skips:{},time:'18:00',dur:60,flex:{period:'month',target:3,weeklyTarget:1,sessions:{}}}]));
 });
 await page.goto('/');await page.evaluate(()=>{applyTheme('light');closeHomePopup();EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=9;openEventsAt();});
}
test('mes de seis filas y editor de sesión completos en móvil',async({page},info)=>{
 await page.clock.setFixedTime(new Date('2026-11-05T12:00:00+01:00'));await setup(page);
 await page.evaluate(()=>{
  const r=RUTINAS[0];r.name='Gimnasio';r.flex.target=8;r.flex.weeklyTarget=2;
  for(const day of ['03','05','10','12','17','19','24','26'])r.flex.sessions['2026-11-'+day]={time:'18:00',dur:60};
  saveRutinas();openRutPlan(r);
 });
 await expect(page.locator('#rutPlanOv')).toHaveClass(/open/);
 await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));
 for(const [width,height] of [[320,640],[360,720],[393,820],[440,880]]){
  await page.setViewportSize({width,height});
  const last=await page.locator('[data-rday="2026-11-30"]').boundingBox(),footer=await page.locator('.rut-plan-footer').boundingBox();
  expect(last.y+last.height).toBeLessThanOrEqual(footer.y);
  expect(await page.locator('.rut-plan').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 }
 await page.setViewportSize({width:393,height:820});
 await page.screenshot({path:info.outputPath('planificar-sesiones.png'),animations:'disabled'});
 await page.locator('[data-rday="2026-11-03"]').click();
 const editor=page.locator('.rut-session-editor');
 await expect(editor).toBeVisible();
 for(const [width,height] of [[320,640],[393,820]]){
  await page.setViewportSize({width,height});
  const save=await page.locator('#rutHistorySave').boundingBox(),date=await page.locator('#rutHistoryDate').boundingBox();
  expect(save.y+save.height).toBeLessThanOrEqual(height);
  expect(date.y+date.height).toBeLessThan(save.y);
  expect(await editor.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 }
 await page.setViewportSize({width:393,height:820});
 await page.screenshot({path:info.outputPath('editar-sesion.png'),animations:'disabled'});
 await page.locator('#rutHistoryEditClose').click();
 await expect(page.locator('#rutPlanOv')).toBeVisible();
});
test('Planificación conjunta: borrador, cupo, una confirmación y altura estable',async({page},info)=>{
 await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));await setup(page);
 await page.evaluate(()=>openRutPlan(RUTINAS[0]));await expect(page.locator('#rutPlanSave')).toBeDisabled();
 const sheet=page.locator('.rut-plan');await expect(sheet).toBeVisible();
 const size=await sheet.boundingBox();
 await page.locator('[data-rday="2026-10-26"]').click();await page.locator('[data-rday="2026-10-28"]').click();
 await chooseTime(page,'#rutPlanTime','19:30');
 expect(await page.evaluate(()=>Object.keys(RUTINAS[0].flex.sessions))).toEqual([]);
 await expect(page.locator('#rutPlanSave')).toHaveText('Guardar 2 sesiones');
 expect((await sheet.boundingBox()).height).toBeCloseTo(size.height,2);
 await page.screenshot({path:info.outputPath('planificacion-multiple.png'),animations:'disabled'});
 await page.locator('#rutPlanSave').click();await expect(page.locator('.rut-plan-day.planned')).toHaveCount(2);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-rutinas-v1'))[0].flex.sessions['2026-10-28'].time)).toBe('19:30');
 await page.locator('[data-rday="2026-10-29"]').click();await page.locator('[data-rday="2026-10-30"]').click();
 await page.locator('#rutPlanSave').click();await expect(page.locator('#toast')).toContainText('cupo');
 expect(await page.evaluate(()=>Object.keys(RUTINAS[0].flex.sessions).length)).toBe(2);
 await page.locator('[data-rmonth="1"]').click();expect((await sheet.boundingBox()).height).toBeCloseTo(size.height,2);
 await expect(page.locator('.rut-plan-grid')).toHaveCSS('grid-template-rows',/44px 44px 44px 44px 44px 44px$/);
 await page.locator('#rutPlanClose').click();await page.evaluate(()=>openRutPlan(RUTINAS[0]));
 await expect(page.locator('#rutPlanSave')).toBeDisabled();
});
test('Clase fija: Editar conserva los horarios de las demás semanas',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));await setup(page);
 await page.evaluate(()=>{var r=RUTINAS[0];delete r.flex;r.weekDays=[1];saveRutinas();refreshEvents();openEvDayCarousel('2026-10-26');});
 await page.locator('#evDRutEdit').click();await expect(page.locator('#rutHistoryDate')).toHaveCount(0);
 await chooseTime(page,'#rutHistoryTime','20:00');await page.locator('#rutHistorySave').click();
 expect(await page.evaluate(()=>[rutOccursOn(RUTINAS[0],'2026-10-26'),rutOccursOn(RUTINAS[0],'2026-11-02'),RUTINAS[0].time])).toEqual(['20:00','18:00','18:00']);
});
test('Calendario: Editar cambia una clase, conserva el resto y permite cancelar el borrador',async({page},info)=>{
 await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));await setup(page);
 await page.evaluate(()=>{RUTINAS[0].flex.sessions={'2026-10-26':{time:'18:00',dur:60},'2026-10-28':{time:'19:00',dur:60}};saveRutinas();refreshEvents();openEvDayCarousel('2026-10-26');});
 await page.locator('#evDRutEdit').click();await expect(page.locator('#rutHistoryEditOv')).toBeVisible();await expect(page.locator('#rutFormOv')).toHaveCount(0);
 await page.locator('#rutHistoryDate').fill('2026-10-27');await chooseTime(page,'#rutHistoryTime','20:00');
 await page.locator('#rutHistoryEditClose').click();expect(await page.evaluate(()=>RUTINAS[0].flex.sessions['2026-10-26'].time)).toBe('18:00');
 await page.evaluate(()=>openEvDayCarousel('2026-10-26'));await page.locator('#evDRutEdit').click();
 await page.locator('#rutHistoryDate').fill('2026-10-27');await chooseTime(page,'#rutHistoryTime','20:00');
 await page.screenshot({path:info.outputPath('editar-clase.png'),animations:'disabled'});
 await page.locator('#rutHistorySave').click();await expect(page.locator('#rutHistoryOv')).toHaveCount(0);
 expect(await page.evaluate(()=>RUTINAS[0].flex.sessions)).toEqual({'2026-10-27':{time:'20:00',dur:60},'2026-10-28':{time:'19:00',dur:60}});
 await page.reload();expect(await page.evaluate(()=>RUTINAS[0].flex.sessions['2026-10-27'].time)).toBe('20:00');
});
test('Hoy se actualiza al volver otro día sin recargar ni perder un formulario abierto',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));await setup(page);
 await expect(page.locator('.ev-cell.today-ev')).toHaveAttribute('data-ds','2026-10-24');
 await page.evaluate(()=>openEvForm(null,'2026-10-28'));await page.locator('#evFTitle').fill('Borrador conservado');
 await page.clock.setFixedTime(new Date('2026-10-25T12:00:00+01:00'));
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 await expect(page.locator('.ev-cell.today-ev')).toHaveAttribute('data-ds','2026-10-25');await expect(page.locator('#evFTitle')).toHaveValue('Borrador conservado');
 expect(await page.locator('.ev-current-weekday').textContent()).toBe('D');
 await page.evaluate(()=>{EV_MONTH=7;refreshEvents();});
 await page.clock.setFixedTime(new Date('2026-10-26T12:00:00+01:00'));await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
 expect(await page.evaluate(()=>EV_MONTH)).toBe(7);await expect(page.locator('.ev-cell.today-ev')).toHaveCount(0);
});
test('Hoy se actualiza también al cruzar medianoche con el calendario visible',async({page})=>{
 await page.clock.install({time:new Date('2026-10-24T23:59:55+02:00')});await setup(page);
 await expect(page.locator('.ev-cell.today-ev')).toHaveAttribute('data-ds','2026-10-24');
 await page.clock.runFor(6100);await expect(page.locator('.ev-cell.today-ev')).toHaveAttribute('data-ds','2026-10-25');
});
