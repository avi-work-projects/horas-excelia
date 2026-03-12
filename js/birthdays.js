/* ============================================================
   BIRTHDAYS — Calendario de cumpleaños
   ============================================================ */

var BDAY_STORAGE_KEY='excelia-bdays-v1';
var BDAY_YEAR=new Date().getFullYear(), BDAY_MONTH=new Date().getMonth(), BDAY_VIEW='upcoming';
var BDAY_EDIT=null;
var BDAY_SEARCH='';
var BDAY_FILTER_VIP='all'; // 'all' | 'vip' | 'novip'
var BDAY_EDIT_VIP=false;
var BDAY_VIP_PENDING=null; // null=no edit mode, {}=pending changes (idx→bool)
var _bdLpTimer=null;
var _bdLpFired=false;
var _bdCtrlDocListenerAdded=false;

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
      if(BDAYS[idx].vip)delete BDAYS[idx].vip;else BDAYS[idx].vip=true;
      localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
      syncVipBdaysToEvents();updateBdayBtn();refreshBday();
    }
  });
  div.querySelector('.bday-ic-edit').addEventListener('click',function(e){
    e.stopPropagation();div.remove();
    if(idx>=0)openBdayForm(BDAYS[idx]);else openBdayForm(b);
  });
  div.querySelector('.bday-ic-close').addEventListener('click',function(e){
    e.stopPropagation();div.remove();
  });
}

// Estado de alarmas configuradas para cumpleaños
var BDAY_ALARM_SET_KEY='excelia-bday-alarm-set';
var BDAY_ALARM_SET=(function(){try{return JSON.parse(localStorage.getItem(BDAY_ALARM_SET_KEY)||'{}');}catch(e){return {};}})();
var BDAY_ALARM_COUNT_KEY='excelia-bday-alarm-count';
var BDAY_ALARM_COUNT=(function(){var v=localStorage.getItem(BDAY_ALARM_COUNT_KEY);return(v==='1'?1:2);})();

// Paleta de 10 colores rotativos
// #fbbf24 (amarillo) reservado para VIP — no entra en el random
var BDAY_PALETTE=['#6c8cff','#34d399','#fb923c','#ff6b6b','#c084fc','#38bdf8','#f472b6','#a3e635','#fb7185'];

// BDAYS puede venir de: 1) localStorage (importado), 2) secreto GitHub
// BDAYS_FROM_SECRET se define en index.html (inline config)
var BDAYS=(function(){
  try{
    var stored=localStorage.getItem(BDAY_STORAGE_KEY);
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

function shortName(name){
  var first=name.split(' ')[0];
  return first.length>10?first.substring(0,9)+'\u2026':first;
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
function isBdayAlarmSet(b){return !!BDAY_ALARM_SET[getBdayAlarmKey(b)];}
function setBdayAlarmState(b,v){
  BDAY_ALARM_SET[getBdayAlarmKey(b)]=v;
  localStorage.setItem(BDAY_ALARM_SET_KEY,JSON.stringify(BDAY_ALARM_SET));
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
function renderBdayUpcoming(){
  if(!BDAYS.length)return '<div class="sy-note">No hay cumplea\u00f1os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub.</div>';

  var today=new Date();today.setHours(0,0,0,0);
  var dow=today.getDay(),off=dow===0?-6:1-dow;
  var weekStart=new Date(today);weekStart.setDate(weekStart.getDate()+off);
  var prevWeekStart=new Date(weekStart);prevWeekStart.setDate(prevWeekStart.getDate()-7);
  var nextWeekStart=new Date(weekStart);nextWeekStart.setDate(nextWeekStart.getDate()+7);

  function getBdaysInRange(start,days){
    var items=[];
    for(var i=0;i<days;i++){
      var d=new Date(start);d.setDate(d.getDate()+i);
      var bds=getBdaysOn(d.getMonth()+1,d.getDate());
      var diff=Math.round((d-today)/86400000);
      bds.forEach(function(b){items.push({b:b,diff:diff});});
    }
    return items;
  }

  var prevItems=getBdaysInRange(prevWeekStart,7);
  var curItems=getBdaysInRange(weekStart,7);
  var nxtItems=getBdaysInRange(nextWeekStart,7);

  function bdayLabel(diff){
    if(diff===0)return '\u00a1Hoy!';
    if(diff===1)return 'Ma\u00f1ana';
    if(diff>1)return 'en '+diff+'\u202fd\u00edas';
    if(diff===-1)return 'Ayer';
    if(diff===-2)return 'Antes de ayer';
    return 'Hace '+Math.abs(diff)+'\u202fd\u00edas';
  }

  function renderGroup(title,list,isCurWeek){
    if(!list.length)return '<div class="sy-note">No hay cumplea\u00f1os '+title.toLowerCase()+'.</div>';
    var s='<div class="bday-month-hdr">'+title+'</div>';
    list.forEach(function(x){
      var lbl=bdayLabel(x.diff);
      var color=getBdayColor(x.b);
      var isT=x.diff===0;
      var isPastDay=x.diff<0;
      var isNearDay=x.diff>0&&x.diff<=3;
      var lblCls='bday-upcoming-lbl'+(isT?' today-lbl':isPastDay?' past-lbl':(isCurWeek&&x.diff>0)?' this-week':isNearDay?' near':'');
      var isVip=!!x.b.vip;
      var alarmSet=isBdayAlarmSet(x.b);
      var alarmIcon=alarmSet?'<span class="bday-alarm-set-icon" title="Alarma configurada">\uD83D\uDD14</span>':'';
      var vipCls=isVip?' bday-vip-item':'';
      var vipStar=isVip?' <img src="./VIP.png" class="bday-vip-img" alt="VIP">':'';
      s+='<div class="bday-upcoming-item'+vipCls+(isT?' bday-today-item':'')+'" data-bday-name="'+escHtml(x.b.name)+'" data-bday-day="'+x.b.day+'" data-bday-month="'+x.b.month+'">';
      s+='<div class="bday-upcoming-icon" style="background:'+color+'22;border-color:'+color+'">'+(isVip?'\u2b50':'\uD83C\uDF82')+'</div>';
      s+='<div class="bday-upcoming-info">';
      s+='<div class="bday-upcoming-name" style="color:'+color+'">'+bdName(x.b.name)+vipStar+'</div>';
      s+='<div class="bday-upcoming-date">'+x.b.day+' de '+MN[x.b.month-1]+'</div>';
      s+='</div>';
      s+=alarmIcon;
      s+='<div class="'+lblCls+'">'+lbl+'</div>';
      s+='</div>';
    });
    return s;
  }

  var h='';
  if(prevItems.length){
    h+='<div class="bday-upcoming-section">';
    h+=renderGroup('Semana anterior',prevItems);
    h+='</div><div style="margin-top:8px">';
  } else {
    h+='<div>';
  }
  h+=renderGroup('Esta semana',curItems,true);
  h+='</div><div class="bday-upcoming-section" style="margin-top:8px">';
  h+=renderGroup('La pr\u00f3xima semana',nxtItems);
  h+='</div>';
  return h;
}

/* ── Calendario mensual ───────────────────────────────────── */
function renderBdayCalMonth(){
  var today=new Date();today.setHours(0,0,0,0);
  var DN7=['L','M','X','J','V','S','D'];
  var h='<div class="bday-week-hdr">';
  DN7.forEach(function(n){h+='<div>'+n+'</div>';});
  h+='</div>';
  var first=new Date(BDAY_YEAR,BDAY_MONTH,1);
  var last=new Date(BDAY_YEAR,BDAY_MONTH+1,0);
  var cur=new Date(first);
  var dow=cur.getDay();var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    h+='<div class="bday-week-grid">';
    for(var i=0;i<7;i++){
      var d=new Date(cur);
      var inM=d.getMonth()===BDAY_MONTH;
      var isTod=d.getTime()===today.getTime();
      var past=inM&&d<today;
      var bds=getBdaysOn(d.getMonth()+1,d.getDate());
      var bdow=d.getDay();
      var cls='bday-cell'+(inM?'':' out-m')+(isTod?' today-bday':'')+(past?' past-cal-day':'')+(bdow===0||bdow===6?' weekend':'');
      var dataAttrs=inM?' data-cal-day="'+d.getDate()+'" data-cal-month="'+(d.getMonth()+1)+'"':'';
      h+='<div class="'+cls+'"'+dataAttrs+'>';
      h+='<div class="bday-num">'+d.getDate()+'</div>';
      bds.forEach(function(b){
        var color=b.vip?'#fbbf24':getBdayColor(b);
        var sn=shortName(tc(b.name));
        var bidx=BDAYS.indexOf(b);
        var vipCls=b.vip?' bday-badge-vip':'';
        var vipXtra=b.vip?';border-width:2px;box-shadow:0 0 5px rgba(251,191,36,.55)':'';
        h+='<div class="bday-badge'+vipCls+'" data-bday-idx="'+bidx+'" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'" style="background:'+color+'22;color:'+color+';border-color:'+color+vipXtra+'" title="'+bdName(b.name)+(b.vip?' VIP':'')+'">'+escHtml(sn)+'</div>';
      });
      h+='</div>';
      cur.setDate(cur.getDate()+1);
    }
    h+='</div>';
  }
  return h;
}

/* ── Lista por meses ──────────────────────────────────────── */
function renderBdayList(){
  if(!BDAYS.length)return '<div class="sy-note">No hay cumplea\u00f1os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub.</div>';
  // Botones arriba del todo en la lista
  var h='<div class="bday-io-row" style="margin-bottom:10px">';
  h+='<button class="bday-io-btn bday-io-btn-add" id="bdAdd">+ A\u00f1adir cumplea\u00f1os</button>';
  h+='<button class="bday-io-btn" id="bdExport">&#8595; Exportar</button>';
  h+='<button class="bday-io-btn" id="bdImport">&#8593; Importar JSON</button>';
  h+='<input type="file" id="bdImportFile" accept=".json" style="display:none">';
  h+='</div>';
  h+='<div class="bday-search-wrap"><input class="bday-search-input" id="bdSearch" type="text" placeholder="Buscar persona\u2026" value="'+escHtml(BDAY_SEARCH)+'"></div>';
  // Helper: effective VIP state (considers pending changes)
  function getEffVip(b,idx){
    if(BDAY_VIP_PENDING!==null&&BDAY_VIP_PENDING.hasOwnProperty(idx))return BDAY_VIP_PENDING[idx];
    return !!b.vip;
  }
  var byM=[];for(var m=0;m<12;m++)byM.push([]);
  BDAYS.forEach(function(b){if(b.month>=1&&b.month<=12)byM[b.month-1].push(b);});
  byM.forEach(function(list,m){
    var filtered;
    if(BDAY_EDIT_VIP&&BDAY_VIP_PENDING!==null){
      // In edit mode, filter uses effective (pending) VIP state
      if(BDAY_FILTER_VIP==='vip')filtered=list.filter(function(b){return getEffVip(b,BDAYS.indexOf(b));});
      else if(BDAY_FILTER_VIP==='novip')filtered=list.filter(function(b){return !getEffVip(b,BDAYS.indexOf(b));});
      else filtered=list;
    } else {
      filtered=BDAY_FILTER_VIP==='vip'?list.filter(function(b){return !!b.vip;}):
               BDAY_FILTER_VIP==='novip'?list.filter(function(b){return !b.vip;}):list;
    }
    if(!filtered.length)return;
    filtered.sort(function(a,b){return a.day-b.day;});
    h+='<div class="sy-section bday-month-section"><div class="bday-month-hdr">'+MN[m]+'</div>';
    filtered.forEach(function(b){
      var dl=daysUntil(b.month,b.day);
      var lbl=dl===0?'\u00a1Hoy!':dl===1?'Ma\u00f1ana':'en '+dl+'d';
      var cls='bday-list-left'+(dl===0?' today-lbl':dl<=7?' near':'');
      var color=getBdayColor(b);
      var sname=escHtml(b.name.toLowerCase());
      var lidx=BDAYS.indexOf(b);
      var effVip=BDAY_EDIT_VIP?getEffVip(b,lidx):!!b.vip;
      var editCls=BDAY_EDIT_VIP?(effVip?' bday-list-vip-active':' bday-list-vip-dim'):'';
      var vipStar=effVip?' <img src="./VIP.png" class="bday-vip-img" alt="VIP">':'';
      h+='<div class="bday-list-item'+editCls+'" data-bday-idx="'+lidx+'" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'" data-sname="'+sname+'">';
      h+='<span class="bday-list-day" style="color:'+color+'">'+b.day+'</span>';
      h+='<span class="bday-list-name">'+bdName(b.name)+vipStar+'</span>';
      h+='<span class="'+cls+'">'+lbl+'</span>';
      h+='</div>';
    });
    h+='</div>';
  });
  return h;
}

/* ── Contenido principal ──────────────────────────────────── */
function renderBdayContent(){
  var isUpcoming=BDAY_VIEW==='upcoming';
  var h=renderNavBar('bday');
  // TABS en nivel 2 (justo bajo el nav bar)
  h+='<div class="bday-hdr-sub">';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='upcoming'?' active':'')+'" id="bdViewUpcoming">Pr\u00f3ximos<br>Cumplea\u00f1os</button>';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='list'?' active':'')+'" id="bdViewList">Lista<br>Cumplea\u00f1os</button>';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='cal'?' active':'')+'" id="bdViewCal">Calendario<br>Cumplea\u00f1os</button>';
  h+='</div>';
  // Nivel 3: para TODAS las vistas
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="bdBack">&#8592;</button>';
  if(BDAY_VIEW==='upcoming'){
    h+='<div class="sy-year-nav"><div class="sy-year">Pr\u00f3ximos</div></div>';
  } else if(BDAY_VIEW==='list'){
    h+='<div class="sy-year-nav"><div class="sy-year">Cumplea\u00f1os</div></div>';
  } else {
    h+='<div class="sy-year-nav"><button class="sy-nav" id="bdPrev">&#9664;</button>';
    h+='<div class="sy-year">'+MN[BDAY_MONTH]+' '+BDAY_YEAR+'</div>';
    h+='<button class="sy-nav" id="bdNext">&#9654;</button></div>';
    h+='<button class="today-btn" id="bdToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  }
  h+='</div>';
  // Para 'list': filtro VIP sticky justo bajo nivel 3 (flex-shrink:0, fuera del sy-body)
  if(BDAY_VIEW==='list'){
    h+='<div class="bday-vip-ctrl-bar">';
    h+='<div class="bday-vip-filter-chips">';
    h+='<button class="bday-vip-chip'+(BDAY_FILTER_VIP==='all'?' active':'')+'" id="bdVipAll">Todos</button>';
    h+='<button class="bday-vip-chip chip-vip'+(BDAY_FILTER_VIP==='vip'?' active':'')+'" id="bdVipOnly"><img src="./VIP.png" style="width:20px;height:auto;vertical-align:middle" alt="VIP"></button>';
    h+='<button class="bday-vip-chip chip-novip'+(BDAY_FILTER_VIP==='novip'?' active':'')+'" id="bdVipNone"><span class="vip-no-icon"><img src="./VIP.png" style="width:20px;height:auto;display:block" alt="no VIP"></span></button>';
    h+='</div>';
    h+='<button class="bday-vip-edit-btn'+(BDAY_EDIT_VIP?' active':'')+'" id="bdEditVip">'+(BDAY_EDIT_VIP?'\u2713 Listo':'Editar VIPs')+'</button>';
    h+='</div>';
  }
  h+='<div class="sy-body"'+(BDAY_EDIT_VIP?' style="padding-bottom:72px"':'')+'>';
  if(BDAY_VIEW==='upcoming'){
    h+=renderBdayUpcoming();
  } else if(BDAY_VIEW==='cal'){
    if(!BDAYS.length)h+='<div class="sy-note">No hay cumplea\u00f1os cargados.</div>';
    else h+=renderBdayCalMonth();
  } else {
    h+=renderBdayList();
  }
  // Lista: botones en la parte de arriba del renderBdayList(); resto de vistas: botones al fondo
  if(BDAY_VIEW!=='list'){
    // En calendario: no hay botón Añadir (se crea pulsando el día)
    h+='<div class="bday-io-row">';
    h+='<button class="bday-io-btn" id="bdExport">&#8595; Exportar</button>';
    h+='<button class="bday-io-btn" id="bdImport">&#8593; Importar JSON</button>';
    h+='<input type="file" id="bdImportFile" accept=".json" style="display:none">';
    h+='</div>';
  }
  h+='</div>';
  if(BDAY_EDIT_VIP){
    h+='<button class="bday-cancel-edit-btn" id="bdCancelEdit">Cancelar</button>';
  }
  return h;
}

/* ── Detail panel ─────────────────────────────────────────── */
function renderBdayDetail(b){
  var dl=daysUntil(b.month,b.day);
  var lbl=dl===0?'\u00a1Hoy es su cumplea\u00f1os!':dl===1?'Ma\u00f1ana cumple a\u00f1os':'Faltan '+dl+' d\u00edas';
  var color=getBdayColor(b);
  var vipStar=b.vip?' \u2b50':'';
  var h='<div class="bd-detail-overlay" id="bdDetailOv"><div class="bd-detail-sheet">';
  h+='<div class="bd-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="bdDClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">Cumplea\u00f1os</div>';
  h+='<button class="ev-list-btn" id="bdDEdit" style="font-size:.8rem;padding:6px 12px">&#9998; Editar</button>';
  h+='</div>';
  h+='<div class="bd-detail-color-bar" style="background:'+color+'"></div>';
  h+='<div class="bd-detail-name">'+bdName(b.name)+vipStar+'</div>';
  h+='<div class="bd-detail-date">'+b.day+' de '+MN[b.month-1]+'</div>';
  h+='<div class="bd-detail-lbl" style="background:'+color+'22;color:'+color+'">'+lbl+'</div>';
  h+='</div></div>';
  return h;
}

/* ── Alarm panel for birthday ─────────────────────────────── */
function renderBdayAlarmPanel(b){
  var dl=daysUntil(b.month,b.day);
  var lbl=dl===0?'\u00a1Hoy!':dl===1?'Ma\u00f1ana':dl>0?'en '+dl+' d\u00edas':'Hace '+Math.abs(dl)+' d\u00edas';
  var color=getBdayColor(b);
  var isSet=isBdayAlarmSet(b);
  var cnt=BDAY_ALARM_COUNT;
  // Default dates: day before (month/day) and day of
  var today=new Date();
  var bdYear=today.getFullYear();
  var bdDate=new Date(bdYear,b.month-1,b.day);
  if(bdDate<today)bdDate.setFullYear(bdYear+1);
  var prevDate=new Date(bdDate);prevDate.setDate(prevDate.getDate()-1);
  function fmtDate(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');}
  var h='<div class="bd-alarm-overlay" id="bdAlarmOv"><div class="bd-alarm-sheet">';
  h+='<div class="bd-alarm-handle"></div>';
  h+='<div class="bd-alarm-hdr">';
  h+='<button class="sy-back" id="bdAlarmClose">&#8592;</button>';
  h+='<div class="bd-alarm-title">&#128276; Alarma Cumplea\u00f1os</div>';
  h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="bd-alarm-info" style="border-color:'+color+'44;background:'+color+'11">';
  h+='<div class="bd-alarm-name" style="color:'+color+'">'+(b.vip?'\u2b50 ':'')+bdName(b.name)+'</div>';
  h+='<div class="bd-alarm-date">'+b.day+' de '+MN[b.month-1]+' \u00b7 '+lbl+'</div>';
  h+='</div>';
  // Alarm set badge
  if(isSet){
    h+='<div class="bd-alarm-set-badge">&#128276; Alarma ya marcada como configurada<button class="bd-alarm-unmark-btn" id="bdAlarmUnmark">Quitar</button></div>';
  }
  // Count toggle
  h+='<div class="bd-alarm-count-row">';
  h+='<button class="bd-alarm-count-btn'+(cnt===1?' active':'')+'" data-cnt="1" id="bdAlarmCount1">1 alarma</button>';
  h+='<button class="bd-alarm-count-btn'+(cnt===2?' active':'')+'" data-cnt="2" id="bdAlarmCount2">2 alarmas</button>';
  h+='</div>';
  // VIP toggle
  h+='<div class="bd-alarm-vip-row">';
  h+='<label class="bd-alarm-vip-lbl"><input type="checkbox" id="bdAlarmVip"'+(b.vip?' checked':'')+' style="accent-color:#fbbf24;width:16px;height:16px"> <img src="./VIP.png" class="bday-vip-img" alt="VIP" style="height:2.2em;margin-left:2px;vertical-align:middle"></label>';
  h+='</div>';
  // Alarm fields
  h+='<div id="bdAlarmFields">';
  if(cnt===2){
    h+='<div class="bd-alarm-row">';
    h+='<span class="bd-alarm-row-lbl">\uD83C\uDF19 V\u00edspera<br><span style="font-size:.65rem;opacity:.7">'+fmtDate(prevDate)+'</span></span>';
    h+='<div class="bd-alarm-time"><input id="bdAlarmH1" type="number" min="0" max="23" value="23"><span class="bd-alarm-time-sep">:</span><input id="bdAlarmM1" type="number" min="0" max="59" value="57"></div>';
    h+='</div>';
  }
  h+='<div class="bd-alarm-row">';
  h+='<span class="bd-alarm-row-lbl">\uD83C\uDF89 Cumplea\u00f1os<br><span style="font-size:.65rem;opacity:.7">'+fmtDate(bdDate)+'</span></span>';
  h+='<div class="bd-alarm-time"><input id="bdAlarmH2" type="number" min="0" max="23" value="9"><span class="bd-alarm-time-sep">:</span><input id="bdAlarmM2" type="number" min="0" max="59" value="02"></div>';
  h+='</div>';
  h+='</div>';
  // Action buttons
  h+='<div class="ev-form-actions">';
  h+='<button class="ev-btn primary" id="bdAlarmCreate">&#128276; Crear alarma'+(cnt===2?'s':'')+'</button>';
  h+='<button class="action-btn sent-toggle'+(isSet?' is-marked':'')+'" id="bdAlarmMark">'+(isSet?'\u21a9 Desmarcar':'\u2713 Marcar config.')+'</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

function openBdayAlarm(b){
  var ov=document.getElementById('bdayOverlay');
  var wrap=document.createElement('div');wrap.id='bdAlarmWrap';
  wrap.innerHTML=renderBdayAlarmPanel(b);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bdAlarmOv');
    if(fo){
      fo.classList.add('open');
      fo.addEventListener('click',function(e){if(e.target===fo)closeBdayAlarm();});
    }
  });
  bindBdayAlarmEvents(b);
}

function closeBdayAlarm(){
  var fo=document.getElementById('bdAlarmOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bdAlarmWrap');if(w)w.remove();},300);
}

function bindBdayAlarmEvents(b){
  document.getElementById('bdAlarmClose').addEventListener('click',closeBdayAlarm);

  // VIP toggle inside alarm panel
  var vipChk=document.getElementById('bdAlarmVip');
  if(vipChk){
    vipChk.addEventListener('change',function(e){
      e.stopPropagation();
      if(this.checked)b.vip=true;else delete b.vip;
      localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
      if(typeof syncVipBdaysToEvents==='function')syncVipBdaysToEvents();
      updateBdayBtn();
      refreshBday();
    });
  }

  // Alarm count toggle
  ['bdAlarmCount1','bdAlarmCount2'].forEach(function(id){
    var btn=document.getElementById(id);
    if(!btn)return;
    btn.addEventListener('click',function(){
      BDAY_ALARM_COUNT=parseInt(btn.dataset.cnt,10);
      localStorage.setItem(BDAY_ALARM_COUNT_KEY,String(BDAY_ALARM_COUNT));
      closeBdayAlarm();
      setTimeout(function(){openBdayAlarm(b);},310);
    });
  });

  // Unmark alarm
  var unmarkBtn=document.getElementById('bdAlarmUnmark');
  if(unmarkBtn){
    unmarkBtn.addEventListener('click',function(){
      setBdayAlarmState(b,false);
      showToast('Marca de alarma eliminada','success');
      closeBdayAlarm();
      setTimeout(refreshBday,320);
    });
  }

  // Create alarm via MacroDroid
  document.getElementById('bdAlarmCreate').addEventListener('click',function(){
    var alarmUrl=localStorage.getItem('excelia-alarm-url')||localStorage.getItem('excelia-macro-alarm-url')||'';
    if(!alarmUrl){
      showToast('Configura la URL de MacroDroid en el men\u00fa \u22ee','error');
      return;
    }
    // Calculate dates
    var today2=new Date();
    var bdYear2=today2.getFullYear();
    var bdDate2=new Date(bdYear2,b.month-1,b.day);
    if(bdDate2<today2)bdDate2.setFullYear(bdYear2+1);
    var prevDate2=new Date(bdDate2);prevDate2.setDate(prevDate2.getDate()-1);
    var h2r=parseInt(document.getElementById('bdAlarmH2').value,10);
    var h2=isNaN(h2r)?9:Math.min(23,Math.max(0,h2r));
    var m2r=parseInt(document.getElementById('bdAlarmM2').value,10);
    var m2=isNaN(m2r)?2:Math.min(59,Math.max(0,m2r));
    var msgDay='\uD83C\uDF82 Cumple '+tc(b.name)+'! '+String(b.day).padStart(2,'0')+'/'+String(b.month).padStart(2,'0');
    var base=normalizeMacroBase(alarmUrl);
    // Android Calendar day: 1=Dom, 2=Lun, ..., 7=Sáb (= JS getDay()+1)
    var dayBd=bdDate2.getDay()+1;
    var url2=base+'/generar_alarma2?alarmH='+h2+'&alarmM='+m2+'&alarmMsg='+encodeURIComponent(msgDay)+'&alarmDays='+dayBd;
    function onBdAlarmSuccess(){
      if(typeof addAlarm==='function'){
        var fmtD=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
        if(BDAY_ALARM_COUNT===2){
          addAlarm({type:'birthday',label:msgPrev,hour:h1,minute:m1,days:[dayPrev],targetDate:fmtD(prevDate2)});
        }
        addAlarm({type:'birthday',label:msgDay,hour:h2,minute:m2,days:[dayBd],targetDate:fmtD(bdDate2)});
      }
      setBdayAlarmState(b,true);
      showToast('\u23f0 Alarma'+(BDAY_ALARM_COUNT===2?'s':'')+' creada'+(BDAY_ALARM_COUNT===2?'s':'')+' para '+tc(b.name),'success');
      closeBdayAlarm();
      setTimeout(refreshBday,320);
    }
    function onBdAlarmError(){showToast('Error al contactar MacroDroid','error');}
    showToast('Enviando alarma'+( BDAY_ALARM_COUNT===2?'s':'')+' a MacroDroid\u2026','success');
    if(BDAY_ALARM_COUNT===2){
      var h1r=parseInt(document.getElementById('bdAlarmH1').value,10);
      var h1=isNaN(h1r)?23:Math.min(23,Math.max(0,h1r));
      var m1r=parseInt(document.getElementById('bdAlarmM1').value,10);
      var m1=isNaN(m1r)?57:Math.min(59,Math.max(0,m1r));
      var msgPrev='\u23f0 Ma\u00f1ana cumple '+tc(b.name)+' '+String(b.day).padStart(2,'0')+'/'+String(b.month).padStart(2,'0');
      var dayPrev=prevDate2.getDay()+1;
      var url1=base+'/generar_alarma1?alarmH='+h1+'&alarmM='+m1+'&alarmMsg='+encodeURIComponent(msgPrev)+'&alarmDays='+dayPrev;
      // 1 segundo de separación entre las dos peticiones
      fetch(url1,{mode:'no-cors'})
        .then(function(){return new Promise(function(r){setTimeout(r,1000);});})
        .then(function(){return fetch(url2,{mode:'no-cors'});})
        .then(onBdAlarmSuccess).catch(onBdAlarmError);
    } else {
      fetch(url2,{mode:'no-cors'}).then(onBdAlarmSuccess).catch(onBdAlarmError);
    }
  });

  // Zero-pad minute inputs on blur
  ['bdAlarmM1','bdAlarmM2'].forEach(function(id){
    var inp=document.getElementById(id);
    if(inp)inp.addEventListener('blur',function(){
      var v=parseInt(this.value,10);
      if(!isNaN(v)&&v>=0&&v<=59)this.value=String(v).padStart(2,'0');
    });
  });

  // Mark without creating
  document.getElementById('bdAlarmMark').addEventListener('click',function(){
    var nowSet=isBdayAlarmSet(b);
    setBdayAlarmState(b,!nowSet);
    showToast(nowSet?'Marca eliminada':'\u2713 Marcado como configurada','success');
    closeBdayAlarm();
    setTimeout(refreshBday,320);
  });
}

/* ── Form panel (añadir/editar cumpleaños) ─────────────────── */
function renderBdayForm(b,prefillDay,prefillMonth){
  var isEdit=!!b;
  var name=isEdit?b.name:'';
  var day=isEdit?b.day:(prefillDay||'');
  var month=isEdit?b.month:(prefillMonth||1);
  var vip=isEdit?!!b.vip:false;
  var h='<div class="bd-form-overlay" id="bdFormOv"><div class="bd-form-sheet">';
  h+='<div class="bd-form-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="bdFClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar cumplea\u00f1os':'Nuevo cumplea\u00f1os')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="bdFDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:60px"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Nombre</label>';
  h+='<input class="ev-input" id="bdFName" type="text" maxlength="60" placeholder="Nombre completo" value="'+escHtml(name)+'"></div>';
  h+='<div class="ev-field ev-date-row">';
  h+='<div><label>D\u00eda</label><input class="ev-input" id="bdFDay" type="number" min="1" max="31" placeholder="1-31" value="'+escHtml(String(day))+'"></div>';
  h+='<div><label>Mes</label><select class="ev-input" id="bdFMonth">';
  MN.forEach(function(mn,i){h+='<option value="'+(i+1)+'"'+(month===(i+1)?' selected':'')+'>'+mn+'</option>';});
  h+='</select></div>';
  h+='</div>';
  // VIP toggle
  h+='<div class="ev-toggle-row">';
  h+='<label class="ev-toggle-label" for="bdFVip"><img src="./VIP.png" alt="VIP" style="height:1.6em;vertical-align:middle;margin-right:5px"> VIP (alarma prioritaria + sync eventos)</label>';
  h+='<input type="checkbox" class="ev-checkbox" id="bdFVip"'+(vip?' checked':'')+' style="accent-color:#fbbf24">';
  h+='</div>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="bdFSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}

/* ── Abrir/cerrar detail ──────────────────────────────────── */
function openBdayDetail(b){
  var ov=document.getElementById('bdayOverlay');
  var wrap=document.createElement('div');wrap.id='bdDWrap';
  wrap.innerHTML=renderBdayDetail(b);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bdDetailOv');
    if(fo){
      fo.classList.add('open');
      fo.addEventListener('click',function(e){if(e.target===fo)closeBdayDetail();});
    }
  });
  document.getElementById('bdDClose').addEventListener('click',closeBdayDetail);
  document.getElementById('bdDEdit').addEventListener('click',function(){
    closeBdayDetail();setTimeout(function(){openBdayForm(b);},300);
  });
}

function closeBdayDetail(){
  var fo=document.getElementById('bdDetailOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bdDWrap');if(w)w.remove();},300);
}

/* ── Abrir/cerrar form ────────────────────────────────────── */
function openBdayForm(b,prefillDay,prefillMonth){
  BDAY_EDIT=b||null;
  var ov=document.getElementById('bdayOverlay');
  var wrap=document.createElement('div');wrap.id='bdFWrap';
  wrap.innerHTML=renderBdayForm(b,prefillDay,prefillMonth);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bdFormOv');
    if(fo)fo.classList.add('open');
    var inp=document.getElementById('bdFName');
    if(inp)setTimeout(function(){inp.focus();},100);
  });
  bindBdayFormEvents();
}

function closeBdayForm(){
  var fo=document.getElementById('bdFormOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bdFWrap');if(w)w.remove();BDAY_EDIT=null;},300);
}

function bindBdayFormEvents(){
  document.getElementById('bdFClose').addEventListener('click',closeBdayForm);
  var delBtn=document.getElementById('bdFDel');
  if(delBtn){
    delBtn.addEventListener('click',function(){
      if(!BDAY_EDIT)return;
      BDAYS=BDAYS.filter(function(x){return!(x.name===BDAY_EDIT.name&&x.day===BDAY_EDIT.day&&x.month===BDAY_EDIT.month);});
      localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
      syncVipBdaysToEvents();
      showToast('Cumplea\u00f1os eliminado','success');
      updateBdayBtn();closeBdayForm();setTimeout(refreshBday,320);
    });
  }
  document.getElementById('bdFSave').addEventListener('click',function(){
    var name=document.getElementById('bdFName').value.trim();
    var day=parseInt(document.getElementById('bdFDay').value,10);
    var month=parseInt(document.getElementById('bdFMonth').value,10);
    var vipChk=document.getElementById('bdFVip');
    var vip=vipChk?vipChk.checked:false;
    if(!name){showToast('El nombre es obligatorio','error');return;}
    if(!day||day<1||day>31){showToast('D\u00eda inv\u00e1lido (1-31)','error');return;}
    if(BDAY_EDIT){
      var idx=-1;
      for(var i=0;i<BDAYS.length;i++){
        if(BDAYS[i].name===BDAY_EDIT.name&&BDAYS[i].day===BDAY_EDIT.day&&BDAYS[i].month===BDAY_EDIT.month){idx=i;break;}
      }
      if(idx!==-1)BDAYS[idx]={name:name,day:day,month:month,vip:vip||undefined};
      showToast('Cumplea\u00f1os actualizado','success');
    } else {
      var newB={name:name,day:day,month:month};
      if(vip)newB.vip=true;
      BDAYS.push(newB);
      showToast('Cumplea\u00f1os a\u00f1adido','success');
    }
    localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
    syncVipBdaysToEvents();
    updateBdayBtn();closeBdayForm();setTimeout(refreshBday,320);
  });
}

/* ── Apertura/cierre ventana ──────────────────────────────── */
function openBday(){
  NAV_BACK=null;
  var now=new Date();BDAY_YEAR=now.getFullYear();BDAY_MONTH=now.getMonth();BDAY_VIEW='upcoming';
  var ov=document.getElementById('bdayOverlay');
  document.getElementById('bdayContent').innerHTML=renderBdayContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindBdayEvents();});});
}

function closeBday(){
  var ov=document.getElementById('bdayOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

function refreshBday(){
  document.getElementById('bdayContent').innerHTML=renderBdayContent();
  bindBdayEvents();
}

function applyBdaySearch(q){
  document.querySelectorAll('.bday-month-section').forEach(function(sec){
    var vis=0;
    sec.querySelectorAll('.bday-list-item').forEach(function(item){
      var match=!q||(item.dataset.sname&&item.dataset.sname.indexOf(q)>=0);
      item.style.display=match?'':'none';
      if(match)vis++;
    });
    sec.style.display=vis?'':'none';
  });
}

function bindBdayEvents(){
  var bdBackEl=document.getElementById('bdBack');
  if(bdBackEl)bdBackEl.addEventListener('click',function(){
    if(NAV_BACK){var fn=NAV_BACK;NAV_BACK=null;fn();}else{closeBday();}
  });
  bindNavBar('bday',closeBday);
  var prevBtn=document.getElementById('bdPrev');
  if(prevBtn)prevBtn.addEventListener('click',function(){
    BDAY_MONTH--;if(BDAY_MONTH<0){BDAY_MONTH=11;BDAY_YEAR--;}refreshBday();
  });
  var nextBtn=document.getElementById('bdNext');
  if(nextBtn)nextBtn.addEventListener('click',function(){
    BDAY_MONTH++;if(BDAY_MONTH>11){BDAY_MONTH=0;BDAY_YEAR++;}refreshBday();
  });
  var todayBtn=document.getElementById('bdToday');
  if(todayBtn)todayBtn.addEventListener('click',function(){
    var n=new Date();BDAY_YEAR=n.getFullYear();BDAY_MONTH=n.getMonth();refreshBday();
  });
  // Listener global para cerrar el minimenu al clicar fuera (se añade una sola vez)
  if(!_bdCtrlDocListenerAdded){
    _bdCtrlDocListenerAdded=true;
    document.addEventListener('click',function(e){
      if(!e.target.closest('.bday-inline-ctrl')){
        var ctrl=document.querySelector('.bday-inline-ctrl');
        if(ctrl)ctrl.remove();
      }
    });
  }
  document.getElementById('bdViewUpcoming').addEventListener('click',function(){BDAY_SEARCH='';BDAY_FILTER_VIP='all';BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;BDAY_VIEW='upcoming';refreshBday();});
  document.getElementById('bdViewCal').addEventListener('click',function(){BDAY_SEARCH='';BDAY_FILTER_VIP='all';BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;BDAY_VIEW='cal';refreshBday();});
  document.getElementById('bdViewList').addEventListener('click',function(){BDAY_VIP_PENDING=null;BDAY_EDIT_VIP=false;BDAY_VIEW='list';refreshBday();});
  // Filter chips: Todos / Solo VIP / Sin VIP
  var bdVipAllEl=document.getElementById('bdVipAll');
  if(bdVipAllEl)bdVipAllEl.addEventListener('click',function(){BDAY_FILTER_VIP='all';BDAY_SEARCH='';refreshBday();});
  var bdVipOnlyEl=document.getElementById('bdVipOnly');
  if(bdVipOnlyEl)bdVipOnlyEl.addEventListener('click',function(){BDAY_FILTER_VIP='vip';BDAY_SEARCH='';refreshBday();});
  var bdVipNoneEl=document.getElementById('bdVipNone');
  if(bdVipNoneEl)bdVipNoneEl.addEventListener('click',function(){BDAY_FILTER_VIP='novip';BDAY_SEARCH='';refreshBday();});
  // Botón "Editar VIPs" / "✓ Listo": entra en modo edición O guarda y sale
  var editVipEl=document.getElementById('bdEditVip');
  if(editVipEl)editVipEl.addEventListener('click',function(){
    if(BDAY_EDIT_VIP){
      // "✓ Listo" → aplica BDAY_VIP_PENDING, guarda y refresca
      if(BDAY_VIP_PENDING!==null){
        Object.keys(BDAY_VIP_PENDING).forEach(function(k){
          var i=parseInt(k,10);
          if(i>=0&&i<BDAYS.length){
            if(BDAY_VIP_PENDING[k])BDAYS[i].vip=true;else delete BDAYS[i].vip;
          }
        });
        localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
        syncVipBdaysToEvents();updateBdayBtn();
      }
      BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;refreshBday();
    } else {
      // Entra en modo edición (UN solo refresco para cambiar la etiqueta del botón)
      BDAY_EDIT_VIP=true;BDAY_VIP_PENDING={};refreshBday();
    }
  });
  // Botón "Cancelar" — descarta cambios pendientes y sale del modo edición
  var cancelEditEl=document.getElementById('bdCancelEdit');
  if(cancelEditEl)cancelEditEl.addEventListener('click',function(){
    BDAY_EDIT_VIP=false;BDAY_VIP_PENDING=null;refreshBday();
  });
  var srch=document.getElementById('bdSearch');
  if(srch){
    if(BDAY_SEARCH){srch.value=BDAY_SEARCH;applyBdaySearch(BDAY_SEARCH);}
    srch.addEventListener('input',function(){
      BDAY_SEARCH=this.value.trim().toLowerCase();
      applyBdaySearch(BDAY_SEARCH);
    });
  }
  var addBtn=document.getElementById('bdAdd');
  if(addBtn)addBtn.addEventListener('click',function(){openBdayForm(null);});
  // Clic en día vacío del calendario → abre formulario con día/mes pre-rellenos
  document.querySelectorAll('.bday-cell[data-cal-day]').forEach(function(cell){
    cell.addEventListener('click',function(e){
      if(e.target.closest('.bday-badge'))return; // dejar que el badge maneje su propio clic
      var day=parseInt(cell.dataset.calDay,10);
      var month=parseInt(cell.dataset.calMonth,10);
      if(!isNaN(day)&&!isNaN(month))openBdayForm(null,day,month);
    });
  });
  // Clicks en badges del calendario
  document.querySelectorAll('.bday-badge[data-bday-name]').forEach(function(badge){
    badge.addEventListener('click',function(e){
      e.stopPropagation();
      var b=null;
      var idx=parseInt(badge.dataset.bdayIdx,10);
      if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length){b=BDAYS[idx];}
      if(!b){
        var name=badge.dataset.bdayName;
        var day=parseInt(badge.dataset.bdayDay,10);
        var month=parseInt(badge.dataset.bdayMonth,10);
        for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
        if(!b)b={name:name,day:day,month:month};
      }
      openBdayDetail(b);
    });
  });
  // Clicks en lista por meses → detail (o toggle VIP en modo edición)
  document.querySelectorAll('.bday-list-item[data-bday-name]').forEach(function(item){
    item.addEventListener('touchstart',function(){
      _bdLpFired=false;
      var bidx=parseInt(item.dataset.bdayIdx,10);
      var b2=(!isNaN(bidx)&&bidx>=0&&bidx<BDAYS.length)?BDAYS[bidx]:null;
      if(!b2){var n=item.dataset.bdayName;var dd=parseInt(item.dataset.bdayDay,10);var dm=parseInt(item.dataset.bdayMonth,10);
        for(var i2=0;i2<BDAYS.length;i2++){if(BDAYS[i2].name===n&&BDAYS[i2].day===dd&&BDAYS[i2].month===dm){b2=BDAYS[i2];break;}}
        if(!b2)b2={name:n,day:dd,month:dm};}
      var _self=item;
      _bdLpTimer=setTimeout(function(){_bdLpTimer=null;_bdLpFired=true;_showBdayInlineCtrl(_self,b2);},500);
    },{passive:true});
    item.addEventListener('touchend',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('touchmove',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('click',function(e){
      if(_bdLpFired){_bdLpFired=false;return;}
      e.stopPropagation();
      var idx=parseInt(item.dataset.bdayIdx,10);
      if(BDAY_EDIT_VIP){
        // En modo edición: toggle VIP visual (DOM directo, sin refreshBday para evitar scroll)
        if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length&&BDAY_VIP_PENDING!==null){
          var curEff=BDAY_VIP_PENDING.hasOwnProperty(idx)?BDAY_VIP_PENDING[idx]:!!BDAYS[idx].vip;
          var newEff=!curEff;
          BDAY_VIP_PENDING[idx]=newEff;
          // Toggle CSS dim/active sin re-render
          item.classList.remove(newEff?'bday-list-vip-dim':'bday-list-vip-active');
          item.classList.add(newEff?'bday-list-vip-active':'bday-list-vip-dim');
          // Añadir/quitar logo VIP dentro del span del nombre
          var nameSpan=item.querySelector('.bday-list-name');
          if(nameSpan){
            var existingImg=nameSpan.querySelector('.bday-vip-img');
            if(newEff){
              if(!existingImg){
                var vipImg=document.createElement('img');
                vipImg.src='./VIP.png';vipImg.className='bday-vip-img';vipImg.alt='VIP';
                nameSpan.appendChild(vipImg);
              }
            } else {
              if(existingImg)existingImg.remove();
            }
          }
        }
        return;
      }
      // Si hay un minimenu abierto, cerrarlo sin abrir el detalle de B
      var prevCtrl=document.querySelector('.bday-inline-ctrl');
      if(prevCtrl){prevCtrl.remove();return;}
      var b=null;
      if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length){b=BDAYS[idx];}
      if(!b){
        var name=item.dataset.bdayName;
        var day=parseInt(item.dataset.bdayDay,10);
        var month=parseInt(item.dataset.bdayMonth,10);
        for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
        if(!b)b={name:name,day:day,month:month};
      }
      openBdayDetail(b);
    });
  });
  // Clicks en vista "Próximos" → ALARM panel
  document.querySelectorAll('.bday-upcoming-item[data-bday-name]').forEach(function(item){
    item.addEventListener('touchstart',function(){
      _bdLpFired=false;
      var n=item.dataset.bdayName;var dd=parseInt(item.dataset.bdayDay,10);var dm=parseInt(item.dataset.bdayMonth,10);
      var b2=null;
      for(var i2=0;i2<BDAYS.length;i2++){if(BDAYS[i2].name===n&&BDAYS[i2].day===dd&&BDAYS[i2].month===dm){b2=BDAYS[i2];break;}}
      if(!b2)b2={name:n,day:dd,month:dm};
      var _self=item;
      _bdLpTimer=setTimeout(function(){_bdLpTimer=null;_bdLpFired=true;_showBdayInlineCtrl(_self,b2);},500);
    },{passive:true});
    item.addEventListener('touchend',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('touchmove',function(){if(_bdLpTimer){clearTimeout(_bdLpTimer);_bdLpTimer=null;}});
    item.addEventListener('click',function(){
      if(_bdLpFired){_bdLpFired=false;return;}
      var prev=document.querySelector('.bday-inline-ctrl');
      if(prev){prev.remove();return;}
      var name=item.dataset.bdayName;
      var day=parseInt(item.dataset.bdayDay,10);
      var month=parseInt(item.dataset.bdayMonth,10);
      var b=null;
      for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
      if(!b)b={name:name,day:day,month:month};
      openBdayAlarm(b);
    });
  });
  // Export
  var bdExportEl=document.getElementById('bdExport');
  if(bdExportEl)bdExportEl.addEventListener('click',function(){
    if(!BDAYS.length){showToast('No hay cumplea\u00f1os para exportar','error');return;}
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(BDAYS,null,2));
    a.download='cumpleanos.json'; a.click();
  });
  // Import
  var bdImportEl=document.getElementById('bdImport');
  if(bdImportEl)bdImportEl.addEventListener('click',function(){document.getElementById('bdImportFile').click();});
  var bdImportFileEl=document.getElementById('bdImportFile');
  if(bdImportFileEl)bdImportFileEl.addEventListener('change',function(ev){
    var f=ev.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(e){
      try{
        var arr=JSON.parse(e.target.result);
        if(!Array.isArray(arr))throw new Error('not array');
        BDAYS=arr;
        localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
        syncVipBdaysToEvents();
        showToast('Cumplea\u00f1os importados: '+BDAYS.length,'success');
        updateBdayBtn(); refreshBday();
      }catch(err){showToast('Error al importar el archivo','error');}
    };
    r.readAsText(f);
  });
}
