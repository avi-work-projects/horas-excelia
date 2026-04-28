/* ============================================================
   LOGO POPUP - Galeria horizontal de iconos al pulsar el logo
   Autocontenido, solo usa DOM. Cargado tras DOM (defer).
   ============================================================ */
(function(){
/* ── Logo gallery popup (horizontal scroll-snap) ── */
var _logoBtn=document.getElementById('appLogoBtn');
var _logoPopup=document.getElementById('logoPopup');
var _logoCloseBtn=document.getElementById('logoPopupClose');
var _logoGallery=document.getElementById('logoGallery');
var _logoDots=document.getElementById('logoGalleryDots');
var _logoCount=_logoGallery?_logoGallery.querySelectorAll('.logo-gallery-slide').length:0;
var _logoIdx=0;
function _logoUpdateDots(){
  if(!_logoDots)return;
  var h='';
  for(var i=0;i<_logoCount;i++)h+='<span class="logo-gallery-dot'+(i===_logoIdx?' active':'')+'"></span>';
  _logoDots.innerHTML=h;
}
if(_logoBtn&&_logoPopup){
  _logoBtn.addEventListener('click',function(){
    _logoIdx=0;
    if(_logoGallery)_logoGallery.scrollLeft=0;
    _logoUpdateDots();
    _logoPopup.classList.add('open');
  });
  _logoPopup.addEventListener('click',function(e){if(e.target===_logoPopup)_logoPopup.classList.remove('open');});
  if(_logoCloseBtn)_logoCloseBtn.addEventListener('click',function(){_logoPopup.classList.remove('open');});
  /* Sync dots on scroll */
  if(_logoGallery){
    _logoGallery.addEventListener('scroll',function(){
      var w=_logoGallery.offsetWidth;
      if(w>0){_logoIdx=Math.round(_logoGallery.scrollLeft/w);}
      _logoUpdateDots();
    });
    /* Dot clicks → scroll to slide */
    _logoDots.addEventListener('click',function(e){
      var dot=e.target.closest('.logo-gallery-dot');
      if(!dot)return;
      var dots=_logoDots.querySelectorAll('.logo-gallery-dot');
      for(var i=0;i<dots.length;i++){if(dots[i]===dot){
        _logoIdx=i;
        _logoGallery.scrollTo({left:i*_logoGallery.offsetWidth,behavior:'smooth'});
        _logoUpdateDots();
        break;
      }}
    });
  }
}
})();
