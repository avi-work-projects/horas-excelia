/* ============================================================
   BIRTHDAYS — Calendario de cumpleaños
   ============================================================ */

var BDAY_STORAGE_KEY='excelia-bdays-v1';
var BDAY_YEAR=new Date().getFullYear(), BDAY_MONTH=new Date().getMonth(), BDAY_VIEW='cal';

// BDAYS puede venir de: 1) localStorage (importado), 2) secreto GitHub
// BDAYS_FROM_SECRET se define en index.html (inline config)
var BDAYS=(function(){
  try{
    var stored=localStorage.getItem(BDAY_STORAGE_KEY);
    if(stored){var arr=JSON.parse(stored);if(Array.isArray(arr)&&arr.length)return arr;}
  }catch(e){}
  return (typeof BDAYS_FROM_SECRET!=='undefined')?BDAYS_FROM_SECRET:[];
})();

function getBdaysOn(m1,d){return BDAYS.filter(function(b){return b.month===m1&&b.day===d;});}

function daysUntil(m1,d){
  var today=new Date();today.setHours(0,0,0,0);
  var bd=new Date(today.getFullYear(),m1-1,d);
  if(bd<today)bd.setFullYear(today.getFullYear()+1);
  return Math.round((bd-today)/86400000);
}

function hasUpcomingBday(){
  var t=new Date();t.setHours(0,0,0,0);
  for(var i=0;i<7;i++){var d=new Date(t);d.setDate(d.getDate()+i);if(getBdaysOn(d.getMonth()+1,d.getDate()).length)return true;}
  return false;
}

function updateBdayBtn(){
  var btn=document.getElementById('bdayBtn');if(!btn)return;
  if(hasUpcomingBday()&&BDAYS.length)btn.classList.add('bday-active');
  else btn.classList.remove('bday-active');
}

function renderBdayCalMonth(){
  var today=new Date();today.setHours(0,0,0,0);
  var DN7=['L','M','X','J','V','S','D'];
  var h='<div class="bday-week-hdr">';
  DN7.forEach(function(n){h+='<div>'+n+'</div>';});
  h+='</div>';
  var first=new Date(BDAY_YEAR,BDAY_MONTH,1);
  var last=new Date(BDAY_YEAR,BDAY_MONTH+1,0);
  var cur=new Date(first);
  var dow=cur.getDay();var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    h+='<div class="bday-week-grid">';
    for(var i=0;i<7;i++){
      var d=new Date(cur);
      var inM=d.getMonth()===BDAY_MONTH;
      var isTod=d.getTime()===today.getTime();
      var bds=getBdaysOn(d.getMonth()+1,d.getDate());
      var cls='bday-cell'+(inM?'':' out-m')+(isTod?' today-bday':'');
      h+='<div class="'+cls+'"><div class="bday-num">'+d.getDate()+'</div>';
      bds.forEach(function(b){h+='<div class="bday-badge">'+b.name+'</div>';});
      h+='</div>';
      cur.setDate(cur.getDate()+1);
    }
    h+='</div>';
  }
  return h;
}

function renderBdayList(){
  if(!BDAYS.length)return '<div class="sy-note">No hay cumplea&#241;os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub.</div>';
  var byM=[];for(var m=0;m<12;m++)byM.push([]);
  BDAYS.forEach(function(b){if(b.month>=1&&b.month<=12)byM[b.month-1].push(b);});
  var h='';
  byM.forEach(function(list,m){
    if(!list.length)return;
    list.sort(function(a,b){return a.day-b.day;});
    h+='<div class="sy-section"><div class="bday-month-hdr">'+MN[m]+'</div>';
    list.forEach(function(b){
      var dl=daysUntil(b.month,b.day);
      var lbl=dl===0?'&#161;Hoy!':dl===1?'Ma&#241;ana':'en '+dl+'d';
      var cls='bday-list-left'+(dl===0?' today-lbl':dl<=7?' near':'');
      h+='<div class="bday-list-item">';
      h+='<span class="bday-list-day">'+b.day+'</span>';
      h+='<span class="bday-list-name">'+b.name+'</span>';
      h+='<span class="'+cls+'">'+lbl+'</span>';
      h+='</div>';
    });
    h+='</div>';
  });
  return h;
}

function renderBdayContent(){
  var h='<div class="sy-header">';
  h+='<button class="sy-back" id="bdBack">&#8592;</button>';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="bdPrev">&#9664;</button>';
  h+='<div class="sy-year">'+MN[BDAY_MONTH]+' '+BDAY_YEAR+'</div>';
  h+='<button class="sy-nav" id="bdNext">&#9654;</button></div>';
  h+='<button class="sy-nav-icon" id="bdToEvents" title="Ir a Eventos">&#128197;</button>';
  h+='<button class="today-btn" id="bdToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  h+='</div>';
  h+='<div class="bday-hdr-sub">';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='cal'?' active':'')+'" id="bdViewCal">Calendario</button>';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='list'?' active':'')+'" id="bdViewList">Por meses</button>';
  h+='</div>';
  h+='<div class="sy-body">';
  if(BDAY_VIEW==='cal'){
    if(!BDAYS.length)h+='<div class="sy-note">No hay cumplea&#241;os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub (formato: Nombre,d&#237;a,mes por l&#237;nea).</div>';
    else h+=renderBdayCalMonth();
  } else {
    h+=renderBdayList();
  }
  // Import/Export
  h+='<div class="bday-io-row">';
  h+='<button class="bday-io-btn" id="bdExport">&#8595; Exportar</button>';
  h+='<button class="bday-io-btn" id="bdImport">&#8593; Importar JSON</button>';
  h+='<input type="file" id="bdImportFile" accept=".json" style="display:none">';
  h+='</div>';
  h+='</div>';
  return h;
}

function openBday(){
  var now=new Date();BDAY_YEAR=now.getFullYear();BDAY_MONTH=now.getMonth();BDAY_VIEW='cal';
  var ov=document.getElementById('bdayOverlay');
  document.getElementById('bdayContent').innerHTML=renderBdayContent();
  ov.style.display='block';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindBdayEvents();});});
}

function closeBday(){
  var ov=document.getElementById('bdayOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

function refreshBday(){
  document.getElementById('bdayContent').innerHTML=renderBdayContent();
  bindBdayEvents();
}

function bindBdayEvents(){
  document.getElementById('bdBack').addEventListener('click',closeBday);
  document.getElementById('bdPrev').addEventListener('click',function(){
    BDAY_MONTH--;if(BDAY_MONTH<0){BDAY_MONTH=11;BDAY_YEAR--;}refreshBday();
  });
  document.getElementById('bdNext').addEventListener('click',function(){
    BDAY_MONTH++;if(BDAY_MONTH>11){BDAY_MONTH=0;BDAY_YEAR++;}refreshBday();
  });
  document.getElementById('bdToday').addEventListener('click',function(){
    var n=new Date();BDAY_YEAR=n.getFullYear();BDAY_MONTH=n.getMonth();refreshBday();
  });
  document.getElementById('bdViewCal').addEventListener('click',function(){BDAY_VIEW='cal';refreshBday();});
  document.getElementById('bdViewList').addEventListener('click',function(){BDAY_VIEW='list';refreshBday();});
  document.getElementById('bdToEvents').addEventListener('click',function(){closeBday();setTimeout(openEvents,330);});
  // Export
  document.getElementById('bdExport').addEventListener('click',function(){
    if(!BDAYS.length){showToast('No hay cumplea\u00f1os para exportar','error');return;}
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(BDAYS,null,2));
    a.download='cumpleanos.json'; a.click();
  });
  // Import
  document.getElementById('bdImport').addEventListener('click',function(){document.getElementById('bdImportFile').click();});
  document.getElementById('bdImportFile').addEventListener('change',function(ev){
    var f=ev.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(e){
      try{
        var arr=JSON.parse(e.target.result);
        if(!Array.isArray(arr))throw new Error('not array');
        BDAYS=arr;
        localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
        showToast('Cumplea\u00f1os importados: '+BDAYS.length,'success');
        updateBdayBtn(); refreshBday();
      }catch(err){showToast('Error al importar el archivo','error');}
    };
    r.readAsText(f);
  });
}
