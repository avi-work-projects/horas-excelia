/* Lectura, validación y persistencia: el borrador no modifica EVENTS hasta Guardar. */
function _evFormRead(form){
  var title=_evFormEl(form,'evFTitle').value.trim();
  if(!title){showToast('El título es obligatorio','error');return null;}
  var selected=form.root.querySelector('#evFTypePicker .ev-color-swatch.selected'),picker=form.root.querySelector('.ev-kind-picker');
  var kind=selected&&selected.dataset.kind||picker&&picker.dataset.curKind||'puntual';
  var type=selected&&selected.dataset.type||picker&&picker.dataset.curType||'Otros',key=evTypeKey(kind,type);
  var taxModel=type==='Presentar Modelo'?evFormTaxCode(form):null;
  if(taxModel!==null&&!/^\d{3}$/.test(taxModel)){showToast('Escribe el código de modelo de tres cifras','error');return null;}
  var start=_evFormEl(form,'evFStart').value,end=_evFormEl(form,'evFEnd').value;
  if(!start){showToast('La fecha de inicio es obligatoria','error');return null;}
  if(!end||end<start)end=start;
  var repType=_evFormEl(form,'evFRepeat').value,repeat=null;
  if(repType==='weekly'){
    var days=[];_evFormAll(form,'.ev-wd-btn.on').forEach(function(b){days.push(+b.dataset.wd);});
    if(!days.length){showToast('Selecciona al menos un día','error');return null;}
    repeat={type:'weekly',weekDays:days};
  }else if(repType!=='none')repeat={type:repType};
  var event={id:form.edit?form.edit.id:'ev-'+Date.now(),title:title,note:_evFormEl(form,'evFNote').value.trim(),color:EV_FREE_COLOR[key]?_evFormColor(form):evTypeColor(kind,type),kind:kind,type:type,start:start,end:end,repeat:repeat};
  if(taxModel!==null)event.taxModel=taxModel;
  if(EV_FREE_DATES[key]&&form.dates.length>1)event.dates=form.dates.slice().sort();
  if(EV_FREE_SHAPE[key]&&form.shape)event.shape=form.shape;
  if(EV_FREE_BARSIZE[key]){
    var bar=form.root.querySelector('#evFBarPicker .ev-barsize-opt.selected'),size=bar?bar.dataset.bar:form.barSize;
    if(size)event.barSize=size;
  }
  _evFormReadDetails(form,event);return event;
}
function _evFormReadDetails(form,event){
  if(event.kind==='puntual'&&event.type!=='Ensayos boda'){
    var start=_evFormEl(form,'evFTime'),end=_evFormEl(form,'evFEndTime');
    if(start&&start.value){event.time=start.value;if(end&&end.value>start.value)event.endTime=end.value;}
  }
  if(event.kind==='grande'){
    var travel={};['ida','vuelta'].forEach(function(part){
      var box=form.root.querySelector('.ev-viaje-tramo[data-tramo="'+part+'"]');if(!box)return;
      var check=box.querySelector('.ev-viaje-chk');if(!check||!check.checked)return;
      var time=box.querySelector('.ev-viaje-time'),mode=box.querySelector('.ev-viaje-modo'),driver=box.querySelector('.ev-viaje-cond');
      // Medio y conductor se conservan aunque el trayecto aún no tenga hora.
      var leg={time:time&&time.value?time.value:null,modo:mode?mode.value:'tren'};
      if(leg.modo==='coche'&&driver&&driver.value.trim())leg.conductor=driver.value.trim();travel[part]=leg;
    });if(travel.ida||travel.vuelta)event.viaje=travel;
  }
  if(form.edit&&form.edit.dayNotes)event.dayNotes=JSON.parse(JSON.stringify(form.edit.dayNotes));
  var note=_evFormEl(form,'evFDayNote');
  if(note&&form.day){var value=note.value.trim();if(value){event.dayNotes=event.dayNotes||{};event.dayNotes[form.day]=value;}else if(event.dayNotes)delete event.dayNotes[form.day];}
  if(form.edit&&form.edit.boda)event.boda=form.edit.boda;
}
function _evFormSaveBodas(form,event){
  if(event.type!=='Ensayos boda')return false;
  var days=event.dates?event.dates.slice():[event.start];
  if(!event.dates&&event.end>event.start){
    days=[];var end=new Date(event.end+'T00:00:00'),guard=0;
    for(var day=new Date(event.start+'T00:00:00');day<=end&&guard<400;day.setDate(day.getDate()+1),guard++)days.push(evDk(day));
  }
  if(form.edit&&days.length===1){
    delete event.dates;
    event.boda=form.edit.boda||{coupleId:null,time:null,duration:bodaDefaultDuration().minutes,durationId:bodaDefaultDuration().id,place:typeof BODA_PLACE_DEFAULT!=='undefined'?BODA_PLACE_DEFAULT:'casa'};
    return false;
  }
  // Cada día crea una clase independiente. Deshacer restaura también los cierres.
  var previous=form.edit?JSON.parse(JSON.stringify(form.edit)):null;
  var beforeIds=EVENTS.map(function(e){return e.id;}),closedBefore=JSON.parse(JSON.stringify(BODA_CLOSED));
  if(form.edit)EVENTS=EVENTS.filter(function(e){return e.id!==form.edit.id;});
  var count=typeof bodaBulkCreate==='function'?bodaBulkCreate(days):0;
  var created=EVENTS.filter(function(e){return beforeIds.indexOf(e.id)===-1;}).map(function(e){return e.id;});
  EVENTS.forEach(function(e){if(created.indexOf(e.id)!==-1){e.title=event.title;e.note=event.note;}});
  if(!count&&previous)EVENTS.push(previous);
  saveEvents();updateEventsBtn();closeEvForm();setTimeout(function(){refreshEvents();},320);
  showToast(count===1?'1 clase creada':count+' clases creadas — asígnalas en la pestaña Bodas',count?'success':'error',function(){
    EVENTS=EVENTS.filter(function(e){return created.indexOf(e.id)===-1;});
    if(previous&&count)EVENTS.push(previous);
    days.forEach(function(ds){if(closedBefore[ds])BODA_CLOSED[ds]=closedBefore[ds];});saveBodaClosed();
    saveEvents();updateEventsBtn();refreshEvents();
  });return true;
}
function _evFormCommit(form,event){
  var full=evDayLimitExceeded(event,form.edit?form.edit.id:null);
  if(full){showToast('El '+_fmtDayEs(full)+(isEvBarAlways(event)?' ya tiene 2 eventos grandes de ese grosor':' ya tiene '+EV_MAX_PUNT_DIA+' eventos puntuales (el máximo)'),'error');return;}
  if(form.edit){
    var index=EVENTS.findIndex(function(e){return e.id===form.edit.id;});if(index!==-1)EVENTS[index]=event;
    var previous=JSON.parse(JSON.stringify(form.edit));
    showToast('Evento actualizado','success',function(){
      var i=EVENTS.findIndex(function(e){return e.id===previous.id;});if(i!==-1)EVENTS[i]=previous;
      saveEvents();updateEventsBtn();refreshEvents();
    });
  }else{
    EVENTS.push(event);
    showToast('Evento creado','success',function(){EVENTS=EVENTS.filter(function(e){return e.id!==event.id;});saveEvents();updateEventsBtn();refreshEvents();});
  }
  saveEvents();updateEventsBtn();closeEvForm();setTimeout(function(){refreshEvents();},320);
}
function _evFormDelete(form){
  if(!form.edit)return;
  var deleted=form.edit,index=EVENTS.findIndex(function(e){return e.id===deleted.id;});
  EVENTS=EVENTS.filter(function(e){return e.id!==deleted.id;});saveEvents();updateEventsBtn();closeEvForm();
  setTimeout(function(){
    refreshEvents();showToast('Evento eliminado','success',function(){
      if(index>=0)EVENTS.splice(index,0,deleted);else EVENTS.push(deleted);
      saveEvents();updateEventsBtn();refreshEvents();
    });
  },320);
}
function _bindEvFormActions(form){
  _evFormEl(form,'evFClose').addEventListener('click',closeEvForm);
  var del=_evFormEl(form,'evFDel');if(del)del.addEventListener('click',function(){_evFormDelete(form);});
  _evFormEl(form,'evFSave').addEventListener('click',function(){
    var event=_evFormRead(form);if(!event||_evFormSaveBodas(form,event))return;_evFormCommit(form,event);
  });
}
