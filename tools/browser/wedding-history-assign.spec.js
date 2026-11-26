const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
// Clases ficticias de 2025 y 2026: récord de mes en marzo de 2025 y clases libres en noviembre.
const classes=[
  ['a','2025-03-03'],['a','2025-03-06'],['a','2025-03-10'],['a','2025-03-20'],['a','2025-03-31'],
  ['a','2025-04-07'],['a','2025-05-12'],['b','2026-09-28'],['b','2026-10-02'],
  [null,'2026-08-03'],[null,'2026-11-12'],[null,'2026-11-19']
];
test.beforeEach(async({page})=>{
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00+02:00'));
  await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
  await page.goto('/');
  await page.evaluate(classes=>{
    BODA_COUPLES=[{id:'a',name:'Pareja Antigua',weddingDate:'2025-06-01',contracted:7,color:'#eaa155'},{id:'b',name:'Pareja Actual',weddingDate:'2026-12-12',contracted:4,color:'#50aa80'}];
    EVENTS=classes.map(([coupleId,start],i)=>({id:'cl'+i,kind:'puntual',type:'Ensayos boda',title:'Ensayo',start,end:start,repeat:null,boda:{coupleId,time:'18:00',place:'sala',duration:60}}));
    saveBodas();saveEvents();EV_VIEW='bodas';BODA_SUBTAB='stats';openEventsAt();
  },classes);
  // Los eventos de la ventana se enganchan al terminar de abrirse.
  await expect(page.locator('#eventsOverlay')).toHaveClass(/open/);
});

test('récords con todas las clases registradas e histórico deslizable hasta el periodo actual',async({page})=>{
  const records=page.locator('.boda-record');await expect(records).toHaveCount(3);
  await expect(records.nth(0)).toContainText('5 clases');await expect(records.nth(0)).toContainText('Marzo 2025');await expect(records.nth(0)).toContainText('1,1 clases / semana');
  await expect(records.nth(1)).toContainText('5 clases');await expect(records.nth(1)).toContainText('1,2 clases / semana');
  await expect(records.nth(2)).toContainText('7 clases');await expect(records.nth(2)).toContainText('2025');
  const charts=page.locator('.boda-scroll-chart');await expect(charts).toHaveCount(2);
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    await page.evaluate(()=>bindBodaHistoryCharts());
    const box=await charts.evaluateAll(els=>els.map(e=>({scroll:e.scrollWidth>e.clientWidth,left:e.scrollLeft})));
    for(const chart of box){expect(chart.scroll).toBe(true);expect(chart.left).toBeGreaterThan(0);}
    expect(await page.locator('#eventsOverlay .sy-body').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  }
  // Del primer mes con clases (marzo 2025) al último registrado (noviembre 2026).
  expect(await page.evaluate(()=>bodaMonthSeries(bodaClasses(),new Date()).map(m=>m.key))).toHaveLength(21);
  await page.screenshot({path:'test-results/wedding-records.png'});
});

test('Asignar abre en la próxima clase libre y ofrece accesos a las demás',async({page})=>{
  await page.evaluate(()=>{BODA_SUBTAB='parejas';refreshEvents(false);openBodaAssign(BODA_COUPLES[0]);});
  const sheet=page.locator('#bodaAsgSheet');
  await expect(sheet.locator('.boda-asg-month')).toHaveText('Noviembre 2026');
  await expect(sheet.locator('.boda-asg-day.libre')).toHaveCount(2);
  await expect(sheet.locator('[data-asg-jump]')).toHaveText(['12/11','19/11']);
  await page.evaluate(()=>{BODA_ASSIGN.month=0;BODA_ASSIGN.year=2026;renderBodaAssign();});
  await sheet.locator('[data-asg-jump="2026-11-19"]').click();
  await expect(sheet.locator('.boda-asg-month')).toHaveText('Noviembre 2026');
  expect(await sheet.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
});

test('Editar pareja: interruptor de pareja futura sin textos explicativos',async({page})=>{
  await page.evaluate(()=>openBodaCoupleForm(BODA_COUPLES[1]));
  const form=page.locator('#bodaCFormOv');
  await expect(form.getByRole('switch',{name:'Pareja futura'})).not.toBeChecked();
  await expect(form.locator('.sy-note,.boda-stat-note,.ev-note-scope')).toHaveCount(0);
  await form.getByRole('switch',{name:'Pareja futura'}).click();
  await expect(form.getByRole('switch',{name:'Pareja futura'})).toBeChecked();
  await page.locator('#bodaCSave').click();
  await expect.poll(()=>page.evaluate(()=>BODA_COUPLES[1].future)).toBe(true);
});

test('Parejas: orden en desplegable, «faltan» rojo solo con boda cercana y Eliminar en la cabecera de la clase',async({page})=>{
  await page.evaluate(()=>{BODA_COUPLES[1].weddingDate='2026-11-10';BODA_PAREJAS_FILTER='todas';BODA_PAREJAS_SORT='boda';BODA_SUBTAB='parejas';saveBodas();refreshEvents(false);});
  const names=page.locator('.boda-card .boda-name');
  await expect(names).toHaveText(['Pareja Antigua','Pareja Actual']);
  await page.locator('#bodaPSort').selectOption('za');
  await expect(names).toHaveText(['Pareja Antigua','Pareja Actual']);
  await page.locator('#bodaPSort').selectOption('az');
  await expect(names).toHaveText(['Pareja Actual','Pareja Antigua']);
  await expect(page.locator('.boda-falta.urgente')).toHaveText('faltan 2');
  await page.evaluate(()=>{BODA_COUPLES[1].weddingDate='2026-12-12';refreshEvents(false);});
  await expect(page.locator('.boda-falta')).toHaveCount(1);
  await expect(page.locator('.boda-falta.urgente')).toHaveCount(0);
  await page.evaluate(()=>openBodaClaseForm(EVENTS.find(e=>e.id==='cl8')));
  const header=page.locator('#bodaFormOv .boda-form-header');
  await expect(header.locator('h2')).toHaveText('Editar clase');
  await header.locator('#bodaFormDel').click();
  await expect.poll(()=>page.evaluate(()=>EVENTS.some(e=>e.id==='cl8'))).toBe(false);
});

test('Calendario: pulsar un día lista sus clases y Configuración usa interruptores en filas',async({page})=>{
  await page.evaluate(()=>{BODA_SUBTAB='calendario';BODA_CAL_YEAR=2026;BODA_CAL_MONTH=10;refreshEvents(false);});
  await expect(page.locator('.boda-cal-day[data-ds="2026-11-12"] .boda-cal-x svg')).toHaveCount(1);
  await page.locator('.boda-cal-day[data-ds="2026-11-12"]').click();
  const list=page.locator('.boda-cal-daylist');
  await expect(list.locator('.boda-class-ro')).toHaveCount(1);
  await list.locator('.boda-cl-edit').click();
  await expect(page.locator('#bodaFormOv .boda-form-header h2')).toHaveText('Editar clase');
  await page.locator('#bodaFormClose').click();
  await page.evaluate(()=>{BODA_SUBTAB='config';refreshEvents(false);});
  const sw=page.getByRole('switch',{name:'Activo: '+await page.evaluate(()=>BODA_CONFIG.packs[0].name)});
  await expect(sw).toBeChecked();
  await sw.click();
  await expect.poll(()=>page.evaluate(()=>BODA_CONFIG.packs[0].active)).toBe(false);
  for(const width of [320,400]){
    await page.setViewportSize({width,height:880});
    expect(await page.locator('#bodaConfigContent .boda-cfg-row').evaluateAll(rows=>rows.every(r=>r.scrollWidth<=r.clientWidth+1))).toBe(true);
  }
});
