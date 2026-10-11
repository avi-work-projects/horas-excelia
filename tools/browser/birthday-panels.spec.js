const {test,expect}=require('@playwright/test');
test.use({isMobile:true,hasTouch:true,viewport:{width:400,height:880}});
test('filas VIP uniformes y acceso al configurador de alarma',async({page},testInfo)=>{
 await page.clock.setFixedTime(new Date(2026,9,11,12));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  localStorage.setItem('excelia-theme-v1','light');
  localStorage.setItem('excelia-nav-icons-v1','professional');
  localStorage.setItem('excelia-bdays-v1',JSON.stringify([
   {name:'Ana Prueba',day:11,month:10,vip:true,categories:['Amigos Baile']},
   {name:'Luis Prueba',day:11,month:10,vip:false,categories:['Amigos Baile']}
  ]));
 });
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
 const rows=page.locator('.bday-list-item');
 for(const labels of [false,true]){
  if(labels)await page.locator('#bdShowGroups').click();
  const heights=await rows.evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));
  expect(heights).toHaveLength(2);expect(heights[0]).toBe(heights[1]);
  const icon=await rows.first().locator('.bday-vip-img').boundingBox(),row=await rows.first().boundingBox();
  expect(icon.height).toBeGreaterThanOrEqual(32);expect(icon.y).toBeGreaterThanOrEqual(row.y);expect(icon.y+icon.height).toBeLessThanOrEqual(row.y+row.height);
  await page.screenshot({path:testInfo.outputPath(labels?'filas-etiquetas.png':'filas.png')});
 }
 await rows.first().click();
 await page.locator('#bdDEdit').click();await expect(page.locator('#bdFormOv')).toBeVisible();
 await page.locator('#bdFName').fill('Borrador sin guardar');await page.locator('#bdFClose').click();
 await expect(page.locator('#bdDetailOv')).toBeVisible();await expect(page.locator('.bd-detail-name')).toContainText('Ana Prueba');
 await expect(page.locator('.bday-person-summary')).toHaveCSS('border-top-width','0px');
 for(const selector of ['.bday-detail-groups','.bday-detail-alarm']){
  await expect(page.locator('#bdDetailOv '+selector)).toHaveCSS('border-top-width','1px');
  await expect(page.locator('#bdDetailOv '+selector)).toHaveCSS('box-shadow','none');
  await expect(page.locator('#bdDetailOv '+selector)).toHaveCSS('border-radius','12px');
 }
 await page.locator('#bdDAlarm').click();await expect(page.locator('#bdAlarmOv')).toBeVisible();
 await expect(page.locator('#bdAlarmPoner')).toBeVisible();await expect(page.locator('#bdAlarmH2')).toBeVisible();
 await expect(page.locator('#bdAlarmCreate')).toBeVisible();
 await page.screenshot({path:testInfo.outputPath('alarma.png')});
});
