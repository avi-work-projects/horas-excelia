const {test,expect}=require('@playwright/test');
require('./vpn-confirmation-fixture.cjs').confirmedVpn(test,'https://home-r8.test.ts.net');
const receiver=require('./kairo-receiver-fixture.cjs');
const origin='https://home-r8.test.ts.net/';

async function setup(page,context){
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00+01:00'));
  const posts=[];let stored,state='scheduled',offline=false;
  await context.route(origin+'**',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(offline)return route.abort();
    if(url.pathname==='/facturas/gestify'&&req.method()==='GET')return route.fulfill({contentType:'text/html',body:receiver});
    if(req.method()==='POST'){
      const data=req.postDataJSON();posts.push(data);
      expect(data.action).toBe('revise');expect(data.operationId).toBe(stored.operationId);
      stored=JSON.parse(data.source);state='draft';
      return route.fulfill({json:{...data,source:undefined,state:'review'}});
    }
    const period=url.searchParams.get('period');
    if(url.pathname.endsWith('gestify-status'))return route.fulfill({json:{period,state,generated:true,issued:state==='sent',sent:state==='sent',scheduled:state==='scheduled',scheduledDate:state==='scheduled'?'2027-02-19':null,sentDate:state==='sent'?'2027-02-19':null},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
    return route.fulfill({json:{phase:'done',result:{periods:[]}},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});
  });
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await context.route('**/horas/reachable',r=>r.fulfill({json:{service:'kairo-hours'},headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.goto('/');
  stored=await page.evaluate(async origin=>{
    CY=2027;CM=1;ST={'2027-02-15':{type:'festivo'}};SW={};MONTH_H={};
    const c=Object.assign(invoiceDefaults(),{issuer:'Persona ficticia',issuerTax:'PRUEBA-01',client:'Empresa ficticia',clientTax:'PRUEBA-02',project:'PRUEBA/2027',rate:'320',kairoUrl:origin+'facturas/'});
    invoiceSave({config:c,months:{}});const p=await invoicePrepare('2027-02',c,invoiceDayRows('2027-02',c));
    const data=invoiceData();data.months['2027-02'].kairo={state:'approved',contentHash:p.contentHash,operationId:p.operationId};invoiceSave(data);
    HOURS_CACHE={schema:1,url:hoursKairoUrl(),weeks:{},periods:{},attempts:{},lastMailSync:Date.now()};
    for(const month of [0,1,2]){const period=mkey(2027,month);HOURS_CACHE.periods[period]={checkedAt:Date.now()};hoursScopeKeys(period).forEach(key=>{HOURS_CACHE.weeks[key]={state:'scheduled',days:hoursWeekDays(key),schedule:homeWeekSchedule(key).date+'T08:00:00+01:00'};});}
    hoursCacheSave();
    INVOICE_HOME_CACHE={schema:1,url:c.kairoUrl,periods:{}};
    for(const month of [0,1,2]){const period=mkey(2027,month);INVOICE_HOME_CACHE.periods[period]={attempted:true,checkedAt:Date.now(),data:{period,state:'scheduled',generated:true,issued:false,scheduled:true,sent:false,scheduledDate:homeInvoiceScheduleDate(2027,month)}};}
    homeInvoiceCacheSave();render();return p;
  },origin);
  return {posts,offline(){offline=true;},sent(){state='sent';},get stored(){return stored;}};
}

test('R8 aplicada: temas, anchuras y estados sin cambios de datos ni botones duplicados',async({page,context},info)=>{
  await setup(page,context);
  const original=await page.evaluate(()=>JSON.stringify([ST,SW,MONTH_H,invoiceData()]));
  for(const theme of ['light','dark','grey'])for(const width of [320,400,440]){
    await page.setViewportSize({width,height:920});await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;render();},theme);
    const invoice=page.locator('#homeInvoiceStatus');await expect(invoice).toHaveClass(/scheduled/);
    await expect(invoice.getByRole('button',{name:'Ver envíos'})).toHaveCount(0);
    await expect(invoice.locator('time')).toHaveText('19/02');
    await expect(page.locator('.home-submission')).toContainText('Correos al día');
    expect(await page.locator('.home-invoice-actions button').evaluateAll(nodes=>nodes.every(e=>getComputedStyle(e).borderTopColor===getComputedStyle(e.querySelector('svg')).color))).toBe(true);
    for(const selector of ['.hours-control','.home-submission','#homeInvoiceStatus'])expect(await page.locator(selector).evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    if(theme==='light'&&width===400)await page.screenshot({path:info.outputPath('home-r8-programada.png'),animations:'disabled'});
  }
  expect(await page.evaluate(()=>JSON.stringify([ST,SW,MONTH_H,invoiceData()]))).toBe(original);
  await page.setViewportSize({width:400,height:920});await page.evaluate(()=>{document.documentElement.dataset.theme='light';Object.assign(INVOICE_HOME_CACHE.periods['2027-02'].data,{state:'sent',scheduled:false,scheduledDate:null,sent:true,sentDate:'2027-02-19'});render();});
  await expect(page.locator('#homeInvoiceStatus')).toHaveClass(/complete/);await expect(page.locator('#homeInvoiceStatus time')).toHaveText('19/02');
  await page.screenshot({path:info.outputPath('home-r8-enviada.png'),animations:'disabled'});
});

test('pendientes: requisitos junto a cada frase y acción a la derecha, sin resumen',async({page,context},info)=>{
  await setup(page,context);
  await page.evaluate(()=>{HOURS_CACHE.weeks['2027-02-08'].state='missing';Object.assign(INVOICE_HOME_CACHE.periods['2027-02'].data,{state:'missing',scheduled:false,scheduledDate:null});render();});
  const mail=page.locator('.home-submission'),invoice=page.locator('#homeInvoiceStatus');
  await expect(mail).toContainText('Correos pendientes de programar');await expect(mail.locator('.month-summary')).toHaveCount(0);
  await mail.locator('summary').click();await expect(mail).toContainText('Se incluyen las 2');
  const action=mail.getByRole('button',{name:'Programar pendientes'});
  expect(await action.evaluate(e=>Array.from(e.children).every(n=>{const a=e.getBoundingClientRect(),b=n.getBoundingClientRect();return b.left>=a.left&&b.right<=a.right;}))).toBe(true);
  expect((await action.boundingBox()).x).toBeGreaterThan((await mail.locator('.home-panel-status').boundingBox()).x);
  await expect(invoice.locator('.home-invoice-rule .home-rule-result')).toHaveText(['✕','✓']);
  for(const rule of await invoice.locator('.home-invoice-rule').all())expect(await rule.evaluate(e=>{const text=e.querySelector('em').getBoundingClientRect(),mark=e.querySelector('.home-rule-result').getBoundingClientRect();return mark.left-text.right<14;})).toBe(true);
  await page.screenshot({path:info.outputPath('home-r8-pendientes.png'),animations:'disabled'});
});

test('modificar factura usa la revisión real, conserva la confirmación y nunca aprueba ni envía',async({page,context},info)=>{
  const api=await setup(page,context);
  await page.evaluate(()=>{ST['2027-02-09']={type:'vacaciones'};render();});
  const invoice=page.locator('#homeInvoiceStatus');await expect(invoice).toHaveClass(/scheduled/);
  await expect(invoice.locator('.home-invoice-alert')).toHaveText('Revisar Cambios');
  await expect(invoice.locator('.home-invoice-alert')).toHaveCSS('animation-name','home-pending-pulse');
  await page.screenshot({path:info.outputPath('home-r8-cambios.png'),animations:'disabled'});
  const old=await page.evaluate(()=>invoiceData().months['2027-02'].kairo.contentHash);
  await invoice.getByRole('button',{name:'Modificar envíos'}).click();
  await expect(page.locator('#invoicePeriod')).toContainText('Febrero 2027');
  const waiting=page.waitForEvent('popup');await page.getByRole('button',{name:'Enviar cambios a Kairo'}).click();const popup=await waiting;
  await expect(popup.getByRole('button',{name:'Actualizar borrador'})).toBeVisible();expect(api.posts).toHaveLength(0);
  expect(await page.evaluate(()=>invoiceData().months['2027-02'].kairo.contentHash)).toBe(old);
  await popup.getByRole('button',{name:'Actualizar borrador'}).click();
  await expect(page.locator('#invoiceKairoMessage')).toContainText('Preparación recibida');
  expect(api.posts).toHaveLength(1);expect(api.posts[0].action).toBe('revise');
  expect(await page.evaluate(()=>invoiceData().months['2027-02'].kairo.contentHash)).not.toBe(old);
  expect(await page.evaluate(()=>invoiceData().months['2027-02'].kairo.state)).toBe('review');
  await popup.close();await page.locator('#invoiceBack').click();await expect(invoice).toContainText('Factura sin enviar');
});

test('los pendientes destacan con fondo y halo sin mover el panel ni animar los estados completos',async({page,context},info)=>{
  await setup(page,context);
  await expect(page.locator('.home-submission')).toHaveCSS('animation-name','none');
  await expect(page.locator('#homeInvoiceStatus')).toHaveCSS('animation-name','none');
  await page.evaluate(()=>{HOURS_CACHE.weeks['2027-02-08'].state='missing';Object.assign(INVOICE_HOME_CACHE.periods['2027-02'].data,{state:'missing',scheduled:false});render();});
  const panels=page.locator('.home-panel');
  const initial=await panels.evaluateAll(nodes=>nodes.map(e=>{const a=e.getAnimations()[0];a.pause();a.currentTime=0;return {height:e.getBoundingClientRect().height,background:getComputedStyle(e).backgroundColor};}));
  const peak=await panels.evaluateAll(nodes=>nodes.map(e=>{e.getAnimations()[0].currentTime=800;return {height:e.getBoundingClientRect().height,background:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow};}));
  peak.forEach((p,i)=>{expect(p.height).toBe(initial[i].height);expect(p.background).not.toBe(initial[i].background);expect(p.shadow).toContain('3px');});
  await page.screenshot({path:info.outputPath('home-pendientes-pulso.png')});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const panel of await panels.all())await expect(panel).toHaveCSS('animation-name','none');
});

test('Sync con error conserva la fecha guardada y solo muestra error dentro del botón',async({page,context})=>{
  const api=await setup(page,context);const stamp=await page.evaluate(()=>HOURS_CACHE.lastMailSync);api.offline();
  await page.locator('#homeSyncBtn').click();await page.locator('[data-hours-check]').click();await expect(page.locator('[data-hours-check]')).toBeEnabled();
  await page.locator('[data-close-sync]').click();await expect(page.locator('#homeSyncDate em')).toHaveText('error');
  await expect(page.locator('#homeSyncDate')).toHaveClass(/home-sync-error/);await expect(page.locator('#homeSyncDate em')).toHaveCSS('font-style','italic');
  expect(await page.evaluate(()=>HOURS_CACHE.lastMailSync)).toBe(stamp);
  await expect(page.locator('.home-submission')).not.toContainText('Sin conexión');await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura programada');
});

test('el histórico conserva los rótulos habituales y no inventa fechas ni confirmaciones',async({page,context},info)=>{
  const api=await setup(page,context);const saved=await page.evaluate(()=>JSON.stringify([HOURS_CACHE,INVOICE_HOME_CACHE,invoiceData(),ST,SW]));
  await page.evaluate(()=>{CY=2026;CM=8;render();});
  await expect(page.locator('.home-submission')).toContainText('Correos al día');
  await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura sin registro');
  await expect(page.locator('#homeInvoiceStatus')).toHaveClass(/unknown/);
  await expect(page.getByRole('button',{name:'Ver cálculo histórico'})).toHaveCount(0);
  await expect(page.locator('#homeInvoiceStatus time')).toHaveCount(0);
  await expect(page.locator('#weeksContainer')).not.toContainText('Mes cerrado');
  await expect(page.locator('.week-card').first()).toContainText('Enviada');
  for(const status of await page.locator('.home-panel-status').all()){
    expect(await status.evaluate(e=>{const icon=e.firstElementChild.getBoundingClientRect(),title=e.querySelector('strong').getBoundingClientRect();return title.left-icon.right;})).toBeGreaterThanOrEqual(10);
  }
  expect(await page.evaluate(()=>JSON.stringify([HOURS_CACHE,INVOICE_HOME_CACHE,invoiceData(),ST,SW]))).toBe(saved);expect(api.posts).toEqual([]);
  await page.screenshot({path:info.outputPath('home-historico-confirmado-v547.png'),animations:'disabled'});
});

test('programar el mes exige su predecesor y no afecta al envío manual ni a editar días',async({page,context})=>{
  await setup(page,context);const popups=[];page.on('popup',p=>popups.push(p));
  await page.evaluate(()=>{HOURS_CACHE.weeks['2026-12-28'].state='missing';HOURS_CACHE.weeks['2027-02-08'].state='missing';render();});
  await page.getByRole('button',{name:'Programar pendientes',exact:true}).click();
  await expect(page.locator('#toast')).toContainText('Primero deben estar programados los correos de enero de 2027');
  expect(popups).toHaveLength(0);
  await page.locator('.week-card').first().getByRole('button',{name:'Acciones'}).click();await expect(page.locator('.week-card').first().getByRole('button',{name:'Enviar a Outlook',exact:true})).toBeVisible();
  page.once('dialog',d=>d.accept());await page.locator('.week-card').first().getByRole('button',{name:'Editar horas',exact:true}).click();
  await expect(page.locator('.week-card').first()).not.toHaveClass(/sent/);
  await page.evaluate(()=>{HOURS_CACHE.weeks['2026-12-28'].state='sent';});
  expect(await page.evaluate(()=>homePreviousMailMonth(CY,CM).ready)).toBe(true);
});
