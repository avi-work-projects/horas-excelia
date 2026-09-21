/* Cálculos compartidos: las tarifas antiguas siguen usando meses de 30 días;
   el histórico prorratea por los días reales de cada mes. Importes sin IVA. */
var ENERGY_TAX_KEY='excelia-energy-tax-v1';
function energyWeightedPrice(t){
  if(t.energyMode!=='tramos')return t.precioKwh||0;
  return t.periodPrices.reduce(function(sum,p,i){return sum+p*t.periodWeights[i]/100;},0);
}
function energyValidateTariff(t){
  if(!t||['consumo','fijo'].indexOf(t.modo)<0||['unico','tramos'].indexOf(t.energyMode)<0)throw new Error('Modalidad de tarifa no válida');
  ['precioKwh','cuotaFija','terminoFijo','terminoFijoDia','precioPotP1','precioPotP2','potenciaP1','potenciaP2','potenciaTotal','otherTaxPct','otherTaxKwh'].forEach(function(k){if(typeof t[k]!=='number'||!Number.isFinite(t[k])||t[k]<0)throw new Error('Revisa el valor de '+k);});
  if(['simple','doble'].indexOf(t.modoPotencia)<0)throw new Error('Potencia no válida');
  ['periodPrices','periodWeights'].forEach(function(k){if(!Array.isArray(t[k])||t[k].length!==3||t[k].some(function(n){return typeof n!=='number'||!Number.isFinite(n)||n<0;}))throw new Error('Revisa los tres tramos');});
  if(Math.abs(t.periodWeights.reduce(function(a,b){return a+b;},0)-100)>0.001)throw new Error('Los pesos deben sumar 100 %');
  if(typeof t.promotion!=='number'||!Number.isFinite(t.promotion)||t.promotion<0)throw new Error('Promoción no válida');
  return t;
}
function energyTariffDefaults(t){
  return Object.assign({modo:'consumo',energyMode:'unico',precioKwh:0,cuotaFija:0,terminoFijo:0,terminoFijoDia:0,modoPotencia:'doble',precioPotP1:0,precioPotP2:0,potenciaP1:0,potenciaP2:0,potenciaTotal:0,periodPrices:[0,0,0],periodWeights:[33,33,34],otherTaxPct:0,otherTaxKwh:0,promotion:0},JSON.parse(JSON.stringify(t||{})));
}
function energyTariffBase(t,kind,kwh,days,monthDays,power){
  if(t.modo==='fijo')return (t.cuotaFija||0)*days/monthDays;
  var fixed=(t.terminoFijo||0)*days/monthDays+(t.terminoFijoDia||0)*days;
  if(kind==='luz'){
    var p=power||t;
    if(t.modoPotencia==='doble')fixed+=((t.precioPotP1||0)*(p.potenciaP1||p.potenciaTotal||0)+(t.precioPotP2||0)*(p.potenciaP2||p.potenciaTotal||0))*days;
    else fixed+=(t.precioPotP1||t.precioPot||0)*(p.potenciaTotal||0)*days;
  }
  return kwh*energyWeightedPrice(t)+fixed;
}
function energyTariffNet(t,kind,kwh,days,monthDays,power){return energyTariffBase(t,kind,kwh,days,monthDays,power)*(1+(t.otherTaxPct||0)/100)+kwh*(t.otherTaxKwh||0);}
function energyTaxes(){return energyValidateTaxes(JSON.parse(appStorage.getItem(ENERGY_TAX_KEY)||'[]'));}
function energyValidateTaxes(rows){
  if(!Array.isArray(rows)||rows.length>500)throw new Error('Histórico de IVA no válido');
  var seen={};rows.forEach(function(r){if(!r)throw new Error('Período de IVA no válido');var key=r.kind+'|'+r.start;if(['luz','gas'].indexOf(r.kind)<0||!validIsoDate(r.start)||typeof r.rate!=='number'||!Number.isFinite(r.rate)||r.rate<0||r.rate>100||seen[key])throw new Error('Revisa fechas y porcentajes de IVA (sin fechas repetidas)');seen[key]=true;});return rows;
}
function energyMergeTaxes(a,b){energyValidateTaxes(b);var rows=a.slice();b.forEach(function(r){rows=rows.filter(function(x){return x.kind!==r.kind||x.start!==r.start;});rows.push(r);});return energyValidateTaxes(rows);}
function energySaveTaxes(rows){appStorage.setItem(ENERGY_TAX_KEY,JSON.stringify(energyValidateTaxes(rows)));}
function energyVatAt(rows,kind,date){var found=rows.filter(function(r){return r.kind===kind&&r.start<=date;}).sort(function(a,b){return b.start.localeCompare(a.start);})[0];return found?found.rate:null;}
function energyUtc(ds){return Date.parse(ds+'T00:00:00Z')/86400000;}
function energyDate(day){return new Date(day*86400000).toISOString().slice(0,10);}
/* Dos recibos que comparten fecha límite no duplican ese día: salvo el último,
   su fin se trata como exclusivo si otro recibo de consumo empieza ahí. */
function energyBillEnd(b,bills){
  var end=energyUtc(b.end);
  if(b.start!==b.end&&b.consumption!==null&&bills.some(function(x){return x.id!==b.id&&x.kind===b.kind&&x.start===b.end&&x.end>b.end&&x.consumption!==null;}))end--;
  return end;
}
function energyConsumptionMonths(bills,year,kind){
  var relevant=bills.filter(function(b){return b.kind===kind;}),months=[],readings=[];
  for(var i=0;i<12;i++)months.push({count:0,consumption:0,net:0,gross:0,paid:0,unknownPaid:0,unknownConsumption:0,days:{},samples:{},periods:[0,0,0],periodDays:0,overlap:false});
  relevant.forEach(function(b){
    var start=energyUtc(b.start),end=energyBillEnd(b,relevant),n=end-start+1;
    for(var d=Math.max(start,energyUtc(year+'-01-01'));d<=Math.min(end,energyUtc(year+'-12-31'));d++){
      var m=months[+energyDate(d).slice(5,7)-1];m.count++;m.net+=b.net/n;m.gross+=b.gross/n;if(b.paid===null)m.unknownPaid++;else m.paid+=b.paid/n;
    }
    if(b.readings){b.readings.forEach(function(r){readings.push({start:r.start,end:r.end,consumption:r.consumption,consumptionPeriods:r.periods,inclusive:true});});}
    else if(!b.serviceOnly)readings.push(Object.assign({},b,{resolvedEnd:end}));
  });
  readings.forEach(function(b){var start=energyUtc(b.start),end=b.inclusive?energyUtc(b.end):b.resolvedEnd,n=end-start+1;
    for(var d=Math.max(start,energyUtc(year+'-01-01'));d<=Math.min(end,energyUtc(year+'-12-31'));d++){
      var ds=energyDate(d),m=months[+ds.slice(5,7)-1];if(b.consumption===null||b.noReading){m.unknownConsumption++;continue;}
      if(m.days[ds])m.overlap=true;m.days[ds]=true;m.consumption+=b.consumption/n;m.samples[ds]=(m.samples[ds]||0)+b.consumption/n;
      if(b.consumptionPeriods&&b.consumptionPeriods.every(function(v){return v!==null;})){m.periodDays++;b.consumptionPeriods.forEach(function(v,i){m.periods[i]+=v/n;});}
    }
  });return months;
}
function energySimulateMonth(m,t,kind,taxes,promotions){
  var dates=Object.keys(m.samples),net=0,gross=0,discount=0,missing=false;
  if(!dates.length||m.unknownConsumption||m.overlap)return null;
  dates.forEach(function(ds){
    var parts=ds.split('-'),monthDays=new Date(Date.UTC(+parts[0],+parts[1],0)).getUTCDate();
    var beforeVat=energyTariffNet(t,kind,m.samples[ds],1,monthDays);
    var vat=energyVatAt(taxes,kind,ds);net+=beforeVat;if(vat===null)missing=true;else gross+=beforeVat*(1+vat/100);
    if(promotions)discount+=t.promotion/monthDays;
  });
  return {net:net,gross:missing?null:gross-discount,days:dates.length};
}
