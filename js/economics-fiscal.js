/* ============================================================
   ECONOMICS FISCAL — Configuración fiscal (IRPF + tramos + gastos)
   ============================================================ */

var FISCAL_SK='excelia-fiscal-v1';
var DEFAULT_BRACKETS=[
  {from:0,to:12450,pct:19},{from:12450,to:20200,pct:24},
  {from:20200,to:35200,pct:30},{from:35200,to:60000,pct:37},
  {from:60000,to:300000,pct:45},{from:300000,to:Infinity,pct:47}
];
var FISCAL={irpfMode:'fixed',irpfPct:15,brackets:null};

/* ── Tab activo en fiscal config ───────────────────────────── */
var FISCAL_TAB='irpf'; // 'irpf' | 'ing_gas' | 'desgrav' | 'despacho'

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
  {id:'otros_seg',label:'Otros seguros',amount:0,period:'annual'},
  {id:'hipoteca',label:'Hipoteca',amount:0,period:'monthly'},
  {id:'ibi',label:'IBI',amount:0,period:'annual'},
  {id:'comunidad',label:'Comunidad propietarios',amount:0,period:'monthly'},
  {id:'seg_hogar',label:'Seguro del Hogar',amount:0,period:'annual'},
  {id:'gas',label:'Factura Gas',amount:0,period:'monthly'},
  {id:'luz',label:'Factura Luz',amount:0,period:'monthly'},
  {id:'digi',label:'Factura Digi',amount:0,period:'monthly'},
  {id:'agua',label:'Factura Agua',amount:0,period:'monthly'}
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

function loadGastos(){
  try{
    var r=localStorage.getItem(GASTOS_SK);
    if(r){var d=JSON.parse(r);GASTOS_DIFICIL_PCT=d.dificilPct!=null?d.dificilPct:5;GASTOS_ITEMS=d.items||JSON.parse(JSON.stringify(DEFAULT_GASTOS));}
    else{GASTOS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_GASTOS));}
  }catch(e){GASTOS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_GASTOS));}
}
function saveGastos(){
  try{localStorage.setItem(GASTOS_SK,JSON.stringify({dificilPct:GASTOS_DIFICIL_PCT,items:GASTOS_ITEMS}));}catch(e){}
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
var DEFAULT_COMPRAS=[
  {id:'material_oficina',label:'Material de oficina',amount:0,enabled:true},
  {id:'equipamiento_info',label:'Equipamiento inform\u00e1tico',amount:0,enabled:true},
  {id:'formacion',label:'Formaci\u00f3n / cursos',amount:0,enabled:false},
  {id:'suscripciones',label:'Suscripciones software',amount:0,enabled:false}
];
var COMPRAS_ITEMS=[];
function loadCompras(){
  try{
    var r=localStorage.getItem(COMPRAS_SK);
    if(r){var d=JSON.parse(r);COMPRAS_ITEMS=d.items||JSON.parse(JSON.stringify(DEFAULT_COMPRAS));}
    else{COMPRAS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_COMPRAS));}
  }catch(e){COMPRAS_ITEMS=JSON.parse(JSON.stringify(DEFAULT_COMPRAS));}
}
function saveCompras(){
  try{localStorage.setItem(COMPRAS_SK,JSON.stringify({items:COMPRAS_ITEMS}));}catch(e){}
}
function comprasTotal(){
  var t=0;
  COMPRAS_ITEMS.forEach(function(c){if(c.enabled&&c.amount)t+=c.amount;});
  return Math.round(t*100)/100;
}

/* ── Desgravaciones IRPF ─────────────────────────────────── */
var DESGRAV_SK='excelia-desgrav-v1';
/* type: 'base' = reduce la base imponible | 'quota' = reduce directamente la cuota IRPF */
var DESGRAV_DEFAULT=[
  {id:'plan_pension',label:'Plan de pensiones',amount:0,limit:5500,enabled:true,type:'base',
   note:'Hasta 5.500\u20ac/a\u00f1o para aut\u00f3nomos con plan de empleo simplificado (R\u00e9gimen General: 1.500\u20ac + 4.000\u20ac adicionales empresariales).'},
  {id:'cuota_autonomos',label:'Cuota aut\u00f3nomos (SS)',gastoLink:'cot_social',pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'100% deducible como gasto de la actividad econ\u00f3mica.'},
  {id:'asesoria_deduc',label:'Asesor\u00eda / gestor\u00eda',gastoLink:'asesoria',pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'100% deducible como gasto de la actividad econ\u00f3mica.'},
  {id:'seg_salud_titular',label:'Seguro salud (titular)',gastoLink:'seg_salud',pct:100,amount:0,limit:500,enabled:true,type:'base',
   note:'Deducci\u00f3n en cuota IRPF: hasta 500\u20ac/a\u00f1o por la prima pagada.'},
  {id:'gastos_prof',label:'Compras / gastos profesionales',gastoLink:'_compras_total',pct:100,amount:0,limit:null,enabled:true,type:'base',
   note:'100% deducibles como inversi\u00f3n en la actividad. Introduce siempre importes sin IVA.'},
  {id:'vivienda_madrid',label:'Vivienda habitual (Madrid)',amount:0,limit:9015,enabled:false,type:'quota',notaPct:15,
   note:'Solo r\u00e9gimen transitorio (compra \u2264 31/12/2012). 15% de lo pagado en hipoteca (capital + intereses), base m\u00e1x. 9.015\u20ac/a\u00f1o \u2192 hasta ~1.352\u20ac de deducci\u00f3n directa en la cuota IRPF. Las otras deducciones de despacho (IBI, comunidad, suministros) se calculan en la pesta\u00f1a Despacho.'}
];
var DESGRAV_ITEMS=[];

function loadDesgrav(){
  try{
    var r=localStorage.getItem(DESGRAV_SK);
    if(r){
      var d=JSON.parse(r);
      var saved=d.items||[];
      /* Migración: añadir items nuevos que no estén en el array guardado */
      var result=JSON.parse(JSON.stringify(saved));
      DESGRAV_DEFAULT.forEach(function(def){
        var exists=false;
        for(var i=0;i<result.length;i++){if(result[i].id===def.id){exists=true;break;}}
        if(!exists){result.push(JSON.parse(JSON.stringify(def)));return;}
        /* Actualizar campos nuevos en items existentes */
        var ex=result[result.indexOf(result.filter(function(x){return x.id===def.id;})[0])];
        for(var i=0;i<result.length;i++){
          if(result[i].id!==def.id)continue;
          if(def.gastoLink&&result[i].gastoLink===undefined)result[i].gastoLink=def.gastoLink;
          if(def.pct!==undefined&&result[i].pct===undefined)result[i].pct=def.pct;
          if(def.type&&!result[i].type)result[i].type=def.type;
          if(def.notaPct&&!result[i].notaPct)result[i].notaPct=def.notaPct;
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
var DESPACHO={enabled:false,m2Total:0,m2Despacho:0,pct:0,valorCatastral:0,valorCompra:0};

function loadDespacho(){
  try{
    var r=localStorage.getItem(DESPACHO_SK);
    if(r){var d=JSON.parse(r);
      DESPACHO.enabled=!!d.enabled;DESPACHO.m2Total=d.m2Total||0;DESPACHO.m2Despacho=d.m2Despacho||0;
      DESPACHO.pct=d.pct||0;
      DESPACHO.valorCatastral=d.valorCatastral||0;DESPACHO.valorCompra=d.valorCompra||0;
    }
  }catch(e){}
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
  var amort=Math.round(DESPACHO.valorCompra*0.03*prop*100)/100;
  /* IBI: usar importe real de gastos si está configurado; si no, estimar desde catastral */
  var ibiReal=gastoAnual('ibi');
  var ibi=ibiReal>0?Math.round(ibiReal*prop*100)/100:Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100;
  var GROUP_CASA=['hipoteca','comunidad','seg_hogar'];
  var GROUP_UTIL=['luz','gas','agua','digi'];
  var gastosCasa=0,gastosUtil=0;
  GASTOS_ITEMS.forEach(function(g){
    var a=gastoAnual(g.id);
    if(GROUP_CASA.indexOf(g.id)!==-1)gastosCasa+=a;
    else if(GROUP_UTIL.indexOf(g.id)!==-1)gastosUtil+=a;
  });
  var casaDeducible=Math.round(gastosCasa*prop*100)/100;
  var utilDeducible=Math.round(gastosUtil*prop*0.30*100)/100;
  return Math.round((amort+ibi+casaDeducible+utilDeducible)*100)/100;
}

/* ── computeDeclResult — cálculo unificado para declaración ── */
function computeDeclResult(base,irpfTotal){
  var gdPct=typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5;
  var baseAfterGD=Math.max(0,Math.round((base*(1-gdPct/100))*100)/100);
  var gdAmount=Math.round((base-baseAfterGD)*100)/100;
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
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="fiscalBack">&#8592;</button>';
  h+='<div class="sy-year" style="font-size:.9rem">&#9965; Configuraci\u00f3n Fiscal</div>';
  h+='</div>';
  h+='<div class="fiscal-tab-bar">';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='irpf'?' active':'')+'" id="fiscalTabIrpf">IRPF</button>';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='ing_gas'?' active':'')+'" id="fiscalTabIngGas">Ingresos<br>y Gastos</button>';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='desgrav'?' active':'')+'" id="fiscalTabDesgrav">Desgrava-<br>ciones</button>';
  h+='<button class="fiscal-tab-btn'+(FISCAL_TAB==='despacho'?' active':'')+'" id="fiscalTabDespacho">Despacho<br>en casa</button>';
  h+='</div>';
  h+='<div class="sy-body" style="padding:16px">';
  if(FISCAL_TAB==='irpf')h+=renderFiscalTabIrpf();
  else if(FISCAL_TAB==='ing_gas')h+=renderFiscalTabIngGas();
  else if(FISCAL_TAB==='desgrav')h+=renderFiscalTabDesgrav();
  else if(FISCAL_TAB==='despacho')h+=renderFiscalTabDespacho();
  h+='</div>';
  h+='<div class="fiscal-sticky-save">';
  h+='<button class="fiscal-save-btn" id="fiscalSave">Guardar configuraci\u00f3n</button>';
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
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Reducci\u00f3n sobre la base imponible para el c\u00e1lculo de la declaraci\u00f3n IRPF (est. directa simplificada).</div>';
  h+='<div class="econ-gastos-dificil-row">';
  h+='<span style="font-size:.82rem;color:var(--text-muted);flex:1">% sobre base imponible:</span>';
  h+='<input class="econ-gastos-dificil-input" id="gastosDificilInput" type="number" min="0" max="15" step="0.5" value="'+GASTOS_DIFICIL_PCT+'">';
  h+='<span style="font-size:.82rem;color:var(--text-muted)">%</span>';
  h+='</div></div>';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Tramos IRPF \u2014 Declaraci\u00f3n de la renta</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Tramos estatales 2025 por defecto. Se aplican sobre la base reducida.</div>';
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
  h+='<button class="econ-toggle-btn" id="fiscalRestore" style="margin-bottom:8px;color:var(--text-muted)">&#8635; Restaurar tramos 2025 por defecto</button>';
  return h;
}

/* ── Tab Ingresos y Gastos ───────────────────────────────── */
function renderFiscalTabIngGas(){
  var h='';
  /* Ingresos (verde) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title income">Ingresos Regulares (estimados)</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Ingresos recurrentes adicionales: alquileres, dividendos, pensiones, etc.</div>';
  h+='<div id="fiscalIngresosList">'+renderIngresosList()+'</div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-income" id="fiscalAddIngreso">+ A\u00f1adir ingreso</button>';
  h+='</div>';
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
  h+='<div class="fiscal-compras-iva-note">&#9888; Introduce los importes <b>sin IVA</b>. Como aut\u00f3nomo puedes deducir el IVA soportado por separado en el Mod.303.</div>';
  h+='<div id="fiscalComprasList">'+renderComprasList()+'</div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-expense" id="fiscalAddCompra">+ A\u00f1adir compra</button>';
  h+='</div>';
  return h;
}

/* ── renderComprasList ────────────────────────────────────── */
function renderComprasList(){
  var h='';
  var total=0;
  COMPRAS_ITEMS.forEach(function(c,i){
    if(c.enabled&&c.amount)total+=c.amount;
    var isFixed=DEFAULT_COMPRAS.some(function(d){return d.id===c.id;});
    h+='<div class="fiscal-gasto-item fiscal-compras-item" data-ci="'+i+'">';
    h+='<div class="fiscal-compras-toggle'+(c.enabled?' on':'')+'" data-ctgl="'+i+'">'+(c.enabled?'&#10003;':'')+'</div>';
    if(isFixed){
      h+='<span class="fiscal-gasto-lbl">'+escHtml(c.label)+'</span>';
    }else{
      h+='<input class="fiscal-gasto-lbl-input" data-ci="'+i+'" data-cfield="label" value="'+escHtml(c.label)+'" placeholder="Nombre...">';
    }
    h+='<input class="fiscal-gasto-amt" data-ci="'+i+'" data-cfield="amount" type="number" min="0" step="1" value="'+(c.amount||0)+'">';
    h+='<span class="fiscal-gasto-period-static">/a\u00f1o</span>';
    if(!isFixed){h+='<button class="fiscal-gasto-del fiscal-compras-del" data-ci="'+i+'">&#10005;</button>';}
    else{h+='<span style="width:22px"></span>';}
    h+='</div>';
  });
  if(total>0){
    h+='<div class="fiscal-compras-total">Total deducible: <b>'+fcPlain(total)+'</b></div>';
  }
  if(!COMPRAS_ITEMS.length)h+='<div style="font-size:.75rem;color:var(--text-dim);padding:6px 0">Sin compras configuradas.</div>';
  return h;
}

/* ── Tab Desgravaciones ──────────────────────────────────── */
function renderFiscalTabDesgrav(){
  var dg=computeTotalDesgrav();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Desgravaciones IRPF \u2014 Declaraci\u00f3n de la Renta</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:10px">Partidas que reducen la base imponible (o la cuota directamente) en la declaraci\u00f3n. Los items marcados con <em>&#128279;</em> se calculan autom\u00e1ticamente desde tus gastos.</div>';
  if(dg.total>0){
    h+='<div class="fiscal-desgrav-total">';
    if(dg.base>0)h+='Reducci\u00f3n de base: <b>'+fcPlain(dg.base)+'</b>';
    if(dg.base>0&&dg.quota>0)h+=' \u00b7 ';
    if(dg.quota>0)h+='Deducci\u00f3n en cuota: <b>'+fcPlain(dg.quota)+'</b>';
    h+='</div>';
  }
  /* Items tipo 'base' */
  var baseItems=DESGRAV_ITEMS.filter(function(it){return(it.type||'base')==='base';});
  var quotaItems=DESGRAV_ITEMS.filter(function(it){return it.type==='quota';});
  if(baseItems.length){
    h+='<div class="fiscal-desgrav-group-title">Reducciones en base imponible</div>';
    h+='<div id="fiscalDesgravList">'+renderDesgravList(baseItems,'base')+'</div>';
  }
  if(quotaItems.length){
    h+='<div class="fiscal-desgrav-group-title quota">Deducciones en cuota (reducen el impuesto directamente)</div>';
    h+='<div id="fiscalDesgravListQuota">'+renderDesgravList(quotaItems,'quota')+'</div>';
  }
  if(!baseItems.length&&!quotaItems.length){
    h+='<div id="fiscalDesgravList">'+renderDesgravList([],'base')+'</div>';
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
  var GROUP_CASA_DESP=['hipoteca','comunidad','seg_hogar'];
  var GROUP_UTIL_DESP=['luz','gas','agua','digi'];
  var ibiRealDesp=gastoAnual('ibi');
  var ibiLabel=ibiRealDesp>0?'IBI (real)':'IBI (estimado desde catastral)';
  var ibiAmt=ibiRealDesp>0?Math.round(ibiRealDesp*prop*100)/100:Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100;
  var casaItems=[],utilItems=[];
  GASTOS_ITEMS.forEach(function(g){
    var a=gastoAnual(g.id);
    if(a<=0)return;
    if(GROUP_CASA_DESP.indexOf(g.id)!==-1)casaItems.push({label:g.label,annual:a,ded:Math.round(a*prop*100)/100,pctLabel:propPct.toFixed(1)+'%'});
    else if(GROUP_UTIL_DESP.indexOf(g.id)!==-1)utilItems.push({label:g.label,annual:a,ded:Math.round(a*prop*0.30*100)/100,pctLabel:propPct.toFixed(1)+'% \u00d7 30%'});
  });
  var hasItems=ibiAmt>0||casaItems.length>0||utilItems.length>0||(DESPACHO.valorCompra>0&&prop>0);
  if(!hasItems||prop<=0)return '';
  var amort=Math.round(DESPACHO.valorCompra*0.03*prop*100)/100;
  var h='<div class="fiscal-section fiscal-desgrav-despacho-section">';
  h+='<div class="fiscal-desgrav-group-title" style="border-top:none;margin-top:0;padding-top:0">\uD83C\uDFE0 Gastos del hogar deducibles (% despacho = '+propPct.toFixed(1)+'%)</div>';
  if(prop<=0){
    h+='<div style="font-size:.72rem;color:var(--text-dim)">Configura el % del despacho en la pesta\u00f1a Despacho para ver el desglose.</div>';
  }else{
    h+='<div style="font-size:.7rem;color:var(--text-dim);margin-bottom:8px">Estas partidas se deducen autom\u00e1ticamente en proporci\u00f3n al % del despacho. El total aparece en la pesta\u00f1a Despacho.</div>';
    h+='<table class="fiscal-desgrav-info-table">';
    h+='<thead><tr><th>Gasto</th><th>Anual</th><th>% deducible</th><th>Deducible</th></tr></thead><tbody>';
    if(amort>0)h+='<tr><td>Amortizaci\u00f3n vivienda</td><td>'+fcPlain(Math.round(DESPACHO.valorCompra*0.03*100)/100)+'</td><td>'+propPct.toFixed(1)+'% (3% \u00d7 compra)</td><td class="fiscal-desgrav-info-ded">'+fcPlain(amort)+'</td></tr>';
    if(ibiAmt>0)h+='<tr><td>'+ibiLabel+'</td><td>'+(ibiRealDesp>0?fcPlain(ibiRealDesp):'est.')+'</td><td>'+propPct.toFixed(1)+'%</td><td class="fiscal-desgrav-info-ded">'+fcPlain(ibiAmt)+'</td></tr>';
    casaItems.forEach(function(it){h+='<tr><td>'+escHtml(it.label)+'</td><td>'+fcPlain(it.annual)+'</td><td>'+it.pctLabel+'</td><td class="fiscal-desgrav-info-ded">'+fcPlain(it.ded)+'</td></tr>';});
    utilItems.forEach(function(it){h+='<tr><td>'+escHtml(it.label)+'</td><td>'+fcPlain(it.annual)+'</td><td>'+it.pctLabel+'</td><td class="fiscal-desgrav-info-ded">'+fcPlain(it.ded)+'</td></tr>';});
    h+='</tbody></table>';
    var total=computeDespachoDeduccion();
    if(total>0)h+='<div class="fiscal-desgrav-despacho-total">Total deducci\u00f3n estimada despacho: <b>'+fcPlain(total)+'</b></div>';
  }
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

/* ── Tab Despacho en casa ─────────────────────────────────── */
function renderFiscalTabDespacho(){
  var prop=_despachoGetPct();
  var propPct=Math.round(prop*1000)/10;
  var deduccion=computeDespachoDeduccion();
  /* Calcular pct actual para mostrar en el campo */
  var pctShow=DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0
    ?Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10
    :DESPACHO.pct;
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
  h+=_despField('valorCatastral','Valor catastral del inmueble',DESPACHO.valorCatastral,'\u20ac');
  h+=_despField('valorCompra','Valor de compra / escritura',DESPACHO.valorCompra,'\u20ac');
  h+='</div>';
  if(prop>0){
    h+='<div class="fiscal-despacho-result'+(DESPACHO.enabled?' active':'')+'">';
    h+='<div class="fiscal-despacho-result-title">Deducci\u00f3n estimada anual</div>';
    h+='<div class="fiscal-despacho-result-val">'+(DESPACHO.enabled&&deduccion>0?fcPlain(deduccion):'— (desactivado)')+'</div>';
    if(deduccion>0){
      var amort=Math.round(DESPACHO.valorCompra*0.03*prop*100)/100;
      var ibiRealD=gastoAnual('ibi');
      var ibi=ibiRealD>0?Math.round(ibiRealD*prop*100)/100:Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100;
      var ibiLabel=ibiRealD>0?'IBI real ('+propPct.toFixed(1)+'%)':'IBI estimado (1.1% \u00d7 catastral \u00d7 '+propPct.toFixed(1)+'%)';
      var GROUP_CASA=['hipoteca','comunidad','seg_hogar'];
      var GROUP_UTIL=['luz','gas','agua','digi'];
      var gastosCasa=0,gastosUtil=0;
      GASTOS_ITEMS.forEach(function(g){
        var a=gastoAnual(g.id);
        if(GROUP_CASA.indexOf(g.id)!==-1)gastosCasa+=a;
        else if(GROUP_UTIL.indexOf(g.id)!==-1)gastosUtil+=a;
      });
      h+='<div class="fiscal-despacho-breakdown">';
      if(amort>0)h+='<div class="fiscal-despacho-comp">Amortizaci\u00f3n (3% \u00d7 compra \u00d7 '+propPct.toFixed(1)+'%): <b>'+fcPlain(amort)+'</b></div>';
      if(ibi>0)h+='<div class="fiscal-despacho-comp">'+ibiLabel+': <b>'+fcPlain(ibi)+'</b></div>';
      if(gastosCasa>0)h+='<div class="fiscal-despacho-comp">Gastos casa ('+propPct.toFixed(1)+'%): <b>'+fcPlain(Math.round(gastosCasa*prop*100)/100)+'</b></div>';
      if(gastosUtil>0)h+='<div class="fiscal-despacho-comp">Suministros ('+propPct.toFixed(1)+'% \u00d7 30%): <b>'+fcPlain(Math.round(gastosUtil*prop*0.30*100)/100)+'</b></div>';
      h+='</div>';
    }
    h+='</div>';
  }
  h+='</div>';
  return h;
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

/* ── bindFiscalEvents ─────────────────────────────────────── */
function bindFiscalEvents(){
  document.getElementById('fiscalBack').addEventListener('click',function(){closeFiscal();});
  bindNavBar('econ',closeFiscal);

  function _switchTab(tab){
    FISCAL_TAB=tab;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  }
  document.getElementById('fiscalTabIrpf').addEventListener('click',function(){_switchTab('irpf');});
  document.getElementById('fiscalTabIngGas').addEventListener('click',function(){_switchTab('ing_gas');});
  document.getElementById('fiscalTabDesgrav').addEventListener('click',function(){_switchTab('desgrav');});
  document.getElementById('fiscalTabDespacho').addEventListener('click',function(){_switchTab('despacho');});

  document.getElementById('fiscalSave').addEventListener('click',function(){_saveFiscalAll();});

  if(FISCAL_TAB==='irpf')_bindTabIrpf();
  else if(FISCAL_TAB==='ing_gas')_bindTabIngGas();
  else if(FISCAL_TAB==='desgrav')_bindTabDesgrav();
  else if(FISCAL_TAB==='despacho')_bindTabDespacho();
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
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });
  document.getElementById('fiscalAddBracket').addEventListener('click',function(){
    var brackets=getBrackets().slice();
    var last=brackets[brackets.length-1];
    brackets.push({from:last.to===Infinity?300000:last.to,to:Infinity,pct:47});
    FISCAL.brackets=brackets;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });
  document.querySelectorAll('.fbi-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var bi=parseInt(this.dataset.bi,10);
      var brackets=getBrackets().slice();
      if(brackets.length<=1){showToast('Debe haber al menos 1 tramo','error');return;}
      brackets.splice(bi,1);
      FISCAL.brackets=brackets;
      document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
      bindFiscalEvents();
    });
  });
}

function _bindTabIngGas(){
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
  /* Ingresos: event delegation */
  var ingresosList=document.getElementById('fiscalIngresosList');
  if(ingresosList&&!ingresosList._del){
    ingresosList._del=true;
    ingresosList.addEventListener('click',function(e){
      var btn=e.target.closest('.fiscal-period-btn[data-ifield="period"]');
      if(btn){
        var ii=parseInt(btn.dataset.ii,10);
        INGRESOS_ITEMS[ii].period=btn.dataset.val;
        btn.closest('.fiscal-gasto-period').querySelectorAll('.fiscal-period-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===btn.dataset.val);});
        return;
      }
      var del=e.target.closest('.fiscal-ingreso-del');
      if(del){
        INGRESOS_ITEMS.splice(parseInt(del.dataset.ii,10),1);
        document.getElementById('fiscalIngresosList').innerHTML=renderIngresosList();
      }
    });
    ingresosList.addEventListener('change',function(e){
      var el=e.target;var ii=parseInt(el.dataset.ii,10);if(isNaN(ii))return;
      var field=el.dataset.ifield;
      if(field==='amount'){var v=parseFloat(el.value);INGRESOS_ITEMS[ii].amount=isNaN(v)?0:v;}
      else if(field==='label'){INGRESOS_ITEMS[ii].label=el.value||'Ingreso';}
    });
  }
  document.getElementById('fiscalAddIngreso').addEventListener('click',function(){
    INGRESOS_ITEMS.push({id:'ingreso_'+Date.now(),label:'Nuevo ingreso',amount:0,period:'monthly'});
    document.getElementById('fiscalIngresosList').innerHTML=renderIngresosList();
  });
  /* Compras: event delegation */
  var comprasList=document.getElementById('fiscalComprasList');
  if(comprasList&&!comprasList._del){
    comprasList._del=true;
    comprasList.addEventListener('click',function(e){
      var tgl=e.target.closest('[data-ctgl]');
      if(tgl){
        var ci=parseInt(tgl.dataset.ctgl,10);
        COMPRAS_ITEMS[ci].enabled=!COMPRAS_ITEMS[ci].enabled;
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
    });
  }
  document.getElementById('fiscalAddCompra').addEventListener('click',function(){
    COMPRAS_ITEMS.push({id:'compra_'+Date.now(),label:'Nueva compra',amount:0,enabled:true});
    document.getElementById('fiscalComprasList').innerHTML=renderComprasList();
  });
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
        document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
        bindFiscalEvents();
        return;
      }
      var del=e.target.closest('.fiscal-desgrav-del');
      if(del){
        var di=parseInt(del.dataset.di,10);
        DESGRAV_ITEMS.splice(di,1);
        document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
        bindFiscalEvents();
      }
    });
    list.addEventListener('change',function(e){
      var el=e.target;
      var di=parseInt(el.dataset.di,10);if(isNaN(di))return;
      var field=el.dataset.difield;
      if(el.classList.contains('fiscal-desgrav-amt')){
        var v=parseFloat(el.value);DESGRAV_ITEMS[di].amount=isNaN(v)?0:v;
        document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
        bindFiscalEvents();
      }else if(field==='label'){DESGRAV_ITEMS[di].label=el.value||'Desgravaci\u00f3n';}
    });
  }
  _bindList('fiscalDesgravList');
  _bindList('fiscalDesgravListQuota');
  document.getElementById('fiscalAddDesgrav').addEventListener('click',function(){
    DESGRAV_ITEMS.push({id:'desgrav_'+Date.now(),label:'Nueva desgravaci\u00f3n',amount:0,limit:null,enabled:true,type:'base'});
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });
}

function _bindTabDespacho(){
  /* Toggle on/off */
  var tog=document.getElementById('despachoToggle');
  if(tog)tog.addEventListener('click',function(){
    DESPACHO.enabled=!DESPACHO.enabled;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
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
      document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
      bindFiscalEvents();
    });
  }
  if(m2DespEl){
    m2DespEl.addEventListener('input',function(){_syncLive('m2Despacho');});
    m2DespEl.addEventListener('change',function(){
      DESPACHO.m2Despacho=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.pct=Math.round(DESPACHO.m2Despacho/DESPACHO.m2Total*1000)/10;
      document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
      bindFiscalEvents();
    });
  }
  if(pctEl){
    pctEl.addEventListener('input',function(){_syncLive('pct');});
    pctEl.addEventListener('change',function(){
      DESPACHO.pct=parseFloat(this.value)||0;
      if(DESPACHO.m2Total>0)DESPACHO.m2Despacho=Math.round(DESPACHO.pct*DESPACHO.m2Total/100*10)/10;
      document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
      bindFiscalEvents();
    });
  }
  /* Valor catastral y valor compra */
  ['valorCatastral','valorCompra'].forEach(function(field){
    var el=document.getElementById('desp-'+field);
    if(!el)return;
    el.addEventListener('change',function(){
      DESPACHO[field]=parseFloat(this.value)||0;
      document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
      bindFiscalEvents();
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
  if(FISCAL_TAB==='irpf'){
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
  saveFiscal();
  saveGastos();
  saveIngresos();
  saveDesgrav();
  saveDespacho();
  saveCompras();
  showToast('Configuraci\u00f3n guardada','success');
  closeFiscal();
  var ec=document.getElementById('econContent');
  if(ec&&ec.innerHTML){ec.innerHTML=renderEconContent();bindEconEvents();}
}
