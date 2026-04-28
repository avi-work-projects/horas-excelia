/* ============================================================
   HOME POPUP - Recordatorios al cargar la home (semanas sin
   enviar, cumpleanos hoy/manana, VIP sin alarma, eventos hoy)
   ============================================================ */
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
