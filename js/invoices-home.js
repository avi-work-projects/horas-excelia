/* Estado remoto en memoria. Las consultas nunca preparan ni modifican facturas. */
var INVOICE_HOME_STATUS={period:'',url:'',phase:'idle',data:null,checkedAt:0};
var INVOICE_HOME_REQUEST=null;
var INVOICE_HOME_SEQUENCE=0;
function homeInvoiceCheckedAt(value){return new Date(value).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}

function homeInvoiceModel(year,month){
  var period=mkey(year,month),url='';
  try{url=invoiceData().config.kairoUrl;}catch(e){return {period:period,url:'',tone:'unknown',title:'Revisar conexión de facturas',detail:'Comprueba los datos de factura y correo.',configure:true};}
  if(!url)return {period:period,url:url,tone:'unknown',title:'Estado de factura sin sincronizar',detail:'Conecta Kairo para consultar este mes.',configure:true};
  var s=INVOICE_HOME_STATUS,model={period:period,url:url,tone:'unknown',title:'Factura sin consultar',detail:'Consulta el estado de este mes en Kairo.'};
  if(s.period!==period||s.url!==url)return model;
  if(s.phase==='loading'){model.title='Consultando factura…';model.detail='Comprobando el estado en Kairo.';return model;}
  if(s.phase==='error'){
    model.title='Sin conexión con Kairo';model.detail='Activa Tailscale o revisa el acceso a red local.';
    if(s.checkedAt)model.detail+=' Última consulta: '+homeInvoiceCheckedAt(s.checkedAt)+'.';
    return model;
  }
  if(s.phase!=='ready'||!s.data)return model;
  var data=s.data,labels={missing:['Factura pendiente de preparar','Todavía no consta una factura de este mes en Kairo.'],draft:['Factura pendiente de enviar','Borrador preparado; revisa su aprobación en Kairo.'],issued:['Factura pendiente de enviar','Factura emitida; el correo sigue pendiente.'],scheduled:['Factura programada',data.scheduledDate?'Envío previsto: '+data.scheduledDate.split('-').reverse().join('/')+' · 08:00 Madrid.':'Consulta su programación en Kairo.'],sent:['Factura enviada','Envío confirmado por Kairo.'],processing:['Factura en proceso','Kairo está procesando la emisión o el envío.'],attention:['Factura pendiente de revisión','Consulta el estado en Kairo antes de continuar.'],multiple:['Revisar facturas de este mes','Hay varias facturas en Kairo para este mes.']};
  var label=labels[data.state];model.title=label[0];model.detail=label[1];model.tone=data.state==='sent'?'complete':data.state==='scheduled'?'scheduled':['missing','draft','issued','attention','multiple'].includes(data.state)?'pending':'unknown';
  // Los meses futuros aún no requieren un envío pendiente.
  if(data.state==='missing'&&period>mkey(new Date().getFullYear(),new Date().getMonth())){model.title='Factura aún no preparada';model.tone='unknown';}
  model.detail+=' Consultado '+homeInvoiceCheckedAt(s.checkedAt)+'.';
  return model;
}

function renderHomeInvoiceStatus(year,month){
  // El circuito Kairo empieza en el mismo período que Enviar factura.
  if(mkey(year,month)<INVOICE_FIRST_PERIOD)return '';
  var m=homeInvoiceModel(year,month),icon=m.tone==='complete'?'✓':m.tone==='pending'?'⚠':'◷';
  return '<section class="home-invoice-status '+m.tone+'" id="homeInvoiceStatus" aria-label="Estado de factura" aria-live="polite"><span class="home-invoice-icon" aria-hidden="true">'+icon+'</span><div class="home-invoice-copy"><strong>'+escHtml(m.title)+'</strong><span>'+escHtml(m.detail)+'</span>'+(m.url?'<a href="'+escHtml(m.url)+'" target="_blank" rel="noopener noreferrer">Ver en Kairo</a>':'')+'</div><button type="button" class="home-invoice-refresh" data-home-invoice="'+(m.configure?'configure':'refresh')+'" aria-label="'+(m.configure?'Configurar conexión con Kairo':'Actualizar estado de factura')+'"'+(INVOICE_HOME_STATUS.phase==='loading'&&INVOICE_HOME_STATUS.period===m.period?' disabled':'')+'>'+(m.configure?'Conectar':'↻')+'</button></section>';
}

function paintHomeInvoiceStatus(){
  var current=document.getElementById('homeInvoiceStatus');
  if(current)current.outerHTML=renderHomeInvoiceStatus(CY,CM);
}

function validateHomeInvoiceStatus(data,period){
  var states=['missing','draft','issued','scheduled','sent','processing','attention','multiple'];
  if(!data||data.period!==period||!states.includes(data.state)||['generated','issued','scheduled','sent'].some(function(k){return typeof data[k]!=='boolean';})||!(data.scheduledDate===null||validIsoDate(data.scheduledDate)))throw new Error('Estado de Kairo no válido');
  if(data.state==='sent'&&!data.sent||data.state==='scheduled'&&(!data.scheduled||!data.scheduledDate))throw new Error('Estado de Kairo incoherente');
  return {period:period,state:data.state,generated:data.generated,issued:data.issued,scheduled:data.scheduled,sent:data.sent,scheduledDate:data.scheduledDate};
}

async function syncHomeInvoiceStatus(force){
  if(!document.getElementById('homeInvoiceStatus'))return;
  var model=homeInvoiceModel(CY,CM),period=model.period,url=model.url;if(!url){if(INVOICE_HOME_REQUEST){++INVOICE_HOME_SEQUENCE;INVOICE_HOME_REQUEST.abort();INVOICE_HOME_REQUEST=null;}INVOICE_HOME_STATUS={period:period,url:'',phase:'idle',data:null,checkedAt:0};paintHomeInvoiceStatus();return;}
  var previous=INVOICE_HOME_STATUS,same=previous.period===period&&previous.url===url;
  if(same&&(previous.phase==='loading'||!force&&Date.now()-(previous.attemptedAt||previous.checkedAt)<60000))return;
  if(INVOICE_HOME_REQUEST)INVOICE_HOME_REQUEST.abort();
  var controller=new AbortController(),sequence=++INVOICE_HOME_SEQUENCE;
  var attemptedAt=Date.now();
  INVOICE_HOME_REQUEST=controller;INVOICE_HOME_STATUS={period:period,url:url,phase:'loading',data:same?previous.data:null,checkedAt:same?previous.checkedAt:0,attemptedAt:attemptedAt};paintHomeInvoiceStatus();
  var timeout=setTimeout(function(){controller.abort();},8000);
  try{
    url=invoiceKairoUrl(url);
    var response=await fetch(url+'gestify-status?period='+encodeURIComponent(period),{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!response.ok)throw new Error('Estado no disponible');
    var data=validateHomeInvoiceStatus(await response.json(),period);
    if(sequence!==INVOICE_HOME_SEQUENCE)return;
    INVOICE_HOME_STATUS={period:period,url:url,phase:'ready',data:data,checkedAt:Date.now(),attemptedAt:attemptedAt};
  }catch(e){if(sequence!==INVOICE_HOME_SEQUENCE)return;INVOICE_HOME_STATUS={period:period,url:url,phase:'error',data:same?previous.data:null,checkedAt:same?previous.checkedAt:0,attemptedAt:attemptedAt};}
  finally{clearTimeout(timeout);if(sequence===INVOICE_HOME_SEQUENCE){INVOICE_HOME_REQUEST=null;paintHomeInvoiceStatus();}}
}

function initHomeInvoiceStatus(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  container.addEventListener('click',function(e){var button=e.target.closest('[data-home-invoice]');if(!button)return;if(button.dataset.homeInvoice==='configure')openInvoiceSettings({connection:true});else syncHomeInvoiceStatus(true);});
  function resume(){if(!document.hidden&&!document.querySelector('.full-overlay.open,#invoiceOv.open'))syncHomeInvoiceStatus(true);}
  window.addEventListener('focus',resume);window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);syncHomeInvoiceStatus();
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initHomeInvoiceStatus);
