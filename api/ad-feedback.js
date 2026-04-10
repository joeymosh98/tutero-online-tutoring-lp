var fs = require('fs');
var path = require('path');

var MEMORY_PATH = path.join(__dirname, '..', 'tutoring-marketing-brain', 'tutero-tutoring-australia', 'memory.md');

module.exports = function handler(req, res) {
  // GET — return existing decisions for the gallery
  if (req.method === 'GET') {
    try {
      var content = fs.existsSync(MEMORY_PATH) ? fs.readFileSync(MEMORY_PATH, 'utf8') : '';
      var decisions = parseDecisions(content);
      return res.status(200).json({ decisions: decisions });
    } catch (err) {
      console.error('ad-feedback GET error:', err);
      return res.status(500).json({ error: 'Failed to read memory' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  if (!body.ad_name || !body.decision) {
    return res.status(400).json({ error: 'ad_name and decision are required' });
  }

  try {
    var content = fs.existsSync(MEMORY_PATH) ? fs.readFileSync(MEMORY_PATH, 'utf8') : '# Zara Memory\n\n> Approved: 0 | Rejected: 0 | Maybe: 0\n\n## Feedback Log\n';

    // Build log entry
    var date = new Date().toISOString().slice(0, 10);
    var entry = '\n### ' + date + ' — ' + body.ad_name + '\n';
    entry += '- **Decision:** ' + body.decision + '\n';
    if (body.reason) entry += '- **Reason:** ' + body.reason + '\n';
    if (body.hypothesis) entry += '- **Hypothesis:** ' + body.hypothesis + '\n';

    // Append entry
    content = content.trimEnd() + '\n' + entry;

    // Update tally
    var decisions = parseDecisions(content);
    var approved = 0, rejected = 0, maybe = 0;
    Object.keys(decisions).forEach(function(k) {
      var d = decisions[k].decision;
      if (d === 'approved') approved++;
      else if (d === 'rejected') rejected++;
      else if (d === 'maybe') maybe++;
    });

    content = content.replace(
      /> Approved: \d+ \| Rejected: \d+ \| Maybe: \d+/,
      '> Approved: ' + approved + ' | Rejected: ' + rejected + ' | Maybe: ' + maybe
    );

    fs.writeFileSync(MEMORY_PATH, content, 'utf8');
    return res.status(200).json({ success: true, decisions: decisions });
  } catch (err) {
    console.error('ad-feedback POST error:', err);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }
};

// Parse all decisions from memory.md — returns { "6A — He Used To Love Maths": { decision, reason, hypothesis } }
function parseDecisions(content) {
  var decisions = {};
  var entries = content.split(/\n### \d{4}-\d{2}-\d{2} — /);
  entries.shift(); // remove everything before first entry

  entries.forEach(function(block) {
    var lines = block.trim().split('\n');
    var adName = lines[0].trim();
    var decision = null, reason = null, hypothesis = null;

    lines.forEach(function(line) {
      var dm = line.match(/\*\*Decision:\*\* (.+)/);
      if (dm) decision = dm[1].trim();
      var rm = line.match(/\*\*Reason:\*\* (.+)/);
      if (rm) reason = rm[1].trim();
      var hm = line.match(/\*\*Hypothesis:\*\* (.+)/);
      if (hm) hypothesis = hm[1].trim();
    });

    if (adName && decision) {
      decisions[adName] = { decision: decision, reason: reason, hypothesis: hypothesis };
    }
  });

  return decisions;
}
