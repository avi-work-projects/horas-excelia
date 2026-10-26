// Solo datos inventados. Los perfiles reales de Gestify nunca se leen desde aquí.
module.exports=function visualFixture(){
  const f=structuredClone(require('../fixture.json'));
  f['excelia-events-v1'].push(
    {id:'map-started',kind:'puntual',type:'Otros',title:'Cita ya iniciada',start:'2026-08-21',end:'2026-08-21',time:'08:00',endTime:'09:00',color:'#537b78'},
    {id:'map-demo',kind:'puntual',type:'Otros',title:'Café de ejemplo',note:'Datos ficticios para revisar la interfaz.',start:'2026-08-21',end:'2026-08-21',color:'#537b78',time:'18:30',endTime:'19:30',shape:'circle'},
    {id:'map-trip',kind:'grande',type:'Viaje',title:'Viaje de ejemplo',start:'2026-08-24',end:'2026-08-28',color:'#5b7db5',note:'Estancia de ejemplo. Las horas de transporte son salidas.',viaje:{ida:{time:'15:00',modo:'coche',conductor:'Conductor de ejemplo'},vuelta:{time:'10:00',modo:'tren'}}},
    {id:'map-week-label',kind:'grande',type:'Asturias',title:'Asturias',start:'2026-09-06',end:'2026-09-12',color:'#1d4ed8',note:'Ejemplo ficticio de corte semanal.',viaje:{ida:{time:'15:00'},vuelta:{time:'18:00'}}},
    {id:'map-month-label',kind:'grande',type:'Asturias',title:'Asturias',start:'2026-09-30',end:'2026-10-04',color:'#1d4ed8',note:'Ejemplo ficticio de cambio de mes.',viaje:{ida:{time:'15:00'},vuelta:{time:'18:00'}}},
    {id:'map-label-overlap',kind:'grande',type:'Otros',title:'Plan de ejemplo',start:'2026-10-03',end:'2026-10-04',color:'#c46cab',barSize:'sm'}
  );
  f['excelia-horas-v3'].econYearConfig={'2026':{rate:315,multiRate:false,ratePeriods:[]}};
  f['excelia-invoices-v1']={config:{kairoUrl:'',issuer:'Persona de ejemplo',issuerTax:'PRUEBA-EMISOR',issuerAddress:'Dirección ficticia',iban:'',client:'Cliente de ejemplo',clientTax:'PRUEBA-CLIENTE',clientAddress:'Dirección ficticia',project:'Proyecto de ejemplo',concept:'Servicios de ejemplo · {mes} {anio}',unit:'day',rate:'315',vat:'21',withholding:'15',from:'demo@example.test',to:'cliente@example.test',cc:'',subject:'Factura de ejemplo · {mes} {anio}',body:'Documento ficticio para revisar la interfaz.'},months:{}};
  f['excelia-despacho-v1']={enabled:true,m2Total:80,m2Despacho:12,valorCatastral:90000,valorCatastralConstruccion:60000,compra:{valorCompraTotal:180000,itpMadrid:10800,notariaRegistro:1800,tasacion:350,reformas:0,inmobiliaria:0,importePrestamo:120000,tipoInteres:3,plazoAnios:25,fechaInicio:'2024-01-01',entidadBanco:'Banco de ejemplo',subrogaciones:[{fecha:'2026-01-01',nuevoImporte:112000,nuevoTipoInteres:2.5,nuevoPlazoAnios:23,entidadBanco:'Otro banco de ejemplo',comisionCancelacion:0,notaria:0,tasacion:300,registro:400,vinculaciones:null}]},gas:{activo:'consumo',consumo:{precioKwh:.05,terminoFijo:8,terminoFijoDia:0,comercializadora:'Gas de ejemplo'},fijo:{cuotaFija:55,comercializadora:'Gas de ejemplo'},ivaGas:21},elect:{modo:'consumo',modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,precioPotP1:.07,precioPotP2:.003,precioKwh:.12,terminoFijo:0,comercializadora:'Luz de ejemplo',ivaElect:21}};
  f['excelia-rutinas-v1'].push({id:'map-flex',name:'Rutina flexible de ejemplo',icon:'gen',color:'#547e70',flex:{period:'month',target:4,weeklyTarget:1,sessions:{}} ,weekDays:[],time:'17:00',dur:60,start:'2026-08-01',weeks:{},skips:{},createdAt:4});
  f['excelia-despacho-v1'].gasComparaciones=[{nombre:'Alternativa ficticia',modo:'consumo',precioKwh:.06,terminoFijo:7,cuotaFija:0,comercializadora:'Compañía de ejemplo'}];
  f['excelia-energy-bills-v1']=[];f['excelia-energy-history-v1']=[];
  for(const kind of ['gas','luz']){
    const supplier=kind==='gas'?'Gas de ejemplo':'Luz de ejemplo';
    const analysis={modo:'consumo',energyMode:'unico',precioKwh:kind==='gas'?.05:.12,cuotaFija:0,terminoFijo:kind==='gas'?8:0,terminoFijoDia:0,modoPotencia:'doble',precioPotP1:.07,precioPotP2:.003,potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:3.3,periodPrices:[.12,.10,.08],periodWeights:[33,33,34],otherTaxPct:0,otherTaxKwh:0,promotion:0};
    f['excelia-energy-history-v1'].push({id:'map-contract-'+kind,kind,supplier,tariff:'Tarifa ficticia',supply:'Suministro de ejemplo',start:'2026-01-01',end:'',commitment:'',notes:'Datos inventados para el atlas.',source:'fixture visual',taxes:'excluidos',prices:[{label:'Energía',unit:'€/kWh',value:analysis.precioKwh}],analysis});
    for(let m=1;m<=8;m++){const month=String(m).padStart(2,'0'),end=new Date(Date.UTC(2026,m,0)).getUTCDate();f['excelia-energy-bills-v1'].push({id:'map-'+kind+'-'+m,kind,supplier,number:'DEMO-'+kind+'-'+m,issued:'2026-'+month+'-'+end,start:'2026-'+month+'-01',end:'2026-'+month+'-'+end,consumption:kind==='gas'?(m<4?950:160):180,net:kind==='gas'?55:40,gross:kind==='gas'?66.55:48.4,paid:null,notes:'Factura inventada',source:'fixture visual'});}
  }
  return f;
};
