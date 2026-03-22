/* ============================================================
   FISCAL — Electricidad detalle + Seguros normales + Helpers
   ============================================================ */

var FISCAL_ELECT_EDITING=false;
function _renderElectDetalle(){
  var e=DESPACHO.elect||{modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:6.6,precioPotP1:0,precioPotP2:0,precioKwh:0,terminoFijo:0,comercializadora:''};
  if(e.ivaElect===undefined)e.ivaElect=21;
  var h='<div class="fiscal-section">';
  h+='<div class="hip-section-hdr"><span class="fiscal-section-title">\u26A1 Tarifa de Electricidad</span>';
  if(!FISCAL_ELECT_EDITING)h+='<button class="hip-edit-btn" id="electEditBtn">Editar</button>';
  h+='</div>';
  if(FISCAL_ELECT_EDITING){
    h+='<div style="margin-bottom:8px"><span class="hip-cf-lbl">Precio potencia</span>';
    h+='<div style="display:flex;gap:6px;margin-top:4px">';
    h+='<button class="fiscal-onoff'+(e.modoPotencia==='doble'?' on':'')+'" id="electModoDoble">2 tramos (P1+P2)</button>';
    h+='<button class="fiscal-onoff'+(e.modoPotencia==='simple'?' on':'')+'" id="electModoSimple">Precio \u00fanico</button>';
    h+='</div></div>';
    /* Nivel 1: Potencia */
    h+='<div class="hip-g2" style="margin-bottom:0">';
    h+=_hipNum('electPotencia','Potencia contratada',e.potenciaP1||e.potenciaTotal||0,'kW');
    h+='</div>';
    h+='<div style="border-top:1px solid var(--border);margin:6px 0"></div>';
    /* Nivel 2: Precios potencia */
    h+='<div class="hip-g2" style="margin-bottom:0">';
    if(e.modoPotencia==='doble'){
      h+=_hipNum('electPrecioPotP1','Precio potencia P1 (punta)',e.precioPotP1||0,'\u20ac/kW/d\u00eda');
      h+=_hipNum('electPrecioPotP2','Precio potencia P2 (valle)',e.precioPotP2||0,'\u20ac/kW/d\u00eda');
      var sumPrecios=((e.precioPotP1||0)+(e.precioPotP2||0)).toFixed(6);
      h+=_hipNum('electTotalPrecio','Suma precios (auto)',parseFloat(sumPrecios),'\u20ac/kW/d\u00eda');
    } else {
      h+=_hipNum('electPrecioPotP1','Precio potencia',e.precioPotP1||0,'\u20ac/kW/d\u00eda');
    }
    h+='</div>';
    h+='<div style="border-top:1px solid var(--border);margin:6px 0"></div>';
    /* Nivel 3: Energía */
    h+='<div class="hip-g2" style="margin-bottom:0">';
    h+=_hipNum('electPrecioKwh','Precio kWh',e.precioKwh,'\u20ac/kWh');
    h+='</div>';
    h+='<div style="border-top:1px solid var(--border);margin:6px 0"></div>';
    /* Nivel 4: Fijos + IVA */
    h+='<div class="hip-g2">';
    h+=_hipMoney('electTerminoFijo','T\u00e9rmino fijo/mes',e.terminoFijo);
    h+=_hipNum('electIva','IVA',e.ivaElect,'%');
    h+=_hipText('electComerc','Comercializadora',e.comercializadora,'Ej: Endesa...');
    h+='</div>';
    h+='<div class="hip-edit-actions"><button class="hip-save-btn" id="electSaveBtn">Guardar cambios</button><button class="hip-cancel-btn" id="electCancelBtn">Cancelar</button></div>';
  } else {
    /* Nivel 1 */
    h+=_hipRO('Potencia contratada',(e.potenciaP1||e.potenciaTotal||0)+' kW');
    h+='<div style="border-top:1px solid var(--border);margin:4px 0"></div>';
    /* Nivel 2 */
    if(e.modoPotencia==='doble'){
      h+=_hipRO('Precio P1 (punta)',(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d\u00eda');
      h+=_hipRO('Precio P2 (valle)',(e.precioPotP2||0).toFixed(6)+' \u20ac/kW/d\u00eda');
      h+=_hipRO('Suma precios potencia',((e.precioPotP1||0)+(e.precioPotP2||0)).toFixed(6)+' \u20ac/kW/d\u00eda');
    } else {
      h+=_hipRO('Precio potencia',(e.precioPotP1||0).toFixed(6)+' \u20ac/kW/d\u00eda');
    }
    h+='<div style="border-top:1px solid var(--border);margin:4px 0"></div>';
    /* Nivel 3 */
    h+=_hipRO('Precio kWh',e.precioKwh?e.precioKwh.toFixed(4)+' \u20ac/kWh':'\u2014');
    h+='<div style="border-top:1px solid var(--border);margin:4px 0"></div>';
    /* Nivel 4 */
    h+=_hipROmoney('T\u00e9rmino fijo/mes',e.terminoFijo);
    h+=_hipRO('IVA',(e.ivaElect||21)+'%');
    h+=_hipRO('Comercializadora',e.comercializadora||'\u2014');
  }
  h+='</div>';
  return h;
}

/* ── Precios normales de seguros (config) ────────────────── */
function _renderSegurosNormales(){
  var sn=DESPACHO.segurosNormales||{segSalud:0,segVida:0,segHogar:0};
  var h='<div class="fiscal-section">';
  h+='<div class="fiscal-section-title">\uD83D\uDCCB Precios referencia seguros</div>';
  h+='<div style="font-size:.68rem;color:var(--text-dim);margin-bottom:6px">Precio que consideras normal para comparar con seguros vinculados a la hipoteca.</div>';
  h+='<div class="hip-g2">';
  h+=_hipMoney('segNormalSalud','Seg. salud (anual)',sn.segSalud);
  h+=_hipMoney('segNormalVida','Seg. vida (anual)',sn.segVida);
  h+=_hipMoney('segNormalHogar','Seg. hogar (anual)',sn.segHogar);
  h+='</div>';
  h+='</div>';
  return h;
}

function _vincRow(id,label,data){
  if(!data)data={enabled:false,costeAnual:0,reduccion:0};
  var isNomina=id.indexOf('Nomina')!==-1;
  var h='<div class="fiscal-vinc-row">';
  h+='<div class="fiscal-despacho-toggle-row" style="margin-bottom:0">';
  h+='<span class="fiscal-despacho-toggle-lbl" style="font-size:.76rem">'+label+'</span>';
  h+='<div class="fiscal-onoff'+(data.enabled?' on':'')+'" id="'+id+'Toggle">'+(data.enabled?'ON':'OFF')+'</div>';
  h+='</div>';
  if(data.enabled){
    h+='<div class="fiscal-vinc-cost">';
    h+='<div style="display:flex;gap:8px;align-items:flex-end">';
    if(!isNomina){
      h+='<div><label class="fiscal-despacho-label" style="font-size:.68rem">Coste anual \u20ac</label>';
      h+='<input class="fiscal-despacho-input" id="'+id+'Coste" type="number" min="0" step="10" value="'+(data.costeAnual||0)+'" style="width:90px"></div>';
    }
    h+='<div><label class="fiscal-despacho-label" style="font-size:.68rem">Reducci\u00f3n tipo %</label>';
    h+='<input class="fiscal-despacho-input fiscal-vinc-reduccion" id="'+id+'Reduccion" type="number" min="0" step="0.05" value="'+(data.reduccion||0)+'" style="width:75px"></div>';
    h+='</div></div>';
  }
  h+='</div>';
  return h;
}

function _despFieldDate(id,label,val){
  return '<div class="fiscal-despacho-field">'
    +'<label class="fiscal-despacho-label">'+label+'</label>'
    +'<div class="fiscal-despacho-input-row">'
    +'<input class="fiscal-despacho-input" id="desp-'+id+'" type="date" value="'+(val||'')+'" style="width:auto">'
    +'</div>'
    +'</div>';
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
/* Campo monetario con step=1000 y display del valor formateado con puntos (estilo español) */
function _fmtMiles(n){
  if(!n||n===0)return '0';
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}
function _despFieldMoney(id,label,val){
  var formatted=val&&val>0?_fmtMiles(val):'0';
  return '<div class="fiscal-despacho-field">'
    +'<label class="fiscal-despacho-label">'+label+'</label>'
    +'<div class="fiscal-despacho-input-row">'
    +'<input class="fiscal-despacho-input" id="desp-'+id+'" type="number" min="0" step="1000" value="'+(val||0)+'">'
    +'<span class="fiscal-despacho-unit">\u20ac</span>'
    +'</div>'
    +'<div class="fiscal-despacho-money-fmt" id="desp-fmt-'+id+'">'+(val&&val>0?formatted+' \u20ac':'')+'</div>'
    +'</div>';
}

/* ── renderGastosList ─────────────────────────────────────── */
function _renderIngresosDesgList(){
  var h='';
  GASTOS_ITEMS.forEach(function(g,i){
    if(g.id!=='plan_pension')return;
    h+='<div class="fiscal-gasto-item" data-gi="'+i+'">';
    h+='<span class="fiscal-gasto-lbl">'+g.label+'</span>';
    h+='<input class="fiscal-gasto-amt" data-gi="'+i+'" data-gfield="amount" type="number" min="0" step="1" value="'+(g.amount||0)+'">';
    h+='<span class="fiscal-gasto-period-static">/a\u00f1o</span>';
    h+='<span style="width:22px"></span>';
    h+='</div>';
  });
  return h;
}
var GASTOS_GROUPS=[
  {label:'Aut\u00f3nomo',ids:['cot_social','asesoria']},
  {label:'Seguros',ids:['seg_baja','seg_salud','seg_vida','otros_seg']},
  {label:'Casa',ids:['hipoteca','ibi','comunidad','seg_hogar','gas','luz','digi','agua']},
  {label:'Otros',ids:['donaciones']}
];
function _renderGastoItem(g,i){
  var isFixed=DEFAULT_GASTOS.some(function(d){return d.id===g.id;});
  var h='<div class="fiscal-gasto-item" data-gi="'+i+'">';
  if(isFixed){h+='<span class="fiscal-gasto-lbl">'+g.label+'</span>';}
  else{h+='<input class="fiscal-gasto-lbl-input" data-gi="'+i+'" data-gfield="label" value="'+escHtml(g.label)+'" placeholder="Nombre...">';}
  h+='<input class="fiscal-gasto-amt" data-gi="'+i+'" data-gfield="amount" type="number" min="0" step="1" value="'+(g.amount||0)+'">';
  h+='<div class="fiscal-gasto-period">';
  h+='<button class="fiscal-period-btn'+(g.period==='monthly'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="monthly">/mes</button>';
  h+='<button class="fiscal-period-btn'+(g.period==='annual'?' active':'')+'" data-gi="'+i+'" data-gfield="period" data-val="annual">/a\u00f1o</button>';
  h+='</div>';
  if(!isFixed){h+='<button class="fiscal-gasto-del" data-gi="'+i+'">&#10005;</button>';}
  else{h+='<span style="width:22px"></span>';}
  h+='</div>';
  return h;
}
function renderGastosList(){
  var h='';var rendered={};
  GASTOS_GROUPS.forEach(function(grp){
    var gh='';
    grp.ids.forEach(function(id){
      for(var i=0;i<GASTOS_ITEMS.length;i++){
        if(GASTOS_ITEMS[i].id===id){gh+=_renderGastoItem(GASTOS_ITEMS[i],i);rendered[i]=true;break;}
      }
    });
    if(gh)h+='<div class="fiscal-gastos-group-hdr">'+grp.label+'</div>'+gh;
  });
  var custom='';
  GASTOS_ITEMS.forEach(function(g,i){
    if(g.id==='plan_pension'||rendered[i])return;
    custom+=_renderGastoItem(g,i);
  });
  if(custom)h+='<div class="fiscal-gastos-group-hdr">Personalizado</div>'+custom;
  return h;
}

/* ── openFiscal / closeFiscal ─────────────────────────────── */

function _bindElectDetalle(){
  var editBtn=document.getElementById('electEditBtn');
  if(editBtn)editBtn.addEventListener('click',function(){FISCAL_ELECT_EDITING=true;reRenderFiscal();});
  var saveBtn=document.getElementById('electSaveBtn');
  if(saveBtn)saveBtn.addEventListener('click',function(){
    var e=DESPACHO.elect;
    if(e.modoPotencia==='doble'){
      var pot=parseFloat(document.getElementById('desp-electPotencia').value)||0;
      e.potenciaP1=pot;e.potenciaP2=pot;e.potenciaTotal=pot;
      e.precioPotP1=parseFloat(document.getElementById('desp-electPrecioPotP1').value)||0;
      e.precioPotP2=parseFloat(document.getElementById('desp-electPrecioPotP2').value)||0;
    } else {
      var potS=parseFloat(document.getElementById('desp-electPotencia').value)||0;
      e.potenciaTotal=potS;e.potenciaP1=potS;e.potenciaP2=potS;
      e.precioPotP1=parseFloat(document.getElementById('desp-electPrecioPotP1').value)||0;
      e.precioPotP2=e.precioPotP1;
    }
    e.precioKwh=parseFloat(document.getElementById('desp-electPrecioKwh').value)||0;
    e.terminoFijo=parseFloat(document.getElementById('desp-electTerminoFijo').value)||0;
    e.ivaElect=parseFloat(document.getElementById('desp-electIva').value)||21;
    e.comercializadora=(document.getElementById('desp-electComerc').value||'').trim();
    saveDespacho();FISCAL_ELECT_EDITING=false;reRenderFiscal();
  });
  var cancelBtn=document.getElementById('electCancelBtn');
  if(cancelBtn)cancelBtn.addEventListener('click',function(){loadDespacho();FISCAL_ELECT_EDITING=false;reRenderFiscal();});
  /* Modo toggles */
  var modoD=document.getElementById('electModoDoble');
  var modoS=document.getElementById('electModoSimple');
  if(modoD)modoD.addEventListener('click',function(){DESPACHO.elect.modoPotencia='doble';reRenderFiscal();});
  if(modoS)modoS.addEventListener('click',function(){DESPACHO.elect.modoPotencia='simple';reRenderFiscal();});
  /* Bidirectional precio P1+P2 → Suma precios (auto) */
  var pp1=document.getElementById('desp-electPrecioPotP1');
  var pp2=document.getElementById('desp-electPrecioPotP2');
  var ptot=document.getElementById('desp-electTotalPrecio');
  if(pp1)pp1.addEventListener('input',function(){
    var v1=parseFloat(pp1.value)||0,v2=pp2?parseFloat(pp2.value)||0:0;
    if(ptot)ptot.value=parseFloat((v1+v2).toFixed(6));
  });
  if(pp2)pp2.addEventListener('input',function(){
    var v1=pp1?parseFloat(pp1.value)||0:0,v2=parseFloat(pp2.value)||0;
    if(ptot)ptot.value=parseFloat((v1+v2).toFixed(6));
  });
}

/* ── Seguros normales bindings ───────────────────────────── */
function _bindSegurosNormales(){
  var fields={segNormalSalud:'segSalud',segNormalVida:'segVida',segNormalHogar:'segHogar'};
  Object.keys(fields).forEach(function(domId){
    var el=document.getElementById('desp-'+domId);
    if(!el)return;
    var prop=fields[domId];
    el.addEventListener('change',function(){
      if(!DESPACHO.segurosNormales)DESPACHO.segurosNormales={segSalud:0,segVida:0,segHogar:0};
      DESPACHO.segurosNormales[prop]=parseFloat(this.value)||0;
      saveDespacho();
    });
    /* Money format */
    var fmtEl=document.getElementById('desp-fmt-'+domId);
    if(fmtEl)el.addEventListener('input',function(){var v=parseFloat(el.value)||0;fmtEl.textContent=v>0?_fmtMiles(v)+' \u20ac':'';});
  });
}
