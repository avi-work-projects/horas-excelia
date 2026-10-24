const assert=require('node:assert');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
const ev={id:'alarm-test',kind:'puntual',type:'Otros',title:'Prueba',start:'2026-08-21',end:'2026-08-21',time:'10:00',color:'#537b78'};
for(const [clock,count] of [['09:59',1],['10:00',0],['10:01',0]]){
 assert.equal(a.evAlarmOptions(ev,ev.start,new Date('2026-08-21T'+clock+':00')).length,count);
}
const target={ds:ev.start,time:'10:00',part:''};
assert(a.evAlarmCreationAllowed(ev,target,new Date('2026-08-21T09:30:00'),new Date('2026-08-21T09:25:00')));
assert(!a.evAlarmCreationAllowed(ev,target,new Date('2026-08-21T09:30:00'),new Date('2026-08-21T09:26:00')));
assert(!a.evAlarmCreationAllowed(ev,target,new Date('2026-08-21T10:01:00'),new Date('2026-08-21T09:00:00')));
assert(!a.evAlarmCreationAllowed(ev,target,new Date('2026-08-21T09:30:00'),new Date('2026-08-21T10:00:00')));
assert.equal(a.evAlarmOptions({...ev,time:null},ev.start,new Date('2026-08-21T22:00:00')).length,1);
assert.equal(a.evAlarmOptions({...ev,time:null},ev.start,new Date('2026-08-22T00:00:00')).length,0);
const trip={...ev,kind:'grande',type:'Viaje',end:'2026-08-23',viaje:{ida:{time:'08:00',modo:'coche'},vuelta:{time:'18:00',modo:'tren'}}};
const options=a.evAlarmOptions(trip,ev.start,new Date('2026-08-21T10:00:00'));
assert.equal(options.length,1);assert.equal(options[0].part,'vuelta');assert.equal(options[0].ds,'2026-08-23');
const midnight=a.evAlarmNotice({ds:'2026-08-22',time:'00:15',part:''},60);
assert.equal(a.evIsoDate(midnight),'2026-08-21');assert.equal(midnight.getHours(),23);assert.equal(midnight.getMinutes(),15);
assert.equal(a.evAlarmOptions({...ev,_rutSkip:true},ev.start,new Date('2026-08-21T09:00:00')).length,0);
for(const [time,half] of [['12:59',false],['13:00',true],['15:00',true],[null,false]]){
 const row={ev:{...trip,time},cs:0,ce:4,starts:true,ends:true};a._evMarcarMitades([row]);assert.equal(row.halfL,half);
 const continuation={...row,starts:false};a._evMarcarMitades([continuation]);assert.equal(continuation.halfL,false);
}
console.log('Alarmas: inicio exacto, confirmación tardía, margen, vuelta y medianoche; barras con corte 13:00 OK');

const weekly={...ev,start:'2026-08-14',end:'2026-08-14',repeat:{type:'weekly',weekDays:[5]}};
assert.equal(a.evAlarmOptions(weekly,'2026-08-21',new Date('2026-08-21T10:00:00')).length,0);
assert.equal(a.evAlarmOptions(weekly,'2026-08-28',new Date('2026-08-21T10:00:00')).length,1);
assert.equal(a.evIsoDate(a.evDetailAlarmDate(weekly)),'2026-08-21'); // El reloj del entorno es 09:00.
for(const type of ['cal','annual','quad']){
 a.EVENTS=[{...trip,id:'geometry',time:'13:00',viaje:null,start:'2026-08-24',end:'2026-08-28'}];
 a.EV_YEAR=2026;a.EV_MONTH=7;a.EV_QUAD_YEAR=2026;a.EV_QUAD_MONTH=7;
 const render=type==='cal'?a.renderEvCalMonth:type==='annual'?a.renderEvAnnual:a.renderEvQuad;
 const afternoon=render();assert(afternoon.includes('margin-left:calc(50% / 5)'));
 a.EVENTS[0].time='12:59';assert(!render().includes('margin-left:calc(50% / 5)'));
 a.EVENTS[0].time='13:00';a.EVENTS[0].end=a.EVENTS[0].start;assert(render().includes('margin-left:calc(50% / 1)'));
}
console.log('Repeticiones futuras y barras de uno/varios días en mes, anual y cuatro meses OK');
