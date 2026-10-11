function renderBdayNameVip(id,vip){return '<img class="bday-name-vip" id="'+id+'" src="./VIP.png" alt="VIP" style="visibility:'+(vip?'visible':'hidden')+'" aria-hidden="'+!vip+'">';}
function updateBdayNameVip(id,vip){var icon=document.getElementById(id);icon.style.visibility=vip?'visible':'hidden';icon.setAttribute('aria-hidden',!vip);}
function renderBdayVipToggle(id,vip){return '<label class="bday-person-vip"><input type="checkbox" id="'+id+'" aria-label="VIP"'+(vip?' checked':'')+'><img src="./VIP.png" alt="" aria-hidden="true"></label>';}
function renderBdayDetail(b){
  var words=tc(b.name).trim().split(/\s+/),lastWord=words.pop();
  var displayName=(words.length?escHtml(words.join(' '))+' ':'')+'<span class="bday-name-tail">'+escHtml(lastWord)+renderBdayNameVip('bdDNameVip',b.vip)+'</span>';
  var dl=daysUntil(b.month,b.day);
  var lbl=dl===0?'¡Hoy es su cumpleaños!':dl===1?'Mañana cumple años':'Faltan '+dl+' días';
  var hasAlarm=bdayCanSetAlarm(b);
  var h='<div class="bd-detail-overlay" id="bdDetailOv"><div class="bd-detail-sheet'+(hasAlarm?' bday-detail-has-alarm':'')+'">';
  h+='<header class="bd-panel-header"><button class="sy-back" id="bdDClose" aria-label="Volver">←</button><h2>Cumpleaños</h2></header>';
  h+='<div class="bd-panel-body"><div class="bday-person-summary"><div class="bd-detail-name"><span>'+displayName+'</span></div><div class="bday-detail-meta"><div class="bd-detail-date">'+b.day+' de '+MN[b.month-1]+'</div>'+renderBdayVipToggle('bdDVip',b.vip)+'</div><div class="bd-detail-lbl">'+lbl+'</div></div>';
  h+=renderBdayPersonGroups(b);
  if(hasAlarm)h+='<section class="bday-detail-alarm bd-alarm-marker-row" aria-label="Alarma">'+navIconHtml('alarm')+'<div class="bday-detail-alarm-copy"><strong>Alarma</strong><span>'+(isBdayAlarmSet(b)?'Configurada':'Sin configurar')+'</span></div><button class="ev-btn" id="bdDAlarm">Configurar</button></section>';
  h+='</div>';
  h+='<footer class="bd-panel-footer ev-detail-actions"><button class="action-edit action-edit-text ev-btn ev-edit-orange" id="bdDEdit">&#9998; Editar</button><button class="ev-btn danger" id="bdDDel">Eliminar</button></footer>';
  h+='</div></div>';
  return h;
}

/* ── Alarm panel for birthday ─────────────────────────────── */
function renderBdayAlarmPanel(b){
  var dl=daysUntil(b.month,b.day);
  var lbl=dl===0?'\u00a1Hoy!':dl===1?'Ma\u00f1ana':dl>0?'en '+dl+' d\u00edas':'Hace '+Math.abs(dl)+' d\u00edas';
  var color=getBdayColor(b);
  var isSet=isBdayAlarmSet(b);
  var isToday=(dl===0);
  var cnt=isToday?1:(b.vip?BDAY_ALARM_COUNT:1);
  var today=new Date();
  var bdYear=today.getFullYear();
  var bdDate=new Date(bdYear,b.month-1,b.day);
  if(!isToday&&bdDate<today)bdDate.setFullYear(bdYear+1);
  var prevDate=new Date(bdDate);prevDate.setDate(prevDate.getDate()-1);
  function fmtDate(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');}
  var h='<div class="bd-alarm-overlay" id="bdAlarmOv"><div class="bd-alarm-sheet">';
  h+='<div class="bd-alarm-handle"></div>';
  h+='<div class="bd-alarm-hdr">';
  h+='<button class="sy-back" id="bdAlarmClose">&#8592;</button>';
  h+='<div class="bd-alarm-title">&#128276; Alarma Cumplea\u00f1os</div>';
  h+='<div style="width:36px"></div>';
  h+='</div>';
  h+='<div class="bd-alarm-info" style="border-color:'+color+'44;background:'+color+'11">';
  h+='<div class="bd-alarm-name" style="color:'+color+'">'+(b.vip?'<img src="./VIP.png" class="bday-vip-img" alt="VIP"> ':'')+bdName(b.name)+'</div>';
  h+='<div class="bd-alarm-date">'+b.day+' de '+MN[b.month-1]+' \u00b7 '+lbl+'</div>';
  h+='</div>';
  // Permanent 3-zone alarm marker
  h+='<div class="bd-alarm-marker-row">';
  h+='<div class="bd-alarm-marker-text">Marcar alarma como configurada</div>';
  h+='<div class="bd-alarm-marker-bell">'+(isSet?'&#128276;':'&#128277;')+'</div>';
  h+='<div class="bd-alarm-marker-btns">';
  h+='<button class="bd-alarm-marker-btn quitar'+(isSet?'':' active')+'" id="bdAlarmUnmark">Quitar</button>';
  h+='<button class="bd-alarm-marker-btn poner'+(isSet?' active':'')+'" id="bdAlarmPoner">Poner</button>';
  h+='</div>';
  h+='</div>';
  // Count toggle + Create button in same row
  var hasCount=!isToday&&b.vip;
  h+='<div class="bd-alarm-count-row'+(hasCount?'':' bd-alarm-count-single')+'">';
  if(hasCount){
    h+='<button class="bd-alarm-count-btn'+(cnt===1?' active':'')+'" data-cnt="1" id="bdAlarmCount1">1 alarma</button>';
    h+='<button class="bd-alarm-count-btn'+(cnt===2?' active':'')+'" data-cnt="2" id="bdAlarmCount2">2 alarmas</button>';
  }
  h+='<button class="ev-btn primary bd-alarm-create-btn" id="bdAlarmCreate">&#128276; Crear alarma'+(hasCount&&cnt===2?'s':'')+'</button>';
  h+='</div>';
  // VIP toggle
  h+='<div class="bd-alarm-vip-row">';
  h+='<label class="bd-alarm-vip-lbl"><input type="checkbox" id="bdAlarmVip"'+(b.vip?' checked':'')+' style="--chk:#fbbf24"> <img src="./VIP.png" class="bday-vip-img" alt="VIP" style="height:2.2em;margin-left:2px;vertical-align:middle"></label>';
  h+='</div>';
  // Alarm fields
  h+='<div id="bdAlarmFields">';
  var defaultH=isToday?18:9;
  var _bdT2=typeof nextAlarmTime==='function'?nextAlarmTime(isToday?today:bdDate,defaultH,2):{h:defaultH,m:2};
  var _bdT1=typeof nextAlarmTime==='function'?nextAlarmTime(prevDate,23,57):{h:23,m:57};
  if(!isToday&&cnt===2){
    h+='<div class="bd-alarm-row">';
    h+='<span class="bd-alarm-row-lbl">\uD83C\uDF19 V\u00edspera<br><span style="font-size:.65rem;opacity:.7">'+fmtDate(prevDate)+'</span></span>';
    h+='<div class="bd-alarm-time"><input id="bdAlarmH1" type="number" min="0" max="23" value="'+_bdT1.h+'"><span class="bd-alarm-time-sep">:</span><input id="bdAlarmM1" type="number" min="0" max="59" value="'+String(_bdT1.m).padStart(2,'0')+'"></div>';
    h+='</div>';
  }
  h+='<div class="bd-alarm-row">';
  h+='<span class="bd-alarm-row-lbl">\uD83C\uDF89 Cumplea\u00f1os<br><span style="font-size:.65rem;opacity:.7">'+fmtDate(isToday?today:bdDate)+'</span></span>';
  h+='<div class="bd-alarm-time"><input id="bdAlarmH2" type="number" min="0" max="23" value="'+_bdT2.h+'"><span class="bd-alarm-time-sep">:</span><input id="bdAlarmM2" type="number" min="0" max="59" value="'+String(_bdT2.m).padStart(2,'0')+'"></div>';
  h+='</div>';
  h+='</div>';
  h+='<div class="ev-form-actions" style="margin-top:12px"><button class="action-edit action-edit-text ev-btn ev-edit-orange" id="bdAlarmEdit">&#9998; Editar cumplea\u00f1os</button></div>';
  h+='</div></div>';
  return h;
}

function openBdayAlarm(b){
  if(!bdayCanSetAlarm(b)){showToast('Solo puedes configurar alarmas para cumpleaños en los próximos 14 días','error');return;}
  abrirPanel('bdAlarmWrap',renderBdayAlarmPanel(b),{
    contenedor:bdayPanelHost(),
    overlay:'bdAlarmOv', alCerrar:closeBdayAlarm});
  bindBdayAlarmEvents(b);
}

function _bdRefreshBoth(){
  if(typeof refreshEvents==='function')refreshEvents();
}

function closeBdayAlarm(){cerrarPanel('bdAlarmWrap','bdAlarmOv',_bdRefreshBoth);}

function bindBdayAlarmEvents(b){
  document.getElementById('bdAlarmClose').addEventListener('click',closeBdayAlarm);

  // VIP toggle inside alarm panel — refresco inline sin animar el cierre/apertura
  var vipChk=document.getElementById('bdAlarmVip');
  if(vipChk){
    vipChk.addEventListener('change',function(e){
      e.stopPropagation();
      if(this.checked)b.vip=true;else delete b.vip;
      appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));
      if(typeof syncVipBdaysToEvents==='function')syncVipBdaysToEvents();
      updateBdayBtn();
      /* Bug 2 fix: sustituir el contenido del panel sin animación de cierre */
      var wrap=document.getElementById('bdAlarmWrap');
      var fo=document.getElementById('bdAlarmOv');
      if(wrap&&fo){
        wrap.innerHTML=renderBdayAlarmPanel(b);
        /* Re-añadir la clase 'open' inmediatamente (sin transición) */
        var newFo=document.getElementById('bdAlarmOv');
        if(newFo){
          newFo.style.transition='none';
          newFo.classList.add('open');
          newFo.addEventListener('click',function(ev){if(ev.target===newFo)closeBdayAlarm();});
          requestAnimationFrame(function(){newFo.style.transition='';});
        }
        bindBdayAlarmEvents(b);
      }
    });
  }

  // Alarm count toggle (only for future VIP)
  ['bdAlarmCount1','bdAlarmCount2'].forEach(function(id){
    var btn=document.getElementById(id);
    if(!btn)return;
    btn.addEventListener('click',function(){
      BDAY_ALARM_COUNT=parseInt(btn.dataset.cnt,10);
      appStorage.setItem(BDAY_ALARM_COUNT_KEY,String(BDAY_ALARM_COUNT));
      var fo=document.getElementById('bdAlarmOv');if(fo)fo.classList.remove('open');
      setTimeout(function(){var w=document.getElementById('bdAlarmWrap');if(w)w.remove();openBdayAlarm(b);},310);
    });
  });

  // 3-zone marker: Quitar
  var unmarkBtn=document.getElementById('bdAlarmUnmark');
  if(unmarkBtn){
    unmarkBtn.addEventListener('click',function(e){
      e.stopPropagation();
      setBdayAlarmState(b,false);
      showToast('Marca eliminada','success');
      // Update UI inline
      var bellEl=document.querySelector('#bdAlarmOv .bd-alarm-marker-bell');
      if(bellEl)bellEl.innerHTML='&#128277;';
      unmarkBtn.classList.add('active');
      var ponerBtn=document.getElementById('bdAlarmPoner');
      if(ponerBtn)ponerBtn.classList.remove('active');
      _bdRefreshBoth();
    });
  }

  // 3-zone marker: Poner
  var ponerBtn=document.getElementById('bdAlarmPoner');
  if(ponerBtn){
    ponerBtn.addEventListener('click',function(e){
      e.stopPropagation();
      if(!bdayCanSetAlarm(b)){closeBdayAlarm();showToast('El cumpleaños está fuera de los próximos 14 días','error');return;}
      setBdayAlarmState(b,true);
      showToast('\u2713 Marcado como configurada','success');
      // Update UI inline
      var bellEl=document.querySelector('#bdAlarmOv .bd-alarm-marker-bell');
      if(bellEl)bellEl.innerHTML='&#128276;';
      ponerBtn.classList.add('active');
      var uBtn=document.getElementById('bdAlarmUnmark');
      if(uBtn)uBtn.classList.remove('active');
      _bdRefreshBoth();
    });
  }

  // Edit birthday
  var editBdBtn=document.getElementById('bdAlarmEdit');
  if(editBdBtn)editBdBtn.addEventListener('click',function(){
    closeBdayAlarm();setTimeout(function(){openBdayForm(b);},320);
  });

  // Create alarm via MacroDroid
  document.getElementById('bdAlarmCreate').addEventListener('click',function(){
    if(!bdayCanSetAlarm(b)){closeBdayAlarm();showToast('El cumpleaños está fuera de los próximos 14 días','error');return;}
    var alarmUrl=appStorage.getItem('excelia-alarm-url')||appStorage.getItem('excelia-macro-alarm-url')||'';
    if(!alarmUrl){
      showToast('Configura la URL de MacroDroid en el men\u00fa \u22ef','error');
      return;
    }
    var isToday=(daysUntil(b.month,b.day)===0);
    var _cnt=isToday?1:(b.vip?BDAY_ALARM_COUNT:1);
    // Calculate dates
    var today2=new Date();
    var bdYear2=today2.getFullYear();
    var bdDate2=new Date(bdYear2,b.month-1,b.day);
    if(!isToday&&bdDate2<today2)bdDate2.setFullYear(bdYear2+1);
    var prevDate2=new Date(bdDate2);prevDate2.setDate(prevDate2.getDate()-1);
    // Read birthday alarm time
    var h2r=parseInt(document.getElementById('bdAlarmH2').value,10);
    var h2=isNaN(h2r)?(isToday?18:9):Math.min(23,Math.max(0,h2r));
    var m2r=parseInt(document.getElementById('bdAlarmM2').value,10);
    var m2=isNaN(m2r)?2:Math.min(59,Math.max(0,m2r));
    var msgDay='Cumple '+tc(b.name)+'! '+String(b.day).padStart(2,'0')+'/'+String(b.month).padStart(2,'0');
    var base=normalizeMacroBase(alarmUrl);
    var dayBd=(isToday?today2:bdDate2).getDay()+1;
    var url2=base+'/generar_alarma2?alarmH='+h2+'&alarmM='+m2+'&alarmMsg='+encodeURIComponent(msgDay)+'&alarmDays='+dayBd;
    var h1=23,m1=57,msgPrev='',dayPrev=0,url1='';
    if(_cnt===2){
      var h1r=parseInt(document.getElementById('bdAlarmH1').value,10);
      h1=isNaN(h1r)?23:Math.min(23,Math.max(0,h1r));
      var m1r=parseInt(document.getElementById('bdAlarmM1').value,10);
      m1=isNaN(m1r)?57:Math.min(59,Math.max(0,m1r));
      msgPrev='\u23f0 Ma\u00f1ana cumple '+tc(b.name)+' '+String(b.day).padStart(2,'0')+'/'+String(b.month).padStart(2,'0');
      dayPrev=prevDate2.getDay()+1;
      url1=base+'/generar_alarma1?alarmH='+h1+'&alarmM='+m1+'&alarmMsg='+encodeURIComponent(msgPrev)+'&alarmDays='+dayPrev;
    }
    var fmtD=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
    if(typeof addAlarm==='function'){
      if(_cnt===2)addAlarm({type:'birthday',label:msgPrev,hour:h1,minute:m1,days:[dayPrev],targetDate:fmtD(prevDate2)});
      addAlarm({type:'birthday',label:msgDay,hour:h2,minute:m2,days:[dayBd],targetDate:fmtD(isToday?today2:bdDate2)});
    }
    showToast('Enviando alarma'+(_cnt===2?'s':'')+' a MacroDroid\u2026','success');
    var _cntN=_cnt,_name=tc(b.name);
    function onOk(){setBdayAlarmState(b,true);showToast('Solicitud de alarma enviada para '+_name,'success');closeBdayAlarm();}
    function onErr(){showToast('No se pudo enviar la alarma a MacroDroid. Reintenta con conexion.','error');}
    if(_cnt===2){
      fetch(url1,{mode:'no-cors'})
        .then(function(){return new Promise(function(r){setTimeout(r,1000);});})
        .then(function(){return fetch(url2,{mode:'no-cors'});})
        .then(onOk).catch(onErr);
    } else {
      fetch(url2,{mode:'no-cors'}).then(onOk).catch(onErr);
    }
  });

  // Zero-pad minute inputs on blur
  ['bdAlarmM1','bdAlarmM2'].forEach(function(id){
    var inp=document.getElementById(id);
    if(inp)inp.addEventListener('blur',function(){
      var v=parseInt(this.value,10);
      if(!isNaN(v)&&v>=0&&v<=59)this.value=String(v).padStart(2,'0');
    });
  });
}

/* ── Form panel (añadir/editar cumpleaños) ─────────────────── */
function renderBdayForm(b,prefillDay,prefillMonth){
  var isEdit=!!b;
  var name=isEdit?b.name:'';
  var day=isEdit?b.day:(prefillDay||'');
  var month=isEdit?b.month:(prefillMonth||1);
  var vip=isEdit?!!b.vip:false;
  var h='<div class="bd-form-overlay" id="bdFormOv"><div class="bd-form-sheet">';
  h+='<div class="bd-form-handle"></div>';
  h+='<header class="bd-panel-header">';
  h+='<button class="sy-back" id="bdFClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">'+(isEdit?'Editar cumplea\u00f1os':'Nuevo cumplea\u00f1os')+'</div>';
  if(isEdit)h+='<button class="ev-btn danger" id="bdFDel" style="flex:none;padding:6px 12px;font-size:.75rem">Eliminar</button>';
  else h+='<div style="width:60px"></div>';
  h+='</header><div class="bd-panel-body">';
  h+='<section class="bday-form-panel"><div class="ev-field"><label>Nombre</label>';
  h+='<div class="bday-form-name-row"><input class="ev-input" id="bdFName" type="text" maxlength="60" placeholder="Nombre completo" value="'+escHtml(name)+'">'+renderBdayVipToggle('bdFVip',vip)+'</div></div></section>';
  h+='<section class="bday-form-panel"><div class="ev-field ev-date-row">';
  h+='<div><label>Día</label><input type="hidden" id="bdFDay" value="'+escHtml(String(day))+'"><button type="button" class="ev-input bday-date-button" id="bdFDayPick" aria-describedby="bdFDateError">'+(day||'Elegir día')+' <span class="ev-tax-chevron" aria-hidden="true"></span></button></div>';
  h+='<div><label>Mes</label><input type="hidden" id="bdFMonth" value="'+month+'"><button type="button" class="ev-input bday-date-button" id="bdFMonthPick">'+MN[month-1]+' <span class="ev-tax-chevron" aria-hidden="true"></span></button></div></div>';
  h+='<div id="bdFDateError" class="bday-date-error" role="status"></div></section>';
  h+=renderBdayGroupFields(b);
  h+='</div><footer class="bd-panel-footer"><button class="ev-btn primary" id="bdFSave">Guardar</button></footer>';
  h+='</div></div>';
  return h;
}

/* ── Abrir/cerrar detail ──────────────────────────────────── */
function openBdayDetail(b){
  abrirPanel('bdDWrap',renderBdayDetail(b),{
    contenedor:bdayPanelHost(),
    overlay:'bdDetailOv', alCerrar:closeBdayDetail});
  function savePerson(){appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));syncVipBdaysToEvents();updateBdayBtn();refreshBday();}
  bindBdayCategoryButton(document.getElementById('bdDWrap'),function(groups){b.categories=groups;savePerson();});
  document.getElementById('bdDVip').onchange=function(){
    var issue=birthdayValidation(Object.assign({},b,{vip:this.checked}),b);
    if(issue){this.checked=!!b.vip;showToast(issue,'error');return;}
    b.vip=this.checked;savePerson();updateBdayNameVip('bdDNameVip',b.vip);
  };
  var alarmButton=document.getElementById('bdDAlarm');
  if(alarmButton)alarmButton.addEventListener('click',function(){closeBdayDetail();setTimeout(function(){openBdayAlarm(b);},300);});
  document.getElementById('bdDDel').onclick=function(){deleteBdayPerson(b);closeBdayDetail();};
  document.getElementById('bdDClose').addEventListener('click',closeBdayDetail);
  document.getElementById('bdDEdit').addEventListener('click',function(){
    closeBdayDetail();setTimeout(function(){openBdayForm(b);},300);
  });
}

function closeBdayDetail(){cerrarPanel('bdDWrap','bdDetailOv');}

/* ── Abrir/cerrar form ────────────────────────────────────── */
function openBdayForm(b,prefillDay,prefillMonth){
  BDAY_EDIT=b||null;
  abrirPanel('bdFWrap',renderBdayForm(b,prefillDay,prefillMonth),{
    contenedor:bdayPanelHost(),
    overlay:'bdFormOv', alCerrar:closeBdayForm});
  bindBdayCategoryButton(document.getElementById('bdFWrap'));
  bindBdayFormEvents();
}

function closeBdayForm(){
  cerrarPanel('bdFWrap','bdFormOv',function(){BDAY_EDIT=null;});
}

function deleteBdayPerson(b){
  var index=BDAYS.indexOf(b);if(index<0)return;
  BDAYS.splice(index,1);
  function persist(){appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));syncVipBdaysToEvents();updateBdayBtn();refreshBday();}
  persist();showToast('Cumpleaños eliminado','success',function(){BDAYS.splice(Math.min(index,BDAYS.length),0,b);persist();});
}
function bindBdayDateFields(){
  var day=document.getElementById('bdFDay'),month=document.getElementById('bdFMonth');
  function update(){
    var valid=validBirthday(+day.value,+month.value),message=valid?'':(day.value?'El '+day.value+' de '+MN[+month.value-1]+' no existe.':'Elige un día.');
    document.getElementById('bdFDayPick').innerHTML=(day.value||'Elegir día')+' <span class="ev-tax-chevron" aria-hidden="true"></span>';
    document.getElementById('bdFMonthPick').innerHTML=MN[+month.value-1]+' <span class="ev-tax-chevron" aria-hidden="true"></span>';
    document.getElementById('bdFDateError').textContent=message;
    document.getElementById('bdFDayPick').setAttribute('aria-invalid',!valid);
    document.getElementById('bdFSave').disabled=!valid;
  }
  document.getElementById('bdFDayPick').onclick=function(){openBdayDatePicker('day',+day.value||1,function(value){day.value=value;update();});};
  document.getElementById('bdFMonthPick').onclick=function(){openBdayDatePicker('month',+month.value,function(value){month.value=value;update();});};
  update();
}
function openBdayDatePicker(kind,value,onPick){
  function close(){cerrarPanel('bdDateWrap','bdDateOv');}
  var isDay=kind==='day',h='<div class="bd-form-overlay" id="bdDateOv"><div class="bd-form-sheet bday-date-sheet"><header class="bd-panel-header"><button class="sy-back" id="bdDateClose" aria-label="Volver">←</button><h2>'+ (isDay?'Día':'Mes')+'</h2></header>';
  if(isDay){
    h+='<div class="drum-wrap"><div class="drum-picker" id="bdDayDrum" role="spinbutton" tabindex="0" aria-label="Día" aria-valuemin="1" aria-valuemax="31"><div style="height:44px"></div>';
    for(var d=1;d<=31;d++)h+='<div class="drum-picker-item" data-day="'+d+'">'+d+'</div>';
    h+='<div style="height:44px"></div></div><div class="drum-sel-lines"></div></div><button class="ev-btn primary" id="bdDateApply">Elegir día</button>';
  }else{
    h+='<div class="bday-month-options">';
    MN.forEach(function(name,i){h+='<button class="ev-btn" data-month="'+(i+1)+'" aria-pressed="'+(value===i+1)+'">'+name+'</button>';});h+='</div>';
  }
  h+='</div></div>';
  var wrap=abrirPanel('bdDateWrap',h,{contenedor:bdayPanelHost(),overlay:'bdDateOv',alCerrar:close});
  wrap.querySelector('#bdDateClose').onclick=close;
  if(!isDay){wrap.querySelectorAll('[data-month]').forEach(function(button){button.onclick=function(){onPick(+button.dataset.month);close();};});return;}
  var drum=wrap.querySelector('#bdDayDrum');
  function mark(){value=Math.max(1,Math.min(31,Math.round(drum.scrollTop/44)+1));drum.setAttribute('aria-valuenow',value);drum.querySelectorAll('[data-day]').forEach(function(item){item.classList.toggle('drum-selected',+item.dataset.day===value);});}
  function select(day){drum.style.scrollSnapType='none';drum.scrollTop=(Math.max(1,Math.min(31,day))-1)*44;mark();requestAnimationFrame(function(){drum.style.scrollSnapType='';});}
  drum.addEventListener('scroll',mark,{passive:true});
  drum.onclick=function(e){var item=e.target.closest('[data-day]');if(item)select(+item.dataset.day);};
  drum.onkeydown=function(e){if(['ArrowUp','ArrowDown','Home','End'].indexOf(e.key)<0)return;e.preventDefault();select(e.key==='Home'?1:e.key==='End'?31:value+(e.key==='ArrowUp'?-1:1));};
  var initial=value,ov=wrap.querySelector('#bdDateOv');
  var observer=new MutationObserver(function(){if(ov.classList.contains('open')){observer.disconnect();select(initial);}});
  observer.observe(ov,{attributes:true,attributeFilter:['class']});
  wrap.querySelector('#bdDateApply').onclick=function(){mark();onPick(value);close();};
}
