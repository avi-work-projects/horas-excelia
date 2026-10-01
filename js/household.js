/* Ventana independiente. Reutiliza datos y fichas de hipoteca/suministros;
   Fiscal las presenta en consulta y este host concentra la edición. */
var HOUSEHOLD_RETURN=null;
function householdHost(){return document.getElementById(FISCAL_ENTRY==='household'?'householdOverlay':'fiscalOverlay');}
function renderHouseholdContent(){
  return renderNavBar('household')+'<div class="sy-header with-tabs household-header"><button class="sy-back" id="householdBack" aria-label="Volver">←</button><h1>Gastos del hogar</h1></div><div class="sy-body household-body">'+renderFiscalTabDespacho(true)+'</div>';
}
function openHousehold(tab,fromFiscal){
  HOUSEHOLD_RETURN=fromFiscal?{year:FISCAL_YEAR}:null;
  if(!fromFiscal)FISCAL_YEAR=CY;
  FISCAL_ENTRY='household';FISCAL_HIP_EDITING=null;FISCAL_ELECT_EDITING=false;FISCAL_GAS_EDITING=null;
  FISCAL_HIP_SUB=householdTab(typeof tab==='string'?tab:appStorage.getItem(HOUSEHOLD_TAB_KEY));
  setHouseholdTab(FISCAL_HIP_SUB);loadDespacho();
  var fiscal=document.getElementById('fiscalOverlay');fiscal.classList.remove('open');fiscal.style.display='none';
  document.getElementById('fiscalContent').innerHTML='';
  var ov=document.getElementById('householdOverlay');
  document.getElementById('householdContent').innerHTML=renderHouseholdContent();ov.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');bindHousehold();});});
  NAV_BACK=closeHousehold;tasksDock();
}
function closeHousehold(){
  var back=HOUSEHOLD_RETURN;HOUSEHOLD_RETURN=null;
  var ov=document.getElementById('householdOverlay');ov.classList.remove('open');
  setTimeout(function(){if(!ov.classList.contains('open'))ov.style.display='none';},320);
  NAV_BACK=null;
  if(back){FISCAL_TAB='despacho';openFiscal(back.year);}
}
function reRenderHousehold(){
  var old=document.querySelector('#householdOverlay .sy-body'),top=old?old.scrollTop:0;
  document.getElementById('householdContent').innerHTML=renderHouseholdContent();bindHousehold();
  document.querySelector('#householdOverlay .sy-body').scrollTop=top;
}
function bindHousehold(){
  bindNavBar('household',closeHousehold);document.getElementById('householdBack').onclick=closeHousehold;_bindTabDespacho();
  var order=['resumen','detalle','gas','elect'];
  function move(delta){var i=order.indexOf(FISCAL_HIP_SUB),next=order[i+delta];if(next)document.querySelector('#householdContent .fiscal-hip-tabs [data-hipsub="'+next+'"]').click();}
  addSwipe(document.getElementById('householdOverlay'),function(){move(1);},function(){move(-1);});
}
