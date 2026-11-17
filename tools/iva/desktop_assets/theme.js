'use strict';
(() => {
  const media = matchMedia('(prefers-color-scheme: light)');
  function apply(choice) {
    if (choice!=='light' && choice!=='dark') {
      choice=null;
      try { choice = localStorage.getItem('kairo-color-mode'); } catch {}
    }
    const light = choice ? choice === 'light' : media.matches;
    document.documentElement.dataset.kTheme = light ? 'light' : 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',light?'#f3f7ef':'#142722');
    const toggle=document.getElementById('theme-toggle');
    if(toggle){const label=light?'Cambiar a modo oscuro':'Cambiar a modo claro';toggle.title=label;toggle.setAttribute('aria-label',label);}
  }
  apply(); media.addEventListener('change',apply); window.addEventListener('storage',apply);
  document.addEventListener('DOMContentLoaded',()=>{
    const button=document.getElementById('theme-toggle');
    if(button&&!button.querySelector('svg'))button.innerHTML='<svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true"><path d="M20 14a8.5 8.5 0 0 1-10-11 9 9 0 1 0 10 11Z"/></svg>';
    apply();
    document.getElementById('theme-toggle')?.addEventListener('click',()=>{
      const next=document.documentElement.dataset.kTheme==='light'?'dark':'light';
      try{localStorage.setItem('kairo-color-mode',next);}catch{}
      apply(next);
    });
  });
})();
