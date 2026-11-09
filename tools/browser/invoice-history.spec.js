const {test,expect}=require('@playwright/test');
const base='https://history.test.ts.net/facturas/';
test('Sync trae todo el histórico una vez: fechas reales, caché tras recarga y ausencias sin inventar envíos',async({page,context},info)=>{
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00+01:00'));
  await page.addInitScript(base=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
    localStorage.setItem('excelia-invoices-v1',JSON.stringify({config:{kairoUrl:base},months:{}}));
  },base);
  let reads=0;
  const months={};for(let year=2023;year<=2026;year++)for(let m=1;m<=12;m++)months[year+'-'+String(m).padStart(2,'0')]={sentDate:year+'-'+String(m).padStart(2,'0')+'-19',lastSentDate:year+'-'+String(m).padStart(2,'0')+'-21',count:2};
  months['2023-04']={sentDate:'2023-05-03',lastSentDate:'2023-05-04',count:2};
  await context.route(base+'gestify-status?**',r=>{reads++;return r.fulfill({headers:{'Access-Control-Allow-Origin':'*'},json:{period:new URL(r.request().url()).searchParams.get('period'),state:'missing',generated:false,issued:false,scheduled:false,sent:false,scheduledDate:null,history:{schema:1,through:'2026-12',checkedAt:'2027-02-01T11:00:00Z',workStart:'2023-04-01',months}}});});
  await page.goto('/');await expect.poll(()=>page.evaluate(()=>Object.keys(INVOICE_HOME_CACHE.history?.months||{}).length)).toBe(48);
  const count=reads;
  await page.evaluate(()=>{CY=2023;CM=3;render();});
  await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura enviada');await expect(page.locator('#homeInvoiceStatus time')).toHaveText('03/05');
  await expect(page.locator('.home-submission')).toContainText('Correos al día');
  await expect(page.locator('.week-card').first()).toContainText('Enviada');
  await expect(page.locator('.week-card').first().getByRole('button',{name:'Acciones'})).toBeVisible();
  await expect(page.locator('.week-card').first().locator('.week-actions button')).toHaveCount(1);
  await page.screenshot({path:info.outputPath('home-historico-v545.png'),animations:'disabled'});
  await page.reload();await page.evaluate(()=>{CY=2023;CM=3;render();});await expect(page.locator('#homeInvoiceStatus time')).toHaveText('03/05');expect(reads).toBe(count);
  await page.evaluate(()=>{CY=2022;CM=11;render();});await expect(page.locator('#homeInvoiceStatus')).toContainText('Factura sin registro');await expect(page.locator('#homeInvoiceStatus time')).toHaveCount(0);
  await expect(page.locator('[data-home-invoice=send]')).toHaveCount(0);expect(reads).toBe(count);
  expect(await page.evaluate(()=>invoiceCalendarDelivery('2023-04',invoiceData().config).date)).toBe('2023-05-03');
  expect(await page.evaluate(()=>validateInvoiceMailHistory({...INVOICE_HOME_CACHE.history,months:{...INVOICE_HOME_CACHE.history.months,'2026-12':{sentDate:'2026-12-19',lastSentDate:'2026-12-21',count:2,messageId:'private-not-copied'}}}).months['2026-12'].messageId)).toBeUndefined();
});
