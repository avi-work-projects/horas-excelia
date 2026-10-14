/* Horas de referencia y desempate para planes sin hora real. */
var EV_PLAN_ORDER_KEY='excelia-plan-order-v1';
var EV_PLAN_ORDER_DRAFT=null; // Borrador del panel, se guarda al confirmar.
var EV_PLAN_ORDER_CACHE=null;
var EV_PLAN_ORDER_STOP=null;
function renderEvPlanOrderButton(){return '<button class="ev-up-order-button" id="evUpcomingOrder" aria-label="Configurar orden de planes" title="Configurar orden de planes">⚙</button>';}
function evPlanOrderDefaults(){
  var hours={'Desayunar':'09:00','Brunch':'11:00','Comida':'14:00','Barbacoa':'14:00','Plan romántico':'18:00','Tomar algo':'18:00','Montaña':'09:00','Salir a Correr':'09:00','Carrera':'10:00','Bolos':'19:00','Cine':'20:00','Cena':'21:00','Copas':'22:00','Salir de fiesta':'23:50'};
  return Object.keys(EV_PLAN_SUBTYPES).map(function(type,i){return {type:type,time:hours[type]||'18:00',order:i};}).sort(function(a,b){return a.time.localeCompare(b.time)||a.order-b.order;});
}
function validateEvPlanOrder(value){
  if(!Array.isArray(value)||value.length>100)throw new Error('Orden de planes no válido.');
  var seen={},last='';value.forEach(function(row){if(!row||typeof row.type!=='string'||!Object.prototype.hasOwnProperty.call(EV_PLAN_SUBTYPES,row.type)||seen[row.type]||(row.time!=null&&row.time!==''&&(!/^([01]\d|2[0-3]):[0-5]\d$/.test(row.time)||row.time<last)))throw new Error('Revisa los tipos y las horas de referencia.');seen[row.type]=true;if(row.time)last=row.time;});
  return value.map(function(row,i){return {type:row.type,time:row.time||null,order:i};});
}
function evPlanOrderData(){
  var raw=appStorage.getItem(EV_PLAN_ORDER_KEY)||'[]';
  if(EV_PLAN_ORDER_CACHE&&EV_PLAN_ORDER_CACHE.raw===raw)return EV_PLAN_ORDER_CACHE.rows.map(function(row){return Object.assign({},row);});
  var saved=[];try{saved=validateEvPlanOrder(JSON.parse(raw));}catch(e){}
  var types=saved.map(function(row){return row.type;});
  var rows=saved.concat(evPlanOrderDefaults().filter(function(row){return types.indexOf(row.type)<0;}).map(function(row){return saved.length?{type:row.type,time:null}:row;})).map(function(row,i){return {type:row.type,time:row.time,order:i};});
  EV_PLAN_ORDER_CACHE={raw:raw,rows:rows};return rows.map(function(row){return Object.assign({},row);});
}
function evPlanReferenceTime(type){
  var row=evPlanOrderData().find(function(row){return row.type===type;});return row?row.time:null;
}
function evCompareOrder(a,b){
  var rows=evPlanOrderData();
  var difference=evPlanOrderPosition(a,rows)-evPlanOrderPosition(b,rows);if(difference)return difference;
  if(evStartTime(a)||evStartTime(b)||!appStorage.getItem(EV_PLAN_ORDER_KEY))return 0;
  var types=rows.map(function(row){return row.type;});
  var pa=types.indexOf(getEvType(a)),pb=types.indexOf(getEvType(b));
  return pa>=0&&pb>=0?pa-pb:0;
}
/* Los huecos sin hora se reparten entre sus vecinos: conservan su posición,
   sin guardar una hora ni modificar la hora real de ningún evento. */
function evPlanOrderPosition(ev,rows){
  function minutes(t){var parts=t.split(':');return Number(parts[0])*60+Number(parts[1]);}
  var real=evStartTime(ev);if(real)return minutes(real);
  var i=rows.findIndex(function(row){return row.type===getEvType(ev);});if(i<0)return -1;
  if(rows[i].time)return minutes(rows[i].time);
  var before=i-1,after=i+1;
  while(before>=0&&!rows[before].time)before--;
  while(after<rows.length&&!rows[after].time)after++;
  var low=before>=0?minutes(rows[before].time):0,high=after<rows.length?minutes(rows[after].time):1440;
  return low+(high-low)*(i-before)/(after-before);
}
function closeEvPlanOrder(){if(EV_PLAN_ORDER_STOP)EV_PLAN_ORDER_STOP();EV_PLAN_ORDER_STOP=null;EV_PLAN_ORDER_DRAFT=null;cerrarPanel('evPlanOrderWrap','evPlanOrderOv');}
function evPlanOrderReorder(type,index){
  var current=EV_PLAN_ORDER_DRAFT.findIndex(function(row){return row.type===type;});
  if(current<0||index<0||index>=EV_PLAN_ORDER_DRAFT.length||current===index)return;
  var row=EV_PLAN_ORDER_DRAFT.splice(current,1)[0];EV_PLAN_ORDER_DRAFT.splice(index,0,row);
  if(!row.time)return;
  var before=EV_PLAN_ORDER_DRAFT.slice(0,index).reverse().find(function(r){return r.time;}),after=EV_PLAN_ORDER_DRAFT.slice(index+1).find(function(r){return r.time;}),original=row.time;
  if(before&&row.time<before.time)row.time=before.time;
  if(after&&row.time>after.time)row.time=after.time;
  if(row.time!==original)showToast('Hora de referencia ajustada a '+row.time,'success');
}
function openEvPlanOrder(){EV_PLAN_ORDER_DRAFT=evPlanOrderData();renderEvPlanOrder();}
function renderEvPlanOrder(){
  if(EV_PLAN_ORDER_STOP)EV_PLAN_ORDER_STOP();
  var existing=document.querySelector('.ev-order-list'),top=existing?existing.scrollTop:0;
  var h='<div class="ev-detail-overlay" id="evPlanOrderOv"><section class="ev-detail-sheet ev-order-sheet"><header class="bd-panel-header panel-header-centered"><button class="sy-back" id="evOrderClose" aria-label="Volver">←</button><h2>Orden de planes sin hora</h2><span></span></header><p class="sy-note ev-order-note">Arrastra para ordenar. La hora de referencia es opcional: sin ella se conserva la posición de la lista. Las horas reales de los eventos se respetan.</p><div class="ev-order-list" aria-label="Prioridad de planes">';
  EV_PLAN_ORDER_DRAFT.forEach(function(row,i){h+='<div class="ev-order-row" data-order-type="'+escHtml(row.type)+'"><button type="button" class="task-grip ev-order-grip" data-order-drag aria-label="Reordenar '+escHtml(row.type)+'" title="Arrastra o usa las flechas del teclado">⠿</button><span style="color:'+evTypeColor('puntual',row.type)+'">'+evShapeSvg(evFixedSymbol(row.type))+'</span><strong>'+escHtml(row.type)+'</strong><input type="text" class="ev-input" readonly data-time-picker data-time-optional placeholder="Sin hora" aria-label="Hora de referencia de '+escHtml(row.type)+'" value="'+(row.time||'')+'"></div>';});
  h+='</div><span class="ev-order-status" role="status" aria-live="polite"></span><div class="ev-form-actions"><button class="ev-btn" id="evOrderReset">Restablecer</button><button class="ev-btn primary" id="evOrderSave">Guardar</button></div></section></div>';
  var wrap=abrirPanel('evPlanOrderWrap',h,{overlay:'evPlanOrderOv',alCerrar:closeEvPlanOrder});wrap.querySelector('.ev-order-list').scrollTop=top;
  wrap.querySelector('#evOrderClose').onclick=closeEvPlanOrder;
  wrap.querySelector('#evOrderReset').onclick=function(){EV_PLAN_ORDER_DRAFT=evPlanOrderDefaults().sort(function(a,b){return a.time.localeCompare(b.time)||a.order-b.order;});renderEvPlanOrder();};
  wrap.querySelectorAll('[data-order-type]').forEach(function(el){
    var type=el.dataset.orderType;el.querySelector('input').onchange=function(e){
      var index=EV_PLAN_ORDER_DRAFT.findIndex(function(row){return row.type===type;}),row=EV_PLAN_ORDER_DRAFT[index];row.time=e.target.value||null;
      if(row.time){EV_PLAN_ORDER_DRAFT.splice(index,1);var next=EV_PLAN_ORDER_DRAFT.findIndex(function(r){return r.time&&r.time>row.time;});EV_PLAN_ORDER_DRAFT.splice(next<0?EV_PLAN_ORDER_DRAFT.length:next,0,row);}
      renderEvPlanOrder();
    };

  });
  EV_PLAN_ORDER_STOP=bindListReorder(wrap,{list:'.ev-order-list',grips:'[data-order-drag]',row:'[data-order-type]',rows:':scope > .ev-order-row',attribute:'data-order-type',key:function(row){return row.dataset.orderType;},label:function(row){return row.querySelector('strong').textContent;},status:function(){return wrap.querySelector('.ev-order-status');},render:function(){if(EV_PLAN_ORDER_DRAFT)renderEvPlanOrder();},commit:function(type,target,after,keys){evPlanOrderReorder(type,keys.indexOf(type));},keyboard:function(type,delta){var i=EV_PLAN_ORDER_DRAFT.findIndex(function(row){return row.type===type;});evPlanOrderReorder(type,i+delta);renderEvPlanOrder();}});
  wrap.querySelector('#evOrderSave').onclick=function(){appStorage.setItem(EV_PLAN_ORDER_KEY,JSON.stringify(validateEvPlanOrder(EV_PLAN_ORDER_DRAFT)));closeEvPlanOrder();refreshEvents();showToast('Orden de planes guardado','success');};
}
