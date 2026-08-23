/* ============================================================
   EVENTS RENDER - Las listas de la ventana de eventos: Proximos, Todos,
   la agenda semanal y el armazon de la ventana (renderEvContent).

   Los calendarios viven en events-cal.js.

   Todo lo de aqui son funciones puras: reciben el estado global y
   devuelven HTML. Por eso se pueden comparar con las instantaneas de
   tools/test.js.
   ============================================================ */
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
    s+='<div class="ev-up-right-top">';
    s+='<span class="ev-upcoming-bell'+(_bellSet?' set':'')+'">&#128276;</span>';
    s+='<div class="'+lblCls+'">'+lbl+'</div>';
    s+='</div>';
    /* La tarjeta abre la alarma; este boton es la unica via a la ficha de
       detalle (editar, borrar y, en un ensayo, hora/sala/pareja). */
    if(!_isVip)s+='<button type="button" class="ev-up-info" data-info="'+ev.id+'">+ info</button>';
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
  /* Solo interesa lo mas cercano primero; el orden inverso se quito */
  if(EV_LIST_SORT==='fecha-desc')EV_LIST_SORT='fecha';
  [['fecha','Por fecha'],['categoria','Por categoría']].forEach(function(o){
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
    lista.sort(function(a,b){
      if(a.start===b.start)return 0;
      return a.start<b.start?-1:1;
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
  // Zona A: Proximos + Vacaciones/Festivos (esta ultima agrupa Puentes y
  // Vac/Festivos en subpestanas)
  h+='<div class="ev-view-zone ev-zone-a">';
  var _upActive=(EV_VIEW==='upcoming'||EV_VIEW==='months');
  h+='<button class="ev-view-toggle'+(_upActive?' active':'')+'" id="evViewUpcoming">Pr\u00f3ximos</button>';
  var _toActive=(EV_VIEW==='puentes'||EV_VIEW==='time-off');
  h+='<button class="ev-view-toggle ev-btn-timeoff ev-btn-split'+(_toActive?' active':'')+'" id="evViewTimeOff">Vacaciones<br>Festivos</button>';
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
  // Zona C: Bodas + Rutinas
  h+='<div class="ev-view-zone ev-zone-c">';
  h+='<button class="ev-view-toggle ev-btn-bodas'+(EV_VIEW==='bodas'?' active':'')+'" id="evViewBodas">Bodas</button>';
  h+='<button class="ev-view-toggle ev-btn-rutinas'+(EV_VIEW==='rutinas'?' active':'')+'" id="evViewRutinas">Rutinas</button>';
  h+='</div>';
  h+='</div>';
  // Header a nivel 3 (with-tabs → top:82px)
  var _hdrCenterCls=' sy-header-center';
  h+='<div class="sy-header with-tabs'+_hdrCenterCls+'">';
  h+='<button class="sy-back" id="evBack">&#8592;</button>';
  if(EV_VIEW==='upcoming'){
    h+='<div class="sy-year-nav"><div class="sy-year">Eventos</div></div>';
  } else if(EV_VIEW==='week'){
    h+='<div class="sy-year-nav"><button class="sy-nav" id="evPrev">&#9664;</button>';
    h+='<div class="sy-year sy-year-2line">'+MN[EV_MONTH]+'<span class="sy-year-sub">'+EV_YEAR+'</span></div>';
    h+='<button class="sy-nav" id="evNext">&#9654;</button></div>';
    h+='<button class="ev-bright-btn ev-bright-mid'+(EV_BRIGHT_PAST?' on':'')+'" id="evBright">\uD83D\uDCA1</button>';
    h+='<div class="sy-hdr-right"><button class="today-btn" id="evToday" style="font-size:.65rem;padding:4px 10px">Hoy</button></div>';
  } else if(EV_VIEW==='months'){
    h+='<div class="sy-year-nav"><div class="sy-year">Eventos</div></div>';
  } else if(EV_VIEW==='rutinas'){
    h+='<div class="sy-year-nav"><div class="sy-year">Rutinas</div></div>';
  } else if(EV_VIEW==='bodas'){
    h+='<div class="sy-year-nav"><div class="sy-year">Bodas</div></div>';
  } else if(EV_VIEW==='puentes'||EV_VIEW==='time-off'){
    h+='<div class="sy-year-nav"><button class="sy-nav" id="evPrev">&#9664;</button><div class="sy-year">'+EV_YEAR+'</div><button class="sy-nav" id="evNext">&#9654;</button></div>';
    h+='<div class="sy-hdr-right"><button class="sy-pdf" id="evSyPdf">PDF</button></div>';
  } else if(EV_VIEW==='quad'){
    var _qMNS=MN_SHORT;
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
      /* Exportar solo los eventos se quito: el backup completo del menu de
         ajustes ya los lleva. Importar se queda para los ficheros antiguos. */
      h+='<button class="ev-io-btn" id="evImport">&#8593; Importar</button>';
      h+='<input type="file" id="evImportFile" accept=".json" style="display:none">';
    }
    h+='</div>';
  }
  h+='</div>';
  return h;
}
