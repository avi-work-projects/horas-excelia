/* Modelo y presentación compartidos por Home y su previsualización de swipe.
   Solo lectura: las jornadas y los estados siguen viviendo en core.js. */
var HOME_FORMULA_OPEN=false;
function homeHourClass(value){return value===6.5?'hour-65':value===7?'hour-7':value===8?'hour-8':value===9?'hour-9':'';}
function homeMonthHours(year,month){
  var result={days:0,hours:0,workedDays:0,workedHours:0,adjustment:0,off:[],buckets:{}};
  var groups={festivo:{label:'Festivos',days:0,hours:0},vacaciones:{label:'Vacaciones',days:0,hours:0},ausencia:{label:'Ausencias',days:0,hours:0}};
  weeks(year,month).forEach(function(week){
    week.slice(0,5).forEach(function(day){
      if(day.getMonth()!==month)return;
      var type=dayT(day),base=type==='normal'?dayH(day):defH(day);result.days++;result.hours+=base;result.buckets[base]=(result.buckets[base]||0)+1;
      if(type==='normal'){
        result.workedDays++;result.workedHours+=base;
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
function renderHomeMonthSummary(data){
  function hours(value){return (value%1===0?String(value):value.toFixed(1).replace('.',','))+'h';}
  var toggle='<button type="button" class="home-formula-toggle" data-home-formula aria-expanded="'+HOME_FORMULA_OPEN+'" aria-label="'+(HOME_FORMULA_OPEN?'Ocultar':'Mostrar')+' desglose de horas">'+(HOME_FORMULA_OPEN?'−':'+')+'</button>';
  var values=Object.keys(data.buckets||{}).map(Number).sort(function(a,b){return b-a;}),formula='';
  var total='<span class="ms-num home-base-total">'+hours(data.hours)+'</span>';
  if(HOME_FORMULA_OPEN)formula='<div class="month-stat '+(data.off.length?'total':'worked')+' home-hours-equation"><span class="home-hours-terms">'+values.map(function(value,i){return '<span class="home-hours-term">'+(!i?'(':'')+'<span class="'+homeHourClass(value)+'">'+String(value).replace('.',',')+'</span>×'+data.buckets[value]+(i===values.length-1?')':'')+'</span>';}).join(' + ')+'</span><span class="home-equation-result"><span class="home-hours-equals">=</span>'+total+'</span></div>';
  var html='';
  if(data.off.length){
    html='<div class="month-total"><span class="ms-caption">Total mensual</span><div class="month-stat total home-total-line"><span class="ms-days">'+data.days+' días laborables</span>'+toggle+(!HOME_FORMULA_OPEN?total:'')+'</div>'+formula+'</div><div class="ms-breakdown">';
    var labels={festivo:['festivo','festivos'],vacaciones:['vacaciones','vacaciones'],ausencia:['ausencia','ausencias']};
    data.off.forEach(function(group){
      html+='<span class="month-stat off '+group.type+'" style="color:var(--'+group.type+')"><span>− '+group.days+' '+labels[group.type][group.days===1?0:1]+'</span><span class="ms-value">'+hours(group.hours)+'</span></span>';
    });
    if(data.adjustment)html+='<span class="month-stat adjustment"><span>'+(data.adjustment<0?'−':'+')+' Ajuste jornada</span><span class="ms-value">'+hours(Math.abs(data.adjustment))+'</span></span>';
    html+='</div>';
  }
  html+='<div class="month-stat worked'+(data.off.length?' home-worked-total':'')+'" aria-label="'+data.workedDays+' días trabajados, '+hours(data.workedHours)+' trabajadas"><span class="ms-days">'+data.workedDays+' día'+(data.workedDays===1?'':'s')+' trabajado'+(data.workedDays===1?'':'s')+'</span>'+(!data.off.length?(HOME_FORMULA_OPEN?'':total):'<strong class="ms-num">'+hours(data.workedHours)+'</strong>')+'</div>';
  if(!data.off.length)html+=formula+'<div class="ms-no-off"><em>* sin días no trabajados</em>'+toggle+'</div>';
  return html;
}
