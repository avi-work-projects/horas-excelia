/* Weekly mail uses the same scope for the warning and both entry points.
   Remote facts live in memory; SW remains a legacy manual mark, not proof. */
var HOURS_STATUS={period:'',phase:'idle',rows:[],checkedAt:0};
var HOURS_REQUEST=null,HOURS_SEQUENCE=0;
function hoursKairoUrl(){
  var base=invoiceKairoUrl(invoiceData().config.kairoUrl);
  return base?new URL('/horas/',base).href:'';
}
function hoursWeekState(key){
  var url='';try{url=hoursKairoUrl();}catch(e){return '';}
  if(HOURS_STATUS.url!==url||HOURS_STATUS.period!==mkey(CY,CM)||HOURS_STATUS.phase!=='ready'||Date.now()-HOURS_STATUS.checkedAt>120000)return '';
  var row=HOURS_STATUS.rows.find(function(r){return r.key===key;});return row?row.state:'';
}
function hoursRemoteConfigured(){try{return !!hoursKairoUrl();}catch(e){return false;}}
function hoursCovered(key){var state=hoursWeekState(key);return state==='sent'||state==='scheduled';}
function renderHoursAccess(){
  var fresh=!!hoursWeekState(homeSubmissionWeeks(CY,CM)[0].key);
  return '<div class="hours-home-actions"><button type="button" class="hours-pending-button" data-hours-review>Programar pendientes</button><span class="hours-verified-note">'+(fresh?'Estado consultado en Outlook':'Revisión previa · no programa sin confirmar')+'</span></div>';
}
function hoursMailSubject(wd){return 'HORAS Y DIAS TRABAJADOS - '+AUTHOR_NAME+' - Semana del '+fd(wd.mon)+' al '+fd(wd.fri);}
function hoursMailRequest(targetWeek){
  var to=String(TO||'').split(/[;,]/).map(function(v){return v.trim();}).filter(Boolean),cc=CC.slice();
  if(!to.length||!AUTHOR_NAME.trim())throw new Error('Completa destinatario y nombre en Correo de horas.');
  var list=homeSubmissionWeeks(CY,CM);
  if(targetWeek&&!list.some(function(w){return w.key===targetWeek;}))throw new Error('La semana ya no pertenece al mes visible.');
  return {schema:1,period:mkey(CY,CM),mode:targetWeek?'week':'month',targetWeek:targetWeek||null,config:{to:to,cc:cc},weeks:list.map(function(week){
    var wd=getWD(week.key);
    return {key:week.key,subject:hoursMailSubject(wd),body:buildMailtoBody(wd),days:[0,1,2,3,4].map(function(i){var day=ad(week.mon,i),type=dayT(day);return {date:dk(day),type:type,hours:type==='normal'?dayH(day):0};})};
  })};
}
function validateHoursResult(result,period,keys){
  var states=['sent','scheduled','ready','changed','duplicate','uncertain','draft','unverified','ambiguous-thread','other-sender','past-due','no-workdays','blocked-previous','missing'];
  if(!result||result.period!==period||typeof result.checkedAt!=='string'||!Number.isFinite(Date.parse(result.checkedAt))||!Array.isArray(result.rows)||result.rows.length!==keys.length)throw new Error('Respuesta de Outlook no válida.');
  result.rows.forEach(function(r,i){if(!r||r.key!==keys[i]||!states.includes(r.state))throw new Error('Las semanas recibidas no coinciden con la revisión.');});
  return result;
}
function hoursKairoExchange(url,request,popup){
  return new Promise(function(resolve,reject){
    var origin=new URL(url).origin,id=crypto.randomUUID(),sent=false,done=false;
    var original=JSON.stringify(request);
    function verifySource(event){
      var m=event.data;if(event.origin!==origin||event.source!==popup||!m||m.channel!=='gestify-hours-v1'||m.id!==id)return;
      if(m.type==='verify-source'&&typeof m.probe==='string'){
        var matches=false;try{matches=JSON.stringify(hoursMailRequest(request.targetWeek))===original;}catch(e){}
        popup.postMessage({channel:m.channel,id:id,type:'source-result',probe:m.probe,matches:matches},origin);
      }
      if(m.type==='committed'){HOURS_STATUS={period:'',phase:'idle',rows:[],checkedAt:0};syncHoursStatus(true);}
    }
    window.addEventListener('message',verifySource);
    function stopWatch(){clearInterval(watch);clearTimeout(watchTimeout);window.removeEventListener('message',verifySource);}
    var watch=setInterval(function(){if(popup.closed)stopWatch();},1000),watchTimeout=setTimeout(stopWatch,1800000);
    function finish(error,result){if(done)return;done=true;clearInterval(ping);clearTimeout(timeout);window.removeEventListener('message',receive);if(error){stopWatch();reject(error);}else resolve(result);}
    function receive(event){
      var message=event.data;
      if(event.origin!==origin||event.source!==popup||!message||message.channel!=='gestify-hours-v1'||message.id!==id)return;
      if(message.type==='ready'&&!sent){sent=true;popup.postMessage({channel:message.channel,id:id,type:'request',request:request},origin);}
      if(message.type==='result'&&sent){
        if(!message.ok)return finish(new Error('Kairo no ha confirmado la lectura de Outlook. No se ha programado ningún correo.'));
        try{var result=validateHoursResult(message.result,request.period,request.weeks.map(function(w){return w.key;}));if(result.verified!==true)throw new Error('La lectura de Outlook está sin confirmar.');finish(null,result);}catch(e){finish(e);}
      }
    }
    window.addEventListener('message',receive);
    var ping=setInterval(function(){if(popup.closed)return finish(new Error('Ventana cerrada. No se ha confirmado ninguna programación.'));if(!sent)popup.postMessage({channel:'gestify-hours-v1',id:id,type:'hello'},origin);},400);
    var timeout=setTimeout(function(){finish(new Error('La conciliación sigue sin confirmar. Revisa la ventana de Kairo antes de repetir.'));},120000);
  });
}
async function openHoursReview(targetWeek){
  var popup;
  try{
    if(navigator.onLine===false)throw new Error('Sin conexión. No se puede comprobar Outlook.');
    var url=hoursKairoUrl();if(!url){openInvoiceSettings({connection:true});return;}
    var request=hoursMailRequest(targetWeek);
    popup=window.open(url,'_blank');if(!popup)throw new Error('Permite abrir la revisión privada de Kairo.');
    var result=await hoursKairoExchange(url,request,popup);
    if(result.period===mkey(CY,CM)&&url===hoursKairoUrl()){HOURS_STATUS={period:result.period,url:url,phase:'ready',rows:result.rows,checkedAt:Date.now(),attemptedAt:Date.now()};render();}
    showToast('Conciliación terminada. Revisa las semanas en Kairo; no se ha programado ningún correo.','info');
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
    var response=await fetch(url+'status?period='+encodeURIComponent(period),{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!response.ok)throw new Error('Outlook sin confirmar');
    var result=validateHoursResult(await response.json(),period,keys);
    if(sequence!==HOURS_SEQUENCE||period!==mkey(CY,CM))return;
    HOURS_STATUS={period:period,url:url,phase:'ready',rows:result.rows,checkedAt:Date.now(),attemptedAt:Date.now()};
  }catch(e){if(sequence===HOURS_SEQUENCE)HOURS_STATUS={period:period,url:url,phase:'error',rows:[],checkedAt:0,attemptedAt:Date.now()};}
  finally{clearTimeout(timeout);if(sequence===HOURS_SEQUENCE){HOURS_REQUEST=null;paintHoursStatus();}}
}
function initHoursKairo(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  container.addEventListener('click',function(event){if(event.target.closest('[data-hours-review]'))openHoursReview();});
  function resume(){if(!document.hidden)syncHoursStatus(false);}
  window.addEventListener('focus',resume);window.addEventListener('online',resume);syncHoursStatus(false);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initHoursKairo);
