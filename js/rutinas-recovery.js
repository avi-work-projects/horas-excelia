/* Recuperaciones: origen pendiente → día del calendario → agenda y horario.
   Solo el último paso escribe; el calendario de fondo no cambia de mes. */
var RUT_RECOVERY_PICK=null;
function rutUnrecoveredSessions(r){
  var keys=Object.keys(r.skips||{}).concat((r.extraSessions||[]).filter(function(s){return s.skip;}).map(function(s){return s.id;}));
  return keys.map(function(key){return rutSessionByKey(r,key);}).filter(function(s){return s&&s.skip&&!rutRecoveryFor(r,s.key);})
    .sort(function(a,b){return a.ds.localeCompare(b.ds)||a.time.localeCompare(b.time)||a.key.localeCompare(b.key);});
}
function openRutRecoveryList(r,excludePast){
  var today=evDk(new Date()),list=rutUnrecoveredSessions(r).filter(function(s){return !excludePast||s.ds>=today;});
  var h='<label class="excl-item"><input id="rutRecoveryExcludePast" type="checkbox"'+(excludePast?' checked':'')+'> Excluir pasadas</label><div class="rut-recovery-list">';
  var month='';
  list.forEach(function(s){
    if(month!==s.ds.slice(0,7)){month=s.ds.slice(0,7);h+='<h3>'+MN[+month.slice(5)-1]+' '+month.slice(0,4)+'</h3>';}
    h+='<button class="ev-io-btn" data-recover-origin="'+s.key+'" data-recover-date="'+s.ds+'"><strong>'+_rutFmtCorto(s.ds)+' · '+s.time+'</strong><small>Cancelada (sin recuperar)</small></button>';
  });
  if(!list.length)h+='<p class="sy-note">No hay clases canceladas sin recuperar'+(excludePast?' desde hoy':'')+'.</p>';
  var wrap=rutAdditionPanel('Elige la clase cancelada',h+'</div>',function(){openRutAddition(r);});
  wrap.querySelector('#rutRecoveryExcludePast').onchange=function(e){openRutRecoveryList(r,e.target.checked);};
  wrap.querySelectorAll('[data-recover-origin]').forEach(function(b){b.onclick=function(){openRutRecoveryDay(r,b.dataset.recoverOrigin,null,function(){openRutRecoveryList(r,excludePast);});};});
  requestAnimationFrame(function(){
    var rows=Array.from(wrap.querySelectorAll('[data-recover-date]')),target=rows.find(function(el){return el.dataset.recoverDate>=today;})||rows[rows.length-1];
    var body=wrap.querySelector('.rut-recovery-list');if(target)body.scrollTop=target.offsetTop-body.offsetTop-40;
  });
}
function openRutRecoveryDay(r,key,date,back){
  var d=new Date((date||evDk(new Date()))+'T12:00:00');
  RUT_RECOVERY_PICK={year:d.getFullYear(),month:d.getMonth(),date:date||null};
  function render(){
    var state=RUT_RECOVERY_PICK,y=EV_YEAR,m=EV_MONTH,cal;
    try{EV_YEAR=state.year;EV_MONTH=state.month;cal=renderEvCalMonth();}finally{EV_YEAR=y;EV_MONTH=m;}
    var h='<div class="boda-asg-nav"><button class="sy-nav" id="rutRecoveryPrev" aria-label="Mes anterior">◀</button><strong>'+MN[state.month]+' '+state.year+'</strong><button class="sy-nav" id="rutRecoveryNext" aria-label="Mes siguiente">▶</button></div>';
    h+='<div class="rut-dpick-real">'+cal+'</div><p class="sy-note">Selecciona un día para consultar su agenda.</p><button class="ev-btn rut-recovery-confirm" id="rutRecoveryConfirm"'+(!state.date?' disabled':'')+'>Confirmar'+(state.date?' · '+_rutFmt(state.date):'')+'</button>';
    var wrap=rutAdditionPanel(r.name+' - elige día',h,back||function(){openRutAddition(r);});
    wrap.querySelectorAll('.ev-cell[data-ds]').forEach(function(cell){
      cell.classList.toggle('rut-day-selected',cell.dataset.ds===state.date);
      cell.setAttribute('role','button');cell.setAttribute('tabindex','0');cell.setAttribute('aria-label',_rutFmt(cell.dataset.ds));cell.setAttribute('aria-pressed',String(cell.dataset.ds===state.date));
      function select(){state.date=cell.dataset.ds;render();}
      cell.onclick=select;cell.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}};
    });
    function move(delta){var next=new Date(state.year,state.month+delta,1);state.year=next.getFullYear();state.month=next.getMonth();render();}
    wrap.querySelector('#rutRecoveryPrev').onclick=function(){move(-1);};wrap.querySelector('#rutRecoveryNext').onclick=function(){move(1);};
    addSwipe(wrap.querySelector('.rut-dpick-real'),function(){move(1);},function(){move(-1);});
    wrap.querySelector('#rutRecoveryConfirm').onclick=function(){if(state.date)rutAdditionForm(r,key,state.date,function(){openRutRecoveryDay(r,key,state.date,back);});};
  }render();
}
function rutReadOnlyDayHtml(ds){
  if(!validIsoDate(ds))return '<p class="sy-note">Elige una fecha válida.</p>';
  var events=getEventsOn(ds).slice().sort(evCompareTime);
  var h='<div class="rut-agenda-heading"><h3>Ese día ya tienes</h3><span>'+_rutFmtCorto(ds)+'</span></div><div class="rut-day-agenda">';
  events.forEach(function(ev){
    var time=evTimeLabel(ev);
    h+='<div class="rut-agenda-item" style="--agenda-color:'+getEvDisplayColor(ev)+'"><strong>'+escHtml(ev.title||getEvType(ev))+'</strong><span>'+escHtml(time||'Todo el día')+(ev._rutSkip?' · Cancelada':'')+'</span></div>';
  });
  return h+(events.length?'':'<p class="sy-note">No hay eventos este día.</p>')+'</div>';
}
