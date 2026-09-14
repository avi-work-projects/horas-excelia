/* ============================================================
   HOME POPUP - Recordatorios al cargar la home (semanas sin
   enviar, cumpleanos hoy/manana, VIP sin alarma, eventos hoy)
   ============================================================ */
/* ── Home Popup: semanas sin marcar + VIP sin alarma ── */
function openHomePopup(){
  var csvWarnings=csvPendingWarnings(new Date());
  try{
    if(sessionStorage.getItem('excelia-popup-dismissed')&&!csvWarnings.length)return;
  }catch(e){}
  var items=csvWarnings.map(function(it){return {type:'warn',text:'&#9888; '+escHtml(it.text)};});
  // Semanas sin enviar: 2 anteriores + actual + 3 siguientes
  var today=new Date();today.setHours(0,0,0,0);
  var dow=today.getDay();var off=dow===0?6:dow-1;
  var thisMon=new Date(today);thisMon.setDate(thisMon.getDate()-off);
  for(var w=-2;w<=3;w++){
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
  // Todos los cumpleanos hasta dentro de 7 dias, solo si falta la alarma.
  if(typeof BDAYS!=='undefined'&&BDAYS.length){
    var birthdays=[];
    BDAYS.forEach(function(b){
      var bd=new Date(today.getFullYear(),b.month-1,b.day);
      if(bd<today)bd.setFullYear(today.getFullYear()+1);
      var diff=Math.round((bd-today)/86400000);
      if(diff>7||(typeof isBdayAlarmSet==='function'&&isBdayAlarmSet(b)))return;
      var when=diff===0?' (hoy)':diff===1?' (ma\u00f1ana)':' (en '+diff+'d)';
      birthdays.push({days:diff,type:b.vip?'vip':'bday',text:(b.vip?'&#11088; ':'&#127874; ')+escHtml(b.name)+when+' — sin alarma'});
    });
  }
  if(typeof birthdays!=='undefined'){
    birthdays.sort(function(a,b){return (a.type==='vip'?0:1)-(b.type==='vip'?0:1)||a.days-b.days;});
    items=items.concat(birthdays);
  }
  // Eventos hoy o mañana (inicio) + fin de eventos largos (>7 días)
  if(typeof EVENTS!=='undefined'&&EVENTS.length){
    var eventItems=[];
    EVENTS.forEach(function(ev){
      if(!ev.start)return;
      if(ev.id&&ev.id.indexOf('ev-bday-vip-')===0)return; // ya cubiertos por BDAYS
      var evStart=new Date(ev.start+'T00:00:00');
      var diff=Math.round((evStart-today)/86400000);
      if(diff===0||diff===1){
        var lbl=escHtml(ev.title)+(diff===0?' (\u00a1hoy!)':' (ma\u00f1ana!)');
        var time=evTimeLabel(ev);
        if(isEvBarAlways(ev)){var ida=evTramos(ev).filter(function(tr){return tr.k==='ida';})[0];time=ida&&ida.t.time||'';}
        if(getEvType(ev)==='Ensayos boda'){
          var pareja=typeof bodaCouple==='function'&&ev.boda?bodaCouple(ev.boda.coupleId):null;
          var contenido=pareja?'Ensayo — '+pareja.name:(ev.title||'Ensayo sin pareja asignada');
          lbl=(diff===0?'Hoy':'Mañana')+' · '+(time?escHtml(time):'Sin hora')+' · '+escHtml(contenido);
        }else if(time)lbl+=' · '+escHtml(time);
        eventItems.push({days:diff,time:time||'',type:'event',text:'&#128197; '+lbl});
      }
      // Fin de eventos de más de 7 días
      if(ev.end&&ev.end>ev.start){
        var evEnd=new Date(ev.end+'T00:00:00');
        var span=Math.round((evEnd-evStart)/86400000);
        if(span>7){
          var diffEnd=Math.round((evEnd-today)/86400000);
          if(diffEnd===0||diffEnd===1){
            var endLbl=escHtml(ev.title)+' \u2014 fin'+(diffEnd===0?' hoy':' ma\u00f1ana')+'!';
            var vuelta=evTramos(ev).filter(function(tr){return tr.k==='vuelta';})[0];
            if(vuelta&&vuelta.t.time)endLbl+=' · '+escHtml(vuelta.t.time);
            eventItems.push({days:diffEnd,time:vuelta&&vuelta.t.time||'',type:'event',text:'&#128197; '+endLbl});
          }
        }
      }
    });
  }
  if(typeof eventItems!=='undefined'){
    // Sin hora primero; en cada grupo, fecha y hora de inicio (o vuelta).
    eventItems.sort(function(a,b){return Number(!!a.time)-Number(!!b.time)||a.days-b.days||a.time.localeCompare(b.time);});
    items=items.concat(eventItems);
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
  if(closeBtn)closeBtn.onclick=dismissPopup;
  if(dismissBtn)dismissBtn.onclick=dismissPopup;
}
openHomePopup();
// Al volver a la PWA, los CSV pendientes siguen necesitando atencion.
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&csvPendingWarnings(new Date()).length)openHomePopup();
});
