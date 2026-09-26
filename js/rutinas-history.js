/* Horarios habituales e historial de sesiones. Las excepciones semanales no crean etapas. */
var RUT_HISTORY=null;
function rutNewSchedule(r,value,from){
  var base=rutScheduleCopy(rutScheduleOn(r,from));
  var candidate=Object.assign({},r,base,value,{times:null});
  Object.keys(candidate.weeks).forEach(function(wk){
    var end=new Date(wk+'T12:00:00');end.setDate(end.getDate()+6);
    if(evDk(end)>=from)delete candidate.weeks[wk];
  });
  return rutChangeFrom(r,candidate,from);
}
function rutScheduleSignature(s){
  return JSON.stringify((s.weekDays||[]).slice().sort().map(function(wd){return [wd,rutTimeOfDay(s,wd)];}));
}
function rutHistoryPeriods(r,to){
  var from=r.start||evDk(new Date()),out=[];
  var versions=(r.scheduleHistory||[]).concat([{until:null,schedule:r}]);
  versions.forEach(function(v){
    if(v.until&&v.until<=from)return;
    var signature=rutScheduleSignature(v.schedule),last=out[out.length-1];
    if(last&&last.signature===signature)last.until=v.until;
    else out.push({from:from,until:v.until,schedule:v.schedule,signature:signature});
    if(v.until)from=v.until;
  });
  return out.filter(function(p){return p.from<=to;});
}
function rutHistorySessions(r,from,to){
  var out=[],d=new Date(from+'T12:00:00');
  while(evDk(d)<=to){
    var end=new Date(d);end.setDate(end.getDate()+799);
    out=out.concat(rutSessions(r,evDk(d),evDk(end)<to?evDk(end):to));
    d.setDate(d.getDate()+800);
  }
  return out;
}
function rutHistoryLabel(s){
  return (s.weekDays||[]).slice().sort(function(a,b){return (a||7)-(b||7);}).map(function(wd){
    return RUT_DN_LARGO[wd]+' '+rutTimeOfDay(s,wd);
  }).join(' · ');
}
function renderRutHistory(r,state){
  var today=evDk(new Date()),periods=rutHistoryPeriods(r,state.to);
  var h='<div class="ev-detail-overlay" id="rutHistoryOv"><div class="ev-detail-sheet rut-history-sheet">';
  h+='<div class="ev-detail-handle"></div><div class="rut-history-head"><button class="sy-back" id="rutHistoryClose" aria-label="Cerrar histórico">&#8592;</button><div><strong>'+escHtml(r.name)+'</strong><span>Histórico de sesiones</span></div></div>';
  h+='<div class="rut-history-actions"><button class="ev-io-btn" id="rutHistoryCurrent">Ir al horario actual</button><button class="ev-io-btn io-primaria" id="rutHistoryAdd">Añadir clase extra/recuperada</button></div><div class="rut-history-body"><p class="sy-note">Cada bloque es un horario habitual. Las semanas sueltas aparecen como excepciones. Pulsa el lápiz de una sesión para corregirla.</p>';
  periods.forEach(function(p,index){
    var end=state.to;if(p.until){var d=new Date(p.until+'T12:00:00');d.setDate(d.getDate()-1);if(evDk(d)<end)end=evDk(d);}
    var sessions=rutHistorySessions(r,p.from,end),cancelled=sessions.filter(function(x){return x.skip;}).length;
    var done=sessions.filter(function(x){return x.ds<today&&!x.skip;}).length;
    var current=p.from<=today&&(!p.until||today<p.until);
    var open=state.open[p.from]!==undefined?state.open[p.from]:current;
    h+='<details class="rut-history-period" data-period="'+p.from+'"'+(current?' data-current="true"':'')+(open?' open':'')+'><summary>';
    h+='<span class="rut-history-top"><b>Horario '+(index+1)+'</b><em>'+(current?'Actual':p.from>today?'Programado':'Anterior')+'</em></span>';
    h+='<strong class="rut-history-hours">'+escHtml(r.flex?'Sesiones flexibles':rutHistoryLabel(p.schedule))+'</strong>';
    h+='<span class="rut-history-range">'+_rutFmt(p.from)+(p.until?' → '+_rutFmt(end):' → en adelante')+'</span>';
    h+='<span class="rut-history-counts">'+done+' realizadas · '+cancelled+' canceladas · '+(sessions.length-done-cancelled)+' previstas</span></summary>';
    var shown=state.counts[p.from]||20;
    sessions.slice(0,shown).forEach(function(x){
      var override=rutWeekCfg(r,x.ds).cambiada,edited=r.keptSessions&&r.keptSessions[x.ds]&&r.keptSessions[x.ds].edited;
      var recovered=rutRecoveryNote(r,x.key);
      h+='<div class="rut-history-session'+(x.skip?' cancelled':'')+'"><div><strong>'+_rutFmtCorto(x.ds)+' · '+x.ds.slice(0,4)+'</strong><span>'+x.time+'–'+rutFin(x.time,x.dur)+'</span>';
      if(x.extra)h+='<small class="rut-session-tag">'+escHtml(rutSessionTag(r,x))+'</small>';
      if(recovered)h+='<em class="rut-recovery-note">'+escHtml(recovered)+'</em>';
      h+='</div>';
      h+='<div class="rut-history-status">'+(x.skip?'Cancelada':x.ds<today?'Realizada':'Prevista')+(edited?'<small>Editada</small>':override?'<small>Excepción semanal</small>':'')+'</div>';
      h+='<button class="boda-mini-btn action-edit" data-history-edit="'+x.key+'" aria-label="Editar sesión '+x.ds+' '+x.time+'">&#9998;</button></div>';
    });
    if(!sessions.length)h+='<p class="sy-note">Sin sesiones en este periodo.</p>';
    if(sessions.length>shown)h+='<button class="ev-io-btn rut-history-more" data-history-more="'+p.from+'">Ver 20 sesiones más ('+(sessions.length-shown)+' pendientes)</button>';
    h+='</details>';
  });
  h+='<button class="ev-io-btn rut-history-more" id="rutHistoryFuture">Ver 3 meses más</button><p class="sy-note">Sesiones previstas hasta '+_rutFmt(state.to)+'.</p></div></div></div>';
  return h;
}
function openRutHistory(r,keep){
  if(!keep||!RUT_HISTORY||RUT_HISTORY.id!==r.id){
    var end=new Date();end.setMonth(end.getMonth()+3);
    RUT_HISTORY={id:r.id,to:evDk(end),open:{},counts:{}};
  }
  var old=document.querySelector('.rut-history-body'),top=keep&&old?old.scrollTop:0;
  var wrap=abrirPanel('rutHistoryWrap',renderRutHistory(r,RUT_HISTORY),{overlay:'rutHistoryOv',alCerrar:closeRutHistory});
  wrap.querySelector('.rut-history-body').scrollTop=top;
  wrap.querySelector('#rutHistoryClose').onclick=closeRutHistory;
  wrap.querySelector('#rutHistoryAdd').onclick=function(){openRutAddition(r);};
  wrap.querySelector('#rutHistoryCurrent').onclick=function(){var current=wrap.querySelector('[data-current]');if(current){current.open=true;current.scrollIntoView({block:'start',behavior:'smooth'});}};
  wrap.querySelectorAll('[data-period]').forEach(function(el){el.ontoggle=function(){RUT_HISTORY.open[el.dataset.period]=el.open;};});
  wrap.querySelectorAll('[data-history-more]').forEach(function(el){el.onclick=function(){var key=el.dataset.historyMore;RUT_HISTORY.counts[key]=(RUT_HISTORY.counts[key]||20)+20;openRutHistory(r,true);};});
  wrap.querySelector('#rutHistoryFuture').onclick=function(){var d=new Date(RUT_HISTORY.to+'T12:00:00');d.setMonth(d.getMonth()+3);RUT_HISTORY.to=evDk(d);openRutHistory(r,true);};
  wrap.querySelectorAll('[data-history-edit]').forEach(function(el){el.onclick=function(){openRutHistoryEdit(r,el.dataset.historyEdit);};});
}
function closeRutHistory(){cerrarPanel('rutHistoryWrap','rutHistoryOv');}
function rutEditSession(r,ds,time,dur,skip,key){
  key=key||ds;var session=rutSessionByKey(r,key);
  if(!session)throw new Error('La sesión ya no existe');
  if(!skip&&rutRecoveryFor(r,key))throw new Error('Cancela primero su recuperación para reactivar la sesión original.');
  if(!skip&&rutSessionsOn(r,ds).some(function(s){return s.key!==key&&!s.skip&&s.time===time;}))throw new Error('Ya tienes una sesión de esta rutina a esa hora.');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!Number.isInteger(dur)||dur<15||dur>480)throw new Error('Revisa la hora y duración (15–480 min)');
  var candidate=JSON.parse(JSON.stringify(r));candidate.keptSessions=candidate.keptSessions||{};
  if(session.extra){var extra=candidate.extraSessions.find(function(s){return s.id===key;});extra.time=time;extra.dur=dur;extra.skip=skip;rutValidateExtraSessions(candidate);return candidate;}
  if(candidate.flex)candidate.flex.sessions[ds]={time:time,dur:dur};
  else candidate.keptSessions[ds]={time:time,dur:dur,edited:true};candidate.skips=candidate.skips||{};
  if(skip)candidate.skips[ds]=1;else delete candidate.skips[ds];
  if(!skip&&rutIsSkipped(r,ds)&&ds>=evDk(new Date())&&rutDayCount(ds,r.id)>=3)throw new Error('Ese día ya tiene 3 rutinas');
  rutValidateExtraSessions(candidate);
  return candidate;
}
function openRutHistoryEdit(r,key){
  var session=rutSessionByKey(r,key);if(!session)return;var ds=session.ds;
  var h='<div class="ev-form-overlay" id="rutHistoryEditOv"><div class="ev-form-sheet"><div class="ev-form-handle"></div>';
  h+='<div class="rut-history-head"><button class="sy-back" id="rutHistoryEditClose">&#8592;</button><div><strong>Editar sesión</strong><span>'+_rutFmtCorto(ds)+'</span></div></div>';
  h+='<div class="ev-date-row"><div><label>Hora</label><input type="time" class="ev-input" id="rutHistoryTime" value="'+session.time+'"></div><div><label>Duración (min)</label><input type="number" class="ev-input" id="rutHistoryDuration" min="15" max="480" value="'+session.dur+'"></div></div>';
  h+='<label class="excl-item rut-week-forward"><input type="checkbox" id="rutHistorySkip"'+(session.skip?' checked':'')+'> Sesión cancelada</label><p class="sy-note">Solo cambia esta sesión. El horario habitual se conserva.</p>';
  h+='<button class="ev-io-btn rut-addition-entry" id="rutHistoryEditAdd">Añadir clase extra/recuperada</button>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="rutHistorySave">Guardar</button></div></div></div>';
  var close=function(){cerrarPanel('rutHistoryEditWrap','rutHistoryEditOv');};
  var wrap=abrirPanel('rutHistoryEditWrap',h,{overlay:'rutHistoryEditOv',alCerrar:close});
  wrap.querySelector('#rutHistoryEditClose').onclick=close;
  wrap.querySelector('#rutHistoryEditAdd').onclick=function(){close();openRutAddition(r);};
  wrap.querySelector('#rutHistorySave').onclick=function(){
    try{
      var before=JSON.parse(JSON.stringify(r));
      var result=rutEditSession(r,ds,wrap.querySelector('#rutHistoryTime').value,+wrap.querySelector('#rutHistoryDuration').value,wrap.querySelector('#rutHistorySkip').checked,key);
      Object.assign(r,result);saveRutinas();close();refreshEvents();openRutHistory(r,true);
      showToast('Sesión actualizada','success',function(){Object.keys(r).forEach(function(k){delete r[k];});Object.assign(r,before);saveRutinas();refreshEvents();if(document.getElementById('rutHistoryWrap'))openRutHistory(r,true);});
    }catch(e){showToast(e.message,'error');}
  };
}
