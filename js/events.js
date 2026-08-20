/* ============================================================
   EVENTS — Ventana de eventos y notas
   ============================================================ */

var EV_STORAGE_KEY = 'excelia-events-v1';
var EV_YEAR = new Date().getFullYear();
var EV_MONTH = new Date().getMonth();
/* Estado por vista — cada calendario guarda su propio año/mes para que sean
   independientes (1-mes recuerda dónde estabas aunque hayas movido Agenda Semanal,
   y viceversa). EV_YEAR/EV_MONTH son siempre los de la vista activa actualmente. */
var EV_VIEW_STATE = {
  cal:    {year: new Date().getFullYear(), month: new Date().getMonth()},
  week:   {year: new Date().getFullYear(), month: new Date().getMonth()},
  annual: {year: new Date().getFullYear()}
};
function _switchEvView(newView){
  EV_SCROLL_RESET=true;   /* el proximo refresh empieza arriba */
  /* Guardar el estado de la vista que dejamos */
  if(EV_VIEW==='cal'||EV_VIEW==='week')EV_VIEW_STATE[EV_VIEW]={year:EV_YEAR,month:EV_MONTH};
  else if(EV_VIEW==='annual')EV_VIEW_STATE[EV_VIEW]={year:EV_YEAR};
  EV_VIEW=newView;
  EV_EDIT_MODE=false;
  /* Cargar el estado de la vista a la que entramos */
  if(EV_VIEW_STATE[newView]){
    if(EV_VIEW_STATE[newView].year!=null)EV_YEAR=EV_VIEW_STATE[newView].year;
    if(EV_VIEW_STATE[newView].month!=null)EV_MONTH=EV_VIEW_STATE[newView].month;
  }
  /* La nueva pestaña siempre empieza arriba (no heredar el scroll de la anterior) */
  var _sb=document.querySelector('#eventsOverlay .sy-body');
  if(_sb)_sb.scrollTop=0;
}
var EV_SCROLL_RESET = false;  /* fuerza que el proximo refreshEvents no conserve el scroll */
var EV_VIEW = 'cal';  // 'cal' | 'months' | 'upcoming' | 'annual'
var EV_EDIT = null;
var EV_EDIT_DS = null;   /* dia concreto desde el que se abrio el detalle/formulario */
var EV_FORM_CONTAINER = null;  // overlay donde se renderiza el formulario (null = eventsOverlay)
var EV_EDIT_MODE = false;
var EV_BRIGHT_PAST = false;
var EV_ANNUAL_VIEW = 'puentes'; // 'puentes' | 'fiestas'
var EV_ANNUAL_FILTER_HIDDEN = []; // grupos ocultos en el calendario anual/4 meses
/* Grupos de filtro (v244). No son los tipos sueltos: agrupan varias categorias
   para que los chips quepan y sean utiles.
     Grandes   -> todo kind 'grande' menos Asturias
     Asturias  -> aparte, por lo mucho que se usa
     Gestiones -> puntual|Rec. Gestiones
     Bodas     -> puntual|Ensayos boda
     Resto     -> el resto de puntuales (Plan/Quedada, Otros...) */
var EV_FILTER_GROUPS = ['Grandes','Asturias','Rec. Gestiones','WM + Rut','Resto','Cumplea\u00f1os VIP'];
/* Etiquetas en SINGULAR: con el plural la estrella de VIP se caia a una
   segunda fila en pantallas estrechas */
/* WM = Wedding Moves (las clases de baile de boda) + Rut = rutinas */
/* Etiquetas cortas a proposito: con los nombres largos los chips se caian
   a una segunda fila en pantallas estrechas. Asturias va con su bandera. */
var EV_FILTER_SHORT  = {'Grandes':'Grande','Asturias':'<svg class="ev-chip-flag" viewBox="0 0 26 16" aria-label="Asturias"><rect width="26" height="16" rx="2.5" fill="#1454c4"/><path d="M11.9,2.4 L14.1,2.4 L13.75,6 L17.7,5.5 L17.7,8.3 L13.75,7.8 L14.3,13.6 L11.7,13.6 L12.25,7.8 L8.3,8.3 L8.3,5.5 L12.25,6 Z" fill="#ffd83d"/></svg>','Rec. Gestiones':'Gesti&oacute;n',
  'WM + Rut':'WM/Rut','Resto':'Resto','Cumplea\u00f1os VIP':'\u2b50'};
var EV_FILTER_COLOR  = {'Grandes':'#38bdf8','Asturias':'#1d4ed8','Rec. Gestiones':'#34d399',
  'WM + Rut':'#c08a5a','Resto':'#ff6b6b','Cumplea\u00f1os VIP':'#fbbf24'};
/* Tras que grupo va la linea que separa eventos grandes de puntuales */
var EV_FILTER_SEP_AFTER = 'Asturias';
function evFilterGroup(ev){
  var t=getEvType(ev);
  if(t==='Cumplea\u00f1os VIP')return 'Cumplea\u00f1os VIP';
  if(t==='Asturias')return 'Asturias';
  if(getEvKind(ev)==='grande')return 'Grandes';
  if(t==='Ensayos boda'||t==='Rutina')return 'WM + Rut';
  if(t==='Rec. Gestiones')return 'Rec. Gestiones';
  return 'Resto';
}
var EV_PREV_VIEW = null;       // para volver al anual al pulsar ←
var EV_QUAD_YEAR = new Date().getFullYear();  // año de inicio del bloque 4 meses
var EV_QUAD_MONTH = new Date().getMonth();    // mes de inicio del bloque 4 meses (0-based)
var EV_TO_SUBTAB = 'puentes';  /* subpestana activa dentro de "Vacaciones Festivos" */
var EV_LIST_SUBTAB = 'months'; // 'months' | 'types'
var EV_TYPES_FILTER = 'all';   // 'all' | nombre de tipo
var EV_TYPES_PAST = true;
var EV_LIST_SORT = 'fecha';     /* 'fecha' | 'fecha-desc' | 'categoria' */
var EV_LIST_SEARCH = '';        /* busqueda por titulo o descripcion en "Todos" */      // excluir eventos pasados en Por Tipos (por defecto)
var EV_COLORS = ['#38bdf8','#1d4ed8','#34d399','#fb923c','#ff6b6b','#c084fc','#a3e635'];
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
        /* v241: clasificar en puntual/grande. Los "Otros" se reparten por
           duracion (1 dia -> puntual con forma; varios dias -> grande con barra) */
        if(ev.kind!=='puntual'&&ev.kind!=='grande'){ev.kind=getEvKind(ev);changed=true;}
      });
      /* v248: una clase de boda por dia (ver bodaNormalizeClasses) */
      if(typeof bodaNormalizeClasses==='function'&&bodaNormalizeClasses(arr))changed=true;
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
/* Fecha con día clampado al último del mes: evita el rollover de JS
   (new Date(2027,1,29) → 1-mar) que hacía que un anual del 29-feb
   apareciera el 1-mar y que un mensual del 29/30/31 desapareciera
   en los meses cortos. */
function _evClampDate(y,m,day){
  var last=new Date(y,m+1,0).getDate();
  return new Date(y,m,Math.min(day,last));
}
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
    var oS=_evClampDate(d.getFullYear(),d.getMonth(),start.getDate());
    if(oS<start)return false;
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
    var oS=_evClampDate(d.getFullYear(),start.getMonth(),start.getDate());
    if(oS<start)return false;
    var oE=new Date(oS);oE.setDate(oE.getDate()+span);
    return d>=oS&&d<=oE;
  }
  return false;
}

/* opts.rutinas===false -> sin sesiones de rutina.
   De momento las rutinas SOLO se pintan en el calendario de 1 mes; el resto
   de vistas (anual, 4 meses, agenda semanal, home y resumen) las excluyen. */
function getEventsOn(ds,opts){
  var out=EVENTS.filter(function(ev){return eventOccursOn(ev,ds);});
  /* Las rutinas no se guardan como eventos: generan sesiones "virtuales" que
     se cuelan aqui para que los calendarios las pinten sin cambios. */
  if((!opts||opts.rutinas!==false)&&typeof rutEventsOn==='function')out=out.concat(rutEventsOn(ds));
  return out;
}
var EV_NO_RUT = {rutinas:false};

/* ── Identidad de un evento para IMPORTAR sin duplicar ────────────
   Dos exportaciones del mismo evento hechas en dispositivos distintos tienen
   ids distintos, asi que comparar solo por id duplicaria. La firma compara lo
   que de verdad identifica al evento para una persona: que es, como se llama y
   que dias ocupa. El color, las notas o la forma NO entran: si cambian, sigue
   siendo el mismo evento y lo que llega lo actualiza. */
function evSignature(ev){
  var rep=ev.repeat?(ev.repeat.type+':'+((ev.repeat.weekDays||[]).join(''))):'';
  return [getEvKind(ev),getEvType(ev),
    String(ev.title||'').trim().toLowerCase().replace(/\s+/g,' '),
    ev.start,ev.end||ev.start,
    (ev.dates&&ev.dates.length)?ev.dates.slice().sort().join(','):'',
    rep].join('|');
}
/* Fusiona una lista de eventos entrantes sobre EVENTS sin crear duplicados.
   Devuelve el recuento para poder decirselo al usuario. */
function evMergeIncoming(incoming){
  var byId={},bySig={};
  EVENTS.forEach(function(ev,i){byId[ev.id]=i;bySig[evSignature(ev)]=i;});
  var r={nuevos:0,actualizados:0,duplicados:0};
  incoming.forEach(function(ev){
    if(!ev||!ev.start)return;
    if(!ev.id)ev.id='ev-'+Date.now()+'-'+Math.floor(Math.random()*10000);
    if(ev.title)ev.title=String(ev.title).trim();   /* higiene al importar */
    var i=byId[ev.id];
    if(i!==undefined){                     /* mismo id: es el mismo evento */
      EVENTS[i]=ev;bySig[evSignature(ev)]=i;r.actualizados++;return;
    }
    var sig=evSignature(ev);
    var j=bySig[sig];
    if(j!==undefined){                     /* mismo contenido con otro id */
      var idPrevio=EVENTS[j].id;
      ev.id=idPrevio;                      /* se conserva el id que ya habia */
      EVENTS[j]=ev;r.duplicados++;return;
    }
    byId[ev.id]=EVENTS.length;bySig[sig]=EVENTS.length;
    EVENTS.push(ev);r.nuevos++;
  });
  return r;
}
function evMergeMsg(r){
  var p=[];
  if(r.nuevos)p.push(r.nuevos+' nuevo'+(r.nuevos>1?'s':''));
  if(r.actualizados)p.push(r.actualizados+' actualizado'+(r.actualizados>1?'s':''));
  if(r.duplicados)p.push(r.duplicados+' ya existía'+(r.duplicados>1?'n':''));
  return p.length?p.join(' · '):'sin cambios';
}

/* ── Norma general: máximo EV_MAX_DAY_EVENTS eventos en un mismo día ──
   Devuelve la primera fecha 'YYYY-MM-DD' que se pasaría del límite al
   guardar newEv (null = se puede guardar). excludeId: id del evento que se
   está editando (no cuenta contra sí mismo). */
function _fmtDayEs(ds){return ds.slice(8,10)+'/'+ds.slice(5,7)+'/'+ds.slice(0,4);}
function evDayLimitExceeded(newEv,excludeId){
  var days=[],i,g;
  if(newEv.dates&&newEv.dates.length){
    days=newEv.dates.slice(0,400);
  }else{
    var s=new Date(newEv.start+'T00:00:00');
    var e=new Date((newEv.end||newEv.start)+'T00:00:00');
    for(var d=new Date(s),g=0;d<=e&&g<400;d.setDate(d.getDate()+1),g++)days.push(evDk(d));
  }
  if(newEv.repeat){
    /* Recurrentes: comprobar el próximo año de ocurrencias */
    var t=new Date();t.setHours(0,0,0,0);
    for(i=0;i<366;i++){
      var dd=new Date(t);dd.setDate(dd.getDate()+i);
      var ds2=evDk(dd);
      if(eventOccursOn(newEv,ds2)&&days.indexOf(ds2)===-1)days.push(ds2);
    }
  }
  for(i=0;i<days.length;i++){
    var n=0;
    for(var j=0;j<EVENTS.length;j++){
      if(excludeId&&EVENTS[j].id===excludeId)continue;
      if(eventOccursOn(EVENTS[j],days[i]))n++;
    }
    if(typeof rutEventsOn==='function')n+=rutEventsOn(days[i]).length;
    if(n>=EV_MAX_DAY_EVENTS)return days[i];
  }
  return null;
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
function evDefaultShape(ev){
  var t=getEvType(ev);
  if(t==='Ensayos boda')return 'x-boda';   /* aspa bicolor: pareja + franja horaria */
  if(t==='Otros')return 'circle';
  return 'rounded';
}
function evMarkerHtml(ev,pastClass,sizeClass,defaultShape,ds){
  var color=getEvDisplayColor(ev);
  var shape=(getEvType(ev)==='Ensayos boda')?'x-boda':(ev.shape||defaultShape||'circle');
  var pmk=pastClass||'';
  var sz=sizeClass?(' '+sizeClass):'';
  var dsAttr=ds?(' data-ds="'+ds+'"'):'';
  if(shape==='x-boda'&&typeof evBodaSvg==='function'){
    return '<span class="ev-annual-marker ev-shape-x-boda'+pmk+sz+'" data-id="'+ev.id+'"'+dsAttr+'>'+evBodaSvg(ev)+'</span>';
  }
  /* Todas las formas se dibujan con evShapeSvg() → mismo grosor de borde
     (EV_SHAPE_BW) y escalado automático al tamaño del contenedor. */
  return '<span class="ev-annual-marker ev-shape-'+shape+pmk+sz+'" data-id="'+ev.id+'"'+dsAttr+' style="color:'+color+'">'+evShapeSvg(shape)+'</span>';
}
/* Marcador "+" (hay más eventos de los que caben en el día) */
function evMorePlusHtml(extraClass){
  return '<span class="ev-annual-marker ev-marker-more'+(extraClass?' '+extraClass:'')+'">'+evMorePlusSvg()+'</span>';
}
/* Orden de los marcadores dentro de un mismo día: las gestiones SIEMPRE
   primero. Importa por dos motivos: es lo que mas urge ver de un vistazo, y en
   anual/4-meses solo se dibujan los tres primeros antes del "+", asi que ser
   el primero garantiza que se vea. El resto conserva su orden.
   Para dar prioridad a otra categoria basta con anadirla aqui. */
var EV_MARK_ORDER = {'Rec. Gestiones':0};
function evMarkPriority(ev){
  if(!ev)return 9;                       /* cumpleanos VIP y demas: al final */
  var p=EV_MARK_ORDER[getEvType(ev)];
  return (p===undefined)?9:p;
}
/* Hora de una clase de boda en minutos (para ordenarlas); las que no tienen
   hora van al final de su grupo. */
function evBodaMinutes(ev){
  var t=ev&&ev.boda&&ev.boda.time;
  if(!t)return 99999;
  var p=String(t).split(':');
  return (parseInt(p[0],10)||0)*60+(parseInt(p[1],10)||0);
}
/* Ordena conservando el orden original dentro de cada prioridad.
   getEv permite pasar listas de objetos que envuelven al evento.
   Ademas, las CLASES DE BODA se ordenan entre si por hora: se reordenan solo
   entre ellas y ocupan las mismas posiciones que ya tenian, para no alterar el
   orden del resto de categorias. */
function evSortMarks(list,getEv){
  function ev0(x){return getEv?getEv(x):x;}
  var out=list.map(function(x,i){return {x:x,i:i,p:evMarkPriority(ev0(x))};})
    .sort(function(a,b){return (a.p-b.p)||(a.i-b.i);})
    .map(function(o){return o.x;});
  var pos=[],clases=[];
  out.forEach(function(x,i){
    var e=ev0(x);
    if(e&&getEvType(e)==='Ensayos boda'){pos.push(i);clases.push(x);}
  });
  if(clases.length>1){
    clases.sort(function(a,b){return evBodaMinutes(ev0(a))-evBodaMinutes(ev0(b));});
    pos.forEach(function(p,k){out[p]=clases[k];});
  }
  return out;
}
/* Distribución de marcadores puntuales en anual/4-meses:
   1 → cuadrado entero · 2 → izquierda/derecha · 3 → pirámide · 4 → cubo 2×2
   >4 → 3 marcadores + "+" en la 4ª posición. */
var EV_MAX_DAY_EVENTS = 8;   /* norma general: máximo 8 eventos en un mismo día */
var EV_CAL_BADGE_STACK = 5;  /* 1-mes: badges apilados desde abajo; los que sobran van bajo el número del día */
/* 1-mes: huecos de la columna derecha (eventos puntuales). Si hay mas, el
   ultimo hueco se convierte en el "+" que abre el carrusel del dia. */
var EV_CAL_CORNER_STACK = 5;
/* Cumpleanos VIP que caben el mismo dia en la columna izquierda */
var EV_CAL_VIP_MAX = 3;
/* Checks de la subpestana Proximos, en positivo: marcados = se ven */
var EV_UP_SHOW_RUT = true;
var EV_UP_SHOW_BODA = true;
function evAnnualXsHtml(items){
  if(!items.length)return '';
  var n=items.length;
  var shown=items;
  if(n>4)shown=items.slice(0,3).concat([evMorePlusHtml()]);
  return '<div class="ev-annual-xs ev-xs-n'+Math.min(n,4)+'">'+shown.join('')+'</div>';
}
/* ── Helper: estrella VIP como SVG (relleno dorado + borde negro)
   Sustituye al emoji ⭐ que dependía del render del SO y no casaba con
   el tamaño del resto de markers. ── */
function vipStarSvgHtml(id,pastClass,sizeClass){
  var pmk=pastClass||'';
  var sz=sizeClass?(' '+sizeClass):'';
  var svg='<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">'
    +'<polygon points="12,2 14.9,8.6 22,9.3 16.5,14.1 18.2,21 12,17.3 5.8,21 7.5,14.1 2,9.3 9.1,8.6" '
    +'fill="#fbbf24" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/>'
    +'</svg>';
  return '<span class="ev-annual-vip-star-svg'+pmk+sz+'" data-id="'+id+'">'+svg+'</span>';
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
  var multiEvs=EVENTS.filter(function(ev){return !ev.repeat&&!(ev.dates&&ev.dates.length)&&ev.end&&isEvBarAlways(ev);});
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  var DN7=['L','M','X','J','V','S','D'];
  /* Contenedor propio: evita el gap:16px de .sy-body entre semanas (así caben
     las 6 semanas de meses como agosto 2026) y acota el sticky de la cabecera */
  var h='<div class="ev-month-wrap">';
  h+='<div class="ev-week-hdr">';
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
    /* Reparto en filas por grosor — ver _evAssignRow */
    var rowOcc=_evRowOcc();
    wMulti.forEach(function(it){_evAssignRow(it,rowOcc);});
    _evMarcarMitades(wMulti);
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
      /* Reparto del dia en DOS COLUMNAS (v258):
           - derecha (a la altura del numero): hasta EV_CAL_CORNER_STACK
             marcadores de eventos puntuales; si sobran, el ultimo hueco pasa
             a ser el "+" que abre el carrusel del dia.
           - izquierda (empieza bajo el numero): primero los cumpleanos VIP
             (solapados, maximo EV_CAL_VIP_MAX) y debajo las sesiones de
             rutina con su icono. */
      var _corner=[],_vips=[],_ruts=[];
      evs.forEach(function(ev){
        if(multiIds[ev.id])return;
        if(ev.id.indexOf('ev-bday-vip-')===0){_vips.push(ev.id);return;}
        if(ev._rut){_ruts.push(ev);return;}
        _corner.push({vip:false,ev:ev});
      });
      _corner=evSortMarks(_corner,function(it){return it.ev;});
      var _pmkM=past?' past-marker':'';
      if(_corner.length){
        var _cut=_corner.length>EV_CAL_CORNER_STACK?EV_CAL_CORNER_STACK-1:_corner.length;
        h+='<div class="ev-otros-corner">';
        _corner.slice(0,_cut).forEach(function(it){
          h+=evMarkerHtml(it.ev,_pmkM,'ev-marker-lg',evDefaultShape(it.ev),ds);
        });
        if(_corner.length>EV_CAL_CORNER_STACK)
          h+='<span class="ev-day-more" data-ds="'+ds+'">'+evMorePlusHtml('ev-marker-lg')+'</span>';
        h+='</div>';
      }
      if(_vips.length||_ruts.length){
        h+='<div class="ev-day-left">';
        if(_vips.length){
          h+='<div class="ev-day-vips" data-ds="'+ds+'">';
          _vips.slice(0,EV_CAL_VIP_MAX).forEach(function(vid){
            h+=vipStarSvgHtml(vid,_pmkM,'ev-marker-lg');
          });
          h+='</div>';
        }
        if(_ruts.length){
          h+='<div class="ev-day-ruts">';
          _ruts.forEach(function(rev){h+=rutMarkerHtml(rev,_pmkM,ds);});
          h+='</div>';
        }
        h+='</div>';
      }
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
        h+='<div class="ev-multi-bar '+evBarSizeCls(ev)+sc+_pastBar+'" data-id="'+ev.id+'"'
          +' style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';z-index:'+evBarZ(ev)+';border:1.5px solid '+_dc+';background:'+fakeTrans(_dc,0.65)+';color:#fff'+(hasInM?'':';opacity:.35')+_evMitadesStyle(it)+'">'
          +(showT?escHtml(ev.title):'')+'</div>';
      });
      h+='</div>';
    }
    h+='</div>'; // ev-week-outer
    cur.setDate(cur.getDate()+7);
  }
  h+='</div>'; // ev-month-wrap
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
  h+='<div class="ev-list-actions"><span class="ev-list-hint">&#8942;</span></div>';
  h+='</div>';
  return h;
}

/* ── Borrar un evento: hoja de confirmacion (se llega con pulsacion larga) ── */
function openEvDeleteSheet(ev){
  _evCancelRemove('evDelWrap');
  var old=document.getElementById('evDelWrap');if(old)old.remove();
  var h='<div class="ev-detail-overlay" id="evDelOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div class="ev-del-title">'+escHtml(ev.title)+'</div>';
  h+='<div class="ev-del-sub">'+getEvType(ev)+' \u00b7 '+_fmtDayEs(ev.start)+'</div>';
  h+='<div class="ev-detail-actions">';
  h+='<button class="ev-btn" id="evDelEdit">&#9998; Editar</button>';
  h+='<button class="ev-btn danger" id="evDelGo">&#128465; Eliminar</button>';
  h+='</div></div></div>';
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='evDelWrap';wrap.innerHTML=h;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('evDelOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeEvDeleteSheet();});}
  });
  document.getElementById('evDelEdit').addEventListener('click',function(){
    closeEvDeleteSheet();setTimeout(function(){openEvForm(ev);},310);
  });
  document.getElementById('evDelGo').addEventListener('click',function(){
    var idx=-1;
    for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===ev.id){idx=i;break;}
    var copia=EVENTS[idx];
    EVENTS=EVENTS.filter(function(e){return e.id!==ev.id;});
    saveEvents();updateEventsBtn();
    closeEvDeleteSheet();
    setTimeout(function(){refreshEvents();},310);
    showToast('Evento eliminado','success',function(){
      if(idx>=0)EVENTS.splice(idx,0,copia);else EVENTS.push(copia);
      saveEvents();updateEventsBtn();refreshEvents();
    });
  });
}
function closeEvDeleteSheet(){
  var fo=document.getElementById('evDelOv');
  if(fo)fo.classList.remove('open');
  _evScheduleRemove('evDelWrap');
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
    var t=_evClampDate(today.getFullYear(),start.getMonth(),start.getDate());
    var te=new Date(t);te.setDate(te.getDate()+span);
    if(te>=today)return t>=today?t:today;
    return _evClampDate(today.getFullYear()+1,start.getMonth(),start.getDate());
  }
  if(r.type==='monthly-date'){
    var t=_evClampDate(today.getFullYear(),today.getMonth(),start.getDate());
    var te=new Date(t);te.setDate(te.getDate()+span);
    if(te>=today)return t>=today?t:today;
    var nm=today.getMonth()+1,ny=today.getFullYear();
    if(nm>11){nm=0;ny++;}
    return _evClampDate(ny,nm,start.getDate());
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
/* Marcador de la tarjeta de Proximos: la misma forma y el mismo color que
   se ve en el calendario. Los eventos grandes no tienen forma (son barras),
   asi que conservan su pastilla de color. */
function evUpcomingMarkHtml(ev){
  if(ev.id.indexOf('ev-bday-vip-')===0)return vipStarSvgHtml(ev.id,'','ev-marker-up');
  if(ev._rut&&typeof rutIconSvg==='function'){
    var r=ev._rut;
    return '<span class="ev-rut-mark ev-marker-up">'+rutIconSvg(rutIconOf(r),r.color||'#888')+'</span>';
  }
  if(typeof isEvBarAlways==='function'&&isEvBarAlways(ev))
    return '<span class="ev-up-bar" style="background:'+getEvDisplayColor(ev)+'"></span>';
  return evMarkerHtml(ev,'','ev-marker-up',evDefaultShape(ev),evIsoDate(new Date(ev.start+'T00:00:00')));
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
    s+='<div class="ev-up-mark">'+evUpcomingMarkHtml(ev)+'</div>';
    s+='<div class="ev-upcoming-info">';
    s+='<div class="ev-upcoming-title">'+title+'</div>';
    s+='<div class="ev-upcoming-meta">'+type+' \u00b7 '+metaDate+'</div>';
    if(ev.note&&ev.note.trim()&&!_isVip)s+='<div class="ev-upcoming-note">'+escHtml(ev.note.trim())+'</div>';
    /* Nota propia del dia que se muestra (eventos puntuales de varios dias) */
    var _dsN=evIsoDate(item.firstDate);
    if(!_isVip&&ev.dayNotes&&ev.dayNotes[_dsN]&&ev.dayNotes[_dsN].trim()){
      s+='<div class="ev-upcoming-note ev-upcoming-daynote"><span class="ev-note-scope">'
        +_dsN.slice(8)+'/'+_dsN.slice(5,7)+'</span> '+escHtml(ev.dayNotes[_dsN].trim())+'</div>';
    }
    /* Hora del evento y, en los grandes, los trayectos de ida y vuelta */
    var _evT=evTimeLabel(ev);
    if(_evT&&!ev._rut&&getEvType(ev)!=='Ensayos boda')
      s+='<div class="ev-upcoming-boda">\ud83d\udd52 '+_evT+'</div>';
    var _trs=evTramos(ev);
    if(_trs.length){
      s+='<div class="ev-upcoming-boda">'
        +_trs.map(function(tr){return evTramoTexto(tr);}).join(' \u00b7 ')+'</div>';
    }
    /* Ensayos de boda: hora y sala al pie de la tarjeta */
    if(getEvType(ev)==='Ensayos boda'&&typeof bodaPlaceOf==='function'){
      var _bd=ev.boda||{}, _bpl=bodaPlaceOf(ev);
      s+='<div class="ev-upcoming-boda">&#128337; '+(_bd.time||'sin hora')
        +' \u00b7 '+bodaPlaceEmoji(_bpl)+' '+escHtml(_bpl?BODA_PLACE_SHORT[_bpl]:'sin sala')+'</div>';
    }
    s+='</div>';
    s+='<div class="ev-upcoming-right">';
    s+='<span class="ev-upcoming-bell'+(_bellSet?' set':'')+'">&#128276;</span>';
    s+='<div class="'+lblCls+'">'+lbl+'</div>';
    s+='</div>';
    s+='</div>';
    return s;
  }
  /* Un panel de Proximos se pinta en dos bloques:
       1) los eventos GRANDES, siempre arriba y sin minicabecera
       2) el resto, agrupado por dia con una minicabecera (ej: "Dom 23/08")
          que sale una sola vez aunque el dia tenga varios eventos. */
  function renderEvPanel(ids,map){
    var grandes=[],sueltos=[];
    ids.forEach(function(id){
      var it=map[id];
      if(typeof getEvKind==='function'&&getEvKind(it.ev)==='grande')grandes.push(id);
      else sueltos.push(id);
    });
    var out='';
    grandes.forEach(function(id){
      var it=map[id];
      out+=renderEvItem(it.ev,it,Math.round((it.firstDate-today)/86400000));
    });
    var prevDs=null;
    sueltos.forEach(function(id){
      var it=map[id];
      var ds=evIsoDate(it.firstDate);
      if(ds!==prevDs){
        prevDs=ds;
        var _hoy=(it.firstDate.getTime()===today.getTime());
        out+='<div class="ev-up-daysep'+(_hoy?' today':'')+'">'+fd2(it.firstDate)+(_hoy?' <span>Hoy</span>':'')+'</div>';
      }
      out+=renderEvItem(it.ev,it,Math.round((it.firstDate-today)/86400000));
    });
    return out;
  }
  /* ── Semanas hacia adelante ──
     Dedupe: cada evento se asigna solo a la PRIMERA semana donde aparece,
     usando ev.start como fecha mostrada (no el primer día activo en esa
     semana, que daría duraciones distintas entre secciones). */
  var weeks=[{},{},{}];
  var _seenEv={};
  for(var w=0;w<3;w++){
    for(var d=0;d<7;d++){
      var day=new Date(wk0);day.setDate(day.getDate()+(w*7+d));
      var ds=evDk(day);
      var evs=getEventsOn(ds,EV_UP_SHOW_RUT?null:EV_NO_RUT);
      evs.forEach(function(ev){
        if(_isVipBdayTooFar(ev,day,today))return;
        if(!EV_UP_SHOW_BODA&&getEvType(ev)==='Ensayos boda')return;
        if(_seenEv[ev.id])return;
        /* Recurrentes: ignorar ocurrencias ya pasadas de esta semana,
           el evento se asigna a su PRÓXIMA ocurrencia (day >= hoy). */
        if(ev.repeat&&day<today)return;
        _seenEv[ev.id]=true;
        var _startD=ev.repeat?new Date(day):new Date(ev.start+'T00:00:00');
        weeks[w][ev.id]={ev:ev,firstDate:_startD};
      });
    }
  }
  var todayStr=evDk(today);
  var anyEvents=weeks.some(function(wk){
    return Object.keys(wk).some(function(id){
      var item=wk[id];var ev=item.ev;
      if(ev.repeat)return true; /* firstDate ya es la próxima ocurrencia */
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
        var fday=new Date(wk0);fday.setDate(fday.getDate()+(fw*7+fd3));
        var fds=evDk(fday);
        var fevs=getEventsOn(fds,EV_UP_SHOW_RUT?null:EV_NO_RUT);
        fevs.forEach(function(ev){
          if(ev.id.indexOf('ev-bday-vip-')===0)return;
          if(!EV_UP_SHOW_BODA&&getEvType(ev)==='Ensayos boda')return;
          if(!fwMap[ev.id])fwMap[ev.id]={ev:ev,firstDate:new Date(fday)};
        });
      }
      if(Object.keys(fwMap).length>0){
        fallbackMap=fwMap;
        var fwStart=new Date(wk0);fwStart.setDate(fwStart.getDate()+fw*7);
        var fwEnd=new Date(fwStart);fwEnd.setDate(fwEnd.getDate()+6);
        fallbackLabel='Semana del '+fwStart.getDate()+'/'+(fwStart.getMonth()+1)+' al '+fwEnd.getDate()+'/'+(fwEnd.getMonth()+1);
        break;
      }
    }
    if(!fallbackMap)return '<div class="sy-note">No hay eventos programados.</div>';
    h+='<div class="sy-note" style="margin-bottom:8px">Sin eventos en las pr\u00f3ximas 3 semanas. Primera semana con eventos:</div>';
    var fids=Object.keys(fallbackMap);
    fids.sort(function(a,b){
      return (fallbackMap[a].firstDate-fallbackMap[b].firstDate)
        ||(evBodaMinutes(fallbackMap[a].ev)-evBodaMinutes(fallbackMap[b].ev));
    });
    h+='<div class="ev-week-sep">'+fallbackLabel+'</div>';
    h+='<div class="ev-upcoming-section">'+renderEvPanel(fids,fallbackMap)+'</div>';
    return h;
  }
  weeks.forEach(function(wkMap,wi){
    var ids=Object.keys(wkMap);
    if(!ids.length)return;
    ids.sort(function(a,b){
      return (wkMap[a].firstDate-wkMap[b].firstDate)
        ||(evBodaMinutes(wkMap[a].ev)-evBodaMinutes(wkMap[b].ev));
    });
    /* Se descartan los puntuales ya pasados (los de varios días que cruzan hoy
       salen como "En curso"; los recurrentes nunca entran aquí: su firstDate
       es la próxima ocurrencia) */
    var vivos=ids.filter(function(id){
      var item=wkMap[id];var ev=item.ev;
      var diffToday=Math.round((item.firstDate-today)/86400000);
      if(diffToday<0&&!ev.repeat){
        var evEndStr=ev.end&&ev.end!==ev.start?ev.end:ev.start;
        if(evEndStr<todayStr)return false;
      }
      return true;
    });
    var secH=renderEvPanel(vivos,wkMap);
    if(!secH)return;
    h+='<div class="ev-week-sep'+(wi===0?' now':'')+'">'+weekLabels[wi]+'</div>';
    h+='<div class="ev-upcoming-section">'+secH+'</div>';
  });
  return h;
}

/* ── Reparto de barras en filas y orden de capas ───────────────────
   Las barras de eventos grandes se apilan asi (de arriba a abajo):
     marcadores puntuales > barra fina > media > gruesa > perimetro de puente
   Por eso el reparto en filas se hace POR GROSOR: dos barras del mismo grosor
   que se solapan van a filas distintas (y la franja se estrecha para que
   quepan), mientras que dos de grosor distinto comparten fila y se superponen,
   quedando la mas fina visible encima de la mas gruesa. */
var EV_BAR_Z = {sm:3, md:2, lg:1};
function _evRowOcc(){return {lg:[[],[],[]], md:[[],[],[]], sm:[[],[],[]]};}
/* ¿Chocan de verdad dos tramos, o solo se rozan?
   "Rozarse" es que una barra ACABE justo el dia en que la otra EMPIEZA: ahi no
   hay conflicto real, caben las dos en la misma fila repartiendose la casilla
   de ese dia a mitades. Solo cuenta si las dos duran mas de un dia; con una
   barra de un solo dia no se sabria que mitad le toca. */
function _evSoloSeRozan(aS,aE,bS,bE){
  if(aE<bS||aS>bE)return false;                 /* ni se tocan */
  if(Math.max(aS,bS)!==Math.min(aE,bE))return false;  /* pisan mas de un dia */
  if(aS===aE||bS===bE)return false;             /* alguna es de un solo dia */
  return (aE===bS)||(bE===aS);
}
function _evAssignRow(it,rowOcc){
  var occ=rowOcc[evBarSize(it.ev)]||rowOcc.md;
  for(var r=0;r<3;r++){
    var ok=true;
    for(var j=0;j<occ[r].length;j++){
      var o=occ[r][j];
      if(it.cs<=o[1]&&it.ce>=o[0]&&!_evSoloSeRozan(it.cs,it.ce,o[0],o[1])){ok=false;break;}
    }
    if(ok){it.row=r;occ[r].push([it.cs,it.ce]);break;}
  }
}
/* Marca que barras tienen que ceder media casilla en su primer o ultimo dia.
   Se mira contra TODAS las barras de la semana, no solo las de su fila: si el
   dia se comparte, se comparte se pinte donde se pinte. */
function _evMarcarMitades(lista){
  lista.forEach(function(a){
    a.halfL=false;a.halfR=false;
    if(a.row<0)return;
    lista.forEach(function(b){
      if(a===b||b.row<0)return;
      if(!_evSoloSeRozan(a.cs,a.ce,b.cs,b.ce))return;
      if(b.ce===a.cs)a.halfL=true;   /* la otra acaba donde esta empieza */
      if(b.cs===a.ce)a.halfR=true;   /* la otra empieza donde esta acaba */
    });
  });
}
/* Margen en linea para ceder media casilla. El porcentaje de un margen en un
   elemento de rejilla se mide sobre el ancho de SU area, asi que media casilla
   de una barra de N dias es 50%/N. */
function _evMitadesStyle(it){
  var n=(it.ce-it.cs+1)||1;
  var s='';
  if(it.halfL)s+=';margin-left:calc(50% / '+n+')';
  if(it.halfR)s+=';margin-right:calc(50% / '+n+')';
  return s;
}
function evBarZ(ev){return EV_BAR_Z[evBarSize(ev)]||2;}

/* ── Render: tarjeta de un mes (compartida por Anual y 4 meses) ────
   Anual y 4-meses pintan EXACTAMENTE la misma tarjeta de mes; solo cambian
   tres detalles, que llegan en `o`:
     o.showYear   → el nombre del mes lleva el ano (4 meses)
     o.barTitles  → las barras muestran el titulo del evento (4 meses)
     o.puenteMap / sueltoFestMap / sueltoVacMap / multiEvs / multiIds / visible
   Mantener el render en un unico sitio: antes eran dos copias de ~160 lineas y
   cada ajuste habia que aplicarlo dos veces. */
var EV_MNS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

/* Contexto comun de los dos calendarios (filtro de grupos + eventos barra) */
function _evAnnualCtx(evFilter){
  function visible(ev){
    if(!EV_ANNUAL_FILTER_HIDDEN.length)return true;
    return EV_ANNUAL_FILTER_HIDDEN.indexOf(evFilterGroup(ev))===-1;
  }
  var multiEvs=EVENTS.filter(function(ev){
    if(ev.repeat||(ev.dates&&ev.dates.length)||!ev.end||!isEvBarAlways(ev)||!visible(ev))return false;
    return evFilter?evFilter(ev):true;
  });
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  return {
    visible:visible, multiEvs:multiEvs, multiIds:multiIds,
    vipHidden:EV_ANNUAL_FILTER_HIDDEN.indexOf('Cumplea\u00f1os VIP')!==-1,
    today:(function(){var t=new Date();t.setHours(0,0,0,0);return t;})(),
    puenteMap:{}, sueltoFestMap:{}, sueltoVacMap:{}, loadedYears:{},
    showYear:false, barTitles:false
  };
}
/* Carga los puentes/festivos/vacaciones de un ano en el contexto (una vez) */
function _evLoadPuentes(o,yr){
  if(o.loadedYears[yr])return;
  o.loadedYears[yr]=true;
  if(typeof computePuentes!=='function')return;
  var pd=computePuentes(yr);
  pd.puentes.forEach(function(seq){seq.forEach(function(x){o.puenteMap[evDk(x.date)]=true;});});
  pd.festivosSueltos.forEach(function(dt){o.sueltoFestMap[evDk(dt)]=true;});
  pd.vacSueltos.forEach(function(dt){o.sueltoVacMap[evDk(dt)]=true;});
}

function _renderEvMonthCard(m,yr,o){
  var today=o.today;
  var h='<div class="ev-annual-month" data-month="'+m+'"'+(o.showYear?(' data-year="'+yr+'"'):'')+'>';
  h+='<div class="ev-annual-mname">'+EV_MNS[m]+(o.showYear?(' '+yr):'')+'</div>';
  h+='<div class="ev-annual-cal">';
  h+='<div class="ev-annual-hdr-row">';
  ['L','M','X','J','V','S','D'].forEach(function(d){h+='<div class="ev-annual-hdr">'+d+'</div>';});
  h+='</div>';
  var first=new Date(yr,m,1), last=new Date(yr,m+1,0);
  var cur=new Date(first);
  var dow=cur.getDay(); var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    /* Semana de 7 dias */
    var wk=[];
    for(var wi=0;wi<7;wi++){
      wk.push(new Date(cur.getFullYear(),cur.getMonth(),cur.getDate()));
      cur.setDate(cur.getDate()+1);
    }
    var wStart=wk[0],wEnd=wk[6];
    /* Eventos barra que cruzan la semana, recortados a los dias de ESTE mes */
    var wMulti=[];
    o.multiEvs.forEach(function(ev){
      var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
      if(ee<wStart||es>wEnd)return;
      var cs=Math.max(0,Math.round((es-wStart)/86400000));
      var ce=Math.min(6,Math.round((ee-wStart)/86400000));
      while(cs<=ce&&wk[cs]&&wk[cs].getMonth()!==m)cs++;
      while(ce>=cs&&wk[ce]&&wk[ce].getMonth()!==m)ce--;
      if(cs>ce)return;
      wMulti.push({ev:ev,cs:cs,ce:ce,starts:es>=wStart,ends:ee<=wEnd,row:-1});
    });
    /* Reparto en filas (max 3) POR GROSOR: dos barras del mismo grosor que
       chocan van a filas distintas (se estrechan); dos de grosor distinto
       comparten fila y se superponen, con la mas fina encima (z-index). */
    var rowOcc=_evRowOcc();
    wMulti.forEach(function(it){_evAssignRow(it,rowOcc);});
    _evMarcarMitades(wMulti);
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
      var inPuente=inM&&o.puenteMap[ds];
      if(inPuente){if(abspanStart<0)abspanStart=di;}
      else{if(abspanStart>=0){abspans.push({s:abspanStart,e:di-1});abspanStart=-1;}}
      var puenteCls='';
      if(inPuente){puenteCls=EV_ANNUAL_VIEW==='puentes'?' ev-annual-puente':'';}
      else if(EV_ANNUAL_VIEW==='puentes'){
        if(inM&&o.sueltoFestMap[ds])puenteCls=' ev-annual-suelto-fest';
        else if(inM&&o.sueltoVacMap[ds])puenteCls=' ev-annual-suelto-vac';
      }
      var fiestasCls='';
      if(inM){
        if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='festivos')&&dt==='festivo')fiestasCls=' ann-festivo';
        else if((EV_ANNUAL_VIEW==='fiestas'||EV_ANNUAL_VIEW==='vacaciones')&&dt==='vacaciones')fiestasCls=' ann-vac';
      }
      var past=inM&&d<today;
      /* Cumpleanos VIP: rayas amarillas sobre la casilla (sin estrella aqui) */
      var _vipDay=inM&&!o.vipHidden&&typeof BDAYS!=='undefined'&&Array.isArray(BDAYS)
        &&BDAYS.some(function(b){return b.vip&&b.day===d.getDate()&&b.month===d.getMonth()+1;});
      var cls='ev-annual-day'+(inM?'':' out-m')+(isT?' ann-today':'')+(past?' past-cal-day':'')
        +puenteCls+fiestasCls+(_vipDay?' ann-vip-bday':'');
      var bg='';
      if(inM){
        if(EV_ANNUAL_VIEW==='puentes'){
          if(dt==='festivo')         bg='rgba(255,107,107,.55)';
          else if(dt==='vacaciones') bg='rgba(255,179,71,.55)';
          else if(dt==='ausencia')   bg='rgba(192,132,252,.55)';
          else if(isWknd)            bg='rgba(160,160,200,.22)';
        } else if(isWknd)            bg='rgba(160,160,200,.22)';
      }
      var sty=bg?' style="background:'+bg+'"':'';
      var dsAttr=inM?' data-ds="'+ds+'"':'';
      /* Eventos puntuales: marcadores en rejilla 2x2 (z-index:3) */
      var marcadores='';
      if(inM){
        var single=evSortMarks(evs.filter(function(ev){
          return !o.multiIds[ev.id]&&o.visible(ev)&&ev.id.indexOf('ev-bday-vip-')!==0&&!ev._rut;
        }));
        if(single.length){
          var pmk=past?' past-marker':'';
          marcadores=evAnnualXsHtml(single.map(function(ev){
            return evMarkerHtml(ev,pmk,'',evDefaultShape(ev),ds);
          }));
        }
        /* Las sesiones de rutina no llevan silueta aqui: no cabria. Van como
           puntitos en fila arriba del dia, uno por sesion. */
        var _ruts=evs.filter(function(ev){return ev._rut&&o.visible(ev);});
        if(_ruts.length){
          var _rh='<div class="ev-ann-ruts">';
          _ruts.forEach(function(rev){
            _rh+='<span class="ev-ann-rut" style="background:'+(rev.color||'#888')+'"></span>';
          });
          marcadores=_rh+'</div>'+marcadores;
        }
      }
      h+='<div class="'+cls+'"'+sty+dsAttr+'>'+marcadores+'</div>';
    }
    if(abspanStart>=0)abspans.push({s:abspanStart,e:6});
    /* Barras (z-index:2) */
    var activeRows=0;wMulti.forEach(function(it){if(it.row>=0)activeRows=Math.max(activeRows,it.row+1);});
    if(activeRows>0){
      var rowsCls=activeRows>=3?' ev-bars-3rows':activeRows===2?' ev-bars-2rows':'';
      h+='<div class="ev-annual-bars-row'+rowsCls+'">';
      wMulti.forEach(function(it){
        if(it.row<0)return;
        var sc=it.starts&&it.ends?'':it.starts?' a-starts':it.ends?' a-ends':' a-mid';
        var dc=getEvDisplayColor(it.ev);
        var pastBar=wk[it.ce]<today?' past-bar':'';
        var extra=o.barTitles?';font-size:.3rem;padding:0 3px':'';
        var txt=(o.barTitles&&(it.starts||it.cs===0))?escHtml(it.ev.title):'';
        h+='<div class="ev-annual-mbar '+evBarSizeCls(it.ev)+sc+pastBar+'" data-id="'+it.ev.id+'"'
          +' style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)
          +';z-index:'+evBarZ(it.ev)
          +';border:1px solid '+dc+';background:'+fakeTrans(dc,0.65)+extra+_evMitadesStyle(it)+'">'+txt+'</div>';
      });
      h+='</div>';
    }
    /* Perimetro de los dias puente (bordes abiertos si el puente continua) */
    if(abspans.length&&EV_ANNUAL_VIEW==='puentes'){
      var nextMon=new Date(wk[6]);nextMon.setDate(nextMon.getDate()+1);
      var prevSun=new Date(wk[0]);prevSun.setDate(prevSun.getDate()-1);
      var nextDs=evDk(nextMon),prevDs=evDk(prevSun);
      abspans.forEach(function(sp){
        var right=wk[sp.e+1],left=wk[sp.s-1];
        var noR=(sp.e===6&&o.puenteMap[nextDs])||(right&&o.puenteMap[evDk(right)]);
        var noL=(sp.s===0&&o.puenteMap[prevDs])||(left&&o.puenteMap[evDk(left)]);
        var bsty='grid-column:'+(sp.s+1)+'/'+(sp.e+2)+';grid-row:1;';
        if(noL)bsty+='border-left:none;border-top-left-radius:0;border-bottom-left-radius:0;';
        if(noR)bsty+='border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;';
        h+='<div class="ev-annual-puente-perimeter" style="'+bsty+'"></div>';
      });
    }
    h+='</div>'; /* ev-annual-week-outer */
  }
  h+='</div></div>'; /* ev-annual-cal + ev-annual-month */
  return h;
}

/* ── Render: calendario anual (12 tarjetas del mismo ano) ─────── */
function renderEvAnnual(){
  var o=_evAnnualCtx();
  _evLoadPuentes(o,EV_YEAR);
  var h='<div class="ev-annual-grid'+(EV_EDIT_MODE?' ev-edit-mode':'')+'">';
  for(var m=0;m<12;m++)h+=_renderEvMonthCard(m,EV_YEAR,o);
  return h+'</div>';
}

/* ── Render: calendario 4 meses (puede cruzar de ano) ──────── */
function renderEvQuad(){
  var months=[];
  for(var mi=0;mi<4;mi++){
    var tm=EV_QUAD_MONTH+mi;
    months.push({m:tm%12,y:EV_QUAD_YEAR+Math.floor(tm/12)});
  }
  var rangeStart=new Date(months[0].y,months[0].m,1);
  var rangeEnd=new Date(months[3].y,months[3].m+1,0);
  var o=_evAnnualCtx(function(ev){
    var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
    return ee>=rangeStart&&es<=rangeEnd;
  });
  o.showYear=true;      /* "Ago 2026" en la cabecera de cada tarjeta */
  o.barTitles=true;     /* las barras caben con titulo a este tamano */
  months.forEach(function(mo){_evLoadPuentes(o,mo.y);});
  var h='<div class="ev-annual-grid ev-quad-grid'+(EV_EDIT_MODE?' ev-edit-mode':'')+'">';
  months.forEach(function(mo){h+=_renderEvMonthCard(mo.m,mo.y,o);});
  return h+'</div>';
}

/* ── Render: lista de eventos por tipos ─────────────────── */
function renderEvByTypes(){
  var today=new Date();today.setHours(0,0,0,0);
  var typeOrder=['Viaje','Asturias','Casa Rural','Rec. Gestiones','Plan/Quedada','Ensayos boda','Otros'];
  /* Controles: buscador + orden + filtros */
  var h='<div class="ev-list-tools">';
  h+='<div class="ev-search"><span class="ev-search-ico">&#128269;</span>'
    +'<input type="search" id="evListSearch" placeholder="Buscar por título o descripción" value="'+escHtml(EV_LIST_SEARCH)+'">'
    +(EV_LIST_SEARCH?'<button class="ev-search-x" id="evListSearchX">&#215;</button>':'')+'</div>';
  h+='<div class="ev-sort-row">';
  [['fecha','Fecha ↑'],['fecha-desc','Fecha ↓'],['categoria','Categoría']].forEach(function(o){
    h+='<button class="boda-chip'+(EV_LIST_SORT===o[0]?' active':'')+'" data-sort="'+o[0]+'">'+o[1]+'</button>';
  });
  h+='</div>';
  h+='<div class="ev-types-controls">';
  h+='<label class="ev-types-past-label"><input type="checkbox" id="evTypesPast"'+(EV_TYPES_PAST?' checked':'')+'> Excluir pasados</label>';
  h+='<select class="ev-types-select" id="evTypesFilter">';
  h+='<option value="all"'+(EV_TYPES_FILTER==='all'?' selected':'')+'>Todos los tipos</option>';
  typeOrder.forEach(function(t){
    h+='<option value="'+escHtml(t)+'"'+(EV_TYPES_FILTER===t?' selected':'')+'>'+escHtml(t)+'</option>';
  });
  h+='</select></div></div>';
  if(!EVENTS.length)return h+'<div class="sy-note">No hay eventos. Pulsa &quot;+ A\u00f1adir&quot; para crear uno.</div>';
  /* Filtrado comun */
  var q=EV_LIST_SEARCH.trim().toLowerCase();
  function coincide(ev){
    if(!q)return true;
    var txt=(ev.title||'')+' '+(ev.note||'');
    if(ev.dayNotes)for(var k in ev.dayNotes)txt+=' '+ev.dayNotes[k];
    return txt.toLowerCase().indexOf(q)!==-1;
  }
  var lista=EVENTS.filter(function(ev){
    if(ev.id&&ev.id.indexOf('ev-bday-vip-')===0)return false;  /* los VIP tienen su ventana */
    var evEnd=ev.end?new Date(ev.end+'T00:00:00'):new Date(ev.start+'T00:00:00');
    if(EV_TYPES_PAST&&!ev.repeat&&evEnd<today)return false;
    if(EV_TYPES_FILTER!=='all'&&getEvType(ev)!==EV_TYPES_FILTER)return false;
    return coincide(ev);
  });
  if(!lista.length){
    return h+'<div class="sy-note">'+(q?('Sin resultados para "'+escHtml(EV_LIST_SEARCH)+'".')
      :('No hay eventos'+(EV_TYPES_PAST?' futuros':'')+' de este tipo.'))+'</div>';
  }
  h+='<div class="ev-list-count">'+lista.length+' evento'+(lista.length>1?'s':'')+'</div>';
  if(EV_LIST_SORT==='categoria'){
    /* Agrupado por categoria, como estaba */
    var byType={};
    lista.forEach(function(ev){
      var t=getEvType(ev);
      (byType[t]=byType[t]||[]).push(ev);
    });
    typeOrder.forEach(function(type){
      var l=byType[type];
      if(!l||!l.length)return;
      l.sort(function(a,b){return a.start<b.start?-1:1;});
      h+='<div class="sy-section"><div class="bday-month-hdr">'+escHtml(type)+'</div>';
      l.forEach(function(ev){h+=renderEvListItem(ev);});
      h+='</div>';
    });
  } else {
    var desc=(EV_LIST_SORT==='fecha-desc');
    lista.sort(function(a,b){
      if(a.start===b.start)return 0;
      return (a.start<b.start?-1:1)*(desc?-1:1);
    });
    h+='<div class="sy-section">';
    lista.forEach(function(ev){h+=renderEvListItem(ev);});
    h+='</div>';
  }
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
      getEventsOn(ds,EV_NO_RUT).forEach(function(ev){
        /* Solo los "grandes" se agrupan en una caja continua; los puntuales
           caen como chip en cada dia que ocupan (v241) */
        if(isEvBarAlways(ev)&&ev.end&&ev.end!==ev.start){
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
      /* El titulo se pinta SIEMPRE: si el evento empezo en un mes anterior,
         antes salia la caja de color sin nombre y no se sabia de que era.
         En ese caso lleva flecha y la fecha real de inicio. */
      var _wtr=evTramos(ev);
      var _wtrHtml=_wtr.length
        ? '<div class="ev-wk-multi-trans">'+_wtr.map(function(tr){return evTramoTexto(tr);}).join(' \u00b7 ')+'</div>'
        : '';
      if(seg.isFirstSeg){
        h+='<div class="ev-wk-multi-title" style="color:'+_dc+'">'+_ic+_t+'</div>'+_wtrHtml;
      } else {
        var _sD=new Date(ev.start+'T00:00:00');
        var _desde=String(_sD.getDate()).padStart(2,'0')+'/'+String(_sD.getMonth()+1).padStart(2,'0');
        h+='<div class="ev-wk-multi-title ev-wk-multi-cont" style="color:'+_dc+'">'
          +'\u2191 '+_ic+_t+'<span class="ev-wk-multi-from">\u00b7 desde '+_desde+'</span></div>';
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
      h+='<div class="'+dCls+'" data-ds="'+ds+'" style="grid-row:'+d+'"'+(isToday?' id="ev-wk-today-row"':'')+'>';
      h+='<span class="ev-wk-dow">'+_wn[dow]+'</span><span class="ev-wk-num">'+d+'</span>';
      h+='</div>';

      var chips=evSortMarks(singleByDay[d]||[]);
      var hasMulti=multiSegs.some(function(s){return d>=s.sd&&d<=s.ed;});
      /* Si este día es el PRIMER día de un multi-día (donde se pinta el título), añadimos
         padding-top extra a los chips para que no se solapen con el texto del título. */
      var isFirstOfMulti=multiSegs.some(function(s){return s.isFirstSeg&&d===s.sd;});
      var eCls='ev-wk-chips'+(isToday?' ev-wk-today':'')+(isPast?' ev-wk-past':'')+(isWknd?' ev-wk-wknd':'')+(hasMulti?' ev-wk-chips-nested':'')+(isFirstOfMulti?' ev-wk-chips-first-of-multi':'');
      h+='<div class="'+eCls+'" data-ds="'+ds+'" style="grid-row:'+d+';grid-column:2">';
      chips.forEach(function(ev){
        var _dc=getEvDisplayColor(ev);
        var _isVip=ev.id.indexOf('ev-bday-vip-')===0;
        var _t=_isVip?escHtml(ev.title.replace(/^\u2b50\s*/,'').replace(/^Cumple\s+/,'')):escHtml(ev.title);
        var _ic=_isVip?'\u2b50 ':'';
        h+='<div class="ev-wk-chip" data-id="'+ev.id+'" style="border-left:3px solid '+_dc+';background:'+hexA(_dc,0.95)+'">';
        h+='<span class="ev-wk-chip-title">'+_ic+_t+'</span>';
        /* Hora del evento puntual, si la tiene */
        var _wt=(!ev._rut&&getEvType(ev)!=='Ensayos boda')?evTimeLabel(ev):'';
        if(_wt)h+='<span class="ev-wk-chip-meta">'+escHtml(_wt)+'</span>';
        /* Sesion de rutina: hora de inicio y fin junto al nombre */
        if(ev._rut&&ev._rutTime){
          h+='<span class="ev-wk-chip-meta">'+escHtml(ev._rutTime)
            +'–'+escHtml(rutFin(ev._rutTime,ev._rut.dur))
            +(ev._rutSkip?' · saltada':'')+'</span>';
        }
        /* Ensayos de boda: hora y sala junto al nombre */
        if(getEvType(ev)==='Ensayos boda'&&typeof bodaPlaceOf==='function'){
          var _b=ev.boda||{};
          var _pl=bodaPlaceOf(ev);
          h+='<span class="ev-wk-chip-meta">'+(_b.time||'--:--')
            +' \u00b7 '+escHtml(_pl?BODA_PLACE_SHORT[_pl]:'sin sala')+'</span>';
        }
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
  var _upActive=(EV_VIEW==='upcoming'||EV_VIEW==='months');
  h+='<button class="ev-view-toggle'+(_upActive?' active':'')+'" id="evViewUpcoming">Pr\u00f3ximos</button>';
  h+='<button class="ev-view-toggle ev-btn-rutinas'+(EV_VIEW==='rutinas'?' active':'')+'" id="evViewRutinas">Rutinas</button>';
  h+='</div>';
  // Zona B: Calendarios visuales (1 mes + Semanal)
  h+='<div class="ev-view-zone ev-zone-b">';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='cal'?' active':'')+'" id="evViewCal">Calendario<br>1 mes</button>';
  h+='<button class="ev-view-toggle ev-btn-week'+(EV_VIEW==='week'?' active':'')+'" id="evViewWeek">Agenda<br>Semanal</button>';
  h+='</div>';
  // Zona B: Calendarios visuales (4 meses + Anual)
  h+='<div class="ev-view-zone ev-zone-b">';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='quad'?' active':'')+'" id="evViewQuad">Calendario<br>4 meses</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='annual'?' active':'')+'" id="evViewAnnual">Calendario<br>Anual</button>';
  h+='</div>';
  // Zona C: Bodas + Vacaciones/Festivos (esta ultima agrupa Puentes y Vac/Festivos en subpestanas)
  h+='<div class="ev-view-zone ev-zone-c">';
  h+='<button class="ev-view-toggle ev-btn-bodas'+(EV_VIEW==='bodas'?' active':'')+'" id="evViewBodas">Bodas</button>';
  var _toActive=(EV_VIEW==='puentes'||EV_VIEW==='time-off');
  h+='<button class="ev-view-toggle ev-btn-timeoff ev-btn-split'+(_toActive?' active':'')+'" id="evViewTimeOff">Vacaciones<br>Festivos</button>';
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
    h+='<div class="sy-year-nav"><div class="sy-year">Próximos</div></div>';
  } else if(EV_VIEW==='rutinas'){
    h+='<div class="sy-year-nav"><div class="sy-year">Rutinas</div></div>';
  } else if(EV_VIEW==='bodas'){
    h+='<div class="sy-year-nav"><div class="sy-year">Bodas</div></div>';
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
    var _typeOrder=EV_FILTER_GROUPS;
    var _typeShort=EV_FILTER_SHORT;
    var _typeColor=EV_FILTER_COLOR;
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
      if(type===EV_FILTER_SEP_AFTER)h+='<span class="ev-filter-sep" aria-hidden="true"></span>';
    });
    h+='</div>';
    h+='</div>';
  }
  if(EV_VIEW==='upcoming'||EV_VIEW==='months'){
    /* Pestana "Proximos" con dos subpestanas: la agenda corta y la lista completa */
    h+='<div class="econ-sub-tabs">';
    h+='<button class="econ-sub-tab'+(EV_VIEW==='upcoming'?' active':'')+'" id="evSubUpcoming">Próximos</button>';
    h+='<button class="econ-sub-tab'+(EV_VIEW==='months'?' active':'')+'" id="evSubTodos">Todos</button>';
    h+='</div>';
    if(EV_VIEW==='upcoming'){
      h+='<div class="excl-row ev-up-filters">';
      h+='<label class="excl-item"><input type="checkbox" id="evUpShowRut"'+(EV_UP_SHOW_RUT?' checked':'')+'> Mostrar rutinas</label>';
      h+='<label class="excl-item"><input type="checkbox" id="evUpShowBoda"'+(EV_UP_SHOW_BODA?' checked':'')+'> Mostrar ensayos WM</label>';
      h+='</div>';
    }
  }
  if(EV_VIEW==='puentes'||EV_VIEW==='time-off'){
    /* Pestana unica "Vacaciones Festivos" con dos subpestanas */
    h+='<div class="econ-sub-tabs">';
    h+='<button class="econ-sub-tab'+(EV_VIEW==='puentes'?' active':'')+'" id="evSubPuentes">Puentes</button>';
    h+='<button class="econ-sub-tab'+(EV_VIEW==='time-off'?' active':'')+'" id="evSubTimeOff">Vacaciones y festivos</button>';
    h+='</div>';
  }
  if(EV_VIEW==='cal')h+=renderEvCalMonth();
  else if(EV_VIEW==='upcoming')h+=renderEvUpcoming();
  else if(EV_VIEW==='week')h+=renderEvWeek();
  else if(EV_VIEW==='annual')h+=renderEvAnnual();
  else if(EV_VIEW==='quad')h+=renderEvQuad();
  else if(EV_VIEW==='bodas')h+=renderBodasBody();
  else if(EV_VIEW==='rutinas')h+=renderRutinasBody();
  else if(EV_VIEW==='puentes')h+=renderSummaryPuentesBody(EV_YEAR);
  else if(EV_VIEW==='time-off')h+=renderSummaryTimeOffBody(EV_YEAR);
  else h+=renderEvMonthsView();
  if(EV_VIEW!=='puentes'&&EV_VIEW!=='time-off'&&EV_VIEW!=='bodas'&&EV_VIEW!=='rutinas'){
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
/* car = {ds,i,n} cuando la ficha se abre como parte del carrusel de un dia:
   entonces la cabecera lleva la fecha y el contador, y debajo van las flechas
   y los puntos para pasar de un evento a otro. Es la MISMA ficha, no otra. */
function renderEvDetail(ev,fromSummary,car){
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
  if(car){
    var _wn=['Dom','Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b'];
    var _cd=new Date(car.ds+'T00:00:00');
    h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'
      +_wn[_cd.getDay()]+' '+car.ds.slice(8)+'/'+car.ds.slice(5,7)+'</div>';
    h+='<div class="ev-car-count">'+(car.i+1)+' / '+car.n+'</div>';
  } else {
    h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">Evento</div>';
    h+='<div style="width:36px"></div>';
  }
  h+='</div>';
  if(car&&car.n>1){
    h+='<div class="ev-car-nav">';
    h+='<button class="ev-btn ev-car-arrow" id="evCarPrev">&#9664;</button>';
    h+='<div class="ev-car-dots">';
    for(var _ci=0;_ci<car.n;_ci++)h+='<span class="ev-car-dot'+(_ci===car.i?' on':'')+'"></span>';
    h+='</div>';
    h+='<button class="ev-btn ev-car-arrow" id="evCarNext">&#9654;</button>';
    h+='</div>';
  }
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
  var _dt=evTimeLabel(ev);
  if(_dt)h+='<div class="ev-detail-repeat">\ud83d\udd52 '+_dt+'</div>';
  evTramos(ev).forEach(function(tr){
    h+='<div class="ev-detail-repeat">'+evTramoTexto(tr)+'</div>';
  });
  if(repeatStr)h+='<div class="ev-detail-repeat">'+repeatStr+'</div>';
  if(ev.note)h+='<div class="ev-detail-note">'+escHtml(ev.note)+'</div>';
  /* Nota especifica del dia desde el que se abrio (puntuales de varios dias) */
  if(EV_EDIT_DS&&ev.dayNotes&&ev.dayNotes[EV_EDIT_DS]){
    h+='<div class="ev-detail-note ev-detail-daynote"><span class="ev-note-scope">'
      +EV_EDIT_DS.slice(8)+'/'+EV_EDIT_DS.slice(5,7)+'</span> '+escHtml(ev.dayNotes[EV_EDIT_DS])+'</div>';
  }
  /* Datos de la clase de boda */
  if(getEvType(ev)==='Ensayos boda'&&typeof bodaCouple==='function'){
    var _b=ev.boda||{};var _c=bodaCouple(_b.coupleId);
    h+='<div class="ev-detail-repeat">&#128141; '+(_c?escHtml(_c.name):'Sin pareja asignada')
      +' &#183; '+(_b.time?_b.time+' (1 h)':'sin hora')
      +' &#183; '+escHtml(BODA_PLACE_SHORT[_b.place||(_c&&_c.place)||'casa'])+'</div>';
  }
  h+='<div class="ev-detail-actions">';
  if(ev._rut){
    /* Sesion de rutina: no es un evento guardado, asi que ni se edita ni se
       borra desde aqui; lo que se hace es marcarla */
    h+='<button class="ev-btn primary" id="evDRutSes">'+(ev._rutSkip?'Marcar como hecha':'Marcar como saltada')+'</button>';
    h+='<button class="ev-btn ev-edit-orange" id="evDRutEdit">&#9998; Editar rutina</button>';
  } else if(ev.id.indexOf('ev-bday-vip-')===0){
    h+='<button class="ev-btn primary" id="evDBdayAlarm">&#128276; Alarma de cumplea'+'\u00f1'+'os</button>';
  } else {
    if(fromSummary)h+='<button class="ev-btn" id="evDGoCal" style="border-color:var(--c-blue);color:var(--c-blue)">&#128197; Ver en Calendario</button>';
    /* Mismo boton que en el panel de alarma de Proximos */
    h+='<button class="ev-btn ev-edit-orange" id="evDEdit">&#9998; Editar evento</button>';
    h+='<button class="ev-btn danger" id="evDDel">Eliminar</button>';
  }
  h+='</div>';
  h+='</div></div>';
  return h;
}

/* == Carrusel del dia ==================================================
   Se abre desde las estrellas VIP o desde el "+" de un dia con muchos
   eventos: muestra una ficha por evento y se pasa de una a otra deslizando
   o con las flechas. Desde cada ficha se salta a su panel de siempre. */
var EV_CAR = {ds:null, items:[], i:0};
function evDayCarItems(ds){
  var vips=[],ruts=[],punt=[],grandes=[];
  getEventsOn(ds).forEach(function(ev){
    if(ev.id.indexOf('ev-bday-vip-')===0){vips.push(ev);return;}
    if(ev._rut){ruts.push(ev);return;}
    if(typeof isEvBarAlways==='function'&&isEvBarAlways(ev)){grandes.push(ev);return;}
    punt.push(ev);
  });
  punt=evSortMarks(punt.map(function(e){return {ev:e};}),function(it){return it.ev;})
        .map(function(it){return it.ev;});
  return vips.concat(ruts,punt,grandes);
}
function evCarGo(step){
  var n=EV_CAR.items.length;
  if(n<2)return;
  EV_CAR.i=(EV_CAR.i+step+n)%n;
  _evCarShow();
}
/* Pinta el evento actual del carrusel EN LA MISMA ficha de detalle */
function _evCarShow(){
  var ev=EV_CAR.items[EV_CAR.i];
  if(!ev)return;
  EV_EDIT_DS=EV_CAR.ds;
  openEvDetail(ev,null,{ds:EV_CAR.ds,i:EV_CAR.i,n:EV_CAR.items.length});
  NAV_BACK=closeEvDayCarousel;
}
function openEvDayCarousel(ds,startId){
  var items=evDayCarItems(ds);
  if(!items.length)return;
  EV_CAR={ds:ds,items:items,i:0};
  for(var i=0;i<items.length;i++)if(items[i].id===startId){EV_CAR.i=i;break;}
  _evCarShow();
}
function closeEvDayCarousel(){
  EV_CAR={ds:null,items:[],i:0};
  closeEvDetail();
  NAV_BACK=null;
}
/* == Cierre de paneles ==================================================
   Los paneles se quitan del DOM 300 ms despues de cerrarse, cuando termina la
   animacion. Si en ese rato se abre otro, el temporizador del cierre anterior
   se llevaba por delante el panel NUEVO (mismo id). Por eso el temporizador se
   guarda y se cancela al abrir. */
var _EV_CLOSE_T = {};
function _evScheduleRemove(id,extra){
  clearTimeout(_EV_CLOSE_T[id]);
  _EV_CLOSE_T[id]=setTimeout(function(){
    var w=document.getElementById(id);if(w)w.remove();
    if(extra)extra();
  },300);
}
function _evCancelRemove(id){clearTimeout(_EV_CLOSE_T[id]);}
/* ── Apertura/cierre del detalle ────────────────────────── */
function openEvDetail(ev,container,car){
  var ov=container||document.getElementById('eventsOverlay');
  var fromSummary=(EV_VIEW==='puentes'||EV_VIEW==='time-off');
  ov.scrollTop=0;
  _evCancelRemove('evDWrap');
  var wrap=document.getElementById('evDWrap');
  /* Al deslizar dentro del carrusel se reaprovecha el panel abierto: si se
     quitara y se volviera a poner, la animacion de entrada saldria en cada
     evento y pareceria que se cierra y se abre otra ficha distinta. */
  var _reusa=!!(wrap&&car);
  if(!_reusa){
    if(wrap)wrap.remove();
    wrap=document.createElement('div');
    wrap.id='evDWrap';
    ov.appendChild(wrap);
  }
  wrap.innerHTML=renderEvDetail(ev,fromSummary,car);
  if(_reusa){
    var _fo2=document.getElementById('evDetailOv');
    if(_fo2){
      _fo2.classList.add('open');
      _fo2.addEventListener('click',function(e){if(e.target===_fo2)closeEvDetail();});
    }
  } else {
    requestAnimationFrame(function(){
      var fo=document.getElementById('evDetailOv');
      if(fo){
        fo.classList.add('open');
        fo.addEventListener('click',function(e){if(e.target===fo)closeEvDetail();});
      }
    });
  }
  document.getElementById('evDClose').addEventListener('click',car?closeEvDayCarousel:closeEvDetail);
  /* Flechas, puntos y deslizamiento del carrusel */
  if(car){
    var _p=document.getElementById('evCarPrev');
    if(_p)_p.addEventListener('click',function(){evCarGo(-1);});
    var _n=document.getElementById('evCarNext');
    if(_n)_n.addEventListener('click',function(){evCarGo(1);});
    if(typeof addSwipe==='function'){
      var _sheet=document.querySelector('#evDetailOv .ev-detail-sheet');
      addSwipe(_sheet,function(){evCarGo(1);},function(){evCarGo(-1);});
    }
  }
  /* Acciones propias de una sesion de rutina */
  var _rs=document.getElementById('evDRutSes');
  if(_rs)_rs.addEventListener('click',function(){
    if(typeof rutToggleSkip==='function')rutToggleSkip(ev._rut,(car&&car.ds)||ev.start);
    closeEvDetail();
    setTimeout(refreshEvents,320);
  });
  var _re=document.getElementById('evDRutEdit');
  if(_re)_re.addEventListener('click',function(){
    closeEvDetail();
    setTimeout(function(){if(typeof openRutForm==='function')openRutForm(ev._rut);},310);
  });
  var _ba=document.getElementById('evDBdayAlarm');
  if(_ba)_ba.addEventListener('click',function(){
    closeEvDetail();
    setTimeout(function(){
      if(typeof openBdayAlarmFromEvents==='function')openBdayAlarmFromEvents(ev);
    },310);
  });
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
  var _dEdit=document.getElementById('evDEdit');
  if(_dEdit)_dEdit.addEventListener('click',function(){
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
      _switchEvView('cal');EV_YEAR=evYear;EV_MONTH=evMonth;
      EV_VIEW_STATE.cal={year:evYear,month:evMonth};
      refreshEvents();
    });
  }
  var _dDel=document.getElementById('evDDel');
  if(_dDel)_dDel.addEventListener('click',function(){
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
  _evScheduleRemove('evDWrap');
}

/* Dias que ocupa un evento puntual (para las notas por dia y el conteo) */
function evPuntualDays(ev){
  if(!ev)return [];
  if(ev.dates&&ev.dates.length)return ev.dates.slice();
  var out=[],s0=new Date(ev.start+'T00:00:00'),e0=new Date((ev.end||ev.start)+'T00:00:00'),g=0;
  for(var d=new Date(s0);d<=e0&&g<400;d.setDate(d.getDate()+1),g++)out.push(evDk(d));
  return out;
}
/* Swatches de categoria de la clase indicada */
function _renderEvTypeSwatches(kind,selType){
  var h='';
  EV_KINDS[kind].types.forEach(function(t){
    var key=evTypeKey(kind,t);
    var c=evTypeColor(kind,t);
    /* Multicolor = "elige tu color"; Casa Rural muestra su marron aunque
       tambien tenga paleta (EV_DOT_SOLID) */
    var isMulti=!!EV_FREE_COLOR[key]&&!EV_DOT_SOLID[key];
    var sel=(t===selType)?' selected':'';
    h+='<div class="ev-color-swatch'+sel+(isMulti?' ev-color-swatch-multi':'')+'" data-hex="'+c+'" data-type="'+escHtml(t)+'" data-kind="'+kind+'"'+(isMulti?'':' style="color:'+c+'"')+'>';
    h+=isMulti?'<div class="ev-type-dot ev-type-dot-multi"></div>':'<div class="ev-type-dot" style="background:'+c+'"></div>';
    h+='<span class="ev-type-name">'+escHtml(t)+'</span></div>';
  });
  return h;
}


/* == Horas de un evento y transporte de ida/vuelta ======================
   - Puntual (menos las clases de boda, que tienen su propia hora en
     ev.boda.time): ev.time y ev.endTime, las dos opcionales; el fin solo se
     puede poner si hay inicio.
   - Grande: ev.viaje = {ida:{time,modo,conductor}, vuelta:{...}}, cada tramo
     opcional. La hora es la de SALIDA, que es de lo que uno quiere avisarse.
   Las rutinas y las clases de boda mantienen su hora donde estaba; estas
   funciones leen de donde corresponda para que el resto del codigo no tenga
   que saberlo. */
var EV_TRANSPORTES = [
  {k:'tren',  l:'Tren',    e:'\ud83d\ude86'},
  {k:'bus',   l:'Autobús', e:'\ud83d\ude8c'},
  {k:'coche', l:'Coche',   e:'\ud83d\ude97'},
  {k:'avion', l:'Avión',   e:'\u2708'}
];
var EV_TRANS_LBL = (function(){var o={};EV_TRANSPORTES.forEach(function(t){o[t.k]=t.l;});return o;})();
var EV_TRANS_EMOJI = (function(){var o={};EV_TRANSPORTES.forEach(function(t){o[t.k]=t.e;});return o;})();
/* Hora de inicio de un evento, venga de donde venga */
function evStartTime(ev){
  if(!ev)return null;
  if(ev._rutTime)return ev._rutTime;
  if(getEvType(ev)==='Ensayos boda')return (ev.boda&&ev.boda.time)||null;
  return ev.time||null;
}
function evEndTime(ev){
  if(!ev)return null;
  if(ev._rut)return (typeof rutFin==='function')?rutFin(ev._rutTime,ev._rut.dur):null;
  if(getEvType(ev)==='Ensayos boda')return null;   /* duran 1 h fija */
  return (ev.time&&ev.endTime)?ev.endTime:null;
}
/* Texto corto "09:30 – 11:00" para las tarjetas */
function evTimeLabel(ev){
  var t=evStartTime(ev);
  if(!t)return '';
  var f=evEndTime(ev);
  return t+(f?('\u2013'+f):'');
}
/* Tramos de transporte de un evento grande, ya normalizados */
function evTramos(ev){
  var out=[];
  if(!ev||!ev.viaje)return out;
  if(ev.viaje.ida&&ev.viaje.ida.time)
    out.push({k:'ida',lbl:'Ida',t:ev.viaje.ida,ds:ev.start});
  if(ev.viaje.vuelta&&ev.viaje.vuelta.time)
    out.push({k:'vuelta',lbl:'Vuelta',t:ev.viaje.vuelta,ds:ev.end||ev.start});
  return out;
}
function evTramoTexto(tr){
  var m=tr.t.modo?EV_TRANS_EMOJI[tr.t.modo]:'';
  var s=tr.lbl+' \u00b7 '+(m?m+' ':'')+tr.t.time;
  if(tr.t.modo==='coche'&&tr.t.conductor)s+=' ('+escHtml(tr.t.conductor)+')';
  return s;
}
/* Minutos desde medianoche de una hora HH:MM */
function evMinutosDe(hhmm){
  if(!hhmm)return null;
  var p=String(hhmm).split(':');
  var h=parseInt(p[0],10),m=parseInt(p[1],10);
  if(isNaN(h)||isNaN(m))return null;
  return h*60+m;
}

/* ── Render: formulario de evento ───────────────────────── */
function renderEvForm(ev){
  var isEdit=!!ev;
  var title=isEdit?ev.title:'';
  var note=isEdit?(ev.note||''):'';
  var color=isEdit?ev.color:evTypeColor('puntual','Rec. Gestiones');
  var today=evDk(new Date());
  var start=isEdit?ev.start:today;
  var end=isEdit?(ev.end||ev.start):today;
  var repeat=isEdit?ev.repeat:null;
  var repType=repeat?repeat.type:'none';
  var wdays=(repeat&&repeat.type==='weekly')?repeat.weekDays:[];
  var wdNames=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  /* Tipo actual: SIEMPRE el tipo guardado del evento (getEvType ya hace el
     fallback por color para eventos antiguos sin ev.type). Antes la selección
     del picker se decidía por color y un evento con color personalizado no
     casaba con ningún swatch → al guardar caía en EV_COLORS[0] = Viaje. */
  /* Clase y categoria actuales (v241). getEvKind/getEvType hacen el fallback
     para eventos anteriores, que no tenian ni kind ni type. */
  var curKind=isEdit?getEvKind(ev):'puntual';
  var curType=isEdit?getEvType(ev):'Rec. Gestiones';
  if(curType==='Cumplea\u00f1os VIP'){curKind='puntual';curType='Otros';}
  if(EV_KINDS[curKind].types.indexOf(curType)===-1)curType=EV_KINDS[curKind].types[0];
  var curKey=evTypeKey(curKind,curType);
  /* Nota especifica del dia: solo si es puntual, ocupa varios dias y se ha
     entrado desde un dia concreto del calendario */
  var _dayList=evPuntualDays(ev);
  var showDayNote=isEdit&&curKind==='puntual'&&EV_EDIT_DS&&_dayList.length>1&&_dayList.indexOf(EV_EDIT_DS)!==-1;
  var dayNote=showDayNote?((ev.dayNotes&&ev.dayNotes[EV_EDIT_DS])||''):'';
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
  /* Nota general (todos los dias del evento) */
  h+='<div class="ev-field"><label>'+(showDayNote?'Nota general <span class="ev-note-scope">(todos los d\u00edas)</span> ':'Nota ')
    +'<span id="evCharCnt" style="font-weight:400;color:var(--text-dim)">'+note.length+'/200</span></label>';
  h+='<textarea class="ev-textarea" id="evFNote" maxlength="200" placeholder="Notas opcionales...">'+escHtml(note)+'</textarea></div>';
  /* Nota especifica de ESTE dia */
  if(showDayNote){
    h+='<div class="ev-field ev-daynote-field"><label>Nota de este d\u00eda <span class="ev-note-scope">('+EV_EDIT_DS.slice(8)+'/'+EV_EDIT_DS.slice(5,7)+')</span> '
      +'<span id="evDayCnt" style="font-weight:400;color:var(--text-dim)">'+dayNote.length+'/200</span></label>';
    h+='<textarea class="ev-textarea" id="evFDayNote" maxlength="200" placeholder="Solo para este d\u00eda...">'+escHtml(dayNote)+'</textarea></div>';
  }
  /* Selector de clase + categoria */
  h+='<div class="ev-field"><label>Clase de evento</label>';
  h+='<div class="ev-kind-picker" data-cur-kind="'+curKind+'" data-cur-type="'+escHtml(curType)+'">';
  ['puntual','grande'].forEach(function(k){
    h+='<button type="button" class="ev-kind-btn'+(k===curKind?' selected':'')+'" data-kind="'+k+'">'
      +(k==='puntual'?'\u2726 Puntual':'\u25ac Grande')
      +'<span>'+(k==='puntual'?'un marcador por d\u00eda':'barra de varios d\u00edas')+'</span></button>';
  });
  h+='</div></div>';
  h+='<div class="ev-field"><label>Categor\u00eda</label><div class="ev-type-picker" id="evFTypePicker">';
  h+=_renderEvTypeSwatches(curKind,curType);
  h+='</div></div>';
  /* Color picker section: visible para Viaje y Otros */
  var isOtros=!!EV_FREE_SHAPE[curKey];
  var showColorPicker=!!EV_FREE_COLOR[curKey];
  h+='<div class="ev-field ev-form-color-section" id="evFColorSection" style="display:'+(showColorPicker?'block':'none')+'">';
  h+='<label>\uD83C\uDFA8 Paleta de colores</label>';
  h+=_renderColorPicker(color,false,false,'evFCp');
  h+='</div>';
  /* Secci\u00f3n extra para Otros: forma del marcador + selector multi-d\u00eda */
  var curShape=isEdit&&ev.shape?ev.shape:'circle';
  var curDates=isEdit&&Array.isArray(ev.dates)?ev.dates.slice():[];
  var showDates=!!EV_FREE_DATES[curKey];
  var _extras=(isOtros||showDates||!!EV_FREE_BARSIZE[curKey]);
  h+='<div class="ev-field ev-otros-extras" id="evFOtrosExtras" style="display:'+(_extras?'block':'none')+'">';
  h+='<div id="evFShapeBlock" style="display:'+(isOtros?'block':'none')+'">';
  h+='<label>\u25B8 Forma del marcador</label>';
  h+='<div class="ev-shape-picker" id="evFShapePicker">';
  var _shapes=[
    {k:'circle',  label:'C\u00edrculo'},
    {k:'square',  label:'Cuadrado'},
    {k:'diamond', label:'Rombo'},
    {k:'x-thick', label:'X gorda'},
    {k:'x-thin',  label:'X fina'},
    {k:'rounded', label:'Redondeado'},
    /* Las mismas siluetas que usan las rutinas */
    {k:'gym',     label:'Mancuerna'},
    {k:'padel',   label:'Pala'},
    {k:'baile',   label:'Bailar\u00edn'}
  ];
  _shapes.forEach(function(s){
    var sel=(s.k===curShape)?' selected':'';
    var prevColor=color||EV_COLORS[0];
    h+='<button type="button" class="ev-shape-opt'+sel+'" data-shape="'+s.k+'" title="'+s.label+'" aria-label="'+s.label+'">';
    /* Todas las formas: mismo SVG que en los calendarios → mismo grosor de borde */
    h+='<span class="ev-shape-preview ev-shape-'+s.k+'" style="color:'+prevColor+'">'+evShapeSvg(s.k)+'</span>';
    h+='</button>';
  });
  h+='</div></div>';
  /* Grosor de la barra (solo eventos grandes "Otros") */
  var showBar=!!EV_FREE_BARSIZE[curKey];
  var curBar=evBarSize(isEdit?ev:{kind:curKind,type:curType,barSize:null});
  h+='<div id="evFBarBlock" style="display:'+(showBar?'block':'none')+'">';
  h+='<label>▬ Grosor de la barra</label>';
  h+='<div class="ev-barsize-picker" id="evFBarPicker">';
  EV_BAR_SIZES.forEach(function(b){
    h+='<button type="button" class="ev-barsize-opt'+(b.k===curBar?' selected':'')+'" data-bar="'+b.k+'">'
      +'<span class="ev-barsize-demo ev-bar-'+b.k+'"></span>'
      +'<span class="ev-barsize-lbl">'+b.label+'</span></button>';
  });
  h+='</div></div>';
  h+='<div id="evFDatesBlock" style="display:'+(showDates?'block':'none')+';margin-top:12px">';
  h+='<label>\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda</label>';
  h+='<button type="button" class="ev-btn" id="evFPickDates" style="width:100%;margin-top:4px;font-size:.78rem;padding:8px 10px">';
  h+='<span id="evFPickDatesLbl">'+(curDates.length>1?(curDates.length+' d\u00edas seleccionados \u2014 pulsa para editar'):'\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda\u2026')+'</span>';
  h+='</button>';
  h+='<div style="font-size:.62rem;color:var(--text-dim);margin-top:4px;line-height:1.4">'
    +(curType==='Ensayos boda'
      ? 'Marca todos los d\u00edas con clase: se crear\u00e1 <b>una clase por d\u00eda</b>, sin hora ni pareja. Luego las asignas desde la pesta\u00f1a <b>Bodas</b>.'
      : 'Si seleccionas <b>m\u00e1s de un d\u00eda</b>, el evento aparecer\u00e1 en cada uno de esos d\u00edas e ignorar\u00e1 las fechas de inicio/fin de abajo.')
    +'</div>';
  h+='</div>';
  h+='</div>';
  /* Inicio/Fin: deshabilitados si hay multid\u00eda activo */
  var _multiActive=curDates.length>1;
  h+='<div class="ev-field ev-date-row'+(_multiActive?' ev-dates-locked':'')+'" id="evFDateRow">';
  h+='<div><label>Inicio</label><input class="ev-input" id="evFStart" type="date" value="'+start+'"'+(_multiActive?' disabled':'')+'></div>';
  h+='<div><label>Fin</label><input class="ev-input" id="evFEnd" type="date" value="'+end+'"'+(_multiActive?' disabled':'')+'></div>';
  h+='<div class="ev-dates-locked-note" id="evFDatesLockedNote" style="display:'+(_multiActive?'block':'none')+'">Estas fechas se ignoran porque hay <b>Selecci\u00f3n Multid\u00eda</b> activa.</div>';
  h+='</div>';
  /* ── Horas del evento ────────────────────────────────────────────
     Puntual: hora de inicio y fin (el fin solo se activa con inicio puesto).
     Las clases de boda no la llevan aqui: tienen la suya en la pestana Bodas.
     Grande: hora de salida de ida y de vuelta, con medio de transporte. */
  var _esBoda=(curType==='Ensayos boda');
  var _horaIni=(isEdit&&ev.time)?ev.time:'';
  var _horaFin=(isEdit&&ev.endTime)?ev.endTime:'';
  h+='<div class="ev-field ev-date-row ev-hora-row" id="evFHoraRow"'
    +((curKind==='puntual'&&!_esBoda)?'':' style="display:none"')+'>';
  h+='<div><label>Hora inicio <span class="ev-note-scope">(opcional)</span></label>'
    +'<input class="ev-input" id="evFTime" type="time" step="300" value="'+_horaIni+'"></div>';
  h+='<div><label>Hora fin</label>'
    +'<input class="ev-input" id="evFEndTime" type="time" step="300" value="'+_horaFin+'"'
    +(_horaIni?'':' disabled')+'></div>';
  h+='</div>';
  var _vj=(isEdit&&ev.viaje)?ev.viaje:{};
  h+='<div class="ev-field ev-viaje-box" id="evFViajeBox" style="display:'
    +(curKind==='grande'?'block':'none')+'">';
  h+='<label>\ud83d\ude86 Ida y vuelta <span class="ev-note-scope">(opcional)</span></label>';
  [['ida','Ida'],['vuelta','Vuelta']].forEach(function(tr){
    var d=_vj[tr[0]]||{};
    var on=!!d.time;
    h+='<div class="ev-viaje-tramo'+(on?' on':'')+'" data-tramo="'+tr[0]+'">';
    h+='<label class="excl-item ev-viaje-hd"><input type="checkbox" class="ev-viaje-chk" data-tramo="'
      +tr[0]+'"'+(on?' checked':'')+'> <b>'+tr[1]+'</b></label>';
    h+='<div class="ev-viaje-campos" style="display:'+(on?'flex':'none')+'">';
    h+='<input class="ev-input ev-viaje-time" data-tramo="'+tr[0]+'" type="time" step="300" value="'+(d.time||'')+'">';
    h+='<select class="ev-input ev-viaje-modo" data-tramo="'+tr[0]+'">';
    EV_TRANSPORTES.forEach(function(m){
      h+='<option value="'+m.k+'"'+((d.modo||'tren')===m.k?' selected':'')+'>'+m.e+' '+m.l+'</option>';
    });
    h+='</select>';
    h+='</div>';
    h+='<input class="ev-input ev-viaje-cond" data-tramo="'+tr[0]+'" type="text" maxlength="30" placeholder="Quien conduce" value="'
      +escHtml(d.conductor||'')+'" style="display:'+((on&&d.modo==='coche')?'block':'none')+'">';
    h+='</div>';
  });
  h+='<div class="ev-viaje-note">La hora es la de <b>salida</b>: desde Pr\u00f3ximos podr\u00e1s crear una alarma para cada trayecto.</div>';
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
  if(!ev)EV_EDIT_DS=null;   /* las notas por dia solo aplican al editar */
  EV_FORM_CONTAINER=container||null;
  var ov=container||document.getElementById('eventsOverlay');
  ov.scrollTop=0;
  /* Si quedaba un formulario anterior a medio cerrar, quitarlo: si no,
     bindEvFormEvents() engancharia sus listeners al form viejo (mismos ids)
     y una sola pulsacion de Guardar dispararia dos veces. */
  var _oldW=document.getElementById('evFWrap');
  if(_oldW)_oldW.remove();
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
    EV_EDIT_DS=null;
    EV_FORM_CONTAINER=null;
  },300);
}

function bindEvFormEvents(){
  document.getElementById('evFClose').addEventListener('click',closeEvForm);
  var noteEl=document.getElementById('evFNote');
  var cntEl=document.getElementById('evCharCnt');
  noteEl.addEventListener('input',function(){cntEl.textContent=noteEl.value.length+'/200';});
  var dayNoteEl=document.getElementById('evFDayNote'),dayCntEl=document.getElementById('evDayCnt');
  if(dayNoteEl&&dayCntEl)dayNoteEl.addEventListener('input',function(){dayCntEl.textContent=dayNoteEl.value.length+'/200';});
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
    /* Los SVG de las formas usan currentColor → basta con cambiar el color del span */
    document.querySelectorAll('#evFShapePicker .ev-shape-preview').forEach(function(p){p.style.color=col;});
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
  /* Selector de CLASE (puntual / grande): re-pinta las categorias */
  var _kindPicker=document.querySelector('.ev-kind-picker');
  function _curKind(){return (_kindPicker&&_kindPicker.dataset.curKind)||'puntual';}
  function _applyTypeUI(kind,typeName){
    var key=evTypeKey(kind,typeName);
    if(_kindPicker){_kindPicker.dataset.curKind=kind;_kindPicker.dataset.curType=typeName;}
    if(_colorSection)_colorSection.style.display=EV_FREE_COLOR[key]?'block':'none';
    var _shp=!!EV_FREE_SHAPE[key],_dts=!!EV_FREE_DATES[key],_bar=!!EV_FREE_BARSIZE[key];
    if(_otrosExtras)_otrosExtras.style.display=(_shp||_dts||_bar)?'block':'none';
    var _bb=document.getElementById('evFBarBlock');
    if(_bb)_bb.style.display=_bar?'block':'none';
    var _sb=document.getElementById('evFShapeBlock');
    if(_sb)_sb.style.display=_shp?'block':'none';
    var _db=document.getElementById('evFDatesBlock');
    if(_db)_db.style.display=_dts?'block':'none';
    /* Horas: los puntuales llevan inicio/fin y los grandes ida/vuelta.
       Las clases de boda no: su hora vive en la pestana Bodas. */
    var _hr=document.getElementById('evFHoraRow');
    if(_hr)_hr.style.display=(kind==='puntual'&&typeName!=='Ensayos boda')?'':'none';
    var _vb=document.getElementById('evFViajeBox');
    if(_vb)_vb.style.display=(kind==='grande')?'block':'none';
  }
  function _bindTypeSwatches(){
    document.querySelectorAll('#evFTypePicker .ev-color-swatch').forEach(function(sw){
      sw.addEventListener('click',function(){
        document.querySelectorAll('#evFTypePicker .ev-color-swatch').forEach(function(x){x.classList.remove('selected');});
        sw.classList.add('selected');
        _selectedTypeHex=sw.dataset.hex;
        var typeName=sw.dataset.type||'Otros';
        _applyTypeUI(sw.dataset.kind||_curKind(),typeName);
        /* Al cambiar de categoria, la paleta arranca en el color propio de esa
           categoria (asi "Casa Rural" sale marron por defecto). */
        var _k2=evTypeKey(sw.dataset.kind||_curKind(),typeName);
        if(EV_FREE_COLOR[_k2]&&_fCp&&_fCp.setColor)_fCp.setColor(evTypeColor(sw.dataset.kind||_curKind(),typeName));
        var titleEl=document.getElementById('evFTitle');
        if(titleEl&&!titleEl.value.trim()){
          if(typeName==='Asturias'){
            titleEl.value='Asturias';
            var noteEl2=document.getElementById('evFNote');
            if(noteEl2&&!noteEl2.value.trim()){noteEl2.value='Asturias';cntEl.textContent='8/200';}
          } else if(typeName==='Ensayos boda'){titleEl.value='Ensayo boda';}
          else if(typeName==='Casa Rural'){titleEl.value='Casa rural';}
        }
      });
    });
  }
  _bindTypeSwatches();
  document.querySelectorAll('.ev-kind-btn[data-kind]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.dataset.kind;
      document.querySelectorAll('.ev-kind-btn').forEach(function(x){x.classList.remove('selected');});
      b.classList.add('selected');
      /* Al cambiar de clase se conserva la categoria si existe en la nueva
         (el caso de "Otros"); si no, la primera de la lista */
      var prev=(_kindPicker&&_kindPicker.dataset.curType)||'';
      var t=EV_KINDS[kind].types.indexOf(prev)!==-1?prev:EV_KINDS[kind].types[0];
      var tp=document.getElementById('evFTypePicker');
      if(tp)tp.innerHTML=_renderEvTypeSwatches(kind,t);
      _bindTypeSwatches();
      _applyTypeUI(kind,t);
    });
  });
  /* Selector de grosor de barra (grande|Otros) */
  var _barSize=(EV_EDIT&&EV_EDIT.barSize)?EV_EDIT.barSize:null;
  document.querySelectorAll('#evFBarPicker .ev-barsize-opt').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('#evFBarPicker .ev-barsize-opt').forEach(function(x){x.classList.remove('selected');});
      b.classList.add('selected');
      _barSize=b.dataset.bar;
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
  /* La hora de fin solo tiene sentido con hora de inicio */
  var _tIni=document.getElementById('evFTime'),_tFin=document.getElementById('evFEndTime');
  if(_tIni&&_tFin){
    _tIni.addEventListener('input',function(){
      _tFin.disabled=!_tIni.value;
      if(!_tIni.value)_tFin.value='';
    });
  }
  /* Transporte: cada tramo se activa con su casilla; el conductor solo aparece
     cuando el medio es el coche */
  function _viajeSync(tramo){
    var box=document.querySelector('.ev-viaje-tramo[data-tramo="'+tramo+'"]');
    if(!box)return;
    var chk=box.querySelector('.ev-viaje-chk');
    var campos=box.querySelector('.ev-viaje-campos');
    var modo=box.querySelector('.ev-viaje-modo');
    var cond=box.querySelector('.ev-viaje-cond');
    var on=chk&&chk.checked;
    box.classList.toggle('on',!!on);
    if(campos)campos.style.display=on?'flex':'none';
    if(cond)cond.style.display=(on&&modo&&modo.value==='coche')?'block':'none';
  }
  document.querySelectorAll('.ev-viaje-chk').forEach(function(c){
    c.addEventListener('change',function(){
      var box=c.closest('.ev-viaje-tramo');
      if(c.checked){
        var t=box.querySelector('.ev-viaje-time');
        if(t&&!t.value)t.value='09:00';
      }
      _viajeSync(c.dataset.tramo);
    });
  });
  document.querySelectorAll('.ev-viaje-modo').forEach(function(m){
    m.addEventListener('change',function(){_viajeSync(m.dataset.tramo);});
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
    /* Clase + categoria: del swatch seleccionado; si no hubiera ninguno se
       conserva lo que traia el formulario (nunca cae a Viaje) */
    var typeSel=document.querySelector('#evFTypePicker .ev-color-swatch.selected');
    var _kp=document.querySelector('.ev-kind-picker');
    var kindLabel=(typeSel&&typeSel.dataset.kind)||(_kp&&_kp.dataset.curKind)||'puntual';
    var typeLabel=(typeSel&&typeSel.dataset.type)||(_kp&&_kp.dataset.curType)||'Otros';
    var typeKey=evTypeKey(kindLabel,typeLabel);
    /* Color: libre (paleta) en las categorias marcadas; fijo en el resto */
    var color=EV_FREE_COLOR[typeKey]?_fCp.getColor():evTypeColor(kindLabel,typeLabel);
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
    /* dates[] y forma personalizada: solo donde aplica */
    var _saveDates=null,_saveShape=null;
    if(EV_FREE_DATES[typeKey]&&typeof _otrosDates!=='undefined'&&_otrosDates&&_otrosDates.length>1)_saveDates=_otrosDates.slice().sort();
    if(EV_FREE_SHAPE[typeKey]&&typeof _otrosShape!=='undefined'&&_otrosShape)_saveShape=_otrosShape;
    /* Ensayos boda: cada dia marcado es una CLASE independiente (sin hora ni
       pareja). Se asignan luego desde la pestana Bodas. */
    /* Ensayos boda: CADA DIA es una clase independiente (tiene su hora, su
       pareja y su lugar). Si el evento abarca varios dias hay que partirlo en
       N clases — tambien al EDITAR, que antes se saltaba este paso y dejaba un
       unico evento con dates[] que la pestana Bodas contaba como una sola. */
    if(typeLabel==='Ensayos boda'){
      var _dias=_saveDates?_saveDates.slice():[start];
      if(!_saveDates&&end>start){
        _dias=[];
        var _d0=new Date(start+'T00:00:00'),_d1=new Date(end+'T00:00:00'),_g=0;
        for(var _dd=new Date(_d0);_dd<=_d1&&_g<400;_dd.setDate(_dd.getDate()+1),_g++)_dias.push(evDk(_dd));
      }
      if(_dias.length>1){
        var _prevEv=EV_EDIT?JSON.parse(JSON.stringify(EV_EDIT)):null;
        if(EV_EDIT)EVENTS=EVENTS.filter(function(e){return e.id!==EV_EDIT.id;});
        var _n=typeof bodaBulkCreate==='function'?bodaBulkCreate(_dias):0;
        updateEventsBtn();closeEvForm();
        setTimeout(function(){refreshEvents();},320);
        showToast(_n===1?'1 clase creada':(_n+' clases creadas \u2014 as\u00edgnalas en la pesta\u00f1a Bodas'),
          _n?'success':'error',
          _prevEv?function(){
            EVENTS=EVENTS.filter(function(e){return !(getEvType(e)==='Ensayos boda'&&_dias.indexOf(e.start)!==-1&&!(e.boda&&e.boda.coupleId));});
            EVENTS.push(_prevEv);saveEvents();updateEventsBtn();refreshEvents();
          }:null);
        return;
      }
    }
    var _newEv={id:EV_EDIT?EV_EDIT.id:('ev-'+Date.now()),title:title,note:note,color:color,
      kind:kindLabel,type:typeLabel,start:start,end:end,repeat:repeat};
    if(_saveDates)_newEv.dates=_saveDates;
    if(_saveShape)_newEv.shape=_saveShape;
    /* Horas del evento */
    if(kindLabel==='puntual'&&typeLabel!=='Ensayos boda'){
      var _ti=document.getElementById('evFTime'),_tf=document.getElementById('evFEndTime');
      var _tiv=_ti?_ti.value:'';
      if(_tiv){
        _newEv.time=_tiv;
        var _tfv=_tf?_tf.value:'';
        if(_tfv&&_tfv>_tiv)_newEv.endTime=_tfv;
      }
    }
    if(kindLabel==='grande'){
      var _viaje={};
      ['ida','vuelta'].forEach(function(tr){
        var box=document.querySelector('.ev-viaje-tramo[data-tramo="'+tr+'"]');
        if(!box)return;
        var chk=box.querySelector('.ev-viaje-chk');
        if(!chk||!chk.checked)return;
        var tv=box.querySelector('.ev-viaje-time');
        if(!tv||!tv.value)return;
        var modo=box.querySelector('.ev-viaje-modo');
        var cond=box.querySelector('.ev-viaje-cond');
        var d={time:tv.value,modo:modo?modo.value:'tren'};
        if(d.modo==='coche'&&cond&&cond.value.trim())d.conductor=cond.value.trim();
        _viaje[tr]=d;
      });
      if(_viaje.ida||_viaje.vuelta)_newEv.viaje=_viaje;
    }
    /* Una clase de boda de un solo dia siempre lleva su bloque boda */
    if(typeLabel==='Ensayos boda'){
      delete _newEv.dates;
      _newEv.boda=(EV_EDIT&&EV_EDIT.boda)?EV_EDIT.boda
        :{coupleId:null,time:null,place:(typeof BODA_PLACE_DEFAULT!=='undefined')?BODA_PLACE_DEFAULT:'casa'};
    }
    if(EV_FREE_BARSIZE[typeKey]){
      var _bsel=document.querySelector('#evFBarPicker .ev-barsize-opt.selected');
      var _bs=_bsel?_bsel.dataset.bar:(typeof _barSize!=='undefined'&&_barSize);
      if(_bs)_newEv.barSize=_bs;
    }
    /* Notas por dia: se conservan las que ya hubiera y se actualiza la del dia
       desde el que se entro (vacia = se borra esa entrada) */
    if(EV_EDIT&&EV_EDIT.dayNotes)_newEv.dayNotes=JSON.parse(JSON.stringify(EV_EDIT.dayNotes));
    var _dnEl=document.getElementById('evFDayNote');
    if(_dnEl&&EV_EDIT_DS){
      var _dnVal=_dnEl.value.trim();
      if(_dnVal){_newEv.dayNotes=_newEv.dayNotes||{};_newEv.dayNotes[EV_EDIT_DS]=_dnVal;}
      else if(_newEv.dayNotes)delete _newEv.dayNotes[EV_EDIT_DS];
    }
    if(EV_EDIT&&EV_EDIT.boda)_newEv.boda=EV_EDIT.boda;
    var _full=evDayLimitExceeded(_newEv,EV_EDIT?EV_EDIT.id:null);
    if(_full){showToast('El '+_fmtDayEs(_full)+' ya tiene '+EV_MAX_DAY_EVENTS+' eventos (m\u00e1ximo)','error');return;}
    if(EV_EDIT){
      var idx=-1;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===EV_EDIT.id){idx=i;break;}}
      if(idx!==-1)EVENTS[idx]=_newEv;
      /* Deshacer: restaura el evento tal y como estaba antes de editarlo */
      var _prev=JSON.parse(JSON.stringify(EV_EDIT));
      showToast('Evento actualizado','success',function(){
        for(var j=0;j<EVENTS.length;j++){if(EVENTS[j].id===_prev.id){EVENTS[j]=_prev;break;}}
        saveEvents();updateEventsBtn();refreshEvents();
      });
    }else{
      EVENTS.push(_newEv);
      var _newId=_newEv.id;
      showToast('Evento creado','success',function(){
        EVENTS=EVENTS.filter(function(e){return e.id!==_newId;});
        saveEvents();updateEventsBtn();refreshEvents();
      });
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
  var _ac=getEvDisplayColor(ev);
  h+='<div class="bd-alarm-info" style="border-color:'+_ac+'44;background:'+_ac+'11">';
  h+='<div class="bd-alarm-name" style="color:'+_ac+'">'+escHtml(ev.title)+'</div>';
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
  /* Atajos "1 h antes" / "30 min antes". Sirven para cualquier evento con
     hora: clases de boda, puntuales con hora de inicio y, en los eventos
     grandes, para CADA trayecto (ida y vuelta) por separado. Se pueden marcar
     varios y se crea una alarma por cada uno. */
  var _bloques=[];
  var _tramos=evTramos(ev);
  if(_tramos.length){
    var _hoyDs=evDk(new Date());
    _tramos.forEach(function(tr){
      /* Si el viaje ya ha empezado, la ida no tiene sentido */
      if(tr.k==='ida'&&tr.ds<_hoyDs)return;
      _bloques.push({titulo:evTramoTexto(tr),min:evMinutosDe(tr.t.time),ds:tr.ds,suf:tr.lbl.toLowerCase()});
    });
  } else {
    var _t0=evStartTime(ev);
    if(_t0){
      var _esClase=(getEvType(ev)==='Ensayos boda');
      _bloques.push({titulo:(_esClase?'Ensayo':'Empieza')+' a las <b>'+_t0+'</b>',
        min:evMinutosDe(_t0),ds:evIsoDate(firstDate),suf:''});
    }
  }
  var _evT;
  if(_bloques.length&&_bloques[0].min!=null){
    var _pre=Math.max(0,_bloques[0].min-60);
    _evT={h:Math.floor(_pre/60),m:_pre%60};
  } else {
    _evT=typeof nextAlarmTime==='function'?nextAlarmTime(firstDate,15,2):{h:15,m:2};
  }
  _bloques.forEach(function(bl,bi){
    if(bl.min==null)return;
    h+='<div class="ev-alarm-pre">';
    h+='<div class="ev-alarm-pre-t">'+bl.titulo+' — avisarme:</div>';
    h+='<div class="ev-alarm-pre-row">';
    [[60,'1 hora antes'],[30,'30 min antes']].forEach(function(o){
      var mm=Math.max(0,bl.min-o[0]);
      var lbl=String(Math.floor(mm/60)).padStart(2,'0')+':'+String(mm%60).padStart(2,'0');
      var sufTxt=(bl.suf?bl.suf+', ':'')+(o[0]===60?'1 h':'30 min')+' antes';
      h+='<button class="ev-alarm-pre-btn'+((bi===0&&o[0]===60)?' on':'')+'" data-pre="'+o[0]
        +'" data-hh="'+Math.floor(mm/60)+'" data-mm="'+(mm%60)+'"'
        +' data-ds="'+bl.ds+'" data-suf="'+escHtml(sufTxt)+'">'
        +o[1]+'<span>'+lbl+'</span></button>';
    });
    h+='</div></div>';
  });
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
  /* Si quedaba un panel anterior (se borra con 300ms de retardo por la
     animacion), sus ids duplicados capturarian los getElementById del nuevo */
  _evCancelRemove('evAlarmWrap');
  var _oldA=document.getElementById('evAlarmWrap');if(_oldA)_oldA.remove();
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
  _evScheduleRemove('evAlarmWrap',function(){
    refreshEvents();
    if(typeof refreshBday==='function')refreshBday();
  });
}
/* Abre el panel de cumpleaños VIP desde la ventana de eventos */
function openBdayAlarmFromEvents(b){
  var ov=document.getElementById('eventsOverlay');
  var _oldB=document.getElementById('bdAlarmWrap');if(_oldB)_oldB.remove();
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
  /* Atajos "1 h / 30 min antes": son interruptores. Con uno marcado, la hora
     de abajo lo refleja y sigue siendo editable (editarla a mano los desmarca).
     Con los dos marcados se crean DOS alarmas. */
  var _preBtns=[].slice.call(document.querySelectorAll('.ev-alarm-pre-btn'));
  function _syncPre(){
    var on=_preBtns.filter(function(b){return b.classList.contains('on');});
    var hI=document.getElementById('evAlarmH'),mI=document.getElementById('evAlarmM');
    var row=document.querySelector('.bd-alarm-row');
    if(on.length===1&&hI&&mI){
      hI.value=on[0].dataset.hh;
      mI.value=String(on[0].dataset.mm).padStart(2,'0');
    }
    if(row)row.style.opacity=(on.length>1)?'.45':'1';
    if(hI)hI.disabled=(on.length>1);
    if(mI)mI.disabled=(on.length>1);
  }
  _preBtns.forEach(function(b){
    b.addEventListener('click',function(){b.classList.toggle('on');_syncPre();});
  });
  if(_preBtns.length)_syncPre();
  ['evAlarmH','evAlarmM'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('input',function(){
      /* Editar a mano = hora personalizada */
      _preBtns.forEach(function(b){b.classList.remove('on');});
      _syncPre();
    });
  });
  document.getElementById('evAlarmCreate').addEventListener('click',function(){
    var alarmUrl=localStorage.getItem('excelia-alarm-url')||'';
    if(!alarmUrl){showToast('Configura la URL de MacroDroid en el men\u00fa \u22ef','error');return;}
    var base=normalizeMacroBase(alarmUrl);
    var dayOfAlarm=firstDate.getDay()+1;
    var fecha=String(firstDate.getDate()).padStart(2,'0')+'/'+String(firstDate.getMonth()+1).padStart(2,'0');
    var fmtD=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
    /* Una alarma por atajo marcado; si no hay ninguno, la hora escrita abajo */
    var marcados=_preBtns.filter(function(b){return b.classList.contains('on');});
    var alarmas=[];
    if(marcados.length){
      marcados.forEach(function(b){
        /* Cada atajo puede apuntar a SU dia (la vuelta de un viaje cae en el
           dia de fin, no en el de inicio) y traer su propia coletilla */
        var _d=b.dataset.ds?new Date(b.dataset.ds+'T00:00:00'):firstDate;
        var _sf=b.dataset.suf||((b.dataset.pre==='60'?'1 h':'30 min')+' antes');
        alarmas.push({h:parseInt(b.dataset.hh,10),m:parseInt(b.dataset.mm,10),
          suf:' ('+_sf+')',fecha:_d});
      });
    } else {
      var hr=parseInt(document.getElementById('evAlarmH').value,10);
      var mr=parseInt(document.getElementById('evAlarmM').value,10);
      alarmas.push({h:isNaN(hr)?15:Math.min(23,Math.max(0,hr)),
        m:isNaN(mr)?2:Math.min(59,Math.max(0,mr)),suf:'',fecha:firstDate});
    }
    alarmas.forEach(function(a){
      var _f=a.fecha||firstDate;
      var _fTxt=String(_f.getDate()).padStart(2,'0')+'/'+String(_f.getMonth()+1).padStart(2,'0');
      var _dow=_f.getDay()+1;
      var msg='\uD83D\uDCC5 '+ev.title+' '+_fTxt+a.suf;
      if(typeof addAlarm==='function'){
        addAlarm({type:'event',label:msg,hour:a.h,minute:a.m,days:[_dow],targetDate:fmtD(_f)});
      }
      var url=base+'/generar_alarma1?alarmH='+a.h+'&alarmM='+a.m
        +'&alarmMsg='+encodeURIComponent(msg)+'&alarmDays='+_dow;
      fetch(url,{mode:'no-cors'}).catch(function(){});
    });
    setEvAlarmState(ev.id,true);
    showToast(alarmas.length>1?('\u23f0 '+alarmas.length+' alarmas creadas')
      :('\u23f0 Alarma creada \u2014 '+escHtml(ev.title)),'success');
    closeEvAlarm();setTimeout(refreshEvents,320);
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

function refreshEvents(keepScroll){
  /* El re-render recrea .sy-body y con el se pierde el scroll: la vista
     saltaba cada vez que se tocaba cualquier control. Por defecto se conserva
     la posicion; pasar false para volver arriba a proposito (cambio de vista). */
  var _old=document.querySelector('#eventsOverlay .sy-body');
  var _reset=(keepScroll===false)||EV_SCROLL_RESET;
  EV_SCROLL_RESET=false;
  var _top=(_reset||!_old)?null:_old.scrollTop;
  document.getElementById('eventsContent').innerHTML=renderEvContent();
  bindEvEvents();
  if(_top){
    var _new=document.querySelector('#eventsOverlay .sy-body');
    if(_new)_new.scrollTop=_top;
  }
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
  /* Posicionamiento del día Hoy en Agenda Semanal — refactor v218:
     Causa raíz del bug "funciona hoy pero no mañana": la lógica anterior
     dependía de que la id="ev-wk-today-row" estuviese en el DOM al medir
     coordenadas. Si EV_VIEW_STATE.week tenía un mes ≠ today (porque el
     usuario navegó a otro mes en sesión previa y el JS sigue cargado de
     ayer), el today row NO se renderizaba en el viewport actual al
     entrar — y el scroll nunca encontraba el elemento.
     Solución: SIEMPRE forzar EV_MONTH=today antes de medir, y usar la
     API moderna scrollIntoView (con CSS scroll-margin-top:48px declarado
     en #ev-wk-today-row), que es independiente de position:static y
     posiciona el elemento exactamente debajo del separador sticky. */
  function _scrollWeekToToday(){
    /* Forzar el estado a HOY antes de medir (re-evalúa Date() en cada
       llamada para evitar valores cacheados al cargar el JS) */
    var now=new Date();
    var todayY=now.getFullYear(),todayM=now.getMonth();
    if(EV_YEAR!==todayY||EV_MONTH!==todayM){
      EV_YEAR=todayY;EV_MONTH=todayM;
      EV_VIEW_STATE.week={year:todayY,month:todayM};
      refreshEvents();
    }
    function doScroll(){
      var r=document.getElementById('ev-wk-today-row');
      if(!r)return false;
      try{r.scrollIntoView({block:'start',behavior:'auto'});}catch(e){
        /* Fallback antiguo si scrollIntoView falla (browsers raros) */
        var b=document.querySelector('.sy-body');
        if(!b)return false;
        var rRect=r.getBoundingClientRect(),bRect=b.getBoundingClientRect();
        b.scrollTop=Math.max(0,b.scrollTop+rRect.top-bRect.top-34);
      }
      return true;
    }
    /* Múltiples attempts: el primer scroll puede ocurrir antes de que el
       layout esté pintado tras refreshEvents. Reintentos agresivos. */
    doScroll();
    requestAnimationFrame(function(){
      doScroll();
      setTimeout(doScroll,80);
      setTimeout(doScroll,250);
      setTimeout(doScroll,600);
    });
  }
  var todayBtn=document.getElementById('evToday');
  if(todayBtn)todayBtn.addEventListener('click',function(){
    /* Re-evalúa Date() FRESCO en cada click — clave para que funcione
       el día siguiente sin importar cuándo se cargó el JS originalmente */
    var n=new Date();
    if(EV_VIEW==='quad'){
      EV_QUAD_YEAR=n.getFullYear();EV_QUAD_MONTH=n.getMonth();
      refreshEvents();
    } else if(EV_VIEW==='week'){
      /* Para week, _scrollWeekToToday se encarga de actualizar el estado
         y refresh; así nos aseguramos de que la id today-row exista */
      _scrollWeekToToday();
    } else {
      EV_YEAR=n.getFullYear();EV_MONTH=n.getMonth();
      if(EV_VIEW==='cal')EV_VIEW_STATE[EV_VIEW]={year:EV_YEAR,month:EV_MONTH};
      else if(EV_VIEW==='annual')EV_VIEW_STATE[EV_VIEW]={year:EV_YEAR};
      refreshEvents();
    }
  });
  var weekViewBtn=document.getElementById('evViewWeek');
  if(weekViewBtn)weekViewBtn.addEventListener('click',function(){
    /* Cambiar a Agenda Semanal preservando el último mes en el que estuvo */
    _switchEvView('week');refreshEvents();
    /* Solo scrollear a hoy si la vista cargada coincide con el mes actual */
    var n=new Date();
    if(EV_YEAR===n.getFullYear()&&EV_MONTH===n.getMonth())_scrollWeekToToday();
  });
  var brightBtn=document.getElementById('evBright');
  if(brightBtn)brightBtn.addEventListener('click',function(){
    EV_BRIGHT_PAST=!EV_BRIGHT_PAST;refreshEvents();
  });
  document.getElementById('evViewUpcoming').addEventListener('click',function(){
    _switchEvView(EV_VIEW==='months'?'months':'upcoming');refreshEvents();
  });
  document.getElementById('evViewCal').addEventListener('click',function(){_switchEvView('cal');EV_PREV_VIEW=null;refreshEvents();});
  document.getElementById('evViewQuad').addEventListener('click',function(){_switchEvView('quad');refreshEvents();});
  document.getElementById('evViewAnnual').addEventListener('click',function(){_switchEvView('annual');refreshEvents();});
  var _rutBtn=document.getElementById('evViewRutinas');
  if(_rutBtn)_rutBtn.addEventListener('click',function(){_switchEvView('rutinas');refreshEvents();});
  var _upR=document.getElementById('evUpShowRut');
  if(_upR)_upR.addEventListener('change',function(){EV_UP_SHOW_RUT=this.checked;refreshEvents();});
  var _upB=document.getElementById('evUpShowBoda');
  if(_upB)_upB.addEventListener('change',function(){EV_UP_SHOW_BODA=this.checked;refreshEvents();});
  var _subUp=document.getElementById('evSubUpcoming');
  if(_subUp)_subUp.addEventListener('click',function(){_switchEvView('upcoming');refreshEvents(false);});
  var _subTd=document.getElementById('evSubTodos');
  if(_subTd)_subTd.addEventListener('click',function(){_switchEvView('months');refreshEvents(false);});
  if(EV_VIEW==='rutinas'&&typeof bindRutinasEvents==='function')bindRutinasEvents();
  var _bodasBtn=document.getElementById('evViewBodas');
  if(_bodasBtn)_bodasBtn.addEventListener('click',function(){_switchEvView('bodas');refreshEvents();});
  document.getElementById('evViewTimeOff').addEventListener('click',function(){
    /* La pestana recuerda en cual de sus dos subpestanas estabas */
    _switchEvView(EV_TO_SUBTAB==='time-off'?'time-off':'puentes');refreshEvents();
  });
  var _subP=document.getElementById('evSubPuentes');
  if(_subP)_subP.addEventListener('click',function(){EV_TO_SUBTAB='puentes';_switchEvView('puentes');refreshEvents();});
  var _subT=document.getElementById('evSubTimeOff');
  if(_subT)_subT.addEventListener('click',function(){EV_TO_SUBTAB='time-off';_switchEvView('time-off');refreshEvents();});
  if(EV_VIEW==='bodas'&&typeof bindBodasEvents==='function')bindBodasEvents();
  // Dropdown de vista anual (reemplaza los dos botones anteriores)
  var _vdBtn=document.getElementById('evAnnVdBtn');
  var _vdMenu=document.getElementById('evAnnVdMenu');
  if(_vdBtn&&_vdMenu){
    _vdBtn.addEventListener('click',function(e){e.stopPropagation();_vdMenu.classList.toggle('open');});
    /* Un solo listener global (bindEvEvents se ejecuta en cada re-render; sin el
       flag se acumularían listeners en document con referencias a menús muertos) */
    if(!document._evVdCloser){
      document._evVdCloser=true;
      document.addEventListener('click',function(){
        var m=document.getElementById('evAnnVdMenu');
        if(m)m.classList.remove('open');
      });
    }
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
  document.querySelectorAll('.ev-annual-mbar[data-id],.ev-annual-x[data-id],.ev-annual-dot[data-id],.ev-annual-marker[data-id],.ev-annual-vip-star[data-id],.ev-annual-vip-star-svg[data-id],.ev-annual-vip-dot[data-id]').forEach(function(el){
    el.addEventListener('click',function(e){
      if(!EV_EDIT_MODE)return;
      e.stopPropagation();
      var id=el.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      EV_EDIT_DS=el.dataset.ds||null;
      if(ev){openEvDetail(ev);return;}
      var _rs2=(typeof rutEventFromId==='function')?rutEventFromId(id):null;
      if(_rs2)openRutSesion(_rs2.rutina,_rs2.ds);
    });
  });
  // Click en mes del calendario anual/quad: navegar o seleccionar día (modo añadir)
  document.querySelectorAll('.ev-annual-month[data-month]').forEach(function(card){
    card.addEventListener('click',function(e){
      // In edit mode, check for event click first (handled above), then day click
      if(EV_EDIT_MODE&&e.target.dataset.ds){
        openEvForm(null,e.target.dataset.ds);
      } else if(!EV_EDIT_MODE){
        var _navMonth=parseInt(card.dataset.month);
        var _navYear=card.dataset.year?parseInt(card.dataset.year):EV_YEAR;
        EV_PREV_VIEW=EV_VIEW==='quad'?'quad':'annual';
        _switchEvView('cal');
        EV_YEAR=_navYear;EV_MONTH=_navMonth;
        EV_VIEW_STATE.cal={year:_navYear,month:_navMonth};
        refreshEvents();
      }
    });
  });
  /* Estrellas VIP y "+" del 1-mes: abren el carrusel del dia */
  document.querySelectorAll('.ev-cell .ev-day-vips[data-ds], .ev-cell .ev-day-more[data-ds]').forEach(function(el){
    el.addEventListener('click',function(e){
      e.stopPropagation();
      var star=e.target.closest?e.target.closest('.ev-annual-vip-star-svg'):null;
      openEvDayCarousel(el.dataset.ds,star?star.dataset.id:null);
    });
  });
  /* Sesion de rutina en el 1-mes */
  document.querySelectorAll('.ev-cell .ev-rut-mark[data-id]').forEach(function(el){
    el.addEventListener('click',function(e){
      e.stopPropagation();
      var _c=el.closest('[data-ds]');
      openEvDayCarousel(el.dataset.ds||(_c?_c.dataset.ds:null),el.dataset.id);
    });
  });
  // Click en badges/markers del calendario 1-mes → detail (no edit)
  document.querySelectorAll('.ev-badge[data-id], .ev-cell .ev-annual-marker[data-id], .ev-cell .ev-annual-vip-star-svg[data-id]').forEach(function(badge){
    badge.addEventListener('click',function(e){
      /* Las estrellas de la columna izquierda las lleva el carrusel: hay que
         dejar que el click siga subiendo hasta .ev-day-vips */
      if(badge.closest('.ev-day-vips'))return;
      e.stopPropagation();
      var id=badge.dataset.id;
      var _cell=badge.closest('[data-ds]');
      var _ds=badge.dataset.ds||(_cell?_cell.dataset.ds:null);
      EV_EDIT_DS=_ds;
      /* Se abre el carrusel del dia posicionado en el evento pulsado, para
         poder pasar al resto de eventos de ese dia deslizando. */
      if(_ds){openEvDayCarousel(_ds,id);return;}
      var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  // Click en celda vacía → crear evento con fecha
  document.querySelectorAll('.ev-cell[data-ds]').forEach(function(cell){
    cell.addEventListener('click',function(e){
      if(e.target.classList.contains('ev-badge'))return;
      if(e.target.closest && e.target.closest('.ev-annual-marker,.ev-annual-vip-star-svg,.ev-rut-mark,.ev-day-more,.ev-day-vips'))return;
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
      /* Si venimos de una pulsacion larga, ya se abrio la hoja de borrado */
      if(item._lpFired&&Date.now()-item._lpFired<800)return;
      var id=item.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  var _srch=document.getElementById('evListSearch');
  if(_srch){
    _srch.addEventListener('input',function(){
      EV_LIST_SEARCH=this.value;
      clearTimeout(window._evSrchT);
      window._evSrchT=setTimeout(function(){
        refreshEvents();
        var el=document.getElementById('evListSearch');
        if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}
      },250);
    });
  }
  var _srchX=document.getElementById('evListSearchX');
  if(_srchX)_srchX.addEventListener('click',function(){EV_LIST_SEARCH='';refreshEvents();});
  document.querySelectorAll('.ev-sort-row .boda-chip[data-sort]').forEach(function(b){
    b.addEventListener('click',function(){EV_LIST_SORT=b.dataset.sort;refreshEvents();});
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
      if(ev){openEvDetail(ev);return;}
      var _rs3=(typeof rutEventFromId==='function')?rutEventFromId(id):null;
      if(_rs3)openRutSesion(_rs3.rutina,_rs3.ds);
    });
  });
  // Click en celda de día (fecha o zona de chips) en Agenda Semanal → crear evento prefilled
  document.querySelectorAll('.ev-wk-date[data-ds],.ev-wk-chips[data-ds]').forEach(function(cell){
    cell.addEventListener('click',function(e){
      if(e.target.closest('.ev-wk-chip,.ev-wk-multi'))return;
      var ds=cell.dataset.ds;
      if(ds)openEvForm(null,ds);
    });
  });
  /* Borrar un evento de la lista: solo con PULSACION LARGA, y con deshacer */
  document.querySelectorAll('.ev-list-item[data-id]').forEach(function(item){
    if(typeof addLongPress!=='function')return;
    addLongPress(item,function(){
      var id=item.dataset.id;
      var ev=null;
      for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id){ev=EVENTS[i];break;}
      if(ev)openEvDeleteSheet(ev);
    });
  });
  var evExportEl=document.getElementById('evExport');
  if(evExportEl)evExportEl.addEventListener('click',function(){
    if(!EVENTS.length){showToast('No hay eventos para exportar','error');return;}
    /* Se exporta un objeto con eventos + parejas de bodas (las clases van
       dentro de EVENTS). El importador sigue aceptando el array pelado
       de versiones anteriores. */
    var _payload={version:2,events:EVENTS,
      bodas:(typeof BODA_COUPLES!=='undefined')?BODA_COUPLES:[]};
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(_payload,null,2));
    a.download='eventos.json';a.click();
  });
  var evImportEl=document.getElementById('evImport');
  if(evImportEl)evImportEl.addEventListener('click',function(){document.getElementById('evImportFile').click();});
  var evImportFileEl=document.getElementById('evImportFile');
  if(evImportFileEl)evImportFileEl.addEventListener('change',function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(evt){
      var arr,incBodas=null;
      try{
        var _raw=JSON.parse(evt.target.result);
        if(Array.isArray(_raw))arr=_raw;                       /* formato antiguo */
        else if(_raw&&Array.isArray(_raw.events)){             /* formato v243 */
          arr=_raw.events;
          if(Array.isArray(_raw.bodas))incBodas=_raw.bodas;
        } else throw new Error();
      }catch(err){showToast('Error al importar el archivo','error');return;}
      var apply=function(mode){
        var _res=null;
        if(mode==='merge'){
          /* Incremental: no se borra nada y no se duplica — ver evMergeIncoming */
          _res=evMergeIncoming(arr);
        }else{EVENTS=arr;}
        /* Parejas de bodas: fusionar por id o reemplazar, igual que los eventos */
        if(incBodas&&typeof BODA_COUPLES!=='undefined'&&typeof saveBodas==='function'){
          if(mode==='merge'){
            var bidx={};
            BODA_COUPLES.forEach(function(c,i){bidx[c.id]=i;});
            incBodas.forEach(function(c){
              if(!c||!c.id)return;
              if(bidx[c.id]!==undefined)BODA_COUPLES[bidx[c.id]]=c;
              else{bidx[c.id]=BODA_COUPLES.length;BODA_COUPLES.push(c);}
            });
          }else{BODA_COUPLES=incBodas;}
          saveBodas();
        }
        saveEvents();updateEventsBtn();refreshEvents();
        showToast(_res?('Eventos: '+evMergeMsg(_res))
          :('Eventos importados: '+EVENTS.length)
          +(incBodas?(' · parejas: '+BODA_COUPLES.length):''),'success');
      };
      if(typeof askImportMode==='function')askImportMode('Eventos: '+f.name+' ('+arr.length+')',apply);
      else apply('replace');
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
