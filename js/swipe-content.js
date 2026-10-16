/* Un gesto ya autorizado mueve solo el contenido; navegación y acciones quedan fijas. */
var SWIPE_PREVIEW_STYLES=null;
var SWIPE_PREVIEW_SHEET=null;
// Espacio visible entre las dos vistas, también al completar la transición.
var SWIPE_CONTENT_GAP=24;
function swipeContentDistance(width){return width+SWIPE_CONTENT_GAP;}
var SWIPE_FIXED_SELECTOR='.econ-sub-tabs,.rut-sub-tabs,.boda-sub-tabs,.ev-annual-controls,.sy-header,.bday-header,.energy-year-nav,.fiscal-hip-tabs,.est-nav,.boda-cal-nav,.ev-dow-row,.bday-week-hdr';
function swipePreviewRoot(frame,copy,source,scene){
  // La copia solo pinta: sus clases tampoco participan en consultas ni listeners de la app.
  if(SWIPE_PREVIEW_STYLES===null)SWIPE_PREVIEW_STYLES=Array.from(document.styleSheets).map(function(sheet){try{return Array.from(sheet.cssRules).map(function(rule){return rule.cssText.replace(/url\((['"]?)([^'"\)]+)\1\)/g,function(_,quote,url){return 'url("'+new URL(url,sheet.href||location.href).href+'")';});}).join('\n');}catch(e){return '';}}).join('\n');
  var root=frame.attachShadow({mode:'closed'});
  if(typeof CSSStyleSheet==='function'&&CSSStyleSheet.prototype.replaceSync){if(!SWIPE_PREVIEW_SHEET){SWIPE_PREVIEW_SHEET=new CSSStyleSheet();SWIPE_PREVIEW_SHEET.replaceSync(SWIPE_PREVIEW_STYLES);}root.adoptedStyleSheets=[SWIPE_PREVIEW_SHEET];}
  else{var style=document.createElement('style');style.textContent=SWIPE_PREVIEW_STYLES;root.appendChild(style);}
  var context=document.createElement('div');context.setAttribute('data-theme',document.documentElement.getAttribute('data-theme')||'light');context.style.display='contents';root.appendChild(context);
  if(scene){var motion=document.createElement('style');motion.textContent='*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';root.appendChild(motion);context.appendChild(scene);return;}
  context.appendChild(copy);
}
function swipeContentResolver(el){
  if(typeof el.matches!=='function')return function(){return [];};
  var selectors=['.rut-dpick-real','.rut-wpick-real','.boda-asg-grid','.energy-window-content','.energy-window','.ev-bday-body'];
  var selector=el.id?'#'+el.id:selectors.find(function(s){return el.matches(s);});
  if(!selector&&el.parentElement&&el.parentElement.matches('.energy-window-content'))selector='#energyAnalysisOverlay .energy-window-content';
  var anchor=el.closest('[id]'),prefix=selector&&selector.charAt(0)!=='#'&&anchor&&anchor!==el?'#'+anchor.id+' ':'';
  function fixed(node){return node.matches(SWIPE_FIXED_SELECTOR);}
  function content(node){
    if(!node)return [];
    var body=node.matches('.full-overlay,.energy-window')?node.querySelector('.sy-body'):node.querySelector(':scope > .sy-body');
    if(body)node=body;
    if(node.matches('.sy-body,.rut-sec,.boda-sec,.boda-sticky-hd,.ev-bday-body,.ev-upcoming-content,.rut-dpick-real,.rut-wpick-real,.ev-month-wrap,.bday-calendar'))return Array.from(node.children).filter(function(n){return !fixed(n);}).reduce(function(out,n){return out.concat(n.matches('.rut-sec,.boda-sec,.boda-sticky-hd,.ev-upcoming-content,.ev-month-wrap,.bday-calendar')?content(n):[n]);},[]);
    return [node];
  }
  var resolve=function(root){return content(selector?(root||document).querySelector(prefix+selector):el.isConnected?el:null);};resolve.element=el;return resolve;
}
function swipeContentReset(nodes){nodes.forEach(function(n){n.style.translate='';});}
function animateContentSwipe(resolve,change,direction,offset){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){change();return;}
  var live=resolve.element&&createLiveSwipe(resolve.element,resolve);
  if(!live){change();return;}
  if(!live.move(offset||direction)){live.cancel();change();return;}
  live.finish(true,change);return live.cancel;
}
