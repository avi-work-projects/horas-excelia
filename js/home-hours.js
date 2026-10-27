/* Modelo y presentación compartidos por Home y su previsualización de swipe.
   Solo lectura: las jornadas y los estados siguen viviendo en core.js. */
function homeMonthHours(year,month){
  var result={days:0,hours:0,workedDays:0,workedHours:0,adjustment:0,off:[]};
  var groups={festivo:{label:'Festivos',days:0,hours:0},vacaciones:{label:'Vacaciones',days:0,hours:0},ausencia:{label:'Ausencias',days:0,hours:0}};
  weeks(year,month).forEach(function(week){
    week.slice(0,5).forEach(function(day){
      if(day.getMonth()!==month)return;
      var base=defH(day),type=dayT(day);result.days++;result.hours+=base;
      if(type==='normal'){
        var actual=dayH(day);result.workedDays++;result.workedHours+=actual;result.adjustment+=actual-base;
      }else if(groups[type]){groups[type].days++;groups[type].hours+=base;}
    });
  });
  Object.keys(groups).forEach(function(type){if(groups[type].days)result.off.push(Object.assign({type:type},groups[type]));});
  return result;
}
function renderHomeMonthHours(data){
  function hours(value){return (value%1===0?String(value):value.toFixed(1).replace('.',','))+'h';}
  function row(cls,label,days,value){
    return '<div class="home-hours-row '+cls+'"><span class="home-hours-label">'+label+'</span><span class="home-hours-days">'+days+' <small>'+(days===1?'día':'días')+'</small></span><strong class="home-hours-value">'+hours(value)+'</strong></div>';
  }
  var html='<div class="home-hours-columns" aria-hidden="true"><span></span><span>Días</span><span>Horas</span></div>';
  html+=row('total','Mes laborable',data.days,data.hours);
  data.off.forEach(function(group){html+=row('off '+group.type,'− '+group.label,group.days,group.hours);});
  if(data.adjustment)html+=row('adjustment',(data.adjustment<0?'− ':'+ ')+'Ajuste de jornada',0,Math.abs(data.adjustment));
  return html+row('worked','Trabajados',data.workedDays,data.workedHours);
}
