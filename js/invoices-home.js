/* Read-only invoice facts, persisted per connection/month. Displaying Home
   never prepares, changes or reschedules an invoice. */
var INVOICE_HOME_CACHE_KEY='excelia-invoice-status-v1';
var INVOICE_HOME_STATUS={period:'',url:'',phase:'idle',data:null,checkedAt:0};
var INVOICE_HOME_REQUESTS=Object.create(null);
function validateHomeInvoiceStatus(data,period){
  var states=['missing','draft','issued','scheduled','sent','processing','attention','multiple'];
  if(!data||data.period!==period||!states.includes(data.state)||['generated','issued','scheduled','sent'].some(function(k){return typeof data[k]!=='boolean';})||!(data.scheduledDate===null||validIsoDate(data.scheduledDate)))throw new Error('Estado de Kairo no válido');
  if(data.state==='sent'&&!data.sent||data.state==='scheduled'&&(!data.scheduled||!data.scheduledDate))throw new Error('Estado de Kairo incoherente');
  if(data.sentDate!=null&&!validIsoDate(data.sentDate))throw new Error('Fecha de envío no válida');
  return {period:period,state:data.state,generated:data.generated,issued:data.issued,scheduled:data.scheduled,sent:data.sent,scheduledDate:data.scheduledDate,sentDate:data.sentDate||null};
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
  var saved=INVOICE_HOME_CACHE.url===url&&INVOICE_HOME_CACHE.periods[period],data=saved&&saved.data;
  var current=period>=mkey(new Date().getFullYear(),new Date().getMonth());
  var pendingWeek=homeSubmissionWeeks(year,month).find(function(week){return !week.extra&&dk(ad(week.mon,4)).slice(0,7)>=period&&!(url?hoursCovered(week.key):SW[week.key]);});
  var previousPeriod=homePreviousInvoicePeriod(year,month),previous=INVOICE_HOME_CACHE.url===url&&INVOICE_HOME_CACHE.periods[previousPeriod];
  var previousReady=previousPeriod<INVOICE_FIRST_PERIOD||!!(previous&&previous.data&&['scheduled','sent'].includes(previous.data.state));
  var state=data?data.state:'missing',unsent=['missing','draft','issued'].includes(state);
  var model={period:period,url:url,unsent:unsent,tone:state==='sent'?'complete':state==='scheduled'?'scheduled':unsent?'pending':'urgent',
    title:state==='sent'?'Factura enviada':state==='scheduled'?'Factura programada':unsent?'Factura sin enviar':state==='processing'?'Factura en proceso':'Factura por revisar',
    date:state==='scheduled'?data.scheduledDate:state==='sent'?data.sentDate||'':homeInvoiceScheduleDate(year,month),
    hoursReady:!pendingWeek,previousReady:previousReady,week:pendingWeek&&pendingWeek.key,previousPeriod:previousPeriod,configure:!url};
  model.requirements=current&&unsent&&(!model.hoursReady||!previousReady);
  model.changed=!!data&&['scheduled','sent'].includes(state)&&invoiceHasLocalChanges(period,invoiceData());
  model.mailChanged=state==='scheduled'&&homeSubmissionWeeks(year,month).some(function(w){return !w.extra&&hoursWeekState(w.key)==='changed';});
  model.attention=state==='scheduled'&&data.scheduledDate!==homeInvoiceScheduleDate(year,month);
  model.editable=state==='scheduled'&&(model.changed||model.mailChanged||model.attention);
  // Older months are treated as completed, as agreed, without inventing an
  // Outlook confirmation or a send date in the persisted invoice history.
  if(period<INVOICE_FIRST_PERIOD||!data&&homePeriodMode(year,month)==='closed'){
    model.title='Factura enviada';model.unsent=false;model.tone='complete';model.date=state==='sent'?data.sentDate||'':'';
    model.requirements=false;model.changed=false;model.mailChanged=false;model.attention=false;model.editable=false;
  }
  return model;
}
function homeInvoiceRequirement(number,text,done){
  return '<div class="home-invoice-rule"><em><strong>('+number+') <u>'+text+'</u></strong></em> <span class="home-rule-result '+(done?'complete':'')+'" role="img" aria-label="'+(done?'Cumplido':'Pendiente')+'">'+(done?'✓':'✕')+'</span></div>';
}
function renderHomeInvoiceStatus(year,month){
  var m=homeInvoiceModel(year,month),urgent=m.unsent&&homeDueSoon(m.date),icon=m.tone==='complete'?'✓':m.tone==='scheduled'?homeStatusIcon('clock'):'!';
  var detail='',action='';
  if(m.requirements)detail='<div class="home-invoice-rules"><em>* Se requiere tener los correos del mes programados</em>'+homeInvoiceRequirement(1,'Los envíos de horas de este mes.',m.hoursReady)+homeInvoiceRequirement(2,'El envío de la factura del mes anterior.',m.previousReady)+'</div>';
  if(m.unsent){
    var days=Math.ceil((Date.parse(m.date+'T12:00:00Z')-Date.parse(dk(new Date())+'T12:00:00Z'))/86400000);
    var deadline=days<0?'El plazo de programación ha vencido.':days===0?'Debe programarse hoy.':'Debe programarse en los próximos '+days+' días.';
    detail+='<p class="home-invoice-deadline">'+homeStatusIcon('invoice')+'<em>'+deadline+'</em></p>';
    if(m.configure)action=homePanelAction('invoice','Enviar','factura','id="invoiceHomeBtn" data-home-invoice="send"');
    else if(m.requirements&&!m.hoursReady){} // The mail panel already owns this action.
    else if(m.requirements&&!m.previousReady)action=homePanelAction('invoice','Ver factura','anterior','data-home-invoice="previous" data-period="'+m.previousPeriod+'"');
    else action=homePanelAction('invoice','Enviar','factura','id="invoiceHomeBtn" data-home-invoice="send"');
  }else if(m.tone==='scheduled'||m.tone==='complete'){
    var warning=m.changed||m.mailChanged||m.attention;
    detail='<div class="home-invoice-date">'+(m.date?'<span class="home-invoice-date-label">'+homeStatusIcon('invoice')+'<time datetime="'+m.date+'">'+m.date.split('-').reverse().slice(0,2).join('/')+'</time></span>':'')+(warning?'<span class="home-invoice-alert">'+homeStatusIcon('warning')+'<span>Revisar Cambios</span></span>':'')+'</div>';
    if(m.editable)action=homePanelAction('edit-invoice','Modificar','envíos','data-home-invoice="modify"');
  }else if(m.tone==='urgent'){
    detail='<em>* Es necesario revisar el estado de la factura en Kairo.</em>';
    action=homePanelAction('invoice','Revisar','factura','data-home-invoice="review"');
  }
  return '<section class="home-invoice-status home-panel '+m.tone+(urgent?' urgent':'')+(m.unsent?' unsent':'')+'" id="homeInvoiceStatus" aria-label="Estado de factura" aria-live="polite"><div class="home-panel-row'+(action?'':' no-action')+'"><div class="home-panel-status"><span class="home-invoice-icon" aria-hidden="true">'+icon+'</span><div class="home-invoice-copy home-panel-copy"><strong>'+escHtml(m.title)+'</strong>'+detail+'</div></div>'+action+'</div></section>';
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
    else if(button.dataset.homeInvoice==='modify')openInvoiceMonth(mkey(CY,CM),{revise:true});
    else if(button.dataset.homeInvoice==='review')openCheckedInvoice(invoiceKairoUrl(invoiceData().config.kairoUrl)+'gestify-month?period='+mkey(CY,CM));
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
