/* Un gesto ya autorizado mueve solo el contenido; navegación y acciones quedan fijas. */
var SWIPE_PREVIEW_STYLES=null;
function swipePreviewRoot(frame,copy,source){
  // La copia solo pinta: sus clases tampoco participan en consultas ni listeners de la app.
  if(SWIPE_PREVIEW_STYLES===null)SWIPE_PREVIEW_STYLES=Array.from(document.styleSheets).map(function(sheet){try{return Array.from(sheet.cssRules).map(function(rule){return rule.cssText.replace(/url\((['"]?)([^'"\)]+)\1\)/g,function(_,quote,url){return 'url("'+new URL(url,sheet.href||location.href).href+'")';});}).join('\n');}catch(e){return '';}}).join('\n');
  var root=frame.attachShadow({mode:'closed'}),style=document.createElement('style');style.textContent=SWIPE_PREVIEW_STYLES;
  root.appendChild(style);
  var context=document.createElement('div');context.setAttribute('data-theme',document.documentElement.getAttribute('data-theme')||'light');context.style.display='contents';root.appendChild(context);
  var ancestors=[];for(var node=source.parentElement;node&&node!==document.body;node=node.parentElement)ancestors.unshift(node);
  ancestors.forEach(function(original){var shell=document.createElement('div');shell.className=original.className;Array.from(original.style).forEach(function(key){if(key.indexOf('--')===0)shell.style.setProperty(key,original.style.getPropertyValue(key));});shell.style.display='contents';context.appendChild(shell);context=shell;});
  context.appendChild(copy);
}
function swipeContentResolver(el){
  if(typeof el.matches!=='function')return function(){return [];};
  var selectors=['.rut-dpick-real','.rut-wpick-real','.boda-asg-grid','.energy-window-content','.energy-window','.ev-bday-body'];
  var selector=el.id?'#'+el.id:selectors.find(function(s){return el.matches(s);});
  if(!selector&&el.parentElement&&el.parentElement.matches('.energy-window-content'))selector='#energyAnalysisOverlay .energy-window-content > :first-child';
  var anchor=el.closest('[id]'),prefix=selector&&selector.charAt(0)!=='#'&&anchor&&anchor!==el?'#'+anchor.id+' ':'';
  function fixed(node){return node.matches('.econ-sub-tabs,.rut-sub-tabs,.boda-sub-tabs,.ev-annual-controls,.ev-io-row,.sy-header,.bday-header,.energy-year-nav,.ev-up-filters,.fiscal-hip-tabs,.est-nav,.boda-cal-nav,.ev-dow-row,.ev-week-hdr,.bday-week-hdr');}
  function content(node){
    if(!node)return [];
    var body=node.matches('.full-overlay,.energy-window')?node.querySelector('.sy-body'):node.querySelector(':scope > .sy-body');
    if(body)node=body;
    if(node.matches('.sy-body,.rut-sec,.boda-sec,.ev-bday-body,.ev-upcoming-content,.rut-dpick-real,.rut-wpick-real,.ev-month-wrap,.bday-calendar'))return Array.from(node.children).filter(function(n){return !fixed(n);}).reduce(function(out,n){return out.concat(n.matches('.rut-sec,.boda-sec,.ev-upcoming-content,.ev-month-wrap,.bday-calendar')?content(n):[n]);},[]);
    return [node];
  }
  return function(){return content(selector?document.querySelector(prefix+selector):el.isConnected?el:null);};
}
function swipeContentReset(nodes){nodes.forEach(function(n){n.style.translate='';});}
function animateContentSwipe(resolve,change,direction,offset){
  var nodes=resolve();swipeContentReset(nodes);
  if(!nodes.length){change();return;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){change();return;}
  var before=nodes.map(function(n){return n.outerHTML;}).join(''),shots=[];
  nodes.forEach(function(n){
    var r=n.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return;
    var parent=n.closest('.sy-body')||n.parentElement,clip=parent.getBoundingClientRect(),tabs=parent.querySelector(':scope > .econ-sub-tabs');
    var top=Math.max(0,r.top,clip.top,tabs?tabs.getBoundingClientRect().bottom:0),bottom=Math.min(innerHeight,r.bottom,clip.bottom);
    if(bottom<=top)return;
    var frame=document.createElement('div'),copy=n.cloneNode(true);
    copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(function(c){c.removeAttribute('id');});copy.inert=true;
    frame.className='swipe-content-preview';frame.setAttribute('aria-hidden','true');
    Object.assign(frame.style,{position:'fixed',left:r.left+'px',top:top+'px',width:r.width+'px',height:(bottom-top)+'px',overflow:'hidden',pointerEvents:'none',zIndex:'5000'});
    Object.assign(copy.style,{width:r.width+'px',height:r.height+'px',margin:'0',position:'absolute',left:'0',top:(r.top-top)+'px',translate:''});
    for(var paint=n;paint;paint=paint.parentElement){var background=getComputedStyle(paint).backgroundColor;if(background!=='rgba(0, 0, 0, 0)'&&background!=='transparent'){copy.style.backgroundColor=background;break;}}
    swipePreviewRoot(frame,copy,n);shots.push({frame:frame,copy:copy,width:r.width});
  });
  change();var fresh=resolve();
  if(before===fresh.map(function(n){return n.outerHTML;}).join(''))return;
  var duration=180,animations=[];
  shots.forEach(function(s){document.body.appendChild(s.frame);var a=s.copy.animate([{transform:'translateX('+(offset||0)+'px)'},{transform:'translateX('+(direction*s.width)+'px)'}],{duration:duration,easing:'ease-out'});animations.push(a);a.finished.catch(function(){}).then(function(){s.frame.remove();});});
  fresh.forEach(function(n){if(!n.getBoundingClientRect().width)return;var width=n.getBoundingClientRect().width;animations.push(n.animate([{translate:(-direction*width+(offset||0))+'px 0'},{translate:'0px 0'}],{duration:duration,easing:'ease-out'}));});
  // Una transición nueva sustituye a la anterior sin retener capas ni bloquear gestos.
  return function(){animations.forEach(function(a){a.cancel();});shots.forEach(function(s){s.frame.remove();});swipeContentReset(fresh);};
}
