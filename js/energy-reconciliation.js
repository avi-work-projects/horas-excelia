/* Compara el mismo período de suministro, sin confundir emisión con consumo.
   Los servicios ajenos al suministro se conservan, pero no forman parte del coste. */
function energyBillServices(b){return b.serviceOnly?b.gross:(b.servicesGross||0);}
function energyBillSupply(b){return b.gross-energyBillServices(b);}
function energyBilledDays(bills,year,kind){
  var days={},list=bills.filter(function(b){return b.kind===kind&&!b.serviceOnly;});
  list.forEach(function(b){
    var start=energyUtc(b.start),end=energyBillEnd(b,list),n=end-start+1,amount=energyBillSupply(b)/n;
    for(var d=Math.max(start,energyUtc(year+'-01-01'));d<=Math.min(end,energyUtc(year+'-12-31'));d++){
      var ds=energyDate(d);days[ds]=(days[ds]||0)+amount;
    }
  });return days;
}
function energyReconcile(bills,months,year,kind){
  var billed=energyBilledDays(bills,year,kind),actual=0,estimate=0,days=0,omitted=0;
  months.forEach(function(m){if(m.gross===null){omitted+=Object.keys(m.source.coverage).length;return;}
    Object.keys(m.dailyCosts).forEach(function(ds){if(Object.prototype.hasOwnProperty.call(billed,ds)){actual+=billed[ds];estimate+=m.dailyCosts[ds];days++;}else omitted++;});
  });
  var issued=bills.filter(function(b){return b.kind===kind&&+b.issued.slice(0,4)===year;});
  return {days:days,omitted:omitted,actual:days?actual:null,estimate:days?estimate:null,difference:days?estimate-actual:null,
    issuedSupply:issued.reduce(function(s,b){return s+energyBillSupply(b);},0),services:issued.reduce(function(s,b){return s+energyBillServices(b);},0)};
}
/* Parche de importación: cambia exclusivamente la tarifa actual, nunca el resto
   de los ajustes fiscales. La exportación completa ya la guarda en despacho. */
function energyValidateCurrent(rows,contracts){
  if(!Array.isArray(rows)||rows.length>2)throw new Error('Tarifas actuales no válidas');
  var seen={};rows.forEach(function(r){var c=r&&contracts.find(function(c){return c.id===r.contractId;});
    if(!r||seen[r.kind]||['luz','gas'].indexOf(r.kind)<0||!validIsoDate(r.date)||!c||c.kind!==r.kind||!energyContractTariff(c,r.date)||!c.start||r.date<c.start||(c.end&&r.date>c.end))throw new Error('Revisa la vigencia de la tarifa actual');seen[r.kind]=true;
  });return rows;
}
function energyCurrentConfig(){
  var stored=appStorage.getItem(DESPACHO_SK);
  return stored?JSON.parse(stored):JSON.parse(JSON.stringify(DESPACHO));
}
function energyApplyCurrent(rows,incoming){
  var contracts=energyContracts(),config=energyCurrentConfig();
  rows=rows.map(function(r){
    var source=(incoming||[]).find(function(c){return c.id===r.contractId;});
    var target=contracts.find(function(c){return c.id===r.contractId||(source&&energyContractSignature(c)===energyContractSignature(source));});
    return Object.assign({},r,{contractId:target?target.id:r.contractId});
  });energyValidateCurrent(rows,contracts);
  rows.forEach(function(r){var c=contracts.find(function(c){return c.id===r.contractId;}),t=energyTariffDefaults(energyContractTariff(c,r.date)),vat=energyVatAt(energyTaxes(),r.kind,r.date);
    t.comercializadora=c.supplier;t.nombre=c.tariff;t.energyContractId=c.id;t.effectiveFrom=r.date;t.precioKwh=energyWeightedPrice(t);
    if(r.kind==='luz'){if(vat!==null)t.ivaElect=vat;config.elect=Object.assign({},config.elect,t);}
    else {var g=config.gas||(config.gas={});g.activo=t.modo;if(vat!==null)g.ivaGas=vat;g[t.modo]=Object.assign({},g[t.modo],t);}
  });appStorage.setItem(DESPACHO_SK,JSON.stringify(config));DESPACHO=config;
}
function energyCurrentPreview(data){return (data.energyCurrentTariffs||[]).map(function(r){var c=(data.energyContracts||energyContracts()).find(function(c){return c.id===r.contractId;});return (r.kind==='luz'?'Electricidad':'Gas')+': '+(c?c.supplier+' · '+c.tariff:r.contractId)+' desde '+r.date+'. Sustituye la tarifa actual y conserva los demás ajustes.';});}
