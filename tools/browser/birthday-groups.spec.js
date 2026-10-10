const {test,expect}=require('@playwright/test');
test('categorías: varias por persona, filtros OR, cancelar y persistencia',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');if(!localStorage.getItem('qa-groups')){localStorage.setItem('qa-groups','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Ana',day:1,month:10},{name:'Luis',day:2,month:10},{name:'Marta',day:3,month:10}]));}});
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();await page.locator('#bdClassify').click();
 await page.locator('[data-person="0"]').check();
 await page.locator('#bdGroupsTabs').getByRole('button',{name:'Familia',exact:true}).click();await page.locator('[data-person="0"]').check();await page.locator('[data-person="1"]').check();
 await page.locator('#bdGroupNew').fill('Equipo de prueba');await page.locator('#bdGroupCreate').click();await page.locator('[data-person="2"]').check();await page.locator('#bdGroupsSave').click();await expect(page.locator('#bdGroupsWrap')).toHaveCount(0);
 const people=await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-bdays-v1')));expect(people[0].categories).toEqual(['Amigos Oviedo','Familia']);expect(people[2].categories).toEqual(['Equipo de prueba']);
 await page.locator('.bday-group-tools summary').click();await page.locator('[data-bd-filter="Amigos Oviedo"]').check();await page.locator('[data-bd-filter="Equipo de prueba"]').check();await expect(page.locator('.bday-list-item:visible')).toHaveCount(2);
 await page.locator('#bdClassify').click();await page.locator('[data-person="0"]').uncheck();await page.locator('#bdGroupsClose').click();await expect(page.locator('#bdGroupsWrap')).toHaveCount(0);expect(await page.evaluate(()=>BDAYS[0].categories)).toEqual(['Amigos Oviedo','Familia']);
 await page.reload();expect(await page.evaluate(()=>BDAYS[2].categories)).toEqual(['Equipo de prueba']);
});
