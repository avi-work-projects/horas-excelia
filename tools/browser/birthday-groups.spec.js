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
test('lista: hoy único, alternativa al filtrar y mes fijo durante scroll',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');const d=new Date();localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Hoy A',day:d.getDate(),month:d.getMonth()+1},{name:'Hoy B',day:d.getDate(),month:d.getMonth()+1},...Array.from({length:336},(_,i)=>({name:'Persona '+i,day:i%28+1,month:Math.floor(i/28)+1}))]));});
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
 await expect(page.locator('.bday-today-item')).toHaveCount(1);await expect(page.locator('.bday-today-line')).toBeHidden();
 const body=page.locator('#eventsOverlay .sy-body');
 await body.evaluate(el=>el.scrollTop+=80);
 expect(await page.evaluate(()=>{const b=document.querySelector('#eventsOverlay .sy-body'),h=b.querySelector('[data-month="'+new Date().getMonth()+'"] .bday-month-hdr');return Math.abs(h.getBoundingClientRect().top-b.getBoundingClientRect().top-b.querySelector('.bday-sub-tabs').offsetHeight)<2;})).toBe(true);
 await page.locator('#bdSearch').fill('no coincide');await expect(page.locator('.bday-today-item')).toHaveCount(0);await expect(page.locator('.bday-today-line')).toBeVisible();
});
