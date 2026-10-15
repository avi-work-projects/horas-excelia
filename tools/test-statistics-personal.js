'use strict';
const assert=require('node:assert');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
const now=new Date('2026-10-11T12:00:00');
function event(id,type,start,end,extra={}){return {id,type,kind:['Viaje','Asturias','Casa Rural'].includes(type)?'grande':'puntual',start,end:end||start,color:'#328a70',...extra};}
const events=[event('trip','Viaje','2026-09-01','2026-09-03'),event('ast','Asturias','2026-09-03','2026-09-05'),event('rural','Casa Rural','2026-09-05','2026-09-06'),event('ongoing','Viaje','2026-10-10','2026-10-13'),event('future','Viaje','2026-10-20','2026-10-22'),event('meal','Comida','2026-10-01','2026-10-02',{dates:['2026-10-01','2026-10-02','2026-10-02']}),event('dinner','Cena','2026-10-02'),event('call','Llamada','2026-10-01',null,{repeat:{type:'weekly',weekDays:[1]}}),event('ev-bday-vip-demo','Otros','2026-10-01')];
const original=JSON.stringify(events),past=a.computeEventStatistics(events,2026,'past',now),future=a.computeEventStatistics(events,2026,'future',now),both=a.computeEventStatistics(events,2026,'all',now);
assert.equal(past.trips,2);assert.equal(past.asturias,1);assert.equal(past.rural,1);assert.equal(past.travelDays,8);assert.equal(past.plansDays,2);assert.equal(past.groups.plans.count,3);assert.equal(past.groups.plans.days,2);assert.equal(past.ruralDays,2);
assert.equal(future.trips,2);assert.equal(future.travelDays,5);assert.equal(both.trips,3);assert.equal(both.travelDays,13);assert.equal(both.rows.some(r=>r.type==='Otros'),false);assert.equal(JSON.stringify(events),original);
const crossing=[event('cross','Viaje','2025-12-30','2026-01-02')];assert.equal(a.computeEventStatistics(crossing,2026,'past',now).travelDays,2);assert.equal(a.computeEventStatistics(crossing,'all','past',now).travelDays,4);
const leap=[event('leap','Cita','2024-02-29',null,{repeat:{type:'yearly'}})];assert.equal(a.computeEventStatistics(leap,2026,'all',now).rows[0].count,1);
assert.equal(a.computeEventStatistics([],2026,'all',now).totalDays,0);
let selected=a.evToggleListFilter([],'puntual|Médico');selected=a.evToggleListFilter(selected,'puntual|Llamada');assert.equal(selected.length,2);selected=a.evToggleListFilter(selected,'puntual|Cena');assert.equal(selected.join(), 'puntual|Cena');selected=a.evToggleListFilter(selected,'group:management');selected=a.evToggleListFilter(selected,'group:plans');assert.equal(selected.length,2);assert(a.evListFilterMatches(event('x','Comida','2026-01-01'),selected));assert(!a.evListFilterMatches(event('x','Otros','2026-01-01'),selected));selected=a.evToggleListFilter(selected,'puntual|Cita');assert.equal(selected.join(),'puntual|Cita');assert.equal(a.evToggleListFilter(selected,'all').length,0);
const old={name:'Prueba',email:'one@example.invalid',address:'Calle Ejemplo',postal:'00000',city:'Localidad',iban:'IBAN de prueba'};
const normalized=a.normalizeContactData(old);assert.equal(normalized.emails[0].value,old.email);assert.equal(normalized.addresses[0].postal,'00000');assert.equal(normalized.addresses[0].city,'Localidad');assert.equal(normalized.banks[0].iban,old.iban);
assert.throws(()=>a.validateContactData({emails:Array(9).fill({value:'demo'})}));assert.throws(()=>a.validateContactData({banks:[{iban:12}]}));assert.throws(()=>a.validateImport({personalNotes:12}));
const rich={...old,passport:'PASAPORTE DE PRUEBA',emails:Array.from({length:8},(_,i)=>({value:i+'@example.invalid'})),addresses:Array.from({length:8},(_,i)=>({label:'Casa '+i,address:'Dirección '+i,postal:'0000'+i,city:'Lugar '+i})),banks:[{label:'Cuenta Uno',iban:'CUENTA UNO'},{label:'Cuenta Dos',iban:'CUENTA DOS'}],cards:[{label:'Tarjeta de Prueba',number:'NUMERO SINTETICO'}]};
require('node:vm').runInContext(require('node:fs').readFileSync('js/import-export.js','utf8'),a);
a.showToast=()=>{};a.render=()=>{};
a.applyFullImport({contactData:rich,personalNotes:'Nota sintética\nSegunda línea'},'replace');assert.equal(a.contactData().emails.length,8);assert.equal(a.contactData().addresses[7].city,'Lugar 7');assert.equal(a.contactData().banks[1].label,'Cuenta Dos');assert.equal(a.personalNote(),'Nota sintética\nSegunda línea');
const merged=a.mergeContactData(normalized,{emails:[{value:'two@example.invalid'}]});assert.equal(merged.emails.length,2);assert.equal(a.mergeContactData(merged,{email:'two@example.invalid'}).emails.length,2);assert.throws(()=>a.mergeContactData(rich,{emails:[{value:'nine@example.invalid'}]}));
const beforeMerge=JSON.stringify(a.contactData());a.applyFullImport({personalNotes:'No debe guardarse',contactData:{emails:[{value:'extra@example.invalid'}]}},'merge');assert.equal(JSON.stringify(a.contactData()),beforeMerge);assert.equal(a.personalNote(),'Nota sintética\nSegunda línea');
console.log('Estadísticas, intervalos, días únicos, filtros compatibles, datos agrupados y notas: OK');

a.applyFullImport({hairdresserNotes:'Laterales cortos\nArriba: <tijera>'},'replace');
assert.equal(a.hairdresserNote(),'Laterales cortos\nArriba: <tijera>');
a.applyFullImport({personalNotes:'General independiente'},'replace');
assert.equal(a.hairdresserNote(),'Laterales cortos\nArriba: <tijera>');
assert.throws(()=>a.validateImport({hairdresserNotes:12}));
assert.throws(()=>a.validateImport({hairdresserNotes:'x'.repeat(50001)}));
const haircut=event('haircut','Peluquería','2026-10-20',null,{title:'Corte',note:'Nota de esta cita'});
const haircutBefore=JSON.stringify(haircut),haircutHtml=a.renderEvDetail(haircut);
assert(haircutHtml.includes('Laterales cortos\nArriba: &lt;tijera&gt;'));
assert(haircutHtml.includes('Nota de esta cita'));assert.equal(JSON.stringify(haircut),haircutBefore);
assert(!a.renderEvDetail({...haircut,type:'Dentista'}).includes('ev-hairdresser-note'));
a.applyFullImport({hairdresserNotes:''},'merge');assert(!a.renderEvDetail(haircut).includes('ev-hairdresser-note'));
console.log('Peluquería: notas vinculadas, escape de texto, backup compatible y borrado OK');

const principal=a.normalizeContactData({banks:[{label:"Uno",iban:"UNO",primary:"1"},{label:"Dos",iban:"DOS",primary:"1"}],addresses:[{primary:"1"}]});assert.equal(principal.addresses.length,0);assert.equal(principal.banks.filter(r=>r.primary==="1").length,1);assert.equal(a.mergeContactData(principal,{banks:[{label:"Uno actualizado",iban:"UNO"}]}).banks[0].primary,"1");const changed=a.mergeContactData(principal,{banks:[{label:"Dos",iban:"DOS",primary:"1"}]});assert.equal(changed.banks[1].primary,"1");assert(!changed.banks[0].primary);


assert.equal(a.EV_STATS_YEAR,new a.Date().getFullYear());

// Todos: el año se aplica a ocurrencias, incluyendo cruces y fechas no consecutivas.
const listApp=cargarApp({});listApp.EV_TYPES_PAST=false;listApp.EV_LIST_YEAR=2026;
assert(listApp.evListInYear(crossing[0]));assert(listApp.evListInYear(leap[0]));
assert(!listApp.evListInYear(event('old','Cena','2025-01-01')));
assert(!listApp.evListInYear(event('future-repeat','Cita','2027-01-01',null,{repeat:{type:'weekly',weekDays:[1]}})));
assert(listApp.evListInYear(event('split','Cita','2025-01-01',null,{dates:['2025-01-01','2026-12-31']})));
assert(!listApp.evListInYear(event('gap','Cita','2025-12-31','2027-01-01',{dates:['2025-12-31','2027-01-01']})));
listApp.EV_TYPES_PAST=true;assert(!listApp.evListInYear(crossing[0]));
listApp.EV_LIST_YEAR=2025;assert(!listApp.evListInYear(events[7]));
listApp.EV_LIST_YEAR='all';listApp.EV_TYPES_PAST=false;assert(listApp.evListInYear(event('old','Cena','2025-01-01')));
console.log('Todos: año actual, Total, cruces, repeticiones y fechas discontinuas OK');
