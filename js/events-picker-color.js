/* ============================================================
   EVENTS PICKER COLOR - Paleta y picker reutilizable
   Usa fakeTrans() de core.js. Cargado antes que events.js.
   ============================================================ */

var EV_COLOR_GRID=[
  /* Paleta ordenada por familias de tono — fila a fila el ojo recorre el círculo cromático */
  /* Rojos y rosas */
  '#ff8787','#ff6b6b','#e03131','#f06595','#e64980','#d6336c',
  /* Magentas y púrpuras claros */
  '#e879a8','#da77f2','#c084fc','#ae3ec9','#9775fa','#845ef7',
  /* Violetas e índigos */
  '#748ffc','#7950f2','#4c6ef5','#6741d9','#3b5bdb','#5f3dc4',
  /* Azules y cyans */
  '#6c8cff','#38bdf8','#1971c2','#1d4ed8','#22d3ee','#66d9e8',
  /* Mints y verdes */
  '#4ecdc4','#63e6be','#34d399','#56c596','#0ca678','#099268',
  /* Verdes lima → amarillos */
  '#a3e635','#82c91e','#5c940d','#ffe066','#fbbf24','#f0b45c',
  /* Naranjas */
  '#fb923c','#ff922b','#f08c00','#fd7e14','#f76707','#e8590c',
  /* Grises (claro→oscuro) */
  '#f8f9fa','#dee2e6','#adb5bd','#868e96','#495057','#212529'
];
var EV_COLOR_TYPES = {
  '#38bdf8':'Viaje',
  '#6c8cff':'Viaje',  // compat con eventos anteriores
  '#1d4ed8':'Asturias',
  '#34d399':'Rec. Gestiones',
  '#fb923c':'Plan/Quedada',
  '#ff6b6b':'Otros',
  '#c084fc':'Otros',
  '#a3e635':'Otros',
  '#fbbf24':'Cumplea\u00f1os VIP'
};

/* \u2500\u2500 Clases de evento (v241) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Dos "kinds" con categor\u00edas propias. OJO: "Otros" existe en los dos, as\u00ed que
   la identidad de una categor\u00eda es el par (kind, type), no el nombre suelto.
   - puntual: se dibuja UN MARCADOR POR D\u00cdA (aunque abarque varios d\u00edas)
   - grande:  se dibuja como BARRA continua (formato actual de Viaje/Asturias) */
var EV_KINDS = {
  puntual:{label:'Puntual', types:['Rec. Gestiones','Plan/Quedada','Ensayos boda','Otros']},
  grande: {label:'Grande',  types:['Viaje','Asturias','Casa Rural','Otros']}
};
/* Color por defecto de cada categor\u00eda (par kind|type) */
var EV_TYPE_COLORS = {
  'puntual|Rec. Gestiones':'#34d399',
  'puntual|Plan/Quedada'  :'#fb923c',
  'puntual|Ensayos boda'  :'#c084fc',
  'puntual|Otros'         :'#a3e635',
  'grande|Viaje'          :'#38bdf8',
  'grande|Asturias'       :'#1d4ed8',
  'grande|Casa Rural'     :'#8b5e34',   /* marr\u00f3n */
  'grande|Otros'          :'#ff6b6b'
};
/* Categor\u00edas con color libre (paleta) y con selector de forma */
var EV_FREE_COLOR = {'grande|Viaje':1,'grande|Otros':1,'puntual|Otros':1,'grande|Casa Rural':1};
var EV_FREE_SHAPE = {'puntual|Otros':1};
/* Categorias con "Seleccion Multidia" (varios dias sueltos). En Ensayos boda
   sirve para dar de alta muchas clases de golpe desde el calendario 1 mes. */
var EV_FREE_DATES = {'puntual|Otros':1,'puntual|Ensayos boda':1};
function evTypeKey(kind,type){return kind+'|'+type;}
function evTypeColor(kind,type){return EV_TYPE_COLORS[evTypeKey(kind,type)]||'#a3e635';}
/* Clase de un evento: ev.kind si existe; si no, se deduce del tipo/duraci\u00f3n
   (migraci\u00f3n de eventos anteriores a v241 \u2014 ver migrateEvKinds en events.js) */
function getEvKind(ev){
  if(!ev)return 'puntual';
  if(ev.kind==='puntual'||ev.kind==='grande')return ev.kind;
  var t=ev.type||EV_COLOR_TYPES[ev.color]||'Otros';
  if(t==='Viaje'||t==='Asturias'||t==='Casa Rural')return 'grande';
  if(t==='Otros'&&ev.end&&ev.start&&ev.end>ev.start&&!(ev.dates&&ev.dates.length))return 'grande';
  return 'puntual';
}

/* ── Formas de marcador (SVG) ───────────────────────────────
   TODAS las formas se dibujan como SVG en un viewBox -10..10 con el MISMO
   grosor de borde (EV_SHAPE_BW), tomado del borde negro de la "aspa gorda".
   Ventajas: grosor uniforme en los 3 calendarios y escalado automático al
   tamaño del contenedor (el layout de anual/4-meses dimensiona por CSS grid).
   El color del relleno/trazo es currentColor → se controla con style="color:…". */
var EV_SHAPE_BW = 2;
function evShapeSvg(shape){
  var bw=EV_SHAPE_BW,inner;
  if(shape==='x-thick'||shape==='x-thin'){
    var swIn=shape==='x-thick'?5:2.6;
    var swOut=swIn+bw*2;
    var d='M-6,-6 L6,6 M-6,6 L6,-6';
    inner='<path d="'+d+'" stroke="#000" stroke-width="'+swOut+'" stroke-linecap="round" fill="none"/>'
        + '<path d="'+d+'" stroke="currentColor" stroke-width="'+swIn+'" stroke-linecap="round" fill="none" class="ev-shape-x-color"/>';
  } else if(shape==='circle'){
    inner='<circle cx="0" cy="0" r="'+(9-bw/2)+'" fill="currentColor" stroke="#000" stroke-width="'+bw+'"/>';
  } else if(shape==='square'){
    inner='<rect x="-8" y="-8" width="16" height="16" fill="currentColor" stroke="#000" stroke-width="'+bw+'"/>';
  } else if(shape==='diamond'){
    inner='<polygon points="0,-8.5 8.5,0 0,8.5 -8.5,0" fill="currentColor" stroke="#000" stroke-width="'+bw+'" stroke-linejoin="round"/>';
  } else { /* rounded */
    inner='<rect x="-9" y="-6" width="18" height="12" rx="4" fill="currentColor" stroke="#000" stroke-width="'+bw+'"/>';
  }
  return '<svg viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';
}
/* Marcador "+N" (4ª posición cuando hay más de 4 eventos puntuales en un día):
   círculo blanco con borde negro y un + negro. Mismo grosor de borde. */
function evMorePlusSvg(){
  return '<svg viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet">'
    +'<circle cx="0" cy="0" r="'+(9-EV_SHAPE_BW/2)+'" fill="#fff" stroke="#000" stroke-width="'+EV_SHAPE_BW+'"/>'
    +'<path d="M-4.6,0 H4.6 M0,-4.6 V4.6" stroke="#000" stroke-width="'+(EV_SHAPE_BW+.6)+'" stroke-linecap="round"/>'
    +'</svg>';
}

// Paleta variada para viajes (determinista según id del evento)
var _VIAJE_BLUES=['#e879a8','#f0b45c','#4ecdc4','#a18cd1','#56c596'];
function evTravelColor(evId){
  var h=0,id=String(evId||'');
  for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))&0x7fffffff;
  return _VIAJE_BLUES[h%_VIAJE_BLUES.length];
}
// Obtiene el tipo de un evento: ev.type (v111+) o fallback a EV_COLOR_TYPES[color]
function getEvType(ev){
  var t=ev.type||EV_COLOR_TYPES[ev.color]||'Otros';
  if(t==='Festivo'||t==='Puente')t='Otros';
  return t;
}
// ¿Se dibuja como BARRA? Desde v241 lo decide la clase: todos los "grandes"
// (Viaje, Asturias, Casa Rural, Otros-grande) son barra, duren 1 día o varios.
// Los "puntuales" nunca son barra: un marcador por cada día que ocupan.
function isEvBarAlways(ev){return getEvKind(ev)==='grande';}
// Devuelve el color de visualización (viajes → azul único por evento, resto → color guardado)
function getEvDisplayColor(ev){
  if(!ev)return'#888';
  /* Si el evento es Viaje y conserva un color personalizado distinto al base de Viaje,
     lo respetamos. Sólo los colores base (#38bdf8/#6c8cff) se reemplazan por el azul
     determinista por hash, para que cada viaje tenga matiz distinto. */
  if(ev.color==='#38bdf8'||ev.color==='#6c8cff')return evTravelColor(ev.id);
  return ev.color;
}

// Render color picker reutilizable (paleta 6×6 + color libre + preview)
function _renderColorPicker(selHex,_unusedShowLock,_unusedIsLocked,prefix){
  prefix=prefix||'evCp';
  var h='<div class="ev-color-picker" id="'+prefix+'Wrap">';
  h+='<div class="ev-color-grid">';
  for(var i=0;i<EV_COLOR_GRID.length;i++){
    var c=EV_COLOR_GRID[i];
    var sel=c.toLowerCase()===selHex.toLowerCase()?' selected':'';
    h+='<div class="ev-color-dot'+sel+'" data-hex="'+c+'" style="background:'+c+';border-color:'+c+'"></div>';
  }
  h+='</div>';
  h+='<div class="ev-color-custom-row">';
  h+='<input type="color" class="ev-color-native" id="'+prefix+'Native" value="'+selHex+'">';
  h+='<input type="text" class="ev-color-hex-input" id="'+prefix+'Hex" value="'+selHex+'" maxlength="7" spellcheck="false">';
  h+='</div>';
  h+='<div class="ev-color-preview-row">';
  h+='<div class="ev-color-preview-item"><span>Borde</span><div class="ev-color-preview-swatch" style="background:'+selHex+'"></div></div>';
  h+='<div class="ev-color-preview-item"><span>Relleno</span><div class="ev-color-preview-swatch" style="background:'+fakeTrans(selHex,0.65)+'"></div></div>';
  h+='<div class="ev-color-preview-hex" id="'+prefix+'Code">'+selHex+'</div>';
  h+='</div>';
  h+='</div>';
  return h;
}
// Bind color picker events; returns {getColor}
function _bindColorPicker(container,prefix,onChange){
  prefix=prefix||'evCp';
  var wrap=container.querySelector('#'+prefix+'Wrap');
  if(!wrap)return{getColor:function(){return'#888';}};
  var current=wrap.querySelector('.ev-color-dot.selected');
  /* Colores personalizados no están en la rejilla (ningún dot .selected):
     recuperar el color real del input hex, que siempre se pinta con selHex */
  var _hxInit=container.querySelector('#'+prefix+'Hex');
  var curHex=current?current.dataset.hex
    :(_hxInit&&/^#[0-9a-fA-F]{6}$/.test(_hxInit.value)?_hxInit.value:'#38bdf8');
  function updatePreview(hex){
    curHex=hex;
    var dots=wrap.querySelectorAll('.ev-color-dot');
    for(var i=0;i<dots.length;i++){
      if(dots[i].dataset.hex.toLowerCase()===hex.toLowerCase())dots[i].classList.add('selected');
      else dots[i].classList.remove('selected');
    }
    var native=container.querySelector('#'+prefix+'Native');
    var hexInput=container.querySelector('#'+prefix+'Hex');
    var code=container.querySelector('#'+prefix+'Code');
    var previews=wrap.querySelectorAll('.ev-color-preview-swatch');
    if(native)native.value=hex;
    if(hexInput)hexInput.value=hex;
    if(code)code.textContent=hex;
    if(previews[0])previews[0].style.background=hex;
    if(previews[1])previews[1].style.background=fakeTrans(hex,0.65);
    if(onChange)onChange(hex);
  }
  wrap.addEventListener('click',function(e){
    var dot=e.target.closest('.ev-color-dot');
    if(dot&&dot.dataset.hex){updatePreview(dot.dataset.hex);}
  });
  var native=container.querySelector('#'+prefix+'Native');
  if(native)native.addEventListener('input',function(){updatePreview(native.value);});
  var hexInput=container.querySelector('#'+prefix+'Hex');
  if(hexInput)hexInput.addEventListener('change',function(){
    var v=hexInput.value.trim();
    if(/^#[0-9a-fA-F]{6}$/.test(v))updatePreview(v);
    else hexInput.value=curHex;
  });
  return{
    getColor:function(){return curHex;},
    /* Permite fijar el color desde fuera (ej: al cambiar de categoria, la
       paleta salta al color propio de esa categoria) */
    setColor:function(hex){if(/^#[0-9a-fA-F]{6}$/.test(hex))updatePreview(hex);}
  };
}

