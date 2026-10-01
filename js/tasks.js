/* Dos estados: pendientes y completadas. Mover solo retira filas ya marcadas.
   El estado se lee del almacenamiento para compartir transacciones de backup. */
var TASKS_KEY='excelia-tasks-v1';
function tasksValidate(data){
  if(!data||typeof data!=='object'||!Array.isArray(data.items)||data.items.length>2000||typeof data.weeklyReminder!=='boolean'||(data.reminderWeek!==''&&!validIsoDate(data.reminderWeek)))throw new Error('Lista de tareas no válida');
  var ids=new Set();
  data.items.forEach(function(t){
    if(!t||typeof t.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(t.id)||ids.has(t.id)||typeof t.title!=='string'||!t.title.trim()||t.title.length>160)throw new Error('Tarea no válida');
    ids.add(t.id);
    ['createdAt','updatedAt'].forEach(function(k){if(!tasksValidTimestamp(t[k]))throw new Error('Fecha de tarea no válida');});
    if(t.completedAt!==null&&!tasksValidTimestamp(t.completedAt))throw new Error('Estado de tarea no válido');
    ['deletedAt','lastCompletedAt'].forEach(function(k){if(t[k]!=null&&!tasksValidTimestamp(t[k]))throw new Error('Fecha de tarea no válida');});
    if(t.pendingVisible!==undefined&&typeof t.pendingVisible!=='boolean')throw new Error('Visibilidad de tarea no válida');
  });
  return data;
}
function tasksValidTimestamp(value){return Number.isSafeInteger(value)&&value>=0&&Number.isFinite(new Date(value).getTime());}
function tasksNormalize(data){
  var copy=JSON.parse(JSON.stringify(data));
  copy.items.forEach(function(t){
    // Los backups antiguos conservan también las tareas de la antigua papelera.
    if(t.completedAt===null&&t.deletedAt!=null)t.completedAt=t.deletedAt;
    t.lastCompletedAt=t.completedAt!==null?t.completedAt:(t.lastCompletedAt==null?null:t.lastCompletedAt);
    t.pendingVisible=t.completedAt===null||t.pendingVisible===true;
    delete t.deletedAt;
  });
  return copy;
}
function tasksData(){
  var raw=appStorage.getItem(TASKS_KEY);
  if(!raw)return {items:[],weeklyReminder:true,reminderWeek:''};
  return tasksNormalize(tasksValidate(JSON.parse(raw)));
}
function tasksSave(data){tasksValidate(data);appStorage.setItem(TASKS_KEY,JSON.stringify(tasksNormalize(data)));}
function tasksMigrate(){
  if(!appStorage.getItem(TASKS_KEY))return;
  var data=tasksData();
  if(JSON.stringify(data)!==appStorage.getItem(TASKS_KEY))tasksSave(data);
}
function tasksMerge(current,incoming){
  var byId=new Map();current.items.forEach(function(t){byId.set(t.id,t);});
  var items=incoming.items.map(function(t){var local=byId.get(t.id);byId.delete(t.id);return local&&local.updatedAt>t.updatedAt?local:t;});
  byId.forEach(function(t){items.push(t);});
  return tasksNormalize({items:items,weeklyReminder:incoming.weeklyReminder,reminderWeek:current.reminderWeek>incoming.reminderWeek?current.reminderWeek:incoming.reminderWeek});
}
function tasksItems(data,view){
  var items=tasksNormalize(data).items.filter(function(t){return view==='done'?t.completedAt!==null:t.completedAt===null;});
  return view==='done'?items.sort(function(a,b){return b.completedAt-a.completedAt||b.createdAt-a.createdAt||a.id.localeCompare(b.id);}):items;
}
function tasksPendingRows(data){return tasksNormalize(data).items.filter(function(t){return t.pendingVisible;});}
function tasksNeedsDateChoice(t,now){
  return t.completedAt===null&&t.lastCompletedAt!=null&&evDk(new Date(t.lastCompletedAt))!==evDk(new Date(now));
}
function tasksCreate(title){
  title=String(title||'').trim();if(!title||title.length>160)throw new Error('Escribe una tarea de hasta 160 caracteres');
  var data=tasksData(),now=Date.now(),id='task-'+now.toString(36)+'-'+Math.random().toString(36).slice(2,10);
  data.items.push({id:id,title:title,createdAt:now,updatedAt:now,completedAt:null,lastCompletedAt:null,pendingVisible:true});tasksSave(data);return id;
}
function tasksChange(id,action,value){
  var data=tasksData(),t=data.items.find(function(x){return x.id===id;});if(!t)return false;
  var now=Date.now();
  if(action==='title'){value=String(value||'').trim();if(!value||value.length>160)throw new Error('Escribe una tarea de hasta 160 caracteres');t.title=value;}
  else if(action==='complete'){
    if(t.completedAt!==null){t.lastCompletedAt=t.completedAt;t.completedAt=null;}
    else{
      if(tasksNeedsDateChoice(t,now)&&value!=='original'&&value!=='today')throw new Error('Elige qué fecha quieres conservar');
      t.completedAt=value==='original'&&t.lastCompletedAt!==null?t.lastCompletedAt:now;
      t.lastCompletedAt=t.completedAt;
    }
    t.pendingVisible=true;
  }
  else return false;
  t.updatedAt=now;tasksSave(data);return true;
}
function tasksMoveCompleted(){
  var data=tasksData(),moved=[],now=Date.now();
  data.items.forEach(function(t){if(t.completedAt!==null&&t.pendingVisible){moved.push({id:t.id,completedAt:t.completedAt});t.pendingVisible=false;t.updatedAt=now;}});
  if(moved.length)tasksSave(data);return moved;
}
function tasksUndoMove(moved){
  var data=tasksData(),byId=new Map(moved.map(function(t){return [t.id,t.completedAt];}));
  data.items.forEach(function(t){if(t.completedAt!==null&&byId.get(t.id)===t.completedAt){t.pendingVisible=true;t.updatedAt=Date.now();}});
  tasksSave(data);
}
function tasksMove(id,targetId,after){
  if(id===targetId)return false;
  var data=tasksData(),from=data.items.findIndex(function(t){return t.id===id;}),target=data.items.findIndex(function(t){return t.id===targetId;});
  if(from<0||target<0)return false;
  var item=data.items.splice(from,1)[0];target=data.items.findIndex(function(t){return t.id===targetId;});
  item.updatedAt=Date.now();data.items.splice(target+(after?1:0),0,item);tasksSave(data);return true;
}
function tasksReminder(now){
  var data=tasksData(),week=rutWeekKey(evDk(now));
  return data.weeklyReminder&&data.reminderWeek!==week?tasksItems(data,'pending'):[];
}
function tasksReminderSeen(now){var data=tasksData();data.reminderWeek=rutWeekKey(evDk(now));tasksSave(data);}
