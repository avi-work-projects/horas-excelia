/* Una sola fuente de verdad: el check del calendario es la misma tarea enlazada.
   Las vencidas se derivan sin escribir al leer; la siguiente acción persiste el orden. */
function tasksEventMatches(task,ev,ds){
  var ref=task.eventRef;return !!ref&&ref.date===ds&&(ref.id===ev.id||ref.signature===evSignature(ev));
}
function tasksEventId(ev,ds){
  var value=evSignature(ev)+'|'+ds,a=2166136261,b=5381;
  for(var i=0;i<value.length;i++){a=Math.imul(a^value.charCodeAt(i),16777619);b=Math.imul(b,33)^value.charCodeAt(i);}
  return 'management-'+(a>>>0).toString(36)+'-'+(b>>>0).toString(36);
}
function tasksEventRow(ev,ds){
  var now=Date.now();return {id:tasksEventId(ev,ds),title:ev.title||getEvType(ev),createdAt:now,updatedAt:now,completedAt:null,lastCompletedAt:null,pendingVisible:true,color:'green',eventRef:{id:ev.id,signature:evSignature(ev),date:ds}};
}
function tasksEventVisible(task){return !task.eventRef||task.completedAt!==null||task.eventRef.date<evDk(new Date(Date.now()));}
function tasksReconcileEvents(data){
  if(typeof EVENTS==='undefined'||typeof evManagementCheckable!=='function')return data;
  var today=evDk(new Date(Date.now())),events=EVENTS.filter(evManagementCheckable),added=[],seen=new Set();
  data.items=data.items.filter(function(t){
    if(!t.eventRef)return true;
    var ev=events.find(function(e){return e.id===t.eventRef.id;})||events.find(function(e){return evSignature(e)===t.eventRef.signature;});
    if(!ev||!eventOccursOn(ev,t.eventRef.date)){
      // Conservar la historia completada aunque se borre o cambie el evento original.
      if(t.completedAt!==null){delete t.eventRef;return true;}return false;
    }
    var key=ev.id+'|'+t.eventRef.date;if(seen.has(key))return false;seen.add(key);
    t.eventRef.id=ev.id;t.eventRef.signature=evSignature(ev);t.title=ev.title||getEvType(ev);return true;
  });
  events.forEach(function(ev){
    var end=ev.repeat?today:((ev.end||ev.start)<today?(ev.end||ev.start):today);
    for(var day=new Date(ev.start+'T00:00:00');evDk(day)<=end&&evDk(day)<today;day.setDate(day.getDate()+1)){
      var ds=evDk(day);if(!eventOccursOn(ev,ds)||seen.has(ev.id+'|'+ds))continue;
      added.push(tasksEventRow(ev,ds));seen.add(ev.id+'|'+ds);
    }
  });
  added.sort(function(a,b){return b.eventRef.date.localeCompare(a.eventRef.date)||a.title.localeCompare(b.title);});
  data.items=added.concat(data.items);return data;
}
function tasksSetEventDone(ev,ds,done){
  var data=tasksData(),task=data.items.find(function(t){return tasksEventMatches(t,ev,ds);});
  if(!task){task=tasksEventRow(ev,ds);data.items.unshift(task);}
  var now=Date.now();task.completedAt=done?now:null;task.lastCompletedAt=done?now:task.lastCompletedAt;task.updatedAt=now;
  // Marcar desde el calendario no deja una tarea completada ocupando Pendientes.
  task.pendingVisible=!done;tasksSave(data);
}

function tasksRebindEventRefs(data){
  if(typeof EVENTS==='undefined')return;
  data.items.forEach(function(t){if(!t.eventRef)return;var ev=EVENTS.find(function(e){return e.id===t.eventRef.id;})||EVENTS.find(function(e){return evSignature(e)===t.eventRef.signature;});if(ev&&eventOccursOn(ev,t.eventRef.date)){t.eventRef.id=ev.id;t.eventRef.signature=evSignature(ev);}});
}
