/* Un único menú de ajustes para Home y cualquier ventana. Vive en body para
   quedar por encima de los overlays, sin cerrar ni volver a pintar la vista. */
var SETTINGS_MENU_ANCHOR=null;
var SETTINGS_MENU_BACK=null;
var SETTINGS_EDITOR_MODES={}; // Por panel: consulta (false) o edición (true).
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
  menu.classList.add('open');menu.scrollTop=0;
  SETTINGS_MENU_ANCHOR.setAttribute('aria-expanded','true');
  positionSettingsMenu();
}
function settingsEditorActions(prefix){
  return '<footer class="settings-editor-actions"><button class="ev-btn" id="'+prefix+'Edit">Editar</button><button class="ev-btn" id="'+prefix+'Cancel" hidden>Cancelar</button><button class="ev-btn primary" id="'+prefix+'Save" hidden>Guardar</button></footer>';
}
function settingsPanelHtml(prefix,title,body,tone){
  return '<div class="bd-form-overlay" id="'+prefix+'Ov"><section class="bd-form-sheet settings-editor-sheet" style="--settings-tone:'+tone+'" role="dialog" aria-modal="true" aria-labelledby="'+prefix+'Title"><header class="bd-panel-header panel-header-centered"><button class="sy-back" id="'+prefix+'Close" aria-label="Volver">←</button><h2 id="'+prefix+'Title">'+title+'</h2></header><div class="settings-editor-body">'+body+'</div>'+settingsEditorActions(prefix)+'</section></div>';
}
function bindSettingsEditor(root,prefix,options){
  var fields=Array.from(root.querySelectorAll('input:not([type="file"]):not([data-personal-select]),textarea,select')),snapshot=[];
  var edit=root.querySelector('#'+prefix+'Edit'),cancel=root.querySelector('#'+prefix+'Cancel'),save=root.querySelector('#'+prefix+'Save');
  bindSettingsCopy(root,fields);
  function setEditing(editing){
    SETTINGS_EDITOR_MODES[prefix]=editing;root.classList.toggle('settings-is-reading',!editing);
    fields.forEach(function(el){if(el.type==='radio'||el.type==='checkbox'||el.tagName==='SELECT')el.disabled=!editing;else el.readOnly=!editing;});
    edit.hidden=editing;cancel.hidden=save.hidden=!editing;
    root.querySelectorAll('[data-settings-edit-only]').forEach(function(el){el.hidden=!editing;});
    root.querySelectorAll('.settings-copy').forEach(function(btn){btn.hidden=editing;btn.classList.remove('copied');btn.innerHTML=settingsCopyIcon(false);btn.setAttribute('aria-label',btn.dataset.copyLabel);});
    if(options.onMode)options.onMode(editing);
  }
  edit.onclick=function(){snapshot=fields.map(function(el){return {value:el.value,checked:el.checked};});if(options.onEdit)options.onEdit();setEditing(true);};
  cancel.onclick=function(){fields.forEach(function(el,i){el.value=snapshot[i].value;el.checked=snapshot[i].checked;});if(options.onCancel)options.onCancel();setEditing(false);};
  save.onclick=async function(){
    if(!fields.every(function(el){return el.reportValidity();}))return;
    save.disabled=cancel.disabled=true;
    try{await options.onSave();if(root.isConnected){setEditing(false);edit.focus();}}
    catch(e){if(options.onError)options.onError(e);else showToast(e.message||'No se pudo guardar la configuración','error');}
    finally{save.disabled=cancel.disabled=false;}
  };
  setEditing(false);
}
function settingsCopyIcon(done){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(done?'<path d="m5 12 4 4 10-10"/>':'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>')+'</svg>';}
async function settingsCopyText(text,button){
  try{await navigator.clipboard.writeText(text);button.classList.add('copied');button.innerHTML=settingsCopyIcon(true)+(button.id==='personalCopySelected'?'<span>Copiado</span>':'');button.setAttribute('aria-label','Copiado');showToast('Copiado','success');}
  catch(e){button.classList.remove('copied');button.innerHTML=settingsCopyIcon(false)+(button.id==='personalCopySelected'?'<span>Copiar Selección</span>':'');button.setAttribute('aria-label',button.dataset.copyLabel||'Copiar selección');showToast('No se pudo copiar. Comprueba el permiso del portapapeles','error');}
}
function bindSettingsCopy(root,fields){
  fields.filter(function(el){return el.type!=='radio'&&el.type!=='checkbox';}).forEach(function(el){
    var label=el.closest('label'),name=label&&label.querySelector('span')?label.querySelector('span').textContent:'Campo';
    var wrap=document.createElement('span');wrap.className='settings-field-value';el.parentNode.insertBefore(wrap,el);wrap.appendChild(el);
    var btn=document.createElement('button');btn.type='button';btn.className='settings-copy';btn.dataset.copyLabel='Copiar '+name;btn.setAttribute('aria-label',btn.dataset.copyLabel);btn.innerHTML=settingsCopyIcon(false);wrap.appendChild(btn);
    btn.onclick=function(e){e.preventDefault();if(!el.value){showToast('Este campo está vacío');return;}settingsCopyText(el.dataset.contact?contactValueText(el.dataset.contact,name,el.value):el.value,btn);};
  });
}
function openConnectionsSettings(kind){
  kind=kind==='macro'?'macro':'mail';closeSettingsMenu();var previous=NAV_BACK;
  function close(){cerrarPanel('connectionsWrap','connectionsOv');if(NAV_BACK===close)NAV_BACK=previous;}
  var values=kind==='macro'?[normalizeMacroBase(appStorage.getItem('excelia-alarm-url')||'')]:[TO,CC.join(', '),AUTHOR_NAME];
  var fields=kind==='macro'?[['macroAlarmUrlMenu','URL base de MacroDroid','url']]:[['mailToLocal','Destinatario','email'],['mailCcLocal','CC (separados por comas)','text'],['mailNameLocal','Tu nombre','text']];
  var title=kind==='macro'?'MacroDroid':'Correo de Horas',body='<section class="settings-editor-section"><h3>'+title+'</h3>';
  fields.forEach(function(f,i){body+='<label class="invoice-field"><span>'+f[1]+'</span><input id="'+f[0]+'" type="'+f[2]+'" value="'+escHtml(values[i])+'" placeholder="Sin configurar"></label>';});body+='</section>';
  var root=abrirPanel('connectionsWrap',settingsPanelHtml('connections',title,body,kind==='macro'?'#8a5794':'var(--c-orange)'),{contenedor:document.body,overlay:'connectionsOv',alCerrar:close});
  root.querySelector('#connectionsClose').onclick=close;NAV_BACK=close;
  bindSettingsEditor(root,'connections',{onSave:function(){
    if(kind==='macro')appStorage.setItem('excelia-alarm-url',normalizeMacroBase(root.querySelector('#macroAlarmUrlMenu').value));
    else{var cfg={to:root.querySelector('#mailToLocal').value.trim(),cc:root.querySelector('#mailCcLocal').value.split(',').map(function(x){return x.trim();}).filter(Boolean),name:root.querySelector('#mailNameLocal').value.trim()};if(cfg.cc.length)invoiceEmails(cfg.cc.join(','));appStorage.setItem(MAIL_CFG_SK,JSON.stringify(cfg));loadMailConfig();}
    showToast('Configuración guardada','success');
  }});
}
function initSettingsMenu(){
  initExportDirectory();
  var menu=document.getElementById('dataMenu');document.body.appendChild(menu);
  document.getElementById('menuBtn').addEventListener('click',function(e){e.stopPropagation();toggleSettingsMenu(e.currentTarget);});
  document.getElementById('editConnectionsBtn').addEventListener('click',function(){openConnectionsSettings('mail');});
  document.getElementById('editMacroBtn').onclick=function(){openConnectionsSettings('macro');};
  document.getElementById('personalDataBtn').onclick=openPersonalData;
  document.getElementById('personalNotesBtn').onclick=openPersonalNotes;
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&menu.classList.contains('open')){e.preventDefault();e.stopPropagation();closeSettingsMenu(true);}
  },true);
  window.addEventListener('resize',positionSettingsMenu);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',positionSettingsMenu);
}
