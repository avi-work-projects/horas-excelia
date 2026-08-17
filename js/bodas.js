/* ============================================================
   BODAS — Parejas y clases (ensayos de boda)
   Una CLASE es un evento normal: kind 'puntual', type 'Ensayos boda',
   con un bloque extra ev.boda = {coupleId, time, place}.
     · coupleId  id de la pareja (null = clase creada pero sin asignar)
     · time      'HH:MM' con minutos en :00 / :15 / :30 / :45 (null = sin hora)
     · place     'casa' | 'sala' | 'otro' (null = el de la pareja)
   Cada clase dura 1 hora.
   Las PAREJAS viven aparte, en localStorage 'excelia-bodas-v1'.
   ============================================================ */

var BODAS_SK = 'excelia-bodas-v1';
var BODA_COUPLES = (function(){
  try{var r=localStorage.getItem(BODAS_SK);if(r){var a=JSON.parse(r);if(Array.isArray(a))return a;}}catch(e){}
  return [];
})();
function saveBodas(){try{localStorage.setItem(BODAS_SK,JSON.stringify(BODA_COUPLES));}catch(e){}}

var BODA_PLACES = {casa:'Nuestra casa', sala:'Sala de confianza', otro:'Otro'};
var BODA_PLACE_SHORT = {casa:'Casa', sala:'Sala', otro:'Otro'};
/* Franjas horarias → color de las dos aspas de ABAJO */
var BODA_SLOTS = [
  {from: 9, to:14, color:'#ffffff', label:'09-14 h'},
  {from:14, to:18, color:'#b8bcc8', label:'14-18 h'},
  {from:18, to:20, color:'#4b5563', label:'18-20 h'},
  {from:20, to:23, color:'#000000', label:'20-23 h'}
];
var BODA_NO_TIME_COLOR = '#8b8f9a';   /* clase sin hora asignada */
var BODA_NO_COUPLE_COLOR = '#8b8f9a'; /* clase sin pareja asignada */

function bodaCouple(id){
  for(var i=0;i<BODA_COUPLES.length;i++)if(BODA_COUPLES[i].id===id)return BODA_COUPLES[i];
  return null;
}
function bodaSlotColor(time){
  if(!time)return BODA_NO_TIME_COLOR;
  var h=parseInt(String(time).slice(0,2),10);
  if(isNaN(h))return BODA_NO_TIME_COLOR;
  for(var i=0;i<BODA_SLOTS.length;i++){
    if(h>=BODA_SLOTS[i].from&&h<BODA_SLOTS[i].to)return BODA_SLOTS[i].color;
  }
  return BODA_NO_TIME_COLOR;
}
/* Aspa bicolor: brazos de arriba con el color de la pareja, los de abajo con
   el de la franja horaria. Mismo grosor de borde que el resto de formas. */
function evBodaSvg(ev){
  var b=(ev&&ev.boda)||{};
  var c=bodaCouple(b.coupleId);
  var top=c?c.color:BODA_NO_COUPLE_COLOR;
  var bot=bodaSlotColor(b.time);
  var swIn=5, swOut=swIn+EV_SHAPE_BW*2;
  return '<svg viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet">'
    +'<path d="M-6,-6 L6,6 M-6,6 L6,-6" stroke="#000" stroke-width="'+swOut+'" stroke-linecap="round" fill="none"/>'
    +'<path d="M0,0 L-6,-6 M0,0 L6,-6" stroke="'+top+'" stroke-width="'+swIn+'" stroke-linecap="round" fill="none"/>'
    +'<path d="M0,0 L-6,6 M0,0 L6,6" stroke="'+bot+'" stroke-width="'+swIn+'" stroke-linecap="round" fill="none"/>'
    +'</svg>';
}

/* ── Clases (eventos de tipo "Ensayos boda") ── */
function bodaClasses(){
  return EVENTS.filter(function(ev){return getEvType(ev)==='Ensayos boda';});
}
function bodaClassesOfCouple(id){
  return bodaClasses().filter(function(ev){return ev.boda&&ev.boda.coupleId===id;});
}
function bodaSortClasses(list){
  return list.slice().sort(function(a,b){
    if(a.start!==b.start)return a.start<b.start?-1:1;
    var ta=(a.boda&&a.boda.time)||'99:99', tb=(b.boda&&b.boda.time)||'99:99';
    return ta<tb?-1:ta>tb?1:0;
  });
}
function bodaNewClass(ds,time,coupleId){
  return {
    id:'ev-boda-'+Date.now()+'-'+Math.floor(Math.random()*1000),
    title:'Ensayo boda', note:'', color:evTypeColor('puntual','Ensayos boda'),
    kind:'puntual', type:'Ensayos boda',
    start:ds, end:ds, repeat:null,
    boda:{coupleId:coupleId||null, time:time||null, place:null}
  };
}
/* Alta masiva desde el calendario 1 mes: una clase por día, sin hora ni pareja */
function bodaBulkCreate(dsList){
  var added=0;
  dsList.forEach(function(ds){
    if(typeof evDayLimitExceeded==='function'){
      var probe={start:ds,end:ds,repeat:null};
      if(evDayLimitExceeded(probe,null))return;
    }
    EVENTS.push(bodaNewClass(ds,null,null));
    added++;
  });
  if(added)saveEvents();
  return added;
}

/* ── Estado de la pestaña ── */
var BODA_SUBTAB = 'clases';   /* 'clases' | 'parejas' */
var BODA_FILTER_COUPLE = 'all';
var BODA_HIDE_PAST = true;

function bodaProgress(c){
  var asignadas=bodaClassesOfCouple(c.id).length;
  return {done:asignadas, total:c.contracted||0, falta:Math.max(0,(c.contracted||0)-asignadas)};
}

/* ── Render: pestaña Bodas ── */
function renderBodasBody(){
  var h='<div class="boda-subtabs">';
  h+='<button class="boda-subtab'+(BODA_SUBTAB==='clases'?' active':'')+'" data-bsub="clases">🗓 Clases</button>';
  h+='<button class="boda-subtab'+(BODA_SUBTAB==='parejas'?' active':'')+'" data-bsub="parejas">💍 Parejas</button>';
  h+='</div>';
  h+=(BODA_SUBTAB==='parejas')?_renderBodaParejas():_renderBodaClases();
  return h;
}

function _renderBodaParejas(){
  var h='<div class="boda-sec">';
  if(!BODA_COUPLES.length){
    h+='<div class="sy-note">Todavía no hay parejas. Crea una para poder asignarle clases.</div>';
  }
  BODA_COUPLES.forEach(function(c){
    var p=bodaProgress(c);
    var pct=p.total?Math.min(100,Math.round(p.done*100/p.total)):0;
    var falta=p.falta>0?('<span class="boda-falta">faltan '+p.falta+'</span>')
      :(p.total&&p.done>p.total?'<span class="boda-sobra">'+(p.done-p.total)+' de más</span>':'<span class="boda-ok">completa</span>');
    h+='<div class="boda-card" data-cid="'+c.id+'">';
    h+='<div class="boda-card-hd">';
    h+='<span class="boda-dot" style="background:'+c.color+'"></span>';
    h+='<span class="boda-name">'+escHtml(c.name)+'</span>';
    h+='<span class="boda-place-tag">'+escHtml(BODA_PLACE_SHORT[c.place]||'Casa')+'</span>';
    h+='<button class="boda-mini-btn boda-edit" data-cid="'+c.id+'">✎</button>';
    h+='</div>';
    h+='<div class="boda-prog"><div class="boda-prog-bar" style="width:'+pct+'%;background:'+c.color+'"></div></div>';
    h+='<div class="boda-card-ft"><span>'+p.done+' / '+(p.total||0)+' clases</span>'+falta+'</div>';
    if(c.note)h+='<div class="boda-card-note">'+escHtml(c.note)+'</div>';
    h+='</div>';
  });
  h+='<button class="ev-io-btn boda-add-btn" id="bodaAddCouple">+ Nueva pareja</button>';
  h+='</div>';
  return h;
}

function _renderBodaClases(){
  var today=evDk(new Date());
  var all=bodaSortClasses(bodaClasses());
  var list=all.filter(function(ev){
    if(BODA_HIDE_PAST&&ev.start<today)return false;
    if(BODA_FILTER_COUPLE==='all')return true;
    if(BODA_FILTER_COUPLE==='none')return !(ev.boda&&ev.boda.coupleId);
    return ev.boda&&ev.boda.coupleId===BODA_FILTER_COUPLE;
  });
  var sinAsignar=all.filter(function(ev){return !(ev.boda&&ev.boda.coupleId);}).length;
  var sinHora=all.filter(function(ev){return !(ev.boda&&ev.boda.time);}).length;
  var h='<div class="boda-sec">';
  /* Resumen */
  h+='<div class="boda-summary">';
  h+='<div class="boda-sum-item"><b>'+all.length+'</b><span>clases</span></div>';
  h+='<div class="boda-sum-item'+(sinAsignar?' warn':'')+'"><b>'+sinAsignar+'</b><span>sin pareja</span></div>';
  h+='<div class="boda-sum-item'+(sinHora?' warn':'')+'"><b>'+sinHora+'</b><span>sin hora</span></div>';
  h+='</div>';
  /* Controles */
  h+='<div class="boda-controls">';
  h+='<select class="ev-types-select" id="bodaFilterCouple">';
  h+='<option value="all"'+(BODA_FILTER_COUPLE==='all'?' selected':'')+'>Todas las parejas</option>';
  h+='<option value="none"'+(BODA_FILTER_COUPLE==='none'?' selected':'')+'>Sin asignar</option>';
  BODA_COUPLES.forEach(function(c){
    h+='<option value="'+c.id+'"'+(BODA_FILTER_COUPLE===c.id?' selected':'')+'>'+escHtml(c.name)+'</option>';
  });
  h+='</select>';
  h+='<label class="ev-types-past-label"><input type="checkbox" id="bodaHidePast"'+(BODA_HIDE_PAST?' checked':'')+'> Ocultar pasadas</label>';
  h+='</div>';
  if(!list.length){
    h+='<div class="sy-note">No hay clases'+(BODA_HIDE_PAST?' futuras':'')+'. Créalas marcando días en el Calendario 1 mes, o con el botón de abajo.</div>';
  }
  /* Agrupadas por día */
  var byDay={},order=[];
  list.forEach(function(ev){if(!byDay[ev.start]){byDay[ev.start]=[];order.push(ev.start);}byDay[ev.start].push(ev);});
  var WN=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  order.forEach(function(ds){
    var d=new Date(ds+'T00:00:00');
    h+='<div class="boda-day">';
    h+='<div class="boda-day-hd">'+WN[d.getDay()]+' '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')
      +'<span class="boda-day-n">'+byDay[ds].length+' clase'+(byDay[ds].length>1?'s':'')+'</span>'
      +'<button class="boda-mini-btn boda-day-add" data-ds="'+ds+'" title="Añadir clase este día">+</button></div>';
    byDay[ds].forEach(function(ev){
      var b=ev.boda||{};
      var c=bodaCouple(b.coupleId);
      h+='<div class="boda-class" data-id="'+ev.id+'">';
      h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
      h+='<select class="boda-inp boda-time" data-id="'+ev.id+'">'+_bodaTimeOptions(b.time)+'</select>';
      h+='<select class="boda-inp boda-couple" data-id="'+ev.id+'">';
      h+='<option value=""'+(!c?' selected':'')+'>— sin asignar —</option>';
      BODA_COUPLES.forEach(function(cc){
        h+='<option value="'+cc.id+'"'+(c&&c.id===cc.id?' selected':'')+'>'+escHtml(cc.name)+'</option>';
      });
      h+='</select>';
      h+='<select class="boda-inp boda-place" data-id="'+ev.id+'">';
      ['','casa','sala','otro'].forEach(function(p){
        var lbl=p?BODA_PLACE_SHORT[p]:(c?BODA_PLACE_SHORT[c.place||'casa']+' (pareja)':'Lugar');
        h+='<option value="'+p+'"'+((b.place||'')===p?' selected':'')+'>'+escHtml(lbl)+'</option>';
      });
      h+='</select>';
      h+='<button class="boda-mini-btn boda-del" data-id="'+ev.id+'">×</button>';
      h+='</div>';
    });
    h+='</div>';
  });
  h+='<div class="boda-actions">';
  h+='<button class="ev-io-btn" id="bodaAddClass">+ Añadir clase</button>';
  h+='<input type="date" class="ev-input boda-date-inp" id="bodaAddDate">';
  h+='</div>';
  /* Leyenda de franjas */
  h+='<div class="boda-legend"><span class="boda-legend-t">Color de las aspas de abajo:</span>';
  BODA_SLOTS.forEach(function(s){
    h+='<span class="boda-legend-i"><i style="background:'+s.color+'"></i>'+s.label+'</span>';
  });
  h+='<span class="boda-legend-i"><i style="background:'+BODA_NO_TIME_COLOR+'"></i>sin hora</span>';
  h+='</div>';
  h+='</div>';
  return h;
}
/* Horas en saltos de 15 min entre las 8:00 y las 23:00 */
function _bodaTimeOptions(sel){
  var h='<option value=""'+(!sel?' selected':'')+'>--:--</option>';
  for(var hh=8;hh<=22;hh++){
    for(var mi=0;mi<60;mi+=15){
      var v=String(hh).padStart(2,'0')+':'+String(mi).padStart(2,'0');
      h+='<option value="'+v+'"'+(sel===v?' selected':'')+'>'+v+'</option>';
    }
  }
  return h;
}

/* ── Formulario de pareja ── */
function renderBodaCoupleForm(c){
  var isEdit=!!c;
  var col=isEdit?c.color:'#e879a8';
  var h='<div class="ev-form-overlay" id="bodaCFormOv"><div class="ev-form-sheet">';
  h+='<div class="ev-form-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="bodaCClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar pareja':'Nueva pareja')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="bodaCDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Pareja</label><input class="ev-input" id="bodaCName" type="text" maxlength="40" placeholder="Ej: Marta y Juan" value="'+(isEdit?escHtml(c.name):'')+'"></div>';
  h+='<div class="ev-field"><label>Clases contratadas</label><input class="ev-input" id="bodaCNum" type="number" min="0" max="60" value="'+(isEdit?(c.contracted||0):8)+'"></div>';
  h+='<div class="ev-field"><label>Lugar habitual</label><select class="ev-input" id="bodaCPlace">';
  ['casa','sala','otro'].forEach(function(p){
    h+='<option value="'+p+'"'+((isEdit?(c.place||'casa'):'casa')===p?' selected':'')+'>'+BODA_PLACES[p]+'</option>';
  });
  h+='</select></div>';
  h+='<div class="ev-field"><label>Notas <span id="bodaCCnt" style="font-weight:400;color:var(--text-dim)">'+((isEdit&&c.note?c.note.length:0))+'/200</span></label>';
  h+='<textarea class="ev-textarea" id="bodaCNote" maxlength="200" placeholder="Notas de la pareja...">'+(isEdit&&c.note?escHtml(c.note):'')+'</textarea></div>';
  h+='<div class="ev-field"><label>🎨 Color (aspas de arriba)</label>';
  h+=_renderColorPicker(col,false,false,'bodaCp');
  h+='</div>';
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="bodaCSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}
function openBodaCoupleForm(c){
  var ov=document.getElementById('eventsOverlay');
  var wrap=document.createElement('div');wrap.id='bodaCWrap';
  wrap.innerHTML=renderBodaCoupleForm(c);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('bodaCFormOv');if(fo)fo.classList.add('open');
  });
  var cp=_bindColorPicker(wrap,'bodaCp');
  var noteEl=document.getElementById('bodaCNote'),cnt=document.getElementById('bodaCCnt');
  noteEl.addEventListener('input',function(){cnt.textContent=noteEl.value.length+'/200';});
  document.getElementById('bodaCClose').addEventListener('click',closeBodaCoupleForm);
  var del=document.getElementById('bodaCDel');
  if(del)del.addEventListener('click',function(){
    /* Las clases de la pareja no se borran: quedan sin asignar */
    bodaClassesOfCouple(c.id).forEach(function(ev){ev.boda.coupleId=null;});
    saveEvents();
    BODA_COUPLES=BODA_COUPLES.filter(function(x){return x.id!==c.id;});
    saveBodas();closeBodaCoupleForm();
    setTimeout(function(){refreshEvents();showToast('Pareja eliminada (sus clases quedan sin asignar)','success');},310);
  });
  document.getElementById('bodaCSave').addEventListener('click',function(){
    var name=document.getElementById('bodaCName').value.trim();
    if(!name){showToast('El nombre de la pareja es obligatorio','error');return;}
    var num=parseInt(document.getElementById('bodaCNum').value,10);
    if(isNaN(num)||num<0)num=0;
    var data={name:name,contracted:num,place:document.getElementById('bodaCPlace').value,
      note:document.getElementById('bodaCNote').value.trim(),color:cp.getColor()};
    if(c){for(var k in data)c[k]=data[k];}
    else{data.id='bc-'+Date.now();BODA_COUPLES.push(data);}
    saveBodas();closeBodaCoupleForm();
    setTimeout(function(){refreshEvents();showToast(c?'Pareja actualizada':'Pareja creada','success');},310);
  });
}
function closeBodaCoupleForm(){
  var fo=document.getElementById('bodaCFormOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('bodaCWrap');if(w)w.remove();},300);
}

/* ── Binds de la pestaña ── */
function bindBodasEvents(){
  document.querySelectorAll('.boda-subtab[data-bsub]').forEach(function(b){
    b.addEventListener('click',function(){BODA_SUBTAB=b.dataset.bsub;refreshEvents();});
  });
  var addC=document.getElementById('bodaAddCouple');
  if(addC)addC.addEventListener('click',function(){openBodaCoupleForm(null);});
  document.querySelectorAll('.boda-edit[data-cid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openBodaCoupleForm(bodaCouple(b.dataset.cid));});
  });
  var fc=document.getElementById('bodaFilterCouple');
  if(fc)fc.addEventListener('change',function(){BODA_FILTER_COUPLE=this.value;refreshEvents();});
  var hp=document.getElementById('bodaHidePast');
  if(hp)hp.addEventListener('change',function(){BODA_HIDE_PAST=this.checked;refreshEvents();});
  function findClass(id){for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id)return EVENTS[i];return null;}
  document.querySelectorAll('.boda-time[data-id]').forEach(function(sel){
    sel.addEventListener('change',function(){
      var ev=findClass(sel.dataset.id);if(!ev)return;
      ev.boda=ev.boda||{};ev.boda.time=sel.value||null;
      saveEvents();refreshEvents();
    });
  });
  document.querySelectorAll('.boda-couple[data-id]').forEach(function(sel){
    sel.addEventListener('change',function(){
      var ev=findClass(sel.dataset.id);if(!ev)return;
      ev.boda=ev.boda||{};ev.boda.coupleId=sel.value||null;
      var c=bodaCouple(sel.value);
      ev.title=c?('Ensayo — '+c.name):'Ensayo boda';
      saveEvents();refreshEvents();
    });
  });
  document.querySelectorAll('.boda-place[data-id]').forEach(function(sel){
    sel.addEventListener('change',function(){
      var ev=findClass(sel.dataset.id);if(!ev)return;
      ev.boda=ev.boda||{};ev.boda.place=sel.value||null;
      saveEvents();refreshEvents();
    });
  });
  document.querySelectorAll('.boda-del[data-id]').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.dataset.id;
      var removed=null;
      EVENTS=EVENTS.filter(function(e){if(e.id===id){removed=e;return false;}return true;});
      saveEvents();refreshEvents();
      showToast('Clase eliminada','success',function(){
        if(removed){EVENTS.push(removed);saveEvents();refreshEvents();}
      });
    });
  });
  document.querySelectorAll('.boda-day-add[data-ds]').forEach(function(b){
    b.addEventListener('click',function(){
      var ds=b.dataset.ds;
      if(typeof evDayLimitExceeded==='function'&&evDayLimitExceeded({start:ds,end:ds,repeat:null},null)){
        showToast('Ese día ya tiene '+EV_MAX_DAY_EVENTS+' eventos (máximo)','error');return;
      }
      EVENTS.push(bodaNewClass(ds,null,BODA_FILTER_COUPLE!=='all'&&BODA_FILTER_COUPLE!=='none'?BODA_FILTER_COUPLE:null));
      saveEvents();refreshEvents();
    });
  });
  var addCl=document.getElementById('bodaAddClass');
  if(addCl)addCl.addEventListener('click',function(){
    var dInp=document.getElementById('bodaAddDate');
    var ds=dInp&&dInp.value?dInp.value:evDk(new Date());
    if(typeof evDayLimitExceeded==='function'&&evDayLimitExceeded({start:ds,end:ds,repeat:null},null)){
      showToast('Ese día ya tiene '+EV_MAX_DAY_EVENTS+' eventos (máximo)','error');return;
    }
    EVENTS.push(bodaNewClass(ds,null,BODA_FILTER_COUPLE!=='all'&&BODA_FILTER_COUPLE!=='none'?BODA_FILTER_COUPLE:null));
    saveEvents();refreshEvents();
    showToast('Clase añadida el '+ds.slice(8)+'/'+ds.slice(5,7),'success');
  });
}
