const http = require('http');
const fs = require('fs');
const path = require('path');
const base = 'C:/Users/Alex/personal-website';
http.createServer((req, res) => {
  const filePath = path.join(base, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); }
    else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(data); }
  });
}).listen(3000);
