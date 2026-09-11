const {test,expect}=require('@playwright/test');
test('mobile: menus, cumpleanos, guardado y deshacer',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Persona de prueba',day:22,month:8}]));});
 await page.goto('/');await page.locator('#menuBtn').click();await page.locator('#themeBtn').click();await page.locator('#menuBtn').click();
 await page.locator('#bdayBtn').click();await page.locator('#bdViewList').click();await page.locator('.bday-list-item').first().click();await page.locator('#bdDEdit').click();
 await page.locator('#bdFName').fill('Nombre editado');await page.locator('#bdFSave').click();await expect(page.getByRole('button',{name:'Deshacer',exact:true})).toBeVisible();await page.getByRole('button',{name:'Deshacer',exact:true}).click();
 await expect(page.locator('#bdayContent')).toContainText('Persona De Prueba');expect(errors).toEqual([]);
});
test('publicacion no incluye datos privados ni herramientas',async({request})=>{for(const url of ['/CLAUDE.md','/tools/fixture.json','/horas-excelia-backup-test.json'])expect((await request.get(url)).status()).toBe(404);});

test('backup: importar, repetir sin duplicar y rechazar datos invalidos',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 const backup={days:{},events:[{id:'one',kind:'puntual',type:'Otros',title:'Evento de prueba',start:'2026-09-10',end:'2026-09-10',color:'#123456'}]};
 async function upload(data){await page.locator('#menuBtn').click();await page.locator('#importAllBtn').click();await page.locator('#importAllFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.locator('.imp-mode-btn').first().click();}
 await upload(backup);await upload(backup);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-events-v1')).length)).toBe(1);
 await upload({days:{},events:[{...backup.events[0],start:'2026-02-31'}]});
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-events-v1'))[0].start)).toBe('2026-09-10');
});
test('actualizar desde menu recarga, sin consumir el click al cerrar',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'SW_UPDATED',version:'test'}})));
 await page.locator('#menuBtn').click();await expect(page.locator('#swUpdBtn')).toBeVisible();
 await Promise.all([page.waitForEvent('load'),page.locator('#swUpdBtn').click()]);
 await expect(page.locator('#dataMenu')).not.toHaveClass(/open/);
});

test('migracion privada desde cache anterior sin sobrescribir datos locales',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.evaluate(async()=>{
   const old=await caches.open('horas-excelia-legacy-test');
   const payload=btoa(JSON.stringify([{name:'Ejemplo legado',day:1,month:1}]));
   await old.put('/index.html',new Response("var TO='ejemplo@example.invalid';var CC='';var AUTHOR_NAME='Prueba';var BDAYS_RAW='"+payload+"';"));
   await migrateLegacyDefaults();
 });
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-mail-config-v1')).to)).toBe('ejemplo@example.invalid');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-bdays-v1'))[0].name)).toBe('Ejemplo legado');
});

test('ajustes bloqueados, guardado explicito y backup con conexiones',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 await page.locator('#menuBtn').click();
 await expect(page.locator('#mailToLocal')).not.toBeVisible();await expect(page.locator('#macroAlarmUrlMenu')).not.toBeVisible();
 await page.locator('summary').filter({hasText:'Correo de horas'}).click();await expect(page.locator('#mailToLocal')).toBeVisible();
 for(const id of ['mailToLocal','mailCcLocal','mailNameLocal','macroAlarmUrlMenu'])await expect(page.locator('#'+id)).toHaveAttribute('readonly','');
 await page.locator('#editConnectionsBtn').click();
 await page.locator('#mailToLocal').fill('test@example.invalid');await page.locator('#mailNameLocal').fill('Prueba');
 await page.locator('#macroAlarmUrlMenu').fill('https://trigger.macrodroid.com/TEST');
 expect(await page.evaluate(()=>localStorage.getItem('excelia-mail-config-v1'))).toBeNull();
 await page.locator('#editConnectionsBtn').click();await expect(page.locator('#mailToLocal')).toHaveAttribute('readonly','');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportAllBtn').click()]);
 const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
 expect(data.mailConfig.to).toBe('test@example.invalid');expect(data.macroUrl).toBe('https://trigger.macrodroid.com/TEST');
 await page.evaluate(()=>{localStorage.removeItem('excelia-mail-config-v1');localStorage.removeItem('excelia-alarm-url');});
 await page.evaluate(d=>applyFullImport(d,'replace'),data);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('excelia-mail-config-v1')).to)).toBe('test@example.invalid');
 expect(await page.evaluate(()=>localStorage.getItem('excelia-alarm-url'))).toBe(data.macroUrl);
});

test('Bodas: configurar pack, duracion, salas y exportar catalogos',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  localStorage.setItem('excelia-bodas-v1',JSON.stringify([{id:'p2',name:'Pareja prueba',contracted:2,weddingDate:'2030-01-01',color:'#123456'}]));
  localStorage.setItem('excelia-events-v1',JSON.stringify([1,2,3].map(i=>({id:'cls'+i,kind:'puntual',type:'Ensayos boda',title:'Ensayo',start:'2020-01-0'+i,end:'2020-01-0'+i,color:'#123456',boda:{coupleId:'p2',time:'18:00',place:'casa'}}))));
 });
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewBodas').click();await page.locator('[data-bsub="stats"]').click();
 await expect(page.locator('#eventsContent')).toContainText('1 pareja con clases extras');
 await page.locator('#bodaConfigBtn').click();
 await page.locator('[data-teacher-name=angel]').fill('Profesor A');await page.locator('[data-teacher-name=celia]').fill('Profesora B');await page.locator('#bodaSaveTeacherNames').click();
 await page.locator('[data-default-place=sala]').check();expect(await page.evaluate(()=>BODA_PLACE_DEFAULT)).toBe('sala');
 await expect(page.locator('[data-cfg-delete="packs"][data-id="pack-2"]')).toHaveCount(0);
 await expect(page.locator('[data-cfg-delete="places"][data-id="casa"]')).toHaveCount(0);
 await page.locator('[data-cfg-edit="packs"][data-id="pack-2"]').click();await page.locator('#bodaCatalogNumber').fill('6');await page.locator('#bodaCatalogSave').click();
 expect(await page.evaluate(()=>BODA_COUPLES[0].packClasses)).toBe(2);
 await page.locator('[data-cfg-add="packs"]').click();await page.locator('#bodaCatalogName').fill('Pack tres');await page.locator('#bodaCatalogNumber').fill('3');await page.locator('#bodaCatalogSave').click();
 await expect(page.locator('#bodaConfigContent')).toContainText('Pack tres');
 await page.locator('[data-cfg-add="places"]').click();await page.locator('#bodaCatalogName').fill('Sala nueva');await page.locator('#bodaCatalogDesc').fill('Sala de pruebas');await page.locator('#bodaCatalogSave').click();
 await expect(page.locator('#bodaConfigContent')).toContainText('Sala de pruebas');
 await page.locator('[data-default="dur-20"]').check();
 await page.locator('[data-cfg-edit="places"][data-id="casa"]').click();await page.locator('#bodaCatalogName').fill('Mi casa');await page.locator('#bodaCatalogDesc').fill('Descripcion modificada');await page.locator('#bodaCatalogSave').click();
 await page.locator('[data-bsub="clases"]').click();await page.locator('#bodaAddClass').click();
 await expect(page.locator('#bodaFormDuration')).toContainText('20 min');
 await expect(page.locator('.ev-bficha #bodaFormDuration')).toHaveCount(1);await expect(page.locator('#bodaFormOv .ev-bficha')).toHaveCount(3);await expect(page.locator('#bodaFormTeachers')).toContainText('Profesor A y Profesora B');
 expect(await page.locator('#bodaFormDuration').evaluate(el=>!!(document.querySelector('[data-fcampo=pareja]').compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
 await page.locator('#bodaFormDia').fill('2030-01-05');await page.locator('#bodaFormSave').click();
 expect(await page.evaluate(()=>EVENTS.find(e=>e.start==='2030-01-05').boda.duration)).toBe(20);
 await page.evaluate(()=>openBodaClaseForm(EVENTS.find(e=>e.id==='cls1')));
 await page.locator('#bodaFormTeachers').click();await page.locator('[data-teacher=angel]').uncheck();await page.locator('[data-teacher=angel]').check();await page.locator('[data-teacher=substitute]').check();await expect(page.locator('[data-teacher=celia]')).not.toBeChecked();await expect(page.locator('[data-teacher=angel]')).toBeChecked();
 await page.locator('[data-teacher=celia]').click();await expect(page.locator('[data-teacher=celia]')).not.toBeChecked();
 await page.locator('[data-teacher=substitute]').uncheck();await page.locator('[data-teacher=angel]').click();await expect(page.locator('[data-teacher=angel]')).toBeChecked();await page.locator('[data-teacher=substitute]').check();await page.locator('#bodaTeacherName').fill('Profesora prueba');await page.locator('#bodaTeachersSave').click();
 await expect(page.locator('#bodaFormTeachers')).toContainText('Profesor A y Sustituto');
 await page.locator('#bodaFormDuration').click();await page.locator('[data-duration=dur-20]').click();await expect(page.locator('#bodaFormOv')).toContainText('18:20');await page.locator('#bodaFormSave').click();
 expect(await page.evaluate(()=>EVENTS.find(e=>e.id==='cls1').boda.duration)).toBe(20);
 await page.locator('#eventsContent').getByRole('button',{name:'Inicio',exact:true}).click();await page.locator('#menuBtn').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportAllBtn').click()]);const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
 expect(data.events.find(e=>e.id==='cls1').boda.teachers).toEqual({celia:false,angel:true,substitute:'Profesora prueba',lastSelected:'angel'});
 expect(data.bodaConfig.teacherNames).toEqual({angel:'Profesor A',celia:'Profesora B'});expect(data.bodaConfig.defaultPlace).toBe('sala');
 expect(data.bodaConfig.defaultDurationId).toBe('dur-20');expect(data.bodaConfig.places.find(p=>p.k==='casa').n).toBe('Mi casa');
 await page.evaluate(d=>applyFullImport(d,'replace'),data);expect(await page.evaluate(()=>BODA_CONFIG)).toEqual(data.bodaConfig);expect(errors).toEqual([]);
});

test('Hoy apunta al mes y las cinco subpestanas de Bodas admiten swipe',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-bdays-v1',JSON.stringify(Array.from({length:60},(_,m)=>({name:'Persona '+m,day:1+Math.floor(m/12),month:m%12+1}))));});
 await page.goto('/');await page.locator('#bdayBtn').click();await page.locator('#bdViewList').click();
 await page.evaluate(()=>document.querySelector('#bdayOverlay .sy-body').scrollTop=0);
 await page.locator('#bdVipAll').click();
 expect(await page.evaluate(()=>{var body=document.querySelector('#bdayOverlay .sy-body'),sec=body.querySelector('[data-month="'+new Date().getMonth()+'"]');return Math.abs(sec.getBoundingClientRect().top-body.getBoundingClientRect().top-8)<2;})).toBe(true);
 await page.locator('#bdayContent').getByRole('button',{name:'Eventos',exact:true}).click();await page.locator('#evViewBodas').click();await page.locator('[data-bsub="stats"]').click();
 async function swipe(left){await page.locator('#eventsOverlay .boda-sec').evaluate((el,left)=>{el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:el,clientX:left?300:80,clientY:400})]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:el,clientX:left?80:300,clientY:400})]}));},left);}
 await swipe(true);await expect(page.locator('#bodaConfigContent')).toBeVisible();await expect(page.locator('#bodaConfigWrap')).toHaveCount(0);
 await swipe(false);await expect(page.locator('[data-bsub="stats"]')).toHaveClass(/active/);
 await swipe(false);await expect(page.locator('[data-bsub="calendario"]')).toHaveClass(/active/);
 await swipe(false);await expect(page.locator('[data-bsub="parejas"]')).toHaveClass(/active/);
 await swipe(false);await expect(page.locator('[data-bsub="clases"]')).toHaveClass(/active/);
 await expect(page.locator('[data-bmode="editar"]')).not.toHaveClass(/action-edit/);
 const positions=[];
 for(const name of ['clases','parejas','calendario','stats','config']){
  await page.locator('[data-bsub="'+name+'"]').click();
  positions.push(await page.locator('.boda-sticky-hd [data-bsub]').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})));
 }
 for(const row of positions)row.forEach((r,i)=>r.forEach((v,j)=>expect(Math.abs(v-positions[0][i][j])).toBeLessThan(1)));

});

test('rutinas: horario inmediato, semana futura, historico editable y backup',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00'));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  if(!localStorage.getItem('excelia-rutinas-v1'))localStorage.setItem('excelia-rutinas-v1',JSON.stringify([{id:'history',name:'Actividad prueba',icon:'gen',color:'#a78bfa',start:'2026-01-01',weekDays:[1],time:'17:00',dur:60,skips:{'2026-08-31':1},weeks:{}}]));
 });
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();await page.locator('.rut-edit').click();
 await expect(page.locator('#rutFormOv')).toHaveClass(/open/);
 await page.screenshot({path:'.local-preview/routine-form-spacing.png',animations:'disabled'});
 await expect(page.locator('#rutFStart')).toHaveCount(0);
 await page.locator('#rutFTime').fill('18:00');await page.locator('#rutFSave').click();await expect(page.locator('#rutFWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>['2026-08-17','2026-08-24'].map(ds=>rutOccursOn(RUTINAS[0],ds)))).toEqual(['17:00','18:00']);
 await page.locator('.rut-edit').click();await page.locator('#rutFWeek').click();await page.locator('[data-week="2026-08-31"]').click();
 await page.locator('#rutWkDays [data-wd="1"]').click();await page.locator('#rutWkDays [data-wd="2"]').click();await page.locator('#rutWkTime').fill('19:00');
 await page.locator('#rutWkForward').check();await expect(page.locator('#rutWkScope')).toContainText('Nuevo horario habitual');await page.locator('#rutWkSave').click();await expect(page.locator('#rutWkWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>['2026-08-17','2026-08-24','2026-08-31','2026-09-01','2026-09-07'].map(ds=>rutOccursOn(RUTINAS[0],ds)))).toEqual(['17:00','18:00','17:00','19:00',null]);
 await page.locator('.rut-edit').click();await page.locator('#rutFName').fill('Actividad renombrada');await page.locator('#rutFSave').click();await expect(page.locator('#rutFWrap')).toHaveCount(0);
 await page.locator('.rut-edit').click();await page.locator('#rutFHistory').click();
 await expect(page.locator('.rut-history-period')).toHaveCount(3);
 await page.locator('[data-period="2026-01-01"] summary').click();await page.locator('[data-history-more="2026-01-01"]').click();
 await page.locator('[data-history-edit="2026-08-17"]').click();await page.locator('#rutHistoryTime').fill('16:30');await page.locator('#rutHistoryDuration').fill('45');await page.locator('#rutHistorySave').click();await expect(page.locator('#rutHistoryEditWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>[rutOccursOn(RUTINAS[0],'2026-08-17'),rutDurationOn(RUTINAS[0],'2026-08-17'),rutOccursOn(RUTINAS[0],'2026-08-10')])).toEqual(['16:30',45,'17:00']);
 await page.screenshot({path:'.local-preview/routine-history-check.png'});
 await page.locator('#rutHistoryClose').click();await expect(page.locator('#rutHistoryWrap')).toHaveCount(0);
 await page.reload();await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
 expect(await page.evaluate(()=>rutOccursOn(RUTINAS[0],'2026-08-17'))).toBe('16:30');
 const download=page.waitForEvent('download');await page.locator('#eventsContent').getByRole('button',{name:'Inicio',exact:true}).click();await expect(page.locator('#eventsOverlay')).not.toBeVisible();await page.locator('#menuBtn').click();await page.locator('#exportAllBtn').click();
 const file=await download;const fs=require('fs');const data=JSON.parse(fs.readFileSync(await file.path(),'utf8'));
 expect(data.rutinas[0].scheduleHistory).toHaveLength(2);expect(data.rutinas[0].keptSessions['2026-08-17'].time).toBe('16:30');
 await page.locator('#menuBtn').click();await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
 async function swipe(left){await page.locator('#eventsOverlay .rut-sec').evaluate((el,left)=>{
  el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:el,clientX:left?300:80,clientY:400})]}));
  el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:el,clientX:left?80:300,clientY:400})]}));
 },left);}
 await swipe(true);await expect(page.locator('[data-rsub="stats"]')).toHaveClass(/active/);await swipe(false);await expect(page.locator('[data-rsub="lista"]')).toHaveClass(/active/);
 await page.locator('#rutAdd').click();
 await expect(page.locator('#rutFIcons [data-icon="baile"] svg')).toHaveAttribute('viewBox','-3 -3 30 30');
 await page.screenshot({path:'.local-preview/routine-form-check.png'});
});

test('Eventos: casillas y etiquetas del mismo color en claro y oscuro',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>document.documentElement.setAttribute('data-theme',theme),theme);
  for(const id of ['evUpShowRut','evUpShowBoda']){
   await page.locator('#'+id).check();
   const colors=await page.locator('#'+id).evaluate(el=>({box:getComputedStyle(el).backgroundColor,label:getComputedStyle(el.closest('label')).color,tick:getComputedStyle(el,'::after').borderTopColor}));
   expect(colors.box).toBe(colors.label);expect(colors.tick).not.toBe(colors.box);
  }
  await expect(page.locator('.wm-logo-check')).toBeVisible();
 }
});

test('rutinas canceladas: ocultas en vistas compactas, tachadas en detalle',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-rutinas-v1',JSON.stringify([{id:'cancel',name:'Actividad cancelada',icon:'baile',color:'#e03131',start:'2026-08-01',weekDays:[1],time:'18:00',dur:60,weeks:{},skips:{'2026-08-24':1}}]));});
 await page.goto('/');await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));await page.locator('#eventsBtn').click();await page.locator('#evViewUpcoming').click();
 await expect(page.locator('.ev-upcoming-item.rut-cancelled')).toHaveCount(1);
 await expect(page.locator('.rut-cancelled .ev-upcoming-title .rut-skipped-title')).toHaveCSS('text-decoration-line','line-through');
 await expect(page.locator('.rut-cancelled .rut-skip')).toHaveCount(1);
 await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
 await page.screenshot({path:'.local-preview/cancel-upcoming.png'});
 await page.locator('#evViewCal').click();await expect(page.locator('.ev-rut-mark.rut-skip')).toHaveCount(1);
 await page.screenshot({path:'.local-preview/cancel-month.png'});
 await page.evaluate(()=>{EV_QUAD_YEAR=2026;EV_QUAD_MONTH=7;});
 await page.locator('#evViewQuad').click();await expect(page.locator('.ev-annual-day[data-ds="2026-08-24"] .ev-ann-rut')).toHaveCount(0);await expect(page.locator('.ev-annual-day[data-ds="2026-08-31"] .ev-ann-rut')).toHaveCount(1);
 await page.locator('#evViewAnnual').click();await expect(page.locator('.ev-annual-day[data-ds="2026-08-24"] .ev-ann-rut')).toHaveCount(0);await expect(page.locator('.ev-annual-day[data-ds="2026-08-31"] .ev-ann-rut')).toHaveCount(1);
 await page.locator('#evViewWeek').click();await expect(page.locator('.ev-wk-chip.rut-cancelled')).toHaveCount(1);
 await expect(page.locator('.rut-cancelled .ev-wk-chip-title .rut-skipped-title')).toHaveCSS('text-decoration-line','line-through');
 const tones=await page.locator('.ev-wk-day-bg').evaluateAll(rows=>rows.slice(0,2).map(el=>getComputedStyle(el).backgroundColor));expect(tones[0]).not.toBe(tones[1]);
 await page.locator('.ev-wk-chip.rut-cancelled').scrollIntoViewIfNeeded();
 await page.screenshot({path:'.local-preview/cancel-week.png'});
});

test('agenda: transporte separado sin solapes',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00'));
 await page.addInitScript(()=>{
  sessionStorage.setItem('excelia-popup-dismissed','1');
  localStorage.setItem('excelia-events-v1',JSON.stringify([
   {id:'trip',kind:'grande',type:'Asturias',title:'Viaje de prueba',color:'#1946a0',start:'2026-08-21',end:'2026-08-24',viaje:{ida:{time:'16:37',modo:'tren'},vuelta:{time:'15:57',modo:'tren'}}},
   {id:'point',kind:'puntual',type:'Otros',title:'Actividad primer día',start:'2026-08-21',end:'2026-08-21',color:'#c67da0'},
   {id:'end',kind:'puntual',type:'Otros',title:'Actividad último día',start:'2026-08-24',end:'2026-08-24',color:'#c67da0'}]));
 });
 await page.goto('/');await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
 await page.locator('#eventsBtn').click();await page.locator('#evViewWeek').click();
 const first=page.locator('.ev-wk-chips[data-ds="2026-08-21"]'),last=page.locator('.ev-wk-chips[data-ds="2026-08-24"]');
 await expect(first).toContainText('Ida');await expect(first).not.toContainText('Vuelta');await expect(last).toContainText('Viaje de prueba - Vuelta');await expect(first).toContainText('Viaje de prueba - Ida');
 const ida=await first.locator('.ev-wk-travel-row').boundingBox(),point=await first.locator('.ev-wk-chip').boundingBox();expect(ida.y+ida.height).toBeLessThanOrEqual(point.y);
 const vuelta=await last.locator('.ev-wk-travel-footer').boundingBox(),end=await last.locator('.ev-wk-chip').boundingBox();expect(end.y+end.height).toBeLessThanOrEqual(vuelta.y);
 await first.scrollIntoViewIfNeeded();await page.screenshot({path:'.local-preview/agenda-transport.png'});

});

test('pestanas: tono estable y titulo de viaje que sigue al scroll',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-08-21T10:00:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-events-v1',JSON.stringify([{id:'sticky-trip',kind:'grande',type:'Asturias',title:'Viaje largo de prueba',start:'2026-08-01',end:'2026-08-30',color:'#1946a0',viaje:{ida:{modo:'tren',time:'09:00'},vuelta:{modo:'tren',time:'20:00'}}}]));});
 await page.goto('/');await page.locator('#eventsBtn').click();
 for(const theme of ['light','dark']){
  await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
  for(const id of ['evViewCal','evViewQuad','evViewAnnual','evViewWeek','evViewBodas','evViewRutinas','evViewTimeOff','evViewUpcoming']){
   const button=page.locator('#'+id);const before=await button.evaluate(el=>{const s=getComputedStyle(el);return [s.color,s.borderTopColor];});
   await button.click();const after=await button.evaluate(el=>{const s=getComputedStyle(el);return [s.color,s.borderTopColor];});expect(after).toEqual(before);
  }
 }
 await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
 await page.locator('#evViewWeek').click();
 const title=page.locator('.ev-wk-sticky-title[data-id="sticky-trip"]');
 await page.locator('.ev-wk-chips[data-ds="2026-08-15"]').scrollIntoViewIfNeeded();
 const y=(await title.boundingBox()).y;
 const sep=page.locator('.ev-wk-month-sep').first();expect(Math.abs(y-((await sep.boundingBox()).y+(await sep.boundingBox()).height))).toBeLessThan(1);

 await page.locator('#eventsOverlay .sy-body').evaluate(el=>el.scrollTop+=30);
 expect(Math.abs((await title.boundingBox()).y-y)).toBeLessThan(2);
 await expect.poll(async()=>title.evaluate(el=>{
  const y=el.getBoundingClientRect().top+1;
  const day=Array.from(el.closest('.ev-wk-mgrid').querySelectorAll('.ev-wk-day-bg')).find(d=>{const r=d.getBoundingClientRect();return r.top<=y&&r.bottom>y;});
  if(!day)return false;
  const bar=Array.from(el.closest('.ev-wk-mgrid').querySelectorAll('.ev-wk-multi')).find(b=>b.dataset.id===el.dataset.id);
  const base=getComputedStyle(day).backgroundColor.match(/[\d.]+/g).map(Number),tint=getComputedStyle(bar).backgroundColor.match(/[\d.]+/g).map(Number),a=tint.length>3?tint[3]:1;
  const expected='rgb('+base.slice(0,3).map((c,i)=>Math.round(tint[i]*a+c*(1-a))).join(', ')+')';
  const br=bar.getBoundingClientRect(),tr=el.getBoundingClientRect();
  return getComputedStyle(el).backgroundImage.includes(expected)&&tr.left>=br.left+1&&tr.right<=br.right-1;
 })).toBe(true);
 await expect.poll(async()=>{
  const aligned=await page.locator('#eventsOverlay .sy-body').evaluate(body=>{
   const title=body.querySelector('.ev-wk-sticky-title');
   const row=Array.from(title.closest('.ev-wk-mgrid').querySelectorAll('.ev-wk-day-bg')).find(el=>el.style.gridRow==='22');
   const t=title.getBoundingClientRect(),delta=row.getBoundingClientRect().top-(t.top+t.height/2);
   body.style.scrollBehavior='auto';
   if(Math.abs(delta)>.5){body.scrollTop+=delta;body.dispatchEvent(new Event('scroll'));return false;}
   return true;
  });
  return aligned?title.evaluate(el=>new Set(getComputedStyle(el).backgroundImage.match(/rgb\([^)]+\)/g)).size):0;
 }).toBe(2);
 await page.screenshot({path:'.local-preview/sticky-trip.png'});
 await page.locator('#evViewBodas').click();await page.locator('#bodaConfigBtn').click();
 const label=page.locator('.boda-cfg-card-controls label').first();await expect(label).toHaveCSS('color','rgb(107, 31, 32)');
});

test('bicolor seleccionado, casillas vacias y pestanas de cumpleanos',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
 await page.goto('/');await page.locator('#eventsBtn').click();
 for(const theme of ['light','dark']){
  await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
  await page.locator('#evViewTimeOff').click();
  await expect(page.locator('#evViewTimeOff')).toHaveCSS('background-image',/linear-gradient/);
  await page.screenshot({path:'.local-preview/bicolor-'+theme+'.png'});
  await page.locator('#evViewUpcoming').click();await page.locator('#evUpShowBoda').uncheck();
  const chk=page.locator('#evUpShowBoda');await expect(chk).toHaveCSS('border-top-color',await chk.evaluate(el=>getComputedStyle(el.parentElement).color));
  await page.screenshot({path:'.local-preview/checks-'+theme+'.png'});
 }
 await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));
 await page.locator('#eventsOverlay [data-nav="bday"]').click();
 const tabs=page.locator('.bday-hdr-sub .ev-view-toggle');
 for(let i=0;i<await tabs.count();i++){
  const tab=tabs.nth(i);const before=await tab.evaluate(el=>[getComputedStyle(el).color,getComputedStyle(el).borderTopColor]);await tab.click();
  expect(await tab.evaluate(el=>[getComputedStyle(el).color,getComputedStyle(el).borderTopColor])).toEqual(before);
 }
});

test('economia fiscal y escenarios: pestanas estables y columnas alineadas',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');await page.locator('#econBtn').click();
 async function check(selector){
  const tabs=page.locator(selector);
  for(let i=0;i<await tabs.count();i++){
   const tab=tabs.nth(i),before=await tab.evaluate(el=>[getComputedStyle(el).color,getComputedStyle(el).borderTopColor]);await tab.click();
   expect(await tab.evaluate(el=>[getComputedStyle(el).color,getComputedStyle(el).borderTopColor])).toEqual(before);
  }
 }
 await check('.econ-tab-btn');await page.evaluate(()=>openFiscal());await check('.fiscal-tab-btn');await page.evaluate(()=>closeFiscal());await expect(page.locator('#fiscalOverlay')).not.toBeVisible();
 await page.evaluate(()=>openEstudio());await check('.est-nav .est-btn');
 const groups=page.locator('.est-group');const a=await groups.nth(0).locator('button').first().boundingBox(),b=await groups.nth(0).locator('button').last().boundingBox(),c=await groups.nth(1).locator('button').first().boundingBox(),d=await groups.nth(1).locator('button').last().boundingBox();
 expect(Math.abs(a.y-c.y)).toBeLessThan(1);expect(Math.abs(b.y+b.height-d.y-d.height)).toBeLessThan(1);
 await page.screenshot({path:'.local-preview/scenarios-tabs.png'});
});

test('iconos alternativos: seleccion, navegacion, persistencia y backup',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 await expect(page.locator('#econBtn img')).toHaveCount(1);
 await page.locator('#menuBtn').click();await page.locator('#navIconStyle').click();await expect(page.locator('#navIconPickerOv')).toHaveClass(/open/);await page.screenshot({path:'.local-preview/icon-picker.png',animations:'disabled'});await page.locator('[data-icon-style="professional"]').click();await expect(page.locator('#navIconPickerOv')).toHaveClass(/open/);expect(await page.evaluate(()=>localStorage.getItem('excelia-nav-icons-v1'))).toBeNull();await page.locator('#navIconPickerClose').click();await expect(page.locator('#navIconPickerWrap')).toHaveCount(0);await expect(page.locator('.data-actions .nav-pro-icon')).toHaveCount(6);
 await page.locator('#menuBtn').click();await page.locator('#navIconStyle').click();
 await page.locator('[data-icon-style="original"]').click();
 expect(await page.evaluate(()=>localStorage.getItem('excelia-nav-icons-v1'))).toBe('professional');
 await page.screenshot({path:'.local-preview/icon-picker-preview.png',animations:'disabled'});
 await page.locator('#navIconPickerOv').click({position:{x:5,y:5}});
 await expect(page.locator('#navIconPickerWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('excelia-nav-icons-v1'))).toBe('original');
 await page.locator('#menuBtn').click();await page.locator('#navIconStyle').click();await page.locator('[data-icon-style="professional"]').click();await page.locator('#navIconPickerClose').click();
 await expect(page.locator('#navIconPickerWrap')).toHaveCount(0);
 const centers=await page.locator('.data-actions .nav-pro-icon').evaluateAll(icons=>icons.map(el=>{const r=el.getBoundingClientRect();return r.y+r.height/2;}));expect(Math.max(...centers)-Math.min(...centers)).toBeLessThan(1);

 const downloadPromise=page.waitForEvent('download');await page.locator('#menuBtn').click();await page.locator('#exportAllBtn').click();const download=await downloadPromise;
 const data=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));expect(data.navIconStyle).toBe('professional');
 await page.reload();await expect(page.locator('.data-actions .nav-pro-icon')).toHaveCount(6);
 for(const theme of ['light','dark']){
  await page.evaluate(t=>{applyTheme(t);render();},theme);await page.screenshot({path:'.local-preview/icons-'+theme+'.png'});
 }
 await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay .nav-pro-icon')).toHaveCount(6);
 await page.evaluate(()=>applyFullImport({navIconStyle:'original'},'merge'));await expect(page.locator('.nav-pro-icon')).toHaveCount(0);
 await page.evaluate(()=>applyFullImport({navIconStyle:'professional'},'merge'));await expect(page.locator('#eventsOverlay .nav-pro-icon')).toHaveCount(6);
});

test('seleccion de ventanas: mismo fondo para iconos originales y profesionales',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');await page.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
 for(const theme of ['light','dark']){
  await page.evaluate(t=>applyTheme(t),theme);
  for(const key of ['econ','estudio','home','events','bday','alarm']){
   const colors=await page.evaluate(key=>{
    const ids={econ:'econBtn',estudio:'estudioBtn',home:'homeBtn',events:'eventsBtn',bday:'bdayBtn',alarm:'alarmTestBtn'};
    const btn=document.getElementById(ids[key]);btn.classList.add('overlay-active');
    applyNavIconStyle('original');const original=getComputedStyle(btn).backgroundColor;
    applyNavIconStyle('professional');const professional=getComputedStyle(btn).backgroundColor;
    const iconColor=getComputedStyle(btn.querySelector('svg')).color,buttonColor=getComputedStyle(btn).color;
    btn.classList.remove('overlay-active');return {original,professional,iconColor,buttonColor};
   },key);
   expect(colors.original).toBe(colors.professional);expect(colors.iconColor).toBe(colors.buttonColor);
  }
 }
 await page.evaluate(()=>applyTheme('light'));await page.locator('#bdayBtn').click();
 await expect(page.locator('#bdayOverlay')).toHaveClass(/open/);await page.screenshot({path:'.local-preview/birthday-selected-professional.png'});
 await page.evaluate(()=>applyNavIconStyle('original'));await page.screenshot({path:'.local-preview/birthday-selected-original.png'});
});

test('navegacion: margen superior comparable a Home con ambos iconos',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 for(const style of ['original','professional']){
  await page.evaluate(s=>applyNavIconStyle(s),style);
  const homeTop=await page.locator('#homeBtn').evaluate(el=>el.getBoundingClientRect().top);
  await page.locator('#eventsBtn').click();await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await page.addStyleTag({content:'.full-overlay{transition:none!important}'});
  const top=await page.locator('#eventsOverlay [data-nav="events"]').evaluate(el=>el.getBoundingClientRect().top-el.closest('.full-overlay').getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(homeTop);expect(top-homeTop).toBeLessThanOrEqual(4);
  await page.screenshot({path:'.local-preview/nav-spacing-'+style+'.png',animations:'disabled'});
  await page.locator('#eventsOverlay [data-nav="home"]').click();await expect(page.locator('#eventsOverlay')).not.toBeVisible();
 }
});

test('home claro: semanas completadas con verde suave',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-09-11T10:00:00'));await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));await page.goto('/');
 await page.evaluate(()=>{applyTheme('light');SW['2026-08-31']=true;SW['2026-09-07']=true;render();});
 await expect(page.locator('.week-card.sent .week-total').first()).toHaveCSS('background-color','rgb(222, 236, 226)');
 await page.screenshot({path:'.local-preview/home-sent-light.png',animations:'disabled'});
});
