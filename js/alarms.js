/* ============================================================
   ALARMS — Registro de las alarmas creadas desde el PWA.
   Solo el registro: la ventana de gestion se quito en v268 porque su
   boton llevaba desactivado desde hacia versiones y no habia forma de
   abrirla. Lo que queda lo usan cumpleanos, eventos y el panel de alarma.
   ============================================================ */

var ALARMS_SK='excelia-alarms-v1';
var ALARMS=(function(){
  try{
    var r=localStorage.getItem(ALARMS_SK);
    if(r){var a=JSON.parse(r);if(Array.isArray(a))return a;}
  }catch(e){}
  return [];
})();

function saveAlarms(){
  try{localStorage.setItem(ALARMS_SK,JSON.stringify(ALARMS));}catch(e){}
}

// Añadir una alarma al registro
// alarm: { type:'birthday'|'event'|'other', label, hour, minute, days:[]|null, targetDate:'YYYY-MM-DD'|null }
function addAlarm(alarm){
  alarm.id='alrm-'+Date.now()+'-'+Math.floor(Math.random()*1000);
  alarm.createdAt=new Date().toISOString();
  ALARMS.push(alarm);
  saveAlarms();
}

function removeAlarm(id){
  ALARMS=ALARMS.filter(function(a){return a.id!==id;});
  saveAlarms();
}

function isAlarmPast(alarm){
  if(!alarm.targetDate)return false; // recurrente → nunca pasada
  var today=new Date();today.setHours(0,0,0,0);
  var d=new Date(alarm.targetDate+'T00:00:00');
  return d<today;
}

// Devuelve {h, m} sin comprobar historial
function nextAlarmTime(targetDate,defaultH,defaultM){
  return{h:defaultH,m:defaultM};
}

// ── Abrir/cerrar overlay ────────────────────────────────────
