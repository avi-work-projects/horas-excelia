const fs=require('fs'),path=require('path');
const root=fs.realpathSync('.'),out=path.resolve(root,'dist');
if(path.dirname(out)!==root||path.basename(out)!=='dist')throw new Error('Destino de publicacion no valido');
if(fs.existsSync(out)&&fs.lstatSync(out).isSymbolicLink())throw new Error('dist no puede ser un enlace');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','manifest.json','sw.js','css','js',...fs.readdirSync('.').filter(n=>/\.png$/.test(n))])fs.cpSync(name,path.join(out,name),{recursive:true});
console.log('Publicacion preparada sin backups, documentacion ni pruebas');
