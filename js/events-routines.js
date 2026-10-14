/* El alta desde Eventos escribe sesiones de la rutina, nunca eventos duplicados. */
function evActiveRoutines(){
  var ds=evDk(new Date());
  return RUTINAS.filter(function(r){return (!r.start||r.start<=ds)&&!rutSuspendedOn(r,ds);});
}
function evRoutineChoice(r){
  return '<button type="button" class="ev-color-swatch ev-routine-choice" data-event-routine="'+escHtml(r.id)+'" style="color:'+rutDisplayColor(r)+'"><span class="ev-type-dot">'+rutIconSvg(rutIconOf(r),rutDisplayColor(r),true)+'</span><span class="ev-type-name">'+escHtml(r.name)+'</span></button>';
}
function renderEvRoutineChoices(){
  var list=evActiveRoutines();if(!list.length)return '';
  return '<section class="ev-category-group ev-routines-active" aria-label="Rutinas activas"><strong>Rutinas activas</strong><div class="ev-routines-quick" style="--routine-columns:'+Math.max(2,Math.min(4,list.length))+'">'+list.slice(0,4).map(evRoutineChoice).join('')+'</div>'+(list.length>4?'<button type="button" class="ev-io-btn" id="evRoutinesMore">Más opciones</button>':'')+'</section>';
}
function bindEvRoutineChoices(form){
  function choose(r){
    var date=_evFormEl(form,'evFStart').value||evDk(new Date());
    if(r.flex)openRutRecoveryDay(r,null,date,function(){closeRutAddition();},closeEvForm);
    else openEvRoutineSession(r,date,closeEvForm);
  }
  form.root.querySelectorAll('[data-event-routine]').forEach(function(b){b.onclick=function(){choose(rutById(b.dataset.eventRoutine));};});
  var more=form.root.querySelector('#evRoutinesMore');if(more)more.onclick=function(){
    function close(){cerrarPanel('evRoutinesWrap','evRoutinesOv');}
    var html='<div class="ev-detail-overlay" id="evRoutinesOv"><section class="ev-detail-sheet"><header class="bd-panel-header panel-header-centered"><button class="sy-back" id="evRoutinesClose" aria-label="Volver">←</button><h2>Rutinas activas</h2><span></span></header><div class="ev-routines-quick" style="--routine-columns:2">'+evActiveRoutines().map(evRoutineChoice).join('')+'</div></section></div>';
    var wrap=abrirPanel('evRoutinesWrap',html,{overlay:'evRoutinesOv',alCerrar:close});wrap.querySelector('#evRoutinesClose').onclick=close;
    wrap.querySelectorAll('[data-event-routine]').forEach(function(b){b.onclick=function(){close();choose(rutById(b.dataset.eventRoutine));};});
  };
}
function rutPlanFixedSession(r,data,replaceKey){
  rutValidateAddition(r,data);
  if(r.flex)throw new Error('Esta rutina usa clases extras desde Eventos.');
  if(rutSuspendedOn(r,data.date))throw new Error('La rutina está en pausa ese día.');
  var copy=JSON.parse(JSON.stringify(r)),source=replaceKey&&rutSessionByKey(copy,replaceKey);
  if(replaceKey&&(!source||source.extra||source.skip||rutWeekKey(source.ds)!==rutWeekKey(data.date)))throw new Error('Elige una sesión prevista de esa semana.');
  if(source&&rutRecoveryFor(copy,source.key))throw new Error('Esta sesión tiene una recuperación vinculada.');
  var existing=rutSessionByKey(copy,data.date);
  if(existing&&(!source||existing.key!==source.key))throw new Error('Ese día ya tiene una sesión. Selecciónala para cambiar su horario.');
  if(source&&source.ds!==data.date)copy=rutDeleteSession(copy,source.key);
  copy.keptSessions=copy.keptSessions||{};copy.skips=copy.skips||{};
  if(copy.deletedSessions)delete copy.deletedSessions[data.date];
  delete copy.skips[data.date];
  var original=source?rutSessionOriginal(r,source):null;
  copy.keptSessions[data.date]={time:data.time,dur:data.dur,planned:true};
  if(original){Object.assign(copy.keptSessions[data.date],{originalTime:original.time,originalDur:original.dur,originalDate:original.ds});}
  var full=rutLimitExceeded(copy,r.id);if(full)throw new Error('El '+_rutFmt(full)+' ya tiene el máximo de rutinas.');
  rutValidateExtraSessions(copy);return copy;
}
function openEvRoutineSession(r,date,onSaved){
  var h='<p class="sy-note">'+escHtml(r.name)+' · Sesión planificada. El horario habitual se conserva.</p><div class="rut-addition-fields"><div class="ev-field rut-addition-date"><label for="evRoutineDate">Día</label><input class="ev-input" id="evRoutineDate" type="date" value="'+date+'"></div><div class="ev-field"><label for="evRoutineTime">Hora</label><input class="ev-input" id="evRoutineTime" type="text" readonly data-time-picker value="'+rutWeekCfg(r,date).time+'"></div><div class="ev-field"><label for="evRoutineDur">Duración · min</label><input class="ev-input" id="evRoutineDur" type="number" min="15" max="480" value="'+rutWeekCfg(r,date).dur+'"></div></div><div id="evRoutineWeek"></div><div class="ev-form-actions"><button class="ev-btn primary" id="evRoutineSave">Guardar sesión planificada</button></div>';
  var wrap=rutAdditionPanel('Planificar sesión',h,closeRutAddition);
  function week(){
    var ds=wrap.querySelector('#evRoutineDate').value;if(!validIsoDate(ds))return;
    var range=rutFlexRange(ds,'week'),list=rutSessions(r,range.start,range.end).filter(function(s){return !s.extra&&!s.skip;});
    var body=list.length?'<p class="sy-note warn">Ya tienes '+list.length+' sesiones planificadas esta semana. Puedes cambiar uno de los horarios comprometidos o añadir otra sesión.</p>':'';
    if(list.length){body+='<div class="rut-addition-choices"><label><input type="radio" name="routineReplace" value="" checked> Añadir otra sesión planificada</label>';list.forEach(function(s){body+='<label><input type="radio" name="routineReplace" value="'+s.key+'"> Cambiar '+_rutFmtCorto(s.ds)+' · '+s.time+'–'+rutFin(s.time,s.dur)+'</label>';});body+='</div>';}
    wrap.querySelector('#evRoutineWeek').innerHTML=body;
  }
  wrap.querySelector('#evRoutineDate').onchange=week;week();
  wrap.querySelector('#evRoutineSave').onclick=function(){try{
    var selected=wrap.querySelector('[name="routineReplace"]:checked');
    var result=rutPlanFixedSession(r,{date:wrap.querySelector('#evRoutineDate').value,time:wrap.querySelector('#evRoutineTime').value,dur:+wrap.querySelector('#evRoutineDur').value},selected&&selected.value);
    closeRutAddition();rutSaveSessionChange(r,result,'Sesión planificada');if(onSaved)onSaved();
  }catch(e){showToast(e.message,'error');}};
}
