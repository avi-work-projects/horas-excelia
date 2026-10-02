/* Importes recurrentes por vigencias. El formato simple sigue siendo válido. */
var PERSONAL_SECTIONS=['gastosSemanales','gastosRecurrentes','inversiones','ingresos'];
function personalDay(ds){return Date.parse(ds+'T00:00:00Z')/86400000;}
function personalDate(day){return new Date(day*86400000).toISOString().slice(0,10);}
function personalFactor(period){return period==='weekly'?52:period==='annual'?1:12;}
function personalPeriods(item,year,section){
  return Array.isArray(item.periods)?item.periods.map(function(p){return Object.assign({},p);})
    :[{start:year+'-01-01',end:year+'-12-31',amount:item.amount||0,period:item.period||(section==='gastosSemanales'?'weekly':'monthly'),paused:false}];
}
function personalAnnual(item,year,section,weeklyAdjustment){
  var first=personalDay(year+'-01-01'),last=personalDay(year+'-12-31'),total=0,weekly=0;
  personalPeriods(item,year,section).forEach(function(p){
    var days=Math.max(0,Math.min(last,personalDay(p.end||year+'-12-31'))-Math.max(first,personalDay(p.start))+1);
    if(!p.paused){var value=(Number(p.amount)||0)*personalFactor(p.period)*days/(last-first+1);if(weeklyAdjustment&&p.period==='weekly')weekly+=value*.82;else total+=value;}
  });
  return total+(weeklyAdjustment?Math.ceil(weekly):0);
}
function personalValidatePeriods(periods,year){
  if(!Array.isArray(periods)||!periods.length||periods.length>100)throw new Error('Añade al menos un período (máximo 100).');
  periods.forEach(function(p){if(!p||typeof p!=='object'||!validIsoDate(p.start)||!validIsoDate(p.end))throw new Error('Revisa las fechas de cada período.');});
  var end='';periods.slice().sort(function(a,b){return a.start.localeCompare(b.start);}).forEach(function(p){
    if(!validIsoDate(p.start)||!validIsoDate(p.end)||p.end<p.start||p.start.slice(0,4)!==String(year)||p.end.slice(0,4)!==String(year))throw new Error('Las fechas deben estar ordenadas dentro de '+year+'.');
    if(p.start<=end)throw new Error('Hay períodos que coinciden en fechas.');
    if(typeof p.amount!=='number'||!Number.isFinite(p.amount)||p.amount<0||['weekly','monthly','annual'].indexOf(p.period)<0||typeof p.paused!=='boolean')throw new Error('Revisa el importe y la frecuencia de cada período.');
    end=p.end;
  });return true;
}
function personalValidateData(data,year){
  if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Economía personal no válida');
  PERSONAL_SECTIONS.forEach(function(key){
    if(data[key]!=null&&!Array.isArray(data[key]))throw new Error('Lista personal no válida');
    (data[key]||[]).forEach(function(item){
      if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Concepto personal no válido');
      if(item.periods!=null){var y=year||(Array.isArray(item.periods)&&item.periods[0]&&String(item.periods[0].start||'').slice(0,4));personalValidatePeriods(item.periods,y);}
    });
  });return true;
}
function personalPauseFrom(periods,from,year){
  if(!validIsoDate(from)||from.slice(0,4)!==String(year))throw new Error('Elige una fecha de '+year+'.');
  var sorted=periods.slice().sort(function(a,b){return a.start.localeCompare(b.start);});
  var previous=sorted.filter(function(p){return p.start<=from;}).pop()||sorted[0],out=[];
  sorted.forEach(function(p){if(p.start<from)out.push(Object.assign({},p,{end:p.end<from?p.end:personalDate(personalDay(from)-1)}));});
  out.push({start:from,end:year+'-12-31',amount:previous.amount,period:previous.period,paused:true});return out;
}
function personalCopyYear(data,source,target){
  var copy=JSON.parse(JSON.stringify(data)),boundary=source+(target>source?'-12-31':'-01-01');
  PERSONAL_SECTIONS.forEach(function(key){(copy[key]||[]).forEach(function(item){
    if(!Array.isArray(item.periods))return;
    var sorted=item.periods.slice().sort(function(a,b){return a.start.localeCompare(b.start);});
    var active=sorted.find(function(p){return p.start<=boundary&&p.end>=boundary;}),ref=active||(target>source?sorted[sorted.length-1]:sorted[0]);
    if(!ref)return;
    item.amount=ref.amount;item.period=ref.period;
    item.periods=[{start:target+'-01-01',end:target+'-12-31',amount:ref.amount,period:ref.period,paused:!active||ref.paused}];
  });});return copy;
}
function personalPeriodLabel(p){return p==='weekly'?'/sem':p==='annual'?'/año':'/mes';}
