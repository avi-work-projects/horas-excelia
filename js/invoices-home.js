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
function homeInvoiceCheckedAt(value){return new Date(value).toLocaleString('es-ES',{timeZone:'Europe/Madrid',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
function homeInvoiceScheduleDate(year,month){var day=new Date(year,month,20);while(!day.getDay()||day.getDay()===6||dayT(day)!=='normal')day=ad(day,-1);return dk(day);}
function homePreviousInvoicePeriod(year,month){var previous=new Date(year,month-1,1);return mkey(previous.getFullYear(),previous.getMonth());}
function homeInvoiceModel(year,month){
  var period=mkey(year,month),url='';try{url=invoiceData().config.kairoUrl;}catch(e){}
  var model={period:period,url:url,tone:'unknown',title:'Factura del mes',detail:'Puedes preparar la factura o consultar su estado en Kairo.'};
  var saved=INVOICE_HOME_CACHE.url===url&&INVOICE_HOME_CACHE.periods[period],data=saved&&saved.data;
  var today=new Date();
  if(period>=mkey(today.getFullYear(),today.getMonth())&&(!data||['missing','draft','issued'].includes(data.state))){
    var pending=homeSubmissionWeeks(year,month).find(function(week){
      return !week.extra&&dk(ad(week.mon,4)).slice(0,7)>=period&&!(url?hoursCovered(week.key):SW[week.key]);
    });
    if(pending)return Object.assign(model,{title:'Factura sin enviar',tone:'pending',unsent:true,detail:'* Programa primero los envíos de horas de este mes.',week:pending.key,configure:!url});
  }
  if(!url)return Object.assign(model,{title:'Conectar facturas con Kairo',detail:'Puedes preparar el mes en Gestify o conectar Kairo.',configure:true});
  var previousPeriod=homePreviousInvoicePeriod(year,month);
  if(period>=mkey(today.getFullYear(),today.getMonth())&&previousPeriod>=INVOICE_FIRST_PERIOD&&(!data||['missing','draft','issued'].includes(data.state))){
    var previous=INVOICE_HOME_CACHE.url===url&&INVOICE_HOME_CACHE.periods[previousPeriod];
    if(!previous||!previous.data||!['scheduled','sent'].includes(previous.data.state))
      return Object.assign(model,{title:'Factura sin enviar',tone:'pending',unsent:true,previousPeriod:previousPeriod,detail:'* Programa primero la factura del mes anterior.'});
  }
  if(!data){if(homePeriodMode(year,month)==='closed'){model.title='Factura de mes cerrado';model.detail='Histórico guardado · sin consultas automáticas';}return model;}
  var pending=['missing','draft','issued'].includes(data.state);
  model.unsent=pending;
  model.title=data.state==='sent'?'Factura enviada':data.state==='scheduled'?'Factura programada':pending?'Factura sin enviar':data.state==='processing'?'Factura en proceso':'Factura por revisar';
  model.tone=data.state==='sent'?'complete':data.state==='scheduled'?'scheduled':pending||['attention','multiple'].includes(data.state)?'pending':'unknown';
  model.detail=data.state==='sent'?'Envío confirmado':data.state==='scheduled'?'Envío el '+data.scheduledDate.split('-').reverse().slice(0,2).join('/'):'Fecha prevista: '+homeInvoiceScheduleDate(year,month).split('-').reverse().slice(0,2).join('/');
  if(data.state==='scheduled'&&data.scheduledDate!==homeInvoiceScheduleDate(year,month)){model.detail+=' · revisar fecha';model.attention=true;}
  if(data.state==='missing'){model.preparation='Pendiente de preparar';}
  if(['attention','multiple','processing'].includes(data.state))model.detail='Consulta el detalle en Kairo.';
  model.changed=invoiceHasLocalChanges(period,invoiceData());
  if(model.changed){model.detail+=' · cambios locales por revisar';model.tone='pending';}
  model.checkedAt=saved.checkedAt;return model;
}
function renderHomeInvoiceStatus(year,month){
  if(mkey(year,month)<INVOICE_FIRST_PERIOD)return '<button type="button" id="invoiceHomeBtn" class="home-invoice-action" data-home-invoice="send">Ver cálculo histórico</button>';
  var m=homeInvoiceModel(year,month),icon=m.tone==='complete'?'✓':m.tone==='scheduled'?dispatchIcon('invoice'):'!';
  var urgent=m.unsent&&homeDueSoon(homeInvoiceScheduleDate(year,month));
  var action;
  if(m.week){
    action='<button type="button" class="home-invoice-action" data-home-invoice="hours" data-week="'+m.week+'">Revisar horas</button>';
  }else if(m.previousPeriod){
    action='<button type="button" class="home-invoice-action" data-home-invoice="previous" data-period="'+m.previousPeriod+'">Ver mes anterior</button>';
  }else if(m.configure||m.unsent||m.changed||m.tone==='unknown'){
    action='<button type="button" class="home-invoice-action'+(m.changed?'':' home-send-invoice')+'" id="invoiceHomeBtn" data-home-invoice="send">'+(m.changed?'Revisar cambios':dispatchIcon('invoice')+'<span>Enviar factura</span>')+'</button>';
  }else if(m.tone==='scheduled'){
    action='<button type="button" class="home-schedule-action" data-home-invoice="calendar">'+homeScheduleLabel()+'</button>';
  }else{
    var reviewUrl=invoiceKairoUrl(m.url)+'gestify-month?period='+m.period;
    action='<a class="home-invoice-action" data-kairo-review href="'+escHtml(reviewUrl)+'" target="_blank" rel="noopener noreferrer">'+'Ver factura</a>';
  }
  if(INVOICE_HOME_STATUS.phase==='error'&&INVOICE_HOME_STATUS.period===m.period&&INVOICE_HOME_STATUS.url===m.url&&INVOICE_HOME_STATUS.reason)m.detail+=' '+INVOICE_HOME_STATUS.reason;
  if(m.configure)action='<div class="home-invoice-options">'+action+'<button type="button" class="home-invoice-action" data-home-invoice="configure">Conectar Kairo</button></div>';
  return '<section class="home-invoice-status '+m.tone+(urgent?' urgent':'')+(m.unsent?' unsent':'')+'" id="homeInvoiceStatus" aria-label="Estado de factura" aria-live="polite"><span class="home-invoice-icon" aria-hidden="true">'+icon+'</span><div class="home-invoice-copy"><strong>'+escHtml(m.title)+'</strong>'+(m.preparation?'<span>'+m.preparation+'</span>':'')+'<span>'+(m.week||m.previousPeriod?'<em>'+escHtml(m.detail)+'</em>':escHtml(m.detail))+'</span></div>'+action+'</section>';
}
function paintHomeInvoiceStatus(){if(typeof paintInvoiceCalendar==='function')paintInvoiceCalendar();var current=document.getElementById('homeInvoiceStatus');if(current)current.outerHTML=renderHomeInvoiceStatus(CY,CM);}
async function fetchHomeInvoiceStatus(period,url,force){
  var pending=INVOICE_HOME_REQUESTS[period+'|'+url];if(pending)return pending;
  if(INVOICE_HOME_CACHE.url!==url)INVOICE_HOME_CACHE={schema:1,url:url,periods:{}};
  var previous=INVOICE_HOME_CACHE.periods[period]||{data:null,checkedAt:0};
  var due=previous.data&&previous.data.state==='scheduled'&&hoursCivilTime(new Date().toISOString())>=previous.data.scheduledDate+'T08:00'&&(!previous.checkedAt||hoursCivilTime(new Date(previous.checkedAt).toISOString())<previous.data.scheduledDate+'T08:00');
  if(!force&&(previous.attempted&&!due||due&&previous.dueChecked))return;
  previous.attempted=true;if(due)previous.dueChecked=true;INVOICE_HOME_CACHE.periods[period]=previous;homeInvoiceCacheSave();
  var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},8000);var finish;INVOICE_HOME_REQUESTS[period+'|'+url]=new Promise(function(resolve){finish=resolve;});var ok=false;
  if(period===mkey(CY,CM))INVOICE_HOME_STATUS={period:period,url:url,phase:'loading',checkedAt:previous.checkedAt};
  try{
    var response=await fetch(invoiceKairoUrl(url)+'gestify-status?period='+period,{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!response.ok)throw new Error('Kairo no disponible');var data=validateHomeInvoiceStatus(await response.json(),period);
    if(INVOICE_HOME_CACHE.url!==url)return;
    INVOICE_HOME_CACHE.periods[period]={data:data,checkedAt:Date.now(),attempted:true,dueChecked:!!due};homeInvoiceCacheSave();if(period===mkey(CY,CM))INVOICE_HOME_STATUS={period:period,url:url,phase:'ready',data:data,checkedAt:Date.now()};ok=true;
  }catch(e){if(period===mkey(CY,CM))INVOICE_HOME_STATUS={period:period,url:url,phase:'error',checkedAt:previous.checkedAt,reason:e.name==='AbortError'||e instanceof TypeError?hoursCheckMessage('network'):'Kairo no ha podido confirmar el estado de la factura.'};}
  finally{clearTimeout(timeout);delete INVOICE_HOME_REQUESTS[period+'|'+url];finish(ok);paintHomeInvoiceStatus();}
  return ok;
}
async function syncHomeInvoiceStatus(force){
  var model=homeInvoiceModel(CY,CM);if(!model.url||!document.getElementById('homeInvoiceStatus'))return;
  if(force){
    var previous=homePreviousInvoicePeriod(CY,CM);
    var checks=[fetchHomeInvoiceStatus(model.period,model.url,true)];
    if(previous>=INVOICE_FIRST_PERIOD)checks.push(fetchHomeInvoiceStatus(previous,model.url,true));
    var results=await Promise.all(checks);
    return results.every(Boolean);
  }
  if(homePeriodMode(CY,CM)==='future'){
    if(homeSubmissionWeeks(CY,CM).some(function(w){return !w.extra&&!hoursCovered(w.key);}))return;
    return Promise.all([fetchHomeInvoiceStatus(model.period,model.url,false),fetchHomeInvoiceStatus(homePreviousInvoicePeriod(CY,CM),model.url,false)]);
  }
  if(homePeriodMode(CY,CM)!=='audit')return;
  var now=new Date();await Promise.all([-1,0,1].map(function(offset){var d=new Date(now.getFullYear(),now.getMonth()+offset,1);return fetchHomeInvoiceStatus(mkey(d.getFullYear(),d.getMonth()),model.url,false);}));
}
function initHomeInvoiceStatus(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  container.addEventListener('click',function(e){
    var link=e.target.closest('[data-kairo-review]');
    if(link&&!e.ctrlKey&&!e.metaKey){e.preventDefault();openCheckedInvoice(link.href);return;}
    var button=e.target.closest('[data-home-invoice]');if(!button)return;
    if(button.dataset.homeInvoice==='send')openInvoiceMonth(mkey(CY,CM));
    else if(button.dataset.homeInvoice==='calendar')openMailCalendar();
    else if(button.dataset.homeInvoice==='previous')openInvoiceMonth(button.dataset.period);
    else if(button.dataset.homeInvoice==='hours'){
      var card=container.querySelector('.week-card[data-week="'+button.dataset.week+'"]');
      if(card){card.scrollIntoView({block:'center'});var edit=card.querySelector('.sent-toggle');if(edit)edit.focus({preventScroll:true});}
    }else openInvoiceSettings({connection:true});
  });
  window.addEventListener('storage',function(e){if(e.key===INVOICE_HOME_CACHE_KEY){INVOICE_HOME_CACHE=homeInvoiceCacheRead();paintHomeInvoiceStatus();}});syncHomeInvoiceStatus(false);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initHomeInvoiceStatus);
