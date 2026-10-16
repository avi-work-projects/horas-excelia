const assert=require('assert');const {cargarApp}=require('./entorno');const a=cargarApp({});
const fixed=()=>({id:'fixed',name:'Prueba',start:'2026-08-01',weekDays:[1,4],time:'18:00',dur:60,weeks:{},skips:{}});
let r=fixed();a.RUTINAS=[r];
// Las horas por día sobreviven a excepciones semanales, cambios futuros y backups.
const perDay={weekDays:[1,2,4],time:'18:00',times:{1:'17:00',2:'19:15',4:'20:30'},dur:60};
const weekly=a.rutChangeWeek(r,'2026-08-24',perDay);
const forward=a.rutNewSchedule(r,perDay,'2026-08-24');
for(const updated of [weekly,forward]){
 const restored=a.validateImport({rutinas:[JSON.parse(JSON.stringify(updated))]}).rutinas[0];
 assert.deepEqual(['2026-08-24','2026-08-25','2026-08-27'].map(ds=>a.rutOccursOn(restored,ds)),['17:00','19:15','20:30']);
 assert.equal(a.rutOccursOn(restored,'2026-08-17'),'18:00');
 assert.equal(a.rutOccursOn(restored,'2026-08-31'),updated===weekly?'18:00':'17:00');
}
for(const times of [{1:'25:00'},{7:'17:00'}])assert.throws(()=>a.validateImport({rutinas:[{...r,weeks:{'2026-08-24':{...perDay,times}}}]}),/Horario semanal/);
let changed=a.rutEditSession(r,'2026-08-20','19:00',45,false);
assert(a.rutSessionMoved(changed,a.rutSessionByKey(changed,'2026-08-20')));
let html=a.renderRutHistorySession(changed,a.rutSessionByKey(changed,'2026-08-20'),'2026-08-21');
assert(html.includes('Horario original'));assert(html.includes('Horario nuevo'));assert(html.includes('18:00–19:00'));assert(html.includes('19:00–19:45'));
changed=a.rutEditSession(changed,'2026-08-20','18:00',60,false);
assert(!a.rutSessionMoved(changed,a.rutSessionByKey(changed,'2026-08-20')));assert(!changed.keptSessions['2026-08-20']);
changed=a.rutEditSession(changed,'2026-08-20','18:00',60,true);
changed=a.rutEditSession(changed,'2026-08-20','18:00',60,false);
assert(!a.rutSessionMoved(changed,a.rutSessionByKey(changed,'2026-08-20')));
const flex={...fixed(),id:'flex',weekDays:[],flex:{period:'week',target:2,weeklyTarget:2,sessions:{'2026-08-20':{time:'17:00',dur:60}}}};
let f=a.rutEditSession(flex,'2026-08-20','20:00',60,false);
f=a.validateImport({rutinas:[f]}).rutinas[0];f=a.rutEditSession(f,'2026-08-20','17:00',60,false);
assert(!a.rutSessionMoved(f,a.rutSessionByKey(f,'2026-08-20')));
// Las extras no cancelan ni recuperan otra clase, tampoco por APIs o lote.
changed=a.rutAddSession(r,{date:'2026-08-19',time:'19:00',dur:60});const key=changed.extraSessions[0].id;
assert.throws(()=>a.rutEditSession(changed,'2026-08-19','19:00',60,true,key),/extras/);
assert.throws(()=>a.rutAddSession(changed,{date:'2026-08-22',time:'19:00',dur:60},key),/extras/);
assert.throws(()=>a.rutBulkChange(changed,['2026-08-20',key],'cancel'),/extras/);assert(!changed.skips['2026-08-20']);
assert.equal(a.rutDeleteSession(changed,key).extraSessions.length,0);
const stats=a.rutStats(changed,'2026-08-17');assert.equal(stats.hechas,2);assert.equal(stats.extras,1);assert.equal(stats.total,2);assert.equal(stats.pct,150);
let recovered=a.rutAddSession(r,{date:'2026-08-19',time:'19:00',dur:60},'2026-08-17');
const rs=a.rutStats(recovered,'2026-08-17');assert.equal(rs.hechas,1);assert.equal(rs.saltadas,1);assert.equal(rs.recuperadas,1);assert.equal(rs.pct,100);
// Una sesión fija usa el censo habitual; reemplazar no duplica ni altera semanas siguientes.
a.RUTINAS=[r];changed=a.rutPlanFixedSession(r,{date:'2026-08-19',time:'16:00',dur:60},'2026-08-17');
assert.equal(a.rutOccursOn(changed,'2026-08-17'),null);assert.equal(a.rutOccursOn(changed,'2026-08-19'),'16:00');assert.equal(a.rutOccursOn(changed,'2026-08-24'),'18:00');assert(!changed.extraSessions);
assert.throws(()=>a.rutPlanFixedSession(r,{date:'2026-08-20',time:'16:00',dur:60}),/ya tiene/);
assert.throws(()=>a.rutPlanFixedSession(r,{date:'2026-08-19',time:'16:00',dur:60},'2026-08-20x'),/prevista/);
a.validateImport({rutinas:[changed]});
const added=a.rutPlanFixedSession(r,{date:'2026-08-19',time:'16:00',dur:60});assert(!a.rutSessionMoved(added,a.rutSessionByKey(added,'2026-08-19')));
const back=a.rutPlanFixedSession(changed,{date:'2026-08-17',time:'18:00',dur:60},'2026-08-19');assert(!a.rutSessionMoved(back,a.rutSessionByKey(back,'2026-08-17')));assert.equal(a.rutOccursOn(back,'2026-08-19'),null);
// Orden único: la hora real siempre manda y no se transforma en hora guardada.
a.appStorage.setItem(a.EV_PLAN_ORDER_KEY,JSON.stringify([{type:'Cena',time:'13:00'},{type:'Comida',time:'13:00'}]));
const plan={type:'Cena'},real={type:'Otros',time:'12:50'},later={type:'Otros',time:'13:10'};
assert(a.evCompareTime(real,plan)<0);assert(a.evUpcomingCompare(plan,later)<0);assert(a.evCompareTime(plan,{type:'Comida'})<0);assert.equal(a.evStartTime(plan),null);assert.equal(a.evTimeLabel(plan),'');
const marks=a.evSortMarks([later,plan,real]);assert.equal(marks[0],real);assert.equal(marks[1],plan);
assert.throws(()=>a.validateImport({planOrder:[{type:'Cena',time:'25:00'}]}),/horas/);
assert.throws(()=>a.validateImport({planOrder:[{type:'Cena',time:'13:00'},{type:'Cena',time:'14:00'}]}),/horas/);
assert.equal(a.getEvType({type:'Actividad cultural'}),'Plan cultural');assert(a.evIsPlan('Ponencia'));assert(a.evIsPlan('Desayunar'));
for(const shape of ['gym','padel','baile']){assert(a.rutIconSvg(shape,'#123456').includes('fill="#fff"'));assert(!a.renderEvForm(null).includes('data-shape="'+shape+'"'));}
assert.notEqual(a.evFixedSymbol('Carrera'),a.evFixedSymbol('Salir a Correr'));
console.log('Rutinas y planes: reversión, horarios originales, extras, cumplimiento, alta fija, prioridad real y backup OK');

// Sin hora se conserva la posición y el backup, con referencias vecinas o sin ninguna.
const nullable=[{type:'Carrera',time:'10:00'},{type:'Desayunar',time:null},{type:'Brunch',time:'11:00'}];
a.appStorage.setItem(a.EV_PLAN_ORDER_KEY,JSON.stringify(nullable));
assert.equal(a.evPlanReferenceTime('Desayunar'),null);
assert(a.evCompareOrder({type:'Carrera'},{type:'Desayunar'})<0);
assert(a.evCompareOrder({type:'Desayunar'},{type:'Brunch'})<0);
assert(a.evCompareOrder({type:'Otros',time:'09:50'},{type:'Carrera'})<0);
assert(a.evCompareOrder({type:'Otros',time:'11:10'},{type:'Brunch'})>0);
a.validateImport({planOrder:nullable});
a.EV_PLAN_ORDER_DRAFT=nullable.map(r=>({...r}));a.evPlanOrderReorder('Desayunar',0);
assert.equal(a.EV_PLAN_ORDER_DRAFT[0].time,null);
const pure=[{type:'Cena',time:null},{type:'Comida',time:null},{type:'Brunch',time:null}];
a.appStorage.setItem(a.EV_PLAN_ORDER_KEY,JSON.stringify(pure));
assert.deepEqual(Array.from(pure.slice().reverse().sort(a.evCompareOrder).map(r=>r.type)),pure.map(r=>r.type));
assert.equal(a.evStartTime({type:'Cena'}),null);assert.equal(a.evTimeLabel({type:'Cena'}),'');
assert(a.evShapeSvg('cooking').includes('svg'));
console.log('Planes sin referencia: posición, horas reales, arrastre, representación y backup OK');

assert.throws(()=>a.validateImport({planOrder:[{type:"Cena",time:"18:00"},{type:"Comida",time:null},{type:"Brunch",time:"12:00"}]}),/horas/);
// Identidad de los símbolos domésticos al importar y compatibilidad de las alianzas antiguas.
assert(a.evIsPlan('Boda'));assert.equal(a.evFixedSymbol('Boda'),'rings');
for(const shape of ['repair','cooking','leaf']){
  const ev={kind:'puntual',type:'Otros',shape,color:'#123456'};
  assert.equal(a.getEvDisplayColor(ev),a.EV_OTHER_FIXED_COLORS[shape]);
  assert.equal(a.getEvDisplayColor({...ev,kind:'grande'}),'#123456');
}
assert.equal(a.getEvDisplayColor({kind:'puntual',type:'Otros',shape:'rings',color:'#123456'}),'#123456');
