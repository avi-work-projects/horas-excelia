const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const {exportFile}=require('./export-helper');
test.use({viewport:{width:400,height:880},isMobile:true,hasTouch:true});
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date(2026,9,11,12));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
 await page.evaluate(()=>{const c=invoiceDefaults();Object.assign(c,{issuer:'Persona de prueba',issuerTax:'PRUEBA-EMISOR',issuerAddress:'Dirección de prueba',iban:'ES'+String(98n-(BigInt('142800')%97n)).padStart(2,'0')+'00000000000000000000',client:'Cliente de prueba',clientTax:'PRUEBA-CLIENTE',clientAddress:'Dirección cliente',project:'Consultoría de prueba',rate:'320',from:'demo@example.test',to:'Cliente <cliente@example.test>'});invoiceSave({config:c,months:{}});});
});
test('preparación mensual, XLSX válido, Gmail solo con definitivo y recuperación tras recarga',async({page},info)=>{
 await page.screenshot({path:info.outputPath('home.png')});await page.locator('#invoiceHomeBtn').click();await expect(page.locator('.invoice-status')).toHaveText('Pendiente de emitir en AEAT');await expect(page.locator('#invoiceGmail')).toHaveCount(0);
 await expect(page.locator('#invoiceExcel')).toBeVisible();await expect(page.locator('[data-invoice-day]')).toHaveCount(0);await expect(page.locator('#invoiceReloadDays')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('preparacion.png')});
 const first=await page.evaluate(()=>invoiceData().months['2026-10'].preparation);expect(first.days.length).toBe(22);expect(first.baseCents).toBe(704000);expect(first.payment.iban).toMatch(/^ES[0-9]{22}$/);
 await page.locator('#invoiceBack').click();await page.locator('#invoiceHomeBtn').click();await expect(page.locator('#invoiceExcel')).toBeVisible();expect(await page.evaluate(()=>invoiceData().months['2026-10'].preparation.revision)).toBe(1);
 const dl=page.waitForEvent('download');await page.locator('#invoiceExcel').click();await page.locator('[data-export-mode="save"]').click();const excel=await dl;await excel.saveAs(info.outputPath('auxiliar.xlsx'));expect(fs.readFileSync(info.outputPath('auxiliar.xlsx')).subarray(0,2).toString()).toBe('PK');expect(fs.readFileSync(info.outputPath('auxiliar.xlsx')).includes(Buffer.from(first.payment.iban))).toBe(true);
 await page.locator('#invoiceDocument summary').click();
 const invalid=Buffer.from('%PDF-1.4\nprueba');await page.locator('#invoiceFinalFile').setInputFiles({name:'borrador.pdf',mimeType:'application/pdf',buffer:invalid});await page.locator('[data-invoice-field="number"]').fill('PRUEBA-1');await page.locator('[data-invoice-field="date"]').fill('2026-10-11');await page.locator('#invoiceFinalConfirm').check();await page.locator('#invoiceAttach').click();await expect(page.locator('#invoiceError')).toContainText('no un borrador');await expect(page.locator('#invoiceGmail')).toHaveCount(0);
 const pdf=await page.evaluate(()=>{const d=new jspdf.jsPDF();d.text('DOCUMENTO SINTETICO PARA PRUEBAS DE SOFTWARE',10,20);return d.output('datauristring').split(',')[1];});await page.locator('#invoiceFinalFile').setInputFiles({name:'documento-prueba.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf,'base64')});await page.locator('#invoiceAttach').click();await expect(page.locator('#invoiceGmail')).toHaveCount(1);
 await page.evaluate(()=>{window.gmailCalls=[];window.open=url=>gmailCalls.push(url);});await page.locator('#invoiceGmail').click();expect(await page.evaluate(()=>gmailCalls[0])).toContain('view=cm');expect(await page.evaluate(()=>invoiceData().months['2026-10'].sent)).toBeUndefined();await page.screenshot({path:info.outputPath('correo.png')});
 await page.reload();await page.locator('#invoiceHomeBtn').click();await expect(page.locator('.invoice-status')).toHaveText('PDF definitivo de AEAT incorporado');await expect(page.locator('#invoicePrepare')).toHaveCount(0);
 const finalDownload=page.waitForEvent('download');await page.locator('#invoiceDownloadFinal').click();await page.locator('[data-export-mode="save"]').click();const file=await finalDownload;await file.saveAs(info.outputPath('definitivo-prueba.pdf'));expect(fs.readFileSync(info.outputPath('definitivo-prueba.pdf'))).toEqual(Buffer.from(pdf,'base64'));
 await page.locator('#invoicePrev').click();await expect(page.locator('.invoice-status')).toContainText('histórica');await expect(page.locator('#invoiceFinalFile')).toHaveCount(0);await expect(page.locator('#invoiceGmail')).toHaveCount(0);
});
test('configuración sin datos privados publicados y diseño móvil estrecho',async({page},info)=>{
 await page.evaluate(()=>invoiceSave({config:invoiceDefaults(),months:{}}));await page.evaluate(()=>openInvoiceSettings());await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue('');await expect(page.locator('[data-invoice-field="iban"]')).toBeVisible();await page.locator('[data-invoice-field="issuer"]').fill('Persona ejemplo');await page.locator('#invoiceSaveSettings').click();await expect(page.locator('#invoiceTitle')).toHaveText('Enviar factura');await page.locator('#invoiceConfig').click();await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue('Persona ejemplo');
 await page.screenshot({path:info.outputPath('configuracion.png')});await page.setViewportSize({width:360,height:800});expect(await page.locator('#invoiceOv').evaluate(el=>el.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('configuracion-360.png')});
});
test('PDF: duplicados entre meses, backup completo, importación y falta de espacio',async({page})=>{
 const result=await page.evaluate(async()=>{
  const data=invoiceData(),c=data.config;
  await invoicePrepare('2026-10',c,invoiceDayRows('2026-10',c));
  const doc=new jspdf.jsPDF();doc.text('SOLO PRUEBA AUTOMATICA',10,20);const file=new File([doc.output('blob')],'documento-prueba.pdf',{type:'application/pdf'});
  await invoiceAttach('2026-10',file,'TEST-2','2026-10-11',true);const saved=invoiceData();
  await invoicePrepare('2026-11',c,invoiceDayRows('2026-11',c));let duplicate='';try{await invoiceAttach('2026-11',file,'TEST-3','2026-11-20',true);}catch(e){duplicate=e.message;}
  const raw=appStorage.getItem(INVOICE_KEY);const backup={invoices:invoiceData()};invoiceSave({config:invoiceDefaults(),months:{}});applyFullImport(backup,'replace');const restored=appStorage.getItem(INVOICE_KEY)===raw;
  const put=appStorage.setItem;appStorage.setItem=()=>{throw new Error('Sin espacio');};let quota='';try{await invoiceAttach('2026-11',new File([new Blob(['%PDF-1.4\nother'])],'otro.pdf',{type:'application/pdf'}),'TEST-4','2026-11-20',true);}catch(e){quota=e.message;}finally{appStorage.setItem=put;}
  return {duplicate,restored,quota,unchanged:appStorage.getItem(INVOICE_KEY)===raw,hash:saved.months['2026-10'].final.hash};
 });expect(result.duplicate).toContain('ya está asociado');expect(result.restored).toBe(true);expect(result.quota).toBe('Sin espacio');expect(result.unchanged).toBe(true);expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
 await page.locator('#menuBtn').click();const pending=page.waitForEvent('download');await exportFile(page,'#exportAllBtn');const download=await pending;const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));expect(backup.invoices.months['2026-10'].final.hash).toBe(result.hash);
 await page.evaluate(data=>{invoiceSave({config:invoiceDefaults(),months:{}});applyFullImport(data,'replace');},backup);expect(await page.evaluate(()=>invoiceData().months['2026-10'].final.hash)).toBe(result.hash);
});

test('importar configuración revisable sin sustituir los meses y botones junto a Jornada',async({page},info)=>{
 for(const width of [360,400]){
  await page.setViewportSize({width,height:880});const row=page.locator('#editHoursBtn');const r=await row.boundingBox();
  for(const id of ['#hoursExportBtn','#invoiceHomeBtn']){const b=await page.locator(id).boundingBox();expect(b.x).toBeGreaterThan(r.x+r.width);expect(Math.abs(b.y-r.y)).toBeLessThan(1);}
  await page.screenshot({path:info.outputPath('home-'+width+'.png')});
 }
 await page.locator('#invoiceHomeBtn').click();await expect(page.locator('#invoiceExcel')).toBeVisible();const months=await page.evaluate(()=>JSON.stringify(invoiceData().months));
 await page.locator('#invoiceConfig').click();
 const payload={format:'gestify-invoice-settings',version:1,config:{issuer:'Nuevo emisor de prueba',issuerTax:'NIF-PRUEBA',issuerAddress:'Domicilio inventado'}};
 await page.locator('#invoiceConfigFile').setInputFiles({name:'datos-facturacion.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
 await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue(payload.config.issuer);await expect(page.locator('#invoiceImportStatus')).toContainText('Datos cargados');
 expect(await page.evaluate(()=>invoiceData().config.issuer)).toBe('Persona de prueba');expect(await page.evaluate(()=>JSON.stringify(invoiceData().months))).toBe(months);
 await page.locator('#invoiceConfigFile').setInputFiles({name:'incorrecto.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'gestify-invoice-settings',version:1,config:{vat:'101'}}))});await expect(page.locator('#invoiceError')).toContainText('Porcentaje');await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue(payload.config.issuer);
 await page.locator('#invoiceSaveSettings').click();await expect(page.locator('#invoiceExcel')).toBeVisible();expect(await page.evaluate(()=>invoiceData().config.issuer)).toBe(payload.config.issuer);
 await page.screenshot({path:info.outputPath('resumen.png')});
 await page.locator('#invoiceDocument summary').click();await expect(page.locator('#invoiceFinalFile')).toBeVisible();await page.screenshot({path:info.outputPath('siguiente-paso.png')});
});
