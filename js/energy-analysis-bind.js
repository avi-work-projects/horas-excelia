/* Binds de la ventana de energía. Los controles editables solo afectan escenarios. */
function bindEnergyAnalysis(w,kind){
  // Cerrar este panel antes de usar la navegación compartida, también al volver a Gastos del hogar.
  w.querySelectorAll('.overlay-nav-bar [data-nav]').forEach(function(b){b.onclick=function(){closeEnergyAnalysis();navigateMain(b.dataset.nav);};});
  function refresh(){var body=w.querySelector('.sy-body'),top=body?body.scrollTop:0;openEnergyAnalysis(kind);var fresh=document.querySelector('#energyAnalysisOverlay .sy-body');if(fresh)fresh.scrollTop=top;}
  w.querySelector('#energyAnalysisBack').onclick=closeEnergyAnalysis;
  w.querySelectorAll('[data-energy-tab]').forEach(function(b){b.onclick=function(){ENERGY_ANALYSIS_TAB=b.dataset.energyTab;openEnergyAnalysis(kind);};});
  function year(delta){ENERGY_SUMMARY_TOTAL=false;ENERGY_ANALYSIS_YEAR+=delta;refresh();}
  var total=w.querySelector("#energySummaryTotal");if(total)total.onclick=function(){ENERGY_SUMMARY_TOTAL=!ENERGY_SUMMARY_TOTAL;refresh();};
  w.querySelectorAll('[data-analysis-year]').forEach(function(b){b.onclick=function(){year(+b.dataset.analysisYear);};});
  function tab(delta){
    var index=ENERGY_ANALYSIS_TABS.map(function(t){return t[0];}).indexOf(ENERGY_ANALYSIS_TAB),next=ENERGY_ANALYSIS_TABS[index+delta];
    if(next){ENERGY_ANALYSIS_TAB=next[0];openEnergyAnalysis(kind);}
  }
  // El panel interior consume su gesto: cambiar de año nunca cambia además de pestaña.
  if(['resumen','consumo','costes'].indexOf(ENERGY_ANALYSIS_TAB)!==-1&&!(ENERGY_ANALYSIS_TAB==='resumen'&&ENERGY_SUMMARY_TOTAL)){
    energyBindSwipe(w.querySelector('.energy-window-content').firstElementChild,function(){year(1);},function(){year(-1);});
  }
  energyBindSwipe(w.querySelector('.energy-window'),function(){tab(1);},function(){tab(-1);});
  var input=w.querySelector('#energyStudyFile');w.querySelector('#energyImportTop').onclick=function(){input.click();};
  input.onchange=function(){var file=input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{
    var data=validateImport(JSON.parse(reader.result)),preview=energyImportPreview(data);
    askImportMode(file.name,function(){try{var before=energyImportHistory(data);refresh();showToast('Histórico importado','success',function(){energyRestoreHistory(before);refresh();});}catch(e){showToast(e.message,'error');}},preview,{mergeOnly:true});
  }catch(e){showToast(e.message,'error');}};reader.onerror=function(){showToast('No se pudo leer el archivo','error');};reader.readAsText(file);input.value='';};
  var exp=w.querySelector('#energyStudyExport');if(exp)exp.onclick=function(){shareOrDownload(new Blob([JSON.stringify({version:7,energyTaxes:energyTaxes(),energyBills:energyBills().filter(function(b){return b.kind===kind;}),energyContracts:energyContracts().filter(function(c){return c.kind===kind;})},null,2)],{type:'application/json'}),'gestify-energia-'+kind+'.json',null,{download:true});};
  var cycle=w.querySelector('#energyVatCycle');if(cycle)cycle.onchange=function(){var modes=['historical','none','constant'];ENERGY_COST_VAT=modes[(modes.indexOf(ENERGY_COST_VAT)+1)%3];refresh();};
  [['energyCostRate',function(n){ENERGY_COST_RATE=n;}],['energyCompareVat',function(n){ENERGY_COMPARE_VAT=n;}]].forEach(function(pair){var el=w.querySelector('#'+pair[0]);if(el)el.onchange=function(){var n=Number(el.value);if(el.value===''||!Number.isFinite(n)||n<0||n>100){showToast('Indica un IVA entre 0 y 100 %','error');return;}pair[1](n);refresh();};});
  w.querySelectorAll('[data-energy-compare-tariff]').forEach(function(b){b.onclick=function(){ENERGY_COMPARE_TARIFF=+b.dataset.energyCompareTariff;refresh();};});

}

function energyBindSwipe(el,next,prev){
  addSwipe(el,next,prev);
  var start=null;
  // La misma prioridad para arrastrar con ratón en escritorio.
  el.addEventListener('pointerdown',function(e){
    start=null;if(e.pointerType!=='mouse'||e.target.closest('input,select,button,a'))return;
    for(var n=e.target;n&&n!==el;n=n.parentElement){
      if(n._swipeAdded)return;
      if(n.scrollWidth>n.clientWidth+1&&/auto|scroll/.test(getComputedStyle(n).overflowX))return;
    }
    start={x:e.clientX,y:e.clientY};
  });
  el.addEventListener('pointerup',function(e){if(!start)return;var dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){e.preventDefault();if(dx<0)next();else prev();}});
  el.addEventListener('pointerleave',function(){start=null;});
  el.addEventListener('pointercancel',function(){start=null;});
}
