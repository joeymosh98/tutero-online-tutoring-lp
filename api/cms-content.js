// Vercel Serverless Function — Read CMS Config from Vercel Blob

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  var key = (req.query && req.query.key) || 'landing-pages';
  var blobKey = 'cms/' + key + '.json';

  try {
    if (process.env.VERCEL) {
      var blob = require('@vercel/blob');
      var blobs = await blob.list({ prefix: blobKey, limit: 1 });
      if (blobs.blobs.length === 0) {
        return res.status(200).json({});
      }
      var response = await fetch(blobs.blobs[0].url);
      var data = await response.json();
      res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
      return res.status(200).json(data);
    } else {
      // Local dev: read from ./dev-cms/
      var fs = require('fs');
      var path = require('path');
      var filePath = path.join(process.cwd(), 'dev-cms', key + '.json');
      if (!fs.existsSync(filePath)) {
        return res.status(200).json({});
      }
      var fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(fileData);
    }
  } catch (err) {
    console.error('CMS read error:', err);
    return res.status(200).json({});
  }
};
