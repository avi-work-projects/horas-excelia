const {test,expect}=require('@playwright/test');
const {exportFile}=require('./export-helper');
test.use({isMobile:true,hasTouch:true,viewport:{width:400,height:880}});
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date(2026,9,11,12));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Ana Prueba',day:11,month:10,vip:true,categories:['Amigos N.A.S.A','Familia Cercana']},{name:'Luis Prueba',day:20,month:12,categories:[]} ]));});
 await page.goto('/');
});
test('cumpleaños: volver sin intervalo, tamaño por contenido y espacio entre categorías',async({page},info)=>{
 await page.locator('#eventsBtn').click();await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();await page.locator('.bday-list-item[data-bday-idx="0"]').click();
 await expect(page.locator('#bdDetailOv')).toBeVisible();const height=(await page.locator('#bdDetailOv .bd-detail-sheet').boundingBox()).height;
 await page.screenshot({path:info.outputPath('cumpleanos.png')});
 await page.locator('#bdDEdit').click();
 expect(await page.evaluate(()=>{document.getElementById('bdFClose').click();return !!document.querySelector('#bdDetailOv.open')&&!document.getElementById('bdFWrap');})).toBe(true);
 await page.locator('#bdDAlarm').click();
 expect(await page.evaluate(()=>{document.getElementById('bdAlarmClose').click();return !!document.querySelector('#bdDetailOv.open')&&!document.getElementById('bdAlarmWrap');})).toBe(true);
 const spacing=await page.locator('#bdDetailOv').evaluate(el=>({font:parseFloat(getComputedStyle(el.querySelector('.bd-detail-name')).fontSize),gap:el.querySelector('.bday-person-groups').getBoundingClientRect().top-el.querySelector('.bday-category-heading').getBoundingClientRect().bottom,scroll:el.querySelector('.bd-panel-body').scrollHeight-el.querySelector('.bd-panel-body').clientHeight}));
 expect(spacing.font).toBeGreaterThan(16);expect(spacing.gap).toBeGreaterThanOrEqual(10);expect(spacing.scroll).toBeLessThan(2);
 await page.locator('#bdDClose').click();await page.locator('.bday-list-item[data-bday-idx="1"]').click();await expect(page.locator('#bdDetailOv')).toBeVisible();expect((await page.locator('#bdDetailOv .bd-detail-sheet').boundingBox()).height).toBeLessThan(height);
});
test('exportar: elección explícita, compartir sin copia y copia sin compartir',async({page},info)=>{
 await page.evaluate(async()=>{await EXPORT_DIRECTORY_READY;window.sent=0;window.saved=0;EXPORT_DIRECTORY={name:'Prueba',queryPermission:async()=> 'granted',getFileHandle:async()=>({createWritable:async()=>({write:async()=>saved++,close:async()=>{}})})};Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{sent++;}});});
 await page.locator('#csvExportBtn').click();await page.screenshot({path:info.outputPath('exportar.png')});expect(await page.evaluate(()=>[sent,saved])).toEqual([0,0]);await page.locator('#exportChoiceClose').click();await expect(page.locator('#exportChoiceWrap')).toHaveCount(0);
 await exportFile(page,'#csvExportBtn','share');expect(await page.evaluate(()=>[sent,saved])).toEqual([1,0]);
 await exportFile(page,'#csvExportBtn','save');expect(await page.evaluate(()=>[sent,saved])).toEqual([1,1]);
 await exportFile(page,'#csvExportBtn','both');expect(await page.evaluate(()=>[sent,saved])).toEqual([2,2]);
});
test('rutina fija: saltar, recuperar y decidir qué hacer con la recuperación sin salir',async({page},info)=>{
 await page.evaluate(()=>{window.testRoutine={id:'test-fixed',name:'Clase de prueba',icon:'gen',color:'#a78bfa',start:'2026-10-01',weekDays:[0],time:'18:00',dur:60,skips:{},weeks:{}};RUTINAS=[testRoutine];openEvents();openEvAlarm(rutEventsOn('2026-10-11')[0],new Date('2026-10-11T12:00:00'));});
 await expect(page.locator('#evAlarmOv')).toBeVisible();await page.screenshot({path:info.outputPath('ver-ficha.png'),animations:'disabled'});await page.locator('#evAlarmInfo').click();await expect(page.locator('#evDRutSes')).toBeVisible();const originalSheetHeight=(await page.locator('#evDetailOv .ev-detail-sheet').boundingBox()).height;await page.screenshot({path:info.outputPath('sesion-activa.png'),animations:'disabled'});
 await page.locator('#evDRutSes').click();await expect(page.locator('#evDetailOv')).toBeVisible();await expect(page.locator('#evDRutRecover')).toBeVisible();await expect(page.locator('#evDRutSes')).toHaveText('Marcar como hecha');expect((await page.locator('#evDetailOv .ev-detail-sheet').boundingBox()).height).toBe(originalSheetHeight);await page.screenshot({path:info.outputPath('sesion-saltada.png'),animations:'disabled'});
 await page.locator('#evDRutRecover').click();await page.locator('#rutAdditionOv [data-ds="2026-10-12"]').click();await page.locator('#rutRecoveryConfirm').click();await page.locator('#rutExtraSave').click();await expect(page.locator('#rutAdditionWrap')).toHaveCount(0);await expect(page.locator('#evDetailOv')).toBeVisible();
 await expect(page.locator('#evDetailOv .rut-recovery-note')).toContainText('12/10/2026');await page.locator('#evDRutSes').click();await expect(page.locator('#rutDoneOv')).toBeVisible();await page.screenshot({path:info.outputPath('recuperacion.png')});
 await page.locator('#rutDoneCancel').click();await expect(page.locator('#rutDoneWrap')).toHaveCount(0);expect(await page.evaluate(()=>testRoutine.skips['2026-10-11'])).toBe(1);
 await page.locator('#evDRutSes').click();await page.locator('#rutDoneExtra').click();await expect(page.locator('#rutDoneWrap')).toHaveCount(0);await expect(page.locator('#evDetailOv')).toBeVisible();expect(await page.evaluate(()=>testRoutine.extraSessions[0].recoveryOf||null)).toBeNull();await expect(page.locator('#evDRutSes')).toHaveText('Marcar como saltada');
 await page.locator('#evDRutSes').click();await page.evaluate(()=>{const result=rutAddSession(testRoutine,{date:'2026-10-13',time:'18:00',dur:60},'2026-10-11');Object.assign(testRoutine,result);});await page.locator('#evDRutSes').click();await page.locator('#rutDoneDelete').click();await expect(page.locator('#rutDoneWrap')).toHaveCount(0);expect(await page.evaluate(()=>testRoutine.extraSessions.length)).toBe(1);
 await page.evaluate(()=>{testRoutine.flex={period:'week',target:2,sessions:{'2026-10-11':{time:'18:00',dur:60}}};openEvDetail(rutEventsOn('2026-10-11')[0]);});await expect(page.locator('#evDRutSes')).toHaveCount(0);await expect(page.locator('#evDRutEdit')).toBeVisible();
});
test('Todos: filtros por tipo y clase distinguen Otros puntual de grande',async({page},info)=>{
 await page.evaluate(()=>{EVENTS=[{id:'a',title:'Puntual prueba',kind:'puntual',type:'Otros',color:'#c084fc',start:'2026-10-12',end:'2026-10-12'},{id:'b',title:'Grande prueba',kind:'grande',type:'Otros',color:'#38bdf8',start:'2026-10-12',end:'2026-10-13'}];EV_VIEW='upcoming';EV_UPCOMING_SUB='todos';openEvents();});
 await page.locator('#evViewUpcoming').click();await page.locator('#evSubTodos').click();await expect(page.locator('.ev-search-ico')).toHaveCount(0);await page.locator('#evTypesFilter').click();await expect(page.locator('#evTypeFilterOv')).toBeVisible();await page.screenshot({path:info.outputPath('filtro.png'),animations:'disabled'});
 await page.locator('.ev-filter-category-group summary').filter({hasText:'Eventos grandes'}).click();await page.locator('[data-type="grande|Otros"]').click();await expect(page.locator('.ev-list-item')).toHaveCount(1);await expect(page.locator('.ev-list-title')).toHaveText('Grande prueba');
 await page.locator('#evTypesFilter').click();await page.locator('[data-type="puntual|*"]').click();await expect(page.locator('.ev-list-title')).toHaveText('Puntual prueba');
});

test('Guardar y compartir sin carpeta descarga una sola copia aunque se cancele Compartir',async({page})=>{
 let count=0;page.on('download',()=>count++);
 await page.evaluate(async()=>{await EXPORT_DIRECTORY_READY;EXPORT_DIRECTORY=null;window.sharedNames=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async({files})=>{sharedNames.push(files[0].name);if(window.cancelShare)throw new DOMException('Cancelado','AbortError');}});});
 for(const cancel of [false,true]){
  await page.evaluate(value=>window.cancelShare=value,cancel);const pending=page.waitForEvent('download');await exportFile(page,'#csvExportBtn','both');const file=await pending;
  expect(file.suggestedFilename()).toBe(await page.evaluate(()=>sharedNames.at(-1)));
 }
 expect(count).toBe(2);
});
