// Vercel Serverless Function — Read CMS Config from Vercel Blob
const setCors = require('./_cors');

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = (req.query && req.query.key) || 'landing-pages';
  const blobKey = 'cms/' + key + '.json';

  try {
    if (process.env.VERCEL) {
      const blob = require('@vercel/blob');
      const blobs = await blob.list({ prefix: blobKey, limit: 1 });
      if (blobs.blobs.length === 0) {
        return res.status(200).json({});
      }
      const response = await fetch(blobs.blobs[0].url);
      const data = await response.json();
      res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
      return res.status(200).json(data);
    } else {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'dev-cms', key + '.json');
      if (!fs.existsSync(filePath)) {
        return res.status(200).json({});
      }
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(fileData);
    }
  } catch (err) {
    console.error('CMS read error:', err);
    return res.status(200).json({});
  }
};
