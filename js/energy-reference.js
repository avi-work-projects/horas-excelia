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
function energyTariffReference(kind,tariff,profile,vat){
  var t=energyTariffDefaults(tariff);t.servicesPerDay=0;
  if(t.energyMode==='tramos'&&profile.hasWeights)t.periodWeights=profile.weights.slice();
  var multiplier=(1+t.otherTaxPct/100)*(1+(vat||0)/100),fixed=t.modo==='fijo';
  return {
    consumption:vat===null||fixed?null:(energyWeightedPrice(t)*(1+t.otherTaxPct/100)+t.otherTaxKwh)*(1+vat/100),
    standing:vat===null||fixed?null:(kind==='luz'?t.precioPotP1+(t.modoPotencia==='doble'?t.precioPotP2:0):t.terminoFijo/30+t.terminoFijoDia)*multiplier,
    bill:vat===null?null:energyTariffGross(t,kind,profile.monthlyKwh,30,30,vat,{potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:3.3})
  };
}
function energyTariffReferenceHtml(kind,t,profile,vat){
  var ref=energyTariffReference(kind,t,profile,vat);
  function number(n,precision){return n===null?'—':n.toLocaleString('es-ES',{minimumFractionDigits:precision,maximumFractionDigits:precision});}
  return '<span class="energy-tariff-metrics"><span><small>Consumo medio</small><b>'+number(ref.consumption,4)+'</b><small>'+(t.modo==='fijo'?'Incluido en cuota':'€/kWh')+'</small></span><span><small>'+(kind==='luz'?'Suma potencia':'Término fijo')+'</small><b>'+number(ref.standing,4)+'</b><small>'+(t.modo==='fijo'?'Incluido en cuota':kind==='luz'?'€/kW/día':'€/día')+'</small></span><span><small>Factura aprox.</small><b>'+number(ref.bill,2)+' €</b><small>30 días</small></span></span>';
}
function energyComparisonDefaults(old,kind){
  var source=old||{},profile=energyUsageProfile(kind);
  return energyTariffDefaults(Object.assign({potenciaTotal:3.3,potenciaP1:3.3,potenciaP2:3.3,periodWeights:profile.weights,periodPrices:[source.precioKwh||0,source.precioKwh||0,source.precioKwh||0]},source));
}
