/* ============================================================
   EVENTS — Ventana de eventos y notas
   ============================================================ */

var EV_STORAGE_KEY = 'excelia-events-v1';
var EV_YEAR = new Date().getFullYear();
var EV_MONTH = new Date().getMonth();
var EV_VIEW = 'cal';  // 'cal' | 'months' | 'upcoming' | 'annual'
var EV_EDIT = null;
var EV_FORM_CONTAINER = null;  // overlay donde se renderiza el formulario (null = eventsOverlay)
var EV_EDIT_MODE = false;
var EV_BRIGHT_PAST = false;
var EV_ANNUAL_VIEW = 'puentes'; // 'puentes' | 'fiestas'
var EV_ANNUAL_FILTER_HIDDEN = []; // type names hidden from annual calendar
var EV_PREV_VIEW = null;       // para volver al anual al pulsar ←
var EV_QUAD_YEAR = new Date().getFullYear();  // año de inicio del bloque 4 meses
var EV_QUAD_MONTH = new Date().getMonth();    // mes de inicio del bloque 4 meses (0-based)
var EV_LIST_SUBTAB = 'months'; // 'months' | 'types'
var EV_TYPES_FILTER = 'all';   // 'all' | nombre de tipo
var EV_TYPES_PAST = true;      // excluir eventos pasados en Por Tipos (por defecto)
var EV_COLORS = ['#38bdf8','#1d4ed8','#34d399','#fb923c','#ff6b6b','#c084fc','#a3e635'];
var EV_COLOR_GRID=[
  '#ff6b6b','#ff8787','#e64980','#e879a8','#c084fc','#9775fa',
  '#7950f2','#6741d9','#4c6ef5','#1d4ed8','#38bdf8','#6c8cff',
  '#22d3ee','#4ecdc4','#34d399','#56c596','#a3e635','#82c91e',
  '#fbbf24','#f0b45c','#fb923c','#ff922b','#fd7e14','#e8590c',
  '#f06595','#da77f2','#748ffc','#66d9e8','#63e6be','#ffe066',
  '#e03131','#f76707','#ae3ec9','#3b5bdb','#0ca678','#845ef7',
  '#d6336c','#f08c00','#5f3dc4','#1971c2','#099268','#5c940d',
  '#868e96','#adb5bd','#dee2e6','#f8f9fa','#495057','#212529'
];
var EV_COLOR_TYPES = {
  '#38bdf8':'Viaje',
  '#6c8cff':'Viaje',  // compat con eventos anteriores
  '#1d4ed8':'Asturias',
  '#34d399':'Rec. Gestiones',
  '#fb923c':'Plan/Quedada',
  '#ff6b6b':'Otros',
  '#c084fc':'Otros',
  '#a3e635':'Otros',
  '#fbbf24':'Cumplea\u00f1os VIP'
};

// Paleta variada para viajes (determinista según id del evento)
var _VIAJE_BLUES=['#e879a8','#f0b45c','#4ecdc4','#a18cd1','#56c596'];
function evTravelColor(evId){
  var h=0,id=String(evId||'');
  for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))&0x7fffffff;
  return _VIAJE_BLUES[h%_VIAJE_BLUES.length];
}
// Obtiene el tipo de un evento: ev.type (v111+) o fallback a EV_COLOR_TYPES[color]
function getEvType(ev){
  var t=ev.type||EV_COLOR_TYPES[ev.color]||'Otros';
  if(t==='Festivo'||t==='Puente')t='Otros';
  return t;
}
// ¿Es viaje/asturias? (se renderizan siempre como barra, incluso 1 día)
function isEvBarAlways(ev){
  var t=getEvType(ev);
  return t==='Viaje'||t==='Asturias';
}
// Devuelve el color de visualización (viajes → azul único por evento, resto → color guardado)
function getEvDisplayColor(ev){
  if(!ev)return'#888';
  /* Si el evento es Viaje y conserva un color personalizado distinto al base de Viaje,
     lo respetamos. Sólo los colores base (#38bdf8/#6c8cff) se reemplazan por el azul
     determinista por hash, para que cada viaje tenga matiz distinto. */
  if(ev.color==='#38bdf8'||ev.color==='#6c8cff')return evTravelColor(ev.id);
  return ev.color;
}

// Render color picker reutilizable (paleta 6×6 + color libre + preview)
function _renderColorPicker(selHex,_unusedShowLock,_unusedIsLocked,prefix){
  prefix=prefix||'evCp';
  var h='<div class="ev-color-picker" id="'+prefix+'Wrap">';
  h+='<div class="ev-color-grid">';
  for(var i=0;i<EV_COLOR_GRID.length;i++){
    var c=EV_COLOR_GRID[i];
    var sel=c.toLowerCase()===selHex.toLowerCase()?' selected':'';
    h+='<div class="ev-color-dot'+sel+'" data-hex="'+c+'" style="background:'+c+';border-color:'+c+'"></div>';
  }
  h+='</div>';
  h+='<div class="ev-color-custom-row">';
  h+='<input type="color" class="ev-color-native" id="'+prefix+'Native" value="'+selHex+'">';
  h+='<input type="text" class="ev-color-hex-input" id="'+prefix+'Hex" value="'+selHex+'" maxlength="7" spellcheck="false">';
  h+='</div>';
  h+='<div class="ev-color-preview-row">';
  h+='<div class="ev-color-preview-item"><span>Borde</span><div class="ev-color-preview-swatch" style="background:'+selHex+'"></div></div>';
  h+='<div class="ev-color-preview-item"><span>Relleno</span><div class="ev-color-preview-swatch" style="background:'+fakeTrans(selHex,0.65)+'"></div></div>';
  h+='<div class="ev-color-preview-hex" id="'+prefix+'Code">'+selHex+'</div>';
  h+='</div>';
  h+='</div>';
  return h;
}
// Bind color picker events; returns {getColor}
function _bindColorPicker(container,prefix,onChange){
  prefix=prefix||'evCp';
  var wrap=container.querySelector('#'+prefix+'Wrap');
  if(!wrap)return{getColor:function(){return'#888';}};
  var current=wrap.querySelector('.ev-color-dot.selected');
  var curHex=current?current.dataset.hex:'#38bdf8';
  function updatePreview(hex){
    curHex=hex;
    var dots=wrap.querySelectorAll('.ev-color-dot');
    for(var i=0;i<dots.length;i++){
      if(dots[i].dataset.hex.toLowerCase()===hex.toLowerCase())dots[i].classList.add('selected');
      else dots[i].classList.remove('selected');
    }
    var native=container.querySelector('#'+prefix+'Native');
    var hexInput=container.querySelector('#'+prefix+'Hex');
    var code=container.querySelector('#'+prefix+'Code');
    var previews=wrap.querySelectorAll('.ev-color-preview-swatch');
    if(native)native.value=hex;
    if(hexInput)hexInput.value=hex;
    if(code)code.textContent=hex;
    if(previews[0])previews[0].style.background=hex;
    if(previews[1])previews[1].style.background=fakeTrans(hex,0.65);
    if(onChange)onChange(hex);
  }
  wrap.addEventListener('click',function(e){
    var dot=e.target.closest('.ev-color-dot');
    if(dot&&dot.dataset.hex){updatePreview(dot.dataset.hex);}
  });
  var native=container.querySelector('#'+prefix+'Native');
  if(native)native.addEventListener('input',function(){updatePreview(native.value);});
  var hexInput=container.querySelector('#'+prefix+'Hex');
  if(hexInput)hexInput.addEventListener('change',function(){
    var v=hexInput.value.trim();
    if(/^#[0-9a-fA-F]{6}$/.test(v))updatePreview(v);
    else hexInput.value=curHex;
  });
  return{
    getColor:function(){return curHex;}
  };
}

var EVENTS = (function(){
  try{
    var stored=localStorage.getItem(EV_STORAGE_KEY);
    if(stored){var arr=JSON.parse(stored);if(Array.isArray(arr)){
      // Migrar eventos amarillos de 'Otros' → lima (#a3e635). VIP bdays mantienen amarillo.
      // Migrar nombres antiguos de tipo: 'Recordatorio de Gestiones' → 'Rec. Gestiones'; 'Planes y Quedadas' → 'Plan/Quedada'
      var changed=false;
      arr.forEach(function(ev){
        if(ev.color==='#fbbf24'&&(!ev.id||ev.id.indexOf('ev-bday-vip-')!==0)){ev.color='#a3e635';changed=true;}
        if(ev.type==='Recordatorio de Gestiones'){ev.type='Rec. Gestiones';changed=true;}
        if(ev.type==='Planes y Quedadas'){ev.type='Plan/Quedada';changed=true;}
      });
      if(changed)try{localStorage.setItem(EV_STORAGE_KEY,JSON.stringify(arr));}catch(e){}
      return arr;
    }}
  }catch(e){}
  return [];
})();

function saveEvents(){
  localStorage.setItem(EV_STORAGE_KEY,JSON.stringify(EVENTS));
}

/* ── Estado de alarmas por evento (próximos) ── */
var EV_ALARM_SK='excelia-ev-alarm-v1';
var EV_ALARMS_SET={};
function loadEvAlarms(){try{var r=localStorage.getItem(EV_ALARM_SK);if(r)EV_ALARMS_SET=JSON.parse(r);}catch(e){}}
function saveEvAlarms(){try{localStorage.setItem(EV_ALARM_SK,JSON.stringify(EV_ALARMS_SET));}catch(e){}}
function _findBdayByEvId(evId){
  if(evId.indexOf('ev-bday-vip-')!==0||typeof BDAYS==='undefined')return null;
  var _p=evId.replace('ev-bday-vip-','').split('-');
  var _bd=parseInt(_p[0],10),_bm=parseInt(_p[1],10),_sk=_p.slice(2).join('-');
  for(var _i=0;_i<BDAYS.length;_i++){
    var b=BDAYS[_i];if(!b.vip||b.day!==_bd||b.month!==_bm)continue;
    if(b.name.replace(/[^a-z0-9]/gi,'_').toLowerCase()===_sk)return b;
  }
  /* fallback: day+month only */
  for(var _i=0;_i<BDAYS.length;_i++){if(BDAYS[_i].vip&&BDAYS[_i].day===_bd&&BDAYS[_i].month===_bm)return BDAYS[_i];}
  return null;
}
function isEvAlarmSet(evId){
  if(evId.indexOf('ev-bday-vip-')===0&&typeof isBdayAlarmSet==='function'){
    var b=_findBdayByEvId(evId);if(b)return isBdayAlarmSet(b);
  }
  return !!EV_ALARMS_SET[evId];
}
function setEvAlarmState(evId,bool){
  if(evId.indexOf('ev-bday-vip-')===0&&typeof setBdayAlarmState==='function'){
    var b=_findBdayByEvId(evId);if(b){setBdayAlarmState(b,bool);return;}
  }
  if(bool)EV_ALARMS_SET[evId]=true;else delete EV_ALARMS_SET[evId];saveEvAlarms();
}

function evDk(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

/* ── Lógica de repetición ────────────────────────────────── */
function eventOccursOn(ev,ds){
  /* Eventos "Otros" con días específicos no consecutivos: solo coincide
     si la fecha está exactamente en el array ev.dates */
  if(ev.dates&&Array.isArray(ev.dates)&&ev.dates.length){
    return ev.dates.indexOf(ds)!==-1;
  }
  var d=new Date(ds+'T00:00:00');
  var start=new Date(ev.start+'T00:00:00');
  var end=ev.end?new Date(ev.end+'T00:00:00'):new Date(start);
  var span=Math.round((end-start)/86400000);
  if(!ev.repeat)return d>=start&&d<=end;
  if(d<start)return false;
  var r=ev.repeat;
  if(r.type==='weekly'){
    for(var w=0;w<=span;w++){
      var oS=new Date(d);oS.setDate(oS.getDate()-w);
      if(oS>=start&&r.weekDays.indexOf(oS.getDay())!==-1)return true;
    }
    return false;
  }
  if(r.type==='monthly-date'){
    var oS=new Date(d.getFullYear(),d.getMonth(),start.getDate());
    if(isNaN(oS.getTime())||oS<start)return false;
    var oE=new Date(oS);oE.setDate(oE.getDate()+span);
    return d>=oS&&d<=oE;
  }
  if(r.type==='monthly-first'){
    var oS=new Date(d.getFullYear(),d.getMonth(),1);
    if(oS<start)return false;
    var oE=new Date(oS);oE.setDate(oE.getDate()+span);
    return d>=oS&&d<=oE;
  }
  if(r.type==='yearly'){
    var oS=new Date(d.getFullYear(),start.getMonth(),start.getDate());
    if(isNaN(oS.getTime())||oS<start)return false;
    var oE=new Date(oS);oE.setDate(oE.getDate()+span);
    return d>=oS&&d<=oE;
  }
  return false;
}

function getEventsOn(ds){
  return EVENTS.filter(function(ev){return eventOccursOn(ev,ds);});
}

function hasUpcomingEvent(){
  var t=new Date();t.setHours(0,0,0,0);
  for(var i=0;i<7;i++){
    var d=new Date(t);d.setDate(d.getDate()+i);
    if(getEventsOn(evDk(d)).length)return true;
  }
  return false;
}

function updateEventsBtn(){
  var isActive=hasUpcomingEvent()&&EVENTS.length>0;
  var homeBtn=document.getElementById('eventsBtn');
  if(homeBtn){if(isActive)homeBtn.classList.add('events-active');else homeBtn.classList.remove('events-active');}
  document.querySelectorAll('.nav-bar-btn[data-nav="events"]').forEach(function(b){
    if(isActive)b.classList.add('events-active');else b.classList.remove('events-active');
  });
}

/* ── Helper: color único y estable por evento (hash del ID) ── */
function evUniqueColor(ev){
  var hash=0;
  for(var i=0;i<ev.id.length;i++){hash=(hash*31+ev.id.charCodeAt(i))&0xffff;}
  var hue=Math.round((hash*137.508)%360);
  return 'hsl('+hue+',82%,62%)';
}
/* ── Helper: marcador puntual para calendarios anual/quad ──
   Sustituye al antiguo .ev-annual-dot. Usa la forma del evento si existe
   (solo eventos "Otros" pueden tener shape personalizada).
   Shapes válidas: circle | square | diamond | x-thick | x-thin | rounded.
   Defaults: dot circular (= comportamiento previo). */
function evMarkerHtml(ev,pastClass,sizeClass){
  var color=getEvDisplayColor(ev);
  var shape=ev.shape||'circle';
  var pmk=pastClass||'';
  var sz=sizeClass?(' '+sizeClass):'';
  /* X-shapes se renderizan con SVG de doble stroke (negro debajo + color encima)
     para que el borde sea uniforme y los dos brazos no muestren dobles bordes. */
  if(shape==='x-thick'||shape==='x-thin'){
    var swOut=shape==='x-thick'?9:5.5;
    var swIn =shape==='x-thick'?5:2.6;
    var svg='<svg viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet">'
      +'<path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="#000" stroke-width="'+swOut+'" stroke-linecap="round" fill="none"/>'
      +'<path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="'+color+'" stroke-width="'+swIn+'" stroke-linecap="round" fill="none"/>'
      +'</svg>';
    return '<span class="ev-annual-marker ev-shape-'+shape+pmk+sz+'" data-id="'+ev.id+'">'+svg+'</span>';
  }
  return '<span class="ev-annual-marker ev-shape-'+shape+pmk+sz+'" data-id="'+ev.id+'" style="color:'+color+'"></span>';
}
/* ── Helper: relleno suave y estable por evento ── */
function evSoftFillColor(ev){
  var hash=0;
  for(var i=0;i<ev.id.length;i++){hash=(hash*31+ev.id.charCodeAt(i))&0xffff;}
  var hue=Math.round((hash*137.508)%360);
  return 'hsla('+hue+',50%,65%,.22)';
}

/* ── Render: calendario mensual ─────────────────────────── */
function renderEvCalMonth(){
  var today=new Date();today.setHours(0,0,0,0);
  var puenteMap={};
  if(typeof computePuentes==='function'){
    computePuentes(EV_YEAR).puentes.forEach(function(seq){
      seq.forEach(function(x){puenteMap[evDk(x.date)]=true;});
    });
  }
  // Multi-day events (non-repeating, end strictly after start OR viaje/asturias always as bar)
  var multiEvs=EVENTS.filter(function(ev){return !ev.repeat&&!(ev.dates&&ev.dates.length)&&ev.end&&(ev.end>ev.start||isEvBarAlways(ev));});
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  var DN7=['L','M','X','J','V','S','D'];
  var h='<div class="ev-week-hdr">';
  DN7.forEach(function(n){h+='<div>'+n+'</div>';});
  h+='</div>';
  var first=new Date(EV_YEAR,EV_MONTH,1);
  var last=new Date(EV_YEAR,EV_MONTH+1,0);
  var cur=new Date(first);
  var dow=cur.getDay();var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    // Build week days array
    var wk=[];
    for(var wi=0;wi<7;wi++){wk.push(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()+wi));}
    var wStart=wk[0],wEnd=wk[6];
    // Find intersecting multi-day events
    var wMulti=[];
    multiEvs.forEach(function(ev){
      var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
      if(ee<wStart||es>wEnd)return;
      var cs=Math.max(0,Math.round((es-wStart)/86400000));
      var ce=Math.min(6,Math.round((ee-wStart)/86400000));
      wMulti.push({ev:ev,cs:cs,ce:ce,starts:es>=wStart,ends:ee<=wEnd,row:-1});
    });
    // Greedy row assignment (max 3)
    var rowOcc=[[],[],[]];
    wMulti.forEach(function(it){
      for(var r=0;r<3;r++){
        var ok=true;
        for(var j=0;j<rowOcc[r].length;j++){if(it.cs<=rowOcc[r][j][1]&&it.ce>=rowOcc[r][j][0]){ok=false;break;}}
        if(ok){it.row=r;rowOcc[r].push([it.cs,it.ce]);break;}
      }
    });
    var activeRows=0;wMulti.forEach(function(it){if(it.row>=0)activeRows=Math.max(activeRows,it.row+1);});
    // Pre-compute which columns are in-month (for bar dimming)
    var inMCols=[];for(var ci=0;ci<7;ci++){inMCols.push(wk[ci].getMonth()===EV_MONTH);}
    h+='<div class="ev-week-outer">';
    h+='<div class="ev-week-grid">';
    var bspanStart=-1,bspans=[];
    for(var di=0;di<7;di++){
      var d=wk[di];
      var inM=d.getMonth()===EV_MONTH;
      var isTod=d.getTime()===today.getTime();
      var past=inM&&d<today;
      var ds=evDk(d);
      var evs=getEventsOn(ds);
      var edow=d.getDay();
      var dt=inM?dayT(d):'';
      var inPuente=inM&&puenteMap[ds];
      // Rastrear tramos de días puente para perímetro
      if(inPuente){if(bspanStart<0)bspanStart=di;}
      else{if(bspanStart>=0){bspans.push({s:bspanStart,e:di-1});bspanStart=-1;}}
      var cls='ev-cell'+(inM?'':' out-m')+(isTod?' today-ev':'')+(past?' past-cal-day':'')+(edow===0||edow===6?' weekend':'')+(dt&&dt!=='normal'?' ev-day-'+dt:'')+(inPuente?' ev-puente':'');
      h+='<div class="'+cls+'" data-ds="'+ds+'"><div class="ev-num">'+d.getDate()+'</div>';
      h+='<div class="ev-badges-wrap">';
      evs.forEach(function(ev){
        if(multiIds[ev.id])return;
        var _isVipBday=ev.id.indexOf('ev-bday-vip-')===0;
        /* Otros con shape personalizada: renderizar como marker en lugar del badge pill */
        if(!_isVipBday && ev.shape && (ev.type==='Otros' || (typeof getEvType==='function' && getEvType(ev)==='Otros'))){
          h+=evMarkerHtml(ev, past?' past-marker':'', 'ev-marker-lg');
          return;
        }
        var _rawName=ev.title.replace(/^\u2b50\s*/,'').replace(/^Cumple\s+/,'');
        var _bTitle=_isVipBday?escHtml(_rawName.split(/\s+/)[0]):escHtml(ev.title);
        var _bStyle=_isVipBday
          ?'color:#fff;border-color:#fbbf24;border-width:2px;background:#fbbf24cc;box-shadow:0 0 8px rgba(251,191,36,.55)'
          :'color:#fff;border-color:'+ev.color+';background:'+ev.color+'cc';
        h+='<div class="ev-badge" data-id="'+ev.id+'" style="'+_bStyle+'"></div>';
      });
      h+='</div>';
      h+='</div>';
    }
    if(bspanStart>=0)bspans.push({s:bspanStart,e:6});
    // Perímetro puente: sin borde donde el puente continúa en otra semana
    var nextMonP=new Date(wk[6]);nextMonP.setDate(nextMonP.getDate()+1);
    var prevSunP=new Date(wk[0]);prevSunP.setDate(prevSunP.getDate()-1);
    bspans.forEach(function(sp){
      var noR=sp.e===6&&puenteMap[evDk(nextMonP)];
      var noL=sp.s===0&&puenteMap[evDk(prevSunP)];
      var bsty='grid-column:'+(sp.s+1)+'/'+(sp.e+2)+';grid-row:1;';
      if(noL)bsty+='border-left:none;border-top-left-radius:0;border-bottom-left-radius:0;';
      if(noR)bsty+='border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;';
      h+='<div class="ev-puente-perimeter" style="'+bsty+'"></div>';
    });
    h+='</div>'; // ev-week-grid
    if(activeRows>0){
      h+='<div class="ev-bars-row">';
      wMulti.forEach(function(it){
        if(it.row<0)return;
        var ev=it.ev;
        var sc=it.starts&&it.ends?'':it.starts?' starts':it.ends?' ends':' continues';
        var showT=it.starts||(it.cs===0);
        // Dim bars that fall entirely in out-of-month columns
        var hasInM=false;for(var ci=it.cs;ci<=it.ce;ci++){if(inMCols[ci])hasInM=true;}
        var _dc=getEvDisplayColor(ev);
        var _pastBar=wk[it.ce]<today?' past-bar':'';
        h+='<div class="ev-multi-bar'+sc+_pastBar+'" data-id="'+ev.id+'"'
          +' style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';border:1.5px solid '+_dc+';background:'+fakeTrans(_dc,0.65)+';color:#fff'+(hasInM?'':';opacity:.35')+'">'
          +(showT?escHtml(ev.title):'')+'</div>';
      });
      h+='</div>';
    }
    h+='</div>'; // ev-week-outer
    cur.setDate(cur.getDate()+7);
  }
  return h;
}

/* ── Render: lista de eventos ───────────────────────────── */
function renderEvList(){
  if(!EVENTS.length)return '<div class="sy-note">No hay eventos. Pulsa "+ A\u00f1adir" para crear uno.</div>';
  var sorted=EVENTS.slice().sort(function(a,b){return a.start<b.start?-1:a.start>b.start?1:0;});
  var h='';
  sorted.forEach(function(ev){
    h+=renderEvListItem(ev);
  });
  return h;
}

/* ── Render: por meses ──────────────────────────────────── */
function renderEvByMonths(){
  if(!EVENTS.length)return '<div class="sy-note">No hay eventos. Pulsa "+ A\u00f1adir" para crear uno.</div>';
  var byM=[];for(var m=0;m<12;m++)byM.push([]);
  EVENTS.forEach(function(ev){
    var s=new Date(ev.start+'T00:00:00');
    byM[s.getMonth()].push(ev);
  });
  var h='';
  byM.forEach(function(list,m){
    if(!list.length)return;
    list.sort(function(a,b){return a.start<b.start?-1:1;});
    h+='<div class="sy-section"><div class="bday-month-hdr">'+MN[m]+'</div>';
    list.forEach(function(ev){h+=renderEvListItem(ev);});
    h+='</div>';
  });
  if(!h)h='<div class="sy-note">No hay eventos con fecha definida.</div>';
  return h;
}

function renderEvListItem(ev){
  var s=new Date(ev.start+'T00:00:00');
  var e2=ev.end&&ev.end!==ev.start?new Date(ev.end+'T00:00:00'):null;
  var _wn=['Dom','Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b'];
  var fd2=function(dd){return _wn[dd.getDay()]+' '+String(dd.getDate()).padStart(2,'0')+'/'+String(dd.getMonth()+1).padStart(2,'0')+'/'+dd.getFullYear();};
  var dateStr=fd2(s);
  if(e2)dateStr+=' &#8212; '+fd2(e2);
  var repeatStr='';
  if(ev.repeat){
    var rt=ev.repeat.type;
    if(rt==='weekly'&&ev.repeat.weekDays){
      var wn2=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
      repeatStr=' \u00b7 '+ev.repeat.weekDays.map(function(w){return wn2[w];}).join(', ');
    }else if(rt==='monthly-date'){repeatStr=' \u00b7 Mensual (mismo d\u00eda)';}
    else if(rt==='monthly-first'){repeatStr=' \u00b7 Mensual (d\u00eda 1)';}
    else if(rt==='yearly'){repeatStr=' \u00b7 Anual';}
  }
  var _isVipBdayL=ev.id.indexOf('ev-bday-vip-')===0;
  var _listTitle=_isVipBdayL?('<img src="./VIP.png" class="bday-vip-img" alt="VIP" style="height:1.3em;vertical-align:middle;margin-right:4px">'+escHtml(ev.title.replace(/^\u2b50\s*/,'')))
    :escHtml(ev.title);
  var h='<div class="ev-list-item" data-id="'+ev.id+'">';
  h+='<div class="ev-list-color" style="background:'+ev.color+'"></div>';
  h+='<div class="ev-list-body">';
  h+='<div class="ev-list-title">'+_listTitle+'</div>';
  if(ev.note)h+='<div class="ev-list-note">'+escHtml(ev.note)+'</div>';
  h+='<div class="ev-list-meta">'+getEvType(ev)+' \u00b7 '+dateStr+repeatStr+'</div>';
  h+='</div>';
  h+='<div class="ev-list-actions"><button class="ev-list-btn del" data-id="'+ev.id+'">&#215;</button></div>';
  h+='</div>';
  return h;
}

/* ── Próxima ocurrencia de un evento ────────────────────── */
function getNextOccurrence(ev,today){
  var start=new Date(ev.start+'T00:00:00');
  var end=ev.end?new Date(ev.end+'T00:00:00'):new Date(start);
  var span=Math.round((end-start)/86400000);
  if(!ev.repeat){
    if(end<today)return null;
    return start>=today?start:today;
  }
  var r=ev.repeat;
  if(r.type==='yearly'){
    var t=new Date(today.getFullYear(),start.getMonth(),start.getDate());
    if(isNaN(t.getTime()))return null;
    var te=new Date(t);te.setDate(te.getDate()+span);
    if(te>=today)return t>=today?t:today;
    t=new Date(today.getFullYear()+1,start.getMonth(),start.getDate());
    return isNaN(t.getTime())?null:t;
  }
  if(r.type==='monthly-date'){
    var t=new Date(today.getFullYear(),today.getMonth(),start.getDate());
    if(!isNaN(t.getTime())){
      var te=new Date(t);te.setDate(te.getDate()+span);
      if(te>=today)return t>=today?t:today;
    }
    var nm=today.getMonth()+1,ny=today.getFullYear();
    if(nm>11){nm=0;ny++;}
    return new Date(ny,nm,start.getDate());
  }
  if(r.type==='monthly-first'){
    var t=new Date(today.getFullYear(),today.getMonth(),1);
    var te=new Date(t);te.setDate(te.getDate()+span);
    if(te>=today)return t>=today?t:today;
    var nm=today.getMonth()+1,ny=today.getFullYear();
    if(nm>11){nm=0;ny++;}
    return new Date(ny,nm,1);
  }
  if(r.type==='weekly'&&r.weekDays&&r.weekDays.length){
    for(var i=0;i<7;i++){
      var c=new Date(today);c.setDate(c.getDate()+i);
      if(r.weekDays.indexOf(c.getDay())!==-1)return c;
    }
  }
  return null;
}

/* ── Render: próximos eventos (3 semanas) ───────────────── */
/* VIP bdays: solo si caen en los próximos 7 días */
function evIsoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function _isVipBdayTooFar(ev,firstDate,today){
  if(ev.id.indexOf('ev-bday-vip-')!==0)return false;
  return Math.round((firstDate-today)/86400000)>=7;
}
function renderEvUpcoming(){
  if(!EVENTS.length)return '<div class="sy-note">No hay eventos creados. Pulsa \"+ A\u00f1adir\" para crear uno.</div>';
  var today=new Date();today.setHours(0,0,0,0);
  var wd=today.getDay();var off=wd===0?6:wd-1;
  var wk0=new Date(today);wk0.setDate(wk0.getDate()-off);
  var weekLabels=['Esta semana','Pr\u00f3xima semana','En dos semanas'];
  var _wn=['Dom','Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b'];
  var fd2=function(d){return _wn[d.getDay()]+' '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');};
  function renderEvItem(ev,item,diffToday){
    var type=getEvType(ev);
    var isToday=diffToday===0;
    var lbl=isToday?'Hoy':diffToday===1?'Ma\u00f1ana':diffToday<0?'En curso':('En '+diffToday+'d');
    var lblCls='ev-upcoming-lbl'+(isToday?' today-lbl':diffToday===1?' near':diffToday<0?' ongoing':'');
    var _isVip=ev.id.indexOf('ev-bday-vip-')===0;
    var title=_isVip?('<img src="./VIP.png" class="bday-vip-img" alt="VIP" style="height:1.2em;vertical-align:middle;margin-right:3px">'+escHtml(ev.title.replace(/^\u2b50\s*/,'')))
      :escHtml(ev.title);
    var _bellSet=isEvAlarmSet(ev.id);
    var metaDate=fd2(item.firstDate);
    if(ev.end&&ev.end!==ev.start){var _eD=new Date(ev.end+'T00:00:00');metaDate+=' <span style="font-size:.62rem;opacity:.7">&#8212; '+fd2(_eD)+'</span>';}
    var s='<div class="ev-upcoming-item'+(isToday?' ev-upcoming-today':'')+'" data-id="'+ev.id+'" data-first="'+evIsoDate(item.firstDate)+'">';
    s+='<div class="ev-upcoming-color" style="background:'+getEvDisplayColor(ev)+'"></div>';
    s+='<div class="ev-upcoming-info">';
    s+='<div class="ev-upcoming-title">'+title+'</div>';
    s+='<div class="ev-upcoming-meta">'+type+' \u00b7 '+metaDate+'</div>';
    if(ev.note&&ev.note.trim()&&!_isVip)s+='<div class="ev-upcoming-note">'+escHtml(ev.note.trim())+'</div>';
    s+='</div>';
    s+='<div class="ev-upcoming-right">';
    s+='<span class="ev-upcoming-bell'+(_bellSet?' set':'')+'">&#128276;</span>';
    s+='<div class="'+lblCls+'">'+lbl+'</div>';
    s+='</div>';
    s+='</div>';
    return s;
  }
  /* ── Semanas hacia adelante ── */
  var weeks=[{},{},{}];
  for(var w=0;w<3;w++){
    for(var d=0;d<7;d++){
      var day=new Date(wk0.getTime()+(w*7+d)*86400000);
      var ds=evDk(day);
      var evs=getEventsOn(ds);
      evs.forEach(function(ev){
        if(_isVipBdayTooFar(ev,day,today))return;
        if(!weeks[w][ev.id])weeks[w][ev.id]={ev:ev,firstDate:new Date(day)};
      });
    }
  }
  var todayStr=evDk(today);
  var anyEvents=weeks.some(function(wk){
    return Object.keys(wk).some(function(id){
      var item=wk[id];var ev=item.ev;
      var evEndStr=ev.end&&ev.end!==ev.start?ev.end:ev.start;
      return evEndStr>=todayStr;
    });
  });
  var h='';
  if(!anyEvents){
    var fallbackMap=null,fallbackLabel=null;
    for(var fw=3;fw<53;fw++){
      var fwMap={};
      for(var fd3=0;fd3<7;fd3++){
        var fday=new Date(wk0.getTime()+(fw*7+fd3)*86400000);
        var fds=evDk(fday);
        var fevs=getEventsOn(fds);
        fevs.forEach(function(ev){
          if(ev.id.indexOf('ev-bday-vip-')===0)return;
          if(!fwMap[ev.id])fwMap[ev.id]={ev:ev,firstDate:new Date(fday)};
        });
      }
      if(Object.keys(fwMap).length>0){
        fallbackMap=fwMap;
        var fwStart=new Date(wk0.getTime()+fw*7*86400000);
        var fwEnd=new Date(fwStart);fwEnd.setDate(fwEnd.getDate()+6);
        fallbackLabel='Semana del '+fwStart.getDate()+'/'+(fwStart.getMonth()+1)+' al '+fwEnd.getDate()+'/'+(fwEnd.getMonth()+1);
        break;
      }
    }
    if(!fallbackMap)return '<div class="sy-note">No hay eventos programados.</div>';
    h+='<div class="sy-note" style="margin-bottom:8px">Sin eventos en las pr\u00f3ximas 3 semanas. Primera semana con eventos:</div>';
    var fids=Object.keys(fallbackMap);
    fids.sort(function(a,b){return fallbackMap[a].firstDate-fallbackMap[b].firstDate;});
    h+='<div class="sy-month-sep">'+fallbackLabel+'</div>';
    h+='<div class="ev-upcoming-section">';
    fids.forEach(function(id){
      var item=fallbackMap[id];
      var diffToday=Math.round((item.firstDate-today)/86400000);
      h+=renderEvItem(item.ev,item,diffToday);
    });
    h+='</div>';
    return h;
  }
  weeks.forEach(function(wkMap,wi){
    var ids=Object.keys(wkMap);
    if(!ids.length)return;
    ids.sort(function(a,b){return wkMap[a].firstDate-wkMap[b].firstDate;});
    var secH='';
    ids.forEach(function(id){
      var item=wkMap[id];var ev=item.ev;
      var diffToday=Math.round((item.firstDate-today)/86400000);
      // Skip past single-day events (multi-day events spanning today show as "En curso")
      if(diffToday<0){
        var evEndStr=ev.end&&ev.end!==ev.start?ev.end:ev.start;
        if(evEndStr<todayStr)return;
      }
      secH+=renderEvItem(ev,item,diffToday);
    });
    if(!secH)return;
    h+='<div class="sy-month-sep">'+weekLabels[wi]+'</div>';
    h+='<div class="ev-upcoming-section">'+secH+'</div>';
  });
  return h;
}

/* ── Render: calendario anual ───────────────────────────── */
function renderEvAnnual(){
  var today=new Date();today.setHours(0,0,0,0);
  var puenteMap={},sueltoFestMap={},sueltoVacMap={};
  if(typeof computePuentes==='function'){
    var pData=computePuentes(EV_YEAR);
    pData.puentes.forEach(function(seq){seq.forEach(function(x){puenteMap[evDk(x.date)]=true;});});
    pData.festivosSueltos.forEach(function(dt){sueltoFestMap[evDk(dt)]=true;});
    pData.vacSueltos.forEach(function(dt){sueltoVacMap[evDk(dt)]=true;});
  }
  // Eventos multi-día (sin repetición, end > start) — filtrar por tipos ocultos
  function annEvVisible(ev){
    if(!EV_ANNUAL_FILTER_HIDDEN.length)return true;
    return EV_ANNUAL_FILTER_HIDDEN.indexOf(getEvType(ev))===-1;
  }
  var multiEvs=EVENTS.filter(function(ev){return !ev.repeat&&!(ev.dates&&ev.dates.length)&&ev.end&&(ev.end>ev.start||isEvBarAlways(ev))&&annEvVisible(ev);});
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  var MNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var addMode=EV_EDIT_MODE;
  var h='<div class="ev-annual-grid'+(addMode?' ev-edit-mode':'')+'">';
  for(var m=0;m<12;m++){
    h+='<div class="ev-annual-month" data-month="'+m+'">';
    h+='<div class="ev-annual-mname">'+MNS[m]+'</div>';
    h+='<div class="ev-annual-cal">';
    // Fila de cabecera
    h+='<div class="ev-annual-hdr-row">';
    ['L','M','X','J','V','S','D'].forEach(function(d){h+='<div class="ev-annual-hdr">'+d+'</div>';});
    h+='</div>';
    var first=new Date(EV_YEAR,m,1);
    var last=new Date(EV_YEAR,m+1,0);
    var cur=new Date(first);
    var dow=cur.getDay();var off=dow===0?6:dow-1;
    cur.setDate(cur.getDate()-off);
    while(cur<=last){
      // Construir semana (7 días)
      var wk=[];
      for(var wi=0;wi<7;wi++){
        wk.push(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()));
        cur.setDate(cur.getDate()+1);
      }
      var wStart=wk[0],wEnd=wk[6];
      // Eventos multi-día que intersectan esta semana (solo días del mes actual)
      var wMulti=[];
      multiEvs.forEach(function(ev){
        var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
        if(ee<wStart||es>wEnd)return;
        var cs=Math.max(0,Math.round((es-wStart)/86400000));
        var ce=Math.min(6,Math.round((ee-wStart)/86400000));
        // Recortar a solo días del mes m — evita que eventos de mayo aparezcan en abril
        while(cs<=ce&&wk[cs]&&wk[cs].getMonth()!==m)cs++;
        while(ce>=cs&&wk[ce]&&wk[ce].getMonth()!==m)ce--;
        if(cs>ce)return;
        wMulti.push({ev:ev,cs:cs,ce:ce,starts:es>=wStart,ends:ee<=wEnd,row:-1});
      });
      // Greedy row assignment (max 2 filas, sin solapamiento)
      var rowOcc=[[],[]];
      wMulti.forEach(function(it){
        for(var r=0;r<2;r++){
          var ok=true;
          for(var j=0;j<rowOcc[r].length;j++){if(it.cs<=rowOcc[r][j][1]&&it.ce>=rowOcc[r][j][0]){ok=false;break;}}
          if(ok){it.row=r;rowOcc[r].push([it.cs,it.ce]);break;}
        }
      });
      h+='<div class="ev-annual-week-outer">';
      var abspanStart=-1,abspans=[];
      for(var di=0;di<7;di++){
        var d=wk[di];
        var inM=d.getMonth()===m;
        var ds=evDk(d);
        var evs=inM?getEventsOn(ds):[];
        var isT=inM&&d.getTime()===today.getTime();
        var isWknd=d.getDay()===0||d.getDay()===6;
        var dt=inM&&typeof dayT==='function'?dayT(d):'';
        var inPuente=inM&&puenteMap[ds];
        var isSueltoFest=inM&&sueltoFestMap[ds];
        var isSueltoVac=inM&&sueltoVacMap[ds];
        if(inPuente){if(abspanStart<0)abspanStart=di;}
        else{if(abspanStart>=0){abspans.push({s:abspanStart,e:di-1});abspanStart=-1;}}
        var puenteCls='';
        if(inPuente){puenteCls=EV_ANNUAL_VIEW==='puentes'?' ev-annual-puente':'';}
        else if(EV_ANNUAL_VIEW==='puentes'){
          if(isSueltoFest)puenteCls=' ev-annual-suelto-fest';
          else if(isSueltoVac)puenteCls=' ev-annual-suelto-vac';
        }
        var fiestasCls='';
        if(inM){
          if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='festivos')&&dt==='festivo')fiestasCls=' ann-festivo';
          else if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='vacaciones')&&dt==='vacaciones')fiestasCls=' ann-vac';
        }
        var past=inM&&d<today;
        var cls='ev-annual-day'+(inM?'':' out-m')+(isT?' ann-today':'')+(past?' past-cal-day':'')+puenteCls+fiestasCls;
        var bg='';
        if(inM){
          if(EV_ANNUAL_VIEW==='puentes'){
            if(dt==='festivo')         bg='rgba(255,107,107,.55)';
            else if(dt==='vacaciones') bg='rgba(255,179,71,.55)';
            else if(dt==='ausencia')   bg='rgba(192,132,252,.55)';
            else if(isWknd)            bg='rgba(160,160,200,.22)';
          } else {
            if(isWknd)bg='rgba(160,160,200,.22)';
          }
        }
        var sty=bg?' style="background:'+bg+'"':'';
        var dsAttr=inM?' data-ds="'+ds+'"':'';
        // Eventos puntuales: ✕ aspas para regulares, ⭐ para VIP — todos centrados (z-index:3)
        var vipHidden=EV_ANNUAL_FILTER_HIDDEN.indexOf('Cumpleaños VIP')!==-1;
        var _annSd='';
        if(inM){
          var _singleEvs=evs.filter(function(ev){return !multiIds[ev.id]&&annEvVisible(ev)&&ev.id.indexOf('ev-bday-vip-')!==0;});
          var _vipBdays=(!vipHidden&&typeof BDAYS!=='undefined'&&Array.isArray(BDAYS))?(function(){var dd2=d.getDate(),dm2=d.getMonth()+1;return BDAYS.filter(function(b){return b.vip&&b.day===dd2&&b.month===dm2;});})():[];
          if(_singleEvs.length||_vipBdays.length){
            var _pmk=past?' past-marker':'';
            _annSd='<div class="ev-annual-xs">';
            _singleEvs.forEach(function(ev){_annSd+=evMarkerHtml(ev,_pmk);});
            _vipBdays.forEach(function(ev){_annSd+='<span class="ev-annual-vip-star'+_pmk+'" data-id="'+ev.id+'">\u2b50</span>';});
            _annSd+='</div>';
          }
        }
        h+='<div class="'+cls+'"'+sty+dsAttr+'>'+_annSd+'</div>';
      }
      if(abspanStart>=0)abspans.push({s:abspanStart,e:6});
      // Barras multi-día (z-index:2): 80% altura celda, centradas, sin solapamiento
      var activeRows=0;wMulti.forEach(function(it){if(it.row>=0)activeRows=Math.max(activeRows,it.row+1);});
      if(activeRows>0){
        h+='<div class="ev-annual-bars-row">';
        wMulti.forEach(function(it){
          if(it.row<0)return;
          var sc=it.starts&&it.ends?'':it.starts?' a-starts':it.ends?' a-ends':' a-mid';
          var _adc=getEvDisplayColor(it.ev);
          var _pastBar=wk[it.ce]<today?' past-bar':'';
          h+='<div class="ev-annual-mbar'+sc+_pastBar+'" data-id="'+it.ev.id+'" style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';border:1px solid '+_adc+';background:'+fakeTrans(_adc,0.65)+'"></div>';
        });
        h+='</div>';
      }
      // Perímetro de días puente en anual (bordes abiertos si el puente continúa)
      if(abspans.length&&EV_ANNUAL_VIEW==='puentes'){
        var nextMonA=new Date(wk[6]);nextMonA.setDate(nextMonA.getDate()+1);
        var prevSunA=new Date(wk[0]);prevSunA.setDate(prevSunA.getDate()-1);
        var nextMonADs=evDk(nextMonA),prevSunADs=evDk(prevSunA);
        abspans.forEach(function(sp){
          var rightNeighbor=wk[sp.e+1];
          var leftNeighbor=wk[sp.s-1];
          var noR=(sp.e===6&&puenteMap[nextMonADs])||(rightNeighbor&&puenteMap[evDk(rightNeighbor)]);
          var noL=(sp.s===0&&puenteMap[prevSunADs])||(leftNeighbor&&puenteMap[evDk(leftNeighbor)]);
          var bsty='grid-column:'+(sp.s+1)+'/'+(sp.e+2)+';grid-row:1;';
          if(noL)bsty+='border-left:none;border-top-left-radius:0;border-bottom-left-radius:0;';
          if(noR)bsty+='border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;';
          h+='<div class="ev-annual-puente-perimeter" style="'+bsty+'"></div>';
        });
      }
      h+='</div>'; // ev-annual-week-outer
    }
    h+='</div></div>'; // ev-annual-cal + ev-annual-month
  }
  h+='</div>';
  return h;
}

/* ── Render: calendario 4 meses ─────────────────────────── */
function renderEvQuad(){
  var today=new Date();today.setHours(0,0,0,0);
  // Construir lista de 4 meses
  var months=[];
  for(var mi=0;mi<4;mi++){var tm=EV_QUAD_MONTH+mi;months.push({m:tm%12,y:EV_QUAD_YEAR+Math.floor(tm/12)});}
  // Cargar datos de puentes (puede abarcar 2 años)
  var puenteMap={},sueltoFestMap={},sueltoVacMap={};
  var _loadedYrs={};
  function _loadP(yr){
    if(_loadedYrs[yr])return;_loadedYrs[yr]=true;
    if(typeof computePuentes==='function'){
      var pd=computePuentes(yr);
      pd.puentes.forEach(function(seq){seq.forEach(function(x){puenteMap[evDk(x.date)]=true;});});
      pd.festivosSueltos.forEach(function(dt){sueltoFestMap[evDk(dt)]=true;});
      pd.vacSueltos.forEach(function(dt){sueltoVacMap[evDk(dt)]=true;});
    }
  }
  months.forEach(function(mo){_loadP(mo.y);});
  function annEvVisible(ev){
    if(!EV_ANNUAL_FILTER_HIDDEN.length)return true;
    return EV_ANNUAL_FILTER_HIDDEN.indexOf(getEvType(ev))===-1;
  }
  // Eventos multi-día para el rango de 4 meses
  var rangeStart=new Date(months[0].y,months[0].m,1);
  var lastMo=months[3];
  var rangeEnd=new Date(lastMo.y,lastMo.m+1,0);
  var multiEvs=EVENTS.filter(function(ev){
    if(ev.repeat||(ev.dates&&ev.dates.length)||!ev.end||(!isEvBarAlways(ev)&&ev.end<=ev.start)||!annEvVisible(ev))return false;
    var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
    return ee>=rangeStart&&es<=rangeEnd;
  });
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  var MNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var addMode=EV_EDIT_MODE;
  var vipHidden=EV_ANNUAL_FILTER_HIDDEN.indexOf('Cumpleaños VIP')!==-1;
  var h='<div class="ev-annual-grid ev-quad-grid'+(addMode?' ev-edit-mode':'')+'">';
  months.forEach(function(mObj){
    var m=mObj.m,yr=mObj.y;
    h+='<div class="ev-annual-month" data-month="'+m+'" data-year="'+yr+'">';
    h+='<div class="ev-annual-mname">'+MNS[m]+' '+yr+'</div>';
    h+='<div class="ev-annual-cal">';
    h+='<div class="ev-annual-hdr-row">';
    ['L','M','X','J','V','S','D'].forEach(function(dn){h+='<div class="ev-annual-hdr">'+dn+'</div>';});
    h+='</div>';
    var first=new Date(yr,m,1),last=new Date(yr,m+1,0);
    var cur=new Date(first);
    var dow=cur.getDay();var off=dow===0?6:dow-1;
    cur.setDate(cur.getDate()-off);
    while(cur<=last){
      var wk=[];
      for(var wi=0;wi<7;wi++){wk.push(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()));cur.setDate(cur.getDate()+1);}
      var wStart=wk[0],wEnd=wk[6];
      var wMulti=[];
      multiEvs.forEach(function(ev){
        var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
        if(ee<wStart||es>wEnd)return;
        var cs=Math.max(0,Math.round((es-wStart)/86400000));
        var ce=Math.min(6,Math.round((ee-wStart)/86400000));
        while(cs<=ce&&wk[cs]&&wk[cs].getMonth()!==m)cs++;
        while(ce>=cs&&wk[ce]&&wk[ce].getMonth()!==m)ce--;
        if(cs>ce)return;
        wMulti.push({ev:ev,cs:cs,ce:ce,starts:es>=wStart,ends:ee<=wEnd,row:-1});
      });
      var rowOcc=[[],[]];
      wMulti.forEach(function(it){
        for(var r=0;r<2;r++){
          var ok=true;
          for(var j=0;j<rowOcc[r].length;j++){if(it.cs<=rowOcc[r][j][1]&&it.ce>=rowOcc[r][j][0]){ok=false;break;}}
          if(ok){it.row=r;rowOcc[r].push([it.cs,it.ce]);break;}
        }
      });
      h+='<div class="ev-annual-week-outer">';
      var abspanStart=-1,abspans=[];
      for(var di=0;di<7;di++){
        var d=wk[di];
        var inM=d.getMonth()===m;
        var ds=evDk(d);
        var evs=inM?getEventsOn(ds):[];
        var isT=inM&&d.getTime()===today.getTime();
        var isWknd=d.getDay()===0||d.getDay()===6;
        var dt=inM&&typeof dayT==='function'?dayT(d):'';
        var inPuente=inM&&puenteMap[ds];
        var isSueltoFest=inM&&sueltoFestMap[ds];
        var isSueltoVac=inM&&sueltoVacMap[ds];
        if(inPuente){if(abspanStart<0)abspanStart=di;}
        else{if(abspanStart>=0){abspans.push({s:abspanStart,e:di-1});abspanStart=-1;}}
        var puenteCls='';
        if(inPuente){puenteCls=EV_ANNUAL_VIEW==='puentes'?' ev-annual-puente':'';}
        else if(EV_ANNUAL_VIEW==='puentes'){
          if(isSueltoFest)puenteCls=' ev-annual-suelto-fest';
          else if(isSueltoVac)puenteCls=' ev-annual-suelto-vac';
        }
        var fiestasCls='';
        if(inM){
          if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='festivos')&&dt==='festivo')fiestasCls=' ann-festivo';
          else if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='vacaciones')&&dt==='vacaciones')fiestasCls=' ann-vac';
        }
        var past=inM&&d<today;
        var cls='ev-annual-day'+(inM?'':' out-m')+(isT?' ann-today':'')+(past?' past-cal-day':'')+puenteCls+fiestasCls;
        var bg='';
        if(inM){
          if(EV_ANNUAL_VIEW==='puentes'){
            if(dt==='festivo')bg='rgba(255,107,107,.55)';
            else if(dt==='vacaciones')bg='rgba(255,179,71,.55)';
            else if(dt==='ausencia')bg='rgba(192,132,252,.55)';
            else if(isWknd)bg='rgba(160,160,200,.22)';
          }else{if(isWknd)bg='rgba(160,160,200,.22)';}
        }
        var sty=bg?' style="background:'+bg+'"':'';
        var dsAttr=inM?' data-ds="'+ds+'"':'';
        // Eventos puntuales: ✕ aspas para regulares, ⭐ para VIP — todos centrados (z-index:3)
        var _quadSd='';
        if(inM){
          var _singleEvs=evs.filter(function(ev){return !multiIds[ev.id]&&annEvVisible(ev)&&ev.id.indexOf('ev-bday-vip-')!==0;});
          var _vipBdays=(!vipHidden&&typeof BDAYS!=='undefined'&&Array.isArray(BDAYS))?(function(){var dd2=d.getDate(),dm2=d.getMonth()+1;return BDAYS.filter(function(b){return b.vip&&b.day===dd2&&b.month===dm2;});})():[];
          if(_singleEvs.length||_vipBdays.length){
            var _qpmk=past?' past-marker':'';
            _quadSd='<div class="ev-annual-xs">';
            _singleEvs.forEach(function(ev){_quadSd+=evMarkerHtml(ev,_qpmk);});
            _vipBdays.forEach(function(ev){_quadSd+='<span class="ev-annual-vip-star'+_qpmk+'" data-id="'+ev.id+'">\u2b50</span>';});
            _quadSd+='</div>';
          }
        }
        h+='<div class="'+cls+'"'+sty+dsAttr+'>'+_quadSd+'</div>';
      }
      if(abspanStart>=0)abspans.push({s:abspanStart,e:6});
      var activeRows=0;wMulti.forEach(function(it){if(it.row>=0)activeRows=Math.max(activeRows,it.row+1);});
      if(activeRows>0){
        h+='<div class="ev-annual-bars-row">';
        wMulti.forEach(function(it){
          if(it.row<0)return;
          var sc=it.starts&&it.ends?'':it.starts?' a-starts':it.ends?' a-ends':' a-mid';
          var showQT=(it.starts||(it.cs===0));
          var _qdc=getEvDisplayColor(it.ev);
          var _pastBar=wk[it.ce]<today?' past-bar':'';
          h+='<div class="ev-annual-mbar'+sc+_pastBar+'" data-id="'+it.ev.id+'" style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';border:1px solid '+_qdc+';background:'+fakeTrans(_qdc,0.65)+';font-size:.3rem;padding:0 3px">'+(showQT?escHtml(it.ev.title):'')+'</div>';
        });
        h+='</div>';
      }
      if(abspans.length&&EV_ANNUAL_VIEW==='puentes'){
        var nextMonA=new Date(wk[6]);nextMonA.setDate(nextMonA.getDate()+1);
        var prevSunA=new Date(wk[0]);prevSunA.setDate(prevSunA.getDate()-1);
        var nextMonADs=evDk(nextMonA),prevSunADs=evDk(prevSunA);
        abspans.forEach(function(sp){
          var rightNeighbor=wk[sp.e+1];var leftNeighbor=wk[sp.s-1];
          var noR=(sp.e===6&&puenteMap[nextMonADs])||(rightNeighbor&&puenteMap[evDk(rightNeighbor)]);
          var noL=(sp.s===0&&puenteMap[prevSunADs])||(leftNeighbor&&puenteMap[evDk(leftNeighbor)]);
          var bsty='grid-column:'+(sp.s+1)+'/'+(sp.e+2)+';grid-row:1;';
          if(noL)bsty+='border-left:none;border-top-left-radius:0;border-bottom-left-radius:0;';
          if(noR)bsty+='border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;';
          h+='<div class="ev-annual-puente-perimeter" style="'+bsty+'"></div>';
        });
      }
      h+='</div>'; // ev-annual-week-outer
    }
    h+='</div></div>'; // ev-annual-cal + ev-annual-month
  });
  h+='</div>';
  return h;
}

/* ── Render: lista de eventos por tipos ─────────────────── */
function renderEvByTypes(){
  var today=new Date();today.setHours(0,0,0,0);
  var typeOrder=['Viaje','Asturias','Rec. Gestiones','Plan/Quedada','Otros'];
  var h='<div class="ev-types-controls">';
  h+='<label class="ev-types-past-label"><input type="checkbox" id="evTypesPast"'+(EV_TYPES_PAST?' checked':'')+'> Excluir pasados</label>';
  h+='<select class="ev-types-select" id="evTypesFilter">';
  h+='<option value="all"'+(EV_TYPES_FILTER==='all'?' selected':'')+'>Todos los tipos</option>';
  typeOrder.forEach(function(t){
    h+='<option value="'+escHtml(t)+'"'+(EV_TYPES_FILTER===t?' selected':'')+'>'+escHtml(t)+'</option>';
  });
  h+='</select></div>';
  if(!EVENTS.length)return h+'<div class="sy-note">No hay eventos. Pulsa &quot;+ A\u00f1adir&quot; para crear uno.</div>';
  var byType={};typeOrder.forEach(function(t){byType[t]=[];});
  EVENTS.forEach(function(ev){
    if(ev.id&&ev.id.indexOf('ev-bday-vip-')===0)return; /* VIP birthdays excluded from Todos */
    var evEnd=ev.end?new Date(ev.end+'T00:00:00'):new Date(ev.start+'T00:00:00');
    if(EV_TYPES_PAST&&!ev.repeat&&evEnd<today)return;
    var type=getEvType(ev);
    (byType[type]||byType['Otros']).push(ev);
  });
  var typesToShow=EV_TYPES_FILTER==='all'?typeOrder:[EV_TYPES_FILTER];
  var anyShown=false;
  typesToShow.forEach(function(type){
    var list=byType[type]||[];
    if(!list.length)return;
    anyShown=true;
    list.sort(function(a,b){return a.start<b.start?-1:1;});
    h+='<div class="sy-section"><div class="bday-month-hdr">'+escHtml(type)+'</div>';
    list.forEach(function(ev){h+=renderEvListItem(ev);});
    h+='</div>';
  });
  if(!anyShown)h+='<div class="sy-note">No hay eventos'+(EV_TYPES_PAST?' futuros':'')+' de este tipo.</div>';
  return h;
}

/* ── Render: vista "Eventos" (lista por tipos) ── */
function renderEvMonthsView(){
  return renderEvByTypes();
}

/* ── Render: vista semanal (agenda por días) ─────────────── */
/* Arquitectura: cada mes es un CSS grid con 2 columnas (fecha 48px | eventos 1fr)
   - Cada día ocupa una fila explícita (grid-row:N)
   - Eventos multi-día: UN único grid item que abarca varias filas (grid-row:start/end+1)
   - Eventos puntuales: grid items en grid-row del día, encima del multi-día (z-index)
   - Resultado: un viaje se ve como UNA SOLA caja continua; eventos de 1 día caen DENTRO */
function renderEvWeek(){
  var today=new Date();today.setHours(0,0,0,0);
  var todayStr=evDk(today);
  var _wn=['D','L','M','X','J','V','S'];
  function hexA(hex,a){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return 'rgba('+r+','+g+','+b+','+a+')';}

  var h='';
  for(var i=0;i<6;i++){
    var mTot=EV_MONTH+i,mIdx=mTot%12,yIdx=EV_YEAR+Math.floor(mTot/12);
    var monthKey=yIdx+'-'+String(mIdx+1).padStart(2,'0');
    var daysInM=new Date(yIdx,mIdx+1,0).getDate();
    h+='<div class="ev-wk-month-sep" id="ev-wk-month-'+monthKey+'">'+MN[mIdx]+' '+yIdx+'</div>';

    // Recolectar eventos del mes
    var singleByDay={};      // d → [ev]  (eventos de 1 día)
    var multiSegs=[];        // {ev, sd, ed, isFirstSeg, isLastSeg}
    var multiSeen={};

    for(var d=1;d<=daysInM;d++){
      var day=new Date(yIdx,mIdx,d);
      var ds=evDk(day);
      getEventsOn(ds).forEach(function(ev){
        if(ev.end&&ev.end!==ev.start){
          if(!multiSeen[ev.id]){
            multiSeen[ev.id]={ev:ev,sd:d,ed:d};
            multiSegs.push(multiSeen[ev.id]);
          } else {
            multiSeen[ev.id].ed=d;
          }
        } else {
          if(!singleByDay[d])singleByDay[d]=[];
          singleByDay[d].push(ev);
        }
      });
    }

    // Marcar si la cabecera (título) del multi-día va aquí (primer mes del evento)
    multiSegs.forEach(function(seg){
      var sDt=new Date(seg.ev.start+'T00:00:00');
      var eDt=new Date(seg.ev.end+'T00:00:00');
      seg.isFirstSeg=(sDt.getFullYear()===yIdx&&sDt.getMonth()===mIdx);
      seg.isLastSeg=(eDt.getFullYear()===yIdx&&eDt.getMonth()===mIdx);
    });

    h+='<div class="ev-wk-mgrid">';

    // 1) Capa fondo: multi-días (z-index bajo, abarcan varias filas como UNA UNIDAD)
    multiSegs.forEach(function(seg){
      var ev=seg.ev;
      var _dc=getEvDisplayColor(ev);
      var _isVip=ev.id.indexOf('ev-bday-vip-')===0;
      var _t=_isVip?escHtml(ev.title.replace(/^\u2b50\s*/,'').replace(/^Cumple\s+/,'')):escHtml(ev.title);
      var _ic=_isVip?'\u2b50 ':'';
      var rTopCls=seg.isFirstSeg?'':' wk-multi-cont-top';
      var rBotCls=seg.isLastSeg?'':' wk-multi-cont-bot';
      h+='<div class="ev-wk-multi'+rTopCls+rBotCls+'" data-id="'+ev.id+'" '
        +'style="grid-row:'+seg.sd+' / '+(seg.ed+1)+';grid-column:2;'
        +'background:'+hexA(_dc,0.18)+';border-color:'+_dc+'">';
      if(seg.isFirstSeg){
        h+='<div class="ev-wk-multi-title" style="color:'+_dc+'">'+_ic+_t+'</div>';
      }
      h+='</div>';
    });

    // 2) Capa contenido: para cada día, columna fecha + chips puntuales
    for(var d=1;d<=daysInM;d++){
      var day=new Date(yIdx,mIdx,d);
      var ds=evDk(day);
      var isToday=ds===todayStr;
      var isPast=day<today;
      var dow=day.getDay();
      var isWknd=dow===0||dow===6;
      var dCls='ev-wk-date'+(isToday?' ev-wk-today':'')+(isPast?' ev-wk-past':'')+(isWknd?' ev-wk-wknd':'');
      h+='<div class="'+dCls+'" style="grid-row:'+d+'"'+(isToday?' id="ev-wk-today-row"':'')+'>';
      h+='<span class="ev-wk-dow">'+_wn[dow]+'</span><span class="ev-wk-num">'+d+'</span>';
      h+='</div>';

      var chips=singleByDay[d]||[];
      var hasMulti=multiSegs.some(function(s){return d>=s.sd&&d<=s.ed;});
      var eCls='ev-wk-chips'+(isToday?' ev-wk-today':'')+(isPast?' ev-wk-past':'')+(isWknd?' ev-wk-wknd':'')+(hasMulti?' ev-wk-chips-nested':'');
      h+='<div class="'+eCls+'" style="grid-row:'+d+';grid-column:2">';
      chips.forEach(function(ev){
        var _dc=getEvDisplayColor(ev);
        var _isVip=ev.id.indexOf('ev-bday-vip-')===0;
        var _t=_isVip?escHtml(ev.title.replace(/^\u2b50\s*/,'').replace(/^Cumple\s+/,'')):escHtml(ev.title);
        var _ic=_isVip?'\u2b50 ':'';
        h+='<div class="ev-wk-chip" data-id="'+ev.id+'" style="border-left:3px solid '+_dc+';background:'+hexA(_dc,0.95)+'">';
        h+='<span class="ev-wk-chip-title">'+_ic+_t+'</span>';
        h+='</div>';
      });
      h+='</div>';
    }

    h+='</div>';
  }
  return h;
}

/* ── Render: contenido principal ────────────────────────── */
function renderEvContent(){
  var h=renderNavBar('events');
  // Tabs a nivel 2 (sticky top:42px, justo bajo la nav bar)
  h+='<div class="ev-hdr-sub">';
  // Zona A: Próximos + Todos
  h+='<div class="ev-view-zone ev-zone-a">';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='upcoming'?' active':'')+'" id="evViewUpcoming">Pr\u00f3ximos</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='months'?' active':'')+'" id="evViewMonths">Todos</button>';
  h+='</div>';
  // Zona B: Calendarios visuales (1 mes + Semanal)
  h+='<div class="ev-view-zone ev-zone-b">';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='cal'?' active':'')+'" id="evViewCal">Calendario<br>1 mes</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='week'?' active':'')+'" id="evViewWeek">Agenda<br>Semanal</button>';
  h+='</div>';
  // Zona B: Calendarios visuales (4 meses + Anual)
  h+='<div class="ev-view-zone ev-zone-b">';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='quad'?' active':'')+'" id="evViewQuad">Calendario<br>4 meses</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='annual'?' active':'')+'" id="evViewAnnual">Calendario<br>Anual</button>';
  h+='</div>';
  // Zona C: Puentes + Vacaciones/Festivos
  h+='<div class="ev-view-zone ev-zone-c">';
  h+='<button class="ev-view-toggle ev-btn-puentes'+(EV_VIEW==='puentes'?' active':'')+'" id="evViewPuentes">Puentes</button>';
  h+='<button class="ev-view-toggle ev-btn-timeoff'+(EV_VIEW==='time-off'?' active':'')+'" id="evViewTimeOff">Vacaciones<br>Festivos</button>';
  h+='</div>';
  h+='</div>';
  // Header a nivel 3 (with-tabs → top:82px)
  var _hdrCenterCls=' sy-header-center';
  h+='<div class="sy-header with-tabs'+_hdrCenterCls+'">';
  h+='<button class="sy-back" id="evBack">&#8592;</button>';
  if(EV_VIEW==='upcoming'){
    h+='<div class="sy-year-nav"><div class="sy-year">Pr\u00f3ximos</div></div>';
  } else if(EV_VIEW==='week'){
    h+='<div class="sy-year-nav"><button class="sy-nav" id="evPrev">&#9664;</button>';
    h+='<div class="sy-year sy-year-2line">'+MN[EV_MONTH]+'<span class="sy-year-sub">'+EV_YEAR+'</span></div>';
    h+='<button class="sy-nav" id="evNext">&#9654;</button></div>';
    h+='<button class="ev-bright-btn ev-bright-mid'+(EV_BRIGHT_PAST?' on':'')+'" id="evBright">\uD83D\uDCA1</button>';
    h+='<div class="sy-hdr-right"><button class="today-btn" id="evToday" style="font-size:.65rem;padding:4px 10px">Hoy</button></div>';
  } else if(EV_VIEW==='months'){
    h+='<div class="sy-year-nav"><div class="sy-year">Eventos</div></div>';
  } else if(EV_VIEW==='puentes'||EV_VIEW==='time-off'){
    h+='<div class="sy-year-nav"><button class="sy-nav" id="evPrev">&#9664;</button><div class="sy-year">'+EV_YEAR+'</div><button class="sy-nav" id="evNext">&#9654;</button></div>';
    h+='<div class="sy-hdr-right"><button class="sy-pdf" id="evSyPdf">PDF</button></div>';
  } else if(EV_VIEW==='quad'){
    var _qMNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var _qm3=(EV_QUAD_MONTH+3)%12,_qy3=EV_QUAD_YEAR+Math.floor((EV_QUAD_MONTH+3)/12);
    var _qLine1=_qMNS[EV_QUAD_MONTH]+' '+EV_QUAD_YEAR;
    var _qLine3=_qMNS[_qm3]+' '+_qy3;
    h+='<div class="sy-year-nav">';
    h+='<button class="sy-nav sy-nav-pill" id="evQuadPrev2">\u00ab</button>';
    h+='<button class="sy-nav sy-nav-sm" id="evPrev">&#9664;</button>';
    h+='<div class="sy-year ev-quad-label">'+_qLine1+'<span class="ev-quad-dash">\u2014</span>'+_qLine3+'</div>';
    h+='<button class="sy-nav sy-nav-sm" id="evNext">&#9654;</button>';
    h+='<button class="sy-nav sy-nav-pill" id="evQuadNext2">\u00bb</button>';
    h+='</div>';
    h+='<div class="sy-hdr-right">';
    h+='<button class="today-btn" id="evToday" style="font-size:.65rem;padding:4px 8px">Hoy</button>';
    h+='</div>';
  } else {
    h+='<div class="sy-year-nav"><button class="sy-nav" id="evPrev">&#9664;</button>';
    if(EV_VIEW==='annual')h+='<div class="sy-year">'+EV_YEAR+'</div>';
    else h+='<div class="sy-year sy-year-2line">'+MN[EV_MONTH]+'<span class="sy-year-sub">'+EV_YEAR+'</span></div>';
    h+='<button class="sy-nav" id="evNext">&#9654;</button></div>';
    if(EV_VIEW!=='annual')h+='<button class="ev-bright-btn ev-bright-mid'+(EV_BRIGHT_PAST?' on':'')+'" id="evBright">\uD83D\uDCA1</button>';
    h+='<div class="sy-hdr-right">';
    h+='<button class="today-btn" id="evToday" style="font-size:.65rem;padding:4px 10px">Hoy</button>';
    h+='</div>';
  }
  h+='</div>';
  h+='<div class="sy-body'+(EV_BRIGHT_PAST?' ev-bright-past':'')+(EV_VIEW==='week'?' ev-wk-body':'')+'">';
  if(EV_VIEW==='annual'||EV_VIEW==='quad'){
    var _typeOrder=['Viaje','Asturias','Rec. Gestiones','Plan/Quedada','Otros','Cumplea\u00f1os VIP'];
    var _typeShort={'Viaje':'Viaje','Asturias':'Asturias','Rec. Gestiones':'Gestiones','Plan/Quedada':'Planes','Otros':'Otros','Cumplea\u00f1os VIP':'\u2b50'};
    var _typeColor={'Viaje':'#38bdf8','Asturias':'#1d4ed8','Rec. Gestiones':'#34d399','Plan/Quedada':'#fb923c','Otros':'#ff6b6b','Cumplea\u00f1os VIP':'#fbbf24'};
    h+='<div class="ev-annual-controls">';
    var _vdLabels={'puentes':'\uD83D\uDDD3 Puentes','fiestas':'\uD83D\uDCC5 Vac + Festivos','vacaciones':'\uD83C\uDFD6 Solo vacaciones','festivos':'\uD83C\uDF8C Solo festivos','none':'\u2715 Nada'};
    var _curVdLabel=_vdLabels[EV_ANNUAL_VIEW]||_vdLabels['none'];
    h+='<div class="ev-annual-view-toggle">';
    h+='<button class="ev-ann-edit-btn'+(EV_EDIT_MODE?' active':'')+'" id="evAnnEditBtn" title="Modo edici\u00f3n">&#9998;</button>';
    h+='<div class="ev-ann-vd-wrap" id="evAnnVdWrap">';
    h+='<button class="ev-ann-vd-btn" id="evAnnVdBtn">'+_curVdLabel+' \u25be</button>';
    h+='<div class="ev-ann-vd-menu" id="evAnnVdMenu">';
    [['puentes','\uD83D\uDDD3 Solo puentes'],['fiestas','\uD83D\uDCC5 Vac + festivos'],['vacaciones','\uD83C\uDFD6 Solo vacaciones'],['festivos','\uD83C\uDF8C Solo festivos'],['none','\u2715 No ver nada']].forEach(function(opt){
      var active=EV_ANNUAL_VIEW===opt[0];
      h+='<button class="ev-ann-vd-opt'+(active?' active':'')+'" data-view="'+opt[0]+'">'+opt[1]+'</button>';
    });
    h+='</div></div>';
    // Bombilla simétrica al lápiz: a la derecha del filtro (fuera del dropdown)
    h+='<button class="ev-bright-btn ev-bright-round'+(EV_BRIGHT_PAST?' on':'')+'" id="evBright">\uD83D\uDCA1</button>';
    h+='</div>';
    h+='<div class="ev-annual-filter-row">';
    _typeOrder.forEach(function(type){
      var hidden=EV_ANNUAL_FILTER_HIDDEN.indexOf(type)!==-1;
      var c=_typeColor[type];
      var sty=hidden?'':'border-color:'+c+';color:'+c+';background:'+c+'18';
      h+='<button class="ev-filter-chip'+(hidden?'':' chip-active')+'" data-filter-type="'+escHtml(type)+'" style="'+sty+'">'+_typeShort[type]+'</button>';
    });
    h+='</div>';
    h+='</div>';
  }
  if(EV_VIEW==='cal')h+=renderEvCalMonth();
  else if(EV_VIEW==='upcoming')h+=renderEvUpcoming();
  else if(EV_VIEW==='week')h+=renderEvWeek();
  else if(EV_VIEW==='annual')h+=renderEvAnnual();
  else if(EV_VIEW==='quad')h+=renderEvQuad();
  else if(EV_VIEW==='puentes')h+=renderSummaryPuentesBody(EV_YEAR);
  else if(EV_VIEW==='time-off')h+=renderSummaryTimeOffBody(EV_YEAR);
  else h+=renderEvMonthsView();
  if(EV_VIEW!=='puentes'&&EV_VIEW!=='time-off'){
    h+='<div class="ev-io-row">';
    var _isPickView=EV_VIEW==='annual'||EV_VIEW==='quad';
    var addLabel=_isPickView&&EV_EDIT_MODE?'&#10006; Cancelar':'+ A\u00f1adir';
    h+='<button class="ev-io-btn'+(_isPickView&&EV_EDIT_MODE?' ev-edit-pick-mode':'')+'" id="evAdd">'+addLabel+'</button>';
    if(EV_VIEW==='upcoming'||EV_VIEW==='months'){
      h+='<button class="ev-io-btn" id="evExport">&#8595; Exportar</button>';
      h+='<button class="ev-io-btn" id="evImport">&#8593; Importar</button>';
      h+='<input type="file" id="evImportFile" accept=".json" style="display:none">';
    }
    h+='</div>';
  }
  h+='</div>';
  return h;
}

/* ── Render: detalle de evento ──────────────────────────── */
function renderEvDetail(ev,fromSummary){
  var s=new Date(ev.start+'T00:00:00');
  var e2=ev.end&&ev.end!==ev.start?new Date(ev.end+'T00:00:00'):null;
  var fd2=function(dd){return String(dd.getDate()).padStart(2,'0')+'/'+String(dd.getMonth()+1).padStart(2,'0')+'/'+dd.getFullYear();};
  var dateStr=fd2(s);
  if(e2)dateStr+=' \u2014 '+fd2(e2);
  var repeatStr='';
  if(ev.repeat){
    var rt=ev.repeat.type;
    if(rt==='weekly'&&ev.repeat.weekDays){
      var wn2=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
      repeatStr='\ud83d\udd01 Semanal: '+ev.repeat.weekDays.map(function(w){return wn2[w];}).join(', ');
    }else if(rt==='monthly-date'){repeatStr='\ud83d\udd01 Mensual (mismo d\u00eda)';}
    else if(rt==='monthly-first'){repeatStr='\ud83d\udd01 Mensual (d\u00eda 1)';}
    else if(rt==='yearly'){repeatStr='\ud83d\udd01 Anual';}
  }
  var h='<div class="ev-detail-overlay" id="evDetailOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="evDClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">Evento</div>';
  h+='<button class="ev-list-btn" id="evDEdit" style="font-size:.8rem;padding:6px 12px;border-color:'+ev.color+';color:'+ev.color+'">&#9998; Editar</button>';
  h+='</div>';
  var _ddc=getEvDisplayColor(ev);
  h+='<div class="ev-detail-color-bar" style="background:'+_ddc+'" id="evDColorBar"></div>';
  h+='<div style="display:flex;align-items:center;gap:8px">';
  h+='<div class="ev-detail-title" style="color:'+_ddc+';flex:1" id="evDTitle">'+escHtml(ev.title)+'</div>';
  /* Paleta de color sólo en tipos Viaje y Otros */
  var _evType=getEvType(ev);
  if(_evType==='Viaje'||_evType==='Otros'){
    h+='<button class="ev-detail-color-btn" id="evDColorBtn">\uD83C\uDFA8</button>';
  }
  h+='</div>';
  h+='<div style="font-size:.72rem;font-weight:600;color:'+_ddc+';opacity:.8;margin-bottom:4px">'+getEvType(ev)+'</div>';
  h+='<div class="ev-detail-color-section" id="evDColorSection">';
  h+=_renderColorPicker(_ddc,false,false,'evDCp');
  h+='<button class="econ-calc-btn" id="evDColorApply" style="margin-top:8px;font-size:.78rem;padding:8px 0">Probar color</button>';
  h+='</div>';
  h+='<div class="ev-detail-date">&#128197; '+dateStr+'</div>';
  if(repeatStr)h+='<div class="ev-detail-repeat">'+repeatStr+'</div>';
  if(ev.note)h+='<div class="ev-detail-note">'+escHtml(ev.note)+'</div>';
  h+='<div class="ev-detail-actions">';
  if(fromSummary)h+='<button class="ev-btn" id="evDGoCal" style="border-color:var(--c-blue);color:var(--c-blue)">&#128197; Ver en Calendario</button>';
  h+='<button class="ev-btn danger" id="evDDel">Eliminar</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

/* ── Apertura/cierre del detalle ────────────────────────── */
function openEvDetail(ev,container){
  var ov=container||document.getElementById('eventsOverlay');
  var fromSummary=(EV_VIEW==='puentes'||EV_VIEW==='time-off');
  ov.scrollTop=0;
  var wrap=document.createElement('div');
  wrap.id='evDWrap';
  wrap.innerHTML=renderEvDetail(ev,fromSummary);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('evDetailOv');
    if(fo){
      fo.classList.add('open');
      fo.addEventListener('click',function(e){if(e.target===fo)closeEvDetail();});
    }
  });
  document.getElementById('evDClose').addEventListener('click',closeEvDetail);
  // Color picker en detalle
  var _dColorBtn=document.getElementById('evDColorBtn');
  if(_dColorBtn){
    var _dColorSec=document.getElementById('evDColorSection');
    var _dCpBound=false;
    var _dCpRef=null;
    _dColorBtn.addEventListener('click',function(){
      _dColorSec.classList.toggle('open');
      if(!_dCpBound){
        _dCpBound=true;
        _dCpRef=_bindColorPicker(wrap,'evDCp',function(hex){
          /* Solo actualiza preview local, NO guarda */
          var bar=document.getElementById('evDColorBar');if(bar)bar.style.background=hex;
          var ttl=document.getElementById('evDTitle');if(ttl)ttl.style.color=hex;
        });
      }
    });
    /* Probar color — aplica, guarda y refresca calendarios */
    document.getElementById('evDColorApply').addEventListener('click',function(){
      if(!_dCpRef)return;
      var hex=_dCpRef.getColor();
      ev.color=hex;
      /* Preserve type — if it was Viaje, keep it as Viaje regardless of color */
      if(!ev.type)ev.type=getEvType(ev);
      saveEvents();updateEventsBtn();
      refreshEvents();
      showToast('Color aplicado','success');
    });
  }
  document.getElementById('evDEdit').addEventListener('click',function(){
    closeEvDetail();
    // VIP birthday → abrir formulario de cumpleaños en lugar del de eventos
    if(ev.id.indexOf('ev-bday-vip-')===0&&typeof BDAYS!=='undefined'){
      var evDay=parseInt(ev.start.slice(8,10),10);
      var evMonth=parseInt(ev.start.slice(5,7),10);
      var b=null;
      for(var i=0;i<BDAYS.length;i++){
        if(BDAYS[i].day===evDay&&BDAYS[i].month===evMonth){b=BDAYS[i];break;}
      }
      if(b){
        closeEvents();
        setTimeout(function(){
          openBday();
          setTimeout(function(){openBdayForm(b);},350);
        },330);
        return;
      }
    }
    setTimeout(function(){openEvForm(ev);},300);
  });
  if(fromSummary){
    document.getElementById('evDGoCal').addEventListener('click',function(){
      var evYear=parseInt(ev.start.slice(0,4),10);
      var evMonth=parseInt(ev.start.slice(5,7),10)-1;
      closeEvDetail();
      EV_YEAR=evYear;EV_MONTH=evMonth;EV_VIEW='cal';
      refreshEvents();
    });
  }
  document.getElementById('evDDel').addEventListener('click',function(){
    var deleted=ev;
    var deletedIdx=-1;
    for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===deleted.id){deletedIdx=i;break;}}
    EVENTS=EVENTS.filter(function(e){return e.id!==deleted.id;});
    saveEvents();updateEventsBtn();
    closeEvDetail();
    setTimeout(function(){
      refreshEvents();
      showToast('Evento eliminado','success',function(){
        if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
        saveEvents();updateEventsBtn();refreshEvents();
      });
    },320);
  });
}

function closeEvDetail(){
  var fo=document.getElementById('evDetailOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('evDWrap');if(w)w.remove();},300);
}

/* ── Render: formulario de evento ───────────────────────── */
function renderEvForm(ev){
  var isEdit=!!ev;
  var title=isEdit?ev.title:'';
  var note=isEdit?(ev.note||''):'';
  var color=isEdit?ev.color:EV_COLORS[0];
  var today=evDk(new Date());
  var start=isEdit?ev.start:today;
  var end=isEdit?(ev.end||ev.start):today;
  var repeat=isEdit?ev.repeat:null;
  var repType=repeat?repeat.type:'none';
  var wdays=(repeat&&repeat.type==='weekly')?repeat.weekDays:[];
  var wdNames=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  /* Determine current type from stored type or color */
  var curType=isEdit&&ev.type?ev.type:(EV_COLOR_TYPES[color]||'Otros');
  var isViaje=(curType==='Viaje');
  var h='<div class="ev-form-overlay" id="evFormOv">';
  h+='<div class="ev-form-sheet">';
  h+='<div class="ev-form-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="evFClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar evento':'Nuevo evento')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="evFDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>T\u00edtulo</label>';
  h+='<input class="ev-input" id="evFTitle" type="text" maxlength="80" placeholder="Nombre del evento" value="'+escHtml(title)+'"></div>';
  h+='<div class="ev-field"><label>Nota <span id="evCharCnt" style="font-weight:400;color:var(--text-dim)">'+note.length+'/200</span></label>';
  h+='<textarea class="ev-textarea" id="evFNote" maxlength="200" placeholder="Notas opcionales...">'+escHtml(note)+'</textarea></div>';
  /* Type selector (7 predefined types) */
  h+='<div class="ev-field"><label>Tipo</label><div class="ev-type-picker">';
  var _shownTypes={};
  EV_COLORS.forEach(function(c){
    var typeName=EV_COLOR_TYPES[c]||'Otros';
    if(typeName==='Cumplea\u00f1os VIP')return; /* skip VIP */
    if(_shownTypes[typeName])return; /* skip duplicate type names */
    _shownTypes[typeName]=true;
    var sel=(c===color||(isViaje&&typeName==='Viaje')
      ||(!isViaje&&!EV_COLOR_TYPES[color]&&c==='#a3e635'))?' selected':'';
    h+='<div class="ev-color-swatch'+sel+'" data-hex="'+c+'" style="color:'+c+'">';
    h+='<div class="ev-type-dot" style="background:'+c+'"></div>';
    h+='<span class="ev-type-name">'+typeName+'</span>';
    h+='</div>';
  });
  h+='</div></div>';
  /* Color picker section: visible para Viaje y Otros */
  var isOtros=(curType==='Otros');
  var showColorPicker=isViaje||isOtros;
  h+='<div class="ev-field ev-form-color-section" id="evFColorSection" style="display:'+(showColorPicker?'block':'none')+'">';
  h+='<label>\uD83C\uDFA8 Paleta de colores</label>';
  h+=_renderColorPicker(color,false,false,'evFCp');
  h+='</div>';
  /* Secci\u00f3n extra para Otros: forma del marcador + selector multi-d\u00eda */
  var curShape=isEdit&&ev.shape?ev.shape:'circle';
  var curDates=isEdit&&Array.isArray(ev.dates)?ev.dates.slice():[];
  h+='<div class="ev-field ev-otros-extras" id="evFOtrosExtras" style="display:'+(isOtros?'block':'none')+'">';
  h+='<label>\u25B8 Forma del marcador</label>';
  h+='<div class="ev-shape-picker" id="evFShapePicker">';
  var _shapes=[
    {k:'circle',  label:'C\u00edrculo'},
    {k:'square',  label:'Cuadrado'},
    {k:'diamond', label:'Rombo'},
    {k:'x-thick', label:'X gorda'},
    {k:'x-thin',  label:'X fina'},
    {k:'rounded', label:'Redondeado'}
  ];
  _shapes.forEach(function(s){
    var sel=(s.k===curShape)?' selected':'';
    var prevColor=color||EV_COLORS[0];
    h+='<button type="button" class="ev-shape-opt'+sel+'" data-shape="'+s.k+'" title="'+s.label+'" aria-label="'+s.label+'">';
    if(s.k==='x-thick'||s.k==='x-thin'){
      /* SVG con doble stroke (negro+color) — borde uniforme */
      var swOut=s.k==='x-thick'?9:5.5;
      var swIn =s.k==='x-thick'?5:2.6;
      h+='<span class="ev-shape-preview ev-shape-'+s.k+'">';
      h+='<svg viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet">';
      h+='<path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="#000" stroke-width="'+swOut+'" stroke-linecap="round" fill="none"/>';
      h+='<path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="'+prevColor+'" stroke-width="'+swIn+'" stroke-linecap="round" fill="none" class="ev-shape-x-color"/>';
      h+='</svg>';
      h+='</span>';
    } else {
      h+='<span class="ev-shape-preview ev-shape-'+s.k+'" style="color:'+prevColor+'"></span>';
    }
    h+='</button>';
  });
  h+='</div>';
  h+='<div style="margin-top:12px">';
  h+='<label>\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda</label>';
  h+='<button type="button" class="ev-btn" id="evFPickDates" style="width:100%;margin-top:4px;font-size:.78rem;padding:8px 10px">';
  h+='<span id="evFPickDatesLbl">'+(curDates.length>1?(curDates.length+' d\u00edas seleccionados \u2014 pulsa para editar'):'\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda\u2026')+'</span>';
  h+='</button>';
  h+='<div style="font-size:.62rem;color:var(--text-dim);margin-top:4px;line-height:1.4">Si seleccionas <b>m\u00e1s de un d\u00eda</b>, el evento aparecer\u00e1 en cada uno de esos d\u00edas e ignorar\u00e1 las fechas de inicio/fin de abajo.</div>';
  h+='</div>';
  h+='</div>';
  /* Inicio/Fin: deshabilitados si hay multid\u00eda activo */
  var _multiActive=curDates.length>1;
  h+='<div class="ev-field ev-date-row'+(_multiActive?' ev-dates-locked':'')+'" id="evFDateRow">';
  h+='<div><label>Inicio</label><input class="ev-input" id="evFStart" type="date" value="'+start+'"'+(_multiActive?' disabled':'')+'></div>';
  h+='<div><label>Fin</label><input class="ev-input" id="evFEnd" type="date" value="'+end+'"'+(_multiActive?' disabled':'')+'></div>';
  h+='<div class="ev-dates-locked-note" id="evFDatesLockedNote" style="display:'+(_multiActive?'block':'none')+'">Estas fechas se ignoran porque hay <b>Selecci\u00f3n Multid\u00eda</b> activa.</div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Repetici\u00f3n</label>';
  h+='<select class="ev-input" id="evFRepeat">';
  h+='<option value="none"'+(repType==='none'?' selected':'')+'>Sin repetici\u00f3n</option>';
  h+='<option value="weekly"'+(repType==='weekly'?' selected':'')+'>Semanal</option>';
  h+='<option value="monthly-date"'+(repType==='monthly-date'?' selected':'')+'>Mensual (mismo d\u00eda)</option>';
  h+='<option value="monthly-first"'+(repType==='monthly-first'?' selected':'')+'>Mensual (d\u00eda 1)</option>';
  h+='<option value="yearly"'+(repType==='yearly'?' selected':'')+'>Anual</option>';
  h+='</select></div>';
  h+='<div class="ev-weekday-row" id="evWdRow" style="display:'+(repType==='weekly'?'flex':'none')+'">';
  for(var w=0;w<7;w++){
    var on2=wdays.indexOf(w)!==-1?' on':'';
    h+='<button class="ev-wd-btn'+on2+'" data-wd="'+w+'">'+wdNames[w]+'</button>';
  }
  h+='</div>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="evFSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}

/* ── Apertura/cierre del formulario ─────────────────────── */
function openEvForm(ev,prefillDate,container){
  EV_EDIT=ev||null;
  EV_FORM_CONTAINER=container||null;
  var ov=container||document.getElementById('eventsOverlay');
  ov.scrollTop=0;
  var wrap=document.createElement('div');
  wrap.id='evFWrap';
  wrap.innerHTML=renderEvForm(ev);
  ov.appendChild(wrap);
  if(prefillDate&&!ev){
    setTimeout(function(){
      var si=document.getElementById('evFStart');
      var ei=document.getElementById('evFEnd');
      if(si)si.value=prefillDate;
      if(ei)ei.value=prefillDate;
    },10);
  }
  requestAnimationFrame(function(){
    var fo=document.getElementById('evFormOv');
    if(fo)fo.classList.add('open');
  });
  bindEvFormEvents();
}

function closeEvForm(){
  var fo=document.getElementById('evFormOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){
    var w=document.getElementById('evFWrap');
    if(w)w.remove();
    EV_EDIT=null;
    EV_FORM_CONTAINER=null;
  },300);
}

/* === Mini-overlay para elegir d\u00edas espec\u00edficos (Otros) === */
function openOtrosDatePicker(initialDates,color,year,onAccept){
  var sel={};(initialDates||[]).forEach(function(d){sel[d]=true;});
  var curYear=year||(new Date()).getFullYear();
  var MNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  function _evDk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function _count(){var n=0;for(var k in sel){if(sel[k])n++;}return n;}
  function _render(){
    var n=_count();
    var h='<div class="dp-overlay" id="dpOv">';
    h+='<div class="dp-sheet">';
    h+='<div class="dp-handle"></div>';
    h+='<div class="dp-hdr">';
    h+='<button class="sy-back" id="dpClose">&#8592;</button>';
    h+='<div class="dp-title">Selecci\u00f3n Multid\u00eda</div>';
    h+='<div style="width:36px"></div>';
    h+='</div>';
    h+='<div class="dp-yearnav"><button id="dpYrPrev">&#9664;</button><span>'+curYear+'</span><button id="dpYrNext">&#9654;</button></div>';
    h+='<div class="dp-counter"><b>'+n+'</b> d\u00edas seleccionados</div>';
    h+='<div class="dp-grid">';
    for(var m=0;m<12;m++){
      h+='<div class="dp-month">';
      h+='<div class="dp-mname">'+MNS[m]+'</div>';
      h+='<div class="dp-mhdr">';
      ['L','M','X','J','V','S','D'].forEach(function(x){h+='<div class="dp-mhdr-c">'+x+'</div>';});
      h+='</div>';
      h+='<div class="dp-days">';
      var first=new Date(curYear,m,1),last=new Date(curYear,m+1,0);
      var dow=first.getDay();var off=dow===0?6:dow-1;
      for(var p=0;p<off;p++)h+='<div class="dp-day out"></div>';
      for(var d=1;d<=last.getDate();d++){
        var dt=new Date(curYear,m,d);var ds=_evDk(dt);
        var isWk=dt.getDay()===0||dt.getDay()===6;
        var isSel=!!sel[ds];
        var cls='dp-day'+(isWk?' wk':'')+(isSel?' sel':'');
        var sty=isSel?(' style="background:'+color+';color:#fff;border-color:'+color+'"'):'';
        h+='<div class="'+cls+'" data-ds="'+ds+'"'+sty+'>'+d+'</div>';
      }
      h+='</div></div>';
    }
    h+='</div>';
    h+='<div class="dp-actions">';
    h+='<button class="ev-btn" id="dpClear">Vaciar</button>';
    h+='<button class="ev-btn primary" id="dpAccept">Aceptar ('+n+')</button>';
    h+='</div>';
    h+='</div></div>';
    return h;
  }
  function _attach(){
    var ovEl=document.getElementById('dpOv');
    if(!ovEl)return;
    document.getElementById('dpClose').addEventListener('click',_close);
    document.getElementById('dpYrPrev').addEventListener('click',function(){curYear--;_rerender();});
    document.getElementById('dpYrNext').addEventListener('click',function(){curYear++;_rerender();});
    document.getElementById('dpClear').addEventListener('click',function(){sel={};_rerender();});
    document.getElementById('dpAccept').addEventListener('click',function(){
      var arr=[];for(var k in sel){if(sel[k])arr.push(k);}
      arr.sort();
      _close();
      if(typeof onAccept==='function')onAccept(arr);
    });
    /* Toggle d\u00eda */
    document.querySelectorAll('#dpOv .dp-day[data-ds]').forEach(function(el){
      el.addEventListener('click',function(){
        var ds=el.dataset.ds;
        if(sel[ds])delete sel[ds];else sel[ds]=true;
        if(sel[ds]){
          el.classList.add('sel');
          el.style.background=color;el.style.color='#fff';el.style.borderColor=color;
        }else{
          el.classList.remove('sel');
          el.style.background='';el.style.color='';el.style.borderColor='';
        }
        var n=_count();
        var c=document.querySelector('#dpOv .dp-counter b');if(c)c.textContent=n;
        var a=document.getElementById('dpAccept');if(a)a.textContent='Aceptar ('+n+')';
      });
    });
  }
  function _rerender(){
    var ovEl=document.getElementById('dpOv');
    if(!ovEl)return;
    var parent=ovEl.parentNode;
    parent.innerHTML=_render();
    requestAnimationFrame(function(){var fo=document.getElementById('dpOv');if(fo)fo.classList.add('open');});
    _attach();
  }
  function _close(){
    var fo=document.getElementById('dpOv');
    if(fo)fo.classList.remove('open');
    setTimeout(function(){var w=document.getElementById('dpWrap');if(w)w.remove();},300);
  }
  /* Insertar overlay encima del form */
  var host=document.getElementById('eventsOverlay')||document.body;
  var wrap=document.createElement('div');wrap.id='dpWrap';
  wrap.innerHTML=_render();
  host.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('dpOv');
    if(fo)fo.classList.add('open');
  });
  _attach();
}

function bindEvFormEvents(){
  document.getElementById('evFClose').addEventListener('click',closeEvForm);
  var noteEl=document.getElementById('evFNote');
  var cntEl=document.getElementById('evCharCnt');
  noteEl.addEventListener('input',function(){cntEl.textContent=noteEl.value.length+'/200';});
  var _fCpWrap=document.getElementById('evFWrap')||document;
  var _fCp=_bindColorPicker(_fCpWrap,'evFCp');
  /* Track selected type hex (from the type picker) */
  var _selectedTypeHex=null;
  var _colorSection=document.getElementById('evFColorSection');
  var _otrosExtras=document.getElementById('evFOtrosExtras');
  /* Estado local de la secci\u00f3n Otros */
  var _otrosShape=(EV_EDIT&&EV_EDIT.shape)?EV_EDIT.shape:'circle';
  var _otrosDates=(EV_EDIT&&Array.isArray(EV_EDIT.dates))?EV_EDIT.dates.slice():[];
  function _refreshShapePreviews(){
    var col=_fCp&&_fCp.getColor?_fCp.getColor():(EV_EDIT?EV_EDIT.color:EV_COLORS[0]);
    document.querySelectorAll('#evFShapePicker .ev-shape-preview').forEach(function(p){p.style.color=col;});
    /* X-shapes: actualizar el stroke del path color (no usan currentColor) */
    document.querySelectorAll('#evFShapePicker .ev-shape-x-color').forEach(function(path){path.setAttribute('stroke',col);});
  }
  function _refreshPickDatesLabel(){
    var lbl=document.getElementById('evFPickDatesLbl');
    if(lbl){
      if(_otrosDates.length>1)lbl.textContent=_otrosDates.length+' d\u00edas seleccionados \u2014 pulsa para editar';
      else lbl.textContent='\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda\u2026';
    }
    /* Bloqueo visual de Inicio/Fin cuando hay multid\u00eda */
    var locked=_otrosDates.length>1;
    var row=document.getElementById('evFDateRow');
    var startEl=document.getElementById('evFStart');
    var endEl=document.getElementById('evFEnd');
    var note=document.getElementById('evFDatesLockedNote');
    if(row)row.classList.toggle('ev-dates-locked',locked);
    if(startEl)startEl.disabled=locked;
    if(endEl)endEl.disabled=locked;
    if(note)note.style.display=locked?'block':'none';
  }
  /* Type selector click handler */
  document.querySelectorAll('.ev-color-swatch').forEach(function(sw){
    sw.addEventListener('click',function(){
      document.querySelectorAll('.ev-color-swatch').forEach(function(s){s.classList.remove('selected');});
      sw.classList.add('selected');
      var hex=sw.dataset.hex;
      _selectedTypeHex=hex;
      var typeName=EV_COLOR_TYPES[hex]||'Otros';
      var isViaje=(typeName==='Viaje');
      var isOtros=(typeName==='Otros');
      if(_colorSection)_colorSection.style.display=(isViaje||isOtros)?'block':'none';
      if(_otrosExtras)_otrosExtras.style.display=isOtros?'block':'none';
      var titleEl=document.getElementById('evFTitle');
      if(hex==='#1d4ed8'&&titleEl&&!titleEl.value.trim()){
        titleEl.value='Asturias';
        var noteEl2=document.getElementById('evFNote');
        if(noteEl2&&!noteEl2.value.trim()){noteEl2.value='Asturias';cntEl.textContent='8/200';}
      }
    });
  });
  /* Shape picker (Otros) */
  document.querySelectorAll('#evFShapePicker .ev-shape-opt').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('#evFShapePicker .ev-shape-opt').forEach(function(x){x.classList.remove('selected');});
      b.classList.add('selected');
      _otrosShape=b.dataset.shape;
    });
  });
  /* Bot\u00f3n elegir d\u00edas espec\u00edficos */
  var _pickBtn=document.getElementById('evFPickDates');
  if(_pickBtn){
    _pickBtn.addEventListener('click',function(){
      var col=_fCp&&_fCp.getColor?_fCp.getColor():(EV_EDIT?EV_EDIT.color:EV_COLORS[0]);
      var startEl=document.getElementById('evFStart');
      var yr=startEl&&startEl.value?parseInt(startEl.value.slice(0,4),10):(new Date()).getFullYear();
      openOtrosDatePicker(_otrosDates,col,yr,function(newDates){
        _otrosDates=newDates.slice().sort();
        _refreshPickDatesLabel();
      });
    });
  }
  /* Refrescar previews de formas cuando cambia el color */
  var _picker=document.getElementById('evFCp');
  if(_picker){_picker.addEventListener('click',function(){setTimeout(_refreshShapePreviews,50);});}
  var _hexInput=document.querySelector('#evFCp input[type=text],#evFCp .ev-color-hex-input');
  if(_hexInput)_hexInput.addEventListener('input',_refreshShapePreviews);
  document.getElementById('evFRepeat').addEventListener('change',function(){
    document.getElementById('evWdRow').style.display=this.value==='weekly'?'flex':'none';
  });
  document.querySelectorAll('.ev-wd-btn').forEach(function(btn){
    btn.addEventListener('click',function(){btn.classList.toggle('on');});
  });
  var delBtn=document.getElementById('evFDel');
  if(delBtn){
    delBtn.addEventListener('click',function(){
      if(!EV_EDIT)return;
      var deleted=EV_EDIT;
      var deletedIdx=-1;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===deleted.id){deletedIdx=i;break;}}
      EVENTS=EVENTS.filter(function(e){return e.id!==deleted.id;});
      saveEvents();updateEventsBtn();
      closeEvForm();
      setTimeout(function(){
        refreshEvents();
        showToast('Evento eliminado','success',function(){
          if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
          saveEvents();updateEventsBtn();refreshEvents();
        });
      },320);
    });
  }
  document.getElementById('evFSave').addEventListener('click',function(){
    var title=document.getElementById('evFTitle').value.trim();
    if(!title){showToast('El t\u00edtulo es obligatorio','error');return;}
    var note=document.getElementById('evFNote').value.trim();
    /* Determine color: use type hex, unless Viaje → use color picker */
    var typeSel=document.querySelector('.ev-color-swatch.selected');
    var typeHex=typeSel?typeSel.dataset.hex:EV_COLORS[0];
    var typeLabel=EV_COLOR_TYPES[typeHex]||'Otros';
    var color;
    if(typeLabel==='Viaje'||typeLabel==='Otros'){
      /* Viaje/Otros: usar color del picker */
      color=_fCp.getColor();
    } else {
      /* Otros tipos: usar el color fijo del tipo */
      color=typeHex;
    }
    var start=document.getElementById('evFStart').value;
    var end=document.getElementById('evFEnd').value;
    if(!start){showToast('La fecha de inicio es obligatoria','error');return;}
    if(!end||end<start)end=start;
    var repType=document.getElementById('evFRepeat').value;
    var repeat=null;
    if(repType==='weekly'){
      var wdays=[];
      document.querySelectorAll('.ev-wd-btn.on').forEach(function(b){wdays.push(+b.dataset.wd);});
      if(!wdays.length){showToast('Selecciona al menos un d\u00eda','error');return;}
      repeat={type:'weekly',weekDays:wdays};
    }else if(repType!=='none'){repeat={type:repType};}
    /* Otros: incluir dates (>1) y shape personalizada */
    var _saveDates=null,_saveShape=null;
    if(typeLabel==='Otros'){
      if(typeof _otrosDates!=='undefined'&&_otrosDates&&_otrosDates.length>1)_saveDates=_otrosDates.slice().sort();
      if(typeof _otrosShape!=='undefined'&&_otrosShape)_saveShape=_otrosShape;
    }
    if(EV_EDIT){
      var idx=-1;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===EV_EDIT.id){idx=i;break;}}
      if(idx!==-1){
        var _newEv={id:EV_EDIT.id,title:title,note:note,color:color,type:typeLabel,start:start,end:end,repeat:repeat};
        if(_saveDates)_newEv.dates=_saveDates;
        if(_saveShape)_newEv.shape=_saveShape;
        EVENTS[idx]=_newEv;
      }
      showToast('Evento actualizado','success');
    }else{
      var _newEv2={id:'ev-'+Date.now(),title:title,note:note,color:color,type:typeLabel,start:start,end:end,repeat:repeat};
      if(_saveDates)_newEv2.dates=_saveDates;
      if(_saveShape)_newEv2.shape=_saveShape;
      EVENTS.push(_newEv2);
      showToast('Evento a\u00f1adido','success');
    }
    saveEvents();updateEventsBtn();
    closeEvForm();
    setTimeout(function(){refreshEvents();},320);
  });
}

/* ── Apertura/cierre de la ventana ──────────────────────── */
/* ── Panel de alarma para eventos próximos ── */
function renderEvAlarmPanel(ev,firstDate){
  var isSet=isEvAlarmSet(ev.id);
  var fd2=function(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');};
  var today=new Date();today.setHours(0,0,0,0);
  var diff=Math.round((firstDate-today)/86400000);
  var diffLbl=diff===0?'\u00a1Hoy!':diff===1?'Ma\u00f1ana':diff>0?'en '+diff+' d\u00edas':'En curso';
  var h='<div class="ev-alarm-overlay" id="evAlarmOv"><div class="bd-alarm-sheet">';
  h+='<div class="bd-alarm-handle"></div>';
  h+='<div class="bd-alarm-hdr"><button class="sy-back" id="evAlarmClose">&#8592;</button>';
  h+='<div class="bd-alarm-title">&#128276; Alarma evento</div><div style="width:36px"></div></div>';
  var note=ev.note&&ev.note.trim()?escHtml(ev.note):'<span style="opacity:.45;font-style:italic">Sin descripci\u00f3n</span>';
  h+='<div class="bd-alarm-info" style="border-color:'+ev.color+'44;background:'+ev.color+'11">';
  h+='<div class="bd-alarm-name" style="color:'+ev.color+'">'+escHtml(ev.title)+'</div>';
  h+='<div class="bd-alarm-date">'+fd2(firstDate)+' \u00b7 '+diffLbl+'</div>';
  h+='<div class="ev-alarm-note">'+note+'</div></div>';
  // Permanent 3-zone alarm marker
  h+='<div class="bd-alarm-marker-row">';
  h+='<div class="bd-alarm-marker-text">Marcar alarma como configurada</div>';
  h+='<div class="bd-alarm-marker-bell">'+(isSet?'&#128276;':'&#128277;')+'</div>';
  h+='<div class="bd-alarm-marker-btns">';
  h+='<button class="bd-alarm-marker-btn quitar'+(isSet?'':' active')+'" id="evAlarmUnmark">Quitar</button>';
  h+='<button class="bd-alarm-marker-btn poner'+(isSet?' active':'')+'" id="evAlarmPoner">Poner</button>';
  h+='</div>';
  h+='</div>';
  var _evT=typeof nextAlarmTime==='function'?nextAlarmTime(firstDate,15,2):{h:15,m:2};
  h+='<div class="bd-alarm-row" style="margin:16px 0">';
  h+='<span class="bd-alarm-row-lbl">&#128276; Hora de la alarma<br><span style="font-size:.65rem;opacity:.7">D\u00eda del evento: '+fd2(firstDate)+'</span></span>';
  h+='<div class="bd-alarm-time"><input id="evAlarmH" type="number" min="0" max="23" value="'+_evT.h+'"><span class="bd-alarm-time-sep">:</span><input id="evAlarmM" type="number" min="0" max="59" value="'+String(_evT.m).padStart(2,'0')+'"></div>';
  h+='</div>';
  h+='<div class="ev-form-actions">';
  h+='<button class="ev-btn primary" id="evAlarmCreate">&#128276; Crear alarma</button>';
  h+='<button class="ev-btn ev-edit-orange" id="evAlarmEdit">&#9998; Editar evento</button>';
  h+='</div></div></div>';
  return h;
}
function openEvAlarm(ev,firstDate){
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='evAlarmWrap';
  wrap.innerHTML=renderEvAlarmPanel(ev,firstDate);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('evAlarmOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeEvAlarm();});}
  });
  bindEvAlarmEvents(ev,firstDate);
}
function closeEvAlarm(){
  var fo=document.getElementById('evAlarmOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){
    var w=document.getElementById('evAlarmWrap');if(w)w.remove();
    refreshEvents();
    if(typeof refreshBday==='function')refreshBday();
  },300);
}
/* Abre el panel de cumpleaños VIP desde la ventana de eventos */
function openBdayAlarmFromEvents(b){
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='bdAlarmWrap';
  wrap.innerHTML=typeof renderBdayAlarmPanel==='function'?renderBdayAlarmPanel(b):'';
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bdAlarmOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo&&typeof closeBdayAlarm==='function')closeBdayAlarm();});}
  });
  if(typeof bindBdayAlarmEvents==='function')bindBdayAlarmEvents(b);
}
function bindEvAlarmEvents(ev,firstDate){
  document.getElementById('evAlarmClose').addEventListener('click',closeEvAlarm);
  // 3-zone marker: Quitar
  var unmarkBtn=document.getElementById('evAlarmUnmark');
  if(unmarkBtn)unmarkBtn.addEventListener('click',function(e){
    e.stopPropagation();
    setEvAlarmState(ev.id,false);
    showToast('Marca eliminada','success');
    var bellEl=document.querySelector('#evAlarmOv .bd-alarm-marker-bell');
    if(bellEl)bellEl.innerHTML='&#128277;';
    unmarkBtn.classList.add('active');
    var ponerBtn=document.getElementById('evAlarmPoner');
    if(ponerBtn)ponerBtn.classList.remove('active');
    refreshEvents();
    if(typeof refreshBday==='function')refreshBday();
  });
  // 3-zone marker: Poner
  var ponerBtn=document.getElementById('evAlarmPoner');
  if(ponerBtn)ponerBtn.addEventListener('click',function(e){
    e.stopPropagation();
    setEvAlarmState(ev.id,true);
    showToast('\u2713 Alarma marcada como configurada','success');
    var bellEl=document.querySelector('#evAlarmOv .bd-alarm-marker-bell');
    if(bellEl)bellEl.innerHTML='&#128276;';
    ponerBtn.classList.add('active');
    var uBtn=document.getElementById('evAlarmUnmark');
    if(uBtn)uBtn.classList.remove('active');
    refreshEvents();
    if(typeof refreshBday==='function')refreshBday();
  });
  var editBtn=document.getElementById('evAlarmEdit');
  if(editBtn)editBtn.addEventListener('click',function(){
    closeEvAlarm();setTimeout(function(){openEvForm(ev,null);},310);
  });
  document.getElementById('evAlarmCreate').addEventListener('click',function(){
    var alarmUrl=localStorage.getItem('excelia-alarm-url')||'';
    if(!alarmUrl){showToast('Configura la URL de MacroDroid en el men\u00fa \u22ef','error');return;}
    var hr=parseInt(document.getElementById('evAlarmH').value,10);
    var h=isNaN(hr)?15:Math.min(23,Math.max(0,hr));
    var mr=parseInt(document.getElementById('evAlarmM').value,10);
    var m=isNaN(mr)?2:Math.min(59,Math.max(0,mr));
    var msg='\uD83D\uDCC5 '+ev.title+' '+String(firstDate.getDate()).padStart(2,'0')+'/'+String(firstDate.getMonth()+1).padStart(2,'0');
    var base=normalizeMacroBase(alarmUrl);
    var dayOfAlarm=firstDate.getDay()+1;
    var url=base+'/generar_alarma1?alarmH='+h+'&alarmM='+m+'&alarmMsg='+encodeURIComponent(msg)+'&alarmDays='+dayOfAlarm;
    // Registrar localmente ANTES del fetch (alarma siempre guardada aunque MacroDroid falle)
    var fmtD=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
    if(typeof addAlarm==='function'){
      addAlarm({type:'event',label:msg,hour:h,minute:m,days:[dayOfAlarm],targetDate:fmtD(firstDate)});
    }
    setEvAlarmState(ev.id,true);
    showToast('Enviando alarma a MacroDroid\u2026','success');
    fetch(url,{mode:'no-cors'})
      .then(function(){showToast('\u23f0 Alarma creada \u2014 '+escHtml(ev.title),'success');closeEvAlarm();setTimeout(refreshEvents,320);})
      .catch(function(){showToast('\u23f0 Alarma guardada (sin conexi\u00f3n a MacroDroid)','success');closeEvAlarm();setTimeout(refreshEvents,320);});
  });
  var mInp=document.getElementById('evAlarmM');
  if(mInp)mInp.addEventListener('blur',function(){
    var v=parseInt(this.value,10);
    if(!isNaN(v))this.value=String(Math.min(59,Math.max(0,v))).padStart(2,'0');
  });
}

function openEvents(){
  NAV_BACK=null;
  loadEvAlarms();
  var now=new Date();EV_YEAR=now.getFullYear();EV_MONTH=now.getMonth();EV_VIEW='upcoming';
  var ov=document.getElementById('eventsOverlay');
  document.getElementById('eventsContent').innerHTML=renderEvContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindEvEvents();});});
}

function closeEvents(){
  var ov=document.getElementById('eventsOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

/* Abre la ventana de eventos sin resetear EV_YEAR/EV_MONTH/EV_VIEW (para navegación desde summary) */
function openEventsAt(){
  var ov=document.getElementById('eventsOverlay');
  document.getElementById('eventsContent').innerHTML=renderEvContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindEvEvents();});});
}

function refreshEvents(){
  document.getElementById('eventsContent').innerHTML=renderEvContent();
  bindEvEvents();
}

function bindEvEvents(){
  document.getElementById('evBack').addEventListener('click',function(){
    if(EV_VIEW==='cal'&&(EV_PREV_VIEW==='annual'||EV_PREV_VIEW==='quad')){
      EV_VIEW=EV_PREV_VIEW;EV_PREV_VIEW=null;refreshEvents();
    }else if(NAV_BACK){var fn=NAV_BACK;NAV_BACK=null;fn();}
    else{closeEvents();}
  });
  bindNavBar('events',closeEvents);
  function _scrollWeekToMonth(y,m){
    setTimeout(function(){
      var key=y+'-'+String(m+1).padStart(2,'0');
      var el=document.getElementById('ev-wk-month-'+key);
      var body=document.querySelector('.sy-body');
      if(el&&body)body.scrollTop=el.offsetTop-4;
    },30);
  }
  var prevBtn=document.getElementById('evPrev');
  if(prevBtn)prevBtn.addEventListener('click',function(){
    if(EV_VIEW==='annual'||EV_VIEW==='puentes'||EV_VIEW==='time-off'){EV_YEAR--;}
    else if(EV_VIEW==='quad'){EV_QUAD_MONTH--;if(EV_QUAD_MONTH<0){EV_QUAD_MONTH=11;EV_QUAD_YEAR--;}}
    else if(EV_VIEW==='week'){EV_MONTH--;if(EV_MONTH<0){EV_MONTH=11;EV_YEAR--;}refreshEvents();_scrollWeekToMonth(EV_YEAR,EV_MONTH);return;}
    else{EV_MONTH--;if(EV_MONTH<0){EV_MONTH=11;EV_YEAR--;}}
    refreshEvents();
  });
  var nextBtn=document.getElementById('evNext');
  if(nextBtn)nextBtn.addEventListener('click',function(){
    if(EV_VIEW==='annual'||EV_VIEW==='puentes'||EV_VIEW==='time-off'){EV_YEAR++;}
    else if(EV_VIEW==='quad'){EV_QUAD_MONTH++;if(EV_QUAD_MONTH>11){EV_QUAD_MONTH=0;EV_QUAD_YEAR++;}}
    else if(EV_VIEW==='week'){EV_MONTH++;if(EV_MONTH>11){EV_MONTH=0;EV_YEAR++;}refreshEvents();_scrollWeekToMonth(EV_YEAR,EV_MONTH);return;}
    else{EV_MONTH++;if(EV_MONTH>11){EV_MONTH=0;EV_YEAR++;}}
    refreshEvents();
  });
  var qPrev2Btn=document.getElementById('evQuadPrev2');
  if(qPrev2Btn)qPrev2Btn.addEventListener('click',function(){
    var qi=EV_QUAD_MONTH<4?0:EV_QUAD_MONTH<8?1:2;
    qi--;if(qi<0){qi=2;EV_QUAD_YEAR--;}
    EV_QUAD_MONTH=[0,4,8][qi];refreshEvents();
  });
  var qNext2Btn=document.getElementById('evQuadNext2');
  if(qNext2Btn)qNext2Btn.addEventListener('click',function(){
    var qi=EV_QUAD_MONTH<4?0:EV_QUAD_MONTH<8?1:2;
    qi++;if(qi>2){qi=0;EV_QUAD_YEAR++;}
    EV_QUAD_MONTH=[0,4,8][qi];refreshEvents();
  });
  /* Posicionamiento exacto del día Hoy en Agenda Semanal:
     usa getBoundingClientRect (más fiable que offsetTop con grid CSS y sticky)
     y descuenta dinámicamente la altura del separador de mes sticky.
     El CSS scroll-margin-top en #ev-wk-today-row hace de fallback. */
  function _scrollWeekToToday(){
    /* doble rAF para asegurar que el grid ha completado su layout */
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      var r=document.getElementById('ev-wk-today-row');
      var b=document.querySelector('.sy-body');
      if(!r||!b)return;
      var rRect=r.getBoundingClientRect();
      var bRect=b.getBoundingClientRect();
      /* Detectar el sticky month separator activo (puede que haya varios; el visible es el último ≤ rRect.top) */
      var seps=b.querySelectorAll('.ev-wk-month-sep');
      var stickyH=0;
      seps.forEach(function(s){
        var sRect=s.getBoundingClientRect();
        if(sRect.top<=bRect.top+1)stickyH=Math.max(stickyH,s.offsetHeight);
      });
      var BUFFER=8; /* aire entre el separador y el día Hoy */
      var delta=(rRect.top-bRect.top)-stickyH-BUFFER;
      b.scrollTop=Math.max(0,b.scrollTop+delta);
    });});
  }
  var todayBtn=document.getElementById('evToday');
  if(todayBtn)todayBtn.addEventListener('click',function(){
    var n=new Date();EV_YEAR=n.getFullYear();EV_MONTH=n.getMonth();
    EV_QUAD_YEAR=n.getFullYear();EV_QUAD_MONTH=n.getMonth();
    refreshEvents();
    if(EV_VIEW==='week')_scrollWeekToToday();
  });
  var weekViewBtn=document.getElementById('evViewWeek');
  if(weekViewBtn)weekViewBtn.addEventListener('click',function(){
    var n=new Date();EV_YEAR=n.getFullYear();EV_MONTH=n.getMonth();
    EV_VIEW='week';EV_EDIT_MODE=false;refreshEvents();
    _scrollWeekToToday();
  });
  var brightBtn=document.getElementById('evBright');
  if(brightBtn)brightBtn.addEventListener('click',function(){
    EV_BRIGHT_PAST=!EV_BRIGHT_PAST;refreshEvents();
  });
  document.getElementById('evViewUpcoming').addEventListener('click',function(){EV_VIEW='upcoming';EV_EDIT_MODE=false;refreshEvents();});
  document.getElementById('evViewCal').addEventListener('click',function(){EV_VIEW='cal';EV_EDIT_MODE=false;EV_PREV_VIEW=null;refreshEvents();});
  document.getElementById('evViewQuad').addEventListener('click',function(){EV_VIEW='quad';EV_EDIT_MODE=false;refreshEvents();});
  document.getElementById('evViewAnnual').addEventListener('click',function(){EV_VIEW='annual';EV_EDIT_MODE=false;refreshEvents();});
  document.getElementById('evViewMonths').addEventListener('click',function(){EV_VIEW='months';EV_EDIT_MODE=false;refreshEvents();});
  document.getElementById('evViewPuentes').addEventListener('click',function(){EV_VIEW='puentes';EV_EDIT_MODE=false;refreshEvents();});
  document.getElementById('evViewTimeOff').addEventListener('click',function(){EV_VIEW='time-off';EV_EDIT_MODE=false;refreshEvents();});
  // Dropdown de vista anual (reemplaza los dos botones anteriores)
  var _vdBtn=document.getElementById('evAnnVdBtn');
  var _vdMenu=document.getElementById('evAnnVdMenu');
  if(_vdBtn&&_vdMenu){
    _vdBtn.addEventListener('click',function(e){e.stopPropagation();_vdMenu.classList.toggle('open');});
    document.addEventListener('click',function _closeVd(){_vdMenu.classList.remove('open');});
    _vdMenu.querySelectorAll('.ev-ann-vd-opt[data-view]').forEach(function(opt){
      opt.addEventListener('click',function(e){
        e.stopPropagation();
        EV_ANNUAL_VIEW=opt.dataset.view;
        _vdMenu.classList.remove('open');
        refreshEvents();
      });
    });
  }
  document.querySelectorAll('.ev-filter-chip[data-filter-type]').forEach(function(chip){
    chip.addEventListener('click',function(){
      var type=chip.dataset.filterType;
      var idx=EV_ANNUAL_FILTER_HIDDEN.indexOf(type);
      if(idx!==-1)EV_ANNUAL_FILTER_HIDDEN.splice(idx,1);
      else EV_ANNUAL_FILTER_HIDDEN.push(type);
      refreshEvents();
    });
  });
  var _evAddBtn=document.getElementById('evAdd');
  if(_evAddBtn)_evAddBtn.addEventListener('click',function(){
    if(EV_VIEW==='annual'||EV_VIEW==='quad'){EV_EDIT_MODE=!EV_EDIT_MODE;refreshEvents();}
    else{openEvForm(null);}
  });
  // Bind puentes/time-off summary body events
  if(EV_VIEW==='puentes')bindSummaryPuentesBodyEvents(refreshEvents,'eventsOverlay');
  else if(EV_VIEW==='time-off')bindSummaryTimeOffBodyEvents(refreshEvents);
  // PDF button for puentes/time-off
  var _evSyPdfBtn=document.getElementById('evSyPdf');
  if(_evSyPdfBtn)_evSyPdfBtn.addEventListener('click',function(){document.body.classList.add('print-summary');window.print();document.body.classList.remove('print-summary');});
  // Pencil edit button in annual/quad
  var _editBtn=document.getElementById('evAnnEditBtn');
  if(_editBtn){
    _editBtn.addEventListener('click',function(){
      EV_EDIT_MODE=!EV_EDIT_MODE;refreshEvents();
    });
  }
  // Click en barras/marcas de eventos en annual/quad (edit mode)
  document.querySelectorAll('.ev-annual-mbar[data-id],.ev-annual-x[data-id],.ev-annual-dot[data-id],.ev-annual-marker[data-id],.ev-annual-vip-star[data-id],.ev-annual-vip-dot[data-id]').forEach(function(el){
    el.addEventListener('click',function(e){
      if(!EV_EDIT_MODE)return;
      e.stopPropagation();
      var id=el.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  // Click en mes del calendario anual/quad: navegar o seleccionar día (modo añadir)
  document.querySelectorAll('.ev-annual-month[data-month]').forEach(function(card){
    card.addEventListener('click',function(e){
      // In edit mode, check for event click first (handled above), then day click
      if(EV_EDIT_MODE&&e.target.dataset.ds){
        openEvForm(null,e.target.dataset.ds);
      } else if(!EV_EDIT_MODE){
        EV_MONTH=parseInt(card.dataset.month);
        if(card.dataset.year)EV_YEAR=parseInt(card.dataset.year);
        EV_PREV_VIEW=EV_VIEW==='quad'?'quad':'annual';
        EV_VIEW='cal';
        refreshEvents();
      }
    });
  });
  // Click en badges/markers del calendario 1-mes → detail (no edit)
  document.querySelectorAll('.ev-badge[data-id], .ev-cell .ev-annual-marker[data-id]').forEach(function(badge){
    badge.addEventListener('click',function(e){
      e.stopPropagation();
      var id=badge.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  // Click en celda vacía → crear evento con fecha
  document.querySelectorAll('.ev-cell[data-ds]').forEach(function(cell){
    cell.addEventListener('click',function(e){
      if(e.target.classList.contains('ev-badge'))return;
      if(e.target.closest && e.target.closest('.ev-annual-marker'))return;
      openEvForm(null,cell.dataset.ds);
    });
  });
  // Click en items de próximos → panel de alarma (VIP bday → panel cumpleaños)
  document.querySelectorAll('.ev-upcoming-item[data-id]').forEach(function(item){
    item.addEventListener('click',function(){
      var id=item.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(!ev)return;
      // Cumpleaños VIP → panel de alarma de cumpleaños
      if(ev.id.indexOf('ev-bday-vip-')===0){
        var bday=_findBdayByEvId(ev.id);
        if(bday){openBdayAlarmFromEvents(bday);return;}
      }
      // Evento regular → panel de alarma de evento
      var firstDs=item.dataset.first;
      var firstDate=firstDs?new Date(firstDs+'T00:00:00'):new Date(ev.start+'T00:00:00');
      openEvAlarm(ev,firstDate);
    });
  });
  // Click en item de lista → detail
  document.querySelectorAll('.ev-list-item').forEach(function(item){
    item.addEventListener('click',function(e){
      if(e.target.classList.contains('ev-list-btn'))return;
      var id=item.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  var pastChk=document.getElementById('evTypesPast');
  if(pastChk)pastChk.addEventListener('change',function(){EV_TYPES_PAST=this.checked;refreshEvents();});
  var typeSel=document.getElementById('evTypesFilter');
  if(typeSel)typeSel.addEventListener('change',function(){EV_TYPES_FILTER=this.value;refreshEvents();});
  // Click en barras multi-día → detail
  document.querySelectorAll('.ev-multi-bar[data-id]').forEach(function(bar){
    bar.addEventListener('click',function(e){
      e.stopPropagation();
      var id=bar.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  // Click en eventos de la agenda semanal (multi-día y chips puntuales)
  document.querySelectorAll('.ev-wk-multi[data-id],.ev-wk-chip[data-id]').forEach(function(el){
    el.addEventListener('click',function(e){
      e.stopPropagation();
      var id=el.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  document.querySelectorAll('.ev-list-btn.del').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var id=btn.dataset.id;
      EVENTS=EVENTS.filter(function(e){return e.id!==id;});
      saveEvents();updateEventsBtn();refreshEvents();
      showToast('Evento eliminado','success');
    });
  });
  var evExportEl=document.getElementById('evExport');
  if(evExportEl)evExportEl.addEventListener('click',function(){
    if(!EVENTS.length){showToast('No hay eventos para exportar','error');return;}
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(EVENTS,null,2));
    a.download='eventos.json';a.click();
  });
  var evImportEl=document.getElementById('evImport');
  if(evImportEl)evImportEl.addEventListener('click',function(){document.getElementById('evImportFile').click();});
  var evImportFileEl=document.getElementById('evImportFile');
  if(evImportFileEl)evImportFileEl.addEventListener('change',function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(evt){
      try{
        var arr=JSON.parse(evt.target.result);
        if(!Array.isArray(arr))throw new Error();
        EVENTS=arr;saveEvents();updateEventsBtn();refreshEvents();
        showToast('Eventos importados: '+EVENTS.length,'success');
      }catch(err){showToast('Error al importar el archivo','error');}
    };
    r.readAsText(f);
  });
  /* Swipe: navegar en el tiempo (el botón evPrev/evNext solo existe en vistas con nav) */
  addSwipe(document.getElementById('eventsOverlay'),function(){
    var b=document.getElementById('evNext');if(b)b.click();
  },function(){
    var b=document.getElementById('evPrev');if(b)b.click();
  });
  requestAnimationFrame(function(){ _positionEvBright(); });
}

function _positionEvBright(){
  var bright=document.getElementById('evBright');
  var nextBtn=document.getElementById('evNext');
  var todayBtn=document.getElementById('evToday');
  if(!bright||!nextBtn||!todayBtn)return;
  if(!bright.classList.contains('ev-bright-mid'))return;
  var hdr=nextBtn.closest('.sy-header');
  if(!hdr)return;
  var hdrL=hdr.getBoundingClientRect().left;
  var nR=nextBtn.getBoundingClientRect().right-hdrL;
  var tL=todayBtn.getBoundingClientRect().left-hdrL;
  bright.style.left=(((nR+tL)/2)-(bright.offsetWidth/2))+'px';
  bright.style.right='auto';
}
