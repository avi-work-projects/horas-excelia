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
// Introducir precios finales o netos debe dar exactamente la misma factura.
const taxes={vat:21,other:5.11},grossTariff=a.energyTariffDefaults({priceInputMode:'gross',precioKwh:.1,precioPotP1:.08,precioPotP2:.02,otherTaxKwh:.002});
near(a.electricInputValue(grossTariff,'precioKwh',.1,taxes,false),(.1*1.0511+.002)*1.21);
for(const key of ['precioKwh','price0','price1','price2','precioPotP1','precioPotP2','terminoFijo','fixedDay','cuotaFija']){
 const net=.078456789,gross=a.electricInputValue(grossTariff,key,net,taxes,false);
 near(a.electricInputValue(grossTariff,key,gross,taxes,true),net);
}
near(a.electricInputValue(grossTariff,'precioPotP1',.08,{vat:0,other:0},false),.08);
const old=a.energyTariffDefaults({precioKwh:.1,terminoFijoDia:.15,extrasPerDay:.03,otherTaxPct:5.11});
const combined={...old,terminoFijoDia:a.electricFixedDay(old,taxes),extrasPerDay:0};
near(a.energyTariffGross(old,'luz',200,30,30,21),a.energyTariffGross(combined,'luz',200,30,30,21));
const before=JSON.stringify(grossTariff);a.electricTariffFieldsHtml(grossTariff,taxes);assert.equal(JSON.stringify(grossTariff),before);
const usage=a.electricUsageYears('luz');assert.deepEqual(Array.from(usage,x=>x.year),[2026,2025]);
near(usage[0].monthly,310.75/31*30);assert.equal(usage[0].days,15);
assert.equal(a.electricInitialScenarios()[0].consumoKwh,Math.round(310.75/31*30));
assert.equal(a.electricUsageYear('luz',2024).monthly,null);
assert.equal(a.electricWeightWarning(tariff),'');
assert.match(a.electricWeightWarning({...tariff,periodWeights:[10,30,50]}),/90 %/);
assert.match(a.electricWeightWarning({...tariff,periodWeights:[NaN,30,50]}),/Completa/);
a.loadDespacho();a.DESPACHO.elect={otherTaxPct:5.11269632,ivaElect:21};
assert.match(a.electricConsumptionScenariosHtml(a.electricComparisonTaxes()),/id="estElectTax"[^>]*value="5.1"/);
near(a.electricComparisonTaxes().other,5.11269632);
const pairs=a.householdUtilityPrices('luz',{...grossTariff,otherTaxPct:5.11},21,false,true);
assert(pairs.includes('con impuestos')&&pairs.includes('sin impuestos'));
assert.equal((pairs.match(/class="energy-price-pair"/g)||[]).length,2);
for(const type of Object.keys(a.EV_PLAN_SUBTYPES)){
 const ev={id:'test-plan',kind:'puntual',type,color:'#000000',shape:'cloud'};
 assert.equal(a.getEvDisplayColor(ev),a.evTypeColor('puntual',type));
 assert.equal(a.evDefaultShape(ev),a.EV_PLAN_SUBTYPES[type]);
 assert.equal(a.evFilterGroup(ev),'Plan/Quedada');assert.ok(!a.EV_FREE_COLOR['puntual|'+type]);
 assert.equal(a.evSuggestedTitle(type),type);
}
assert.match(a.evShapeSvg('cloud'),/path/);assert.match(a.evShapeSvg('beer'),/path/);
console.log('Total multianual, precisión, vigencias, copias de tarifas y nuevos planes OK');
