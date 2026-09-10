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
  try{var r=appStorage.getItem(BODAS_SK);if(r){var a=JSON.parse(r);if(Array.isArray(a))return a;}}catch(e){}
  return [];
})();
function saveBodas(){try{appStorage.setItem(BODAS_SK,JSON.stringify(BODA_COUPLES));}catch(e){}}

/* Lugar de la clase — el orden es el del desplegable.
   `n` es el nombre y se ve IGUAL en todas partes (selector, fila de clase,
   ficha, avisos). `d` es la aclaracion, que sale en gris solo donde hay sitio.
   Antes habia dos textos por sala y la misma opcion se leia distinta segun
   la pantalla. */
var BODA_PLACE_LIST = [
  {k:'sala',  n:'Sala',         d:'la sala de confianza'},
  {k:'casa',  n:'Casa',         d:'en nuestra casa'},
  {k:'pareja',n:'Casa (pareja)',d:'en casa de la pareja'},
  {k:'otro',  n:'Otro',         d:'en otro sitio'}
];
var BODA_PLACE_DEFAULT = 'casa';
/* Sala SIN ASIGNAR: se guarda como cadena vacia para poder distinguirla de
   "el campo no existe" (clases antiguas), que sigue cayendo en Casa. */
var BODA_PLACE_NONE = '';
var BODA_PLACE_SHORT = (function(){var o={};BODA_PLACE_LIST.forEach(function(p){o[p.k]=p.n;});return o;})();
var BODA_PLACE_DESC  = (function(){var o={};BODA_PLACE_LIST.forEach(function(p){o[p.k]=p.d;});return o;})();
/* Emoji del lugar: de un vistazo se distingue casa de sala */
var BODA_PLACE_EMOJI = {sala:'\ud83c\udfe2', casa:'\ud83c\udfe0', pareja:'\ud83c\udfe1', otro:'\ud83d\udccd'};
function bodaPlaceEmoji(k){
  if(k===BODA_PLACE_NONE||k==null)return '\u2753';
  return BODA_PLACE_EMOJI[k]||'\ud83d\udccd';
}
function bodaPlaceOf(ev){
  var p=(ev&&ev.boda)?ev.boda.place:undefined;
  if(p===BODA_PLACE_NONE)return BODA_PLACE_NONE;   /* elegido "sin asignar" */
  return p!==undefined?p:BODA_PLACE_DEFAULT;
}
function bodaPlaceLabel(k){return k?(BODA_PLACE_SHORT[k]||'Sala archivada'):'Sin sala';}

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
  return BODA_RENDER_CLASSES||EVENTS.filter(function(ev){return getEvType(ev)==='Ensayos boda';});
}
/* Dia de la primera clase de una pareja (null si aun no tiene) */
function bodaPrimeraClase(cid){
  var cls=bodaClassesOfCouple(cid);
  return cls.length?cls[0].start:null;
}
function bodaClassesOfCouple(id){
  return bodaSortClasses(bodaClasses().filter(function(ev){return ev.boda&&ev.boda.coupleId===id;}));
}
function bodaFreeClasses(){
  return bodaSortClasses(bodaClasses().filter(function(ev){return !(ev.boda&&ev.boda.coupleId);}));
}
function bodaClaseById(id){
  for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id)return EVENTS[i];
  return null;
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
function bodaNewClass(ds,time,coupleId,place,duration,durationId){
  return {
    id:'ev-boda-'+Date.now()+'-'+Math.floor(Math.random()*10000),
    title:coupleId?('Ensayo — '+((bodaCouple(coupleId)||{}).name||'')):'Ensayo boda',
    note:'', color:evTypeColor('puntual','Ensayos boda'),
    kind:'puntual', type:'Ensayos boda',
    start:ds, end:ds, repeat:null,
    boda:{coupleId:coupleId||null, time:time||null, place:place==null?BODA_PLACE_DEFAULT:place,duration:duration||bodaDefaultDuration().minutes,durationId:durationId||bodaDefaultDuration().id}
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
        c.boda.duration=bodaDuration(ev);c.boda.durationId=(bodaDurationOf(ev)||{}).id||null;
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
  if(same.length){var last=bodaPlaceOf(same[same.length-1]);if(BODA_PLACE_LIST.some(function(p){return p.k===last&&p.active!==false;}))return last;}
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
  try{var r=appStorage.getItem(BODA_CLOSED_SK);if(r){var o=JSON.parse(r);if(o&&typeof o==='object')return o;}}catch(e){}
  return {};
})();
function saveBodaClosed(){try{appStorage.setItem(BODA_CLOSED_SK,JSON.stringify(BODA_CLOSED));}catch(e){}}
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
    duration:bodaDuration(ev),durationId:(bodaDurationOf(ev)||{}).id||null,
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
var BODA_CLASES_SEARCH = '';   /* buscador de pareja en la subpestana Clases */
var BODA_HIDE_PAST = true;
var BODA_HIDE_CLOSED = false;
var BODA_CARD_OPEN = null;   /* id de la pareja desplegada en su tarjeta */
var BODA_PAREJAS_SEARCH = '';
/* null = como siempre (las mas recientes arriba). Cada chip da la vuelta:
   A-Z -> Z-A -> sin orden. Solo puede haber una regla a la vez. */
var BODA_PAREJAS_SORT = 'boda';   /* 'az' | 'za' | 'new' | 'old' | null */
var BODA_PAREJAS_CLASSES = null; /* null | incompletas | completas */
var BODA_PAREJAS_FILTER = 'activas';  /* 'incompletas' | 'todas' | 'completas' */
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
  h+='<div class="boda-cal-month">'+MN[m]+' '+y+'</div>';
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
/* ── Render: pestaña Bodas ── */
function _renderBodasBody(){
  /* Subpestanas y el conmutador Consulta/Edicion viven en el MISMO bloque
     sticky: asi los dos quedan fijos arriba al hacer scroll sin tener que
     hardcodear el "top" del segundo (que se desalineaba entre dispositivos). */
  var h='<div class="boda-sticky-hd">';
  h+='<div class="econ-sub-tabs">';
  [['clases','Clases'],['parejas','Parejas'],['calendario','Calendario'],['stats','Estadísticas']].forEach(function(t){
    h+='<button class="econ-sub-tab'+(BODA_SUBTAB===t[0]?' active':'')+'" data-bsub="'+t[0]+'">'+t[1]+'</button>';
  });
  h+='<button class="boda-config-btn" id="bodaConfigBtn" aria-label="Configurar Bodas">&#9881;</button>';
  h+='</div>';
  if(BODA_SUBTAB==='clases'){
    var edit=(BODA_CLASS_MODE==='editar');
    h+='<div class="boda-mode-row">';
    h+='<button class="boda-mode-btn'+(edit?'':' active')+'" data-bmode="ver">&#128065; Consulta</button>';
    h+='<button class="action-edit boda-mode-btn'+(edit?' active':'')+'" data-bmode="editar">&#9998; Edición</button>';
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
/* Compara dos fechas 'YYYY-MM-DD'; las vacias van siempre al final, tanto
   ascendente como descendente (si no, ordenar al reves las subiria arriba). */
function _bodaCmpFecha(x,y,desc){
  if(!x&&!y)return 0;
  if(!x)return 1;
  if(!y)return -1;
  return x<y?(desc?1:-1):x>y?(desc?-1:1):0;
}
function _renderBodaParejas(){
  var h='<div class="boda-pfilters"><div class="boda-filter-label">Fecha de la boda</div><div class="boda-chips">';
  [['activas','Activas'],['pasadas','Pasadas'],['todas','Todas']].forEach(function(o){
    var count=BODA_COUPLES.filter(function(c){return bodaMatchesDate(c,o[0]);}).length;
    h+='<button class="boda-chip'+(BODA_PAREJAS_FILTER===o[0]?' active':'')+'" data-pfilter="'+o[0]+'">'+o[1]+'<b>'+count+'</b></button>';
  });
  h+='</div><div class="boda-filter-label">Asignaci&oacute;n de clases <span>(opcional)</span></div><div class="boda-chips">';
  [['incompletas','Clases por asignar'],['completas','Clases Cerradas']].forEach(function(o){
    var count=BODA_COUPLES.filter(function(c){return bodaMatchesDate(c,BODA_PAREJAS_FILTER)&&bodaMatchesClasses(c,o[0]);}).length;
    h+='<button class="boda-chip'+(BODA_PAREJAS_CLASSES===o[0]?' active':'')+'" data-pclasses="'+o[0]+'" aria-pressed="'+(BODA_PAREJAS_CLASSES===o[0])+'">'+o[1]+'<b>'+count+'</b></button>';
  });
  h+='</div></div>';
  h+='<div class="bday-search-wrap boda-search"><input class="bday-search-input" id="bodaPSearch" type="text" '
    +'placeholder="Buscar pareja\u2026" value="'+escHtml(BODA_PAREJAS_SEARCH)+'"></div>';
  h+='<div class="boda-chips boda-sort-chips">';
  var _sa=(BODA_PAREJAS_SORT==='az')?' A\u2191':(BODA_PAREJAS_SORT==='za')?' Z\u2193':'';
  var _sf=(BODA_PAREJAS_SORT==='new')?' recientes' : (BODA_PAREJAS_SORT==='old')?' antiguas' : '';
  var _sb=(BODA_PAREJAS_SORT==='boda')?' \u2191':(BODA_PAREJAS_SORT==='boda-desc')?' \u2193':'';
  var _sc=(BODA_PAREJAS_SORT==='clase')?' \u2191':(BODA_PAREJAS_SORT==='clase-desc')?' \u2193':'';
  h+='<button class="boda-chip'+(_sa?' active':'')+'" data-psort="alfa">Alfab\u00e9tico'+_sa+'</button>';
  h+='<button class="boda-chip'+(_sf?' active':'')+'" data-psort="fecha">Creaci\u00f3n'+_sf+'</button>';
  h+='<button class="boda-chip'+(_sb?' active':'')+'" data-psort="boda">Boda'+_sb+'</button>';
  h+='<button class="boda-chip'+(_sc?' active':'')+'" data-psort="clase">1.\u00aa clase'+_sc+'</button>';
  h+='</div>';
  var _q=BODA_PAREJAS_SEARCH.trim().toLowerCase();
  var list=BODA_COUPLES.filter(function(c){
    var p=bodaProgress(c);
    if(_q&&String(c.name||'').toLowerCase().indexOf(_q)===-1)return false;
    if(!bodaMatchesDate(c,BODA_PAREJAS_FILTER)||!bodaMatchesClasses(c,BODA_PAREJAS_CLASSES))return false;
    return true;
  }).sort(function(a,b){
    if(BODA_PAREJAS_SORT==='az')return String(a.name||'').localeCompare(String(b.name||''),'es');
    if(BODA_PAREJAS_SORT==='za')return String(b.name||'').localeCompare(String(a.name||''),'es');
    if(BODA_PAREJAS_SORT==='old')return bodaCreatedAt(a)-bodaCreatedAt(b);
    if(BODA_PAREJAS_SORT==='new')return bodaCreatedAt(b)-bodaCreatedAt(a);
    /* Por fecha de boda o de primera clase: las que no tienen, al final */
    if(BODA_PAREJAS_SORT==='boda'||BODA_PAREJAS_SORT==='boda-desc')
      return _bodaCmpFecha(a.weddingDate,b.weddingDate,BODA_PAREJAS_SORT==='boda-desc');
    if(BODA_PAREJAS_SORT==='clase'||BODA_PAREJAS_SORT==='clase-desc')
      return _bodaCmpFecha(bodaPrimeraClase(a.id),bodaPrimeraClase(b.id),BODA_PAREJAS_SORT==='clase-desc');
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
    /* Editar, junto al nombre. El 📅 que habia aqui era el mismo "Asignar"
       de la tarjeta desplegada; con dos puertas a lo mismo sobra una. */
    h+='<button class="action-edit boda-mini-btn boda-c-edit boda-hd-edit" data-cid="'+c.id+'" title="Editar pareja">&#9998;</button>';
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
        h+='<button class="action-edit boda-mini-btn boda-cl-edit" data-id="'+ev.id+'" title="Editar esta clase">&#9998;</button>';
        h+='</div>';
      });
      h+='<div class="boda-det-actions boda-det-actions-row">';
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
    var q=BODA_CLASES_SEARCH.trim().toLowerCase();
    if(!q)return true;
    var c=bodaCouple(ev.boda&&ev.boda.coupleId);
    if(!c)return 'sin asignar'.indexOf(q)!==-1;
    return String(c.name||'').toLowerCase().indexOf(q)!==-1;
  });
  var h=_renderBodaIssueCards();
  /* Filtros: un desplegable con forma de chip para la pareja y dos
     interruptores del mismo estilo que los chips de Parejas */
  h+='<div class="boda-filters">';
  h+='<div class="boda-buscar-bar">';
  h+='<div class="bday-search-wrap boda-search"><input class="bday-search-input" id="bodaClSearch" '
    +'type="text" placeholder="Buscar pareja\u2026" value="'+escHtml(BODA_CLASES_SEARCH)+'"></div>';
  h+='<button class="bday-io-btn bday-io-btn-add" id="bodaAddClass">+ A\u00f1adir</button>';
  h+='</div>';
  /* Mismo formato que "Excluir pasados" o "Solo libres" de Vacaciones Festivos */
  h+='<div class="excl-row">';
  h+='<label class="excl-item"><input type="checkbox" id="bodaShowPast"'+(BODA_HIDE_PAST?'':' checked')+'> Ver pasadas</label>';
  /* La casilla se pinta del verde de las tarjetas que destapa. */
  h+='<label class="excl-item"><input type="checkbox" style="--chk:var(--c-green)" id="bodaShowClosed"'
    +(BODA_HIDE_CLOSED?'':' checked')+'> Ver días cerrados</label>';
  h+='</div>';
  h+='</div>';
  if(!list.length){
    h+='<div class="sy-note">No hay clases'+(BODA_HIDE_PAST?' futuras':'')+'. Créalas marcando días en el Calendario 1 mes, o con el botón de abajo.</div>';
  }
  var byDay={},order=[];
  list.forEach(function(ev){if(!byDay[ev.start]){byDay[ev.start]=[];order.push(ev.start);}byDay[ev.start].push(ev);});
  order.forEach(function(ds){
    var cerrado=bodaIsClosed(ds);
    var pasado=(ds<today);
    /* Cerrado no es lo mismo que pasado: cerrado es un dia RESUELTO. Antes
       salia atenuado y con la palabra en rojo, y se leia como pasado.
       El gris del pasado manda sobre el verde del cerrado: un dia que ya ha
       ocurrido no esta pendiente de nada, lo hayan cerrado o no. */
    var tono=pasado?' pasado':(cerrado?' cerrado':'');
    h+='<div class="boda-day'+tono+'" data-day="'+ds+'">';
    h+='<div class="boda-day-hd">'+_bodaFmtCorto(ds)
      +'<span class="boda-day-n">'+byDay[ds].length+' clase'+(byDay[ds].length>1?'s':'')+'</span>'
      +(cerrado?('<span class="boda-day-cerr" title="Día cerrado: no admite más clases">'
        +'\u2714\ufe0f\ud83d\udd12</span>'):'');
    if(edit){
      h+='<button class="boda-mini-btn boda-day-lock'+(cerrado?' on':'')+'" data-lock="'+ds+'" title="'
        +(cerrado?'Reabrir el día':'Cerrar el día (no admite más clases)')+'">'
        +(cerrado?'&#128274;':'&#128275;')+'</button>';
      if(!cerrado)h+='<button class="boda-mini-btn boda-day-add" data-ds="'+ds+'" title="Añadir clase este día">+</button>';
    }
    h+='</div>';
    byDay[ds].forEach(function(ev,_iCl){
      var b=bodaEff(ev);
      var c=bodaCouple(b.coupleId);
      if(!edit){
        /* Consulta: fila limpia, sin controles. En amarillo si le falta la
           hora o la sala — el mismo criterio que el aviso "info incompleta". */
        var _falta=!!(b.coupleId&&(!b.time||!bodaPlaceOf(ev)));
        h+='<div class="boda-class boda-class-ro'+(_falta?' incompleta':'')+'" data-id="'+ev.id+'">';
        h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
        h+='<span class="boda-ro-time'+(b.time?'':' none')+'">'+(b.time||'--:--')+'</span>';
        h+='<span class="boda-ro-couple">'
          +(c?('<span class="ev-bpunto" style="background:'+c.color+'"></span><span>'+escHtml(c.name)+'</span>')
             :'<span class="boda-ro-sin">sin asignar</span>')+'</span>';
        h+='<span class="boda-ro-place'+(b.place?'':' vacio')+'">'+escHtml(bodaPlaceLabel(b.place))+'</span>';
        h+='<button class="action-edit boda-mini-btn boda-cl-edit" data-id="'+ev.id+'" title="Editar esta clase">&#9998;</button>';
        h+='</div>';
        return;
      }
      h+='<div class="boda-class'+(BODA_PENDING[ev.id]?' pend':'')+'" data-id="'+ev.id+'">';
      h+='<span class="boda-class-mark">'+bodaMarkFor(ev)+'</span>';
      h+='<button class="boda-inp boda-time-btn" data-id="'+ev.id+'">'+(b.time||'--:--')+'</button>';
      h+='<button class="boda-inp boda-couple-btn" data-id="'+ev.id+'">'
        +(c?('<span class="ev-bpunto" style="background:'+c.color+'"></span><span>'+escHtml(c.name)+'</span>')
           :'<span class="boda-ro-sin">— asignar —</span>')
        +'</button>';
      h+='<button class="boda-inp boda-place-btn'+(b.place?'':' vacio')+'" data-id="'+ev.id+'">'
        +escHtml(b.place?BODA_PLACE_SHORT[b.place]:'Sin sala')+'</button>';
      h+='<button class="boda-mini-btn boda-del" data-id="'+ev.id+'">×</button>';
      h+='</div>';
      /* Entre dos clases seguidas, el intercambio de parejas. En un dia
         cerrado no sale: un dia cerrado esta resuelto. */
      if(!cerrado&&_iCl<byDay[ds].length-1){
        h+='<div class="boda-swap-row"><button class="boda-swap" title="Intercambiar las parejas de estos dos huecos"'
          +' data-a="'+ev.id+'" data-b="'+byDay[ds][_iCl+1].id+'">⇅</button></div>';
      }
    });
    h+='</div>';
  });
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
