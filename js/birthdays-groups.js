/* Categorías personales: viajan en cada cumpleaños, también al exportar. */
var BDAY_GROUP_DEFAULTS=['Amigos Oviedo','Amigos Baile','Amigos Moco','Amigos Master','Familia Cercana','Familia','Familia Celia','Amigas Celia','Amigos Carrera','Amigos En Madrid','Amigos Guadalupe','Mejores Amigos','Amigos Villa','Amigos Extranjeros','Amigos N.A.S.A','Otros'];
var BDAY_GROUP_FILTER=[];
var BDAY_SHOW_GROUPS=false; // Etiquetas visibles en la lista, solo durante esta sesión.
function bdayNormalizeGroup(name){
  name=name.trim();
  if(/^(amigos\s+)?n\.?a\.?s\.?a\.?$/i.test(name))return 'Amigos N.A.S.A';
  if(/^amigos$/i.test(name))return '';
  return name.replace(/(^|\s)(\p{L})/gu,function(_,space,letter){return space+letter.toLocaleUpperCase('es');});
}

function bdayGroups(b){return Array.from(new Set((Array.isArray(b&&b.categories)?b.categories:[]).filter(function(g){return typeof g==='string';}).map(bdayNormalizeGroup).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'es');});}
function bdayGroupCatalog(){return bdayGroups({categories:BDAY_GROUP_DEFAULTS.concat.apply(BDAY_GROUP_DEFAULTS,BDAYS.map(bdayGroups))});}
function bdayGroupTags(groups){return groups.map(function(g){var hue=0;for(var i=0;i<g.length;i++)hue=(hue*31+g.charCodeAt(i))%360;return '<span class="bday-group-tag" style="--group-hue:'+hue+'">'+escHtml(g)+'</span>';}).join('');}
function bdayGroupMatch(b){return !BDAY_GROUP_FILTER.length||BDAY_GROUP_FILTER.some(function(g){return g==='__none'?bdayGroups(b).length===0:bdayGroups(b).indexOf(g)>=0;});}
function bdayGroupChips(groups,selected,attr){return groups.map(function(g){return '<label class="bday-group-chip"><input type="checkbox" '+attr+'="'+escHtml(g)+'"'+(selected.indexOf(g)>=0?' checked':'')+'><span>'+escHtml(g)+'</span></label>';}).join('');}
function renderBdayGroupTools(){
  var options=bdayGroupCatalog().concat(['__none']).map(function(g){
    var count=BDAYS.filter(function(b){return g==='__none'?!bdayGroups(b).length:bdayGroups(b).indexOf(g)>=0;}).length;
    return '<label class="bday-group-chip"><input type="checkbox" data-bd-filter="'+escHtml(g)+'"'+(BDAY_GROUP_FILTER.indexOf(g)>=0?' checked':'')+'><span>'+escHtml(g==='__none'?'Sin categoría':g)+'</span><small>'+count+'</small></label>';
  }).join('');
  return '<div class="bday-group-tools"><details><summary>Filtrar por categoría <span id="bdGroupSummary">'+bdayGroupFilterLabel()+'</span></summary><p>Elige una o varias categorías. Se incluyen las personas de cualquiera de ellas.</p><div class="bday-group-chips">'+options+'</div></details><div class="bday-filter-status"><span id="bdGroupResults" role="status" aria-live="polite"></span><button class="ev-btn" id="bdClearGroups"'+(!BDAY_GROUP_FILTER.length?' disabled':'')+'>Limpiar categorías</button></div><div id="bdGroupActive" class="bday-group-chips"></div><p id="bdGroupEmpty" hidden>No hay personas que coincidan. Cambia las categorías o la búsqueda.</p></div>';
}
function bdayGroupFilterLabel(){return BDAY_GROUP_FILTER.length?BDAY_GROUP_FILTER.length+' seleccionada'+(BDAY_GROUP_FILTER.length===1?'':'s'):'Todas';}
function renderBdayGroupPickerFields(b){return '<fieldset class="bday-group-fields"><legend>Categorías de esta persona</legend><p>Puedes seleccionar varias etiquetas.</p><div class="bday-group-chips">'+bdayGroupChips(bdayGroups({categories:bdayGroupCatalog().concat(bdayGroups(b))}),bdayGroups(b),'data-bd-category')+'</div><label>Nueva categoría<input class="ev-input" id="bdFNewCategory" maxlength="60" placeholder="Escribe una etiqueta nueva"></label></fieldset>';}
function renderBdayGroupFields(b){return '<button type="button" class="ev-btn bday-category-button" id="bdCategories" data-groups="'+escHtml(JSON.stringify(bdayGroups(b)))+'">Categorías · '+bdayGroups(b).length+' <span aria-hidden="true">›</span></button>';}
function renderBdayPersonGroups(b){return renderBdayGroupFields(b);}
function bindBdayCategoryButton(root,onSave){
  var button=root.querySelector('#bdCategories');
  button.onclick=function(){openBdayCategoryPicker(JSON.parse(button.dataset.groups),function(groups){button.dataset.groups=JSON.stringify(groups);button.innerHTML='Categorías · '+groups.length+' <span aria-hidden="true">›</span>';if(onSave)onSave(groups);});};
}
function openBdayCategoryPicker(groups,onSave){
  function close(){cerrarPanel('bdCategoryWrap','bdCategoryOv');}
  var html='<div class="bd-form-overlay" id="bdCategoryOv"><div class="bd-form-sheet"><button class="sy-back" id="bdCategoryClose" aria-label="Volver">←</button><h2>Categorías</h2>'+renderBdayGroupPickerFields({categories:groups})+'<button class="ev-btn primary" id="bdCategorySave">Guardar categorías</button></div></div>';
  var wrap=abrirPanel('bdCategoryWrap',html,{contenedor:bdayPanelHost(),overlay:'bdCategoryOv',alCerrar:close});
  wrap.querySelector('#bdCategoryClose').onclick=close;
  wrap.querySelector('#bdCategorySave').onclick=function(){onSave(bdayReadGroupFields(wrap));close();};
}
function bdayReadGroupFields(root){var button=root.querySelector('#bdCategories');if(button)return JSON.parse(button.dataset.groups);var groups=Array.from(root.querySelectorAll('[data-bd-category]:checked')).map(function(x){return x.dataset.bdCategory;});var input=root.querySelector('#bdFNewCategory'),name=input&&input.value.trim();if(name){name=bdayGroupCatalog().find(function(g){return g.toLowerCase()===name.toLowerCase();})||name;if(groups.indexOf(name)<0)groups.push(name);}return bdayGroups({categories:groups});}
function updateBdayGroupStatus(count){
  var summary=document.getElementById('bdGroupSummary'),results=document.getElementById('bdGroupResults'),empty=document.getElementById('bdGroupEmpty'),clear=document.getElementById('bdClearGroups'),active=document.getElementById('bdGroupActive');
  if(summary)summary.textContent=bdayGroupFilterLabel();
  if(results)results.textContent=count+' de '+BDAYS.length+' personas';
  if(empty)empty.hidden=count>0;
  if(clear)clear.disabled=!BDAY_GROUP_FILTER.length;
  if(active){
    active.innerHTML=BDAY_GROUP_FILTER.map(function(g){var label=g==='__none'?'Sin categoría':g;return '<button class="bday-group-tag" data-bd-remove="'+escHtml(g)+'" aria-label="Quitar filtro '+escHtml(label)+'">'+escHtml(label)+' ×</button>';}).join('');
    active.querySelectorAll('[data-bd-remove]').forEach(function(button){button.onclick=function(){BDAY_GROUP_FILTER=BDAY_GROUP_FILTER.filter(function(g){return g!==button.dataset.bdRemove;});bindBdayGroupTools();applyBdaySearch(BDAY_SEARCH.toLowerCase());document.querySelector('.bday-group-tools summary').focus();};});
  }
}
function bindBdayGroupTools(){
  document.querySelectorAll('[data-bd-filter]').forEach(function(box){box.checked=BDAY_GROUP_FILTER.indexOf(box.dataset.bdFilter)>=0;box.onchange=function(){BDAY_GROUP_FILTER=Array.from(document.querySelectorAll('[data-bd-filter]:checked')).map(function(x){return x.dataset.bdFilter;});applyBdaySearch(BDAY_SEARCH.toLowerCase());};});
  var clear=document.getElementById('bdClearGroups');if(clear)clear.onclick=function(){BDAY_GROUP_FILTER=[];bindBdayGroupTools();applyBdaySearch(BDAY_SEARCH.toLowerCase());};
}
function bdaySaveGroupDraft(draft){
  var next=BDAYS.map(function(b,i){return Object.assign({},b,{categories:(draft[i]||[]).slice()});});
  appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(next));BDAYS=next;
}
