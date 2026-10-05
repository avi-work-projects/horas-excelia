/* Configuración inicial y edición de metadatos. El horario iniciado se cambia
   desde el selector de semana; los cupos habituales flexibles siguen editables. */
function rutSetupLocked(r){
  if(!r)return false;
  var today=evDk(new Date());
  if(!r.start||r.start<=today)return true;
  return Object.keys(r.flex?r.flex.sessions||{}:r.keptSessions||{}).some(function(ds){return ds<=today;})
    ||(r.extraSessions||[]).some(function(s){return s.date<=today;});
}
/* Se aplica también al guardar: ocultar un campo no basta para protegerlo. */
function rutFormCandidate(r,data){
  if(!r)return data;
  var copy=JSON.parse(JSON.stringify(r)),locked=rutSetupLocked(r);
  if(locked){
    copy.name=data.name;copy.icon=rutIconOf(r);copy.color=rutColorOf(copy.icon,data.color);
    copy.suspend=data.suspend;
    if(r.flex&&data.flex){
      copy.flex.target=data.flex.target;copy.flex.weeklyTarget=data.flex.weeklyTarget;
      if(r.flex.period==='month'&&r.start){
        copy.flex.monthTargets=copy.flex.monthTargets||{};
        copy.flex.monthTargets[r.start.slice(0,7)]=rutFlexTarget(r,r.start);
      }
    }
    if(!r.flex&&JSON.stringify(r.suspend||null)!==JSON.stringify(copy.suspend||null))return rutChangeFrom(r,copy,evDk(new Date()));
    return copy;
  }
  Object.assign(copy,data,{start:r.start});
  /* Antes del inicio se puede cambiar de modalidad. Las fechas explícitas y
     sus cancelaciones/vínculos sobreviven, sin generar sesiones duplicadas. */
  if(!!r.flex!==!!data.flex){
    if(r.flex){copy.keptSessions=Object.assign({},r.keptSessions||{},r.flex.sessions);}
    else{
      Object.keys(r.keptSessions||{}).concat(Object.keys(r.skips||{})).forEach(function(ds){
        var time=rutOccursOn(r,ds);
        if(time)copy.flex.sessions[ds]={time:time,dur:rutDurationOn(r,ds)};
      });
    }
  }
  return copy;
}
function rutReadForm(r,cp){
  var name=document.getElementById('rutFName').value.trim();
  if(!name)throw new Error('Ponle nombre a la rutina');
  var locked=rutSetupLocked(r),flex=rutFlexRead(r),days=[];
  var data={name:name,flex:flex,color:cp.getColor()};
  if(!locked){
    document.querySelectorAll('#rutFDays .rut-day-btn.on').forEach(function(b){days.push(+b.dataset.wd);});
    if(!flex&&!days.length)throw new Error('Elige al menos un día de la semana');
    var dur=Number(document.getElementById('rutFDur').value);
    if(!Number.isInteger(dur)||dur<15||dur>480)throw new Error('La duración debe estar entre 15 y 480 minutos.');
    data.weekDays=flex?[]:days.sort();data.dur=dur;
    data.time=document.getElementById('rutFTime').value||RUT_TIME_DEFAULT;
    data.start=r?r.start:document.getElementById('rutFStart').value;
    if(!validIsoDate(data.start))throw new Error('Elige una fecha de inicio válida.');
    data.icon=(document.querySelector('#rutFIcons .rut-icon-opt.on')||{dataset:{}}).dataset.icon||'gen';
    data.color=rutColorOf(data.icon,data.color);
    data.times=null;
    if(!flex&&document.getElementById('rutFPorDia').checked){
      data.times={};
      document.querySelectorAll('#rutFHoras input[data-wd]').forEach(function(i){
        if(i.value&&i.value!==data.time&&days.indexOf(+i.dataset.wd)!==-1)data.times[i.dataset.wd]=i.value;
      });
    }
  }
  var sf=document.getElementById('rutFSuspFrom'),to=document.getElementById('rutFSuspTo');
  if(sf){
    if(sf.value&&(!validIsoDate(sf.value)||(to.value&&(!validIsoDate(to.value)||to.value<sf.value))))throw new Error('Revisa las fechas de la pausa.');
    data.suspend=sf.value?{from:sf.value,to:to.value||null}:null;
  }
  return rutFormCandidate(r,data);
}


/* ══ Formulario de rutina ══ */
function renderRutForm(r){
  var isEdit=!!r;
  var locked=rutSetupLocked(r);
  var col=isEdit&&rutIconOf(r)==='gen'?rutDisplayColor(r):'#a78bfa';
  var dias=isEdit?(r.weekDays||[]):[];
  var h='<div class="ev-form-overlay" id="rutFormOv"><div class="ev-form-sheet">';
  h+='<div class="ev-form-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">';
  h+='<button class="sy-back" id="rutFClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar rutina':'Nueva rutina')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="rutFDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Actividad</label>';
  h+='<input class="ev-input" id="rutFName" type="text" maxlength="40" placeholder="Ej: Gimnasio" value="'+(isEdit?escHtml(r.name):'')+'"></div>';
  h+=rutFlexOptionsHtml(r);
  if(!locked){
  h+='<div class="ev-field"><label>Días de la semana</label><div class="rut-days-pick" id="rutFDays">';
  for(var i=1;i<=7;i++){
    var d=i%7;
    h+='<button type="button" class="rut-day-btn'+(dias.indexOf(d)!==-1?' on':'')+'" data-wd="'+d+'">'+RUT_DN[d]+'</button>';
  }
  h+='</div></div>';
  h+='<div class="ev-date-row">';
  h+='<div><label>Hora</label><input class="ev-input" id="rutFTime" type="text" readonly data-time-picker aria-haspopup="dialog" placeholder="Sin hora" value="'+(isEdit?(r.time||RUT_TIME_DEFAULT):RUT_TIME_DEFAULT)+'"></div>';
  h+='<div><label>Duración (min)</label><input class="ev-input" id="rutFDur" type="number" min="15" max="480" step="15" value="'+(isEdit?(r.dur||RUT_DUR_DEFAULT):RUT_DUR_DEFAULT)+'"></div>';
  h+='</div>';
  /* Horario por dia: se despliega con el conmutador y pone una hora por cada
     dia marcado. Los dias que coinciden con la hora general no se guardan. */
  var _varias=isEdit&&rutTieneHorarios(r);
  h+='<div class="ev-field rut-hpd">';
  h+='<label class="excl-item"><input type="checkbox" id="rutFPorDia"'+(_varias?' checked':'')+'> Horario distinto seg\u00fan el d\u00eda</label>';
  h+='<div class="rut-hpd-rows" id="rutFHoras" style="display:'+(_varias?'block':'none')+'"></div>';
  h+='</div>';
  if(!isEdit)h+='<div class="ev-field"><label>Desde</label><input class="ev-input" id="rutFStart" type="date" value="'+evDk(new Date())+'"></div>';
  }
  var _ic=isEdit?rutIconOf(r):'gen';
  if(!locked){
  h+='<div class="ev-field"><label>Icono</label><div class="rut-icon-row" id="rutFIcons">';
  /* Cada icono se ve con SU color (el gimnasio turquesa, el padel verde...),
     no todos con el color de la rutina que se esta editando. Solo "Otra"
     acompana al color elegido, que es el unico que se puede cambiar. */
  RUT_ICONS.forEach(function(k){
    h+='<button type="button" class="rut-icon-opt'+(k===_ic?' on':'')+'" data-icon="'+k+'">'
      +rutIconSvg(k,RUT_FIXED_COLOR[k]||col,true)+'<span>'+RUT_ICON_LABEL[k]+'</span></button>';
  });
  h+='</div></div>';
  }
  if(!locked||_ic==='gen'){
  h+='<div class="ev-field" id="rutFColorField"'+(_ic==='gen'?'':' style="display:none"')+'>'
    +'<label>🎨 Color</label>'+_renderColorPicker(col,false,false,'rutCp')+'</div>';
  }
  if(isEdit){
    var susp=r.suspend&&r.suspend.from;
    h+='<div class="ev-field rut-susp-box">';
    h+='<label>⏸ Pausar temporalmente</label>';
    h+='<div class="ev-date-row">';
    h+='<div><label>Desde</label><input class="ev-input" id="rutFSuspFrom" type="date" value="'+(susp?r.suspend.from:'')+'"></div>';
    h+='<div><label>Hasta <span class="ev-note-scope">(vacío = indefinida)</span></label><input class="ev-input" id="rutFSuspTo" type="date" value="'+(susp&&r.suspend.to?r.suspend.to:'')+'"></div>';
    h+='</div>';
    if(susp)h+='<button type="button" class="ev-btn" id="rutFSuspClear" style="margin-top:6px">Reanudar ahora</button>';
    h+='</div>';
  }
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="rutFSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}
function openRutForm(r){
  var wrap=abrirPanel('rutFWrap',renderRutForm(r),
    {overlay:'rutFormOv',alCerrar:closeRutForm});
  var cp=_bindColorPicker(wrap,'rutCp');
  bindRutFlexOptions(r);
  /* Los iconos se repintan con el color elegido para verlos como quedaran */
  /* Solo hay que repintar "Otra": el resto llevan color fijo */
  function _rutRepaintIcons(){
    var c=cp.getColor();
    document.querySelectorAll('#rutFIcons .rut-icon-opt').forEach(function(b){
      var k=b.dataset.icon;
      if(RUT_FIXED_COLOR[k])return;
      b.innerHTML=rutIconSvg(k,c,true)+'<span>'+RUT_ICON_LABEL[k]+'</span>';
    });
  }
  document.querySelectorAll('#rutFIcons .rut-icon-opt').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('#rutFIcons .rut-icon-opt').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');
      var k=b.dataset.icon;
      var campo=document.getElementById('rutFColorField');
      if(campo)campo.style.display=(k==='gen')?'':'none';
      _rutRepaintIcons();
    });
  });
  var _cpWrap=document.getElementById('rutCpWrap');
  if(_cpWrap)_cpWrap.addEventListener('click',function(){setTimeout(_rutRepaintIcons,0);});
  var _cpHex=document.getElementById('rutCpHex');
  if(_cpHex)_cpHex.addEventListener('input',function(){setTimeout(_rutRepaintIcons,0);});
  document.getElementById('rutFClose').addEventListener('click',closeRutForm);
  /* Una fila por dia marcado, con su hora. Se repinta al tocar los dias para
     que no queden filas de dias que ya no tocan. */
  function _rutPintaHoras(){
    var cont=document.getElementById('rutFHoras');
    if(!cont)return;
    var base=(document.getElementById('rutFTime')||{}).value||RUT_TIME_DEFAULT;
    var previas={};
    cont.querySelectorAll('input[data-wd]').forEach(function(i){previas[i.dataset.wd]=i.value;});
    var hh='';
    for(var i=1;i<=7;i++){
      var d=i%7;
      var btn=document.querySelector('#rutFDays .rut-day-btn[data-wd="'+d+'"]');
      if(!btn||!btn.classList.contains('on'))continue;
      var v=previas[d]||(r&&r.times&&r.times[d])||base;
      hh+='<div class="rut-hpd-row"><span>'+RUT_DN_LARGO[d]+'</span>'
        +'<input class="ev-input" type="text" readonly data-time-picker aria-haspopup="dialog" placeholder="Sin hora" data-wd="'+d+'" value="'+v+'"></div>';
    }
    cont.innerHTML=hh||'<div class="rut-vacio">Marca antes los d\u00edas de la semana</div>';
  }
  var _porDia=document.getElementById('rutFPorDia');
  if(_porDia)_porDia.addEventListener('change',function(){
    var cont=document.getElementById('rutFHoras');
    cont.style.display=this.checked?'block':'none';
    if(this.checked)_rutPintaHoras();
  });
  if(_porDia&&_porDia.checked)_rutPintaHoras();
  document.querySelectorAll('#rutFDays .rut-day-btn').forEach(function(b){
    b.addEventListener('click',function(){
      b.classList.toggle('on');
      if(_porDia&&_porDia.checked)_rutPintaHoras();
    });
  });
  var del=document.getElementById('rutFDel');
  if(del)del.addEventListener('click',function(){
    var copia=JSON.parse(JSON.stringify(r));
    RUTINAS=RUTINAS.filter(function(x){return x.id!==r.id;});
    saveRutinas();closeRutForm();
    setTimeout(function(){refreshEvents();},310);
    showToast('Rutina eliminada','success',function(){
      RUTINAS.push(copia);saveRutinas();refreshEvents();
    });
  });
  var sc=document.getElementById('rutFSuspClear');
  if(sc)sc.addEventListener('click',function(){
    document.getElementById('rutFSuspFrom').value='';
    document.getElementById('rutFSuspTo').value='';
  });
  document.getElementById('rutFSave').addEventListener('click',function(){
    var datos;
    try{datos=rutReadForm(r,cp);}catch(e){showToast(e.message,'error');return;}
    var _lleno=rutLimitExceeded(Object.assign({},r||{},datos),r?r.id:null);
    if(_lleno){
      showToast('El '+_rutFmt(_lleno)+' ya tiene '+EV_MAX_RUT_DIA+' rutinas (el m\u00e1ximo)','error');
      return;
    }
    if(r){for(var k in datos)r[k]=datos[k];}
    else{
      datos.id='rut-'+Date.now();
      datos.createdAt=Date.now();
      datos.weeks={};datos.skips={};
      RUTINAS.push(datos);
    }
    saveRutinas();closeRutForm();
    setTimeout(function(){refreshEvents();},310);
    showToast(r?'Rutina actualizada':'Rutina creada','success');
    if(datos.flex&&!r)setTimeout(function(){openRutPlan(datos);},330);
  });
}
function closeRutForm(){cerrarPanel('rutFWrap','rutFormOv');}
