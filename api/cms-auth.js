// Vercel Serverless Function — CMS Password Verification

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  if (!body.password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  var valid = body.password === process.env.CMS_PASSWORD;
  return res.status(200).json({ valid: valid });
};
