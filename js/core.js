/* ============================================================
   CORE — Estado, utilidades, render principal
   ============================================================ */

// ── Versión de la app (actualizar en cada push significativo) ─
var APP_VERSION = 'v35 — alarmas limpiar mejorado + popup logo + botones header + X anual + VIP edición + dropdown anual';

// ── MacroDroid: normalizar URL base (quita trailing slash y nombre de macro) ─
function normalizeMacroBase(url){
  url=(url||'').trim().replace(/\/+$/,'');
  var m=url.match(/^(https?:\/\/trigger\.macrodroid\.com\/[^\/]+)/);
  if(m)return m[1];
  url=url.replace(/\/(generar_alarma1|generar_alarma2|apagar_alarmas)$/,'');
  return url;
}

// ── Historial de navegación entre overlays ────────────────────
var NAV_BACK=null; // función para "volver atrás" al pulsar ← en cualquier overlay

// ── Tema visual ──────────────────────────────────────────────
var THEME_STORAGE_KEY='excelia-theme-v1';
var THEME=(function(){try{var t=localStorage.getItem('excelia-theme-v1');if(t&&['dark','light','amoled'].indexOf(t)!==-1)return t;}catch(e){}return 'dark';})();
var THEME_LABELS={dark:'\uD83C\uDF19\u00a0Oscuro',light:'\u2600\uFE0F\u00a0Claro',amoled:'\u26AB\u00a0AMOLED'};
var THEME_META={dark:'#0a0a0f',light:'#f4f4fa',amoled:'#000000'};
var THEME_SEQUENCE=['dark','light','amoled'];
function applyTheme(t){
  THEME=t;
  document.documentElement.setAttribute('data-theme',t);
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=THEME_META[t]||THEME_META.dark;
  try{localStorage.setItem(THEME_STORAGE_KEY,t);}catch(e){}
}
function cycleTheme(){
  var idx=(THEME_SEQUENCE.indexOf(THEME)+1)%THEME_SEQUENCE.length;
  applyTheme(THEME_SEQUENCE[idx]);
  updateThemeBtn();
}
function updateThemeBtn(){
  var btn=document.getElementById('themeBtn');
  if(btn)btn.innerHTML=THEME_LABELS[THEME]||THEME_LABELS.dark;
}

// ── Estado global ──────────────────────────────────────────
var SK='excelia-horas-v3', CY, CM, ST={}, SW={}, ED=null, MONTH_H={}, DAILY_RATE=315, EXCL_FEST=true, EXCL_VAC=true;
var MN=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var MN_SHORT=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
var DN=['D','L','M','X','J','V','S'];
var DF=['Domingo','Lunes','Martes','Mi\u00e9rcoles','Jueves','Viernes','S\u00e1bado'];

// ── Persistencia ────────────────────────────────────────────
function load(){
  try{
    var r=localStorage.getItem(SK);
    if(r){var d=JSON.parse(r);ST=d.days||{};SW=d.sent||{};MONTH_H=d.monthH||{};DAILY_RATE=d.rate||315;EXCL_FEST=d.exclFest!==false;EXCL_VAC=d.exclVac!==false;}
  }catch(e){ST={};SW={};MONTH_H={};DAILY_RATE=315;EXCL_FEST=true;EXCL_VAC=true;}
}
function save(){
  localStorage.setItem(SK,JSON.stringify({days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE,exclFest:EXCL_FEST,exclVac:EXCL_VAC}));
}

// ── Utilidades HTML ─────────────────────────────────────────
function escHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Utilidades de fecha/hora ─────────────────────────────────
function mkey(y,m){return y+'-'+String(m+1).padStart(2,'0');}
function getMonthH(y,m,day){
  if(MONTH_H[mkey(y,m)]!==undefined)return MONTH_H[mkey(y,m)];
  if(m===6||m===7)return 7;
  if(m===8&&(!day||day<=15))return 7;
  return 9;
}
function defH(d){var w=d.getDay();if(!w||w===6)return 0;if(w===5)return 6.5;return getMonthH(d.getFullYear(),d.getMonth(),d.getDate());}
function dayH(d){var w=d.getDay();if(!w||w===6)return 0;var k=dk(d),e=ST[k],t=(e&&e.type)||'normal';if(t!=='normal')return 0;if(w===5)return 6.5;return(e&&e.hours)||getMonthH(d.getFullYear(),d.getMonth(),d.getDate());}
function dayT(d){var e=ST[dk(d)];return(e&&e.type)||'normal';}
function dk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fd(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');}
function ad(d,n){var r=new Date(d);r.setDate(r.getDate()+n);return r;}
function fh(h){if(h===0)return'\u2014';if(h%1===0)return String(h)+'h';return h.toFixed(1).replace('.',',')+'\u202fh';}
function fhP(h){if(h===0)return'';if(h%1===0)return String(h);return h.toFixed(1);}
function isToday(d){var t=new Date();return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate();}
function isPast(d){var t=new Date();t.setHours(0,0,0,0);return d<t;}
function wn(date){var d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));var ys=new Date(Date.UTC(d.getUTCFullYear(),0,1));return Math.ceil(((d-ys)/864e5+1)/7);}

// ── Cálculo de semanas ───────────────────────────────────────
function weeks(y,m){
  var ws=[],first=new Date(y,m,1),last=new Date(y,m+1,0),s=new Date(first);
  var dow=s.getDay(),off=dow===0?-6:1-dow; s.setDate(s.getDate()+off);
  while(s<=last||s.getMonth()===m){
    var w=[]; for(var i=0;i<7;i++){w.push(new Date(s));s=ad(s,1);}
    ws.push(w);
    if(s.getMonth()>m&&s.getFullYear()>=y&&m<11)break;
    if(s.getFullYear()>y&&m===11)break;
    if(ws.length>6)break;
  }
  return ws;
}

// ── Comprueba si hay semanas enviadas en el mes actual ────────
function hasAnySentWeekInMonth(y,m){
  var wks=weeks(y,m);
  for(var i=0;i<wks.length;i++){if(SW[dk(wks[i][0])])return true;}
  return false;
}

// ── Datos de semana para email ───────────────────────────────
function getWD(wkey){
  var p=wkey.split('-'),mon=new Date(+p[0],+p[1]-1,+p[2]),days=[];
  for(var i=0;i<5;i++)days.push(ad(mon,i));
  var proy=[],vac=[],fest=[],aus=[];
  for(var i=0;i<5;i++){
    var d=days[i],t=dayT(d);
    if(t==='normal'){var h=dayH(d);proy.push(fhP(h));vac.push('');fest.push('');aus.push('');}
    else{proy.push('');vac.push(t==='vacaciones'?'X':'');fest.push(t==='festivo'?'X':'');aus.push(t==='ausencia'?'X':'');}
  }
  return{mon:mon,fri:days[4],proy:proy,vac:vac,fest:fest,aus:aus};
}

// ── Toast ────────────────────────────────────────────────────
function showToast(msg,type,undoFn,btnTxt){
  var t=document.getElementById('toast');
  clearTimeout(t._timer);
  if(undoFn){
    t.innerHTML=escHtml(msg)+'<button class="toast-undo-btn" id="toastUndoBtn">'+(btnTxt||'Deshacer')+'</button>';
    t.className='toast show has-undo'+(type?' '+type:'');
    document.getElementById('toastUndoBtn').addEventListener('click',function(){
      undoFn(); t.className='toast';
    });
    t._timer=setTimeout(function(){t.className='toast';},8000);
  } else {
    t.textContent=msg;
    t.className='toast show'+(type?' '+type:'');
    t._timer=setTimeout(function(){t.className='toast';},3500);
  }
}

// ── Envío de email ───────────────────────────────────────────
function sendEmail(wkey){
  var wd=getWD(wkey);
  var body=buildMailtoBody(wd);
  var subject='HORAS Y DIAS TRABAJADOS - '+AUTHOR_NAME+' - Semana del '+fd(wd.mon)+' al '+fd(wd.fri);
  var url='mailto:'+TO+'?cc='+encodeURIComponent(CC.join(','))+'&subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  window.location.href=url;
  SW[wkey]=true; save(); render();
  showToast('Abriendo Outlook\u2026 recuerda pulsar Enviar','success');
}

function buildMailtoBody(wd){
  var DN5=['L','M','X','J','V'];
  var total=0;
  wd.proy.forEach(function(h){if(h)total+=parseFloat(h);});
  var totalStr=(total%1===0?String(total):total.toFixed(1)).replace('.',',');
  var semana='Semana del '+fd(wd.mon)+' al '+fd(wd.fri);
  var body='Buenos d\u00edas!\n\n'+semana+':\n\n';
  for(var i=0;i<5;i++){
    var d=ad(wd.mon,i);
    var label;
    if(wd.fest[i])label='Festivo';
    else if(wd.vac[i])label='Vacaciones';
    else if(wd.aus[i])label='Ausencia';
    else label=(wd.proy[i]?wd.proy[i].replace('.',',')+' h':'\u2014');
    body+=DN5[i]+' '+fd(d)+' \u2014 '+label+'\n';
  }
  body+='\nTotal horas trabajadas en proyecto en la '+semana.toLowerCase()+':\n';
  body+=totalStr+'h\n\nUn saludo,\n'+AUTHOR_NAME;
  return body;
}

// ── Render principal ─────────────────────────────────────────
function render(){
  document.getElementById('monthLabel').textContent=MN[CM]+' '+CY;
  var curMonthH=getMonthH(CY,CM,1);
  document.querySelectorAll('.hours-chip').forEach(function(el){el.classList.toggle('active',+el.dataset.h===curMonthH);});
  // Actualizar texto del botón de jornada
  var dhBtn=document.getElementById('editHoursBtn');
  if(dhBtn){
    var dhSpan=dhBtn.querySelector('.dh-val');
    if(dhSpan)dhSpan.textContent=curMonthH+'h';
  }

  var wks=weeks(CY,CM),c=document.getElementById('weeksContainer');
  c.innerHTML='';

  wks.forEach(function(wk){
    var mon=wk[0],sun=wk[6],wkey=dk(mon),sent=!!SW[wkey],dias=0;
    for(var i=0;i<5;i++){if(dayH(wk[i])>0)dias++;}
    var dStr=dias+(dias===1?' d\u00eda':' d\u00edas');

    var card=document.createElement('div');
    card.className='week-card'+(sent?' sent':'');
    card.innerHTML='<div class="week-header"><div class="week-info"><h3>Semana '+wn(mon)+(sent?'<span class="sent-badge">\u2713 Enviada</span>':'')+'</h3><div class="week-range">'+fd(mon)+' \u2014 '+fd(sun)+'</div></div><div class="week-total">'+dStr+'</div></div>';

    var grid=document.createElement('div'); grid.className='days-grid';
    for(var i=0;i<5;i++){
      var d=wk[i],dt=dayT(d),hrs=dayH(d),inM=d.getMonth()===CM;
      var cell=document.createElement('div');
      var hCls='';if(dt==='normal'){if(hrs===6.5)hCls=' h65';else if(hrs===7)hCls=' h7';else if(hrs===8)hCls=' h8';else if(hrs===9)hCls=' h9';}
      cell.className='day-cell'+(dt!=='normal'?' '+dt:hCls);
      if(!inM)cell.style.opacity='0.4';
      var ts=isToday(d)?'color:var(--accent-bright)':'';
      // Event dots
      var evDotsHtml='';
      if(typeof getEventsOn==='function'){
        var evs=getEventsOn(dk(d));
        if(evs.length){
          evDotsHtml='<div class="ev-dots-row">';
          evs.slice(0,3).forEach(function(ev){evDotsHtml+='<span class="ev-dot" style="background:'+ev.color+'"></span>';});
          evDotsHtml+='</div>';
        }
      }
      cell.innerHTML=(dt!=='normal'?'<div class="day-status-dot"></div>':'')+
        '<div class="day-name" style="'+ts+'">'+DN[d.getDay()]+'</div>'+
        '<div class="day-date">'+fd(d)+'</div>'+
        '<div class="day-hours">'+fh(hrs)+'</div>'+evDotsHtml;
      // Bloquear clic si semana enviada
      (function(dd,isSent){
        cell.addEventListener('click',function(){
          if(isSent){showToast('Semana enviada. Desmarca primero para editar.','error');return;}
          openSheet(dd);
        });
      })(d,sent);
      grid.appendChild(cell);
    }
    card.appendChild(grid);

    var acts=document.createElement('div'); acts.className='week-actions';
    var sendBtn=document.createElement('button');
    sendBtn.className='action-btn send';
    sendBtn.innerHTML='\u2709 Abrir en Outlook';
    (function(k){sendBtn.addEventListener('click',function(e){e.stopPropagation();sendEmail(k);});})(wkey);
    var sb=document.createElement('button');
    sb.className='action-btn sent-toggle';
    sb.textContent=sent?'\u21a9 Desmarcar':'\u2713 Marcar enviada';
    (function(k){sb.addEventListener('click',function(e){e.stopPropagation();togSent(k);});})(wkey);
    acts.appendChild(sendBtn); acts.appendChild(sb);
    card.appendChild(acts); c.appendChild(card);
  });

  // Resumen mensual
  var diasTrabajados=0,horasTotales=0,diasNoLaborables=0,diasFest=0,diasVac=0,diasAus=0;
  wks.forEach(function(wk){
    for(var i=0;i<5;i++){
      var d=wk[i]; if(d.getMonth()!==CM)continue;
      var t=dayT(d),h=dayH(d);
      if(t==='normal'){diasTrabajados++;horasTotales+=h;}
      else{diasNoLaborables++;if(t==='festivo')diasFest++;else if(t==='vacaciones')diasVac++;else if(t==='ausencia')diasAus++;}
    }
  });
  var hStr=(horasTotales%1===0?String(horasTotales):horasTotales.toFixed(1).replace('.',','));
  var dsglose='';
  if(diasNoLaborables>0){
    var dparts=[];
    if(diasFest)dparts.push('<span style="color:var(--festivo)">'+diasFest+' festivo'+(diasFest>1?'s':'')+'</span>');
    if(diasVac)dparts.push('<span style="color:var(--vacaciones)">'+diasVac+' vacac.</span>');
    if(diasAus)dparts.push('<span style="color:var(--ausencia)">'+diasAus+' baja'+(diasAus>1?'s':'')+'</span>');
    if(dparts.length)dsglose='<div class="ms-breakdown">'+dparts.join('<span class="ms-sep"> / </span>')+'</div>';
  }
  var footer=document.createElement('div'); footer.className='month-summary';
  footer.innerHTML='<div class="month-stat worked"><span class="ms-num">'+diasTrabajados+'</span><span class="ms-label"> d\u00edas trabajados</span><span class="ms-hrs"> ('+hStr+'h)</span></div>'+
    '<div class="month-stat off"><span class="ms-num">'+diasNoLaborables+'</span><span class="ms-label"> d\u00edas no trabajados</span></div>'+dsglose;
  c.appendChild(footer);
}

// ── Bottom sheet (selector de tipo de día) ───────────────────
function openSheet(date){
  ED=date; var dt=dayT(date),dow=date.getDay();
  var nh=(dow===5)?'6,5h':String(getMonthH(date.getFullYear(),date.getMonth(),date.getDate()))+'h';
  document.getElementById('sheetTitle').textContent=DF[dow]+' '+fd(date);
  document.getElementById('sheetSubtitle').textContent='Selecciona el tipo de d\u00eda';
  document.getElementById('optNormalHours').textContent=nh;
  var opts=document.querySelectorAll('.sheet-option');
  for(var i=0;i<opts.length;i++){opts[i].classList.toggle('selected',opts[i].dataset.type===dt);}
  var picker=document.getElementById('hourPicker');
  if(dow>=1&&dow<=4&&dt==='normal'){
    picker.style.display='block';
    var e=ST[dk(date)];
    var curH=(e&&e.hours)||getMonthH(date.getFullYear(),date.getMonth(),date.getDate());
    document.querySelectorAll('.hour-chip-day').forEach(function(c){c.classList.toggle('active',+c.dataset.h===curH);});
  } else {picker.style.display='none';}
  document.getElementById('overlay').classList.add('active');
  document.getElementById('bottomSheet').classList.add('active');
}

function closeSheet(){
  document.getElementById('overlay').classList.remove('active');
  document.getElementById('bottomSheet').classList.remove('active');
  ED=null;
}

function selectType(t){
  if(!ED)return; var k=dk(ED),dow=ED.getDay();
  if(t==='normal'){
    var e=ST[k]||{},wasNormal=!e.type;
    if(!wasNormal){delete ST[k];}
    document.querySelectorAll('.sheet-option').forEach(function(el){el.classList.toggle('selected',el.dataset.type==='normal');});
    if(dow>=1&&dow<=4){
      if(wasNormal){
        // Ya era normal: confirmar y cerrar
        save(); render(); closeSheet();
      } else {
        // Cambiado a normal: mostrar picker de horas
        var picker=document.getElementById('hourPicker');
        picker.style.display='block';
        var curH=getMonthH(ED.getFullYear(),ED.getMonth(),ED.getDate());
        document.querySelectorAll('.hour-chip-day').forEach(function(c){c.classList.toggle('active',+c.dataset.h===curH);});
        save(); render();
      }
    } else {
      // Viernes: cerrar directamente
      save(); render(); closeSheet();
    }
  } else {
    delete ST[k]; ST[k]={type:t};
    save(); closeSheet(); render();
  }
}

function togSent(k){if(SW[k])delete SW[k]; else SW[k]=true; save(); render();}

// ── Barra de navegación compartida entre overlays ────────────
function renderNavBar(current){
  var evActive=typeof EVENTS!=='undefined'&&EVENTS.length>0&&typeof hasUpcomingEvent==='function'&&hasUpcomingEvent();
  var bdActive=typeof BDAYS!=='undefined'&&BDAYS.length>0&&typeof hasUpcomingBday==='function'&&hasUpcomingBday();
  var btns=[
    {icon:'&#127968;',key:'home',title:'Inicio'},
    {icon:'&#128202;',key:'summary',title:'Resumen anual'},
    {icon:'&#128176;',key:'econ',title:'Econ\u00f3mico'},
    {icon:'&#127874;',key:'bday',title:'Cumplea\u00f1os'},
    {icon:'&#128197;',key:'events',title:'Eventos'},
    {icon:'&#128276;',key:'alarm',title:'Test alarma'},
    {icon:'&#8943;',key:'menu',title:'M\u00e1s opciones'}
  ];
  var h='<div class="overlay-nav-bar">';
  btns.forEach(function(b){
    if(b.key==='alarm')h+='<div class="nav-bar-spacer"></div>';
    var active=b.key===current?' active':'';
    var extra=b.key==='events'&&evActive?' events-active':b.key==='bday'&&bdActive?' bday-active':'';
    h+='<button class="nav-bar-btn'+active+extra+'" data-nav="'+b.key+'" title="'+b.title+'">'+b.icon+'</button>';
  });
  h+='</div>';
  return h;
}

function bindNavBar(current,closeFn){
  // Map para reabrir el overlay actual (para NAV_BACK)
  var reopenFns={summary:openSummary,econ:openEcon,bday:openBday,events:openEvents};
  document.querySelectorAll('.overlay-nav-bar .nav-bar-btn[data-nav]').forEach(function(btn){
    var key=btn.dataset.nav;
    if(key===current)return;
    btn.addEventListener('click',function(e){
      var doNav=function(){
        if(key==='home'){/* overlay ya cerrado */}
        else if(key==='summary')openSummary();
        else if(key==='econ')openEcon();
        else if(key==='bday')openBday();
        else if(key==='events')openEvents();
        else if(key==='alarm')document.getElementById('alarmTestBtn').click();
        else if(key==='menu'){var m=document.getElementById('dataMenu');if(m)m.classList.toggle('open');}
      };
      // Guardar función de retorno: cerrar la nueva ventana + reabrir la actual
      if(closeFn&&reopenFns[key]&&reopenFns[current]){
        var reopen=reopenFns[current];
        NAV_BACK=function(){closeFn();setTimeout(reopen,330);};
      } else {
        NAV_BACK=null;
      }
      if(closeFn){closeFn();setTimeout(doNav,330);}
      else doNav();
    });
  });
}
