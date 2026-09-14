/* Exportación iCalendar: selección explícita, sin ensayos ni datos de parejas.
   UID estable por evento/ocurrencia. Volver a importar aplica cambios. Los borrados se hacen manualmente en Google. */
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
    if(row.cancelled||getEvType(ev)==='Ensayos boda'||seen[row.key])return;
    seen[row.key]=true;
    var uid='gestify-'+encodeURIComponent(row.key)+'@gestify.invalid';
    lines.push('BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+(row.modified||stamp),'LAST-MODIFIED:'+(row.modified||stamp),'SEQUENCE:'+(row.sequence||0),'STATUS:CONFIRMED','SUMMARY:'+evIcsText(ev.title||getEvType(ev)));
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
    var old=records[k];if(keys[k])return;
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
    if(!on)return;
    var e=row.ev,note=notes?[e.note,e.dayNotes&&e.dayNotes[row.start]].filter(Boolean).join('\n'):'';
    var r={key:row.key,start:row.start,end:row.end,big:row.big,cancelled:false,
      ev:{id:String(e.id),kind:row.big?'grande':'puntual',type:getEvType(e),title:e.title||getEvType(e),time:row.big?null:evStartTime(e),endTime:row.big?null:evEndTime(e),note:note}};
    var signature=JSON.stringify([r.start,r.end,r.big,r.cancelled,r.ev]);
    r.signature=signature;r.sequence=old?old.sequence:0;r.modified=old?old.modified:stamp;
    if(!old||old.signature!==signature){r.sequence=old?old.sequence+1:0;r.modified=stamp;}
    next[row.key]=r;
  });
  return next;
}
function evIcsExportRows(records,selected){
  return Object.keys(records).filter(function(k){return selected[k]&&!records[k].cancelled;}).map(function(k){return records[k];});
}
function evIcsExportStatus(row,old,notes){
  if(row.missing)return 'missing';
  if(!old)return 'new';
  var selected={},records={};selected[row.key]=true;records[row.key]=old;
  return evIcsPrepare([row],selected,records,notes)[row.key].signature===old.signature?'repeat':'changed';
}
function evIcsFilterRows(rows,kind,type,query){
  query=String(query||'').trim().toLocaleLowerCase();
  return rows.filter(function(r){return (!kind||getEvKind(r.ev)===kind)&&(!type||getEvType(r.ev)===type)
    &&(String(r.ev.title||'')+' '+getEvType(r.ev)).toLocaleLowerCase().indexOf(query)!==-1;});
}
function renderEvCalendarExport(){
  var F=EV_CAL_EXPORT;
  return '<div class="ev-detail-overlay" id="evCalendarExportOv"><div class="ev-detail-sheet ev-cal-export-sheet">'
    +'<div class="ev-detail-handle"></div><div class="boda-config-head"><button class="sy-back" id="evCalendarExportClose" aria-label="Volver">&#8592;</button><h3>Compartir eventos</h3><span></span></div>'
    +'<p class="ev-cal-export-intro">Añade o actualiza tu selección en Google Calendar.</p>'
    +'<div class="ev-cal-export-tabs"><button id="evIcsBrowse" aria-pressed="true">Buscar eventos</button><button id="evIcsSelected" aria-pressed="false">Seleccionados (0)</button></div>'
    +'<input class="ev-input" id="evIcsSearch" type="search" placeholder="Buscar evento" aria-label="Buscar evento para exportar">'
    +'<div id="evIcsKinds" class="ev-cal-export-filters" aria-label="Clase de evento"></div><div id="evIcsTypes" class="ev-cal-export-filters ev-cal-export-types" aria-label="Categoría de evento"></div>'
    +'<details class="ev-cal-export-options"><summary>Fechas y opciones</summary><div class="ev-date-row"><label class="ev-field">Desde<input class="ev-input" id="evIcsFrom" type="date" value="'+F.from+'"></label><label class="ev-field">Hasta<input class="ev-input" id="evIcsTo" type="date" value="'+F.to+'"></label></div>'
    +'<label class="ev-cal-export-notes"><input id="evIcsNotes" type="checkbox"> Incluir notas</label><p class="ev-cal-export-intro">Los ensayos no se exportan. Los eventos exportados anteriormente siguen disponibles fuera del intervalo.</p></details>'
    +'<div class="ev-cal-export-tools"><button class="ev-io-btn" id="evIcsAll">Seleccionar visibles</button><button class="ev-io-btn" id="evIcsNone">Limpiar selección</button></div>'
    +'<div id="evIcsList" class="ev-cal-export-list"></div>'
    +'<div class="ev-cal-export-footer"><p id="evIcsChanges" aria-live="polite"></p><p>El archivo añade o actualiza. Nunca borra eventos. Los borrados se hacen manualmente en Google.</p>'
    +'<button class="ev-io-btn io-primaria" id="evIcsDownload" disabled>Exportar selección</button><a id="evIcsRetry" class="ev-cal-export-retry" download="gestify-eventos.ics" hidden>Descargar archivo de nuevo</a></div></div></div>';
}
function openEvCalendarExport(){
  var today=new Date(),until=new Date(today);until.setFullYear(until.getFullYear()+1);
  EV_CAL_EXPORT={from:evDk(today),to:evDk(until),kind:'',type:'',view:'browse',selected:Object.create(null),rows:[],visible:[],records:evIcsRecords()};
  var close=function(){var url=EV_CAL_EXPORT.downloadUrl;if(url)setTimeout(function(){URL.revokeObjectURL(url);},60000);cerrarPanel('evCalendarExportWrap','evCalendarExportOv');};
  var wrap=abrirPanel('evCalendarExportWrap',renderEvCalendarExport(),{overlay:'evCalendarExportOv',alCerrar:close});
  if(!wrap)return;
  var find=function(id){return wrap.querySelector('#'+id);},F=EV_CAL_EXPORT;
  function count(){
    var chosen=F.rows.filter(function(r){return F.selected[r.key]&&!r.missing;}),b=find('evIcsDownload');
    var repeat=chosen.filter(function(r){return F.status[r.key]==='repeat';}),changed=chosen.filter(function(r){return F.status[r.key]==='changed';});
    b.disabled=!chosen.length;b.textContent='Descargar .ics ('+chosen.length+')';
    find('evIcsSelected').textContent='Seleccionados ('+chosen.length+')';
    find('evIcsChanges').textContent=changed.length?'⚠ Cambios desde la última exportación: '+changed.map(function(r){return r.ev.title;}).join(', ')+(repeat.length?' · '+repeat.length+' ya exportados sin cambios':'')
      :repeat.length?'↻ Ya exportados sin cambios: '+repeat.map(function(r){return r.ev.title;}).join(', '):chosen.length+' seleccionados · '+F.visible.length+' visibles';
    find('evIcsChanges').classList.toggle('ev-cal-export-warning',!!(repeat.length||changed.length));
  }
  function filters(){
    find('evIcsKinds').innerHTML=[['','Todos'],['grande','Grandes'],['puntual','Puntuales']].map(function(k){return '<button type="button" class="ev-filter-chip'+(F.kind===k[0]?' active':'')+'" data-kind="'+k[0]+'" aria-pressed="'+(F.kind===k[0])+'">'+k[1]+'</button>';}).join('');
    var types=[];F.rows.forEach(function(r){var t=getEvType(r.ev);if((!F.kind||getEvKind(r.ev)===F.kind)&&types.indexOf(t)<0)types.push(t);});
    types.sort();if(F.type&&types.indexOf(F.type)<0)F.type='';
    find('evIcsTypes').innerHTML=[''].concat(types).map(function(t){return '<button type="button" class="ev-filter-chip'+(F.type===t?' active':'')+'" data-type="'+escHtml(t)+'" aria-pressed="'+(F.type===t)+'">'+escHtml(t||'Todas las categorías')+'</button>';}).join('');
  }
  function list(){
    F.status={};F.rows.forEach(function(r){F.status[r.key]=evIcsExportStatus(r,F.records[r.key],find('evIcsNotes').checked);});
    F.visible=F.view==='selected'?F.rows.filter(function(r){return F.selected[r.key]&&!r.missing;}):evIcsFilterRows(F.rows,F.kind,F.type,find('evIcsSearch').value);
    ['evIcsSearch','evIcsKinds','evIcsTypes','evIcsAll'].forEach(function(id){find(id).hidden=F.view==='selected';});
    find('evIcsBrowse').setAttribute('aria-pressed',F.view==='browse');find('evIcsSelected').setAttribute('aria-pressed',F.view==='selected');
    find('evIcsList').innerHTML=F.visible.length?F.visible.map(function(r,i){
      var old=F.records[r.key],status=F.status[r.key],date=_fmtDayEs(r.start)+(r.end!==r.start?' – '+_fmtDayEs(r.end):'');
      return '<div class="ev-cal-export-item"><label><input type="checkbox" data-ics-index="'+i+'"'+(F.selected[r.key]&&!r.missing?' checked':'')+(r.missing?' disabled':'')+'><span><strong>'+escHtml(r.ev.title||getEvType(r.ev))+'</strong><small>'+escHtml(date+' · '+getEvType(r.ev))+'</small>'
        +(old?'<small class="ev-cal-export-status'+(status==='repeat'?'':' changed')+'">'+(status==='missing'?'⚠ Eliminado en Gestify → revisa Google manualmente':status==='changed'?'⚠ Cambios desde la última exportación':'↻ Ya exportado · sin cambios')+'</small>':'')+'</span></label></div>';
    }).join(''):'<p class="ev-cal-export-empty">'+(F.view==='selected'?'Tu lista está vacía. Marca eventos en «Buscar eventos» para añadirlos aquí.':'No hay eventos con estos filtros. Puedes ampliar las fechas en «Fechas y opciones» (máximo dos años).')+'</p>';
    count();
  }
  function dates(){
    F.from=find('evIcsFrom').value;F.to=find('evIcsTo').value;
    var previous=F.rows;F.rows=evIcsRememberedRows(EVENTS,F.from,F.to,F.records);
    previous.forEach(function(r){if(F.selected[r.key]&&!F.rows.some(function(next){return next.key===r.key;}))F.rows.push(r);});
    F.rows.sort(function(a,b){return a.start.localeCompare(b.start);});filters();list();
  }
  find('evCalendarExportClose').onclick=close;
  find('evIcsBrowse').onclick=function(){F.view='browse';list();};find('evIcsSelected').onclick=function(){F.view='selected';list();};
  find('evIcsFrom').onchange=dates;find('evIcsTo').onchange=dates;find('evIcsSearch').oninput=list;find('evIcsNotes').onchange=list;
  find('evIcsKinds').onclick=function(e){var b=e.target.closest('[data-kind]');if(!b)return;F.kind=b.getAttribute('data-kind');F.type='';filters();list();};
  find('evIcsTypes').onclick=function(e){var b=e.target.closest('[data-type]');if(!b)return;F.type=b.getAttribute('data-type');filters();list();};
  find('evIcsList').onchange=function(e){var i=e.target.getAttribute('data-ics-index');if(i===null)return;var key=F.visible[+i].key;F.selected[key]=e.target.checked;list();};
  find('evIcsAll').onclick=function(){F.visible.forEach(function(r){if(!r.missing){F.selected[r.key]=true;}});list();};
  find('evIcsNone').onclick=function(){F.selected=Object.create(null);list();};
  find('evIcsDownload').onclick=function(){
    var next=evIcsPrepare(F.rows,F.selected,F.records,find('evIcsNotes').checked);
    var selected=Object.create(null);F.rows.forEach(function(r){if(F.selected[r.key]&&!r.missing)selected[r.key]=true;});
    var payload=evIcsExportRows(next,selected);if(!payload.length)return;
    var blob=new Blob([evIcsFile(payload,true)],{type:'text/calendar;charset=utf-8'});
    if(blob.size>1000000){showToast('Selecciona menos eventos: Google admite archivos de hasta 1 MB','error');return;}
    shareOrDownload(blob,'gestify-eventos.ics',function(){
      appStorage.setItem(EV_ICS_KEY,JSON.stringify(next));F.records=next;
      showToast('Descarga iniciada. Busca gestify-eventos.ics en Descargas','success');dates();
    },{download:true,onDownloadReady:function(url){
      var previous=F.downloadUrl;if(previous)setTimeout(function(){URL.revokeObjectURL(previous);},60000);
      F.downloadUrl=url;find('evIcsRetry').href=url;find('evIcsRetry').hidden=false;
    }});
  };
  dates();
}
