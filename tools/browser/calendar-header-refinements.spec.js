const {test,expect}=require('@playwright/test');
const {PNG}=require('../../node_modules/playwright-core/lib/utilsBundle.js');
test.use({timezoneId:'Europe/Madrid'});
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-16T14:37:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
});
async function settled(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});}
async function calendar(page,view){await page.evaluate(view=>{EV_VIEW=view;EV_YEAR=2026;EV_MONTH=8;EV_QUAD_YEAR=2026;EV_QUAD_MONTH=8;openEventsAt();},view);await settled(page);}
test('Selectores conservan fuentes y flechas originales; Hoy cuadrado y bombilla entre flecha y Hoy',async({page},info)=>{
 await expect(page.locator('#todayBtn')).toHaveCSS('border-radius','9px');
 for(const width of [320,360,400,440]){
  await page.setViewportSize({width,height:880});let reference;
  for(const view of ['cal','week','quad','annual']){
   await calendar(page,view);const header=page.locator('.ev-calendar-header');
   await expect(header.locator('.sy-year')).toHaveCSS('font-size',view==='quad'?'11.52px':'16.8px');
   for(const arrow of await header.locator('.sy-nav').all()){const r=await arrow.boundingBox();expect([r.width,r.height]).toEqual([32,32]);}
   const today=await page.locator('#evToday').boundingBox();if(reference)expect(today).toEqual(reference);reference=today;await expect(page.locator('#evToday')).toHaveCSS('border-radius','9px');
   const label=await header.locator('.sy-year').boundingBox();expect(Math.abs(label.x+label.width/2-width/2)).toBeLessThan(1);
   const overlaps=await header.evaluate(el=>{const buttons=[...el.querySelectorAll('button')].map(b=>({id:b.id,r:b.getBoundingClientRect()}));return buttons.flatMap((a,i)=>buttons.slice(i+1).filter(b=>Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>1&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>1).map(b=>[a.id,b.id]));});expect(overlaps,view+' '+width).toEqual([]);
   if(view==='cal'||view==='week'){
    const light=await page.locator('#evBright').boundingBox(),next=await page.locator('#evNext').boundingBox();
    if(width>=360){expect(light.x).toBeGreaterThan(next.x+next.width);expect(light.x+light.width).toBeLessThan(today.x);expect(Math.abs(light.x+light.width/2-(next.x+next.width+today.x)/2)).toBeLessThan(1);}
    else{expect(light.y+light.height).toBeLessThan(next.y);expect(light.x+light.width).toBeLessThan(today.x);}
   }
   await page.screenshot({path:info.outputPath(view+'-'+width+'.png')});
  }
 }
});
test('Separador continuo durante el arrastre, iniciales próximas y día actual con el fondo de Hoy',async({page},info)=>{
 await calendar(page,'cal');await page.evaluate(()=>{EV_MONTH=9;refreshEvents(false);});await settled(page);
 const header=await page.locator('.ev-calendar-header').boundingBox(),week=await page.locator('.ev-week-hdr').boundingBox();expect(week.y-header.y-header.height).toBe(4);
 const clip={x:0,y:header.y+header.height-1,width:400,height:1},before=await page.screenshot({clip});
 const line=PNG.sync.read(before),color=await page.locator('.ev-calendar-header').evaluate(el=>getComputedStyle(el).boxShadow.match(/rgb\(([^)]+)\)/)[1].split(',').map(Number));expect([...line.data.slice(40,43)]).toEqual(color);
 await page.evaluate(()=>{const el=document.getElementById('eventsOverlay');window.headerSwipe=createLiveSwipe(el,swipeContentResolver(el));});
 for(const dx of [-15,-150,80,180]){await page.evaluate(dx=>headerSwipe.move(dx),dx);expect(await page.screenshot({clip})).toEqual(before);await page.screenshot({path:info.outputPath('swipe-'+dx+'.png')});}
 await page.evaluate(()=>headerSwipe.cancel());expect(await page.screenshot({clip})).toEqual(before);
 for(const ds of ['2026-10-16','2026-10-18']){
  await page.clock.setFixedTime(new Date(ds+'T14:37:00+02:00'));await page.evaluate(()=>refreshEvents(false));await settled(page);
  const today=page.locator('.ev-cell.today-ev:not(.out-m)');await expect(today).toHaveAttribute('data-ds',ds);const background=await page.locator('#evToday').evaluate(el=>getComputedStyle(el).backgroundColor);await expect(today).toHaveCSS('background-color',background);await page.screenshot({path:info.outputPath('hoy-'+ds+'.png')});
 }
 await page.locator('#eventsContent>.sy-body').evaluate(el=>el.scrollTop=140);expect(await page.screenshot({clip})).toEqual(before);
});
test('Crear alarma centra el título y deja márgenes a Ahora sin cambiar su acción',async({page},info)=>{
 for(const width of [320,400]){
  await page.setViewportSize({width,height:880});await page.locator('#alarmTestBtn').click();await settled(page);
  const panel=await page.locator('#alarmPanel').boundingBox(),title=await page.locator('.alarm-panel-title').boundingBox(),now=await page.locator('#alarmNowBtn').boundingBox();
  expect(Math.abs(title.x+title.width/2-panel.x-panel.width/2)).toBeLessThan(1);expect(panel.x+panel.width-now.x-now.width).toBeGreaterThanOrEqual(12);expect(now.y-panel.y).toBeGreaterThanOrEqual(8);expect(title.x+title.width).toBeLessThan(now.x);
  await page.clock.setFixedTime(new Date('2026-10-16T19:42:00+02:00'));await page.locator('#alarmNowBtn').click();await expect(page.locator('#drumHour .drum-selected')).toHaveText('19');await expect(page.locator('#drumMin .drum-selected')).toHaveText('42');await page.screenshot({path:info.outputPath('alarma-'+width+'.png')});await page.keyboard.press('Escape');
 }
});
