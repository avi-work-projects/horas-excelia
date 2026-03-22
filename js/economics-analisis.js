/* ============================================================
   ECONOMICS — Análisis Ec. Personal (gastos + hipoteca)
   ============================================================ */

/* ── Análisis Economía Personal ────────────────────────────── */
var ANALISIS_SUB='gastos'; // 'gastos' | 'hipoteca'
var ANALISIS_ALT_RATE=2.5;
var ANALISIS_SWITCH_COST=0;
var ANALISIS_SORT='desc'; // 'asc' | 'desc' | 'cat'
var ANALISIS_FILTER_TEXT='';
var ANALISIS_FILTER_CAT='all'; // 'all' | 'gasto' | 'inversion'
var ANALISIS_CAT_MODE='month'; // 'month' | 'year' — toggle for category bars
var ANALISIS_CALC_HIP=false; // botón Calcular hipoteca
/* Desgravables para incluir en análisis personal (ids de GASTOS_ITEMS) */
var ANALISIS_DESGRAV_IDS={hipoteca:true,comunidad:true,seg_hogar:true,gas:true,luz:true,digi:true,agua:true,otros_seg:true};
var ANALISIS_DESGRAV_DISCOUNT=true; // aplicar descuento del desgravamiento
/* Seguros normales (sin vinculación) para comparar sobrecostes */
var ANALISIS_SEG_NORMAL={segSalud:0,segVida:0,segHogar:0};

function renderEconAnalisis(){
  if(typeof loadPersonalYear==='function')loadPersonalYear(ECON_YEAR);
  if(typeof loadGastosYear==='function')loadGastosYear(ECON_YEAR);
  if(typeof loadDespacho==='function')loadDespacho();
  var h='';
  /* Sub-tabs */
  h+='<div class="econ-sub-tabs">';
  h+='<button class="econ-sub-tab'+(ANALISIS_SUB==='gastos'?' active':'')+'" id="analisisSubGastos">Mis gastos</button>';
  h+='<button class="econ-sub-tab'+(ANALISIS_SUB==='hipoteca'?' active':'')+'" id="analisisSubHipoteca">An\u00e1lisis Hipoteca</button>';
  h+='</div>';
  if(ANALISIS_SUB==='gastos'){h+=_renderAnalisisGastos();}
  else{h+=_renderAnalisisHipoteca();}
  return h;
}

function _renderAnalisisGastos(){
  var h='';
  /* Real income = disponible (post decl. renta + ingresos extras), NOT personal ingresos */
  var disponible=typeof computeDisponible==='function'?computeDisponible(ECON_YEAR):0;
  var tIngExtra=typeof _personalTotal==='function'?_personalTotal(PERSONAL_DATA.ingresos):0;

  /* Collect personal gastos with categories */
  var allItems=[];
  /* Gastos semanales: reducidos 18% (parte se dedica a otros conceptos ya listados) */
  var totalSemAnual=0;
  (PERSONAL_DATA.gastosSemanales||[]).forEach(function(g){if(!g.amount)return;var a=g.period==='monthly'?g.amount*12:Math.ceil(g.amount*52*0.82);totalSemAnual+=a;allItems.push({label:g.label,annual:a,cat:'gasto',_weekly:true});});
  /* Gastos recurrentes (incluye viajes con prorrateo) */
  var gastoSemDiario=totalSemAnual/365;
  (PERSONAL_DATA.gastosRecurrentes||[]).forEach(function(g){if(!g.amount)return;var a=g.period==='annual'?g.amount:g.period==='weekly'?g.amount*52:g.amount*12;
    /* Prorrateo viajes: restar gastos semanales de los días de viaje */
    if(g._viaje&&typeof EVENTS!=='undefined'){
      var diasViaje=0;
      EVENTS.forEach(function(ev){
        if(g.viajeFilter&&g.viajeFilter!=='all'&&ev.id!==g.viajeFilter)return;
        var evY=parseInt((ev.start||'').substring(0,4),10);
        if(evY!==ECON_YEAR)return;
        if(ev.start&&ev.end){var d1=new Date(ev.start),d2=new Date(ev.end);diasViaje+=Math.max(1,Math.round((d2-d1)/(86400000))+1);}
        else diasViaje+=1;
      });
      if(diasViaje>0){var descuento=Math.round(gastoSemDiario*diasViaje);a=Math.max(0,a-descuento);}
    }
    allItems.push({label:g.label,annual:a,cat:'gasto',_viaje:!!g._viaje});
  });
  (PERSONAL_DATA.inversiones||[]).forEach(function(g){if(!g.amount)return;var a=g.period==='annual'?g.amount:g.amount*12;allItems.push({label:g.label,annual:a,cat:'inversion'});});
  allItems.sort(function(a,b){return b.annual-a.annual;});

  var tGastos=0,tInv=0;
  allItems.forEach(function(i){if(i.cat==='inversion')tInv+=i.annual;else tGastos+=i.annual;});
  var totalOut=tGastos+tInv;
  var totalDisponible=disponible+tIngExtra;
  var balance=totalDisponible-totalOut;

  /* Empty state */
  if(allItems.length===0&&disponible<=0){
    h+='<div class="sy-section" style="text-align:center;padding:20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura tus gastos e inversiones en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Econom\u00eda Personal</b></div>';
    h+='</div>';
    return h;
  }

  /* ── Sección 1: Resumen mensual (hero) ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Resumen mensual ('+ECON_YEAR+')</div>';
  h+='<div class="ah-cuota-hero"><div class="ah-cuota-val" style="color:'+(balance>=0?'var(--c-green)':'var(--c-red)')+'">'+fcPlain(Math.ceil(balance/12))+'</div>';
  h+='<div class="ah-cuota-sub">Libre mensual (disponible \u2212 gastos \u2212 inversiones)</div></div>';
  h+='<div class="hip-stats">';
  h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-green)">'+fcPlain(Math.round(disponible/12*100)/100)+'</span><span class="hip-stat-lbl">Renta neta/mes</span></div>';
  if(tIngExtra>0)h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-green)">'+fcPlain(Math.round(tIngExtra/12*100)/100)+'</span><span class="hip-stat-lbl">Ingresos extra/mes</span></div>';
  /* Hipoteca card */
  if(typeof DESPACHO!=='undefined'&&DESPACHO.compra&&DESPACHO.compra.importePrestamo>0){
    var _hVinc=DESPACHO.compra.vinculaciones||{};
    var _hSubs=DESPACHO.compra.subrogaciones||[];
    var _hTipo=_hSubs.length>0?_hSubs[_hSubs.length-1].nuevoTipoInteres:DESPACHO.compra.tipoInteres;
    var _hImporte=_hSubs.length>0?_hSubs[_hSubs.length-1].nuevoImporte:DESPACHO.compra.importePrestamo;
    var _hPlazo=_hSubs.length>0?_hSubs[_hSubs.length-1].nuevoPlazoAnios:DESPACHO.compra.plazoAnios;
    var _hVinc2=_hSubs.length>0?(_hSubs[_hSubs.length-1].vinculaciones||{}):_hVinc;
    if(_hTipo>0&&_hPlazo>0){
      var _hTipoEf=typeof _hipEffRate==='function'?_hipEffRate(_hTipo,_hVinc2):_hTipo;
      var _hR=_hTipoEf/100/12,_hN=_hPlazo*12;
      var _hCuota=_hR>0?Math.round(_hImporte*_hR*Math.pow(1+_hR,_hN)/(Math.pow(1+_hR,_hN)-1)*100)/100:0;
      h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-red)">'+fcPlain(_hCuota)+'</span><span class="hip-stat-lbl">Hipoteca/mes</span></div>';
    }
  }
  h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-orange)">'+fcPlain(Math.ceil(tGastos*0.82/12))+'</span><span class="hip-stat-lbl">Gastos/mes -18%*</span></div>';
  if(tInv>0)h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--accent-bright)">'+fcPlain(Math.round(tInv/12*100)/100)+'</span><span class="hip-stat-lbl">Inversiones/mes</span></div>';
  h+='</div>';
  h+='<div style="font-size:.62rem;color:var(--text-dim);margin-top:4px">Disponible = post decl. renta'+(tIngExtra>0?' + ingresos extra':'')+' \u2212 gastos profesionales</div>';
  /* Key ratios */
  if(disponible>0){
    var ratioGastos=Math.round(tGastos/disponible*100);
    var ratioAhorro=tInv>0?Math.round(tInv/disponible*100):0;
    h+='<div style="display:flex;gap:8px;margin-top:6px;font-size:.68rem">';
    h+='<span style="color:var(--text-dim)">Gastos: <b style="color:'+(ratioGastos>80?'var(--c-red)':ratioGastos>60?'var(--c-orange)':'var(--c-green)')+'">'+ratioGastos+'%</b></span>';
    if(ratioAhorro>0)h+='<span style="color:var(--text-dim)">Ahorro: <b style="color:var(--accent-bright)">'+ratioAhorro+'%</b></span>';
    var ratioLibre=Math.max(0,100-ratioGastos-ratioAhorro);
    h+='<span style="color:var(--text-dim)">Libre: <b style="color:var(--c-green)">'+ratioLibre+'%</b></span>';
    h+='</div>';
  }
  /* Donut */
  if(totalOut>0&&disponible>0){
    var pG=Math.round(tGastos/disponible*100);
    var pI=Math.round(tInv/disponible*100);
    var pL=Math.max(0,100-pG-pI);
    h+=_triDonut(pG,pI,pL);
  }
  h+='</div>';

  /* ── Sección 2: Gastos por categoría (agregados) ── */
  /* Group by "seg" prefix, "factura", etc. */
  var cats={seguros:{label:'\uD83D\uDEE1 Seguros',items:[],total:0},facturas:{label:'\uD83D\uDCE6 Facturas/Suministros',items:[],total:0},inversiones:{label:'\uD83D\uDCC8 Inversiones',items:[],total:0},otros:{label:'\uD83D\uDCCB Otros gastos',items:[],total:0}};
  allItems.forEach(function(it){
    var l=it.label.toLowerCase();
    if(it.cat==='inversion'){cats.inversiones.items.push(it);cats.inversiones.total+=it.annual;}
    else if(l.indexOf('seguro')!==-1||l.indexOf('seg.')!==-1){cats.seguros.items.push(it);cats.seguros.total+=it.annual;}
    else if(l.indexOf('factura')!==-1||l.indexOf('gas')!==-1||l.indexOf('luz')!==-1||l.indexOf('agua')!==-1||l.indexOf('internet')!==-1||l.indexOf('digi')!==-1||l.indexOf('m\u00f3vil')!==-1){cats.facturas.items.push(it);cats.facturas.total+=it.annual;}
    else{cats.otros.items.push(it);cats.otros.total+=it.annual;}
  });
  var catKeys=['seguros','facturas','inversiones','otros'];
  var catColorsMap={seguros:'#c084fc',facturas:'#fbbf24',inversiones:'#6c8cff',otros:'#fb923c'};
  /* Aggregated summary */
  var hasCats=false;
  catKeys.forEach(function(k){if(cats[k].total>0)hasCats=true;});
  if(hasCats){
    h+='<div class="ah-section">';
    h+='<div class="ah-section-title" style="display:flex;align-items:center;justify-content:space-between">Gastos por categor\u00eda';
    h+='<div style="display:flex;gap:4px">';
    h+='<button class="fiscal-period-btn'+(ANALISIS_CAT_MODE==='month'?' active':'')+'" data-acm="month" style="font-size:.55rem;padding:2px 5px">/mes</button>';
    h+='<button class="fiscal-period-btn'+(ANALISIS_CAT_MODE==='year'?' active':'')+'" data-acm="year" style="font-size:.55rem;padding:2px 5px">/a\u00f1o</button>';
    h+='</div></div>';
    var catBars=[];
    var catDiv=ANALISIS_CAT_MODE==='month'?12:1;
    catKeys.forEach(function(k){if(cats[k].total>0)catBars.push({label:cats[k].label,annual:Math.round(cats[k].total/catDiv)});});
    catBars.sort(function(a,b){return b.annual-a.annual;});
    h+=_analisisHBar(catBars,'multi',ANALISIS_CAT_MODE==='month'?'/m':'/a');
    h+='</div>';
  }

  /* ── Sección 3: Detalle de gastos e inversiones ── */
  if(allItems.length>0){
    h+='<div class="ah-section">';
    h+='<div class="ah-section-title">Detalle de gastos e inversiones</div>';
    h+=_analisisHBar(allItems,'multi');
    h+='</div>';
  }

  /* ── Sección 4: Presupuesto vs Disponible (tabla compacta) ── */
  if(disponible>0&&allItems.length>0){
    var pItems=[];
    allItems.forEach(function(i){
      pItems.push({label:i.label,annual:i.annual,cat:i.cat,desgrav:false,_weekly:i._weekly,_viaje:i._viaje});
    });
    /* Add desgravable items with tax deduction discount applied.
       The "real cost" of a desgravable expense = expense × (1 - marginal_tax_rate)
       because deducting it from the tax base saves marginal_tax_rate × expense. */
    var _dLbls={hipoteca:'Hipoteca',comunidad:'Comunidad',seg_hogar:'Seg. Hogar',gas:'Gas',luz:'Luz',digi:'Internet',agua:'Agua',otros_seg:'Otros seg.'};
    /* Calcular ahorro real por desgravaciones (mismo cálculo que en Analisis dec. renta)
       y distribuirlo proporcionalmente entre cada gasto desgravable */
    var _ahorroTotal=0;
    if(typeof computeDeclResult==='function'&&typeof computeEconEx==='function'&&typeof computeIrpfBrackets==='function'){
      var _mrOpts2=typeof _getMultiRateOpts==='function'?_getMultiRateOpts():{};
      var _ec2=computeEconEx(ECON_YEAR,_mrOpts2);
      var _dr2=computeDeclResult(_ec2.totBase,_ec2.totIrpf);
      var _sinDesgrav=computeIrpfBrackets(_dr2.baseAfterGD);
      _ahorroTotal=Math.round((_sinDesgrav.totalTax-_dr2.decl.totalTax+(_dr2.totalQuotaDesgrav||0))*100)/100;
    }
    /* Recoger gastos desgravables y calcular total bruto para prorrateo */
    var _desgItems=[];
    var _totalBrutoDesg=0;
    if(typeof GASTOS_ITEMS!=='undefined'){
      GASTOS_ITEMS.forEach(function(g){
        if(!g.amount)return;
        var anual=typeof gastoAnual==='function'?gastoAnual(g.id):(g.period==='monthly'?g.amount*12:g.amount);
        _desgItems.push({id:g.id,label:g.label,anual:anual});
        _totalBrutoDesg+=anual;
      });
    }
    _desgItems.forEach(function(d){
      /* Descuento proporcional: ahorro_total × (gasto / total_gastos_desgravables) */
      var descuento=_totalBrutoDesg>0&&_ahorroTotal>0?Math.round(_ahorroTotal*d.anual/_totalBrutoDesg*100)/100:0;
      var efectivo=Math.ceil(d.anual-descuento);
      pItems.push({label:(_dLbls[d.id]||d.label),annual:efectivo,annualBruto:d.anual,descuento:descuento,cat:'desgrav',desgrav:true});
    });
    /* Apply sort */
    if(ANALISIS_SORT==='asc')pItems.sort(function(a,b){return a.annual-b.annual;});
    else if(ANALISIS_SORT==='cat')pItems.sort(function(a,b){return a.cat<b.cat?-1:a.cat>b.cat?1:b.annual-a.annual;});
    else pItems.sort(function(a,b){return b.annual-a.annual;});
    /* Apply filters */
    var fItems=pItems;
    if(ANALISIS_FILTER_CAT!=='all')fItems=fItems.filter(function(p){return p.cat===ANALISIS_FILTER_CAT;});
    if(ANALISIS_FILTER_TEXT)fItems=fItems.filter(function(p){return p.label.toLowerCase().indexOf(ANALISIS_FILTER_TEXT.toLowerCase())!==-1;});

    /* Para el presupuesto: solo contar gastos personales (no desgravables,
       ya que computeDisponible() ya los resta del disponible) */
    var totalPartidas=0;pItems.forEach(function(p){if(!p.desgrav)totalPartidas+=p.annual;});
    var totalDisp=disponible+tIngExtra;
    var usedPct=totalDisp>0?Math.round(totalPartidas/totalDisp*1000)/10:0;
    var restante=Math.round((totalDisp-totalPartidas)*100)/100;

    h+='<div class="ah-section">';
    h+='<div class="ah-section-title">Presupuesto vs Disponible ('+fcPlain(Math.round(totalDisp))+'/a\u00f1o)</div>';
    h+='<div class="hip-bar-wrap"><div class="hip-bar">';
    h+='<div class="hip-bar-cap" style="width:'+Math.min(usedPct,100)+'%;background:'+(usedPct>90?'var(--c-red)':usedPct>70?'var(--c-orange)':'var(--c-green)')+'"></div>';
    h+='<div class="hip-bar-int" style="width:'+Math.max(0,100-usedPct)+'%;background:var(--surface)"></div>';
    h+='</div>';
    h+='<div class="hip-bar-legend"><span style="color:'+(usedPct>90?'var(--c-red)':'var(--text-muted)')+'">Usado: '+usedPct+'%</span><span style="color:var(--c-green)">Libre: '+fcPlain(Math.round(restante/12*100)/100)+'/mes</span></div></div>';
    /* Filters: search bar on first row, category buttons on second row */
    h+='<div style="display:flex;gap:4px;margin-bottom:4px;align-items:center">';
    h+='<input type="text" id="analisisFilterText" placeholder="Buscar concepto..." value="'+escHtml(ANALISIS_FILTER_TEXT)+'" style="flex:1;min-width:80px;font-size:.65rem;padding:3px 6px;border-radius:4px;border:1px solid var(--border);background:var(--surface2);color:var(--text)">';
    h+='<button class="fiscal-period-btn" id="analisisFilterBtn" style="font-size:.58rem;padding:2px 6px">\uD83D\uDD0D Buscar</button>';
    h+='</div>';
    h+='<div style="display:flex;gap:4px;margin-bottom:6px">';
    var _fc=['all','gasto','inversion','desgrav'];
    var _fl={all:'Todos',gasto:'Gastos',inversion:'Inversiones',desgrav:'Desgravables'};
    _fc.forEach(function(c){h+='<button class="fiscal-period-btn'+(ANALISIS_FILTER_CAT===c?' active':'')+'" data-afc="'+c+'" style="font-size:.58rem;padding:2px 6px">'+_fl[c]+'</button>';});
    h+='</div>';
    /* Table */
    h+='<div class="mg-budget-table">';
    h+='<div class="mg-budget-hdr mg-budget-hdr4"><span>Concepto</span><span class="mg-sort-btn" data-asort="month">/mes \u25BC</span><span>/a\u00f1o</span><span>%</span></div>';
    var _catC={gasto:'#fb923c',inversion:'#6c8cff',desgrav:'#c084fc'};
    fItems.forEach(function(p){
      var pct=totalDisp>0?Math.round(p.annual/totalDisp*1000)/10:0;
      var lbl=escHtml(p.label);
      if(p.desgrav)lbl+=' <span style="color:#c084fc;font-size:.55rem">(desgr)</span>';
      h+='<div class="mg-budget-row mg-budget-row4"><span class="mg-budget-lbl"><span class="mg-cat-dot" style="background:'+(_catC[p.cat]||'#999')+'"></span>'+lbl+'</span>';
      h+='<span class="mg-budget-val">'+Math.ceil(p.annual/12)+'\u20ac</span>';
      h+='<span class="mg-budget-val">'+Math.ceil(p.annual)+'\u20ac</span>';
      h+='<span class="mg-budget-pct">'+pct+'%</span></div>';
    });
    h+='</div>';
    /* Notes */
    h+='<div style="font-size:.58rem;color:var(--text-dim);margin-top:6px;line-height:1.4">';
    h+='\u26A0 Los gastos semanales se reducen un 18% (redondeando al euro superior) porque parte se dedica a pagar otros conceptos ya incluidos en esta lista.<br>';
    h+='\u26A0 Los viajes se prorratean: se restan los gastos semanales proporcionales a los d\u00edas de viaje, ya que durante esos d\u00edas no se incurren gastos semanales habituales.<br>';
    h+='\u26A0 Los gastos desgravables (marcados en morado) muestran su coste efectivo: el ahorro total por desgravaciones ('+fcPlain(_ahorroTotal)+') se reparte proporcionalmente entre cada gasto.';
    h+='</div>';
    h+='</div>';
  }

  return h;
}

/* Tri-section donut: gastos vs inversiones vs libre */
function _triDonut(pctG,pctI,pctL){
  var r=28,cx=36,cy=36,sw=7;
  var circ=2*Math.PI*r;
  var dG=Math.round(circ*pctG/100),dI=Math.round(circ*pctI/100),dL=circ-dG-dI;
  var svg='<svg width="72" height="72" viewBox="0 0 72 72">';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#1e1e2e" stroke-width="'+sw+'"/>';
  /* Gastos arc */
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#fb923c" stroke-width="'+sw+'" stroke-dasharray="'+dG+' '+(circ-dG)+'" stroke-dashoffset="'+(circ/4)+'" stroke-linecap="round"/>';
  /* Inversiones arc */
  if(dI>0)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#6c8cff" stroke-width="'+sw+'" stroke-dasharray="'+dI+' '+(circ-dI)+'" stroke-dashoffset="'+(circ/4-dG)+'" stroke-linecap="round"/>';
  /* Libre arc */
  if(dL>2)svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#34d399" stroke-width="'+sw+'" stroke-dasharray="'+dL+' '+(circ-dL)+'" stroke-dashoffset="'+(circ/4-dG-dI)+'" stroke-linecap="round"/>';
  svg+='</svg>';
  var h='<div class="ah-donut-wrap">'+svg;
  h+='<div class="ah-donut-legend">';
  h+='<span><span style="color:#fb923c">\u25CF</span> Gastos '+pctG+'%</span>';
  if(pctI>0)h+='<span><span style="color:#6c8cff">\u25CF</span> Inversiones '+pctI+'%</span>';
  if(pctL>0)h+='<span><span style="color:#34d399">\u25CF</span> Libre '+pctL+'%</span>';
  h+='</div></div>';
  return h;
}

/* Helper: month name in Spanish (1-based) */
function _monthName(m){
  var names=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return names[(m-1+12)%12]||'';
}
/* Helper: compute effective rate for a mortgage considering vinculaciones */
function _hipTipoEfectivo(tipoNominal,vinc){
  var r=tipoNominal;
  if(vinc){['nomina','segHogar','segSalud','segVida'].forEach(function(k){if(vinc[k]&&vinc[k].enabled)r-=(vinc[k].reduccion||0);});}
  return Math.max(0,r);
}
/* Helper: mortgage info box for analysis (shows cuota + details) */
function _analisisMortgageBox(title,importe,tipoNominal,tipoEfectivo,plazo,banco){
  var rEf=tipoEfectivo/100/12,n=plazo*12;
  var cuota=rEf>0?importe*rEf*Math.pow(1+rEf,n)/(Math.pow(1+rEf,n)-1):importe/n;
  cuota=Math.round(cuota*100)/100;
  var total=Math.round(cuota*n*100)/100;
  var intereses=Math.round((total-importe)*100)/100;
  var h='<div class="analisis-mortgage-current" style="margin-bottom:8px">';
  h+='<div class="analisis-mortgage-label">'+title+(banco?' ('+escHtml(banco)+')':'')+'</div>';
  h+='<div class="analisis-mortgage-vals">';
  h+='<span>Cuota: <b>'+fcPlain(cuota)+'</b>/mes</span>';
  h+='<span>Total: <b>'+fcPlain(Math.round(total))+'</b></span>';
  h+='<span>Intereses: <b style="color:var(--c-orange)">'+fcPlain(Math.round(intereses))+'</b></span>';
  h+='</div>';
  if(tipoNominal!==tipoEfectivo){
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-top:2px">Tipo: '+tipoNominal.toFixed(2)+'% \u2192 efectivo <b style="color:var(--c-green)">'+tipoEfectivo.toFixed(2)+'%</b></div>';
  } else {
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-top:2px">Tipo: '+tipoNominal.toFixed(2)+'% fijo, '+plazo+' a\u00f1os</div>';
  }
  h+='</div>';
  return h;
}

function _renderAnalisisHipoteca(){
  var h='';
  var comp=DESPACHO&&DESPACHO.compra?DESPACHO.compra:null;
  if(!comp||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios){
    h+='<div class="sy-section" style="text-align:center;padding:30px 20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura los datos de hipoteca en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Hipoteca</b> para ver el an\u00e1lisis.</div>';
    h+='</div>';
    return h;
  }

  var subs=comp.subrogaciones||[];
  if(!subs.length&&comp.subrogacion)subs=[comp.subrogacion];
  /* Get active mortgage for current calculations */
  var act=typeof _getActiveMortgage==='function'?_getActiveMortgage(comp):{importe:comp.importePrestamo,tipo:comp.tipoInteres,plazo:comp.plazoAnios,fecha:comp.fechaInicio,banco:comp.entidadBanco,vinc:comp.vinculaciones,idx:-1};
  var tipoEfAct=typeof _hipEffRate==='function'?_hipEffRate(act.tipo,act.vinc):act.tipo;
  var rAct=tipoEfAct/100/12,nAct=act.plazo*12;
  var cuotaAct=rAct>0?act.importe*rAct*Math.pow(1+rAct,nAct)/(Math.pow(1+rAct,nAct)-1):act.importe/nAct;
  cuotaAct=Math.round(cuotaAct*100)/100;

  /* ── Sección 1: Situación actual ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Situaci\u00f3n actual'+(act.banco?' \u2014 '+escHtml(act.banco):'')+'</div>';
  h+='<div class="ah-cuota-hero"><div class="ah-cuota-val">'+fcPlain(cuotaAct)+'</div>';
  h+='<div class="ah-cuota-sub">Cuota mensual \u00b7 '+tipoEfAct.toFixed(2)+'% bonificado'+(tipoEfAct!==act.tipo?' (nominal '+act.tipo.toFixed(2)+'%)':'')+' \u00b7 '+act.plazo+' a\u00f1os</div></div>';

  /* Stats: saldo vivo, intereses, tiempo */
  var hoy=new Date();
  var todayStr=hoy.getFullYear()+'-'+String(hoy.getMonth()+1).padStart(2,'0')+'-01';
  var saldoVivo=typeof _computeBalanceAtDate==='function'?_computeBalanceAtDate(comp,todayStr):0;
  var intAnual=typeof _computeAnnualInterest==='function'?_computeAnnualInterest(comp,ECON_YEAR):0;
  var mPagados=0,mRestantes=0;
  if(act.fecha){
    var fp=act.fecha.split('-');
    mPagados=Math.max(0,(hoy.getFullYear()-parseInt(fp[0],10))*12+(hoy.getMonth()-(parseInt(fp[1],10)-1)));
    mRestantes=Math.max(0,nAct-mPagados);
  }
  h+='<div class="hip-stats">';
  if(saldoVivo>0){var pctA=Math.round((1-saldoVivo/act.importe)*100);h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-green)">'+_fmtMiles(saldoVivo)+'\u20ac</span><span class="hip-stat-lbl">Saldo vivo ('+pctA+'%)</span></div>';}
  if(intAnual>0)h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--c-orange)">'+fcPlain(intAnual)+'</span><span class="hip-stat-lbl">Intereses '+ECON_YEAR+'</span></div>';
  if(mPagados>0){var aP=Math.floor(mPagados/12),mR2=mPagados%12;h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--accent-bright)">'+(aP>0?aP+'a ':'')+(mR2>0?mR2+'m':'')+'</span><span class="hip-stat-lbl">Pagado</span></div>';}
  if(mRestantes>0){var aQ=Math.floor(mRestantes/12),mQ=mRestantes%12;h+='<div class="hip-stat"><span class="hip-stat-val" style="color:var(--text-muted)">'+(aQ>0?aQ+'a ':'')+(mQ>0?mQ+'m':'')+'</span><span class="hip-stat-lbl">Restante</span></div>';}
  h+='</div>';

  /* Donut: capital amortizado vs pendiente */
  if(saldoVivo>0&&act.importe>0){
    var pctAmort=Math.round((1-saldoVivo/act.importe)*100);
    h+=_donutChart(pctAmort,'Amortizado','Pendiente');
  }

  /* Desglose cuota actual: capital vs intereses */
  if(saldoVivo>0){
    var intMes=Math.round(saldoVivo*rAct*100)/100;
    var capMes=Math.round((cuotaAct-intMes)*100)/100;
    var pctCap=Math.round(capMes/cuotaAct*100);
    h+='<div style="font-size:.68rem;color:var(--text-dim);margin-top:8px;font-weight:600">Desglose cuota actual</div>';
    h+='<div class="hip-bar-wrap" style="margin-top:4px"><div class="hip-bar"><div class="hip-bar-cap" style="width:'+pctCap+'%"></div><div class="hip-bar-int" style="width:'+(100-pctCap)+'%"></div></div>';
    h+='<div class="hip-bar-legend"><span class="hip-bar-leg-cap">Capital '+pctCap+'% \u00b7 '+fcPlain(capMes)+'</span><span class="hip-bar-leg-int">Intereses '+(100-pctCap)+'% \u00b7 '+fcPlain(intMes)+'</span></div></div>';
  }
  h+='</div>';

  /* ── Sección 2: Evolución del préstamo ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Evoluci\u00f3n del pr\u00e9stamo</div>';
  h+=_balanceEvolutionChart(comp);
  h+='</div>';

  /* ── Sección 3: Análisis de la subrogación ── */
  var _lastSub=subs.length>0?subs[subs.length-1]:null;
  if(_lastSub){
    h+=_renderSubrogacionAnalysis(comp,_lastSub);
  }

  /* ── Sección 4: Coste total de la hipoteca ── */
  h+='<div class="ah-section">';
  h+='<div class="ah-section-title">Coste total de la hipoteca</div>';
  var totalCuotas=Math.round(cuotaAct*nAct);
  var totalInt=totalCuotas-act.importe;
  var totalCambio=0;
  subs.forEach(function(s){totalCambio+=(s.comisionCancelacion||0)+(s.notaria||0)+(s.tasacion||0)+(s.registro||0);});
  var vincAnual=0;
  var segRef=DESPACHO&&DESPACHO.segurosNormales?DESPACHO.segurosNormales:{};
  var refMap={segHogar:'segHogar',segSalud:'segSalud',segVida:'segVida'};
  var sobrecosteAnual=0;
  if(act.vinc){['segHogar','segSalud','segVida'].forEach(function(k){
    if(act.vinc[k]&&act.vinc[k].enabled){
      var costeVinc=act.vinc[k].costeAnual||0;
      var costeRef=segRef[refMap[k]]||0;
      vincAnual+=costeVinc;
      sobrecosteAnual+=Math.max(0,costeVinc-costeRef);
    }
  });}
  var totalVinc=Math.round(vincAnual*act.plazo);
  var totalSobrecoste=Math.round(sobrecosteAnual*act.plazo);
  h+='<div class="ah-total-row">'+_ahRow('Capital prestado',_fmtMiles(act.importe)+' \u20ac')+'</div>';
  h+='<div class="ah-total-row">'+_ahRow('Total intereses ('+tipoEfAct.toFixed(2)+'% bonif.)',_fmtMiles(totalInt)+' \u20ac','var(--c-orange)')+'</div>';
  if(totalCambio>0)h+='<div class="ah-total-row">'+_ahRow('Costes subrogaci\u00f3n',_fmtMiles(totalCambio)+' \u20ac','var(--c-orange)')+'</div>';
  if(totalSobrecoste>0)h+='<div class="ah-total-row">'+_ahRow('Sobrecoste seguros (vs ref. ~'+act.plazo+'a)',_fmtMiles(totalSobrecoste)+' \u20ac','var(--c-red)')+'</div>';
  h+='<div class="ah-total-row highlight">'+_ahRow('TOTAL',_fmtMiles(totalCuotas+totalCambio+totalSobrecoste)+' \u20ac')+'</div>';
  /* Hipoteca equivalente (con sobrecoste incluido) */
  if(sobrecosteAnual>0){
    var _sobrMesAn=sobrecosteAnual/12;
    var _hipEqAn=Math.round((cuotaAct+_sobrMesAn)*100)/100;
    var _eqTipoAn=tipoEfAct;
    if(act.importe>0&&nAct>0){
      for(var _it2=0;_it2<50;_it2++){
        var _tr2=_eqTipoAn/100/12;
        var _tc2=_tr2>0?act.importe*_tr2*Math.pow(1+_tr2,nAct)/(Math.pow(1+_tr2,nAct)-1):act.importe/nAct;
        if(Math.abs(_tc2-_hipEqAn)<0.01)break;
        _eqTipoAn+=(_hipEqAn-_tc2)*0.001;
      }
    }
    h+='<div style="font-size:.7rem;margin-top:6px;padding:8px;background:var(--surface2);border-radius:var(--radius-sm)">';
    h+='<b style="color:var(--accent-bright)">Hipoteca equivalente: '+fcPlain(_hipEqAn)+'/mes</b>';
    h+='<div style="font-size:.6rem;color:var(--text-dim);margin-top:2px">Tipo equivalente: <b>'+_eqTipoAn.toFixed(2)+'%</b> (cuota '+fcPlain(cuotaAct)+' + sobrecoste '+Math.round(_sobrMesAn)+'\u20ac/mes)</div></div>';
  }
  h+='</div>';

  return h;
}
function _ahRow(lbl,val,color){
  return '<span class="hip-ro-lbl">'+lbl+'</span><span class="hip-ro-val"'+(color?' style="color:'+color+'"':'')+'>'+val+'</span>';
}

/* ── Donut chart SVG ──────────────────────────────────────── */
function _donutChart(pct,labelA,labelB){
  var r=30,cx=40,cy=40,sw=8;
  var circ=2*Math.PI*r;
  var dashA=Math.round(circ*pct/100);
  var dashB=circ-dashA;
  var svg='<svg width="80" height="80" viewBox="0 0 80 80">';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#2a2a3e" stroke-width="'+sw+'"/>';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#34d399" stroke-width="'+sw+'" stroke-dasharray="'+dashA+' '+dashB+'" stroke-dashoffset="'+(circ/4)+'" stroke-linecap="round"/>';
  svg+='<text x="'+cx+'" y="'+(cy+3)+'" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">'+pct+'%</text>';
  svg+='</svg>';
  var h='<div class="ah-donut-wrap">'+svg;
  h+='<div class="ah-donut-legend"><span style="color:var(--c-green)">\u25CF '+labelA+': '+pct+'%</span><span style="color:var(--text-dim)">\u25CF '+labelB+': '+(100-pct)+'%</span></div></div>';
  return h;
}

/* ── Balance evolution chart ──────────────────────────────── */
function _balanceEvolutionChart(comp){
  if(!comp.fechaInicio)return '';
  var startParts=comp.fechaInicio.split('-');
  var startY=parseInt(startParts[0],10),startM=parseInt(startParts[1],10)-1;
  var tipoEf=typeof _hipEffRate==='function'?_hipEffRate(comp.tipoInteres,comp.vinculaciones):comp.tipoInteres;
  var r=tipoEf/100/12,nTotal=comp.plazoAnios*12;
  var cuota=r>0?comp.importePrestamo*r*Math.pow(1+r,nTotal)/(Math.pow(1+r,nTotal)-1):comp.importePrestamo/nTotal;
  var balance=comp.importePrestamo;
  var switches=typeof _buildMortgageSwitches==='function'?_buildMortgageSwitches(comp):[];
  var switchIdx=0;
  var years=Math.ceil(nTotal/12);
  var points=Math.min(years,40);
  var balances=[balance];
  var switchYears=[];
  switches.forEach(function(s){switchYears.push(Math.round(s.monthOffset/12*10)/10);});
  for(var y=1;y<=points;y++){
    for(var mi=0;mi<12;mi++){
      var m=(y-1)*12+mi;
      while(switchIdx<switches.length&&m>=switches[switchIdx].monthOffset){
        balance=switches[switchIdx].balance;r=switches[switchIdx].rate;cuota=switches[switchIdx].cuota;switchIdx++;
      }
      if(balance<=0)break;
      var interes=balance*r;
      var capital=cuota-interes;
      if(capital>balance)capital=balance;
      balance-=capital;
      if(balance<0.01){balance=0;break;}
    }
    balances.push(Math.round(balance));
  }
  var W=320,H=110,PB=18,PT=10,PL=45,PR=8;
  var W2=W-PL-PR,H2=H-PT;
  var maxV=comp.importePrestamo;
  function xPos(i){return Math.round(PL+(i/points)*W2);}
  function yPos(v){return Math.round(PT+H2-v/maxV*H2);}
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin-top:6px">';
  /* Grid */
  var step=50000;while(maxV/step>4)step*=2;while(maxV/step<1.5&&step>10000)step=Math.round(step/2);
  for(var gv=0;gv<=maxV;gv+=step){
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv>=1000?Math.round(gv/1000)+'k':'0';
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  /* Area fill */
  var areaPath='M'+xPos(0)+','+yPos(0);
  for(var i=1;i<balances.length;i++)areaPath+=' L'+xPos(i)+','+yPos(balances[i]);
  areaPath+=' L'+xPos(balances.length-1)+','+yPos(0)+' Z';
  svg+='<path d="'+areaPath+'" fill="rgba(108,140,255,.12)"/>';
  /* Line */
  var linePts=balances.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+linePts+'" fill="none" stroke="#6c8cff" stroke-width="2" stroke-linejoin="round"/>';
  /* Switch points */
  switchYears.forEach(function(sy){
    if(sy>0&&sy<=points){
      var sx=xPos(sy);
      svg+='<line x1="'+sx+'" y1="'+PT+'" x2="'+sx+'" y2="'+yPos(0)+'" stroke="#c084fc" stroke-width="1" stroke-dasharray="3,3"/>';
      svg+='<text x="'+sx+'" y="'+(PT-1)+'" text-anchor="middle" font-size="5" fill="#c084fc">Sub.</text>';
    }
  });
  /* X labels */
  for(var xi=0;xi<=points;xi+=Math.max(1,Math.round(points/6))){
    svg+='<text x="'+xPos(xi)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+xi+'a</text>';
  }
  svg+='</svg>';
  return '<div class="analisis-mortgage-chart">'+svg+'</div>';
}

function _renderSubrogacionAnalysis(comp,sub){
  if(!sub)sub=(comp.subrogaciones||[])[0]||comp.subrogacion;
  if(!sub||!sub.fecha||!sub.nuevoImporte||!sub.nuevoTipoInteres||!sub.nuevoPlazoAnios)return '';
  if(!comp.fechaInicio||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios)return '';
  var h='';
  /* Calcular saldo vivo a fecha subrogación con condiciones originales */
  var balanceAtSub=typeof _computeBalanceAtDate==='function'?_computeBalanceAtDate(comp,sub.fecha):0;
  if(balanceAtSub<=0)return '';

  /* Cuota original para el plazo restante */
  var startP=comp.fechaInicio.split('-');
  var subP=sub.fecha.split('-');
  var mesesTranscurridos=((parseInt(subP[0],10)-parseInt(startP[0],10))*12)+(parseInt(subP[1],10)-parseInt(startP[1],10));
  var mesesRestantesOrig=comp.plazoAnios*12-mesesTranscurridos;
  if(mesesRestantesOrig<=0)return '';

  var tipoEfOrig=typeof _hipEffRate==='function'?_hipEffRate(comp.tipoInteres,comp.vinculaciones):comp.tipoInteres;
  var r1=tipoEfOrig/100/12;
  var cuotaOrig=balanceAtSub*r1*Math.pow(1+r1,mesesRestantesOrig)/(Math.pow(1+r1,mesesRestantesOrig)-1);
  var totalOrig=cuotaOrig*mesesRestantesOrig;
  var interesesOrig=totalOrig-balanceAtSub;

  /* Cuota nueva (bonificada) */
  var tipoEfNuevo=typeof _hipEffRate==='function'?_hipEffRate(sub.nuevoTipoInteres,sub.vinculaciones):sub.nuevoTipoInteres;
  var r2=tipoEfNuevo/100/12;
  var mesesNuevo=sub.nuevoPlazoAnios*12;
  var cuotaNueva=sub.nuevoImporte*r2*Math.pow(1+r2,mesesNuevo)/(Math.pow(1+r2,mesesNuevo)-1);
  var totalNuevo=cuotaNueva*mesesNuevo;
  var interesesNuevo=totalNuevo-sub.nuevoImporte;

  /* Costes del cambio */
  var costesCambio=(sub.comisionCancelacion||0)+(sub.notaria||0)+(sub.tasacion||0)+(sub.registro||0);

  /* Ahorro */
  var ahorroIntereses=Math.round((interesesOrig-interesesNuevo)*100)/100;
  var ahorroTotal=Math.round((totalOrig-(totalNuevo+costesCambio))*100)/100;
  var ahorroMes=Math.round((cuotaOrig-cuotaNueva)*100)/100;

  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">An\u00e1lisis de la subrogaci\u00f3n</div>';

  /* Cards resumen */
  h+='<div class="analisis-cards">';
  h+=_analisisCard('Ahorro cuota',ahorroMes,ahorroMes>=0?'var(--c-green)':'var(--c-red)');
  h+=_analisisCard('Ahorro intereses',(ahorroIntereses/12/((mesesNuevo>mesesRestantesOrig?mesesNuevo:mesesRestantesOrig)/12)),ahorroIntereses>=0?'var(--c-green)':'var(--c-red)');
  h+='</div>';

  /* Detalle */
  h+='<div style="padding:8px 0;font-size:.72rem;color:var(--text-muted)">';
  h+='<div>Capital pendiente al subrogar: <b>'+fcPlain(balanceAtSub)+'</b></div>';
  h+='<div>Costes del cambio: <b style="color:var(--c-orange)">'+fcPlain(costesCambio)+'</b></div>';
  h+='<div style="margin-top:4px">Cuota original ('+tipoEfOrig.toFixed(2)+'% bonif.'+(tipoEfOrig!==comp.tipoInteres?' \u2190 '+comp.tipoInteres.toFixed(2)+'% nom.':'')+', '+mesesRestantesOrig+' meses): <b>'+fcPlain(Math.round(cuotaOrig*100)/100)+'</b>/mes</div>';
  h+='<div>Cuota nueva ('+tipoEfNuevo.toFixed(2)+'% bonif.'+(tipoEfNuevo!==sub.nuevoTipoInteres?' \u2190 '+sub.nuevoTipoInteres.toFixed(2)+'% nom.':'')+', '+mesesNuevo+' meses): <b>'+fcPlain(Math.round(cuotaNueva*100)/100)+'</b>/mes</div>';
  h+='<div style="margin-top:4px">Intereses originales restantes: <b style="color:var(--c-orange)">'+fcPlain(Math.round(interesesOrig))+'</b></div>';
  h+='<div>Intereses nuevos: <b style="color:var(--c-orange)">'+fcPlain(Math.round(interesesNuevo))+'</b></div>';
  h+='<div style="margin-top:4px;font-size:.78rem">Ahorro total: <b style="color:'+(ahorroTotal>=0?'var(--c-green)':'var(--c-red)')+'">'+fcPlain(Math.round(ahorroTotal))+'</b></div>';
  h+='</div>';

  /* Break-even */
  if(costesCambio>0&&ahorroMes>0){
    var breakEven=Math.ceil(costesCambio/ahorroMes);
    h+='<div style="font-size:.72rem;color:var(--text-dim);padding:4px 0">Recuperas la inversi\u00f3n en <b>'+breakEven+' meses</b> ('+Math.round(breakEven/12*10)/10+' a\u00f1os)</div>';
  }

  /* Gráfica SVG comparativa */
  var maxMeses=Math.max(mesesRestantesOrig,mesesNuevo);
  var points=Math.min(Math.ceil(maxMeses/12),40);
  h+=_mortgageComparisonChart(cuotaOrig,cuotaNueva,maxMeses,costesCambio,comp.tipoInteres,sub.nuevoTipoInteres);

  /* Insurance cost comparison: bruto vs equivalente (restando ref.) */
  var _segRef2=DESPACHO&&DESPACHO.segurosNormales?DESPACHO.segurosNormales:{};
  var segAnualOrig=0,segAnualNuevo=0;
  var sobrecosteOrig=0,sobrecosteNuevo=0;
  var vinc=comp.vinculaciones;
  if(vinc){
    ['segSalud','segVida','segHogar'].forEach(function(k){
      if(vinc[k]&&vinc[k].enabled){
        var c=vinc[k].costeAnual||0;segAnualOrig+=c;
        sobrecosteOrig+=Math.max(0,c-(_segRef2[k]||0));
      }
    });
  }
  var subVinc=sub.vinculaciones;
  if(subVinc){
    ['segSalud','segVida','segHogar'].forEach(function(k){
      if(subVinc[k]&&subVinc[k].enabled){
        var c=subVinc[k].costeAnual||0;segAnualNuevo+=c;
        sobrecosteNuevo+=Math.max(0,c-(_segRef2[k]||0));
      }
    });
  }
  var diffBruto=Math.round((segAnualOrig-segAnualNuevo)*100)/100;
  var diffEquiv=Math.round((sobrecosteOrig-sobrecosteNuevo)*100)/100;
  if(segAnualOrig>0||segAnualNuevo>0){
    h+='<div style="padding:8px 0;font-size:.72rem;color:var(--text-muted);margin-top:4px">';
    h+='<div>Seguros originales: <b style="color:var(--c-orange)">'+fcPlain(segAnualOrig)+'</b>/a\u00f1o (sobrecoste: '+fcPlain(sobrecosteOrig)+')</div>';
    h+='<div>Seguros nuevos: <b style="color:var(--c-orange)">'+fcPlain(segAnualNuevo)+'</b>/a\u00f1o (sobrecoste: '+fcPlain(sobrecosteNuevo)+')</div>';
    h+='<div>Diferencia seguros (bruto): <b style="color:'+(diffBruto>=0?'var(--c-green)':'var(--c-red)')+'">'+((diffBruto>=0?'+':'')+fcPlain(diffBruto))+'</b>/a\u00f1o</div>';
    h+='<div>Diferencia seguros (equivalente, vs ref.): <b style="color:'+(diffEquiv>=0?'var(--c-green)':'var(--c-red)')+'">'+((diffEquiv>=0?'+':'')+fcPlain(diffEquiv))+'</b>/a\u00f1o</div>';
    /* Total savings using equivalente (overcost-based) */
    var maxM2=Math.max(mesesRestantesOrig,mesesNuevo);
    var totalAhorroConSeg=Math.round(((cuotaOrig+sobrecosteOrig/12)*maxM2-(cuotaNueva+sobrecosteNuevo/12)*maxM2-costesCambio)*100)/100;
    h+='<div style="margin-top:4px;font-size:.78rem">Ahorro total (cuotas + sobrecoste seguros): <b style="color:'+(totalAhorroConSeg>=0?'var(--c-green)':'var(--c-red)')+'">'+fcPlain(Math.round(totalAhorroConSeg))+'</b></div>';
    h+='</div>';
  }

  /* Diff chart: evolution A vs B */
  h+='<div style="margin-top:10px;font-size:.75rem;color:var(--text-muted);font-weight:600">Evoluci\u00f3n: quedarse vs subrogar</div>';
  h+='<div style="font-size:.65rem;color:var(--text-dim);margin-bottom:2px">Incluye cuotas + sobrecoste seguros (vs ref.). Zona verde = el cambio compensa.</div>';
  h+=_mortgageDiffChart(cuotaOrig,cuotaNueva,sobrecosteOrig,sobrecosteNuevo,mesesTranscurridos,maxMeses,costesCambio);

  h+='</div>';
  return h;
}

function _analisisCard(label,val,color){
  var sign=val>=0?'':'\u2212';
  var abs=Math.abs(Math.round(val*100)/100);
  return '<div class="analisis-card" style="border-left-color:'+color+'">'
    +'<div class="analisis-card-label">'+label+'</div>'
    +'<div class="analisis-card-value" style="color:'+color+'">'+sign+fcPlain(abs)+'/mes</div></div>';
}

function _analisisHBar(items,color,suffix){
  var sfx=suffix||'/a';
  var maxVal=items[0]?items[0].annual:1;
  var h='<div class="analisis-hbar-wrap">';
  var barColors=['#fb923c','#f59e0b','#fbbf24','#34d399','#6c8cff','#c084fc','#ff6b6b','#a78bfa'];
  items.forEach(function(item,i){
    var pct=maxVal>0?Math.round(item.annual/maxVal*100):0;
    var bc=typeof color==='string'&&color.charAt(0)==='#'?color:barColors[i%barColors.length];
    if(color==='var(--accent-bright)')bc=['#6c8cff','#818cf8','#a78bfa','#c084fc','#34d399'][i%5];
    h+='<div class="analisis-hbar-row">';
    h+='<div class="analisis-hbar-label">'+item.label+'</div>';
    h+='<div class="analisis-hbar-track"><div class="analisis-hbar-fill" style="width:'+Math.max(pct,4)+'%;background:'+bc+'"></div></div>';
    h+='<div class="analisis-hbar-val">'+fcPlain(Math.round(item.annual))+sfx+'</div>';
    h+='</div>';
  });
  h+='</div>';
  return h;
}

function _renderInsuranceOvercost(comp){
  var h='';
  var vinc=comp?comp.vinculaciones:null;
  if(!vinc)return '';
  /* Check if any insurance vinculación is enabled */
  var _segKeys=[{key:'segSalud',label:'Seguro salud'},{key:'segVida',label:'Seguro de vida'},{key:'segHogar',label:'Seguro hogar'}];
  var hasAny=false;
  _segKeys.forEach(function(s){if(vinc[s.key]&&vinc[s.key].enabled)hasAny=true;});
  if(!hasAny)return '';

  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Sobrecoste de seguros vinculados</div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim);margin-bottom:10px">Compara lo que pagas en seguros vinculados a la hipoteca con lo que costar\u00edan sin vinculaci\u00f3n.</div>';

  var totalVinc=0,totalNormal=0;
  h+='<div class="analisis-insurance-table">';
  h+='<div class="analisis-ins-header">';
  h+='<span></span><span>Vinculado</span><span>Normal</span><span>Sobrecoste</span>';
  h+='</div>';
  _segKeys.forEach(function(s){
    if(!vinc[s.key]||!vinc[s.key].enabled)return;
    var costeVinc=vinc[s.key].costeAnual||0;
    var _sn=typeof DESPACHO!=='undefined'&&DESPACHO.segurosNormales?DESPACHO.segurosNormales:{};
    var costeNormal=_sn[s.key]||ANALISIS_SEG_NORMAL[s.key]||0;
    var diff=costeVinc-costeNormal;
    totalVinc+=costeVinc;totalNormal+=costeNormal;
    h+='<div class="analisis-ins-row">';
    h+='<span class="analisis-ins-label">'+s.label+'</span>';
    h+='<span class="analisis-ins-val" style="color:var(--c-orange)">'+fcPlain(costeVinc)+'</span>';
    h+='<span class="analisis-ins-val"><input class="analisis-input analisis-seg-normal" data-seg="'+s.key+'" type="number" min="0" step="10" value="'+costeNormal+'" style="width:70px;font-size:.72rem;text-align:right"></span>';
    h+='<span class="analisis-ins-val" style="color:'+(diff>0?'var(--c-red)':'var(--c-green)')+'">'+((diff>0?'+':'')+fcPlain(diff))+'</span>';
    h+='</div>';
  });
  var totalDiff=totalVinc-totalNormal;
  h+='<div class="analisis-ins-row analisis-ins-total">';
  h+='<span class="analisis-ins-label"><b>Total anual</b></span>';
  h+='<span class="analisis-ins-val" style="color:var(--c-orange)"><b>'+fcPlain(totalVinc)+'</b></span>';
  h+='<span class="analisis-ins-val"><b>'+fcPlain(totalNormal)+'</b></span>';
  h+='<span class="analisis-ins-val" style="color:'+(totalDiff>0?'var(--c-red)':'var(--c-green)')+'"><b>'+((totalDiff>0?'+':'')+fcPlain(totalDiff))+'</b></span>';
  h+='</div>';
  h+='</div>';

  /* Resumen */
  if(totalDiff>0){
    h+='<div style="margin-top:8px;padding:8px 10px;background:var(--surface2);border-radius:var(--radius-sm);border:1px solid var(--border);font-size:.72rem">';
    h+='Sobrecoste anual por seguros vinculados: <b style="color:var(--c-red)">+'+fcPlain(totalDiff)+'</b> ('+fcPlain(Math.round(totalDiff/12*100)/100)+'/mes)';
    /* Check if vinculaciones reduction compensates */
    var vincReduccion=0;
    _segKeys.forEach(function(s){if(vinc[s.key]&&vinc[s.key].enabled)vincReduccion+=vinc[s.key].reduccion||0;});
    if(vincReduccion>0&&comp.importePrestamo>0&&comp.tipoInteres>0&&comp.plazoAnios>0){
      /* Calculate interest savings from reduction */
      var r1=comp.tipoInteres/100/12;
      var n=comp.plazoAnios*12;
      var cuota1=comp.importePrestamo*r1*Math.pow(1+r1,n)/(Math.pow(1+r1,n)-1);
      var tipoEf=Math.max(0,comp.tipoInteres-vincReduccion);
      var r2=tipoEf/100/12;
      var cuota2=r2>0?comp.importePrestamo*r2*Math.pow(1+r2,n)/(Math.pow(1+r2,n)-1):comp.importePrestamo/n;
      var ahorroAnual=Math.round((cuota1-cuota2)*12*100)/100;
      var balanceNeto=Math.round((ahorroAnual-totalDiff)*100)/100;
      h+='<br>Ahorro anual por reducci\u00f3n tipo (\u2212'+vincReduccion.toFixed(2)+'%): <b style="color:var(--c-green)">'+fcPlain(ahorroAnual)+'</b>';
      h+='<br><span style="font-size:.78rem">Balance neto: <b style="color:'+(balanceNeto>=0?'var(--c-green)':'var(--c-red)')+'">'+((balanceNeto>=0?'+':'')+fcPlain(balanceNeto))+'</b>/a\u00f1o</span>';
      if(balanceNeto>=0){
        h+='<br><span style="color:var(--c-green)">Las vinculaciones te compensan \u2714</span>';
      } else {
        h+='<br><span style="color:var(--c-red)">Las vinculaciones te cuestan '+fcPlain(-balanceNeto)+'/a\u00f1o extra</span>';
      }
    }
    h+='</div>';
  } else if(totalNormal>0){
    h+='<div style="margin-top:8px;font-size:.72rem;color:var(--c-green)">Los seguros vinculados son m\u00e1s baratos o iguales que los normales \u2714</div>';
  }
  h+='</div>';
  return h;
}

function _mortgageComparisonChart(cuota1,cuota2,nMeses,switchCost,rate1,rate2){
  var W=320,H=120,PB=18,PT=16,PL=42,PR=8;
  var W2=W-PL-PR,H2=H-PT;
  var years=Math.ceil(nMeses/12);
  var points=Math.min(years,40);
  var cum1=[],cum2=[];
  var c1=0,c2=switchCost;
  for(var y=0;y<=points;y++){
    cum1.push(Math.round(c1));
    cum2.push(Math.round(c2));
    c1+=cuota1*12;c2+=cuota2*12;
  }
  var maxV=Math.max(cum1[points],cum2[points])||1;
  function xPos(i){return Math.round(PL+(i/points)*W2);}
  function yPos(v){return Math.round(PT+H2-v/maxV*H2);}

  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin-top:10px">';
  /* Grid */
  var step=50000;
  while(maxV/step>5)step*=2;
  while(maxV/step<2&&step>10000)step=Math.round(step/2);
  for(var gv=0;gv<=maxV;gv+=step){
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=gv>=1000000?(gv/1000000).toFixed(1)+'M':gv>=1000?Math.round(gv/1000)+'k':'0';
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  /* Line 1: current */
  var pts1=cum1.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+pts1+'" fill="none" stroke="#fb923c" stroke-width="2" stroke-linejoin="round"/>';
  /* Line 2: alternative */
  var pts2=cum2.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+pts2+'" fill="none" stroke="#34d399" stroke-width="2" stroke-linejoin="round"/>';
  /* X labels (every 5 years) */
  for(var xi=0;xi<=points;xi+=Math.max(1,Math.round(points/6))){
    svg+='<text x="'+xPos(xi)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+xi+'a</text>';
  }
  /* Legend */
  svg+='<rect x="'+PL+'" y="3" width="10" height="3" rx="1.5" fill="#fb923c"/>';
  svg+='<text x="'+(PL+12)+'" y="7" font-size="6" fill="#fb923c">'+rate1.toFixed(2)+'%</text>';
  svg+='<rect x="'+(PL+55)+'" y="3" width="10" height="3" rx="1.5" fill="#34d399"/>';
  svg+='<text x="'+(PL+67)+'" y="7" font-size="6" fill="#34d399">'+rate2.toFixed(2)+'%</text>';
  svg+='</svg>';
  return '<div class="analisis-mortgage-chart">'+svg+'</div>';
}

/* ── Diff chart: evolution of A-B including insurance ────── */
function _mortgageDiffChart(cuotaA,cuotaB,segAnualA,segAnualB,mesesPre,mesesPost,switchCost){
  /* X-axis starts at subrogation moment (year 0 = switch), NOT loan start */
  var years=Math.ceil(mesesPost/12);
  var points=Math.min(years,40);
  var diffs=[];var cum=-switchCost; /* Start negative (switch cost) */
  diffs.push(Math.round(cum));
  var savingsPerMonth=(cuotaA+segAnualA/12)-(cuotaB+segAnualB/12);
  var breakEvenYear=-1;
  for(var y=1;y<=points;y++){
    cum+=savingsPerMonth*12;
    diffs.push(Math.round(cum));
    if(breakEvenYear<0&&cum>=0)breakEvenYear=y;
  }
  var W=320,H=130,PB=18,PT=16,PL=42,PR=8;
  var W2=W-PL-PR,H2=H-PT;
  var minV=diffs[0],maxV=diffs[0];
  diffs.forEach(function(v){if(v<minV)minV=v;if(v>maxV)maxV=v;});
  var range=Math.max(Math.abs(minV),Math.abs(maxV))||1;
  minV=Math.min(minV,-range*0.1);maxV=Math.max(maxV,range*0.1);
  var spanV=maxV-minV||1;
  function xPos(i){return Math.round(PL+(i/points)*W2);}
  function yPos(v){return Math.round(PT+H2-(v-minV)/spanV*H2);}
  var y0=yPos(0);
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;margin-top:10px">';
  /* Zero line */
  svg+='<line x1="'+PL+'" y1="'+y0+'" x2="'+(W-PR)+'" y2="'+y0+'" stroke="#5a5a70" stroke-width="1" stroke-dasharray="4,3"/>';
  /* Grid */
  var step=5000;while(spanV/step>6)step*=2;while(spanV/step<2&&step>1000)step=Math.round(step/2);
  for(var gv=Math.ceil(minV/step)*step;gv<=maxV;gv+=step){
    if(gv===0)continue;
    var gy=yPos(gv);
    svg+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#2a2a3e" stroke-width="1"/>';
    var lbl=Math.abs(gv)>=1000?(gv/1000).toFixed(0)+'k':gv;
    svg+='<text x="'+(PL-2)+'" y="'+(gy+3)+'" text-anchor="end" font-size="6" fill="#5a5a70">'+lbl+'</text>';
  }
  /* Fill areas: green above 0, red below 0 */
  var posPath='',negPath='';
  for(var i=0;i<=points;i++){
    var x=xPos(i),yv=yPos(diffs[i]);
    if(diffs[i]>=0){
      if(!posPath)posPath='M'+x+','+y0;
      posPath+=' L'+x+','+yv;
    } else {
      if(posPath){posPath+=' L'+x+','+y0+' Z';svg+='<path d="'+posPath+'" fill="rgba(52,211,153,.15)"/>';posPath='';}
      if(!negPath)negPath='M'+x+','+y0;
      negPath+=' L'+x+','+yv;
    }
    if(diffs[i]>=0&&negPath){negPath+=' L'+x+','+y0+' Z';svg+='<path d="'+negPath+'" fill="rgba(239,68,68,.15)"/>';negPath='';}
  }
  if(posPath){posPath+=' L'+xPos(points)+','+y0+' Z';svg+='<path d="'+posPath+'" fill="rgba(52,211,153,.15)"/>';}
  if(negPath){negPath+=' L'+xPos(points)+','+y0+' Z';svg+='<path d="'+negPath+'" fill="rgba(239,68,68,.15)"/>';}
  /* Line */
  var pts=diffs.map(function(v,i){return xPos(i)+','+yPos(v);}).join(' ');
  svg+='<polyline points="'+pts+'" fill="none" stroke="#6c8cff" stroke-width="2" stroke-linejoin="round"/>';
  /* Break-even marker */
  if(breakEvenYear>0&&breakEvenYear<=points){
    var bx=xPos(breakEvenYear);
    svg+='<line x1="'+bx+'" y1="'+PT+'" x2="'+bx+'" y2="'+yPos(0)+'" stroke="#34d399" stroke-width="1" stroke-dasharray="3,2"/>';
    svg+='<text x="'+bx+'" y="'+(PT-1)+'" text-anchor="middle" font-size="5" fill="#34d399">Break-even '+breakEvenYear+'a</text>';
  }
  /* X labels (relative to switch: "0a" = moment of change) */
  for(var xi=0;xi<=points;xi+=Math.max(1,Math.round(points/6))){
    svg+='<text x="'+xPos(xi)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="6" fill="#5a5a70">'+xi+'a</text>';
  }
  /* Legend */
  svg+='<text x="'+PL+'" y="7" font-size="6" fill="#5a5a70">Desde el cambio: \u25B2verde=compensa \u25BCrojo=no</text>';
  svg+='</svg>';
  return '<div class="analisis-mortgage-chart">'+svg+'</div>';
}

function bindEconAnalisisEvents(){
  /* Sub-tab clicks */
  var subG=document.getElementById('analisisSubGastos');
  var subH=document.getElementById('analisisSubHipoteca');
  if(subG)subG.addEventListener('click',function(){ANALISIS_SUB='gastos';reRenderEcon();});
  if(subH)subH.addEventListener('click',function(){ANALISIS_SUB='hipoteca';reRenderEcon();});
  if(ANALISIS_SUB==='gastos'){
    function _reRenderKeepScroll(){var sb=document.querySelector('#econOverlay .sy-body');var st=sb?sb.scrollTop:0;reRenderEcon();var sb2=document.querySelector('#econOverlay .sy-body');if(sb2)sb2.scrollTop=st;}
    /* Filter text — only on button click, not on every keystroke */
    var filterInput=document.getElementById('analisisFilterText');
    var filterBtn=document.getElementById('analisisFilterBtn');
    if(filterBtn&&filterInput)filterBtn.addEventListener('click',function(){ANALISIS_FILTER_TEXT=filterInput.value;_reRenderKeepScroll();});
    if(filterInput)filterInput.addEventListener('keydown',function(e){if(e.key==='Enter'){ANALISIS_FILTER_TEXT=this.value;_reRenderKeepScroll();}});
    /* Filter category buttons */
    document.querySelectorAll('[data-afc]').forEach(function(btn){
      btn.addEventListener('click',function(){ANALISIS_FILTER_CAT=btn.dataset.afc;_reRenderKeepScroll();});
    });
    /* Sort header click */
    document.querySelectorAll('[data-asort]').forEach(function(btn){
      btn.addEventListener('click',function(){ANALISIS_SORT=ANALISIS_SORT==='desc'?'asc':ANALISIS_SORT==='asc'?'cat':'desc';_reRenderKeepScroll();});
    });
    /* Category bars: month/year toggle */
    document.querySelectorAll('[data-acm]').forEach(function(btn){
      btn.addEventListener('click',function(){ANALISIS_CAT_MODE=btn.dataset.acm;_reRenderKeepScroll();});
    });
  }
}
