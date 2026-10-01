/* Panel global de tareas. El orden del array es la prioridad elegida. */
var TASKS_VIEW='pending',TASKS_EDIT=null,TASKS_DATE_CHOICE=null,TASKS_OPEN=false,TASKS_PREV_BACK=null,TASKS_FOCUS=null;
var TASKS_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="4"/><path d="m7 9 1.5 1.5L11 8M14 9h3M7 15h3M14 15h3"/></svg>';
function renderTasks(data,view){
  var items=view==='pending'?tasksPendingRows(data):tasksItems(data,'done'),pending=tasksItems(data,'pending').length;
  var checked=tasksPendingRows(data).filter(function(t){return t.completedAt!==null;}).length;
  var h='<div class="tasks-overlay" id="tasksOverlay"><section class="tasks-sheet" role="dialog" aria-modal="true" aria-labelledby="tasksTitle">';
  h+='<header class="tasks-header"><span class="tasks-heading-icon">'+TASKS_ICON+'</span><div><h2 id="tasksTitle">Mis tareas</h2><p>'+pending+' pendiente'+(pending===1?'':'s')+'</p></div><button type="button" class="sy-back" id="tasksClose" aria-label="Cerrar tareas">×</button></header>';
  h+='<div class="tasks-tabs" role="tablist" aria-label="Estado de las tareas">';
  [['pending','Pendientes'],['done','Completadas']].forEach(function(v){h+='<button type="button" role="tab" aria-selected="'+(view===v[0])+'" data-tasks-view="'+v[0]+'" class="'+(view===v[0]?'active':'')+'">'+v[1]+' <span>'+tasksItems(data,v[0]).length+'</span></button>';});
  h+='</div>';
  if(view==='pending')h+='<form id="tasksAdd" class="tasks-add"><input id="tasksNew" class="ev-input" aria-label="Nueva tarea" placeholder="¿Qué quieres hacer?" maxlength="160" autocomplete="off"><button class="ev-io-btn io-primaria" type="submit" aria-label="Añadir tarea">+</button></form>';
  h+='<div class="tasks-list" id="tasksList" role="tabpanel">';
  if(!items.length)h+='<div class="tasks-empty">'+TASKS_ICON+'<strong>'+(view==='pending'?'Todo al día':'Aún no hay tareas completadas')+'</strong><p>'+(view==='pending'?'Anota algo arriba para empezar.':'Marca una tarea cuando la termines.')+'</p></div>';
  h+=renderTasksList(items,view);
  h+='</div><footer class="tasks-footer">';
  if(view==='pending')h+='<div class="tasks-move-row"><span>'+(checked?checked+' marcada'+(checked===1?'':'s')+' para mover':'Marca las tareas que ya has terminado')+'</span><button type="button" class="ev-io-btn io-primaria" id="tasksMoveCompleted"'+(!checked?' disabled':'')+'>Mover'+(checked?' ('+checked+')':'')+'</button></div>';
  h+='<label><input id="tasksWeekly" type="checkbox"'+(data.weeklyReminder?' checked':'')+'> Recordarme las pendientes cada semana</label>';
  return h+'</footer><div class="tasks-status" id="tasksStatus" role="status" aria-live="polite"></div></section></div>';
}
function tasksDateLabel(timestamp,short){
  var d=new Date(timestamp);
  return short?d.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'}):d.getDate()+' de '+MN[d.getMonth()].toLowerCase()+' de '+d.getFullYear();
}
function renderTasksList(items,view){
  var h='',day='';
  items.forEach(function(t,i){
    if(view==='done'){
      var ds=evDk(new Date(t.completedAt));
      if(ds!==day){
        if(day)h+='</section>';
        h+='<section class="tasks-day-group" data-task-day="'+ds+'"><h3 class="tasks-day">'+(ds===evDk(new Date(Date.now()))?'Hoy · ':'')+'<time datetime="'+ds+'">'+tasksDateLabel(t.completedAt)+'</time></h3>';day=ds;
      }
    }
    h+=renderTaskRow(t,i,items.length,view);
  });
  return h+(day?'</section>':'');
}
function renderTaskRow(t,i,count,view){
  var title=escHtml(t.title),id=escHtml(t.id),editing=TASKS_EDIT===t.id,done=t.completedAt!==null;
  var h='<article class="task-row'+(done?' task-done':'')+'" data-task-id="'+id+'">';
  if(view==='pending')h+='<button type="button" class="task-grip" data-task-drag="'+id+'" aria-label="Reordenar '+title+'" title="Arrastra o usa las flechas del teclado">⠿</button>';
  h+='<input type="checkbox" data-task-action="complete" aria-label="'+(done?'Reabrir':'Completar')+' '+title+'"'+(done?' checked':'')+'>';
  h+='<div class="task-content"><button type="button" class="task-title" data-task-action="edit" aria-expanded="'+editing+'">'+title+'</button></div><button type="button" class="task-more" data-task-action="edit" aria-label="Opciones de '+title+'">⋯</button>';
  if(editing){
    h+='<form class="task-editor"><label>Texto de la tarea<input class="ev-input" name="title" maxlength="160" value="'+title+'"></label><div class="task-actions">';
    if(view==='pending')h+='<button type="button" data-task-action="up" aria-label="Subir prioridad"'+(i===0?' disabled':'')+'>↑ Subir</button><button type="button" data-task-action="down" aria-label="Bajar prioridad"'+(i===count-1?' disabled':'')+'>↓ Bajar</button>';
    h+='<button type="button" data-task-action="complete">'+(done?'Volver a pendientes':'Completar')+'</button><button type="submit" class="task-save">Guardar</button></div></form>';
  }
  if(TASKS_DATE_CHOICE===t.id&&!done){
    h+='<div class="task-date-choice" role="group" aria-labelledby="taskDateQuestion"><strong id="taskDateQuestion">¿Qué día quieres guardar?</strong><div class="task-actions"><button type="button" data-task-action="date-original">Conservar el '+tasksDateLabel(t.lastCompletedAt,true)+'</button><button type="button" data-task-action="date-today" class="task-save">Usar hoy</button><button type="button" data-task-action="date-cancel">Cancelar</button></div></div>';
  }
  return h+'</article>';
}
function openTasks(){
  if(!TASKS_OPEN){TASKS_PREV_BACK=NAV_BACK;TASKS_FOCUS=document.activeElement;TASKS_VIEW='pending';TASKS_EDIT=null;TASKS_DATE_CHOICE=null;}
  TASKS_OPEN=true;tasksMigrate();renderTasksPanel();NAV_BACK=closeTasks;
  document.documentElement.classList.add('tasks-open');
  document.addEventListener('keydown',tasksKeydown);
  var close=document.getElementById('tasksClose');if(close)close.focus();
  var fab=document.getElementById('tasksFab');if(fab)fab.hidden=true;
}
function closeTasks(){
  TASKS_OPEN=false;cerrarPanel('tasksWrap','tasksOverlay');NAV_BACK=TASKS_PREV_BACK;
  document.documentElement.classList.remove('tasks-open');
  document.removeEventListener('keydown',tasksKeydown);tasksUpdateFab();
  if(TASKS_FOCUS&&TASKS_FOCUS.isConnected)TASKS_FOCUS.focus();
}
function tasksKeydown(e){
  if(!TASKS_OPEN)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeTasks();return;}
  if(e.key!=='Tab')return;
  var sheet=document.querySelector('.tasks-sheet'),list=sheet&&Array.from(sheet.querySelectorAll('button:not(:disabled),input:not(:disabled)'));
  if(list)list=list.concat(Array.from(document.querySelectorAll('.toast.show.has-undo button')));
  if(!list||!list.length)return;
  if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list[list.length-1].focus();}
  else if(!e.shiftKey&&document.activeElement===list[list.length-1]){e.preventDefault();list[0].focus();}
}
function renderTasksPanel(){
  var old=document.getElementById('tasksList'),scroll=old?old.scrollTop:0;
  var wrap=abrirPanel('tasksWrap',renderTasks(tasksData(),TASKS_VIEW),{contenedor:document.body,overlay:'tasksOverlay',alCerrar:closeTasks,reutilizar:true});
  if(!wrap)return;
  document.getElementById('tasksList').scrollTop=scroll;
  document.getElementById('tasksClose').onclick=closeTasks;
  wrap.querySelectorAll('[data-tasks-view]').forEach(function(b){b.onclick=function(){TASKS_VIEW=b.dataset.tasksView;TASKS_EDIT=null;TASKS_DATE_CHOICE=null;document.getElementById('tasksList').scrollTop=0;renderTasksPanel();document.querySelector('[data-tasks-view="'+TASKS_VIEW+'"]').focus();};});
  var add=document.getElementById('tasksAdd');if(add)add.onsubmit=function(e){e.preventDefault();tasksPerform(function(){tasksCreate(document.getElementById('tasksNew').value);TASKS_EDIT=null;},'Tarea añadida');document.getElementById('tasksNew').focus();document.getElementById('tasksList').scrollTop=document.getElementById('tasksList').scrollHeight;};
  var weekly=document.getElementById('tasksWeekly');if(weekly)weekly.onchange=function(){tasksPerform(function(){var d=tasksData();d.weeklyReminder=weekly.checked;tasksSave(d);},'Preferencia guardada');};
  var move=document.getElementById('tasksMoveCompleted');if(move)move.onclick=function(){
    var moved=[];tasksPerform(function(){moved=tasksMoveCompleted();},'Tareas movidas a Completadas',function(){tasksUndoMove(moved);if(TASKS_OPEN)renderTasksPanel();tasksUpdateFab();});
    document.querySelector('[data-tasks-view="pending"]').focus({preventScroll:true});
  };
  wrap.querySelectorAll('[data-task-action]').forEach(function(b){b.onclick=function(){tasksRowAction(b);};});
  wrap.querySelectorAll('.task-editor').forEach(function(f){f.onsubmit=function(e){e.preventDefault();var id=f.closest('[data-task-id]').dataset.taskId;tasksPerform(function(){tasksChange(id,'title',f.elements.title.value);TASKS_EDIT=null;},'Tarea guardada');};});
  bindTasksReorder(wrap);
}
function tasksPerform(action,message,undo){
  try{action();renderTasksPanel();tasksUpdateFab();document.getElementById('tasksStatus').textContent=message||'';if(undo)showToast(message,'success',undo);return true;}
  catch(e){renderTasksPanel();showToast(e.message,'error');return false;}
}
function tasksRowAction(button){
  var id=button.closest('[data-task-id]').dataset.taskId,action=button.dataset.taskAction;
  if(action==='edit'){TASKS_EDIT=TASKS_EDIT===id?null:id;TASKS_DATE_CHOICE=null;renderTasksPanel();return;}
  if(action==='up'||action==='down'){
    var list=tasksPendingRows(tasksData()),i=list.findIndex(function(t){return t.id===id;}),target=list[i+(action==='up'?-1:1)];
    if(target)tasksPerform(function(){tasksMove(id,target.id,action==='down');},'Prioridad actualizada');return;
  }
  var task=tasksData().items.find(function(t){return t.id===id;});if(!task)return;
  if(action==='date-cancel'){TASKS_DATE_CHOICE=null;renderTasksPanel();tasksFocusRow(id);return;}
  if(action==='complete'&&tasksNeedsDateChoice(task,Date.now())){
    TASKS_DATE_CHOICE=id;TASKS_EDIT=null;renderTasksPanel();
    var choice=document.querySelector('[data-task-action="date-original"]');if(choice){choice.focus();choice.scrollIntoView({block:'nearest'});}return;
  }
  var value=action==='date-original'?'original':action==='date-today'?'today':undefined;
  if(value&&task.completedAt!==null){TASKS_DATE_CHOICE=null;renderTasksPanel();return;}
  tasksPerform(function(){tasksChange(id,'complete',value);TASKS_EDIT=null;TASKS_DATE_CHOICE=null;},task.completedAt===null?'Tarea completada':'Tarea pendiente');tasksFocusRow(id);
}
function tasksFocusRow(id){
  var checkbox=document.querySelector('[data-task-id="'+id+'"] input[type="checkbox"]');
  if(checkbox)checkbox.focus({preventScroll:true});else document.querySelector('[data-tasks-view="'+TASKS_VIEW+'"]').focus();
}
function bindTasksReorder(wrap){
  wrap.querySelectorAll('[data-task-drag]').forEach(function(grip){
    grip.onkeydown=function(e){if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();tasksRowAction({dataset:{taskAction:e.key==='ArrowUp'?'up':'down'},closest:function(){return grip.closest('[data-task-id]');}});var next=document.querySelector('[data-task-drag="'+grip.dataset.taskDrag+'"]');if(next)next.focus();}};
    grip.onpointerdown=function(e){
      if(e.button!==0)return;e.preventDefault();grip.setPointerCapture(e.pointerId);
      var row=grip.closest('[data-task-id]'),target=null,after=false,list=document.getElementById('tasksList');row.classList.add('task-moving');
      function clear(){wrap.querySelectorAll('.task-drop-before,.task-drop-after').forEach(function(el){el.classList.remove('task-drop-before','task-drop-after');});}
      grip.onpointermove=function(ev){
        clear();var box=list.getBoundingClientRect();if(ev.clientY<box.top+32)list.scrollTop-=14;else if(ev.clientY>box.bottom-32)list.scrollTop+=14;
        var hit=document.elementFromPoint(ev.clientX,ev.clientY);target=hit&&hit.closest('[data-task-id]');
        if(target&&target!==row&&list.contains(target)){var r=target.getBoundingClientRect();after=ev.clientY>r.top+r.height/2;target.classList.add(after?'task-drop-after':'task-drop-before');}else target=null;
      };
      function end(ev){clear();row.classList.remove('task-moving');grip.onpointermove=null;grip.onpointerup=null;grip.onpointercancel=null;if(ev.type==='pointerup'&&target)tasksPerform(function(){tasksMove(row.dataset.taskId,target.dataset.taskId,after);},'Prioridad actualizada');}
      grip.onpointerup=end;grip.onpointercancel=end;
    };
  });
}
