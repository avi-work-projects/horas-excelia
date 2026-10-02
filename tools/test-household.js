'use strict';
const assert=require('assert');
const {cargarApp}=require('./entorno');
const a=cargarApp({});a.loadDespacho();
// Presentación abreviada sin alterar la tarifa ni alimentar cálculos redondeados.
[[.078456,'0,078'],[.1249,'0,12'],[.196,'0,20'],[.1,'0,10'],[1.345,'1,3'],[0,'0'],[null,'—']].forEach(([n,s])=>assert.equal(a.energyUnitPrice(n),s));
const t=a.energyTariffDefaults({precioKwh:.1249,precioPotP1:.078456,potenciaTotal:3.3,modoPotencia:'simple'}),saved=JSON.stringify(t);
a.energyUnitPrice(t.precioKwh);a.energyUnitPrice(t.precioPotP1);
assert.equal(JSON.stringify(t),saved);
assert(Math.abs(a.energyTariffBase(t,'luz',300,30,30)-(300*.1249+30*3.3*.078456))<1e-9);
// La nueva ficha comparte exactamente los datos de la consulta fiscal.
a.DESPACHO.elect={...t,comercializadora:'Suministro de prueba',ivaElect:21};
a.DESPACHO.gas={modo:'fijo',cuotaFija:30,comercializadora:'Gas de prueba',ivaGas:21};
assert(a.householdUtilityCard('gas',false).includes('30,00'));
const comp=a._defaultCompra();Object.assign(comp,{importePrestamo:120000,tipoInteres:3,plazoAnios:20,fechaInicio:'2024-01-01',entidadBanco:'Banco de prueba'});
comp.vinculaciones.segHogar={enabled:true,costeAnual:420,reduccion:.2};a.DESPACHO.segurosNormales={segHogar:180};a.DESPACHO.compra=comp;
const p=a.householdMortgagePeriod(comp,-1,new Date('2026-08-21T12:00:00'));
assert.equal(p.extra,240);assert.equal(p.paid,31);assert.equal(p.effective,2.8);
assert(Math.abs(a.householdMortgagePayment(p.capital,p.equivalentRate,240)-(p.payment+20))<1e-8);
assert.equal(a.householdMortgagePayment(120000,0,240),500);
a.FISCAL_TAB='despacho';
for(const tab of ['resumen','detalle','gas','elect']){
 a.FISCAL_HIP_SUB=tab;a.FISCAL_HIP_EDITING='prestamo';a.FISCAL_ELECT_EDITING=true;a.FISCAL_GAS_EDITING='consumo';
 const fiscal=a.renderFiscalContent();
 assert(fiscal.includes('id="householdDetailLink"'),tab);
 assert(!/id="fiscalSave"|data-editsection=|data-gasedit=|id="electEditBtn"|energy-analysis-open/.test(fiscal),tab);
 assert.equal((fiscal.match(/<input/g)||[]).length,tab==='detalle'?3:0,tab);
 if(tab==='detalle')assert(fiscal.indexOf('Precios referencia seguros')<fiscal.indexOf('id="hip-section-prestamo"'));
}
assert(!a._renderHipDetalle(true).includes('Precios referencia seguros'),'Las referencias se editan solo en Fiscal');
a.FISCAL_HIP_EDITING=null;a.FISCAL_ELECT_EDITING=false;a.FISCAL_GAS_EDITING=null;
a.FISCAL_HIP_SUB='elect';const household=a.renderHouseholdContent();
assert(household.includes('id="electEditBtn"'));assert(household.includes('energy-analysis-open'));assert(!household.includes('fiscalTabPersonal'));
const sub=a._defaultSubrogacion();Object.assign(sub,{fecha:'2026-01-01',nuevoImporte:110000,nuevoTipoInteres:2,nuevoPlazoAnios:18,entidadBanco:'Banco nuevo'});comp.subrogaciones.push(sub);
assert.equal(a.householdMortgagePeriod(comp,-1,new Date('2026-08-21')).end,'2026-01-01');
const summary=a.renderHouseholdSummary(true);assert(summary.indexOf('Banco nuevo')<summary.indexOf('Banco de prueba'));assert(summary.includes('<details class="household-history">'));
a.DESPACHO.compra=a._defaultCompra();assert(a.renderHouseholdSummary(false).includes('Suministro de prueba'),'Los suministros siguen visibles sin hipoteca');
console.log('Hogar: consulta sin edición, ventana propia, resumen y precisión íntegra OK');
