var fs = require('fs');
var path = require('path');

var ADS_PATH = path.join(__dirname, '..', 'ads', 'ads.json');
var ADS_DIR = path.join(__dirname, '..', 'ads');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body || {};

  // ── Creative HTML save ──
  if (body.creative_file && body.html) {
    return saveCreativeHtml(body, res);
  }

  // ── JSON field edit ──
  if (!body.ad_name || !body.field || body.value === undefined) {
    return res.status(400).json({ error: 'ad_name, field, and value are required' });
  }

  var allowedFields = ['name', 'headline', 'body', 'cta_label'];
  if (allowedFields.indexOf(body.field) === -1) {
    return res.status(400).json({ error: 'Field not editable: ' + body.field });
  }

  try {
    var ads = JSON.parse(fs.readFileSync(ADS_PATH, 'utf8'));
    var ad = ads.find(function(a) { return a.name === body.ad_name; });
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found: ' + body.ad_name });
    }

    var oldValue = ad[body.field];
    ad[body.field] = body.value;

    var newName = body.field === 'name' ? body.value : ad.name;

    fs.writeFileSync(ADS_PATH, JSON.stringify(ads, null, 2) + '\n', 'utf8');

    return res.status(200).json({
      success: true,
      ad_name: newName,
      field: body.field,
      old_value: oldValue,
      new_value: body.value
    });
  } catch (err) {
    console.error('ad-edit error:', err);
    return res.status(500).json({ error: 'Failed to save edit' });
  }
};

function saveCreativeHtml(body, res) {
  try {
    // Resolve the creative file path safely within the ads directory
    var filePath = path.resolve(ADS_DIR, body.creative_file.replace(/^\/ads\//, ''));

    // Security: ensure the resolved path is within the ads directory
    if (filePath.indexOf(ADS_DIR) !== 0) {
      return res.status(403).json({ error: 'Path outside ads directory' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Creative file not found' });
    }

    fs.writeFileSync(filePath, body.html, 'utf8');

    return res.status(200).json({ success: true, file: body.creative_file });
  } catch (err) {
    console.error('creative save error:', err);
    return res.status(500).json({ error: 'Failed to save creative file' });
  }
}
