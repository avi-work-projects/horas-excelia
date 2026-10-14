/* Agregados por fechas registradas; no implica confirmación de asistencia. */
var EV_STATS_YEAR=new Date().getFullYear(); // 'all' o año numérico.
var EV_STATS_LAST_YEAR=new Date().getFullYear(); // Año al volver desde Total.
var EV_STATS_PERIOD='past'; // past (hasta hoy) | future (desde mañana) | all (ambos).
function evStatsGroup(ev){
  if(getEvKind(ev)==='grande')return 'grande|'+getEvType(ev);
  return evIsManagement(getEvType(ev))?'management':evIsPlan(getEvType(ev))?'plans':getEvType(ev)==='Ensayos boda'?'rehearsals':'other';
}
function computeEventStatistics(events,year,period,today){
  var rows={},groups={},allDays=new Set(),travelDays=new Set(),todayDs=evDk(today),next=new Date(today);next.setDate(next.getDate()+1);
  var from=year==='all'?'0000-01-01':year+'-01-01',until=year==='all'?'9999-12-31':year+'-12-31';
  if(period==='past')until=until<todayDs?until:todayDs;else if(period==='future')from=from>evDk(next)?from:evDk(next);
  events.forEach(function(ev){
    if(!ev.start||ev._rut||String(ev.id).indexOf('ev-bday-vip-')===0)return;
    var type=getEvType(ev),kind=getEvKind(ev),key=kind+'|'+type,dates=ev.dates&&ev.dates.length?ev.dates:null;
    var first=dates?dates.slice().sort()[0]:ev.start,last=dates?dates.slice().sort().pop():(ev.end||ev.start);
    var start=first>from?first:from,end=ev.repeat?until:(last<until?last:until);
    // Sin año concreto, las previsiones repetidas se limitan a los próximos 12 meses.
    if(ev.repeat&&year==='all'&&period!=='past'){var horizon=new Date(today);horizon.setFullYear(horizon.getFullYear()+1);end=evDk(horizon);}
    if(start>end)return;
    var active=[];
    if(dates)active=Array.from(new Set(dates)).filter(function(ds){return ds>=start&&ds<=end;});
    else for(var day=new Date(start+'T12:00:00');evDk(day)<=end;day.setDate(day.getDate()+1)){var ds=evDk(day);if(eventOccursOn(ev,ds))active.push(ds);}
    if(!active.length)return;
    var row=rows[key]||(rows[key]={key:key,type:type,kind:kind,group:evStatsGroup(ev),count:0,days:new Set(),color:evTypeColor(kind,type)});
    row.count+=kind==='grande'?1:active.length;
    var groupKey=kind==='grande'?'grandes':row.group,group=groups[groupKey]||(groups[groupKey]={count:0,days:new Set()});group.count+=kind==='grande'?1:active.length;
    active.forEach(function(ds){row.days.add(ds);group.days.add(ds);allDays.add(ds);if(kind==='grande'&&['Viaje','Asturias','Casa Rural'].indexOf(type)>=0)travelDays.add(ds);});
  });
  var list=Object.keys(rows).map(function(key){var row=rows[key];return Object.assign({},row,{days:row.days.size});});
  function count(type){var row=rows['grande|'+type];return row?row.count:0;}
  Object.keys(groups).forEach(function(key){groups[key].days=groups[key].days.size;});
  return {rows:list,groups:groups,plansDays:groups.plans?groups.plans.days:0,ruralDays:rows['grande|Casa Rural']?rows['grande|Casa Rural'].days.size:0,totalDays:allDays.size,travelDays:travelDays.size,trips:count('Viaje'),asturias:count('Asturias'),rural:count('Casa Rural')};
}
function renderEventStatistics(){
  var now=new Date(),stats=computeEventStatistics(EVENTS,EV_STATS_YEAR,EV_STATS_PERIOD,now);
  var h='<div class="ev-stat-controls"><div class="ev-stat-period">';
  [['past','Realizados'],['future','Futuros'],['all','Ambos']].forEach(function(p){h+='<button class="ev-sort-chip'+(EV_STATS_PERIOD===p[0]?' active':'')+'" aria-pressed="'+(EV_STATS_PERIOD===p[0])+'" data-stats-period="'+p[0]+'">'+p[1]+'</button>';});h+='</div></div>';
  h+='<p class="sy-note ev-stat-note">'+(EV_STATS_YEAR==='all'?'Todos los años':EV_STATS_YEAR)+' · Por fechas registradas · Inicio y fin incluidos.</p>';
  h+='<div class="ev-stat-cards">';
  [[stats.trips,'Viajes'],[stats.asturias,'Visitas a Asturias'],[stats.rural,'Casas Rurales'],[stats.travelDays,'Días Fuera'],[stats.plansDays,'Días de Planes'],[stats.ruralDays,'Días de Casa Rural']].forEach(function(c){h+='<div class="sy-card"><strong>'+c[0]+'</strong><span>'+c[1]+'</span></div>';});h+='</div>';
  h+='<div class="ev-stats-links"><span>Ver otras estadísticas:</span><button class="ev-view-toggle ev-btn-bodas" id="evStatsRehearsals" aria-label="Estadísticas de Wedding Moves"><span class="wm-logo" aria-hidden="true"></span></button><button class="ev-view-toggle ev-btn-rutinas" id="evStatsRoutines">Rutinas</button></div>';
  if(!stats.rows.length)return h+'<p class="sy-note">No hay eventos registrados en este período.</p>';
  [['grandes','Viajes y Estancias'],['management','Recordatorio Gestiones'],['plans','Planes y Quedadas'],['other','Otros Puntuales']].forEach(function(g){
    var rows=stats.rows.filter(function(r){return g[0]==='grandes'?r.kind==='grande':r.group===g[0];}).sort(function(a,b){return b.days-a.days||a.type.localeCompare(b.type,'es');});if(!rows.length)return;
    var showDays=g[0]!=='management'&&g[0]!=='plans';
    h+='<section class="ev-stat-section"><h3>'+g[1]+'</h3><table><thead><tr><th>Evento</th><th>'+(g[0]==='grandes'?'Viajes / Eventos':'Veces')+'</th>'+(showDays?'<th>Días</th>':'')+'</tr></thead><tbody>';
    rows.forEach(function(r){h+='<tr><th scope="row"><span class="ev-stat-dot" style="background:'+r.color+'"></span>'+escHtml(menuTitle(r.type))+'</th><td>'+r.count+'</td>'+(showDays?'<td>'+r.days+'</td>':'')+'</tr>';});h+='</tbody><tfoot><tr><th>Total</th><td>'+stats.groups[g[0]].count+'</td>'+(showDays?'<td>'+stats.groups[g[0]].days+'</td>':'')+'</tr></tfoot></table></section>';
  });return h+'<p class="sy-note ev-stat-note">'+(EV_STATS_PERIOD!=='past'&&EV_STATS_YEAR==='all'?'Las repeticiones previstas abarcan los próximos 12 meses. ':'')+'Los viajes en curso aportan solo los días del período elegido. Días Fuera reúne Viajes, Asturias y Casa Rural sin duplicar fechas. En puntuales, cada evento cuenta una vez por día activo; dos planes el mismo día son dos veces y un día.</p>';
}
function bindEventStatistics(){
  if(!document.getElementById('evStatsTotal'))return;
  document.getElementById('evStatsRoutines').onclick=function(){RUT_SUBTAB='stats';_switchEvView('rutinas');refreshEvents(false);};
  document.getElementById('evStatsRehearsals').onclick=function(){BODA_SUBTAB='stats';_switchEvView('bodas');refreshEvents(false);};
  document.querySelectorAll('[data-stats-period]').forEach(function(btn){btn.onclick=function(){EV_STATS_PERIOD=this.dataset.statsPeriod;refreshEvents(false);};});
}
