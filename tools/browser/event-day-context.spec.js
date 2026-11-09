const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-11-09T10:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.goto('/');
  await page.evaluate(()=>{
    BDAYS=[];RUTINAS=[];EVENTS=[
      {id:'day-today',kind:'grande',type:'Plan exterior',title:'Plan exterior',start:'2026-11-09',end:'2026-11-09',barSize:'lg',color:'#568600'},
      {id:'day-tomorrow',kind:'grande',type:'Otros',title:'Cena especial',start:'2026-11-10',end:'2026-11-10',color:'#956c49',viaje:{ida:{time:'18:00'},vuelta:{time:'21:00'}}},
      {id:'day-repeat',kind:'grande',type:'Otros',title:'Plan del martes',start:'2026-10-06',end:'2026-10-06',repeat:{type:'weekly',weekDays:[2]},color:'#956c49'},
      {id:'range',kind:'grande',type:'Viaje',title:'Viaje en curso',start:'2026-11-08',end:'2026-11-11',color:'#1946a0'}
    ];SW={};homeSubmissionWeeks(2026,10).forEach(w=>SW[w.key]=true);render();
  });
});

test('nuevo cumpleaños usa hoy; las fechas explícitas y la edición se conservan',async({page})=>{
  await page.evaluate(()=>{openBday();BDAY_MONTH=3;refreshBday();});
  await page.locator('#bdAdd').click();
  await expect(page.locator('#bdFDay')).toHaveValue('9');await expect(page.locator('#bdFMonth')).toHaveValue('11');
  await page.locator('#bdFClose').click();
  await page.evaluate(()=>openBdayForm(null,29,2));await expect(page.locator('#bdFDay')).toHaveValue('29');await expect(page.locator('#bdFMonth')).toHaveValue('2');await page.locator('#bdFClose').click();
  await page.evaluate(()=>openBdayForm({name:'Persona ficticia',day:14,month:7}));await expect(page.locator('#bdFDay')).toHaveValue('14');await expect(page.locator('#bdFMonth')).toHaveValue('7');
  await page.locator('#bdFClose').click();await page.clock.setFixedTime(new Date('2027-01-31T23:59:00+01:00'));
  await page.evaluate(()=>openBdayForm());await expect(page.locator('#bdFDay')).toHaveValue('31');await expect(page.locator('#bdFMonth')).toHaveValue('1');
  await page.locator('#bdFClose').click();await page.clock.setFixedTime(new Date('2027-02-01T00:01:00+01:00'));
  await page.evaluate(()=>openBdayForm());await expect(page.locator('#bdFDay')).toHaveValue('1');await expect(page.locator('#bdFMonth')).toHaveValue('2');
});

test('Recordatorios usa el mes real aunque Home muestre otro año',async({page})=>{
  await page.evaluate(()=>{CY=2027;CM=1;render();openHomePopup(true);});
  await expect(page.locator('.home-pending-warnings')).toHaveCount(0);
  await page.locator('#homePopupClose').click();
  await page.evaluate(()=>{delete SW['2026-11-09'];openHomePopup(true);});
  await expect(page.locator('.home-pending-warnings .warn')).toHaveCount(1);await expect(page.locator('.home-pending-warnings')).toContainText('Semana del 09/11');
  expect(await page.evaluate(()=>[CY,CM])).toEqual([2027,1]);
});

test('Próximos y Recordatorios colocan los planes de un día bajo su fecha; los viajes siguen agrupados',async({page},info)=>{
  await page.evaluate(()=>{EV_VIEW='upcoming';openEventsAt();});
  const today=page.locator('.ev-upcoming-item[data-id="day-today"]');
  await expect(today).toBeVisible();expect(await today.evaluate(e=>e.previousElementSibling.classList.contains('ev-up-daysep'))).toBe(true);
  expect(await today.evaluate(e=>e.previousElementSibling.textContent)).toContain('Hoy');
  const repeat=page.locator('.ev-upcoming-item[data-id="day-repeat"]');await expect(repeat).toHaveCount(1);await expect(repeat).toHaveAttribute('data-first','2026-11-10');
  await page.screenshot({path:info.outputPath('proximos-v546.png'),animations:'disabled'});
  await page.evaluate(()=>{closeEvents();openHomePopup(true);});
  await expect(page.locator('.home-reminder-today [data-reminder-id="day-today"]')).toHaveCount(1);
  await expect(page.locator('.home-reminder-tomorrow [data-reminder-id="day-tomorrow"]')).toHaveCount(1);
  await expect(page.locator('.home-reminder-tomorrow [data-reminder-id="day-tomorrow"]')).toContainText('Vuelta · 21:00');
  await expect(page.locator('.home-reminder-plans [data-reminder-id="range"]')).toHaveCount(1);
  await expect(page.locator('.home-reminder-plans [data-reminder-id="day-today"]')).toHaveCount(0);
  await page.screenshot({path:info.outputPath('recordatorios-v546.png'),animations:'disabled'});
});

for(const width of [320,400,440])test('título completo centrado en dos líneas y esquinas compactas '+width,async({page},info)=>{
  await page.setViewportSize({width,height:880});
  await page.evaluate(()=>{EVENTS=EVENTS.filter(e=>e.id!=='range');EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=10;openEventsAt();});
  const title=page.locator('[data-title-for="day-today"] .ev-month-title-text');
  await expect(title).toHaveCSS('text-align','center');
  const size=await title.evaluate(e=>({height:e.clientHeight,total:e.scrollHeight,line:parseFloat(getComputedStyle(e).lineHeight)}));
  expect(size.total).toBeLessThanOrEqual(size.height+1);expect(size.height).toBeLessThanOrEqual(size.line*2+1);
  await expect(page.locator('.ev-multi-bar[data-id="day-today"]')).toHaveCSS('border-top-left-radius','5px');
  await page.screenshot({path:info.outputPath('calendario-v546-'+width+'.png'),animations:'disabled'});
  await page.locator('.ev-multi-bar[data-id="day-today"]').click();await expect(page.locator('#evDTitle')).toHaveText('Plan exterior');
});

test('el plan de un día conserva las esquinas compactas al compartir espacio con otro grande',async({page})=>{
  await page.evaluate(()=>{EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=10;openEventsAt();});
  const bar=page.locator('.ev-stepped-bar[data-id="day-today"]');await expect(bar).toBeVisible();
  const path=await bar.locator('path[fill]:not([fill="none"])').last().getAttribute('d');
  const arcs=Array.from(path.matchAll(/ A ([\d.]+) ([\d.]+)/g));expect(arcs.length).toBeGreaterThan(0);
  expect(arcs.every(a=>Number(a[2])<=60)).toBe(true);
});
