/* ============================================================
   BIRTHDAYS — Calendario de cumpleaños
   ============================================================ */

var BDAY_STORAGE_KEY='excelia-bdays-v1';
var BDAY_YEAR=new Date().getFullYear(), BDAY_MONTH=new Date().getMonth(), BDAY_VIEW='upcoming';
var BDAY_EDIT=null;
var BDAY_SEARCH='';
var BDAY_FILTER_VIP=false;
var BDAY_EDIT_VIP=false;

// Estado de alarmas configuradas para cumpleaños
var BDAY_ALARM_SET_KEY='excelia-bday-alarm-set';
var BDAY_ALARM_SET=(function(){try{return JSON.parse(localStorage.getItem(BDAY_ALARM_SET_KEY)||'{}');}catch(e){return {};}})();
var BDAY_ALARM_COUNT_KEY='excelia-bday-alarm-count';
var BDAY_ALARM_COUNT=(function(){var v=localStorage.getItem(BDAY_ALARM_COUNT_KEY);return(v==='1'?1:2);})();

// Paleta de 10 colores rotativos
var BDAY_PALETTE=['#6c8cff','#34d399','#fb923c','#ff6b6b','#c084fc','#fbbf24','#38bdf8','#f472b6','#a3e635','#fb7185'];

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
  var btn=document.getElementById('bdayBtn');if(!btn)return;
  if(hasUpcomingBday()&&BDAYS.length)btn.classList.add('bday-active');
  else btn.classList.remove('bday-active');
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
      h+='<div class="'+cls+'">';
      h+='<div class="bday-num">'+d.getDate()+'</div>';
      bds.forEach(function(b){
        var color=getBdayColor(b);
        var sn=shortName(tc(b.name));
        var bidx=BDAYS.indexOf(b);
        var vipCls=b.vip?' bday-badge-vip':'';
        h+='<div class="bday-badge'+vipCls+'" data-bday-idx="'+bidx+'" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'" style="background:'+color+'22;color:'+color+';border-color:'+color+'" title="'+bdName(b.name)+(b.vip?' \u2b50':'')+'">'+escHtml(sn)+'</div>';
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
  var h='<div class="bday-vip-ctrl-bar">';
  h+='<label class="bday-vip-filter-lbl"><input type="checkbox" id="bdFilterVip"'+(BDAY_FILTER_VIP?' checked':'')+' style="accent-color:#fbbf24"> Filtrar VIPs <img src="./VIP.png" class="bday-vip-img" alt="VIP" style="width:18px;height:auto;vertical-align:middle;margin-left:3px"></label>';
  h+='<button class="bday-vip-edit-btn'+(BDAY_EDIT_VIP?' active':'')+'" id="bdEditVip">'+(BDAY_EDIT_VIP?'\u2713 Listo':'Editar VIPs')+'</button>';
  h+='</div>';
  h+='<div class="bday-search-wrap"><input class="bday-search-input" id="bdSearch" type="text" placeholder="Buscar persona\u2026" value="'+escHtml(BDAY_SEARCH)+'"></div>';
  var byM=[];for(var m=0;m<12;m++)byM.push([]);
  BDAYS.forEach(function(b){if(b.month>=1&&b.month<=12)byM[b.month-1].push(b);});
  byM.forEach(function(list,m){
    var filtered=BDAY_FILTER_VIP?list.filter(function(b){return !!b.vip;}):list;
    if(!filtered.length)return;
    filtered.sort(function(a,b){return a.day-b.day;});
    h+='<div class="sy-section bday-month-section"><div class="bday-month-hdr">'+MN[m]+'</div>';
    filtered.forEach(function(b){
      var dl=daysUntil(b.month,b.day);
      var lbl=dl===0?'\u00a1Hoy!':dl===1?'Ma\u00f1ana':'en '+dl+'d';
      var cls='bday-list-left'+(dl===0?' today-lbl':dl<=7?' near':'');
      var color=getBdayColor(b);
      var sname=escHtml(b.name.toLowerCase());
      var isVip=!!b.vip;
      var lidx=BDAYS.indexOf(b);
      var editCls=BDAY_EDIT_VIP?(isVip?' bday-list-vip-active':' bday-list-vip-dim'):'';
      var vipStar=(!BDAY_EDIT_VIP&&isVip)?' <img src="./VIP.png" class="bday-vip-img" alt="VIP">':'';
      var chkHtml=BDAY_EDIT_VIP?'<input type="checkbox" class="bday-vip-chk" data-bday-idx="'+lidx+'"'+(isVip?' checked':'')+' style="accent-color:#fbbf24;flex-shrink:0;cursor:pointer;width:16px;height:16px">':'';
      h+='<div class="bday-list-item'+editCls+'" data-bday-idx="'+lidx+'" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'" data-sname="'+sname+'">';
      h+=chkHtml;
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
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='upcoming'?' active':'')+'" id="bdViewUpcoming">Pr\u00f3ximos</button>';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='cal'?' active':'')+'" id="bdViewCal">Calendario</button>';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='list'?' active':'')+'" id="bdViewList">Por meses</button>';
  h+='</div>';
  // SY-HEADER con clase with-tabs (nivel 3)
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="bdBack">&#8592;</button>';
  if(!isUpcoming){
    h+='<div class="sy-year-nav"><button class="sy-nav" id="bdPrev">&#9664;</button>';
    h+='<div class="sy-year">'+MN[BDAY_MONTH]+' '+BDAY_YEAR+'</div>';
    h+='<button class="sy-nav" id="bdNext">&#9654;</button></div>';
    h+='<button class="today-btn" id="bdToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  } else {
    h+='<div style="flex:1;text-align:center;font-size:.9rem;font-weight:600">Pr\u00f3ximos cumplea\u00f1os</div>';
    h+='<button class="bday-add-btn" id="bdAdd">+ A\u00f1adir</button>';
  }
  h+='</div>';
  h+='<div class="sy-body">';
  if(BDAY_VIEW==='upcoming'){
    h+=renderBdayUpcoming();
  } else if(BDAY_VIEW==='cal'){
    if(!BDAYS.length)h+='<div class="sy-note">No hay cumplea\u00f1os cargados.</div>';
    else h+=renderBdayCalMonth();
  } else {
    h+=renderBdayList();
  }
  if(!isUpcoming){
    h+='<button class="bday-io-btn" id="bdAdd" style="margin-top:0">+ A\u00f1adir cumplea\u00f1os</button>';
  }
  h+='<div class="bday-io-row">';
  h+='<button class="bday-io-btn" id="bdExport">&#8595; Exportar</button>';
  h+='<button class="bday-io-btn" id="bdImport">&#8593; Importar JSON</button>';
  h+='<input type="file" id="bdImportFile" accept=".json" style="display:none">';
  h+='</div>';
  h+='</div>';
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
  h+='<div class="bd-alarm-title">&#128276; Alarma — '+(b.vip?'\u2b50 ':'')+bdName(b.name)+'</div>';
  h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="bd-alarm-info" style="border-color:'+color+'44;background:'+color+'11">';
  h+='<div class="bd-alarm-name" style="color:'+color+'">'+(b.vip?'\u2b50 ':'')+bdName(b.name)+'</div>';
  h+='<div class="bd-alarm-date">'+b.day+' de '+MN[b.month-1]+' \u00b7 '+lbl+'</div>';
  h+='</div>';
  // Alarm set badge
  if(isSet){
    h+='<div class="bd-alarm-set-badge">&#128276;&#10003; Alarma ya marcada como configurada<button class="bd-alarm-unmark-btn" id="bdAlarmUnmark">Quitar</button></div>';
  }
  // Count toggle
  h+='<div class="bd-alarm-count-row">';
  h+='<button class="bd-alarm-count-btn'+(cnt===1?' active':'')+'" data-cnt="1" id="bdAlarmCount1">1 alarma</button>';
  h+='<button class="bd-alarm-count-btn'+(cnt===2?' active':'')+'" data-cnt="2" id="bdAlarmCount2">2 alarmas</button>';
  h+='</div>';
  // VIP toggle
  h+='<div class="bd-alarm-vip-row">';
  h+='<label class="bd-alarm-vip-lbl"><input type="checkbox" id="bdAlarmVip"'+(b.vip?' checked':'')+' style="accent-color:#fbbf24;width:16px;height:16px"> \u2b50 VIP</label>';
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
  h+='<div class="bd-alarm-time"><input id="bdAlarmH2" type="number" min="0" max="23" value="9"><span class="bd-alarm-time-sep">:</span><input id="bdAlarmM2" type="number" min="0" max="59" value="00"></div>';
  h+='</div>';
  h+='</div>';
  // Action buttons
  h+='<div class="ev-form-actions">';
  h+='<button class="ev-btn primary" id="bdAlarmCreate">&#128276; Crear alarma'+(cnt===2?'s':'')+'</button>';
  h+='<button class="ev-btn cancel" id="bdAlarmMark">'+(isSet?'&#10003; Marcada':'&#10003; Marcar config.')+'</button>';
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
function renderBdayForm(b){
  var isEdit=!!b;
  var name=isEdit?b.name:'';
  var day=isEdit?b.day:'';
  var month=isEdit?b.month:1;
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
  h+='<label class="ev-toggle-label" for="bdFVip">\u2b50 VIP (alarma prioritaria + sync eventos)</label>';
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
function openBdayForm(b){
  BDAY_EDIT=b||null;
  var ov=document.getElementById('bdayOverlay');
  var wrap=document.createElement('div');wrap.id='bdFWrap';
  wrap.innerHTML=renderBdayForm(b);
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
  ov.style.display='block';
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
  document.getElementById('bdBack').addEventListener('click',function(){
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
  document.getElementById('bdViewUpcoming').addEventListener('click',function(){BDAY_SEARCH='';BDAY_FILTER_VIP=false;BDAY_EDIT_VIP=false;BDAY_VIEW='upcoming';refreshBday();});
  document.getElementById('bdViewCal').addEventListener('click',function(){BDAY_SEARCH='';BDAY_FILTER_VIP=false;BDAY_EDIT_VIP=false;BDAY_VIEW='cal';refreshBday();});
  document.getElementById('bdViewList').addEventListener('click',function(){BDAY_VIEW='list';refreshBday();});
  // Filter VIPs toggle
  var filterVipEl=document.getElementById('bdFilterVip');
  if(filterVipEl)filterVipEl.addEventListener('change',function(){
    BDAY_FILTER_VIP=this.checked;BDAY_SEARCH='';refreshBday();
  });
  // Edit VIPs toggle
  var editVipEl=document.getElementById('bdEditVip');
  if(editVipEl)editVipEl.addEventListener('click',function(){
    BDAY_EDIT_VIP=!BDAY_EDIT_VIP;refreshBday();
  });
  // VIP checkboxes (edit mode)
  document.querySelectorAll('.bday-vip-chk').forEach(function(chk){
    chk.addEventListener('change',function(e){
      e.stopPropagation();
      var idx=parseInt(chk.dataset.bdayIdx,10);
      if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length){
        if(chk.checked)BDAYS[idx].vip=true;else delete BDAYS[idx].vip;
        localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
        syncVipBdaysToEvents();updateBdayBtn();
        refreshBday();
      }
    });
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
    item.addEventListener('click',function(e){
      e.stopPropagation();
      var idx=parseInt(item.dataset.bdayIdx,10);
      if(BDAY_EDIT_VIP){
        // En modo edición: clic en cualquier parte del ítem toglea VIP
        if(!isNaN(idx)&&idx>=0&&idx<BDAYS.length){
          if(BDAYS[idx].vip)delete BDAYS[idx].vip;else BDAYS[idx].vip=true;
          localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
          syncVipBdaysToEvents();updateBdayBtn();
          refreshBday();
        }
        return;
      }
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
    item.addEventListener('click',function(){
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
  document.getElementById('bdExport').addEventListener('click',function(){
    if(!BDAYS.length){showToast('No hay cumplea\u00f1os para exportar','error');return;}
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(BDAYS,null,2));
    a.download='cumpleanos.json'; a.click();
  });
  // Import
  document.getElementById('bdImport').addEventListener('click',function(){document.getElementById('bdImportFile').click();});
  document.getElementById('bdImportFile').addEventListener('change',function(ev){
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
