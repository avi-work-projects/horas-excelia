function renderBdayUpcoming(){
  if(!BDAYS.length)return '<div class="sy-note">No hay cumplea\u00f1os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub.</div>';

  var today=new Date();today.setHours(0,0,0,0);

  function getBdaysInRange(startOffset,days){
    var items=[];
    for(var i=0;i<days;i++){
      var d=new Date(today);d.setDate(d.getDate()+startOffset+i);
      var bds=getBdaysOn(d.getMonth()+1,d.getDate());
      var diff=startOffset+i;
      bds.forEach(function(b){if(!BDAY_UP_VIP||b.vip)items.push({b:b,diff:diff});});
    }
    return items;
  }

  var prevItems=getBdaysInRange(-4,4);   /* 4 días anteriores */
  var todayItems=getBdaysInRange(0,1);   /* hoy */
  var nxtItems=getBdaysInRange(1,14);    /* proximos 14 dias */

  function bdayLabel(diff){
    if(diff===0)return '\u00a1Hoy!';
    if(diff===1)return 'Ma\u00f1ana';
    if(diff>1)return 'en '+diff+'\u202fd\u00edas';
    if(diff===-1)return 'Ayer';
    if(diff===-2)return 'Antes de ayer';
    return 'Hace '+Math.abs(diff)+'\u202fd\u00edas';
  }

  function renderGroup(title,list,isCurWeek){
    if(!list.length)return '<div class="sy-note">No hay cumplea\u00f1os '+title.toLowerCase()+'.</div>';
    var s='<div class="ev-week-sep'+(list[0].diff===0?' now':'')+'">'+title+'</div><div class="ev-upcoming-section">';
    list.forEach(function(x){
      var lbl=bdayLabel(x.diff);
      var color=getBdayColor(x.b);
      var isT=x.diff===0;
      var isPastDay=x.diff<0;
      var isNearDay=x.diff>0&&x.diff<=3;
      var lblCls='bday-upcoming-lbl'+(isT?' today-lbl':isPastDay?' past-lbl':(isCurWeek&&x.diff>0)?' this-week':isNearDay?' near':'');
      var isVip=!!x.b.vip;
      var alarmSet=isBdayAlarmSet(x.b);
      var vipCls=isVip?' bday-vip-item':'';
      var bellHtml=isPastDay?'':'<span class="ev-upcoming-bell'+(alarmSet?' set':'')+'">&#128276;</span>';
      var bidxUp=BDAYS.indexOf(x.b);
      var iconHtml=isVip
        ?'<img src="./VIP.png" class="bday-upcoming-vip-img" alt="VIP">'
        :'\uD83C\uDF82';
      s+='<div class="bday-upcoming-item'+vipCls+(isT?' bday-today-item':'')+'" data-bday-idx="'+bidxUp+'" data-bday-name="'+escHtml(x.b.name)+'" data-bday-day="'+x.b.day+'" data-bday-month="'+x.b.month+'" data-diff="'+x.diff+'">';
      s+='<div class="bday-upcoming-icon" style="background:'+color+'22;border-color:'+color+'">'+iconHtml+'</div>';
      s+='<div class="bday-upcoming-info">';
      s+='<div class="bday-upcoming-name">'+bdName(x.b.name)+'</div>';
      var _dwn=['Dom','Lun','Mar','Mi\u00e9','Jue','Vie','S\u00e1b'];
      var _bd=new Date(today);_bd.setDate(_bd.getDate()+x.diff);
      s+='<div class="bday-upcoming-date">'+_dwn[_bd.getDay()]+' '+x.b.day+' de '+MN[x.b.month-1]+'</div>';
      s+='</div>';
      s+='<div class="ev-upcoming-right">'+bellHtml+'<div class="'+lblCls+'">'+lbl+'</div></div>';
      s+='</div>';
    });
    return s+'</div>';
  }

  var h='<div class="excl-row ev-up-filters"><label class="excl-item"><input type="checkbox" class="bday-up-vip"'+(BDAY_UP_VIP?' checked':'')+'> Solo <img class="bday-vip-img" src="./VIP.png" alt="VIP"></label></div>';
  if(prevItems.length){
    h+='<div class="bday-upcoming-section">';
    h+=renderGroup('Pasados',prevItems);
    h+='</div>';
  }
  if(todayItems.length){
    h+='<div class="bday-upcoming-section" style="margin-top:8px">';
    h+=renderGroup('Hoy',todayItems,true);
    h+='</div>';
  }
  h+='<div class="bday-upcoming-section" style="margin-top:8px">';
  [['Ma\u00f1ana',1,1],['Pr\u00f3ximos 7 d\u00edas',2,7],['Pr\u00f3ximos 14 d\u00edas',8,14]].forEach(function(group){
    var list=nxtItems.filter(function(x){return x.diff>=group[1]&&x.diff<=group[2];});
    if(list.length)h+=renderGroup(group[0],list);
  });
  if(!nxtItems.length)h+='<div class="sy-note">No hay cumplea\u00f1os en los pr\u00f3ximos 14 d\u00edas.</div>';
  h+='</div>';
  return h;
}

/* ── Calendario mensual ───────────────────────────────────── */
function renderBdayCalMonth(){
  var today=new Date();today.setHours(0,0,0,0);
  var DN7=['L','M','X','J','V','S','D'];
  var h='<div class="bday-week-hdr">';
  DN7.forEach(function(n){h+='<div>'+n+'</div>';});
  h+='</div>';
  var first=new Date(BDAY_YEAR,BDAY_MONTH,1);
  var last=new Date(BDAY_YEAR,BDAY_MONTH+1,0);
  var cur=new Date(first);
  var dow=cur.getDay();var off=dow===0?6:dow-1;
  cur.setDate(cur.getDate()-off);
  while(cur<=last){
    h+='<div class="bday-week-grid">';
    for(var i=0;i<7;i++){
      var d=new Date(cur);
      var inM=d.getMonth()===BDAY_MONTH;
      var isTod=d.getTime()===today.getTime();
      var past=inM&&d<today;
      var bds=getBdaysOn(d.getMonth()+1,d.getDate());
      var bdow=d.getDay();
      var cls='bday-cell'+(inM?'':' out-m')+(isTod?' today-bday':'')+(past?' past-cal-day':'')+(bdow===0||bdow===6?' weekend':'');
      var dataAttrs=inM?' data-cal-day="'+d.getDate()+'" data-cal-month="'+(d.getMonth()+1)+'"':'';
      h+='<div class="'+cls+'"'+dataAttrs+'>';
      h+='<div class="bday-num">'+d.getDate()+'</div>';
      bds.forEach(function(b){
        var color=b.vip?'#fbbf24':getBdayColor(b);
        var sn=bdName(b.name);   /* nombre completo: el cajetin admite 3 lineas */
        var bidx=BDAYS.indexOf(b);
        var vipCls=b.vip?' bday-badge-vip':'';
        var vipXtra=b.vip?';border-width:2px;box-shadow:0 0 5px rgba(251,191,36,.55)':'';
        h+='<div class="bday-badge'+vipCls+'" data-bday-idx="'+bidx+'" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'" style="background:'+color+'22;color:'+color+';border-color:'+color+vipXtra+'" title="'+bdName(b.name)+(b.vip?' VIP':'')+'">'+sn+'</div>';
      });
      h+='</div>';
      cur.setDate(cur.getDate()+1);
    }
    h+='</div>';
  }
  return h;
}

/* ── Lista por meses ──────────────────────────────────────── */
function renderBdayList(){
  if(!BDAYS.length)return '<div class="sy-note">No hay cumplea\u00f1os cargados. Importa un archivo JSON o configura el secreto BIRTHDAYS en GitHub.</div>';
  /* El buscador y el boton de anadir viven en la barra fija de arriba
     (renderBdayContent), fuera del .sy-body, para que no se muevan al hacer
     scroll ni dejen ver nada por detras. */
  var h='';
  // Helper: effective VIP state (considers pending changes)
  function getEffVip(b,idx){
    if(BDAY_VIP_PENDING!==null&&BDAY_VIP_PENDING.hasOwnProperty(idx))return BDAY_VIP_PENDING[idx];
    return !!b.vip;
  }
  var byM=[];for(var m=0;m<12;m++)byM.push([]);
  BDAYS.forEach(function(b){if(b.month>=1&&b.month<=12)byM[b.month-1].push(b);});
  byM.forEach(function(list,m){
    var filtered;
    if(BDAY_EDIT_VIP&&BDAY_VIP_PENDING!==null){
      // In edit mode, filter uses effective (pending) VIP state
      if(BDAY_FILTER_VIP==='vip')filtered=list.filter(function(b){return getEffVip(b,BDAYS.indexOf(b));});
      else if(BDAY_FILTER_VIP==='novip')filtered=list.filter(function(b){return !getEffVip(b,BDAYS.indexOf(b));});
      else filtered=list;
    } else {
      filtered=BDAY_FILTER_VIP==='vip'?list.filter(function(b){return !!b.vip;}):
               BDAY_FILTER_VIP==='novip'?list.filter(function(b){return !b.vip;}):list;
    }
    if(!filtered.length&&(m!==new Date().getMonth()||BDAY_FILTER_VIP!=='all'))return;
    filtered.sort(function(a,b){return a.day-b.day;});
    h+='<div class="sy-section bday-month-section" data-month="'+m+'"><div class="bday-month-hdr">'+MN[m]+'</div>';
    filtered.forEach(function(b){
      var dl=daysUntil(b.month,b.day);
      var lbl=dl===0?'\u00a1Hoy!':dl===1?'Ma\u00f1ana':'en '+dl+'d';
      var cls='bday-list-left'+(dl===0?' today-lbl':dl<=7?' near':'');
      var color=getBdayColor(b);
      var sname=escHtml(b.name.toLowerCase());
      var lidx=BDAYS.indexOf(b);
      var effVip=BDAY_EDIT_VIP?getEffVip(b,lidx):!!b.vip;
      var editCls=BDAY_EDIT_VIP?(effVip?' bday-list-vip-active':' bday-list-vip-dim'):'';
      var vipStar=effVip?' <img src="./VIP.png" class="bday-vip-img" alt="VIP">':'';
      h+='<div class="bday-list-item'+editCls+'" data-bday-idx="'+lidx+'" data-bday-name="'+escHtml(b.name)+'" data-bday-day="'+b.day+'" data-bday-month="'+b.month+'" data-sname="'+sname+'">';
      h+='<span class="bday-list-day">'+b.day+'</span>';
      h+='<span class="bday-list-name">'+bdName(b.name)+vipStar+'</span>';
      h+='<span class="'+cls+'">'+lbl+'</span>';
      h+='</div>';
    });
    h+='</div>';
  });
  return h;
}

/* ── Contenido principal ──────────────────────────────────── */
function renderBdayContent(){
  var isUpcoming=BDAY_VIEW==='upcoming';
  var h=renderNavBar('bday');
  // TABS en nivel 2 (justo bajo el nav bar)
  h+='<div class="bday-hdr-sub">';
  h+='<div class="ev-view-zone ev-zone-a"><button class="ev-view-toggle'+(BDAY_VIEW==='upcoming'?' active':'')+'" id="bdViewUpcoming">Pr\u00f3ximos<br>Cumplea\u00f1os</button></div>';
  h+='<div class="ev-view-zone ev-zone-a"><button class="ev-view-toggle'+(BDAY_VIEW==='list'?' active':'')+'" id="bdViewList">Lista<br>Cumplea\u00f1os</button></div>';
  h+='<div class="ev-view-zone ev-zone-a"><button class="ev-view-toggle'+(BDAY_VIEW==='cal'?' active':'')+'" id="bdViewCal">Calendario<br>Cumplea\u00f1os</button></div>';
  h+='</div>';
  // Nivel 3: para TODAS las vistas
  h+='<div class="sy-header with-tabs sy-header-center">';
  h+='<button class="sy-back" id="bdBack">&#8592;</button>';
  if(BDAY_VIEW==='upcoming'){
    h+='<div class="sy-year-nav"><div class="sy-year">Pr\u00f3ximos</div></div>';
  } else if(BDAY_VIEW==='list'){
    h+='<div class="sy-year-nav"><div class="sy-year">Cumplea\u00f1os</div></div>';
    h+='<div class="sy-hdr-right"><button class="sy-pdf bd-export-btn" id="bdExport" '
      +'title="Exportar" aria-label="Exportar"><svg viewBox="0 0 24 24" class="ico-exportar" aria-hidden="true"><path d="M12 3v10m0 0 4-4m-4 4-4-4" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15v4a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-4" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg></button></div>';
  } else {
    h+='<div class="sy-year-nav"><button class="sy-nav" id="bdPrev">&#9664;</button>';
    h+='<div class="sy-year sy-year-2line">'+MN[BDAY_MONTH]+'<span class="sy-year-sub">'+BDAY_YEAR+'</span></div>';
    h+='<button class="sy-nav" id="bdNext">&#9654;</button></div>';
    h+='<button class="today-btn" id="bdToday" style="font-size:.7rem;padding:6px 12px">Hoy</button>';
  }
  h+='</div>';
  // Para 'list': filtro VIP sticky justo bajo nivel 3 (flex-shrink:0, fuera del sy-body)
  if(BDAY_VIEW==='list'){
    h+='<div class="bday-vip-ctrl-bar">';
    h+='<div class="bday-vip-filter-chips">';
    h+='<button class="bday-vip-chip bday-jump-today" id="bdVipAll">Hoy</button>';
    h+='<button class="bday-vip-chip chip-vip'+(BDAY_FILTER_VIP==='vip'?' active':'')+'" id="bdVipOnly"><img src="./VIP.png" style="width:20px;height:auto;vertical-align:middle" alt="VIP"></button>';
    h+='<button class="bday-vip-chip chip-novip'+(BDAY_FILTER_VIP==='novip'?' active':'')+'" id="bdVipNone"><span class="vip-no-icon"><img src="./VIP.png" style="width:20px;height:auto;display:block" alt="no VIP"></span></button>';
    h+='</div>';
    h+='<button class="bday-vip-edit-btn'+(BDAY_EDIT_VIP?' active':'')+'" id="bdEditVip">'+(BDAY_EDIT_VIP?'\u2713 Listo':'Editar VIPs')+'</button>';
    h+='</div>';
  }
  if(BDAY_VIEW==='list'&&BDAYS.length){
    h+='<div class="bday-buscar-bar">';
    h+='<div class="bday-search-wrap"><input class="bday-search-input" id="bdSearch" type="text" '
      +'placeholder="Buscar persona\u2026" value="'+escHtml(BDAY_SEARCH)+'"></div>';
    h+='<button class="bday-io-btn bday-io-btn-add" id="bdAdd">+ A\u00f1adir</button>';
    h+='</div>';
  }
  h+='<div class="sy-body"'+(BDAY_EDIT_VIP?' style="padding-bottom:56px"':'')+'>';
  if(BDAY_VIEW==='upcoming'){
    h+=renderBdayUpcoming();
  } else if(BDAY_VIEW==='cal'){
    if(!BDAYS.length)h+='<div class="sy-note">No hay cumplea\u00f1os cargados.</div>';
    else h+=renderBdayCalMonth();
  } else {
    h+=renderBdayList();
  }
  // Lista: botones en la parte de arriba del renderBdayList(); resto de vistas: botones al fondo
  if(BDAY_VIEW==='upcoming'){
    h+='<div class="bday-io-row">';
    h+='<button class="bday-io-btn bday-io-btn-add" id="bdAdd">+ A\u00f1adir cumplea\u00f1os</button>';
    h+='</div>';
  }
  h+='</div>';
  if(BDAY_EDIT_VIP){
    h+='<button class="bday-cancel-edit-btn" id="bdCancelEdit">Cancelar</button>';
  }
  return h;
}

/* ── Detail panel ─────────────────────────────────────────── */
