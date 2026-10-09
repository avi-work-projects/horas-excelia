/* Modelo fiscal del evento. Las fechas se eligen por separado; no se calculan plazos aquí. */
var EV_TAX_MODELS={'303':'IVA trimestral · Modelo 303','390':'IVA anual · Modelo 390','100':'Declaración de la renta · Modelo 100'};
function evTaxTitle(code){return {'303':'Domiciliar y presentar IVA','390':'Presentar IVA anual','100':'Presentar Dec. Renta'}[code]||'Presentar Modelo '+(code||'x');}
function renderEvTaxFields(ev){
  var code=ev&&ev.taxModel||'303',known=Object.prototype.hasOwnProperty.call(EV_TAX_MODELS,code);
  return '<div class="ev-field ev-tax-model" id="evFTaxBlock" style="display:'+(ev&&ev.type==='Presentar Modelo'?'block':'none')+'"><label for="evFTaxModel">Modelo que vas a presentar</label><select class="ev-input" id="evFTaxModel">'+['303','390','100'].map(function(k){return '<option value="'+k+'"'+(k===code?' selected':'')+'>'+EV_TAX_MODELS[k]+'</option>';}).join('')+'<option value="other"'+(!known?' selected':'')+'>Otro modelo</option></select><label id="evFTaxOtherLabel" for="evFTaxOther"'+(known?' hidden':'')+'>Número de modelo<input class="ev-input" id="evFTaxOther" inputmode="numeric" maxlength="3" placeholder="Ej.: 130" value="'+(!known?escHtml(code):'')+'"></label></div>';
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
  select.onchange=change;other.oninput=change;
}
