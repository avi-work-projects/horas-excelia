const {test,expect}=require('@playwright/test');
const fixture=require('../visual-map/fixture.cjs');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
 await page.addInitScript(data=>{for(const [key,value]of Object.entries(data))localStorage.setItem(key,JSON.stringify(value));sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');},fixture());
 await page.goto('/');if(await page.locator('#homePopupClose').isVisible())await page.locator('#homePopupClose').click();
});
for(const width of [320,400,440])test(`Tareas: tamaño compartido y selección desde tarjeta, texto y teclado ${width}`,async({page},info)=>{
 await page.setViewportSize({width,height:880});
 await page.locator('#menuBtn').click();const settings=await page.locator('#settingsReminders').boundingBox();await page.locator('#menuBtn').click();
 await page.evaluate(()=>tasksCreate('Tarjeta de prueba'));await page.locator('#tasksFab').click();
 const reminders=await page.locator('#tasksReminders').boundingBox();expect(reminders.width).toBe(settings.width);expect(reminders.height).toBe(settings.height);
 expect(await page.locator('.tasks-header').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 const row=page.locator('.task-row').filter({has:page.getByRole('button',{name:'Tarjeta de prueba',exact:true})}),check=row.locator('input[type=checkbox]'),title=row.locator('.task-title');
 await row.click({position:{x:3,y:3}});await expect(check).toBeChecked();await expect(title).toHaveAttribute('aria-pressed','true');await expect(row.locator('.task-editor')).toHaveCount(0);
 await title.click();await expect(check).not.toBeChecked();await expect(row.locator('.task-editor')).toHaveCount(0);
 await title.press('Space');await expect(check).toBeChecked();await check.click();await expect(check).not.toBeChecked();
 await row.locator('.task-more').click();await expect(row.locator('.task-editor')).toBeVisible();await expect(check).not.toBeChecked();
 await row.locator('input[name=title]').fill('Tarjeta de prueba');await expect(check).not.toBeChecked();
 await row.locator('[data-color=blue]').click();await expect(check).not.toBeChecked();await row.locator('.task-more').click();await expect(row.locator('.task-editor')).toHaveCount(0);
 await title.click();await page.locator('#tasksMoveCompleted').click();await page.locator('[data-tasks-view=done]').click();await expect(check).toBeChecked();await title.click();await page.locator('[data-tasks-view=pending]').click();await expect(check).not.toBeChecked();
 await page.screenshot({path:info.outputPath('tareas.png'),animations:'disabled'});
 await page.locator('#tasksReminders').click();await expect(page.locator('#homePopup')).toBeVisible();
});
test('Tareas: la tarjeta respeta la elección de fecha anterior',async({page})=>{
 await page.evaluate(()=>{const old=new Date('2026-08-20T10:00:00+02:00').getTime();tasksSave({items:[{id:'old-card',title:'Recuperar fecha de prueba',createdAt:old,updatedAt:old,completedAt:null,lastCompletedAt:old,pendingVisible:true}],weeklyReminder:true,reminderWeek:''});});
 await page.locator('#tasksFab').click();const row=page.locator('[data-task-id=old-card]');
 await row.locator('.task-title').click();await expect(row.locator('.task-date-choice')).toBeVisible();await expect(row.locator('.task-editor')).toHaveCount(0);
 await row.locator('[data-task-action=date-cancel]').click();await expect(row.locator('input[type=checkbox]')).not.toBeChecked();
 await row.click({position:{x:3,y:3}});await row.locator('[data-task-action=date-original]').click();await expect(row.locator('input[type=checkbox]')).toBeChecked();
 expect(await page.evaluate(()=>evDk(new Date(tasksData().items.find(t=>t.id==='old-card').completedAt)))).toBe('2026-08-20');
});
for(const width of [320,400,440])test(`Estadísticas: un solo formato, datos intactos y lectura móvil ${width}`,async({page},info)=>{
 await page.setViewportSize({width,height:880});await page.locator('#eventsBtn').click();
 await page.locator('#evViewBodas').click();await page.locator('[data-bsub=stats]').click();
 await expect(page.locator('.stats-stack-wedding')).toBeVisible();
 expect(await page.evaluate(()=>{const storage=JSON.stringify(localStorage),before=JSON.stringify({events:EVENTS,routines:RUTINAS,couples:BODA_COUPLES,config:BODA_CONFIG});_renderBodaStats();_renderRutStats();renderEventStatistics();return storage===JSON.stringify(localStorage)&&before===JSON.stringify({events:EVENTS,routines:RUTINAS,couples:BODA_COUPLES,config:BODA_CONFIG});})).toBe(true);
 for(const view of ['wedding','routine','events']){
  if(view==='routine'){await page.locator('#evViewRutinas').click();await page.locator('[data-rsub=stats]').click();}
  if(view==='events'){await page.locator('#evViewUpcoming').click();await page.locator('#evSubStats').click();}
  const stack=page.locator('.stats-stack').last();await expect(stack).toBeVisible();
  expect(await stack.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await expect(stack.locator('.boda-stats-row,.boda-stat-t')).toHaveCount(0);
  const sections=stack.locator(':scope > .stats-section');expect(await sections.count()).toBeGreaterThan(1);
  for(const section of await sections.all())await expect(section.locator(':scope > .stats-head h3')).toHaveCount(1);
  await page.screenshot({path:info.outputPath(view+'-stats.png'),animations:'disabled'});
 }
});
