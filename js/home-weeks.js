/* Una identidad por lunes; la semana puente del mes no se repite. */
function homePeriodMode(year,month){
  var today=new Date(),distance=year*12+month-(today.getFullYear()*12+today.getMonth());
  return distance< -1?'closed':distance<=1?'audit':'future';
}
function homeDueSoon(date){
  if(!date)return false;
  var today=hoursCivilTime(new Date().toISOString()).slice(0,10);
  return (Date.parse(date)-Date.parse(today))/86400000<7;
}
function homeMailState(key,year,month){
  var state=hoursRemoteConfigured()?(hoursWeekState(key)||'missing'):hoursHistorySent(key)||SW[key]?'sent':'missing';
  return homePeriodMode(year,month)==='closed'&&['missing','ready','unverified','draft','past-due','no-workdays','blocked-previous'].includes(state)?'unrecorded':state;
}
function homeWeekCovered(key){return hoursRemoteConfigured()?hoursHasConfirmedMail(key):hoursHistorySent(key)||!!SW[key];}
function homeStatusWeeks(year,month){var scope=homeSubmissionWeeks(year,month),confirmed=scope.every(function(week){return week.extra||hoursHistorySent(week.key);});return confirmed?scope.filter(function(week){return !week.extra;}):scope;}
function homeWeekUnlocked(key){return Object.prototype.hasOwnProperty.call(HOURS_WEEK_UNLOCKED,key)?HOURS_WEEK_UNLOCKED[key]:!homeWeekCovered(key);}
function homeSubmissionWeeks(year,month){
  var current=weeks(year,month),last=current[current.length-1][0];
  return current.map(function(week){return {key:dk(week[0]),mon:week[0],extra:false};}).concat([1,2].map(function(n){
    var mon=ad(last,7*n);return {key:dk(mon),mon:mon,extra:true};
  }));
}
function homePreviousMailMonth(year,month){
  var previous=new Date(year,month-1,1),period=mkey(previous.getFullYear(),previous.getMonth());
  var pending=homePeriodMode(previous.getFullYear(),previous.getMonth())==='closed'?[]:weeks(previous.getFullYear(),previous.getMonth()).filter(function(week){
    return hoursRemoteConfigured()?!hoursCovered(dk(week[0])):!SW[dk(week[0])];
  });
  var known=homePeriodMode(previous.getFullYear(),previous.getMonth())==='closed'||!hoursRemoteConfigured()||weeks(previous.getFullYear(),previous.getMonth()).every(function(week){return !!hoursWeekState(dk(week[0]));});
  return {period:period,ready:pending.length===0,known:known};
}
/* Recordatorios y Home comparten alcance y hechos de Outlook. Desconocido
   nunca se convierte en siete avisos falsos de semanas sin enviar. */
function homeSubmissionWarnings(year,month){
  var rows=homeStatusWeeks(year,month).map(function(week){
    return {key:week.key,mon:week.mon,state:homeMailState(week.key,year,month)};
  });
  return rows.filter(function(row){return !['sent','scheduled','unrecorded'].includes(row.state);});
}
/* Fecha civil de Madrid: no depende del huso del ordenador ni añade 24 h al
   cruzar el cambio de hora. La conversión a instante la hará Kairo con ZoneInfo. */
function homeWeekSchedule(weekKey,now){
  var mon=new Date(weekKey+'T12:00:00');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)||isNaN(mon.getTime())||dk(mon)!==weekKey||mon.getDay()!==1)throw new Error('Semana no válida');
  var day=null;
  for(var i=4;i>=0;i--){var candidate=ad(mon,i);if(dayT(candidate)==='normal'&&dayH(candidate)>0){day=candidate;break;}}
  if(!day&&[0,1,2,3,4].every(function(i){return ['vacaciones','festivo'].includes(dayT(ad(mon,i)));})){
    for(var i=4;i>=0;i--){var candidate=ad(mon,i);if(dayT(candidate)!=='festivo'){day=candidate;break;}}
  }
  var result={week:weekKey,date:day?dk(day):null,time:'08:00',timeZone:'Europe/Madrid',reason:day?null:'no-workdays'};
  if(day){
    var parts=new Intl.DateTimeFormat('en-CA',{timeZone:result.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now||new Date());
    var civil={};parts.forEach(function(part){civil[part.type]=part.value;});
    if(result.date+'T08:00'<=civil.year+'-'+civil.month+'-'+civil.day+'T'+civil.hour+':'+civil.minute)result.reason='past-due';
  }
  return result;
}
