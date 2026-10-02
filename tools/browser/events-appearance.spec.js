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
});

test('grosores en vivo, sin cambiar huecos; persisten y se pueden restablecer',async({page})=>{
  const openCalendar=async()=>{
    await page.evaluate(()=>{
      EVENTS=[{id:'rehearsal-test',kind:'puntual',type:'Ensayos boda',title:'Ensayo prueba',start:'2026-10-08',end:'2026-10-08',color:'#c084fc',boda:{time:'19:00'}}];
      openEvents();
    });
    await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
    await page.locator('#evViewCal').click();
  };
  await openCalendar();await page.locator('#evSymbolLab summary').click();
  const marker=page.locator('.ev-month-wrap .ev-shape-x-boda'),before=await marker.boundingBox();
  await page.getByRole('slider',{name:'Borde negro',exact:true}).press('Home');
  await expect(marker.locator('path').first()).toHaveCSS('stroke-width','6px');
  await page.getByRole('slider',{name:'Grosor de las cruces',exact:true}).press('Home');
  await expect(marker.locator('path').first()).toHaveCSS('stroke-width','4px');
  const after=await marker.boundingBox();expect(after.width).toBe(before.width);expect(after.height).toBe(before.height);
  await page.getByRole('slider',{name:'Símbolos sin relleno',exact:true}).press('Home');
  await expect(page.locator('.ev-symbol-samples [title="Onda"] path').last()).toHaveCSS('stroke-width','1.5px');
  await page.reload();await openCalendar();await page.locator('#evSymbolLab summary').click();
  await expect(page.getByRole('slider',{name:'Borde negro',exact:true})).toHaveValue('0.5');
  await expect(marker.locator('path').first()).toHaveCSS('stroke-width','4px');
  await page.getByRole('button',{name:'Restablecer',exact:true}).click();
  await expect(marker.locator('path').first()).toHaveCSS('stroke-width','9px');
  await expect(page.locator('.ev-symbol-samples [title="Onda"] path').last()).toHaveCSS('stroke-width','3px');
  await page.getByRole('button',{name:'Ver calendario',exact:true}).click();await expect(page.locator('#evSymbolLab')).not.toHaveAttribute('open','');
});
