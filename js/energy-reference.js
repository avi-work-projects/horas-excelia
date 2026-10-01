/* Referencias de comparación derivadas del consumo documentado. No se
   rellenan huecos ni se modifican contratos/facturas desde estas vistas. */
function energyUsageProfile(kind,year){
  var bills=energyBills(),years={};
  bills.filter(function(b){return b.kind===kind;}).forEach(function(b){for(var y=+b.start.slice(0,4);y<=+b.end.slice(0,4);y++)years[y]=true;});
  function collect(list){
    var total=0,days=0,periods=[0,0,0];
    list.forEach(function(y){energyConsumptionMonths(bills,+y,kind).forEach(function(m){
      if(m.overlap||m.unknownConsumption)return;
      total+=m.consumption;days+=Object.keys(m.days).length;m.periods.forEach(function(n,i){periods[i]+=n;});
    });});
    return {total:total,days:days,periods:periods};
  }
  var data=collect(year?[year]:Object.keys(years)),usedYear=year;
  if(!data.days&&year){data=collect(Object.keys(years));usedYear=null;}
  var pTotal=data.periods.reduce(function(a,b){return a+b;},0),weights=[33,33,34];
  if(pTotal){weights=data.periods.map(function(n){return Math.round(n/pTotal*10000)/100;});weights[2]=+(100-weights[0]-weights[1]).toFixed(2);}
  return {monthlyKwh:data.days?Math.round(data.total/data.days*30):kind==='luz'?250:600,days:data.days,year:usedYear,
    weights:weights,hasWeights:pTotal>0,source:data.days?'Media de tus lecturas'+(usedYear?' de '+usedYear:' disponibles'):'Consumo orientativo (sin lecturas importadas)'};
}
// Solo presentación: el reparto entero sigue sumando 100, sin tocar los pesos de cálculo.
function energyDisplayWeights(weights){
  var sum=weights.reduce(function(a,b){return a+b;},0);
  if(!sum)return weights.map(function(){return 0;});
  var exact=weights.map(function(n){return n/sum*100;}),rounded=exact.map(Math.floor);
  var order=exact.map(function(n,i){return i;}).sort(function(a,b){return (exact[b]-rounded[b])-(exact[a]-rounded[a])||a-b;});
  var remaining=100-rounded.reduce(function(a,b){return a+b;},0);
  for(var i=0;i<remaining;i++)rounded[order[i]]++;
  return rounded;
}
function energyPriceTotal(label,value,unit){
  return '<div class="energy-price-total"><span>'+label+'</span><strong>'+energyUnitPrice(value)+' <small>'+unit+'</small></strong></div>';
}
function energyTariffReference(kind,tariff,profile,vat){
  var t=energyTariffDefaults(tariff);t.servicesPerDay=0;
  if(t.energyMode==='tramos'&&profile.hasWeights)t.periodWeights=profile.weights.slice();
  var multiplier=(1+t.otherTaxPct/100)*(1+(vat||0)/100),fixed=t.modo==='fijo',power={potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:3.3};
  var consumption=fixed?null:energyWeightedPrice(t),standing=fixed?null:kind==='luz'?t.precioPotP1+(t.modoPotencia==='doble'?t.precioPotP2:0):t.terminoFijo/30+t.terminoFijoDia;
  return {
    consumptionNet:consumption,standingNet:standing,
    billNet:energyTariffBase(t,kind,profile.monthlyKwh,30,30,power)+(t.extrasPerDay||0)*30,
    consumption:vat===null||fixed?null:(consumption*(1+t.otherTaxPct/100)+t.otherTaxKwh)*(1+vat/100),
    standing:vat===null||fixed?null:standing*multiplier,
    bill:vat===null?null:energyTariffGross(t,kind,profile.monthlyKwh,30,30,vat,power)
  };
}
function energyTariffReferenceHtml(kind,t,profile,vat){
  var ref=energyTariffReference(kind,t,profile,vat);
  function metric(label,net,gross,unit,money){
    function number(n){return money?n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €':energyUnitPrice(n);}
    var h='<span><small>'+label+'</small>';
    if(net===null)return h+'<small class="energy-price-included">Incluido en cuota</small></span>';
    return h+'<b>'+number(net)+'</b><small>'+unit+'</small><small class="energy-price-basis">sin impuestos</small><span class="energy-price-taxed">'+(gross===null?'Con impuestos: sin dato':'<span>'+number(gross)+'</span><small>con impuestos</small>')+'</span></span>';
  }
  return '<span class="energy-tariff-metrics">'+metric('Consumo medio',ref.consumptionNet,ref.consumption,'€/kWh')+metric(kind==='luz'?'Suma potencia':'Término fijo',ref.standingNet,ref.standing,kind==='luz'?'€/kW/día':'€/día')+metric('Factura aprox.',ref.billNet,ref.bill,'30 días',true)+'</span>';
}
function energyComparisonDefaults(old,kind){
  var source=old||{},profile=energyUsageProfile(kind);
  return energyTariffDefaults(Object.assign({potenciaTotal:3.3,potenciaP1:3.3,potenciaP2:3.3,periodWeights:profile.weights,periodPrices:[source.precioKwh||0,source.precioKwh||0,source.precioKwh||0]},source));
}
