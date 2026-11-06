/* Weekly mail uses the same scope for the warning and both entry points.
   Verified facts live in hours-cache; SW is a legacy manual mark, not proof. */
var HOURS_STATUS={period:'',phase:'idle',rows:[],checkedAt:0};
var HOURS_REQUEST=null,HOURS_SEQUENCE=0,HOME_SYNC_ERROR=false;
function hoursKairoUrl(){
  var base=invoiceKairoUrl(invoiceData().config.kairoUrl);
  return base?new URL('/horas/',base).href:'';
}
function hoursWeekDays(key){
  var mon=new Date(key+'T12:00:00');
  return [0,1,2,3,4].map(function(i){var day=ad(mon,i),type=dayT(day);return {date:dk(day),type:type,hours:type==='normal'?dayH(day):0};});
}
function hoursCivilTime(value){
  if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))return '';
  var values={};new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).forEach(function(p){values[p.type]=p.value;});
  return values.year+'-'+values.month+'-'+values.day+'T'+values.hour+':'+values.minute;
}
function hoursWeekState(key){
  var row=hoursCachedWeek(key);if(!row)return '';
  if(row.state==='scheduled'||row.state==='changed'){
    if(!Array.isArray(row.days)||!row.schedule)return row.state;
    var expected=hoursWeekDays(key),date=homeWeekSchedule(key).date;
    var equal=expected.every(function(day,i){var other=row.days[i];return other&&day.date===other.date&&day.type===other.type&&day.hours===other.hours;});
    return equal&&hoursCivilTime(row.schedule)===date+'T08:00'&&(!row.settings||row.settings===hoursSettingsSignature())?'scheduled':'changed';
  }
  return row.state;
}
function hoursRemoteConfigured(){try{return !!hoursKairoUrl();}catch(e){return false;}}
function hoursCovered(key){var state=hoursWeekState(key);return state==='sent'||state==='scheduled';}
function hoursHasConfirmedMail(key){var row=hoursCachedWeek(key);return !!row&&['sent','scheduled','changed'].includes(row.state);}
function hoursWeekBadge(state){
  var labels={sent:'✓ Enviada',scheduled:'◷ Programada',closed:'✓ Enviada',changed:'Revisar cambios',missing:'Pendiente',ready:'Pendiente',unverified:'Pendiente',draft:'Pendiente','blocked-previous':'Pendiente','past-due':'Pendiente','no-workdays':'Pendiente'};
  return labels[state]||(state?'Revisar':'Sin programar');
}
function hoursWeekDate(key,state){
  var row=hoursCachedWeek(key);
  if(!['scheduled','changed'].includes(state)||!row||!row.schedule)return '';
  return new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(row.schedule));
}
function hoursJobRunning(url){
  return typeof HOURS_JOBS!=='undefined'&&HOURS_JOBS.some(function(job){return job.url===url;});
}
function renderHoursAccess(state){
  return hoursJobRunning(hoursKairoUrl())?'<div class="hours-home-actions"><span class="hours-job-note" role="status">Kairo está trabajando. Puedes salir de Gestify.</span></div>':'';
}

function hoursMailSubject(wd){return 'HORAS Y DIAS TRABAJADOS - '+AUTHOR_NAME+' - Semana del '+fd(wd.mon)+' al '+fd(wd.fri);}
function hoursCalendarDays(list){
  var start=new Date(list[0].key+'T12:00:00'),end=ad(new Date(list[list.length-1].key+'T12:00:00'),6),out=[];
  start=new Date(start.getFullYear(),start.getMonth(),1);end=new Date(end.getFullYear(),end.getMonth()+1,0);
  for(var day=start;day<=end;day=ad(day,1)){var type=dayT(day);if(type!=='normal')out.push({date:dk(day),type:type});}
  return out;
}
function hoursMailRequest(targetWeek){
  var to=String(TO||'').split(/[;,]/).map(function(v){return v.trim();}).filter(Boolean),cc=CC.slice();
  if(!to.length||!AUTHOR_NAME.trim())throw new Error('Completa destinatario y nombre en Correo de horas.');
  var list=homeSubmissionWeeks(CY,CM);
  if(targetWeek&&!list.some(function(w){return w.key===targetWeek;}))throw new Error('La semana ya no pertenece al mes visible.');
  return {schema:1,period:mkey(CY,CM),mode:targetWeek?'week':'month',targetWeek:targetWeek||null,config:{to:to,cc:cc},calendarDays:hoursCalendarDays(list),weeks:list.map(function(week){
    var wd=getWD(week.key);
    return {key:week.key,subject:hoursMailSubject(wd),body:buildMailtoBody(wd),days:hoursWeekDays(week.key)};
  })};
}
function validateHoursResult(result,period,keys){
  var states=['sent','scheduled','ready','changed','duplicate','uncertain','draft','unverified','ambiguous-thread','other-sender','past-due','no-workdays','blocked-previous','missing'];
  if(!result||result.period!==period||typeof result.checkedAt!=='string'||!Number.isFinite(Date.parse(result.checkedAt))||!Array.isArray(result.rows)||result.rows.length!==keys.length)throw new Error('Respuesta de Outlook no válida.');
  result.rows.forEach(function(r,i){
    if(!r||r.key!==keys[i]||!states.includes(r.state))throw new Error('Las semanas recibidas no coinciden con la revisión.');
    if(r.days!=null){
      var mon=new Date(r.key+'T12:00:00Z');
      if(!Array.isArray(r.days)||r.days.length!==5||r.days.some(function(day,n){return !day||day.date!==new Date(mon.getTime()+n*86400000).toISOString().slice(0,10)||!['normal','vacaciones','festivo','ausencia'].includes(day.type)||typeof day.hours!=='number'||!Number.isFinite(day.hours)||day.hours<0||day.hours>24||(day.type!=='normal'&&day.hours!==0);}))throw new Error('El desglose recibido no es válido.');
    }
    if(r.schedule!=null&&!hoursCivilTime(r.schedule))throw new Error('La fecha recibida no es válida.');
  });
  return result;
}
function rememberHoursReview(result,request,url){
  validateHoursResult(result,request.period,request.weeks.map(function(w){return w.key;}));
  if(result.verified!==true)throw new Error('La lectura de Outlook está sin confirmar.');
  if(url===hoursKairoUrl())hoursCacheRemember(result,url,hoursSourceSignature(request.weeks));
  if(result.period===mkey(CY,CM)&&url===hoursKairoUrl()){
    ++HOURS_SEQUENCE;if(HOURS_REQUEST)HOURS_REQUEST.abort();HOURS_REQUEST=null;
    HOURS_STATUS={period:result.period,url:url,phase:'ready',rows:result.rows,checkedAt:Date.now(),attemptedAt:Date.now()};paintHoursStatus();
  }
}
/* Transport checks origin/window/id; Home owns its state and source validation.
   The documentation demo uses the same bridge without application globals. */
function hoursKairoExchange(url,request,popup,options){
  options=options||{};
  return new Promise(function(resolve,reject){
    var origin=new URL(url).origin,id=crypto.randomUUID(),sent=false,done=false,background=false;
    function leave(){stopWatch();if(!done)finish(null,{detached:true,background:background});}
    function closed(){return options.isClosed?options.isClosed():popup.closed;}
    function verifySource(event){
      var m=event.data;if(event.origin!==origin||event.source!==popup||!m||m.channel!=='gestify-hours-v1'||m.id!==id)return;
      if(m.type==='job'&&done&&options.onJob)options.onJob(m.job);
      if(m.type==='close'&&options.close){options.close();leave();return;}
      if(m.type==='verify-source'&&typeof m.probe==='string'){
        var matches=false;try{matches=!!options.sourceMatches&&options.sourceMatches()===true;}catch(e){}
        popup.postMessage({channel:m.channel,id:id,type:'source-result',probe:m.probe,matches:matches},origin);
      }
      if(m.type==='committed'&&options.onCommitted)options.onCommitted();
      if(m.type==='result'&&done&&sent){
        try{if(!m.ok)throw new Error();validateHoursResult(m.result,request.period,request.weeks.map(function(w){return w.key;}));if(options.onUpdate)options.onUpdate(m.result);}
        catch(e){if(options.onError)options.onError();}
      }
    }
    window.addEventListener('message',verifySource);
    function stopWatch(){clearInterval(watch);clearTimeout(watchTimeout);window.removeEventListener('message',verifySource);}
    var watch=setInterval(function(){if(closed())stopWatch();},1000),watchTimeout=setTimeout(stopWatch,1800000);
    function finish(error,result){if(done)return;done=true;clearInterval(ping);clearTimeout(timeout);window.removeEventListener('message',receive);if(error){stopWatch();reject(error);}else resolve(result);}
    function receive(event){
      var message=event.data;
      if(event.origin!==origin||event.source!==popup||!message||message.channel!=='gestify-hours-v1'||message.id!==id)return;
      if(message.type==='job'&&sent){background=true;clearTimeout(timeout);if(options.onJob)options.onJob(message.job);}
      if(message.type==='ready'&&!sent){sent=true;popup.postMessage({channel:message.channel,id:id,type:'request',intent:options.intent||'review',request:request},origin);}
      if(message.type==='result'&&sent){
        if(!message.ok)return finish(new Error('No se ha podido comprobar Outlook.'));
        try{var result=validateHoursResult(message.result,request.period,request.weeks.map(function(w){return w.key;}));if(result.verified!==true)throw new Error('La lectura de Outlook está sin confirmar.');finish(null,result);}catch(e){finish(e);}
      }
    }
    window.addEventListener('message',receive);
    var ping=setInterval(function(){if(closed())return leave();if(!sent)popup.postMessage({channel:'gestify-hours-v1',id:id,type:'hello'},origin);},400);
    var timeout=setTimeout(function(){finish(new Error('Outlook sigue sin confirmar. Revisa la ventana de Kairo.'));},120000);
  });
}
function hoursReviewSurface(url){
  // Android can capture a new window in another installed PWA, losing its opener.
  if(!/Android/i.test(navigator.userAgent)||!matchMedia('(display-mode: standalone)').matches){
    var popup=window.open(url,'_blank');
    if(!popup)throw new Error('Permite abrir la revisión privada de Kairo.');
    return {window:popup,close:function(){popup.close();},isClosed:function(){return popup.closed;}};
  }
  var dialog=document.createElement('dialog'),header=document.createElement('header'),title=document.createElement('strong'),back=document.createElement('button'),frame=document.createElement('iframe'),previous=document.activeElement;
  dialog.className='hours-review-dialog';title.id='hours-review-title';title.textContent='Correo de horas';dialog.setAttribute('aria-labelledby',title.id);
  back.type='button';back.textContent='Volver a Home';frame.title='Revisión de programación de horas';frame.referrerPolicy='no-referrer';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.setAttribute('allow','local-network-access');
  function close(){if(!dialog.isConnected)return;dialog.close();dialog.remove();if(previous&&previous.isConnected)previous.focus();}
  header.append(title,back);dialog.append(header,frame);document.body.append(dialog);dialog.showModal();
  back.onclick=close;dialog.addEventListener('cancel',function(event){event.preventDefault();close();});frame.src=url;
  return {window:frame.contentWindow,close:close,isClosed:function(){return !dialog.isConnected;}};
}
function invalidateHoursReview(request,url,phase){
  // Preserve observed facts until Kairo confirms the replacement. A lost
  // result is a running/uncertain operation, not evidence that mail disappeared.
  if(request.period!==mkey(CY,CM)||url!==hoursKairoUrl())return;
  ++HOURS_SEQUENCE;if(HOURS_REQUEST)HOURS_REQUEST.abort();HOURS_REQUEST=null;
  HOURS_STATUS={period:request.period,url:url,phase:phase,rows:[],checkedAt:0,attemptedAt:Date.now()};paintHoursStatus();
}
async function openHoursReview(targetWeek,intent){
  var popup,surface;
  try{
    if(navigator.onLine===false)throw new Error('Sin conexión. No se puede comprobar Outlook.');
    var url=hoursKairoUrl();if(!url){openInvoiceSettings({connection:true});return;}
    if(!targetWeek&&intent!=='check'){
      var previous=homePreviousMailMonth(CY,CM);
      if(previous.known&&!previous.ready){showToast('Primero deben estar programados los correos de '+new Date(previous.period+'-01T12:00:00').toLocaleDateString('es-ES',{month:'long',year:'numeric'})+'.','error');return;}
    }
    var request=hoursMailRequest(targetWeek),original=JSON.stringify(request);
    surface=hoursReviewSurface('about:blank');popup=surface.window;
    if(!await ensureKairoConnection()){surface.close();return;}
    if(surface.isClosed())return;
    popup.location.replace(url);
    var result=await hoursKairoExchange(url,request,popup,{
      intent:intent||'review',sourceMatches:function(){return intent!=='check'&&JSON.stringify(hoursMailRequest(request.targetWeek))===original;},
      isClosed:surface.isClosed,close:surface.close,
      onCommitted:function(){invalidateHoursReview(request,url,'loading');},
      onJob:function(job){hoursTrackJob(job,request,url);},
      onUpdate:function(result){rememberHoursReview(result,request,url);},
      onError:function(){HOURS_STATUS.phase='error';paintHoursStatus();}
    });
    if(result.detached){
      if(result.background)showToast('La revisión continúa en Kairo.','info');
      return;
    }
    rememberHoursReview(result,request,url);
    if(intent==='check'){surface.close();window.focus();showToast('Estado de Outlook actualizado.','success');}
    else showToast('Revisa las semanas antes de confirmar.','info');
  }catch(e){HOURS_STATUS={period:'',phase:'error',rows:[],checkedAt:0};paintHoursStatus();showToast(e.message,'error');}
}
function paintHomeSyncDate(){
  var label=document.getElementById('homeSyncDate');if(!label)return;
  var stamp=HOURS_CACHE.url===hoursKairoUrl()&&HOURS_CACHE.lastMailSync;
  label.classList.toggle('home-sync-error',HOME_SYNC_ERROR);
  label.innerHTML=HOME_SYNC_ERROR?'<em>error</em>':stamp?escHtml(homeInvoiceCheckedAt(stamp)):'';
  label.title=stamp?'Última sincronización correcta con Kairo':'';
}
function paintHoursStatus(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  paintHomeSyncDate();
  if(typeof paintHomeInvoiceStatus==='function')paintHomeInvoiceStatus();
  var summary=container.querySelector('.home-submission');if(summary)summary.outerHTML=renderHomeSubmissionStatus(CY,CM);
  container.querySelectorAll('.week-card[data-week]').forEach(function(card){
    var key=card.dataset.week,state=homePeriodMode(CY,CM)==='closed'?'closed':(hoursWeekState(key)||'missing'),covered=homeWeekCovered(key),open=homeWeekUnlocked(key),badge=card.querySelector('.hours-week-badge');
    card.dataset.mailState=state;card.classList.toggle('sent',covered&&!open);
    if(badge){badge.textContent=state==='missing'||state==='ready'?'Programar semana':hoursWeekBadge(state);badge.className='sent-badge hours-week-badge '+(covered?'covered':state?'attention':'unknown');badge.setAttribute('aria-label',state==='sent'?'Ver estado':state==='scheduled'?'Ver programación':state==='changed'?'Revisar cambios':'Programar semana');}
    var note=card.querySelector('.hours-week-readonly'),date=hoursWeekDate(key,state);
    if(date&&!note){note=document.createElement('div');note.className='hours-week-readonly';card.querySelector('.week-info').appendChild(note);}
    if(note){note.textContent=date?'Envío '+date:'';note.hidden=!date;}
    var label=card.querySelector('.sent-toggle span');if(label)label.textContent=open?'Cerrar edición':covered?'Desmarcar':'Editar días';
  });
}
async function syncHoursStatus(force,requestedPeriod){
  var url;try{url=hoursKairoUrl();}catch(e){return;}
  if(!url)return;
  var period=requestedPeriod||mkey(CY,CM),keys=hoursScopeKeys(period),mode=homePeriodMode(+period.slice(0,4),+period.slice(5)-1),known=keys.every(function(key){return !!hoursCachedWeek(key);});
  var cached=HOURS_CACHE.url===url&&HOURS_CACHE.periods[period];
  var today=new Date(),audit=mkey(today.getFullYear(),today.getMonth());
  var auditMissing=[-1,0,1].some(function(offset){var d=new Date(today.getFullYear(),today.getMonth()+offset,1);return HOURS_CACHE.url!==url||!HOURS_CACHE.periods[mkey(d.getFullYear(),d.getMonth())];});
  // A legacy negative phone snapshot must not hide a newer confirmed server fact.
  // Read Kairo's cache once for the previous month; this is not an Outlook refresh.
  var historicalCache=!force&&!auditMissing&&known&&mode==='audit'&&period<audit&&keys.some(function(key){return hoursCachedWeek(key).state==='missing';});
  if(!force&&(mode==='closed'||known&&(mode==='future'||!auditMissing)&&!historicalCache)){HOURS_STATUS={url:url,period:period,phase:known?'ready':'idle',checkedAt:cached?cached.checkedAt:0};return;}
  var target=force||historicalCache||mode==='future'?period:audit,windowAudit=!historicalCache&&target===audit&&(!force||auditMissing);
  var attempt=historicalCache?'historical-cache:'+period:(mode==='future'?'saved:'+period:'saved-audit:'+audit);
  if(!force&&(HOURS_ATTEMPTS[url+'|'+attempt]||HOURS_CACHE.url===url&&HOURS_CACHE.attempts&&HOURS_CACHE.attempts[attempt]))return;
  if(HOURS_CACHE.url!==url)HOURS_CACHE={schema:1,url:url,periods:{},weeks:{},attempts:{}};
  HOURS_CACHE.attempts=HOURS_CACHE.attempts||{};HOURS_CACHE.attempts[attempt]=true;hoursCacheSave();HOURS_ATTEMPTS[url+'|'+attempt]=true;
  HOURS_STATUS={period:period,url:url,phase:'loading',checkedAt:cached?cached.checkedAt:0};
  if(force)hoursRecordCheck(period,'running');
  var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},10000);
  try{
    var response=await fetch(url+'status?period='+target+'&background=1&audit='+(windowAudit?'1':'0')+'&refresh=0&stored=1',{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local',signal:controller.signal});
    if(!response.ok)throw new Error('Outlook sin confirmar');
    var result=await response.json();
    if(url!==hoursKairoUrl())return;
    if(result.phase==='done'){hoursAcceptJobResult({url:url},result.result);if(force)hoursRecordCheck(period,'done');HOURS_JOB_ERROR='';if(period===mkey(CY,CM))HOURS_STATUS={period:period,url:url,phase:'ready',checkedAt:Date.now()};return true;}
    else{hoursTrackJob(result,{period:target,manual:force},url);if(period===mkey(CY,CM))HOURS_STATUS={period:period,url:url,phase:'loading',checkedAt:cached?cached.checkedAt:0};}
  }catch(e){
    if(period===mkey(CY,CM))HOURS_STATUS={period:period,url:url,phase:'error',checkedAt:cached?cached.checkedAt:0};
    if(force)HOURS_JOB_ERROR='Kairo no está disponible. Se conserva el estado guardado y el envío manual.';
    var code=e.name==='AbortError'||e instanceof TypeError?'network':'stored_read_failed';
    if(force){hoursRecordCheck(period,'error',code);showToast(hoursCheckMessage(code));}
  }
  finally{clearTimeout(timeout);paintHoursStatus();}
}
async function refreshHomeStates(){
  var url=hoursKairoUrl(),period=mkey(CY,CM);
  var results=await Promise.all([syncHoursStatus(true,period),syncHomeInvoiceStatus(true)]);
  if(url!==hoursKairoUrl())return 'La conexión con Kairo ha cambiado.';
  if(results[0]&&results[1]){
    HOME_SYNC_ERROR=false;HOURS_CACHE.lastMailSync=Date.now();hoursCacheSave();paintHomeSyncDate();return 'Correos y factura actualizados.';
  }
  var last=HOURS_CACHE.checks&&HOURS_CACHE.checks[period];
  HOME_SYNC_ERROR=!(last&&last.phase==='running');paintHomeSyncDate();
  if(last&&last.phase==='error'&&hoursAccessIssue(last.code))return hoursCheckMessage(last.code);
  if(last&&last.phase==='running')return 'Kairo está comprobando los correos.';
  if(results[0])return 'Correos actualizados. La factura sigue sin comprobar.';
  if(results[1])return 'Factura actualizada. Los correos siguen sin comprobar.';
  return 'No se ha podido sincronizar con Kairo. Se conserva el último estado.';
}
function initHoursKairo(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  var dialog=document.getElementById('homeSyncDialog'),result=document.getElementById('homeSyncResult');
  var check=dialog.querySelector('[data-hours-check]'),access=dialog.querySelector('[data-hours-auth]'),restore;
  function closeSync(){dialog.close();}
  document.getElementById('homeSyncBtn').addEventListener('click',function(){
    if(!hoursRemoteConfigured()){openInvoiceSettings({connection:true});return;}
    if(dialog.open)return;
    var last=HOURS_CACHE.url===hoursKairoUrl()&&HOURS_CACHE.checks&&HOURS_CACHE.checks[mkey(CY,CM)];
    if(last&&last.phase==='error'&&hoursAccessIssue(last.code))result.textContent=hoursCheckMessage(last.code);
    restore=settingsPanelBack();NAV_BACK=closeSync;dialog.showModal();
  });
  dialog.querySelector('[data-close-sync]').onclick=closeSync;
  dialog.addEventListener('close',function(){if(NAV_BACK===closeSync)restore();});
  dialog.addEventListener('click',async function(event){
    var action=event.target.closest('[data-hours-check],[data-hours-auth]');
    if(!action||action.disabled)return;
    check.disabled=access.disabled=true;
    action.setAttribute('aria-busy','true');
    result.textContent=action===access?'Comprobando el acceso a Outlook…':'Sincronizando con Kairo…';
    try{if(!await ensureKairoConnection()){HOME_SYNC_ERROR=true;paintHomeSyncDate();result.textContent='Operación cancelada.';return;}result.textContent=await (action===access?requestHoursSyncAccess():refreshHomeStates());}
    catch(e){HOME_SYNC_ERROR=true;paintHomeSyncDate();result.textContent=action===access?'No se pudo comprobar el acceso a Outlook. Revisa la conexión con Kairo.':'No se pudo sincronizar con Kairo.';}
    finally{action.removeAttribute('aria-busy');check.disabled=access.disabled=false;if(!dialog.open)showToast(result.textContent);}
  });
  container.addEventListener('click',function(event){var week=event.target.closest('[data-hours-week]');if(event.target.closest('[data-mobile-connection]'))openMobileConnection(null,'vpn');else if(week&&hoursCovered(week.dataset.hoursWeek))openMailCalendar();else if(week)openHoursReview(week.dataset.hoursWeek);else if(event.target.closest('[data-hours-review]'))openHoursReview();else if(event.target.closest('[data-home-formula]')){HOME_FORMULA_OPEN=!HOME_FORMULA_OPEN;paintHoursStatus();}});
  function resume(){if(!document.hidden)hoursResumeJobs();}
  window.addEventListener('focus',resume);window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);
  window.addEventListener('storage',function(event){if(event.key===HOURS_CACHE_KEY){HOURS_CACHE=hoursCacheRead();paintHoursStatus();}});hoursResumeJobs();syncHoursStatus(false);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initHoursKairo);
