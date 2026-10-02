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
function electricTariffFieldsHtml(t){
  var h=electricModesHtml(t);
  h+='<div data-electric-flat'+(t.modo==='fijo'?'':' hidden')+'>'+energyNumericField('cuotaFija','Cuota mensual sin IVA (€)',t.cuotaFija)+'</div>';
  h+='<div data-electric-usage'+(t.modo==='fijo'?' hidden':'')+'><div data-electric-single'+(t.energyMode==='tramos'?' hidden':'')+'>'+energyNumericField('precioKwh','Consumo · €/kWh sin impuestos',t.precioKwh)+'</div>';
  var weights=energyDisplayWeights(t.periodWeights);
  h+='<div data-electric-periods'+(t.energyMode==='tramos'?'':' hidden')+'><div class="electric-period-head"><span>Tramo</span><span>€/kWh</span><span>Peso %</span></div>';
  ['Punta','Llano','Valle'].forEach(function(n,i){h+='<div class="electric-period-row energy-period-'+i+'"><b>'+n+'</b>'+energyNumericField('price'+i,n+' · €/kWh',t.periodPrices[i])+energyNumericField('weight'+i,n+' · peso %',weights[i],1)+'</div>';});
  h+='<div class="electric-weighted"><span>Media ponderada</span><b data-electric-weighted>'+energyUnitPrice(energyWeightedPrice(t))+' €/kWh</b></div><button type="button" class="electric-link" data-electric-weights>Usar reparto de mis facturas</button></div>';
  h+='<details class="electric-power"><summary>Potencia <span>'+(t.modoPotencia==='doble'?t.potenciaP1+' / '+t.potenciaP2:t.potenciaTotal)+' kW · editar</span></summary><div class="electric-modes">';
  [['doble','P1 + P2'],['simple','Un precio']].forEach(function(x){h+='<button type="button" data-electric-power="'+x[0]+'" aria-pressed="'+(t.modoPotencia===x[0])+'">'+x[1]+'</button>';});h+='</div><div class="electric-fields">';
  var powerKeys=t.modoPotencia==='doble'?[['potenciaP1','Potencia P1 · kW'],['potenciaP2','Potencia P2 · kW'],['precioPotP1','Precio P1 · €/kW/día'],['precioPotP2','Precio P2 · €/kW/día']]:[['potenciaTotal','Potencia · kW'],['precioPotP1','Precio · €/kW/día']];
  powerKeys.forEach(function(p){h+=energyNumericField(p[0],p[1],t[p[0]]);});h+='</div></details></div>';
  h+='<details class="electric-extras"><summary>Cargos e impuestos adicionales</summary><div class="electric-fields">';
  [['terminoFijo','Fijo · €/mes'],['terminoFijoDia','Fijo · €/día'],['extrasPerDay','Alquiler / otros · €/día'],['otherTaxPct','Impuesto eléctrico · %'],['otherTaxKwh','Otros impuestos · €/kWh']].forEach(function(p){h+=energyNumericField(p[0],p[1],t[p[0]]||0);});
  return h+'</div></details><p class="electric-card-error" role="status"></p>';
}
function electricComparisonCard(c,i,current,options){
  var t=electricComparisonTariff(c,current),h='<article class="electric-card" data-electric-card="'+i+'"><div class="electric-card-heading"><label class="electric-check"><input type="checkbox" data-electric-include'+(t.includeInComparison!==false?' checked':'')+'>Comparar</label><button type="button" class="electric-remove" data-electric-delete aria-label="Quitar tarifa '+(i+1)+'">×</button></div>';
  h+='<input class="electric-name" name="nombre" aria-label="Nombre de la tarifa '+(i+1)+'" value="'+escHtml(t.nombre||'Tarifa '+(i+1))+'">';
  h+='<details class="electric-source"><summary><span>'+escHtml(t.sourceLabel||'Tarifa personalizada')+'</span><b>Elegir tarifa ⌄</b></summary><div><button type="button" data-electric-source="current">Copiar mi tarifa actual</button><button type="button" data-electric-source="custom">Nueva tarifa personalizada</button>';
  options.forEach(function(o,j){h+='<button type="button" data-electric-source="'+j+'"><b>'+escHtml(o.supplier)+'</b><span>'+escHtml(o.label)+'</span><small>'+_rutFmt(o.start)+(o.end?' – '+_rutFmt(o.end):' · actual')+'</small></button>';});
  return h+'</div></details>'+electricTariffFieldsHtml(t)+'</article>';
}
function electricConsumptionScenariosHtml(iva){
  var h='<section class="electric-scenarios"><div class="electric-section-title"><h3>Consumo a comparar</h3><label>IVA % <input id="estElectIva" type="number" min="0" max="100" step="any" value="'+iva+'"></label></div>';
  ESTUDIO_ELECT_SCENARIOS.forEach(function(sc,i){h+='<div class="electric-scenario"><input class="est-sc-name" data-stipo="elect" data-sidx="'+i+'" aria-label="Nombre del escenario '+(i+1)+'" value="'+escHtml(sc.nombre||'Escenario '+(i+1))+'"><label>kWh<input class="est-sc-f" data-stipo="elect" data-sidx="'+i+'" data-sf="consumoKwh" type="number" min="0" step="any" value="'+sc.consumoKwh+'"></label><label>Días<input class="est-sc-f" data-stipo="elect" data-sidx="'+i+'" data-sf="dias" type="number" min="1" step="1" value="'+sc.dias+'"></label>'+(ESTUDIO_ELECT_SCENARIOS.length>1?'<button class="est-sc-del electric-remove" data-stipo="elect" data-sidx="'+i+'" aria-label="Quitar escenario">×</button>':'')+'</div>';});
  if(ESTUDIO_ELECT_SCENARIOS.length<3)h+='<button class="electric-link" id="estElectAddSc">+ Otro consumo</button>';
  return h+'</section>';
}
function renderElectricityComparison(){
  loadDespacho();var e=electricComparisonTariff(Object.assign({},_currentElectTariff(),{useOwnPower:true}),{}),comps=DESPACHO.electComparaciones||[],options=energyHistoricalTariffs('luz');
  var iva=ESTUDIO_ELECT_IVA==null?(e.ivaElect==null?21:e.ivaElect):ESTUDIO_ELECT_IVA;
  var h='<div class="electric-comparator"><section class="electric-current"><div><small>Tu referencia actual</small><h3>'+escHtml(e.comercializadora||'Tarifa actual')+'</h3></div><button class="electric-link" id="estElectGoDetail">Ver detalle</button><strong>'+(e.modo==='fijo'?energyNumber(e.cuotaFija,'€')+'/mes':energyUnitPrice(energyWeightedPrice(e))+' €/kWh')+'</strong><span>Sin impuestos · sin servicios adicionales</span></section>';
  h+=electricConsumptionScenariosHtml(iva)+'<div class="electric-section-title"><h3>Elige tus tarifas</h3><span>'+comps.length+' / 5</span></div><div class="electric-cards">';
  comps.forEach(function(c,i){h+=electricComparisonCard(c,i,e,options);});h+='</div>';
  if(comps.length<5)h+='<button class="ev-io-btn electric-add" id="estElectAdd">+ Añadir tarifa</button>';
  var selected=comps.filter(function(c){return c.includeInComparison!==false;});
  h+='<button class="econ-calc-btn" id="estElectCalc"'+(!selected.length?' disabled':'')+'>Comparar '+selected.length+' tarifa'+(selected.length===1?'':'s')+'</button>';
  if(ESTUDIO_ELECT_CALC&&selected.length)h+='<section class="electric-results"><h3>Resultado <small>IVA '+iva+' % incluido</small></h3>'+_renderMultiScenarioResult(ESTUDIO_ELECT_SCENARIOS,selected.map(function(c){return electricComparisonTariff(c,e);}), 'elect',e,iva)+'</section>';
  return h+'</div>';
}
function bindElectricComparisonCard(card,draft,index,options,refresh){
  function validate(){
    try{energyValidateTariff(draft);card.querySelector('.electric-card-error').textContent='';return true;}
    catch(e){card.querySelector('.electric-card-error').textContent=e.message;return false;}
  }
  function save(){if(validate()){DESPACHO.electComparaciones[index]=energyTariffDefaults(draft);saveDespacho();}}
  card.oninput=function(event){var el=event.target,key=el.name;if(!key)return;
    if(/^weight[0-2]$/.test(key))draft.periodWeights=[0,1,2].map(function(i){var value=card.querySelector('[name="weight'+i+'"]').value;return value===''?NaN:Number(value);});
    else if(/^price[0-2]$/.test(key))draft.periodPrices[+key.slice(-1)]=el.value===''?NaN:Number(el.value);
    else draft[key]=el.type==='number'?(el.value===''?NaN:Number(el.value)):el.value;
    if(draft.energyMode==='tramos')draft.precioKwh=energyWeightedPrice(draft);
    card.querySelector('[data-electric-weighted]').textContent=energyUnitPrice(energyWeightedPrice(draft))+' €/kWh';
    ESTUDIO_ELECT_CALC=false;var results=document.querySelector('.electric-results');if(results)results.remove();save();
  };
  card.querySelector('[data-electric-include]').onchange=function(e){draft.includeInComparison=e.target.checked;save();refresh();};
  card.querySelector('[data-electric-delete]').onclick=function(){DESPACHO.electComparaciones.splice(index,1);saveDespacho();refresh(true);};
  card.querySelectorAll('[data-electric-mode],[data-electric-power]').forEach(function(b){b.onclick=function(){if(!validate())return;if(b.dataset.electricPower)draft.modoPotencia=b.dataset.electricPower;else{draft.modo=b.dataset.electricMode==='fijo'?'fijo':'consumo';if(draft.modo!=='fijo')draft.energyMode=b.dataset.electricMode;}save();refresh();};});
  card.querySelector('[data-electric-weights]').onclick=function(){var p=energyUsageProfile('luz');draft.periodWeights=p.weights.slice();energyDisplayWeights(p.weights).forEach(function(v,i){card.querySelector('[name="weight'+i+'"]').value=v;});draft.precioKwh=energyWeightedPrice(draft);save();refresh();};
  card.querySelectorAll('[data-electric-source]').forEach(function(b){b.onclick=function(){
    var key=b.dataset.electricSource,next;
    if(key==='custom')next=energyComparisonDefaults({nombre:'Tarifa personalizada',includeInComparison:draft.includeInComparison,useOwnPower:true},'luz');
    else next=electricHistoricalCopy(key==='current'?{tariff:_currentElectTariff(),name:'Tarifa actual',supplier:_currentElectTariff().comercializadora||'Tarifa actual'}:options[+key],draft);
    DESPACHO.electComparaciones[index]=next;saveDespacho();refresh(true);
  };});
  return validate;
}
function bindElectricityComparison(){
  var root=document.querySelector('.electric-comparator');if(!root)return;
  var options=energyHistoricalTariffs('luz'),checks=[];
  function refresh(force){if(!force&&checks.some(function(check){return !check();}))return;ESTUDIO_ELECT_CALC=false;_estudioReRender();}
  root.querySelectorAll('[data-electric-card]').forEach(function(card){var i=+card.dataset.electricCard;checks.push(bindElectricComparisonCard(card,electricComparisonTariff(DESPACHO.electComparaciones[i],_currentElectTariff()),i,options,refresh));});
  root.querySelector('#estElectGoDetail').onclick=function(){closeEstudio();openHousehold('elect');};
  root.addEventListener('input',function(e){if(e.target.dataset.stipo==='elect'||e.target.id==='estElectIva'){ESTUDIO_ELECT_CALC=false;var result=root.querySelector('.electric-results');if(result)result.remove();}});
  _bindScenarios('elect',ESTUDIO_ELECT_SCENARIOS);
  var addSc=root.querySelector('#estElectAddSc');if(addSc)addSc.onclick=function(){if(checks.some(function(c){return !c();}))return;ESTUDIO_ELECT_SCENARIOS.push({nombre:'Escenario '+(ESTUDIO_ELECT_SCENARIOS.length+1),consumoKwh:energyUsageProfile('luz').monthlyKwh,dias:30});refresh();};
  var add=root.querySelector('#estElectAdd');if(add)add.onclick=function(){if(checks.some(function(c){return !c();}))return;if(!DESPACHO.electComparaciones)DESPACHO.electComparaciones=[];DESPACHO.electComparaciones.push(energyComparisonDefaults({nombre:'Tarifa '+(DESPACHO.electComparaciones.length+1),useOwnPower:true},'luz'));saveDespacho();refresh();};
  root.querySelector('#estElectIva').onchange=function(e){if(e.target.checkValidity()){ESTUDIO_ELECT_IVA=Number(e.target.value);ESTUDIO_ELECT_CALC=false;var result=root.querySelector('.electric-results');if(result)result.remove();}};
  root.querySelector('#estElectCalc').onclick=function(){
    var invalid=Array.from(root.querySelectorAll('input[type="number"]')).find(function(el){return !el.checkValidity();});
    if(invalid){invalid.reportValidity();return;}if(checks.some(function(c){return !c();}))return;
    _readScenarios('elect',ESTUDIO_ELECT_SCENARIOS);ESTUDIO_ELECT_IVA=Number(root.querySelector('#estElectIva').value);ESTUDIO_ELECT_CALC=true;_estudioReRender();
  };
}
