/* Referencias de planes: solo ordenación e inicio del selector, nunca persistencia. */
function evPlanReferenceTime(type){
  return {'Comida':'14:00','Barbacoa':'14:00','Tomar algo':'18:00','Cena':'21:00','Copas':'22:00','Salir de fiesta':'23:50'}[type]||null;
}
function timePickerInitial(input){
  if(input.value)return input.value;
  var form=input.closest('.ev-form-sheet'),picker=form&&form.querySelector('.ev-kind-picker');
  if(input.id==='evFEndTime')return (form.querySelector('#evFTime')||{}).value||'09:00';
  return input.id==='evFTime'&&picker?evPlanReferenceTime(picker.dataset.curType)||'09:00':'09:00';
}
function timePickerDrum(id,count,label){
  var h='<div><span class="time-picker-label">'+label+'</span><div class="drum-wrap"><div class="drum-picker" id="'+id+'" role="spinbutton" tabindex="0" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="'+(count-1)+'"><div style="height:44px"></div>';
  for(var cycle=0;cycle<3;cycle++)for(var i=0;i<count;i++)h+='<div class="drum-picker-item" data-val="'+i+'">'+String(i).padStart(2,'0')+'</div>';
  return h+'<div style="height:44px"></div></div><div class="drum-sel-lines"></div></div></div>';
}
function bindTimePickerDrum(drum,count,value){
  var items=Array.from(drum.querySelectorAll('.drum-picker-item'));
  function index(){return Math.max(0,Math.min(count*3-1,Math.round(drum.scrollTop/44)));}
  function mark(){
    var n=index();items.forEach(function(it,i){it.classList.toggle('drum-selected',i===n);});
    drum.setAttribute('aria-valuenow',n%count);drum.setAttribute('aria-valuetext',String(n%count).padStart(2,'0'));
  }
  function move(n){drum.scrollTop=Math.max(0,Math.min(count*3-1,n))*44;mark();}
  drum.addEventListener('scroll',mark,{passive:true});
  drum.addEventListener('click',function(e){var item=e.target.closest('.drum-picker-item');if(item)move(items.indexOf(item));});
  drum.addEventListener('keydown',function(e){
    if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();move(index()+(e.key==='ArrowUp'?-1:1));}
  });
  move(count+value);
  return function(){return index()%count;};
}
function openTimePicker(input){
  if(input.disabled||document.getElementById('timePickerOv'))return;
  var initial=timePickerInitial(input).split(':'),previousBack=NAV_BACK,closed=false;
  function close(){
    if(closed)return;closed=true;NAV_BACK=previousBack;
    document.removeEventListener('keydown',escape);
    cerrarPanel('timePickerWrap','timePickerOv');
    if(input.isConnected)input.focus();
  }
  function escape(e){
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
    if(e.key==='Tab'){
      var focusable=Array.from(wrap.querySelectorAll('[tabindex="0"],button:not(:disabled)'));
      var first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  }
  function save(value){
    input.value=value;close();
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  var optional=input.id==='evFTime'||input.id==='evFEndTime'||input.classList.contains('ev-viaje-time');
  var h='<div class="ev-detail-overlay time-picker-overlay" id="timePickerOv"><section class="ev-detail-sheet time-picker-sheet" role="dialog" aria-modal="true" aria-labelledby="timePickerTitle">';
  h+='<div class="ev-detail-handle"></div><h2 id="timePickerTitle">Elegir hora</h2><div class="time-picker-drums">'+timePickerDrum('timePickerHours',24,'Horas')+'<b>:</b>'+timePickerDrum('timePickerMinutes',60,'Minutos')+'</div>';
  h+='<div class="ev-detail-actions"><button class="ev-btn" id="timePickerCancel">Cancelar</button>'+(optional?'<button class="ev-btn" id="timePickerClear">Sin hora</button>':'')+'<button class="ev-btn primary" id="timePickerSave">Guardar</button></div></section></div>';
  var wrap=abrirPanel('timePickerWrap',h,{contenedor:document.body,overlay:'timePickerOv',alCerrar:close});
  NAV_BACK=close;document.addEventListener('keydown',escape);
  wrap.querySelector('#timePickerCancel').onclick=close;
  var clear=wrap.querySelector('#timePickerClear');if(clear)clear.onclick=function(){save('');};
  // Medir las ruedas cuando el panel ya es visible, antes de permitir guardar.
  var saveButton=wrap.querySelector('#timePickerSave');saveButton.disabled=true;
  setTimeout(function(){
    if(closed)return;
    var hours=bindTimePickerDrum(wrap.querySelector('#timePickerHours'),24,Number(initial[0]));
    var minutes=bindTimePickerDrum(wrap.querySelector('#timePickerMinutes'),60,Number(initial[1]));
    saveButton.disabled=false;saveButton.onclick=function(){save(String(hours()).padStart(2,'0')+':'+String(minutes()).padStart(2,'0'));};
    wrap.querySelector('#timePickerHours').focus();
  },80);
}
document.addEventListener('click',function(e){
  var input=e.target.closest('[data-time-picker]');if(input&&!input.disabled){e.preventDefault();openTimePicker(input);}
},true);
document.addEventListener('keydown',function(e){
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-time-picker]')){e.preventDefault();openTimePicker(e.target);}
});
