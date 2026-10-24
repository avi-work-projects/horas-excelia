const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
function startServer(port=0){
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
  const server=http.createServer((req,res)=>{
    let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
    const rel=pathname==='/'?'docs/visual-map/index.html':pathname.slice(1),file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)||rel.split(/[\\/]/).some(part=>part.startsWith('.')||part==='node_modules')){res.writeHead(403).end();return;}
    fs.readFile(file,(error,body)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(body);});
  });
  return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve(server)));
}
module.exports={startServer};
if(require.main===module)startServer(Number(process.env.VISUAL_MAP_PORT||8766)).then(server=>console.log('Mapa visual: http://127.0.0.1:'+server.address().port+'/docs/visual-map/index.html'));
