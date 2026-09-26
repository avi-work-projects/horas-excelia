/* Indicadores del estudio: datos documentados separados de estimaciones. */
var ENERGY_COST_VAT='historical', ENERGY_COST_RATE=21, ENERGY_COMPARE_VAT=21;
var ENERGY_COMPARE_TARIFF=0;
function energyYearIndicators(kind,year){
  var months=energyConsumptionMonths(energyBills(),year,kind),covered=0,kwh=0,active=0,periods=[0,0,0],periodDays=0;
  months.forEach(function(m){if(m.overlap||m.unknownConsumption)return;var n=Object.keys(m.days).length;if(!n)return;covered+=n;kwh+=m.consumption;active++;periodDays+=m.periodDays;m.periods.forEach(function(v,i){periods[i]+=v;});});
  var docs=energyBills().filter(function(b){return b.kind===kind&&+b.issued.slice(0,4)===year;});
  function tax(key){var known=docs.filter(function(b){return b[key]!=null;});return {value:known.length?known.reduce(function(s,b){return s+b[key];},0):null,count:known.length,total:docs.length};}
  return {months:months,days:covered,kwh:kwh,active:active,periods:periods,periodDays:periodDays,vat:tax('vatAmount'),electricityTax:tax('electricityTaxAmount'),otherTax:tax('otherTaxesAmount'),services:docs.reduce(function(s,b){return s+energyBillServices(b);},0),billed:docs.length?docs.reduce(function(s,b){return s+b.gross;},0):null,bills:docs.length};
}
function energyMetric(label,value,note){return '<article class="energy-metric"><span>'+escHtml(label)+'</span><strong>'+escHtml(value)+'</strong>'+(note?'<small>'+escHtml(note)+'</small>':'')+'</article>';}
function energyContractPeriods(c){return c.analysisPeriods&&c.analysisPeriods.length?c.analysisPeriods:c.analysis?[{start:c.start,tariff:c.analysis}]:[];}
/* Agrupa condiciones comerciales; las vigencias fiscales originales siguen calculándose por día. */
function energyCommercialPeriods(c){
  var result=[],periods=energyContractPeriods(c).slice().sort(function(a,b){return a.start.localeCompare(b.start);});
  function signature(t){var prices=t.energyMode==='tramos'?t.periodPrices:[t.precioKwh];return JSON.stringify([t.modo,t.energyMode,t.modo==='fijo'?t.cuotaFija:prices.map(function(v){return +v.toFixed(6);}),t.modoPotencia,t.precioPotP1,t.precioPotP2,t.potenciaP1,t.potenciaP2,t.potenciaTotal]);}
  periods.forEach(function(p,i){var end=periods[i+1]?energyDate(energyUtc(periods[i+1].start)-1):(c.end||''),key=signature(p.tariff),last=result[result.length-1];
    if(last&&last.key===key){last.end=end;last.tariff=p.tariff;last.variants.push(p);}
    else result.push({start:p.start,end:end,tariff:p.tariff,key:key,variants:[p]});
  });return result;
}
function energyPriceExtremes(kind,year){
  var types=[{name:'Consumo',unit:'€/kWh',value:function(t){return t.modo==='fijo'?null:energyWeightedPrice(t);}}, {name:'Potencia P1',unit:'€/kW/día',value:function(t){return t.modo==='fijo'?null:t.precioPotP1;}},{name:'Potencia P2',unit:'€/kW/día',value:function(t){return t.modo==='fijo'||t.modoPotencia!=='doble'?null:t.precioPotP2;}}];
  var h='<section class="energy-contract"><h3>Precios contratados · sin impuestos</h3><p class="energy-caption">Extremos del año. En consumo por tramos se compara la media ponderada de la tarifa; una cuota fija no es comparable por kWh.</p>';
  types.forEach(function(type){if(kind!=='luz'&&type.name!=='Consumo')return;var rows=[];energyContracts().filter(function(c){return c.kind===kind;}).forEach(function(c){var ps=energyContractPeriods(c).slice().sort(function(a,b){return a.start.localeCompare(b.start);});ps.forEach(function(p,i){var end=ps[i+1]?energyDate(energyUtc(ps[i+1].start)-1):(c.end||'9999-12-31');if(p.start>year+'-12-31'||end<year+'-01-01')return;var n=type.value(p.tariff);if(n!==null)rows.push({value:n,supplier:c.supplier});});});rows.sort(function(a,b){return a.value-b.value;});h+='<h4>'+type.name+'</h4>';if(!rows.length){h+='<p class="energy-caption">Sin precios comparables</p>';return;}[rows[0],rows[rows.length-1]].forEach(function(r,i){h+='<div class="energy-price-view"><span>'+(i?'Más caro':'Más barato')+' · '+escHtml(r.supplier)+'</span><b>'+r.value.toLocaleString('es-ES',{maximumFractionDigits:6})+' '+type.unit+'</b></div>';});});return h+'</section>';
}
function energySummaryHtml(kind,year){
  var s=energyYearIndicators(kind,year),h='<section class="energy-contract"><h3>Compañías · de la más reciente a la anterior</h3>';
  var cs=energyContracts().filter(function(c){return c.kind===kind&&c.start;}).sort(function(a,b){return b.start.localeCompare(a.start);});
  cs.forEach(function(c){h+='<div class="energy-supplier-row"><i style="background:'+energySupplierColor(c.supplier)+'"></i><div><b>'+escHtml(c.supplier)+'</b><small>'+escHtml(c.start+' → '+(c.end||'actualidad'))+'</small>'+(c.summaryNote?'<p class="energy-caption">'+escHtml(c.summaryNote)+'</p>':'')+'</div></div>';});
  h+=(cs.length?'':'<p>Importa el histórico de contratos.</p>')+'</section><div class="energy-metrics">';
  h+=energyMetric('Consumo del año',energyNumber(s.days?s.kwh:null,'kWh'),s.days+' días con lectura');
  h+=energyMetric('Media diaria',energyNumber(s.days?s.kwh/s.days:null,'kWh'),'Solo días documentados');
  h+=energyMetric('Media mensual',energyNumber(s.active?s.kwh/s.active:null,'kWh'),s.active+' meses con datos, incluidos parciales');
  h+=energyMetric('Equivalente anual',energyNumber(s.days?s.kwh/s.days*(new Date(year,1,29).getMonth()===1?366:365):null,'kWh'),'Proyección de la media diaria, no consumo medido');
  if(kind==='luz')['Punta','Llano','Valle'].forEach(function(n,i){var daily=s.periodDays?s.periods[i]/s.periodDays:null;h+=energyMetric(n+' · año',energyNumber(s.periodDays?s.periods[i]:null,'kWh'),daily===null?'Sin desglose':energyNumber(daily,'kWh')+'/día · '+energyNumber(daily*365.25/12,'kWh')+'/mes equivalente');});
  var taxes=[['IVA facturado',s.vat],[kind==='luz'?'Otros impuestos':'Impuesto de hidrocarburos',s.otherTax]];if(kind==='luz')taxes.splice(1,0,['Impuesto eléctrico',s.electricityTax]);
  taxes.forEach(function(t){h+=energyMetric(t[0],energyNumber(t[1].value,'€'),t[1].count+'/'+t[1].total+' facturas con dato');});
  h+=energyMetric('Servicios adicionales',energyNumber(s.services,'€'),'Mantenimiento y asistencia; fuera del coste del suministro');
  h+='</div><p class="energy-caption">Impuestos por fecha de emisión. Se muestran importes documentados, no acreditación del pago bancario. Los datos ausentes no se convierten en cero.</p>'+energyPriceExtremes(kind,year);return h;
}
function energyVatStrip(months,year){
  var bands=[];
  months.forEach(function(m,i){var days=new Date(Date.UTC(year,i+1,0)).getUTCDate();m.vatBands.forEach(function(b){
    var left=(i+(+b.start.slice(8)-1)/days)/12*100,right=(i+(+b.end.slice(8))/days)/12*100,last=bands[bands.length-1];
    if(last&&last.rate===b.rate&&energyUtc(b.start)===energyUtc(last.end)+1){last.right=right;last.end=b.end;}
    else bands.push({left:left,right:right,start:b.start,end:b.end,rate:b.rate});
  });});
  return '<div class="energy-vat-strip" aria-label="Tramos de IVA">'+bands.map(function(b){
    var label=b.rate===null?'IVA sin dato':b.rate+' %',color=b.rate===null?'var(--border)':energySupplierColor('IVA '+b.rate);
    return '<span style="left:'+b.left+'%;width:'+(b.right-b.left)+'%;border-color:'+color+'" title="'+b.start+' → '+b.end+' · '+label+'">'+label+'</span>';
  }).join('')+'</div>';
}
function energyCompareChart(base,sim){
  var max=1;base.concat(sim).forEach(function(m){if(m.gross!==null)max=Math.max(max,m.gross);});
  var h='<div class="energy-compare-chart" aria-label="Coste real estimado frente al escenario">';base.forEach(function(m,i){h+='<div><div class="energy-compare-pair">';[m,sim[i]].forEach(function(v,j){h+='<span style="height:'+(v.gross===null?0:Math.max(0,v.gross)/max*130)+'px;background:'+(j?'#ac7db5':'#65a367')+'" title="'+MN_SHORT[i]+' · '+(j?'Escenario':'Real estimado')+' · '+energyNumber(v.gross,'€')+'"></span>';});h+='</div><small>'+MN_SHORT[i]+'</small></div>';});return h+'</div><p class="energy-caption">Verde: contratos reales estimados · Morado: escenario</p>';
}
function energyCompareTable(base,sim){
  var diff=0,n=0,h='<div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>Real estimado</th><th>Escenario</th><th>Ahorro</th></tr></thead><tbody>';
  base.forEach(function(a,i){var b=sim[i],d=a.gross===null||b.gross===null?null:a.gross-b.gross;if(d!==null){diff+=d;n++;}h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(a.gross,'€')+'</td><td>'+energyNumber(b.gross,'€')+'</td><td>'+energyNumber(d,'€')+'</td></tr>';});return '<p class="energy-scenario-result">'+(diff>=0?'Habrías ahorrado: ':'Habrías pagado de más: ')+energyNumber(n?Math.abs(diff):null,'€')+'</p>'+h+'</tbody></table></div><p class="energy-caption">'+n+' meses comparables; mismo consumo y cobertura. El caso real también es un cálculo por tarifas.</p>';
}
