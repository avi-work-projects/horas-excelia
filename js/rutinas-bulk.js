/* Operaciones del histórico calculadas sobre una copia, con un solo guardado
   y un único Deshacer. Nunca se aplican parcialmente. */
function rutBulkChange(r,keys,action){
  if(!keys.length)throw new Error('Selecciona al menos una sesión.');
  var copy=JSON.parse(JSON.stringify(r));
  keys.forEach(function(key){
    var s=rutSessionByKey(copy,key);if(!s)throw new Error('Una sesión seleccionada ya no existe.');
    copy=action==='delete'?rutDeleteSession(copy,key):rutEditSession(copy,s.ds,s.time,s.dur,true,key);
  });return copy;
}
function rutOffsetDate(ds,days){var d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+days);return evDk(d);}
function rutPauseAfter(r,key,returnDate){
  var s=rutSessionByKey(r,key);if(!s)throw new Error('La sesión ya no existe.');
  if(!validIsoDate(returnDate)||returnDate<=rutOffsetDate(s.ds,1))throw new Error('La vuelta debe ser posterior al primer día de pausa.');
  var from=rutOffsetDate(s.ds,1),to=rutOffsetDate(returnDate,-1);
  var copy=JSON.parse(JSON.stringify(r)),pauses=(copy.pauses||[]).concat([{from:from,to:to}]).sort(function(a,b){return a.from.localeCompare(b.from);}),merged=[];
  pauses.forEach(function(p){var last=merged[merged.length-1];if(last&&p.from<=rutOffsetDate(last.to,1)){if(p.to>last.to)last.to=p.to;}else merged.push(p);});copy.pauses=merged;return copy;
}
function rutHistorySelectionHtml(state){
  if(!state.bulk)return '';
  var n=(state.selected||[]).length;
  return '<div class="rut-bulk-actions"><span>'+n+' seleccionada'+(n===1?'':'s')+'</span><button class="ev-io-btn" data-rut-bulk-action="cancel"'+(!n?' disabled':'')+'>Cancelar clases</button><button class="ev-io-btn io-peligro" data-rut-bulk-action="delete"'+(!n?' disabled':'')+'>Eliminar</button><button class="ev-io-btn" data-rut-bulk-action="pause"'+(n!==1?' disabled':'')+'>Última antes del parón</button></div>';
}
function bindRutHistorySelection(wrap,r){
  var state=RUT_HISTORY;state.selected=state.selected||[];
  wrap.querySelector('#rutHistoryBulk').onclick=function(){state.bulk=!state.bulk;state.selected=[];openRutHistory(r,true);};
  wrap.querySelectorAll('[data-history-select]').forEach(function(el){el.onchange=function(){
    var key=el.dataset.historySelect;state.selected=state.selected.filter(function(x){return x!==key;});if(el.checked)state.selected.push(key);openRutHistory(r,true);
  };});
  wrap.querySelectorAll('[data-history-select-month]').forEach(function(el){el.onchange=function(){
    var keys=Array.from(el.closest('section').querySelectorAll('[data-history-select]')).map(function(x){return x.dataset.historySelect;});
    state.selected=state.selected.filter(function(k){return keys.indexOf(k)<0;});if(el.checked)state.selected=state.selected.concat(keys);openRutHistory(r,true);
  };});
  wrap.querySelectorAll('[data-rut-bulk-action]').forEach(function(b){b.onclick=function(){openRutBulkConfirm(r,state.selected.slice(),b.dataset.rutBulkAction);};});
}
function openRutBulkConfirm(r,keys,action){
  if(!keys.length)return;
  var pause=action==='pause',deleting=action==='delete',session=pause&&rutSessionByKey(r,keys[0]);
  var h='<div class="ev-form-overlay" id="rutBulkOv"><div class="ev-form-sheet" role="dialog" aria-modal="true"><div class="ev-form-handle"></div><h3>'+(pause?'Pausa temporal':deleting?'Eliminar clases':'Cancelar clases')+'</h3>';
  if(pause){
    h+='<p class="sy-note">Última clase: '+_rutFmt(session.ds)+' · '+session.time+'. La pausa empieza al día siguiente. Las sesiones anteriores se conservan.</p><label class="energy-field">Fecha de vuelta<input id="rutPauseReturn" type="date" min="'+rutOffsetDate(session.ds,2)+'"></label><p id="rutPausePreview" class="sy-note"></p>';

  }else{
    h+='<p class="sy-note">Vas a '+(deleting?'eliminar':'cancelar')+' '+keys.length+' clases de '+escHtml(r.name)+'.'+(deleting?' Desaparecerán del histórico y del calendario.':' Seguirán en el histórico y podrás recuperarlas.')+'</p>';
    if(deleting&&(r.extraSessions||[]).some(function(s){return keys.indexOf(s.recoveryOf)>=0&&keys.indexOf(s.id)<0;}))h+='<p class="sy-note warn">Las recuperaciones vinculadas que no hayas seleccionado se conservarán como clases extra.</p>';
  }
  h+='<div class="ev-form-actions"><button class="ev-btn" id="rutBulkBack">Volver</button><button class="ev-btn '+(deleting?'danger':'primary')+'" id="rutBulkConfirm">'+(pause?'Guardar pausa':'Confirmar')+'</button></div></div></div>';
  var close=function(){cerrarPanel('rutBulkWrap','rutBulkOv');},wrap=abrirPanel('rutBulkWrap',h,{overlay:'rutBulkOv',alCerrar:close});
  wrap.querySelector('#rutBulkBack').onclick=close;
  if(pause)wrap.querySelector('#rutPauseReturn').onchange=function(e){
    var last=e.target.value,count=validIsoDate(last)?rutHistorySessions(r,rutOffsetDate(session.ds,1),rutOffsetDate(last,-1)).filter(function(x){return !x.skip;}):[];
    var extras=count.filter(function(x){return x.extra;}).length;
    wrap.querySelector('#rutPausePreview').textContent=count.length+' sesiones quedarán fuera del calendario durante la pausa'+(extras?', incluidas '+extras+' extras/recuperaciones':'')+'. El horario se reanuda desde la fecha de vuelta.';
  };
  wrap.querySelector('#rutBulkConfirm').onclick=function(){try{
    var result=pause?rutPauseAfter(r,keys[0],wrap.querySelector('#rutPauseReturn').value):rutBulkChange(r,keys,action);
    RUT_HISTORY.bulk=false;RUT_HISTORY.selected=[];close();rutSaveSessionChange(r,result,pause?'Pausa guardada':deleting?'Clases eliminadas':'Clases canceladas');
  }catch(e){showToast(e.message,'error');}};
}
