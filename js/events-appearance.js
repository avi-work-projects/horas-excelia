/* Laboratorio temporal de trazos. Solo presentación: no cambia eventos,
   tamaños, huecos del calendario ni los dibujos guardados en backups. */
var EV_APPEARANCE_KEY='excelia-event-appearance-v1';
var EV_APPEARANCE_FIELDS=[
  {key:'border',label:'Borde negro',value:2,min:.5,max:2.5},
  {key:'cross',label:'Grosor de las cruces',value:5,min:3,max:5.5},
  {key:'ink',label:'Símbolos sin relleno',value:3,min:1.5,max:3.6},
  {key:'halo',label:'Contorno de fondo',value:.6,min:0,max:1.2}
];
var EV_APPEARANCE_OPEN=false;
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
  return values;
}
var EV_APPEARANCE=loadEventAppearance();
function applyEventAppearance(){
  var style=document.documentElement.style;
  EV_APPEARANCE_FIELDS.forEach(function(f){style.setProperty('--ev-symbol-'+f.key+'-scale',String(EV_APPEARANCE[f.key]/f.value));});
}
function setEventAppearance(values,persist){
  validateEventAppearance(values);
  EV_APPEARANCE=Object.assign({},values);applyEventAppearance();
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
  return 'stroke-width="'+width+'" style="stroke-width:calc('+expression+')"';
}
function renderEventAppearance(){
  var samples=[['diamond','#34d399','Gestiones'],['scissors','#8b5e34','Peluquería'],['barbecue','#d46535','Barbacoa'],['rounded','#fb923c','Planes'],['x-thick','#c084fc','Cruces'],['wave','#8b5e34','Onda'],['x-outline','#8b5e34','Aspa'],['circle-plus','#16859b','Círculo']];
  var h='<details class="ev-symbol-lab" id="evSymbolLab"'+(EV_APPEARANCE_OPEN?' open':'')+'><summary>Grosor de símbolos <span>Temporal</span></summary><div class="ev-symbol-lab-body">';
  h+='<p>Ajusta y compara. Se aplica a todos los calendarios, incluidos ensayos y rutinas.</p><div class="ev-symbol-samples" aria-label="Vista previa de símbolos">';
  samples.forEach(function(s){h+='<span title="'+s[2]+'" style="color:'+s[1]+'">'+evShapeSvg(s[0])+'</span>';});
  h+='<span title="Pádel">'+rutIconSvg('padel',RUT_FIXED_COLOR.padel)+'</span><span title="Wedding Moves">'+evBodaSvg(null)+'</span></div>';
  EV_APPEARANCE_FIELDS.forEach(function(f){
    var id='evSymbol-'+f.key;
    h+='<div class="ev-symbol-control"><label for="'+id+'">'+f.label+'</label><output for="'+id+'">'+evAppearanceNumber(EV_APPEARANCE[f.key])+'</output><input id="'+id+'" type="range" min="'+f.min+'" max="'+f.max+'" step="0.05" data-symbol-setting="'+f.key+'" value="'+EV_APPEARANCE[f.key]+'"></div>';
  });
  h+='<div class="ev-symbol-actions"><button type="button" class="ev-io-btn" data-symbol-reset>Restablecer</button><button type="button" class="ev-io-btn io-primaria" data-symbol-calendar>Ver calendario</button></div>';
  return h+'</div></details>';
}
function evAppearanceNumber(value){return value.toLocaleString('es-ES',{maximumFractionDigits:2})+' px';}
function bindEventAppearance(){
  var panel=document.getElementById('evSymbolLab');if(!panel)return;
  panel.addEventListener('toggle',function(){EV_APPEARANCE_OPEN=panel.open;});
  panel.addEventListener('input',function(e){
    var key=e.target.dataset.symbolSetting;if(!key)return;
    var values=Object.assign({},EV_APPEARANCE);values[key]=Number(e.target.value);setEventAppearance(values,false);
    panel.querySelector('output[for="'+e.target.id+'"]').textContent=evAppearanceNumber(values[key]);
  });
  panel.addEventListener('change',function(e){if(e.target.dataset.symbolSetting)setEventAppearance(EV_APPEARANCE);});
  panel.querySelector('[data-symbol-reset]').addEventListener('click',function(){
    setEventAppearance(evAppearanceDefaults());
    panel.querySelectorAll('[data-symbol-setting]').forEach(function(el){el.value=EV_APPEARANCE[el.dataset.symbolSetting];panel.querySelector('output[for="'+el.id+'"]').textContent=evAppearanceNumber(Number(el.value));});
  });
  panel.querySelector('[data-symbol-calendar]').addEventListener('click',function(){
    panel.open=false;EV_APPEARANCE_OPEN=false;
    var cal=document.querySelector('#eventsContent .ev-month-wrap');if(cal)cal.scrollIntoView({block:'start',behavior:'smooth'});
  });
}
applyEventAppearance();
