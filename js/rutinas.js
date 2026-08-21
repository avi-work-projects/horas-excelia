/* ============================================================
   RUTINAS — Actividades semanales fijas (gimnasio, baile, pádel…)

   Una rutina NO es un evento guardado: es una regla que genera sesiones.
   Los calendarios las ven porque getEventsOn() añade las sesiones del día
   como eventos "virtuales" (id 'rut-<idRutina>-<fecha>'), así que no hay que
   tocar ningún render.

   RUTINA = {
     id, name, color,
     weekDays:[1,4],        · 0=Dom … 6=Sáb (mismo criterio que ev.repeat)
     time:'18:00', dur:60,  · hora de inicio y duración en minutos
     start:'YYYY-MM-DD',    · desde cuándo cuenta
     suspend:{from,to}|null · pausa temporal; to:null = indefinida
     weeks:{ 'lunes': {weekDays,time} }  · cambios de UNA semana concreta
     skips:{ 'YYYY-MM-DD':1 }            · sesiones canceladas o saltadas
   }
   ============================================================ */

var RUT_SK = 'excelia-rutinas-v1';
var RUTINAS = (function(){
  try{var r=localStorage.getItem(RUT_SK);if(r){var a=JSON.parse(r);if(Array.isArray(a))return a;}}catch(e){}
  return [];
})();
function saveRutinas(){try{localStorage.setItem(RUT_SK,JSON.stringify(RUTINAS));}catch(e){}}

/* Sugerencias al crear la primera rutina */
var RUT_SUGERENCIAS = [
  {name:'Gimnasio', color:'#fb923c', weekDays:[1,3,5], icon:'gym'},
  {name:'Baile',    color:'#e03131', weekDays:[2,4],   icon:'baile'},
  {name:'Pádel',    color:'#a3e635', weekDays:[6],     icon:'padel'}
];
var RUT_DUR_DEFAULT = 60;
var RUT_TIME_DEFAULT = '18:00';
var RUT_DN = ['D','L','M','X','J','V','S'];
var RUT_DN_LARGO = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

/* ── Iconos de rutina ──────────────────────────────────────
   Dibujos monocromos: la silueta va en el color de la rutina y los detalles
   en un tono más oscuro del MISMO color (fakeTrans). Para que se recorten
   igual que el resto de marcadores del calendario, la silueta se pinta dos
   veces: primero con un trazo negro grueso (contorno de la unión) y luego
   rellena. Viewbox 0 0 24 24 en todos. */
var RUT_ICONS = ['gym','padel','baile','gen'];
/* Las rutinas de siempre llevan su color de casa y no se tocan; solo
   "Otra" deja elegir. Asi el gimnasio es naranja en todas partes. */
var RUT_FIXED_COLOR = {gym:'#fb923c', padel:'#a3e635', baile:'#e03131'};
function rutColorOf(icon,color){return RUT_FIXED_COLOR[icon]||color;}
var RUT_ICON_LABEL = {gym:'Gimnasio', padel:'Pádel', baile:'Baile', gen:'Otra'};
function _rutIconShapes(kind){
  if(kind==='gym'){
    /* Mancuerna. El brazo flexionado se probó y NO se lee a 13 px: el contorno
       negro cierra el hueco entre bíceps y puño y queda una mancha. */
    return '<rect x="0.6" y="8.2" width="4.2" height="7.6" rx="1.8"/>'
         + '<rect x="4.4" y="10.1" width="2.8" height="3.8" rx="1"/>'
         + '<rect x="6.8" y="10.7" width="10.4" height="2.6" rx="1.3"/>'
         + '<rect x="16.8" y="10.1" width="2.8" height="3.8" rx="1"/>'
         + '<rect x="19.2" y="8.2" width="4.2" height="7.6" rx="1.8"/>';
  }
  if(kind==='padel'){
    /* Pala de pádel: cabeza ovalada + mango */
    return '<ellipse cx="12" cy="8.6" rx="6.8" ry="7.2"/>'
         + '<rect x="10.7" y="14" width="2.6" height="8.4" rx="1.3"/>';
  }
  if(kind==='baile'){
    /* Bailarín: cabeza + torso inclinado + piernas + brazo en alto */
    return '<circle cx="12.6" cy="3.6" r="2.6"/>'
         + '<path d="M12.2,7.2 C10.4,8.8 9.9,10.8 10.6,12.6 L6.6,17.8" fill="none" stroke-width="2.6" stroke-linecap="round"/>'
         + '<path d="M10.6,12.6 L14.8,14.8 L15.6,21.4" fill="none" stroke-width="2.6" stroke-linecap="round"/>'
         + '<path d="M12.4,8.4 L18.4,5.4" fill="none" stroke-width="2.5" stroke-linecap="round"/>';
  }
  /* genérico: rombo con centro */
  return '<polygon points="12,3 20,12 12,21 4,12"/>';
}
function _rutIconDetails(kind,dark){
  if(kind==='padel'){
    var o='';
    [[10,7],[14,7],[12,10],[10,12.6],[14,12.6]].forEach(function(p){
      o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.15" fill="'+dark+'"/>';
    });
    o+='<rect x="10.9" y="16.2" width="2.2" height="4.4" rx="1.1" fill="'+dark+'"/>';
    return o;
  }
  if(kind==='gym'){
    /* Barra en el tono oscuro para que se distinga de los discos */
    return '<rect x="6.8" y="10.7" width="10.4" height="2.6" rx="1.3" fill="'+dark+'"/>';
  }
  if(kind==='baile'){
    return '<circle cx="18.6" cy="5.2" r="1.9" fill="'+dark+'"/>';
  }
  return '<circle cx="12" cy="12" r="3.1" fill="'+dark+'"/>';
}
/* Deduce el icono por el nombre cuando la rutina no lo trae guardado */
function rutIconOf(r){
  if(r&&r.icon&&RUT_ICON_LABEL[r.icon])return r.icon;
  var n=(r&&r.name?r.name:'').toLowerCase();
  if(/gim|gym|pesa|mancuerna|crossfit|musc/.test(n))return 'gym';
  if(/p[aá]del|tenis|raqueta|squash|b[aá]dminton/.test(n))return 'padel';
  if(/bail|danz|salsa|bachata|zumba/.test(n))return 'baile';
  return 'gen';
}
/* color puede ser 'currentColor': entonces el detalle se oscurece con un
   velo negro en vez de calcular la mezcla, que necesita un hex. */
function rutIconSvg(kind,color){
  var dark=(color==='currentColor')?'rgba(0,0,0,.45)'
          :((typeof fakeTrans==='function')?fakeTrans(color,0.52):color);
  var shapes=_rutIconShapes(kind);
  return '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">'
    + '<g fill="'+color+'" stroke="#000" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round">'+shapes+'</g>'
    + '<g fill="'+color+'" stroke="'+color+'" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round">'+shapes+'</g>'
    + _rutIconDetails(kind,dark)
    + '</svg>';
}
/* Marcador de una sesión de rutina para el calendario de 1 mes */
function rutMarkerHtml(ev,pastClass,ds){
  var r=ev._rut||{};
  var cls='ev-rut-mark'+(pastClass||'')+(ev._rutSkip?' rut-skip':'');
  return '<span class="'+cls+'" data-id="'+ev.id+'" data-ds="'+(ds||ev.start)+'" title="'+escHtml(r.name||'')+'">'
    + rutIconSvg(rutIconOf(r),r.color||'#888')+'</span>';
}

function rutById(id){
  for(var i=0;i<RUTINAS.length;i++)if(RUTINAS[i].id===id)return RUTINAS[i];
  return null;
}
/* Lunes de la semana de una fecha, como clave 'YYYY-MM-DD' */
function rutWeekKey(ds){
  var d=new Date(ds+'T00:00:00');
  var off=(d.getDay()===0?6:d.getDay()-1);
  d.setDate(d.getDate()-off);
  return evDk(d);
}
/* Hora base de un dia de la semana concreto.
   r.times = {'1':'18:00','5':'20:00'} guarda SOLO los dias que se salen de la
   hora general; el resto caen en r.time. */
function rutTimeOfDay(r,wd){
  if(r.times&&r.times[wd])return r.times[wd];
  return r.time||RUT_TIME_DEFAULT;
}
/* ¿Tiene horarios distintos segun el dia? */
function rutTieneHorarios(r){
  if(!r.times)return false;
  for(var k in r.times)if(r.times[k]&&r.times[k]!==(r.time||RUT_TIME_DEFAULT))return true;
  return false;
}
/* Días y hora efectivos de una rutina esa semana (con el cambio puntual si lo
   hay). La hora del cambio de semana manda sobre la del dia. */
function rutWeekCfg(r,ds){
  var o=r.weeks&&r.weeks[rutWeekKey(ds)];
  var wd=new Date(ds+'T00:00:00').getDay();
  return {
    weekDays:(o&&o.weekDays)?o.weekDays:(r.weekDays||[]),
    time:(o&&o.time)?o.time:rutTimeOfDay(r,wd),
    cambiada:!!o
  };
}
function rutSuspendedOn(r,ds){
  var s=r.suspend;
  if(!s||!s.from)return false;
  if(ds<s.from)return false;
  return !s.to||ds<=s.to;   /* sin "to" = suspensión indefinida */
}
/* Primer dia (mirando 8 semanas hacia delante) en el que esta rutina ya no
   cabria: la columna izquierda del calendario solo pinta EV_MAX_RUT_DIA
   sesiones. Devuelve la fecha, o null si cabe en todos. */
function rutDiaLleno(dias,desde,excluirId){
  var tope=(typeof EV_MAX_RUT_DIA!=='undefined')?EV_MAX_RUT_DIA:3;
  var d=new Date((desde||evDk(new Date()))+'T00:00:00');
  var hoy=new Date();hoy.setHours(0,0,0,0);
  if(d<hoy)d=hoy;
  for(var i=0;i<56;i++){
    var ds=evDk(d);
    if(dias.indexOf(d.getDay())!==-1&&
       (typeof rutDayCount==='function')&&rutDayCount(ds,excluirId)>=tope)return ds;
    d.setDate(d.getDate()+1);
  }
  return null;
}
/* ¿Toca sesión ese día? Devuelve la hora, o null */
function rutOccursOn(r,ds){
  if(r.start&&ds<r.start)return null;
  if(rutSuspendedOn(r,ds))return null;
  var cfg=rutWeekCfg(r,ds);
  var wd=new Date(ds+'T00:00:00').getDay();
  if(cfg.weekDays.indexOf(wd)===-1)return null;
  return cfg.time;
}
function rutIsSkipped(r,ds){return !!(r.skips&&r.skips[ds]);}
function rutToggleSkip(r,ds){
  r.skips=r.skips||{};
  if(r.skips[ds])delete r.skips[ds];else r.skips[ds]=1;
  saveRutinas();
}
function rutFin(time,dur){
  var p=String(time||'00:00').split(':');
  var t=(parseInt(p[0],10)||0)*60+(parseInt(p[1],10)||0)+(dur||RUT_DUR_DEFAULT);
  t=((t%1440)+1440)%1440;
  return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
}

/* ── Sesiones "virtuales" para que las vean los calendarios ── */
function rutEventsOn(ds){
  var out=[];
  RUTINAS.forEach(function(r){
    var t=rutOccursOn(r,ds);
    if(!t)return;
    out.push({
      id:'rut-'+r.id+'-'+ds,
      title:r.name,
      note:'Rutina semanal · '+t+'–'+rutFin(t,r.dur),
      color:r.color,
      kind:'puntual', type:'Rutina',
      start:ds, end:ds, repeat:null,
      _rut:r, _rutTime:t, _rutSkip:rutIsSkipped(r,ds)
    });
  });
  return out;
}
function rutEventFromId(id){
  var m=String(id||'').match(/^rut-(.+)-(\d{4}-\d{2}-\d{2})$/);
  if(!m)return null;
  var r=rutById(m[1]);
  if(!r)return null;
  return {rutina:r, ds:m[2]};
}

/* ── Sesiones de una rutina entre dos fechas ── */
function rutSessions(r,fromDs,toDs){
  var out=[];
  var d=new Date((r.start&&r.start>fromDs?r.start:fromDs)+'T00:00:00');
  var end=new Date(toDs+'T00:00:00');
  var g=0;
  while(d<=end&&g<800){
    var ds=evDk(d);
    var t=rutOccursOn(r,ds);
    if(t)out.push({ds:ds,time:t,skip:rutIsSkipped(r,ds)});
    d.setDate(d.getDate()+1);g++;
  }
  return out;
}
/* Recuento: hechas = sesiones pasadas no saltadas (automatico, corregible) */
function rutStats(r,desdeDs){
  var hoy=evDk(new Date());
  var ini=desdeDs||r.start||hoy;
  var ses=rutSessions(r,ini,hoy);
  var hechas=0,saltadas=0;
  ses.forEach(function(s){
    if(s.ds===hoy)return;               /* el día en curso aún no cuenta */
    if(s.skip)saltadas++;else hechas++;
  });
  var total=hechas+saltadas;
  return {hechas:hechas,saltadas:saltadas,total:total,
    pct:total?Math.round(hechas*100/total):0};
}
function rutProximas(r,n){
  var hoy=evDk(new Date());
  var fin=new Date();fin.setDate(fin.getDate()+60);
  return rutSessions(r,hoy,evDk(fin)).slice(0,n||3);
}

/* ── Estado de la pestaña ── */
var RUT_SUBTAB = 'lista';   /* 'lista' | 'stats' */

/* ══ Render: pestaña Rutinas ══ */
function renderRutinasBody(){
  var h='<div class="econ-sub-tabs">';
  [['lista','Rutinas'],['stats','Estadísticas']].forEach(function(t){
    h+='<button class="econ-sub-tab'+(RUT_SUBTAB===t[0]?' active':'')+'" data-rsub="'+t[0]+'">'+t[1]+'</button>';
  });
  h+='</div><div class="rut-sec">';
  h+=(RUT_SUBTAB==='stats')?_renderRutStats():_renderRutLista();
  h+='</div>';
  return h;
}

function _renderRutLista(){
  var hoy=evDk(new Date());
  var h='';
  if(!RUTINAS.length){
    h+='<div class="sy-note">Sin rutinas todavía. Son actividades que se repiten cada semana; añade una o usa una de las sugerencias.</div>';
    h+='<div class="rut-sug">';
    RUT_SUGERENCIAS.forEach(function(s,i){
      h+='<button class="rut-sug-btn" data-sug="'+i+'"><i style="background:'+s.color+'"></i>'
        +escHtml(s.name)+'<span>'+s.weekDays.map(function(d){return RUT_DN[d];}).join(' ')+' · '+RUT_TIME_DEFAULT+'</span></button>';
    });
    h+='</div>';
  }
  RUTINAS.forEach(function(r){
    var susp=rutSuspendedOn(r,hoy);
    var st=rutStats(r);
    var prox=rutProximas(r,3);
    h+='<div class="rut-card'+(susp?' susp':'')+'" data-rid="'+r.id+'">';
    h+='<div class="rut-card-hd">';
    h+='<span class="rut-dot" style="background:'+r.color+'"></span>';
    h+='<span class="rut-name">'+escHtml(r.name)+'</span>';
    if(susp)h+='<span class="rut-tag susp">en pausa'+(r.suspend&&r.suspend.to?(' hasta '+_rutFmt(r.suspend.to)):'')+'</span>';
    h+='<button class="boda-mini-btn rut-edit" data-rid="'+r.id+'" title="Editar">&#9998;</button>';
    h+='</div>';
    /* Días de la semana */
    h+='<div class="rut-days">';
    for(var i=1;i<=7;i++){
      var d=i%7;   /* empieza en lunes */
      var on=(r.weekDays||[]).indexOf(d)!==-1;
      h+='<span class="rut-day'+(on?' on':'')+'"'+(on?' style="background:'+r.color+'22;border-color:'+r.color+';color:'+r.color+'"':'')+'>'+RUT_DN[d]+'</span>';
    }
    if(rutTieneHorarios(r)){
      h+='<span class="rut-hora rut-hora-varias">horario por d\u00eda</span>';
    } else {
      h+='<span class="rut-hora">'+(r.time||RUT_TIME_DEFAULT)+'\u2013'+rutFin(r.time,r.dur)+'</span>';
    }
    h+='</div>';
    /* Proximas sesiones */
    if(prox.length){
      h+='<div class="rut-prox">';
      prox.forEach(function(s){
        h+='<span class="rut-prox-i'+(s.skip?' skip':'')+'" data-rid="'+r.id+'" data-ds="'+s.ds+'">'
          +_rutFmtCorto(s.ds)+' · '+s.time+(s.skip?' ✕':'')+'</span>';
      });
      h+='</div>';
    } else if(!susp){
      h+='<div class="rut-prox"><span class="rut-vacio">Sin sesiones próximas</span></div>';
    }
    if(st.total){
      h+='<div class="rut-card-ft"><span>'+st.hechas+' hechas · '+st.saltadas+' saltadas</span>';
      h+='<span class="rut-pct">'+st.pct+'%</span></div>';
    }else{
      h+='<div class="rut-card-ft"><span class="rut-vacio">Aún sin sesiones pasadas</span></div>';
    }
    h+='</div>';
  });
  h+='<button class="ev-io-btn rut-add" id="rutAdd">+ Nueva rutina</button>';
  return h;
}
function _rutFmt(ds){return ds?ds.slice(8)+'/'+ds.slice(5,7)+'/'+ds.slice(0,4):'';}
function _rutFmtCorto(ds){
  var d=new Date(ds+'T00:00:00');
  return RUT_DN_LARGO[d.getDay()].slice(0,3)+' '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
}

/* ══ Estadísticas ══ */
function _renderRutStats(){
  if(!RUTINAS.length)return '<div class="sy-note">Sin rutinas todavía.</div>';
  var hoy=new Date(), hoyDs=evDk(hoy);
  var h='';
  /* Totales */
  var tH=0,tS=0;
  RUTINAS.forEach(function(r){var s=rutStats(r);tH+=s.hechas;tS+=s.saltadas;});
  h+='<div class="boda-stats-row">';
  h+='<div class="boda-stat"><b>'+tH+'</b><span>hechas</span></div>';
  h+='<div class="boda-stat"><b>'+tS+'</b><span>saltadas</span></div>';
  h+='<div class="boda-stat"><b>'+((tH+tS)?Math.round(tH*100/(tH+tS)):0)+'%</b><span>cumplimiento</span></div>';
  h+='</div>';
  /* Por rutina */
  h+='<div class="boda-stat-t">Por rutina</div>';
  h+=hBarRows(RUTINAS.map(function(r){
    var s=rutStats(r);
    return {label:r.name,value:s.hechas,color:r.color};
  }),{});
  /* Sesiones por semana (ultimas 10) */
  var wl=[],wv=[];
  for(var w=9;w>=0;w--){
    var d=new Date(hoy.getTime());d.setDate(d.getDate()-w*7);
    var wk=rutWeekKey(evDk(d));
    var fin=new Date(wk+'T00:00:00');fin.setDate(fin.getDate()+6);
    var n=0;
    RUTINAS.forEach(function(r){
      rutSessions(r,wk,evDk(fin)).forEach(function(s){if(s.ds<=hoyDs&&!s.skip)n++;});
    });
    wl.push(wk.slice(8)+'/'+wk.slice(5,7));wv.push(n);
  }
  h+='<div class="boda-stat-t">Sesiones hechas por semana <em>(últimas 10)</em></div>';
  h+='<div class="sy-chart">'+simpleBarChart(wv,wl,'#34d399',{highlight:9})+'</div>';
  /* Detalle por rutina */
  RUTINAS.forEach(function(r){
    var s=rutStats(r);
    h+='<div class="rut-stat-card">';
    h+='<div class="rut-card-hd"><span class="rut-dot" style="background:'+r.color+'"></span>';
    h+='<span class="rut-name">'+escHtml(r.name)+'</span>';
    h+='<span class="rut-pct">'+(s.total?s.pct+'%':'—')+'</span></div>';
    h+='<div class="rut-stat-line">'+s.hechas+' hechas · '+s.saltadas+' saltadas · '+s.total+' previstas';
    if(r.start)h+=' <em>desde '+_rutFmt(r.start)+'</em>';
    h+='</div>';
    /* Ultimas 8 sesiones pasadas, para poder corregir */
    var atras=new Date(hoy.getTime());atras.setDate(atras.getDate()-70);
    var pas=rutSessions(r,evDk(atras),hoyDs).filter(function(x){return x.ds<hoyDs;}).slice(-8);
    if(pas.length){
      h+='<div class="rut-hist">';
      pas.forEach(function(x){
        h+='<button class="rut-hist-i'+(x.skip?' skip':'')+'" data-rid="'+r.id+'" data-ds="'+x.ds+'" title="'
          +(x.skip?'Marcada como saltada':'Marcada como hecha')+' — pulsa para cambiar">'
          +x.ds.slice(8)+'/'+x.ds.slice(5,7)+'</button>';
      });
      h+='</div>';
      h+='<div class="rut-hist-lbl">Pulsa una sesión para marcarla como saltada o hecha</div>';
    }
    h+='</div>';
  });
  return h;
}

/* ══ Formulario de rutina ══ */
function renderRutForm(r){
  var isEdit=!!r;
  var col=isEdit?r.color:'#34d399';
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
  h+='<div class="ev-field"><label>Días de la semana</label><div class="rut-days-pick" id="rutFDays">';
  for(var i=1;i<=7;i++){
    var d=i%7;
    h+='<button type="button" class="rut-day-btn'+(dias.indexOf(d)!==-1?' on':'')+'" data-wd="'+d+'">'+RUT_DN[d]+'</button>';
  }
  h+='</div></div>';
  h+='<div class="ev-date-row">';
  h+='<div><label>Hora</label><input class="ev-input" id="rutFTime" type="time" step="900" value="'+(isEdit?(r.time||RUT_TIME_DEFAULT):RUT_TIME_DEFAULT)+'"></div>';
  h+='<div><label>Duración (min)</label><input class="ev-input" id="rutFDur" type="number" min="15" max="480" step="15" value="'+(isEdit?(r.dur||RUT_DUR_DEFAULT):RUT_DUR_DEFAULT)+'"></div>';
  h+='</div>';
  /* Horario por dia: se despliega con el conmutador y pone una hora por cada
     dia marcado. Los dias que coinciden con la hora general no se guardan. */
  var _varias=isEdit&&rutTieneHorarios(r);
  h+='<div class="ev-field rut-hpd">';
  h+='<label class="excl-item"><input type="checkbox" id="rutFPorDia"'+(_varias?' checked':'')+'> Horario distinto seg\u00fan el d\u00eda</label>';
  h+='<div class="rut-hpd-rows" id="rutFHoras" style="display:'+(_varias?'block':'none')+'"></div>';
  h+='</div>';
  h+='<div class="ev-field"><label>Desde</label><input class="ev-input" id="rutFStart" type="date" value="'+(isEdit&&r.start?r.start:evDk(new Date()))+'"></div>';
  var _ic=isEdit?rutIconOf(r):'gen';
  h+='<div class="ev-field"><label>Icono</label><div class="rut-icon-row" id="rutFIcons">';
  /* Cada icono se ve con SU color (el gimnasio naranja, el padel verde...),
     no todos con el color de la rutina que se esta editando. Solo "Otra"
     acompana al color elegido, que es el unico que se puede cambiar. */
  RUT_ICONS.forEach(function(k){
    h+='<button type="button" class="rut-icon-opt'+(k===_ic?' on':'')+'" data-icon="'+k+'">'
      +rutIconSvg(k,RUT_FIXED_COLOR[k]||col)+'<span>'+RUT_ICON_LABEL[k]+'</span></button>';
  });
  h+='</div></div>';
  h+='<div class="ev-field" id="rutFColorField"'+(_ic==='gen'?'':' style="display:none"')+'>'
    +'<label>🎨 Color</label>'+_renderColorPicker(col,false,false,'rutCp')+'</div>';
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
    h+='<button type="button" class="ev-btn" id="rutFWeek" style="width:100%;margin-bottom:12px">🗓 Cambiar una semana concreta</button>';
  }
  h+='<div class="ev-form-actions"><button class="ev-btn primary" id="rutFSave">Guardar</button></div>';
  h+='</div></div>';
  return h;
}
function openRutForm(r){
  var ov=document.getElementById('eventsOverlay');
  var old=document.getElementById('rutFWrap');if(old)old.remove();
  var wrap=document.createElement('div');wrap.id='rutFWrap';
  wrap.innerHTML=renderRutForm(r);
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('rutFormOv');if(fo)fo.classList.add('open');
  });
  var cp=_bindColorPicker(wrap,'rutCp');
  /* Los iconos se repintan con el color elegido para verlos como quedaran */
  /* Solo hay que repintar "Otra": el resto llevan color fijo */
  function _rutRepaintIcons(){
    var c=cp.getColor();
    document.querySelectorAll('#rutFIcons .rut-icon-opt').forEach(function(b){
      var k=b.dataset.icon;
      if(RUT_FIXED_COLOR[k])return;
      b.innerHTML=rutIconSvg(k,c)+'<span>'+RUT_ICON_LABEL[k]+'</span>';
    });
  }
  document.querySelectorAll('#rutFIcons .rut-icon-opt').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('#rutFIcons .rut-icon-opt').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');
      var k=b.dataset.icon;
      var campo=document.getElementById('rutFColorField');
      if(campo)campo.style.display=(k==='gen')?'':'none';
      if(RUT_FIXED_COLOR[k])cp.setColor(RUT_FIXED_COLOR[k]);
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
        +'<input class="ev-input" type="time" step="900" data-wd="'+d+'" value="'+v+'"></div>';
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
  var wk=document.getElementById('rutFWeek');
  if(wk)wk.addEventListener('click',function(){
    closeRutForm();setTimeout(function(){openRutWeek(r);},310);
  });
  document.getElementById('rutFSave').addEventListener('click',function(){
    var name=document.getElementById('rutFName').value.trim();
    if(!name){showToast('Ponle nombre a la rutina','error');return;}
    var dias=[];
    document.querySelectorAll('#rutFDays .rut-day-btn.on').forEach(function(b){dias.push(+b.dataset.wd);});
    if(!dias.length){showToast('Elige al menos un día de la semana','error');return;}
    var dur=parseInt(document.getElementById('rutFDur').value,10);
    if(isNaN(dur)||dur<15)dur=RUT_DUR_DEFAULT;
    var datos={name:name,weekDays:dias.sort(),
      time:document.getElementById('rutFTime').value||RUT_TIME_DEFAULT,
      dur:dur,
      start:document.getElementById('rutFStart').value||evDk(new Date()),
      icon:(document.querySelector('#rutFIcons .rut-icon-opt.on')||{dataset:{}}).dataset.icon||'gen',
      color:cp.getColor()};
    datos.color=rutColorOf(datos.icon,datos.color);
    /* Horario por dia: solo se guardan los dias que se salen de la hora general */
    var _pd=document.getElementById('rutFPorDia');
    if(_pd&&_pd.checked){
      var _t={};
      document.querySelectorAll('#rutFHoras input[data-wd]').forEach(function(i){
        if(i.value&&i.value!==datos.time&&dias.indexOf(+i.dataset.wd)!==-1)_t[i.dataset.wd]=i.value;
      });
      datos.times=_t;
    } else {
      datos.times=null;
    }
    var sf=document.getElementById('rutFSuspFrom');
    if(sf){
      var from=sf.value, to=document.getElementById('rutFSuspTo').value;
      datos.suspend=from?{from:from,to:to||null}:null;
    }
    var _lleno=rutDiaLleno(dias,datos.start,r?r.id:null);
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
  });
}
function closeRutForm(){
  var fo=document.getElementById('rutFormOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('rutFWrap');if(w)w.remove();},300);
}

/* == Cambiar los dias/hora de UNA semana concreta ==
   Dos pasos: primero un mes de solo lectura para senalar QUE semana, y al
   pulsar cualquiera de sus dias se abre el editor de esa semana. */
var RUT_WEEK_SEL = null;
var RUT_WEEK_CAL = null;   /* mes que se esta mirando en el paso 1 */
function openRutWeek(r){
  var hoy=new Date();
  RUT_WEEK_CAL={y:hoy.getFullYear(),m:hoy.getMonth()};
  _rutWeekPick(r);
}
/* Paso 1: elegir semana sobre el calendario mensual DE VERDAD.
   Se reutiliza renderEvCalMonth() tal cual (mismos eventos, mismos colores,
   mismos puentes) y se deja inerte con pointer-events: lo unico que se puede
   pulsar es la semana. Asi se localiza de un vistazo la que se busca. */
function _rutWeekPick(r){
  var y=RUT_WEEK_CAL.y,m=RUT_WEEK_CAL.m;
  var h='<div class="ev-detail-overlay" id="rutWkOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="rutWkClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center;color:'+r.color+'">'
    +escHtml(r.name)+' \u2014 elige la semana</div>';
  h+='<div style="width:36px"></div></div>';
  h+='<div class="boda-asg-nav">';
  h+='<button class="sy-nav" id="rutWkMPrev">&#9664;</button>';
  h+='<div class="boda-asg-month">'+MN[m]+' '+y+'</div>';
  h+='<button class="sy-nav" id="rutWkMNext">&#9654;</button>';
  h+='</div>';
  /* El calendario real se pinta con los globales del mes; se prestan y se
     devuelven para no mover la vista que el usuario tenga detras. */
  var _y0=EV_YEAR,_m0=EV_MONTH;
  EV_YEAR=y;EV_MONTH=m;
  var cal=renderEvCalMonth();
  EV_YEAR=_y0;EV_MONTH=_m0;
  h+='<div class="rut-wpick-real">'+cal+'</div>';
  h+='<div class="sy-note" style="font-size:.68rem">Pulsa cualquier semana para cambiarla. '
    +'Las que ya tienen un cambio guardado salen recuadradas.</div>';
  h+='</div></div>';
  var ov=document.getElementById('eventsOverlay');
  var old=document.getElementById('rutWkWrap');if(old)old.remove();
  var wrap=document.createElement('div');wrap.id='rutWkWrap';wrap.innerHTML=h;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('rutWkOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeRutWeek();});}
  });
  /* Cada fila de semana se vuelve pulsable y se marca si ya tiene cambio */
  document.querySelectorAll('#rutWkOv .ev-week-outer').forEach(function(w){
    var celda=w.querySelector('.ev-cell[data-ds]');
    if(!celda)return;
    var wk=rutWeekKey(celda.dataset.ds);
    w.dataset.week=wk;
    if(r.weeks&&r.weeks[wk])w.classList.add('rut-wk-cambiada');
    w.addEventListener('click',function(){
      RUT_WEEK_SEL=wk;
      _rutWeekRender(r);
    });
  });
  document.getElementById('rutWkClose').addEventListener('click',closeRutWeek);
  document.getElementById('rutWkMPrev').addEventListener('click',function(){
    RUT_WEEK_CAL.m--; if(RUT_WEEK_CAL.m<0){RUT_WEEK_CAL.m=11;RUT_WEEK_CAL.y--;}
    _rutWeekPick(r);
  });
  document.getElementById('rutWkMNext').addEventListener('click',function(){
    RUT_WEEK_CAL.m++; if(RUT_WEEK_CAL.m>11){RUT_WEEK_CAL.m=0;RUT_WEEK_CAL.y++;}
    _rutWeekPick(r);
  });
  if(typeof addSwipe==='function'){
    var _cal=document.querySelector('#rutWkOv .rut-wpick-real');
    addSwipe(_cal,function(){document.getElementById('rutWkMNext').click();},
                  function(){document.getElementById('rutWkMPrev').click();});
  }
}
function _rutWeekRender(r){
  var wk=RUT_WEEK_SEL;
  var fin=new Date(wk+'T00:00:00');fin.setDate(fin.getDate()+6);
  var o=(r.weeks&&r.weeks[wk])||null;
  var dias=o&&o.weekDays?o.weekDays:(r.weekDays||[]);
  var hora=o&&o.time?o.time:(r.time||RUT_TIME_DEFAULT);
  var h='<div class="ev-detail-overlay" id="rutWkOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
  h+='<button class="sy-back" id="rutWkClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.88rem;font-weight:600;text-align:center;color:'+r.color+'">'+escHtml(r.name)+' — una semana</div>';
  h+='<div style="width:36px"></div></div>';
  h+='<div class="boda-asg-nav">';
  h+='<button class="sy-nav" id="rutWkPrev">&#9664;</button>';
  h+='<div class="boda-asg-month">'+_rutFmt(wk).slice(0,5)+' — '+_rutFmt(evDk(fin)).slice(0,5)+'</div>';
  h+='<button class="sy-nav" id="rutWkNext">&#9654;</button>';
  h+='</div>';
  h+='<div class="rut-days-pick" id="rutWkDays">';
  for(var i=1;i<=7;i++){
    var d=i%7;
    h+='<button type="button" class="rut-day-btn'+(dias.indexOf(d)!==-1?' on':'')+'" data-wd="'+d+'">'+RUT_DN[d]+'</button>';
  }
  h+='</div>';
  h+='<div class="ev-field" style="margin-top:10px"><label>Hora esa semana</label>';
  h+='<input class="ev-input" id="rutWkTime" type="time" step="900" value="'+hora+'"></div>';
  h+='<div class="sy-note" style="font-size:.68rem">Solo afecta a esta semana. El resto sigue con '
    +(r.weekDays||[]).map(function(d){return RUT_DN[d];}).join(' ')+' a las '+(r.time||RUT_TIME_DEFAULT)+'.</div>';
  h+='<div class="ev-detail-actions">';
  if(o)h+='<button class="ev-btn" id="rutWkReset">Quitar el cambio</button>';
  h+='<button class="ev-btn primary" id="rutWkSave">Guardar semana</button>';
  h+='</div></div></div>';
  var ov=document.getElementById('eventsOverlay');
  var old=document.getElementById('rutWkWrap');if(old)old.remove();
  var wrap=document.createElement('div');wrap.id='rutWkWrap';wrap.innerHTML=h;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('rutWkOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeRutWeek();});}
  });
  document.getElementById('rutWkClose').addEventListener('click',function(){_rutWeekPick(r);});
  document.querySelectorAll('#rutWkDays .rut-day-btn').forEach(function(b){
    b.addEventListener('click',function(){b.classList.toggle('on');});
  });
  document.getElementById('rutWkPrev').addEventListener('click',function(){
    var d=new Date(RUT_WEEK_SEL+'T00:00:00');d.setDate(d.getDate()-7);
    RUT_WEEK_SEL=evDk(d);_rutWeekRender(r);
  });
  document.getElementById('rutWkNext').addEventListener('click',function(){
    var d=new Date(RUT_WEEK_SEL+'T00:00:00');d.setDate(d.getDate()+7);
    RUT_WEEK_SEL=evDk(d);_rutWeekRender(r);
  });
  var rs=document.getElementById('rutWkReset');
  if(rs)rs.addEventListener('click',function(){
    if(r.weeks)delete r.weeks[RUT_WEEK_SEL];
    saveRutinas();closeRutWeek();
    setTimeout(function(){refreshEvents();},310);
    showToast('Semana sin cambios','success');
  });
  document.getElementById('rutWkSave').addEventListener('click',function(){
    var dias=[];
    document.querySelectorAll('#rutWkDays .rut-day-btn.on').forEach(function(b){dias.push(+b.dataset.wd);});
    r.weeks=r.weeks||{};
    r.weeks[RUT_WEEK_SEL]={weekDays:dias.sort(),time:document.getElementById('rutWkTime').value||r.time};
    saveRutinas();closeRutWeek();
    setTimeout(function(){refreshEvents();},310);
    showToast('Semana del '+_rutFmt(RUT_WEEK_SEL).slice(0,5)+' actualizada','success');
  });
}
function closeRutWeek(){
  var fo=document.getElementById('rutWkOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('rutWkWrap');if(w)w.remove();},300);
}

/* ══ Detalle de una sesión (al pulsarla en un calendario) ══ */
function openRutSesion(r,ds){
  var t=rutOccursOn(r,ds)||r.time;
  var skip=rutIsSkipped(r,ds);
  var h='<div class="ev-detail-overlay" id="rutSesOv"><div class="ev-detail-sheet">';
  h+='<div class="ev-detail-handle"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">';
  h+='<button class="sy-back" id="rutSesClose">&#8592;</button>';
  h+='<div style="flex:1;font-size:.9rem;font-weight:600;text-align:center">Rutina</div>';
  h+='<button class="ev-list-btn" id="rutSesEdit" style="font-size:.8rem;padding:6px 12px">&#9998; Editar</button>';
  h+='</div>';
  h+='<div class="ev-detail-color-bar" style="background:'+r.color+'"></div>';
  h+='<div class="ev-detail-title" style="color:'+r.color+'">'+escHtml(r.name)+'</div>';
  h+='<div class="ev-detail-date">&#128197; '+_rutFmtCorto(ds)+' &#183; '+t+'–'+rutFin(t,r.dur)+'</div>';
  if(skip)h+='<div class="ev-detail-note" style="color:var(--c-orange)">Sesión marcada como saltada</div>';
  h+='<div class="ev-detail-actions">';
  h+='<button class="ev-btn" id="rutSesSkip">'+(skip?'&#10003; Marcar como hecha':'&#10007; Marcar como saltada')+'</button>';
  h+='</div></div></div>';
  var ov=document.getElementById('eventsOverlay');
  var old=document.getElementById('rutSesWrap');if(old)old.remove();
  var wrap=document.createElement('div');wrap.id='rutSesWrap';wrap.innerHTML=h;
  ov.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('rutSesOv');
    if(fo){fo.classList.add('open');fo.addEventListener('click',function(e){if(e.target===fo)closeRutSesion();});}
  });
  document.getElementById('rutSesClose').addEventListener('click',closeRutSesion);
  document.getElementById('rutSesEdit').addEventListener('click',function(){
    closeRutSesion();setTimeout(function(){openRutForm(r);},310);
  });
  document.getElementById('rutSesSkip').addEventListener('click',function(){
    rutToggleSkip(r,ds);
    closeRutSesion();setTimeout(function(){refreshEvents();},310);
    showToast(rutIsSkipped(r,ds)?'Sesión marcada como saltada':'Sesión marcada como hecha','success',
      function(){rutToggleSkip(r,ds);refreshEvents();});
  });
}
function closeRutSesion(){
  var fo=document.getElementById('rutSesOv');
  if(fo)fo.classList.remove('open');
  setTimeout(function(){var w=document.getElementById('rutSesWrap');if(w)w.remove();},300);
}

/* ══ Binds de la pestaña ══ */
function bindRutinasEvents(){
  document.querySelectorAll('.econ-sub-tab[data-rsub]').forEach(function(b){
    b.addEventListener('click',function(){RUT_SUBTAB=b.dataset.rsub;refreshEvents(false);});
  });
  var add=document.getElementById('rutAdd');
  if(add)add.addEventListener('click',function(){openRutForm(null);});
  document.querySelectorAll('.rut-sug-btn[data-sug]').forEach(function(b){
    b.addEventListener('click',function(){
      var s=RUT_SUGERENCIAS[+b.dataset.sug];
      var _ll=rutDiaLleno(s.weekDays,evDk(new Date()),null);
      if(_ll){
        showToast('El '+_rutFmt(_ll)+' ya tiene '+EV_MAX_RUT_DIA+' rutinas (el m\u00e1ximo)','error');
        return;
      }
      RUTINAS.push({id:'rut-'+Date.now(),createdAt:Date.now(),name:s.name,color:s.color,
        icon:s.icon||'gen',
        weekDays:s.weekDays.slice(),time:RUT_TIME_DEFAULT,dur:RUT_DUR_DEFAULT,
        start:evDk(new Date()),suspend:null,weeks:{},skips:{}});
      saveRutinas();refreshEvents();
      showToast('Rutina "'+s.name+'" creada','success');
    });
  });
  document.querySelectorAll('.rut-edit[data-rid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();openRutForm(rutById(b.dataset.rid));});
  });
  /* Pulsar una sesión (próximas o histórico) alterna hecha/saltada */
  document.querySelectorAll('.rut-prox-i[data-rid],.rut-hist-i[data-rid]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var r=rutById(b.dataset.rid);if(!r)return;
      rutToggleSkip(r,b.dataset.ds);
      refreshEvents();
      showToast(rutIsSkipped(r,b.dataset.ds)?'Sesión saltada':'Sesión hecha','success',
        function(){rutToggleSkip(r,b.dataset.ds);refreshEvents();});
    });
  });
}
