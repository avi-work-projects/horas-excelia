const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
 await page.addInitScript(()=>sessionStorage.setItem('excelia-popup-dismissed','1'));
});

test('navegación compartida, agenda integrada y acceso al último detalle del hogar',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 expect(await page.locator('.data-actions button').evaluateAll(els=>els.slice(0,5).map(el=>el.id))).toEqual(['householdBtn','estudioBtn','homeBtn','eventsBtn','econBtn']);
 await page.locator('#householdBtn').click();
 await expect(page.locator('#fiscalOverlay')).toHaveClass(/open/);
 await expect(page.locator('[data-hipsub="elect"]')).toHaveClass(/active/);
 await page.locator('[data-hipsub="gas"]').click();
 await page.locator('#fiscalOverlay [data-nav="events"]').click();
 await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
 expect(await page.locator('.ev-main-tabs button').evaluateAll(els=>els.map(el=>el.id))).toEqual(['evViewTimeOff','evViewQuad','evViewAnnual','evViewBodas','evViewBday','evViewUpcoming','evViewCal','evViewRutinas']);
 await page.locator('#evViewUpcoming').click();await page.locator('#evSubAgenda').click();
 await expect(page.locator('#evSubAgenda')).toHaveClass(/active/);
 await expect(page.locator('.ev-wk-month-sep').first()).toBeVisible();
 await page.locator('#evViewBday').click();await page.locator('#bdViewList').click();
 await expect(page.locator('#bdAdd')).toBeVisible();
 await page.locator('#bdAdd').click();await expect(page.locator('#bdFName')).toBeVisible();await page.locator('#bdFClose').click();
 await page.locator('#eventsOverlay [data-nav="household"]').click();
 await expect(page.locator('[data-hipsub="gas"]')).toHaveClass(/active/);
 await page.reload();await page.locator('#householdBtn').click();
 await expect(page.locator('[data-hipsub="gas"]')).toHaveClass(/active/);
 await page.locator('#fiscalOverlay [data-nav="econ"]').click();await expect(page.locator('#econOverlay')).toHaveClass(/open/);
 await page.locator('#econOverlay [data-nav="estudio"]').click();await expect(page.locator('#estudioOverlay')).toHaveClass(/open/);
 await page.locator('#estudioOverlay [data-nav="home"]').click();await expect(page.locator('.full-overlay.open')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('histórico mensual: borrar, recuperar con Deshacer y conservar recuperaciones como extra',async({page})=>{
 await page.addInitScript(()=>{
  if(!localStorage.getItem('excelia-rutinas-v1'))localStorage.setItem('excelia-rutinas-v1',JSON.stringify([{id:'delete-qa',name:'Actividad de prueba',icon:'gym',start:'2026-01-01',weekDays:[1,4],time:'19:00',dur:60,color:'#38bdf8',weeks:{},skips:{'2026-09-24':1},extraSessions:[{id:'extra-recovery-qa',date:'2026-10-03',time:'10:00',dur:60,skip:false,recoveryOf:'2026-09-24'}]}]));
 });
 await page.goto('/');await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
 await page.locator('.rut-edit').click();await page.locator('#rutFHistory').click();
 await expect(page.locator('#rutHistoryToday')).toBeVisible();
 await expect.poll(()=>page.locator('.rut-history-body').evaluate(el=>{
  const row=el.querySelector('[data-history-week="2026-09-28"]'),body=el.getBoundingClientRect(),r=row.getBoundingClientRect();return r.top>=body.top+30&&r.bottom<body.bottom;
 })).toBe(true);
 await page.locator('[data-history-edit="2026-09-24"]').click();await page.locator('#rutHistoryDelete').click();
 await expect(page.locator('#rutDeleteOv')).toContainText('La recuperación se conservará como clase extra');
 await page.locator('#rutDeleteCancel').click();await expect(page.locator('#rutDeleteWrap')).toHaveCount(0);
 expect(await page.evaluate(()=>rutSessionsOn(RUTINAS[0],'2026-09-24').length)).toBe(1);
 await page.locator('#rutHistoryDelete').click();await page.locator('#rutDeleteConfirm').click();
 await expect(page.locator('[data-history-edit="2026-09-24"]')).toHaveCount(0);
 await expect(page.locator('[data-history-date="2026-10-03"]')).toContainText('(Extra)');
 await page.getByRole('button',{name:'Deshacer',exact:true}).click();
 await expect(page.locator('[data-history-edit="2026-09-24"]')).toHaveCount(1);
 await expect(page.locator('[data-history-date="2026-10-03"]')).toContainText('(Recuperada de');
 await page.locator('[data-history-edit="2026-09-24"]').click();await page.locator('#rutHistoryDelete').click();await page.locator('#rutDeleteConfirm').click();
 await expect(page.locator('[data-history-edit="2026-09-24"]')).toHaveCount(0);
 await page.reload();expect(await page.evaluate(()=>[rutSessionsOn(RUTINAS[0],'2026-09-24').length,RUTINAS[0].extraSessions[0].recoveryOf])).toEqual([0,null]);
});

test('color de gimnasio, detalle del hogar e iconos viajan en la copia de seguridad',async({page})=>{
 await page.goto('/');await page.locator('#householdBtn').click();await page.locator('[data-hipsub="resumen"]').click();
 await page.locator('#fiscalOverlay [data-nav="events"]').click();await page.locator('#evViewRutinas').click();
 await expect(page.locator('.rut-appearance')).toHaveCount(0);
 expect(await page.evaluate(()=>rutDisplayColor({icon:'gym',color:'#fb923c'}))).toBe('#38bdf8');
 await page.locator('#eventsOverlay [data-nav="home"]').click();await page.locator('#menuBtn').click();await page.locator('#navIconStyle').click();
 await page.locator('[data-icon-style="professional"]').click();await page.locator('#navIconPickerClose').click();
 await expect(page.locator('#householdBtn .nav-pro-household')).toBeVisible();
 await expect(page.locator('.nav-pro-bday')).toHaveCount(0);
 await page.locator('#menuBtn').click();const pending=page.waitForEvent('download');await page.locator('#exportAllBtn').click();const file=await pending;
 const data=JSON.parse(require('fs').readFileSync(await file.path(),'utf8'));
 expect(data.routineAppearance).toEqual({gymColor:'#38bdf8'});expect(data.householdTab).toBe('resumen');
 await page.evaluate(d=>{setRutGymColor('#123456');setHouseholdTab('elect');applyFullImport(d,'replace');},data);
 await page.reload();await page.locator('#householdBtn').click();await expect(page.locator('[data-hipsub="resumen"]')).toHaveClass(/active/);
 expect(await page.evaluate(()=>RUT_GYM_COLOR)).toBe('#38bdf8');
});
