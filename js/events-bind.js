/* ============================================================
   EVENTS BIND - Apertura de la ventana y enganche de listeners.
   Se carga el ULTIMO: usa funciones de todos los demas.
   ============================================================ */

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
