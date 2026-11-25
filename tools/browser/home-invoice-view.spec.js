const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
// Factura enviada o programada sin cambios: «Ver factura» abre el mismo panel del mes.
for(const state of ['sent','scheduled'])test('Ver factura con la factura '+state,async({page})=>{
  await page.clock.setFixedTime(new Date('2026-11-25T12:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');});
  await page.route('https://view-fixture.test.ts.net/**',r=>r.abort());
  await page.goto('/');
  await page.evaluate(state=>{
    invoiceSave(Object.assign(invoiceData(),{config:Object.assign(invoiceData().config,{kairoUrl:'https://view-fixture.test.ts.net/facturas/'})}));
    const p=mkey(CY,CM);INVOICE_HOME_CACHE={schema:1,url:invoiceData().config.kairoUrl,periods:{}};
    const date=homeInvoiceScheduleDate(CY,CM);
    INVOICE_HOME_CACHE.periods[p]={attempted:true,dueChecked:true,checkedAt:Date.now(),data:{period:p,state,generated:true,issued:true,scheduled:true,sent:state==='sent',scheduledDate:date,sentDate:state==='sent'?date:null}};
    paintHomeInvoiceStatus();
  },state);
  const panel=page.locator('#homeInvoiceStatus');
  await expect(panel.locator('[data-home-invoice="view"]')).toHaveAccessibleName('Ver factura');
  await panel.locator('[data-home-invoice="view"]').click();
  await expect(page.locator('#invoicePeriod')).toHaveText(await page.evaluate(()=>invoiceLabel(mkey(CY,CM))));
  await expect(page.locator('.invoice-month-summary')).toBeVisible();
});
