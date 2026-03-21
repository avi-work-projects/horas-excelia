/* ============================================================
   ECONOMICS FISCAL — Configuración fiscal (IRPF + tramos + gastos)
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
var FISCAL={irpfMode:'fixed',irpfPct:15,brackets:null};

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
function renderIngresosList(){
  var h='';
  INGRESOS_ITEMS.forEach(function(g,i){
    h+='<div class="fiscal-gasto-item" data-ii="'+i+'">';
    h+='<input class="fiscal-gasto-lbl-input" data-ii="'+i+'" data-ifield="label" value="'+escHtml(g.label)+'" placeholder="Nombre...">';
    h+='<input class="fiscal-gasto-amt" data-ii="'+i+'" data-ifield="amount" type="number" min="0" step="1" value="'+(g.amount||0)+'">';
    h+='<div class="fiscal-gasto-period">';
    h+='<button class="fiscal-period-btn'+(g.period==='monthly'?' active':'')+'" data-ii="'+i+'" data-ifield="period" data-val="monthly">/mes</button>';
    h+='<button class="fiscal-period-btn'+(g.period==='annual'?' active':'')+'" data-ii="'+i+'" data-ifield="period" data-val="annual">/a\u00f1o</button>';
    h+='</div>';
    h+='<button class="fiscal-gasto-del fiscal-ingreso-del" data-ii="'+i+'">&#10005;</button>';
    h+='</div>';
  });
  if(!INGRESOS_ITEMS.length)h+='<div style="font-size:.75rem;color:var(--text-dim);padding:6px 0">Sin ingresos regulares configurados.</div>';
  return h;
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
    if(r){var d=JSON.parse(r);FISCAL.irpfMode=d.irpfMode||'fixed';FISCAL.irpfPct=d.irpfPct||15;FISCAL.brackets=d.brackets||null;}
  }catch(e){}
}
function saveFiscal(){
  localStorage.setItem(FISCAL_SK,JSON.stringify({irpfMode:FISCAL.irpfMode,irpfPct:FISCAL.irpfPct,brackets:FISCAL.brackets}));
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
    else if(year===CY){
      /* Migración: fallback a la key global */
      var g=localStorage.getItem(GASTOS_SK);
      if(g){_loadGastosFromRaw(g);}
      else{GASTOS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_GASTOS));}
    }
    else{GASTOS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_GASTOS));GASTOS_DIFICIL_PCT=5;}
  }catch(e){GASTOS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_GASTOS));}
}
function loadGastos(){loadGastosYear(FISCAL_YEAR);}
function saveGastosYear(year){
  try{localStorage.setItem(_yearKey(GASTOS_SK,year),JSON.stringify({dificilPct:GASTOS_DIFICIL_PCT,items:GASTOS_ITEMS}));}catch(e){}
}
function saveGastos(){saveGastosYear(FISCAL_YEAR);}
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
  {id:'donaciones',label:'Donaciones caritativas',gastoLink:'donaciones',pct:100,amount:0,limit:null,enabled:true,type:'quota',notaPct:80,
   note:'Deducci\u00f3n en cuota: 80% primeros 250\u20ac, 40% del exceso (Ley 49/2002). Simplificado al 80%.'},
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
var DESPACHO_SK='excelia-despacho-v1';
var DESPACHO={enabled:true,m2Total:0,m2Despacho:0,pct:0,valorCatastral:0,valorCompra:0,hipotecaIntereses:0,hipotecaInteresesManual:false,compra:null};

function _defaultCompra(){return{valorCompraTotal:0,itpMadrid:0,notariaRegistro:0,tasacion:0,reformas:0,inmobiliaria:0,importePrestamo:0,tipoInteres:0,plazoAnios:0,fechaInicio:null,entidadBanco:'',vinculaciones:{nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}},subrogaciones:[]};}
function _defaultSubrogacion(){return{fecha:null,comisionCancelacion:0,notaria:0,tasacion:0,registro:0,nuevoImporte:0,nuevoTipoInteres:0,nuevoPlazoAnios:0,entidadBanco:'',vinculaciones:null};}
function loadDespacho(){
  try{
    var r=localStorage.getItem(DESPACHO_SK);
    if(r){var d=JSON.parse(r);
      DESPACHO.enabled=d.enabled!=null?!!d.enabled:true;
      DESPACHO.m2Total=d.m2Total||0;DESPACHO.m2Despacho=d.m2Despacho||0;
      DESPACHO.pct=d.pct||0;
      DESPACHO.valorCatastral=d.valorCatastral||0;DESPACHO.valorCompra=d.valorCompra||0;
      DESPACHO.hipotecaIntereses=d.hipotecaIntereses||0;
      /* Migración: si no existe compra, crear con defaults y migrar valorCompra */
      if(d.compra){
        DESPACHO.compra=d.compra;
        /* Migrar campos nuevos v106 */
        if(!d.compra.fechaInicio&&d.compra.fechaInicio!==null)d.compra.fechaInicio=null;
        if(!d.compra.vinculaciones)d.compra.vinculaciones={nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
        else{var _vk=['nomina','segHogar','segSalud','segVida'];_vk.forEach(function(k){if(!d.compra.vinculaciones[k])d.compra.vinculaciones[k]={enabled:false,costeAnual:0,reduccion:0};else if(d.compra.vinculaciones[k].reduccion==null)d.compra.vinculaciones[k].reduccion=0;});}
        /* Migración v120→v121: subrogacion (single) → subrogaciones (array) */
        if(d.compra.subrogacion!==undefined){
          if(d.compra.subrogacion)d.compra.subrogaciones=[d.compra.subrogacion];
          else d.compra.subrogaciones=[];
          delete d.compra.subrogacion;
        }
        if(!Array.isArray(d.compra.subrogaciones))d.compra.subrogaciones=[];
      }
      else{DESPACHO.compra=_defaultCompra();if(DESPACHO.valorCompra>0)DESPACHO.compra.valorCompraTotal=DESPACHO.valorCompra;}
      DESPACHO.hipotecaInteresesManual=d.hipotecaInteresesManual||false;
      if(!d.deducciones)DESPACHO.deducciones={amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
      else DESPACHO.deducciones=d.deducciones;
      /* Migración v123→v124: gas, electricidad, seguros normales */
      DESPACHO.gas=d.gas||{modo:'consumo',precioKwh:0,cuotaFija:0,terminoFijo:0,comercializadora:''};
      DESPACHO.elect=d.elect||{modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:6.6,precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''};
      DESPACHO.segurosNormales=d.segurosNormales||{segSalud:0,segVida:0,segHogar:0};
      DESPACHO.gasComparaciones=d.gasComparaciones||[];
      DESPACHO.electComparaciones=d.electComparaciones||[];
      /* Migrar ANALISIS_SEG_NORMAL a DESPACHO.segurosNormales */
      if(typeof ANALISIS_SEG_NORMAL!=='undefined'){
        var sn=DESPACHO.segurosNormales;
        if(!sn.segSalud&&ANALISIS_SEG_NORMAL.segSalud)sn.segSalud=ANALISIS_SEG_NORMAL.segSalud;
        if(!sn.segVida&&ANALISIS_SEG_NORMAL.segVida)sn.segVida=ANALISIS_SEG_NORMAL.segVida;
        if(!sn.segHogar&&ANALISIS_SEG_NORMAL.segHogar)sn.segHogar=ANALISIS_SEG_NORMAL.segHogar;
      }
    }else{
      DESPACHO.compra=_defaultCompra();
      DESPACHO.deducciones={amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
      DESPACHO.gas={modo:'consumo',precioKwh:0,cuotaFija:0,terminoFijo:0,comercializadora:''};
      DESPACHO.elect={modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:6.6,precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''};
      DESPACHO.segurosNormales={segSalud:0,segVida:0,segHogar:0};
      DESPACHO.gasComparaciones=[];
      DESPACHO.electComparaciones=[];
    }
  }catch(e){if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();}
}
function saveDespacho(){
  try{localStorage.setItem(DESPACHO_SK,JSON.stringify(DESPACHO));}catch(e){}
}
function _despachoGetPct(){
  if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)return DESPACHO.m2Despacho/DESPACHO.m2Total;
  if(DESPACHO.pct>0)return DESPACHO.pct/100;
  return 0;
}
function computeDespachoDeduccion(){
  if(!DESPACHO.enabled)return 0;
  var prop=_despachoGetPct();
  if(prop<=0)return 0;
  var dd=DESPACHO.deducciones||{amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
  /* Amortización: 3% × 80% (construcción) × max(valorCatastral, valorCompra) × prop */
  var vc=DESPACHO.valorCatastral||0, vcp=DESPACHO.valorCompra||0;
  var baseAmort=0;
  if(vc>0&&vcp>0){baseAmort=Math.max(vc,vcp);}else if(vcp>0){baseAmort=vcp;}else if(vc>0){baseAmort=vc;}
  var amort=dd.amortizacion!==false?Math.round(baseAmort*0.80*0.03*prop*100)/100:0;
  /* IBI: 100% deducible × prop (el límite del 30% aplica solo a suministros) */
  var ibiReal=gastoAnual('ibi');
  var ibi=dd.ibi!==false?(ibiReal>0?Math.round(ibiReal*prop*100)/100:Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100):0;
  /* Hipoteca: solo los intereses (campo separado hipotecaIntereses) */
  var hipInteres=dd.hipotecaInt!==false?Math.round((DESPACHO.hipotecaIntereses||0)*prop*100)/100:0;
  var GROUP_CASA=['comunidad','seg_hogar']; /* hipoteca excluida — usar hipotecaIntereses */
  var GROUP_UTIL=['luz','gas','agua','digi'];
  var gastosCasa=0,gastosUtil=0;
  GASTOS_ITEMS.forEach(function(g){
    var a=gastoAnual(g.id);
    if(GROUP_CASA.indexOf(g.id)!==-1)gastosCasa+=a;
    else if(GROUP_UTIL.indexOf(g.id)!==-1)gastosUtil+=a;
  });
  var casaDeducible=dd.casa!==false?Math.round(gastosCasa*prop*100)/100:0;
  var utilDeducible=dd.suministros!==false?Math.round(gastosUtil*prop*0.30*100)/100:0;
  return Math.round((amort+ibi+hipInteres+casaDeducible+utilDeducible)*100)/100;
}

/* ── computeDeclResult — cálculo unificado para declaración ── */
function computeDeclResult(base,irpfTotal){
  var gdPct=typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5;
  var gdAmount=Math.round(base*gdPct/100*100)/100;
  if(gdAmount>2000)gdAmount=2000; /* tope legal AEAT: máx 2.000€/año (est. directa simplificada) */
  var baseAfterGD=Math.max(0,Math.round((base-gdAmount)*100)/100);
  var dg=computeTotalDesgrav();
  var totalBaseDesgrav=dg.base;
  var totalQuotaDesgrav=dg.quota;
  /* Quota: para vivienda notaPct=15 → la cantidad ingresada ES la base (hipoteca pagada)
     la deducción real = min(amount,9015) × 15% → desgravAnual ya aplica min(amount,limit),
     pero el notaPct se aplica aquí */
  var quotaEffective=0;
  DESGRAV_ITEMS.forEach(function(item){
    if(!item.enabled||(item.type||'base')!=='quota')return;
    var d=desgravAnual(item);
    var qPct=item.notaPct!=null?item.notaPct/100:1;
    quotaEffective+=Math.round(d*qPct*100)/100;
  });
  quotaEffective=Math.round(quotaEffective*100)/100;
  if(DESPACHO.enabled)totalBaseDesgrav=Math.round((totalBaseDesgrav+computeDespachoDeduccion())*100)/100;
  var baseDecl=Math.max(0,Math.round((baseAfterGD-totalBaseDesgrav)*100)/100);
  var decl=computeIrpfBrackets(baseDecl);
  var declDiff=Math.round((decl.totalTax-irpfTotal-quotaEffective)*100)/100;
  return{
    gdPct:gdPct,gdAmount:gdAmount,baseAfterGD:baseAfterGD,
    totalDesgrav:Math.round((totalBaseDesgrav+totalQuotaDesgrav)*100)/100,
    totalBaseDesgrav:totalBaseDesgrav,totalQuotaDesgrav:quotaEffective,
    baseDecl:baseDecl,decl:decl,declDiff:declDiff
  };
}

/* ── Cálculo IRPF por tramos ──────────────────────────────── */
function computeIrpfBrackets(base){
  var brackets=getBrackets();
  var totalTax=0,breakdown=[];
  for(var i=0;i<brackets.length;i++){
    var b=brackets[i];
    if(base<=b.from)break;
    var top=b.to===Infinity?base:Math.min(base,b.to);
    var taxable=top-b.from;
    var tax=Math.round(taxable*b.pct/100*100)/100;
    totalTax+=tax;
    breakdown.push({from:b.from,to:b.to,pct:b.pct,taxable:taxable,tax:tax});
  }
  return{totalTax:Math.round(totalTax*100)/100,breakdown:breakdown,effectivePct:base>0?Math.round(totalTax/base*10000)/100:0};
}

/* ── renderFiscalContent — con tabs ──────────────────────── */
function renderFiscalContent(){
  var h=renderNavBar('econ');
  h+='<div class="sy-header with-tabs fiscal-hdr">';
  h+='<button class="sy-back" id="fiscalBack">&#8592;</button>';
  h+='<div class="sy-year" style="font-size:.9rem;color:#c084fc">&#9965; Configuraci\u00f3n Fiscal</div>';
  h+='</div>';
  h+='<div class="fiscal-tab-bar">';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='personal'?' active':'')+'" id="fiscalTabPersonal">Econom\u00eda<br>Personal</button>';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='gastos_desg'?' active':'')+'" id="fiscalTabGastosDesg">Gastos<br>Desgravables</button>';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='irpf_deduc'?' active':'')+'" id="fiscalTabIrpfDeduc">IRPF y<br>Deducciones</button>';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='despacho'?' active':'')+'" id="fiscalTabDespacho">Hipoteca<br>y Facturas</button>';
  h+='</div>';
  if(FISCAL_TAB!=='despacho')h+=_renderYearSelector();
  h+='<div class="sy-body" style="padding:16px">';
  if(FISCAL_TAB==='personal')h+=renderFiscalTabPersonal();
  else if(FISCAL_TAB==='gastos_desg')h+=renderFiscalTabGastosDesg();
  else if(FISCAL_TAB==='irpf_deduc')h+=renderFiscalTabIrpfDeduc();
  else if(FISCAL_TAB==='despacho')h+=renderFiscalTabDespacho();
  h+='</div>';
  h+='<div class="fiscal-sticky-save">';
  h+='<button class="fiscal-save-btn" id="fiscalSave">Guardar configuraci\u00f3n</button>';
  h+='</div>';
  return h;
}

/* ── Year selector (shared by personal + gastos_desg) ────── */
function _renderYearSelector(){
  var h='<div class="fiscal-year-selector">';
  h+='<button class="fiscal-year-arrow" id="fiscalYearPrev">&#8592;</button>';
  h+='<span class="fiscal-year-label" id="fiscalYearLabel">'+FISCAL_YEAR+'</span>';
  h+='<button class="fiscal-year-arrow" id="fiscalYearNext">&#8594;</button>';
  h+='</div>';
  return h;
}
function _renderCopyYearBtn(){
  /* Buscar años que tengan datos para este tipo de tab */
  var prefix=FISCAL_TAB==='personal'?PERSONAL_SK:GASTOS_SK;
  var years=[];
  for(var i=0;i<localStorage.length;i++){
    var k=localStorage.key(i);
    if(k&&k.indexOf(prefix+'-')===0){
      var y=parseInt(k.substring(k.lastIndexOf('-')+1),10);
      if(y&&y!==FISCAL_YEAR&&years.indexOf(y)===-1)years.push(y);
    }
  }
  if(!years.length)return '';
  years.sort();
  var h='<div class="fiscal-copy-year-wrap">';
  h+='<span style="font-size:.72rem;color:var(--text-dim)">Copiar datos de:</span>';
  years.forEach(function(y){
    h+='<button class="fiscal-copy-year-btn" data-copy-year="'+y+'">'+y+'</button>';
  });
  h+='</div>';
  return h;
}

/* ── Tab Economía Personal (per-year) ─────────────────────── */
function _personalListHtml(arr,section,periodMode){
  /* periodMode: 'weekly'=/sem|/mes, 'monthly'=/mes|/año */
  var h='';
  arr.forEach(function(item,i){
    /* Compute annual for this item */
    var annual=0;
    if(item.amount){
      if(item.period==='weekly'||(periodMode==='weekly'&&!item.period))annual=item.amount*52;
      else if(item.period==='annual')annual=item.amount;
      else annual=item.amount*12;
    }
    h+='<div class="fiscal-gasto-item" data-ps="'+section+'" data-pi="'+i+'">';
    h+='<input class="fiscal-gasto-lbl-input" data-ps="'+section+'" data-pi="'+i+'" data-pf="label" value="'+escHtml(item.label)+'" placeholder="Nombre...">';
    h+='<input class="fiscal-gasto-amt fiscal-gasto-amt-sm" data-ps="'+section+'" data-pi="'+i+'" data-pf="amount" type="number" min="0" step="1" value="'+(item.amount||0)+'">';
    if(periodMode==='weekly'){
      h+='<div class="fiscal-gasto-period">';
      h+='<button class="fiscal-period-btn'+(item.period==='weekly'||!item.period?' active':'')+'" data-ps="'+section+'" data-pi="'+i+'" data-pf="period" data-val="weekly">/sem</button>';
      h+='<button class="fiscal-period-btn'+(item.period==='monthly'?' active':'')+'" data-ps="'+section+'" data-pi="'+i+'" data-pf="period" data-val="monthly">/mes</button>';
      h+='</div>';
    }else if(periodMode==='monthly'){
      h+='<div class="fiscal-gasto-period">';
      h+='<button class="fiscal-period-btn'+(item.period==='monthly'||!item.period?' active':'')+'" data-ps="'+section+'" data-pi="'+i+'" data-pf="period" data-val="monthly">/mes</button>';
      h+='<button class="fiscal-period-btn'+(item.period==='annual'?' active':'')+'" data-ps="'+section+'" data-pi="'+i+'" data-pf="period" data-val="annual">/a\u00f1o</button>';
      h+='</div>';
    }
    h+='<button class="fiscal-gasto-del fiscal-personal-del" data-ps="'+section+'" data-pi="'+i+'">&#10005;</button>';
    h+='</div>';
    /* Annual amount indicator */
    if(annual>0)h+='<div class="fiscal-gasto-annual">'+fcPlain(annual)+'/a\u00f1o</div>';
    /* Viaje event selector */
    if(item._viaje){
      var evList=typeof EVENTS!=='undefined'?EVENTS.filter(function(ev){return ev.title&&ev.title.length>0&&(getEvType(ev)==='Viaje'||getEvType(ev)==='Asturias');}):[];
      h+='<div class="fiscal-viaje-selector" data-ps="'+section+'" data-pi="'+i+'">';
      h+='<select class="fiscal-viaje-select" data-ps="'+section+'" data-pi="'+i+'" data-pf="viajeFilter">';
      h+='<option value="all"'+((!item.viajeFilter||item.viajeFilter==='all')?' selected':'')+'>Todos los viajes</option>';
      evList.forEach(function(ev){
        h+='<option value="'+ev.id+'"'+(item.viajeFilter===ev.id?' selected':'')+'>'+escHtml(ev.title)+'</option>';
      });
      h+='</select></div>';
    }
  });
  return h;
}
function _personalTotal(arr){
  var t=0;
  arr.forEach(function(item){
    if(!item.amount)return;
    if(item.period==='weekly'||!item.period&&item._isWeeklySection)t+=item.amount*52;
    else if(item.period==='annual')t+=item.amount;
    else t+=item.amount*12; /* monthly default */
  });
  return Math.round(t*100)/100;
}
function _personalTotalWeekly(arr){
  var t=0;
  arr.forEach(function(item){
    if(!item.amount)return;
    if(item.period==='monthly')t+=item.amount*12;
    else t+=item.amount*52; /* weekly default */
  });
  return Math.round(t*100)/100;
}
function renderFiscalTabPersonal(){
  var h=_renderCopyYearBtn();
  /* 1. Gastos Recurrentes Personales (todo en una sección) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title expense">Gastos Recurrentes Personales</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Gastos semanales, suscripciones, viajes, etc.</div>';
  /* Gastos semanales primero */
  h+='<div id="personalGastosSem">'+_personalListHtml(PERSONAL_DATA.gastosSemanales,'gastosSemanales','weekly')+'</div>';
  if(PERSONAL_DATA.gastosSemanales.length<1){h+='<button class="fiscal-add-btn fiscal-add-btn-expense" data-padd="gastosSemanales" style="margin-bottom:6px">+ A\u00f1adir gasto semanal</button>';}
  /* Gastos recurrentes (suscripciones, etc.) a continuación */
  h+='<div id="personalGastosRec">'+_personalListHtml(PERSONAL_DATA.gastosRecurrentes,'gastosRecurrentes','monthly')+'</div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-expense" data-padd="gastosRecurrentes" style="margin-bottom:4px">+ A\u00f1adir gasto</button>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-expense" data-padd="gastosRecurrentes" data-viaje="1">+ A\u00f1adir viaje</button>';
  /* Total combinado */
  var tGS=_personalTotalWeekly(PERSONAL_DATA.gastosSemanales);
  var tGR=_personalTotal(PERSONAL_DATA.gastosRecurrentes);
  var tCombined=tGS+tGR;
  if(tCombined>0)h+='<div class="fiscal-compras-total" style="margin-top:6px"><b>Total gastos anual: '+fcPlain(tCombined)+'</b> ('+fcPlain(Math.round(tCombined/12*100)/100)+'/mes)</div>';
  h+='</div>';
  /* 2. Inversiones Recurrentes */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title income">Inversiones Recurrentes</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Planes de ahorro, fondos indexados, DCA crypto, etc.</div>';
  h+='<div id="personalInversiones">'+_personalListHtml(PERSONAL_DATA.inversiones,'inversiones','monthly')+'</div>';
  var tInv=_personalTotal(PERSONAL_DATA.inversiones);
  if(tInv>0)h+='<div class="fiscal-compras-total">Total anual: <b>'+fcPlain(tInv)+'</b></div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-income" data-padd="inversiones">+ A\u00f1adir inversi\u00f3n</button>';
  h+='</div>';
  /* 3. Ingresos (migrado) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title income">Ingresos Regulares</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Ingresos recurrentes: alquileres, dividendos, pensiones, etc.</div>';
  h+='<div id="personalIngresos">'+_personalListHtml(PERSONAL_DATA.ingresos,'ingresos','monthly')+'</div>';
  var tIng=_personalTotal(PERSONAL_DATA.ingresos);
  if(tIng>0)h+='<div class="fiscal-compras-total">Total anual: <b>'+fcPlain(tIng)+'</b></div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-income" data-padd="ingresos">+ A\u00f1adir ingreso</button>';
  h+='</div>';
  return h;
}

/* ── Tab IRPF ─────────────────────────────────────────────── */
function renderFiscalTabIrpf(){
  var brackets=getBrackets();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Retenci\u00f3n IRPF (en facturas)</div>';
  h+='<div class="fiscal-radio-row">';
  h+='<div class="fiscal-radio-item'+(FISCAL.irpfMode==='fixed'?' active':'')+'" id="fiscalRadioFixed">';
  h+='<div class="fiscal-radio-dot'+(FISCAL.irpfMode==='fixed'?' on':'')+'"></div><span>Fijo al <b>15%</b> (por defecto)</span></div>';
  h+='<div class="fiscal-radio-item'+(FISCAL.irpfMode==='custom'?' active':'')+'" id="fiscalRadioCustom">';
  h+='<div class="fiscal-radio-dot'+(FISCAL.irpfMode==='custom'?' on':'')+'"></div><span>Personalizado (debe ser &gt;15%)</span></div>';
  h+='</div>';
  h+='<div class="fiscal-custom-row" id="fiscalCustomRow" style="'+(FISCAL.irpfMode==='custom'?'':'display:none')+'">';
  h+='<label style="font-size:.8rem;color:var(--text-muted)">Tipo:</label>';
  h+='<input class="fiscal-pct-input" id="fiscalPctInput" type="number" min="15.01" max="50" step="0.1" value="'+(FISCAL.irpfMode==='custom'?FISCAL.irpfPct:21)+'">';
  h+='<span style="font-size:.8rem;color:var(--text-muted)">%</span>';
  h+='<span class="fiscal-error" id="fiscalPctError" style="display:none">Debe ser &gt;15%</span>';
  h+='</div></div>';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Gastos de dif&#237;cil justificaci\u00f3n</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Reducci\u00f3n sobre la base imponible para el c\u00e1lculo de la declaraci\u00f3n IRPF (est. directa simplificada). Tope legal: 2.000\u20ac/a\u00f1o.</div>';
  h+='<div class="econ-gastos-dificil-row">';
  h+='<span style="font-size:.82rem;color:var(--text-muted);flex:1">% sobre base imponible:</span>';
  h+='<input class="econ-gastos-dificil-input" id="gastosDificilInput" type="number" min="0" max="15" step="0.5" value="'+GASTOS_DIFICIL_PCT+'">';
  h+='<span style="font-size:.82rem;color:var(--text-muted)">%</span>';
  h+='</div></div>';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Tramos IRPF \u2014 Declaraci\u00f3n de la renta</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Tramos combinados (estatal + Comunidad de Madrid) 2025. Los l\u00edmites de ambas escalas no coinciden, por lo que se generan sub-tramos en cada cambio de tipo. Se aplican sobre la base reducida.</div>';
  h+='<div style="overflow-x:auto"><table class="fiscal-bracket-table" id="fiscalBracketTable">';
  h+='<thead><tr><th style="text-align:left">Desde (&#8364;)</th><th>Hasta (&#8364;)</th><th>Tipo (%)</th><th></th></tr></thead><tbody>';
  for(var i=0;i<brackets.length;i++){
    var b=brackets[i];
    h+='<tr data-bi="'+i+'">';
    h+='<td><input class="fiscal-bracket-input fbi-from" data-bi="'+i+'" type="number" min="0" value="'+b.from+'"></td>';
    h+='<td><input class="fiscal-bracket-input fbi-to" data-bi="'+i+'" type="number" min="0" value="'+(b.to===Infinity?'':b.to)+'"></td>';
    h+='<td><input class="fiscal-bracket-input fiscal-pct-small fbi-pct" data-bi="'+i+'" type="number" min="0" max="100" step="0.1" value="'+b.pct+'"></td>';
    h+='<td><button class="fiscal-bracket-del fbi-del" data-bi="'+i+'">&#10005;</button></td>';
    h+='</tr>';
  }
  h+='</tbody></table></div>';
  h+='<button class="fiscal-add-btn" id="fiscalAddBracket">+ A\u00f1adir tramo</button>';
  h+='</div>';
  h+='<button class="econ-toggle-btn" id="fiscalRestore" style="margin-bottom:8px;color:var(--text-muted)">&#8635; Restaurar tramos Madrid 2025 por defecto</button>';
  return h;
}

/* ── Tab Gastos Desgravables (antes "Ingresos y Gastos") ── */
function renderFiscalTabGastosDesg(){
  var h=_renderCopyYearBtn();
  /* Ingresos desgravables (plan de pensiones, etc.) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title income">Ingresos desgravables</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Plan de pensiones y similares — reducen la base imponible del IRPF.</div>';
  h+='<div id="fiscalIngresosDesgList">'+_renderIngresosDesgList()+'</div>';
  h+='</div>';
  /* Gastos desgravables (rojo) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title expense">Gastos Desgravables</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Gastos recurrentes: cotizaciones SS, asesor\u00eda, hipoteca, suministros, etc.</div>';
  h+='<div id="fiscalGastosList">'+renderGastosList()+'</div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-expense" id="fiscalAddGasto">+ A\u00f1adir gasto</button>';
  h+='</div>';
  /* Compras / Gastos profesionales (rojo) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title expense">Compras y Gastos Profesionales</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:6px">Gastos anuales deducibles como aut\u00f3nomo: equipamiento, material, formaci\u00f3n, software, etc.</div>';
  h+='<div class="fiscal-despacho-toggle-row" style="margin-bottom:8px;padding-bottom:8px">';
  h+='<span class="fiscal-despacho-toggle-lbl">Activar desgravaci\u00f3n de IVA soportado</span>';
  h+='<div class="fiscal-onoff'+(COMPRAS_IVA_ENABLED?' on':'')+'" id="comprasIvaToggle">'+(COMPRAS_IVA_ENABLED?'ON':'OFF')+'</div>';
  h+='</div>';
  h+='<div style="font-size:.7rem;color:var(--text-dim);margin-bottom:6px">Importes <b>sin IVA</b> por defecto. Activa \u201cCon IVA\u201d por item para que la app calcule autom\u00e1ticamente la base y el IVA soportado (Mod.303).</div>';
  h+='<div id="fiscalComprasList">'+renderComprasList()+'</div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-expense" id="fiscalAddCompra">+ A\u00f1adir compra</button>';
  h+='</div>';
  return h;
}

/* ── renderComprasList ────────────────────────────────────── */
function renderComprasList(){
  var h='';
  var totalBase=comprasTotal();
  var totalIva=COMPRAS_IVA_ENABLED?comprasIvaTotal(null):0;
  COMPRAS_ITEMS.forEach(function(c,i){
    var isFixed=DEFAULT_COMPRAS.some(function(d){return d.id===c.id;});
    var base=(c.ivaIncluded&&c.ivaPct>0&&c.amount)?Math.round(c.amount/(1+c.ivaPct/100)*100)/100:c.amount||0;
    var iva=c.ivaIncluded&&c.amount?Math.round((c.amount-base)*100)/100:0;
    h+='<div class="fiscal-gasto-item fiscal-compras-item" data-ci="'+i+'">';
    h+='<div class="fiscal-compras-toggle'+(c.enabled?' on':'')+'" data-ctgl="'+i+'">'+(c.enabled?'&#10003;':'')+'</div>';
    if(isFixed){
      h+='<span class="fiscal-gasto-lbl">'+escHtml(c.label)+'</span>';
    }else{
      h+='<input class="fiscal-gasto-lbl-input" data-ci="'+i+'" data-cfield="label" value="'+escHtml(c.label)+'" placeholder="Nombre...">';
    }
    h+='<input class="fiscal-gasto-amt" data-ci="'+i+'" data-cfield="amount" type="number" min="0" step="1" value="'+(c.amount||0)+'" placeholder="0">';
    h+='<span class="fiscal-gasto-period-static">/a\u00f1o</span>';
    if(!isFixed){h+='<button class="fiscal-gasto-del fiscal-compras-del" data-ci="'+i+'">&#10005;</button>';}
    else{h+='<span style="width:22px"></span>';}
    h+='</div>';
    /* Sub-fila IVA (siempre visible para poder activar por item) */
    h+='<div class="fiscal-compras-iva-row" data-ci="'+i+'">';
    h+='<span class="fiscal-compras-iva-lbl">Con IVA incluido:</span>';
    h+='<div class="fiscal-compras-iva-tgl'+(c.ivaIncluded?' on':'')+'" data-civtgl="'+i+'">'+(c.ivaIncluded?'S\u00ed':'No')+'</div>';
    if(c.ivaIncluded){
      h+='<select class="fiscal-compras-iva-pct" data-ci="'+i+'" data-cfield="ivaPct">';
      [4,10,21].forEach(function(p){h+='<option value="'+p+'"'+(c.ivaPct===p?' selected':'')+'>'+p+'%</option>';});
      h+='</select>';
      h+='<select class="fiscal-compras-iva-qtr" data-ci="'+i+'" data-cfield="quarter">';
      h+='<option value=""'+(c.quarter===null?' selected':'')+'>Anual</option>';
      [1,2,3,4].forEach(function(q){h+='<option value="'+q+'"'+(c.quarter===q?' selected':'')+'>T'+q+'</option>';});
      h+='</select>';
      if(c.amount>0){
        h+='<span class="fiscal-compras-iva-calc">Base: <b>'+fcPlain(base)+'</b> · IVA: <b style="color:var(--c-orange)">'+fcPlain(iva)+'</b></span>';
      }
    }
    h+='</div>';
  });
  if(totalBase>0){
    var totH='<div class="fiscal-compras-total">Base deducible: <b>'+fcPlain(totalBase)+'</b>';
    if(COMPRAS_IVA_ENABLED&&totalIva>0)totH+=' · IVA soportado anual: <b style="color:var(--c-orange)">'+fcPlain(totalIva)+'</b>';
    totH+='</div>';
    h+=totH;
  }
  if(!COMPRAS_ITEMS.length)h+='<div style="font-size:.75rem;color:var(--text-dim);padding:6px 0">Sin compras configuradas.</div>';
  return h;
}

/* ── Tab IRPF y Deducciones (con sub-tabs) ────────────────── */
function renderFiscalTabIrpfDeduc(){
  var h='<div class="econ-sub-tabs">';
  h+='<button class="econ-sub-tab'+(FISCAL_IRPF_SUB==='desgrav'?' active':'')+'" data-firsub="desgrav">Desgravaciones</button>';
  h+='<button class="econ-sub-tab'+(FISCAL_IRPF_SUB==='irpf'?' active':'')+'" data-firsub="irpf">Config IRPF</button>';
  h+='<button class="econ-sub-tab'+(FISCAL_IRPF_SUB==='despacho'?' active':'')+'" data-firsub="despacho">Despacho</button>';
  h+='</div>';
  if(FISCAL_IRPF_SUB==='irpf')h+=renderFiscalTabIrpf();
  else if(FISCAL_IRPF_SUB==='despacho')h+=renderFiscalTabDespachoOnly();
  else h+=renderFiscalTabDesgrav();
  return h;
}

/* ── Tab Desgravaciones ──────────────────────────────────── */
function renderFiscalTabDesgrav(){
  var dg=computeTotalDesgrav();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title" style="color:var(--c-green)">Desgravaciones IRPF \u2014 Declaraci\u00f3n de la Renta</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:10px">Partidas que reducen la base imponible o la cuota IRPF. Los items con <em>&#128279;</em> se calculan desde tus gastos.</div>';
  var _dgParts=[];
  if(dg.base>0)_dgParts.push('Base: <b>'+fcPlain(dg.base)+'</b>');
  if(dg.quota>0)_dgParts.push('Cuota: <b>'+fcPlain(dg.quota)+'</b>');
  if(_dgParts.length){h+='<div class="fiscal-desgrav-total">'+_dgParts.join(' \u00b7 ')+'</div>';}
  if(DESGRAV_ITEMS.length){
    h+='<div id="fiscalDesgravList">'+renderDesgravList(DESGRAV_ITEMS,'all')+'</div>';
  } else {
    h+='<div id="fiscalDesgravList">'+renderDesgravList([],'all')+'</div>';
  }
  h+='<button class="fiscal-add-btn" id="fiscalAddDesgrav">+ A\u00f1adir desgravaci\u00f3n</button>';
  h+='</div>';
  /* Sección informativa: gastos del hogar deducibles vía despacho */
  h+=renderDesgravDespachoInfo();
  return h;
}

function renderDesgravDespachoInfo(){
  var prop=_despachoGetPct();
  var propPct=Math.round(prop*1000)/10;
  var dd=DESPACHO.deducciones||{amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
  var GROUP_CASA_DESP=['comunidad','seg_hogar']; /* hipoteca excluida → usar hipotecaIntereses */
  var GROUP_UTIL_DESP=['luz','gas','agua','digi'];
  var ibiRealDesp=gastoAnual('ibi');
  var ibiLabel=ibiRealDesp>0?'IBI (real)':'IBI estimado';
  var ibiAmt=ibiRealDesp>0?Math.round(ibiRealDesp*prop*100)/100:Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100;
  var casaItems=[],utilItems=[];
  GASTOS_ITEMS.forEach(function(g){
    var a=gastoAnual(g.id);
    if(a<=0)return;
    if(GROUP_CASA_DESP.indexOf(g.id)!==-1)casaItems.push({label:g.label,annual:a,ded:Math.round(a*prop*100)/100,pctLabel:propPct.toFixed(1)+'%'});
    else if(GROUP_UTIL_DESP.indexOf(g.id)!==-1)utilItems.push({label:g.label,annual:a,ded:Math.round(a*prop*0.30*100)/100,pctLabel:propPct.toFixed(1)+'% \u00d7 30%'});
  });
  var vcInfo=DESPACHO.valorCatastral||0, vcpInfo=DESPACHO.valorCompra||0;
  var baseAmortInfo=0;
  if(vcInfo>0&&vcpInfo>0){baseAmortInfo=Math.max(vcInfo,vcpInfo);}else if(vcpInfo>0){baseAmortInfo=vcpInfo;}else if(vcInfo>0){baseAmortInfo=vcInfo;}
  var amort=Math.round(baseAmortInfo*0.80*0.03*prop*100)/100;
  var hipIntInfo=Math.round((DESPACHO.hipotecaIntereses||0)*prop*100)/100;
  var hasItems=ibiAmt>0||casaItems.length>0||utilItems.length>0||amort>0||hipIntInfo>0;
  if(!hasItems||prop<=0)return '';
  function _dedCard(name,annual,pctLabel,ded,borderColor,extra,toggleKey){
    var on=!toggleKey||dd[toggleKey]!==false;
    var c='<div class="fiscal-ded-card'+(on?'':' disabled')+'" style="border-left-color:'+borderColor+'">';
    c+='<div class="fiscal-ded-card-header">';
    if(toggleKey)c+='<div class="fiscal-ded-mini-toggle'+(on?' on':'')+'" data-dedtgl="'+toggleKey+'">'+(on?'&#10003;':'')+'</div>';
    c+='<div class="fiscal-ded-card-name">'+name+'</div>';
    c+='</div>';
    if(on){
      c+='<div class="fiscal-ded-card-vals">';
      c+='<span class="fiscal-ded-card-annual">'+annual+'</span>';
      c+='<span class="fiscal-ded-card-pct">\u00d7 '+pctLabel+'</span>';
      c+='<span class="fiscal-ded-card-amount">'+fcPlain(ded)+'</span>';
      c+='</div>';
      if(extra)c+='<div class="fiscal-ded-card-extra">'+extra+'</div>';
    }
    c+='</div>';
    return c;
  }
  var h='<div class="fiscal-section fiscal-desgrav-despacho-section">';
  h+='<div class="fiscal-section-title" style="color:var(--accent-bright)">\uD83C\uDFE0 Deducciones por despacho en casa ('+propPct.toFixed(1)+'%)</div>';
  h+='<div style="font-size:.7rem;color:var(--text-dim);margin-bottom:6px">Partidas deducibles en proporci\u00f3n al % del despacho sobre la vivienda.</div>';
  h+='<div class="fiscal-ded-cards">';
  if(amort>0)h+=_dedCard('Amortizaci\u00f3n (80% construc.)',fcPlain(Math.round(baseAmortInfo*0.80*100)/100),'3% \u00d7 '+propPct.toFixed(1)+'%',amort,'#c084fc','<button class="fiscal-link-btn fiscal-desp-link" data-link-tab="despacho-sub" style="font-size:.62rem;color:var(--accent-bright);background:none;border:none;cursor:pointer;padding:0">&#128279; Despacho</button><div style="font-size:.6rem;color:var(--text-dim);margin-top:2px">Gasto deducible como aut\u00f3nomo (proporci\u00f3n despacho).</div>','amortizacion');
  if(ibiAmt>0)h+=_dedCard(ibiLabel,ibiRealDesp>0?fcPlain(ibiRealDesp):'est.',propPct.toFixed(1)+'%',ibiAmt,'#6c8cff',null,'ibi');
  if(hipIntInfo>0)h+=_dedCard('Intereses hipoteca',fcPlain(DESPACHO.hipotecaIntereses),propPct.toFixed(1)+'%',hipIntInfo,'#fb923c','<span style="font-size:.6rem;color:var(--text-dim)">Intereses del a\u00f1o '+FISCAL_YEAR+' de </span><button class="fiscal-link-btn fiscal-desp-link" data-link-tab="despacho-tab" style="font-size:.62rem;color:var(--accent-bright);background:none;border:none;cursor:pointer;padding:0">&#128279; Hipoteca</button><div style="font-size:.6rem;color:var(--text-dim);margin-top:2px">&lt;30 a\u00f1os Madrid (hipoteca \u22652023): ded. adicional 25% intereses totales, l\u00edm. 1.031\u20ac/a\u00f1o.</div>','hipotecaInt');
  casaItems.forEach(function(it){h+=_dedCard(escHtml(it.label),fcPlain(it.annual),it.pctLabel,it.ded,'#34d399',null,'casa');});
  utilItems.forEach(function(it){h+=_dedCard(escHtml(it.label),fcPlain(it.annual),it.pctLabel,it.ded,'#2dd4bf',null,'suministros');});
  h+='</div>';
  var total=computeDespachoDeduccion();
  if(total>0)h+='<div class="fiscal-desgrav-despacho-total">Total deducci\u00f3n estimada despacho: <b>'+fcPlain(total)+'</b></div>';
  h+='</div>';
  return h;
}

function renderDesgravList(items,listType){
  var h='';
  if(!items||!items.length)return h;
  items.forEach(function(item){
    var i=DESGRAV_ITEMS.indexOf(item);
    var efectiva=desgravAnual(item);
    var isFixed=DESGRAV_DEFAULT.some(function(d){return d.id===item.id;});
    var isQuota=(item.type||'base')==='quota';
    var hasLink=!!item.gastoLink;
    var linkedAmt=0,linkedLabel='';
    if(hasLink){
      if(item.gastoLink==='_compras_total'){
        linkedAmt=comprasTotal();
        linkedLabel='Compras profesionales';
      }else{
        linkedAmt=gastoAnual(item.gastoLink);
        var g=findGasto(item.gastoLink);
        linkedLabel=g?g.label:item.gastoLink;
      }
    }
    h+='<div class="fiscal-desgrav-item'+(item.enabled?' on':'')+'" data-di="'+i+'">';
    h+='<div class="fiscal-desgrav-toggle'+(item.enabled?' on':'')+'" data-dtgl="'+i+'">'+(item.enabled?'&#10003;':'')+'</div>';
    h+='<div class="fiscal-desgrav-body">';
    h+='<div class="fiscal-desgrav-row1">';
    if(isFixed){
      h+='<span class="fiscal-desgrav-lbl">'+escHtml(item.label)+'</span>';
    }else{
      h+='<input class="fiscal-desgrav-lbl-input" data-di="'+i+'" data-difield="label" value="'+escHtml(item.label)+'" placeholder="Nombre...">';
    }
    if(item.limit!==null&&item.limit!==undefined){
      h+='<span class="fiscal-desgrav-limit">l\u00edm. '+item.limit+'\u20ac</span>';
    }
    h+='</div>';
    h+='<div class="fiscal-desgrav-row2">';
    if(hasLink){
      if(linkedAmt>0){
        var p=(item.pct!=null?item.pct:100);
        h+='<span class="fiscal-desgrav-from-gasto fiscal-desgrav-link" data-link-gasto="'+escHtml(item.gastoLink)+'">&#128279; '+escHtml(linkedLabel)+': '+fcPlain(linkedAmt)+(p!==100?' \u00d7 '+p+'%':'')+'</span>';
      }else{
        h+='<span class="fiscal-desgrav-from-gasto dim fiscal-desgrav-link" data-link-gasto="'+escHtml(item.gastoLink)+'">&#128279; '+escHtml(linkedLabel)+' — sin importe en gastos</span>';
      }
    }else{
      h+='<input class="fiscal-desgrav-amt" data-di="'+i+'" type="number" min="0" step="1" value="'+(item.amount||0)+'" placeholder="\u20ac/a\u00f1o">';
    }
    if(efectiva>0){
      if(isQuota&&item.notaPct){
        var dedQuota=Math.round(efectiva*item.notaPct/100*100)/100;
        h+='<span class="fiscal-desgrav-eff">\u2192 ded. '+fcPlain(dedQuota)+'</span>';
      }else{
        var capado=!hasLink&&item.limit&&item.amount>item.limit;
        h+='<span class="fiscal-desgrav-eff'+(capado?' capped':'')+'">&#8594; '+fcPlain(efectiva)+'</span>';
      }
    }
    h+='</div>';
    if(item.note){
      h+='<div class="fiscal-desgrav-note">'+item.note+'</div>';
    }
    h+='</div>';
    if(!isFixed){h+='<button class="fiscal-gasto-del fiscal-desgrav-del" data-di="'+i+'">&#10005;</button>';}
    h+='</div>';
  });
  return h;
}

/* ── Helper: effective rate considering vinculaciones ──────── */
function _hipEffRate(tipoBase,vinc){
  var r=tipoBase;
  if(vinc){['nomina','segHogar','segSalud','segVida'].forEach(function(k){if(vinc[k]&&vinc[k].enabled)r-=(vinc[k].reduccion||0);});}
  return Math.max(0,r);
}
/* ── Build switch-points from comp.subrogaciones ─────────── */
function _buildMortgageSwitches(comp){
  /* Returns sorted array of {monthOffset, rate, cuota, balance} */
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var switches=[];
  var subs=comp.subrogaciones||[];
  subs.forEach(function(sub){
    if(!sub||!sub.fecha||!sub.nuevoImporte||!sub.nuevoTipoInteres||!sub.nuevoPlazoAnios)return;
    var sp=sub.fecha.split('-');
    var sY=parseInt(sp[0],10),sM=parseInt(sp[1],10)-1;
    var mo=(sY-startY)*12+(sM-startM);
    if(mo<0)return;
    var tipoEf=_hipEffRate(sub.nuevoTipoInteres,sub.vinculaciones);
    var rr=tipoEf/100/12,nn=sub.nuevoPlazoAnios*12;
    var cuota=rr>0?sub.nuevoImporte*rr*Math.pow(1+rr,nn)/(Math.pow(1+rr,nn)-1):sub.nuevoImporte/nn;
    switches.push({monthOffset:mo,rate:rr,cuota:cuota,balance:sub.nuevoImporte,plazoMeses:nn});
  });
  switches.sort(function(a,b){return a.monthOffset-b.monthOffset;});
  return switches;
}
/* ── Cálculo intereses hipotecarios por año (multi-subrogación) ── */
function _computeAnnualInterest(comp,year){
  if(!comp||!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios)return 0;
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var tipoEf=_hipEffRate(comp.tipoInteres,comp.vinculaciones);
  var r=tipoEf/100/12;
  var nTotal=comp.plazoAnios*12;
  var cuota=r>0?comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1):comp.importePrestamo/nTotal;
  var balance=comp.importePrestamo;
  var interesesYear=0;
  var switches=_buildMortgageSwitches(comp);
  var switchIdx=0;
  var maxMonths=nTotal+360; /* extra for subrogaciones extending */
  for(var m=0;m<maxMonths;m++){
    var curY=startY+Math.floor((startM+m)/12);
    if(curY>year)break;
    /* Apply switch if we've reached the next subrogation */
    while(switchIdx<switches.length&&m>=switches[switchIdx].monthOffset){
      balance=switches[switchIdx].balance;
      r=switches[switchIdx].rate;
      cuota=switches[switchIdx].cuota;
      switchIdx++;
    }
    if(balance<=0)break;
    var interesMes=balance*r;
    var capital=cuota-interesMes;
    if(capital>balance){capital=balance;interesMes=cuota-capital;}
    if(curY===year)interesesYear+=interesMes;
    balance-=capital;
    if(balance<0.01)balance=0;
  }
  return Math.round(interesesYear*100)/100;
}
/* ── Obtener saldo vivo a una fecha dada (multi-subrogación) ── */
function _computeBalanceAtDate(comp,dateStr){
  if(!comp||!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios||!dateStr)return 0;
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var dp=dateStr.split('-');
  var dY=parseInt(dp[0],10),dM=parseInt(dp[1],10)-1;
  var targetMonth=(dY-startY)*12+(dM-startM);
  if(targetMonth<=0)return comp.importePrestamo;
  var tipoEf=_hipEffRate(comp.tipoInteres,comp.vinculaciones);
  var r=tipoEf/100/12;
  var nTotal=comp.plazoAnios*12;
  var cuota=r>0?comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1):comp.importePrestamo/nTotal;
  var balance=comp.importePrestamo;
  var switches=_buildMortgageSwitches(comp);
  var switchIdx=0;
  for(var m=0;m<targetMonth;m++){
    while(switchIdx<switches.length&&m>=switches[switchIdx].monthOffset){
      balance=switches[switchIdx].balance;
      r=switches[switchIdx].rate;
      cuota=switches[switchIdx].cuota;
      switchIdx++;
    }
    if(balance<=0)break;
    var interes=balance*r;
    var capital=cuota-interes;
    if(capital>balance)capital=balance;
    balance-=capital;
    if(balance<0.01){balance=0;break;}
  }
  return Math.round(balance*100)/100;
}

/* ── Tab Despacho (sub-tab dentro de IRPF y Deducciones) ──── */
function renderFiscalTabDespachoOnly(){
  var pctShow=DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0
    ?Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10
    :DESPACHO.pct;
  var comp=DESPACHO.compra||_defaultCompra();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Despacho en casa \u2014 Deducci\u00f3n IRPF</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:12px">Configura el espacio dedicado al trabajo. Los m\u00b2 y el % se sincronizan autom\u00e1ticamente entre s\u00ed.</div>';
  h+='<div class="fiscal-despacho-toggle-row">';
  h+='<span class="fiscal-despacho-toggle-lbl">Activar deducci\u00f3n despacho</span>';
  h+='<div class="fiscal-onoff'+(DESPACHO.enabled?' on':'')+'" id="despachoToggle">'+(DESPACHO.enabled?'ON':'OFF')+'</div>';
  h+='</div>';
  h+='<div class="fiscal-despacho-grid">';
  h+=_despField('m2Total','M\u00b2 totales de la casa',DESPACHO.m2Total,'m\u00b2');
  h+=_despField('m2Despacho','M\u00b2 del despacho',DESPACHO.m2Despacho,'m\u00b2');
  h+=_despField('pct','% del despacho (se sincroniza con m\u00b2)',pctShow,'%');
  h+=_despFieldMoney('valorCatastral','Valor catastral del inmueble',DESPACHO.valorCatastral);
  /* Auto-calcular intereses si hay datos suficientes */
  var _autoInt=_computeAnnualInterest(comp,FISCAL_YEAR);
  if(_autoInt>0&&!DESPACHO.hipotecaInteresesManual){DESPACHO.hipotecaIntereses=_autoInt;saveDespacho();}
  var _intLabel='Intereses hipotecarios anuales ('+FISCAL_YEAR+')';
  if(_autoInt>0){
    _intLabel+=DESPACHO.hipotecaInteresesManual?' \u2014 <span style="font-size:.65rem;color:var(--c-orange)">manual</span>':' \u2014 <span style="font-size:.65rem;color:var(--c-green)">calculado</span>';
  }
  h+=_despFieldMoney('hipotecaIntereses',_intLabel,DESPACHO.hipotecaIntereses);
  if(DESPACHO.hipotecaInteresesManual&&_autoInt>0){
    h+='<div style="font-size:.66rem;color:var(--text-dim);padding:0 4px 4px"><button class="fiscal-link-btn" id="despRecalcInt" style="font-size:.66rem;color:var(--accent-bright);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0">\u21bb Recalcular ('+fcPlain(_autoInt)+')</button></div>';
  }
  /* Explanation: how interest is calculated + monthly avg */
  if(_autoInt>0){
    var intMes=Math.round(_autoInt/12*100)/100;
    var tipoEfCalc=_hipEffRate(comp.tipoInteres,comp.vinculaciones);
    var subs=comp.subrogaciones||[];
    var lastSub=subs.length>0?subs[subs.length-1]:null;
    h+='<div style="font-size:.64rem;color:var(--text-dim);padding:4px;background:var(--surface2);border-radius:var(--radius-sm);margin-top:4px">';
    h+='<div>\uD83D\uDCA1 <b>Media mensual intereses: '+fcPlain(intMes)+'\u20ac/mes</b></div>';
    h+='<div style="margin-top:2px">C\u00e1lculo: simulaci\u00f3n mes a mes del pr\u00e9stamo (amortizaci\u00f3n francesa), sumando los intereses de cada cuota mensual del a\u00f1o '+FISCAL_YEAR+'.</div>';
    if(lastSub&&lastSub.fecha){
      var sp=lastSub.fecha.split('-');
      var sY=parseInt(sp[0],10);
      if(sY<=FISCAL_YEAR){
        h+='<div style="margin-top:2px">Incluye subrogaci\u00f3n ('+lastSub.fecha.split('-').reverse().join('/')+') con tipo efectivo '+_hipEffRate(lastSub.nuevoTipoInteres,lastSub.vinculaciones).toFixed(2)+'%.</div>';
      }
    } else {
      h+='<div style="margin-top:2px">Tipo efectivo: '+tipoEfCalc.toFixed(2)+'%'+(tipoEfCalc!==comp.tipoInteres?' (nominal '+comp.tipoInteres.toFixed(2)+'% \u2212 vinculaciones)':'')+'</div>';
    }
    h+='</div>';
  }
  h+='</div>';
  h+='</div>';
  return h;
}

/* ── Tab Hipoteca ─────────────────────────────────────────── */
/* Get the active (latest) mortgage data */
function _getActiveMortgage(comp){
  var subs=comp.subrogaciones||[];
  if(subs.length===0)return{importe:comp.importePrestamo,tipo:comp.tipoInteres,plazo:comp.plazoAnios,fecha:comp.fechaInicio,banco:comp.entidadBanco,vinc:comp.vinculaciones,idx:-1};
  var last=subs[subs.length-1];
  return{importe:last.nuevoImporte,tipo:last.nuevoTipoInteres,plazo:last.nuevoPlazoAnios,fecha:last.fecha,banco:last.entidadBanco,vinc:last.vinculaciones,idx:subs.length-1};
}
/* Format duration as "Xa Ym" */
function _fmtDuration(meses){
  if(meses<=0)return '0m';
  var a=Math.floor(meses/12),m=meses%12;
  return (a>0?a+'a ':'')+(m>0?m+'m':'');
}
/* Period card for Resumen sub-tab */
function _hipPeriodCard(comp,subIdx,isActive,startDate,endDate){
  var importe,tipo,plazo,banco,vinc,label;
  if(subIdx<0){
    importe=comp.importePrestamo;tipo=comp.tipoInteres;plazo=comp.plazoAnios;banco=comp.entidadBanco;vinc=comp.vinculaciones;label='Pr\u00e9stamo original';
  } else {
    var sub=comp.subrogaciones[subIdx];
    importe=sub.nuevoImporte;tipo=sub.nuevoTipoInteres;plazo=sub.nuevoPlazoAnios;banco=sub.entidadBanco;vinc=sub.vinculaciones;label='Subrogaci\u00f3n '+(subIdx+1);
  }
  if(!importe||!tipo||!plazo)return '';
  var tipoEf=_hipEffRate(tipo,vinc);
  var r=tipoEf/100/12,n=plazo*12;
  var cuota=r>0?Math.round(importe*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)*100)/100:Math.round(importe/n*100)/100;
  /* Tiempo pagado/restante */
  var hoy=new Date();
  var mPagados=0,mRestantes=0;
  if(startDate){
    var sp=startDate.split('-');
    mPagados=Math.max(0,(hoy.getFullYear()-parseInt(sp[0],10))*12+(hoy.getMonth()-(parseInt(sp[1],10)-1)));
    if(endDate){
      var ep=endDate.split('-');
      var mEnd=(parseInt(ep[0],10)-parseInt(sp[0],10))*12+(parseInt(ep[1],10)-parseInt(sp[1],10));
      mPagados=Math.min(mPagados,mEnd);
      mRestantes=0; /* this period ended */
    } else {
      mRestantes=Math.max(0,n-mPagados);
    }
  }
  var saldoVivo=0,intAnual=0;
  if(isActive&&comp.fechaInicio){
    var todayStr=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-01';
    saldoVivo=_computeBalanceAtDate(comp,todayStr);
    intAnual=_computeAnnualInterest(comp,FISCAL_YEAR);
  }
  var h='<div class="hip-period-card">';
  h+='<div class="hip-period-hdr"><span class="hip-period-title">'+label+(banco?' \u2014 '+escHtml(banco):'')+'</span>';
  h+='<span class="hip-period-badge'+(isActive?' active':'')+'">'+( isActive?'Vigente':'Finalizada')+'</span></div>';
  h+='<div class="hip-period-cuota"><span class="hip-period-cuota-val">'+fcPlain(cuota)+'</span><span class="hip-period-cuota-lbl">\u20ac/mes</span></div>';
  h+='<div class="hip-period-info">'+tipoEf.toFixed(2)+'% '+(tipoEf!==tipo?'(nominal '+tipo.toFixed(2)+'%)':' fijo')+' \u00b7 '+plazo+' a\u00f1os \u00b7 '+_fmtMiles(importe)+' \u20ac</div>';
  if(startDate){
    h+='<div class="hip-period-info">';
    h+=startDate.split('-').reverse().join('/')+(endDate?' \u2192 '+endDate.split('-').reverse().join('/'):' \u2192 hoy');
    h+=' \u00b7 pagado: '+_fmtDuration(mPagados);
    if(mRestantes>0)h+=' \u00b7 restante: '+_fmtDuration(mRestantes);
    h+='</div>';
  }
  /* Stats for active mortgage */
  if(isActive){
    h+='<div class="hip-stats" style="margin-top:6px">';
    if(saldoVivo>0){var pctA=Math.round((1-saldoVivo/importe)*100);h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-green)">'+_fmtMiles(saldoVivo)+' \u20ac</span><span class="hip-stat-lbl">Saldo vivo ('+pctA+'%)</span></div>';}
    if(intAnual>0)h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-orange)">'+fcPlain(intAnual)+'</span><span class="hip-stat-lbl">Intereses '+FISCAL_YEAR+'</span></div>';
    h+='</div>';
  }
  h+='<button class="hip-period-btn" data-gotosection="'+(subIdx<0?'prestamo':'sub-'+subIdx)+'">Ver Detalle</button>';
  h+='</div>';
  return h;
}
/* ── Hip edit field helpers (reused in edit mode) ────────── */
function _hipMoney(id,label,val){
  return '<div class="hip-cf"><label class="hip-cf-lbl">'+label+'</label>'
    +'<div class="hip-cf-row"><input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="1000" value="'+(val||0)+'"><span class="fiscal-despacho-unit">\u20ac</span></div>'
    +'<div class="fiscal-despacho-money-fmt" id="desp-fmt-'+id+'">'+(val&&val>0?_fmtMiles(val)+' \u20ac':'')+'</div></div>';
}
function _hipNum(id,label,val,unit){
  var step=unit==='%'?'0.05':'1';
  return '<div class="hip-cf"><label class="hip-cf-lbl">'+label+'</label>'
    +'<div class="hip-cf-row"><input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="'+step+'" value="'+(val||0)+'"><span class="fiscal-despacho-unit">'+unit+'</span></div></div>';
}
function _hipDate(id,label,val){
  return '<div class="hip-cf"><label class="hip-cf-lbl">'+label+'</label>'
    +'<div class="hip-cf-row"><input class="fiscal-despacho-input" id="desp-'+id+'" type="date" value="'+(val||'')+'"></div></div>';
}
function _hipText(id,label,val,ph){
  return '<div class="hip-cf hip-cf-wide"><label class="hip-cf-lbl">'+label+'</label>'
    +'<input class="fiscal-despacho-input" id="desp-'+id+'" type="text" value="'+escHtml(val||'')+'" placeholder="'+(ph||'')+'" style="text-align:left"></div>';
}
function _hipVinc(id,label,data){
  if(!data)data={enabled:false,costeAnual:0,reduccion:0};
  var isNom=id.indexOf('Nomina')!==-1;
  var h='<div class="hip-vr">';
  h+='<span class="hip-vr-lbl">'+label+'</span>';
  h+='<div class="hip-vr-right">';
  if(data.enabled){
    if(!isNom)h+='<input class="hip-vr-inp" id="'+id+'Coste" type="number" min="0" step="10" value="'+(data.costeAnual||0)+'" title="\u20ac/a\u00f1o">';
    h+='<input class="hip-vr-inp hip-vr-pct" id="'+id+'Reduccion" type="number" min="0" step="0.05" value="'+(data.reduccion||0)+'" title="\u2212 tipo %">';
  }
  h+='<div class="fiscal-onoff'+(data.enabled?' on':'')+'" id="'+id+'Toggle">'+(data.enabled?'ON':'OFF')+'</div>';
  h+='</div></div>';
  return h;
}
function _hipVincSum(vinc,tipoBase){
  var total=0,reduc=0;
  if(!vinc)return '';
  ['nomina','segHogar','segSalud','segVida'].forEach(function(k){if(vinc[k]&&vinc[k].enabled){total+=vinc[k].costeAnual||0;reduc+=vinc[k].reduccion||0;}});
  if(!total&&!reduc)return '';
  var h='<div class="hip-vinc-summary">';
  if(total>0)h+='Coste: <b style="color:var(--c-orange)">'+fcPlain(total)+'</b>/a';
  if(reduc>0){
    h+=(total>0?' \u00b7 ':'')+'<b style="color:var(--c-green)">\u2212'+reduc.toFixed(2)+'%</b>';
    if(tipoBase>0)h+=' \u2192 <b style="color:var(--c-green)">'+Math.max(0,tipoBase-reduc).toFixed(2)+'%</b>';
  }
  h+='</div>';
  return h;
}
/* ── Read-only helpers ─────────────────────────────────────── */
function _hipRO(label,val,unit){
  return '<div class="hip-ro-row"><span class="hip-ro-lbl">'+label+'</span><span class="hip-ro-val">'+(val!=null?val:'')+(unit?' '+unit:'')+'</span></div>';
}
function _hipROmoney(label,val){
  return _hipRO(label,val&&val>0?_fmtMiles(val)+' \u20ac':'\u2014');
}
function _hipROvinc(label,data){
  if(!data||!data.enabled)return '<div class="hip-ro-vinc"><span class="hip-ro-vinc-lbl">'+label+'</span><span class="hip-ro-vinc-off">OFF</span></div>';
  var isNom=label.indexOf('\u00f3mina')!==-1;
  var h='<div class="hip-ro-vinc"><span class="hip-ro-vinc-lbl">'+label+'</span><span class="hip-ro-vinc-vals">';
  if(!isNom&&data.costeAnual)h+=_fmtMiles(data.costeAnual)+'\u20ac ';
  if(data.reduccion)h+='\u2212'+data.reduccion.toFixed(2)+'%';
  h+='</span></div>';
  return h;
}

/* ── Resumen sub-tab ──────────────────────────────────────── */
function _renderHipResumen(){
  var comp=DESPACHO.compra||_defaultCompra();
  var h='';
  if(!comp.importePrestamo){
    h+='<div style="text-align:center;padding:30px;color:var(--text-dim);font-size:.75rem">Configura los datos de hipoteca en la pesta\u00f1a <b>Detalle</b>.</div>';
    return h;
  }
  /* Compra summary */
  var totalCompra=(comp.valorCompraTotal||0)+(comp.itpMadrid||0)+(comp.notariaRegistro||0)+(comp.tasacion||0)+(comp.reformas||0)+(comp.inmobiliaria||0);
  if(totalCompra>0){
    h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">\uD83C\uDFE0 Inversi\u00f3n vivienda: <b style="color:var(--accent-bright)">'+_fmtMiles(totalCompra)+' \u20ac</b></div>';
  }
  /* Build periods */
  var subs=comp.subrogaciones||[];
  var periods=[];
  /* Original mortgage */
  var origEnd=subs.length>0&&subs[0].fecha?subs[0].fecha:null;
  periods.push({subIdx:-1,start:comp.fechaInicio,end:origEnd,isActive:subs.length===0});
  /* Each subrogation */
  for(var i=0;i<subs.length;i++){
    var nextEnd=(i<subs.length-1&&subs[i+1].fecha)?subs[i+1].fecha:null;
    periods.push({subIdx:i,start:subs[i].fecha,end:nextEnd,isActive:i===subs.length-1});
  }
  for(var p=0;p<periods.length;p++){
    h+=_hipPeriodCard(comp,periods[p].subIdx,periods[p].isActive,periods[p].start,periods[p].end);
  }
  /* Ver análisis button */
  /* Gas/Electricidad summary cards */
  var gas=DESPACHO.gas||{};
  var elc=DESPACHO.elect||{};
  if(gas.precioKwh||gas.cuotaFija||elc.precioKwh){
    h+='<div style="font-size:.72rem;color:var(--text-dim);margin:12px 0 6px;font-weight:600">\uD83D\uDCE6 Facturas</div>';
    if(gas.precioKwh||gas.cuotaFija){
      h+='<div class="hip-period-card">';
      h+='<div class="hip-period-hdr"><span class="hip-period-title">\uD83D\uDD25 Gas'+(gas.comercializadora?' \u2014 '+escHtml(gas.comercializadora):'')+'</span></div>';
      if(gas.modo==='fijo')h+='<div class="hip-period-info">Cuota fija: <b>'+fcPlain(gas.cuotaFija)+'\u20ac/mes</b></div>';
      else h+='<div class="hip-period-info">Precio: <b>'+(gas.precioKwh||0).toFixed(4)+' \u20ac/kWh</b></div>';
      if(gas.terminoFijo)h+='<div class="hip-period-info">T\u00e9rmino fijo: '+fcPlain(gas.terminoFijo)+'\u20ac/mes</div>';
      h+='<button class="hip-period-btn" data-hipsub="gas">Ver Detalle</button></div>';
    }
    if(elc.precioKwh){
      h+='<div class="hip-period-card">';
      h+='<div class="hip-period-hdr"><span class="hip-period-title">\u26A1 Electricidad'+(elc.comercializadora?' \u2014 '+escHtml(elc.comercializadora):'')+'</span></div>';
      var potTxt=elc.modoPotencia==='doble'?'P1: '+elc.potenciaP1+'kW ('+(elc.precioPotP1||0).toFixed(6)+') + P2: '+elc.potenciaP2+'kW ('+(elc.precioPotP2||0).toFixed(6)+')':elc.potenciaTotal+'kW ('+(elc.precioPotP1||0).toFixed(6)+')';
      h+='<div class="hip-period-info">Potencia: <b>'+potTxt+'</b> \u20ac/kW/d\u00eda</div>';
      if(elc.modoPotencia==='doble')h+='<div class="hip-period-info">Suma precios: <b>'+((elc.precioPotP1||0)+(elc.precioPotP2||0)).toFixed(6)+' \u20ac/kW/d\u00eda</b></div>';
      h+='<div class="hip-period-info">Precio: <b>'+(elc.precioKwh||0).toFixed(4)+' \u20ac/kWh</b></div>';
      if(elc.terminoFijo)h+='<div class="hip-period-info">T\u00e9rmino fijo: '+fcPlain(elc.terminoFijo)+'\u20ac/mes</div>';
      h+='<button class="hip-period-btn" data-hipsub="elect">Ver Detalle</button></div>';
    }
  }
  h+='<button class="hip-add-sub-btn" id="hipGoAnalisis" style="border-style:solid;margin-top:4px">\uD83D\uDCC8 Ver An\u00e1lisis Hipoteca</button>';
  return h;
}

/* ── Detalle sub-tab ──────────────────────────────────────── */
function _renderHipDetalle(){
  var comp=DESPACHO.compra||_defaultCompra();
  var h='';
  /* Compra section */
  h+='<div class="fiscal-section" id="hip-section-compra">';
  h+=_renderHipSectionContent('compra',FISCAL_HIP_EDITING==='compra');
  h+='</div>';
  /* Préstamo section */
  h+='<div class="fiscal-section" id="hip-section-prestamo">';
  h+=_renderHipSectionContent('prestamo',FISCAL_HIP_EDITING==='prestamo');
  h+='</div>';
  /* Subrogaciones */
  var subs=comp.subrogaciones||[];
  for(var i=0;i<subs.length;i++){
    var sid='sub-'+i;
    h+='<div class="fiscal-section" id="hip-section-'+sid+'">';
    h+=_renderHipSectionContent(sid,FISCAL_HIP_EDITING===sid);
    h+='</div>';
  }
  /* Add subrogation button */
  h+='<button class="hip-add-sub-btn" id="hipAddSub">+ A\u00f1adir subrogaci\u00f3n</button>';
  /* Sobrecoste seguros vinculados */
  if(typeof _renderInsuranceOvercost==='function'){
    var insHtml=_renderInsuranceOvercost(comp);
    if(insHtml)h+='<div class="fiscal-section" style="margin-top:8px">'+insHtml+'</div>';
  }
  /* Precios referencia seguros */
  h+=_renderSegurosNormales();
  return h;
}

function _renderHipSectionContent(sectionId,isEditing){
  var comp=DESPACHO.compra||_defaultCompra();
  if(sectionId==='compra')return _renderCompraSection(comp,isEditing);
  if(sectionId==='prestamo')return _renderPrestamoSection(comp,isEditing);
  if(sectionId.indexOf('sub-')===0){
    var idx=parseInt(sectionId.substring(4),10);
    var sub=(comp.subrogaciones||[])[idx];
    if(sub)return _renderSubSection(comp,sub,idx,isEditing);
  }
  return '';
}

function _renderCompraSection(comp,isEditing){
  var h='<div class="hip-section-hdr"><span class="fiscal-section-title">\uD83C\uDFE0 Compra de vivienda</span>';
  if(!isEditing)h+='<button class="hip-edit-btn" data-editsection="compra">Editar</button>';
  h+='</div>';
  if(isEditing){
    h+='<div class="hip-g2">';
    h+=_hipMoney('compraValor','Valor escritura',comp.valorCompraTotal);
    h+=_hipMoney('compraItp','ITP Madrid (6%)',comp.itpMadrid);
    h+=_hipMoney('compraNotaria','Notar\u00eda y registro',comp.notariaRegistro);
    h+=_hipMoney('compraTasacion','Tasaci\u00f3n',comp.tasacion);
    h+=_hipMoney('compraReformas','Reformas',comp.reformas);
    h+=_hipMoney('compraInmobiliaria','Inmobiliaria',comp.inmobiliaria||0);
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-savesection="compra">Guardar cambios</button><button class="hip-cancel-btn" data-cancelsection="compra">Cancelar</button></div>';
  } else {
    h+='<div class="hip-ro-grid">';
    h+=_hipROmoney('Valor escritura',comp.valorCompraTotal);
    h+=_hipROmoney('ITP Madrid',comp.itpMadrid);
    h+=_hipROmoney('Notar\u00eda',comp.notariaRegistro);
    h+=_hipROmoney('Tasaci\u00f3n',comp.tasacion);
    h+=_hipROmoney('Reformas',comp.reformas);
    h+=_hipROmoney('Inmobiliaria',comp.inmobiliaria);
    h+='</div>';
    var total=(comp.valorCompraTotal||0)+(comp.itpMadrid||0)+(comp.notariaRegistro||0)+(comp.tasacion||0)+(comp.reformas||0)+(comp.inmobiliaria||0);
    if(total>0)h+='<div class="hip-section-total">Total: <b>'+_fmtMiles(total)+' \u20ac</b></div>';
  }
  return h;
}

function _renderPrestamoSection(comp,isEditing){
  var vinc=comp.vinculaciones||{nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
  var h='<div class="hip-section-hdr"><span class="fiscal-section-title">\uD83C\uDFE6 Pr\u00e9stamo original</span>';
  if(!isEditing)h+='<button class="hip-edit-btn" data-editsection="prestamo">Editar</button>';
  h+='</div>';
  if(isEditing){
    h+='<div class="hip-g2">';
    h+=_hipMoney('compraImporte','Importe',comp.importePrestamo);
    h+=_hipDate('compraFechaInicio','Fecha inicio',comp.fechaInicio);
    h+=_hipNum('compraTipo','Tipo inter\u00e9s',comp.tipoInteres,'%');
    h+=_hipNum('compraPlazo','Plazo',comp.plazoAnios,'a\u00f1os');
    h+=_hipText('entidadBanco','Banco',comp.entidadBanco,'Ej: CaixaBank...');
    h+='</div>';
    h+='<div style="font-size:.7rem;color:var(--text-dim);font-weight:600;margin:6px 0 2px">Vinculaciones</div>';
    h+='<div class="hip-vr-head"><span></span><span class="hip-vr-h">\u20ac/a\u00f1o</span><span class="hip-vr-h">\u2212tipo%</span><span></span></div>';
    h+=_hipVinc('vincNomina','N\u00f3mina',vinc.nomina);
    h+=_hipVinc('vincSegHogar','Seg. hogar',vinc.segHogar);
    h+=_hipVinc('vincSegSalud','Seg. salud',vinc.segSalud);
    h+=_hipVinc('vincSegVida','Seg. vida',vinc.segVida);
    h+=_hipVincSum(vinc,comp.tipoInteres);
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-savesection="prestamo">Guardar cambios</button><button class="hip-cancel-btn" data-cancelsection="prestamo">Cancelar</button></div>';
  } else {
    h+=_hipRO('Importe',comp.importePrestamo?_fmtMiles(comp.importePrestamo)+' \u20ac':'\u2014');
    h+=_hipRO('Tipo inter\u00e9s',comp.tipoInteres?comp.tipoInteres.toFixed(2)+'%':'\u2014');
    h+=_hipRO('Plazo',comp.plazoAnios?comp.plazoAnios+' a\u00f1os':'\u2014');
    h+=_hipRO('Fecha inicio',comp.fechaInicio?comp.fechaInicio.split('-').reverse().join('/'):'\u2014');
    h+=_hipRO('Banco',comp.entidadBanco||'\u2014');
    /* Cuota calculated */
    if(comp.importePrestamo>0&&comp.tipoInteres>0&&comp.plazoAnios>0){
      var tipoEf=_hipEffRate(comp.tipoInteres,vinc);
      var r=tipoEf/100/12,n=comp.plazoAnios*12;
      var cuota=r>0?Math.round(comp.importePrestamo*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)*100)/100:0;
      h+='<div class="hip-ro-row" style="margin-top:4px;border-top:1px solid var(--border);padding-top:4px"><span class="hip-ro-lbl">Cuota mensual</span><span class="hip-ro-val" style="font-size:.88rem;font-weight:700">'+fcPlain(cuota)+'</span></div>';
      if(tipoEf!==comp.tipoInteres)h+='<div style="font-size:.62rem;color:var(--c-green);text-align:right">Tipo efectivo: '+tipoEf.toFixed(2)+'%</div>';
    }
    /* Vinculaciones read-only */
    h+='<div style="font-size:.66rem;color:var(--text-dim);margin-top:6px;font-weight:600">Vinculaciones</div>';
    h+=_hipROvinc('N\u00f3mina',vinc.nomina);
    h+=_hipROvinc('Seg. hogar',vinc.segHogar);
    h+=_hipROvinc('Seg. salud',vinc.segSalud);
    h+=_hipROvinc('Seg. vida',vinc.segVida);
    h+=_hipVincSum(vinc,comp.tipoInteres);
  }
  return h;
}

function _renderSubSection(comp,sub,idx,isEditing){
  var pfx='sub'+idx;
  var h='<div class="hip-section-hdr"><span class="fiscal-section-title">\uD83D\uDD04 Subrogaci\u00f3n '+(idx+1)+(sub.entidadBanco?' \u2014 '+escHtml(sub.entidadBanco):'')+'</span>';
  if(!isEditing)h+='<button class="hip-edit-btn" data-editsection="sub-'+idx+'">Editar</button>';
  h+='</div>';
  if(isEditing){
    h+='<div class="hip-g2">';
    h+=_hipDate(pfx+'Fecha','Fecha subrogaci\u00f3n',sub.fecha);
    h+='<div></div>';
    h+=_hipMoney(pfx+'Comision','Com. cancelaci\u00f3n',sub.comisionCancelacion);
    h+=_hipMoney(pfx+'Notaria','Notar\u00eda',sub.notaria);
    h+=_hipMoney(pfx+'Tasacion','Tasaci\u00f3n',sub.tasacion);
    h+=_hipMoney(pfx+'Registro','Registro',sub.registro);
    h+='</div>';
    h+='<div class="hip-sub-heading">Nuevas condiciones</div>';
    h+='<div class="hip-g2">';
    h+=_hipMoney(pfx+'NuevoImporte','Capital pendiente',sub.nuevoImporte);
    h+='<div></div>';
    h+=_hipNum(pfx+'NuevoTipo','Tipo inter\u00e9s',sub.nuevoTipoInteres,'%');
    h+=_hipNum(pfx+'NuevoPlazo','Plazo',sub.nuevoPlazoAnios,'a\u00f1os');
    h+=_hipText(pfx+'EntidadBanco','Nuevo banco',sub.entidadBanco||'','Ej: ING...');
    h+='</div>';
    var sv=sub.vinculaciones||{nomina:{enabled:false,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0}};
    h+='<div class="hip-sub-heading">Vinculaciones</div>';
    h+='<div class="hip-vr-head"><span></span><span class="hip-vr-h">\u20ac/a\u00f1o</span><span class="hip-vr-h">\u2212tipo%</span><span></span></div>';
    h+=_hipVinc(pfx+'VincNomina','N\u00f3mina',sv.nomina);
    h+=_hipVinc(pfx+'VincSegVida','Seg. vida',sv.segVida);
    h+=_hipVinc(pfx+'VincSegSalud','Seg. salud',sv.segSalud);
    h+=_hipVinc(pfx+'VincSegHogar','Seg. hogar',sv.segHogar);
    h+=_hipVincSum(sv,sub.nuevoTipoInteres);
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-savesection="sub-'+idx+'">Guardar cambios</button><button class="hip-cancel-btn" data-cancelsection="sub-'+idx+'">Cancelar</button></div>';
  } else {
    h+=_hipRO('Fecha',sub.fecha?sub.fecha.split('-').reverse().join('/'):'\u2014');
    var costes=(sub.comisionCancelacion||0)+(sub.notaria||0)+(sub.tasacion||0)+(sub.registro||0);
    if(costes>0)h+=_hipROmoney('Costes cambio',costes);
    h+=_hipRO('Capital',sub.nuevoImporte?_fmtMiles(sub.nuevoImporte)+' \u20ac':'\u2014');
    h+=_hipRO('Tipo inter\u00e9s',sub.nuevoTipoInteres?sub.nuevoTipoInteres.toFixed(2)+'%':'\u2014');
    h+=_hipRO('Plazo',sub.nuevoPlazoAnios?sub.nuevoPlazoAnios+' a\u00f1os':'\u2014');
    h+=_hipRO('Banco',sub.entidadBanco||'\u2014');
    /* Cuota + tiempo restante */
    if(sub.nuevoImporte>0&&sub.nuevoTipoInteres>0&&sub.nuevoPlazoAnios>0){
      var sv2=sub.vinculaciones||{};
      var tipoEfS=_hipEffRate(sub.nuevoTipoInteres,sv2);
      var rs=tipoEfS/100/12,ns=sub.nuevoPlazoAnios*12;
      var cuotaS=rs>0?Math.round(sub.nuevoImporte*rs*Math.pow(1+rs,ns)/(Math.pow(1+rs,ns)-1)*100)/100:0;
      h+='<div class="hip-ro-row" style="margin-top:4px;border-top:1px solid var(--border);padding-top:4px"><span class="hip-ro-lbl">Cuota mensual</span><span class="hip-ro-val" style="font-size:.88rem;font-weight:700">'+fcPlain(cuotaS)+'</span></div>';
      if(tipoEfS!==sub.nuevoTipoInteres)h+='<div style="font-size:.62rem;color:var(--c-green);text-align:right">Tipo efectivo: '+tipoEfS.toFixed(2)+'%</div>';
      /* Tiempo restante */
      if(sub.fecha){
        var hoy=new Date();
        var fp=sub.fecha.split('-');
        var mPagados=Math.max(0,(hoy.getFullYear()-parseInt(fp[0],10))*12+(hoy.getMonth()-(parseInt(fp[1],10)-1)));
        var mRest=Math.max(0,ns-mPagados);
        h+=_hipRO('Tiempo pagado',_fmtDuration(mPagados));
        h+=_hipRO('Tiempo restante',_fmtDuration(mRest));
      }
    }
    /* Vinculaciones read-only */
    var sv3=sub.vinculaciones||{};
    h+='<div style="font-size:.66rem;color:var(--text-dim);margin-top:4px;font-weight:600">Vinculaciones</div>';
    h+=_hipROvinc('N\u00f3mina',sv3.nomina);
    h+=_hipROvinc('Seg. vida',sv3.segVida);
    h+=_hipROvinc('Seg. salud',sv3.segSalud);
    h+=_hipROvinc('Seg. hogar',sv3.segHogar);
    h+=_hipVincSum(sv3,sub.nuevoTipoInteres);
  }
  return h;
}

/* ── Main tab dispatcher ──────────────────────────────────── */
function renderFiscalTabDespacho(){
  var h='';
  h+='<div class="econ-sub-tabs" style="flex-wrap:wrap">';
  h+='<button class="econ-sub-tab'+(FISCAL_HIP_SUB==='resumen'?' active':'')+'" data-hipsub="resumen">Resumen</button>';
  h+='<button class="econ-sub-tab'+(FISCAL_HIP_SUB==='detalle'?' active':'')+'" data-hipsub="detalle">Detalle<br>Hipoteca</button>';
  h+='<button class="econ-sub-tab est-hip'+(FISCAL_HIP_SUB==='gas'?' active':'')+'" data-hipsub="gas">Detalle<br>Gas</button>';
  h+='<button class="econ-sub-tab est-hip'+(FISCAL_HIP_SUB==='elect'?' active':'')+'" data-hipsub="elect">Detalle<br>Elect.</button>';
  h+='</div>';
  if(FISCAL_HIP_SUB==='resumen')h+=_renderHipResumen();
  else if(FISCAL_HIP_SUB==='detalle')h+=_renderHipDetalle();
  else if(FISCAL_HIP_SUB==='gas')h+=_renderGasDetalle();
  else if(FISCAL_HIP_SUB==='elect')h+=_renderElectDetalle();
  return h;
}

/* ── Gas detail sub-tab (two scenarios: consumo + fijo) ──── */
var FISCAL_GAS_EDITING=null; /* null | 'consumo' | 'fijo' */
function _ensureGasScenarios(){
  var g=DESPACHO.gas;
  if(!g.consumo)g.consumo={precioKwh:g.precioKwh||0,terminoFijo:g.terminoFijo||0,comercializadora:g.comercializadora||''};
  if(!g.fijo)g.fijo={cuotaFija:g.cuotaFija||0,terminoFijo:g.terminoFijo||0,comercializadora:g.comercializadora||''};
  if(!g.activo)g.activo=g.modo||'consumo';
}
function _renderGasDetalle(){
  _ensureGasScenarios();
  var g=DESPACHO.gas;
  var h='';
  /* Active scenario selector */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">\uD83D\uDD25 Tarifa activa</div>';
  h+='<div style="display:flex;gap:6px">';
  h+='<button class="fiscal-onoff'+(g.activo==='consumo'?' on':'')+'" id="gasActivoConsumo">Por consumo</button>';
  h+='<button class="fiscal-onoff'+(g.activo==='fijo'?' on':'')+'" id="gasActivoFijo">Fijo mensual</button>';
  h+='</div></div>';
  /* Scenario 1: Consumo */
  var sc=g.consumo;
  h+='<div class="fiscal-section"'+(g.activo!=='consumo'?' style="opacity:.5"':'')+'>';
  h+='<div class="hip-section-hdr"><span class="fiscal-section-title">Escenario: Pago por consumo'+(g.activo==='consumo'?' \u2714':'')+'</span>';
  if(FISCAL_GAS_EDITING!=='consumo')h+='<button class="hip-edit-btn" data-gasedit="consumo">Editar</button>';
  h+='</div>';
  if(FISCAL_GAS_EDITING==='consumo'){
    h+='<div class="hip-g2">';
    h+=_hipNum('gasConsPrecio','Precio kWh',sc.precioKwh,'\u20ac/kWh');
    h+=_hipMoney('gasConsTfijo','T\u00e9rmino fijo/mes',sc.terminoFijo);
    h+=_hipText('gasConsComerc','Comercializadora',sc.comercializadora,'Ej: Naturgy...');
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-gassave="consumo">Guardar</button><button class="hip-cancel-btn" data-gascancel="consumo">Cancelar</button></div>';
  } else {
    h+=_hipRO('Precio kWh',sc.precioKwh?(sc.precioKwh).toFixed(4)+' \u20ac/kWh':'\u2014');
    h+=_hipROmoney('T\u00e9rmino fijo/mes',sc.terminoFijo);
    h+=_hipRO('Comercializadora',sc.comercializadora||'\u2014');
  }
  h+='</div>';
  /* Scenario 2: Fijo */
  var sf=g.fijo;
  h+='<div class="fiscal-section"'+(g.activo!=='fijo'?' style="opacity:.5"':'')+'>';
  h+='<div class="hip-section-hdr"><span class="fiscal-section-title">Escenario: Cuota fija'+(g.activo==='fijo'?' \u2714':'')+'</span>';
  if(FISCAL_GAS_EDITING!=='fijo')h+='<button class="hip-edit-btn" data-gasedit="fijo">Editar</button>';
  h+='</div>';
  if(FISCAL_GAS_EDITING==='fijo'){
    h+='<div class="hip-g2">';
    h+=_hipMoney('gasFijoCuota','Cuota fija/mes',sf.cuotaFija);
    h+=_hipMoney('gasFijoTfijo','T\u00e9rmino fijo/mes',sf.terminoFijo);
    h+=_hipText('gasFijoComerc','Comercializadora',sf.comercializadora,'Ej: Naturgy...');
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-gassave="fijo">Guardar</button><button class="hip-cancel-btn" data-gascancel="fijo">Cancelar</button></div>';
  } else {
    h+=_hipROmoney('Cuota fija/mes',sf.cuotaFija);
    h+=_hipROmoney('T\u00e9rmino fijo/mes',sf.terminoFijo);
    h+=_hipRO('Comercializadora',sf.comercializadora||'\u2014');
  }
  h+='</div>';
  return h;
}

/* ── Electricidad detail sub-tab ─────────────────────────── */
var FISCAL_ELECT_EDITING=false;
function _renderElectDetalle(){
  var e=DESPACHO.elect||{modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:6.6,precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''};
  var h='<div class="fiscal-section">';
  h+='<div class="hip-section-hdr"><span class="fiscal-section-title">\u26A1 Tarifa de Electricidad</span>';
  if(!FISCAL_ELECT_EDITING)h+='<button class="hip-edit-btn" id="electEditBtn">Editar</button>';
  h+='</div>';
  if(FISCAL_ELECT_EDITING){
    h+='<div style="margin-bottom:8px"><span class="hip-cf-lbl">Modo potencia</span>';
    h+='<div style="display:flex;gap:6px;margin-top:4px">';
    h+='<button class="fiscal-onoff'+(e.modoPotencia==='doble'?' on':'')+'" id="electModoDoble">P1 + P2</button>';
    h+='<button class="fiscal-onoff'+(e.modoPotencia==='simple'?' on':'')+'" id="electModoSimple">Total</button>';
    h+='</div></div>';
    h+='<div class="hip-g2">';
    if(e.modoPotencia==='doble'){
      h+=_hipNum('electP1','Potencia punta (P1)',e.potenciaP1,'kW');
      h+=_hipNum('electPrecioPotP1','Precio potencia P1',e.precioPotP1||0,'\u20ac/kW/d\u00eda');
      h+=_hipNum('electP2','Potencia valle (P2)',e.potenciaP2,'kW');
      h+=_hipNum('electPrecioPotP2','Precio potencia P2',e.precioPotP2||0,'\u20ac/kW/d\u00eda');
      var sumPrecios=((e.precioPotP1||0)+(e.precioPotP2||0)).toFixed(6);
      h+=_hipNum('electTotalPrecio','Suma precios (auto)',parseFloat(sumPrecios),'\u20ac/kW/d\u00eda');
    } else {
      h+=_hipNum('electTotal','Potencia contratada',e.potenciaTotal,'kW');
      h+=_hipNum('electPrecioPotP1','Precio potencia',e.precioPotP1||0,'\u20ac/kW/d\u00eda');
    }
    h+=_hipNum('electPrecioKwh','Precio kWh',e.precioKwh,'\u20ac/kWh');
    h+=_hipMoney('electTerminoFijo','T\u00e9rmino fijo/mes',e.terminoFijo);
    h+=_hipText('electComerc','Comercializadora',e.comercializadora,'Ej: Endesa...');
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" id="electSaveBtn">Guardar cambios</button><button class="hip-cancel-btn" id="electCancelBtn">Cancelar</button></div>';
  } else {
    if(e.modoPotencia==='doble'){
      h+=_hipRO('Potencia P1 (punta)',e.potenciaP1?e.potenciaP1+' kW':'\u2014');
      h+=_hipRO('Precio P1',(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d\u00eda');
      h+=_hipRO('Potencia P2 (valle)',e.potenciaP2?e.potenciaP2+' kW':'\u2014');
      h+=_hipRO('Precio P2',(e.precioPotP2||0).toFixed(6)+' \u20ac/kW/d\u00eda');
      h+=_hipRO('Suma precios potencia',((e.precioPotP1||0)+(e.precioPotP2||0)).toFixed(6)+' \u20ac/kW/d\u00eda');
    } else {
      h+=_hipRO('Potencia contratada',e.potenciaTotal?e.potenciaTotal+' kW':'\u2014');
      h+=_hipRO('Precio potencia',(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d\u00eda');
    }
    h+=_hipRO('Precio kWh',e.precioKwh?e.precioKwh.toFixed(4)+' \u20ac/kWh':'\u2014');
    h+=_hipROmoney('T\u00e9rmino fijo/mes',e.terminoFijo);
    h+=_hipRO('Comercializadora',e.comercializadora||'\u2014');
  }
  h+='</div>';
  return h;
}

/* ── Precios normales de seguros (config) ────────────────── */
function _renderSegurosNormales(){
  var sn=DESPACHO.segurosNormales||{segSalud:0,segVida:0,segHogar:0};
  var h='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">\uD83D\uDCCB Precios referencia seguros</div>';
  h+='<div style="font-size:.68rem;color:var(--text-dim);margin-bottom:6px">Precio que consideras normal para comparar con seguros vinculados a la hipoteca.</div>';
  h+='<div class="hip-g2">';
  h+=_hipMoney('segNormalSalud','Seg. salud (anual)',sn.segSalud);
  h+=_hipMoney('segNormalVida','Seg. vida (anual)',sn.segVida);
  h+=_hipMoney('segNormalHogar','Seg. hogar (anual)',sn.segHogar);
  h+='</div>';
  h+='</div>';
  return h;
}

function _vincRow(id,label,data){
  if(!data)data={enabled:false,costeAnual:0,reduccion:0};
  var isNomina=id.indexOf('Nomina')!==-1;
  var h='<div class="fiscal-vinc-row">';
  h+='<div class="fiscal-despacho-toggle-row" style="margin-bottom:0">';
  h+='<span class="fiscal-despacho-toggle-lbl" style="font-size:.76rem">'+label+'</span>';
  h+='<div class="fiscal-onoff'+(data.enabled?' on':'')+'" id="'+id+'Toggle">'+(data.enabled?'ON':'OFF')+'</div>';
  h+='</div>';
  if(data.enabled){
    h+='<div class="fiscal-vinc-cost">';
    h+='<div style="display:flex;gap:8px;align-items:flex-end">';
    if(!isNomina){
      h+='<div><label class="fiscal-despacho-label" style="font-size:.68rem">Coste anual \u20ac</label>';
      h+='<input class="fiscal-despacho-input" id="'+id+'Coste" type="number" min="0" step="10" value="'+(data.costeAnual||0)+'" style="width:90px"></div>';
    }
    h+='<div><label class="fiscal-despacho-label" style="font-size:.68rem">Reducci\u00f3n tipo %</label>';
    h+='<input class="fiscal-despacho-input fiscal-vinc-reduccion" id="'+id+'Reduccion" type="number" min="0" step="0.05" value="'+(data.reduccion||0)+'" style="width:75px"></div>';
    h+='</div></div>';
  }
  h+='</div>';
  return h;
}

function _despFieldDate(id,label,val){
  return '<div class="fiscal-despacho-field">'
    +'<label class="fiscal-despacho-label">'+label+'</label>'
    +'<div class="fiscal-despacho-input-row">'
    +'<input class="fiscal-despacho-input" id="desp-'+id+'" type="date" value="'+(val||'')+'" style="width:auto">'
    +'</div>'
    +'</div>';
}

function _despField(id,label,val,unit){
  return '<div class="fiscal-despacho-field">'
    +'<label class="fiscal-despacho-label">'+label+'</label>'
    +'<div class="fiscal-despacho-input-row">'
    +'<input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="'+(unit==='%'?'0.1':'1')+'" value="'+(val||0)+'">'
    +'<span class="fiscal-despacho-unit">'+unit+'</span>'
    +'</div>'
    +'</div>';
}
/* Campo monetario con step=1000 y display del valor formateado con puntos (estilo español) */
function _fmtMiles(n){
  if(!n||n===0)return '0';
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}
function _despFieldMoney(id,label,val){
  var formatted=val&&val>0?_fmtMiles(val):'0';
  return '<div class="fiscal-despacho-field">'
    +'<label class="fiscal-despacho-label">'+label+'</label>'
    +'<div class="fiscal-despacho-input-row">'
    +'<input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="1000" value="'+(val||0)+'">'
    +'<span class="fiscal-despacho-unit">\u20ac</span>'
    +'</div>'
    +'<div class="fiscal-despacho-money-fmt" id="desp-fmt-'+id+'">'+(val&&val>0?formatted+' \u20ac':'')+'</div>'
    +'</div>';
}

/* ── renderGastosList ─────────────────────────────────────── */
function _renderIngresosDesgList(){
  var h='';
  GASTOS_ITEMS.forEach(function(g,i){
    if(g.id!=='plan_pension')return;
    h+='<div class="fiscal-gasto-item" data-gi="'+i+'">';
    h+='<span class="fiscal-gasto-lbl">'+g.label+'</span>';
    h+='<input class="fiscal-gasto-amt" data-gi="'+i+'" data-gfield="amount" type="number" min="0" step="1" value="'+(g.amount||0)+'">';
    h+='<span class="fiscal-gasto-period-static">/a\u00f1o</span>';
    h+='<span style="width:22px"></span>';
    h+='</div>';
  });
  return h;
}
var GASTOS_GROUPS=[
  {label:'Aut\u00f3nomo',ids:['cot_social','asesoria']},
  {label:'Seguros',ids:['seg_baja','seg_salud','seg_vida','otros_seg']},
  {label:'Casa',ids:['hipoteca','ibi','comunidad','seg_hogar','gas','luz','digi','agua']},
  {label:'Otros',ids:['donaciones']}
];
function _renderGastoItem(g,i){
  var isFixed=DEFAULT_GASTOS.some(function(d){return d.id===g.id;});
  var h='<div class="fiscal-gasto-item" data-gi="'+i+'">';
  if(isFixed){h+='<span class="fiscal-gasto-lbl">'+g.label+'</span>';}
  else{h+='<input class="fiscal-gasto-lbl-input" data-gi="'+i+'" data-gfield="label" value="'+escHtml(g.label)+'" placeholder="Nombre...">';}
  h+='<input class="fiscal-gasto-amt" data-gi="'+i+'" data-gfield="amount" type="number" min="0" step="1" value="'+(g.amount||0)+'">';
  h+='<div class="fiscal-gasto-period">';
  h+='<button class="fiscal-period-btn'+(g.period==='monthly'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="monthly">/mes</button>';
  h+='<button class="fiscal-period-btn'+(g.period==='annual'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="annual">/a\u00f1o</button>';
  h+='</div>';
  if(!isFixed){h+='<button class="fiscal-gasto-del" data-gi="'+i+'">&#10005;</button>';}
  else{h+='<span style="width:22px"></span>';}
  h+='</div>';
  return h;
}
function renderGastosList(){
  var h='';var rendered={};
  GASTOS_GROUPS.forEach(function(grp){
    var gh='';
    grp.ids.forEach(function(id){
      for(var i=0;i<GASTOS_ITEMS.length;i++){
        if(GASTOS_ITEMS[i].id===id){gh+=_renderGastoItem(GASTOS_ITEMS[i],i);rendered[i]=true;break;}
      }
    });
    if(gh)h+='<div class="fiscal-gastos-group-hdr">'+grp.label+'</div>'+gh;
  });
  var custom='';
  GASTOS_ITEMS.forEach(function(g,i){
    if(g.id==='plan_pension'||rendered[i])return;
    custom+=_renderGastoItem(g,i);
  });
  if(custom)h+='<div class="fiscal-gastos-group-hdr">Personalizado</div>'+custom;
  return h;
}

/* ── openFiscal / closeFiscal ─────────────────────────────── */
function openFiscal(){
  FISCAL_YEAR=CY;
  loadPersonalYear(FISCAL_YEAR);
  loadGastosYear(FISCAL_YEAR);
  var ov=document.getElementById('fiscalOverlay');
  document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindFiscalEvents();});});
}
function closeFiscal(){
  var ov=document.getElementById('fiscalOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}
/* Re-render fiscal overlay preserving scroll position */
function reRenderFiscal(){
  var body=document.querySelector('#fiscalOverlay .sy-body');
  var scrollTop=body?body.scrollTop:0;
  document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
  bindFiscalEvents();
  var newBody=document.querySelector('#fiscalOverlay .sy-body');
  if(newBody)newBody.scrollTop=scrollTop;
}

/* ── bindFiscalEvents ─────────────────────────────────────── */
function bindFiscalEvents(){
  document.getElementById('fiscalBack').addEventListener('click',function(){closeFiscal();});
  bindNavBar('econ',closeFiscal);

  function _switchTab(tab){
    FISCAL_TAB=tab;
    if(tab==='personal')loadPersonalYear(FISCAL_YEAR);
    if(tab==='gastos_desg')loadGastosYear(FISCAL_YEAR);
    reRenderFiscal();
  }
  document.getElementById('fiscalTabPersonal').addEventListener('click',function(){_switchTab('personal');});
  document.getElementById('fiscalTabGastosDesg').addEventListener('click',function(){_switchTab('gastos_desg');});
  document.getElementById('fiscalTabIrpfDeduc').addEventListener('click',function(){_switchTab('irpf_deduc');});
  document.getElementById('fiscalTabDespacho').addEventListener('click',function(){_switchTab('despacho');});

  document.getElementById('fiscalSave').addEventListener('click',function(){_saveFiscalAll();});

  /* Year selector bindings (shared by personal + gastos_desg + irpf_deduc) */
  if(FISCAL_TAB==='personal'||FISCAL_TAB==='gastos_desg'||FISCAL_TAB==='irpf_deduc')_bindYearSelector();

  if(FISCAL_TAB==='personal')_bindTabPersonal();
  else if(FISCAL_TAB==='gastos_desg')_bindTabGastosDesg();
  else if(FISCAL_TAB==='irpf_deduc')_bindTabIrpfDeduc();
  else if(FISCAL_TAB==='despacho')_bindTabDespacho();
}

function _bindYearSelector(){
  var prev=document.getElementById('fiscalYearPrev');
  var next=document.getElementById('fiscalYearNext');
  if(prev)prev.addEventListener('click',function(){
    FISCAL_YEAR--;
    if(FISCAL_TAB==='personal')loadPersonalYear(FISCAL_YEAR);
    else{loadGastosYear(FISCAL_YEAR);if(typeof loadCompras==='function')loadCompras();}
    reRenderFiscal();
  });
  if(next)next.addEventListener('click',function(){
    FISCAL_YEAR++;
    if(FISCAL_TAB==='personal')loadPersonalYear(FISCAL_YEAR);
    else{loadGastosYear(FISCAL_YEAR);if(typeof loadCompras==='function')loadCompras();}
    reRenderFiscal();
  });
  /* Copy year buttons */
  document.querySelectorAll('.fiscal-copy-year-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var srcYear=parseInt(btn.dataset.copyYear,10);
      if(!srcYear)return;
      if(!confirm('¿Copiar datos de '+srcYear+' al año '+FISCAL_YEAR+'?'))return;
      if(FISCAL_TAB==='personal'){
        loadPersonalYear(srcYear);
        savePersonalYear(FISCAL_YEAR);
        loadPersonalYear(FISCAL_YEAR);
      }else{
        loadGastosYear(srcYear);
        saveGastosYear(FISCAL_YEAR);
        loadGastosYear(FISCAL_YEAR);
      }
      reRenderFiscal();
      showToast('Datos de '+srcYear+' copiados','success');
    });
  });
}

function _bindTabPersonal(){
  /* Event delegation for all sections */
  var fCont=document.getElementById('fiscalContent');
  var body=fCont?fCont.querySelector('.sy-body'):null;
  if(!body||body._personalDel)return;
  body._personalDel=true;
  /* Add buttons — preserve scroll position */
  body.addEventListener('click',function(e){
    var addBtn=e.target.closest('[data-padd]');
    if(addBtn){
      var sec=addBtn.dataset.padd;
      var isWeekly=sec==='gastosSemanales';
      var isViaje=addBtn.dataset.viaje==='1';
      var newItem={id:sec+'_'+Date.now(),label:isViaje?'Viaje':'',amount:0};
      if(isWeekly)newItem.period='weekly';
      else newItem.period=isViaje?'annual':'monthly';
      if(isViaje){newItem._viaje=true;newItem.viajeFilter='all';}
      PERSONAL_DATA[sec].push(newItem);
      reRenderFiscal();
      return;
    }
    /* Delete */
    var del=e.target.closest('.fiscal-personal-del');
    if(del){
      var sec=del.dataset.ps,pi=parseInt(del.dataset.pi,10);
      if(PERSONAL_DATA[sec])PERSONAL_DATA[sec].splice(pi,1);
      reRenderFiscal();
      return;
    }
    /* Period toggle */
    var per=e.target.closest('.fiscal-period-btn[data-pf="period"]');
    if(per){
      var sec=per.dataset.ps,pi=parseInt(per.dataset.pi,10);
      if(PERSONAL_DATA[sec]&&PERSONAL_DATA[sec][pi]){
        PERSONAL_DATA[sec][pi].period=per.dataset.val;
        per.closest('.fiscal-gasto-period').querySelectorAll('.fiscal-period-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===per.dataset.val);});
      }
    }
  });
  body.addEventListener('change',function(e){
    var el=e.target;
    var sec=el.dataset.ps,pi=parseInt(el.dataset.pi,10),field=el.dataset.pf;
    if(!sec||isNaN(pi)||!PERSONAL_DATA[sec]||!PERSONAL_DATA[sec][pi])return;
    if(field==='amount'){var v=parseFloat(el.value);PERSONAL_DATA[sec][pi].amount=isNaN(v)?0:v;}
    else if(field==='label'){PERSONAL_DATA[sec][pi].label=el.value||'';}
    else if(field==='viajeFilter'){PERSONAL_DATA[sec][pi].viajeFilter=el.value||'all';}
  });
}

function _bindTabIrpf(){
  document.getElementById('fiscalRadioFixed').addEventListener('click',function(){
    FISCAL.irpfMode='fixed';
    document.getElementById('fiscalRadioFixed').classList.add('active');
    document.getElementById('fiscalRadioFixed').querySelector('.fiscal-radio-dot').classList.add('on');
    document.getElementById('fiscalRadioCustom').classList.remove('active');
    document.getElementById('fiscalRadioCustom').querySelector('.fiscal-radio-dot').classList.remove('on');
    document.getElementById('fiscalCustomRow').style.display='none';
  });
  document.getElementById('fiscalRadioCustom').addEventListener('click',function(){
    FISCAL.irpfMode='custom';
    document.getElementById('fiscalRadioCustom').classList.add('active');
    document.getElementById('fiscalRadioCustom').querySelector('.fiscal-radio-dot').classList.add('on');
    document.getElementById('fiscalRadioFixed').classList.remove('active');
    document.getElementById('fiscalRadioFixed').querySelector('.fiscal-radio-dot').classList.remove('on');
    document.getElementById('fiscalCustomRow').style.display='flex';
  });
  var gdInput=document.getElementById('gastosDificilInput');
  if(gdInput)gdInput.addEventListener('change',function(){
    var v=parseFloat(this.value);
    if(v>=0&&v<=15)GASTOS_DIFICIL_PCT=v;
  });
  document.getElementById('fiscalRestore').addEventListener('click',function(){
    FISCAL.brackets=null;
    reRenderFiscal();
  });
  document.getElementById('fiscalAddBracket').addEventListener('click',function(){
    var brackets=getBrackets().slice();
    var last=brackets[brackets.length-1];
    brackets.push({from:last.to===Infinity?300000:last.to,to:Infinity,pct:47});
    FISCAL.brackets=brackets;
    reRenderFiscal();
  });
  document.querySelectorAll('.fbi-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var bi=parseInt(this.dataset.bi,10);
      var brackets=getBrackets().slice();
      if(brackets.length<=1){showToast('Debe haber al menos 1 tramo','error');return;}
      brackets.splice(bi,1);
      FISCAL.brackets=brackets;
      reRenderFiscal();
    });
  });
}

function _bindTabGastosDesg(){
  /* Gastos: event delegation */
  var gastosList=document.getElementById('fiscalGastosList');
  if(gastosList&&!gastosList._del){
    gastosList._del=true;
    gastosList.addEventListener('click',function(e){
      var btn=e.target.closest('.fiscal-period-btn[data-gfield="period"]');
      if(btn){
        var gi=parseInt(btn.dataset.gi,10);
        GASTOS_ITEMS[gi].period=btn.dataset.val;
        btn.closest('.fiscal-gasto-period').querySelectorAll('.fiscal-period-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===btn.dataset.val);});
        return;
      }
      var del=e.target.closest('.fiscal-gasto-del');
      if(del&&del.dataset.gi!==undefined){
        GASTOS_ITEMS.splice(parseInt(del.dataset.gi,10),1);
        document.getElementById('fiscalGastosList').innerHTML=renderGastosList();
      }
    });
    gastosList.addEventListener('change',function(e){
      var el=e.target;var gi=parseInt(el.dataset.gi,10);if(isNaN(gi))return;
      var field=el.dataset.gfield;
      if(field==='amount'){var v=parseFloat(el.value);GASTOS_ITEMS[gi].amount=isNaN(v)?0:v;}
      else if(field==='label'){GASTOS_ITEMS[gi].label=el.value||'Gasto';}
    });
  }
  /* Ingresos desgravables (plan_pension) */
  var ingList=document.getElementById('fiscalIngresosDesgList');
  if(ingList&&!ingList._del){
    ingList._del=true;
    ingList.addEventListener('change',function(e){
      var el=e.target;var gi=parseInt(el.dataset.gi,10);if(isNaN(gi))return;
      if(el.dataset.gfield==='amount'){var v=parseFloat(el.value);GASTOS_ITEMS[gi].amount=isNaN(v)?0:v;}
    });
  }
  document.getElementById('fiscalAddGasto').addEventListener('click',function(){
    GASTOS_ITEMS.push({id:'custom_'+Date.now(),label:'Nuevo gasto',amount:0,period:'monthly'});
    document.getElementById('fiscalGastosList').innerHTML=renderGastosList();
  });
  /* Toggle global IVA compras */
  var civTog=document.getElementById('comprasIvaToggle');
  if(civTog)civTog.addEventListener('click',function(){
    COMPRAS_IVA_ENABLED=!COMPRAS_IVA_ENABLED;
    this.textContent=COMPRAS_IVA_ENABLED?'ON':'OFF';
    this.classList.toggle('on',COMPRAS_IVA_ENABLED);
    document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
    _rebindComprasDel();
  });
  /* Compras: event delegation */
  function _rebindComprasDel(){
    var comprasList=document.getElementById('fiscalComprasList');
    if(!comprasList||comprasList._del)return;
    comprasList._del=true;
    comprasList.addEventListener('click',function(e){
      var tgl=e.target.closest('[data-ctgl]');
      if(tgl){
        var ci=parseInt(tgl.dataset.ctgl,10);
        COMPRAS_ITEMS[ci].enabled=!COMPRAS_ITEMS[ci].enabled;
        document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
        return;
      }
      var civtgl=e.target.closest('[data-civtgl]');
      if(civtgl){
        var ci=parseInt(civtgl.dataset.civtgl,10);
        COMPRAS_ITEMS[ci].ivaIncluded=!COMPRAS_ITEMS[ci].ivaIncluded;
        document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
        return;
      }
      var del=e.target.closest('.fiscal-compras-del');
      if(del){
        COMPRAS_ITEMS.splice(parseInt(del.dataset.ci,10),1);
        document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
      }
    });
    comprasList.addEventListener('change',function(e){
      var el=e.target;var ci=parseInt(el.dataset.ci,10);if(isNaN(ci))return;
      var field=el.dataset.cfield;
      if(field==='amount'){var v=parseFloat(el.value);COMPRAS_ITEMS[ci].amount=isNaN(v)?0:v;document.getElementById('fiscalComprasList').innerHTML=renderComprasList();}
      else if(field==='label'){COMPRAS_ITEMS[ci].label=el.value||'Compra';}
      else if(field==='ivaPct'){var p=parseInt(el.value,10);COMPRAS_ITEMS[ci].ivaPct=isNaN(p)?21:p;document.getElementById('fiscalComprasList').innerHTML=renderComprasList();}
      else if(field==='quarter'){var q=el.value===''?null:parseInt(el.value,10);COMPRAS_ITEMS[ci].quarter=isNaN(q)?null:q;document.getElementById('fiscalComprasList').innerHTML=renderComprasList();}
    });
  }
  _rebindComprasDel();
  document.getElementById('fiscalAddCompra').addEventListener('click',function(){
    COMPRAS_ITEMS.push({id:'compra_'+Date.now(),label:'Nueva compra',amount:0,enabled:true,ivaIncluded:false,ivaPct:21,quarter:null});
    document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
    _rebindComprasDel();
  });
}

function _bindTabIrpfDeduc(){
  /* Sub-tab clicks */
  document.querySelectorAll('[data-firsub]').forEach(function(btn){
    btn.addEventListener('click',function(){
      FISCAL_IRPF_SUB=btn.dataset.firsub;
      reRenderFiscal();
    });
  });
  if(FISCAL_IRPF_SUB==='irpf')_bindTabIrpf();
  else if(FISCAL_IRPF_SUB==='despacho')_bindTabDespachoOnly();
  else _bindTabDesgrav();
}

function _bindTabDesgrav(){
  /* Delegación unificada para ambas listas */
  function _bindList(containerId){
    var list=document.getElementById(containerId);
    if(!list||list._del)return;
    list._del=true;
    list.addEventListener('click',function(e){
      var tgl=e.target.closest('[data-dtgl]');
      if(tgl){
        var di=parseInt(tgl.dataset.dtgl,10);
        DESGRAV_ITEMS[di].enabled=!DESGRAV_ITEMS[di].enabled;
        reRenderFiscal();
        return;
      }
      var del=e.target.closest('.fiscal-desgrav-del');
      if(del){
        var di=parseInt(del.dataset.di,10);
        DESGRAV_ITEMS.splice(di,1);
        reRenderFiscal();
        return;
      }
      var lnk=e.target.closest('.fiscal-desgrav-link');
      if(lnk){
        var gastoId=lnk.dataset.linkGasto;
        if(gastoId==='_compras_total'){
          FISCAL_TAB='gastos_desg';reRenderFiscal();
          setTimeout(function(){var el=document.getElementById('fiscalComprasList');if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('fiscal-highlight');setTimeout(function(){el.classList.remove('fiscal-highlight');},1500);}},80);
        }else{
          FISCAL_TAB='gastos_desg';reRenderFiscal();
          setTimeout(function(){
            for(var gi=0;gi<GASTOS_ITEMS.length;gi++){
              if(GASTOS_ITEMS[gi].id===gastoId){
                var el=document.querySelector('.fiscal-gasto-item[data-gi="'+gi+'"]');
                if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('fiscal-highlight');setTimeout(function(){el.classList.remove('fiscal-highlight');},1500);}
                break;
              }
            }
          },80);
        }
      }
    });
    list.addEventListener('change',function(e){
      var el=e.target;
      var di=parseInt(el.dataset.di,10);if(isNaN(di))return;
      var field=el.dataset.difield;
      if(el.classList.contains('fiscal-desgrav-amt')){
        var v=parseFloat(el.value);DESGRAV_ITEMS[di].amount=isNaN(v)?0:v;
        reRenderFiscal();
      }else if(field==='label'){DESGRAV_ITEMS[di].label=el.value||'Desgravaci\u00f3n';}
    });
  }
  _bindList('fiscalDesgravList');
  _bindList('fiscalDesgravListQuota');
  document.getElementById('fiscalAddDesgrav').addEventListener('click',function(){
    DESGRAV_ITEMS.push({id:'desgrav_'+Date.now(),label:'Nueva desgravaci\u00f3n',amount:0,limit:null,enabled:true,type:'base'});
    reRenderFiscal();
  });
  /* Links from despacho deductions → other tabs */
  var despSection=document.querySelector('.fiscal-desgrav-despacho-section');
  if(despSection&&!despSection._linkDel){
    despSection._linkDel=true;
    despSection.addEventListener('click',function(e){
      var link=e.target.closest('.fiscal-desp-link');
      if(link){
        if(link.dataset.linkTab==='despacho-sub'){FISCAL_IRPF_SUB='despacho';reRenderFiscal();}
        else if(link.dataset.linkTab==='despacho-tab'){FISCAL_TAB='despacho';reRenderFiscal();}
        return;
      }
      var tgl=e.target.closest('[data-dedtgl]');
      if(tgl){
        var key=tgl.dataset.dedtgl;
        if(!DESPACHO.deducciones)DESPACHO.deducciones={amortizacion:true,ibi:true,hipotecaInt:true,casa:true,suministros:true};
        DESPACHO.deducciones[key]=DESPACHO.deducciones[key]===false?true:false;
        saveDespacho();
        reRenderFiscal();
      }
    });
  }
}

function _bindTabDespachoOnly(){
  /* Toggle on/off */
  var tog=document.getElementById('despachoToggle');
  if(tog)tog.addEventListener('click',function(){
    DESPACHO.enabled=!DESPACHO.enabled;
    reRenderFiscal();
  });
  /* Sincronización en tiempo real entre m²despacho ↔ % */
  var m2TotalEl=document.getElementById('desp-m2Total');
  var m2DespEl=document.getElementById('desp-m2Despacho');
  var pctEl=document.getElementById('desp-pct');
  function _syncLiveD(changed){
    var m2T=parseFloat(m2TotalEl?m2TotalEl.value:0)||0;
    var m2D=parseFloat(m2DespEl?m2DespEl.value:0)||0;
    var p=parseFloat(pctEl?pctEl.value:0)||0;
    if(changed==='m2Despacho'||changed==='m2Total'){
      if(m2T>0&&pctEl)pctEl.value=(Math.round(m2D/m2T*1000)/10).toFixed(1);
    }else if(changed==='pct'){
      if(m2T>0&&m2DespEl)m2DespEl.value=(Math.round(p*m2T/100*10)/10).toFixed(1);
    }
  }
  if(m2TotalEl){
    m2TotalEl.addEventListener('input',function(){_syncLiveD('m2Total');});
    m2TotalEl.addEventListener('change',function(){
      DESPACHO.m2Total=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
      reRenderFiscal();
    });
  }
  if(m2DespEl){
    m2DespEl.addEventListener('input',function(){_syncLiveD('m2Despacho');});
    m2DespEl.addEventListener('change',function(){
      DESPACHO.m2Despacho=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
      reRenderFiscal();
    });
  }
  if(pctEl){
    pctEl.addEventListener('input',function(){_syncLiveD('pct');});
    pctEl.addEventListener('change',function(){
      DESPACHO.pct=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.m2Despacho=Math.round(DESPACHO.pct*DESPACHO.m2Total/100*10)/10;
      reRenderFiscal();
    });
  }
  /* Campos monetarios despacho */
  ['valorCatastral','hipotecaIntereses'].forEach(function(field){
    var el=document.getElementById('desp-'+field);
    if(!el)return;
    function _updateFmt(){
      var v=parseFloat(el.value)||0;
      var fmtEl=document.getElementById('desp-fmt-'+field);
      if(fmtEl)fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';
    }
    el.addEventListener('input',_updateFmt);
    el.addEventListener('change',function(){
      DESPACHO[field]=parseFloat(this.value)||0;
      _updateFmt();
      reRenderFiscal();
    });
  });
  /* Recalcular intereses button */
  var recalcBtn=document.getElementById('despRecalcInt');
  if(recalcBtn){
    recalcBtn.addEventListener('click',function(){
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
  }
  /* Manual override */
  var hipIntEl=document.getElementById('desp-hipotecaIntereses');
  if(hipIntEl){
    hipIntEl.addEventListener('change',function(){
      var autoInt=_computeAnnualInterest(DESPACHO.compra,FISCAL_YEAR);
      var newVal=parseFloat(this.value)||0;
      if(autoInt>0&&Math.abs(newVal-autoInt)>0.5){
        DESPACHO.hipotecaInteresesManual=true;
      }
    });
  }
}

function _bindTabDespacho(){
  if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();
  /* Sub-tab switching */
  document.querySelectorAll('[data-hipsub]').forEach(function(btn){
    btn.addEventListener('click',function(){
      FISCAL_HIP_SUB=btn.dataset.hipsub;
      FISCAL_HIP_EDITING=null;
      FISCAL_HIP_EDIT_SNAPSHOT=null;
      reRenderFiscal();
    });
  });
  if(FISCAL_HIP_SUB==='resumen'){
    _bindHipResumen();
  } else if(FISCAL_HIP_SUB==='detalle'){
    _bindHipDetalle();
  } else if(FISCAL_HIP_SUB==='gas'){
    _bindGasDetalle();
  } else if(FISCAL_HIP_SUB==='elect'){
    _bindElectDetalle();
  }
}

/* ── Gas detail bindings ─────────────────────────────────── */
function _bindGasDetalle(){
  _ensureGasScenarios();
  /* Active scenario toggle */
  var actC=document.getElementById('gasActivoConsumo');
  var actF=document.getElementById('gasActivoFijo');
  if(actC)actC.addEventListener('click',function(){DESPACHO.gas.activo='consumo';saveDespacho();reRenderFiscal();});
  if(actF)actF.addEventListener('click',function(){DESPACHO.gas.activo='fijo';saveDespacho();reRenderFiscal();});
  /* Edit buttons */
  document.querySelectorAll('[data-gasedit]').forEach(function(btn){
    btn.addEventListener('click',function(){FISCAL_GAS_EDITING=btn.dataset.gasedit;reRenderFiscal();});
  });
  /* Save buttons */
  document.querySelectorAll('[data-gassave]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sc=btn.dataset.gassave;
      var g=DESPACHO.gas;
      if(sc==='consumo'){
        g.consumo.precioKwh=parseFloat(document.getElementById('desp-gasConsPrecio').value)||0;
        g.consumo.terminoFijo=parseFloat(document.getElementById('desp-gasConsTfijo').value)||0;
        g.consumo.comercializadora=(document.getElementById('desp-gasConsComerc').value||'').trim();
      } else {
        g.fijo.cuotaFija=parseFloat(document.getElementById('desp-gasFijoCuota').value)||0;
        g.fijo.terminoFijo=parseFloat(document.getElementById('desp-gasFijoTfijo').value)||0;
        g.fijo.comercializadora=(document.getElementById('desp-gasFijoComerc').value||'').trim();
      }
      saveDespacho();FISCAL_GAS_EDITING=null;reRenderFiscal();
    });
  });
  /* Cancel buttons */
  document.querySelectorAll('[data-gascancel]').forEach(function(btn){
    btn.addEventListener('click',function(){loadDespacho();FISCAL_GAS_EDITING=null;reRenderFiscal();});
  });
}

/* ── Electricidad detail bindings ─────────────────────────── */
function _bindElectDetalle(){
  var editBtn=document.getElementById('electEditBtn');
  if(editBtn)editBtn.addEventListener('click',function(){FISCAL_ELECT_EDITING=true;reRenderFiscal();});
  var saveBtn=document.getElementById('electSaveBtn');
  if(saveBtn)saveBtn.addEventListener('click',function(){
    var e=DESPACHO.elect;
    if(e.modoPotencia==='doble'){
      e.potenciaP1=parseFloat(document.getElementById('desp-electP1').value)||0;
      e.potenciaP2=parseFloat(document.getElementById('desp-electP2').value)||0;
      e.potenciaTotal=Math.round((e.potenciaP1+e.potenciaP2)*10)/10;
      e.precioPotP1=parseFloat(document.getElementById('desp-electPrecioPotP1').value)||0;
      e.precioPotP2=parseFloat(document.getElementById('desp-electPrecioPotP2').value)||0;
    } else {
      e.potenciaTotal=parseFloat(document.getElementById('desp-electTotal').value)||0;
      e.potenciaP1=Math.round(e.potenciaTotal/2*10)/10;
      e.potenciaP2=e.potenciaP1;
      e.precioPotP1=parseFloat(document.getElementById('desp-electPrecioPotP1').value)||0;
      e.precioPotP2=e.precioPotP1;
    }
    e.precioKwh=parseFloat(document.getElementById('desp-electPrecioKwh').value)||0;
    e.terminoFijo=parseFloat(document.getElementById('desp-electTerminoFijo').value)||0;
    e.comercializadora=(document.getElementById('desp-electComerc').value||'').trim();
    saveDespacho();FISCAL_ELECT_EDITING=false;reRenderFiscal();
  });
  var cancelBtn=document.getElementById('electCancelBtn');
  if(cancelBtn)cancelBtn.addEventListener('click',function(){loadDespacho();FISCAL_ELECT_EDITING=false;reRenderFiscal();});
  /* Modo toggles */
  var modoD=document.getElementById('electModoDoble');
  var modoS=document.getElementById('electModoSimple');
  if(modoD)modoD.addEventListener('click',function(){DESPACHO.elect.modoPotencia='doble';reRenderFiscal();});
  if(modoS)modoS.addEventListener('click',function(){DESPACHO.elect.modoPotencia='simple';reRenderFiscal();});
  /* Bidirectional P1+P2 ↔ Total (kW) */
  var p1=document.getElementById('desp-electP1');
  var p2=document.getElementById('desp-electP2');
  if(p1&&p2){
    var syncKw=function(){/* no total field in double mode now */};
    p1.addEventListener('input',syncKw);
    p2.addEventListener('input',syncKw);
  }
  /* Bidirectional precio P1+P2 → Suma precios (auto) */
  var pp1=document.getElementById('desp-electPrecioPotP1');
  var pp2=document.getElementById('desp-electPrecioPotP2');
  var ptot=document.getElementById('desp-electTotalPrecio');
  if(pp1)pp1.addEventListener('input',function(){
    var v1=parseFloat(pp1.value)||0,v2=pp2?parseFloat(pp2.value)||0:0;
    if(ptot)ptot.value=parseFloat((v1+v2).toFixed(6));
  });
  if(pp2)pp2.addEventListener('input',function(){
    var v1=pp1?parseFloat(pp1.value)||0:0,v2=parseFloat(pp2.value)||0;
    if(ptot)ptot.value=parseFloat((v1+v2).toFixed(6));
  });
}

/* ── Seguros normales bindings ───────────────────────────── */
function _bindSegurosNormales(){
  var fields={segNormalSalud:'segSalud',segNormalVida:'segVida',segNormalHogar:'segHogar'};
  Object.keys(fields).forEach(function(domId){
    var el=document.getElementById('desp-'+domId);
    if(!el)return;
    var prop=fields[domId];
    el.addEventListener('change',function(){
      if(!DESPACHO.segurosNormales)DESPACHO.segurosNormales={segSalud:0,segVida:0,segHogar:0};
      DESPACHO.segurosNormales[prop]=parseFloat(this.value)||0;
      saveDespacho();
    });
    /* Money format */
    var fmtEl=document.getElementById('desp-fmt-'+domId);
    if(fmtEl)el.addEventListener('input',function(){var v=parseFloat(el.value)||0;fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';});
  });
}
function _bindHipResumen(){
  /* "Ver Detalle" buttons */
  document.querySelectorAll('[data-gotosection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      FISCAL_HIP_SUB='detalle';
      FISCAL_HIP_DETAIL_TARGET=btn.dataset.gotosection;
      reRenderFiscal();
      /* Scroll to target section after render */
      setTimeout(function(){
        var target=document.getElementById('hip-section-'+FISCAL_HIP_DETAIL_TARGET);
        if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
        FISCAL_HIP_DETAIL_TARGET=null;
      },100);
    });
  });
  /* "Ver análisis" */
  var goAnalBtn=document.getElementById('hipGoAnalisis');
  if(goAnalBtn)goAnalBtn.addEventListener('click',function(){
    closeFiscal();
    setTimeout(function(){
      ECON_VIEW='analisis';ANALISIS_SUB='hipoteca';
      openEcon();
    },350);
  });
}
function _bindHipDetalle(){
  /* Edit buttons */
  document.querySelectorAll('[data-editsection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sid=btn.dataset.editsection;
      FISCAL_HIP_EDIT_SNAPSHOT=JSON.parse(JSON.stringify(DESPACHO.compra));
      FISCAL_HIP_EDITING=sid;
      _rerenderSection(sid,true);
    });
  });
  /* Save buttons */
  document.querySelectorAll('[data-savesection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sid=btn.dataset.savesection;
      _readSectionInputs(sid);
      DESPACHO.hipotecaInteresesManual=false;
      saveDespacho();
      FISCAL_HIP_EDITING=null;
      FISCAL_HIP_EDIT_SNAPSHOT=null;
      _rerenderSection(sid,false);
    });
  });
  /* Cancel buttons */
  document.querySelectorAll('[data-cancelsection]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sid=btn.dataset.cancelsection;
      if(FISCAL_HIP_EDIT_SNAPSHOT){
        DESPACHO.compra=FISCAL_HIP_EDIT_SNAPSHOT;
        saveDespacho();
      }
      FISCAL_HIP_EDITING=null;
      FISCAL_HIP_EDIT_SNAPSHOT=null;
      _rerenderSection(sid,false);
    });
  });
  /* Add subrogation */
  var addBtn=document.getElementById('hipAddSub');
  if(addBtn)addBtn.addEventListener('click',function(){
    var subs=DESPACHO.compra.subrogaciones||[];
    /* Warn if last sub < 2 years ago */
    if(subs.length>0){
      var lastFecha=subs[subs.length-1].fecha;
      if(lastFecha){
        var lp=lastFecha.split('-');
        var diff=(new Date().getFullYear()-parseInt(lp[0],10))*12+(new Date().getMonth()-(parseInt(lp[1],10)-1));
        if(diff<24){
          if(!confirm('Han pasado menos de 2 a\u00f1os desde la \u00faltima subrogaci\u00f3n ('+lastFecha+'). \u00bfA\u00f1adir de todos modos?'))return;
        }
      }
    } else if(!DESPACHO.compra.fechaInicio){
      if(!confirm('No hay fecha de inicio del pr\u00e9stamo. \u00bfA\u00f1adir subrogaci\u00f3n de todos modos?'))return;
    }
    DESPACHO.compra.subrogaciones.push(_defaultSubrogacion());
    saveDespacho();
    var newIdx=DESPACHO.compra.subrogaciones.length-1;
    FISCAL_HIP_EDIT_SNAPSHOT=JSON.parse(JSON.stringify(DESPACHO.compra));
    FISCAL_HIP_EDITING='sub-'+newIdx;
    reRenderFiscal();
  });
  /* If editing, bind inputs for that section */
  if(FISCAL_HIP_EDITING)_bindEditingSection(FISCAL_HIP_EDITING);
  /* Seguros normales inputs (at end of hipoteca detail) */
  _bindSegurosNormales();
  /* Scroll to target from Resumen "Ver Detalle" */
  if(FISCAL_HIP_DETAIL_TARGET){
    var target=document.getElementById('hip-section-'+FISCAL_HIP_DETAIL_TARGET);
    if(target)setTimeout(function(){target.scrollIntoView({behavior:'smooth',block:'start'});},100);
    FISCAL_HIP_DETAIL_TARGET=null;
  }
}
/* Replace a single section's innerHTML and rebind */
function _rerenderSection(sectionId,isEditing){
  var el=document.getElementById('hip-section-'+sectionId);
  if(!el)return;
  var scrollTop=document.querySelector('#fiscalOverlay .sy-body').scrollTop;
  el.innerHTML=_renderHipSectionContent(sectionId,isEditing);
  _bindHipDetalle();
  document.querySelector('#fiscalOverlay .sy-body').scrollTop=scrollTop;
}
/* Read inputs from an editing section into DESPACHO */
function _readSectionInputs(sectionId){
  function _rv(id){var el=document.getElementById('desp-'+id);return el?parseFloat(el.value)||0:0;}
  function _rv_s(id){var el=document.getElementById('desp-'+id);return el?el.value||'':'';}
  var comp=DESPACHO.compra;
  if(sectionId==='compra'){
    comp.valorCompraTotal=_rv('compraValor');
    comp.itpMadrid=_rv('compraItp');
    comp.notariaRegistro=_rv('compraNotaria');
    comp.tasacion=_rv('compraTasacion');
    comp.reformas=_rv('compraReformas');
    comp.inmobiliaria=_rv('compraInmobiliaria');
    DESPACHO.valorCompra=comp.valorCompraTotal;
  } else if(sectionId==='prestamo'){
    comp.importePrestamo=_rv('compraImporte');
    comp.tipoInteres=_rv('compraTipo');
    comp.plazoAnios=_rv('compraPlazo');
    comp.fechaInicio=_rv_s('compraFechaInicio')||null;
    comp.entidadBanco=_rv_s('entidadBanco');
    /* Read vinculaciones from toggles */
    var _vk=['nomina','segHogar','segSalud','segVida'];
    var _vi=['vincNomina','vincSegHogar','vincSegSalud','vincSegVida'];
    _vk.forEach(function(k,i){
      if(!comp.vinculaciones[k])comp.vinculaciones[k]={enabled:false,costeAnual:0,reduccion:0};
      var tgl=document.getElementById(_vi[i]+'Toggle');
      if(tgl)comp.vinculaciones[k].enabled=tgl.classList.contains('on');
      var ce=document.getElementById(_vi[i]+'Coste');
      if(ce)comp.vinculaciones[k].costeAnual=parseFloat(ce.value)||0;
      var re=document.getElementById(_vi[i]+'Reduccion');
      if(re)comp.vinculaciones[k].reduccion=parseFloat(re.value)||0;
    });
  } else if(sectionId.indexOf('sub-')===0){
    var idx=parseInt(sectionId.substring(4),10);
    var sub=comp.subrogaciones[idx];
    if(!sub)return;
    var pfx='sub'+idx;
    sub.fecha=_rv_s(pfx+'Fecha')||null;
    sub.comisionCancelacion=_rv(pfx+'Comision');
    sub.notaria=_rv(pfx+'Notaria');
    sub.tasacion=_rv(pfx+'Tasacion');
    sub.registro=_rv(pfx+'Registro');
    sub.nuevoImporte=_rv(pfx+'NuevoImporte');
    sub.nuevoTipoInteres=_rv(pfx+'NuevoTipo');
    sub.nuevoPlazoAnios=_rv(pfx+'NuevoPlazo');
    sub.entidadBanco=_rv_s(pfx+'EntidadBanco');
    /* Vinculaciones */
    if(!sub.vinculaciones)sub.vinculaciones={nomina:{enabled:false,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0}};
    var _svk=['nomina','segVida','segSalud','segHogar'];
    var _svi=[pfx+'VincNomina',pfx+'VincSegVida',pfx+'VincSegSalud',pfx+'VincSegHogar'];
    _svk.forEach(function(k,i){
      if(!sub.vinculaciones[k])sub.vinculaciones[k]={enabled:false,costeAnual:0,reduccion:0};
      var tgl=document.getElementById(_svi[i]+'Toggle');
      if(tgl)sub.vinculaciones[k].enabled=tgl.classList.contains('on');
      var ce=document.getElementById(_svi[i]+'Coste');
      if(ce)sub.vinculaciones[k].costeAnual=parseFloat(ce.value)||0;
      var re=document.getElementById(_svi[i]+'Reduccion');
      if(re)sub.vinculaciones[k].reduccion=parseFloat(re.value)||0;
    });
  }
}
/* Bind edit-mode inputs (toggles, money format, ITP auto-calc) */
function _bindEditingSection(sectionId){
  /* Money format update on input */
  document.querySelectorAll('#hip-section-'+sectionId+' .fiscal-despacho-input[type="number"]').forEach(function(el){
    var fmtId=el.id?el.id.replace('desp-','desp-fmt-'):null;
    if(fmtId){
      var fmtEl=document.getElementById(fmtId);
      if(fmtEl){
        el.addEventListener('input',function(){
          var v=parseFloat(el.value)||0;
          fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';
          /* Auto-calc ITP */
          if(el.id==='desp-compraValor'){
            var itpEl=document.getElementById('desp-compraItp');
            if(itpEl){var iv=Math.round(v*0.06);itpEl.value=iv;var fi=document.getElementById('desp-fmt-compraItp');if(fi)fi.textContent=iv>0?_fmtMiles(iv)+' \u20ac':'';}
          }
        });
      }
    }
  });
  /* Vinculación toggles */
  document.querySelectorAll('#hip-section-'+sectionId+' .fiscal-onoff').forEach(function(tgl){
    tgl.addEventListener('click',function(){
      var isOn=tgl.classList.contains('on');
      tgl.classList.toggle('on');
      tgl.textContent=isOn?'OFF':'ON';
      /* Re-render the whole section to show/hide inputs */
      var sid=sectionId;
      /* Read current values before re-render */
      _readSectionInputs(sid);
      saveDespacho();
      var el=document.getElementById('hip-section-'+sid);
      if(el){
        var st=document.querySelector('#fiscalOverlay .sy-body').scrollTop;
        el.innerHTML=_renderHipSectionContent(sid,true);
        _bindEditingSection(sid);
        /* Re-bind save/cancel */
        el.querySelectorAll('[data-savesection]').forEach(function(b){b.addEventListener('click',function(){
          _readSectionInputs(sid);DESPACHO.hipotecaInteresesManual=false;saveDespacho();
          FISCAL_HIP_EDITING=null;FISCAL_HIP_EDIT_SNAPSHOT=null;_rerenderSection(sid,false);
        });});
        el.querySelectorAll('[data-cancelsection]').forEach(function(b){b.addEventListener('click',function(){
          if(FISCAL_HIP_EDIT_SNAPSHOT){DESPACHO.compra=FISCAL_HIP_EDIT_SNAPSHOT;saveDespacho();}
          FISCAL_HIP_EDITING=null;FISCAL_HIP_EDIT_SNAPSHOT=null;_rerenderSection(sid,false);
        });});
        document.querySelector('#fiscalOverlay .sy-body').scrollTop=st;
      }
    });
  });
}

/* ── _saveFiscalAll — guardar todo ────────────────────────── */
function _saveFiscalAll(){
  if(FISCAL.irpfMode==='custom'){
    var pctEl=document.getElementById('fiscalPctInput');
    if(pctEl){
      var pct=parseFloat(pctEl.value);
      if(isNaN(pct)||pct<=15){
        var errEl=document.getElementById('fiscalPctError');
        if(errEl)errEl.style.display='';
        showToast('El IRPF personalizado debe ser &gt;15%','error');return;
      }
      FISCAL.irpfPct=Math.round(pct*100)/100;
    }
  }
  if(FISCAL_TAB==='irpf_deduc'&&FISCAL_IRPF_SUB==='irpf'){
    var gdV=parseFloat((document.getElementById('gastosDificilInput')||{}).value);
    if(!isNaN(gdV)&&gdV>=0&&gdV<=15)GASTOS_DIFICIL_PCT=gdV;
    var rows=document.querySelectorAll('#fiscalBracketTable tbody tr');
    if(rows.length>0){
      var brackets=[];
      rows.forEach(function(row){
        var fromV=parseFloat(row.querySelector('.fbi-from').value)||0;
        var toRaw=row.querySelector('.fbi-to').value;
        var toV=toRaw===''?Infinity:parseFloat(toRaw)||0;
        brackets.push({from:fromV,to:toV,pct:parseFloat(row.querySelector('.fbi-pct').value)||0});
      });
      if(brackets.length>0)FISCAL.brackets=brackets;
    }
  }
  /* Leer valores despacho directamente del DOM (evita pérdida por re-render) */
  var _rv=function(id){var el=document.getElementById('desp-'+id);return el?parseFloat(el.value)||0:null;};
  var v;
  /* Despacho sub-tab (dentro de IRPF y Deducciones) */
  if(FISCAL_TAB==='irpf_deduc'&&FISCAL_IRPF_SUB==='despacho'){
    v=_rv('m2Total');if(v!==null)DESPACHO.m2Total=v;
    v=_rv('m2Despacho');if(v!==null)DESPACHO.m2Despacho=v;
    v=_rv('pct');if(v!==null)DESPACHO.pct=v;
    v=_rv('valorCatastral');if(v!==null)DESPACHO.valorCatastral=v;
    v=_rv('hipotecaIntereses');if(v!==null)DESPACHO.hipotecaIntereses=v;
    if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
  }
  /* Hipoteca tab */
  if(FISCAL_TAB==='despacho'){
    if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();
    v=_rv('compraValor');if(v!==null){DESPACHO.compra.valorCompraTotal=v;DESPACHO.valorCompra=v;}
    v=_rv('compraItp');if(v!==null)DESPACHO.compra.itpMadrid=v;
    v=_rv('compraNotaria');if(v!==null)DESPACHO.compra.notariaRegistro=v;
    v=_rv('compraTasacion');if(v!==null)DESPACHO.compra.tasacion=v;
    v=_rv('compraReformas');if(v!==null)DESPACHO.compra.reformas=v;
    v=_rv('compraInmobiliaria');if(v!==null)DESPACHO.compra.inmobiliaria=v;
    v=_rv('compraImporte');if(v!==null)DESPACHO.compra.importePrestamo=v;
    v=_rv('compraTipo');if(v!==null)DESPACHO.compra.tipoInteres=v;
    v=_rv('compraPlazo');if(v!==null)DESPACHO.compra.plazoAnios=v;
  }
  saveFiscal();
  saveGastosYear(FISCAL_YEAR);
  savePersonalYear(FISCAL_YEAR);
  saveDesgrav();
  saveDespacho();
  saveCompras();
  showToast('Configuraci\u00f3n guardada','success');
  closeFiscal();
  var ec=document.getElementById('econContent');
  if(ec&&ec.innerHTML){ec.innerHTML=renderEconContent();bindEconEvents();}
}
