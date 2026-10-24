const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});

test('recordatorios agrupados: pendientes primero, símbolos propios y alarmas persistidas',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));
  await page.addInitScript(()=>{
    localStorage.setItem('excelia-tasks-v1',JSON.stringify({items:['Tarea completada','Comprar pintura','Revisar recibos','Reservar cita','Tarea adicional'].map((title,i)=>({id:'task'+i,title,createdAt:1,updatedAt:1,completedAt:i===0?2:null,deletedAt:null})),weeklyReminder:false,reminderWeek:''}));
    localStorage.setItem('excelia-horas-v3',JSON.stringify({sent:{'2026-10-05':true,'2026-10-12':true,'2026-11-02':true,'2026-11-09':true}}));
    localStorage.setItem('excelia-bdays-v1',JSON.stringify([{name:'Ana',day:24,month:10},{name:'Luis',day:25,month:10,vip:true}]));
    localStorage.setItem('excelia-events-v1',JSON.stringify([
      {id:'dinner',kind:'puntual',type:'Cena',color:'#6574c4',title:'Cena con amigos',start:'2026-10-24',time:'21:00',note:'Reservar mesa <interior>'},
      {id:'lunch',kind:'puntual',type:'Comida',color:'#e99a31',title:'Comida familiar',start:'2026-10-24',time:'14:00'},
      {id:'tomorrow',kind:'puntual',type:'Otros',title:'Preparar la semana',start:'2026-10-25'},
      {id:'trip',kind:'grande',type:'Viaje',title:'Fin de semana en la montaña',start:'2026-10-23',end:'2026-10-25',viaje:{vuelta:{time:'18:00',modo:'coche'}},dayNotes:{'2026-10-24':'Paseo por el bosque','2026-10-25':'Recoger las llaves'}}
    ]));
    localStorage.setItem('excelia-ev-alarm-v1',JSON.stringify({dinner:true,trip:true}));
  });
  await page.goto('/');await page.evaluate(()=>applyTheme('light'));
  const popup=page.locator('#homePopup');await expect(popup).toBeVisible();
  await expect(page.locator('#homePopupContent>:first-child')).toHaveClass(/home-reminder-pending/);
  await expect(page.locator('.home-reminder-group>h3')).toHaveText(['CumpleañosPróximos 7 días','Planes de varios días','Hoy2 eventos','Mañana1 evento']);
  await expect(page.locator('.home-birthday-line>.bday-symbol')).toHaveCount(1);
  await expect(page.locator('.home-reminder-vip')).toBeVisible();
  await expect(page.locator('[data-reminder-id=dinner] .home-reminder-alarm')).toHaveText('⏰');
  await expect(page.locator('[data-reminder-id=lunch] .home-reminder-alarm')).toHaveCount(0);
  await expect(page.locator('[data-reminder-id=trip]')).toHaveCount(1);
  await expect(page.locator('[data-reminder-id=trip]')).toContainText('Mañana · Vuelta 18:00');
  await expect(page.locator('[aria-label=Hoy] .home-reminder-content')).toHaveText(['Comida familiar','Cena con amigos']);
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
  }
  expect(errors).toEqual([]);
});
