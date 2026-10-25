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
function _renderEvTypeSwatches(kind,selType,extras){
  var groups=kind==='puntual'
    ?[['Rec. Gestiones',Object.keys(EV_MANAGEMENT_SUBTYPES)],['Plan/Quedada',Object.keys(EV_PLAN_SUBTYPES)],['Ensayos boda',[]],['Otros',[]]]
    :EV_KINDS[kind].types.map(function(t){return [t,[]];});
  return groups.map(function(group){
    if(kind==='puntual'&&group[0]==='Rec. Gestiones')return renderEvQuickPlans(selType,'management',extras&&extras.management);
    if(kind==='puntual'&&group[0]==='Plan/Quedada')return renderEvQuickPlans(selType,'plans',extras&&extras.plans);
    var selected=selType===group[0]||group[1].indexOf(selType)>=0;
    var h='<section class="ev-category-group'+(kind==='grande'||group[0]==='Ensayos boda'||group[0]==='Otros'?' ev-category-single':'')+(selected?' chosen':'')+'" style="--category-tone:'+evTypeColor(kind,group[0])+'" aria-label="'+group[0]+'">'+_renderEvTypeButton(kind,group[0],selType);
    if(group[1].length)h+='<div class="ev-category-children">'+group[1].map(function(t){return _renderEvTypeButton(kind,t,selType);}).join('')+'</div>';
    if(EV_FREE_DATES[evTypeKey(kind,group[0])])h+='<button type="button" class="ev-form-multiday" data-ev-multiday="'+group[0]+'" aria-haspopup="dialog"'+(selected?'':' disabled')+'><span>Multidía</span><small></small></button>';
    return h+'</section>'+(kind==='puntual'&&group[0]==='Ensayos boda'?renderEvRoutineChoices():'');
  }).join('');
}
function _renderEvTypeButton(kind,t,selType){
    var h='';
    var key=evTypeKey(kind,t);
    var c=evTypeColor(kind,t);
    /* Multicolor = "elige tu color"; Casa Rural muestra su marron aunque
       tambien tenga paleta (EV_DOT_SOLID) */
    var isMulti=!!EV_FREE_COLOR[key]&&!EV_DOT_SOLID[key];
    var sel=(t===selType)?' selected':'';
    h+='<button type="button" class="ev-color-swatch'+sel+(isMulti?' ev-color-swatch-multi':'')+'" data-hex="'+c+'" data-type="'+escHtml(t)+'" data-kind="'+kind+'"'+(isMulti?'':' style="color:'+c+'"')+'>';
    h+=isMulti?'<div class="ev-type-dot ev-type-dot-multi"></div>'
      :kind==='puntual'?'<span class="ev-type-dot ev-type-symbol">'+evShapeSvg(t==='Ensayos boda'?'x-thick':evDefaultShape({type:t}))+'</span>'
      :'<div class="ev-type-dot" style="background:'+c+'"></div>';
    h+='<span class="ev-type-name">'+escHtml(menuTitle(t==='Contratar electricidad'?'Contratar electric.':t))+'</span></button>';
  return h;
}

/* ── Render: formulario de evento ───────────────────────── */
/* Los eventos nuevos no crean repeticiones; cumpleaños conserva su módulo. */
function evAdmiteRepeticion(){return false;}
function renderEvForm(ev){
  var isEdit=!!ev;
  var title=isEdit?ev.title:'';
  var color=isEdit?ev.color:evTypeColor('puntual','Rec. Gestiones');
  /* Tipo actual: SIEMPRE el tipo guardado del evento (getEvType ya hace el
     fallback por color para eventos antiguos sin ev.type). Antes la selección
     del picker se decidía por color y un evento con color personalizado no
     casaba con ningún swatch → al guardar caía en EV_COLORS[0] = Viaje. */
  /* Clase y categoria actuales (v241). getEvKind/getEvType hacen el fallback
     para eventos anteriores, que no tenian ni kind ni type. */
  var curKind=isEdit?getEvKind(ev):'puntual';
  var curType=isEdit?getEvType(ev):'';
  if(curType==='Cumplea\u00f1os VIP'){curKind='puntual';curType='Otros';}
  if(isEdit&&EV_KINDS[curKind].types.indexOf(curType)===-1)curType=EV_KINDS[curKind].types[0];
  var curKey=evTypeKey(curKind,curType);
  /* Nota especifica del dia: solo si es puntual, ocupa varios dias y se ha
     entrado desde un dia concreto del calendario */
  var _dayList=evPuntualDays(ev);
  var showDayNote=isEdit&&curKind==='puntual'&&EV_EDIT_DS&&_dayList.length>1&&_dayList.indexOf(EV_EDIT_DS)!==-1;
  var dayNote=showDayNote?((ev.dayNotes&&ev.dayNotes[EV_EDIT_DS])||''):'';
  var lead=renderEvFormLead(ev,showDayNote);
  var h='<div class="ev-form-overlay" id="evFormOv">';
  h+='<div class="ev-form-sheet ev-event-form-sheet"><div class="ev-form-handle"></div>';
  h+='<header class="bd-panel-header panel-header-centered ev-event-form-header"><button class="sy-back" id="evFClose" aria-label="Volver">&#8592;</button><h2 id="evFHeadingTitle">'+escHtml(title||(isEdit?'Editar Evento':'Nuevo Evento'))+'</h2>';
  h+=isEdit?'<button class="ev-btn danger" id="evFDel">Eliminar</button>':'<span></span>';
  h+='</header><div class="ev-event-form-body">'+(isEdit?lead:'');
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
      +'<b>'+(k==='puntual'?'Puntual':'Grande')+'</b>'+renderEvKindSymbols(k)+'</button>';
  });
  h+='</div></div>';
  h+='<div class="ev-field"><label>Categor\u00eda</label><div class="ev-type-picker" id="evFTypePicker">';
  h+=_renderEvTypeSwatches(curKind,curType);
  h+='</div></div>';
  h+=renderEvTaxFields(ev);
  h+=renderEvCultureFields(ev);
  /* Color picker section: visible para Viaje y Otros */
  var isOtros=!!EV_FREE_SHAPE[curKey];
  var showColorPicker=!!EV_FREE_COLOR[curKey];
  h+='<div class="ev-field ev-form-color-section" id="evFColorSection" style="display:'+(showColorPicker?'block':'none')+'">';
  h+='<label>\uD83C\uDFA8 Paleta de colores</label>';
  h+=_renderColorPicker(color,false,false,'evFCp');
  h+='</div>';
  /* Secci\u00f3n extra para Otros: forma del marcador + selector multi-d\u00eda */
  var curShape=isEdit&&ev.shape?ev.shape:'circle';
  var _extras=(isOtros||!!EV_FREE_BARSIZE[curKey]);
  h+='<div class="ev-field ev-otros-extras" id="evFOtrosExtras" style="display:'+(_extras?'block':'none')+'">';
  h+='<div id="evFShapeBlock" style="display:'+(isOtros?'block':'none')+'">';
  h+='<label>\u25B8 Forma del marcador</label>';
  h+='<div class="ev-shape-picker" id="evFShapePicker">';
  var _shapes=[
    {k:'circle',  label:'C\u00edrculo'},
    {k:'x-thin',  label:'Cruz'},
    {k:'petal', label:'Estrella'},
    {k:'wave', label:'Ola a mano'},
    {k:'x-outline', label:'X de rotulador'},
    {k:'circle-plus', label:'Círculo con cruz'},
    {k:'repair', label:'Reparación'},
    {k:'cooking', label:'Cocinar'},
    {k:'leaf', label:'Limpiar'}
  ];
  _shapes.forEach(function(s,i){
    var sel=(s.k===curShape)?' selected':'';
    var prevColor=evOtherShapeColor(s.k)||color||EV_COLORS[0];
    h+='<button type="button" class="ev-shape-opt'+sel+'" data-shape="'+s.k+'" title="'+s.label+'" aria-label="'+s.label+'">';
    /* Todas las formas: mismo SVG que en los calendarios → mismo grosor de borde */
    h+='<span class="ev-shape-preview ev-shape-'+s.k+'" style="color:'+prevColor+'">'+evShapeSvg(s.k)+'</span>';
    h+='</button>';
  });
  h+='</div></div>';
  /* Grosor de la barra (solo eventos grandes "Otros") */
  var showBar=!!EV_FREE_BARSIZE[curKey];
  var curBar=isEdit?evBarSize(ev):'sm';
  h+='<div id="evFBarBlock" style="display:'+(showBar?'block':'none')+'">';
  h+='<label>▬ Grosor de la barra</label>';
  h+='<div class="ev-barsize-picker" id="evFBarPicker">';
  EV_BAR_SIZES.forEach(function(b){
    h+='<button type="button" class="ev-barsize-opt'+(b.k===curBar?' selected':'')+'" data-bar="'+b.k+'">'
      +'<span class="ev-barsize-demo ev-bar-'+b.k+'"></span>'
      +'<span class="ev-barsize-lbl">'+b.label+'</span></button>';
  });
  h+='</div></div>';
  h+='</div>';
  var _vj=(isEdit&&ev.viaje)?ev.viaje:{};
  h+='<div class="ev-field ev-viaje-box" id="evFViajeBox" style="display:'
    +(curKind==='grande'?'block':'none')+'">';
  h+='<label>\ud83d\ude86 Ida y vuelta <span class="ev-note-scope">(opcional)</span></label>';
  [['ida','Ida'],['vuelta','Vuelta']].forEach(function(tr){
    var d=_vj[tr[0]]||{};
    var on=!!_vj[tr[0]];
    h+='<div class="ev-viaje-tramo'+(on?' on':'')+'" data-tramo="'+tr[0]+'">';
    h+='<label class="excl-item ev-viaje-hd"><input type="checkbox" class="ev-viaje-chk" data-tramo="'
      +tr[0]+'"'+(on?' checked':'')+'> <b>'+tr[1]+'</b></label>';
    h+='<div class="ev-viaje-campos" style="display:'+(on?'flex':'none')+'">';
    h+='<input class="ev-input ev-viaje-time" data-tramo="'+tr[0]+'" type="text" readonly data-time-picker aria-haspopup="dialog" placeholder="Sin hora" value="'+(d.time||'')+'">';
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
  if(!isEdit)h+=lead;
  h+='</div><div class="ev-form-actions ev-event-form-actions"><button class="ev-btn primary" id="evFSave">Guardar</button></div>';
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
  var wrap=abrirPanel('evFWrap',renderEvForm(ev),
    {contenedor:ov,overlay:'evFormOv',alCerrar:closeEvForm});
  if(prefillDate&&!ev){
    setTimeout(function(){
      var si=document.getElementById('evFStart');
      var ei=document.getElementById('evFEnd');
      if(si)si.value=prefillDate;
      if(ei)ei.value=prefillDate;
      if(si)si.dispatchEvent(new Event('change',{bubbles:true}));
    },10);
  }
  bindEvFormEvents();
}

function closeEvForm(){
  cerrarPanel('evFWrap','evFormOv',function(){
    EV_EDIT=null;
    EV_EDIT_DS=null;
    EV_FORM_CONTAINER=null;
  });
}

function evSuggestedTitle(type){
  if(type==='Actividad cultural')return '';
  return evFixedSymbol(type)?type:({'Asturias':'Asturias','Ensayos boda':'Ensayo boda','Casa Rural':'Casa rural'}[type]||'');
}
function bindEvFormEvents(){
  var root=document.getElementById('evFWrap'),edit=EV_EDIT;
  var form={root:root,edit:edit,day:EV_EDIT_DS,autoTitle:edit?null:'',quickExtras:{},
    colorPicker:_bindColorPicker(root,'evFCp',function(){_evFormShapePreviews(form);}),shape:edit&&edit.shape||'circle',
    dates:edit&&Array.isArray(edit.dates)?edit.dates.slice():[],multiChanged:false,barSize:edit&&edit.barSize||null};
  Object.keys(EV_PICKER_GROUPS).forEach(function(k){if(edit&&evQuickSelection(edit.type,EV_PICKER_GROUPS[k]))form.quickExtras[k]=edit.type;});
  evFormRenderTypes(form,_evFormKind(form),root.querySelector('.ev-kind-picker').dataset.curType);
  bindEvTaxFields(form);_bindEvFormCategories(form);_bindEvFormAppearance(form);
  bindEvFormSchedule(form);_bindEvFormDetails(form);_bindEvFormActions(form);
}
