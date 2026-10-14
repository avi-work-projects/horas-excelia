const {test,expect}=require('@playwright/test');const {chooseTime}=require('./time-picker-helper');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);await page.locator('#evAdd').click();
});
async function selectDays(page,days){
 await page.locator('#evFPickDates').click();await expect(page.locator('.dp-sheet')).toBeVisible();
 for(const ds of days)await page.locator('#dpOv [data-ds="'+ds+'"]').click();await page.locator('#dpAccept').click();await expect(page.locator('#dpWrap')).toHaveCount(0);
}
test('Multidía siempre visible; solo Otros y Ensayos Boda lo activan',async({page},info)=>{
 for(const width of [320,400,440]){await page.setViewportSize({width,height:880});await expect(page.locator('#evFPickDates')).toBeInViewport();await expect(page.locator('#evFPickDates')).toBeDisabled();await page.screenshot({path:info.outputPath('nuevo-evento-'+width+'.png'),animations:'disabled'});}
 for(const type of ['Rec. Gestiones','Comida','Ensayos boda','Otros']){
  await page.locator('#evFTypePicker [data-type="'+type+'"]').click();await expect(page.locator('#evFPickDates')).toBeVisible();await expect(page.locator('#evFEnd')).toBeDisabled();if(['Otros','Ensayos boda'].includes(type))await expect(page.locator('#evFPickDates')).toBeEnabled();else await expect(page.locator('#evFPickDates')).toBeDisabled();
 }
 await page.locator('.ev-kind-btn[data-kind="grande"]').click();await expect(page.locator('#evFPickDates')).toBeVisible();await expect(page.locator('#evFPickDates')).toBeDisabled();await expect(page.locator('#evFEnd')).toBeEnabled();
 await page.screenshot({path:info.outputPath('grande.png'),animations:'disabled'});
});
test('Otros conserva días sueltos y horas; permite volver a un solo día al editar',async({page},info)=>{
 await page.locator('#evFTypePicker [data-type="Otros"]').click();await page.locator('#evFTitle').fill('Días de prueba');await chooseTime(page,'#evFTime','16:00');await chooseTime(page,'#evFEndTime','17:00');await selectDays(page,['2026-10-16','2026-10-20']);
 await expect(page.locator('#evFPickDatesCount')).toHaveText('2 días');await expect(page.locator('#evFStart')).toBeDisabled();await expect(page.locator('#evFEnd')).toBeDisabled();await page.locator('.ev-event-form-body').evaluate(el=>el.scrollTop=0);await page.screenshot({path:info.outputPath('otros-multidia.png'),animations:'disabled'});await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 const saved=await page.evaluate(()=>({event:EVENTS[0],between:eventOccursOn(EVENTS[0],new Date('2026-10-17T12:00:00'))}));expect(saved.event).toMatchObject({type:'Otros',start:'2026-10-16',end:'2026-10-16',dates:['2026-10-16','2026-10-20'],time:'16:00',endTime:'17:00',repeat:null});expect(saved.between).toBe(false);
 await page.reload();await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);await page.evaluate(()=>openEvForm(EVENTS[0]));await expect(page.locator('#evFPickDatesCount')).toHaveText('2 días');await selectDays(page,['2026-10-20']);await expect(page.locator('#evFPickDatesCount')).toHaveText('1 día');await expect(page.locator('#evFStart')).toBeEnabled();await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>({start:EVENTS[0].start,end:EVENTS[0].end,dates:EVENTS[0].dates||null}))).toEqual({start:'2026-10-16',end:'2026-10-16',dates:null});
});
test('Cancelar no aplica días; cambiar de año conserva el marco y los días provisionales',async({page},info)=>{
 await page.locator('#evFTypePicker [data-type="Otros"]').click();await page.locator('#evFPickDates').click();const picker=page.locator('.dp-sheet');await expect(picker).toBeVisible();await picker.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));const frame=await picker.boundingBox();
 await page.locator('#dpOv [data-ds="2026-10-16"]').click();await expect(page.locator('#dpOv [data-ds="2026-10-16"]')).toHaveCSS('color','rgb(26, 26, 46)');await page.locator('#dpYrNext').click();await expect(page.locator('.dp-yearnav span')).toHaveText('2027');expect(await picker.boundingBox()).toEqual(frame);await expect(page.locator('.dp-counter b')).toHaveText('1');await page.locator('#dpOv [data-ds="2027-01-10"]').click();await expect(page.locator('.dp-counter b')).toHaveText('2');await page.screenshot({path:info.outputPath('selector-multidia.png'),animations:'disabled'});
 await page.locator('#dpClose').click();await expect(page.locator('#dpWrap')).toHaveCount(0);await expect(page.locator('#evFPickDatesCount')).toHaveText('');await expect(page.locator('#evFStart')).toBeEnabled();expect(await page.evaluate(()=>EVENTS.length)).toBe(0);
 await page.locator('#evFPickDates').click();await expect(page.locator('.dp-counter b')).toHaveText('0');await page.locator('#dpClose').click();
});
for(const kind of ['puntual','grande'])test('Cambiar a otra categoría '+kind+' no conserva Multidía activo',async({page})=>{
 await page.locator('#evFTypePicker [data-type="Otros"]').click();await page.locator('#evFTitle').fill('Cambio de categoría');await selectDays(page,['2026-10-16','2026-10-20']);
 if(kind==='grande')await page.locator('.ev-kind-btn[data-kind="grande"]').click();await page.locator('#evFTypePicker [data-type="'+(kind==='grande'?'Viaje':'Comida')+'"]').click();await expect(page.locator('#evFPickDates')).toBeDisabled();await expect(page.locator('#evFStart')).toBeEnabled();await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>({kind:EVENTS[0].kind,dates:EVENTS[0].dates||null}))).toEqual({kind,dates:null});
});
test('Ensayos Boda crea una clase por día, conserva hora y permite deshacer los cierres',async({page},info)=>{
 await page.evaluate(()=>{BODA_CLOSED={'2026-10-16':true};saveBodaClosed();});await page.locator('#evFTypePicker [data-type="Ensayos boda"]').click();await page.locator('#evFNote').fill('Ensayos de prueba');await chooseTime(page,'#evFTime','18:30');await selectDays(page,['2026-10-16','2026-10-20']);await page.locator('.ev-event-form-body').evaluate(el=>el.scrollTop=0);await page.screenshot({path:info.outputPath('ensayos-multidia.png'),animations:'disabled'});await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
 const classes=await page.evaluate(()=>EVENTS);expect(classes).toHaveLength(2);expect(classes.map(e=>e.start)).toEqual(['2026-10-16','2026-10-20']);for(const e of classes){expect(e.end).toBe(e.start);expect(e.dates).toBeUndefined();expect(e.boda.time).toBe('18:30');expect(e.note).toBe('Ensayos de prueba');}expect(await page.evaluate(()=>BODA_CLOSED['2026-10-16'])).toBeUndefined();
 await page.getByRole('button',{name:'Deshacer',exact:true}).click();expect(await page.evaluate(()=>EVENTS.length)).toBe(0);expect(await page.evaluate(()=>BODA_CLOSED['2026-10-16'])).toBe(true);
});
test('Vaciar permite regresar al día único y el límite comprueba todos los días seleccionados',async({page})=>{
 await page.locator('#evFTypePicker [data-type="Otros"]').click();await page.locator('#evFTitle').fill('Días con límite');await selectDays(page,['2026-10-16','2026-10-20']);await page.locator('#evFPickDates').click();await page.locator('#dpClear').click();await page.locator('#dpAccept').click();await expect(page.locator('#dpWrap')).toHaveCount(0);await expect(page.locator('#evFStart')).toBeEnabled();await expect(page.locator('#evFPickDatesCount')).toHaveText('');
  await selectDays(page,['2026-10-16','2026-10-20']);await page.evaluate(()=>{EVENTS=Array.from({length:5},(_,i)=>({id:'full-'+i,title:'Plan de prueba '+i,kind:'puntual',type:'Comida',start:'2026-10-20',end:'2026-10-20',color:'#e99a31'}));});await page.locator('#evFSave').click();await expect(page.locator('#toast')).toContainText('el máximo');await expect(page.locator('.ev-event-form-sheet')).toBeVisible();expect(await page.evaluate(()=>EVENTS.length)).toBe(5);
});
