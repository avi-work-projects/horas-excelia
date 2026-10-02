'use strict';
const assert=require('assert');
const {cargarApp}=require('./entorno');
const {fixture}=require('./benchmark-energy');
const app=cargarApp({});fixture(app);
const scoped=app.withEnergyData;
// La optimización no cambia ni un carácter, incluidos los escenarios fiscales,
// años sin lecturas y el total multianual. La referencia calcula sin caché.
for(const kind of ['luz','gas'])for(const year of [2016,2025,2026]){
  app.ENERGY_ANALYSIS_YEAR=year;
  for(const tab of ['resumen','consumo','costes','tarifas','comparar']){
    app.ENERGY_ANALYSIS_TAB=tab;
    for(const vat of tab==='costes'?['historical','none','constant']:['historical']){
      app.ENERGY_COST_VAT=vat;
      app.withEnergyData=render=>render();const reference=app.energyAnalysisHtml(kind);
      app.withEnergyData=scoped;assert.equal(app.energyAnalysisHtml(kind),reference,`${kind}/${year}/${tab}/${vat}`);
      assert.equal(app.ENERGY_RENDER_CONTEXT,null);
    }
  }
}
app.ENERGY_ANALYSIS_TAB='resumen';app.ENERGY_SUMMARY_TOTAL=true;
app.withEnergyData=render=>render();const total=app.energyAnalysisHtml('luz');
app.withEnergyData=scoped;assert.equal(app.energyAnalysisHtml('luz'),total);
// Una importación, su Deshacer y un cambio externo se ven en el siguiente render.
const original=app.energyBills(),changed=JSON.parse(JSON.stringify(original));
changed[0].consumption*=2;changed[0].consumptionPeriods=changed[0].consumptionPeriods.map(n=>n*2);
const before=app.energyImportHistory({energyBills:changed});
assert.notEqual(app.energyAnalysisHtml('luz'),total);
app.energyRestoreHistory(before);assert.equal(app.energyAnalysisHtml('luz'),total);
app.appStorage.setItem(app.ENERGY_BILLS_KEY,JSON.stringify(changed));
assert.notEqual(app.energyAnalysisHtml('luz'),total);
app.appStorage.setItem(app.ENERGY_BILLS_KEY,'not json');
assert.throws(()=>app.energyAnalysisHtml('luz'));
assert.equal(app.ENERGY_RENDER_CONTEXT,null);
app.energySaveBills(original);assert.equal(app.energyAnalysisHtml('luz'),total);
// Un fallo de cálculo o un render anidado tampoco deja caché viva.
assert.throws(()=>app.withEnergyData(()=>{app.energyBills();throw new Error('fallo de prueba');}));
assert.equal(app.ENERGY_RENDER_CONTEXT,null);
let reads=0;const read=app.appStorage.getItem;
app.appStorage.getItem=function(key){if(key===app.ENERGY_BILLS_KEY)reads++;return read.call(this,key);};
app.withEnergyData(()=>{app.energyBills();app.withEnergyData(()=>app.energyBills());});
assert.equal(reads,1);app.energyBills();assert.equal(reads,2);
app.appStorage.getItem=read;
console.log('Energía: salida idéntica, contexto acotado y datos frescos tras importar/deshacer/error OK');
