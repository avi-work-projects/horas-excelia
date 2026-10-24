// Diagnóstico de rutas durante el mantenimiento del catálogo, con el mismo perfil aislado.
const fs=require('node:fs'),path=require('node:path');const {chromium}=require('@playwright/test');
const {setup,perform}=require('./generate.cjs'),{startServer}=require('./serve.cjs'),{scenes,edges}=require('./catalog.cjs');
(async()=>{
 const server=await startServer(),url='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({channel:'msedge',headless:true});
 const ids=process.argv[2]?.split(','),selected=scenes.filter(s=>!ids||ids.includes(s.id)),failures=[];let cursor=0;
 try{await Promise.all(Array.from({length:3},async()=>{while(cursor<selected.length){const s=selected[cursor++],r=await setup(browser,url);r.page.setDefaultTimeout(1300);try{
   for(const action of s.route)await perform(r.page,action);await r.page.locator(s.ready).first().waitFor({state:'visible',timeout:1500});
   const off=[];for(const e of edges.filter(e=>e.from===s.id)){const b=await r.page.locator(e.selector).first().boundingBox().catch(()=>null);if(e.action!=='scroll'&&(!b||b.y<0||b.y+b.height>880||b.x<0||b.x+b.width>401))off.push(e.to+': '+e.selector);}
   if(off.length)throw Error('ORIGEN: '+off.join(' | '));console.log('OK '+s.id);
 }catch(e){const controls=await r.page.locator('button,input,select,[data-hipsub],[data-bsub],[data-rsub]').evaluateAll(els=>els.filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height;}).map(el=>({id:el.id,text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,65),data:Object.fromEntries(Object.entries(el.dataset)),class:el.className})));failures.push({id:s.id,error:e.message.split('\n').slice(0,6).join('\n'),controls});console.log('FALLO '+s.id+' '+e.message.split('\n')[0]);}finally{await r.context.close();}}}));
 fs.mkdirSync(path.join(__dirname,'../../test-results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../../test-results/map-errors.json'),JSON.stringify(failures,null,2));console.log('RESULTADO '+selected.length+' rutas, '+failures.length+' pendientes');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
