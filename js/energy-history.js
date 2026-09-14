/* Contratos históricos: independientes de las tarifas de simulación. */
var ENERGY_HISTORY_KEY='excelia-energy-history-v1';
function energyContracts(){
  var raw=appStorage.getItem(ENERGY_HISTORY_KEY);
  if(!raw)return [];
  var list=JSON.parse(raw);validateEnergyContracts(list);return list;
}
function validateEnergyContracts(list){
  if(!Array.isArray(list)||list.length>5000)throw new Error('Histórico de contratos no válido');
  var ids={};
  list.forEach(function(c){
    if(!c||typeof c!=='object'||!c.id||typeof c.id!=='string'||!/^[\w-]+$/.test(c.id)||ids[c.id])throw new Error('Identificador de contrato no válido o repetido');
    ids[c.id]=true;
    if(['luz','gas'].indexOf(c.kind)<0)throw new Error('Suministro no válido');
    ['supplier','tariff','supply','start','end','commitment','notes','source'].forEach(function(k){if(typeof c[k]!=='string'||c[k].length>10000)throw new Error('Campo de contrato no válido: '+k);});
    if(!c.supplier.trim())throw new Error('Indica la comercializadora');
    ['start','end','commitment'].forEach(function(k){if(c[k]&&!validIsoDate(c[k]))throw new Error('Fecha de contrato no válida');});
    if(c.start&&c.end&&c.end<c.start)throw new Error('El fin no puede ser anterior al inicio');
    if(['incluidos','excluidos','desconocido'].indexOf(c.taxes)<0)throw new Error('Indica cómo están expresados los impuestos');
    if(!Array.isArray(c.prices)||c.prices.length>50)throw new Error('Precios no válidos');
    c.prices.forEach(function(p){if(!p||typeof p.label!=='string'||!p.label.trim()||p.label.length>100||typeof p.unit!=='string'||!p.unit.trim()||p.unit.length>60||typeof p.value!=='number'||!Number.isFinite(p.value)||p.value<0)throw new Error('Revisa los conceptos y precios');});
  });
  return list;
}
function energyContractSignature(c){return JSON.stringify([c.kind,c.supply.trim().toLowerCase(),c.supplier.trim().toLowerCase(),c.tariff.trim().toLowerCase(),c.start,c.end]);}
function energyMergeContracts(current,incoming){
  validateEnergyContracts(incoming);
  var result=JSON.parse(JSON.stringify(current));
  incoming.forEach(function(c){
    var i=result.findIndex(function(x){return x.id===c.id||energyContractSignature(x)===energyContractSignature(c);});
    if(i<0)result.push(c);else result[i]=Object.assign({},c,{id:result[i].id});
  });
  validateEnergyContracts(result);return result;
}
function energySaveContracts(list){validateEnergyContracts(list);appStorage.setItem(ENERGY_HISTORY_KEY,JSON.stringify(list));}
function energyHistoryButton(kind){return '<button class="ev-io-btn energy-history-open" data-energy-kind="'+kind+'">Histórico de contratos</button>';}
function energyContractStatus(c){
  var today=dk(new Date());
  return c.end&&c.end<today?'Finalizado':c.start&&c.start>today?'Próximo':c.start?'En vigencia':'Fechas pendientes';
}
function energyHistoryHtml(kind){
  var list=energyContracts().filter(function(c){return c.kind===kind;}).sort(function(a,b){return (b.start||'').localeCompare(a.start||'');});
  var h='<div class="sheet-handle"></div><div class="energy-history-heading"><button class="sy-back" id="energyBack" aria-label="Volver">←</button><h2>Contratos de '+(kind==='luz'?'luz':'gas')+'</h2></div>';
  h+='<p class="sy-note">Histórico independiente de los cálculos y simulaciones. Los importes conservan sus unidades originales.</p>';
  h+='<div class="ev-io-row"><button class="ev-io-btn io-primaria" id="energyAdd">+ Añadir</button><button class="ev-io-btn" id="energyExport">Exportar</button><button class="ev-io-btn" id="energyImport">Importar</button><input type="file" id="energyFile" accept=".json,application/json" hidden></div>';
  if(!list.length)h+='<p class="sy-note">Aún no hay contratos. Puedes añadirlos o importar el archivo que preparemos con tus facturas.</p>';
  list.forEach(function(c){
    h+='<article class="energy-contract"><div class="hip-section-hdr"><strong>'+escHtml(c.supplier)+'</strong><button class="hip-edit-btn" data-energy-edit="'+escHtml(c.id)+'">Editar</button></div>';
    h+='<div>'+escHtml(c.tariff||'Tarifa sin especificar')+'</div><p class="sy-note">'+escHtml(c.start||'Inicio pendiente')+' → '+escHtml(c.end||'Sin fecha de fin')+' · '+energyContractStatus(c)+'</p>';
    if(c.supply)h+='<p class="sy-note">Suministro: '+escHtml(c.supply)+'</p>';
    c.prices.forEach(function(p){h+='<div class="energy-price-view"><span>'+escHtml(p.label)+'</span><b>'+escHtml(String(p.value).replace('.',','))+' '+escHtml(p.unit)+'</b></div>';});
    h+='<p class="sy-note">Impuestos '+escHtml(c.taxes==='desconocido'?'sin especificar':c.taxes)+'</p>';
    if(c.commitment)h+='<p class="sy-note">Permanencia hasta '+escHtml(c.commitment)+'</p>';
    if(c.notes)h+='<p class="energy-notes">'+escHtml(c.notes)+'</p>';
    if(c.source)h+='<p class="sy-note">Fuente: '+escHtml(c.source)+'</p>';
    h+='</article>';
  });
  return h;
}
function openEnergyHistory(kind){
  var wrap=abrirPanel('energyHistoryWrap','<div class="ev-detail-overlay open" id="energyHistoryOverlay"><div class="ev-detail-sheet energy-sheet">'+energyHistoryHtml(kind)+'</div></div>',{overlay:'energyHistoryOverlay',contenedor:document.getElementById('fiscalOverlay')});
  wrap.querySelector('#energyBack').onclick=function(){cerrarPanel('energyHistoryWrap','energyHistoryOverlay');};
  wrap.querySelector('#energyAdd').onclick=function(){openEnergyContract(kind);};
  wrap.querySelectorAll('[data-energy-edit]').forEach(function(b){b.onclick=function(){openEnergyContract(kind,b.dataset.energyEdit);};});
  wrap.querySelector('#energyExport').onclick=function(){
    var data={version:7,energyContracts:energyContracts().filter(function(c){return c.kind===kind;})};
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gestify-contratos-'+kind+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(url);},60000);
  };
  var input=wrap.querySelector('#energyFile');
  wrap.querySelector('#energyImport').onclick=function(){input.click();};
  input.onchange=function(){
    var file=input.files[0];if(!file)return;
    var reader=new FileReader();reader.onload=function(){
      try{var d=validateImport(JSON.parse(reader.result));validateEnergyContracts(d.energyContracts);
        var incoming=d.energyContracts,prev=energyContracts();energySaveContracts(energyMergeContracts(prev,incoming));openEnergyHistory(kind);
        showToast('Contratos incorporados sin duplicados','success',function(){energySaveContracts(prev);openEnergyHistory(kind);});
      }catch(e){showToast(e.message,'error');}
    };reader.onerror=function(){showToast('No se pudo leer el archivo','error');};reader.readAsText(file);input.value='';
  };
}
function energyPriceRow(p){
  return '<div class="energy-price-edit"><input data-price-label aria-label="Concepto" placeholder="Energía P1, término fijo…" value="'+escHtml(p.label)+'"><input data-price-value aria-label="Precio" type="number" min="0" step="any" value="'+escHtml(String(p.value))+'"><input data-price-unit aria-label="Unidad" placeholder="€/kWh, €/día…" value="'+escHtml(p.unit)+'"><button type="button" data-price-remove aria-label="Quitar concepto">×</button></div>';
}
function openEnergyContract(kind,id){
  var old=energyContracts().find(function(c){return c.id===id;});
  var c=old||{id:'energy-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),kind:kind,supplier:'',tariff:'',supply:'',start:'',end:'',commitment:'',taxes:'desconocido',notes:'',source:'',prices:[]};
  var h='<div class="sheet-handle"></div><div class="energy-history-heading"><button class="sy-back" id="energyEditBack" aria-label="Volver">←</button><h2>'+(old?'Editar':'Añadir')+' contrato</h2></div><form id="energyForm">';
  [['supplier','Comercializadora'],['tariff','Tarifa'],['supply','Suministro / vivienda'],['start','Inicio'],['end','Fin (opcional)'],['commitment','Permanencia hasta (opcional)']].forEach(function(f){
    var date=['start','end','commitment'].indexOf(f[0])>=0;
    h+='<label class="energy-field">'+f[1]+'<input name="'+f[0]+'" type="'+(date?'date':'text')+'" value="'+escHtml(c[f[0]])+'"'+(f[0]==='supplier'?' required':'')+'></label>';
  });
  h+='<fieldset class="energy-tax"><legend>Impuestos de los precios</legend>';
  [['desconocido','Sin especificar'],['incluidos','Incluidos'],['excluidos','Excluidos']].forEach(function(t){h+='<label><input type="radio" name="taxes" value="'+t[0]+'"'+(c.taxes===t[0]?' checked':'')+'> '+t[1]+'</label>';});
  h+='</fieldset><h3>Precios y condiciones</h3><p class="sy-note">Deja sin añadir los precios que no conozcas. Indica la unidad de cada concepto.</p><div id="energyPrices">'+c.prices.map(energyPriceRow).join('')+'</div><button type="button" class="ev-io-btn" id="energyPriceAdd">+ Concepto</button>';
  [['notes','Condiciones, descuentos y observaciones'],['source','Factura o documento de referencia']].forEach(function(f){h+='<label class="energy-field">'+f[1]+'<textarea name="'+f[0]+'">'+escHtml(c[f[0]])+'</textarea></label>';});
  h+='<div class="ev-io-row"><button type="submit" class="ev-io-btn io-primaria">Guardar</button>'+(old?'<button type="button" id="energyDelete" class="ev-io-btn io-peligro">Eliminar</button>':'')+'</div></form>';
  var wrap=abrirPanel('energyEditWrap','<div class="ev-detail-overlay open" id="energyEditOverlay"><div class="ev-detail-sheet energy-sheet">'+h+'</div></div>',{overlay:'energyEditOverlay',contenedor:document.getElementById('fiscalOverlay')});
  var form=wrap.querySelector('#energyForm');
  function close(){cerrarPanel('energyEditWrap','energyEditOverlay');}
  wrap.querySelector('#energyEditBack').onclick=close;
  wrap.querySelector('#energyPriceAdd').onclick=function(){wrap.querySelector('#energyPrices').insertAdjacentHTML('beforeend',energyPriceRow({label:'',value:'',unit:''}));};
  form.onclick=function(e){if(e.target.closest('[data-price-remove]'))e.target.closest('.energy-price-edit').remove();};
  form.onsubmit=function(e){e.preventDefault();
    try{
      var updated=Object.assign({},c),prev=energyContracts();
      ['supplier','tariff','supply','start','end','commitment','notes','source','taxes'].forEach(function(k){updated[k]=form.elements[k].value.trim();});
      updated.prices=Array.from(wrap.querySelectorAll('.energy-price-edit')).map(function(row){var value=row.querySelector('[data-price-value]').value;if(value==='')throw new Error('Rellena el precio o elimina el concepto vacío');return {label:row.querySelector('[data-price-label]').value.trim(),value:Number(value),unit:row.querySelector('[data-price-unit]').value.trim()};});
      validateEnergyContracts([updated]);energySaveContracts(energyMergeContracts(prev,[updated]));close();openEnergyHistory(kind);
      showToast('Contrato guardado','success',function(){energySaveContracts(prev);openEnergyHistory(kind);});
    }catch(err){showToast(err.message,'error');}
  };
  var del=wrap.querySelector('#energyDelete');if(del)del.onclick=function(){var prev=energyContracts();energySaveContracts(prev.filter(function(x){return x.id!==id;}));close();openEnergyHistory(kind);showToast('Contrato eliminado','success',function(){energySaveContracts(prev);openEnergyHistory(kind);});};
}
function bindEnergyHistory(){document.querySelectorAll('.energy-history-open').forEach(function(b){b.onclick=function(){openEnergyHistory(b.dataset.energyKind);};});}
