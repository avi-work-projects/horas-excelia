// Evidencias y maquetas documentales en un perfil ficticio; no modifica fuentes de la PWA.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('@playwright/test');
const {setup,perform,settle}=require('./generate.cjs'),{startServer}=require('./serve.cjs'),{scenes}=require('./catalog.cjs');
const out=path.resolve(__dirname,'../../docs/visual-map/review/evidence');
const bell='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>';
async function main(){
  fs.mkdirSync(out,{recursive:true});const server=await startServer(),url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({channel:'msedge',headless:true}),metrics={};
  async function visit(id,fn,prepare){
    const state=await setup(browser,url);try{if(prepare)await prepare(state.page);for(const a of scenes.find(s=>s.id===id).route)await perform(state.page,a);await fn(state.page);if(state.errors.length)throw Error(state.errors.join('\n'));}finally{await state.context.close();}
  }
  async function shot(page,name){await settle(page);await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});}
  try{
    await visit('day',async page=>{
      metrics.alarmButton=await page.locator('#evDAlarm').boundingBox();
      await page.locator('#evDAlarm').evaluate(el=>el.remove());
      await page.locator('.ev-detail-facts').evaluate((el,bell)=>el.insertAdjacentHTML('afterend','<button class="audit-alarm-access" style="display:flex;align-items:center;gap:12px;width:100%;padding:13px;margin:12px 0;border:1px solid #ccd7e7;border-radius:12px;background:#f7f9fc;color:#344c6a;text-align:left">'+bell+'<span style="flex:1"><strong style="display:block;font-size:14px">Alarma</strong><small style="display:block;font-size:12px;margin-top:3px;color:#697386">Sin configurar</small></span><span style="font-size:12px;font-weight:600">Configurar ›</span></button>'),bell);
      await page.locator('.ev-car-sheet').evaluate(el=>{el.style.height='64dvh';el.style.minHeight='64dvh';});
      await shot(page,'alarm-proposal');
    });
    await visit('day',async page=>{
      metrics.startedAlarm=await page.locator('#evDAlarm').isVisible();metrics.startedTime=await page.locator('.ev-detail-facts').innerText();await shot(page,'alarm-started-current');
    },page=>page.evaluate(()=>{EVENTS.find(e=>e.id==='map-demo').time='08:00';EVENTS.find(e=>e.id==='map-demo').endTime='09:00';}));
    await visit('calendar',async page=>{
      await shot(page,'large-calendar-current');await page.locator('[data-id="map-trip"]').first().click();await settle(page);await shot(page,'large-detail-current');
      await page.locator('.ev-detail-facts').evaluate(el=>el.innerHTML='<div style="font-size:12px;color:#687389">Estancia</div><div style="font-weight:700;font-size:18px;margin:5px 0 12px">24–28 agosto 2026</div><div style="border-top:1px solid #d9dcea;padding-top:10px;font-size:13px"><b>Inicio del evento</b><span style="float:right">Lun 24 · 15:00</span></div><div style="display:grid;gap:9px;margin-top:12px"><div style="background:#f3f6fa;padding:12px;border-radius:10px"><b>Ida · lun 24</b><strong style="float:right">15:00</strong><div style="font-size:12px;margin-top:5px;color:#667284">Coche · conductor de ejemplo</div></div><div style="background:#f3f6fa;padding:12px;border-radius:10px"><b>Vuelta · vie 28</b><strong style="float:right">10:00</strong><div style="font-size:12px;margin-top:5px;color:#667284">Tren · hora de salida</div></div></div>');
      await page.locator('.ev-detail-facts').evaluate(el=>{el.style.padding='12px';});
      await shot(page,'large-detail-proposal');
    },page=>page.evaluate(()=>{const e=EVENTS.find(e=>e.id==='map-trip');e.time='15:00';e.note='Estancia de ejemplo. Los horarios de transporte son salidas, no llegadas.';e.viaje={ida:{time:'15:00',modo:'coche',conductor:'conductor de ejemplo'},vuelta:{time:'10:00',modo:'tren'}};}));
    await visit('routine-recoveries',async page=>{
      await perform(page,'[data-recover-origin]');await perform(page,'.rut-dpick-real .ev-cell[data-ds="2026-08-04"]');await perform(page,'#rutRecoveryConfirm');
      const before=await page.evaluate(()=>JSON.stringify(localStorage));await page.locator('#rutExtraSave').click();await page.waitForTimeout(100);metrics.recoveryEarlier=await page.locator('.toast').innerText().catch(()=>page.locator('body').innerText());
      if(before!==await page.evaluate(()=>JSON.stringify(localStorage)))throw Error('La reproducción de rechazo no debe escribir datos');await shot(page,'recovery-earlier-current');
    });
    await visit('wedding-class',async page=>{
      metrics.fab=await page.locator('#tasksFab').boundingBox();metrics.classSave=await page.locator('#bodaFormSave').boundingBox().catch(()=>null);
      metrics.fabHit=await page.locator('#tasksFab').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+10,r.y+10).closest('button').id;});
    });
    await visit('couple-form',async page=>{metrics.coupleSave=await page.locator('#bodaCSave').boundingBox();});
    await visit('routine-new',async page=>{metrics.routineSave=await page.locator('#rutFSave').boundingBox().catch(()=>null);});
    await visit('dates',async page=>{metrics.multidayCell=await page.locator('.dp-day[data-ds]').first().boundingBox().catch(()=>page.locator('.dp-day:not(.out)').first().boundingBox());});
    fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify(metrics,null,2)+'\n');console.log(JSON.stringify(metrics,null,2));
  }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
