/* Recordatorios: todas las ocurrencias de hoy/mañana y cumpleaños a siete días. */
var HOME_BIRTHDAYS_OPEN=false;
var HOME_REMINDER_EDITING=null; // Fila puntual que ofrece Editar/Cancelar, sin modificar datos.
function homeReminderColor(ev){return ev._rut?getEvDisplayColor(ev):getEvType(ev)==='Ensayos boda'?'#92334d':evTypeColor(getEvKind(ev),getEvType(ev));}
function homeReminderEventText(time,content,ev){
  var marker=ev?(getEvType(ev)==='Asturias'?'<span class="home-reminder-asturias" style="background:'+fakeTrans(EV_TYPE_COLORS['grande|Asturias'],.65)+'">'+EV_FILTER_SHORT.Asturias+'</span>':evUpcomingMarkHtml(ev)):'&#128197;';
  var alarm=ev&&isEvAlarmSet(ev.id)?'<span class="home-reminder-alarm" role="img" aria-label="Alarma creada" title="Alarma creada">⏰</span>':'';
  return '<span class="home-reminder-symbol" aria-hidden="true">'+marker+'</span><span class="home-reminder-text"><span class="home-reminder-content">'+escHtml(content)+'</span></span><span class="home-reminder-meta"><span class="home-reminder-when">'+escHtml(time||'Sin hora')+'</span>'+alarm+'</span>';
}
function homeReminderNoteHtml(ev,ds){
  var notes=[ev.note,ev.dayNotes&&ev.dayNotes[ds]].filter(function(note){return typeof note==='string'&&note.trim();});
  return notes.length?'<p class="home-reminder-description">'+escHtml(notes.join('\n\n'))+'</p>':'';
}
function homeReminderEvents(today){
  var items=[];
  for(var days=0;days<2;days++){
    var date=new Date(today);date.setDate(date.getDate()+days);var ds=evDk(date);
    getEventsOn(ds).forEach(function(ev){
      if(ev.id&&ev.id.indexOf('ev-bday-vip-')===0)return; // Ya figuran en el bloque de cumpleaños.
      var time=evTimeLabel(ev),content=ev.title||getEvType(ev),type=getEvType(ev);
      if(isEvBarAlways(ev)){
        var leg=ds===ev.start?'ida':ds===ev.end?'vuelta':null;
        var tramo=evTramos(ev).filter(function(t){return t.k===leg;})[0];
        time=tramo&&tramo.t.time||'';
        if(ds!==ev.start)content=(ds===ev.end?'Fin · ':'En curso · ')+content;
      }
      if(type==='Ensayos boda'){
        var pareja=ev.boda?bodaCouple(ev.boda.coupleId):null;
        content=pareja?'Ensayo - '+pareja.name:'Ensayo sin pareja asignada';
        if(!bodaPlaceOf(ev))content+=' · Sin sala';
      }
      if(ev._rutSkip)content+=' · Cancelada';
      items.push({event:ev,date:ds,title:content,days:days,time:time||'',type:'event',color:homeReminderColor(ev),text:homeReminderEventText(time,content,ev)+bodaUltimoEnsayoHtml(ev),note:homeReminderNoteHtml(ev,ds)});
    });
  }
  return items.sort(function(a,b){return a.days-b.days||evUpcomingCompare(a.event,b.event);});
}
function homeReminderTasksHtml(){
  var pending=tasksItems(tasksData(),'pending');
  var h='<section class="home-pending-tasks" aria-label="Tareas pendientes"><div class="home-pending-heading"><strong>Tareas pendientes</strong></div>';
  if(pending.length){h+='<ul>';pending.slice(0,3).forEach(function(t){h+='<li>'+escHtml(t.title)+'</li>';});h+='</ul>';}
  else h+='<p>No tienes tareas pendientes.</p>';
  return h+'</section>';
}
function homeReminderCardHtml(it){
  var hasNotes=it.type==='event'&&!!it.note;
  var attrs=' class="home-popup-item '+it.type+(hasNotes?' home-reminder-disclosure':'')+'"'+(it.color?' style="--reminder-color:'+it.color+'"':'');
  if(it.person)attrs+=' data-reminder-birthday="'+BDAYS.indexOf(it.person)+'"';
  if(it.type!=='event')return '<div'+attrs+'>'+it.text+'</div>';
  attrs+=' data-reminder-id="'+escHtml(it.event.id)+'" data-reminder-date="'+it.date+'"';
  var actions=isEvBarAlways(it.event)?'':'<span class="home-reminder-edit-actions" hidden><button type="button" data-reminder-edit>Editar</button><button type="button" data-reminder-cancel aria-label="Cancelar edición">×</button></span>';
  if(!hasNotes)return '<div'+attrs+'><div class="home-reminder-row">'+it.text+actions+'</div></div>';
  return '<details'+attrs+'><summary class="home-reminder-row" aria-label="Notas de '+escHtml(it.title||it.event.title||getEvType(it.event))+'">'+it.text+'<span class="home-reminder-toggle" aria-hidden="true"></span>'+actions+'</summary><div class="home-reminder-expanded">'+it.note+'</div></details>';
}
function homeReminderGroup(title,content,extra,tone){
  return '<section class="home-reminder-group'+(tone?' home-reminder-'+tone:'')+(['today','tomorrow'].indexOf(tone)!==-1?' home-reminder-day':'')+'" aria-label="'+title+'"><h3>'+title+(extra?'<small>'+extra+'</small>':'')+'</h3><div class="home-reminder-rows">'+content+'</div></section>';
}
function homeReminderPendingHtml(warnings){
  var count=tasksItems(tasksData(),'pending').length;
  var button='<button type="button" id="homeTasksOpen" class="home-tasks-button">'+TASKS_ICON+'<span>Mis tareas'+(count?' ('+count+')':'')+'</span><span aria-hidden="true">›</span></button>';
  return '<section class="home-reminder-pending'+(count||warnings.length?' has-pending':'')+'" aria-label="Pendientes"><div class="home-pending-header"><strong>Pendientes</strong>'+button+'</div><div class="home-pending-body">'+homeReminderTasksHtml()+(warnings.length?'<div class="home-pending-warnings" aria-label="Avisos pendientes">'+warnings.map(homeReminderCardHtml).join('')+'</div>':'')+'</div></section>';
}
function homeReminderLargeHtml(items){
  var grouped=new Map();
  items.forEach(function(it){var list=grouped.get(it.event.id)||[];list.push(it);grouped.set(it.event.id,list);});
  var h='';
  grouped.forEach(function(list){
    var it=list[0],ev=it.event,fmt=function(ds){return ds.slice(8)+'/'+ds.slice(5,7);};
    var period=fmt(ev.start)+(ev.end&&ev.end!==ev.start?'–'+fmt(ev.end):'');
    var status=it.date>ev.start?(it.date===ev.end?'Termina hoy':'En curso'):(it.days?'Empieza mañana':'Empieza hoy');
    var legs=list.filter(function(x){return x.time;}).map(function(x){return (x.days?'Mañana':'Hoy')+' · '+(x.date===ev.start?'Ida':'Vuelta')+' '+x.time;});
    var note=list.map(function(x){return x.note?'<div class="home-reminder-day-note"><small>'+(x.days?'Mañana':'Hoy')+'</small>'+x.note+'</div>':'';}).join('');
    var text=homeReminderEventText(status,ev.title||getEvType(ev),ev)+'<span class="home-reminder-period">'+escHtml(period+(legs.length?' · '+legs.join(' · '):''))+'</span>';
    h+=homeReminderCardHtml(Object.assign({},it,{title:ev.title||getEvType(ev),text:text,note:note}));
  });
  return h;
}
function homeReminderItemsHtml(items,birthdayCount){
  var birthdays=items.filter(function(it){return it.type==='vip'||it.type==='bday';});
  var events=items.filter(function(it){return it.type==='event';});
  var h=homeReminderPendingHtml(items.filter(function(it){return it.type==='warn';}));
  if(birthdays.length){
    var cards=birthdays.slice(0,2).map(homeReminderCardHtml).join('');
    if(birthdays.length>2)cards+='<div id="homeBirthdayExtra" hidden>'+birthdays.slice(2).map(homeReminderCardHtml).join('')+'</div><button type="button" class="home-birthday-more" id="homeBirthdayToggle" aria-controls="homeBirthdayExtra" aria-expanded="false">Ver '+(birthdayCount-2)+' cumpleaños más <span class="ev-tax-chevron" aria-hidden="true"></span></button>';
    h+=homeReminderGroup('Cumpleaños',cards,'Próximos 7 días','birthdays');
  }
  var large=events.filter(function(it){return isEvBarAlways(it.event);});
  if(large.length)h+=homeReminderGroup('Planes en curso y próximos',homeReminderLargeHtml(large),'','plans');
  [0,1].forEach(function(day){
    var list=events.filter(function(it){return it.days===day&&!isEvBarAlways(it.event);});
    if(list.length)h+=homeReminderGroup(day?'Mañana':'Hoy',list.map(homeReminderCardHtml).join(''),list.length+' '+(list.length===1?'evento':'eventos'),day?'tomorrow':'today');
  });
  return h;
}
function closeHomePopup(){
  HOME_REMINDER_EDITING=null;
  document.getElementById('homePopup').style.display='none';
  try{sessionStorage.setItem('excelia-popup-dismissed','1');}catch(e){}
}
/* Abrir los editores existentes, sin escribir datos al mantener pulsado. */
function homeReminderEdit(item){
  closeHomePopup();
  navigateMain('events',function(){
    _switchEvView('cal');EV_YEAR=+item.date.slice(0,4);EV_MONTH=+item.date.slice(5,7)-1;
    openEventsAt();
    if(item.person){openBdayForm(item.person);return;}
    var ev=item.event;
    if(ev._rut){openRutHistoryEdit(ev._rut,ev._rutKey||ev.start,function(){refreshEvents();});return;}
    if(getEvType(ev)==='Ensayos boda'){openBodaClaseForm(ev,function(){refreshEvents();});return;}
    EV_EDIT_DS=item.date;openEvForm(ev);
  });
}
function homeReminderSelectEdit(content,item){
  HOME_REMINDER_EDITING=item||null;
  content.querySelectorAll('[data-reminder-id]').forEach(function(card){
    var active=!!item&&card.dataset.reminderId===item.event.id&&card.dataset.reminderDate===item.date;
    card.classList.toggle('home-reminder-choosing',active);
    var actions=card.querySelector('.home-reminder-edit-actions');if(actions)actions.hidden=!active;
  });
}
function bindHomeReminderEditing(content,items){
  content.querySelectorAll('[data-reminder-id],[data-reminder-birthday]').forEach(function(card){
    var item=items.find(function(it){return it.person?String(BDAYS.indexOf(it.person))===card.dataset.reminderBirthday:it.event&&it.event.id===card.dataset.reminderId&&it.date===card.dataset.reminderDate;});
    if(!item)return;
    card.classList.add('home-reminder-editable');card.title='Mantén pulsado para editar';
    var target=card.querySelector('summary')||card;target.tabIndex=0;target.setAttribute('aria-keyshortcuts','F2');
    var edit=card.querySelector('[data-reminder-edit]'),cancel=card.querySelector('[data-reminder-cancel]');
    function choose(){if(edit)homeReminderSelectEdit(content,item);else homeReminderEdit(item);}
    addLongPress(card,choose);
    card.addEventListener('pointerdown',function(){card._lpFired=0;},true);
    card.addEventListener('click',function(e){if(card._lpFired){card._lpFired=0;e.preventDefault();e.stopImmediatePropagation();}},true);
    if(edit)edit.onclick=function(e){e.preventDefault();e.stopPropagation();homeReminderEdit(item);};
    if(cancel)cancel.onclick=function(e){e.preventDefault();e.stopPropagation();homeReminderSelectEdit(content,null);target.focus({preventScroll:true});};
    card.addEventListener('keydown',function(e){
      if(e.key==='F2'){e.preventDefault();e.stopPropagation();choose();if(edit)edit.focus({preventScroll:true});}
      else if(e.key==='Escape'&&HOME_REMINDER_EDITING){e.preventDefault();e.stopPropagation();homeReminderSelectEdit(content,null);target.focus({preventScroll:true});}
    });
  });
}
function openHomePopup(force){
  loadEvAlarms();
  var csvWarnings=csvPendingWarnings(new Date()),routineWarnings=rutFlexWarnings(evDk(new Date())),pendingTasks=tasksReminder(new Date());
  try{if(!force&&sessionStorage.getItem('excelia-popup-dismissed')&&!csvWarnings.length&&!routineWarnings.length&&!pendingTasks.length)return;}catch(e){}
  var items=csvWarnings.map(function(it){return {type:'warn',text:'&#9888; '+escHtml(it.text)};});
  routineWarnings.forEach(function(it){items.push({type:'warn',text:'&#128197; '+escHtml(it.text)});});
  var today=new Date();today.setHours(0,0,0,0);
  homeSubmissionWarnings(CY,CM).forEach(function(row){
    if(!row.key){items.push({type:'warn',text:'&#128221; <strong>Semanas sin confirmar</strong> · Consulta Outlook desde «Programar pendientes».'});return;}
    var review=['changed','duplicate','uncertain','draft','unverified','ambiguous-thread'].includes(row.state);
    var label='Semana del '+fd(row.mon);
    items.push({type:'warn',text:'&#128221; <strong>'+label+'</strong> '+(review?'por revisar':hoursRemoteConfigured()?'sin enviar ni programar':'sin enviar')});
  });
  var birthdays=[];
  BDAYS.forEach(function(b){
    var bd=new Date(today.getFullYear(),b.month-1,b.day);if(bd<today)bd.setFullYear(today.getFullYear()+1);
    var diff=Math.round((bd-today)/86400000);if(diff>7)return;
    var when=diff===0?'Hoy':diff===1?'Mañana':'En '+diff+' días';
    birthdays.push({days:diff,person:b,date:evDk(bd),type:b.vip?'vip':'bday',text:'<span class="home-birthday-line">'+(b.vip?'<img class="home-reminder-vip" src="./VIP.png" alt="VIP">':bdaySymbolHtml())+'<span class="home-birthday-name" title="'+escHtml(b.name)+'"><strong>'+escHtml(b.name)+'</strong><span class="home-reminder-content">'+(isBdayAlarmSet(b)?'Alarma creada':'Sin alarma')+'</span></span><span class="home-reminder-when">'+when+'</span></span>'});
  });
  birthdays.sort(function(a,b){return a.days-b.days||(a.type==='vip'?0:1)-(b.type==='vip'?0:1);});
  items=items.concat(birthdays,homeReminderEvents(today));
  if(!force&&!items.length&&!pendingTasks.length)return;
  var content=document.getElementById('homePopupContent');if(!content)return;
  HOME_BIRTHDAYS_OPEN=false;
  HOME_REMINDER_EDITING=null;
  content.innerHTML=homeReminderItemsHtml(items,birthdays.length);
  bindHomeReminderEditing(content,items);
  content.scrollTop=0;
  document.getElementById('homePopup').style.display='flex';
  if(pendingTasks.length)tasksReminderSeen(new Date());
  var tasksButton=document.getElementById('homeTasksOpen');if(tasksButton)tasksButton.onclick=function(){closeHomePopup();openTasks();};
  var toggle=document.getElementById('homeBirthdayToggle');
  if(toggle)toggle.onclick=function(){
    HOME_BIRTHDAYS_OPEN=!HOME_BIRTHDAYS_OPEN;
    document.getElementById('homeBirthdayExtra').hidden=!HOME_BIRTHDAYS_OPEN;
    toggle.setAttribute('aria-expanded',String(HOME_BIRTHDAYS_OPEN));
    toggle.innerHTML=HOME_BIRTHDAYS_OPEN?'Mostrar menos <span class="ev-tax-chevron" aria-hidden="true"></span>':'Ver '+(birthdays.length-2)+' cumpleaños más <span class="ev-tax-chevron" aria-hidden="true"></span>';
  };
  document.getElementById('homePopup').onclick=function(e){
    if(e.target===this){closeHomePopup();return;}
    var card=e.target.closest('.home-reminder-disclosure');
    if(card&&!e.target.closest('summary'))card.open=!card.open;
  };
  var closeBtn=document.getElementById('homePopupClose');if(closeBtn)closeBtn.onclick=closeHomePopup;
}
openHomePopup();
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&(csvPendingWarnings(new Date()).length||tasksReminder(new Date()).length))openHomePopup();
});
