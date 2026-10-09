/* Planes: accesos rápidos y selección provisional con confirmación. */
var EV_PLAN_PICK=null;
var EV_QUICK_PLANS=['Comida','Tomar algo','Cena'];
function renderEvQuickPlans(type){
  var other=evIsPlan(type)&&EV_QUICK_PLANS.indexOf(type)<0;
  return '<section class="ev-category-group'+(evIsPlan(type)?' chosen':'')+'" style="--category-tone:'+evTypeColor('puntual','Plan/Quedada')+'" aria-label="Plan/Quedada"><div class="ev-plan-heading">Plan / Quedada</div><div class="ev-category-children ev-plan-quick">'
    +EV_QUICK_PLANS.map(function(t){return _renderEvTypeButton('puntual',t,type);}).join('')
    +'<button type="button" class="ev-plan-more'+(other?' selected':'')+'" aria-label="Más opciones de planes" aria-haspopup="dialog"><span class="ev-plan-plus">+</span><span class="ev-type-name">'+(other?escHtml(type):'Más opciones')+'</span></button></div></section>';
}
function updateEvQuickPlan(form,type){
  var more=form.root.querySelector('.ev-plan-more');if(!more)return;
  var other=evIsPlan(type)&&EV_QUICK_PLANS.indexOf(type)<0;
  more.classList.toggle('selected',other);
  more.querySelector('.ev-type-name').textContent=other?type:'Más opciones';
}
function renderEvPlanOptions(selected){
  var types=EV_QUICK_PLANS.concat(['Plan/Quedada'],Object.keys(EV_PLAN_SUBTYPES).filter(function(t){return EV_QUICK_PLANS.indexOf(t)<0;}));
  var remainder=types.length%4,start=types.length-remainder;
  return types.map(function(t,i){
    var button=_renderEvTypeButton('puntual',t,selected),column=remainder&&i===start?5-remainder:null;
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
function openEvPlanPicker(form){
  var current=form.root.querySelector('.ev-kind-picker').dataset.curType;
  EV_PLAN_PICK={form:form,type:evIsPlan(current)?current:null,back:NAV_BACK};
  var h='<div class="ev-detail-overlay ev-plan-overlay" id="evPlanPickerOv"><section class="ev-detail-sheet ev-plan-sheet" role="dialog" aria-modal="true" aria-labelledby="evPlanTitle"><header class="ev-plan-header"><h2 id="evPlanTitle">Elige tu plan</h2><button class="sy-back" id="evPlanCancel" aria-label="Cerrar planes">×</button></header><div class="ev-plan-options ev-type-picker">'+renderEvPlanOptions(EV_PLAN_PICK.type)+'</div><footer class="ev-plan-footer"><button class="ev-btn ev-plan-confirm" id="evPlanConfirm"'+(!EV_PLAN_PICK.type?' disabled':'')+'>Confirmar</button></footer></section></div>';
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
  };
}
