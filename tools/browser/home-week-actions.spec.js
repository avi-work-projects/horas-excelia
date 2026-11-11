const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
async function setup(page,state='scheduled'){
  await page.clock.install({time:new Date('2027-02-01T12:00:00+01:00')});
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.route('https://week-actions.test.ts.net/**',r=>r.abort());
  await page.goto('/');
  await page.evaluate(state=>{
    CY=2027;CM=1;ST={};SW={};MONTH_H={'2027-02':9};HOURS_WEEK_UNLOCKED={};
    invoiceSave({config:{kairoUrl:'https://week-actions.test.ts.net/facturas/'},months:{}});
    HOURS_CACHE={schema:1,url:hoursKairoUrl(),weeks:{},periods:{'2027-02':{checkedAt:Date.now()}},attempts:{}};
    if(state!=='pending')HOURS_CACHE.weeks['2027-02-01']={state,days:hoursWeekDays('2027-02-01'),schedule:'2027-02-05T08:00:00+01:00'};
    render();
  },state);
  return page.locator('.week-card[data-week="2027-02-01"]');
}
test('una acción centrada por semana; despliegue y cancelar conservan los datos en los tres temas',async({page},info)=>{
  const card=await setup(page);const before=await page.evaluate(()=>JSON.stringify([ST,SW,HOURS_CACHE]));
  for(const theme of ['light','dark','grey'])for(const width of [320,400,440]){
    await page.setViewportSize({width,height:880});await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;render();},theme);
    const actions=card.locator('.week-actions');await expect(actions.getByRole('button')).toHaveCount(1);
    const button=actions.getByRole('button',{name:'Acciones',exact:true});
    expect(await button.evaluate(e=>{const p=e.parentElement.getBoundingClientRect(),b=e.getBoundingClientRect();return Math.abs(p.x+p.width/2-b.x-b.width/2);})).toBeLessThan(2);
    if(theme==='light'&&width===400)await card.screenshot({path:info.outputPath('semana-acciones.png')});
    await button.click();await expect(actions.getByRole('button')).toHaveText(['Enviar a Outlook','Editar horas','']);
    await expect(actions.locator('.home-week-cancel')).toHaveAccessibleName('Cancelar');await expect(actions.locator('.home-week-cancel .prohibition-icon')).toBeVisible();
    expect(await actions.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
    const geometry=await actions.evaluate(e=>{const boxes=[...e.children].map(b=>b.getBoundingClientRect()),p=e.getBoundingClientRect(),s=getComputedStyle(e);return {widths:boxes.map(b=>b.width),heights:boxes.map(b=>b.height),left:boxes[0].left-p.left-parseFloat(s.paddingLeft),right:p.right-boxes[2].right-parseFloat(s.paddingRight)};});
    expect(Math.max(...geometry.widths)-Math.min(...geometry.widths)).toBeLessThan(1);
    expect(new Set(geometry.heights).size).toBe(1);expect(Math.abs(geometry.left)).toBeLessThan(1);expect(Math.abs(geometry.right)).toBeLessThan(1);
    const colors=await actions.locator('.home-week-edit,.home-week-cancel').evaluateAll(nodes=>nodes.map(e=>({text:getComputedStyle(e).color,fill:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderTopColor,icon:getComputedStyle(e.querySelector('svg')).color})));
    expect(colors.map(c=>c.fill)).toEqual(['rgb(244, 160, 102)','rgb(216, 48, 48)']);expect(colors.map(c=>c.text)).toEqual(['rgb(255, 255, 255)','rgb(255, 255, 255)']);
    for(const color of colors){expect(color.fill).toBe(color.border);expect(color.text).toBe(color.icon);expect(color.text).not.toBe(color.fill);}
    if(theme==='light'&&width===400)await card.screenshot({path:info.outputPath('semana-desplegada.png')});
    await actions.getByRole('button',{name:'Cancelar',exact:true}).click();await expect(button).toBeFocused();
  }
  expect(await page.evaluate(()=>JSON.stringify([ST,SW,HOURS_CACHE]))).toBe(before);
});
for(const state of ['scheduled','sent'])test('Editar horas protege la semana '+state+' y conserva el correo',async({page})=>{
  const card=await setup(page,state),stored=await page.evaluate(()=>JSON.stringify(HOURS_CACHE.weeks));
  await card.locator('.day-cell').first().click();await expect(page.locator('#bottomSheet.active')).toHaveCount(0);
  await card.getByRole('button',{name:'Acciones',exact:true}).click();
  let message='';page.once('dialog',d=>{message=d.message();return d.dismiss();});
  await card.getByRole('button',{name:'Editar horas',exact:true}).click();
  expect(message).toContain(state==='sent'?'no se puede modificar su correo':'después deberás modificar el correo');
  expect(await page.evaluate(()=>homeWeekUnlocked('2027-02-01'))).toBe(false);
  page.once('dialog',d=>d.accept());await card.getByRole('button',{name:'Editar horas',exact:true}).click();
  await card.locator('.day-cell').first().click();await expect(page.locator('#bottomSheet.active')).toBeVisible();
  await page.locator('.hour-chip-day[data-h="7"]').click();await expect(card.locator('.day-hours').first()).toHaveText('7h');
  expect(await page.evaluate(()=>JSON.stringify(HOURS_CACHE.weeks))).toBe(stored);
  expect(await page.evaluate(()=>hoursWeekState('2027-02-01'))).toBe(state==='sent'?'sent':'changed');
  await card.getByRole('button',{name:'Acciones',exact:true}).click();
  page.once('dialog',d=>d.dismiss());await card.getByRole('button',{name:'Enviar a Outlook',exact:true}).click();
  expect(await page.evaluate(()=>JSON.stringify(HOURS_CACHE.weeks))).toBe(stored);
});
test('primer cambio pendiente: cancelar no guarda; aceptar dura 20 minutos y no se extiende al usarlo',async({page},info)=>{
  const card=await setup(page,'pending');await expect(card.locator('.week-actions button')).toHaveText('Enviar a Outlook');
  await card.screenshot({path:info.outputPath('semana-pendiente.png')});
  await card.locator('.day-cell').first().click();
  let message='';page.once('dialog',d=>{message=d.message();return d.dismiss();});
  await page.locator('.hour-chip-day[data-h="7"]').click();
  expect(message).toContain('de 9 horas trabajadas a 7 horas trabajadas');expect(await page.evaluate(()=>ST['2027-02-01'])).toBeUndefined();
  expect(await page.evaluate(()=>sessionStorage.getItem(HOME_EDIT_CONFIRM_KEY))).toBeNull();
  page.once('dialog',d=>d.accept());await page.locator('.hour-chip-day[data-h="7"]').click();
  const at=await page.evaluate(()=>sessionStorage.getItem(HOME_EDIT_CONFIRM_KEY));
  await page.clock.fastForward(19*60*1000);await card.locator('.day-cell').nth(1).click();
  await page.locator('.sheet-option[data-type="vacaciones"]').click();await expect(card.locator('.day-hours').nth(1)).toHaveText('V');
  expect(await page.evaluate(()=>sessionStorage.getItem(HOME_EDIT_CONFIRM_KEY))).toBe(at);
  await page.reload();await card.locator('.day-cell').nth(2).click();await page.locator('.hour-chip-day[data-h="8"]').click();
  await page.clock.fastForward(60*1000);await card.locator('.day-cell').nth(3).click();
  page.once('dialog',d=>{message=d.message();return d.dismiss();});await page.locator('.sheet-option[data-type="ausencia"]').click();
  expect(message).toContain('a ausencia');expect(await page.evaluate(()=>ST['2027-02-04'])).toBeUndefined();
});
test('una confirmación pendiente no oculta el aviso si la semana se programa o se envía después',async({page})=>{
  const card=await setup(page,'pending');
  await card.locator('.day-cell').first().click();page.once('dialog',d=>d.accept());await page.locator('.hour-chip-day[data-h="7"]').click();
  await page.evaluate(()=>{HOURS_CACHE.weeks['2027-02-01']={state:'scheduled'};render();});
  await card.getByRole('button',{name:'Acciones',exact:true}).click();let message='';
  page.once('dialog',d=>{message=d.message();return d.accept();});await card.getByRole('button',{name:'Editar horas',exact:true}).click();
  expect(message).toContain('programado su envío');await card.locator('.day-cell').nth(1).click();
  await page.evaluate(()=>{HOURS_CACHE.weeks['2027-02-01'].state='sent';});
  page.once('dialog',d=>{message=d.message();return d.dismiss();});await page.locator('.hour-chip-day[data-h="8"]').click();
  expect(message).toContain('ya está enviada');expect(await page.evaluate(()=>ST['2027-02-02'])).toBeUndefined();
});
