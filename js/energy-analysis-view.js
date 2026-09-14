var ENERGY_ANALYSIS_TAB='consumo';
var ENERGY_ANALYSIS_YEAR=new Date().getFullYear();
var ENERGY_ANALYSIS_PROMOS=false;
var ENERGY_ANALYSIS_SELECTED={luz:'',gas:''};
function energyAnalysisHtml(kind){
  var year=ENERGY_ANALYSIS_YEAR,months=energyConsumptionMonths(energyBills(),year,kind);
  var h='<div class="sheet-handle"></div><div class="energy-history-heading"><button class="sy-back" id="energyAnalysisBack" aria-label="Volver">←</button><h2>Estudio de '+(kind==='luz'?'electricidad':'gas')+'</h2></div><div class="econ-sub-tabs">';
  [['consumo','Consumo'],['tarifas','Tarifas'],['comparar','Comparar']].forEach(function(t){h+='<button class="econ-sub-tab'+(ENERGY_ANALYSIS_TAB===t[0]?' active':'')+'" data-energy-tab="'+t[0]+'">'+t[1]+'</button>';});
  h+='</div><div class="energy-year-nav"><button class="nav-btn" data-analysis-year="-1" aria-label="Año anterior">◀</button><strong>'+year+'</strong><button class="nav-btn" data-analysis-year="1" aria-label="Año siguiente">▶</button></div>';
  if(ENERGY_ANALYSIS_TAB==='consumo')h+=energyConsumptionHtml(kind,months,year);
  if(ENERGY_ANALYSIS_TAB==='tarifas')h+=energyTariffsHtml(kind);
  if(ENERGY_ANALYSIS_TAB==='comparar')h+=energyComparisonHtml(kind,months);
  return h+'<div class="ev-io-row"><button class="ev-io-btn" id="energyAnalysisBills">Ver facturas / importar</button><button class="ev-io-btn" id="energyAnalysisContracts">Contratos</button></div>';
}
function energyConsumptionHtml(kind,months,year){
  var prev=energyConsumptionMonths(energyBills(),year-1,kind);
  var h='<p class="energy-caption">Estimación por mes de consumo: cada factura se reparte uniformemente entre sus días. Se conservan los documentos y sus importes originales.</p><section class="energy-contract"><h3>Consumo mensual · kWh</h3>'+energyBillsChart(months,'consumption','#65a367')+'</section><section class="energy-contract"><h3>Coste mensual con impuestos</h3>'+energyBillsChart(months,'gross','#b78528')+'</section><div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>kWh</th><th>kWh/día</th><th>'+ (year-1) +' · kWh</th><th>Cobertura</th></tr></thead><tbody>';
  months.forEach(function(m,i){var days=Object.keys(m.days).length,n=new Date(Date.UTC(year,i+1,0)).getUTCDate();h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(!days||m.unknownConsumption?null:m.consumption,'kWh')+'</td><td>'+energyNumber(!days||m.unknownConsumption?null:m.consumption/days,'kWh')+'</td><td>'+energyNumber(!prev[i].count||prev[i].unknownConsumption?null:prev[i].consumption,'kWh')+'</td><td>'+days+'/'+n+(m.overlap?' · solapamiento':'')+'</td></tr>';});
  return h+'</tbody></table></div><p class="energy-caption">La cobertura evita confundir meses parciales con menor consumo. Las facturas sin lectura no permiten deducir tus hábitos horarios; los pesos de P1/P2/P3 son configurables.</p>';
}
function energyTariffsHtml(kind){
  var contracts=energyContracts().filter(function(c){return c.kind===kind;}).sort(function(a,b){return a.start.localeCompare(b.start);});
  var taxes=energyTaxes().filter(function(r){return r.kind===kind;}).sort(function(a,b){return a.start.localeCompare(b.start);});
  var h='<p class="energy-caption">Evolución de tus contratos. Configura una tarifa comparable sin alterar los precios originales. Los cambios de precio dentro de una compañía pueden tener contratos separados.</p>';
  h+='<button class="ev-io-btn" id="energyCurrentCopy">Incorporar tarifa del análisis actual</button>';
  if(!contracts.length)h+='<p>No hay contratos. Añádelos o importa tu histórico desde Facturas.</p>';
  contracts.forEach(function(c){h+='<article class="energy-contract"><div class="hip-section-hdr"><strong>'+escHtml(c.supplier)+'</strong><button class="hip-edit-btn" data-analysis-contract="'+c.id+'">'+(c.analysis?'Editar tarifa':'Configurar tarifa')+'</button></div><p>'+escHtml(c.tariff)+' · '+escHtml(c.start||'Inicio sin fecha')+' → '+escHtml(c.end||'Sin cierre')+'</p>';
    if(c.analysis){var t=c.analysis;h+='<p>'+ (t.modo==='fijo'?energyNumber(t.cuotaFija,'€')+'/mes (cuota fija)':energyWeightedPrice(t).toFixed(5)+' €/kWh'+(t.energyMode==='tramos'?' · media ponderada':''))+' · sin IVA</p><button class="ev-io-btn" data-energy-send="'+c.id+'">Usar en escenarios</button>';}else h+='<p class="energy-caption">Pendiente de configurar para comparar.</p>';h+='</article>';});
  var variable=contracts.filter(function(c){return c.analysis&&c.analysis.modo!=='fijo';});
  if(variable.length)h+='<section class="energy-contract"><h3>Precio del consumo · sin IVA</h3>'+hBarRows(variable.map(function(c){return {label:c.supplier+' · '+(c.start||'sin fecha'),value:Math.round(energyWeightedPrice(c.analysis)*100000)/1000,color:'#b78528'};}),{suffix:' c€/kWh'})+'</section>';
  h+='<section class="energy-contract"><div class="hip-section-hdr"><h3>Evolución del IVA</h3><button class="hip-edit-btn" id="energyTaxEdit">Editar</button></div>';
  if(!taxes.length)h+='<p class="energy-caption">Sin períodos de IVA. Añade los porcentajes aplicables a tu suministro; no se presupone un IVA histórico.</p>';
  taxes.forEach(function(r,i){h+='<div class="energy-price-view"><span>'+r.start+' → '+(taxes[i+1]?energyDate(energyUtc(taxes[i+1].start)-1):'en adelante')+'</span><b>'+r.rate+' %</b></div>';});
  return h+'</section>';
}
function energyComparisonHtml(kind,months){
  var contracts=energyContracts().filter(function(c){return c.kind===kind&&c.analysis;});
  if(!contracts.length)return '<p class="sy-note">Configura una tarifa en «Tarifas» para aplicarla a tu consumo registrado.</p>';
  var chosen=contracts.find(function(c){return c.id===ENERGY_ANALYSIS_SELECTED[kind];})||contracts[0];
  var h='<p class="energy-caption">¿Y si hubieras mantenido este contrato? Se aplica al mismo consumo y días disponibles de cada mes. IVA histórico por fecha; otros impuestos según la aproximación configurada en la tarifa.</p><div class="energy-choice-list">';
  contracts.forEach(function(c){h+='<label><input type="radio" name="energyComparison" value="'+c.id+'"'+(c.id===chosen.id?' checked':'')+'> '+escHtml(c.supplier+' · '+(c.tariff||c.start))+'</label>';});
  h+='</div><label class="energy-promo"><input type="checkbox" id="energyPromos"'+(ENERGY_ANALYSIS_PROMOS?' checked':'')+'> Incluir promociones mensuales</label><div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>Facturado*</th><th>Simulado</th><th>Diferencia**</th></tr></thead><tbody>';
  var real=0,sim=0,n=0,taxes=energyTaxes();
  months.forEach(function(m,i){if(!m.count)return;var result=energySimulateMonth(m,chosen.analysis,kind,taxes,ENERGY_ANALYSIS_PROMOS),value=result?result.gross:null;var complete=Object.keys(m.days).length===new Date(Date.UTC(ENERGY_ANALYSIS_YEAR,i+1,0)).getUTCDate();
    if(value!==null){real+=m.gross;sim+=value;n++;}
    h+='<tr><td>'+MN_SHORT[i]+(complete?'':' · parcial')+'</td><td>'+energyNumber(m.gross,'€')+'</td><td>'+energyNumber(value,'€')+'</td><td>'+energyNumber(value===null?null:m.gross-value,'€')+'</td></tr>';});
  h+='</tbody></table></div><p class="energy-caption">* Importe con impuestos repartido por días, antes de saldo/promociones externas. ** Positiva: habrías pagado menos. Sin dato: falta consumo, hay solapamientos o falta IVA para esas fechas.</p>';
  if(n)h+='<section class="energy-contract"><h3>'+n+(n===1?' mes comparable':' meses comparables')+'</h3><p>Facturado: '+energyNumber(real,'€')+' · Simulado: '+energyNumber(sim,'€')+'</p><strong>Diferencia: '+energyNumber(real-sim,'€')+'</strong></section>';
  return h;
}
function openEnergyAnalysis(kind){
  var w=abrirPanel('energyAnalysisWrap','<div class="ev-detail-overlay open" id="energyAnalysisOverlay"><div class="ev-detail-sheet energy-sheet">'+energyAnalysisHtml(kind)+'</div></div>',{overlay:'energyAnalysisOverlay',contenedor:document.getElementById('fiscalOverlay')});
  function refresh(){openEnergyAnalysis(kind);}
  w.querySelector('#energyAnalysisBack').onclick=function(){cerrarPanel('energyAnalysisWrap','energyAnalysisOverlay');};
  w.querySelectorAll('[data-energy-tab]').forEach(function(b){b.onclick=function(){ENERGY_ANALYSIS_TAB=b.dataset.energyTab;refresh();};});
  w.querySelectorAll('[data-analysis-year]').forEach(function(b){b.onclick=function(){ENERGY_ANALYSIS_YEAR+=+b.dataset.analysisYear;refresh();};});
  w.querySelector('#energyAnalysisBills').onclick=function(){openEnergyBills(kind);};w.querySelector('#energyAnalysisContracts').onclick=function(){openEnergyHistory(kind);};
  w.querySelectorAll('[data-analysis-contract]').forEach(function(b){b.onclick=function(){energyEditContractTariff(kind,b.dataset.analysisContract);};});
  w.querySelectorAll('[name="energyComparison"]').forEach(function(r){r.onchange=function(){ENERGY_ANALYSIS_SELECTED[kind]=r.value;refresh();};});
  w.querySelectorAll('[data-energy-send]').forEach(function(b){b.onclick=function(){var c=energyContracts().find(function(x){return x.id===b.dataset.energySend;});if(c&&c.analysis)energySendToScenarios(c);};});
  var promos=w.querySelector('#energyPromos');if(promos)promos.onchange=function(){ENERGY_ANALYSIS_PROMOS=promos.checked;refresh();};
  var tax=w.querySelector('#energyTaxEdit');if(tax)tax.onclick=function(){openEnergyTaxEditor(kind);};
  var copy=w.querySelector('#energyCurrentCopy');if(copy)copy.onclick=function(){
    var t=kind==='luz'?_currentElectTariff():_currentGasTariff();
    openEnergyTariff(kind,t,function(analysis){var before=energyContracts();var c={id:'analysis-'+Date.now(),kind:kind,supplier:t.comercializadora||'Tarifa actual',tariff:'Copia del análisis',supply:'',start:dk(new Date()),end:'',commitment:'',taxes:'excluidos',prices:[],notes:'Copia editable de la tarifa del análisis. No modifica la configuración original.',source:'',analysis:analysis};energySaveContracts(energyMergeContracts(before,[c]));refresh();showToast('Tarifa incorporada','success',function(){energySaveContracts(before);refresh();});});
  };
  addSwipe(w.querySelector('.energy-sheet'),function(){var tabs=['consumo','tarifas','comparar'];ENERGY_ANALYSIS_TAB=tabs[Math.min(2,tabs.indexOf(ENERGY_ANALYSIS_TAB)+1)];refresh();},function(){var tabs=['consumo','tarifas','comparar'];ENERGY_ANALYSIS_TAB=tabs[Math.max(0,tabs.indexOf(ENERGY_ANALYSIS_TAB)-1)];refresh();});
}
function energyTaxRow(row){return '<div class="energy-tax-row"><label class="energy-field">Desde<input type="date" data-tax-date required value="'+row.start+'"></label><label class="energy-field">IVA %<input type="number" data-tax-rate required min="0" max="100" step="any" value="'+row.rate+'"></label><button type="button" class="ev-io-btn" data-tax-remove aria-label="Quitar período">×</button></div>';}
function openEnergyTaxEditor(kind){
  var before=energyTaxes(),rows=before.filter(function(r){return r.kind===kind;}).sort(function(a,b){return a.start.localeCompare(b.start);});
  var h='<div class="sheet-handle"></div><div class="energy-history-heading"><button class="sy-back" id="energyTaxBack" aria-label="Volver">←</button><h2>IVA de '+(kind==='luz'?'electricidad':'gas')+'</h2></div><p class="energy-caption">Cada porcentaje se aplica desde su fecha hasta el siguiente cambio. Registra el IVA de tu suministro: puede depender de sus condiciones. No se rellena el pasado con el valor actual.</p><form id="energyTaxForm"><div id="energyTaxRows">'+rows.map(energyTaxRow).join('')+'</div><div class="ev-io-row"><button type="button" class="ev-io-btn" id="energyTaxAdd">+ Período</button><button type="submit" class="ev-io-btn io-primaria">Guardar IVA</button></div></form>';
  var w=abrirPanel('energyTaxWrap','<div class="ev-form-overlay open" id="energyTaxOverlay"><div class="ev-detail-sheet energy-sheet">'+h+'</div></div>',{overlay:'energyTaxOverlay',contenedor:document.getElementById('fiscalOverlay')});
  w.querySelector('#energyTaxBack').onclick=function(){cerrarPanel('energyTaxWrap','energyTaxOverlay');};
  w.querySelector('#energyTaxAdd').onclick=function(){w.querySelector('#energyTaxRows').insertAdjacentHTML('beforeend',energyTaxRow({start:'',rate:21}));};
  w.querySelector('form').onclick=function(e){if(e.target.closest('[data-tax-remove]'))e.target.closest('.energy-tax-row').remove();};
  w.querySelector('form').onsubmit=function(e){e.preventDefault();try{var updated=before.filter(function(r){return r.kind!==kind;}).concat(Array.from(w.querySelectorAll('.energy-tax-row')).map(function(row){return {kind:kind,start:row.querySelector('[data-tax-date]').value,rate:Number(row.querySelector('[data-tax-rate]').value)};}));energySaveTaxes(updated);cerrarPanel('energyTaxWrap','energyTaxOverlay');openEnergyAnalysis(kind);showToast('IVA guardado','success',function(){energySaveTaxes(before);openEnergyAnalysis(kind);});}catch(err){showToast(err.message,'error');}};
}

function energyRefreshAnalysis(kind){if(document.getElementById('energyAnalysisWrap'))openEnergyAnalysis(kind);}
