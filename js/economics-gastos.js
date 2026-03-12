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
  var gdPct=typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5;
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

  running=Math.round(running-e.totIva*100)/100; // IVA siempre se va
  h+=gastosCascRow('iva_hac','IVA 21% a Hacienda (Mod.303)','\u2212',e.totIva,'var(--c-orange)',false);
  h+=gastosResultRow('(Base \u2212 15% IRPF)',Math.round((e.totBase-e.totIrpf)*100)/100,'var(--c-green)');

  running=Math.round((e.totBase-e.totIrpf)*100)/100; // reset a neto real

  // Gastos difícil justificación → solo muestra IRPF declaración
  var baseDecl=Math.max(0,Math.round((e.totBase*(1-gdPct/100))*100)/100);
  var decl=computeIrpfBrackets(baseDecl);
  var declDiff=Math.round((decl.totalTax-e.totIrpf)*100)/100;

  if(declDiff>0){
    var gdLabel='IRPF Dec. Renta <span style="font-size:.68rem;color:var(--text-dim)">(gastos dif\u00edcil just. '+gdPct+'% \u2192 '+decl.effectivePct.toFixed(1)+'% efectivo)</span>';
    h+=gastosCascRow('irpf_decl',gdLabel,'\u2212',declDiff,'var(--c-red)',true);
    if(isTglOn('irpf_decl'))running=Math.round((running-declDiff)*100)/100;
    h+=gastosResultRow('Tras Declaraci\u00f3n Renta',running,running>0?'var(--c-green)':'var(--c-red)');
  } else if(declDiff<0){
    var gdLabel='Devoluci\u00f3n IRPF Dec. Renta <span style="font-size:.68rem;color:var(--text-dim)">(gastos dif\u00edcil just. '+gdPct+'%)</span>';
    h+=gastosCascRow('irpf_decl',gdLabel,'+',Math.abs(declDiff),'var(--c-green)',true);
    if(isTglOn('irpf_decl'))running=Math.round((running+Math.abs(declDiff))*100)/100;
    h+=gastosResultRow('Tras Declaraci\u00f3n Renta',running,running>0?'var(--c-green)':'var(--c-red)');
  }

  // Gastos regulares — por grupos
  var cotLabel='Cotizaciones sociales <span style="font-size:.68rem;color:var(--text-dim)">(aprox.)</span>';
  var asesorLabel='Asesor\u00eda <span style="font-size:.68rem;color:var(--text-dim)">(semiobligatorio)</span>';
  var segBajaLabel='Seguro baja laboral <span style="font-size:.68rem;color:var(--text-dim)">(aprox.)</span>';
  var segSaludLabel='Seguro de Salud <span style="font-size:.68rem;color:var(--text-dim)">(semiobligatorio)</span>';
  var labelMap={'cot_social':cotLabel,'asesoria':asesorLabel,'seg_baja':segBajaLabel,'seg_salud':segSaludLabel};

  var GROUP_SEMIOBL={'asesoria':true,'seg_baja':true,'seg_salud':true,'otros_seg':true};
  var GROUP_CASA={'hipoteca':true,'comunidad':true,'seg_hogar':true,'luz':true,'gas':true,'agua':true,'digi':true};

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

  // Grupo 4: otros (custom items no reconocidos)
  _gastosGroup(function(g){return g.id!=='cot_social'&&!GROUP_SEMIOBL[g.id]&&!GROUP_CASA[g.id];});

  h+=gastosResultRow('Neto disponible estimado',running,running>0?'var(--c-green)':'var(--c-red)');
  h+='</div></div>';

  /* Nota configurabilidad */
  h+='<div class="sy-section" style="padding:10px 14px">';
  h+='<div style="font-size:.7rem;color:var(--text-dim);text-align:center">Parte de esta informaci\u00f3n es configurable desde el men\u00fa de configuraci\u00f3n de la ventana econ\u00f3mica \u2699\ufe0f</div>';
  h+='</div>';

  /* §B Desglose IRPF por tramos (info) */
  if(gdPct>0||declDiff!==0){
    h+='<div class="sy-section"><div class="sy-section-title">IRPF Declaraci\u00f3n — Desglose</div>';
    h+='<div class="econ-decl-section">';
    h+='<div class="econ-decl-row"><span>Base imponible:</span><span class="econ-decl-val">'+fc(e.totBase)+'</span></div>';
    h+='<div class="econ-decl-row"><span>Gastos dif\u00edcil just. ('+gdPct+'%):</span><span class="econ-decl-val" style="color:var(--c-green)">&minus;'+fc(Math.round(e.totBase*gdPct/100*100)/100)+'</span></div>';
    h+='<div class="econ-decl-row"><span>Base declaraci\u00f3n:</span><span class="econ-decl-val">'+fc(baseDecl)+'</span></div>';
    h+='<div class="econ-decl-row"><span>IRPF por tramos:</span><span class="econ-decl-val" style="color:var(--c-red)">'+fc(decl.totalTax)+'</span></div>';
    h+='<div class="econ-decl-row"><span>Tipo efectivo:</span><span class="econ-decl-val">'+decl.effectivePct.toFixed(2).replace('.',',')+'\u202f%</span></div>';
    h+='<div class="econ-decl-row"><span>IRPF retenido en facturas:</span><span class="econ-decl-val" style="color:var(--c-red)">&minus;'+fc(e.totIrpf)+'</span></div>';
    var diffColor=declDiff<0?'var(--c-green)':'var(--c-red)';
    var diffLabel=declDiff<0?'Devoluci\u00f3n estimada':'A pagar estimado';
    h+='<div class="econ-decl-row" style="font-weight:700"><span>'+diffLabel+':</span>';
    h+='<span class="econ-decl-val" style="color:'+diffColor+'">'+(declDiff<0?'+':'')+fc(Math.abs(declDiff))+'</span></div>';
    // Tramos
    h+='<div style="overflow-x:auto;margin-top:8px"><table class="econ-bracket-table"><thead><tr>';
    h+='<th>Desde</th><th>Hasta</th><th>Tipo</th><th>Tramo</th><th>Cuota</th></tr></thead><tbody>';
    decl.breakdown.forEach(function(tr){
      h+='<tr><td>'+fc(tr.from)+'</td><td>'+(tr.to===Infinity?'&#8734;':fc(tr.to))+'</td>';
      h+='<td>'+tr.pct+'%</td><td>'+fc(tr.taxable)+'</td><td class="col-irpf">'+fc(tr.tax)+'</td></tr>';
    });
    h+='</tbody></table></div>';
    h+='</div></div>';
  }

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
