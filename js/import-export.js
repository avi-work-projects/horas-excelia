/* ============================================================
   IMPORT EXPORT - Exportacion CSV/PDF + import/export de datos
   (individuales y backup completo).
   ============================================================ */
(function(){

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
    var d;
    try{d=JSON.parse(e.target.result);}
    catch(err){showToast('Error al importar: archivo inv\u00e1lido','error');return;}
    askImportMode('D\u00edas y jornada: '+f.name,function(mode){
      var merge=(mode==='merge');
      try{
        if(d.days)ST=merge?_mergeMap(ST,d.days):d.days;
        if(d.sent)SW=merge?_mergeMap(SW,d.sent):d.sent;
        if(d.monthH)MONTH_H=merge?_mergeMap(MONTH_H,d.monthH):d.monthH;
        if(typeof d.rate!=='undefined')DAILY_RATE=d.rate;
        if(typeof d.exclFest!=='undefined')EXCL_FEST=d.exclFest;
        if(typeof d.exclVac!=='undefined')EXCL_VAC=d.exclVac;
        save();render();
        showToast(merge?'Datos fusionados con los actuales':'Datos importados correctamente','success');
      }catch(err2){showToast('Error al importar: archivo inv\u00e1lido','error');}
    });
  };
  r.readAsText(f);
  ev.target.value='';
});

/* ── Modo de importación: añadir (incremental) o reemplazar ──────────
   Devuelve 'merge' | 'replace' al callback (o nada si se cancela). */
function askImportMode(subtitle,cb){
  var ov=document.createElement('div');
  ov.className='imp-mode-ov';
  ov.innerHTML='<div class="imp-mode-sheet">'
    +'<div class="imp-mode-title">&#8593; Importar datos</div>'
    +'<div class="imp-mode-sub">'+escHtml(subtitle||'')+'</div>'
    +'<button class="imp-mode-btn merge" data-mode="merge"><b>&#10133; A&#241;adir a lo que ya hay</b><span>Fusiona: no se borra nada de lo actual. Lo que venga en el archivo actualiza lo que coincida.</span></button>'
    +'<button class="imp-mode-btn repl" data-mode="replace"><b>&#9851; Reemplazar todo</b><span>Sustituye los datos actuales por los del archivo.</span></button>'
    +'<button class="imp-mode-btn cancel" data-mode="">Cancelar</button>'
    +'</div>';
  document.body.appendChild(ov);
  requestAnimationFrame(function(){ov.classList.add('open');});
  function close(){ov.classList.remove('open');setTimeout(function(){ov.remove();},220);}
  ov.addEventListener('click',function(e){
    if(e.target===ov){close();return;}
    var b=e.target.closest('.imp-mode-btn');
    if(!b)return;
    var mode=b.dataset.mode;
    close();
    if(mode)cb(mode);
  });
}
window.askImportMode=askImportMode;
/* ── Helpers de fusión ── */
/* Objetos tipo mapa (ST, SW, MONTH_H, sets de alarmas…): las claves del archivo
   pisan a las actuales, las que no vengan en el archivo se conservan. */
function _mergeMap(cur,inc){
  var out={},k;
  if(cur)for(k in cur)if(Object.prototype.hasOwnProperty.call(cur,k))out[k]=cur[k];
  if(inc)for(k in inc)if(Object.prototype.hasOwnProperty.call(inc,k))out[k]=inc[k];
  return out;
}
/* Listas con identidad: se concatenan deduplicando (gana el importado).
   keyFn da la clave principal (normalmente el id) y sigFn una FIRMA DE
   CONTENIDO opcional: si el elemento que llega trae otro id pero la misma
   firma que uno que ya existe, se considera el mismo y se actualiza en vez de
   duplicarse (caso tipico: exportar desde otro dispositivo). */
function _mergeList(cur,inc,keyFn,sigFn){
  if(!Array.isArray(cur))return Array.isArray(inc)?inc.slice():[];
  if(!Array.isArray(inc))return cur.slice();
  var out=cur.slice(),idx={},sig={};
  out.forEach(function(it,i){
    idx[keyFn(it)]=i;
    if(sigFn)sig[sigFn(it)]=i;
  });
  inc.forEach(function(it){
    var k=keyFn(it);
    if(idx[k]!==undefined){out[idx[k]]=it;if(sigFn)sig[sigFn(it)]=idx[k];return;}
    if(sigFn){
      var sg=sigFn(it),j=sig[sg];
      if(j!==undefined){out[j]=it;return;}
      sig[sg]=out.length;
    }
    idx[k]=out.length;out.push(it);
  });
  return out;
}
/* Firmas de contenido por tipo de dato */
function _sigEvent(ev){return (typeof evSignature==='function')?evSignature(ev)
  :[ev.type,ev.title,ev.start,ev.end].join('|');}
function _sigCouple(c){return String(c&&c.name||'').trim().toLowerCase();}
function _sigAlarm(a){return [a&&a.label,a&&a.hour,a&&a.minute,a&&a.targetDate].join('|');}
function _sigGasto(g){return [g&&(g.fecha||g.date||''),String(g&&(g.concepto||g.nombre||g.name||'')).trim().toLowerCase(),
  g&&(g.importe!==undefined?g.importe:g.amount)].join('|');}
function _keyId(it){return String(it&&it.id!=null?it.id:JSON.stringify(it));}
function _keyBday(b){return (b&&b.name?String(b.name).toLowerCase():'')+'|'+(b?b.day:'')+'|'+(b?b.month:'');}
function _keyGasto(it){
  if(it&&it.id!=null)return String(it.id);
  return JSON.stringify(it);
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
  /* Garantizar que toda la config económica esté cargada en memoria.
     loadDespacho/loadFiscal/etc. solo se ejecutan al abrir el overlay
     económico — si el usuario nunca lo abrió, DESPACHO.compra queda en null
     (valor inicial) y la subrogación no se exporta. */
  if(typeof loadDespacho==='function')loadDespacho();
  if(typeof loadFiscal==='function')loadFiscal();
  if(typeof loadGastosYear==='function')loadGastosYear(CY);
  if(typeof loadIngresos==='function')loadIngresos();
  if(typeof loadCompras==='function')loadCompras();
  if(typeof loadDesgrav==='function')loadDesgrav();
  if(typeof loadPersonalYear==='function')loadPersonalYear(CY);
  if(typeof loadEconComp==='function')loadEconComp();
  var data={version:4,days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE,
    exclFest:EXCL_FEST,exclVac:EXCL_VAC,vacEntitlement:VAC_ENTITLEMENT,
    birthdays:BDAYS,events:EVENTS,
    bodas:typeof BODA_COUPLES!=='undefined'?BODA_COUPLES:null,
    bodasClosed:typeof BODA_CLOSED!=='undefined'?BODA_CLOSED:null,
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
    macroUrl:localStorage.getItem('excelia-alarm-url')||null,
    alarmMacroEnabled:localStorage.getItem('excelia-alarm-macro')||null,
    alarmHour:localStorage.getItem('excelia-alarm-h')||null,
    alarmMinute:localStorage.getItem('excelia-alarm-m')||null,
    alarmDays:localStorage.getItem('excelia-alarm-days')||null,
    theme:localStorage.getItem('excelia-theme-v1')||null};
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
    var d;
    try{d=JSON.parse(e.target.result);}
    catch(err){showToast('Error al importar: archivo inválido','error');return;}
    askImportMode('Backup completo: '+f.name,function(mode){_applyFullImport(d,mode);});
  };
  r.readAsText(f);
  ev.target.value='';
});
function _applyFullImport(d,mode){
    var merge=(mode==='merge');
    var _impRes=null;
    try{
      if(d.days)ST=merge?_mergeMap(ST,d.days):d.days;
      if(d.sent)SW=merge?_mergeMap(SW,d.sent):d.sent;
      if(d.monthH)MONTH_H=merge?_mergeMap(MONTH_H,d.monthH):d.monthH;
      if(typeof d.rate!=='undefined')DAILY_RATE=d.rate;
      if(typeof d.exclFest!=='undefined')EXCL_FEST=d.exclFest;
      if(typeof d.exclVac!=='undefined')EXCL_VAC=d.exclVac;
      if(d.vacEntitlement){VAC_ENTITLEMENT=d.vacEntitlement;saveVacEntitlement(d.vacEntitlement);}
      if(d.birthdays&&Array.isArray(d.birthdays)){BDAYS=merge?_mergeList(BDAYS,d.birthdays,_keyBday):d.birthdays;localStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(BDAYS));}
      if(d.events&&Array.isArray(d.events)){
        /* Los eventos se fusionan con firma de contenido: mismo titulo, tipo y
           fechas = mismo evento aunque venga con otro id */
        if(merge&&typeof evMergeIncoming==='function')_impRes=evMergeIncoming(d.events);
        else if(merge)EVENTS=_mergeList(EVENTS,d.events,_keyId,_sigEvent);
        else EVENTS=d.events;
        saveEvents();
      }
      if(d.alarms&&Array.isArray(d.alarms)&&typeof saveAlarms==='function'){ALARMS=merge?_mergeList(ALARMS,d.alarms,_keyId,_sigAlarm):d.alarms;saveAlarms();}
      if(d.bodas&&Array.isArray(d.bodas)&&typeof saveBodas==='function'){BODA_COUPLES=merge?_mergeList(BODA_COUPLES,d.bodas,_keyId,_sigCouple):d.bodas;saveBodas();}
      if(d.bodasClosed&&typeof BODA_CLOSED!=='undefined'&&typeof saveBodaClosed==='function'){
        BODA_CLOSED=merge?_mergeMap(BODA_CLOSED,d.bodasClosed):d.bodasClosed;saveBodaClosed();}
      if(d.fiscal&&typeof FISCAL!=='undefined'&&typeof saveFiscal==='function'){
        FISCAL.irpfMode=d.fiscal.irpfMode||'fixed';
        FISCAL.irpfPct=d.fiscal.irpfPct||15;
        FISCAL.brackets=d.fiscal.brackets||null;
        /* Mínimo personal y familiar (v219) — preserva si viene en el backup */
        if(d.fiscal.minPersonal!=null)FISCAL.minPersonal=d.fiscal.minPersonal;
        saveFiscal();
      }
      if(d.gastos&&Array.isArray(d.gastos)&&typeof GASTOS_ITEMS!=='undefined'&&typeof saveGastosYear==='function'){
        GASTOS_ITEMS=merge?_mergeList(GASTOS_ITEMS,d.gastos,_keyGasto,_sigGasto):d.gastos;
        if(typeof d.gastosDificilPct!=='undefined')GASTOS_DIFICIL_PCT=d.gastosDificilPct;
        saveGastosYear(CY);
      }
      if(d.ingresos&&Array.isArray(d.ingresos)&&typeof saveIngresos==='function'){INGRESOS_ITEMS=merge?_mergeList(INGRESOS_ITEMS,d.ingresos,_keyGasto,_sigGasto):d.ingresos;saveIngresos();}
      if(d.compras&&Array.isArray(d.compras)&&typeof saveCompras==='function'){COMPRAS_ITEMS=merge?_mergeList(COMPRAS_ITEMS,d.compras,_keyGasto,_sigGasto):d.compras;saveCompras();}
      if(d.desgrav&&Array.isArray(d.desgrav)&&typeof saveDesgrav==='function'){
        DESGRAV_ITEMS=d.desgrav;saveDesgrav();
        /* Re-cargar via loadDesgrav para que mergee con DESGRAV_DEFAULT y añada
           items nuevos (ej. madrid_intereses_jovenes_30 v218) que el backup
           antiguo no tendría. */
        if(typeof loadDesgrav==='function')loadDesgrav();
      }
      if(d.despacho&&typeof saveDespacho==='function'){
        DESPACHO=d.despacho;if(!DESPACHO.compra)DESPACHO.compra=_defaultCompra();
        /* Asegurar campos nuevos no presentes en backups antiguos (v220+) */
        if(DESPACHO.valorCatastralConstruccion==null)DESPACHO.valorCatastralConstruccion=0;
        saveDespacho();
      }
      if(d.personalData&&typeof PERSONAL_DATA!=='undefined'&&typeof savePersonalYear==='function'){PERSONAL_DATA=d.personalData;savePersonalYear(CY);}
      /* Per-year data */
      if(d.gastosPerYear){Object.keys(d.gastosPerYear).forEach(function(y){
        try{
          var k='excelia-gastos-v1-'+y,val=d.gastosPerYear[y];
          if(merge&&Array.isArray(val)){
            var prev=null;try{prev=JSON.parse(localStorage.getItem(k));}catch(e2){}
            if(Array.isArray(prev))val=_mergeList(prev,val,_keyGasto);
          }
          localStorage.setItem(k,JSON.stringify(val));
        }catch(e){}
      });}
      if(d.personalPerYear){Object.keys(d.personalPerYear).forEach(function(y){
        try{
          var k2='excelia-personal-v1-'+y,val2=d.personalPerYear[y];
          if(merge&&val2&&typeof val2==='object'&&!Array.isArray(val2)){
            var prev2=null;try{prev2=JSON.parse(localStorage.getItem(k2));}catch(e3){}
            if(prev2&&typeof prev2==='object')val2=_mergeMap(prev2,val2);
          }
          localStorage.setItem(k2,JSON.stringify(val2));
        }catch(e){}
      });}
      if(d.scenarios&&Array.isArray(d.scenarios)&&typeof saveEconComp==='function'){ECON_SCENARIOS=merge?_mergeList(ECON_SCENARIOS,d.scenarios,_keyGasto):d.scenarios;saveEconComp();}
      if(d.evAlarms&&typeof EV_ALARMS_SET!=='undefined'){EV_ALARMS_SET=merge?_mergeMap(EV_ALARMS_SET,d.evAlarms):d.evAlarms;if(typeof saveEvAlarms==='function')saveEvAlarms();}
      if(d.bdayAlarms&&typeof BDAY_ALARM_SET!=='undefined'){BDAY_ALARM_SET=merge?_mergeMap(BDAY_ALARM_SET,d.bdayAlarms):d.bdayAlarms;localStorage.setItem('excelia-bday-alarm-set',JSON.stringify(BDAY_ALARM_SET));}
      if(d.macroUrl)localStorage.setItem('excelia-alarm-url',d.macroUrl);
      if(d.alarmMacroEnabled)localStorage.setItem('excelia-alarm-macro',d.alarmMacroEnabled);
      if(d.alarmHour)localStorage.setItem('excelia-alarm-h',d.alarmHour);
      if(d.alarmMinute)localStorage.setItem('excelia-alarm-m',d.alarmMinute);
      if(d.alarmDays)localStorage.setItem('excelia-alarm-days',d.alarmDays);
      if(d.theme)localStorage.setItem('excelia-theme-v1',d.theme);
      save();render();
      updateBdayBtn();updateEventsBtn();
      showToast(merge?('Backup fusionado'+(_impRes?(' · eventos: '+evMergeMsg(_impRes)):''))
        :'Backup completo importado','success');
    }catch(err){showToast('Error al importar: archivo inv\u00e1lido','error');}
}

})();
