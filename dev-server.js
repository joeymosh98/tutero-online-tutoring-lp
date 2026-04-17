// Simple local dev server — serves static files + proxies /api/ to serverless functions
var http = require('http');
var fs = require('fs');
var path = require('path');

// Load .env.local
var envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(function(line) {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    var eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq)] = line.slice(eq + 1);
  });
  console.log('Loaded .env.local');
}

var MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

var PORT = parseInt(process.argv[2] || '8084', 10);

http.createServer(async function(req, res) {
  var parsedUrl = new URL(req.url, 'http://localhost');
  var url = parsedUrl.pathname;

  // Log API requests
  if (url.startsWith('/api/')) console.log('[API]', req.method, url);

  // Handle API routes
  if (url.startsWith('/api/')) {
    var fnName = url.replace(/^\/api\//, '').replace(/\/$/, '');
    var fnPath = path.join(__dirname, 'api', fnName + '.js');
    if (!fs.existsSync(fnPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not found' }));
    }

    // Parse body for POST
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', async function() {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch(e) {
        req.body = {};
      }

      // Parse query params into req.query
      req.query = {};
      parsedUrl.searchParams.forEach(function(val, key) {
        req.query[key] = val;
      });

      // Create mock Vercel res object
      var statusCode = 200;
      var headers = {};
      var mockRes = {
        setHeader: function(k, v) { headers[k] = v; },
        status: function(code) { statusCode = code; return mockRes; },
        json: function(data) {
          headers['Content-Type'] = 'application/json';
          res.writeHead(statusCode, headers);
          res.end(JSON.stringify(data));
        },
        end: function(data) {
          res.writeHead(statusCode, headers);
          res.end(data || '');
        }
      };

      try {
        delete require.cache[require.resolve(fnPath)];
        var handler = require(fnPath);
        if (typeof handler === 'function') await handler(req, mockRes);
        else if (handler.default) await handler.default(req, mockRes);
      } catch(err) {
        console.error('Function error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // Static file serving
  var filePath = path.join(__dirname, url);

  // Directory -> try index.html
  if (url.endsWith('/')) filePath = path.join(filePath, 'index.html');
  else if (!path.extname(url)) {
    // Try with trailing slash (directory)
    var dirIndex = path.join(filePath, 'index.html');
    if (fs.existsSync(dirIndex)) filePath = dirIndex;
    // Try .html extension (cleanUrls)
    else if (fs.existsSync(filePath + '.html')) filePath = filePath + '.html';
  }

  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found: ' + url);
    }
    var ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, function() {
  console.log('Dev server running at http://localhost:' + PORT);
});
