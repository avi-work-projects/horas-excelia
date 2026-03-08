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

  /* ── TEST: botón dummy de alarma Android ── */
  document.getElementById('alarmTestBtn').addEventListener('click',function(){
    var tomorrow=new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    var msg='Test alarma - '+tomorrow.getDate()+'/'+(tomorrow.getMonth()+1)+'/'+tomorrow.getFullYear();
    var intentUrl='intent:#Intent'
      +';action=android.intent.action.SET_ALARM'
      +';S.android.intent.extra.alarm.MESSAGE='+encodeURIComponent(msg)
      +';i.android.intent.extra.alarm.HOUR=9'
      +';i.android.intent.extra.alarm.MINUTES=0'
      +';B.android.intent.extra.alarm.SKIP_UI=false'
      +';end';
    var a=document.createElement('a');
    a.href=intentUrl;
    a.click();
    showToast('Intentando abrir alarma nativa...','success');
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
})();
