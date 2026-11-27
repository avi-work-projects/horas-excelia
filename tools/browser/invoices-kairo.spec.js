const {test,expect}=require('@playwright/test');
require('./vpn-confirmation-fixture.cjs').confirmedVpn(test,'https://synthetic-kairo.test.ts.net');
const receiverHtml=require('./kairo-receiver-fixture.cjs');
const {verifyInvoiceExport}=require('../verify-invoice-export');
const base='https://synthetic-kairo.test.ts.net/facturas/';
test.use({viewport:{width:393,height:880},isMobile:true,hasTouch:true});

async function setup(page,context,{loseReply=false}={}){
  let stored=null,calls=0;
  await context.route('https://synthetic-kairo.test.ts.net/**',async route=>{
    const req=route.request();
    if(req.method()==='GET'&&new URL(req.url()).pathname.endsWith('/gestify-status')&&new URL(req.url()).searchParams.get('period')==='2027-10')
      return route.fulfill({json:{period:'2027-10',state:'sent',generated:true,issued:true,scheduled:false,sent:true,scheduledDate:null},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
    if(req.method()==='GET'&&new URL(req.url()).pathname.endsWith('/gestify-status')){const period=new URL(req.url()).searchParams.get('period');return route.fulfill({json:{period,state:stored?'draft':'missing',generated:!!stored,issued:false,scheduled:false,sent:false,scheduledDate:null},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});}
    if(new URL(req.url()).pathname.endsWith('/gestify-month'))return route.fulfill({contentType:'text/html',body:'<h1>Factura del mes</h1>'});
    if(req.method()==='GET')return route.fulfill({contentType:'text/html',body:receiverHtml});
    const data=req.postDataJSON();expect(req.headers()['x-csrf']).toBe('synthetic');
    if(data.action==='prepare'){
      const p=JSON.parse(data.source);expect(verifyInvoiceExport(p)).toEqual({operationIdMatches:true,contentHashMatches:true});
      if(!stored){stored=p;calls++;}
      if(loseReply){loseReply=false;return route.abort();}
    }
    return route.fulfill({json:{operationId:data.operationId,contentHash:data.contentHash,period:data.period,state:!stored?'missing':stored.contentHash===data.contentHash?'review':'different'}});
  });
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await context.route('**/horas/reachable',r=>r.fulfill({json:{service:'kairo-hours'},headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.goto('/');
  await page.evaluate(url=>{let c=invoiceDefaults();Object.assign(c,{issuer:'Persona sintética',issuerTax:'PRUEBA-EMISOR',client:'Cliente sintético',clientTax:'PRUEBA-CLIENTE',project:'Proyecto sintético',rate:'320',kairoUrl:url});invoiceSave({config:c,months:{}});openInvoiceMonth('2027-02');},base);
  await expect(page.locator('#invoiceKairoContinue')).toBeVisible();
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
  const popup=await exchange(page,'#invoiceKairoContinue',false);
  await expect(popup.getByRole('button',{name:'Preparar borrador',exact:true})).toBeVisible();
  await popup.screenshot({path:info.outputPath('invoice-receiver.png'),animations:'disabled'});
  await popup.getByRole('button',{name:'Preparar borrador',exact:true}).click();
  await expect(popup).toHaveURL(base+'gestify-month?period=2027-02');
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Preparación recibida');
  await expect.poll(()=>page.evaluate(()=>INVOICE_HOME_CACHE.periods['2027-02']?.data?.generated)).toBe(true);
  expect((await page.locator('.invoice-sheet').boundingBox()).height).toBe(height);
  await popup.close();
  const again=await exchange(page,'#invoiceKairoContinue',false);
  await expect(again).toHaveURL(base+'gestify-month?period=2027-02');await again.close();
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
  const popup=await exchange(page,'#invoiceKairoContinue');await expect(page.locator('#invoiceKairoMessage')).toContainText('no confirmó');await popup.close();
  expect(await page.evaluate(()=>invoiceData().months['2027-02'].kairo.state)).toBe('pending');
  const status=await exchange(page,'#invoiceKairoContinue',false);await expect(status).toHaveURL(base+'gestify-month?period=2027-02');await status.close();expect(calls()).toBe(1);
});

test('desde Home elige noviembre y el mes queda fijo al revisar en Kairo',async({page,context},info)=>{
  const calls=await setup(page,context);
  await page.evaluate(async()=>{CY=2027;CM=9;await openInvoiceMonth('2027-10');});
  await page.locator('#invoiceBack').click();
  await page.evaluate(()=>{
    const period='2027-11',rows=hoursScopeKeys(period).map(key=>({key,state:'sent'}));
    hoursCacheRemember({period,rows,checkedAt:new Date().toISOString()},hoursKairoUrl(),hoursSourceSignature(rows));
    render();
  });
  await page.locator('#nextBtn').click();await page.locator('#invoiceHomeBtn').click();
  await expect(page.locator('#invoicePeriod')).toContainText('Noviembre 2027');await expect(page.locator('input[type="month"]')).toHaveCount(0);
  expect(await page.evaluate(()=>[CY,CM])).toEqual([2027,10]);
  const popup=await exchange(page,'#invoiceKairoContinue');await expect(popup).toHaveURL(base+'gestify-month?period=2027-11');
  expect(await page.evaluate(()=>invoiceData().months['2027-11'].kairo.state)).toBe('review');expect(calls()).toBe(1);
  for(const width of [320,393]){
    await popup.setViewportSize({width,height:740});
    expect(await popup.evaluate(()=>document.documentElement.scrollHeight<=innerHeight)).toBe(true);
  }
  await popup.screenshot({path:info.outputPath('factura-noviembre-recibida.png')});
  await page.screenshot({path:info.outputPath('factura-noviembre-gestify.png')});
});

test('offline conserva preparación y no intenta enviar; URL rechaza claves y otros orígenes',async({page,context})=>{
  await setup(page,context);
  const stored=await page.evaluate(()=>JSON.stringify(invoiceData()));
  await context.setOffline(true);await page.locator('#invoiceKairoContinue').click();await expect(page.locator('#invoiceKairoMessage')).toContainText('Sin conexión');
  expect(await page.evaluate(()=>JSON.stringify(invoiceData()))).toBe(stored);
  expect(await page.evaluate(()=>['http://a.ts.net/facturas/','https://evil.test/facturas/','https://a.ts.net/facturas/?key=secret','https://user:secret@a.ts.net/facturas/'].every(url=>{try{invoiceKairoUrl(url);return false;}catch{return true;}}))).toBe(true);
});

test('cancelar recepción y cerrar ventana no marca éxito; configuración borrada no restaura Gmail',async({page,context})=>{
  await setup(page,context);
  const wait=page.waitForEvent('popup');await page.locator('#invoiceKairoContinue').click();const popup=await wait;await expect(popup.locator('#receive')).toBeVisible();await popup.close();
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Ventana cerrada');
  await page.evaluate(()=>{const d=invoiceData();d.config.kairoUrl='';invoiceSave(d);openInvoiceMonth('2027-02');});
  await expect(page.locator('#invoiceDocument,#invoiceGmail')).toHaveCount(0);
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Configura de nuevo');
});

test('un borrador con cambios locales y una factura enviada continúan sin volver a importar',async({page,context},info)=>{
  const calls=await setup(page,context);
  const first=await exchange(page,'#invoiceKairoContinue');
  await expect(first).toHaveURL(base+'gestify-month?period=2027-02');await first.close();
  await page.evaluate(()=>{ST['2027-02-01']={type:'festivo'};return openInvoiceMonth('2027-02');});
  const popup=await exchange(page,'#invoiceKairoContinue',false);
  await expect(popup).toHaveURL(base+'gestify-month?period=2027-02');
  expect(calls()).toBe(1);await popup.close();
  await page.evaluate(()=>openInvoiceMonth('2027-10'));
  const sent=await exchange(page,'#invoiceKairoContinue',false);
  await expect(sent).toHaveURL(base+'gestify-month?period=2027-10');
  await expect(page.locator('#invoiceKairoMessage')).toHaveText('Factura enviada desde Kairo.');
  expect(calls()).toBe(1);
});

test('Android recibe el resultado aunque Kairo abra la factura en una app independiente',async({page,context})=>{
  await page.addInitScript(()=>Object.defineProperty(navigator,'userAgent',{get:()=>'Chrome Android'}));
  await setup(page,context);
  const ticket='a'.repeat(64);
  let transfer,confirmed=false;
  await context.route(base+'gestify-entrega**',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(req.method()==='POST'){
      transfer=req.postDataJSON();
      expect(transfer.action).toBe('prepare');
      expect(verifyInvoiceExport(JSON.parse(transfer.source))).toEqual({operationIdMatches:true,contentHashMatches:true});
      return route.fulfill({status:201,json:{ticket}});
    }
    if(url.searchParams.get('abrir')===ticket)return route.fulfill({body:'<button>Preparar borrador</button>',contentType:'text/html'});
    expect(url.searchParams.get('resultado')).toBe(ticket);
    const {period,operationId,contentHash}=transfer;
    return route.fulfill({json:confirmed?{ok:true,result:{period,operationId,contentHash,state:'review'}}:{pending:true}});
  });
  const popup=await exchange(page,'#invoiceKairoContinue',false);
  await expect(popup.getByRole('button',{name:'Preparar borrador'})).toBeVisible();
  const target=popup.url();
  await popup.close();
  const kairo=await context.newPage();
  await kairo.goto(target);
  expect(await kairo.evaluate(()=>window.opener)).toBeNull();
  await kairo.getByRole('button',{name:'Preparar borrador'}).click();
  confirmed=true;
  await kairo.close();
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Preparación recibida');
});
