/* Acceso global: la posición libre dura hasta navegar; entonces se recoge
   al lateral más próximo. No almacena coordenadas de un dispositivo en otro. */
var TASKS_FLOAT={side:'right',x:0,y:0,docked:true};
function tasksFloatPosition(x,y,docked){
  var button=document.getElementById('tasksFab');if(!button)return;
  var viewport=window.visualViewport,w=viewport?viewport.width:window.innerWidth,h=viewport?viewport.height:window.innerHeight;
  var left=viewport?viewport.offsetLeft:0,top=viewport?viewport.offsetTop:0,size=48;
  TASKS_FLOAT.docked=docked;
  TASKS_FLOAT.x=docked?(TASKS_FLOAT.side==='right'?left+w-size+16:left-16):Math.max(left,Math.min(left+w-size,x));
  TASKS_FLOAT.y=Math.max(top+70,Math.min(top+h-size-28,y));
  button.classList.toggle('tasks-docked',docked);button.dataset.side=TASKS_FLOAT.side;
  button.style.left=TASKS_FLOAT.x+'px';button.style.top=TASKS_FLOAT.y+'px';
}
function tasksDock(){
  var h=window.visualViewport?window.visualViewport.height:window.innerHeight,top=window.visualViewport?window.visualViewport.offsetTop:0;
  tasksFloatPosition(0,top+h*.7,true);
}
function tasksUpdateFab(){
  var button=document.getElementById('tasksFab');if(!button)return;
  button.hidden=TASKS_OPEN;
  var n=tasksItems(tasksData(),'pending').length;
  button.setAttribute('aria-label','Mis tareas'+(n?' · '+n+' pendientes':''));
  button.innerHTML=TASKS_ICON+(n?'<span class="tasks-count">'+(n>99?'99+':n)+'</span>':'');
}
function initTasks(){
  if(document.getElementById('tasksFab'))return;
  tasksPurge();
  var b=document.createElement('button');b.id='tasksFab';b.type='button';b.className='tasks-fab';b.title='Mis tareas · arrastra para mover';
  document.body.appendChild(b);tasksUpdateFab();tasksDock();
  var suppressClick=false;
  b.onclick=function(){if(suppressClick){suppressClick=false;return;}openTasks();};
  b.onpointerdown=function(e){
    if(e.button!==0)return;
    var x=e.clientX,y=e.clientY,startX=TASKS_FLOAT.x,startY=TASKS_FLOAT.y,wasDocked=TASKS_FLOAT.docked,moved=false;
    b.setPointerCapture(e.pointerId);
    b.onpointermove=function(ev){
      var dx=ev.clientX-x,dy=ev.clientY-y;
      if(!moved&&Math.hypot(dx,dy)<6)return;
      moved=true;b.classList.add('tasks-dragging');tasksFloatPosition(startX+dx,startY+dy,false);
    };
    function end(ev){
      b.onpointermove=null;b.onpointerup=null;b.onpointercancel=null;b.classList.remove('tasks-dragging');
      if(ev.type==='pointercancel'){tasksFloatPosition(startX,startY,wasDocked);suppressClick=false;return;}
      suppressClick=moved;
      if(moved)setTimeout(function(){suppressClick=false;},0);
      TASKS_FLOAT.side=TASKS_FLOAT.x+24<window.innerWidth/2?'left':'right';
    }
    b.onpointerup=end;b.onpointercancel=end;
  };
  document.addEventListener('click',function(e){if(e.target.closest('.ev-main-tabs button,.bday-hdr-sub button,.econ-tab-btn,.fiscal-tab-btn,.sy-tab-btn,.est-nav button'))tasksDock();},true);
  function resize(){if(TASKS_FLOAT.docked)tasksDock();else tasksFloatPosition(TASKS_FLOAT.x,TASKS_FLOAT.y,false);}
  window.addEventListener('resize',resize);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){tasksPurge();tasksUpdateFab();}});
  window.addEventListener('storage',function(e){if(e.key===TASKS_KEY){tasksUpdateFab();if(TASKS_OPEN)renderTasksPanel();}});
}
