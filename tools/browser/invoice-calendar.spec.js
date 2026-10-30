const {test,expect}=require('@playwright/test');
test.use({viewport:{width:393,height:880},isMobile:true,hasTouch:true});
async function setup(page,scheduled=false){
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
 await page.evaluate(async scheduled=>{
  ST={'2027-02-19':{type:'festivo'},'2027-02-18':{type:'vacaciones'},'2027-02-17':{type:'ausencia'}};
  const c=invoiceDefaults();Object.assign(c,{issuer:'Persona de prueba',issuerTax:'TEST-ISSUER',client:'Cliente de prueba',clientTax:'TEST-CLIENT',project:'DEMO',rate:'320',kairoUrl:'https://synthetic.test.ts.net/facturas/'});
  invoiceSave({config:c,months:{}});
  INVOICE_HOME_CACHE={url:c.kairoUrl,periods:{'2027-02':{data:{state:scheduled?'scheduled':'draft',scheduledDate:scheduled?'2027-02-16':null,generated:true,issued:false,scheduled,sent:false,period:'2027-02'}}}};
  await openInvoiceMonth('2027-02');
 },scheduled);
}
test('mes visual con ausencias y envío previsto, sin eventos ni consultas al abrir',async({page},info)=>{
 let external=0;page.on('request',r=>{if(r.url().includes('.ts.net'))external++;});await setup(page);
 const before=await page.evaluate(()=>JSON.stringify(invoiceData().months));
 await expect(page.locator('#invoiceCalendar')).toContainText('Envío previsto · 16/02');
 await expect(page.locator('[data-date="2027-02-17"]')).toContainText('A');
 await expect(page.locator('[data-date="2027-02-18"]')).toContainText('V');
 await expect(page.locator('[data-date="2027-02-19"]')).toContainText('F');
 await expect(page.locator('#invoiceCalendar .delivery')).toHaveCount(1);
 for(const width of [320,393,440]){
  await page.setViewportSize({width,height:880});
  expect(await page.locator('.invoice-sheet').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect(await page.locator('.invoice-body').evaluate(el=>el.scrollTop)).toBe(0);
  const send=await page.locator('#invoiceKairoSend').boundingBox(),sheet=await page.locator('.invoice-sheet').boundingBox();
  expect(send.y+send.height).toBeLessThanOrEqual(sheet.y+sheet.height);
 }
 await page.setViewportSize({width:393,height:880});
 await page.screenshot({path:info.outputPath('invoice-calendar-planned.png'),animations:'disabled'});
 await page.getByRole('button',{name:'Mostrar importes',exact:true}).click();await expect(page.locator('#invoiceAmounts')).toBeVisible();
 await expect(page.locator('#invoiceAmounts')).toContainText('320,00');
 expect(await page.evaluate(()=>JSON.stringify(invoiceData().months))).toBe(before);expect(external).toBe(0);
});
test('fecha confirmada se conserva aunque cambie el calendario local; actualización sin recrear panel',async({page},info)=>{
 await setup(page,true);await expect(page.locator('#invoiceCalendar')).toContainText('Envío programado · 16/02');
 await page.screenshot({path:info.outputPath('invoice-calendar-scheduled.png'),animations:'disabled'});
 await page.evaluate(()=>{ST['2027-02-16']={type:'vacaciones'};paintInvoiceCalendar();});
 await expect(page.locator('#invoiceCalendar')).toContainText('difiere');
 await expect(page.locator('.delivery')).toHaveAttribute('data-date','2027-02-16');
 await expect(page.locator('.delivery')).toContainText('V');
 await expect(page.locator('.invoice-month-summary')).not.toHaveAttribute('open','');
 await page.evaluate(()=>{INVOICE_HOME_CACHE.periods['2027-02'].data={state:'sent',sent:true};paintHomeInvoiceStatus();});
 await expect(page.locator('#invoiceCalendar')).toContainText('Factura enviada');await expect(page.locator('#invoiceCalendar .delivery')).toHaveCount(0);
});
test('seis semanas y temas mantienen casillas y leyenda legibles',async({page},info)=>{
 await setup(page);await page.locator('#invoicePeriod').fill('2027-05');await page.locator('#invoicePeriod').dispatchEvent('change');
 await expect(page.locator('#invoiceCalendar tbody tr')).toHaveCount(6);await expect(page.locator('#invoiceCalendar [data-date]')).toHaveCount(31);
 for(const theme of ['dark','grey']){
  await page.evaluate(theme=>{applyTheme(theme);},theme);
  await page.screenshot({path:info.outputPath('invoice-calendar-'+theme+'.png'),animations:'disabled'});
  expect(await page.locator('#invoiceCalendar').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 }
});
