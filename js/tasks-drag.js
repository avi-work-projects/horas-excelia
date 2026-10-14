/* Arrastre con Pointer Events: ratón/táctil, hueco real, FLIP y auto-scroll. */
var TASKS_DRAG_CANCEL=null;
function tasksStopDrag(){if(TASKS_DRAG_CANCEL)TASKS_DRAG_CANCEL();}
function bindListReorder(wrap,options){
  var stop=null;
  function focus(id){Array.from(wrap.querySelectorAll(options.grips)).some(function(grip){if(options.key(grip.closest(options.row))!==id)return false;grip.focus({preventScroll:true});return true;});}
  function announce(text){var status=options.status&&options.status();if(status)status.textContent=text;}
  wrap.querySelectorAll(options.grips).forEach(function(grip){
    grip.onkeydown=function(e){
      if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;
      e.preventDefault();var id=options.key(grip.closest(options.row));options.keyboard(id,e.key==='ArrowUp'?-1:1);focus(id);
    };
    grip.onpointerdown=function(e){
      if(e.button!==0||stop||(options.busy&&options.busy()))return;e.preventDefault();
      var list=wrap.querySelector(options.list),row=grip.closest(options.row),initial=row.getBoundingClientRect(),startY=e.clientY,y=e.clientY,offset=e.clientY-initial.top;
      var ghost=null,frame=null,active=false,alive=true,moved=false,lastTime=0,pointer=e.pointerId;
      var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function rows(){return Array.from(list.querySelectorAll(options.rows));}
      function cleanup(){
        alive=false;cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',end);document.removeEventListener('pointercancel',cancel);document.removeEventListener('keydown',key,true);
        if(ghost)ghost.remove();row.classList.remove('task-drag-placeholder');list.classList.remove('tasks-dragging');stop=null;if(options.onCancelChange)options.onCancelChange(null);
      }
      function cancel(){cleanup();options.render();}
      function key(ev){if(ev.key==='Escape'){ev.preventDefault();ev.stopImmediatePropagation();cancel();}}
      function place(){
        if(!active)return;
        ghost.style.transform='translateY('+(y-offset-initial.top)+'px)';
        var siblings=rows().filter(function(el){return el!==row;}),before=siblings.find(function(el){var r=el.getBoundingClientRect();return y<r.top+r.height/2;})||null;
        if(row.nextElementSibling===before)return;
        var positions=siblings.map(function(el){return {el:el,top:el.getBoundingClientRect().top};});
        siblings.forEach(function(el){el.getAnimations().forEach(function(animation){animation.cancel();});});
        list.insertBefore(row,before);moved=true;
        positions.forEach(function(item){var dy=item.top-item.el.getBoundingClientRect().top;if(dy&&!reduced)item.el.animate([{transform:'translateY('+dy+'px)'},{transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});});
      }
      function tick(time){
        if(!alive||!active)return;
        var r=list.getBoundingClientRect(),speed=y<r.top+48?-Math.min(12,(r.top+48-y)/4):y>r.bottom-48?Math.min(12,(y-r.bottom+48)/4):0;
        if(speed){list.scrollTop+=speed*Math.min(2,(time-lastTime)/16||1);place();}lastTime=time;frame=requestAnimationFrame(tick);
      }
      function move(ev){
        if(ev.pointerId!==pointer)return;y=ev.clientY;
        if(!active&&Math.abs(y-startY)<5)return;
        if(!active){
          active=true;ghost=row.cloneNode(true);ghost.classList.add('task-drag-ghost');ghost.setAttribute('aria-hidden','true');ghost.inert=true;
          ghost.querySelectorAll('[id]').forEach(function(el){el.removeAttribute('id');});ghost.removeAttribute('id');ghost.removeAttribute(options.attribute);
          ghost.style.width=initial.width+'px';ghost.style.left=initial.left+'px';ghost.style.top=initial.top+'px';document.body.appendChild(ghost);
          row.classList.add('task-drag-placeholder');list.classList.add('tasks-dragging');frame=requestAnimationFrame(tick);
          announce('Moviendo '+options.label(row));
        }
        ev.preventDefault();place();
      }
      function end(ev){
        if(ev.pointerId!==pointer)return;
        if(!active){cleanup();return;}
        cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);
        var ordered=rows(),i=ordered.indexOf(row),target=i?ordered[i-1]:ordered[i+1],after=i>0;
        try{if(moved&&target)options.commit(options.key(row),options.key(target),after,ordered.map(options.key));}catch(error){cleanup();options.render();showToast(error.message,'error');return;}
        var destination=row.getBoundingClientRect(),animation=!reduced&&ghost.animate([{transform:ghost.style.transform},{transform:'translateY('+(destination.top-initial.top)+'px)'}],{duration:140,easing:'ease-out',fill:'forwards'});
        function finish(){if(!alive)return;var id=options.key(row);cleanup();options.render();focus(id);announce('Prioridad actualizada');}
        if(animation)animation.finished.then(finish,finish);else finish();
      }
      stop=cleanup;if(options.onCancelChange)options.onCancelChange(cleanup);
      document.addEventListener('pointermove',move,{passive:false});document.addEventListener('pointerup',end);document.addEventListener('pointercancel',cancel);document.addEventListener('keydown',key,true);
    };
  });
  return function(){if(stop)stop();};
}
function bindTasksReorder(wrap){
  bindListReorder(wrap,{list:'#tasksList',grips:'[data-task-drag]',row:'[data-task-id]',rows:':scope > .task-row',attribute:'data-task-id',key:function(row){return row.dataset.taskId;},label:function(row){return row.querySelector('.task-title').textContent;},status:function(){return document.getElementById('tasksStatus');},busy:function(){return !!TASKS_DRAG_CANCEL;},onCancelChange:function(cancel){TASKS_DRAG_CANCEL=cancel;},render:function(){if(TASKS_OPEN)renderTasksPanel();},commit:tasksMove,keyboard:function(id,delta){tasksRowAction({dataset:{taskAction:delta<0?'up':'down'},closest:function(){return {dataset:{taskId:id}};}});}});
}
