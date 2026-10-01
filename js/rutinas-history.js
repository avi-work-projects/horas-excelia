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
function rutHistoryMonthGroups(r,state){
  var from=state.from||r.start||evDk(new Date()),groups={},month=from.slice(0,7),last=state.to.slice(0,7);
  while(month<=last){groups[month]=[];var d=new Date(month+'-01T12:00:00');d.setMonth(d.getMonth()+1);month=evDk(d).slice(0,7);}
  rutHistorySessions(r,from,state.to).forEach(function(s){if(groups[s.ds.slice(0,7)])groups[s.ds.slice(0,7)].push(s);});
  return groups;
}
function renderRutHistorySession(r,x,today,state){
  state=state||{};
  var override=rutWeekCfg(r,x.ds).cambiada,edited=r.keptSessions&&r.keptSessions[x.ds]&&r.keptSessions[x.ds].edited;
  var recovered=rutRecoveryNote(r,x.key),currentWeek=rutWeekKey(x.ds)===rutWeekKey(today);
  var h='<div class="rut-history-session'+(x.skip?' cancelled':'')+(currentWeek?' current-week':'')+'" data-history-week="'+rutWeekKey(x.ds)+'" data-history-date="'+x.ds+'">'+(state.bulk?'<input type="checkbox" data-history-select="'+x.key+'" aria-label="Seleccionar '+x.ds+' '+x.time+'"'+((state.selected||[]).indexOf(x.key)>=0?' checked':'')+'>':'')+'<div><strong>'+_rutFmtCorto(x.ds)+'</strong><span>'+x.time+'–'+rutFin(x.time,x.dur)+'</span>';
  if(x.extra)h+='<small class="rut-session-tag">'+escHtml(rutSessionTag(r,x))+'</small>';
  if(recovered)h+='<em class="rut-recovery-note">'+escHtml(recovered)+'</em>';
  h+='</div><div class="rut-history-status">'+(x.skip?'Cancelada'+(!recovered?' (sin recuperar)':''):x.ds<today?'Realizada':x.ds===today?'Hoy':'Prevista')+(edited?'<small>Editada</small>':override?'<small>Excepción semanal</small>':'')+'</div>';
  return h+'<button class="boda-mini-btn action-edit" data-history-edit="'+x.key+'" aria-label="Editar sesión '+x.ds+' '+x.time+'">&#9998;</button></div>';
}
function renderRutHistory(r,state){
  var today=evDk(new Date()),groups=rutHistoryMonthGroups(r,state);
  var h='<div class="ev-detail-overlay" id="rutHistoryOv"><div class="ev-detail-sheet rut-history-sheet">';
  h+='<div class="ev-detail-handle"></div><div class="rut-history-head"><button class="sy-back" id="rutHistoryClose" aria-label="Cerrar histórico">&#8592;</button><div><strong>'+escHtml(r.name)+'</strong><span>Histórico de sesiones</span></div><button class="today-btn" id="rutHistoryToday">Hoy</button></div>';
  h+='<div class="rut-history-actions"><button class="ev-io-btn io-primaria" id="rutHistoryAdd">Añadir clase extra/recuperada</button><button class="ev-io-btn" id="rutHistoryBulk">'+(state.bulk?'Terminar selección':'Seleccionar clases / parón')+'</button></div>'+(state.bulk?rutHistorySelectionHtml(state):'')+'<div class="rut-history-body"><p class="sy-note">Sesiones por mes y horario habitual. El lápiz permite corregir o eliminar una sesión; las semanas sueltas se señalan como excepciones.</p>';
  (r.pauses||[]).forEach(function(p){h+='<p class="sy-note">Pausa: '+_rutFmt(p.from)+' a '+_rutFmt(p.to)+' · vuelta '+_rutFmt(rutOffsetDate(p.to,1))+'</p>';});
  if(state.from>(r.flex?rutFlexEarliest(r):r.start))h+='<button class="ev-io-btn rut-history-more" id="rutHistoryPast">Ver 12 meses anteriores</button>';
  Object.keys(groups).forEach(function(month){
    var sessions=groups[month],cancelled=sessions.filter(function(x){return x.skip;}).length,done=sessions.filter(function(x){return x.ds<today&&!x.skip;}).length;
    h+='<section class="rut-history-month" data-history-month="'+month+'"><h3>'+MN[+month.slice(5)-1]+' '+month.slice(0,4)+'</h3>';
    if(sessions.length)h+='<p class="rut-history-month-counts">'+done+' realizadas · '+cancelled+' canceladas · '+(sessions.length-done-cancelled)+' previstas</p>';
    else h+='<p class="sy-note">Sin sesiones este mes.</p>';
    if(state.bulk&&sessions.length)h+='<label class="rut-month-select"><input type="checkbox" data-history-select-month="'+month+'"'+(sessions.every(function(x){return (state.selected||[]).indexOf(x.key)>=0;})?' checked':'')+'> Seleccionar este mes</label>';
    var lastSignature=null;
    sessions.forEach(function(x){
      var schedule=rutScheduleOn(r,x.ds),signature=r.flex?'flex':rutScheduleSignature(schedule);
      if(signature!==lastSignature){h+='<div class="rut-history-schedule">'+escHtml(r.flex?'Sesiones flexibles':rutHistoryLabel(schedule))+'</div>';lastSignature=signature;}
      h+=renderRutHistorySession(r,x,today,state);
    });
    h+='</section>';
  });
  return h+'<button class="ev-io-btn rut-history-more" id="rutHistoryFuture">Ver 3 meses más</button><p class="sy-note">Sesiones previstas hasta '+_rutFmt(state.to)+'.</p></div></div></div>';
}
function rutHistoryScrollToday(wrap,smooth){
  var today=evDk(new Date()),week=rutWeekKey(today),body=wrap.querySelector('.rut-history-body');
  var target=wrap.querySelector('[data-history-week="'+week+'"]')||wrap.querySelector('[data-history-month="'+today.slice(0,7)+'"]');
  if(target){var offset=target.hasAttribute('data-history-month')?0:40;body.scrollTo({top:body.scrollTop+target.getBoundingClientRect().top-body.getBoundingClientRect().top-offset,behavior:smooth?'smooth':'auto'});}
}
function openRutHistory(r,keep){
  if(!keep||!RUT_HISTORY||RUT_HISTORY.id!==r.id){
    var end=new Date(),from=new Date(end.getFullYear(),end.getMonth()-12,1);end.setMonth(end.getMonth()+3);
    var earliest=r.flex?rutFlexEarliest(r):r.start;
    var first=earliest>evDk(from)?earliest:evDk(from),today=evDk(new Date());
    if(first>today)first=today.slice(0,7)+'-01';
    RUT_HISTORY={id:r.id,to:earliest>evDk(end)?earliest:evDk(end),from:first};
  }
  var old=document.querySelector('.rut-history-body'),top=keep&&old?old.scrollTop:0;
  var wrap=abrirPanel('rutHistoryWrap',renderRutHistory(r,RUT_HISTORY),{overlay:'rutHistoryOv',alCerrar:closeRutHistory});
  var body=wrap.querySelector('.rut-history-body');body.scrollTop=top;
  bindRutHistorySelection(wrap,r);
  wrap.querySelector('#rutHistoryClose').onclick=closeRutHistory;
  wrap.querySelector('#rutHistoryAdd').onclick=function(){openRutAddition(r);};
  wrap.querySelector('#rutHistoryToday').onclick=function(){
    var today=evDk(new Date());if(RUT_HISTORY.to<today||RUT_HISTORY.from>today){openRutHistory(r);return;}rutHistoryScrollToday(wrap,true);
  };
  var past=wrap.querySelector('#rutHistoryPast');if(past)past.onclick=function(){
    var d=new Date(RUT_HISTORY.from+'T12:00:00');d.setFullYear(d.getFullYear()-1);var earliest=r.flex?rutFlexEarliest(r):r.start;
    var previousMonth=RUT_HISTORY.from.slice(0,7),offset=body.scrollTop;RUT_HISTORY.from=evDk(d)<earliest?earliest:evDk(d);openRutHistory(r,true);
    var next=document.querySelector('.rut-history-body'),anchor=next.querySelector('[data-history-month="'+previousMonth+'"]');if(anchor)next.scrollTop+=anchor.getBoundingClientRect().top-next.getBoundingClientRect().top+offset;
  };
  wrap.querySelector('#rutHistoryFuture').onclick=function(){var d=new Date(RUT_HISTORY.to+'T12:00:00');d.setMonth(d.getMonth()+3);RUT_HISTORY.to=evDk(d);openRutHistory(r,true);};
  wrap.querySelectorAll('[data-history-edit]').forEach(function(el){el.onclick=function(){openRutHistoryEdit(r,el.dataset.historyEdit);};});
  if(!keep)requestAnimationFrame(function(){requestAnimationFrame(function(){if(wrap.isConnected)rutHistoryScrollToday(wrap,false);});});
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
  h+='<p class="sy-note">Solo cambia esta sesión. El horario habitual se conserva.</p><div class="rut-session-state">';
  if(session.skip){
    h+='<button class="ev-io-btn" id="rutHistoryCancel">Descancelar clase</button>';
    if(!rutRecoveryFor(r,key))h+='<button class="ev-io-btn rut-recovery-confirm" id="rutHistoryRecover">Recuperar clase</button>';
    else h+='<p class="sy-note">'+escHtml(rutRecoveryNote(r,key))+'</p>';
  }else h+='<button class="ev-io-btn io-peligro" id="rutHistoryCancel">Cancelar clase</button>';
  h+='</div>';
  h+='<div class="ev-form-actions"><button class="ev-btn danger" id="rutHistoryDelete">Eliminar</button><button class="ev-btn primary" id="rutHistorySave">Guardar</button></div></div></div>';
  var close=function(){cerrarPanel('rutHistoryEditWrap','rutHistoryEditOv');};
  var wrap=abrirPanel('rutHistoryEditWrap',h,{overlay:'rutHistoryEditOv',alCerrar:close});
  wrap.querySelector('#rutHistoryEditClose').onclick=close;
  wrap.querySelector('#rutHistoryCancel').onclick=function(){try{
    var result=rutEditSession(r,ds,session.time,session.dur,!session.skip,key);
    rutSaveSessionChange(r,result,session.skip?'Clase reactivada':'Clase cancelada');openRutHistoryEdit(r,key);
  }catch(e){showToast(e.message,'error');}};
  var recover=wrap.querySelector('#rutHistoryRecover');if(recover)recover.onclick=function(){close();openRutRecoveryDay(r,key,null,function(){closeRutAddition();openRutHistoryEdit(r,key);});};
  wrap.querySelector('#rutHistoryDelete').onclick=function(){openRutSessionDelete(r,key,close);};
  wrap.querySelector('#rutHistorySave').onclick=function(){
    try{
      var before=JSON.parse(JSON.stringify(r));
      var result=rutEditSession(r,ds,wrap.querySelector('#rutHistoryTime').value,+wrap.querySelector('#rutHistoryDuration').value,session.skip,key);
      Object.assign(r,result);saveRutinas();close();refreshEvents();openRutHistory(r,true);
      showToast('Sesión actualizada','success',function(){Object.keys(r).forEach(function(k){delete r[k];});Object.assign(r,before);saveRutinas();refreshEvents();if(document.getElementById('rutHistoryWrap'))openRutHistory(r,true);});
    }catch(e){showToast(e.message,'error');}
  };
}
