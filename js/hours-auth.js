/* Session health reads a private status file, never the mailbox or a secret. */
var HOURS_AUTH={url:'',phase:'disabled'},HOURS_AUTH_BUSY=false,HOURS_AUTH_CHECKED=0,HOURS_AUTH_TIMER=null;
function hoursAuthFeedback(message){if(typeof showToast==='function')showToast(message);}
function renderHoursAuthNotice(){
  var text={mfa:['Microsoft pide MFA','Completa la confirmación en Authenticator o en el Outlook de Kairo. La recuperación automática está detenida.'],rejected:['Revisa la contraseña de Outlook','Microsoft la ha rechazado. No se volverá a intentar hasta que actualices el secreto privado en Kairo.'],unknown:['Revisa el acceso a Outlook','La pantalla no se reconoce. La recuperación está detenida para que la revises en Kairo.'],browser_unavailable:['Outlook de Kairo no está disponible','Revisa el navegador de Kairo. Se conservan las programaciones y los estados confirmados.']};
  var item=HOURS_AUTH.url===hoursKairoUrl()&&text[HOURS_AUTH.phase];if(!item)return '';
  return '<div class="hours-auth-alert" role="alert"><strong>'+item[0]+'</strong><span>'+item[1]+'</span><button type="button" data-hours-auth>Comprobar acceso</button></div>';
}
async function checkHoursAuth(force,retries,manual){
  if(retries===undefined)retries=6;
  var url;try{url=hoursKairoUrl();}catch(e){return;}
  if(!url)return;
  if(HOURS_AUTH_BUSY){if(manual)hoursAuthFeedback('La comprobación de acceso ya está en curso.');return;}
  if(!force&&Date.now()-HOURS_AUTH_CHECKED<30000)return;
  if(HOURS_AUTH_TIMER){clearTimeout(HOURS_AUTH_TIMER);HOURS_AUTH_TIMER=null;}
  HOURS_AUTH_BUSY=true;HOURS_AUTH_CHECKED=Date.now();var controller=new AbortController(),timeout=setTimeout(function(){controller.abort();},5000);
  var button=manual&&document.querySelector('[data-hours-auth]');if(button){button.disabled=true;button.textContent='Comprobando…';button.setAttribute('aria-busy','true');}
  try{
    var response=await fetch(url+'auth-status',{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local',signal:controller.signal});
    if(!response.ok)throw Error('access');var value=await response.json();
    if(!['disabled','ready','checking','reauthenticating','mfa','rejected','unknown','browser_unavailable','waiting'].includes(value.phase))throw Error('state');
    var notify=value.phase==='mfa'&&(HOURS_AUTH.url!==url||HOURS_AUTH.phase!=='mfa');
    HOURS_AUTH={url:url,phase:value.phase};paintHoursStatus();
    if(notify&&typeof showToast==='function')showToast('Microsoft pide MFA. La recuperación de Outlook está detenida.');
    if(manual&&!notify)hoursAuthFeedback({ready:'Acceso a Outlook confirmado.',unknown:'Comprobado: el acceso sigue detenido. Revisa la pantalla de Outlook en Kairo.',mfa:'Microsoft sigue esperando tu confirmación MFA.',rejected:'La contraseña fue rechazada. Actualiza el secreto privado en Kairo.',browser_unavailable:'El navegador de Outlook no está disponible en Kairo.',disabled:'El recuperador de Outlook está desactivado.'}[value.phase]||'Kairo está comprobando el acceso.');
    if(retries>0&&['checking','reauthenticating','waiting'].includes(value.phase))HOURS_AUTH_TIMER=setTimeout(function(){HOURS_AUTH_TIMER=null;checkHoursAuth(true,retries-1);},5000);
  }catch(e){if(manual)hoursAuthFeedback('No se pudo comprobar el acceso. Se conserva el último estado.');}
  finally{clearTimeout(timeout);HOURS_AUTH_BUSY=false;if(button&&button.isConnected){button.disabled=false;button.textContent='Comprobar acceso';button.removeAttribute('aria-busy');}}
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',function(){
  var root=document.getElementById('weeksContainer');if(root)root.addEventListener('click',function(e){if(e.target.closest('[data-hours-auth]'))checkHoursAuth(true,6,true);});
  function resume(){if(!document.hidden)checkHoursAuth(false);}
  window.addEventListener('focus',resume);window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);resume();
  setInterval(resume,60000);
});
