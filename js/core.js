/* ============================================================
   CORE — Estado, utilidades, render principal
   ============================================================ */

// ── Versión de la app (actualizar en cada push significativo) ─
var APP_VERSION = 'v518 — Acceso a Outlook y avisos de semanas y facturas';

// ── MacroDroid: normalizar URL base (quita trailing slash y nombre de macro) ─
function normalizeMacroBase(url){
  url=(url||'').trim().replace(/\/+$/,'');
  var m=url.match(/^(https?:\/\/trigger\.macrodroid\.com\/[^\/]+)/);
  if(m)return m[1];
  url=url.replace(/\/(generar_alarma1|generar_alarma2|apagar_alarmas)$/,'');
  return url;
}

// ── Swipe horizontal (umbral 50px, ignora si el gesto es más vertical) ─────
function addSwipe(el, onLeft, onRight){
  if(!el||el._swipeAdded)return;
  el._swipeAdded=true;
  var _sx=0,_sy=0,_skip=false;
  var resolve=swipeContentResolver(el),live=null,offset=0,stop=null;
  /* ¿el gesto empezó dentro de un contenedor con scroll horizontal propio?
     Si es así, el swipe es para mover la tabla, no para cambiar de pestaña. */
  function startedInScrollX(node){
    while(node&&node!==el){
      if(node.nodeType===1&&node.scrollWidth>node.clientWidth+1){
        var ox=getComputedStyle(node).overflowX;
        if(ox==='auto'||ox==='scroll')return true;
      }
      node=node.parentNode;
    }
    return false;
  }
  /* Si el gesto empieza dentro de un panel abierto (o dentro de otro elemento
     que ya tiene su propio swipe), manda el de dentro: si no, deslizar en el
     carrusel de un dia cambiaba ademas el mes de fondo. */
  function startedInPanel(node){
    while(node&&node!==el){
      if(node.nodeType===1){
        if(node._swipeAdded)return true;
        var cl=node.classList;
        if(cl&&(cl.contains('ev-detail-overlay')||cl.contains('ev-form-overlay')
              ||cl.contains('ev-alarm-overlay')||cl.contains('bd-alarm-overlay')
              ||cl.contains('dp-overlay')||cl.contains('imp-mode-ov')))return true;
      }
      node=node.parentNode;
    }
    return false;
  }
  el.addEventListener('touchstart',function(e){
    if(stop)stop();if(live)live.cancel();stop=null;live=null;offset=0;
    _sx=e.touches[0].clientX;_sy=e.touches[0].clientY;
    _skip=e.touches.length!==1||startedInScrollX(e.target)||startedInPanel(e.target);
  },{passive:true});
  el.addEventListener('touchmove',function(e){
    if(_skip||e.touches.length!==1)return;
    var dx=e.touches[0].clientX-_sx,dy=e.touches[0].clientY-_sy;
    if(!live&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){_skip=true;return;}
    if(Math.abs(dx)<8||Math.abs(dx)<=Math.abs(dy))return;
    offset=dx;
    if(e.cancelable)e.preventDefault();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){if(!live)live=createLiveSwipe(el,resolve);if(live)live.move(dx);}
  },{passive:false});
  el.addEventListener('touchend',function(e){
    if(_skip||!e.changedTouches.length){if(live)live.cancel();live=null;return;}
    var dx=e.changedTouches[0].clientX-_sx;
    var dy=e.changedTouches[0].clientY-_sy;
    var commit=Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy),change=dx<0?onLeft:onRight;
    if(live){live.finish(commit,change);stop=live.cancel;live=null;return;}
    if(!commit)return;
    stop=animateContentSwipe(resolve,dx<0?onLeft:onRight,dx<0?-1:1,offset);
  },{passive:true});
  el.addEventListener('touchcancel',function(){_skip=true;if(live){live.finish(false);stop=live.cancel;live=null;}});
}

// ── Pulsación larga (500 ms) ─────────────────────────────────
// Para acciones destructivas que no deben quedar a un toque de distancia.
// Funciona con dedo y con ratón, y cancela si el dedo se mueve (scroll).
function addLongPress(el, cb, ms){
  if(!el||el._lpAdded)return;
  el._lpAdded=true;
  var t=null,sx=0,sy=0,movido=false;
  function start(x,y){
    movido=false;sx=x;sy=y;
    clearTimeout(t);
    t=setTimeout(function(){
      t=null;
      if(!movido){
        if(navigator.vibrate)try{navigator.vibrate(15);}catch(e){}
        /* Marca para que el click posterior (el dedo al levantarse) no
           dispare tambien la accion normal del elemento. */
        el._lpFired=Date.now();
        cb(el);
      }
    },ms||500);
  }
  function move(x,y){
    if(Math.abs(x-sx)>8||Math.abs(y-sy)>8){movido=true;clearTimeout(t);t=null;}
  }
  function end(){clearTimeout(t);t=null;}
  el.addEventListener('touchstart',function(e){start(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  el.addEventListener('touchmove',function(e){move(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  el.addEventListener('touchend',end);
  el.addEventListener('touchcancel',end);
  el.addEventListener('mousedown',function(e){start(e.clientX,e.clientY);});
  el.addEventListener('mousemove',function(e){move(e.clientX,e.clientY);});
  el.addEventListener('mouseup',end);
  el.addEventListener('mouseleave',end);
  /* Sin menu contextual del navegador al mantener pulsado */
  el.addEventListener('contextmenu',function(e){e.preventDefault();});
}

// ── Historial de navegación entre overlays ────────────────────
var NAV_BACK=null; // función para "volver atrás" al pulsar ← en cualquier overlay

// ── Tema visual ──────────────────────────────────────────────
var THEME_STORAGE_KEY='excelia-theme-v1';
var THEME=(function(){try{
  var t=appStorage.getItem('excelia-theme-v1');
  /* Migraci\u00f3n v217: amoled (eliminado) \u2192 grey (nuevo intermedio gris pizarra) */
  if(t==='amoled'){t='grey';try{appStorage.setItem('excelia-theme-v1','grey');}catch(e){}}
  if(t&&['dark','light','grey'].indexOf(t)!==-1)return t;
}catch(e){}return 'dark';})();
var THEME_LABELS={dark:'\uD83C\uDF19\u00a0Oscuro',light:'\u2600\uFE0F\u00a0Claro',grey:'☕\u00a0Crema'};
var THEME_META={dark:'#0a0a0f',light:'#f4f4fa',grey:'#fbf6ec'};
var THEME_SEQUENCE=['dark','light','grey'];
function applyTheme(t){
  THEME=t;
  document.documentElement.setAttribute('data-theme',t);
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=THEME_META[t]||THEME_META.dark;
  try{appStorage.setItem(THEME_STORAGE_KEY,t);}catch(e){}
}
function cycleTheme(){
  var idx=(THEME_SEQUENCE.indexOf(THEME)+1)%THEME_SEQUENCE.length;
  applyTheme(THEME_SEQUENCE[idx]);
  updateThemeBtn();
}
function updateThemeBtn(){
  var btn=document.getElementById('themeBtn');
  if(btn)btn.innerHTML=THEME_LABELS[THEME]||THEME_LABELS.dark;
}

// ── Estado global ──────────────────────────────────────────
/* CY/CM arrancan con el dia de hoy. Antes se declaraban vacios y solo los
   rellenaba init.js, asi que cualquier modulo que se inicializara a partir de
   CY (lo hacia FISCAL_YEAR) nacia con undefined. */
var SK='excelia-horas-v3', CY=(new Date()).getFullYear(), CM=(new Date()).getMonth(),
    ST={}, SW={}, ED=null, MONTH_H={}, DAILY_RATE=0, EXCL_FEST=true, EXCL_VAC=true;
var ECON_YEAR_CONFIG={}; // {year: {rate, exclFest, exclVac, multiRate, ratePeriods, salary, rateMode}}
var MN=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var MN_SHORT=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
var DN=['D','L','M','X','J','V','S'];
var DF=['Domingo','Lunes','Martes','Mi\u00e9rcoles','Jueves','Viernes','S\u00e1bado'];

// ── Persistencia ────────────────────────────────────────────
function load(){
  try{
    var r=appStorage.getItem(SK);
    if(r){var d=JSON.parse(r);ST=d.days||{};SW=d.sent||{};MONTH_H=d.monthH||{};DAILY_RATE=d.rate||0;EXCL_FEST=d.exclFest!==false;EXCL_VAC=d.exclVac!==false;
      if(d.multiRate!==undefined)ECON_MULTI_RATE=!!d.multiRate;
      if(d.ratePeriods)ECON_RATE_PERIODS=d.ratePeriods;
      if(d.econYearConfig)ECON_YEAR_CONFIG=d.econYearConfig;
      /* Migrate: if globals set but no year config, seed current year */
      if(!ECON_YEAR_CONFIG||typeof ECON_YEAR_CONFIG!=='object')ECON_YEAR_CONFIG={};
    }
  }catch(e){ST={};SW={};MONTH_H={};DAILY_RATE=0;EXCL_FEST=true;EXCL_VAC=true;}
}
function save(){
  appStorage.setItem(SK,JSON.stringify({days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE,exclFest:EXCL_FEST,exclVac:EXCL_VAC,multiRate:ECON_MULTI_RATE,ratePeriods:ECON_RATE_PERIODS,econYearConfig:ECON_YEAR_CONFIG}));
  if(typeof csvCheckChanges==='function')csvCheckChanges();
}
/* ── Per-year econ config helpers ──────────────────────────── */
function loadEconYear(y){
  var cfg=ECON_YEAR_CONFIG[y];
  if(cfg){
    DAILY_RATE=cfg.rate||0;
    EXCL_FEST=cfg.exclFest!==false;
    EXCL_VAC=cfg.exclVac!==false;
    ECON_MULTI_RATE=!!cfg.multiRate;
    ECON_RATE_PERIODS=cfg.ratePeriods||[{startDate:y+'-01-01',rate:0,rateMode:'daily'}];
    if(cfg.salary!==undefined)window._ECON_SALARY=cfg.salary;
    if(cfg.rateMode)ECON_RATE_MODE=cfg.rateMode;
  } else {
    /* No config for this year — reset to defaults */
    DAILY_RATE=0;EXCL_FEST=true;EXCL_VAC=true;
    ECON_MULTI_RATE=false;
    ECON_RATE_PERIODS=[{startDate:y+'-01-01',rate:0,rateMode:'daily'}];
    ECON_RATE_MODE='daily';
    window._ECON_SALARY=30000;
  }
}
function saveEconYear(y){
  ECON_YEAR_CONFIG[y]={rate:DAILY_RATE,exclFest:EXCL_FEST,exclVac:EXCL_VAC,multiRate:ECON_MULTI_RATE,ratePeriods:ECON_RATE_PERIODS,salary:window._ECON_SALARY||0,rateMode:ECON_RATE_MODE||'daily'};
  save();
}

// ── Falso translúcido: mezcla color con fondo negro (opaco) ─
// En lugar de rgba (muestra capas inferiores), devuelve un color plano
// que VISUALMENTE parece alpha% sobre negro (oscurece el color original).
// Así las barras de eventos actúan como "pegatina": tapan lo de abajo
// pero se ven más oscuras/mezcladad con el fondo, no hay sangrado de color.
function fakeTrans(hex,alpha){
  hex=hex.replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  var r=('0'+Math.round(parseInt(hex.slice(0,2),16)*alpha).toString(16)).slice(-2);
  var g=('0'+Math.round(parseInt(hex.slice(2,4),16)*alpha).toString(16)).slice(-2);
  var b=('0'+Math.round(parseInt(hex.slice(4,6),16)*alpha).toString(16)).slice(-2);
  return '#'+r+g+b;
}

// ── Grafico de barras generico ───────────────────────────────
// Devuelve un SVG con una barra por valor. Para series de 12 meses con
// reparto pasado/futuro sigue estando barChart3() en summary.js; este es el
// generico (N barras, una serie) que usan las pantallas nuevas.
//   values  array de numeros
//   labels  array de etiquetas (misma longitud)
//   color   color de la barra
//   opts    {height, highlight:idx, unit}
function simpleBarChart(values,labels,color,opts){
  opts=opts||{};
  var n=values.length;
  if(!n)return '<div class="sy-note">Sin datos.</div>';
  var W=320,H=opts.height||86,PB=16,PT=12;
  var maxV=Math.max.apply(null,values.concat([1]));
  var gap=n>16?1:2;
  var bw=Math.max(2,(W-(n-1)*gap)/n);
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
  for(var i=0;i<n;i++){
    var x=i*(bw+gap);
    var v=values[i]||0;
    var bh=v>0?Math.max(2,Math.round((v/maxV)*(H-PT))):0;
    var op=(opts.highlight===i)?'1':'.55';
    if(bh>0)svg+='<rect x="'+x.toFixed(1)+'" y="'+(H-bh)+'" width="'+bw.toFixed(1)+'" height="'+bh+'" rx="2" fill="'+color+'" opacity="'+op+'"/>';
    if(v>0&&bw>=9)svg+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-bh-3)+'" text-anchor="middle" font-size="7" fill="#8888a0">'+v+'</text>';
    if(labels[i]!==undefined&&(n<=16||i%2===0))
      svg+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H+PB-3)+'" text-anchor="middle" font-size="6.5" fill="#7a7a92">'+escHtml(String(labels[i]))+'</text>';
  }
  svg+='</svg>';
  return svg;
}

// ── Barra horizontal de reparto (una fila por categoria) ─────
function hBarRows(rows,opts){
  opts=opts||{};
  var max=1;
  rows.forEach(function(r){if(r.value>max)max=r.value;});
  var h='<div class="hbar-rows">';
  rows.forEach(function(r){
    var pct=Math.round((r.value/max)*100);
    h+='<div class="hbar-row">';
    h+='<span class="hbar-lbl">'+escHtml(r.label)+'</span>';
    h+='<span class="hbar-track"><i style="width:'+pct+'%;background:'+(r.color||'var(--accent)')+'"></i></span>';
    h+='<span class="hbar-val">'+r.value+(opts.suffix||'')+'</span>';
    h+='</div>';
  });
  return h+'</div>';
}

// ── Compartir / descargar archivo ────────────────────────────
function shareOrDownload(blob,filename,onSuccess,options){
  options=options||{};
  if(!options.mode&&!options.download){openExportChoice(blob,filename,onSuccess,options);return;}
  filename=exportFileName(filename);
  var delivered=false,success=function(){if(!delivered){delivered=true;if(onSuccess)onSuccess();}};
  var downloaded=false;
  var copy=options.mode==='share'?Promise.resolve(false):saveExportCopy(blob,filename);copy.then(function(saved){if(saved)success();else if(options.mode==='both')download();});
  function fallback(){copy.then(function(saved){if(!saved)download();});}
  function download(){
    if(downloaded)return;downloaded=true;
    var url=null,a=null;
    try{
      url=URL.createObjectURL(blob);a=document.createElement('a');
      a.href=url;a.download=filename;if(options.onDownloadReady)options.onDownloadReady(url);document.body.appendChild(a);a.click();
      success();
    }catch(err){showToast('No se pudo descargar el archivo. Vuelve a intentarlo','error');}
    finally{
      if(a&&a.parentNode)a.parentNode.removeChild(a);
      // Android puede resolver el enlace después del click: no revocar al instante.
      if(url&&!options.onDownloadReady)setTimeout(function(){URL.revokeObjectURL(url);},60000);
    }
  }
  if(!options.download&&options.mode!=='save'&&navigator.share&&navigator.canShare){
    try{
      var file=new File([blob],filename,{type:blob.type});
      if(!navigator.canShare({files:[file]}))file=new File([blob],filename,{type:'application/octet-stream'});
      if(navigator.canShare({files:[file]})){
        navigator.share({files:[file],title:filename}).then(success).catch(function(err){
          if(err&&err.name==='AbortError')return;
          fallback();
        });return;
      }
    }catch(err){} // API no disponible o formato no admitido: descargar.
  }
  fallback();
}

// ── Utilidades HTML ─────────────────────────────────────────
function renderDocumentIcon(){return '<svg viewBox="0 0 24 24" class="ico-doc" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';}
/* Mayúscula inicial en palabras significativas de opciones, nunca en datos. */
function menuTitle(text){
  if(text==='Rec. Gestiones')return 'Recordatorio Gestiones';
  return String(text).replace(/[\p{L}\p{N}]+/gu,function(word,offset){
    return offset>0&&/^(de|del|y|o|en|a|al|el|la|los|las|por|para|con|sin|un|una)$/i.test(word)?word.toLowerCase():word.charAt(0).toUpperCase()+word.slice(1);
  });
}
function escHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Utilidades de fecha/hora ─────────────────────────────────
function mkey(y,m){return y+'-'+String(m+1).padStart(2,'0');}
function getMonthH(y,m,day){
  if(MONTH_H[mkey(y,m)]!==undefined)return MONTH_H[mkey(y,m)];
  if(m===6||m===7)return 7;
  if(m===8&&(!day||day<=15))return 7;
  return 9;
}
function defH(d){var w=d.getDay();if(!w||w===6)return 0;if(w===5)return 6.5;return getMonthH(d.getFullYear(),d.getMonth(),d.getDate());}
function dayH(d){var w=d.getDay();if(!w||w===6)return 0;var k=dk(d),e=ST[k],t=(e&&e.type)||'normal';if(t!=='normal')return 0;if(w===5)return 6.5;return(e&&e.hours)||getMonthH(d.getFullYear(),d.getMonth(),d.getDate());}
function dayT(d){var e=ST[dk(d)];return(e&&e.type)||'normal';}
function dk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fd(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');}
function ad(d,n){var r=new Date(d);r.setDate(r.getDate()+n);return r;}
function fh(h){if(h===0)return'\u2014';if(h%1===0)return String(h)+'h';return h.toFixed(1).replace('.',',')+'\u202fh';}
function fhP(h){if(h===0)return'';if(h%1===0)return String(h);return h.toFixed(1);}
function isToday(d){var t=new Date();return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate();}
function isPast(d){var t=new Date();t.setHours(0,0,0,0);return d<t;}
function wn(date){var d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));var ys=new Date(Date.UTC(d.getUTCFullYear(),0,1));return Math.ceil(((d-ys)/864e5+1)/7);}

// ── Cálculo de semanas ───────────────────────────────────────
function weeks(y,m){
  var ws=[],first=new Date(y,m,1),last=new Date(y,m+1,0),s=new Date(first);
  var dow=s.getDay(),off=dow===0?-6:1-dow; s.setDate(s.getDate()+off);
  while(s<=last||s.getMonth()===m){
    var w=[]; for(var i=0;i<7;i++){w.push(new Date(s));s=ad(s,1);}
    ws.push(w);
    if(s.getMonth()>m&&s.getFullYear()>=y&&m<11)break;
    if(s.getFullYear()>y&&m===11)break;
    if(ws.length>6)break;
  }
  return ws;
}

/* El aviso y la futura programación consumen el mismo alcance. */
function homeSubmissionStatus(year,month){
  var remote=typeof hoursRemoteConfigured==='function'&&hoursRemoteConfigured(),states={},counts={sent:0,scheduled:0,pending:0,review:0};
  var scope=homeSubmissionWeeks(year,month),known=true;
  scope.forEach(function(week){
    var state=homePeriodMode(year,month)==='closed'?'closed':remote?hoursWeekState(week.key):SW[week.key]?'sent':'missing';states[week.key]=state;
    if(!state)known=false;
    if(state==='sent'||state==='scheduled')counts[state]++;
    else if(state==='closed'){}
    else if(state==='missing'||state==='ready')counts.pending++;
    else if(state)counts.review++;
  });
  var pending=scope.filter(function(week){return !['sent','scheduled','closed'].includes(states[week.key]);});
  return {remote:remote,states:states,counts:counts,known:known,review:counts.review>0,missing:pending.filter(function(week){return !week.extra;}).length,extras:pending.filter(function(week){return week.extra;}),complete:pending.length===0};
}
function renderHomeSubmissionStatus(year,month,state){
  state=state||homeSubmissionStatus(year,month);
  var closed=homePeriodMode(year,month)==='closed',title=closed?'Mes cerrado':!state.known?'Estado pendiente':state.complete?'Correos al día':state.review?'Hay cambios':'Semanas pendientes';
  var count=state.missing+state.extras.length;
  var detail=closed?'Histórico · sin consultas automáticas':!state.known?'Pendiente de primera comprobación':state.review?'Revisa las programaciones afectadas':state.complete?(state.counts.scheduled?state.counts.scheduled+' programadas':'Sin semanas pendientes'):count+(count===1?' semana por programar':' semanas por programar');
  var scheduled=homeSubmissionWeeks(year,month).map(function(w){return hoursCachedWeek(w.key);}).filter(function(row){return row&&row.state==='scheduled'&&Date.parse(row.schedule)>Date.now();}).sort(function(a,b){return Date.parse(a.schedule)-Date.parse(b.schedule);})[0];
  var next=scheduled?new Date(scheduled.schedule):null;
  var showSummary=closed||state.known&&Object.keys(state.states).every(function(key){return ['sent','scheduled','changed','closed'].includes(state.states[key]);});
  var body=showSummary?'<div class="home-submission-body"><div class="home-submission-next"><span>'+(closed?'Mes cerrado':next?'Próximo envío':state.review?'Cambios locales':'Por preparar')+'</span><strong>'+(closed?'Archivado':next?fd(next):state.review?'Revisar':'Al día')+'</strong><span>'+(next?'08:00 Madrid':closed?'Guardado':'')+'</span></div><div class="month-summary home-summary-compact">'+renderHomeMonthSummary(homeMonthHours(year,month))+'</div></div>':'';
  return '<section class="home-submission '+(!state.known?'unknown':state.complete?'complete':'pending')+'" aria-label="Correos y horas del mes">'+(typeof renderHoursAuthNotice==='function'?renderHoursAuthNotice():'')+'<div class="home-submission-heading"><span class="home-submission-icon" aria-hidden="true">'+(!state.known?'◷':state.complete?'&#10003;':'!')+'</span><strong>'+title+'</strong></div><div class="home-submission-detail">'+detail+'</div>'+body+renderHoursAccess(state)+'</section>';
}

// ── Comprueba si hay semanas enviadas en el mes actual ────────
// ── Datos de semana para email ───────────────────────────────
function getWD(wkey){
  var p=wkey.split('-'),mon=new Date(+p[0],+p[1]-1,+p[2]),days=[];
  for(var i=0;i<5;i++)days.push(ad(mon,i));
  var proy=[],vac=[],fest=[],aus=[];
  for(var i=0;i<5;i++){
    var d=days[i],t=dayT(d);
    if(t==='normal'){var h=dayH(d);proy.push(fhP(h));vac.push('');fest.push('');aus.push('');}
    else{proy.push('');vac.push(t==='vacaciones'?'X':'');fest.push(t==='festivo'?'X':'');aus.push(t==='ausencia'?'X':'');}
  }
  return{mon:mon,fri:days[4],proy:proy,vac:vac,fest:fest,aus:aus};
}

// ── Toast ────────────────────────────────────────────────────
/* todoPulsable: el aviso entero responde al toque, no solo su boton. Es una
   opcion y no lo de siempre porque en un "Deshacer" un roce accidental
   desharia lo que se acaba de hacer; en un "Actualizar" no se pierde nada. */
function _toastReset(t){
  clearTimeout(t._timer);clearTimeout(t._swipeReadyTimer);clearTimeout(t._exitTimer);
  if(t._tap){t.removeEventListener('click',t._tap);t._tap=null;}
  var g=t._gesture;t._gesture=null;t._ignoreClick=!!g;
  if(g&&t.hasPointerCapture(g.id))t.releasePointerCapture(g.id);
  t.style.removeProperty('--toast-x');t.style.removeProperty('--toast-opacity');
  t.className='toast';
}
/* Un arrastre aparta el aviso, nunca ejecuta su acción. Los listeners viven
   una sola vez; cada aviso reinicia su segundo de protección y su gesto. */
function _toastBindSwipe(t){
  if(t._swipeAdded)return;
  t._swipeAdded=true;
  t.addEventListener('click',function(e){
    if(t._ignoreClick&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  t.addEventListener('pointerdown',function(e){
    if(!e.isPrimary||e.button!==0||!t.classList.contains('show')||!t.classList.contains('has-undo'))return;
    t._ignoreClick=false;
    t._gesture={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,axis:null,ready:t.classList.contains('swipe-ready')};
  });
  t.addEventListener('pointermove',function(e){
    var g=t._gesture;if(!g||g.id!==e.pointerId)return;
    var dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.axis&&Math.max(Math.abs(dx),Math.abs(dy))>8){
      g.axis=Math.abs(dx)>Math.abs(dy)*1.2?'x':'y';
      t._ignoreClick=true;
      if(g.axis==='x')t.setPointerCapture(e.pointerId);
    }
    if(g.axis!=='x'||!g.ready)return;
    e.preventDefault();g.dx=dx;
    t.classList.add('swiping');
    t.style.setProperty('--toast-x',dx+'px');
    t.style.setProperty('--toast-opacity',String(Math.max(.25,1-Math.abs(dx)/t.offsetWidth)));
  });
  function end(e){
    var g=t._gesture;if(!g||g.id!==e.pointerId)return;
    t._gesture=null;t.classList.remove('swiping');
    if(t.hasPointerCapture(e.pointerId))t.releasePointerCapture(e.pointerId);
    if(e.type==='pointerup'&&g.ready&&g.axis==='x'&&Math.abs(g.dx)>=Math.min(80,t.offsetWidth*.25)){
      clearTimeout(t._timer);
      t.classList.add('swipe-away');
      t.style.setProperty('--toast-x',(g.dx<0?-1:1)*(window.innerWidth+t.offsetWidth)/2+'px');
      t.style.setProperty('--toast-opacity','0');
      t._exitTimer=setTimeout(function(){_toastReset(t);},250);
    }else{
      t.style.removeProperty('--toast-x');t.style.removeProperty('--toast-opacity');
    }
  }
  t.addEventListener('pointerup',end);
  t.addEventListener('pointercancel',end);
  t.addEventListener('lostpointercapture',end);
}
function showToast(msg,type,undoFn,btnTxt,todoPulsable){
  if(STORAGE_ERROR){msg=STORAGE_ERROR;type='error';undoFn=null;STORAGE_ERROR=null;}
  var t=document.getElementById('toast');
  _toastReset(t);_toastBindSwipe(t);
  if(undoFn){
    t.innerHTML=escHtml(msg)+'<button class="toast-undo-btn" id="toastUndoBtn">'+(btnTxt||'Deshacer')+'</button>';
    t.className='toast show has-undo'+(type?' '+type:'')+(todoPulsable?' pulsable':'');
    document.getElementById('toastUndoBtn').addEventListener('click',function(){
      _toastReset(t);undoFn();
    });
    if(todoPulsable){
      t._tap=function(e){
        if(e.target.closest('.toast-undo-btn'))return;   /* ya lo lleva el boton */
        _toastReset(t);undoFn();
      };
      t.addEventListener('click',t._tap);
    }
    t._swipeReadyTimer=setTimeout(function(){t.classList.add('swipe-ready');},1000);
    t._timer=setTimeout(function(){_toastReset(t);},8000);
  } else {
    t.textContent=msg;
    t.className='toast show'+(type?' '+type:'');
    t._timer=setTimeout(function(){_toastReset(t);},3500);
  }
}

// ── Envío de email ───────────────────────────────────────────
function sendEmail(wkey){
  return openHoursReview(wkey);
}
function editPencilHtml(){return '<svg class="edit-pencil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 3 5 5L8 21H3v-5L16 3Zm-2 2 5 5"/></svg>';}
function sendManualEmail(wkey){
  var state=hoursWeekState(wkey),previous=hoursWeekState(dk(ad(new Date(wkey+'T12:00:00'),-7)));
  if(previous&&!['sent','scheduled'].includes(previous)){showToast('La semana anterior requiere revisión. Compruébala antes de enviar esta.','error');return;}
  var notes=[];
  if(!previous&&hoursRemoteConfigured())notes.push('Comprueba que la semana anterior ya está enviada o programada.');
  if(['sent','scheduled','changed'].includes(state))notes.push('Esta semana ya tiene un correo enviado o programado; otro borrador podría duplicarlo.');
  if(notes.length&&!window.confirm(notes.join(' ')+' ¿Quieres abrir Outlook?'))return;
  var wd=getWD(wkey),url='mailto:'+TO+'?cc='+encodeURIComponent(CC.join(','))+'&subject='+encodeURIComponent(hoursMailSubject(wd))+'&body='+encodeURIComponent(buildMailtoBody(wd));
  window.location.href=url;
  showToast('Abriendo Outlook. El envío se confirmará cuando Kairo lo compruebe.','info');
}

function buildMailtoBody(wd){
  var DN5=['L','M','X','J','V'];
  var total=0;
  wd.proy.forEach(function(h){if(h)total+=parseFloat(h);});
  var totalStr=(total%1===0?String(total):total.toFixed(1)).replace('.',',');
  var semana='Semana del '+fd(wd.mon)+' al '+fd(wd.fri);
  var body='Buenos d\u00edas!\n\n'+semana+':\n\n';
  for(var i=0;i<5;i++){
    var d=ad(wd.mon,i);
    var label;
    if(wd.fest[i])label='Festivo';
    else if(wd.vac[i])label='Vacaciones';
    else if(wd.aus[i])label='Ausencia';
    else label=(wd.proy[i]?wd.proy[i].replace('.',',')+' h':'\u2014');
    body+=DN5[i]+' '+fd(d)+' \u2014 '+label+'\n';
  }
  body+='\nTotal horas trabajadas en proyecto en la '+semana.toLowerCase()+':\n';
  body+=totalStr+'h\n\nUn saludo,\n'+AUTHOR_NAME;
  return body;
}

// ── Render principal ─────────────────────────────────────────
function render(){
  document.getElementById('monthLabel').innerHTML='<span>'+MN[CM]+'</span><span class="sy-year-sub">'+CY+'</span>';
  var curMonthH=getMonthH(CY,CM,1);
  document.querySelectorAll('.hours-chip').forEach(function(el){el.classList.toggle('active',+el.dataset.h===curMonthH);});
  // Actualizar texto del botón de jornada
  var dhBtn=document.getElementById('editHoursBtn');
  if(dhBtn){
    var pencil=dhBtn.querySelector('[data-home-pencil]');if(pencil&&!pencil.firstChild)pencil.innerHTML=editPencilHtml();
    var dhSpan=dhBtn.querySelector('.dh-val');
    if(dhSpan){dhSpan.textContent=curMonthH+'h';dhSpan.className='dh-val '+homeHourClass(curMonthH);}
  }

  buildHomeCalendar(document.getElementById('weeksContainer'));
  if(typeof syncHomeInvoiceStatus==='function')syncHomeInvoiceStatus();
  if(typeof syncHoursStatus==='function')syncHoursStatus(false);
}

/* El mismo calendario se ensambla en la Home y en una previsualización inerte. */
function buildHomeCalendar(c){
  var wks=weeks(CY,CM),submission=homeSubmissionStatus(CY,CM);
  c.innerHTML=renderHomeSubmissionStatus(CY,CM,submission)+(typeof renderHomeInvoiceStatus==='function'?renderHomeInvoiceStatus(CY,CM):'');

  wks.forEach(function(wk){
    var mon=wk[0],sun=wk[6],wkey=dk(mon),remote=submission.remote,mailState=remote?submission.states[wkey]:'',covered=homeWeekCovered(wkey),unlocked=homeWeekUnlocked(wkey),sent=covered&&!unlocked,dias=0;
    for(var i=0;i<5;i++){if(dayH(wk[i])>0)dias++;}
    var dStr=dias+(dias===1?' d\u00eda':' d\u00edas');

    var card=document.createElement('div');
    card.dataset.week=wkey;
    card.className='week-card'+(sent?' sent':'');
    var reviewLabel=mailState==='sent'?'Ver estado':mailState==='scheduled'?'Ver programación':mailState==='changed'?'Revisar cambios':'Programar semana';
    var badge=remote&&mailState==='closed'?'<span class="sent-badge">Cerrada</span>':remote?'<button type="button" class="sent-badge hours-week-badge '+(covered?'covered':mailState?'attention':'unknown')+'" data-hours-week="'+wkey+'" aria-label="'+reviewLabel+'">'+(mailState==='missing'||mailState==='ready'?reviewLabel:hoursWeekBadge(mailState))+'</button>':sent?'<span class="sent-badge">\u2713 Enviada</span>':'';
    card.innerHTML='<div class="week-header"><div class="week-info"><h3>Semana '+wn(mon)+badge+'</h3><div class="week-range">'+fd(mon)+' \u2014 '+fd(sun)+'</div></div><div class="week-total">'+dStr+'</div></div>';
    if(remote&&hoursWeekDate(wkey,mailState)){var scheduleNote=document.createElement('div');scheduleNote.className='hours-week-readonly';scheduleNote.textContent='Envío '+hoursWeekDate(wkey,mailState);card.querySelector('.week-info').appendChild(scheduleNote);}

    var grid=document.createElement('div'); grid.className='days-grid';
    for(var i=0;i<5;i++){
      var d=wk[i],dt=dayT(d),hrs=dayH(d),inM=d.getMonth()===CM;
      var cell=document.createElement('div');
      var hCls='';if(dt==='normal'){if(hrs===6.5)hCls=' h65';else if(hrs===7)hCls=' h7';else if(hrs===8)hCls=' h8';else if(hrs===9)hCls=' h9';}
      cell.className='day-cell'+(dt!=='normal'?' '+dt:hCls);
      if(!inM)cell.style.opacity='0.4';
      var ts=isToday(d)?'color:var(--accent-bright)':'';
      cell.innerHTML=
        '<div class="day-name" style="'+ts+'">'+DN[d.getDay()]+'</div>'+
        '<div class="day-date">'+fd(d)+'</div>'+
        '<div class="day-hours">'+(dt==='normal'?fh(hrs):dt==='vacaciones'?'V':dt==='festivo'?'F':'A')+'</div>';
      cell.setAttribute('aria-label',fd(d)+', '+(dt==='normal'?fh(hrs):dt));
      // Bloquear clic si semana enviada
      (function(dd,key){
        cell.addEventListener('click',function(){
          if(!homeWeekUnlocked(key)){showToast('Desmarca primero la semana para editar sus días.','error');return;}
          openSheet(dd);
        });
      })(d,wkey);
      grid.appendChild(cell);
    }
    card.appendChild(grid);

    var acts=document.createElement('div'); acts.className='week-actions';
    var sendBtn=document.createElement('button');
    sendBtn.className='action-btn send';
    sendBtn.innerHTML='<svg class="week-action-icon mail-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M3 4h18a1 1 0 0 1 1 1v.5L12 12 2 5.5V5a1 1 0 0 1 1-1Zm-1 4 9.45 6.14a1 1 0 0 0 1.1 0L22 8v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z"/></svg><span>Enviar a Outlook</span>';
    (function(k){sendBtn.addEventListener('click',function(e){e.stopPropagation();sendManualEmail(k);});})(wkey);
    var sb=document.createElement('button');
      sb.className='action-btn sent-toggle';
      sb.innerHTML='<svg class="week-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8"/></svg><span>'+(unlocked?'Cerrar edición':covered?'Desmarcar':'Editar días')+'</span>';
      (function(k){sb.addEventListener('click',function(e){e.stopPropagation();togSent(k);});})(wkey);
    acts.appendChild(sendBtn); acts.appendChild(sb);
    card.appendChild(acts); c.appendChild(card);
  });

}

// ── Bottom sheet (selector de tipo de día) ───────────────────
function openSheet(date){
  ED=date; var dt=dayT(date),dow=date.getDay();
  var nh=(dow===5)?'6,5h':String(getMonthH(date.getFullYear(),date.getMonth(),date.getDate()))+'h';
  document.getElementById('sheetTitle').textContent=DF[dow]+' '+fd(date);
  document.getElementById('sheetSubtitle').textContent='Selecciona el tipo de d\u00eda';
  document.getElementById('optNormalHours').textContent=nh;
  var opts=document.querySelectorAll('.sheet-option');
  for(var i=0;i<opts.length;i++){opts[i].classList.toggle('selected',opts[i].dataset.type===dt);}
  var picker=document.getElementById('hourPicker');
  if(dow>=1&&dow<=4&&dt==='normal'){
    picker.style.display='block';
    var e=ST[dk(date)];
    var curH=(e&&e.hours)||getMonthH(date.getFullYear(),date.getMonth(),date.getDate());
    document.querySelectorAll('.hour-chip-day').forEach(function(c){c.classList.toggle('active',+c.dataset.h===curH);});
  } else {picker.style.display='none';}
  document.getElementById('overlay').classList.add('active');
  document.getElementById('bottomSheet').classList.add('active');
}

function closeSheet(){
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('bottomSheet').classList.remove('active');
  ED=null;
}

function selectType(t){
  if(!ED)return; var k=dk(ED),dow=ED.getDay();
  if(t==='normal'){
    var e=ST[k]||{},wasNormal=!e.type;
    if(!wasNormal){delete ST[k];}
    document.querySelectorAll('.sheet-option').forEach(function(el){el.classList.toggle('selected',el.dataset.type==='normal');});
    if(dow>=1&&dow<=4){
      if(wasNormal){
        // Ya era normal: confirmar y cerrar
        save(); render(); closeSheet();
      } else {
        // Cambiado a normal: mostrar picker de horas
        var picker=document.getElementById('hourPicker');
        picker.style.display='block';
        var curH=getMonthH(ED.getFullYear(),ED.getMonth(),ED.getDate());
        document.querySelectorAll('.hour-chip-day').forEach(function(c){c.classList.toggle('active',+c.dataset.h===curH);});
        save(); render();
      }
    } else {
      // Viernes: cerrar directamente
      save(); render(); closeSheet();
    }
  } else {
    /* Avisar antes de marcar si se pasa del cupo anual */
    if(t==='vacaciones'&&!confirmarCupoVacaciones(k))return;
    if(t==='festivo'&&!confirmarCupoFestivos(k))return;
    delete ST[k]; ST[k]={type:t};
    save(); closeSheet(); render();
  }
}

/* Dias de vacaciones ya marcados ese anio (laborables, que son los que
   consumen). Se cuenta sobre ST, igual que hace el resumen. */
function contarVacaciones(year,excluirK){
  var n=0;
  for(var k in ST){
    if(!ST.hasOwnProperty(k))continue;
    if(k===excluirK)continue;
    if(!ST[k]||ST[k].type!=='vacaciones')continue;
    if(parseInt(k.slice(0,4),10)!==year)continue;
    var w=new Date(k+'T00:00:00').getDay();
    if(w>=1&&w<=5)n++;
  }
  return n;
}
/* true = seguir adelante. Avisa si marcar ese dia se pasa del cupo anual. */
function confirmarCupoVacaciones(k){
  if(typeof vacEntitlementForYear==='undefined')return true;
  var year=parseInt(k.slice(0,4),10);
  var entitlement=vacEntitlementForYear(year);
  var w=new Date(k+'T00:00:00').getDay();
  if(w<1||w>5)return true;                 /* fin de semana: no consume */
  var usados=contarVacaciones(year,k)+1;
  if(usados<=entitlement)return true;
  return confirm('Te pasas de los d\u00edas de vacaciones de '+year+'.\n\n'
    +'Cupo anual: '+entitlement+' d\u00edas\n'
    +'Con este ser\u00edan: '+usados+' ('+(usados-entitlement)+' de m\u00e1s)\n\n'
    +'\u00bfMarcarlo de todas formas?');
}
/* Festivos ya marcados ese anio. A diferencia de las vacaciones cuentan
   TODOS los dias, caigan en laborable o en fin de semana: los 12 festivos son
   del calendario, no de la jornada. */
function contarFestivos(year,excluirK){
  var n=0;
  for(var k in ST){
    if(!ST.hasOwnProperty(k))continue;
    if(k===excluirK)continue;
    if(!ST[k]||ST[k].type!=='festivo')continue;
    if(parseInt(k.slice(0,4),10)===year)n++;
  }
  return n;
}
/* true = seguir adelante. Avisa al pasar de FESTIVOS_ANIO, pero no impide
   nada: hay anios con festivos de sobra segun la comunidad. */
var FESTIVOS_ANIO = 12;
function confirmarCupoFestivos(k){
  var year=parseInt(k.slice(0,4),10);
  var usados=contarFestivos(year,k)+1;
  if(usados<=FESTIVOS_ANIO)return true;
  return confirm('Llevas m\u00e1s festivos de los normales en '+year+'.\n\n'
    +'Lo habitual: '+FESTIVOS_ANIO+' al a\u00f1o\n'
    +'Con este ser\u00edan: '+usados+' ('+(usados-FESTIVOS_ANIO)+' de m\u00e1s)\n\n'
    +'\u00bfMarcarlo de todas formas?');
}
var HOURS_WEEK_UNLOCKED=Object.create(null);
function togSent(k){
  HOURS_WEEK_UNLOCKED[k]=!homeWeekUnlocked(k);render();
}

/* ══ Paneles deslizantes: una sola puerta de entrada ═══════════════════
   Abrir un panel eran seis pasos que estaban copiados en 27 sitios: crear el
   contenedor, volcar el HTML, colgarlo del overlay, dos requestAnimationFrame
   para que la animacion se vea, enganchar el cierre y programar el borrado con
   300 ms de retardo. Cada copia era una ocasion de olvidarse de un detalle, y
   ya nos ha pasado tres veces (el temporizador de cierre borrando el panel
   siguiente, el swipe colandose al calendario de fondo y el click de cerrar
   activando lo de debajo). Aqui esta hecho una vez.

     abrirPanel('evDWrap', html, {
       overlay:'evDetailOv',        // el div con la clase .ev-detail-overlay
       contenedor:elemento,          // donde colgarlo (por defecto #eventsOverlay)
       alCerrar:fn,                  // que hacer al cerrarse
       reutilizar:true               // repintar el que ya hay, sin animacion
     })

   Devuelve el contenedor recien creado (o el que habia, si reutilizar). */
var _PANEL_T = {};          /* temporizadores de borrado, por id */

function _panelBorrarLuego(id, extra){
  clearTimeout(_PANEL_T[id]);
  _PANEL_T[id] = setTimeout(function(){
    var w = document.getElementById(id);
    if (w) w.remove();
    if (extra) extra();
  }, 300);
}
/* Cancela un borrado pendiente: si se vuelve a abrir el mismo panel antes de
   que pasen los 300 ms, el temporizador viejo se llevaria por delante el
   panel NUEVO. */
function _panelCancelarBorrado(id){ clearTimeout(_PANEL_T[id]); }

function abrirPanel(id, html, opciones){
  var o = opciones || {};
  var cont = o.contenedor || document.getElementById('eventsOverlay');
  if (!cont) return null;
  _panelCancelarBorrado(id);
  var wrap = document.getElementById(id);
  /* Si el panel ya esta ABIERTO, esta llamada es un repintado: se cambia el
     contenido y se deja donde esta. Recrearlo lo sacaba de pantalla y lo hacia
     entrar otra vez -- el parpadeo al guardar un cambio desde la ficha. */
  var fondo0 = wrap && wrap.firstElementChild;
  var yaAbierto = !!(fondo0 && fondo0.classList.contains('open'));
  var reutiliza = !!(wrap && (o.reutilizar || yaAbierto));
  if (!reutiliza) {
    if (wrap) wrap.remove();
    wrap = document.createElement('div');
    wrap.id = id;
    cont.appendChild(wrap);
  }
  wrap.classList.add('app-panel');
  wrap.innerHTML = html;
  var cerrar = o.alCerrar || function(){ cerrarPanel(id, o.overlay); };
  function engancharFondo(){
    var fo = o.overlay ? document.getElementById(o.overlay) : wrap.firstElementChild;
    if (!fo) return;
    fo.classList.add('open');
    /* Tocar el fondo cierra, y ahi se queda: el click no sigue hacia abajo */
    fo.addEventListener('click', function(e){
      if (e.target !== fo) return;
      e.stopPropagation();
      cerrar();
    });
  }
  if (reutiliza) { engancharFondo(); return wrap; }
  /* El doble requestAnimationFrame es lo que hace que la animacion se vea: el
     navegador pinta primero el estado inicial y despues aplica la transicion.
     Pero rAF no corre si la pestana no esta pintando, y entonces el panel se
     quedaba creado y sin abrir. Por eso va tambien un temporizador de
     respaldo, y gana el que llegue antes. */
  var abierto = false;
  function abrirUnaVez(){ if (abierto) return; abierto = true; engancharFondo(); }
  requestAnimationFrame(function(){ requestAnimationFrame(abrirUnaVez); });
  setTimeout(abrirUnaVez, 60);
  return wrap;
}

function cerrarPanel(id, overlayId, alTerminar){
  var fo = overlayId ? document.getElementById(overlayId) : null;
  if (!fo) {
    var w = document.getElementById(id);
    fo = w ? w.firstElementChild : null;
  }
  if (fo) fo.classList.remove('open');
  _panelBorrarLuego(id, alTerminar);
}

// ── Barra de navegación compartida entre overlays ────────────
function renderNavBar(current){
  var h='<div class="overlay-nav-bar" data-current="'+current+'">';
  NAV_MAIN_ITEMS.concat([{key:'alarm',title:'Crear alarma'},{key:'menu',title:'Más opciones'}]).forEach(function(b){
    h+='<button class="nav-bar-btn'+(b.key===current?' active':'')+'" data-nav="'+b.key+'" title="'+b.title+'">'+(b.key==='menu'?'&#8943;':navIconHtml(b.key))+'</button>';
  });
  return h+'</div>';
}
function bindNavBar(current,closeFn){
  document.querySelectorAll('.overlay-nav-bar[data-current="'+current+'"] .nav-bar-btn[data-nav]').forEach(function(btn){
    if(btn._navBound)return;btn._navBound=true;
    btn.addEventListener('click',function(e){
      if(btn.dataset.nav==='menu'){e.stopPropagation();toggleSettingsMenu(btn);}
      else if(btn.dataset.nav==='alarm'){e.stopPropagation();toggleAlarmPanel(btn);}
      else if(btn.dataset.nav!==current)navigateMain(btn.dataset.nav);
    });
  });
}
var NAV_SWITCH_TIMER=null;
/* openDestination conserva el cierre compartido al enlazar a una ficha concreta. */
function navigateMain(key,openDestination){
  if(key==='menu'){toggleSettingsMenu(document.querySelector('.full-overlay.open [data-nav="menu"]')||document.getElementById('menuBtn'));return;}
  if(key==='alarm'){toggleAlarmPanel(document.querySelector('.full-overlay.open [data-nav="alarm"]')||document.getElementById('alarmTestBtn'));return;}
  var routes={household:openHousehold,econ:openEcon,events:openEvents,estudio:openEstudio};
  if(key!=='home'&&!routes[key])return;
  if(typeof tasksDock==='function')tasksDock();
  closeSettingsMenu();
  closeAlarmPanel();
  clearTimeout(NAV_SWITCH_TIMER);NAV_BACK=null;
  var opened=document.querySelectorAll('.full-overlay.open');
  opened.forEach(function(ov){ov.classList.remove('open');setTimeout(function(){if(!ov.classList.contains('open'))ov.style.display='none';},320);});
  function open(){
    if(routes[key]){if(openDestination)openDestination();else routes[key]();}
    else if(key==='home'){window.scrollTo({top:0,behavior:'instant'});if(typeof syncHomeInvoiceStatus==='function')syncHomeInvoiceStatus();}
  }
  if(opened.length)NAV_SWITCH_TIMER=setTimeout(open,330);else open();
}
