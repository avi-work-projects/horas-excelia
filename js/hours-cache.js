/* Last verified Outlook facts, shared by overlapping months. Derived device
   cache only: no recipients, message bodies, credentials or backup export. */
var HOURS_CACHE_KEY='excelia-hours-cache-v1';
var HOURS_ATTEMPTS=Object.create(null);
function hoursScopeKeys(period){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw new Error('Mes no válido');
  return homeSubmissionWeeks(+period.slice(0,4),+period.slice(5)-1).map(function(w){return w.key;});
}
function hoursCacheRead(){
  var empty={schema:1,url:'',periods:{},weeks:{},attempts:{}};
  try{
    var raw=localStorage.getItem(HOURS_CACHE_KEY);if(!raw||raw.length>500000)return empty;
    var data=JSON.parse(raw),now=Date.now();
    if(data.schema!==1||typeof data.url!=='string'||data.url.length>1000||!data.periods||!data.weeks)return empty;
    var cache={schema:1,url:data.url,periods:{},weeks:{},attempts:{}};
    if(data.attempts&&typeof data.attempts==='object')Object.keys(data.attempts).slice(-48).forEach(function(k){if(k.length<100&&data.attempts[k]===true)cache.attempts[k]=true;});
    Object.keys(data.periods).slice(0,24).forEach(function(period){
      try{hoursScopeKeys(period);var p=data.periods[period];if(typeof p.source!=='string'||p.source.length>20000||!Number.isFinite(p.checkedAt)||p.checkedAt<=0||p.checkedAt>now+300000)return;cache.periods[period]={source:p.source,checkedAt:p.checkedAt};}catch(e){}
    });
    var keys=new Set();Object.keys(cache.periods).forEach(function(period){hoursScopeKeys(period).forEach(function(key){keys.add(key);});});
    keys.forEach(function(key){
      try{var row=data.weeks[key];if(!row||row.key!==key||!Number.isFinite(row.checkedAt)||row.checkedAt<=0||row.checkedAt>now+300000)return;
        validateHoursResult({period:key.slice(0,7),checkedAt:new Date(row.checkedAt).toISOString(),rows:[row]},key.slice(0,7),[key]);
        cache.weeks[key]=hoursCacheRow(row,row.checkedAt);
      }catch(e){}
    });
    return cache;
  }catch(e){return empty;}
}
function hoursCacheRow(row,checkedAt){
  var clean={key:row.key,state:row.state,checkedAt:checkedAt};
  if(row.days)clean.days=row.days.map(function(d){return {date:d.date,type:d.type,hours:d.hours};});
  if(row.schedule)clean.schedule=row.schedule;
  if(typeof row.settings==='string'&&row.settings.length<100)clean.settings=row.settings;
  return clean;
}
var HOURS_CACHE=hoursCacheRead();
function hoursCacheSave(){
  var periods=Object.keys(HOURS_CACHE.periods).sort(function(a,b){return HOURS_CACHE.periods[b].checkedAt-HOURS_CACHE.periods[a].checkedAt;});
  periods.slice(24).forEach(function(p){delete HOURS_CACHE.periods[p];});
  var keys=new Set();periods.slice(0,24).forEach(function(p){hoursScopeKeys(p).forEach(function(k){keys.add(k);});});
  Object.keys(HOURS_CACHE.weeks).forEach(function(k){if(!keys.has(k))delete HOURS_CACHE.weeks[k];});
  // A full/disabled cache must not turn a successful read into a data-save error.
  try{localStorage.setItem(HOURS_CACHE_KEY,JSON.stringify(HOURS_CACHE));}catch(e){}
}
function hoursCachedWeek(key){
  try{return HOURS_CACHE.url===hoursKairoUrl()?HOURS_CACHE.weeks[key]:null;}catch(e){return null;}
}
function hoursSourceSignature(scope){
  return JSON.stringify(scope.map(function(w){return {key:w.key,days:w.days||hoursWeekDays(w.key)};}));
}
function hoursSettingsSignature(){
  var value=JSON.stringify([String(TO||''),CC,AUTHOR_NAME]),a=2166136261,b=5381;
  for(var i=0;i<value.length;i++){a=Math.imul(a^value.charCodeAt(i),16777619);b=Math.imul(b,33)^value.charCodeAt(i);}
  return (a>>>0).toString(16)+'-'+(b>>>0).toString(16);
}
function hoursCacheRemember(result,url,source,settings){
  validateHoursResult(result,result.period,hoursScopeKeys(result.period));
  if(HOURS_CACHE.url!==url)HOURS_CACHE={schema:1,url:url,periods:{},weeks:{},attempts:{}};
  var now=Date.parse(result.checkedAt);
  result.rows.forEach(function(row){if(HOURS_CACHE.weeks[row.key]&&HOURS_CACHE.weeks[row.key].checkedAt>now)return;var clean=hoursCacheRow(row,now);clean.settings=settings||hoursSettingsSignature();HOURS_CACHE.weeks[row.key]=clean;});
  HOURS_CACHE.periods[result.period]={source:source,checkedAt:now};hoursCacheSave();
}
function hoursCacheDue(keys){
  return keys.filter(function(key){var row=hoursCachedWeek(key),due=row&&Date.parse(row.schedule);return row&&(row.state==='scheduled'||row.state==='changed')&&Number.isFinite(due)&&due<=Date.now()&&row.checkedAt<due;});
}
function hoursCacheInvalidate(request,url){
  if(HOURS_CACHE.url!==url)return;
  var keys=request.mode==='week'?[request.targetWeek]:request.weeks.map(function(w){return w.key;});
  keys.forEach(function(key){delete HOURS_CACHE.weeks[key];});hoursCacheSave();
  HOURS_ATTEMPTS=Object.create(null);
}
