/* ============================================================
   BODAS — Parejas y clases (ensayos de boda)
   Una CLASE es un evento normal: kind 'puntual', type 'Ensayos boda',
   con un bloque extra ev.boda = {coupleId, time, place}.
     · coupleId  id de la pareja (null = clase creada pero sin asignar)
     · time      'HH:MM' con minutos en :00 / :15 / :30 / :45 (null = sin hora)
     · place     'sala' | 'casa' | 'pareja' | 'otro'  (por defecto 'casa')
   Cada clase dura 1 hora.
   Las PAREJAS viven aparte, en localStorage 'excelia-bodas-v1':
     {id, name, color, contracted, note, weddingDate}
   ============================================================ */

var BODAS_SK = 'excelia-bodas-v1';
var BODA_COUPLES = (function(){
  try{var r=localStorage.getItem(BODAS_SK);if(r){var a=JSON.parse(r);if(Array.isArray(a))return a;}}catch(e){}
  return [];
})();
function saveBodas(){try{localStorage.setItem(BODAS_SK,JSON.stringify(BODA_COUPLES));}catch(e){}}

/* Lugar de la clase — el orden es el del desplegable */
var BODA_PLACE_LIST = [
  {k:'sala',  l:'Sala de confianza', s:'Sala'},
  {k:'casa',  l:'Casa (nuestra)',    s:'Casa'},
  {k:'pareja',l:'Casa de la pareja', s:'Casa (pareja)'},
  {k:'otro',  l:'Otro',              s:'Otro'}
];
var BODA_PLACE_DEFAULT = 'casa';
/* Sala SIN ASIGNAR: se guarda como cadena vacia para poder distinguirla de
   "el campo no existe" (clases antiguas), que sigue cayendo en Casa. */
var BODA_PLACE_NONE = '';
var BODA_PLACE_SHORT = (function(){var o={};BODA_PLACE_LIST.forEach(function(p){o[p.k]=p.s;});return o;})();
var BODA_PLACES      = (function(){var o={};BODA_PLACE_LIST.forEach(function(p){o[p.k]=p.l;});return o;})();
/* Emoji del lugar: de un vistazo se distingue casa de sala */
var BODA_PLACE_EMOJI = {sala:'\ud83c\udfe2', casa:'\ud83c\udfe0', pareja:'\ud83c\udfe1', otro:'\ud83d\udccd'};
function bodaPlaceEmoji(k){
  if(k===BODA_PLACE_NONE||k==null)return '\u2753';
  return BODA_PLACE_EMOJI[k]||'\ud83d\udccd';
}
function bodaPlaceOf(ev){
  var p=(ev&&ev.boda)?ev.boda.place:undefined;
  if(p===BODA_PLACE_NONE)return BODA_PLACE_NONE;   /* elegido "sin asignar" */
  return BODA_PLACE_SHORT[p]?p:BODA_PLACE_DEFAULT;
}
function bodaPlaceLabel(k){return k?BODA_PLACE_SHORT[k]:'Sin sala';}

/* Franjas horarias -> color de CADA brazo de abajo (izquierda, derecha).
   La progresion se lee como un reloj: cuanto mas tarde, mas oscuro, y el
   cambio entra primero por la derecha:
     manana  blanco|blanco  ·  tarde  blanco|gris
     tarde-noche gris|negro ·  noche  negro|negro */
var BODA_WHITE='#ffffff', BODA_GREY='#9aa0ae', BODA_BLACK='#111318';
var BODA_SLOTS = [
  {from: 9, to:14, left:BODA_WHITE, right:BODA_WHITE, label:'09-14 h'},
  {from:14, to:18, left:BODA_WHITE, right:BODA_GREY,  label:'14-18 h'},
  {from:18, to:20, left:BODA_GREY,  right:BODA_BLACK, label:'18-20 h'},
  {from:20, to:23, left:BODA_BLACK, right:BODA_BLACK, label:'20-23 h'}
];
var BODA_NO_TIME_COLOR   = '#8b8f9a';
var BODA_NO_COUPLE_COLOR = '#ffffff';  /* sin pareja: brazos de arriba en blanco */
var BODA_DEFAULT_TIME    = '18:00';
/* Paleta para asignar color automaticamente a cada pareja nueva (sin repetir
   mientras queden libres) */
var BODA_PALETTE = ['#e879a8','#4ecdc4','#fbbf24','#a3e635','#c084fc','#38bdf8',
                    '#fb923c','#f06595','#63e6be','#748ffc','#ff8787','#82c91e'];
function bodaNextColor(){
  var used={};BODA_COUPLES.forEach(function(c){used[(c.color||'').toLowerCase()]=1;});
  var libres=BODA_PALETTE.filter(function(c){return !used[c.toLowerCase()];});
  if(libres.length)return libres[Math.floor(Math.random()*libres.length)];
  /* Si ya se usaron todas: color aleatorio con tono bien separado */
  return 'hsl('+Math.floor(Math.random()*360)+',70%,62%)';
}

function bodaCouple(id){
  for(var i=0;i<BODA_COUPLES.length;i++)if(BODA_COUPLES[i].id===id)return BODA_COUPLES[i];
  return null;
}
function bodaSlot(time){
  if(!time)return null;
  var h=parseInt(String(time).slice(0,2),10);
  if(isNaN(h))return null;
  for(var i=0;i<BODA_SLOTS.length;i++){
    if(h>=BODA_SLOTS[i].from&&h<BODA_SLOTS[i].to)return BODA_SLOTS[i];
  }
  return null;
}
/* Color de los dos brazos de abajo: [izquierda, derecha] */
function bodaSlotColors(time){
  var sl=bodaSlot(time);
  return sl?[sl.left,sl.right]:[BODA_NO_TIME_COLOR,BODA_NO_TIME_COLOR];
}
function bodaSlotColor(time){return bodaSlotColors(time)[1];}
/* Aspa de una clase teniendo en cuenta los cambios aun sin guardar */
function bodaMarkFor(ev){
  var e=(typeof bodaEff==='function')?bodaEff(ev):(ev.boda||{});
  return evBodaSvg({boda:{coupleId:e.coupleId,time:e.time}});
}
/* Aspa bicolor: brazos de arriba con el color de la pareja, los de abajo con
   el de la franja horaria. Mismo grosor de borde que el resto de formas. */
function evBodaSvg(ev){
  var b=(ev&&ev.boda)||{};
  var c=bodaCouple(b.coupleId);
  var top=c?c.color:BODA_NO_COUPLE_COLOR;
  var bot=bodaSlotColors(b.time);
  var swIn=5, swOut=swIn+EV_SHAPE_BW*2;
  /* Los brazos de ABAJO se dibujan primero para que en el centro predominen
     los de arriba (el color de la pareja), no la franja horaria. */
  return '<svg viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet">'
    +'<path d="M-6,-6 L6,6 M-6,6 L6,-6" stroke="#000" stroke-width="'+swOut+'" stroke-linecap="round" fill="none"/>'
    +'<path d="M0,0 L-6,6" stroke="'+bot[0]+'" stroke-width="'+swIn+'" stroke-linecap="round" fill="none"/>'
    +'<path d="M0,0 L6,6"  stroke="'+bot[1]+'" stroke-width="'+swIn+'" stroke-linecap="round" fill="none"/>'
    +'<path d="M0,0 L-6,-6 M0,0 L6,-6" stroke="'+top+'" stroke-width="'+swIn+'" stroke-linecap="round" fill="none"/>'
    +'</svg>';
}

/* ── Clases (eventos de tipo "Ensayos boda") ── */
function bodaClasses(){
  return EVENTS.filter(function(ev){return getEvType(ev)==='Ensayos boda';});
}
function bodaClassesOfCouple(id){
  return bodaSortClasses(bodaClasses().filter(function(ev){return ev.boda&&ev.boda.coupleId===id;}));
}
function bodaFreeClasses(){
  return bodaSortClasses(bodaClasses().filter(function(ev){return !(ev.boda&&ev.boda.coupleId);}));
}
function bodaSortClasses(list){
  return list.slice().sort(function(a,b){
    if(a.start!==b.start)return a.start<b.start?-1:1;
    var ta=(a.boda&&a.boda.time)||'99:99', tb=(b.boda&&b.boda.time)||'99:99';
    return ta<tb?-1:ta>tb?1:0;
  });
}
function bodaClassesOnDay(ds){
  return bodaSortClasses(bodaClasses().filter(function(ev){return ev.start===ds;}));
}
function bodaNewClass(ds,time,coupleId,place){
  return {
    id:'ev-boda-'+Date.now()+'-'+Math.floor(Math.random()*10000),
    title:coupleId?('Ensayo — '+((bodaCouple(coupleId)||{}).name||'')):'Ensayo boda',
    note:'', color:evTypeColor('puntual','Ensayos boda'),
    kind:'puntual', type:'Ensayos boda',
    start:ds, end:ds, repeat:null,
    boda:{coupleId:coupleId||null, time:time||null, place:place||BODA_PLACE_DEFAULT}
  };
}
/* Normaliza las clases guardadas: UNA CLASE POR DIA y siempre con bloque
   ev.boda. Repara los eventos "Ensayos boda" que quedaron como un unico
   evento multidia (pasaba al cambiar de categoria un evento con varios dias:
   el alta masiva solo corria al crear, no al editar). Devuelve true si toco
   algo, para que quien lo llame vuelva a guardar. */
function bodaNormalizeClasses(arr){
  var cambiado=false, salida=[];
  arr.forEach(function(ev){
    if(!ev||getEvType(ev)!=='Ensayos boda'){salida.push(ev);return;}
    /* Dias que ocupa el evento */
    var dias=[];
    if(ev.dates&&ev.dates.length)dias=ev.dates.slice();
    else if(ev.end&&ev.end>ev.start){
      var d0=new Date(ev.start+'T00:00:00'),d1=new Date(ev.end+'T00:00:00'),g=0;
      for(var d=new Date(d0);d<=d1&&g<400;d.setDate(d.getDate()+1),g++)dias.push(evDk(d));
    }
    if(dias.length>1){
      /* Se parte en una clase por dia conservando lo que hubiera */
      dias.sort().forEach(function(ds,i){
        var c=bodaNewClass(ds,(ev.boda&&ev.boda.time)||null,(ev.boda&&ev.boda.coupleId)||null,
          (ev.boda&&ev.boda.place)||BODA_PLACE_DEFAULT);
        if(i===0)c.id=ev.id;          /* la primera hereda el id original */
        if(ev.title)c.title=ev.title;
        if(ev.note)c.note=ev.note;
        salida.push(c);
      });
      cambiado=true;
      return;
    }
    /* Un solo dia: quitar restos de multidia y asegurar el bloque boda */
    if(ev.dates){delete ev.dates;cambiado=true;}
    if(ev.end&&ev.end!==ev.start){ev.end=ev.start;cambiado=true;}
    if(!ev.boda){ev.boda={coupleId:null,time:null,place:BODA_PLACE_DEFAULT};cambiado=true;}
    salida.push(ev);
  });
  if(cambiado){arr.length=0;salida.forEach(function(e){arr.push(e);});}
  return cambiado;
}

/* Lugar por defecto al crear otra clase el mismo dia: el de la clase de arriba */
function bodaPlaceForNewOn(ds){
  var same=bodaClassesOnDay(ds);
  if(same.length)return bodaPlaceOf(same[same.length-1]);
  return BODA_PLACE_DEFAULT;
}
function bodaDayFull(ds){
  if(bodaIsClosed(ds))return true;   /* dia cerrado: no admite mas clases */
  return typeof evDayLimitExceeded==='function'&&!!evDayLimitExceeded({start:ds,end:ds,repeat:null},null);
}
/* Alta masiva desde el calendario 1 mes: una clase por dia, sin hora ni pareja */
function bodaBulkCreate(dsList){
  var added=0;
  dsList.forEach(function(ds){
    if(bodaDayFull(ds))return;
    EVENTS.push(bodaNewClass(ds,null,null,bodaPlaceForNewOn(ds)));
    added++;
  });
  if(added)saveEvents();
  return added;
}
function bodaProgress(c){
  var asignadas=bodaClassesOfCouple(c.id).length;
  return {done:asignadas, total:c.contracted||0, falta:Math.max(0,(c.contracted||0)-asignadas)};
}

/* ── Dias CERRADOS: ese dia ya no admite mas clases ── */
var BODA_CLOSED_SK='excelia-bodas-closed-v1';
var BODA_CLOSED=(function(){
  try{var r=localStorage.getItem(BODA_CLOSED_SK);if(r){var o=JSON.parse(r);if(o&&typeof o==='object')return o;}}catch(e){}
  return {};
})();
function saveBodaClosed(){try{localStorage.setItem(BODA_CLOSED_SK,JSON.stringify(BODA_CLOSED));}catch(e){}}
function bodaIsClosed(ds){return !!BODA_CLOSED[ds];}
function bodaToggleClosed(ds){
  if(BODA_CLOSED[ds])delete BODA_CLOSED[ds];else BODA_CLOSED[ds]=1;
  saveBodaClosed();
}

/* ── Cambios pendientes de guardar (hora / pareja / lugar) ──
   Editar un campo NO re-renderiza: se apunta aqui y se refresca solo esa fila.
   Asi no se pierde el scroll y el usuario decide cuando guardar. Las altas,
   las bajas y el cierre de dias si son inmediatos (cambian la lista entera). */
var BODA_PENDING={};
function bodaPendingCount(){return Object.keys(BODA_PENDING).length;}
/* Valores efectivos de una clase = los guardados + lo que haya pendiente */
function bodaEff(ev){
  var b=ev.boda||{},p=BODA_PENDING[ev.id]||{};
  return {
    coupleId:(p.coupleId!==undefined)?p.coupleId:(b.coupleId||null),
    time:(p.time!==undefined)?p.time:(b.time||null),
    place:(p.place!==undefined)?p.place:bodaPlaceOf(ev)
  };
}
function bodaSetPending(id,campo,valor){
  BODA_PENDING[id]=BODA_PENDING[id]||{};
  BODA_PENDING[id][campo]=valor;
}
function bodaPendingApply(silencioso){
  var n=bodaPendingCount();
  if(!n)return 0;
  Object.keys(BODA_PENDING).forEach(function(id){
    var ev=null;
    for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id){ev=EVENTS[i];break;}
    if(!ev)return;
    var p=BODA_PENDING[id];
    ev.boda=ev.boda||{};
    if(p.coupleId!==undefined){
      ev.boda.coupleId=p.coupleId;
      var c=bodaCouple(p.coupleId);
      ev.title=c?('Ensayo — '+c.name):'Ensayo boda';
      if(p.coupleId&&!ev.boda.time&&p.time===undefined)ev.boda.time=BODA_DEFAULT_TIME;
    }
    if(p.time!==undefined)ev.boda.time=p.time;
    if(p.place!==undefined)ev.boda.place=p.place;
  });
  BODA_PENDING={};
  saveEvents();
  if(!silencioso)showToast(n===1?'1 clase guardada':(n+' clases guardadas'),'success');
  return n;
}
function bodaPendingDiscard(){BODA_PENDING={};}

/* ── Estado de la pestaña ── */
var BODA_SUBTAB = 'clases';        /* 'clases' | 'parejas' */
var BODA_CLASS_MODE = 'ver';       /* 'ver' (consulta) | 'editar' */
var BODA_FILTER_COUPLE = 'all';
var BODA_HIDE_PAST = true;
var BODA_HIDE_CLOSED = false;
var BODA_CARD_OPEN = null;   /* id de la pareja desplegada en su tarjeta */
var BODA_PAREJAS_SEARCH = '';
/* null = como siempre (las mas recientes arriba). Cada chip da la vuelta:
   A-Z -> Z-A -> sin orden. Solo puede haber una regla a la vez. */
var BODA_PAREJAS_SORT = null;   /* 'az' | 'za' | 'new' | 'old' | null */
var BODA_PAREJAS_FILTER = 'incompletas';  /* 'incompletas' | 'todas' | 'completas' */
var BODA_CAL_HL = null;   /* id de la pareja resaltada en el calendario */
var BODA_CAL_YEAR = new Date().getFullYear();
var BODA_CAL_MONTH = new Date().getMonth();

/* Leyenda de franjas: dos cuadraditos por franja (brazo izquierdo y derecho) */
function _bodaLegendHtml(){
  var h='<div class="boda-legend"><span class="boda-legend-t">Brazos de abajo del aspa (franja horaria):</span>';
  BODA_SLOTS.forEach(function(s){
    h+='<span class="boda-legend-i"><i style="background:'+s.left+'"></i><i style="background:'+s.right+'"></i>'+s.label+'</span>';
  });
  h+='<span class="boda-legend-i"><i style="background:'+BODA_NO_TIME_COLOR+'"></i>sin hora</span>';
  h+='</div>';
  return h;
}

/* -- Subpestana CALENDARIO: ensayos de cada boda + los casamientos -- */
function _renderBodaCalendario(){
  var MN2=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var y=BODA_CAL_YEAR,m=BODA_CAL_MONTH;
  var mesPre=y+'-'+String(m+1).padStart(2,'0');
  /* Clases y bodas del mes */
  var porDia={},bodasDia={},enMes={};
  bodaClasses().forEach(function(ev){
    if(!porDia[ev.start])porDia[ev.start]=[];
    porDia[ev.start].push(ev);
    if(ev.start.indexOf(mesPre)===0&&ev.boda&&ev.boda.coupleId)enMes[ev.boda.coupleId]=true;
  });
  BODA_COUPLES.forEach(function(c){
    if(!c.weddingDate)return;
    if(!bodasDia[c.weddingDate])bodasDia[c.weddingDate]=[];
    bodasDia[c.weddingDate].push(c);
    if(c.weddingDate.indexOf(mesPre)===0)enMes[c.id]=true;
  });
  /* La leyenda solo lista las parejas con ensayo o boda este mes; si la pareja
     resaltada ya no esta, se limpia el resaltado */
  var leyenda=BODA_COUPLES.filter(function(c){return enMes[c.id];});
  if(BODA_CAL_HL&&!enMes[BODA_CAL_HL])BODA_CAL_HL=null;
  var hlC=BODA_CAL_HL?bodaCouple(BODA_CAL_HL):null;

  var h='<div class="boda-cal-nav">';
  h+='<button class="sy-nav" id="bodaCalPrev">&#9664;</button>';
  h+='<div class="boda-cal-month">'+MN2[m]+' '+y+'</div>';
  h+='<button class="sy-nav" id="bodaCalNext">&#9654;</button>';
  h+='</div>';
  h+='<div class="boda-cal-hdr">';
  ['L','M','X','J','V','S','D'].forEach(function(d){h+='<div>'+d+'</div>';});
  h+='</div><div class="boda-cal-grid" id="bodaCalGrid">';
  var first=new Date(y,m,1);
  var dow=first.getDay(),off=dow===0?6:dow-1;
  var cur=new Date(first);cur.setDate(cur.getDate()-off);
  var last=new Date(y,m+1,0);
  var todayDs=evDk(new Date());
  while(cur<=last||cur.getDay()!==1){
    var ds=evDk(cur);
    var inM=cur.getMonth()===m;
    var clsDia=bodaSortClasses(porDia[ds]||[]);
    var wedDia=bodasDia[ds]||[];
    /* Resaltado: dia con ensayo o boda de la pareja seleccionada */
    var esHl=false;
    if(hlC){
      esHl=clsDia.some(function(ev){return ev.boda&&ev.boda.coupleId===hlC.id;})
        || wedDia.some(function(c){return c.id===hlC.id;});
    }
    /* El dia de la boda NO se pinta por defecto: puede haber dos bodas el
       mismo dia y el fondo solo podria representar a una. Se pinta solo al
       pulsar una pareja en la leyenda. */
    var cls='boda-cal-day'+(inM?'':' out')+(ds===todayDs?' hoy':'')
      +(hlC?(esHl?' hl':' dim'):'');
    var sty='';
    if(hlC&&esHl)sty=' style="border-color:'+hlC.color+';background:'+hlC.color+'22"';
    h+='<div class="'+cls+'" data-ds="'+ds+'"'+sty+'>';
    h+='<span class="boda-cal-num">'+cur.getDate()+'</span>';
    wedDia.forEach(function(c){
      h+='<span class="boda-cal-wed" style="color:'+c.color+'">&#128141; <b>Boda</b></span>';
    });
    clsDia.forEach(function(ev){
      var c=bodaCouple(ev.boda&&ev.boda.coupleId);
      var col=c?c.color:BODA_NO_COUPLE_COLOR;
      h+='<span class="boda-cal-cls" title="'+escHtml((c?c.name:'sin asignar'))+'">'
        +'<i style="background:'+col+'"></i>'
        +'<span>'+((ev.boda&&ev.boda.time)?ev.boda.time:'--:--')+'</span></span>';
    });
    h+='</div>';
    cur.setDate(cur.getDate()+1);
  }
  h+='</div>';
  /* Leyenda: una pareja por linea, pulsable */
  h+='<div class="boda-cal-legend">';
  if(!leyenda.length)h+='<div class="sy-note">Sin ensayos ni bodas este mes.</div>';
  leyenda.forEach(function(c){
    var on=(BODA_CAL_HL===c.id);
    h+='<button class="boda-cal-lg'+(on?' on':'')+'" data-hl="'+c.id+'"'
      +(on?' style="border-color:'+c.color+';background:'+c.color+'1f"':'')+'>'
      +'<i style="background:'+c.color+'"></i>'
      +'<b>'+escHtml(c.name)+'</b>'
      +'<em>('+(c.weddingDate?('boda '+_bodaFmt(c.weddingDate)):'sin fecha de boda')+')</em>'
      +'</button>';
  });
  h+='</div>';
  return h;
}
function _bodaFirstWord(n){return String(n||'').split(/\s+/)[0];}

/* ── Render: pestaña Bodas ── */
function renderBodasBody(){
  /* Subpestanas y el conmutador Consulta/Edicion viven en el MISMO bloque
     sticky: asi los dos quedan fijos arriba al hacer scroll sin tener que
     hardcodear el "top" del segundo (que se desalineaba entre dispositivos). */
  var h='<div class="boda-sticky-hd">';
  h+='<div class="econ-sub-tabs">';
  [['clases','Clases'],['parejas','Parejas'],['calendario','Calendario'],['stats','Estadísticas']].forEach(function(t){
    h+='<button class="econ-sub-tab'+(BODA_SUBTAB===t[0]?' active':'')+'" data-bsub="'+t[0]+'">'+t[1]+'</button>';
  });
  h+='</div>';
  if(BODA_SUBTAB==='clases'){
    var edit=(BODA_CLASS_MODE==='editar');
    h+='<div class="boda-mode-row">';
    h+='<button class="boda-mode-btn'+(edit?'':' active')+'" data-bmode="ver">&#128065; Consulta</button>';
    h+='<button class="boda-mode-btn'+(edit?' active':'')+'" data-bmode="editar">&#9998; Edición</button>';
    h+='</div>';
  }
  h+='</div>';
  h+='<div class="boda-sec">';
  h+=(BODA_SUBTAB==='parejas')?_renderBodaParejas()
    :(BODA_SUBTAB==='calendario')?_renderBodaCalendario()
    :(BODA_SUBTAB==='stats')?_renderBodaStats():_renderBodaClases();
  h+='</div>';
  return h;
}

/* ── Subpestaña PAREJAS ── */
function _renderBodaParejas(){
  var _nInc=0,_nCom=0;
  BODA_COUPLES.forEach(function(c){if(bodaProgress(c).falta>0)_nInc++;else _nCom++;});
  var h='<div class="boda-chips">';
  [['incompletas','Por asignar',_nInc],['todas','Todas',BODA_COUPLES.length],['completas','Completas',_nCom]].forEach(function(o){
    h+='<button class="boda-chip'+(BODA_PAREJAS_FILTER===o[0]?' active':'')+'" data-pfilter="'+o[0]+'">'
      +o[1]+'<b>'+o[2]+'</b></button>';
  });
  h+='</div>';
  h+='<div class="bday-search-wrap boda-search"><input class="bday-search-input" id="bodaPSearch" type="text" '
    +'placeholder="Buscar pareja\u2026" value="'+escHtml(BODA_PAREJAS_SEARCH)+'"></div>';
  h+='<div class="boda-chips boda-sort-chips">';
  var _sa=(BODA_PAREJAS_SORT==='az')?' A\u2191':(BODA_PAREJAS_SORT==='za')?' Z\u2193':'';
  var _sf=(BODA_PAREJAS_SORT==='new')?' recientes' : (BODA_PAREJAS_SORT==='old')?' antiguas' : '';
  h+='<button class="boda-chip'+(_sa?' active':'')+'" data-psort="alfa">Alfab\u00e9tico'+_sa+'</button>';
  h+='<button class="boda-chip'+(_sf?' active':'')+'" data-psort="fecha">Creaci\u00f3n'+_sf+'</button>';
  h+='</div>';
  var _q=BODA_PAREJAS_SEARCH.trim().toLowerCase();
  var list=BODA_COUPLES.filter(function(c){
    var p=bodaProgress(c);
    if(_q&&String(c.name||'').toLowerCase().indexOf(_q)===-1)return false;
    if(BODA_PAREJAS_FILTER==='incompletas')return p.falta>0;
    if(BODA_PAREJAS_FILTER==='completas')return p.falta===0;
    return true;
  }).sort(function(a,b){
    if(BODA_PAREJAS_SORT==='az')return String(a.name||'').localeCompare(String(b.name||''),'es');
    if(BODA_PAREJAS_SORT==='za')return String(b.name||'').localeCompare(String(a.name||''),'es');
    if(BODA_PAREJAS_SORT==='old')return bodaCreatedAt(a)-bodaCreatedAt(b);
    return bodaCreatedAt(b)-bodaCreatedAt(a);   /* por defecto, las mas recientes arriba */
  });
  if(!BODA_COUPLES.length){
    h+='<div class="sy-note">Todavía no hay parejas. Crea una para poder asignarle clases.</div>';
  } else if(!list.length){
    h+='<div class="sy-note">Ninguna pareja en este filtro.</div>';
  }
  list.forEach(function(c){
    var p=bodaProgress(c);
    var pct=p.total?Math.min(100,Math.round(p.done*100/p.total)):0;
    var falta=p.falta>0?('<span class="boda-falta">faltan '+p.falta+'</span>')
      :(p.total&&p.done>p.total?'<span class="boda-sobra">+'+(p.done-p.total)+' extra</span>':'<span class="boda-ok">completa</span>');
    h+='<div class="boda-card boda-card-tap'+(BODA_CARD_OPEN===c.id?' abierta':'')+'" data-cid="'+c.id+'">';
    h+='<div class="boda-card-hd">';
    h+='<span class="boda-dot" style="background:'+c.color+'"></span>';
    h+='<span class="boda-name">'+escHtml(c.name)+'</span>';
    if(c.weddingDate)h+='<span class="boda-wed-tag">&#128141; '+_bodaFmt(c.weddingDate)+'</span>';
    h+='<button class="boda-mini-btn boda-assign" data-cid="'+c.id+'" title="Asignar clases">&#128197;</button>';
    h+='</div>';
    h+='<div class="boda-prog"><div class="boda-prog-bar" style="width:'+pct+'%;background:'+c.color+'"></div></div>';
    h+='<div class="boda-card-ft"><span>'+p.done+' / '+(p.total||0)+' clases</span>'+falta+'</div>';
    if(c.note)h+='<div class="boda-card-note">'+escHtml(c.note)+'</div>';
    /* Desplegada: aqui dentro va lo que antes abria un modal aparte */
    if(BODA_CARD_OPEN===c.id){
      var cls=bodaClassesOfCouple(c.id);
      h+='<div class="boda-card-open">';
      h+='<div class="boda-det-list-t">Clases asignadas</div>';
      if(!cls.length)h+='<div class="sy-note" style="margin:0">Todav\u00eda no tiene clases asignadas.</div>';
      cls.forEach(function(ev){
        var b=ev.boda||{};
        h+='<div class="boda-det-row">';
        h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
        h+='<span class="boda-det-day">'+_bodaFmtCorto(ev.start)+'</span>';
        h+='<span class="boda-ro-time'+(b.time?'':' none')+'">'+(b.time||'--:--')+'</span>';
        h+='<span class="boda-ro-place'+(bodaPlaceOf(ev)?'':' vacio')+'">'+escHtml(bodaPlaceLabel(bodaPlaceOf(ev)))+'</span>';
        h+='</div>';
      });
      h+='<div class="boda-det-actions boda-det-actions-row">';
      h+='<button class="ev-btn ev-edit-orange boda-c-edit" data-cid="'+c.id+'">&#9998; Editar</button>';
      h+='<button class="ev-btn boda-det-btn boda-c-asig" data-cid="'+c.id+'">&#128197; Asignar</button>';
      h+='<button class="ev-btn boda-det-btn boda-c-extra" data-cid="'+c.id+'">&#10133; Extra</button>';
      h+='</div>';
      h+='</div>';
    }
    h+='</div>';
  });
  h+='<button class="ev-io-btn boda-add-btn" id="bodaAddCouple">+ Nueva pareja</button>';
  return h;
}
function _bodaFmt(ds){return ds?ds.slice(8)+'/'+ds.slice(5,7)+'/'+ds.slice(0,4):'';}
function _bodaFmtCorto(ds){
  var WN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var d=new Date(ds+'T00:00:00');
  return WN[d.getDay()]+' '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
}

/* ── Subpestaña CLASES ── */
function _renderBodaClases(){
  var today=evDk(new Date());
  var all=bodaSortClasses(bodaClasses());
  var edit=(BODA_CLASS_MODE==='editar');
  var list=all.filter(function(ev){
    if(BODA_HIDE_PAST&&ev.start<today)return false;
    if(BODA_HIDE_CLOSED&&bodaIsClosed(ev.start))return false;
    if(BODA_FILTER_COUPLE==='all')return true;
    if(BODA_FILTER_COUPLE==='none')return !(ev.boda&&ev.boda.coupleId);
    return ev.boda&&ev.boda.coupleId===BODA_FILTER_COUPLE;
  });
  var h=_renderBodaIssueCards();
  /* Filtros: un desplegable con forma de chip para la pareja y dos
     interruptores del mismo estilo que los chips de Parejas */
  h+='<div class="boda-filters">';
  h+='<div class="boda-fsel"><span class="boda-fsel-ico">&#128101;</span>';
  h+='<select id="bodaFilterCouple">';
  h+='<option value="all"'+(BODA_FILTER_COUPLE==='all'?' selected':'')+'>Todas las parejas</option>';
  h+='<option value="none"'+(BODA_FILTER_COUPLE==='none'?' selected':'')+'>Sin asignar</option>';
  BODA_COUPLES.forEach(function(c){
    h+='<option value="'+c.id+'"'+(BODA_FILTER_COUPLE===c.id?' selected':'')+'>'+escHtml(c.name)+'</option>';
  });
  h+='</select></div>';
  h+='<div class="boda-ftoggles">';
  h+='<button class="boda-chip'+(BODA_HIDE_PAST?' active':'')+'" data-btoggle="past">'
    +(BODA_HIDE_PAST?'&#9745;':'&#9744;')+' Ocultar pasadas</button>';
  h+='<button class="boda-chip'+(BODA_HIDE_CLOSED?' active':'')+'" data-btoggle="closed">'
    +(BODA_HIDE_CLOSED?'&#9745;':'&#9744;')+' Ocultar cerrados</button>';
  h+='</div>';
  h+='</div>';
  if(!list.length){
    h+='<div class="sy-note">No hay clases'+(BODA_HIDE_PAST?' futuras':'')+'. Créalas marcando días en el Calendario 1 mes, o con el botón de abajo.</div>';
  }
  var byDay={},order=[];
  list.forEach(function(ev){if(!byDay[ev.start]){byDay[ev.start]=[];order.push(ev.start);}byDay[ev.start].push(ev);});
  order.forEach(function(ds){
    var cerrado=bodaIsClosed(ds);
    h+='<div class="boda-day'+(cerrado?' cerrado':'')+'" data-day="'+ds+'">';
    h+='<div class="boda-day-hd">'+_bodaFmtCorto(ds)
      +'<span class="boda-day-n">'+byDay[ds].length+' clase'+(byDay[ds].length>1?'s':'')
      +(cerrado?' · <b>cerrado</b>':'')+'</span>';
    if(edit){
      h+='<button class="boda-mini-btn boda-day-lock'+(cerrado?' on':'')+'" data-lock="'+ds+'" title="'
        +(cerrado?'Reabrir el día':'Cerrar el día (no admite más clases)')+'">'
        +(cerrado?'&#128274;':'&#128275;')+'</button>';
      if(!cerrado)h+='<button class="boda-mini-btn boda-day-add" data-ds="'+ds+'" title="Añadir clase este día">+</button>';
    }
    h+='</div>';
    byDay[ds].forEach(function(ev){
      var b=bodaEff(ev);
      var c=bodaCouple(b.coupleId);
      if(!edit){
        /* Consulta: fila limpia, sin controles */
        h+='<div class="boda-class boda-class-ro" data-id="'+ev.id+'">';
        h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
        h+='<span class="boda-ro-time'+(b.time?'':' none')+'">'+(b.time||'--:--')+'</span>';
        h+='<span class="boda-ro-couple"'+(c?' style="color:'+c.color+'"':'')+'>'+(c?escHtml(c.name):'sin asignar')+'</span>';
        h+='<span class="boda-ro-place'+(b.place?'':' vacio')+'">'+escHtml(bodaPlaceLabel(b.place))+'</span>';
        h+='</div>';
        return;
      }
      h+='<div class="boda-class'+(BODA_PENDING[ev.id]?' pend':'')+'" data-id="'+ev.id+'">';
      h+='<span class="boda-class-mark">'+bodaMarkFor(ev)+'</span>';
      h+='<button class="boda-inp boda-time-btn" data-id="'+ev.id+'">'+(b.time||'--:--')+'</button>';
      h+='<button class="boda-inp boda-couple-btn" data-id="'+ev.id+'"'+(c?' style="color:'+c.color+'"':'')+'>'
        +(c?escHtml(c.name):'— asignar —')+'</button>';
      h+='<select class="boda-inp boda-place'+(b.place?'':' vacio')+'" data-id="'+ev.id+'">';
      BODA_PLACE_LIST.forEach(function(p){
        h+='<option value="'+p.k+'"'+(b.place===p.k?' selected':'')+'>'+escHtml(p.s)+'</option>';
      });
      h+='<option value=""'+(b.place?'':' selected')+'>Sin sala</option>';
      h+='</select>';
      h+='<button class="boda-mini-btn boda-del" data-id="'+ev.id+'">×</button>';
      h+='</div>';
    });
    h+='</div>';
  });
  if(edit){
    h+='<div class="boda-actions">';
    h+='<button class="ev-io-btn" id="bodaAddClass">+ Añadir clase</button>';
    h+='<input type="date" class="ev-input boda-date-inp" id="bodaAddDate">';
    h+='</div>';
  }
  h+=_bodaLegendHtml();
  if(edit){
    var _np=bodaPendingCount();
    h+='<div class="boda-savebar'+(_np?'':' vacia')+'" id="bodaSaveBar">';
    h+='<button class="boda-save-cancel" id="bodaDiscard">Descartar</button>';
    h+='<button class="boda-save-ok" id="bodaSave">Guardar<span id="bodaSaveN">'+(_np?(' ('+_np+')'):'')+'</span></button>';
    h+='</div>';
  }
  return h;
}

/* ══ Panel deslizante (sheet) — base comun de los modales de Bodas ══
   Quita cualquier panel anterior que siguiera en el DOM (se borran con 300ms
   de retardo por la animacion): si no, los listeners y los querySelector del
   panel nuevo se mezclaban con los del viejo. */
function bodaOpenSheet(wrapId,ovId,html,onClose){
  var prev=document.getElementById(wrapId);
  if(prev)prev.remove();
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');
  wrap.id=wrapId;wrap.innerHTML=html;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById(ovId);
    if(fo){
      fo.classList.add('open');
      fo.addEventListener('click',function(e){if(e.target===fo)(onClose||function(){bodaCloseSheet(wrapId,ovId);})();});
    }
  });
  return wrap;
}
function bodaCloseSheet(wrapId,ovId){
  var fo=document.getElementById(ovId);
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById(wrapId);if(w)w.remove();},300);
}

/* ══ Avisos accionables (subpestaña Clases) ══
   Los recuentos son de TODO el calendario, no del mes en curso; lo unico que
   los recorta es la casilla "Ocultar pasadas". Cada tarjeta abre un panel con
   las acciones para resolver ese aviso. */
function bodaCreatedAt(c){
  if(c&&c.createdAt)return c.createdAt;
  var m=String(c&&c.id||'').match(/(\d{10,})/);
  return m?parseInt(m[1],10):0;
}
function bodaIssues(){
  var today=evDk(new Date());
  var all=bodaClasses().filter(function(ev){return !(BODA_HIDE_PAST&&ev.start<today);});
  return {
    total:all.length,
    /* Hueco = clase creada pero sin pareja (da igual si tiene hora) */
    huecos:bodaSortClasses(all.filter(function(ev){return !(ev.boda&&ev.boda.coupleId);})),
    /* Incompleta = ya tiene pareja pero le falta la hora o la sala */
    incompletas:bodaSortClasses(all.filter(function(ev){
      return ev.boda&&ev.boda.coupleId&&(!ev.boda.time||!bodaPlaceOf(ev));
    })),
    /* Parejas a las que aun les faltan clases por programar */
    pendientes:BODA_COUPLES.filter(function(c){return bodaProgress(c).falta>0;})
      .sort(function(a,b){return bodaProgress(b).falta-bodaProgress(a).falta;})
  };
}
function _renderBodaIssueCards(){
  var is=bodaIssues();
  var faltan=0;is.pendientes.forEach(function(c){faltan+=bodaProgress(c).falta;});
  function card(k,n,titulo,sub,tono){
    return '<button class="boda-issue'+(n?(' '+tono):' ok')+'" data-issue="'+k+'"'+(n?'':' disabled')+'>'
      +'<b>'+n+'</b><span>'+titulo+'</span>'
      +'<em>'+(n?sub:'todo en orden')+'</em></button>';
  }
  var h='<div class="boda-issues">';
  h+=card('huecos',is.huecos.length,'huecos sin asignar','pulsa para asignarlos o borrarlos','tono-azul');
  h+=card('pendientes',is.pendientes.length,'parejas pendientes',faltan+' clase'+(faltan===1?'':'s')+' por programar','tono-rojo');
  var _sinHora=0,_sinSala=0;
  is.incompletas.forEach(function(ev){
    if(!(ev.boda&&ev.boda.time))_sinHora++;
    if(!bodaPlaceOf(ev))_sinSala++;
  });
  var _det=[];
  if(_sinHora)_det.push(_sinHora+' sin hora');
  if(_sinSala)_det.push(_sinSala+' sin sala');
  h+=card('incompletas',is.incompletas.length,'info incompleta',_det.join(' \u00b7 '),'tono-naranja');
  h+='</div>';
  return h;
}
/* Panel de acciones de un aviso */
function openBodaIssue(kind){
  var is=bodaIssues();
  var titulos={huecos:'Huecos sin asignar',pendientes:'Parejas pendientes',incompletas:'Clases incompletas'};
  var h='<div class="ev-detail-overlay" id="bodaIssOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaIssClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">'+titulos[kind]+'</div>';
  h+='<div style="width:36px"></div></div>';
  if(kind==='pendientes'){
    if(!is.pendientes.length)h+='<div class="sy-note">Ninguna pareja pendiente.</div>';
    is.pendientes.forEach(function(c){
      var p=bodaProgress(c);
      h+='<div class="boda-iss-row">';
      h+='<span class="boda-dot" style="background:'+c.color+'"></span>';
      h+='<span class="boda-iss-main">'+escHtml(c.name)+'<em>'+p.done+' / '+p.total+'</em></span>';
      h+='<span class="boda-falta">faltan '+p.falta+'</span>';
      h+='<button class="boda-mini-btn" data-iss-assign="'+c.id+'" title="Asignar clases">&#128197;</button>';
      h+='</div>';
    });
  } else {
    var lista=(kind==='huecos')?is.huecos:is.incompletas;
    if(!lista.length)h+='<div class="sy-note">Nada pendiente aquí.</div>';
    lista.forEach(function(ev){
      var c=bodaCouple(ev.boda&&ev.boda.coupleId);
      h+='<div class="boda-iss-row">';
      h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
      var _falta=[];
      if(!(ev.boda&&ev.boda.time))_falta.push('sin hora');
      if(!bodaPlaceOf(ev))_falta.push('sin sala');
      h+='<span class="boda-iss-main">'+_bodaFmtCorto(ev.start)
        +'<em>'+(c?escHtml(c.name):'sin pareja')
        +(_falta.length?(' \u00b7 <b class="boda-falta">'+_falta.join(' y ')+'</b>'):'')+'</em></span>';
      if(kind==='huecos')h+='<button class="boda-mini-btn" data-iss-couple="'+ev.id+'" title="Asignar pareja">&#128101;</button>';
      if(!(ev.boda&&ev.boda.time))h+='<button class="boda-mini-btn" data-iss-time="'+ev.id+'" title="Poner hora">&#128337;</button>';
      if(!bodaPlaceOf(ev))h+='<button class="boda-mini-btn" data-iss-place="'+ev.id+'" title="Poner sala">&#127968;</button>';
      h+='<button class="boda-mini-btn" data-iss-del="'+ev.id+'" title="Borrar clase">&#215;</button>';
      h+='</div>';
    });
  }
  h+='</div></div>';
  bodaOpenSheet('bodaIssWrap','bodaIssOv',h,closeBodaIssue);
  function findEv(id){for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id)return EVENTS[i];return null;}
  document.getElementById('bodaIssClose').addEventListener('click',closeBodaIssue);
  document.querySelectorAll('[data-iss-assign]').forEach(function(b){
    b.addEventListener('click',function(){
      var c=bodaCouple(b.dataset.issAssign);
      closeBodaIssue();setTimeout(function(){openBodaAssign(c,false);},310);
    });
  });
  document.querySelectorAll('[data-iss-couple]').forEach(function(b){
    b.addEventListener('click',function(){
      var ev=findEv(b.dataset.issCouple);
      closeBodaIssue();setTimeout(function(){openBodaCouplePicker(ev);},310);
    });
  });
  document.querySelectorAll('[data-iss-place]').forEach(function(b){
    b.addEventListener('click',function(){
      var ev=findEv(b.dataset.issPlace);
      closeBodaIssue();setTimeout(function(){openBodaPlacePicker(ev);},310);
    });
  });
  document.querySelectorAll('[data-iss-time]').forEach(function(b){
    b.addEventListener('click',function(){
      var ev=findEv(b.dataset.issTime);
      closeBodaIssue();setTimeout(function(){openBodaTimePicker(ev);},310);
    });
  });
  document.querySelectorAll('[data-iss-del]').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.dataset.issDel,removed=null;
      EVENTS=EVENTS.filter(function(e){if(e.id===id){removed=e;return false;}return true;});
      saveEvents();
      closeBodaIssue();
      setTimeout(function(){refreshEvents();},310);
      showToast('Clase eliminada','success',function(){
        if(removed){EVENTS.push(removed);saveEvents();refreshEvents();}
      });
    });
  });
}
function closeBodaIssue(){bodaCloseSheet('bodaIssWrap','bodaIssOv');}

/* ══ Subpestaña ESTADÍSTICAS ══ */
function _bodaWeekKey(d){
  /* Lunes de la semana de d, como YYYY-MM-DD */
  var x=new Date(d.getTime());
  var off=(x.getDay()===0?6:x.getDay()-1);
  x.setDate(x.getDate()-off);
  return evDk(x);
}
function _renderBodaStats(){
  var todayDs=evDk(new Date());
  var all=bodaSortClasses(bodaClasses());
  if(!all.length)return '<div class="sy-note">Todavía no hay clases registradas.</div>';
  var dadas=all.filter(function(ev){return ev.start<todayDs;});
  var proximas=all.filter(function(ev){return ev.start>=todayDs;});
  /* Reparto por mes (ultimos 12 meses hasta hoy) */
  var hoy=new Date();
  var meses=[],mLabels=[],mVals=[];
  for(var i=11;i>=0;i--){
    var d=new Date(hoy.getFullYear(),hoy.getMonth()-i,1);
    var key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    meses.push(key);mLabels.push(MN_SHORT[d.getMonth()]);
    mVals.push(all.filter(function(ev){return ev.start.indexOf(key)===0;}).length);
  }
  /* Reparto por semana (ultimas 10 semanas) */
  var wLabels=[],wVals=[];
  for(var w=9;w>=0;w--){
    var wd=new Date(hoy.getTime());wd.setDate(wd.getDate()-w*7);
    var wk=_bodaWeekKey(wd);
    wLabels.push(wk.slice(8)+'/'+wk.slice(5,7));
    wVals.push(all.filter(function(ev){return _bodaWeekKey(new Date(ev.start+'T00:00:00'))===wk;}).length);
  }
  /* Medias sobre el periodo real con clases */
  var primera=all[0].start, ultima=all[all.length-1].start;
  var dias=Math.max(1,Math.round((new Date(ultima+'T00:00:00')-new Date(primera+'T00:00:00'))/86400000)+1);
  var mediaSem=(all.length/(dias/7)), mediaMes=(all.length/(dias/30.44));
  /* Reparto por pareja, franja, lugar y dia de la semana */
  var porPareja=BODA_COUPLES.map(function(c){
    return {label:c.name,value:bodaClassesOfCouple(c.id).length,color:c.color};
  }).filter(function(r){return r.value>0;}).sort(function(a,b){return b.value-a.value;});
  var sinP=all.filter(function(ev){return !(ev.boda&&ev.boda.coupleId);}).length;
  if(sinP)porPareja.push({label:'sin asignar',value:sinP,color:BODA_NO_COUPLE_COLOR});
  var porFranja=BODA_SLOTS.map(function(sl){
    return {label:sl.label,color:sl.right,
      value:all.filter(function(ev){var s2=bodaSlot(ev.boda&&ev.boda.time);return s2&&s2.label===sl.label;}).length};
  }).filter(function(r){return r.value>0;});
  var porLugar=BODA_PLACE_LIST.map(function(pl){
    return {label:pl.s,value:all.filter(function(ev){return bodaPlaceOf(ev)===pl.k;}).length};
  }).filter(function(r){return r.value>0;});
  var DN2=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var porDia=DN2.map(function(n,idx){
    return {label:n,value:all.filter(function(ev){
      var wd2=new Date(ev.start+'T00:00:00').getDay();
      return (wd2===0?6:wd2-1)===idx;}).length};
  }).filter(function(r){return r.value>0;});

  var h='';
  h+='<div class="boda-stats-row">';
  h+='<div class="boda-stat"><b>'+dadas.length+'</b><span>dadas</span></div>';
  h+='<div class="boda-stat"><b>'+proximas.length+'</b><span>próximas</span></div>';
  h+='<div class="boda-stat"><b>'+all.length+'</b><span>total</span></div>';
  h+='</div>';
  h+='<div class="boda-stats-row">';
  h+='<div class="boda-stat"><b>'+mediaSem.toFixed(1)+'</b><span>por semana</span></div>';
  h+='<div class="boda-stat"><b>'+mediaMes.toFixed(1)+'</b><span>por mes</span></div>';
  h+='<div class="boda-stat"><b>'+BODA_COUPLES.length+'</b><span>parejas</span></div>';
  h+='</div>';
  h+='<div class="boda-stat-note">Desde el '+_bodaFmt(primera)+' hasta el '+_bodaFmt(ultima)+'</div>';
  h+='<div class="boda-stat-t">Clases por mes <em>(últimos 12)</em></div>';
  h+='<div class="sy-chart">'+simpleBarChart(mVals,mLabels,'#c08a5a',{highlight:11})+'</div>';
  h+='<div class="boda-stat-t">Clases por semana <em>(últimas 10)</em></div>';
  h+='<div class="sy-chart">'+simpleBarChart(wVals,wLabels,'#e879a8',{highlight:9})+'</div>';
  if(porPareja.length){
    h+='<div class="boda-stat-t">Por pareja</div>'+hBarRows(porPareja);
  }
  if(porFranja.length){
    h+='<div class="boda-stat-t">Por franja horaria</div>'+hBarRows(porFranja);
  }
  if(porDia.length){
    h+='<div class="boda-stat-t">Por día de la semana</div>'+hBarRows(porDia,{});
  }
  if(porLugar.length){
    h+='<div class="boda-stat-t">Por lugar</div>'+hBarRows(porLugar,{});
  }
  return h;
}

/* ══ Modal: detalle de pareja (días y horas asignados) ══ */
/* El detalle de una pareja ya no es un modal: se despliega dentro de su
   tarjeta en la subpestana Parejas (ver _renderBodaParejas). */

/* ══ Modal: calendario de asignación ══
   - Días con clase YA de esta pareja: marcados (y fijos si extraMode)
   - Días con clase libre (sin pareja): resaltados como "disponibles"
   - Modo "Todos los días": permite marcar cualquier día (crea clase nueva)
   - El día de la boda se marca con 💍 */
var BODA_ASSIGN = null;   /* {couple, extra, year, month, sel:{ds:true}, fixed:{ds:true}} */
function openBodaAssign(couple,extraMode){
  if(!couple)return;
  var now=new Date();
  var refDs=null;
  var cls=bodaClassesOfCouple(couple.id);
  if(cls.length)refDs=cls[0].start;
  else{var libres=bodaFreeClasses();if(libres.length)refDs=libres[0].start;}
  var y=refDs?parseInt(refDs.slice(0,4),10):now.getFullYear();
  var m=refDs?parseInt(refDs.slice(5,7),10)-1:now.getMonth();
  BODA_ASSIGN={couple:couple,extra:!!extraMode,year:y,month:m,open:false,sel:{},fixed:{}};
  /* Las clases que ya tiene salen marcadas; en modo "clase extra" quedan fijas */
  cls.forEach(function(ev){
    BODA_ASSIGN.sel[ev.start]=(BODA_ASSIGN.sel[ev.start]||0)+1;
    if(extraMode)BODA_ASSIGN.fixed[ev.start]=true;
  });
  bodaOpenSheet('bodaAsgWrap','bodaAsgOv',
    '<div class="ev-detail-overlay" id="bodaAsgOv"><div class="ev-detail-sheet" id="bodaAsgSheet"></div></div>',
    closeBodaAssign);
  renderBodaAssign();
}
function closeBodaAssign(){
  bodaCloseSheet('bodaAsgWrap','bodaAsgOv');
  setTimeout(function(){BODA_ASSIGN=null;},300);
}
function renderBodaAssign(){
  var A=BODA_ASSIGN;if(!A)return;
  var sheet=document.getElementById('bodaAsgSheet');if(!sheet)return;
  var c=A.couple, MN2=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var libres={},mias={},ajenas={};
  bodaClasses().forEach(function(ev){
    var cid=ev.boda&&ev.boda.coupleId;
    if(!cid)libres[ev.start]=(libres[ev.start]||0)+1;
    else if(cid===c.id)mias[ev.start]=(mias[ev.start]||0)+1;
    else ajenas[ev.start]=(ajenas[ev.start]||0)+1;
  });
  var nSel=0;Object.keys(A.sel).forEach(function(k){nSel+=A.sel[k];});
  var p=bodaProgress(c);
  var h='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaAsgClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center;color:'+c.color+'">'
    +(A.extra?'Clase extra — ':'Asignar clases — ')+escHtml(c.name)+'</div>';
  h+='<div style="width:36px"></div></div>';
  h+='<div class="boda-asg-info"><b>'+nSel+'</b> / '+p.total+' clases'
    +(c.weddingDate?(' · boda el <b>'+_bodaFmt(c.weddingDate)+'</b>'):'')+'</div>';
  /* Conmutador: solo dias de ensayo / todos los dias */
  h+='<div class="boda-mode-row">';
  h+='<button class="boda-mode-btn'+(A.open?'':' active')+'" data-asgmode="ensayo">Días de ensayo</button>';
  h+='<button class="boda-mode-btn'+(A.open?' active':'')+'" data-asgmode="abierto">Todos los días</button>';
  h+='</div>';
  /* Navegacion de mes */
  h+='<div class="boda-asg-nav">';
  h+='<button class="sy-nav" id="bodaAsgPrev">&#9664;</button>';
  h+='<div class="boda-asg-month">'+MN2[A.month]+' '+A.year+'</div>';
  h+='<button class="sy-nav" id="bodaAsgNext">&#9654;</button>';
  h+='</div>';
  /* Rejilla */
  h+='<div class="boda-asg-grid-hdr">';
  ['L','M','X','J','V','S','D'].forEach(function(d){h+='<div>'+d+'</div>';});
  h+='</div><div class="boda-asg-grid">';
  var first=new Date(A.year,A.month,1);
  var dow=first.getDay();var off=dow===0?6:dow-1;
  var cur=new Date(first);cur.setDate(cur.getDate()-off);
  var last=new Date(A.year,A.month+1,0);
  var todayDs=evDk(new Date());
  while(cur<=last||cur.getDay()!==1){
    var ds=evDk(cur);
    var inM=cur.getMonth()===A.month;
    var cls2='boda-asg-day';
    if(!inM)cls2+=' out';
    var selN=A.sel[ds]||0;
    var isFixed=!!A.fixed[ds];
    var hasLibre=!!libres[ds];
    var hasAjena=!!ajenas[ds];
    var isWed=c.weddingDate===ds;
    if(selN)cls2+=' sel';
    if(isFixed)cls2+=' fixed';
    if(hasLibre&&!selN)cls2+=' libre';
    if(hasAjena&&!selN)cls2+=' ajena';
    if(ds===todayDs)cls2+=' hoy';
    if(isWed)cls2+=' wedding';
    /* Seleccionable: hay clase libre ese dia, o ya es mia, o estamos en modo abierto */
    var pick=inM&&(hasLibre||selN||A.open);
    if(!pick)cls2+=' off';
    var sty=selN?' style="background:'+c.color+'33;border-color:'+c.color+'"':'';
    h+='<div class="'+cls2+'"'+(pick?' data-ds="'+ds+'"':'')+sty+'>';
    h+='<span class="boda-asg-num">'+cur.getDate()+'</span>';
    if(selN>1)h+='<span class="boda-asg-badge" style="background:'+c.color+'">'+selN+'</span>';
    else if(selN)h+='<span class="boda-asg-tick" style="color:'+c.color+'">&#10003;</span>';
    else if(hasLibre)h+='<span class="boda-asg-free">'+libres[ds]+'</span>';
    if(isWed)h+='<span class="boda-asg-wed">&#128141;</span>';
    h+='</div>';
    cur.setDate(cur.getDate()+1);
  }
  h+='</div>';
  h+='<div class="boda-asg-legend">'
    +'<span><i class="lg-libre"></i>día de ensayo libre</span>'
    +'<span><i class="lg-sel" style="background:'+c.color+'"></i>de esta pareja</span>'
    +'<span><i class="lg-ajena"></i>de otra pareja</span></div>';
  h+='<div class="ev-detail-actions">';
  h+='<button class="ev-btn primary" id="bodaAsgSave">Guardar</button>';
  h+='</div>';
  sheet.innerHTML=h;
  bindBodaAssign();
}
function bindBodaAssign(){
  var A=BODA_ASSIGN;if(!A)return;
  document.getElementById('bodaAsgClose').addEventListener('click',closeBodaAssign);
  document.getElementById('bodaAsgPrev').addEventListener('click',function(){
    A.month--;if(A.month<0){A.month=11;A.year--;}renderBodaAssign();
  });
  document.getElementById('bodaAsgNext').addEventListener('click',function(){
    A.month++;if(A.month>11){A.month=0;A.year++;}renderBodaAssign();
  });
  document.querySelectorAll('.boda-mode-btn[data-asgmode]').forEach(function(b){
    b.addEventListener('click',function(){A.open=(b.dataset.asgmode==='abierto');renderBodaAssign();});
  });
  /* Deslizar sobre la rejilla para cambiar de mes */
  var _ag=document.querySelector('.boda-asg-grid');
  if(_ag&&typeof addSwipe==='function')addSwipe(_ag,
    function(){A.month++;if(A.month>11){A.month=0;A.year++;}renderBodaAssign();},
    function(){A.month--;if(A.month<0){A.month=11;A.year--;}renderBodaAssign();});
  document.querySelectorAll('.boda-asg-day[data-ds]').forEach(function(d){
    d.addEventListener('click',function(){
      var ds=d.dataset.ds;
      if(A.fixed[ds]){showToast('Esa clase ya estaba fijada','error');return;}
      if(A.sel[ds])delete A.sel[ds];
      else{
        if(bodaDayFull(ds)){showToast('Ese día ya tiene '+EV_MAX_DAY_EVENTS+' eventos (máximo)','error');return;}
        A.sel[ds]=1;
      }
      renderBodaAssign();
    });
  });
  document.getElementById('bodaAsgSave').addEventListener('click',function(){
    var c=A.couple;
    var mias=bodaClassesOfCouple(c.id);
    var libres=bodaFreeClasses();
    var nuevas=0,asignadas=0,soltadas=0;
    /* 1) Desasignar las que ya no estan seleccionadas */
    mias.forEach(function(ev){
      if(!A.sel[ev.start]){ev.boda.coupleId=null;ev.title='Ensayo boda';soltadas++;}
    });
    /* 2) Asignar / crear las seleccionadas */
    Object.keys(A.sel).forEach(function(ds){
      var yaMia=mias.some(function(ev){return ev.start===ds&&ev.boda.coupleId===c.id;});
      if(yaMia)return;
      var libre=null;
      for(var i=0;i<libres.length;i++){
        if(libres[i].start===ds&&!libres[i].boda.coupleId){libre=libres[i];break;}
      }
      if(libre){
        libre.boda.coupleId=c.id;
        if(!libre.boda.time)libre.boda.time=BODA_DEFAULT_TIME;
        libre.title='Ensayo — '+c.name;
        asignadas++;
      }else{
        if(bodaDayFull(ds))return;
        EVENTS.push(bodaNewClass(ds,BODA_DEFAULT_TIME,c.id,bodaPlaceForNewOn(ds)));
        nuevas++;
      }
    });
    saveEvents();updateEventsBtn();
    closeBodaAssign();
    setTimeout(function(){refreshEvents();},310);
    var partes=[];
    if(asignadas)partes.push(asignadas+' asignada'+(asignadas>1?'s':''));
    if(nuevas)partes.push(nuevas+' nueva'+(nuevas>1?'s':''));
    if(soltadas)partes.push(soltadas+' liberada'+(soltadas>1?'s':''));
    showToast(partes.length?('Clases: '+partes.join(', ')):'Sin cambios','success');
  });
}

/* ══ Modal: selector de sala para una clase ══ */
function openBodaPlacePicker(ev){
  if(!ev)return;
  var cur=bodaPlaceOf(ev);
  var h='<div class="ev-detail-overlay" id="bodaPpkOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaPpkClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">Sala — '+_bodaFmtCorto(ev.start)+'</div>';
  h+='<div style="width:36px"></div></div>';
  BODA_PLACE_LIST.forEach(function(p){
    h+='<button class="boda-cpk-row'+(cur===p.k?' sel':'')+'" data-place="'+p.k+'">'
      +'<span class="boda-cpk-name">'+escHtml(p.l)+'</span></button>';
  });
  h+='<button class="boda-cpk-row'+(cur?'':' sel')+'" data-place=""><span class="boda-cpk-name">Sin sala</span></button>';
  h+='</div></div>';
  bodaOpenSheet('bodaPpkWrap','bodaPpkOv',h,closeBodaPlacePicker);
  document.getElementById('bodaPpkClose').addEventListener('click',closeBodaPlacePicker);
  document.querySelectorAll('#bodaPpkOv [data-place]').forEach(function(b){
    b.addEventListener('click',function(){
      ev.boda=ev.boda||{};
      ev.boda.place=b.dataset.place;
      saveEvents();closeBodaPlacePicker();
      setTimeout(function(){refreshEvents();},310);
    });
  });
}
function closeBodaPlacePicker(){bodaCloseSheet('bodaPpkWrap','bodaPpkOv');}

/* ══ Modal: selector de pareja para una clase ══ */
function openBodaCouplePicker(ev){
  var cur=(typeof bodaEff==='function'?bodaEff(ev).coupleId:(ev.boda&&ev.boda.coupleId))||null;
  var h='<div class="ev-detail-overlay" id="bodaCpkOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaCpkClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">Pareja — '+_bodaFmtCorto(ev.start)+'</div>';
  h+='<div style="width:36px"></div></div>';
  var incompletas=BODA_COUPLES.filter(function(c){return bodaProgress(c).falta>0;});
  var completas=BODA_COUPLES.filter(function(c){return bodaProgress(c).falta<=0;});
  function row(c,extra){
    var p=bodaProgress(c);
    return '<button class="boda-cpk-row'+(cur===c.id?' sel':'')+'" data-cid="'+c.id+'">'
      +'<span class="boda-dot" style="background:'+c.color+'"></span>'
      +'<span class="boda-cpk-name">'+escHtml(c.name)+'</span>'
      +'<span class="boda-cpk-n">'+p.done+'/'+p.total+(extra?' · extra':'')+'</span></button>';
  }
  h+='<div class="boda-cpk-t">Con clases por asignar</div>';
  if(!incompletas.length)h+='<div class="sy-note">Ninguna pareja pendiente.</div>';
  incompletas.forEach(function(c){h+=row(c,false);});
  if(completas.length){
    h+='<div class="boda-cpk-t">Ya completas <span>(asignarles aquí cuenta como clase extra)</span></div>';
    completas.forEach(function(c){h+=row(c,true);});
  }
  h+='<div class="ev-detail-actions"><button class="ev-btn" id="bodaCpkNone">Dejar sin asignar</button></div>';
  h+='</div></div>';
  bodaOpenSheet('bodaCpkWrap','bodaCpkOv',h,closeBodaCouplePicker);
  function apply(cid){
    /* Queda pendiente hasta que se pulse Guardar (asi no se re-renderiza
       la lista entera y no se pierde el scroll) */
    bodaSetPending(ev.id,'coupleId',cid);
    if(cid&&!bodaEff(ev).time)bodaSetPending(ev.id,'time',BODA_DEFAULT_TIME);
    closeBodaCouplePicker();
    setTimeout(function(){bodaRefreshRow(ev);},310);
  }
  document.getElementById('bodaCpkClose').addEventListener('click',closeBodaCouplePicker);
  document.getElementById('bodaCpkNone').addEventListener('click',function(){apply(null);});
  document.querySelectorAll('.boda-cpk-row[data-cid]').forEach(function(b){
    b.addEventListener('click',function(){apply(b.dataset.cid);});
  });
}
function closeBodaCouplePicker(){bodaCloseSheet('bodaCpkWrap','bodaCpkOv');}

/* ══ Modal: hora (ruedas de horas y minutos + entrada manual) ══ */
var BODA_TIME_H = 18, BODA_TIME_M = 0;
var _BODA_HOURS=[],_BODA_MINS=[0,15,30,45];
(function(){for(var i=7;i<=23;i++)_BODA_HOURS.push(i);})();
function openBodaTimePicker(ev){
  var t=(typeof bodaEff==='function'?bodaEff(ev).time:(ev.boda&&ev.boda.time))||BODA_DEFAULT_TIME;
  BODA_TIME_H=parseInt(t.slice(0,2),10);BODA_TIME_M=parseInt(t.slice(3,5),10);
  if(isNaN(BODA_TIME_H))BODA_TIME_H=18;
  if(isNaN(BODA_TIME_M))BODA_TIME_M=0;
  function drum(id,vals,sel){
    var s='<div class="drum-wrap"><div class="drum-picker boda-drum" id="'+id+'">';
    s+='<div style="height:44px"></div>';
    vals.forEach(function(v){s+='<div class="drum-picker-item" data-val="'+v+'">'+String(v).padStart(2,'0')+'</div>';});
    s+='<div style="height:44px"></div></div><div class="drum-sel-lines"></div></div>';
    return s;
  }
  var h='<div class="ev-detail-overlay" id="bodaTpOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaTpClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">Hora de la clase</div>';
  h+='<div style="width:36px"></div></div>';
  h+='<div class="boda-tp-drums">'+drum('bodaTpH',_BODA_HOURS)+'<span class="boda-tp-sep">:</span>'+drum('bodaTpM',_BODA_MINS)+'</div>';
  h+='<div class="boda-tp-manual"><span>o escríbela:</span>';
  h+='<input type="number" id="bodaTpHi" min="0" max="23" value="'+BODA_TIME_H+'">';
  h+='<b>:</b><input type="number" id="bodaTpMi" min="0" max="59" step="15" value="'+String(BODA_TIME_M).padStart(2,'0')+'"></div>';
  h+='<div class="ev-detail-actions">';
  h+='<button class="ev-btn" id="bodaTpNone">Sin hora</button>';
  h+='<button class="ev-btn primary" id="bodaTpSave">Guardar</button>';
  h+='</div></div></div>';
  bodaOpenSheet('bodaTpWrap','bodaTpOv',h,closeBodaTimePicker);
  var IH=44;
  function setDrum(id,vals,val){
    var d=document.getElementById(id);if(!d)return;
    var i=vals.indexOf(val);if(i<0)i=0;
    d.scrollTop=i*IH;mark(d);
  }
  function mark(d){
    var idx=Math.round(d.scrollTop/IH);
    d.querySelectorAll('.drum-picker-item').forEach(function(it,j){it.classList.toggle('drum-selected',j===idx);});
  }
  function drumVal(id,vals){
    var d=document.getElementById(id);if(!d)return vals[0];
    return vals[Math.max(0,Math.min(vals.length-1,Math.round(d.scrollTop/IH)))];
  }
  ['bodaTpH','bodaTpM'].forEach(function(id){
    var d=document.getElementById(id);
    d.addEventListener('scroll',function(){
      mark(d);
      var hi=document.getElementById('bodaTpHi'),mi=document.getElementById('bodaTpMi');
      if(id==='bodaTpH')hi.value=drumVal('bodaTpH',_BODA_HOURS);
      else mi.value=String(drumVal('bodaTpM',_BODA_MINS)).padStart(2,'0');
    },{passive:true});
  });
  setTimeout(function(){
    setDrum('bodaTpH',_BODA_HOURS,BODA_TIME_H);
    setDrum('bodaTpM',_BODA_MINS,_BODA_MINS.indexOf(BODA_TIME_M)>=0?BODA_TIME_M:0);
  },30);
  /* Entrada manual: manda sobre las ruedas */
  var manual=false;
  document.getElementById('bodaTpHi').addEventListener('input',function(){manual=true;});
  document.getElementById('bodaTpMi').addEventListener('input',function(){manual=true;});
  function readManual(){
    var hh=parseInt(document.getElementById('bodaTpHi').value,10);
    var mm=parseInt(document.getElementById('bodaTpMi').value,10);
    if(isNaN(hh))hh=18;if(isNaN(mm))mm=0;
    return [Math.max(0,Math.min(23,hh)),Math.max(0,Math.min(59,mm))];
  }
  document.getElementById('bodaTpClose').addEventListener('click',closeBodaTimePicker);
  document.getElementById('bodaTpNone').addEventListener('click',function(){
    bodaSetPending(ev.id,'time',null);
    closeBodaTimePicker();setTimeout(function(){bodaRefreshRow(ev);},310);
  });
  document.getElementById('bodaTpSave').addEventListener('click',function(){
    var hh,mm;
    if(manual){var r=readManual();hh=r[0];mm=r[1];}
    else{hh=drumVal('bodaTpH',_BODA_HOURS);mm=drumVal('bodaTpM',_BODA_MINS);}
    bodaSetPending(ev.id,'time',String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'));
    closeBodaTimePicker();
    setTimeout(function(){bodaRefreshRow(ev);},310);
  });
}
function closeBodaTimePicker(){bodaCloseSheet('bodaTpWrap','bodaTpOv');}

/* ── Formulario de pareja ── */
function renderBodaCoupleForm(c){
  var isEdit=!!c;
  var col=isEdit?c.color:bodaNextColor();
  var h='<div class="ev-form-overlay" id="bodaCFormOv"><div class="ev-form-sheet">';
  h+='<div class="ev-form-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="bodaCClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar pareja':'Nueva pareja')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="bodaCDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Pareja</label><input class="ev-input" id="bodaCName" type="text" maxlength="40" placeholder="Ej: Marta y Juan" value="'+(isEdit?escHtml(c.name):'')+'"></div>';
  h+='<div class="ev-field"><label>Clases contratadas</label><input class="ev-input" id="bodaCNum" type="number" min="0" max="60" value="'+(isEdit?(c.contracted||0):4)+'"></div>';
  h+='<div class="ev-field"><label>&#128141; Día de la boda <span class="ev-note-scope">(solo se ve al asignar ensayos)</span></label>';
  h+='<input class="ev-input" id="bodaCWed" type="date" value="'+(isEdit&&c.weddingDate?c.weddingDate:'')+'"></div>';
  h+='<div class="ev-field"><label>Notas <span id="bodaCCnt" style="font-weight:400;color:var(--text-dim)">'+((isEdit&&c.note?c.note.length:0))+'/200</span></label>';
  h+='<textarea class="ev-textarea" id="bodaCNote" maxlength="200" placeholder="Notas de la pareja...">'+(isEdit&&c.note?escHtml(c.note):'')+'</textarea></div>';
  h+='<div class="ev-field"><label>&#127912; Color (aspas de arriba)'+(isEdit?'':' <span class="ev-note-scope">— asignado automáticamente</span>')+'</label>';
  h+=_renderColorPicker(col,false,false,'bodaCp');
  h+='</div>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="bodaCSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}
function openBodaCoupleForm(c){
  var ov=document.getElementById('eventsOverlay');
  var old=document.getElementById('bodaCWrap');if(old)old.remove();
  var wrap=document.createElement('div');wrap.id='bodaCWrap';
  wrap.innerHTML=renderBodaCoupleForm(c);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bodaCFormOv');if(fo)fo.classList.add('open');
  });
  var cp=_bindColorPicker(wrap,'bodaCp');
  var noteEl=document.getElementById('bodaCNote'),cnt=document.getElementById('bodaCCnt');
  noteEl.addEventListener('input',function(){cnt.textContent=noteEl.value.length+'/200';});
  document.getElementById('bodaCClose').addEventListener('click',closeBodaCoupleForm);
  var del=document.getElementById('bodaCDel');
  if(del)del.addEventListener('click',function(){
    /* Las clases de la pareja no se borran: quedan sin asignar */
    var afectadas=bodaClassesOfCouple(c.id);
    afectadas.forEach(function(ev){ev.boda.coupleId=null;ev.title='Ensayo boda';});
    saveEvents();
    BODA_COUPLES=BODA_COUPLES.filter(function(x){return x.id!==c.id;});
    saveBodas();closeBodaCoupleForm();
    setTimeout(function(){refreshEvents();showToast('Pareja eliminada ('+afectadas.length+' clases quedan sin asignar)','success');},310);
  });
  document.getElementById('bodaCSave').addEventListener('click',function(){
    var name=document.getElementById('bodaCName').value.trim();
    if(!name){showToast('El nombre de la pareja es obligatorio','error');return;}
    var num=parseInt(document.getElementById('bodaCNum').value,10);
    if(isNaN(num)||num<0)num=0;
    var data={name:name,contracted:num,
      weddingDate:document.getElementById('bodaCWed').value||null,
      note:document.getElementById('bodaCNote').value.trim(),color:cp.getColor()};
    if(c){
      for(var k in data)c[k]=data[k];
      /* Renombrar sus clases */
      bodaClassesOfCouple(c.id).forEach(function(ev){ev.title='Ensayo — '+c.name;});
      saveEvents();
    } else {
      data.id='bc-'+Date.now();data.createdAt=Date.now();BODA_COUPLES.push(data);
    }
    saveBodas();closeBodaCoupleForm();
    setTimeout(function(){refreshEvents();showToast(c?'Pareja actualizada':'Pareja creada','success');},310);
  });
}
function closeBodaCoupleForm(){
  var fo=document.getElementById('bodaCFormOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bodaCWrap');if(w)w.remove();},300);
}

/* Repinta SOLO la fila de una clase y el contador de la barra de guardado.
   Evita el re-render completo (que perdia el scroll) al tocar un campo. */
function bodaRefreshRow(ev){
  var fila=document.querySelector('.boda-class[data-id="'+ev.id+'"]');
  if(!fila){refreshEvents();return;}
  var e=bodaEff(ev),c=bodaCouple(e.coupleId);
  fila.classList.toggle('pend',!!BODA_PENDING[ev.id]);
  var mk=fila.querySelector('.boda-class-mark');
  if(mk)mk.innerHTML=bodaMarkFor(ev);
  var tb=fila.querySelector('.boda-time-btn');
  if(tb)tb.textContent=e.time||'--:--';
  var cb=fila.querySelector('.boda-couple-btn');
  if(cb){cb.textContent=c?c.name:'— asignar —';cb.style.color=c?c.color:'';}
  var pl=fila.querySelector('.boda-place');
  if(pl){
    if(pl.value!==e.place)pl.value=e.place;
    pl.classList.toggle('vacio',!e.place);
  }
  var bar=document.getElementById('bodaSaveBar');
  var n=bodaPendingCount();
  if(bar){
    bar.classList.toggle('vacia',!n);
    var lbl=document.getElementById('bodaSaveN');
    if(lbl)lbl.textContent=n?(' ('+n+')'):'';
  }
}

/* ── Binds de la pestaña ── */
function bindBodasEvents(){
  /* Al salir de la lista se guarda lo pendiente para no perderlo sin avisar */
  function _guardaPendientes(){
    if(bodaPendingCount())showToast(bodaPendingApply(true)+' cambios guardados','success');
  }
  document.querySelectorAll('.econ-sub-tab[data-bsub]').forEach(function(b){
    b.addEventListener('click',function(){
      _guardaPendientes();
      BODA_SUBTAB=b.dataset.bsub;
      /* El filtro "Por asignar" solo tiene sentido si queda alguna; si no,
         se entraba a una lista vacia */
      if(BODA_SUBTAB==='parejas'){
        var _hay=BODA_COUPLES.some(function(c){return bodaProgress(c).falta>0;});
        if(!_hay&&BODA_PAREJAS_FILTER==='incompletas')BODA_PAREJAS_FILTER='todas';
      }
      refreshEvents(false);
    });
  });
  function _bodaCalMove(d){
    BODA_CAL_MONTH+=d;
    if(BODA_CAL_MONTH<0){BODA_CAL_MONTH=11;BODA_CAL_YEAR--;}
    if(BODA_CAL_MONTH>11){BODA_CAL_MONTH=0;BODA_CAL_YEAR++;}
    refreshEvents();
  }
  var cp=document.getElementById('bodaCalPrev');
  if(cp)cp.addEventListener('click',function(){_bodaCalMove(-1);});
  var cn=document.getElementById('bodaCalNext');
  if(cn)cn.addEventListener('click',function(){_bodaCalMove(1);});
  /* Deslizar sobre la rejilla para cambiar de mes */
  var cg=document.getElementById('bodaCalGrid');
  if(cg&&typeof addSwipe==='function')addSwipe(cg,function(){_bodaCalMove(1);},function(){_bodaCalMove(-1);});
  /* Leyenda: resaltar los dias de una pareja (se mantiene al cambiar de mes) */
  document.querySelectorAll('.boda-cal-lg[data-hl]').forEach(function(b){
    b.addEventListener('click',function(){
      BODA_CAL_HL=(BODA_CAL_HL===b.dataset.hl)?null:b.dataset.hl;
      refreshEvents();
    });
  });
  document.querySelectorAll('.boda-mode-btn[data-bmode]').forEach(function(b){
    b.addEventListener('click',function(){_guardaPendientes();BODA_CLASS_MODE=b.dataset.bmode;refreshEvents();});
  });
  document.querySelectorAll('.boda-issue[data-issue]').forEach(function(b){
    b.addEventListener('click',function(){openBodaIssue(b.dataset.issue);});
  });
  document.querySelectorAll('.boda-chip[data-pfilter]').forEach(function(b){
    b.addEventListener('click',function(){BODA_PAREJAS_FILTER=b.dataset.pfilter;refreshEvents();});
  });
  var _ps=document.getElementById('bodaPSearch');
  if(_ps)_ps.addEventListener('input',function(){
    BODA_PAREJAS_SEARCH=this.value;
    clearTimeout(window._bodaPST);
    window._bodaPST=setTimeout(function(){
      refreshEvents();
      var el=document.getElementById('bodaPSearch');
      if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}
    },250);
  });
  document.querySelectorAll('.boda-chip[data-psort]').forEach(function(b){
    b.addEventListener('click',function(){
      var g=b.dataset.psort;
      if(g==='alfa')BODA_PAREJAS_SORT=(BODA_PAREJAS_SORT==='az')?'za':(BODA_PAREJAS_SORT==='za')?null:'az';
      else BODA_PAREJAS_SORT=(BODA_PAREJAS_SORT==='new')?'old':(BODA_PAREJAS_SORT==='old')?null:'new';
      refreshEvents();
    });
  });
  var addC=document.getElementById('bodaAddCouple');
  if(addC)addC.addEventListener('click',function(){openBodaCoupleForm(null);});
  /* Tarjeta de pareja: se despliega en su sitio y se vuelve a plegar al
     pulsarla otra vez. El boton de calendario sigue yendo a la asignacion. */
  document.querySelectorAll('.boda-card-tap[data-cid]').forEach(function(card){
    card.addEventListener('click',function(e){
      if(e.target.closest('.boda-assign,.boda-det-actions'))return;
      BODA_CARD_OPEN=(BODA_CARD_OPEN===card.dataset.cid)?null:card.dataset.cid;
      refreshEvents();
    });
  });
  document.querySelectorAll('.boda-c-edit[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openBodaCoupleForm(bodaCouple(b.dataset.cid));});
  });
  document.querySelectorAll('.boda-c-asig[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openBodaAssign(bodaCouple(b.dataset.cid),false);});
  });
  document.querySelectorAll('.boda-c-extra[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openBodaAssign(bodaCouple(b.dataset.cid),true);});
  });
  document.querySelectorAll('.boda-assign[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();openBodaAssign(bodaCouple(b.dataset.cid),false);
    });
  });
  var fc=document.getElementById('bodaFilterCouple');
  if(fc)fc.addEventListener('change',function(){BODA_FILTER_COUPLE=this.value;refreshEvents();});
  /* Interruptores de la lista: ocultar pasadas / ocultar cerrados */
  document.querySelectorAll('.boda-chip[data-btoggle]').forEach(function(b){
    b.addEventListener('click',function(){
      if(b.dataset.btoggle==='past')BODA_HIDE_PAST=!BODA_HIDE_PAST;
      else BODA_HIDE_CLOSED=!BODA_HIDE_CLOSED;
      refreshEvents();
    });
  });
  function findClass(id){for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id)return EVENTS[i];return null;}
  document.querySelectorAll('.boda-time-btn[data-id]').forEach(function(b){
    b.addEventListener('click',function(){var ev=findClass(b.dataset.id);if(ev)openBodaTimePicker(ev);});
  });
  document.querySelectorAll('.boda-couple-btn[data-id]').forEach(function(b){
    b.addEventListener('click',function(){var ev=findClass(b.dataset.id);if(ev)openBodaCouplePicker(ev);});
  });
  document.querySelectorAll('.boda-place[data-id]').forEach(function(sel){
    sel.addEventListener('change',function(){
      var ev=findClass(sel.dataset.id);if(!ev)return;
      bodaSetPending(ev.id,'place',sel.value);   /* '' = sin sala */
      bodaRefreshRow(ev);
    });
  });
  /* Cerrar / reabrir un dia (inmediato: cambia la lista y el filtro) */
  document.querySelectorAll('.boda-day-lock[data-lock]').forEach(function(b){
    b.addEventListener('click',function(){
      var ds=b.dataset.lock;
      bodaToggleClosed(ds);
      refreshEvents();
      showToast(bodaIsClosed(ds)?('Día cerrado — '+_bodaFmtCorto(ds)):('Día reabierto — '+_bodaFmtCorto(ds)),'success',
        function(){bodaToggleClosed(ds);refreshEvents();});
    });
  });
  /* Guardar / descartar los cambios pendientes */
  var _sv=document.getElementById('bodaSave');
  if(_sv)_sv.addEventListener('click',function(){
    if(!bodaPendingCount()){showToast('No hay cambios que guardar','error');return;}
    bodaPendingApply();updateEventsBtn();refreshEvents();
  });
  var _dc=document.getElementById('bodaDiscard');
  if(_dc)_dc.addEventListener('click',function(){
    if(!bodaPendingCount())return;
    bodaPendingDiscard();refreshEvents();
    showToast('Cambios descartados','success');
  });
  document.querySelectorAll('.boda-del[data-id]').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.dataset.id,removed=null;
      EVENTS=EVENTS.filter(function(e){if(e.id===id){removed=e;return false;}return true;});
      saveEvents();refreshEvents();
      showToast('Clase eliminada','success',function(){
        if(removed){EVENTS.push(removed);saveEvents();refreshEvents();}
      });
    });
  });
  document.querySelectorAll('.boda-day-add[data-ds]').forEach(function(b){
    b.addEventListener('click',function(){
      var ds=b.dataset.ds;
      if(bodaDayFull(ds)){showToast('Ese día ya tiene '+EV_MAX_DAY_EVENTS+' eventos (máximo)','error');return;}
      var cid=(BODA_FILTER_COUPLE!=='all'&&BODA_FILTER_COUPLE!=='none')?BODA_FILTER_COUPLE:null;
      EVENTS.push(bodaNewClass(ds,cid?BODA_DEFAULT_TIME:null,cid,bodaPlaceForNewOn(ds)));
      saveEvents();refreshEvents();
    });
  });
  var addCl=document.getElementById('bodaAddClass');
  if(addCl)addCl.addEventListener('click',function(){
    var dInp=document.getElementById('bodaAddDate');
    var ds=dInp&&dInp.value?dInp.value:evDk(new Date());
    if(bodaDayFull(ds)){showToast('Ese día ya tiene '+EV_MAX_DAY_EVENTS+' eventos (máximo)','error');return;}
    var cid=(BODA_FILTER_COUPLE!=='all'&&BODA_FILTER_COUPLE!=='none')?BODA_FILTER_COUPLE:null;
    EVENTS.push(bodaNewClass(ds,cid?BODA_DEFAULT_TIME:null,cid,bodaPlaceForNewOn(ds)));
    saveEvents();refreshEvents();
    showToast('Clase añadida el '+ds.slice(8)+'/'+ds.slice(5,7),'success');
  });
}
