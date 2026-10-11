const {test,expect}=require('@playwright/test');
test.use({isMobile:true,hasTouch:true});
for(const width of [360,400])test(`fichas compactas del calendario ${width}`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:800});await page.clock.setFixedTime(new Date(2026,9,7,12));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
  localStorage.setItem('excelia-bodas-v1',JSON.stringify([{id:'couple-demo',name:'Ana y Carlos',color:'#fb923c',contracted:10}]));
  localStorage.setItem('excelia-events-v1',JSON.stringify([
   {id:'management-demo',kind:'puntual',type:'Pago',title:'Pago de prueba',start:'2026-10-07',end:'2026-10-07',color:'#35a36a'},
   {id:'wedding-demo',kind:'puntual',type:'Ensayos boda',title:'Ensayo — Ana y Carlos',start:'2026-10-07',end:'2026-10-07',color:'#fb923c',boda:{coupleId:'couple-demo',time:'21:00',place:'casa'}},
   {id:'other-demo',kind:'puntual',type:'Otros',title:'Otra cita',start:'2026-10-07',end:'2026-10-07',color:'#6b85de'}
  ]));
 });
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewCal').click();
 await page.locator('.ev-cell[data-ds="2026-10-07"] [data-id="management-demo"]').first().click();
 const sheet=page.locator('#evDetailOv .ev-car-sheet');await expect(sheet).toBeVisible();const original=await sheet.boundingBox();expect(original.height).toBeLessThanOrEqual(420);
 const date=await page.locator('.ev-detail-date-status .ev-detail-date').boundingBox(),state=await page.locator('.ev-management-check').boundingBox();expect(Math.abs(date.y+date.height/2-state.y-state.height/2)).toBeLessThan(1);
 await page.screenshot({path:testInfo.outputPath('gestion.png'),animations:'disabled'});
 await page.locator('#evManagementDone').check();await expect(page.locator('.ev-management-complete')).toBeVisible();expect(await sheet.boundingBox()).toEqual(original);
 while(!await page.locator('#evDTitle').filter({hasText:'Ensayo'}).count())await page.locator('#evCarNext').click();
 await expect(page.locator('.ev-bfila')).toHaveCount(3);await expect(page.locator('.ev-bficha')).toContainText('21:00');await expect(page.locator('.ev-bficha')).toContainText('Casa');
 expect(await sheet.boundingBox()).toEqual(original);
 expect(await page.locator('.ev-detail-body').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
 await expect(page.locator('.tasks-fab')).toBeHidden();
 await expect(page.locator('[data-bcampo="pareja"]')).toBeInViewport();await expect(page.locator('#evDEdit')).toBeInViewport();
 await page.screenshot({path:testInfo.outputPath('ensayo.png'),animations:'disabled'});
 await page.locator('[data-bcampo="hora"]').click();await expect(page.locator('#bodaTpOv')).toBeVisible();
});

