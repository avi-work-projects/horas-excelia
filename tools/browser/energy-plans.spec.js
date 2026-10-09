const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
  await page.goto('/');
});
test('Total alterna el histórico en luz y gas sin duplicar una factura entre años',async({page})=>{
  for(const kind of ['luz','gas']){
    await page.evaluate(kind=>{
      energyImportHistory({energyBills:[{id:'test-total-'+kind,kind,supplier:'Ejemplo',number:'TOTAL',issued:'2026-01-20',start:'2025-12-16',end:'2026-01-15',consumption:310.75,net:50,gross:60.5,vatAmount:10.5,paid:null,notes:'',source:''}]});
      ENERGY_ANALYSIS_YEAR=2026;ENERGY_SUMMARY_TOTAL=false;ENERGY_ANALYSIS_TAB='resumen';openEnergyAnalysis(kind);
    },kind);
    await expect(page.locator('.energy-overview')).toContainText('150 kWh');
    await page.getByRole('button',{name:'Total',exact:true}).click();
    await expect(page.locator('.energy-overview')).toContainText('311 kWh');
    await expect(page.locator('.energy-overview')).toContainText('Histórico completo');
    await expect(page.locator('.energy-tax-totals')).toContainText('10,50 €');
    await expect(page.locator('.energy-year-selector')).toBeHidden();
    await page.getByRole('button',{name:'Total',exact:true}).click();
    await expect(page.getByRole('button',{name:'Total',exact:true})).toHaveAttribute('aria-pressed','false');
    await expect(page.locator('.energy-year-selector')).toBeVisible();
    await expect(page.locator('.energy-overview')).toContainText('150 kWh');
    await page.getByRole('button',{name:'Año anterior',exact:true}).click();
    await expect(page.locator('.energy-overview')).toContainText('160 kWh');
    await page.getByRole('button',{name:'Volver',exact:true}).click();
    await expect(page.locator('#energyAnalysisOverlay')).toHaveCount(0);
  }
});
test('tarifa histórica editable, pesos por tarjeta, potencia y cuota fija; conserva el contrato original',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.evaluate(()=>{
    const tariff=energyTariffDefaults({energyMode:'tramos',periodPrices:[.3,.2,.1],periodWeights:[20,30,50],potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:3.3,precioPotP1:.08,precioPotP2:.02});
    energyImportHistory({energyContracts:[{id:'copy-test',kind:'luz',supplier:'Tarifa anterior',tariff:'Tres tramos',start:'2025-01-01',end:'2025-12-31',supply:'Vivienda',commitment:'',notes:'',source:'',taxes:'excluidos',prices:[],analysis:tariff}]});
    loadDespacho();DESPACHO.electComparaciones=[];saveDespacho();ECON_ESTUDIO_SUB='elect';openEstudio();
  });
  await page.getByRole('button',{name:'+ Añadir tarifa',exact:true}).click();
  const card=page.locator('[data-electric-card="0"]');
  await card.locator('.electric-source summary').click();
  await card.getByRole('button',{name:/Tarifa anterior Tres tramos/}).click();
  await expect(card.getByRole('button',{name:'3 tramos',exact:true})).toHaveAttribute('aria-pressed','true');
  await card.getByLabel('Punta · peso %',{exact:true}).fill('20');
  await card.getByLabel('Llano · peso %',{exact:true}).fill('30');
  await card.getByLabel('Valle · peso %',{exact:true}).fill('50');
  await expect(card.locator('[data-electric-weighted]')).toHaveText('0,17 €/kWh');
  await expect(card.locator('.electric-power')).toBeVisible();
  await card.getByLabel('Potencia P1 · kW',{exact:true}).fill('4.6');
  await page.getByRole('button',{name:'Comparar 1 tarifa',exact:true}).click();
  await expect(page.locator('.electric-results')).toContainText('Tarifa anterior');
  expect(await page.evaluate(()=>DESPACHO.electComparaciones[0].potenciaP1)).toBe(4.6);
  expect(await page.evaluate(()=>energyContracts()[0].analysis.potenciaP1)).toBe(3.3);
  await card.getByRole('button',{name:'Cuota fija',exact:true}).click();
  await card.getByLabel('Cuota mensual · €',{exact:true}).fill('40');
  await page.getByRole('button',{name:'Comparar 1 tarifa',exact:true}).click();
  await expect(page.locator('.electric-results')).toContainText('48,40€');
  await card.getByRole('checkbox',{name:'Comparar',exact:true}).uncheck();
  await expect(page.locator('#estElectCalc')).toBeDisabled();
  await card.getByRole('checkbox',{name:'Comparar',exact:true}).check();
  await page.reload();
  await page.evaluate(()=>{ECON_ESTUDIO_SUB='elect';openEstudio();});
  await expect(card.getByRole('button',{name:'Cuota fija',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(card.getByLabel('Cuota mensual · €',{exact:true})).toHaveValue('40');
  expect(errors).toEqual([]);
});
test('precios finales, identidad de compañía, espacio entre campos y recordatorio permanente',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.evaluate(()=>{
    loadDespacho();DESPACHO.elect=energyTariffDefaults({precioKwh:.1,ivaElect:21,otherTaxPct:5.11});
    DESPACHO.electComparaciones=[energyTariffDefaults({nombre:'',precioKwh:.1,precioPotP1:.08,precioPotP2:.02,useOwnPower:true})];saveDespacho();ECON_ESTUDIO_SUB='elect';openEstudio();
  });
  const card=page.locator('[data-electric-card="0"]');
  await card.getByLabel('Nombre de la tarifa 1',{exact:true}).fill('Compañía de prueba');
  await expect(card.locator('[data-electric-source-label]')).toHaveText('Compañía de prueba');
  const gap=await card.evaluate(el=>el.querySelector('.electric-source').getBoundingClientRect().top-el.querySelector('.electric-name').getBoundingClientRect().bottom);
  expect(gap).toBeGreaterThanOrEqual(10);
  await card.getByRole('button',{name:'Con impuestos',exact:true}).click();
  await expect(card.getByLabel('Precio · €/kWh',{exact:true})).toHaveValue('0.1271831');
  await card.getByLabel('Precio · €/kWh',{exact:true}).fill('0.2543662');
  await card.getByRole('button',{name:'Sin impuestos',exact:true}).click();
  await expect(card.getByLabel('Precio · €/kWh',{exact:true})).toHaveValue('0.2');
  await card.getByRole('button',{name:'Con impuestos',exact:true}).click();
  await page.getByRole('button',{name:'Comparar 1 tarifa',exact:true}).click();
  const result=await page.locator('.electric-results').textContent();
  await card.getByRole('button',{name:'Sin impuestos',exact:true}).click();
  await page.getByRole('button',{name:'Comparar 1 tarifa',exact:true}).click();
  await expect(page.locator('.electric-results')).toHaveText(result);
  expect(await page.evaluate(()=>DESPACHO.electComparaciones[0].precioKwh)).toBeCloseTo(.2,12);
  await page.reload();await page.evaluate(()=>{ECON_ESTUDIO_SUB='elect';openEstudio();});
  await expect(card.getByLabel('Nombre de la tarifa 1',{exact:true})).toHaveValue('Compañía de prueba');
  expect(await page.evaluate(()=>tasksNormalize({items:[],weeklyReminder:false,reminderWeek:''}).weeklyReminder)).toBe(true);
  expect(errors).toEqual([]);
});
test('autotítulos, planes fijos y símbolos anteriores compatibles',async({page})=>{
  await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
  const form=page.locator('#evFWrap'),title=page.locator('#evFTitle');
  for(const type of ['Llamada','Peluquería','Médico','Cena','Tomar algo','Montaña','Plan romántico','Comida','Salir de fiesta','Copas','Barbacoa']){
    const option=page.locator('#evFTypePicker').getByRole('button',{name:type,exact:true});
    if(await option.count())await option.click();
    else {await page.locator('[data-picker="'+(['Peluquería','Médico'].includes(type)?'management':'plans')+'"]').click();await page.locator('#evPlanPickerOv').getByRole('button',{name:type,exact:true}).click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);}
    await expect(title).toHaveValue(type);await expect(page.locator('#evFColorSection')).toBeHidden();
  }
  await title.fill('Mi título');await page.locator('#evFTypePicker').getByRole('button',{name:'Cena',exact:true}).click();
  await expect(title).toHaveValue('Mi título');await page.locator('#evFSave').click();
  expect(await page.evaluate(()=>EVENTS[EVENTS.length-1].type)).toBe('Cena');
  await page.locator('#evAdd').click();await page.locator('#evFTypePicker').getByRole('button',{name:'Otros',exact:true}).click();
  await expect(page.locator('#evFShapePicker [data-shape="rings"]')).toHaveCount(1);
  await expect(page.locator('#evFShapePicker [data-shape="cloud"],#evFShapePicker [data-shape="beer"],#evFShapePicker [data-shape="mountain"],#evFShapePicker [data-shape="square"]')).toHaveCount(0);
  await page.locator('#evFShapePicker [data-shape="gym"]').click();await expect(page.locator('#evFColorSection')).toBeHidden();
  await expect(page.locator('#evFShapePicker [data-shape="gym"] .ev-shape-preview > svg > rect')).toHaveAttribute('fill','#fff');
  await page.locator('#evFShapePicker [data-shape="planet"]').click();await expect(page.locator('#evFColorSection')).toBeVisible();
  const preserved=await page.evaluate(()=>evMarkerHtml({id:'old-beer',kind:'puntual',type:'Otros',shape:'beer',color:'#ffcc00'},false,18));
  expect(preserved).toContain('ev-shape-beer');
});
