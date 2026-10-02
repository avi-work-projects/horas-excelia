/* Entradas del comparador: se guardan precios netos, con toda su precisión. */
var ELECTRIC_COMPARISON_COLORS=['#518aaf','#b57b39','#6c9675','#9876ac','#b96c7c'];
function electricComparisonTaxes(){
  var cur=_currentElectTariff();
  return {vat:ESTUDIO_ELECT_IVA==null?(cur.ivaElect==null?21:cur.ivaElect):ESTUDIO_ELECT_IVA,other:ESTUDIO_ELECT_TAX==null?(cur.otherTaxPct||0):ESTUDIO_ELECT_TAX};
}
function electricComparisonApplied(source,taxes){
  var t=energyTariffDefaults(source);t.otherTaxPct=taxes.other;t.servicesPerDay=0;
  return t;
}
function electricInputValue(t,key,value,taxes,toNet){
  if(t.priceInputMode!=='gross')return value;
  var energy=key==='precioKwh'||/^price[0-2]$/.test(key);
  var factor=(1+taxes.vat/100)*(1+taxes.other/100),extra=energy?(t.otherTaxKwh||0)*(1+taxes.vat/100):0;
  return toNet?(value-extra)/factor:value*factor+extra;
}
function electricFixedDay(t,taxes){return (t.terminoFijoDia||0)+(t.extrasPerDay||0)/(1+taxes.other/100);}
function electricInputField(t,key,label,value,taxes){
  var shown=electricInputValue(t,key,value,taxes,false);
  return energyNumericField(key,label,Number(shown.toPrecision(12)));
}
function electricUsageYears(kind){
  var bills=energyBills(),years={};
  bills.filter(function(b){return b.kind===kind;}).forEach(function(b){for(var y=+b.start.slice(0,4);y<=+b.end.slice(0,4);y++)years[y]=true;});
  return Object.keys(years).sort().reverse().slice(0,3).map(function(y){
    var total=0,days=0,months=0;
    energyConsumptionMonths(bills,+y,kind).forEach(function(m){if(!m.overlap&&!m.unknownConsumption&&Object.keys(m.days).length){total+=m.consumption;days+=Object.keys(m.days).length;months++;}});
    return {year:+y,monthly:days?total/days*30:null,days:days,months:months};
  });
}
function bindElectricComparisonCard(card,draft,index,options,refresh){
  var taxes=electricComparisonTaxes();
  function validate(){try{energyValidateTariff(draft);card.querySelector('.electric-card-error').textContent='';return true;}catch(e){card.querySelector('.electric-card-error').textContent=e.message;return false;}}
  function save(){if(validate()){DESPACHO.electComparaciones[index]=energyTariffDefaults(draft);saveDespacho();return true;}return false;}
  card.oninput=function(event){var el=event.target;if(!el.name)return;
    // Leer solo lo modificado evita volver a redondear los pesos/precios que no se han tocado.
    var k=el.name,v=el.type==='number'?(el.value===''?NaN:Number(el.value)):el.value;
    if(k==='nombre'){draft.nombre=v.trim();if(!draft.sourceLabel){draft.comercializadora=draft.nombre;card.querySelector('[data-electric-source-label]').textContent=draft.nombre||'Tarifa personalizada';}}
    else if(/^weight[0-2]$/.test(k))draft.periodWeights=[0,1,2].map(function(i){var v=card.querySelector('[name="weight'+i+'"]').value;return v===''?NaN:Number(v);});
    else if(/^price[0-2]$/.test(k))draft.periodPrices[+k.slice(-1)]=electricInputValue(draft,k,v,taxes,true);
    else if(k==='fixedDay'){draft.terminoFijoDia=electricInputValue(draft,k,v,taxes,true);draft.extrasPerDay=0;}
    else draft[k]=/^potencia/.test(k)?v:electricInputValue(draft,k,v,taxes,true);
    if(draft.energyMode==='tramos')draft.precioKwh=energyWeightedPrice(draft);
    var weighted=card.querySelector('[data-electric-weighted]');if(weighted)weighted.textContent=energyUnitPrice(electricInputValue(draft,'precioKwh',energyWeightedPrice(draft),taxes,false))+' €/kWh';
    ESTUDIO_ELECT_CALC=false;var results=document.querySelector('.electric-results');if(results)results.remove();save();
  };
  card.querySelector('[data-electric-include]').onchange=function(e){draft.includeInComparison=e.target.checked;save();refresh();};
  card.querySelector('[data-electric-delete]').onclick=function(){DESPACHO.electComparaciones.splice(index,1);saveDespacho();refresh(true);};
  card.querySelectorAll('[data-electric-mode],[data-electric-power],[data-electric-basis]').forEach(function(b){b.onclick=function(){
    if(!validate())return;
    if(b.dataset.electricBasis)draft.priceInputMode=b.dataset.electricBasis;
    else if(b.dataset.electricPower)draft.modoPotencia=b.dataset.electricPower;
    else{draft.modo=b.dataset.electricMode==='fijo'?'fijo':'consumo';if(draft.modo!=='fijo')draft.energyMode=b.dataset.electricMode;}
    save();refresh();
  };});
  card.querySelector('[data-electric-weights]').onclick=function(){draft.periodWeights=energyUsageProfile('luz').weights.slice();draft.precioKwh=energyWeightedPrice(draft);save();refresh();};
  card.querySelectorAll('[data-electric-source]').forEach(function(b){b.onclick=function(){
    var key=b.dataset.electricSource,next;
    if(key==='custom')next=energyComparisonDefaults({nombre:'',comercializadora:'',includeInComparison:draft.includeInComparison,useOwnPower:true},'luz');
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
  root.addEventListener('input',function(e){if(e.target.dataset.stipo==='elect'||e.target.id==='estElectIva'||e.target.id==='estElectTax'){ESTUDIO_ELECT_CALC=false;var result=root.querySelector('.electric-results');if(result)result.remove();}});
  _bindScenarios('elect',ESTUDIO_ELECT_SCENARIOS);
  var addSc=root.querySelector('#estElectAddSc');if(addSc)addSc.onclick=function(){if(checks.some(function(c){return !c();}))return;ESTUDIO_ELECT_SCENARIOS.push({nombre:'Escenario '+(ESTUDIO_ELECT_SCENARIOS.length+1),consumoKwh:energyUsageProfile('luz').monthlyKwh,dias:30});refresh();};
  var add=root.querySelector('#estElectAdd');if(add)add.onclick=function(){if(checks.some(function(c){return !c();}))return;if(!DESPACHO.electComparaciones)DESPACHO.electComparaciones=[];DESPACHO.electComparaciones.push(energyComparisonDefaults({nombre:'',comercializadora:'',useOwnPower:true},'luz'));saveDespacho();refresh();};
  ['estElectIva','estElectTax'].forEach(function(id){root.querySelector('#'+id).onchange=function(e){if(!e.target.checkValidity()||checks.some(function(c){return !c();}))return;if(id==='estElectIva')ESTUDIO_ELECT_IVA=Number(e.target.value);else ESTUDIO_ELECT_TAX=Number(e.target.value);refresh();};});
  root.querySelector('#estElectCalc').onclick=function(){
    var invalid=Array.from(root.querySelectorAll('input[type="number"]')).find(function(el){return !el.checkValidity();});
    if(invalid){invalid.reportValidity();return;}if(checks.some(function(c){return !c();}))return;
    _readScenarios('elect',ESTUDIO_ELECT_SCENARIOS);ESTUDIO_ELECT_IVA=Number(root.querySelector('#estElectIva').value);ESTUDIO_ELECT_TAX=Number(root.querySelector('#estElectTax').value);ESTUDIO_ELECT_CALC=true;_estudioReRender();
  };
}
