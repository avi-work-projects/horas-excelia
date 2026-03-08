/* ============================================================
   SUMMARY — Resumen anual + Puentes
   ============================================================ */

var FEST_REQUIRED=12;
var VAC_STORAGE_KEY='excelia-vac-days';
var VAC_ENTITLEMENT=(function(){
  try{var v=localStorage.getItem(VAC_STORAGE_KEY);if(v)return parseInt(v,10);}catch(e){}
  return 23;
})();
var SUMMARY_YEAR=new Date().getFullYear();

function saveVacEntitlement(n){
  VAC_ENTITLEMENT=n;
  try{localStorage.setItem(VAC_STORAGE_KEY,String(n));}catch(e){}
}

function fhY(h){return h===0?'0h':fh(h);}
function fdY(d){return d+'d';}

function computeYearlySummary(year){
  var today=new Date(); today.setHours(0,0,0,0);
  var worked=0,toWork=0,hoursWorked=0,hoursToWork=0;
  var lvPast=0,lvFuture=0;
  var vacTaken=0,vacFuture=0,festTaken=0,festFuture=0,ausTaken=0,ausFuture=0;
  var mHours=new Array(12).fill(0),mDays=new Array(12).fill(0);
  var mHoursP=new Array(12).fill(0),mDaysP=new Array(12).fill(0);
  var d65P=0,d65F=0,d7P=0,d7F=0,d8P=0,d8F=0,d9P=0,d9F=0;
  var d=new Date(year,0,1);
  while(d.getFullYear()===year){
    var w=d.getDay();
    if(w>=1&&w<=5){
      var past=d<=today,m=d.getMonth();
      var t=dayT(d),h=dayH(d),eh=defH(d);
      if(past){
        lvPast++;
        if(t==='normal'){
          worked++;hoursWorked+=h;mHours[m]+=h;mDays[m]++;
          if(h===6.5)d65P++;else if(h===7)d7P++;else if(h===8)d8P++;else if(h===9)d9P++;
        } else if(t==='vacaciones'){
          vacTaken++;
          if(!EXCL_VAC){var h2=defH(d);worked++;hoursWorked+=h2;mHours[m]+=h2;mDays[m]++;if(h2===6.5)d65P++;else if(h2===7)d7P++;else if(h2===8)d8P++;else if(h2===9)d9P++;}
        } else if(t==='festivo'){
          festTaken++;
          if(!EXCL_FEST){var h2=defH(d);worked++;hoursWorked+=h2;mHours[m]+=h2;mDays[m]++;if(h2===6.5)d65P++;else if(h2===7)d7P++;else if(h2===8)d8P++;else if(h2===9)d9P++;}
        } else if(t==='ausencia')ausTaken++;
      } else {
        lvFuture++;
        if(t==='normal'){
          toWork++;hoursToWork+=eh;mHoursP[m]+=eh;mDaysP[m]++;
          if(w===5)d65F++;
          else{var gh=getMonthH(d.getFullYear(),m,d.getDate());if(gh===7)d7F++;else if(gh===8)d8F++;else d9F++;}
        } else if(t==='vacaciones'){
          vacFuture++;
          if(!EXCL_VAC){toWork++;hoursToWork+=eh;mHoursP[m]+=eh;mDaysP[m]++;if(w===5)d65F++;else{var gh2=getMonthH(d.getFullYear(),m,d.getDate());if(gh2===7)d7F++;else if(gh2===8)d8F++;else d9F++;}}
        } else if(t==='festivo'){
          festFuture++;
          if(!EXCL_FEST){toWork++;hoursToWork+=eh;mHoursP[m]+=eh;mDaysP[m]++;if(w===5)d65F++;else{var gh2=getMonthH(d.getFullYear(),m,d.getDate());if(gh2===7)d7F++;else if(gh2===8)d8F++;else d9F++;}}
        } else if(t==='ausencia')ausFuture++;
      }
    }
    d.setDate(d.getDate()+1);
  }
  var lvTotal=lvPast+lvFuture;
  var vacTotal=vacTaken+vacFuture,vacPend=Math.max(0,VAC_ENTITLEMENT-vacTotal);
  var hoursTotal=Math.round((hoursWorked+hoursToWork)*10)/10;
  var maxMh=0,minMh=Infinity,maxMhi=0,minMhi=0;
  for(var i=0;i<12;i++){var tot=mHours[i]+mHoursP[i];if(tot>maxMh){maxMh=tot;maxMhi=i;}if((mDays[i]+mDaysP[i])>0&&tot<minMh){minMh=tot;minMhi=i;}}
  if(minMh===Infinity)minMh=0;
  var maxMd=0,minMd=Infinity,maxMdi=0,minMdi=0;
  for(var i=0;i<12;i++){var td=mDays[i]+mDaysP[i];if(td>maxMd){maxMd=td;maxMdi=i;}if(td>0&&td<minMd){minMd=td;minMdi=i;}}
  if(minMd===Infinity)minMd=0;
  var wTotal=worked+toWork;
  var avgHDay=wTotal>0?Math.round((hoursWorked+hoursToWork)/wTotal*10)/10:0;
  var actMths=0;for(var i=0;i<12;i++){if(mDays[i]+mDaysP[i]>0)actMths++;}
  var avgHMonth=actMths>0?Math.round(hoursTotal/actMths):0;
  var avgDMonth=actMths>0?Math.round((worked+toWork)/actMths*10)/10:0;
  return{worked:worked,toWork:toWork,workedTotal:worked+toWork,
    lvPast:lvPast,lvFuture:lvFuture,lvTotal:lvTotal,
    vacTaken:vacTaken,vacFuture:vacFuture,vacTotal:vacTotal,vacPend:vacPend,
    festTaken:festTaken,festFuture:festFuture,festTotal:festTaken+festFuture,
    ausTaken:ausTaken,ausFuture:ausFuture,ausTotal:ausTaken+ausFuture,
    hoursWorked:Math.round(hoursWorked*10)/10,
    hoursToWork:Math.round(hoursToWork*10)/10,
    hoursTotal:hoursTotal,
    maxMh:maxMh,maxMhi:maxMhi,minMh:minMh,minMhi:minMhi,
    maxMd:maxMd,maxMdi:maxMdi,minMd:minMd,minMdi:minMdi,
    avgHDay:avgHDay,avgHMonth:avgHMonth,avgDMonth:avgDMonth,
    d65P:d65P,d65F:d65F,d7P:d7P,d7F:d7F,d8P:d8P,d8F:d8F,d9P:d9P,d9F:d9F,
    mHours:mHours,mDays:mDays,mHoursP:mHoursP,mDaysP:mDaysP};
}

function barChart3(dataW,dataP,labels,colorBase,cm){
  var W=320,H=100,PB=20,PT=18,n=12;
  var combined=dataW.map(function(w,i){return w+dataP[i];});
  var maxV=Math.max.apply(null,combined)||1;
  var bw=Math.floor((W-n*2)/n),gap=2;
  var svg='<svg viewBox="0 0 '+W+' '+(H+PB)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
  for(var i=0;i<n;i++){
    var x=i*(bw+gap);
    var total=dataW[i]+dataP[i];
    var hw=total>0?Math.max(2,Math.round((dataW[i]/maxV)*(H-PT))):0;
    var hp=total>0?Math.max(dataP[i]>0?2:0,Math.round((dataP[i]/maxV)*(H-PT))):0;
    var totalH=hw+hp;
    if(i<cm||(cm===-1&&dataW[i]>0)){
      if(totalH>0)svg+='<rect x="'+x+'" y="'+(H-totalH)+'" width="'+bw+'" height="'+totalH+'" rx="2" fill="'+colorBase+'" opacity=".45"/>';
    } else if(i===cm){
      if(hp>0)svg+='<rect x="'+x+'" y="'+(H-hw-hp)+'" width="'+bw+'" height="'+hp+'" rx="2" fill="'+colorBase+'" opacity=".25"/>';
      if(hw>0)svg+='<rect x="'+x+'" y="'+(H-hw)+'" width="'+bw+'" height="'+hw+'" rx="2" fill="'+colorBase+'" opacity="1"/>';
    } else {
      if(hp>0)svg+='<rect x="'+x+'" y="'+(H-hp)+'" width="'+bw+'" height="'+hp+'" rx="2" fill="'+colorBase+'" opacity=".25"/>';
    }
    if(total>0){svg+='<text x="'+(x+bw/2)+'" y="'+(H-totalH-3)+'" text-anchor="middle" font-size="7" fill="#8888a0">'+total+'</text>';}
    svg+='<text x="'+(x+bw/2)+'" y="'+(H+PB-2)+'" text-anchor="middle" font-size="7" fill="#5a5a70">'+labels[i]+'</text>';
  }
  svg+='</svg>';
  return svg;
}

function computePuentes(year){
  var festivosList=[],vacacionesList=[],ausList=[];
  var d=new Date(year,0,1);
  while(d.getFullYear()===year){
    var t=dayT(d);
    if(t==='festivo')festivosList.push(new Date(d));
    if(t==='vacaciones')vacacionesList.push(new Date(d));
    if(t==='ausencia')ausList.push(new Date(d));
    d.setDate(d.getDate()+1);
  }
  function isNWD(dt){var w=dt.getDay();return w===0||w===6||dayT(dt)==='festivo'||dayT(dt)==='vacaciones';}
  function typeOf(dt){var w=dt.getDay();if(w===0||w===6)return 'weekend';return dayT(dt);}
  var scan=new Date(year,0,1); scan.setDate(scan.getDate()-7);
  var scanEnd=new Date(year,11,31); scanEnd.setDate(scanEnd.getDate()+7);
  var sequences=[],inSeq=false,seqDays=[];
  while(scan<=scanEnd){
    if(isNWD(scan)){
      if(!inSeq){inSeq=true;seqDays=[];}
      seqDays.push({date:new Date(scan),type:typeOf(scan)});
    } else {
      if(inSeq){
        if(seqDays.length>=3){
          var hasSpecial=seqDays.some(function(x){return x.type==='festivo'||x.type==='vacaciones';});
          var inYear=seqDays.some(function(x){return x.date.getFullYear()===year;});
          if(hasSpecial&&inYear)sequences.push(seqDays.slice());
        }
        inSeq=false;seqDays=[];
      }
    }
    scan.setDate(scan.getDate()+1);
  }
  if(inSeq&&seqDays.length>=3){
    var hasSpecial=seqDays.some(function(x){return x.type==='festivo'||x.type==='vacaciones';});
    if(hasSpecial)sequences.push(seqDays.slice());
  }
  var puenteKeys={};
  sequences.forEach(function(seq){seq.forEach(function(x){puenteKeys[dk(x.date)]=true;});});
  var festivosSueltos=festivosList.filter(function(fdate){return !puenteKeys[dk(fdate)];});
  var vacSueltos=vacacionesList.filter(function(vd){return !puenteKeys[dk(vd)];});
  return{festivosList:festivosList,vacacionesList:vacacionesList,ausList:ausList,
    puentes:sequences,festivosSueltos:festivosSueltos,vacSueltos:vacSueltos};
}

function renderSummaryContent(){
  var s=computeYearlySummary(SUMMARY_YEAR);
  var festPend=Math.max(0,FEST_REQUIRED-s.festTotal);
  var cm=SUMMARY_YEAR===new Date().getFullYear()?new Date().getMonth():-1;
  var hTitleParts=['Horas trabajadas'];
  if(!EXCL_FEST)hTitleParts.push('festivos');
  if(!EXCL_VAC)hTitleParts.push('vacaciones');
  var htTitle=hTitleParts.join(' + ');
  var dTitleParts=['D\u00edas trabajados'];
  if(!EXCL_FEST)dTitleParts.push('festivos');
  if(!EXCL_VAC)dTitleParts.push('vacaciones');
  var dtTitle=dTitleParts.join(' + ');
  var h='<div class="sy-header">';
  h+='<button class="sy-back" id="syBack">&#8592;</button>';
  h+='<div class="sy-year-nav"><button class="sy-nav" id="syPrev">&#9664;</button><div class="sy-year">'+SUMMARY_YEAR+'</div><button class="sy-nav" id="syNext">&#9654;</button></div>';
  h+='<button class="sy-pdf" id="syPdf">PDF</button>';
  h+='</div>';
  h+=renderNavBar('summary');
  h+='<div class="sy-body">';
  // Checkboxes quitar festivos/vacaciones
  h+='<div class="excl-row">';
  h+='<label class="excl-item" style="color:var(--festivo)"><input type="checkbox" class="excl-chk" id="syExclFestChk" style="accent-color:var(--festivo)"'+(EXCL_FEST?' checked':'')+'>&#160;Quitar festivos</label>';
  h+='<label class="excl-item" style="color:var(--vacaciones)"><input type="checkbox" class="excl-chk" id="syExclVacChk" style="accent-color:var(--vacaciones)"'+(EXCL_VAC?' checked':'')+'>&#160;Quitar vacaciones</label>';
  h+='</div>';

  // Dias L-V
  h+='<div class="sy-section"><div class="sy-section-title">L&#8211;V Totales</div><div class="sy-cards3">';
  h+='<div class="sy-card hi"><div class="sy-val">'+fdY(s.lvPast)+'</div><div class="sy-lbl">Pasados</div></div>';
  h+='<div class="sy-card dim"><div class="sy-val">'+fdY(s.lvFuture)+'</div><div class="sy-lbl">Futuros</div></div>';
  h+='<div class="sy-card hi2"><div class="sy-val">'+fdY(s.lvTotal)+'</div><div class="sy-lbl">Totales</div></div>';
  h+='</div></div>';

  // Dias trabajados (table)
  h+='<div class="sy-section"><div class="sy-section-title">'+dtTitle+'</div>';
  h+='<table class="sy-table"><thead><tr><th class="sy-td-lbl">Jornada</th><th>Pasados</th><th>Futuros</th><th>Total</th></tr></thead><tbody>';
  h+='<tr><td class="sy-td-lbl">6,5h (Viernes)</td><td>'+s.d65P+'</td><td>'+s.d65F+'</td><td>'+(s.d65P+s.d65F)+'</td></tr>';
  h+='<tr><td class="sy-td-lbl">7h</td><td>'+s.d7P+'</td><td>'+s.d7F+'</td><td>'+(s.d7P+s.d7F)+'</td></tr>';
  h+='<tr><td class="sy-td-lbl">8h</td><td>'+s.d8P+'</td><td>'+s.d8F+'</td><td>'+(s.d8P+s.d8F)+'</td></tr>';
  h+='<tr><td class="sy-td-lbl">9h</td><td>'+s.d9P+'</td><td>'+s.d9F+'</td><td>'+(s.d9P+s.d9F)+'</td></tr>';
  h+='<tr class="sy-tr-total"><td class="sy-td-lbl">Total</td><td>'+s.worked+'</td><td>'+s.toWork+'</td><td>'+s.workedTotal+'</td></tr>';
  h+='</tbody></table></div>';

  // Ausencias
  h+='<div class="sy-section"><div class="sy-section-title">Ausencias</div>';
  // Config días vacaciones
  h+='<div class="vac-config-row">';
  h+='<span class="vac-config-label">D\u00edas de vacaciones anuales</span>';
  h+='<input class="vac-config-input" id="vacInput" type="number" min="1" max="60" value="'+VAC_ENTITLEMENT+'">';
  h+='</div>';
  h+='<table class="sy-table"><thead><tr><th class="sy-td-lbl">Tipo</th><th>Pasados</th><th>Futuros</th><th>Total</th><th>Quedan</th></tr></thead><tbody>';
  h+='<tr><td class="sy-td-lbl">Vacaciones</td><td>'+s.vacTaken+'</td><td>'+s.vacFuture+'</td><td>'+s.vacTotal+'</td><td>'+(s.vacPend>0?s.vacPend:'&#10003;')+'</td></tr>';
  h+='<tr><td class="sy-td-lbl">Festivos</td><td>'+s.festTaken+'</td><td>'+s.festFuture+'</td><td>'+s.festTotal+'</td>';
  h+='<td>'+(festPend>0?festPend:'&#10003;')+'</td></tr>';
  h+='<tr><td class="sy-td-lbl">Bajas</td><td>'+s.ausTaken+'</td><td>'+s.ausFuture+'</td><td>'+s.ausTotal+'</td><td>&#8212;</td></tr>';
  h+='<tr class="sy-tr-total"><td class="sy-td-lbl">Total</td><td>'+(s.vacTaken+s.festTaken+s.ausTaken)+'</td><td>'+(s.vacFuture+s.festFuture+s.ausFuture)+'</td><td>'+(s.vacTotal+s.festTotal+s.ausTotal)+'</td><td></td></tr>';
  h+='</tbody></table>';
  if(s.vacPend>0){h+='<div class="sy-note warn">Quedan '+s.vacPend+' d&#237;a'+(s.vacPend===1?'':'s')+' de vacaciones por planificar.</div>';}
  if(festPend>0){h+='<div class="sy-note warn-fest">Faltan '+festPend+' d&#237;a'+(festPend===1?'':'s')+' festivos por marcar (en Espa&#241;a: '+FEST_REQUIRED+' d&#237;as/a&#241;o).</div>';}
  h+='</div>';

  // Horas trabajadas
  h+='<div class="sy-section"><div class="sy-section-title">'+htTitle+'</div><div class="sy-cards3">';
  h+='<div class="sy-card hi"><div class="sy-val">'+fhY(s.hoursWorked)+'</div><div class="sy-lbl">Trabajadas</div></div>';
  h+='<div class="sy-card dim"><div class="sy-val">'+fhY(s.hoursToWork)+'</div><div class="sy-lbl">Por trabajar</div></div>';
  h+='<div class="sy-card hi2"><div class="sy-val">'+fhY(s.hoursTotal)+'</div><div class="sy-lbl">Totales</div></div>';
  h+='</div><div class="sy-cards4" style="margin-top:8px">';
  h+='<div class="sy-card"><div class="sy-val-sm">'+fhY(s.maxMh)+'</div><div class="sy-lbl">M&#225;x./mes<br>'+MN_SHORT[s.maxMhi]+'</div></div>';
  h+='<div class="sy-card"><div class="sy-val-sm">'+fhY(s.minMh)+'</div><div class="sy-lbl">M&#237;n./mes<br>'+MN_SHORT[s.minMhi]+'</div></div>';
  (function(){var totMin=Math.round(s.avgHDay*60);var avgHH=Math.floor(totMin/60);var avgHM=totMin%60;var sub=avgHM>0?'<div class="sy-sublbl">'+avgHH+'h '+avgHM+'min</div>':'';h+='<div class="sy-card"><div class="sy-val-sm">'+fhY(s.avgHDay)+'</div>'+sub+'<div class="sy-lbl">Media/d&#237;a</div></div>';})();
  h+='<div class="sy-card"><div class="sy-val-sm">'+fhY(s.avgHMonth)+'</div><div class="sy-lbl">Media/mes</div></div>';
  h+='</div>';
  h+='<div class="sy-chart">'+barChart3(s.mHours,s.mHoursP,MN_SHORT,'#6c8cff',cm)+'</div>';
  h+='</div>';

  // Dias trabajados (bars)
  h+='<div class="sy-section"><div class="sy-section-title">'+dtTitle+'</div><div class="sy-cards3">';
  h+='<div class="sy-card hi"><div class="sy-val">'+fdY(s.worked)+'</div><div class="sy-lbl">Trabajados</div></div>';
  h+='<div class="sy-card dim"><div class="sy-val">'+fdY(s.toWork)+'</div><div class="sy-lbl">Por trabajar</div></div>';
  h+='<div class="sy-card hi2"><div class="sy-val">'+fdY(s.workedTotal)+'</div><div class="sy-lbl">Totales</div></div>';
  h+='</div><div class="sy-cards3" style="margin-top:8px">';
  h+='<div class="sy-card"><div class="sy-val-sm">'+fdY(s.maxMd)+'</div><div class="sy-lbl">M&#225;x./mes<br>'+MN_SHORT[s.maxMdi]+'</div></div>';
  h+='<div class="sy-card"><div class="sy-val-sm">'+fdY(s.minMd)+'</div><div class="sy-lbl">M&#237;n./mes<br>'+MN_SHORT[s.minMdi]+'</div></div>';
  h+='<div class="sy-card"><div class="sy-val-sm">'+(s.avgDMonth%1===0?s.avgDMonth:s.avgDMonth.toFixed(1).replace('.',','))+'d</div><div class="sy-lbl">Media/mes</div></div>';
  h+='</div>';
  h+='<div class="sy-chart">'+barChart3(s.mDays,s.mDaysP,MN_SHORT,'#34d399',cm)+'</div>';
  h+='</div>';

  // Días festivos/vacaciones sin puentes (sueltos — primero)
  var p=computePuentes(SUMMARY_YEAR);
  function fdd(dt){return DF[dt.getDay()]+', '+fd(dt);}
  var sueltos=p.festivosSueltos.concat(p.vacSueltos).sort(function(a,b){return a-b;});
  h+='<div class="sy-section"><div class="sy-section-title">D&#237;as festivos/vacaciones sin puentes</div>';
  if(sueltos.length===0){h+='<div class="sy-note">No hay d&#237;as sueltos fuera de puentes.</div>';}
  else{
    sueltos.forEach(function(dt){
      var t=dayT(dt);
      var tagLabel=t==='festivo'?'Festivo':'Vacaciones';
      h+='<div class="sy-suelto"><div class="sy-suelto-row">';
      h+='<span class="sy-suelto-date">'+fdd(dt)+'</span>';
      h+='<span class="sy-list-tag '+t+'">'+tagLabel+'</span>';
      h+='</div></div>';
    });
  }
  h+='</div>';

  // Puentes
  h+='<div class="sy-section"><div class="sy-section-title">Puentes (3+ d&#237;as seguidos)</div>';
  if(p.puentes.length===0){h+='<div class="sy-note">No hay puentes marcados para este a&#241;o.</div>';}
  else{
    p.puentes.forEach(function(seq){
      var first=seq[0].date,last=seq[seq.length-1].date;
      var nDays=seq.length;
      var vCount=seq.filter(function(x){return x.type==='vacaciones';}).length;
      var fCount=seq.filter(function(x){return x.type==='festivo';}).length;
      var wCount=seq.filter(function(x){return x.type==='weekend';}).length;
      var parts=[];if(fCount)parts.push(fCount+' festivo'+(fCount>1?'s':''));if(vCount)parts.push(vCount+' vacac.');if(wCount)parts.push(wCount+' fin'+(wCount>1?'es':'')+' semana');
      var evItems=[];
      if(typeof getEventsOn==='function'){
        seq.forEach(function(x){
          getEventsOn(dk(x.date)).forEach(function(ev){
            if(!evItems.some(function(e){return e.id===ev.id;}))evItems.push(ev);
          });
        });
      }
      h+='<div class="sy-puente">';
      h+='<div class="sy-puente-hdr">';
      h+='<div class="sy-puente-range">'+fdd(first)+' &#8594; '+fdd(last)+'</div>';
      h+='<div class="sy-puente-count">'+nDays+' d&#237;as</div>';
      h+='</div>';
      h+='<div class="sy-puente-comp">'+parts.join(' + ')+'</div>';
      if(evItems.length){
        h+='<div class="sy-puente-evs">';
        evItems.forEach(function(ev){
          var dateStr;
          if(ev.start===ev.end){
            dateStr=ev.start.slice(8,10)+'/'+ev.start.slice(5,7);
          } else {
            dateStr=ev.start.slice(8,10)+'/'+ev.start.slice(5,7)+' &#8594; '+ev.end.slice(8,10)+'/'+ev.end.slice(5,7);
          }
          h+='<div class="sy-puente-ev" data-id="'+ev.id+'" style="cursor:pointer"><span>&#128197;&nbsp;'+escHtml(ev.title)+'</span><span class="sy-puente-ev-date">'+dateStr+'</span></div>';
        });
        h+='</div>';
      }
      h+='</div>';
    });
  }
  h+='</div>';

  // Festivos
  var festLbl='Festivos '+p.festivosList.length+' d&#237;as'+(festPend>0?' (faltan '+festPend+' por marcar)':'');
  h+='<div class="sy-section"><div class="sy-section-title">'+festLbl+'</div>';
  if(p.festivosList.length===0){h+='<div class="sy-note">No hay festivos marcados para este a&#241;o.</div>';}
  else{
    var festByM=new Array(12).fill(0).map(function(){return[];});
    p.festivosList.forEach(function(dt){festByM[dt.getMonth()].push(dt);});
    for(var mi=0;mi<12;mi++){
      if(!festByM[mi].length)continue;
      h+='<div class="sy-month-sep">'+MN[mi]+'</div>';
      h+='<ul class="sy-list">';
      festByM[mi].forEach(function(dt){
        h+='<li class="sy-list-item"><span class="sy-list-date">'+fdd(dt)+'</span><span class="sy-list-tag festivo">Festivo</span></li>';
      });
      h+='</ul>';
    }
  }
  h+='</div>';

  // Vacaciones
  var vacLbl='Vacaciones '+p.vacacionesList.length+' d&#237;as'+(s.vacPend>0?' (faltan '+s.vacPend+' por planificar)':'');
  h+='<div class="sy-section"><div class="sy-section-title">'+vacLbl+'</div>';
  if(p.vacacionesList.length===0){h+='<div class="sy-note">No hay d&#237;as de vacaciones marcados para este a&#241;o.</div>';}
  else{
    var vacByM=new Array(12).fill(0).map(function(){return[];});
    p.vacacionesList.forEach(function(dt){vacByM[dt.getMonth()].push(dt);});
    for(var mi=0;mi<12;mi++){
      if(!vacByM[mi].length)continue;
      h+='<div class="sy-month-sep">'+MN[mi]+'</div>';
      h+='<ul class="sy-list">';
      vacByM[mi].forEach(function(dt){
        h+='<li class="sy-list-item"><span class="sy-list-date">'+fdd(dt)+'</span><span class="sy-list-tag vacaciones">Vacaciones</span></li>';
      });
      h+='</ul>';
    }
  }
  h+='</div>';

  // Bajas / Ausencias
  h+='<div class="sy-section"><div class="sy-section-title">Bajas / Ausencias'+(p.ausList.length?' '+p.ausList.length+' d&#237;as':'')+'</div>';
  if(p.ausList.length===0){h+='<div class="sy-note">No hay d&#237;as de ausencia marcados para este a&#241;o.</div>';}
  else{
    var ausByM=new Array(12).fill(0).map(function(){return[];});
    p.ausList.forEach(function(dt){ausByM[dt.getMonth()].push(dt);});
    for(var mi=0;mi<12;mi++){
      if(!ausByM[mi].length)continue;
      h+='<div class="sy-month-sep">'+MN[mi]+'</div>';
      h+='<ul class="sy-list">';
      ausByM[mi].forEach(function(dt){
        h+='<li class="sy-list-item"><span class="sy-list-date">'+fdd(dt)+'</span><span class="sy-list-tag ausencia">Ausencia</span></li>';
      });
      h+='</ul>';
    }
  }
  h+='</div>';

  h+='</div>';
  return h;
}

function openSummary(){
  SUMMARY_YEAR=CY;
  var ov=document.getElementById('summaryOverlay');
  document.getElementById('summaryContent').innerHTML=renderSummaryContent();
  ov.style.display='block';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindSummaryEvents();});});
}

function closeSummary(){
  var ov=document.getElementById('summaryOverlay');
  ov.classList.remove('open');
  setTimeout(function(){ov.style.display='none';},320);
}

function bindSummaryEvents(){
  document.getElementById('syBack').addEventListener('click',closeSummary);
  bindNavBar('summary',closeSummary);
  document.getElementById('syPdf').addEventListener('click',function(){
    document.body.classList.add('print-summary');
    window.print();
    document.body.classList.remove('print-summary');
  });
  document.getElementById('syPrev').addEventListener('click',function(){
    SUMMARY_YEAR--;
    document.getElementById('summaryContent').innerHTML=renderSummaryContent();
    bindSummaryEvents();
  });
  document.getElementById('syNext').addEventListener('click',function(){
    SUMMARY_YEAR++;
    document.getElementById('summaryContent').innerHTML=renderSummaryContent();
    bindSummaryEvents();
  });
  // Vacaciones configurables
  var vacInput=document.getElementById('vacInput');
  if(vacInput){
    vacInput.addEventListener('change',function(){
      var v=parseInt(this.value,10);
      if(v>0){saveVacEntitlement(v);document.getElementById('summaryContent').innerHTML=renderSummaryContent();bindSummaryEvents();}
    });
  }
  // Quitar festivos / vacaciones
  var chkFest=document.getElementById('syExclFestChk');
  var chkVac=document.getElementById('syExclVacChk');
  if(chkFest)chkFest.addEventListener('change',function(){EXCL_FEST=this.checked;save();document.getElementById('summaryContent').innerHTML=renderSummaryContent();bindSummaryEvents();});
  if(chkVac)chkVac.addEventListener('change',function(){EXCL_VAC=this.checked;save();document.getElementById('summaryContent').innerHTML=renderSummaryContent();bindSummaryEvents();});
  // Eventos en puentes → ver detalle (abre ventana de eventos con el detalle encima)
  document.querySelectorAll('.sy-puente-ev[data-id]').forEach(function(el){
    el.addEventListener('click',function(){
      var id=el.dataset.id;
      var ev=null;
      for(var i=0;i<EVENTS.length;i++){if(EVENTS[i].id===id){ev=EVENTS[i];break;}}
      if(!ev)return;
      closeSummary();
      setTimeout(function(){openEvents();setTimeout(function(){openEvDetail(ev);},350);},320);
    });
  });
}
