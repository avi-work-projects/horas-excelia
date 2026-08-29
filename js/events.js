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
var EV_TYPES_FILTER = 'all';   // 'all' | nombre de tipo
var EV_TYPES_PAST = true;
var EV_LIST_SORT = 'fecha';     /* 'fecha' (lo mas cercano primero) | 'categoria' */
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

/* ── Tope de la columna derecha: EV_MAX_PUNT_DIA puntuales por dia ──
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
  /* Solo cuentan los que compiten por la columna derecha: ni los cumpleanos
     VIP ni las sesiones de rutina (que van a la izquierda y tienen su propio
     tope), ni los eventos grandes (que son barras, no marcadores). */
  for(i=0;i<days.length;i++){
    var n=0;
    for(var j=0;j<EVENTS.length;j++){
      var ex=EVENTS[j];
      if(excludeId&&ex.id===excludeId)continue;
      if(ex.id.indexOf('ev-bday-vip-')===0)continue;
      if(typeof getEvKind==='function'&&getEvKind(ex)==='grande')continue;
      if(eventOccursOn(ex,days[i]))n++;
    }
    if(n>=EV_MAX_PUNT_DIA)return days[i];
  }
  return null;
}
/* Cuantas sesiones de rutina hay ya ese dia (sin contar una rutina concreta) */
function rutDayCount(ds,excluirId){
  if(typeof rutEventsOn!=='function')return 0;
  return rutEventsOn(ds).filter(function(ev){
    return !(excluirId&&ev._rut&&ev._rut.id===excluirId);
  }).length;
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
/* Topes de un mismo dia, uno por columna del calendario de 1 mes. Antes
   habia un unico tope de 8 para todo junto, y las rutinas y los cumpleanos
   VIP se comian el sitio de los eventos de verdad. */
var EV_MAX_PUNT_DIA = 5;     /* columna derecha: eventos puntuales */
var EV_MAX_RUT_DIA  = 3;     /* columna izquierda: sesiones de rutina */
/* 1-mes: huecos de la columna derecha (eventos puntuales). Si hay mas, el
   ultimo hueco se convierte en el "+" que abre el carrusel del dia. */
var EV_CAL_CORNER_STACK = 5;
/* Cumpleanos VIP que caben el mismo dia en la columna izquierda */
var EV_MAX_VIP_DIA = 3;
var EV_CAL_VIP_MAX = EV_MAX_VIP_DIA;   /* nombre antiguo, lo usa el render */
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

/* ── Reparto de barras en filas y orden de capas ───────────────────
   Las barras de eventos grandes se apilan asi (de arriba a abajo):
     marcadores puntuales > barra fina > media > gruesa > perimetro de puente
   Por eso el reparto en filas se hace POR GROSOR: dos barras del mismo grosor
   que se solapan van a filas distintas (y la franja se estrecha para que
   quepan), mientras que dos de grosor distinto comparten fila y se superponen,
   quedando la mas fina visible encima de la mas gruesa. */
var EV_BAR_Z = {sm:3, md:2, lg:1};
function _evRowOcc(){return {lg:[[],[],[]], md:[[],[],[]], sm:[[],[],[]]};}
/* Categorias que comparten dia. Es cosa de los viajes de verdad: se sale un
   dia y se llega otro, asi que el dia del relevo es medio de cada uno. Un
   "Otros" grande no significa eso, y ahi el reparto confunde mas que ayuda. */
var EV_COMPARTE_DIA = {'Viaje':1, 'Asturias':1, 'Casa Rural':1};
function evComparteDia(ev){
  return getEvKind(ev)==='grande' && !!EV_COMPARTE_DIA[getEvType(ev)];
}
/* ¿Chocan de verdad dos TROZOS, o solo se rozan? Solo geometria: "rozarse" es
   que uno ACABE justo en la columna en que el otro EMPIEZA. */
function _evSoloSeRozan(aS,aE,bS,bE){
  if(aE<bS||aS>bE)return false;                       /* ni se tocan */
  if(Math.max(aS,bS)!==Math.min(aE,bE))return false;  /* pisan mas de un dia */
  return (aE===bS)||(bE===aS);
}
/* La decision completa, ya con el evento delante.
   OJO con `unDia`: mira la duracion del EVENTO, no la del trozo. Un trozo de
   una sola columna puede ser una barra larga cortada por el fin de semana o
   por el cambio de mes; eso no la convierte en un evento de un dia. Cuando se
   miraba el trozo, un evento que empezaba en domingo y seguia la semana
   siguiente no compartia ese domingo. */
function _evTrozosSeRozan(a,b){
  if(a.unDia||b.unDia)return false;
  if(!evComparteDia(a.ev)||!evComparteDia(b.ev))return false;
  return _evSoloSeRozan(a.cs,a.ce,b.cs,b.ce);
}
function _evAssignRow(it,rowOcc){
  var occ=rowOcc[evBarSize(it.ev)]||rowOcc.md;
  for(var r=0;r<3;r++){
    var ok=true;
    for(var j=0;j<occ[r].length;j++){
      var o=occ[r][j];
      if(it.cs<=o.ce&&it.ce>=o.cs&&!_evTrozosSeRozan(it,o)){ok=false;break;}
    }
    if(ok){it.row=r;occ[r].push(it);break;}
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
      if(!_evTrozosSeRozan(a,b))return;
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
var EV_MNS = MN_SHORT;   /* los meses viven en core.js */

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

/* ── Render: vista semanal (agenda por días) ─────────────── */

/* ── Render: detalle de evento ──────────────────────────── */
/* car = {ds,i,n} cuando la ficha se abre como parte del carrusel de un dia:
   entonces la cabecera lleva la fecha y el contador, y debajo van las flechas
   y los puntos para pasar de un evento a otro. Es la MISMA ficha, no otra. */

/* == Carrusel del dia ==================================================
   Se abre desde las estrellas VIP o desde el "+" de un dia con muchos
   eventos: muestra una ficha por evento y se pasa de una a otra deslizando
   o con las flechas. Desde cada ficha se salta a su panel de siempre. */
var EV_CAR = {ds:null, items:[], i:0};
/* == Cierre de paneles ==================================================
   Los paneles se quitan del DOM 300 ms despues de cerrarse, cuando termina la
   animacion. Si en ese rato se abre otro, el temporizador del cierre anterior
   se llevaba por delante el panel NUEVO (mismo id). Por eso el temporizador se
   guarda y se cancela al abrir. */
/* Los mismos de core.js, con el nombre que ya usaba este modulo */
function _evScheduleRemove(id,extra){_panelBorrarLuego(id,extra);}
function _evCancelRemove(id){_panelCancelarBorrado(id);}

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
  /* Un trayecto cuenta aunque no tenga hora: el medio y el conductor ya son
     informacion. Quien necesite la hora (los atajos de alarma) la comprueba. */
  if(ev.viaje.ida)
    out.push({k:'ida',lbl:'Ida',t:ev.viaje.ida,ds:ev.start});
  if(ev.viaje.vuelta)
    out.push({k:'vuelta',lbl:'Vuelta',t:ev.viaje.vuelta,ds:ev.end||ev.start});
  return out;
}
function evTramoTexto(tr){
  var m=tr.t.modo?EV_TRANS_EMOJI[tr.t.modo]:'';
  var s=tr.lbl+' \u00b7 '+(m?m+' ':'')+(tr.t.time||'sin hora');
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

/* ── Apertura/cierre de la ventana ──────────────────────── */

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
