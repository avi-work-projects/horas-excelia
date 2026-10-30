/* Read-only invoice facts, persisted per connection/month. Displaying Home
   never prepares, changes or reschedules an invoice. */
var INVOICE_HOME_CACHE_KEY='excelia-invoice-status-v1';
var INVOICE_HOME_STATUS={period:'',url:'',phase:'idle',data:null,checkedAt:0};
var INVOICE_HOME_REQUESTS=Object.create(null);
function validateHomeInvoiceStatus(data,period){
  var states=['missing','draft','issued','scheduled','sent','processing','attention','multiple'];
  if(!data||data.period!==period||!states.includes(data.state)||['generated','issued','scheduled','sent'].some(function(k){return typeof data[k]!=='boolean';})||!(data.scheduledDate===null||validIsoDate(data.scheduledDate)))throw new Error('Estado de Kairo no válido');
  if(data.state==='sent'&&!data.sent||data.state==='scheduled'&&(!data.scheduled||!data.scheduledDate))throw new Error('Estado de Kairo incoherente');
  return {period:period,state:data.state,generated:data.generated,issued:data.issued,scheduled:data.scheduled,sent:data.sent,scheduledDate:data.scheduledDate};
}
function homeInvoiceCacheRead(){
  var empty={schema:1,url:'',periods:{}};
  try{
    var data=JSON.parse(localStorage.getItem(INVOICE_HOME_CACHE_KEY)||'null');if(!data||data.schema!==1||typeof data.url!=='string'||data.url.length>1000||!data.periods)return empty;
    var out={schema:1,url:data.url,periods:{}};
    Object.keys(data.periods).slice(-24).forEach(function(period){try{if(!/^\d{4}-\d{2}$/.test(period))return;var row=data.periods[period];out.periods[period]={attempted:row.attempted===true,dueChecked:row.dueChecked===true,checkedAt:Number.isFinite(row.checkedAt)?row.checkedAt:0,data:row.data?validateHomeInvoiceStatus(row.data,period):null};}catch(e){}});return out;
  }catch(e){return empty;}
}
var INVOICE_HOME_CACHE=homeInvoiceCacheRead();
function homeInvoiceCacheSave(){var keys=Object.keys(INVOICE_HOME_CACHE.periods).sort();keys.slice(0,-24).forEach(function(k){delete INVOICE_HOME_CACHE.periods[k];});try{localStorage.setItem(INVOICE_HOME_CACHE_KEY,JSON.stringify(INVOICE_HOME_CACHE));}catch(e){}}
function homeInvoiceCheckedAt(value){return new Date(value).toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
function homeInvoiceScheduleDate(year,month){var day=new Date(year,month,20);while(!day.getDay()||day.getDay()===6||dayT(day)!=='normal')day=ad(day,-1);return dk(day);}
function homeInvoiceModel(year,month){
  var period=mkey(year,month),url='';try{url=invoiceData().config.kairoUrl;}catch(e){}
  var model={period:period,url:url,tone:'unknown',title:'Factura pendiente de comprobar',detail:'Actualiza el estado para consultar Kairo.'};
  if(!url)return Object.assign(model,{title:'Conectar facturas con Kairo',detail:'Configura la conexión para consultar este mes.',configure:true});
  var saved=INVOICE_HOME_CACHE.url===url&&INVOICE_HOME_CACHE.periods[period],data=saved&&saved.data;
  if(!data){if(homePeriodMode(year,month)==='closed'){model.title='Factura de mes cerrado';model.detail='Histórico guardado · sin consultas automáticas';}return model;}
  var pending=['missing','draft','issued'].includes(data.state);
  model.unsent=pending;
  model.title=data.state==='sent'?'Factura enviada':data.state==='scheduled'?'Factura programada':pending?'Factura sin enviar':data.state==='processing'?'Factura en proceso':'Factura por revisar';
  model.tone=data.state==='sent'?'complete':data.state==='scheduled'?'scheduled':pending||['attention','multiple'].includes(data.state)?'pending':'unknown';
  model.detail=data.state==='sent'?'Envío confirmado':data.state==='scheduled'?'Envío el '+data.scheduledDate.split('-').reverse().slice(0,2).join('/'):'Fecha prevista: '+homeInvoiceScheduleDate(year,month).split('-').reverse().slice(0,2).join('/');
  if(data.state==='scheduled'&&data.scheduledDate!==homeInvoiceScheduleDate(year,month)){model.detail+=' · revisar fecha';model.attention=true;}
  if(data.state==='missing')model.detail='Pendiente de preparar · '+model.detail;
  if(['attention','multiple','processing'].includes(data.state))model.detail='Consulta el detalle en Kairo.';
  model.changed=invoiceHasLocalChanges(period,invoiceData());
  if(model.changed){model.detail+=' · cambios locales por revisar';model.tone='pending';}
  model.checkedAt=saved.checkedAt;return model;
}
function renderHomeInvoiceStatus(year,month){
  if(mkey(year,month)<INVOICE_FIRST_PERIOD)return '';
  var m=homeInvoiceModel(year,month),icon=m.tone==='complete'?'✓':m.tone==='scheduled'?'◷':'!';
  var action=m.configure?'<button type="button" class="home-invoice-action" data-home-invoice="configure">Conectar Kairo</button>':m.unsent||m.changed?'<button type="button" class="home-invoice-action" data-home-invoice="send">'+(m.changed?'Revisar cambios':'Enviar factura')+'</button>':m.url?'<a class="home-invoice-action" href="'+escHtml(invoiceKairoUrl(m.url)+'gestify-month?period='+m.period)+'" target="_blank" rel="noopener noreferrer">'+(m.tone==='scheduled'?'Ver programación':'Ver factura')+'</a>':'';
  return '<section class="home-invoice-status '+m.tone+(m.unsent?' unsent':'')+'" id="homeInvoiceStatus" aria-label="Estado de factura" aria-live="polite"><span class="home-invoice-icon" aria-hidden="true">'+icon+'</span><div class="home-invoice-copy"><strong>'+escHtml(m.title)+'</strong><span>'+escHtml(m.detail)+'</span></div>'+action+'</section>';
}
function paintHomeInvoiceStatus(){if(typeof paintInvoiceCalendar==='function')paintInvoiceCalendar();var current=document.getElementById('homeInvoiceStatus');if(current)current.outerHTML=renderHomeInvoiceStatus(CY,CM);}
async function fetchHomeInvoiceStatus(period,url,force){
  if(INVOICE_HOME_REQUESTS[period+'|'+url])return;
  if(INVOICE_HOME_CACHE.url!==url)INVOICE_HOME_CACHE={schema:1,url:url,periods:{}};
  var previous=INVOICE_HOME_CACHE.periods[period]||{data:null,checkedAt:0};
  var due=previous.data&&previous.data.state==='scheduled'&&hoursCivilTime(new Date().toISOString())>=previous.data.scheduledDate+'T08:00'&&(!previous.checkedAt||hoursCivilTime(new Date(previous.checkedAt).toISOString())<previous.data.scheduledDate+'T08:00');
  if(!force&&(previous.attempted&&!due||due&&previous.dueChecked))return;
  previous.attempted=true;if(due)previous.dueChecked=true;INVOICE_HOME_CACHE.periods[period]=previous;homeInvoiceCacheSave();
  var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},8000);INVOICE_HOME_REQUESTS[period+'|'+url]=true;
  if(period===mkey(CY,CM))INVOICE_HOME_STATUS={period:period,url:url,phase:'loading',checkedAt:previous.checkedAt};
  try{
    var response=await fetch(invoiceKairoUrl(url)+'gestify-status?period='+period,{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!response.ok)throw new Error('Kairo no disponible');var data=validateHomeInvoiceStatus(await response.json(),period);
    if(INVOICE_HOME_CACHE.url!==url)return;
    INVOICE_HOME_CACHE.periods[period]={data:data,checkedAt:Date.now(),attempted:true,dueChecked:!!due};homeInvoiceCacheSave();if(period===mkey(CY,CM))INVOICE_HOME_STATUS={period:period,url:url,phase:'ready',data:data,checkedAt:Date.now()};
  }catch(e){if(period===mkey(CY,CM))INVOICE_HOME_STATUS={period:period,url:url,phase:'error',checkedAt:previous.checkedAt};}
  finally{clearTimeout(timeout);delete INVOICE_HOME_REQUESTS[period+'|'+url];paintHomeInvoiceStatus();}
}
async function syncHomeInvoiceStatus(force){
  var model=homeInvoiceModel(CY,CM);if(!model.url||!document.getElementById('homeInvoiceStatus'))return;
  if(force)return fetchHomeInvoiceStatus(model.period,model.url,true);
  if(homePeriodMode(CY,CM)!=='audit')return;
  var now=new Date();await Promise.all([-1,0,1].map(function(offset){var d=new Date(now.getFullYear(),now.getMonth()+offset,1);return fetchHomeInvoiceStatus(mkey(d.getFullYear(),d.getMonth()),model.url,false);}));
}
function initHomeInvoiceStatus(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  container.addEventListener('click',function(e){var button=e.target.closest('[data-home-invoice]');if(button){if(button.dataset.homeInvoice==='send')openInvoiceMonth(mkey(CY,CM));else openInvoiceSettings({connection:true});}});
  window.addEventListener('storage',function(e){if(e.key===INVOICE_HOME_CACHE_KEY){INVOICE_HOME_CACHE=homeInvoiceCacheRead();paintHomeInvoiceStatus();}});syncHomeInvoiceStatus(false);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initHomeInvoiceStatus);
