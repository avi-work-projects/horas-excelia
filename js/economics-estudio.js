/* ============================================================
   ECONOMICS — Estudio Cambio
   ============================================================ */

/* ── Estudio Cambio (sub-tabs) ─────────────────────────────── */
function renderEconEstudio(){
  var h='<div class="est-nav">';
  /* Group 1: Autónomo */
  h+='<div class="est-group">';
  h+='<div class="est-group-label">Aut\u00f3nomo</div>';
  h+='<button class="est-btn'+(ECON_ESTUDIO_SUB==='comparador'?' active':'')+'" id="ecSubComp">Comparar Escenarios</button>';
  h+='<button class="est-btn'+(ECON_ESTUDIO_SUB==='simulador'?' active':'')+'" id="ecSubSim">Calcular Tarifa</button>';
  h+='</div>';
  /* Group 2: Casa */
  h+='<div class="est-group est-group-casa">';
  h+='<div class="est-group-label">Casa</div>';
  h+='<button class="est-btn est-casa'+(ECON_ESTUDIO_SUB==='hipoteca'?' active':'')+'" id="ecSubHip">Comparar Hipotecas</button>';
  h+='<button class="est-btn est-casa'+(ECON_ESTUDIO_SUB==='gas'?' active':'')+'" id="ecSubGas">Comparar Gas</button>';
  h+='<button class="est-btn est-casa'+(ECON_ESTUDIO_SUB==='elect'?' active':'')+'" id="ecSubElect">Comparar Electricidad</button>';
  h+='</div>';
  h+='</div>';
  if(ECON_ESTUDIO_SUB==='comparador'){h+=typeof renderEconComp==='function'?renderEconComp():'';}
  else if(ECON_ESTUDIO_SUB==='simulador'){h+=typeof renderEconSim==='function'?renderEconSim():'';}
  else if(ECON_ESTUDIO_SUB==='hipoteca'){h+=_renderEstudioHipotecaComp();}
  else if(ECON_ESTUDIO_SUB==='gas'){h+=_renderEstudioGasComp();}
  else if(ECON_ESTUDIO_SUB==='elect'){h+=_renderEstudioElectComp();}
  return h;
}

/* ── Estudio Cambio: Comparar Hipotecas ──────────────────── */
var ESTUDIO_HIP_ALT={importe:0,tipo:0,plazo:0,costeCambio:0,vincCoste:0,vincReduc:0};
var ESTUDIO_HIP_CALC=false;

function _renderEstudioHipotecaComp(){
  var h='';
  var comp=DESPACHO&&DESPACHO.compra?DESPACHO.compra:null;
  if(!comp||!comp.importePrestamo||!comp.tipoInteres||!comp.plazoAnios){
    h+='<div class="sy-section" style="text-align:center;padding:30px 20px;color:var(--text-dim)">';
    h+='<div style="font-size:.75rem">Configura los datos de hipoteca en <b>\u2699 Configuraci\u00f3n Fiscal \u2192 Hipoteca</b> para comparar.</div>';
    h+='</div>';
    return h;
  }
  /* Current mortgage summary */
  var act=typeof _getActiveMortgage==='function'?_getActiveMortgage(comp):{importe:comp.importePrestamo,tipo:comp.tipoInteres,plazo:comp.plazoAnios,vinc:comp.vinculaciones};
  var tipoEfAct=typeof _hipEffRate==='function'?_hipEffRate(act.tipo,act.vinc):act.tipo;
  var rAct=tipoEfAct/100/12,nAct=act.plazo*12;
  var cuotaAct=rAct>0?act.importe*rAct*Math.pow(1+rAct,nAct)/(Math.pow(1+rAct,nAct)-1):act.importe/nAct;

  /* Include insurance costs from vinculaciones */
  var vincAnual=0;
  if(act.vinc){['segHogar','segSalud','segVida'].forEach(function(k){if(act.vinc[k]&&act.vinc[k].enabled)vincAnual+=act.vinc[k].costeAnual||0;});}
  var cuotaActConSeg=Math.round((cuotaAct+vincAnual/12)*100)/100;

  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tu hipoteca actual (tipo bonificado + seguros)</div>';
  h+='<div class="analisis-mortgage-current">';
  h+='<div style="font-size:.72rem;color:var(--text-dim)">'+escHtml(act.banco||'')+' \u00b7 '+tipoEfAct.toFixed(2)+'% (bonificado) \u00b7 '+act.plazo+'a \u00b7 '+_fmtMiles(act.importe)+'\u20ac</div>';
  h+='<div style="font-family:var(--mono);font-size:1rem;font-weight:700;margin-top:4px">'+fcPlain(Math.round(cuotaAct*100)/100)+'<span style="font-size:.68rem;color:var(--text-dim)">/mes</span>';
  if(vincAnual>0)h+='<span style="font-size:.62rem;color:var(--c-orange);margin-left:6px">+ '+fcPlain(Math.round(vincAnual/12*100)/100)+' seguros = '+fcPlain(cuotaActConSeg)+'/mes</span>';
  h+='</div>';
  h+='</div></div>';

  /* Alternative mortgage inputs */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Hipoteca alternativa</div>';
  if(!ESTUDIO_HIP_ALT.importe)ESTUDIO_HIP_ALT.importe=act.importe;
  if(!ESTUDIO_HIP_ALT.plazo)ESTUDIO_HIP_ALT.plazo=act.plazo;
  h+='<div class="analisis-mortgage-alt">';
  h+='<div class="analisis-mortgage-inputs" style="flex-wrap:wrap">';
  h+='<div class="analisis-input-group"><label>Capital \u20ac</label><input class="analisis-input" id="estHipImporte" type="number" min="0" step="1000" value="'+ESTUDIO_HIP_ALT.importe+'"></div>';
  h+='<div class="analisis-input-group"><label>Tipo inter\u00e9s %</label><input class="analisis-input" id="estHipTipo" type="number" min="0" step="0.1" value="'+ESTUDIO_HIP_ALT.tipo+'"></div>';
  h+='<div class="analisis-input-group"><label>Plazo (a\u00f1os)</label><input class="analisis-input" id="estHipPlazo" type="number" min="1" step="1" value="'+ESTUDIO_HIP_ALT.plazo+'"></div>';
  h+='<div class="analisis-input-group"><label>Coste cambio \u20ac</label><input class="analisis-input" id="estHipCoste" type="number" min="0" step="100" value="'+ESTUDIO_HIP_ALT.costeCambio+'"></div>';
  h+='<div class="analisis-input-group"><label>Vinc. coste/a\u00f1o \u20ac</label><input class="analisis-input" id="estHipVincCoste" type="number" min="0" step="50" value="'+ESTUDIO_HIP_ALT.vincCoste+'"></div>';
  h+='<div class="analisis-input-group"><label>Vinc. reducci\u00f3n %</label><input class="analisis-input" id="estHipVincReduc" type="number" min="0" step="0.05" value="'+ESTUDIO_HIP_ALT.vincReduc+'"></div>';
  h+='</div>';
  h+='<button class="econ-calc-btn" id="estHipCalc" style="margin-top:6px">Comparar</button>';
  h+='</div>';

  if(ESTUDIO_HIP_CALC&&ESTUDIO_HIP_ALT.tipo>0){
    var tipoEfAlt=Math.max(0,ESTUDIO_HIP_ALT.tipo-ESTUDIO_HIP_ALT.vincReduc);
    var rAlt=tipoEfAlt/100/12,nAlt=ESTUDIO_HIP_ALT.plazo*12;
    var cuotaAlt=rAlt>0?ESTUDIO_HIP_ALT.importe*rAlt*Math.pow(1+rAlt,nAlt)/(Math.pow(1+rAlt,nAlt)-1):ESTUDIO_HIP_ALT.importe/nAlt;
    var totalAct2=cuotaAct*nAct;
    var totalAlt=cuotaAlt*nAlt+ESTUDIO_HIP_ALT.costeCambio;
    var ahorro=Math.round(totalAct2-totalAlt);
    var ahorroMes=Math.round((cuotaAct-cuotaAlt)*100)/100;

    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Resultado</div>';
    h+='<div class="ah-vs">';
    h+='<div class="ah-vs-card"><div class="ah-vs-card-title">Actual ('+tipoEfAct.toFixed(2)+'%)</div><div class="ah-vs-card-val">'+fcPlain(Math.round(cuotaAct*100)/100)+'<span style="font-size:.6rem;color:var(--text-dim)">/mes</span></div></div>';
    h+='<div class="ah-vs-card"><div class="ah-vs-card-title">Alternativa ('+tipoEfAlt.toFixed(2)+'%)</div><div class="ah-vs-card-val">'+fcPlain(Math.round(cuotaAlt*100)/100)+'<span style="font-size:.6rem;color:var(--text-dim)">/mes</span></div></div>';
    h+='</div>';
    h+='<div class="analisis-mortgage-ahorro '+(ahorro>=0?'pos':'neg')+'" style="margin-top:8px">';
    h+=(ahorro>=0?'Ahorras: <b>'+fcPlain(ahorro)+'</b>':'Pagas m\u00e1s: <b>'+fcPlain(-ahorro)+'</b>');
    h+=' ('+fcPlain(Math.abs(ahorroMes))+'/mes)';
    h+='</div>';
    if(ESTUDIO_HIP_ALT.costeCambio>0&&ahorroMes>0){
      var be=Math.ceil(ESTUDIO_HIP_ALT.costeCambio/ahorroMes);
      h+='<div style="font-size:.72rem;color:var(--text-dim);margin-top:4px">Break-even en <b>'+be+' meses</b> ('+Math.round(be/12*10)/10+' a\u00f1os)</div>';
    }
    h+=_mortgageComparisonChart(cuotaAct,cuotaAlt,Math.max(nAct,nAlt),ESTUDIO_HIP_ALT.costeCambio,tipoEfAct,tipoEfAlt);
    h+='</div>';
  }
  h+='</div>';
  return h;
}

function bindEconEstudioEvents(){
  var _reRender=document.getElementById('estudioOverlay')&&document.getElementById('estudioOverlay').classList.contains('open')?reRenderEstudio:reRenderEcon;
  var _estTabs={ecSubComp:'comparador',ecSubSim:'simulador',ecSubHip:'hipoteca',ecSubGas:'gas',ecSubElect:'elect'};
  Object.keys(_estTabs).forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('click',function(){ECON_ESTUDIO_SUB=_estTabs[id];_reRender();});
  });
  if(ECON_ESTUDIO_SUB==='comparador'&&typeof bindEconCompEvents==='function')bindEconCompEvents();
  else if(ECON_ESTUDIO_SUB==='simulador'&&typeof bindEconSimEvents==='function')bindEconSimEvents();
  else if(ECON_ESTUDIO_SUB==='hipoteca')_bindEstudioHipoteca();
  else if(ECON_ESTUDIO_SUB==='gas')_bindEstudioGas();
  else if(ECON_ESTUDIO_SUB==='elect')_bindEstudioElect();
}
function _estudioReRender(){
  var ov=document.getElementById('estudioOverlay');
  if(ov&&ov.style.display==='flex')reRenderEstudio();else reRenderEcon();
}
function _bindEstudioHipoteca(){
  var calcBtn=document.getElementById('estHipCalc');
  if(calcBtn)calcBtn.addEventListener('click',function(){
    ESTUDIO_HIP_ALT.importe=parseFloat(document.getElementById('estHipImporte').value)||0;
    ESTUDIO_HIP_ALT.tipo=parseFloat(document.getElementById('estHipTipo').value)||0;
    ESTUDIO_HIP_ALT.plazo=parseFloat(document.getElementById('estHipPlazo').value)||0;
    ESTUDIO_HIP_ALT.costeCambio=parseFloat(document.getElementById('estHipCoste').value)||0;
    ESTUDIO_HIP_ALT.vincCoste=parseFloat(document.getElementById('estHipVincCoste').value)||0;
    ESTUDIO_HIP_ALT.vincReduc=parseFloat(document.getElementById('estHipVincReduc').value)||0;
    ESTUDIO_HIP_CALC=true;
    _estudioReRender();
  });
}

/* ── Estudio: Comparar Gas ────────────────────────────────── */
var ESTUDIO_GAS={consumoKwh:0,dias:30};
function _renderEstudioGasComp(){
  if(typeof loadDespacho==='function')loadDespacho();
  var g=DESPACHO&&DESPACHO.gas?DESPACHO.gas:{modo:'consumo',precioKwh:0,cuotaFija:0,terminoFijo:0};
  var comps=DESPACHO&&DESPACHO.gasComparaciones?DESPACHO.gasComparaciones:[];
  var h='';
  /* Current tariff */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">\uD83D\uDD25 Tu tarifa actual</div>';
  if(g.modo==='fijo')h+='<div style="font-size:.72rem;color:var(--text-dim)">Cuota fija: <b>'+fcPlain(g.cuotaFija)+'/mes</b> + T\u00e9rmino fijo: '+fcPlain(g.terminoFijo)+'/mes</div>';
  else h+='<div style="font-size:.72rem;color:var(--text-dim)">Precio: <b>'+(g.precioKwh||0).toFixed(4)+' \u20ac/kWh</b> + T\u00e9rmino fijo: '+fcPlain(g.terminoFijo)+'/mes</div>';
  h+='</div>';
  /* Consumption input */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Consumo a comparar</div>';
  h+='<div class="analisis-mortgage-inputs">';
  h+='<div class="analisis-input-group"><label>Consumo (kWh)</label><input class="analisis-input" id="estGasKwh" type="number" min="0" step="10" value="'+ESTUDIO_GAS.consumoKwh+'"></div>';
  h+='<div class="analisis-input-group"><label>D\u00edas</label><input class="analisis-input" id="estGasDias" type="number" min="1" step="1" value="'+ESTUDIO_GAS.dias+'"></div>';
  h+='</div></div>';
  /* Comparisons table */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tarifas a comparar (max 5)</div>';
  h+=_renderSupplyCompTable(comps,g,ESTUDIO_GAS,'gas');
  if(comps.length<5)h+='<button class="hip-add-sub-btn" id="estGasAdd">+ A\u00f1adir tarifa</button>';
  h+='</div>';
  return h;
}

/* ── Estudio: Comparar Electricidad ──────────────────────── */
var ESTUDIO_ELECT={consumoKwh:0,dias:30};
function _renderEstudioElectComp(){
  if(typeof loadDespacho==='function')loadDespacho();
  var e=DESPACHO&&DESPACHO.elect?DESPACHO.elect:{precioKwh:0,terminoFijo:0,potenciaTotal:3.3};
  var comps=DESPACHO&&DESPACHO.electComparaciones?DESPACHO.electComparaciones:[];
  var h='';
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">\u26A1 Tu tarifa actual</div>';
  var potTxt,potPrecioTxt;
  if(e.modoPotencia==='doble'){
    potTxt='P1:'+e.potenciaP1+'kW + P2:'+e.potenciaP2+'kW';
    potPrecioTxt='P1:'+(e.precioPotP1||0).toFixed(6)+' + P2:'+(e.precioPotP2||0).toFixed(6)+' = '+((e.precioPotP1||0)+(e.precioPotP2||0)).toFixed(6)+' \u20ac/kW/d\u00eda';
  } else {
    potTxt=e.potenciaTotal+' kW';
    potPrecioTxt=(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d\u00eda';
  }
  h+='<div style="font-size:.72rem;color:var(--text-dim)">Potencia: <b>'+potTxt+'</b> \u00b7 Precio pot.: <b>'+potPrecioTxt+'</b></div>';
  h+='<div style="font-size:.72rem;color:var(--text-dim)">Energ\u00eda: <b>'+(e.precioKwh||0).toFixed(4)+' \u20ac/kWh</b>'+(e.terminoFijo?' + T. fijo: '+fcPlain(e.terminoFijo)+'/mes':'')+'</div>';
  h+='</div>';
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Consumo a comparar</div>';
  h+='<div class="analisis-mortgage-inputs">';
  h+='<div class="analisis-input-group"><label>Consumo (kWh)</label><input class="analisis-input" id="estElectKwh" type="number" min="0" step="10" value="'+ESTUDIO_ELECT.consumoKwh+'"></div>';
  h+='<div class="analisis-input-group"><label>D\u00edas</label><input class="analisis-input" id="estElectDias" type="number" min="1" step="1" value="'+ESTUDIO_ELECT.dias+'"></div>';
  h+='</div></div>';
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tarifas a comparar (max 5)</div>';
  h+=_renderSupplyCompTable(comps,e,ESTUDIO_ELECT,'elect');
  if(comps.length<5)h+='<button class="hip-add-sub-btn" id="estElectAdd">+ A\u00f1adir tarifa</button>';
  h+='</div>';
  return h;
}

/* Shared supply comparison table */
function _renderSupplyCompTable(comps,current,consumo,tipo){
  var kwh=consumo.consumoKwh||0,dias=consumo.dias||30;
  /* Current cost */
  var costActual=0;
  if(tipo==='gas'){
    if(current.modo==='fijo')costActual=current.cuotaFija*(dias/30);
    else costActual=kwh*(current.precioKwh||0);
    costActual+=(current.terminoFijo||0)*(dias/30);
  } else {
    /* Electricidad: energía + potencia por kW/día + término fijo */
    var potCostAct=0;
    if(current.modoPotencia==='doble'){
      potCostAct=((current.precioPotP1||0)*(current.potenciaP1||0)+(current.precioPotP2||0)*(current.potenciaP2||0))*dias;
    } else {
      potCostAct=(current.precioPotP1||0)*(current.potenciaTotal||0)*dias;
    }
    costActual=kwh*(current.precioKwh||0)+potCostAct+(current.terminoFijo||0)*(dias/30);
  }
  var h='<div class="mg-budget-table" style="margin-top:6px">';
  h+='<div class="mg-budget-hdr" style="grid-template-columns:1fr 70px 60px 60px"><span>Tarifa</span><span>Coste</span><span>/d\u00eda</span><span>Dif.</span></div>';
  /* Current row */
  h+='<div class="mg-budget-row" style="grid-template-columns:1fr 70px 60px 60px;background:var(--surface2)">';
  h+='<span class="mg-budget-lbl"><span class="mg-cat-dot" style="background:var(--c-green)"></span>Actual</span>';
  h+='<span class="mg-budget-val">'+fcPlain(Math.round(costActual*100)/100)+'</span>';
  h+='<span class="mg-budget-val">'+fcPlain(Math.round(costActual/dias*100)/100)+'</span>';
  h+='<span class="mg-budget-val">\u2014</span></div>';
  /* Comparison rows */
  comps.forEach(function(c,i){
    var costAlt=0;
    if(tipo==='gas'){
      if(c.modo==='fijo')costAlt=(c.cuotaFija||0)*(dias/30);
      else costAlt=kwh*(c.precioKwh||0);
      costAlt+=(c.terminoFijo||0)*(dias/30);
    } else {
      /* Electricidad: energía + potencia por kW/día + término fijo */
      var potKw=current.potenciaTotal||0;
      costAlt=kwh*(c.precioKwh||0)+(c.precioPot||0)*potKw*dias+(c.terminoFijo||0)*(dias/30);
    }
    var diff=Math.round((costAlt-costActual)*100)/100;
    h+='<div class="mg-budget-row" style="grid-template-columns:1fr 70px 60px 60px">';
    h+='<span class="mg-budget-lbl"><input class="analisis-input est-comp-name" data-tipo="'+tipo+'" data-idx="'+i+'" type="text" value="'+escHtml(c.nombre||'')+'" placeholder="Tarifa '+(i+1)+'" style="font-size:.68rem;padding:2px 4px;width:100%"></span>';
    h+='<span class="mg-budget-val">'+fcPlain(Math.round(costAlt*100)/100)+'</span>';
    h+='<span class="mg-budget-val">'+fcPlain(Math.round(costAlt/dias*100)/100)+'</span>';
    h+='<span class="mg-budget-val" style="color:'+(diff<=0?'var(--c-green)':'var(--c-red)')+'">'+(diff<=0?'':'+')+ fcPlain(diff)+'</span></div>';
    /* Editable fields for this comparison */
    if(tipo==='elect'){
      h+='<div class="mg-budget-row" style="grid-template-columns:1fr 1fr 1fr 30px;border-top:none;padding:2px 8px">';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-precio" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="0.0001" value="'+(c.precioKwh||0)+'" style="font-size:.66rem;padding:2px 4px;width:55px"> \u20ac/kWh</span>';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-pot" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="0.000001" value="'+(c.precioPot||0)+'" style="font-size:.66rem;padding:2px 4px;width:55px"> \u20ac/kW/d</span>';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-tfijo" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="1" value="'+(c.terminoFijo||0)+'" style="font-size:.66rem;padding:2px 4px;width:45px"> \u20ac/m</span>';
      h+='<button class="est-comp-del" data-tipo="'+tipo+'" data-idx="'+i+'" style="background:none;border:none;color:var(--c-red);font-size:.78rem;cursor:pointer">\u2715</button></div>';
    } else {
      h+='<div class="mg-budget-row" style="grid-template-columns:1fr 1fr 30px;border-top:none;padding:2px 8px">';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-precio" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="0.0001" value="'+(c.precioKwh||0)+'" style="font-size:.66rem;padding:2px 4px;width:70px"> \u20ac/kWh</span>';
      h+='<span style="font-size:.62rem;color:var(--text-dim)"><input class="analisis-input est-comp-tfijo" data-tipo="'+tipo+'" data-idx="'+i+'" type="number" min="0" step="1" value="'+(c.terminoFijo||0)+'" style="font-size:.66rem;padding:2px 4px;width:55px"> \u20ac/mes</span>';
      h+='<button class="est-comp-del" data-tipo="'+tipo+'" data-idx="'+i+'" style="background:none;border:none;color:var(--c-red);font-size:.78rem;cursor:pointer">\u2715</button></div>';
    }
  });
  h+='</div>';
  return h;
}

function _bindEstudioGas(){
  var kwhEl=document.getElementById('estGasKwh');
  var diasEl=document.getElementById('estGasDias');
  if(kwhEl)kwhEl.addEventListener('change',function(){ESTUDIO_GAS.consumoKwh=parseFloat(this.value)||0;_estudioReRender();});
  if(diasEl)diasEl.addEventListener('change',function(){ESTUDIO_GAS.dias=parseInt(this.value)||30;_estudioReRender();});
  var addBtn=document.getElementById('estGasAdd');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(!DESPACHO.gasComparaciones)DESPACHO.gasComparaciones=[];
    if(DESPACHO.gasComparaciones.length>=5)return;
    DESPACHO.gasComparaciones.push({nombre:'',precioKwh:0,terminoFijo:0,modo:'consumo',cuotaFija:0});
    saveDespacho();_estudioReRender();
  });
  _bindCompInputs('gas','gasComparaciones');
}
function _bindEstudioElect(){
  var kwhEl=document.getElementById('estElectKwh');
  var diasEl=document.getElementById('estElectDias');
  if(kwhEl)kwhEl.addEventListener('change',function(){ESTUDIO_ELECT.consumoKwh=parseFloat(this.value)||0;_estudioReRender();});
  if(diasEl)diasEl.addEventListener('change',function(){ESTUDIO_ELECT.dias=parseInt(this.value)||30;_estudioReRender();});
  var addBtn=document.getElementById('estElectAdd');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(!DESPACHO.electComparaciones)DESPACHO.electComparaciones=[];
    if(DESPACHO.electComparaciones.length>=5)return;
    DESPACHO.electComparaciones.push({nombre:'',precioKwh:0,precioPot:0,terminoFijo:0});
    saveDespacho();_estudioReRender();
  });
  _bindCompInputs('elect','electComparaciones');
}
function _bindCompInputs(tipo,despKey){
  document.querySelectorAll('.est-comp-name[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].nombre=el.value;saveDespacho();});
  });
  document.querySelectorAll('.est-comp-precio[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].precioKwh=parseFloat(el.value)||0;saveDespacho();_estudioReRender();});
  });
  document.querySelectorAll('.est-comp-pot[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].precioPot=parseFloat(el.value)||0;saveDespacho();_estudioReRender();});
  });
  document.querySelectorAll('.est-comp-tfijo[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){DESPACHO[despKey][parseInt(el.dataset.idx)].terminoFijo=parseFloat(el.value)||0;saveDespacho();_estudioReRender();});
  });
  document.querySelectorAll('.est-comp-del[data-tipo="'+tipo+'"]').forEach(function(btn){
    btn.addEventListener('click',function(){DESPACHO[despKey].splice(parseInt(btn.dataset.idx),1);saveDespacho();_estudioReRender();});
  });
}

function renderEstudioContent(){
  ECON_YEAR=ESTUDIO_YEAR; // sync for sub-functions that use ECON_YEAR
  if(typeof loadEconYear==='function')loadEconYear(ECON_YEAR);
  var h=renderNavBar('estudio');
  h+='<div class="sy-header with-tabs">';
  h+='<button class="sy-back" id="estBack">&#8592;</button>';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="estPrev">&#9664;</button><div class="sy-year">'+ESTUDIO_YEAR+'</div><button class="sy-nav" id="estNext">&#9654;</button></div>';
  h+='<button class="econ-gear-btn" id="estGearFiscal">&#9965;</button>';
  h+='</div>';
  h+='<div class="sy-body">';
  h+=renderEconEstudio();
  h+='</div>';
  return h;
}
function openEstudio(){
  NAV_BACK=null;
  ESTUDIO_YEAR=CY;
  if(typeof loadDespacho==='function')loadDespacho();
  if(typeof loadEconComp==='function')loadEconComp();
  var ov=document.getElementById('estudioOverlay');
  document.getElementById('estudioContent').innerHTML=renderEstudioContent();
  ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindEstudioEvents();});});
}
function closeEstudio(){
  var ov=document.getElementById('estudioOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}
function reRenderEstudio(){
  var body=document.querySelector('#estudioOverlay .sy-body');
  var scrollTop=body?body.scrollTop:0;
  document.getElementById('estudioContent').innerHTML=renderEstudioContent();
  bindEstudioEvents();
  if(body)body.scrollTop=scrollTop;
}
function bindEstudioEvents(){
  document.getElementById('estBack').addEventListener('click',function(){
    if(NAV_BACK){var fn=NAV_BACK;NAV_BACK=null;fn();}else{closeEstudio();}
  });
  bindNavBar('estudio',closeEstudio);
  document.getElementById('estPrev').addEventListener('click',function(){ESTUDIO_YEAR--;reRenderEstudio();});
  document.getElementById('estNext').addEventListener('click',function(){ESTUDIO_YEAR++;reRenderEstudio();});
  var estGear=document.getElementById('estGearFiscal');
  if(estGear)estGear.addEventListener('click',function(){FISCAL_TAB='despacho';if(typeof openFiscal==='function')openFiscal();});
  bindEconEstudioEvents();
}
