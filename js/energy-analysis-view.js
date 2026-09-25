/* Ventana de energía: histórico de solo lectura, escenarios independientes. */
var ENERGY_ANALYSIS_TAB='resumen';
var ENERGY_ANALYSIS_YEAR=new Date().getFullYear();
var ENERGY_ANALYSIS_KIND='luz';
var ENERGY_RETURN=null;
function energyAnalysisHtml(kind){
  var year=ENERGY_ANALYSIS_YEAR,months=energyConsumptionMonths(energyBills(),year,kind);
  var h='<div class="energy-window-header"><button class="sy-back" id="energyAnalysisBack" aria-label="Volver">←</button><h2>Estudio de '+(kind==='luz'?'electricidad':'gas')+'</h2><button class="ev-io-btn" id="energyImportTop">Importar</button></div>';
  h+='<div class="econ-sub-tabs energy-tabs">';
  [['resumen','Resumen'],['consumo','Consumo'],['costes','Coste'],['tarifas','Tarifas'],['comparar','Escenarios']].forEach(function(t){h+='<button class="econ-sub-tab'+(ENERGY_ANALYSIS_TAB===t[0]?' active':'')+'" data-energy-tab="'+t[0]+'">'+t[1]+'</button>';});
  h+='</div><div class="energy-year-nav"><button class="nav-btn" data-analysis-year="-1" aria-label="Año anterior">◀</button><strong>'+year+'</strong><button class="nav-btn" data-analysis-year="1" aria-label="Año siguiente">▶</button></div><div class="sy-body">';
  h+='<div class="energy-window-content">';
  if(ENERGY_ANALYSIS_TAB==='resumen')h+=energySummaryHtml(kind,year);
  if(ENERGY_ANALYSIS_TAB==='consumo')h+=energyConsumptionHtml(kind,months,year);
  if(ENERGY_ANALYSIS_TAB==='costes')h+=energyCostsHtml(kind,year);
  if(ENERGY_ANALYSIS_TAB==='tarifas')h+=energyTariffsHtml(kind);
  if(ENERGY_ANALYSIS_TAB==='comparar')h+=energyComparisonHtml(kind,months);
  if(ENERGY_ANALYSIS_TAB==='archivo')h+=energyArchiveHtml(kind);
  return h+'</div></div><input type="file" id="energyStudyFile" accept=".json,application/json" hidden>';
}
function energyConsumptionHtml(kind,months,year){
  var prev=energyConsumptionMonths(energyBills(),year-1,kind);
  var h='<p class="energy-caption">Consumo por mes natural, repartido según los días de lectura. Desliza el gráfico para cambiar de año.</p><section class="energy-contract energy-year-chart"><h3>Consumo mensual · kWh</h3>'+energyBillsChart(months,'consumption','#65a367')+'</section><div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>kWh</th><th>Punta</th><th>Llano</th><th>Valle</th></tr></thead><tbody>';
  months.forEach(function(m,i){var days=Object.keys(m.days).length,valid=days&&!m.unknownConsumption&&!m.overlap;h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(valid?m.consumption:null,'')+'</td>';m.periods.forEach(function(v){h+='<td>'+energyNumber(valid&&m.periodDays===days?v:null,'')+'</td>';});h+='</tr>';});
  h+='</tbody></table></div><details class="energy-contract"><summary>Media diaria y comparación con '+(year-1)+'</summary><table class="sy-table"><thead><tr><th>Mes</th><th>kWh/día</th><th>Año anterior · kWh</th><th>Días</th></tr></thead><tbody>';
  months.forEach(function(m,i){var days=Object.keys(m.days).length,n=new Date(Date.UTC(year,i+1,0)).getUTCDate();h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(!days||m.unknownConsumption||m.overlap?null:m.consumption/days,'')+'</td><td>'+energyNumber(!Object.keys(prev[i].days).length||prev[i].unknownConsumption||prev[i].overlap?null:prev[i].consumption,'')+'</td><td>'+days+'/'+n+'</td></tr>';});
  return h+'</tbody></table></details><p class="energy-caption">No se extrapolan días sin lectura. Si falta desglose por tramos no se reparte a partes iguales.</p><details class="energy-contract"><summary>Facturas de origen</summary>'+energyArchiveHtml(kind)+'</details>';
}
function energyCostsHtml(kind,year){
  var bills=energyBills(),contracts=energyContracts(),taxes=energyTaxes(),real=energyCostMonths(bills,contracts,taxes,year,kind),months=energyCostMonths(bills,contracts,taxes,year,kind,{vatMode:ENERGY_COST_VAT,vat:ENERGY_COST_RATE}),suppliers={};
  months.forEach(function(m){m.groups.forEach(function(g){suppliers[g.supplier]=true;});});
  var label=ENERGY_COST_VAT==='historical'?'IVA real':ENERGY_COST_VAT==='none'?'Sin IVA':'IVA cte '+ENERGY_COST_RATE+' %';
  var h='<div class="energy-tax-controls"><label><input id="energyVatCycle" type="checkbox"'+(ENERGY_COST_VAT!=='none'?' checked':'')+'> '+label+'</label><label>IVA cte % <input id="energyCostRate" type="number" min="0" max="100" value="'+ENERGY_COST_RATE+'"></label></div><p class="energy-caption">Cada pulsación cambia: IVA real → sin IVA → IVA constante. El consumo medio diario mensual se reparte entre las compañías según sus días de contrato. El IVA histórico procede de los períodos importados.</p><section class="energy-contract energy-year-chart"><h3>Coste mensual estimado · €</h3>'+energyVatStrip(months,year)+energyCostChart(months)+'<div class="energy-legend">';
  Object.keys(suppliers).forEach(function(x){h+='<span><i style="background:'+energySupplierColor(x)+'"></i>'+escHtml(x)+'</span>';});h+='</div></section>';
  if(contracts.some(function(c){return c.kind===kind&&energyContractPeriods(c).some(function(p){return p.tariff.servicesPerDay>0;});}))h+='<p class="energy-caption">La franja indica el IVA del suministro. Los servicios con IVA propio conservan su porcentaje en modo real; IVA constante y sin IVA se aplican a todos los conceptos.</p>';
  var estimate=0,covered=0,comparable=0;real.forEach(function(m){if(m.gross!==null){estimate+=m.gross;covered+=m.days;comparable++;}});
  var issued=bills.filter(function(b){return b.kind===kind&&+b.issued.slice(0,4)===year;}),total=issued.reduce(function(n,b){return n+b.gross;},0),diff=comparable&&issued.length?estimate-total:null;
  h+='<section class="energy-contract"><h3>Estimado frente a facturas · '+year+'</h3><div class="energy-metrics">'+energyMetric('Estimado · IVA real',energyNumber(comparable?estimate:null,'€'),covered+' días calculables')+energyMetric('Real · suma de facturas',energyNumber(issued.length?total:null,'€'),issued.length+' facturas emitidas en el año')+energyMetric('Diferencia estimado − real',energyNumber(diff,'€'),diff!==null&&total!==0?(diff/Math.abs(total)*100).toFixed(1)+' %':'')+'</div><p class="energy-caption">Esta comparación siempre usa IVA histórico, aunque cambies el gráfico. La emisión y el consumo pueden caer en años distintos; huecos, cuotas, descuentos y regularizaciones también afectan a la diferencia. No representa un error de cálculo aislado ni pagos bancarios.</p></section>';
  h+='<div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>Estimado</th><th>Cobertura / compañías</th></tr></thead><tbody>';
  months.forEach(function(m,i){h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(m.gross,'€')+'</td><td>'+escHtml(m.missing.length?m.missing.join(' · '):m.groups.map(function(g){return g.supplier+' · '+g.days+'d';}).join(' / '))+'</td></tr>';});return h+'</tbody></table></div>';
}
function energyTariffsHtml(kind){
  var contracts=energyContracts().filter(function(c){return c.kind===kind&&(!c.start||c.start<=ENERGY_ANALYSIS_YEAR+'-12-31')&&(!c.end||c.end>=ENERGY_ANALYSIS_YEAR+'-01-01');}).sort(function(a,b){return b.start.localeCompare(a.start);});
  var h='<p class="energy-caption">Tarifas del año seleccionado, de solo lectura. Precios sin impuestos. Las correcciones se incorporan importando un archivo actualizado.</p>';
  contracts.forEach(function(c){h+='<article class="energy-contract"><h3 style="color:'+energySupplierColor(c.supplier)+'">'+escHtml(c.supplier)+'</h3><p>'+escHtml(c.tariff)+' · '+escHtml(c.start||'Inicio pendiente')+' → '+escHtml(c.end||'actualidad')+'</p>';
    var periods=energyCommercialPeriods(c).slice().sort(function(a,b){return b.start.localeCompare(a.start);});
    periods.forEach(function(p,i){var t=p.tariff;h+='<details class="energy-tariff-period"'+(!i?' open':'')+'><summary>'+escHtml(p.start)+' → '+escHtml(p.end||'actualidad')+'</summary><h4>Consumo</h4>';
      if(t.modo==='fijo')h+='<p>Cuota fija: <b>'+energyNumber(t.cuotaFija,'€')+'/mes</b></p>';
      else if(t.energyMode==='tramos'){['Punta','Llano','Valle'].forEach(function(n,j){h+='<div class="energy-price-view"><span>'+n+' · '+t.periodWeights[j].toFixed(1)+' %</span><b>'+t.periodPrices[j].toFixed(6)+' €/kWh</b></div>';});h+='<p class="energy-caption">Media ponderada: '+energyWeightedPrice(t).toFixed(6)+' €/kWh</p>';}
      else h+='<p><b>'+t.precioKwh.toFixed(6)+' €/kWh</b></p>';
      if(kind==='luz'){h+='<h4>Potencia</h4>';['P1','P2'].forEach(function(n){h+='<div class="energy-price-view"><span>'+n+' · '+(t['potencia'+n]||t.potenciaTotal)+' kW</span><b>'+t['precioPot'+n].toFixed(6)+' €/kW/día</b></div>';});}
      h+='<details><summary>Cargos e impuestos por fecha</summary>';
      var previous='';p.variants.forEach(function(v){var f=v.tariff,key=JSON.stringify([f.terminoFijo,f.terminoFijoDia,f.extrasPerDay||0,f.servicesPerDay||0,f.servicesVatPct,f.otherTaxPct,f.otherTaxKwh]);if(key===previous)return;previous=key;
        h+='<div class="energy-fee-period"><b>Desde '+escHtml(v.start)+'</b><p>Cargos fijos: '+energyNumber(f.terminoFijo,'€')+'/mes · '+f.terminoFijoDia.toFixed(5)+' €/día</p>';
        if(f.extrasPerDay)h+='<p>Alquiler y servicios: '+f.extrasPerDay.toFixed(5)+' €/día</p>';
        if(f.servicesPerDay)h+='<p>Servicios con IVA propio: '+f.servicesPerDay.toFixed(5)+' €/día'+(f.servicesVatPct==null?'':' + '+f.servicesVatPct+' % IVA')+'</p>';
        h+='<p class="energy-caption">Impuesto eléctrico: '+f.otherTaxPct+' % + '+f.otherTaxKwh+' €/kWh. IVA según el período.</p></div>';
      });h+='</details></details>';});
    if(!periods.length)h+='<p class="energy-caption">Falta importar una tarifa calculable con sus fechas.</p>';
    h+='<details><summary>Precios y notas del documento</summary>';c.prices.forEach(function(p){h+='<div class="energy-price-view"><span>'+escHtml(p.label)+'</span><b>'+p.value+' '+escHtml(p.unit)+'</b></div>';});h+='<p class="energy-caption">'+escHtml(c.notes)+'</p></details></article>';});
  return h+(contracts.length?'':'<p class="sy-note">No hay contratos importados para este año.</p>');
}
function energyScenarioOptions(kind){
  var opts=[];energyContracts().filter(function(c){return c.kind===kind;}).forEach(function(c){
    var periods=energyCommercialPeriods(c);
    periods.forEach(function(p){opts.push({name:c.supplier+' · '+p.start,tariff:p.tariff});});
  });
  (DESPACHO[kind==='luz'?'electComparaciones':'gasComparaciones']||[]).forEach(function(t){opts.push({name:t.nombre||t.comercializadora||'Tarifa de escenario',tariff:energyTariffDefaults(t)});});return opts;
}
function energyComparisonHtml(kind){
  var year=ENERGY_ANALYSIS_YEAR,bills=energyBills(),cs=energyContracts(),taxes=energyTaxes(),base=energyCostMonths(bills,cs,taxes,year,kind),vat=energyCostMonths(bills,cs,taxes,year,kind,{vatMode:'constant',vat:ENERGY_COMPARE_VAT});
  var h='<section class="energy-contract energy-year-chart"><h3>Si el IVA hubiera sido siempre el mismo</h3><label class="energy-inline-input">IVA % <input id="energyCompareVat" type="number" min="0" max="100" step="any" value="'+ENERGY_COMPARE_VAT+'"></label>'+energyCompareChart(base,vat)+energyCompareTable(base,vat)+'</section>';
  var options=energyScenarioOptions(kind),choice=options[ENERGY_COMPARE_TARIFF]||options[0];
  h+='<section class="energy-contract energy-year-chart"><h3>Si hubiera mantenido una tarifa</h3><details class="energy-tariff-choices"><summary>'+escHtml(choice?choice.name:'Importa una tarifa para comparar')+'</summary><div class="energy-choice-list">';
  options.forEach(function(o,i){h+='<button class="ev-io-btn" data-energy-compare-tariff="'+i+'">'+escHtml(o.name)+'</button>';});h+='</div></details>';
  if(choice){var sim=energyCostMonths(bills,cs,taxes,year,kind,{tariff:choice.tariff,name:choice.name,vatMode:'historical'});h+='<p class="energy-caption">Toda la cobertura del año con esta tarifa, conservando el IVA histórico y el consumo. Usa los últimos cargos e impuesto eléctrico documentados dentro de la tarifa elegida.</p>'+energyCompareChart(base,sim)+energyCompareTable(base,sim);}return h+'</section>';
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
