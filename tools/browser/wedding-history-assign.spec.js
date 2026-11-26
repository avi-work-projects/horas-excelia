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

test('Estadísticas por año, aviso de boda cercana en Recordatorios y Duplicar clase',async({page})=>{
  // Por año: 2025 deja solo las clases de la pareja antigua; Récords sigue contándolas todas.
  await page.locator('#bodaYearBtn').click();
  await expect(page.locator('#bodaYearList .boda-year-opt')).toHaveText(['Todos los años','2026','2025']);
  await page.locator('[data-bstats-year="2025"]').click();
  await expect(page.locator('#bodaYearBtn')).toContainText('2025');
  const rows=page.locator('.boda-stats-summary .boda-sum-row');
  await expect(rows.nth(1).locator('.boda-sum-main b')).toHaveText('7');
  await expect(rows.filter({hasText:'Contratadas'}).locator('.boda-sum-main b')).toHaveText('7');
  await expect(page.locator('.boda-record').nth(2)).toContainText('7 clases');
  await expect(page.locator('.boda-stats-heat .boda-heat-c.strong')).toHaveCount(1);
  await page.locator('#bodaYearBtn').click();await page.locator('[data-bstats-year=""]').click();
  await expect(rows.nth(1).locator('.boda-sum-main b')).toHaveText('12');
  // Duplicar: misma pareja y hora, una semana después, sin tocar el original hasta Guardar.
  await page.evaluate(()=>{BODA_SUBTAB='clases';refreshEvents(false);openBodaClaseForm(EVENTS.find(e=>e.id==='cl8'));});
  await page.locator('#bodaFormDup').click();
  await expect(page.locator('#bodaFormOv h2')).toHaveText('Nueva clase');
  await expect(page.locator('#bodaFormDia')).toHaveValue('2026-10-09');
  await page.locator('#bodaFormSave').click();
  await expect.poll(()=>page.evaluate(()=>EVENTS.filter(e=>e.start==='2026-10-09').map(e=>[e.boda.coupleId,e.boda.time,e.id!=='cl8']))).toEqual([['b','18:00',true]]);
  // Recordatorios: pareja con boda en 30 días o menos y clases por asignar.
  await page.evaluate(()=>{BODA_COUPLES[1].contracted=6;BODA_COUPLES[1].weddingDate='2026-11-10';saveBodas();closeEvents();openHomePopup(true);});
  await expect(page.locator('#homePopupContent')).toContainText('Pareja Actual boda el 10/11 · faltan 3 clases por asignar');
});

test('v566: gráficos sin cambio de subpestaña, línea de récord, calendario con pareja fija y pack propio',async({page})=>{
  // Récord en los gráficos deslizables y bloqueo del gesto horizontal.
  await expect(page.locator('.boda-scroll-wrap .boda-record-tag')).toHaveText(['Récord 5','Récord 2']);
  await expect(page.locator('.boda-scroll-wrap[data-swipe-lock] .boda-record-line')).toHaveCount(2);
  // Calendario: tocar la fila de una clase resalta a su pareja y se mantiene al cambiar de mes.
  await page.evaluate(()=>{BODA_SUBTAB='calendario';BODA_CAL_YEAR=2026;BODA_CAL_MONTH=8;BODA_CAL_HL=null;refreshEvents(false);});
  await page.locator('.boda-cal-day[data-ds="2026-09-28"]').click();
  await page.locator('.boda-cal-daylist [data-hl="b"]').click();
  expect(await page.evaluate(()=>BODA_CAL_HL)).toBe('b');
  await page.evaluate(()=>window._hd=document.querySelector('.boda-sticky-hd'));
  await page.locator('#bodaCalPrev').click();await page.locator('#bodaCalPrev').click();
  await expect(page.locator('.boda-cal-month')).toHaveText('Julio2026');
  await expect(page.locator('.boda-cal-lg.on[data-hl="b"]')).toHaveCount(1);
  // Cambiar de mes repinta solo el calendario: la cabecera de subpestañas es el mismo nodo.
  expect(await page.evaluate(()=>window._hd.isConnected)).toBe(true);
  await page.locator('#bodaCalNext').click();await page.locator('#bodaCalNext').click();
  await expect(page.locator('.boda-cal-day.hl')).toHaveCount(2);
  // Editar pareja: Futura junto al nombre y selector de pack propio.
  await page.evaluate(()=>openBodaCoupleForm(BODA_COUPLES[1]));
  await expect(page.locator('.boda-cform-name').getByRole('switch',{name:'Pareja futura'})).toHaveCount(1);
  // Pack con tarjetas (v570): se elige directamente y queda marcada.
  const tiles=page.locator('.boda-pack-tile[data-pack]');await expect(tiles.first()).toBeVisible();
  await tiles.last().click();
  const last=await page.evaluate(()=>BODA_CONFIG.packs.filter(p=>p.active!==false).slice(-1)[0]);
  await expect(page.locator('.boda-pack-tile.on')).toContainText(last.name);await expect(tiles.last()).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#bodaCWedHint')).toHaveText('En 49 días');
  await page.locator('#bodaCWed').fill('2026-10-25');await expect(page.locator('#bodaCWedHint')).toHaveText('Mañana');
  await page.locator('#bodaCWed').fill('2026-12-12');
  await page.locator('#bodaCSave').click();
  await expect.poll(()=>page.evaluate(()=>BODA_COUPLES[1].packId)).toBe(last.id);
});

test('deslizar sobre un gráfico de Estadísticas no cambia de subpestaña; fuera de él, sí',async({page})=>{
  async function swipe(sel,dx){
    await page.evaluate(async([sel,dx])=>{
      const el=document.querySelector(sel),r=el.getBoundingClientRect(),x0=r.left+r.width/2,y=r.top+Math.min(40,r.height/2);
      const t=x=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
      el.dispatchEvent(new TouchEvent('touchstart',{touches:[t(x0)],changedTouches:[t(x0)],bubbles:true,cancelable:true}));
      for(let i=1;i<=6;i++){await new Promise(r=>requestAnimationFrame(r));el.dispatchEvent(new TouchEvent('touchmove',{touches:[t(x0+dx*i/6)],changedTouches:[t(x0+dx*i/6)],bubbles:true,cancelable:true}));}
      el.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[t(x0+dx)],bubbles:true,cancelable:true}));
      await new Promise(r=>setTimeout(r,600));
    },[sel,dx]);
  }
  await page.locator('.boda-stats-season').scrollIntoViewIfNeeded();
  for(const sel of ['.boda-stats-season [data-swipe-lock]','.boda-scroll-wrap'])await swipe(sel,-160);
  expect(await page.evaluate(()=>BODA_SUBTAB)).toBe('stats');
  await swipe('.boda-stats-summary',160);
  await expect.poll(()=>page.evaluate(()=>BODA_SUBTAB)).toBe('calendario');
});

test('Calendario: Hoy vuelve al mes actual y el mes se escribe con el año debajo',async({page})=>{
  await page.evaluate(()=>{BODA_SUBTAB='calendario';BODA_CAL_YEAR=2025;BODA_CAL_MONTH=2;refreshEvents(false);});
  await expect(page.locator('.boda-cal-month')).toHaveText('Marzo2025');
  await page.locator('#bodaCalToday').click();
  await expect(page.locator('.boda-cal-month')).toHaveText('Octubre2026');
  await expect(page.locator('.boda-cal-month .sy-year-sub')).toHaveText('2026');
});
