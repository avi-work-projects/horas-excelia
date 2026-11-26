/* Días hasta la boda, en texto corto para el recuadro de la fecha. */
function bodaWedHint(ds){
  if(!ds)return '';
  var d=Math.round((new Date(ds+'T00:00:00')-new Date(evDk(new Date())+'T00:00:00'))/86400000);
  return d===0?'hoy':d===1?'mañana':d>0?'en '+d+' días':'hace '+(-d)+(d===-1?' día':' días');
}
function renderBodaCoupleForm(c){
  var isEdit=!!c;
  var col=isEdit?c.color:bodaNextColor();
  var h='<div class="ev-form-overlay" id="bodaCFormOv"><div class="ev-form-sheet ev-fixed-form-sheet">';
  h+='<div class="ev-form-handle"></div>';
  h+='<header class="bd-panel-header panel-header-centered ev-fixed-form-header">';
  h+='<button class="sy-back" id="bodaCClose">&#8592;</button>';
  h+='<h2>'+(isEdit?'Editar pareja':'Nueva pareja')+'</h2>';
  if(isEdit)h+='<button class="ev-btn danger" id="bodaCDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:36px"></div>';
  h+='</header><div class="bd-panel-body ev-fixed-form-body">';
  /* Mismo patrón que Editar clase: el nombre como campo y el resto en fichas de
     filas (etiqueta a la izquierda, valor a la derecha), con un solo acento. */
  /* La pareja en una sola ficha de tres filas: nombre, futura y día de la boda.
     Las dos etiquetas comparten formato; la fecha se edita tocándola y la
     cuenta atrás va en cursiva abajo a la derecha. */
  var wed=isEdit&&c.weddingDate?c.weddingDate:'';
  h+='<div class="ev-field boda-cform-group"><label for="bodaCName">Pareja</label><div class="ev-bficha boda-cform-ficha boda-date-ficha">';
  h+='<div class="ev-bfila boda-name-row"><input class="boda-name-input" id="bodaCName" type="text" maxlength="40" placeholder="Ej: Marta y Juan" value="'+(isEdit?escHtml(c.name):'')+'"></div>';
  h+='<label class="ev-bfila" for="bodaCFuture"><span class="ev-bfila-lbl">Pareja futura</span><span class="ev-bfila-val boda-switch-cell"><input type="checkbox" role="switch" class="boda-switch" id="bodaCFuture"'+(c&&c.future?' checked':'')+'></span></label>';
  h+='<label class="ev-bfila boda-wed-row" for="bodaCWed"><span class="ev-bfila-lbl">Día de la boda</span><span class="boda-wed-text" id="bodaCWedText">'+(wed?_bodaFmt(wed):'Elegir')+'</span><input id="bodaCWed" type="date" value="'+wed+'" aria-label="Día de la boda"><small class="boda-wed-hint" id="bodaCWedHint">'+(wed?bodaWedHint(wed):'')+'</small></label>';
  h+='</div></div>';
  var selected=isEdit?bodaPackOf(c):(BODA_CONFIG.packs.find(function(p){return p.active!==false&&p.classes===4;})||BODA_CONFIG.packs.find(function(p){return p.active!==false;}));
  /* La pareja conserva sus clases contratadas mientras mantenga el mismo pack. */
  var kept=isEdit?(c.packClasses==null?c.contracted:c.packClasses):null;
  h+='<div class="ev-field boda-cform-pack"><label>Pack</label><input type="hidden" id="bodaCPack" value="'+(selected?selected.id:'')+'">';
  h+='<div class="boda-pack-tiles" role="group" aria-label="Pack">';
  BODA_CONFIG.packs.filter(function(p){return p.active!==false||(selected&&p.id===selected.id);}).forEach(function(p){
    var mine=selected&&selected.id===p.id,n=mine&&kept!=null?kept:p.classes;
    h+='<button type="button" class="boda-pack-tile'+(mine?' on':'')+'" data-pack="'+p.id+'" aria-pressed="'+!!mine+'"><span>'+escHtml(p.name)+(p.active===false?' (inactivo)':'')+'</span><small><b>'+n+'</b> clases</small></button>';
  });
  h+='</div></div>';
  h+='<div class="ev-field"><label for="bodaCNote">Notas <span id="bodaCCnt" class="boda-cform-count">'+((isEdit&&c.note?c.note.length:0))+'/200</span></label>';
  h+='<textarea class="ev-textarea" id="bodaCNote" maxlength="200" placeholder="Notas de la pareja">'+(isEdit&&c.note?escHtml(c.note):'')+'</textarea></div>';
  /* Color: una fila con la muestra; la paleta solo se despliega al tocarla. */
  h+=renderColorRow(col,'bodaCp','Color');
  h+='</div><footer class="bd-panel-footer ev-fixed-form-actions"><button class="ev-btn" id="bodaCCancel">Cancelar</button><button class="ev-btn primary" id="bodaCSave">Guardar</button></footer>';
  h+='</div></div>';
  return h;
}
function openBodaCoupleForm(c){
  var wrap=abrirPanel('bodaCWrap',renderBodaCoupleForm(c),
    {overlay:'bodaCFormOv',alCerrar:closeBodaCoupleForm});
  var cp=_bindColorPicker(wrap,'bodaCp');
  var noteEl=document.getElementById('bodaCNote'),cnt=document.getElementById('bodaCCnt');
  noteEl.addEventListener('input',function(){cnt.textContent=noteEl.value.length+'/200';});
  document.getElementById('bodaCClose').addEventListener('click',closeBodaCoupleForm);
  wrap.querySelectorAll('.boda-pack-tile[data-pack]').forEach(function(t){
    t.addEventListener('click',function(){
      wrap.querySelectorAll('.boda-pack-tile').forEach(function(o){o.classList.toggle('on',o===t);o.setAttribute('aria-pressed',String(o===t));});
      document.getElementById('bodaCPack').value=t.dataset.pack;
    });
  });
  var wedIn=document.getElementById('bodaCWed');
  /* La fecha se ve como texto; el campo nativo, transparente encima, abre el
     selector del sistema al tocar (Android pintaba su propia flecha). */
  wedIn.addEventListener('click',function(){try{if(wedIn.showPicker)wedIn.showPicker();}catch(e){}});
  wedIn.addEventListener('input',function(){
    document.getElementById('bodaCWedText').textContent=wedIn.value?_bodaFmt(wedIn.value):'Elegir';
    document.getElementById('bodaCWedHint').textContent=wedIn.value?bodaWedHint(wedIn.value):'';
  });
  document.getElementById('bodaCCancel').addEventListener('click',closeBodaCoupleForm);
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
    var pack=BODA_CONFIG.packs.find(function(p){return p.id===document.getElementById('bodaCPack').value;});
    if(!pack){showToast(BODA_CONFIG.packs.some(function(p){return p.active!==false;})?'Elige un pack':'Activa o crea un pack en Configuracion de Bodas','error');return;}
    var previous=c&&bodaPackOf(c),num=previous&&previous.id===pack.id?(c.packClasses==null?c.contracted:c.packClasses):pack.classes;
    var data={name:name,contracted:num,packId:pack.id,packClasses:num,
      weddingDate:document.getElementById('bodaCWed').value||null,future:document.getElementById('bodaCFuture').checked,
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
    BODA_PAREJAS_FILTER=data.future?'futuras':bodaMatchesDate(data,'activas')?'activas':'pasadas';BODA_PAREJAS_CLASSES=null;
    setTimeout(function(){refreshEvents();showToast(c?'Pareja actualizada':'Pareja creada','success');},310);
  });
}
function closeBodaCoupleForm(){cerrarPanel('bodaCWrap','bodaCFormOv');}

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
  /* Mismo marcado que en el render: el nombre va en su propio <span> o
     pierde el recorte con puntos suspensivos. */
  if(cb)cb.innerHTML=c?('<span class="ev-bpunto" style="background:'+c.color+'"></span><span>'+escHtml(c.name)+'</span>')
                     :'<span class="boda-ro-sin">— asignar —</span>';
  var pl=fila.querySelector('.boda-place-btn');
  if(pl){
    pl.textContent=e.place?BODA_PLACE_SHORT[e.place]:'Sin sala';
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
/* Calendario de Wedding Moves: cambiar de mes, elegir día o pareja repinta
   solo .boda-sec (repintar toda la ventana parpadeaba). La pareja elegida se
   mantiene al cambiar de mes aunque ese mes no tenga clases suyas. */
function bodaCalRefresh(){
  var sec=document.querySelector('#eventsOverlay .boda-sec');
  if(!sec||BODA_SUBTAB!=='calendario'){refreshEvents();return;}
  sec.innerHTML=_renderBodaCalendario();
  bindBodaCalendar(sec);
}
function bodaCalMove(d){
  BODA_CAL_DAY=null;
  BODA_CAL_MONTH+=d;
  if(BODA_CAL_MONTH<0){BODA_CAL_MONTH=11;BODA_CAL_YEAR--;}
  if(BODA_CAL_MONTH>11){BODA_CAL_MONTH=0;BODA_CAL_YEAR++;}
  bodaCalRefresh();
}
function bindBodaCalendar(root){
  var cp=root.querySelector('#bodaCalPrev');
  if(cp)cp.addEventListener('click',function(){bodaCalMove(-1);});
  var cn=root.querySelector('#bodaCalNext');
  if(cn)cn.addEventListener('click',function(){bodaCalMove(1);});
  var ct=root.querySelector('#bodaCalToday');
  if(ct)ct.addEventListener('click',function(){var now=new Date();BODA_CAL_DAY=null;BODA_CAL_YEAR=now.getFullYear();BODA_CAL_MONTH=now.getMonth();bodaCalRefresh();});
  /* Deslizar sobre el calendario (rejilla, día y parejas) para cambiar de mes */
  var cg=root.querySelector('#bodaCalGrid'),cb=root.querySelector('#bodaCalBody');
  if(cb&&typeof addSwipe==='function')addSwipe(cb,function(){bodaCalMove(1);},function(){bodaCalMove(-1);});
  if(cg)cg.querySelectorAll('.boda-cal-day[data-ds]').forEach(function(day){
    function selectDay(){BODA_CAL_HL=null;BODA_CAL_DAY=BODA_CAL_DAY===day.dataset.ds?null:day.dataset.ds;bodaCalRefresh();}
    day.addEventListener('click',selectDay);
    day.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();selectDay();}});
  });
  /* Chips de pareja, filas de clase y de boda del día: resaltan todo lo de esa pareja */
  function toggleCouple(id){if(!id)return;BODA_CAL_HL=BODA_CAL_HL===id?null:id;bodaCalRefresh();}
  root.querySelectorAll('.boda-cal-lg[data-hl]').forEach(function(b){
    b.addEventListener('click',function(){BODA_CAL_DAY=null;toggleCouple(b.dataset.hl);});
  });
  root.querySelectorAll('.boda-cal-daylist [data-hl]').forEach(function(row){
    row.addEventListener('click',function(e){if(e.target.closest('.boda-cl-edit'))return;toggleCouple(row.dataset.hl);});
  });
  root.querySelectorAll('.boda-cal-daylist .boda-cl-edit[data-id]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();var ev=bodaClaseById(b.dataset.id);if(ev)openBodaClaseForm(ev);});
  });
}
function bindBodasEvents(){
  document.querySelectorAll('[data-stats-couples]').forEach(function(btn){btn.onclick=function(){BODA_SUBTAB='parejas';BODA_PAREJAS_FILTER=btn.dataset.statsCouples;BODA_PAREJAS_CLASSES='';BODA_PAREJAS_SEARCH='';BODA_PAREJAS_SORT='boda';BODA_CARD_OPEN=null;refreshEvents(false);};});
  var exp=document.getElementById('evCalendarExport');if(exp)exp.onclick=openEvCalendarExport;
  bindBodaConfig();
  if(typeof bindBodaHistoryCharts==='function')bindBodaHistoryCharts();
  var yearBtn=document.getElementById('bodaYearBtn'),yearList=document.getElementById('bodaYearList');
  if(yearBtn&&yearList){
    yearBtn.addEventListener('click',function(){
      var open=yearList.hidden;yearList.hidden=!open;yearBtn.setAttribute('aria-expanded',String(open));
      if(!open)return;
      /* Abre centrado en el año elegido o, con «Todos», en el año actual. */
      var target=yearList.querySelector('.boda-year-opt.on:not([data-bstats-year=""])')||yearList.querySelector('[data-bstats-year="'+new Date().getFullYear()+'"]')||yearList.querySelector('.boda-year-opt.on');
      if(target)yearList.scrollTop=target.offsetTop-(yearList.clientHeight-target.offsetHeight)/2;
    });
    yearList.querySelectorAll('[data-bstats-year]').forEach(function(b){
      b.addEventListener('click',function(){BODA_STATS_YEAR=b.dataset.bstatsYear?+b.dataset.bstatsYear:null;refreshEvents();});
    });
  }
  /* Al salir de la lista se guarda lo pendiente para no perderlo sin avisar */
  function _guardaPendientes(){
    if(bodaPendingCount())showToast(bodaPendingApply(true)+' cambios guardados','success');
  }
  document.querySelectorAll('.econ-sub-tab[data-bsub]').forEach(function(b){
    b.addEventListener('click',function(){
      _guardaPendientes();
      BODA_SUBTAB=b.dataset.bsub;
      if(BODA_SUBTAB==='parejas'){BODA_PAREJAS_FILTER='activas';BODA_PAREJAS_CLASSES=null;BODA_PAREJAS_SORT='boda';}
      refreshEvents(false);
    });
  });
  bindBodaCalendar(document);
  document.querySelectorAll('.boda-mode-btn[data-bmode]').forEach(function(b){
    b.addEventListener('click',function(){_guardaPendientes();BODA_CLASS_MODE=b.dataset.bmode;refreshEvents();});
  });
  document.querySelectorAll('.boda-issue[data-issue]').forEach(function(b){
    b.addEventListener('click',function(){openBodaIssue(b.dataset.issue);});
  });
  document.querySelectorAll('.boda-chip[data-pfilter]').forEach(function(b){
    b.addEventListener('click',function(){BODA_PAREJAS_FILTER=b.dataset.pfilter;refreshEvents();});
  });
  document.querySelectorAll('.boda-chip[data-pclasses]').forEach(function(b){
    b.addEventListener('click',function(){BODA_PAREJAS_CLASSES=BODA_PAREJAS_CLASSES===b.dataset.pclasses?null:b.dataset.pclasses;refreshEvents();});
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
  var sortSel=document.getElementById('bodaPSort');
  if(sortSel)sortSel.addEventListener('change',function(){BODA_PAREJAS_SORT=sortSel.value;refreshEvents();});
  var addC=document.getElementById('bodaAddCouple');
  if(addC)addC.addEventListener('click',function(){openBodaCoupleForm(null);});
  /* Tarjeta de pareja: se despliega en su sitio y se vuelve a plegar al
     pulsarla otra vez. Los botones propios de la tarjeta no la pliegan. */
  document.querySelectorAll('.boda-card-tap[data-cid]').forEach(function(card){
    card.addEventListener('click',function(e){
      if(e.target.closest('.boda-hd-edit,.boda-det-actions'))return;
      BODA_CARD_OPEN=(BODA_CARD_OPEN===card.dataset.cid)?null:card.dataset.cid;
      refreshEvents();
    });
  });
  document.querySelectorAll('.boda-c-edit[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openBodaCoupleForm(bodaCouple(b.dataset.cid));});
  });
  /* Intercambio de parejas entre dos huecos seguidos. Se tocan las dos filas
     y nada mas: ni re-render ni perder el scroll. */
  document.querySelectorAll('.boda-swap[data-a][data-b]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var a=bodaClaseById(btn.dataset.a), b=bodaClaseById(btn.dataset.b);
      if(!a||!b)return;
      var ca=bodaEff(a).coupleId, cb=bodaEff(b).coupleId;
      if(!ca&&!cb)return;                       /* dos huecos vacios: nada que cambiar */
      bodaSetPending(a.id,'coupleId',cb);
      bodaSetPending(b.id,'coupleId',ca);
      bodaRefreshRow(a);bodaRefreshRow(b);
    });
  });
  document.querySelectorAll('.boda-c-asig[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openBodaAssign(bodaCouple(b.dataset.cid));});
  });
  var _cls=document.getElementById('bodaClSearch');
  if(_cls)_cls.addEventListener('input',function(){
    BODA_CLASES_SEARCH=this.value;
    clearTimeout(window._bodaClST);
    window._bodaClST=setTimeout(function(){
      refreshEvents();
      var el=document.getElementById('bodaClSearch');
      if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}
    },250);
  });
  /* Interruptores en positivo: marcados = se ven */
  var _sp=document.getElementById('bodaShowPast');
  if(_sp)_sp.addEventListener('change',function(){BODA_HIDE_PAST=!this.checked;refreshEvents();});
  var _sc=document.getElementById('bodaShowClosed');
  if(_sc)_sc.addEventListener('change',function(){BODA_HIDE_CLOSED=!this.checked;refreshEvents();});
  function findClass(id){for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id)return EVENTS[i];return null;}
  document.querySelectorAll('.boda-time-btn[data-id]').forEach(function(b){
    b.addEventListener('click',function(){var ev=findClass(b.dataset.id);if(ev)openBodaTimePicker(ev);});
  });
  document.querySelectorAll('.boda-couple-btn[data-id]').forEach(function(b){
    b.addEventListener('click',function(){var ev=findClass(b.dataset.id);if(ev)openBodaCouplePicker(ev);});
  });
  document.querySelectorAll('.boda-place-btn[data-id]').forEach(function(b){
    b.addEventListener('click',function(){
      var ev=findClass(b.dataset.id);
      if(ev)openBodaPlacePicker(ev);
    });
  });
  /* Editar una clase suelta desde Consulta */
  document.querySelectorAll('.boda-cl-edit[data-id]').forEach(function(b){
    if(b.closest('.boda-cal-daylist'))return;   /* los engancha bindBodaCalendar */
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var ev=findClass(b.dataset.id);
      if(ev)openBodaClaseForm(ev);
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
      if(bodaDayFull(ds)){showToast('Ese día ya tiene '+EV_MAX_PUNT_DIA+' eventos puntuales (el máximo)','error');return;}
      openBodaClaseForm(null);
      if(BODA_FORM){BODA_FORM.ds=ds;_bodaFormRender();}
    });
  });
  var addCl=document.getElementById('bodaAddClass');
  if(addCl)addCl.addEventListener('click',function(){openBodaClaseForm(null);});
}

function bodaMatchesDate(c,filter){
  if(filter==='futuras')return c.future===true;
  if(c.future)return filter==='todas';
  var active=!c.weddingDate||c.weddingDate>=evDk(new Date());
  return filter==='activas'?active:filter==='pasadas'?!active:true;
}
function bodaMatchesClasses(c,filter){
  var falta=bodaProgress(c).falta;
  return filter==='incompletas'?falta>0:filter==='completas'?falta===0:true;
}

var BODA_RENDER_CLASSES=null;
function renderBodasBody(){
  BODA_RENDER_CLASSES=EVENTS.filter(function(ev){return getEvType(ev)==='Ensayos boda';});
  try{return _renderBodasBody();}finally{BODA_RENDER_CLASSES=null;}
}
