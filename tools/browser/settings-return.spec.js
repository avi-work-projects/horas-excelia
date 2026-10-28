const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
});
const entries=[['#editConnectionsBtn','#connectionsOv','#connectionsClose'],['#editMacroBtn','#connectionsOv','#connectionsClose'],['#invoiceSettingsBtn','#invoiceOv','#invoiceBack'],['#exportFolderBtn','#exportFolderOv','#exportFolderClose'],['#personalDataBtn','#personalDataOv','#personalDataClose'],['#personalNotesBtn','#personalNotesOv','#personalNotesClose']];
for(const context of ['home','events'])test('Atrás restaura Ajustes y su origen desde '+context,async({page})=>{
  await page.setViewportSize({width:400,height:700});
  if(context==='events')await page.locator('#eventsBtn').click();
  const anchor=page.locator(context==='events'?'#eventsOverlay [data-nav=menu]':'#menuBtn');
  const menu=page.locator('#dataMenu');
  for(const [i,[entry,overlay,back]]of entries.entries()){
    await anchor.click();await menu.locator(entry).scrollIntoViewIfNeeded();const scroll=await menu.evaluate(el=>el.scrollTop);
    await menu.locator(entry).click();await expect(page.locator(overlay)).toHaveClass(/open/);await expect(menu).not.toHaveClass(/open/);
    if(i%2)await page.evaluate(()=>NAV_BACK());else await page.locator(back).click();
    await expect(menu).toHaveClass(/open/);await expect(anchor).toHaveAttribute('aria-expanded','true');expect(Math.abs(await menu.evaluate(el=>el.scrollTop)-scroll)).toBeLessThan(2);
    if(context==='events')await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
    await page.evaluate(()=>NAV_BACK());await expect(menu).not.toHaveClass(/open/);
    if(context==='events')await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);else expect(await page.evaluate(()=>NAV_BACK)).toBeNull();
  }
});
test('El acceso directo y la reapertura durante el cierre vuelven a Home',async({page})=>{
  await page.locator('#menuBtn').click();await page.locator('#invoiceSettingsBtn').click();await page.locator('#invoiceBack').click();await expect(page.locator('#dataMenu')).toHaveClass(/open/);
  await page.evaluate(()=>{NAV_BACK();openHoursExport();});await page.locator('#invoiceBack').click();await expect(page.locator('#dataMenu')).not.toHaveClass(/open/);expect(await page.evaluate(()=>NAV_BACK)).toBeNull();
  await page.evaluate(()=>openConnectionsSettings('mail'));await page.locator('#connectionsClose').click();await expect(page.locator('#dataMenu')).not.toHaveClass(/open/);expect(await page.evaluate(()=>NAV_BACK)).toBeNull();
});
