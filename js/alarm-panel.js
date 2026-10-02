/* La campana abre el mismo formulario sobre cualquier ventana, sin navegar.
   init.js prepara las ruedas y mantiene el envío existente a MacroDroid. */
var ALARM_PANEL_ANCHOR=null;
var ALARM_PANEL_BACK=null;
var ALARM_PANEL_PREPARE=null;

function closeAlarmPanel(restoreFocus){
  var panel=document.getElementById('alarmPanel');if(panel)panel.classList.remove('open');
  var confirm=document.getElementById('alarmPastConfirm');if(confirm)confirm.remove();
  if(ALARM_PANEL_ANCHOR){
    ALARM_PANEL_ANCHOR.setAttribute('aria-expanded','false');
    if(restoreFocus===true&&ALARM_PANEL_ANCHOR.isConnected)ALARM_PANEL_ANCHOR.focus();
  }
  if(NAV_BACK===closeAlarmPanel)NAV_BACK=ALARM_PANEL_BACK;
  ALARM_PANEL_ANCHOR=null;ALARM_PANEL_BACK=null;
}
function positionAlarmPanel(){
  _positionHeaderMenu(document.getElementById('alarmPanel'),ALARM_PANEL_ANCHOR);
}
function toggleAlarmPanel(anchor){
  var panel=document.getElementById('alarmPanel');if(!panel)return;
  if(panel.classList.contains('open')){closeAlarmPanel();return;}
  closeSettingsMenu();
  ALARM_PANEL_ANCHOR=anchor||document.getElementById('alarmTestBtn');
  ALARM_PANEL_BACK=NAV_BACK;NAV_BACK=closeAlarmPanel;
  panel.classList.add('open');panel.scrollTop=0;
  ALARM_PANEL_ANCHOR.setAttribute('aria-expanded','true');
  if(ALARM_PANEL_PREPARE)ALARM_PANEL_PREPARE();
  positionAlarmPanel();
}
function initAlarmPanel(prepare){
  ALARM_PANEL_PREPARE=prepare;
  var panel=document.getElementById('alarmPanel');if(!panel)return;
  document.body.appendChild(panel);
  document.getElementById('alarmTestBtn').addEventListener('click',function(e){e.stopPropagation();toggleAlarmPanel(e.currentTarget);});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&panel.classList.contains('open')){e.preventDefault();e.stopPropagation();closeAlarmPanel(true);}
  },true);
  window.addEventListener('resize',positionAlarmPanel);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',positionAlarmPanel);
}
