const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  if(!localStorage.getItem('excelia-despacho-v1'))localStorage.setItem('excelia-despacho-v1',JSON.stringify({elect:{modoPotencia:'doble',potenciaP1:3.3,potenciaP2:3.3,potenciaTotal:3.3,precioPotP1:.078456,precioPotP2:.003421,precioKwh:.1249,terminoFijo:0,comercializadora:'Compañía de prueba',ivaElect:21}}));
 });
});

test('fiscal consulta, hogar edita y vuelve al mismo detalle conservando la precisión',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(()=>{FISCAL_TAB='despacho';FISCAL_HIP_SUB='elect';openFiscal(2026);});
 for(const tab of ['resumen','detalle','gas','elect']){
  await page.locator('#fiscalOverlay [data-hipsub="'+tab+'"]').click();
  await expect(page.locator('#fiscalOverlay input,#fiscalSave,#fiscalOverlay .hip-edit-btn,#fiscalOverlay .energy-analysis-open')).toHaveCount(0);
  await expect(page.locator('#householdDetailLink')).toBeVisible();
 }
 await page.locator('#householdDetailLink').click();
 await expect(page.locator('#householdOverlay')).toHaveClass(/open/);await expect(page.locator('#fiscalOverlay')).toBeHidden();
 await expect(page.locator('#householdOverlay h1')).toHaveText('Gastos del hogar');
 await expect(page.locator('#householdOverlay .sy-body')).toContainText('0,078');
 await page.locator('#electEditBtn').click();await expect(page.locator('#desp-electPrecioKwh')).toHaveValue('0.1249');
 await page.locator('#desp-electComerc').fill('Compañía editada');await page.locator('#electSaveBtn').click();
 await page.locator('#householdBack').click();await expect(page.locator('#fiscalOverlay')).toHaveClass(/open/);
 await expect(page.locator('#fiscalOverlay')).toContainText('Compañía editada');
 await page.locator('#fiscalTabPersonal').click();await expect(page.locator('#fiscalSave')).toBeVisible();
 await page.locator('#fiscalOverlay [data-nav="household"]').click();await page.locator('[data-hipsub="gas"]').click();
 await page.reload();await page.locator('#householdBtn').click();await expect(page.locator('[data-hipsub="gas"]')).toHaveClass(/active/);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-despacho-v1')).elect.precioKwh)).toBe(.1249);
 expect(errors).toEqual([]);
});

test('acceso de tareas: margen inferior, ocultar por arrastre, persistir y recuperar por gesto o menú',async({page})=>{
 await page.goto('/');const fab=page.locator('#tasksFab');
 await fab.click();await page.locator('#tasksNew').fill('Conservar esta tarea');await page.getByRole('button',{name:'Añadir tarea',exact:true}).click();await page.locator('#tasksClose').click();
 async function hide(){
  const r=await fab.boundingBox();await page.mouse.move(r.x+24,r.y+24);await page.mouse.down();
  await expect(page.locator('#tasksDropZone')).toBeVisible();const bin=await page.locator('#tasksDropZone').boundingBox();
  await page.mouse.move(bin.x+bin.width/2,bin.y+bin.height/2,{steps:10});await expect(page.locator('#tasksDropZone')).toHaveClass(/tasks-drop-ready/);await page.mouse.up();await expect(fab).toBeHidden();
 }
 const r=await fab.boundingBox(),v=page.viewportSize();expect(v.width-r.x-r.width).toBeGreaterThanOrEqual(16);expect(v.height-r.y-r.height).toBeGreaterThanOrEqual(18);expect(v.height-r.y-r.height).toBeLessThan(50);
 await hide();await page.reload();await page.locator('#homePopupDismiss').click();await expect(fab).toBeHidden();
 // El gesto no modifica zoom ni tareas; no se cancela la acción nativa del navegador.
 await page.evaluate(()=>{
  function touch(x,id){return new Touch({identifier:id,target:document.body,clientX:x,clientY:300});}
  document.body.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(100,1),touch(150,2)]}));
  document.body.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,touches:[touch(80,1),touch(170,2)]}));
  document.body.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[]}));
 });
 await expect(fab).toBeVisible();await expect(fab).toHaveClass(/tasks-docked/);
 await hide();await page.locator('#menuBtn').click();await page.locator('#tasksMenuOpen').click();await expect(page.locator('.task-title')).toHaveText('Conservar esta tarea');
 await page.locator('#tasksClose').click();await expect(fab).toBeVisible();
});

test('recordatorios con bordes uniformes y colores de cumpleaños y gestiones distintos',async({page})=>{
 await page.addInitScript(()=>{
  sessionStorage.removeItem('excelia-popup-dismissed');
  localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Cumple de prueba',day:1,month:10},{name:'VIP de prueba',day:2,month:10,vip:true}]));
  localStorage.setItem('excelia-events-v1',JSON.stringify([{id:'gestion',kind:'puntual',type:'Rec. Gestiones',title:'Gestión de prueba',start:'2026-10-01',end:'2026-10-01',color:'#34d399'}]));
 });
 await page.goto('/');await expect(page.locator('.home-popup-item.bday')).toBeVisible();await expect(page.locator('.home-popup-item.event')).toBeVisible();
 const widths=await page.locator('.home-popup-item').evaluateAll(es=>es.map(e=>getComputedStyle(e).borderTopWidth));expect(new Set(widths).size).toBe(1);expect(parseFloat(widths[0])).toBeGreaterThanOrEqual(1);
 const colors=await page.locator('.home-popup-item.bday,.home-popup-item.event').evaluateAll(es=>es.map(e=>getComputedStyle(e).borderTopColor));expect(colors[0]).not.toBe(colors[1]);
});
