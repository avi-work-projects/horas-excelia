/* Datos de contacto: los grupos conservan juntas sus referencias. */
var CONTACT_DATA_KEY='excelia-contact-data-v1';
var PERSONAL_NOTES_KEY='excelia-personal-notes-v1';
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
    result[g.key]=entries.slice(0,CONTACT_LIMIT).map(function(entry){var row={};g.fields.forEach(function(f){row[f[0]]=text(entry&&entry[f[0]]);});return row;}).filter(function(row){return Object.keys(row).some(function(k){return row[k].trim();});});
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
    next[key].forEach(function(row){var index=result[key].findIndex(function(old){return signature(old)===signature(row);});if(index<0)result[key].push(row);else result[key][index]=row;});
    if(result[key].length>CONTACT_LIMIT)throw new Error('La fusión supera los 8 registros de '+g.title+'. Revisa el archivo antes de importar.');
  });return result;
}
function contactData(){try{return normalizeContactData(JSON.parse(appStorage.getItem(CONTACT_DATA_KEY)||'{}'));}catch(e){return normalizeContactData({});}}
function personalNote(){return appStorage.getItem(PERSONAL_NOTES_KEY)||'';}
function contactFieldHtml(key,label,value){
  return '<label class="invoice-field"><span>'+label+'</span><textarea rows="1" maxlength="2000" data-contact="'+key+'">'+escHtml(value||'')+'</textarea></label>';
}
function renderContactGroups(data){
  return CONTACT_GROUPS.map(function(g){
    var h='<details class="settings-editor-section contact-group" data-contact-group="'+g.key+'"><summary>'+g.title+' <small>Hasta 8</small></summary><div class="contact-group-body">';
    for(var i=0;i<CONTACT_LIMIT;i++){
      var row=data[g.key][i]||{},key=g.key+'.'+i;
      var address=g.key==='addresses';
      h+='<'+(address?'details':'section')+' class="contact-entry'+(address?' contact-address':'')+'" data-contact-entry="'+key+'"'+(i>=Math.max(1,data[g.key].length)?' hidden':'')+'>'+ (address?'<summary><span class="contact-address-title">'+escHtml(row.label||row.address||('Dirección '+(i+1)))+'</span></summary><div class="contact-address-body">':'')+'<header><label><input type="checkbox" data-personal-select="'+key+'"> '+g.item+' '+(i+1)+'</label><button class="contact-remove" type="button" data-contact-remove="'+key+'" data-settings-edit-only aria-label="Quitar '+g.item+' '+(i+1)+'">Quitar</button></header>';
      g.fields.forEach(function(f){h+=contactFieldHtml(key+'.'+f[0],f[1],row[f[0]]);});h+=address?'</div></details>':'</section>';
    }
    return h+'<button type="button" class="ev-btn contact-add" data-contact-add="'+g.key+'" data-settings-edit-only>Añadir '+g.item+'</button></div></details>';
  }).join('');
}
function readContactFields(root){
  var result={};CONTACT_FIELDS.forEach(function(f){result[f[0]]=root.querySelector('[data-contact="'+f[0]+'"]').value;});
  CONTACT_GROUPS.forEach(function(g){result[g.key]=[];for(var i=0;i<CONTACT_LIMIT;i++){var row={};g.fields.forEach(function(f){row[f[0]]=root.querySelector('[data-contact="'+g.key+'.'+i+'.'+f[0]+'"]').value;});result[g.key].push(row);}});
  return normalizeContactData(result);
}
function contactSelectionText(root){
  var lines=[];
  root.querySelectorAll('[data-personal-select]:checked').forEach(function(box){
    var key=box.dataset.personalSelect,parts=key.split('.');
    if(parts.length===1){var field=CONTACT_FIELDS.find(function(f){return f[0]===key;}),value=root.querySelector('[data-contact="'+key+'"]').value.trim();if(value)lines.push(field[1]+': '+value);}
    else{var group=CONTACT_GROUPS.find(function(g){return g.key===parts[0];}),values=[];group.fields.forEach(function(f){var value=root.querySelector('[data-contact="'+key+'.'+f[0]+'"]').value.trim();if(value)values.push(f[1]+': '+value);});if(values.length)lines.push(group.item+' '+(+parts[1]+1)+'\n'+values.join('\n'));}
  });return lines.join('\n');
}
function bindContactGroups(root){
  function update(){root.querySelectorAll('.contact-address').forEach(function(entry){var key=entry.dataset.contactEntry;entry.querySelector('.contact-address-title').textContent=entry.querySelector('[data-contact="'+key+'.label"]').value.trim()||entry.querySelector('[data-contact="'+key+'.address"]').value.trim()||('Dirección '+(+key.split('.')[1]+1));});root.querySelectorAll('[data-contact-add]').forEach(function(btn){btn.disabled=!root.querySelector('[data-contact-entry^="'+btn.dataset.contactAdd+'."][hidden]');});}
  root.querySelectorAll('[data-contact-add]').forEach(function(btn){btn.onclick=function(){var entry=root.querySelector('[data-contact-entry^="'+btn.dataset.contactAdd+'."][hidden]');if(entry){entry.hidden=false;if(entry.tagName==='DETAILS')entry.open=true;entry.querySelector('textarea').focus();}update();};});
  root.querySelectorAll('[data-contact-remove]').forEach(function(btn){btn.onclick=function(){var entry=btn.closest('.contact-entry');entry.querySelectorAll('textarea').forEach(function(el){el.value='';});entry.querySelector('input').checked=false;entry.hidden=true;update();};});
  root.querySelectorAll('.contact-address textarea').forEach(function(field){field.addEventListener('input',update);});
  update();return update;
}
function openPersonalData(){
  closeSettingsMenu();var previous=NAV_BACK,data=contactData(),visibility=[];
  function close(){cerrarPanel('personalDataWrap','personalDataOv');if(NAV_BACK===close)NAV_BACK=previous;}
  var body='<p class="settings-editor-note">Selecciona los datos que quieras copiar juntos. Se guardan en este dispositivo y en tus copias de seguridad.</p>';
  CONTACT_FIELDS.forEach(function(f){body+='<div class="personal-data-row"><input type="checkbox" data-personal-select="'+f[0]+'" aria-label="Seleccionar '+f[1]+'">'+contactFieldHtml(f[0],f[1],data[f[0]])+'</div>';});
  body+=renderContactGroups(data);
  var root=abrirPanel('personalDataWrap',settingsPanelHtml('personalData','Mis Datos',body,'var(--home-tone)'),{contenedor:document.body,overlay:'personalDataOv',alCerrar:close});root.querySelector('#personalDataClose').onclick=close;NAV_BACK=close;
  var copy=document.createElement('button');copy.className='ev-btn personal-copy-selected';copy.id='personalCopySelected';root.querySelector('.settings-editor-actions').prepend(copy);
  function selection(){copy.disabled=!root.querySelector('[data-personal-select]:checked');copy.innerHTML=settingsCopyIcon(false)+'<span>Copiar Selección</span>';copy.classList.remove('copied');copy.setAttribute('aria-label','Copiar Selección');}
  root.querySelectorAll('[data-personal-select]').forEach(function(el){el.onchange=selection;});
  copy.onclick=function(){var text=contactSelectionText(root);if(text)settingsCopyText(text,copy);else showToast('Los campos seleccionados están vacíos');};
  var updateGroups=bindContactGroups(root);
  bindSettingsEditor(root,'personalData',{
    onEdit:function(){root.querySelectorAll('.contact-address:not([hidden])').forEach(function(entry){entry.open=true;});visibility=Array.from(root.querySelectorAll('.contact-entry')).map(function(el){return el.hidden;});},
    onCancel:function(){root.querySelectorAll('.contact-entry').forEach(function(el,i){el.hidden=visibility[i];});updateGroups();},
    onMode:function(editing){copy.hidden=editing;root.querySelectorAll('[data-personal-select]').forEach(function(el){el.hidden=editing;});selection();updateGroups();},
    onSave:function(){appStorage.setItem(CONTACT_DATA_KEY,JSON.stringify(readContactFields(root)));showToast('Datos guardados','success');}
  });
}
function openPersonalNotes(){
  closeSettingsMenu();var previous=NAV_BACK;
  function close(){cerrarPanel('personalNotesWrap','personalNotesOv');if(NAV_BACK===close)NAV_BACK=previous;}
  var body='<label class="invoice-field personal-note-field"><span>Mi Nota</span><textarea id="personalNoteText" rows="14" maxlength="50000" placeholder="Escribe aquí tus notas">'+escHtml(personalNote())+'</textarea></label>';
  var root=abrirPanel('personalNotesWrap',settingsPanelHtml('personalNotes','Notas',body,'#537b78'),{contenedor:document.body,overlay:'personalNotesOv',alCerrar:close});root.querySelector('#personalNotesClose').onclick=close;NAV_BACK=close;
  bindSettingsEditor(root,'personalNotes',{onSave:function(){appStorage.setItem(PERSONAL_NOTES_KEY,root.querySelector('#personalNoteText').value);showToast('Nota guardada','success');}});
}
