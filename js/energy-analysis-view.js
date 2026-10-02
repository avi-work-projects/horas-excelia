/* Ventana de energía: histórico de solo lectura, escenarios independientes. */
var ENERGY_ANALYSIS_TAB='resumen';
var ENERGY_ANALYSIS_YEAR=new Date().getFullYear();
var ENERGY_SUMMARY_TOTAL=false;
var ENERGY_ANALYSIS_KIND='luz';
var ENERGY_RETURN=null;
var ENERGY_ANALYSIS_TABS=[['resumen','Resumen'],['consumo','Consumo'],['costes','Coste'],['tarifas','Tarifas'],['comparar','Escenarios']];
function energyAnalysisHtml(kind){
  var year=ENERGY_ANALYSIS_YEAR,months=energyConsumptionMonths(energyBills(),year,kind);
  var h=renderNavBar('household');
  h+='<div class="energy-window-header"><button class="sy-back" id="energyAnalysisBack" aria-label="Volver">←</button><h2>Estudio de '+(kind==='luz'?'electricidad':'gas')+'</h2><button class="ev-io-btn energy-import-button" id="energyImportTop" aria-label="Importar datos" title="Importar datos">Importar</button></div>';
  h+='<div class="econ-sub-tabs energy-tabs">';
  ENERGY_ANALYSIS_TABS.forEach(function(t){h+='<button class="econ-sub-tab'+(ENERGY_ANALYSIS_TAB===t[0]?' active':'')+'" data-energy-tab="'+t[0]+'" aria-pressed="'+(ENERGY_ANALYSIS_TAB===t[0])+'">'+t[1]+'</button>';});
  h+='</div><div class="energy-year-nav"><button class="nav-btn" data-analysis-year="-1" aria-label="Año anterior">◀</button><strong>'+year+'</strong><button class="nav-btn" data-analysis-year="1" aria-label="Año siguiente">▶</button>'+(ENERGY_ANALYSIS_TAB==='resumen'?'<button class="energy-total-button" id="energySummaryTotal" aria-pressed="'+ENERGY_SUMMARY_TOTAL+'">Total</button>':'')+'</div><div class="sy-body">';
  h+='<div class="energy-window-content" data-energy-view="'+ENERGY_ANALYSIS_TAB+'">';
  if(ENERGY_ANALYSIS_TAB==='resumen')h+=energySummaryHtml(kind,ENERGY_SUMMARY_TOTAL?null:year);
  if(ENERGY_ANALYSIS_TAB==='consumo')h+=energyConsumptionHtml(kind,months,year);
  if(ENERGY_ANALYSIS_TAB==='costes')h+=energyCostsHtml(kind,year);
  if(ENERGY_ANALYSIS_TAB==='tarifas')h+=energyTariffsHtml(kind);
  if(ENERGY_ANALYSIS_TAB==='comparar')h+=energyComparisonHtml(kind,months);
  if(ENERGY_ANALYSIS_TAB==='archivo')h+=energyArchiveHtml(kind);
  return h+'</div></div><input type="file" id="energyStudyFile" accept=".json,application/json" hidden>';
}
function energyConsumptionHtml(kind,months,year){
  var prev=energyConsumptionMonths(energyBills(),year-1,kind);
  var h='<section class="energy-contract energy-year-chart">'+energySectionTitle('Consumo mensual','kWh · desliza para cambiar de año')+energyBillsChart(months,'consumption','#65a367')+'</section><section class="energy-contract">'+energySectionTitle('Lecturas por mes',kind==='luz'?'Total y tramos':'kWh')+'<div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>kWh</th>'+(kind==='luz'?'<th>Punta</th><th>Llano</th><th>Valle</th>':'')+'</tr></thead><tbody>';
  months.forEach(function(m,i){var days=Object.keys(m.days).length,valid=days&&!m.unknownConsumption&&!m.overlap;h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(valid?m.consumption:null,'',0)+'</td>';if(kind==='luz')m.periods.forEach(function(v){h+='<td>'+energyNumber(valid&&m.periodDays===days?v:null,'',0)+'</td>';});h+='</tr>';});
  h+='</tbody></table></div></section><details class="energy-contract"><summary>Medias y comparación con '+(year-1)+'</summary><table class="sy-table"><thead><tr><th>Mes</th><th>kWh/día</th><th>Año anterior · kWh</th><th>Días</th></tr></thead><tbody>';
  months.forEach(function(m,i){var days=Object.keys(m.days).length,n=new Date(Date.UTC(year,i+1,0)).getUTCDate();h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(!days||m.unknownConsumption||m.overlap?null:m.consumption/days,'',1)+'</td><td>'+energyNumber(!Object.keys(prev[i].days).length||prev[i].unknownConsumption||prev[i].overlap?null:prev[i].consumption,'',0)+'</td><td>'+days+'/'+n+'</td></tr>';});
  return h+'</tbody></table></details>'+energyInfoHtml('Cómo se distribuye el consumo','<p>Los acumulados se distribuyen por días entre lecturas; no se extrapolan días sin cubrir.'+(kind==='luz'?' Si falta desglose por tramos no se reparte a partes iguales.':' Una cuota fija sin nueva lectura permite calcular el coste, pero no implica un consumo de cero.')+'</p>')+'<details class="energy-contract"><summary>Facturas de origen</summary>'+energyArchiveHtml(kind)+'</details>';
}
function energyCostsHtml(kind,year){
  var bills=energyBills(),contracts=energyContracts(),taxes=energyTaxes(),real=energyCostMonths(bills,contracts,taxes,year,kind),months=energyCostMonths(bills,contracts,taxes,year,kind,{vatMode:ENERGY_COST_VAT,vat:ENERGY_COST_RATE}),suppliers={};
  months.forEach(function(m){m.groups.forEach(function(g){suppliers[g.supplier]=true;});});
  var label=ENERGY_COST_VAT==='historical'?'IVA real':ENERGY_COST_VAT==='none'?'Sin IVA':'IVA cte '+ENERGY_COST_RATE+' %';
  var h='<section class="energy-contract energy-year-chart">'+energySectionTitle('Coste mensual','Estimado · €')+'<div class="energy-tax-controls"><label><input id="energyVatCycle" type="checkbox"'+(ENERGY_COST_VAT!=='none'?' checked':'')+'> '+label+'</label><label'+(ENERGY_COST_VAT!=='constant'?' hidden':'')+'>IVA % <input id="energyCostRate" type="number" min="0" max="100" value="'+ENERGY_COST_RATE+'"></label></div>'+energyVatStrip(months,year)+energyCostChart(months)+'<div class="energy-legend">';
  Object.keys(suppliers).forEach(function(x){h+='<span><i style="background:'+energySupplierColor(x)+'"></i>'+escHtml(x)+'</span>';});h+='</div></section>';
  var comparison=energyReconcile(bills,real,year,kind),diff=comparison.difference,total=comparison.actual;
  h+='<section class="energy-contract">'+energySectionTitle('Estimado y facturado',comparison.days+' días comparables')+'<div class="energy-metrics energy-reconciliation">'+energyMetric('Estimado · IVA real',energyNumber(comparison.estimate,'€'),'')+energyMetric('Facturado',energyNumber(total,'€'),'Solo suministro')+energyMetric('Diferencia',energyNumber(diff,'€'),diff!==null&&total!==0?(diff/Math.abs(total)*100).toFixed(1)+' % del facturado':'')+'</div>';
  if(comparison.omitted)h+='<p class="energy-coverage-note">'+comparison.omitted+' días excluidos por datos incompletos.</p>';
  h+=energyInfoHtml('Criterios y totales de facturación','<p>Se comparan los mismos días de consumo con IVA histórico, aunque la factura o el abono se emitiesen en otro año. Se excluyen mantenimiento y otros servicios. Las cuotas fijas pueden calcularse sin lectura.</p><p>Por fecha de emisión: suministro '+energyNumber(comparison.issuedSupply,'€')+' · servicios adicionales '+energyNumber(comparison.services,'€')+'.</p>')+'</section>';
  var table='<div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>Estimado</th><th>Cobertura / compañías</th></tr></thead><tbody>';
  months.forEach(function(m,i){table+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(m.gross,'€')+'</td><td>'+escHtml(m.missing.length?m.missing.join(' · '):m.groups.map(function(g){return g.supplier+' · '+g.days+'d';}).join(' / '))+'</td></tr>';});
  return h+energyInfoHtml('Detalle mensual',table+'</tbody></table></div>')+energyInfoHtml('Cómo se calcula','<p>El consumo medio diario mensual se reparte entre compañías según sus días de contrato. El IVA histórico procede de los períodos importados.</p><p>Pulsa la casilla de IVA para alternar: real, sin IVA o constante.</p>');
}
function energyTariffsHtml(kind){
  var contracts=energyContracts().filter(function(c){return c.kind===kind&&energyContractInYear(c,ENERGY_ANALYSIS_YEAR);}).sort(function(a,b){return b.start.localeCompare(a.start);});
  var profile=energyUsageProfile(kind,ENERGY_ANALYSIS_YEAR),taxes=energyTaxes();
  var h='<div class="energy-reference-strip"><strong>Comparar en las mismas condiciones</strong><div><span>'+profile.monthlyKwh+' kWh</span><span>30 días</span>'+(kind==='luz'?'<span>3,3 kW</span>':'')+'</div>'+energyInfoHtml('Origen de la referencia','<p>'+escHtml(profile.source)+'.'+(kind==='luz'?' Potencia de 3,3 kW en P1/P2.':'')+' Sin servicios adicionales. Primero se muestra el precio sin impuestos; debajo, el total con los impuestos de su fecha.</p>')+'</div>';
  contracts.forEach(function(c){h+='<article class="energy-contract energy-tariff-card" style="--supplier-color:'+energySupplierColor(c.supplier)+'"><div class="energy-tariff-heading"><h3>'+escHtml(c.supplier)+'</h3>'+(!c.end&&c.start<=evDk(new Date())?'<span class="energy-status-pill">Actual</span>':'')+'</div><p>'+escHtml(c.tariff)+'</p>';
    var periods=energyCommercialPeriods(c).slice().sort(function(a,b){return b.start.localeCompare(a.start);});
    periods.filter(function(p){return p.start<=ENERGY_ANALYSIS_YEAR+'-12-31'&&(!p.end||p.end>=ENERGY_ANALYSIS_YEAR+'-01-01');}).forEach(function(p){
      var date=[p.end||evDk(new Date()),ENERGY_ANALYSIS_YEAR+'-12-31'].sort()[0];if(date<p.start)date=p.start;
      var t=energyContractTariff(c,date)||p.tariff,vat=energyVatAt(taxes,kind,date);
      h+='<details class="energy-tariff-period"><summary><span class="energy-tariff-dates">'+_rutFmt(p.start)+' – '+(p.end?_rutFmt(p.end):'actualidad')+'<span aria-hidden="true">⌄</span></span>'+energyTariffReferenceHtml(kind,t,profile,vat)+'</summary><p class="energy-caption">Referencia fiscal: '+_rutFmt(date)+' · '+(vat===null?'Falta el IVA importado':'IVA '+vat+' %')+'. Precios de origen sin impuestos.'+(t.energyMode==='tramos'&&profile.hasWeights?' La referencia usa tu reparto de consumo: '+energyDisplayWeights(profile.weights).join(' / ')+' %.':'')+'</p><h4>Consumo</h4>';
      if(t.modo==='fijo')h+='<p>Cuota fija: <b>'+energyNumber(t.cuotaFija,'€')+'/mes</b></p>';
      else if(t.energyMode==='tramos'){var weights=energyDisplayWeights(t.periodWeights);['Punta','Llano','Valle'].forEach(function(n,j){h+='<div class="energy-price-view"><span>'+n+' · '+weights[j]+' %</span><b>'+energyUnitPrice(t.periodPrices[j])+' €/kWh</b></div>';});h+=energyPriceTotal('Media ponderada',energyWeightedPrice(t),'€/kWh');}
      else h+='<p><b>'+energyUnitPrice(t.precioKwh)+' €/kWh</b></p>';
      if(kind==='luz'){h+='<h4>Potencia</h4>';(t.modoPotencia==='doble'?['P1','P2']:['P1']).forEach(function(n){h+='<div class="energy-price-view"><span>'+n+' · '+(t['potencia'+n]||t.potenciaTotal)+' kW</span><b>'+energyUnitPrice(t['precioPot'+n])+' €/kW/día</b></div>';});if(t.modoPotencia==='doble')h+=energyPriceTotal('Suma precios potencia',t.precioPotP1+t.precioPotP2,'€/kW/día');}
      h+='<details><summary>Cargos e impuestos por fecha</summary>';
      var previous='';p.variants.forEach(function(v,vi){var end=p.variants[vi+1]?energyDate(energyUtc(p.variants[vi+1].start)-1):p.end;if(v.start>ENERGY_ANALYSIS_YEAR+'-12-31'||(end&&end<ENERGY_ANALYSIS_YEAR+'-01-01'))return;var f=v.tariff,key=JSON.stringify([f.terminoFijo,f.terminoFijoDia,f.extrasPerDay||0,f.servicesPerDay||0,f.servicesVatPct,f.otherTaxPct,f.otherTaxKwh]);if(key===previous)return;previous=key;
        h+='<div class="energy-fee-period"><b>Desde '+escHtml(v.start)+'</b><p>Cargos fijos: '+energyNumber(f.terminoFijo,'€')+'/mes · '+energyUnitPrice(f.terminoFijoDia)+' €/día</p>';
        if(f.extrasPerDay)h+='<p>Alquiler y otros cargos del suministro: '+energyUnitPrice(f.extrasPerDay)+' €/día</p>';
        if(f.servicesPerDay)h+='<p>Servicios ajenos al suministro (excluidos del estudio): '+energyUnitPrice(f.servicesPerDay)+' €/día'+(f.servicesVatPct==null?'':' + '+f.servicesVatPct+' % IVA')+'</p>';
        h+='<p class="energy-caption">'+(kind==='luz'?'Impuesto eléctrico':'Impuesto de hidrocarburos')+': '+f.otherTaxPct+' % + '+energyUnitPrice(f.otherTaxKwh)+' €/kWh. IVA según el período.</p></div>';
      });h+='</details></details>';});
    if(!periods.length)h+='<p class="energy-caption">Falta importar una tarifa calculable con sus fechas.</p>';
    h+='<details><summary>Precios y notas del documento</summary>';c.prices.forEach(function(p){h+='<div class="energy-price-view"><span>'+escHtml(p.label)+'</span><b>'+p.value+' '+escHtml(p.unit)+'</b></div>';});h+='<p class="energy-caption">'+escHtml(c.notes)+'</p></details></article>';});
  return h+(contracts.length?'':'<p class="sy-note">No hay contratos importados para este año.</p>');
}
function energyScenarioOptions(kind){
  var opts=energyHistoricalTariffs(kind);
  (DESPACHO[kind==='luz'?'electComparaciones':'gasComparaciones']||[]).forEach(function(t){opts.push({name:t.nombre||t.comercializadora||'Tarifa de escenario',tariff:energyTariffDefaults(t)});});return opts;
}
function energyComparisonHtml(kind){
  var year=ENERGY_ANALYSIS_YEAR,bills=energyBills(),cs=energyContracts(),taxes=energyTaxes(),base=energyCostMonths(bills,cs,taxes,year,kind),vat=energyCostMonths(bills,cs,taxes,year,kind,{vatMode:'constant',vat:ENERGY_COMPARE_VAT});
  var h='<section class="energy-contract energy-year-chart">'+energySectionTitle('Un mismo IVA todo el año','Escenario 1')+'<label class="energy-inline-input">IVA constante <span><input id="energyCompareVat" type="number" min="0" max="100" step="any" value="'+ENERGY_COMPARE_VAT+'"> %</span></label>'+energyCompareChart(base,vat)+energyCompareTable(base,vat)+'</section>';
  var options=energyScenarioOptions(kind),choice=options[ENERGY_COMPARE_TARIFF]||options[0];
  h+='<section class="energy-contract energy-year-chart">'+energySectionTitle('Una misma tarifa todo el año','Escenario 2')+'<details class="energy-tariff-choices"><summary>'+escHtml(choice?choice.name:'Importa una tarifa para comparar')+'</summary><div class="energy-choice-list">';
  options.forEach(function(o,i){h+='<button class="ev-io-btn" data-energy-compare-tariff="'+i+'">'+escHtml(o.name)+'</button>';});h+='</div></details>';
  if(choice){var sim=energyCostMonths(bills,cs,taxes,year,kind,{tariff:choice.tariff,name:choice.name,vatMode:'historical'});h+=energyCompareChart(base,sim)+energyCompareTable(base,sim)+energyInfoHtml('Condiciones del escenario','<p>Mismo consumo, cobertura e IVA histórico. Se aplican los últimos cargos e impuesto eléctrico documentados dentro de la tarifa elegida.</p>');}return h+'</section>';
}
function energyArchiveHtml(kind){
  var list=energyBills().filter(function(b){return b.kind===kind&&+b.issued.slice(0,4)===ENERGY_ANALYSIS_YEAR;}).sort(function(a,b){return b.issued.localeCompare(a.issued);});
  var h='<p class="energy-caption">Documentos de origen, solo para consulta. Importa el archivo preparado para incorporar o corregir datos sin duplicarlos.</p><button class="ev-io-btn" id="energyStudyExport">Exportar histórico</button>';
  list.forEach(function(b){h+='<details class="energy-contract"><summary>'+escHtml(b.supplier)+' · '+b.issued+'</summary><p>'+escHtml(b.number)+' · '+b.start+' → '+b.end+'</p><p>'+energyNumber(b.noReading?null:b.consumption,'kWh')+' · '+energyNumber(b.gross,'€')+' con impuestos</p><p class="energy-caption">'+escHtml(b.notes)+'</p></details>';});return h+(list.length?'':'<p>No hay documentos de este año.</p>');
}
function closeEnergyAnalysis(){cerrarPanel('energyAnalysisWrap','energyAnalysisOverlay');NAV_BACK=ENERGY_RETURN;}
function openEnergyAnalysis(kind){
  var existing=document.getElementById('energyAnalysisWrap');if(!existing)ENERGY_RETURN=NAV_BACK;
  ENERGY_ANALYSIS_KIND=kind;
  var w=abrirPanel('energyAnalysisWrap','<div class="full-overlay energy-window" id="energyAnalysisOverlay">'+energyAnalysisHtml(kind)+'</div>',{overlay:'energyAnalysisOverlay',contenedor:document.body,alCerrar:closeEnergyAnalysis,reutilizar:true});
  NAV_BACK=closeEnergyAnalysis;bindEnergyAnalysis(w,kind);
}
function energyRefreshAnalysis(kind){if(document.getElementById('energyAnalysisWrap'))openEnergyAnalysis(kind);}
