/* Sesiones explícitas: extras y recuperaciones. Las fechas de la recurrencia
   conservan su identificador; las adicionales tienen uno estable propio. */
function rutSessionsOn(r,ds){
  var out=[],time=rutOccursOn(r,ds);
  if(time)out.push({key:ds,ds:ds,time:time,dur:rutDurationOn(r,ds),skip:rutIsSkipped(r,ds)});
  (r.extraSessions||[]).forEach(function(s){if(s.date===ds)out.push({key:s.id,ds:ds,time:s.time,dur:s.dur,skip:!!s.skip,extra:true,recoveryOf:s.recoveryOf||null});});
  return out.sort(function(a,b){return a.time.localeCompare(b.time)||a.key.localeCompare(b.key);});
}
function rutSessionByKey(r,key){
  if(validIsoDate(key))return rutSessionsOn(r,key).find(function(s){return s.key===key;})||null;
  var s=(r.extraSessions||[]).find(function(s){return s.id===key;});
  return s?rutSessionsOn(r,s.date).find(function(x){return x.key===key;}):null;
}
function rutRecoveryFor(r,key){return (r.extraSessions||[]).find(function(s){return s.recoveryOf===key&&!s.skip;})||null;}
function rutSessionTag(r,s){
  if(!s.extra)return '';
  var origin=s.recoveryOf&&rutSessionByKey(r,s.recoveryOf);
  return origin?'(Recuperada de '+_rutFmt(origin.ds)+')':'(Extra)';
}
function rutRecoveryNote(r,key){
  var recovery=rutRecoveryFor(r,key);
  return recovery?'Recuperada este día: '+_rutFmt(recovery.date):'';
}
function rutRecoveryHtml(ev){
  if(!ev._rut)return '';
  var text=rutRecoveryNote(ev._rut,ev._rutKey||ev.start);
  return text?'<em class="rut-recovery-note">'+escHtml(text)+'</em>':'';
}
function rutValidateAddition(r,s){
  if(!s||!validIsoDate(s.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)||!Number.isInteger(s.dur)||s.dur<15||s.dur>480)throw new Error('Revisa la fecha, la hora y la duración (15–480 min).');
  var earliest=r.flex?rutFlexEarliest(r):r.start;
  if(earliest&&s.date<earliest)throw new Error('La sesión debe ser posterior al inicio de la rutina.');
}
function rutAddSession(r,data,sourceKey){
  rutValidateAddition(r,data);
  var copy=JSON.parse(JSON.stringify(r)),source=sourceKey&&rutSessionByKey(copy,sourceKey);
  if(sourceKey&&!source)throw new Error('La sesión original ya no existe.');
  if(source&&rutRecoveryFor(copy,sourceKey))throw new Error('Esta sesión ya tiene una recuperación asignada.');
  if(source&&(data.date<source.ds||(data.date===source.ds&&data.time<=source.time)))throw new Error('La recuperación debe ser posterior a la sesión original.');
  if(rutDayCount(data.date,r.id)+rutSessionsOn(copy,data.date).length>=EV_MAX_RUT_DIA)throw new Error('Ese día ya tiene el máximo de '+EV_MAX_RUT_DIA+' sesiones de rutina.');
  if(rutSessionsOn(copy,data.date).some(function(s){return !s.skip&&s.time===data.time;}))throw new Error('Ya tienes una sesión de esta rutina a esa hora.');
  copy.extraSessions=copy.extraSessions||[];
  var id='extra-'+Date.now().toString(36),n=0;
  while(copy.extraSessions.some(function(s){return s.id===id;}))id='extra-'+Date.now().toString(36)+'-'+(++n);
  copy.extraSessions.push({id:id,date:data.date,time:data.time,dur:data.dur,recoveryOf:sourceKey||null,skip:false});
  if(source){
    if(source.extra)copy.extraSessions.find(function(s){return s.id===sourceKey;}).skip=true;
    else{copy.skips=copy.skips||{};copy.skips[source.ds]=1;
      if(!copy.flex){copy.keptSessions=copy.keptSessions||{};copy.keptSessions[source.ds]={time:source.time,dur:source.dur,edited:true};}}
  }
  return copy;
}
function rutValidateExtraSessions(r){
  if(r.extraSessions==null)return;
  if(!Array.isArray(r.extraSessions)||r.extraSessions.length>10000)throw new Error('Sesiones extras no válidas.');
  var ids={},linked={};
  r.extraSessions.forEach(function(s){
    rutValidateAddition(r,s);
    if(!/^extra-[a-z0-9-]+$/.test(s.id)||ids[s.id]||(s.skip!=null&&typeof s.skip!=='boolean'))throw new Error('Identificador o estado de sesión extra no válido.');
    ids[s.id]=true;
  });
  r.extraSessions.forEach(function(s){
    if(!s.recoveryOf)return;
    var original=rutSessionByKey(r,s.recoveryOf);
    if(!original||(!s.skip&&!original.skip)||s.date<original.ds||(s.date===original.ds&&s.time<=original.time)||(!s.skip&&linked[s.recoveryOf]))throw new Error('Vínculo de recuperación no válido.');
    if(!s.skip)linked[s.recoveryOf]=true;
  });
}
function rutSaveSessionChange(r,result,message){
  var before=JSON.parse(JSON.stringify(r));Object.assign(r,result);saveRutinas();refreshEvents();
  if(document.getElementById('rutHistoryWrap'))openRutHistory(r,true);
  showToast(message,'success',function(){Object.keys(r).forEach(function(k){delete r[k];});Object.assign(r,before);saveRutinas();refreshEvents();if(document.getElementById('rutHistoryWrap'))openRutHistory(r,true);});
}
/* La exclusión pertenece a la rutina, no a una versión de su horario: una
   sesión eliminada no reaparece al cambiar de días, recargar o importar. */
function rutDeleteSession(r,key){
  var session=rutSessionByKey(r,key);if(!session)throw new Error('La sesión ya no existe.');
  var copy=JSON.parse(JSON.stringify(r));
  if(session.extra)copy.extraSessions=copy.extraSessions.filter(function(s){return s.id!==key;});
  else{
    copy.deletedSessions=copy.deletedSessions||{};copy.deletedSessions[session.ds]=true;
    if(copy.flex)delete copy.flex.sessions[session.ds];
    if(copy.skips)delete copy.skips[session.ds];
    if(copy.keptSessions)delete copy.keptSessions[session.ds];
  }
  (copy.extraSessions||[]).forEach(function(s){if(s.recoveryOf===key)s.recoveryOf=null;});
  rutValidateExtraSessions(copy);return copy;
}

function openRutSessionDelete(r,key,afterDelete){
  var session=rutSessionByKey(r,key);if(!session)return;
  var linked=(r.extraSessions||[]).some(function(s){return s.recoveryOf===key;});
  var h='<div class="ev-form-overlay" id="rutDeleteOv"><div class="ev-form-sheet" role="alertdialog" aria-modal="true" aria-labelledby="rutDeleteTitle"><div class="ev-form-handle"></div><h3 class="ev-del-title" id="rutDeleteTitle">Eliminar sesión</h3>';
  h+='<p class="ev-del-sub">'+escHtml(r.name)+' · '+_rutFmt(session.ds)+' · '+session.time+'</p><p class="sy-note">Se quitará esta sesión del calendario y del histórico. No aparecerá como cancelada.</p>';
  if(linked)h+='<p class="sy-note warn">La recuperación se conservará como clase extra, sin vínculo con esta sesión.</p>';
  h+='<div class="ev-form-actions"><button class="ev-btn" id="rutDeleteCancel">Cancelar</button><button class="ev-btn danger" id="rutDeleteConfirm">Eliminar sesión</button></div></div></div>';
  var close=function(){cerrarPanel('rutDeleteWrap','rutDeleteOv');};
  var wrap=abrirPanel('rutDeleteWrap',h,{overlay:'rutDeleteOv',alCerrar:close});
  wrap.querySelector('#rutDeleteCancel').onclick=close;
  wrap.querySelector('#rutDeleteConfirm').onclick=function(){
    try{var result=rutDeleteSession(r,key);close();if(afterDelete)afterDelete();rutSaveSessionChange(r,result,'Sesión eliminada');}catch(e){showToast(e.message,'error');}
  };
}
