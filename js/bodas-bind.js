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
  var selected=isEdit?bodaPackOf(c):(BODA_CONFIG.packs.find(function(p){return p.active!==false&&p.classes===4;})||BODA_CONFIG.packs.find(function(p){return p.active!==false;}));
  h+='<div class="ev-field"><label>Pack contratado</label><select class="ev-input" id="bodaCPack">';
  BODA_CONFIG.packs.filter(function(p){return p.active!==false||(selected&&p.id===selected.id);}).forEach(function(p){h+='<option value="'+p.id+'"'+(selected&&selected.id===p.id?' selected':'')+'>'+escHtml(p.name)+' ('+p.classes+' clases)'+(p.active===false?' (inactivo)':'')+'</option>';});
  h+='</select></div>';
  if(c)h+='<div class="boda-stat-note">Clases incluidas al contratar: '+(c.packClasses==null?c.contracted:c.packClasses)+'. Se conservan si mantienes el mismo pack.</div>';
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
  var wrap=abrirPanel('bodaCWrap',renderBodaCoupleForm(c),
    {overlay:'bodaCFormOv',alCerrar:closeBodaCoupleForm});
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
    var pack=BODA_CONFIG.packs.find(function(p){return p.id===document.getElementById('bodaCPack').value;});
    if(!pack){showToast('Activa o crea un pack en Configuracion de Bodas','error');return;}
    var previous=c&&bodaPackOf(c),num=previous&&previous.id===pack.id?(c.packClasses==null?c.contracted:c.packClasses):pack.classes;
    var data={name:name,contracted:num,packId:pack.id,packClasses:num,
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
function bindBodasEvents(){
  bindBodaConfig();
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
  document.querySelectorAll('.boda-chip[data-psort]').forEach(function(b){
    b.addEventListener('click',function(){
      /* Cada chip da la vuelta: asc -> desc -> sin orden */
      var ciclos={alfa:['az','za'],fecha:['new','old'],boda:['boda','boda-desc'],clase:['clase','clase-desc']};
      var c=ciclos[b.dataset.psort];
      BODA_PAREJAS_SORT=(BODA_PAREJAS_SORT===c[0])?c[1]:(BODA_PAREJAS_SORT===c[1])?null:c[0];
      refreshEvents();
    });
  });
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
    b.addEventListener('click',function(e){e.stopPropagation();openBodaAssign(bodaCouple(b.dataset.cid),false);});
  });
  document.querySelectorAll('.boda-c-extra[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openBodaAssign(bodaCouple(b.dataset.cid),true);});
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
