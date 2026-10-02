const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'));
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
  await page.goto('/');
});

test('consumo de 2026, aviso de pesos, plegado sin pérdida y precisión del impuesto',async({page})=>{
  await page.evaluate(()=>{
    energyImportHistory({energyBills:[{id:'usage-test',kind:'luz',supplier:'Ejemplo',number:'TEST',issued:'2026-02-02',start:'2026-01-01',end:'2026-01-31',consumption:310,net:50,gross:60.5,paid:null,notes:'',source:''}]});
    loadDespacho();DESPACHO.elect=energyTariffDefaults({otherTaxPct:5.11269632,ivaElect:21});
    DESPACHO.electComparaciones=[energyTariffDefaults({nombre:'Tarifa de prueba',useOwnPower:true,energyMode:'tramos',periodWeights:[20,30,50],periodPrices:[.2,.15,.1]})];saveDespacho();
    ECON_ESTUDIO_SUB='elect';openEstudio();
  });
  await expect(page.locator('[data-sidx="0"][data-sf="consumoKwh"]')).toHaveValue('300');
  await expect(page.locator('#estElectTax')).toHaveValue('5.1');
  await page.getByRole('button',{name:'+ Otro consumo',exact:true}).click();
  await expect(page.locator('[data-sidx="1"][data-sf="consumoKwh"]')).toHaveValue('250');
  const card=page.locator('[data-electric-card="0"]'),weight=card.getByLabel('Punta · peso %',{exact:true});
  await weight.fill('10');await expect(card.locator('[data-electric-weight-warning]')).toContainText('90 %');
  await card.locator('[data-electric-collapse]').click();await expect(card.locator('.electric-card-body')).toBeHidden();
  await card.locator('[data-electric-collapse]').click();await expect(weight).toHaveValue('10');
  await weight.fill('20');await expect(card.locator('[data-electric-weight-warning]')).toBeHidden();
  await card.locator('[data-electric-collapse]').click();
  await page.getByRole('button',{name:'Comparar 1 tarifa',exact:true}).click();
  await expect(card.locator('.electric-card-body')).toBeHidden();
  await expect(page.locator('.electric-results')).toBeVisible();
  expect(await page.evaluate(()=>electricComparisonTaxes().other)).toBe(5.11269632);
  await page.locator('#estElectTax').fill('4.8');await page.locator('#estElectTax').press('Tab');
  await page.getByRole('button',{name:'Comparar 1 tarifa',exact:true}).click();
  expect(await page.evaluate(()=>electricComparisonTaxes().other)).toBe(4.8);
});

test('gas con tres precios en fila y análisis de hipoteca desde ambas ventanas',async({page})=>{
  await page.evaluate(()=>{
    loadDespacho();DESPACHO.compra=Object.assign(_defaultCompra(),{importePrestamo:120000,tipoInteres:3,plazoAnios:20,fechaInicio:'2024-01-01',entidadBanco:'Banco de prueba'});
    DESPACHO.gas={modo:'consumo',activo:'consumo',ivaGas:21,consumo:{precioKwh:.067,terminoFijoDia:.12,terminoFijo:6,comercializadora:'Gas de prueba'},fijo:{cuotaFija:40}};saveDespacho();openHousehold('gas');
  });
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    const prices=await page.locator('.household-gas-option.is-current .energy-price-pair').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,overflow:e.scrollWidth-e.clientWidth};}));
    expect(prices).toHaveLength(3);expect(new Set(prices.map(p=>p.top)).size).toBe(1);expect(Math.max(...prices.map(p=>p.overflow))).toBeLessThanOrEqual(1);
  }
  await page.locator('#gasActivoFijo').click();await expect(page.locator('.household-gas-option.is-current')).toContainText('Cuota fija');
  await expect(page.locator('.household-active-badge')).toHaveText('✓ En uso');
  for(const fiscal of [false,true])for(const tab of ['resumen','detalle']){
    await page.evaluate(({fiscal,tab})=>{closeEcon();if(fiscal){FISCAL_TAB='despacho';FISCAL_HIP_SUB=tab;openFiscal(2026);}else openHousehold(tab);},{fiscal,tab});
    const host=page.locator(fiscal?'#fiscalOverlay':'#householdOverlay');
    await host.locator('#hipGoAnalisis').click();
    await expect(page.locator('#econOverlay')).toHaveClass(/open/);
    await expect(page.locator('#analisisSubHipoteca')).toHaveClass(/active/);
  }
});
