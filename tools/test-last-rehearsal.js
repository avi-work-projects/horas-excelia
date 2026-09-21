const assert=require('assert');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
const ev=(id,day,cid)=>({id,title:'Ensayo - Pareja de prueba',kind:'puntual',type:'Ensayos boda',start:day,end:day,color:'#cb7295',boda:{coupleId:cid,time:'18:00'}});
const first=ev('a','2026-08-21','p'),last=ev('b','2026-08-22','p');
a.EVENTS=[first,last,ev('other','2026-09-20','q')];
assert.equal(a.bodaEsUltimoEnsayo(first),false);
assert.equal(a.bodaEsUltimoEnsayo(last),true);
assert.equal(a.bodaEsUltimoEnsayo(ev('none','2026-08-22','')),false);
a.EVENTS.push(ev('later','2026-09-01','p'));
assert.equal(a.bodaEsUltimoEnsayo(last),false);
a.EVENTS.pop();
assert.equal(a.bodaEsUltimoEnsayo(last),true);
assert.equal(a.bodaEsUltimoEnsayo(ev('same','2026-08-22','p')),true);
console.log('Ultimo ensayo: fecha global, misma pareja, sin pareja y cambios verificados');

const vm=require('vm'),fs=require('fs');vm.runInContext(fs.readFileSync('js/home-popup.js','utf8'),a);
assert.notEqual(a.homeReminderColor({kind:'puntual',type:'Ensayos boda'}),a.homeReminderColor({kind:'puntual',type:'Rec. Gestiones'}));
assert.equal(a.homeReminderColor({kind:'grande',type:'Asturias'}),a.evTypeColor('grande','Asturias'));

// Ciclo de filtros: ocultar, ver todos, restaurar exactamente la selección.
a.EV_ANNUAL_FILTER_HIDDEN=['Asturias','Resto'];a.EV_FILTER_CYCLE=0;
a.evCycleFilters();assert.equal(a.EV_ANNUAL_FILTER_HIDDEN.length,a.EV_FILTER_GROUPS.length);
a.evCycleFilters();assert.equal(a.EV_ANNUAL_FILTER_HIDDEN.length,0);
a.evCycleFilters();assert.equal(JSON.stringify(a.EV_ANNUAL_FILTER_HIDDEN),'["Asturias","Resto"]');
assert.equal(a.EV_FILTER_CYCLE,0);
assert.ok(!a.homeReminderEventText('Hoy','','Viaje').includes('Sin hora'));
assert.ok(a.homeReminderEventText('Hoy','','Ensayo',true).includes('Sin hora'));
// Otro hueco en un día ocupado y cerrado: no sustituir la pareja, reabrir y no inventar hora.
a.BODA_COUPLES=[{id:'p',name:'Pareja de prueba',contracted:2}];
a.EVENTS=[ev('existing','2026-09-23','p')];a.BODA_CLOSED={'2026-09-23':1};
assert.equal(a.bodaBulkCreate(['2026-09-23']),1);
assert.equal(a.EVENTS.length,2);assert.equal(a.EVENTS[0].boda.coupleId,'p');
assert.equal(a.EVENTS[1].boda.time,null);assert.equal(a.EVENTS[1].boda.coupleId,null);
assert.equal(a.bodaIsClosed('2026-09-23'),false);assert.equal(a.BODA_DEFAULT_TIME,'19:00');
a.bodaSetPending(a.EVENTS[1].id,'coupleId','p');a.bodaPendingApply(true);
assert.equal(a.EVENTS[1].boda.time,null);
while(a.EVENTS.length<5)a.EVENTS.push(ev('limit'+a.EVENTS.length,'2026-09-23','q'));
assert.equal(a.bodaBulkCreate(['2026-09-23']),0);
console.log('Filtros, recordatorios, huecos, reapertura, hora vacía y límite diario verificados');

// El aviso cancela la desasignación sin mutar; aceptar libera y reabre.
const assign=cargarApp({});
assign.EVENTS=[ev('timed','2026-09-24','p')];assign.BODA_CLOSED={'2026-09-24':1};
assign.BODA_ASSIGN={couple:{id:'p',name:'Prueba'},sel:{},year:2026,month:8};
const nodes={};assign.document.getElementById=id=>nodes[id]||(nodes[id]={addEventListener:(name,fn)=>{nodes[id][name]=fn;}});
assign.document.querySelectorAll=()=>[];assign.document.querySelector=()=>null;
assign.closeBodaAssign=()=>{};assign.refreshEvents=()=>{};assign.updateEventsBtn=()=>{};assign.showToast=()=>{};
let warnings=0;assign.confirm=()=>{warnings++;return false;};
assign.bindBodaAssign();nodes.bodaAsgSave.click();
assert.equal(warnings,1);assert.equal(assign.EVENTS[0].boda.coupleId,'p');assert.ok(assign.bodaIsClosed('2026-09-24'));
assign.confirm=()=>true;nodes.bodaAsgSave.click();
assert.equal(assign.EVENTS[0].boda.coupleId,null);assert.equal(assign.EVENTS[0].boda.time,'18:00');assert.ok(!assign.bodaIsClosed('2026-09-24'));
// Reutilizar un hueco sin hora incluso cuando la columna ya tiene cinco eventos.
assign.EVENTS=[ev('free','2026-09-26',null)];assign.EVENTS[0].boda.time=null;
for(let i=1;i<5;i++)assign.EVENTS.push(ev('full'+i,'2026-09-26','q'));
assign.BODA_CLOSED={'2026-09-26':1};assign.BODA_ASSIGN.sel={'2026-09-26':1};nodes.bodaAsgSave.click();
assert.equal(assign.EVENTS.length,5);assert.equal(assign.EVENTS[0].boda.coupleId,'p');assert.equal(assign.EVENTS[0].boda.time,null);assert.ok(!assign.bodaIsClosed('2026-09-26'));
console.log('Asignación: cancelar aviso, liberar con hora, reabrir y reutilizar hueco lleno OK');

const picker=cargarApp({});const controls={};let pickerHtml='',chosen=null;
picker.bodaOpenSheet=(a,b,html)=>{pickerHtml=html;};picker.closeBodaTimePicker=()=>{};picker.bodaTrasElegir=()=>{};
picker.bodaAplicarCampo=(ev,key,value)=>{chosen=value;};picker.setTimeout=fn=>fn();
picker.document.getElementById=id=>controls[id]||(controls[id]={style:{},scrollTop:0,value:'',querySelectorAll:()=>[],addEventListener:(name,fn)=>{controls[id][name]=fn;}});
picker.openBodaTimePicker({boda:{time:null}});
assert.equal(controls.bodaTpH.scrollTop,12*44);assert.equal(controls.bodaTpM.scrollTop,8*44);
assert.equal((pickerHtml.match(/data-val="45"/g)||[]).length,5);
controls.bodaTpM.scrollTop=7*44;controls.bodaTpSave.click();assert.equal(chosen,'19:45');
picker.openBodaTimePicker({boda:{time:'18:37'}});controls.bodaTpSave.click();assert.equal(chosen,'18:37');
console.log('Selector horario: 19:00, cinco ciclos y conservación de minutos manuales OK');
