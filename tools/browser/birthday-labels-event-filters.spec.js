const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date(2026,9,11,12));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Ana',day:11,month:10,categories:['Familia'],vip:true},{name:'Luis',day:12,month:10,categories:['Amigos Baile']}]));});
 await page.goto('/');await page.locator('#eventsBtn').click();
});
test('etiquetas: selección previa, borrador, cancelar y guardar sin alterar VIP ni otras etiquetas',async({page},info)=>{
 await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
 await page.locator('#bdEditGroups').click();await page.locator('[data-bd-edit-group="Familia"]').click();
 const ana=page.locator('[data-bday-idx="0"].bday-list-item'),luis=page.locator('[data-bday-idx="1"].bday-list-item');
 await expect(ana).toHaveClass(/vip-active/);await expect(luis).toHaveClass(/vip-dim/);
 await luis.click();await expect(luis).toHaveClass(/vip-active/);expect(await page.evaluate(()=>BDAYS[1].categories)).toEqual(['Amigos Baile']);
 await page.locator('#bdCancelEdit').click();expect(await page.evaluate(()=>BDAYS[1].categories)).toEqual(['Amigos Baile']);
 await page.locator('#bdEditGroups').click();await page.locator('[data-bd-edit-group="Familia"]').click();await ana.click();await luis.click();
 await page.screenshot({path:info.outputPath('editar-etiquetas.png')});
 await page.locator('#bdEditGroups').click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-bdays-v1')))).toEqual([{name:'Ana',day:11,month:10,categories:[],vip:true},{name:'Luis',day:12,month:10,categories:['Amigos Baile','Familia']}]);
 await ana.click();await expect(page.locator('#bdDVip')).toBeVisible();const vip=await page.locator('#bdDVip').boundingBox(),days=await page.locator('.bd-detail-lbl').boundingBox();expect(Math.abs(vip.y+vip.height/2-days.y-days.height/2)).toBeLessThan(2);
 const colors=await page.locator('#bdDetailOv').evaluate(e=>['.bday-detail-alarm','.bday-detail-groups'].map(s=>getComputedStyle(e.querySelector(s)).backgroundColor));expect(colors[0]).not.toBe(colors[1]);
 await page.screenshot({path:info.outputPath('detalle.png')});
});
test('filtros múltiples conservan panel y tono, sin recortes ni botones inferiores',async({page},info)=>{
 await page.evaluate(()=>{EVENTS=[{id:'a',title:'Consulta',type:'Rec. Gestiones',kind:'puntual',start:'2026-10-15',end:'2026-10-15',color:'#328a70'},{id:'b',title:'Viaje',type:'Viaje',kind:'grande',start:'2026-10-15',end:'2026-10-16',color:'#3286ac'},{id:'c',title:'Otra',type:'Otros',kind:'grande',start:'2026-10-15',end:'2026-10-15',color:'#3286ac'}];});
 await page.locator('#evViewUpcoming').click();await page.locator('#evSubTodos').click();
 await expect(page.locator('#evAdd,#evImport')).toHaveCount(0);
 await page.locator('#evTypesFilter').click();const punctual=page.locator('[data-type="puntual|*"]'),panel=page.locator('.ev-filter-picker');
 await expect(panel).toBeVisible();
 const color=await punctual.evaluate(e=>getComputedStyle(e).backgroundColor),before=await panel.boundingBox();
 await punctual.click();await expect(panel).toBeVisible();await expect(punctual).toHaveCSS('background-color',color);
 await page.locator('[data-type="grande|*"]').click();await expect(punctual).toHaveAttribute('aria-pressed','false');await expect(page.locator('[data-type="grande|*"]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-type="grande|*"]').click();
 await page.locator('.ev-filter-category-group').last().locator('summary').press('Enter');await page.locator('[data-type="grande|Viaje"]').click();expect((await panel.boundingBox()).height).toBe(before.height);
 expect((await page.locator('#evTypeFilterDone').boundingBox()).height).toBeLessThan(60);await page.screenshot({path:info.outputPath('filtros.png')});await page.locator('#evTypeFilterDone').click();
 await expect(page.locator('.ev-list-item')).toHaveCount(1);
 for(const width of [320,400]){await page.setViewportSize({width,height:880});const size=await page.locator('#evTypesFilter span').first().evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));expect(size.scroll).toBeLessThanOrEqual(size.client+1);await page.screenshot({path:info.outputPath('todos-'+width+'.png')});}
 await page.locator('#evTypesFilter').click();await expect(page.locator('[data-type="grande|Viaje"]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-type="all"]').click();await page.locator('#evTypeFilterDone').click();await expect(page.locator('.ev-list-item')).toHaveCount(3);
});
