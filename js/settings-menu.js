/* Un único menú de ajustes para Home y cualquier ventana. Vive en body para
   quedar por encima de los overlays, sin cerrar ni volver a pintar la vista. */
var SETTINGS_MENU_ANCHOR=null;
var SETTINGS_MENU_BACK=null;
function closeSettingsMenu(restoreFocus){
  var menu=document.getElementById('dataMenu');if(menu)menu.classList.remove('open');
  if(SETTINGS_MENU_ANCHOR){
    SETTINGS_MENU_ANCHOR.setAttribute('aria-expanded','false');
    if(restoreFocus===true&&SETTINGS_MENU_ANCHOR.isConnected)SETTINGS_MENU_ANCHOR.focus();
  }
  if(NAV_BACK===closeSettingsMenu)NAV_BACK=SETTINGS_MENU_BACK;
  SETTINGS_MENU_ANCHOR=null;SETTINGS_MENU_BACK=null;
}
function positionSettingsMenu(){
  _positionHeaderMenu(document.getElementById('dataMenu'),SETTINGS_MENU_ANCHOR);
}
/* Ajustes y campana comparten anclaje y límites, también con el teclado móvil. */
function _positionHeaderMenu(menu,anchor){
  if(!menu||!anchor||!menu.classList.contains('open'))return;
  var rect=anchor.getBoundingClientRect(),top=Math.max(8,rect.bottom+6);
  var viewport=window.visualViewport,height=viewport?viewport.height:window.innerHeight;
  menu.style.top=top+'px';
  menu.style.left=Math.max(12,Math.min(rect.right-menu.offsetWidth,window.innerWidth-menu.offsetWidth-12))+'px';
  menu.style.maxHeight=Math.max(80,height-top-12)+'px';
}
function toggleSettingsMenu(anchor){
  var menu=document.getElementById('dataMenu');if(!menu)return;
  if(menu.classList.contains('open')){closeSettingsMenu();return;}
  closeAlarmPanel();
  SETTINGS_MENU_ANCHOR=anchor||document.getElementById('menuBtn');
  SETTINGS_MENU_BACK=NAV_BACK;NAV_BACK=closeSettingsMenu;
  setConnectionsEditing(false);
  menu.querySelectorAll('.settings-details').forEach(function(d){d.open=false;});
  menu.classList.add('open');menu.scrollTop=0;
  SETTINGS_MENU_ANCHOR.setAttribute('aria-expanded','true');
  positionSettingsMenu();
}
function setConnectionsEditing(editing){
  if(editing)document.querySelectorAll('.settings-details').forEach(function(d){d.open=true;});
  var values=[normalizeMacroBase(appStorage.getItem('excelia-alarm-url')||''),TO,CC.join(', '),AUTHOR_NAME];
  ['macroAlarmUrlMenu','mailToLocal','mailCcLocal','mailNameLocal'].forEach(function(id,i){
    var input=document.getElementById(id);input.readOnly=!editing;
    if(!editing)input.value=values[i];
  });
  var btn=document.getElementById('editConnectionsBtn');
  btn.textContent=editing?'Guardar configuración':'Editar correo y MacroDroid';
  btn.setAttribute('aria-pressed',String(editing));
}
function initSettingsMenu(){
  var menu=document.getElementById('dataMenu');document.body.appendChild(menu);
  document.getElementById('menuBtn').addEventListener('click',function(e){e.stopPropagation();toggleSettingsMenu(e.currentTarget);});
  document.getElementById('editConnectionsBtn').addEventListener('click',function(){
    var url=document.getElementById('macroAlarmUrlMenu'),to=document.getElementById('mailToLocal');
    if(url.readOnly){setConnectionsEditing(true);return;}
    if(!url.reportValidity()||!to.reportValidity())return;
    var cfg={to:to.value.trim(),cc:document.getElementById('mailCcLocal').value.split(',').map(function(x){return x.trim();}).filter(Boolean),name:document.getElementById('mailNameLocal').value.trim()};
    try{
      appStorage.begin();appStorage.setItem(MAIL_CFG_SK,JSON.stringify(cfg));
      appStorage.setItem('excelia-alarm-url',normalizeMacroBase(url.value));appStorage.commit();
      loadMailConfig();setConnectionsEditing(false);showToast('Configuración guardada','success');
    }catch(e){appStorage.cancel();showToast('No se pudo guardar la configuración','error');}
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&menu.classList.contains('open')){e.preventDefault();e.stopPropagation();closeSettingsMenu(true);}
  },true);
  window.addEventListener('resize',positionSettingsMenu);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',positionSettingsMenu);
  setConnectionsEditing(false);
}
