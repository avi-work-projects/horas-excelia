/* Horas de referencia y desempate para planes sin hora real. */
var EV_PLAN_ORDER_KEY='excelia-plan-order-v1';
var EV_PLAN_ORDER_DRAFT=null; // Borrador del panel, se guarda al confirmar.
function evPlanOrderDefaults(){
  var hours={'Desayunar':'09:00','Brunch':'11:00','Comida':'14:00','Barbacoa':'14:00','Plan romántico':'18:00','Tomar algo':'18:00','Montaña':'09:00','Salir a Correr':'09:00','Carrera':'10:00','Bolos':'19:00','Cine':'20:00','Cena':'21:00','Copas':'22:00','Salir de fiesta':'23:50'};
  return Object.keys(EV_PLAN_SUBTYPES).map(function(type,i){return {type:type,time:hours[type]||'18:00',order:i};});
}
function validateEvPlanOrder(value){
  if(!Array.isArray(value)||value.length>100)throw new Error('Orden de planes no válido.');
  var seen={};value.forEach(function(row){if(!row||typeof row.type!=='string'||!Object.prototype.hasOwnProperty.call(EV_PLAN_SUBTYPES,row.type)||seen[row.type]||!/^([01]\d|2[0-3]):[0-5]\d$/.test(row.time))throw new Error('Revisa los tipos y las horas de referencia.');seen[row.type]=true;});
  return value.map(function(row,i){return {type:row.type,time:row.time,order:i};});
}
function evPlanOrderData(){
  var saved=[];try{saved=validateEvPlanOrder(JSON.parse(appStorage.getItem(EV_PLAN_ORDER_KEY)||'[]'));}catch(e){}
  var types=saved.map(function(row){return row.type;});
  return saved.concat(evPlanOrderDefaults().filter(function(row){return types.indexOf(row.type)<0;})).map(function(row,i){return {type:row.type,time:row.time,order:i};});
}
function evPlanReferenceTime(type){
  var row=evPlanOrderData().find(function(row){return row.type===type;});return row?row.time:null;
}
function evCompareOrder(a,b){
  var ta=evStartTime(a)||evPlanReferenceTime(getEvType(a))||'',tb=evStartTime(b)||evPlanReferenceTime(getEvType(b))||'';
  if(ta!==tb)return ta.localeCompare(tb);
  var rows=evPlanOrderData(),types=rows.map(function(row){return row.type;});
  var pa=types.indexOf(getEvType(a)),pb=types.indexOf(getEvType(b));
  return (pa<0?999:pa)-(pb<0?999:pb);
}
function closeEvPlanOrder(){EV_PLAN_ORDER_DRAFT=null;cerrarPanel('evPlanOrderWrap','evPlanOrderOv');}
function openEvPlanOrder(){EV_PLAN_ORDER_DRAFT=evPlanOrderData().sort(function(a,b){return a.time.localeCompare(b.time)||a.order-b.order;});renderEvPlanOrder();}
function renderEvPlanOrder(){
  var existing=document.querySelector('.ev-order-list'),top=existing?existing.scrollTop:0;
  var h='<div class="ev-detail-overlay" id="evPlanOrderOv"><section class="ev-detail-sheet ev-order-sheet"><header class="rut-history-head"><button class="sy-back" id="evOrderClose">←</button><strong>Orden de planes sin hora</strong></header><p class="sy-note">La hora de referencia solo ordena; no crea una hora ni una alarma. Los eventos con hora real conservan su posición. Las flechas ordenan planes con la misma hora.</p><div class="ev-order-list">';
  EV_PLAN_ORDER_DRAFT.forEach(function(row,i){h+='<div class="ev-order-row" data-order-type="'+escHtml(row.type)+'"><span style="color:'+evTypeColor('puntual',row.type)+'">'+evShapeSvg(evFixedSymbol(row.type))+'</span><strong>'+escHtml(row.type)+'</strong><input type="text" class="ev-input" readonly data-time-picker aria-label="Hora de referencia de '+escHtml(row.type)+'" value="'+row.time+'"><button class="sy-nav" data-order-move="-1" aria-label="Subir '+escHtml(row.type)+'"'+(!i?' disabled':'')+'>↑</button><button class="sy-nav" data-order-move="1" aria-label="Bajar '+escHtml(row.type)+'"'+(i===EV_PLAN_ORDER_DRAFT.length-1?' disabled':'')+'>↓</button></div>';});
  h+='</div><div class="ev-form-actions"><button class="ev-btn" id="evOrderReset">Restablecer</button><button class="ev-btn primary" id="evOrderSave">Guardar</button></div></section></div>';
  var wrap=abrirPanel('evPlanOrderWrap',h,{overlay:'evPlanOrderOv',alCerrar:closeEvPlanOrder});wrap.querySelector('.ev-order-list').scrollTop=top;
  wrap.querySelector('#evOrderClose').onclick=closeEvPlanOrder;
  wrap.querySelector('#evOrderReset').onclick=function(){EV_PLAN_ORDER_DRAFT=evPlanOrderDefaults().sort(function(a,b){return a.time.localeCompare(b.time)||a.order-b.order;});renderEvPlanOrder();};
  wrap.querySelectorAll('[data-order-type]').forEach(function(el){
    var type=el.dataset.orderType;el.querySelector('input').onchange=function(e){
      EV_PLAN_ORDER_DRAFT.find(function(row){return row.type===type;}).time=e.target.value;
      EV_PLAN_ORDER_DRAFT.sort(function(a,b){return a.time.localeCompare(b.time);});renderEvPlanOrder();
    };
    el.querySelectorAll('[data-order-move]').forEach(function(btn){btn.onclick=function(){
      var i=EV_PLAN_ORDER_DRAFT.findIndex(function(row){return row.type===type;}),j=i+Number(btn.dataset.orderMove),other=EV_PLAN_ORDER_DRAFT[j];
      if(!other)return;if(other.time!==EV_PLAN_ORDER_DRAFT[i].time){showToast('Para cambiar este orden, cambia primero la hora de referencia.','error');return;}
      var row=EV_PLAN_ORDER_DRAFT[i];EV_PLAN_ORDER_DRAFT[i]=other;EV_PLAN_ORDER_DRAFT[j]=row;renderEvPlanOrder();
    };});
  });
  wrap.querySelector('#evOrderSave').onclick=function(){appStorage.setItem(EV_PLAN_ORDER_KEY,JSON.stringify(validateEvPlanOrder(EV_PLAN_ORDER_DRAFT)));closeEvPlanOrder();refreshEvents();showToast('Orden de planes guardado','success');};
}
