'use strict';
const assert=require('assert');
const {cargarApp}=require('./entorno');
const a=cargarApp({});
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);
const t=a.energyTariffDefaults({energyMode:'tramos',periodPrices:[0.3,0.2,0.1],periodWeights:[20,30,50],terminoFijo:6});
a.energyValidateTariff(t);near(a.energyWeightedPrice(t),0.17);
near(a._calcGasCost(t,100,30),23);
near(a._calcElectCost(t,{potenciaTotal:3},100,30),23);
near(a._calcGasCost({modo:'fijo',cuotaFija:40},999,15),20);
near(a._calcElectCost({precioKwh:0.2,modoPotencia:'doble',precioPotP1:0.1,precioPotP2:0.02,terminoFijo:6},{potenciaP1:3,potenciaP2:3},100,30),36.8);
assert.throws(()=>a.energyValidateTariff({...t,periodWeights:[20,20,20]}));
assert.throws(()=>a.energyValidateTariff({...t,precioKwh:Infinity}));
assert.throws(()=>a.energyValidateTaxes([null]));
assert.throws(()=>a.energyValidateTaxes([{kind:'gas',start:'2026-02-30',rate:21}]));
const taxes=[{kind:'luz',start:'2026-01-01',rate:0},{kind:'luz',start:'2026-01-16',rate:20}];
assert.equal(a.energyVatAt(taxes,'gas','2026-01-16'),null);
assert.equal(a.energyVatAt(taxes,'luz','2026-01-15'),0);
const bill={id:'b1',kind:'luz',supplier:'Ejemplo',number:'A',issued:'2026-02-05',start:'2026-01-01',end:'2026-01-31',consumption:310,net:31,gross:34.2,paid:20,notes:'',source:''};
const months=a.energyConsumptionMonths([bill],2026,'luz');
near(months[0].consumption,310);assert.equal(months[1].count,0);
const simple=a.energyTariffDefaults({precioKwh:0.1});
near(a.energySimulateMonth(months[0],simple,'luz',taxes,false).gross,34.2);
assert.equal(a.energySimulateMonth(months[0],simple,'luz',[],false).gross,null);
const flat=a.energyTariffDefaults({modo:'fijo',cuotaFija:31,promotion:3.1});
near(a.energySimulateMonth(months[0],flat,'luz',taxes,true).gross,31.1);
const crossed={...bill,start:'2025-12-16',end:'2026-01-15',consumption:310};
near(a.energyConsumptionMonths([crossed],2025,'luz')[11].consumption,160);
near(a.energyConsumptionMonths([crossed],2026,'luz')[0].consumption,150);
const adjacent={...bill,id:'b2',number:'B',start:'2026-01-31',end:'2026-02-28',consumption:290};
const joined=a.energyConsumptionMonths([bill,adjacent],2026,'luz');
assert.equal(joined[0].overlap,false);near(joined[0].consumption+joined[1].consumption,600);
const overlap=a.energyConsumptionMonths([bill,{...adjacent,start:'2026-01-20'}],2026,'luz');
assert.equal(a.energySimulateMonth(overlap[0],simple,'luz',taxes,false),null);
const unknown=a.energyConsumptionMonths([{...bill,consumption:null}],2026,'luz');
assert.equal(a.energySimulateMonth(unknown[0],simple,'luz',taxes,false),null);
const zero=a.energyConsumptionMonths([{...bill,consumption:0}],2026,'luz');
near(a.energySimulateMonth(zero[0],flat,'luz',taxes,false).gross,34.2);
const dst=a.energyConsumptionMonths([{...bill,start:'2026-03-01',end:'2026-03-31'}],2026,'luz');near(dst[2].consumption,310);
a.energySaveTaxes(taxes);const before=a.energyImportHistory({energyTaxes:[{kind:'luz',start:'2026-01-16',rate:10}]});
assert.equal(a.energyTaxes().length,2);assert.equal(a.energyVatAt(a.energyTaxes(),'luz','2026-01-20'),10);
a.energyRestoreHistory(before);assert.equal(a.energyVatAt(a.energyTaxes(),'luz','2026-01-20'),20);
assert.throws(()=>a.energyImportHistory({energyTaxes:[{kind:'gas',start:'x',rate:21}]}));
assert.equal(a.energyTaxes().length,2);
console.log('Energía: compatibilidad, ponderación, cuota fija, prorrateo, IVA y restauración OK');

const uncredited=a.energyConsumptionMonths([{...bill,consumption:0,noReading:true}],2026,'luz');
assert.equal(a.energySimulateMonth(uncredited[0],simple,'luz',taxes,false),null);
assert.equal(a.energyMergeBills([{...bill,noReading:true}],[bill])[0].noReading,true);
a.showToast=()=>{};
a.energySendToScenarios({id:'send-test',kind:'luz',supplier:'Ejemplo',tariff:'Tramos',analysis:t});
a.energySendToScenarios({id:'send-test',kind:'luz',supplier:'Ejemplo',tariff:'Tramos',analysis:t});
assert.equal(a.DESPACHO.electComparaciones.length,1);
near(a.DESPACHO.electComparaciones[0].precioKwh,0.17);
near(a._calcElectCost(a.DESPACHO.electComparaciones[0],{},100,30),23);
console.log('Energía: lectura no acreditada y copia idempotente a escenarios OK');

// Reparto mensual por contrato, con consumo medio diario y escenarios aislados.
const billCost={id:'cost',kind:'luz',supplier:'Prueba',number:'C1',issued:'2026-02-01',start:'2026-01-01',end:'2026-01-31',consumption:310,net:100,gross:121,paid:121,notes:'',source:''};
const ca={id:'a',kind:'luz',supplier:'A',start:'2026-01-01',end:'2026-01-15',analysis:a.energyTariffDefaults({precioKwh:0.1})};
const cb={id:'b',kind:'luz',supplier:'B',start:'2026-01-16',end:'',analysis:a.energyTariffDefaults({precioKwh:0.2})};
const taxCost=[{kind:'luz',start:'2026-01-01',rate:21}];
let cost=a.energyCostMonths([billCost],[ca,cb],taxCost,2026,'luz')[0];
near(cost.gross,47*1.21);assert.equal(cost.groups[0].days,15);assert.equal(cost.groups[1].days,16);near(cost.groups[1].kwh,160);
const scenarioCost={contractId:'b',tariff:a.energyTariffDefaults({precioKwh:0.3}),vatMode:'constant',vat:10};
near(a.energyCostMonths([billCost],[ca,cb],taxCost,2026,'luz',scenarioCost)[0].gross,63*1.1);
assert.equal(a.energyCostMonths([billCost],[ca],taxCost,2026,'luz')[0].gross,null);
assert.equal(a.energyCostMonths([billCost],[ca,cb],[],2026,'luz')[0].gross,null);
assert.equal(a.energyCostMonths([billCost],[ca,{...cb,start:'2026-01-10'}],taxCost,2026,'luz')[0].gross,null);
near(a.energyCostMonths([billCost],[{...ca,end:'2026-01-16'},cb],taxCost,2026,'luz')[0].gross,47*1.21);
const staged={...ca,end:'2026-01-31',analysisPeriods:[{start:'2026-01-01',tariff:ca.analysis},{start:'2026-01-16',tariff:cb.analysis}]};
near(a.energyCostMonths([billCost],[staged],taxCost,2026,'luz')[0].gross,47*1.21);
near(a.energyCostMonths([billCost],[ca,cb],taxCost,2026,'luz',{...scenarioCost,start:'2026-01-20',end:'2026-01-21'})[0].gross,49*1.1);
assert.equal(a.energyCostMonths([billCost],[ca,cb],taxCost,2026,'luz')[1].gross,null);
assert.ok(!a.energyTariffsHtml('luz').includes('data-analysis-contract'));
assert.ok(!a.energyArchiveHtml('luz').includes('energyBillAdd'));
console.log('Energía: vigencias, barras por compañía, huecos, solapamientos, IVA y sustitución parcial OK');

const historyCost={...ca,tariff:'Prueba',supply:'',commitment:'',taxes:'excluidos',notes:'',source:'',prices:[],analysisPeriods:staged.analysisPeriods};
a.validateImport({energyContracts:[historyCost]});
assert.throws(()=>a.validateImport({energyContracts:[{...historyCost,analysisPeriods:[...staged.analysisPeriods,staged.analysisPeriods[0]]}]}));
a.energyImportHistory({energyContracts:[historyCost]});
assert.equal(a.energyContracts().find(c=>c.id==='a').analysisPeriods.length,2);
const beforePeriods=a.energyImportHistory({energyContracts:[{...historyCost,analysisPeriods:[]}]});
a.energyRestoreHistory(beforePeriods);assert.equal(a.energyContracts().find(c=>c.id==='a').analysisPeriods.length,2);
console.log('Energía: períodos importables, validación y deshacer OK');

const serviceBill={...billCost,id:'service',number:'S1',start:'2026-01-15',end:'2026-01-15',consumption:null,serviceOnly:true,gross:5};
near(a.energyCostMonths([billCost,serviceBill],[ca,cb],taxCost,2026,'luz')[0].gross,47*1.21);
assert.throws(()=>a.validateEnergyBills([{...serviceBill,serviceOnly:'sí'}]));

// Rectificaciones: conservar importes, sustituir lecturas; desglose real por tramos.
const superseded={...billCost,readings:[]};
const corrected={...billCost,id:'corrected',number:'C2',start:'2026-02-01',end:'2026-02-02',vatAmount:5,electricityTaxAmount:1,otherTaxesAmount:0,readings:[{start:'2026-01-01',end:'2026-01-31',consumption:310,periods:[31,62,217]}]};
a.validateEnergyBills([superseded,corrected]);
const correctedMonths=a.energyConsumptionMonths([superseded,corrected],2026,'luz');
near(correctedMonths[0].consumption,310);assert.equal(correctedMonths[0].overlap,false);
assert.equal(correctedMonths[0].periodDays,31);near(correctedMonths[0].periods[2],217);
const tramosContract={...ca,end:'2026-01-31',analysis:t};
near(a.energyCostMonths([superseded,corrected],[tramosContract],taxCost,2026,'luz')[0].gross,(310*.14+6)*1.21);
near(a.energyCostMonths([corrected],[tramosContract],[],2026,'luz',{vatMode:'none'})[0].gross,310*.14+6);
assert.equal(a.energyCostMonths([corrected],[tramosContract],taxes,2026,'luz')[0].vatBands.length,2);
assert.throws(()=>a.validateEnergyBills([{...corrected,readings:[{start:'2026-01-01',end:'2026-01-31',consumption:-1}]}]));
assert.throws(()=>a.validateEnergyBills([{...corrected,vatAmount:Infinity}]));
const roundtrip=cargarApp({});
roundtrip.energyImportHistory({energyBills:[corrected]});
assert.equal(roundtrip.energyBills()[0].readings[0].periods[1],62);
near(roundtrip.energyYearIndicators('luz',2026).vat.value,5);
assert.equal(roundtrip.energyYearIndicators('luz',2025).vat.value,null);
roundtrip.ENERGY_ANALYSIS_TAB='resumen';
const study=roundtrip.energyAnalysisHtml('luz');
assert.equal((study.match(/data-energy-tab=/g)||[]).length,5);
assert.ok(study.indexOf('energy-year-nav')>study.indexOf('data-energy-tab="comparar"'));
assert.equal((roundtrip._renderElectDetalle().match(/Consumo y tarifas/g)||[]).length,1);
assert.ok(!roundtrip._renderElectDetalle().includes('energyLegacyluz'));
console.log('Energía: lecturas rectificadas, tramos medidos, impuestos documentados y cinco pestañas OK');

// Los servicios/alquiler no pagan impuesto eléctrico. Los backups antiguos siguen válidos.
const fees=a.energyTariffDefaults({precioKwh:0.2,terminoFijoDia:0.01,extrasPerDay:0.03,otherTaxPct:5});
near(a.energyTariffNet(fees,'luz',100,30,30),(20+0.3)*1.05+0.9);
assert.throws(()=>a.energyValidateTariff({...fees,extrasPerDay:-1}));
const commercial={...historyCost,end:'2026-12-31',analysisPeriods:[
  {start:'2026-01-01',tariff:t},
  {start:'2026-02-01',tariff:{...t,periodWeights:[10,20,70],otherTaxPct:5,extrasPerDay:0.02}},
  {start:'2026-04-01',tariff:{...t,periodPrices:[0.4,0.2,0.1]}}
]};
const original=JSON.stringify(commercial),groups=a.energyCommercialPeriods(commercial);
assert.equal(groups.length,2);assert.equal(groups[0].start,'2026-01-01');assert.equal(groups[0].end,'2026-03-31');assert.equal(groups[0].variants.length,2);
assert.equal(JSON.stringify(commercial),original);
// La franja no repite el IVA al cambiar de mes; sí separa cambios o huecos de cobertura.
const bands=Array.from({length:12},(_,i)=>({vatBands:i<3?[{start:`2026-0${i+1}-01`,end:['2026-01-31','2026-02-28','2026-03-31'][i],rate:i<2?21:10}]:[]}));
const vatHtml=a.energyVatStrip(bands,2026);assert.equal((vatHtml.match(/<span /g)||[]).length,2);assert(vatHtml.includes('width:16.666666666666'));
const previewApp=cargarApp({});previewApp.energyImportHistory({energyBills:[bill],energyContracts:[commercial]});
const stateBefore=JSON.stringify([previewApp.energyBills(),previewApp.energyContracts(),previewApp.energyTaxes()]);
const preview=previewApp.energyImportPreview({energyBills:[{...bill,gross:99}],energyContracts:[{...commercial,notes:'Desglose corregido'}],days:{'2027-01-01':{type:'festivo'}}});
assert(preview.includes('0 nuevos · 1 actualizados'));assert(preview.includes('2 tarifas'));assert(preview.includes('Aquí solo se importará energía'));
assert.equal(JSON.stringify([previewApp.energyBills(),previewApp.energyContracts(),previewApp.energyTaxes()]),stateBefore);
assert.throws(()=>previewApp.energyImportPreview({energyBills:[{...bill,gross:Infinity}]}));
const change=previewApp.energyImportChanges([bill],[{...bill,notes:'<script>'}],x=>x.id,x=>x.notes);assert.equal(change.updated.length,1);
console.log('Energía: cargos separados, tarifas comerciales agrupadas, IVA continuo y previsualización sin escritura OK');
const serviceTariff=a.energyTariffDefaults({precioKwh:.2,servicesPerDay:.1,servicesVatPct:21});
near(a.energyTariffNet(serviceTariff,'luz',100,30,30),23);
near(a.energyTariffGross(serviceTariff,'luz',100,30,30,10),22+3.63);
const serviceContract={...ca,end:'2026-01-31',analysis:serviceTariff};
near(a.energyCostMonths([billCost],[serviceContract],[{kind:'luz',start:'2026-01-01',rate:10}],2026,'luz')[0].gross,62*1.1);
near(a.energyCostMonths([billCost],[serviceContract],taxCost,2026,'luz',{vatMode:'none'})[0].gross,62);
near(a.energyCostMonths([billCost],[serviceContract],taxCost,2026,'luz',{vatMode:'constant',vat:5})[0].gross,62*1.05);
assert.throws(()=>a.energyValidateTariff({...serviceTariff,servicesVatPct:101}));
console.log('Energía: servicios conservados en tarifas, excluidos del coste del suministro OK');

// Un abono de otro año y los servicios no falsean la comparación del consumo.
const clean={...billCost,id:'clean',gross:80,servicesGross:10};
const oldCredit={...clean,id:'credit',number:'old-credit',start:'2025-01-01',end:'2025-01-31',issued:'2026-01-20',gross:-100,servicesGross:0,readings:[]};
const reconMonths=a.energyCostMonths([clean,oldCredit],[serviceContract],taxCost,2026,'luz');
const rec=a.energyReconcile([clean,oldCredit],reconMonths,2026,'luz');
near(rec.actual,70);near(rec.services,10);near(rec.issuedSupply,-30);assert.equal(rec.days,31);
const svcCredit={...clean,servicesGross:-16.42,gross:50.13};a.validateEnergyBills([svcCredit]);near(a.energyBillSupply(svcCredit),66.55);
const flatBill={...billCost,kind:'gas',consumption:null,noReading:true,readings:[]};
const flatContract={...ca,kind:'gas',end:'2026-01-31',analysis:a.energyTariffDefaults({modo:'fijo',cuotaFija:55})};
const flatMonths=a.energyCostMonths([flatBill],[flatContract],[{kind:'gas',start:'2026-01-01',rate:21}],2026,'gas');
near(flatMonths[0].gross,66.55);assert.equal(Object.keys(flatMonths[0].source.samples).length,0);
assert.equal(a.energyCostMonths([flatBill],[flatContract],[{kind:'gas',start:'2026-01-01',rate:21}],2026,'gas',{tariff:a.energyTariffDefaults({precioKwh:.1})})[0].gross,null);
const currentApp=cargarApp({});currentApp.DESPACHO.personalSentinel='conservar';
const currentData={energyContracts:[{tariff:'Tarifa de prueba',supply:'Vivienda',commitment:'',notes:'',source:'',prices:[],taxes:'excluidos',...serviceContract}],energyTaxes:taxCost,energyCurrentTariffs:[{kind:'luz',contractId:serviceContract.id,date:'2026-01-01'}]};
assert(currentApp.renderImportPreview(currentData).includes('Sustituye la tarifa actual'));
const oldConfig=JSON.stringify(currentApp.DESPACHO),restore=currentApp.energyImportHistory(currentData);
assert.equal(currentApp.DESPACHO.elect.energyContractId,serviceContract.id);assert.equal(currentApp.DESPACHO.personalSentinel,'conservar');
currentApp.energyRestoreHistory(restore);assert.equal(JSON.stringify(currentApp.DESPACHO),oldConfig);
assert.throws(()=>currentApp.validateImport({...currentData,energyCurrentTariffs:[{kind:'luz',contractId:'inexistente',date:'2026-01-01'}]}));
console.log('Energía: conciliación por consumo, servicios y abonos, cuota sin lectura, tarifa actual selectiva y deshacer OK');
// Importar desde Inicio no debe reemplazar los ajustes fiscales aún sin cargar.
const storedConfig={m2Total:84,m2Despacho:9,compra:{entidadBanco:'Banco de prueba'},elect:{comercializadora:'Anterior',custom:'conservar'},gas:{activo:'fijo',fijo:{cuotaFija:42}},futureSetting:{keep:true}};
const cold=cargarApp({});cold.appStorage.setItem(cold.DESPACHO_SK,JSON.stringify(storedConfig));
const coldUndo=cold.energyImportHistory(currentData);
assert.equal(cold.DESPACHO.m2Total,84);assert.equal(cold.DESPACHO.compra.entidadBanco,'Banco de prueba');
assert.equal(cold.DESPACHO.gas.fijo.cuotaFija,42);assert.equal(cold.DESPACHO.futureSetting.keep,true);assert.equal(cold.DESPACHO.elect.custom,'conservar');
cold.energyRestoreHistory(coldUndo);assert.equal(cold.appStorage.getItem(cold.DESPACHO_SK),JSON.stringify(storedConfig));
// Un contrato importado antes desde otro dispositivo conserva su id local.
cold.energySaveContracts([{...currentData.energyContracts[0],id:'local-contract'}]);
cold.energyImportHistory(currentData);assert.equal(cold.DESPACHO.elect.energyContractId,'local-contract');assert.equal(cold.energyContracts().length,1);
assert(!cold.energyConsumptionHtml('gas',cold.energyConsumptionMonths([],2026,'gas'),2026).includes('<th>Punta</th>'));
const gasCurrent={...currentData.energyContracts[0],id:'current-gas',kind:'gas',analysis:a.energyTariffDefaults({modo:'fijo',cuotaFija:40})};
cold.energyImportHistory({energyContracts:[gasCurrent],energyTaxes:[{kind:'gas',start:'2026-01-01',rate:10}],energyCurrentTariffs:[{kind:'gas',contractId:'current-gas',date:'2026-01-01'}]});
assert.equal(cold.DESPACHO.gas.activo,'fijo');assert.equal(cold.DESPACHO.gas.ivaGas,10);assert.equal(cold.DESPACHO.elect.energyContractId,'local-contract');
console.log('Energía: configuración fiscal sin abrir, deshacer exacto e identidad entre dispositivos OK');
