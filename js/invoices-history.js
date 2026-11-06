/* Derived history travels with Kairo's existing status reply. No Gmail polling. */
function validateInvoiceMailHistory(value){
  if(!value||value.schema!==1||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(value.through)||!Number.isFinite(Date.parse(value.checkedAt))||!value.months||typeof value.months!=='object'||Array.isArray(value.months)||Object.keys(value.months).length>180)throw Error('Histórico de facturas no válido');
  if(value.workStart!=null&&!validIsoDate(value.workStart))throw Error('Inicio de actividad no válido');
  var months={};
  Object.keys(value.months).forEach(function(period){
    var row=value.months[period];
    if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period)||period>value.through||!row||!validIsoDate(row.sentDate)||!validIsoDate(row.lastSentDate)||row.lastSentDate<row.sentDate||!Number.isInteger(row.count)||row.count<1||row.count>5000)throw Error('Fecha histórica no válida');
    months[period]={sentDate:row.sentDate,lastSentDate:row.lastSentDate,count:row.count};
  });
  return {schema:1,through:value.through,checkedAt:value.checkedAt,workStart:value.workStart||null,months:months};
}
function homeInvoiceHistoricalFact(period,url){
  var cache=INVOICE_HOME_CACHE;
  return cache.url===url&&cache.history&&cache.history.months[period]||null;
}
