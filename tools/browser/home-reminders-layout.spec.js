const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});

test('cumpleaños: hoy y mañana siempre visibles, recientes y panel estable en móvil y escritorio',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2027-01-02T12:00:00+01:00'));
  await page.addInitScript(()=>{
    localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');
    localStorage.setItem('excelia-bdays-v1',JSON.stringify([
      {name:'Ana',day:2,month:1},{name:'Luis',day:2,month:1,vip:true},{name:'Marina del Valle',day:3,month:1},
      {name:'Lucía',day:1,month:1},{name:'Pablo',day:31,month:12},{name:'Sara',day:29,month:12},
      {name:'Próximo de ejemplo',day:9,month:1},{name:'Demasiado antiguo',day:28,month:12},{name:'Fuera de plazo',day:10,month:1}
    ]));
  });
  await page.goto('/');await page.evaluate(()=>applyTheme('light'));
  const section=page.locator('.home-reminder-birthdays'),popup=page.locator('.home-popup');
  await expect(section.locator('.home-birthday-today')).toHaveCount(2);
  await expect(section.locator('.home-birthday-tomorrow')).toBeVisible();
  await expect(section.locator('.home-birthday-past .home-reminder-when')).toHaveText(['Ayer','Antes de ayer','Hace 4\u202fdías']);
  await expect(section.locator('.home-birthday-past .home-reminder-content').first()).toHaveText('1 de Enero');
  expect((await section.locator('.home-birthday-past').allTextContents()).join(' ')).not.toContain('Sin alarma');
  await expect(section).not.toContainText('Demasiado antiguo');await expect(section).not.toContainText('Fuera de plazo');
  await expect(page.locator('#homeBirthdayToggle')).toContainText('Ver 1 cumpleaños más');
  const stored=await page.evaluate(()=>localStorage.getItem('excelia-bdays-v1'));
  for(const width of [400,320,440,1280]){
    await page.setViewportSize({width,height:880});
    await page.locator('#homePopupContent').evaluate(el=>el.scrollTop=0);
    const before=await popup.boundingBox();
    for(const row of await section.locator('.home-birthday-today,.home-birthday-tomorrow').all())await expect(row).toBeVisible();
    expect(await section.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    const badge=await section.locator('.home-birthday-today .home-reminder-when').first().evaluate(el=>({weight:getComputedStyle(el).fontWeight,bg:getComputedStyle(el).backgroundColor}));
    expect(+badge.weight).toBeGreaterThanOrEqual(700);expect(badge.bg).not.toBe('rgba(0, 0, 0, 0)');
    await page.locator('#homeBirthdayToggle').click();await expect(page.locator('#homeBirthdayExtra')).toBeVisible();
    expect(await popup.boundingBox()).toEqual(before);
    await page.locator('#homeBirthdayToggle').click();await expect(page.locator('#homeBirthdayExtra')).toBeHidden();
    await page.locator('#homePopupContent').evaluate(el=>el.scrollTop=0);
    await expect(page.locator('#homePopupClose')).toBeInViewport();
    await page.screenshot({path:'test-results/cumpleanos-recordatorios-'+width+'.png'});
  }
  expect(await page.evaluate(()=>localStorage.getItem('excelia-bdays-v1'))).toBe(stored);
  // Una fecha reciente abre su persona y su año correctos; cancelar conserva los datos.
  await section.locator('[data-reminder-birthday="4"]').press('F2');
  await expect(page.locator('#bdFName')).toHaveValue('Pablo');
  expect(await page.evaluate(()=>EV_YEAR)).toBe(2026);
  await page.locator('#bdFClose').click();
  expect(await page.evaluate(()=>localStorage.getItem('excelia-bdays-v1'))).toBe(stored);
  await page.evaluate(()=>{BDAYS=BDAYS.filter(b=>b.name==='Sara');openHomePopup(true);});
  await expect(section.locator('.home-birthday-recent-heading')).toBeVisible();
  await expect(section.locator('h3')).toHaveText('Cumpleaños');
  await expect(section.locator('.home-birthday-past')).toContainText('Hace 4\u202fdías');
  expect(errors).toEqual([]);
});

test('recordatorios agrupados: pendientes primero, símbolos propios y alarmas persistidas',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));
  await page.addInitScript(()=>{
    localStorage.setItem('excelia-nav-icons-v1','professional');
    localStorage.setItem('excelia-tasks-v1',JSON.stringify({items:['Tarea completada','Comprar pintura','Revisar recibos','Reservar cita','Tarea adicional'].map((title,i)=>({id:'task'+i,title,createdAt:1,updatedAt:1,completedAt:i===0?2:null,deletedAt:null})),weeklyReminder:false,reminderWeek:''}));
    localStorage.setItem('excelia-horas-v3',JSON.stringify({sent:{'2026-10-05':true,'2026-10-12':true,'2026-11-02':true,'2026-11-09':true}}));
    localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Ana',day:24,month:10},{name:'Luis',day:25,month:10,vip:true}]));
    localStorage.setItem('excelia-events-v1',JSON.stringify([
      {id:'dinner',kind:'puntual',type:'Cena',color:'#6574c4',title:'Cena con amigos',start:'2026-10-24',time:'21:00',note:'Reservar mesa <interior>'},
      {id:'lunch',kind:'puntual',type:'Comida',color:'#e99a31',title:'Comida familiar',start:'2026-10-24',time:'14:00',note:' \n '},
      {id:'tomorrow',kind:'puntual',type:'Otros',title:'Preparar la semana',start:'2026-10-25'},
      {id:'trip',kind:'grande',type:'Viaje',title:'Fin de semana en la montaña',start:'2026-10-23',end:'2026-10-25',viaje:{vuelta:{time:'18:00',modo:'coche'}},dayNotes:{'2026-10-24':'Paseo por el bosque','2026-10-25':'Recoger las llaves'}}
    ]));
    localStorage.setItem('excelia-ev-alarm-v1',JSON.stringify({dinner:true,trip:true}));
  });
  await page.goto('/');await page.evaluate(()=>applyTheme('light'));
  const popup=page.locator('#homePopup');await expect(popup).toBeVisible();
  await expect(page.locator('#homePopupContent>:first-child')).toHaveClass(/home-reminder-pending/);
  await expect(page.locator('.home-reminder-group>h3')).toHaveText(['CumpleañosPróximos 7 días','Planes en curso y próximos','Hoy2 eventos','Mañana1 evento']);
  await expect(page.locator('.home-birthday-line>.bday-symbol')).toHaveCount(1);
  await expect(page.locator('.home-reminder-vip')).toBeVisible();
  await expect(page.locator('[data-reminder-id=dinner] .home-reminder-alarm')).toHaveText('⏰');
  await expect(page.locator('[data-reminder-id=lunch] .home-reminder-alarm')).toHaveCount(0);
  await expect(page.locator('[data-reminder-id=trip]')).toHaveCount(1);
  await expect(page.locator('[data-reminder-id=trip]')).toContainText('Mañana · Vuelta 18:00');
  await expect(page.locator('[aria-label=Hoy] .home-reminder-content')).toHaveText(['Comida familiar','Cena con amigos']);
  for(const id of ['lunch','tomorrow']){
    const card=page.locator('[data-reminder-id='+id+']');
    await expect(card.locator('summary,.home-reminder-toggle,.home-reminder-expanded')).toHaveCount(0);
    await card.click();await expect(card).not.toHaveAttribute('open');
  }
  const dinner=page.locator('[data-reminder-id=dinner]');
  await expect(dinner.locator('.home-reminder-toggle')).toBeVisible();
  await dinner.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(dinner.locator('.home-reminder-description')).toBeVisible();
  await expect(dinner.locator('.home-reminder-expanded')).toHaveText('Reservar mesa <interior>');
  await page.keyboard.press('Enter');await expect(dinner).not.toHaveAttribute('open');
  const birthdayColor=await page.locator('.home-reminder-birthdays>.home-reminder-rows').evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(birthdayColor).not.toBe(await page.locator('.home-popup').evaluate(el=>getComputedStyle(el).backgroundColor));
  const before=await page.locator('.home-popup').boundingBox();
  await expect(page.locator('.home-pending-tasks li')).toHaveText(['Comprar pintura','Revisar recibos','Reservar cita']);
  await expect(page.locator('#homeTasksOpen')).toBeVisible();
  await expect(page.locator('.home-pending-warnings')).toContainText('Semana del 19/10');
  await expect(page.locator('.home-pending-warnings')).toContainText('Semana del 26/10');
  await expect(page.locator('.home-pending-warnings')).toBeVisible();
  await expect(page.locator('.home-reminder-pending summary')).toHaveCount(0);
  const trip=page.locator('[data-reminder-id=trip]');await trip.locator('summary').click();
  await expect(trip.locator('.home-reminder-description')).toHaveText(['Paseo por el bosque','Recoger las llaves']);
  expect(await page.locator('.home-popup').boundingBox()).toEqual(before);
  await trip.locator('summary').click();
  await page.evaluate(()=>{
    EVENTS.push({id:'empty-trip',kind:'grande',type:'Otros',color:'#ef6464',title:'Visita sin notas',start:'2026-10-24',end:'2026-10-25'});
    openHomePopup(true);
  });
  const emptyTrip=page.locator('[data-reminder-id=empty-trip]');
  await expect(emptyTrip).toHaveCount(1);
  await expect(emptyTrip.locator('summary,.home-reminder-toggle,.home-reminder-expanded')).toHaveCount(0);
  await emptyTrip.click();await expect(emptyTrip).not.toHaveAttribute('open');
  const planColors=await page.locator('.home-reminder-plans .home-popup-item').evaluateAll(es=>es.map(el=>getComputedStyle(el).borderLeftColor));
  expect(planColors[0]).toBe(planColors[1]);
  await page.evaluate(()=>{EVENTS=EVENTS.filter(ev=>ev.id!=='empty-trip');openHomePopup(true);});
  await page.locator('#homePopupContent').evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:'test-results/recordatorios-claro.png'});
  const tones=await page.locator('.home-reminder-day>.home-reminder-rows').evaluateAll(es=>es.map(el=>getComputedStyle(el).backgroundColor));
  expect(tones[0]).not.toBe(tones[1]);
  const rows=await page.locator('[aria-label=Hoy] .home-popup-item').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,bg:getComputedStyle(el).backgroundColor};}));
  expect(rows[0].bg).toBe(rows[1].bg);expect(rows[1].top-rows[0].bottom).toBeLessThan(1);
  await page.evaluate(()=>{EVENTS.find(ev=>ev.id==='dinner').title='Celebración de cumpleaños con toda la familia y los amigos que vienen de fuera para pasar juntos el fin de semana';openHomePopup(true);});
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    expect(await page.locator('#homePopupContent').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await expect(page.locator('#homePopupClose')).toBeInViewport();
    const title=await page.locator('[data-reminder-id=dinner] .home-reminder-content').evaluate(el=>({height:el.clientHeight,line:parseFloat(getComputedStyle(el).lineHeight),scroll:el.scrollHeight,whiteSpace:getComputedStyle(el).whiteSpace}));
    expect(title.height).toBeGreaterThan(title.line*2);expect(title.scroll).toBeLessThanOrEqual(title.height);expect(title.whiteSpace).toBe('normal');
    await page.screenshot({path:'test-results/recordatorios-texto-largo-'+width+'.png'});
  }
  expect(errors).toEqual([]);
});
