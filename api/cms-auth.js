// Vercel Serverless Function — CMS Password Verification
const setCors = require('./_cors');

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const valid = password === process.env.CMS_PASSWORD;
  return res.status(200).json({ success: true, valid });
};
