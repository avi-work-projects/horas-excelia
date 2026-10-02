/* Trazo definitivo: ribete de 1,3 px. Conservamos la lectura de los ajustes
   antiguos para no romper backups; el ribete ya no depende del dispositivo. */
var EV_APPEARANCE_KEY='excelia-event-appearance-v1';
var EV_APPEARANCE_FIELDS=[
  {key:'border',value:1.3,base:2,min:.5,max:2.5},
  {key:'cross',label:'Grosor de las cruces',value:5,min:3,max:5.5},
  {key:'ink',label:'Símbolos sin relleno',value:3,min:1.5,max:3.6},
  {key:'halo',label:'Contorno de fondo',value:.6,min:0,max:1.2}
];
function evAppearanceDefaults(){
  var values={};EV_APPEARANCE_FIELDS.forEach(function(f){values[f.key]=f.value;});return values;
}
function validateEventAppearance(values){
  if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('Ajustes de símbolos no válidos');
  EV_APPEARANCE_FIELDS.forEach(function(f){
    if(typeof values[f.key]!=='number'||!Number.isFinite(values[f.key])||values[f.key]<f.min||values[f.key]>f.max)throw new Error('Grosor de símbolos fuera de rango');
  });
}
function loadEventAppearance(){
  var values;try{values=JSON.parse(appStorage.getItem(EV_APPEARANCE_KEY));validateEventAppearance(values);}catch(e){values=evAppearanceDefaults();}
  return Object.assign({},values,{border:1.3});
}
var EV_APPEARANCE=loadEventAppearance();
function applyEventAppearance(){
  var style=document.documentElement.style;
  EV_APPEARANCE_FIELDS.forEach(function(f){style.setProperty('--ev-symbol-'+f.key+'-scale',String(EV_APPEARANCE[f.key]/(f.base||f.value)));});
}
function setEventAppearance(values,persist){
  validateEventAppearance(values);
  EV_APPEARANCE=Object.assign({},values,{border:1.3});applyEventAppearance();
  if(persist!==false)appStorage.setItem(EV_APPEARANCE_KEY,JSON.stringify(EV_APPEARANCE));
}
/* SVG conserva su atributo original como fallback. CSS permite actualizar
   todos los símbolos a la vez sin reconstruir el calendario o sus listeners.
   Los trazos superpuestos separan relleno y ribete: adelgazar el borde nunca
   descubre el símbolo que haya detrás (p. ej. dos sesiones consecutivas). */
function evSymbolStroke(width,role,inner){
  var expression;
  if(role==='outline'||role==='cross-outline'){
    expression=inner+'px'+(role==='cross-outline'?' * var(--ev-symbol-cross-scale,1)':'')+' + '+Number((width-inner).toFixed(4))+'px * var(--ev-symbol-border-scale,1)';
  }else if(role==='halo'){
    expression='3px * var(--ev-symbol-ink-scale,1) + '+Number((width-3).toFixed(4))+'px * var(--ev-symbol-halo-scale,1)';
  }else expression=width+'px * var(--ev-symbol-'+(role||'border')+'-scale,1)';
  var outline=!role||role==='border'||role==='outline'||role==='cross-outline';
  return 'stroke-width="'+width+'" style="stroke-width:calc('+expression+')'+(outline?';stroke:var(--ev-symbol-outline,#000)':'')+'"';
}
applyEventAppearance();
