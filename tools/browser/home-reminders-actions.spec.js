const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));
  await page.addInitScript(()=>{
    localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
    localStorage.setItem('excelia-tasks-v1',JSON.stringify({items:['Comprar pintura','Revisar recibos','Reservar cita'].map((title,i)=>({id:'task'+i,title,createdAt:1,updatedAt:1,completedAt:null,deletedAt:null})),weeklyReminder:false,reminderWeek:''}));
    localStorage.setItem('excelia-horas-v3',JSON.stringify({sent:{'2026-09-28':true,'2026-10-05':true,'2026-10-12':true,'2026-10-26':true,'2026-11-02':true,'2026-11-09':true}}));
    localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Ana',day:24,month:10},{name:'Luis',day:25,month:10,vip:true},{name:'Marina',day:26,month:10}]));
    localStorage.setItem('excelia-events-v1',JSON.stringify([
      {id:'dinner',kind:'puntual',type:'Cena',title:'Cena con amigos',start:'2026-10-24',end:'2026-10-24',time:'21:00',color:'#a78bfa',note:'Mesa en la terraza'},
      {id:'lunch',kind:'puntual',type:'Comida',title:'Comida familiar',start:'2026-10-25',end:'2026-10-25',time:'14:00',color:'#e99a31'},
      {id:'trip',kind:'grande',type:'Viaje',title:'Escapada a la montaña',start:'2026-10-23',end:'2026-10-25',color:'#38bdf8',note:'Recoger las llaves'}
    ]));
  });
  await page.goto('/');await expect(page.locator('#homePopup')).toBeVisible();
});
async function hold(page,locator,touch){
  await locator.scrollIntoViewIfNeeded();const r=await locator.boundingBox();
  if(touch){
    const session=await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
    await page.waitForTimeout(580);
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();return;
  }
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
  await page.waitForTimeout(580);await page.mouse.up();
}
test('panel único de cumpleaños y accesos compactos desde tareas y ajustes',async({page})=>{
  await expect(page.locator('.home-pending-tasks li')).toHaveCount(3);
  await expect(page.locator('.home-pending-warnings .warn')).toHaveCount(1);
  await expect(page.locator('.home-pending-warnings')).toContainText('Semana del 19/10');
  await expect(page.locator('.home-pending-header #homeTasksOpen')).toHaveText('Mis tareas (3)›');
  await expect(page.locator('.home-pending-header small')).toHaveCount(0);
  expect(await page.evaluate(()=>Object.keys(ST).length)).toBe(0);
  await page.screenshot({path:'test-results/recordatorios-pendientes-semana.png'});
  await page.locator('#homeBirthdayToggle').click();
  const rows=await page.locator('[data-reminder-birthday]').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));
  expect(rows).toHaveLength(3);
  expect(rows[1].top-rows[0].bottom).toBeLessThan(1);expect(rows[2].top-rows[1].bottom).toBeLessThan(1);
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    await page.locator('#homeTasksOpen').click();await expect(page.locator('#tasksReminders')).toBeInViewport();
    await expect(page.locator('#tasksReminders')).toHaveText('Recordatorios');
    const actions=await page.locator('.tasks-header').evaluate(el=>({overflow:el.scrollWidth>el.clientWidth,close:el.querySelector('#tasksClose').getBoundingClientRect().right,reminders:el.querySelector('#tasksReminders').getBoundingClientRect().right}));
    expect(actions.overflow).toBe(false);expect(actions.reminders).toBeLessThan(actions.close);
    await expect(page.locator('#tasksOverlay')).toHaveCSS('opacity','1');
    await page.screenshot({path:'test-results/tareas-recordatorios-'+width+'.png',animations:'disabled'});
    await page.locator('#tasksReminders').click();await expect(page.locator('#homePopup')).toBeVisible();
    await page.locator('#homePopupClose').click();await page.locator('#menuBtn').click();
    const theme=await page.locator('#themeBtn').boundingBox(),reminders=await page.locator('#settingsReminders').boundingBox();
    await expect(page.locator('#settingsReminders')).toHaveText('Recordatorios');
    expect(reminders.x).toBeGreaterThanOrEqual(theme.x+theme.width);expect(Math.abs(reminders.y-theme.y)).toBeLessThan(1);
    await page.screenshot({path:'test-results/ajustes-recordatorios-'+width+'.png',animations:'disabled'});
    await page.locator('#settingsReminders').click();await expect(page.locator('#dataMenu')).not.toHaveClass(/open/);
    await expect(page.locator('#homePopup')).toBeVisible();
  }
});
test('pulsación larga edita cumpleaños, puntual y grande sin desplegar notas al soltar',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.locator('#homePopupClose').click();await page.evaluate(()=>openHousehold());
  await page.locator('#householdOverlay [data-nav=menu]').click();await page.locator('#settingsReminders').click();
  const stored=await page.evaluate(()=>localStorage.getItem('excelia-events-v1'));
  await hold(page,page.locator('[data-reminder-birthday="0"]'));
  await expect(page.locator('#bdFName')).toHaveValue('Ana');await expect(page.locator('#homePopup')).toBeHidden();
  await expect(page.locator('#householdOverlay')).not.toHaveClass(/open/);
  await page.locator('#bdFName').fill('Ana editada');await page.locator('#bdFSave').click();
  await expect(page.locator('#bdFWrap')).toHaveCount(0);
  await page.evaluate(()=>openHomePopup(true));await expect(page.locator('.home-birthday-name').first()).toContainText('Ana editada');
  await hold(page,page.locator('[data-reminder-id=dinner]'));
  await expect(page.locator('#homePopup')).toBeVisible();await expect(page.locator('#evFWrap')).toHaveCount(0);
  await page.locator('[data-reminder-id=dinner] [data-reminder-edit]').click();
  await expect(page.locator('#evFTitle')).toHaveValue('Cena con amigos');
  expect(await page.evaluate(()=>localStorage.getItem('excelia-events-v1'))).toBe(stored);
  await page.locator('#evFTitle').fill('Cena editada');await page.locator('#evFSave').click();
  await expect(page.locator('#evFWrap')).toHaveCount(0);
  await page.evaluate(()=>openHomePopup(true));await expect(page.locator('[data-reminder-id=dinner]')).not.toHaveAttribute('open');
  await hold(page,page.locator('[data-reminder-id=trip]'));
  await expect(page.locator('#evFTitle')).toHaveValue('Escapada a la montaña');
  await page.locator('#evFClose').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  await page.evaluate(()=>openHomePopup(true));
  await page.locator('[data-reminder-id=lunch]').press('F2');
  await page.locator('[data-reminder-id=lunch] [data-reminder-edit]').click();
  await expect(page.locator('#evFTitle')).toHaveValue('Comida familiar');
  expect(errors).toEqual([]);
});
test('rutinas y ensayos abren su editor específico; el scroll cancela la pulsación larga',async({page})=>{
  await page.evaluate(()=>{
    RUTINAS=[{id:'plan',name:'Pádel de prueba',icon:'padel',color:'#a3e635',start:'2026-10-01',weekDays:[],weeks:{},skips:{},time:'18:00',dur:60,flex:{period:'month',target:3,weeklyTarget:1,sessions:{'2026-10-24':{time:'18:00',dur:60}}}}];saveRutinas();
    EVENTS.push({id:'class',kind:'puntual',type:'Ensayos boda',title:'Ensayo',start:'2026-10-25',boda:{time:'17:00',duration:60,place:'casa'}});saveEvents();openHomePopup(true);
  });
  const card=page.locator('[data-reminder-id=dinner]');
  await card.dispatchEvent('touchstart',{touches:[{identifier:0,clientX:100,clientY:300}]});
  await card.dispatchEvent('touchmove',{touches:[{identifier:0,clientX:100,clientY:340}]});
  await page.waitForTimeout(580);await card.dispatchEvent('touchend',{touches:[]});
  await expect(page.locator('#homePopup')).toBeVisible();await expect(page.locator('#evFWrap')).toHaveCount(0);
  await hold(page,page.locator('.home-popup-item').filter({hasText:'Pádel de prueba'}),true);
  await page.locator('.home-popup-item').filter({hasText:'Pádel de prueba'}).locator('[data-reminder-edit]').click();
  await expect(page.locator('#rutHistoryTime')).toHaveValue('18:00');await expect(page.locator('#rutFormOv')).toHaveCount(0);
  await page.locator('#rutHistoryDuration').fill('75');await page.locator('#rutHistorySave').click();
  await expect(page.locator('#rutHistoryEditWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>RUTINAS[0].flex.sessions['2026-10-24'].dur)).toBe(75);
  await page.evaluate(()=>openHomePopup(true));await hold(page,page.locator('[data-reminder-id=class]'));
  await page.locator('[data-reminder-id=class] [data-reminder-edit]').click();
  await expect(page.locator('#bodaFormOv')).toBeVisible();
  expect(await page.evaluate(()=>BODA_FORM.ev.id)).toBe('class');
});

test('puntuales: Editar y X en la fila, cancelar sin cambios y una sola selección',async({page})=>{
  const dinner=page.locator('[data-reminder-id=dinner]'),lunch=page.locator('[data-reminder-id=lunch]');
  const stored=await page.evaluate(()=>localStorage.getItem('excelia-events-v1'));
  const panel=await page.locator('.home-popup').boundingBox();
  for(const width of [400,320]){
    await page.setViewportSize({width,height:880});
    await hold(page,dinner,true);
    await expect(dinner.locator('[data-reminder-edit]')).toBeVisible();
    await expect(dinner).not.toHaveAttribute('open');await expect(page.locator('#evFWrap')).toHaveCount(0);
    expect(await page.locator('.home-popup').evaluate(el=>el.getBoundingClientRect().height)).toBe(panel.height);
    expect(await dinner.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await page.screenshot({path:'test-results/recordatorios-editar-'+width+'.png'});
    await dinner.locator('[data-reminder-cancel]').click();
    await expect(dinner.locator('[data-reminder-edit]')).toBeHidden();await expect(dinner).not.toHaveAttribute('open');
  }
  await hold(page,dinner);await hold(page,lunch);
  await expect(dinner.locator('[data-reminder-edit]')).toBeHidden();await expect(lunch.locator('[data-reminder-edit]')).toBeVisible();
  await lunch.press('Escape');await expect(lunch.locator('[data-reminder-edit]')).toBeHidden();
  await dinner.locator('summary').click();await expect(dinner.locator('.home-reminder-description')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('excelia-events-v1'))).toBe(stored);
  await hold(page,lunch);await page.locator('#homePopupClose').click();await page.evaluate(()=>openHomePopup(true));
  await expect(page.locator('.home-reminder-edit-actions:not([hidden])')).toHaveCount(0);
});
