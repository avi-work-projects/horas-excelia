/* Exportación iCalendar: selección explícita, sin ensayos ni datos de parejas.
   UID estable por evento/ocurrencia. Volver a importar aplica cambios/bajas; no hay sincronización automática. */
var EV_CAL_EXPORT=null;
var EV_ICS_KEY='excelia-calendar-exports-v1';
function evIcsText(value){
  return String(value||'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'');
}
function evIcsFold(line){
  var out='',bytes=0;
  Array.from(line).forEach(function(ch){
    var n=unescape(encodeURIComponent(ch)).length;
    if(bytes+n>75){out+='\r\n ';bytes=1;}
    out+=ch;bytes+=n;
  });
  return out;
}
function evIcsNextDay(ds){var d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+1);return evDk(d);}
function evIcsCandidates(events,from,to){
  var rows=[];
  if(!validIsoDate(from)||!validIsoDate(to)||to<from||+to.slice(0,4)>9998)return rows;
  // Un límite explícito evita expandir por accidente décadas de repeticiones.
  if((new Date(to)-new Date(from))/86400000>731)return rows;
  events.forEach(function(ev){
    var type=getEvType(ev);
    if(!ev.id||ev._rut||ev._bday||type==='Ensayos boda'||type==='Rutina'||!validIsoDate(ev.start)||+ev.start.slice(0,4)>9998||(ev.end&&(!validIsoDate(ev.end)||+ev.end.slice(0,4)>9998)))return;
    var big=getEvKind(ev)==='grande',series=!big&&!!(ev.repeat||(ev.dates&&ev.dates.length)||(ev.end&&ev.end!==ev.start));
    if(!series){
      if((ev.end||ev.start)<from||ev.start>to)return;
      rows.push({ev:ev,key:JSON.stringify([String(ev.id)]),start:ev.start,end:ev.end||ev.start,big:big});
    }else{
      for(var ds=from;ds<=to;ds=evIcsNextDay(ds)){
        if(eventOccursOn(ev,ds))rows.push({ev:ev,key:JSON.stringify([String(ev.id),ds]),start:ds,end:ds,big:false});
      }
    }
  });
  return rows.sort(function(a,b){return a.start.localeCompare(b.start)||String(a.ev.title||'').localeCompare(String(b.ev.title||''));});
}
function evIcsFile(rows,notes){
  var lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Gestify//Selected Events//ES','CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE','TZID:Europe/Madrid','BEGIN:DAYLIGHT','DTSTART:19700329T020000','TZOFFSETFROM:+0100','TZOFFSETTO:+0200','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','END:DAYLIGHT',
    'BEGIN:STANDARD','DTSTART:19701025T030000','TZOFFSETFROM:+0200','TZOFFSETTO:+0100','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','END:VTIMEZONE'];
  var seen=Object.create(null),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  rows.forEach(function(row){
    var ev=row.ev;
    if((getEvType(ev)==='Ensayos boda'&&!row.cancelled)||seen[row.key])return;
    seen[row.key]=true;
    var uid='gestify-'+encodeURIComponent(row.key)+'@gestify.invalid';
    lines.push('BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+(row.modified||stamp),'LAST-MODIFIED:'+(row.modified||stamp),'SEQUENCE:'+(row.sequence||0),'STATUS:'+(row.cancelled?'CANCELLED':'CONFIRMED'),'SUMMARY:'+evIcsText(ev.title||getEvType(ev)));
    var time=row.big?null:evStartTime(ev),end=row.big?null:evEndTime(ev);
    if(time&&/^\d{2}:\d{2}$/.test(time)){
      lines.push('DTSTART;TZID=Europe/Madrid:'+row.start.replace(/-/g,'')+'T'+time.replace(':','')+'00');
      if(end&&/^\d{2}:\d{2}$/.test(end)){
        var endDay=end<=time?evIcsNextDay(row.end):row.end;
        lines.push('DTEND;TZID=Europe/Madrid:'+endDay.replace(/-/g,'')+'T'+end.replace(':','')+'00');
      }
    }else{
      lines.push('DTSTART;VALUE=DATE:'+row.start.replace(/-/g,''),'DTEND;VALUE=DATE:'+evIcsNextDay(row.end).replace(/-/g,''));
    }
    if(notes){
      var note=[ev.note,ev.dayNotes&&ev.dayNotes[row.start]].filter(Boolean).join('\n');
      lines.push('DESCRIPTION:'+evIcsText(note));
    }else lines.push('DESCRIPTION:');
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.map(evIcsFold).join('\r\n')+'\r\n';
}
function evIcsRecords(){
  try{return JSON.parse(appStorage.getItem(EV_ICS_KEY)||'{}');}catch(e){return {};}
}
function evIcsMergeRecords(old,incoming){
  var out=Object.assign({},old);
  Object.keys(incoming).forEach(function(k){if(!out[k]||incoming[k].sequence>out[k].sequence||(incoming[k].sequence===out[k].sequence&&incoming[k].modified>out[k].modified))out[k]=incoming[k];});
  return out;
}
function evIcsRememberedRows(events,from,to,records){
  var rows=evIcsCandidates(events,from,to),keys=Object.create(null);
  rows.forEach(function(r){keys[r.key]=true;});
  Object.keys(records).forEach(function(k){
    var old=records[k];if(old.cancelled||keys[k])return;
    var current=events.find(function(e){return String(e.id)===String(old.ev.id);});
    var parts=JSON.parse(k),now=[];
    if(current){
      // Los ya exportados siguen visibles aunque queden fuera del nuevo filtro.
      now=evIcsCandidates([current],parts.length>1?old.start:current.start,parts.length>1?old.start:current.start);
    }
    var row=now.find(function(r){return r.key===k;});
    if(!row){row=JSON.parse(JSON.stringify(old));row.missing=true;}
    rows.push(row);
  });
  return rows.sort(function(a,b){return a.start.localeCompare(b.start);});
}
function evIcsPrepare(rows,selected,records,notes){
  var next=Object.create(null),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  Object.keys(records).forEach(function(k){next[k]=JSON.parse(JSON.stringify(records[k]));});
  rows.forEach(function(row){
    var old=records[row.key],on=!!selected[row.key]&&!row.missing;
    if(!on&&!old)return;
    var e=row.ev,note=notes?[e.note,e.dayNotes&&e.dayNotes[row.start]].filter(Boolean).join('\n'):'';
    var r={key:row.key,start:row.start,end:row.end,big:row.big,cancelled:!on,
      ev:{id:String(e.id),kind:row.big?'grande':'puntual',type:getEvType(e),title:e.title||getEvType(e),time:row.big?null:evStartTime(e),endTime:row.big?null:evEndTime(e),note:note}};
    var signature=JSON.stringify([r.start,r.end,r.big,r.cancelled,r.ev]);
    r.signature=signature;r.sequence=old?old.sequence:0;r.modified=old?old.modified:stamp;
    if(!old||old.signature!==signature){r.sequence=old?old.sequence+1:0;r.modified=stamp;}
    next[row.key]=r;
  });
  return next;
}
function renderEvCalendarExport(){
  var F=EV_CAL_EXPORT;
  return '<div class="ev-detail-overlay" id="evCalendarExportOv"><div class="ev-detail-sheet ev-cal-export-sheet">'
    +'<div class="ev-detail-handle"></div><div class="boda-config-head"><button class="sy-back" id="evCalendarExportClose" aria-label="Volver">&#8592;</button><h3>Exportar eventos</h3><span></span></div>'
    +'<p class="ev-cal-export-intro">Elige qué quieres compartir en Wedding Moves. Los ensayos no se incluyen.</p>'
    +'<div class="ev-date-row"><label class="ev-field">Desde<input class="ev-input" id="evIcsFrom" type="date" value="'+F.from+'"></label><label class="ev-field">Hasta<input class="ev-input" id="evIcsTo" type="date" value="'+F.to+'"></label></div>'
    +'<input class="ev-input" id="evIcsSearch" type="search" placeholder="Buscar evento" aria-label="Buscar evento para exportar">'
    +'<div class="ev-cal-export-tools"><button class="ev-io-btn" id="evIcsAll">Seleccionar visibles</button><button class="ev-io-btn" id="evIcsNone">Limpiar selección</button></div>'
    +'<div id="evIcsList" class="ev-cal-export-list"></div><p id="evIcsChanges" class="ev-cal-export-intro" aria-live="polite"></p>'
    +'<label class="ev-cal-export-notes"><input id="evIcsNotes" type="checkbox"> Incluir notas de los eventos</label>'
    +'<div class="ev-cal-export-footer"><p>Importa siempre en el mismo calendario de Google. El archivo actualiza los eventos ya exportados y retira los que desmarques o borres de Gestify. Los ensayos existentes no se tocan. Los cambios requieren importar de nuevo el archivo.</p>'
    +'<button class="ev-io-btn io-primaria" id="evIcsDownload" disabled>Exportar selección</button></div></div></div>';
}
function openEvCalendarExport(){
  var today=new Date(),until=new Date(today);until.setFullYear(until.getFullYear()+1);
  EV_CAL_EXPORT={from:evDk(today),to:evDk(until),selected:Object.create(null),rows:[],visible:[],records:evIcsRecords()};
  Object.keys(EV_CAL_EXPORT.records).forEach(function(k){if(!EV_CAL_EXPORT.records[k].cancelled)EV_CAL_EXPORT.selected[k]=true;});
  var close=function(){cerrarPanel('evCalendarExportWrap','evCalendarExportOv');};
  var wrap=abrirPanel('evCalendarExportWrap',renderEvCalendarExport(),{overlay:'evCalendarExportOv',alCerrar:close});
  if(!wrap)return;
  var find=function(id){return wrap.querySelector('#'+id);},F=EV_CAL_EXPORT;
  function count(){
    var n=F.rows.filter(function(r){return F.selected[r.key]&&!r.missing;}).length,b=find('evIcsDownload');
    var removed=F.rows.filter(function(r){return F.records[r.key]&&!F.records[r.key].cancelled&&(!F.selected[r.key]||r.missing);});
    var cancellations=Object.keys(F.records).filter(function(k){return F.records[k].cancelled&&!F.selected[k];}).length;
    b.disabled=!n&&!removed.length&&!cancellations;b.textContent='Exportar '+n+' evento'+(n===1?'':'s')+(removed.length?' y '+removed.length+' baja'+(removed.length===1?'':'s'):'');
    find('evIcsChanges').textContent=removed.length?'Se retirarán al importar: '+removed.map(function(r){return r.ev.title;}).join(', '):cancellations?'El archivo incluye también las '+cancellations+' bajas anteriores para poder repetir la importación.':Object.keys(F.records).length?'Los ya exportados se mantienen seleccionados, incluso fuera del intervalo.':'Selecciona solo los eventos que quieras compartir.';
  }
  function list(){
    var q=find('evIcsSearch').value.trim().toLocaleLowerCase();
    F.visible=F.rows.filter(function(r){return (String(r.ev.title||'')+' '+getEvType(r.ev)).toLocaleLowerCase().indexOf(q)!==-1;});
    find('evIcsList').innerHTML=F.visible.length?F.visible.map(function(r,i){
      var date=_fmtDayEs(r.start)+(r.end!==r.start?' – '+_fmtDayEs(r.end):'');
      return '<label class="ev-cal-export-item"><input type="checkbox" data-ics-index="'+i+'"'+(F.selected[r.key]&&!r.missing?' checked':'')+(r.missing?' disabled':'')+'><span><strong>'+escHtml(r.ev.title||getEvType(r.ev))+'</strong><small>'+escHtml(getEvType(r.ev)+' · '+date+(r.missing?' · Se retirará':F.records[r.key]&&!F.records[r.key].cancelled?' · Ya exportado':'')+(r.big?' · Todo el día':evTimeLabel(r.ev)?' · '+evTimeLabel(r.ev):''))+'</small></span></label>';
    }).join(''):'<p class="ev-cal-export-empty">No hay eventos en este intervalo. Puedes ampliar las fechas (máximo dos años).</p>';
    count();
  }
  function dates(){F.from=find('evIcsFrom').value;F.to=find('evIcsTo').value;F.rows=evIcsRememberedRows(EVENTS,F.from,F.to,F.records);list();}
  find('evCalendarExportClose').onclick=close;
  find('evIcsFrom').onchange=dates;find('evIcsTo').onchange=dates;find('evIcsSearch').oninput=list;
  find('evIcsList').onchange=function(e){var i=e.target.getAttribute('data-ics-index');if(i===null)return;F.selected[F.visible[+i].key]=e.target.checked;count();};
  find('evIcsAll').onclick=function(){F.visible.forEach(function(r){if(!r.missing)F.selected[r.key]=true;});list();};
  find('evIcsNone').onclick=function(){F.selected=Object.create(null);list();};
  find('evIcsDownload').onclick=function(){
    var next=evIcsPrepare(F.rows,F.selected,F.records,find('evIcsNotes').checked),all=Object.keys(next).map(function(k){return next[k];});if(!all.length)return;
    var blob=new Blob([evIcsFile(all,true)],{type:'text/calendar;charset=utf-8'});
    if(blob.size>1000000){showToast('Selecciona menos eventos: Google admite archivos de hasta 1 MB','error');return;}
    shareOrDownload(blob,'gestify-eventos.ics',function(){
      appStorage.setItem(EV_ICS_KEY,JSON.stringify(next));F.records=next;F.selected=Object.create(null);
      Object.keys(next).forEach(function(k){if(!next[k].cancelled)F.selected[k]=true;});
      showToast('Archivo preparado. Impórtalo en el mismo calendario de Google','success');dates();
    });
  };
  dates();
}
