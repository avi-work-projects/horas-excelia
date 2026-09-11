const assert=require('node:assert/strict');
const fs=require('fs'),vm=require('vm');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
let source=fs.readFileSync('js/import-export.js','utf8');
source=source.replace(/\}\)\(\);\s*$/, 'window.auditImport=_applyFullImport;})();');
vm.runInContext(source,a);
a.showToast=()=>{};a.render=()=>{};a.updateEventsBtn=()=>{};a.updateBdayBtn=()=>{};
const ev=(id,time)=>({id,kind:'puntual',type:'Ensayos boda',title:'Ensayo',start:'2026-09-15',end:'2026-09-15',boda:{coupleId:'local',time}});
a.EVENTS=[ev('a','10:00')];a.evMergeIncoming([ev('b','18:00')]);assert.equal(a.EVENTS.length,2);
a.BODA_COUPLES=[{id:'local',name:'Pareja'}];
let d=a.prepareImportRelations(a.validateImport({bodas:[{id:'remote',name:'Pareja'}],events:[{...ev('c','12:00'),boda:{coupleId:'remote',time:'12:00'}}]}),true);
assert.equal(d.bodas[0].id,'local');assert.equal(d.events[0].boda.coupleId,'local');
assert.throws(()=>a.validateImport({events:[{...ev('x','12:00'),id:'bad" onmouseover="x'}]}));
assert.throws(()=>a.validateImport({birthdays:[{name:'X',day:31,month:2}]}));
const prior=a.localStorage.getItem('excelia-events-v1');
a.auditImport({events:[null],birthdays:[{name:'X',day:1,month:1}]},'replace');
assert.equal(a.localStorage.getItem('excelia-events-v1'),prior);
assert.equal(a.localStorage.getItem('excelia-bdays-v1'),null);
a.appStorage.setItem('audit-existing','old');
a.appStorage.begin();a.appStorage.setItem('audit-existing','new');a.appStorage.cancel();assert.equal(a.appStorage.getItem('audit-existing'),'old');
let set=a.localStorage.setItem,fail=true;
a.localStorage.setItem=(k,v)=>{if(k==='audit-fail'&&fail){fail=false;throw Error('Quota');}set(k,v);};
a.appStorage.begin();a.appStorage.setItem('audit-existing','new');a.appStorage.setItem('audit-fail','x');assert.throws(()=>a.appStorage.commit());assert.equal(a.appStorage.getItem('audit-existing'),'old');
console.log('Hardening: import identity, validation and rollback OK');

const birthday={name:'Temporal',day:22,month:8};a.BDAY_ALARM_SET[a.getBdayAlarmKey(birthday)]=true;assert.equal(a.isBdayAlarmSet(birthday),false);
a.setBdayAlarmState(birthday,true);assert.equal(a.isBdayAlarmSet(birthday),true);
a.BDAY_ALARM_SET[a.getBdayAlarmKey(birthday)]={date:'2025-08-22'};assert.equal(a.isBdayAlarmSet(birthday),false);
a.BDAYS=[1,2,3].map(i=>({name:'VIP'+i,day:22,month:8,vip:true}));assert.ok(a.birthdayValidation({...birthday,vip:true},null));assert.equal(a.validBirthday(29,2),true);assert.equal(a.validBirthday(31,2),false);
a.RUTINAS=[1,2,3].map(i=>({id:'r'+i,start:'2030-01-01',weekDays:[1],time:'18:00'}));assert.ok(a.rutLimitExceeded({id:'new',start:'2026-08-21',weekDays:[1],time:'18:00'},null));
console.log('Hardening: birthday expiry, VIP caps and distant routine limits OK');

const b=cargarApp({});
b.BODA_COUPLES=[{id:'p2',name:'Pack dos',contracted:2},{id:'p4',name:'Pack cuatro',contracted:4}];
b.EVENTS=[];b.bodaLoadConfig();
assert.equal(b.BODA_CONFIG.packs.map(p=>p.name).join(','),'Esencia,Latido,Eternidad');
b.BODA_CONFIG.packs[0].name='Pack 2';b.BODA_CONFIG.packs[1].name='Personalizado';b.saveBodaConfig();b.bodaLoadConfig();
assert.equal(b.BODA_CONFIG.packs[0].name,'Esencia');assert.equal(b.BODA_CONFIG.packs[1].name,'Personalizado');
assert.ok(b.renderBodaCoupleForm(null).includes('>Personalizado (4 clases)</option>'));

for(let i=0;i<3;i++)b.EVENTS.push({id:'cls'+i,kind:'puntual',type:'Ensayos boda',start:'2020-01-0'+(i+1),end:'2020-01-0'+(i+1),boda:{coupleId:'p2',time:'18:00',place:'casa'}});
assert.equal(b.bodaPackStats().counts[3],1);assert.equal(b.bodaPackStats().extras,1);assert.equal(b.bodaPackStats().byPack['pack-2'].classes,1);
assert.throws(()=>b.bodaDeleteCatalogItem('packs','pack-2'));assert.throws(()=>b.bodaDeleteCatalogItem('places','casa'));
b.bodaSetCatalogItem('packs','pack-2',{classes:6});assert.equal(b.BODA_COUPLES[0].packClasses,2);assert.equal(b.bodaPackStats().extras,1);
b.BODA_CONFIG.defaultDurationId='dur-20';assert.equal(b.bodaNewClass('2030-01-01','18:00',null,'').boda.duration,20);assert.equal(b.bodaDuration(b.EVENTS[0]),60);
b.bodaSetCatalogItem('durations','dur-60',{minutes:90});assert.equal(b.bodaDuration(b.EVENTS[0]),60);assert.throws(()=>b.bodaDeleteCatalogItem('durations','dur-60'));
b.bodaSetCatalogItem('places','casa',{active:false});assert.equal(b.bodaPlaceLabel(b.bodaPlaceOf(b.EVENTS[0])),'Casa');assert.notEqual(b.BODA_PLACE_DEFAULT,'casa');
assert.equal(b.bodaEndAt('18:00',20),'18:20');assert.equal(b.bodaEndAt('23:50',20),'00:10');
assert.throws(()=>b.validateBodaConfig({packs:[],durations:[],places:[],defaultDurationId:'no'}));
b.bodaDeleteCatalogItem('places','otro');assert.ok(!b.BODA_CONFIG.places.some(x=>x.k==='otro'));
console.log('Bodas: packs historicos, extras, duracion y referencias protegidas OK');

const upcoming=cargarApp({});upcoming.BDAYS=[{name:'Cumple futuro',month:9,day:25}];
assert.ok(upcoming.renderBdayUpcoming().includes('Siguiente cumpleaños'));
assert.ok(upcoming.renderBdayUpcoming().includes('Cumple futuro'));
assert.equal(upcoming.evFilterGroup({kind:'puntual',type:'Rutina'}),'Resto');
assert.ok(!b.renderBodaPackStats().split('Clases dadas por profesores')[0].includes('<b>0</b>'));

const teaching=cargarApp({});teaching.EVENTS=[null,{celia:true,angel:false,substitute:null},{celia:false,angel:true,substitute:null},{celia:true,angel:false,substitute:'Otro'}].map((teachers,i)=>({id:'t'+i,type:'Ensayos boda',kind:'puntual',start:'2020-01-01',boda:{coupleId:'p',time:'18:00',teachers:teachers}}));
assert.equal(JSON.stringify(teaching.bodaTeacherStats()),JSON.stringify({substitute:1,celia:1,angel:1,both:1}));
assert.equal(teaching.bodaTeacherCount({celia:true,angel:true,substitute:null}),2);

const emptyNames=cargarApp({});assert.equal(emptyNames.BODA_CONFIG.teacherNames.angel,'');assert.equal(emptyNames.BODA_CONFIG.teacherNames.celia,'');
assert.equal(emptyNames.bodaTeacherName('angel'),'Profesor 1');emptyNames.validateBodaConfig(emptyNames.BODA_CONFIG);
const roundtrip=JSON.parse(JSON.stringify(emptyNames.BODA_CONFIG));emptyNames.importBodaConfig(roundtrip,false);assert.equal(JSON.stringify(emptyNames.BODA_CONFIG),JSON.stringify(roundtrip));

// An effective schedule change preserves old attendance and cancelled appointments.
const routines=cargarApp({});
const original={id:'schedule',name:'Actividad',start:'2026-01-01',weekDays:[1],time:'17:00',dur:60,weeks:{},skips:{'2026-08-31':1}};
let revised=routines.rutChangeFrom(original,{...original,weekDays:[2],time:'19:00',dur:90},'2026-08-25');
assert.equal(routines.rutOccursOn(revised,'2026-08-24'),'17:00');
assert.equal(routines.rutOccursOn(revised,'2026-08-25'),'19:00');
assert.equal(routines.rutOccursOn(revised,'2026-08-31'),'17:00');
assert.equal(routines.rutIsSkipped(revised,'2026-08-31'),true);
assert.equal(routines.rutDurationOn(revised,'2026-08-24'),60);
assert.equal(routines.rutDurationOn(revised,'2026-08-25'),90);
assert.equal(routines.rutDurationOn(revised,'2026-08-31'),60);
assert.equal(routines.rutOccursOn(revised,'2026-09-07'),null);
let twice=routines.rutChangeFrom(revised,{...revised,weekDays:[3],time:'20:00'},'2026-09-02');
assert.equal(routines.rutOccursOn(twice,'2026-09-01'),'19:00');
assert.equal(routines.rutOccursOn(twice,'2026-09-02'),'20:00');
let sameBoundary=routines.rutChangeFrom(revised,{...revised,time:'20:00'},'2026-08-25');
assert.equal(routines.rutOccursOn(sameBoundary,'2026-08-24'),'17:00');
assert.equal(routines.rutOccursOn(sameBoundary,'2026-08-25'),'20:00');
assert.throws(()=>routines.rutChangeFrom(original,revised,'2020-01-01'));
const transferred=routines.validateImport(JSON.parse(JSON.stringify({rutinas:[twice]}))).rutinas[0];
assert.equal(routines.rutOccursOn(transferred,'2026-08-24'),'17:00');
assert.equal(routines.rutOccursOn(transferred,'2026-08-31'),'17:00');
assert.equal(routines.rutOccursOn(transferred,'2026-09-02'),'20:00');
assert.throws(()=>routines.validateImport({rutinas:[{...twice,scheduleHistory:[{until:'invalid',schedule:{}}]}]}));
routines.RUTINAS=[twice];assert.equal(routines.rutEventsOn('2026-08-24')[0]._rutDur,60);
console.log('Rutinas: historial, limites de fecha, cancelaciones y transferencia OK');

const weekly=routines.rutChangeWeek(twice,'2026-08-24',{weekDays:[4],time:'12:00'});
assert.equal(routines.rutOccursOn(weekly,'2026-08-20'),null);
assert.equal(routines.rutOccursOn(weekly,'2026-08-27'),'12:00');
assert.equal(routines.rutOccursOn(weekly,'2026-09-01'),'19:00');
assert.equal(routines.rutOccursOn(weekly,'2026-09-02'),'20:00');

const stages=routines.rutHistoryPeriods(twice,'2026-12-31');assert.equal(stages.length,3);
assert.equal(routines.rutHistoryPeriods(weekly,'2026-12-31').length,3,'weekly exceptions do not split the timeline');
let forward=routines.rutNewSchedule(original,{weekDays:[2],time:'19:00'},'2026-08-24');
assert.equal(routines.rutOccursOn(forward,'2026-08-17'),'17:00');assert.equal(routines.rutOccursOn(forward,'2026-08-25'),'19:00');
assert.equal(routines.rutOccursOn(forward,'2026-08-31'),'17:00');
const corrected=routines.rutEditSession(forward,'2026-08-17','16:30',45,false);
assert.equal(routines.rutOccursOn(corrected,'2026-08-17'),'16:30');assert.equal(routines.rutOccursOn(corrected,'2026-08-10'),'17:00');
assert.equal(routines.rutHistoryPeriods(corrected,'2026-12-31').length,2);
assert.throws(()=>routines.rutEditSession(corrected,'2026-08-17','99:30',45,false));
assert.equal(routines.validateImport({rutinas:[corrected]}).rutinas[0].keptSessions['2026-08-17'].dur,45);
assert.ok(routines.rutIconSvg('baile','#123456').includes('stroke-width="4.6"'));
console.log('Rutinas: etapas sin excepciones, edicion puntual e icono con contorno OK');

const elapsed=routines.rutNewSchedule(original,{weekDays:[5],time:'00:00'},'2026-08-21');
assert.equal(routines.rutOccursOn(elapsed,'2026-08-21'),null);
assert.equal(routines.rutOccursOn(elapsed,'2026-08-28'),'00:00');routines.validateImport({rutinas:[elapsed]});
assert.throws(()=>routines.validateImport({rutinas:[{...original,time:'bad" onclick="bad'}]}));

routines.RUTINAS=[corrected].concat([0,1,2].map(i=>({id:'other'+i,start:'2026-08-01',weekDays:[1],time:'18:00',dur:60})));
assert.throws(()=>routines.rutEditSession(corrected,'2026-08-31','17:00',60,false));
assert.equal(routines.rutEditSession(corrected,'2026-08-17','16:00',45,false).keptSessions['2026-08-17'].time,'16:00');

// Cada ejercicio conserva su cupo al editar e importar otros anos.
a.saveVacEntitlement(25,2026);a.saveVacEntitlement(28,2027);
assert.equal(a.vacEntitlementForYear(2026),25);assert.equal(a.vacEntitlementForYear(2027),28);
assert.equal(a.vacEntitlementForYear(2028),23);
const quotas=JSON.parse(a.appStorage.getItem(a.VAC_YEAR_KEY));
a.auditImport({vacByYear:{2028:30}},'merge');assert.equal(a.vacEntitlementForYear(2026),25);
a.auditImport({vacByYear:quotas},'replace');assert.equal(a.vacEntitlementForYear(2027),28);assert.equal(a.vacEntitlementForYear(2028),23);
assert.throws(()=>a.validateImport({vacByYear:{2026:90}}));
a.auditImport({vacEntitlement:24},'replace');assert.equal(a.vacEntitlementForYear(2026),24);
console.log('Vacaciones: cupo por ejercicio, importacion y compatibilidad OK');
