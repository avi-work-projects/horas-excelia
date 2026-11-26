/* Semanas en duda (v576): una marca local sobre las semanas que aún no están
   enviadas, con los días dudosos y un comentario. La semana se pinta en ámbar
   y parpadea, y programar o enviar su correo pide confirmación. No toca Outlook
   ni las horas: es solo un recordatorio que viaja en el backup. */
var WEEK_DOUBT_KEY='excelia-week-doubts-v1';
var WEEK_DOUBT_DAYS=['L','M','X','J','V'];
function weekDoubts(){
  try{var o=JSON.parse(appStorage.getItem(WEEK_DOUBT_KEY)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch(e){return {};}
}
/* Una semana puede estar en duda mientras no esté enviada (programada sí). */
function weekDoubtAllowed(key){return typeof homeWeekEditState!=='function'||homeWeekEditState(key)!=='sent';}
function weekDoubt(key){var d=weekDoubts()[key];return d&&weekDoubtAllowed(key)?d:null;}
function weekDoubtClean(d){
  if(!d||typeof d!=='object')return null;
  var days=(Array.isArray(d.days)?d.days:[]).filter(function(n){return Number.isInteger(n)&&n>=0&&n<=4;});
  return {days:days.filter(function(n,i){return days.indexOf(n)===i;}).sort(),note:String(d.note||'').slice(0,200)};
}
function saveWeekDoubt(key,value){
  var all=weekDoubts();
  if(value)all[key]=weekDoubtClean(value);else delete all[key];
  appStorage.setItem(WEEK_DOUBT_KEY,JSON.stringify(all));
}
function weekDoubtSummary(d){
  var parts=[];
  if(d.days&&d.days.length)parts.push(d.days.map(function(n){return WEEK_DOUBT_DAYS[n];}).join(', '));
  if(d.note)parts.push(d.note);
  return parts.join(' · ');
}
/* Pide confirmación si alguna de las semanas está en duda. true = seguir. */
function weekDoubtConfirm(keys){
  var list=(keys||[]).filter(function(k,i,a){return a.indexOf(k)===i&&weekDoubt(k);});
  if(!list.length)return true;
  var lines=list.map(function(k){var s=weekDoubtSummary(weekDoubt(k));return '• Semana del '+fd(new Date(k+'T12:00:00'))+(s?': '+s:'');});
  return window.confirm('Ojo, '+(list.length===1?'esta semana está en duda':'hay semanas en duda')+'.\n'+lines.join('\n')+'\n\n¿Quieres continuar de todos modos?');
}
function weekDoubtBadgeHtml(key){
  var d=weekDoubt(key);
  return '<button type="button" class="week-doubt-btn'+(d?' on':'')+'" data-week-doubt="'+key+'" aria-label="'+(d?'Semana en duda: editar':'Marcar la semana en duda')+'">?</button>';
}
function closeWeekDoubt(){cerrarPanel('weekDoubtWrap','weekDoubtOv');}
function openWeekDoubt(key){
  var d=weekDoubt(key)||{days:[],note:''},mon=new Date(key+'T12:00:00');
  /* Mismo armazón que los paneles de Inicio (Factura, Ajustes): fijo y centrado. */
  var h='<div class="bd-form-overlay" id="weekDoubtOv"><section class="bd-form-sheet week-doubt-sheet" role="dialog" aria-modal="true" aria-labelledby="weekDoubtTitle">';
  h+='<header class="bd-panel-header panel-header-centered"><button class="sy-back" id="weekDoubtClose" aria-label="Volver">&#8592;</button><h2 id="weekDoubtTitle">Semana '+wn(mon)+' en duda</h2></header><div class="bd-panel-body">';
  h+='<div class="ev-field"><label>Días en duda</label><div class="week-doubt-days" role="group" aria-label="Días en duda">';
  WEEK_DOUBT_DAYS.forEach(function(n,i){var on=d.days.indexOf(i)!==-1;h+='<button type="button" class="week-doubt-day'+(on?' on':'')+'" data-doubt-day="'+i+'" aria-pressed="'+on+'">'+n+'<small>'+fd(ad(mon,i))+'</small></button>';});
  h+='</div></div>';
  h+='<div class="ev-field"><label for="weekDoubtNote">Comentario</label><textarea class="ev-textarea" id="weekDoubtNote" maxlength="200" placeholder="Qué hay que confirmar">'+escHtml(d.note||'')+'</textarea></div>';
  h+='</div><footer class="bd-panel-footer ev-detail-actions">'+(weekDoubt(key)?'<button class="ev-btn" id="weekDoubtClear">Quitar duda</button>':'')+'<button class="ev-btn primary" id="weekDoubtSave">Marcar en duda</button></footer>';
  h+='</section></div>';
  var wrap=abrirPanel('weekDoubtWrap',h,{contenedor:document.body,overlay:'weekDoubtOv',alCerrar:closeWeekDoubt});
  wrap.querySelector('#weekDoubtClose').onclick=closeWeekDoubt;
  wrap.querySelectorAll('[data-doubt-day]').forEach(function(b){b.onclick=function(){var on=!b.classList.contains('on');b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));};});
  var clear=wrap.querySelector('#weekDoubtClear');
  if(clear)clear.onclick=function(){saveWeekDoubt(key,null);closeWeekDoubt();render();showToast('Semana sin duda','success');};
  wrap.querySelector('#weekDoubtSave').onclick=function(){
    var days=[].map.call(wrap.querySelectorAll('[data-doubt-day].on'),function(b){return +b.dataset.doubtDay;});
    saveWeekDoubt(key,{days:days,note:wrap.querySelector('#weekDoubtNote').value.trim()});
    closeWeekDoubt();render();showToast('Semana marcada en duda','success');
  };
}
function initWeekDoubts(){
  var container=document.getElementById('weeksContainer');if(!container)return;
  container.addEventListener('click',function(e){
    var b=e.target.closest('[data-week-doubt]');if(!b)return;
    e.stopPropagation();openWeekDoubt(b.dataset.weekDoubt);
  });
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initWeekDoubts);
