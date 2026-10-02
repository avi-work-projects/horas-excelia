var ENERGY_BILLS_YEAR=new Date().getFullYear();
var ENERGY_BILLS_COST='paid';
function energyNumber(n,unit,decimals){return n===null?'Sin dato':n.toLocaleString('es-ES',{maximumFractionDigits:decimals==null?(unit==='kWh'?0:2):decimals,minimumFractionDigits:unit==='€'?2:0})+' '+unit;}
function energyBillsChart(months,field,color){
  var known=months.map(function(m){return (field==='consumption'&&m.days?Object.keys(m.days).length>0:m.count>0)&&!(field==='consumption'&&(m.unknownConsumption||m.overlap))&&!(field==='paid'&&m.unknownPaid);});
  var scale=field==='consumption'?1:100;
  var values=months.map(function(m,i){return known[i]?Math.round(m[field]*scale)/scale:0;});
  // El gráfico compartido no dibuja negativos. Los abonos se conservan en la tabla.
  return simpleBarChart(values,MN_SHORT.map(function(s,i){return known[i]?s:'·';}),color,{height:95})+'<p class="energy-caption">· Sin datos completos'+(values.some(function(v){return v<0;})?' · Abonos negativos detallados en la tabla':'')+'</p>';
}
/* Documentos de origen: solo importación y consulta. */
function openEnergyBills(kind){ENERGY_ANALYSIS_TAB='archivo';openEnergyAnalysis(kind);}
