const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-02T10:00:00'));
  await page.addInitScript(()=>{
    sessionStorage.setItem('excelia-popup-dismissed','1');
    localStorage.setItem('excelia-theme-v1','light');
  });
  await page.goto('/');
});

test('añadir cumpleaños conserva el título centrado; distintivo VIP en la esquina',async({page})=>{
  await page.evaluate(()=>{
    BDAYS=[{name:'Ana de prueba',day:2,month:10,vip:true},{name:'Cumple normal',day:4,month:10}];
    BDAY_VIEW='upcoming';BDAY_MONTH=9;BDAY_YEAR=2026;openBday();
  });
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    for(const view of ['Próximos','Lista']){
      await page.locator('.bday-sub-tabs').getByRole('button',{name:view,exact:true}).click();
      await expect(page.locator('#bdAdd')).toHaveCount(1);
      const layout=await page.locator('#eventsContent .sy-header').evaluate(e=>{
        const header=e.getBoundingClientRect(),title=e.querySelector('.sy-year').getBoundingClientRect(),button=e.querySelector('#bdAdd').getBoundingClientRect();
        return {center:title.x+title.width/2-header.x-header.width/2,gap:title.left-button.right};
      });
      expect(Math.abs(layout.center)).toBeLessThan(1);expect(layout.gap).toBeGreaterThan(2);
      await page.getByRole('button',{name:'Añadir cumpleaños',exact:true}).click();
      await expect(page.locator('#bdFName')).toBeVisible();await page.locator('#bdFClose').click();
    }
  }
  await page.getByRole('button',{name:'Calendario',exact:true}).click();
  const badge=page.locator('.bday-badge-vip');await expect(badge).toHaveCSS('background-color','rgb(255, 223, 112)');
  const corner=await badge.evaluate(e=>{
    const card=e.getBoundingClientRect(),icon=e.querySelector('img').getBoundingClientRect();
    return {dx:icon.x+icon.width/2-card.right,dy:icon.y+icon.height/2-card.top,overflow:getComputedStyle(e).overflow};
  });
  expect(Math.abs(corner.dx)).toBeLessThan(1.1);expect(Math.abs(corner.dy)).toBeLessThan(1.1);expect(corner.overflow).toBe('visible');
  await page.getByRole('checkbox',{name:'Solo VIPs',exact:true}).check();await expect(page.locator('.bday-badge')).toHaveCount(1);
  const tick=await page.locator('#bdCalVip').evaluate(e=>{const s=getComputedStyle(e,'::after');return {left:s.left,top:s.top,width:s.width,height:s.height};});
  expect(tick).toEqual({left:'3px',top:'0px',width:'3px',height:'7px'});
});

test('ajustes sobre la ventana actual: cerrar, reabrir, cambiar iconos y navegar',async({page})=>{
  await page.getByRole('button',{name:'Eventos',exact:true}).click();
  await page.locator('#evViewRutinas').click();
  const menu=page.locator('#dataMenu'),trigger=page.locator('#eventsOverlay [data-nav="menu"]');
  await trigger.click();await expect(menu).toBeVisible();
  await expect(page.locator('#evViewRutinas')).toHaveClass(/active/);
  await trigger.click();await expect(menu).toBeHidden();
  await trigger.click();await page.locator('#navIconStyle').click();
  await expect(menu).toBeHidden();await expect(page.locator('#navIconPickerOv')).toHaveClass(/open/);
  await page.locator('#navIconPickerClose').click();await expect(page.locator('#navIconPickerWrap')).toHaveCount(0);
  await expect(page.locator('#evViewRutinas')).toHaveClass(/active/);
  await trigger.click();await page.locator('#evViewTimeOff').click(); // Fuera del menú: solo lo cierra.
  await expect(menu).toBeHidden();await expect(page.locator('#evViewRutinas')).toHaveClass(/active/);
  await page.locator('#eventsOverlay [data-nav="household"]').click();
  await expect(page.locator('#householdOverlay')).toHaveClass(/open/);
  await page.locator('#householdOverlay [data-nav="menu"]').click();await expect(menu).toBeVisible();
  const bounds=await menu.boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(10);expect(bounds.x+bounds.width).toBeLessThanOrEqual(400);
  await page.locator('#themeBtn').press('Escape');await expect(page.locator('#householdOverlay')).toHaveClass(/open/);
});

test('viajes en curso: atenuar solo días pasados y respetar la bombilla',async({page})=>{
  await page.evaluate(()=>{
    EVENTS=[{id:'ongoing',kind:'grande',type:'Viaje',title:'Viaje de prueba',start:'2026-09-29',end:'2026-10-05',color:'#38bdf8'}];
    EV_YEAR=2026;EV_MONTH=9;EV_VIEW='cal';openEventsAt();
  });
  const segment=page.locator('.ev-part-past[data-id="ongoing"]');
  await expect(segment).toHaveCount(1);await expect(segment).toHaveCSS('--ev-bar-past','25.0000%');
  await expect(page.locator('#eventsOverlay')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  expect(await segment.evaluate(e=>getComputedStyle(e).maskImage)).toContain('linear-gradient');
  const before=await segment.boundingBox();
  await page.locator('#evBright').click();await expect(segment).toHaveCSS('mask-image','none');
  const after=await segment.boundingBox();expect(after).toEqual(before);
  await page.locator('#evBright').click();expect(await segment.evaluate(e=>getComputedStyle(e).maskImage)).toContain('linear-gradient');
});

test('reabrir un formulario no hereda el cierre pendiente del anterior',async({page})=>{
  await page.clock.install();
  await page.evaluate(()=>{
    openEvents();
    openEvForm(null);
    closeEvForm();
    openEvForm({id:'second-form',kind:'puntual',type:'Otros',title:'Segundo evento',shape:'planet',color:'#fb923c',start:'2026-10-08',end:'2026-10-08'});
  });
  await page.clock.runFor(400);
  await expect(page.locator('#evFTitle')).toHaveValue('Segundo evento');
  await expect(page.locator('#evFWrap')).toHaveCount(1);
  expect(await page.evaluate(()=>EV_EDIT.id)).toBe('second-form');
});

test('ribete definitivo, sin selector y con contraste en oscuro',async({page})=>{
  await page.evaluate(()=>{
    setEventAppearance({border:2.5,cross:5,ink:3,halo:.6});
    EVENTS=[{id:'rehearsal-test',kind:'puntual',type:'Ensayos boda',title:'Ensayo prueba',start:'2026-10-08',end:'2026-10-08',color:'#c084fc',boda:{time:'19:00'}}];
    openEvents();
  });
  await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await page.locator('#evViewCal').click();
  await expect(page.locator('#evSymbolLab')).toHaveCount(0);
  const marker=page.locator('.ev-month-wrap .ev-shape-x-boda'),before=await marker.boundingBox();
  await expect(marker.locator('path').first()).toHaveCSS('stroke-width','7.6px');
  await expect(marker.locator('path').first()).toHaveCSS('stroke','rgb(0, 0, 0)');
  await page.locator('#eventsOverlay [data-nav="menu"]').click();
  await expect(page.locator('#dataMenu')).toBeVisible();
  await page.locator('#themeBtn').click(); // Gris.
  await page.locator('#themeBtn').click(); // Oscuro.
  await expect(marker.locator('path').first()).toHaveCSS('stroke','rgb(240, 240, 245)');
  await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await page.locator('#themeBtn').press('Escape');
  await expect(page.locator('#dataMenu')).toBeHidden();
  const after=await marker.boundingBox();expect(after.width).toBe(before.width);expect(after.height).toBe(before.height);
  await page.reload();
  expect(await page.evaluate(()=>EV_APPEARANCE.border)).toBe(1.3);
});
