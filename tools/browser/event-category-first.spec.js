const {test,expect}=require('@playwright/test');
const {chooseTime}=require('./time-picker-helper');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
 await page.locator('#eventsBtn').click();await page.evaluate(()=>{EVENTS=[];RUTINAS=[];EV_VIEW='upcoming';refreshEvents(false);});await page.locator('#evAdd').click();
});
for(const width of [320,400,440])test('Alta por categoría y edición conservada, con guardado y cancelación '+width,async({page},info)=>{
 await page.setViewportSize({width,height:880});await page.waitForTimeout(350);
 await expect(page.locator('.ev-kind-picker')).toBeInViewport();await expect(page.locator('#evFTypePicker [data-type="Rec. Gestiones"]')).toBeInViewport();
 const order=await page.evaluate(()=>!!(document.querySelector('#evFTypePicker').compareDocumentPosition(document.querySelector('.ev-form-lead'))&Node.DOCUMENT_POSITION_FOLLOWING));expect(order).toBe(true);
 const sheet=await page.locator('.ev-event-form-sheet').boundingBox(),footer=await page.locator('#evFSave').boundingBox();
 await page.screenshot({path:info.outputPath('categoria-primero-'+width+'.png'),animations:'disabled'});
 await page.locator('.ev-kind-btn[data-kind="grande"]').click();await page.locator('#evFTypePicker [data-type="Asturias"]').click();await expect(page.locator('#evFTitle')).toHaveValue('Asturias');
 await page.locator('#evFTitle').fill('Viaje elegido por categoría');await page.locator('#evFNote').fill('Nota conservada');await page.locator('#evFStart').fill('2026-08-22');await page.locator('#evFEnd').fill('2026-08-23');
 await chooseTime(page,'#evFTime','14:30');await chooseTime(page,'#evFEndTime','16:00');
 expect(await page.locator('.ev-event-form-sheet').boundingBox()).toEqual(sheet);expect(await page.locator('#evFSave').boundingBox()).toEqual(footer);
 await page.screenshot({path:info.outputPath('datos-al-final-'+width+'.png'),animations:'disabled'});
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);await page.reload();
 const saved=await page.evaluate(()=>EVENTS.find(ev=>ev.title==='Viaje elegido por categoría'));expect(saved).toMatchObject({kind:'grande',type:'Asturias',note:'Nota conservada',start:'2026-08-22',end:'2026-08-23',time:'14:30',endTime:'16:00'});
 await page.evaluate(()=>{openEvents();openEvForm(EVENTS.find(ev=>ev.title==='Viaje elegido por categoría'));});
 expect(await page.evaluate(()=>!!(document.querySelector('.ev-form-lead').compareDocumentPosition(document.querySelector('#evFTypePicker'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
 await page.locator('#evFNote').fill('Cancelar este cambio');await page.locator('#evFClose').click();await expect(page.locator('#evFWrap')).toHaveCount(0);expect(await page.evaluate(()=>EVENTS.find(ev=>ev.title==='Viaje elegido por categoría').note)).toBe('Nota conservada');
});
