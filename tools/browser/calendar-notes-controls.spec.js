const {test,expect}=require('@playwright/test');
test.use({timezoneId:'Europe/Madrid'});
test.beforeEach(async({page})=>{await page.clock.setFixedTime(new Date('2026-10-16T14:37:00+02:00'));await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');if(!localStorage.getItem('excelia-theme-v1'))localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});await page.goto('/');});
async function settled(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});}
test('Peluquería abre su pestaña en edición y vuelve a la ficha actualizada',async({page},info)=>{
 await page.locator('#eventsBtn').click();await settled(page);
 await page.evaluate(()=>{EVENTS=[{id:'hair',kind:'puntual',type:'Peluquería',title:'Corte',start:'2026-10-16',end:'2026-10-16',color:'#8b5e34'}];appStorage.setItem(HAIRDRESSER_NOTES_KEY,'Antes');openEvDayCarousel('2026-10-16','hair');});
 await page.locator('#evDHairdresser').click();await expect(page.getByRole('tab',{name:'Peluquería',exact:true})).toHaveAttribute('aria-selected','true');
 await expect(page.locator('#hairdresserNoteText')).toBeEditable();await page.locator('#hairdresserNoteText').fill('Laterales cortos y arriba a tijera.');await page.locator('#personalNotesSave').click();
 await page.screenshot({path:info.outputPath('editar-peluqueria.png')});await page.locator('#personalNotesClose').click();await expect(page.locator('#personalNotesWrap')).toHaveCount(0);await expect(page.locator('.ev-hairdresser-note')).toContainText('Laterales cortos y arriba a tijera.');
});
test('Calendarios: Hoy alineado, día actual, fuera de mes y letras dentro del swipe',async({page},info)=>{
 for(const width of [320,400,440]){
  await page.setViewportSize({width,height:880});let reference;
  const home=await page.locator('#todayBtn').boundingBox();
  for(const view of ['cal','quad','annual']){
   await page.evaluate(view=>{EV_VIEW=view;EV_YEAR=2026;EV_MONTH=9;EV_QUAD_YEAR=2026;EV_QUAD_MONTH=9;openEventsAt();},view);await settled(page);
   const today=await page.locator('#evToday').boundingBox();expect(today.height).toBe(home.height);if(reference)expect(today).toEqual(reference);reference=today;
   for(const arrow of await page.locator('#eventsContent>.sy-header .sy-nav').all()){const rect=await arrow.boundingBox();expect(rect.width).toBe(rect.height);}
   const collisions=await page.locator('#eventsContent>.sy-header').evaluate(el=>{const buttons=[...el.querySelectorAll('button')].map(b=>({id:b.id,rect:b.getBoundingClientRect()}));return buttons.flatMap((a,i)=>buttons.slice(i+1).filter(b=>Math.min(a.rect.right,b.rect.right)-Math.max(a.rect.left,b.rect.left)>1&&Math.min(a.rect.bottom,b.rect.bottom)-Math.max(a.rect.top,b.rect.top)>1).map(b=>[a.id,b.id]));});expect(collisions,view+' '+width).toEqual([]);
   await page.screenshot({path:info.outputPath(view+'-'+width+'.png')});
  }
 }
 await page.evaluate(()=>{EV_VIEW='cal';EV_MONTH=9;refreshEvents(false);});await expect(page.locator('.ev-current-weekday')).toHaveText('V');await expect(page.locator('.ev-current-weekday')).toHaveCSS('color','rgb(255, 255, 255)');
 const colors=await page.evaluate(()=>[...document.querySelectorAll('.ev-cell')].filter(el=>el.matches('.out-m')||el.dataset.ds==='2026-10-06').map(el=>[el.classList.contains('out-m'),getComputedStyle(el).backgroundColor]));expect(colors.find(x=>x[0])[1]).not.toBe(colors.find(x=>!x[0])[1]);
 expect(await page.evaluate(()=>swipeContentResolver(document.getElementById('eventsOverlay'))().some(el=>el.classList.contains('ev-week-hdr')))).toBe(true);
 await page.evaluate(()=>{const el=document.getElementById('eventsOverlay');window.weekdaySwipe=createLiveSwipe(el,swipeContentResolver(el));weekdaySwipe.move(-100);});await expect(page.locator('.ev-week-hdr')).toHaveCSS('visibility','hidden');await page.screenshot({path:info.outputPath('letras-swipe.png')});await page.evaluate(()=>weekdaySwipe.cancel());
 await page.evaluate(()=>{EV_MONTH=10;refreshEvents(false);});await expect(page.locator('.ev-current-weekday')).toHaveCount(0);
});
test('Tema crema y mantel de Comida legibles; navegación cuadrada',async({page},info)=>{
 for(const theme of ['light','dark','grey']){
  await page.evaluate(theme=>{applyTheme(theme);EVENTS=[{id:'meal',kind:'puntual',type:'Comida',title:'Comida de prueba',start:'2026-10-16',end:'2026-10-16',color:'#e99a31'}];EV_VIEW='cal';EV_YEAR=2026;EV_MONTH=9;openEventsAt();},theme);await settled(page);
  await expect(page.locator('#evBack')).toHaveCSS('border-radius','9px');await expect(page.locator('#evPrev')).toHaveCSS('border-radius','9px');
  await page.screenshot({path:info.outputPath('calendario-'+theme+'.png')});await page.evaluate(()=>openEvDayCarousel('2026-10-16','meal'));await settled(page);
  await expect(page.locator('.ev-detail-symbol rect[fill="#ead6b4"]')).toHaveCount(1);await page.screenshot({path:info.outputPath('comida-'+theme+'.png')});await page.locator('#evDClose').click();await expect(page.locator('#evDetailOv')).toHaveCount(0);
 }
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','grey');expect(await page.evaluate(()=>THEME_LABELS.grey)).toContain('Crema');
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())).toBe('#fbf6ec');
});
for(const forward of [false,true])test('Rutina con horas por día: '+(forward?'desde la semana':'solo la semana'),async({page},info)=>{
 await page.evaluate(()=>{RUTINAS=[{id:'r',name:'Pádel',icon:'padel',start:'2026-10-01',weekDays:[1,4],time:'18:00',dur:60,weeks:{},skips:{},color:'#65a367'}];EV_VIEW='rutinas';openEventsAt();RUT_WEEK_SEL='2026-10-19';_rutWeekRender(RUTINAS[0]);});
 await page.locator('#rutWkPerDay').check();await page.locator('#rutWkDays [data-wd="2"]').click();
 await page.locator('#rutWkTimes [data-wd="1"]').evaluate(el=>el.value='17:00');await page.locator('#rutWkTimes [data-wd="2"]').evaluate(el=>el.value='19:15');await page.locator('#rutWkTimes [data-wd="4"]').evaluate(el=>el.value='20:30');
 if(forward)await page.locator('#rutWkForward').check();await settled(page);await page.screenshot({path:info.outputPath('horas-'+forward+'.png')});await page.locator('#rutWkSave').click();await expect(page.locator('#rutWkOv')).toHaveCount(0);
 expect(await page.evaluate(()=>['2026-10-19','2026-10-20','2026-10-22'].map(ds=>rutOccursOn(RUTINAS[0],ds)))).toEqual(['17:00','19:15','20:30']);expect(await page.evaluate(()=>rutOccursOn(RUTINAS[0],'2026-10-26'))).toBe(forward?'17:00':'18:00');expect(await page.evaluate(()=>rutOccursOn(RUTINAS[0],'2026-10-12'))).toBe('18:00');
 await page.reload();expect(await page.evaluate(()=>rutOccursOn(RUTINAS[0],'2026-10-20'))).toBe('19:15');
});
test('Wedding Moves diferencia clases y parejas y abre Todas por fecha de boda',async({page},info)=>{
 await page.evaluate(()=>{BODA_COUPLES=[{id:'late',name:'Pareja tardía',weddingDate:'2026-12-20',color:'#cc8844'},{id:'early',name:'Pareja anterior',weddingDate:'2026-10-01',color:'#cc4444'},{id:'none',name:'Sin fecha',color:'#cc7744'}];EVENTS=[{id:'cl',kind:'puntual',type:'Ensayos boda',title:'Ensayo',start:'2026-10-01',end:'2026-10-01',color:'#cc4444',boda:{coupleId:'early',time:'18:00'}}];EV_VIEW='bodas';BODA_SUBTAB='stats';BODA_PAREJAS_SEARCH='no coincide';BODA_PAREJAS_CLASSES='completas';openEventsAt();});await settled(page);
 await expect(page.locator('.boda-sec > .boda-stats-row:nth-child(-n+2) .boda-stat span')).toHaveText(['clases dadas','clases próximas','clases en total','clases / semana','clases / mes','parejas en total →']);await page.screenshot({path:info.outputPath('estadisticas-bodas.png')});await page.locator('#bodaStatsCouples').click();
 expect(await page.evaluate(()=>[BODA_SUBTAB,BODA_PAREJAS_FILTER,BODA_PAREJAS_CLASSES,BODA_PAREJAS_SORT,BODA_PAREJAS_SEARCH])).toEqual(['parejas','todas','','boda','']);await expect(page.locator('.boda-name')).toHaveText(['Pareja anterior','Pareja tardía','Sin fecha']);
});
test('Hipoteca solo en Detalle y alineada con suministros; Ahora ajusta ruedas sin crear alarma',async({page},info)=>{
 for(const fiscal of [false,true]){let top;
  for(const tab of fiscal?['resumen','detalle']:['resumen','detalle','gas','elect']){
   await page.evaluate(({fiscal,tab})=>{if(fiscal){FISCAL_TAB='despacho';FISCAL_HIP_SUB=tab;openFiscal(2026);}else openHousehold(tab);},{fiscal,tab});await settled(page);
   const host=page.locator(fiscal?'#fiscalOverlay':'#householdOverlay');if(tab==='resumen'){await expect(host.locator('#hipGoAnalisis')).toHaveCount(0);continue;}
   const button=host.locator(tab==='detalle'?'#hipGoAnalisis':'.energy-analysis-open');const rect=await button.boundingBox();if(top!==undefined)expect(rect.y).toBe(top);top=rect.y;await page.screenshot({path:info.outputPath('hogar-'+fiscal+'-'+tab+'.png')});
  }
 }
 await page.evaluate(()=>{document.querySelectorAll('.full-overlay').forEach(el=>{el.classList.remove('open');el.style.display='none';});});await page.locator('#alarmTestBtn').click();await page.locator('#alarmMsg').fill('Conservar');await page.locator('.alarm-day-btn').first().click();
 await page.clock.setFixedTime(new Date('2026-10-16T16:43:00+02:00'));await page.locator('#alarmNowBtn').click();await expect(page.locator('#drumHour .drum-selected')).toHaveText('16');await expect(page.locator('#drumMin .drum-selected')).toHaveText('43');await expect(page.locator('#alarmMsg')).toHaveValue('Conservar');await expect(page.locator('.alarm-day-btn.on')).toHaveCount(1);await expect(page.locator('#alarmPanel')).toHaveClass(/open/);await page.screenshot({path:info.outputPath('alarma-ahora.png')});
});
