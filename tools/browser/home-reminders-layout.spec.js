const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});

test('recordatorios agrupados: pendientes primero, símbolos propios y alarmas persistidas',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));
  await page.addInitScript(()=>{
    localStorage.setItem('excelia-tasks-v1',JSON.stringify({items:[{id:'paint',title:'Comprar pintura',createdAt:1,updatedAt:1,completedAt:null,deletedAt:null}],weeklyReminder:false,reminderWeek:''}));
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
  await page.locator('.home-reminder-pending>summary').click();
  await expect(page.locator('#homeTasksOpen')).toBeVisible();
  expect(await page.locator('.home-popup').boundingBox()).toEqual(before);
  await page.locator('.home-reminder-pending>summary').click();
  const trip=page.locator('[data-reminder-id=trip]');await trip.locator('summary').click();
  await expect(trip.locator('.home-reminder-description')).toHaveText(['Paseo por el bosque','Recoger las llaves']);
  await trip.locator('summary').click();
  await page.screenshot({path:'test-results/recordatorios-claro.png'});
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    expect(await page.locator('#homePopupContent').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await expect(page.locator('#homePopupClose')).toBeInViewport();
  }
  expect(errors).toEqual([]);
});
