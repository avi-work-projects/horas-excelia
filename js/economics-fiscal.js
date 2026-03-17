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
var FISCAL_IRPF_SUB='desgrav'; // 'desgrav' | 'irpf' — sub-tab dentro de IRPF y Deducciones
var FISCAL_YEAR=CY; // año activo para datos per-year

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
  {id:'otros_seg',label:'Otros seguros',amount:0,period:'annual'}
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
  {id:'plan_pension',label:'Plan de pensiones',amount:0,limit:5750,enabled:true,type:'base',
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

function _defaultCompra(){return{valorCompraTotal:0,itpMadrid:0,notariaRegistro:0,tasacion:0,reformas:0,inmobiliaria:0,importePrestamo:0,tipoInteres:0,plazoAnios:0,fechaInicio:null,entidadBanco:'',vinculaciones:{nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}},subrogacion:null};}
function _defaultSubrogacion(){return{fecha:null,comisionCancelacion:0,notaria:0,tasacion:0,registro:0,nuevoImporte:0,nuevoTipoInteres:0,nuevoPlazoAnios:0};}
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
        if(d.compra.subrogacion===undefined)d.compra.subrogacion=null;
      }
      else{DESPACHO.compra=_defaultCompra();if(DESPACHO.valorCompra>0)DESPACHO.compra.valorCompraTotal=DESPACHO.valorCompra;}
      DESPACHO.hipotecaInteresesManual=d.hipotecaInteresesManual||false;
    }else{DESPACHO.compra=_defaultCompra();}
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
  /* Amortización: 3% × 80% (construcción) × max(valorCatastral, valorCompra) × prop */
  var vc=DESPACHO.valorCatastral||0, vcp=DESPACHO.valorCompra||0;
  var baseAmort=0;
  if(vc>0&&vcp>0){baseAmort=Math.max(vc,vcp);}else if(vcp>0){baseAmort=vcp;}else if(vc>0){baseAmort=vc;}
  var amort=Math.round(baseAmort*0.80*0.03*prop*100)/100;
  /* IBI: 100% deducible × prop (el límite del 30% aplica solo a suministros) */
  var ibiReal=gastoAnual('ibi');
  var ibi=ibiReal>0?Math.round(ibiReal*prop*100)/100:Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100;
  /* Hipoteca: solo los intereses (campo separado hipotecaIntereses) */
  var hipInteres=Math.round((DESPACHO.hipotecaIntereses||0)*prop*100)/100;
  var GROUP_CASA=['comunidad','seg_hogar']; /* hipoteca excluida — usar hipotecaIntereses */
  var GROUP_UTIL=['luz','gas','agua','digi'];
  var gastosCasa=0,gastosUtil=0;
  GASTOS_ITEMS.forEach(function(g){
    var a=gastoAnual(g.id);
    if(GROUP_CASA.indexOf(g.id)!==-1)gastosCasa+=a;
    else if(GROUP_UTIL.indexOf(g.id)!==-1)gastosUtil+=a;
  });
  var casaDeducible=Math.round(gastosCasa*prop*100)/100;
  var utilDeducible=Math.round(gastosUtil*prop*0.30*100)/100;
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
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='despacho'?' active':'')+'" id="fiscalTabDespacho">Despacho e<br>Hipoteca</button>';
  h+='</div>';
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
      var evList=typeof EVENTS!=='undefined'?EVENTS.filter(function(ev){return ev.title&&ev.title.length>0;}):[];
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
  var h=_renderYearSelector();
  h+=_renderCopyYearBtn();
  /* 1. Gastos Recurrentes Personales (todo en una sección) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title expense">Gastos Recurrentes Personales</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Gastos semanales, suscripciones, viajes, etc.</div>';
  /* Gastos semanales primero */
  h+='<div id="personalGastosSem">'+_personalListHtml(PERSONAL_DATA.gastosSemanales,'gastosSemanales','weekly')+'</div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-expense" data-padd="gastosSemanales" style="margin-bottom:6px">+ A\u00f1adir gasto semanal</button>';
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
  var h=_renderYearSelector();
  h+=_renderCopyYearBtn();
  /* Gastos regulares (rojo) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title expense">Gastos regulares</div>';
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
  var h=_renderYearSelector();
  h+='<div class="econ-sub-tabs">';
  h+='<button class="econ-sub-tab'+(FISCAL_IRPF_SUB==='desgrav'?' active':'')+'" data-firsub="desgrav">Desgravaciones</button>';
  h+='<button class="econ-sub-tab'+(FISCAL_IRPF_SUB==='irpf'?' active':'')+'" data-firsub="irpf">Configuraci\u00f3n IRPF</button>';
  h+='</div>';
  if(FISCAL_IRPF_SUB==='irpf')h+=renderFiscalTabIrpf();
  else h+=renderFiscalTabDesgrav();
  return h;
}

/* ── Tab Desgravaciones ──────────────────────────────────── */
function renderFiscalTabDesgrav(){
  var dg=computeTotalDesgrav();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Desgravaciones IRPF \u2014 Declaraci\u00f3n de la Renta</div>';
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
  function _dedCard(name,annual,pctLabel,ded,borderColor){
    var c='<div class="fiscal-ded-card" style="border-left-color:'+borderColor+'">';
    c+='<div class="fiscal-ded-card-name">'+name+'</div>';
    c+='<div class="fiscal-ded-card-vals">';
    c+='<span class="fiscal-ded-card-annual">'+annual+'</span>';
    c+='<span class="fiscal-ded-card-pct">\u00d7 '+pctLabel+'</span>';
    c+='<span class="fiscal-ded-card-amount">'+fcPlain(ded)+'</span>';
    c+='</div></div>';
    return c;
  }
  var h='<div class="fiscal-section fiscal-desgrav-despacho-section">';
  h+='<div class="fiscal-section-title">\uD83C\uDFE0 Deducciones por despacho en casa ('+propPct.toFixed(1)+'%)</div>';
  h+='<div style="font-size:.7rem;color:var(--text-dim);margin-bottom:10px">Partidas deducibles en proporci\u00f3n al % del despacho sobre la vivienda.</div>';
  h+='<div class="fiscal-ded-cards">';
  if(amort>0)h+=_dedCard('Amortizaci\u00f3n (80% construc.)',fcPlain(Math.round(baseAmortInfo*0.80*100)/100),'3% \u00d7 '+propPct.toFixed(1)+'%',amort,'#c084fc');
  if(ibiAmt>0)h+=_dedCard(ibiLabel,ibiRealDesp>0?fcPlain(ibiRealDesp):'est.',propPct.toFixed(1)+'%',ibiAmt,'#6c8cff');
  if(hipIntInfo>0)h+=_dedCard('Intereses hipoteca',fcPlain(DESPACHO.hipotecaIntereses),propPct.toFixed(1)+'%',hipIntInfo,'#fb923c');
  casaItems.forEach(function(it){h+=_dedCard(escHtml(it.label),fcPlain(it.annual),it.pctLabel,it.ded,'#34d399');});
  utilItems.forEach(function(it){h+=_dedCard(escHtml(it.label),fcPlain(it.annual),it.pctLabel,it.ded,'#2dd4bf');});
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
        h+='<span class="fiscal-desgrav-from-gasto">&#128279; '+escHtml(linkedLabel)+': '+fcPlain(linkedAmt)+(p!==100?' \u00d7 '+p+'%':'')+'</span>';
      }else{
        h+='<span class="fiscal-desgrav-from-gasto dim">&#128279; '+escHtml(linkedLabel)+' — sin importe en gastos</span>';
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

/* ── Cálculo intereses hipotecarios por año ────────────────── */
function _computeAnnualInterest(comp,year){
  if(!comp||!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios)return 0;
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1; // 0-based month
  /* Tipo efectivo = base - reducciones por vinculaciones */
  var tipoEfectivo=comp.tipoInteres;
  if(comp.vinculaciones){var _vks=['nomina','segHogar','segSalud','segVida'];_vks.forEach(function(k){if(comp.vinculaciones[k]&&comp.vinculaciones[k].enabled)tipoEfectivo-=(comp.vinculaciones[k].reduccion||0);});}
  if(tipoEfectivo<0)tipoEfectivo=0;
  var r=tipoEfectivo/100/12;
  var nTotal=comp.plazoAnios*12;
  var cuota=comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1);
  var balance=comp.importePrestamo;
  var interesesYear=0;
  /* Si hay subrogación, preparar datos */
  var sub=comp.subrogacion;
  var subMonth=-1; // mes absoluto de subrogación (meses desde inicio préstamo)
  if(sub&&sub.fecha&&sub.nuevoImporte>0&&sub.nuevoTipoInteres>0&&sub.nuevoPlazoAnios>0){
    var sp=sub.fecha.split('-');
    var sY=parseInt(sp[0],10),sM=parseInt(sp[1],10)-1;
    subMonth=(sY-startY)*12+(sM-startM);
  }
  var rNew=0,cuotaNew=0,balanceNew=0;
  if(subMonth>=0){
    rNew=sub.nuevoTipoInteres/100/12;
    var nNew=sub.nuevoPlazoAnios*12;
    cuotaNew=sub.nuevoImporte*rNew*Math.pow(1+rNew,nNew)/(Math.pow(1+rNew,nNew)-1);
    balanceNew=sub.nuevoImporte;
  }
  var switched=false;
  for(var m=0;m<nTotal+240;m++){ // 240 extra for subrogacion extending
    var curY=startY+Math.floor((startM+m)/12);
    var curM=(startM+m)%12;
    if(curY>year)break;
    if(!switched&&subMonth>=0&&m>=subMonth){
      switched=true;
      balance=balanceNew;
      r=rNew;
      cuota=cuotaNew;
    }
    if(balance<=0)break;
    var interesMes=balance*r;
    var capital=cuota-interesMes;
    if(capital>balance){capital=balance;interesMes=cuota-capital;}
    if(curY===year){
      interesesYear+=interesMes;
    }
    balance-=capital;
    if(balance<0.01)balance=0;
  }
  return Math.round(interesesYear*100)/100;
}
/* Obtener saldo vivo a una fecha dada */
function _computeBalanceAtDate(comp,dateStr){
  if(!comp||!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios||!dateStr)return 0;
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var dp=dateStr.split('-');
  var dY=parseInt(dp[0],10),dM=parseInt(dp[1],10)-1;
  var targetMonth=(dY-startY)*12+(dM-startM);
  if(targetMonth<=0)return comp.importePrestamo;
  var r=comp.tipoInteres/100/12;
  var nTotal=comp.plazoAnios*12;
  var cuota=comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1);
  var balance=comp.importePrestamo;
  for(var m=0;m<targetMonth&&m<nTotal;m++){
    var interes=balance*r;
    var capital=cuota-interes;
    if(capital>balance)capital=balance;
    balance-=capital;
    if(balance<0.01){balance=0;break;}
  }
  return Math.round(balance*100)/100;
}

/* ── Tab Despacho e Hipoteca ───────────────────────────────── */
function renderFiscalTabDespacho(){
  var pctShow=DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0
    ?Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10
    :DESPACHO.pct;
  var comp=DESPACHO.compra||_defaultCompra();
  var h='';
  /* Sección despacho */
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
  h+='</div>';
  h+='</div>';
  /* Sección compra de vivienda */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Compra de vivienda</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:12px">Datos de la compra del inmueble: precios, impuestos y gastos asociados.</div>';
  h+='<div class="fiscal-despacho-grid">';
  h+=_despFieldMoney('compraValor','Valor de compra / escritura',comp.valorCompraTotal);
  h+=_despFieldMoney('compraItp','ITP Comunidad de Madrid (6%) \u2014 <span style="font-size:.65rem;color:var(--accent-bright)">auto-calculado</span>',comp.itpMadrid);
  h+=_despFieldMoney('compraNotaria','Notar\u00eda y registro',comp.notariaRegistro);
  h+=_despFieldMoney('compraTasacion','Tasaci\u00f3n',comp.tasacion);
  h+=_despFieldMoney('compraReformas','Reformas',comp.reformas);
  h+=_despFieldMoney('compraInmobiliaria','Inmobiliaria (no afecta al ITP)',comp.inmobiliaria||0);
  h+='</div>';
  /* Info total inversión */
  var totalCompra=(comp.valorCompraTotal||0)+(comp.itpMadrid||0)+(comp.notariaRegistro||0)+(comp.tasacion||0)+(comp.reformas||0)+(comp.inmobiliaria||0);
  if(totalCompra>0){
    h+='<div class="fiscal-compras-total" style="margin-top:6px">Inversi\u00f3n total: <b>'+_fmtMiles(totalCompra)+' \u20ac</b></div>';
  }
  h+='</div>';
  /* Sección hipoteca */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Hipoteca \u2014 Pr\u00e9stamo original</div>';
  h+='<div class="fiscal-despacho-grid">';
  h+=_despFieldMoney('compraImporte','Importe del pr\u00e9stamo',comp.importePrestamo);
  h+=_despField('compraTipo','Tipo de inter\u00e9s anual',comp.tipoInteres,'%');
  h+=_despField('compraPlazo','Plazo',comp.plazoAnios,'a\u00f1os');
  h+=_despFieldDate('compraFechaInicio','Fecha inicio del pr\u00e9stamo',comp.fechaInicio);
  h+='</div>';
  /* Cálculo cuota mensual estimada */
  if(comp.importePrestamo>0&&comp.tipoInteres>0&&comp.plazoAnios>0){
    var r=comp.tipoInteres/100/12;
    var n=comp.plazoAnios*12;
    var cuota=Math.round(comp.importePrestamo*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)*100)/100;
    var totalPagado=Math.round(cuota*n*100)/100;
    var totalIntereses=Math.round((totalPagado-comp.importePrestamo)*100)/100;
    h+='<div class="fiscal-despacho-breakdown" style="margin-top:8px">';
    h+='<div class="fiscal-despacho-comp">Cuota mensual estimada: <b>'+fcPlain(cuota)+'</b></div>';
    h+='<div class="fiscal-despacho-comp">Total a pagar: <b>'+_fmtMiles(totalPagado)+' \u20ac</b></div>';
    h+='<div class="fiscal-despacho-comp">Total intereses: <b style="color:var(--c-orange)">'+_fmtMiles(totalIntereses)+' \u20ac</b></div>';
    h+='</div>';
  }
  h+='</div>';
  /* Sección entidad bancaria */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Entidad bancaria</div>';
  h+='<div class="fiscal-despacho-grid">';
  h+='<div class="fiscal-despacho-field" style="flex:1 1 100%"><label class="fiscal-despacho-label">Banco del pr\u00e9stamo</label>';
  h+='<input class="fiscal-despacho-input" id="desp-entidadBanco" type="text" value="'+escHtml(comp.entidadBanco||'')+'" placeholder="Ej: CaixaBank, Santander..." style="text-align:left">';
  h+='</div></div></div>';
  /* Sección vinculaciones */
  var vinc=comp.vinculaciones||{nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
  if(!vinc.segVida)vinc.segVida={enabled:false,costeAnual:0,reduccion:0};
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Vinculaciones del pr\u00e9stamo</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:10px">Requisitos asociados al pr\u00e9stamo y sus costes anuales. La reducci\u00f3n indica cu\u00e1nto baja el tipo de inter\u00e9s por activar cada vinculaci\u00f3n.</div>';
  h+=_vincRow('vincNomina','N\u00f3mina domiciliada',vinc.nomina);
  h+=_vincRow('vincSegHogar','Seguro hogar',vinc.segHogar);
  h+=_vincRow('vincSegSalud','Seguro salud',vinc.segSalud);
  h+=_vincRow('vincSegVida','Seguro de vida',vinc.segVida);
  var _vincKeys2=['nomina','segHogar','segSalud','segVida'];
  var vincTotal=0,vincReduccion=0;
  _vincKeys2.forEach(function(k){if(vinc[k]&&vinc[k].enabled){vincTotal+=vinc[k].costeAnual||0;vincReduccion+=vinc[k].reduccion||0;}});
  if(vincTotal>0||vincReduccion>0){
    h+='<div style="font-size:.72rem;color:var(--text-dim);text-align:right;padding:4px 0">';
    if(vincTotal>0)h+='Coste anual: <b style="color:var(--c-orange)">'+fcPlain(vincTotal)+'</b>';
    if(vincReduccion>0){
      h+=(vincTotal>0?' &middot; ':'')+' Reducci\u00f3n tipo: <b style="color:var(--c-green)">\u2212'+vincReduccion.toFixed(2)+'%</b>';
      if(comp.tipoInteres>0){
        var tipoEf=Math.max(0,comp.tipoInteres-vincReduccion);
        h+='<br>Tipo efectivo: <b style="color:var(--c-green)">'+tipoEf.toFixed(2)+'%</b> <span style="font-size:.65rem">('+comp.tipoInteres.toFixed(2)+'% \u2212 '+vincReduccion.toFixed(2)+'%)</span>';
      }
    }
    h+='</div>';
  }
  h+='</div>';
  /* Sección subrogación */
  var sub=comp.subrogacion;
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Subrogaci\u00f3n hipotecaria</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:10px">Si has cambiado de banco o renegociado las condiciones del pr\u00e9stamo.</div>';
  h+='<div class="fiscal-despacho-toggle-row">';
  h+='<span class="fiscal-despacho-toggle-lbl">Hipoteca subrogada</span>';
  h+='<div class="fiscal-onoff'+(sub?' on':'')+'" id="subrogacionToggle">'+(sub?'ON':'OFF')+'</div>';
  h+='</div>';
  if(sub){
    var sd=sub;
    h+='<div class="fiscal-despacho-grid" style="margin-top:8px">';
    h+=_despFieldDate('subFecha','Fecha de la subrogaci\u00f3n',sd.fecha);
    h+='</div>';
    h+='<div style="font-size:.7rem;color:var(--text-dim);margin:8px 0 4px;font-weight:600">Costes del cambio</div>';
    h+='<div class="fiscal-despacho-grid">';
    h+=_despFieldMoney('subComision','Comisi\u00f3n cancelaci\u00f3n',sd.comisionCancelacion);
    h+=_despFieldMoney('subNotaria','Notar\u00eda',sd.notaria);
    h+=_despFieldMoney('subTasacion','Tasaci\u00f3n',sd.tasacion);
    h+=_despFieldMoney('subRegistro','Registro',sd.registro);
    h+='</div>';
    var totalCambio=(sd.comisionCancelacion||0)+(sd.notaria||0)+(sd.tasacion||0)+(sd.registro||0);
    if(totalCambio>0){
      h+='<div style="font-size:.72rem;color:var(--text-dim);text-align:right;padding:4px 0">Coste total del cambio: <b style="color:var(--c-orange)">'+fcPlain(totalCambio)+'</b></div>';
    }
    h+='<div style="font-size:.7rem;color:var(--text-dim);margin:8px 0 4px;font-weight:600">Nuevas condiciones</div>';
    h+='<div class="fiscal-despacho-grid">';
    h+=_despFieldMoney('subNuevoImporte','Capital pendiente (nuevo pr\u00e9stamo)',sd.nuevoImporte);
    h+=_despField('subNuevoTipo','Nuevo tipo de inter\u00e9s anual',sd.nuevoTipoInteres,'%');
    h+=_despField('subNuevoPlazo','Nuevo plazo',sd.nuevoPlazoAnios,'a\u00f1os');
    h+='</div>';
    /* Cálculo cuota nueva */
    if(sd.nuevoImporte>0&&sd.nuevoTipoInteres>0&&sd.nuevoPlazoAnios>0){
      var rn=sd.nuevoTipoInteres/100/12;
      var nn=sd.nuevoPlazoAnios*12;
      var cuotaN=Math.round(sd.nuevoImporte*rn*Math.pow(1+rn,nn)/(Math.pow(1+rn,nn)-1)*100)/100;
      var totalN=Math.round(cuotaN*nn*100)/100;
      var intN=Math.round((totalN-sd.nuevoImporte)*100)/100;
      h+='<div class="fiscal-despacho-breakdown" style="margin-top:8px">';
      h+='<div class="fiscal-despacho-comp">Nueva cuota mensual: <b>'+fcPlain(cuotaN)+'</b></div>';
      h+='<div class="fiscal-despacho-comp">Total a pagar: <b>'+_fmtMiles(totalN)+' \u20ac</b></div>';
      h+='<div class="fiscal-despacho-comp">Total intereses: <b style="color:var(--c-orange)">'+_fmtMiles(intN)+' \u20ac</b></div>';
      h+='</div>';
    }
  }
  h+='</div>';
  return h;
}

function _vincRow(id,label,data){
  if(!data)data={enabled:false,costeAnual:0,reduccion:0};
  var h='<div class="fiscal-vinc-row">';
  h+='<div class="fiscal-despacho-toggle-row" style="margin-bottom:0">';
  h+='<span class="fiscal-despacho-toggle-lbl" style="font-size:.76rem">'+label+'</span>';
  h+='<div class="fiscal-onoff'+(data.enabled?' on':'')+'" id="'+id+'Toggle">'+(data.enabled?'ON':'OFF')+'</div>';
  h+='</div>';
  if(data.enabled){
    h+='<div class="fiscal-vinc-cost">';
    h+='<div style="display:flex;gap:8px;align-items:flex-end">';
    h+='<div><label class="fiscal-despacho-label" style="font-size:.68rem">Coste anual \u20ac</label>';
    h+='<input class="fiscal-despacho-input" id="'+id+'Coste" type="number" min="0" step="10" value="'+(data.costeAnual||0)+'" style="width:90px"></div>';
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
function renderGastosList(){
  var h='';
  GASTOS_ITEMS.forEach(function(g,i){
    var isFixed=DEFAULT_GASTOS.some(function(d){return d.id===g.id;});
    h+='<div class="fiscal-gasto-item" data-gi="'+i+'">';
    if(isFixed){
      h+='<span class="fiscal-gasto-lbl">'+g.label+'</span>';
    }else{
      h+='<input class="fiscal-gasto-lbl-input" data-gi="'+i+'" data-gfield="label" value="'+escHtml(g.label)+'" placeholder="Nombre...">';
    }
    h+='<input class="fiscal-gasto-amt" data-gi="'+i+'" data-gfield="amount" type="number" min="0" step="1" value="'+(g.amount||0)+'">';
    h+='<div class="fiscal-gasto-period">';
    h+='<button class="fiscal-period-btn'+(g.period==='monthly'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="monthly">/mes</button>';
    h+='<button class="fiscal-period-btn'+(g.period==='annual'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="annual">/a\u00f1o</button>';
    h+='</div>';
    if(!isFixed){h+='<button class="fiscal-gasto-del" data-gi="'+i+'">&#10005;</button>';}
    else{h+='<span style="width:22px"></span>';}
    h+='</div>';
  });
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

  /* Year selector bindings (shared by personal + gastos_desg) */
  if(FISCAL_TAB==='personal'||FISCAL_TAB==='gastos_desg')_bindYearSelector();

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
}

function _bindTabDespacho(){
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

  function _syncLive(changed){
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
    m2TotalEl.addEventListener('input',function(){_syncLive('m2Total');});
    m2TotalEl.addEventListener('change',function(){
      DESPACHO.m2Total=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
      reRenderFiscal();
    });
  }
  if(m2DespEl){
    m2DespEl.addEventListener('input',function(){_syncLive('m2Despacho');});
    m2DespEl.addEventListener('change',function(){
      DESPACHO.m2Despacho=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
      reRenderFiscal();
    });
  }
  if(pctEl){
    pctEl.addEventListener('input',function(){_syncLive('pct');});
    pctEl.addEventListener('change',function(){
      DESPACHO.pct=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.m2Despacho=Math.round(DESPACHO.pct*DESPACHO.m2Total/100*10)/10;
      reRenderFiscal();
    });
  }
  /* Campos monetarios despacho: step=1000 + formato miles */
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
  /* Campos compra vivienda */
  if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();
  var _compraFieldMap={
    compraValor:'valorCompraTotal',compraItp:'itpMadrid',compraNotaria:'notariaRegistro',
    compraTasacion:'tasacion',compraReformas:'reformas',compraInmobiliaria:'inmobiliaria',compraImporte:'importePrestamo'
  };
  Object.keys(_compraFieldMap).forEach(function(domId){
    var el=document.getElementById('desp-'+domId);
    if(!el)return;
    var prop=_compraFieldMap[domId];
    function _updateFmt(){
      var v=parseFloat(el.value)||0;
      var fmtEl=document.getElementById('desp-fmt-'+domId);
      if(fmtEl)fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';
    }
    el.addEventListener('input',function(){
      _updateFmt();
      /* Auto-calc ITP when valor changes */
      if(domId==='compraValor'){
        var itpEl=document.getElementById('desp-compraItp');
        if(itpEl){
          var itpVal=Math.round(parseFloat(el.value||0)*0.06);
          itpEl.value=itpVal;
          var fmtItp=document.getElementById('desp-fmt-compraItp');
          if(fmtItp)fmtItp.textContent=itpVal>0?_fmtMiles(itpVal)+' \u20ac':'';
          DESPACHO.compra.itpMadrid=itpVal;
        }
      }
    });
    el.addEventListener('change',function(){
      DESPACHO.compra[prop]=parseFloat(this.value)||0;
      _updateFmt();
      /* Sync valorCompra for amortización calculation */
      if(domId==='compraValor')DESPACHO.valorCompra=DESPACHO.compra.valorCompraTotal;
      reRenderFiscal();
    });
  });
  /* Campos compra: tipo interés y plazo (no monetarios) */
  var tipoEl=document.getElementById('desp-compraTipo');
  if(tipoEl){
    tipoEl.addEventListener('change',function(){
      DESPACHO.compra.tipoInteres=parseFloat(this.value)||0;
      reRenderFiscal();
    });
  }
  var plazoEl=document.getElementById('desp-compraPlazo');
  if(plazoEl){
    plazoEl.addEventListener('change',function(){
      DESPACHO.compra.plazoAnios=parseFloat(this.value)||0;
      reRenderFiscal();
    });
  }
  /* Fecha inicio préstamo */
  var fechaIniEl=document.getElementById('desp-compraFechaInicio');
  if(fechaIniEl){
    fechaIniEl.addEventListener('change',function(){
      DESPACHO.compra.fechaInicio=this.value||null;
      DESPACHO.hipotecaInteresesManual=false; // recalcular al cambiar fecha
      reRenderFiscal();
    });
  }
  /* Recalcular intereses button */
  var recalcBtn=document.getElementById('despRecalcInt');
  if(recalcBtn){
    recalcBtn.addEventListener('click',function(){
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
  }
  /* Manual override: mark as manual when user edits hipotecaIntereses */
  var hipIntEl=document.getElementById('desp-hipotecaIntereses');
  if(hipIntEl){
    var _origHipChange=null;
    hipIntEl.addEventListener('change',function(){
      var autoInt=_computeAnnualInterest(DESPACHO.compra,FISCAL_YEAR);
      var newVal=parseFloat(this.value)||0;
      if(autoInt>0&&Math.abs(newVal-autoInt)>0.5){
        DESPACHO.hipotecaInteresesManual=true;
      }
    });
  }
  /* Vinculaciones toggles */
  var _vincIds=['vincNomina','vincSegHogar','vincSegSalud','vincSegVida'];
  var _vincKeys=['nomina','segHogar','segSalud','segVida'];
  _vincIds.forEach(function(vid,idx){
    var tgl=document.getElementById(vid+'Toggle');
    if(tgl)tgl.addEventListener('click',function(){
      var vinc=DESPACHO.compra.vinculaciones;
      if(!vinc)vinc=DESPACHO.compra.vinculaciones={nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
      if(!vinc[_vincKeys[idx]])vinc[_vincKeys[idx]]={enabled:false,costeAnual:0,reduccion:0};
      vinc[_vincKeys[idx]].enabled=!vinc[_vincKeys[idx]].enabled;
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
    var costeEl=document.getElementById(vid+'Coste');
    if(costeEl)costeEl.addEventListener('change',function(){
      DESPACHO.compra.vinculaciones[_vincKeys[idx]].costeAnual=parseFloat(this.value)||0;
      reRenderFiscal();
    });
    var redEl=document.getElementById(vid+'Reduccion');
    if(redEl)redEl.addEventListener('change',function(){
      DESPACHO.compra.vinculaciones[_vincKeys[idx]].reduccion=parseFloat(this.value)||0;
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
  });
  /* Entidad bancaria */
  var entBancoEl=document.getElementById('desp-entidadBanco');
  if(entBancoEl)entBancoEl.addEventListener('change',function(){
    DESPACHO.compra.entidadBanco=this.value||'';
    saveDespacho();
  });
  /* Subrogación toggle */
  var subTgl=document.getElementById('subrogacionToggle');
  if(subTgl)subTgl.addEventListener('click',function(){
    if(DESPACHO.compra.subrogacion){
      DESPACHO.compra.subrogacion=null;
    } else {
      DESPACHO.compra.subrogacion=_defaultSubrogacion();
    }
    DESPACHO.hipotecaInteresesManual=false; // recalcular
    reRenderFiscal();
  });
  /* Subrogación fields */
  if(DESPACHO.compra.subrogacion){
    var subDateEl=document.getElementById('desp-subFecha');
    if(subDateEl)subDateEl.addEventListener('change',function(){
      DESPACHO.compra.subrogacion.fecha=this.value||null;
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
    var _subMoneyFields={subComision:'comisionCancelacion',subNotaria:'notaria',subTasacion:'tasacion',subRegistro:'registro',subNuevoImporte:'nuevoImporte'};
    Object.keys(_subMoneyFields).forEach(function(domId){
      var el=document.getElementById('desp-'+domId);
      if(!el)return;
      var prop=_subMoneyFields[domId];
      function _uf(){var v=parseFloat(el.value)||0;var f=document.getElementById('desp-fmt-'+domId);if(f)f.textContent=v>0?_fmtMiles(v)+' \u20ac':'';}
      el.addEventListener('input',_uf);
      el.addEventListener('change',function(){
        DESPACHO.compra.subrogacion[prop]=parseFloat(this.value)||0;_uf();
        DESPACHO.hipotecaInteresesManual=false;
        reRenderFiscal();
      });
    });
    var subTipoEl=document.getElementById('desp-subNuevoTipo');
    if(subTipoEl)subTipoEl.addEventListener('change',function(){
      DESPACHO.compra.subrogacion.nuevoTipoInteres=parseFloat(this.value)||0;
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
    var subPlazoEl=document.getElementById('desp-subNuevoPlazo');
    if(subPlazoEl)subPlazoEl.addEventListener('change',function(){
      DESPACHO.compra.subrogacion.nuevoPlazoAnios=parseFloat(this.value)||0;
      DESPACHO.hipotecaInteresesManual=false;
      reRenderFiscal();
    });
  }
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
  if(FISCAL_TAB==='despacho'){
    var _rv=function(id){var el=document.getElementById('desp-'+id);return el?parseFloat(el.value)||0:null;};
    var v;
    v=_rv('m2Total');if(v!==null)DESPACHO.m2Total=v;
    v=_rv('m2Despacho');if(v!==null)DESPACHO.m2Despacho=v;
    v=_rv('pct');if(v!==null)DESPACHO.pct=v;
    v=_rv('valorCatastral');if(v!==null)DESPACHO.valorCatastral=v;
    v=_rv('hipotecaIntereses');if(v!==null)DESPACHO.hipotecaIntereses=v;
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
    if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
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
