/* Dos vistas con su distribución real; solo el área de contenido se desplaza. */
function swipeCommonRoot(nodes){
  var root=nodes[0];while(root&&!nodes.every(function(n){return root.contains(n);}))root=root.parentElement;return root;
}
function createLiveSwipe(el,resolve){
  var nodes=resolve();if(!nodes.length)return null;
  var region=swipeLayoutViewport(el,nodes);if(region.width<=0||region.height<=0)return null;
  var paused=[];
  function pauseMotion(list,atStart){list.forEach(function(n){n.getAnimations({subtree:true}).forEach(function(a){if(a.effect.getTiming().iterations!==Infinity||paused.some(function(r){return r.animation===a;}))return;var time=atStart?0:a.currentTime,running=a.playState==='running';a.pause();a.currentTime=time;paused.push({animation:a,running:running});});});}
  pauseMotion(nodes,false);
  var outgoing=swipeLayoutFrame(el,resolve,region,null,'outgoing');if(!outgoing){paused.forEach(function(r){if(r.running)r.animation.play();});return null;}
  var incoming=null,direction=0,offset=0,hidden=[],animations=[],stopped=false,distance=swipeContentDistance(region.width);
  var transitions=nodes.map(function(n){var saved={node:n,value:n.style.getPropertyValue('transition'),priority:n.style.getPropertyPriority('transition')};n.style.setProperty('transition','none','important');return saved;});
  function hide(list){list.forEach(function(n){if(!hidden.some(function(r){return r.node===n;}))hidden.push({node:n,value:n.style.visibility});n.style.visibility='hidden';});}
  function reveal(){
    swipeContentReset(nodes);
    transitions.forEach(function(row){row.node.getBoundingClientRect();if(row.value)row.node.style.setProperty('transition',row.value,row.priority);else row.node.style.removeProperty('transition');});
    hidden.forEach(function(row){row.node.style.visibility=row.value;});
  }
  function clear(){
    if(stopped)return;stopped=true;reveal();animations.forEach(function(a){a.cancel();});outgoing.frame.remove();if(incoming)incoming.frame.remove();
    paused.forEach(function(r){if(r.running&&r.animation.effect.target.isConnected)r.animation.play();});
  }
  function prepare(sign){
    if(sign===direction)return;if(incoming)incoming.frame.remove();incoming=null;direction=sign;
    var html=swipeRenderPreview(el,sign<0?1:-1);if(html)incoming=swipeLayoutFrame(el,resolve,region,html,'incoming',outgoing.scope);
  }
  function move(dx){
    prepare(dx<0?-1:1);offset=incoming?Math.max(-region.width,Math.min(region.width,dx)):dx*.2;
    hide(nodes);nodes.forEach(function(n){n.style.translate=offset+'px 0';});outgoing.frame.style.transform='translateX('+offset+'px)';
    if(incoming)incoming.frame.style.transform='translateX('+(offset-direction*distance)+'px)';return !!incoming;
  }
  function finish(commit,change){
    commit=commit&&!!incoming;if(!incoming){clear();return;}
    if(commit){
      swipeContentReset(nodes);try{change();}catch(e){clear();throw e;}
      var fresh=resolve();hide(fresh);pauseMotion(fresh,true);fresh.forEach(function(n){n.getBoundingClientRect();n.getAnimations({subtree:true}).forEach(function(a){if(a.effect.getTiming().iterations!==Infinity)try{a.finish();}catch(ignore){}});});
    }
    var to=commit?direction*distance:0,options={duration:180,easing:'ease-out',fill:'forwards'};
    animations.push(outgoing.frame.animate([{transform:'translateX('+offset+'px)',borderRadius:'16px'},{transform:'translateX('+to+'px)',borderRadius:commit?'16px':'0px'}],options));
    animations.push(incoming.frame.animate([{transform:'translateX('+(offset-direction*distance)+'px)',borderRadius:'16px'},{transform:'translateX('+(to-direction*distance)+'px)',borderRadius:commit?'0px':'16px'}],options));
    Promise.all(animations.map(function(a){return a.finished.catch(function(){});})).then(function(){
      if(stopped)return;reveal();
      // Un fotograma real bajo la copia opaca antes de retirar la cobertura.
      requestAnimationFrame(function(){requestAnimationFrame(clear);});
    });
  }
  return {move:move,finish:finish,cancel:clear};
}
