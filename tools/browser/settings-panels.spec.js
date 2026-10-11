const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
});
test('conexiones: consulta, cancelar, guardar y geometría estable en móvil',async({page},info)=>{
 await page.locator('#menuBtn').click();await expect(page.locator('#dataMenu details')).toHaveCount(0);await page.screenshot({path:info.outputPath('menu.png')});
 await page.locator('#editConnectionsBtn').click();await expect(page.locator('#mailToLocal')).toHaveAttribute('readonly','');
 const sheet=page.locator('#connectionsOv .settings-editor-sheet');await expect(sheet).toBeVisible();const before=await sheet.boundingBox();
 await page.locator('#connectionsEdit').click();expect((await sheet.boundingBox()).height).toBe(before.height);
 await page.locator('#mailToLocal').fill('cancel@example.invalid');await page.locator('#connectionsCancel').click();await expect(page.locator('#mailToLocal')).not.toHaveValue('cancel@example.invalid');expect(await page.evaluate(()=>localStorage.getItem('excelia-mail-config-v1'))).toBeNull();
 await page.locator('#connectionsEdit').click();await page.locator('#mailToLocal').fill('saved@example.invalid');await page.locator('#mailCcLocal').fill('copy@example.invalid');await page.locator('#connectionsSave').click();await expect(page.locator('#connectionsEdit')).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-mail-config-v1')).to)).toBe('saved@example.invalid');
 for(const width of [320,400]){await page.setViewportSize({width,height:880});const g=await sheet.evaluate(e=>{const a=e.getBoundingClientRect(),b=e.querySelector('h2').getBoundingClientRect();return {center:Math.abs(a.x+a.width/2-b.x-b.width/2),overflow:e.scrollWidth-e.clientWidth};});expect(g.center).toBeLessThan(1);expect(g.overflow).toBeLessThanOrEqual(1);await page.screenshot({path:info.outputPath('correo-'+width+'.png')});}
});
test('facturación: cancelar conserva datos, porcentaje inválido no se guarda y consulta tras guardar',async({page},info)=>{
 await page.locator('#menuBtn').click();await page.locator('#invoiceSettingsBtn').click();const name=page.locator('[data-invoice-field=issuer]');await expect(name).toHaveAttribute('readonly','');await expect(page.locator('#invoiceImportConfig')).toBeHidden();
 await page.locator('#invoiceSettingsEdit').click();await name.fill('Borrador');await page.locator('#invoiceSettingsCancel').click();await expect(name).not.toHaveValue('Borrador');
 await page.locator('#invoiceSettingsEdit').click();await name.fill('Empresa de prueba');await page.locator('summary').filter({hasText:'Cálculo'}).click();await page.locator('[data-invoice-field=vat]').fill('101');await page.locator('#invoiceSettingsSave').click();await expect(page.locator('#invoiceError')).toContainText('Porcentaje');expect(await page.evaluate(()=>invoiceData().config.issuer)).not.toBe('Empresa de prueba');
 await page.locator('[data-invoice-field=vat]').fill('21');await page.locator('#invoiceSettingsSave').click();await expect(name).toHaveAttribute('readonly','');expect(await page.evaluate(()=>invoiceData().config.issuer)).toBe('Empresa de prueba');await page.screenshot({path:info.outputPath('facturas.png')});
});
test('ruta: seleccionar es provisional, cancelar revierte y fallo de guardado conserva destino',async({page},info)=>{
 await page.evaluate(async()=>{await EXPORT_DIRECTORY_READY;EXPORT_DIRECTORY={name:'Anterior'};EXPORT_DIRECTORY_LABEL='Anterior';window.showDirectoryPicker=async()=>({name:'Nueva'});window.failSave=false;exportDirectoryStore=async()=>{if(failSave)throw new Error('Fallo simulado');};});
 await page.locator('#menuBtn').click();await page.locator('#exportFolderBtn').click();await expect(page.locator('#exportFolderChoose')).toBeHidden();
 await page.locator('#exportFolderEdit').click();await page.locator('#exportFolderChoose').click();expect(await page.evaluate(()=>EXPORT_DIRECTORY.name)).toBe('Anterior');await page.locator('#exportFolderCancel').click();await expect(page.locator('#exportFolderStatus')).toHaveText('Carpeta: Anterior');
 await page.locator('#exportFolderEdit').click();await page.locator('#exportFolderChoose').click();await page.locator('#exportFolderLabel').fill('Mi carpeta');await page.evaluate(()=>failSave=true);await page.locator('#exportFolderSave').click();await expect(page.locator('#toast')).toContainText('Fallo simulado');expect(await page.evaluate(()=>EXPORT_DIRECTORY.name)).toBe('Anterior');await expect(page.locator('#exportFolderSave')).toBeVisible();
 await page.evaluate(()=>failSave=false);await page.locator('#exportFolderSave').click();await expect(page.locator('#exportFolderEdit')).toBeVisible();expect(await page.evaluate(()=>EXPORT_DIRECTORY.name)).toBe('Nueva');await expect(page.locator('#exportFolderStatus')).toHaveText('Carpeta: Mi carpeta');await page.screenshot({path:info.outputPath('ruta.png')});
});
