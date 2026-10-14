const {test,expect}=require('@playwright/test');const {chooseTime}=require('./time-picker-helper');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copiedText=text}});});
  await page.goto('/');await page.evaluate(()=>{RUTINAS=[{id:'fixed',name:'Pádel',icon:'padel',color:'#a3e635',start:'2026-09-01',weekDays:[1,5],time:'15:00',dur:60,weeks:{},skips:{},extraSessions:[{id:'extra-test',date:'2026-10-15',time:'16:00',dur:60,skip:false}]},{id:'flex',name:'Baile flexible',icon:'baile',color:'#e03131',start:'2026-09-01',weekDays:[],time:'18:00',dur:60,weeks:{},skips:{},flex:{period:'week',target:2,weeklyTarget:2,sessions:{'2026-10-13':{time:'18:00',dur:60}}}}];saveRutinas();});
  await page.locator('#eventsBtn').click();
});
test('histórico: horario original/nuevo, vuelta al original, cancelación y editor estable',async({page},info)=>{
  await page.evaluate(()=>openRutHistory(RUTINAS[0]));await page.locator('[data-history-edit="2026-10-16"]').click();
  const sheet=page.locator('#rutHistoryEditOv .ev-form-sheet');await expect(sheet).toBeVisible();const height=(await sheet.boundingBox()).height;
  const field=await page.locator('.rut-session-fields').boundingBox(),note=await page.locator('#rutHistoryEditOv .sy-note').first().boundingBox();expect(note.y-field.y-field.height).toBeGreaterThanOrEqual(17);
  await page.screenshot({path:info.outputPath('editar-sesion.png'),animations:'disabled'});
  await chooseTime(page,'#rutHistoryTime','17:00');await page.locator('#rutHistorySave').click();await expect(page.locator('#rutHistoryEditWrap')).toHaveCount(0);
  const row=page.locator('[data-history-date="2026-10-16"]');await expect(row).toContainText('Horario original');await expect(row).toContainText('Horario nuevo');await expect(row).toContainText('15:00–16:00');await expect(row).toContainText('17:00–18:00');await expect(page.locator('[data-history-month="2026-10"] .rut-history-month-counts')).toContainText('1 movidas de horario');
  await page.locator('[data-history-edit="2026-10-16"]').click();await chooseTime(page,'#rutHistoryTime','15:00');await page.locator('#rutHistorySave').click();await expect(page.locator('#rutHistoryEditWrap')).toHaveCount(0);await expect(row).not.toContainText('Editada');
  await page.locator('[data-history-edit="2026-10-16"]').click();await page.locator('#rutHistoryCancel').click();expect((await sheet.boundingBox()).height).toBe(height);await page.locator('#rutHistoryCancel').click();await page.locator('#rutHistoryEditClose').click();await expect(page.locator('#rutHistoryEditWrap')).toHaveCount(0);await expect(row).not.toContainText('Editada');
  await page.locator('.rut-history-body').evaluate(el=>{const section=el.querySelector('[data-history-month="2026-10"]');el.scrollTop+=section.getBoundingClientRect().top-el.getBoundingClientRect().top+90;});
  await page.screenshot({path:info.outputPath('historico-scroll.png'),animations:'disabled'});
  await page.locator('[data-history-edit="extra-test"]').click();await expect(page.locator('#rutHistoryCancel,#rutHistoryRecover')).toHaveCount(0);await expect(page.locator('#rutHistoryDelete')).toBeVisible();
});
test('flexible: tercer botón, calendario de extra y clase independiente',async({page},info)=>{
  await page.locator('#evViewRutinas').click();await expect(page.locator('[data-rid="flex"] .rut-card-actions>button')).toHaveCount(3);await page.screenshot({path:info.outputPath('rutinas.png'),animations:'disabled'});
  await page.locator('[data-rextra="flex"]').click();await expect(page.locator('.rut-dpick-real')).toBeVisible();const height=(await page.locator('.rut-addition-sheet').boundingBox()).height;await page.locator('#rutRecoveryNext').click();expect((await page.locator('.rut-addition-sheet').boundingBox()).height).toBe(height);await page.locator('#rutRecoveryPrev').click();await page.locator('#rutAdditionOv .ev-cell[data-ds="2026-10-15"]').click();await page.locator('#rutRecoveryConfirm').click();expect((await page.locator('.rut-addition-sheet').boundingBox()).height).toBe(height);await page.screenshot({path:info.outputPath('clase-extra.png'),animations:'disabled'});await page.locator('#rutExtraSave').click();await expect(page.locator('#rutAdditionWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>RUTINAS[1].extraSessions[0].date)).toBe('2026-10-15');expect(await page.evaluate(()=>RUTINAS[1].flex.sessions['2026-10-15']||null)).toBeNull();
});
test('rutinas activas: 1 centrada, reparto de 2 a 4 y más opciones',async({page},info)=>{
  await page.locator('#evAdd').click();
  for(const count of [1,2,3,4,5]){
    await page.evaluate(n=>{RUTINAS=Array.from({length:n},(_,i)=>({...RUTINAS[0],id:'test-'+i,name:'Rutina '+(i+1)}));openEvForm(null);},count);
    const group=page.locator('.ev-routines-active');await group.scrollIntoViewIfNeeded();await expect(group.locator('[data-event-routine]')).toHaveCount(Math.min(count,4));
    const boxes=await group.locator('[data-event-routine]').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
    expect(new Set(boxes.map(b=>b.y)).size).toBe(1);expect(Math.max(...boxes.map(b=>b.width))-Math.min(...boxes.map(b=>b.width))).toBeLessThan(1);
    if(count===1){const bounds=await group.locator('.ev-routines-quick').boundingBox();expect(Math.abs(boxes[0].x+boxes[0].width/2-bounds.x-bounds.width/2)).toBeLessThan(1);}
    await page.screenshot({path:info.outputPath('activas-'+count+'.png'),animations:'disabled'});
    if(count===5){await page.locator('#evRoutinesMore').click();await expect(page.locator('#evRoutinesOv [data-event-routine]')).toHaveCount(5);await page.locator('#evRoutinesClose').click();}
  }
});
test('alta fija: avisa de compromisos y permite sustituir una sesión de la semana',async({page})=>{
  await page.locator('#evAdd').click();await page.locator('[data-event-routine="fixed"]').click();await expect(page.locator('#evRoutineWeek')).toContainText('Ya tienes 2 sesiones planificadas');await page.locator('[name="routineReplace"][value="2026-10-16"]').check();await chooseTime(page,'#evRoutineTime','17:00');await page.locator('#evRoutineSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  const state=await page.evaluate(()=>({old:rutOccursOn(RUTINAS[0],'2026-10-16'),added:rutSessionByKey(RUTINAS[0],'2026-10-14'),next:rutOccursOn(RUTINAS[0],'2026-10-23'),events:EVENTS.length}));expect(state.old).toBeNull();expect(state.added.time).toBe('17:00');expect(state.added.extra).toBeFalsy();expect(state.next).toBe('15:00');expect(state.events).toBe(0);
});
test('planes: desayuno, cultural con subtipo, actividades al final y símbolo de carrera distinto',async({page},info)=>{
  await page.locator('#evAdd').click();await page.locator('[data-picker=plans]').click();
  await expect(page.locator('.ev-plan-options [data-type]').nth(0)).toHaveAttribute('data-type','Comida');await expect(page.locator('.ev-plan-options [data-type]').nth(1)).toHaveAttribute('data-type','Tomar algo');await expect(page.locator('.ev-plan-options [data-type]').nth(2)).toHaveAttribute('data-type','Cena');await expect(page.locator('[data-type="Desayunar"]')).toBeVisible();await expect(page.locator('#evPlanPickerOv [data-type="Ponencia"]')).toBeVisible();
  await page.screenshot({path:info.outputPath('planes.png'),animations:'disabled'});await page.locator('#evPlanPickerOv [data-type="Plan cultural"]').click();await page.locator('#evPlanConfirm').click();await expect(page.locator('#evFCultureBlock [data-culture]')).toHaveText(['Monólogo','Teatro','Scape Room','Otro']);await page.locator('[data-culture=Teatro]').click();await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);expect(await page.evaluate(()=>EVENTS[0].culturalPlan)).toBe('Teatro');await page.evaluate(()=>openEvForm(EVENTS[0]));await expect(page.locator('[data-culture=Teatro]')).toHaveAttribute('aria-pressed','true');
});
test('orden: horas configurables, flechas coherentes, persistencia y mismo orden de recordatorios',async({page},info)=>{
  await page.locator('#evUpcomingOrder').click();const row=page.locator('[data-order-type="Cena"]');await chooseTime(page,'[data-order-type="Cena"] input','13:00');await row.scrollIntoViewIfNeeded();await row.locator('[data-order-move="-1"]').click();await expect(page.locator('#toast')).toContainText('cambia primero la hora');await page.screenshot({path:info.outputPath('orden.png'),animations:'disabled'});await page.locator('#evOrderSave').click();await expect(page.locator('#evPlanOrderWrap')).toHaveCount(0);
  await page.reload();expect(await page.evaluate(()=>evPlanReferenceTime('Cena'))).toBe('13:00');const order=await page.evaluate(()=>{RUTINAS=[];EVENTS=[{id:'dinner',title:'Cena',type:'Cena',kind:'puntual',start:'2026-10-14'},{id:'earlier',title:'Antes',type:'Otros',kind:'puntual',start:'2026-10-14',time:'12:50'},{id:'later',title:'Después',type:'Otros',kind:'puntual',start:'2026-10-14',time:'13:10'}];return {marks:evSortMarks(EVENTS).map(e=>e.id),reminders:homeReminderEvents(new Date('2026-10-14T12:00:00')).map(e=>e.event.id)};});expect(order.marks).toEqual(['earlier','dinner','later']);expect(order.reminders).toEqual(order.marks);
});
test('mis datos: atajos iguales, color sólido y copia sin prefijos de contacto',async({page},info)=>{
  await page.evaluate(()=>{closeEvents();appStorage.setItem(CONTACT_DATA_KEY,JSON.stringify({name:'Persona de Prueba',tax:'DNI FICTICIO',phone:'600000000',emails:[{value:'test@example.invalid'}]}));});await expect(page.locator('#eventsOverlay')).toBeHidden();await page.evaluate(()=>openPersonalData());
  const boxes=await page.locator('.contact-shortcuts button').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {y:r.y,w:r.width,h:r.height,bg:getComputedStyle(e).backgroundColor};}));expect(new Set(boxes.map(b=>b.y)).size).toBe(1);expect(new Set(boxes.map(b=>b.h)).size).toBe(1);expect(Math.max(...boxes.map(b=>b.w))-Math.min(...boxes.map(b=>b.w))).toBeLessThan(1);
  await page.locator('[data-contact-shortcut=contact]').click();expect(await page.evaluate(()=>copiedText)).toBe('Persona de Prueba\nDNI / NIE: DNI FICTICIO\n600000000\ntest@example.invalid');await page.screenshot({path:info.outputPath('mis-datos.png'),animations:'disabled'});
  await page.locator('[data-contact=tax]').locator('..').locator('button').click();expect(await page.evaluate(()=>copiedText)).toBe('DNI / NIE: DNI FICTICIO');
});
test('calendario móvil: primera fila izquierda alineada con segunda derecha y contador morado',async({page},info)=>{
  for(const width of [360,400,440]){
    await page.setViewportSize({width,height:880});
    for(const count of [2,5]){
      await page.evaluate(n=>{EVENTS=Array.from({length:n},(_,i)=>({id:'marker-'+i,title:'Plan '+i,type:'Comida',kind:'puntual',start:'2026-10-16',end:'2026-10-16',time:String(9+i).padStart(2,'0')+':00',color:'#e99a31'}));BDAYS=[];_switchEvView('cal');EV_YEAR=2026;EV_MONTH=9;refreshEvents(false);},count);
      const day=page.locator('#eventsContent .ev-cell[data-ds="2026-10-16"]');const left=await day.locator('.ev-day-left .ev-rut-mark').first().boundingBox(),right=await day.locator('.ev-otros-corner>span').nth(1).boundingBox();expect(Math.abs(left.y+left.height/2-right.y-right.height/2)).toBeLessThanOrEqual(1);
      await page.screenshot({path:info.outputPath('calendario-'+width+'-'+count+'.png'),animations:'disabled'});
    }
  }
  await page.evaluate(()=>{tasksCreate('Recordatorio de prueba');tasksUpdateFab();});await expect(page.locator('.tasks-count')).toHaveCSS('border-color','rgb(184, 166, 223)');await page.screenshot({path:info.outputPath('contador.png'),animations:'disabled'});
});
test('estadísticas: extras realizadas aumentan cumplimiento y recuperación del orden desde backup',async({page},info)=>{
  await page.evaluate(()=>{RUTINAS[1].extraSessions=[{id:'extra-past',date:'2026-10-12',time:'19:00',dur:60,skip:false}];RUT_SUBTAB='stats';_switchEvView('rutinas');refreshEvents(false);});
  await expect(page.locator('.rut-stat-card').filter({hasText:'Baile flexible'})).toContainText('200%');await expect(page.locator('.rut-stat-card').filter({hasText:'Baile flexible'})).toContainText('1 extras');await page.screenshot({path:info.outputPath('cumplimiento.png'),animations:'disabled'});
  const restored=await page.evaluate(()=>{var data=[{type:'Cena',time:'13:00'}];applyFullImport({planOrder:data},'merge');return {value:evPlanReferenceTime('Cena'),stored:JSON.parse(appStorage.getItem(EV_PLAN_ORDER_KEY))};});expect(restored.value).toBe('13:00');expect(restored.stored[0].type).toBe('Cena');
});
test('próximos cumpleaños: añadir centrado y Total con estilo energético',async({page},info)=>{
  await page.locator('#evUpBirthdays').click();const add=await page.locator('#evBdayAdd').boundingBox(),viewport=page.viewportSize();expect(Math.abs(add.x+add.width/2-viewport.width/2)).toBeLessThan(1);await page.screenshot({path:info.outputPath('proximos-cumples.png'),animations:'disabled'});
  for(const id of ['#evSubStats','#evSubTodos']){await page.locator(id).click();await expect(page.locator('.ev-period-total')).toHaveClass(/energy-total-button/);await page.screenshot({path:info.outputPath(id.slice(1)+'.png'),animations:'disabled'});}
});
