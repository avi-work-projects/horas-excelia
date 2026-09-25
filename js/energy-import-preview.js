/* Compara la fusión antes de escribir: comparte las mismas reglas que la importación. */
function energyImportChanges(current,merged,key,label){
  function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){var o={};Object.keys(v).sort().forEach(function(k){o[k]=stable(v[k]);});return o;}return v;}
  var changes={added:[],updated:[],unchanged:0},map={};current.forEach(function(v){map[key(v)]=v;});
  merged.forEach(function(v){var old=map[key(v)];if(!old)changes.added.push(label(v));else if(JSON.stringify(stable(old))!==JSON.stringify(stable(v)))changes.updated.push({before:label(old),after:label(v)});else changes.unchanged++;});
  return changes;
}
function energyImportPreview(data){
  if(!Array.isArray(data.energyBills)&&!Array.isArray(data.energyContracts)&&!Array.isArray(data.energyTaxes))throw new Error('El archivo no contiene datos de energía');
  var definitions=[
    ['Facturas','energyBills',energyBills,energyMergeBills,function(x){return x.id;},function(x){return x.supplier+' · '+x.number+' · '+x.start+' → '+x.end+' · '+(x.consumption===null?'Sin consumo':energyNumber(x.consumption,'kWh'))+' · '+energyNumber(x.gross,'€');}],
    ['Contratos y tarifas','energyContracts',energyContracts,energyMergeContracts,function(x){return x.id;},function(x){return x.supplier+' · '+x.start+' → '+(x.end||'actualidad')+' · '+energyCommercialPeriods(x).length+' tarifas';}],
    ['IVA','energyTaxes',energyTaxes,energyMergeTaxes,function(x){return x.kind+'|'+x.start;},function(x){return (x.kind==='luz'?'Electricidad':'Gas')+' · '+x.start+' · '+x.rate+' %';}]
  ];
  var h='<div class="imp-preview">';
  definitions.forEach(function(d){if(!Array.isArray(data[d[1]]))return;var current=d[2](),merged=d[3](current,data[d[1]]),changes=energyImportChanges(current,merged,d[4],d[5]);
    h+='<section><h4>'+d[0]+'</h4><p><b>'+changes.added.length+' nuevos · '+changes.updated.length+' actualizados</b></p><p>'+data[d[1]].length+(data[d[1]].length===1?' registro recibido.':' registros recibidos.')+' El resto se conserva.</p>';
    if(changes.added.length||changes.updated.length){h+='<details><summary>Ver cambios</summary>';changes.added.forEach(function(v){h+='<p>Nuevo: '+escHtml(v)+'</p>';});changes.updated.forEach(function(v){h+='<p>Antes: '+escHtml(v.before)+'<br>Después: '+escHtml(v.after)+(v.before===v.after?'<br>Se actualizan precios, desglose o datos del documento.':'')+'</p>';});h+='</details>';}
    h+='</section>';
  });
  var other=Object.keys(data).some(function(k){return ['version','exportedAt','energyBills','energyContracts','energyTaxes'].indexOf(k)<0;});
  return h+'</div><p class="imp-preview-note">'+(other?'Este archivo también contiene otros datos. Aquí solo se importará energía; para incorporar todo, utiliza Importar todo en Ajustes. ':'')+'No se borra ningún registro. Las coincidencias se actualizan y podrás deshacer la importación.</p>';
}
