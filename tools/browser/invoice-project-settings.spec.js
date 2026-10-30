const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const {verifyInvoiceExport}=require('../verify-invoice-export');
const base='https://synthetic-kairo.test.ts.net/facturas/';
const receiver=fs.readFileSync('tools/kairo/receiver.html','utf8').replace('/*BRIDGE_CONFIG*/',JSON.stringify({origin:'http://127.0.0.1:8765',csrf:'synthetic'})).replace('/*BRIDGE_SCRIPT*/',()=>fs.readFileSync('tools/kairo/receiver.js','utf8'));
test.use({viewport:{width:393,height:880},isMobile:true,hasTouch:true});

async function setup(page,context,{loseReply=false,reject=false}={}){
 let writes=0,requests=0,rules={};
 await context.route('https://synthetic-kairo.test.ts.net/**',async route=>{
  const req=route.request();
  if(req.method()==='GET')return route.fulfill({contentType:'text/html',body:receiver});
  const data=req.postDataJSON();expect(data.action).toBe('project');expect(req.headers()['x-csrf']).toBe('synthetic');requests++;
  if(reject==='stale'){reject=false;rules={'2027-02':'DEMO/CURRENT'};return route.fulfill({json:{state:'project_rejected',message:'El proyecto de Kairo ha cambiado. Revisa el conflicto',current:{base:'DEMO/OLD',project:'DEMO/CURRENT',from:'2027-02',periods:rules}}});}
  if(reject)return route.fulfill({json:{state:'project_rejected',message:'Ya hay una factura preparada para este mes'}});
  if(rules[data.change.from]!==data.change.project){rules[data.change.from]=data.change.project;writes++;}
  if(loseReply){loseReply=false;return route.abort();}
  return route.fulfill({json:{state:'project_saved',project:data.change.project,from:data.change.from,base:'DEMO/OLD',periods:rules}});
 });
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
 await page.evaluate(async url=>{
  const c=invoiceDefaults();Object.assign(c,{issuer:'Persona sintética',issuerTax:'TEST-ISSUER',client:'Cliente sintético',clientTax:'TEST-CLIENT',project:'DEMO/OLD',rate:'320',kairoUrl:url});
  invoiceSave({config:c,months:{}});await invoicePrepare('2027-02',c,invoiceDayRows('2027-02',c));openInvoiceSettings();
 },base);
 await page.locator('#invoiceSettingsEdit').click();
 await page.getByText('Cliente y servicio',{exact:true}).click();
 return ()=>({writes,requests});
}
async function fields(page){await page.locator('[data-invoice-field="project"]').fill('DEMO/NEW');await page.locator('[data-invoice-field="projectFrom"]').fill('2027-03');}
async function save(page){const wait=page.waitForEvent('popup');await page.locator('#invoiceSettingsSave').click();return await wait;}

test('guardar sincroniza código y mes sin cambiar las facturas anteriores',async({page,context},info)=>{
 const counters=await setup(page,context),before=await page.evaluate(()=>JSON.stringify(invoiceData().months));
 await fields(page);
 await page.screenshot({path:info.outputPath('proyecto-vigencia-configuracion.png'),animations:'disabled'});
 const popup=await save(page);await expect(popup.locator('#resultTitle')).toHaveText('Proyecto guardado');
 await expect(page.locator('#invoiceProjectStatus')).toContainText('sincronizado con Kairo');
 expect(await page.evaluate(()=>JSON.stringify(invoiceData().months))).toBe(before);
 const p=await page.evaluate(()=>{const c=invoiceData().config;return invoicePrepare('2027-03',c,invoiceDayRows('2027-03',c));});
 expect(p.project).toBe('DEMO/NEW');expect(verifyInvoiceExport(p)).toEqual({operationIdMatches:true,contentHashMatches:true});
 expect(await page.evaluate(()=>invoiceProjectFor(invoiceData().config,'2027-02'))).toBe('DEMO/OLD');
 expect(counters()).toEqual({writes:1,requests:1});
 for(const width of [320,393]){await page.setViewportSize({width,height:880});expect(await page.locator('.invoice-sheet').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);}
 await popup.screenshot({path:info.outputPath('proyecto-sincronizado-kairo.png')});
});

test('respuesta perdida persiste pendiente, bloquea nuevas facturas y reintenta sin duplicar',async({page,context})=>{
 const counters=await setup(page,context,{loseReply:true});await fields(page);
 let popup=await save(page);await expect(page.locator('#invoiceError')).toContainText('sin confirmar');await popup.close();
 expect(await page.evaluate(()=>invoiceData().config.project)).toBe('DEMO/OLD');
 expect(await page.evaluate(()=>invoiceData().projectPending.project)).toBe('DEMO/NEW');
 await page.evaluate(()=>openInvoiceMonth('2027-03'));await expect(page.locator('#invoiceKairoSend')).toBeDisabled();
 await page.evaluate(()=>openInvoiceSettings());await page.locator('#invoiceSettingsEdit').click();
 popup=await save(page);await expect(page.locator('#invoiceProjectStatus')).toContainText('sincronizado');
 expect(await page.evaluate(()=>invoiceData().projectPending||null)).toBeNull();expect(counters()).toEqual({writes:1,requests:2});
});

test('rechazo confirmado permite corregir y no deja un cambio pendiente',async({page,context})=>{
 const counters=await setup(page,context,{reject:true});await fields(page);await save(page);
 await expect(page.locator('#invoiceError')).toContainText('factura preparada');
 expect(await page.evaluate(()=>invoiceData().projectPending||null)).toBeNull();
 expect(await page.evaluate(()=>invoiceData().config.project)).toBe('DEMO/OLD');
 await expect(page.locator('[data-invoice-field="projectFrom"]')).toBeEditable();expect(counters().writes).toBe(0);
});

test('sin conexión conserva configuración y no abre Kairo',async({page,context})=>{
 const counters=await setup(page,context);await fields(page);const before=await page.evaluate(()=>JSON.stringify(invoiceData()));
 await context.setOffline(true);await page.locator('#invoiceSettingsSave').click();await expect(page.locator('#invoiceError')).toContainText('Sin conexión');
 expect(await page.evaluate(()=>JSON.stringify(invoiceData()))).toBe(before);expect(counters().requests).toBe(0);
});

test('otro dispositivo cambió el proyecto: recuperar configuración y guardar de nuevo desde Gestify',async({page,context})=>{
 const counters=await setup(page,context,{reject:'stale'});await fields(page);
 let popup=await save(page);await expect(page.locator('#invoiceError')).toContainText('ha cambiado');await popup.close();
 expect(await page.evaluate(()=>invoiceData().config.project)).toBe('DEMO/CURRENT');
 popup=await save(page);await expect(page.locator('#invoiceProjectStatus')).toContainText('sincronizado');
 expect(await page.evaluate(()=>invoiceData().config.project)).toBe('DEMO/NEW');expect(counters()).toEqual({requests:2,writes:1});
});
