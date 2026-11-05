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

for(const width of [320,400,440])test('Eventos de uno o dos días usan hasta dos líneas solo dentro de una semana '+width,async({page},info)=>{
 await page.setViewportSize({width,height:880});
 await page.clock.setFixedTime(new Date('2026-11-05T10:00:00+01:00'));
 await page.evaluate(()=>{
  EVENTS=[
   {id:'short-one',kind:'grande',type:'Plan exterior',title:'Plan exterior',start:'2026-11-07',end:'2026-11-07',barSize:'lg',color:'#568600'},
   {id:'short-two',kind:'grande',type:'Viaje',title:'Fin de semana tranquilo en la montaña',start:'2026-11-09',end:'2026-11-10',color:'#1946a0'},
   {id:'short-weekend',kind:'grande',type:'Viaje',title:'Ruta tranquila por la montaña',start:'2026-11-28',end:'2026-11-29',color:'#1946a0'},
   {id:'short-medium',kind:'grande',type:'Otros',title:'Cena especial',start:'2026-11-18',end:'2026-11-18',color:'#956c49'},
   {id:'thin-one',kind:'grande',type:'Otros',barSize:'sm',title:'Una barra fina de un día con título largo',start:'2026-11-21',end:'2026-11-21',color:'#956c49'},
   {id:'thin-two',kind:'grande',type:'Otros',barSize:'sm',title:'Una barra fina de dos días con título largo',start:'2026-11-26',end:'2026-11-27',color:'#956c49'},
   {id:'short-fit',kind:'grande',type:'Otros',title:'Sol',start:'2026-11-20',end:'2026-11-20',color:'#956c49'},
   {id:'cross-week',kind:'grande',type:'Viaje',title:'Un viaje que cruza la semana',start:'2026-11-15',end:'2026-11-16',color:'#1946a0'},
   {id:'longer',kind:'grande',type:'Viaje',title:'Un viaje de tres días',start:'2026-11-23',end:'2026-11-25',color:'#1946a0'}
  ];EV_YEAR=2026;EV_MONTH=10;refreshEvents(false);
 });
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
 for(const id of ['short-one','short-two','short-weekend','short-medium']){
  const title=page.locator('.ev-month-title[data-title-for="'+id+'"]');await expect(title).toHaveClass(/ev-title-short/);
  const size=await title.locator('.ev-month-title-text').evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight),clip:el.parentElement.getBoundingClientRect().height,overflow:el.scrollWidth>el.clientWidth+1}));
  expect(size.height).toBeGreaterThan(size.line*1.5);expect(size.height).toBeLessThanOrEqual(size.line*2+.5);expect(size.height).toBeLessThanOrEqual(size.clip+.5);expect(size.overflow).toBe(false);
 }
 const fit=await page.locator('[data-title-for="short-fit"] .ev-month-title-text').evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)}));expect(fit.height).toBeLessThan(fit.line*1.5);
 for(const id of ['thin-one','thin-two']){
  const title=page.locator('[data-title-for="'+id+'"]');await expect(title).not.toHaveClass(/ev-title-short/);
  const text=title.locator('.ev-month-title-text');await expect(text).toHaveCSS('white-space','nowrap');await expect(text).toHaveCSS('text-overflow','ellipsis');
  const size=await text.evaluate(el=>({height:el.getBoundingClientRect().height,line:parseFloat(getComputedStyle(el).lineHeight)}));expect(size.height).toBeLessThanOrEqual(size.line+.5);
 }
 await expect(page.locator('[data-title-for="cross-week"]')).toHaveCount(2);await expect(page.locator('[data-title-for="cross-week"].ev-title-short')).toHaveCount(0);await expect(page.locator('[data-title-for="longer"].ev-title-short')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('titulos-cortos-'+width+'.png'),animations:'disabled'});
 await page.locator('.ev-multi-bar[data-id="short-one"]').click();await expect(page.locator('#evDTitle')).toHaveText('Plan exterior');
});
