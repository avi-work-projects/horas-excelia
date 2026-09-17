/* Ventana de energía: histórico de solo lectura, escenarios independientes. */
var ENERGY_ANALYSIS_TAB='consumo';
var ENERGY_ANALYSIS_YEAR=new Date().getFullYear();
var ENERGY_ANALYSIS_KIND='luz';
var ENERGY_SCENARIO={contractId:'',start:'',end:'',tariff:null,name:'Escenario',vatMode:'historical',vat:21,promos:false};
var ENERGY_RETURN=null;
function energyAnalysisHtml(kind){
  var year=ENERGY_ANALYSIS_YEAR,months=energyConsumptionMonths(energyBills(),year,kind);
  var h='<div class="energy-window-header"><button class="sy-back" id="energyAnalysisBack" aria-label="Volver">←</button><h2>Estudio de '+(kind==='luz'?'electricidad':'gas')+'</h2><button class="ev-io-btn" id="energyImportTop">Importar</button></div>';
  h+='<div class="energy-year-nav"><button class="nav-btn" data-analysis-year="-1" aria-label="Año anterior">◀</button><strong>'+year+'</strong><button class="nav-btn" data-analysis-year="1" aria-label="Año siguiente">▶</button></div><div class="sy-body"><div class="econ-sub-tabs energy-tabs">';
  [['consumo','Consumo'],['costes','Coste'],['tarifas','Tarifas'],['comparar','Escenarios'],['archivo','Archivo']].forEach(function(t){h+='<button class="econ-sub-tab'+(ENERGY_ANALYSIS_TAB===t[0]?' active':'')+'" data-energy-tab="'+t[0]+'">'+t[1]+'</button>';});
  h+='</div><div class="energy-window-content">';
  if(ENERGY_ANALYSIS_TAB==='consumo')h+=energyConsumptionHtml(kind,months,year);
  if(ENERGY_ANALYSIS_TAB==='costes')h+=energyCostsHtml(kind,year);
  if(ENERGY_ANALYSIS_TAB==='tarifas')h+=energyTariffsHtml(kind);
  if(ENERGY_ANALYSIS_TAB==='comparar')h+=energyComparisonHtml(kind,months);
  if(ENERGY_ANALYSIS_TAB==='archivo')h+=energyArchiveHtml(kind);
  return h+'</div></div><input type="file" id="energyStudyFile" accept=".json,application/json" hidden>';
}
function energyConsumptionHtml(kind,months,year){
  var prev=energyConsumptionMonths(energyBills(),year-1,kind);
  var h='<p class="energy-caption">Consumo por mes natural, estimado a partir de los días de cada lectura. Desliza el gráfico para cambiar de año.</p><section class="energy-contract energy-year-chart"><h3>Consumo mensual · kWh</h3>'+energyBillsChart(months,'consumption','#65a367')+'</section><div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>kWh</th><th>kWh/día</th><th>'+ (year-1) +' · kWh</th><th>Días</th></tr></thead><tbody>';
  months.forEach(function(m,i){var days=Object.keys(m.days).length,n=new Date(Date.UTC(year,i+1,0)).getUTCDate();h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(!days||m.unknownConsumption||m.overlap?null:m.consumption,'kWh')+'</td><td>'+energyNumber(!days||m.unknownConsumption||m.overlap?null:m.consumption/days,'kWh')+'</td><td>'+energyNumber(!prev[i].count||prev[i].unknownConsumption||prev[i].overlap?null:prev[i].consumption,'kWh')+'</td><td>'+days+'/'+n+'</td></tr>';});
  return h+'</tbody></table></div><p class="energy-caption">No se extrapolan los días sin lectura. Un mes parcial no equivale a un mes de menor consumo.</p>';
}
function energyCostsHtml(kind,year){
  var months=energyCostMonths(energyBills(),energyContracts(),energyTaxes(),year,kind),suppliers={};
  months.forEach(function(m){m.groups.forEach(function(g){suppliers[g.supplier]=true;});});
  var h='<p class="energy-caption">Coste estimado según el consumo y la tarifa contratada, con IVA histórico. Si cambias de compañía, el consumo medio diario del mes se reparte por días de contrato.</p><section class="energy-contract energy-year-chart"><h3>Coste del consumo · €</h3>'+energyCostChart(months)+'<div class="energy-legend">';
  Object.keys(suppliers).forEach(function(s){h+='<span><i style="background:'+energySupplierColor(s)+'"></i>'+escHtml(s)+'</span>';});h+='</div><p class="energy-caption">Desliza para cambiar de año. Pulsa un tramo de barra para simular otra tarifa durante ese contrato.</p></section>';
  var estimated=0,invoiced=0,charged=0,missingCharges=false,n=0;
  h+='<div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>Estimado</th><th>Compañías / días</th></tr></thead><tbody>';
  months.forEach(function(m,i){if(m.gross!==null){estimated+=m.gross;invoiced+=m.source.gross;charged+=m.source.paid;missingCharges=missingCharges||!!m.source.unknownPaid;n++;}h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(m.gross,'€')+'</td><td>'+(m.missing.length?escHtml(m.missing.join(' · ')):m.groups.map(function(g){return escHtml(g.supplier)+' · '+g.days+'d';}).join('<br>'))+'</td></tr>';});h+='</tbody></table></div>';
  h+='<section class="energy-contract"><h3>Facturas frente a estimación</h3><p>'+n+(n===1?' mes comparable':' meses comparables')+' del período de consumo</p><div class="energy-price-view"><span>Facturado con impuestos*</span><b>'+energyNumber(n?invoiced:null,'€')+'</b></div><div class="energy-price-view"><span>Estimado por tarifa</span><b>'+energyNumber(n?estimated:null,'€')+'</b></div><div class="energy-price-view"><span>Diferencia</span><b>'+energyNumber(n?invoiced-estimated:null,'€')+'</b></div><div class="energy-price-view"><span>Cargo indicado tras saldo</span><b>'+energyNumber(n&&!missingCharges?charged:null,'€')+'</b></div><p class="energy-caption">* Facturas prorrateadas por su período, no por el mes de cobro. No acredita pagos bancarios. Descuentos, saldo y regularizaciones pueden explicar diferencias. Los meses sin tarifas o IVA importados quedan fuera.</p></section>';
  return h;
}
function energyTariffsHtml(kind){
  var contracts=energyContracts().filter(function(c){return c.kind===kind;}).sort(function(a,b){return a.start.localeCompare(b.start);});
  var h='<p class="energy-caption">Histórico importado, de solo lectura. Para corregir precios o fechas, importa un archivo actualizado. Las pruebas se hacen en Escenarios.</p>';
  if(!contracts.length)h+='<p class="sy-note">Importa tus contratos para ver su evolución.</p>';
  contracts.forEach(function(c){h+='<article class="energy-contract"><h3 style="color:'+energySupplierColor(c.supplier)+'">'+escHtml(c.supplier)+'</h3><p>'+escHtml(c.tariff)+' · '+escHtml(c.start||'Inicio pendiente')+' → '+escHtml(c.end||'Sin cierre')+'</p>';
    var periods=c.analysisPeriods&&c.analysisPeriods.length?c.analysisPeriods:(c.analysis?[{start:c.start,tariff:c.analysis}]:[]);
    periods.forEach(function(p){var t=p.tariff;h+='<div class="energy-price-view"><span>'+escHtml(p.start)+'</span><b>'+(t.modo==='fijo'?energyNumber(t.cuotaFija,'€')+'/mes':energyWeightedPrice(t).toFixed(5)+' €/kWh')+'</b></div>';});
    if(!periods.length)h+='<p class="energy-caption">Falta importar una tarifa calculable con sus fechas.</p>';
    h+='<details><summary>Precios del documento</summary>';c.prices.forEach(function(p){h+='<div class="energy-price-view"><span>'+escHtml(p.label)+'</span><b>'+p.value+' '+escHtml(p.unit)+'</b></div>';});h+='</details></article>';});
  h+='<section class="energy-contract"><h3>IVA histórico importado</h3>';
  var taxes=energyTaxes().filter(function(t){return t.kind===kind;}).sort(function(a,b){return a.start.localeCompare(b.start);});
  taxes.forEach(function(t){h+='<div class="energy-price-view"><span>Desde '+t.start+'</span><b>'+t.rate+' %</b></div>';});
  return h+(taxes.length?'':'<p class="energy-caption">Pendiente de importar. No se aplica el IVA actual al pasado por defecto.</p>')+'</section>';
}
function energyScenarioOptions(kind){
  var opts=[];energyContracts().filter(function(c){return c.kind===kind;}).forEach(function(c){
    var periods=c.analysisPeriods&&c.analysisPeriods.length?c.analysisPeriods:(c.analysis?[{start:c.start,tariff:c.analysis}]:[]);
    periods.forEach(function(p){opts.push({name:c.supplier+' · '+p.start,tariff:p.tariff});});
  });
  (DESPACHO[kind==='luz'?'electComparaciones':'gasComparaciones']||[]).forEach(function(t){opts.push({name:t.nombre||t.comercializadora||'Tarifa de escenario',tariff:energyTariffDefaults(t)});});return opts;
}
function energyComparisonHtml(kind){
  var s=ENERGY_SCENARIO,contracts=energyContracts().filter(function(c){return c.kind===kind&&c.start;});
  var h='<p class="energy-caption">Sustituye una tarifa durante un contrato o entre dos fechas. El histórico real se conserva. Cambiar el IVA también funciona sin sustituir la tarifa.</p><section class="energy-contract"><h3>Período que quieres probar</h3><div class="energy-choice-list"><label><input type="radio" name="energyArea" value=""'+(!s.contractId?' checked':'')+'> Todo el período disponible</label>';
  contracts.forEach(function(c){h+='<label><input type="radio" name="energyArea" value="'+c.id+'"'+(s.contractId===c.id?' checked':'')+'> '+escHtml(c.supplier+' · '+c.start+' → '+(c.end||'actualidad'))+'</label>';});
  h+='</div><div class="energy-range"><label>Desde<input type="date" id="energyFrom" value="'+s.start+'"></label><label>Hasta<input type="date" id="energyTo" value="'+s.end+'"></label></div></section><section class="energy-contract"><h3>Tarifa alternativa</h3><p>'+(s.tariff?escHtml(s.name):'Mantener los contratos reales')+'</p><div class="ev-io-row"><button class="ev-io-btn io-primaria" id="energyScenarioNew">'+(s.tariff?'Editar hipótesis':'Crear hipótesis')+'</button><button class="ev-io-btn" id="energyScenarioReset">Restablecer</button></div><details><summary>Elegir una tarifa guardada</summary><div class="energy-choice-list">';
  energyScenarioOptions(kind).forEach(function(o,i){h+='<button class="ev-io-btn" data-energy-option="'+i+'">'+escHtml(o.name)+'</button>';});
  h+='</div></details></section><section class="energy-contract"><h3>Impuestos</h3><div class="energy-choice-list"><label><input type="radio" name="energyVat" value="historical"'+(s.vatMode==='historical'?' checked':'')+'> IVA histórico real</label><label><input type="radio" name="energyVat" value="constant"'+(s.vatMode==='constant'?' checked':'')+'> IVA constante</label></div><label class="energy-field"'+(s.vatMode!=='constant'?' hidden':'')+'>IVA %<input id="energyConstantVat" type="number" min="0" max="100" step="any" value="'+s.vat+'"></label><label class="energy-promo"><input type="checkbox" id="energyPromos"'+(s.promos?' checked':'')+'> Incluir promociones de la tarifa</label></section>';
  var bills=energyBills(),cs=energyContracts(),taxes=energyTaxes(),base=energyCostMonths(bills,cs,taxes,ENERGY_ANALYSIS_YEAR,kind),sim=energyCostMonths(bills,cs,taxes,ENERGY_ANALYSIS_YEAR,kind,s);
  h+='<section class="energy-contract energy-year-chart"><h3>Resultado del escenario · €</h3>'+energyCostChart(sim)+'</section><table class="sy-table"><thead><tr><th>Mes</th><th>Real estimado</th><th>Escenario</th><th>Ahorro</th></tr></thead><tbody>';
  var diff=0,n=0;sim.forEach(function(m,i){var a=base[i].gross,b=m.gross;if(a!==null&&b!==null){diff+=a-b;n++;}h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(a,'€')+'</td><td>'+energyNumber(b,'€')+'</td><td>'+energyNumber(a===null||b===null?null:a-b,'€')+'</td></tr>';});
  return h+'</tbody></table><p class="sy-note">Ahorro estimado: '+energyNumber(n?diff:null,'€')+' en '+n+' meses comparables. «Sin dato» indica falta de lecturas, vigencias, precios o IVA; no significa coste cero.</p>';
}
function energyArchiveHtml(kind){
  var list=energyBills().filter(function(b){return b.kind===kind&&+b.issued.slice(0,4)===ENERGY_ANALYSIS_YEAR;}).sort(function(a,b){return b.issued.localeCompare(a.issued);});
  var h='<p class="energy-caption">Documentos de origen, solo para consulta. Importa el archivo preparado para incorporar o corregir datos sin duplicarlos.</p><button class="ev-io-btn" id="energyStudyExport">Exportar histórico</button>';
  list.forEach(function(b){h+='<details class="energy-contract"><summary>'+escHtml(b.supplier)+' · '+b.issued+'</summary><p>'+escHtml(b.number)+' · '+b.start+' → '+b.end+'</p><p>'+energyNumber(b.noReading?null:b.consumption,'kWh')+' · '+energyNumber(b.gross,'€')+' con impuestos</p><p class="energy-caption">'+escHtml(b.notes)+'</p></details>';});return h+(list.length?'':'<p>No hay documentos de este año.</p>');
}
function closeEnergyAnalysis(){cerrarPanel('energyAnalysisWrap','energyAnalysisOverlay');NAV_BACK=ENERGY_RETURN;}
function openEnergyAnalysis(kind){
  var existing=document.getElementById('energyAnalysisWrap');if(!existing)ENERGY_RETURN=NAV_BACK;
  if(ENERGY_ANALYSIS_KIND!==kind){ENERGY_SCENARIO={contractId:'',start:'',end:'',tariff:null,name:'Escenario',vatMode:'historical',vat:21,promos:false};}ENERGY_ANALYSIS_KIND=kind;
  var w=abrirPanel('energyAnalysisWrap','<div class="full-overlay energy-window" id="energyAnalysisOverlay">'+energyAnalysisHtml(kind)+'</div>',{overlay:'energyAnalysisOverlay',contenedor:document.body,alCerrar:closeEnergyAnalysis,reutilizar:true});
  NAV_BACK=closeEnergyAnalysis;bindEnergyAnalysis(w,kind);
}
function energyRefreshAnalysis(kind){if(document.getElementById('energyAnalysisWrap'))openEnergyAnalysis(kind);}
