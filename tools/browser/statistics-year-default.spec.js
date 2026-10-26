const {test,expect}=require('@playwright/test');
test('Agenda, Todos y Estadísticas comparten geometría y flechas neutras; año actual y Total explícito',async({page},info)=>{
 await page.clock.setFixedTime(new Date(2026,9,12,12));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
 await page.evaluate(()=>{EV_TYPES_PAST=false;EVENTS=[{id:'old',kind:'grande',type:'Viaje',title:'Viaje anterior',start:'2025-01-01',end:'2025-01-02',color:'#328a70'},{id:'current',kind:'grande',type:'Viaje',title:'Viaje actual',start:'2026-01-01',end:'2026-01-02',color:'#328a70'}];});
 await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();
 for(const width of [320,400]){
  await page.setViewportSize({width,height:880});await page.locator('#evSubAgenda').click();
  const header=page.locator('#eventsContent .sy-header'),tabs=page.locator('.ev-upcoming-tabs');
  const reference=await header.boundingBox(),tabBox=await tabs.boundingBox(),prev=await page.locator('#evPrev').boundingBox(),next=await page.locator('#evNext').boundingBox();
  const colors=await page.locator('#evPrev').evaluate(el=>{const s=getComputedStyle(el);return {color:s.color,border:s.borderTopColor,background:s.backgroundColor};});
  await page.screenshot({path:info.outputPath('agenda-'+width+'.png')});
  for(const [tab,prefix,scope] of [['evSubTodos','evList','list'],['evSubStats','evStats','stats']]){
   await page.locator('#'+tab).click();await expect(page.locator('#'+prefix+'Year')).toHaveText('2026');
   expect(await header.boundingBox()).toEqual(reference);expect(await tabs.boundingBox()).toEqual(tabBox);
   expect(await page.locator('[data-'+scope+'-year="-1"]').boundingBox()).toEqual(prev);expect(await page.locator('[data-'+scope+'-year="1"]').boundingBox()).toEqual(next);
   const year=await page.locator('#'+prefix+'Year').boundingBox();expect(Math.abs(year.x+year.width/2-width/2)).toBeLessThan(1);
   for(const button of await page.locator('[data-'+scope+'-year]').all()){await expect(button).toHaveCSS('color',colors.color);await expect(button).toHaveCSS('border-top-color',colors.border);await expect(button).toHaveCSS('background-color',colors.background);}
   const total=await page.locator('#'+prefix+'Total').boundingBox();expect(next.x+next.width).toBeLessThan(total.x);
   await expect(header.locator('#'+prefix+'Year')).toHaveCount(1);await expect(page.locator('.sy-body #'+prefix+'Year')).toHaveCount(0);
   await page.screenshot({path:info.outputPath(scope+'-'+width+'.png')});
  }
 }
 await page.locator('[data-stats-year="-1"]').click();await expect(page.locator('#evStatsYear')).toHaveText('2025');await page.locator('#evStatsTotal').click();await expect(page.locator('#evStatsYear')).toBeHidden();await expect(page.locator('.ev-stat-cards strong').first()).toHaveText('2');await page.locator('#evStatsTotal').click();await expect(page.locator('#evStatsYear')).toHaveText('2025');
 await page.locator('#evSubTodos').click();await expect(page.locator('.ev-list-item')).toHaveCount(1);await expect(page.locator('.ev-list-item')).toContainText('Viaje actual');await page.locator('[data-list-year="-1"]').click();await expect(page.locator('.ev-list-item')).toContainText('Viaje anterior');
 const before=await page.locator('#eventsContent .sy-header').boundingBox();await page.locator('#evListTotal').click();await expect(page.locator('#evListYear')).toBeHidden();await expect(page.locator('[data-list-year="1"]')).toBeHidden();await expect(page.locator('.ev-list-item')).toHaveCount(2);expect(await page.locator('#eventsContent .sy-header').boundingBox()).toEqual(before);await page.screenshot({path:info.outputPath('todos-total.png')});
 await page.locator('#evListSearch').fill('anterior');await expect(page.locator('.ev-list-item')).toHaveCount(1);await page.locator('#evListTotal').click();await expect(page.locator('#evListYear')).toHaveText('2025');await expect(page.locator('#evListSearch')).toHaveValue('anterior');
});
