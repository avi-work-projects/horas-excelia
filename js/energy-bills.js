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
    ['supplier','number','notes','source'].forEach(function(k){if(typeof b[k]!=='string'||b[k].length>10000)throw new Error('Campo de factura no válido: '+k);});
    if(!b.supplier.trim()||!b.number.trim())throw new Error('Indica compañía y número de factura');
    if(!validIsoDate(b.issued)||!validIsoDate(b.start)||!validIsoDate(b.end)||b.end<b.start)throw new Error('Fechas de factura no válidas');
    ['net','gross','paid','consumption'].forEach(function(k){if((k==='paid'||k==='consumption')&&b[k]===null)return;if(typeof b[k]!=='number'||!Number.isFinite(b[k])||Math.abs(b[k])>1e9)throw new Error('Importe o consumo no válido');});
    var sig=energyBillSignature(b);if(signatures[sig])throw new Error('Número de factura repetido para la compañía');signatures[sig]=true;
  });return list;
}
function energyBillSignature(b){return JSON.stringify([b.kind,b.supplier.trim().toLowerCase(),b.number.trim().toLowerCase()]);}
function energyMergeBills(current,incoming){
  validateEnergyBills(incoming);var result=JSON.parse(JSON.stringify(current));
  incoming.forEach(function(b){var i=result.findIndex(function(x){return x.id===b.id||energyBillSignature(x)===energyBillSignature(b);});if(i<0)result.push(b);else result[i]=Object.assign({},b,{id:result[i].id});});
  return validateEnergyBills(result);
}
function energySaveBills(list){appStorage.setItem(ENERGY_BILLS_KEY,JSON.stringify(validateEnergyBills(list)));}
function energyMonthlyBills(list,year){
  var months=Array.from({length:12},function(){return {count:0,net:0,gross:0,paid:0,consumption:0,unknownPaid:0,unknownConsumption:0};});
  list.forEach(function(b){if(+b.issued.slice(0,4)!==year)return;var m=months[+b.issued.slice(5,7)-1];m.count++;m.net+=b.net;m.gross+=b.gross;if(b.paid===null)m.unknownPaid++;else m.paid+=b.paid;if(b.consumption===null)m.unknownConsumption++;else m.consumption+=b.consumption;});return months;
}
function energyImportHistory(data){
  validateImport(data);
  if(!Array.isArray(data.energyBills)&&!Array.isArray(data.energyContracts))throw new Error('El archivo no contiene contratos ni facturas');
  var before={energyBills:energyBills(),energyContracts:energyContracts()};
  var bills=data.energyBills?energyMergeBills(before.energyBills,data.energyBills):before.energyBills;
  var contracts=data.energyContracts?energyMergeContracts(before.energyContracts,data.energyContracts):before.energyContracts;
  appStorage.begin();try{energySaveBills(bills);energySaveContracts(contracts);appStorage.commit();}catch(e){appStorage.cancel();throw e;}return before;
}
function energyRestoreHistory(data){appStorage.begin();try{energySaveBills(data.energyBills);energySaveContracts(data.energyContracts);appStorage.commit();}catch(e){appStorage.cancel();throw e;}}
