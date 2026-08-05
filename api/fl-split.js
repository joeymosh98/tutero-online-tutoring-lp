// Vercel Serverless Function — Florida LP A/B/C splitter
// try.tutero.com/fl → 302 to one of the Florida landing pages.
// Sticky per visitor via fl_ab cookie (.tutero.com, 90d). Preserves all
// inbound query params (utm_*, fbclid, …) and appends lp_variant=a|b|c.
//
// Adding an arm does NOT reshuffle anyone: a visitor already carrying
// fl_ab=a|b keeps that arm, so only new visitors can be assigned c. Arm c
// therefore ramps from zero rather than inheriting a share of the existing
// cookied population — expected, and the reason c's counts trail a and b
// for the first few days.
const crypto = require('crypto');

const DESTINATIONS = {
  a: 'https://www.tutero.com/us/meta-lp/sufs-tutoring',
  b: 'https://www.tutero.com/us/lp/florida-tutoring',
  c: 'https://www.tutero.com/us/lp/florida-sufs'
};
const VARIANTS = Object.keys(DESTINATIONS);
const COOKIE = 'fl_ab';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function readCookie(header, name) {
  if (!header) return null;
  const m = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

// Unbiased pick over n arms. A plain byte % 3 is skewed, because 256 is not a
// multiple of 3 and the first remainder gets one extra value. Reject the tail
// (255 when n is 3) and the remaining range divides exactly.
function pickVariant() {
  const n = VARIANTS.length;
  const limit = Math.floor(256 / n) * n;
  let byte;
  do { byte = crypto.randomBytes(1)[0]; } while (byte >= limit);
  return VARIANTS[byte % n];
}

module.exports = function handler(req, res) {
  // 1. cookie (sticky) → 2. explicit ?lp_variant= (QA) → 3. random assignment
  let variant = readCookie(req.headers.cookie, COOKIE);
  if (!DESTINATIONS[variant]) {
    const qs = (req.url.split('?')[1] || '');
    const forced = new URLSearchParams(qs).get('lp_variant');
    variant = DESTINATIONS[forced] ? forced : pickVariant();
  }

  const params = new URLSearchParams(req.url.split('?')[1] || '');
  params.delete('lp_variant');
  params.set('lp_variant', variant);

  res.setHeader('Set-Cookie',
    `${COOKIE}=${variant}; Max-Age=${MAX_AGE}; Domain=.tutero.com; Path=/; Secure; SameSite=Lax`);
  res.setHeader('Cache-Control', 'no-store'); // never let the CDN cache one arm
  res.statusCode = 302;
  res.setHeader('Location', `${DESTINATIONS[variant]}?${params.toString()}`);
  res.end();
};
