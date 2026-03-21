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

  /* ── Logo gallery popup (horizontal scroll-snap) ── */
  var _logoBtn=document.getElementById('appLogoBtn');
  var _logoPopup=document.getElementById('logoPopup');
  var _logoCloseBtn=document.getElementById('logoPopupClose');
  var _logoGallery=document.getElementById('logoGallery');
  var _logoDots=document.getElementById('logoGalleryDots');
  var _logoCount=_logoGallery?_logoGallery.querySelectorAll('.logo-gallery-slide').length:0;
  var _logoIdx=0;
  function _logoUpdateDots(){
    if(!_logoDots)return;
    var h='';
    for(var i=0;i<_logoCount;i++)h+='<span class="logo-gallery-dot'+(i===_logoIdx?' active':'')+'"></span>';
    _logoDots.innerHTML=h;
  }
  if(_logoBtn&&_logoPopup){
    _logoBtn.addEventListener('click',function(){
      _logoIdx=0;
      if(_logoGallery)_logoGallery.scrollLeft=0;
      _logoUpdateDots();
      _logoPopup.classList.add('open');
    });
    _logoPopup.addEventListener('click',function(e){if(e.target===_logoPopup)_logoPopup.classList.remove('open');});
    if(_logoCloseBtn)_logoCloseBtn.addEventListener('click',function(){_logoPopup.classList.remove('open');});
    /* Sync dots on scroll */
    if(_logoGallery){
      _logoGallery.addEventListener('scroll',function(){
        var w=_logoGallery.offsetWidth;
        if(w>0){_logoIdx=Math.round(_logoGallery.scrollLeft/w);}
        _logoUpdateDots();
      });
      /* Dot clicks → scroll to slide */
      _logoDots.addEventListener('click',function(e){
        var dot=e.target.closest('.logo-gallery-dot');
        if(!dot)return;
        var dots=_logoDots.querySelectorAll('.logo-gallery-dot');
        for(var i=0;i<dots.length;i++){if(dots[i]===dot){
          _logoIdx=i;
          _logoGallery.scrollTo({left:i*_logoGallery.offsetWidth,behavior:'smooth'});
          _logoUpdateDots();
          break;
        }}
      });
    }
  }

  /* ── Active state on header data-btn (highlights current open overlay) ── */
  var _ovBtnMap={econOverlay:'econBtn',bdayOverlay:'bdayBtn',eventsOverlay:'eventsBtn',estudioOverlay:'estudioBtn'};
  function _updateHeaderActive(){
    var openKey=null;
    Object.keys(_ovBtnMap).forEach(function(ovId){
      var ov=document.getElementById(ovId);
      if(ov&&ov.classList.contains('open'))openKey=_ovBtnMap[ovId];
    });
    ['econBtn','bdayBtn','eventsBtn','estudioBtn','homeBtn'].forEach(function(id){
      var btn=document.getElementById(id);if(btn)btn.classList.remove('overlay-active');
    });
    var activeBtn=document.getElementById(openKey||'homeBtn');
    if(activeBtn)activeBtn.classList.add('overlay-active');
  }
  if(typeof MutationObserver!=='undefined'){
    Object.keys(_ovBtnMap).forEach(function(ovId){
      var ov=document.getElementById(ovId);
      if(ov)new MutationObserver(_updateHeaderActive).observe(ov,{attributes:true,attributeFilter:['class']});
    });
  }
  _updateHeaderActive();

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

  /* ── Exportar CSV del año ── */
  document.getElementById('csvExportBtn').addEventListener('click',function(){
    var year=CY;
    var now=new Date();
    var ts=now.getFullYear()+
      String(now.getMonth()+1).padStart(2,'0')+
      String(now.getDate()).padStart(2,'0')+'_'+
      String(now.getHours()).padStart(2,'0')+
      String(now.getMinutes()).padStart(2,'0')+
      String(now.getSeconds()).padStart(2,'0');
    var lines=['Fecha,Estado'];
    var d=new Date(year,0,1);
    while(d.getFullYear()===year){
      var w=d.getDay();
      if(w>=1&&w<=5){
        var t=dayT(d);
        var estado;
        if(t==='ausencia') estado='baja';
        else if(t==='festivo'||t==='vacaciones') estado='festivo/vacaciones';
        else estado='trabajado';
        lines.push(dk(d)+','+estado);
      }
      d.setDate(d.getDate()+1);
    }
    var csv=lines.join('\n');
    var blob=new Blob(['\uFEFF'+csv],{type:'text/csv'});
    var fname='dias_trabajados_'+year+'_'+ts+'.csv';
    shareOrDownload(blob,fname);
    showToast('CSV exportado','success');
  });

  /* ── Exportar PDF del año ── */
  document.getElementById('pdfExportBtn').addEventListener('click',function(){
    if(typeof jspdf==='undefined'&&typeof window.jspdf==='undefined'){
      showToast('Error: librería jsPDF no cargada','error');return;
    }
    var jsPDF=(window.jspdf||jspdf).jsPDF;
    var doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    var year=CY;
    var pageW=doc.internal.pageSize.getWidth();
    var marginL=12,marginR=12,usableW=pageW-marginL-marginR;

    // ── Colores ──
    var cAccent=[90,130,255];   // azul accent
    var cFestivo=[255,107,107]; // rojo festivo
    var cVac=[52,211,153];      // verde vacaciones
    var cAus=[251,191,36];      // amarillo ausencia
    var cGray=[140,140,160];
    var cDark=[30,30,40];
    var cWhite=[255,255,255];
    var cSent=[90,130,255];

    // ── Título ──
    doc.setFontSize(18);
    doc.setTextColor.apply(doc,cAccent);
    doc.text('Registro de Horas '+year,pageW/2,18,{align:'center'});
    doc.setFontSize(8);
    doc.setTextColor.apply(doc,cGray);
    doc.text('Generado: '+new Date().toLocaleDateString('es-ES'),pageW/2,24,{align:'center'});

    // ── Resumen anual ──
    var s=computeYearlySummary(year);
    var yOff=32;
    doc.setFontSize(11);
    doc.setTextColor.apply(doc,cDark);
    doc.text('Resumen Anual',marginL,yOff);
    yOff+=2;

    doc.autoTable({
      startY:yOff,
      margin:{left:marginL,right:marginR},
      theme:'grid',
      headStyles:{fillColor:cAccent,textColor:cWhite,fontSize:7,halign:'center',cellPadding:1.5},
      bodyStyles:{fontSize:7,halign:'center',cellPadding:1.5},
      columnStyles:{0:{halign:'left',fontStyle:'bold'}},
      head:[['','Pasados','Futuros','Total']],
      body:[
        ['Días trabajados',String(s.worked),String(s.toWork),String(s.workedTotal)],
        ['Horas trabajadas',s.hoursWorked.toFixed(1),s.hoursToWork.toFixed(1),s.hoursTotal.toFixed(1)],
        ['Vacaciones',String(s.vacTaken),String(s.vacFuture),String(s.vacTotal)],
        ['Festivos',String(s.festTaken),String(s.festFuture),String(s.festTotal)],
        ['Ausencias',String(s.ausTaken),String(s.ausFuture),String(s.ausTotal)]
      ]
    });

    yOff=doc.lastAutoTable.finalY+8;

    // ── Tabla resumen por meses ──
    doc.setFontSize(11);
    doc.setTextColor.apply(doc,cDark);
    doc.text('Resumen por Meses',marginL,yOff);
    yOff+=2;

    var mBody=[];
    for(var mi=0;mi<12;mi++){
      var mh=s.mHours[mi]+s.mHoursP[mi];
      var md=s.mDays[mi]+s.mDaysP[mi];
      mBody.push([MN[mi],String(md),mh.toFixed(1)]);
    }
    mBody.push(['TOTAL',String(s.workedTotal),s.hoursTotal.toFixed(1)]);

    doc.autoTable({
      startY:yOff,
      margin:{left:marginL,right:marginR},
      theme:'grid',
      headStyles:{fillColor:cAccent,textColor:cWhite,fontSize:7,halign:'center',cellPadding:1.5},
      bodyStyles:{fontSize:7,halign:'center',cellPadding:1.5},
      columnStyles:{0:{halign:'left',fontStyle:'bold'}},
      head:[['Mes','Días','Horas']],
      body:mBody,
      didParseCell:function(data){
        if(data.section==='body'&&data.row.index===12){
          data.cell.styles.fontStyle='bold';
          data.cell.styles.fillColor=[240,240,250];
        }
      }
    });

    // ── Detalle mensual: cada mes en una página ──
    var dayNames=['','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    var typeLabels={normal:'Normal',festivo:'Festivo',vacaciones:'Vacaciones',ausencia:'Ausencia'};

    for(var m=0;m<12;m++){
      doc.addPage();
      var py=14;

      // Título del mes
      doc.setFontSize(14);
      doc.setTextColor.apply(doc,cAccent);
      doc.text(MN[m]+' '+year,pageW/2,py,{align:'center'});
      py+=3;

      // Jornada del mes
      doc.setFontSize(7);
      doc.setTextColor.apply(doc,cGray);
      var mhDef=getMonthH(year,m,1);
      doc.text('Jornada por defecto: '+mhDef+'h/día  |  Viernes: 6,5h',pageW/2,py+4,{align:'center'});
      py+=8;

      // Construir tabla de días del mes
      var daysInMonth=new Date(year,m+1,0).getDate();
      var rows=[];
      var monthHours=0,monthDays=0;

      for(var dd=1;dd<=daysInMonth;dd++){
        var dt=new Date(year,m,dd);
        var w=dt.getDay();
        if(w===0||w===6) continue; // skip weekends

        var k=dk(dt);
        var tipo=dayT(dt);
        var hrs=dayH(dt);
        var wkey=dk(ad(dt,-(w-1))); // monday of this week
        // Check if week is sent (find monday)
        var monday=new Date(dt);
        monday.setDate(monday.getDate()-(w===0?6:w-1));
        var isSent=!!SW[dk(monday)];

        var tipoStr=typeLabels[tipo]||tipo;
        var hrsStr=hrs>0?(hrs%1===0?hrs+'h':hrs.toFixed(1)+'h'):'—';
        var sentStr=isSent?'✓':'';

        if(tipo==='normal'&&hrs>0){monthHours+=hrs;monthDays++;}

        rows.push([
          String(dd).padStart(2,'0')+'/'+String(m+1).padStart(2,'0'),
          dayNames[w],
          tipoStr,
          hrsStr,
          sentStr
        ]);
      }

      // Fila total
      rows.push([
        'TOTAL','',String(monthDays)+' días',
        (monthHours%1===0?monthHours+'h':monthHours.toFixed(1)+'h'),
        ''
      ]);

      doc.autoTable({
        startY:py,
        margin:{left:marginL,right:marginR},
        theme:'grid',
        headStyles:{fillColor:cAccent,textColor:cWhite,fontSize:7,halign:'center',cellPadding:1.5},
        bodyStyles:{fontSize:7,cellPadding:1.5},
        columnStyles:{
          0:{halign:'center',cellWidth:20},
          1:{halign:'left',cellWidth:22},
          2:{halign:'center',cellWidth:22},
          3:{halign:'center',cellWidth:16},
          4:{halign:'center',cellWidth:14}
        },
        head:[['Fecha','Día','Tipo','Horas','Enviada']],
        body:rows,
        didParseCell:function(data){
          if(data.section!=='body')return;
          var isLast=data.row.index===rows.length-1;
          if(isLast){
            data.cell.styles.fontStyle='bold';
            data.cell.styles.fillColor=[240,240,250];
            return;
          }
          var tipo=data.row.raw[2];
          if(tipo==='Festivo'){
            data.cell.styles.textColor=cFestivo;
          } else if(tipo==='Vacaciones'){
            data.cell.styles.textColor=cVac;
          } else if(tipo==='Ausencia'){
            data.cell.styles.textColor=cAus;
          }
          // Sent badge
          if(data.column.index===4&&data.cell.raw==='✓'){
            data.cell.styles.textColor=cSent;
            data.cell.styles.fontStyle='bold';
          }
        }
      });

      py=doc.lastAutoTable.finalY+6;

      // Resumen del mes abajo
      doc.setFontSize(8);
      doc.setTextColor.apply(doc,cGray);
      var festM=0,vacM=0,ausM=0;
      for(var dd2=1;dd2<=daysInMonth;dd2++){
        var dt2=new Date(year,m,dd2);
        var w2=dt2.getDay();
        if(w2===0||w2===6)continue;
        var t2=dayT(dt2);
        if(t2==='festivo')festM++;
        else if(t2==='vacaciones')vacM++;
        else if(t2==='ausencia')ausM++;
      }
      var parts=[];
      if(festM)parts.push(festM+' festivo'+(festM>1?'s':''));
      if(vacM)parts.push(vacM+' vacaciones');
      if(ausM)parts.push(ausM+' ausencia'+(ausM>1?'s':''));
      if(parts.length){
        doc.text(parts.join('  |  '),pageW/2,py,{align:'center'});
      }
    }

    // ── Guardar ──
    var pdfBlob=doc.output('blob');
    shareOrDownload(pdfBlob,'horas-'+year+'.pdf');
    showToast('PDF exportado: horas-'+year+'.pdf','success');
  });

  /* ── Botones del header (overlays) ── */
  document.getElementById('econBtn').addEventListener('click',openEcon);
  document.getElementById('bdayBtn').addEventListener('click',openBday);
  document.getElementById('eventsBtn').addEventListener('click',openEvents);
  document.getElementById('estudioBtn').addEventListener('click',openEstudio);

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
      // Construir botones de días ordenados desde hoy con fecha debajo
      buildAlarmDayBtns();
    }
    panel.classList.toggle('open');
    if(opening){
      // Drum pickers: inicializar DESPUÉS de que el panel sea visible (display:none → flex)
      var _dH=parseInt(localStorage.getItem('excelia-alarm-h')||'9',10);
      var _dM=parseInt(localStorage.getItem('excelia-alarm-m')||'20',10);
      buildDrumPicker('drumHour',24,_dH);
      buildDrumPicker('drumMin',60,_dM);
    }
  });

  /* ── Drum picker: selector giratorio de hora/minuto ── */
  var DRUM_ITEM_H=44,DRUM_CYCLES=3,_drumWrapTimer=null;
  function buildDrumPicker(id,count,initVal){
    var drum=document.getElementById(id);if(!drum)return;
    drum._count=count;
    drum.innerHTML='';
    var padT=document.createElement('div');padT.style.height=DRUM_ITEM_H+'px';drum.appendChild(padT);
    for(var c=0;c<DRUM_CYCLES;c++){
      for(var _i=0;_i<count;_i++){
        var item=document.createElement('div');item.className='drum-picker-item';
        item.textContent=String(_i).padStart(2,'0');item.dataset.val=_i;drum.appendChild(item);
      }
    }
    var padB=document.createElement('div');padB.style.height=DRUM_ITEM_H+'px';drum.appendChild(padB);
    // Arrancar en el ciclo central para poder rotar en ambas direcciones
    var _target=(Math.floor(DRUM_CYCLES/2)*count+Math.max(0,initVal))*DRUM_ITEM_H;
    setTimeout(function(){
      if(drum.scrollTo)drum.scrollTo({top:_target,behavior:'instant'});
      else drum.scrollTop=_target;
      setTimeout(function(){updateDrumSelected(drum);},10);
    },50);
    if(!drum._drumEv){
      drum._drumEv=true;
      drum.addEventListener('scroll',function(){
        updateDrumSelected(drum);
        // Al rotar minutos: detectar wrap de ciclo y avanzar/retroceder hora
        if(id==='drumMin'){clearTimeout(_drumWrapTimer);_drumWrapTimer=setTimeout(checkDrumMinuteWrap,200);}
      },{passive:true});
    }
  }
  function updateDrumSelected(drum){
    // Resaltar por posición absoluta (no por data-val, ya que hay 3 ciclos con el mismo valor)
    var total=Math.max(0,Math.round(drum.scrollTop/DRUM_ITEM_H));
    var items=drum.querySelectorAll('.drum-picker-item');
    items.forEach(function(it,idx){it.classList.toggle('drum-selected',idx===total);});
  }
  function getDrumValue(id){
    var drum=document.getElementById(id);if(!drum)return 0;
    var count=drum._count||60;
    return Math.max(0,Math.round(drum.scrollTop/DRUM_ITEM_H))%count;
  }
  /* Detecta si los minutos salieron del ciclo central y ajusta la hora ±1 */
  function checkDrumMinuteWrap(){
    _drumWrapTimer=null;
    var minDrum=document.getElementById('drumMin');
    var hourDrum=document.getElementById('drumHour');
    if(!minDrum||!hourDrum)return;
    var minCount=minDrum._count||60;
    var midMin=Math.floor(DRUM_CYCLES/2)*minCount; // índice del inicio del ciclo central
    var total=Math.round(minDrum.scrollTop/DRUM_ITEM_H);
    if(total>=midMin&&total<midMin+minCount)return; // ya en ciclo central, nada que hacer
    // Cuántos ciclos completos fuera del centro (neg=atrás, pos=adelante)
    var delta=Math.floor((total-midMin)/minCount);
    // Ajustar hora
    var hourCount=hourDrum._count||24;
    var curHourTotal=Math.round(hourDrum.scrollTop/DRUM_ITEM_H);
    var newHourTotal=Math.max(0,Math.min(DRUM_CYCLES*hourCount-1,curHourTotal+delta));
    if(newHourTotal!==curHourTotal){
      if(hourDrum.scrollTo)hourDrum.scrollTo({top:newHourTotal*DRUM_ITEM_H,behavior:'smooth'});
      else hourDrum.scrollTop=newHourTotal*DRUM_ITEM_H;
      updateDrumSelected(hourDrum);
    }
    // Re-centrar minutos en ciclo central (mismo valor, sin salto visual)
    var minVal=((total%minCount)+minCount)%minCount;
    var newMinTotal=midMin+minVal;
    setTimeout(function(){
      if(minDrum.scrollTo)minDrum.scrollTo({top:newMinTotal*DRUM_ITEM_H,behavior:'instant'});
      else minDrum.scrollTop=newMinTotal*DRUM_ITEM_H;
      updateDrumSelected(minDrum);
    },50);
  }

  /* ── Alarma: botones días de semana (generados dinámicamente, ordenados desde hoy) ── */
  function buildAlarmDayBtns(){
    var container=document.getElementById('alarmDaysBtns');
    if(!container)return;
    // Letras de día (JS getDay(): 0=Dom,1=Lun,...,6=Sáb)
    var DN=['D','L','M','X','J','V','S'];
    var today=new Date();
    var todayJs=today.getDay();
    var savedDays=(localStorage.getItem('excelia-alarm-days')||'').split(',').filter(Boolean);
    var html='';
    for(var i=0;i<7;i++){
      var jsDay=(todayJs+i)%7;
      var d=new Date(today);d.setDate(today.getDate()+i);
      var ddmm=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
      var androidDay=jsDay+1; // Android: 1=Dom,2=Lun,...,7=Sáb
      var isOn=savedDays.indexOf(String(androidDay))>=0;
      html+='<button class="alarm-day-btn'+(isOn?' on':'')+'" data-day="'+androidDay+'" type="button">'+DN[jsDay]+'<span class="alarm-day-date">'+ddmm+'</span></button>';
    }
    container.innerHTML=html;
    container.querySelectorAll('.alarm-day-btn').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        btn.classList.toggle('on');
        var sel=[];
        container.querySelectorAll('.alarm-day-btn.on').forEach(function(b){sel.push(b.dataset.day);});
        localStorage.setItem('excelia-alarm-days',sel.join(','));
      });
    });
  }

  /* ── Alarma: confirmación si la hora ya pasó hoy ── */
  function showAlarmPastConfirm(htmlMsg,onConfirm){
    var existing=document.getElementById('alarmPastConfirm');
    if(existing)existing.remove();
    var dlg=document.createElement('div');
    dlg.id='alarmPastConfirm';
    dlg.className='alarm-past-confirm';
    dlg.innerHTML='<div class="alarm-past-confirm-msg">'+htmlMsg+'</div>'
      +'<div class="alarm-past-confirm-btns">'
      +'<button class="alarm-past-btn-ok" id="alarmPastOk">Continuar</button>'
      +'<button class="alarm-past-btn-cancel" id="alarmPastCancel">Cancelar</button>'
      +'</div>';
    document.getElementById('alarmPanel').appendChild(dlg);
    document.getElementById('alarmPastOk').addEventListener('click',function(e){
      e.stopPropagation();dlg.remove();onConfirm();
    });
    document.getElementById('alarmPastCancel').addEventListener('click',function(e){
      e.stopPropagation();dlg.remove();
    });
  }

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

  document.getElementById('alarmCreateBtn').addEventListener('click',function(){
    var h=getDrumValue('drumHour');
    var m=getDrumValue('drumMin');
    localStorage.setItem('excelia-alarm-h',h);
    localStorage.setItem('excelia-alarm-m',m);
    var msg=(document.getElementById('alarmMsg').value.trim()||'Horas Excelia');
    var useMacro=document.getElementById('alarmUseMacro').checked;
    var selDays=[];
    document.querySelectorAll('.alarm-day-btn.on').forEach(function(b){selDays.push(+b.dataset.day);});
    var macroBase='';
    if(useMacro){
      macroBase=normalizeMacroBase(document.getElementById('alarmMacroUrl').value||'');
      if(!macroBase){showToast('Pega la URL del webhook de MacroDroid','error');return;}
    }
    // Detectar si la hora ya ha pasado hoy y hoy está seleccionado
    var now=new Date();
    var todayJs=now.getDay(); // 0=Dom...6=Sáb
    var todayAndroid=todayJs+1; // Android: 1=Dom,2=Lun,...,7=Sáb
    var nowMins=now.getHours()*60+now.getMinutes();
    var alarmMins=h*60+m;
    var todaySelected=selDays.indexOf(todayAndroid)>=0;
    var needsConfirm=todaySelected&&nowMins>=alarmMins;
    function proceed(){
      document.getElementById('alarmPanel').classList.remove('open');
      if(useMacro){
        // alarmDays siempre presente: valor vacío = sin días (alarma puntual), evita que MacroDroid no sustituya {v=alarmDays}
        var url=macroBase+'/generar_alarma1?alarmH='+h+'&alarmM='+m+'&alarmMsg='+encodeURIComponent(msg)+'&alarmDays='+(selDays.length?selDays.join(','):'');
        if(typeof addAlarm==='function'){
          addAlarm({type:'other',label:msg,hour:h,minute:m,days:selDays.length?selDays.slice():null,targetDate:null});
        }
        showToast('Enviando a MacroDroid\u2026','success');
        fetch(url,{mode:'no-cors'})
          .then(function(){showToast('\u23f0 Alarma enviada \u2014 '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'),'success');})
          .catch(function(){showToast('Error al contactar MacroDroid','error');});
      } else {
        var base=';action=android.intent.action.SET_ALARM'
          +';S.android.intent.extra.alarm.MESSAGE='+encodeURIComponent(msg)
          +';i.android.intent.extra.alarm.HOUR='+h
          +';i.android.intent.extra.alarm.MINUTES='+m
          +';b.android.intent.extra.alarm.SKIP_UI=false';
        if(selDays.length)base+=';ia.android.intent.extra.alarm.DAYS='+selDays.join(',');
        window.open('intent://alarm/#Intent'+base+';package=com.vivo.clock;end','_blank');
        showToast('Abriendo reloj \u2014 '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'),'success');
      }
    }
    if(needsConfirm){
      // Calcular cuándo sonará por primera vez entre todos los días seleccionados
      var DN_ES=['domingo','lunes','martes','mi\u00e9rcoles','jueves','viernes','s\u00e1bado'];
      var minDiff=999,firstDay='',firstDate='';
      selDays.forEach(function(ad){
        var targetJs=ad-1;
        var diff=(targetJs-todayJs+7)%7;
        if(diff===0&&nowMins>=alarmMins)diff=7; // perdido hoy → siguiente semana
        if(diff<minDiff){
          minDiff=diff;
          var dd=new Date(now);dd.setDate(now.getDate()+diff);
          firstDay=DN_ES[dd.getDay()];
          firstDate=dd.getDate()+'/'+(dd.getMonth()+1);
        }
      });
      var timeStr=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
      var warnMsg='\u26a0\ufe0f La hora <strong>'+timeStr+'</strong> ya ha pasado hoy.<br>'
        +'Esta alarma sonar\u00e1 por primera vez el pr\u00f3ximo <strong>'+firstDay+' '+firstDate+'</strong>.<br>\u00bfDeseas continuar?';
      showAlarmPastConfirm(warnMsg,proceed);
    } else {
      proceed();
    }
  });

  /* ── Alarma: fallback .ics (recordatorio de calendario, 100% fiable) ── */
  document.getElementById('alarmIcsBtn').addEventListener('click',function(){
    var h=getDrumValue('drumHour');
    var m=getDrumValue('drumMin');
    localStorage.setItem('excelia-alarm-h',h);
    localStorage.setItem('excelia-alarm-m',m);
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
  /* ── Menú: Gestión de alarmas ── */
  var _alarmsMgmtBtn=document.getElementById('alarmsMgmtBtn');
  if(_alarmsMgmtBtn){
    _alarmsMgmtBtn.addEventListener('click',function(e){
      e.stopPropagation();
      document.getElementById('dataMenu').classList.remove('open');
      if(typeof openAlarms==='function')openAlarms();
    });
  }

  /* ── Menú: Limpiar alarmas (MacroDroid webhook) ── */
  document.getElementById('cleanAlarmsBtn').addEventListener('click',function(e){
    e.stopPropagation();
    document.getElementById('dataMenu').classList.remove('open');
    var cleanBase=normalizeMacroBase(localStorage.getItem('excelia-alarm-url')||'');
    if(!cleanBase){showToast('Configura la URL base de MacroDroid en el men\u00fa','error');return;}
    // Calcular qué cumpleaños han pasado esta semana (antes de hoy) o la semana pasada
    var today=new Date();today.setHours(0,0,0,0);
    var dow=today.getDay();
    var offToMon=dow===0?6:dow-1; // días desde el lunes de esta semana
    var thisMonday=new Date(today);thisMonday.setDate(today.getDate()-offToMon);
    var lastMonday=new Date(thisMonday);lastMonday.setDate(thisMonday.getDate()-7);
    var lastSunday=new Date(thisMonday);lastSunday.setDate(thisMonday.getDate()-1);
    var alarmNames=[];
    if(typeof BDAYS!=='undefined'&&Array.isArray(BDAYS)&&typeof isBdayAlarmSet==='function'&&typeof tc==='function'){
      BDAYS.forEach(function(b){
        if(!isBdayAlarmSet(b))return;
        var dd=String(b.day).padStart(2,'0');
        var mm=String(b.month).padStart(2,'0');
        // Comprobar en el año actual y el anterior (para cumpleaños de fin/inicio de año)
        [today.getFullYear(),today.getFullYear()-1].forEach(function(yr){
          var bdDate=new Date(yr,b.month-1,b.day);
          var inLastWeek=bdDate>=lastMonday&&bdDate<=lastSunday;
          var inCurWeekPast=bdDate>=thisMonday&&bdDate<today;
          if(inLastWeek||inCurWeekPast){
            alarmNames.push('\uD83C\uDF82 Cumple '+tc(b.name)+'! '+dd+'/'+mm);
            alarmNames.push('\u23F0 Ma\u00f1ana cumple '+tc(b.name)+' '+dd+'/'+mm);
          }
        });
      });
    }
    if(!alarmNames.length){
      showToast('No hay alarmas de cumplea\u00f1os pasados para limpiar','success');
      return;
    }
    var cleanUrl=cleanBase+'/apagar_alarmas?names='+encodeURIComponent(alarmNames.join(','));
    showToast('Limpiando '+Math.ceil(alarmNames.length/2)+' alarma(s)\u2026','success');
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

  /* Helper: export all per-year keys with a given prefix */
  function _exportPerYearKeys(baseKey){
    var result={};
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(k&&k.indexOf(baseKey+'-')===0){
        var y=k.substring(k.lastIndexOf('-')+1);
        try{result[y]=JSON.parse(localStorage.getItem(k));}catch(e){}
      }
    }
    return Object.keys(result).length?result:null;
  }
  document.getElementById('exportAllBtn').addEventListener('click',function(){
    var data={version:4,days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE,
      exclFest:EXCL_FEST,exclVac:EXCL_VAC,vacEntitlement:VAC_ENTITLEMENT,
      birthdays:BDAYS,events:EVENTS,
      alarms:typeof ALARMS!=='undefined'?ALARMS:[],
      fiscal:typeof FISCAL!=='undefined'?FISCAL:null,
      gastos:typeof GASTOS_ITEMS!=='undefined'?GASTOS_ITEMS:null,
      gastosDificilPct:typeof GASTOS_DIFICIL_PCT!=='undefined'?GASTOS_DIFICIL_PCT:5,
      ingresos:typeof INGRESOS_ITEMS!=='undefined'?INGRESOS_ITEMS:null,
      compras:typeof COMPRAS_ITEMS!=='undefined'?COMPRAS_ITEMS:null,
      desgrav:typeof DESGRAV_ITEMS!=='undefined'?DESGRAV_ITEMS:null,
      despacho:typeof DESPACHO!=='undefined'?DESPACHO:null,
      personalData:typeof PERSONAL_DATA!=='undefined'?PERSONAL_DATA:null,
      gastosPerYear:_exportPerYearKeys('excelia-gastos-v1'),
      personalPerYear:_exportPerYearKeys('excelia-personal-v1'),
      scenarios:typeof ECON_SCENARIOS!=='undefined'?ECON_SCENARIOS:null,
      evAlarms:typeof EV_ALARMS_SET!=='undefined'?EV_ALARMS_SET:null,
      bdayAlarms:typeof BDAY_ALARM_SET!=='undefined'?BDAY_ALARM_SET:null,
      macroUrl:localStorage.getItem('excelia-alarm-url')||null};
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
        if(d.alarms&&Array.isArray(d.alarms)&&typeof saveAlarms==='function'){ALARMS=d.alarms;saveAlarms();}
        if(d.fiscal&&typeof FISCAL!=='undefined'&&typeof saveFiscal==='function'){
          FISCAL.irpfMode=d.fiscal.irpfMode||'fixed';
          FISCAL.irpfPct=d.fiscal.irpfPct||15;
          FISCAL.brackets=d.fiscal.brackets||null;
          saveFiscal();
        }
        if(d.gastos&&Array.isArray(d.gastos)&&typeof GASTOS_ITEMS!=='undefined'&&typeof saveGastosYear==='function'){
          GASTOS_ITEMS=d.gastos;
          if(typeof d.gastosDificilPct!=='undefined')GASTOS_DIFICIL_PCT=d.gastosDificilPct;
          saveGastosYear(CY);
        }
        if(d.ingresos&&Array.isArray(d.ingresos)&&typeof saveIngresos==='function'){INGRESOS_ITEMS=d.ingresos;saveIngresos();}
        if(d.compras&&Array.isArray(d.compras)&&typeof saveCompras==='function'){COMPRAS_ITEMS=d.compras;saveCompras();}
        if(d.desgrav&&Array.isArray(d.desgrav)&&typeof saveDesgrav==='function'){DESGRAV_ITEMS=d.desgrav;saveDesgrav();}
        if(d.despacho&&typeof saveDespacho==='function'){DESPACHO=d.despacho;if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();saveDespacho();}
        if(d.personalData&&typeof PERSONAL_DATA!=='undefined'&&typeof savePersonalYear==='function'){PERSONAL_DATA=d.personalData;savePersonalYear(CY);}
        /* Per-year data */
        if(d.gastosPerYear){Object.keys(d.gastosPerYear).forEach(function(y){try{localStorage.setItem('excelia-gastos-v1-'+y,JSON.stringify(d.gastosPerYear[y]));}catch(e){}});}
        if(d.personalPerYear){Object.keys(d.personalPerYear).forEach(function(y){try{localStorage.setItem('excelia-personal-v1-'+y,JSON.stringify(d.personalPerYear[y]));}catch(e){}});}
        if(d.scenarios&&Array.isArray(d.scenarios)&&typeof saveEconComp==='function'){ECON_SCENARIOS=d.scenarios;saveEconComp();}
        if(d.evAlarms&&typeof EV_ALARMS_SET!=='undefined'){EV_ALARMS_SET=d.evAlarms;if(typeof saveEvAlarms==='function')saveEvAlarms();}
        if(d.bdayAlarms&&typeof BDAY_ALARM_SET!=='undefined'){BDAY_ALARM_SET=d.bdayAlarms;localStorage.setItem('excelia-bday-alarm-set',JSON.stringify(BDAY_ALARM_SET));}
        if(d.macroUrl)localStorage.setItem('excelia-alarm-url',d.macroUrl);
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
    // Semanas sin enviar: 2 anteriores + actual + 2 siguientes
    var today=new Date();today.setHours(0,0,0,0);
    var dow=today.getDay();var off=dow===0?6:dow-1;
    var thisMon=new Date(today);thisMon.setDate(thisMon.getDate()-off);
    for(var w=-2;w<=2;w++){
      var d=new Date(thisMon);d.setDate(d.getDate()+w*7);
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
      var lbl='Semana del '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
      items.push({type:'warn',text:'&#128221; '+lbl+' sin enviar'});
    }
    // Cumpleaños hoy o mañana (cualquier persona, VIP o no)
    if(typeof BDAYS!=='undefined'&&BDAYS.length){
      var _todayBdayKeys={};
      BDAYS.forEach(function(b){
        var bd=new Date(today.getFullYear(),b.month-1,b.day);
        if(bd<today)bd.setFullYear(today.getFullYear()+1);
        var diff=Math.round((bd-today)/86400000);
        if(diff>1)return;
        var label=b.name+(diff===0?' (\u00a1hoy!)':' (ma\u00f1ana!)');
        var bkey=b.name+'_'+b.month+'_'+b.day;
        _todayBdayKeys[bkey]=true;
        items.push({type:'bday',text:'&#127874; '+label});
      });
      // VIP próximos (≤7 días, sin alarma, no duplicar hoy/mañana)
      if(typeof isBdayAlarmSet==='function'){
        BDAYS.forEach(function(b){
          if(!b.vip)return;
          var bkey=b.name+'_'+b.month+'_'+b.day;
          if(_todayBdayKeys[bkey])return; // ya incluido en el bloque anterior
          var bd=new Date(today.getFullYear(),b.month-1,b.day);
          if(bd<today)bd.setFullYear(today.getFullYear()+1);
          var diff=Math.round((bd-today)/86400000);
          if(diff>7)return;
          if(isBdayAlarmSet(b))return;
          var label=b.name+' (en '+diff+'d)';
          items.push({type:'vip',text:'&#11088; '+label+' \u2014 sin alarma'});
        });
      }
    }
    // Eventos hoy o mañana (inicio) + fin de eventos largos (>7 días)
    if(typeof EVENTS!=='undefined'&&EVENTS.length){
      EVENTS.forEach(function(ev){
        if(!ev.start)return;
        if(ev.id&&ev.id.indexOf('ev-bday-vip-')===0)return; // ya cubiertos por BDAYS
        var evStart=new Date(ev.start+'T00:00:00');
        var diff=Math.round((evStart-today)/86400000);
        if(diff===0||diff===1){
          var lbl=escHtml(ev.title)+(diff===0?' (\u00a1hoy!)':' (ma\u00f1ana!)');
          items.push({type:'event',text:'&#128197; '+lbl});
        }
        // Fin de eventos de más de 7 días
        if(ev.end&&ev.end>ev.start){
          var evEnd=new Date(ev.end+'T00:00:00');
          var span=Math.round((evEnd-evStart)/86400000);
          if(span>7){
            var diffEnd=Math.round((evEnd-today)/86400000);
            if(diffEnd===0||diffEnd===1){
              var endLbl=escHtml(ev.title)+' \u2014 fin'+(diffEnd===0?' hoy':' ma\u00f1ana')+'!';
              items.push({type:'event',text:'&#128197; '+endLbl});
            }
          }
        }
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
