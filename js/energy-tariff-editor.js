/* Editor compartido por histórico y escenarios existentes. */
function energyNumericField(key,label,value){return '<label class="energy-field">'+label+'<input name="'+key+'" type="number" min="0" step="any" required value="'+escHtml(String(value))+'"></label>';}
function energyTariffEditorHtml(kind,old){
  var t=energyTariffDefaults(old),h='<div class="sheet-handle"></div><div class="energy-history-heading"><button class="sy-back" id="energyTariffBack" aria-label="Volver">←</button><h2>Tarifa para comparar</h2></div><form id="energyTariffForm">';
  h+='<p class="energy-caption">Precios sin IVA. Los conceptos originales del contrato se conservan. Completa los costes que quieras incluir en la estimación.</p><fieldset class="energy-tax"><legend>Modalidad</legend>';
  [['consumo','Por consumo'],['fijo','Cuota fija mensual']].forEach(function(x){h+='<label><input type="radio" name="modo" value="'+x[0]+'"'+(t.modo===x[0]?' checked':'')+'> '+x[1]+'</label>';});
  h+='</fieldset><div data-tariff-flat>'+energyNumericField('cuotaFija','Cuota total / mes (€)',t.cuotaFija)+'<p class="energy-caption">Sustituye consumo, potencia y términos fijos. Las regularizaciones se consultan en las facturas.</p></div><div data-tariff-usage><fieldset class="energy-tax"><legend>Precio del consumo</legend>';
  [['unico','Precio único'],['tramos','Tres tramos ponderados']].forEach(function(x){h+='<label><input type="radio" name="energyMode" value="'+x[0]+'"'+(t.energyMode===x[0]?' checked':'')+'> '+x[1]+'</label>';});
  h+='</fieldset><div data-tariff-single>'+energyNumericField('precioKwh','Precio único (€/kWh)',t.precioKwh)+'</div><div data-tariff-periods>';
  for(var i=0;i<3;i++)h+='<div class="energy-fields">'+energyNumericField('price'+i,'P'+(i+1)+' (€/kWh)',t.periodPrices[i])+energyNumericField('weight'+i,'Consumo P'+(i+1)+' (%)',t.periodWeights[i])+'</div>';
  h+='<p class="energy-caption">Introduce el reparto de tu consumo, real o estimado. Los tres pesos deben sumar 100 %.</p><p id="energyWeighted" aria-live="polite"></p></div><h3>Costes fijos</h3><div class="energy-fields">'+energyNumericField('terminoFijo','Fijo / mes (€)',t.terminoFijo)+energyNumericField('terminoFijoDia','Fijo / día (€)',t.terminoFijoDia)+'</div>';
  if(kind==='luz'){
    h+='<fieldset class="energy-tax"><legend>Potencia</legend>';
    [['simple','Un precio'],['doble','P1 y P2']].forEach(function(x){h+='<label><input type="radio" name="modoPotencia" value="'+x[0]+'"'+(t.modoPotencia===x[0]?' checked':'')+'> '+x[1]+'</label>';});
    h+='</fieldset><div class="energy-fields">'+energyNumericField('potenciaTotal','Potencia única (kW)',t.potenciaTotal)+energyNumericField('precioPotP1','Precio potencia P1 / único (€/kW/día)',t.precioPotP1)+energyNumericField('potenciaP1','Potencia P1 (kW)',t.potenciaP1)+energyNumericField('potenciaP2','Potencia P2 (kW)',t.potenciaP2)+energyNumericField('precioPotP2','Precio potencia P2 (€/kW/día)',t.precioPotP2)+'</div>';
  }
  h+='</div><details class="energy-contract"><summary>Otros impuestos y promociones opcionales</summary><p class="energy-caption">Aproximación: porcentaje sobre el coste base y/o importe por kWh, antes del IVA histórico. La promoción es un descuento mensual después de impuestos.</p><div class="energy-fields">'+energyNumericField('otherTaxPct','Otros impuestos (%)',t.otherTaxPct)+energyNumericField('otherTaxKwh','Otros impuestos (€/kWh)',t.otherTaxKwh)+energyNumericField('promotion','Promoción / mes (€)',t.promotion)+'</div></details><button class="ev-io-btn io-primaria" type="submit">Guardar tarifa</button></form>';
  return h;
}
function openEnergyTariff(kind,old,onSave,container){
  var t=energyTariffDefaults(old),w=abrirPanel('energyTariffWrap','<div class="ev-form-overlay open" id="energyTariffOverlay"><div class="ev-detail-sheet energy-sheet">'+energyTariffEditorHtml(kind,t)+'</div></div>',{overlay:'energyTariffOverlay',contenedor:container||document.getElementById('fiscalOverlay')});
  var f=w.querySelector('form');
  function close(){cerrarPanel('energyTariffWrap','energyTariffOverlay');}
  function read(){var n=Object.assign({},t);Array.from(f.elements).forEach(function(el){if(el.type==='number')n[el.name]=Number(el.value);});n.modo=f.elements.modo.value;n.energyMode=f.elements.energyMode.value;if(kind==='luz')n.modoPotencia=f.elements.modoPotencia.value;n.periodPrices=[n.price0,n.price1,n.price2];n.periodWeights=[n.weight0,n.weight1,n.weight2];for(var i=0;i<3;i++){delete n['price'+i];delete n['weight'+i];}return energyValidateTariff(n);}
  function update(){
    w.querySelector('[data-tariff-flat]').hidden=f.elements.modo.value!=='fijo';w.querySelector('[data-tariff-usage]').hidden=f.elements.modo.value==='fijo';
    w.querySelector('[data-tariff-single]').hidden=f.elements.energyMode.value==='tramos';w.querySelector('[data-tariff-periods]').hidden=f.elements.energyMode.value!=='tramos';
    if(kind==='luz'){var double=f.elements.modoPotencia.value==='doble';f.elements.potenciaTotal.closest('label').hidden=double;['potenciaP1','potenciaP2','precioPotP2'].forEach(function(k){f.elements[k].closest('label').hidden=!double;});}
    try{w.querySelector('#energyWeighted').textContent='Media ponderada: '+energyWeightedPrice(read()).toFixed(5)+' €/kWh';}catch(e){w.querySelector('#energyWeighted').textContent=e.message;}
  }
  f.oninput=update;f.onchange=update;w.querySelector('#energyTariffBack').onclick=close;
  f.onsubmit=function(e){e.preventDefault();try{var n=read();n.precioKwh=energyWeightedPrice(n);n.useOwnPower=true;onSave(n);close();}catch(err){showToast(err.message,'error');}};update();
}
function energyEditLegacyTariff(kind,index,container,refresh){
  var key=kind==='luz'?'electComparaciones':'gasComparaciones';
  var old=index===null?(kind==='luz'?_currentElectTariff():_currentGasTariff()):DESPACHO[key][index];
  var power=kind==='luz'?_currentElectTariff():{};
  openEnergyTariff(kind,Object.assign({},power,old),function(t){
    if(index===null){if(kind==='luz')DESPACHO.elect=Object.assign({},DESPACHO.elect,t);else {DESPACHO.gas.activo=t.modo;DESPACHO.gas[t.modo]=Object.assign({},DESPACHO.gas[t.modo],t);}}
    else DESPACHO[key][index]=Object.assign({},old,t);
    saveDespacho();refresh();
  },container);
}
function energySendToScenarios(c){
  var key=c.kind==='luz'?'electComparaciones':'gasComparaciones',list=DESPACHO[key]||[];
  var index=list.findIndex(function(t){return t.energyContractId===c.id;});
  if(index<0&&list.length>=5){showToast('El análisis admite cinco tarifas alternativas. Quita una antes de añadir otra.','error');return;}
  var tariff=Object.assign({},c.analysis,{nombre:c.supplier+' · '+c.tariff,comercializadora:c.supplier,energyContractId:c.id,useOwnPower:true,precioKwh:energyWeightedPrice(c.analysis)});
  if(index<0)list.push(tariff);else list[index]=tariff;DESPACHO[key]=list;saveDespacho();showToast('Tarifa disponible en Análisis de escenarios','success');
}
