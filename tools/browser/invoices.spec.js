const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const {verifyInvoiceExport}=require('../verify-invoice-export');
const {exportFile}=require('./export-helper');
test.use({viewport:{width:400,height:880},isMobile:true,hasTouch:true});
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date(2026,9,11,12));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
 await page.evaluate(()=>{const c=invoiceDefaults();Object.assign(c,{issuer:'Persona de prueba',issuerTax:'PRUEBA-EMISOR',issuerAddress:'Dirección de prueba',iban:'ES'+String(98n-(BigInt('142800')%97n)).padStart(2,'0')+'00000000000000000000',client:'Cliente de prueba',clientTax:'PRUEBA-CLIENTE',clientAddress:'Dirección cliente',project:'Consultoría de prueba',rate:'320',from:'demo@example.test',to:'Cliente <cliente@example.test>'});invoiceSave({config:c,months:{}});});
});
test('preparación mensual sin opciones auxiliares, Gmail solo con definitivo y recuperación tras recarga',async({page},info)=>{
 await page.screenshot({path:info.outputPath('home.png')});await page.locator('#invoiceHomeBtn').click();await expect(page.locator('.invoice-status')).toHaveCount(0);await expect(page.locator('#invoiceGmail')).toHaveCount(0);
 await expect(page.locator('#invoiceJson,#invoiceConfig')).toHaveCount(0);await expect(page.locator('#invoiceExcel')).toHaveCount(0);await expect(page.locator('[data-invoice-day]')).toHaveCount(0);await expect(page.locator('#invoiceReloadDays')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('preparacion.png')});
 const first=await page.evaluate(()=>invoiceData().months['2026-10'].preparation);expect(first.days.length).toBe(22);expect(first.baseCents).toBe(704000);expect(first.payment.iban).toMatch(/^ES[0-9]{22}$/);expect(verifyInvoiceExport(first)).toEqual({operationIdMatches:true,contentHashMatches:true});expect(verifyInvoiceExport({...first,baseCents:first.baseCents+1}).contentHashMatches).toBe(false);expect(verifyInvoiceExport({...first,appVersion:'otra',revision:99,preparedAt:'otra'}).contentHashMatches).toBe(true);
 await page.locator('#invoiceBack').click();await page.locator('#invoiceHomeBtn').click();await expect(page.locator('#invoiceJson,#invoiceConfig')).toHaveCount(0);await expect(page.locator('#invoiceExcel')).toHaveCount(0);expect(await page.evaluate(()=>invoiceData().months['2026-10'].preparation.revision)).toBe(1);
 await page.locator('#invoiceDocument summary').click();
 const invalid=Buffer.from('%PDF-1.4\nprueba');await page.locator('#invoiceFinalFile').setInputFiles({name:'borrador.pdf',mimeType:'application/pdf',buffer:invalid});await page.locator('[data-invoice-field="number"]').fill('PRUEBA-1');await page.locator('[data-invoice-field="date"]').fill('2026-10-11');await page.locator('#invoiceFinalConfirm').check();await page.locator('#invoiceAttach').click();await expect(page.locator('#invoiceError')).toContainText('no un borrador');await expect(page.locator('#invoiceGmail')).toHaveCount(0);
 const pdf=await page.evaluate(()=>{const d=new jspdf.jsPDF();d.text('DOCUMENTO SINTETICO PARA PRUEBAS DE SOFTWARE',10,20);return d.output('datauristring').split(',')[1];});await page.locator('#invoiceFinalFile').setInputFiles({name:'documento-prueba.pdf',mimeType:'application/pdf',buffer:Buffer.from(pdf,'base64')});await page.locator('#invoiceAttach').click();await expect(page.locator('#invoiceGmail')).toHaveCount(1);
 await page.evaluate(()=>{window.gmailCalls=[];window.open=url=>gmailCalls.push(url);});await page.locator('#invoiceGmail').click();expect(await page.evaluate(()=>gmailCalls[0])).toContain('view=cm');expect(await page.evaluate(()=>invoiceData().months['2026-10'].sent)).toBeUndefined();await page.screenshot({path:info.outputPath('correo.png')});
 await page.reload();await page.locator('#invoiceHomeBtn').click();await expect(page.locator('.invoice-status')).toHaveText('PDF definitivo de AEAT incorporado');await expect(page.locator('#invoicePrepare')).toHaveCount(0);
 await page.locator('.invoice-mail-preview summary').click();const finalDownload=page.waitForEvent('download');await page.locator('#invoiceDownloadFinal').click();await page.locator('[data-export-mode="save"]').click();const file=await finalDownload;await file.saveAs(info.outputPath('definitivo-prueba.pdf'));expect(fs.readFileSync(info.outputPath('definitivo-prueba.pdf'))).toEqual(Buffer.from(pdf,'base64'));
 await page.locator('#invoiceBack').click();await page.locator('#prevBtn').click();await page.locator('#invoiceHomeBtn').click();await expect(page.locator('.invoice-status')).toContainText('histórica');await expect(page.locator('#invoiceFinalFile')).toHaveCount(0);await expect(page.locator('#invoiceGmail')).toHaveCount(0);
});
test('configuración sin datos privados publicados y diseño móvil estrecho',async({page},info)=>{
 await page.evaluate(()=>invoiceSave({config:invoiceDefaults(),months:{}}));await page.evaluate(()=>openInvoiceSettings());await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue('');await expect(page.locator('[data-invoice-field="iban"]')).toBeVisible();await page.locator('#invoiceSettingsEdit').click();await page.locator('[data-invoice-field="issuer"]').fill('Persona ejemplo');await page.locator('#invoiceSettingsSave').click();await expect(page.locator('#invoiceTitle')).toHaveText('Facturas y Correo');await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue('Persona ejemplo');
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
 await page.locator('#invoiceHomeBtn').click();await expect(page.locator('#invoiceJson,#invoiceConfig')).toHaveCount(0);await expect(page.locator('#invoiceExcel')).toHaveCount(0);const months=await page.evaluate(()=>JSON.stringify(invoiceData().months));
 await page.locator('#invoiceBack').click();await page.locator('#menuBtn').click();await page.locator('#invoiceSettingsBtn').click();await page.locator('#invoiceSettingsEdit').click();
 const payload={format:'gestify-invoice-settings',version:1,config:{issuer:'Nuevo emisor de prueba',issuerTax:'NIF-PRUEBA',issuerAddress:'Domicilio inventado'}};
 await page.locator('#invoiceConfigFile').setInputFiles({name:'datos-facturacion.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
 await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue(payload.config.issuer);await expect(page.locator('#invoiceImportStatus')).toContainText('Datos cargados');
 expect(await page.evaluate(()=>invoiceData().config.issuer)).toBe('Persona de prueba');expect(await page.evaluate(()=>JSON.stringify(invoiceData().months))).toBe(months);
 await page.locator('#invoiceConfigFile').setInputFiles({name:'incorrecto.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'gestify-invoice-settings',version:1,config:{vat:'101'}}))});await expect(page.locator('#invoiceError')).toContainText('Porcentaje');await expect(page.locator('[data-invoice-field="issuer"]')).toHaveValue(payload.config.issuer);
 await page.locator('#invoiceSettingsSave').click();await expect(page.locator('#invoiceSettingsEdit')).toBeVisible();await page.locator('#invoiceBack').click();await expect(page.locator('#invoiceWrap')).toHaveCount(0);await page.locator('#menuBtn').click();await page.locator('#invoiceHomeBtn').click();await expect(page.locator('#invoiceJson,#invoiceConfig')).toHaveCount(0);await expect(page.locator('#invoiceExcel')).toHaveCount(0);expect(await page.evaluate(()=>invoiceData().config.issuer)).toBe(payload.config.issuer);
 await page.screenshot({path:info.outputPath('resumen.png')});
 await page.locator('#invoiceDocument summary').click();await expect(page.locator('#invoiceFinalFile')).toBeVisible();await page.screenshot({path:info.outputPath('siguiente-paso.png')});
});

test('mes de Home, título centrado, tarifa diaria y ojo sin alterar el cálculo',async({page},info)=>{
 await page.evaluate(()=>{CY=2027;CM=4;render();});await page.locator('#invoiceHomeBtn').click();
 await expect(page.locator('#invoicePeriod')).toContainText('Mayo 2027');await expect(page.locator('#invoicePrev,#invoiceNext')).toHaveCount(0);
 await expect(page.locator('#invoiceAmounts')).toContainText('Precio por día');await expect(page.locator('#invoiceAmounts')).not.toContainText('€');await expect(page.locator('#invoiceAmounts')).not.toContainText('320,00');await page.getByRole('button',{name:'Mostrar importes',exact:true}).click();await expect(page.locator('#invoiceAmounts')).toContainText('320,00');
 const stored=await page.evaluate(()=>JSON.stringify(invoiceData().months['2027-05']));
 for(const width of [360,400]){
  await page.setViewportSize({width,height:880});const title=await page.locator('#invoiceTitle').boundingBox(),sheet=await page.locator('.invoice-sheet').boundingBox();
  expect(Math.abs(title.x+title.width/2-sheet.x-sheet.width/2)).toBeLessThan(1);
 }
 await page.screenshot({path:info.outputPath('resumen-visible.png'),animations:'disabled'});
 const before=await page.locator('#invoiceAmounts').boundingBox();await page.getByRole('button',{name:'Ocultar importes',exact:true}).click();
 await expect(page.locator('#invoiceAmounts')).not.toContainText('€');await expect(page.locator('#invoiceAmounts')).not.toContainText('320,00');
 expect((await page.locator('#invoiceAmounts').boundingBox()).height).toBe(before.height);
 expect(await page.evaluate(()=>JSON.stringify(invoiceData().months['2027-05']))).toBe(stored);
 await page.screenshot({path:info.outputPath('resumen-oculto.png'),animations:'disabled'});
 await page.getByRole('button',{name:'Mostrar importes',exact:true}).click();await expect(page.locator('#invoiceAmounts')).toContainText('320,00');
 await page.locator('#invoiceBack').click();await page.locator('#invoiceHomeBtn').click();await expect(page.locator('#invoiceAmounts')).not.toContainText('€');await expect(page.getByRole('button',{name:'Mostrar importes',exact:true})).toBeVisible();await page.locator('#invoiceBack').click();await page.evaluate(()=>openEcon());await expect.poll(async()=>Math.round((await page.locator('#econOverlay').boundingBox()).y)).toBe(0);await page.locator('.econ-avg-card').filter({hasText:'IVA'}).first().scrollIntoViewIfNeeded();await expect(page.locator('#econOverlay')).not.toContainText('no toques');
 await page.screenshot({path:info.outputPath('resumen-economico.png'),animations:'disabled'});
});

test('Kairo sin configurar sigue visible y abre directamente su conexión editable',async({page},info)=>{
 await page.evaluate(()=>{invoiceSave({config:invoiceDefaults(),months:{}});window.invoiceExternalCalls=[];window.open=url=>invoiceExternalCalls.push(url);return openInvoiceMonth('2026-10');});
 await expect(page.locator('.invoice-kairo-locked')).toBeVisible();
 await expect(page.locator('.invoice-kairo-badge')).toHaveText('Sin configurar');
 await expect(page.locator('#invoiceKairoConfig')).toBeVisible();
 await expect(page.locator('#invoiceKairoSend,#invoiceKairoStatus,#invoiceGmail')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('kairo-sin-configurar.png'),animations:'disabled'});
 await page.locator('#invoiceKairoConfig').click();
 await expect(page.locator('#invoiceTitle')).toHaveText('Facturas y Correo');
 await expect(page.locator('#invoiceConnection')).toHaveAttribute('open','');
 await expect(page.locator('[data-invoice-field="kairoUrl"]')).toBeEditable();
 await expect(page.locator('[data-invoice-field="kairoUrl"]')).toBeFocused();
 await expect(page.locator('[data-invoice-field="kairoUrl"]')).toHaveValue('');
 expect(await page.evaluate(()=>invoiceExternalCalls)).toEqual([]);
 await page.locator('[data-invoice-field="kairoUrl"]').fill('https://synthetic-kairo.test.ts.net/facturas/');
 await page.locator('#invoiceSettingsSave').click();await expect(page.locator('#invoiceSettingsEdit')).toBeVisible();
 await page.locator('#invoiceBack').click();await page.locator('#invoiceHomeBtn').click();
 await expect(page.locator('#invoiceKairoSend')).toBeDisabled();await expect(page.locator('#invoiceKairoStatus')).toBeDisabled();
 await expect(page.locator('#invoiceKairoMessage')).toContainText('Completa los datos');
 await expect(page.locator('#invoiceAmounts')).toHaveCount(0);
 await expect(page.locator('.invoice-month-summary')).not.toContainText('€');
 expect(await page.evaluate(()=>invoiceExternalCalls)).toEqual([]);
});

test('desglose por tramos antes del envío, sin scroll inicial y sin Excel en móvil',async({page},info)=>{
 await page.evaluate(()=>{const data=invoiceData();data.config.rate='';data.config.kairoUrl='https://synthetic-kairo.test.ts.net/facturas/';invoiceSave(data);ECON_YEAR_CONFIG[2026]={rate:320,multiRate:true,ratePeriods:[{startDate:'2026-01-01',rate:320,rateMode:'daily'},{startDate:'2026-10-16',rate:340,rateMode:'daily'}]};return openInvoiceMonth('2026-10');});
 await expect(page.locator('#invoiceKairoSend')).toBeVisible();
 await expect(page.locator('#invoiceAmounts')).not.toContainText('€');
 await expect(page.locator('#invoiceExcel,#invoiceTools')).toHaveCount(0);await expect(page.locator('#invoiceJson')).toHaveCount(0);await expect(page.locator('#invoiceDays')).not.toHaveAttribute('open','');
 for(const width of [320,400,440]){
  await page.setViewportSize({width,height:880});
  await page.evaluate(()=>{document.querySelector('.invoice-month-summary').open=true;document.querySelector('.invoice-body').scrollTop=0;});
  const sheet=await page.locator('.invoice-sheet').boundingBox(),send=await page.locator('#invoiceKairoSend').boundingBox(),summary=await page.locator('.invoice-month-summary').boundingBox();
  expect(send.y).toBeGreaterThanOrEqual(summary.y+summary.height);expect(await page.locator('.invoice-body').evaluate(el=>el.scrollTop)).toBe(0);expect(send.y+send.height).toBeLessThan(sheet.y+sheet.height);
  expect(await page.locator('.invoice-sheet').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  const amounts=page.locator('#invoiceAmounts');const height=(await amounts.boundingBox()).height;
  await page.getByRole('button',{name:'Mostrar importes',exact:true}).click();
  await expect(page.locator('.invoice-line-formula')).toHaveCount(2);
  await expect(page.locator('.invoice-line-formula').first()).toContainText('11 días × 320,00');
  await expect(page.locator('.invoice-line-formula').last()).toContainText('11 días × 340,00');
  await expect(amounts).toContainText('IVA · 21 %');await expect(amounts).toContainText('IRPF · 15 %');
  await expect(page.locator('.invoice-total')).toContainText('7695,60');await expect(page.locator('.invoice-total')).toContainText('Base + IVA − IRPF');
  expect((await amounts.boundingBox()).height).toBe(height);
  await page.screenshot({path:info.outputPath('calculo-'+width+'.png'),animations:'disabled'});
  await page.getByRole('button',{name:'Ocultar importes',exact:true}).click();await expect(amounts).not.toContainText('€');
 }
 await expect(page.locator('#invoiceJson')).toHaveCount(0);
});

test('jornadas plegadas, ausencias con fecha e impuestos con los colores de Económico',async({page},info)=>{
 await page.evaluate(()=>{ST={'2026-10-12':{type:'festivo'},'2026-10-15':{type:'ausencia'},'2026-10-17':{type:'festivo'}};const data=invoiceData();data.config.kairoUrl='https://synthetic-kairo.test.ts.net/facturas/';invoiceSave(data);return openInvoiceMonth('2026-10');});
 await expect(page.locator('#invoiceDays summary')).toContainText('20 de 22');
 const size=await page.locator('.invoice-sheet').boundingBox();
 await page.locator('#invoiceDays summary').click();
 await expect(page.locator('.invoice-days-list')).toContainText('12 de octubre');await expect(page.locator('.invoice-days-list')).toContainText('15 de octubre');await expect(page.locator('.invoice-days-list')).not.toContainText('17 de octubre');
 expect((await page.locator('.invoice-sheet').boundingBox()).height).toBe(size.height);
 await page.screenshot({path:info.outputPath('dias-desplegados.png'),animations:'disabled'});
 await page.locator('#invoiceDays summary').click();
 for(const theme of ['light','grey','dark']){
  await page.evaluate(theme=>{applyTheme(theme);},theme);
  const colors=await page.evaluate(()=>{const probe=document.createElement('span');document.body.append(probe);probe.style.color='var(--c-orange)';const vat=getComputedStyle(probe).color;probe.style.color='var(--c-red)';const irpf=getComputedStyle(probe).color;probe.remove();return [vat,irpf,getComputedStyle(document.querySelector('.invoice-vat')).color,getComputedStyle(document.querySelector('.invoice-withholding')).color];});
  expect(colors[2]).toBe(colors[0]);expect(colors[3]).toBe(colors[1]);
  await page.screenshot({path:info.outputPath('factura-'+theme+'.png'),animations:'disabled'});
 }
});
