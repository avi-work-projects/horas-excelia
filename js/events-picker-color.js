/* ============================================================
   EVENTS PICKER COLOR - Paleta y picker reutilizable
   Usa fakeTrans() de core.js. Cargado antes que events.js.
   ============================================================ */

var EV_COLOR_GRID=[
  /* Paleta compartida 6x8: familias cromáticas, tierras y grises. */
  /* Rojos, rosas y magentas */
  '#ff6b6b','#e03131','#f06595','#d6336c','#e879a8','#da77f2',
  /* Purpuras y violetas */
  '#c084fc','#ae3ec9','#9775fa','#7950f2','#5f3dc4','#4c6ef5',
  /* Azules y cyans */
  '#6c8cff','#1d4ed8','#1971c2','#38bdf8','#22d3ee','#4ecdc4',
  /* Verdes y limas */
  '#34d399','#56c596','#0ca678','#a3e635','#82c91e','#5c940d',
  /* Verdes profundos y azul petróleo */
  '#65a367','#2f855a','#166534','#0f766e','#087e8b','#155e75',
  /* Amarillos y naranjas */
  '#ffe066','#fbbf24','#f0b45c','#fb923c','#f08c00','#e8590c',
  /* Tierras: beige, carne y marrones (claro -> oscuro) */
  '#e8d5b7','#f0c8a0','#d9a066','#b0714a','#8b5e34','#5c4033',
  /* Grises (claro -> oscuro) */
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
var EV_MANAGEMENT_SUBTYPES={'Llamada':'phone','Peluquería':'scissors','Médico':'medical','Dentista':'tooth','Pago hacienda':'tax','Pago':'payment','Contratar seguro':'insurance','Contratar gas/electricidad':'utilities','Enviar factura':'invoice'};
var EV_PLAN_SUBTYPES={'Plan romántico':'heart','Comida':'meal','Cena':'dinner','Salir de fiesta':'disco','Copas':'party','Tomar algo':'beer','Montaña':'mountain','Barbacoa':'barbecue','Cumpleaños':'cake','Brunch':'brunch','Bolos':'bowling','Cine':'cinema','Ping pong':'pingpong','Ver partido fútbol':'football-tv','Juegos de mesa':'boardgames','Ponencia':'lecture'};
function evIsManagement(type){return type==='Rec. Gestiones'||Object.prototype.hasOwnProperty.call(EV_MANAGEMENT_SUBTYPES,type);}
function evIsPlan(type){return type==='Plan/Quedada'||Object.prototype.hasOwnProperty.call(EV_PLAN_SUBTYPES,type);}
function evFixedSymbol(type){return EV_MANAGEMENT_SUBTYPES[type]||EV_PLAN_SUBTYPES[type]||null;}
var EV_KINDS = {
  puntual:{label:'Puntual', types:['Rec. Gestiones'].concat(Object.keys(EV_MANAGEMENT_SUBTYPES),['Plan/Quedada'],Object.keys(EV_PLAN_SUBTYPES),['Ensayos boda','Otros'])},
  grande: {label:'Grande',  types:['Viaje','Asturias','Casa Rural','Otros']}
};
/* Color por defecto de cada categor\u00eda (par kind|type) */
var EV_TYPE_COLORS = {
  'puntual|Rec. Gestiones':'#34d399',
  'puntual|Médico'       :'#e03131',
  'puntual|Llamada'      :'#1e40af',
  'puntual|Peluquería'   :'#8b5e34',
  'puntual|Dentista'     :'#16859b',
  'puntual|Pago hacienda':'#458b77',
  'puntual|Pago':'#52a878',
  'puntual|Contratar seguro':'#568cc2',
  'puntual|Contratar gas/electricidad':'#dea642',
  'puntual|Enviar factura':'#5b9ea4',
  'puntual|Plan/Quedada'  :'#fb923c',
  'puntual|Plan romántico':'#e03131',
  'puntual|Comida'        :'#e99a31',
  'puntual|Cena'          :'#6574c4',
  'puntual|Salir de fiesta':'#c553a5',
  'puntual|Copas'        :'#9f62bc',
  'puntual|Tomar algo'    :'#f5c232',
  'puntual|Montaña'       :'#8b5e34',
  'puntual|Barbacoa'      :'#d46535',
  'puntual|Cumpleaños'    :'#ad396b',
  'puntual|Brunch'        :'#efb34c',
  'puntual|Bolos'         :'#895ac4',
  'puntual|Cine'          :'#d95365',
  'puntual|Ping pong'     :'#e96836',
  'puntual|Ver partido fútbol':'#429867',
  'puntual|Juegos de mesa':'#398fbb',
  'puntual|Ponencia'      :'#7c6bb0',
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
/* Grosor de la barra de los eventos grandes. Viaje y Asturias van gruesas; el
   resto de grandes, mas estrechas. Solo "Otros" deja elegir entre los tres. */
var EV_BAR_SIZES = [{k:'lg',label:'Gruesa'},{k:'md',label:'Media'},{k:'sm',label:'Fina'}];
var EV_FREE_BARSIZE = {'grande|Otros':1};
/* Categorias con paleta libre pero que en el selector muestran SU color, no el
   punto multicolor: tienen un color propio muy identificativo (Casa Rural es
   marron) aunque se pueda cambiar puntualmente. */
var EV_DOT_SOLID = {'grande|Casa Rural':1};
function evBarSize(ev){
  var t=getEvType(ev);
  if(t==='Viaje'||t==='Asturias')return 'lg';
  if(ev&&(ev.barSize==='lg'||ev.barSize==='md'||ev.barSize==='sm'))return ev.barSize;
  return 'md';
}
function evBarSizeCls(ev){return 'ev-bar-'+evBarSize(ev);}
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
function evPlanShapeInner(shape){
  var outline=' stroke="#000" '+evSymbolStroke(EV_SHAPE_BW)+' stroke-linejoin="round"';
  var shapes={
    brunch:'<ellipse cy="3" rx="9" ry="5" fill="currentColor"'+outline+'/><path d="M-6,2 C-9,-4 -3,-7 0,-4 C6,-8 10,0 5,4 C1,8 -2,4 -6,2 Z" fill="#fff7df"'+outline+'/><circle cx="1" cy="0" r="3" fill="#f8bd36"/><path d="M-7,-7 Q-8,-9 -6,-10" fill="none" stroke="#000" stroke-width="1.2"/>',
    bowling:'<path d="M3,-9 C-1,-9 0,-5 1,-3 C2,0 -2,3 0,8 H7 C9,3 5,0 6,-3 C7,-5 7,-9 3,-9 Z" fill="#fff5e3"'+outline+'/><path d="M1,-3 H6 M1,-1 H6" stroke="#d74756" stroke-width="1.5"/><circle cx="-4" cy="4" r="5" fill="currentColor"'+outline+'/><circle cx="-5" cy="2" r=".9"/><circle cx="-2.5" cy="2.5" r=".9"/><circle cx="-4" cy="4.5" r=".9"/>',
    cinema:'<rect x="-9" y="-3" width="18" height="12" rx="1.5" fill="currentColor"'+outline+'/><path d="M-9,-3 L-10,-7 L7,-10 L8,-6 Z" fill="#e9edf3"'+outline+'/><path d="M-5,-8 L-2,-5 M1,-9 L4,-6" stroke="#000" stroke-width="2"/><path d="M-5,1 H5 M-5,5 H2" stroke="#fff2da" stroke-width="1.6" stroke-linecap="round"/>',
    pingpong:'<g transform="rotate(-35)"><path d="M-1.5,2 H1.5 V9 H-1.5 Z" fill="#d6a365" stroke="#000" stroke-width="1.4"/><ellipse cy="-3" rx="5.5" ry="6.5" fill="currentColor"'+outline+'/></g><circle cx="7" cy="-5" r="2.5" fill="#fff" stroke="#000" stroke-width="1.4"/>',
    'football-tv':'<rect x="-9" y="-7" width="18" height="13" rx="2" fill="currentColor"'+outline+'/><path d="M0,6 V9 M-5,9 H5" stroke="#000" stroke-width="2" stroke-linecap="round"/><circle cy="-.5" r="5" fill="#fff" stroke="#000" stroke-width="1.1"/><path d="M0,-3 L2,-1.5 L1,1 H-1 L-2,-1.5 Z M-4,-3 L-2.5,-4.5 L-2,-3 M4,-3 L2.5,-4.5 L2,-3 M-4,2 L-2.5,3.5 L-2,2 M4,2 L2.5,3.5 L2,2" fill="#000"/>',
    boardgames:'<rect x="-9" y="-5" width="11" height="12" rx="2" transform="rotate(-12)" fill="currentColor"'+outline+'/><rect x="-1" y="-7" width="10" height="12" rx="2" transform="rotate(12)" fill="#f9d375"'+outline+'/><g fill="#000"><circle cx="-6" cy="-1" r="1"/><circle cx="-3" cy="3" r="1"/><circle cx="3" cy="-4" r="1"/><circle cx="6" cy="0" r="1"/></g>',
    lecture:'<rect x="-9" y="-9" width="18" height="11" rx="1" fill="#e7edf5"'+outline+'/><path d="M1,-6 H6 M1,-3 H5" stroke="currentColor" stroke-width="1.6"/><circle cx="-4" cy="-4" r="2.5" fill="#f4cba6" stroke="#000" stroke-width="1.3"/><path d="M-8,3 Q-8,-1 -4,-1 Q0,-1 0,3" fill="currentColor"'+outline+'/><path d="M-7,2 H6 L4,9 H-5 Z" fill="currentColor"'+outline+'/><path d="M2,2 V-1 L4,-2" fill="none" stroke="#000" stroke-width="1.3"/>'
  };
  return shapes[shape]||null;
}
function evShapeSvg(shape){
  /* Las siluetas de rutina (mancuerna, pala, bailarin) tambien se pueden
     elegir como forma para un evento puntual de tipo Otros. */
  if(typeof RUT_ICON_LABEL!=='undefined'&&RUT_ICON_LABEL[shape]&&typeof rutIconSvg==='function'){
    var activity=rutIconSvg(shape,RUT_FIXED_COLOR[shape]||'#888',true).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
    return '<svg viewBox="0 0 20 20"><rect x="1" y="1" width="18" height="18" rx="4" fill="#fff" stroke="#000" '+evSymbolStroke(1.7)+'/><g transform="translate(3.5 3.5) scale(.54)">'+activity+'</g></svg>';
  }
  var bw=EV_SHAPE_BW,inner=evPlanShapeInner(shape)||evManagementShapeInner(shape);
  if(inner){ /* Símbolos de planes con su relleno propio. */
  } else if(shape==='cake'){
    inner='<path d="M0,-9 C-4,-5 3,-4 2,-7 Z" fill="#ffcc52" stroke="#000" '+evSymbolStroke(1.5)+' stroke-linejoin="round"/>'
      +'<path d="M0,-4 V0" stroke="#000" '+evSymbolStroke(2)+'/><rect x="-8" y="-1" width="16" height="9" rx="1.5" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+'/>'
      +'<path d="M-8,0 Q-8,-2 -6,-2 H6 Q8,-2 8,0 V2 Q6,4 4,2 Q2,0 0,2 Q-2,4 -4,2 Q-6,0 -8,2 Z" fill="#fff0d6" stroke="#000" '+evSymbolStroke(1.5)+' stroke-linejoin="round"/>';
  } else if(shape==='medical'){
    inner='<rect x="-9" y="-7.5" width="18" height="15" rx="2" fill="#fff" stroke="#000" '+evSymbolStroke(bw)+'/><path d="M-5,0 H5 M0,-5 V5" fill="none" stroke="#e03131" '+evSymbolStroke(3.4,'cross')+'/>';
  } else if(shape==='phone'){
    inner='<path d="M-7,-8 C-10,-6 -8,1 -3,5 C1,9 6,10 8,7 L8,4 L3,1 L1,3 C-1,2 -3,0 -4,-2 L-2,-4 L-5,-8 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>';
  } else if(shape==='scissors'||shape==='comb'){
    inner='<path d="M-5,4 L5.5,-8 Q7,-7 5,-3 L0,3 Z M5,4 L-5.5,-8 Q-7,-7 -5,-3 L0,3 Z" fill="#dbe3e9" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>'
      +'<circle cx="-5" cy="5.5" r="3" fill="#8b5e34" stroke="#000" '+evSymbolStroke(bw)+'/><circle cx="5" cy="5.5" r="3" fill="#8b5e34" stroke="#000" '+evSymbolStroke(bw)+'/><circle cy=".5" r="1" fill="#000"/>';
  } else if(shape==='barbecue'){
    inner='<path d="M-5,3 L-7,9 M5,3 L7,9 M-5,7 H5" fill="none" stroke="#000" '+evSymbolStroke(bw)+' stroke-linecap="round"/>'
      +'<path d="M-8,-2 H8 L6,4 H-6 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>'
      +'<ellipse cy="-2" rx="8" ry="2.7" fill="#48515c" stroke="#000" '+evSymbolStroke(bw)+'/><path d="M-4,-3.5 V-.5 M0,-4 V0 M4,-3.5 V-.5" stroke="#eef1f5" stroke-width="1.2"/>'
      +'<path d="M-3,-6 Q-5,-7 -3,-9 M3,-6 Q1,-7 3,-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
  } else if(shape==='tooth'){
    inner='<path d="M0,-6 C-9,-12 -10,-3 -7,2 C-6,5 -6,9 -3,9 C-1,9 -2,2 0,2 C2,2 1,9 3,9 C6,9 6,5 7,2 C10,-3 9,-12 0,-6 Z" fill="#e8f7fa" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/><path d="M-4,-4 Q-2,-5 0,-3" fill="none" stroke="#16859b" stroke-width="1.3" stroke-linecap="round"/>';
  } else if(shape==='heart'){
    inner='<path d="M0,8 C-3,5 -9,1 -9,-3 C-9,-9 -2,-10 0,-5 C2,-10 9,-9 9,-3 C9,1 3,5 0,8 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>';
  } else if(shape==='meal'){
    inner='<circle cx="0" r="4.6" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+'/><circle cx="0" r="2.7" fill="#fff4dd"/>'
      +'<path d="M-9,-7 V-3 Q-9,-1 -8,-1 Q-7,-1 -7,-3 V-7 M-8,-7 V8 M9,8 V-7 Q6,-4 7,0 H9" fill="none" stroke="#000" '+evSymbolStroke(1.3)+' stroke-linecap="round" stroke-linejoin="round"/>';
  } else if(shape==='dinner'){
    inner='<path d="M-9,6 A9,9 0 0 1 9,6 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+'/><path d="M-9,8 H9 M0,-3 V-5" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/><path d="M5,-9 A4,4 0 1 0 9,-5 A4,4 0 0 1 5,-9" fill="#ffe7a1" stroke="#000" stroke-width="1.2"/>';
  } else if(shape==='disco'){
    inner='<path d="M0,-10 V-7" stroke="#000" stroke-width="1.6"/><circle cy="1" r="8" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+'/><path d="M-7,-2 H7 M-7,3 H7 M-4,7 Q-8,1 -4,-6 M4,7 Q8,1 4,-6 M0,-7 V9" fill="none" stroke="#fff" stroke-width="1.2"/><path d="M-9,-8 V-4 M-11,-6 H-7 M8,-8 V-4 M6,-6 H10" stroke="#000" stroke-width="1.1"/>';
  } else if(shape==='planet'||shape==='moon'){
    /* Alias para que los eventos existentes adopten también la nueva luna. */
    inner='<path d="M3,-8 A8.5,8.5 0 1 0 8,4 A8,8 0 0 1 3,-8 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>';
  } else if(shape==='party'){
    inner='<path d="M-8,-7 H8 L1,2 V7 H5 V9 H-5 V7 H-1 V2 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/><path d="M-5,-4 H5 M2,-4 L6,-9" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>';
  } else if(shape==='beer'){
    inner='<path d="M4,-2 H9 V5 H4" fill="none" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/><path d="M-7,-4 H5 V8 H-7 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/><path d="M-7,-3 C-11,-5 -7,-9 -4,-7 C-3,-10 2,-10 3,-7 C7,-8 8,-3 4,-3 Z" fill="#fff" stroke="#000" '+evSymbolStroke(bw)+'/><path d="M-3,0 V5 M1,0 V5" stroke="#000" stroke-width="1" opacity=".4"/>';
  } else if(shape==='mountain'){
    inner='<path d="M-9,8 L-1,-8 L9,8 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/><path d="M-4,-2 L-1,-8 L3,-2 L0,-3 L-2,-1 Z" fill="#fff" stroke="#000" stroke-width="1" stroke-linejoin="round"/>';
  } else if(shape==='rings'){
    inner='<ellipse cx="-3" cy="0" rx="4.5" ry="7" fill="none" stroke="#000" '+evSymbolStroke(5,'outline',2.5)+'/><ellipse cx="-3" cy="0" rx="4.5" ry="7" fill="none" stroke="currentColor" stroke-width="2.5"/><ellipse cx="3" cy="0" rx="4.5" ry="7" fill="none" stroke="#000" '+evSymbolStroke(5,'outline',2.5)+'/><ellipse cx="3" cy="0" rx="4.5" ry="7" fill="none" stroke="currentColor" stroke-width="2.5"/>';
  } else if(shape==='x-thick'||shape==='x-thin'){
    var swIn=5;
    var swOut=swIn+bw*2;
    var d=shape==='x-thin'?'M-5.5,0 H5.5 M0,-5.5 V5.5':'M-6,-6 L6,6 M-6,6 L6,-6';
    inner='<path d="'+d+'" stroke="#000" '+evSymbolStroke(swOut,'cross-outline',swIn)+' stroke-linecap="round" fill="none"/>'
        + '<path d="'+d+'" stroke="currentColor" '+evSymbolStroke(swIn,'cross')+' stroke-linecap="round" fill="none" class="ev-shape-x-color"/>';
  } else if(shape==='circle'){
    inner='<circle cx="0" cy="0" r="'+(9-bw/2)+'" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+'/>';
  } else if(shape==='square'){
    inner='<rect x="-8" y="-8" width="16" height="16" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+'/>';
  } else if(shape==='diamond'){
    /* Se conserva el identificador para actualizar también eventos y backups antiguos. */
    inner='<polygon points="-4.2,-7.5 4.2,-7.5 8.5,0 4.2,7.5 -4.2,7.5 -8.5,0" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>';
  } else if(shape==='wave'||shape==='x-outline'||shape==='circle-plus'){
    /* Trazo de rotulador inclinado; las coordenadas dejan margen al trazo
       dentro del viewBox habitual, sin agrandar el hueco del marcador. */
    var line=shape==='wave'?'M-7.5,0 C-5.6,-6 -1.9,-6 0,0 C1.9,6 5.6,6 7.5,0'
      :shape==='x-outline'?'M-5.5,-6 L5.5,6 M-5.5,6 L5.5,-6'
      :'M6.5,0 C6.7,8.6 -7.3,8.6 -7,0 C-7.1,-8.6 7.1,-8.6 6.5,0 M-3.4,0 H3.4 M0,-3.4 V3.4';
    var path=' d="'+line+'" transform="skewX(-10)" fill="none" stroke-linecap="'+(shape==='x-outline'?'square':'round')+'" stroke-linejoin="round"';
    inner='<path'+path+' class="ev-shape-halo" stroke="var(--ev-marker-halo, var(--surface))" '+evSymbolStroke(4.2,'halo')+'/>'
      +'<path'+path+' stroke="currentColor" '+evSymbolStroke(3,'ink')+'/>';
  } else if(shape==='cloud'){
    inner='<path d="M-6,6 H6 C9.5,6 9.5,-2 7,-2 C7,-8 0,-9 -2,-5 C-7,-8 -10,-3 -7,0 C-10,1 -9.5,6 -6,6 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>';
  } else if(shape==='petal'){
    inner='<path d="M0,-8 C4,-8 4,-4 3,-2 C10,-6 12,2 5,3 C11,9 3,12 0,6 C-3,12 -11,9 -5,3 C-12,2 -10,-6 -3,-2 C-4,-4 -4,-8 0,-8 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/>';
  } else if(shape==='leaf'){
    inner='<path d="M-7,7 C-10,-4 -2,-8 8,-8 C8,3 4,10 -7,7 Z" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+' stroke-linejoin="round"/><path d="M-6,6 L3,-3" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>';
  } else { /* rounded */
    inner='<rect x="-9" y="-6" width="18" height="12" rx="4" fill="currentColor" stroke="#000" '+evSymbolStroke(bw)+'/>';
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
  if(t==='Cerveza')t='Tomar algo'; // Alias: conserva ids, títulos y fechas de eventos antiguos.
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
  /* Las sesiones de rutina llevan el color de su rutina tal cual: su id cambia
     cada dia, asi que el matiz por hash las pintaria de un color distinto
     cada sesion. */
  if(getEvType(ev)==='Rutina')return ev._rut?rutDisplayColor(ev._rut):ev.color;
  if(getEvKind(ev)==='puntual'&&getEvType(ev)==='Otros'&&typeof RUT_FIXED_COLOR!=='undefined'&&RUT_FIXED_COLOR[ev.shape])return RUT_FIXED_COLOR[ev.shape];
  if(getEvKind(ev)==='puntual'&&evFixedSymbol(getEvType(ev)))return evTypeColor('puntual',getEvType(ev));
  /* Una clase de boda se tine con el color de SU pareja: el morado del tipo
     solo se usa mientras no hay pareja asignada. */
  if(getEvType(ev)==='Ensayos boda'&&ev.boda&&ev.boda.coupleId&&typeof bodaCouple==='function'){
    var _bc=bodaCouple(ev.boda.coupleId);
    if(_bc&&_bc.color)return _bc.color;
  }
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

