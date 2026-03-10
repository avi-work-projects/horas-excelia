/* ============================================================
   INIT — Event listeners globales + arranque
   ============================================================ */

(function(){
  var now=new Date();
  CY=now.getFullYear();
  CM=now.getMonth();

  load();
  render();
  updateBdayBtn();

  /* ── Versión en menú principal ── */
  var _vl=document.getElementById('appVersionLabel');
  if(_vl)_vl.textContent=typeof APP_VERSION!=='undefined'?APP_VERSION:'—';
  updateEventsBtn();
  /* ── Sincronizar cumpleaños VIP con calendario de eventos ── */
  if(typeof syncVipBdaysToEvents==='function') syncVipBdaysToEvents();

  /* ── Navegación de mes ── */
  document.getElementById('prevBtn').addEventListener('click',function(){
    CM--;if(CM<0){CM=11;CY--;}render();
  });
  document.getElementById('nextBtn').addEventListener('click',function(){
    CM++;if(CM>11){CM=0;CY++;}render();
  });
  document.getElementById('todayBtn').addEventListener('click',function(){
    var n=new Date();CY=n.getFullYear();CM=n.getMonth();render();
  });

  /* ── Botón "Editar jornada" ── */
  document.getElementById('editHoursBtn').addEventListener('click',function(){
    var panel=document.getElementById('hoursPanel');
    var isOpen=panel.classList.contains('open');
    if(isOpen){
      panel.classList.remove('open');
    } else {
      // Actualizar chips antes de mostrar
      var curH=getMonthH(CY,CM,1);
      document.querySelectorAll('.hours-chip').forEach(function(c){
        c.classList.toggle('active',+c.dataset.h===curH);
      });
      panel.classList.add('open');
    }
  });

  document.getElementById('closeHoursBtn').addEventListener('click',function(){
    document.getElementById('hoursPanel').classList.remove('open');
  });

  /* ── Chips de horas mensuales (bloquea días de semanas ya enviadas) ── */
  document.querySelectorAll('.hours-chip').forEach(function(chip){
    chip.addEventListener('click',function(){
      var h=+chip.dataset.h;
      var wks=weeks(CY,CM);
      var sentCount=0;
      // Para semanas enviadas: fijar explícitamente las horas actuales en L-J
      // para que el nuevo MONTH_H no las afecte
      wks.forEach(function(wk){
        if(!SW[dk(wk[0])])return;
        sentCount++;
        for(var i=0;i<=3;i++){
          var d=wk[i];
          if(d.getMonth()!==CM)continue;
          var k=dk(d);
          var e=ST[k]||{};
          if(!e.type&&!e.hours){
            ST[k]={hours:getMonthH(CY,CM,d.getDate())};
          }
        }
      });
      MONTH_H[mkey(CY,CM)]=h;
      save();render();
      document.getElementById('hoursPanel').classList.remove('open');
      if(sentCount>0){
        showToast('Jornada actualizada para las semanas no enviadas','success');
      }
    });
  });

  /* ── Botones del header (overlays) ── */
  document.getElementById('summaryBtn').addEventListener('click',openSummary);
  document.getElementById('econBtn').addEventListener('click',openEcon);
  document.getElementById('bdayBtn').addEventListener('click',openBday);
  document.getElementById('eventsBtn').addEventListener('click',openEvents);

  /* ── Exportar datos (solo días/semanas/jornada) ── */
  var _expBtn=document.getElementById('exportBtn');
  if(_expBtn)_expBtn.addEventListener('click',function(){
    var data={version:2,days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE,exclFest:EXCL_FEST,exclVac:EXCL_VAC};
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(data,null,2));
    a.download='horas-excelia-dias.json';
    a.click();
    showToast('Datos exportados','success');
  });

  /* ── Importar datos (solo días/semanas/jornada) ── */
  var _impBtn=document.getElementById('importBtn');
  if(_impBtn)_impBtn.addEventListener('click',function(){
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change',function(ev){
    var f=ev.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(e){
      try{
        var d=JSON.parse(e.target.result);
        if(d.days)ST=d.days;
        if(d.sent)SW=d.sent;
        if(d.monthH)MONTH_H=d.monthH;
        if(d.rate)DAILY_RATE=d.rate;
        if(typeof d.exclFest!=='undefined')EXCL_FEST=d.exclFest;
        if(typeof d.exclVac!=='undefined')EXCL_VAC=d.exclVac;
        save();render();
        showToast('Datos importados correctamente','success');
      }catch(err){showToast('Error al importar: archivo inv\u00e1lido','error');}
    };
    r.readAsText(f);
    ev.target.value='';
  });

  /* ── Alarma: panel configurable (Vivo X200 Ultra / Android) ── */
  document.getElementById('alarmTestBtn').addEventListener('click',function(e){
    e.stopPropagation();
    var panel=document.getElementById('alarmPanel');
    var opening=!panel.classList.contains('open');
    if(opening){
      // Restaurar estado MacroDroid guardado
      var useMacro=localStorage.getItem('excelia-alarm-macro')==='1';
      var macroUrl=localStorage.getItem('excelia-alarm-url')||'';
      var cb=document.getElementById('alarmUseMacro');
      var urlIn=document.getElementById('alarmMacroUrl');
      if(cb){cb.checked=useMacro;}
      if(urlIn){urlIn.value=macroUrl;urlIn.disabled=!useMacro;}
      // Restaurar días seleccionados
      var savedDays=(localStorage.getItem('excelia-alarm-days')||'').split(',').filter(Boolean);
      document.querySelectorAll('.alarm-day-btn').forEach(function(btn){
        btn.classList.toggle('on',savedDays.indexOf(btn.dataset.day)>=0);
      });
    }
    panel.classList.toggle('open');
  });

  /* ── Alarma: botones días de semana ── */
  document.querySelectorAll('.alarm-day-btn').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      btn.classList.toggle('on');
      var sel=[];
      document.querySelectorAll('.alarm-day-btn.on').forEach(function(b){sel.push(b.dataset.day);});
      localStorage.setItem('excelia-alarm-days',sel.join(','));
    });
  });

  /* ── Alarma: toggle MacroDroid ── */
  document.getElementById('alarmUseMacro').addEventListener('change',function(){
    var checked=this.checked;
    document.getElementById('alarmMacroUrl').disabled=!checked;
    localStorage.setItem('excelia-alarm-macro',checked?'1':'0');
  });
  document.getElementById('alarmMacroUrl').addEventListener('change',function(){
    var v=normalizeMacroBase(this.value);
    this.value=v;
    localStorage.setItem('excelia-alarm-url',v);
  });
  document.getElementById('alarmMin').addEventListener('blur',function(){
    var v=parseInt(this.value,10);
    if(!isNaN(v)&&v>=0&&v<=59)this.value=String(v).padStart(2,'0');
  });

  document.getElementById('alarmCreateBtn').addEventListener('click',function(){
    var hRaw=parseInt(document.getElementById('alarmHour').value,10);
    var h=isNaN(hRaw)?8:Math.min(23,Math.max(0,hRaw));
    var mRaw=parseInt(document.getElementById('alarmMin').value,10);
    var m=isNaN(mRaw)?0:Math.min(59,Math.max(0,mRaw));
    var msg=(document.getElementById('alarmMsg').value.trim()||'Horas Excelia');
    var useMacro=document.getElementById('alarmUseMacro').checked;
    // Días seleccionados (constantes Android: 1=Dom,2=Lun...7=Sáb)
    var selDays=[];
    document.querySelectorAll('.alarm-day-btn.on').forEach(function(b){selDays.push(+b.dataset.day);});
    document.getElementById('alarmPanel').classList.remove('open');

    if(useMacro){
      // MacroDroid webhook: URL remota (https://trigger.macrodroid.com/…)
      var macroBase=normalizeMacroBase(document.getElementById('alarmMacroUrl').value||'');
      if(!macroBase){
        showToast('Pega la URL del webhook de MacroDroid','error');
        document.getElementById('alarmPanel').classList.add('open');
        return;
      }
      var url=macroBase+'/generar_alarma1?alarmH='+h+'&alarmM='+m+'&alarmMsg='+encodeURIComponent(msg);
      if(selDays.length)url+='&alarmDays='+selDays.join(',');
      showToast('Enviando a MacroDroid\u2026','success');
      fetch(url,{mode:'no-cors'})
        .then(function(){
          showToast('\u23f0 Alarma enviada \u2014 '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'),'success');
        })
        .catch(function(){
          showToast('Error al contactar MacroDroid','error');
        });
    } else {
      // Intento intent:// (puede funcionar en algunos dispositivos/versiones)
      var base=';action=android.intent.action.SET_ALARM'
        +';S.android.intent.extra.alarm.MESSAGE='+encodeURIComponent(msg)
        +';i.android.intent.extra.alarm.HOUR='+h
        +';i.android.intent.extra.alarm.MINUTES='+m
        +';b.android.intent.extra.alarm.SKIP_UI=false';
      if(selDays.length)base+=';ia.android.intent.extra.alarm.DAYS='+selDays.join(',');
      window.open('intent://alarm/#Intent'+base+';package=com.vivo.clock;end','_blank');
      showToast('Abriendo reloj \u2014 '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'),'success');
    }
  });

  /* ── Alarma: fallback .ics (recordatorio de calendario, 100% fiable) ── */
  document.getElementById('alarmIcsBtn').addEventListener('click',function(){
    var hRaw2=parseInt(document.getElementById('alarmHour').value,10);
    var h=isNaN(hRaw2)?8:Math.min(23,Math.max(0,hRaw2));
    var mRaw2=parseInt(document.getElementById('alarmMin').value,10);
    var m=isNaN(mRaw2)?0:Math.min(59,Math.max(0,mRaw2));
    var msg=(document.getElementById('alarmMsg').value.trim()||'Horas Excelia');
    var selDays=[];
    document.querySelectorAll('.alarm-day-btn.on').forEach(function(b){selDays.push(+b.dataset.day);});
    var now=new Date();
    var alarm=new Date(now);
    alarm.setHours(h,m,0,0);
    if(alarm<=now)alarm.setDate(alarm.getDate()+1); // si la hora ya pasó hoy, programar mañana
    var end=new Date(alarm.getTime()+15*60000);
    var fmt=function(d){
      return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')
        +'T'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+'00';
    };
    // Mapeo Android Calendar (1=Dom...7=Sáb) → BYDAY iCal (SU,MO,TU,WE,TH,FR,SA)
    var dayMap={1:'SU',2:'MO',3:'TU',4:'WE',5:'TH',6:'FR',7:'SA'};
    var ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Horas Excelia//ES\r\n'
      +'BEGIN:VEVENT\r\n'
      +'DTSTART:'+fmt(alarm)+'\r\n'
      +'DTEND:'+fmt(end)+'\r\n'
      +'SUMMARY:'+msg+'\r\n';
    if(selDays.length){
      var byday=selDays.map(function(d){return dayMap[d];}).join(',');
      ics+='RRULE:FREQ=WEEKLY;BYDAY='+byday+'\r\n';
    }
    ics+='BEGIN:VALARM\r\nTRIGGER:PT0S\r\nACTION:AUDIO\r\nEND:VALARM\r\n'
      +'END:VEVENT\r\nEND:VCALENDAR';
    var blob=new Blob([ics],{type:'text/calendar'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='alarma.ics';
    a.click();
    URL.revokeObjectURL(a.href);
    document.getElementById('alarmPanel').classList.remove('open');
    showToast('Recordatorio generado \u2014 \u00e1brelo para importar al calendario','success');
  });

  /* ── Menú 3 puntos: exportar/importar TODO + MacroDroid URLs ── */
  document.getElementById('menuBtn').addEventListener('click',function(e){
    e.stopPropagation();
    var menu=document.getElementById('dataMenu');
    var opening=!menu.classList.contains('open');
    if(opening){
      // Poblar inputs con los valores guardados en localStorage
      var mAlarm=document.getElementById('macroAlarmUrlMenu');
      if(mAlarm)mAlarm.value=normalizeMacroBase(localStorage.getItem('excelia-alarm-url')||'');
    }
    menu.classList.toggle('open');
  });
  document.addEventListener('click',function(e){
    var alarmWrap=document.getElementById('alarmWrap');
    if(!alarmWrap||!alarmWrap.contains(e.target)){
      var alarmPanel=document.getElementById('alarmPanel');
      if(alarmPanel)alarmPanel.classList.remove('open');
    }
    var menuWrap=document.querySelector('.data-menu-wrap:last-child');
    if(!menuWrap||!menuWrap.contains(e.target)){
      var menu=document.getElementById('dataMenu');
      if(menu)menu.classList.remove('open');
    }
  });
  /* ── Menú: Limpiar alarmas (MacroDroid webhook) ── */
  document.getElementById('cleanAlarmsBtn').addEventListener('click',function(e){
    e.stopPropagation();
    document.getElementById('dataMenu').classList.remove('open');
    var cleanBase=normalizeMacroBase(localStorage.getItem('excelia-alarm-url')||'');
    if(!cleanBase){showToast('Configura la URL base de MacroDroid en el men\u00fa','error');return;}
    var cleanUrl=cleanBase+'/apagar_alarmas';
    showToast('Limpiando alarmas\u2026','success');
    fetch(cleanUrl,{mode:'no-cors'})
      .then(function(){showToast('\u2705 Alarmas limpiadas','success');})
      .catch(function(){showToast('Error al contactar MacroDroid','error');});
  });

  /* ── Menú: URL MacroDroid crear alarma ── */
  var _mAlarmIn=document.getElementById('macroAlarmUrlMenu');
  if(_mAlarmIn){
    _mAlarmIn.addEventListener('change',function(){
      var v=normalizeMacroBase(this.value);
      this.value=v;
      localStorage.setItem('excelia-alarm-url',v);
      // Sincronizar con el panel de alarma del header
      var panelIn=document.getElementById('alarmMacroUrl');
      if(panelIn)panelIn.value=v;
    });
    _mAlarmIn.addEventListener('click',function(e){e.stopPropagation();});
  }

  document.getElementById('exportAllBtn').addEventListener('click',function(){
    var data={version:2,days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE,
      exclFest:EXCL_FEST,exclVac:EXCL_VAC,vacEntitlement:VAC_ENTITLEMENT,
      birthdays:BDAYS,events:EVENTS};
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(data,null,2));
    a.download='horas-excelia-backup.json';
    a.click();
    showToast('Backup completo exportado','success');
  });
  document.getElementById('importAllBtn').addEventListener('click',function(){
    document.getElementById('importAllFile').click();
  });
  document.getElementById('importAllFile').addEventListener('change',function(ev){
    var f=ev.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(e){
      try{
        var d=JSON.parse(e.target.result);
        if(d.days)ST=d.days;
        if(d.sent)SW=d.sent;
        if(d.monthH)MONTH_H=d.monthH;
        if(d.rate)DAILY_RATE=d.rate;
        if(typeof d.exclFest!=='undefined')EXCL_FEST=d.exclFest;
        if(typeof d.exclVac!=='undefined')EXCL_VAC=d.exclVac;
        if(d.vacEntitlement){VAC_ENTITLEMENT=d.vacEntitlement;saveVacEntitlement(d.vacEntitlement);}
        if(d.birthdays&&Array.isArray(d.birthdays)){BDAYS=d.birthdays;localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));}
        if(d.events&&Array.isArray(d.events)){EVENTS=d.events;saveEvents();}
        save();render();
        updateBdayBtn();updateEventsBtn();
        showToast('Backup completo importado','success');
      }catch(err){showToast('Error al importar: archivo inv\u00e1lido','error');}
    };
    r.readAsText(f);
    ev.target.value='';
  });

  /* ── Bottom sheet: overlay de fondo ── */
  document.getElementById('overlay').addEventListener('click',closeSheet);

  /* ── Bottom sheet: opciones de tipo de día ── */
  document.querySelectorAll('.sheet-option').forEach(function(opt){
    opt.addEventListener('click',function(){selectType(opt.dataset.type);});
  });

  /* ── Chips de horas por día (dentro del sheet) ── */
  document.querySelectorAll('.hour-chip-day').forEach(function(chip){
    chip.addEventListener('click',function(){
      if(!ED)return;
      var h=+chip.dataset.h;
      var k=dk(ED);
      if(ST[k]&&ST[k].type)return; // bloqueado si día no-normal (vac/fest/aus)
      ST[k]={hours:h};
      save();render();closeSheet();
    });
  });

  /* ── Tema visual: botón en menú ── */
  document.getElementById('themeBtn').addEventListener('click',function(e){
    e.stopPropagation();
    cycleTheme();
  });

  /* ── Aplicar tema al inicio (y actualizar etiqueta del botón) ── */
  applyTheme(THEME);
  updateThemeBtn();


  /* ── SW update: botón Actualizar en menú ⋯ ── */
  var _swUpdBtn=document.getElementById('swUpdBtn');
  if(_swUpdBtn)_swUpdBtn.addEventListener('click',function(){
    var mb=document.getElementById('menuBtn');
    if(mb)mb.classList.remove('has-update');
    window.location.reload();
  });

  /* ── Service Worker: muestra botón Actualizar en menú cuando hay nueva versión ── */
  if('serviceWorker' in navigator){
    var _swShown=false;
    function _showUpdateBar(){
      if(_swShown)return;
      _swShown=true;
      var btn=document.getElementById('swUpdBtn');
      if(btn)btn.style.display='';
      // Badge visible en botón ⋯
      var mb=document.getElementById('menuBtn');
      if(mb)mb.classList.add('has-update');
      // Toast de aviso
      if(typeof showToast==='function')
        showToast('\uD83D\uDD04 Nueva versi\u00f3n disponible \u2014 abre \u22ef para actualizar','success');
    }
    // Método 1: controllerchange — el más fiable (skipWaiting activó el nuevo SW)
    navigator.serviceWorker.addEventListener('controllerchange',_showUpdateBar);
    // Método 2: updatefound — detecta instalación en curso
    navigator.serviceWorker.ready.then(function(reg){
      reg.addEventListener('updatefound',function(){
        var nw=reg.installing;
        if(!nw)return;
        nw.addEventListener('statechange',function(){
          if(nw.state==='installed'&&navigator.serviceWorker.controller){
            _showUpdateBar();
          }
        });
      });
    });
    // Método 3: mensaje del SW (compatibilidad)
    navigator.serviceWorker.addEventListener('message',function(ev){
      if(ev.data&&ev.data.type==='SW_UPDATED')_showUpdateBar();
    });
  }

  /* ── Home Popup: semanas sin marcar + VIP sin alarma ── */
  (function(){
    try{
      if(sessionStorage.getItem('excelia-popup-dismissed'))return;
    }catch(e){}
    var items=[];
    // Semanas pasadas sin enviar (hasta 8 semanas atrás)
    var today=new Date();today.setHours(0,0,0,0);
    for(var w=1;w<=8;w++){
      var d=new Date(today);
      var dow=d.getDay();var off=dow===0?6:dow-1;
      d.setDate(d.getDate()-off-(w*7)); // Lunes de la semana w
      var fri=new Date(d);fri.setDate(fri.getDate()+4);
      if(fri>=today)continue; // Viernes no ha pasado aún
      var key=dk(d);
      if(SW[key])continue; // Ya enviada
      // ¿Tiene días laborables no-festivos?
      var hasWork=false;
      for(var di=0;di<5;di++){
        var wd=new Date(d);wd.setDate(wd.getDate()+di);
        var t=dayT(wd);
        if(t==='normal'||t==='vacaciones'||t==='ausencia'){hasWork=true;break;}
      }
      if(!hasWork)continue;
      var lunes=d;
      var lbl='Semana del '+String(lunes.getDate()).padStart(2,'0')+'/'+String(lunes.getMonth()+1).padStart(2,'0');
      items.push({type:'warn',text:'&#128221; '+lbl+' sin enviar'});
    }
    // VIP cumpleaños próximos (14 días) sin alarma
    if(typeof BDAYS!=='undefined'&&BDAYS.length&&typeof isBdayAlarmSet==='function'){
      BDAYS.forEach(function(b){
        if(!b.vip)return;
        var bd=new Date(today.getFullYear(),b.month-1,b.day);
        if(bd<today)bd.setFullYear(today.getFullYear()+1);
        var diff=Math.round((bd-today)/86400000);
        if(diff>14)return;
        if(isBdayAlarmSet(b))return;
        var label=b.name+(diff===0?' (hoy!)':diff===1?' (ma\u00f1ana!)':' (en '+diff+'d)');
        items.push({type:'vip',text:'&#11088; '+label+' \u2014 sin alarma'});
      });
    }
    if(!items.length)return;
    var content=document.getElementById('homePopupContent');
    if(!content)return;
    var html='<div class="home-popup-title">&#128276; Recordatorios</div>';
    items.forEach(function(it){
      html+='<div class="home-popup-item '+it.type+'">'+it.text+'</div>';
    });
    content.innerHTML=html;
    document.getElementById('homePopup').style.display='flex';
    function dismissPopup(){
      document.getElementById('homePopup').style.display='none';
      try{sessionStorage.setItem('excelia-popup-dismissed','1');}catch(e){}
    }
    var closeBtn=document.getElementById('homePopupClose');
    var dismissBtn=document.getElementById('homePopupDismiss');
    if(closeBtn)closeBtn.addEventListener('click',dismissPopup);
    if(dismissBtn)dismissBtn.addEventListener('click',dismissPopup);
  })();
})();
