const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
const first=a.tasksCreate('Colgar cuadro'),second=a.tasksCreate('Comprar'),third=a.tasksCreate('Llamar');
assert.equal(a.tasksItems(a.tasksData(),'pending').length,3);
assert(a.tasksMove(third,first,false));
assert.deepEqual(Array.from(a.tasksData().items,t=>t.id),[third,first,second]);
a.tasksChange(first,'complete');assert.equal(a.tasksItems(a.tasksData(),'done').length,1);
assert.equal(a.tasksItems(a.tasksData(),'pending').length,2);
assert.equal(a.tasksPendingRows(a.tasksData()).length,3,'Marcar no retira la fila ni cambia la prioridad');
assert.equal(a.tasksReminder(new a.Date()).length,2,'Una tarea marcada no vuelve a recordarse aunque siga visible');
const firstDate=a.tasksData().items.find(t=>t.id===first).completedAt;
let moved=a.tasksMoveCompleted();assert.equal(moved.length,1);
assert.equal(a.tasksPendingRows(a.tasksData()).length,2);
assert.equal(a.tasksItems(a.tasksData(),'done')[0].completedAt,firstDate,'Mover no cambia la fecha de finalización');
a.tasksUndoMove(moved);assert.equal(a.tasksPendingRows(a.tasksData()).length,3);
a.tasksMoveCompleted();
a.tasksChange(first,'complete');assert.equal(a.tasksItems(a.tasksData(),'pending').length,3);
assert.equal(a.tasksData().items.find(t=>t.id===first).lastCompletedAt,firstDate);
let now=a.Date.now();a.Date.now=()=>now;now+=3*86400000;
assert.throws(()=>a.tasksChange(first,'complete'),/Elige qué fecha/);
assert.equal(a.tasksItems(a.tasksData(),'done').length,0,'La pregunta no completa la tarea antes de elegir');
a.tasksChange(first,'complete','original');assert.equal(a.tasksItems(a.tasksData(),'done')[0].completedAt,firstDate);
a.tasksChange(first,'complete');a.tasksChange(first,'complete','today');
assert.equal(a.tasksItems(a.tasksData(),'done')[0].completedAt,now);
a.tasksChange(second,'complete');a.tasksMoveCompleted();a.tasksChange(second,'complete');
a.tasksUndoMove(moved);assert.equal(a.tasksItems(a.tasksData(),'pending').length,2,'Deshacer Mover no altera una reapertura posterior');
let current=a.tasksData(),incoming=JSON.parse(JSON.stringify(current));
incoming.items[1].title='Título antiguo';incoming.items[1].updatedAt--;
let merged=a.tasksMerge(current,incoming);assert.equal(merged.items.length,3);assert.equal(merged.items[1].title,'Colgar cuadro');assert.equal(merged.items[1].completedAt,now);
a.tasksReminderSeen(new a.Date(now));assert.equal(a.tasksReminder(new a.Date(now)).length,0);
assert.equal(a.tasksReminder(new a.Date(now+7*86400000)).length,2);
const disabled=a.tasksData();disabled.weeklyReminder=false;a.tasksSave(disabled);assert.equal(a.tasksReminder(new a.Date(now+7*86400000)).length,2,'Los backups antiguos también activan el aviso semanal');
assert(!a.renderTasks(a.tasksData(),'pending').includes('tasksWeekly'));
assert.throws(()=>a.tasksCreate(' '));assert.throws(()=>a.tasksCreate('x'.repeat(161)));
assert.throws(()=>a.validateImport({tasks:{items:[{}],weeklyReminder:true,reminderWeek:''}}));
assert.throws(()=>a.validateImport({tasks:{...current,items:[current.items[0],current.items[0]]}}));
assert.throws(()=>a.validateImport({tasks:{...current,items:[{...current.items[0],pendingVisible:'yes'}]}}));
assert.throws(()=>a.validateImport({tasks:{...current,items:[{...current.items[0],lastCompletedAt:-1}]}}));
assert.throws(()=>a.validateImport({tasks:{...current,items:[{...current.items[0],completedAt:Number.MAX_SAFE_INTEGER}]}}));
let malicious=JSON.parse(JSON.stringify(current));malicious.items[0].title='<img onerror="alert(1)">';
assert(!a.renderTasks(malicious,'pending').includes('<img onerror='));
assert(a.renderTasks(malicious,'pending').includes('&lt;img'));
// La migración unifica la papelera antigua, sin perder tareas ni cambiar el origen.
const legacy={items:[
 {id:'older',title:'Tarea antigua',createdAt:1,updatedAt:2,completedAt:firstDate,deletedAt:null},
 {id:'deleted',title:'Tarea eliminada',createdAt:1,updatedAt:3,completedAt:null,deletedAt:firstDate+1000},
 {id:'newer',title:'Tarea reciente',createdAt:1,updatedAt:4,completedAt:firstDate+86400000,deletedAt:null},
 {id:'pending',title:'Tarea pendiente',createdAt:1,updatedAt:5,completedAt:null,deletedAt:null}
],weeklyReminder:true,reminderWeek:''};
const normalized=a.tasksNormalize(legacy);a.tasksValidate(normalized);
assert.equal(normalized.items.length,4);assert.equal(legacy.items[1].completedAt,null);
assert.deepEqual(JSON.parse(JSON.stringify(a.tasksNormalize(normalized))),JSON.parse(JSON.stringify(normalized)));
assert.deepEqual(Array.from(a.tasksItems(legacy,'done'),t=>t.id),['newer','deleted','older']);
assert.equal(a.tasksPendingRows(legacy).length,1);
const history=a.renderTasks(legacy,'done');
assert.equal((history.match(/data-task-day=/g)||[]).length,2,'Una cabecera por día, no por tarea');
assert(!history.includes('data-task-drag='));assert(!history.includes('Papelera'));
assert(history.indexOf('Tarea reciente')<history.indexOf('Tarea antigua'));
assert(a.renderImportPreview({tasks:legacy}).includes('3 completadas'));
// Exportar de verdad, restaurar, fusionar dos veces y simular fallo de disco.
let exportClick,download;
a.document.getElementById=id=>id==='exportAllBtn'?{addEventListener:(_,fn)=>exportClick=fn}:null;
a.document.createElement=()=>({click(){download=JSON.parse(decodeURIComponent(this.href.split(',').slice(1).join(',')));}});
vm.runInContext(fs.readFileSync('js/import-export.js','utf8'),a);a.showToast=()=>{};exportClick();
assert.deepEqual(JSON.parse(JSON.stringify(download.tasks)),JSON.parse(JSON.stringify(a.tasksData())));
const b=cargarApp({});vm.runInContext(fs.readFileSync('js/import-export.js','utf8'),b);b.showToast=()=>{};b.render=()=>{};b.updateEventsBtn=()=>{};b.updateBdayBtn=()=>{};
b.applyFullImport({tasks:download.tasks},'replace');b.applyFullImport({tasks:download.tasks},'merge');
assert.equal(JSON.stringify(b.tasksData()),JSON.stringify(a.tasksData()));
assert.equal(b.tasksData().items[2].lastCompletedAt,now,'El backup conserva la fecha de una tarea reabierta');
assert.equal(b.tasksPendingRows(b.tasksData()).length,a.tasksPendingRows(a.tasksData()).length);
b.applyFullImport({days:{}},'replace');assert.equal(b.tasksData().items.length,3,'Los backups antiguos no borran tareas');
const before=b.localStorage.getItem(b.TASKS_KEY),put=b.localStorage.setItem;let fail=true;
b.localStorage.setItem=(key,value)=>{if(fail&&key===b.TASKS_KEY){fail=false;throw Error('Quota');}put(key,value);};
b.applyFullImport({tasks:{items:[],weeklyReminder:true,reminderWeek:''}},'replace');assert.equal(b.localStorage.getItem(b.TASKS_KEY),before);
b.applyFullImport({tasks:{items:[],weeklyReminder:true,reminderWeek:''}},'replace');assert.equal(b.tasksData().items.length,0);
console.log('Tareas: dos estados, Mover explícito, fechas recuperables, histórico por día, migración, backup, fusión y rollback OK');
// Todas las categorías fijas comparten Gestión y sobreviven a la importación.
Object.keys(a.EV_MANAGEMENT_SUBTYPES).forEach(type=>{
 const ev={id:type==='Médico'?'doctor':'test-'+a.EV_MANAGEMENT_SUBTYPES[type],kind:'puntual',type,title:type,start:'2026-08-21',end:'2026-08-21',color:'#ff0000'};
 assert.equal(a.evFilterGroup(ev),'Rec. Gestiones');assert.equal(a.evMarkPriority(ev),(['Llamada','Médico','Dentista','Peluquería'].includes(type)?['Llamada','Médico','Dentista','Peluquería'].indexOf(type):4));
 assert.equal(a.getEvDisplayColor(ev),a.evTypeColor('puntual',type));
 assert(a.evMarkerHtml(ev,'','','circle').includes('ev-shape-'+a.EV_MANAGEMENT_SUBTYPES[type]));
 a.validateImport({events:[ev]});assert(a.evAdmiteRepeticion('puntual',type));
});
const form=a.renderEvForm(null);assert(form.includes('data-shape="rings"'));
['beer','mountain'].forEach(shape=>{assert(!form.includes('data-shape="'+shape+'"'));assert(a.evShapeSvg(shape).includes('<path'));});
const group=a.rutDayMarkersHtml([{id:'a',_rut:{id:'r',name:'Pádel',color:'#a3e635'},_rutTime:'16:00',_rutDur:60},{id:'b',_rut:{id:'r',name:'Pádel',color:'#a3e635'},_rutTime:'17:00',_rutDur:60}],' past-marker','2026-08-20');
assert.equal((group.match(/past-marker/g)||[]).length,1);assert(group.includes('rut-marker-group past-marker'));
console.log('Marcadores: gestión compartida, colores fijos, nuevas formas y atenuación de la pila OK');

// Gestiones: vencimiento, excepciones, check compartido y backup sin duplicados.
const g=cargarApp({});g.EVENTS=[
 {id:'bill',kind:'puntual',type:'Enviar factura',title:'Factura pendiente',start:'2026-08-20'},
 {id:'call',kind:'puntual',type:'Llamada',title:'Llamada de hoy',start:'2026-08-21'},
 {id:'doctor',kind:'puntual',type:'Médico',title:'Cita de ayer',start:'2026-08-20'},
 {id:'repeat',kind:'puntual',type:'Pago',title:'Pago semanal',start:'2026-08-14',repeat:{type:'weekly',weekDays:[5]}}
];
g.tasksCreate('Tarea manual');let rows=g.tasksItems(g.tasksData(),'pending');
assert.deepEqual(Array.from(rows,t=>t.title),['Factura pendiente','Pago semanal','Tarea manual']);
assert.equal(rows[0].color,'green');assert.equal(g.tasksData().items.length,3);
g.tasksChange(rows[0].id,'complete');assert(g.evManagementDone(g.EVENTS[0],'2026-08-20'));
g.tasksSetEventDone(g.EVENTS[0],'2026-08-20',false);assert(!g.evManagementDone(g.EVENTS[0],'2026-08-20'));
g.tasksSetEventDone(g.EVENTS[1],'2026-08-21',true);assert(g.evManagementDone(g.EVENTS[1],'2026-08-21'));
assert(!g.tasksItems(g.tasksData(),'pending').some(t=>t.title==='Llamada de hoy'));
g.tasksSetEventDone(g.EVENTS[1],'2026-08-21',false);assert(!g.tasksItems(g.tasksData(),'pending').some(t=>t.title==='Llamada de hoy'));
let gn=g.Date.now();g.Date.now=()=>gn+86400000;
assert(g.tasksItems(g.tasksData(),'pending').some(t=>t.title==='Llamada de hoy'));
assert.equal(g.tasksData().items.filter(t=>t.title==='Pago semanal').length,2,'Cada ocurrencia tiene su propio check');
const bill=g.tasksData().items.find(t=>t.title==='Factura pendiente');g.tasksChange(bill.id,'color','lavender');g.tasksChange(bill.id,'complete','today');
const transferred=JSON.parse(JSON.stringify(g.tasksData()));g.tasksValidate(transferred);
const restored=cargarApp({});restored.EVENTS=JSON.parse(JSON.stringify(g.EVENTS));restored.EVENTS[0].id='another-device';restored.tasksSave(transferred);
assert(restored.evManagementDone(restored.EVENTS[0],'2026-08-20'),'El enlace sobrevive a un id distinto al importar');
assert.equal(restored.tasksData().items.find(t=>t.title==='Factura pendiente').color,'lavender');
restored.EVENTS[0].title='Factura corregida';assert(restored.tasksData().items.some(t=>t.title==='Factura corregida'&&t.completedAt!==null));
assert.equal(Object.keys(g.TASKS_COLORS).length,5);assert.throws(()=>g.tasksChange(bill.id,'color','red'));
const beforeCheck=g.localStorage.getItem(g.TASKS_KEY),originalPut=g.localStorage.setItem;g.localStorage.setItem=()=>{throw Error('Quota');};
assert.throws(()=>g.tasksSetEventDone(g.EVENTS[1],'2026-08-21',true));g.localStorage.setItem=originalPut;assert.equal(g.localStorage.getItem(g.TASKS_KEY),beforeCheck);
['Peluquería','Médico','Dentista'].forEach(type=>assert(!g.evManagementCheckable({kind:'puntual',type})));
console.log('Gestiones vencidas, checks por fecha, enlace entre vistas, colores, backup y fallo de disco OK');
