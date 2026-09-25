/* Coste del consumo: media diaria mensual y reparto por vigencia contractual.
   Nunca se deduce una tarifa a partir del total de una factura. */
function energyContractOn(contracts,kind,date){
  var matches=contracts.filter(function(c){return c.kind===kind&&c.start&&c.start<=date&&(!c.end||c.end>=date);});
  matches=matches.filter(function(c){return !matches.some(function(n){return n.id!==c.id&&c.end===date&&n.start===date&&c.start<date;});});
  return matches.length===1?matches[0]:null;
}
function energyContractTariff(c,date){
  if(!c)return null;
  if(c.analysisPeriods&&c.analysisPeriods.length){
    var period=c.analysisPeriods.filter(function(p){return p.start<=date;}).sort(function(a,b){return b.start.localeCompare(a.start);})[0];
    return period?period.tariff:null;
  }
  return c.analysis||null;
}
function energySupplierColor(name){
  var colors=['#5487bf','#b97b31','#5b9671','#9a65ae','#c66b78','#39999b','#8f8452'],hash=0;
  for(var i=0;i<name.length;i++)hash=(hash*31+name.charCodeAt(i))>>>0;
  return colors[hash%colors.length];
}
function energyCostMonths(bills,contracts,taxes,year,kind,scenario){
  return energyConsumptionMonths(bills,year,kind).map(function(m){
    var dates=Object.keys(m.samples).sort(),daily=dates.length?m.consumption/dates.length:0;
    var result={consumption:m.consumption,days:dates.length,groups:[],gross:null,net:null,missing:[],vatBands:[],source:m};
    if(!dates.length||m.unknownConsumption||m.overlap||daily<0){result.missing.push(m.overlap?'Lecturas solapadas':'Consumo incompleto');return result;}
    var groups={},net=0,gross=0;
    dates.forEach(function(ds){
      var c=energyContractOn(contracts,kind,ds),t=energyContractTariff(c,ds);
      var replace=scenario&&scenario.tariff&&(!scenario.contractId||(c&&c.id===scenario.contractId))&&(!scenario.start||ds>=scenario.start)&&(!scenario.end||ds<=scenario.end);
      if(replace)t=scenario.tariff;
      var vat=scenario&&scenario.vatMode==='none'?0:scenario&&scenario.vatMode==='constant'?scenario.vat:energyVatAt(taxes,kind,ds);
      var last=result.vatBands[result.vatBands.length-1];if(last&&last.rate===vat&&energyUtc(ds)===energyUtc(last.end)+1){last.days++;last.end=ds;}else result.vatBands.push({start:ds,end:ds,rate:vat,days:1});
      if(!t||vat===null){var reason=!t?'Tarifa o vigencia pendiente':'IVA histórico pendiente';if(result.missing.indexOf(reason)<0)result.missing.push(reason);return;}
      var n=new Date(Date.UTC(+ds.slice(0,4),+ds.slice(5,7),0)).getUTCDate();
      var applied=t;if(t.energyMode==='tramos'&&m.periodDays===dates.length&&m.consumption>0){applied=Object.assign({},t,{periodWeights:m.periods.map(function(v){return v/m.consumption*100;})});}
      if(scenario&&scenario.vatMode&&scenario.vatMode!=='historical')applied=Object.assign({},applied,{servicesVatPct:vat});
      var base=energyTariffNet(applied,kind,daily,1,n),cost=energyTariffGross(applied,kind,daily,1,n,vat)-(scenario&&scenario.promos?(t.promotion||0)/n:0);
      var key=replace?'scenario':c.id;
      if(!groups[key])groups[key]={id:key,contractId:c?c.id:'',supplier:replace?(scenario.name||'Escenario'):c.supplier,net:0,gross:0,days:0,kwh:0};
      var g=groups[key];g.net+=base;g.gross+=cost;g.days++;g.kwh+=daily;net+=base;gross+=cost;
    });
    result.groups=Object.keys(groups).map(function(k){return groups[k];});
    if(!result.missing.length){result.net=net;result.gross=gross;}
    return result;
  });
}
function energyCostChart(months){
  var max=Math.max.apply(null,months.map(function(m){return m.gross===null?0:Math.max(0,m.gross);}));max=max||1;
  var h='<div class="energy-cost-chart" aria-label="Coste mensual estimado por compañía">';
  months.forEach(function(m,i){
    h+='<div class="energy-cost-column"><span class="energy-bar-value">'+(m.gross===null?'—':Math.round(m.gross)+'€')+'</span><div class="energy-cost-stack">';
    if(m.gross!==null)m.groups.forEach(function(g){h+='<div class="energy-cost-segment" style="height:'+Math.max(0,g.gross)/max*130+'px;background:'+energySupplierColor(g.supplier)+'" title="'+escHtml(MN_SHORT[i]+' · '+g.supplier+' · '+energyNumber(g.gross,'€')+' · '+g.days+' días')+'" aria-label="'+escHtml(MN_SHORT[i]+' '+g.supplier+' '+energyNumber(g.gross,'€'))+'"></div>';});
    h+='</div><span>'+MN_SHORT[i]+'</span></div>';
  });return h+'</div>';
}
