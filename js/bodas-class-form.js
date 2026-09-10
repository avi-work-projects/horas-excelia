var BODA_FORM = null;   /* {ev, tmp, nuevo, alTerminar} */
function openBodaClaseForm(ev,alTerminar){
  var nuevo=!ev;
  var base=ev?bodaEff(ev):{};
  BODA_FORM={
    ev:ev||null, nuevo:nuevo, alTerminar:alTerminar||null,
    ds:ev?ev.start:evDk(new Date()),
    /* start: los selectores rotulan con el dia del evento; sin el salia
       "Sala — undefined NaN/NaN". Se mantiene al dia desde el campo de fecha. */
    tmp:{id:'__boda_tmp__', start:ev?ev.start:evDk(new Date()), boda:{
      teachers:JSON.parse(JSON.stringify((ev&&ev.boda&&ev.boda.teachers)||{celia:true,angel:true,substitute:null})),
      duration:nuevo?bodaDefaultDuration().minutes:bodaDuration(ev),
      durationId:nuevo?bodaDefaultDuration().id:((bodaDurationOf(ev)||{}).id||null),
      time:nuevo?null:(base.time||null),
      coupleId:nuevo?null:(base.coupleId||null),
      place:nuevo?bodaPlaceForNewOn(evDk(new Date())):(base.place===undefined?BODA_PLACE_DEFAULT:base.place)
    }}
  };
  var count=bodaTeacherCount(BODA_FORM.tmp.boda.teachers);if(count<1||count>2)BODA_FORM.tmp.boda.teachers={celia:true,angel:true,substitute:null};
  _bodaFormRender();
}
function _bodaFormRender(){
  var F=BODA_FORM;if(!F)return;
  var b=F.tmp.boda;
  var c=bodaCouple(b.coupleId);
  var pl=b.place;
  var h='<div class="ev-detail-overlay" id="bodaFormOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">';
  h+='<button class="sy-back" id="bodaFormClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'
    +(F.nuevo?'Nueva clase':'Editar clase')+'</div>';
  h+='<div style="width:36px"></div></div>';
  var _multi=(F.dates&&F.dates.length)?F.dates.slice().sort():null;
  h+='<div class="ev-field"><label>\ud83d\udcc5 Día del ensayo</label>';
  h+='<div class="boda-dia-row">';
  h+='<input class="ev-input" id="bodaFormDia" type="date" value="'+F.ds+'"'+(_multi?' disabled':'')+'>';
  if(F.nuevo)h+='<button type="button" class="boda-multi-btn'+(_multi?' on':'')+'" id="bodaFormMulti">'
    +(_multi?(_multi.length+' días'):'Varios días')+'</button>';
  h+='</div>';
  if(_multi){
    h+='<div class="boda-multi-lista">'+_multi.map(function(d){return _bodaFmtCorto(d);}).join(' \u00b7 ')
      +' <button type="button" class="boda-multi-x" id="bodaFormMultiX">quitar</button></div>';
  }
  h+='</div>';
  h+='<div class="ev-bficha">';
  h+='<button type="button" class="ev-bfila'+(b.time?'':' warn')+'" data-fcampo="hora">'
    +'<span class="ev-bfila-lbl">\ud83d\udd52 Hora</span>'
    +'<span class="ev-bfila-val">'+(b.time?(b.time+' \u2013 '+bodaEndAt(b.time,b.duration)):'\u26a0 Sin asignar')+'</span>'
    +'</button>';
  h+='<button type="button" class="ev-bfila'+(pl?'':' warn')+'" data-fcampo="sala">'
    +'<span class="ev-bfila-lbl">'+(pl?bodaPlaceEmoji(pl):'\ud83c\udfe0')+' Sala</span>'
    +'<span class="ev-bfila-val">'+(pl?escHtml(BODA_PLACE_SHORT[pl]):'\u26a0 Sin asignar')+'</span>'
    +'</button>';
  h+='<button type="button" class="ev-bfila'+(c?'':' warn')+'" data-fcampo="pareja">'
    +'<span class="ev-bfila-lbl">\ud83d\udc8d Pareja</span>'
    +'<span class="ev-bfila-val">'
    +(c?('<span class="ev-bpunto" style="background:'+c.color+'"></span>'+escHtml(c.name)):'\u26a0 Sin asignar')
    +'</span></button>';
  var teachers=b.teachers;
  h+='<div class="ev-bfila boda-field-row"><span class="ev-bfila-lbl">Profesores</span><div class="boda-field-controls"><div class="boda-teachers excl-row">';
  [['celia','Celia'],['angel','Ángel'],['substitute','Sustituto']].forEach(function(t){h+='<label class="excl-item"><input type="checkbox" data-teacher="'+t[0]+'"'+((t[0]==='substitute'?teachers.substitute!=null:teachers[t[0]])?' checked':'')+'> '+t[1]+'</label>';});
  h+='</div><input class="ev-input" id="bodaTeacherName" maxlength="80" placeholder="Nombre del sustituto" aria-label="Nombre del sustituto" value="'+escHtml(teachers.substitute||'')+'"'+(teachers.substitute!=null?'':' hidden')+'></div></div>';
  h+='<button type="button" class="ev-bfila" id="bodaFormDuration"><span class="ev-bfila-lbl">Duración</span><span class="ev-bfila-val">'+b.duration+' min</span></button></div>';
  h+='<div class="ev-detail-actions">';
  if(!F.nuevo)h+='<button class="ev-btn danger" id="bodaFormDel">Eliminar</button>';
  h+='<button class="ev-btn primary" id="bodaFormSave">Guardar</button>';
  h+='</div>';
  h+='</div></div>';
  bodaOpenSheet('bodaFormWrap','bodaFormOv',h,closeBodaClaseForm);
  document.getElementById('bodaFormClose').addEventListener('click',closeBodaClaseForm);
  var dia=document.getElementById('bodaFormDia');
  document.querySelectorAll('[data-teacher]').forEach(function(input){input.onchange=function(){
    var k=input.dataset.teacher,next=Object.assign({},teachers),name=document.getElementById('bodaTeacherName');
    next[k]=k==='substitute'?(input.checked?name.value:null):input.checked;
    var count=bodaTeacherCount(next);if(count<1||count>2){input.checked=!input.checked;showToast(count<1?'Debe haber al menos un profesor':'Como máximo pueden ir dos profesores','error');return;}
    teachers[k]=next[k];if(k==='substitute')name.hidden=!input.checked;
  };});
  document.getElementById('bodaTeacherName').oninput=function(){teachers.substitute=this.value;};

  document.getElementById('bodaFormDuration').onclick=function(){F.ds=dia.value||F.ds;openBodaDurationPicker();};
  dia.addEventListener('change',function(){F.ds=this.value||F.ds;F.tmp.start=F.ds;});
  /* Multidia: el mismo selector que usa la categoria "Otros" del formulario
     de eventos. Solo al crear; cambiar una clase existente sigue siendo un dia. */
  var _mb=document.getElementById('bodaFormMulti');
  if(_mb)_mb.addEventListener('click',function(){
    F.ds=dia.value||F.ds;
    /* En blanco a proposito: con el dia de hoy ya marcado, aceptar sin mirar
       creaba una clase de hoy que nadie habia pedido. */
    var ini=(F.dates&&F.dates.length)?F.dates.slice():[];
    var cc=bodaCouple(F.tmp.boda.coupleId);
    openOtrosDatePicker(ini,(cc&&cc.color)||EV_TYPE_COLORS['puntual|Ensayos boda'],
      parseInt(F.ds.slice(0,4),10),function(sel){
        F.dates=(sel&&sel.length>1)?sel.slice().sort():null;
        if(sel&&sel.length===1)F.ds=sel[0];
        _bodaFormRender();
      });
  });
  var _mx=document.getElementById('bodaFormMultiX');
  if(_mx)_mx.addEventListener('click',function(){F.dates=null;_bodaFormRender();});
  document.querySelectorAll('#bodaFormOv .ev-bfila[data-fcampo]').forEach(function(fila){
    fila.addEventListener('click',function(){
      F.ds=dia.value||F.ds;                      /* no perder la fecha tecleada */
      F.tmp.start=F.ds;
      var opts={directo:true,alGuardar:_bodaFormRender};
      var campo=fila.dataset.fcampo;
      if(campo==='hora')openBodaTimePicker(F.tmp,opts);
      else if(campo==='sala')openBodaPlacePicker(F.tmp,opts);
      else openBodaCouplePicker(F.tmp,opts);
    });
  });
  var del=document.getElementById('bodaFormDel');
  if(del)del.addEventListener('click',function(){
    var quitada=F.ev;
    EVENTS=EVENTS.filter(function(e){return e.id!==quitada.id;});
    saveEvents();closeBodaClaseForm();
    setTimeout(function(){
      refreshEvents();
      showToast('Clase eliminada','success',function(){
        EVENTS.push(quitada);saveEvents();refreshEvents();
      });
    },310);
  });
  document.getElementById('bodaFormSave').addEventListener('click',function(){
    var ds=document.getElementById('bodaFormDia').value||F.ds;
    var b2=F.tmp.boda;
    if(bodaTeacherCount(b2.teachers)<1||bodaTeacherCount(b2.teachers)>2){showToast('Selecciona uno o dos profesores','error');return;}
    if(F.nuevo){
      /* Una clase por dia. El tope se mira dia a dia: si alguno esta lleno se
         crean los demas y se dice cuales se han quedado fuera, que es mas util
         que abortarlo todo por culpa de un dia. */
      var dias=(F.dates&&F.dates.length)?F.dates.slice().sort():[ds];
      var hechas=0,llenos=[];
      dias.forEach(function(d){
        if(bodaDayFull(d)){llenos.push(_bodaFmtCorto(d));return;}
        var created=bodaNewClass(d,b2.time,b2.coupleId,b2.place,b2.duration,b2.durationId);created.boda.teachers=JSON.parse(JSON.stringify(b2.teachers));EVENTS.push(created);
        hechas++;
      });
      if(!hechas){
        showToast(dias.length>1?('Ningún día admite más clases (máximo '+EV_MAX_PUNT_DIA+' por día)')
          :('El '+_bodaFmt(ds)+' ya tiene '+EV_MAX_PUNT_DIA+' eventos puntuales (el máximo)'),'error');
        return;
      }
      F._creadas=hechas;F._llenos=llenos;
    } else {
      var ev=F.ev;
      ev.start=ds;ev.end=ds;
      ev.boda=ev.boda||{};
      ev.boda.teachers=JSON.parse(JSON.stringify(b2.teachers));
      ev.boda.duration=b2.duration;ev.boda.durationId=b2.durationId;ev.boda.time=b2.time;ev.boda.coupleId=b2.coupleId;ev.boda.place=b2.place;
      var cc=bodaCouple(b2.coupleId);
      ev.title=cc?('Ensayo — '+cc.name):'Ensayo boda';
      if(typeof BODA_PENDING!=='undefined'&&BODA_PENDING[ev.id])delete BODA_PENDING[ev.id];
    }
    saveEvents();
    var terminar=F.alTerminar, _n=F.nuevo?(F._creadas||0):0, _ll=F._llenos||[];
    closeBodaClaseForm();
    setTimeout(function(){
      refreshEvents();
      if(terminar)terminar();
      if(!_n)showToast('Clase actualizada','success');
      else if(_n===1&&!_ll.length)showToast('Clase creada','success');
      else showToast(_n+' clases creadas'+(_ll.length?(' \u00b7 sin sitio el '+_ll.join(', ')):''),
        _ll.length?'error':'success');
    },310);
  });
}
function closeBodaClaseForm(){
  bodaCloseSheet('bodaFormWrap','bodaFormOv');
  var closing=BODA_FORM;
  setTimeout(function(){if(BODA_FORM===closing)BODA_FORM=null;},320);
}

/* ══ Modal: selector de pareja para una clase ══ */
function openBodaCouplePicker(ev,opts){
  var cur=(typeof bodaEff==='function'?bodaEff(ev).coupleId:(ev.boda&&ev.boda.coupleId))||null;
  var h='<div class="ev-detail-overlay" id="bodaCpkOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaCpkClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">Pareja'
    +(ev.start?(' — '+_bodaFmtCorto(ev.start)):'')+'</div>';
  h+='<div style="width:36px"></div></div>';
  var incompletas=BODA_COUPLES.filter(function(c){return bodaProgress(c).falta>0;});
  var completas=BODA_COUPLES.filter(function(c){return bodaProgress(c).falta<=0;});
  function row(c,extra){
    var p=bodaProgress(c);
    return '<button class="boda-cpk-row'+(cur===c.id?' sel':'')+'" data-cid="'+c.id+'">'
      +'<span class="boda-dot" style="background:'+c.color+'"></span>'
      +'<span class="boda-cpk-name">'+escHtml(c.name)+'</span>'
      +'<span class="boda-cpk-n">'+p.done+'/'+p.total+(extra?' · extra':'')+'</span></button>';
  }
  h+='<div class="boda-cpk-t">Con clases por asignar</div>';
  if(!incompletas.length)h+='<div class="sy-note">Ninguna pareja pendiente.</div>';
  incompletas.forEach(function(c){h+=row(c,false);});
  if(completas.length){
    h+='<div class="boda-cpk-t">Ya completas <span>(asignarles aquí cuenta como clase extra)</span></div>';
    completas.forEach(function(c){h+=row(c,true);});
  }
  h+='<div class="ev-detail-actions"><button class="ev-btn" id="bodaCpkNone">Dejar sin asignar</button></div>';
  h+='</div></div>';
  bodaOpenSheet('bodaCpkWrap','bodaCpkOv',h,closeBodaCouplePicker);
  function apply(cid){
    /* Queda pendiente hasta que se pulse Guardar (asi no se re-renderiza
       la lista entera y no se pierde el scroll) */
    bodaAplicarCampo(ev,'coupleId',cid,opts);
    if(cid&&!bodaEff(ev).time)bodaAplicarCampo(ev,'time',BODA_DEFAULT_TIME,opts);
    closeBodaCouplePicker();
    bodaTrasElegir(ev,opts);
  }
  document.getElementById('bodaCpkClose').addEventListener('click',closeBodaCouplePicker);
  document.getElementById('bodaCpkNone').addEventListener('click',function(){apply(null);});
  document.querySelectorAll('.boda-cpk-row[data-cid]').forEach(function(b){
    b.addEventListener('click',function(){apply(b.dataset.cid);});
  });
}
function closeBodaCouplePicker(){bodaCloseSheet('bodaCpkWrap','bodaCpkOv');}

/* ══ Modal: hora (ruedas de horas y minutos + entrada manual) ══ */
var BODA_TIME_H = 18, BODA_TIME_M = 0;
var _BODA_HOURS=[],_BODA_MINS=[0,15,30,45];
(function(){for(var i=7;i<=23;i++)_BODA_HOURS.push(i);})();
function openBodaTimePicker(ev,opts){
  var t=(typeof bodaEff==='function'?bodaEff(ev).time:(ev.boda&&ev.boda.time))||BODA_DEFAULT_TIME;
  BODA_TIME_H=parseInt(t.slice(0,2),10);BODA_TIME_M=parseInt(t.slice(3,5),10);
  if(isNaN(BODA_TIME_H))BODA_TIME_H=18;
  if(isNaN(BODA_TIME_M))BODA_TIME_M=0;
  function drum(id,vals,sel){
    var s='<div class="drum-wrap"><div class="drum-picker boda-drum" id="'+id+'">';
    s+='<div style="height:44px"></div>';
    vals.forEach(function(v){s+='<div class="drum-picker-item" data-val="'+v+'">'+String(v).padStart(2,'0')+'</div>';});
    s+='<div style="height:44px"></div></div><div class="drum-sel-lines"></div></div>';
    return s;
  }
  var h='<div class="ev-detail-overlay" id="bodaTpOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="bodaTpClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center">Hora de la clase</div>';
  h+='<div style="width:36px"></div></div>';
  h+='<div class="boda-tp-drums">'+drum('bodaTpH',_BODA_HOURS)+'<span class="boda-tp-sep">:</span>'+drum('bodaTpM',_BODA_MINS)+'</div>';
  h+='<div class="boda-tp-manual"><span>o escríbela:</span>';
  h+='<input type="number" id="bodaTpHi" min="0" max="23" value="'+BODA_TIME_H+'">';
  h+='<b>:</b><input type="number" id="bodaTpMi" min="0" max="59" step="15" value="'+String(BODA_TIME_M).padStart(2,'0')+'"></div>';
  h+='<div class="ev-detail-actions">';
  h+='<button class="ev-btn" id="bodaTpNone">Sin hora</button>';
  h+='<button class="ev-btn primary" id="bodaTpSave">Guardar</button>';
  h+='</div></div></div>';
  bodaOpenSheet('bodaTpWrap','bodaTpOv',h,closeBodaTimePicker);
  var IH=44;
  function setDrum(id,vals,val){
    var d=document.getElementById(id);if(!d)return;
    var i=vals.indexOf(val);if(i<0)i=0;
    d.scrollTop=i*IH;mark(d);
  }
  function mark(d){
    var idx=Math.round(d.scrollTop/IH);
    d.querySelectorAll('.drum-picker-item').forEach(function(it,j){it.classList.toggle('drum-selected',j===idx);});
  }
  function drumVal(id,vals){
    var d=document.getElementById(id);if(!d)return vals[0];
    return vals[Math.max(0,Math.min(vals.length-1,Math.round(d.scrollTop/IH)))];
  }
  ['bodaTpH','bodaTpM'].forEach(function(id){
    var d=document.getElementById(id);
    d.addEventListener('scroll',function(){
      mark(d);
      var hi=document.getElementById('bodaTpHi'),mi=document.getElementById('bodaTpMi');
      if(id==='bodaTpH')hi.value=drumVal('bodaTpH',_BODA_HOURS);
      else mi.value=String(drumVal('bodaTpM',_BODA_MINS)).padStart(2,'0');
    },{passive:true});
  });
  setTimeout(function(){
    setDrum('bodaTpH',_BODA_HOURS,BODA_TIME_H);
    setDrum('bodaTpM',_BODA_MINS,_BODA_MINS.indexOf(BODA_TIME_M)>=0?BODA_TIME_M:0);
  },30);
  /* Entrada manual: manda sobre las ruedas */
  var manual=false;
  document.getElementById('bodaTpHi').addEventListener('input',function(){manual=true;});
  document.getElementById('bodaTpMi').addEventListener('input',function(){manual=true;});
  function readManual(){
    var hh=parseInt(document.getElementById('bodaTpHi').value,10);
    var mm=parseInt(document.getElementById('bodaTpMi').value,10);
    if(isNaN(hh))hh=18;if(isNaN(mm))mm=0;
    return [Math.max(0,Math.min(23,hh)),Math.max(0,Math.min(59,mm))];
  }
  document.getElementById('bodaTpClose').addEventListener('click',closeBodaTimePicker);
  document.getElementById('bodaTpNone').addEventListener('click',function(){
    bodaAplicarCampo(ev,'time',null,opts);
    closeBodaTimePicker();bodaTrasElegir(ev,opts);
  });
  document.getElementById('bodaTpSave').addEventListener('click',function(){
    var hh,mm;
    if(manual){var r=readManual();hh=r[0];mm=r[1];}
    else{hh=drumVal('bodaTpH',_BODA_HOURS);mm=drumVal('bodaTpM',_BODA_MINS);}
    bodaAplicarCampo(ev,'time',String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'),opts);
    closeBodaTimePicker();
    bodaTrasElegir(ev,opts);
  });
}
function closeBodaTimePicker(){bodaCloseSheet('bodaTpWrap','bodaTpOv');}

/* ── Formulario de pareja ── */

function openBodaDurationPicker(){
  if(!BODA_FORM)return;
  var b=BODA_FORM.tmp.boda,h='<div class="ev-detail-overlay" id="bodaDurationOv"><div class="ev-detail-sheet"><div class="ev-detail-handle"></div><div class="boda-config-head"><button class="sy-back" id="bodaDurationClose">&#8592;</button><h3>Duración del ensayo</h3></div><div class="ev-bficha">';
  BODA_CONFIG.durations.filter(function(d){return d.active!==false||d.id===b.durationId;}).forEach(function(d){h+='<button class="ev-bfila" data-duration="'+d.id+'"><span class="ev-bfila-lbl">'+d.minutes+' min</span><span class="ev-bfila-val">'+(d.id===b.durationId&&d.minutes===b.duration?'&#10003;':'')+'</span></button>';});
  h+='</div></div></div>';
  var close=function(){cerrarPanel('bodaDurationWrap','bodaDurationOv');};
  var w=abrirPanel('bodaDurationWrap',h,{overlay:'bodaDurationOv',alCerrar:close});w.querySelector('#bodaDurationClose').onclick=close;
  w.querySelectorAll('[data-duration]').forEach(function(btn){btn.onclick=function(){var d=BODA_CONFIG.durations.find(function(x){return x.id===btn.dataset.duration;});b.duration=d.minutes;b.durationId=d.id;close();_bodaFormRender();};});
}
