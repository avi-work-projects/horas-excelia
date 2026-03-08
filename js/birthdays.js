/* ============================================================
   BIRTHDAYS — Calendario de cumpleaños
   ============================================================ */

var BDAY_STORAGE_KEY='excelia-bdays-v1';
var BDAY_YEAR=new Date().getFullYear(), BDAY_MONTH=new Date().getMonth(), BDAY_VIEW='upcoming';
var BDAY_EDIT=null;

// Paleta de 10 colores rotativos
var BDAY_PALETTE=['#6c8cff','#34d399','#fb923c','#ff6b6b','#c084fc','#fbbf24','#38bdf8','#f472b6','#a3e635','#fb7185'];

// BDAYS puede venir de: 1) localStorage (importado), 2) secreto GitHub
// BDAYS_FROM_SECRET se define en index.html (inline config)
var BDAYS=(function(){
  try{
    var stored=localStorage.getItem(BDAY_STORAGE_KEY);
    if(stored){var arr=JSON.parse(stored);if(Array.isArray(arr)&&arr.length)return arr;}
  }catch(e){}
  return (typeof BDAYS_FROM_SECRET!=='undefined')?BDAYS_FROM_SECRET:[];
})();

// Title case para mostrar nombres
function tc(s){return s.replace(/\S+/g,function(w){return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase();});}
function bdName(n){return escHtml(tc(n));}

function getBdayColor(b){
  var idx=BDAYS.indexOf(b);
  if(idx===-1){
    // hash del nombre para consistencia
    var h=0;for(var i=0;i<b.name.length;i++)h=(h*31+b.name.charCodeAt(i))&0x7fffffff;
    idx=h;
  }
  return BDAY_PALETTE[idx%BDAY_PALETTE.length];
}

function shortName(name){
  var first=name.split(' ')[0];
  return first.length>10?first.substring(0,9)+'\u2026':first;
}

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

/* ── Próximos cumpleaños ──────────────────────────────────── */
function renderBdayUpcoming(){
  if(!BDAYS.length)return '<div class="sy-note">No hay cumplea\u00f1os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub.</div>';

  var today=new Date();today.setHours(0,0,0,0);
  var dow=today.getDay(),off=dow===0?-6:1-dow;
  var weekStart=new Date(today);weekStart.setDate(weekStart.getDate()+off);
  var prevWeekStart=new Date(weekStart);prevWeekStart.setDate(prevWeekStart.getDate()-7);
  var nextWeekStart=new Date(weekStart);nextWeekStart.setDate(nextWeekStart.getDate()+7);

  function getBdaysInRange(start,days){
    var items=[];
    for(var i=0;i<days;i++){
      var d=new Date(start);d.setDate(d.getDate()+i);
      var bds=getBdaysOn(d.getMonth()+1,d.getDate());
      var diff=Math.round((d-today)/86400000);
      bds.forEach(function(b){items.push({b:b,diff:diff});});
    }
    return items;
  }

  var prevItems=getBdaysInRange(prevWeekStart,7);
  var curItems=getBdaysInRange(weekStart,7);
  var nxtItems=getBdaysInRange(nextWeekStart,7);

  function bdayLabel(diff){
    if(diff===0)return '\u00a1Hoy!';
    if(diff===1)return 'Ma\u00f1ana';
    if(diff>1)return 'en '+diff+'\u202fd\u00edas';
    if(diff===-1)return 'Ayer';
    if(diff===-2)return 'Antes de ayer';
    return 'Hace '+Math.abs(diff)+'\u202fd\u00edas';
  }

  function renderGroup(title,list){
    if(!list.length)return '<div class="sy-note">No hay cumplea\u00f1os '+title.toLowerCase()+'.</div>';
    var s='<div class="bday-month-hdr">'+title+'</div>';
    list.forEach(function(x){
      var lbl=bdayLabel(x.diff);
      var color=getBdayColor(x.b);
      var isT=x.diff===0;
      var isPastDay=x.diff<0;
      var isNearDay=x.diff>0&&x.diff<=3;
      var lblCls='bday-upcoming-lbl'+(isT?' today-lbl':isPastDay?' past-lbl':isNearDay?' near':'');
      s+='<div class="bday-upcoming-item'+(isT?' bday-today-item':'')+'" data-bday-name="'+escHtml(x.b.name)+'" data-bday-day="'+x.b.day+'" data-bday-month="'+x.b.month+'">';
      s+='<div class="bday-upcoming-icon" style="background:'+color+'22;border-color:'+color+'">\ud83c\udf82</div>';
      s+='<div class="bday-upcoming-info">';
      s+='<div class="bday-upcoming-name" style="color:'+color+'">'+bdName(x.b.name)+'</div>';
      s+='<div class="bday-upcoming-date">'+x.b.day+' de '+MN[x.b.month-1]+'</div>';
      s+='</div>';
      s+='<div class="'+lblCls+'">'+lbl+'</div>';
      s+='</div>';
    });
    return s;
  }

  var h='';
  if(prevItems.length){
    h+='<div class="bday-upcoming-section">';
    h+=renderGroup('Semana anterior',prevItems);
    h+='</div><div style="margin-top:8px">';
  } else {
    h+='<div>';
  }
  h+=renderGroup('Esta semana',curItems);
  h+='</div><div class="bday-upcoming-section" style="margin-top:8px">';
  h+=renderGroup('La pr\u00f3xima semana',nxtItems);
  h+='</div>';
  return h;
}

/* ── Calendario mensual ───────────────────────────────────── */
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
      var past=inM&&d<today;
      var bds=getBdaysOn(d.getMonth()+1,d.getDate());
      var bdow=d.getDay();
      var cls='bday-cell'+(inM?'':' out-m')+(isTod?' today-bday':'')+(past?' past-cal-day':'')+(bdow===0||bdow===6?' weekend':'');
      h+='<div class="'+cls+'">';
      h+='<div class="bday-num">'+d.getDate()+'</div>';
      bds.forEach(function(b){
        var color=getBdayColor(b);
        var sn=shortName(tc(b.name));
        h+='<div class="bday-badge" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'" style="background:'+color+'22;color:'+color+';border-left-color:'+color+'" title="'+bdName(b.name)+'">'+escHtml(sn)+'</div>';
      });
      h+='</div>';
      cur.setDate(cur.getDate()+1);
    }
    h+='</div>';
  }
  return h;
}

/* ── Lista por meses ──────────────────────────────────────── */
function renderBdayList(){
  if(!BDAYS.length)return '<div class="sy-note">No hay cumplea\u00f1os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub.</div>';
  var byM=[];for(var m=0;m<12;m++)byM.push([]);
  BDAYS.forEach(function(b){if(b.month>=1&&b.month<=12)byM[b.month-1].push(b);});
  var h='';
  byM.forEach(function(list,m){
    if(!list.length)return;
    list.sort(function(a,b){return a.day-b.day;});
    h+='<div class="sy-section"><div class="bday-month-hdr">'+MN[m]+'</div>';
    list.forEach(function(b){
      var dl=daysUntil(b.month,b.day);
      var lbl=dl===0?'\u00a1Hoy!':dl===1?'Ma\u00f1ana':'en '+dl+'d';
      var cls='bday-list-left'+(dl===0?' today-lbl':dl<=7?' near':'');
      var color=getBdayColor(b);
      h+='<div class="bday-list-item" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'">';
      h+='<span class="bday-list-day" style="color:'+color+'">'+b.day+'</span>';
      h+='<span class="bday-list-name">'+bdName(b.name)+'</span>';
      h+='<span class="'+cls+'">'+lbl+'</span>';
      h+='</div>';
    });
    h+='</div>';
  });
  return h;
}

/* ── Contenido principal ──────────────────────────────────── */
function renderBdayContent(){
  var isUpcoming=BDAY_VIEW==='upcoming';
  var h='<div class="sy-header">';
  h+='<button class="sy-back" id="bdBack">&#8592;</button>';
  if(!isUpcoming){
    h+='<div class="sy-year-nav"><button class="sy-nav" id="bdPrev">&#9664;</button>';
    h+='<div class="sy-year">'+MN[BDAY_MONTH]+' '+BDAY_YEAR+'</div>';
    h+='<button class="sy-nav" id="bdNext">&#9654;</button></div>';
    h+='<button class="sy-nav-icon" id="bdToEvents" title="Ir a Eventos">&#128197;</button>';
    h+='<button class="today-btn" id="bdToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  } else {
    h+='<div style="flex:1;text-align:center;font-size:.9rem;font-weight:600">Pr\u00f3ximos cumplea\u00f1os</div>';
    h+='<button class="sy-nav-icon" id="bdToEvents" title="Ir a Eventos">&#128197;</button>';
    h+='<button class="bday-add-btn" id="bdAdd">+ A\u00f1adir</button>';
  }
  h+='</div>';
  h+=renderNavBar('bday');
  h+='<div class="bday-hdr-sub">';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='upcoming'?' active':'')+'" id="bdViewUpcoming">Pr\u00f3ximos</button>';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='cal'?' active':'')+'" id="bdViewCal">Calendario</button>';
  h+='<button class="bday-view-toggle'+(BDAY_VIEW==='list'?' active':'')+'" id="bdViewList">Por meses</button>';
  h+='</div>';
  h+='<div class="sy-body">';
  if(BDAY_VIEW==='upcoming'){
    h+=renderBdayUpcoming();
  } else if(BDAY_VIEW==='cal'){
    if(!BDAYS.length)h+='<div class="sy-note">No hay cumplea\u00f1os cargados.</div>';
    else h+=renderBdayCalMonth();
  } else {
    h+=renderBdayList();
  }
  // Botón añadir (en vistas cal/list)
  if(!isUpcoming){
    h+='<button class="bday-io-btn" id="bdAdd" style="margin-top:0">+ A\u00f1adir cumplea\u00f1os</button>';
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

/* ── Detail panel ─────────────────────────────────────────── */
function renderBdayDetail(b){
  var dl=daysUntil(b.month,b.day);
  var lbl=dl===0?'\u00a1Hoy es su cumplea\u00f1os!':dl===1?'Ma\u00f1ana cumple a\u00f1os':'Faltan '+dl+' d\u00edas';
  var color=getBdayColor(b);
  var h='<div class="bd-detail-overlay" id="bdDetailOv"><div class="bd-detail-sheet">';
  h+='<div class="bd-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="bdDClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">Cumplea\u00f1os</div>';
  h+='<button class="ev-list-btn" id="bdDEdit" style="font-size:.8rem;padding:6px 12px">&#9998; Editar</button>';
  h+='</div>';
  h+='<div class="bd-detail-color-bar" style="background:'+color+'"></div>';
  h+='<div class="bd-detail-name">'+bdName(b.name)+'</div>';
  h+='<div class="bd-detail-date">'+b.day+' de '+MN[b.month-1]+'</div>';
  h+='<div class="bd-detail-lbl" style="background:'+color+'22;color:'+color+'">'+lbl+'</div>';
  h+='</div></div>';
  return h;
}

/* ── Form panel (añadir/editar cumpleaños) ─────────────────── */
function renderBdayForm(b){
  var isEdit=!!b;
  var name=isEdit?b.name:'';
  var day=isEdit?b.day:'';
  var month=isEdit?b.month:1;
  var h='<div class="bd-form-overlay" id="bdFormOv"><div class="bd-form-sheet">';
  h+='<div class="bd-form-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="bdFClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar cumplea\u00f1os':'Nuevo cumplea\u00f1os')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="bdFDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:60px"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Nombre</label>';
  h+='<input class="ev-input" id="bdFName" type="text" maxlength="60" placeholder="Nombre completo" value="'+escHtml(name)+'"></div>';
  h+='<div class="ev-field ev-date-row">';
  h+='<div><label>D\u00eda</label><input class="ev-input" id="bdFDay" type="number" min="1" max="31" placeholder="1-31" value="'+escHtml(String(day))+'"></div>';
  h+='<div><label>Mes</label><select class="ev-input" id="bdFMonth">';
  MN.forEach(function(mn,i){h+='<option value="'+(i+1)+'"'+(month===(i+1)?' selected':'')+'>'+mn+'</option>';});
  h+='</select></div>';
  h+='</div>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="bdFSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}

/* ── Abrir/cerrar detail ──────────────────────────────────── */
function openBdayDetail(b){
  var ov=document.getElementById('bdayOverlay');
  var wrap=document.createElement('div');wrap.id='bdDWrap';
  wrap.innerHTML=renderBdayDetail(b);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bdDetailOv');
    if(fo)fo.classList.add('open');
  });
  document.getElementById('bdDClose').addEventListener('click',closeBdayDetail);
  document.getElementById('bdDEdit').addEventListener('click',function(){
    closeBdayDetail();setTimeout(function(){openBdayForm(b);},300);
  });
}

function closeBdayDetail(){
  var fo=document.getElementById('bdDetailOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bdDWrap');if(w)w.remove();},300);
}

/* ── Abrir/cerrar form ────────────────────────────────────── */
function openBdayForm(b){
  BDAY_EDIT=b||null;
  var ov=document.getElementById('bdayOverlay');
  var wrap=document.createElement('div');wrap.id='bdFWrap';
  wrap.innerHTML=renderBdayForm(b);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bdFormOv');
    if(fo)fo.classList.add('open');
    var inp=document.getElementById('bdFName');
    if(inp)setTimeout(function(){inp.focus();},100);
  });
  bindBdayFormEvents();
}

function closeBdayForm(){
  var fo=document.getElementById('bdFormOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bdFWrap');if(w)w.remove();BDAY_EDIT=null;},300);
}

function bindBdayFormEvents(){
  document.getElementById('bdFClose').addEventListener('click',closeBdayForm);
  var delBtn=document.getElementById('bdFDel');
  if(delBtn){
    delBtn.addEventListener('click',function(){
      if(!BDAY_EDIT)return;
      BDAYS=BDAYS.filter(function(x){return!(x.name===BDAY_EDIT.name&&x.day===BDAY_EDIT.day&&x.month===BDAY_EDIT.month);});
      localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
      showToast('Cumplea\u00f1os eliminado','success');
      updateBdayBtn();closeBdayForm();setTimeout(refreshBday,320);
    });
  }
  document.getElementById('bdFSave').addEventListener('click',function(){
    var name=document.getElementById('bdFName').value.trim();
    var day=parseInt(document.getElementById('bdFDay').value,10);
    var month=parseInt(document.getElementById('bdFMonth').value,10);
    if(!name){showToast('El nombre es obligatorio','error');return;}
    if(!day||day<1||day>31){showToast('D\u00eda inv\u00e1lido (1-31)','error');return;}
    if(BDAY_EDIT){
      var idx=-1;
      for(var i=0;i<BDAYS.length;i++){
        if(BDAYS[i].name===BDAY_EDIT.name&&BDAYS[i].day===BDAY_EDIT.day&&BDAYS[i].month===BDAY_EDIT.month){idx=i;break;}
      }
      if(idx!==-1)BDAYS[idx]={name:name,day:day,month:month};
      showToast('Cumplea\u00f1os actualizado','success');
    } else {
      BDAYS.push({name:name,day:day,month:month});
      showToast('Cumplea\u00f1os a\u00f1adido','success');
    }
    localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
    updateBdayBtn();closeBdayForm();setTimeout(refreshBday,320);
  });
}

/* ── Apertura/cierre ventana ──────────────────────────────── */
function openBday(){
  var now=new Date();BDAY_YEAR=now.getFullYear();BDAY_MONTH=now.getMonth();BDAY_VIEW='upcoming';
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
  bindNavBar('bday',closeBday);
  var prevBtn=document.getElementById('bdPrev');
  if(prevBtn)prevBtn.addEventListener('click',function(){
    BDAY_MONTH--;if(BDAY_MONTH<0){BDAY_MONTH=11;BDAY_YEAR--;}refreshBday();
  });
  var nextBtn=document.getElementById('bdNext');
  if(nextBtn)nextBtn.addEventListener('click',function(){
    BDAY_MONTH++;if(BDAY_MONTH>11){BDAY_MONTH=0;BDAY_YEAR++;}refreshBday();
  });
  var todayBtn=document.getElementById('bdToday');
  if(todayBtn)todayBtn.addEventListener('click',function(){
    var n=new Date();BDAY_YEAR=n.getFullYear();BDAY_MONTH=n.getMonth();refreshBday();
  });
  document.getElementById('bdViewUpcoming').addEventListener('click',function(){BDAY_VIEW='upcoming';refreshBday();});
  document.getElementById('bdViewCal').addEventListener('click',function(){BDAY_VIEW='cal';refreshBday();});
  document.getElementById('bdViewList').addEventListener('click',function(){BDAY_VIEW='list';refreshBday();});
  document.getElementById('bdToEvents').addEventListener('click',function(){closeBday();setTimeout(openEvents,330);});
  // Añadir
  var addBtn=document.getElementById('bdAdd');
  if(addBtn)addBtn.addEventListener('click',function(){openBdayForm(null);});
  // Clicks en badges del calendario
  document.querySelectorAll('.bday-badge[data-bday-name]').forEach(function(badge){
    badge.addEventListener('click',function(e){
      e.stopPropagation();
      var name=badge.dataset.bdayName;
      var day=parseInt(badge.dataset.bdayDay,10);
      var month=parseInt(badge.dataset.bdayMonth,10);
      var b=null;
      for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
      if(!b)b={name:name,day:day,month:month};
      openBdayDetail(b);
    });
  });
  // Clicks en lista por meses
  document.querySelectorAll('.bday-list-item[data-bday-name]').forEach(function(item){
    item.addEventListener('click',function(){
      var name=item.dataset.bdayName;
      var day=parseInt(item.dataset.bdayDay,10);
      var month=parseInt(item.dataset.bdayMonth,10);
      var b=null;
      for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
      if(!b)b={name:name,day:day,month:month};
      openBdayDetail(b);
    });
  });
  // Clicks en vista "Próximos"
  document.querySelectorAll('.bday-upcoming-item[data-bday-name]').forEach(function(item){
    item.addEventListener('click',function(){
      var name=item.dataset.bdayName;
      var day=parseInt(item.dataset.bdayDay,10);
      var month=parseInt(item.dataset.bdayMonth,10);
      var b=null;
      for(var i=0;i<BDAYS.length;i++){if(BDAYS[i].name===name&&BDAYS[i].day===day&&BDAYS[i].month===month){b=BDAYS[i];break;}}
      if(!b)b={name:name,day:day,month:month};
      openBdayDetail(b);
    });
  });
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
