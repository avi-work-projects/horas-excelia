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
var ESTUDIO_HIP_ALT={importe:0,tipo:0,plazo:0,costeCambio:0,banco:'',vinculaciones:{nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}}};
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
  if(!ESTUDIO_HIP_ALT.vinculaciones)ESTUDIO_HIP_ALT.vinculaciones={nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
  var av=ESTUDIO_HIP_ALT.vinculaciones;
  h+='<div class="est-tariff-card">';
  h+='<div class="hip-g2">';
  h+=_hipMoney('estHipImporte','Capital',ESTUDIO_HIP_ALT.importe);
  h+=_hipNum('estHipTipo','Tipo inter\u00e9s',ESTUDIO_HIP_ALT.tipo,'%');
  h+=_hipNum('estHipPlazo','Plazo',ESTUDIO_HIP_ALT.plazo,'a\u00f1os');
  h+=_hipMoney('estHipCoste','Coste cambio',ESTUDIO_HIP_ALT.costeCambio);
  h+=_hipText('estHipBanco','Banco',ESTUDIO_HIP_ALT.banco,'Ej: ING...');
  h+='</div>';
  /* Vinculaciones */
  h+='<div style="font-size:.7rem;color:var(--text-dim);font-weight:600;margin:8px 0 2px">Vinculaciones</div>';
  h+='<div class="hip-vr-head"><span></span><span class="hip-vr-h">\u20ac/a\u00f1o</span><span class="hip-vr-h">\u2212tipo%</span><span></span></div>';
  h+=_hipVinc('estHipVincNomina','N\u00f3mina',av.nomina);
  h+=_hipVinc('estHipVincSegHogar','Seg. hogar',av.segHogar);
  h+=_hipVinc('estHipVincSegSalud','Seg. salud',av.segSalud);
  h+=_hipVinc('estHipVincSegVida','Seg. vida',av.segVida);
  h+=_hipVincSum(av,ESTUDIO_HIP_ALT.tipo);
  h+='</div>';
  h+='<button class="econ-calc-btn" id="estHipCalc" style="margin-top:6px">Comparar</button>';

  if(ESTUDIO_HIP_CALC&&ESTUDIO_HIP_ALT.tipo>0){
    var tipoEfAlt=typeof _hipEffRate==='function'?_hipEffRate(ESTUDIO_HIP_ALT.tipo,ESTUDIO_HIP_ALT.vinculaciones):ESTUDIO_HIP_ALT.tipo;
    var rAlt=tipoEfAlt/100/12,nAlt=ESTUDIO_HIP_ALT.plazo*12;
    var cuotaAlt=rAlt>0?ESTUDIO_HIP_ALT.importe*rAlt*Math.pow(1+rAlt,nAlt)/(Math.pow(1+rAlt,nAlt)-1):ESTUDIO_HIP_ALT.importe/nAlt;
    /* Include insurance costs for alternative */
    var vincAnualAlt=0;
    if(av){['segHogar','segSalud','segVida'].forEach(function(k){if(av[k]&&av[k].enabled)vincAnualAlt+=av[k].costeAnual||0;});}
    var cuotaAltConSeg=Math.round((cuotaAlt+vincAnualAlt/12)*100)/100;

    var totalAct2=cuotaAct*nAct+vincAnual/12*nAct;
    var totalAlt=cuotaAlt*nAlt+ESTUDIO_HIP_ALT.costeCambio+vincAnualAlt/12*nAlt;
    var ahorro=Math.round(totalAct2-totalAlt);
    var ahorroMes=Math.round((cuotaActConSeg-cuotaAltConSeg)*100)/100;

    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Resultado</div>';
    h+='<div class="ah-vs">';
    h+='<div class="ah-vs-card"><div class="ah-vs-card-title">Actual ('+tipoEfAct.toFixed(2)+'%)</div><div class="ah-vs-card-val">'+fcPlain(Math.round(cuotaAct*100)/100)+'<span style="font-size:.6rem;color:var(--text-dim)">/mes</span></div>';
    if(vincAnual>0)h+='<div style="font-size:.58rem;color:var(--c-orange)">+ '+fcPlain(Math.round(vincAnual/12*100)/100)+' seg = '+fcPlain(cuotaActConSeg)+'</div>';
    h+='</div>';
    h+='<div class="ah-vs-card"><div class="ah-vs-card-title">Alternativa ('+tipoEfAlt.toFixed(2)+'%)</div><div class="ah-vs-card-val">'+fcPlain(Math.round(cuotaAlt*100)/100)+'<span style="font-size:.6rem;color:var(--text-dim)">/mes</span></div>';
    if(vincAnualAlt>0)h+='<div style="font-size:.58rem;color:var(--c-orange)">+ '+fcPlain(Math.round(vincAnualAlt/12*100)/100)+' seg = '+fcPlain(cuotaAltConSeg)+'</div>';
    h+='</div>';
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
  /* Money format for estHip fields */
  ['estHipImporte','estHipCoste'].forEach(function(id){
    var el=document.getElementById('desp-'+id);
    if(!el)return;
    var fmtEl=document.getElementById('desp-fmt-'+id);
    if(fmtEl)el.addEventListener('input',function(){var v=parseFloat(el.value)||0;fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';});
  });
  /* Vinculación toggles */
  var _vk=['nomina','segHogar','segSalud','segVida'];
  var _vi=['estHipVincNomina','estHipVincSegHogar','estHipVincSegSalud','estHipVincSegVida'];
  _vk.forEach(function(k,i){
    var tgl=document.getElementById(_vi[i]+'Toggle');
    if(tgl)tgl.addEventListener('click',function(){
      if(!ESTUDIO_HIP_ALT.vinculaciones)ESTUDIO_HIP_ALT.vinculaciones={nomina:{enabled:false,costeAnual:0,reduccion:0},segHogar:{enabled:false,costeAnual:0,reduccion:0},segSalud:{enabled:false,costeAnual:0,reduccion:0},segVida:{enabled:false,costeAnual:0,reduccion:0}};
      /* Read all current values before toggle */
      _readEstHipVinc();
      ESTUDIO_HIP_ALT.vinculaciones[k].enabled=!ESTUDIO_HIP_ALT.vinculaciones[k].enabled;
      _estudioReRender();
    });
  });
  /* Comparar button */
  var calcBtn=document.getElementById('estHipCalc');
  if(calcBtn)calcBtn.addEventListener('click',function(){
    ESTUDIO_HIP_ALT.importe=parseFloat(document.getElementById('desp-estHipImporte').value)||0;
    ESTUDIO_HIP_ALT.tipo=parseFloat(document.getElementById('desp-estHipTipo').value)||0;
    ESTUDIO_HIP_ALT.plazo=parseFloat(document.getElementById('desp-estHipPlazo').value)||0;
    ESTUDIO_HIP_ALT.costeCambio=parseFloat(document.getElementById('desp-estHipCoste').value)||0;
    ESTUDIO_HIP_ALT.banco=(document.getElementById('desp-estHipBanco').value||'').trim();
    _readEstHipVinc();
    ESTUDIO_HIP_CALC=true;
    _estudioReRender();
  });
}
function _readEstHipVinc(){
  if(!ESTUDIO_HIP_ALT.vinculaciones)return;
  var _vk=['nomina','segHogar','segSalud','segVida'];
  var _vi=['estHipVincNomina','estHipVincSegHogar','estHipVincSegSalud','estHipVincSegVida'];
  _vk.forEach(function(k,i){
    if(!ESTUDIO_HIP_ALT.vinculaciones[k])ESTUDIO_HIP_ALT.vinculaciones[k]={enabled:false,costeAnual:0,reduccion:0};
    var tgl=document.getElementById(_vi[i]+'Toggle');
    if(tgl)ESTUDIO_HIP_ALT.vinculaciones[k].enabled=tgl.classList.contains('on');
    var ce=document.getElementById(_vi[i]+'Coste');
    if(ce)ESTUDIO_HIP_ALT.vinculaciones[k].costeAnual=parseFloat(ce.value)||0;
    var re=document.getElementById(_vi[i]+'Reduccion');
    if(re)ESTUDIO_HIP_ALT.vinculaciones[k].reduccion=parseFloat(re.value)||0;
  });
}

/* ── Estudio: Comparar Gas ────────────────────────────────── */
var ESTUDIO_GAS={consumoKwh:0,dias:30};
var ESTUDIO_GAS_CALC=false;

function _calcGasCost(t,kwh,dias){
  if(t.modo==='fijo')return(t.cuotaFija||0)*(dias/30);
  return kwh*(t.precioKwh||0)+(t.terminoFijoDia||0)*dias+(t.terminoFijo||0)*(dias/30);
}
function _currentGasTariff(){
  if(typeof _ensureGasScenarios==='function')_ensureGasScenarios();
  var g=DESPACHO&&DESPACHO.gas?DESPACHO.gas:{modo:'consumo',precioKwh:0,cuotaFija:0,terminoFijo:0};
  var activo=g.activo||'consumo';
  var d=activo==='fijo'?(g.fijo||{}):(g.consumo||{});
  return{modo:activo,precioKwh:d.precioKwh||0,terminoFijoDia:d.terminoFijoDia||0,terminoFijo:d.terminoFijo||0,cuotaFija:d.cuotaFija||0,comercializadora:d.comercializadora||''};
}

function _renderEstudioGasComp(){
  if(typeof loadDespacho==='function')loadDespacho();
  var cur=_currentGasTariff();
  var comps=DESPACHO&&DESPACHO.gasComparaciones?DESPACHO.gasComparaciones:[];
  var h='';

  /* Current tariff card */
  h+='<div class="sy-section">';
  h+='<div class="est-section-hdr"><span class="sy-section-title">\uD83D\uDD25 Tu tarifa actual</span>';
  h+='<button class="est-detail-btn" id="estGasGoDetail">Ver Detalle \u2192</button></div>';
  h+='<div class="est-tariff-card est-current">';
  if(cur.comercializadora)h+='<div style="font-size:.72rem;font-weight:600;color:var(--accent-bright)">'+escHtml(cur.comercializadora)+'</div>';
  if(cur.modo==='fijo'){
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Modo</span><span class="est-tariff-val">Cuota fija</span></div>';
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Cuota fija</span><span class="est-tariff-val"><b>'+fcPlain(cur.cuotaFija)+'</b> \u20ac/mes</span></div>';
  } else {
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Modo</span><span class="est-tariff-val">Por consumo</span></div>';
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Precio kWh</span><span class="est-tariff-val"><b>'+(cur.precioKwh).toFixed(4)+'</b> \u20ac/kWh</span></div>';
    if(cur.terminoFijoDia)h+='<div class="est-tariff-row"><span class="est-tariff-lbl">T. fijo/d\u00eda</span><span class="est-tariff-val">'+(cur.terminoFijoDia).toFixed(4)+' \u20ac/d\u00eda</span></div>';
    if(cur.terminoFijo)h+='<div class="est-tariff-row"><span class="est-tariff-lbl">T. fijo/factura</span><span class="est-tariff-val">'+fcPlain(cur.terminoFijo)+' \u20ac</span></div>';
  }
  h+='</div></div>';

  /* Consumption input */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Consumo a comparar</div>';
  h+='<div class="analisis-mortgage-inputs">';
  h+='<div class="analisis-input-group"><label>Consumo (kWh)</label><input class="analisis-input" id="estGasKwh" type="number" min="0" step="10" value="'+ESTUDIO_GAS.consumoKwh+'"></div>';
  h+='<div class="analisis-input-group"><label>D\u00edas</label><input class="analisis-input" id="estGasDias" type="number" min="1" step="1" value="'+ESTUDIO_GAS.dias+'"></div>';
  h+='</div></div>';

  /* Alternative tariff cards */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tarifas alternativas (max 5)</div>';
  comps.forEach(function(c,i){h+=_renderGasCompCard(c,i);});
  if(comps.length<5)h+='<button class="hip-add-sub-btn" id="estGasAdd">+ A\u00f1adir tarifa</button>';
  h+='<button class="econ-calc-btn" id="estGasCalc" style="margin-top:8px">Comparar</button>';
  h+='</div>';

  /* Results */
  if(ESTUDIO_GAS_CALC&&comps.length>0){
    var kwh=ESTUDIO_GAS.consumoKwh||0,dias=ESTUDIO_GAS.dias||30;
    var costActual=_calcGasCost(cur,kwh,dias);
    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Resultado ('+kwh+' kWh, '+dias+' d\u00edas)</div>';
    h+=_renderCompResultTable(costActual,comps,kwh,dias,'gas',cur);
    h+='</div>';
  }
  return h;
}

function _renderGasCompCard(c,i){
  var h='<div class="est-tariff-card">';
  h+='<div class="est-card-hdr">';
  h+='<input class="est-card-name" data-tipo="gas" data-idx="'+i+'" data-field="nombre" type="text" value="'+escHtml(c.nombre||'')+'" placeholder="Tarifa '+(i+1)+'">';
  h+='<button class="est-card-del" data-tipo="gas" data-idx="'+i+'">\u2715</button>';
  h+='</div>';
  /* Modo toggle */
  h+='<div class="est-modo-row">';
  h+='<button class="fiscal-onoff est-modo-btn'+((!c.modo||c.modo==='consumo')?' on':'')+'" data-tipo="gas" data-idx="'+i+'" data-modo="consumo">Por consumo</button>';
  h+='<button class="fiscal-onoff est-modo-btn'+(c.modo==='fijo'?' on':'')+'" data-tipo="gas" data-idx="'+i+'" data-modo="fijo">Fijo mensual</button>';
  h+='</div>';
  if(c.modo==='fijo'){
    h+='<div class="est-fields-row">';
    h+='<div class="est-field"><label>Cuota fija/mes</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="gas" data-idx="'+i+'" data-field="cuotaFija" type="number" min="0" step="1" value="'+(c.cuotaFija||0)+'"><span class="fiscal-despacho-unit">\u20ac</span></div></div>';
    h+='</div>';
  } else {
    h+='<div class="est-fields-row">';
    h+='<div class="est-field"><label>Precio kWh</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="gas" data-idx="'+i+'" data-field="precioKwh" type="number" min="0" step="0.0001" value="'+(c.precioKwh||0)+'"><span class="fiscal-despacho-unit">\u20ac/kWh</span></div></div>';
    h+='<div class="est-field"><label>T. fijo/d\u00eda</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="gas" data-idx="'+i+'" data-field="terminoFijoDia" type="number" min="0" step="0.0001" value="'+(c.terminoFijoDia||0)+'"><span class="fiscal-despacho-unit">\u20ac/d</span></div></div>';
    h+='<div class="est-field"><label>T. fijo/fact.</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="gas" data-idx="'+i+'" data-field="terminoFijo" type="number" min="0" step="0.01" value="'+(c.terminoFijo||0)+'"><span class="fiscal-despacho-unit">\u20ac</span></div></div>';
    h+='</div>';
  }
  h+='<div class="est-fields-row">';
  h+='<div class="est-field est-field-wide"><label>Comercializadora</label><input class="fiscal-despacho-input est-comp-f" data-tipo="gas" data-idx="'+i+'" data-field="comercializadora" type="text" value="'+escHtml(c.comercializadora||'')+'" placeholder="Ej: Naturgy..." style="text-align:left"></div>';
  h+='</div>';
  h+='</div>';
  return h;
}

/* ── Estudio: Comparar Electricidad ──────────────────────── */
var ESTUDIO_ELECT={consumoKwh:0,dias:30};
var ESTUDIO_ELECT_CALC=false;

function _calcElectCost(t,e,kwh,dias){
  var potCost=0;
  if(t.modoPotencia==='doble'){
    potCost=((t.precioPotP1||0)*(e.potenciaP1||e.potenciaTotal||0)+(t.precioPotP2||0)*(e.potenciaP2||e.potenciaTotal||0))*dias;
  } else {
    potCost=(t.precioPotP1||t.precioPot||0)*(e.potenciaTotal||0)*dias;
  }
  return kwh*(t.precioKwh||0)+potCost+(t.terminoFijo||0)*(dias/30);
}
function _currentElectTariff(){
  var e=DESPACHO&&DESPACHO.elect?DESPACHO.elect:{modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:6.6,precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''};
  return e;
}

function _renderEstudioElectComp(){
  if(typeof loadDespacho==='function')loadDespacho();
  var e=_currentElectTariff();
  var comps=DESPACHO&&DESPACHO.electComparaciones?DESPACHO.electComparaciones:[];
  var h='';

  /* Current tariff card */
  h+='<div class="sy-section">';
  h+='<div class="est-section-hdr"><span class="sy-section-title">\u26A1 Tu tarifa actual</span>';
  h+='<button class="est-detail-btn" id="estElectGoDetail">Ver Detalle \u2192</button></div>';
  h+='<div class="est-tariff-card est-current">';
  if(e.comercializadora)h+='<div style="font-size:.72rem;font-weight:600;color:var(--accent-bright)">'+escHtml(e.comercializadora)+'</div>';
  h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Potencia</span><span class="est-tariff-val"><b>'+(e.potenciaTotal||e.potenciaP1||0)+'</b> kW</span></div>';
  if(e.modoPotencia==='doble'){
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Precio P1 (punta)</span><span class="est-tariff-val">'+(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d</span></div>';
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Precio P2 (valle)</span><span class="est-tariff-val">'+(e.precioPotP2||0).toFixed(6)+' \u20ac/kW/d</span></div>';
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Suma precios</span><span class="est-tariff-val"><b>'+((e.precioPotP1||0)+(e.precioPotP2||0)).toFixed(6)+'</b> \u20ac/kW/d</span></div>';
  } else {
    h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Precio potencia</span><span class="est-tariff-val">'+(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d</span></div>';
  }
  h+='<div class="est-tariff-row"><span class="est-tariff-lbl">Precio kWh</span><span class="est-tariff-val"><b>'+(e.precioKwh||0).toFixed(4)+'</b> \u20ac/kWh</span></div>';
  if(e.terminoFijo)h+='<div class="est-tariff-row"><span class="est-tariff-lbl">T. fijo/mes</span><span class="est-tariff-val">'+fcPlain(e.terminoFijo)+' \u20ac</span></div>';
  h+='</div></div>';

  /* Consumption input */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Consumo a comparar</div>';
  h+='<div class="analisis-mortgage-inputs">';
  h+='<div class="analisis-input-group"><label>Consumo (kWh)</label><input class="analisis-input" id="estElectKwh" type="number" min="0" step="10" value="'+ESTUDIO_ELECT.consumoKwh+'"></div>';
  h+='<div class="analisis-input-group"><label>D\u00edas</label><input class="analisis-input" id="estElectDias" type="number" min="1" step="1" value="'+ESTUDIO_ELECT.dias+'"></div>';
  h+='</div></div>';

  /* Alternative tariff cards */
  h+='<div class="sy-section">';
  h+='<div class="sy-section-title">Tarifas alternativas (max 5)</div>';
  comps.forEach(function(c,i){h+=_renderElectCompCard(c,i,e);});
  if(comps.length<5)h+='<button class="hip-add-sub-btn" id="estElectAdd">+ A\u00f1adir tarifa</button>';
  h+='<button class="econ-calc-btn" id="estElectCalc" style="margin-top:8px">Comparar</button>';
  h+='</div>';

  /* Results */
  if(ESTUDIO_ELECT_CALC&&comps.length>0){
    var kwh=ESTUDIO_ELECT.consumoKwh||0,dias=ESTUDIO_ELECT.dias||30;
    var costActual=_calcElectCost(e,e,kwh,dias);
    h+='<div class="sy-section">';
    h+='<div class="sy-section-title">Resultado ('+kwh+' kWh, '+dias+' d\u00edas)</div>';
    h+=_renderCompResultTable(costActual,comps,kwh,dias,'elect',e);
    h+='</div>';
  }
  return h;
}

function _renderElectCompCard(c,i,e){
  /* Migrate old precioPot field */
  if(c.precioPot&&!c.precioPotP1){c.precioPotP1=c.precioPot;if(!c.modoPotencia)c.modoPotencia='simple';}
  if(!c.modoPotencia)c.modoPotencia=e.modoPotencia||'doble';
  var h='<div class="est-tariff-card">';
  h+='<div class="est-card-hdr">';
  h+='<input class="est-card-name" data-tipo="elect" data-idx="'+i+'" data-field="nombre" type="text" value="'+escHtml(c.nombre||'')+'" placeholder="Tarifa '+(i+1)+'">';
  h+='<button class="est-card-del" data-tipo="elect" data-idx="'+i+'">\u2715</button>';
  h+='</div>';
  /* Modo potencia toggle */
  h+='<div class="est-modo-row">';
  h+='<button class="fiscal-onoff est-modo-btn'+(c.modoPotencia==='doble'?' on':'')+'" data-tipo="elect" data-idx="'+i+'" data-modo="doble">2 tramos (P1+P2)</button>';
  h+='<button class="fiscal-onoff est-modo-btn'+(c.modoPotencia==='simple'?' on':'')+'" data-tipo="elect" data-idx="'+i+'" data-modo="simple">Precio \u00fanico</button>';
  h+='</div>';
  h+='<div class="est-fields-row">';
  if(c.modoPotencia==='doble'){
    h+='<div class="est-field"><label>Precio P1 (punta)</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="elect" data-idx="'+i+'" data-field="precioPotP1" type="number" min="0" step="0.000001" value="'+(c.precioPotP1||0)+'"><span class="fiscal-despacho-unit">\u20ac/kW/d</span></div></div>';
    h+='<div class="est-field"><label>Precio P2 (valle)</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="elect" data-idx="'+i+'" data-field="precioPotP2" type="number" min="0" step="0.000001" value="'+(c.precioPotP2||0)+'"><span class="fiscal-despacho-unit">\u20ac/kW/d</span></div></div>';
  } else {
    h+='<div class="est-field"><label>Precio potencia</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="elect" data-idx="'+i+'" data-field="precioPotP1" type="number" min="0" step="0.000001" value="'+(c.precioPotP1||0)+'"><span class="fiscal-despacho-unit">\u20ac/kW/d</span></div></div>';
  }
  h+='<div class="est-field"><label>Precio kWh</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="elect" data-idx="'+i+'" data-field="precioKwh" type="number" min="0" step="0.0001" value="'+(c.precioKwh||0)+'"><span class="fiscal-despacho-unit">\u20ac/kWh</span></div></div>';
  h+='<div class="est-field"><label>T. fijo/mes</label><div class="est-field-inp"><input class="fiscal-despacho-input est-comp-f" data-tipo="elect" data-idx="'+i+'" data-field="terminoFijo" type="number" min="0" step="0.01" value="'+(c.terminoFijo||0)+'"><span class="fiscal-despacho-unit">\u20ac</span></div></div>';
  h+='</div>';
  h+='<div class="est-fields-row">';
  h+='<div class="est-field est-field-wide"><label>Comercializadora</label><input class="fiscal-despacho-input est-comp-f" data-tipo="elect" data-idx="'+i+'" data-field="comercializadora" type="text" value="'+escHtml(c.comercializadora||'')+'" placeholder="Ej: Endesa..." style="text-align:left"></div>';
  h+='</div>';
  h+='</div>';
  return h;
}

/* ── Shared result table for gas/elect comparison ────────── */
function _renderCompResultTable(costActual,comps,kwh,dias,tipo,currentTariff){
  var _colors=['#6c8cff','#fb923c','#c084fc','#fbbf24','#34d399'];
  var h='<div class="mg-budget-table" style="margin-top:6px">';
  h+='<div class="mg-budget-hdr" style="grid-template-columns:1fr 70px 60px 70px"><span>Tarifa</span><span>Coste</span><span>/d\u00eda</span><span>Dif.</span></div>';
  /* Current row */
  h+='<div class="mg-budget-row" style="grid-template-columns:1fr 70px 60px 70px;background:var(--surface2)">';
  h+='<span class="mg-budget-lbl"><span class="mg-cat-dot" style="background:var(--c-green)"></span>Actual</span>';
  h+='<span class="mg-budget-val">'+fcPlain(Math.round(costActual*100)/100)+'</span>';
  h+='<span class="mg-budget-val">'+fcPlain(Math.round(costActual/dias*100)/100)+'</span>';
  h+='<span class="mg-budget-val">\u2014</span></div>';
  /* Alt rows */
  comps.forEach(function(c,i){
    var costAlt=0;
    if(tipo==='gas')costAlt=_calcGasCost(c,kwh,dias);
    else costAlt=_calcElectCost(c,currentTariff,kwh,dias);
    var diff=Math.round((costAlt-costActual)*100)/100;
    var color=diff<=0?'var(--c-green)':'var(--c-red)';
    h+='<div class="mg-budget-row" style="grid-template-columns:1fr 70px 60px 70px">';
    h+='<span class="mg-budget-lbl"><span class="mg-cat-dot" style="background:'+_colors[i%5]+'"></span>'+escHtml(c.nombre||c.comercializadora||'Tarifa '+(i+1))+'</span>';
    h+='<span class="mg-budget-val">'+fcPlain(Math.round(costAlt*100)/100)+'</span>';
    h+='<span class="mg-budget-val">'+fcPlain(Math.round(costAlt/dias*100)/100)+'</span>';
    h+='<span class="mg-budget-val" style="color:'+color+'">'+(diff<=0?'':'+')+ fcPlain(diff)+'</span></div>';
  });
  h+='</div>';
  return h;
}

/* ── Shared bindings for gas/elect comparison ────────────── */
function _bindEstudioGas(){
  var kwhEl=document.getElementById('estGasKwh');
  var diasEl=document.getElementById('estGasDias');
  if(kwhEl)kwhEl.addEventListener('change',function(){ESTUDIO_GAS.consumoKwh=parseFloat(this.value)||0;});
  if(diasEl)diasEl.addEventListener('change',function(){ESTUDIO_GAS.dias=parseInt(this.value)||30;});
  /* Go to detail */
  var goDetail=document.getElementById('estGasGoDetail');
  if(goDetail)goDetail.addEventListener('click',function(){FISCAL_TAB='despacho';FISCAL_HIP_SUB='gas';if(typeof openFiscal==='function')openFiscal();});
  /* Add tariff */
  var addBtn=document.getElementById('estGasAdd');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(!DESPACHO.gasComparaciones)DESPACHO.gasComparaciones=[];
    if(DESPACHO.gasComparaciones.length>=5)return;
    DESPACHO.gasComparaciones.push({nombre:'',precioKwh:0,terminoFijoDia:0,terminoFijo:0,modo:'consumo',cuotaFija:0,comercializadora:''});
    saveDespacho();_estudioReRender();
  });
  /* Comparar button */
  var calcBtn=document.getElementById('estGasCalc');
  if(calcBtn)calcBtn.addEventListener('click',function(){
    _saveCompFields('gas','gasComparaciones');
    ESTUDIO_GAS.consumoKwh=parseFloat(document.getElementById('estGasKwh').value)||0;
    ESTUDIO_GAS.dias=parseInt(document.getElementById('estGasDias').value)||30;
    ESTUDIO_GAS_CALC=true;
    _estudioReRender();
  });
  _bindCompFields('gas','gasComparaciones');
}

function _bindEstudioElect(){
  var kwhEl=document.getElementById('estElectKwh');
  var diasEl=document.getElementById('estElectDias');
  if(kwhEl)kwhEl.addEventListener('change',function(){ESTUDIO_ELECT.consumoKwh=parseFloat(this.value)||0;});
  if(diasEl)diasEl.addEventListener('change',function(){ESTUDIO_ELECT.dias=parseInt(this.value)||30;});
  /* Go to detail */
  var goDetail=document.getElementById('estElectGoDetail');
  if(goDetail)goDetail.addEventListener('click',function(){FISCAL_TAB='despacho';FISCAL_HIP_SUB='elect';if(typeof openFiscal==='function')openFiscal();});
  /* Add tariff */
  var addBtn=document.getElementById('estElectAdd');
  if(addBtn)addBtn.addEventListener('click',function(){
    if(!DESPACHO.electComparaciones)DESPACHO.electComparaciones=[];
    if(DESPACHO.electComparaciones.length>=5)return;
    var e=DESPACHO.elect||{};
    DESPACHO.electComparaciones.push({nombre:'',modoPotencia:e.modoPotencia||'doble',precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''});
    saveDespacho();_estudioReRender();
  });
  /* Comparar button */
  var calcBtn=document.getElementById('estElectCalc');
  if(calcBtn)calcBtn.addEventListener('click',function(){
    _saveCompFields('elect','electComparaciones');
    ESTUDIO_ELECT.consumoKwh=parseFloat(document.getElementById('estElectKwh').value)||0;
    ESTUDIO_ELECT.dias=parseInt(document.getElementById('estElectDias').value)||30;
    ESTUDIO_ELECT_CALC=true;
    _estudioReRender();
  });
  _bindCompFields('elect','electComparaciones');
}

function _bindCompFields(tipo,despKey){
  /* Name inputs */
  document.querySelectorAll('.est-card-name[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){
      var idx=parseInt(el.dataset.idx);
      if(DESPACHO[despKey][idx])DESPACHO[despKey][idx].nombre=el.value;
      saveDespacho();
    });
  });
  /* Delete buttons */
  document.querySelectorAll('.est-card-del[data-tipo="'+tipo+'"]').forEach(function(btn){
    btn.addEventListener('click',function(){
      DESPACHO[despKey].splice(parseInt(btn.dataset.idx),1);
      saveDespacho();_estudioReRender();
    });
  });
  /* Modo toggles */
  document.querySelectorAll('.est-modo-btn[data-tipo="'+tipo+'"]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var idx=parseInt(btn.dataset.idx);
      var modo=btn.dataset.modo;
      if(!DESPACHO[despKey][idx])return;
      if(tipo==='gas')DESPACHO[despKey][idx].modo=modo;
      else DESPACHO[despKey][idx].modoPotencia=modo;
      saveDespacho();_estudioReRender();
    });
  });
  /* All field inputs */
  document.querySelectorAll('.est-comp-f[data-tipo="'+tipo+'"]').forEach(function(el){
    el.addEventListener('change',function(){
      var idx=parseInt(el.dataset.idx);
      var field=el.dataset.field;
      if(!DESPACHO[despKey][idx])return;
      if(el.type==='number')DESPACHO[despKey][idx][field]=parseFloat(el.value)||0;
      else DESPACHO[despKey][idx][field]=(el.value||'').trim();
      saveDespacho();
    });
  });
}

function _saveCompFields(tipo,despKey){
  document.querySelectorAll('.est-comp-f[data-tipo="'+tipo+'"]').forEach(function(el){
    var idx=parseInt(el.dataset.idx);
    var field=el.dataset.field;
    if(!DESPACHO[despKey][idx])return;
    if(el.type==='number')DESPACHO[despKey][idx][field]=parseFloat(el.value)||0;
    else DESPACHO[despKey][idx][field]=(el.value||'').trim();
  });
  document.querySelectorAll('.est-card-name[data-tipo="'+tipo+'"]').forEach(function(el){
    var idx=parseInt(el.dataset.idx);
    if(DESPACHO[despKey][idx])DESPACHO[despKey][idx].nombre=el.value;
  });
  saveDespacho();
}

/* ── Estudio overlay lifecycle ───────────────────────────── */
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
