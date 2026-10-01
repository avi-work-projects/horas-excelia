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
test('Rutinas compactas: días, intervalos completos, planificación e histórico',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
  await page.addInitScript(()=>localStorage.setItem('excelia-rutinas-v1',JSON.stringify([
    {id:'fixed',name:'Rutina fija',icon:'padel',color:'#a3e635',start:'2026-09-01',weekDays:[4],time:'16:00',dur:60,skips:{},weeks:{}},
    {id:'multiple',name:'Varios horarios',icon:'baile',color:'#e03131',start:'2026-09-01',weekDays:[1,5],time:'18:00',times:{'5':'20:00'},dur:90,skips:{},weeks:{}},
    {id:'flex',name:'Rutina flexible',icon:'gym',start:'2026-09-01',weekDays:[],time:'18:00',dur:60,skips:{},flex:{period:'month',target:8,weeklyTarget:2,sessions:{'2026-10-02':{time:'18:00',dur:75}}}}
  ])));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  // El cupo flexible incompleto recuerda sus sesiones incluso con otros avisos cerrados.
  await page.locator('#homePopupClose').click();
  await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
  await expect(page.locator('[data-rid="fixed"] .rut-hora')).toContainText('16:00–17:00');
  await expect(page.locator('[data-rid="fixed"] .rut-day')).toHaveCount(7);
  await expect(page.locator('[data-rid="multiple"] .rut-day.on')).toHaveCount(2);
  await expect(page.locator('[data-rid="multiple"] [title="Lunes 18:00–19:30"]')).toBeVisible();
  await expect(page.locator('[data-rid="multiple"] [title="Viernes 20:00–21:30"]')).toBeVisible();
  await expect(page.locator('.rut-routine-card .rut-prox')).toHaveCount(0);
  await expect(page.locator('.rut-routine-card .rut-card-icon svg')).toHaveCount(3);
  const sizes=await page.locator('[data-rid="fixed"] .rut-hora time').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return [s.fontSize,s.fontWeight,s.color];}));
  expect(sizes[0]).toEqual(sizes[1]);
  expect(await page.locator('.rut-card').evaluateAll(cards=>cards.every(c=>c.scrollWidth<=c.clientWidth))).toBe(true);
  await page.locator('.rut-edit[data-rid="fixed"]').click();
  await expect(page.locator('#rutFTime,#rutFDur,#rutFDays,#rutFIcons,[data-rmode]')).toHaveCount(0);
  await page.locator('#rutFClose').click();
  await expect(page.locator('[data-rweek="fixed"]')).toBeVisible();
  await page.locator('[data-rhistory="fixed"]').click();await expect(page.locator('#rutHistoryOv')).toBeVisible();
  await page.locator('#rutHistoryClose').click();await page.locator('[data-rplan="flex"]').click();
  await expect(page.locator('#rutPlanOv')).toBeVisible();
  await page.locator('#rutPlanClose').click();
  await page.locator('.rut-edit[data-rid="flex"]').click();
  await expect(page.locator('#rutFTarget,#rutFWeekly')).toHaveCount(2);
  await expect(page.locator('#rutFFirstTarget,#rutFTime,#rutFDur,#rutFDays,#rutFIcons,[data-rmode]')).toHaveCount(0);
  await expect(page.locator('#rutFormOv')).not.toContainText('Los cambios de horario');
  await page.locator('#rutFClose').click();await page.locator('[data-rhistory="flex"]').click();await expect(page.locator('#rutHistoryOv')).toBeVisible();
  expect(errors).toEqual([]);
});

test('rutina futura: configuración completa; rutina iniciada: cupos habituales sin alterar el primer mes',async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    localStorage.setItem('excelia-rutinas-v1',JSON.stringify([
      {id:'future-edit',name:'Curso futuro',icon:'padel',start:'2026-11-10',weekDays:[2],time:'17:00',dur:60,weeks:{},skips:{}},
      {id:'started-flex',name:'Curso flexible',icon:'gym',start:'2026-09-15',weekDays:[],time:'18:00',dur:60,skips:{},flex:{period:'month',target:8,weeklyTarget:2,monthTargets:{'2026-09':3},sessions:{'2026-09-17':{time:'18:00',dur:60}}}}
    ]));
  });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.locator('#homePopupClose').click();
  await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
  await page.locator('.rut-edit[data-rid="future-edit"]').click();
  await expect(page.locator('[data-rmode="flex"]')).toBeEnabled();
  await page.locator('#rutFIcons [data-icon="baile"]').click();
  await page.locator('#rutFTime').fill('20:00');await page.locator('#rutFDur').fill('90');
  await page.locator('#rutFSave').click();await expect(page.locator('#rutFWrap')).toHaveCount(0);
  let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-rutinas-v1')));
  expect(saved[0]).toMatchObject({start:'2026-11-10',icon:'baile',time:'20:00',dur:90,weekDays:[2]});
  await page.locator('.rut-edit[data-rid="future-edit"]').click();await page.locator('[data-rmode="flex"]').click();
  await page.locator('#rutFFirstTarget').fill('4');await page.locator('#rutFSave').click();await expect(page.locator('#rutFWrap')).toHaveCount(0);
  await expect(page.locator('[data-rplan="future-edit"]')).toBeVisible();
  await page.locator('.rut-edit[data-rid="started-flex"]').click();
  await expect(page.locator('#rutFFirstTarget,[data-rmode],#rutFTime,#rutFDur,#rutFIcons')).toHaveCount(0);
  await page.locator('#rutFTarget').fill('10');await page.locator('#rutFWeekly').fill('3');
  await page.locator('#rutFSave').click();await expect(page.locator('#rutFWrap')).toHaveCount(0);
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-rutinas-v1')));
  expect(saved[1].flex).toMatchObject({period:'month',target:10,weeklyTarget:3,monthTargets:{'2026-09':3},sessions:{'2026-09-17':{time:'18:00',dur:60}}});
  expect(errors).toEqual([]);
});
