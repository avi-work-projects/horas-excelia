/* Previsualizaciones: ensamblar renders existentes sin navegar, guardar ni perder borradores. */
function swipeWithState(changes,render){
  var saved={};Object.keys(window).filter(function(k){return /^_?[A-Z][A-Z0-9_]*$/.test(k);}).forEach(function(k){saved[k]=window[k];});
  try{
    ['DESPACHO','PERSONAL_DATA','GASTOS_ITEMS','ECON_YEAR_CONFIG','ECON_RATE_PERIODS'].forEach(function(k){if(window[k]&&typeof window[k]==='object')window[k]=JSON.parse(JSON.stringify(window[k]));});
    Object.keys(changes).forEach(function(k){window[k]=changes[k];});return render();
  }finally{Object.keys(window).filter(function(k){return /^_?[A-Z][A-Z0-9_]*$/.test(k)&&!Object.prototype.hasOwnProperty.call(saved,k);}).forEach(function(k){delete window[k];});Object.keys(saved).forEach(function(k){if(window[k]!==saved[k])window[k]=saved[k];});}
}
function swipeMonth(year,month,step){var d=new Date(year,month+step,1);return {year:d.getFullYear(),month:d.getMonth()};}
function swipeNext(items,current,step){return items[items.indexOf(current)+step]||null;}
function swipeFrame(id,html,cls){return '<div id="'+id+'" class="'+(cls||'')+'">'+html+'</div>';}
function swipeKeepsPreviewScroll(el){
  if(el.id==='eventsOverlay')return ['cal','annual','quad','puentes','time-off'].indexOf(EV_VIEW)>=0;
  if(el.id==='fiscalOverlay'||el.id==='estudioOverlay'||el.id==='householdOverlay'||el.matches('.ev-bday-body'))return true;
  return !!el.closest('#energyAnalysisOverlay')&&!el.matches('.energy-window');
}
function swipeCalendarPreview(year,month,kind){
  var template=document.createElement('template');template.innerHTML=swipeWithState({EV_YEAR:year,EV_MONTH:month},renderEvCalMonth);
  var cal=template.content.querySelector('.ev-month-wrap'),weeks=cal.querySelectorAll('.ev-week-outer').length;
  for(var i=weeks;i<6;i++){var spacer=document.createElement('div');spacer.className='rut-calendar-spacer';cal.appendChild(spacer);}
  if(kind==='extra'&&RUT_RECOVERY_PICK.date){var day=cal.querySelector('[data-ds="'+RUT_RECOVERY_PICK.date+'"]');if(day)day.classList.add('rut-day-selected');}
  if(kind==='week'){var routine=rutById(RUT_WEEK_CAL.rid);cal.querySelectorAll('.ev-week-outer').forEach(function(w){var cell=w.querySelector('.ev-cell[data-ds]');if(cell&&routine&&routine.weeks&&routine.weeks[rutWeekKey(cell.dataset.ds)])w.classList.add('rut-wk-cambiada');});}
  return kind==='extra'?swipeFrame('rutAdditionOv','<div class="rut-dpick-real">'+cal.outerHTML+'</div>'):swipeFrame('rutWkOv','<div class="rut-wpick-real">'+cal.outerHTML+'</div>');
}
function swipeEventsPreview(step){
  var changes={},next,month;
  if(EV_VIEW==='rutinas'){next=swipeNext(['lista','stats'],RUT_SUBTAB,step);if(!next)return null;changes.RUT_SUBTAB=next;}
  else if(EV_VIEW==='bodas'){
    next=swipeNext(['clases','parejas','calendario','stats','config'],BODA_SUBTAB,step);if(!next)return null;changes.BODA_SUBTAB=next;
    if(next==='parejas'){changes.BODA_PAREJAS_FILTER='activas';changes.BODA_PAREJAS_CLASSES=null;changes.BODA_PAREJAS_SORT='boda';}
  }else if(['upcoming','birthdays','week','months','stats'].indexOf(EV_VIEW)>=0){
    next=swipeNext(['upcoming','week','months','stats'],EV_VIEW==='birthdays'?'upcoming':EV_VIEW,step);if(!next)return null;
    changes.EV_VIEW=next;changes.EV_EDIT_MODE=false;
    if(EV_VIEW_STATE[next]){if(EV_VIEW_STATE[next].year!=null)changes.EV_YEAR=EV_VIEW_STATE[next].year;if(EV_VIEW_STATE[next].month!=null)changes.EV_MONTH=EV_VIEW_STATE[next].month;}
  }else if(['annual','puentes','time-off'].indexOf(EV_VIEW)>=0)changes.EV_YEAR=EV_YEAR+step;
  else if(EV_VIEW==='quad'){month=swipeMonth(EV_QUAD_YEAR,EV_QUAD_MONTH,step);changes.EV_QUAD_YEAR=month.year;changes.EV_QUAD_MONTH=month.month;}
  else if(EV_VIEW==='cal'){month=swipeMonth(EV_YEAR,EV_MONTH,step);changes.EV_YEAR=month.year;changes.EV_MONTH=month.month;}
  else return null;
  return swipeWithState(changes,function(){return swipeFrame('eventsOverlay',renderEvContent(),'full-overlay');});
}
function swipeRenderPreview(el,step){
  var next,month,changes={};
  if(el.id==='eventsOverlay')return swipeEventsPreview(step);
  if(el.id==='weeksContainer'){
    month=swipeMonth(CY,CM,step);return swipeWithState({CY:month.year,CM:month.month},function(){var c=document.createElement('div');c.id='weeksContainer';buildHomeCalendar(c);return c.outerHTML;});
  }
  if(el.id==='econOverlay'){
    next=swipeNext(['resumen','dias','gastos','analisis'],ECON_VIEW,step);return next?swipeWithState({ECON_VIEW:next},function(){return swipeFrame('econOverlay',renderEconContent(),'full-overlay');}):null;
  }
  if(el.id==='fiscalOverlay'){
    next=swipeNext(['personal','gastos_desg','irpf_deduc','despacho'],FISCAL_TAB,step);return next?swipeWithState({FISCAL_TAB:next},function(){if(next==='personal')loadPersonalYear(FISCAL_YEAR);if(next==='gastos_desg')loadGastosYear(FISCAL_YEAR);return swipeFrame('fiscalOverlay',renderFiscalContent(),'full-overlay');}):null;
  }
  if(el.id==='estudioOverlay'){
    next=swipeNext(['comparador','simulador','hipoteca','gas','elect'],ECON_ESTUDIO_SUB,step);return next?swipeWithState({ECON_ESTUDIO_SUB:next},function(){return swipeFrame('estudioOverlay',renderEstudioContent(),'full-overlay');}):null;
  }
  if(el.id==='householdOverlay'){
    next=swipeNext(['resumen','detalle','gas','elect'],FISCAL_HIP_SUB,step);return next?swipeWithState({FISCAL_HIP_SUB:next},function(){return swipeFrame('householdOverlay',renderHouseholdContent(),'full-overlay');}):null;
  }
  if(el.closest('#energyAnalysisOverlay')){
    if(el.matches('.energy-window')){next=swipeNext(ENERGY_ANALYSIS_TABS.map(function(t){return t[0];}),ENERGY_ANALYSIS_TAB,step);if(!next)return null;changes.ENERGY_ANALYSIS_TAB=next;}
    else{changes.ENERGY_ANALYSIS_YEAR=ENERGY_ANALYSIS_YEAR+step;changes.ENERGY_SUMMARY_TOTAL=false;}
    return swipeWithState(changes,function(){return swipeFrame('energyAnalysisOverlay',energyAnalysisHtml(ENERGY_ANALYSIS_KIND),'full-overlay energy-window');});
  }
  if(el.matches('.ev-bday-body')){if(BDAY_VIEW!=='cal')return null;month=swipeMonth(BDAY_YEAR,BDAY_MONTH,step);return swipeWithState({BDAY_YEAR:month.year,BDAY_MONTH:month.month},function(){return swipeFrame('eventsOverlay',swipeFrame('eventsContent',renderBdayContent()));});}
  if(el.id==='bodaCalGrid'){
    month=swipeMonth(BODA_CAL_YEAR,BODA_CAL_MONTH,step);return swipeWithState({BODA_CAL_YEAR:month.year,BODA_CAL_MONTH:month.month,BODA_CAL_DAY:null},function(){return swipeFrame('eventsOverlay',renderEvContent(),'full-overlay');});
  }
  if(el.matches('.boda-asg-grid')){month=swipeMonth(BODA_ASSIGN.year,BODA_ASSIGN.month,step);return swipeFrame('bodaAsgSheet',renderBodaAssignHtml(Object.assign({},BODA_ASSIGN,month)));}
  if(el.matches('.rut-dpick-real')){month=swipeMonth(RUT_RECOVERY_PICK.year,RUT_RECOVERY_PICK.month,step);return swipeCalendarPreview(month.year,month.month,'extra');}
  if(el.matches('.rut-wpick-real')){month=swipeMonth(RUT_WEEK_CAL.y,RUT_WEEK_CAL.m,step);return swipeCalendarPreview(month.year,month.month,'week');}
  return null;
}
