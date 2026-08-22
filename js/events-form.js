/* ============================================================
   EVENTS FORM - Alta y edicion de un evento.
   ============================================================ */

/* Dias que ocupa un evento puntual (para las notas por dia y el conteo) */
function evPuntualDays(ev){
  if(!ev)return [];
  if(ev.dates&&ev.dates.length)return ev.dates.slice();
  var out=[],s0=new Date(ev.start+'T00:00:00'),e0=new Date((ev.end||ev.start)+'T00:00:00'),g=0;
  for(var d=new Date(s0);d<=e0&&g<400;d.setDate(d.getDate()+1),g++)out.push(evDk(d));
  return out;
}

/* Swatches de categoria de la clase indicada */
function _renderEvTypeSwatches(kind,selType){
  var h='';
  EV_KINDS[kind].types.forEach(function(t){
    var key=evTypeKey(kind,t);
    var c=evTypeColor(kind,t);
    /* Multicolor = "elige tu color"; Casa Rural muestra su marron aunque
       tambien tenga paleta (EV_DOT_SOLID) */
    var isMulti=!!EV_FREE_COLOR[key]&&!EV_DOT_SOLID[key];
    var sel=(t===selType)?' selected':'';
    h+='<div class="ev-color-swatch'+sel+(isMulti?' ev-color-swatch-multi':'')+'" data-hex="'+c+'" data-type="'+escHtml(t)+'" data-kind="'+kind+'"'+(isMulti?'':' style="color:'+c+'"')+'>';
    h+=isMulti?'<div class="ev-type-dot ev-type-dot-multi"></div>':'<div class="ev-type-dot" style="background:'+c+'"></div>';
    h+='<span class="ev-type-name">'+escHtml(t)+'</span></div>';
  });
  return h;
}

/* ── Render: formulario de evento ───────────────────────── */
/* La repeticion solo tiene sentido en dos categorias: un recordatorio de
   gestion y un "Otros" puntual. Ni los eventos grandes ni un plan ni un ensayo
   se repiten, asi que ahi el campo ni se pinta. */
function evAdmiteRepeticion(kind,type){
  return kind==='puntual'&&(type==='Rec. Gestiones'||type==='Otros');
}
function renderEvForm(ev){
  var isEdit=!!ev;
  var title=isEdit?ev.title:'';
  var note=isEdit?(ev.note||''):'';
  var color=isEdit?ev.color:evTypeColor('puntual','Rec. Gestiones');
  var today=evDk(new Date());
  var start=isEdit?ev.start:today;
  var end=isEdit?(ev.end||ev.start):today;
  var repeat=isEdit?ev.repeat:null;
  var repType=repeat?repeat.type:'none';
  var wdays=(repeat&&repeat.type==='weekly')?repeat.weekDays:[];
  var wdNames=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  /* Tipo actual: SIEMPRE el tipo guardado del evento (getEvType ya hace el
     fallback por color para eventos antiguos sin ev.type). Antes la selección
     del picker se decidía por color y un evento con color personalizado no
     casaba con ningún swatch → al guardar caía en EV_COLORS[0] = Viaje. */
  /* Clase y categoria actuales (v241). getEvKind/getEvType hacen el fallback
     para eventos anteriores, que no tenian ni kind ni type. */
  var curKind=isEdit?getEvKind(ev):'puntual';
  var curType=isEdit?getEvType(ev):'Rec. Gestiones';
  if(curType==='Cumplea\u00f1os VIP'){curKind='puntual';curType='Otros';}
  if(EV_KINDS[curKind].types.indexOf(curType)===-1)curType=EV_KINDS[curKind].types[0];
  var curKey=evTypeKey(curKind,curType);
  /* Nota especifica del dia: solo si es puntual, ocupa varios dias y se ha
     entrado desde un dia concreto del calendario */
  var _dayList=evPuntualDays(ev);
  var showDayNote=isEdit&&curKind==='puntual'&&EV_EDIT_DS&&_dayList.length>1&&_dayList.indexOf(EV_EDIT_DS)!==-1;
  var dayNote=showDayNote?((ev.dayNotes&&ev.dayNotes[EV_EDIT_DS])||''):'';
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
  /* Nota general (todos los dias del evento) */
  h+='<div class="ev-field"><label>'+(showDayNote?'Nota general <span class="ev-note-scope">(todos los d\u00edas)</span> ':'Nota ')
    +'<span id="evCharCnt" style="font-weight:400;color:var(--text-dim)">'+note.length+'/200</span></label>';
  h+='<textarea class="ev-textarea" id="evFNote" maxlength="200" placeholder="Notas opcionales...">'+escHtml(note)+'</textarea></div>';
  /* Nota especifica de ESTE dia */
  if(showDayNote){
    h+='<div class="ev-field ev-daynote-field"><label>Nota de este d\u00eda <span class="ev-note-scope">('+EV_EDIT_DS.slice(8)+'/'+EV_EDIT_DS.slice(5,7)+')</span> '
      +'<span id="evDayCnt" style="font-weight:400;color:var(--text-dim)">'+dayNote.length+'/200</span></label>';
    h+='<textarea class="ev-textarea" id="evFDayNote" maxlength="200" placeholder="Solo para este d\u00eda...">'+escHtml(dayNote)+'</textarea></div>';
  }
  /* Selector de clase + categoria */
  h+='<div class="ev-field"><label>Clase de evento</label>';
  h+='<div class="ev-kind-picker" data-cur-kind="'+curKind+'" data-cur-type="'+escHtml(curType)+'">';
  ['puntual','grande'].forEach(function(k){
    h+='<button type="button" class="ev-kind-btn'+(k===curKind?' selected':'')+'" data-kind="'+k+'">'
      +(k==='puntual'?'\u2726 Puntual':'\u25ac Grande')
      +'<span>'+(k==='puntual'?'un marcador por d\u00eda':'barra de varios d\u00edas')+'</span></button>';
  });
  h+='</div></div>';
  h+='<div class="ev-field"><label>Categor\u00eda</label><div class="ev-type-picker" id="evFTypePicker">';
  h+=_renderEvTypeSwatches(curKind,curType);
  h+='</div></div>';
  /* Color picker section: visible para Viaje y Otros */
  var isOtros=!!EV_FREE_SHAPE[curKey];
  var showColorPicker=!!EV_FREE_COLOR[curKey];
  h+='<div class="ev-field ev-form-color-section" id="evFColorSection" style="display:'+(showColorPicker?'block':'none')+'">';
  h+='<label>\uD83C\uDFA8 Paleta de colores</label>';
  h+=_renderColorPicker(color,false,false,'evFCp');
  h+='</div>';
  /* Secci\u00f3n extra para Otros: forma del marcador + selector multi-d\u00eda */
  var curShape=isEdit&&ev.shape?ev.shape:'circle';
  var curDates=isEdit&&Array.isArray(ev.dates)?ev.dates.slice():[];
  var showDates=!!EV_FREE_DATES[curKey];
  var _extras=(isOtros||showDates||!!EV_FREE_BARSIZE[curKey]);
  h+='<div class="ev-field ev-otros-extras" id="evFOtrosExtras" style="display:'+(_extras?'block':'none')+'">';
  h+='<div id="evFShapeBlock" style="display:'+(isOtros?'block':'none')+'">';
  h+='<label>\u25B8 Forma del marcador</label>';
  h+='<div class="ev-shape-picker" id="evFShapePicker">';
  var _shapes=[
    {k:'circle',  label:'C\u00edrculo'},
    {k:'square',  label:'Cuadrado'},
    {k:'diamond', label:'Rombo'},
    {k:'x-thick', label:'X gorda'},
    {k:'x-thin',  label:'X fina'},
    {k:'rounded', label:'Redondeado'},
    /* Las mismas siluetas que usan las rutinas */
    {k:'gym',     label:'Mancuerna'},
    {k:'padel',   label:'Pala'},
    {k:'baile',   label:'Bailar\u00edn'}
  ];
  _shapes.forEach(function(s){
    var sel=(s.k===curShape)?' selected':'';
    var prevColor=color||EV_COLORS[0];
    h+='<button type="button" class="ev-shape-opt'+sel+'" data-shape="'+s.k+'" title="'+s.label+'" aria-label="'+s.label+'">';
    /* Todas las formas: mismo SVG que en los calendarios → mismo grosor de borde */
    h+='<span class="ev-shape-preview ev-shape-'+s.k+'" style="color:'+prevColor+'">'+evShapeSvg(s.k)+'</span>';
    h+='</button>';
  });
  h+='</div></div>';
  /* Grosor de la barra (solo eventos grandes "Otros") */
  var showBar=!!EV_FREE_BARSIZE[curKey];
  var curBar=evBarSize(isEdit?ev:{kind:curKind,type:curType,barSize:null});
  h+='<div id="evFBarBlock" style="display:'+(showBar?'block':'none')+'">';
  h+='<label>▬ Grosor de la barra</label>';
  h+='<div class="ev-barsize-picker" id="evFBarPicker">';
  EV_BAR_SIZES.forEach(function(b){
    h+='<button type="button" class="ev-barsize-opt'+(b.k===curBar?' selected':'')+'" data-bar="'+b.k+'">'
      +'<span class="ev-barsize-demo ev-bar-'+b.k+'"></span>'
      +'<span class="ev-barsize-lbl">'+b.label+'</span></button>';
  });
  h+='</div></div>';
  h+='<div id="evFDatesBlock" style="display:'+(showDates?'block':'none')+';margin-top:12px">';
  h+='<label>\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda</label>';
  h+='<button type="button" class="ev-btn" id="evFPickDates" style="width:100%;margin-top:4px;font-size:.78rem;padding:8px 10px">';
  h+='<span id="evFPickDatesLbl">'+(curDates.length>1?(curDates.length+' d\u00edas seleccionados \u2014 pulsa para editar'):'\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda\u2026')+'</span>';
  h+='</button>';
  h+='<div style="font-size:.62rem;color:var(--text-dim);margin-top:4px;line-height:1.4">'
    +(curType==='Ensayos boda'
      ? 'Marca todos los d\u00edas con clase: se crear\u00e1 <b>una clase por d\u00eda</b>, sin hora ni pareja. Luego las asignas desde la pesta\u00f1a <b>Bodas</b>.'
      : 'Si seleccionas <b>m\u00e1s de un d\u00eda</b>, el evento aparecer\u00e1 en cada uno de esos d\u00edas e ignorar\u00e1 las fechas de inicio/fin de abajo.')
    +'</div>';
  h+='</div>';
  h+='</div>';
  /* Inicio/Fin: deshabilitados si hay multid\u00eda activo */
  var _multiActive=curDates.length>1;
  h+='<div class="ev-field ev-date-row'+(_multiActive?' ev-dates-locked':'')+'" id="evFDateRow">';
  h+='<div><label>Inicio</label><input class="ev-input" id="evFStart" type="date" value="'+start+'"'+(_multiActive?' disabled':'')+'></div>';
  h+='<div><label>Fin</label><input class="ev-input" id="evFEnd" type="date" value="'+end+'"'+(_multiActive?' disabled':'')+'></div>';
  h+='<div class="ev-dates-locked-note" id="evFDatesLockedNote" style="display:'+(_multiActive?'block':'none')+'">Estas fechas se ignoran porque hay <b>Selecci\u00f3n Multid\u00eda</b> activa.</div>';
  h+='</div>';
  /* ── Horas del evento ────────────────────────────────────────────
     Puntual: hora de inicio y fin (el fin solo se activa con inicio puesto).
     Las clases de boda no la llevan aqui: tienen la suya en la pestana Bodas.
     Grande: hora de salida de ida y de vuelta, con medio de transporte. */
  var _esBoda=(curType==='Ensayos boda');
  var _horaIni=(isEdit&&ev.time)?ev.time:'';
  var _horaFin=(isEdit&&ev.endTime)?ev.endTime:'';
  h+='<div class="ev-field ev-date-row ev-hora-row" id="evFHoraRow"'
    +((curKind==='puntual'&&!_esBoda)?'':' style="display:none"')+'>';
  h+='<div><label>Hora inicio <span class="ev-note-scope">(opcional)</span></label>'
    +'<input class="ev-input" id="evFTime" type="time" step="300" value="'+_horaIni+'"></div>';
  h+='<div><label>Hora fin</label>'
    +'<input class="ev-input" id="evFEndTime" type="time" step="300" value="'+_horaFin+'"'
    +(_horaIni?'':' disabled')+'></div>';
  h+='</div>';
  var _vj=(isEdit&&ev.viaje)?ev.viaje:{};
  h+='<div class="ev-field ev-viaje-box" id="evFViajeBox" style="display:'
    +(curKind==='grande'?'block':'none')+'">';
  h+='<label>\ud83d\ude86 Ida y vuelta <span class="ev-note-scope">(opcional)</span></label>';
  [['ida','Ida'],['vuelta','Vuelta']].forEach(function(tr){
    var d=_vj[tr[0]]||{};
    var on=!!d.time;
    h+='<div class="ev-viaje-tramo'+(on?' on':'')+'" data-tramo="'+tr[0]+'">';
    h+='<label class="excl-item ev-viaje-hd"><input type="checkbox" class="ev-viaje-chk" data-tramo="'
      +tr[0]+'"'+(on?' checked':'')+'> <b>'+tr[1]+'</b></label>';
    h+='<div class="ev-viaje-campos" style="display:'+(on?'flex':'none')+'">';
    h+='<input class="ev-input ev-viaje-time" data-tramo="'+tr[0]+'" type="time" step="300" value="'+(d.time||'')+'">';
    h+='<select class="ev-input ev-viaje-modo" data-tramo="'+tr[0]+'">';
    EV_TRANSPORTES.forEach(function(m){
      h+='<option value="'+m.k+'"'+((d.modo||'tren')===m.k?' selected':'')+'>'+m.e+' '+m.l+'</option>';
    });
    h+='</select>';
    h+='</div>';
    h+='<input class="ev-input ev-viaje-cond" data-tramo="'+tr[0]+'" type="text" maxlength="30" placeholder="Quien conduce" value="'
      +escHtml(d.conductor||'')+'" style="display:'+((on&&d.modo==='coche')?'block':'none')+'">';
    h+='</div>';
  });
  h+='<div class="ev-viaje-note">La hora es la de <b>salida</b>: desde Pr\u00f3ximos podr\u00e1s crear una alarma para cada trayecto.</div>';
  h+='</div>';
  h+='<div class="ev-field" id="evFRepBlock"><label>Repetici\u00f3n</label>';
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
  if(!ev)EV_EDIT_DS=null;   /* las notas por dia solo aplican al editar */
  EV_FORM_CONTAINER=container||null;
  var ov=container||document.getElementById('eventsOverlay');
  ov.scrollTop=0;
  /* Si quedaba un formulario anterior a medio cerrar, quitarlo: si no,
     bindEvFormEvents() engancharia sus listeners al form viejo (mismos ids)
     y una sola pulsacion de Guardar dispararia dos veces. */
  var _oldW=document.getElementById('evFWrap');
  if(_oldW)_oldW.remove();
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
    EV_EDIT_DS=null;
    EV_FORM_CONTAINER=null;
  },300);
}

function bindEvFormEvents(){
  document.getElementById('evFClose').addEventListener('click',closeEvForm);
  var noteEl=document.getElementById('evFNote');
  var cntEl=document.getElementById('evCharCnt');
  noteEl.addEventListener('input',function(){cntEl.textContent=noteEl.value.length+'/200';});
  var dayNoteEl=document.getElementById('evFDayNote'),dayCntEl=document.getElementById('evDayCnt');
  if(dayNoteEl&&dayCntEl)dayNoteEl.addEventListener('input',function(){dayCntEl.textContent=dayNoteEl.value.length+'/200';});
  var _fCpWrap=document.getElementById('evFWrap')||document;
  var _fCp=_bindColorPicker(_fCpWrap,'evFCp');
  /* Track selected type hex (from the type picker) */
  var _selectedTypeHex=null;
  var _colorSection=document.getElementById('evFColorSection');
  var _otrosExtras=document.getElementById('evFOtrosExtras');
  /* Estado local de la secci\u00f3n Otros */
  var _otrosShape=(EV_EDIT&&EV_EDIT.shape)?EV_EDIT.shape:'circle';
  var _otrosDates=(EV_EDIT&&Array.isArray(EV_EDIT.dates))?EV_EDIT.dates.slice():[];
  function _refreshShapePreviews(){
    var col=_fCp&&_fCp.getColor?_fCp.getColor():(EV_EDIT?EV_EDIT.color:EV_COLORS[0]);
    /* Los SVG de las formas usan currentColor → basta con cambiar el color del span */
    document.querySelectorAll('#evFShapePicker .ev-shape-preview').forEach(function(p){p.style.color=col;});
  }
  function _refreshPickDatesLabel(){
    var lbl=document.getElementById('evFPickDatesLbl');
    if(lbl){
      if(_otrosDates.length>1)lbl.textContent=_otrosDates.length+' d\u00edas seleccionados \u2014 pulsa para editar';
      else lbl.textContent='\uD83D\uDDD3 Selecci\u00f3n Multid\u00eda\u2026';
    }
    /* Bloqueo visual de Inicio/Fin cuando hay multid\u00eda */
    var locked=_otrosDates.length>1;
    var row=document.getElementById('evFDateRow');
    var startEl=document.getElementById('evFStart');
    var endEl=document.getElementById('evFEnd');
    var note=document.getElementById('evFDatesLockedNote');
    if(row)row.classList.toggle('ev-dates-locked',locked);
    if(startEl)startEl.disabled=locked;
    if(endEl)endEl.disabled=locked;
    if(note)note.style.display=locked?'block':'none';
  }
  /* Selector de CLASE (puntual / grande): re-pinta las categorias */
  var _kindPicker=document.querySelector('.ev-kind-picker');
  function _curKind(){return (_kindPicker&&_kindPicker.dataset.curKind)||'puntual';}
  function _applyTypeUI(kind,typeName){
    var key=evTypeKey(kind,typeName);
    if(_kindPicker){_kindPicker.dataset.curKind=kind;_kindPicker.dataset.curType=typeName;}
    if(_colorSection)_colorSection.style.display=EV_FREE_COLOR[key]?'block':'none';
    var _shp=!!EV_FREE_SHAPE[key],_dts=!!EV_FREE_DATES[key],_bar=!!EV_FREE_BARSIZE[key];
    if(_otrosExtras)_otrosExtras.style.display=(_shp||_dts||_bar)?'block':'none';
    var _bb=document.getElementById('evFBarBlock');
    if(_bb)_bb.style.display=_bar?'block':'none';
    var _sb=document.getElementById('evFShapeBlock');
    if(_sb)_sb.style.display=_shp?'block':'none';
    var _db=document.getElementById('evFDatesBlock');
    if(_db)_db.style.display=_dts?'block':'none';
    /* Horas: los puntuales llevan inicio/fin y los grandes ida/vuelta.
       Las clases de boda no: su hora vive en la pestana Bodas. */
    var _hr=document.getElementById('evFHoraRow');
    if(_hr)_hr.style.display=(kind==='puntual'&&typeName!=='Ensayos boda')?'':'none';
    var _vb=document.getElementById('evFViajeBox');
    if(_vb)_vb.style.display=(kind==='grande')?'block':'none';
    /* Repeticion: solo en Rec. Gestiones y en Otros puntual */
    var _rp=evAdmiteRepeticion(kind,typeName);
    var _rb=document.getElementById('evFRepBlock');
    if(_rb)_rb.style.display=_rp?'':'none';
    if(!_rp){
      var _sel=document.getElementById('evFRepeat');
      if(_sel)_sel.value='none';
      var _wd=document.getElementById('evWdRow');
      if(_wd)_wd.style.display='none';
    }
  }
  function _bindTypeSwatches(){
    document.querySelectorAll('#evFTypePicker .ev-color-swatch').forEach(function(sw){
      sw.addEventListener('click',function(){
        document.querySelectorAll('#evFTypePicker .ev-color-swatch').forEach(function(x){x.classList.remove('selected');});
        sw.classList.add('selected');
        _selectedTypeHex=sw.dataset.hex;
        var typeName=sw.dataset.type||'Otros';
        _applyTypeUI(sw.dataset.kind||_curKind(),typeName);
        /* Al cambiar de categoria, la paleta arranca en el color propio de esa
           categoria (asi "Casa Rural" sale marron por defecto). */
        var _k2=evTypeKey(sw.dataset.kind||_curKind(),typeName);
        if(EV_FREE_COLOR[_k2]&&_fCp&&_fCp.setColor)_fCp.setColor(evTypeColor(sw.dataset.kind||_curKind(),typeName));
        var titleEl=document.getElementById('evFTitle');
        if(titleEl&&!titleEl.value.trim()){
          if(typeName==='Asturias'){
            titleEl.value='Asturias';
            var noteEl2=document.getElementById('evFNote');
            if(noteEl2&&!noteEl2.value.trim()){noteEl2.value='Asturias';cntEl.textContent='8/200';}
          } else if(typeName==='Ensayos boda'){titleEl.value='Ensayo boda';}
          else if(typeName==='Casa Rural'){titleEl.value='Casa rural';}
        }
      });
    });
  }
  _bindTypeSwatches();
  /* Estado inicial: al abrir hay que aplicar ya lo que depende de la
     categoria (horas, viaje, repeticion...), no solo al cambiarla */
  _applyTypeUI(_curKind(),(document.querySelector('#evFTypePicker .ev-color-swatch.selected')||{dataset:{}}).dataset.type||'');
  document.querySelectorAll('.ev-kind-btn[data-kind]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.dataset.kind;
      document.querySelectorAll('.ev-kind-btn').forEach(function(x){x.classList.remove('selected');});
      b.classList.add('selected');
      /* Al cambiar de clase se conserva la categoria si existe en la nueva
         (el caso de "Otros"); si no, la primera de la lista */
      var prev=(_kindPicker&&_kindPicker.dataset.curType)||'';
      var t=EV_KINDS[kind].types.indexOf(prev)!==-1?prev:EV_KINDS[kind].types[0];
      var tp=document.getElementById('evFTypePicker');
      if(tp)tp.innerHTML=_renderEvTypeSwatches(kind,t);
      _bindTypeSwatches();
      _applyTypeUI(kind,t);
    });
  });
  /* Selector de grosor de barra (grande|Otros) */
  var _barSize=(EV_EDIT&&EV_EDIT.barSize)?EV_EDIT.barSize:null;
  document.querySelectorAll('#evFBarPicker .ev-barsize-opt').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('#evFBarPicker .ev-barsize-opt').forEach(function(x){x.classList.remove('selected');});
      b.classList.add('selected');
      _barSize=b.dataset.bar;
    });
  });
  /* Shape picker (Otros) */
  document.querySelectorAll('#evFShapePicker .ev-shape-opt').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('#evFShapePicker .ev-shape-opt').forEach(function(x){x.classList.remove('selected');});
      b.classList.add('selected');
      _otrosShape=b.dataset.shape;
    });
  });
  /* Bot\u00f3n elegir d\u00edas espec\u00edficos */
  var _pickBtn=document.getElementById('evFPickDates');
  if(_pickBtn){
    _pickBtn.addEventListener('click',function(){
      var col=_fCp&&_fCp.getColor?_fCp.getColor():(EV_EDIT?EV_EDIT.color:EV_COLORS[0]);
      var startEl=document.getElementById('evFStart');
      var yr=startEl&&startEl.value?parseInt(startEl.value.slice(0,4),10):(new Date()).getFullYear();
      openOtrosDatePicker(_otrosDates,col,yr,function(newDates){
        _otrosDates=newDates.slice().sort();
        _refreshPickDatesLabel();
      });
    });
  }
  /* Refrescar previews de formas cuando cambia el color */
  var _picker=document.getElementById('evFCp');
  if(_picker){_picker.addEventListener('click',function(){setTimeout(_refreshShapePreviews,50);});}
  var _hexInput=document.querySelector('#evFCp input[type=text],#evFCp .ev-color-hex-input');
  if(_hexInput)_hexInput.addEventListener('input',_refreshShapePreviews);
  document.getElementById('evFRepeat').addEventListener('change',function(){
    document.getElementById('evWdRow').style.display=this.value==='weekly'?'flex':'none';
  });
  document.querySelectorAll('.ev-wd-btn').forEach(function(btn){
    btn.addEventListener('click',function(){btn.classList.toggle('on');});
  });
  /* La hora de fin solo tiene sentido con hora de inicio */
  var _tIni=document.getElementById('evFTime'),_tFin=document.getElementById('evFEndTime');
  if(_tIni&&_tFin){
    _tIni.addEventListener('input',function(){
      _tFin.disabled=!_tIni.value;
      if(!_tIni.value)_tFin.value='';
    });
  }
  /* Transporte: cada tramo se activa con su casilla; el conductor solo aparece
     cuando el medio es el coche */
  function _viajeSync(tramo){
    var box=document.querySelector('.ev-viaje-tramo[data-tramo="'+tramo+'"]');
    if(!box)return;
    var chk=box.querySelector('.ev-viaje-chk');
    var campos=box.querySelector('.ev-viaje-campos');
    var modo=box.querySelector('.ev-viaje-modo');
    var cond=box.querySelector('.ev-viaje-cond');
    var on=chk&&chk.checked;
    box.classList.toggle('on',!!on);
    if(campos)campos.style.display=on?'flex':'none';
    if(cond)cond.style.display=(on&&modo&&modo.value==='coche')?'block':'none';
  }
  document.querySelectorAll('.ev-viaje-chk').forEach(function(c){
    c.addEventListener('change',function(){
      var box=c.closest('.ev-viaje-tramo');
      if(c.checked){
        var t=box.querySelector('.ev-viaje-time');
        if(t&&!t.value)t.value='09:00';
      }
      _viajeSync(c.dataset.tramo);
    });
  });
  document.querySelectorAll('.ev-viaje-modo').forEach(function(m){
    m.addEventListener('change',function(){_viajeSync(m.dataset.tramo);});
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
      closeEvForm();
      setTimeout(function(){
        refreshEvents();
        showToast('Evento eliminado','success',function(){
          if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
          saveEvents();updateEventsBtn();refreshEvents();
        });
      },320);
    });
  }
  document.getElementById('evFSave').addEventListener('click',function(){
    var title=document.getElementById('evFTitle').value.trim();
    if(!title){showToast('El t\u00edtulo es obligatorio','error');return;}
    var note=document.getElementById('evFNote').value.trim();
    /* Clase + categoria: del swatch seleccionado; si no hubiera ninguno se
       conserva lo que traia el formulario (nunca cae a Viaje) */
    var typeSel=document.querySelector('#evFTypePicker .ev-color-swatch.selected');
    var _kp=document.querySelector('.ev-kind-picker');
    var kindLabel=(typeSel&&typeSel.dataset.kind)||(_kp&&_kp.dataset.curKind)||'puntual';
    var typeLabel=(typeSel&&typeSel.dataset.type)||(_kp&&_kp.dataset.curType)||'Otros';
    var typeKey=evTypeKey(kindLabel,typeLabel);
    /* Color: libre (paleta) en las categorias marcadas; fijo en el resto */
    var color=EV_FREE_COLOR[typeKey]?_fCp.getColor():evTypeColor(kindLabel,typeLabel);
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
    /* dates[] y forma personalizada: solo donde aplica */
    var _saveDates=null,_saveShape=null;
    if(EV_FREE_DATES[typeKey]&&typeof _otrosDates!=='undefined'&&_otrosDates&&_otrosDates.length>1)_saveDates=_otrosDates.slice().sort();
    if(EV_FREE_SHAPE[typeKey]&&typeof _otrosShape!=='undefined'&&_otrosShape)_saveShape=_otrosShape;
    /* Ensayos boda: cada dia marcado es una CLASE independiente (sin hora ni
       pareja). Se asignan luego desde la pestana Bodas. */
    /* Ensayos boda: CADA DIA es una clase independiente (tiene su hora, su
       pareja y su lugar). Si el evento abarca varios dias hay que partirlo en
       N clases — tambien al EDITAR, que antes se saltaba este paso y dejaba un
       unico evento con dates[] que la pestana Bodas contaba como una sola. */
    if(typeLabel==='Ensayos boda'){
      var _dias=_saveDates?_saveDates.slice():[start];
      if(!_saveDates&&end>start){
        _dias=[];
        var _d0=new Date(start+'T00:00:00'),_d1=new Date(end+'T00:00:00'),_g=0;
        for(var _dd=new Date(_d0);_dd<=_d1&&_g<400;_dd.setDate(_dd.getDate()+1),_g++)_dias.push(evDk(_dd));
      }
      if(_dias.length>1){
        var _prevEv=EV_EDIT?JSON.parse(JSON.stringify(EV_EDIT)):null;
        if(EV_EDIT)EVENTS=EVENTS.filter(function(e){return e.id!==EV_EDIT.id;});
        var _n=typeof bodaBulkCreate==='function'?bodaBulkCreate(_dias):0;
        updateEventsBtn();closeEvForm();
        setTimeout(function(){refreshEvents();},320);
        showToast(_n===1?'1 clase creada':(_n+' clases creadas \u2014 as\u00edgnalas en la pesta\u00f1a Bodas'),
          _n?'success':'error',
          _prevEv?function(){
            EVENTS=EVENTS.filter(function(e){return !(getEvType(e)==='Ensayos boda'&&_dias.indexOf(e.start)!==-1&&!(e.boda&&e.boda.coupleId));});
            EVENTS.push(_prevEv);saveEvents();updateEventsBtn();refreshEvents();
          }:null);
        return;
      }
    }
    var _newEv={id:EV_EDIT?EV_EDIT.id:('ev-'+Date.now()),title:title,note:note,color:color,
      kind:kindLabel,type:typeLabel,start:start,end:end,repeat:repeat};
    if(_saveDates)_newEv.dates=_saveDates;
    if(_saveShape)_newEv.shape=_saveShape;
    /* Horas del evento */
    if(kindLabel==='puntual'&&typeLabel!=='Ensayos boda'){
      var _ti=document.getElementById('evFTime'),_tf=document.getElementById('evFEndTime');
      var _tiv=_ti?_ti.value:'';
      if(_tiv){
        _newEv.time=_tiv;
        var _tfv=_tf?_tf.value:'';
        if(_tfv&&_tfv>_tiv)_newEv.endTime=_tfv;
      }
    }
    if(kindLabel==='grande'){
      var _viaje={};
      ['ida','vuelta'].forEach(function(tr){
        var box=document.querySelector('.ev-viaje-tramo[data-tramo="'+tr+'"]');
        if(!box)return;
        var chk=box.querySelector('.ev-viaje-chk');
        if(!chk||!chk.checked)return;
        var tv=box.querySelector('.ev-viaje-time');
        if(!tv||!tv.value)return;
        var modo=box.querySelector('.ev-viaje-modo');
        var cond=box.querySelector('.ev-viaje-cond');
        var d={time:tv.value,modo:modo?modo.value:'tren'};
        if(d.modo==='coche'&&cond&&cond.value.trim())d.conductor=cond.value.trim();
        _viaje[tr]=d;
      });
      if(_viaje.ida||_viaje.vuelta)_newEv.viaje=_viaje;
    }
    /* Una clase de boda de un solo dia siempre lleva su bloque boda */
    if(typeLabel==='Ensayos boda'){
      delete _newEv.dates;
      _newEv.boda=(EV_EDIT&&EV_EDIT.boda)?EV_EDIT.boda
        :{coupleId:null,time:null,place:(typeof BODA_PLACE_DEFAULT!=='undefined')?BODA_PLACE_DEFAULT:'casa'};
    }
    if(EV_FREE_BARSIZE[typeKey]){
      var _bsel=document.querySelector('#evFBarPicker .ev-barsize-opt.selected');
      var _bs=_bsel?_bsel.dataset.bar:(typeof _barSize!=='undefined'&&_barSize);
      if(_bs)_newEv.barSize=_bs;
    }
    /* Notas por dia: se conservan las que ya hubiera y se actualiza la del dia
       desde el que se entro (vacia = se borra esa entrada) */
    if(EV_EDIT&&EV_EDIT.dayNotes)_newEv.dayNotes=JSON.parse(JSON.stringify(EV_EDIT.dayNotes));
    var _dnEl=document.getElementById('evFDayNote');
    if(_dnEl&&EV_EDIT_DS){
      var _dnVal=_dnEl.value.trim();
      if(_dnVal){_newEv.dayNotes=_newEv.dayNotes||{};_newEv.dayNotes[EV_EDIT_DS]=_dnVal;}
      else if(_newEv.dayNotes)delete _newEv.dayNotes[EV_EDIT_DS];
    }
    if(EV_EDIT&&EV_EDIT.boda)_newEv.boda=EV_EDIT.boda;
    var _full=evDayLimitExceeded(_newEv,EV_EDIT?EV_EDIT.id:null);
    if(_full){showToast('El '+_fmtDayEs(_full)+' ya tiene '+EV_MAX_PUNT_DIA+' eventos puntuales (el m\u00e1ximo)','error');return;}
    if(EV_EDIT){
      var idx=-1;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===EV_EDIT.id){idx=i;break;}}
      if(idx!==-1)EVENTS[idx]=_newEv;
      /* Deshacer: restaura el evento tal y como estaba antes de editarlo */
      var _prev=JSON.parse(JSON.stringify(EV_EDIT));
      showToast('Evento actualizado','success',function(){
        for(var j=0;j<EVENTS.length;j++){if(EVENTS[j].id===_prev.id){EVENTS[j]=_prev;break;}}
        saveEvents();updateEventsBtn();refreshEvents();
      });
    }else{
      EVENTS.push(_newEv);
      var _newId=_newEv.id;
      showToast('Evento creado','success',function(){
        EVENTS=EVENTS.filter(function(e){return e.id!==_newId;});
        saveEvents();updateEventsBtn();refreshEvents();
      });
    }
    saveEvents();updateEventsBtn();
    closeEvForm();
    setTimeout(function(){refreshEvents();},320);
  });
}
