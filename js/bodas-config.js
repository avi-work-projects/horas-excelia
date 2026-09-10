/* Catalogos estables: desactivar conserva referencias e historico. */
var BODA_CONFIG_SK='excelia-bodas-config-v1';
var BODA_CONFIG=null;
function bodaLoadConfig(){
  var saved=null;
  try{saved=JSON.parse(appStorage.getItem(BODA_CONFIG_SK)||'null');}catch(e){}
  BODA_CONFIG=saved||{packs:[2,4,6].map(function(n){return {id:'pack-'+n,name:({2:'Esencia',4:'Latido',6:'Eternidad'})[n],classes:n,active:true};}),durations:[{id:'dur-60',minutes:60,active:true},{id:'dur-20',minutes:20,active:true}],defaultDurationId:'dur-60',places:BODA_PLACE_LIST.map(function(p){return Object.assign({active:true},p);})};
  /* Renombra solo los nombres generados: conserva los personalizados y sus referencias. */
  BODA_CONFIG.packs.forEach(function(p){var name=({2:'Esencia',4:'Latido',6:'Eternidad'})[p.classes];if(name&&p.id==='pack-'+p.classes&&p.name==='Pack '+p.classes)p.name=name;});
  BODA_COUPLES.forEach(function(c){
    if(!c.packId&&!BODA_CONFIG.packs.some(function(p){return p.classes===(c.contracted||0);})){var n=c.contracted||0;BODA_CONFIG.packs.push({id:'legacy-'+n,name:'Pack '+n,classes:n,active:true});}
  });
  bodaApplyConfig();
}
function bodaApplyConfig(){
  BODA_PLACE_LIST=BODA_CONFIG.places;
  BODA_PLACE_SHORT={};BODA_PLACE_DESC={};
  BODA_PLACE_LIST.forEach(function(p){BODA_PLACE_SHORT[p.k]=p.n;BODA_PLACE_DESC[p.k]=p.d;});
  BODA_PLACE_DEFAULT=BODA_PLACE_LIST.some(function(p){return p.k==='casa'&&p.active!==false;})?'casa':((BODA_PLACE_LIST.find(function(p){return p.active!==false;})||{}).k||'');
}
function saveBodaConfig(){appStorage.setItem(BODA_CONFIG_SK,JSON.stringify(BODA_CONFIG));bodaApplyConfig();}
function validateBodaConfig(c){
  if(!c||typeof c!=='object')throw new Error('Configuración de Bodas incorrecta');
  ['packs','durations','places'].forEach(function(kind){
    if(!Array.isArray(c[kind]))throw new Error('Catalogo de Bodas incorrecto');
    var ids={};c[kind].forEach(function(x){
      var id=x&&(x.id||x.k);
      if(typeof id!=='string'||!/^[-a-z0-9_]+$/i.test(id)||ids[id])throw new Error('Identificador de catalogo incorrecto');ids[id]=true;
      if(kind==='places'){if(typeof x.n!=='string'||typeof x.d!=='string')throw new Error('Sala incorrecta');}
      else{var n=kind==='packs'?x.classes:x.minutes;if(!Number.isInteger(n)||n<(kind==='packs'?0:1)||n>(kind==='packs'?100:480))throw new Error('Cantidad de clases o minutos incorrecta');}
      if(kind==='packs'&&typeof x.name!=='string')throw new Error('Nombre de pack incorrecto');
    });
  });
  if(!c.durations.some(function(d){return d.id===c.defaultDurationId&&d.active!==false;}))throw new Error('Duración por defecto incorrecta');
  return c;
}
function importBodaConfig(incoming,merge){
  if(incoming){
    validateBodaConfig(incoming);
    if(merge){
      ['packs','durations','places'].forEach(function(kind){
        incoming[kind].forEach(function(x){var id=x.id||x.k,found=BODA_CONFIG[kind].find(function(p){return (p.id||p.k)===id;});
          /* Los catalogos locales con referencias mantienen su significado. */
          if(!found)BODA_CONFIG[kind].push(x);else if(!bodaConfigUsed(kind,id))Object.assign(found,x);
        });
      });
      if(!BODA_CONFIG.durations.some(function(d){return d.id===BODA_CONFIG.defaultDurationId&&d.active!==false;}))BODA_CONFIG.defaultDurationId=incoming.defaultDurationId;
    }else BODA_CONFIG=incoming;
    saveBodaConfig();
  }
  bodaLoadConfig();
}
function bodaPackOf(c){return BODA_CONFIG.packs.find(function(p){return c.packId?p.id===c.packId:p.classes===(c.contracted||0);});}
function bodaDuration(ev){var b=ev&&ev.boda;return b&&Number(b.duration)>0?Number(b.duration):60;}
function bodaDefaultDuration(){return BODA_CONFIG.durations.find(function(d){return d.id===BODA_CONFIG.defaultDurationId;})||{id:null,minutes:60};}
function bodaDurationOf(ev){var b=ev&&ev.boda||{};return BODA_CONFIG.durations.find(function(d){return b.durationId?d.id===b.durationId:d.minutes===bodaDuration(ev);});}
function bodaConfigUsed(kind,id){
  if(kind==='packs')return BODA_COUPLES.some(function(c){var p=bodaPackOf(c);return p&&p.id===id;});
  return bodaClasses().some(function(ev){if(kind==='places')return bodaPlaceOf(ev)===id;var d=bodaDurationOf(ev);return d&&d.id===id;});
}
function bodaSetCatalogItem(kind,id,data){
  var list=BODA_CONFIG[kind],item=list.find(function(x){return (x.id||x.k)===id;});
  if(!item)throw new Error('Elemento no encontrado');
  if(kind==='durations'&&id===BODA_CONFIG.defaultDurationId&&data.active===false)throw new Error('Elige otra duración predeterminada antes de desactivar esta');
  /* Fijar referencias y valores anteriores antes de cambiar el catalogo. */
  if(kind==='packs')BODA_COUPLES.forEach(function(c){var p=bodaPackOf(c);if(p){c.packId=p.id;if(c.packClasses==null)c.packClasses=c.contracted||0;}});
  if(kind==='durations')bodaClasses().forEach(function(ev){var d=bodaDurationOf(ev);if(d){ev.boda.duration=bodaDuration(ev);ev.boda.durationId=d.id;}});
  Object.assign(item,data);saveBodas();saveEvents();saveBodaConfig();
}
function bodaDeleteCatalogItem(kind,id){
  if(bodaConfigUsed(kind,id))throw new Error('No se puede borrar: hay parejas o clases asociadas');
  if(kind==='durations'&&id===BODA_CONFIG.defaultDurationId)throw new Error('No se puede borrar la duración predeterminada');
  BODA_CONFIG[kind]=BODA_CONFIG[kind].filter(function(x){return (x.id||x.k)!==id;});saveBodaConfig();
}
function bodaTaken(ev){
  if(!(ev.boda&&ev.boda.coupleId))return false;
  var ds=evDk(new Date());if(ev.start!==ds)return ev.start<ds;
  return !!ev.boda.time&&new Date(ev.start+'T'+ev.boda.time+':00').getTime()+bodaDuration(ev)*60000<=Date.now();
}
function bodaPackStats(){
  var counts={},extras=0,byPack={};
  BODA_COUPLES.forEach(function(c){
    var n=bodaClassesOfCouple(c.id).filter(bodaTaken).length;
    if(n)counts[n]=(counts[n]||0)+1;
    var extra=Math.max(0,n-(c.packClasses==null?(c.contracted||0):c.packClasses));
    if(!extra)return;extras++;
    var p=bodaPackOf(c),id=p?p.id:'unknown';
    if(!byPack[id])byPack[id]={name:p?p.name:'Sin pack',couples:0,classes:0};
    byPack[id].couples++;byPack[id].classes+=extra;
  });return {counts:counts,extras:extras,byPack:byPack};
}
function renderBodaPackStats(){
  var s=bodaPackStats(),h='<div class="boda-stat-t">Parejas por clases tomadas</div><p class="boda-stat-note">Clases ya finalizadas según fecha, hora y duración. No cuenta las futuras ni huecos sin pareja.</p>';
  var nums=[2,3,4,5,6,7,8];Object.keys(s.counts).forEach(function(n){if(nums.indexOf(+n)<0)nums.push(+n);});nums.sort(function(a,b){return a-b;});
  h+='<div class="boda-stats-row boda-count-grid">'+nums.filter(function(n){return s.counts[n]>0;}).map(function(n){return '<div class="boda-stat"><b>'+(s.counts[n]||0)+'</b><span>'+n+' clases</span></div>';}).join('')+'</div>';
  h+='<div class="boda-stat-t">'+s.extras+(s.extras===1?' pareja':' parejas')+' con clases extras</div><p class="boda-stat-note">Extras = clases tomadas por encima de las incluidas al contratar el pack.</p>';
  BODA_CONFIG.packs.forEach(function(p){var row=s.byPack[p.id]||{couples:0,classes:0};h+='<div class="boda-pack-stat"><b>'+escHtml(p.name)+'</b><span>'+row.couples+' parejas · '+row.classes+' extras</span></div>';});
  return h;
}
function renderBodaConfig(){
  var h='<div id="bodaConfigContent"><h3>Configuración de Bodas</h3>';
  [['packs','Packs'],['durations','Duraciones'],['places','Salas']].forEach(function(pair){
    var kind=pair[0];h+='<section class="boda-config-section"><div class="boda-stat-t">'+pair[1]+'</div>';
    BODA_CONFIG[kind].forEach(function(x){var id=x.id||x.k;
      h+='<div class="boda-catalog-row"><span><b>'+escHtml(x.name||x.n||x.minutes+' min')+'</b><small>'+escHtml(kind==='packs'?x.classes+' clases':kind==='places'?x.d:(id===BODA_CONFIG.defaultDurationId?'Predeterminada':''))+'</small></span>';
      h+='<button class="boda-mini-btn action-edit" data-cfg-edit="'+kind+'" data-id="'+id+'" aria-label="Editar '+escHtml(x.name||x.n||x.minutes+' min')+'">&#9998;</button>';
      h+='<label><input type="checkbox" data-cfg-active="'+kind+'" data-id="'+id+'"'+(x.active!==false?' checked':'')+'> Activo</label>';
      if(kind==='durations'&&x.active!==false)h+='<label><input type="radio" name="bodaDefaultDuration" data-default="'+id+'"'+(id===BODA_CONFIG.defaultDurationId?' checked':'')+'> Por defecto</label>';
      if(!bodaConfigUsed(kind,id)&&!(kind==='durations'&&id===BODA_CONFIG.defaultDurationId))h+='<button class="ev-io-btn io-peligro" data-cfg-delete="'+kind+'" data-id="'+id+'">Eliminar</button>';
      h+='</div>';
    });h+='<button class="ev-io-btn io-primaria" data-cfg-add="'+kind+'">+ Añadir '+({packs:'pack',durations:'duración',places:'sala'})[kind]+'</button></section>';
  });
  h+='<p class="boda-stat-note">Desactivar oculta opciones para nuevas asignaciones y conserva las existentes. Cambiar un pack o duración no modifica las clases ya guardadas ni el número contratado por las parejas anteriores.</p></div>';
  return h;
}
function openBodaConfig(){BODA_SUBTAB='config';refreshEvents();}
function bindBodaConfig(){
  var wrap=document.getElementById('bodaConfigContent');if(!wrap)return;
  wrap.querySelectorAll('[data-cfg-edit],[data-cfg-add]').forEach(function(b){b.onclick=function(){openBodaCatalogForm(b.dataset.cfgEdit||b.dataset.cfgAdd,b.dataset.id);};});
  wrap.querySelectorAll('[data-cfg-active]').forEach(function(b){b.onchange=function(){try{bodaSetCatalogItem(b.dataset.cfgActive,b.dataset.id,{active:b.checked});}catch(e){showToast(e.message,'error');}openBodaConfig();};});
  wrap.querySelectorAll('[data-default]').forEach(function(b){b.onchange=function(){BODA_CONFIG.defaultDurationId=b.dataset.default;saveBodaConfig();openBodaConfig();};});
  wrap.querySelectorAll('[data-cfg-delete]').forEach(function(b){b.onclick=function(){if(!confirm('¿Eliminar esta opción sin referencias?'))return;try{bodaDeleteCatalogItem(b.dataset.cfgDelete,b.dataset.id);}catch(e){showToast(e.message,'error');}openBodaConfig();};});
}

function openBodaCatalogForm(kind,id){
  var item=BODA_CONFIG[kind].find(function(x){return (x.id||x.k)===id;})||{};
  var h='<div class="ev-form-overlay" id="bodaCatalogOv"><div class="ev-form-sheet"><h3>'+(id?'Editar':'Añadir')+' '+({packs:'pack',durations:'duracion',places:'sala'})[kind]+'</h3>';
  if(kind!=='durations')h+='<label class="ev-field">Nombre<input class="ev-input" id="bodaCatalogName" maxlength="60" value="'+escHtml(item.name||item.n||'')+'"></label>';
  if(kind==='places')h+='<label class="ev-field">Descripción<input class="ev-input" id="bodaCatalogDesc" maxlength="150" value="'+escHtml(item.d||'')+'"></label>';
  else h+='<label class="ev-field">'+(kind==='packs'?'Clases incluidas':'Minutos')+'<input class="ev-input" id="bodaCatalogNumber" type="number" min="1" max="'+(kind==='packs'?100:480)+'" value="'+(kind==='packs'?(item.classes||4):(item.minutes||60))+'"></label>';
  h+='<div class="ev-form-actions"><button class="ev-btn" id="bodaCatalogCancel">Cancelar</button><button class="ev-btn primary" id="bodaCatalogSave">Guardar</button></div></div></div>';
  var w=abrirPanel('bodaCatalogWrap',h,{overlay:'bodaCatalogOv',alCerrar:function(){cerrarPanel('bodaCatalogWrap','bodaCatalogOv');}});
  w.querySelector('#bodaCatalogCancel').onclick=function(){cerrarPanel('bodaCatalogWrap','bodaCatalogOv');};
  w.querySelector('#bodaCatalogSave').onclick=function(){
    var n=w.querySelector('#bodaCatalogNumber'),name=w.querySelector('#bodaCatalogName');
    if(name&&!name.value.trim()){showToast('Introduce un nombre','error');return;}
    if(n&&(!n.reportValidity()||!Number.isInteger(+n.value)||+n.value<1))return;
    var data=kind==='places'?{n:name.value.trim(),d:w.querySelector('#bodaCatalogDesc').value.trim()}:kind==='packs'?{name:name.value.trim(),classes:+n.value}:{minutes:+n.value};
    try{if(id)bodaSetCatalogItem(kind,id,data);else{data[kind==='places'?'k':'id']='cfg-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);data.active=true;BODA_CONFIG[kind].push(data);saveBodaConfig();}
      cerrarPanel('bodaCatalogWrap','bodaCatalogOv');openBodaConfig();
    }catch(e){showToast(e.message,'error');}
  };
}
bodaLoadConfig();
