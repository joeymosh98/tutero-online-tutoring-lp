// Vercel Serverless Function — Lead submission proxy
// Forwards lead data to Make.com webhook (URL kept server-side)
const setCors = require('./_cors');

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('LEAD_WEBHOOK_URL not configured');
    return res.status(500).json({ success: false, error: 'Webhook not configured' });
  }

  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: 'Missing request body' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('Webhook error:', response.status, await response.text());
      return res.status(502).json({ success: false, error: 'Webhook failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Lead submission error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
