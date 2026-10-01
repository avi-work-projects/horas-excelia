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
function energyInfoHtml(title,body){return '<details class="energy-info"><summary>'+escHtml(title)+'</summary><div>'+body+'</div></details>';}
function energySectionTitle(title,meta){return '<div class="energy-section-title"><h3>'+escHtml(title)+'</h3>'+(meta?'<span>'+escHtml(meta)+'</span>':'')+'</div>';}
function energyPeriodsHtml(s){
  var names=['Punta','Llano','Valle'],total=s.periods.reduce(function(a,b){return a+b;},0);
  var h='<section class="energy-contract">'+energySectionTitle('Reparto por tramos',s.periodDays+' días desglosados')+'<div class="energy-period-track" aria-hidden="true">';
  s.periods.forEach(function(v,i){h+='<span class="energy-period-'+i+'" style="flex-grow:'+(total?v/total:1)+'"></span>';});
  h+='</div><div class="energy-period-values">';
  names.forEach(function(n,i){h+='<div class="energy-period-'+i+'"><span>'+n+'</span><strong>'+energyNumber(s.periodDays?s.periods[i]:null,'kWh')+'</strong><small>'+(s.periodDays&&total?(s.periods[i]/total*100).toFixed(0)+' %':'Sin desglose')+'</small></div>';});
  h+='</div>';
  var note='<p>Solo lecturas con los tres tramos informados.</p>';
  names.forEach(function(n,i){var daily=s.periodDays?s.periods[i]/s.periodDays:null;note+='<p>'+n+': '+energyNumber(daily,'kWh')+'/día · '+energyNumber(daily===null?null:daily*365.25/12,'kWh')+'/mes equivalente.</p>';});
  return h+energyInfoHtml('Medias por tramo',note)+'</section>';
}
function energySuppliersHtml(kind){
  var cs=energyContracts().filter(function(c){return c.kind===kind&&c.start;}).sort(function(a,b){return b.start.localeCompare(a.start);});
  var h='<section class="energy-contract">'+energySectionTitle('Compañías','Histórico completo');
  cs.forEach(function(c){
    h+='<div class="energy-supplier-row"><i style="background:'+energySupplierColor(c.supplier)+'"></i><div><b>'+escHtml(c.supplier)+'</b><small>'+_rutFmt(c.start)+' – '+(c.end?_rutFmt(c.end):'actualidad')+'</small>'+(c.summaryNote?energyInfoHtml('Nota del contrato','<p>'+escHtml(c.summaryNote)+'</p>'):'')+'</div>';
    if(!c.end&&c.start<=evDk(new Date()))h+='<span class="energy-status-pill">Actual</span>';
    h+='</div>';
  });
  return h+(cs.length?'':'<p class="energy-caption">Importa el histórico de contratos.</p>')+'</section>';
}
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
  var h='<section class="energy-contract">'+energySectionTitle('Precios mínimos y máximos','Sin impuestos');
  types.forEach(function(type){if(kind!=='luz'&&type.name!=='Consumo')return;var rows=[];energyContracts().filter(function(c){return c.kind===kind;}).forEach(function(c){var ps=energyContractPeriods(c).slice().sort(function(a,b){return a.start.localeCompare(b.start);});ps.forEach(function(p,i){var end=ps[i+1]?energyDate(energyUtc(ps[i+1].start)-1):(c.end||'9999-12-31');if(p.start>year+'-12-31'||end<year+'-01-01')return;var n=type.value(p.tariff);if(n!==null)rows.push({value:n,supplier:c.supplier});});});rows.sort(function(a,b){return a.value-b.value;});h+='<h4>'+type.name+'</h4>';if(!rows.length){h+='<p class="energy-caption">Sin precios comparables</p>';return;}h+='<div class="energy-extremes">';[rows[0],rows[rows.length-1]].forEach(function(r,i){h+='<div><span>'+(i?'Máximo':'Mínimo')+'</span><strong>'+energyUnitPrice(r.value)+'</strong><small>'+type.unit+'</small><b>'+escHtml(r.supplier)+'</b></div>';});h+='</div>';});
  return h+energyInfoHtml('Criterio de comparación','<p>Extremos de las tarifas vigentes en el año. En consumo por tramos se compara la media ponderada; una cuota fija no es comparable por kWh.</p>')+'</section>';
}
function energySummaryHtml(kind,year){
  var s=energyYearIndicators(kind,year),h='<section class="energy-overview"><span>Consumo registrado · '+year+'</span><strong>'+energyNumber(s.days?s.kwh:null,'kWh')+'</strong><small>'+s.days+' días con lectura · '+s.active+' meses con datos</small><div class="energy-overview-averages">';
  h+=energyMetric('Media diaria',energyNumber(s.days?s.kwh/s.days:null,'kWh'),'');
  h+=energyMetric('Media mensual',energyNumber(s.active?s.kwh/s.active:null,'kWh'),'');
  h+='</div>'+energyInfoHtml('Cobertura y proyección','<p>Medias de los días y meses documentados, incluidos los parciales. No se completan los meses sin lecturas.</p><p>Proyección anual: <b>'+energyNumber(s.days?s.kwh/s.days*(new Date(year,1,29).getMonth()===1?366:365):null,'kWh')+'</b>. Es una extrapolación de la media diaria, no consumo medido.</p>')+'</section>';
  if(kind==='luz')h+=energyPeriodsHtml(s);
  h+=energySuppliersHtml(kind);
  h+='<section class="energy-contract">'+energySectionTitle('Impuestos y servicios',year+' · emisión')+'<div class="energy-tax-totals">';
  var taxes=[['IVA facturado',s.vat],[kind==='luz'?'Otros impuestos':'Impuesto de hidrocarburos',s.otherTax]];if(kind==='luz')taxes.splice(1,0,['Impuesto eléctrico',s.electricityTax]);
  taxes.forEach(function(t){h+='<div><span>'+t[0]+'<small>'+t[1].count+'/'+t[1].total+' facturas con dato</small></span><b>'+energyNumber(t[1].value,'€')+'</b></div>';});
  h+='<div><span>Servicios adicionales<small>Fuera del coste del suministro</small></span><b>'+energyNumber(s.services,'€')+'</b></div></div>';
  h+=energyInfoHtml('Qué incluyen estos importes','<p>Impuestos por fecha de emisión. Son importes documentados, no acreditación del pago bancario. Los datos ausentes no se convierten en cero. Servicios adicionales: mantenimiento y asistencia.</p>')+'</section>'+energyPriceExtremes(kind,year);return h;
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
  var h='<div class="energy-compare-chart" aria-label="Coste real estimado frente al escenario">';base.forEach(function(m,i){h+='<div><div class="energy-compare-pair">';[m,sim[i]].forEach(function(v,j){h+='<span style="height:'+(v.gross===null?0:Math.max(0,v.gross)/max*130)+'px;background:'+(j?'#ac7db5':'#65a367')+'" title="'+MN_SHORT[i]+' · '+(j?'Escenario':'Real estimado')+' · '+energyNumber(v.gross,'€')+'"></span>';});h+='</div><small>'+MN_SHORT[i]+'</small></div>';});return h+'</div><div class="energy-legend"><span><i style="background:#65a367"></i>Contratos reales · estimado</span><span><i style="background:#ac7db5"></i>Escenario</span></div>';
}
function energyCompareTable(base,sim){
  var diff=0,n=0,h='<div class="energy-table-scroll"><table class="sy-table"><thead><tr><th>Mes</th><th>Real estimado</th><th>Escenario</th><th>Ahorro</th></tr></thead><tbody>';
  base.forEach(function(a,i){var b=sim[i],d=a.gross===null||b.gross===null?null:a.gross-b.gross;if(d!==null){diff+=d;n++;}h+='<tr><td>'+MN_SHORT[i]+'</td><td>'+energyNumber(a.gross,'€')+'</td><td>'+energyNumber(b.gross,'€')+'</td><td>'+energyNumber(d,'€')+'</td></tr>';});return '<div class="energy-scenario-result"><span>'+(diff>=0?'Ahorro estimado':'Coste adicional')+'</span><strong>'+energyNumber(n?Math.abs(diff):null,'€')+'</strong><small>'+n+' meses comparables · mismo consumo</small></div>'+energyInfoHtml('Comparación mes a mes',h+'</tbody></table></div><p>El caso real también es un cálculo por tarifas. Se comparan los mismos días con datos.</p>');
}
