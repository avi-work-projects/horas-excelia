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
function navIconHtml(key){
 if(!NAV_ICON_PATHS[key])return '';
 if(NAV_ICON_STYLE==='original')return '<img src="icon-'+key+'.png" class="btn-icon" alt="">';
 return '<svg class="nav-pro-icon nav-pro-'+key+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+NAV_ICON_PATHS[key]+'</svg>';
}
function applyNavIconStyle(style){
 NAV_ICON_STYLE=style==='professional'?'professional':'original';
 var home={econ:'econBtn',estudio:'estudioBtn',home:'homeBtn',events:'eventsBtn',bday:'bdayBtn',alarm:'alarmTestBtn'};
 Object.keys(home).forEach(function(key){var el=document.getElementById(home[key]);if(el)el.innerHTML=navIconHtml(key);});
 document.querySelectorAll('.nav-bar-btn[data-nav]').forEach(function(el){if(NAV_ICON_PATHS[el.dataset.nav])el.innerHTML=navIconHtml(el.dataset.nav);});
 var select=document.getElementById('navIconStyle');if(select)select.value=NAV_ICON_STYLE;
}
function bindNavIconStyle(){
 applyNavIconStyle(NAV_ICON_STYLE);
 var select=document.getElementById('navIconStyle');
 if(select)select.addEventListener('change',function(){appStorage.setItem('excelia-nav-icons-v1',select.value);applyNavIconStyle(select.value);});
}
