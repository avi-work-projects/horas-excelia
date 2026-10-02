const assert=require('assert');const {cargarApp}=require('./entorno');const a=cargarApp({});
let r={id:'fixed-test',name:'Deporte',start:'2026-08-01',weekDays:[1,4],time:'18:00',dur:60,skips:{},weeks:{},color:'#65a367'};a.RUTINAS=[r];
let next=a.rutAddSession(r,{date:'2026-08-24',time:'20:00',dur:45},'2026-08-20');
assert(!r.skips['2026-08-20']);assert(next.skips['2026-08-20']);assert.equal(next.extraSessions.length,1);
Object.assign(r,next);assert.equal(a.rutSessionsOn(r,'2026-08-24').length,2);
const events=a.rutEventsOn('2026-08-24');assert.equal(new Set(events.map(e=>e.id)).size,2);assert(events[1].title.includes('(Recuperada de 20/08/2026)'));
assert.equal(a.rutEventFromId(events[1].id).key,r.extraSessions[0].id);
assert(a.rutRecoveryNote(r,'2026-08-20').includes('24/08/2026'));
assert.throws(()=>a.rutAddSession(r,{date:'2026-08-25',time:'20:00',dur:60},'2026-08-20'),/ya tiene/);
assert.throws(()=>a.rutEditSession(r,'2026-08-20','18:00',60,false),/recuperación/);
Object.assign(r,a.rutAddSession(r,{date:'2026-08-24',time:'21:00',dur:30}));
assert.equal(a.rutEventsOn('2026-08-24').length,3);assert(a.rutEventsOn('2026-08-24')[2].title.includes('(Extra)'));
assert.throws(()=>a.rutAddSession(r,{date:'2026-08-24',time:'22:00',dur:30}),/máximo/);
assert.equal(a.rutSessions(r,'2026-08-24','2026-08-24').length,3);
assert.equal(a.evIcsRoutineRows('2026-08',new Date('2026-08-23T12:00:00')).filter(e=>e.start==='2026-08-24').length,3);
const copy=a.validateImport({rutinas:[r]}).rutinas[0];assert.equal(copy.extraSessions.length,2);
assert.throws(()=>a.validateImport({rutinas:[{...r,extraSessions:[...r.extraSessions,r.extraSessions[0]]}]}),/Identificador/);
assert.throws(()=>a.validateImport({rutinas:[{...r,extraSessions:[{...r.extraSessions[0],recoveryOf:'2026-08-19'}]}]}),/Vínculo/);
const recovery=r.extraSessions[0];a.rutToggleSkip(r,recovery.date,recovery.id);assert(r.extraSessions[0].skip);assert(!a.rutRecoveryFor(r,'2026-08-20'));
assert(a.rutIsSkipped(r,'2026-08-20'));a.rutToggleSkip(r,'2026-08-20');assert(!a.rutIsSkipped(r,'2026-08-20'));
assert.equal(a.validateImport({rutinas:[r]}).rutinas[0].extraSessions.length,2);
const changed=a.rutNewSchedule(r,{weekDays:[2],time:'19:00'},'2026-08-25');assert.equal(changed.extraSessions.length,2);
const f={id:'flex',name:'Flexible',start:'2026-08-01',weekDays:[],time:'19:00',dur:60,skips:{},weeks:{},flex:{period:'month',target:8,weeklyTarget:2,sessions:{'2026-08-17':{time:'19:00',dur:60}}}};
a.RUTINAS=[f];Object.assign(f,a.rutAddSession(f,{date:'2026-08-19',time:'19:00',dur:60},'2026-08-17'));
assert.equal(a.rutFlexCount(f,{start:'2026-08-01',end:'2026-08-31'}),1);
assert.throws(()=>a.rutFlexSetSession(f,'2026-08-17','2026-08-18','19:00',60),/vinculada/);
assert.equal(a.validateImport({rutinas:[f]}).rutinas[0].extraSessions.length,1);
console.log('Rutinas: extras, recuperación vinculada, sesiones simultáneas, cupos, exportación y backup OK');

// Borrado definitivo de una ocurrencia, sin cancelar ni alterar otras fechas.
const original={id:'delete-test',name:'Clases',start:'2026-01-01',weekDays:[1,4],time:'18:00',dur:60,skips:{},weeks:{}};
a.RUTINAS=[original];
let deleted=a.rutDeleteSession(original,'2026-08-20');
assert.equal(a.rutSessionsOn(deleted,'2026-08-20').length,0);
assert.equal(a.rutSessionsOn(deleted,'2026-08-24').length,1);
assert.equal(a.rutSessionsOn(original,'2026-08-20').length,1);
deleted=a.rutDeleteSession(deleted,'2026-08-24');
deleted=a.rutNewSchedule(deleted,{weekDays:[1,4],time:'20:00'},'2026-08-21');
assert.equal(a.rutSessionsOn(deleted,'2026-08-24').length,0);
assert.equal(a.rutSessionsOn(deleted,'2026-08-20').length,0);
let roundtrip=a.validateImport({rutinas:[deleted]}).rutinas[0];
assert.equal(a.rutSessionsOn(roundtrip,'2026-08-20').length,0);
const withRecovery=a.rutAddSession(original,{date:'2026-08-24',time:'20:00',dur:60},'2026-08-20');
const recoveryKey=withRecovery.extraSessions[0].id;
const removedOriginal=a.rutDeleteSession(withRecovery,'2026-08-20');
assert.equal(removedOriginal.extraSessions[0].recoveryOf,null);
assert.equal(a.rutSessionTag(removedOriginal,a.rutSessionByKey(removedOriginal,recoveryKey)),'(Extra)');
assert.equal(a.validateImport({rutinas:[removedOriginal]}).rutinas[0].extraSessions.length,1);
const removedRecovery=a.rutDeleteSession(withRecovery,recoveryKey);
assert(removedRecovery.skips['2026-08-20']);assert.equal(removedRecovery.extraSessions.length,0);
const future=a.rutDeleteSession(original,'2026-12-24');assert.equal(a.rutSessionsOn(future,'2026-12-24').length,0);
const flexDeleted=a.rutDeleteSession(f,'2026-08-17');assert(!flexDeleted.flex.sessions['2026-08-17']);
a.rutFlexSetSession(flexDeleted,null,'2026-08-17','18:00',60);assert.equal(a.rutSessionsOn(flexDeleted,'2026-08-17').length,1);
assert.throws(()=>a.validateImport({rutinas:[{...original,deletedSessions:{'bad':true}}]}),/eliminada/);
const months=a.rutHistoryMonthGroups(original,{from:'2026-07-01',to:'2026-09-30'});
assert.deepEqual(Object.keys(months),['2026-07','2026-08','2026-09']);
assert(months['2026-08'].every(s=>s.ds.startsWith('2026-08')));
console.log('Borrado de sesiones, recuperación convertida en extra, backup e histórico mensual OK');

// Varias sesiones: contigüidad exacta y grupos independientes, sin reducir iconos.
let groups=a.rutMarkerGroups([{_rut:{id:'a'},_rutTime:'18:00',_rutDur:60},{_rut:{id:'a'},_rutTime:'20:00',_rutDur:60},{_rut:{id:'a'},_rutTime:'19:00',_rutDur:60},{_rut:{id:'b'},_rutTime:'19:00',_rutDur:60}]);
assert.deepEqual(Array.from(groups,g=>g.length),[3,1]);
groups=a.rutMarkerGroups([{_rut:{id:'a'},_rutTime:'18:00',_rutDur:45},{_rut:{id:'a'},_rutTime:'19:00',_rutDur:60}]);assert.equal(groups.length,2);
const markerEvents=[{id:'gest',kind:'puntual',type:'Rec. Gestiones'},{id:'fill',kind:'puntual',type:'Otros',shape:'circle'},{id:'outline',kind:'puntual',type:'Otros',shape:'wave'},{id:'med',kind:'puntual',type:'Médico'}];
assert.deepEqual(Array.from(a.evSortMarks(markerEvents),e=>e.id),['outline','med','gest','fill']);
assert(a.evMarkerHtml({kind:'puntual',type:'Médico',shape:'x-thin',color:'#e03131'}).includes('ev-shape-medical'));
const massBase={...original,skips:{},extraSessions:[]};a.RUTINAS=[massBase];
const massCancelled=a.rutBulkChange(massBase,['2026-08-20','2026-08-24'],'cancel');
assert(massCancelled.skips['2026-08-20']&&massCancelled.skips['2026-08-24']);assert.equal(Object.keys(massBase.skips).length,0);
assert.equal(a.rutUnrecoveredSessions(massCancelled).length,2);
assert.throws(()=>a.rutBulkChange(massBase,['2026-08-20','invalid'],'cancel'));assert.equal(Object.keys(massBase.skips).length,0);
const massDeleted=a.rutBulkChange(withRecovery,['2026-08-20','2026-08-24'],'delete');assert.equal(massDeleted.extraSessions[0].recoveryOf,null);
// Pausas con vuelta explícita: conservan las versiones del horario y el backup.
const paused=a.rutPauseAfter(withRecovery,'2026-08-20','2026-09-01');
assert.equal(a.rutSessionsOn(paused,'2026-08-24').length,0);assert.equal(a.rutSessionsOn(paused,'2026-09-03').length,1);
assert.equal(a.rutSessionsOn(paused,'2026-08-20').length,1);assert.equal(paused.extraSessions.length,1);
const pausedImport=a.validateImport({rutinas:[paused]}).rutinas[0];assert.equal(a.rutSessionsOn(pausedImport,'2026-08-24').length,0);
assert.throws(()=>a.rutPauseAfter(massBase,'2026-08-20','2026-08-20'));
assert.throws(()=>a.validateImport({rutinas:[{...massBase,pauses:[{from:'2026-09-01',to:'2026-08-20'}]}]}));
const flexCancelled=a.rutEditSession(f,'2026-08-17','19:00',60,true);
const pausedFlex=a.rutPauseAfter(flexCancelled,'2026-08-17','2026-08-25');assert.equal(a.validateImport({rutinas:[pausedFlex]}).rutinas[0].pauses.length,1);
// La tarjeta enseña el horario vigente, no un cambio que aún no ha empezado.
const futureSchedule={...original,weekDays:[2],time:'20:00',dur:90,times:null,
 scheduleHistory:[{until:'2026-09-01',schedule:{weekDays:[1,4],time:'18:00',dur:60,times:{4:'23:30'}}}]};
const currentHtml=a._renderRutSchedule(futureSchedule,'2026-08-21');
assert(currentHtml.includes('Lunes 18:00–19:00'));
assert(currentHtml.includes('Jueves 23:30–00:30'));
assert(!currentHtml.includes('20:00'));
const nextHtml=a._renderRutSchedule(futureSchedule,'2026-09-01');
assert(nextHtml.includes('Martes')&&nextHtml.includes('<time>21:30</time>'));
assert(!nextHtml.includes('Lunes 18:00'));
console.log('Rutinas: agrupación, horarios vigentes, operaciones atómicas y pausa temporal importable OK');

// La edición general respeta el inicio y no modifica el horario ni el cupo inicial.
{
const future={...original,id:'future',start:'2026-09-01',icon:'padel',skips:{},extraSessions:[]};
assert.equal(a.rutSetupLocked(future),false);
assert.equal(a.rutSetupLocked({...future,start:'2026-08-21'}),true);
assert.equal(a.rutSetupLocked({...future,extraSessions:[{date:'2026-08-20'}]}),true);
assert(a.renderRutForm(future).includes('id="rutFIcons"'));
assert(!a.renderRutForm({...future,start:'2026-08-21'}).includes('id="rutFIcons"'));
const initial=a.rutFormCandidate(future,{name:'Otro nombre',icon:'baile',color:'#e03131',weekDays:[2],time:'21:00',dur:90,flex:null});
assert.equal(initial.start,'2026-09-01');assert.equal(initial.time,'21:00');assert.equal(initial.dur,90);
assert.equal(a.rutOccursOn(initial,'2026-08-25'),null);
const protectedEdit=a.rutFormCandidate(original,{name:'Renombrada',icon:'gym',color:'#38bdf8',weekDays:[0],time:'21:00',dur:90,suspend:original.suspend});
assert.equal(protectedEdit.time,original.time);assert.deepEqual(protectedEdit.weekDays,original.weekDays);
assert.equal(protectedEdit.dur,original.dur);assert.equal(protectedEdit.icon,a.rutIconOf(original));
const flexGoals={...future,start:'2026-08-01',weekDays:[],flex:{period:'month',target:8,weeklyTarget:2,sessions:{'2026-08-20':{time:'18:00',dur:60}}}};
const newGoals=a.rutFormCandidate(flexGoals,{name:flexGoals.name,color:flexGoals.color,flex:{target:12,weeklyTarget:3,period:'week',sessions:{}}});
assert.equal(newGoals.flex.period,'month');assert.equal(a.rutFlexTarget(newGoals,'2026-08-02'),8);
assert.equal(a.rutFlexTarget(newGoals,'2026-09-02'),12);assert.equal(newGoals.flex.weeklyTarget,3);
assert.deepEqual(newGoals.flex.sessions,flexGoals.flex.sessions);assert.equal(flexGoals.flex.target,8);
assert.equal(a.rutSetupLocked({...flexGoals,start:'2026-08-25'}),true); // Fechas ya realizadas al iniciar a mitad de mes.
// Cambiar modalidad antes del inicio conserva las sesiones explícitas y las recuperaciones.
const planned={...future,weekDays:[],flex:{period:'month',target:8,weeklyTarget:2,sessions:{'2026-09-03':{time:'19:00',dur:45}}},skips:{'2026-09-03':1},extraSessions:[{id:'extra-linked',date:'2026-09-04',time:'12:00',dur:45,recoveryOf:'2026-09-03'}]};
const toFixed=a.rutFormCandidate(planned,{name:planned.name,color:planned.color,flex:null,weekDays:[1],time:'17:00',dur:60});
assert.equal(a.rutOccursOn(toFixed,'2026-09-03'),'19:00');assert.equal(a.rutDurationOn(toFixed,'2026-09-03'),45);
assert.doesNotThrow(()=>a.validateImport({rutinas:[toFixed]}));
const backToFlex=a.rutFormCandidate(toFixed,{name:planned.name,color:planned.color,flex:{period:'month',target:8,weeklyTarget:2,sessions:{}}});
assert.equal(backToFlex.flex.sessions['2026-09-03'].time,'19:00');assert.doesNotThrow(()=>a.validateImport({rutinas:[backToFlex]}));
// La duración de una semana no cambia semanas anteriores/posteriores ni las canceladas.
const weeklyDuration=a.rutChangeWeek({...original,skips:{}},'2026-08-24',{weekDays:original.weekDays,time:'18:00',dur:90});
assert.equal(a.rutDurationOn(weeklyDuration,'2026-08-20'),60);assert.equal(a.rutDurationOn(weeklyDuration,'2026-08-24'),90);
assert.equal(a.rutDurationOn(weeklyDuration,'2026-08-31'),60);
assert.equal(a.validateImport({rutinas:[weeklyDuration]}).rutinas[0].weeks['2026-08-24'].dur,90);
assert.throws(()=>a.validateImport({rutinas:[{...weeklyDuration,weeks:{'2026-08-24':{dur:5}}}]}),/Excepcion/);
const cancelledDuration=a.rutChangeWeek({...original,skips:{'2026-08-24':1}},'2026-08-24',{weekDays:original.weekDays,time:'18:00',dur:90});
assert.equal(a.rutDurationOn(cancelledDuration,'2026-08-24'),60);
console.log('Edición protegida, cupos habituales, modalidades futuras y duración semanal OK');
}
