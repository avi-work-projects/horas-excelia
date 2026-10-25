// Preparación y fotografía: su huella invalida las escenas si cambia cómo se capturan.
const {expect}=require('@playwright/test');
const VIEWPORT={width:400,height:880},DATE='2026-08-21T10:00:00+02:00';
async function perform(page,action){
  if(typeof action==='string')await page.locator(action).first().click();
  else if(action.hold)await page.locator(action.hold).first().click({delay:750});
  else if(action.click)await page.locator(action.click).first().click(action.position?{position:action.position}:{});
  else if(action.fill)await page.locator(action.fill).first().fill(action.value);
  else if(action.file)await page.locator(action.file).setInputFiles({name:action.name,mimeType:action.mimeType||'application/json',buffer:Buffer.from(JSON.stringify(action.data))});
  else await page.locator(action.scroll).first().scrollIntoViewIfNeeded();
  await settle(page);
}
async function settle(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.waitForTimeout(380);}
async function setup(browser,url){
  const context=await browser.newContext({viewport:VIEWPORT,deviceScaleFactor:1,isMobile:true,hasTouch:true,timezoneId:'Europe/Madrid',locale:'es-ES',serviceWorkers:'block'});
  await context.route('**/*',route=>{
    const u=new URL(route.request().url());
    return u.origin===url||['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?route.continue():route.abort();
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date(DATE));
  const fixture=require('./fixture.cjs')();
  await page.addInitScript(data=>{sessionStorage.setItem('excelia-popup-dismissed','1');for(const [key,value]of Object.entries(data))if(key.startsWith('excelia-'))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-household-tab-v1','resumen');},fixture);
  await page.goto(url+'/index.html');await page.evaluate(()=>document.fonts.ready);await settle(page);
  if(await page.locator('#homePopupClose').isVisible()){await page.locator('#homePopupClose').click();await settle(page);}
  return {context,page,errors};
}
async function measure(page,scene,edges){
  await expect(page.locator(scene.ready).first()).toBeVisible();await settle(page);
  const outgoing=edges.filter(e=>e.from===scene.id),anchors={};
  for(const edge of outgoing){
    let b=await page.locator(edge.selector).first().boundingBox();
    if(b&&edge.action==='scroll'){const right=Math.min(VIEWPORT.width,b.x+b.width),bottom=Math.min(VIEWPORT.height,b.y+b.height);b={x:Math.max(0,b.x),y:Math.max(0,b.y),width:right-Math.max(0,b.x),height:bottom-Math.max(0,b.y)};}
    if(!b||b.x<0||b.y<0||b.x+b.width>VIEWPORT.width+1||b.y+b.height>VIEWPORT.height+1)throw new Error('Origen fuera de captura: '+scene.id+' → '+edge.to);
    if(edge.step&&edge.step.position)b={x:b.x+edge.step.position.x-3,y:b.y+edge.step.position.y-3,width:6,height:6};
    anchors[edge.to]=edge.action==='scroll'?{x:b.x+b.width-10,y:b.y+b.height*.55,width:8,height:Math.min(100,b.height*.25)}:{x:b.x,y:b.y,width:b.width,height:b.height};
  }
  const png=await page.screenshot({animations:'disabled'});
  const entryBox=scene.entry?await page.locator(scene.entry).first().boundingBox():null;
  return {anchors,entryBox,png};
}
module.exports={setup,perform,settle,measure,VIEWPORT,DATE};
