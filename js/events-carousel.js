/* Vista previa inerte durante el arrastre; solo la ficha actual tiene listeners. */
function bindEvCarouselDrag(sheet,car,fromSummary){
  sheet._swipeAdded=true;
  var overlay=sheet.parentElement,start=null,dx=0,dragging=false,settling=false,previews=[];
  function preview(step){
    var i=(car.i+step+car.n)%car.n,template=document.createElement('template');
    template.innerHTML=renderEvDetail(EV_CAR.items[i],fromSummary,{ds:car.ds,i:i,n:car.n});
    var node=template.content.querySelector('.ev-detail-sheet');
    node.removeAttribute('id');node.querySelectorAll('[id]').forEach(function(el){el.removeAttribute('id');});
    node.inert=true;node.setAttribute('aria-hidden','true');node.classList.add('ev-car-preview');
    node.style.width=sheet.getBoundingClientRect().width+'px';node.style.left=sheet.offsetLeft+'px';
    overlay.appendChild(node);previews.push({node:node,step:step});
  }
  function position(offset){
    var width=sheet.getBoundingClientRect().width+12;
    sheet.style.transform='translateX('+offset+'px)';
    previews.forEach(function(p){p.node.style.transform='translateX('+(offset+p.step*width)+'px)';});
  }
  function clear(){
    previews.forEach(function(p){p.node.remove();});previews=[];
    sheet.style.transform='';sheet.style.transition='';sheet.classList.remove('ev-car-dragging');
  }
  function finish(cancel){
    if(!start)return;
    start=null;if(!dragging)return;dragging=false;settling=true;
    var step=!cancel&&Math.abs(dx)>sheet.getBoundingClientRect().width*.2?(dx<0?1:-1):0;
    var duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:180;
    sheet.style.transition='transform '+duration+'ms ease-out';
    previews.forEach(function(p){p.node.style.transition=sheet.style.transition;});
    position(step?-step*(sheet.getBoundingClientRect().width+12):0);
    setTimeout(function(){
      var active=sheet.isConnected&&EV_CAR.ds===car.ds&&EV_CAR.i===car.i;
      clear();settling=false;
      if(active&&step)evCarGo(step);
    },duration);
  }
  sheet.addEventListener('pointerdown',function(e){
    if(settling||!e.isPrimary||e.button!==0||e.target.closest('button,input,select,textarea,a,label'))return;
    start={x:e.clientX,y:e.clientY,id:e.pointerId};dx=0;
  });
  sheet.addEventListener('pointermove',function(e){
    if(!start||e.pointerId!==start.id)return;
    var x=e.clientX-start.x,y=e.clientY-start.y;
    if(!dragging){
      if(Math.max(Math.abs(x),Math.abs(y))<8)return;
      if(Math.abs(y)>=Math.abs(x)){start=null;return;}
      dragging=true;sheet.setPointerCapture(e.pointerId);sheet.style.transition='none';sheet.classList.add('ev-car-dragging');
      preview(-1);preview(1);
    }
    e.preventDefault();dx=Math.max(-sheet.clientWidth,Math.min(sheet.clientWidth,x));position(dx);
  });
  sheet.addEventListener('pointerup',function(){finish(false);});
  sheet.addEventListener('touchmove',function(e){if(dragging&&e.cancelable)e.preventDefault();},{passive:false});
  sheet.addEventListener('pointercancel',function(){finish(true);});
  sheet.addEventListener('lostpointercapture',function(e){if(e.target===sheet)finish(true);});
  // El click sintético táctil puede apuntar al fondo al desplazarse la ficha.
  overlay.addEventListener('click',function(e){if(settling){e.preventDefault();e.stopImmediatePropagation();}},true);
}
