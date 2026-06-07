const http = require('http');
const fs = require('fs');
const path = require('path');
const docs = path.resolve('D:/Claude/gitboost/docs');
http.createServer((req, res) => {
  let url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  let file = path.resolve(path.join(docs, '.' + url.replace(/^\//, '')));
  if (!file.startsWith(docs)) { res.writeHead(403); res.end('403'); return; }
  try {
    const data = fs.readFileSync(file);
    const types = {'.html':'text/html;charset=utf-8','.css':'text/css','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml','.xml':'text/xml'};
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'text/plain'});
    res.end(data);
  } catch(e) {
    try { res.writeHead(404,{'Content-Type':'text/html'}); res.end(fs.readFileSync(path.join(docs,'404.html'))); }
    catch(e2) { res.writeHead(404); res.end('Not Found'); }
  }
}).listen(3456, () => console.log('GitBoost server running on port 3456'));
