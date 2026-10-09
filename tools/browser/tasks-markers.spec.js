const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
});
test('tareas: marcar sin retirar, mover, reabrir y conservar en backup',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
  await page.locator('#tasksFab').click();
  for(const title of ['Comprar pintura','Colgar cuadro','Revisar cisterna']){
    await page.getByLabel('Nueva tarea',{exact:true}).fill(title);await page.getByRole('button',{name:'Añadir tarea',exact:true}).click();
  }
  await page.getByRole('button',{name:'Reordenar Colgar cuadro',exact:true}).press('ArrowUp');
  await expect(page.locator('.task-title').first()).toHaveText('Colgar cuadro');
  await page.getByRole('checkbox',{name:'Completar Colgar cuadro',exact:true}).click();
  await expect(page.locator('.task-row')).toHaveCount(3);
  await expect(page.getByRole('checkbox',{name:'Reabrir Colgar cuadro',exact:true})).toBeChecked();
  await page.getByRole('tab',{name:'Completadas 1',exact:true}).click();
  await expect(page.locator('.task-title')).toHaveText('Colgar cuadro');
  await page.getByRole('tab',{name:'Pendientes 2',exact:true}).click();
  await expect(page.locator('.task-row')).toHaveCount(3);
  await page.locator('#tasksClose').click();await page.locator('#tasksFab').click();
  await expect(page.getByRole('checkbox',{name:'Reabrir Colgar cuadro',exact:true})).toBeChecked();
  await page.getByRole('checkbox',{name:'Completar Comprar pintura',exact:true}).click();
  await page.getByRole('button',{name:'Mover (2)',exact:true}).click();
  await expect(page.locator('.task-title')).toHaveText('Revisar cisterna');
  await expect(page.locator('#toastUndoBtn').filter({hasText:'Deshacer'})).toBeVisible();
  await page.locator('#toastUndoBtn').click();await expect(page.locator('.task-row')).toHaveCount(3);
  await page.getByRole('button',{name:'Mover (2)',exact:true}).click();
  await page.getByRole('tab',{name:'Completadas 2',exact:true}).click();
  await expect(page.locator('.tasks-day')).toHaveCount(1);
  await page.getByRole('checkbox',{name:'Reabrir Comprar pintura',exact:true}).click();
  await expect(page.getByRole('tab',{name:'Pendientes 2',exact:true})).toBeVisible();
  await page.locator('#tasksClose').click();await page.locator('#menuBtn').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportAllBtn').click()]);
  const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
  expect(data.tasks.items).toHaveLength(3);expect(data.tasks.items[0].title).toBe('Colgar cuadro');expect(data.tasks.items[0].completedAt).not.toBeNull();
  await page.reload();await page.locator('#homePopupClose').click();
  await page.locator('#tasksFab').click();await expect(page.getByRole('tab',{name:'Completadas 1',exact:true})).toBeVisible();
  await expect(page.locator('.task-row')).toHaveCount(2);
  await expect(page.getByRole('tab')).toHaveCount(2);
  expect(errors).toEqual([]);
});
test('el historial agrupa por día y permite conservar la fecha al volver a completar',async({page})=>{
  await page.addInitScript(()=>{
    const now=new Date('2026-10-01T10:00:00').getTime(),yesterday=now-86400000;
    localStorage.setItem('excelia-tasks-v1',JSON.stringify({items:[
      {id:'old',title:'Terminada ayer',createdAt:yesterday,updatedAt:yesterday,completedAt:yesterday,deletedAt:null},
      {id:'trash',title:'Antigua papelera',createdAt:yesterday,updatedAt:now,completedAt:null,deletedAt:now},
      {id:'pending',title:'Comprar material',createdAt:now,updatedAt:now,completedAt:null,deletedAt:null}
    ],weeklyReminder:false,reminderWeek:''}));
  });
  await page.goto('/');
  await expect(page.locator('.home-pending-tasks')).toContainText('Comprar material');
  await page.locator('#homePopupClose').click();
  await page.locator('#tasksFab').click();
  await page.getByRole('tab',{name:'Completadas 2',exact:true}).click();
  await expect(page.locator('.tasks-day time')).toHaveText(['1 de octubre de 2026','30 de septiembre de 2026']);
  await expect(page.locator('.task-title')).toHaveText(['Antigua papelera','Terminada ayer']);
  await page.getByRole('checkbox',{name:'Reabrir Terminada ayer',exact:true}).click();
  await page.getByRole('tab',{name:'Pendientes 2',exact:true}).click();
  await page.getByRole('checkbox',{name:'Completar Terminada ayer',exact:true}).click();
  await expect(page.getByRole('group',{name:'¿Qué día quieres guardar?',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Completar Terminada ayer',exact:true})).not.toBeChecked();
  await page.getByRole('checkbox',{name:'Completar Terminada ayer',exact:true}).click();
  await page.getByRole('button',{name:'Conservar el 30/09/2026',exact:true}).click();
  await page.getByRole('tab',{name:'Completadas 2',exact:true}).click();
  await expect(page.locator('.tasks-day time')).toHaveCount(2);
  await page.getByRole('checkbox',{name:'Reabrir Terminada ayer',exact:true}).click();
  await page.getByRole('tab',{name:'Pendientes 2',exact:true}).click();
  await page.getByRole('checkbox',{name:'Completar Terminada ayer',exact:true}).click();
  await page.getByRole('button',{name:'Usar hoy',exact:true}).click();
  await page.getByRole('tab',{name:'Completadas 2',exact:true}).click();
  await expect(page.locator('.tasks-day time')).toHaveText('1 de octubre de 2026');
  await page.getByRole('tab',{name:'Pendientes 1',exact:true}).click();
  await expect(page.locator('.task-row')).toHaveCount(2);
});
test('el botón se arrastra libre y se recoge al navegar; recordatorio solo una vez por semana',async({page})=>{
  await page.goto('/');await page.locator('#tasksFab').click();await page.locator('#tasksNew').fill('Tarea semanal');await page.getByRole('button',{name:'Añadir tarea',exact:true}).click();await page.locator('#tasksClose').click();
  const fab=page.locator('#tasksFab'),r=await fab.boundingBox();
  await page.mouse.move(r.x+10,r.y+24);await page.mouse.down();await page.mouse.move(100,440,{steps:8});await page.mouse.up();
  await expect(fab).not.toHaveClass(/tasks-docked/);await expect(page.locator('#tasksOverlay')).toBeHidden();
  const position=await fab.boundingBox();expect(position.x).toBeGreaterThan(40);expect(position.y).toBeLessThan(500);
  await page.locator('#eventsBtn').click();await expect(fab).toHaveClass(/tasks-docked/);await expect(fab).toHaveAttribute('data-side','right');
  await page.reload();await expect(page.locator('.home-pending-tasks')).toContainText('Tarea semanal');await page.locator('#homePopupClose').click();
  await page.reload();await expect(page.locator('#homeTasksOpen')).toHaveCount(0);
  await page.clock.setFixedTime(new Date('2026-10-05T10:00:00'));await page.reload();await expect(page.locator('.home-pending-tasks')).toContainText('Tarea semanal');
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
  await expect(page.getByRole('region',{name:'Rec. Gestiones',exact:true}).locator('.ev-category-children .ev-type-name')).toHaveText(['Llamada','Cita','Peluquería','Más opciones']);
  await page.locator('[data-picker=management]').click();await page.locator('#evPlanPickerOv [data-type="Dentista"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);await expect(page.locator('#evFColorSection')).toBeHidden();await expect(page.locator('#evFTitle')).toHaveValue('Dentista');await page.locator('#evFSave').click();
  await page.locator('#evViewCal').click();await expect(page.locator('.ev-shape-tooth')).toBeVisible();
});
test('recordatorios: acceso desde tareas, dos pendientes, cumpleaños plegables y todas las ocurrencias',async({page})=>{
 await page.addInitScript(()=>{
  const now=Date.now();
  localStorage.setItem('excelia-tasks-v1',JSON.stringify({items:['Primera tarea','Segunda tarea','Tercera tarea'].map((title,i)=>({id:'pending'+i,title,createdAt:now,updatedAt:now,completedAt:null,deletedAt:null})),weeklyReminder:false,reminderWeek:'2026-09-28'}));
  localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Primera cumple',day:1,month:10},{name:'Segunda cumple',day:2,month:10,vip:true},{name:'Tercera cumple',day:3,month:10}]));
  localStorage.setItem('excelia-events-v1',JSON.stringify([{id:'rec',kind:'puntual',type:'Rec. Gestiones',title:'Gestión repetida',note:'Descripción <segura>',start:'2026-09-24',repeat:{type:'weekly',weekDays:[4]}},{id:'tomorrow',kind:'puntual',type:'Plan/Quedada',title:'Plan de mañana',start:'2026-10-02',color:'#fb923c'}]));
  localStorage.setItem('excelia-rutinas-v1',JSON.stringify([{id:'gym',name:'Rutina de prueba',icon:'gym',color:'#ff8800',start:'2026-09-01',weekDays:[4],time:'17:00',dur:60}]));
 });
 await page.goto('/');await page.locator('#tasksFab').click();
 await expect(page.locator('#tasksReminders')).toBeVisible();
 await page.locator('#tasksReminders').click();await expect(page.locator('#homePopup')).toBeVisible();
 await expect(page.getByRole('button',{name:'Entendido',exact:true})).toHaveCount(0);
 await expect(page.locator('.home-pending-tasks li')).toHaveText(['Gestión repetida','Primera tarea']);
 await expect(page.locator('#homePopupContent')).toContainText('Gestión repetida');
 await expect(page.locator('#homePopupContent')).toContainText('Rutina de prueba');
 await expect(page.locator('.home-reminder-next-day')).toContainText('Plan de mañana');
 await expect(page.locator('.home-reminder-symbol .ev-management-mark')).toHaveCSS('box-shadow','none');
 const third=page.locator('.home-popup-item').filter({hasText:'Tercera cumple'});
 await expect(third).toBeHidden();await page.locator('#homeBirthdayToggle').click();await expect(third).toBeVisible();
 const position=await page.locator('#homeBirthdayToggle').boundingBox(),lastBirthday=await third.boundingBox();expect(position.y).toBeGreaterThanOrEqual(lastBirthday.y+lastBirthday.height);
 await expect(page.locator('.home-reminder-vip')).toBeVisible();
 await expect(page.locator('.home-popup-item.bday .home-reminder-content').first()).toHaveText('Sin alarma');
 const note=page.locator('.home-reminder-disclosure').filter({hasText:'Descripción <segura>'});
 await expect(note.locator('p')).toBeHidden();await note.locator('summary').click();await expect(note.locator('p')).toHaveText('Descripción <segura>');
 await note.locator('p').click();await expect(note.locator('p')).toBeHidden();
 await note.locator('.home-reminder-content').click();await expect(note.locator('p')).toBeVisible();await note.locator('summary').press('Enter');await expect(note.locator('p')).toBeHidden();
 await expect(page.locator('#homePopupClose')).toBeInViewport();
 const lines=await page.locator('.home-popup-item.event').first().evaluate(el=>({title:el.querySelector('.home-reminder-content').getBoundingClientRect().y,when:el.querySelector('.home-reminder-when').getBoundingClientRect().y}));expect(lines.title).toBeGreaterThan(lines.when);
 await expect(page.locator('#homeBirthdayToggle')).toHaveText(/Mostrar menos/);
 await page.locator('#homeBirthdayToggle').click();await expect(third).toBeHidden();
 await page.locator('#homeTasksOpen').click();await expect(page.locator('#tasksOverlay')).toBeVisible();await expect(page.locator('.task-title')).toHaveCount(4);
 await page.locator('#tasksReminders').click();await expect(page.locator('#homePopup')).toBeVisible();await page.locator('#homePopupClose').click();
 await page.locator('#tasksFab').click();await page.locator('#tasksReminders').click();await page.locator('#homePopup').click({position:{x:3,y:3}});await expect(page.locator('#homePopup')).toBeHidden();
 await page.locator('#econBtn').click();await expect(page.locator('.econ-equiv-metric').first()).toContainText('Por día');
 await expect(page.locator('.econ-equiv-hourly')).toContainText('Por hora');await expect(page.locator('.econ-equiv-val')).not.toContainText(',');
});
