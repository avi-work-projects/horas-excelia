/* Las vistas previas conservan el árbol de distribución de la pantalla real. */
function swipeLayoutClone(seed){
  var copy=seed.cloneNode(true),originals=[seed].concat(Array.from(seed.querySelectorAll('*'))),copies=[copy].concat(Array.from(copy.querySelectorAll('*'))),scrolls=[];
  originals.forEach(function(n,i){var c=copies[i];if(n.scrollTop||n.scrollLeft)scrolls.push({node:c,top:n.scrollTop,left:n.scrollLeft});if(n.matches('input,textarea,select')){c.value=n.value;if(n.matches('input'))c.checked=n.checked;}});
  var pairs=new Map(originals.map(function(n,i){return [n,copies[i]];}));
  seed.getAnimations({subtree:true}).forEach(function(a){
    if(a.effect.getTiming().iterations!==Infinity)return;var n=a.effect.target,c=pairs.get(n);if(!c)return;
    var style=getComputedStyle(n),props=new Set();a.effect.getKeyframes().forEach(function(k){Object.keys(k).forEach(function(p){if(['offset','computedOffset','easing','composite'].indexOf(p)<0)props.add(p.replace(/[A-Z]/g,function(ch){return '-'+ch.toLowerCase();}));});});
    props.forEach(function(p){c.style.setProperty(p,style.getPropertyValue(p),'important');});
  });
  copy.querySelectorAll('script,.swipe-content-preview').forEach(function(n){n.remove();});
  return {body:copy,scrolls:scrolls};
}
function swipeLayoutMerge(body,el,html){
  if(!html)return;
  var fragment=document.createElement('template');fragment.innerHTML=html;
  var selector=el.id?'#'+el.id:el.matches('.ev-bday-body')?'.ev-bday-body':el.matches('.rut-dpick-real')?'.rut-dpick-real':el.matches('.rut-wpick-real')?'.rut-wpick-real':el.matches('.boda-asg-grid')?'.boda-asg-grid':'#energyAnalysisOverlay .energy-window-content';
  var target=body.querySelector(selector),next=fragment.content.querySelector(selector);if(!target||!next)return;
  if(target.matches('.full-overlay')){var container=target.querySelector(':scope > [id$="Content"]');(container||target).innerHTML=next.innerHTML;}
  else if(target.id==='weeksContainer')target.innerHTML=next.innerHTML;
  else{Array.from(target.style).filter(function(k){return k.indexOf('--')===0;}).forEach(function(k){next.style.setProperty(k,target.style.getPropertyValue(k));});target.replaceWith(next);}
}
function swipeLayoutViewport(el,nodes){
  var root=swipeCommonRoot(nodes),scroll=root.closest('.sy-body')||root.parentElement,r=scroll.getBoundingClientRect(),first=Math.min.apply(null,nodes.map(function(n){return n.getBoundingClientRect().top;}));
  var top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom),left=Math.max(0,r.left),right=Math.min(innerWidth,r.right);
  var whole=el.id==='weeksContainer'||el.matches('.full-overlay,.energy-window,.sy-body');
  if(!whole){var area=root.getBoundingClientRect();top=Math.max(top,area.top);bottom=Math.min(bottom,area.bottom);left=Math.max(left,area.left);right=Math.min(right,area.right);}
  if(el.id==='weeksContainer'){top=Math.max(top,document.querySelector('.header').getBoundingClientRect().bottom);bottom=innerHeight;}
  (whole?scroll:root).querySelectorAll(SWIPE_FIXED_SELECTOR).forEach(function(n){var b=n.getBoundingClientRect();if(b.bottom<=first+.5&&b.bottom>top&&b.top<bottom)top=b.bottom;});
  var tabs=scroll.querySelector(':scope > .econ-sub-tabs,:scope > .boda-sticky-hd .econ-sub-tabs');if(tabs)top=Math.max(top,tabs.getBoundingClientRect().bottom);
  return {left:left,top:top,width:right-left,height:bottom-top,scroll:scroll};
}
function swipeLayoutFrame(el,resolve,region,html,kind,seed){
  var tree=swipeLayoutClone(seed||document.body);swipeLayoutMerge(tree.body,el,html);
  var nodes=resolve(tree.body),copy=swipeCommonRoot(nodes);if(!copy)return null;
  var frame=document.createElement('div'),scene=document.createElement('div');
  var level=0;for(var ancestor=el;ancestor&&ancestor!==document.body;ancestor=ancestor.parentElement)level=Math.max(level,parseInt(getComputedStyle(ancestor).zIndex,10)||0);
  frame.className='swipe-content-preview swipe-live-'+kind;frame.inert=true;frame.setAttribute('aria-hidden','true');
  Object.assign(frame.style,{position:'fixed',left:region.left+'px',top:region.top+'px',width:region.width+'px',height:region.height+'px',overflow:'hidden',borderRadius:'16px',pointerEvents:'none',zIndex:String(level+1)});
  Object.assign(scene.style,{position:'absolute',left:-region.left+'px',top:-region.top+'px',width:document.documentElement.clientWidth+'px',height:innerHeight+'px',contain:'layout paint',overflow:'hidden'});
  Object.assign(tree.body.style,{position:'relative',top:-window.scrollY+'px',width:'100%',margin:'0'});tree.body.inert=true;scene.appendChild(tree.body);
  tree.body.querySelectorAll(SWIPE_FIXED_SELECTOR+',.tasks-fab,.tasks-drop-zone,.toast,.app-update-fab').forEach(function(n){n.style.visibility='hidden';});
  swipePreviewRoot(frame,copy,el,scene);document.body.appendChild(frame);
  tree.scrolls.forEach(function(s){if(s.node.isConnected){s.node.scrollTop=s.top;s.node.scrollLeft=s.left;}});
  var body=copy.closest('.sy-body');if(body){var tabs=body.querySelector('.econ-sub-tabs');if(tabs){body.style.setProperty('--ev-subtab-h',tabs.offsetHeight+'px');body.style.setProperty('--bday-tabs-height',tabs.offsetHeight+'px');}body.scrollTop=html?(swipeKeepsPreviewScroll(el)?region.scroll.scrollTop:0):region.scroll.scrollTop;}
  if(body&&typeof evLayoutWeekTitles==='function')evLayoutWeekTitles(body);
  return {frame:frame,copy:copy,scope:tree.body,nodes:nodes};
}
