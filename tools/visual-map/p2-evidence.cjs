// Evidencias de v499: conservar las comparativas históricas de v498.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../docs/visual-map');
const map=JSON.parse(fs.readFileSync(path.join(root,'map-data.json'),'utf8'));
const scenes={'birthday-after':'birthday-calendar','birthday-day-list-after':'birthday-day-list','couple-after':'couple-form','routine-after':'routine-new','dates-after':'dates','dates-overview-after':'dates-overview','energy-after':'energy-luz','settings-after':'settings'};
// Comprobar toda la edición antes de escribir: A09 fue retirado en v500.
for(const id of Object.values(scenes)){
 const scene=map.scenes.find(s=>s.id===id);
 if(!scene||!scene.fresh)throw Error('Extractor histórico de v499: falta '+id+'. Para el atlas actual usa p3-evidence.cjs.');
}
for(const [name,id]of Object.entries(scenes)){
 const scene=map.scenes.find(s=>s.id===id);
 fs.copyFileSync(path.join(root,scene.image),path.join(root,'review/evidence',name+'.png'));
}
console.log('Ocho capturas reales de los cinco P2, conservando la evidencia histórica.');
