/* Estadísticas de Wedding Moves: filtro por año, contratadas frente a
   asignadas, antelación de la primera clase, bodas por mes y mapa de día ×
   franja. Renders puros; el filtro se engancha en bindBodasEvents. */
var BODA_STATS_YEAR = null;   /* null = todos los años | número de año */

function bodaStatsYears(all){
  var seen={};
  all.forEach(function(ev){seen[ev.start.slice(0,4)]=1;});
  BODA_COUPLES.forEach(function(c){if(c.weddingDate)seen[c.weddingDate.slice(0,4)]=1;});
  return Object.keys(seen).map(Number).sort(function(a,b){return b-a;});
}
function bodaStatsInYear(ds){return !BODA_STATS_YEAR||(!!ds&&+ds.slice(0,4)===BODA_STATS_YEAR);}
function bodaStatsCouples(){
  return BODA_COUPLES.filter(function(c){return !BODA_STATS_YEAR||bodaStatsInYear(c.weddingDate);});
}
function renderBodaYearChips(all){
  var years=bodaStatsYears(all);
  if(BODA_STATS_YEAR&&years.indexOf(BODA_STATS_YEAR)===-1)BODA_STATS_YEAR=null;
  if(years.length<2)return '';
  var h='<div class="boda-chips boda-stats-years" role="group" aria-label="Año de las estadísticas">';
  h+='<button class="boda-chip'+(BODA_STATS_YEAR?'':' active')+'" data-bstats-year="" aria-pressed="'+!BODA_STATS_YEAR+'">Todos</button>';
  years.forEach(function(y){h+='<button class="boda-chip'+(BODA_STATS_YEAR===y?' active':'')+'" data-bstats-year="'+y+'" aria-pressed="'+(BODA_STATS_YEAR===y)+'">'+y+'</button>';});
  return h+'</div>';
}

/* Contratadas, asignadas (sin contar extras) y pendientes de asignar. */
function bodaComplianceStats(couples){
  var s={contracted:0,assigned:0,extras:0,missing:0};
  couples.forEach(function(c){
    var p=bodaProgress(c);
    s.contracted+=p.total;s.assigned+=Math.min(p.done,p.total);
    s.extras+=Math.max(0,p.done-p.total);s.missing+=p.falta;
  });
  return s;
}
/* Días entre la primera clase y la boda, solo parejas con ambas fechas. */
function bodaLeadStats(couples){
  var days=[];
  couples.forEach(function(c){
    var first=c.weddingDate&&bodaPrimeraClase(c.id);
    if(!first||first>c.weddingDate)return;
    days.push(Math.round((new Date(c.weddingDate+'T00:00:00')-new Date(first+'T00:00:00'))/86400000));
  });
  if(!days.length)return null;
  var sum=days.reduce(function(a,b){return a+b;},0);
  return {avg:sum/days.length,min:Math.min.apply(null,days),max:Math.max.apply(null,days),n:days.length};
}
function renderBodaCompliance(couples){
  var s=bodaComplianceStats(couples);
  if(!s.contracted&&!s.extras)return '';
  var pct=s.contracted?Math.round(s.assigned*100/s.contracted):0;
  return renderStatsCard('Contratadas y asignadas',renderStatsMetrics([[s.contracted,'contratadas'],[s.assigned,'asignadas · '+pct+' %'],[s.missing,'por asignar']],3),
    s.extras?(s.extras+(s.extras===1?' clase extra':' clases extras')):'','boda-stats-compliance');
}
function renderBodaLead(couples){
  var s=bodaLeadStats(couples);
  if(!s)return '';
  return renderStatsCard('Antelación de la primera clase',renderStatsMetrics([[Math.round(s.avg),'días de media'],[bodaFmtRate(s.avg/7),'semanas de media']]),
    'De '+s.min+' a '+s.max+' días · '+s.n+(s.n===1?' pareja':' parejas'),'boda-stats-lead');
}
function renderBodaSeason(couples){
  var counts=MN_SHORT.map(function(){return 0;}),any=false;
  couples.forEach(function(c){if(c.weddingDate){counts[+c.weddingDate.slice(5,7)-1]++;any=true;}});
  if(!any)return '';
  return renderStatsCard('Bodas por mes',simpleBarChart(counts,MN_SHORT,'#a0703f',{height:70}),'','boda-stats-season');
}
/* Mapa de día de la semana × franja horaria; las clases sin hora no cuentan. */
function bodaHeatData(all){
  var grid=[0,1,2,3,4,5,6].map(function(){return BODA_SLOTS.map(function(){return 0;});}),max=0;
  all.forEach(function(ev){
    var slot=bodaSlot(ev.boda&&ev.boda.time);if(!slot)return;
    var si=BODA_SLOTS.findIndex(function(x){return x.label===slot.label;}),wd=new Date(ev.start+'T00:00:00').getDay(),di=wd===0?6:wd-1;
    if(si<0)return;
    grid[di][si]++;if(grid[di][si]>max)max=grid[di][si];
  });
  return {grid:grid,max:max};
}
function renderBodaHeatmap(all){
  var d=bodaHeatData(all);
  if(!d.max)return '';
  var DAYS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var h='<div class="boda-heat" style="--heat-cols:'+BODA_SLOTS.length+'" role="table" aria-label="Clases por día y franja">';
  h+='<div class="boda-heat-row" role="row"><span role="columnheader"></span>';
  BODA_SLOTS.forEach(function(s){h+='<span class="boda-heat-h" role="columnheader">'+escHtml(s.label.replace(' h',''))+'</span>';});
  h+='</div>';
  d.grid.forEach(function(row,di){
    h+='<div class="boda-heat-row" role="row"><span class="boda-heat-d" role="rowheader">'+DAYS[di]+'</span>';
    row.forEach(function(n,si){
      var pct=n?Math.round(18+82*n/d.max):0;
      h+='<span class="boda-heat-c'+(pct>55?' strong':'')+'" role="cell" aria-label="'+DAYS[di]+' '+escHtml(BODA_SLOTS[si].label)+': '+n+'"'
        +(n?' style="--heat:'+pct+'%"':'')+'>'+(n||'')+'</span>';
    });
    h+='</div>';
  });
  return renderStatsCard('Día y franja',h+'</div>','','boda-stats-heat');
}
