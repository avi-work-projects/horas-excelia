/* Facturas reales: no alimentan las simulaciones ni las deducciones fiscales. */
var ENERGY_BILLS_KEY='excelia-energy-bills-v1';
function energyBills(){var raw=appStorage.getItem(ENERGY_BILLS_KEY);return raw?validateEnergyBills(JSON.parse(raw)):[];}
function validateEnergyBills(list){
  if(!Array.isArray(list)||list.length>10000)throw new Error('Lista de facturas no válida');
  var ids=Object.create(null),signatures=Object.create(null);
  list.forEach(function(b){
    if(!b||typeof b.id!=='string'||!/^[\w-]+$/.test(b.id)||ids[b.id])throw new Error('Identificador de factura no válido o repetido');
    ids[b.id]=true;
    if(['luz','gas'].indexOf(b.kind)<0)throw new Error('Suministro de factura no válido');
    if(b.serviceOnly!=null&&typeof b.serviceOnly!=='boolean')throw new Error('Tipo de recibo no válido');
    if(b.noReading!=null&&typeof b.noReading!=='boolean')throw new Error('Estado de lectura no válido');
    ['supplier','number','notes','source'].forEach(function(k){if(typeof b[k]!=='string'||b[k].length>10000)throw new Error('Campo de factura no válido: '+k);});
    if(!b.supplier.trim()||!b.number.trim())throw new Error('Indica compañía y número de factura');
    if(!validIsoDate(b.issued)||!validIsoDate(b.start)||!validIsoDate(b.end)||b.end<b.start)throw new Error('Fechas de factura no válidas');
    ['net','gross','paid','consumption'].forEach(function(k){if((k==='paid'||k==='consumption')&&b[k]===null)return;if(typeof b[k]!=='number'||!Number.isFinite(b[k])||Math.abs(b[k])>1e9)throw new Error('Importe o consumo no válido');});
    if(b.consumptionPeriods!=null){if(!Array.isArray(b.consumptionPeriods)||b.consumptionPeriods.length!==3||b.consumptionPeriods.some(function(n){return n!==null&&(typeof n!=='number'||!Number.isFinite(n)||n<0);}))throw new Error('Consumo por tramos no válido');}
    ['vatAmount','electricityTaxAmount','otherTaxesAmount','servicesNet','servicesGross'].forEach(function(k){if(b[k]!=null&&(typeof b[k]!=='number'||!Number.isFinite(b[k])))throw new Error('Desglose de factura no válido');});
    if(b.servicesGross!=null&&Math.abs(b.servicesGross)>1e9)throw new Error('Importe de servicios no válido');
    if(b.readings!=null){if(!Array.isArray(b.readings)||b.readings.length>500)throw new Error('Lecturas no válidas');b.readings.forEach(function(r){if(!r||!validIsoDate(r.start)||!validIsoDate(r.end)||r.end<r.start||typeof r.consumption!=='number'||!Number.isFinite(r.consumption)||r.consumption<0)throw new Error('Período de lectura no válido');if(r.periods!=null&&(!Array.isArray(r.periods)||r.periods.length!==3||r.periods.some(function(n){return typeof n!=='number'||!Number.isFinite(n)||n<0;})))throw new Error('Tramos de lectura no válidos');});}
    var sig=energyBillSignature(b);if(signatures[sig])throw new Error('Número de factura repetido para la compañía');signatures[sig]=true;
  });return list;
}
function energyBillSignature(b){return JSON.stringify([b.kind,b.supplier.trim().toLowerCase(),b.number.trim().toLowerCase()]);}
function energyMergeBills(current,incoming){
  validateEnergyBills(incoming);var result=JSON.parse(JSON.stringify(current));
  incoming.forEach(function(b){var i=result.findIndex(function(x){return x.id===b.id||energyBillSignature(x)===energyBillSignature(b);});if(i<0)result.push(b);else result[i]=Object.assign({},result[i],b,{id:result[i].id});});
  return validateEnergyBills(result);
}
function energySaveBills(list){appStorage.setItem(ENERGY_BILLS_KEY,JSON.stringify(validateEnergyBills(list)));}
function energyMonthlyBills(list,year){
  var months=Array.from({length:12},function(){return {count:0,net:0,gross:0,paid:0,consumption:0,unknownPaid:0,unknownConsumption:0};});
  list.forEach(function(b){if(+b.issued.slice(0,4)!==year)return;var m=months[+b.issued.slice(5,7)-1];m.count++;m.net+=b.net;m.gross+=b.gross;if(b.paid===null)m.unknownPaid++;else m.paid+=b.paid;if(b.consumption===null)m.unknownConsumption++;else m.consumption+=b.consumption;});return months;
}
function energyImportHistory(data){
  validateImport(data);
  if(!Array.isArray(data.energyBills)&&!Array.isArray(data.energyContracts)&&!Array.isArray(data.energyTaxes))throw new Error('El archivo no contiene contratos ni facturas');
  var before={energyTaxes:energyTaxes(),energyBills:energyBills(),energyContracts:energyContracts()};
  if(data.energyCurrentTariffs){before.despacho=energyCurrentConfig();before.despachoStored=appStorage.getItem(DESPACHO_SK);}
  var bills=data.energyBills?energyMergeBills(before.energyBills,data.energyBills):before.energyBills;
  var contracts=data.energyContracts?energyMergeContracts(before.energyContracts,data.energyContracts):before.energyContracts;
  appStorage.begin();try{if(data.energyTaxes)energySaveTaxes(energyMergeTaxes(before.energyTaxes,data.energyTaxes));energySaveBills(bills);energySaveContracts(contracts);if(data.energyCurrentTariffs)energyApplyCurrent(data.energyCurrentTariffs,data.energyContracts);appStorage.commit();}catch(e){appStorage.cancel();if(before.despacho)DESPACHO=before.despacho;throw e;}return before;
}
function energyRestoreHistory(data){var old=DESPACHO;appStorage.begin();try{if(data.energyTaxes)energySaveTaxes(data.energyTaxes);energySaveBills(data.energyBills);energySaveContracts(data.energyContracts);if(data.despacho){DESPACHO=data.despacho;if(data.despachoStored===null)appStorage.removeItem(DESPACHO_SK);else appStorage.setItem(DESPACHO_SK,data.despachoStored||JSON.stringify(DESPACHO));}appStorage.commit();}catch(e){appStorage.cancel();DESPACHO=old;throw e;}}
