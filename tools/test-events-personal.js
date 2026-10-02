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
a.EV_VIEW='birthdays';html=a.renderEvContent();assert.match(html,/id="evBdayAdd"[^>]*>Añadir<\/button>/);assert.equal((html.match(/id="evBdayAdd"/g)||[]).length,1);

a.FISCAL_YEAR=2026;a.FISCAL_TAB='personal';a.loadPersonalYear(2026);
assert.equal(a.personalHasChanges(),false);assert.match(a.renderFiscalContent(),/id="personalSaveFooter" hidden/);
a.PERSONAL_DATA.gastosRecurrentes[0].amount=80;assert.equal(a.personalHasChanges(),true);
a.PERSONAL_DATA.gastosRecurrentes[0].amount=0;assert.equal(a.personalHasChanges(),false);
a.PERSONAL_DATA.gastosRecurrentes[0].periods=[{start:'2026-01-01',end:'2026-12-31',amount:80,period:'monthly'}];
a.savePersonalYear(2026);assert.equal(a.personalHasChanges(),false);
const item=a.PERSONAL_DATA.gastosRecurrentes[0];
assert.equal(a.personalCardOpen('gastosRecurrentes',item,0),false);
assert.match(a.renderPersonalCard(item,'gastosRecurrentes',0,'monthly'),/class="personal-period-details" hidden/);
a.togglePersonalCards();assert(a.personalCardsAllOpen());
const b=cargarApp(a.localStorage._datos);b.FISCAL_YEAR=2026;b.loadPersonalYear(2026);assert(b.personalCardOpen('gastosRecurrentes',item,0));
b.FISCAL_YEAR=2027;assert(!b.personalCardOpen('gastosRecurrentes',item,0));
a.togglePersonalCards();assert(!a.personalCardsAllOpen());assert(!a.personalHasChanges(),'Plegar no modifica importes');
console.log('Eventos por fecha, filtros P/Q, ficha con símbolo y partidas personales plegables: OK');
