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

/* ── Ingresos regulares ───────────────────────────────────────── */
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

/* ── Gastos regulares ─────────────────────────────────────────── */
var GASTOS_SK='excelia-gastos-v1';
var GASTOS_DIFICIL_PCT=5; // % gastos difícil justificación
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

/* ── Cálculo IRPF por tramos ──────────────────────────────────── */
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

/* ── Render fiscal modal ──────────────────────────────────────── */
function renderFiscalContent(){
  var brackets=getBrackets();
  var h=renderNavBar('econ');
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="fiscalBack">&#8592;</button>';
  h+='<div class="sy-year" style="font-size:.9rem">&#9965; Configuraci\u00f3n Fiscal</div>';
  h+='</div>';
  h+='<div class="sy-body" style="padding:16px">';

  /* § IRPF retención */
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

  /* § Gastos difícil justificación */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Gastos de dif&#237;cil justificaci\u00f3n</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Reducci\u00f3n sobre la base imponible para el c\u00e1lculo de la declaraci\u00f3n IRPF (est. directa simplificada). Solo aplica al c\u00e1lculo de la declaraci\u00f3n, no a la retenci\u00f3n en facturas.</div>';
  h+='<div class="econ-gastos-dificil-row">';
  h+='<span style="font-size:.82rem;color:var(--text-muted);flex:1">% sobre base imponible:</span>';
  h+='<input class="econ-gastos-dificil-input" id="gastosDificilInput" type="number" min="0" max="15" step="0.5" value="'+GASTOS_DIFICIL_PCT+'">';
  h+='<span style="font-size:.82rem;color:var(--text-muted)">%</span>';
  h+='</div></div>';

  /* § Ingresos regulares */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Ingresos Regulares (estimados)</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Ingresos recurrentes adicionales a tu actividad principal (alquileres, dividendos, etc.). Se a\u00f1aden al flujo tras las tasas semiobligatorias.</div>';
  h+='<div id="fiscalIngresosList">';
  h+=renderIngresosList();
  h+='</div>';
  h+='<button class="fiscal-add-btn" id="fiscalAddIngreso">+ A\u00f1adir ingreso</button>';
  h+='</div>';

  /* § Gastos regulares */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Gastos regulares (estimados)</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Edita cada gasto para calcular el neto disponible real. Indica si son mensuales (&#215;12) o anuales.</div>';
  h+='<div id="fiscalGastosList">';
  h+=renderGastosList();
  h+='</div>';
  h+='<button class="fiscal-add-btn" id="fiscalAddGasto">+ A\u00f1adir gasto</button>';
  h+='</div>';

  /* § Tramos declaración IRPF */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">Tramos IRPF \u2014 Declaraci\u00f3n de la renta</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Tramos estatales 2025 por defecto. Se aplican sobre la base reducida (descontando gastos dif&#237;cil justificaci\u00f3n).</div>';
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
  h+='<button class="fiscal-save-btn" id="fiscalSave">Guardar configuraci\u00f3n</button>';
  h+='</div>';
  return h;
}

function renderGastosList(){
  var h='';
  GASTOS_ITEMS.forEach(function(g,i){
    var isFixed=DEFAULT_GASTOS.some(function(d){return d.id===g.id;});
    h+='<div class="fiscal-gasto-item" data-gi="'+i+'">';
    if(isFixed){
      h+='<span class="fiscal-gasto-lbl">'+g.label+'</span>';
    } else {
      h+='<input class="fiscal-gasto-lbl-input" data-gi="'+i+'" data-gfield="label" value="'+escHtml(g.label)+'" placeholder="Nombre...">';
    }
    h+='<input class="fiscal-gasto-amt" data-gi="'+i+'" data-gfield="amount" type="number" min="0" step="1" value="'+(g.amount||0)+'">';
    h+='<div class="fiscal-gasto-period">';
    h+='<button class="fiscal-period-btn'+(g.period==='monthly'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="monthly">/mes</button>';
    h+='<button class="fiscal-period-btn'+(g.period==='annual'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="annual">/año</button>';
    h+='</div>';
    if(!isFixed){h+='<button class="fiscal-gasto-del" data-gi="'+i+'">&#10005;</button>';}
    else{h+='<span style="width:22px"></span>';}
    h+='</div>';
  });
  return h;
}

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

function bindFiscalEvents(){
  document.getElementById('fiscalBack').addEventListener('click',function(){closeFiscal();});
  bindNavBar('econ',closeFiscal);

  // IRPF mode radio
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

  // Gastos difícil
  var gdInput=document.getElementById('gastosDificilInput');
  if(gdInput)gdInput.addEventListener('change',function(){
    var v=parseFloat(this.value);
    if(v>=0&&v<=15)GASTOS_DIFICIL_PCT=v;
  });

  // Gastos: event delegation
  var gastosList=document.getElementById('fiscalGastosList');
  if(gastosList&&!gastosList._del){
    gastosList._del=true;
    gastosList.addEventListener('click',function(e){
      var btn=e.target.closest('.fiscal-period-btn');
      if(btn){
        var gi=parseInt(btn.dataset.gi,10);
        GASTOS_ITEMS[gi].period=btn.dataset.val;
        btn.closest('.fiscal-gasto-period').querySelectorAll('.fiscal-period-btn').forEach(function(b){b.classList.toggle('active',b.dataset.val===btn.dataset.val);});
        return;
      }
      var del=e.target.closest('.fiscal-gasto-del');
      if(del){
        var gi=parseInt(del.dataset.gi,10);
        GASTOS_ITEMS.splice(gi,1);
        document.getElementById('fiscalGastosList').innerHTML=renderGastosList();
      }
    });
    gastosList.addEventListener('change',function(e){
      var el=e.target;
      var gi=parseInt(el.dataset.gi,10);
      if(isNaN(gi))return;
      var field=el.dataset.gfield;
      if(field==='amount'){var v=parseFloat(el.value);GASTOS_ITEMS[gi].amount=isNaN(v)?0:v;}
      else if(field==='label'){GASTOS_ITEMS[gi].label=el.value||'Gasto';}
    });
  }

  // Añadir gasto custom
  document.getElementById('fiscalAddGasto').addEventListener('click',function(){
    GASTOS_ITEMS.push({id:'custom_'+Date.now(),label:'Nuevo gasto',amount:0,period:'monthly'});
    document.getElementById('fiscalGastosList').innerHTML=renderGastosList();
  });

  // Ingresos: event delegation
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
      var el=e.target;
      var ii=parseInt(el.dataset.ii,10);
      if(isNaN(ii))return;
      var field=el.dataset.ifield;
      if(field==='amount'){var v=parseFloat(el.value);INGRESOS_ITEMS[ii].amount=isNaN(v)?0:v;}
      else if(field==='label'){INGRESOS_ITEMS[ii].label=el.value||'Ingreso';}
    });
  }

  // Añadir ingreso
  document.getElementById('fiscalAddIngreso').addEventListener('click',function(){
    INGRESOS_ITEMS.push({id:'ingreso_'+Date.now(),label:'Nuevo ingreso',amount:0,period:'monthly'});
    document.getElementById('fiscalIngresosList').innerHTML=renderIngresosList();
  });

  // Tramos: restaurar
  document.getElementById('fiscalRestore').addEventListener('click',function(){
    FISCAL.brackets=null;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });

  // Añadir tramo
  document.getElementById('fiscalAddBracket').addEventListener('click',function(){
    var brackets=getBrackets().slice();
    var last=brackets[brackets.length-1];
    brackets.push({from:last.to===Infinity?300000:last.to,to:Infinity,pct:47});
    FISCAL.brackets=brackets;
    document.getElementById('fiscalContent').innerHTML=renderFiscalContent();
    bindFiscalEvents();
  });

  // Eliminar tramos
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

  // Guardar
  document.getElementById('fiscalSave').addEventListener('click',function(){
    // Validar IRPF
    if(FISCAL.irpfMode==='custom'){
      var pct=parseFloat(document.getElementById('fiscalPctInput').value);
      if(isNaN(pct)||pct<=15){
        document.getElementById('fiscalPctError').style.display='';
        showToast('El IRPF personalizado debe ser &gt;15%','error');return;
      }
      FISCAL.irpfPct=Math.round(pct*100)/100;
    }
    // Leer tramos
    var rows=document.querySelectorAll('#fiscalBracketTable tbody tr');
    var brackets=[];
    rows.forEach(function(row){
      var fromV=parseFloat(row.querySelector('.fbi-from').value)||0;
      var toRaw=row.querySelector('.fbi-to').value;
      var toV=toRaw===''?Infinity:parseFloat(toRaw)||0;
      brackets.push({from:fromV,to:toV,pct:parseFloat(row.querySelector('.fbi-pct').value)||0});
    });
    if(brackets.length===0){showToast('Tramos inv\u00e1lidos','error');return;}
    FISCAL.brackets=brackets;
    // Gastos difícil
    var gdV=parseFloat(document.getElementById('gastosDificilInput').value);
    if(!isNaN(gdV)&&gdV>=0&&gdV<=15)GASTOS_DIFICIL_PCT=gdV;
    // Guardar todos
    saveFiscal();
    saveGastos();
    saveIngresos();
    showToast('Configuraci\u00f3n guardada','success');
    closeFiscal();
    var ec=document.getElementById('econContent');
    if(ec&&ec.innerHTML){ec.innerHTML=renderEconContent();bindEconEvents();}
  });
}
