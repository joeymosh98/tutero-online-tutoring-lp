var https = require('https');
var fs = require('fs');
var path = require('path');

var FIGMA_MCP_URL = 'https://mcp.figma.com/mcp';
var QUEUE_PATH = path.join(__dirname, '..', 'ads', '.figma-queue.json');

// ── MCP JSON-RPC over HTTP ──

function mcpPost(body, token, sessionId) {
  return new Promise(function(resolve, reject) {
    var payload = JSON.stringify(body);
    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (sessionId) headers['mcp-session-id'] = sessionId;

    var url = new URL(FIGMA_MCP_URL);
    var req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: headers
    }, function(res) {
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() {
        var raw = Buffer.concat(chunks).toString();
        var sid = res.headers['mcp-session-id'] || sessionId;

        if (res.statusCode >= 400) {
          return reject({ status: res.statusCode, message: raw.slice(0, 500) });
        }

        var ct = res.headers['content-type'] || '';
        var parsed;
        if (ct.includes('text/event-stream')) {
          var lines = raw.split('\n');
          for (var i = lines.length - 1; i >= 0; i--) {
            if (lines[i].startsWith('data: ')) {
              try { parsed = JSON.parse(lines[i].slice(6)); break; } catch(e) {}
            }
          }
        } else {
          try { parsed = JSON.parse(raw); } catch(e) { parsed = { raw: raw.slice(0, 1000) }; }
        }

        resolve({ body: parsed, sessionId: sid, status: res.statusCode });
      });
    });
    req.on('error', function(err) { reject({ status: 0, message: err.message }); });
    req.setTimeout(30000, function() { req.destroy(); reject({ status: 0, message: 'timeout' }); });
    req.write(payload);
    req.end();
  });
}

function rpc(method, params, id) {
  var msg = { jsonrpc: '2.0', method: method };
  if (params !== undefined) msg.params = params;
  if (id !== undefined) msg.id = String(id);
  return msg;
}

async function mcpInit(token) {
  var res = await mcpPost(rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'tutero-ads', version: '1.0.0' }
  }, 1), token, null);

  var sid = res.sessionId;
  // Send initialized notification (fire and forget)
  mcpPost(rpc('notifications/initialized'), token, sid).catch(function() {});
  return { sessionId: sid, server: res.body };
}

async function mcpListTools(token, sid) {
  var res = await mcpPost(rpc('tools/list', {}, 2), token, sid);
  var r = res.body.result || res.body;
  return r.tools || [];
}

async function mcpCallTool(name, args, token, sid) {
  var res = await mcpPost(rpc('tools/call', { name: name, arguments: args }, 3), token, sid);
  return res.body.result || res.body;
}

// ── Queue helpers ──

function readQueue() {
  return fs.existsSync(QUEUE_PATH)
    ? JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))
    : { figma_url: '', items: [] };
}

function writeQueue(q) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(q, null, 2), 'utf8');
}

function queueAd(body) {
  var q = readQueue();
  if (body.figma_url) q.figma_url = body.figma_url;
  var exists = q.items.some(function(i) { return i.name === body.ad_name; });
  if (!exists) {
    q.items.push({
      name: body.ad_name,
      creative_file: body.creative_file || '',
      image: body.image || '',
      ad_data: body.ad_data || {},
      status: 'queued',
      queued_at: new Date().toISOString()
    });
    writeQueue(q);
  }
  return q;
}

// ── Build Figma content from creative HTML ──

function readCreativeHtml(creativePath) {
  if (!creativePath) return null;
  var fullPath = path.join(__dirname, '..', 'ads', creativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : null;
}

// ── Handler ──

module.exports = async function handler(req, res) {
  var token = process.env.FIGMA_ACCESS_TOKEN || null;

  // GET: discover MCP tools or return queue
  if (req.method === 'GET') {
    if (req.query && req.query.action === 'discover') {
      if (!token) return res.status(200).json({ connected: false, error: 'FIGMA_ACCESS_TOKEN not set in .env' });
      try {
        var session = await mcpInit(token);
        var tools = await mcpListTools(token, session.sessionId);
        return res.status(200).json({
          connected: true,
          tools: tools.map(function(t) { return { name: t.name, description: t.description }; }),
          server: session.server
        });
      } catch(err) {
        return res.status(200).json({ connected: false, error: err.message || JSON.stringify(err) });
      }
    }
    return res.status(200).json(readQueue());
  }

  // DELETE: clear queue
  if (req.method === 'DELETE') {
    try {
      var body = req.body || {};
      if (body.ad_name) {
        var q = readQueue();
        q.items = q.items.filter(function(i) { return i.name !== body.ad_name; });
        writeQueue(q);
      } else {
        if (fs.existsSync(QUEUE_PATH)) fs.unlinkSync(QUEUE_PATH);
      }
      return res.status(200).json({ success: true });
    } catch(e) {
      return res.status(500).json({ error: 'Failed to clear' });
    }
  }

  // POST: push ad to Figma
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  if (!body.ad_name) return res.status(400).json({ error: 'ad_name required' });
  if (!body.figma_url) return res.status(400).json({ error: 'figma_url required' });

  // Try direct MCP push if token is available
  if (token) {
    try {
      var session = await mcpInit(token);
      var tools = await mcpListTools(token, session.sessionId);
      var toolNames = tools.map(function(t) { return t.name; });

      // Find a write/create tool
      var writeTool = tools.find(function(t) {
        var n = (t.name || '').toLowerCase();
        return n.includes('write') || n.includes('create') || n.includes('canvas') || n.includes('design') || n.includes('generate');
      });

      if (writeTool) {
        // Read the creative HTML to send as content
        var html = readCreativeHtml(body.creative_file);
        var ad = body.ad_data || {};

        var result = await mcpCallTool(writeTool.name, {
          file_url: body.figma_url,
          content: 'Create native editable Figma elements from this ad creative. Frame: 1080x1350px.\n' +
            'Ad: ' + (ad.name || body.ad_name) + '\n' +
            (html ? '\nHTML source:\n' + html : '\nAd data: ' + JSON.stringify(ad))
        }, token, session.sessionId);

        return res.status(200).json({
          success: true,
          method: 'mcp_direct',
          tool: writeTool.name,
          result: result
        });
      }

      // No write tool — queue and report available tools
      var q = queueAd(body);
      return res.status(200).json({
        success: true,
        method: 'queued',
        message: 'MCP connected but no write tools found. Queued for Claude processing.',
        available_tools: toolNames,
        queued: q.items.length
      });
    } catch(err) {
      console.log('MCP direct push failed:', err.message || err);
      // Fall through to queue
    }
  }

  // Fallback: queue for Claude MCP processing
  var q = queueAd(body);
  return res.status(200).json({
    success: true,
    method: 'queued',
    queued: q.items.length,
    message: token
      ? 'MCP connection failed — queued for Claude processing'
      : 'No FIGMA_ACCESS_TOKEN — queued for Claude MCP processing'
  });
};
