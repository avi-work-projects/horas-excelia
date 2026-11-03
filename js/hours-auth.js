/* Only the explicit Outlook action requests recovery. Status reads never open the mailbox. */
var HOURS_AUTH_RUN=null;
var HOURS_AUTH_MESSAGES={
  ready:'Acceso a Outlook confirmado.',
  mfa:'Microsoft pide MFA. Completa la confirmación en Authenticator o en Kairo.',
  rejected:'Microsoft ha rechazado la contraseña. Actualiza el secreto privado en Kairo.',
  unknown:'Microsoft requiere intervención. Revisa la pantalla de Outlook en Kairo.',
  browser_unavailable:'El navegador de Outlook no está disponible en Kairo.',
  disabled:'La recuperación automática de Outlook está desactivada.'
};
async function hoursAuthPhase(url,request){
  var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},5000);
  try{
    var options={mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local',signal:controller.signal};
    if(request){options.method='POST';options.headers={'Content-Type':'application/json'};options.body=JSON.stringify({action:'check'});}
    var response=await fetch(url+(request?'auth-check':'auth-status'),options);
    if(!response.ok)throw Error('access');
    var phase=(await response.json()).phase;
    if(!Object.hasOwn(HOURS_AUTH_MESSAGES,phase)&&!['checking','waiting','reauthenticating'].includes(phase))throw Error('state');
    return phase;
  }finally{clearTimeout(timeout);}
}
async function checkHoursAuth(){
  var url=hoursKairoUrl();if(!url)return;
  try{if(await hoursAuthPhase(url,false)==='mfa'&&url===hoursKairoUrl())showToast(HOURS_AUTH_MESSAGES.mfa);}catch(e){}
}
async function requestHoursSyncAccess(){
  if(HOURS_AUTH_RUN)return HOURS_AUTH_RUN;
  var url=hoursKairoUrl();if(!url)return;
  HOURS_AUTH_RUN=(async function(){
    var phase=await hoursAuthPhase(url,true);
    for(var i=0;i<40&&!HOURS_AUTH_MESSAGES[phase]&&url===hoursKairoUrl();i++){
      await new Promise(function(resolve){setTimeout(resolve,2000);});
      phase=await hoursAuthPhase(url,false);
    }
    return HOURS_AUTH_MESSAGES[phase]||'Kairo sigue comprobando el acceso.';
  })();
  try{return await HOURS_AUTH_RUN;}finally{HOURS_AUTH_RUN=null;}
}
