/* ============================================================
   BIRTHDAYS — Calendario de cumpleaños
   ============================================================ */

var BDAY_STORAGE_KEY='excelia-bdays-v1';
var BDAY_YEAR=new Date().getFullYear(), BDAY_MONTH=new Date().getMonth(), BDAY_VIEW='upcoming';
var BDAY_EDIT=null;
var BDAY_SEARCH='';
var BDAY_UP_VIP=false;
var BDAY_FILTER_VIP='all'; // 'all' | 'vip' | 'novip'
var BDAY_EDIT_VIP=false;
var BDAY_VIP_PENDING=null; // null=no edit mode, {}=pending changes (idx→bool)
var _bdLpTimer=null;
var _bdLpFired=false;
var _bdCtrlDocListenerAdded=false;
var _bdPendingRefresh=false;

function _showBdayInlineCtrl(el,b){
  var prev=document.querySelector('.bday-inline-ctrl');
  if(prev)prev.remove();
  if(!b)return;
  var idx=-1;
  for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===b.name&&BDAYS[i].day===b.day&&BDAYS[i].month===b.month){idx=i;break;}}
  var isVip=(idx>=0&&BDAYS[idx].vip===true);
  var div=document.createElement('div');
  div.className='bday-inline-ctrl';
  div.innerHTML='<button class="bday-ic-btn bday-ic-vip'+(isVip?' active':'')+'"><img src="./VIP.png" style="width:26px;height:auto;vertical-align:middle" alt="VIP"></button>'
    +'<button class="bday-ic-btn bday-ic-edit">&#9999;&#65039; Editar</button>'
    +'<button class="bday-ic-btn bday-ic-close">&#10006;</button>';
  el.after(div);
  div.querySelector('.bday-ic-vip').addEventListener('click',function(e){
    e.stopPropagation();
    if(idx>=0){
      /* El calendario de 1 mes solo tiene sitio para EV_CAL_VIP_MAX estrellas
         el mismo dia; mas alla de ahi no se verian. */
      if(!BDAYS[idx].vip){
        var _tope=(typeof EV_CAL_VIP_MAX!=='undefined')?EV_CAL_VIP_MAX:3;
        var _yaVip=0;
        BDAYS.forEach(function(x,j){
          if(j!==idx&&x.vip&&x.day===BDAYS[idx].day&&x.month===BDAYS[idx].month)_yaVip++;
        });
        if(_yaVip>=_tope){
          showToast('Maximo '+_tope+' cumpleanos VIP el mismo dia','error');
          return;
        }
      }
      if(BDAYS[idx].vip)delete BDAYS[idx].vip;else BDAYS[idx].vip=true;
      appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
      syncVipBdaysToEvents();updateBdayBtn();
      _bdPendingRefresh=false;
      refreshBday(); /* refresco inmediato: la lista se reordena y la estrella aparece al instante */
    }
  });
  div.querySelector('.bday-ic-edit').addEventListener('click',function(e){
    e.stopPropagation();div.remove();
    _bdPendingRefresh=false; /* el formulario gestiona su propio refresco */
    if(idx>=0)openBdayForm(BDAYS[idx]);else openBdayForm(b);
  });
  div.querySelector('.bday-ic-close').addEventListener('click',function(e){
    e.stopPropagation();div.remove();
    if(_bdPendingRefresh){_bdPendingRefresh=false;refreshBday();}
  });
}

// Estado de alarmas configuradas para cumpleaños
var BDAY_ALARM_SET_KEY='excelia-bday-alarm-set';
var BDAY_ALARM_SET=(function(){try{return JSON.parse(appStorage.getItem(BDAY_ALARM_SET_KEY)||'{}');}catch(e){return {};}})();
var BDAY_ALARM_COUNT_KEY='excelia-bday-alarm-count';
var BDAY_ALARM_COUNT=(function(){var v=appStorage.getItem(BDAY_ALARM_COUNT_KEY);return(v==='1'?1:2);})();

// Paleta de 10 colores rotativos
// #fbbf24 (amarillo) reservado para VIP — no entra en el random
var BDAY_PALETTE=['#6c8cff','#34d399','#fb923c','#ff6b6b','#c084fc','#38bdf8','#f472b6','#a3e635','#fb7185'];

// BDAYS puede venir de: 1) localStorage (importado), 2) secreto GitHub
// BDAYS_FROM_SECRET se define en index.html (inline config)
var BDAYS=(function(){
  try{
    var stored=appStorage.getItem(BDAY_STORAGE_KEY);
    if(stored){var arr=JSON.parse(stored);if(Array.isArray(arr)&&arr.length)return arr;}
  }catch(e){}
  return (typeof BDAYS_FROM_SECRET!=='undefined')?BDAYS_FROM_SECRET:[];
})();

// Title case para mostrar nombres
function tc(s){return s.replace(/\S+/g,function(w){return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase();});}
function bdName(n){return escHtml(tc(n));}

function getBdayColor(b){
  var idx=BDAYS.indexOf(b);
  if(idx===-1){
    var h=0;for(var i=0;i<b.name.length;i++)h=(h*31+b.name.charCodeAt(i))&0x7fffffff;
    idx=h;
  }
  return BDAY_PALETTE[idx%BDAY_PALETTE.length];
}

function getBdaysOn(m1,d){return BDAYS.filter(function(b){return b.month===m1&&b.day===d;});}

function daysUntil(m1,d){
  var today=new Date();today.setHours(0,0,0,0);
  var bd=new Date(today.getFullYear(),m1-1,d);
  if(bd<today)bd.setFullYear(today.getFullYear()+1);
  return Math.round((bd-today)/86400000);
}

function hasUpcomingBday(){
  var t=new Date();t.setHours(0,0,0,0);
  for(var i=0;i<7;i++){var d=new Date(t);d.setDate(d.getDate()+i);if(getBdaysOn(d.getMonth()+1,d.getDate()).length)return true;}
  return false;
}

function updateBdayBtn(){
  var isActive=hasUpcomingBday()&&BDAYS.length>0;
  var homeBtn=document.getElementById('bdayBtn');
  if(homeBtn){if(isActive)homeBtn.classList.add('bday-active');else homeBtn.classList.remove('bday-active');}
  document.querySelectorAll('.nav-bar-btn[data-nav="bday"]').forEach(function(b){
    if(isActive)b.classList.add('bday-active');else b.classList.remove('bday-active');
  });
}

/* ── Alarm key helpers ──────────────────────────────────── */
function getBdayAlarmKey(b){return b.name+'_'+b.day+'_'+b.month;}
function isBdayAlarmSet(b){
  var state=BDAY_ALARM_SET[getBdayAlarmKey(b)];
  return !!(state&&typeof state==='object'&&state.date>=evDk(new Date()));
}
function setBdayAlarmState(b,v){
  var next=new Date();next.setHours(0,0,0,0);var date=new Date(next.getFullYear(),b.month-1,b.day);if(date<next)date.setFullYear(date.getFullYear()+1);
  BDAY_ALARM_SET[getBdayAlarmKey(b)]=v?{date:evDk(date)}:null;
  appStorage.setItem(BDAY_ALARM_SET_KEY,JSON.stringify(BDAY_ALARM_SET));
}

/* ── VIP event sync ─────────────────────────────────────── */
function syncVipBdaysToEvents(){
  if(typeof EVENTS==='undefined'||typeof saveEvents==='undefined')return;
  // Remove old VIP birthday events
  EVENTS=EVENTS.filter(function(ev){return !ev.id||ev.id.indexOf('ev-bday-vip-')!==0;});
  var year=new Date().getFullYear();
  BDAYS.forEach(function(b){
    if(!b.vip)return;
    var m=String(b.month).padStart(2,'0');
    var d=String(b.day).padStart(2,'0');
    var dateStr=year+'-'+m+'-'+d;
    var safeKey=b.name.replace(/[^a-z0-9]/gi,'_').toLowerCase();
    EVENTS.push({
      id:'ev-bday-vip-'+b.day+'-'+b.month+'-'+safeKey,
      title:'\u2b50 Cumple '+tc(b.name),
      note:'Cumplea\u00f1os VIP',
      color:'#fbbf24',
      start:dateStr,
      end:dateStr,
      repeat:{type:'yearly'}
    });
  });
  saveEvents();
}

/* ── Próximos cumpleaños ──────────────────────────────────── */
