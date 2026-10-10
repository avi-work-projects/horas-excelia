const {chooseTime}=require('./time-picker-helper');
const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'));
  await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
  await page.goto('/');
});
async function newEvent(page){
  await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await page.locator('#evViewUpcoming').click();await page.locator('#evAdd').click();
}
test('repetición exige días, guarda las horas y permite deshacer',async({page})=>{
  await newEvent(page);
  await expect(page.locator('#evFTypePicker .selected')).toHaveCount(0);
  await page.locator('#evFTitle').fill('Gestión semanal de prueba');
  await page.locator('#evFSave').click();await expect(page.locator('#toast')).toContainText('Elige una categoría');
  await page.locator('#evFTypePicker [data-type="Rec. Gestiones"]').click();
  await page.locator('#evFStart').fill('2026-10-05');await page.locator('#evFEnd').fill('2026-10-30');
  await chooseTime(page,'#evFTime','10:30');await chooseTime(page,'#evFEndTime','11:15');
  await page.locator('#evFRepeat').selectOption('weekly');await page.locator('#evFSave').click();
  await expect(page.locator('#toast')).toContainText('Selecciona al menos un día');
  expect(await page.evaluate(()=>EVENTS.length)).toBe(0);
  await page.locator('.ev-wd-btn[data-wd="1"]').click();await page.locator('.ev-wd-btn[data-wd="3"]').click();
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  const event=await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-events-v1'))[0]);
  expect(event).toMatchObject({type:'Rec. Gestiones',time:'10:30',endTime:'11:15',repeat:{type:'weekly',weekDays:[1,3]}});
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  expect(await page.evaluate(()=>EVENTS.length)).toBe(0);
});
test('editar multidía conserva el resto de notas y el título personalizado',async({page})=>{
  await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await page.evaluate(()=>{
    EVENTS=[{id:'multi-test',kind:'puntual',type:'Otros',title:'Título propio',color:'#a78bfa',shape:'wave',start:'2026-10-08',end:'2026-10-10',dates:['2026-10-08','2026-10-10'],dayNotes:{'2026-10-08':'Nota ocho','2026-10-10':'Nota diez'}}];
    EV_EDIT_DS='2026-10-08';openEvForm(EVENTS[0]);
  });
  await expect(page.locator('#evFStart')).toBeDisabled();
  await page.locator('#evFDayNote').fill('Nueva nota');await page.locator('#evFNote').fill('Para todos los días');
  await page.locator('#evFShapePicker [data-shape="x-outline"]').click();await page.locator('#evFSave').click();
  await expect(page.locator('#evFWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({title:'Título propio',shape:'x-outline',dates:['2026-10-08','2026-10-10'],dayNotes:{'2026-10-08':'Nueva nota','2026-10-10':'Nota diez'}});
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  expect(await page.evaluate(()=>EVENTS[0].dayNotes['2026-10-08'])).toBe('Nota ocho');
});
test('cambiar de clase reinicia repetición y conserva trayectos sin hora',async({page})=>{
  await newEvent(page);await page.locator('#evFTypePicker [data-type="Rec. Gestiones"]').click();await page.locator('#evFTitle').fill('Viaje de prueba');
  await page.locator('#evFRepeat').selectOption('weekly');
  await page.locator('.ev-kind-btn[data-kind="grande"]').click();
  await expect(page.locator('#evFRepeat')).toHaveValue('none');
  await page.locator('#evFTypePicker [data-type="Otros"]').click();
  await expect(page.locator('#evFTitle')).toHaveValue('Viaje de prueba');
  await page.locator('.ev-viaje-chk[data-tramo="ida"]').check();
  await page.locator('.ev-viaje-modo[data-tramo="ida"]').selectOption('coche');
  await page.locator('.ev-viaje-tramo[data-tramo="ida"] .ev-viaje-cond').fill('Conductor de prueba');
  await page.locator('.ev-viaje-chk[data-tramo="vuelta"]').check();
  await chooseTime(page,'.ev-viaje-tramo[data-tramo="vuelta"] .ev-viaje-time','18:30');
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>EVENTS[0])).toMatchObject({kind:'grande',type:'Otros',barSize:'sm',repeat:null,viaje:{ida:{time:null,modo:'coche',conductor:'Conductor de prueba'},vuelta:{time:'18:30',modo:'tren'}}});
});
test('Asturias sugiere el título sin rellenar la nota ni borrar una nota escrita',async({page})=>{
  await newEvent(page);await page.locator('.ev-kind-btn[data-kind="grande"]').click();
  await page.locator('#evFTypePicker [data-type="Asturias"]').click();
  await expect(page.locator('#evFTitle')).toHaveValue('Asturias');
  await expect(page.locator('#evFNote')).toHaveValue('');
  await expect(page.locator('#evCharCnt')).toHaveText('0/200');
  await page.locator('#evFNote').fill('Mi nota de prueba');
  await page.locator('#evFTypePicker [data-type="Viaje"]').click();
  await page.locator('#evFTypePicker [data-type="Asturias"]').click();
  await expect(page.locator('#evFNote')).toHaveValue('Mi nota de prueba');
});

test('ensayos por rango son clases independientes y Deshacer restaura días cerrados',async({page})=>{
  await page.evaluate(()=>{BODA_CLOSED={'2026-10-05':true};saveBodaClosed();});
  await newEvent(page);await page.locator('#evFTypePicker [data-type="Ensayos boda"]').click();
  await page.locator('#evFStart').fill('2026-10-05');await page.locator('#evFEnd').fill('2026-10-06');
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  const classes=await page.evaluate(()=>EVENTS);
  expect(classes).toHaveLength(2);expect(classes.map(c=>c.start)).toEqual(['2026-10-05','2026-10-06']);
  for(const c of classes){expect(c.boda.time).toBeNull();expect(c.start).toBe(c.end);expect(c.dates).toBeUndefined();}
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  expect(await page.evaluate(()=>EVENTS.length)).toBe(0);expect(await page.evaluate(()=>BODA_CLOSED['2026-10-05'])).toBe(true);
});
test('el catálogo nuevo carga el formulario completo sin conexión',async({page,context})=>{
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);await page.reload();await newEvent(page);
  await page.locator('#evFTypePicker [data-type="Llamada"]').click();await page.locator('#evFSave').click();
  await expect(page.locator('#evFWrap')).toHaveCount(0);
  expect(await page.evaluate(()=>EVENTS[0].type)).toBe('Llamada');
  await context.setOffline(false);
});
