const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-11T12:00:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
});
test('cumpleaños: dos nombres, contador y listado completo sin escrituras',async({page})=>{
 await page.evaluate(()=>{BDAYS=[{name:'Persona De Nombre Largo',day:11,month:10,vip:true},{name:'Elsa Pruebas',day:11,month:10},{name:'Tercera Persona',day:11,month:10}];BDAY_YEAR=2026;BDAY_MONTH=9;BDAY_VIEW='cal';EV_VIEW='bday';refreshEvents();});
 const before=await page.evaluate(()=>JSON.stringify(localStorage));
 const day=page.locator('.bday-cell[data-cal-day="11"]');await expect(day.locator('.bday-badge')).toHaveCount(2);
 await expect(day.locator('.bday-badge-name').first()).toHaveCSS('white-space','nowrap');
 await day.locator('.bday-day-more').click();await expect(page.locator('#bdDayOv')).toBeVisible();
 await expect(page.locator('.bday-day-person')).toHaveCount(3);await expect(page.locator('#bdDayOv')).toContainText('Tercera Persona');
 await page.locator('[data-day-person="2"]').click();await expect(page.locator('#bdDetailOv')).toContainText('Tercera Persona');
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(before);
});
for(const width of [320,400,440])test(`formularios: pies fijos y borradores cancelables ${width}`,async({page})=>{
 await page.setViewportSize({width,height:880});
 for(const module of ['couple','routine']){
  const before=await page.evaluate(()=>JSON.stringify(localStorage));
  await page.evaluate(module=>module==='couple'?openBodaCoupleForm(null):openRutForm(null),module);
  const prefix=module==='couple'?'bodaC':'rutF',sheet=page.locator('.ev-fixed-form-sheet'),footer=sheet.locator('footer');
  await expect(page.locator('#'+prefix+'Save')).toBeInViewport();await page.locator('#'+prefix+'Save').click({trial:true});
  await sheet.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));const box=await sheet.boundingBox(),foot=await footer.boundingBox();
  await page.locator('#'+prefix+'Name').fill('Borrador sin guardar');
  await sheet.locator('.ev-fixed-form-body').evaluate(el=>el.scrollTop=el.scrollHeight);
  await expect(page.locator('#'+prefix+'Save')).toBeInViewport();expect(await footer.boundingBox()).toEqual(foot);expect(await sheet.boundingBox()).toEqual(box);
  await page.locator('#'+prefix+'Cancel').click();await expect(sheet).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(before);
 }
});
test('Ajustes: nombres de consulta y edición explícita sin guardar al entrar',async({page})=>{
 const before=await page.evaluate(()=>JSON.stringify(localStorage));await page.locator('#eventsOverlay [data-nav="menu"]').click();
 await expect(page.locator('#editConnectionsBtn')).toHaveText('Correo de horas');await expect(page.locator('#editMacroBtn')).toHaveText('MacroDroid');await expect(page.locator('#invoiceSettingsBtn')).toHaveText('Facturas y correo');
 await page.locator('#editMacroBtn').click();await expect(page.locator('#connectionsOv')).toBeVisible();
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(before);
});
