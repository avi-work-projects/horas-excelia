/* Horas de referencia y desempate para planes sin hora real. */
var EV_PLAN_ORDER_KEY='excelia-plan-order-v1';
var EV_PLAN_ORDER_DRAFT=null; // Borrador del panel, se guarda al confirmar.
var EV_PLAN_ORDER_CACHE=null;
var EV_PLAN_ORDER_STOP=null;
function renderEvPlanOrderButton(){return '<button class="ev-up-order-button" id="evUpcomingOrder" aria-label="Configurar orden de planes" title="Configurar orden de planes">⚙</button>';}
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
  var raw=appStorage.getItem(EV_PLAN_ORDER_KEY)||'[]';
  if(EV_PLAN_ORDER_CACHE&&EV_PLAN_ORDER_CACHE.raw===raw)return EV_PLAN_ORDER_CACHE.rows.map(function(row){return Object.assign({},row);});
  var saved=[];try{saved=validateEvPlanOrder(JSON.parse(raw));}catch(e){}
  var types=saved.map(function(row){return row.type;});
  var rows=saved.concat(evPlanOrderDefaults().filter(function(row){return types.indexOf(row.type)<0;})).map(function(row,i){return {type:row.type,time:row.time,order:i};});
  EV_PLAN_ORDER_CACHE={raw:raw,rows:rows};return rows.map(function(row){return Object.assign({},row);});
}
function evPlanReferenceTime(type){
  var row=evPlanOrderData().find(function(row){return row.type===type;});return row?row.time:null;
}
function evCompareOrder(a,b){
  var ta=evStartTime(a)||evPlanReferenceTime(getEvType(a))||'',tb=evStartTime(b)||evPlanReferenceTime(getEvType(b))||'';
  function minutes(t){var p=/^(\d{1,2}):(\d{2})$/.exec(t);return p?Number(p[1])*60+Number(p[2]):-1;}
  var difference=minutes(ta)-minutes(tb);if(difference)return difference;
  if(evStartTime(a)||evStartTime(b)||!appStorage.getItem(EV_PLAN_ORDER_KEY))return 0;
  var rows=evPlanOrderData(),types=rows.map(function(row){return row.type;});
  var pa=types.indexOf(getEvType(a)),pb=types.indexOf(getEvType(b));
  return pa>=0&&pb>=0?pa-pb:0;
}
function closeEvPlanOrder(){if(EV_PLAN_ORDER_STOP)EV_PLAN_ORDER_STOP();EV_PLAN_ORDER_STOP=null;EV_PLAN_ORDER_DRAFT=null;cerrarPanel('evPlanOrderWrap','evPlanOrderOv');}
function evPlanOrderReorder(type,index){
  var current=EV_PLAN_ORDER_DRAFT.findIndex(function(row){return row.type===type;});
  if(current<0||index<0||index>=EV_PLAN_ORDER_DRAFT.length||current===index)return;
  var row=EV_PLAN_ORDER_DRAFT.splice(current,1)[0];EV_PLAN_ORDER_DRAFT.splice(index,0,row);
  var before=EV_PLAN_ORDER_DRAFT[index-1],after=EV_PLAN_ORDER_DRAFT[index+1],original=row.time;
  if(before&&row.time<before.time)row.time=before.time;
  if(after&&row.time>after.time)row.time=after.time;
  if(row.time!==original)showToast('Hora de referencia ajustada a '+row.time,'success');
}
function openEvPlanOrder(){EV_PLAN_ORDER_DRAFT=evPlanOrderData().sort(function(a,b){return a.time.localeCompare(b.time)||a.order-b.order;});renderEvPlanOrder();}
function renderEvPlanOrder(){
  if(EV_PLAN_ORDER_STOP)EV_PLAN_ORDER_STOP();
  var existing=document.querySelector('.ev-order-list'),top=existing?existing.scrollTop:0;
  var h='<div class="ev-detail-overlay" id="evPlanOrderOv"><section class="ev-detail-sheet ev-order-sheet"><header class="bd-panel-header panel-header-centered"><button class="sy-back" id="evOrderClose" aria-label="Volver">←</button><h2>Orden de planes sin hora</h2><span></span></header><p class="sy-note ev-order-note">Arrastra para ordenar o usa las flechas. Al mover un plan se ajusta su hora de referencia. Esta hora solo ordena los planes sin hora; no crea alarmas.</p><div class="ev-order-list" aria-label="Prioridad de planes">';
  EV_PLAN_ORDER_DRAFT.forEach(function(row,i){h+='<div class="ev-order-row" data-order-type="'+escHtml(row.type)+'"><button type="button" class="task-grip ev-order-grip" data-order-drag aria-label="Reordenar '+escHtml(row.type)+'" title="Arrastra o usa las flechas del teclado">⠿</button><span style="color:'+evTypeColor('puntual',row.type)+'">'+evShapeSvg(evFixedSymbol(row.type))+'</span><strong>'+escHtml(row.type)+'</strong><input type="text" class="ev-input" readonly data-time-picker aria-label="Hora de referencia de '+escHtml(row.type)+'" value="'+row.time+'"><div class="ev-order-arrows"><button class="sy-nav" data-order-move="-1" aria-label="Subir '+escHtml(row.type)+'"'+(!i?' disabled':'')+'>↑</button><button class="sy-nav" data-order-move="1" aria-label="Bajar '+escHtml(row.type)+'"'+(i===EV_PLAN_ORDER_DRAFT.length-1?' disabled':'')+'>↓</button></div></div>';});
  h+='</div><span class="ev-order-status" role="status" aria-live="polite"></span><div class="ev-form-actions"><button class="ev-btn" id="evOrderReset">Restablecer</button><button class="ev-btn primary" id="evOrderSave">Guardar</button></div></section></div>';
  var wrap=abrirPanel('evPlanOrderWrap',h,{overlay:'evPlanOrderOv',alCerrar:closeEvPlanOrder});wrap.querySelector('.ev-order-list').scrollTop=top;
  wrap.querySelector('#evOrderClose').onclick=closeEvPlanOrder;
  wrap.querySelector('#evOrderReset').onclick=function(){EV_PLAN_ORDER_DRAFT=evPlanOrderDefaults().sort(function(a,b){return a.time.localeCompare(b.time)||a.order-b.order;});renderEvPlanOrder();};
  wrap.querySelectorAll('[data-order-type]').forEach(function(el){
    var type=el.dataset.orderType;el.querySelector('input').onchange=function(e){
      EV_PLAN_ORDER_DRAFT.find(function(row){return row.type===type;}).time=e.target.value;
      EV_PLAN_ORDER_DRAFT.sort(function(a,b){return a.time.localeCompare(b.time);});renderEvPlanOrder();
    };
    el.querySelectorAll('[data-order-move]').forEach(function(btn){btn.onclick=function(){
      var i=EV_PLAN_ORDER_DRAFT.findIndex(function(row){return row.type===type;});evPlanOrderReorder(type,i+Number(btn.dataset.orderMove));renderEvPlanOrder();
    };});
  });
  EV_PLAN_ORDER_STOP=bindListReorder(wrap,{list:'.ev-order-list',grips:'[data-order-drag]',row:'[data-order-type]',rows:':scope > .ev-order-row',attribute:'data-order-type',key:function(row){return row.dataset.orderType;},label:function(row){return row.querySelector('strong').textContent;},status:function(){return wrap.querySelector('.ev-order-status');},render:function(){if(EV_PLAN_ORDER_DRAFT)renderEvPlanOrder();},commit:function(type,target,after,keys){evPlanOrderReorder(type,keys.indexOf(type));},keyboard:function(type,delta){var i=EV_PLAN_ORDER_DRAFT.findIndex(function(row){return row.type===type;});evPlanOrderReorder(type,i+delta);renderEvPlanOrder();}});
  wrap.querySelector('#evOrderSave').onclick=function(){appStorage.setItem(EV_PLAN_ORDER_KEY,JSON.stringify(validateEvPlanOrder(EV_PLAN_ORDER_DRAFT)));closeEvPlanOrder();refreshEvents();showToast('Orden de planes guardado','success');};
}
