/* ============================================================
   FISCAL — Gas detalle (escenarios consumo + fijo)
   ============================================================ */

var FISCAL_GAS_EDITING=null; /* null | 'consumo' | 'fijo' */
function _ensureGasScenarios(){
  var g=DESPACHO.gas;
  if(!g.consumo)g.consumo={precioKwh:g.precioKwh||0,terminoFijoDia:0,terminoFijo:g.terminoFijo||0,comercializadora:g.comercializadora||''};
  if(!g.fijo)g.fijo={cuotaFija:g.cuotaFija||0,comercializadora:g.comercializadora||''};
  if(!g.activo)g.activo=g.modo||'consumo';
  if(g.ivaGas===undefined)g.ivaGas=21;
}
function _renderGasDetalle(){
  _ensureGasScenarios();
  var g=DESPACHO.gas;
  var h='';
  /* Active scenario selector */
  h+='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">\uD83D\uDD25 Tarifa activa</div>';
  h+='<div style="display:flex;gap:6px">';
  h+='<button class="fiscal-onoff'+(g.activo==='consumo'?' on':'')+'" id="gasActivoConsumo">Por consumo</button>';
  h+='<button class="fiscal-onoff'+(g.activo==='fijo'?' on':'')+'" id="gasActivoFijo">Fijo mensual</button>';
  h+='</div></div>';
  /* Scenario 1: Consumo */
  var sc=g.consumo;
  h+='<div class="fiscal-section"'+(g.activo!=='consumo'?' style="opacity:.5"':'')+'>';
  h+='<div class="hip-section-hdr"><span class="fiscal-section-title">Escenario: Pago por consumo'+(g.activo==='consumo'?' \u2714':'')+'</span>';
  if(FISCAL_GAS_EDITING!=='consumo')h+='<button class="hip-edit-btn" data-gasedit="consumo">Editar</button>';
  h+='</div>';
  if(FISCAL_GAS_EDITING==='consumo'){
    h+='<div class="hip-g2">';
    h+=_hipNum('gasConsPrecio','Precio kWh',sc.precioKwh,'\u20ac/kWh');
    h+=_hipNum('gasConsTfijoDia','T\u00e9rmino fijo/d\u00eda',sc.terminoFijoDia||0,'\u20ac/d\u00eda');
    h+=_hipMoney('gasConsTfijo','T\u00e9rmino fijo/factura',sc.terminoFijo);
    h+=_hipNum('gasIva','IVA',g.ivaGas,'%');
    h+=_hipText('gasConsComerc','Comercializadora',sc.comercializadora,'Ej: Naturgy...');
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-gassave="consumo">Guardar</button><button class="hip-cancel-btn" data-gascancel="consumo">Cancelar</button></div>';
  } else {
    h+=_hipRO('Precio kWh',sc.precioKwh?(sc.precioKwh).toFixed(4)+' \u20ac/kWh':'\u2014');
    if(sc.terminoFijoDia)h+=_hipRO('T\u00e9rmino fijo/d\u00eda',(sc.terminoFijoDia).toFixed(4)+' \u20ac/d\u00eda');
    h+=_hipROmoney('T\u00e9rmino fijo/factura',sc.terminoFijo);
    h+=_hipRO('IVA',(g.ivaGas||21)+'%');
    h+=_hipRO('Comercializadora',sc.comercializadora||'\u2014');
  }
  h+='</div>';
  /* Scenario 2: Fijo */
  var sf=g.fijo;
  h+='<div class="fiscal-section"'+(g.activo!=='fijo'?' style="opacity:.5"':'')+'>';
  h+='<div class="hip-section-hdr"><span class="fiscal-section-title">Escenario: Cuota fija'+(g.activo==='fijo'?' \u2714':'')+'</span>';
  if(FISCAL_GAS_EDITING!=='fijo')h+='<button class="hip-edit-btn" data-gasedit="fijo">Editar</button>';
  h+='</div>';
  if(FISCAL_GAS_EDITING==='fijo'){
    h+='<div class="hip-g2">';
    h+=_hipMoney('gasFijoCuota','Cuota fija/mes',sf.cuotaFija);
    h+=_hipNum('gasIvaFijo','IVA',g.ivaGas,'%');
    h+=_hipText('gasFijoComerc','Comercializadora',sf.comercializadora,'Ej: Naturgy...');
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" data-gassave="fijo">Guardar</button><button class="hip-cancel-btn" data-gascancel="fijo">Cancelar</button></div>';
  } else {
    h+=_hipROmoney('Cuota fija/mes',sf.cuotaFija);
    h+=_hipRO('IVA',(g.ivaGas||21)+'%');
    h+=_hipRO('Comercializadora',sf.comercializadora||'\u2014');
  }
  h+='</div>';
  return h;
}

/* ── Electricidad detail sub-tab ─────────────────────────── */

function _bindGasDetalle(){
  _ensureGasScenarios();
  /* Active scenario toggle */
  var actC=document.getElementById('gasActivoConsumo');
  var actF=document.getElementById('gasActivoFijo');
  if(actC)actC.addEventListener('click',function(){DESPACHO.gas.activo='consumo';saveDespacho();reRenderFiscal();});
  if(actF)actF.addEventListener('click',function(){DESPACHO.gas.activo='fijo';saveDespacho();reRenderFiscal();});
  /* Edit buttons */
  document.querySelectorAll('[data-gasedit]').forEach(function(btn){
    btn.addEventListener('click',function(){FISCAL_GAS_EDITING=btn.dataset.gasedit;reRenderFiscal();});
  });
  /* Save buttons */
  document.querySelectorAll('[data-gassave]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var sc=btn.dataset.gassave;
      var g=DESPACHO.gas;
      if(sc==='consumo'){
        g.consumo.precioKwh=parseFloat(document.getElementById('desp-gasConsPrecio').value)||0;
        g.consumo.terminoFijoDia=parseFloat(document.getElementById('desp-gasConsTfijoDia').value)||0;
        g.consumo.terminoFijo=parseFloat(document.getElementById('desp-gasConsTfijo').value)||0;
        g.consumo.comercializadora=(document.getElementById('desp-gasConsComerc').value||'').trim();
        g.ivaGas=parseFloat(document.getElementById('desp-gasIva').value)||21;
      } else {
        g.fijo.cuotaFija=parseFloat(document.getElementById('desp-gasFijoCuota').value)||0;
        g.fijo.comercializadora=(document.getElementById('desp-gasFijoComerc').value||'').trim();
        g.ivaGas=parseFloat(document.getElementById('desp-gasIvaFijo').value)||21;
      }
      saveDespacho();FISCAL_GAS_EDITING=null;reRenderFiscal();
    });
  });
  /* Cancel buttons */
  document.querySelectorAll('[data-gascancel]').forEach(function(btn){
    btn.addEventListener('click',function(){loadDespacho();FISCAL_GAS_EDITING=null;reRenderFiscal();});
  });
}

