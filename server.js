const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.json':'application/json','.png':'image/png','.ico':'image/x-icon',
  '.svg':'image/svg+xml','.webmanifest':'application/manifest+json'
};
http.createServer((req, res) => {
  let p = path.join(ROOT, req.url === '/' ? '/index.html' : req.url);
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': MIME[path.extname(p)] || 'text/plain'});
    res.end(data);
  });
}).listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
