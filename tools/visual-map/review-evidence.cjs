// Evidencia posterior: copias de capturas reales del atlas, nunca maquetas ni datos personales.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../docs/visual-map'),out=path.join(root,'review/evidence');
const scenes={'wedding-class-after':'wedding-class','alarm-started-after':'started-detail','recovery-earlier-after':'routine-earlier-saved','alarm-after':'day','large-detail-after':'large-detail','large-calendar-after':'calendar'};
const map=JSON.parse(fs.readFileSync(path.join(root,'map-data.json'),'utf8'));
for(const [name,id]of Object.entries(scenes)){
 const scene=map.scenes.find(s=>s.id===id);if(!scene||!scene.fresh)throw Error('Regenerar antes la escena '+id);
 fs.copyFileSync(path.join(root,scene.image),path.join(out,name+'.png'));
}
// Ampliación de la recuperación: desplazar el histórico hasta los días vinculados,
// sin cambiar el estado que la app acaba de guardar.
async function recoveryEvidence(){
 const {chromium,expect}=require('@playwright/test');
 const {setup,perform,settle}=require('./generate.cjs'),{startServer}=require('./serve.cjs'),{scenes}=require('./catalog.cjs');
 const server=await startServer(),browser=await chromium.launch({channel:'msedge',headless:true});
 let state;
 try{
  state=await setup(browser,'http://127.0.0.1:'+server.address().port);
  for(const action of scenes.find(s=>s.id==='routine-earlier-saved').route)await perform(state.page,action);
  await expect(state.page.locator('.toast')).not.toHaveClass(/\bshow\b/,{timeout:12000});
  await state.page.locator('[data-history-date="2026-08-04"]').first().scrollIntoViewIfNeeded();await settle(state.page);
  await expect(state.page.locator('[data-history-date="2026-08-04"]').first()).toContainText('Recuperada de 05/08/2026');
  await state.page.screenshot({path:path.join(out,'recovery-earlier-after.png'),animations:'disabled'});
  if(state.errors.length)throw Error(state.errors.join('\n'));
  console.log('Seis resultados reales y recuperación anterior visible, junto a la evidencia histórica.');
 }finally{if(state)await state.context.close();await browser.close();await new Promise(r=>server.close(r));}
}
recoveryEvidence().catch(error=>{console.error(error);process.exitCode=1;});
