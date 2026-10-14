/* Cabecera y controles compactos del formulario; conserva las series antiguas. */
function evFormLegacyDays(ev,kind){
  return !!(ev&&kind==='puntual'&&getEvKind(ev)==='puntual'&&((ev.dates&&ev.dates.length>1)||(ev.end&&ev.end>ev.start)));
}
function evFormDateLabel(ds){return validIsoDate(ds)?ds.slice(8)+'/'+ds.slice(5,7):'Elegir';}
function evFormScheduleControl(id,label,value,date,disabled){
  return '<div class="ev-schedule-field"><label data-schedule-label for="'+id+'">'+label+'</label><label class="ev-schedule-control'+(disabled?' disabled':'')+'" data-schedule="'+id+'"><strong data-schedule-value>'+escHtml(date?evFormDateLabel(value):value||'Sin hora')+'</strong><input class="ev-input ev-schedule-input" id="'+id+'" aria-label="'+label+'" type="'+(date?'date':'text')+'"'+(date?'':' readonly data-time-picker aria-haspopup="dialog"')+' value="'+escHtml(value)+'"'+(disabled?' disabled':'')+'></label></div>';
}
function renderEvFormLead(ev,showDayNote){
  var kind=ev?getEvKind(ev):'puntual',start=ev?ev.start:evDk(new Date()),end=ev&&ev.end||start;
  var boda=ev&&getEvType(ev)==='Ensayos boda',time=ev&&(boda?ev.boda&&ev.boda.time:ev.time)||'';
  var finish=boda&&time?bodaEndAt(time,bodaDuration(ev)):ev&&ev.endTime||'';
  var legacy=evFormLegacyDays(ev,kind),note=ev&&ev.note||'';
  var multi=!!EV_FREE_DATES[evTypeKey(kind,ev?getEvType(ev):'')];
  var h='<div class="ev-form-lead"><div class="ev-form-writing"><div class="ev-field"><label for="evFTitle">Título</label><input class="ev-input" id="evFTitle" type="text" maxlength="80" placeholder="Nombre del evento" value="'+escHtml(ev&&ev.title||'')+'"></div>';
  h+='<div class="ev-field"><label for="evFNote">'+(showDayNote?'Notas generales':'Notas')+' <span id="evCharCnt" class="ev-form-counter">'+note.length+'/200</span></label><textarea class="ev-textarea" id="evFNote" maxlength="200" placeholder="Notas opcionales…">'+escHtml(note)+'</textarea></div></div>';
  h+='<div class="ev-form-schedule"><div id="evFHoraRow">'+evFormScheduleControl('evFTime','Hora',time,false,false)+evFormScheduleControl('evFEndTime','Hora fin',finish,false,boda||!time)+'</div>';
  h+='<div id="evFDateRow">'+evFormScheduleControl('evFStart','Día',start,true,legacy)+evFormScheduleControl('evFEnd','Día fin',end,true,kind==='puntual')+'</div></div></div>';
  if(legacy)h+='<p class="sy-note ev-form-legacy">'+(multi?'Edita los días desde Multidía.':'Se conservan los días de este evento anterior.')+'</p>';
  return h;
}
function renderEvKindSymbols(kind){
  var types=kind==='puntual'?['Rec. Gestiones','Plan/Quedada','Ensayos boda','Otros']:EV_KINDS.grande.types.slice(0,3);
  return '<span class="ev-kind-symbols" aria-hidden="true">'+types.map(function(type){
    var color=evTypeColor(kind,type);
    if(kind==='puntual'&&type==='Otros')return '<i class="ev-kind-multicolor ev-type-dot-multi"></i>';
    return kind==='grande'?'<i class="ev-kind-bar" style="background:'+color+'"></i>':'<i style="color:'+color+'">'+evShapeSvg(type==='Ensayos boda'?'x-thick':evDefaultShape({type:type}))+'</i>';
  }).join('')+'</span>';
}
function _evFormUpdateHeading(form){
  var title=_evFormEl(form,'evFTitle').value.trim(),heading=_evFormEl(form,'evFHeadingTitle');
  heading.textContent=title||(form.edit?'Editar Evento':'Nuevo Evento');heading.title=heading.textContent;
}
function _evFormScheduleState(form){
  var kind=_evFormKind(form),type=form.root.querySelector('.ev-kind-picker').dataset.curType;
  var legacy=evFormLegacyDays(form.edit,kind)&&!form.multiChanged,allowed=!!EV_FREE_DATES[evTypeKey(kind,type)];
  var multi=allowed&&form.dates.length>1,start=_evFormEl(form,'evFStart'),end=_evFormEl(form,'evFEnd');
  start.disabled=legacy||multi;end.disabled=kind==='puntual';
  if(multi&&!legacy)start.value=form.dates[0];
  if(kind==='puntual'&&!legacy)end.value=start.value;
  _evFormAll(form,'[data-ev-multiday]').forEach(function(pick){
    var active=allowed&&pick.dataset.evMultiday===type;
    pick.disabled=!active;pick.querySelector('small').textContent=active&&form.dates.length?form.dates.length+' '+(form.dates.length===1?'día':'días'):'';
  });
  var previous=form.root.querySelector('.ev-form-legacy');if(previous)previous.hidden=!!form.multiChanged;
  var time=_evFormEl(form,'evFTime'),finish=_evFormEl(form,'evFEndTime'),boda=type==='Ensayos boda';
  finish.disabled=boda||!time.value;
  if(boda)finish.value=time.value?bodaEndAt(time.value,form.edit&&form.edit.boda?bodaDuration(form.edit):bodaDefaultDuration().minutes):'';
  else if(!time.value)finish.value='';
  ['evFStart','evFEnd','evFTime','evFEndTime'].forEach(function(id){
    var input=_evFormEl(form,id),control=input.closest('[data-schedule]'),isDate=input.type==='date';
    control.classList.toggle('disabled',input.disabled);control.setAttribute('aria-disabled',String(input.disabled));
    control.querySelector('[data-schedule-value]').textContent=id==='evFStart'&&multi?form.dates.length+' días':id==='evFEnd'&&kind==='puntual'&&!legacy?'—':isDate?evFormDateLabel(input.value):input.value||'Sin hora';
  });
}
function bindEvFormSchedule(form){
  ['evFStart','evFEnd','evFTime','evFEndTime'].forEach(function(id){
    var input=_evFormEl(form,id);['input','change'].forEach(function(event){input.addEventListener(event,function(){if(id==='evFStart'&&!input.disabled&&form.dates.length===1)form.dates=[input.value];_evFormScheduleState(form);});});
  });
  _evFormScheduleState(form);_evFormUpdateHeading(form);
}
function bindEvFormMultiday(form){
  _evFormAll(form,'[data-ev-multiday]').forEach(function(button){button.onclick=function(){
    var picker=form.root.querySelector('.ev-kind-picker');if(!EV_FREE_DATES[evTypeKey(_evFormKind(form),picker.dataset.curType)])return;
    var start=_evFormEl(form,'evFStart'),dates=form.dates.length?form.dates:!form.multiChanged&&evFormLegacyDays(form.edit,_evFormKind(form))?evPuntualDays(form.edit):[];
    openOtrosDatePicker(dates,_evFormColor(form),start.value?Number(start.value.slice(0,4)):new Date().getFullYear(),function(selected){
      form.dates=selected.slice().sort();form.multiChanged=true;if(form.dates.length)start.value=form.dates[0];_evFormScheduleState(form);
    });
  };});
}
