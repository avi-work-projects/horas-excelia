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
var BODA_PLACE_SHORT = (function(){var o={};BODA_PLACE_LIST.forEach(function(p){o[p.k]=p.s;});return o;})();
var BODA_PLACES      = (function(){var o={};BODA_PLACE_LIST.forEach(function(p){o[p.k]=p.l;});return o;})();
function bodaPlaceOf(ev){
  var p=ev&&ev.boda&&ev.boda.place;
  return BODA_PLACE_SHORT[p]?p:BODA_PLACE_DEFAULT;
}

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
/* Lugar por defecto al crear otra clase el mismo dia: el de la clase de arriba */
function bodaPlaceForNewOn(ds){
  var same=bodaClassesOnDay(ds);
  if(same.length)return bodaPlaceOf(same[same.length-1]);
  return BODA_PLACE_DEFAULT;
}
function bodaDayFull(ds){
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

/* ── Estado de la pestaña ── */
var BODA_SUBTAB = 'clases';        /* 'clases' | 'parejas' */
var BODA_CLASS_MODE = 'ver';       /* 'ver' (consulta) | 'editar' */
var BODA_FILTER_COUPLE = 'all';
var BODA_HIDE_PAST = true;
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
  var h='<div class="econ-sub-tabs">';
  [['clases','Clases'],['parejas','Parejas'],['calendario','Calendario']].forEach(function(t){
    h+='<button class="econ-sub-tab'+(BODA_SUBTAB===t[0]?' active':'')+'" data-bsub="'+t[0]+'">'+t[1]+'</button>';
  });
  h+='</div>';
  h+='<div class="boda-sec">';
  h+=(BODA_SUBTAB==='parejas')?_renderBodaParejas()
    :(BODA_SUBTAB==='calendario')?_renderBodaCalendario():_renderBodaClases();
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
  var list=BODA_COUPLES.filter(function(c){
    var p=bodaProgress(c);
    if(BODA_PAREJAS_FILTER==='incompletas')return p.falta>0;
    if(BODA_PAREJAS_FILTER==='completas')return p.falta===0;
    return true;
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
    h+='<div class="boda-card boda-card-tap" data-cid="'+c.id+'">';
    h+='<div class="boda-card-hd">';
    h+='<span class="boda-dot" style="background:'+c.color+'"></span>';
    h+='<span class="boda-name">'+escHtml(c.name)+'</span>';
    if(c.weddingDate)h+='<span class="boda-wed-tag">&#128141; '+_bodaFmt(c.weddingDate)+'</span>';
    h+='<button class="boda-mini-btn boda-assign" data-cid="'+c.id+'" title="Asignar clases">&#128197;</button>';
    h+='</div>';
    h+='<div class="boda-prog"><div class="boda-prog-bar" style="width:'+pct+'%;background:'+c.color+'"></div></div>';
    h+='<div class="boda-card-ft"><span>'+p.done+' / '+(p.total||0)+' clases</span>'+falta+'</div>';
    if(c.note)h+='<div class="boda-card-note">'+escHtml(c.note)+'</div>';
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
    if(BODA_FILTER_COUPLE==='all')return true;
    if(BODA_FILTER_COUPLE==='none')return !(ev.boda&&ev.boda.coupleId);
    return ev.boda&&ev.boda.coupleId===BODA_FILTER_COUPLE;
  });
  var sinAsignar=all.filter(function(ev){return !(ev.boda&&ev.boda.coupleId);}).length;
  var sinHora=all.filter(function(ev){return !(ev.boda&&ev.boda.time);}).length;
  var h='';
  /* Conmutador Consulta / Edicion */
  h+='<div class="boda-mode-row">';
  h+='<button class="boda-mode-btn'+(edit?'':' active')+'" data-bmode="ver">&#128065; Consulta</button>';
  h+='<button class="boda-mode-btn'+(edit?' active':'')+'" data-bmode="editar">&#9998; Edición</button>';
  h+='</div>';
  h+='<div class="boda-summary">';
  h+='<div class="boda-sum-item"><b>'+all.length+'</b><span>clases</span></div>';
  h+='<div class="boda-sum-item'+(sinAsignar?' warn':'')+'"><b>'+sinAsignar+'</b><span>sin pareja</span></div>';
  h+='<div class="boda-sum-item'+(sinHora?' warn':'')+'"><b>'+sinHora+'</b><span>sin hora</span></div>';
  h+='</div>';
  h+='<div class="boda-controls">';
  h+='<select class="ev-types-select" id="bodaFilterCouple">';
  h+='<option value="all"'+(BODA_FILTER_COUPLE==='all'?' selected':'')+'>Todas las parejas</option>';
  h+='<option value="none"'+(BODA_FILTER_COUPLE==='none'?' selected':'')+'>Sin asignar</option>';
  BODA_COUPLES.forEach(function(c){
    h+='<option value="'+c.id+'"'+(BODA_FILTER_COUPLE===c.id?' selected':'')+'>'+escHtml(c.name)+'</option>';
  });
  h+='</select>';
  h+='<label class="ev-types-past-label"><input type="checkbox" id="bodaHidePast"'+(BODA_HIDE_PAST?' checked':'')+'> Ocultar pasadas</label>';
  h+='</div>';
  if(!list.length){
    h+='<div class="sy-note">No hay clases'+(BODA_HIDE_PAST?' futuras':'')+'. Créalas marcando días en el Calendario 1 mes, o con el botón de abajo.</div>';
  }
  var byDay={},order=[];
  list.forEach(function(ev){if(!byDay[ev.start]){byDay[ev.start]=[];order.push(ev.start);}byDay[ev.start].push(ev);});
  order.forEach(function(ds){
    h+='<div class="boda-day">';
    h+='<div class="boda-day-hd">'+_bodaFmtCorto(ds)
      +'<span class="boda-day-n">'+byDay[ds].length+' clase'+(byDay[ds].length>1?'s':'')+'</span>';
    if(edit)h+='<button class="boda-mini-btn boda-day-add" data-ds="'+ds+'" title="Añadir clase este día">+</button>';
    h+='</div>';
    byDay[ds].forEach(function(ev){
      var b=ev.boda||{};
      var c=bodaCouple(b.coupleId);
      if(!edit){
        /* Consulta: fila limpia, sin controles */
        h+='<div class="boda-class boda-class-ro" data-id="'+ev.id+'">';
        h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
        h+='<span class="boda-ro-time'+(b.time?'':' none')+'">'+(b.time||'--:--')+'</span>';
        h+='<span class="boda-ro-couple"'+(c?' style="color:'+c.color+'"':'')+'>'+(c?escHtml(c.name):'sin asignar')+'</span>';
        h+='<span class="boda-ro-place">'+escHtml(BODA_PLACE_SHORT[bodaPlaceOf(ev)])+'</span>';
        h+='</div>';
        return;
      }
      h+='<div class="boda-class" data-id="'+ev.id+'">';
      h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
      h+='<button class="boda-inp boda-time-btn" data-id="'+ev.id+'">'+(b.time||'--:--')+'</button>';
      h+='<button class="boda-inp boda-couple-btn" data-id="'+ev.id+'"'+(c?' style="color:'+c.color+'"':'')+'>'
        +(c?escHtml(c.name):'— asignar —')+'</button>';
      h+='<select class="boda-inp boda-place" data-id="'+ev.id+'">';
      BODA_PLACE_LIST.forEach(function(p){
        h+='<option value="'+p.k+'"'+(bodaPlaceOf(ev)===p.k?' selected':'')+'>'+escHtml(p.s)+'</option>';
      });
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
  return h;
}

/* ══ Modal: detalle de pareja (días y horas asignados) ══ */
function openBodaCoupleDetail(c){
  if(!c)return;
  var cls=bodaClassesOfCouple(c.id);
  var p=bodaProgress(c);
  var h='<div class="ev-detail-overlay" id="bodaDetOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">';
  h+='<button class="sy-back" id="bodaDetClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">Pareja</div>';
  h+='<button class="ev-list-btn boda-det-btn" id="bodaDetEdit" style="font-size:.8rem;padding:6px 12px">&#9998; Editar</button>';
  h+='</div>';
  h+='<div class="ev-detail-color-bar" style="background:'+c.color+'"></div>';
  h+='<div class="ev-detail-title" style="color:'+c.color+'">'+escHtml(c.name)+'</div>';
  h+='<div class="boda-det-meta">'+p.done+' / '+p.total+' clases'
    +(p.falta>0?(' · <span class="boda-falta">faltan '+p.falta+'</span>')
      :(p.done>p.total?(' · <span class="boda-sobra">+'+(p.done-p.total)+' extra</span>'):' · <span class="boda-ok">completa</span>'))+'</div>';
  if(c.weddingDate)h+='<div class="ev-detail-date">&#128141; Boda: '+_bodaFmt(c.weddingDate)+'</div>';
  if(c.note)h+='<div class="ev-detail-note">'+escHtml(c.note)+'</div>';
  h+='<div class="boda-det-list-t">Clases asignadas</div>';
  if(!cls.length)h+='<div class="sy-note">Todavía no tiene clases asignadas.</div>';
  cls.forEach(function(ev){
    var b=ev.boda||{};
    h+='<div class="boda-det-row">';
    h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
    h+='<span class="boda-det-day">'+_bodaFmtCorto(ev.start)+'</span>';
    h+='<span class="boda-ro-time'+(b.time?'':' none')+'">'+(b.time||'--:--')+'</span>';
    h+='<span class="boda-ro-place">'+escHtml(BODA_PLACE_SHORT[bodaPlaceOf(ev)])+'</span>';
    h+='</div>';
  });
  h+='<div class="boda-det-actions">';
  h+='<button class="ev-btn boda-det-btn" id="bodaDetAssign">&#128197; Asignar clases</button>';
  h+='<button class="ev-btn boda-det-btn" id="bodaDetExtra">&#10133; Clase extra</button>';
  h+='</div>';
  h+='</div></div>';
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='bodaDetWrap';wrap.innerHTML=h;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bodaDetOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeBodaCoupleDetail();});}
  });
  document.getElementById('bodaDetClose').addEventListener('click',closeBodaCoupleDetail);
  document.getElementById('bodaDetEdit').addEventListener('click',function(){
    closeBodaCoupleDetail();setTimeout(function(){openBodaCoupleForm(c);},310);
  });
  document.getElementById('bodaDetAssign').addEventListener('click',function(){
    closeBodaCoupleDetail();setTimeout(function(){openBodaAssign(c,false);},310);
  });
  document.getElementById('bodaDetExtra').addEventListener('click',function(){
    closeBodaCoupleDetail();setTimeout(function(){openBodaAssign(c,true);},310);
  });
}
function closeBodaCoupleDetail(){
  var fo=document.getElementById('bodaDetOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bodaDetWrap');if(w)w.remove();},300);
}

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
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='bodaAsgWrap';
  wrap.innerHTML='<div class="ev-detail-overlay" id="bodaAsgOv"><div class="ev-detail-sheet" id="bodaAsgSheet"></div></div>';
  ov.appendChild(wrap);
  renderBodaAssign();
  requestAnimationFrame(function(){
    var fo=document.getElementById('bodaAsgOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeBodaAssign();});}
  });
}
function closeBodaAssign(){
  var fo=document.getElementById('bodaAsgOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bodaAsgWrap');if(w)w.remove();BODA_ASSIGN=null;},300);
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

/* ══ Modal: selector de pareja para una clase ══ */
function openBodaCouplePicker(ev){
  var cur=(ev.boda&&ev.boda.coupleId)||null;
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
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='bodaCpkWrap';wrap.innerHTML=h;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bodaCpkOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeBodaCouplePicker();});}
  });
  function apply(cid){
    ev.boda=ev.boda||{};
    ev.boda.coupleId=cid;
    var c=bodaCouple(cid);
    ev.title=c?('Ensayo — '+c.name):'Ensayo boda';
    if(cid&&!ev.boda.time)ev.boda.time=BODA_DEFAULT_TIME;
    saveEvents();closeBodaCouplePicker();
    setTimeout(function(){refreshEvents();},310);
  }
  document.getElementById('bodaCpkClose').addEventListener('click',closeBodaCouplePicker);
  document.getElementById('bodaCpkNone').addEventListener('click',function(){apply(null);});
  document.querySelectorAll('.boda-cpk-row[data-cid]').forEach(function(b){
    b.addEventListener('click',function(){apply(b.dataset.cid);});
  });
}
function closeBodaCouplePicker(){
  var fo=document.getElementById('bodaCpkOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bodaCpkWrap');if(w)w.remove();},300);
}

/* ══ Modal: hora (ruedas de horas y minutos + entrada manual) ══ */
var BODA_TIME_H = 18, BODA_TIME_M = 0;
var _BODA_HOURS=[],_BODA_MINS=[0,15,30,45];
(function(){for(var i=7;i<=23;i++)_BODA_HOURS.push(i);})();
function openBodaTimePicker(ev){
  var t=(ev.boda&&ev.boda.time)||BODA_DEFAULT_TIME;
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
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='bodaTpWrap';wrap.innerHTML=h;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bodaTpOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeBodaTimePicker();});}
  });
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
    ev.boda=ev.boda||{};ev.boda.time=null;saveEvents();
    closeBodaTimePicker();setTimeout(function(){refreshEvents();},310);
  });
  document.getElementById('bodaTpSave').addEventListener('click',function(){
    var hh,mm;
    if(manual){var r=readManual();hh=r[0];mm=r[1];}
    else{hh=drumVal('bodaTpH',_BODA_HOURS);mm=drumVal('bodaTpM',_BODA_MINS);}
    ev.boda=ev.boda||{};
    ev.boda.time=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    saveEvents();closeBodaTimePicker();
    setTimeout(function(){refreshEvents();},310);
  });
}
function closeBodaTimePicker(){
  var fo=document.getElementById('bodaTpOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bodaTpWrap');if(w)w.remove();},300);
}

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
      data.id='bc-'+Date.now();BODA_COUPLES.push(data);
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

/* ── Binds de la pestaña ── */
function bindBodasEvents(){
  document.querySelectorAll('.econ-sub-tab[data-bsub]').forEach(function(b){
    b.addEventListener('click',function(){BODA_SUBTAB=b.dataset.bsub;refreshEvents();});
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
    b.addEventListener('click',function(){BODA_CLASS_MODE=b.dataset.bmode;refreshEvents();});
  });
  document.querySelectorAll('.boda-chip[data-pfilter]').forEach(function(b){
    b.addEventListener('click',function(){BODA_PAREJAS_FILTER=b.dataset.pfilter;refreshEvents();});
  });
  var addC=document.getElementById('bodaAddCouple');
  if(addC)addC.addEventListener('click',function(){openBodaCoupleForm(null);});
  /* Tarjeta de pareja: abre su detalle. El boton de calendario, la asignacion. */
  document.querySelectorAll('.boda-card-tap[data-cid]').forEach(function(card){
    card.addEventListener('click',function(e){
      if(e.target.closest('.boda-assign'))return;
      openBodaCoupleDetail(bodaCouple(card.dataset.cid));
    });
  });
  document.querySelectorAll('.boda-assign[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();openBodaAssign(bodaCouple(b.dataset.cid),false);
    });
  });
  var fc=document.getElementById('bodaFilterCouple');
  if(fc)fc.addEventListener('change',function(){BODA_FILTER_COUPLE=this.value;refreshEvents();});
  var hp=document.getElementById('bodaHidePast');
  if(hp)hp.addEventListener('change',function(){BODA_HIDE_PAST=this.checked;refreshEvents();});
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
      ev.boda=ev.boda||{};ev.boda.place=sel.value||BODA_PLACE_DEFAULT;
      saveEvents();refreshEvents();
    });
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
