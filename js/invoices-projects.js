/* Vigencias del proyecto: configuración explícita, sin reescribir facturas. */
function invoiceProjectPeriods(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>100)throw new Error('Vigencias de proyecto no válidas');
  var rules={};Object.keys(value).sort().forEach(function(month){
    var code=value[month];
    if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)||typeof code!=='string'||!code.trim()||code!==code.trim()||code.length>200||/[\x00-\x1f]/.test(code))throw new Error('Vigencias de proyecto no válidas');
    rules[month]=code;
  });return rules;
}
function invoiceProjectFor(config,period){
  var project=Object.keys(config.projectPeriods||{}).length?config.projectBase:config.project;
  Object.keys(config.projectPeriods||{}).sort().forEach(function(start){if(start<=period)project=config.projectPeriods[start];});
  return project;
}
function invoiceProjectChange(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='from,previous,project')throw new Error('Cambio de proyecto no válido');
  if(!value.from)throw new Error('Selecciona desde qué mes se aplica el proyecto');
  invoiceProjectPeriods({[value.from]:value.project});
  if(typeof value.previous!=='string'||value.previous.length>200||/[\x00-\x1f]/.test(value.previous))throw new Error('Proyecto anterior no válido');
  return {project:value.project,from:value.from,previous:value.previous};
}
function invoiceProjectApply(config,change,months){
  change=invoiceProjectChange(change);
  var next=Object.assign({},config,{project:change.project,projectFrom:change.from,projectBase:config.projectBase||config.project,projectPeriods:invoiceProjectPeriods(config.projectPeriods||{})});
  next.projectPeriods[change.from]=change.project;
  Object.keys(months).forEach(function(period){
    if(months[period].preparation&&invoiceProjectFor(next,period)!==invoiceProjectFor(config,period))throw new Error('Ya hay una factura preparada para '+invoiceLabel(period)+'. Elige un mes posterior; se conserva la factura existente.');
  });return next;
}
function invoiceProjectReply(result,change){
  if(!result||result.state!=='project_saved'||result.project!==change.project||result.from!==change.from||typeof result.base!=='string'||!result.base.trim())throw new Error('Kairo no confirmó el proyecto solicitado');
  var rules=invoiceProjectPeriods(result.periods);
  if(rules[change.from]!==change.project)throw new Error('Kairo no confirmó la vigencia solicitada');
  return {project:change.project,projectFrom:change.from,projectBase:result.base,projectPeriods:rules};
}
async function invoiceSaveSettings(config,root){
  var data=invoiceData(),old=data.config,change=data.projectPending;
  if(change&&(config.project!==change.project||config.projectFrom!==change.from))throw new Error('Confirma primero el cambio pendiente antes de preparar otro');
  var changing=!!change||config.project!==old.project||config.projectFrom!==old.projectFrom;
  if(!changing){data.config=config;invoiceSave(data);return;}
  change=change||invoiceProjectChange({project:config.project,from:config.projectFrom,previous:invoiceProjectFor(old,config.projectFrom)});
  var next=invoiceProjectApply(old,change,data.months),url=config.kairoUrl;
  if(data.projectPending&&!url)throw new Error('Conserva la conexión con Kairo para confirmar el cambio pendiente');
  if(data.projectPendingUrl&&url!==data.projectPendingUrl)throw new Error('Confirma el cambio pendiente en la misma conexión de Kairo');
  if(url){
    if(INVOICE_KAIRO_BUSY)throw new Error('Espera a que termine la conexión con Kairo');
    if(navigator.onLine===false)throw new Error('Sin conexión. El proyecto no se ha cambiado; vuelve a Guardar cuando tengas conexión');
    url=invoiceKairoUrl(url);
    var popup=window.open(url+'gestify','_blank');
    if(!popup)throw new Error('Permite abrir Kairo para guardar el proyecto en ambos sitios');
    data.projectPending=change;data.projectPendingUrl=url;invoiceSave(data);
    INVOICE_KAIRO_BUSY=true;
    root.querySelector('#invoiceProjectStatus').textContent='Guardando proyecto en Kairo…';
    try{
      var result=await invoiceKairoExchange(url,change,'project',popup);
      Object.assign(next,invoiceProjectReply(result,change));
    }catch(e){
      if(e.projectRejected){
        var retained=invoiceData();delete retained.projectPending;delete retained.projectPendingUrl;
        if(e.projectCurrent){
          var current=e.projectCurrent,periods=invoiceProjectPeriods(current.periods);
          if(typeof current.base==='string'&&current.base.trim()&&typeof current.project==='string'&&current.project.trim()&&current.from===(Object.keys(periods).sort().pop()||'')&&current.project===(periods[current.from]||current.base))Object.assign(retained.config,{project:current.project,projectFrom:current.from,projectBase:current.base,projectPeriods:periods});
        }
        invoiceSave(retained);throw e;
      }
      throw new Error(e.message+' El cambio queda sin confirmar. Pulsa Guardar para reintentarlo.');
    }
    finally{INVOICE_KAIRO_BUSY=false;}
  }
  data=invoiceData();
  if(data.projectPending&&JSON.stringify(data.projectPending)!==JSON.stringify(change))throw new Error('La configuración ha cambiado durante la conexión');
  data.config=Object.assign({},config,{project:next.project,projectFrom:next.projectFrom,projectBase:next.projectBase,projectPeriods:next.projectPeriods});
  delete data.projectPending;delete data.projectPendingUrl;invoiceSave(data);
  root.querySelector('#invoiceProjectStatus').textContent=url?'Proyecto sincronizado con Kairo desde '+invoiceLabel(change.from)+'.':'Proyecto guardado desde '+invoiceLabel(change.from)+'.';
}
