/* Weekly mail uses the same scope for the warning and both entry points.
   Remote facts live in memory; SW remains a legacy manual mark, not proof. */
var HOURS_STATUS={period:'',phase:'idle',rows:[],checkedAt:0};
var HOURS_REQUEST=null,HOURS_SEQUENCE=0;
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
  var url='';try{url=hoursKairoUrl();}catch(e){return '';}
  if(HOURS_STATUS.url!==url||HOURS_STATUS.period!==mkey(CY,CM)||HOURS_STATUS.phase!=='ready'||Date.now()-HOURS_STATUS.checkedAt>120000)return '';
  var row=HOURS_STATUS.rows.find(function(r){return r.key===key;});if(!row)return '';
  if(row.state==='scheduled'||row.state==='changed'){
    if(!Array.isArray(row.days)||!row.schedule)return row.state==='scheduled'?'unverified':'changed';
    var expected=hoursWeekDays(key),date=homeWeekSchedule(key).date;
    var equal=expected.every(function(day,i){var other=row.days[i];return other&&day.date===other.date&&day.type===other.type&&day.hours===other.hours;});
    return equal&&hoursCivilTime(row.schedule)===date+'T08:00'?'scheduled':'changed';
  }
  return row.state;
}
function hoursRemoteConfigured(){try{return !!hoursKairoUrl();}catch(e){return false;}}
function hoursCovered(key){var state=hoursWeekState(key);return state==='sent'||state==='scheduled';}
function hoursWeekBadge(state){
  var labels={sent:'✓ Enviada',scheduled:'◷ Programada',changed:'Revisar cambios',missing:'Pendiente',ready:'Pendiente'};
  return labels[state]||(state?'Revisar':'Sin comprobar');
}
function hoursWeekDate(key,state){
  var row=HOURS_STATUS.rows.find(function(r){return r.key===key;});
  if(state!=='scheduled'||!row||!row.schedule)return '';
  return new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'short',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(row.schedule));
}
function renderHoursAccess(state){
  var fresh=state?state.remote&&state.known:!!hoursWeekState(homeSubmissionWeeks(CY,CM)[0].key);
  var note=fresh?'Comprobado en Outlook':'Pulsa ↻ para comprobar Outlook';
  var label=state&&state.remote&&state.complete?'Revisar semanas':state&&state.remote&&state.review?'Revisar cambios':'Programar pendientes';
  return '<div class="hours-home-actions"><span class="hours-verified-note">'+note+'</span><button type="button" class="hours-check-button" data-hours-check aria-label="Comprobar Outlook" title="Comprobar Outlook">↻</button><button type="button" class="hours-pending-button" data-hours-review>'+label+'</button></div>';
}
function hoursMailSubject(wd){return 'HORAS Y DIAS TRABAJADOS - '+AUTHOR_NAME+' - Semana del '+fd(wd.mon)+' al '+fd(wd.fri);}
function hoursMailRequest(targetWeek){
  var to=String(TO||'').split(/[;,]/).map(function(v){return v.trim();}).filter(Boolean),cc=CC.slice();
  if(!to.length||!AUTHOR_NAME.trim())throw new Error('Completa destinatario y nombre en Correo de horas.');
  var list=homeSubmissionWeeks(CY,CM);
  if(targetWeek&&!list.some(function(w){return w.key===targetWeek;}))throw new Error('La semana ya no pertenece al mes visible.');
  return {schema:1,period:mkey(CY,CM),mode:targetWeek?'week':'month',targetWeek:targetWeek||null,config:{to:to,cc:cc},weeks:list.map(function(week){
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
  if(result.period===mkey(CY,CM)&&url===hoursKairoUrl()){
    ++HOURS_SEQUENCE;if(HOURS_REQUEST)HOURS_REQUEST.abort();HOURS_REQUEST=null;
    HOURS_STATUS={period:result.period,url:url,phase:'ready',rows:result.rows,checkedAt:Date.now(),attemptedAt:Date.now()};render();
  }
}
/* Transport checks origin/window/id; Home owns its state and source validation.
   The documentation demo uses the same bridge without application globals. */
function hoursKairoExchange(url,request,popup,options){
  options=options||{};
  return new Promise(function(resolve,reject){
    var origin=new URL(url).origin,id=crypto.randomUUID(),sent=false,done=false;
    function verifySource(event){
      var m=event.data;if(event.origin!==origin||event.source!==popup||!m||m.channel!=='gestify-hours-v1'||m.id!==id)return;
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
    var watch=setInterval(function(){if(popup.closed)stopWatch();},1000),watchTimeout=setTimeout(stopWatch,1800000);
    function finish(error,result){if(done)return;done=true;clearInterval(ping);clearTimeout(timeout);window.removeEventListener('message',receive);if(error){stopWatch();reject(error);}else resolve(result);}
    function receive(event){
      var message=event.data;
      if(event.origin!==origin||event.source!==popup||!message||message.channel!=='gestify-hours-v1'||message.id!==id)return;
      if(message.type==='ready'&&!sent){sent=true;popup.postMessage({channel:message.channel,id:id,type:'request',intent:options.intent||'review',request:request},origin);}
      if(message.type==='result'&&sent){
        if(!message.ok)return finish(new Error('No se ha podido comprobar Outlook.'));
        try{var result=validateHoursResult(message.result,request.period,request.weeks.map(function(w){return w.key;}));if(result.verified!==true)throw new Error('La lectura de Outlook está sin confirmar.');finish(null,result);}catch(e){finish(e);}
      }
    }
    window.addEventListener('message',receive);
    var ping=setInterval(function(){if(popup.closed)return finish(new Error('Ventana cerrada. No se ha confirmado ninguna programación.'));if(!sent)popup.postMessage({channel:'gestify-hours-v1',id:id,type:'hello'},origin);},400);
    var timeout=setTimeout(function(){finish(new Error('Outlook sigue sin confirmar. Revisa la ventana de Kairo.'));},120000);
  });
}
function invalidateHoursReview(request,url,phase){
  if(request.period!==mkey(CY,CM)||url!==hoursKairoUrl())return;
  ++HOURS_SEQUENCE;if(HOURS_REQUEST)HOURS_REQUEST.abort();HOURS_REQUEST=null;
  HOURS_STATUS={period:request.period,url:url,phase:phase,rows:[],checkedAt:0,attemptedAt:Date.now()};paintHoursStatus();
}
async function openHoursReview(targetWeek,intent){
  var popup;
  try{
    if(navigator.onLine===false)throw new Error('Sin conexión. No se puede comprobar Outlook.');
    var url=hoursKairoUrl();if(!url){openInvoiceSettings({connection:true});return;}
    var request=hoursMailRequest(targetWeek),original=JSON.stringify(request);
    popup=window.open(url,'_blank');if(!popup)throw new Error('Permite abrir la revisión privada de Kairo.');
    var result=await hoursKairoExchange(url,request,popup,{
      intent:intent||'review',sourceMatches:function(){return intent!=='check'&&JSON.stringify(hoursMailRequest(request.targetWeek))===original;},
      onCommitted:function(){invalidateHoursReview(request,url,'loading');},
      onUpdate:function(result){rememberHoursReview(result,request,url);},
      onError:function(){invalidateHoursReview(request,url,'error');}
    });
    rememberHoursReview(result,request,url);
    if(intent==='check'){popup.close();window.focus();showToast('Estado de Outlook actualizado.','success');}
    else showToast('Revisa las semanas antes de confirmar.','info');
  }catch(e){HOURS_STATUS={period:'',phase:'error',rows:[],checkedAt:0};paintHoursStatus();showToast(e.message,'error');}
}
function paintHoursStatus(){
  var container=document.getElementById('weeksContainer');if(container)buildHomeCalendar(container);
}
async function syncHoursStatus(force){
  var url;try{url=hoursKairoUrl();}catch(e){return;}
  if(!url)return;
  var period=mkey(CY,CM);
  if(HOURS_REQUEST&&HOURS_STATUS.period===period&&HOURS_STATUS.url===url)return;
  if(HOURS_REQUEST)HOURS_REQUEST.abort();
  if(!force&&HOURS_STATUS.period===period&&HOURS_STATUS.url===url&&Date.now()-HOURS_STATUS.attemptedAt<60000)return;
  var sequence=++HOURS_SEQUENCE,controller=new AbortController();HOURS_REQUEST=controller;
  var keys=homeSubmissionWeeks(CY,CM).map(function(w){return w.key;});
  HOURS_STATUS={period:period,url:url,phase:'loading',rows:[],checkedAt:0,attemptedAt:Date.now()};
  var timeout=setTimeout(function(){controller.abort();},100000);
  try{
    var response=await fetch(url+'status?period='+encodeURIComponent(period),{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local',signal:controller.signal});
    if(!response.ok)throw new Error('Outlook sin confirmar');
    var result=validateHoursResult(await response.json(),period,keys);
    if(sequence!==HOURS_SEQUENCE||period!==mkey(CY,CM))return;
    HOURS_STATUS={period:period,url:url,phase:'ready',rows:result.rows,checkedAt:Date.now(),attemptedAt:Date.now()};
  }catch(e){
    var denied=false;try{denied=(await navigator.permissions.query({name:'local-network-access'})).state==='denied';}catch(ignore){}
    if(sequence===HOURS_SEQUENCE)HOURS_STATUS={period:period,url:url,phase:'error',rows:[],checkedAt:0,attemptedAt:Date.now(),networkPermissionDenied:denied};
  }
  finally{clearTimeout(timeout);if(sequence===HOURS_SEQUENCE){HOURS_REQUEST=null;paintHoursStatus();}}
}
function initHoursKairo(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  container.addEventListener('click',function(event){if(event.target.closest('[data-hours-check]'))openHoursReview(null,'check');else if(event.target.closest('[data-hours-review]'))openHoursReview();});
  function resume(){if(!document.hidden)syncHoursStatus(false);}
  window.addEventListener('focus',resume);window.addEventListener('online',resume);syncHoursStatus(false);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initHoursKairo);
