/* Categorías personales: viajan en cada cumpleaños, también al exportar. */
var BDAY_GROUP_DEFAULTS=['Amigos Oviedo','Amigos baile','Amigos Moco','Amigos master','Familia cercana','Familia','Familia Celia','Amigas Celia','Amigos Carrera','Amigos en Madrid','Amigos Guadalupe','Mejores amigos','Amigos Villa','Amigos','Amigos extranjeros','Otros'];
var BDAY_GROUP_FILTER=[];
function bdayGroups(b){return Array.isArray(b&&b.categories)?b.categories.filter(function(x){return typeof x==='string'&&x.trim();}):[];}
function bdayGroupCatalog(){var out=BDAY_GROUP_DEFAULTS.slice();BDAYS.forEach(function(b){bdayGroups(b).forEach(function(g){if(out.indexOf(g)<0)out.push(g);});});return out;}
function bdayGroupMatch(b){return !BDAY_GROUP_FILTER.length||BDAY_GROUP_FILTER.some(function(g){return g==='__none'?bdayGroups(b).length===0:bdayGroups(b).indexOf(g)>=0;});}
function bdayGroupChips(groups,selected,attr){return groups.map(function(g){return '<label class="bday-group-chip"><input type="checkbox" '+attr+'="'+escHtml(g)+'"'+(selected.indexOf(g)>=0?' checked':'')+'><span>'+escHtml(g)+'</span></label>';}).join('');}
function renderBdayGroupTools(){return '<div class="bday-group-tools"><button class="ev-btn" id="bdClassify">Clasificar personas</button><details><summary>Categorías'+(BDAY_GROUP_FILTER.length?' · '+BDAY_GROUP_FILTER.length:'')+'</summary><p>Se muestran personas de cualquiera de las categorías marcadas.</p><div class="bday-group-chips">'+bdayGroupChips(bdayGroupCatalog(),BDAY_GROUP_FILTER,'data-bd-filter')+'<label class="bday-group-chip"><input type="checkbox" data-bd-filter="__none"'+(BDAY_GROUP_FILTER.indexOf('__none')>=0?' checked':'')+'><span>Sin clasificar</span></label></div><button class="ev-btn" id="bdClearGroups">Ver todas</button></details></div>';}
function renderBdayGroupFields(b){return '<details class="bday-group-fields"><summary>Categorías · '+bdayGroups(b).length+'</summary><div class="bday-group-chips">'+bdayGroupChips(bdayGroupCatalog(),bdayGroups(b),'data-bd-category')+'</div><label>Nueva categoría<input class="ev-input" id="bdFNewCategory" maxlength="60" placeholder="Opcional"></label></details>';}
function bdayReadGroupFields(root){var groups=Array.from(root.querySelectorAll('[data-bd-category]:checked')).map(function(x){return x.dataset.bdCategory;});var input=root.querySelector('#bdFNewCategory'),name=input&&input.value.trim();if(name){name=bdayGroupCatalog().find(function(g){return g.toLowerCase()===name.toLowerCase();})||name;if(groups.indexOf(name)<0)groups.push(name);}return groups;}
function bindBdayGroupTools(){
  var button=document.getElementById('bdClassify');if(button)button.onclick=openBdayClassifier;
  document.querySelectorAll('[data-bd-filter]').forEach(function(box){box.onchange=function(){BDAY_GROUP_FILTER=Array.from(document.querySelectorAll('[data-bd-filter]:checked')).map(function(x){return x.dataset.bdFilter;});applyBdaySearch(BDAY_SEARCH.toLowerCase());};});
  var clear=document.getElementById('bdClearGroups');if(clear)clear.onclick=function(){BDAY_GROUP_FILTER=[];document.querySelectorAll('[data-bd-filter]').forEach(function(x){x.checked=false;});applyBdaySearch(BDAY_SEARCH.toLowerCase());};
}
function bdaySaveGroupDraft(draft){
  var next=BDAYS.map(function(b,i){return Object.assign({},b,{categories:(draft[i]||[]).slice()});});
  appStorage.setItem(BDAY_STORAGE_KEY,JSON.stringify(next));BDAYS=next;
}
function openBdayClassifier(){
  var groups=bdayGroupCatalog(),active=groups[0],draft=BDAYS.map(function(b){return bdayGroups(b).slice();});
  var h='<div class="ev-detail-overlay" id="bdGroupsOv"><div class="bday-classifier"><header><h2>Clasificar personas</h2><button class="sy-back" id="bdGroupsClose" aria-label="Cerrar clasificación">×</button></header><p>Elige una categoría y marca sus personas. Puedes cambiar de categoría antes de guardar; una persona puede pertenecer a varias.</p><div class="bday-group-chips" id="bdGroupsTabs"></div><div class="bday-group-new"><input class="ev-input" id="bdGroupNew" maxlength="60" placeholder="Nueva categoría" aria-label="Nueva categoría"><button class="ev-btn" id="bdGroupCreate">Añadir</button></div><input class="ev-input" id="bdGroupSearch" placeholder="Buscar persona" aria-label="Buscar persona para clasificar"><label class="bday-group-unassigned"><input type="checkbox" id="bdGroupUnassigned"> Solo personas sin clasificar</label><div id="bdGroupPeople" class="bday-group-people"></div><footer><span id="bdGroupCount" aria-live="polite"></span><button class="ev-btn primary" id="bdGroupsSave">Guardar clasificación</button></footer></div></div>';
  function close(){cerrarPanel('bdGroupsWrap','bdGroupsOv');}
  var wrap=abrirPanel('bdGroupsWrap',h,{contenedor:bdayPanelHost(),overlay:'bdGroupsOv',alCerrar:close});
  function renderTabs(){wrap.querySelector('#bdGroupsTabs').innerHTML=groups.map(function(g,i){return '<button class="ev-btn" data-group-index="'+i+'" aria-pressed="'+(g===active)+'">'+escHtml(g)+'</button>';}).join('');wrap.querySelectorAll('[data-group-index]').forEach(function(b){b.onclick=function(){active=groups[+b.dataset.groupIndex];renderTabs();renderPeople();};});}
  function renderPeople(){
    var q=wrap.querySelector('#bdGroupSearch').value.trim().toLowerCase(),only=wrap.querySelector('#bdGroupUnassigned').checked;
    var people=BDAYS.map(function(b,i){return {b:b,i:i};}).filter(function(x){return x.b.name.toLowerCase().indexOf(q)>=0&&(!only||!draft[x.i].length);}).sort(function(a,b){return a.b.name.localeCompare(b.b.name,'es');});
    wrap.querySelector('#bdGroupPeople').innerHTML=people.length?people.map(function(x){return '<label class="bday-group-person"><input type="checkbox" data-person="'+x.i+'"'+(draft[x.i].indexOf(active)>=0?' checked':'')+'><span>'+bdName(x.b.name)+'<small>'+x.b.day+'/'+x.b.month+' · '+(draft[x.i].length?draft[x.i].map(escHtml).join(', '):'Sin clasificar')+'</small></span></label>';}).join(''):'<p>No hay personas con estos filtros.</p>';
    var count=draft.filter(function(g){return g.indexOf(active)>=0;}).length;wrap.querySelector('#bdGroupCount').textContent=active+' · '+count+(count===1?' persona':' personas');
    wrap.querySelectorAll('[data-person]').forEach(function(box){box.onchange=function(){var list=draft[+box.dataset.person],at=list.indexOf(active);if(box.checked&&at<0)list.push(active);if(!box.checked&&at>=0)list.splice(at,1);renderPeople();};});
  }
  wrap.querySelector('#bdGroupsClose').onclick=close;
  wrap.querySelector('#bdGroupSearch').oninput=renderPeople;
  wrap.querySelector('#bdGroupUnassigned').onchange=renderPeople;
  wrap.querySelector('#bdGroupCreate').onclick=function(){var input=wrap.querySelector('#bdGroupNew'),name=input.value.trim();if(!name)return;active=groups.find(function(g){return g.toLowerCase()===name.toLowerCase();})||name;if(groups.indexOf(active)<0)groups.push(active);input.value='';renderTabs();renderPeople();};
  wrap.querySelector('#bdGroupsSave').onclick=function(){try{bdaySaveGroupDraft(draft);close();refreshBday();showToast('Clasificación guardada','success');}catch(e){showToast('No se pudo guardar la clasificación','error');}};
  renderTabs();renderPeople();
}
