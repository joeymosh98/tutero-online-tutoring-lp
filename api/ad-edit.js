var fs = require('fs');
var path = require('path');

var ADS_DIR = path.join(__dirname, '..', 'ads');
var ADS_PATH = path.join(ADS_DIR, 'ads.json');
var SOCIAL_PATH = path.join(ADS_DIR, 'social.json');

function resolveJsonPath(source) {
  return source === 'social' ? SOCIAL_PATH : ADS_PATH;
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body || {};
  var source = body.source === 'social' ? 'social' : 'ads';

  // ── Bulk reorder (grid) ──
  if (body.bulk_reorder && Array.isArray(body.order)) {
    try {
      var jsonPath = resolveJsonPath(source);
      var ads = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      body.order.forEach(function(item) {
        var ad = ads.find(function(a) { return a.name === item.name; });
        if (ad && typeof item.grid_order === 'number') {
          ad.grid_order = item.grid_order;
        }
      });
      fs.writeFileSync(jsonPath, JSON.stringify(ads, null, 2) + '\n', 'utf8');
      return res.status(200).json({ success: true, updated: body.order.length });
    } catch (err) {
      console.error('bulk reorder error:', err);
      return res.status(500).json({ error: 'Failed to save reorder' });
    }
  }

  // ── Creative HTML save ──
  if (body.creative_file && body.html) {
    return saveCreativeHtml(body, res);
  }

  // ── JSON field edit ──
  if (!body.ad_name || !body.field || body.value === undefined) {
    return res.status(400).json({ error: 'ad_name, field, and value are required' });
  }

  var allowedFields = ['name', 'headline', 'body', 'cta_label', 'caption', 'cta', 'grid_approved', 'grid_order'];
  if (allowedFields.indexOf(body.field) === -1) {
    return res.status(400).json({ error: 'Field not editable: ' + body.field });
  }

  try {
    var jsonPath = resolveJsonPath(source);
    var ads = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    var ad = ads.find(function(a) { return a.name === body.ad_name; });
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found: ' + body.ad_name });
    }

    var oldValue = ad[body.field];
    ad[body.field] = body.value;

    var newName = body.field === 'name' ? body.value : ad.name;

    fs.writeFileSync(jsonPath, JSON.stringify(ads, null, 2) + '\n', 'utf8');

    return res.status(200).json({
      success: true,
      source: source,
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
