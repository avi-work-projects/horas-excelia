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

// El mes mas una semana adicional: incluso al cruzar diciembre/enero.
for(const [year,month] of [[2026,8],[2026,11],[2027,1]]){
 a.SW={};const current=a.weeks(year,month);let state=a.homeSubmissionStatus(year,month);
 assert.equal(state.missing,current.length);assert.equal(state.complete,false);
 current.forEach(w=>a.SW[a.dk(w[0])]=true);state=a.homeSubmissionStatus(year,month);
 assert.equal(state.missing,0);assert.equal(state.complete,false);
 assert.equal(a.dk(state.extra),a.dk(a.ad(current[current.length-1][0],7)));
 a.SW[a.dk(state.extra)]=true;assert.equal(a.homeSubmissionStatus(year,month).complete,true);
 delete a.SW[a.dk(current[0][0])];assert.equal(a.homeSubmissionStatus(year,month).complete,false);
}
console.log('Home: mes enviado mas semana adicional sin duplicados OK');

// CSV: comparar datos exportados, no el numero de ediciones de la Home.
a.ST={};a.appStorage.removeItem(a.CSV_EXPORT_KEY);
const baseline=a.csvYearContent(2026);a.csvRecordExport(2026,baseline);
assert.equal(a.csvPendingWarnings(new Date('2026-09-13')).length,0);
a.ST['2026-09-14']={type:'festivo'};
assert.equal(a.csvPendingWarnings(new Date('2026-09-13'))[0].year,2026);
delete a.ST['2026-09-14'];assert.equal(a.csvPendingWarnings(new Date('2026-09-13')).length,0);
a.ST['2026-09-14']={type:'normal',hours:4}; // las horas no viajan en este CSV
assert.equal(a.csvPendingWarnings(new Date('2026-09-13')).length,0);
a.ST['2027-01-04']={type:'festivo'};assert.equal(a.csvPendingWarnings(new Date('2026-09-13')).length,0);
assert.equal(a.csvPendingWarnings(new Date('2026-12-01'))[0].year,2027);
a.csvRecordExport(2027,a.csvYearContent(2027));assert.equal(a.csvPendingWarnings(new Date('2026-12-01')).length,0);
const csvRecords=a.csvExportRecords();a.auditImport({csvExports:csvRecords},'replace');
assert.equal(a.csvExportRecords()['2026'].content,baseline);
assert.throws(()=>a.validateImport({csvExports:{2026:{content:'invalid'}}}));
console.log('CSV: cambios, deshacer, independencia por año, diciembre e importacion OK');

a.ST={'2026-09-14':{type:'festivo'},'2026-09-15':{type:'vacaciones'},'2026-09-16':{type:'ausencia'}};
const separate=a.csvYearContent(2026);
assert(separate.includes('2026-09-14,festivo\n'));
assert(separate.includes('2026-09-15,vacaciones\n'));
assert(separate.includes('2026-09-16,ausencia\n'));
assert(separate.includes('2026-09-17,trabajado\n'));
a.csvRecordExport(2026,separate);a.ST['2026-09-14'].type='vacaciones';
assert(a.csvPendingWarnings(new Date('2026-09-13')).some(w=>w.year===2026));
console.log('CSV: tres estados no trabajados independientes y cambio entre ellos detectado OK');

const futureCouple={id:'future-test',name:'Reserva de prueba',future:true,weddingDate:null,contracted:4,color:'#8b5e34'};
assert.equal(a.bodaMatchesDate(futureCouple,'activas'),false);
assert.equal(a.bodaMatchesDate(futureCouple,'futuras'),true);
assert.equal(a.bodaMatchesDate(futureCouple,'todas'),true);
assert.equal(a.bodaMatchesDate(futureCouple,'pasadas'),false);
a.auditImport({bodas:[futureCouple]},'replace');assert.equal(a.BODA_COUPLES[0].future,true);
a.BODA_COUPLES[0].future=false;assert.equal(a.bodaMatchesDate(a.BODA_COUPLES[0],'activas'),true);
console.log('Parejas futuras: filtro independiente, fecha opcional e importacion OK');

a.BODA_COUPLES=[{id:'c1',name:'Uno',color:'#8b5e34'},{id:'c2',name:'Dos',color:'#1946a0'},{id:'c3',name:'Tres',color:'#e5a746'}];
a.EVENTS=['c1','c2','c3'].map((id,i)=>({id:'cl'+i,kind:'puntual',type:'Ensayos boda',start:i===2?'2026-09-16':'2026-09-15',boda:{coupleId:id,time:'18:00'}}));
a.BODA_CAL_YEAR=2026;a.BODA_CAL_MONTH=8;a.BODA_CAL_DAY='2026-09-15';a.BODA_CAL_HL=null;
let cal=a._renderBodaCalendario();assert.equal((cal.match(/boda-cal-lg on/g)||[]).length,2);
a.BODA_CAL_DAY='2026-09-17';assert.equal((a._renderBodaCalendario().match(/boda-cal-lg on/g)||[]).length,0);
a.BODA_CAL_DAY=null;a.BODA_CAL_HL='c1';assert(a._renderBodaCalendario().includes('boda-cal-day hl'));
console.log('Calendario WM: seleccion de varias parejas por dia y seleccion inversa OK');

a.BODA_CAL_HL=null;a.BODA_CAL_DAY='2026-09-17';
a.BODA_COUPLES[0].weddingDate='2026-09-17';a.BODA_COUPLES[1].weddingDate='2026-09-17';
assert.equal((a._renderBodaCalendario().match(/boda-cal-lg on/g)||[]).length,2);
a.BODA_CAL_DAY='2026-09-15';a.BODA_COUPLES[2].weddingDate='2026-09-15';a.BODA_COUPLES[0].weddingDate='2026-09-15';
assert.equal((a._renderBodaCalendario().match(/boda-cal-lg on/g)||[]).length,3);
console.log('Calendario WM: bodas y ensayos del dia, sin duplicar parejas OK');

// ICS: exclusión, identidad estable, rango inclusivo y escape sin inyección.
const icsEvent={id:'ics-inventado',kind:'grande',type:'Viaje',title:'Viaje de prueba',start:'2026-09-29',end:'2026-10-02',note:'Nota privada'};
let icsRows=a.evIcsCandidates([icsEvent,{id:'ensayo',type:'Ensayos boda',start:'2026-09-30'}],'2026-10-01','2026-10-31');
assert.equal(icsRows.length,1);assert.equal(icsRows[0].start,'2026-09-29');
let icsText=a.evIcsFile(icsRows,false);
assert(icsText.includes('DTEND;VALUE=DATE:20261003'));assert(!icsText.includes('Nota privada'));
const uidBefore=icsText.match(/UID:([^\r]+)/)[1];
icsEvent.start='2026-10-01';icsEvent.title='Otro título';
assert.equal(a.evIcsFile(a.evIcsCandidates([icsEvent],'2026-09-01','2026-12-31'),true).match(/UID:([^\r]+)/)[1],uidBefore);
assert.equal((a.evIcsFile([icsRows[0],icsRows[0]],true).match(/BEGIN:VEVENT/g)||[]).length,1);
assert.equal(a.evIcsCandidates([icsEvent],'2026-10-10','2026-09-01').length,0);
assert.equal(a.evIcsCandidates([icsEvent],'2026-01-01','2036-12-31').length,0);
assert.equal(a.evIcsText('a,b;c\\d\nATTENDEE:bad'),'a\\,b\\;c\\\\d\\nATTENDEE:bad');
const folded=a.evIcsFold('SUMMARY:'+('Árbol 🧳'.repeat(80)));
folded.split('\r\n').forEach(line=>assert(Buffer.byteLength(line,'utf8')<=75));
assert.equal(folded.replace(/\r\n /g,''),'SUMMARY:'+('Árbol 🧳'.repeat(80)));
const timed={id:'hora',kind:'puntual',type:'Otros',title:'Cena',start:'2026-10-25',time:'23:30',endTime:'01:00'};
const timedIcs=a.evIcsFile(a.evIcsCandidates([timed],'2026-10-01','2026-10-31'),false);
assert(timedIcs.includes('DTSTART;TZID=Europe/Madrid:20261025T233000'));
assert(timedIcs.includes('DTEND;TZID=Europe/Madrid:20261026T010000'));
const recur={id:'recur',kind:'puntual',type:'Otros',start:'2026-01-31',repeat:{type:'monthly-date'}};
const recurringRows=a.evIcsCandidates([recur],'2026-02-01','2026-03-31');
assert.deepEqual(Array.from(recurringRows,r=>r.start),['2026-02-28','2026-03-31']);
assert.notEqual(recurringRows[0].key,recurringRows[1].key);
console.log('ICS: identidad, exclusiones, repetición, fechas, medianoche y UTF-8 OK');

// Reexportación y avisos; ninguna ruta genera cancelaciones, ni con backups antiguos.
const syncEv={id:'sync-test',kind:'grande',type:'Casa Rural',title:'Casa inventada',start:'2026-10-01',end:'2026-10-03'};
let syncRows=a.evIcsCandidates([syncEv],'2026-09-01','2026-12-31'),syncKey=syncRows[0].key,syncSelect={[syncKey]:true};
let syncRecords=a.evIcsPrepare(syncRows,syncSelect,{},false);
const syncOriginal=JSON.stringify(syncRecords);
assert.equal(JSON.stringify(a.evIcsPrepare(syncRows,syncSelect,syncRecords,false)),syncOriginal);
syncEv.start='2027-05-01';syncEv.end='2027-05-03';
syncRows=a.evIcsRememberedRows([syncEv],'2026-09-01','2026-12-31',syncRecords);
assert.equal(syncRows.length,1);assert.equal(syncRows[0].start,'2027-05-01');
syncRecords=a.evIcsPrepare(syncRows,syncSelect,syncRecords,false);
assert.equal(syncRecords[syncKey].sequence,1);assert.equal(syncRecords[syncKey].cancelled,false);
assert.equal(JSON.stringify(a.evIcsPrepare(syncRows,{},syncRecords,false)),JSON.stringify(syncRecords));
const cancelRecords=JSON.parse(JSON.stringify(syncRecords));
cancelRecords[syncKey].cancelled=true;cancelRecords[syncKey].sequence=2;cancelRecords[syncKey].signature='legacy-cancellation';
assert(!a.evIcsFile(Object.values(cancelRecords),true).includes('BEGIN:VEVENT'));
assert.equal(a.evIcsExportStatus(syncRows[0],syncRecords[syncKey],false),'repeat');
syncEv.title='Casa inventada actualizada';
assert.equal(a.evIcsExportStatus(syncRows[0],syncRecords[syncKey],false),'changed');
assert.equal(a.evIcsExportStatus(syncRows[0],null,false),'new');
const deletedRows=a.evIcsRememberedRows([],'2026-09-01','2026-12-31',syncRecords);
assert.equal(deletedRows[0].missing,true);
assert.equal(a.evIcsPrepare(deletedRows,syncSelect,syncRecords,false)[syncKey].cancelled,false);
assert.equal(a.evIcsExportStatus(deletedRows[0],syncRecords[syncKey],false),'missing');
const restored=a.evIcsPrepare(syncRows,syncSelect,cancelRecords,false);
assert.equal(restored[syncKey].sequence,3);assert.equal(restored[syncKey].cancelled,false);
a.auditImport({calendarExports:restored},'replace');assert.equal(a.evIcsRecords()[syncKey].sequence,3);
a.auditImport({calendarExports:syncRecords},'merge');assert.equal(a.evIcsRecords()[syncKey].sequence,3);
assert.throws(()=>a.validateImport({calendarExports:{bad:{}}}));
assert.equal(a.evIcsExportRows(cancelRecords,{},{}).length,0); // no reenviar bajas históricas automáticamente
assert.equal(a.evIcsExportRows(cancelRecords,syncSelect).length,0);
assert.equal(a.evIcsExportRows(syncRecords,{},{}).length,0); // no reenviar eventos desmarcados
assert.equal(a.evIcsExportRows(syncRecords,syncSelect,{}).length,1);
const filterRows=a.evIcsCandidates([
  {id:'g',kind:'grande',type:'Otros',title:'Grande inventado',start:'2026-10-01'},
  {id:'p',kind:'puntual',type:'Otros',title:'Puntual inventado',start:'2026-10-01'}
],'2026-10-01','2026-10-02');
assert.equal(a.evIcsFilterRows(filterRows,'grande','Otros','inventado').length,1);
assert.equal(a.evIcsFilterRows(filterRows,'puntual','Otros','inventado')[0].ev.id,'p');
assert.equal(a.evIcsFilterRows(filterRows,'','', 'ausente').length,0);
assert.equal(a.evIcsRememberedRows([],'2026-09-01','2026-12-31',cancelRecords).length,1); // historial antiguo sigue legible
console.log('ICS: avisos de cambios/reexportación, cero cancelaciones y backup OK');
