/* Datos de contacto: los grupos conservan juntas sus referencias. */
var CONTACT_DATA_KEY='excelia-contact-data-v1';
var PERSONAL_NOTES_KEY='excelia-personal-notes-v1';
var HAIRDRESSER_NOTES_KEY='excelia-hairdresser-notes-v1';
var PERSONAL_NOTES_TAB='general'; // general | hairdresser
var CONTACT_LIMIT=8;
var CONTACT_FIELDS=[['name','Nombre y Apellidos'],['tax','DNI / NIE'],['passport','Pasaporte'],['birth','Fecha de Nacimiento'],['phone','Teléfono'],['notes','Otros Datos']];
var CONTACT_GROUPS=[
  {key:'emails',title:'Correos Electrónicos',item:'Correo',fields:[['value','Correo Electrónico']]},
  {key:'addresses',title:'Direcciones',item:'Dirección',fields:[['label','Nombre de la Dirección'],['address','Dirección'],['postal','Código Postal'],['city','Localidad']]},
  {key:'banks',title:'Cuentas Bancarias',item:'Cuenta',fields:[['label','Banco / Nombre de la Cuenta'],['iban','IBAN']]},
  {key:'cards',title:'Tarjetas',item:'Tarjeta',fields:[['label','Banco / Nombre de la Tarjeta'],['number','Número de Tarjeta']]}
];
function normalizeContactData(value){
  var v=value&&typeof value==='object'?value:{},result={};
  function text(x){return typeof x==='string'?x.slice(0,2000):'';}
  CONTACT_FIELDS.forEach(function(f){result[f[0]]=text(v[f[0]]);});
  CONTACT_GROUPS.forEach(function(g){
    var entries=Array.isArray(v[g.key])?v[g.key]:[];
    if(!entries.length){
      if(g.key==='emails'&&v.email)entries=[{value:v.email}];
      if(g.key==='addresses'&&(v.address||v.postal||v.city))entries=[{address:v.address,postal:v.postal,city:v.city}];
      if(g.key==='banks'&&v.iban)entries=[{iban:v.iban}];
    }
    result[g.key]=entries.slice(0,CONTACT_LIMIT).map(function(entry){var row={};g.fields.forEach(function(f){row[f[0]]=text(entry&&entry[f[0]]);});if((g.key==='addresses'||g.key==='banks')&&entry&&entry.primary==='1')row.primary='1';return row;}).filter(function(row){return g.fields.some(function(f){return row[f[0]].trim();});});
    var foundPrimary=false;result[g.key].forEach(function(row){if(row.primary==='1'){if(foundPrimary)delete row.primary;foundPrimary=true;}});
  });return result;
}
function validateContactData(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Datos de contacto no válidos');
  function string(v){if(typeof v!=='string'||v.length>2000)throw new Error('Campo personal no válido');}
  Object.keys(value).forEach(function(k){
    var group=CONTACT_GROUPS.find(function(g){return g.key===k;});
    if(!group){string(value[k]);return;}
    if(!Array.isArray(value[k])||value[k].length>CONTACT_LIMIT)throw new Error('Máximo 8 registros por grupo');
    value[k].forEach(function(row){if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Registro personal no válido');Object.keys(row).forEach(function(field){string(row[field]);});});
  });return normalizeContactData(value);
}
function mergeContactData(current,incoming){
  var next=normalizeContactData(incoming),result=normalizeContactData(current);
  CONTACT_FIELDS.forEach(function(f){if(Object.prototype.hasOwnProperty.call(incoming,f[0]))result[f[0]]=next[f[0]];});
  CONTACT_GROUPS.forEach(function(g){
    var key=g.key,identity=key==='emails'?['value']:key==='banks'?['iban']:key==='cards'?['number']:['address','postal','city'];
    function signature(row){var value=identity.map(function(k){return (row[k]||'').trim();}).join('|');return value.replace(/\|/g,'')?value:JSON.stringify(row);}
    if(next[key].some(function(row){return row.primary==='1';}))result[key].forEach(function(row){delete row.primary;});
    next[key].forEach(function(row){var index=result[key].findIndex(function(old){return signature(old)===signature(row);});if(index<0)result[key].push(row);else{if(!row.primary&&result[key][index].primary)row.primary=result[key][index].primary;result[key][index]=row;}});
    if(result[key].length>CONTACT_LIMIT)throw new Error('La fusión supera los 8 registros de '+g.title+'. Revisa el archivo antes de importar.');
  });return result;
}
function contactData(){try{return normalizeContactData(JSON.parse(appStorage.getItem(CONTACT_DATA_KEY)||'{}'));}catch(e){return normalizeContactData({});}}
function personalNote(){return appStorage.getItem(PERSONAL_NOTES_KEY)||'';}
function hairdresserNote(){return appStorage.getItem(HAIRDRESSER_NOTES_KEY)||'';}
function contactValueText(key,label,value){
  return key==='name'||key==='phone'||key.indexOf('emails.')===0?value:label+': '+value;
}
function contactFieldHtml(key,label,value){
  return '<label class="invoice-field"><span>'+label+'</span><textarea rows="1" maxlength="2000" data-contact="'+key+'">'+escHtml(value||'')+'</textarea></label>';
}
function renderContactGroups(data){
  return CONTACT_GROUPS.map(function(g){
    var h='<details class="settings-editor-section contact-group" data-contact-group="'+g.key+'"><summary>'+g.title+' <small>Hasta 8</small></summary><div class="contact-group-body">';
    for(var i=0;i<CONTACT_LIMIT;i++){
      var row=data[g.key][i]||{},key=g.key+'.'+i;
      var address=g.key==='addresses'||g.key==='banks',principal=contactPrimaryIndex(data[g.key]);
      h+='<'+(address?'details':'section')+' class="contact-entry'+(address?' contact-address':'')+'" data-contact-entry="'+key+'"'+(i>=Math.max(1,data[g.key].length)?' hidden':'')+'>'+ (address?'<summary><span class="contact-address-title">'+escHtml(row.label||row.address||(g.item+' '+(i+1)))+'</span><small class="contact-primary-badge"'+(i===principal?'':' hidden')+'>Principal</small><button type="button" class="settings-copy contact-copy-entry" data-copy-entry="'+key+'" data-copy-label="Copiar '+g.item+' '+(i+1)+'" aria-label="Copiar '+g.item+' '+(i+1)+'">'+settingsCopyIcon(false)+'</button></summary><div class="contact-address-body">':'')+'<header><label><input type="checkbox" data-personal-select="'+key+'"> '+g.item+' '+(i+1)+'</label><button class="contact-remove" type="button" data-contact-remove="'+key+'" data-settings-edit-only aria-label="Quitar '+g.item+' '+(i+1)+'">Quitar</button></header>';
      if(address)h+='<label class="contact-primary-choice" data-settings-edit-only><input type="radio" name="contact-primary-'+g.key+'" data-contact-primary="'+key+'"'+(i===principal?' checked':'')+'> Principal</label>';
      g.fields.forEach(function(f){h+=contactFieldHtml(key+'.'+f[0],f[1],row[f[0]]);});h+=address?'</div></details>':'</section>';
    }
    return h+'<button type="button" class="ev-btn contact-add" data-contact-add="'+g.key+'" data-settings-edit-only>Añadir '+g.item+'</button></div></details>';
  }).join('');
}
function readContactFields(root){
  var result={};CONTACT_FIELDS.forEach(function(f){result[f[0]]=root.querySelector('[data-contact="'+f[0]+'"]').value;});
  CONTACT_GROUPS.forEach(function(g){result[g.key]=[];for(var i=0;i<CONTACT_LIMIT;i++){var row={};g.fields.forEach(function(f){row[f[0]]=root.querySelector('[data-contact="'+g.key+'.'+i+'.'+f[0]+'"]').value;});var primary=root.querySelector('[data-contact-primary="'+g.key+'.'+i+'"]');if(primary&&primary.checked)row.primary='1';result[g.key].push(row);}});
  return normalizeContactData(result);
}
function contactSelectionText(root){
  var lines=[];
  root.querySelectorAll('[data-personal-select]:checked').forEach(function(box){
    var key=box.dataset.personalSelect,parts=key.split('.');
    if(parts.length===1){var field=CONTACT_FIELDS.find(function(f){return f[0]===key;}),value=root.querySelector('[data-contact="'+key+'"]').value.trim();if(value)lines.push(contactValueText(key,field[1],value));}
    else{var group=CONTACT_GROUPS.find(function(g){return g.key===parts[0];}),values=[];group.fields.forEach(function(f){var value=root.querySelector('[data-contact="'+key+'.'+f[0]+'"]').value.trim();if(value)values.push(contactValueText(key+'.'+f[0],f[1],value));});if(values.length)lines.push(values.join('\n'));}
  });return lines.join('\n');
}
function contactPrimaryIndex(rows){var index=rows.findIndex(function(row){return row.primary==='1';});return index<0?0:index;}
function contactResizeFields(root){root.querySelectorAll('textarea[data-contact]').forEach(function(field){if(!field.getClientRects().length)return;field.style.height='auto';field.style.height=(field.scrollHeight+field.offsetHeight-field.clientHeight)+'px';});}
function bindContactGroups(root){
  function update(){
    root.querySelectorAll('.contact-address').forEach(function(entry){var key=entry.dataset.contactEntry,parts=key.split('.'),group=CONTACT_GROUPS.find(function(g){return g.key===parts[0];});entry.querySelector('.contact-address-title').textContent=entry.querySelector('[data-contact="'+key+'.label"]').value.trim()||entry.querySelector('[data-contact="'+key+'.'+(parts[0]==='banks'?'iban':'address')+'"]').value.trim()||(group.item+' '+(+parts[1]+1));entry.querySelector('.contact-primary-badge').hidden=!entry.querySelector('[data-contact-primary]').checked;});
    root.querySelectorAll('[data-contact-add]').forEach(function(btn){btn.disabled=!root.querySelector('[data-contact-entry^="'+btn.dataset.contactAdd+'."][hidden]');});contactResizeFields(root);
  }
  root.querySelectorAll('[data-contact-add]').forEach(function(btn){btn.onclick=function(){var entry=root.querySelector('[data-contact-entry^="'+btn.dataset.contactAdd+'."][hidden]');if(entry){entry.hidden=false;if(entry.tagName==='DETAILS')entry.open=true;entry.querySelector('textarea').focus();}update();};});
  root.querySelectorAll('[data-contact-remove]').forEach(function(btn){btn.onclick=function(){var entry=btn.closest('.contact-entry'),primary=entry.querySelector('[data-contact-primary]');entry.querySelectorAll('textarea').forEach(function(el){el.value='';});entry.querySelector('[data-personal-select]').checked=false;entry.hidden=true;if(primary&&primary.checked){primary.checked=false;var other=entry.parentNode.querySelector('.contact-entry:not([hidden]) [data-contact-primary]');if(other)other.checked=true;}update();};});
  root.querySelectorAll('textarea[data-contact]').forEach(function(field){field.addEventListener('input',update);});
  root.querySelectorAll('[data-contact-primary]').forEach(function(field){field.addEventListener('change',update);});
  root.querySelectorAll('details').forEach(function(details){details.addEventListener('toggle',function(){contactResizeFields(root);});});
  root.querySelectorAll('[data-copy-entry]').forEach(function(btn){btn.onclick=function(e){e.preventDefault();e.stopPropagation();var key=btn.dataset.copyEntry,group=CONTACT_GROUPS.find(function(g){return g.key===key.split('.')[0];}),lines=[];group.fields.forEach(function(f){var value=root.querySelector('[data-contact="'+key+'.'+f[0]+'"]').value.trim();if(value)lines.push(group.key==='emails'?value:f[1]+': '+value);});if(lines.length)settingsCopyText(lines.join('\n'),btn);else showToast('Este registro está vacío');};});
  update();return update;
}
function openPersonalData(){
  closeSettingsMenu();var previous=NAV_BACK,data=contactData(),visibility=[],resizeObserver;
  function close(){if(resizeObserver)resizeObserver.disconnect();cerrarPanel('personalDataWrap','personalDataOv');if(NAV_BACK===close)NAV_BACK=previous;}
  var body='<div class="contact-shortcuts" aria-label="Atajos de Selección"><button type="button" data-contact-shortcut="contact">Nombre, DNI, Correo y Teléfono</button><button type="button" data-contact-shortcut="address">Dirección Principal</button><button type="button" data-contact-shortcut="identity">Nombre, Apellidos y DNI</button></div>';
  CONTACT_FIELDS.forEach(function(f){body+='<div class="personal-data-row"><input type="checkbox" data-personal-select="'+f[0]+'" aria-label="Seleccionar '+f[1]+'">'+contactFieldHtml(f[0],f[1],data[f[0]])+'</div>';});
  body+=renderContactGroups(data);
  var root=abrirPanel('personalDataWrap',settingsPanelHtml('personalData','Mis Datos',body,'var(--home-tone)'),{contenedor:document.body,overlay:'personalDataOv',alCerrar:close});root.querySelector('#personalDataClose').onclick=close;NAV_BACK=close;
  var copy=document.createElement('button');copy.className='ev-btn personal-copy-selected';copy.id='personalCopySelected';root.querySelector('.settings-editor-actions').prepend(copy);
  function selection(){copy.disabled=!root.querySelector('[data-personal-select]:checked');copy.innerHTML=settingsCopyIcon(false)+'<span>Copiar Selección</span>';copy.classList.remove('copied');copy.setAttribute('aria-label','Copiar Selección');}
  root.querySelectorAll('[data-personal-select]').forEach(function(el){el.onchange=selection;});
  var selectionStart=null;
  root.addEventListener('pointerdown',function(e){selectionStart={x:e.clientX,y:e.clientY};},{passive:true});
  root.addEventListener('click',function(e){
    if(!root.classList.contains('settings-is-reading')||e.target.closest('button,input,summary'))return;
    var card=e.target.closest('.personal-data-row,.contact-entry');if(!card)return;
    var label=e.target.closest('label');if(label&&label.querySelector('[data-personal-select]'))return;
    if(selectionStart&&Math.hypot(e.clientX-selectionStart.x,e.clientY-selectionStart.y)>6)return;
    var box=card.querySelector('[data-personal-select]');if(!box||box.hidden)return;
    e.preventDefault();box.checked=!box.checked;selection();
  });
  copy.onclick=function(){var text=contactSelectionText(root);if(text)settingsCopyText(text,copy);else showToast('Los campos seleccionados están vacíos');};
  var updateGroups=bindContactGroups(root);
  if(typeof ResizeObserver!=='undefined'){var lastWidth=0;resizeObserver=new ResizeObserver(function(entries){var width=entries[0].contentRect.width;if(width!==lastWidth){lastWidth=width;contactResizeFields(root);}});resizeObserver.observe(root.querySelector('.settings-editor-sheet'));}
  root.querySelectorAll('[data-contact-shortcut]').forEach(function(btn){btn.onclick=async function(){var mode=btn.dataset.contactShortcut,keys=mode==='address'?[(root.querySelector('[data-contact-primary^="addresses."]:checked')||{dataset:{contactPrimary:'addresses.0'}}).dataset.contactPrimary]:['name','tax'];if(mode==='contact')keys.push('emails.0','phone');root.querySelectorAll('[data-personal-select]').forEach(function(box){box.checked=keys.indexOf(box.dataset.personalSelect)>=0;});selection();var text=contactSelectionText(root);if(!text){showToast('Los campos del atajo están vacíos');return;}var label=btn.textContent;btn.disabled=true;await settingsCopyText(text,btn);btn.innerHTML=settingsCopyIcon(btn.classList.contains('copied'))+'<span>'+escHtml(label)+'</span>';btn.setAttribute('aria-label',label+(btn.classList.contains('copied')?' · Copiado':''));btn.disabled=false;};});
  bindSettingsEditor(root,'personalData',{
    onEdit:function(){root.querySelectorAll('.contact-address:not([hidden])').forEach(function(entry){entry.open=true;});visibility=Array.from(root.querySelectorAll('.contact-entry')).map(function(el){return el.hidden;});},
    onCancel:function(){root.querySelectorAll('.contact-entry').forEach(function(el,i){el.hidden=visibility[i];});updateGroups();},
    onMode:function(editing){copy.hidden=editing;root.querySelector('.contact-shortcuts').hidden=editing;root.querySelectorAll('[data-personal-select]').forEach(function(el){el.hidden=editing;});selection();updateGroups();},
    onSave:function(){appStorage.setItem(CONTACT_DATA_KEY,JSON.stringify(readContactFields(root)));showToast('Datos guardados','success');}
  });
}
function openPersonalNotes(options){
  options=options||{};if(options.tab)PERSONAL_NOTES_TAB=options.tab;
  closeSettingsMenu();var previous=NAV_BACK;
  function close(){cerrarPanel('personalNotesWrap','personalNotesOv');if(NAV_BACK===close)NAV_BACK=previous;if(options.onClose)setTimeout(options.onClose,320);}
  var body='<div class="econ-sub-tabs personal-notes-tabs" role="tablist" aria-label="Mis notas"><button class="econ-sub-tab" role="tab" id="personalGeneralTab" aria-controls="personalGeneralPanel" data-notes-tab="general">General</button><button class="econ-sub-tab" role="tab" id="personalHairdresserTab" aria-controls="personalHairdresserPanel" data-notes-tab="hairdresser">Peluquería</button></div>';
  body+='<label class="invoice-field personal-note-field" id="personalGeneralPanel" role="tabpanel" aria-labelledby="personalGeneralTab" data-notes-panel="general"><span>Mi Nota</span><textarea id="personalNoteText" rows="14" maxlength="50000" placeholder="Escribe aquí tus notas">'+escHtml(personalNote())+'</textarea></label>';
  body+='<label class="invoice-field personal-note-field" id="personalHairdresserPanel" role="tabpanel" aria-labelledby="personalHairdresserTab" data-notes-panel="hairdresser"><span>Instrucciones para el peluquero</span><textarea id="hairdresserNoteText" rows="14" maxlength="50000" placeholder="Estas instrucciones aparecerán en tus eventos de peluquería">'+escHtml(hairdresserNote())+'</textarea></label>';
  var root=abrirPanel('personalNotesWrap',settingsPanelHtml('personalNotes','Notas',body,'#537b78'),{contenedor:document.body,overlay:'personalNotesOv',alCerrar:close});root.querySelector('#personalNotesClose').onclick=close;NAV_BACK=close;
  root.querySelector('.settings-editor-body').classList.add('personal-notes-body');
  function selectTab(tab){
    PERSONAL_NOTES_TAB=tab;
    root.querySelectorAll('[data-notes-tab]').forEach(function(btn){var active=btn.dataset.notesTab===tab;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));btn.tabIndex=active?0:-1;});
    root.querySelectorAll('[data-notes-panel]').forEach(function(panel){panel.hidden=panel.dataset.notesPanel!==tab;});
  }
  root.querySelectorAll('[data-notes-tab]').forEach(function(btn){btn.onclick=function(){selectTab(btn.dataset.notesTab);};btn.onkeydown=function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selectTab(PERSONAL_NOTES_TAB==='general'?'hairdresser':'general');root.querySelector('[data-notes-tab="'+PERSONAL_NOTES_TAB+'"]').focus();}};});
  selectTab(PERSONAL_NOTES_TAB);
  bindSettingsEditor(root,'personalNotes',{onSave:function(){
    appStorage.begin();
    try{appStorage.setItem(PERSONAL_NOTES_KEY,root.querySelector('#personalNoteText').value);appStorage.setItem(HAIRDRESSER_NOTES_KEY,root.querySelector('#hairdresserNoteText').value);appStorage.commit();}
    catch(e){appStorage.cancel();throw e;}
    showToast('Notas guardadas','success');
  }});
  if(options.edit)root.querySelector('#personalNotesEdit').click();
}
