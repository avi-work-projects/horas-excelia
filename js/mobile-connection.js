/* The web and the home-screen widget select explicit branches of «Conexión — Tres modos». */
var MOBILE_CONNECTION_MODES={
  vpn:{label:'VPN Kairo',trigger:'conexion_kairo'},
  dns:{label:'DNS AdGuard',trigger:'conexion_adguard'},
  off:{label:'OFF',trigger:'conexion_normal'}
};
var mobileModeRequest=null;

function mobileWebhookBase(value){
  try{
    var u=new URL(value),parts=u.pathname.split('/').filter(Boolean);
    if(u.origin==='https://trigger.macrodroid.com'&&!u.username&&!u.password&&!u.search&&!u.hash&&
       parts.length>=1&&parts.length<=2&&/^[a-zA-Z0-9_-]+$/.test(parts[0])){
      return u.origin+'/'+parts[0];
    }
  }catch(e){}
  return '';
}
function requestMobileMode(mode,base){
  // A lost response can mean the phone already switched. A tap submits only one command.
  base=mobileWebhookBase(base);
  if(mobileModeRequest||!Object.hasOwn(MOBILE_CONNECTION_MODES,mode)||!base)return null;
  var controller=new AbortController(),started=Date.now();
  var timer=setTimeout(function(){controller.abort();},12000);
  var request=fetch(base+'/'+MOBILE_CONNECTION_MODES[mode].trigger,{
    method:'GET',mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal
  }).then(function(response){return response.ok;}).catch(function(){return false;}).finally(function(){clearTimeout(timer);});
  mobileModeRequest=mode;
  request.then(function(){
    setTimeout(function(){mobileModeRequest=null;window.dispatchEvent(new Event('gestify-mode-idle'));},Math.max(0,8000-(Date.now()-started)));
  });
  return request;
}

function openMobileConnection(onVpnReady,initialMode){
  if(document.getElementById('mobileConnectionDialog'))return;
  var restore=settingsPanelBack(),dialog=document.createElement('dialog');
  dialog.id='mobileConnectionDialog';dialog.className='mobile-connection-dialog';
  dialog.setAttribute('aria-labelledby','mobileConnectionTitle');
  dialog.innerHTML='<header><h2 id="mobileConnectionTitle">Conexión del móvil</h2><button type="button" data-back aria-label="Volver">←</button></header>'+
    '<p data-route role="status">Comprobando acceso a Kairo…</p><div class="mobile-modes" role="group" aria-label="Modo de conexión">'+
    Object.entries(MOBILE_CONNECTION_MODES).map(function(entry){return '<button type="button" data-mobile-mode="'+entry[0]+'">'+entry[1].label+'</button>';}).join('')+'</div>'+
    '<p data-mode-result role="status">El widget del móvil muestra el modo aplicado.</p>'+
    '<div data-link hidden><label>Enlace de MacroDroid<input type="password" autocomplete="off" spellcheck="false" placeholder="https://trigger.macrodroid.com/…"></label>'+
    '<button type="button" data-save>Guardar para conexión y alarmas</button></div>';
  var route=dialog.querySelector('[data-route]'),feedback=dialog.querySelector('[data-mode-result]');
  var link=dialog.querySelector('[data-link]'),input=link.querySelector('input');
  var base=mobileWebhookBase(appStorage.getItem('excelia-alarm-url')||'');
  var timer=null,probe=null,requestSerial=0,resume=typeof onVpnReady==='function',completed=false,fastCheckUntil=0;
  function buttons(){
    link.hidden=!!base;
    dialog.querySelectorAll('[data-mobile-mode]').forEach(function(button){button.disabled=!base||!!mobileModeRequest;});
  }
  function schedule(delay){
    clearTimeout(timer);
    if(dialog.open&&!document.hidden)timer=setTimeout(check,delay);
  }
  async function check(){
    if(!dialog.open||document.hidden||probe)return;
    buttons();
    var target='';try{target=hoursKairoUrl();}catch(e){}
    if(!target){route.textContent='Configura Kairo en Facturas y correo para comprobar el acceso.';schedule(10000);return;}
    var controller=new AbortController(),serial=requestSerial;probe=controller;
    var deadline=setTimeout(function(){controller.abort();},4000),available=false;
    try{
      var response=await fetch(target+'reachable',{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local',signal:controller.signal});
      available=response.ok&&(await response.json()).service==='kairo-hours';
    }catch(e){}finally{clearTimeout(deadline);if(probe===controller)probe=null;}
    if(!dialog.open||serial!==requestSerial)return;
    route.textContent=available?'Kairo accesible desde este dispositivo':'Acceso a Kairo sin confirmar';
    route.dataset.available=String(available);
    if(available&&resume){completed=true;dialog.close();return;}
    schedule(Date.now()<fastCheckUntil?2000:10000);
  }
  async function choose(mode){
    var request=requestMobileMode(mode,base);
    if(!request)return;
    ++requestSerial;clearTimeout(timer);if(probe){probe.abort();probe=null;}
    resume=false;buttons();route.textContent='Comprobando cambio de conexión…';delete route.dataset.available;
    feedback.textContent='Solicitando '+MOBILE_CONNECTION_MODES[mode].label+'…';
    var received=await request;
    if(!dialog.open)return;
    feedback.textContent=received?'Solicitud enviada. El widget confirma el modo aplicado.':'Entrega sin confirmar. Comprueba el widget antes de repetir.';
    fastCheckUntil=Date.now()+20000;
    resume=mode==='vpn'&&typeof onVpnReady==='function';
    schedule(1000);
  }
  function foreground(){if(document.hidden){clearTimeout(timer);return;}check();}
  dialog.querySelector('.mobile-modes').onclick=function(e){var b=e.target.closest('[data-mobile-mode]');if(b)choose(b.dataset.mobileMode);};
  link.querySelector('[data-save]').onclick=function(){
    var candidate=mobileWebhookBase(input.value.trim());
    if(!candidate){feedback.textContent='Introduce un enlace HTTPS de trigger.macrodroid.com.';return;}
    try{appStorage.setItem('excelia-alarm-url',candidate);}catch(e){feedback.textContent='El navegador no ha podido guardar el enlace.';return;}
    base=candidate;input.value='';feedback.textContent='Móvil vinculado. Elige un modo.';buttons();
  };
  function back(){dialog.close();}
  dialog.querySelector('[data-back]').onclick=back;
  dialog.addEventListener('close',function(){
    clearTimeout(timer);if(probe)probe.abort();
    window.removeEventListener('gestify-mode-idle',buttons);window.removeEventListener('focus',foreground);window.removeEventListener('online',foreground);
    document.removeEventListener('visibilitychange',foreground);dialog.remove();
    if(NAV_BACK===back)restore();
    if(completed&&typeof onVpnReady==='function')onVpnReady();
  },{once:true});
  document.body.append(dialog);dialog.showModal();NAV_BACK=back;buttons();
  if(!base)feedback.textContent='Vincula este móvil con el mismo enlace que usas para las alarmas.';
  window.addEventListener('gestify-mode-idle',buttons);window.addEventListener('focus',foreground);window.addEventListener('online',foreground);document.addEventListener('visibilitychange',foreground);
  if(base&&initialMode&&!mobileModeRequest)choose(initialMode);else check();
}
