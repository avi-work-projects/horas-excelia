const {test,expect}=require('@playwright/test');
test.use({isMobile:true,hasTouch:true});

for(const width of [360,400,440])for(const theme of ['dark','light']){
 test(`cumpleaños: geometría y revisión visual ${width}px ${theme}`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:880});
  await page.addInitScript(()=>{
   sessionStorage.setItem('excelia-popup-dismissed','1');
   const today=new Date();
   localStorage.setItem('excelia-bdays-v1',JSON.stringify([
    {name:'Persona Con Nombre Largo De Prueba',day:today.getDate(),month:today.getMonth()+1,categories:['Amigos N.A.S.A','Familia Cercana'],vip:true},
    ...Array.from({length:120},(_,i)=>({name:'Persona '+i,day:i%28+1,month:Math.floor(i/10)+1,categories:['Amigos Baile']}))
   ]));
  });
  await page.goto('/');
  await page.evaluate(theme=>document.documentElement.setAttribute('data-theme',theme),theme);
  await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
  const body=page.locator('#eventsOverlay .sy-body');await body.evaluate(el=>el.scrollTop=0);
  await expect(page.locator('#bdVipAll')).toBeInViewport();
  const todayStart=await page.locator('#bdVipAll').boundingBox();
  const firstHeader=await page.locator('.bday-month-hdr').first().boundingBox();
  expect(Math.abs(todayStart.y-firstHeader.y)).toBeLessThan(8);
  await page.screenshot({animations:'disabled',path:testInfo.outputPath('lista-inicial.png')});
  await page.locator('.bday-group-tools summary').click();
  const filters=page.locator('[data-bd-filter]');
  await expect(page.locator('.bday-group-tools input[type=checkbox]')).toHaveCount(0);
  const grid=await filters.evaluateAll(els=>els.slice(0,6).map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,overflow:el.scrollWidth>el.clientWidth};}));
  const cols=width<390?2:3;
  expect(grid.filter(r=>Math.abs(r.y-grid[0].y)<1)).toHaveLength(cols);
  expect(grid.every(r=>r.h>=44&&!r.overflow)).toBe(true);
  const family=page.locator('[data-bd-filter="Familia Cercana"]');
  await family.click();await expect(family).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.bday-list-item:visible')).toHaveCount(1);
  await page.screenshot({animations:'disabled',path:testInfo.outputPath('filtros.png')});
  await family.click();await expect(family).toHaveAttribute('aria-pressed','false');
  await page.locator('.bday-group-tools summary').click();
  await page.locator('#bdShowGroups').click();await expect(page.locator('#bdShowGroups')).toHaveAttribute('aria-pressed','true');
  await body.evaluate(el=>el.scrollTop=600);
  await expect(page.locator('#bdVipAll')).toBeInViewport();
  await page.locator('#bdVipAll').click();
  await expect(page.locator('.bday-today-item')).toBeInViewport();
  const badge=await page.locator('.bday-today-item').evaluate(el=>{const s=getComputedStyle(el,'::after');return {border:s.borderTopWidth,radius:s.borderRadius,bg:s.backgroundColor,page:getComputedStyle(document.body).backgroundColor};});
  expect(badge.border).toBe('2px');expect(badge.radius).toBe('6px');expect(badge.bg).toBe(badge.page);
  await page.screenshot({animations:'disabled',path:testInfo.outputPath('hoy.png')});
  await page.locator('.bday-list-item[data-bday-idx="0"]').click();
  const sheet=page.locator('#bdDetailOv .bd-detail-sheet');
  await expect(sheet).toBeVisible();
  await expect(page.locator('#bdPersonGroups .bday-group-tag')).toHaveText(['Amigos N.A.S.A','Familia Cercana']);
  const before=await sheet.boundingBox();
  await page.locator('#bdDVip').uncheck();expect(await sheet.boundingBox()).toEqual(before);
  await page.locator('#bdDVip').check();expect(await sheet.boundingBox()).toEqual(before);
  await page.screenshot({animations:'disabled',path:testInfo.outputPath('ficha.png')});
  await page.locator('#bdCategories').click();await expect(page.locator('#bdCategoryOv.open')).toBeVisible();
  await page.screenshot({animations:'disabled',path:testInfo.outputPath('selector.png')});
  await page.locator('[data-bd-category="Amigos Baile"]').click();await page.locator('#bdCategorySave').click();
  await expect(page.locator('#bdCategoryWrap')).toHaveCount(0);
  expect(await sheet.boundingBox()).toEqual(before);
  await expect(page.locator('#bdPersonGroups .bday-group-tag')).toHaveText(['Amigos Baile','Amigos N.A.S.A','Familia Cercana']);
  const vipGeometry=await page.locator('.bday-person-vip').evaluate(el=>({check:el.querySelector('input').getBoundingClientRect().right,icon:el.querySelector('img').getBoundingClientRect().left}));
  expect(vipGeometry.check).toBeLessThan(vipGeometry.icon);
  await page.locator('#bdDEdit').click();await expect(page.locator('#bdFormOv')).toBeVisible();
  const form=page.locator('#bdFormOv .bd-form-sheet');const formBefore=await form.boundingBox();
  await page.locator('#bdFVip').uncheck();expect(await form.boundingBox()).toEqual(formBefore);
  const formVip=await page.locator('#bdFVip').evaluate(el=>({check:el.getBoundingClientRect().right,icon:el.nextElementSibling.getBoundingClientRect().left}));
  expect(formVip.check).toBeLessThan(formVip.icon);
  await page.screenshot({animations:'disabled',path:testInfo.outputPath('editar.png')});
 });
}
