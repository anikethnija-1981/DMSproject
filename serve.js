const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, HOST, () => {
  const ips = getLocalIpAddresses();
  console.log('\n==================================================');
  console.log('🚀 BFS & DFS PLATFORM SERVER RUNNING (BOUND TO 0.0.0.0)');
  console.log('==================================================');
  console.log(`💻 Local Computer:   http://localhost:${PORT}`);
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(`📱 Mobile / Wi-Fi LAN: http://${ip}:${PORT}`);
    });
  } else {
    console.log(`📱 Mobile / Wi-Fi LAN: http://192.168.x.x:${PORT}`);
  }
  console.log('--------------------------------------------------');
  console.log('🌍 Public Internet HTTPS Access (via Cloudflare / ngrok):');
  console.log(`   npx cloudflared tunnel --url http://localhost:${PORT}`);
  console.log(`   OR: npx localtunnel --port ${PORT}`);
  console.log('==================================================\n');
});
