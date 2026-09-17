/* Binds de la ventana de energía. Los controles editables solo afectan escenarios. */
function bindEnergyAnalysis(w,kind){
  function refresh(){var body=w.querySelector('.sy-body'),top=body?body.scrollTop:0;openEnergyAnalysis(kind);var fresh=document.querySelector('#energyAnalysisOverlay .sy-body');if(fresh)fresh.scrollTop=top;}
  w.querySelector('#energyAnalysisBack').onclick=closeEnergyAnalysis;
  w.querySelectorAll('[data-energy-tab]').forEach(function(b){b.onclick=function(){ENERGY_ANALYSIS_TAB=b.dataset.energyTab;openEnergyAnalysis(kind);};});
  function year(delta){ENERGY_ANALYSIS_YEAR+=delta;refresh();}
  w.querySelectorAll('[data-analysis-year]').forEach(function(b){b.onclick=function(){year(+b.dataset.analysisYear);};});
  w.querySelectorAll('.energy-year-chart').forEach(function(el){energyBindYearChart(el,function(){year(1);},function(){year(-1);});});
  var input=w.querySelector('#energyStudyFile');w.querySelector('#energyImportTop').onclick=function(){input.click();};
  input.onchange=function(){var file=input.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var before=energyImportHistory(JSON.parse(reader.result));refresh();showToast('Histórico importado','success',function(){energyRestoreHistory(before);refresh();});}catch(e){showToast(e.message,'error');}};reader.onerror=function(){showToast('No se pudo leer el archivo','error');};reader.readAsText(file);input.value='';};
  var exp=w.querySelector('#energyStudyExport');if(exp)exp.onclick=function(){shareOrDownload(new Blob([JSON.stringify({version:7,energyTaxes:energyTaxes(),energyBills:energyBills().filter(function(b){return b.kind===kind;}),energyContracts:energyContracts().filter(function(c){return c.kind===kind;})},null,2)],{type:'application/json'}),'gestify-energia-'+kind+'.json',null,{download:true});};
  w.querySelectorAll('[data-energy-area]').forEach(function(b){b.onclick=function(){if(!b.dataset.energyArea)return;ENERGY_SCENARIO.contractId=b.dataset.energyArea;ENERGY_ANALYSIS_TAB='comparar';refresh();};});
  w.querySelectorAll('[name="energyArea"]').forEach(function(r){r.onchange=function(){ENERGY_SCENARIO.contractId=r.value;refresh();};});
  w.querySelectorAll('[name="energyVat"]').forEach(function(r){r.onchange=function(){ENERGY_SCENARIO.vatMode=r.value;refresh();};});
  var vat=w.querySelector('#energyConstantVat');if(vat)vat.onchange=function(){var n=Number(vat.value);if(vat.value===''||!Number.isFinite(n)||n<0||n>100){showToast('Indica un IVA entre 0 y 100 %','error');return;}ENERGY_SCENARIO.vat=n;refresh();};
  var promos=w.querySelector('#energyPromos');if(promos)promos.onchange=function(){ENERGY_SCENARIO.promos=promos.checked;refresh();};
  ['energyFrom','energyTo'].forEach(function(id){var el=w.querySelector('#'+id);if(el)el.onchange=function(){var start=w.querySelector('#energyFrom').value,end=w.querySelector('#energyTo').value;if((start&&!validIsoDate(start))||(end&&!validIsoDate(end))||(start&&end&&start>end)){showToast('Revisa el intervalo','error');return;}ENERGY_SCENARIO.start=start;ENERGY_SCENARIO.end=end;refresh();};});
  w.querySelectorAll('[data-energy-option]').forEach(function(b){b.onclick=function(){var o=energyScenarioOptions(kind)[+b.dataset.energyOption];ENERGY_SCENARIO.tariff=JSON.parse(JSON.stringify(o.tariff));ENERGY_SCENARIO.name=o.name;refresh();};});
  var reset=w.querySelector('#energyScenarioReset');if(reset)reset.onclick=function(){ENERGY_SCENARIO.tariff=null;ENERGY_SCENARIO.name='Escenario';ENERGY_SCENARIO.contractId='';ENERGY_SCENARIO.start='';ENERGY_SCENARIO.end='';ENERGY_SCENARIO.vatMode='historical';ENERGY_SCENARIO.promos=false;refresh();};
  var edit=w.querySelector('#energyScenarioNew');if(edit)edit.onclick=function(){
    openEnergyTariff(kind,ENERGY_SCENARIO.tariff,function(t){
      var key=kind==='luz'?'electComparaciones':'gasComparaciones',list=DESPACHO[key]||[],i=list.findIndex(function(x){return x.energyStudyHypothesis;});
      if(i<0&&list.length>=5)throw new Error('Ya hay cinco escenarios guardados. Libera uno en Análisis de escenarios.');
      var saved=Object.assign({},t,{nombre:'Hipótesis del estudio',energyStudyHypothesis:true});if(i<0)list.push(saved);else list[i]=saved;DESPACHO[key]=list;saveDespacho();
      ENERGY_SCENARIO.tariff=t;ENERGY_SCENARIO.name='Hipótesis del estudio';refresh();
    },document.body);
  };
}

function energyBindYearChart(el,next,prev){
  addSwipe(el,next,prev);
  var start=null;
  el.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')start={x:e.clientX,y:e.clientY};});
  el.addEventListener('pointerup',function(e){if(!start)return;var dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){e.preventDefault();if(dx<0)next();else prev();}});
  el.addEventListener('pointerleave',function(){start=null;});
}
