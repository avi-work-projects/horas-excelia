/* Comparador eléctrico: copias editables, nunca modifica los contratos importados. */
function energyHistoricalTariffs(kind){
  var options=[];energyContracts().filter(function(c){return c.kind===kind;}).forEach(function(c){
    energyCommercialPeriods(c).filter(function(p){return !!p.start;}).forEach(function(p){
      options.push({id:c.id+'|'+p.start,start:p.start,end:p.end,name:c.supplier+' · '+p.start,supplier:c.supplier,label:c.tariff,tariff:energyTariffDefaults(p.tariff)});
    });
  });return options.sort(function(a,b){return b.start.localeCompare(a.start);});
}
function electricComparisonTariff(source,current){
  var t=energyComparisonDefaults(source,'luz');
  if(source&&!source.useOwnPower)['potenciaP1','potenciaP2','potenciaTotal'].forEach(function(k){t[k]=current[k]==null?3.3:current[k];});
  t.useOwnPower=true;t.servicesPerDay=0;
  if(t.precioPot&&!t.precioPotP1)t.precioPotP1=t.precioPot;
  return t;
}
function electricHistoricalCopy(option,old){
  var t=electricComparisonTariff(Object.assign({},option.tariff,{useOwnPower:true}),{});
  t.nombre=option.supplier;t.comercializadora=option.supplier;t.sourceLabel=option.name;
  t.includeInComparison=!old||old.includeInComparison!==false;
  t.periodWeights=energyUsageProfile('luz').weights.slice();
  if(t.energyMode==='tramos')t.precioKwh=energyWeightedPrice(t);
  return t;
}
function electricModesHtml(t){
  var selected=t.modo==='fijo'?'fijo':t.energyMode;
  return '<div class="electric-modes" role="group" aria-label="Precio del consumo">'+[['unico','Precio único'],['tramos','3 tramos'],['fijo','Cuota fija']].map(function(m){return '<button type="button" data-electric-mode="'+m[0]+'" aria-pressed="'+(selected===m[0])+'">'+m[1]+'</button>';}).join('')+'</div>';
}
function electricTariffFieldsHtml(t,taxes){
  var basis=t.priceInputMode==='gross'?'con impuestos':'sin impuestos';
  var h='<div class="electric-input-basis"><span>Introducir precios</span><div class="electric-modes">';
  [['net','Sin impuestos'],['gross','Con impuestos']].forEach(function(x){h+='<button type="button" data-electric-basis="'+x[0]+'" aria-pressed="'+((t.priceInputMode||'net')===x[0])+'">'+x[1]+'</button>';});
  h+='</div></div><section class="electric-field-section"><h4>Consumo <small>'+basis+'</small></h4>'+electricModesHtml(t);
  h+='<div data-electric-flat'+(t.modo==='fijo'?'':' hidden')+'>'+electricInputField(t,'cuotaFija','Cuota mensual · €',t.cuotaFija,taxes)+'</div>';
  h+='<div data-electric-usage'+(t.modo==='fijo'?' hidden':'')+'><div data-electric-single'+(t.energyMode==='tramos'?' hidden':'')+'>'+electricInputField(t,'precioKwh','Precio · €/kWh',t.precioKwh,taxes)+'</div>';
  var weights=energyDisplayWeights(t.periodWeights);
  h+='<div data-electric-periods'+(t.energyMode==='tramos'?'':' hidden')+'><div class="electric-period-head"><span>Tramo</span><span>€/kWh</span><span>Peso %</span></div>';
  ['Punta','Llano','Valle'].forEach(function(n,i){h+='<div class="electric-period-row energy-period-'+i+'"><b>'+n+'</b>'+electricInputField(t,'price'+i,n+' · €/kWh',t.periodPrices[i],taxes)+energyNumericField('weight'+i,n+' · peso %',weights[i],1)+'</div>';});
  h+='<div class="electric-weighted"><span>Media ponderada</span><b data-electric-weighted>'+energyUnitPrice(electricInputValue(t,'precioKwh',energyWeightedPrice(t),taxes,false))+' €/kWh</b></div><button type="button" class="electric-link" data-electric-weights>Usar reparto de mis facturas</button></div></div></section>';
  h+='<section class="electric-power electric-field-section"'+(t.modo==='fijo'?' hidden':'')+'><h4>Potencia <small>'+basis+'</small></h4><div class="electric-modes">';
  [['doble','P1 + P2'],['simple','Un precio']].forEach(function(x){h+='<button type="button" data-electric-power="'+x[0]+'" aria-pressed="'+(t.modoPotencia===x[0])+'">'+x[1]+'</button>';});h+='</div><div class="electric-fields">';
  var keys=t.modoPotencia==='doble'?[['potenciaP1','Potencia P1 · kW'],['potenciaP2','Potencia P2 · kW'],['precioPotP1','Precio P1 · €/kW/día'],['precioPotP2','Precio P2 · €/kW/día']]:[['potenciaTotal','Potencia · kW'],['precioPotP1','Precio · €/kW/día']];
  keys.forEach(function(p){h+=/^potencia/.test(p[0])?energyNumericField(p[0],p[1],t[p[0]]):electricInputField(t,p[0],p[1],t[p[0]],taxes);});h+='</div></section>';
  h+='<section class="electric-extras electric-field-section"'+(t.modo==='fijo'?' hidden':'')+'><h4>Cargos fijos <small>'+basis+'</small></h4><div class="electric-fields">'+electricInputField(t,'terminoFijo','Fijo · €/mes',t.terminoFijo,taxes)+electricInputField(t,'fixedDay','Fijo · €/día',electricFixedDay(t,taxes),taxes)+'</div></section>';
  return h+'<p class="electric-card-error" role="status"></p>';
}
function electricComparisonCard(c,i,current,options,taxes){
  var t=electricComparisonTariff(c,current),tone=ELECTRIC_COMPARISON_COLORS[i%5];
  var h='<article class="electric-card" data-electric-card="'+i+'" style="--electric-tone:'+tone+'"><div class="electric-card-heading"><label class="electric-check"><input type="checkbox" data-electric-include'+(t.includeInComparison!==false?' checked':'')+'>Comparar</label><button type="button" class="electric-remove" data-electric-delete aria-label="Quitar tarifa '+(i+1)+'">×</button></div>';
  h+='<div class="electric-identity"><label class="electric-company-label">Compañía<input class="electric-name" name="nombre" aria-label="Nombre de la tarifa '+(i+1)+'" placeholder="Nombre de la compañía" value="'+escHtml(t.nombre||t.comercializadora||'')+'"></label>';
  h+='<details class="electric-source"><summary><span data-electric-source-label>'+escHtml(t.sourceLabel||t.comercializadora||t.nombre||'Tarifa personalizada')+'</span><b>Elegir tarifa ⌄</b></summary><div><button type="button" data-electric-source="current">Copiar mi tarifa actual</button><button type="button" data-electric-source="custom">Nueva tarifa personalizada</button>';
  options.forEach(function(o,j){h+='<button type="button" data-electric-source="'+j+'"><b>'+escHtml(o.supplier)+'</b><span>'+escHtml(o.label)+'</span><small>'+_rutFmt(o.start)+(o.end?' – '+_rutFmt(o.end):' · actual')+'</small></button>';});
  return h+'</div></details></div>'+electricTariffFieldsHtml(t,taxes)+'</article>';
}
function electricConsumptionScenariosHtml(taxes){
  var h='<section class="electric-scenarios"><div class="electric-section-title"><h3>Consumo a comparar</h3></div>';
  ESTUDIO_ELECT_SCENARIOS.forEach(function(sc,i){h+='<div class="electric-scenario"><input class="est-sc-name" data-stipo="elect" data-sidx="'+i+'" aria-label="Nombre del escenario '+(i+1)+'" value="'+escHtml(sc.nombre||'Escenario '+(i+1))+'"><label>kWh<input class="est-sc-f" data-stipo="elect" data-sidx="'+i+'" data-sf="consumoKwh" type="number" min="0" step="any" value="'+sc.consumoKwh+'"></label><label>Días<input class="est-sc-f" data-stipo="elect" data-sidx="'+i+'" data-sf="dias" type="number" min="1" step="1" value="'+sc.dias+'"></label>'+(ESTUDIO_ELECT_SCENARIOS.length>1?'<button class="est-sc-del electric-remove" data-stipo="elect" data-sidx="'+i+'" aria-label="Quitar escenario">×</button>':'')+'</div>';});
  if(ESTUDIO_ELECT_SCENARIOS.length<3)h+='<button class="electric-link" id="estElectAddSc">+ Otro consumo</button>';
  h+='<div class="electric-tax-settings"><label>IVA <span><input id="estElectIva" type="number" min="0" max="100" step="any" value="'+taxes.vat+'"> %</span></label><label>Impuesto eléctrico <span><input id="estElectTax" type="number" min="0" max="100" step="any" value="'+taxes.other+'"> %</span></label><small>El impuesto eléctrico se aplica antes del IVA.</small></div>';
  return h+'</section>';
}
function electricUsageYearsHtml(){
  var years=electricUsageYears('luz'),h='<section class="electric-usage-history"><h3>Tu consumo mensual</h3><div>';
  years.forEach(function(y){h+='<article><span>'+y.year+'</span><b>'+(y.monthly==null?'—':Math.round(y.monthly))+' <small>kWh</small></b><small>'+y.months+(y.months===1?' mes':' meses')+' con lecturas</small></article>';});
  if(!years.length)h+='<p>Sin lecturas importadas.</p>';
  return h+'</div><small>Media equivalente a 30 días, calculada solo con días documentados.</small></section>';
}
function renderElectricityComparison(){
  loadDespacho();var e=electricComparisonTariff(Object.assign({},_currentElectTariff(),{useOwnPower:true}),{}),comps=DESPACHO.electComparaciones||[],options=energyHistoricalTariffs('luz'),taxes=electricComparisonTaxes();
  var net=e.modo==='fijo'?e.cuotaFija:energyWeightedPrice(e),gross=e.modo==='fijo'?energyTariffGross(e,'luz',0,30,30,e.ivaElect==null?21:e.ivaElect):energyTaxPrice(e,net,e.ivaElect==null?21:e.ivaElect,true);
  var h='<div class="electric-comparator"><section class="electric-current"><div><small>Tu referencia actual</small><h3>'+escHtml(e.comercializadora||'Tarifa actual')+'</h3></div><button class="electric-link" id="estElectGoDetail">Ver detalle</button><div class="electric-reference-prices">'+energyPricePair(e.modo==='fijo'?'Cuota mensual':'Consumo medio',net,gross,e.modo==='fijo'?'/mes':'€/kWh','',e.modo==='fijo');
  if(e.modo!=='fijo'){var p=e.precioPotP1+(e.modoPotencia==='doble'?e.precioPotP2:0);h+=energyPricePair('Suma potencia',p,energyTaxPrice(e,p,e.ivaElect==null?21:e.ivaElect,false),'€/kW/día');}
  h+='</div></section>'+electricConsumptionScenariosHtml(taxes)+electricUsageYearsHtml()+'<div class="electric-section-title"><h3>Elige tus tarifas</h3><span>'+comps.length+' / 5</span></div><div class="electric-cards">';
  comps.forEach(function(c,i){h+=electricComparisonCard(c,i,e,options,taxes);});h+='</div>';
  if(comps.length<5)h+='<button class="ev-io-btn electric-add" id="estElectAdd">+ Añadir tarifa</button>';
  var selected=comps.filter(function(c){return c.includeInComparison!==false;});
  h+='<button class="econ-calc-btn" id="estElectCalc"'+(!selected.length?' disabled':'')+'>Comparar '+selected.length+' tarifa'+(selected.length===1?'':'s')+'</button>';
  if(ESTUDIO_ELECT_CALC&&selected.length)h+='<section class="electric-results"><h3>Resultado <small>IVA '+taxes.vat+' % · impuesto eléctrico '+String(taxes.other).replace('.',',')+' %</small></h3>'+_renderMultiScenarioResult(ESTUDIO_ELECT_SCENARIOS,selected.map(function(c){return electricComparisonApplied(electricComparisonTariff(c,e),taxes);}), 'elect',electricComparisonApplied(e,taxes),taxes.vat)+'</section>';
  return h+'</div>';
}
