/* ============================================================
   EVENTS DETALLE - La ficha de un evento (que es tambien el carrusel
   del dia), la hoja de borrado y el panel de alarma.
   ============================================================ */

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
  abrirPanel('evDelWrap',h,{overlay:'evDelOv',alCerrar:closeEvDeleteSheet});
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

function closeEvDeleteSheet(){cerrarPanel('evDelWrap','evDelOv');}


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
  var h='<div class="ev-detail-overlay" id="evDetailOv"><div class="ev-detail-sheet'+(car?' ev-car-sheet':'')+'">';
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
  /* En una clase de boda la hora sale abajo en su pastilla, no aqui */
  var _dt=(getEvType(ev)==='Ensayos boda')?'':evTimeLabel(ev);
  if(_dt)h+='<div class="ev-detail-repeat">\ud83d\udd52 '+_dt+'</div>';
  evTramos(ev).forEach(function(tr){
    h+='<div class="ev-detail-repeat">'+evTramoTexto(tr)+'</div>';
  });
  if(repeatStr)h+='<div class="ev-detail-repeat">'+repeatStr+'</div>';
  /* En una rutina la nota repite la hora que ya sale arriba */
  if(ev.note&&!ev._rut)h+='<div class="ev-detail-note">'+escHtml(ev.note)+'</div>';
  /* Nota especifica del dia desde el que se abrio (puntuales de varios dias) */
  if(EV_EDIT_DS&&ev.dayNotes&&ev.dayNotes[EV_EDIT_DS]){
    h+='<div class="ev-detail-note ev-detail-daynote"><span class="ev-note-scope">'
      +EV_EDIT_DS.slice(8)+'/'+EV_EDIT_DS.slice(5,7)+'</span> '+escHtml(ev.dayNotes[EV_EDIT_DS])+'</div>';
  }
  /* Datos de la clase de boda. Van siempre las tres pastillas (hora, sala y
     pareja): si falta el dato sale el aviso, asi la ficha no cambia de alto
     segun lo completa que este la clase. */
  if(getEvType(ev)==='Ensayos boda'&&typeof bodaCouple==='function'){
    var _b=ev.boda||{};var _c=bodaCouple(_b.coupleId);
    var _pl=(typeof bodaPlaceOf==='function')?bodaPlaceOf(ev):null;
    /* Una ficha con las tres filas SIEMPRE presentes (etiqueta a la izquierda,
       dato a la derecha). Lo que falta se marca en ambar en su propia fila en
       vez de desaparecer, asi la ficha no cambia de alto ni de forma. */
    /* Cada fila se pulsa para rellenar o cambiar ese dato: abre el mismo
       selector que la pestana de Bodas, en modo directo, asi que lo que se
       elija queda guardado en el evento y se ve en todas partes. */
    var _fila=function(campo,icono,etiqueta,valor,falta,extra){
      return '<button type="button" class="ev-bfila'+(falta?' warn':'')+'" data-bcampo="'+campo+'">'
        +'<span class="ev-bfila-lbl">'+icono+' '+etiqueta+'</span>'
        +'<span class="ev-bfila-val">'+(falta?('\u26a0 '+valor):valor)+'</span>'
        +(extra||'')+'</button>';
    };
    h+='<div class="ev-bficha">';
    h+=_fila('hora','\ud83d\udd52','Hora',
      _b.time?(_b.time+' \u2013 '+_bodaMasUnaHora(_b.time)):'Sin asignar',!_b.time);
    h+=_fila('sala',_pl?bodaPlaceEmoji(_pl):'\ud83c\udfe0','Sala',
      _pl?escHtml(BODA_PLACE_SHORT[_pl]):'Sin asignar',!_pl);
    h+=_fila('pareja','\ud83d\udc8d','Pareja',
      _c?('<span class="ev-bpunto" style="background:'+_c.color+'"></span>'+escHtml(_c.name)):'Sin asignar',!_c,
      _c?('<span class="ev-bver" data-cid="'+_c.id+'">Ver</span>'):'');
    h+='</div>';
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

/* ── Apertura/cierre del detalle ────────────────────────── */
function openEvDetail(ev,container,car){
  var ov=container||document.getElementById('eventsOverlay');
  var fromSummary=(EV_VIEW==='puentes'||EV_VIEW==='time-off');
  ov.scrollTop=0;
  /* Al deslizar dentro del carrusel se reaprovecha el panel abierto: si se
     quitara y se volviera a poner, la animacion de entrada saldria en cada
     evento y pareceria que se cierra y se abre otra ficha distinta. */
  var wrap=abrirPanel('evDWrap',renderEvDetail(ev,fromSummary,car),{
    contenedor:ov, overlay:'evDetailOv', alCerrar:closeEvDetail,
    reutilizar:!!car
  });
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
  /* Filas de la ficha de un ensayo: cada una abre su selector y, al volver,
     se repinta la ficha con el dato ya guardado. */
  document.querySelectorAll('#evDetailOv .ev-bfila[data-bcampo]').forEach(function(fila){
    fila.addEventListener('click',function(e){
      if(e.target.closest('.ev-bver'))return;      /* eso va a la pareja */
      var repintar=function(){openEvDetail(ev,null,car);};
      var opts={directo:true,alGuardar:repintar};
      var campo=fila.dataset.bcampo;
      if(campo==='hora'&&typeof openBodaTimePicker==='function')openBodaTimePicker(ev,opts);
      else if(campo==='sala'&&typeof openBodaPlacePicker==='function')openBodaPlacePicker(ev,opts);
      else if(campo==='pareja'&&typeof openBodaCouplePicker==='function')openBodaCouplePicker(ev,opts);
    });
  });
  var _vp=document.querySelector('#evDetailOv .ev-bver[data-cid]');
  if(_vp)_vp.addEventListener('click',function(e){
    e.stopPropagation();
    var cid=_vp.dataset.cid;
    if(car)closeEvDayCarousel();else closeEvDetail();
    setTimeout(function(){
      /* Bodas > Parejas, sin filtro y con esa pareja ya desplegada */
      if(typeof BODA_SUBTAB!=='undefined'){
        BODA_SUBTAB='parejas';
        BODA_PAREJAS_FILTER='todas';
        BODA_CARD_OPEN=cid;
      }
      _switchEvView('bodas');
      refreshEvents(false);
      setTimeout(function(){
        var card=document.querySelector('.boda-card-tap[data-cid="'+cid+'"]');
        var body=document.querySelector('#eventsOverlay .sy-body');
        if(card&&body)body.scrollTop=Math.max(0,card.offsetTop-body.offsetTop-8);
      },30);
    },310);
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

function closeEvDetail(){cerrarPanel('evDWrap','evDetailOv');}

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
  /* El atajo a la ficha va PEGADO a la tarjeta del evento y con su mismo
     alto: se lee como "mas sobre ESTE evento", que es lo que es. Al pie
     pasaba desapercibido entre "Crear alarma" y "Editar evento".
     Toma el color del propio evento, el mismo que la tarjeta usa ya para su
     borde y su fondo: destaca sin salirse de la gama del panel.
     Solo los ensayos tienen ficha que anada algo (hora, sala y pareja). */
  var _conFicha=(getEvType(ev)==='Ensayos boda');
  h+='<div class="bd-alarm-top'+(_conFicha?' con-ficha':'')+'">';
  h+='<div class="bd-alarm-info" style="border-color:'+_ac+'44;background:'+_ac+'11">';
  h+='<div class="bd-alarm-name" style="color:'+_ac+'">'+escHtml(ev.title)+'</div>';
  h+='<div class="bd-alarm-date">'+fd2(firstDate)+' \u00b7 '+diffLbl+'</div>';
  h+='<div class="ev-alarm-note">'+note+'</div></div>';
  if(_conFicha)
    h+='<button class="ev-alarm-info" id="evAlarmInfo" style="border-color:'+_ac+';'
      +'background:'+fakeTrans(_ac,0.72)+'">'
      +'<span class="ev-alarm-info-t">Ver<br>ficha</span>'
      +'<span class="ev-alarm-info-f">&#8250;</span></button>';
  h+='</div>';
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
      /* Sin hora no hay de que restar la antelacion */
      if(!tr.t.time)return;
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
  abrirPanel('evAlarmWrap',renderEvAlarmPanel(ev,firstDate),
    {overlay:'evAlarmOv',alCerrar:closeEvAlarm});
  bindEvAlarmEvents(ev,firstDate);
}

function closeEvAlarm(){
  cerrarPanel('evAlarmWrap','evAlarmOv',function(){
    refreshEvents();
    if(typeof refreshBday==='function')refreshBday();
  });
}

/* Abre el panel de cumpleaños VIP desde la ventana de eventos */
function openBdayAlarmFromEvents(b){
  abrirPanel('bdAlarmWrap',
    typeof renderBdayAlarmPanel==='function'?renderBdayAlarmPanel(b):'',
    {overlay:'bdAlarmOv',
     alCerrar:function(){if(typeof closeBdayAlarm==='function')closeBdayAlarm();}});
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
      /* Dia de la semana = alarma que se REPITE esa fecha todas las semanas.
         Solo hace falta cuando el aviso cae mas alla de manana: una alarma
         sin DAYS suena en la siguiente vez que el reloj marque esa hora, o
         sea, siempre dentro de las proximas 24 h. Asi que si el momento del
         aviso esta en esa ventana, no se manda dia y queda de una sola vez.
         El margen de 5 min descarta lo que ya ha pasado (sin DAYS saltaria
         manana) y lo que esta tan cerca que no da tiempo a nada. */
      var _cuando=new Date(_f.getFullYear(),_f.getMonth(),_f.getDate(),a.h,a.m,0,0);
      var _faltan=_cuando-Date.now();
      var _unaVez=(_faltan>=5*60000&&_faltan<=24*3600000);
      var _dow=_unaVez?null:(_f.getDay()+1);
      var msg='\uD83D\uDCC5 '+ev.title+' '+_fTxt+a.suf;
      if(typeof addAlarm==='function'){
        addAlarm({type:'event',label:msg,hour:a.h,minute:a.m,days:_dow?[_dow]:null,targetDate:fmtD(_f)});
      }
      var url=base+'/generar_alarma1?alarmH='+a.h+'&alarmM='+a.m
        +'&alarmMsg='+encodeURIComponent(msg)+'&alarmDays='+(_dow||'');
      fetch(url,{mode:'no-cors'}).catch(function(){});
    });
    setEvAlarmState(ev.id,true);
    showToast(alarmas.length>1?('\u23f0 '+alarmas.length+' alarmas creadas')
      :('\u23f0 Alarma creada \u2014 '+escHtml(ev.title)),'success');
    closeEvAlarm();setTimeout(refreshEvents,320);
  });
  var _info=document.getElementById('evAlarmInfo');
  if(_info)_info.addEventListener('click',function(){
    closeEvAlarm();
    setTimeout(function(){openEvDetail(ev);},320);
  });
  var mInp=document.getElementById('evAlarmM');
  if(mInp)mInp.addEventListener('blur',function(){
    var v=parseInt(this.value,10);
    if(!isNaN(v))this.value=String(Math.min(59,Math.max(0,v))).padStart(2,'0');
  });
}
