const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
});
test('tareas: añadir, priorizar, completar, papelera, restaurar y backup',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
  await page.locator('#tasksFab').click();
  for(const title of ['Comprar pintura','Colgar cuadro','Revisar cisterna']){
    await page.getByLabel('Nueva tarea',{exact:true}).fill(title);await page.getByRole('button',{name:'Añadir tarea',exact:true}).click();
  }
  await page.getByRole('button',{name:'Reordenar Colgar cuadro',exact:true}).press('ArrowUp');
  await expect(page.locator('.task-title').first()).toHaveText('Colgar cuadro');
  await page.getByRole('checkbox',{name:'Completar Colgar cuadro',exact:true}).click();
  await page.getByRole('tab',{name:'Hechas 1',exact:true}).click();
  await expect(page.locator('.task-title')).toHaveText('Colgar cuadro');
  await page.getByRole('tab',{name:'Pendientes 2',exact:true}).click();
  await page.getByRole('button',{name:'Opciones de Comprar pintura',exact:true}).click();
  await page.getByRole('button',{name:'Eliminar',exact:true}).click();
  await expect(page.locator('#toastUndoBtn').filter({hasText:'Deshacer'})).toBeVisible();
  await page.getByRole('tab',{name:'Papelera 1',exact:true}).click();
  await expect(page.locator('#tasksList')).toContainText('Se borra en 7 días');
  await page.getByRole('button',{name:'Restaurar Comprar pintura',exact:true}).click();
  await expect(page.getByRole('tab',{name:'Pendientes 2',exact:true})).toBeVisible();
  await page.locator('#tasksClose').click();await page.locator('#menuBtn').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportAllBtn').click()]);
  const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
  expect(data.tasks.items).toHaveLength(3);expect(data.tasks.items[0].title).toBe('Colgar cuadro');expect(data.tasks.items[0].completedAt).not.toBeNull();
  await page.reload();await page.locator('#homePopupDismiss').click();
  await page.locator('#tasksFab').click();await expect(page.getByRole('tab',{name:'Hechas 1',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
test('el botón se arrastra libre y se recoge al navegar; recordatorio solo una vez por semana',async({page})=>{
  await page.goto('/');await page.locator('#tasksFab').click();await page.locator('#tasksNew').fill('Tarea semanal');await page.getByRole('button',{name:'Añadir tarea',exact:true}).click();await page.locator('#tasksClose').click();
  const fab=page.locator('#tasksFab'),r=await fab.boundingBox();
  await page.mouse.move(r.x+10,r.y+24);await page.mouse.down();await page.mouse.move(100,440,{steps:8});await page.mouse.up();
  await expect(fab).not.toHaveClass(/tasks-docked/);await expect(page.locator('#tasksOverlay')).toBeHidden();
  const position=await fab.boundingBox();expect(position.x).toBeGreaterThan(40);expect(position.y).toBeLessThan(500);
  await page.locator('#eventsBtn').click();await expect(fab).toHaveClass(/tasks-docked/);await expect(fab).toHaveAttribute('data-side','left');
  await page.reload();await expect(page.locator('#homeTasksOpen')).toContainText('Tarea semanal');await page.locator('#homePopupDismiss').click();
  await page.reload();await expect(page.locator('#homeTasksOpen')).toHaveCount(0);
  await page.clock.setFixedTime(new Date('2026-10-05T10:00:00'));await page.reload();await expect(page.locator('#homeTasksOpen')).toContainText('Tarea semanal');
});
test('raquetas compuestas, VIP compacto y categorías de gestión con color fijo',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'VIP de prueba',day:1,month:10,vip:true}]));
    localStorage.setItem('excelia-rutinas-v1',JSON.stringify([{id:'rackets',name:'Pádel',icon:'padel',color:'#a3e635',start:'2026-09-01',weekDays:[4],time:'16:00',dur:60,extraSessions:[{id:'next',date:'2026-09-24',time:'17:00',dur:60}]}]));
  });
  await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewCal').click();
  await expect(page.locator('.ev-month-vip img')).toHaveAttribute('src','VIP.png');
  await page.locator('#evPrev').click();const group=page.locator('.ev-cell[data-ds="2026-09-24"] .rut-marker-group');
  await expect(group).toHaveCSS('opacity','0.5');await expect(group.locator('.ev-rut-mark').first()).toHaveCSS('opacity','1');
  const boxes=await group.locator('.rut-marker-layer').evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,w:el.getBoundingClientRect().width})));
  expect((boxes[1].x-boxes[0].x)/boxes[0].w).toBeCloseTo(.3,1);
  await page.locator('#evBright').click();await expect(group).toHaveCSS('opacity','1');
  await page.locator('#evViewQuad').click();await expect(page.locator('.ev-chip-vip')).toBeVisible();
  const row=await page.locator('.ev-annual-filter-row').evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth,ys:[...el.querySelectorAll('button')].map(b=>Math.round(b.getBoundingClientRect().y))}));
  expect(new Set(row.ys).size).toBe(1);expect(row.scroll).toBeLessThanOrEqual(row.width+1);
  await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
  expect(await page.locator('.ev-management-subtypes .ev-type-name').allTextContents()).toEqual(['Llamada','Peluquería','Médico','Dentista']);
  await page.locator('[data-type="Dentista"]').click();await expect(page.locator('#evFColorSection')).toBeHidden();await expect(page.locator('#evFTitle')).toHaveValue('Dentista');await page.locator('#evFSave').click();
  await page.locator('#evViewCal').click();await expect(page.locator('.ev-shape-tooth')).toBeVisible();
});
