/* Borrador y controles del formulario. Los selectores quedan acotados a su hoja. */
function _evFormEl(form,id){return form.root.querySelector('#'+id);}
function _evFormAll(form,selector){return form.root.querySelectorAll(selector);}
function _evFormKind(form){var picker=form.root.querySelector('.ev-kind-picker');return picker&&picker.dataset.curKind||'puntual';}
function _evFormColor(form){return form.colorPicker.getColor();}
function _evFormSuggestTitle(form,type){
  var input=_evFormEl(form,'evFTitle');
  if(!input.value.trim()||input.value===form.autoTitle){form.autoTitle=type==='Presentar Modelo'?evTaxTitle(evFormTaxCode(form)):evSuggestedTitle(type);input.value=form.autoTitle;}
  _evFormUpdateHeading(form);
}
function _evFormTypeUI(form,kind,type){
  var key=evTypeKey(kind,type),picker=form.root.querySelector('.ev-kind-picker');
  if(picker){picker.dataset.curKind=kind;picker.dataset.curType=type;}
  var freeColor=EV_FREE_COLOR[key]&&!(kind==='puntual'&&type==='Otros'&&RUT_FIXED_COLOR[form.shape]);
  var blocks={evFCultureBlock:kind==='puntual'&&type==='Plan cultural',evFTaxBlock:kind==='puntual'&&type==='Presentar Modelo',evFColorSection:freeColor,evFOtrosExtras:EV_FREE_SHAPE[key]||EV_FREE_BARSIZE[key],evFBarBlock:EV_FREE_BARSIZE[key],evFShapeBlock:EV_FREE_SHAPE[key],evFViajeBox:kind==='grande'};
  Object.keys(blocks).forEach(function(id){var el=_evFormEl(form,id);if(el)el.style.display=blocks[id]?'block':'none';});
  _evFormScheduleState(form);
}
function _bindEvFormTypes(form){
  bindEvCultureFields(form);
  if(form.edit){var routines=form.root.querySelector('.ev-routines-active');if(routines)routines.remove();}
  else bindEvRoutineChoices(form);
  form.root.querySelectorAll('.ev-plan-more').forEach(function(more){more.onclick=function(){openEvPlanPicker(form,more.dataset.picker);};});
  _evFormAll(form,'#evFTypePicker .ev-color-swatch').forEach(function(button){
    button.addEventListener('click',function(){
      _evFormAll(form,'#evFTypePicker .ev-color-swatch').forEach(function(b){b.classList.toggle('selected',b===button);});
      _evFormAll(form,'#evFTypePicker .ev-category-group').forEach(function(g){g.classList.toggle('chosen',g.contains(button));});
      var kind=button.dataset.kind||_evFormKind(form),type=button.dataset.type||'Otros';
      _evFormTypeUI(form,kind,type);
      if(EV_FREE_COLOR[evTypeKey(kind,type)])form.colorPicker.setColor(evTypeColor(kind,type));
      _evFormSuggestTitle(form,type);
      updateEvQuickPlan(form,type);
    });
  });
}
function _bindEvFormCategories(form){
  _evFormEl(form,'evFTitle').addEventListener('input',function(){form.autoTitle=null;_evFormUpdateHeading(form);});
  _bindEvFormTypes(form);
  var selected=form.root.querySelector('#evFTypePicker .ev-color-swatch.selected');
  _evFormTypeUI(form,_evFormKind(form),selected?selected.dataset.type:form.root.querySelector('.ev-kind-picker').dataset.curType);
  _evFormAll(form,'.ev-kind-btn[data-kind]').forEach(function(button){
    button.addEventListener('click',function(){
      var kind=button.dataset.kind,picker=form.root.querySelector('.ev-kind-picker'),previous=picker&&picker.dataset.curType||'';
      _evFormAll(form,'.ev-kind-btn').forEach(function(b){b.classList.toggle('selected',b===button);});
      var type=EV_KINDS[kind].types.indexOf(previous)!==-1?previous:'';
      evFormRenderTypes(form,kind,type);
      _bindEvFormTypes(form);_evFormTypeUI(form,kind,type);_evFormSuggestTitle(form,type);
    });
  });
}
function _evFormShapePreviews(form){
  _evFormAll(form,'#evFShapePicker .ev-shape-preview').forEach(function(p){p.style.color=_evFormColor(form);});
  var other=form.root.querySelector('#evFTypePicker [data-kind="puntual"][data-type="Otros"]');
  if(other&&other.classList.contains('selected')){var dot=other.querySelector('.ev-type-dot');dot.classList.remove('ev-type-dot-multi');dot.classList.add('ev-type-symbol');dot.style.color=_evFormColor(form);dot.innerHTML=evShapeSvg(form.shape||'circle');}
}
function _bindEvFormAppearance(form){
  _evFormAll(form,'#evFBarPicker .ev-barsize-opt').forEach(function(button){
    button.addEventListener('click',function(){
      _evFormAll(form,'#evFBarPicker .ev-barsize-opt').forEach(function(b){b.classList.toggle('selected',b===button);});
      form.barSize=button.dataset.bar;
    });
  });
  _evFormAll(form,'#evFShapePicker .ev-shape-opt').forEach(function(button){
    button.addEventListener('click',function(){
      _evFormAll(form,'#evFShapePicker .ev-shape-opt').forEach(function(b){b.classList.toggle('selected',b===button);});
      form.shape=button.dataset.shape;
      var picker=form.root.querySelector('.ev-kind-picker');_evFormTypeUI(form,_evFormKind(form),picker&&picker.dataset.curType||'Otros');
      _evFormShapePreviews(form);
    });
  });
  _evFormShapePreviews(form);
}
function _evFormTravelUI(form,part){
  var box=form.root.querySelector('.ev-viaje-tramo[data-tramo="'+part+'"]');if(!box)return;
  var check=box.querySelector('.ev-viaje-chk'),fields=box.querySelector('.ev-viaje-campos'),mode=box.querySelector('.ev-viaje-modo'),driver=box.querySelector('.ev-viaje-cond'),on=check&&check.checked;
  box.classList.toggle('on',!!on);
  if(fields)fields.style.display=on?'flex':'none';if(driver)driver.style.display=on&&mode&&mode.value==='coche'?'block':'none';
}
function _bindEvFormDetails(form){
  [['evFNote','evCharCnt'],['evFDayNote','evDayCnt']].forEach(function(ids){
    var input=_evFormEl(form,ids[0]),count=_evFormEl(form,ids[1]);
    if(input&&count)input.addEventListener('input',function(){count.textContent=input.value.length+'/200';});
  });
  _evFormAll(form,'.ev-viaje-chk,.ev-viaje-modo').forEach(function(el){el.addEventListener('change',function(){_evFormTravelUI(form,el.dataset.tramo);});});
}
