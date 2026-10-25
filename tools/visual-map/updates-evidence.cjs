// Comparativa v501/v502: imágenes históricas y perfiles aislados con el mismo fixture.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium,expect}=require('@playwright/test');
const {startServer}=require('./serve.cjs'),{setup,perform}=require('./generate.cjs');
const {scenes}=require('./catalog.cjs');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/visual-map/review'),ref='9706617';
const beforeOnly=process.argv.includes('--before');
const old=file=>execFileSync('git',['show',ref+':'+file],{cwd:root,maxBuffer:4*1024*1024});
const figures=[
 ['tasks','Mis tareas'],['tasks-selected','Tarea marcada al pulsar el texto'],['task-edit','Editor desde los tres puntos'],
 ['weddings','Añadir clase y pareja'],['wedding-stats','Resumen de Wedding Moves'],['wedding-stats-charts','Gráficos por período'],['wedding-stats-packs','Distribución y packs'],['wedding-stats-teachers','Profesores y repartos'],
 ['routine-stats','Resumen de rutinas'],['routine-stats-detail','Detalle e historial de una rutina'],['event-stats','Resumen de Próximos'],['event-stats-breakdown','Desglose de eventos'],['event-stats-links','Criterios y accesos a otras estadísticas']
];
function imageFile(id,side){return 'evidence/'+side+'-'+id+'-v502.png';}
async function historical(){
 for(const id of ['tasks','weddings','wedding-stats','routine-stats','event-stats'])fs.writeFileSync(path.join(out,imageFile(id,'before')),old('docs/visual-map/captures/'+id+'.png'));
 const scripts=['js/bodas-assign.js','js/bodas-config.js','js/rutinas.js','js/events-statistics.js'].map(p=>old(p).toString('utf8'));
 const css=old('css/styles.css').toString('utf8'),server=await startServer();let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  for(const [base,target,id]of [['wedding-stats','.boda-distribution','wedding-stats-packs'],['routine-stats','.rut-stat-card','routine-stats-detail'],['event-stats','.ev-stat-section','event-stats-breakdown']]){
   const {context,page,errors}=await setup(browser,'http://127.0.0.1:'+server.address().port);
   try{
    await page.evaluate(({scripts,css})=>{
     const saved={RUTINAS:RUTINAS,BODA_CONFIG:BODA_CONFIG};scripts.forEach(source=>(0,eval)(source));Object.assign(window,saved);
     document.querySelector('link[href="css/styles.css"]').remove();const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
    },{scripts,css});
    for(const action of scenes.find(s=>s.id===base).route)await perform(page,action);
    await perform(page,{scroll:target});await expect(page.locator('.stats-stack')).toHaveCount(0);
    await page.screenshot({path:path.join(out,imageFile(id,'before')),animations:'disabled'});
    if(errors.length)throw Error(errors.join('\n'));
   }finally{await context.close();}
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
 console.log('Antes v501 conservado: cinco capturas del commit y tres recorridos con su código histórico.');
}
function current(){
 const map=JSON.parse(fs.readFileSync(path.join(root,'docs/visual-map/map-data.json'),'utf8'));
 for(const [id]of figures){const scene=map.scenes.find(s=>s.id===id);if(!scene||!scene.fresh)throw Error('Actualizar la escena '+id);}
 for(const [id]of figures){const scene=map.scenes.find(s=>s.id===id);fs.copyFileSync(path.join(root,'docs/visual-map',scene.image),path.join(out,imageFile(id,'after')));}
 const cases=[
  ['tasks','Mis tareas: un tamaño de Recordatorios y una selección clara','Recordatorios comparte los 90 × 33 px de Ajustes. Fondo, texto y checkbox usan la misma acción; los tres puntos abren el editor. Se mantienen Mover, Deshacer, arrastre y elección de fechas anteriores.',['tasks','tasks-selected','task-edit']],
  ['weddings','Wedding Moves: acciones con un acento suave','Añadir clase y Añadir pareja usan el mismo fondo suave y tono de texto que la subpestaña activa, tanto en Clases como en Parejas. Guardar mantiene su jerarquía de confirmación.',['weddings']],
  ['wedding-stats','Wedding Moves: todas las estadísticas en tarjetas','El formato del resumen se extiende al ritmo, meses, semanas, distribución, extras por pack, profesores y repartos. Los ceros pertenecen al fixture ficticio; no representan los datos reales de Ángel.',['wedding-stats','wedding-stats-charts','wedding-stats-packs','wedding-stats-teachers']],
  ['routine-stats','Rutinas: resumen, actividad y detalle','Se reutilizan las mismas tarjetas con métricas, barras y notas. El cumplimiento conserva su fórmula y el historial mantiene los botones para corregir las sesiones.',['routine-stats','routine-stats-detail']],
  ['event-stats','Próximos: resumen y desglose del período','Filtros y año siguen arriba. Resumen, categorías, criterios y enlaces tienen el mismo marco. Se conservan los días únicos, fechas, recuentos y accesos a las otras estadísticas.',['event-stats','event-stats-breakdown','event-stats-links']]
 ];
 const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fig=(src,label)=>'<figure class="evidence"><figcaption>'+esc(label)+'</figcaption><button data-picture="'+src+'" data-label="'+esc(label)+'"><img loading="lazy" src="'+src+'" alt="'+esc(label)+'"></button></figure>';
 const articles=cases.map(([id,title,note,ids])=>{
  const pictures=[];for(const state of ids){const historical=imageFile(state,'before');if(fs.existsSync(path.join(out,historical)))pictures.push(fig(historical,'Antes · '+(figures.find(f=>f[0]===state)?.[1]||state)));pictures.push(fig(imageFile(state,'after'),'Después · '+figures.find(f=>f[0]===state)[1]));}
  return '<article class="finding" id="'+id+'"><h2>'+esc(title)+'</h2><p>'+esc(note)+'</p><div class="evidence-grid">'+pictures.join('')+'</div></article>';
 }).join('');
 fs.writeFileSync(path.join(out,'updates-v502.html'),'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gestify · Tareas y estadísticas v502</title><link rel="stylesheet" href="../viewer.css"><link rel="stylesheet" href="review.css"></head><body><header class="masthead"><div><span class="eyebrow">GESTIFY / AJUSTES SOLICITADOS</span><h1>Tareas y estadísticas.</h1><p>Un formato común, con las acciones y los cálculos de cada sección.</p></div><div class="edition"><b>25 octubre 2026 · v502</b><span>Antes: v501 · '+ref+'</span><span>Datos ficticios · Claro · Profesional</span></div></header><nav class="review-nav"><a href="../index.html">Mapa con capturas y flechas</a><a href="index.html">Revisión inicial</a>'+cases.map(c=>'<a href="#'+c[0]+'">'+esc(c[0]==='tasks'?'Mis tareas':c[0]==='weddings'?'Botones WM':c[0]==='wedding-stats'?'Estadísticas WM':c[0]==='routine-stats'?'Rutinas':'Próximos')+'</a>').join('')+'</nav><main class="review-main">'+articles+'</main><dialog id="picture"><form method="dialog"><button class="close-dialog" aria-label="Cerrar imagen">×</button></form><h2 id="pictureTitle"></h2><img id="pictureImage" alt=""></dialog><script>document.querySelectorAll("[data-picture]").forEach(b=>b.onclick=()=>{document.getElementById("pictureTitle").textContent=b.dataset.label;const i=document.getElementById("pictureImage");i.src=b.dataset.picture;i.alt=b.dataset.label;document.getElementById("picture").showModal();});</script></body></html>\n');
 console.log('Comparativa v502 generada: cinco casos y sus estados inferiores.');
}
(async()=>{if(beforeOnly)await historical();else current();})().catch(e=>{console.error(e);process.exitCode=1;});
