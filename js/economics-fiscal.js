/* ============================================================
   FISCAL RENDER - Las pestanas de la ventana fiscal.
   Funciones puras: devuelven HTML y no tocan el DOM.
   Los datos estan en economics-fiscal-datos.js y los listeners en
   economics-fiscal-bind.js.
   ============================================================ */

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
  if(PERSONAL_DATA.gastosSemanales.length<2){h+='<button class="fiscal-add-btn fiscal-add-btn-expense" data-padd="gastosSemanales" style="margin-bottom:6px">+ A\u00f1adir gasto semanal</button>';}
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
  /* Cálculo amortización inmueble: replica computeDespachoDeduccion para que UI cuadre */
  var vcInfo=DESPACHO.valorCatastral||0, vccInfo=DESPACHO.valorCatastralConstruccion||0;
  var precioAdqInfo=DESPACHO.valorCompra||0;
  if(DESPACHO.compra){
    var _c=DESPACHO.compra;
    precioAdqInfo=(_c.valorCompraTotal||DESPACHO.valorCompra||0)+(_c.itpMadrid||0)+(_c.notariaRegistro||0)+(_c.tasacion||0)+(_c.inmobiliaria||0);
  }
  var amort=0;
  var amortBase=0;
  var amortLabel='';
  if(vcInfo>0&&vccInfo>0&&precioAdqInfo>0){
    /* Método AEAT: ratio real construcción × precio adquisición (incluye gastos) */
    var ratioConstr=vccInfo/vcInfo;
    amortBase=Math.round(precioAdqInfo*ratioConstr*100)/100;
    amort=Math.round(amortBase*0.03*prop*100)/100;
    amortLabel='Amortización inmueble ('+(ratioConstr*100).toFixed(1).replace('.',',')+'% construc.)';
  } else if(precioAdqInfo>0){
    /* Fallback 80% asumido — aviso visible al usuario */
    amortBase=Math.round(precioAdqInfo*0.80*100)/100;
    amort=Math.round(amortBase*0.03*prop*100)/100;
    amortLabel='Amortización inmueble (80% asumido — falta VC construc.)';
  }
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
  h+='<div style="font-size:.66rem;color:var(--c-orange);background:rgba(251,146,60,.08);border:1px solid rgba(251,146,60,.25);border-radius:6px;padding:6px 8px;margin-bottom:8px;line-height:1.4">\u26a0 Estos importes son lo que se <b>deduce de la BASE imponible</b> (\u2248 ingresos \u2212 gastos), no euros sonantes que te ahorras. Para ver el ahorro REAL en \u20ac sobre tu cuota IRPF, ve a <button class="fiscal-link-btn" id="despFiscalGotoAhorro" style="font-size:.66rem;color:var(--accent-bright);background:none;border:none;cursor:pointer;padding:0;text-decoration:underline">An\u00e1lisis Gastos \u2192 Resultado declaraci\u00f3n</button> donde ver\u00e1s el desglose por partida.</div>';
  h+='<div class="fiscal-ded-cards">';
  if(amort>0)h+=_dedCard(amortLabel,fcPlain(amortBase),'3% \u00d7 '+propPct.toFixed(1)+'%',amort,'#c084fc','<button class="fiscal-link-btn fiscal-desp-link" data-link-tab="despacho-sub" style="font-size:.62rem;color:var(--accent-bright);background:none;border:none;cursor:pointer;padding:0">&#128279; Despacho</button><div style="font-size:.6rem;color:var(--text-dim);margin-top:2px">Gasto deducible como aut\u00f3nomo (proporci\u00f3n despacho).</div>','amortizacion');
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
