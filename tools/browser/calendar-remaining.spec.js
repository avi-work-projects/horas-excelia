const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-26T10:00:00+01:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.goto('/');
  await page.evaluate(()=>{BDAYS=[];RUTINAS=[];EVENTS=[];EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=9;openEventsAt();});
  await page.waitForTimeout(350);
});

for(const width of [320,400,440])test('Un contorno continuo desde hoy, con escalón y sin alterar la malla '+width,async({page},info)=>{
  await page.setViewportSize({width,height:880});await page.evaluate(()=>document.fonts.ready);
  const outlines=page.locator('.ev-pending-outline');
  await expect(outlines).toHaveCount(1);
  await expect(outlines).toHaveClass(/ev-pending-start ev-pending-end/);
  const today=page.locator('.ev-cell[data-ds="2026-10-26"]'),nextMonth=page.locator('.ev-cell[data-ds="2026-11-01"]');
  const start=await today.boundingBox(),end=await nextMonth.boundingBox(),outline=await outlines.boundingBox();
  expect(Math.abs(outline.x-start.x)).toBeLessThan(1);expect(Math.abs(outline.x+outline.width-end.x-end.width)).toBeLessThan(1);
  await expect(today).toHaveCSS('outline-style','none');await expect(outlines).toHaveCSS('pointer-events','none');
  await page.screenshot({path:info.outputPath('pendientes-octubre-'+width+'.png'),animations:'disabled'});

  await page.clock.setFixedTime(new Date('2026-08-21T10:00:00+02:00'));
  await page.evaluate(()=>{EV_MONTH=7;refreshEvents(false);});
  await expect(outlines).toHaveCount(3);
  const first=await outlines.first().boundingBox(),second=await outlines.nth(1).boundingBox(),last=await outlines.last().boundingBox();
  const friday=await page.locator('.ev-cell[data-ds="2026-08-21"]').boundingBox();
  expect(Math.abs(first.x-friday.x)).toBeLessThan(1);expect(Math.abs(first.y+first.height-second.y)).toBeLessThan(1);
  await expect(outlines.nth(1)).toHaveClass(/ev-pending-step/);
  expect(await outlines.nth(1).evaluate(el=>parseFloat(getComputedStyle(el,'::before').width))).toBeCloseTo(first.x-second.x+2,0);
  await expect(outlines.nth(1)).toHaveCSS('border-top-width','0px');await expect(outlines.nth(1)).toHaveCSS('border-bottom-width','0px');
  const sunday=await page.locator('.ev-cell[data-ds="2026-09-06"]').boundingBox();expect(Math.abs(last.y+last.height-sunday.y-sunday.height)).toBeLessThan(1);
  const before=await page.locator('.ev-month-wrap').boundingBox();
  await page.screenshot({path:info.outputPath('pendientes-escalon-'+width+'.png'),animations:'disabled'});
  await page.evaluate(()=>{const wrap=document.querySelector('.ev-month-wrap');wrap.outerHTML=renderEvCalMonth({remaining:false});});
  await expect(outlines).toHaveCount(0);expect(await page.locator('.ev-month-wrap').boundingBox()).toEqual(before);
});

test('Mes actual y siguiente si incluye hoy, también al cambiar de año',async({page})=>{
  for(const [date,year,month,lastVisible] of [
    ['2026-10-31T12:00:00+01:00',2026,9,'2026-11-01'],
    ['2026-11-01T12:00:00+01:00',2026,10,'2026-12-06'],
    ['2026-12-31T12:00:00+01:00',2026,11,'2027-01-03'],
    ['2027-02-01T12:00:00+01:00',2027,1,'2027-02-28']
  ]){
    await page.clock.setFixedTime(new Date(date));await page.evaluate(({year,month})=>{EV_YEAR=year;EV_MONTH=month;refreshEvents(false);},{year,month});
    const todayColor=await page.locator('.ev-cell.today-ev').evaluate(el=>getComputedStyle(el).backgroundColor);
    await expect(page.locator('.ev-current-weekday')).toHaveCount(1);
    const last=await page.locator('.ev-pending-end').boundingBox(),cell=await page.locator('.ev-cell[data-ds="'+lastVisible+'"]').boundingBox();expect(Math.abs(last.y+last.height-cell.y-cell.height)).toBeLessThan(1);
    await page.evaluate(()=>{EV_MONTH--;refreshEvents(false);});await expect(page.locator('.ev-pending-outline')).toHaveCount(0);await expect(page.locator('.ev-current-weekday')).toHaveCount(0);
    await page.evaluate(()=>{EV_MONTH+=2;refreshEvents(false);});
    const visibleToday=await page.locator('.ev-cell.today-ev').count();
    if(visibleToday){await expect(page.locator('.ev-pending-start')).toHaveCount(1);await expect(page.locator('.ev-current-weekday')).toHaveCount(1);await expect(page.locator('.ev-cell.today-ev')).toHaveCSS('background-color',todayColor);}
    else{await expect(page.locator('.ev-pending-outline')).toHaveCount(0);await expect(page.locator('.ev-current-weekday')).toHaveCount(0);}
  }
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));await page.evaluate(()=>{EV_YEAR=2026;EV_MONTH=9;refreshEvents(false);});await expect(page.locator('.ev-pending-step')).toHaveCount(1);
});

for(const width of [320,400,440])test('Mes siguiente continúa el contorno desde hoy en la semana compartida '+width,async({page},info)=>{
  await page.setViewportSize({width,height:880});await page.clock.setFixedTime(new Date('2026-10-28T12:00:00+01:00'));
  await page.evaluate(()=>{EV_MONTH=9;refreshEvents(false);});
  const currentColor=await page.locator('.ev-cell[data-ds="2026-10-28"]').evaluate(el=>getComputedStyle(el).backgroundColor);
  await page.evaluate(()=>{EV_MONTH=10;refreshEvents(false);});
  const today=await page.locator('.ev-cell[data-ds="2026-10-28"]').boundingBox(),first=await page.locator('.ev-pending-start').boundingBox();
  expect(Math.abs(first.x-today.x)).toBeLessThan(1);expect(Math.abs(first.y-today.y)).toBeLessThan(3);
  const second=await page.locator('.ev-pending-outline').nth(1).boundingBox();expect(Math.abs(first.y+first.height-second.y)).toBeLessThan(1);
  await expect(page.locator('.ev-pending-step')).toHaveCount(1);
  const end=await page.locator('.ev-pending-end').boundingBox(),last=await page.locator('.ev-cell[data-ds="2026-12-06"]').boundingBox();expect(Math.abs(end.y+end.height-last.y-last.height)).toBeLessThan(1);
  const current=page.locator('.ev-cell[data-ds="2026-10-28"]');
  await expect(current).toHaveCSS('outline-style','none');await expect(current).toHaveCSS('background-color',currentColor);
  await expect(current.locator('.ev-num')).toHaveCSS('opacity','1');
  await expect(page.locator('.ev-current-weekday')).toHaveText('X');await expect(page.locator('.ev-current-weekday')).toHaveCSS('border-radius','50%');
  const otherDay=page.locator('.ev-cell[data-ds="2026-10-29"]');
  expect(await otherDay.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(currentColor);await expect(otherDay.locator('.ev-num')).toHaveCSS('opacity','0.35');
  await page.screenshot({path:info.outputPath('pendientes-mes-siguiente-'+width+'.png'),animations:'disabled'});
  for(const theme of ['dark','grey']){
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;EV_MONTH=9;refreshEvents(false);},theme);
    const color=await current.evaluate(el=>getComputedStyle(el).backgroundColor);
    await page.evaluate(()=>{EV_MONTH=10;refreshEvents(false);});await expect(current).toHaveCSS('background-color',color);await expect(page.locator('.ev-current-weekday')).toHaveText('X');
  }
  await page.evaluate(()=>{EV_MONTH=11;refreshEvents(false);});await expect(page.locator('.ev-pending-outline')).toHaveCount(0);await expect(page.locator('.ev-current-weekday')).toHaveCount(0);
});
