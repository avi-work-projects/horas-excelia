/* ============================================================
   ALARMS — Gestión de alarmas creadas desde el PWA
   ============================================================ */

var ALARMS_KEY='excelia-alarms-v1';
var ALARMS=(function(){try{return JSON.parse(localStorage.getItem(ALARMS_KEY)||'[]');}catch(e){return[];}})();

function saveAlarms(){localStorage.setItem(ALARMS_KEY,JSON.stringify(ALARMS));}

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

// ── Abrir/cerrar overlay ────────────────────────────────────
function openAlarms(){
  var ov=document.getElementById('alarmsOverlay');
  if(!ov)return;
  renderAlarms();
  ov.style.display='block';
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    ov.classList.add('open');
  });});
  NAV_BACK=closeAlarms;
  // Listener para el botón ← (se registra una sola vez)
  var backBtn=document.getElementById('alarmsBack');
  if(backBtn&&!backBtn._alarmListener){
    backBtn._alarmListener=true;
    backBtn.addEventListener('click',closeAlarms);
  }
}

function closeAlarms(){
  var ov=document.getElementById('alarmsOverlay');
  if(!ov)return;
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
  NAV_BACK=null;
}

// ── Renderizado ─────────────────────────────────────────────
var ALARM_TYPE_LABELS={
  birthday:'&#127874; Alarmas cumpleaños',
  event:'&#128197; Alarmas eventos',
  other:'&#9200; Otras alarmas'
};
var DN_SHORT=['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

function renderAlarmItem(alarm,canDelete){
  var timeStr=String(alarm.hour).padStart(2,'0')+':'+String(alarm.minute).padStart(2,'0');
  var daysStr='';
  if(alarm.days&&alarm.days.length){
    daysStr=alarm.days.map(function(d){return DN_SHORT[d-1]||'?';}).join(' · ');
  } else if(alarm.targetDate){
    var p=alarm.targetDate.split('-');
    daysStr=p[2]+'/'+p[1]+'/'+p[0];
  }
  var h='<div class="alarm-item'+(canDelete?'':' alarm-item-past')+'" data-id="'+alarm.id+'">';
  h+='<div class="alarm-item-time">'+timeStr+'</div>';
  h+='<div class="alarm-item-info">';
  h+='<div class="alarm-item-label">'+escHtml(alarm.label)+'</div>';
  if(daysStr)h+='<div class="alarm-item-days">'+daysStr+'</div>';
  h+='</div>';
  if(canDelete){
    h+='<button class="alarm-delete-btn" data-id="'+alarm.id+'" data-label="'+escHtml(alarm.label)+'" title="Eliminar">&#x2715;</button>';
  }
  h+='</div>';
  return h;
}

function renderAlarms(){
  var container=document.getElementById('alarmsContent');
  if(!container)return;
  var types=['birthday','event','other'];
  var html='';
  var totalAll=0;

  types.forEach(function(type){
    var typeAlarms=ALARMS.filter(function(a){return a.type===type;});
    totalAll+=typeAlarms.length;
    var future=typeAlarms.filter(function(a){return!isAlarmPast(a);});
    var past=typeAlarms.filter(function(a){return isAlarmPast(a);});

    html+='<div class="alarms-section">';
    html+='<div class="alarms-section-title">'+ALARM_TYPE_LABELS[type]+'</div>';

    if(!typeAlarms.length){
      html+='<div class="alarms-empty">Sin alarmas registradas</div>';
    } else {
      if(future.length){
        html+='<div class="alarms-sub-title alarms-sub-future">&#9654; Futuras ('+future.length+')</div>';
        future.forEach(function(a){html+=renderAlarmItem(a,true);});
      }
      if(past.length){
        html+='<div class="alarms-sub-title alarms-sub-past">&#9654; Pasadas ('+past.length+')</div>';
        past.forEach(function(a){html+=renderAlarmItem(a,false);});
      }
    }
    html+='</div>';
  });

  if(!totalAll){
    html='<div class="alarms-empty-all">&#128276; No hay alarmas registradas aún.<br><span style="font-size:.78rem;opacity:.6">Las alarmas creadas desde el PWA aparecerán aquí.</span></div>';
  }

  container.innerHTML=html;

  // Listeners de borrado
  container.querySelectorAll('.alarm-delete-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var id=btn.dataset.id;
      var label=btn.dataset.label;
      // Llamar MacroDroid DISMISS si hay URL configurada
      var macroBase=normalizeMacroBase(localStorage.getItem('excelia-alarm-url')||'');
      if(macroBase&&label){
        fetch(macroBase+'/apagar_alarmas?names='+encodeURIComponent(label),{mode:'no-cors'}).catch(function(){});
      }
      removeAlarm(id);
      renderAlarms();
      showToast('Alarma eliminada','success');
    });
  });
}
