/* The web and the home-screen widget select explicit branches of «Conexión — Tres modos». */
var MOBILE_CONNECTION_MODES={
  vpn:{label:'VPN Kairo',trigger:'conexion_kairo'},
  dns:{label:'DNS AdGuard',trigger:'conexion_adguard'},
  off:{label:'OFF',trigger:'conexion_normal'}
};
var mobileModeRequest=null;
var kairoConnectionRequest=null;

var KAIRO_VPN_CACHE_KEY='excelia-kairo-vpn-v1',KAIRO_VPN_TTL=20*60*1000,KAIRO_VPN_MEMORY=null;
function kairoVpnConfirmed(){
  var saved=KAIRO_VPN_MEMORY;
  try{saved=JSON.parse(sessionStorage.getItem(KAIRO_VPN_CACHE_KEY)||'null')||saved;}catch(e){}
  var now=Date.now(),url=hoursKairoUrl();
  return !!(saved&&url&&saved.origin===new URL(url).origin&&Number.isFinite(saved.at)&&saved.at<=now&&now-saved.at<KAIRO_VPN_TTL);
}
function rememberKairoVpn(){
  KAIRO_VPN_MEMORY={origin:new URL(hoursKairoUrl()).origin,at:Date.now()};
  try{sessionStorage.setItem(KAIRO_VPN_CACHE_KEY,JSON.stringify(KAIRO_VPN_MEMORY));}catch(e){}
}
function forgetKairoVpn(){
  KAIRO_VPN_MEMORY=null;try{sessionStorage.removeItem(KAIRO_VPN_CACHE_KEY);}catch(e){}
}
async function waitForKairoVpn(signal){
  var base=hoursKairoUrl(),deadline=Date.now()+25000;
  if(!base)return false;
  while(!signal.aborted){
    var controller=new AbortController(),abort=function(){controller.abort();};
    signal.addEventListener('abort',abort,{once:true});
    var timeout=setTimeout(abort,3000),available=false;
    try{
      var response=await fetch(base+'reachable',{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local',signal:controller.signal});
      available=response.ok&&(await response.json()).service==='kairo-hours';
    }catch(e){}finally{clearTimeout(timeout);signal.removeEventListener('abort',abort);}
    if(signal.aborted)return false;
    if(available)return true;
    if(Date.now()>=deadline)return false;
    await new Promise(function(resolve){
      var timer=setTimeout(done,1000);
      function done(){clearTimeout(timer);signal.removeEventListener('abort',done);resolve();}
      signal.addEventListener('abort',done,{once:true});
      if(signal.aborted)done();
    });
  }
  return false;
}
function ensureKairoConnection(){
  if(kairoVpnConfirmed())return Promise.resolve(true);
  if(kairoConnectionRequest)return kairoConnectionRequest;
  kairoConnectionRequest=new Promise(function(resolve){
    var dialog=document.createElement('dialog'),previous=NAV_BACK,confirmed=false,activation=new AbortController();
    dialog.className='mobile-connection-dialog kairo-vpn-prompt';dialog.setAttribute('aria-labelledby','kairoVpnTitle');
    dialog.innerHTML='<h2 id="kairoVpnTitle">VPN de Kairo</h2><p>Para realizar esta operación es necesario que la VPN esté activada.</p><p class="invoice-note"><em>La confirmación se recordará durante 20 minutos.</em></p><p data-vpn-result role="status" hidden></p><div class="kairo-vpn-actions"><button type="button" data-activate>Activar VPN</button><button type="button" data-ready>Ya está activada</button><button type="button" data-cancel>Cancelar</button></div>';
    function cancel(){dialog.close();}
    function ready(){confirmed=true;dialog.close();}
    dialog.querySelector('[data-cancel]').onclick=cancel;
    dialog.querySelector('[data-ready]').onclick=ready;
    dialog.querySelector('[data-activate]').onclick=async function(){
      var button=this,feedback=dialog.querySelector('[data-vpn-result]'),base=mobileWebhookBase(appStorage.getItem('excelia-alarm-url')||'');
      feedback.hidden=false;
      if(!base){feedback.textContent='Activa la VPN desde el widget del móvil y pulsa «Ya está activada».';return;}
      var request=requestMobileMode('vpn',base);
      if(!request){feedback.textContent='Ya hay una solicitud en curso. Pulsa «Ya está activada» cuando esté lista.';return;}
      button.disabled=true;feedback.textContent='Solicitando la VPN…';
      await request;if(!dialog.open)return;
      feedback.textContent='Esperando a que la VPN conecte con Kairo…';
      if(await waitForKairoVpn(activation.signal)){if(dialog.open)ready();}
      else if(dialog.open){feedback.textContent='No se ha podido confirmar el acceso a Kairo. Comprueba la VPN en el widget y pulsa «Ya está activada».';button.disabled=false;}
    };
    dialog.addEventListener('close',function(){
      activation.abort();dialog.remove();if(NAV_BACK===cancel)NAV_BACK=previous;
      if(confirmed)rememberKairoVpn();resolve(confirmed);
    },{once:true});
    document.body.append(dialog);dialog.showModal();NAV_BACK=cancel;
  }).finally(function(){kairoConnectionRequest=null;});
  return kairoConnectionRequest;
}

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
  if(mode!=='vpn')forgetKairoVpn();
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

/* Los tres botones de modo: mismo marcado en el diálogo y en Ajustes. */
function mobileModesHtml(){
  return '<div class="mobile-modes" role="group" aria-label="Modo de conexión">'+
    Object.entries(MOBILE_CONNECTION_MODES).map(function(entry){var label=entry[0]==='off'?prohibitionIconHtml():entry[0]==='vpn'?'VPN <span class="mobile-kairo-wordmark" aria-hidden="true"></span>':entry[1].label;return '<button type="button" data-mobile-mode="'+entry[0]+'" aria-label="'+entry[1].label+'">'+label+'</button>';}).join('')+'</div>';
}
/* Ajustes muestra los modos directamente. Sin enlace de MacroDroid abre el diálogo para vincularlo. */
function initSettingsConnection(container){
  container.innerHTML='<div class="settings-connection-title">Conexión del móvil</div>'+mobileModesHtml()+'<p class="settings-connection-status" role="status"></p>';
  var status=container.querySelector('.settings-connection-status'),statusTimer=null;
  function linkedBase(){return mobileWebhookBase(appStorage.getItem('excelia-alarm-url')||'');}
  function paint(){container.querySelectorAll('[data-mobile-mode]').forEach(function(button){button.disabled=!!mobileModeRequest;button.setAttribute('aria-busy',String(mobileModeRequest===button.dataset.mobileMode));});}
  function say(text,type){clearTimeout(statusTimer);status.textContent=text;status.dataset.type=type||'info';statusTimer=setTimeout(function(){status.textContent='';},3500);}
  container.querySelector('.mobile-modes').onclick=async function(e){
    var button=e.target.closest('[data-mobile-mode]');if(!button)return;
    var mode=button.dataset.mobileMode,base=linkedBase();
    if(!base){openMobileConnection();return;}
    var request=requestMobileMode(mode,base);if(!request)return;
    paint();say('Solicitando '+MOBILE_CONNECTION_MODES[mode].label+'…');
    var received=await request;
    say(received?MOBILE_CONNECTION_MODES[mode].label+': solicitud enviada.':'Entrega sin confirmar. Comprueba el widget antes de repetir.',received?'info':'error');
  };
  window.addEventListener('gestify-mode-idle',paint);paint();
}
function openMobileConnection(onVpnReady,initialMode){
  if(document.getElementById('mobileConnectionDialog'))return;
  var restore=settingsPanelBack(),dialog=document.createElement('dialog');
  dialog.id='mobileConnectionDialog';dialog.className='mobile-connection-dialog';
  dialog.setAttribute('aria-labelledby','mobileConnectionTitle');
  dialog.innerHTML='<header><h2 id="mobileConnectionTitle">Conexión del móvil</h2><button type="button" data-back aria-label="Volver">←</button></header>'+
    mobileModesHtml()+
    '<div data-link hidden><label>Enlace de MacroDroid<input type="password" autocomplete="off" spellcheck="false" placeholder="https://trigger.macrodroid.com/…"></label>'+
    '<button type="button" data-save>Guardar para conexión y alarmas</button></div>';
  var link=dialog.querySelector('[data-link]'),input=link.querySelector('input');
  var base=mobileWebhookBase(appStorage.getItem('excelia-alarm-url')||'');
  var timer=null,probe=null,requestSerial=0,resume=typeof onVpnReady==='function',completed=false,fastCheckUntil=0,notice=null,noticeTimer=null;
  function notify(text,type){
    clearTimeout(noticeTimer);
    if(!notice){notice=document.createElement('div');notice.setAttribute('role','status');dialog.appendChild(notice);}
    notice.className='toast show '+(type||'info');notice.textContent=text;
    noticeTimer=setTimeout(function(){notice.remove();notice=null;},3500);
  }
  function buttons(){
    link.hidden=!!base;
    dialog.querySelectorAll('[data-mobile-mode]').forEach(function(button){button.disabled=!base||!!mobileModeRequest;button.setAttribute('aria-busy',String(mobileModeRequest===button.dataset.mobileMode));});
  }
  function schedule(delay){
    clearTimeout(timer);
    if(resume&&dialog.open&&!document.hidden)timer=setTimeout(check,delay);
  }
  async function check(){
    if(!resume||!dialog.open||document.hidden||probe)return;
    buttons();
    var target='';try{target=hoursKairoUrl();}catch(e){}
    if(!target)return;
    var controller=new AbortController(),serial=requestSerial;probe=controller;
    var deadline=setTimeout(function(){controller.abort();},4000),available=false;
    try{
      var response=await fetch(target+'reachable',{mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',targetAddressSpace:'local',signal:controller.signal});
      available=response.ok&&(await response.json()).service==='kairo-hours';
    }catch(e){}finally{clearTimeout(deadline);if(probe===controller)probe=null;}
    if(!dialog.open||serial!==requestSerial)return;
    if(available&&resume){rememberKairoVpn();completed=true;dialog.close();return;}
    schedule(Date.now()<fastCheckUntil?2000:10000);
  }
  async function choose(mode){
    var request=requestMobileMode(mode,base);
    if(!request)return;
    ++requestSerial;clearTimeout(timer);if(probe){probe.abort();probe=null;}
    resume=false;buttons();
    var received=await request;
    if(!dialog.open)return;
    notify(received?MOBILE_CONNECTION_MODES[mode].label+': solicitud enviada.':'Entrega sin confirmar. Comprueba el widget antes de repetir.',received?'info':'error');
    fastCheckUntil=Date.now()+20000;
    resume=mode==='vpn'&&(typeof onVpnReady==='function');
    schedule(1000);
  }
  function foreground(){if(document.hidden){clearTimeout(timer);return;}check();}
  dialog.querySelector('.mobile-modes').onclick=function(e){var b=e.target.closest('[data-mobile-mode]');if(b)choose(b.dataset.mobileMode);};
  link.querySelector('[data-save]').onclick=function(){
    var candidate=mobileWebhookBase(input.value.trim());
    if(!candidate){notify('Introduce un enlace HTTPS de trigger.macrodroid.com.','error');return;}
    try{appStorage.setItem('excelia-alarm-url',candidate);}catch(e){notify('El navegador no ha podido guardar el enlace.','error');return;}
    base=candidate;input.value='';buttons();
  };
  function back(){dialog.close();}
  dialog.querySelector('[data-back]').onclick=back;
  dialog.addEventListener('close',function(){
    clearTimeout(timer);clearTimeout(noticeTimer);if(probe)probe.abort();
    window.removeEventListener('gestify-mode-idle',buttons);window.removeEventListener('focus',foreground);window.removeEventListener('online',foreground);
    document.removeEventListener('visibilitychange',foreground);dialog.remove();
    if(NAV_BACK===back)restore();
    if(completed&&typeof onVpnReady==='function')onVpnReady();
  },{once:true});
  document.body.append(dialog);dialog.showModal();NAV_BACK=back;buttons();
  window.addEventListener('gestify-mode-idle',buttons);window.addEventListener('focus',foreground);window.addEventListener('online',foreground);document.addEventListener('visibilitychange',foreground);
  if(base&&initialMode&&!mobileModeRequest)choose(initialMode);else check();
}
