/* Alta guiada de extras/recuperaciones. Solo escribe al guardar la sesión
   o confirmar Cancelar ahora; salir de cualquier paso no modifica la rutina. */
function closeRutAddition(){cerrarPanel('rutAdditionWrap','rutAdditionOv');}
function rutAdditionPanel(title,body,back){
  var h='<div class="ev-form-overlay" id="rutAdditionOv"><div class="ev-form-sheet rut-addition-sheet"><div class="ev-form-handle"></div>';
  h+='<div class="rut-history-head"><button class="sy-back" id="rutAdditionBack" aria-label="Volver">&#8592;</button><strong>'+escHtml(title)+'</strong></div>'+body+'</div></div>';
  var wrap=abrirPanel('rutAdditionWrap',h,{overlay:'rutAdditionOv',alCerrar:closeRutAddition});
  wrap.querySelector('#rutAdditionBack').onclick=back||closeRutAddition;return wrap;
}
function openRutAddition(r){
  var h='<p class="sy-note">'+escHtml(r.name)+' · El horario habitual se mantiene.</p><div class="rut-addition-choices">';
  [['extra','Añadir una clase extra','Una sesión adicional, sin cancelar otra.'],['recover','Recuperar una clase cancelada','Elige la sesión que te dejaron recuperar.'],['cancel','Cancelar una clase','Puedes fijar la recuperación ahora o dejar la fecha para más adelante.']].forEach(function(o){h+='<button class="ev-btn" data-addition-mode="'+o[0]+'"><strong>'+o[1]+'</strong><span>'+o[2]+'</span></button>';});
  var wrap=rutAdditionPanel('Añadir clase extra/recuperada',h+'</div>');
  wrap.querySelectorAll('[data-addition-mode]').forEach(function(b){b.onclick=function(){
    var mode=b.dataset.additionMode;
    if(mode==='extra'){rutAdditionForm(r,null);return;}
    closeRutAddition();rutAdditionPickWeek(r,mode);
  };});
}
function rutAdditionPickWeek(r,mode){
  if(!RUT_WEEK_CAL){var d=new Date();RUT_WEEK_CAL={y:d.getFullYear(),m:d.getMonth()};}
  _rutWeekPick(r,{hint:mode==='recover'?'Elige la semana de la clase cancelada que quieres recuperar.':'Elige la semana de la clase que quieres cancelar y recuperar.',
    onClose:function(){openRutAddition(r);},onWeek:function(wk){closeRutWeek();rutAdditionPickSession(r,mode,wk);}});
}
function rutAdditionPickSession(r,mode,wk){
  var end=new Date(wk+'T12:00:00');end.setDate(end.getDate()+6);
  var list=rutSessions(r,wk,evDk(end)).filter(function(s){return (mode==='recover'?s.skip:!s.skip)&&!rutRecoveryFor(r,s.key);});
  var h='<p class="sy-note">Semana del '+_rutFmt(wk)+' · '+(mode==='recover'?'Sesiones canceladas sin recuperación':'Elige la sesión original')+'</p><div class="rut-addition-choices">';
  list.forEach(function(s){h+='<button class="ev-btn" data-source-session="'+s.key+'"><strong>'+_rutFmtCorto(s.ds)+' · '+s.time+'–'+rutFin(s.time,s.dur)+'</strong><span>'+escHtml(r.name+' '+rutSessionTag(r,s))+'</span></button>';});
  if(!list.length)h+='<p class="sy-note">No hay sesiones disponibles para esta acción en esa semana. Vuelve para elegir otra.</p>';
  var wrap=rutAdditionPanel('Elige la clase',h+'</div>',function(){closeRutAddition();rutAdditionPickWeek(r,mode);});
  wrap.querySelectorAll('[data-source-session]').forEach(function(b){b.onclick=function(){rutAdditionForm(r,b.dataset.sourceSession);};});
}
function rutAdditionForm(r,key){
  var source=key&&rutSessionByKey(r,key),today=evDk(new Date()),ds=source&&source.ds>today?source.ds:today;
  var h=source?'<p class="sy-note">La clase del <b>'+_rutFmt(source.ds)+' a las '+source.time+'</b> quedará cancelada en el histórico. Elige cuándo la recuperas.</p>':'<p class="sy-note">Añade una fecha y hora. Puede coincidir con otra clase de la rutina.</p>';
  h+='<div class="rut-addition-fields"><div class="ev-field"><label for="rutExtraDate">Día de la nueva clase</label><input class="ev-input" type="date" id="rutExtraDate" value="'+ds+'"></div>';
  h+='<div class="ev-date-row"><div><label for="rutExtraTime">Hora</label><input class="ev-input" type="time" id="rutExtraTime" value="'+(source?source.time:r.time||RUT_TIME_DEFAULT)+'"></div><div><label for="rutExtraDur">Duración (min)</label><input class="ev-input" type="number" min="15" max="480" id="rutExtraDur" value="'+(source?source.dur:r.dur||60)+'"></div></div></div>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="rutExtraSave">'+(source?'Guardar recuperación':'Añadir clase extra')+'</button></div>';
  if(source&&!source.skip)h+='<button class="ev-io-btn rut-addition-entry" id="rutCancelForLater">Cancelar ahora y recuperar más adelante</button>';
  var wrap=rutAdditionPanel(source?'Programar recuperación':'Clase extra',h,function(){openRutAddition(r);});
  var later=wrap.querySelector('#rutCancelForLater');if(later)later.onclick=function(){try{var result=rutEditSession(r,source.ds,source.time,source.dur,true,key);closeRutAddition();rutSaveSessionChange(r,result,'Clase cancelada. Puedes elegir la recuperación más adelante.');}catch(e){showToast(e.message,'error');}};
  wrap.querySelector('#rutExtraSave').onclick=function(){try{
    var result=rutAddSession(r,{date:wrap.querySelector('#rutExtraDate').value,time:wrap.querySelector('#rutExtraTime').value,dur:+wrap.querySelector('#rutExtraDur').value},key);
    closeRutAddition();rutSaveSessionChange(r,result,source?'Recuperación programada':'Clase extra añadida');
  }catch(e){showToast(e.message,'error');}};
}
