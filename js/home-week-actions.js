/* Acciones locales: editar no cancela ni modifica ningún correo de Outlook. */
var HOME_WEEK_ACTIONS=Object.create(null),HOME_WEEK_EDIT_STATE=Object.create(null);
var HOME_EDIT_CONFIRM_KEY='excelia-home-edit-confirm-v1',HOME_EDIT_CONFIRMED_AT=0;
function homeWeekEditState(key){
  var state=hoursWeekState(key);
  if(state==='sent'||!hoursRemoteConfigured()&&SW[key])return 'sent';
  return state==='scheduled'||state==='changed'?'scheduled':'pending';
}
function homeConfirmWeekEdit(key){
  var state=homeWeekEditState(key);
  if(state==='pending')return true;
  if(homeWeekUnlocked(key)&&HOME_WEEK_EDIT_STATE[key]===state)return true;
  var text=state==='sent'
    ?'Esta semana ya está enviada y no se puede modificar su correo. ¿Estás seguro de que deseas editar los días y horas de todos modos?'
    :'Esta semana ya tiene programado su envío. ¿Deseas continuar? Recuerda que después deberás modificar el correo programado.';
  if(!window.confirm(text))return false;
  HOURS_WEEK_UNLOCKED[key]=true;HOME_WEEK_EDIT_STATE[key]=state;return true;
}
function homeWeekActionsButton(label,icon,style,action){
  var button=document.createElement('button');button.type='button';button.className='action-btn '+style;
  button.innerHTML=icon+'<span>'+label+'</span>';
  button.onclick=function(e){e.stopPropagation();action();};return button;
}
function renderHomeWeekActions(card,key){
  var section=card.querySelector('.week-actions');
  if(!section){section=document.createElement('div');card.appendChild(section);}
  section.className='week-actions home-week-actions';section.replaceChildren();
  var covered=homeWeekCovered(key),expanded=covered&&HOME_WEEK_ACTIONS[key];
  var mail='<svg class="week-action-icon mail-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M3 4h18a1 1 0 0 1 1 1v.5L12 12 2 5.5V5a1 1 0 0 1 1-1Zm-1 4 9.45 6.14a1 1 0 0 0 1.1 0L22 8v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z"/></svg>';
  if(!covered||expanded)section.appendChild(homeWeekActionsButton('Enviar a Outlook',mail,'send',function(){sendManualEmail(key);}));
  if(!covered)return;
  if(!expanded){
    var more=homeWeekActionsButton('Acciones','<svg class="week-action-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>','home-week-more',function(){HOME_WEEK_ACTIONS[key]=true;renderHomeWeekActions(card,key);card.querySelector('.week-actions button').focus();});
    more.setAttribute('aria-expanded','false');section.appendChild(more);return;
  }
  section.classList.add('expanded');section.setAttribute('aria-label','Acciones de la semana');
  section.appendChild(homeWeekActionsButton('Editar horas',editPencilHtml(),'home-week-edit',function(){
    if(!homeConfirmWeekEdit(key))return;
    HOURS_WEEK_UNLOCKED[key]=true;HOME_WEEK_ACTIONS[key]=false;render();
    showToast('Selecciona un día de la semana para editarlo.','info');
  }));
  section.appendChild(homeWeekActionsButton('Cancelar',prohibitionIconHtml(),'home-week-cancel',function(){
    HOME_WEEK_ACTIONS[key]=false;HOURS_WEEK_UNLOCKED[key]=false;delete HOME_WEEK_EDIT_STATE[key];render();
    var button=document.querySelector('.week-card[data-week="'+key+'"] .home-week-more');if(button)button.focus();
  }));
}
function homeDayChangeLabel(type,hours){return type==='normal'?String(hours).replace('.',',')+(hours===1?' hora trabajada':' horas trabajadas'):({vacaciones:'vacaciones',festivo:'festivo',ausencia:'ausencia'}[type]||type);}
function homeConfirmDayChange(date,type,hours){
  var previous=dayT(date),before=dayH(date);
  if(previous===type&&(type!=='normal'||before===hours))return true;
  var monday=ad(date,-((date.getDay()+6)%7)),key=dk(monday);
  if(homeWeekEditState(key)!=='pending')return homeConfirmWeekEdit(key);
  var at=HOME_EDIT_CONFIRMED_AT,now=Date.now();
  try{at=Number(sessionStorage.getItem(HOME_EDIT_CONFIRM_KEY))||at;}catch(e){}
  if(at>0&&at<=now&&now-at<20*60*1000)return true;
  if(!window.confirm('¿Estás seguro de que deseas pasar el '+fd(date)+' de '+homeDayChangeLabel(previous,before)+' a '+homeDayChangeLabel(type,hours)+'?'))return false;
  HOME_EDIT_CONFIRMED_AT=now;try{sessionStorage.setItem(HOME_EDIT_CONFIRM_KEY,String(now));}catch(e){}
  return true;
}
function setHomeDayHours(hours){
  if(!ED||dayT(ED)!=='normal'||![6.5,7,8,9].includes(hours))return;
  if(!homeConfirmDayChange(ED,'normal',hours))return;
  ST[dk(ED)]={hours:hours};save();render();closeSheet();
}
