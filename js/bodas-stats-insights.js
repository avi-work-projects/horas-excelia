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
/* Desplegable de año: lista con scroll vertical que abre en el año elegido
   (o en el actual con «Todos»); solo años con clases o bodas. */
function renderBodaYearPicker(all){
  var years=bodaStatsYears(all);
  if(BODA_STATS_YEAR&&years.indexOf(BODA_STATS_YEAR)===-1)BODA_STATS_YEAR=null;
  if(years.length<2)return '';
  var label=BODA_STATS_YEAR?String(BODA_STATS_YEAR):'Todos los años';
  var h='<div class="boda-year-pick"><button type="button" class="boda-year-btn" id="bodaYearBtn" aria-haspopup="listbox" aria-expanded="false">'+label+'<span class="ev-tax-chevron" aria-hidden="true"></span></button>';
  h+='<div class="boda-year-list" id="bodaYearList" role="listbox" aria-label="Año de las estadísticas" hidden>';
  [null].concat(years).forEach(function(y){
    var on=BODA_STATS_YEAR===y;
    h+='<button type="button" role="option" class="boda-year-opt'+(on?' on':'')+'" aria-selected="'+on+'" data-bstats-year="'+(y||'')+'">'+(y||'Todos los años')+'</button>';
  });
  return h+'</div></div>';
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
/* Resumen compacto: una fila por tema (Parejas, Clases, Ritmo, Contratadas,
   Antelación) con la cifra principal y su desglose al lado. */
function bodaSumRow(label,main,parts,sub,mainAttrs){
  var m=mainAttrs?'<button type="button" class="boda-sum-main"'+mainAttrs+'>'+main+'</button>':'<span class="boda-sum-main">'+main+'</span>';
  return '<div class="boda-sum-row"><span class="boda-sum-lbl">'+label+'</span>'+m+'<div class="boda-sum-parts">'+parts.join('')+(sub?'<small>'+sub+'</small>':'')+'</div></div>';
}
function bodaSumPart(n,label,attrs){
  return attrs?'<button type="button" class="boda-sum-part"'+attrs+'><b>'+n+'</b> '+label+'</button>':'<span class="boda-sum-part"><b>'+n+'</b> '+label+'</span>';
}
function renderBodaSummary(all,todas,couples){
  var o=bodaStatsOverview(all),c=bodaComplianceStats(couples),lead=bodaLeadStats(couples);
  var pool=BODA_STATS_YEAR?couples:BODA_COUPLES;
  function n(f){return pool.filter(function(x){return bodaMatchesDate(x,f);}).length;}
  var h='<section class="stats-section boda-stats-summary" aria-label="Resumen"><header class="stats-head"><h3>Resumen</h3>'+renderBodaYearPicker(todas)+'</header>';
  h+=bodaSumRow('Parejas','<b>'+pool.length+'</b>',[bodaSumPart(n('pasadas'),'pasadas',' data-stats-couples="pasadas"'),bodaSumPart(n('activas'),'en curso',' data-stats-couples="activas"'),bodaSumPart(n('futuras'),'próximas',' data-stats-couples="futuras"')],
    o.taught+(o.taught===1?' pareja ha recibido alguna clase':' parejas han recibido alguna clase'),' id="bodaStatsCouples" data-stats-couples="todas" aria-label="Ver todas las parejas"');
  h+=bodaSumRow('Clases','<b>'+o.total+'</b>',[bodaSumPart(o.taken,'impartidas'),bodaSumPart(o.pending,'pendientes'),bodaSumPart(o.unassigned,o.unassigned===1?'hueco sin asignar':'huecos sin asignar')]);
  if(all.length){
    var first=all[0].start,last=all[all.length-1].start;
    var days=Math.max(1,Math.round((new Date(last+'T00:00:00')-new Date(first+'T00:00:00'))/86400000)+1);
    h+=bodaSumRow('Ritmo','<b>'+bodaFmtRate(all.length/(days/7))+'</b><small>/ sem</small>',[bodaSumPart(bodaFmtRate(all.length/(days/30.44)),'/ mes')],_bodaFmt(first)+' – '+_bodaFmt(last));
  }
  if(c.contracted||c.extras){
    var pct=c.contracted?Math.round(c.assigned*100/c.contracted):0;
    h+=bodaSumRow('Contratadas','<b>'+c.contracted+'</b>',[bodaSumPart(c.assigned,'asignadas · '+pct+' %'),bodaSumPart(c.missing,'por asignar')].concat(c.extras?[bodaSumPart(c.extras,c.extras===1?'extra':'extras')]:[]));
  }
  if(lead)h+=bodaSumRow('Antelación','<b>'+Math.round(lead.avg)+'</b><small>días</small>',[bodaSumPart(bodaFmtRate(lead.avg/7),'semanas')],'De '+lead.min+' a '+lead.max+' días · '+lead.n+(lead.n===1?' pareja':' parejas'));
  return h+'</section>';
}
function renderBodaSeason(couples){
  var counts=MN_SHORT.map(function(){return 0;}),any=false;
  couples.forEach(function(c){if(c.weddingDate){counts[+c.weddingDate.slice(5,7)-1]++;any=true;}});
  if(!any)return '';
  return renderStatsCard('Bodas por mes','<div data-swipe-lock>'+simpleBarChart(counts,MN_SHORT,'#a0703f',{height:70})+'</div>','','boda-stats-season');
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
