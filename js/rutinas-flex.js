/* Rutinas por cupo: fechas explícitas, sin recurrencia automática. */
var RUT_PLAN = null; // {id,month,selected,time,dur}: borrador; solo Guardar persiste.
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
    +'<span>'+(st.missing?'Faltan '+st.missing+' por programar esta semana':'Objetivo semanal planificado')+'</span></div>';
}
function rutFlexOptionsHtml(r){
  var f=r&&r.flex,month=r&&r.start?r.start.slice(0,7):'',locked=rutSetupLocked(r);
  if(locked&&!f)return '';
  var firstTarget=f&&f.monthTargets&&Object.prototype.hasOwnProperty.call(f.monthTargets,month)?f.monthTargets[month]:(f?f.target:'');
  return (locked?'':'<div class="ev-field"><label>Modalidad</label><div class="rut-flex-choice">'
    +'<button type="button" class="ev-btn'+(!f?' primary':'')+'" data-rmode="fixed">Horario fijo</button>'
    +'<button type="button" class="ev-btn'+(f?' primary':'')+'" data-rmode="flex">Sesiones flexibles</button></div></div>')
    +'<div id="rutFlexOptions"'+(!f?' hidden':'')+'>'+(locked?'':'<div class="ev-field"><label>Cupo de sesiones</label><div class="rut-flex-choice">'
    +'<button type="button" class="ev-btn'+(!f||f.period==='month'?' primary':'')+'" data-rperiod="month">Al mes</button>'
    +'<button type="button" class="ev-btn'+(f&&f.period==='week'?' primary':'')+'" data-rperiod="week">A la semana</button></div></div>')
    +'<div class="ev-date-row"><div><label>Sesiones '+(locked?(f.period==='month'?'al mes':'a la semana'):'del cupo')+'</label><input class="ev-input" type="number" min="1" max="'+(f&&f.period==='week'?7:31)+'" id="rutFTarget" value="'+(f?f.target:8)+'"></div>'
    +'<div id="rutWeeklyGoal"'+(f&&f.period==='week'?' hidden':'')+'><label>Objetivo semanal</label><input class="ev-input" type="number" min="1" max="7" id="rutFWeekly" value="'+(f?f.weeklyTarget:2)+'"></div></div>'
    +(locked?'':'<div class="ev-field rut-first-quota" id="rutFirstQuota" hidden><label id="rutFirstQuotaLabel" for="rutFFirstTarget"></label><input class="ev-input" type="number" min="0" max="31" id="rutFFirstTarget" value="'+firstTarget+'"><p class="sy-note">Incluye las sesiones ya realizadas.</p></div>')
    +(r?'':'<p class="sy-note rut-flex-help">Elige las fechas en «Planificar sesiones».</p>')+'</div>';
}
function bindRutFlexOptions(r){
  if(rutSetupLocked(r))return;
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
  var locked=rutSetupLocked(r);
  if(locked?!r.flex:!document.querySelector('[data-rmode="flex"]').classList.contains('primary'))return null;
  var period=locked?r.flex.period:document.querySelector('[data-rperiod].primary').dataset.rperiod;
  var target=Number(document.getElementById('rutFTarget').value),weekly=Number(document.getElementById('rutFWeekly').value);
  var start=r?r.start:document.getElementById('rutFStart').value;
  if((!r||start)&&!validIsoDate(start))throw new Error('Elige una fecha de inicio válida.');
  if(!Number.isInteger(target)||target<1||target>(period==='week'?7:31))throw new Error('El cupo debe ser un número entero de 1 a '+(period==='week'?7:31)+' sesiones.');
  if(period==='month'&&(!Number.isInteger(weekly)||weekly<1||weekly>7))throw new Error('El objetivo semanal debe ser un número entero de 1 a 7 sesiones.');
  var overrides=Object.assign({},r&&r.flex?r.flex.monthTargets||{}:{});
  if(locked&&period==='month'&&start)overrides[start.slice(0,7)]=rutFlexTarget(r,start);
  if(!locked&&period==='month'&&start&&start.slice(8)!=='01'){
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
  if(copy.deletedSessions)delete copy.deletedSessions[ds];
  if(keepSkipped)copy.skips[ds]=1;
  if(rutSuspendedOn(copy,ds))throw new Error('La rutina está en pausa ese día.');
  if(rutFlexCount(copy,rutFlexRange(ds,copy.flex.period))>rutFlexTarget(copy,ds))throw new Error('Has completado el cupo de '+rutFlexTarget(copy,ds)+' sesiones '+(copy.flex.period==='month'?'de '+MN[+ds.slice(5,7)-1].toLowerCase()+' '+ds.slice(0,4):'de esa semana')+'. Cambia el cupo o quita otra sesión.');
  var full=rutLimitExceeded(copy,r.id);if(full)throw new Error('El '+_rutFmt(full)+' ya tiene el máximo de rutinas.');
  rutValidateExtraSessions(copy);r.flex=copy.flex;r.skips=copy.skips;r.deletedSessions=copy.deletedSessions;
}
/* Valida el lote completo sobre una copia: ningún alta parcial si falla un día. */
function rutFlexPlanSessions(r,dates,time,dur){
  if(!dates.length)throw new Error('Selecciona al menos un día.');
  var copy=JSON.parse(JSON.stringify(r));
  dates.slice().sort().forEach(function(ds){rutFlexSetSession(copy,null,ds,time,dur);});
  return copy;
}
function renderRutPlan(r){
  var month=RUT_PLAN.month,selected=RUT_PLAN.selected||[];
  var range=rutFlexRange(month+'-01','month'),first=new Date(range.start+'T12:00:00'),days=+range.end.slice(8),offset=(first.getDay()+6)%7;
  var h='<div class="ev-form-overlay" id="rutPlanOv"><div class="ev-form-sheet rut-plan"><div class="ev-form-handle"></div>'
    +'<div class="rut-plan-header"><button class="sy-back" id="rutPlanClose">←</button><div><strong>Planificar sesiones</strong><span>'+escHtml(r.name)+'</span></div><span></span></div>'
    +'<div class="rut-plan-body"><p class="sy-note">Marca varios días y guarda todas las clases de una vez.</p>'
    +'<div class="ev-date-row rut-session-fields"><div class="ev-field"><label for="rutPlanTime">Hora común</label><input class="ev-input" id="rutPlanTime" type="text" readonly data-time-picker data-time-quarter aria-haspopup="dialog" value="'+escHtml(RUT_PLAN.time||r.time||RUT_TIME_DEFAULT)+'"></div><div class="ev-field"><label for="rutPlanDur">Duración · min</label><input class="ev-input" id="rutPlanDur" type="number" min="15" max="480" value="'+(RUT_PLAN.dur==null?r.dur:RUT_PLAN.dur)+'"></div></div>'
    +'<div class="rut-plan-month"><button class="sy-back" data-rmonth="-1">◀</button><b>'+MN[first.getMonth()]+' '+first.getFullYear()+'</b><button class="sy-back" data-rmonth="1">▶</button></div>'
    +'<p class="rut-plan-quota">'+(r.flex.period==='month'?rutFlexCount(r,range)+' / '+rutFlexTarget(r,range.start)+' sesiones del mes · Objetivo: '+r.flex.weeklyTarget+' por semana':r.flex.target+' sesiones por semana')+'</p><div class="rut-plan-grid">';
  ['L','M','X','J','V','S','D'].forEach(function(day){h+='<span>'+day+'</span>';});
  for(var cell=0;cell<42;cell++){
    var i=cell-offset+1;
    if(i<1||i>days){h+='<span class="rut-plan-empty"></span>';continue;}
    var date=month+'-'+String(i).padStart(2,'0'),s=r.flex.sessions[date],chosen=selected.indexOf(date)>=0,skip=rutIsSkipped(r,date);
    h+='<button class="rut-plan-day'+(s?' planned':'')+(chosen?' selected':'')+(skip?' skipped':'')+'" data-rday="'+date+'"'+(date<rutFlexEarliest(r)?' disabled':'')+' aria-pressed="'+chosen+'" aria-label="'+_rutFmt(date)+(s?' · Editar clase':' · Seleccionar día')+'">'+i+(s?'<small>'+s.time+'</small>':chosen?'<small>✓</small>':'')+'</button>';
  }
  h+='</div>';
  var list=Object.keys(r.flex.sessions).filter(function(day){return day.slice(0,7)===month;}).sort();
  if(list.length)h+='<h4>Clases planificadas · pulsa para editar una</h4>';
  list.forEach(function(day){var s=r.flex.sessions[day];h+='<div class="rut-plan-row"><button class="ev-btn" data-redit="'+day+'">'+_rutFmtCorto(day)+' · '+s.time+'–'+rutFin(s.time,s.dur)+(rutIsSkipped(r,day)?' · Cancelada':'')+'<span>Editar →</span></button></div>';});
  return h+'</div><div class="rut-plan-footer"><span aria-live="polite">'+selected.length+' días seleccionados</span><button class="ev-btn primary" id="rutPlanSave"'+(!selected.length?' disabled':'')+'>Guardar '+(selected.length===1?'1 sesión':selected.length+' sesiones')+'</button></div></div></div>';
}
function openRutPlan(r){RUT_PLAN={id:r.id,month:evDk(new Date()).slice(0,7),selected:[],time:r.time||RUT_TIME_DEFAULT,dur:r.dur};refreshRutPlan();}
function closeRutPlan(){RUT_PLAN=null;cerrarPanel('rutPlanWrap','rutPlanOv');refreshEvents();}
function refreshRutPlan(){
  if(!RUT_PLAN)return;
  var r=rutById(RUT_PLAN.id);if(!r)return;
  var wrap=abrirPanel('rutPlanWrap',renderRutPlan(r),{overlay:'rutPlanOv',alCerrar:closeRutPlan});
  function read(){RUT_PLAN.time=wrap.querySelector('#rutPlanTime').value;RUT_PLAN.dur=Number(wrap.querySelector('#rutPlanDur').value);}
  function edit(ds){read();openRutHistoryEdit(r,ds,refreshRutPlan);}
  wrap.querySelector('#rutPlanClose').onclick=closeRutPlan;
  wrap.querySelectorAll('[data-rmonth]').forEach(function(b){b.onclick=function(){read();var d=new Date(RUT_PLAN.month+'-01T12:00:00');d.setMonth(d.getMonth()+Number(b.dataset.rmonth));RUT_PLAN.month=evDk(d).slice(0,7);refreshRutPlan();};});
  wrap.querySelectorAll('[data-rday]').forEach(function(b){b.onclick=function(){var ds=b.dataset.rday;if(r.flex.sessions[ds]){edit(ds);return;}read();var i=RUT_PLAN.selected.indexOf(ds);if(i<0)RUT_PLAN.selected.push(ds);else RUT_PLAN.selected.splice(i,1);refreshRutPlan();};});
  wrap.querySelectorAll('[data-redit]').forEach(function(b){b.onclick=function(){edit(b.dataset.redit);};});
  wrap.querySelector('#rutPlanSave').onclick=function(){try{
    read();var result=rutFlexPlanSessions(r,RUT_PLAN.selected,RUT_PLAN.time,RUT_PLAN.dur);
    RUT_PLAN.selected=[];rutSaveSessionChange(r,result,'Sesiones planificadas',refreshRutPlan);
  }catch(e){showToast(e.message,'error');}};
}
