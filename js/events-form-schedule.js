/* Cabecera y controles compactos del formulario; conserva las series antiguas. */
function evFormLegacyDays(ev,kind){
  return !!(ev&&kind==='puntual'&&getEvKind(ev)==='puntual'&&((ev.dates&&ev.dates.length>1)||(ev.end&&ev.end>ev.start)));
}
function evFormDateLabel(ds){return validIsoDate(ds)?ds.slice(8)+'/'+ds.slice(5,7):'Elegir';}
function evFormScheduleControl(id,label,value,date,disabled){
  return '<label class="ev-schedule-control'+(disabled?' disabled':'')+'" data-schedule="'+id+'"><span data-schedule-label>'+label+'</span><strong data-schedule-value>'+escHtml(date?evFormDateLabel(value):value||'Sin hora')+'</strong><input class="ev-input ev-schedule-input" id="'+id+'" aria-label="'+label+'" type="'+(date?'date':'text')+'"'+(date?'':' readonly data-time-picker aria-haspopup="dialog"')+' value="'+escHtml(value)+'"'+(disabled?' disabled':'')+'></label>';
}
function renderEvFormLead(ev,showDayNote){
  var kind=ev?getEvKind(ev):'puntual',start=ev?ev.start:evDk(new Date()),end=ev&&ev.end||start;
  var boda=ev&&getEvType(ev)==='Ensayos boda',time=ev&&(boda?ev.boda&&ev.boda.time:ev.time)||'';
  var finish=boda&&time?bodaEndAt(time,bodaDuration(ev)):ev&&ev.endTime||'';
  var legacy=evFormLegacyDays(ev,kind),note=ev&&ev.note||'';
  var h='<div class="ev-form-lead"><div class="ev-form-writing"><div class="ev-field"><label for="evFTitle">Título</label><input class="ev-input" id="evFTitle" type="text" maxlength="80" placeholder="Nombre del evento" value="'+escHtml(ev&&ev.title||'')+'"></div>';
  h+='<div class="ev-field"><label for="evFNote">'+(showDayNote?'Notas generales':'Notas')+' <span id="evCharCnt" class="ev-form-counter">'+note.length+'/200</span></label><textarea class="ev-textarea" id="evFNote" maxlength="200" placeholder="Notas opcionales…">'+escHtml(note)+'</textarea></div></div>';
  h+='<div class="ev-form-schedule"><div id="evFDateRow">'+evFormScheduleControl('evFStart',kind==='puntual'?'Día':'Fecha inicio',start,true,legacy)+evFormScheduleControl('evFEnd','Fecha fin',end,true,kind==='puntual')+'</div>';
  h+='<div id="evFHoraRow">'+evFormScheduleControl('evFTime','Hora inicio',time,false,false)+evFormScheduleControl('evFEndTime','Hora fin',finish,false,boda||!time)+'</div></div></div>';
  if(legacy)h+='<p class="sy-note ev-form-legacy">Se conservan los días de este evento anterior.</p>';
  return h;
}
function renderEvKindSymbols(kind){
  var types=kind==='puntual'?['Rec. Gestiones','Plan/Quedada','Ensayos boda','Otros']:EV_KINDS.grande.types;
  return '<span class="ev-kind-symbols" aria-hidden="true">'+types.map(function(type){
    var color=evTypeColor(kind,type);
    return kind==='grande'?'<i class="ev-kind-bar" style="background:'+color+'"></i>':'<i style="color:'+color+'">'+evShapeSvg(type==='Ensayos boda'?'x-thick':evDefaultShape({type:type}))+'</i>';
  }).join('')+'</span>';
}
function _evFormUpdateHeading(form){
  var title=_evFormEl(form,'evFTitle').value.trim(),heading=_evFormEl(form,'evFHeadingTitle');
  heading.textContent=title||(form.edit?'Editar Evento':'Nuevo Evento');heading.title=heading.textContent;
}
function _evFormScheduleState(form){
  var kind=_evFormKind(form),type=form.root.querySelector('.ev-kind-picker').dataset.curType;
  var legacy=evFormLegacyDays(form.edit,kind),start=_evFormEl(form,'evFStart'),end=_evFormEl(form,'evFEnd');
  start.disabled=legacy;end.disabled=kind==='puntual';
  if(kind==='puntual'&&!legacy)end.value=start.value;
  var time=_evFormEl(form,'evFTime'),finish=_evFormEl(form,'evFEndTime'),boda=type==='Ensayos boda';
  finish.disabled=boda||!time.value;
  if(boda)finish.value=time.value?bodaEndAt(time.value,form.edit&&form.edit.boda?bodaDuration(form.edit):bodaDefaultDuration().minutes):'';
  else if(!time.value)finish.value='';
  ['evFStart','evFEnd','evFTime','evFEndTime'].forEach(function(id){
    var input=_evFormEl(form,id),control=input.closest('[data-schedule]'),isDate=input.type==='date';
    control.classList.toggle('disabled',input.disabled);control.setAttribute('aria-disabled',String(input.disabled));
    control.querySelector('[data-schedule-value]').textContent=id==='evFEnd'&&kind==='puntual'&&!legacy?'—':isDate?evFormDateLabel(input.value):input.value||'Sin hora';
    if(id==='evFStart'){var label=kind==='puntual'?'Día':'Fecha inicio';control.querySelector('[data-schedule-label]').textContent=label;input.setAttribute('aria-label',label);}
  });
}
function bindEvFormSchedule(form){
  ['evFStart','evFEnd','evFTime','evFEndTime'].forEach(function(id){
    var input=_evFormEl(form,id);['input','change'].forEach(function(event){input.addEventListener(event,function(){_evFormScheduleState(form);});});
  });
  _evFormScheduleState(form);_evFormUpdateHeading(form);
}
