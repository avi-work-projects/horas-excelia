const {test,expect}=require('@playwright/test');
test('consulta, etiquetas amplias, filtro combinado y edición individual persistente',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');if(!localStorage.getItem('qa-groups')){localStorage.setItem('qa-groups','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Ana',day:1,month:10,categories:['Familia','N.A.S.A.']},{name:'Luis',day:2,month:10,categories:['Familia']},{name:'Marta',day:3,month:10,categories:[]}]))}});
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
 await expect(page.locator('#bdClassify')).toHaveCount(0);
 await page.locator('.bday-list-item[data-bday-idx="0"]').click();
 await expect(page.locator('#bdCategories')).toContainText('Categorías · 2');
 await page.locator('#bdDEdit').click();await page.locator('#bdCategories').click();await expect(page.locator('[data-bd-category="Amigos N.A.S.A"]')).toBeVisible();
 await page.locator('[data-bd-category="Amigos Baile"]').check();await page.locator('#bdCategorySave').click();await expect(page.locator('#bdCategoryWrap')).toHaveCount(0);await page.locator('#bdFClose').click();await expect(page.locator('#bdFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>BDAYS[0].categories)).toEqual(['Familia','N.A.S.A.']);
 await page.locator('.bday-group-tools summary').click();await page.locator('[data-bd-filter="Amigos N.A.S.A"]').check();
 await expect(page.locator('.bday-list-item:visible')).toHaveCount(1);await expect(page.locator('#bdGroupResults')).toHaveText('1 de 3 personas');
 await page.locator('[data-bd-filter="__none"]').check();await expect(page.locator('.bday-list-item:visible')).toHaveCount(2);
 await page.locator('#bdSearch').fill('Marta');await expect(page.locator('.bday-list-item:visible')).toHaveCount(1);
 await page.locator('[data-bd-remove="__none"]').click();await expect(page.locator('#bdGroupEmpty')).toBeVisible();
 await page.locator('#bdClearGroups').click();await expect(page.locator('.bday-list-item:visible')).toHaveCount(1);
 await page.locator('#bdSearch').fill('');await page.locator('.bday-list-item[data-bday-idx="2"]').click();await page.locator('#bdDEdit').click();
 await page.locator('#bdCategories').click();await page.locator('[data-bd-category="Amigos N.A.S.A"]').check();await page.locator('#bdFNewCategory').fill('Equipo de prueba con una etiqueta bastante larga');await page.locator('#bdCategorySave').click();await expect(page.locator('#bdCategoryWrap')).toHaveCount(0);await page.locator('#bdFSave').click();
 await expect(page.locator('#bdFWrap')).toHaveCount(0);await page.reload();
 expect(await page.evaluate(()=>BDAYS[2].categories)).toEqual(['Amigos N.A.S.A','Equipo De Prueba Con Una Etiqueta Bastante Larga']);
});
test('próximos abre consulta con categorías y conserva acceso a alarma',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');const d=new Date();localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Persona de prueba',day:d.getDate(),month:d.getMonth()+1,categories:['N.A.S.A.'],vip:true}]))});
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('.bday-upcoming-item').first().click();
 await expect(page.locator('#bdCategories')).toContainText('Categorías · 1');await page.locator('#bdDAlarm').click();await expect(page.locator('#bdAlarmOv')).toBeVisible();
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

test('categorías unificadas, VIP directo y etiquetas opcionales con hoy anclado',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify(Array.from({length:120},(_,i)=>({name:'Persona '+i,day:i%28+1,month:Math.floor(i/10)+1,categories:['Amigos','N.A.S.A','Amigos N.A.S.A','amigos baile']}))))});
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
 expect(await page.evaluate(()=>bdayGroups(BDAYS[0]))).toEqual(['Amigos Baile','Amigos N.A.S.A']);
 await expect(page.locator('.bday-list-name .bday-group-tag')).toHaveCount(0);
 await page.locator('#bdShowGroups').click();await expect(page.locator('.bday-list-name .bday-group-tag').first()).toBeVisible();
 await page.locator('.bday-list-item').first().click();await page.locator('#bdDVip').check();expect(await page.evaluate(()=>BDAYS[0].vip)).toBe(true);
 await page.locator('#bdCategories').click();await page.locator('[data-bd-category="Familia"]').check();await page.locator('#bdCategorySave').click();await expect(page.locator('#bdCategoryWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-bdays-v1'))[0].categories)).toContain('Familia');
 await page.locator('#bdDClose').click();await expect(page.locator('#bdDWrap')).toHaveCount(0);
 const body=page.locator('#eventsOverlay .sy-body');await body.evaluate(el=>el.scrollTop=0);await expect(page.locator('#bdVipAll')).toBeHidden();
 await body.evaluate(el=>el.scrollTop=600);await expect(page.locator('#bdVipAll')).toBeVisible();
 await page.screenshot({path:'test-results/cumpleanos-etiquetas.png'});
 await page.locator('#bdVipAll').click();await expect(page.locator('.bday-today-item,.bday-today-line:not([hidden])').first()).toBeInViewport();
});
