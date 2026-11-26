const {test,expect}=require('@playwright/test');
/* Botón Atrás del móvil (v576): page.goBack() produce el mismo popstate que el
   gesto o el botón Atrás de Android. Cada paso cierra solo la capa de arriba. */
test.use({timezoneId:'Europe/Madrid'});
const SHOTS=process.env.BACK_SHOTS||'';
async function shot(page,name){if(SHOTS)await page.screenshot({path:SHOTS+'/'+name+'.png'});}
async function back(page){await page.goBack({waitUntil:'commit'}).catch(()=>{});await page.waitForTimeout(450);}
test.beforeEach(async({page})=>{
  await page.setViewportSize({width:400,height:880});
  await page.clock.setFixedTime(new Date('2026-11-26T12:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.goto('/');await page.waitForTimeout(400);
});
const open=page=>page.locator('.full-overlay.open');

test('Eventos y sus paneles: Atrás cierra de arriba abajo y vuelve a Inicio',async({page})=>{
  await page.locator('#eventsBtn').click();await page.waitForTimeout(500);
  await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await page.evaluate(()=>openEvForm(null));await page.waitForTimeout(500);
  await page.locator('[data-picker="plans"]').click();await page.waitForTimeout(500);
  await expect(page.locator('#evPlanPickerOv')).toHaveClass(/open/);await shot(page,'1-picker');
  await back(page);await expect(page.locator('#evPlanPickerWrap')).toHaveCount(0);await expect(page.locator('#evFormOv')).toHaveClass(/open/);await shot(page,'2-form');
  await back(page);await expect(page.locator('#evFWrap')).toHaveCount(0);await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);await shot(page,'3-events');
  await back(page);await expect(open(page)).toHaveCount(0);await shot(page,'4-home');
  // En Inicio sin nada abierto, Atrás sale de la app (la página deja de ser Gestify).
  await back(page);
  expect(page.url()).not.toContain('127.0.0.1:8765/');
});

test('Wedding Moves: Editar pareja, día del calendario y ficha de clase',async({page})=>{
  await page.evaluate(()=>{BODA_COUPLES=[{id:'a',name:'Ana y Carlos',weddingDate:'2026-12-12',contracted:4,color:'#f08a30'}];EVENTS=[{id:'c1',kind:'puntual',type:'Ensayos boda',title:'Ensayo',start:'2026-11-28',end:'2026-11-28',boda:{coupleId:'a',time:'18:00',place:'sala',duration:60}}];saveBodas();saveEvents();EV_VIEW='bodas';BODA_SUBTAB='clases';openEventsAt();});
  await page.waitForTimeout(600);
  await page.evaluate(()=>openBodaCoupleForm(BODA_COUPLES[0]));await page.waitForTimeout(600);await shot(page,'5-pareja');
  await back(page);await expect(page.locator('#bodaCFormOv')).toHaveCount(0);await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await page.evaluate(()=>openBodaClaseForm(EVENTS[0]));await page.waitForTimeout(600);
  await page.locator('[data-fcampo="hora"]').click();await page.waitForTimeout(600);await shot(page,'6-hora');
  await back(page);await expect(page.locator('#bodaFormOv')).toHaveClass(/open/);await shot(page,'7-clase');
  await back(page);await expect(page.locator('#bodaFormOv')).toHaveCount(0);await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
  await back(page);await expect(open(page)).toHaveCount(0);
});

test('Rutinas: desde Cambiar horario, Atrás vuelve al selector de semana como la flecha',async({page})=>{
  await page.evaluate(()=>{RUTINAS=[{id:'rp',name:'Pádel',icon:'padel',color:'#34d399',weekDays:[2,4],time:'19:00',dur:60,start:'2026-01-01'}];saveRutinas();EV_VIEW='rutinas';openEventsAt();openRutWeek(RUTINAS[0]);});
  await page.waitForTimeout(700);
  await page.locator('.rut-wpick-real .ev-week-outer').nth(2).click();await page.waitForTimeout(700);
  await expect(page.locator('.rut-week-sheet')).toBeVisible();await shot(page,'8-semana');
  await back(page);await expect(page.locator('.rut-wpick-real')).toBeVisible();await shot(page,'9-selector');
  await back(page);await expect(page.locator('#rutWkWrap')).toHaveCount(0);await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
});

test('Inicio: menú ⋯, hoja del día, Recordatorios y semana en duda',async({page})=>{
  await page.locator('#menuBtn').click();await expect(page.locator('#dataMenu')).toHaveClass(/open/);
  await back(page);await expect(page.locator('#dataMenu')).not.toHaveClass(/open/);
  await page.locator('.week-card:not(.sent) .day-cell').first().click();await page.waitForTimeout(400);
  await expect(page.locator('#overlay')).toHaveClass(/active/);await shot(page,'10-dia');
  await back(page);await expect(page.locator('#overlay')).not.toHaveClass(/active/);
  await page.evaluate(()=>openHomePopup(true));await page.waitForTimeout(400);await expect(page.locator('#homePopup')).toBeVisible();
  await back(page);await expect(page.locator('#homePopup')).toBeHidden();
  await page.locator('.week-card [data-week-doubt]').nth(1).click();await page.waitForTimeout(500);
  await expect(page.locator('#weekDoubtOv')).toHaveClass(/open/);
  await back(page);await expect(page.locator('#weekDoubtWrap')).toHaveCount(0);
  // Después de todo eso, Inicio sigue en Gestify y un Atrás más sale.
  expect(page.url()).toContain('127.0.0.1:8765');
});

test('Ventanas con ventana encima: Fiscal sobre Económico vuelve a Económico',async({page})=>{
  await page.evaluate(()=>openEcon());await page.waitForTimeout(500);
  await expect(page.locator('#econOverlay')).toHaveClass(/open/);
  await page.evaluate(()=>openFiscal());await page.waitForTimeout(500);
  await expect(page.locator('#fiscalOverlay')).toHaveClass(/open/);await shot(page,'11-fiscal');
  await back(page);await expect(page.locator('#fiscalOverlay')).not.toHaveClass(/open/);
  await back(page);await expect(open(page)).toHaveCount(0);
});
