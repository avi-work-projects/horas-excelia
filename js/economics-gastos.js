/* ============================================================
   ECONOMICS GASTOS — Tab 4: Análisis de gastos e impuestos
   ============================================================ */

var GASTOS_TOGGLES_SK='excelia-gastos-tgl-v1';
var GASTOS_TOGGLES={}; // id → bool (true = incluido en cascade)

function loadGastosToggles(){
  try{
    var r=localStorage.getItem(GASTOS_TOGGLES_SK);
    if(r)GASTOS_TOGGLES=JSON.parse(r);
  }catch(e){}
}
function saveGastosToggles(){
  try{localStorage.setItem(GASTOS_TOGGLES_SK,JSON.stringify(GASTOS_TOGGLES));}catch(e){}
}
function isTglOn(id){
  return GASTOS_TOGGLES[id]!==false; // por defecto ON
}

/* ── Render Tab 4 ─────────────────────────────────────────────── */
function renderEconGastos(){
  var e=computeEconEx(ECON_YEAR);
  var dr=typeof computeDeclResult==='function'?computeDeclResult(e.totBase,e.totIrpf):{gdPct:5,gdAmount:0,baseAfterGD:e.totBase,totalDesgrav:0,baseDecl:e.totBase,decl:{totalTax:e.totIrpf,effectivePct:0,breakdown:[]},declDiff:0};
  var h='';

  /* §A Cascade completo con toggles */
  h+='<div class="sy-section"><div class="sy-section-title">Flujo de ingresos y gastos</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:8px">Marca/desmarca cada partida para incluirla en el c\u00e1lculo del neto final.</div>';
  h+='<div class="econ-gastos-card">';

  // Líneas base (siempre visibles, sin toggle)
  var totFact=Math.round((e.totBase+e.totIva)*100)/100;
  h+=gastosCascRow(null,'Base imponible','',e.totBase,'var(--c-blue)',false);
  h+=gastosCascRow(null,'+ IVA (21%)','+',e.totIva,'var(--c-orange)',false);
  h+=gastosResultRow('Total facturado',totFact,'var(--text)');
  h+=gastosCascRow('irpf_ret','IRPF '+e.irpfPct+'% retenido en facturas','\u2212',e.totIrpf,'var(--c-red)',true);

  // Running total tras IRPF
  var running=totFact;
  if(isTglOn('irpf_ret'))running=Math.round((running-e.totIrpf)*100)/100;
  h+=gastosResultRow('Cobrado en cuenta',running,'var(--text)');

  running=Math.round((running-e.totIva)*100)/100; // IVA siempre se va
  h+=gastosCascRow('iva_hac','IVA 21% a Hacienda (Mod.303)','\u2212',e.totIva,'var(--c-orange)',false);
  h+=gastosResultRow('(Base \u2212 15% IRPF)',Math.round((e.totBase-e.totIrpf)*100)/100,'var(--c-green)');

  running=Math.round((e.totBase-e.totIrpf)*100)/100; // reset a neto real

  // Gastos difícil justificación + desgravaciones → declaración
  if(dr.declDiff>0){
    var gdLabel='IRPF Dec. Renta <span style="font-size:.68rem;color:var(--text-dim)">(gastos dif\u00edcil just. '+dr.gdPct+'%'+(dr.totalDesgrav>0?' + desgravaciones':'')+' \u2192 '+dr.decl.effectivePct.toFixed(1)+'% efectivo)</span>';
    h+=gastosCascRow('irpf_decl',gdLabel,'\u2212',dr.declDiff,'var(--c-red)',true);
    if(isTglOn('irpf_decl'))running=Math.round((running-dr.declDiff)*100)/100;
    h+=gastosResultRow('Tras Declaraci\u00f3n Renta',running,running>0?'var(--c-green)':'var(--c-red)');
  } else if(dr.declDiff<0){
    var gdLabel2='Devoluci\u00f3n IRPF Dec. Renta <span style="font-size:.68rem;color:var(--text-dim)">(gastos dif\u00edcil just. '+dr.gdPct+'%'+(dr.totalDesgrav>0?' + desgravaciones':'')+')</span>';
    h+=gastosCascRow('irpf_decl',gdLabel2,'+',Math.abs(dr.declDiff),'var(--c-green)',true);
    if(isTglOn('irpf_decl'))running=Math.round((running+Math.abs(dr.declDiff))*100)/100;
    h+=gastosResultRow('Tras Declaraci\u00f3n Renta',running,running>0?'var(--c-green)':'var(--c-red)');
  }

  // Gastos regulares — por grupos
  var cotLabel='Cotizaciones sociales <span style="font-size:.68rem;color:var(--text-dim)">(aprox.)</span>';
  var asesorLabel='Asesor\u00eda <span style="font-size:.68rem;color:var(--text-dim)">(semiobligatorio)</span>';
  var segBajaLabel='Seguro baja laboral <span style="font-size:.68rem;color:var(--text-dim)">(aprox.)</span>';
  var segSaludLabel='Seguro de Salud <span style="font-size:.68rem;color:var(--text-dim)">(semiobligatorio)</span>';
  var labelMap={'cot_social':cotLabel,'asesoria':asesorLabel,'seg_baja':segBajaLabel,'seg_salud':segSaludLabel};

  var GROUP_SEMIOBL={'asesoria':true,'seg_baja':true,'seg_salud':true};
  var GROUP_CASA={'hipoteca':true,'comunidad':true,'seg_hogar':true,'ibi':true,'luz':true,'gas':true,'agua':true,'digi':true};
  var GROUP_OTROS_IMP={'otros_seg':true,'seg_vida':true};

  function _gastosGroup(filterFn){
    var shown=false;
    GASTOS_ITEMS.forEach(function(g){
      if(!filterFn(g))return;
      var anual=gastoAnual(g.id);
      if(anual===0&&g.amount===0)return;
      shown=true;
      var lbl=labelMap[g.id]||escHtml(g.label);
      var periodStr=g.period==='monthly'?'<span style="font-size:.68rem;color:var(--text-dim)">('+g.amount+'\u20ac/mes)</span>':'';
      h+=gastosCascRow('gasto_'+g.id,lbl+' '+periodStr,'\u2212',anual,'#c084fc',true);
      if(isTglOn('gasto_'+g.id))running=Math.round((running-anual)*100)/100;
    });
    return shown;
  }

  // Grupo 1: CCSS
  var hasCCSS=_gastosGroup(function(g){return g.id==='cot_social';});
  if(hasCCSS)h+=gastosResultRow('Tras CCSS',running,running>0?'var(--c-green)':'var(--c-red)');

  // Grupo 2: tasas semiobligatorias
  var hasSemiObl=_gastosGroup(function(g){return !!GROUP_SEMIOBL[g.id];});
  if(hasSemiObl)h+=gastosResultRow('Tras tasas semiobligatorias',running,running>0?'var(--c-green)':'var(--c-red)');

  // Grupo ingresos extras (suman al running)
  var hasIngresos=false;
  if(typeof INGRESOS_ITEMS!=='undefined'){
    INGRESOS_ITEMS.forEach(function(g){
      var anual=typeof ingresoAnual==='function'?ingresoAnual(g.id):0;
      if(anual===0&&g.amount===0)return;
      hasIngresos=true;
      var lbl=escHtml(g.label);
      var periodStr=g.period==='monthly'?'<span style="font-size:.68rem;color:var(--text-dim)">('+g.amount+'\u20ac/mes)</span>':'';
      h+=gastosCascRow('ingreso_'+g.id,lbl+' '+periodStr,'+',anual,'var(--c-green)',true);
      if(isTglOn('ingreso_'+g.id))running=Math.round((running+anual)*100)/100;
    });
  }
  if(hasIngresos)h+=gastosResultRow('Tras ingresos extras',running,running>0?'var(--c-green)':'var(--c-red)');

  // Grupo 3: gastos casa
  var hasCasa=_gastosGroup(function(g){return !!GROUP_CASA[g.id];});
  if(hasCasa)h+=gastosResultRow('Tras gastos casa',running,running>0?'var(--c-green)':'var(--c-red)');

  // Grupo 3.5: otros gastos importantes (seguros, etc.)
  var hasOtrosImp=_gastosGroup(function(g){return !!GROUP_OTROS_IMP[g.id];});
  if(hasOtrosImp)h+=gastosResultRow('Tras otros gastos importantes',running,running>0?'var(--c-green)':'var(--c-red)');

  // Grupo 4: otros (custom items no reconocidos)
  _gastosGroup(function(g){return g.id!=='cot_social'&&!GROUP_SEMIOBL[g.id]&&!GROUP_CASA[g.id]&&!GROUP_OTROS_IMP[g.id];});

  h+=gastosResultRow('Neto disponible estimado',running,running>0?'var(--c-green)':'var(--c-red)');
  h+='</div></div>';

  /* Nota configurabilidad */
  h+='<div class="sy-section" style="padding:10px 14px">';
  h+='<div style="font-size:.7rem;color:var(--text-dim);text-align:center">Configurable desde el men\u00fa &#9965;\ufe0f de la ventana econ\u00f3mica</div>';
  h+='</div>';

  /* §B Distribuci\u00f3n del ingreso bruto */
  h+=renderIncomeDistrib(e,dr);

  /* §C Desglose IRPF por tramos — visual */
  h+=renderIrpfBreakdown(e,dr);

  /* §D Tipo medio IRPF + ahorro desgravaciones */
  if(dr.decl&&dr.decl.totalTax>0){
    var sinDesgrav=typeof computeIrpfBrackets==='function'?computeIrpfBrackets(dr.baseAfterGD):null;
    var ahorroDesgrav=sinDesgrav?Math.round((sinDesgrav.totalTax-dr.decl.totalTax+dr.totalQuotaDesgrav)*100)/100:0;
    h+='<div class="sy-section"><div class="sy-section-title">Resumen fiscal</div>';
    h+='<div class="econ-fiscal-summary">';
    h+='<div class="econ-fiscal-summary-item">';
    h+='<div class="econ-fiscal-summary-val" style="color:var(--c-red)">'+dr.decl.effectivePct.toFixed(2).replace('.',',')+'\u202f%</div>';
    h+='<div class="econ-fiscal-summary-lbl">Tipo medio IRPF</div>';
    h+='</div>';
    if(ahorroDesgrav>0){
      h+='<div class="econ-fiscal-summary-item">';
      h+='<div class="econ-fiscal-summary-val" style="color:var(--c-green)">'+fcPlain(ahorroDesgrav)+'</div>';
      h+='<div class="econ-fiscal-summary-lbl">Ahorro por desgravaciones</div>';
      h+='</div>';
    }
    h+='</div></div>';
  }

  return h;
}

/* ── Desglose IRPF — diseño visual mejorado ─────────────────── */
function renderIrpfBreakdown(e,dr){
  if(dr.gdPct===0&&dr.declDiff===0&&dr.totalDesgrav===0)return '';
  var h='<div class="sy-section"><div class="sy-section-title">IRPF Declaraci\u00f3n \u2014 Desglose</div>';
  h+='<div class="econ-irpf-card">';

  /* — Bloque 1: Flujo de base — */
  h+='<div class="econ-irpf-block">';
  h+='<div class="econ-irpf-block-title">C\u00e1lculo de base</div>';
  h+='<div class="econ-irpf-flow">';
  h+='<div class="econ-irpf-flow-row"><span class="econ-irpf-flow-lbl">Base imponible</span><span class="econ-irpf-flow-val" style="color:var(--c-blue)">'+fcPlain(e.totBase)+'</span></div>';
  if(dr.gdPct>0){
    h+='<div class="econ-irpf-flow-row econ-irpf-minus"><span class="econ-irpf-flow-lbl"><span class="econ-irpf-sign">&#8722;</span>Gastos dif\u00edcil just. ('+dr.gdPct+'%)</span><span class="econ-irpf-flow-val" style="color:var(--c-green)">'+fcPlain(dr.gdAmount)+'</span></div>';
  }
  if(dr.totalBaseDesgrav>0){
    h+='<div class="econ-irpf-flow-row econ-irpf-minus"><span class="econ-irpf-flow-lbl"><span class="econ-irpf-sign">&#8722;</span>Desgravaciones (base)</span><span class="econ-irpf-flow-val" style="color:var(--c-green)">'+fcPlain(dr.totalBaseDesgrav)+'</span></div>';
  }
  h+='<div class="econ-irpf-flow-row econ-irpf-result"><span class="econ-irpf-flow-lbl">Base declaraci\u00f3n</span><span class="econ-irpf-flow-val" style="color:var(--text)">'+fcPlain(dr.baseDecl)+'</span></div>';
  h+='</div></div>';

  /* — Bloque 2: Tramos — */
  if(dr.decl.breakdown.length>0){
    var maxTax=Math.max.apply(null,dr.decl.breakdown.map(function(t){return t.tax;}));
    h+='<div class="econ-irpf-block">';
    h+='<div class="econ-irpf-block-title">Tramos IRPF aplicados</div>';
    h+='<div class="econ-irpf-brackets">';
    dr.decl.breakdown.forEach(function(tr){
      var barW=maxTax>0?Math.round(tr.tax/maxTax*100):0;
      var toStr=tr.to===Infinity?'\u221e':fcPlain(tr.to);
      h+='<div class="econ-irpf-bracket-row">';
      h+='<div class="econ-irpf-bracket-info">';
      h+='<span class="econ-irpf-bracket-range">'+fcPlain(tr.from)+' \u2013 '+toStr+'</span>';
      h+='<span class="econ-irpf-bracket-pct">'+tr.pct+'%</span>';
      h+='</div>';
      h+='<div class="econ-irpf-bracket-bar-row">';
      h+='<div class="econ-irpf-bracket-bar" style="width:'+barW+'%"></div>';
      h+='<span class="econ-irpf-bracket-tax">'+fcPlain(tr.tax)+'</span>';
      h+='</div>';
      h+='</div>';
    });
    h+='</div></div>';
  }

  /* — Bloque 3: Resumen resultado — */
  h+='<div class="econ-irpf-block econ-irpf-summary-block">';
  h+='<div class="econ-irpf-summary-grid">';
  h+='<div class="econ-irpf-summary-item">';
  h+='<div class="econ-irpf-summary-lbl">Cuota IRPF total</div>';
  h+='<div class="econ-irpf-summary-val" style="color:var(--c-red)">'+fcPlain(dr.decl.totalTax)+'</div>';
  h+='<div class="econ-irpf-summary-sub">'+dr.decl.effectivePct.toFixed(2).replace('.',',')+'\u202f% efectivo</div>';
  h+='</div>';
  h+='<div class="econ-irpf-summary-item">';
  h+='<div class="econ-irpf-summary-lbl">Ya retenido (facturas)</div>';
  h+='<div class="econ-irpf-summary-val" style="color:var(--text-muted)">'+fcPlain(e.totIrpf)+'</div>';
  h+='<div class="econ-irpf-summary-sub">'+e.irpfPct+'% en cada factura</div>';
  h+='</div>';
  if(dr.totalQuotaDesgrav>0){
    h+='<div class="econ-irpf-summary-item">';
    h+='<div class="econ-irpf-summary-lbl">Deducciones en cuota</div>';
    h+='<div class="econ-irpf-summary-val" style="color:var(--c-green)">\u2212'+fcPlain(dr.totalQuotaDesgrav)+'</div>';
    h+='<div class="econ-irpf-summary-sub">vivienda, donativos\u2026</div>';
    h+='</div>';
  }
  var diffColor=dr.declDiff<0?'var(--c-green)':'var(--c-red)';
  var diffLabel=dr.declDiff<0?'\u2B07\uFE0F Devoluci\u00f3n estimada':'\u2B06\uFE0F A pagar estimado';
  var diffSign=dr.declDiff<0?'':'+';
  h+='<div class="econ-irpf-summary-item econ-irpf-summary-highlight" style="border-color:'+diffColor+'">';
  h+='<div class="econ-irpf-summary-lbl">'+diffLabel+'</div>';
  h+='<div class="econ-irpf-summary-val" style="color:'+diffColor+'">'+diffSign+fcPlain(Math.abs(dr.declDiff))+'</div>';
  h+='<div class="econ-irpf-summary-sub">en la declaraci\u00f3n de la renta</div>';
  h+='</div>';
  h+='</div></div>';

  h+='</div></div>';
  return h;
}

/* ── Distribución del ingreso bruto ─────────────────────────── */
function renderIncomeDistrib(e,dr){
  var bruto=Math.round((e.totBase+e.totIva)*100)/100;
  if(bruto<=0)return '';
  function pctOf(v){return bruto>0?Math.round(v/bruto*1000)/10:0;}
  function distRow(label,amount,color,sub){
    var p=pctOf(amount);
    if(amount<=0)return '';
    return '<div class="econ-distrib-row">'
      +'<div class="econ-distrib-meta">'
      +'<span class="econ-distrib-lbl">'+(sub?'<span class="econ-distrib-sub-dot">&#x25B8;</span>':'')+label+'</span>'
      +'<span class="econ-distrib-amounts"><b style="color:'+color+'">'+fcPlain(amount)+'</b> <span class="econ-distrib-pct">'+p.toFixed(1)+'%</span></span>'
      +'</div>'
      +'<div class="econ-distrib-bar-wrap"><div class="econ-distrib-bar" style="width:'+p+'%;background:'+color+'"></div></div>'
      +'</div>';
  }
  var GROUP_S={'asesoria':true,'seg_baja':true,'seg_salud':true,'otros_seg':true,'seg_vida':true};
  var GROUP_C={'hipoteca':true,'comunidad':true,'seg_hogar':true,'ibi':true,'luz':true,'gas':true,'agua':true,'digi':true};
  var ccss=0,semiobl=0,gasaCasa=0,otrosG=0;
  GASTOS_ITEMS.forEach(function(g){
    var a=gastoAnual(g.id);
    if(g.id==='cot_social')ccss+=a;
    else if(GROUP_S[g.id])semiobl+=a;
    else if(GROUP_C[g.id])gasaCasa+=a;
    else otrosG+=a;
  });
  var compras=typeof comprasTotal==='function'?comprasTotal():0;
  /* Impuestos: IRPF retenido + ajuste declaración (si positivo) + IVA */
  var irpfPagado=Math.round((e.totIrpf+Math.max(0,dr.declDiff))*100)/100;
  var devolucion=Math.max(0,-dr.declDiff);
  var totalImpuestos=Math.round((irpfPagado+e.totIva)*100)/100;
  var totalGastos=Math.round((ccss+semiobl+gasaCasa+compras+otrosG)*100)/100;
  var neto=Math.round((e.totBase-irpfPagado+devolucion-ccss-semiobl-gasaCasa-compras-otrosG)*100)/100;

  var h='<div class="sy-section"><div class="sy-section-title">Distribuci\u00f3n del ingreso</div>';
  h+='<div class="econ-distrib-card">';
  h+='<div class="econ-distrib-header">';
  h+='<span class="econ-distrib-bruto">Bruto anual: <b>'+fcPlain(bruto)+'</b></span>';
  h+='<span class="econ-distrib-base">Base: <b>'+fcPlain(e.totBase)+'</b> + IVA: <b>'+fcPlain(e.totIva)+'</b></span>';
  h+='</div>';
  /* Impuestos */
  if(totalImpuestos>0){
    h+='<div class="econ-distrib-group-lbl">Impuestos</div>';
    h+=distRow('IRPF (retenci\u00f3n + declaraci\u00f3n)',irpfPagado,'var(--c-red)',false);
    if(devolucion>0)h+=distRow('Devoluci\u00f3n IRPF estimada',devolucion,'var(--c-green)',true);
    h+=distRow('IVA a Hacienda (Mod.303)',e.totIva,'var(--c-orange)',false);
  }
  /* Gastos profesionales */
  if(ccss>0||semiobl>0||compras>0){
    h+='<div class="econ-distrib-group-lbl">Gastos profesionales</div>';
    h+=distRow('Cuota aut\u00f3nomos SS',ccss,'#c084fc',false);
    h+=distRow('Asesor\u00eda, seguros y similares',semiobl,'#a78bfa',false);
    h+=distRow('Compras y gastos profesionales',compras,'#34d399',false);
  }
  /* Gastos del hogar */
  if(gasaCasa>0){
    h+='<div class="econ-distrib-group-lbl">Gastos del hogar</div>';
    h+=distRow('Hipoteca, suministros, comunidad\u2026',gasaCasa,'#60a5fa',false);
  }
  if(otrosG>0){
    h+=distRow('Otros gastos',otrosG,'var(--text-dim)',false);
  }
  /* Neto */
  h+='<div class="econ-distrib-group-lbl neto">Resultado estimado</div>';
  h+=distRow(neto>=0?'Neto disponible':'D\u00e9ficit estimado',Math.abs(neto),neto>=0?'var(--c-green)':'var(--c-red)',false);
  h+='</div></div>';
  return h;
}

/* ── Helpers de fila ─────────────────────────────────────────── */
function gastosCascRow(id,lbl,sign,val,color,toggleable){
  var on=!id||isTglOn(id);
  var h='<div class="econ-gastos-row"'+(id?' data-gid="'+id+'"':'')+' style="'+(on?'':'opacity:.4')+'">';
  if(toggleable&&id){
    h+='<div class="econ-gastos-chk'+(on?' on':'')+'" data-tgl="'+id+'">'+(on?'&#10003;':'')+'</div>';
  } else {
    h+='<div style="width:18px;flex-shrink:0"></div>';
  }
  h+='<span class="econ-gastos-lbl">'+lbl+'</span>';
  h+='<span class="econ-gastos-val">';
  h+='<span style="color:var(--text-dim);margin-right:4px">'+sign+'</span>';
  h+='<span style="color:'+(on?color:'var(--text-dim)')+'">'+fcPlain(val)+'</span>';
  h+='</span>';
  h+='</div>';
  return h;
}

function gastosResultRow(lbl,val,color){
  return '<div class="econ-gastos-result-row">'
    +'<span class="econ-gastos-result-lbl">'+lbl+'</span>'
    +'<span class="econ-gastos-result-val" style="color:'+color+'">'+fcPlain(val)+'</span>'
    +'</div>';
}

function bindEconGastosEvents(){
  // Toggle items (event delegation en cada card)
  var card=document.querySelector('.econ-gastos-card');
  if(card&&!card._del){
    card._del=true;
    card.addEventListener('click',function(e){
      var chk=e.target.closest('.econ-gastos-chk[data-tgl]');
      if(!chk)return;
      var id=chk.dataset.tgl;
      GASTOS_TOGGLES[id]=!isTglOn(id);
      saveGastosToggles();
      // Re-render solo el contenido del tab
      var body=document.querySelector('.sy-body');
      if(body)body.innerHTML=renderEconGastos();
      bindEconGastosEvents();
    });
  }
}
