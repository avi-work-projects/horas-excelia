/* Iconos propios en SVG. La alternativa original se conserva sin cambios. */
var NAV_ICON_STYLE=(function(){try{return appStorage.getItem('excelia-nav-icons-v1')==='professional'?'professional':'original';}catch(e){return 'original';}})();
var NAV_ICON_PATHS={
 econ:'<path d="M4 19V5h16v14zM7 15v-3m5 3V9m5 6V7"/>',
 estudio:'<path d="M5 4v16m14-16v16M3 8h4m10 8h4M9 7h5l-2-2m2 2-2 2M15 17h-5l2-2m-2 2 2 2"/>',
 home:'<path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
 events:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-14 4h3m4 0h3m-10 4h3"/>',
 bday:'<path d="M4 13h16v7H4zM3 20h18M4 16c2 2 3-2 5 0s3-2 5 0 4-2 6 0M8 13V9m8 4V9m-4 4V7"/><path d="M8 6v.1M16 6v.1M12 4v.1"/>',
 alarm:'<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 20h4M12 2v2"/>'
};
function navIconHtml(key,style){
 if(!NAV_ICON_PATHS[key])return '';
 if((style||NAV_ICON_STYLE)==='original')return '<img src="icon-'+key+'.png" class="btn-icon" alt="">';
 return '<svg class="nav-pro-icon nav-pro-'+key+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+NAV_ICON_PATHS[key]+'</svg>';
}
function applyNavIconStyle(style){
 NAV_ICON_STYLE=style==='professional'?'professional':'original';
 var home={econ:'econBtn',estudio:'estudioBtn',home:'homeBtn',events:'eventsBtn',bday:'bdayBtn',alarm:'alarmTestBtn'};
 Object.keys(home).forEach(function(key){var el=document.getElementById(home[key]);if(el)el.innerHTML=navIconHtml(key);});
 document.querySelectorAll('.nav-bar-btn[data-nav]').forEach(function(el){if(NAV_ICON_PATHS[el.dataset.nav])el.innerHTML=navIconHtml(el.dataset.nav);});
 var value=document.getElementById('navIconStyleValue');if(value)value.textContent=NAV_ICON_STYLE==='professional'?'Profesionales':'Originales';
}
function openNavIconPicker(){
 var menu=document.getElementById('dataMenu');if(menu)menu.classList.remove('open');
 var h='<div class="ev-form-overlay" id="navIconPickerOv"><div class="ev-form-sheet nav-icon-sheet" role="dialog" aria-modal="true" aria-labelledby="navIconPickerTitle"><div class="ev-form-handle"></div>';
 h+='<div class="nav-icon-picker-head"><button class="sy-back" id="navIconPickerClose" aria-label="Cerrar">&#8592;</button><h2 id="navIconPickerTitle">Iconos de navegación</h2></div>';
 h+='<p class="nav-icon-picker-note">Prueba ambos estilos. La elección se guarda al volver atrás o tocar fuera.</p>';
 [['original','Originales','Ilustraciones con volumen y color'],['professional','Profesionales','Trazos limpios y colores por ventana']].forEach(function(option){
  var selected=NAV_ICON_STYLE===option[0];
  h+='<button class="nav-icon-choice'+(selected?' selected':'')+'" data-icon-style="'+option[0]+'" aria-pressed="'+selected+'"><span class="nav-icon-choice-head"><strong>'+option[1]+'</strong><span class="nav-icon-choice-check" aria-hidden="true">'+(selected?'&#10003;':'')+'</span></span>';
  h+='<span class="nav-icon-choice-preview" aria-hidden="true">'+Object.keys(NAV_ICON_PATHS).map(function(key){return navIconHtml(key,option[0]);}).join('')+'</span><span class="nav-icon-choice-note">'+option[2]+'</span></button>';
 });
 h+='</div></div>';
 var wrap=abrirPanel('navIconPickerWrap',h,{contenedor:document.body,overlay:'navIconPickerOv',alCerrar:closeNavIconPicker});
 wrap.querySelector('#navIconPickerClose').addEventListener('click',closeNavIconPicker);
 wrap.querySelectorAll('[data-icon-style]').forEach(function(button){button.addEventListener('click',function(){
  applyNavIconStyle(button.dataset.iconStyle);
  wrap.querySelectorAll('[data-icon-style]').forEach(function(choice){
   var selected=choice.dataset.iconStyle===NAV_ICON_STYLE;
   choice.classList.toggle('selected',selected);choice.setAttribute('aria-pressed',String(selected));
   choice.querySelector('.nav-icon-choice-check').innerHTML=selected?'&#10003;':'';
  });
 });});
}
function closeNavIconPicker(){appStorage.setItem('excelia-nav-icons-v1',NAV_ICON_STYLE);cerrarPanel('navIconPickerWrap','navIconPickerOv');}
function bindNavIconStyle(){
 applyNavIconStyle(NAV_ICON_STYLE);
 var button=document.getElementById('navIconStyle');
 if(button)button.addEventListener('click',function(e){e.stopPropagation();openNavIconPicker();});
}
