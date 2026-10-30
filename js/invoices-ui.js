/* Home → preparación mensual → PDF de AEAT → correo revisado por el usuario. */
function invoicePanel(title,body){
  var existing=document.getElementById('invoiceOv'),menu=document.getElementById('dataMenu');
  var restore=existing&&existing.classList.contains('open')&&!menu.classList.contains('open')?INVOICE_BACK:settingsPanelBack();
  function close(){INVOICE_OPEN_SEQ++;cerrarPanel('invoiceWrap','invoiceOv');if(NAV_BACK===close)restore();if(typeof syncHomeInvoiceStatus==='function')syncHomeInvoiceStatus(true);}
  INVOICE_BACK=restore;
  var root=abrirPanel('invoiceWrap','<div class="bd-form-overlay" id="invoiceOv"><section class="bd-form-sheet invoice-sheet" role="dialog" aria-modal="true" aria-labelledby="invoiceTitle"><header class="bd-panel-header"><button class="sy-back" id="invoiceBack" aria-label="Volver">←</button><h2 id="invoiceTitle">'+title+'</h2></header><div class="invoice-body">'+body+'</div></section></div>',{contenedor:document.body,overlay:'invoiceOv',alCerrar:close,reutilizar:true});
  root.querySelector('#invoiceBack').onclick=close;NAV_BACK=close;return root;
}
function invoiceField(key,label,value,type){return '<label class="invoice-field"><span>'+label+'</span><input data-invoice-field="'+key+'" type="'+(type||'text')+'" value="'+escHtml(value||'')+'" autocomplete="off"></label>';}
function openInvoiceSettings(options){
  options=options||{};
  INVOICE_OPEN_SEQ++;var c=invoiceData().config,h='<p class="invoice-note">Datos guardados en este dispositivo y en tus copias de seguridad. No se publican con la aplicación.</p>';
  h+='<div class="invoice-actions"><button class="ev-btn" id="invoiceImportConfig" data-settings-edit-only>Importar Datos</button><button class="ev-btn" id="invoiceExportConfig">Exportar Datos</button></div><input type="file" id="invoiceConfigFile" accept=".json,application/json" hidden><p class="invoice-note" id="invoiceImportStatus" role="status"></p>';
  [['Emisor',[['issuer','Nombre o razón social'],['issuerTax','NIF'],['issuerAddress','Domicilio'],['iban','IBAN de ingreso (opcional)']]],['Cliente y servicio',[['client','Nombre o razón social'],['clientTax','NIF'],['clientAddress','Domicilio'],['project','Proyecto'],['concept','Concepto']]],['Cálculo',[['rate','Tarifa (vacía: usar la del año en Económico)'],['vat','IVA (%)'],['withholding','Retención IRPF (%)']]],['Correo Gmail',[['from','Cuenta remitente'],['to','Para (separados por comas)'],['cc','CC (opcional)'],['subject','Asunto']]]].forEach(function(group,i){h+='<details class="invoice-card"'+(i===0?' open':'')+'><summary>'+group[0]+'</summary><div class="invoice-fields">';group[1].forEach(function(f){h+=invoiceField(f[0],f[1],c[f[0]]);});if(i===2)h+='<fieldset class="invoice-unit"><legend>Unidad de la tarifa manual <button type="button" class="settings-copy" id="invoiceUnitCopy" data-copy-label="Copiar Unidad" aria-label="Copiar Unidad"></button></legend><label><input type="radio" name="invoiceUnit" value="day"'+(c.unit==='day'?' checked':'')+'> Por día</label><label><input type="radio" name="invoiceUnit" value="hour"'+(c.unit==='hour'?' checked':'')+'> Por hora</label></fieldset>';if(i===3)h+='<label class="invoice-field"><span>Mensaje</span><textarea data-invoice-field="body" rows="9">'+escHtml(c.body)+'</textarea></label><p class="invoice-note">Puedes usar {mes}, {anio} y {periodo} en el concepto y el correo. Gmail se abre para revisar; adjunta el PDF definitivo y elige allí cuándo enviarlo.</p>';h+='</div></details>';});

  h+='<details class="invoice-card" id="invoiceConnection"><summary>Conexión privada · Kairo</summary>'+invoiceField('kairoUrl','Dirección de Kairo (opcional)',c.kairoUrl)+'<p class="invoice-note">Configura esta dirección solo después de activar el receptor de Gestify en Kairo. Usa su URL HTTPS de Tailscale terminada en /facturas/. Al conectarlo, la revisión y el correo se gestionan allí.</p></details>';
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
  if(options.connection){
    root.querySelectorAll('.invoice-body>details').forEach(function(el){el.open=el.id==='invoiceConnection';});
    root.querySelector('#invoiceSettingsEdit').click();
    requestAnimationFrame(function(){root.querySelector('#invoiceConnection').scrollIntoView({block:'nearest'});root.querySelector('[data-invoice-field="kairoUrl"]').focus({preventScroll:true});});
  }
}
function invoiceSummary(p){
  function money(value){return '<span class="invoice-money"'+(INVOICE_HIDE_AMOUNTS?' aria-label="Importe oculto"':'')+'>'+(INVOICE_HIDE_AMOUNTS?'••••':invoiceMoney(value))+'</span>';}
  function number(value){return value.toLocaleString('es-ES',{maximumFractionDigits:2});}
  var h='<div class="invoice-calculation-lines">';
  p.lines.forEach(function(line){h+='<div class="invoice-calculation-line"><span class="invoice-line-label">'+(line.unit==='day'?'Precio por día':'Precio por hora')+'</span><div class="invoice-line-formula"><span>'+number(line.quantity100/100)+' '+(line.unit==='day'?'días':'horas')+' × '+money(line.rateCents)+'</span><strong><span class="invoice-equals">= </span>'+money(line.baseCents)+'</strong></div></div>';});
  h+='</div><dl class="invoice-totals"><div><dt>Base imponible</dt><dd>'+money(p.baseCents)+'</dd></div>';
  h+='<div class="invoice-vat"><dt>+ IVA · '+number(p.vatBasisPoints/100)+' %</dt><dd>'+money(p.vatCents)+'</dd></div>';
  h+='<div class="invoice-withholding"><dt>− IRPF · '+number(p.withholdingBasisPoints/100)+' %</dt><dd>'+money(p.withholdingCents)+'</dd></div>';
  return h+'<div class="invoice-total"><dt>Total a cobrar<small>Base + IVA − IRPF</small></dt><dd>'+money(p.totalCents)+'</dd></div></dl>';
}
function invoiceDaysSummary(period,p){
  var year=+period.slice(0,4),month=+period.slice(5)-1,included=p?new Set(p.days.map(function(r){return r.date;})):null;
  var total=0,worked=0,groups={festivo:[],vacaciones:[],ausencia:[],other:[]};
  for(var day=1;day<=new Date(year,month+1,0).getDate();day++){
    var date=new Date(year,month,day);if(date.getDay()===0||date.getDay()===6)continue;
    total++;var ds=dk(date),type=dayT(date);
    if(included?included.has(ds):type==='normal'){worked++;continue;}
    // Un PDF conserva sus días originales: no deducir un motivo si el calendario ya cambió.
    var key=included?'other':type;
    (groups[key]||groups.other).push(day);
  }
  var h='<details class="invoice-card invoice-days" id="invoiceDays"><summary><span>Días trabajados</span><strong>'+worked+' de '+total+'</strong></summary><div class="invoice-days-list"><p><span>Días de lunes a viernes</span><strong>'+total+'</strong></p>';
  var names={festivo:'Festivos',vacaciones:'Vacaciones',ausencia:'Ausencias / bajas',other:'Días no incluidos'};
  Object.keys(groups).forEach(function(key){var days=groups[key];if(!days.length)return;h+='<p><span>'+names[key]+'<small>'+days.join(', ')+' de '+MN[month].toLowerCase()+'</small></span><strong>− '+days.length+'</strong></p>';});
  return h+'<p class="invoice-days-result"><span>Días trabajados</span><strong>= '+worked+'</strong></p></div><p class="invoice-note">'+(included?'Días conservados en la factura.':'Según el calendario del mes, incluidos los días planificados.')+'</p></details>';
}
function invoicePrivacyButton(){
  var label=INVOICE_HIDE_AMOUNTS?'Mostrar importes':'Ocultar importes';
  return '<button type="button" class="invoice-eye" id="invoicePrivacy" aria-label="'+label+'" title="'+label+'" aria-pressed="'+INVOICE_HIDE_AMOUNTS+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'+(INVOICE_HIDE_AMOUNTS?'<path d="m3 3 18 18"/>':'')+'</svg></button>';
}
function invoiceManualSection(period,c,record){
  var h='';
  if(record.final){
    h+='<section class="invoice-card invoice-send-card"><h3>Enviar por Gmail</h3><p class="invoice-note">Para: '+escHtml(c.to||'Pendiente de configurar')+'</p><button class="ev-btn ev-btn-primary invoice-primary-action" id="invoiceGmail">Abrir correo en Gmail</button><p class="invoice-note">Adjunta el PDF definitivo y revisa el correo antes de enviarlo.</p><details class="invoice-mail-preview"><summary>Ver mensaje y PDF</summary><p class="invoice-filename"><strong>'+escHtml(invoiceText(c.subject,period))+'</strong></p><pre class="invoice-mail">'+escHtml(invoiceText(c.body,period))+'</pre><p class="invoice-filename">'+escHtml(record.final.number)+' · '+escHtml(record.final.date)+'<br>'+escHtml(record.final.name)+'</p><button class="ev-btn" id="invoiceDownloadFinal">Guardar PDF definitivo</button></details></section>';
  }
  h+='<details class="invoice-card invoice-document" id="invoiceDocument"><summary>'+(record.final?'Cambiar PDF asociado':'Preparar correo · añadir PDF de AEAT')+'</summary><p class="invoice-note">'+(record.final?'Selecciona el PDF definitivo corregido.':'Emite la factura en AEAT y añade aquí el PDF definitivo. Después podrás abrir el correo preparado en Gmail.')+'</p>';
  h+='<label class="invoice-field"><span>PDF definitivo (máximo 2 MB)</span><input type="file" accept="application/pdf,.pdf" id="invoiceFinalFile"></label>'+invoiceField('number','Serie y número de factura',record.final&&record.final.number||'')+invoiceField('date','Fecha de expedición',record.final&&record.final.date||'','date');
  return h+'<label class="invoice-confirm"><input type="checkbox" id="invoiceFinalConfirm">Es el PDF definitivo de AEAT de '+escHtml(invoiceLabel(period))+' y he comprobado sus datos e importes.</label><button class="ev-btn ev-btn-primary" id="invoiceAttach">Guardar PDF y preparar correo</button></details>';
}
function invoiceTools(){
  return '<button class="invoice-config-link" id="invoiceJson">Descargar datos para AEAT · JSON</button>';
}
async function openInvoiceMonth(period){
  INVOICE_HIDE_AMOUNTS=true;
  INVOICE_MONTH=period||mkey(CY,CM);period=INVOICE_MONTH;
  var seq=++INVOICE_OPEN_SEQ,data=invoiceData(),c=data.config,record=data.months[period]||{},historical=period<INVOICE_FIRST_PERIOD,p=record.preparation,problem='';
  if(!record.final){
    try{var rows=invoiceDayRows(period,c);p=invoiceCalculate(period,c,rows);if(!historical)p=await invoicePrepare(period,c,rows);}
    catch(e){problem=e.message;}
  }
  if(seq!==INVOICE_OPEN_SEQ)return;
  var h='<label class="invoice-month invoice-month-picker"><span>Mes de la factura</span><input type="month" id="invoicePeriod" value="'+escHtml(period)+'" aria-label="Mes de la factura"></label>';
  if(historical||record.final)h+='<p class="invoice-status">'+(historical?'Referencia histórica':'PDF definitivo de AEAT incorporado')+'</p>';
  h+=invoiceDaysSummary(period,record.final?p:null);
  if(problem)h+='<p class="invoice-note">'+escHtml(problem)+'</p>';
  h+='<section class="invoice-card invoice-month-summary"><header class="invoice-summary-header"><h3>Cálculo de la factura</h3>'+(p?'<span id="invoicePrivacyControl">'+invoicePrivacyButton()+'</span>':'')+'</header><p class="invoice-filename">'+escHtml(p&&p.client?p.client.name:c.client||'Cliente pendiente de configurar')+'</p>';
  if(p)h+='<div id="invoiceAmounts">'+invoiceSummary(p)+'</div>';
  else h+='<p class="invoice-note">Completa los datos de facturación para ver las jornadas, tarifas y el desglose del mes.</p>';
  h+='</section>';
  if(!historical)h+=invoiceKairoSection(p,record,c.kairoUrl,problem);
  if(!historical&&!problem&&p&&!record.kairo&&!c.kairoUrl)h+=invoiceManualSection(period,c,record);
  h+='<button class="invoice-config-link" id="invoiceConfig">'+(problem?'Completar datos de facturación':'Datos de factura y correo')+'</button>';
  if(p&&!problem&&!historical)h+=invoiceTools();
  h+='<p id="invoiceError" class="invoice-error" role="alert"></p>';var root=invoicePanel('Enviar factura',h);
  root.querySelector('.invoice-sheet').classList.add('invoice-month-sheet');
  root.querySelector('#invoicePeriod').onchange=function(){if(/^20\d\d-(0[1-9]|1[0-2])$/.test(this.value))openInvoiceMonth(this.value);};
  function error(e){root.querySelector('#invoiceError').textContent=e.message;root.querySelector('#invoiceError').scrollIntoView({block:'nearest'});}
  root.querySelector('#invoiceConfig').onclick=openInvoiceSettings;
  var kairoConfig=root.querySelector('#invoiceKairoConfig');if(kairoConfig)kairoConfig.onclick=function(){openInvoiceSettings({connection:true});};
  function bindPrivacy(){root.querySelector('#invoicePrivacy').onclick=function(){INVOICE_HIDE_AMOUNTS=!INVOICE_HIDE_AMOUNTS;root.querySelector('#invoicePrivacyControl').innerHTML=invoicePrivacyButton();root.querySelector('#invoiceAmounts').innerHTML=invoiceSummary(p);bindPrivacy();root.querySelector('#invoicePrivacy').focus();};}if(p)bindPrivacy();
  if(root.querySelector('#invoiceJson')){
    root.querySelector('#invoiceJson').onclick=function(){shareOrDownload(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),'datos-auxiliares-'+period+'.json');};
  }
  if(p&&!historical&&!problem)bindInvoiceKairo(root,p,c.kairoUrl);
  var attach=root.querySelector('#invoiceAttach');if(attach)attach.onclick=async function(){attach.disabled=true;try{await invoiceAttach(period,root.querySelector('#invoiceFinalFile').files[0],root.querySelector('[data-invoice-field="number"]').value,root.querySelector('[data-invoice-field="date"]').value,root.querySelector('#invoiceFinalConfirm').checked);openInvoiceMonth(period);}catch(e){error(e);attach.disabled=false;}};
  if(record.final&&root.querySelector('#invoiceDownloadFinal')){root.querySelector('#invoiceDownloadFinal').onclick=function(){shareOrDownload(invoiceFinalBlob(record),record.final.name);};root.querySelector('#invoiceGmail').onclick=function(){try{window.open(invoiceGmailUrl(invoiceData().config,period),'_blank','noopener,noreferrer');}catch(e){error(e);}};}
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
