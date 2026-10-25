const {test,expect}=require('@playwright/test');
const fixture=require('../visual-map/fixture.cjs');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(data=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  for(const [key,value]of Object.entries(data))localStorage.setItem(key,JSON.stringify(value));
  localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
 },fixture());
 await page.goto('/');
 if(await page.locator('#homePopupClose').isVisible())await page.locator('#homePopupClose').click();
});
for(const width of [320,400,440])test(`P3: navegación, campos y Recordatorios en ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:880});
 await page.locator('#menuBtn').click();const reminders=page.locator('#settingsReminders');
 const reminderHeight=(await reminders.boundingBox()).height,themeHeight=(await page.locator('#themeBtn').boundingBox()).height;
 expect(reminderHeight).toBe(themeHeight);expect(themeHeight).toBeLessThanOrEqual(34);
 await reminders.click();await expect(page.locator('#homePopup')).toBeVisible();await page.locator('#homePopupClose').click();
 await page.locator('#estudioBtn').click();await expect(page.locator('#estudioOverlay')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
 await expect(page.locator('.study-intro h2')).toHaveText('Herramientas de comparación');
 for(const id of ['ecSubComp','ecSubSim','ecSubHip','ecSubGas','ecSubElect']){
  await page.locator('#'+id).click();await expect(page.locator('#'+id)).toHaveClass(/active/);
  expect((await page.locator('#'+id).boundingBox()).height).toBeGreaterThanOrEqual(44);
 }
 await page.locator('#estGearFiscal').click();await expect(page.locator('#fiscalOverlay')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
 await page.locator('#fiscalTabGastosDesg').click();const body=page.locator('#fiscalOverlay .sy-body'),save=page.locator('#fiscalSave');
 await expect(body.locator('h2')).toHaveText('Gastos desgravables');
 const sections=await body.locator(':scope > .fiscal-section').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));
 expect(sections[1].top-sections[0].bottom).toBeCloseTo(12,0);
 const frame=await page.locator('#fiscalOverlay').boundingBox(),footer=await save.boundingBox();
 const amount=body.locator('.fiscal-gasto-item').filter({hasText:'Cotizaciones sociales'}).locator('input');await amount.fill('321');
 await body.locator('.fiscal-gasto-item').filter({hasText:'Cotizaciones sociales'}).locator('[data-val="annual"]').click();
 await body.evaluate(el=>el.scrollTop=el.scrollHeight);expect(await save.boundingBox()).toEqual(footer);expect(await page.locator('#fiscalOverlay').boundingBox()).toEqual(frame);
 expect(await body.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await save.click();
 await expect(page.locator('#fiscalOverlay')).not.toHaveClass(/open/);await page.locator('#estGearFiscal').click();
 await page.locator('#fiscalTabGastosDesg').click();await expect(amount).toHaveValue('321');
 await expect(body.locator('.fiscal-gasto-item').filter({hasText:'Cotizaciones sociales'}).locator('[data-val="annual"]')).toHaveClass(/active/);
 await body.evaluate(el=>el.scrollTop=0);await page.screenshot({path:info.outputPath('fiscal.png'),animations:'disabled'});
});
for(const kind of ['gas','luz'])test(`Coste ${kind}: ausente, parcial, cero e IVA explícito`,async({page},info)=>{
 await page.evaluate(kind=>{energySaveTaxes([]);ENERGY_ANALYSIS_YEAR=2026;ENERGY_ANALYSIS_TAB='costes';ENERGY_COST_VAT='historical';openEnergyAnalysis(kind);},kind);
 await expect(page.locator('#energyAnalysisOverlay')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
 const before=await page.evaluate(()=>JSON.stringify(localStorage));
 await expect(page.locator('.energy-cost-chart')).toHaveCount(0);await expect(page.locator('.energy-cost-empty')).toContainText('IVA histórico pendiente');
 await page.screenshot({path:info.outputPath('coste-sin-iva.png'),animations:'disabled'});
 await page.locator('#energyVatCycle').click();await expect(page.locator('.energy-cost-chart')).toHaveCount(1);await expect(page.locator('.energy-tax-controls')).toContainText('Sin IVA');
 await page.locator('#energyVatCycle').click();await expect(page.locator('.energy-tax-controls')).toContainText('IVA cte');
 expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(before);
 await page.evaluate(kind=>{energySaveTaxes([{kind,start:'2026-01-01',rate:0}]);ENERGY_COST_VAT='historical';openEnergyAnalysis(kind);},kind);
 await expect(page.locator('.energy-cost-empty')).toHaveCount(0);await expect(page.locator('.energy-year-chart')).toContainText('8 de 12 meses calculables');
 await page.evaluate(kind=>{
  const bills=energyBills().filter(b=>b.kind===kind).map(b=>({...b,consumption:0}));
  const contract=energyContracts().find(c=>c.kind===kind);contract.analysis=energyTariffDefaults({precioKwh:0,terminoFijo:0,terminoFijoDia:0,precioPotP1:0,precioPotP2:0});
  energySaveContracts([contract]);energySaveBills(bills);openEnergyAnalysis(kind);
 },kind);
 await expect(page.locator('.energy-cost-empty')).toHaveCount(0);await expect(page.locator('.energy-cost-column .energy-bar-value').first()).toHaveText('0€');
 await page.evaluate(kind=>{
  const bills=energyBills().filter(b=>b.kind===kind);for(let m=9;m<=12;m++){const mm=String(m).padStart(2,'0'),last=new Date(2026,m,0).getDate();bills.push({...bills[0],id:'full-'+m,number:'FULL-'+m,start:'2026-'+mm+'-01',end:'2026-'+mm+'-'+last,issued:'2026-'+mm+'-'+last});}energySaveBills(bills);openEnergyAnalysis(kind);
 },kind);
 await expect(page.locator('.energy-cost-empty')).toHaveCount(0);await expect(page.locator('.energy-year-chart')).not.toContainText('de 12 meses calculables');
 await expect(page.locator('.energy-cost-column .energy-bar-value')).toHaveText(Array(12).fill('0€'));
});
