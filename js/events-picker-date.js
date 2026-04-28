/* ============================================================
   EVENTS PICKER DATE - Mini-overlay multi-seleccion de dias
   para eventos tipo "Otros". Autocontenido, sin estado externo.
   ============================================================ */

/* === Mini-overlay para elegir d\u00edas espec\u00edficos (Otros) === */
function openOtrosDatePicker(initialDates,color,year,onAccept){
  var sel={};(initialDates||[]).forEach(function(d){sel[d]=true;});
  var curYear=year||(new Date()).getFullYear();
  var MNS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  function _evDk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function _count(){var n=0;for(var k in sel){if(sel[k])n++;}return n;}
  function _render(){
    var n=_count();
    var h='<div class="dp-overlay" id="dpOv">';
    h+='<div class="dp-sheet">';
    h+='<div class="dp-handle"></div>';
    h+='<div class="dp-hdr">';
    h+='<button class="sy-back" id="dpClose">&#8592;</button>';
    h+='<div class="dp-title">Selecci\u00f3n Multid\u00eda</div>';
    h+='<div style="width:36px"></div>';
    h+='</div>';
    h+='<div class="dp-yearnav"><button id="dpYrPrev">&#9664;</button><span>'+curYear+'</span><button id="dpYrNext">&#9654;</button></div>';
    h+='<div class="dp-counter"><b>'+n+'</b> d\u00edas seleccionados</div>';
    h+='<div class="dp-grid">';
    for(var m=0;m<12;m++){
      h+='<div class="dp-month">';
      h+='<div class="dp-mname">'+MNS[m]+'</div>';
      h+='<div class="dp-mhdr">';
      ['L','M','X','J','V','S','D'].forEach(function(x){h+='<div class="dp-mhdr-c">'+x+'</div>';});
      h+='</div>';
      h+='<div class="dp-days">';
      var first=new Date(curYear,m,1),last=new Date(curYear,m+1,0);
      var dow=first.getDay();var off=dow===0?6:dow-1;
      for(var p=0;p<off;p++)h+='<div class="dp-day out"></div>';
      for(var d=1;d<=last.getDate();d++){
        var dt=new Date(curYear,m,d);var ds=_evDk(dt);
        var isWk=dt.getDay()===0||dt.getDay()===6;
        var isSel=!!sel[ds];
        var cls='dp-day'+(isWk?' wk':'')+(isSel?' sel':'');
        var sty=isSel?(' style="background:'+color+';color:#fff;border-color:'+color+'"'):'';
        h+='<div class="'+cls+'" data-ds="'+ds+'"'+sty+'>'+d+'</div>';
      }
      h+='</div></div>';
    }
    h+='</div>';
    h+='<div class="dp-actions">';
    h+='<button class="ev-btn" id="dpClear">Vaciar</button>';
    h+='<button class="ev-btn primary" id="dpAccept">Aceptar ('+n+')</button>';
    h+='</div>';
    h+='</div></div>';
    return h;
  }
  function _attach(){
    var ovEl=document.getElementById('dpOv');
    if(!ovEl)return;
    document.getElementById('dpClose').addEventListener('click',_close);
    document.getElementById('dpYrPrev').addEventListener('click',function(){curYear--;_rerender();});
    document.getElementById('dpYrNext').addEventListener('click',function(){curYear++;_rerender();});
    document.getElementById('dpClear').addEventListener('click',function(){sel={};_rerender();});
    document.getElementById('dpAccept').addEventListener('click',function(){
      var arr=[];for(var k in sel){if(sel[k])arr.push(k);}
      arr.sort();
      _close();
      if(typeof onAccept==='function')onAccept(arr);
    });
    /* Toggle d\u00eda */
    document.querySelectorAll('#dpOv .dp-day[data-ds]').forEach(function(el){
      el.addEventListener('click',function(){
        var ds=el.dataset.ds;
        if(sel[ds])delete sel[ds];else sel[ds]=true;
        if(sel[ds]){
          el.classList.add('sel');
          el.style.background=color;el.style.color='#fff';el.style.borderColor=color;
        }else{
          el.classList.remove('sel');
          el.style.background='';el.style.color='';el.style.borderColor='';
        }
        var n=_count();
        var c=document.querySelector('#dpOv .dp-counter b');if(c)c.textContent=n;
        var a=document.getElementById('dpAccept');if(a)a.textContent='Aceptar ('+n+')';
      });
    });
  }
  function _rerender(){
    var ovEl=document.getElementById('dpOv');
    if(!ovEl)return;
    var parent=ovEl.parentNode;
    parent.innerHTML=_render();
    requestAnimationFrame(function(){var fo=document.getElementById('dpOv');if(fo)fo.classList.add('open');});
    _attach();
  }
  function _close(){
    var fo=document.getElementById('dpOv');
    if(fo)fo.classList.remove('open');
    setTimeout(function(){var w=document.getElementById('dpWrap');if(w)w.remove();},300);
  }
  /* Insertar overlay encima del form */
  var host=document.getElementById('eventsOverlay')||document.body;
  var wrap=document.createElement('div');wrap.id='dpWrap';
  wrap.innerHTML=_render();
  host.appendChild(wrap);
  requestAnimationFrame(function(){
    var fo=document.getElementById('dpOv');
    if(fo)fo.classList.add('open');
  });
  _attach();
}
