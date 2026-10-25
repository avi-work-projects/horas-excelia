// Evidencias de v500; las comparativas de v498/v499 se conservan como historia.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../docs/visual-map');
const map=JSON.parse(fs.readFileSync(path.join(root,'map-data.json'),'utf8'));
const compact=process.argv.includes('--settings-v501');
if(!compact&&!fs.readFileSync(path.resolve(root,'../../js/core.js'),'utf8').includes("APP_VERSION = 'v500"))throw Error('Extractor histórico de v500. Para el ajuste de v501 usa --settings-v501.');
const scenes=compact?{'settings-v501':'settings'}:{'study-v500':'study','fiscal-expenses-v500':'fiscal-expenses','energy-gas-costes-v500':'energy-gas-costes','energy-luz-costes-v500':'energy-luz-costes','energy-gas-costes-neto-v500':'energy-gas-costes-neto','settings-v500':'settings','dates-restored-v500':'dates'};
for(const [name,id]of Object.entries(scenes)){
 const scene=map.scenes.find(s=>s.id===id);
 if(!scene||!scene.fresh)throw Error('Regenerar antes la escena '+id);
 fs.copyFileSync(path.join(root,scene.image),path.join(root,'review/evidence',name+'.png'));
}
console.log(compact?'Captura de Ajustes v501; conservadas las evidencias anteriores.':'Siete capturas de v500, conservando las evidencias históricas.');
