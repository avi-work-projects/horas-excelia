const {test,expect}=require('@playwright/test');const {chooseTime}=require('./time-picker-helper');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evAdd').click();
});
test('cabecera fija y dinámica, controles a la derecha y cuerpo con scroll móvil',async({page},info)=>{
 const title=page.locator('#evFHeadingTitle');await expect(title).toHaveText('Nuevo Evento');await expect(page.locator('#evFRepeat')).toHaveCount(0);await expect(page.locator('[data-ev-multiday]:not(:disabled)')).toHaveCount(0);
 await page.locator('#evFTypePicker [data-type="Comida"]').click();await expect(title).toHaveText('Comida');await page.locator('#evFTitle').fill('Mi título personal');await expect(title).toHaveText('Mi título personal');
 for(const width of [320,400,440]){
  await page.setViewportSize({width,height:880});
  const frame=await page.locator('.ev-event-form-sheet').evaluate(el=>{const h=el.querySelector('.ev-event-form-header').getBoundingClientRect(),b=el.getBoundingClientRect();return {header:h.y-b.y,height:b.height};});
  const writingRight=await page.locator('.ev-form-lead').evaluate(el=>el.querySelector('.ev-form-schedule').getBoundingClientRect().left-el.querySelector('.ev-form-writing').getBoundingClientRect().right);expect(writingRight).toBeGreaterThan(0);
  const aligned=await page.locator('.ev-form-lead').evaluate(el=>{const fields=el.querySelectorAll('.ev-form-writing .ev-field'),hours=el.querySelector('#evFHoraRow').getBoundingClientRect(),dates=el.querySelector('#evFDateRow').getBoundingClientRect(),title=fields[0].getBoundingClientRect(),note=fields[1].getBoundingClientRect();return [Math.abs(title.top-hours.top),Math.abs(title.bottom-hours.bottom),Math.abs(note.top-dates.top),Math.abs(note.bottom-dates.bottom),dates.top-hours.bottom];});expect(aligned.slice(0,4).every(delta=>delta<1)).toBe(true);expect(aligned[4]).toBeGreaterThan(0);
  await page.screenshot({path:info.outputPath('nuevo-evento-'+width+'.png'),animations:'disabled'});
  await page.locator('#evFTypePicker [data-type="Otros"]').click();await page.locator('.ev-event-form-body').evaluate(el=>el.scrollTop=el.scrollHeight);
  await expect(page.locator('#evFClose')).toBeInViewport();await expect(title).toBeInViewport();await expect(page.locator('#evFSave')).toBeInViewport();
  const after=await page.locator('.ev-event-form-sheet').evaluate(el=>{const h=el.querySelector('.ev-event-form-header').getBoundingClientRect(),b=el.getBoundingClientRect();return {header:h.y-b.y,height:b.height};});expect(after).toEqual(frame);
  await page.screenshot({path:info.outputPath('scroll-'+width+'.png'),animations:'disabled'});await page.locator('.ev-event-form-body').evaluate(el=>el.scrollTop=0);
 }
 await page.locator('#evFTitle').fill('');await expect(title).toHaveText('Nuevo Evento');await expect(page.locator('.ev-kind-btn[data-kind="puntual"] .ev-kind-symbols i')).toHaveCount(4);
 await expect(page.locator('.ev-kind-btn[data-kind="grande"] .ev-kind-symbols i')).toHaveCount(3);const symbols=await page.locator('.ev-kind-picker').evaluate(el=>{const buttons=[...el.querySelectorAll('.ev-kind-btn')],centers=buttons.map(b=>{const r=b.querySelector('.ev-kind-symbols i').getBoundingClientRect();return r.top+r.height/2;});return {colors:buttons.map(b=>getComputedStyle(b).color),offset:Math.abs(centers[0]-centers[1])};});expect(symbols.colors[0]).toBe(symbols.colors[1]);expect(symbols.offset).toBeLessThan(1);
});
test('puntual de un día sin fin ni repetición, incluso frente a un fin manipulado',async({page})=>{
 await page.locator('#evFTypePicker [data-type="Otros"]').click();await page.locator('#evFTitle').fill('Sesión de prueba');await page.locator('#evFStart').fill('2026-10-16');await expect(page.locator('#evFEnd')).toBeDisabled();
 await page.locator('#evFEnd').evaluate(el=>el.value='2026-10-20');await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>({start:EVENTS[0].start,end:EVENTS[0].end,repeat:EVENTS[0].repeat,dates:EVENTS[0].dates||null}))).toEqual({start:'2026-10-16',end:'2026-10-16',repeat:null,dates:null});
});
test('grande permite fechas y horas diferentes, incluida la hora final al día siguiente',async({page},info)=>{
 await page.locator('.ev-kind-btn[data-kind="grande"]').click();await page.locator('#evFTypePicker [data-type="Viaje"]').click();await page.locator('#evFTitle').fill('Viaje nocturno');await page.locator('#evFStart').fill('2026-10-16');await expect(page.locator('#evFEnd')).toBeEnabled();await page.locator('#evFEnd').fill('2026-10-17');
 await chooseTime(page,'#evFTime','23:00');await chooseTime(page,'#evFEndTime','08:00');await page.screenshot({path:info.outputPath('grande.png'),animations:'disabled'});await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({kind:'grande',start:'2026-10-16',end:'2026-10-17',time:'23:00',endTime:'08:00',repeat:null});
});
test('ensayo de un día con hora y checks de categoría sin sombreado adicional',async({page},info)=>{
 for(const type of ['Otros','Ensayos boda']){
  const option=page.locator('#evFTypePicker [data-type="'+type+'"]');await option.click();await expect(option).toHaveClass(/selected/);expect(await option.evaluate(el=>getComputedStyle(el,'::after').visibility)).toBe('visible');await expect(option).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 }
 await page.locator('#evFStart').fill('2026-10-16');await chooseTime(page,'#evFTime','18:30');await expect(page.locator('#evFEndTime')).toBeDisabled();await expect(page.locator('#evFEndTime')).toHaveValue('19:30');await page.screenshot({path:info.outputPath('ensayo.png'),animations:'disabled'});await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>EVENTS.length)).toBe(1);expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({start:'2026-10-16',end:'2026-10-16',boda:{time:'18:30'}});
});
test('editar eventos anteriores conserva fechas discontinuas, repetición y notas',async({page})=>{
 await page.evaluate(()=>{EVENTS=[{id:'legacy',kind:'puntual',type:'Otros',title:'Registro anterior',start:'2026-10-16',end:'2026-10-22',dates:['2026-10-16','2026-10-22'],repeat:{type:'yearly'},color:'#a3e635',dayNotes:{'2026-10-16':'Nota conservada'}}];openEvForm(EVENTS[0]);});
 await expect(page.locator('#evFStart')).toBeDisabled();await expect(page.locator('#evFEnd')).toBeDisabled();await expect(page.locator('#evFRepeat')).toHaveCount(0);await expect(page.locator('[data-ev-multiday]:not(:disabled)')).toBeEnabled();await page.locator('#evFNote').fill('Nota corregida');await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({id:'legacy',start:'2026-10-16',end:'2026-10-22',dates:['2026-10-16','2026-10-22'],repeat:{type:'yearly'},note:'Nota corregida',dayNotes:{'2026-10-16':'Nota conservada'}});
});
test('el marco y la cabecera del carrusel permanecen quietos durante el arrastre',async({page},info)=>{
 await page.evaluate(()=>{closeEvForm();EVENTS=[{id:'first',kind:'puntual',type:'Comida',title:'Primera ficha',color:'#e99a31',start:'2026-10-14',end:'2026-10-14'},{id:'second',kind:'puntual',type:'Otros',title:'Segunda ficha',color:'#a3e635',start:'2026-10-14',end:'2026-10-14',note:'Contenido de la segunda ficha'}];EV_YEAR=2026;EV_MONTH=9;EV_VIEW='cal';refreshEvents();openEvDayCarousel('2026-10-14','first');});
 await expect(page.locator('#evFWrap')).toHaveCount(0);const sheet=page.locator('#evDetailOv>.ev-car-sheet');await sheet.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
 const original=await sheet.boundingBox();const heading=await page.locator('#evDTitle').boundingBox();const x=heading.x+20,y=heading.y+10;const toolbar=await page.locator('.ev-detail-toolbar').boundingBox();
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-45,y,{steps:5});await expect(page.locator('.ev-car-preview')).toHaveCount(2);
 expect(await sheet.boundingBox()).toEqual(original);expect(await page.locator('.ev-detail-toolbar').boundingBox()).toEqual(toolbar);expect(await page.locator('.ev-car-content:not(.ev-car-preview)').evaluate(el=>el.style.transform)).toContain('-45px');
 await expect(page.locator('#evDAlarm')).toHaveText('🔔');await expect(page.locator('#evDAlarm')).toHaveCSS('border-radius','9px');await page.screenshot({path:info.outputPath('contenido-en-arrastre.png')});
 await page.mouse.up();await expect(page.locator('.ev-car-preview')).toHaveCount(0);await expect(page.locator('#evDTitle')).toHaveText('Primera ficha');
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-150,y,{steps:8});await page.mouse.up();await expect(page.locator('#evDTitle')).toHaveText('Segunda ficha');expect(await sheet.boundingBox()).toEqual(original);expect(await page.evaluate(()=>EV_MONTH)).toBe(9);await page.screenshot({path:info.outputPath('segunda-ficha.png'),animations:'disabled'});
});
