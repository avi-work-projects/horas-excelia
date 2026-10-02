'use strict';
// Datos ficticios: mismo histórico para comparar rendimiento y salida entre revisiones.
const {cargarApp}=require('./entorno');
const {performance}=require('perf_hooks');
const crypto=require('crypto');
function fixture(app){
  const bills=[],contracts=[],taxes=[];
  for(const kind of ['luz','gas']){
    contracts.push({id:'bench-'+kind,kind,supplier:'Compañía de prueba',tariff:'Tarifa de prueba',supply:'Vivienda',start:'2017-01-01',end:'',commitment:'',source:'',notes:'',prices:[],taxes:'excluidos',analysis:app.energyTariffDefaults({precioKwh:.14234,energyMode:'tramos',periodPrices:[.23,.16,.1],periodWeights:[20,30,50],otherTaxPct:5.11269632})});
    taxes.push({kind,start:'2017-01-01',rate:21});
    for(let year=2017;year<=2026;year++)for(let month=1;month<=12;month++){
      const ym=year+'-'+String(month).padStart(2,'0'),end=new Date(Date.UTC(year,month,0)).getUTCDate();
      bills.push({id:'bench-'+kind+'-'+ym,kind,supplier:'Compañía de prueba',number:kind+'-'+ym,issued:ym+'-'+end,start:ym+'-01',end:ym+'-'+end,consumption:210+month,consumptionPeriods:[(210+month)*.2,(210+month)*.3,(210+month)*.5],net:50,gross:60.5,vatAmount:10.5,paid:null,source:'',notes:''});
    }
  }
  app.energySaveBills(bills);app.energySaveContracts(contracts);app.energySaveTaxes(taxes);app.ENERGY_ANALYSIS_YEAR=2026;
}
function run(){
  const app=cargarApp({});fixture(app);const rows=[];
  for(const tab of ['resumen','consumo','costes','tarifas','comparar']){
    app.ENERGY_ANALYSIS_TAB=tab;
    for(let i=0;i<2;i++)app.energyAnalysisHtml('luz');
    let reads=0,validations=0;
    const read=app.appStorage.getItem,validate=app.validateEnergyBills;
    app.appStorage.getItem=function(k){if(k===app.ENERGY_BILLS_KEY)reads++;return read.call(this,k);};
    app.validateEnergyBills=function(list){validations++;return validate(list);};
    const times=[];let html;
    for(let i=0;i<8;i++){const start=performance.now();html=app.energyAnalysisHtml('luz');times.push(performance.now()-start);}
    app.appStorage.getItem=read;app.validateEnergyBills=validate;
    times.sort((a,b)=>a-b);
    rows.push({tab,medianMs:+((times[3]+times[4])/2).toFixed(2),billReads:reads/8,billValidations:validations/8,htmlHash:crypto.createHash('sha256').update(html).digest('hex')});
  }
  return rows;
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={fixture,run};
