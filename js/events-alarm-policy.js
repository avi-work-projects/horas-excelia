/* Una política para ficha, Próximos y envío. Los trayectos conservan su fecha
   de salida; una repetición se evalúa por ocurrencia, nunca por su primer día. */
function evAlarmTargets(ev,ds){
  if(!ev||ev._rutSkip||ev.id.indexOf('ev-bday-vip-')===0)return [];
  var trips=getEvKind(ev)==='grande'?evTramos(ev):[];
  if(trips.length)return trips.map(function(tr){return {ds:tr.ds,time:tr.t.time||null,part:tr.k};});
  return [{ds:getEvKind(ev)==='grande'?ev.start:ds,time:evStartTime(ev),part:''}];
}
function evAlarmMoment(ds,time){
  return new Date(ds+'T'+(time||'23:59')+':00');
}
function evAlarmOptions(ev,ds,now){
  now=now||new Date();var today=evDk(now),limit=new Date(now);limit.setDate(limit.getDate()+14);
  if(!validIsoDate(ds)||!eventOccursOn(ev,ds))return [];
  return evAlarmTargets(ev,ds).filter(function(target){
    return validIsoDate(target.ds)&&target.ds>=today&&target.ds<=evDk(limit)
      &&(!target.time||evAlarmMoment(target.ds,target.time)>now);
  });
}
function evDetailAlarmDate(ev,ds){
  if(ds){var selected=evAlarmOptions(ev,ds)[0];return selected?new Date(selected.ds+'T00:00:00'):null;}
  var day=new Date();day.setHours(0,0,0,0);
  for(var i=0;i<=14;i++,day.setDate(day.getDate()+1)){
    var option=evAlarmOptions(ev,evDk(day))[0];if(option)return new Date(option.ds+'T00:00:00');
  }
  return null;
}
function evAlarmNotice(target,minutes){
  return new Date(evAlarmMoment(target.ds,target.time).getTime()-minutes*60000);
}
function evAlarmCreationAllowed(ev,target,when,now){
  now=now||new Date();
  var current=evAlarmOptions(ev,target.ds,now).some(function(t){return t.part===target.part&&t.ds===target.ds&&t.time===target.time;});
  return current&&when.getTime()>=now.getTime()+5*60000&&(!target.time||when<=evAlarmMoment(target.ds,target.time));
}
