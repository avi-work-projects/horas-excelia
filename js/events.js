/* ============================================================
   EVENTS — Ventana de eventos y notas
   ============================================================ */

var EV_STORAGE_KEY = 'excelia-events-v1';
var EV_YEAR = new Date().getFullYear();
var EV_MONTH = new Date().getMonth();
var EV_VIEW = 'cal';  // 'cal' | 'months'
var EV_EDIT = null;
var EV_COLORS = ['#6c8cff','#34d399','#fb923c','#ff6b6b','#c084fc','#fbbf24'];

var EVENTS = (function(){
  try{
    var stored=localStorage.getItem(EV_STORAGE_KEY);
    if(stored){var arr=JSON.parse(stored);if(Array.isArray(arr))return arr;}
  }catch(e){}
  return [];
})();

function saveEvents(){
  localStorage.setItem(EV_STORAGE_KEY,JSON.stringify(EVENTS));
}

function evDk(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

/* ── Lógica de repetición ────────────────────────────────── */
function eventOccursOn(ev,ds){
  var d=new Date(ds+'T00:00:00');
  var start=new Date(ev.start+'T00:00:00');
  var end=ev.end?new Date(ev.end+'T00:00:00'):new Date(start);
  var span=Math.round((end-start)/86400000);
  if(!ev.repeat)return d>=start&&d<=end;
  if(d<start)return false;
  var r=ev.repeat;
  if(r.type==='weekly'){
    for(var w=0;w<=span;w++){
      var oS=new Date(d);oS.setDate(oS.getDate()-w);
      if(oS>=start&&r.weekDays.indexOf(oS.getDay())!==-1)return true;
    }
    return false;
  }
  if(r.type==='monthly-date'){
    var oS=new Date(d.getFullYear(),d.getMonth(),start.getDate());
    if(isNaN(oS.getTime())||oS<start)return false;
    var oE=new Date(oS);oE.setDate(oE.getDate()+span);
    return d>=oS&&d<=oE;
  }
  if(r.type==='monthly-first'){
    var oS=new Date(d.getFullYear(),d.getMonth(),1);
    if(oS<start)return false;
    var oE=new Date(oS);oE.setDate(oE.getDate()+span);
    return d>=oS&&d<=oE;
  }
  if(r.type==='yearly'){
    var oS=new Date(d.getFullYear(),start.getMonth(),start.getDate());
    if(isNaN(oS.getTime())||oS<start)return false;
    var oE=new Date(oS);oE.setDate(oE.getDate()+span);
    return d>=oS&&d<=oE;
  }
  return false;
}

function getEventsOn(ds){
  return EVENTS.filter(function(ev){return eventOccursOn(ev,ds);});
}

function hasUpcomingEvent(){
  var t=new Date();t.setHours(0,0,0,0);
  for(var i=0;i<7;i++){
    var d=new Date(t);d.setDate(d.getDate()+i);
    if(getEventsOn(evDk(d)).length)return true;
  }
  return false;
}

function updateEventsBtn(){
  var btn=document.getElementById('eventsBtn');if(!btn)return;
  if(hasUpcomingEvent()&&EVENTS.length)btn.classList.add('events-active');
  else btn.classList.remove('events-active');
}

/* ── Render: calendario mensual ─────────────────────────── */
function renderEvCalMonth(){
  var today=new Date();today.setHours(0,0,0,0);
  var DN7=['L','M','X','J','V','S','D'];
  var h='<div class="ev-week-hdr">';
  DN7.forEach(function(n){h+='<div>'+n+'</div>';});
  h+='</div>';
  var first=new Date(EV_YEAR,EV_MONTH,1);
  var last=new Date(EV_YEAR,EV_MONTH+1,0);
  var cur=new Date(first);
  var dow=cur.getDay();var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    h+='<div class="ev-week-grid">';
    for(var i=0;i<7;i++){
      var d=new Date(cur);
      var inM=d.getMonth()===EV_MONTH;
      var isTod=d.getTime()===today.getTime();
      var past=inM&&d<today;
      var ds=evDk(d);
      var evs=getEventsOn(ds);
      var edow=d.getDay();
      var cls='ev-cell'+(inM?'':' out-m')+(isTod?' today-ev':'')+(past?' past-cal-day':'')+(edow===0||edow===6?' weekend':'');
      h+='<div class="'+cls+'" data-ds="'+ds+'">';
      h+='<div class="ev-num">'+d.getDate()+'</div>';
      evs.forEach(function(ev){
        h+='<div class="ev-badge" data-id="'+ev.id+'" style="color:'+ev.color+';border-left-color:'+ev.color+';background:'+ev.color+'22">'+escHtml(ev.title)+'</div>';
      });
      h+='</div>';
      cur.setDate(cur.getDate()+1);
    }
    h+='</div>';
  }
  return h;
}

/* ── Render: lista de eventos ───────────────────────────── */
function renderEvList(){
  if(!EVENTS.length)return '<div class="sy-note">No hay eventos. Pulsa "+ A\u00f1adir" para crear uno.</div>';
  var sorted=EVENTS.slice().sort(function(a,b){return a.start<b.start?-1:a.start>b.start?1:0;});
  var h='';
  sorted.forEach(function(ev){
    h+=renderEvListItem(ev);
  });
  return h;
}

/* ── Render: por meses ──────────────────────────────────── */
function renderEvByMonths(){
  if(!EVENTS.length)return '<div class="sy-note">No hay eventos. Pulsa "+ A\u00f1adir" para crear uno.</div>';
  var byM=[];for(var m=0;m<12;m++)byM.push([]);
  EVENTS.forEach(function(ev){
    var s=new Date(ev.start+'T00:00:00');
    byM[s.getMonth()].push(ev);
  });
  var h='';
  byM.forEach(function(list,m){
    if(!list.length)return;
    list.sort(function(a,b){return a.start<b.start?-1:1;});
    h+='<div class="sy-section"><div class="bday-month-hdr">'+MN[m]+'</div>';
    list.forEach(function(ev){h+=renderEvListItem(ev);});
    h+='</div>';
  });
  if(!h)h='<div class="sy-note">No hay eventos con fecha definida.</div>';
  return h;
}

function renderEvListItem(ev){
  var s=new Date(ev.start+'T00:00:00');
  var e2=ev.end&&ev.end!==ev.start?new Date(ev.end+'T00:00:00'):null;
  var fd2=function(dd){return String(dd.getDate()).padStart(2,'0')+'/'+String(dd.getMonth()+1).padStart(2,'0')+'/'+dd.getFullYear();};
  var dateStr=fd2(s);
  if(e2)dateStr+=' &#8212; '+fd2(e2);
  var repeatStr='';
  if(ev.repeat){
    var rt=ev.repeat.type;
    if(rt==='weekly'&&ev.repeat.weekDays){
      var wn2=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
      repeatStr=' \u00b7 '+ev.repeat.weekDays.map(function(w){return wn2[w];}).join(', ');
    }else if(rt==='monthly-date'){repeatStr=' \u00b7 Mensual (mismo d\u00eda)';}
    else if(rt==='monthly-first'){repeatStr=' \u00b7 Mensual (d\u00eda 1)';}
    else if(rt==='yearly'){repeatStr=' \u00b7 Anual';}
  }
  var h='<div class="ev-list-item" data-id="'+ev.id+'">';
  h+='<div class="ev-list-color" style="background:'+ev.color+'"></div>';
  h+='<div class="ev-list-body">';
  h+='<div class="ev-list-title">'+escHtml(ev.title)+'</div>';
  if(ev.note)h+='<div class="ev-list-note">'+escHtml(ev.note)+'</div>';
  h+='<div class="ev-list-meta">'+dateStr+repeatStr+'</div>';
  h+='</div>';
  h+='<div class="ev-list-actions"><button class="ev-list-btn del" data-id="'+ev.id+'">&#215;</button></div>';
  h+='</div>';
  return h;
}

/* ── Render: contenido principal ────────────────────────── */
function renderEvContent(){
  var h='<div class="sy-header">';
  h+='<button class="sy-back" id="evBack">&#8592;</button>';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="evPrev">&#9664;</button>';
  h+='<div class="sy-year">'+MN[EV_MONTH]+' '+EV_YEAR+'</div>';
  h+='<button class="sy-nav" id="evNext">&#9654;</button></div>';
  h+='<button class="sy-nav-icon" id="evToBday" title="Cumplea\u00f1os">&#127874;</button>';
  h+='<button class="today-btn" id="evToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  h+='</div>';
  h+='<div class="ev-hdr-sub">';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='cal'?' active':'')+'" id="evViewCal">Calendario</button>';
  h+='<button class="ev-view-toggle'+(EV_VIEW==='months'?' active':'')+'" id="evViewMonths">Por meses</button>';
  h+='</div>';
  h+='<div class="sy-body">';
  if(EV_VIEW==='cal')h+=renderEvCalMonth();
  else h+=renderEvByMonths();
  h+='<div class="ev-io-row">';
  h+='<button class="ev-io-btn" id="evAdd">+ A\u00f1adir</button>';
  h+='<button class="ev-io-btn" id="evExport">&#8595; Exportar</button>';
  h+='<button class="ev-io-btn" id="evImport">&#8593; Importar</button>';
  h+='<input type="file" id="evImportFile" accept=".json" style="display:none">';
  h+='</div>';
  h+='</div>';
  return h;
}

/* ── Render: detalle de evento ──────────────────────────── */
function renderEvDetail(ev){
  var s=new Date(ev.start+'T00:00:00');
  var e2=ev.end&&ev.end!==ev.start?new Date(ev.end+'T00:00:00'):null;
  var fd2=function(dd){return String(dd.getDate()).padStart(2,'0')+'/'+String(dd.getMonth()+1).padStart(2,'0')+'/'+dd.getFullYear();};
  var dateStr=fd2(s);
  if(e2)dateStr+=' \u2014 '+fd2(e2);
  var repeatStr='';
  if(ev.repeat){
    var rt=ev.repeat.type;
    if(rt==='weekly'&&ev.repeat.weekDays){
      var wn2=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
      repeatStr='\ud83d\udd01 Semanal: '+ev.repeat.weekDays.map(function(w){return wn2[w];}).join(', ');
    }else if(rt==='monthly-date'){repeatStr='\ud83d\udd01 Mensual (mismo d\u00eda)';}
    else if(rt==='monthly-first'){repeatStr='\ud83d\udd01 Mensual (d\u00eda 1)';}
    else if(rt==='yearly'){repeatStr='\ud83d\udd01 Anual';}
  }
  var h='<div class="ev-detail-overlay" id="evDetailOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="evDClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">Evento</div>';
  h+='<button class="ev-list-btn" id="evDEdit" style="font-size:.8rem;padding:6px 12px;border-color:'+ev.color+';color:'+ev.color+'">&#9998; Editar</button>';
  h+='</div>';
  h+='<div class="ev-detail-color-bar" style="background:'+ev.color+'"></div>';
  h+='<div class="ev-detail-title" style="color:'+ev.color+'">'+escHtml(ev.title)+'</div>';
  h+='<div class="ev-detail-date">&#128197; '+dateStr+'</div>';
  if(repeatStr)h+='<div class="ev-detail-repeat">'+repeatStr+'</div>';
  if(ev.note)h+='<div class="ev-detail-note">'+escHtml(ev.note)+'</div>';
  h+='<div class="ev-detail-actions">';
  h+='<button class="ev-btn danger" id="evDDel">Eliminar</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

/* ── Apertura/cierre del detalle ────────────────────────── */
function openEvDetail(ev){
  var ov=document.getElementById('eventsOverlay');
  ov.scrollTop=0;
  var wrap=document.createElement('div');
  wrap.id='evDWrap';
  wrap.innerHTML=renderEvDetail(ev);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('evDetailOv');
    if(fo)fo.classList.add('open');
  });
  document.getElementById('evDClose').addEventListener('click',closeEvDetail);
  document.getElementById('evDEdit').addEventListener('click',function(){
    closeEvDetail();setTimeout(function(){openEvForm(ev);},300);
  });
  document.getElementById('evDDel').addEventListener('click',function(){
    var deleted=ev;
    var deletedIdx=-1;
    for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===deleted.id){deletedIdx=i;break;}}
    EVENTS=EVENTS.filter(function(e){return e.id!==deleted.id;});
    saveEvents();updateEventsBtn();
    closeEvDetail();
    setTimeout(function(){
      refreshEvents();
      showToast('Evento eliminado','success',function(){
        if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
        saveEvents();updateEventsBtn();refreshEvents();
      });
    },320);
  });
}

function closeEvDetail(){
  var fo=document.getElementById('evDetailOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('evDWrap');if(w)w.remove();},300);
}

/* ── Render: formulario de evento ───────────────────────── */
function renderEvForm(ev){
  var isEdit=!!ev;
  var title=isEdit?ev.title:'';
  var note=isEdit?(ev.note||''):'';
  var color=isEdit?ev.color:EV_COLORS[0];
  var today=evDk(new Date());
  var start=isEdit?ev.start:today;
  var end=isEdit?(ev.end||ev.start):today;
  var repeat=isEdit?ev.repeat:null;
  var repType=repeat?repeat.type:'none';
  var wdays=(repeat&&repeat.type==='weekly')?repeat.weekDays:[];
  var wdNames=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  var h='<div class="ev-form-overlay" id="evFormOv">';
  h+='<div class="ev-form-sheet">';
  h+='<div class="ev-form-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="evFClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar evento':'Nuevo evento')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="evFDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>T\u00edtulo</label>';
  h+='<input class="ev-input" id="evFTitle" type="text" maxlength="80" placeholder="Nombre del evento" value="'+escHtml(title)+'"></div>';
  h+='<div class="ev-field"><label>Nota <span id="evCharCnt" style="font-weight:400;color:var(--text-dim)">'+note.length+'/200</span></label>';
  h+='<textarea class="ev-textarea" id="evFNote" maxlength="200" placeholder="Notas opcionales...">'+escHtml(note)+'</textarea></div>';
  h+='<div class="ev-field"><label>Color</label><div class="ev-colors">';
  EV_COLORS.forEach(function(c){
    var sel=c===color?' selected':'';
    h+='<div class="ev-color-swatch'+sel+'" data-hex="'+c+'" style="background:'+c+'"></div>';
  });
  h+='</div></div>';
  h+='<div class="ev-field ev-date-row">';
  h+='<div><label>Inicio</label><input class="ev-input" id="evFStart" type="date" value="'+start+'"></div>';
  h+='<div><label>Fin</label><input class="ev-input" id="evFEnd" type="date" value="'+end+'"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Repetici\u00f3n</label>';
  h+='<select class="ev-input" id="evFRepeat">';
  h+='<option value="none"'+(repType==='none'?' selected':'')+'>Sin repetici\u00f3n</option>';
  h+='<option value="weekly"'+(repType==='weekly'?' selected':'')+'>Semanal</option>';
  h+='<option value="monthly-date"'+(repType==='monthly-date'?' selected':'')+'>Mensual (mismo d\u00eda)</option>';
  h+='<option value="monthly-first"'+(repType==='monthly-first'?' selected':'')+'>Mensual (d\u00eda 1)</option>';
  h+='<option value="yearly"'+(repType==='yearly'?' selected':'')+'>Anual</option>';
  h+='</select></div>';
  h+='<div class="ev-weekday-row" id="evWdRow" style="display:'+(repType==='weekly'?'flex':'none')+'">';
  for(var w=0;w<7;w++){
    var on2=wdays.indexOf(w)!==-1?' on':'';
    h+='<button class="ev-wd-btn'+on2+'" data-wd="'+w+'">'+wdNames[w]+'</button>';
  }
  h+='</div>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="evFSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}

/* ── Apertura/cierre del formulario ─────────────────────── */
function openEvForm(ev,prefillDate){
  EV_EDIT=ev||null;
  var ov=document.getElementById('eventsOverlay');
  ov.scrollTop=0;
  var wrap=document.createElement('div');
  wrap.id='evFWrap';
  wrap.innerHTML=renderEvForm(ev);
  ov.appendChild(wrap);
  if(prefillDate&&!ev){
    setTimeout(function(){
      var si=document.getElementById('evFStart');
      var ei=document.getElementById('evFEnd');
      if(si)si.value=prefillDate;
      if(ei)ei.value=prefillDate;
    },10);
  }
  requestAnimationFrame(function(){
    var fo=document.getElementById('evFormOv');
    if(fo)fo.classList.add('open');
  });
  bindEvFormEvents();
}

function closeEvForm(){
  var fo=document.getElementById('evFormOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){
    var w=document.getElementById('evFWrap');
    if(w)w.remove();
    EV_EDIT=null;
  },300);
}

function bindEvFormEvents(){
  document.getElementById('evFClose').addEventListener('click',closeEvForm);
  var noteEl=document.getElementById('evFNote');
  var cntEl=document.getElementById('evCharCnt');
  noteEl.addEventListener('input',function(){cntEl.textContent=noteEl.value.length+'/200';});
  document.querySelectorAll('.ev-color-swatch').forEach(function(sw){
    sw.addEventListener('click',function(){
      document.querySelectorAll('.ev-color-swatch').forEach(function(s){s.classList.remove('selected');});
      sw.classList.add('selected');
    });
  });
  document.getElementById('evFRepeat').addEventListener('change',function(){
    document.getElementById('evWdRow').style.display=this.value==='weekly'?'flex':'none';
  });
  document.querySelectorAll('.ev-wd-btn').forEach(function(btn){
    btn.addEventListener('click',function(){btn.classList.toggle('on');});
  });
  var delBtn=document.getElementById('evFDel');
  if(delBtn){
    delBtn.addEventListener('click',function(){
      if(!EV_EDIT)return;
      var deleted=EV_EDIT;
      var deletedIdx=-1;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===deleted.id){deletedIdx=i;break;}}
      EVENTS=EVENTS.filter(function(e){return e.id!==deleted.id;});
      saveEvents();updateEventsBtn();
      closeEvForm();
      setTimeout(function(){
        refreshEvents();
        showToast('Evento eliminado','success',function(){
          if(deletedIdx>=0){EVENTS.splice(deletedIdx,0,deleted);}else{EVENTS.push(deleted);}
          saveEvents();updateEventsBtn();refreshEvents();
        });
      },320);
    });
  }
  document.getElementById('evFSave').addEventListener('click',function(){
    var title=document.getElementById('evFTitle').value.trim();
    if(!title){showToast('El t\u00edtulo es obligatorio','error');return;}
    var note=document.getElementById('evFNote').value.trim();
    var colorSel=document.querySelector('.ev-color-swatch.selected');
    var color=colorSel?colorSel.dataset.hex:EV_COLORS[0];
    var start=document.getElementById('evFStart').value;
    var end=document.getElementById('evFEnd').value;
    if(!start){showToast('La fecha de inicio es obligatoria','error');return;}
    if(!end||end<start)end=start;
    var repType=document.getElementById('evFRepeat').value;
    var repeat=null;
    if(repType==='weekly'){
      var wdays=[];
      document.querySelectorAll('.ev-wd-btn.on').forEach(function(b){wdays.push(+b.dataset.wd);});
      if(!wdays.length){showToast('Selecciona al menos un d\u00eda','error');return;}
      repeat={type:'weekly',weekDays:wdays};
    }else if(repType!=='none'){repeat={type:repType};}
    if(EV_EDIT){
      var idx=-1;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===EV_EDIT.id){idx=i;break;}}
      if(idx!==-1)EVENTS[idx]={id:EV_EDIT.id,title:title,note:note,color:color,start:start,end:end,repeat:repeat};
      showToast('Evento actualizado','success');
    }else{
      EVENTS.push({id:'ev-'+Date.now(),title:title,note:note,color:color,start:start,end:end,repeat:repeat});
      showToast('Evento a\u00f1adido','success');
    }
    saveEvents();updateEventsBtn();
    closeEvForm();setTimeout(refreshEvents,320);
  });
}

/* ── Apertura/cierre de la ventana ──────────────────────── */
function openEvents(){
  var now=new Date();EV_YEAR=now.getFullYear();EV_MONTH=now.getMonth();EV_VIEW='cal';
  var ov=document.getElementById('eventsOverlay');
  document.getElementById('eventsContent').innerHTML=renderEvContent();
  ov.style.display='block';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindEvEvents();});});
}

function closeEvents(){
  var ov=document.getElementById('eventsOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

function refreshEvents(){
  document.getElementById('eventsContent').innerHTML=renderEvContent();
  bindEvEvents();
}

function bindEvEvents(){
  document.getElementById('evBack').addEventListener('click',closeEvents);
  document.getElementById('evPrev').addEventListener('click',function(){
    EV_MONTH--;if(EV_MONTH<0){EV_MONTH=11;EV_YEAR--;}refreshEvents();
  });
  document.getElementById('evNext').addEventListener('click',function(){
    EV_MONTH++;if(EV_MONTH>11){EV_MONTH=0;EV_YEAR++;}refreshEvents();
  });
  document.getElementById('evToday').addEventListener('click',function(){
    var n=new Date();EV_YEAR=n.getFullYear();EV_MONTH=n.getMonth();refreshEvents();
  });
  document.getElementById('evViewCal').addEventListener('click',function(){EV_VIEW='cal';refreshEvents();});
  document.getElementById('evViewMonths').addEventListener('click',function(){EV_VIEW='months';refreshEvents();});
  document.getElementById('evToBday').addEventListener('click',function(){closeEvents();setTimeout(openBday,330);});
  document.getElementById('evAdd').addEventListener('click',function(){openEvForm(null);});
  // Click en badges del calendario → detail (no edit)
  document.querySelectorAll('.ev-badge[data-id]').forEach(function(badge){
    badge.addEventListener('click',function(e){
      e.stopPropagation();
      var id=badge.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  // Click en celda vacía → crear evento con fecha
  document.querySelectorAll('.ev-cell[data-ds]').forEach(function(cell){
    cell.addEventListener('click',function(e){
      if(e.target.classList.contains('ev-badge'))return;
      openEvForm(null,cell.dataset.ds);
    });
  });
  // Click en item de lista → detail
  document.querySelectorAll('.ev-list-item').forEach(function(item){
    item.addEventListener('click',function(e){
      if(e.target.classList.contains('ev-list-btn'))return;
      var id=item.dataset.id;var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(ev)openEvDetail(ev);
    });
  });
  document.querySelectorAll('.ev-list-btn.del').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var id=btn.dataset.id;
      EVENTS=EVENTS.filter(function(e){return e.id!==id;});
      saveEvents();updateEventsBtn();refreshEvents();
      showToast('Evento eliminado','success');
    });
  });
  document.getElementById('evExport').addEventListener('click',function(){
    if(!EVENTS.length){showToast('No hay eventos para exportar','error');return;}
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(EVENTS,null,2));
    a.download='eventos.json';a.click();
  });
  document.getElementById('evImport').addEventListener('click',function(){document.getElementById('evImportFile').click();});
  document.getElementById('evImportFile').addEventListener('change',function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(evt){
      try{
        var arr=JSON.parse(evt.target.result);
        if(!Array.isArray(arr))throw new Error();
        EVENTS=arr;saveEvents();updateEventsBtn();refreshEvents();
        showToast('Eventos importados: '+EVENTS.length,'success');
      }catch(err){showToast('Error al importar el archivo','error');}
    };
    r.readAsText(f);
  });
}
