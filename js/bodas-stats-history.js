/* ============================================================
   BODAS — Histórico y récords de Estadísticas
   Funciones puras sobre la lista de clases (todas las registradas,
   también futuras y sin pareja, como «Ritmo programado»).
   ============================================================ */

/* Meses YYYY-MM desde la primera clase hasta la última o el mes actual. */
function bodaMonthSeries(all,today){
  var counts={};
  all.forEach(function(ev){var k=ev.start.slice(0,7);counts[k]=(counts[k]||0)+1;});
  var keys=Object.keys(counts).sort(),now=evDk(today).slice(0,7);
  if(!keys.length)return [];
  var last=keys[keys.length-1]>now?keys[keys.length-1]:now,out=[];
  var y=+keys[0].slice(0,4),m=+keys[0].slice(5,7)-1;
  for(var guard=0;guard<600;guard++){
    var key=y+'-'+String(m+1).padStart(2,'0');
    out.push({key:key,year:y,month:m,value:counts[key]||0,current:key===now});
    if(key===last)break;
    m++;if(m>11){m=0;y++;}
  }
  return out;
}
/* Semanas (lunes) desde la primera clase hasta la última o la semana actual. */
function bodaWeekSeries(all,today){
  var counts={};
  all.forEach(function(ev){var k=_bodaWeekKey(new Date(ev.start+'T00:00:00'));counts[k]=(counts[k]||0)+1;});
  var keys=Object.keys(counts).sort(),now=_bodaWeekKey(today);
  if(!keys.length)return [];
  var last=keys[keys.length-1]>now?keys[keys.length-1]:now,out=[];
  var d=new Date(keys[0]+'T00:00:00');
  for(var guard=0;guard<2000;guard++){
    var key=evDk(d);
    out.push({key:key,value:counts[key]||0,current:key===now});
    if(key>=last)break;
    d.setDate(d.getDate()+7);
  }
  return out;
}
/* Récords: mejor mes, mejor tramo de 30 días y mejor año, con su ritmo semanal. */
function bodaStatsRecords(all){
  if(!all.length)return null;
  var months={},years={};
  all.forEach(function(ev){var k=ev.start.slice(0,7),y=ev.start.slice(0,4);months[k]=(months[k]||0)+1;years[y]=(years[y]||0)+1;});
  function best(map){var top=null;Object.keys(map).sort().forEach(function(k){if(!top||map[k]>map[top])top=k;});return top;}
  var month=best(months),year=best(years);
  var days=new Date(+month.slice(0,4),+month.slice(5,7),0).getDate();
  /* Ventana deslizante de 30 días naturales sobre las fechas ordenadas. */
  var times=all.map(function(ev){return Date.parse(ev.start+'T12:00:00Z');}).sort(function(a,b){return a-b;});
  var span=29*86400000,j=0,top=0,from=times[0];
  for(var i=0;i<times.length;i++){
    while(times[i]-times[j]>span)j++;
    if(i-j+1>top){top=i-j+1;from=times[j];}
  }
  var start=new Date(from).toISOString().slice(0,10),end=new Date(from+span).toISOString().slice(0,10);
  return {
    month:{key:month,value:months[month],perWeek:months[month]/(days/7)},
    window:{start:start,end:end,value:top,perWeek:top/(30/7)},
    year:{key:year,value:years[year]}
  };
}
function bodaFmtRate(n){return (Math.round(n*10)/10).toFixed(1).replace('.',',');}
function renderBodaRecords(all){
  var r=bodaStatsRecords(all);if(!r)return '';
  var monthLabel=MN[+r.month.key.slice(5,7)-1]+' '+r.month.key.slice(0,4);
  var range=r.window.start.slice(8)+'/'+r.window.start.slice(5,7)+' – '+r.window.end.slice(8)+'/'+r.window.end.slice(5,7)+'/'+r.window.end.slice(2,4);
  var h='<div class="boda-records">';
  [[r.month.value,'Mejor mes',monthLabel,bodaFmtRate(r.month.perWeek)+' clases / semana'],
   [r.window.value,'Mejores 30 días',range,bodaFmtRate(r.window.perWeek)+' clases / semana'],
   [r.year.value,'Mejor año',r.year.key,'']].forEach(function(x){
    h+='<div class="boda-record"><span class="boda-record-title">'+x[1]+'</span><b>'+x[0]+'<small> clases</small></b><span>'+escHtml(x[2])+'</span>'+(x[3]?'<span class="boda-record-rate">'+x[3]+'</span>':'')+'</div>';
  });
  return renderStatsCard('Récords',h+'</div>');
}
/* Barras con scroll horizontal: anchura fija por barra y foco en el periodo actual. */
function bodaScrollBarChart(items,labelOf,color,label){
  if(!items.length)return '<div class="sy-note">Sin datos.</div>';
  var slot=30,bw=20,H=96,PT=14,PB=30,W=items.length*slot,max=1,focus=0;
  items.forEach(function(it,i){if(it.value>max)max=it.value;if(it.current)focus=i;});
  var svg='<svg class="boda-scroll-svg" width="'+W+'" height="'+(H+PB)+'" viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg">';
  items.forEach(function(it,i){
    var x=i*slot+(slot-bw)/2,bh=it.value>0?Math.max(2,Math.round(it.value/max*(H-PT))):0,l=labelOf(it,i);
    svg+='<line x1="'+(x-.5)+'" y1="'+H+'.5" x2="'+(x+bw+.5)+'" y2="'+H+'.5" stroke="currentColor" stroke-opacity=".18"/>';
    if(bh)svg+='<rect x="'+x+'" y="'+(H-bh)+'" width="'+bw+'" height="'+bh+'" rx="3" fill="'+color+'" opacity="'+(it.current?1:.6)+'"/>';
    if(it.value)svg+='<text x="'+(x+bw/2)+'" y="'+(H-bh-4)+'" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor">'+it.value+'</text>';
    svg+='<text x="'+(x+bw/2)+'" y="'+(H+13)+'" text-anchor="middle" font-size="9.5" fill="currentColor"'+(it.current?' font-weight="700"':' fill-opacity=".75"')+'>'+escHtml(l[0])+'</text>';
    if(l[1])svg+='<text x="'+(x+bw/2)+'" y="'+(H+25)+'" text-anchor="middle" font-size="9" font-weight="600" fill="currentColor" fill-opacity=".6">'+escHtml(l[1])+'</text>';
  });
  svg+='</svg>';
  return '<div class="boda-scroll-chart" role="img" aria-label="'+escHtml(label)+'" tabindex="0" data-focus="'+focus+'" data-slot="'+slot+'">'+svg+'</div>';
}
function renderBodaHistoryCharts(all,today){
  var months=bodaMonthSeries(all,today),weeks=bodaWeekSeries(all,today);
  var h=renderStatsCard('Clases por mes',bodaScrollBarChart(months,function(it,i){return [MN_SHORT[it.month],it.month===0||i===0?String(it.year):''];},'#c08a5a','Clases por mes desde la primera clase'));
  h+=renderStatsCard('Clases por semana',bodaScrollBarChart(weeks,function(it,i){var prev=weeks[i-1];return [it.key.slice(8)+'/'+it.key.slice(5,7),!prev||prev.key.slice(0,4)!==it.key.slice(0,4)?it.key.slice(0,4):''];},'#e879a8','Clases por semana desde la primera clase'));
  return h;
}
/* Coloca cada gráfico con el periodo actual a la vista, cerca del borde derecho. */
function bindBodaHistoryCharts(root){
  (root||document).querySelectorAll('.boda-scroll-chart[data-focus]').forEach(function(el){
    var slot=+el.dataset.slot,focus=+el.dataset.focus;
    el.scrollLeft=Math.max(0,(focus+1)*slot-el.clientWidth+slot*2);
  });
}
