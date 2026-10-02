'use strict';
const assert=require('assert');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);
const tariff=a.energyTariffDefaults({precioKwh:.14234,energyMode:'tramos',periodPrices:[.23,.16,.10],periodWeights:[20,30,50],potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:3.3});
const contract={id:'c-test',kind:'luz',supplier:'Empresa de ejemplo',tariff:'Tres tramos',supply:'Vivienda',start:'2025-01-01',end:'2026-12-31',commitment:'',source:'',notes:'',prices:[],taxes:'excluidos',analysis:tariff};
const service={...contract,id:'service-test',supplier:'Servicio de ejemplo',tariff:'Mantenimiento',start:'',end:'',analysis:undefined};
const bill={id:'year-cross',kind:'luz',supplier:'Empresa de ejemplo',number:'TEST',issued:'2026-01-20',start:'2025-12-16',end:'2026-01-15',consumption:310.75,consumptionPeriods:[62.15,93.225,155.375],net:50,gross:60.5,vatAmount:10.5,paid:null,source:'',notes:''};
a.energyImportHistory({energyContracts:[contract,service],energyBills:[bill]});
const y25=a.energyYearIndicators('luz',2025),y26=a.energyYearIndicators('luz',2026),total=a.energyYearIndicators('luz',null);
near(total.kwh,310.75);near(total.kwh,y25.kwh+y26.kwh);assert.equal(total.days,31);assert.equal(total.active,2);
assert.equal(total.vat.value,10.5);assert.equal(total.bills,1);assert.equal(total.services,0);
assert.equal(a.energyNumber(310.75,'kWh'),'311 kWh');assert.equal(a.energyNumber(10.024,'kWh',1),'10 kWh');assert.equal(a.energyNumber(10.16,'kWh',1),'10,2 kWh');
assert.equal(a.energyNumber(31.456,'€'),'31,46 €');
assert.match(a.energySummaryHtml('luz',null),/Histórico completo/);
for(const year of [2024,2025,2026,2027]){a.ENERGY_ANALYSIS_YEAR=year;assert.ok(!a.energyTariffsHtml('luz').includes('Servicio de ejemplo'));}
assert.equal(a.energyContracts().length,2);assert.equal(a.energyBills().length,1);
assert.equal(a.energyContractInYear(contract,2024),false);assert.equal(a.energyContractInYear(contract,2025),true);
const original=JSON.stringify(a.energyContracts()),option=a.energyHistoricalTariffs('luz')[0],copy=a.electricHistoricalCopy(option,{});
copy.periodPrices[0]=9;copy.precioKwh=8;
assert.equal(JSON.stringify(a.energyContracts()),original);assert.equal(copy.useOwnPower,true);
assert.equal(a.energyHistoricalTariffs('luz').length,1);
near(a.energyHistoricalTariffs('luz')[0].tariff.periodPrices[0],.23);
// Los precios no se redondean al formatearlos ni al crear una copia de simulación.
near(a.electricComparisonTariff({precioKwh:.14234,useOwnPower:true},{}).precioKwh,.14234);
assert.equal(a.electricComparisonTariff({},{}).potenciaP1,3.3);
for(const type of Object.keys(a.EV_PLAN_SUBTYPES)){
 const ev={id:'test-plan',kind:'puntual',type,color:'#000000',shape:'cloud'};
 assert.equal(a.getEvDisplayColor(ev),a.evTypeColor('puntual',type));
 assert.equal(a.evDefaultShape(ev),a.EV_PLAN_SUBTYPES[type]);
 assert.equal(a.evFilterGroup(ev),'Resto');assert.ok(!a.EV_FREE_COLOR['puntual|'+type]);
 assert.equal(a.evSuggestedTitle(type),type);
}
assert.match(a.evShapeSvg('cloud'),/path/);assert.match(a.evShapeSvg('beer'),/path/);
console.log('Total multianual, precisión, vigencias, copias de tarifas y nuevos planes OK');
