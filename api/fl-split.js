// Vercel Serverless Function — Florida LP A/B splitter
// try.tutero.com/fl → 302 to old (a) or new (b) Florida landing page.
// Sticky per visitor via fl_ab cookie (.tutero.com, 90d). Preserves all
// inbound query params (utm_*, fbclid, …) and appends lp_variant=a|b.
const crypto = require('crypto');

const DESTINATIONS = {
  a: 'https://www.tutero.com/us/meta-lp/sufs-tutoring',
  b: 'https://www.tutero.com/us/lp/florida-tutoring'
};
const COOKIE = 'fl_ab';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function readCookie(header, name) {
  if (!header) return null;
  const m = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

module.exports = function handler(req, res) {
  // 1. cookie (sticky) → 2. explicit ?lp_variant= (QA) → 3. coin flip
  let variant = readCookie(req.headers.cookie, COOKIE);
  if (variant !== 'a' && variant !== 'b') {
    const qs = (req.url.split('?')[1] || '');
    const forced = new URLSearchParams(qs).get('lp_variant');
    variant = (forced === 'a' || forced === 'b')
      ? forced
      : (crypto.randomBytes(1)[0] < 128 ? 'a' : 'b');
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
