const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.goto('/');
});

test('Ajustes: la rueda alterna Editar/Eliminar entre suave y relleno, se guarda y viaja en el backup',async({page})=>{
  await expect(page.locator('html')).toHaveAttribute('data-action-style','soft');
  await page.locator('#menuBtn').click();
  const box=page.locator('#settingsActionStyle');await expect(box).toBeHidden();
  await page.locator('#settingsActionStyleBtn').click();await expect(box).toBeVisible();
  await box.locator('[data-action-style-opt="filled"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-action-style','filled');
  await expect(box.locator('[data-action-style-opt="filled"]')).toHaveAttribute('aria-checked','true');
  expect(await page.evaluate(()=>appStorage.getItem('excelia-action-style-v1'))).toBe('filled');
  await page.reload();await expect(page.locator('html')).toHaveAttribute('data-action-style','filled');
});

test('Elige tu Plan: Cumpleaños excluye a Romántico, pinta la tarta salvo en Cumple y se guarda',async({page})=>{
  await page.locator('#eventsBtn').click();await page.evaluate(()=>openEvForm(null));
  await page.locator('[data-picker="plans"]').click();
  const picker=page.locator('#evPlanPickerOv');
  await picker.locator('#evPlanRomantic').check();
  await picker.locator('#evPlanBirthday').check();
  await expect(picker.locator('#evPlanRomantic')).not.toBeChecked();
  await expect(picker.locator('.ev-romantic-badge')).toHaveCount(0);
  await expect(picker.locator('[data-type="Cena"] .ev-birthday-badge')).toHaveCount(1);
  await expect(picker.locator('[data-type="Cumpleaños"] .ev-birthday-badge')).toHaveCount(0);
  await picker.locator('[data-type="Cena"]').click();await picker.locator('#evPlanConfirm').click();
  await expect(page.locator('#evFBirthday')).toBeChecked();await expect(page.locator('#evFRomantic')).not.toBeChecked();
  await page.locator('#evFTitle').fill('Cena de cumpleaños');
  await page.locator('#evFSave').click();await expect(page.locator('#evFWrap')).toHaveCount(0);
  const ev=await page.evaluate(()=>EVENTS.find(e=>e.title==='Cena de cumpleaños'));
  expect(ev.birthday).toBe(true);expect(ev.romantic).toBeUndefined();
  expect(await page.evaluate(id=>evMarkerHtml(EVENTS.find(e=>e.id===id)).includes('ev-birthday-badge'),ev.id)).toBe(true);
  // Volver a editarlo conserva la casilla marcada.
  await page.evaluate(id=>openEvForm(EVENTS.find(e=>e.id===id)),ev.id);
  await expect(page.locator('#evFBirthday')).toBeChecked();
});

test('Calendario de Wedding Moves: las parejas quedan justo bajo la última semana',async({page})=>{
  await page.evaluate(()=>{
    BODA_COUPLES=[{id:'a',name:'Ana y Carlos',weddingDate:'2026-11-17',contracted:5,color:'#f08a30'}];
    EVENTS=[{id:'c1',kind:'puntual',type:'Ensayos boda',title:'Ensayo',start:'2026-11-07',end:'2026-11-07',boda:{coupleId:'a',time:'21:00',place:'sala',duration:60}}];
    saveBodas();saveEvents();EV_VIEW='bodas';BODA_SUBTAB='calendario';BODA_CAL_YEAR=2026;BODA_CAL_MONTH=9;openEventsAt();
  });
  await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  for(const month of [9,10]){
    await page.evaluate(m=>{BODA_CAL_MONTH=m;bodaCalRefresh();},month);
    const gap=await page.evaluate(()=>document.querySelector('.boda-cal-legend').getBoundingClientRect().top-document.querySelector('#bodaCalGrid').getBoundingClientRect().bottom);
    expect(gap).toBeLessThan(16);
  }
  // El alto total no cambia entre un mes de cinco semanas y uno de seis.
  const heights=[];
  for(const month of [9,10]){await page.evaluate(m=>{BODA_CAL_MONTH=m;bodaCalRefresh();},month);heights.push(await page.locator('#bodaCalBody').evaluate(e=>Math.round(e.getBoundingClientRect().height)));}
  expect(Math.abs(heights[0]-heights[1])).toBeLessThanOrEqual(2);
});

test('Nuevo evento: los accesos rápidos de cada grupo no lanzan errores (regresión v576)',async({page})=>{
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.locator('#eventsBtn').click();await page.evaluate(()=>openEvForm(null));
  for(const t of ['Llamada','Cita','Peluquería','Comida','Tomar algo','Cena'])await page.locator('#evFTypePicker [data-type="'+t+'"]').first().click();
  expect(errs).toEqual([]);
});
