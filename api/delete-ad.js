var fs = require('fs');
var path = require('path');

var ADS_JSON = path.join(__dirname, '..', 'ads', 'ads.json');
var SOCIAL_JSON = path.join(__dirname, '..', 'ads', 'social.json');
var ADS_DIR = path.join(__dirname, '..', 'ads');
var BLOB_URLS = path.join(__dirname, '..', 'ads-blob-urls.json');

module.exports = function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body || {};
  if (!body.ad_name) {
    return res.status(400).json({ error: 'ad_name is required' });
  }

  var source = body.source === 'social' ? 'social' : 'ads';
  var jsonPath = source === 'social' ? SOCIAL_JSON : ADS_JSON;

  try {
    var ads = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    var ad = ads.find(function(a) { return a.name === body.ad_name; });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found: ' + body.ad_name });
    }

    // Delete creative HTML file
    if (ad.creative_file) {
      var creativePath = path.join(ADS_DIR, ad.creative_file);
      if (fs.existsSync(creativePath)) {
        fs.unlinkSync(creativePath);
      }
    }

    // Delete carousel slide files
    if (Array.isArray(ad.slides)) {
      ad.slides.forEach(function(slidePath) {
        var fullPath = path.join(ADS_DIR, slidePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Delete image file only if no other ads share it
    if (ad.image) {
      var otherAdsUsingImage = ads.filter(function(a) {
        return a.name !== body.ad_name && a.image === ad.image;
      });

      if (otherAdsUsingImage.length === 0) {
        var imagePath = path.join(ADS_DIR, ad.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }

        // Remove from blob URLs if present
        if (fs.existsSync(BLOB_URLS)) {
          try {
            var blobUrls = JSON.parse(fs.readFileSync(BLOB_URLS, 'utf8'));
            var imageFilename = path.basename(ad.image);
            if (blobUrls[imageFilename]) {
              delete blobUrls[imageFilename];
              fs.writeFileSync(BLOB_URLS, JSON.stringify(blobUrls, null, 2) + '\n', 'utf8');
            }
          } catch (e) {
            console.error('Failed to update blob URLs:', e);
          }
        }
      }
    }

    // Remove from the active dataset (ads.json or social.json)
    var updatedAds = ads.filter(function(a) { return a.name !== body.ad_name; });
    fs.writeFileSync(jsonPath, JSON.stringify(updatedAds, null, 2) + '\n', 'utf8');

    return res.status(200).json({
      success: true,
      source: source,
      deleted: body.ad_name,
      remaining: updatedAds.length
    });
  } catch (err) {
    console.error('delete-ad error:', err);
    return res.status(500).json({ error: 'Failed to delete ad' });
  }
};
