var ENERGY_BILLS_YEAR=new Date().getFullYear();
var ENERGY_BILLS_COST='paid';
function energyNumber(n,unit){return n===null?'Sin dato':n.toLocaleString('es-ES',{maximumFractionDigits:unit==='kWh'?3:2,minimumFractionDigits:unit==='€'?2:0})+' '+unit;}
function energyBillsChart(months,field,color){
  var known=months.map(function(m){return m.count>0&&!(field==='consumption'&&m.unknownConsumption)&&!(field==='paid'&&m.unknownPaid);});
  var values=months.map(function(m,i){return known[i]?Math.round(m[field]*100)/100:0;});
  // El gráfico compartido no dibuja negativos. Los abonos se conservan en la tabla.
  return simpleBarChart(values,MN_SHORT.map(function(s,i){return known[i]?s:'·';}),color,{height:95})+'<p class="energy-caption">· Sin datos completos'+(values.some(function(v){return v<0;})?' · Abonos negativos detallados en la tabla':'')+'</p>';
}
function energyBillsHtml(kind){
  var all=energyBills().filter(function(b){return b.kind===kind;}),year=ENERGY_BILLS_YEAR;
  var list=all.filter(function(b){return +b.issued.slice(0,4)===year;}).sort(function(a,b){return b.issued.localeCompare(a.issued)||b.number.localeCompare(a.number);});
  var months=energyMonthlyBills(list,year),color=kind==='luz'?'#b78528':'#6695cf';
  var h='<div class="sheet-handle"></div><div class="energy-history-heading"><button class="sy-back" id="energyBillsBack" aria-label="Volver">←</button><h2>Facturas de '+(kind==='luz'?'luz':'gas')+'</h2></div>';
  h+='<div class="energy-year-nav"><button class="nav-btn" data-energy-year="-1" aria-label="Año anterior">◀</button><strong>'+year+'</strong><button class="nav-btn" data-energy-year="1" aria-label="Año siguiente">▶</button></div>';
  h+='<div class="ev-io-row"><button class="ev-io-btn io-primaria" id="energyBillAdd">+ Añadir</button><button class="ev-io-btn" id="energyBillImport">Importar</button><button class="ev-io-btn" id="energyBillExport">Exportar</button><input type="file" id="energyBillFile" accept=".json,application/json" hidden></div>';
  if(!list.length)return h+'<p class="sy-note">No hay facturas en '+year+'. Añade una o importa tu histórico.</p>';
  h+='<p class="energy-caption">Agrupadas por mes de emisión. El consumo corresponde a los períodos facturados, no necesariamente al mes natural. Importes previstos de cobro; no verifican el pago bancario.</p>';
  h+='<section class="energy-contract"><h3>Importes por mes · €</h3><div class="econ-sub-tabs">';
  [['net','Sin impuestos'],['gross','Con impuestos'],['paid','Cargo']].forEach(function(f){h+='<button class="econ-sub-tab'+(ENERGY_BILLS_COST===f[0]?' active':'')+'" data-energy-cost="'+f[0]+'">'+f[1]+'</button>';});
  h+='</div>'+energyBillsChart(months,ENERGY_BILLS_COST,color)+'</section>';
  h+='<section class="energy-contract"><h3>Consumo facturado · kWh</h3>'+energyBillsChart(months,'consumption','#65a367')+'</section>';
  h+='<details class="energy-contract"><summary>Resumen mensual · importes y cargos</summary><div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>Sin imp.</th><th>Con imp.</th><th>Cargo</th></tr></thead><tbody>';
  months.forEach(function(m,i){if(m.count)h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(m.net,'€')+'</td><td>'+energyNumber(m.gross,'€')+'</td><td>'+energyNumber(m.unknownPaid?null:m.paid,'€')+'</td></tr>';});
  h+='</tbody></table></div></details>';
  list.forEach(function(b){h+='<article class="energy-contract"><div class="hip-section-hdr"><strong>'+escHtml(b.supplier)+'</strong><button class="hip-edit-btn" data-energy-bill="'+b.id+'">Editar</button></div><div class="energy-caption">'+escHtml(b.number)+' · '+b.issued+'</div><p>'+b.start+' → '+b.end+'</p><div class="energy-price-view"><span>Consumo</span><b>'+energyNumber(b.consumption,'kWh')+'</b></div><div class="energy-price-view"><span>Sin impuestos</span><b>'+energyNumber(b.net,'€')+'</b></div><div class="energy-price-view"><span>Con impuestos</span><b>'+energyNumber(b.gross,'€')+'</b></div>';
    if(b.paid!==b.gross)h+='<div class="energy-price-view"><span>Cargo tras descuentos / saldo</span><b>'+energyNumber(b.paid,'€')+'</b></div>';
    if(b.noReading)h+='<p class="energy-caption">Consumo no acreditado: excluido de las simulaciones.</p>';
    if(b.notes)h+='<p class="energy-caption">'+escHtml(b.notes)+'</p>';if(b.source)h+='<details><summary>Documento de origen</summary><p class="energy-caption">'+escHtml(b.source)+'</p></details>';h+='</article>';});return h;
}
function openEnergyBills(kind){
  var w=abrirPanel('energyBillsWrap','<div class="ev-detail-overlay open" id="energyBillsOverlay"><div class="ev-detail-sheet energy-sheet">'+energyBillsHtml(kind)+'</div></div>',{overlay:'energyBillsOverlay',contenedor:document.getElementById('fiscalOverlay')});
  w.querySelector('#energyBillsBack').onclick=function(){cerrarPanel('energyBillsWrap','energyBillsOverlay');energyRefreshAnalysis(kind);};
  w.querySelectorAll('[data-energy-cost]').forEach(function(b){b.onclick=function(){ENERGY_BILLS_COST=b.dataset.energyCost;openEnergyBills(kind);};});
  w.querySelectorAll('[data-energy-year]').forEach(function(b){b.onclick=function(){ENERGY_BILLS_YEAR+=+b.dataset.energyYear;openEnergyBills(kind);};});
  w.querySelectorAll('[data-energy-bill]').forEach(function(b){b.onclick=function(){openEnergyBill(kind,b.dataset.energyBill);};});
  w.querySelector('#energyBillAdd').onclick=function(){openEnergyBill(kind);};
  w.querySelector('#energyBillExport').onclick=function(){shareOrDownload(new Blob([JSON.stringify({version:7,energyTaxes:energyTaxes(),energyBills:energyBills().filter(function(b){return b.kind===kind;}),energyContracts:energyContracts().filter(function(c){return c.kind===kind;})},null,2)],{type:'application/json'}),'gestify-energia-'+kind+'.json',null,{download:true});};
  var input=w.querySelector('#energyBillFile');w.querySelector('#energyBillImport').onclick=function(){input.click();};
  input.onchange=function(){var file=input.files[0];if(!file)return;var r=new FileReader();r.onload=function(){try{var before=energyImportHistory(JSON.parse(r.result));openEnergyBills(kind);showToast('Histórico importado sin duplicados','success',function(){energyRestoreHistory(before);openEnergyBills(kind);});}catch(e){showToast(e.message,'error');}};r.onerror=function(){showToast('No se pudo leer el archivo','error');};r.readAsText(file);input.value='';};
}
function openEnergyBill(kind,id){
  var b=energyBills().find(function(x){return x.id===id;})||{id:'bill-'+Date.now(),kind:kind,supplier:'',number:'',issued:dk(new Date()),start:dk(new Date()),end:dk(new Date()),consumption:null,net:0,gross:0,paid:null,notes:'',source:''};
  var h='<div class="sheet-handle"></div><div class="energy-history-heading"><button class="sy-back" id="energyBillCancel" aria-label="Volver">←</button><h2>'+ (id?'Editar':'Añadir')+' factura</h2></div><div class="energy-fields">';
  [['supplier','Compañía','text'],['number','Número de factura','text'],['issued','Fecha de emisión','date'],['start','Período desde','date'],['end','Hasta','date'],['consumption','Consumo facturado (kWh)','number'],['net','Total sin impuestos (€)','number'],['gross','Total con impuestos (€)','number'],['paid','Cargo tras descuentos / saldo (€)','number']].forEach(function(f){h+='<label class="energy-field">'+f[1]+'<input id="eb-'+f[0]+'" type="'+f[2]+'" '+(f[2]==='number'?'step="any"':'')+' value="'+escHtml(b[f[0]]===null?'':String(b[f[0]]))+'"></label>';});
  h+='</div><p class="energy-caption">Deja consumo o cargo vacíos si no constan. Los abonos admiten importes negativos.</p><label class="energy-promo"><input type="checkbox" id="eb-noReading"'+(b.noReading?' checked':'')+'> Consumo no acreditado para el estudio</label><label class="energy-field">Nota<textarea id="eb-notes">'+escHtml(b.notes)+'</textarea></label><div class="ev-io-row">'+(id?'<button class="ev-io-btn io-peligro" id="energyBillDelete">Eliminar</button>':'')+'<button class="ev-io-btn io-primaria" id="energyBillSave">Guardar</button></div>';
  var w=abrirPanel('energyBillFormWrap','<div class="ev-form-overlay open" id="energyBillFormOverlay"><div class="ev-detail-sheet energy-sheet">'+h+'</div></div>',{overlay:'energyBillFormOverlay',contenedor:document.getElementById('fiscalOverlay')});
  function close(){cerrarPanel('energyBillFormWrap','energyBillFormOverlay');}
  function save(list,prev){energySaveBills(list);close();openEnergyBills(kind);showToast('Factura guardada','success',function(){energySaveBills(prev);openEnergyBills(kind);});}
  w.querySelector('#energyBillCancel').onclick=close;
  w.querySelector('#energyBillSave').onclick=function(){try{var next=Object.assign({},b),prev=energyBills();next.noReading=w.querySelector('#eb-noReading').checked;['supplier','number','issued','start','end','notes'].forEach(function(k){next[k]=w.querySelector('#eb-'+k).value.trim();});['consumption','net','gross','paid'].forEach(function(k){var v=w.querySelector('#eb-'+k).value;next[k]=v===''?null:Number(v);});save(energyMergeBills(prev,[next]),prev);}catch(e){showToast(e.message,'error');}};
  if(id)w.querySelector('#energyBillDelete').onclick=function(){try{var prev=energyBills();save(prev.filter(function(x){return x.id!==id;}),prev);}catch(e){showToast(e.message,'error');}};
}
