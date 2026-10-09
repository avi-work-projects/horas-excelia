/* Planes: accesos rápidos y selección provisional con confirmación. */
var EV_PLAN_PICK=null;
var EV_QUICK_PLANS=['Comida','Tomar algo','Cena'];
var EV_PICKER_GROUPS={
  plans:{generic:'Plan/Quedada',title:'Elige tu plan',label:'Plan / Quedada',quick:EV_QUICK_PLANS,types:['Comida','Tomar algo','Cena','Brunch','Barbacoa','Cumpleaños','Plan romántico','Copas','Salir de fiesta','Bolos','Cine','Ping pong','Ver partido fútbol','Juegos de mesa','Montaña','Ponencia']},
  management:{generic:'Rec. Gestiones',title:'Elige tu gestión',label:'Rec. Gestiones',quick:['Llamada','Cita','Peluquería'],legacy:['Contratar gas/electricidad'],types:['Peluquería','Médico','Dentista','Cita','Llamada','Pago','Pago hacienda','Presentar Modelo','Enviar factura','Contratar seguro','Contratar gas','Contratar electricidad']}
};
function evPickerHas(group,type){return type===group.generic||group.types.indexOf(type)>=0||(group.legacy||[]).indexOf(type)>=0;}
function evPickerMoreIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 14v7m-3.5-3.5h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';}
function renderEvQuickPlans(type,key){
  key=key||'plans';var group=EV_PICKER_GROUPS[key],other=evPickerHas(group,type)&&group.quick.indexOf(type)<0;
  return '<section class="ev-category-group'+(evPickerHas(group,type)?' chosen':'')+'" style="--category-tone:'+evTypeColor('puntual',group.generic)+'" aria-label="'+group.generic+'"><div class="ev-plan-heading">'+group.label+'</div><div class="ev-category-children ev-plan-quick" data-quick="'+key+'">'
    +group.quick.map(function(t){return _renderEvTypeButton('puntual',t,type);}).join('')
    +'<button type="button" data-picker="'+key+'" class="ev-plan-more'+(other?' selected':'')+'" aria-label="Más opciones de '+(key==='plans'?'planes':'gestiones')+'" aria-haspopup="dialog">'+evPickerMoreIcon()+'<span class="ev-type-name">'+(other&&key==='plans'?escHtml(type):'Más opciones')+'</span></button></div></section>';
}
function updateEvQuickPlan(form,type){
  form.root.querySelectorAll('.ev-plan-more').forEach(function(more){
    var group=EV_PICKER_GROUPS[more.dataset.picker],other=evPickerHas(group,type)&&group.quick.indexOf(type)<0;
    more.classList.toggle('selected',other);more.querySelector('.ev-type-name').textContent=other&&more.dataset.picker==='plans'?type:'Más opciones';
  });
}
function renderEvPlanOptions(selected,key){
  var types=EV_PICKER_GROUPS[key||'plans'].types,remainder=types.length%4,start=types.length-remainder;
  return types.map(function(t,i){
    var button=_renderEvTypeButton('puntual',t,selected).replace('>Cumpleaños</span>','>Cumple</span>'),column=remainder&&i===start?5-remainder:null;
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
  EV_PLAN_PICK={form:form,type:evPickerHas(group,current)?current:null,back:NAV_BACK};
  var h='<div class="ev-detail-overlay ev-plan-overlay" id="evPlanPickerOv"><section class="ev-detail-sheet ev-plan-sheet" role="dialog" aria-modal="true" aria-labelledby="evPlanTitle"><header class="ev-plan-header ev-type-picker"><button type="button" class="ev-color-swatch ev-picker-generic'+(current===group.generic?' selected':'')+'" data-type="'+group.generic+'" aria-label="'+group.generic+'" title="'+group.generic+'" style="color:'+evTypeColor('puntual',group.generic)+'"><span class="ev-type-dot">'+evShapeSvg(evDefaultShape({type:group.generic}))+'</span></button><h2 id="evPlanTitle">'+group.title+'</h2><button class="sy-back" id="evPlanCancel" aria-label="Cerrar selector">×</button></header><div class="ev-plan-options ev-type-picker">'+renderEvPlanOptions(EV_PLAN_PICK.type,key)+'</div><footer class="ev-plan-footer"><button class="ev-btn ev-plan-confirm" id="evPlanConfirm"'+(!EV_PLAN_PICK.type?' disabled':'')+'>Confirmar</button></footer></section></div>';
  var wrap=abrirPanel('evPlanPickerWrap',h,{contenedor:document.body,overlay:'evPlanPickerOv',alCerrar:closeEvPlanPicker});
  NAV_BACK=closeEvPlanPicker;document.addEventListener('keydown',evPlanPickerKey);
  wrap.querySelector('#evPlanCancel').onclick=closeEvPlanPicker;
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
    _evFormEl(form,'evFTypePicker').innerHTML=_renderEvTypeSwatches('puntual',type);
    _bindEvFormTypes(form);_evFormTypeUI(form,'puntual',type);_evFormSuggestTitle(form,type);
    closeEvPlanPicker();
    if(type==='Presentar Modelo')requestAnimationFrame(function(){_evFormEl(form,'evFTaxBlock').scrollIntoView({block:'nearest',behavior:'smooth'});});
  };
}
