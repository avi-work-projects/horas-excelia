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

/* Calcula "Disponible para gastos personales" replicando el cascade de toggles */
function computeDisponible(year){
  var _mrOpts=typeof _getMultiRateOpts==='function'?_getMultiRateOpts():{};
  var e=computeEconEx(year||ECON_YEAR,_mrOpts);
  var dr=typeof computeDeclResult==='function'?computeDeclResult(e.totBase,e.totIrpf):{gdPct:5,totalDesgrav:0,baseDecl:e.totBase,decl:{effectivePct:0},declDiff:0};
  var running=Math.round((e.totBase-e.totIrpf)*100)/100;
  if(dr.declDiff>0&&isTglOn('irpf_decl'))running=Math.round((running-dr.declDiff)*100)/100;
  else if(dr.declDiff<0&&isTglOn('irpf_decl'))running=Math.round((running+Math.abs(dr.declDiff))*100)/100;
  if(typeof GASTOS_ITEMS!=='undefined'){
    GASTOS_ITEMS.forEach(function(g){
      var anual=typeof gastoAnual==='function'?gastoAnual(g.id):0;
      if(anual>0&&isTglOn('gasto_'+g.id))running=Math.round((running-anual)*100)/100;
    });
  }
  if(typeof INGRESOS_ITEMS!=='undefined'){
    INGRESOS_ITEMS.forEach(function(g){
      var anual=typeof ingresoAnual==='function'?ingresoAnual(g.id):0;
      if(anual>0&&isTglOn('ingreso_'+g.id))running=Math.round((running+anual)*100)/100;
    });
  }
  return running;
}

/* ── Render Tab 4 ─────────────────────────────────────────────── */
function renderEconGastos(){
  /* Ensure gastos are loaded for the current ECON_YEAR */
  if(typeof loadGastosYear==='function')loadGastosYear(ECON_YEAR);
  var _mrOpts2=typeof _getMultiRateOpts==='function'?_getMultiRateOpts():{};
  var e=computeEconEx(ECON_YEAR,_mrOpts2);
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
  var GROUP_OTROS_IMP={'otros_seg':true,'seg_vida':true,'donaciones':true};

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

  /* Ingresos extras: incluidos en Disponible (computeDisponible) pero NO en la cascada de declaración.
     Se muestran en Análisis Ec. Personal → Mis gastos como parte del disponible. */

  // Grupo 3: gastos casa
  var hasCasa=_gastosGroup(function(g){return !!GROUP_CASA[g.id];});
  if(hasCasa)h+=gastosResultRow('Tras gastos casa',running,running>0?'var(--c-green)':'var(--c-red)');

  // Grupo 3.5: otros gastos importantes (seguros, etc.)
  var hasOtrosImp=_gastosGroup(function(g){return !!GROUP_OTROS_IMP[g.id];});
  if(hasOtrosImp)h+=gastosResultRow('Tras otros gastos desgravables',running,running>0?'var(--c-green)':'var(--c-red)');

  // Grupo 4: otros (custom items no reconocidos)
  _gastosGroup(function(g){return g.id!=='cot_social'&&!GROUP_SEMIOBL[g.id]&&!GROUP_CASA[g.id]&&!GROUP_OTROS_IMP[g.id];});

  h+=gastosResultRow('Disponible para gastos personales',running,running>0?'var(--c-green)':'var(--c-red)');
  h+='</div></div>';

  /* Nota configurabilidad */
  h+='<div class="sy-section" style="padding:10px 14px">';
  h+='<div style="font-size:.7rem;color:var(--text-dim);text-align:center">Configurable desde el men\u00fa &#9965;\ufe0f de la ventana econ\u00f3mica</div>';
  h+='</div>';

  /* §B Distribuci\u00f3n del ingreso bruto */
  h+=renderIncomeDistrib(e,dr);

  /* §B.2 Donut chart distribuci\u00f3n */
  h+=renderIncomeDonut(e,dr);

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
    h+='</div>';
    /* §D.2 Trabajado para el Estado — desglose explícito IRPF + IVA */
    var _brF=Math.round((e.totBase+e.totIva)*100)/100;
    /* IRPF total realmente pagado = retenci\u00f3n + diferencia declaraci\u00f3n (con signo) */
    var _irpfPag=Math.round((e.totIrpf+dr.declDiff)*100)/100;
    var _ivaPag=Math.round(e.totIva*100)/100;
    var _totImp=Math.round((_irpfPag+_ivaPag)*100)/100;
    if(_brF>0&&_totImp>0&&e.totalDays>0){
      var _pE=_totImp/_brF;
      var _dE=Math.round(e.totalDays*_pE);
      var _mE=Math.floor(_dE/22);var _dR=_dE-_mE*22;
      var _fE=new Date(ECON_YEAR,0,1);var _cE=0;
      while(_cE<_dE){if(_fE.getDay()!==0&&_fE.getDay()!==6)_cE++;if(_cE<_dE)_fE.setDate(_fE.getDate()+1);}
      var _dIrpf=Math.round(e.totalDays*(_irpfPag/_brF));
      var _dIva =Math.round(e.totalDays*(_ivaPag /_brF));
      h+='<div class="econ-fiscal-estado">';
      h+='Seg\u00fan los datos anteriores, has pagado <b style="color:var(--c-red);font-style:normal">'+fcPlain(_irpfPag)+' en IRPF</b> y <b style="color:var(--c-orange);font-style:normal">'+fcPlain(_ivaPag)+' en IVA</b> (total <b style="font-style:normal">'+fcPlain(_totImp)+'</b>, '+(_pE*100).toFixed(1).replace(".",",")+' % de tus ingresos brutos). ';
      h+='Equivale a haber trabajado <b>'+_mE+' meses y '+_dR+' d\u00edas</b> para el Estado <span style="font-size:.7rem;font-style:normal;color:var(--text-dim)">(\u2248 '+_dIrpf+' d IRPF + '+_dIva+' d IVA)</span>, hasta el <b>'+_fE.getDate()+' de '+MN[_fE.getMonth()]+'</b>.';
      h+='</div>';
    }
    h+='</div>';
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
  var diffColor=dr.declDiff<0?'var(--c-green)':'var(--c-red)';
  var diffLabel=dr.declDiff<0?'\u2B07\uFE0F Devoluci\u00f3n estimada':'\u2B06\uFE0F A pagar estimado';
  var diffSign=dr.declDiff<0?'':'+';
  h+='<div class="econ-irpf-summary-item econ-irpf-summary-highlight econ-irpf-summary-wide" style="border-color:'+diffColor+'">';
  h+='<div class="econ-irpf-summary-lbl">'+diffLabel+'</div>';
  h+='<div class="econ-irpf-summary-val" style="color:'+diffColor+'">'+diffSign+fcPlain(Math.abs(dr.declDiff))+'</div>';
  h+='<div class="econ-irpf-summary-sub">en la declaraci\u00f3n de la renta</div>';
  /* Deducciones en cuota integradas como sub-l\u00ednea, con desglose din\u00e1mico
     de los items que realmente contribuyen (vienen de DESGRAV_ITEMS con type='quota') */
  if(dr.totalQuotaDesgrav>0){
    h+='<div class="econ-irpf-summary-deduc">';
    h+='<span class="econ-irpf-summary-deduc-lbl">Ya incluye deducciones de cuota</span>';
    h+='<span class="econ-irpf-summary-deduc-val">\u2212'+fcPlain(dr.totalQuotaDesgrav)+'</span>';
    h+='</div>';
    /* Listado din\u00e1mico de items que aportan (importe \u00d7 % aplicado = neto) */
    var _quotaContribs=[];
    if(typeof DESGRAV_ITEMS!=='undefined'){
      DESGRAV_ITEMS.forEach(function(item){
        if(!item.enabled||(item.type||'base')!=='quota')return;
        var d=typeof desgravAnual==='function'?desgravAnual(item):0;
        if(d<=0)return;
        var pct=item.notaPct!=null?item.notaPct:100;
        var net=Math.round(d*pct/100*100)/100;
        _quotaContribs.push(escHtml(item.label)+' '+fcPlain(d)+' \u00d7 '+pct+'% = \u2212'+fcPlain(net));
      });
    }
    if(_quotaContribs.length){
      h+='<div class="econ-irpf-summary-deduc-note">'+_quotaContribs.join(' \u00b7 ')+'</div>';
    }
  }
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
  var GROUP_S={'asesoria':true,'seg_baja':true,'seg_salud':true,'otros_seg':true,'seg_vida':true,'donaciones':true};
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
  var totalGastosProf=Math.round((ccss+semiobl+compras)*100)/100;
  function grpLbl(name,amt,color){return '<div class="econ-distrib-group-lbl"><span>'+name+'</span><span class="econ-distrib-group-pct" style="color:'+color+'">'+pctOf(amt).toFixed(1)+'%</span></div>';}
  /* Impuestos */
  if(totalImpuestos>0){
    h+=grpLbl('Impuestos',totalImpuestos,'var(--c-red)');
    h+=distRow('IRPF (retenci\u00f3n + declaraci\u00f3n)',irpfPagado,'var(--c-red)',false);
    if(devolucion>0)h+=distRow('Devoluci\u00f3n IRPF estimada',devolucion,'var(--c-green)',true);
    h+=distRow('IVA a Hacienda (Mod.303)',e.totIva,'var(--c-orange)',false);
  }
  /* Gastos profesionales */
  if(totalGastosProf>0){
    h+=grpLbl('Gastos profesionales',totalGastosProf,'#c084fc');
    h+=distRow('Cuota aut\u00f3nomos SS',ccss,'#c084fc',false);
    h+=distRow('Asesor\u00eda, seguros y similares',semiobl,'#a78bfa',false);
    h+=distRow('Compras y gastos profesionales',compras,'#34d399',false);
  }
  /* Gastos del hogar */
  if(gasaCasa>0){
    h+=grpLbl('Gastos del hogar',gasaCasa,'#60a5fa');
    h+=distRow('Hipoteca, suministros, comunidad\u2026',gasaCasa,'#60a5fa',false);
  }
  if(otrosG>0){
    h+=distRow('Otros gastos',otrosG,'var(--text-dim)',false);
  }
  /* Neto */
  h+=grpLbl(neto>=0?'Resultado estimado':'D\u00e9ficit',Math.abs(neto),neto>=0?'var(--c-green)':'var(--c-red)');
  h+=distRow(neto>=0?'Neto disponible':'D\u00e9ficit estimado',Math.abs(neto),neto>=0?'var(--c-green)':'var(--c-red)',false);
  h+='</div></div>';
  return h;
}

/* ── Donut chart distribuci\u00f3n ────────────────────────────────── */
var _DONUT_SEL={};
function _sectorPath(cx,cy,r,ir,a1,a2){
  var x1=cx+r*Math.sin(a1),y1=cy-r*Math.cos(a1);
  var x2=cx+r*Math.sin(a2),y2=cy-r*Math.cos(a2);
  var ix1=cx+ir*Math.sin(a1),iy1=cy-ir*Math.cos(a1);
  var ix2=cx+ir*Math.sin(a2),iy2=cy-ir*Math.cos(a2);
  var la=(a2-a1)>Math.PI?1:0;
  return 'M'+x1.toFixed(2)+','+y1.toFixed(2)+' A'+r+','+r+' 0 '+la+',1 '+x2.toFixed(2)+','+y2.toFixed(2)+' L'+ix2.toFixed(2)+','+iy2.toFixed(2)+' A'+ir+','+ir+' 0 '+la+',0 '+ix1.toFixed(2)+','+iy1.toFixed(2)+' Z';
}
function _donutSummaryHtml(sectors,bruto){
  var sel=Object.keys(_DONUT_SEL).filter(function(k){return _DONUT_SEL[k];});
  if(!sel.length)return '<div class="econ-donut-hint">Toca un sector para ver el detalle</div><div class="econ-donut-total">Ingresos totales: <b>'+fcPlain(bruto)+'</b></div>';
  var names=[],sum=0,breakdownHtml='';
  sel.forEach(function(k){
    var i=parseInt(k,10);
    if(!sectors[i])return;
    names.push(sectors[i].label);
    sum+=sectors[i].amount;
    /* Si el sector tiene desglose, lo añadimos */
    if(sectors[i].breakdown&&sectors[i].breakdown.length){
      breakdownHtml+='<div class="econ-donut-bd-group"><div class="econ-donut-bd-title">'+sectors[i].label+' — desglose:</div>';
      sectors[i].breakdown.forEach(function(b){
        if(b.amount<=0)return;
        var pct=sectors[i].amount>0?(b.amount/sectors[i].amount*100):0;
        breakdownHtml+='<div class="econ-donut-bd-row">'
          +'<span class="econ-donut-bd-lbl">'+b.label+'</span>'
          +'<span class="econ-donut-bd-amt"><b style="color:'+b.color+'">'+fcPlain(b.amount)+'</b> <span class="econ-donut-bd-pct">'+pct.toFixed(1)+'%</span></span>'
          +'</div>';
      });
      breakdownHtml+='</div>';
    }
  });
  var pct=bruto>0?Math.round(sum/bruto*1000)/10:0;
  return '<div class="econ-donut-sel-names">'+names.join(' + ')+'</div>'
    +'<div class="econ-donut-sel-total" style="color:var(--text)">'+fcPlain(sum)+' <span style="font-size:.7rem;color:var(--text-dim)">('+pct.toFixed(1)+'%)</span></div>'
    +breakdownHtml
    +'<div class="econ-donut-total">Ingresos totales: <b>'+fcPlain(bruto)+'</b></div>';
}
function renderIncomeDonut(e,dr){
  var bruto=Math.round((e.totBase+e.totIva)*100)/100;
  if(bruto<=0)return '';
  var irpfPag=Math.round((e.totIrpf+Math.max(0,dr.declDiff))*100)/100;
  var totalImp=Math.round((irpfPag+e.totIva)*100)/100;
  var GROUP_S2={'asesoria':true,'seg_baja':true,'seg_salud':true,'otros_seg':true,'seg_vida':true,'donaciones':true};
  var GROUP_C2={'hipoteca':true,'comunidad':true,'seg_hogar':true,'ibi':true,'luz':true,'gas':true,'agua':true,'digi':true};
  var ccss2=0,semi2=0,casa2=0,otros2=0;
  GASTOS_ITEMS.forEach(function(g){var a=gastoAnual(g.id);if(g.id==='cot_social')ccss2+=a;else if(GROUP_S2[g.id])semi2+=a;else if(GROUP_C2[g.id])casa2+=a;else otros2+=a;});
  var compras2=typeof comprasTotal==='function'?comprasTotal():0;
  var gProf=Math.round((ccss2+semi2+compras2)*100)/100;
  var neto2=Math.round((e.totBase-irpfPag+Math.max(0,-dr.declDiff)-ccss2-semi2-casa2-compras2-otros2)*100)/100;
  var sectors=[];
  if(totalImp>0)sectors.push({label:'Impuestos',amount:totalImp,color:'#ef4444',fill:'url(#stripesIrpfIva)',breakdown:[
    {label:'IRPF (retención + ajuste declaración)',amount:irpfPag,color:'#ef4444'},
    {label:'IVA a Hacienda (Mod.303)',amount:e.totIva,color:'#fb923c'}
  ]});
  if(gProf>0)sectors.push({label:'Gastos prof.',amount:gProf,color:'#c084fc',breakdown:[
    {label:'Cuota autónomos SS',amount:ccss2,color:'#c084fc'},
    {label:'Asesoría, seguros y similares',amount:semi2,color:'#a78bfa'},
    {label:'Compras y gastos profesionales',amount:compras2,color:'#34d399'}
  ].filter(function(b){return b.amount>0;})});
  if(casa2>0)sectors.push({label:'Gastos hogar',amount:casa2,color:'#60a5fa'});
  if(otros2>0)sectors.push({label:'Otros',amount:otros2,color:'#94a3b8'});
  if(neto2>0)sectors.push({label:'Neto',amount:neto2,color:'#34d399'});
  if(!sectors.length)return '';
  var cx=200,cy=150,r=95,ir=52;
  var hasSel=Object.keys(_DONUT_SEL).some(function(k){return _DONUT_SEL[k];});
  var ang=0,svgPaths='',svgLabels='';
  for(var i=0;i<sectors.length;i++){
    var s=sectors[i];
    var sweep=(s.amount/bruto)*Math.PI*2;
    var a1=ang,a2=ang+sweep;
    var mid=(a1+a2)/2;
    var sel=!!_DONUT_SEL[i];
    var dim=hasSel&&!sel;
    var tx=sel?Math.sin(mid)*8:0,ty=sel?-Math.cos(mid)*8:0;
    svgPaths+='<path class="econ-donut-sector'+(sel?' selected':'')+(dim?' dimmed':'')+'" d="'+_sectorPath(cx,cy,r,ir,a1,a2)+'" fill="'+(s.fill||s.color)+'" stroke="var(--surface)" stroke-width="1.5" data-idx="'+i+'" style="transform:translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px)"/>';
    /* Labels */
    var lx=cx+(r+14)*Math.sin(mid),ly=cy-(r+14)*Math.cos(mid);
    var lx2=cx+(r+38)*Math.sin(mid),ly2=cy-(r+38)*Math.cos(mid);
    var isRight=Math.sin(mid)>=0;
    var lx3=isRight?lx2+22:lx2-22;
    var anchor=isRight?'start':'end';
    var pct=bruto>0?Math.round(s.amount/bruto*1000)/10:0;
    svgLabels+='<line x1="'+lx.toFixed(1)+'" y1="'+ly.toFixed(1)+'" x2="'+lx2.toFixed(1)+'" y2="'+ly2.toFixed(1)+'" stroke="'+s.color+'" stroke-width=".8" opacity="'+(dim?.35:1)+'"/>';
    svgLabels+='<line x1="'+lx2.toFixed(1)+'" y1="'+ly2.toFixed(1)+'" x2="'+lx3.toFixed(1)+'" y2="'+ly2.toFixed(1)+'" stroke="'+s.color+'" stroke-width=".8" opacity="'+(dim?.35:1)+'"/>';
    svgLabels+='<text x="'+(isRight?lx3+3:lx3-3).toFixed(1)+'" y="'+(ly2-2).toFixed(1)+'" text-anchor="'+anchor+'" font-size="8" fill="'+(dim?'var(--text-dim)':'var(--text-muted)')+'" font-family="var(--font)">'+s.label+'</text>';
    svgLabels+='<text x="'+(isRight?lx3+3:lx3-3).toFixed(1)+'" y="'+(ly2+9).toFixed(1)+'" text-anchor="'+anchor+'" font-size="7.5" fill="'+s.color+'" font-family="var(--mono)" opacity="'+(dim?.4:1)+'">'+pct.toFixed(1)+'%</text>';
    ang=a2;
  }
  var h='<div class="sy-section"><div class="sy-section-title">Distribuci\u00f3n (gr\u00e1fico)</div>';
  h+='<div class="econ-donut-wrap" id="econDonutWrap">';
  h+='<svg viewBox="0 0 400 300" style="width:100%;max-width:400px">';
  /* Patr\u00f3n de rayas diagonales rojo (IRPF) + naranja (IVA) para el sector Impuestos */
  h+='<defs><pattern id="stripesIrpfIva" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">'
   +'<rect width="5" height="10" fill="#ef4444"/><rect x="5" width="5" height="10" fill="#fb923c"/>'
   +'</pattern></defs>';
  h+=svgPaths+svgLabels;
  h+='</svg>';
  h+='<div class="econ-donut-summary" id="econDonutSummary">'+_donutSummaryHtml(sectors,bruto)+'</div>';
  h+='</div></div>';
  /* Store sectors for click handler */
  window._DONUT_SECTORS=sectors;window._DONUT_BRUTO=bruto;
  return h;
}
function _bindDonutClick(){
  var wrap=document.getElementById('econDonutWrap');
  if(!wrap||wrap._delegated)return;
  wrap._delegated=true;
  wrap.addEventListener('click',function(ev){
    var path=ev.target.closest('.econ-donut-sector');
    if(!path)return;
    ev.stopPropagation();
    var idx=parseInt(path.dataset.idx,10);
    _DONUT_SEL[idx]=!_DONUT_SEL[idx];
    /* Re-render just the donut section */
    var e2=computeEconEx(ECON_YEAR);
    var dr2=computeDeclResult(e2.totBase,e2.totIrpf);
    var tmp=document.createElement('div');tmp.innerHTML=renderIncomeDonut(e2,dr2);
    var oldW=document.getElementById('econDonutWrap');
    var newW=tmp.querySelector('#econDonutWrap');
    if(oldW&&newW){oldW.parentNode.replaceChild(newW,oldW);_bindDonutClick();}
  });
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
  _bindDonutClick();
}
