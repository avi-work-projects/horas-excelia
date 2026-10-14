/* Dos contenidos visibles durante el gesto. La previsualización no ejecuta la navegación. */
function swipeCommonRoot(nodes){
  var root=nodes[0];while(root&&!nodes.every(function(n){return root.contains(n);}))root=root.parentElement;return root;
}
function swipeLiveFrame(nodes,region,kind){
  var source=swipeCommonRoot(nodes);if(!source)return null;
  var copy=source.cloneNode(true),frame=document.createElement('div');
  copy.querySelectorAll(SWIPE_FIXED_SELECTOR).forEach(function(n){n.remove();});
  // Los IDs conservan los estilos dentro del árbol cerrado; nunca entran en el DOM de la app.
  copy.inert=true;
  frame.className='swipe-content-preview swipe-live-'+kind;frame.setAttribute('aria-hidden','true');frame.inert=true;
  Object.assign(frame.style,{position:'fixed',left:region.left+'px',top:region.top+'px',width:region.width+'px',height:region.height+'px',overflow:'hidden',pointerEvents:'none',zIndex:'5000'});
  Object.assign(copy.style,{position:'absolute',left:'0',top:'0',width:'100%',height:'auto',margin:'0',translate:''});
  if(copy.matches('.sy-body')){copy.style.padding='0';copy.style.overflow='visible';}
  if(copy.matches('.ev-month-wrap')&&source.closest('.rut-dpick-real,.rut-wpick-real'))copy.style.height='100%';
  if(copy.matches('.boda-asg-grid'))copy.style.height=region.gridHeight+'px';
  swipePreviewRoot(frame,copy,source);return {frame:frame,copy:copy};
}
function createLiveSwipe(el,resolve){
  var nodes=resolve();if(!nodes.length)return null;
  var root=swipeCommonRoot(nodes),scroll=root.closest('.sy-body')||root.parentElement,clip=scroll.getBoundingClientRect(),rects=nodes.map(function(n){return n.getBoundingClientRect();}),tabs=scroll.querySelector(':scope > .econ-sub-tabs,:scope > .boda-sticky-hd .econ-sub-tabs');
  var top=Math.max(rects[0].top,clip.top,tabs?tabs.getBoundingClientRect().bottom:0,0),left=Math.max(Math.min.apply(null,rects.map(function(r){return r.left;})),clip.left,0),right=Math.min(Math.max.apply(null,rects.map(function(r){return r.right;})),clip.right,innerWidth);
  var region={left:left,top:top,width:right-left,height:Math.min(clip.bottom,innerHeight)-top,gridHeight:rects[0].height};if(region.width<=0||region.height<=0)return null;
  var outgoing=swipeLiveFrame(nodes,region,'outgoing'),incoming=null,direction=0,offset=0,hidden=[],animations=[],stopped=false;
  var origin=rects[0].top-region.top,base=origin+scroll.scrollTop;outgoing.copy.style.top=origin+'px';
  function restore(){hidden.forEach(function(row){row.node.style.visibility=row.value;});hidden=[];}
  function clear(){if(stopped)return;stopped=true;animations.forEach(function(a){a.cancel();});swipeContentReset(nodes);restore();outgoing.frame.remove();if(incoming)incoming.frame.remove();}
  function prepare(sign){
    if(sign===direction)return;
    if(incoming)incoming.frame.remove();incoming=null;direction=sign;
    var html=swipeRenderPreview(el,sign<0?1:-1);if(!html)return;
    var template=document.createElement('template');template.innerHTML=html;var target=resolve(template.content);if(!target.length)return;
    incoming=swipeLiveFrame(target,region,'incoming');document.body.appendChild(incoming.frame);
    var requested=swipeKeepsPreviewScroll(el)?scroll.scrollTop:0,maxScroll=Math.max(0,incoming.copy.scrollHeight-region.height);
    incoming.copy.style.top=(Math.max(0,base)-Math.min(requested,maxScroll))+'px';
  }
  function move(dx){
    prepare(dx<0?-1:1);offset=incoming?Math.max(-region.width,Math.min(region.width,dx)):dx*.2;
    nodes.forEach(function(n){n.style.translate=offset+'px 0';});
    if(incoming)incoming.copy.style.transform='translateX('+(offset-direction*region.width)+'px)';
  }
  function finish(commit,change){
    commit=commit&&!!incoming;
    if(!incoming){clear();return;}
    if(commit){
      document.body.appendChild(outgoing.frame);outgoing.copy.style.transform='translateX('+offset+'px)';swipeContentReset(nodes);
      try{change();}catch(e){clear();throw e;}
      hidden=resolve().map(function(n){var value=n.style.visibility;n.style.visibility='hidden';return {node:n,value:value};});
    }
    var from=offset,to=commit?direction*region.width:0,options={duration:180,easing:'ease-out',fill:'forwards'};
    var moving=commit?[outgoing.copy]:nodes;
    moving.forEach(function(n){animations.push(n.animate([{translate:from+'px 0',transform:commit?'none':getComputedStyle(n).transform},{translate:to+'px 0',transform:commit?'none':getComputedStyle(n).transform}],options));});
    incoming.copy.style.transform='';animations.push(incoming.copy.animate([{transform:'translateX('+(from-direction*region.width)+'px)'},{transform:'translateX('+(to-direction*region.width)+'px)'}],options));
    Promise.all(animations.map(function(a){return a.finished.catch(function(){});})).then(clear);
  }
  return {move:move,finish:finish,cancel:clear};
}
