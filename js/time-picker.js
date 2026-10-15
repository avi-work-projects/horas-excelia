/* Referencias de planes: solo ordenación e inicio del selector, nunca persistencia. */
function timePickerInitial(input){
  if(input.value)return input.value;
  var form=input.closest('.ev-form-sheet'),picker=form&&form.querySelector('.ev-kind-picker');
  if(input.id==='evFEndTime')return (form.querySelector('#evFTime')||{}).value||'09:00';
  return input.id==='evFTime'&&picker?evPlanReferenceTime(picker.dataset.curType)||'09:00':'09:00';
}
function markPickerDrum(drum,index){
  var items=drum._pickerItems||(drum._pickerItems=drum.querySelectorAll('.drum-picker-item'));
  var next=items[index];
  if(drum._pickerSelected===next)return;
  if(drum._pickerSelected)drum._pickerSelected.classList.remove('drum-selected');
  if(next)next.classList.add('drum-selected');
  drum._pickerSelected=next;
}
function timePickerDrum(id,count,label,values){
  var h='<div><span class="time-picker-label">'+label+'</span><div class="drum-wrap"><div class="drum-picker" id="'+id+'" role="spinbutton" tabindex="0" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="'+(values?values[count-1]:count-1)+'"><div style="height:44px"></div>';
  for(var cycle=0;cycle<3;cycle++)for(var i=0;i<count;i++)h+='<div class="drum-picker-item" data-val="'+(values?values[i]:i)+'">'+String(values?values[i]:i).padStart(2,'0')+'</div>';
  return h+'<div style="height:44px"></div></div><div class="drum-sel-lines"></div></div></div>';
}
/* Minutos de uno en uno: precisión lenta y recorrido largo con un gesto rápido. */
function bindMinuteDrumMotion(drum,count){
  if(drum._minuteStop)drum._minuteStop();
  if(count!==60||drum._minuteMotionBound)return;
  drum._minuteMotionBound=true;drum.style.touchAction='none';
  var drag=null,frame=0,velocity=0,lastFrame=0,clickUntil=0,snap,behavior;
  function finish(){
    cancelAnimationFrame(frame);frame=0;drag=null;
    if(!drum._minuteGesture)return;
    drum.scrollTop=Math.round(drum.scrollTop/44)*44;
    drum.style.scrollSnapType=snap;drum.style.scrollBehavior=behavior;drum._minuteGesture=false;
    drum.dispatchEvent(new Event('scroll'));drum.dispatchEvent(new Event('scrollend'));
  }
  drum._minuteStop=finish;
  function position(delta){
    var before=drum.scrollTop;drum.scrollTop=Math.max(0,Math.min(drum.scrollHeight-drum.clientHeight,before+delta));
    return Math.abs(drum.scrollTop-before)>.1;
  }
  function coast(now){
    if(!drum.isConnected||!drum.getClientRects().length){finish();return;}
    var dt=Math.min(32,now-lastFrame);lastFrame=now;velocity*=Math.exp(-dt/180);
    if(Math.abs(velocity)<.08||!position(velocity*dt)){finish();return;}
    frame=requestAnimationFrame(coast);
  }
  drum.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'){finish();return;}
    if(!e.isPrimary)return;
    finish();clickUntil=0;snap=drum.style.scrollSnapType;behavior=drum.style.scrollBehavior;
    drum.style.scrollSnapType='none';drum.style.scrollBehavior='auto';drum._minuteGesture=true;
    drag={id:e.pointerId,y:e.clientY,start:e.clientY,time:e.timeStamp,moved:false};velocity=0;
  });
  drum.addEventListener('pointermove',function(e){
    if(!drag||drag.id!==e.pointerId)return;
    var dy=drag.y-e.clientY,dt=Math.max(8,e.timeStamp-drag.time),speed=dy/dt;
    if(!drag.moved&&Math.abs(e.clientY-drag.start)>4){drag.moved=true;drum.setPointerCapture(e.pointerId);}
    if(drag.moved){
      e.preventDefault();var gain=1+Math.min(5,Math.max(0,(Math.abs(speed)-.18)*7));
      position(dy*gain);velocity=Math.max(-9,Math.min(9,speed*gain));
    }
    drag.y=e.clientY;drag.time=e.timeStamp;
  });
  function release(e){
    if(!drag||drag.id!==e.pointerId)return;
    var moved=drag.moved,recent=e.timeStamp-drag.time<90;drag=null;
    if(moved)clickUntil=performance.now()+350;
    if(e.type==='pointercancel'||!moved||!recent||Math.abs(velocity)<.3){finish();return;}
    lastFrame=performance.now();frame=requestAnimationFrame(coast);
  }
  drum.addEventListener('pointerup',release);drum.addEventListener('pointercancel',release);
  drum.addEventListener('keydown',finish,true);drum.addEventListener('wheel',finish,{passive:true});
  drum.addEventListener('click',function(e){if(performance.now()<clickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
}
function bindTimePickerDrum(drum,count,value,values){
  var items=Array.from(drum.querySelectorAll('.drum-picker-item'));
  function index(){return Math.max(0,Math.min(count*3-1,Math.round(drum.scrollTop/44)));}
  function mark(){
    var n=index(),v=values?values[n%count]:n%count;markPickerDrum(drum,n);
    drum.setAttribute('aria-valuenow',v);drum.setAttribute('aria-valuetext',String(v).padStart(2,'0'));
  }
  function move(n){drum.scrollTop=Math.max(0,Math.min(count*3-1,n))*44;mark();}
  drum.addEventListener('scroll',mark,{passive:true});
  drum.addEventListener('click',function(e){var item=e.target.closest('.drum-picker-item');if(item)move(items.indexOf(item));});
  drum.addEventListener('keydown',function(e){
    if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();move(index()+(e.key==='ArrowUp'?-1:1));}
  });
  move(count+(values?Math.max(0,values.indexOf(value)):value));
  bindMinuteDrumMotion(drum,count);
  return function(){return values?values[index()%count]:index()%count;};
}
function openTimePicker(input){
  if(input.disabled||document.getElementById('timePickerOv'))return;
  var initial=timePickerInitial(input).split(':'),previousBack=NAV_BACK,closed=false;
  var minuteValues=null;
  if(input.hasAttribute('data-time-quarter')){
    minuteValues=[0,15,30,45];
    var savedMinute=Number(initial[1]);
    if(minuteValues.indexOf(savedMinute)<0)minuteValues.push(savedMinute);
    minuteValues.sort(function(a,b){return a-b;});
  }
  var minuteCount=minuteValues?minuteValues.length:60;
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
  var optional=input.hasAttribute('data-time-optional')||input.id==='evFTime'||input.id==='evFEndTime'||input.classList.contains('ev-viaje-time');
  var h='<div class="ev-detail-overlay time-picker-overlay" id="timePickerOv"><section class="ev-detail-sheet time-picker-sheet" role="dialog" aria-modal="true" aria-labelledby="timePickerTitle">';
  h+='<div class="ev-detail-handle"></div><h2 id="timePickerTitle">Elegir hora</h2><div class="time-picker-drums">'+timePickerDrum('timePickerHours',24,'Horas')+'<b>:</b>'+timePickerDrum('timePickerMinutes',minuteCount,'Minutos',minuteValues)+'</div>';
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
    var minutes=bindTimePickerDrum(wrap.querySelector('#timePickerMinutes'),minuteCount,Number(initial[1]),minuteValues);
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
