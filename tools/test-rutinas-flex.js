const assert=require('assert/strict');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
const r={id:'flex-test',name:'Actividad flexible',start:'2026-09-01',weekDays:[],time:'19:00',dur:60,color:'#123456',skips:{},flex:{period:'month',target:8,weeklyTarget:2,sessions:{}}};
a.RUTINAS=[r];
assert.equal(a.rutFlexWarnings('2026-09-24')[0].text.includes('Faltan 2'),true);
a.rutFlexSetSession(r,null,'2026-09-22','00:00',45);
a.rutFlexSetSession(r,null,'2026-09-25','18:30',60);
assert.equal(a.rutOccursOn(r,'2026-09-22'),'00:00');
assert.equal(a.rutOccursOn(r,'2026-09-23'),null);
assert.equal(a.rutDurationOn(r,'2026-09-22'),45);
assert.equal(a.rutFlexWarnings('2026-09-24').length,0);
assert.equal(a.rutEventsOn('2026-09-25')[0]._rutTime,'18:30');
r.skips['2026-09-25']=1;
assert.equal(a.rutFlexStatus(r,'2026-09-24').missing,1);
assert.equal(a.rutEventsOn('2026-09-25')[0]._rutSkip,true);
a.rutFlexSetSession(r,'2026-09-25','2026-09-25','20:00',45);
assert.equal(a.rutIsSkipped(r,'2026-09-25'),true);
assert.throws(()=>a.rutFlexSetSession(r,null,'2026-09-22','19:00',60));
const restored=a.validateImport(JSON.parse(JSON.stringify({rutinas:[r]}))).rutinas[0];
assert.equal(a.rutOccursOn(restored,'2026-09-22'),'00:00');
assert.equal(a.rutDurationOn(restored,'2026-09-22'),45);
assert.throws(()=>a.validateImport({rutinas:[{...r,flex:{...r.flex,target:0}}]}));
assert.throws(()=>a.validateImport({rutinas:[{...r,flex:{...r.flex,sessions:{'2026-09-22':{time:'25:00',dur:60}}}}]}));
// Cupo completo: no pedir más sesiones aunque la semana aún esté vacía.
r.flex.target=1;assert.equal(a.rutFlexWarnings('2026-09-28').length,0);
assert.throws(()=>a.rutFlexSetSession(r,null,'2026-09-29','19:00',60));
assert.equal(r.flex.sessions['2026-09-29'],undefined);
// Nuevo mes, semana que cruza año y febrero bisiesto.
assert.equal(a.rutFlexStatus(r,'2026-10-01').left,1);
assert.equal(a.rutFlexRange('2027-01-01','week').start,'2026-12-28');
assert.equal(a.rutFlexRange('2028-02-15','month').end,'2028-02-29');
const weekly=JSON.parse(JSON.stringify(r));weekly.id='weekly';weekly.flex={period:'week',target:2,weeklyTarget:2,sessions:{}};a.RUTINAS=[weekly];
a.rutFlexSetSession(weekly,null,'2026-09-22','10:00',60);a.rutFlexSetSession(weekly,null,'2026-09-23','11:00',60);
assert.throws(()=>a.rutFlexSetSession(weekly,null,'2026-09-24','11:00',60));
a.rutFlexSetSession(weekly,null,'2026-09-28','11:00',60);
assert.equal(a.rutFlexStatus(weekly,'2026-09-28').missing,1);
// El límite diario se revisa también para fechas explícitas lejanas.
a.RUTINAS=['a','b','c'].map(id=>({...r,id,flex:{period:'month',target:8,weeklyTarget:2,sessions:{'2027-06-15':{time:'18:00',dur:60}}}}));
assert.throws(()=>a.rutFlexSetSession(weekly,null,'2027-06-15','18:00',60));
// Alta con el mes empezado: el primer cupo incluye sesiones anteriores al alta.
// El entorno fija hoy en 21/08/2026; hoy aún no cuenta como hecho.
const firstMonth={...r,id:'first-month',start:'2026-08-21',skips:{},flex:{period:'month',target:8,weeklyTarget:2,monthTargets:{'2026-08':3},sessions:{}}};
a.RUTINAS=[firstMonth];
assert.equal(a.rutFlexEarliest(firstMonth),'2026-08-01');
a.rutFlexSetSession(firstMonth,null,'2026-08-01','00:00',45);
a.rutFlexSetSession(firstMonth,null,'2026-08-20','18:30',60);
a.rutFlexSetSession(firstMonth,null,'2026-08-21','08:00',60);
assert.equal(a.rutOccursOn(firstMonth,'2026-08-01'),'00:00');
assert.equal(a.rutEventsOn('2026-08-01')[0]._rutDur,45);
assert.equal(a.rutSessions(firstMonth,'2026-07-01','2026-08-31').length,3);
assert.equal(a.rutSessions(firstMonth,'2026-08-20','2026-08-31').length,2);
assert.equal(a.rutStats(firstMonth).hechas,2);
assert.equal(a.rutStats(firstMonth,'2026-08-20').hechas,1);
assert.equal(a.rutStats(firstMonth).saltadas,0);
assert.equal(a.rutFlexStatus(firstMonth,'2026-08-21').target,3);
assert.equal(a.rutFlexStatus(firstMonth,'2026-08-21').left,0);
assert.equal(a.rutFlexWarnings('2026-08-24').length,0);
assert.match(a.rutFlexSummary(firstMonth),/3 \/ 3 sesiones del mes/);
a.RUT_PLAN={id:firstMonth.id,month:'2026-08',day:null};
assert.match(a.renderRutPlan(firstMonth),/3 \/ 3 sesiones del mes/);
assert.doesNotMatch(a.renderRutPlan(firstMonth),/data-rday="2026-08-01" disabled/);
a.RUT_PLAN.month='2026-07';
assert.match(a.renderRutPlan(firstMonth),/data-rday="2026-07-31" disabled/);

const beforeRejection=JSON.stringify(firstMonth);
assert.throws(()=>a.rutFlexSetSession(firstMonth,null,'2026-07-31','19:00',60),/primer/);
assert.throws(()=>a.rutFlexSetSession(firstMonth,null,'2026-08-22','19:00',60),/cupo/);
assert.equal(JSON.stringify(firstMonth),beforeRejection);
assert.equal(a.rutFlexTarget(firstMonth,'2026-09-01'),8);
a.rutFlexSetSession(firstMonth,null,'2026-09-01','19:00',60);
const beforeMove=JSON.stringify(firstMonth);
assert.throws(()=>a.rutFlexSetSession(firstMonth,'2026-09-01','2026-08-22','19:00',60),/cupo/);
assert.equal(JSON.stringify(firstMonth),beforeMove);
// Las canceladas no cuentan como hechas y liberan también el cupo especial.
a.rutToggleSkip(firstMonth,'2026-08-01');
assert.equal(a.rutStats(firstMonth).hechas,1);
assert.equal(a.rutStats(firstMonth).saltadas,1);
assert.equal(a.rutFlexStatus(firstMonth,'2026-08-21').left,1);
a.rutFlexSetSession(firstMonth,null,'2026-08-22','19:00',60);
assert.throws(()=>a.rutFlexSetSession(firstMonth,'2026-08-01','2026-08-01','00:00',45,true),/cupo/);
assert.equal(a.rutIsSkipped(firstMonth,'2026-08-01'),true);
a.rutToggleSkip(firstMonth,'2026-08-22');
a.rutToggleSkip(firstMonth,'2026-08-01');
assert.equal(a.rutStats(firstMonth).hechas,2);
// Recarga e importación conservan el cupo, las fechas y la duración histórica.
a.saveRutinas();
const reload=cargarApp({'excelia-rutinas-v1':a.localStorage.getItem('excelia-rutinas-v1')});
assert.equal(reload.rutStats(reload.RUTINAS[0]).hechas,2);
const roundTrip=a.validateImport(JSON.parse(JSON.stringify({rutinas:[firstMonth]}))).rutinas[0];
assert.equal(a.rutFlexTarget(roundTrip,'2026-08-01'),3);
assert.equal(a.rutDurationOn(roundTrip,'2026-08-01'),45);
assert.equal(a.rutStats(roundTrip).hechas,2);
assert.equal(roundTrip.start,'2026-08-21');

const zero={...firstMonth,id:'zero',flex:{...firstMonth.flex,monthTargets:{'2026-08':0},sessions:{}}};
a.RUTINAS=[zero];
assert.equal(a.rutFlexStatus(zero,'2026-08-21').left,0);
assert.equal(a.rutFlexWarnings('2026-08-21').length,0);
assert.throws(()=>a.rutFlexSetSession(zero,null,'2026-08-01','12:00',60),/cupo/);
assert.throws(()=>a.rutFlexSetSession(zero,null,'2026-08-31','12:00',60),/cupo/);
a.rutFlexSetSession(zero,null,'2026-09-01','12:00',60);
assert.equal(a.rutFlexStatus(zero,'2026-09-01').left,7);
assert.equal(a.validateImport({rutinas:[zero]}).rutinas[0].flex.monthTargets['2026-08'],0);
for(const monthTargets of [[],1,'3',{'2026-00':3},{'2026-13':3},{'2026-8':3},{'2026-08-01':3},{'2026-08':-1},{'2026-08':32},{'2026-08':1.5},{'2026-08':'3'},{'2026-08':null}]){
 assert.throws(()=>a.validateImport({rutinas:[{...zero,flex:{...zero.flex,monthTargets}}]}),/Cupo/);
}
assert.throws(()=>a.validateImport({rutinas:[{...zero,flex:{...zero.flex,sessions:{'2026-07-31':{time:'12:00',dur:60}}}}]}),/Sesión flexible/);
// Compatibilidad: las rutinas antiguas usan el cupo general; las fijas no se adelantan.
const legacy={...firstMonth,flex:{...firstMonth.flex,monthTargets:undefined}};
assert.equal(a.rutFlexTarget(legacy,'2026-08-01'),8);
assert.equal(a.validateImport({rutinas:[legacy]}).rutinas[0].flex.monthTargets,undefined);
assert.doesNotThrow(()=>a.rutFlexOptionsHtml({...legacy,start:undefined,flex:{...legacy.flex,monthTargets:{}}}));
const fixed={...firstMonth,flex:undefined,weekDays:[6]};
assert.equal(a.rutOccursOn(fixed,'2026-08-01'),null);
assert.equal(a.rutSessions(fixed,'2026-08-01','2026-08-31').length,2);
const boundary={...zero,start:'2027-01-01',flex:{period:'week',target:2,weeklyTarget:2,sessions:{}}};
a.RUTINAS=[boundary];
assert.equal(a.rutFlexEarliest(boundary),'2026-12-28');
a.rutFlexSetSession(boundary,null,'2026-12-28','12:00',60);
assert.throws(()=>a.rutFlexSetSession(boundary,null,'2026-12-27','12:00',60),/primer/);
assert.equal(a.validateImport({rutinas:[boundary]}).rutinas[0].flex.sessions['2026-12-28'].time,'12:00');
// Lectura del formulario: fechas y cupos se validan sin depender de visibilidad.
const form=cargarApp({});
let formPeriod='month';
const fields={rutFTarget:{value:'8'},rutFWeekly:{value:'2'},rutFStart:{value:'2026-08-21'},rutFFirstTarget:{value:''}};
form.document.getElementById=id=>fields[id]||null;
form.document.querySelector=selector=>selector==='[data-rmode="flex"]'?{classList:{contains:()=>true}}:{dataset:{rperiod:formPeriod}};
for(const value of ['', ' ', '-1', '32', '1.5']){
 fields.rutFFirstTarget.value=value;
 assert.throws(()=>form.rutFlexRead(null),/primer mes/);
}
fields.rutFFirstTarget.value='0';
assert.equal(form.rutFlexRead(null).monthTargets['2026-08'],0);
fields.rutFFirstTarget.value='3';
const firstRead=form.rutFlexRead(null);
assert.equal(firstRead.target,8);
assert.equal(firstRead.monthTargets['2026-08'],3);
fields.rutFStart.value='2026-09-21';
assert.equal(form.rutFlexRead(null).monthTargets['2026-09'],3);
assert.equal(form.rutFlexRead(null).monthTargets['2026-08'],undefined);
fields.rutFStart.value='2026-09-01';fields.rutFFirstTarget.value='';
assert.equal(Object.keys(form.rutFlexRead(null).monthTargets).length,0);
for(const value of ['', '2026-02-30', 'invalid']){
 fields.rutFStart.value=value;
 assert.throws(()=>form.rutFlexRead(null),/fecha de inicio/);
}
fields.rutFStart.value='2026-08-21';fields.rutFFirstTarget.value='3';
for(const value of ['0','32','1.5','']){
 fields.rutFTarget.value=value;
 assert.throws(()=>form.rutFlexRead(null),/cupo/);
}
fields.rutFTarget.value='8';fields.rutFWeekly.value='';
assert.throws(()=>form.rutFlexRead(null),/objetivo semanal/);
formPeriod='week';fields.rutFTarget.value='2';
assert.equal(form.rutFlexRead(null).weeklyTarget,2); // Campo semanal oculto, sin efecto.
assert.equal(Object.keys(form.rutFlexRead(null).monthTargets).length,0);
assert.throws(()=>form.rutFlexRead(firstMonth),/quedarían sesiones/);
fields.rutFTarget.value='8';
assert.throws(()=>form.rutFlexRead(null),/1 a 7/);
formPeriod='month';fields.rutFWeekly.value='2';fields.rutFFirstTarget.value='8';
assert.match(form.rutFlexOptionsHtml(legacy),/id="rutFFirstTarget" value="8"/);
assert.equal(Object.keys(form.rutFlexRead(legacy).monthTargets).length,0); // Renombrar no congela el cupo antiguo.
assert.match(form.rutFlexOptionsHtml(zero),/id="rutFFirstTarget" value="0"/);
fields.rutFFirstTarget.value='0';
const beforeEdit=JSON.stringify(zero);
const edited=form.rutFlexRead(zero);
assert.equal(edited.monthTargets['2026-08'],0);
assert.equal(edited.sessions['2026-09-01'].time,'12:00');
assert.equal(JSON.stringify(zero),beforeEdit);
console.log('Rutinas flexibles: cupos, formulario, primer mes, sesiones pasadas hechas, cancelación, fechas, calendario, recarga, backup y límite diario OK');
