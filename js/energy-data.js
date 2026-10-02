/* Datos de solo lectura durante UN render. No persiste entre pantallas ni cambios.
   Los cálculos públicos también funcionan fuera de este contexto, sin caché. */
var ENERGY_RENDER_CONTEXT=null;
function withEnergyData(render){
  if(ENERGY_RENDER_CONTEXT)return render();
  ENERGY_RENDER_CONTEXT={reads:Object.create(null),calculations:[]};
  try{return render();}finally{ENERGY_RENDER_CONTEXT=null;}
}
function energyReadData(key,read){
  var ctx=ENERGY_RENDER_CONTEXT;
  if(!ctx)return read();
  if(!Object.prototype.hasOwnProperty.call(ctx.reads,key))ctx.reads[key]=read();
  return ctx.reads[key];
}
function energyMemo(name,args,calculate){
  var ctx=ENERGY_RENDER_CONTEXT;
  if(!ctx)return calculate();
  var found=ctx.calculations.find(function(item){return item.name===name&&item.args.length===args.length&&item.args.every(function(value,i){return value===args[i];});});
  if(found)return found.value;
  var value=calculate();ctx.calculations.push({name:name,args:args,value:value});return value;
}
