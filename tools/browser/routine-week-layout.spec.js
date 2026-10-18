const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});

test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-18T12:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
 await page.evaluate(()=>{
  RUTINAS=[{id:'week-layout',name:'Pádel',icon:'padel',color:'#a3e635',start:'2026-10-01',weekDays:[3,5],time:'15:00',dur:60,weeks:{},skips:{}}];
  EV_VIEW='rutinas';openEventsAt();RUT_WEEK_SEL='2026-11-02';_rutWeekRender(RUTINAS[0]);
 });
 await expect(page.locator('#rutWkOv')).toHaveClass(/open/);
 await expect(page.locator('.tasks-fab')).toBeHidden();
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
});

test('Editor semanal: tarjetas completas, etiquetas comunes y pie estable al ampliar horarios',async({page},info)=>{
 for(const width of [320,400,440]){
  await page.setViewportSize({width,height:880});
  await page.evaluate(()=>_rutWeekRender(RUTINAS[0]));await expect(page.locator('#rutWkOv')).toHaveClass(/open/);
  const initial=await page.locator('.rut-week-sheet').boundingBox();
  const footer=await page.locator('.rut-week-actions').boundingBox();
  await expect(page.locator('#rutWkTimes')).toBeHidden();
  const fonts=await page.evaluate(()=>['.rut-week-title strong','#rutWkTimeLabel','#rutWkDur','#rutWkScope','.rut-week-option strong'].map(s=>getComputedStyle(document.querySelector(s)).fontFamily));
  expect(new Set(fonts).size).toBe(1);
  expect(await page.locator('#rutWkTimeLabel').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeLessThan(14);
  await page.locator('.rut-week-option').first().click();
  await expect(page.locator('#rutWkPerDay')).toBeChecked();await expect(page.locator('#rutWkTimes .rut-hpd-row')).toHaveCount(2);
  for(const day of ['Lunes','Martes','Jueves','Sábado','Domingo'])await page.getByRole('button',{name:day,exact:true}).click();
  await expect(page.locator('#rutWkTimes .rut-hpd-row')).toHaveCount(7);
  await expect(page.locator('#rutWkDays button[aria-pressed="true"]')).toHaveCount(7);
  expect(await page.locator('.rut-week-sheet').boundingBox()).toEqual(initial);
  expect(await page.locator('.rut-week-actions').boundingBox()).toEqual(footer);
  const spacing=await page.locator('.rut-week-option').first().evaluate(el=>{
   const box=el.getBoundingClientRect(),check=el.querySelector('input').getBoundingClientRect(),text=el.querySelector('span').getBoundingClientRect();
   return {gap:text.left-check.right,padding:check.left-box.left,overflow:el.scrollWidth-el.clientWidth};
  });
  expect(spacing.gap).toBeGreaterThanOrEqual(11);expect(spacing.padding).toBeGreaterThanOrEqual(12);expect(spacing.overflow).toBe(0);
  await page.locator('.rut-week-body').evaluate(el=>el.scrollTop=el.scrollHeight);
  await expect(page.locator('#rutWkForward')).toBeVisible();await expect(page.locator('#rutWkSave')).toBeInViewport();
  expect(await page.locator('.rut-week-actions').boundingBox()).toEqual(footer);
  await page.screenshot({path:info.outputPath('semana-desplegada-'+width+'.png')});
 }
});

test('La tarjeta de alcance cambia la opción y conserva las horas al alternar horarios',async({page},info)=>{
 await page.locator('.rut-week-option').first().click();
 await page.getByLabel('Hora del miércoles').evaluate(el=>el.value='19:00');
 await page.locator('.rut-week-option').first().click();await expect(page.locator('#rutWkTimes')).toBeHidden();
 await page.locator('.rut-week-option').first().click();await expect(page.getByLabel('Hora del miércoles')).toHaveValue('19:00');
 await page.locator('.rut-week-scope .rut-week-option').click();await expect(page.locator('#rutWkForward')).toBeChecked();
 await expect(page.locator('#rutWkScope')).toContainText('Nuevo horario habitual');await expect(page.locator('#rutWkSave')).toHaveText('Guardar horario');
 await page.evaluate(async()=>Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));
 await page.screenshot({path:info.outputPath('semana-horarios.png')});
 await page.locator('#rutWkSave').click();await expect(page.locator('#rutWkOv')).toHaveCount(0);
 expect(await page.evaluate(()=>['2026-11-04','2026-11-06','2026-11-11','2026-10-28'].map(ds=>rutOccursOn(RUTINAS[0],ds)))).toEqual(['19:00','15:00','19:00','15:00']);
});
