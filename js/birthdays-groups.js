/* Categorías personales: viajan en cada cumpleaños, también al exportar. */
var BDAY_GROUP_DEFAULTS=['Amigos Oviedo','Amigos Baile','Amigos Moco','Amigos Master','Familia Cercana','Familia','Familia Celia','Amigas Celia','Amigos Carrera','Amigos En Madrid','Amigos Guadalupe','Mejores Amigos','Amigos Villa','Amigos Extranjeros','Amigos N.A.S.A','Otros'];
var BDAY_GROUP_FILTER=[];
var BDAY_EDIT_GROUP=''; // Etiqueta en edición; vacío fuera de la edición.
var BDAY_GROUP_PENDING=null; // Borrador de etiquetas por persona hasta pulsar Listo.
var BDAY_SHOW_GROUPS=false; // Etiquetas visibles en la lista, solo durante esta sesión.
function bdayNormalizeGroup(name){
  name=name.trim();
  if(/^(amigos\s+)?n\.?a\.?s\.?a\.?$/i.test(name))return 'Amigos N.A.S.A';
  if(/^amigos$/i.test(name))return '';
  return name.replace(/(^|\s)(\p{L})/gu,function(_,space,letter){return space+letter.toLocaleUpperCase('es');});
}

function bdayGroups(b){return Array.from(new Set((Array.isArray(b&&b.categories)?b.categories:[]).filter(function(g){return typeof g==='string';}).map(bdayNormalizeGroup).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'es');});}
function bdayGroupCatalog(){return bdayGroups({categories:BDAY_GROUP_DEFAULTS.concat.apply(BDAY_GROUP_DEFAULTS,BDAYS.map(bdayGroups))});}
// Progresión cálida → verde → azul → rosa, siguiendo el catálogo alfabético.
function bdayGroupHue(g){var groups=bdayGroupCatalog(),index=groups.indexOf(g);return index<0?324:Math.round(24+300*index/Math.max(1,groups.length-1));}
function bdayGroupTags(groups){return groups.map(function(g){var hue=bdayGroupHue(g);return '<span class="bday-group-tag" style="--group-hue:'+hue+'">'+escHtml(g)+'</span>';}).join('');}
function bdayGroupMatch(b){return !BDAY_GROUP_FILTER.length||BDAY_GROUP_FILTER.some(function(g){return g==='__none'?bdayGroups(b).length===0:bdayGroups(b).indexOf(g)>=0;});}
function bdayGroupChips(groups,selected,attr){return groups.map(function(g){return '<button type="button" class="bday-group-chip" style="--group-hue:'+bdayGroupHue(g)+'" '+attr+'="'+escHtml(g)+'" aria-pressed="'+(selected.indexOf(g)>=0)+'">'+escHtml(g)+'</button>';}).join('');}
function renderBdayGroupTools(){
  var options=bdayGroupCatalog().concat(['__none']).map(function(g){
    var count=BDAYS.filter(function(b){return g==='__none'?!bdayGroups(b).length:bdayGroups(b).indexOf(g)>=0;}).length;
    return '<button type="button" class="bday-group-chip" style="--group-hue:'+bdayGroupHue(g)+'" data-bd-filter="'+escHtml(g)+'" aria-pressed="'+(BDAY_GROUP_FILTER.indexOf(g)>=0)+'"><span>'+escHtml(g==='__none'?'Sin categoría':g)+'</span><small>'+count+'</small></button>';
  }).join('');
  var search='<div class="bday-buscar-bar"><div class="bday-search-wrap"><input class="bday-search-input" id="bdSearch" type="text" aria-label="Buscar persona" placeholder="Buscar persona…" value="'+escHtml(BDAY_SEARCH)+'"></div></div>';
  return '<div class="bday-group-tools">'+search+'<details><summary aria-label="Filtrar por categoría">Categorías <span id="bdGroupSummary">'+bdayGroupFilterLabel()+'</span></summary><div class="bday-filter-options"><p>Elige una o varias categorías. Se incluyen las personas de cualquiera de ellas.</p><div class="bday-group-chips">'+options+'</div></div></details><div class="bday-filter-status"><span id="bdGroupResults" role="status" aria-live="polite"></span><button class="ev-btn" id="bdClearGroups"'+(!BDAY_GROUP_FILTER.length?' disabled':'')+'>Limpiar categorías</button></div><div id="bdGroupActive" class="bday-group-chips"></div><p id="bdGroupEmpty" hidden>No hay personas que coincidan. Cambia las categorías o la búsqueda.</p></div>';
}
function bdayGroupFilterLabel(){return BDAY_GROUP_FILTER.length?'('+BDAY_GROUP_FILTER.length+')':'';}
function renderBdayGroupPickerFields(b){return '<fieldset class="bday-group-fields"><legend>Categorías de esta persona</legend><p>Puedes seleccionar varias etiquetas.</p><div class="bday-group-chips">'+bdayGroupChips(bdayGroups({categories:bdayGroupCatalog().concat(bdayGroups(b))}),bdayGroups(b),'data-bd-category')+'</div><label>Nueva categoría<input class="ev-input" id="bdFNewCategory" maxlength="60" placeholder="Escribe una etiqueta nueva"></label></fieldset>';}
function renderBdayGroupFields(b){return '<section class="bday-detail-groups"><div class="bday-category-heading"><h3>Categorías</h3><button type="button" class="action-edit boda-mini-btn boda-cl-edit bday-category-button" id="bdCategories" aria-label="Editar categorías" data-groups="'+escHtml(JSON.stringify(bdayGroups(b)))+'">'+editPencilHtml()+'</button></div><div class="bday-person-groups" id="bdPersonGroups">'+(bdayGroups(b).length?bdayGroupTags(bdayGroups(b)):'<span class="bday-no-category">Sin categoría</span>')+'</div></section>';}
function renderBdayPersonGroups(b){return renderBdayGroupFields(b);}
function bindBdayCategoryButton(root,onSave){
  var button=root.querySelector('#bdCategories');
  button.onclick=function(){openBdayCategoryPicker(JSON.parse(button.dataset.groups),function(groups){button.dataset.groups=JSON.stringify(groups);root.querySelector('#bdPersonGroups').innerHTML=groups.length?bdayGroupTags(groups):'<span class="bday-no-category">Sin categoría</span>';if(onSave)onSave(groups);});};
}
function openBdayCategoryPicker(groups,onSave){
  function close(){cerrarPanel('bdCategoryWrap','bdCategoryOv');}
  var html='<div class="bd-form-overlay" id="bdCategoryOv"><div class="bd-form-sheet bd-category-sheet"><header class="bd-panel-header"><button class="sy-back" id="bdCategoryClose" aria-label="Volver">←</button><h2>Categorías</h2></header><div class="bd-panel-body">'+renderBdayGroupPickerFields({categories:groups})+'</div><footer class="bd-panel-footer"><button class="ev-btn primary" id="bdCategorySave">Guardar categorías</button></footer></div></div>';
  var wrap=abrirPanel('bdCategoryWrap',html,{contenedor:bdayPanelHost(),overlay:'bdCategoryOv',alCerrar:close});
  wrap.querySelectorAll('[data-bd-category]').forEach(function(button){button.onclick=function(){button.setAttribute('aria-pressed',button.getAttribute('aria-pressed')!=='true');};});
  wrap.querySelector('#bdCategoryClose').onclick=close;
  wrap.querySelector('#bdCategorySave').onclick=function(){onSave(bdayReadGroupFields(wrap));close();};
}
function bdayReadGroupFields(root){var button=root.querySelector('#bdCategories');if(button)return JSON.parse(button.dataset.groups);var groups=Array.from(root.querySelectorAll('[data-bd-category][aria-pressed="true"]')).map(function(x){return x.dataset.bdCategory;});var input=root.querySelector('#bdFNewCategory'),name=input&&input.value.trim();if(name){name=bdayGroupCatalog().find(function(g){return g.toLowerCase()===name.toLowerCase();})||name;if(groups.indexOf(name)<0)groups.push(name);}return bdayGroups({categories:groups});}
function updateBdayGroupStatus(count){
  var summary=document.getElementById('bdGroupSummary'),results=document.getElementById('bdGroupResults'),empty=document.getElementById('bdGroupEmpty'),clear=document.getElementById('bdClearGroups'),active=document.getElementById('bdGroupActive');
  if(summary)summary.textContent=bdayGroupFilterLabel();
  if(results)results.textContent=count+' de '+BDAYS.length+' personas';
  if(empty)empty.hidden=count>0;
  if(clear)clear.disabled=!BDAY_GROUP_FILTER.length;
  if(active){
    active.innerHTML=BDAY_GROUP_FILTER.map(function(g){var label=g==='__none'?'Sin categoría':g;return '<button class="bday-group-tag" style="--group-hue:'+bdayGroupHue(g)+'" data-bd-remove="'+escHtml(g)+'" aria-label="Quitar filtro '+escHtml(label)+'">'+escHtml(label)+' ×</button>';}).join('');
    active.querySelectorAll('[data-bd-remove]').forEach(function(button){button.onclick=function(){BDAY_GROUP_FILTER=BDAY_GROUP_FILTER.filter(function(g){return g!==button.dataset.bdRemove;});bindBdayGroupTools();applyBdaySearch(BDAY_SEARCH.toLowerCase());document.querySelector('.bday-group-tools summary').focus();};});
  }
}
function bindBdayGroupTools(){
  document.querySelectorAll('[data-bd-filter]').forEach(function(button){
    button.setAttribute('aria-pressed',BDAY_GROUP_FILTER.indexOf(button.dataset.bdFilter)>=0);
    button.onclick=function(){var group=button.dataset.bdFilter,index=BDAY_GROUP_FILTER.indexOf(group);if(index<0)BDAY_GROUP_FILTER.push(group);else BDAY_GROUP_FILTER.splice(index,1);button.setAttribute('aria-pressed',index<0);applyBdaySearch(BDAY_SEARCH.toLowerCase());};
  });
  var clear=document.getElementById('bdClearGroups');if(clear)clear.onclick=function(){BDAY_GROUP_FILTER=[];bindBdayGroupTools();applyBdaySearch(BDAY_SEARCH.toLowerCase());};
}
function bdaySaveGroupDraft(draft){
  var next=BDAYS.map(function(b,i){return Object.assign({},b,{categories:(draft[i]||[]).slice()});});
  appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(next));BDAYS=next;
}

// Edición por etiqueta: borrador por persona, confirmado solo al pulsar Listo.
function cancelBdayGroupEdit(){BDAY_EDIT_GROUP='';BDAY_GROUP_PENDING=null;}
function openBdayGroupEdit(){
  function close(){cerrarPanel('bdGroupEditWrap','bdGroupEditOv');}
  var html='<div class="bd-form-overlay" id="bdGroupEditOv"><div class="bd-form-sheet bd-category-sheet"><header class="bd-panel-header"><button class="sy-back" id="bdGroupEditClose" aria-label="Volver">←</button><h2>Editar etiquetas</h2></header><div class="bd-panel-body"><p>Elige la etiqueta que quieres asignar o quitar.</p><div class="bday-group-chips">'+bdayGroupChips(bdayGroupCatalog(),[],'data-bd-edit-group')+'</div></div></div></div>';
  var wrap=abrirPanel('bdGroupEditWrap',html,{contenedor:bdayPanelHost(),overlay:'bdGroupEditOv',alCerrar:close});
  wrap.querySelector('#bdGroupEditClose').onclick=close;
  wrap.querySelectorAll('[data-bd-edit-group]').forEach(function(button){button.onclick=function(){
    BDAY_EDIT_GROUP=button.dataset.bdEditGroup;BDAY_GROUP_PENDING=BDAYS.map(bdayGroups);
    BDAY_FILTER_VIP='all';BDAY_GROUP_FILTER=[];BDAY_SEARCH='';close();refreshBday();
  };});
}
function bindBdayGroupEdit(){
  var button=document.getElementById('bdEditGroups');
  if(button)button.onclick=function(){
    if(!BDAY_EDIT_GROUP){openBdayGroupEdit();return;}
    try{bdaySaveGroupDraft(BDAY_GROUP_PENDING);}catch(e){showToast('No se pudieron guardar las etiquetas','error');return;}
    cancelBdayGroupEdit();refreshBday();
  };
}
function toggleBdayGroupPerson(item,index){
  var groups=BDAY_GROUP_PENDING[index],pos=groups.indexOf(BDAY_EDIT_GROUP);
  if(pos<0)groups.push(BDAY_EDIT_GROUP);else groups.splice(pos,1);
  item.classList.toggle('bday-list-vip-active',pos<0);item.classList.toggle('bday-list-vip-dim',pos>=0);
  var tags=item.querySelector('.bday-person-groups');if(tags)tags.innerHTML=bdayGroupTags(groups);
}
