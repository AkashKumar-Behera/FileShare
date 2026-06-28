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
  createServer(httpsOptions, (req, res) => {
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
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${port} and https://192.168.1.37:${port}`);
  });
});
