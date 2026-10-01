/* ── Iconos de rutina ──────────────────────────────────────
   Dibujos monocromos: la silueta va en el color de la rutina y los detalles
   en un tono más oscuro del MISMO color (fakeTrans). Para que se recorten
   igual que el resto de marcadores del calendario, la silueta se pinta dos
   veces: primero con un trazo negro grueso (contorno de la unión) y luego
   rellena. ViewBox común de 26 unidades, sin aumentar el espacio del marcador. */
var RUT_ICONS = ['gym','padel','baile','gen'];
var RUT_APPEARANCE_KEY='excelia-routine-appearance-v1';
var RUT_GYM_COLOR=(function(){try{var c=JSON.parse(appStorage.getItem(RUT_APPEARANCE_KEY)||'{}').gymColor;return /^#[0-9a-f]{6}$/i.test(c)?c:'#38bdf8';}catch(e){return '#38bdf8';}})();
var RUT_FIXED_COLOR={gym:RUT_GYM_COLOR,padel:'#a3e635',baile:'#e03131'};
function rutDisplayColor(r){return rutIconOf(r)==='gym'?RUT_GYM_COLOR:(r.color||'#888');}
function rutColorOf(icon,color){return RUT_FIXED_COLOR[icon]||color;}
var RUT_ICON_LABEL = {gym:'Gimnasio', padel:'Pádel', baile:'Baile', gen:'Otra'};
function _rutIconShapes(kind){
  if(kind==='gym'){
    /* Mancuerna. El brazo flexionado se probó y NO se lee a 13 px: el contorno
       negro cierra el hueco entre bíceps y puño y queda una mancha. */
    return '<rect x="2" y="5" width="5" height="14" rx="1.8"/>'
         + '<rect x="6" y="10" width="12" height="4" rx="1"/>'
         + '<rect x="17" y="5" width="5" height="14" rx="1.8"/>';
  }
  if(kind==='padel'){
    /* Pala de pádel: cabeza ovalada + mango */
    return '<ellipse cx="12" cy="8.8" rx="7.6" ry="7.2"/>'
         + '<rect x="10.2" y="14" width="3.6" height="8.4" rx="1.3"/>';
  }
  if(kind==='baile'){
    /* Bailarín: cabeza + torso inclinado + piernas + brazo en alto */
    return '<circle cx="12.6" cy="4.5" r="2.5"/>'
         + '<path d="M12.2,8.5 C10.4,10 9.9,11.5 10.6,13 L5.4,20" fill="none" stroke-width="3.2" stroke-linecap="round"/>'
         + '<path d="M10.6,13 L17,15.5 L18.4,20.5" fill="none" stroke-width="3.2" stroke-linecap="round"/>'
         + '<path d="M6,10.6 L12.4,9.4 L18.4,5.4" fill="none" stroke-width="3.2" stroke-linecap="round"/>';
  }
  /* genérico: rombo con centro */
  return '<polygon points="12,3 20,12 12,21 4,12"/>';
}
function _rutIconDetails(kind,dark){
  if(kind==='padel'){
    var o='';
    [[9.3,7.5],[14.7,7.5],[12,11.5]].forEach(function(p){
      o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1" fill="'+dark+'"/>';
    });
    o+='<rect x="10.9" y="16.2" width="2.2" height="4.4" rx="1.1" fill="'+dark+'"/>';
    return o;
  }
  if(kind==='gym'){
    /* Barra en el tono oscuro para que se distinga de los discos */
    return '<rect x="7" y="10.7" width="10" height="2.6" rx="1.3" fill="'+dark+'"/>';
  }
  if(kind==='baile'){
    return '<circle cx="18.6" cy="5.2" r="1.9" fill="'+dark+'"/>';
  }
  return '<circle cx="12" cy="12" r="3.1" fill="'+dark+'"/>';
}
/* Deduce el icono por el nombre cuando la rutina no lo trae guardado */
function rutIconOf(r){
  if(r&&r.icon&&RUT_ICON_LABEL[r.icon])return r.icon;
  var n=(r&&r.name?r.name:'').toLowerCase();
  if(/gim|gym|pesa|mancuerna|crossfit|musc/.test(n))return 'gym';
  if(/p[aá]del|tenis|raqueta|squash|b[aá]dminton/.test(n))return 'padel';
  if(/bail|danz|salsa|bachata|zumba/.test(n))return 'baile';
  return 'gen';
}
/* color puede ser 'currentColor': entonces el detalle se oscurece con un
   velo negro en vez de calcular la mezcla, que necesita un hex. */
function rutIconSvg(kind,color,chooser){
  var dark=(color==='currentColor')?'rgba(0,0,0,.45)'
          :((typeof fakeTrans==='function')?fakeTrans(color,0.52):color);
  var shapes=_rutIconShapes(kind);
  /* El ribete ocupa la misma proporción que en el viewBox de 20 de los
     puntuales. En una silueta rellena la mitad del trazo queda dentro. */
  var bw=chooser?1.15:(typeof EV_SHAPE_BW!=='undefined'?EV_SHAPE_BW:2)*26/20;
  var outline=shapes.replace(/stroke-width="([0-9.]+)"/g,function(_,w){return 'stroke-width="'+(+w+2*bw)+'"';});
  return '<svg viewBox="-1 -1 26 26" preserveAspectRatio="xMidYMid meet">'
    + '<g fill="#000" stroke="#000" stroke-width="'+(2*bw)+'" stroke-linejoin="round" stroke-linecap="round">'+outline+'</g>'
    + '<g fill="'+color+'" stroke="'+color+'" stroke-width="0" stroke-linejoin="round" stroke-linecap="round">'+shapes+'</g>'
    + _rutIconDetails(kind,dark)
    + '</svg>';
}

/* Prueba temporal del color del gimnasio. La preferencia cambia la presentación;
   las rutinas guardadas y sus fechas no se reescriben. */
function setRutGymColor(hex){
  if(!/^#[0-9a-f]{6}$/i.test(hex))return;
  RUT_GYM_COLOR=hex.toLowerCase();RUT_FIXED_COLOR.gym=RUT_GYM_COLOR;
  appStorage.setItem(RUT_APPEARANCE_KEY,JSON.stringify({gymColor:RUT_GYM_COLOR}));
}
function renderRutAppearance(){
  return '<details class="rut-appearance"><summary>Probar color de gimnasio <span class="rut-color-code">'+RUT_GYM_COLOR+'</span></summary><p class="sy-note">Selector temporal. El color se mantiene al navegar y puedes pasarme su código cuando lo decidas.</p><div class="rut-color-sample">'+rutIconSvg('gym',RUT_GYM_COLOR)+'<span>Gimnasio</span></div>'+_renderColorPicker(RUT_GYM_COLOR,false,false,'rutGym')+'</details>';
}
function bindRutAppearance(){
  var root=document.querySelector('.rut-appearance');if(!root)return;
  var picker=_bindColorPicker(root,'rutGym',function(hex){setRutGymColor(hex);root.querySelector('.rut-color-sample').innerHTML=rutIconSvg('gym',hex)+'<span>Gimnasio</span>';root.querySelector('.rut-color-code').textContent=hex;});
  root.querySelector('#rutGymHex').addEventListener('input',function(){if(/^#[0-9a-f]{6}$/i.test(this.value))picker.setColor(this.value);});
  root.addEventListener('toggle',function(){if(!root.open)refreshEvents();});
}
