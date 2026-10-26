// Capturas documentales aisladas. Nunca abre el perfil del usuario ni publica la app.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process');
const {chromium,expect}=require('@playwright/test');
const {setup,perform,settle,measure,VIEWPORT,DATE}=require('./capture.cjs');
const {scenes,edges,sections}=require('./catalog.cjs');
const {createTracker,retainReview,importHistoricalReview,sameMapContent,digest}=require('./tracking.cjs');
const {writeAtomically}=require('./files.cjs');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'docs/visual-map');
const options=process.argv.slice(2),only=options.find(x=>x.startsWith('--scene='))?.slice(8);
let referenceCommit;
const sha=()=>referenceCommit||(referenceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim());
const tracker=createTracker({root:ROOT,scenes,edges,assets:require('../../app-assets.json')});
const dependencies=scene=>tracker.dependencies(scene);
function census(){
  const openers=[];
  for(const file of fs.readdirSync(path.join(ROOT,'js')).filter(x=>x.endsWith('.js'))){
    fs.readFileSync(path.join(ROOT,'js',file),'utf8').split(/\r?\n/).forEach((line,i)=>{
      const match=line.match(/^function\s+(open\w+|toggleSettingsMenu|toggleAlarmPanel|askImportMode)\(/);
      if(match)openers.push({symbol:match[1],file:'js/'+file,line:i+1});
    });
  }
  return openers;
}
function inventory(captures){
  const result=[];
  for(const [group,titles,file]of sections)for(const title of titles.split('|'))result.push({group,title,file,status:'Pendiente de captura'});
  const aliases={home:'Jornada y horas del mes',household:'Resumen del hogar',study:'Comparar escenarios',events:'Próximos',economics:'Resumen económico',calendar:'Calendario 1 mes',day:'Ficha del día',edit:'Editar evento',time:'Elegir hora'};
  const canonical=g=>g==='Fiscal'?'Economía':g.startsWith('Energía')?'Energía':g;
  const coverage={'Eventos|Exportar calendario':'calendar-export','Eventos|Detalle evento':'day','Eventos|Asignar sesión de rutina':'routine-extra-day','Bodas|Catálogos de bodas':'wedding-pack','Cumpleaños|Selector de día o mes':'birthday-day','Economía|Configuración fiscal':'fiscal','Energía|Editor de tarifa':'energy-tariff','Ajustes|Previsualización de importación':'import-preview','Ajustes|Añadir o reemplazar al importar':'import-preview','Ajustes|Tareas pendientes y completadas':'tasks'};
  for(const row of result){const id=coverage[row.group+'|'+row.title];if(id){row.scene=id;row.status='Capturada · sin revisar';}if(row.title.startsWith('Archivo de ')){row.status='Sin entrada visible';row.note='Existe la función de archivo en código, pero la versión actual no presenta un botón ni pestaña que la abra. No se ha inventado un acceso.';}}
  for(const scene of scenes){const match=result.find(x=>x.group===canonical(scene.group)&&x.title===(aliases[scene.id]||scene.title));if(match){match.scene=scene.id;match.status='Capturada · sin revisar';}else if(!result.some(x=>x.scene===scene.id))result.push({group:canonical(scene.group),title:scene.title,file:scene.sources[0],scene:scene.id,status:'Capturada · sin revisar'});}
  result.push({group:'Ajustes',title:'Selectores nativos y aplicaciones externas',status:'Límite del atlas',note:'Los selectores de fecha, archivo y carpeta y el destino de compartir/correo pertenecen al navegador o al sistema. Se captura el control y el panel de la app hasta ese límite.'});
  return result.map(x=>x.scene?(!captures[x.scene]?{...x,status:'Pendiente de captura',scene:undefined}:{...x,status:'Capturada · '+captures[x.scene].review}):x);
}
function assemble(captures){
  return {schemaVersion:2,title:'Gestify · mapa visual',generatedAt:new Date().toISOString(),referenceCommit:sha(),date:DATE,viewport:VIEWPORT,theme:'light',icons:'professional',scope:'Atlas de las secciones de la app y sus paneles secundarios, con capturas reales y recorridos comprobados. Estados condicionales y selectores nativos se identifican en el inventario.',scenes:scenes.map(s=>({...s,...captures[s.id],fresh:tracker.fresh(s,captures[s.id]),route:s.route})),edges,inventory:inventory(captures),openers:census()};
}
function writeData(captures){
  const data=assemble(captures);fs.mkdirSync(OUT,{recursive:true});
  try{const previous=JSON.parse(fs.readFileSync(path.join(OUT,'map-data.json'),'utf8'));if(sameMapContent(data,previous))return;}catch(error){if(error.code!=='ENOENT')throw error;}
  writeAtomically(path.join(OUT,'map-data.json'),JSON.stringify(data,null,2)+'\n');
  writeAtomically(path.join(OUT,'map-data.js'),'window.VISUAL_MAP = '+JSON.stringify(data).replace(/</g,'\\u003c')+';\n');
}
function currentData(){try{return JSON.parse(fs.readFileSync(path.join(OUT,'map-data.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;return {scenes:[],edges:[]};}}
function currentCaptures(data=currentData()){
  const fields=['image','imageHash','anchors','entryBox','dependencies','dependencyVersion','commit','review','reviewHistory','reviewEvidence','verifiedEdges'];
  return Object.fromEntries(data.scenes.filter(s=>s.image).map(s=>[s.id,Object.fromEntries(fields.filter(f=>s[f]!==undefined).map(f=>[f,s[f]]))]));
}
const stale=captures=>scenes.filter(s=>!tracker.fresh(s,captures[s.id])||!captures[s.id]?.image||!fs.existsSync(path.join(OUT,captures[s.id].image))).map(s=>s.id);
async function main(){
  const oldData=currentData(),captures=currentCaptures(oldData);
  if(options.includes('--migrate')){
    const coverage=JSON.parse(fs.readFileSync(path.join(OUT,'review/coverage.json'),'utf8'));
    const migrated={};
    for(const scene of scenes){
      let capture=tracker.migrate(scene,captures[scene.id],oldData);
      capture.imageHash=digest(fs.readFileSync(path.join(OUT,capture.image)));
      capture=importHistoricalReview(capture,coverage.screens.find(s=>s.id===scene.id),coverage);
      migrated[scene.id]=capture;
    }
    writeData(migrated);console.log('Migradas '+scenes.length+' capturas sin regenerarlas; revisión histórica conservada solo cuando coincide la imagen.');return;
  }
  if(options.includes('--index')){writeData(captures);console.log('Índice actualizado; las capturas antiguas se señalan como pendientes.');return;}
  if(options.includes('--check')){const pending=stale(captures);console.log(pending.length?'Pendientes de actualizar: '+pending.join(', '):'Las '+scenes.length+' capturas corresponden a sus fuentes.');process.exitCode=pending.length?1:0;return;}
  if(options.includes('--plan')){const pending=stale(captures);console.log(JSON.stringify({scenes:pending,count:pending.length,total:scenes.length,...tracker.stats},null,2));return;}
  const ids=only?.split(',');if(ids)for(const id of ids)if(!scenes.some(s=>s.id===id))throw new Error('Escena desconocida: '+id);
  const pending=options.includes('--changed')?new Set(stale(captures)):null;
  const selected=ids?scenes.filter(s=>ids.includes(s.id)):pending?scenes.filter(s=>pending.has(s.id)):scenes;
  for(const s of selected)dependencies(s);
  if(!selected.length){writeData(captures);console.log('No hay escenas pendientes.');return;}
  fs.mkdirSync(path.join(OUT,'captures'),{recursive:true});
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
  const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://local').pathname),file=path.resolve(ROOT,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
  let browser;
  try{
    browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
    let cursor=0;const failures=[];
    await Promise.all(Array.from({length:3},async()=>{while(cursor<selected.length){const scene=selected[cursor++];
      const {context,page,errors}=await setup(browser,url);
      page.setDefaultTimeout(3500);
      try{
        for(const action of scene.route)await perform(page,action);
        const {anchors,entryBox,png}=await measure(page,scene,edges),image='captures/'+scene.id+'.png',imageHash=digest(png);
        const outgoing=edges.filter(e=>e.from===scene.id);
        if(captures[scene.id]&&!captures[scene.id].imageHash)captures[scene.id].imageHash=digest(fs.readFileSync(path.join(OUT,image)));
        // Las rutas hijas reproducen la transición al capturarse. Los regresos requieren otra ejecución.
        const verifiedEdges=[];
        for(const edge of outgoing){
          const target=scenes.find(s=>s.id===edge.to);
          if(target.route.length===scene.route.length+1&&JSON.stringify(target.route.slice(0,-1))===JSON.stringify(scene.route))continue;
          const check=await setup(browser,url);
          try{
            for(const action of scene.route)await perform(check.page,action);
            await perform(check.page,edge.step||(edge.action==='scroll'?target.route.at(-1):edge.selector));
            await expect(check.page.locator(target.ready).first()).toBeVisible();
            if(edge.view==='return')await expect(check.page.locator(scene.ready).first()).not.toBeVisible();
            if(check.errors.length)throw new Error(check.errors.join('\n'));verifiedEdges.push(edge.to);
          }finally{await check.context.close();}
        }
        if(errors.length)throw new Error(errors.join('\n'));
        const previous=captures[scene.id];
        if(previous&&previous.imageHash!==imageHash&&previous.review!=='Sin revisar'){
          const archive='captures/reviewed/'+previous.imageHash+'.png';fs.mkdirSync(path.join(OUT,'captures/reviewed'),{recursive:true});
          writeAtomically(path.join(OUT,archive),fs.readFileSync(path.join(OUT,previous.image)));previous.reviewImage=archive;
        }
        writeAtomically(path.join(OUT,image),png);
        captures[scene.id]=retainReview(captures[scene.id],{image,anchors,entryBox,dependencies:dependencies(scene),dependencyVersion:2,commit:sha(),verifiedEdges},imageHash);
        if(Object.keys(captures).length&&selected.indexOf(scene)%10===0)writeData(captures);
        console.log('Comprobada: '+scene.id+' · '+captures[scene.id].review);
      }catch(error){failures.push(scene.id+': '+error.message);console.error('FALLO '+scene.id+': '+error.message.split('\n')[0]);}finally{await context.close();}
    }}));
    for(const edge of edges){const s=scenes.find(s=>s.id===edge.from),t=scenes.find(s=>s.id===edge.to),c=captures[s.id];if(c&&captures[t.id]&&!failures.some(x=>x.startsWith(t.id+':')||x.startsWith(s.id+':'))&&t.route.length===s.route.length+1&&JSON.stringify(t.route.slice(0,-1))===JSON.stringify(s.route)&&!c.verifiedEdges.includes(t.id))c.verifiedEdges.push(t.id);}
    writeData(captures);
    if(failures.length)throw Error(failures.join('\n'));
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
module.exports={setup,perform,settle};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
