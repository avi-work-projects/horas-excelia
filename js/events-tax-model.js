/* Modelo fiscal del evento. Las fechas se eligen por separado; no se calculan plazos aquí. */
var EV_TAX_MODELS={'303':'IVA trimestral · Modelo 303','390':'IVA anual · Modelo 390','100':'Declaración de la renta · Modelo 100'};
function evTaxTitle(code){return {'303':'Domiciliar y presentar IVA','390':'Presentar IVA anual','100':'Presentar Dec. Renta'}[code]||'Presentar Modelo '+(code||'x');}
function renderEvTaxFields(ev){
  var code=ev&&ev.taxModel||'303',known=Object.prototype.hasOwnProperty.call(EV_TAX_MODELS,code);
  return '<div class="ev-field ev-tax-model" id="evFTaxBlock" style="display:'+(ev&&ev.type==='Presentar Modelo'?'block':'none')+'"><label>Modelo que vas a presentar</label><input type="hidden" id="evFTaxModel" value="'+(known?code:'other')+'"><button type="button" class="ev-tax-trigger" id="evFTaxTrigger" aria-expanded="false" aria-controls="evFTaxMenu">'+(known?EV_TAX_MODELS[code]:'Otro modelo')+'<span aria-hidden="true">⌄</span></button><div id="evFTaxMenu" class="ev-tax-menu" hidden>'+['303','390','100','other'].map(function(k){return '<button type="button" data-tax="'+k+'" aria-pressed="'+(k===(known?code:'other'))+'"><strong>'+(k==='other'?'+':k)+'</strong><span>'+(k==='other'?'Otro modelo':{'303':'IVA trimestral','390':'IVA anual','100':'Declaración de la renta'}[k])+'</span></button>';}).join('')+'</div><label id="evFTaxOtherLabel" for="evFTaxOther"'+(known?' hidden':'')+'>Número de modelo<input class="ev-input" id="evFTaxOther" inputmode="numeric" maxlength="3" placeholder="Ej.: 130" value="'+(!known?escHtml(code):'')+'"></label></div>';
}
function evFormTaxCode(form){var select=_evFormEl(form,'evFTaxModel');return select.value==='other'?_evFormEl(form,'evFTaxOther').value.trim():select.value;}
function bindEvTaxFields(form){
  var select=_evFormEl(form,'evFTaxModel'),other=_evFormEl(form,'evFTaxOther'),previous=evFormTaxCode(form);
  function change(){
    _evFormEl(form,'evFTaxOtherLabel').hidden=select.value!=='other';
    var input=_evFormEl(form,'evFTitle'),code=evFormTaxCode(form);
    if(!input.value.trim()||input.value===form.autoTitle||input.value===evTaxTitle(previous)){form.autoTitle=evTaxTitle(code);input.value=form.autoTitle;}
    previous=code;
  }
  var trigger=_evFormEl(form,'evFTaxTrigger'),menu=_evFormEl(form,'evFTaxMenu');
  function close(){menu.hidden=true;trigger.setAttribute('aria-expanded','false');}
  trigger.onclick=function(){menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden));};
  menu.querySelectorAll('[data-tax]').forEach(function(button){button.onclick=function(){
    select.value=button.dataset.tax;change();
    trigger.innerHTML=(EV_TAX_MODELS[select.value]||'Otro modelo')+'<span aria-hidden="true">⌄</span>';
    menu.querySelectorAll('[data-tax]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});close();trigger.focus();
  };});
  _evFormEl(form,'evFTaxBlock').addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){e.preventDefault();e.stopPropagation();close();trigger.focus();}});
  other.oninput=change;
}
