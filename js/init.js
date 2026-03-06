/* ============================================================
   INIT — Event listeners globales + arranque
   ============================================================ */

(function(){
  var now=new Date();
  CY=now.getFullYear();
  CM=now.getMonth();

  load();
  render();
  updateBdayBtn();
  updateEventsBtn();

  /* ── Navegación de mes ── */
  document.getElementById('prevBtn').addEventListener('click',function(){
    CM--;if(CM<0){CM=11;CY--;}render();
  });
  document.getElementById('nextBtn').addEventListener('click',function(){
    CM++;if(CM>11){CM=0;CY++;}render();
  });
  document.getElementById('todayBtn').addEventListener('click',function(){
    var n=new Date();CY=n.getFullYear();CM=n.getMonth();render();
  });

  /* ── Chips de horas mensuales ── */
  document.querySelectorAll('.hours-chip').forEach(function(chip){
    chip.addEventListener('click',function(){
      var h=+chip.dataset.h;
      MONTH_H[mkey(CY,CM)]=h;
      save();render();
    });
  });

  /* ── Botones del header (overlays) ── */
  document.getElementById('summaryBtn').addEventListener('click',openSummary);
  document.getElementById('econBtn').addEventListener('click',openEcon);
  document.getElementById('bdayBtn').addEventListener('click',openBday);
  document.getElementById('eventsBtn').addEventListener('click',openEvents);

  /* ── Exportar datos principales ── */
  document.getElementById('exportBtn').addEventListener('click',function(){
    var data={days:ST,sent:SW,monthH:MONTH_H,rate:DAILY_RATE};
    var a=document.createElement('a');
    a.href='data:application/json,'+encodeURIComponent(JSON.stringify(data,null,2));
    a.download='horas-excelia-backup.json';
    a.click();
    showToast('Datos exportados','success');
  });

  /* ── Bottom sheet: overlay de fondo ── */
  document.getElementById('overlay').addEventListener('click',closeSheet);

  /* ── Bottom sheet: opciones de tipo de día ── */
  document.querySelectorAll('.sheet-option').forEach(function(opt){
    opt.addEventListener('click',function(){selectType(opt.dataset.type);});
  });

  /* ── Chips de horas por día (dentro del sheet) ── */
  document.querySelectorAll('.hour-chip-day').forEach(function(chip){
    chip.addEventListener('click',function(){
      if(!ED)return;
      var h=+chip.dataset.h;
      var k=dk(ED);
      if(!ST[k]||ST[k].type)return;
      ST[k]={hours:h};
      save();render();
      document.querySelectorAll('.hour-chip-day').forEach(function(c){
        c.classList.toggle('active',+c.dataset.h===h);
      });
    });
  });

  /* ── Build badge ── */
  if(typeof BUILD!=='undefined'&&BUILD){
    var bb=document.createElement('div');
    bb.className='build-badge';
    var dot=document.createElement('div');
    dot.className='build-dot';
    dot.style.background=BUILD.ok?'#34d399':'#ff6b6b';
    bb.appendChild(dot);
    bb.appendChild(document.createTextNode(BUILD.sha||'local'));
    document.body.appendChild(bb);
  }
})();
