/* Planes: accesos rápidos y selección provisional con confirmación. */
var EV_PLAN_PICK=null;
var EV_QUICK_PLANS=['Comida','Tomar algo','Cena'];
var EV_PICKER_GROUPS={
  plans:{accent:'#bd6119',generic:'Plan/Quedada',title:'Elige tu Plan',label:'Plan / Quedada',quick:EV_QUICK_PLANS,types:['Comida','Tomar algo','Cena','Barbacoa','Desayunar','Brunch','Merendar','Cumpleaños','¡Sorpresa!','Ir a casa de','Salir de fiesta','Salir a bailar','Navidad','Fiesta','Boda','Ver partido fútbol','Plan cultural','Ponencia','Cine','Bolos','Juegos de mesa','Torneo','Montaña','Plan exterior','Salir a Correr','Carrera','Pádel','Ping pong','Fútbol','Hacer deporte']},
  management:{accent:'#27845c',generic:'Rec. Gestiones',title:'Elige tu Gestión',label:'Rec. Gestiones',quick:['Llamada','Cita','Peluquería'],legacy:['Contratar gas/electricidad'],types:['Peluquería','Médico','Dentista','Cita','Llamada','Contratar seguro','Contratar gas','Contratar electricidad','Enviar factura','Pago','Pago Hacienda','Presentar Modelo']}
};
function evPickerHas(group,type){return type===group.generic||group.types.indexOf(type)>=0||(group.legacy||[]).indexOf(type)>=0;}
function evPickerMoreIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 14v7m-3.5-3.5h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';}
function evQuickSelection(type,group){
  return evPickerHas(group,type)&&type!==group.generic&&group.quick.indexOf(type)<0?'✓ '+(type==='Contratar electricidad'?'Contratar electric.':type):'';
}
function renderEvQuickPlans(type,key,extra,romantic){
  key=key||'plans';var group=EV_PICKER_GROUPS[key],selection=evQuickSelection(type,group),remembered=extra||(selection?type:null);
  return '<section class="ev-category-group ev-quick-group'+(evPickerHas(group,type)?' chosen':'')+'" data-group="'+key+'" style="--category-tone:'+evTypeColor('puntual',group.generic)+';--picker-accent:'+group.accent+'" aria-label="'+group.generic+'"><div class="ev-quick-header">'+_renderEvTypeButton('puntual',group.generic,type,romantic)
    +(remembered?'<div class="ev-quick-selection">'+_renderEvTypeButton('puntual',remembered,type,romantic)+'</div>':'')+'</div><div class="ev-category-children ev-plan-quick" data-quick="'+key+'">'
    +group.quick.map(function(t){return _renderEvTypeButton('puntual',t,type,romantic);}).join('')
    +'<button type="button" data-picker="'+key+'" class="ev-plan-more'+(selection?' selected':'')+'" aria-label="Más Opciones de '+(key==='plans'?'planes':'gestiones')+'" aria-haspopup="dialog">'+evPickerMoreIcon()+'<span class="ev-type-name">Más Opciones</span></button></div>'+(key==='plans'?renderEvPlanFlags('evF',romantic):'')+'</section>';
}
/* Distintivo del plan: romántico o cumpleaños, excluyentes (v575). */
function evFormBadge(o){return o&&o.birthday?'birthday':o&&o.romantic?'romantic':null;}
function renderEvPlanFlags(prefix,badge){
  return '<div class="ev-plan-flags">'
    +'<label class="ev-romantic-toggle" for="'+prefix+'Romantic"><span class="ev-romantic-toggle-symbol" aria-hidden="true">'+evShapeSvg('heart')+'</span><span>Plan romántico</span><input type="checkbox" id="'+prefix+'Romantic"'+(badge==='romantic'?' checked':'')+'></label>'
    +'<label class="ev-romantic-toggle ev-birthday-toggle" for="'+prefix+'Birthday"><span class="ev-romantic-toggle-symbol" aria-hidden="true">'+evShapeSvg('cake')+'</span><span>Cumpleaños</span><input type="checkbox" id="'+prefix+'Birthday"'+(badge==='birthday'?' checked':'')+'></label>'
    +'</div>';
}
function paintEvRomanticSymbols(scope,badge){
  scope.querySelectorAll('[data-type]').forEach(function(button){
    var t=button.dataset.type;if(!evIsPlan(t))return;
    var symbol=button.querySelector('.ev-type-dot');if(symbol)symbol.innerHTML=evShapeSvg(evDefaultShape({type:t}),badge==='birthday'&&t==='Cumpleaños'?false:badge);
  });
}
/* Engancha las dos casillas sobre un estado {romantic,birthday}: marcar una desmarca la otra. */
function bindEvPlanFlags(root,prefix,state,scope){
  var r=root.querySelector('#'+prefix+'Romantic'),b=root.querySelector('#'+prefix+'Birthday');if(!r||!b)return;
  function sync(changed){
    if(changed===r&&r.checked)b.checked=false;
    if(changed===b&&b.checked)r.checked=false;
    state.romantic=r.checked;state.birthday=b.checked;
    paintEvRomanticSymbols(scope(),evFormBadge(state));
  }
  r.onchange=function(){sync(r);};b.onchange=function(){sync(b);};
}
function bindEvRomanticField(form){
  bindEvPlanFlags(form.root,'evF',form,function(){return form.root.querySelector('[data-group="plans"]')||form.root;});
}
/* Marca «Más Opciones» del grupo que tiene elegido un tipo fuera de los accesos rápidos.
   (Se perdió al reescribir las casillas en v575 y rompía al elegir un acceso rápido.) */
function updateEvQuickPlan(form,type){
  form.root.querySelectorAll('.ev-quick-group').forEach(function(section){
    section.querySelector('.ev-plan-more').classList.toggle('selected',!!evQuickSelection(type,EV_PICKER_GROUPS[section.dataset.group]));
  });
}
function evFormRenderTypes(form,kind,type){
  var tax=_evFormEl(form,'evFTaxBlock');if(tax)tax.remove();
  var culture=_evFormEl(form,'evFCultureBlock');if(culture)culture.remove();
  _evFormEl(form,'evFTypePicker').innerHTML=_renderEvTypeSwatches(kind,type,form.quickExtras,evFormBadge(form));
  if(tax)(form.root.querySelector('[data-group="management"]')||form.root).appendChild(tax);
  if(culture)(form.root.querySelector('[data-group="plans"]')||form.root).appendChild(culture);
}
function renderEvPlanOptions(selected,key,romantic){
  var types=EV_PICKER_GROUPS[key||'plans'].types,remainder=types.length%4,start=types.length-remainder;
  return types.map(function(t,i){
    var button=_renderEvTypeButton('puntual',t,selected,romantic).replace('>Cumpleaños</span>','>Cumple</span>'),column=remainder&&i===start?5-remainder:null;
    return '<div class="ev-plan-option" style="grid-column:'+(column?column+' / ':'')+'span 2">'+button+'</div>';
  }).join('');
}
function closeEvPlanPicker(){
  if(!EV_PLAN_PICK)return;
  NAV_BACK=EV_PLAN_PICK.back;EV_PLAN_PICK=null;
  document.removeEventListener('keydown',evPlanPickerKey);
  cerrarPanel('evPlanPickerWrap','evPlanPickerOv');
}
function evPlanPickerKey(e){
  if(e.key==='Escape'){e.preventDefault();closeEvPlanPicker();}
}
function openEvPlanPicker(form,key){
  key=key||'plans';var group=EV_PICKER_GROUPS[key];
  var current=form.root.querySelector('.ev-kind-picker').dataset.curType;
  EV_PLAN_PICK={form:form,type:evPickerHas(group,current)?current:null,romantic:key==='plans'&&form.romantic,birthday:key==='plans'&&!!form.birthday,back:NAV_BACK};
  var h='<div class="ev-detail-overlay ev-plan-overlay" id="evPlanPickerOv"><section class="ev-detail-sheet ev-plan-sheet" style="--picker-accent:'+group.accent+'" role="dialog" aria-modal="true" aria-labelledby="evPlanTitle"><header class="ev-plan-header ev-type-picker"><button type="button" class="ev-color-swatch ev-picker-generic'+(current===group.generic?' selected':'')+'" data-type="'+group.generic+'" aria-label="'+group.generic+'" title="'+group.generic+'" style="color:'+evTypeColor('puntual',group.generic)+'"><span class="ev-type-dot">'+evShapeSvg(evDefaultShape({type:group.generic}),evFormBadge(EV_PLAN_PICK))+'</span></button><h2 id="evPlanTitle">'+group.title+'</h2><button class="sy-back" id="evPlanCancel" aria-label="Cerrar selector">×</button></header>'+(key==='plans'?renderEvPlanFlags('evPlan',evFormBadge(EV_PLAN_PICK)):'')+'<div class="ev-plan-options ev-type-picker">'+renderEvPlanOptions(EV_PLAN_PICK.type,key,evFormBadge(EV_PLAN_PICK))+'</div><footer class="ev-plan-footer"><button class="ev-btn ev-plan-confirm" id="evPlanConfirm"'+(!EV_PLAN_PICK.type?' disabled':'')+'>Confirmar</button></footer></section></div>';
  var wrap=abrirPanel('evPlanPickerWrap',h,{contenedor:document.body,overlay:'evPlanPickerOv',alCerrar:closeEvPlanPicker});
  wrap.querySelector('.ev-plan-sheet').dataset.pickerKind=key;
  NAV_BACK=closeEvPlanPicker;document.addEventListener('keydown',evPlanPickerKey);
  wrap.querySelector('#evPlanCancel').onclick=closeEvPlanPicker;
  bindEvPlanFlags(wrap,'evPlan',EV_PLAN_PICK,function(){return wrap;});
  wrap.querySelectorAll('[data-type]').forEach(function(button){
    button.setAttribute('aria-pressed',String(button.dataset.type===EV_PLAN_PICK.type));
    button.onclick=function(){
      EV_PLAN_PICK.type=button.dataset.type;
      wrap.querySelectorAll('[data-type]').forEach(function(b){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
      wrap.querySelector('#evPlanConfirm').disabled=false;
    };
  });
  wrap.querySelector('#evPlanConfirm').onclick=function(){
    var type=EV_PLAN_PICK.type;if(!type)return;
    if(key==='plans'){form.romantic=EV_PLAN_PICK.romantic;form.birthday=EV_PLAN_PICK.birthday;}
    if(evQuickSelection(type,group))form.quickExtras[key]=type;
    evFormRenderTypes(form,'puntual',type);
    _bindEvFormTypes(form);_evFormTypeUI(form,'puntual',type);_evFormSuggestTitle(form,type);
    closeEvPlanPicker();
    if(type==='Presentar Modelo'||type==='Plan cultural')requestAnimationFrame(function(){_evFormEl(form,type==='Plan cultural'?'evFCultureBlock':'evFTaxBlock').scrollIntoView({block:'nearest',behavior:'smooth'});});
  };
}

var EV_CULTURE_OPTIONS=['Monólogo','Teatro','Scape Room','Otro'];
function renderEvCultureFields(ev){
  var value=ev&&(ev.culturalPlan||(getEvType(ev)==='Plan cultural'?'Otro':''))||'';
  return '<div class="ev-tax-model" id="evFCultureBlock" style="display:'+(ev&&getEvType(ev)==='Plan cultural'?'block':'none')+'"><label>Tipo de plan cultural</label><div class="ev-tax-menu">'+EV_CULTURE_OPTIONS.map(function(option){return '<button type="button" data-culture="'+option+'" aria-pressed="'+(value===option)+'">'+option+'</button>';}).join('')+'</div></div>';
}
function bindEvCultureFields(form){
  form.root.querySelectorAll('[data-culture]').forEach(function(button){button.onclick=function(){
    form.root.querySelectorAll('[data-culture]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});
    var input=_evFormEl(form,'evFTitle');if(!input.value.trim()||input.value===form.autoTitle){form.autoTitle=button.dataset.culture==='Otro'?'Plan cultural':button.dataset.culture;input.value=form.autoTitle;}
    _evFormUpdateHeading(form);
  };});
}
