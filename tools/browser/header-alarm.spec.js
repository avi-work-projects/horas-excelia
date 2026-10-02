const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    localStorage.setItem('excelia-theme-v1','light');
  });
  await page.goto('/');
});

test('la campana conserva la ventana, su contenido y el scroll',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const panel=page.locator('#alarmPanel');
  await page.clock.install();
  await page.locator('#eventsBtn').click();
  await page.locator('#evSubAgenda').click();
  // Dejar terminar el posicionamiento inicial de Agenda antes de fijar el scroll de prueba.
  await page.clock.runFor(700);
  for(const key of ['events','econ','estudio','household']){
    if(key!=='events')await page.locator('.full-overlay.open [data-nav="'+key+'"]').click();
    const overlay=page.locator('.full-overlay.open');
    await expect(overlay).toHaveCount(1);
    const id=await overlay.getAttribute('id');
    await page.locator('#'+id+' .sy-body').evaluate(el=>{el.scrollTop=200;window.qaAlarmBody=el;window.qaAlarmScroll=el.scrollTop;window.qaAlarmBack=NAV_BACK;});
    const trigger=overlay.locator('[data-nav="alarm"]');
    await trigger.click();await expect(panel).toBeVisible();
    await expect(page.locator('#'+id)).toHaveClass(/open/);
    await expect(trigger).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('#alarmDaysBtns button')).toHaveCount(7);
    await expect(page.locator('#drumHour .drum-selected')).toHaveText('09');
    await expect(page.locator('#drumMin .drum-selected')).toHaveText('20');
    const box=await panel.boundingBox(),anchor=await trigger.boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(anchor.y+anchor.height);
    expect(box.x).toBeGreaterThanOrEqual(10);expect(box.x+box.width).toBeLessThanOrEqual(400);
    expect(await panel.evaluate(el=>{
      const r=el.getBoundingClientRect();
      return el.parentElement===document.body&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+20));
    })).toBe(true);
    await page.locator('#alarmMsg').fill('Alarma de prueba');
    await trigger.click();await expect(panel).toBeHidden();
    await trigger.click();await expect(page.locator('#alarmMsg')).toHaveValue('Alarma de prueba');
    await page.locator('#alarmMsg').press('Escape');await expect(panel).toBeHidden();
    expect(await page.evaluate(()=>({connected:qaAlarmBody.isConnected,scroll:qaAlarmBody.scrollTop-qaAlarmScroll,back:NAV_BACK===qaAlarmBack})),key).toEqual({connected:true,scroll:0,back:true});
  }
  await page.locator('.full-overlay.open [data-nav="home"]').click();
  await expect(page.locator('.full-overlay.open')).toHaveCount(0);
  await page.locator('#alarmTestBtn').click();await expect(panel).toBeVisible();
  await page.locator('#alarmTestBtn').click();await expect(panel).toBeHidden();
  expect(errors).toEqual([]);
});

test('campana y ajustes se sustituyen; cerrar no activa el control de detrás',async({page})=>{
  await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
  const bell=page.locator('#eventsOverlay [data-nav="alarm"]'),menu=page.locator('#eventsOverlay [data-nav="menu"]');
  await page.evaluate(()=>window.qaAlarmBack=NAV_BACK);
  await menu.click();await bell.click();
  await expect(page.locator('#dataMenu')).toBeHidden();await expect(page.locator('#alarmPanel')).toBeVisible();
  await menu.click();await expect(page.locator('#alarmPanel')).toBeHidden();await expect(page.locator('#dataMenu')).toBeVisible();
  await bell.click();await page.locator('#evBack').click();
  await expect(page.locator('#alarmPanel')).toBeHidden();await expect(page.locator('#evViewRutinas')).toHaveClass(/active/);
  expect(await page.evaluate(()=>NAV_BACK===qaAlarmBack)).toBe(true);
});

test('crear una alarma no cierra Eventos (envío simulado)',async({page})=>{
  const requests=[];
  await page.route('https://example.invalid/qa393/**',async route=>{requests.push(route.request().url());await route.fulfill({status:200,body:'ok'});});
  await page.evaluate(()=>appStorage.setItem('excelia-alarm-url','https://example.invalid/qa393'));
  await page.locator('#eventsBtn').click();await page.locator('#evViewRutinas').click();
  await page.locator('#eventsOverlay [data-nav="alarm"]').click();
  await expect(page.locator('#drumMin .drum-selected')).toHaveText('20');
  await page.locator('#alarmMsg').fill('Solo prueba local');
  await page.locator('#alarmCreateBtn').click();
  await expect(page.locator('#alarmPanel')).toBeHidden();
  await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);await expect(page.locator('#evViewRutinas')).toHaveClass(/active/);
  await expect.poll(()=>requests.length).toBe(1);
  expect(new URL(requests[0]).searchParams.get('alarmMsg')).toBe('Solo prueba local');
});
