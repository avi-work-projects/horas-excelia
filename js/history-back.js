/* Botón Atrás del móvil (v576). La app no apuntaba sus pantallas en el
   historial, así que Atrás salía de Gestify. Se guarda una entrada «guardia»:
   al pulsar Atrás llega un popstate, se cierra lo que esté más arriba con el
   mismo gesto que haría la persona (tocar el fondo de un panel o la flecha ←
   de la ventana) y se vuelve a poner la guardia. En Inicio sin nada abierto,
   Atrás sale de la app como siempre. No hay lógica de cierre nueva: todo
   reutiliza los cierres que ya existen. */
var BACK_GUARD_STATE={gestify:'guard'};
/* Fondos de modal que se cierran al tocarlos (abrirPanel y paneles antiguos). */
var BACK_BACKDROPS='.app-panel>.open,.bd-form-overlay.open,.bd-detail-overlay.open,.ev-detail-overlay.open,.ev-form-overlay.open,.ev-alarm-overlay.open,.bd-alarm-overlay.open,.dp-overlay.open,.imp-mode-ov,#overlay.active,#homePopup';
function backVisible(el){if(!el)return false;var s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden')return false;var r=el.getBoundingClientRect();return r.width>0&&r.height>0;}
function backTopDialog(){var list=[].filter.call(document.querySelectorAll('dialog[open]'),backVisible);return list[list.length-1]||null;}
/* El modal de encima es el que tapa el borde superior de la pantalla. */
function backTopBackdrop(){
  var x=Math.round(innerWidth/2);
  for(var y=4;y<=24;y+=10){
    var el=document.elementFromPoint(x,y),bd=el&&el.closest(BACK_BACKDROPS);
    if(bd&&backVisible(bd))return bd;
  }
  return null;
}
function backTopFullOverlay(){
  var list=[].filter.call(document.querySelectorAll('.full-overlay.open'),backVisible);
  list.sort(function(a,b){return (parseInt(getComputedStyle(a).zIndex,10)||0)-(parseInt(getComputedStyle(b).zIndex,10)||0);});
  return list[list.length-1]||null;
}
/* Cierra una capa. true si había algo que cerrar. */
function backCloseTop(){
  var dialog=backTopDialog();
  if(dialog){var ev=new Event('cancel',{cancelable:true});dialog.dispatchEvent(ev);if(!ev.defaultPrevented&&dialog.open)dialog.close();return true;}
  var bd=backTopBackdrop();
  if(bd){
    /* Si el panel tiene su flecha ← (o ×), Atrás hace lo mismo que ella: en
       algunos paneles vuelve al paso anterior en vez de cerrarlo todo. */
    var own=[].find.call(bd.querySelectorAll('.sy-back'),backVisible);
    if(own)own.click();else bd.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    return true;
  }
  var menu=document.querySelector('#dataMenu.open');
  if(menu&&typeof closeSettingsMenu==='function'){closeSettingsMenu();return true;}
  var alarm=document.querySelector('#alarmPanel.open');
  if(alarm&&typeof closeAlarmPanel==='function'){closeAlarmPanel();return true;}
  var ov=backTopFullOverlay();
  if(ov){
    var back=[].find.call(ov.querySelectorAll('.sy-back'),function(b){return !b.closest('.app-panel')&&backVisible(b);});
    if(back){back.click();return true;}
  }
  return false;
}
function backOnPop(){
  if(backCloseTop()){history.pushState(BACK_GUARD_STATE,'');return;}
  /* Nada abierto: Atrás sale de la app (o vuelve a la página anterior). */
  window.removeEventListener('popstate',backOnPop);
  history.back();
}
function initHistoryBack(){
  if(!window.history||!history.pushState)return;
  if(!history.state||history.state.gestify!=='guard')history.pushState(BACK_GUARD_STATE,'');
  window.addEventListener('popstate',backOnPop);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initHistoryBack);
