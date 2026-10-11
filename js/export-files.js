/* Exportaciones: nombres únicos y copia opcional en una carpeta elegida.
   El permiso de carpeta es local a este dispositivo: no viaja en el backup. */
var EXPORT_DIRECTORY=null;
var EXPORT_DIRECTORY_LABEL='';
var EXPORT_DIRECTORY_READY=Promise.resolve();
var EXPORT_NAME_LAST='',EXPORT_NAME_SEQUENCE=0;
function exportFileName(filename){
  var d=new Date(),pad=function(n,size){return String(n).padStart(size||2,'0');};
  var stamp=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'_'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds())+'_'+pad(d.getMilliseconds(),3);
  EXPORT_NAME_SEQUENCE=stamp===EXPORT_NAME_LAST?EXPORT_NAME_SEQUENCE+1:0;EXPORT_NAME_LAST=stamp;
  if(EXPORT_NAME_SEQUENCE)stamp+='_'+EXPORT_NAME_SEQUENCE;
  var dot=filename.lastIndexOf('.');
  return (dot<0?filename:filename.slice(0,dot))+'_'+stamp+(dot<0?'':filename.slice(dot));
}
function exportDirectoryStore(mode,value){
  return new Promise(function(resolve,reject){
    if(!window.indexedDB){reject(new Error('Almacenamiento de carpetas no disponible'));return;}
    var req=indexedDB.open('gestify-export-directory',1);
    req.onupgradeneeded=function(){req.result.createObjectStore('preferences');};
    req.onerror=function(){reject(req.error);};
    req.onsuccess=function(){
      var db=req.result;
      try{
        var tx=db.transaction('preferences',mode==='get'?'readonly':'readwrite'),store=tx.objectStore('preferences');
        var op=mode==='get'?store.get('directory'):value?store.put(value,'directory'):store.delete('directory');
        tx.oncomplete=function(){db.close();resolve(op.result);};
        tx.onerror=tx.onabort=function(){db.close();reject(tx.error||new Error('No se pudo guardar la carpeta'));};
      }catch(err){db.close();reject(err);}
    };
  });
}
function initExportDirectory(){
  EXPORT_DIRECTORY_READY=exportDirectoryStore('get').then(function(record){EXPORT_DIRECTORY=record&&(record.handle||record);EXPORT_DIRECTORY_LABEL=record&&record.label||'';}).catch(function(){});
  var btn=document.getElementById('exportFolderBtn');if(btn)btn.onclick=openExportDirectory;
}
async function saveExportCopy(blob,filename){
  await EXPORT_DIRECTORY_READY;
  var dir=EXPORT_DIRECTORY;if(!dir)return false;
  var writable;
  try{
    var permission=await dir.queryPermission({mode:'readwrite'});
    if(permission==='prompt'&&dir.requestPermission)permission=await dir.requestPermission({mode:'readwrite'});
    if(permission!=='granted')throw new Error('permission');
    var file=await dir.getFileHandle(filename,{create:true});
    writable=await file.createWritable();await writable.write(blob);await writable.close();
    showToast('Copia guardada en '+(EXPORT_DIRECTORY_LABEL||dir.name),'success');return true;
  }catch(err){
    if(writable&&writable.abort)try{await writable.abort();}catch(ignore){}
    showToast('No se pudo guardar la copia. Revisa la carpeta de exportaciones en Ajustes','error');return false;
  }
}
function openExportDirectory(onClosed){
  closeSettingsMenu();
  function close(){cerrarPanel('exportFolderWrap','exportFolderOv');if(typeof onClosed==='function')onClosed();}
  var supported=typeof window.showDirectoryPicker==='function';
  var html='<div class="bd-form-overlay" id="exportFolderOv"><div class="bd-form-sheet export-folder-sheet"><header class="bd-panel-header panel-header-centered"><button class="sy-back" id="exportFolderClose" aria-label="Volver">←</button><h2>Modificar ruta de guardado</h2></header><p>Al exportar podrás guardar una copia, compartir el archivo o hacer ambas cosas.</p><p id="exportFolderStatus" role="status"></p><button class="ev-btn" id="exportFolderChoose"'+(supported?'':' disabled')+'>Elegir o cambiar carpeta</button><label for="exportFolderLabel">Ubicación descriptiva</label><input class="ev-input" id="exportFolderLabel" maxlength="200" placeholder="Ej.: Downloads / Gestify"><p>Referencia escrita por ti. El navegador no permite consultar las carpetas superiores.</p><button class="ev-btn primary" id="exportFolderSave">Guardar referencia</button>'+(supported?'':'<p>Este navegador no permite elegir carpetas. La copia se descargará en la ubicación configurada por el navegador.</p>')+'</div></div>';
  var root=abrirPanel('exportFolderWrap',html,{contenedor:document.body,overlay:'exportFolderOv',alCerrar:close});
  function status(){root.querySelector('#exportFolderStatus').textContent=EXPORT_DIRECTORY?'Carpeta: '+(EXPORT_DIRECTORY_LABEL||EXPORT_DIRECTORY.name):'Sin carpeta seleccionada';root.querySelector('#exportFolderLabel').value=EXPORT_DIRECTORY_LABEL;root.querySelector('#exportFolderSave').disabled=!EXPORT_DIRECTORY;}
  status();EXPORT_DIRECTORY_READY.then(function(){if(root.isConnected)status();});
  root.querySelector('#exportFolderClose').onclick=close;
  root.querySelector('#exportFolderChoose').onclick=async function(){
    try{
      var dir=await window.showDirectoryPicker({id:'gestify-exports',mode:'readwrite'});
      await exportDirectoryStore('set',{handle:dir,label:''});EXPORT_DIRECTORY=dir;EXPORT_DIRECTORY_LABEL='';status();
    }catch(err){if(err.name!=='AbortError')showToast('No se pudo seleccionar la carpeta','error');}
  };
  root.querySelector('#exportFolderSave').onclick=async function(){
    try{var label=root.querySelector('#exportFolderLabel').value.trim();await exportDirectoryStore('set',{handle:EXPORT_DIRECTORY,label:label});EXPORT_DIRECTORY_LABEL=label;status();showToast('Ubicación descriptiva guardada','success');}catch(err){showToast('No se pudo guardar la referencia','error');}
  };
}
function renderExportActionIcon(mode){
  var paths={save:'M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4',share:'M14 3h7v7M21 3l-11 11M10 5H4v15h15v-6',both:'M8 8H3v13h13v-5M8 3h8l5 5v8H8V3Zm8 0v5h5M11 12h7m-3-3 3 3-3 3'};
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[mode]+'"/></svg>';
}
function openExportChoice(blob,filename,onSuccess,options){
  function close(){cerrarPanel('exportChoiceWrap','exportChoiceOv');}
  var html='<div class="bd-form-overlay" id="exportChoiceOv"><div class="bd-form-sheet export-choice-sheet" role="dialog" aria-modal="true" aria-labelledby="exportChoiceTitle"><header class="bd-panel-header panel-header-centered"><button class="sy-back" id="exportChoiceClose" aria-label="Volver">←</button><h2 id="exportChoiceTitle">Exportar archivo</h2></header><div class="export-choice-file">'+renderDocumentIcon()+'<p class="export-choice-filename">'+escHtml(filename)+'</p></div><div class="export-choice-options">';
  [['save','Guardar copia'],['share','Compartir'],['both','Guardar y compartir']].forEach(function(item){html+='<button class="ev-btn" data-export-mode="'+item[0]+'"><span class="export-choice-icon">'+renderExportActionIcon(item[0])+'</span><strong>'+item[1]+'</strong></button>';});
  html+='</div><p id="exportChoiceLocation"></p><button class="ev-btn" id="exportChoiceFolder">Modificar ruta de guardado</button></div></div>';
  var root=abrirPanel('exportChoiceWrap',html,{contenedor:document.body,overlay:'exportChoiceOv',alCerrar:close});
  function location(){if(root.isConnected)root.querySelector('#exportChoiceLocation').textContent=EXPORT_DIRECTORY?'Copia local: '+(EXPORT_DIRECTORY_LABEL||EXPORT_DIRECTORY.name):'Sin carpeta elegida: la copia se guardará mediante una descarga.';}
  location();EXPORT_DIRECTORY_READY.then(location);
  root.querySelector('#exportChoiceClose').onclick=close;
  root.querySelector('#exportChoiceFolder').onclick=function(){openExportDirectory(location);};
  root.querySelectorAll('[data-export-mode]').forEach(function(button){button.onclick=function(){close();shareOrDownload(blob,filename,onSuccess,Object.assign({},options,{mode:button.dataset.exportMode}));};});
}
