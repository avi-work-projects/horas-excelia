const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date(2026,9,13,12));await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');
});
test('cumpleaños de Próximos: título, VIP celeste y Añadir centrado',async({page},info)=>{
 await page.locator('#eventsBtn').click();await page.locator('#evUpBirthdays').click();
 for(const width of [320,400]){
  await page.setViewportSize({width,height:880});await expect(page.locator('#eventsContent>.sy-header .sy-year')).toHaveText('Próximos Cumpleaños');
  const vip=page.locator('.ev-up-filters .bday-header-vip'),add=page.locator('#evBdayAdd');const v=await vip.boundingBox(),a=await add.boundingBox();expect(Math.abs(a.x+a.width/2-width/2)).toBeLessThan(1);expect(Math.abs(a.y+a.height/2-v.y-v.height/2)).toBeLessThan(1);
  await expect(vip.locator('input')).toHaveCSS('color','rgb(86, 182, 224)');await expect(page.locator('#eventsContent>.sy-header #evBdayAdd')).toHaveCount(0);
  await page.screenshot({path:info.outputPath('cumpleanos-'+width+'.png')});
 }
 await page.locator('#evBdayAdd').click();await expect(page.locator('#bdFName')).toBeVisible();
});
test('carrusel: arrastre muestra la siguiente ficha, cancela, navega y mantiene el día',async({page},info)=>{
 await page.locator('#eventsBtn').click();await page.evaluate(()=>{
  EVENTS=[{id:'one',kind:'puntual',type:'Pago',title:'Primera gestión',start:'2026-10-13',end:'2026-10-13',color:'#dcae3e'},{id:'two',kind:'puntual',type:'Otros',shape:'leaf',title:'Limpieza de prueba',start:'2026-10-13',end:'2026-10-13',color:'#3ba780'}];EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=9;refreshEvents();openEvDayCarousel('2026-10-13','one');
 });
 const sheet=page.locator('#evDetailOv>.ev-car-sheet:not(.ev-car-preview)'),title=page.locator('#evDTitle');
 for(const width of [320,400]){await page.setViewportSize({width,height:880});const t=await page.locator('.ev-detail-day-title').boundingBox();expect(Math.abs(t.x+t.width/2-width/2)).toBeLessThan(1);await expect(page.locator('#evDAlarm')).toContainText('🔔');await expect(page.locator('#evDAlarm')).toHaveCSS('border-radius','14px');}
 await expect(page.locator('#eventsOverlay')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
 const original=await sheet.boundingBox();const heading=await page.locator('.ev-detail-heading').boundingBox();const x=heading.x+heading.width*.7,y=heading.y+15;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-45,y,{steps:5});await expect(page.locator('.ev-car-preview')).toHaveCount(2);await expect(title).toHaveText('Primera gestión');
 const preview=await page.locator('.ev-car-preview').last().boundingBox();expect(preview.x).toBeLessThan(400);await page.screenshot({path:info.outputPath('arrastre.png')});
 const current=await page.locator('.ev-car-content:not(.ev-car-preview)').boundingBox();expect(preview.x-current.x-current.width).toBeCloseTo(24,0);
 expect(await page.locator('[id]').evaluateAll(els=>els.map(e=>e.id).filter((id,i,ids)=>ids.indexOf(id)!==i))).toEqual([]);
 await page.mouse.up();await expect(page.locator('.ev-car-preview')).toHaveCount(0);await expect(title).toHaveText('Primera gestión');expect(await sheet.boundingBox()).toEqual(original);
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-150,y,{steps:8});await page.mouse.up();await expect(title).toHaveText('Limpieza de prueba');await expect(page.locator('.ev-car-preview')).toHaveCount(0);expect(await sheet.boundingBox()).toEqual(original);expect(await page.evaluate(()=>EV_MONTH)).toBe(9);
 await page.screenshot({path:info.outputPath('limpieza.png')});
 // Gesto táctil nativo: el siguiente panel acompaña al dedo antes de soltarlo.
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:240,y}]});await expect(page.locator('.ev-car-preview')).toHaveCount(2);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(title).toHaveText('Primera gestión');
 await page.locator('#evDAlarm').click();await expect(page.locator('#evAlarmCreate')).toBeVisible();
});
test('las cuatro gestiones aparecen como tareas verdes dentro de su mes y se completan una sola vez',async({page})=>{
 await page.evaluate(()=>{EVENTS=['Enviar factura','Pago','Pago Hacienda','Presentar Modelo'].map((type,i)=>({id:'m'+i,kind:'puntual',type,title:type,start:'2026-10-28'})).concat([{id:'next',kind:'puntual',type:'Pago',title:'Noviembre',start:'2026-11-01'}]);});
 expect(await page.evaluate(()=>tasksItems(tasksData(),'pending').map(t=>t.color))).toEqual(['green','green','green','green']);
 await page.evaluate(()=>openHomePopup(true));await expect(page.locator('#homeTasksOpen')).toContainText('Mis tareas (4)');
 await page.evaluate(()=>{tasksSetEventDone(EVENTS[0],'2026-10-28',true);openHomePopup(true);});await expect(page.locator('#homeTasksOpen')).toContainText('Mis tareas (3)');
 expect(await page.evaluate(()=>tasksData().items.length)).toBe(4);
});
