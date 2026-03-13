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
  {id:'otros_seg',label:'Otros seguros',amount:0,period:'annual'},
  {id:'hipoteca',label:'Hipoteca',amount:0,period:'monthly'},
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

/* ── Desgravaciones IRPF ─────────────────────────────────── */
var DESGRAV_SK='excelia-desgrav-v1';
var DESGRAV_DEFAULT=[
  {id:'plan_pension',label:'Plan de pensiones',amount:0,limit:1500,enabled:true},
  {id:'seg_salud_titular',label:'Seguro salud (titular)',amount:0,limit:500,enabled:true},
  {id:'seg_salud_conyuge',label:'Seguro salud (c\u00f3nyuge)',amount:0,limit:500,enabled:false},
  {id:'seg_salud_hijos',label:'Seguro salud (hijos)',amount:0,limit:500,enabled:false},
  {id:'colegio_prof',label:'Cuota colegio profesional',amount:0,limit:500,enabled:false},
  {id:'donativos',label:'Donativos',amount:0,limit:null,enabled:false}
];
var DESGRAV_ITEMS=[];

function loadDesgrav(){
  try{
    var r=localStorage.getItem(DESGRAV_SK);
    if(r){var d=JSON.parse(r);DESGRAV_ITEMS=d.items||JSON.parse(JSON.stringify(DESGRAV_DEFAULT));}
    else{DESGRAV_ITEMS=JSON.parse(JSON.stringify(DESGRAV_DEFAULT));}
  }catch(e){DESGRAV_ITEMS=JSON.parse(JSON.stringify(DESGRAV_DEFAULT));}
}
function saveDesgrav(){
  try{localStorage.setItem(DESGRAV_SK,JSON.stringify({items:DESGRAV_ITEMS}));}catch(e){}
}
function desgravAnual(item){
  if(!item.enabled||!item.amount)return 0;
  var d=item.amount;
  if(item.limit!==null&&item.limit!==undefined)d=Math.min(d,item.limit);
  return Math.round(d*100)/100;
}
function computeTotalDesgrav(){
  var total=0;
  DESGRAV_ITEMS.forEach(function(item){total+=desgravAnual(item);});
  return Math.round(total*100)/100;
}

/* ── Despacho en casa ─────────────────────────────────────── */
var DESPACHO_SK='excelia-despacho-v1';
var DESPACHO={enabled:false,m2Total:0,m2Despacho:0,usePct:false,pct:0,valorCatastral:0,valorCompra:0};

function loadDespacho(){
  try{
    var r=localStorage.getItem(DESPACHO_SK);
    if(r){var d=JSON.parse(r);
      DESPACHO.enabled=!!d.enabled;DESPACHO.m2Total=d.m2Total||0;DESPACHO.m2Despacho=d.m2Despacho||0;
      DESPACHO.usePct=!!d.usePct;DESPACHO.pct=d.pct||0;
      DESPACHO.valorCatastral=d.valorCatastral||0;DESPACHO.valorCompra=d.valorCompra||0;
    }
  }catch(e){}
}
function saveDespacho(){
  try{localStorage.setItem(DESPACHO_SK,JSON.stringify(DESPACHO));}catch(e){}
}
function _despachoGetPct(){
  if(DESPACHO.usePct)return DESPACHO.pct/100;
  if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0)return DESPACHO.m2Despacho/DESPACHO.m2Total;
  return 0;
}
function computeDespachoDeduccion(){
  if(!DESPACHO.enabled)return 0;
  var prop=_despachoGetPct();
  if(prop<=0)return 0;
  // Amortización: valor compra × 3% × proporción
  var amort=Math.round(DESPACHO.valorCompra*0.03*prop*100)/100;
  // IBI estimado: valor catastral × 1.1% × proporción
  var ibi=Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100;
  // Gastos casa proporcionales (hipoteca, comunidad, seguro hogar)
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
  var totalDesgrav=computeTotalDesgrav();
  if(DESPACHO.enabled)totalDesgrav=Math.round((totalDesgrav+computeDespachoDeduccion())*100)/100;
  var baseDecl=Math.max(0,Math.round((baseAfterGD-totalDesgrav)*100)/100);
  var decl=computeIrpfBrackets(baseDecl);
  var declDiff=Math.round((decl.totalTax-irpfTotal)*100)/100;
  return{gdPct:gdPct,gdAmount:gdAmount,baseAfterGD:baseAfterGD,totalDesgrav:totalDesgrav,baseDecl:baseDecl,decl:decl,declDiff:declDiff};
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
  /* Tab bar — Nivel 2 */
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
  /* Sticky save */
  h+='<div class="fiscal-sticky-save">';
  h+='<button class="fiscal-save-btn" id="fiscalSave">Guardar configuraci\u00f3n</button>';
  h+='</div>';
  return h;
}

/* ── Tab IRPF ─────────────────────────────────────────────── */
function renderFiscalTabIrpf(){
  var brackets=getBrackets();
  var h='';
  /* Retención IRPF */
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
  /* Gastos difícil justificación */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Gastos de dif&#237;cil justificaci\u00f3n</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Reducci\u00f3n sobre la base imponible para el c\u00e1lculo de la declaraci\u00f3n IRPF (est. directa simplificada).</div>';
  h+='<div class="econ-gastos-dificil-row">';
  h+='<span style="font-size:.82rem;color:var(--text-muted);flex:1">% sobre base imponible:</span>';
  h+='<input class="econ-gastos-dificil-input" id="gastosDificilInput" type="number" min="0" max="15" step="0.5" value="'+GASTOS_DIFICIL_PCT+'">';
  h+='<span style="font-size:.82rem;color:var(--text-muted)">%</span>';
  h+='</div></div>';
  /* Tramos IRPF */
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
  /* Ingresos primero (verde) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title income">Ingresos Regulares (estimados)</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Ingresos recurrentes adicionales: alquileres, dividendos, etc.</div>';
  h+='<div id="fiscalIngresosList">';
  h+=renderIngresosList();
  h+='</div>';
  h+='<button class="fiscal-add-btn fiscal-add-btn-income" id="fiscalAddIngreso">+ A\u00f1adir ingreso</button>';
  h+='</div>';
  /* Gastos regulares (rojo) */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title expense">Gastos regulares (estimados)</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Edita cada gasto para calcular el neto disponible real.</div>';
  h+='<div id="fiscalGastosList">';
  h+=renderGastosList();
  h+='</div>';
  h+='<button class="fiscal-add-btn" id="fiscalAddGasto">+ A\u00f1adir gasto</button>';
  h+='</div>';
  return h;
}

/* ── Tab Desgravaciones ──────────────────────────────────── */
function renderFiscalTabDesgrav(){
  var totalActual=computeTotalDesgrav();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Desgravaciones IRPF \u2014 Declaraci\u00f3n de la Renta</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:10px">Reducciones adicionales sobre la base imponible en la declaraci\u00f3n. Cada partida reduce la base antes de aplicar los tramos.</div>';
  if(totalActual>0){
    h+='<div class="fiscal-desgrav-total">Total desgravaciones activas: <b>'+fcPlain(totalActual)+'</b></div>';
  }
  h+='<div id="fiscalDesgravList">'+renderDesgravList()+'</div>';
  h+='<button class="fiscal-add-btn" id="fiscalAddDesgrav">+ A\u00f1adir desgravaci\u00f3n</button>';
  h+='</div>';
  return h;
}

function renderDesgravList(){
  var h='';
  DESGRAV_ITEMS.forEach(function(item,i){
    var efectiva=desgravAnual(item);
    var isFixed=DESGRAV_DEFAULT.some(function(d){return d.id===item.id;});
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
    h+='<input class="fiscal-desgrav-amt" data-di="'+i+'" type="number" min="0" step="1" value="'+(item.amount||0)+'" placeholder="\u20ac/a\u00f1o">';
    if(efectiva>0&&item.amount>0){
      var capado=item.limit&&item.amount>item.limit;
      h+='<span class="fiscal-desgrav-eff'+(capado?' capped':'')+'">&#8594; '+fcPlain(efectiva)+'</span>';
    }
    h+='</div>';
    h+='</div>';
    if(!isFixed){h+='<button class="fiscal-gasto-del fiscal-desgrav-del" data-di="'+i+'">&#10005;</button>';}
    h+='</div>';
  });
  if(!DESGRAV_ITEMS.length)h+='<div style="font-size:.75rem;color:var(--text-dim);padding:6px 0">Sin desgravaciones configuradas.</div>';
  return h;
}

/* ── Tab Despacho en casa ─────────────────────────────────── */
function renderFiscalTabDespacho(){
  var prop=_despachoGetPct();
  var propPct=Math.round(prop*1000)/10;
  var deduccion=computeDespachoDeduccion();
  var h='';
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Despacho en casa \u2014 Deducci\u00f3n IRPF</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:12px">Configura el espacio dedicado al trabajo para calcular la deducci\u00f3n fiscal estimada sobre la base de la declaraci\u00f3n.</div>';
  /* Toggle activar/desactivar */
  h+='<div class="fiscal-despacho-toggle-row">';
  h+='<span class="fiscal-despacho-toggle-lbl">Activar deducci\u00f3n despacho</span>';
  h+='<div class="fiscal-onoff'+(DESPACHO.enabled?' on':'')+'" id="despachoToggle">'+(DESPACHO.enabled?'ON':'OFF')+'</div>';
  h+='</div>';
  /* Método de cálculo */
  h+='<div style="font-size:.8rem;color:var(--text-muted);margin:10px 0 6px">M\u00e9todo de c\u00e1lculo de proporci\u00f3n:</div>';
  h+='<div style="display:flex;gap:8px;margin-bottom:12px">';
  h+='<button class="fiscal-period-btn'+(DESPACHO.usePct?'':' active')+'" id="despachoModeM2">Por m\u00b2</button>';
  h+='<button class="fiscal-period-btn'+(DESPACHO.usePct?' active':'')+'" id="despachoModePct">Por %</button>';
  h+='</div>';
  /* Campos */
  h+='<div class="fiscal-despacho-grid">';
  if(!DESPACHO.usePct){
    h+=_despField('m2Total','M\u00b2 totales de la casa',DESPACHO.m2Total,'m\u00b2');
    h+=_despField('m2Despacho','M\u00b2 del despacho',DESPACHO.m2Despacho,'m\u00b2');
    if(DESPACHO.m2Total>0&&DESPACHO.m2Despacho>0){
      h+='<div class="fiscal-despacho-derived">Proporci\u00f3n calculada: <b>'+propPct.toFixed(1)+'%</b></div>';
    }
  }else{
    h+=_despField('pct','% del espacio usado como despacho',DESPACHO.pct,'%');
  }
  h+=_despField('valorCatastral','Valor catastral del inmueble',DESPACHO.valorCatastral,'\u20ac');
  h+=_despField('valorCompra','Valor de compra / escritura',DESPACHO.valorCompra,'\u20ac');
  h+='</div>';
  /* Resultado estimado */
  if(prop>0){
    h+='<div class="fiscal-despacho-result'+(DESPACHO.enabled?' active':'')+'">';
    h+='<div class="fiscal-despacho-result-title">Deducci\u00f3n estimada anual</div>';
    h+='<div class="fiscal-despacho-result-val">'+(DESPACHO.enabled&&deduccion>0?fcPlain(deduccion):'— (desactivado)')+'</div>';
    if(deduccion>0){
      /* Desglose componentes */
      var amort=Math.round(DESPACHO.valorCompra*0.03*prop*100)/100;
      var ibi=Math.round(DESPACHO.valorCatastral*0.011*prop*100)/100;
      var GROUP_CASA=['hipoteca','comunidad','seg_hogar'];
      var GROUP_UTIL=['luz','gas','agua','digi'];
      var gastosCasa=0,gastosUtil=0;
      GASTOS_ITEMS.forEach(function(g){
        var a=gastoAnual(g.id);
        if(GROUP_CASA.indexOf(g.id)!==-1)gastosCasa+=a;
        else if(GROUP_UTIL.indexOf(g.id)!==-1)gastosUtil+=a;
      });
      h+='<div class="fiscal-despacho-breakdown">';
      if(amort>0)h+='<div class="fiscal-despacho-comp">Amortizaci\u00f3n (3% compra \u00d7 '+propPct.toFixed(1)+'%): <b>'+fcPlain(amort)+'</b></div>';
      if(ibi>0)h+='<div class="fiscal-despacho-comp">IBI estimado (1.1% catastral \u00d7 '+propPct.toFixed(1)+'%): <b>'+fcPlain(ibi)+'</b></div>';
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

  /* Tabs */
  function _switchTab(tab){
    FISCAL_TAB=tab;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  }
  document.getElementById('fiscalTabIrpf').addEventListener('click',function(){_switchTab('irpf');});
  document.getElementById('fiscalTabIngGas').addEventListener('click',function(){_switchTab('ing_gas');});
  document.getElementById('fiscalTabDesgrav').addEventListener('click',function(){_switchTab('desgrav');});
  document.getElementById('fiscalTabDespacho').addEventListener('click',function(){_switchTab('despacho');});

  /* Guardar (siempre presente) */
  document.getElementById('fiscalSave').addEventListener('click',function(){_saveFiscalAll();});

  /* Bind tab-specific events */
  if(FISCAL_TAB==='irpf')_bindTabIrpf();
  else if(FISCAL_TAB==='ing_gas')_bindTabIngGas();
  else if(FISCAL_TAB==='desgrav')_bindTabDesgrav();
  else if(FISCAL_TAB==='despacho')_bindTabDespacho();
}

function _bindTabIrpf(){
  /* IRPF mode radio */
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
  /* Gastos difícil */
  var gdInput=document.getElementById('gastosDificilInput');
  if(gdInput)gdInput.addEventListener('change',function(){
    var v=parseFloat(this.value);
    if(v>=0&&v<=15)GASTOS_DIFICIL_PCT=v;
  });
  /* Restaurar tramos */
  document.getElementById('fiscalRestore').addEventListener('click',function(){
    FISCAL.brackets=null;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });
  /* Añadir tramo */
  document.getElementById('fiscalAddBracket').addEventListener('click',function(){
    var brackets=getBrackets().slice();
    var last=brackets[brackets.length-1];
    brackets.push({from:last.to===Infinity?300000:last.to,to:Infinity,pct:47});
    FISCAL.brackets=brackets;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });
  /* Eliminar tramos */
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
        var gi=parseInt(del.dataset.gi,10);
        GASTOS_ITEMS.splice(gi,1);
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
        var ii=parseInt(del.dataset.ii,10);
        INGRESOS_ITEMS.splice(ii,1);
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
}

function _bindTabDesgrav(){
  var list=document.getElementById('fiscalDesgravList');
  if(list&&!list._del){
    list._del=true;
    list.addEventListener('click',function(e){
      var tgl=e.target.closest('[data-dtgl]');
      if(tgl){
        var di=parseInt(tgl.dataset.dtgl,10);
        DESGRAV_ITEMS[di].enabled=!DESGRAV_ITEMS[di].enabled;
        document.getElementById('fiscalDesgravList').innerHTML=renderDesgravList();
        return;
      }
      var del=e.target.closest('.fiscal-desgrav-del');
      if(del){
        var di=parseInt(del.dataset.di,10);
        DESGRAV_ITEMS.splice(di,1);
        document.getElementById('fiscalDesgravList').innerHTML=renderDesgravList();
      }
    });
    list.addEventListener('change',function(e){
      var el=e.target;
      var di=parseInt(el.dataset.di,10);if(isNaN(di))return;
      var field=el.dataset.difield;
      if(el.classList.contains('fiscal-desgrav-amt')){
        var v=parseFloat(el.value);DESGRAV_ITEMS[di].amount=isNaN(v)?0:v;
        document.getElementById('fiscalDesgravList').innerHTML=renderDesgravList();
      }else if(field==='label'){DESGRAV_ITEMS[di].label=el.value||'Desgravaci\u00f3n';}
    });
  }
  document.getElementById('fiscalAddDesgrav').addEventListener('click',function(){
    DESGRAV_ITEMS.push({id:'desgrav_'+Date.now(),label:'Nueva desgravaci\u00f3n',amount:0,limit:null,enabled:true});
    document.getElementById('fiscalDesgravList').innerHTML=renderDesgravList();
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
  /* Método m² / % */
  var modeM2=document.getElementById('despachoModeM2');
  var modePct=document.getElementById('despachoModePct');
  if(modeM2)modeM2.addEventListener('click',function(){
    DESPACHO.usePct=false;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });
  if(modePct)modePct.addEventListener('click',function(){
    DESPACHO.usePct=true;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });
  /* Campos numéricos */
  ['m2Total','m2Despacho','pct','valorCatastral','valorCompra'].forEach(function(field){
    var el=document.getElementById('desp-'+field);
    if(!el)return;
    el.addEventListener('change',function(){
      var v=parseFloat(this.value)||0;
      DESPACHO[field]=v;
      document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
      bindFiscalEvents();
    });
  });
}

/* ── _saveFiscalAll — guardar todo ────────────────────────── */
function _saveFiscalAll(){
  /* Validar IRPF si estamos en esa tab (o siempre) */
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
  /* Leer tramos si estamos en tab IRPF */
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
  /* Guardar todo */
  saveFiscal();
  saveGastos();
  saveIngresos();
  saveDesgrav();
  saveDespacho();
  showToast('Configuraci\u00f3n guardada','success');
  closeFiscal();
  var ec=document.getElementById('econContent');
  if(ec&&ec.innerHTML){ec.innerHTML=renderEconContent();bindEconEvents();}
}
