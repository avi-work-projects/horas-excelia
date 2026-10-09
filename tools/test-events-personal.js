'use strict';
const assert=require('node:assert/strict');
const {cargarApp}=require('./entorno');
const a=cargarApp({});a.RUTINAS=[];a.BDAYS=[];
const multiple={id:'split',kind:'puntual',type:'Otros',title:'Curso de prueba',start:'2026-08-19',end:'2026-09-03',dates:['2026-08-19','2026-08-22','2026-08-24','2026-09-03'],color:'#8b5e34',shape:'x-outline'};
a.EVENTS=[multiple];
let html=a.renderEvUpcoming();
const occurrences=h=>Array.from(h.matchAll(/class="ev-upcoming-item[^>]*data-id="split" data-first="([^"]+)"/g),m=>m[1]);
assert.deepEqual(occurrences(html),['2026-08-22','2026-08-24','2026-09-03']);
assert(!html.includes('En curso'));assert(!html.includes('Mié 19/08'));
// Entre dos fechas del curso no se inventa una sesión ni una duración continua.
a.EVENTS=[{...multiple,dates:['2026-08-19','2026-10-02'],end:'2026-10-02'}];
html=a.renderEvUpcoming();assert.deepEqual(occurrences(html),['2026-10-02']);assert(html.includes('Sin eventos en las próximas 3 semanas'));
// Los viajes siguen siendo intervalos y los repetidos muestran la próxima cita.
a.EVENTS=[{id:'trip',kind:'grande',type:'Viaje',title:'Viaje prueba',start:'2026-08-19',end:'2026-08-24',color:'#38bdf8'},
 {id:'repeat',kind:'puntual',type:'Rec. Gestiones',title:'Revisión semanal',start:'2026-01-01',repeat:{type:'weekly',weekDays:[1,5]},color:'#34d399'}];
html=a.renderEvUpcoming();assert(html.includes('En curso'));assert.equal((html.match(/class="ev-upcoming-item[^>]*data-id="repeat"/g)||[]).length,1);
for(const type of ['Plan/Quedada',...Object.keys(a.EV_PLAN_SUBTYPES)])assert.equal(a.evFilterGroup({kind:'puntual',type}),'Plan/Quedada');
a.EV_ANNUAL_FILTER_HIDDEN=['Plan/Quedada'];a.evCycleFilters();assert.equal(a.EV_ANNUAL_FILTER_HIDDEN.length,7);a.evCycleFilters();a.evCycleFilters();assert.deepEqual(Array.from(a.EV_ANNUAL_FILTER_HIDDEN),['Plan/Quedada']);
assert.equal(a.evDetailTitleColor(multiple),'var(--text)');assert.equal(a.evDetailTitleColor({kind:'puntual',type:'Cena'}),'var(--ev-detail-plan)');assert.equal(a.evDetailTitleColor({kind:'puntual',type:'Llamada'}),'var(--ev-detail-management)');
assert.equal(a.getEvDisplayColor({kind:'puntual',type:'Llamada',color:'#868e96'}),'#1e40af');
assert(a.evShapeSvg('phone').includes('fill="currentColor"'));assert(!a.evShapeSvg('phone').includes('#868e96'));
assert.match(a.renderEvDetail(multiple),/id="evDMarker"[^>]*>.*ev-shape-x-outline/);
for(const view of ['cal','quad','annual']){a.EV_VIEW=view;assert(!a.renderEvContent().includes('id="evAdd"'));}
a.EV_VIEW='birthdays';html=a.renderEvContent();assert.match(html,/id="evBdayAdd"[^>]*>\+ Añadir<\/button>/);assert.equal((html.match(/id="evBdayAdd"/g)||[]).length,1);

a.FISCAL_YEAR=2026;a.FISCAL_TAB='personal';a.loadPersonalYear(2026);
assert.equal(a.personalHasChanges(),false);assert.match(a.renderFiscalContent(),/id="personalSaveFooter" hidden/);
a.PERSONAL_DATA.gastosRecurrentes[0].amount=80;assert.equal(a.personalHasChanges(),true);
a.PERSONAL_DATA.gastosRecurrentes[0].amount=0;assert.equal(a.personalHasChanges(),false);
a.PERSONAL_DATA.gastosRecurrentes[0].periods=[{start:'2026-01-01',end:'2026-12-31',amount:80,period:'monthly'}];
// Las copias antiguas admiten opciones auxiliares que no son listas de partidas.
a.PERSONAL_DATA.limpiezaCasa={enabled:true,amount:40};
a.PERSONAL_DATA.legacyNote='Preferencia anterior';
assert.doesNotThrow(()=>a.renderFiscalContent());
assert.equal(a.personalAdvancedCards().length,1);
a.savePersonalYear(2026);assert.equal(a.personalHasChanges(),false);
const item=a.PERSONAL_DATA.gastosRecurrentes[0];
assert.equal(a.personalCardOpen('gastosRecurrentes',item,0),false);
assert.match(a.renderPersonalCard(item,'gastosRecurrentes',0,'monthly'),/class="personal-period-details" hidden/);
a.togglePersonalCards();assert(a.personalCardsAllOpen());
const b=cargarApp(a.localStorage._datos);b.FISCAL_YEAR=2026;b.loadPersonalYear(2026);assert(b.personalCardOpen('gastosRecurrentes',item,0));
assert.equal(b.PERSONAL_DATA.limpiezaCasa.amount,40);assert.equal(b.PERSONAL_DATA.legacyNote,'Preferencia anterior');
b.FISCAL_YEAR=2027;assert(!b.personalCardOpen('gastosRecurrentes',item,0));
a.togglePersonalCards();assert(!a.personalCardsAllOpen());assert(!a.personalHasChanges(),'Plegar no modifica importes');
console.log('Eventos por fecha, filtros P/Q, ficha con símbolo y partidas personales plegables: OK');

// Próximos y Recordatorios comparten orden, sin convertir referencias en horas reales.
a.RUTINAS=[];a.BDAYS=[];
require('vm').runInContext(require('fs').readFileSync(require('path').join(__dirname,'../js/home-popup.js'),'utf8'),a);
a.EVENTS=['Cena','Comida','Cine','Brunch','Bolos','Tomar algo','Copas','Salir de fiesta'].map((type,i)=>({id:'order-'+i,kind:'puntual',type,title:type,start:'2026-08-21'}));
a.EVENTS.push({id:'timed',kind:'puntual',type:'Rec. Gestiones',title:'Gestión con hora',time:'19:30',start:'2026-08-21'});
const ordered=a.EVENTS.slice().sort(a.evUpcomingCompare).map(e=>e.id);
assert.deepEqual(Array.from(a.homeReminderEvents(new a.Date(2026,7,21)),it=>it.event.id),ordered);
html=a.renderEvUpcoming();ordered.forEach((id,i)=>{if(i)assert(html.indexOf('data-id="'+ordered[i-1]+'"')<html.indexOf('data-id="'+id+'"'));});
for(const [type,time] of Object.entries({Brunch:'11:00',Bolos:'19:00',Cine:'20:00'}))assert.equal(a.evPlanReferenceTime(type),time);
for(const type of ['Cumpleaños','Ping pong','Ver partido fútbol','Juegos de mesa','Ponencia'])assert.equal(a.evPlanReferenceTime(type),null);
for(const type of ['Cumpleaños','Brunch','Bolos','Cine','Ping pong','Ver partido fútbol','Juegos de mesa','Ponencia']){
  assert(a.evIsPlan(type));assert(a.EV_TYPE_COLORS['puntual|'+type]);
  assert(a.evShapeSvg(a.evFixedSymbol(type)).includes('fill="currentColor"'));
}
// El bloque continuo queda reservado a viajes que ya han comenzado.
a.EVENTS=[{id:'ongoing',kind:'grande',type:'Viaje',title:'En curso prueba',start:'2026-08-20',end:'2026-08-25'},
 {id:'future',kind:'grande',type:'Viaje',title:'Futuro prueba',start:'2026-08-22',end:'2026-08-25'}];
html=a.renderEvUpcoming();assert(html.indexOf('data-id="ongoing"')<html.indexOf('ev-up-daysep'));
assert(html.indexOf('Sáb 22/08')<html.indexOf('data-id="future"'));
a.EVENTS=[{...a.EVENTS[1],start:'2026-10-03',end:'2026-10-05'}];
html=a.renderEvUpcoming();assert(html.includes('Sin eventos en las próximas 3 semanas'));assert(html.indexOf('Sáb 03/10')<html.indexOf('data-id="future"'));
console.log('Planes nuevos, orden compartido y grandes agrupados por inicio: OK');
