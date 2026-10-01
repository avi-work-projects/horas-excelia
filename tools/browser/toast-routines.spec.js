const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
});
async function swipeToast(page,dx,dy=0,fromButton=false){
  const box=await page.locator(fromButton?'#toastUndoBtn':'#toast').boundingBox();
  const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+dx,y+dy,{steps:10});await page.mouse.up();
}
test('Deshacer: un segundo de protección, deslizar a ambos lados y no activar la acción',async({page})=>{
  await page.goto('/');
  await page.clock.install();await page.clock.pauseAt(new Date());
  await page.evaluate(()=>{window.undoCount=0;showToast('Cambio de prueba','success',()=>window.undoCount++);});
  await page.clock.runFor(350);
  await swipeToast(page,130);
  await expect(page.locator('#toast')).toHaveClass(/show/);
  await expect(page.locator('#toast')).not.toHaveClass(/swipe-away/);
  expect(await page.evaluate(()=>window.undoCount)).toBe(0);
  await page.clock.runFor(650);
  await swipeToast(page,-130,0,true);
  await expect(page.locator('#toast')).toHaveClass(/swipe-away/);
  await page.clock.runFor(260);
  await expect(page.locator('#toast')).not.toHaveClass(/show/);
  expect(await page.evaluate(()=>window.undoCount)).toBe(0);
  await page.evaluate(()=>showToast('Otro cambio','success',()=>window.undoCount++));
  await page.clock.runFor(1100);await swipeToast(page,130);
  await page.clock.runFor(260);await expect(page.locator('#toast')).not.toHaveClass(/show/);
  expect(await page.evaluate(()=>window.undoCount)).toBe(0);
});
test('Deshacer conserva los toques, descarta gestos verticales y reinicia cada aviso',async({page})=>{
  await page.goto('/');await page.clock.install();await page.clock.pauseAt(new Date());
  await page.evaluate(()=>{window.undoCount=0;showToast('Cambio','info',()=>{window.undoCount++;showToast('Deshecho','success');});});
  await page.clock.runFor(1100);
  await swipeToast(page,6,-100);
  await expect(page.locator('#toast')).toHaveClass(/show/);
  await expect(page.locator('#toast')).not.toHaveClass(/swipe-away/);
  await swipeToast(page,20);await page.clock.runFor(350);
  await expect(page.locator('#toast')).not.toHaveClass(/swipe-away/);
  await page.locator('#toastUndoBtn').click();
  expect(await page.evaluate(()=>window.undoCount)).toBe(1);
  await expect(page.locator('#toast')).toContainText('Deshecho');
  await expect(page.locator('#toast')).toHaveClass(/show/);
  // Reemplazar un aviso mientras sale no debe ocultar el nuevo con su temporizador.
  await page.evaluate(()=>showToast('Anterior','info',()=>window.undoCount++));
  await page.clock.runFor(1100);await swipeToast(page,130);
  await page.evaluate(()=>showToast('Nuevo','success',()=>window.undoCount++));
  await page.clock.runFor(350);await swipeToast(page,-130);
  await expect(page.locator('#toast')).toContainText('Nuevo');
  await expect(page.locator('#toast')).not.toHaveClass(/swipe-away|swipe-ready/);
  expect(await page.evaluate(()=>window.undoCount)).toBe(1);
  await page.clock.runFor(7650);await expect(page.locator('#toast')).not.toHaveClass(/show/);
});
test('Rutinas: intervalos completos, varias horas, flexibles e histórico directo',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
  await page.addInitScript(()=>localStorage.setItem('excelia-rutinas-v1',JSON.stringify([
    {id:'fixed',name:'Rutina fija',icon:'padel',color:'#a3e635',start:'2026-09-01',weekDays:[4],time:'16:00',dur:60,skips:{},weeks:{}},
    {id:'multiple',name:'Varios horarios',icon:'baile',color:'#e03131',start:'2026-09-01',weekDays:[1,5],time:'18:00',times:{'5':'20:00'},dur:90,skips:{},weeks:{}},
    {id:'flex',name:'Rutina flexible',icon:'gym',start:'2026-09-01',weekDays:[],time:'18:00',dur:60,skips:{},flex:{period:'month',target:8,weeklyTarget:2,sessions:{'2026-10-02':{time:'18:00',dur:75}}}}
  ])));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
  await expect(page.locator('[data-rid="fixed"] .rut-schedule')).toContainText('16:00–17:00');
  await expect(page.locator('[data-rid="multiple"] .rut-schedule')).toContainText('18:00–19:30');
  await expect(page.locator('[data-rid="multiple"] .rut-schedule')).toContainText('20:00–21:30');
  await expect(page.locator('[data-rid="flex"] .rut-prox')).toContainText('18:00–19:15');
  const sizes=await page.locator('[data-rid="fixed"] .rut-schedule time').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return [s.fontSize,s.fontWeight,s.color];}));
  expect(sizes[0]).toEqual(sizes[1]);
  expect(await page.locator('.rut-list-card').evaluateAll(cards=>cards.every(c=>c.scrollWidth<=c.clientWidth))).toBe(true);
  await page.locator('[data-rhistory="fixed"]').click();await expect(page.locator('#rutHistoryOv')).toBeVisible();
  await page.locator('#rutHistoryClose').click();await page.locator('[data-rplan="flex"]').click();
  await expect(page.locator('#rutPlanOv')).toBeVisible();expect(errors).toEqual([]);
});
