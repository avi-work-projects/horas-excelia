const {test,expect}=require('@playwright/test');
const {PNG}=require('../../node_modules/playwright-core/lib/utilsBundle.js');

function difference(a,b){
 a=PNG.sync.read(a);b=PNG.sync.read(b);
 expect([a.width,a.height]).toEqual([b.width,b.height]);
 let changed=0;
 for(let i=0;i<a.data.length;i+=4){
  let delta=0;for(let c=0;c<3;c++)delta=Math.max(delta,Math.abs(a.data[i+c]-b.data[i+c]));
  if(delta>12)changed++;
 }
 return changed/(a.width*a.height);
}
async function settled(page){
 await page.evaluate(async()=>{
  await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
  await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));
 });
}
async function openView(page,view){
 await page.clock.setFixedTime(new Date('2026-10-15T12:00:00+02:00'));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
 });
 await page.goto('/');
 await page.evaluate(view=>{if(view!=='home'){EV_VIEW=view==='agenda'?'upcoming':'cal';EV_YEAR=2026;EV_MONTH=9;openEventsAt();}},view);
 await settled(page);
}

for(const profile of [{name:'normal',width:400,scale:1},{name:'móvil denso',width:440,scale:3}])test.describe(profile.name,()=>{
 test.use({viewport:{width:profile.width,height:880},deviceScaleFactor:profile.scale,isMobile:true});
 for(const view of ['home','cal','agenda'])test('El relevo visual conserva los píxeles en '+view,async({page},info)=>{
  await openView(page,view);
  // Una fase intermedia del aviso pulsante también debe conservarse en la copia.
  await page.evaluate(()=>document.getAnimations().filter(a=>a.effect.getTiming().iterations===Infinity).forEach(a=>{a.pause();a.currentTime=650;}));
  const clip=await page.evaluate(view=>{
   window.paintEl=document.querySelector(view==='home'?'#weeksContainer':'#eventsOverlay');
   const r=swipeLayoutViewport(paintEl,swipeContentResolver(paintEl)());
   // El borde redondeado cambia deliberadamente; comparar el contenido interior.
   return {x:r.left+18,y:r.top+18,width:r.width-36,height:r.height-36};
  },view);
  const before=await page.screenshot({clip,path:info.outputPath('inicio-real.png')});
  await page.evaluate(()=>{window.paintLive=createLiveSwipe(paintEl,swipeContentResolver(paintEl));paintLive.move(0);});
  const outgoing=await page.screenshot({clip,path:info.outputPath('inicio-copia.png')});
  await page.evaluate(view=>{
   paintLive.move(-180);paintLive.finish(true,()=>{
    if(view==='home'){CM++;render();}else if(view==='cal'){EV_MONTH++;refreshEvents();}else{_switchEvView('week');refreshEvents();}
   });
   // Inmovilizar el último fotograma para comparar copia y vista definitiva.
   document.querySelectorAll('.swipe-content-preview').forEach(f=>f.getAnimations().forEach(a=>{
    a.pause();a.currentTime=90;
    const transform=f.classList.contains('swipe-live-incoming')?'translateX(0px)':'translateX(-1000px)';
    a.effect.setKeyframes([{transform},{transform}]);
   }));
  },view);
  const preview=await page.screenshot({clip,path:info.outputPath('fin-copia.png')});
  await page.evaluate(()=>{paintLive.cancel();document.getAnimations().filter(a=>a.effect.getTiming().iterations===Infinity).forEach(a=>{a.pause();a.currentTime=0;});});
  const after=await page.screenshot({clip,path:info.outputPath('fin-real.png')});
  expect(difference(before,outgoing)).toBeLessThan(.001);
  expect(difference(preview,after)).toBeLessThan(.001);
 });
});

for(const commit of [true,false])test('El relevo cubre el primer pintado y reanuda los avisos: '+(commit?'confirmar':'cancelar'),async({page})=>{
 await openView(page,'home');
 const frames=await page.evaluate(async commit=>{
  const el=document.querySelector('#weeksContainer'),resolve=swipeContentResolver(el),live=createLiveSwipe(el,resolve);
  live.move(-180);live.finish(commit,()=>{CM++;render();});
  const rows=[];
  for(let i=0;i<40;i++){
   await new Promise(requestAnimationFrame);
   const covered=!!document.querySelector('.swipe-content-preview');
   rows.push({covered,visible:resolve().every(n=>getComputedStyle(n).visibility==='visible')});
   if(!covered)break;
  }
  return {rows,pulses:el.getAnimations({subtree:true}).filter(a=>a.effect.getTiming().iterations===Infinity).map(a=>a.playState)};
 },commit);
 expect(frames.rows.some(r=>r.covered&&r.visible)).toBe(true);
 expect(frames.rows.at(-1)).toEqual({covered:false,visible:true});
 expect(frames.pulses.length).toBeGreaterThan(0);expect(frames.pulses.every(s=>s==='running')).toBe(true);
});
