/* Contratos históricos: independientes de las tarifas de simulación. */
var ENERGY_HISTORY_KEY='excelia-energy-history-v1';
function energyContracts(){
  var raw=appStorage.getItem(ENERGY_HISTORY_KEY);
  if(!raw)return [];
  var list=JSON.parse(raw);validateEnergyContracts(list);return list;
}
function validateEnergyContracts(list){
  if(!Array.isArray(list)||list.length>5000)throw new Error('Histórico de contratos no válido');
  var ids={};
  list.forEach(function(c){
    if(!c||typeof c!=='object'||!c.id||typeof c.id!=='string'||!/^[\w-]+$/.test(c.id)||ids[c.id])throw new Error('Identificador de contrato no válido o repetido');
    ids[c.id]=true;
    if(['luz','gas'].indexOf(c.kind)<0)throw new Error('Suministro no válido');
    ['supplier','tariff','supply','start','end','commitment','notes','source'].forEach(function(k){if(typeof c[k]!=='string'||c[k].length>10000)throw new Error('Campo de contrato no válido: '+k);});
    if(!c.supplier.trim())throw new Error('Indica la comercializadora');
    if(c.summaryNote!=null&&(typeof c.summaryNote!=='string'||c.summaryNote.length>10000))throw new Error('Nota de contrato no válida');
    ['start','end','commitment'].forEach(function(k){if(c[k]&&!validIsoDate(c[k]))throw new Error('Fecha de contrato no válida');});
    if(c.start&&c.end&&c.end<c.start)throw new Error('El fin no puede ser anterior al inicio');
    if(['incluidos','excluidos','desconocido'].indexOf(c.taxes)<0)throw new Error('Indica cómo están expresados los impuestos');
    if(c.analysis!=null)energyValidateTariff(c.analysis);
    if(c.analysisPeriods!=null){
      if(!Array.isArray(c.analysisPeriods)||c.analysisPeriods.length>500)throw new Error('Períodos de tarifa no válidos');
      var dates={};c.analysisPeriods.forEach(function(p){if(!p||!validIsoDate(p.start)||dates[p.start])throw new Error('Fechas de tarifa no válidas o repetidas');dates[p.start]=true;energyValidateTariff(p.tariff);});
    }
    if(!Array.isArray(c.prices)||c.prices.length>50)throw new Error('Precios no válidos');
    c.prices.forEach(function(p){if(!p||typeof p.label!=='string'||!p.label.trim()||p.label.length>100||typeof p.unit!=='string'||!p.unit.trim()||p.unit.length>60||typeof p.value!=='number'||!Number.isFinite(p.value)||p.value<0)throw new Error('Revisa los conceptos y precios');});
  });
  return list;
}
function energyContractSignature(c){return JSON.stringify([c.kind,c.supply.trim().toLowerCase(),c.supplier.trim().toLowerCase(),c.tariff.trim().toLowerCase(),c.start,c.end]);}
function energyMergeContracts(current,incoming){
  validateEnergyContracts(incoming);
  var result=JSON.parse(JSON.stringify(current));
  incoming.forEach(function(c){
    var i=result.findIndex(function(x){return x.id===c.id||energyContractSignature(x)===energyContractSignature(c);});
    if(i<0)result.push(c);else result[i]=Object.assign({},result[i],c,{id:result[i].id});
  });
  validateEnergyContracts(result);return result;
}
function energySaveContracts(list){validateEnergyContracts(list);appStorage.setItem(ENERGY_HISTORY_KEY,JSON.stringify(list));}
function energyHistoryButton(kind){return '<button class="ev-io-btn io-primaria energy-analysis-open" data-energy-kind="'+kind+'">Consumo y tarifas</button>';}

function energyContractStatus(c){
  var today=dk(new Date());
  return c.end&&c.end<today?'Finalizado':c.start&&c.start>today?'Próximo':c.start?(c.end?'En vigencia':'Sin cierre registrado'):'Fechas pendientes';
}
/* El histórico se consulta en la ventana propia; no hay alta o edición manual. */
function openEnergyHistory(kind){ENERGY_ANALYSIS_TAB='tarifas';openEnergyAnalysis(kind);}
function bindEnergyHistory(){document.querySelectorAll('.energy-analysis-open').forEach(function(b){b.onclick=function(){ENERGY_ANALYSIS_TAB='resumen';openEnergyAnalysis(b.dataset.energyKind);};});document.querySelectorAll('.energy-bills-open').forEach(function(b){b.onclick=function(){openEnergyBills(b.dataset.energyKind);};});document.querySelectorAll('.energy-history-open').forEach(function(b){b.onclick=function(){openEnergyHistory(b.dataset.energyKind);};});}
