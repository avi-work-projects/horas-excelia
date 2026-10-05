/* Recordatorios: todas las ocurrencias de hoy/mañana y cumpleaños a siete días. */
var HOME_BIRTHDAYS_OPEN=false;
function homeReminderColor(ev){return ev._rut?getEvDisplayColor(ev):getEvType(ev)==='Ensayos boda'?'#92334d':evTypeColor(getEvKind(ev),getEvType(ev));}
function homeReminderEventText(when,time,content,missingTime,ev){
  var marker=ev?(getEvType(ev)==='Asturias'?'<span class="home-reminder-asturias" style="background:'+fakeTrans(EV_TYPE_COLORS['grande|Asturias'],.65)+'">'+EV_FILTER_SHORT.Asturias+'</span>':evUpcomingMarkHtml(ev)):'&#128197;';
  return '<span class="home-reminder-symbol" aria-hidden="true">'+marker+'</span><span class="home-reminder-text"><strong class="home-reminder-when">'+escHtml(when)+(time?' · '+escHtml(time):(missingTime?' · Sin hora':''))+'</strong> <span class="home-reminder-content">'+escHtml(content)+'</span></span>';
}
function homeReminderNoteHtml(ev,ds){
  var notes=[ev.note,ev.dayNotes&&ev.dayNotes[ds]].filter(Boolean);
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
      if(ev._rutSkip)content+=' · Saltada';
      items.push({days:days,time:time||'',type:'event',color:homeReminderColor(ev),text:homeReminderEventText(days===0?'Hoy':'Mañana',time,content,type==='Ensayos boda',ev)+bodaUltimoEnsayoHtml(ev),note:homeReminderNoteHtml(ev,ds)});
    });
  }
  return items.sort(function(a,b){return a.days-b.days||Number(!!a.time)-Number(!!b.time)||a.time.localeCompare(b.time);});
}
function homeReminderTasksHtml(){
  var pending=tasksItems(tasksData(),'pending');
  var h='<section class="home-pending-tasks" aria-label="Tareas pendientes"><div class="home-pending-heading"><strong>Tareas pendientes</strong><button type="button" id="homeTasksOpen">Mis tareas'+(pending.length>2?' ('+pending.length+')':'')+' →</button></div>';
  if(pending.length){h+='<ul>';pending.slice(0,2).forEach(function(t){h+='<li>'+escHtml(t.title)+'</li>';});h+='</ul>';}
  else h+='<p>No tienes tareas pendientes.</p>';
  return h+'</section>';
}
function homeReminderItemsHtml(items,birthdayCount){
  var h='',count=0,group='',eventDay=null;
  function endGroup(){
    if(group==='birthdays'&&count>2)h+='</div><button type="button" class="home-birthday-more" id="homeBirthdayToggle" aria-controls="homeBirthdayExtra" aria-expanded="false">Ver '+(birthdayCount-2)+' cumpleaños más <span aria-hidden="true">⌄</span></button>';
    if(group)h+='</section>';
  }
  items.forEach(function(it){
    var next=it.type==='vip'||it.type==='bday'?'birthdays':it.type==='event'?'events':'warnings';
    if(next!==group){
      endGroup();
      h+='<section class="home-reminder-group" aria-label="'+({birthdays:'Cumpleaños',events:'Eventos',warnings:'Avisos'}[next])+'">';group=next;
    }
    if(group==='birthdays'&&++count===3)h+='<div id="homeBirthdayExtra" hidden>';
    var dayBreak=group==='events'&&eventDay!==null&&eventDay!==it.days;
    if(group==='events')eventDay=it.days;
    var attrs=' class="home-popup-item '+it.type+(dayBreak?' home-reminder-next-day':'')+(it.note?' home-reminder-disclosure':'')+'"'+(it.color?' style="--reminder-color:'+it.color+'"':'');
    h+=it.note?'<details'+attrs+'><summary aria-label="Mostrar u ocultar descripción">'+it.text+'<span class="home-reminder-toggle" aria-hidden="true"></span></summary>'+it.note+'</details>':'<div'+attrs+'>'+it.text+'</div>';
  });
  endGroup();
  return h;
}
function closeHomePopup(){
  document.getElementById('homePopup').style.display='none';
  try{sessionStorage.setItem('excelia-popup-dismissed','1');}catch(e){}
}
function openHomePopup(force){
  var csvWarnings=csvPendingWarnings(new Date()),routineWarnings=rutFlexWarnings(evDk(new Date())),pendingTasks=tasksReminder(new Date());
  try{if(!force&&sessionStorage.getItem('excelia-popup-dismissed')&&!csvWarnings.length&&!routineWarnings.length&&!pendingTasks.length)return;}catch(e){}
  var items=csvWarnings.map(function(it){return {type:'warn',text:'&#9888; '+escHtml(it.text)};});
  routineWarnings.forEach(function(it){items.push({type:'warn',text:'&#128197; '+escHtml(it.text)});});
  var today=new Date();today.setHours(0,0,0,0);
  var dow=today.getDay(),off=dow===0?6:dow-1;
  var thisMon=new Date(today);thisMon.setDate(thisMon.getDate()-off);
  for(var w=-2;w<=3;w++){
    var d=new Date(thisMon);d.setDate(d.getDate()+w*7);
    if(SW[dk(d)])continue;
    var hasWork=false;
    for(var di=0;di<5;di++){
      var wd=new Date(d);wd.setDate(wd.getDate()+di);var t=dayT(wd);
      if(t==='normal'||t==='vacaciones'||t==='ausencia'){hasWork=true;break;}
    }
    if(hasWork){var label='Semana del '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');items.push({type:'warn',text:'&#128221; <strong>'+label+'</strong> sin enviar'});}
  }
  var birthdays=[];
  BDAYS.forEach(function(b){
    var bd=new Date(today.getFullYear(),b.month-1,b.day);if(bd<today)bd.setFullYear(today.getFullYear()+1);
    var diff=Math.round((bd-today)/86400000);if(diff>7)return;
    var when=diff===0?' (hoy)':diff===1?' (mañana)':' (en '+diff+'d)';
    birthdays.push({days:diff,type:b.vip?'vip':'bday',text:'<span class="home-birthday-line">'+(b.vip?'<img class="home-reminder-vip" src="./VIP.png" alt="VIP">':bdaySymbolHtml())+'<span><strong>'+escHtml(b.name)+'</strong>'+when+'<span class="home-reminder-content">'+(isBdayAlarmSet(b)?'Alarma creada':'Sin alarma')+'</span></span></span>'});
  });
  birthdays.sort(function(a,b){return a.days-b.days||(a.type==='vip'?0:1)-(b.type==='vip'?0:1);});
  items=items.concat(birthdays,homeReminderEvents(today));
  if(!force&&!items.length&&!pendingTasks.length)return;
  var content=document.getElementById('homePopupContent');if(!content)return;
  HOME_BIRTHDAYS_OPEN=false;
  content.innerHTML=homeReminderTasksHtml()+homeReminderItemsHtml(items,birthdays.length);
  content.scrollTop=0;
  document.getElementById('homePopup').style.display='flex';
  if(pendingTasks.length)tasksReminderSeen(new Date());
  var tasksButton=document.getElementById('homeTasksOpen');if(tasksButton)tasksButton.onclick=function(){closeHomePopup();openTasks();};
  var toggle=document.getElementById('homeBirthdayToggle');
  if(toggle)toggle.onclick=function(){
    HOME_BIRTHDAYS_OPEN=!HOME_BIRTHDAYS_OPEN;
    document.getElementById('homeBirthdayExtra').hidden=!HOME_BIRTHDAYS_OPEN;
    toggle.setAttribute('aria-expanded',String(HOME_BIRTHDAYS_OPEN));
    toggle.innerHTML=HOME_BIRTHDAYS_OPEN?'Mostrar menos <span aria-hidden="true">⌃</span>':'Ver '+(birthdays.length-2)+' cumpleaños más <span aria-hidden="true">⌄</span>';
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
