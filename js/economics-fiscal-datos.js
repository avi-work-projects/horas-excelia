/* ============================================================
   FISCAL DATOS - Lo que se guarda y las cuentas que salen de ello.

   Aqui no hay nada de pantalla: claves de localStorage, carga y guardado por
   anio, y los calculos (ingresoAnual, gastoAnual, comprasTotal, desgravAnual,
   computeTotalDesgrav). Es la parte que cubren las reglas de tools/test.js,
   porque es donde un error no se ve mirando.
   ============================================================ */

var FISCAL_SK='excelia-fiscal-v1';
/* Tramos combinados (estatal + auton\u00f3mico Madrid) 2025.
   Los l\u00edmites de la escala estatal y la de Madrid no coinciden, por lo que se generan
   sub-tramos en cada punto donde cambia alguno de los dos tipos.
   Estatal: 0-12450 9.5% | 12450-20200 12% | 20200-35200 15% | 35200-60000 18.5% | 60000-300000 22.5% | 300000+ 24.5%
   Madrid:  0-13362 8.5% | 13362-19005 10.7% | 19005-35426 12.8% | 35426-57320 17.4% | 57320+ 20.5% */
var DEFAULT_BRACKETS=[
  {from:0,to:12450,pct:18},{from:12450,to:13362,pct:20.5},
  {from:13362,to:19005,pct:22.7},{from:19005,to:20200,pct:24.8},
  {from:20200,to:35200,pct:27.8},{from:35200,to:35426,pct:31.3},
  {from:35426,to:57320,pct:35.9},{from:57320,to:60000,pct:39},
  {from:60000,to:300000,pct:43},{from:300000,to:Infinity,pct:45}
];
var FISCAL={irpfMode:'fixed',irpfPct:15,brackets:null,minPersonal:5742};

/* ── Tab activo en fiscal config ───────────────────────────── */
var FISCAL_TAB='personal'; // 'personal' | 'gastos_desg' | 'irpf_deduc' | 'despacho'
var FISCAL_IRPF_SUB='desgrav'; // 'desgrav' | 'irpf' | 'despacho' — sub-tab dentro de IRPF y Deducciones
var FISCAL_YEAR=CY; // año activo para datos per-year
/* Hipoteca sub-tabs */
var FISCAL_HIP_SUB='resumen'; // 'resumen' | 'detalle'
var FISCAL_HIP_EDITING=null;  // null | 'compra' | 'prestamo' | 'sub-0' | 'sub-1' ...
var FISCAL_HIP_EDIT_SNAPSHOT=null; // deep copy for cancel
var FISCAL_HIP_DETAIL_TARGET=null; // scroll target from "Ver Detalle"

/* ── Per-year helpers ─────────────────────────────────────── */
function _yearKey(base,year){return base+'-'+year;}

/* ── Economía Personal (per-year) ─────────────────────────── */
var PERSONAL_SK='excelia-personal-v1';
var PERSONAL_DATA={gastosRecurrentes:[],gastosSemanales:[],inversiones:[],ingresos:[]};

var DEFAULT_PERSONAL_GASTOS_REC=[
  {id:'baile_def',label:'Baile',amount:0,period:'monthly'},
  {id:'spotify_def',label:'Spotify',amount:0,period:'monthly'},
  {id:'netflix_def',label:'Netflix',amount:0,period:'monthly'},
  {id:'viajes_def',label:'Viajes',amount:0,period:'annual',_viaje:true,viajeFilter:'all'}
];
var DEFAULT_PERSONAL_INVERSIONES=[
  {id:'fi_amundi_world',label:'F. Index. Amundi World',amount:0,period:'monthly'},
  {id:'fi_amundi_emerg',label:'F. Index. Amundi Emergents',amount:0,period:'monthly'},
  {id:'fi_amundi_sp500',label:'F. Index. Amundi SP-500',amount:0,period:'monthly'},
  {id:'fi_renta_fija',label:'F. Index. Renta Fija',amount:0,period:'monthly'},
  {id:'deposito_tr',label:'Dep\u00f3sito T.R. - 2%',amount:0,period:'monthly'}
];
function _ensureDefaults(data){
  /* Ensure default gastosRecurrentes */
  DEFAULT_PERSONAL_GASTOS_REC.forEach(function(def){
    var exists=data.gastosRecurrentes.some(function(it){return it.id===def.id;});
    if(!exists)data.gastosRecurrentes.push(JSON.parse(JSON.stringify(def)));
  });
  /* Ensure default inversiones */
  DEFAULT_PERSONAL_INVERSIONES.forEach(function(def){
    var exists=data.inversiones.some(function(it){return it.id===def.id;});
    if(!exists)data.inversiones.push(JSON.parse(JSON.stringify(def)));
  });
  /* Ensure _viaje flag on viajes_def */
  data.gastosRecurrentes.forEach(function(it){
    if(it.id==='viajes_def'){it._viaje=true;if(!it.viajeFilter)it.viajeFilter='all';}
  });
}
function loadPersonalYear(year){
  try{
    var k=_yearKey(PERSONAL_SK,year);
    var r=localStorage.getItem(k);
    if(r){PERSONAL_DATA=JSON.parse(r);}
    else{
      /* Migración: si no hay datos per-year, intentar migrar ingresos globales */
      PERSONAL_DATA={gastosRecurrentes:[],gastosSemanales:[],inversiones:[],ingresos:[]};
      if(year===CY){
        var ig=localStorage.getItem(INGRESOS_SK);
        if(ig){try{var d=JSON.parse(ig);PERSONAL_DATA.ingresos=d.items||[];}catch(e){}}
      }
    }
  }catch(e){PERSONAL_DATA={gastosRecurrentes:[],gastosSemanales:[],inversiones:[],ingresos:[]};}
  _ensureDefaults(PERSONAL_DATA);
}
function savePersonalYear(year){
  try{localStorage.setItem(_yearKey(PERSONAL_SK,year),JSON.stringify(PERSONAL_DATA));}catch(e){}
}

/* ── Ingresos regulares ───────────────────────────────────── */
var INGRESOS_SK='excelia-ingresos-v1';
var INGRESOS_ITEMS=[];
function loadIngresos(){
  try{var r=localStorage.getItem(INGRESOS_SK);if(r){var d=JSON.parse(r);INGRESOS_ITEMS=d.items||[];}else{INGRESOS_ITEMS=[];}}catch(e){INGRESOS_ITEMS=[];}
}
function saveIngresos(){
  try{localStorage.setItem(INGRESOS_SK,JSON.stringify({items:INGRESOS_ITEMS}));}catch(e){}
}
function findIngreso(id){
  for(var i=0;i<INGRESOS_ITEMS.length;i++){if(INGRESOS_ITEMS[i].id===id)return INGRESOS_ITEMS[i];}
  return null;
}
function ingresoAnual(id){
  var g=findIngreso(id);
  if(!g||!g.amount)return 0;
  return g.period==='monthly'?Math.round(g.amount*12*100)/100:Math.round(g.amount*100)/100;
}
/* ── Gastos regulares ─────────────────────────────────────── */
var GASTOS_SK='excelia-gastos-v1';
var GASTOS_DIFICIL_PCT=5;
var DEFAULT_GASTOS=[
  {id:'cot_social',label:'Cotizaciones sociales',amount:0,period:'monthly'},
  {id:'asesoria',label:'Asesor\u00eda',amount:0,period:'monthly'},
  {id:'seg_baja',label:'Seguro baja laboral',amount:0,period:'monthly'},
  {id:'seg_salud',label:'Seguro de Salud',amount:0,period:'monthly'},
  {id:'seg_vida',label:'Seguro de Vida',amount:0,period:'annual'},
  {id:'donaciones',label:'Donaciones caritativas',amount:0,period:'annual'},
  {id:'hipoteca',label:'Hipoteca',amount:0,period:'monthly'},
  {id:'ibi',label:'IBI',amount:0,period:'annual'},
  {id:'comunidad',label:'Com. Propietarios',amount:0,period:'monthly'},
  {id:'seg_hogar',label:'Seguro del Hogar',amount:0,period:'annual'},
  {id:'gas',label:'Factura Gas',amount:0,period:'monthly'},
  {id:'luz',label:'Factura Luz',amount:0,period:'monthly'},
  {id:'digi',label:'Factura Digi',amount:0,period:'monthly'},
  {id:'agua',label:'Factura Agua',amount:0,period:'monthly'},
  {id:'otros_seg',label:'Otros seguros',amount:0,period:'annual'},
  {id:'plan_pension',label:'Plan de pensiones',amount:0,period:'annual'}
];
var GASTOS_ITEMS=[];

function loadFiscal(){
  try{
    var r=localStorage.getItem(FISCAL_SK);
    if(r){var d=JSON.parse(r);FISCAL.irpfMode=d.irpfMode||'fixed';FISCAL.irpfPct=d.irpfPct||15;FISCAL.brackets=d.brackets||null;
      if(d.minPersonal!=null)FISCAL.minPersonal=d.minPersonal;
    }
  }catch(e){}
}
function saveFiscal(){
  localStorage.setItem(FISCAL_SK,JSON.stringify({irpfMode:FISCAL.irpfMode,irpfPct:FISCAL.irpfPct,brackets:FISCAL.brackets,minPersonal:FISCAL.minPersonal}));
}
function getIrpfPct(){return FISCAL.irpfMode==='custom'?FISCAL.irpfPct:15;}
function getBrackets(){return FISCAL.brackets||DEFAULT_BRACKETS;}

function _loadGastosFromRaw(raw){
  var d=JSON.parse(raw);
  GASTOS_DIFICIL_PCT=d.dificilPct!=null?d.dificilPct:5;
  var saved=d.items||[];
  var result=[];
  DEFAULT_GASTOS.forEach(function(def){
    var found=null;
    for(var i=0;i<saved.length;i++){if(saved[i].id===def.id){found=saved[i];break;}}
    var item=found?JSON.parse(JSON.stringify(found)):JSON.parse(JSON.stringify(def));
    if(def.id==='comunidad')item.label='Com. Propietarios';
    result.push(item);
  });
  saved.forEach(function(s){
    var isFixed=DEFAULT_GASTOS.some(function(dd){return dd.id===s.id;});
    if(!isFixed)result.push(JSON.parse(JSON.stringify(s)));
  });
  GASTOS_ITEMS=result;
}
function loadGastosYear(year){
  try{
    var k=_yearKey(GASTOS_SK,year);
    var r=localStorage.getItem(k);
    if(r){_loadGastosFromRaw(r);}
    else{
      /* Fallback: clave global (migración o sin datos específicos del año) */
      var g=localStorage.getItem(GASTOS_SK);
      if(g){_loadGastosFromRaw(g);}
      else{GASTOS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_GASTOS));GASTOS_DIFICIL_PCT=5;}
    }
  }catch(e){GASTOS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_GASTOS));}
}
function loadGastos(){loadGastosYear(FISCAL_YEAR);}
function saveGastosYear(year){
  try{localStorage.setItem(_yearKey(GASTOS_SK,year),JSON.stringify({dificilPct:GASTOS_DIFICIL_PCT,items:GASTOS_ITEMS}));}catch(e){}
}
function findGasto(id){
  for(var i=0;i<GASTOS_ITEMS.length;i++){if(GASTOS_ITEMS[i].id===id)return GASTOS_ITEMS[i];}
  return null;
}
function gastoAnual(id){
  var g=findGasto(id);
  if(!g||!g.amount)return 0;
  return g.period==='monthly'?Math.round(g.amount*12*100)/100:Math.round(g.amount*100)/100;
}

/* ── Compras / Gastos profesionales autónomo ─────────────── */
var COMPRAS_SK='excelia-compras-v1';
var COMPRAS_IVA_ENABLED=false; // Activar desgravación de IVA soportado en compras
var DEFAULT_COMPRAS=[
  {id:'material_oficina',label:'Material de oficina',amount:0,enabled:true,ivaIncluded:false,ivaPct:21,quarter:null},
  {id:'equipamiento_info',label:'Equipamiento inform\u00e1tico',amount:0,enabled:true,ivaIncluded:false,ivaPct:21,quarter:null},
  {id:'formacion',label:'Formaci\u00f3n / cursos',amount:0,enabled:false,ivaIncluded:false,ivaPct:21,quarter:null},
  {id:'suscripciones',label:'Suscripciones software',amount:0,enabled:false,ivaIncluded:false,ivaPct:21,quarter:null}
];
var COMPRAS_ITEMS=[];
function loadCompras(){
  try{
    var r=localStorage.getItem(COMPRAS_SK);
    if(r){
      var d=JSON.parse(r);
      COMPRAS_IVA_ENABLED=!!d.ivaEnabled;
      var items=d.items||JSON.parse(JSON.stringify(DEFAULT_COMPRAS));
      /* Migración: asegurar campos IVA en items guardados */
      items.forEach(function(c){
        if(c.ivaIncluded===undefined)c.ivaIncluded=false;
        if(c.ivaPct===undefined)c.ivaPct=21;
        if(c.quarter===undefined)c.quarter=null;
      });
      COMPRAS_ITEMS=items;
    }else{COMPRAS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_COMPRAS));}
  }catch(e){COMPRAS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_COMPRAS));}
}
function saveCompras(){
  try{localStorage.setItem(COMPRAS_SK,JSON.stringify({ivaEnabled:COMPRAS_IVA_ENABLED,items:COMPRAS_ITEMS}));}catch(e){}
}
/* Devuelve la BASE sin IVA de todas las compras habilitadas */
function comprasTotal(){
  var t=0;
  COMPRAS_ITEMS.forEach(function(c){
    if(!c.enabled||!c.amount)return;
    if(c.ivaIncluded&&c.ivaPct>0){t+=Math.round(c.amount/(1+c.ivaPct/100)*100)/100;}
    else{t+=c.amount;}
  });
  return Math.round(t*100)/100;
}
/* Devuelve el IVA soportado de compras para el trimestre q (1-4). Si q=null, total anual */
function comprasIvaTotal(q){
  if(!COMPRAS_IVA_ENABLED)return 0;
  var t=0;
  COMPRAS_ITEMS.forEach(function(c){
    if(!c.enabled||!c.amount||!c.ivaIncluded||!c.ivaPct)return;
    var base=Math.round(c.amount/(1+c.ivaPct/100)*100)/100;
    var iva=Math.round((c.amount-base)*100)/100;
    if(q===null||q===undefined){t+=iva;}
    else if(c.quarter!=null){if(c.quarter===q)t+=iva;}
    else{t+=Math.round(iva/4*100)/100;} /* distribuir uniformemente entre trimestres */
  });
  return Math.round(t*100)/100;
}

/* ── Desgravaciones IRPF ─────────────────────────────────── */
var DESGRAV_SK='excelia-desgrav-v1';
/* type: 'base' = reduce la base imponible | 'quota' = reduce directamente la cuota IRPF */
var DESGRAV_DEFAULT=[
  {id:'plan_pension',label:'Plan de pensiones',gastoLink:'plan_pension',pct:100,amount:0,limit:5750,enabled:true,type:'base',
   note:'Hasta 5.750\u20ac/a\u00f1o para aut\u00f3nomos con plan de empleo simplificado (1.500\u20ac individuales + 4.250\u20ac adicionales).'},
  {id:'cuota_autonomos',label:'Cuota aut\u00f3nomos (SS)',gastoLink:'cot_social',pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'100% deducible como gasto de la actividad econ\u00f3mica.'},
  {id:'asesoria_deduc',label:'Asesor\u00eda / gestor\u00eda',gastoLink:'asesoria',pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'100% deducible como gasto de la actividad econ\u00f3mica.'},
  {id:'seg_salud_titular',label:'Seguro salud (titular)',gastoLink:'seg_salud',pct:100,amount:0,limit:500,enabled:true,type:'base',
   note:'Gasto deducible en base imponible: hasta 500\u20ac/a\u00f1o por persona (1.500\u20ac si discapacidad). Cubre titular, c\u00f3nyuge e hijos <25 dependientes.'},
  {id:'gastos_prof',label:'Compras / gastos profesionales',gastoLink:'_compras_total',pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'100% deducibles como inversi\u00f3n en la actividad. Introduce siempre importes sin IVA.'},
  {id:'seg_baja_deduc',label:'Seguro baja laboral / IT',gastoLink:'seg_baja',pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'100% deducible como gasto de la actividad econ\u00f3mica. Introduce el importe anual en Gastos \u2192 Seguro baja laboral.'},
  {id:'amortizaciones',label:'Amortizaci\u00f3n de activos',gastoLink:null,pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'M\u00f3viles/port\u00e1tiles de trabajo: 25%/a\u00f1o. Calcula el total deducible del a\u00f1o e int\u00f3ducelo aqu\u00ed directamente (ej: si coste 872\u20ac al 25% = 218\u20ac).'},
  {id:'donaciones',label:'Donaciones caritativas',gastoLink:'donaciones',pct:100,amount:0,limit:null,enabled:true,type:'quota',notaPct:80,
   note:'Deducci\u00f3n en cuota: 80% primeros 250\u20ac, 40% del exceso (Ley 49/2002). Simplificado al 80%.'},
  {id:'madrid_intereses_jovenes_30',label:'Madrid: Intereses hipoteca <30 a\u00f1os',gastoLink:null,pct:100,amount:0,limit:4126.68,enabled:false,type:'quota',notaPct:25,
   note:'Deducci\u00f3n autonomica Comunidad de Madrid (Decreto Legislativo 1/2010): 25% de los intereses hipotecarios para adquisici\u00f3n de vivienda habitual. Solo para residentes en Madrid menores de 30 a\u00f1os. Deducci\u00f3n m\u00e1xima: 1.031,67\u20ac/a\u00f1o (25% sobre 4.126,68\u20ac de base). Introduce el TOTAL de intereses pagados durante el a\u00f1o (NO la parte del despacho).'},
];
var DESGRAV_ITEMS=[];

function loadDesgrav(){
  var OBSOLETE_IDS=['seg_salud_conyuge','seg_salud_hijos','colegio_prof','donativos','vivienda_madrid'];
  try{
    var r=localStorage.getItem(DESGRAV_SK);
    if(r){
      var d=JSON.parse(r);
      var saved=d.items||[];
      /* Eliminar items obsoletos */
      var result=saved.filter(function(it){return OBSOLETE_IDS.indexOf(it.id)===-1;});
      /* Añadir items nuevos y actualizar campos */
      DESGRAV_DEFAULT.forEach(function(def){
        var exists=false;
        for(var i=0;i<result.length;i++){if(result[i].id===def.id){exists=true;break;}}
        if(!exists){result.push(JSON.parse(JSON.stringify(def)));return;}
        for(var i=0;i<result.length;i++){
          if(result[i].id!==def.id)continue;
          if(def.gastoLink&&(result[i].gastoLink===undefined||result[i].gastoLink===null))result[i].gastoLink=def.gastoLink;
          if(def.pct!==undefined&&result[i].pct===undefined)result[i].pct=def.pct;
          if(def.type&&!result[i].type)result[i].type=def.type;
          if(def.notaPct&&!result[i].notaPct)result[i].notaPct=def.notaPct;
          /* Actualizar notas de items fijos */
          if(def.note)result[i].note=def.note;
          /* Corregir límite del plan de pensiones (→ 5750) */
          if(def.id==='plan_pension'&&def.limit&&(result[i].limit==null||result[i].limit<def.limit)){result[i].limit=def.limit;result[i].note=def.note;}
          break;
        }
      });
      DESGRAV_ITEMS=result;
    }else{DESGRAV_ITEMS=JSON.parse(JSON.stringify(DESGRAV_DEFAULT));}
  }catch(e){DESGRAV_ITEMS=JSON.parse(JSON.stringify(DESGRAV_DEFAULT));}
}
function saveDesgrav(){
  try{localStorage.setItem(DESGRAV_SK,JSON.stringify({items:DESGRAV_ITEMS}));}catch(e){}
}
function desgravAnual(item){
  if(!item.enabled)return 0;
  var amt;
  if(item.gastoLink){
    var ga=item.gastoLink==='_compras_total'?comprasTotal():gastoAnual(item.gastoLink);
    var p=(item.pct!=null?item.pct:100)/100;
    amt=Math.round(ga*p*100)/100;
    /* SI tiene gastoLink, NO aplicamos fallback al item.amount cuando el gasto
       vinculado es 0. Antes había un fallback que aplicaba item.amount cuando
       el gasto era 0, pero esto causaba un bug grave: si el usuario tenía
       Plan de Pensiones en 2025 (gasto=5750) y NO en 2026 (gasto=0), la
       app seguía deduciendo los 5750 en 2026 (cayendo al item.amount=5750).
       Si quieres deducir, métele el importe en gastosPerYear[año], no aquí.
       Solo items SIN gastoLink (ej. amortizaciones manuales) usan amount. */
  }else{
    amt=item.amount||0;
  }
  if(!amt)return 0;
  if(item.limit!==null&&item.limit!==undefined)amt=Math.min(amt,item.limit);
  return Math.round(amt*100)/100;
}
function computeTotalDesgrav(){
  var base=0,quota=0;
  DESGRAV_ITEMS.forEach(function(item){
    var d=desgravAnual(item);
    if((item.type||'base')==='quota'){quota+=d;}
    else{base+=d;}
  });
  return{base:Math.round(base*100)/100,quota:Math.round(quota*100)/100,total:Math.round((base+quota)*100)/100};
}

/* ── Despacho en casa ─────────────────────────────────────── */
