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
