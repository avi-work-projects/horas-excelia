/* Editor transaccional: los períodos solo se aplican tras validar Guardar. */
var PERSONAL_PERIOD_EDIT=null;
function renderPersonalPeriodEditor(){
  var state=PERSONAL_PERIOD_EDIT,item=PERSONAL_DATA[state.section][state.index],year=state.year;
  var h='<div class="ev-detail-overlay" id="personalPeriodsOverlay"><section class="ev-detail-sheet personal-period-editor" role="dialog" aria-modal="true" aria-labelledby="personalPeriodsTitle"><div class="ev-detail-handle"></div><header><button class="sy-back" data-pp-close aria-label="Volver">←</button><div><h2 id="personalPeriodsTitle">'+escHtml(item.label||'Períodos')+'</h2><span>'+year+' · importe según las fechas</span></div></header><div class="personal-period-rows">';
  state.periods.forEach(function(p,i){
    h+='<article class="personal-period-edit-row" data-pp-row="'+i+'"><header><b>Período '+(i+1)+'</b><button type="button" data-pp-remove="'+i+'" aria-label="Quitar período '+(i+1)+'">×</button></header><div class="personal-period-fields">';
    [['start','Desde'],['end','Hasta']].forEach(function(field){h+='<label>'+field[1]+'<input type="date" data-pp-field="'+field[0]+'" aria-label="'+field[1]+' período '+(i+1)+'" min="'+year+'-01-01" max="'+year+'-12-31" value="'+p[field[0]]+'"></label>';});
    h+='<label>Importe (€)<input type="number" min="0" step=".01" data-pp-field="amount" aria-label="Importe período '+(i+1)+'" value="'+p.amount+'"'+(p.paused?' disabled':'')+'></label><div class="personal-frequency" role="group" aria-label="Frecuencia período '+(i+1)+'">';
    ['weekly','monthly','annual'].forEach(function(f){h+='<button type="button" data-pp-frequency="'+f+'" aria-pressed="'+(p.period===f)+'">'+personalPeriodLabel(f)+'</button>';});
    h+='</div></div><label class="personal-pause-check"><input type="checkbox" data-pp-field="paused"'+(p.paused?' checked':'')+'>Paralizado durante este período</label></article>';
  });
  h+='</div><button class="ev-io-btn" id="personalPeriodAdd">+ Añadir período</button><details class="personal-pause"><summary>Paralizar a partir de una fecha</summary><label>Desde<input type="date" id="personalPauseDate" min="'+year+'-01-01" max="'+year+'-12-31" value="'+(new Date().getFullYear()===year?evDk(new Date()):year+'-01-01')+'"></label><button type="button" class="ev-io-btn" id="personalPauseApply">Aplicar parón</button></details><p class="personal-period-hint">Las fechas incluyen ambos días. Fuera de los períodos el importe es cero.</p><p class="personal-period-error" role="alert"></p><button class="ev-io-btn io-primaria" id="personalPeriodsSave">Guardar períodos</button></section></div>';
  return h;
}
function openPersonalPeriodEditor(section,index){
  PERSONAL_PERIOD_EDIT={section:section,index:index,year:FISCAL_YEAR,periods:personalPeriods(PERSONAL_DATA[section][index],FISCAL_YEAR,section),back:NAV_BACK};
  paintPersonalPeriodEditor();NAV_BACK=closePersonalPeriodEditor;
}
function closePersonalPeriodEditor(){
  var back=PERSONAL_PERIOD_EDIT&&PERSONAL_PERIOD_EDIT.back;cerrarPanel('personalPeriodsWrap','personalPeriodsOverlay');PERSONAL_PERIOD_EDIT=null;NAV_BACK=back;
}
function paintPersonalPeriodEditor(){
  var wrap=abrirPanel('personalPeriodsWrap',renderPersonalPeriodEditor(),{contenedor:document.getElementById('fiscalOverlay'),overlay:'personalPeriodsOverlay',alCerrar:closePersonalPeriodEditor});
  var state=PERSONAL_PERIOD_EDIT;
  function error(message){wrap.querySelector('.personal-period-error').textContent=message;}
  function readFields(){
    wrap.querySelectorAll('[data-pp-row]').forEach(function(row){
      var p=state.periods[+row.dataset.ppRow];
      row.querySelectorAll('[data-pp-field]').forEach(function(el){var field=el.dataset.ppField;p[field]=field==='paused'?el.checked:field==='amount'?(el.value===''?NaN:Number(el.value)):el.value;});
    });
  }
  function valid(){readFields();try{personalValidatePeriods(state.periods,state.year);error('');return true;}catch(e){error(e.message);return false;}}
  wrap.querySelector('[data-pp-close]').onclick=closePersonalPeriodEditor;
  wrap.oninput=wrap.onchange=function(e){var row=e.target.closest('[data-pp-row]');if(!row)return;var p=state.periods[+row.dataset.ppRow],field=e.target.dataset.ppField;if(!field)return;p[field]=field==='paused'?e.target.checked:field==='amount'?(e.target.value===''?NaN:Number(e.target.value)):e.target.value;if(field==='paused')row.querySelector('[data-pp-field="amount"]').disabled=p.paused;};
  wrap.querySelectorAll('[data-pp-frequency]').forEach(function(b){b.onclick=function(){var row=b.closest('[data-pp-row]');state.periods[+row.dataset.ppRow].period=b.dataset.ppFrequency;row.querySelectorAll('[data-pp-frequency]').forEach(function(btn){btn.setAttribute('aria-pressed',btn===b);});};});
  wrap.querySelectorAll('[data-pp-remove]').forEach(function(b){b.onclick=function(){readFields();state.periods.splice(+b.dataset.ppRemove,1);paintPersonalPeriodEditor();};});
  wrap.querySelector('#personalPeriodAdd').onclick=function(){
    if(state.periods.length&&!valid())return;
    var sorted=state.periods.slice().sort(function(a,b){return a.start.localeCompare(b.start);}),last=sorted[sorted.length-1],end=state.year+'-12-31',start=state.year+'-01-01';
    if(last){
      if(last.end<end)start=personalDate(personalDay(last.end)+1);
      else{var days=personalDay(last.end)-personalDay(last.start);if(days<1){error('No quedan días: ajusta la fecha final del último período.');return;}
        start=personalDate(personalDay(last.start)+Math.ceil(days/2));last.end=personalDate(personalDay(start)-1);
      }
    }
    state.periods=sorted.concat([{start:start,end:end,amount:last?last.amount:0,period:last?last.period:'monthly',paused:false}]);paintPersonalPeriodEditor();
  };
  wrap.querySelector('#personalPauseApply').onclick=function(){if(!valid())return;try{state.periods=personalPauseFrom(state.periods,wrap.querySelector('#personalPauseDate').value,state.year);paintPersonalPeriodEditor();}catch(e){error(e.message);}};
  wrap.querySelector('#personalPeriodsSave').onclick=function(){
    if(!valid())return;PERSONAL_DATA[state.section][state.index].periods=state.periods.slice().sort(function(a,b){return a.start.localeCompare(b.start);});
    savePersonalYear(state.year);closePersonalPeriodEditor();reRenderFiscal();showToast('Períodos guardados','success');
  };
}
