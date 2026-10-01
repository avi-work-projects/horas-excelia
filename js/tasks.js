/* Tareas cortas: orden explícito, completadas y papelera recuperable 7 días.
   El estado se lee del almacenamiento para compartir transacciones de backup. */
var TASKS_KEY='excelia-tasks-v1';
var TASKS_RETENTION=7*86400000;
function tasksValidate(data){
  if(!data||typeof data!=='object'||!Array.isArray(data.items)||data.items.length>2000||typeof data.weeklyReminder!=='boolean'||(data.reminderWeek!==''&&!validIsoDate(data.reminderWeek)))throw new Error('Lista de tareas no válida');
  var ids=new Set();
  data.items.forEach(function(t){
    if(!t||typeof t.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(t.id)||ids.has(t.id)||typeof t.title!=='string'||!t.title.trim()||t.title.length>160)throw new Error('Tarea no válida');
    ids.add(t.id);
    ['createdAt','updatedAt'].forEach(function(k){if(!Number.isSafeInteger(t[k])||t[k]<0)throw new Error('Fecha de tarea no válida');});
    ['completedAt','deletedAt'].forEach(function(k){if(t[k]!==null&&(!Number.isSafeInteger(t[k])||t[k]<0))throw new Error('Estado de tarea no válido');});
  });
  return data;
}
function tasksPrune(data,now){
  var copy=JSON.parse(JSON.stringify(data));
  copy.items=copy.items.filter(function(t){return t.deletedAt===null||now-t.deletedAt<TASKS_RETENTION;});
  return copy;
}
function tasksData(){
  var raw=appStorage.getItem(TASKS_KEY);
  if(!raw)return {items:[],weeklyReminder:true,reminderWeek:''};
  return tasksPrune(tasksValidate(JSON.parse(raw)),Date.now());
}
function tasksSave(data){tasksValidate(data);appStorage.setItem(TASKS_KEY,JSON.stringify(tasksPrune(data,Date.now())));}
function tasksPurge(){
  if(!appStorage.getItem(TASKS_KEY))return;
  var data=tasksData();
  if(JSON.stringify(data)!==appStorage.getItem(TASKS_KEY))tasksSave(data);
}
function tasksMerge(current,incoming){
  var byId=new Map();current.items.forEach(function(t){byId.set(t.id,t);});
  var items=incoming.items.map(function(t){var local=byId.get(t.id);byId.delete(t.id);return local&&local.updatedAt>t.updatedAt?local:t;});
  byId.forEach(function(t){items.push(t);});
  return tasksPrune({items:items,weeklyReminder:incoming.weeklyReminder,reminderWeek:current.reminderWeek>incoming.reminderWeek?current.reminderWeek:incoming.reminderWeek},Date.now());
}
function tasksItems(data,view){
  return data.items.filter(function(t){return view==='trash'?t.deletedAt!==null:t.deletedAt===null&&(view==='done'?t.completedAt!==null:t.completedAt===null);});
}
function tasksCreate(title){
  title=String(title||'').trim();if(!title||title.length>160)throw new Error('Escribe una tarea de hasta 160 caracteres');
  var data=tasksData(),now=Date.now(),id='task-'+now.toString(36)+'-'+Math.random().toString(36).slice(2,10);
  data.items.push({id:id,title:title,createdAt:now,updatedAt:now,completedAt:null,deletedAt:null});tasksSave(data);return id;
}
function tasksChange(id,action,value){
  var data=tasksData(),t=data.items.find(function(x){return x.id===id;});if(!t)return false;
  var now=Date.now();
  if(action==='title'){value=String(value||'').trim();if(!value||value.length>160)throw new Error('Escribe una tarea de hasta 160 caracteres');t.title=value;}
  else if(action==='complete')t.completedAt=t.completedAt===null?now:null;
  else if(action==='delete')t.deletedAt=now;
  else if(action==='restore')t.deletedAt=null;
  else return false;
  t.updatedAt=now;tasksSave(data);return true;
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
