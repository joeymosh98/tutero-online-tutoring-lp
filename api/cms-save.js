// Vercel Serverless Function — Save CMS Config to Vercel Blob (Authenticated)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth check
  var authHeader = req.headers['authorization'] || '';
  var token = authHeader.replace('Bearer ', '');
  if (!token || token !== process.env.CMS_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  var body = req.body || {};
  if (!body.config || !body.config.divisions) {
    return res.status(400).json({ error: 'Missing or invalid config' });
  }

  var blobKey = 'cms/landing-pages.json';

  try {
    if (process.env.VERCEL) {
      var blob = require('@vercel/blob');
      await blob.put(blobKey, JSON.stringify(body.config, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false
      });
    } else {
      // Local dev: write to ./dev-cms/
      var fs = require('fs');
      var path = require('path');
      var dir = path.join(process.cwd(), 'dev-cms');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'landing-pages.json'), JSON.stringify(body.config, null, 2));
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('CMS save error:', err);
    return res.status(500).json({ error: 'Failed to save' });
  }
};
