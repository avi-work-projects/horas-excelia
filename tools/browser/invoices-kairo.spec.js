const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const receiver=fs.readFileSync('tools/kairo/receiver.js','utf8');
const {verifyInvoiceExport}=require('../verify-invoice-export');
const base='https://synthetic-kairo.test.ts.net/facturas/';
test.use({viewport:{width:393,height:880},isMobile:true,hasTouch:true});

async function setup(page,context,{loseReply=false}={}){
  let stored=null,calls=0;
  await context.route('https://synthetic-kairo.test.ts.net/**',async route=>{
    const req=route.request();
    if(req.method()==='GET')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><h1>Kairo de prueba</h1><p id="status"></p><button id="receive" hidden>Recibir preparación</button><script>const bridgeConfig={origin:'http://127.0.0.1:8765',csrf:'synthetic'};${receiver}</script>`});
    const data=req.postDataJSON();expect(req.headers()['x-csrf']).toBe('synthetic');
    if(data.action==='prepare'){
      const p=JSON.parse(data.source);expect(verifyInvoiceExport(p)).toEqual({operationIdMatches:true,contentHashMatches:true});
      if(!stored){stored=p;calls++;}
      if(loseReply){loseReply=false;return route.abort();}
    }
    return route.fulfill({json:{operationId:data.operationId,contentHash:data.contentHash,period:data.period,state:!stored?'missing':stored.contentHash===data.contentHash?'review':'different'}});
  });
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.goto('/');
  await page.evaluate(url=>{let c=invoiceDefaults();Object.assign(c,{issuer:'Persona sintética',issuerTax:'PRUEBA-EMISOR',client:'Cliente sintético',clientTax:'PRUEBA-CLIENTE',project:'Proyecto sintético',rate:'320',kairoUrl:url});invoiceSave({config:c,months:{}});openInvoiceMonth('2027-02');},base);
  await expect(page.locator('#invoiceKairoSend')).toBeVisible();
  return ()=>calls;
}
async function exchange(page,button,confirm=true){
  const wait=page.waitForEvent('popup');await page.locator(button).click();const popup=await wait;
  if(confirm){await expect(popup.locator('#receive')).toBeVisible();await popup.locator('#receive').click();}
  return popup;
}

test('envío privado, repetido, consulta y vista móvil sin flujo Gmail paralelo',async({page,context},info)=>{
  const calls=await setup(page,context);
  await expect(page.locator('#invoiceDocument,#invoiceGmail')).toHaveCount(0);
  const height=(await page.locator('.invoice-sheet').boundingBox()).height;
  await page.screenshot({path:info.outputPath('kairo-preparacion-393.png'),animations:'disabled'});
  const popup=await exchange(page,'#invoiceKairoSend');
  expect(popup.url()).toBe(base+'gestify');
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Preparación recibida');
  expect((await page.locator('.invoice-sheet').boundingBox()).height).toBe(height);
  await popup.close();
  const again=await exchange(page,'#invoiceKairoSend');await expect(page.locator('#invoiceKairoMessage')).toContainText('Preparación recibida');await again.close();
  const status=await exchange(page,'#invoiceKairoStatus',false);await expect(page.locator('#invoiceKairoMessage')).toContainText('Preparación recibida');await status.close();
  expect(calls()).toBe(1);
  expect(await page.evaluate(()=>{const saved=invoiceData();invoiceSave({config:invoiceDefaults(),months:{}});applyFullImport({invoices:saved},'replace');return invoiceData().config.kairoUrl===saved.config.kairoUrl&&invoiceData().months['2027-02'].kairo.state==='review';})).toBe(true);
  for(const width of [320,393,412]){
    await page.setViewportSize({width,height:880});
    expect(await page.locator('.invoice-sheet').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await page.screenshot({path:info.outputPath('kairo-recibido-'+width+'.png'),animations:'disabled'});
  }
});

test('respuesta perdida: conservar incertidumbre y recuperar por consulta sin reimportar',async({page,context})=>{
  const calls=await setup(page,context,{loseReply:true});
  const popup=await exchange(page,'#invoiceKairoSend');await expect(page.locator('#invoiceKairoMessage')).toContainText('no confirmó');await popup.close();
  expect(await page.evaluate(()=>invoiceData().months['2027-02'].kairo.state)).toBe('pending');
  const status=await exchange(page,'#invoiceKairoStatus',false);await expect(page.locator('#invoiceKairoMessage')).toContainText('Preparación recibida');await status.close();expect(calls()).toBe(1);
});

test('offline conserva preparación y no intenta enviar; URL rechaza claves y otros orígenes',async({page,context})=>{
  await setup(page,context);
  const stored=await page.evaluate(()=>JSON.stringify(invoiceData()));
  await context.setOffline(true);await page.locator('#invoiceKairoSend').click();await expect(page.locator('#invoiceKairoMessage')).toContainText('Sin conexión');
  expect(await page.evaluate(()=>JSON.stringify(invoiceData()))).toBe(stored);
  expect(await page.evaluate(()=>['http://a.ts.net/facturas/','https://evil.test/facturas/','https://a.ts.net/facturas/?key=secret','https://user:secret@a.ts.net/facturas/'].every(url=>{try{invoiceKairoUrl(url);return false;}catch{return true;}}))).toBe(true);
});

test('cancelar recepción y cerrar ventana no marca éxito; configuración borrada no restaura Gmail',async({page,context})=>{
  await setup(page,context);
  const wait=page.waitForEvent('popup');await page.locator('#invoiceKairoSend').click();const popup=await wait;await expect(popup.locator('#receive')).toBeVisible();await popup.close();
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Ventana cerrada');
  await page.evaluate(()=>{const d=invoiceData();d.config.kairoUrl='';invoiceSave(d);openInvoiceMonth('2027-02');});
  await expect(page.locator('#invoiceDocument,#invoiceGmail')).toHaveCount(0);
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Configura de nuevo');
});
