const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
 await page.evaluate(()=>{BDAYS=[];RUTINAS=[];EVENTS=[];EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=7;openEventsAt();});
});
async function settled(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});}
for(const width of [320,400,440])test('Mes: fines de semana ajenos apagados y barras según ida/vuelta '+width,async({page},info)=>{
 await page.setViewportSize({width,height:880});await settled(page);
 for(const [month,outside,weekday,inside] of [[7,'2026-09-05','2026-09-01','2026-08-29'],[1,'2026-01-31','2026-01-30','2026-02-07']]){
  await page.evaluate(month=>{EV_MONTH=month;refreshEvents(false);},month);await settled(page);
  const read=ds=>page.locator('.ev-month-wrap .ev-cell[data-ds="'+ds+'"]').evaluate(el=>({background:getComputedStyle(el).backgroundColor,halo:getComputedStyle(el).getPropertyValue('--ev-marker-halo'),opacity:getComputedStyle(el.querySelector('.ev-num')).opacity}));
  const out=await read(outside),week=await read(weekday),current=await read(inside);expect(out.background).toBe(week.background);expect(out.background).not.toBe(current.background);expect(+out.opacity).toBeLessThan(+current.opacity);expect(out.halo).toBe(week.halo);
 }
 await page.evaluate(()=>{EV_MONTH=7;EVENTS=[{id:'travel-hours',kind:'grande',type:'Viaje',title:'Viaje de ejemplo',start:'2026-08-24',end:'2026-08-28',color:'#5b7db5',time:'09:00',viaje:{ida:{time:'15:00',modo:'tren'},vuelta:{time:'10:00',modo:'tren'}}}];refreshEvents(false);});await settled(page);
 const bar=page.locator('.ev-multi-bar[data-id="travel-hours"]');
 const start=await page.locator('.ev-cell[data-ds="2026-08-24"]').boundingBox(),end=await page.locator('.ev-cell[data-ds="2026-08-28"]').boundingBox(),box=await bar.boundingBox();
 expect(Math.abs(box.x-(start.x+start.width/2))).toBeLessThan(3);expect(Math.abs(box.x+box.width-(end.x+end.width/2))).toBeLessThan(3);
 await page.screenshot({path:info.outputPath('calendario-'+width+'.png'),animations:'disabled'});
 await page.evaluate(()=>{EVENTS[0].viaje.ida.time='12:59';EVENTS[0].viaje.vuelta.time='13:00';refreshEvents(false);});await settled(page);
 const full=await bar.boundingBox();expect(Math.abs(full.x-start.x)).toBeLessThan(3);expect(Math.abs(full.x+full.width-end.x-end.width)).toBeLessThan(3);
 await bar.click();await expect(page.locator('#evDetailOv.open')).toBeVisible();await expect(page.locator('#evDetailOv')).toContainText('12:59');await expect(page.locator('#evDetailOv')).toContainText('13:00');
});
