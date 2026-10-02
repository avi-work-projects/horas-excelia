/* Borrador y controles del formulario. Los selectores quedan acotados a su hoja. */
function _evFormEl(form,id){return form.root.querySelector('#'+id);}
function _evFormAll(form,selector){return form.root.querySelectorAll(selector);}
function _evFormKind(form){var picker=form.root.querySelector('.ev-kind-picker');return picker&&picker.dataset.curKind||'puntual';}
function _evFormColor(form){return form.colorPicker.getColor();}
function _evFormSuggestTitle(form,type){
  var input=_evFormEl(form,'evFTitle');
  if(!input.value.trim()||input.value===form.autoTitle){form.autoTitle=evSuggestedTitle(type);input.value=form.autoTitle;}
}
function _evFormTypeUI(form,kind,type){
  var key=evTypeKey(kind,type),picker=form.root.querySelector('.ev-kind-picker');
  if(picker){picker.dataset.curKind=kind;picker.dataset.curType=type;}
  var freeColor=EV_FREE_COLOR[key]&&!(kind==='puntual'&&type==='Otros'&&RUT_FIXED_COLOR[form.shape]);
  var blocks={evFColorSection:freeColor,evFOtrosExtras:EV_FREE_SHAPE[key]||EV_FREE_DATES[key]||EV_FREE_BARSIZE[key],evFBarBlock:EV_FREE_BARSIZE[key],evFShapeBlock:EV_FREE_SHAPE[key],evFDatesBlock:EV_FREE_DATES[key],evFViajeBox:kind==='grande'};
  Object.keys(blocks).forEach(function(id){var el=_evFormEl(form,id);if(el)el.style.display=blocks[id]?'block':'none';});
  var hours=_evFormEl(form,'evFHoraRow');if(hours)hours.style.display=kind==='puntual'&&type!=='Ensayos boda'?'':'none';
  var repeat=evAdmiteRepeticion(kind,type),block=_evFormEl(form,'evFRepBlock');
  if(block)block.style.display=repeat?'':'none';
  if(!repeat){
    var select=_evFormEl(form,'evFRepeat'),days=_evFormEl(form,'evWdRow');
    if(select)select.value='none';if(days)days.style.display='none';
  }
}
function _bindEvFormTypes(form){
  _evFormAll(form,'#evFTypePicker .ev-color-swatch').forEach(function(button){
    button.addEventListener('click',function(){
      _evFormAll(form,'#evFTypePicker .ev-color-swatch').forEach(function(b){b.classList.toggle('selected',b===button);});
      _evFormAll(form,'#evFTypePicker .ev-category-group').forEach(function(g){g.classList.toggle('chosen',g.contains(button));});
      var kind=button.dataset.kind||_evFormKind(form),type=button.dataset.type||'Otros';
      _evFormTypeUI(form,kind,type);
      if(EV_FREE_COLOR[evTypeKey(kind,type)])form.colorPicker.setColor(evTypeColor(kind,type));
      _evFormSuggestTitle(form,type);
    });
  });
}
function _bindEvFormCategories(form){
  _evFormEl(form,'evFTitle').addEventListener('input',function(){form.autoTitle=null;});
  _bindEvFormTypes(form);
  var selected=form.root.querySelector('#evFTypePicker .ev-color-swatch.selected');
  _evFormTypeUI(form,_evFormKind(form),selected?selected.dataset.type:'');
  _evFormAll(form,'.ev-kind-btn[data-kind]').forEach(function(button){
    button.addEventListener('click',function(){
      var kind=button.dataset.kind,picker=form.root.querySelector('.ev-kind-picker'),previous=picker&&picker.dataset.curType||'';
      _evFormAll(form,'.ev-kind-btn').forEach(function(b){b.classList.toggle('selected',b===button);});
      var type=EV_KINDS[kind].types.indexOf(previous)!==-1?previous:EV_KINDS[kind].types[0];
      _evFormEl(form,'evFTypePicker').innerHTML=_renderEvTypeSwatches(kind,type);
      _bindEvFormTypes(form);_evFormTypeUI(form,kind,type);_evFormSuggestTitle(form,type);
    });
  });
}
function _evFormShapePreviews(form){
  _evFormAll(form,'#evFShapePicker .ev-shape-preview').forEach(function(p){p.style.color=_evFormColor(form);});
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
    });
  });
  var picker=_evFormEl(form,'evFCp'),hex=form.root.querySelector('#evFCp input[type=text],#evFCp .ev-color-hex-input');
  if(picker)picker.addEventListener('click',function(){setTimeout(function(){_evFormShapePreviews(form);},50);});
  if(hex)hex.addEventListener('input',function(){_evFormShapePreviews(form);});
}
function _evFormDatesLabel(form){
  var locked=form.dates.length>1,label=_evFormEl(form,'evFPickDatesLbl');
  if(label)label.textContent=locked?form.dates.length+' días seleccionados — pulsa para editar':'🗓 Selección Multidía…';
  var row=_evFormEl(form,'evFDateRow'),note=_evFormEl(form,'evFDatesLockedNote');
  if(row)row.classList.toggle('ev-dates-locked',locked);
  ['evFStart','evFEnd'].forEach(function(id){var el=_evFormEl(form,id);if(el)el.disabled=locked;});
  if(note)note.style.display=locked?'block':'none';
}
function _bindEvFormDates(form){
  var pick=_evFormEl(form,'evFPickDates');
  if(pick)pick.addEventListener('click',function(){
    var start=_evFormEl(form,'evFStart'),year=start&&start.value?parseInt(start.value.slice(0,4),10):new Date().getFullYear();
    openOtrosDatePicker(form.dates,_evFormColor(form),year,function(dates){form.dates=dates.slice().sort();_evFormDatesLabel(form);});
  });
  _evFormEl(form,'evFRepeat').addEventListener('change',function(){_evFormEl(form,'evWdRow').style.display=this.value==='weekly'?'flex':'none';});
  _evFormAll(form,'.ev-wd-btn').forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('on');});});
  var start=_evFormEl(form,'evFTime'),end=_evFormEl(form,'evFEndTime');
  if(start&&end)start.addEventListener('input',function(){end.disabled=!start.value;if(!start.value)end.value='';});
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
