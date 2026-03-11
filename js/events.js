/* ============================================================
   EVENTS — Ventana de eventos y notas
   ============================================================ */

var EV_STORAGE_KEY = 'excelia-events-v1';
var EV_YEAR = new Date().getFullYear();
var EV_MONTH = new Date().getMonth();
var EV_VIEW = 'cal';  // 'cal' | 'months' | 'upcoming' | 'annual'
var EV_EDIT = null;
var EV_FORM_CONTAINER = null;  // overlay donde se renderiza el formulario (null = eventsOverlay)
var EV_ANNUAL_ADD = false;
var EV_ANNUAL_VIEW = 'puentes'; // 'puentes' | 'fiestas'
var EV_ANNUAL_FILTER_HIDDEN = []; // type names hidden from annual calendar
var EV_PREV_VIEW = null;       // para volver al anual al pulsar ←
var EV_QUAD_YEAR = new Date().getFullYear();  // año de inicio del bloque 4 meses
var EV_QUAD_MONTH = new Date().getMonth();    // mes de inicio del bloque 4 meses (0-based)
var EV_LIST_SUBTAB = 'months'; // 'months' | 'types'
var EV_TYPES_FILTER = 'all';   // 'all' | nombre de tipo
var EV_TYPES_PAST = true;      // excluir eventos pasados en Por Tipos (por defecto)
var EV_COLORS = ['#38bdf8','#1d4ed8','#34d399','#fb923c','#ff6b6b','#c084fc','#a3e635'];
var EV_COLOR_TYPES = {
  '#38bdf8':'Viaje',
  '#6c8cff':'Viaje',  // compat con eventos anteriores
  '#1d4ed8':'Asturias',
  '#34d399':'Recordatorio de Gestiones',
  '#fb923c':'Planes y Quedadas',
  '#ff6b6b':'Otros',
  '#c084fc':'Otros',
  '#a3e635':'Otros',
  '#fbbf24':'Cumpleaños VIP'
};

var EVENTS = (function(){
  try{
    var stored=localStorage.getItem(EV_STORAGE_KEY);
    if(stored){var arr=JSON.parse(stored);if(Array.isArray(arr)){
      // Migrar eventos amarillos de 'Otros' → lima (#a3e635). VIP bdays mantienen amarillo.
      var changed=false;
      arr.forEach(function(ev){
        if(ev.color==='#fbbf24'&&(!ev.id||ev.id.indexOf('ev-bday-vip-')!==0)){ev.color='#a3e635';changed=true;}
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

function evDk(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

/* ── Lógica de repetición ────────────────────────────────── */
function eventOccursOn(ev,ds){
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
  // Multi-day events (non-repeating, end strictly after start)
  var multiEvs=EVENTS.filter(function(ev){return !ev.repeat&&ev.end&&ev.end>ev.start;});
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
        var _rawName=ev.title.replace(/^\u2b50\s*/,'').replace(/^Cumple\s+/,'');
        var _bTitle=_isVipBday?escHtml(_rawName.split(/\s+/)[0]):escHtml(ev.title);
        var _bStyle=_isVipBday
          ?'color:#fff;border-color:#fbbf24;border-width:2px;background:#fbbf24cc;box-shadow:0 0 8px rgba(251,191,36,.55)'
          :'color:#fff;border-color:'+ev.color+';background:'+ev.color+'cc';
        h+='<div class="ev-badge" data-id="'+ev.id+'" style="'+_bStyle+'">'+_bTitle+'</div>';
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
        h+='<div class="ev-multi-bar'+sc+'" data-id="'+ev.id+'"'
          +' style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';border:1.5px solid '+ev.color+';background:'+ev.color+'cc;color:#fff'+(hasInM?'':';opacity:.35')+'">'
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
  var fd2=function(dd){return String(dd.getDate()).padStart(2,'0')+'/'+String(dd.getMonth()+1).padStart(2,'0')+'/'+dd.getFullYear();};
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
  var h='<div class="ev-list-item" data-id="'+ev.id+'">';
  h+='<div class="ev-list-color" style="background:'+ev.color+'"></div>';
  h+='<div class="ev-list-body">';
  h+='<div class="ev-list-title">'+escHtml(ev.title)+'</div>';
  if(ev.note)h+='<div class="ev-list-note">'+escHtml(ev.note)+'</div>';
  h+='<div class="ev-list-meta">'+(EV_COLOR_TYPES[ev.color]||'Otros')+' \u00b7 '+dateStr+repeatStr+'</div>';
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
function renderEvUpcoming(){
  if(!EVENTS.length)return '<div class="sy-note">No hay eventos creados. Pulsa \"+ A\u00f1adir\" para crear uno.</div>';
  var today=new Date();today.setHours(0,0,0,0);
  var wd=today.getDay();var off=wd===0?6:wd-1;
  var wk0=new Date(today);wk0.setDate(wk0.getDate()-off);
  var weekLabels=['Esta semana','Pr\u00f3xima semana','En dos semanas'];
  var fd2=function(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');};
  // Collect events per week (Map: id → {ev, firstDate})
  var weeks=[{},{},{}];
  for(var w=0;w<3;w++){
    for(var d=0;d<7;d++){
      var day=new Date(wk0.getTime()+(w*7+d)*86400000);
      var ds=evDk(day);
      var evs=getEventsOn(ds);
      evs.forEach(function(ev){
        if(!weeks[w][ev.id])weeks[w][ev.id]={ev:ev,firstDate:new Date(day)};
      });
    }
  }
  var anyEvents=weeks.some(function(wk){return Object.keys(wk).length>0;});
  // Si no hay eventos en las 3 semanas actuales, buscar la primera semana futura con eventos
  if(!anyEvents){
    var fallbackMap=null,fallbackLabel=null;
    for(var fw=3;fw<53;fw++){
      var fwMap={};
      for(var fd3=0;fd3<7;fd3++){
        var fday=new Date(wk0.getTime()+(fw*7+fd3)*86400000);
        var fds=evDk(fday);
        var fevs=getEventsOn(fds);
        fevs.forEach(function(ev){if(!fwMap[ev.id])fwMap[ev.id]={ev:ev,firstDate:new Date(fday)};});
      }
      if(Object.keys(fwMap).length>0){
        fallbackMap=fwMap;
        var fwStart=new Date(wk0.getTime()+fw*7*86400000);
        var fwEnd=new Date(fwStart);fwEnd.setDate(fwEnd.getDate()+6);
        fallbackLabel='Semana del '+fwStart.getDate()+'/'+(fwStart.getMonth()+1)+' al '+fwEnd.getDate()+'/'+(fwEnd.getMonth()+1);
        break;
      }
    }
    if(!fallbackMap)return '<div class="sy-note">No hay eventos pr\u00f3ximos programados.</div>';
    var h='<div class="sy-note" style="margin-bottom:8px">Sin eventos en las pr\u00f3ximas 3 semanas. Primera semana con eventos:</div>';
    var fids=Object.keys(fallbackMap);
    fids.sort(function(a,b){return fallbackMap[a].firstDate-fallbackMap[b].firstDate;});
    h+='<div class="sy-month-sep">'+fallbackLabel+'</div>';
    h+='<div class="ev-upcoming-section">';
    fids.forEach(function(id){
      var item=fallbackMap[id];var ev=item.ev;
      var type=EV_COLOR_TYPES[ev.color]||'Otros';
      var diffToday=Math.round((item.firstDate-today)/86400000);
      h+='<div class="ev-upcoming-item" data-id="'+ev.id+'">';
      h+='<div class="ev-upcoming-color" style="background:'+ev.color+'"></div>';
      h+='<div class="ev-upcoming-info">';
      h+='<div class="ev-upcoming-title">'+escHtml(ev.title)+'</div>';
      h+='<div class="ev-upcoming-meta">'+type+' \u00b7 '+fd2(item.firstDate)+'</div>';
      h+='</div>';
      h+='<div class="ev-upcoming-lbl">En '+diffToday+'d</div>';
      h+='</div>';
    });
    h+='</div>';
    return h;
  }
  var h='';
  weeks.forEach(function(wkMap,wi){
    var ids=Object.keys(wkMap);
    if(!ids.length)return;
    ids.sort(function(a,b){return wkMap[a].firstDate-wkMap[b].firstDate;});
    h+='<div class="sy-month-sep">'+weekLabels[wi]+'</div>';
    h+='<div class="ev-upcoming-section">';
    ids.forEach(function(id){
      var item=wkMap[id];
      var ev=item.ev;
      var type=EV_COLOR_TYPES[ev.color]||'Otros';
      var diffToday=Math.round((item.firstDate-today)/86400000);
      var isToday=diffToday===0;
      var lbl=isToday?'Hoy':diffToday===1?'Ma\u00f1ana':diffToday<0?'En curso':('En '+diffToday+'d');
      var lblCls='ev-upcoming-lbl'+(isToday?' today-lbl':diffToday===1?' near':diffToday<0?' ongoing':'');
      h+='<div class="ev-upcoming-item'+(isToday?' ev-upcoming-today':'')+'" data-id="'+ev.id+'">';
      h+='<div class="ev-upcoming-color" style="background:'+ev.color+'"></div>';
      h+='<div class="ev-upcoming-info">';
      h+='<div class="ev-upcoming-title">'+escHtml(ev.title)+'</div>';
      h+='<div class="ev-upcoming-meta">'+type+' \u00b7 '+fd2(item.firstDate)+'</div>';
      h+='</div>';
      h+='<div class="'+lblCls+'">'+lbl+'</div>';
      h+='</div>';
    });
    h+='</div>';
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
    return EV_ANNUAL_FILTER_HIDDEN.indexOf(EV_COLOR_TYPES[ev.color]||'Otros')===-1;
  }
  var multiEvs=EVENTS.filter(function(ev){return !ev.repeat&&ev.end&&ev.end>ev.start&&annEvVisible(ev);});
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  var MNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var addMode=EV_ANNUAL_ADD;
  var h='<div class="ev-annual-grid'+(addMode?' ev-annual-pick-mode':'')+'">';
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
        var cls='ev-annual-day'+(inM?'':' out-m')+(isT?' ann-today':'')+puenteCls+fiestasCls;
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
            _annSd='<div class="ev-annual-xs">';
            _singleEvs.forEach(function(ev){_annSd+='<span class="ev-annual-x" style="color:'+ev.color+'"></span>';});
            _vipBdays.forEach(function(){_annSd+='<span class="ev-annual-vip-star">\u2b50</span>';});
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
          h+='<div class="ev-annual-mbar'+sc+'" style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';border:1px solid '+it.ev.color+';background:'+it.ev.color+'cc"></div>';
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
    return EV_ANNUAL_FILTER_HIDDEN.indexOf(EV_COLOR_TYPES[ev.color]||'Otros')===-1;
  }
  // Eventos multi-día para el rango de 4 meses
  var rangeStart=new Date(months[0].y,months[0].m,1);
  var lastMo=months[3];
  var rangeEnd=new Date(lastMo.y,lastMo.m+1,0);
  var multiEvs=EVENTS.filter(function(ev){
    if(ev.repeat||!ev.end||ev.end<=ev.start||!annEvVisible(ev))return false;
    var es=new Date(ev.start+'T00:00:00'),ee=new Date(ev.end+'T00:00:00');
    return ee>=rangeStart&&es<=rangeEnd;
  });
  var multiIds={};multiEvs.forEach(function(ev){multiIds[ev.id]=true;});
  var MNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var addMode=EV_ANNUAL_ADD;
  var vipHidden=EV_ANNUAL_FILTER_HIDDEN.indexOf('Cumpleaños VIP')!==-1;
  var h='<div class="ev-annual-grid ev-quad-grid'+(addMode?' ev-annual-pick-mode':'')+'">';
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
        var cls='ev-annual-day'+(inM?'':' out-m')+(isT?' ann-today':'')+puenteCls+fiestasCls;
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
            _quadSd='<div class="ev-annual-xs">';
            _singleEvs.forEach(function(ev){_quadSd+='<span class="ev-annual-x" style="color:'+ev.color+'"></span>';});
            _vipBdays.forEach(function(){_quadSd+='<span class="ev-annual-vip-star">\u2b50</span>';});
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
          h+='<div class="ev-annual-mbar'+sc+'" style="grid-column:'+(it.cs+1)+'/'+(it.ce+2)+';grid-row:'+(it.row+1)+';border:1px solid '+it.ev.color+';background:'+it.ev.color+'cc;font-size:.3rem;padding:0 3px">'+(showQT?escHtml(it.ev.title):'')+'</div>';
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
  var typeOrder=['Viaje','Asturias','Recordatorio de Gestiones','Planes y Quedadas','Cumple\u00f1os VIP','Otros'];
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
    var evEnd=ev.end?new Date(ev.end+'T00:00:00'):new Date(ev.start+'T00:00:00');
    if(EV_TYPES_PAST&&!ev.repeat&&evEnd<today)return;
    var type=EV_COLOR_TYPES[ev.color]||'Otros';
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

/* ── Render: contenido principal ────────────────────────── */
function renderEvContent(){
  var h=renderNavBar('events');
  // Tabs a nivel 2 (sticky top:42px, justo bajo la nav bar)
  h+='<div class="ev-hdr-sub">';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='upcoming'?' active':'')+'" id="evViewUpcoming">Pr\u00f3ximos<br>Eventos</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='cal'?' active':'')+'" id="evViewCal">Calendario<br>1 mes</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='quad'?' active':'')+'" id="evViewQuad">Calendario<br>4 meses</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='annual'?' active':'')+'" id="evViewAnnual">Calendario<br>Anual</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='months'?' active':'')+'" id="evViewMonths">Lista de<br>Eventos</button>';
  h+='</div>';
  // Header a nivel 3 (with-tabs → top:82px)
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="evBack">&#8592;</button>';
  if(EV_VIEW==='upcoming'){
    h+='<div class="sy-year-nav"><div class="sy-year">Pr\u00f3ximos</div></div>';
  } else if(EV_VIEW==='months'){
    h+='<div class="sy-year-nav"><div class="sy-year">Eventos</div></div>';
  } else if(EV_VIEW==='quad'){
    var _qMNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var _qm3=(EV_QUAD_MONTH+3)%12,_qy3=EV_QUAD_YEAR+Math.floor((EV_QUAD_MONTH+3)/12);
    var _qLabel=_qMNS[EV_QUAD_MONTH]+' '+EV_QUAD_YEAR+' \u2014 '+_qMNS[_qm3]+' '+_qy3;
    h+='<div class="sy-year-nav">';
    h+='<button class="sy-nav" id="evQuadPrev2">\u00ab</button>';
    h+='<button class="sy-nav" id="evPrev">&#9664;</button>';
    h+='<div class="sy-year" style="font-size:.72rem">'+_qLabel+'</div>';
    h+='<button class="sy-nav" id="evNext">&#9654;</button>';
    h+='<button class="sy-nav" id="evQuadNext2">\u00bb</button>';
    h+='</div>';
    h+='<button class="today-btn" id="evToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  } else {
    h+='<div class="sy-year-nav"><button class="sy-nav" id="evPrev">&#9664;</button>';
    if(EV_VIEW==='annual')h+='<div class="sy-year">'+EV_YEAR+'</div>';
    else h+='<div class="sy-year">'+MN[EV_MONTH]+' '+EV_YEAR+'</div>';
    h+='<button class="sy-nav" id="evNext">&#9654;</button></div>';
    h+='<button class="today-btn" id="evToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  }
  h+='</div>';
  h+='<div class="sy-body">';
  if(EV_VIEW==='annual'||EV_VIEW==='quad'){
    var _typeOrder=['Viaje','Asturias','Recordatorio de Gestiones','Planes y Quedadas','Otros','Cumpleaños VIP'];
    var _typeShort={'Viaje':'Viaje','Asturias':'Asturias','Recordatorio de Gestiones':'Gestiones','Planes y Quedadas':'Planes','Otros':'Otros','Cumpleaños VIP':'\u2b50VIP'};
    var _typeColor={'Viaje':'#38bdf8','Asturias':'#1d4ed8','Recordatorio de Gestiones':'#34d399','Planes y Quedadas':'#fb923c','Otros':'#ff6b6b','Cumpleaños VIP':'#fbbf24'};
    h+='<div class="ev-annual-controls">';
    var _vdLabels={'puentes':'\uD83C\uDF09 Puentes','fiestas':'\uD83D\uDCC5 Vac + Festivos','vacaciones':'\uD83C\uDFD6 Solo vacaciones','festivos':'\uD83C\uDF8C Solo festivos','none':'\u2715 Nada'};
    var _curVdLabel=_vdLabels[EV_ANNUAL_VIEW]||_vdLabels['none'];
    h+='<div class="ev-annual-view-toggle">';
    h+='<div class="ev-ann-vd-wrap" id="evAnnVdWrap">';
    h+='<button class="ev-ann-vd-btn" id="evAnnVdBtn">\uD83D\uDC41 '+_curVdLabel+' \u25be</button>';
    h+='<div class="ev-ann-vd-menu" id="evAnnVdMenu">';
    [['puentes','\uD83C\uDF09 Solo puentes'],['fiestas','\uD83D\uDCC5 Vac + festivos'],['vacaciones','\uD83C\uDFD6 Solo vacaciones'],['festivos','\uD83C\uDF8C Solo festivos'],['none','\u2715 No ver nada']].forEach(function(opt){
      var active=EV_ANNUAL_VIEW===opt[0];
      h+='<button class="ev-ann-vd-opt'+(active?' active':'')+'" data-view="'+opt[0]+'">'+opt[1]+'</button>';
    });
    h+='</div></div>';
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
  else if(EV_VIEW==='annual')h+=renderEvAnnual();
  else if(EV_VIEW==='quad')h+=renderEvQuad();
  else h+=renderEvMonthsView();
  h+='<div class="ev-io-row">';
  var _isPickView=EV_VIEW==='annual'||EV_VIEW==='quad';
  var addLabel=_isPickView&&EV_ANNUAL_ADD?'&#10006; Cancelar':'+ A\u00f1adir';
  h+='<button class="ev-io-btn'+(_isPickView&&EV_ANNUAL_ADD?' ev-add-pick-mode':'')+'" id="evAdd">'+addLabel+'</button>';
  h+='<button class="ev-io-btn" id="evExport">&#8595; Exportar</button>';
  h+='<button class="ev-io-btn" id="evImport">&#8593; Importar</button>';
  h+='<input type="file" id="evImportFile" accept=".json" style="display:none">';
  h+='</div>';
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
  h+='<div class="ev-detail-color-bar" style="background:'+ev.color+'"></div>';
  h+='<div class="ev-detail-title" style="color:'+ev.color+'">'+escHtml(ev.title)+'</div>';
  h+='<div style="font-size:.72rem;font-weight:600;color:'+ev.color+';opacity:.8;margin-bottom:4px">'+(EV_COLOR_TYPES[ev.color]||'Otros')+'</div>';
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
  var fromSummary=(ov.id==='summaryOverlay');
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
        if(!fromSummary)closeEvents();
        setTimeout(function(){
          openBday();
          setTimeout(function(){openBdayForm(b);},350);
        },330);
        return;
      }
    }
    if(fromSummary){
      // Abrir el formulario directamente sobre el resumen (sin navegar a eventos)
      setTimeout(function(){openEvForm(ev,null,document.getElementById('summaryOverlay'));},300);
    } else {
      setTimeout(function(){openEvForm(ev);},300);
    }
  });
  if(fromSummary){
    document.getElementById('evDGoCal').addEventListener('click',function(){
      var evYear=parseInt(ev.start.slice(0,4),10);
      var evMonth=parseInt(ev.start.slice(5,7),10)-1;
      closeEvDetail();
      closeSummary();
      NAV_BACK=function(){closeEvents();setTimeout(openSummary,330);};
      setTimeout(function(){
        EV_YEAR=evYear;EV_MONTH=evMonth;EV_VIEW='cal';
        openEventsAt();
      },350);
    });
  }
  document.getElementById('evDDel').addEventListener('click',function(){
    var deleted=ev;
    var deletedIdx=-1;
    for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===deleted.id){deletedIdx=i;break;}}
    EVENTS=EVENTS.filter(function(e){return e.id!==deleted.id;});
    saveEvents();updateEventsBtn();
    closeEvDetail();
    if(fromSummary){
      setTimeout(function(){
        document.getElementById('summaryContent').innerHTML=renderSummaryContent();
        bindSummaryEvents();
        showToast('Evento eliminado','success',function(){
          if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
          saveEvents();updateEventsBtn();
          document.getElementById('summaryContent').innerHTML=renderSummaryContent();
          bindSummaryEvents();
        });
      },320);
    } else {
      setTimeout(function(){
        refreshEvents();
        showToast('Evento eliminado','success',function(){
          if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
          saveEvents();updateEventsBtn();refreshEvents();
        });
      },320);
    }
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
  h+='<div class="ev-field"><label>Tipo</label><div class="ev-type-picker">';
  EV_COLORS.forEach(function(c){
    var typeName=EV_COLOR_TYPES[c]||'Otros';
    var sel=c===color?' selected':'';
    h+='<div class="ev-color-swatch'+sel+'" data-hex="'+c+'" style="color:'+c+'">';
    h+='<div class="ev-type-dot" style="background:'+c+'"></div>';
    h+='<span class="ev-type-name">'+typeName+'</span>';
    h+='</div>';
  });
  h+='</div></div>';
  h+='<div class="ev-field ev-date-row">';
  h+='<div><label>Inicio</label><input class="ev-input" id="evFStart" type="date" value="'+start+'"></div>';
  h+='<div><label>Fin</label><input class="ev-input" id="evFEnd" type="date" value="'+end+'"></div>';
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

function bindEvFormEvents(){
  document.getElementById('evFClose').addEventListener('click',closeEvForm);
  var noteEl=document.getElementById('evFNote');
  var cntEl=document.getElementById('evCharCnt');
  noteEl.addEventListener('input',function(){cntEl.textContent=noteEl.value.length+'/200';});
  document.querySelectorAll('.ev-color-swatch').forEach(function(sw){
    sw.addEventListener('click',function(){
      document.querySelectorAll('.ev-color-swatch').forEach(function(s){s.classList.remove('selected');});
      sw.classList.add('selected');
    });
  });
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
      var fromSummaryForm=(EV_FORM_CONTAINER&&EV_FORM_CONTAINER.id==='summaryOverlay');
      closeEvForm();
      setTimeout(function(){
        if(fromSummaryForm){
          document.getElementById('summaryContent').innerHTML=renderSummaryContent();
          bindSummaryEvents();
          showToast('Evento eliminado','success',function(){
            if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
            saveEvents();updateEventsBtn();
            document.getElementById('summaryContent').innerHTML=renderSummaryContent();
            bindSummaryEvents();
          });
        }else{
          refreshEvents();
          showToast('Evento eliminado','success',function(){
            if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
            saveEvents();updateEventsBtn();refreshEvents();
          });
        }
      },320);
    });
  }
  document.getElementById('evFSave').addEventListener('click',function(){
    var title=document.getElementById('evFTitle').value.trim();
    if(!title){showToast('El t\u00edtulo es obligatorio','error');return;}
    var note=document.getElementById('evFNote').value.trim();
    var colorSel=document.querySelector('.ev-color-swatch.selected');
    var color=colorSel?colorSel.dataset.hex:EV_COLORS[0];
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
    if(EV_EDIT){
      var idx=-1;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===EV_EDIT.id){idx=i;break;}}
      if(idx!==-1)EVENTS[idx]={id:EV_EDIT.id,title:title,note:note,color:color,start:start,end:end,repeat:repeat};
      showToast('Evento actualizado','success');
    }else{
      EVENTS.push({id:'ev-'+Date.now(),title:title,note:note,color:color,start:start,end:end,repeat:repeat});
      showToast('Evento a\u00f1adido','success');
    }
    saveEvents();updateEventsBtn();
    var fromSummaryForm=(EV_FORM_CONTAINER&&EV_FORM_CONTAINER.id==='summaryOverlay');
    closeEvForm();
    setTimeout(function(){
      if(fromSummaryForm){
        document.getElementById('summaryContent').innerHTML=renderSummaryContent();
        bindSummaryEvents();
      }else{refreshEvents();}
    },320);
  });
}

/* ── Apertura/cierre de la ventana ──────────────────────── */
function openEvents(){
  NAV_BACK=null;
  var now=new Date();EV_YEAR=now.getFullYear();EV_MONTH=now.getMonth();EV_VIEW='upcoming';
  var ov=document.getElementById('eventsOverlay');
  document.getElementById('eventsContent').innerHTML=renderEvContent();
  ov.style.display='block';
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
  ov.style.display='block';
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
  var prevBtn=document.getElementById('evPrev');
  if(prevBtn)prevBtn.addEventListener('click',function(){
    if(EV_VIEW==='annual'){EV_YEAR--;}
    else if(EV_VIEW==='quad'){EV_QUAD_MONTH--;if(EV_QUAD_MONTH<0){EV_QUAD_MONTH=11;EV_QUAD_YEAR--;}}
    else{EV_MONTH--;if(EV_MONTH<0){EV_MONTH=11;EV_YEAR--;}}
    refreshEvents();
  });
  var nextBtn=document.getElementById('evNext');
  if(nextBtn)nextBtn.addEventListener('click',function(){
    if(EV_VIEW==='annual'){EV_YEAR++;}
    else if(EV_VIEW==='quad'){EV_QUAD_MONTH++;if(EV_QUAD_MONTH>11){EV_QUAD_MONTH=0;EV_QUAD_YEAR++;}}
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
  var todayBtn=document.getElementById('evToday');
  if(todayBtn)todayBtn.addEventListener('click',function(){
    var n=new Date();EV_YEAR=n.getFullYear();EV_MONTH=n.getMonth();
    EV_QUAD_YEAR=n.getFullYear();EV_QUAD_MONTH=n.getMonth();
    refreshEvents();
  });
  document.getElementById('evViewUpcoming').addEventListener('click',function(){EV_VIEW='upcoming';EV_ANNUAL_ADD=false;refreshEvents();});
  document.getElementById('evViewCal').addEventListener('click',function(){EV_VIEW='cal';EV_ANNUAL_ADD=false;EV_PREV_VIEW=null;refreshEvents();});
  document.getElementById('evViewQuad').addEventListener('click',function(){EV_VIEW='quad';EV_ANNUAL_ADD=false;refreshEvents();});
  document.getElementById('evViewAnnual').addEventListener('click',function(){EV_VIEW='annual';EV_ANNUAL_ADD=false;refreshEvents();});
  document.getElementById('evViewMonths').addEventListener('click',function(){EV_VIEW='months';EV_ANNUAL_ADD=false;refreshEvents();});
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
  document.getElementById('evAdd').addEventListener('click',function(){
    if(EV_VIEW==='annual'||EV_VIEW==='quad'){EV_ANNUAL_ADD=!EV_ANNUAL_ADD;refreshEvents();}
    else{openEvForm(null);}
  });
  // Click en mes del calendario anual/quad: navegar o seleccionar día (modo añadir)
  document.querySelectorAll('.ev-annual-month[data-month]').forEach(function(card){
    card.addEventListener('click',function(e){
      if(EV_ANNUAL_ADD&&e.target.dataset.ds){
        var ds=e.target.dataset.ds;
        EV_ANNUAL_ADD=false;
        openEvForm(null,ds);
      } else if(!EV_ANNUAL_ADD){
        EV_MONTH=parseInt(card.dataset.month);
        if(card.dataset.year)EV_YEAR=parseInt(card.dataset.year);
        EV_PREV_VIEW=EV_VIEW==='quad'?'quad':'annual';
        EV_VIEW='cal';
        refreshEvents();
      }
    });
  });
  // Click en badges del calendario → detail (no edit)
  document.querySelectorAll('.ev-badge[data-id]').forEach(function(badge){
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
      openEvForm(null,cell.dataset.ds);
    });
  });
  // Click en items de próximos → detail
  document.querySelectorAll('.ev-upcoming-item[data-id]').forEach(function(item){
    item.addEventListener('click',function(){
      var id=item.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
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
  document.querySelectorAll('.ev-list-btn.del').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var id=btn.dataset.id;
      EVENTS=EVENTS.filter(function(e){return e.id!==id;});
      saveEvents();updateEventsBtn();refreshEvents();
      showToast('Evento eliminado','success');
    });
  });
  document.getElementById('evExport').addEventListener('click',function(){
    if(!EVENTS.length){showToast('No hay eventos para exportar','error');return;}
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(EVENTS,null,2));
    a.download='eventos.json';a.click();
  });
  document.getElementById('evImport').addEventListener('click',function(){document.getElementById('evImportFile').click();});
  document.getElementById('evImportFile').addEventListener('change',function(e){
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
}
