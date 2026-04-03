// Vercel Serverless Function — Save CMS Config to Vercel Blob (Authenticated)
const setCors = require('./_cors');

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token || token !== process.env.CMS_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { config } = req.body || {};
  if (!config || !config.divisions) {
    return res.status(400).json({ error: 'Missing or invalid config' });
  }

  const blobKey = 'cms/landing-pages.json';

  try {
    if (process.env.VERCEL) {
      const blob = require('@vercel/blob');
      await blob.put(blobKey, JSON.stringify(config, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false
      });
    } else {
      const fs = require('fs');
      const path = require('path');
      const dir = path.join(process.cwd(), 'dev-cms');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'landing-pages.json'), JSON.stringify(config, null, 2));
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('CMS save error:', err);
    return res.status(500).json({ error: 'Failed to save' });
  }
};
