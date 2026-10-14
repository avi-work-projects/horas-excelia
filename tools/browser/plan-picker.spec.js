const {test,expect}=require('@playwright/test');
test('planes: cuatro accesos, selección provisional, confirmar fijo y persistencia',async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
  await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
  const quick=page.locator('[data-quick=plans]>button');await expect(quick).toHaveCount(4);
  expect(await quick.allTextContents()).toEqual(['Comida','Tomar Algo','Cena','Más Opciones']);
  await page.locator('#evFTypePicker [data-type="Cena"]').click();
  await page.locator('[data-picker=plans]').click();await page.locator('#evPlanPickerOv [data-type="Brunch"]').click();
  await expect(page.locator('#evFTitle')).toHaveValue('Cena');
  await page.locator('#evPlanCancel').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
  await expect(page.locator('#evFTitle')).toHaveValue('Cena');
  await page.locator('[data-picker=plans]').click();await page.locator('#evPlanPickerOv [data-type="Ponencia"]').click();
  await expect(page.locator('.ev-plan-header [data-type="Plan/Quedada"]')).toHaveText('');
  await expect(page.locator('.ev-plan-options [data-type="Plan/Quedada"]')).toHaveCount(0);
  await expect(page.locator('#evPlanConfirm')).toBeInViewport();
  await page.locator('#evPlanPickerOv [data-type="Brunch"]').click();await page.locator('#evPlanConfirm').click();
  await expect(page.locator('#evFTitle')).toHaveValue('Brunch');await expect(page.locator('#evFTime')).toHaveValue('');
  await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
  await page.locator('#evFTime').click();await expect(page.locator('#timePickerHours')).toHaveAttribute('aria-valuenow','11');
  await page.locator('#timePickerCancel').click();await expect(page.locator('#timePickerWrap')).toHaveCount(0);
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>EVENTS[0].type)).toBe('Brunch');expect(await page.evaluate(()=>EVENTS[0].time)).toBeFalsy();
  await page.evaluate(()=>openEvForm(EVENTS[0]));await expect(page.locator('[data-group=plans] .ev-quick-selection')).toContainText('Brunch');
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>EVENTS[0].type)).toBe('Brunch');
});

test('nuevos planes: símbolos y selección en móvil',async({page},info)=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evAdd').click();
 for(const width of [320,400]){
  await page.setViewportSize({width,height:880});await page.locator('[data-picker=plans]').click();
  for(const type of ['Carrera','Merendar','Plan cultural'])await expect(page.locator('#evPlanPickerOv [data-type="'+type+'"] svg')).toBeVisible();
  await page.locator('#evPlanPickerOv [data-type="Plan cultural"]').scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath('planes-'+width+'.png')});await expect(page.locator('#evPlanConfirm')).toBeInViewport();
  await page.locator('#evPlanCancel').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
 }
 for(const type of ['Carrera','Merendar']){
  await page.locator('[data-picker=plans]').click();await page.locator('#evPlanPickerOv [data-type="'+type+'"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evFTitle')).toHaveValue(type);
 }
 await page.locator('[data-picker=plans]').click();await page.locator('#evPlanPickerOv [data-type="Plan cultural"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evFTitle')).toHaveValue('Plan cultural');await page.locator('[data-culture=Otro]').click();
 await page.locator('#evFTitle').fill('Visita al museo');await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>({type:EVENTS[0].type,title:EVENTS[0].title}))).toEqual({type:'Plan cultural',title:'Visita al museo'});
 await page.evaluate(()=>openEvForm(EVENTS[0]));await expect(page.locator('#evFTitle')).toHaveValue('Visita al museo');

});
