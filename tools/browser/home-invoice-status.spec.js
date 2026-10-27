const {test,expect}=require('@playwright/test');
const base='https://synthetic-status.test.ts.net/facturas/';
const result=(state,period='2026-10')=>({period,state,generated:state!=='missing',issued:['sent','issued'].includes(state),scheduled:state==='scheduled',sent:state==='sent',scheduledDate:state==='scheduled'?'2026-10-30':null});
async function setup(page,context,configured=true){
  await page.clock.setFixedTime(new Date('2026-10-26T12:00:00+01:00'));
  await page.addInitScript(({base,configured})=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:configured?base:''},months:{}}));},{base,configured});
  const calls=[];let value=result('draft'),fail=false;
  await context.route(base+'gestify-status?**',async route=>{calls.push(route.request());if(fail)return route.abort();const period=new URL(route.request().url()).searchParams.get('period');return route.fulfill({headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8765','Cache-Control':'no-store'},json:{...value,period}});});
  await page.goto('/');
  await page.evaluate(()=>{CY=2026;CM=9;MONTH_H={'2026-10':9};ST={'2026-10-12':{type:'festivo'}};SW={};weeks(CY,CM).forEach(w=>SW[dk(w[0])]=true);homeSubmissionWeeks(CY,CM).forEach(w=>SW[w.key]=true);render();});
  return {calls,set(valueToSet){value=valueToSet;},offline(){fail=true;}};
}

for(const width of [320,400,440])test('Home: total, descuentos y horas destacadas; factura sincronizada '+width,async({page,context},info)=>{
  await page.setViewportSize({width,height:880});const api=await setup(page,context);const status=page.locator('#homeInvoiceStatus');
  await expect(status).toContainText('Factura pendiente de enviar');
  const summary=page.locator('.home-summary-compact');await expect(summary).toBeVisible();
  await expect(summary.locator('.total .home-hours-days')).toContainText('22');await expect(summary.locator('.total .home-hours-value')).toHaveText('185,5h');await expect(summary.locator('.off')).toContainText('Festivos');await expect(summary.locator('.off .home-hours-days')).toContainText('1');await expect(summary.locator('.worked .home-hours-days')).toContainText('21');await expect(summary.locator('.worked .home-hours-value')).toHaveText('176,5h');
  const order=await summary.locator('.home-hours-row').evaluateAll(els=>els.map(e=>e.className));expect(order[0]).toContain('total');expect(order.at(-1)).toContain('worked');
  const hours=summary.locator('.worked .home-hours-value');expect(await hours.evaluate(el=>+getComputedStyle(el).fontWeight)).toBeGreaterThanOrEqual(700);expect(await hours.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(await summary.locator('.total .home-hours-value').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)));
  const storage=await page.evaluate(()=>JSON.stringify(localStorage)),height=(await status.boundingBox()).height;
  for(const [state,label]of [['scheduled','Factura programada'],['sent','Factura enviada'],['missing','Factura pendiente de preparar']]){api.set(result(state));await page.getByRole('button',{name:'Actualizar estado de factura',exact:true}).click();await expect(status).toContainText(label);expect((await status.boundingBox()).height).toBe(height);}
  expect(api.calls.every(r=>r.method()==='GET'&&r.postData()===null)).toBe(true);expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);
  expect(await summary.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);expect(await status.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  const columns=await summary.locator('.home-hours-row').evaluateAll(rows=>rows.map(row=>{const label=row.children[0].getBoundingClientRect(),days=row.children[1].getBoundingClientRect(),hours=row.children[2].getBoundingClientRect();return {days:days.right,hours:hours.right,separated:label.right<=days.left&&days.right<=hours.left};}));
  expect(columns.every(row=>row.separated&&Math.abs(row.days-columns[0].days)<1&&Math.abs(row.hours-columns[0].hours)<1)).toBe(true);
  await page.screenshot({path:info.outputPath('home-factura-'+width+'.png'),animations:'disabled'});
  api.set(result('scheduled'));await page.getByRole('button',{name:'Actualizar estado de factura',exact:true}).click();await expect(status).toContainText('Factura programada');await page.screenshot({path:info.outputPath('home-programada-'+width+'.png'),animations:'disabled'});
  api.set(result('sent'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(status).toContainText('Factura enviada');
  await page.evaluate(()=>{delete SW[homeSubmissionWeeks(CY,CM)[0].key];render();});await expect(page.locator('.home-submission.pending .home-summary-compact')).toBeVisible();await expect(summary.locator('.worked .home-hours-value')).toHaveText('176,5h');
});

test('Sin conexión o respuesta incoherente no afirma factura pendiente ni enviada',async({page,context})=>{
  const api=await setup(page,context);await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura pendiente de enviar');
  api.set({...result('sent'),sent:false});await page.locator('[data-home-invoice=refresh]').click();await expect(page.locator('#homeInvoiceStatus')).toContainText('Sin conexión con Kairo');await expect(page.locator('#homeInvoiceStatus')).not.toHaveClass(/pending|complete/);
  api.offline();await page.locator('[data-home-invoice=refresh]').click();await expect(page.locator('#homeInvoiceStatus')).toContainText('Sin conexión con Kairo');
  const count=api.calls.length;await page.evaluate(()=>{render();render();});expect(api.calls).toHaveLength(count);
});

test('Conectar reutiliza la configuración privada; meses anteriores no consultan Kairo',async({page,context})=>{
  const api=await setup(page,context,false);await expect(page.locator('#homeInvoiceStatus')).toContainText('Estado de factura sin sincronizar');expect(api.calls).toHaveLength(0);
  await page.getByRole('button',{name:'Configurar conexión con Kairo'}).click();await expect(page.locator('#invoiceConnection')).toHaveAttribute('open','');await expect(page.locator('[data-invoice-field=kairoUrl]')).toBeEditable();await page.locator('#invoiceBack').click();
  await page.evaluate(()=>{CM=8;render();});await expect(page.locator('#homeInvoiceStatus')).toHaveCount(0);expect(api.calls).toHaveLength(0);
});

test('Una respuesta tardía del mes anterior no sustituye el estado visible',async({page,context})=>{
  await setup(page,context);await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura pendiente de enviar');
  await page.evaluate(()=>{window.invoiceReplies=[];window.fetch=(url,options)=>new Promise(resolve=>invoiceReplies.push({url,resolve}));syncHomeInvoiceStatus(true);CM=10;render();});
  await expect.poll(()=>page.evaluate(()=>invoiceReplies.length)).toBe(2);
  await page.evaluate(data=>invoiceReplies[1].resolve({ok:true,json:async()=>data}),result('sent','2026-11'));await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura enviada');
  await page.evaluate(data=>invoiceReplies[0].resolve({ok:true,json:async()=>data}),result('draft'));await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura enviada');expect(await page.evaluate(()=>INVOICE_HOME_STATUS.period)).toBe('2026-11');
});
