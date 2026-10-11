/* Home → preparación mensual → PDF de AEAT → correo revisado por el usuario. */
function invoicePanel(title,body){
  var previous=NAV_BACK;function close(){INVOICE_OPEN_SEQ++;cerrarPanel('invoiceWrap','invoiceOv');if(NAV_BACK===close)NAV_BACK=previous;}
  if(document.getElementById('invoiceWrap'))previous=INVOICE_BACK||null;INVOICE_BACK=previous;
  var root=abrirPanel('invoiceWrap','<div class="bd-form-overlay" id="invoiceOv"><section class="bd-form-sheet invoice-sheet" role="dialog" aria-modal="true" aria-labelledby="invoiceTitle"><header class="bd-panel-header"><button class="sy-back" id="invoiceBack" aria-label="Volver">←</button><h2 id="invoiceTitle">'+title+'</h2></header><div class="invoice-body">'+body+'</div></section></div>',{contenedor:document.body,overlay:'invoiceOv',alCerrar:close,reutilizar:true});
  root.querySelector('#invoiceBack').onclick=close;NAV_BACK=close;return root;
}
function invoiceField(key,label,value,type){return '<label class="invoice-field"><span>'+label+'</span><input data-invoice-field="'+key+'" type="'+(type||'text')+'" value="'+escHtml(value||'')+'" autocomplete="off"></label>';}
function openInvoiceSettings(){
  INVOICE_OPEN_SEQ++;closeSettingsMenu();var c=invoiceData().config,h='<p class="invoice-note">Datos guardados en este dispositivo y en tus copias de seguridad. No se publican con la aplicación.</p>';
  h+='<div class="invoice-actions"><button class="ev-btn" id="invoiceImportConfig" data-settings-edit-only>Importar Datos</button><button class="ev-btn" id="invoiceExportConfig">Exportar Datos</button></div><input type="file" id="invoiceConfigFile" accept=".json,application/json" hidden><p class="invoice-note" id="invoiceImportStatus" role="status"></p>';
  [['Emisor',[['issuer','Nombre o razón social'],['issuerTax','NIF'],['issuerAddress','Domicilio'],['iban','IBAN de ingreso (opcional)']]],['Cliente y servicio',[['client','Nombre o razón social'],['clientTax','NIF'],['clientAddress','Domicilio'],['project','Proyecto'],['concept','Concepto']]],['Cálculo',[['rate','Tarifa (vacía: usar la del año en Económico)'],['vat','IVA (%)'],['withholding','Retención IRPF (%)']]],['Correo Gmail',[['from','Cuenta remitente'],['to','Para (separados por comas)'],['cc','CC (opcional)'],['subject','Asunto']]]].forEach(function(group,i){h+='<details class="invoice-card"'+(i===0?' open':'')+'><summary>'+group[0]+'</summary><div class="invoice-fields">';group[1].forEach(function(f){h+=invoiceField(f[0],f[1],c[f[0]]);});if(i===2)h+='<fieldset class="invoice-unit"><legend>Unidad de la tarifa manual <button type="button" class="settings-copy" id="invoiceUnitCopy" data-copy-label="Copiar Unidad" aria-label="Copiar Unidad"></button></legend><label><input type="radio" name="invoiceUnit" value="day"'+(c.unit==='day'?' checked':'')+'> Por día</label><label><input type="radio" name="invoiceUnit" value="hour"'+(c.unit==='hour'?' checked':'')+'> Por hora</label></fieldset>';if(i===3)h+='<label class="invoice-field"><span>Mensaje</span><textarea data-invoice-field="body" rows="9">'+escHtml(c.body)+'</textarea></label><p class="invoice-note">Puedes usar {mes}, {anio} y {periodo} en el concepto y el correo. Gmail se abre para revisar; adjunta el PDF definitivo y elige allí cuándo enviarlo.</p>';h+='</div></details>';});

  h+='<p class="invoice-error" id="invoiceError" role="alert"></p>';
  var root=invoicePanel('Facturas y Correo',h),sheet=root.querySelector('.invoice-sheet');
  root.querySelector('.bd-panel-header').classList.add('panel-header-centered');sheet.classList.add('settings-editor-sheet');sheet.style.setProperty('--settings-tone','var(--c-green)');sheet.insertAdjacentHTML('beforeend',settingsEditorActions('invoiceSettings'));
  root.querySelector('#invoiceUnitCopy').onclick=function(){settingsCopyText(root.querySelector('[name=invoiceUnit]:checked').value==='day'?'Por día':'Por hora',this);};
  bindInvoiceConfigImport(root,c);
  bindSettingsEditor(root,'invoiceSettings',{onCancel:function(){root.querySelector('#invoiceError').textContent='';root.querySelector('#invoiceImportStatus').textContent='';},onError:function(e){root.querySelector('#invoiceError').textContent=e.message;},onSave:function(){
    var data=invoiceData();root.querySelectorAll('[data-invoice-field]').forEach(function(el){data.config[el.dataset.invoiceField]=el.value.trim();});data.config.unit=root.querySelector('[name="invoiceUnit"]:checked').value;
    if(data.config.rate!=='')invoiceDecimal(data.config.rate,2);['vat','withholding'].forEach(function(k){if(invoiceDecimal(data.config[k],2)>10000)throw new Error('Porcentaje superior al 100 %');});['from','to','cc'].forEach(function(k){if(data.config[k])invoiceEmails(data.config[k]);});
    invoiceSave(data);root.querySelector('#invoiceError').textContent='';root.querySelector('#invoiceImportStatus').textContent='';showToast('Configuración de facturación guardada','success');
  }});

}
function invoiceSummary(p){
  function money(value){return INVOICE_HIDE_AMOUNTS?'<span aria-label="Importe oculto">••••</span>':invoiceMoney(value);}
  var h='<dl class="invoice-totals"><div><dt>Días incluidos</dt><dd>'+p.days.length+'</dd></div>';
  p.lines.forEach(function(line){h+='<div><dt>'+(line.unit==='day'?'Precio por día':'Precio por hora')+(p.lines.length>1?' ('+(line.quantity100/100)+' '+(line.unit==='day'?'días':'h')+')':'')+'</dt><dd>'+money(line.rateCents)+'</dd></div>';});
  [['Base',p.baseCents],['IVA',p.vatCents],['Retención IRPF',-p.withholdingCents],['Total a cobrar',p.totalCents]].forEach(function(row,i){h+='<div'+(i===3?' class="invoice-total"':'')+'><dt>'+row[0]+'</dt><dd>'+money(row[1])+'</dd></div>';});return h+'</dl>';
}
function invoicePrivacyButton(){
  var label=INVOICE_HIDE_AMOUNTS?'Mostrar importes':'Ocultar importes';
  return '<button type="button" class="invoice-eye" id="invoicePrivacy" aria-label="'+label+'" title="'+label+'" aria-pressed="'+INVOICE_HIDE_AMOUNTS+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'+(INVOICE_HIDE_AMOUNTS?'<path d="m3 3 18 18"/>':'')+'</svg></button>';
}
async function openInvoiceMonth(period){
  INVOICE_MONTH=period||mkey(CY,CM);period=INVOICE_MONTH;
  var seq=++INVOICE_OPEN_SEQ,data=invoiceData(),c=data.config,record=data.months[period]||{},historical=period<'2026-10',p=record.preparation,problem='';
  if(!record.final){
    try{var rows=invoiceDayRows(period,c);p=invoiceCalculate(period,c,rows);if(!historical)p=await invoicePrepare(period,c,rows);}
    catch(e){problem=e.message;}
  }
  if(seq!==INVOICE_OPEN_SEQ)return;
  var h='<p class="invoice-month"><strong>'+escHtml(invoiceLabel(period))+'</strong></p>';
  h+='<p class="invoice-status">'+(historical?'Referencia histórica · no preparar un nuevo envío':record.final?'PDF definitivo de AEAT incorporado':'Pendiente de emitir en AEAT')+'</p>';
  h+='<section class="invoice-card invoice-month-summary"><header class="invoice-summary-header"><h3>Resumen mensual</h3><span id="invoicePrivacyControl">'+invoicePrivacyButton()+'</span></header><p class="invoice-filename"><strong>'+escHtml(p&&p.client?p.client.name:c.client||'Cliente pendiente de configurar')+'</strong><br>'+escHtml(p?p.concept:invoiceText(c.concept,period))+'</p>';
  if(p)h+='<div id="invoiceAmounts">'+invoiceSummary(p)+'</div>';
  if(problem)h+='<p class="invoice-note">'+escHtml(problem)+'</p>';
  if(p&&!problem&&!historical)h+='<div class="invoice-actions"><button class="ev-btn" id="invoiceExcel">Excel auxiliar</button><button class="ev-btn" id="invoiceJson">Datos para AEAT</button></div>';
  h+='</section><button class="invoice-config-link" id="invoiceConfig">'+(problem?'Completar datos de facturación':'Edición facturas y correo')+'</button>';
  if(!historical&&!problem&&p){
    if(record.final){
      h+='<section class="invoice-card"><h3>Factura definitiva</h3><p class="invoice-filename">'+escHtml(record.final.number)+' · '+escHtml(record.final.date)+'<br>'+escHtml(record.final.name)+'</p><button class="ev-btn" id="invoiceDownloadFinal">Guardar PDF definitivo</button></section>';
      h+='<section class="invoice-card"><h3>Correo</h3><p class="invoice-filename">Para: '+escHtml(c.to||'Pendiente de configurar')+'</p><p><strong>'+escHtml(invoiceText(c.subject,period))+'</strong></p><pre class="invoice-mail">'+escHtml(invoiceText(c.body,period))+'</pre><p class="invoice-note">Adjunta el PDF definitivo en Gmail y revisa el correo antes de enviarlo o programarlo.</p><button class="ev-btn ev-btn-primary" id="invoiceGmail">Abrir correo en Gmail</button></section>';
    }
    h+='<details class="invoice-card invoice-document" id="invoiceDocument"><summary>'+(record.final?'Cambiar PDF asociado':'Continuar · incorporar PDF de AEAT')+'</summary><p class="invoice-note">'+(record.final?'Selecciona el PDF definitivo corregido.':'Emite la factura en AEAT con los datos del mes y añade aquí el PDF definitivo.')+'</p>';
    h+='<label class="invoice-field"><span>PDF definitivo (máximo 2 MB)</span><input type="file" accept="application/pdf,.pdf" id="invoiceFinalFile"></label>'+invoiceField('number','Serie y número de factura',record.final&&record.final.number||'')+invoiceField('date','Fecha de expedición',record.final&&record.final.date||'','date');
    h+='<label class="invoice-confirm"><input type="checkbox" id="invoiceFinalConfirm">Es el PDF definitivo de AEAT de '+escHtml(invoiceLabel(period))+' y he comprobado sus datos e importes.</label><button class="ev-btn ev-btn-primary" id="invoiceAttach">Guardar PDF y preparar correo</button></details>';
  }
  h+='<p id="invoiceError" class="invoice-error" role="alert"></p>';var root=invoicePanel('Enviar factura',h);
  function error(e){root.querySelector('#invoiceError').textContent=e.message;root.querySelector('#invoiceError').scrollIntoView({block:'nearest'});}
  root.querySelector('#invoiceConfig').onclick=openInvoiceSettings;
  function bindPrivacy(){root.querySelector('#invoicePrivacy').onclick=function(){INVOICE_HIDE_AMOUNTS=!INVOICE_HIDE_AMOUNTS;root.querySelector('#invoicePrivacyControl').innerHTML=invoicePrivacyButton();if(p)root.querySelector('#invoiceAmounts').innerHTML=invoiceSummary(p);bindPrivacy();root.querySelector('#invoicePrivacy').focus();};}bindPrivacy();
  if(root.querySelector('#invoiceExcel')){
    root.querySelector('#invoiceExcel').onclick=function(){shareOrDownload(invoiceWorkbook(p),'calculo-auxiliar-'+period+'.xlsx');};
    root.querySelector('#invoiceJson').onclick=function(){shareOrDownload(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),'datos-auxiliares-'+period+'.json');};
  }
  var attach=root.querySelector('#invoiceAttach');if(attach)attach.onclick=async function(){attach.disabled=true;try{await invoiceAttach(period,root.querySelector('#invoiceFinalFile').files[0],root.querySelector('[data-invoice-field="number"]').value,root.querySelector('[data-invoice-field="date"]').value,root.querySelector('#invoiceFinalConfirm').checked);openInvoiceMonth(period);}catch(e){error(e);attach.disabled=false;}};
  if(record.final){root.querySelector('#invoiceDownloadFinal').onclick=function(){shareOrDownload(invoiceFinalBlob(record),record.final.name);};root.querySelector('#invoiceGmail').onclick=function(){try{window.open(invoiceGmailUrl(invoiceData().config,period),'_blank','noopener,noreferrer');}catch(e){error(e);}};}
}
function openHoursExport(){
  var root=invoicePanel('Exportar Horas','<p class="invoice-note">Registro de horas de todo el año '+CY+'.</p><div class="invoice-actions"><button class="ev-btn" id="hoursCsv">'+renderDocumentIcon()+'<span>CSV<sup>*</sup></span></button><button class="ev-btn" id="hoursPdf">'+renderDocumentIcon()+'PDF</button></div><p class="invoice-note hours-export-footnote"><em>* El archivo CSV se utiliza en el programa de computación de horas de Excelia.</em></p>');
  root.querySelector('.invoice-sheet').classList.add('hours-export-sheet');
  root.querySelector('#hoursCsv').onclick=function(){document.getElementById('csvExportBtn').click();};root.querySelector('#hoursPdf').onclick=function(){document.getElementById('pdfExportBtn').click();};
}
function initInvoices(){
  var btn=document.getElementById('invoiceHomeBtn');if(!btn)return;btn.innerHTML='<svg viewBox="-12 -12 24 24" aria-hidden="true">'+evManagementShapeInner('invoice')+'</svg><span>Enviar Factura</span>';btn.onclick=function(){openInvoiceMonth(mkey(CY,CM));};var hoursBtn=document.getElementById('hoursExportBtn');hoursBtn.innerHTML=renderDocumentIcon()+'<span>Exportar Horas</span>';hoursBtn.onclick=openHoursExport;document.getElementById('invoiceSettingsBtn').onclick=openInvoiceSettings;
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initInvoices);

function bindInvoiceConfigImport(root,config){
  function readFields(){var c=Object.assign({},config);root.querySelectorAll('[data-invoice-field]').forEach(function(el){c[el.dataset.invoiceField]=el.value.trim();});c.unit=root.querySelector('[name="invoiceUnit"]:checked').value;return c;}
  root.querySelector('#invoiceImportConfig').onclick=function(){root.querySelector('#invoiceConfigFile').click();};
  root.querySelector('#invoiceConfigFile').onchange=async function(){
    try{if(!SETTINGS_EDITOR_MODES.invoiceSettings)return;var file=this.files[0];if(!file)return;if(file.size>100000)throw new Error('El archivo de configuración es demasiado grande');var c=invoiceConfigImport(JSON.parse(await file.text()),readFields());
      root.querySelectorAll('[data-invoice-field]').forEach(function(el){el.value=c[el.dataset.invoiceField];});root.querySelector('[name="invoiceUnit"][value="'+c.unit+'"]').checked=true;
      root.querySelector('#invoiceError').textContent='';root.querySelector('#invoiceImportStatus').textContent='Datos cargados. Revisa los campos y pulsa Guardar.';
    }catch(e){root.querySelector('#invoiceError').textContent=e.message;}finally{this.value='';}
  };
  root.querySelector('#invoiceExportConfig').onclick=function(){try{var c=invoiceConfigImport({format:'gestify-invoice-settings',version:1,config:readFields()},config);shareOrDownload(new Blob([JSON.stringify({format:'gestify-invoice-settings',version:1,config:c},null,2)],{type:'application/json'}),'configuracion-facturas.json');}catch(e){root.querySelector('#invoiceError').textContent=e.message;}};
}
