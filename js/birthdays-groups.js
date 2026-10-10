/* Categorías personales: viajan en cada cumpleaños, también al exportar. */
var BDAY_GROUP_DEFAULTS=['Amigos Oviedo','Amigos baile','Amigos Moco','Amigos master','Familia cercana','Familia','Familia Celia','Amigas Celia','Amigos Carrera','Amigos en Madrid','Amigos Guadalupe','Mejores amigos','Amigos Villa','Amigos','Amigos extranjeros','N.A.S.A.','Otros'];
var BDAY_GROUP_FILTER=[];
function bdayGroups(b){return Array.isArray(b&&b.categories)?b.categories.filter(function(x){return typeof x==='string'&&x.trim();}):[];}
function bdayGroupCatalog(){var out=BDAY_GROUP_DEFAULTS.slice();BDAYS.forEach(function(b){bdayGroups(b).forEach(function(g){if(out.indexOf(g)<0)out.push(g);});});return out;}
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
function renderBdayGroupFields(b){return '<fieldset class="bday-group-fields"><legend>Categorías de esta persona</legend><p>Puedes seleccionar varias etiquetas.</p><div class="bday-group-chips">'+bdayGroupChips(bdayGroupCatalog(),bdayGroups(b),'data-bd-category')+'</div><label>Nueva categoría<input class="ev-input" id="bdFNewCategory" maxlength="60" placeholder="Escribe una etiqueta nueva"></label></fieldset>';}
function renderBdayPersonGroups(b){
  var groups=bdayGroups(b);
  return '<section class="bday-detail-groups"><h3>Categorías</h3><div class="bday-group-chips">'+(groups.length?groups.map(function(g){return '<span class="bday-group-tag">'+escHtml(g)+'</span>';}).join(''):'<span class="bday-person-groups">Sin categoría</span>')+'</div></section>';
}
function bdayReadGroupFields(root){var groups=Array.from(root.querySelectorAll('[data-bd-category]:checked')).map(function(x){return x.dataset.bdCategory;});var input=root.querySelector('#bdFNewCategory'),name=input&&input.value.trim();if(name){name=bdayGroupCatalog().find(function(g){return g.toLowerCase()===name.toLowerCase();})||name;if(groups.indexOf(name)<0)groups.push(name);}return groups;}
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
