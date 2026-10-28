const {test,expect}=require('@playwright/test');
const base='https://synthetic-status.test.ts.net/facturas/';
const result=(state,period='2026-10')=>({period,state,generated:state!=='missing',issued:['sent','issued'].includes(state),scheduled:state==='scheduled',sent:state==='sent',scheduledDate:state==='scheduled'?'2026-10-30':null});
async function setup(page,context,configured=true){
  await page.clock.setFixedTime(new Date('2026-10-26T12:00:00+01:00'));
  await page.addInitScript(({base,configured})=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:configured?base:''},months:{}}));},{base,configured});
  const calls=[];let value=result('draft'),fail=false;
  await context.route(base+'gestify-status?**',async route=>{calls.push(route.request());if(fail)return route.abort();const period=new URL(route.request().url()).searchParams.get('period');return route.fulfill({headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765','Cache-Control':'no-store'},json:{...value,period}});});
  await context.route(new URL('/horas/status',base).href+'?**',async route=>{const period=new URL(route.request().url()).searchParams.get('period');const day=new Date(period+'-01T12:00:00');day.setDate(1-(day.getDay()+6)%7);const keys=[];while(day.getMonth()===+period.slice(5)-1||keys.length===0||day.getDate()<7){keys.push(day.toISOString().slice(0,10));day.setDate(day.getDate()+7);if(day.getMonth()!==+period.slice(5)-1)break;}for(let i=0;i<2;i++){keys.push(day.toISOString().slice(0,10));day.setDate(day.getDate()+7);}return route.fulfill({json:{phase:'done',result:{periods:[{period,verified:true,checkedAt:'2026-10-26T11:00:00Z',rows:keys.map(key=>({key,state:'sent'}))}]}},headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765'}});});
  await page.goto('/');
  await page.evaluate(()=>{CY=2026;CM=9;MONTH_H={'2026-10':9};ST={'2026-10-12':{type:'festivo'}};SW={};weeks(CY,CM).forEach(w=>SW[dk(w[0])]=true);homeSubmissionWeeks(CY,CM).forEach(w=>SW[w.key]=true);render();});
  return {calls,set(valueToSet){value=valueToSet;},offline(){fail=true;}};
}

for(const width of [320,400,440])test('Home: total, descuentos y horas destacadas; factura sincronizada '+width,async({page,context},info)=>{
  await page.setViewportSize({width,height:880});const api=await setup(page,context);const status=page.locator('#homeInvoiceStatus');
  await expect(status).toContainText('Factura sin enviar');
  const summary=page.locator('.home-summary-compact');await expect(summary).toBeVisible();
  await expect(summary.locator('.total')).toContainText('22 días laborables');await expect(summary.locator('.total')).toContainText('185,5h');await expect(summary.locator('.off')).toContainText('− 1 festivo');await expect(summary.locator('.off')).toContainText('9h');await expect(summary.locator('.worked')).toContainText('21 días trabajados');await expect(summary.locator('.worked strong')).toHaveText('176,5h');
  const order=await summary.locator(':scope > *').evaluateAll(els=>els.map(e=>e.className));expect(order[0]).toBe('month-total');expect(order.at(-1)).toContain('home-worked-total');
  const hours=summary.locator('.worked strong');expect(await hours.evaluate(el=>+getComputedStyle(el).fontWeight)).toBeGreaterThanOrEqual(700);expect(await hours.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(await summary.locator('.total .ms-num').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)));
  expect(await summary.locator('.worked .ms-days').evaluate(el=>getComputedStyle(el).color)).toBe(await hours.evaluate(el=>getComputedStyle(el).color));
  for(const row of await summary.locator('.month-stat').all()){
    const boxes=await row.locator(':scope > *').evaluateAll(els=>els.map(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom})));
    expect(Math.max(...boxes.map(b=>b.top))).toBeLessThan(Math.min(...boxes.map(b=>b.bottom)));
  }
  expect(await summary.locator('.off').evaluate(el=>Array.from(el.children).every(child=>getComputedStyle(child).color===getComputedStyle(el).color))).toBe(true);
  const storage=await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key])=>![HOURS_CACHE_KEY,HOURS_JOBS_KEY,INVOICE_HOME_CACHE_KEY].includes(key)))));
  for(const [state,label]of [['scheduled','Factura programada'],['sent','Factura enviada'],['missing','Factura sin enviar']]){api.set(result(state));await page.getByRole('button',{name:'Actualizar estado de correos y factura',exact:true}).click();await expect(status).toContainText(label);}
  expect(api.calls.every(r=>r.method()==='GET'&&r.postData()===null)).toBe(true);expect(await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key])=>![HOURS_CACHE_KEY,HOURS_JOBS_KEY,INVOICE_HOME_CACHE_KEY].includes(key)))))).toBe(storage);
  expect(await summary.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);expect(await status.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('home-factura-'+width+'.png'),animations:'disabled'});
  api.set(result('scheduled'));await page.getByRole('button',{name:'Actualizar estado de correos y factura',exact:true}).click();await expect(status).toContainText('Factura programada');await page.screenshot({path:info.outputPath('home-programada-'+width+'.png'),animations:'disabled'});
  api.set(result('sent'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(status).toContainText('Factura programada');await page.getByRole('button',{name:'Actualizar estado de correos y factura',exact:true}).click();await expect(status).toContainText('Factura enviada');
  await page.evaluate(()=>{ST['2026-10-13']={type:'vacaciones'};ST['2026-10-14']={type:'ausencia'};render();});await expect(summary.locator('.off')).toHaveCount(3);
  await expect(summary.locator('.off.vacaciones')).toContainText('− 1 vacaciones');await expect(summary.locator('.off.vacaciones')).not.toContainText('día');
  expect(await summary.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  for(const row of await summary.locator('.off').all())expect(await row.evaluate(el=>Array.from(el.children).every(child=>getComputedStyle(child).color===getComputedStyle(el).color))).toBe(true);
  await page.screenshot({path:info.outputPath('home-desglose-'+width+'.png'),animations:'disabled'});
  await page.evaluate(()=>{ST={};render();});await expect(summary.locator('.total')).toHaveCount(0);await expect(summary.locator('.off')).toHaveCount(0);await expect(summary.locator('.worked')).toHaveText('22 días trabajados185,5h');await expect(summary.locator('.ms-no-off')).toContainText('* sin días no trabajados');
  await expect(summary.locator('.ms-no-off em')).toHaveCSS('font-style','italic');
  expect(await summary.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('home-sin-descuentos-'+width+'.png'),animations:'disabled'});
});

test('Sin conexión o respuesta incoherente no afirma factura pendiente ni enviada',async({page,context})=>{
  const api=await setup(page,context);await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura sin enviar');
  api.set({...result('sent'),sent:false});await page.locator('[data-hours-check]').click();await expect.poll(()=>page.evaluate(()=>INVOICE_HOME_STATUS.phase)).toBe('error');await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura sin enviar');await expect(page.locator('#homeInvoiceStatus')).not.toHaveClass(/complete/);
  api.offline();await page.locator('[data-hours-check]').click();await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura sin enviar');
  const count=api.calls.length;await page.evaluate(()=>{render();render();});expect(api.calls).toHaveLength(count);
});

test('Conectar reutiliza la configuración privada; meses anteriores no consultan Kairo',async({page,context})=>{
  const api=await setup(page,context,false);await expect(page.locator('#homeInvoiceStatus')).toContainText('Conectar facturas con Kairo');expect(api.calls).toHaveLength(0);
  await page.getByRole('button',{name:'Conectar Kairo',exact:true}).click();await expect(page.locator('#invoiceConnection')).toHaveAttribute('open','');await expect(page.locator('[data-invoice-field=kairoUrl]')).toBeEditable();await page.locator('#invoiceBack').click();
  await page.evaluate(()=>{CM=8;render();});await expect(page.locator('#homeInvoiceStatus')).toHaveCount(0);expect(api.calls).toHaveLength(0);
});

test('Una respuesta tardía del mes anterior no sustituye el estado visible',async({page,context})=>{
  await setup(page,context);await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura sin enviar');
  await page.evaluate(()=>{window.invoiceReplies=[];const fetchOriginal=window.fetch;window.fetch=(url,options)=>String(url).includes('gestify-status?')?new Promise(resolve=>invoiceReplies.push({url,resolve})):fetchOriginal(url,options);syncHomeInvoiceStatus(true);CM=10;render();syncHomeInvoiceStatus(true);});
  await expect.poll(()=>page.evaluate(()=>invoiceReplies.length)).toBe(2);
  await page.evaluate(data=>invoiceReplies[1].resolve({ok:true,json:async()=>data}),result('sent','2026-11'));await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura enviada');
  await page.evaluate(data=>invoiceReplies[0].resolve({ok:true,json:async()=>data}),result('draft'));await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura enviada');expect(await page.evaluate(()=>INVOICE_HOME_STATUS.period)).toBe('2026-11');
});
