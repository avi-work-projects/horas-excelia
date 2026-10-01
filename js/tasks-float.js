/* Acceso global. El arrastre no cambia tareas; la papelera solo oculta el acceso.
   Su visibilidad y coordenadas pertenecen a este dispositivo, no al backup. */
var TASKS_FAB_HIDDEN_KEY='excelia-tasks-fab-hidden-v1';
var TASKS_FAB_HIDDEN=appStorage.getItem(TASKS_FAB_HIDDEN_KEY)==='1';
var TASKS_FLOAT={side:'right',x:0,y:0,docked:true};
function tasksFloatPosition(x,y,docked){
  var button=document.getElementById('tasksFab');if(!button)return;
  var viewport=window.visualViewport,w=viewport?viewport.width:window.innerWidth,h=viewport?viewport.height:window.innerHeight;
  var left=viewport?viewport.offsetLeft:0,top=viewport?viewport.offsetTop:0,size=48;
  var safe=parseFloat(getComputedStyle(button).getPropertyValue('--tasks-safe-bottom'))||0;
  TASKS_FLOAT.docked=docked;
  TASKS_FLOAT.x=docked?left+w-size-18:Math.max(left+4,Math.min(left+w-size-4,x));
  TASKS_FLOAT.y=docked?top+h-size-20-safe:Math.max(top+4,Math.min(top+h-size-4,y));
  button.classList.toggle('tasks-docked',docked);button.dataset.side=TASKS_FLOAT.side;
  button.style.left=TASKS_FLOAT.x+'px';button.style.top=TASKS_FLOAT.y+'px';
}
function tasksDock(){
  TASKS_FLOAT.side='right';tasksFloatPosition(0,0,true);
}
function tasksUpdateFab(){
  var button=document.getElementById('tasksFab');if(!button)return;
  button.hidden=TASKS_OPEN||TASKS_FAB_HIDDEN;
  var n=tasksItems(tasksData(),'pending').length;
  button.setAttribute('aria-label','Mis tareas'+(n?' · '+n+' pendientes':''));
  button.innerHTML=TASKS_ICON+(n?'<span class="tasks-count">'+(n>99?'99+':n)+'</span>':'');
}
function initTasks(){
  if(document.getElementById('tasksFab'))return;
  tasksMigrate();
  var b=document.createElement('button');b.id='tasksFab';b.type='button';b.className='tasks-fab';b.title='Mis tareas · arrastra para mover';
  document.body.appendChild(b);tasksUpdateFab();tasksDock();
  var bin=document.createElement('div');bin.id='tasksDropZone';bin.className='tasks-drop-zone';bin.hidden=true;
  bin.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg><strong>Ocultar acceso</strong><span>Las tareas se conservan</span>';
  document.body.appendChild(bin);
  var suppressClick=false;
  b.onclick=function(){if(suppressClick){suppressClick=false;return;}openTasks();};
  b.onpointerdown=function(e){
    if(e.button!==0)return;
    var x=e.clientX,y=e.clientY,startX=TASKS_FLOAT.x,startY=TASKS_FLOAT.y,wasDocked=TASKS_FLOAT.docked,moved=false,held=false,over=false;
    var timer=setTimeout(function(){held=true;bin.hidden=false;},450);
    b.setPointerCapture(e.pointerId);
    b.onpointermove=function(ev){
      var dx=ev.clientX-x,dy=ev.clientY-y;
      if(!moved&&Math.hypot(dx,dy)<6)return;
      moved=true;b.classList.add('tasks-dragging');tasksFloatPosition(startX+dx,startY+dy,false);
      var rect=bin.getBoundingClientRect();over=held&&ev.clientX>=rect.left&&ev.clientX<=rect.right&&ev.clientY>=rect.top&&ev.clientY<=rect.bottom;
      bin.classList.toggle('tasks-drop-ready',over);
    };
    function end(ev){
      clearTimeout(timer);bin.hidden=true;bin.classList.remove('tasks-drop-ready');
      b.onpointermove=null;b.onpointerup=null;b.onpointercancel=null;b.classList.remove('tasks-dragging');
      if(ev.type==='pointercancel'){tasksFloatPosition(startX,startY,wasDocked);suppressClick=false;return;}
      suppressClick=moved||held;
      if(suppressClick)setTimeout(function(){suppressClick=false;},0);
      if(over&&moved){tasksSetAccessHidden(true);showToast('Acceso oculto. Haz un gesto de zoom con dos dedos para mostrarlo.','success',tasksRestoreAccess);}
    }
  b.onpointerup=end;b.onpointercancel=end;
  };
  b.oncontextmenu=function(e){e.preventDefault();};
  document.addEventListener('click',function(e){if(e.target.closest('.ev-main-tabs button,.bday-hdr-sub button,.econ-tab-btn,.fiscal-tab-btn,.sy-tab-btn,.est-nav button'))tasksDock();},true);
  function resize(){if(TASKS_FLOAT.docked)tasksDock();else tasksFloatPosition(TASKS_FLOAT.x,TASKS_FLOAT.y,false);}
  window.addEventListener('resize',resize);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')tasksUpdateFab();});
  window.addEventListener('storage',function(e){
    if(e.key===TASKS_FAB_HIDDEN_KEY){TASKS_FAB_HIDDEN=e.newValue==='1';tasksUpdateFab();}
    if(e.key===TASKS_KEY){tasksUpdateFab();if(TASKS_OPEN)renderTasksPanel();}
  });
  bindTasksRestoreGesture();
  var menu=document.getElementById('tasksMenuOpen');if(menu)menu.onclick=function(){tasksRestoreAccess();document.getElementById('dataMenu').classList.remove('open');openTasks();};
}
function tasksSetAccessHidden(hidden){TASKS_FAB_HIDDEN=hidden;appStorage.setItem(TASKS_FAB_HIDDEN_KEY,hidden?'1':'0');tasksUpdateFab();}
function tasksRestoreAccess(){tasksSetAccessHidden(false);tasksDock();}
function bindTasksRestoreGesture(){
  var initial=null;
  function distance(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);}
  document.addEventListener('touchstart',function(e){initial=e.touches.length===2?distance(e.touches):null;},{passive:true,capture:true});
  document.addEventListener('touchmove',function(e){if(TASKS_FAB_HIDDEN&&initial!==null&&e.touches.length===2&&Math.abs(distance(e.touches)-initial)>8){initial=null;tasksRestoreAccess();}},{passive:true,capture:true});
  document.addEventListener('touchend',function(){initial=null;},{passive:true,capture:true});
}
