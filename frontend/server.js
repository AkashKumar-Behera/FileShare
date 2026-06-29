const { createServer } = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem')),
};

app.prepare().then(() => {
  const server = createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Proxy API and Media requests to Django backend on http://127.0.0.1:8000 to prevent iOS Safari Mixed Content errors
    if (pathname.startsWith('/api') || pathname.startsWith('/media')) {
      const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: 8000,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: '127.0.0.1:8000'
        }
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Backend server unavailable' }));
      });

      req.pipe(proxyReq, { end: true });
      return;
    }

    handle(req, res, parsedUrl);
  });

  // Proxy WebSocket connections to Django channels backend
  server.on('upgrade', (req, socket, head) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith('/ws')) {
      const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: 8000,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: '127.0.0.1:8000'
        }
      });

      proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
        socket.write('HTTP/1.1 101 Switching Protocols\r\n');
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          socket.write(`${key}: ${value}\r\n`);
        }
        socket.write('\r\n');

        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
      });

      proxyReq.on('error', (err) => {
        socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      });

      proxyReq.end();
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    const localIPs = [];
    for (const name of Object.keys(networkInterfaces)) {
      for (const iface of networkInterfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIPs.push(iface.address);
        }
      }
    }
    const ipList = localIPs.map(ip => `https://${ip}:${port}`).join(' and ');
    console.log(`> Ready on https://localhost:${port}${ipList ? ' and ' + ipList : ''}`);
  });
});
