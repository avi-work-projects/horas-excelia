function bodaOpenSheet(wrapId,ovId,html,onClose){
  return abrirPanel(wrapId,html,{overlay:ovId,alCerrar:onClose});
}
function bodaCloseSheet(wrapId,ovId){cerrarPanel(wrapId,ovId);}

/* ══ Avisos accionables (subpestaña Clases) ══
   Los recuentos son de TODO el calendario, no del mes en curso; lo unico que
   los recorta es la casilla "Ocultar pasadas". Cada tarjeta abre un panel con
   las acciones para resolver ese aviso. */
function bodaCreatedAt(c){
  if(c&&c.createdAt)return c.createdAt;
  var m=String(c&&c.id||'').match(/(\d{10,})/);
  return m?parseInt(m[1],10):0;
}
function bodaIssues(){
  var today=evDk(new Date());
  var all=bodaClasses().filter(function(ev){return !(BODA_HIDE_PAST&&ev.start<today);});
  return {
    total:all.length,
    /* Hueco = clase creada pero sin pareja (da igual si tiene hora) */
    huecos:bodaSortClasses(all.filter(function(ev){return !(ev.boda&&ev.boda.coupleId);})),
    /* Incompleta = ya tiene pareja pero le falta la hora o la sala */
    incompletas:bodaSortClasses(all.filter(function(ev){
      return ev.boda&&ev.boda.coupleId&&(!ev.boda.time||!bodaPlaceOf(ev));
    })),
    /* Parejas a las que aun les faltan clases por programar */
    pendientes:BODA_COUPLES.filter(function(c){return bodaProgress(c).falta>0;})
      .sort(function(a,b){return bodaProgress(b).falta-bodaProgress(a).falta;})
  };
}
function _renderBodaIssueCards(){
  var is=bodaIssues();
  var faltan=0;is.pendientes.forEach(function(c){faltan+=bodaProgress(c).falta;});
  function card(k,n,titulo,sub,tono){
    return '<button class="boda-issue'+(n?(' '+tono):' ok')+'" data-issue="'+k+'"'+(n?'':' disabled')+'>'
      +'<b>'+n+'</b><span>'+titulo+'</span>'
      +'<em>'+(n?sub:'todo en orden')+'</em></button>';
  }
  var h='<div class="boda-issues">';
  h+=card('huecos',is.huecos.length,'huecos sin asignar','pulsa para asignarlos o borrarlos','tono-azul');
  h+=card('pendientes',is.pendientes.length,'parejas pendientes',faltan+' clase'+(faltan===1?'':'s')+' por programar','tono-rojo');
  var _sinHora=0,_sinSala=0;
  is.incompletas.forEach(function(ev){
    if(!(ev.boda&&ev.boda.time))_sinHora++;
    if(!bodaPlaceOf(ev))_sinSala++;
  });
  var _det=[];
  if(_sinHora)_det.push(_sinHora+' sin hora');
  if(_sinSala)_det.push(_sinSala+' sin sala');
  h+=card('incompletas',is.incompletas.length,'info incompleta',_det.join(' \u00b7 '),'tono-naranja');
  h+='</div>';
  return h;
}
/* Panel de acciones de un aviso */
function openBodaIssue(kind){
  var is=bodaIssues();
  var titulos={huecos:'Huecos sin asignar',pendientes:'Parejas pendientes',incompletas:'Clases incompletas'};
  var h='<div class="ev-detail-overlay" id="bodaIssOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaIssClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">'+titulos[kind]+'</div>';
  h+='<div style="width:36px"></div></div>';
  if(kind==='pendientes'){
    if(!is.pendientes.length)h+='<div class="sy-note">Ninguna pareja pendiente.</div>';
    is.pendientes.forEach(function(c){
      var p=bodaProgress(c);
      h+='<div class="boda-iss-row">';
      h+='<span class="boda-dot" style="background:'+c.color+'"></span>';
      h+='<span class="boda-iss-main">'+escHtml(c.name)+'<em>'+p.done+' / '+p.total+'</em></span>';
      h+='<span class="boda-falta">faltan '+p.falta+'</span>';
      h+='<button class="boda-mini-btn" data-iss-assign="'+c.id+'" title="Asignar clases">&#128197;</button>';
      h+='</div>';
    });
  } else {
    var lista=(kind==='huecos')?is.huecos:is.incompletas;
    if(!lista.length)h+='<div class="sy-note">Nada pendiente aquí.</div>';
    lista.forEach(function(ev){
      var c=bodaCouple(ev.boda&&ev.boda.coupleId);
      h+='<div class="boda-iss-row">';
      h+='<span class="boda-class-mark">'+evBodaSvg(ev)+'</span>';
      var _falta=[];
      if(!(ev.boda&&ev.boda.time))_falta.push('sin hora');
      if(!bodaPlaceOf(ev))_falta.push('sin sala');
      h+='<span class="boda-iss-main">'+_bodaFmtCorto(ev.start)
        +'<em>'+(c?escHtml(c.name):'sin pareja')
        +(_falta.length?(' \u00b7 <b class="boda-falta">'+_falta.join(' y ')+'</b>'):'')+'</em></span>';
      if(kind==='huecos')h+='<button class="boda-mini-btn" data-iss-couple="'+ev.id+'" title="Asignar pareja">&#128101;</button>';
      if(!(ev.boda&&ev.boda.time))h+='<button class="boda-mini-btn" data-iss-time="'+ev.id+'" title="Poner hora">&#128337;</button>';
      if(!bodaPlaceOf(ev))h+='<button class="boda-mini-btn" data-iss-place="'+ev.id+'" title="Poner sala">&#127968;</button>';
      h+='<button class="boda-mini-btn" data-iss-del="'+ev.id+'" title="Borrar clase">&#215;</button>';
      h+='</div>';
    });
  }
  h+='</div></div>';
  bodaOpenSheet('bodaIssWrap','bodaIssOv',h,closeBodaIssue);
  function findEv(id){for(var i=0;i<EVENTS.length;i++)if(EVENTS[i].id===id)return EVENTS[i];return null;}
  document.getElementById('bodaIssClose').addEventListener('click',closeBodaIssue);
  document.querySelectorAll('[data-iss-assign]').forEach(function(b){
    b.addEventListener('click',function(){
      var c=bodaCouple(b.dataset.issAssign);
      closeBodaIssue();setTimeout(function(){openBodaAssign(c,false);},310);
    });
  });
  document.querySelectorAll('[data-iss-couple]').forEach(function(b){
    b.addEventListener('click',function(){
      var ev=findEv(b.dataset.issCouple);
      closeBodaIssue();setTimeout(function(){openBodaCouplePicker(ev);},310);
    });
  });
  document.querySelectorAll('[data-iss-place]').forEach(function(b){
    b.addEventListener('click',function(){
      var ev=findEv(b.dataset.issPlace);
      closeBodaIssue();setTimeout(function(){openBodaPlacePicker(ev);},310);
    });
  });
  document.querySelectorAll('[data-iss-time]').forEach(function(b){
    b.addEventListener('click',function(){
      var ev=findEv(b.dataset.issTime);
      closeBodaIssue();setTimeout(function(){openBodaTimePicker(ev);},310);
    });
  });
  document.querySelectorAll('[data-iss-del]').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.dataset.issDel,removed=null;
      EVENTS=EVENTS.filter(function(e){if(e.id===id){removed=e;return false;}return true;});
      saveEvents();
      closeBodaIssue();
      setTimeout(function(){refreshEvents();},310);
      showToast('Clase eliminada','success',function(){
        if(removed){EVENTS.push(removed);saveEvents();refreshEvents();}
      });
    });
  });
}
function closeBodaIssue(){bodaCloseSheet('bodaIssWrap','bodaIssOv');}

/* ══ Subpestaña ESTADÍSTICAS ══ */
function _bodaWeekKey(d){
  /* Lunes de la semana de d, como YYYY-MM-DD */
  var x=new Date(d.getTime());
  var off=(x.getDay()===0?6:x.getDay()-1);
  x.setDate(x.getDate()-off);
  return evDk(x);
}
function _renderBodaStats(){
  var todayDs=evDk(new Date());
  var all=bodaSortClasses(bodaClasses());
  if(!all.length)return '<div class="sy-note">Todavía no hay clases registradas.</div>';
  var dadas=all.filter(function(ev){return ev.start<todayDs;});
  var proximas=all.filter(function(ev){return ev.start>=todayDs;});
  /* Reparto por mes (ultimos 12 meses hasta hoy) */
  var hoy=new Date();
  var meses=[],mLabels=[],mVals=[];
  for(var i=11;i>=0;i--){
    var d=new Date(hoy.getFullYear(),hoy.getMonth()-i,1);
    var key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    meses.push(key);mLabels.push(MN_SHORT[d.getMonth()]);
    mVals.push(all.filter(function(ev){return ev.start.indexOf(key)===0;}).length);
  }
  /* Reparto por semana (ultimas 10 semanas) */
  var wLabels=[],wVals=[];
  for(var w=9;w>=0;w--){
    var wd=new Date(hoy.getTime());wd.setDate(wd.getDate()-w*7);
    var wk=_bodaWeekKey(wd);
    wLabels.push(wk.slice(8)+'/'+wk.slice(5,7));
    wVals.push(all.filter(function(ev){return _bodaWeekKey(new Date(ev.start+'T00:00:00'))===wk;}).length);
  }
  /* Medias sobre el periodo real con clases */
  var primera=all[0].start, ultima=all[all.length-1].start;
  var dias=Math.max(1,Math.round((new Date(ultima+'T00:00:00')-new Date(primera+'T00:00:00'))/86400000)+1);
  var mediaSem=(all.length/(dias/7)), mediaMes=(all.length/(dias/30.44));
  /* Reparto por pareja, franja, lugar y dia de la semana */
  var porPareja=BODA_COUPLES.map(function(c){
    return {label:c.name,value:bodaClassesOfCouple(c.id).length,color:c.color};
  }).filter(function(r){return r.value>0;}).sort(function(a,b){return b.value-a.value;});
  var sinP=all.filter(function(ev){return !(ev.boda&&ev.boda.coupleId);}).length;
  if(sinP)porPareja.push({label:'sin asignar',value:sinP,color:BODA_NO_COUPLE_COLOR});
  var porFranja=BODA_SLOTS.map(function(sl){
    return {label:sl.label,color:sl.right,
      value:all.filter(function(ev){var s2=bodaSlot(ev.boda&&ev.boda.time);return s2&&s2.label===sl.label;}).length};
  }).filter(function(r){return r.value>0;});
  var porLugar=BODA_PLACE_LIST.map(function(pl){
    return {label:pl.n,value:all.filter(function(ev){return bodaPlaceOf(ev)===pl.k;}).length};
  }).filter(function(r){return r.value>0;});
  var DN2=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  var porDia=DN2.map(function(n,idx){
    return {label:n,value:all.filter(function(ev){
      var wd2=new Date(ev.start+'T00:00:00').getDay();
      return (wd2===0?6:wd2-1)===idx;}).length};
  }).filter(function(r){return r.value>0;});

  var h='';
  h+='<div class="boda-stats-row">';
  h+='<div class="boda-stat"><b>'+dadas.length+'</b><span>dadas</span></div>';
  h+='<div class="boda-stat"><b>'+proximas.length+'</b><span>próximas</span></div>';
  h+='<div class="boda-stat"><b>'+all.length+'</b><span>total</span></div>';
  h+='</div>';
  h+='<div class="boda-stats-row">';
  h+='<div class="boda-stat"><b>'+mediaSem.toFixed(1)+'</b><span>por semana</span></div>';
  h+='<div class="boda-stat"><b>'+mediaMes.toFixed(1)+'</b><span>por mes</span></div>';
  h+='<div class="boda-stat"><b>'+BODA_COUPLES.length+'</b><span>parejas</span></div>';
  h+='</div>';
  h+='<div class="boda-stat-note">Desde el '+_bodaFmt(primera)+' hasta el '+_bodaFmt(ultima)+'</div>';
  h+='<div class="boda-stat-t">Clases por mes <em>(últimos 12)</em></div>';
  h+='<div class="sy-chart">'+simpleBarChart(mVals,mLabels,'#c08a5a',{highlight:11})+'</div>';
  h+='<div class="boda-stat-t">Clases por semana <em>(últimas 10)</em></div>';
  h+='<div class="sy-chart">'+simpleBarChart(wVals,wLabels,'#e879a8',{highlight:9})+'</div>';
  if(porPareja.length){
    h+='<div class="boda-stat-t">Por pareja</div>'+hBarRows(porPareja);
  }
  if(porFranja.length){
    h+='<div class="boda-stat-t">Por franja horaria</div>'+hBarRows(porFranja);
  }
  if(porDia.length){
    h+='<div class="boda-stat-t">Por día de la semana</div>'+hBarRows(porDia,{});
  }
  if(porLugar.length){
    h+='<div class="boda-stat-t">Por lugar</div>'+hBarRows(porLugar,{});
  }
  return h;
}

/* ══ Modal: detalle de pareja (días y horas asignados) ══ */
/* El detalle de una pareja ya no es un modal: se despliega dentro de su
   tarjeta en la subpestana Parejas (ver _renderBodaParejas). */

/* ══ Modal: calendario de asignación ══
   - Días con clase YA de esta pareja: marcados (y fijos si extraMode)
   - Días con clase libre (sin pareja): resaltados como "disponibles"
   - Modo "Todos los días": permite marcar cualquier día (crea clase nueva)
   - El día de la boda se marca con 💍 */
var BODA_ASSIGN = null;   /* {couple, extra, year, month, sel:{ds:true}, fixed:{ds:true}} */
function openBodaAssign(couple,extraMode){
  if(!couple)return;
  var now=new Date();
  var refDs=null;
  var cls=bodaClassesOfCouple(couple.id);
  if(cls.length)refDs=cls[0].start;
  else{var libres=bodaFreeClasses();if(libres.length)refDs=libres[0].start;}
  var y=refDs?parseInt(refDs.slice(0,4),10):now.getFullYear();
  var m=refDs?parseInt(refDs.slice(5,7),10)-1:now.getMonth();
  BODA_ASSIGN={couple:couple,extra:!!extraMode,year:y,month:m,open:false,sel:{},fixed:{}};
  /* Las clases que ya tiene salen marcadas; en modo "clase extra" quedan fijas */
  cls.forEach(function(ev){
    BODA_ASSIGN.sel[ev.start]=(BODA_ASSIGN.sel[ev.start]||0)+1;
    if(extraMode)BODA_ASSIGN.fixed[ev.start]=true;
  });
  bodaOpenSheet('bodaAsgWrap','bodaAsgOv',
    '<div class="ev-detail-overlay" id="bodaAsgOv"><div class="ev-detail-sheet" id="bodaAsgSheet"></div></div>',
    closeBodaAssign);
  renderBodaAssign();
}
function closeBodaAssign(){
  bodaCloseSheet('bodaAsgWrap','bodaAsgOv');
  setTimeout(function(){BODA_ASSIGN=null;},300);
}
function renderBodaAssign(){
  var A=BODA_ASSIGN;if(!A)return;
  var sheet=document.getElementById('bodaAsgSheet');if(!sheet)return;
  var c=A.couple;
  var libres={},mias={},ajenas={};
  bodaClasses().forEach(function(ev){
    var cid=ev.boda&&ev.boda.coupleId;
    if(!cid)libres[ev.start]=(libres[ev.start]||0)+1;
    else if(cid===c.id)mias[ev.start]=(mias[ev.start]||0)+1;
    else ajenas[ev.start]=(ajenas[ev.start]||0)+1;
  });
  var nSel=0;Object.keys(A.sel).forEach(function(k){nSel+=A.sel[k];});
  var p=bodaProgress(c);
  var h='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaAsgClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center;color:'+c.color+'">'
    +(A.extra?'Clase extra — ':'Asignar clases — ')+escHtml(c.name)+'</div>';
  h+='<div style="width:36px"></div></div>';
  h+='<div class="boda-asg-info"><b>'+nSel+'</b> / '+p.total+' clases'
    +(c.weddingDate?(' · boda el <b>'+_bodaFmt(c.weddingDate)+'</b>'):'')+'</div>';
  /* Conmutador: solo dias de ensayo / todos los dias */
  h+='<div class="boda-mode-row">';
  h+='<button class="boda-mode-btn'+(A.open?'':' active')+'" data-asgmode="ensayo">Días de ensayo</button>';
  h+='<button class="boda-mode-btn'+(A.open?' active':'')+'" data-asgmode="abierto">Todos los días</button>';
  h+='</div>';
  /* Navegacion de mes */
  h+='<div class="boda-asg-nav">';
  h+='<button class="sy-nav" id="bodaAsgPrev">&#9664;</button>';
  h+='<div class="boda-asg-month">'+MN[A.month]+' '+A.year+'</div>';
  h+='<button class="sy-nav" id="bodaAsgNext">&#9654;</button>';
  h+='</div>';
  /* Rejilla */
  h+='<div class="boda-asg-grid-hdr">';
  ['L','M','X','J','V','S','D'].forEach(function(d){h+='<div>'+d+'</div>';});
  h+='</div><div class="boda-asg-grid">';
  var first=new Date(A.year,A.month,1);
  var dow=first.getDay();var off=dow===0?6:dow-1;
  var cur=new Date(first);cur.setDate(cur.getDate()-off);
  var last=new Date(A.year,A.month+1,0);
  var todayDs=evDk(new Date());
  while(cur<=last||cur.getDay()!==1){
    var ds=evDk(cur);
    var inM=cur.getMonth()===A.month;
    var cls2='boda-asg-day';
    if(!inM)cls2+=' out';
    var selN=A.sel[ds]||0;
    var isFixed=!!A.fixed[ds];
    var hasLibre=!!libres[ds];
    var hasAjena=!!ajenas[ds];
    var isWed=c.weddingDate===ds;
    if(selN)cls2+=' sel';
    if(isFixed)cls2+=' fixed';
    if(hasLibre&&!selN)cls2+=' libre';
    if(hasAjena&&!selN)cls2+=' ajena';
    if(ds===todayDs)cls2+=' hoy';
    if(isWed)cls2+=' wedding';
    /* Seleccionable: hay clase libre ese dia, o ya es mia, o estamos en modo abierto */
    var pick=inM&&(hasLibre||selN||A.open);
    if(!pick)cls2+=' off';
    var sty=selN?' style="background:'+c.color+'33;border-color:'+c.color+'"':'';
    h+='<div class="'+cls2+'"'+(pick?' data-ds="'+ds+'"':'')+sty+'>';
    h+='<span class="boda-asg-num">'+cur.getDate()+'</span>';
    if(selN>1)h+='<span class="boda-asg-badge" style="background:'+c.color+'">'+selN+'</span>';
    else if(selN)h+='<span class="boda-asg-tick" style="color:'+c.color+'">&#10003;</span>';
    else if(hasLibre)h+='<span class="boda-asg-free">'+libres[ds]+'</span>';
    if(isWed)h+='<span class="boda-asg-wed">&#128141;</span>';
    h+='</div>';
    cur.setDate(cur.getDate()+1);
  }
  h+='</div>';
  h+='<div class="boda-asg-legend">'
    +'<span><i class="lg-libre"></i>día de ensayo libre</span>'
    +'<span><i class="lg-sel" style="background:'+c.color+'"></i>de esta pareja</span>'
    +'<span><i class="lg-ajena"></i>de otra pareja</span></div>';
  h+='<div class="ev-detail-actions">';
  h+='<button class="ev-btn primary" id="bodaAsgSave">Guardar</button>';
  h+='</div>';
  sheet.innerHTML=h;
  bindBodaAssign();
}
function bindBodaAssign(){
  var A=BODA_ASSIGN;if(!A)return;
  document.getElementById('bodaAsgClose').addEventListener('click',closeBodaAssign);
  document.getElementById('bodaAsgPrev').addEventListener('click',function(){
    A.month--;if(A.month<0){A.month=11;A.year--;}renderBodaAssign();
  });
  document.getElementById('bodaAsgNext').addEventListener('click',function(){
    A.month++;if(A.month>11){A.month=0;A.year++;}renderBodaAssign();
  });
  document.querySelectorAll('.boda-mode-btn[data-asgmode]').forEach(function(b){
    b.addEventListener('click',function(){A.open=(b.dataset.asgmode==='abierto');renderBodaAssign();});
  });
  /* Deslizar sobre la rejilla para cambiar de mes */
  var _ag=document.querySelector('.boda-asg-grid');
  if(_ag&&typeof addSwipe==='function')addSwipe(_ag,
    function(){A.month++;if(A.month>11){A.month=0;A.year++;}renderBodaAssign();},
    function(){A.month--;if(A.month<0){A.month=11;A.year--;}renderBodaAssign();});
  document.querySelectorAll('.boda-asg-day[data-ds]').forEach(function(d){
    d.addEventListener('click',function(){
      var ds=d.dataset.ds;
      if(A.fixed[ds]){showToast('Esa clase ya estaba fijada','error');return;}
      if(A.sel[ds])delete A.sel[ds];
      else{
        if(bodaDayFull(ds)){showToast('Ese día ya tiene '+EV_MAX_PUNT_DIA+' eventos puntuales (el máximo)','error');return;}
        A.sel[ds]=1;
      }
      renderBodaAssign();
    });
  });
  document.getElementById('bodaAsgSave').addEventListener('click',function(){
    var c=A.couple;
    var mias=bodaClassesOfCouple(c.id);
    var libres=bodaFreeClasses();
    var nuevas=0,asignadas=0,soltadas=0;
    /* 1) Desasignar las que ya no estan seleccionadas */
    mias.forEach(function(ev){
      if(!A.sel[ev.start]){ev.boda.coupleId=null;ev.title='Ensayo boda';soltadas++;}
    });
    /* 2) Asignar / crear las seleccionadas */
    Object.keys(A.sel).forEach(function(ds){
      var yaMia=mias.some(function(ev){return ev.start===ds&&ev.boda.coupleId===c.id;});
      if(yaMia)return;
      var libre=null;
      for(var i=0;i<libres.length;i++){
        if(libres[i].start===ds&&!libres[i].boda.coupleId){libre=libres[i];break;}
      }
      if(libre){
        libre.boda.coupleId=c.id;
        if(!libre.boda.time)libre.boda.time=BODA_DEFAULT_TIME;
        libre.title='Ensayo — '+c.name;
        asignadas++;
      }else{
        if(bodaDayFull(ds))return;
        EVENTS.push(bodaNewClass(ds,BODA_DEFAULT_TIME,c.id,bodaPlaceForNewOn(ds)));
        nuevas++;
      }
    });
    saveEvents();updateEventsBtn();
    closeBodaAssign();
    setTimeout(function(){refreshEvents();},310);
    var partes=[];
    if(asignadas)partes.push(asignadas+' asignada'+(asignadas>1?'s':''));
    if(nuevas)partes.push(nuevas+' nueva'+(nuevas>1?'s':''));
    if(soltadas)partes.push(soltadas+' liberada'+(soltadas>1?'s':''));
    showToast(partes.length?('Clases: '+partes.join(', ')):'Sin cambios','success');
  });
}

/* ══ Modal: selector de sala para una clase ══ */
function openBodaPlacePicker(ev,opts){
  if(!ev)return;
  var cur=bodaPlaceOf(ev);
  var h='<div class="ev-detail-overlay" id="bodaPpkOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaPpkClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">Sala'
    +(ev.start?(' — '+_bodaFmtCorto(ev.start)):'')+'</div>';
  h+='<div style="width:36px"></div></div>';
  BODA_PLACE_LIST.forEach(function(p){
    h+='<button class="boda-cpk-row'+(cur===p.k?' sel':'')+'" data-place="'+p.k+'">'
      +'<span class="boda-cpk-name">'+escHtml(p.n)+'</span>'
      +'<span class="boda-cpk-desc">'+escHtml(p.d)+'</span></button>';
  });
  h+='<button class="boda-cpk-row'+(cur?'':' sel')+'" data-place="">'
    +'<span class="boda-cpk-name">Sin sala</span>'
    +'<span class="boda-cpk-desc">todavía por decidir</span></button>';
  h+='</div></div>';
  bodaOpenSheet('bodaPpkWrap','bodaPpkOv',h,closeBodaPlacePicker);
  document.getElementById('bodaPpkClose').addEventListener('click',closeBodaPlacePicker);
  document.querySelectorAll('#bodaPpkOv [data-place]').forEach(function(b){
    b.addEventListener('click',function(){
      /* Igual que la hora y la pareja: en la pestana Bodas queda pendiente
         hasta pulsar Guardar, y desde la ficha del dia se guarda ya. Antes
         esta escribia siempre directa, asi que "Descartar" no deshacia un
         cambio de sala. */
      bodaAplicarCampo(ev,'place',b.dataset.place,opts);
      closeBodaPlacePicker();
      bodaTrasElegir(ev,opts);
    });
  });
}
function closeBodaPlacePicker(){bodaCloseSheet('bodaPpkWrap','bodaPpkOv');}

/* Guardar un dato de una clase: en la pestana Bodas queda pendiente hasta
   pulsar Guardar; desde la ficha del dia (opts.directo) se guarda ya. */
function bodaAplicarCampo(ev,campo,valor,opts){
  if(opts&&opts.directo){
    ev.boda=ev.boda||{};
    ev.boda[campo]=valor;
    saveEvents();
    return true;
  }
  bodaSetPending(ev.id,campo,valor);
  return false;
}
function bodaTrasElegir(ev,opts){
  if(opts&&opts.directo){
    setTimeout(function(){
      refreshEvents();
      if(opts.alGuardar)opts.alGuardar();
    },310);
  } else {
    setTimeout(function(){bodaRefreshRow(ev);},310);
  }
}

/* Las clases de boda duran una hora fija */
function _bodaMasUnaHora(t){
  var p=String(t||'00:00').split(':');
  var m=((parseInt(p[0],10)||0)*60+(parseInt(p[1],10)||0)+60)%1440;
  return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
}
/* ══ Ficha de UNA clase: dia, hora, pareja y sala ══════════════════
   Un solo sitio para crear una clase o cambiarla, se llegue desde donde se
   llegue (Consulta, la pareja desplegada, o el boton de anadir). Los tres
   selectores son los mismos que usa el resto de la app; se les pasa un evento
   de mentira mientras la ficha esta abierta y solo al guardar se toca el de
   verdad. */
