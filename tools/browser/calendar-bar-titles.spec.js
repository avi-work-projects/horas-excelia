const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
 await page.evaluate(()=>{BDAYS=[];RUTINAS=[];EVENTS=[
  {id:'week-split',kind:'grande',type:'Asturias',title:'Asturias',color:'#1d4ed8',start:'2026-09-06',end:'2026-09-12',viaje:{ida:{time:'15:00'},vuelta:{time:'18:00'}}},
  {id:'month-split',kind:'grande',type:'Asturias',title:'Asturias',color:'#1d4ed8',start:'2026-09-30',end:'2026-10-04',viaje:{ida:{time:'15:00'},vuelta:{time:'18:00'}}},
  {id:'thin-overlap',kind:'grande',type:'Otros',barSize:'sm',title:'Plan de ejemplo',color:'#c46cab',start:'2026-10-03',end:'2026-10-04'},
  {id:'one-day',kind:'grande',type:'Asturias',title:'Un evento aislado con nombre largo',color:'#1d4ed8',start:'2026-09-14',end:'2026-09-14',time:'15:00'}
 ];EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=8;openEventsAt();});
});
for(const width of [320,400,440])test('Títulos cruzan el cambio de mes, capuchón proporcionado y domingo sin abreviatura '+width,async({page},info)=>{
 await page.setViewportSize({width,height:880});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
 const month=page.locator('.ev-month-title[data-title-for="month-split"]');
 const text=await month.locator('.ev-month-title-text').boundingBox(),label=await month.locator('.ev-month-title-label').boundingBox();
 expect(text.x).toBeGreaterThanOrEqual(label.x);expect(text.x+text.width).toBeLessThanOrEqual(label.x+label.width+1);
 expect(await month.locator('.ev-month-title-text').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 const first=page.locator('.ev-multi-bar[data-id="month-split"]').first(),firstBox=await first.boundingBox();expect(text.x+text.width).toBeGreaterThan(firstBox.x+firstBox.width);
 const svg=first.locator('svg'),size=await svg.boundingBox(),path=await svg.locator(':scope > path[fill]:not([fill="none"])').getAttribute('d');
 const arc=path.match(/ A ([\d.]+) ([\d.]+)/);expect(arc).not.toBeNull();const ratio=Number(arc[1])*size.width/(Number(arc[2])*size.height);expect(ratio).toBeGreaterThan(.7);expect(ratio).toBeLessThan(1.3);
 const weekly=page.locator('.ev-month-title[data-title-for="week-split"]');await expect(weekly).toHaveCount(2);
 const stub=await weekly.first().locator('.ev-month-title-text').boundingBox(),clip=await weekly.first().locator('.ev-month-title-label').boundingBox();expect(stub.y).toBeGreaterThanOrEqual(clip.y+clip.height-.5);
 const full=await weekly.last().locator('.ev-month-title-text').boundingBox(),fullClip=await weekly.last().locator('.ev-month-title-label').boundingBox();expect(full.y).toBeLessThan(fullClip.y+fullClip.height);expect(full.x+full.width).toBeLessThanOrEqual(fullClip.x+fullClip.width+1);
 await expect(page.locator('.ev-month-title[data-title-for="one-day"] .ev-title-optional')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('barras-'+width+'.png'),animations:'disabled'});
 await page.mouse.click(text.x+Math.min(20,text.width/2),text.y+text.height/2);await expect(page.locator('#evDetailOv.open')).toBeVisible();await expect(page.locator('#evDTitle')).toHaveText('Asturias');
});
test('Pasado y bombilla conservan el contraste sin atenuar el texto dos veces',async({page})=>{
 await page.waitForTimeout(350);
 await page.clock.setFixedTime(new Date('2026-10-26T10:00:00+01:00'));await page.evaluate(()=>refreshEvents(false));
 const title=page.locator('.ev-month-title[data-title-for="month-split"]');await expect(title).toHaveCSS('opacity','1');const before=await title.evaluate(el=>getComputedStyle(el).color);await page.locator('#evBright').click();await expect.poll(()=>page.evaluate(()=>EV_BRIGHT_PAST)).toBe(true);await expect(title).toHaveCSS('color','rgb(255, 255, 255)');expect(await title.evaluate(el=>getComputedStyle(el).color)).not.toBe(before);
});
