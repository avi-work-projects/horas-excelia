/* Selección Multidía: borrador explícito, vista mensual táctil y resumen anual. */
var EV_DATE_PICKER=null;
function evDatePickerMonth(state,month,mini){
  var first=new Date(state.year,month,1),offset=(first.getDay()+6)%7,last=new Date(state.year,month+1,0).getDate();
  var h='<div class="'+(mini?'dp-mini-days':'dp-calendar')+'">';
  for(var i=0;i<42;i++){
    var day=i-offset+1,valid=day>0&&day<=last,ds=valid?evDk(new Date(state.year,month,day)):'';
    var selected=valid&&!!state.selected[ds],cls=(mini?'dp-mini-day':'dp-day')+(!valid?' out':'')+(i%7>=5?' wk':'')+(selected?' sel':'');
    var style=selected?' style="background:'+state.color+';border-color:'+state.color+';color:'+state.ink+'"':'';
    h+=mini?'<span class="'+cls+'"'+style+'>'+(valid?day:'')+'</span>':'<button type="button" class="'+cls+'"'+(!valid?' disabled aria-hidden="true"':' data-ds="'+ds+'" aria-label="'+day+' '+MN[month]+' '+state.year+'" aria-pressed="'+selected+'"')+style+'>'+(valid?day:'')+'</button>';
  }
  return h+'</div>';
}
function renderOtrosDatePickerContent(state){
  if(state.view==='year')return '<div class="dp-grid">'+MN_SHORT.map(function(name,m){
    var prefix=state.year+'-'+String(m+1).padStart(2,'0')+'-',count=Object.keys(state.selected).filter(function(ds){return ds.indexOf(prefix)===0;}).length;
    return '<button type="button" class="dp-month" data-month="'+m+'" aria-label="Abrir '+MN[m]+'"><strong class="dp-mname">'+name+(count?' · '+count:'')+'</strong>'+evDatePickerMonth(state,m,true)+'</button>';
  }).join('')+'</div>';
  return '<div class="dp-month-expanded"><div class="dp-mhdr">'+['L','M','X','J','V','S','D'].map(function(n){return '<span>'+n+'</span>';}).join('')+'</div>'+evDatePickerMonth(state,state.month,false)+'</div>';
}
function renderOtrosDatePicker(state){
  var count=Object.keys(state.selected).length;
  return '<div class="dp-overlay" id="dpOv"><div class="dp-sheet"><div class="dp-handle"></div><div class="dp-hdr"><button class="sy-back" id="dpClose" aria-label="Cancelar selección">&#8592;</button><div class="dp-title">Selección Multidía</div><span></span></div>'
    +'<div class="dp-yearnav"><button id="dpYrPrev" aria-label="Año anterior">&#9664;</button><span>'+state.year+'</span><button id="dpYrNext" aria-label="Año siguiente">&#9654;</button></div>'
    +'<div class="dp-monthnav"><button class="sy-back" id="dpMonthPrev" aria-label="Mes anterior">&#9664;</button><strong id="dpMonthTitle">'+MN[state.month]+'</strong><button class="sy-back" id="dpMonthNext" aria-label="Mes siguiente">&#9654;</button></div>'
    +'<button type="button" class="ev-btn dp-view" id="dpViewToggle" aria-pressed="false">Ver resumen anual</button><div class="dp-counter"><b>'+count+'</b> días seleccionados</div>'
    +'<div class="dp-content" id="dpContent">'+renderOtrosDatePickerContent(state)+'</div><div class="dp-actions"><button class="ev-btn" id="dpClear">Vaciar</button><button class="ev-btn primary" id="dpAccept">Aceptar ('+count+')</button></div></div></div>';
}
function refreshOtrosDatePicker(){
  var state=EV_DATE_PICKER,wrap=document.getElementById('dpWrap');if(!state||!wrap)return;
  wrap.querySelector('#dpContent').innerHTML=renderOtrosDatePickerContent(state);
  wrap.querySelector('.dp-yearnav span').textContent=state.year;
  wrap.querySelector('#dpMonthTitle').textContent=state.view==='year'?'Resumen anual':MN[state.month];
  wrap.querySelector('#dpMonthPrev').disabled=wrap.querySelector('#dpMonthNext').disabled=state.view==='year';
  var toggle=wrap.querySelector('#dpViewToggle');toggle.textContent=state.view==='year'?'Volver al mes':'Ver resumen anual';toggle.setAttribute('aria-pressed',String(state.view==='year'));
  var count=Object.keys(state.selected).length;wrap.querySelector('.dp-counter b').textContent=count;wrap.querySelector('#dpAccept').textContent='Aceptar ('+count+')';
}
function closeOtrosDatePicker(){cerrarPanel('dpWrap','dpOv');}
function moveOtrosDatePickerMonth(offset){
  var state=EV_DATE_PICKER;if(!state||state.view!=='month')return;
  var date=new Date(state.year,state.month+offset,1);state.year=date.getFullYear();state.month=date.getMonth();refreshOtrosDatePicker();
}
function bindOtrosDatePicker(wrap){
  if(wrap._dpBound)return;wrap._dpBound=true;
  wrap.addEventListener('click',function(event){
    var button=event.target.closest('button');if(!button||button.disabled)return;
    var state=EV_DATE_PICKER;if(!state)return;
    if(button.id==='dpClose'){closeOtrosDatePicker();return;}
    if(button.id==='dpAccept'){var days=Object.keys(state.selected).sort(),accept=state.onAccept;closeOtrosDatePicker();if(typeof accept==='function')accept(days);return;}
    if(button.id==='dpClear')state.selected={};
    else if(button.id==='dpYrPrev')state.year--;
    else if(button.id==='dpYrNext')state.year++;
    else if(button.id==='dpMonthPrev'){moveOtrosDatePickerMonth(-1);return;}
    else if(button.id==='dpMonthNext'){moveOtrosDatePickerMonth(1);return;}
    else if(button.id==='dpViewToggle')state.view=state.view==='month'?'year':'month';
    else if(button.hasAttribute('data-month')){state.month=+button.dataset.month;state.view='month';}
    else if(button.dataset.ds){if(state.selected[button.dataset.ds])delete state.selected[button.dataset.ds];else state.selected[button.dataset.ds]=true;}
    else return;
    refreshOtrosDatePicker();
  });
}
function openOtrosDatePicker(initialDates,color,year,onAccept){
  var selected={};(initialDates||[]).forEach(function(ds){selected[ds]=true;});
  var chosen=(initialDates||[]).slice().sort()[0],now=new Date(),currentYear=year||now.getFullYear();
  var hex=(color||'#888').replace('#','');if(hex.length===3)hex=hex.replace(/./g,function(c){return c+c;});var rgb=parseInt(hex,16);
  EV_DATE_PICKER={selected:selected,year:currentYear,month:chosen&&+chosen.slice(0,4)===currentYear?+chosen.slice(5,7)-1:currentYear===now.getFullYear()?now.getMonth():0,view:'month',color:color||'#888',ink:((rgb>>16)*299+((rgb>>8)&255)*587+(rgb&255)*114)>150000?'#1a1a2e':'#fff',onAccept:onAccept};
  var wrap=abrirPanel('dpWrap',renderOtrosDatePicker(EV_DATE_PICKER),{contenedor:document.getElementById('eventsOverlay')||document.body,overlay:'dpOv',alCerrar:closeOtrosDatePicker});bindOtrosDatePicker(wrap);
}
