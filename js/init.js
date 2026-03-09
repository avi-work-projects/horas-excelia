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
  document.getElementById('exportBtn').addEventListener('click',function(){
    var data={version:2,days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE,exclFest:EXCL_FEST,exclVac:EXCL_VAC};
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(data,null,2));
    a.download='horas-excelia-dias.json';
    a.click();
    showToast('Datos exportados','success');
  });

  /* ── Importar datos (solo días/semanas/jornada) ── */
  document.getElementById('importBtn').addEventListener('click',function(){
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
    }
    panel.classList.toggle('open');
  });

  /* ── Alarma: toggle MacroDroid ── */
  document.getElementById('alarmUseMacro').addEventListener('change',function(){
    var checked=this.checked;
    document.getElementById('alarmMacroUrl').disabled=!checked;
    localStorage.setItem('excelia-alarm-macro',checked?'1':'0');
  });
  document.getElementById('alarmMacroUrl').addEventListener('change',function(){
    localStorage.setItem('excelia-alarm-url',this.value.trim());
  });

  document.getElementById('alarmCreateBtn').addEventListener('click',function(){
    var h=Math.min(23,Math.max(0,parseInt(document.getElementById('alarmHour').value,10)||8));
    var m=Math.min(59,Math.max(0,parseInt(document.getElementById('alarmMin').value,10)||0));
    var msg=(document.getElementById('alarmMsg').value.trim()||'Horas Excelia');
    var useMacro=document.getElementById('alarmUseMacro').checked;
    document.getElementById('alarmPanel').classList.remove('open');

    if(useMacro){
      // MacroDroid webhook: URL remota (https://trigger.macrodroid.com/…)
      var macroUrl=(document.getElementById('alarmMacroUrl').value||'').trim();
      if(!macroUrl){
        showToast('Pega la URL del webhook de MacroDroid','error');
        document.getElementById('alarmPanel').classList.add('open');
        return;
      }
      var sep=macroUrl.indexOf('?')>=0?'&':'?';
      // Parámetros nombrados igual que las variables globales de MacroDroid
      var url=macroUrl+sep+'alarmH='+h+'&alarmM='+m+'&alarmMsg='+encodeURIComponent(msg);
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
      window.open('intent://alarm/#Intent'+base+';package=com.vivo.clock;end','_blank');
      showToast('Abriendo reloj \u2014 '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'),'success');
    }
  });

  /* ── Alarma: fallback .ics (recordatorio de calendario, 100% fiable) ── */
  document.getElementById('alarmIcsBtn').addEventListener('click',function(){
    var h=Math.min(23,Math.max(0,parseInt(document.getElementById('alarmHour').value,10)||8));
    var m=Math.min(59,Math.max(0,parseInt(document.getElementById('alarmMin').value,10)||0));
    var msg=(document.getElementById('alarmMsg').value.trim()||'Horas Excelia');
    var now=new Date();
    var alarm=new Date(now);
    alarm.setHours(h,m,0,0);
    if(alarm<=now)alarm.setDate(alarm.getDate()+1); // si la hora ya pasó hoy, programar mañana
    var end=new Date(alarm.getTime()+15*60000);
    var fmt=function(d){
      return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')
        +'T'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+'00';
    };
    var ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Horas Excelia//ES\r\n'
      +'BEGIN:VEVENT\r\n'
      +'DTSTART:'+fmt(alarm)+'\r\n'
      +'DTEND:'+fmt(end)+'\r\n'
      +'SUMMARY:'+msg+'\r\n'
      +'BEGIN:VALARM\r\nTRIGGER:PT0S\r\nACTION:AUDIO\r\nEND:VALARM\r\n'
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

  /* ── Menú 3 puntos: exportar/importar TODO ── */
  document.getElementById('menuBtn').addEventListener('click',function(e){
    e.stopPropagation();
    var menu=document.getElementById('dataMenu');
    menu.classList.toggle('open');
  });
  document.addEventListener('click',function(){
    var menu=document.getElementById('dataMenu');
    if(menu)menu.classList.remove('open');
    var alarmPanel=document.getElementById('alarmPanel');
    if(alarmPanel)alarmPanel.classList.remove('open');
  });
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

  /* ── Build badge ── */
  if(typeof BUILD!=='undefined'&&BUILD){
    var bb=document.createElement('div');
    bb.className='build-badge';
    var dot=document.createElement('div');
    dot.className='build-dot';
    dot.style.background=BUILD.ok?'#34d399':'#ff6b6b';
    bb.appendChild(dot);
    bb.appendChild(document.createTextNode(BUILD.sha||'local'));
    document.body.appendChild(bb);
  }

  /* ── SW update bar: botón Actualizar ── */
  var _swUpdBtn=document.getElementById('swUpdBtn');
  if(_swUpdBtn)_swUpdBtn.addEventListener('click',function(){window.location.reload();});

  /* ── Service Worker: barra persistente de nueva versión ── */
  if('serviceWorker' in navigator){
    var _swShown=false;
    function _showUpdateBar(){
      if(_swShown)return;
      _swShown=true;
      var bar=document.getElementById('swUpdateBar');
      if(bar)bar.classList.add('show');
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
})();
