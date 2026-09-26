/* Rutinas por cupo: fechas explícitas, sin recurrencia automática. */
var RUT_PLAN = null; // {id,month,day}: estado del planificador, nunca los datos.
function rutFlexible(r){return !!(r&&r.flex);}
function rutFlexEarliest(r){return r.start?rutFlexRange(r.start,r.flex.period).start:'';}
function rutFlexTarget(r,ds){
  var overrides=r.flex.monthTargets||{},month=ds.slice(0,7);
  return r.flex.period==='month'&&Object.prototype.hasOwnProperty.call(overrides,month)?overrides[month]:r.flex.target;
}
function rutFlexRange(ds,period){
  var start=period==='week'?rutWeekKey(ds):ds.slice(0,7)+'-01';
  var end=new Date(start+'T12:00:00');
  if(period==='week')end.setDate(end.getDate()+6);else end.setMonth(end.getMonth()+1,0);
  return {start:start,end:evDk(end)};
}
function rutFlexCount(r,range){
  return rutSessions(r,range.start,range.end).filter(function(s){return !s.skip;}).length;
}
function rutFlexStatus(r,ds){
  var range=rutFlexRange(ds,r.flex.period),week=rutFlexRange(ds,'week');
  var count=rutFlexCount(r,range),weekly=rutFlexCount(r,week);
  var target=rutFlexTarget(r,ds),left=Math.max(0,target-count);
  return {range:range,count:count,target:target,left:left,weekly:weekly,
    missing:Math.min(left,Math.max(0,(r.flex.period==='week'?r.flex.target:r.flex.weeklyTarget)-weekly))};
}
function rutFlexWarnings(ds){
  return RUTINAS.filter(function(r){return rutFlexible(r)&&(!r.start||r.start<=ds)&&!rutSuspendedOn(r,ds);}).map(function(r){
    var st=rutFlexStatus(r,ds);
    return st.missing?{id:r.id,text:r.name+' - Faltan '+st.missing+' sesiones por programar esta semana'+(r.flex.period==='month'?' · '+st.left+' pendientes del mes':'')}:null;
  }).filter(Boolean);
}
function rutFlexSummary(r){
  var st=rutFlexStatus(r,evDk(new Date()));
  return '<div class="rut-flex-summary"><b>'+st.count+' / '+st.target+' sesiones '+(r.flex.period==='month'?'del mes':'de la semana')+'</b>'
    +'<span>'+(st.missing?'Faltan '+st.missing+' por programar esta semana':'Objetivo semanal planificado')+'</span>'
    +'<button class="ev-btn" data-rplan="'+escHtml(r.id)+'">Planificar sesiones</button></div>';
}
function rutFlexOptionsHtml(r){
  var f=r&&r.flex,month=r&&r.start?r.start.slice(0,7):'';
  var firstTarget=f&&f.monthTargets&&Object.prototype.hasOwnProperty.call(f.monthTargets,month)?f.monthTargets[month]:(f?f.target:'');
  return '<div class="ev-field"><label>Modalidad</label><div class="rut-flex-choice">'
    +'<button type="button" class="ev-btn'+(!f?' primary':'')+'" data-rmode="fixed"'+(r?' disabled':'')+'>Horario fijo</button>'
    +'<button type="button" class="ev-btn'+(f?' primary':'')+'" data-rmode="flex"'+(r?' disabled':'')+'>Sesiones flexibles</button></div></div>'
    +'<div id="rutFlexOptions"'+(!f?' hidden':'')+'><div class="ev-field"><label>Cupo de sesiones</label><div class="rut-flex-choice">'
    +'<button type="button" class="ev-btn'+(!f||f.period==='month'?' primary':'')+'" data-rperiod="month">Al mes</button>'
    +'<button type="button" class="ev-btn'+(f&&f.period==='week'?' primary':'')+'" data-rperiod="week">A la semana</button></div></div>'
    +'<div class="ev-date-row"><div><label>Sesiones del cupo</label><input class="ev-input" type="number" min="1" max="31" id="rutFTarget" value="'+(f?f.target:8)+'"></div>'
    +'<div id="rutWeeklyGoal"><label>Objetivo semanal</label><input class="ev-input" type="number" min="1" max="7" id="rutFWeekly" value="'+(f?f.weeklyTarget:2)+'"></div></div>'
    +'<div class="ev-field rut-first-quota" id="rutFirstQuota" hidden><label id="rutFirstQuotaLabel" for="rutFFirstTarget"></label><input class="ev-input" type="number" min="0" max="31" id="rutFFirstTarget" value="'+firstTarget+'"><p class="sy-note">Incluye las sesiones ya realizadas y las que harás este mes. Si no necesitas un cupo especial, indica el habitual. Podrás añadir fechas pasadas del primer mes.</p></div>'
    +'<p class="sy-note rut-flex-help">Elige después cada fecha y hora, también las ya realizadas desde el comienzo del primer período. Las sesiones saltadas no consumen el cupo. Desde el histórico puedes añadir extras y recuperaciones.</p></div>';
}
function bindRutFlexOptions(r){
  function paint(){
    var flex=document.querySelector('[data-rmode="flex"]').classList.contains('primary');
    document.getElementById('rutFlexOptions').hidden=!flex;
    document.getElementById('rutFDays').parentElement.hidden=flex;
    document.getElementById('rutFTime').parentElement.hidden=flex;
    document.getElementById('rutFPorDia').closest('.rut-hpd').hidden=flex;
    var monthly=document.querySelector('[data-rperiod="month"]').classList.contains('primary');
    document.getElementById('rutWeeklyGoal').hidden=!monthly;
    document.getElementById('rutFTarget').max=monthly?'31':'7';
    var start=r?r.start:(document.getElementById('rutFStart')||{}).value;
    var first=flex&&monthly&&validIsoDate(start)&&start.slice(8)!=='01';
    document.getElementById('rutFirstQuota').hidden=!first;
    document.getElementById('rutFirstQuotaLabel').textContent=first?'¿Cuál es tu cupo total de sesiones en '+MN[+start.slice(5,7)-1].toLowerCase()+'?':'';
  }
  ['rmode','rperiod'].forEach(function(key){document.querySelectorAll('[data-'+key+']').forEach(function(b){b.onclick=function(){
    document.querySelectorAll('[data-'+key+']').forEach(function(x){x.classList.toggle('primary',x===b);});paint();
  };});});var start=document.getElementById('rutFStart');if(start){start.addEventListener('input',paint);start.addEventListener('change',paint);}paint();
}
function rutFlexRead(r){
  if(!document.querySelector('[data-rmode="flex"]').classList.contains('primary'))return null;
  var period=document.querySelector('[data-rperiod].primary').dataset.rperiod;
  var target=Number(document.getElementById('rutFTarget').value),weekly=Number(document.getElementById('rutFWeekly').value);
  var start=r?r.start:document.getElementById('rutFStart').value;
  if((!r||start)&&!validIsoDate(start))throw new Error('Elige una fecha de inicio válida.');
  if(!Number.isInteger(target)||target<1||target>(period==='week'?7:31))throw new Error('El cupo debe ser un número entero de 1 a '+(period==='week'?7:31)+' sesiones.');
  if(period==='month'&&(!Number.isInteger(weekly)||weekly<1||weekly>7))throw new Error('El objetivo semanal debe ser un número entero de 1 a 7 sesiones.');
  var overrides=Object.assign({},r&&r.flex?r.flex.monthTargets||{}:{});
  if(period==='month'&&start&&start.slice(8)!=='01'){
    var first=document.getElementById('rutFFirstTarget').value.trim(),n=Number(first),month=start.slice(0,7);
    if(first===''||!Number.isInteger(n)||n<0||n>31)throw new Error('Indica el cupo total del primer mes (0–31 sesiones), incluidas las ya realizadas.');
    if(!r||n!==target||Object.prototype.hasOwnProperty.call(overrides,month))overrides[month]=n;
  }
  if(r&&r.flex&&period!==r.flex.period&&start&&Object.keys(r.flex.sessions).some(function(ds){return ds<rutFlexRange(start,period).start;}))throw new Error('No puedes cambiar el período: quedarían sesiones fuera del primer período.');
  return {period:period,target:target,weeklyTarget:period==='week'?target:weekly,monthTargets:overrides,sessions:r&&r.flex?r.flex.sessions:{}};
}
function rutFlexSetSession(r,oldDay,ds,time,dur,reactivate){
  if(oldDay&&(r.extraSessions||[]).some(function(s){return s.recoveryOf===oldDay;})&&(ds!==oldDay||reactivate))throw new Error('La sesión está vinculada a una recuperación. Puedes editar su hora desde el histórico.');
  if(!validIsoDate(ds))throw new Error('Elige una fecha válida para la sesión.');
  if(ds<rutFlexEarliest(r))throw new Error('Solo puedes registrar sesiones desde el '+_rutFmt(rutFlexEarliest(r))+', inicio del primer período.');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Indica una hora válida para la sesión.');
  if(!Number.isInteger(dur)||dur<15||dur>480)throw new Error('La duración debe ser un número entero de 15 a 480 minutos.');
  if(ds!==oldDay&&r.flex.sessions[ds])throw new Error('Ya hay una sesión de esta rutina ese día.');
  var copy=JSON.parse(JSON.stringify(r));copy.skips=copy.skips||{};
  var keepSkipped=oldDay&&copy.skips[oldDay]&&!reactivate;
  if(oldDay){delete copy.flex.sessions[oldDay];delete copy.skips[oldDay];}
  copy.flex.sessions[ds]={time:time,dur:dur};delete copy.skips[ds];
  if(keepSkipped)copy.skips[ds]=1;
  if(rutSuspendedOn(copy,ds))throw new Error('La rutina está en pausa ese día.');
  if(rutFlexCount(copy,rutFlexRange(ds,copy.flex.period))>rutFlexTarget(copy,ds))throw new Error('Has completado el cupo de '+rutFlexTarget(copy,ds)+' sesiones '+(copy.flex.period==='month'?'de '+MN[+ds.slice(5,7)-1].toLowerCase()+' '+ds.slice(0,4):'de esa semana')+'. Cambia el cupo o quita otra sesión.');
  var full=rutLimitExceeded(copy,r.id);if(full)throw new Error('El '+_rutFmt(full)+' ya tiene el máximo de rutinas.');
  rutValidateExtraSessions(copy);r.flex=copy.flex;r.skips=copy.skips;
}
function renderRutPlan(r){
  var month=RUT_PLAN.month,ds=RUT_PLAN.day,session=ds&&r.flex.sessions[ds];
  var range=rutFlexRange(month+'-01','month'),first=new Date(range.start+'T12:00:00'),days=+range.end.slice(8);
  var h='<div class="ev-form-overlay" id="rutPlanOv"><div class="ev-form-sheet rut-plan"><div class="ev-form-handle"></div>'
    +'<div class="rut-plan-header"><button class="sy-back" id="rutPlanClose">←</button><b>'+escHtml(r.name)+'</b><span></span></div>'
    +'<div class="rut-plan-header"><button class="sy-back" data-rmonth="-1">◀</button><b>'+MN[first.getMonth()]+' '+first.getFullYear()+'</b><button class="sy-back" data-rmonth="1">▶</button></div>'
    +'<div class="sy-note">'+(r.flex.period==='month'?rutFlexCount(r,range)+' / '+rutFlexTarget(r,range.start)+' sesiones del mes · Objetivo: '+r.flex.weeklyTarget+' por semana':r.flex.target+' sesiones por semana')+'</div>'
    +'<div class="rut-plan-grid">';
  ['L','M','X','J','V','S','D'].forEach(function(day){h+='<span>'+day+'</span>';});
  for(var pad=0;pad<(first.getDay()+6)%7;pad++)h+='<span></span>';
  for(var i=1;i<=days;i++){
    var date=month+'-'+String(i).padStart(2,'0'),s=r.flex.sessions[date],skip=rutIsSkipped(r,date);
    h+='<button class="rut-plan-day'+(s?' planned':'')+(date===ds?' selected':'')+(skip?' skipped':'')+'" data-rday="'+date+'"'+(date<rutFlexEarliest(r)?' disabled':'')+'>'+i+(s?'<small>'+s.time+'</small>':'')+'</button>';
  }
  h+='</div>';
  if(ds)h+='<div class="rut-plan-editor"><b>'+_rutFmt(ds)+'</b><div class="ev-date-row"><div><label>Hora</label><input class="ev-input" id="rutPlanTime" type="time" value="'+(session?session.time:r.time||RUT_TIME_DEFAULT)+'"></div><div><label>Duración (min)</label><input class="ev-input" id="rutPlanDur" type="number" min="15" max="480" value="'+(session?session.dur:r.dur)+'"></div></div><div class="ev-detail-actions">'+(session?'<button class="ev-btn danger" id="rutPlanDelete">Quitar sesión</button>':'')+'<button class="ev-btn primary" id="rutPlanSave">'+(session?'Guardar cambios':'Añadir sesión')+'</button></div></div>';
  var list=Object.keys(r.flex.sessions).filter(function(day){return day.slice(0,7)===month;}).sort(),week='';
  if(!list.length)h+='<p class="sy-note">Pulsa un día para programar una sesión.</p>';
  list.forEach(function(day){
    var wk=rutWeekKey(day);if(wk!==week){week=wk;h+='<h4>Semana del '+_rutFmtCorto(wk)+' · '+rutFlexCount(r,rutFlexRange(day,'week'))+' / '+(r.flex.period==='week'?r.flex.target:r.flex.weeklyTarget)+'</h4>';}
    var s=r.flex.sessions[day];h+='<div class="rut-plan-row"><button class="ev-btn" data-rday="'+day+'">'+_rutFmtCorto(day)+' · '+s.time+'–'+rutFin(s.time,s.dur)+'</button><button class="ev-btn" data-rskip="'+day+'">'+(rutIsSkipped(r,day)?'Reactivar':'Saltar')+'</button></div>';
  });return h+'</div></div>';
}
function openRutPlan(r){RUT_PLAN={id:r.id,month:evDk(new Date()).slice(0,7),day:null};refreshRutPlan();}
function closeRutPlan(){cerrarPanel('rutPlanWrap','rutPlanOv');refreshEvents();}
function refreshRutPlan(){
  var r=rutById(RUT_PLAN.id);if(!r)return;
  r.skips=r.skips||{};
  var wrap=abrirPanel('rutPlanWrap',renderRutPlan(r),{overlay:'rutPlanOv',alCerrar:closeRutPlan});
  wrap.querySelector('#rutPlanClose').onclick=closeRutPlan;
  wrap.querySelectorAll('[data-rmonth]').forEach(function(b){b.onclick=function(){var d=new Date(RUT_PLAN.month+'-01T12:00:00');d.setMonth(d.getMonth()+Number(b.dataset.rmonth));RUT_PLAN.month=evDk(d).slice(0,7);RUT_PLAN.day=null;refreshRutPlan();};});
  wrap.querySelectorAll('[data-rday]').forEach(function(b){b.onclick=function(){RUT_PLAN.day=b.dataset.rday;refreshRutPlan();};});
  function mutate(fn){var prev=JSON.parse(JSON.stringify(r));try{fn();saveRutinas();refreshRutPlan();showToast('Planificación actualizada','success',function(){Object.assign(r,prev);saveRutinas();refreshEvents();if(document.getElementById('rutPlanOv'))refreshRutPlan();});}catch(e){showToast(e.message,'error');}}
  wrap.querySelectorAll('[data-rskip]').forEach(function(b){b.onclick=function(){mutate(function(){var ds=b.dataset.rskip;if(rutIsSkipped(r,ds))rutFlexSetSession(r,ds,ds,r.flex.sessions[ds].time,r.flex.sessions[ds].dur,true);else r.skips[ds]=1;});};});
  var save=wrap.querySelector('#rutPlanSave');if(save)save.onclick=function(){mutate(function(){var ds=RUT_PLAN.day;rutFlexSetSession(r,r.flex.sessions[ds]?ds:null,ds,wrap.querySelector('#rutPlanTime').value,Number(wrap.querySelector('#rutPlanDur').value));});};
  var del=wrap.querySelector('#rutPlanDelete');if(del)del.onclick=function(){mutate(function(){if((r.extraSessions||[]).some(function(s){return s.recoveryOf===RUT_PLAN.day;}))throw new Error('Esta sesión está vinculada a una recuperación y debe conservarse.');delete r.flex.sessions[RUT_PLAN.day];delete r.skips[RUT_PLAN.day];RUT_PLAN.day=null;});};
}
