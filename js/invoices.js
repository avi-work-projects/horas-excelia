/* Preparación mensual auxiliar. La emisión oficial se realiza fuera de Gestify. */
var INVOICE_KEY='excelia-invoices-v1';
var INVOICE_MONTH=null;
var INVOICE_BACK=null;
var INVOICE_OPEN_SEQ=0;
function invoiceDefaults(){return {issuer:'',issuerTax:'',issuerAddress:'',client:'',clientTax:'',clientAddress:'',project:'',concept:'Servicios de consultoría · {mes} {anio}',unit:'day',rate:'',vat:'21',withholding:'15',from:'',to:'',cc:'',subject:'Factura · {mes} {anio}',body:'Buenos días!\n\nAdjunto la factura relativa a {mes}.\n\nConfirmad recepción,\n\nMuchas gracias,\n\nBuena semana!'};}
function invoiceData(){var raw=appStorage.getItem(INVOICE_KEY);return raw?invoiceValidate(JSON.parse(raw)):{config:invoiceDefaults(),months:{}};}
function invoiceValidate(data){
  if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Datos de facturación no válidos');
  var config=invoiceDefaults();Object.keys(config).forEach(function(k){if(data.config&&data.config[k]!=null){if(typeof data.config[k]!=='string'||data.config[k].length>5000)throw new Error('Campo de facturación no válido');config[k]=data.config[k];}});
  if(!['day','hour'].includes(config.unit))throw new Error('Unidad no válida');
  var months={};Object.keys(data.months||{}).forEach(function(k){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(k))throw new Error('Mes de facturación no válido');
    var r=data.months[k];if(!r||typeof r!=='object'||Array.isArray(r))throw new Error('Registro mensual no válido');
    if(r.final){var f=r.final;if(typeof f.pdf!=='string'||f.pdf.length>2800000||!/^data:application\/pdf;base64,JVBERi0[A-Za-z0-9+/=\r\n]*$/.test(f.pdf)||typeof f.number!=='string'||typeof f.name!=='string'||typeof f.hash!=='string'||!validIsoDate(f.date)||k<'2026-10')throw new Error('PDF definitivo o referencia no válidos');}
    if(r.preparation){
      var p=r.preparation;if(!Array.isArray(p.lines)||p.period!==k||!Array.isArray(p.days)||p.kind!=='auxiliary'||!p.issuer||!p.client||typeof p.issuer.name!=='string'||typeof p.client.name!=='string'||typeof p.concept!=='string')throw new Error('Preparación mensual no válida');
      ['baseCents','vatCents','withholdingCents','totalCents','vatBasisPoints','withholdingBasisPoints','revision'].forEach(function(key){if(!Number.isSafeInteger(p[key])||p[key]<0)throw new Error('Importes de preparación no válidos');});
      var checked=invoiceCalculate(k,{vat:String(p.vatBasisPoints/100),withholding:String(p.withholdingBasisPoints/100),concept:p.concept},p.days);
      ['baseCents','vatCents','withholdingCents','totalCents'].forEach(function(key){if(p[key]!==checked[key])throw new Error('Los importes del backup no coinciden con sus días y tarifas');});
      if(JSON.stringify(p.lines)!==JSON.stringify(checked.lines))throw new Error('Líneas de cálculo no válidas');
    }
    if(r.final&&(!r.preparation||r.final.preparationHash!==r.preparation.contentHash))throw new Error('El PDF no corresponde a la preparación guardada');
    months[k]=r;
  });return {config:config,months:months};
}
function invoiceSave(data){appStorage.setItem(INVOICE_KEY,JSON.stringify(invoiceValidate(data)));}
function invoiceMerge(current,incoming){
  current=invoiceValidate(current);incoming=invoiceValidate(incoming);
  Object.keys(incoming.months).forEach(function(k){var a=current.months[k],b=incoming.months[k];if(a&&JSON.stringify(a)!==JSON.stringify(b))throw new Error('Hay dos versiones de facturación para '+k+'. Conserva ambas copias y revisa antes de reemplazar.');});
  return {config:Object.assign({},current.config,incoming.config),months:Object.assign({},current.months,incoming.months)};
}
function invoiceDecimal(value,scale){
  var s=String(value).trim().replace(',','.');if(!/^\d+(\.\d+)?$/.test(s))throw new Error('Revisa los importes: utiliza números positivos');
  var parts=s.split('.'),dec=parts[1]||'';if(dec.length>scale)throw new Error('Demasiados decimales');var n=Number(parts[0])*Math.pow(10,scale)+Number(dec.padEnd(scale,'0'));if(!Number.isSafeInteger(n))throw new Error('Importe demasiado grande');return n;
}
function invoiceMoney(cents){return (cents/100).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';}
function invoiceLabel(period){return MN[Number(period.slice(5))-1]+' '+period.slice(0,4);}
function invoiceText(text,period){return String(text||'').replace(/\{mes\}/g,MN[Number(period.slice(5))-1]).replace(/\{anio\}/g,period.slice(0,4)).replace(/\{periodo\}/g,period);}
function invoiceDayRows(period,config){
  var year=+period.slice(0,4),month=+period.slice(5)-1,cfg=ECON_YEAR_CONFIG[year]||{};
  var periods=cfg.multiRate?_buildDatePeriods(year,cfg.ratePeriods||[]):[];
  periods=(periods||[]).slice().sort(function(a,b){return a.startDate.localeCompare(b.startDate);});
  var rows=[];for(var day=1;day<=new Date(year,month+1,0).getDate();day++){
    var date=new Date(year,month,day),ds=dk(date),type=dayT(date),weekend=date.getDay()===0||date.getDay()===6;
    var rate=cfg.rate||0,mode=cfg.rateMode||'daily',unit='day',rateIssue='';periods.forEach(function(p){if(p.startDate<=ds){rate=p.rate;mode=p.rateMode||'daily';}});
    if(config.rate.trim()!==''){rate=config.rate;unit=config.unit;}
    else if(mode!=='daily'){rate='0';rateIssue='Configura una tarifa explícita en Edición facturas y correo: Económico conserva una equivalencia diaria, no la tarifa horaria contractual.';}
    rows.push({date:ds,type:type,weekend:weekend,selected:!weekend&&type==='normal',hours:dayH(date),rate:String(rate),unit:unit,rateIssue:rateIssue});
  }return rows;
}
function invoiceCalculate(period,config,rows){
  var chosen=rows.filter(function(r){return r.selected;}),seen={},groups={};
  if(!chosen.length)throw new Error('Selecciona al menos un día');
  var vat=invoiceDecimal(config.vat,2),ret=invoiceDecimal(config.withholding,2);if(vat>10000||ret>10000)throw new Error('El porcentaje no puede superar el 100 %');
  chosen.forEach(function(r){
    if(!validIsoDate(r.date)||r.date.slice(0,7)!==period||seen[r.date])throw new Error('Fecha duplicada o fuera del mes');seen[r.date]=true;
    if(r.rateIssue)throw new Error(r.rateIssue);
    if(!['day','hour'].includes(r.unit))throw new Error('Unidad no válida');
    var rate=invoiceDecimal(r.rate,2),qty=r.unit==='day'?100:invoiceDecimal(r.hours,2);if(!rate||!qty)throw new Error('Falta tarifa u horas para '+r.date);
    var key=r.unit+'|'+rate;if(!groups[key])groups[key]={unit:r.unit,rateCents:rate,quantity100:0};groups[key].quantity100+=qty;
  });
  var lines=Object.values(groups),base=0;lines.forEach(function(l){var product=l.quantity100*l.rateCents;if(!Number.isSafeInteger(product))throw new Error('Importe demasiado grande');l.baseCents=Math.round(product/100);base+=l.baseCents;});
  if(!Number.isSafeInteger(base*10000))throw new Error('Importe demasiado grande');
  var iva=Math.round(base*vat/10000),irpf=Math.round(base*ret/10000);
  return {schemaVersion:1,appVersion:APP_VERSION,period:period,kind:'auxiliary',condition:'calendar-month',issuer:{name:config.issuer,taxId:config.issuerTax,address:config.issuerAddress},client:{name:config.client,taxId:config.clientTax,address:config.clientAddress},project:config.project,concept:invoiceText(config.concept,period),days:chosen,lines:lines,vatBasisPoints:vat,withholdingBasisPoints:ret,baseCents:base,vatCents:iva,withholdingCents:irpf,totalCents:base+iva-irpf};
}
async function invoiceHash(value){var bytes=typeof value==='string'?new TextEncoder().encode(value):value;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(function(b){return b.toString(16).padStart(2,'0');}).join('');}
async function invoicePrepare(period,config,rows){
  if(!config.issuer.trim()||!config.issuerTax.trim()||!config.client.trim()||!config.clientTax.trim()||!config.project.trim())throw new Error('Completa emisor, cliente, NIF y proyecto en Edición facturas y correo');
  var data=invoiceData();if(data.months[period]&&data.months[period].final)throw new Error('Este mes ya tiene un PDF definitivo. La preparación queda conservada.');
  var p=invoiceCalculate(period,config,rows);p.operationId=await invoiceHash(JSON.stringify([config.issuerTax.trim().toUpperCase(),config.clientTax.trim().toUpperCase(),period,config.project.trim().toLowerCase()]));
  var hashInput=Object.assign({},p);delete hashInput.appVersion;p.contentHash=await invoiceHash(JSON.stringify(hashInput));var previous=data.months[period]&&data.months[period].preparation;
  p.revision=previous&&previous.contentHash===p.contentHash?previous.revision:(previous&&previous.revision||0)+1;p.preparedAt=new Date().toISOString();
  data.months[period]=Object.assign({},data.months[period],{preparation:p});invoiceSave(data);return p;
}
function invoiceEmails(value){return String(value||'').split(/[;,]/).map(function(s){return s.trim();}).filter(Boolean).map(function(s){var match=s.match(/<([^<>]+)>$/),email=match?match[1]:s;if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email))throw new Error('Revisa las direcciones de correo');return email;});}
function invoiceGmailUrl(config,period){
  var from=invoiceEmails(config.from),to=invoiceEmails(config.to),cc=invoiceEmails(config.cc);if(from.length!==1||!to.length)throw new Error('Completa la cuenta Gmail y los destinatarios en Configuración');
  return 'https://mail.google.com/mail/?view=cm&fs=1&authuser='+encodeURIComponent(from[0])+'&to='+encodeURIComponent(to.join(','))+'&cc='+encodeURIComponent(cc.join(','))+'&su='+encodeURIComponent(invoiceText(config.subject,period))+'&body='+encodeURIComponent(invoiceText(config.body,period));
}
async function invoiceAttach(period,file,number,date,confirmed){
  if(period<'2026-10')throw new Error('Periodo histórico: no se permite preparar un nuevo envío');
  var data=invoiceData(),record=data.months[period];if(!record||!record.preparation)throw new Error('Prepara primero el mes');
  if(!confirmed||!number.trim()||!validIsoDate(date))throw new Error('Confirma el PDF definitivo, su número y fecha de expedición');
  if(!file||file.size>2*1024*1024||!/\.pdf$/i.test(file.name)||/borrador|auxiliar|ensayo|preprod/i.test(file.name))throw new Error('Selecciona el PDF definitivo de AEAT (máximo 2 MB), no un borrador o ensayo');
  var bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw new Error('El archivo no es un PDF');
  var hash=await invoiceHash(bytes);Object.keys(data.months).forEach(function(k){var f=data.months[k].final;if(k!==period&&f&&(f.hash===hash||f.number.trim()===number.trim()))throw new Error('Este PDF o número ya está asociado a '+k);});
  var pdf=await new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=reject;reader.readAsDataURL(new Blob([bytes],{type:'application/pdf'}));});
  record.final={name:file.name,number:number.trim(),date:date,pdf:pdf,hash:hash,confirmedAt:new Date().toISOString(),preparationHash:record.preparation.contentHash};invoiceSave(data);
}
function invoiceFinalBlob(record){if(!record||!record.final)throw new Error('Pendiente de emitir en AEAT');var b=atob(record.final.pdf.split(',')[1]);return new Blob([Uint8Array.from(b,function(c){return c.charCodeAt(0);})],{type:'application/pdf'});}

/* Solo configuración: nunca importa preparaciones ni documentos emitidos. */
function invoiceConfigImport(input,current){
  if(!input||input.format!=='gestify-invoice-settings'||input.version!==1||!input.config||typeof input.config!=='object'||Array.isArray(input.config))throw new Error('Selecciona un archivo de datos de facturación de Gestify');
  var result=Object.assign({},current),keys=Object.keys(invoiceDefaults());
  Object.keys(input.config).forEach(function(k){if(!keys.includes(k)||typeof input.config[k]!=='string'||input.config[k].length>5000)throw new Error('Campo de configuración no válido: '+k);result[k]=input.config[k].trim();});
  result=invoiceValidate({config:result,months:{}}).config;
  if(result.rate!=='')invoiceDecimal(result.rate,2);
  ['vat','withholding'].forEach(function(k){if(invoiceDecimal(result[k],2)>10000)throw new Error('Porcentaje superior al 100 %');});
  ['from','to','cc'].forEach(function(k){if(result[k])invoiceEmails(result[k]);});return result;
}
