/* Only job identifiers and connection-scoped derived facts live on the device.
   Closing a tab never cancels browser work accepted by Kairo. */
var HOURS_JOBS_KEY='excelia-hours-jobs-v1',HOURS_JOB_POLL=null,HOURS_JOB_ERROR='',HOURS_JOB_NETWORK_ERROR=false;
function hoursJobsRead(){
  try{var rows=JSON.parse(localStorage.getItem(HOURS_JOBS_KEY)||'[]');return Array.isArray(rows)?rows.filter(function(j){return j&&/^[a-f0-9-]{36}$/.test(j.id)&&['status','preview','commit','simulate'].includes(j.kind)&&typeof j.url==='string'&&j.url.length<1000&&/^\d{4}-\d{2}$/.test(j.period);}).slice(-24):[];}catch(e){return [];}
}
var HOURS_JOBS=hoursJobsRead();
function hoursJobsSave(){try{localStorage.setItem(HOURS_JOBS_KEY,JSON.stringify(HOURS_JOBS));}catch(e){}}
function hoursAcceptSnapshot(result,url,settings){
  if(!result||!Array.isArray(result.rows))throw new Error('Resultado de Kairo incompleto');
  var rows=result.rows.map(function(r){var row={key:r.key,state:r.state};if(r.days||r.existingDays)row.days=r.days||r.existingDays;if(r.schedule||r.previousSchedule)row.schedule=r.previousSchedule||r.schedule;return row;});
  var snapshot={period:result.period,checkedAt:result.checkedAt,rows:rows,verified:result.verified};
  var keys=hoursScopeKeys(snapshot.period);validateHoursResult(snapshot,snapshot.period,keys);
  if(snapshot.verified!==true)throw new Error('Lectura de Outlook sin confirmar');
  hoursCacheRemember(snapshot,url,hoursSourceSignature(keys.map(function(key){return {key:key};})),settings);
}
function hoursAcceptJobResult(job,result){
  if(job.url!==hoursKairoUrl())return;
  if(result.periods)result.periods.forEach(function(value){hoursAcceptSnapshot(value,job.url,job.settings);});
  else if(result.status)hoursAcceptSnapshot(result.status,job.url,job.settings);
  else if(result.rows&&result.verified)hoursAcceptSnapshot(result,job.url,job.settings);
  var period=mkey(CY,CM);if(hoursScopeKeys(period).every(function(key){return !!hoursCachedWeek(key);}))HOURS_STATUS={url:job.url,period:period,phase:'ready',rows:hoursScopeKeys(period).map(hoursCachedWeek),checkedAt:Date.now()};
}
function hoursTrackJob(value,request,url){
  if(!value||!value.jobId||!['status','preview','commit','simulate'].includes(value.kind))return;
  if(!/^[a-f0-9-]{36}$/.test(value.jobId))throw new Error('Identificador de trabajo no válido');
  if(!HOURS_JOBS.some(function(j){return j.id===value.jobId;}))HOURS_JOBS.push({id:value.jobId,url:url,period:request.period,kind:value.kind,settings:hoursSettingsSignature()});
  HOURS_JOBS=HOURS_JOBS.slice(-24);HOURS_JOB_ERROR='';HOURS_JOB_NETWORK_ERROR=false;hoursJobsSave();hoursResumeJobs();paintHoursStatus();
}
async function hoursResumeJobs(){
  if(HOURS_JOB_POLL||!HOURS_JOBS.length)return;
  HOURS_JOB_POLL=true;
  try{
    var url=hoursKairoUrl(),pending=HOURS_JOBS.filter(function(j){return j.url===url;}),networkFailed=false;
    for(var job of pending){
      try{
        var response=await fetch(job.url+'jobs/'+job.id,{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local'});
        if(!response.ok)throw new Error('Kairo no está disponible');
        var data=await response.json();if(data.jobId!==job.id||!['queued','running','done','error'].includes(data.phase))throw new Error('Trabajo no válido');
        if(data.phase==='done'){hoursAcceptJobResult(job,data.result);HOURS_JOBS=HOURS_JOBS.filter(function(j){return j.id!==job.id;});}
        else if(data.phase==='error'){HOURS_JOB_ERROR='Kairo requiere revisión. Se conserva el último estado confirmado.';HOURS_JOB_NETWORK_ERROR=false;HOURS_JOBS=HOURS_JOBS.filter(function(j){return j.id!==job.id;});}
      }catch(e){networkFailed=true;if(!HOURS_JOB_ERROR||HOURS_JOB_NETWORK_ERROR){HOURS_JOB_ERROR='Sin conexión con Kairo. El trabajo y los estados guardados se conservan.';HOURS_JOB_NETWORK_ERROR=true;}}
    }
    if(pending.length&&!networkFailed&&HOURS_JOB_NETWORK_ERROR){HOURS_JOB_ERROR='';HOURS_JOB_NETWORK_ERROR=false;}
    hoursJobsSave();paintHoursStatus();
  }finally{
    HOURS_JOB_POLL=null;
    if(!document.hidden&&HOURS_JOBS.some(function(j){try{return j.url===hoursKairoUrl();}catch(e){return false;}}))HOURS_JOB_POLL=setTimeout(function(){HOURS_JOB_POLL=null;hoursResumeJobs();},HOURS_JOB_ERROR?30000:2000);
  }
}
