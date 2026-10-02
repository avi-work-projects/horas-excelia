/* Presentación de partidas personales. El plegado es una preferencia local,
   independiente de los importes y períodos que viajan en el backup. */
var PERSONAL_CARDS_KEY='excelia-personal-cards-v1';
var PERSONAL_CARDS_OPEN=loadPersonalCards();
function loadPersonalCards(){
  try{var data=JSON.parse(appStorage.getItem(PERSONAL_CARDS_KEY)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch(e){return {};}
}
function personalCardKey(section,item,index){return FISCAL_YEAR+'|'+section+'|'+(item.id||index);}
function personalCardOpen(section,item,index){return PERSONAL_CARDS_OPEN[personalCardKey(section,item,index)]===true;}
function setPersonalCardOpen(section,item,index,open){
  var key=personalCardKey(section,item,index);
  if(open)PERSONAL_CARDS_OPEN[key]=true;else delete PERSONAL_CARDS_OPEN[key];
}
function savePersonalCards(){appStorage.setItem(PERSONAL_CARDS_KEY,JSON.stringify(PERSONAL_CARDS_OPEN));}
function personalAdvancedCards(){
  var cards=[];
  Object.keys(PERSONAL_DATA).forEach(function(section){
    PERSONAL_DATA[section].forEach(function(item,index){if(Array.isArray(item.periods))cards.push({section:section,item:item,index:index});});
  });
  return cards;
}
function personalCardsAllOpen(){
  var cards=personalAdvancedCards();
  return cards.length>0&&cards.every(function(c){return personalCardOpen(c.section,c.item,c.index);});
}
function togglePersonalCards(){
  var open=!personalCardsAllOpen();
  personalAdvancedCards().forEach(function(c){setPersonalCardOpen(c.section,c.item,c.index,open);});
  savePersonalCards();
}
function renderPersonalCardsToggle(){
  var allOpen=personalCardsAllOpen(),label=allOpen?'Plegar todos los tramos':'Desplegar todos los tramos';
  return '<button class="personal-fold-all" id="personalFoldAll" title="'+label+'" aria-label="'+label+'"'+(personalAdvancedCards().length?'':' disabled')+'><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(allOpen?'M7 10l5-5 5 5M7 17l5-5 5 5':'M7 7l5 5 5-5M7 14l5 5 5-5')+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
}
function renderPersonalPeriods(item){
  return item.periods.map(function(p){
    return '<div class="personal-period-line'+(p.paused?' paused':'')+'"><span>'+_rutFmt(p.start)+' - '+_rutFmt(p.end)+'</span><strong>'+(p.paused?'Paralizado':fcPlain(p.amount)+personalPeriodLabel(p.period))+'</strong></div>';
  }).join('');
}
function renderPersonalCard(item,section,index,periodMode){
  var advanced=Array.isArray(item.periods),open=advanced&&personalCardOpen(section,item,index);
  var annual=personalAnnual(item,FISCAL_YEAR,section),period=item.period||(periodMode==='weekly'?'weekly':'monthly');
  var attrs=' data-ps="'+section+'" data-pi="'+index+'"';
  var h='<article class="personal-item-card'+(advanced?' has-periods':'')+'"'+attrs+'><div class="personal-item-main">';
  h+='<button class="personal-gear" type="button" data-pp-edit="'+index+'" data-ps="'+section+'" title="Configurar períodos" aria-label="Configurar períodos de '+escHtml(item.label||'esta partida')+'">⚙</button>';
  h+='<input class="fiscal-gasto-lbl-input"'+attrs+' data-pf="label" aria-label="Nombre del concepto" value="'+escHtml(item.label)+'" placeholder="Nombre…">';
  if(advanced)h+='<output class="personal-amount" title="Media ponderada">'+fcPlain(annual/personalFactor(period))+'</output>';
  else h+='<label class="personal-amount-input"><input class="fiscal-gasto-amt"'+attrs+' data-pf="amount" aria-label="Importe de '+escHtml(item.label||'esta partida')+'" type="number" min="0" step=".01" value="'+(item.amount||0)+'"><span>€</span></label>';
  h+='<button class="fiscal-gasto-del fiscal-personal-del"'+attrs+' aria-label="Eliminar '+escHtml(item.label||'partida')+'">×</button></div>';
  h+='<div class="personal-item-meta">';
  if(advanced)h+='<button type="button" class="personal-period-toggle"'+attrs+' data-pp-toggle aria-expanded="'+!!open+'">'+item.periods.length+' tramos <span aria-hidden="true">'+(open?'▴':'▾')+'</span></button><span class="personal-average">Media'+personalPeriodLabel(period)+'</span>';
  else{
    h+='<div class="fiscal-gasto-period">';
    (periodMode==='weekly'?['weekly','monthly']:['monthly','annual']).forEach(function(p){h+='<button class="fiscal-period-btn'+(period===p?' active':'')+'"'+attrs+' data-pf="period" data-val="'+p+'">'+personalPeriodLabel(p)+'</button>';});
    h+='</div>';
  }
  h+='<span class="personal-item-annual">'+fcPlain(annual)+'/año</span></div>';
  if(advanced)h+='<div class="personal-period-details"'+(open?'':' hidden')+'>'+renderPersonalPeriods(item)+'</div>';
  return h+_personalTripFilter(item,section,index)+'</article>';
}
function syncPersonalSave(){
  var footer=document.getElementById('personalSaveFooter');
  if(footer)footer.hidden=!personalHasChanges();
}
