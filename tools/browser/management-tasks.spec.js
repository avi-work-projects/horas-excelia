const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-09T12:00:00'));
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
});
test('gestiones: selector, confirmación, check compartido y vencimiento',async({page})=>{
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
 await page.locator('[data-picker=management]').click();
 await expect(page.locator('#evPlanTitle')).toHaveText('Elige tu gestión');
 const generic=await page.locator('.ev-picker-generic').boundingBox(),heading=await page.locator('#evPlanTitle').boundingBox();
 expect(generic.x+generic.width).toBeLessThan(heading.x);expect(Math.abs(generic.y+generic.height/2-heading.y-heading.height/2)).toBeLessThan(3);
 await expect(page.locator('.ev-plan-options .ev-type-name').first()).toHaveText('Peluquería');
 const order=await page.locator('.ev-plan-options [data-type]').evaluateAll(els=>els.map(e=>e.dataset.type));
 expect(order).toEqual(['Peluquería','Médico','Dentista','Cita','Llamada','Contratar seguro','Contratar gas','Contratar electricidad','Enviar factura','Pago','Pago hacienda','Presentar Modelo']);
 for(const type of ['Pago hacienda','Pago','Contratar seguro','Contratar gas','Contratar electricidad','Presentar Modelo','Enviar factura'])await expect(page.locator('#evPlanPickerOv [data-type="'+type+'"]')).toBeVisible();
 await page.locator('#evPlanPickerOv [data-type="Enviar factura"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
 await expect(page.locator('#evFTitle')).toHaveValue('Enviar factura');await page.locator('#evFStart').fill('2026-10-08');await page.locator('#evFEnd').fill('2026-10-08');await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 await page.locator('#evViewCal').click();await page.locator('.ev-cell[data-ds="2026-10-08"] .ev-shape-invoice').click();
 await expect(page.locator('#evManagementDone')).not.toBeChecked();await page.locator('#evManagementDone').check();
 await page.locator('#evDClose').click();await expect(page.locator('#evDWrap')).toHaveCount(0);await page.locator('#tasksFab').click();
 await expect(page.getByRole('tab',{name:'Completadas 1',exact:true})).toBeVisible();await page.getByRole('tab',{name:'Completadas 1',exact:true}).click();
 await page.getByRole('checkbox',{name:'Reabrir Enviar factura',exact:true}).click();await expect(page.getByRole('tab',{name:'Pendientes 1',exact:true})).toBeVisible();await page.getByRole('tab',{name:'Pendientes 1',exact:true}).click();
 await expect(page.locator('.task-row').first()).toHaveCSS('background-color','rgb(228, 244, 233)');
 await page.locator('#tasksClose').click();await expect(page.locator('#tasksWrap')).toHaveCount(0);await page.locator('.ev-cell[data-ds="2026-10-08"] .ev-shape-invoice').click();await expect(page.locator('#evManagementDone')).not.toBeChecked();
});
test('tareas: arrastre, cancelación, color y persistencia',async({page})=>{
 await page.goto('/');await page.locator('#tasksFab').click();
 for(const title of ['Primera','Segunda','Tercera','Cuarta']){await page.locator('#tasksNew').fill(title);await page.getByRole('button',{name:'Añadir tarea',exact:true}).click();}
 const grip=await page.getByRole('button',{name:'Reordenar Cuarta',exact:true}).boundingBox(),first=await page.locator('.task-row').first().boundingBox();
 await page.mouse.move(grip.x+10,grip.y+15);await page.mouse.down();await page.mouse.move(first.x+20,first.y+5,{steps:12});
 await expect(page.locator('.task-drag-ghost')).toBeVisible();await expect(page.locator('.task-drag-placeholder')).toHaveCount(1);await page.mouse.up();
 await expect(page.locator('.task-drag-ghost')).toHaveCount(0);await expect(page.locator('.task-title')).toHaveText(['Cuarta','Primera','Segunda','Tercera']);
 const again=await page.getByRole('button',{name:'Reordenar Cuarta',exact:true}).boundingBox();await page.mouse.move(again.x+10,again.y+15);await page.mouse.down();await page.mouse.move(again.x+10,again.y+160,{steps:8});await page.keyboard.press('Escape');await page.mouse.up();
 await expect(page.locator('.task-title')).toHaveText(['Cuarta','Primera','Segunda','Tercera']);
 await page.getByRole('button',{name:'Opciones de Cuarta',exact:true}).click();await expect(page.locator('.task-colors button')).toHaveCount(5);await page.locator('[data-color=blue]').click();await expect(page.locator('.task-row').first()).toHaveCSS('background-color','rgb(230, 240, 252)');
 await page.reload();if(await page.locator('#homePopupClose').isVisible())await page.locator('#homePopupClose').click();await page.locator('#tasksFab').click();await expect(page.locator('.task-title')).toHaveText(['Cuarta','Primera','Segunda','Tercera']);await expect(page.locator('.task-row').first()).toHaveCSS('background-color','rgb(230, 240, 252)');
});

test('modelo fiscal: título, otro modelo y persistencia al editar',async({page})=>{
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
 await page.locator('[data-picker=management]').click();await page.locator('#evPlanPickerOv [data-type="Presentar Modelo"]').click();await page.locator('#evPlanConfirm').click();
 await expect(page.locator('#evFTaxBlock')).toBeVisible();await expect(page.locator('#evFTitle')).toHaveValue('Domiciliar y presentar IVA');
 await page.locator('#evFTaxTrigger').click();await page.locator('[data-tax="390"]').click();await expect(page.locator('#evFTitle')).toHaveValue('Presentar IVA anual');
 await page.locator('#evFTaxTrigger').click();await page.locator('[data-tax="100"]').click();await expect(page.locator('#evFTitle')).toHaveValue('Presentar Dec. Renta');
 await page.locator('#evFTaxTrigger').click();await page.locator('[data-tax="other"]').click();await page.locator('#evFTaxOther').fill('130');await expect(page.locator('#evFTitle')).toHaveValue('Presentar Modelo 130');
 await page.locator('#evFTitle').fill('Mi presentación');await page.locator('#evFTaxOther').fill('111');await expect(page.locator('#evFTitle')).toHaveValue('Mi presentación');
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);await page.locator('#evViewCal').click();await page.locator('.ev-shape-tax-form').click();
 await expect(page.locator('#evDWrap')).toContainText('Modelo 111');await page.locator('#evDEdit').click();await expect(page.locator('#evFTaxModel')).toHaveValue('other');await expect(page.locator('#evFTaxOther')).toHaveValue('111');
});

test('selección compartida: genéricos, acentos y nombre elegido fuera de accesos rápidos',async({page})=>{
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
 const mg=page.locator('[data-group=management]'),pl=page.locator('[data-group=plans]');
 await expect(mg.locator('[data-type="Rec. Gestiones"]')).toBeVisible();await expect(pl.locator('[data-type="Plan/Quedada"]')).toBeVisible();
 for(const [key,type,color] of [['management','Pago','rgb(39, 132, 92)'],['plans','Cine','rgb(189, 97, 25)']]){
   await page.locator('[data-picker='+key+']').click();await page.locator('#evPlanPickerOv [data-type="'+type+'"]').click();
   await expect(page.locator('#evPlanPickerOv .ev-plan-options .selected')).toHaveCSS('border-top-color',color);await expect(page.locator('#evPlanConfirm')).toHaveCSS('background-color',color);await expect(page.locator('#evPlanConfirm')).toHaveCSS('color','rgb(255, 255, 255)');
   await page.locator('#evPlanConfirm').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
   await expect(page.locator('[data-group='+key+'] .ev-quick-selection')).toContainText(type);await expect(page.locator('[data-picker='+key+'] .ev-type-name')).toHaveText('Más opciones');await expect(page.locator('[data-picker='+key+'] .ev-type-name')).toHaveCSS('font-weight','400');
 }
 await expect(mg.locator('.ev-quick-selection')).toBeVisible();
 await mg.locator('[data-type="Llamada"]').click();await expect(mg.locator('.selected')).toHaveCSS('border-top-color','rgb(39, 132, 92)');await expect(pl.locator('.ev-quick-selection')).toBeVisible();
 await pl.locator('[data-type="Plan/Quedada"]').click();await expect(pl.locator('[data-type="Plan/Quedada"]')).toHaveClass(/selected/);await page.locator('#evFTitle').fill('Plan de prueba');
 await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);expect(await page.evaluate(()=>EVENTS[0].type)).toBe('Plan/Quedada');
});

test('último extra: se puede reelegir, sustituye al anterior y se olvida al cerrar',async({page})=>{
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
 const mg=page.locator('[data-group=management]');
 await page.locator('[data-picker=management]').click();await page.locator('#evPlanPickerOv [data-type="Presentar Modelo"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
 await expect(mg.locator('#evFTaxBlock')).toBeVisible();await expect(mg.locator('select')).toHaveCount(0);
 await page.locator('#evFTaxTrigger').click();await page.locator('[data-tax="390"]').click();
 await mg.locator('[data-type="Llamada"]').click();await expect(mg.locator('#evFTaxBlock')).toBeHidden();await mg.locator('.ev-quick-selection button').click();await expect(mg.locator('#evFTaxBlock')).toBeVisible();await expect(page.locator('#evFTaxModel')).toHaveValue('390');
 await page.locator('[data-picker=plans]').click();await page.locator('#evPlanPickerOv [data-type="Brunch"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
 await mg.locator('.ev-quick-selection button').click();await expect(page.locator('#evFTaxModel')).toHaveValue('390');
 await page.locator('[data-picker=management]').click();await page.locator('#evPlanPickerOv [data-type="Pago"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);
 await expect(mg.locator('.ev-quick-selection button')).toHaveCount(1);await expect(mg.locator('.ev-quick-selection button')).toHaveText('Pago');
 await page.locator('#evFClose').click();await expect(page.locator('#evFWrap')).toHaveCount(0);await page.locator('#evAdd').click();await expect(page.locator('#evFWrap')).toBeVisible();await expect(page.locator('.ev-quick-selection')).toHaveCount(0);
});
