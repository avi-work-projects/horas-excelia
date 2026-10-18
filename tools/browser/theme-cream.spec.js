const {test,expect}=require('@playwright/test');

async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});}
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-theme-v1','grey');});
 await page.goto('/');await settle(page);
 await page.evaluate(()=>{const original=swipePreviewRoot;swipePreviewRoot=function(frame,copy,source,scene){window.themePreview=copy;return original(frame,copy,source,scene);};});
});

test('Crema conserva su paleta completa al alternar temas y previsualizar pestañas',async({page})=>{
 for(const theme of ['light','grey','dark','grey']){
  await page.evaluate(theme=>{applyTheme(theme);EV_VIEW='upcoming';EV_YEAR=2026;EV_MONTH=9;openEventsAt();},theme);await settle(page);
  const source=await page.evaluate(()=>{const el=document.getElementById('eventsOverlay');return {surface:getComputedStyle(el).backgroundColor,text:getComputedStyle(el).color,accent:getComputedStyle(el).getPropertyValue('--upcoming-tone').trim()};});
  await page.evaluate(()=>{const el=document.getElementById('eventsOverlay');window.themeGesture=createLiveSwipe(el,swipeContentResolver(el));themeGesture.move(-180);});
  expect(await page.evaluate(()=>{const el=themePreview.getRootNode().querySelector('#eventsOverlay');return {surface:getComputedStyle(el).backgroundColor,text:getComputedStyle(el).color,accent:getComputedStyle(el).getPropertyValue('--upcoming-tone').trim()};})).toEqual(source);
  await page.evaluate(()=>themeGesture.cancel());
 }
});

test('Los acentos crema son propios y legibles en botones rellenos',async({page})=>{
 const colors=await page.evaluate(()=>{
  const keys=['--accent','--home-tone','--calendar-tone','--household-tone','--upcoming-tone','--birthday-tone','--c-orange','--c-red','--c-green','--c-blue','--c-purple','--c-yellow'];
  const read=()=>Object.fromEntries(keys.map(k=>[k,getComputedStyle(document.documentElement).getPropertyValue(k).trim()]));
  const cream=read();applyTheme('light');const light=read();applyTheme('grey');return {cream,light};
 });
 const luminance=hex=>{const a=hex.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
 for(const [key,color] of Object.entries(colors.cream)){
  expect(color,key).not.toBe(colors.light[key]);
  expect(1.05/(luminance(color)+.05),key+' sobre blanco').toBeGreaterThanOrEqual(4.5);
 }
});
