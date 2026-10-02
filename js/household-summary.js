/* Resumen compartido de vivienda. Números sin redondear hasta su presentación. */
function householdMortgagePayment(capital,rate,months){
  if(!months)return 0;var r=rate/1200,p=Math.pow(1+r,months);return r?capital*r*p/(p-1):capital/months;
}
function householdMortgagePeriod(comp,index,today){
  var sub=index>=0?comp.subrogaciones[index]:null,next=(comp.subrogaciones||[])[index+1];
  var capital=sub?sub.nuevoImporte:comp.importePrestamo,rate=sub?sub.nuevoTipoInteres:comp.tipoInteres,years=sub?sub.nuevoPlazoAnios:comp.plazoAnios;
  if(!capital||!years)return null;
  var start=sub?sub.fecha:comp.fechaInicio,end=next?next.fecha:null,vinc=(sub?sub.vinculaciones:comp.vinculaciones)||{},effective=_hipEffRate(rate||0,vinc),months=years*12;
  var paid=start?Math.max(0,(today.getFullYear()-Number(start.slice(0,4)))*12+today.getMonth()+1-Number(start.slice(5,7))):0;
  if(end&&start)paid=Math.min(paid,(Number(end.slice(0,4))-Number(start.slice(0,4)))*12+Number(end.slice(5,7))-Number(start.slice(5,7)));
  var payment=householdMortgagePayment(capital,effective,months),extra=0,reference=DESPACHO.segurosNormales||{};
  ['segHogar','segSalud','segVida'].forEach(function(k){if(vinc[k]&&vinc[k].enabled)extra+=Math.max(0,(vinc[k].costeAnual||0)-(reference[k]||0));});
  var equivalentRate=effective;
  if(extra){var low=effective,high=Math.max(effective+1,100);for(var i=0;i<60;i++){var mid=(low+high)/2;if(householdMortgagePayment(capital,mid,months)<payment+extra/12)low=mid;else high=mid;}equivalentRate=(low+high)/2;}
  return {index:index,bank:(sub?sub.entidadBanco:comp.entidadBanco)||'Entidad sin indicar',label:sub?'Subrogación '+(index+1):'Préstamo original',active:!next,capital:capital,rate:rate||0,effective:effective,years:years,start:start,end:end,paid:paid,remaining:end?0:Math.max(0,months-paid),payment:payment,extra:extra,equivalentRate:equivalentRate};
}
function householdValue(label,value,extra){return '<div class="household-value"><dt>'+label+'</dt><dd>'+value+'</dd>'+(extra?'<small>'+extra+'</small>':'')+'</div>';}
function householdMortgageCard(comp,p,editable){
  var date=function(s){return s?s.split('-').reverse().join('/'):'Sin fecha';};
  var h='<article class="household-card household-mortgage"><header><div><span class="household-eyebrow">'+p.label+'</span><h3>'+escHtml(p.bank)+'</h3></div><span class="household-status">'+(p.active?'Actual':'Finalizada')+'</span></header>';
  h+='<div class="household-payment"><strong>'+fcPlain(p.payment)+'</strong><span>cuota mensual</span></div><p class="household-dates">'+date(p.start)+' — '+(p.end?date(p.end):'actualidad')+'</p>';
  h+='<dl class="household-metrics">'+householdValue('Tipo bonificado',p.effective.toFixed(2).replace('.',',')+' %',p.effective!==p.rate?'Nominal '+p.rate.toFixed(2).replace('.',',')+' %':'Interés fijo')+householdValue('Capital inicial',fcPlain(p.capital),p.years+' años de plazo')+'</dl>';
  if(p.active&&comp.fechaInicio){
    var balance=_computeBalanceAtDate(comp,dk(new Date()).slice(0,7)+'-01'),interest=_computeAnnualInterest(comp,FISCAL_YEAR),pct=Math.max(0,Math.min(100,(1-balance/p.capital)*100));
    h+='<div class="household-balance"><div><span>Capital pendiente</span><b>'+fcPlain(balance)+'</b></div><div class="household-progress" role="progressbar" aria-label="Capital amortizado" aria-valuenow="'+Math.round(pct)+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+pct+'%"></span></div><small>'+Math.round(pct)+' % amortizado · '+_fmtDuration(p.remaining)+' restantes</small></div>';
    h+='<dl class="household-metrics">'+householdValue('Intereses '+FISCAL_YEAR,fcPlain(interest))+householdValue('Tiempo pagado',_fmtDuration(p.paid))+'</dl>';
  }else h+='<p class="household-dates">Tiempo pagado: '+_fmtDuration(p.paid)+'</p>';
  if(p.extra){
    h+='<div class="household-equivalent"><span>Con el sobrecoste de seguros</span><strong>'+fcPlain(p.payment+p.extra/12)+' <small>/mes</small></strong><p>Cuota '+fcPlain(p.payment)+' + '+fcPlain(p.extra/12)+' de seguros</p><p>Tipo equivalente '+p.equivalentRate.toFixed(2).replace('.',',')+' % · '+fcPlain(p.extra)+'/año de sobrecoste</p></div>';
  }else h+='<p class="household-ok">✓ Sin sobrecoste de seguros vinculados</p>';
  if(editable)h+='<button class="household-card-link" data-gotosection="'+(p.index<0?'prestamo':'sub-'+p.index)+'">Ver detalle de la hipoteca <span>›</span></button>';
  return h+'</article>';
}
function householdUtilityPrices(kind,source,vat,fixed,detail){
  var t=energyTariffDefaults(source);vat=vat==null?21:vat;
  var h='<div class="household-price-grid">';
  var label=fixed?'Cuota mensual':t.energyMode==='tramos'?'Consumo · media ponderada':'Consumo';
  var net=fixed?t.cuotaFija:energyWeightedPrice(t);
  h+=energyPricePair(label,net,energyTaxPrice(t,net,vat,!fixed),fixed?'/mes':'€/kWh','',fixed);
  if(!fixed&&kind==='luz'){
    var p=t.precioPotP1+(t.modoPotencia==='doble'?t.precioPotP2:0);
    h+=energyPricePair('Potencia · suma de precios',p,energyTaxPrice(t,p,vat,false),'€/kW/día',t.modoPotencia==='doble'?'P1 '+energyNumber(t.potenciaP1,'kW')+' · P2 '+energyNumber(t.potenciaP2,'kW'):energyNumber(t.potenciaTotal,'kW'));
  }
  if(!fixed&&t.terminoFijoDia)h+=energyPricePair('Fijo diario',t.terminoFijoDia,energyTaxPrice(t,t.terminoFijoDia,vat,false),'€/día');
  if(!fixed&&t.terminoFijo)h+=energyPricePair(kind==='gas'?'Fijo por factura':'Fijo mensual',t.terminoFijo,energyTaxPrice(t,t.terminoFijo,vat,false),kind==='gas'?'/factura':'/mes','',true);
  h+='</div>';
  if(detail&&!fixed){
    h+='<div class="household-rate-breakdown">';
    if(t.energyMode==='tramos'){
      var weights=energyDisplayWeights(t.periodWeights);
      h+='<section><h4>Reparto del consumo</h4>';
      ['Punta','Llano','Valle'].forEach(function(n,i){h+='<div class="household-rate-line"><span>'+n+' <small>'+weights[i]+' %</small></span><strong>'+energyUnitPrice(t.periodPrices[i])+' <small>€/kWh</small></strong></div>';});h+='</section>';
    }
    if(kind==='luz'){
      h+='<section><h4>Potencia contratada</h4>';
      (t.modoPotencia==='doble'?['P1','P2']:['P1']).forEach(function(p){h+='<div class="household-rate-line"><span>'+p+' <small>'+energyNumber(t.modoPotencia==='doble'?t['potencia'+p]:t.potenciaTotal,'kW')+'</small></span><strong>'+energyUnitPrice(t['precioPot'+p])+' <small>€/kW/día</small></strong></div>';});h+='</section>';
    }
    h+='</div>';
    if(t.extrasPerDay)h+='<p class="household-dates">Otros cargos: '+energyUnitPrice(t.extrasPerDay)+' €/día sin impuestos.</p>';
  }
  h+='<div class="household-tax-note"><span>IVA <b>'+vat+' %</b></span>';
  if(t.otherTaxPct)h+='<span>Impuesto eléctrico <b>'+t.otherTaxPct.toLocaleString('es-ES',{maximumFractionDigits:2})+' %</b></span>';
  if(t.otherTaxKwh)h+='<span>Impuesto por energía <b>'+energyUnitPrice(t.otherTaxKwh)+' €/kWh</b></span>';
  return h+'</div>';
}
function householdUtilityCard(kind,editable){
  var gas=DESPACHO.gas||{},fixed=kind==='gas'?(gas.activo||gas.modo)==='fijo':(DESPACHO.elect||{}).modo==='fijo';
  var source=kind==='gas'?(fixed?gas.fijo:gas.consumo)||gas:DESPACHO.elect||{},t=energyTariffDefaults(source),vat=kind==='gas'?gas.ivaGas:source.ivaElect;
  var configured=!!(fixed?t.cuotaFija:energyWeightedPrice(t)||t.terminoFijo||t.terminoFijoDia||t.precioPotP1||t.precioPotP2);
  var h='<article class="household-card household-utility household-'+kind+'"><header><div><span class="household-eyebrow">'+(kind==='luz'?'Electricidad':'Gas')+'</span><h3>'+escHtml(source.comercializadora||'Sin comercializadora')+'</h3></div><span class="household-utility-icon" aria-hidden="true">'+(kind==='luz'?'⚡':'♨')+'</span></header>';
  if(!configured)h+='<p class="household-empty">Aún no hay una tarifa configurada.</p>';
  else{
    h+=householdUtilityPrices(kind,source,vat,fixed,false);
  }
  if(editable)h+='<button class="household-card-link" data-hipsub="'+(kind==='luz'?'elect':'gas')+'">Ver tarifa y consumo <span>›</span></button>';
  return h+'</article>';
}
function renderHouseholdSummary(editable){
  var comp=DESPACHO.compra||_defaultCompra(),total=['valorCompraTotal','itpMadrid','notariaRegistro','tasacion','reformas','inmobiliaria'].reduce(function(n,k){return n+(comp[k]||0);},0),periods=[];
  for(var i=-1;i<(comp.subrogaciones||[]).length;i++){var p=householdMortgagePeriod(comp,i,new Date());if(p)periods.push(p);}
  var h='<div class="household-summary">';
  if(total)h+='<div class="household-investment"><span>Inversión en la vivienda<small>Compra, impuestos y gastos</small></span><strong>'+fcPlain(total)+'</strong></div>';
  if(periods.length){
    h+=householdMortgageCard(comp,periods[periods.length-1],editable);
    if(editable)h+='<button class="ev-io-btn household-analysis-link" id="hipGoAnalisis">Ver análisis de hipoteca</button>';
    if(periods.length>1){h+='<details class="household-history"><summary>Hipotecas anteriores <span>'+ (periods.length-1)+'</span></summary>';periods.slice(0,-1).reverse().forEach(function(p){h+=householdMortgageCard(comp,p,editable);});h+='</details>';}
  }else h+='<div class="household-empty">Sin hipoteca configurada. Puedes consultar tus suministros a continuación.</div>';
  h+='<h2 class="household-section-title">Suministros</h2><div class="household-utilities">'+householdUtilityCard('luz',editable)+householdUtilityCard('gas',editable)+'</div>';
  return h+'</div>';
}
