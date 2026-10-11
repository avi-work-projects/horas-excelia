/* Exportaciones: nombres únicos y copia opcional en una carpeta elegida.
   El permiso de carpeta es local a este dispositivo: no viaja en el backup. */
var EXPORT_DIRECTORY=null;
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
  EXPORT_DIRECTORY_READY=exportDirectoryStore('get').then(function(handle){EXPORT_DIRECTORY=handle||null;}).catch(function(){});
  var btn=document.getElementById('exportFolderBtn');if(btn)btn.onclick=openExportDirectory;
}
async function saveExportCopy(blob,filename){
  await EXPORT_DIRECTORY_READY;
  var dir=EXPORT_DIRECTORY;if(!dir)return false;
  var writable;
  try{
    if(await dir.queryPermission({mode:'readwrite'})!=='granted')throw new Error('permission');
    var file=await dir.getFileHandle(filename,{create:true});
    writable=await file.createWritable();await writable.write(blob);await writable.close();
    showToast('Copia guardada en '+dir.name,'success');return true;
  }catch(err){
    if(writable&&writable.abort)try{await writable.abort();}catch(ignore){}
    showToast('No se pudo guardar la copia. Revisa la carpeta de exportaciones en Ajustes','error');return false;
  }
}
function openExportDirectory(){
  closeSettingsMenu();
  function close(){cerrarPanel('exportFolderWrap','exportFolderOv');}
  var supported=typeof window.showDirectoryPicker==='function';
  var html='<div class="bd-form-overlay" id="exportFolderOv"><div class="bd-form-sheet export-folder-sheet"><header class="bd-panel-header"><button class="sy-back" id="exportFolderClose" aria-label="Volver">←</button><h2>Carpeta de exportaciones</h2></header><p>Al exportar se abrirá Compartir. Si eliges una carpeta, también se guardará una copia con fecha y hora.</p><p id="exportFolderStatus" role="status"></p><button class="ev-btn primary" id="exportFolderChoose"'+(supported?'':' disabled')+'>Elegir carpeta</button><button class="ev-btn" id="exportFolderClear">Dejar de guardar copias</button>'+(supported?'':'<p>Este navegador no permite elegir carpetas. Puedes guardar el archivo desde el menú Compartir si ofrece esa opción.</p>')+'</div></div>';
  var root=abrirPanel('exportFolderWrap',html,{contenedor:document.body,overlay:'exportFolderOv',alCerrar:close});
  function status(){root.querySelector('#exportFolderStatus').textContent=EXPORT_DIRECTORY?'Carpeta: '+EXPORT_DIRECTORY.name:'Sin carpeta seleccionada';root.querySelector('#exportFolderClear').disabled=!EXPORT_DIRECTORY;}
  status();EXPORT_DIRECTORY_READY.then(function(){if(root.isConnected)status();});
  root.querySelector('#exportFolderClose').onclick=close;
  root.querySelector('#exportFolderChoose').onclick=async function(){
    try{
      var dir=await window.showDirectoryPicker({id:'gestify-exports',mode:'readwrite'});
      await exportDirectoryStore('set',dir);EXPORT_DIRECTORY=dir;status();
    }catch(err){if(err.name!=='AbortError')showToast('No se pudo seleccionar la carpeta','error');}
  };
  root.querySelector('#exportFolderClear').onclick=async function(){
    try{await exportDirectoryStore('set',null);EXPORT_DIRECTORY=null;status();}catch(err){showToast('No se pudo quitar la carpeta','error');}
  };
}
