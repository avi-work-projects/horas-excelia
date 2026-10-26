const {test,expect}=require('@playwright/test');
const prefs=[{type:'Cena',time:'07:20'},{type:'Baile',time:'10:35'},{type:'Comida',time:null},{type:'Montaña',time:'19:45'}];
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(prefs=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');if(!localStorage.getItem('excelia-plan-order-v1'))localStorage.setItem('excelia-plan-order-v1',JSON.stringify(prefs));if(!localStorage.getItem('excelia-events-v1'))localStorage.setItem('excelia-events-v1',JSON.stringify([{id:'dance-old',type:'Baile',kind:'puntual',title:'Mi plan anterior',note:'Nota anterior',start:'2026-08-22',end:'2026-08-22',color:'#e03131'}]));},prefs);await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();
});
for(const width of [320,400,440])test('Cinco planes nuevos, bailar renombrado y creación persistida '+width,async({page},info)=>{
 await page.setViewportSize({width,height:880});await page.locator('#evAdd').click();await page.locator('[data-picker="plans"]').click();
 await expect(page.locator('#evPlanPickerOv [data-type="Salir a bailar"]')).toHaveCount(1);await expect(page.locator('#evPlanPickerOv [data-type="Baile"]')).toHaveCount(0);
 for(const type of ['Fiesta','Plan exterior','Navidad','Torneo','Fútbol']){
  const option=page.locator('#evPlanPickerOv [data-type="'+type+'"]');await option.scrollIntoViewIfNeeded();await expect(option).toBeInViewport();await expect(option.locator('svg')).toHaveCount(1);expect((await option.boundingBox()).height).toBeGreaterThanOrEqual(80);await option.click();await page.locator('#evPlanConfirm').click();
  await expect(page.locator('#evFTitle')).toHaveValue(type);await expect(page.locator('.ev-kind-picker')).toHaveAttribute('data-cur-type',type);await page.locator('[data-picker="plans"]').click();
 }
 await page.locator('#evPlanPickerOv [data-type="Fútbol"]').scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('planes-nuevos-'+width+'.png'),animations:'disabled'});
 const frame=await page.locator('.ev-plan-sheet').evaluate(el=>el.scrollWidth<=el.clientWidth);expect(frame).toBe(true);await expect(page.locator('#evPlanConfirm')).toBeInViewport();
 await page.locator('#evPlanPickerOv [data-type="Navidad"]').click();await page.locator('#evPlanConfirm').click();await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);await page.reload();
 const created=await page.evaluate(()=>EVENTS.find(ev=>ev.type==='Navidad'));expect(created).toMatchObject({kind:'puntual',title:'Navidad'});expect(created.time).toBeUndefined();
 expect(await page.evaluate(()=>appStorage.getItem(EV_PLAN_ORDER_KEY))).toBe(JSON.stringify(prefs));
});
test('El orden previo, Baile y su hora sobreviven a guardar, recargar e importar',async({page})=>{
 const check=async()=>{const rows=await page.evaluate(()=>evPlanOrderData().map(({type,time})=>({type,time})));expect(rows.slice(0,prefs.length)).toEqual(prefs.map(row=>({...row,type:row.type==='Baile'?'Salir a bailar':row.type})));for(const type of ['Fiesta','Plan exterior','Navidad','Torneo','Fútbol'])expect(rows.find(row=>row.type===type).time).toBeNull();};
 await check();await page.locator('#evUpcomingOrder').click();await expect(page.locator('[data-order-type="Salir a bailar"] input')).toHaveValue('10:35');await page.locator('#evOrderSave').click();await page.reload();await check();
 await page.evaluate(()=>{openEvents();openEvForm(EVENTS.find(ev=>ev.id==='dance-old'));});await expect(page.locator('.ev-kind-picker')).toHaveAttribute('data-cur-type','Salir a bailar');await expect(page.locator('#evFTitle')).toHaveValue('Mi plan anterior');await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>EVENTS.find(ev=>ev.id==='dance-old'))).toMatchObject({id:'dance-old',title:'Mi plan anterior',note:'Nota anterior',type:'Salir a bailar',start:'2026-08-22'});
 await page.evaluate(prefs=>applyFullImport({version:7,planOrder:prefs},'merge'),prefs);await page.reload();await check();
});
