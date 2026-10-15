const {test,expect}=require('@playwright/test');
const {PNG}=require('../../node_modules/playwright-core/lib/utilsBundle.js');
test.beforeEach(async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-15T12:00:00+02:00'));
 await page.addInitScript(()=>{sessionStorage.setItem('excelia-popup-dismissed','1');localStorage.setItem('excelia-theme-v1','light');localStorage.setItem('excelia-nav-icons-v1','professional');});
 await page.goto('/');
});
async function settled(page){await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});}
test('Agenda: un separador, cabeceras redondeadas opacas y Hoy con formato de Inicio',async({page},info)=>{
 await page.evaluate(()=>{EVENTS=[{id:'trip',kind:'grande',type:'Asturias',title:'Viaje de prueba',start:'2026-09-30',end:'2026-10-20',color:'#1d4ed8'},{id:'day',kind:'puntual',type:'Comida',title:'Comida de prueba',start:'2026-10-03',end:'2026-10-03',color:'#ff9933'}];EV_VIEW='week';EV_MONTH=9;EV_YEAR=2026;openEventsAt();});await settled(page);
 const home=await page.locator('#todayBtn').evaluate(el=>{const s=getComputedStyle(el);return [s.fontSize,s.padding,s.borderRadius];});
 const today=page.locator('#evToday');expect(await today.evaluate(el=>{const s=getComputedStyle(el);return [s.fontSize,s.padding,s.borderRadius];})).toEqual(home);
 expect(await today.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
 for(const top of [0,110,480,980]){
  await page.locator('.ev-wk-body').evaluate((el,top)=>el.scrollTop=top,top);
  await settled(page);
  const tabs=await page.locator('.ev-upcoming-tabs').boundingBox();
  const pixels=PNG.sync.read(await page.screenshot({clip:{x:tabs.x,y:tabs.y+tabs.height,width:tabs.width,height:16}}));
  const bg=await page.locator('.ev-wk-body').evaluate(el=>{const span=document.createElement('span');span.style.color='var(--bg)';el.append(span);const rgb=getComputedStyle(span).color.match(/\d+/g).map(Number);span.remove();return rgb;});
  for(const x of [1,pixels.width-2])expect([...pixels.data.slice((pixels.width+x)*4,(pixels.width+x)*4+3)]).toEqual(bg);
  await page.screenshot({path:info.outputPath('agenda-'+top+'.png')});
 }
 const sep=page.locator('#ev-wk-month-2026-10');await expect(sep).toHaveCSS('border-top-width','0px');
 expect(await sep.evaluate(el=>getComputedStyle(el,'::before').borderTopLeftRadius)).toBe('16px');
 expect(await sep.evaluate(el=>getComputedStyle(el,'::before').borderTopRightRadius)).toBe('16px');
 await page.setViewportSize({width:360,height:800});await settled(page);
 expect(await page.locator('#eventsContent>.sy-header').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
 await page.screenshot({path:info.outputPath('agenda-360.png')});
});
test('Peluquería: pestañas estables, cancelar, guardar, notas actuales en la ficha y backup',async({page},info)=>{
 await page.evaluate(()=>{appStorage.setItem(PERSONAL_NOTES_KEY,'Nota general existente');openPersonalNotes();});await settled(page);
 const panel=page.locator('#personalNotesOv .settings-editor-sheet'),before=await panel.boundingBox();
 await page.getByRole('tab',{name:'Peluquería',exact:true}).click();await expect(page.locator('#hairdresserNoteText')).toHaveAttribute('readonly','');
 expect(await panel.boundingBox()).toEqual(before);
 await page.locator('#personalNotesEdit').click();await page.locator('#hairdresserNoteText').fill('Borrador descartado');await page.getByRole('tab',{name:'General',exact:true}).click();await page.locator('#personalNoteText').fill('Cambio descartado');await page.locator('#personalNotesCancel').click();await expect(page.locator('#personalNoteText')).toHaveValue('Nota general existente');
 await page.getByRole('tab',{name:'Peluquería',exact:true}).click();await expect(page.locator('#hairdresserNoteText')).toHaveValue('');
 await page.locator('#personalNotesEdit').click();await page.locator('#hairdresserNoteText').fill('Laterales cortos.\nArriba con tijera, sin cortar demasiado.');await page.locator('#personalNotesSave').click();
 await expect(page.locator('#hairdresserNoteText')).toHaveAttribute('readonly','');await settled(page);await page.screenshot({path:info.outputPath('notas-peluqueria.png')});
 await page.locator('#personalNotesClose').click();await expect(page.locator('#personalNotesWrap')).toHaveCount(0);
 await page.reload();
 await page.locator('#eventsBtn').click();await settled(page);
 await page.evaluate(()=>{EVENTS=[{id:'haircut',kind:'puntual',type:'Peluquería',title:'Corte de pelo',start:'2026-10-15',end:'2026-10-15',color:'#8b5e34',note:'Reservado para las 17:00'},{id:'other',kind:'puntual',type:'Dentista',title:'Revisión',start:'2026-10-15',end:'2026-10-15',color:'#38a38b'}];openEvDayCarousel('2026-10-15','haircut');});
 await expect(page.locator('.ev-hairdresser-note')).toContainText('Laterales cortos.\nArriba con tijera');await expect(page.locator('.ev-detail-body')).toContainText('Reservado para las 17:00');await settled(page);await page.screenshot({path:info.outputPath('evento-peluqueria.png')});
 await page.locator('.ev-car-content').evaluate(el=>el.scrollTop=el.scrollHeight);
 await expect(page.locator('.ev-hairdresser-note')).toBeInViewport();await page.screenshot({path:info.outputPath('evento-instrucciones.png')});
 await page.locator('#evCarNext').click();await expect(page.locator('.ev-hairdresser-note')).toHaveCount(0);
 await page.locator('#evDClose').click();await expect(page.locator('#evDetailOv')).toHaveCount(0);
 await page.locator('#evBack').click();await expect(page.locator('#eventsOverlay')).toBeHidden();
 await page.locator('#menuBtn').click();await page.locator('#exportAllBtn').click();
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-export-mode=save]').click()]);
 const backup=JSON.parse(require('fs').readFileSync(await download.path(),'utf8'));
 expect(backup.hairdresserNotes).toContain('Laterales cortos.');expect(backup.personalNotes).toBe('Nota general existente');
 await page.evaluate(data=>{appStorage.removeItem(HAIRDRESSER_NOTES_KEY);applyFullImport(data,'replace');},backup);
 expect(await page.evaluate(()=>hairdresserNote())).toBe(backup.hairdresserNotes);
 await page.locator('#eventsBtn').click();await settled(page);
 await page.evaluate(()=>{appStorage.setItem(HAIRDRESSER_NOTES_KEY,'Instrucciones actualizadas');openEvDayCarousel('2026-10-15','haircut');});
 await expect(page.locator('.ev-hairdresser-note')).toContainText('Instrucciones actualizadas');
});
