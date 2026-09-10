/* Persistencia observable y transacciones de importacion. */
var STORAGE_ERROR=null;
var appStorage=(function(native){
  var pending=null;
  function fail(e){STORAGE_ERROR='No se han podido guardar los cambios. Exporta una copia y revisa el espacio disponible.';setTimeout(function(){if(typeof showToast==='function')showToast(STORAGE_ERROR||'No se guardaron los cambios','error');},0);throw e;}
  return {
    getItem:function(k){return pending&&Object.prototype.hasOwnProperty.call(pending,k)?pending[k]:native.getItem(k);},
    setItem:function(k,v){if(pending){pending[k]=String(v);return;}try{native.setItem(k,v);}catch(e){fail(e);}},
    removeItem:function(k){if(pending){pending[k]=null;return;}try{native.removeItem(k);}catch(e){fail(e);}},
    key:function(i){return native.key(i);},
    get length(){return native.length;},
    begin:function(){if(pending)throw new Error('Importacion ya en curso');pending=Object.create(null);},
    cancel:function(){pending=null;},
    commit:function(){
      var changes=pending;pending=null;var before={},written=[];
      try{Object.keys(changes).forEach(function(k){before[k]=native.getItem(k);written.push(k);if(changes[k]===null)native.removeItem(k);else native.setItem(k,changes[k]);});}
      catch(e){written.reverse().forEach(function(k){try{if(before[k]===null)native.removeItem(k);else native.setItem(k,before[k]);}catch(ignored){}});fail(e);}
    }
  };
})(localStorage);
function validIsoDate(s){
  if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  var d=new Date(s+'T12:00:00');return !isNaN(d)&&d.getFullYear()===+s.slice(0,4)&&d.getMonth()+1===+s.slice(5,7)&&d.getDate()===+s.slice(8,10);
}
function validateImport(data){
  if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Formato de backup incorrecto');
  function visit(v,key){
    if(v===null)return;
    if(typeof v==='object'){Object.keys(v).forEach(function(k){if(k==='__proto__'||k==='constructor'||k==='prototype')throw new Error('Clave no permitida');visit(v[k],k);});return;}
    if(typeof v==='string'&&(/(^id$|Id$|^color$)/.test(key))&&/[<>"'&]/.test(v))throw new Error('Identificador o color no valido');
    if(key==='color'&&typeof v==='string'&&!/^#[0-9a-f]{3,8}$/i.test(v))throw new Error('Color no valido');
  }
  visit(data,'');
  ['days','sent','monthH','bodasClosed','evAlarms','bdayAlarms','econYearConfig','gastosPerYear','personalPerYear'].forEach(function(k){if(data[k]!=null&&(typeof data[k]!=='object'||Array.isArray(data[k])))throw new Error('Mapa no valido: '+k);});
  ['rate','vacEntitlement','alarmHour','alarmMinute'].forEach(function(k){if(data[k]!=null&&(!Number.isFinite(Number(data[k]))||Number(data[k])<0))throw new Error('Numero no valido: '+k);});
  ['events','birthdays','bodas','rutinas','alarms','gastos','ingresos','compras','desgrav','scenarios'].forEach(function(k){
    if(data[k]!=null&&(!Array.isArray(data[k])||data[k].some(function(x){return !x||typeof x!=='object'||Array.isArray(x);})))throw new Error('Lista no valida: '+k);
  });
  (data.events||[]).forEach(function(e){if(!validIsoDate(e.start)||(e.end&&(!validIsoDate(e.end)||e.end<e.start)))throw new Error('Fechas de evento no validas');if(e.dates&&(!Array.isArray(e.dates)||e.dates.some(function(d){return !validIsoDate(d);})))throw new Error('Seleccion de dias no valida');});
  (data.birthdays||[]).forEach(function(b){if(!validBirthday(b.day,b.month))throw new Error('Fecha de cumpleanos no valida');});
  (data.rutinas||[]).forEach(function(r){if(!Array.isArray(r.weekDays)||r.weekDays.some(function(n){return !Number.isInteger(n)||n<0||n>6;}))throw new Error('Dias de rutina no validos');});
  return JSON.parse(JSON.stringify(data));
}
function validBirthday(day,month){return Number.isInteger(day)&&Number.isInteger(month)&&month>=1&&month<=12&&day>=1&&day<=new Date(2000,month,0).getDate();}
function prepareImportRelations(data,merge){
  var map=Object.create(null),existing=merge?BODA_COUPLES:[];
  (data.bodas||[]).forEach(function(c){var local=existing.find(function(x){return x.id===c.id||String(x.name).trim().toLowerCase()===String(c.name).trim().toLowerCase();});if(local&&local.id!==c.id){map[c.id]=local.id;c.id=local.id;}});
  (data.events||[]).forEach(function(e){if(e.boda&&map[e.boda.coupleId])e.boda.coupleId=map[e.boda.coupleId];});
  return data;
}

var MAIL_CFG_SK='excelia-mail-config-v1';
function loadMailConfig(){
  try{var m=JSON.parse(appStorage.getItem(MAIL_CFG_SK)||'{}');TO=m.to||'';CC=m.cc||[];AUTHOR_NAME=m.name||'';}catch(e){}
}
function saveMailConfig(){appStorage.setItem(MAIL_CFG_SK,JSON.stringify({to:TO,cc:CC,name:AUTHOR_NAME}));}
loadMailConfig();

function birthdayValidation(b,previous){
  if(!validBirthday(b.day,b.month))return 'Fecha de cumpleanos no valida';
  if(b.vip&&BDAYS.filter(function(x){return x!==previous&&x.vip&&x.day===b.day&&x.month===b.month;}).length>=3)return 'Maximo 3 cumpleanos VIP el mismo dia';
  return null;
}
function rutLimitExceeded(candidate,excludeId){
  var bounds=[candidate.start||evDk(new Date())],seen=Object.create(null);
  RUTINAS.concat([candidate]).forEach(function(r){
    if(r.start)bounds.push(r.start);
    if(r.suspend){if(r.suspend.from)bounds.push(r.suspend.from);if(r.suspend.to)bounds.push(r.suspend.to);}
    Object.keys(r.weeks||{}).concat(Object.keys(r.skips||{})).forEach(function(d){bounds.push(d);});
  });
  var today=evDk(new Date());bounds.push(today);
  for(var i=0;i<bounds.length;i++){
    var d=new Date(bounds[i]+'T12:00:00');
    for(var j=0;j<15;j++,d.setDate(d.getDate()+1)){
      var ds=evDk(d);if(ds<today||seen[ds])continue;seen[ds]=true;
      if(rutOccursOn(candidate,ds)&&!rutIsSkipped(candidate,ds)&&rutDayCount(ds,excludeId)>=3)return ds;
    }
  }
  return null;
}

/* Rescata configuracion de la version ya instalada sin publicarla de nuevo. */
async function migrateLegacyDefaults(){
  if(typeof caches==='undefined')return;
  var keys=await caches.keys();
  for(var i=keys.length-1;i>=0;i--){
    if(keys[i].indexOf('horas-excelia-')!==0)continue;
    var cache=await caches.open(keys[i]),requests=await cache.keys();
    var request=requests.find(function(r){return /\/index\.html$/.test(new URL(r.url).pathname);});
    if(!request)continue;
    var response=await cache.match(request),html=await response.text();
    function legacy(name){var m=html.match(new RegExp("var "+name+"='([^']*)'"));return m&&m[1].indexOf('{{')<0?m[1]:'';}
    if(!appStorage.getItem(MAIL_CFG_SK)&&legacy('TO')){
      TO=legacy('TO');CC=legacy('CC').split(',').filter(Boolean);AUTHOR_NAME=legacy('AUTHOR_NAME');saveMailConfig();
      [['mailToLocal',TO],['mailCcLocal',CC.join(', ')],['mailNameLocal',AUTHOR_NAME]].forEach(function(pair){var el=document.getElementById(pair[0]);if(el)el.value=pair[1];});
    }
    if(!appStorage.getItem('excelia-bdays-v1')&&legacy('BDAYS_RAW')){
      try{var raw=Uint8Array.from(atob(legacy('BDAYS_RAW')),function(c){return c.charCodeAt(0);});var birthdays=JSON.parse(new TextDecoder().decode(raw));validateImport({birthdays:birthdays});BDAYS=birthdays;appStorage.setItem('excelia-bdays-v1',JSON.stringify(BDAYS));syncVipBdaysToEvents();updateBdayBtn();}catch(e){}
    }
  }
}
if(typeof window.addEventListener==='function')window.addEventListener('load',function(){migrateLegacyDefaults().catch(function(){});});
