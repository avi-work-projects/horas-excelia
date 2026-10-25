// Comparación aislada de v502/v503, con horas solo en los trayectos del fixture.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium,expect}=require('@playwright/test'),{startServer}=require('./serve.cjs');
const {setup,perform,measure}=require('./capture.cjs'),{scenes,edges}=require('./catalog.cjs');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/visual-map/review/evidence');
async function main(){
 fs.mkdirSync(out,{recursive:true});const server=await startServer(),url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
 try{
  for(const side of ['before','after']){
   // Interceptar antes de cargar la app, conservando preparación y fixture idénticos.
   const proxy={newContext:async options=>{const context=await browser.newContext(options),register=context.route.bind(context);
    context.route=async(...args)=>{await register(...args);
     if(side==='before')for(const file of ['js/events.js','js/events-cal.js','css/styles.css']){
      const content=execFileSync('git',['show','58e5ddf:'+file],{cwd:root,maxBuffer:4*1024*1024});
      await register('**/'+file,route=>route.fulfill({body:content,contentType:file.endsWith('.css')?'text/css':'text/javascript'}));
     }
    };
    return context;
   }};
   const {context,page,errors}=await setup(proxy,url);
   try{
    const scene=scenes.find(s=>s.id==='calendar');for(const action of scene.route)await perform(page,action);
    const colors=await page.evaluate(()=>['2026-09-01','2026-09-05'].map(ds=>getComputedStyle(document.querySelector('.ev-cell[data-ds="'+ds+'"]')).backgroundColor));
    if(side==='after')expect(colors[0]).toBe(colors[1]);else expect(colors[0]).not.toBe(colors[1]);
    const margins=await page.locator('.ev-multi-bar[data-id="map-trip"]').evaluate(el=>[el.style.marginLeft,el.style.marginRight]);
    expect(margins.every(Boolean)).toBe(side==='after');
    const result=await measure(page,scene,edges);fs.writeFileSync(path.join(out,side+'-calendar-v503.png'),result.png);
    if(errors.length)throw Error(errors.join('\n'));
   }finally{await context.close();}
  }
  console.log('Comparación v503: antes/después con ida 15:00, vuelta 10:00 y fines de semana fuera de agosto.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
