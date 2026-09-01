// Vercel Serverless Function — Florida LP router
// try.tutero.com/fl → 302 to the Florida landing page.
//
// HISTORY: this was a 50/50 then three-way A/B/C splitter (a = the old
// /us/meta-lp/sufs-tutoring, b = /us/lp/florida-tutoring, c = /us/lp/florida-sufs).
// The test ran 23 Jul – 1 Sep 2026 and cleared its pre-committed gates for a
// and b. Lead rate was a dead heat (10.8% / 10.3% / 9.2%, a vs b p=0.71), and c
// led lead→customer in every cut without reaching significance. c wins on
// maintainability and engagement, so 100% of traffic now goes to c.
//
// WHY THE HOP STAYS: this is the single control point for the Florida paid
// destination. Changing the page here is a one-line deploy; changing it on the
// ads is a bulk Meta creative swap that resets review and learning on every ad.
//
// ROUTING IS UNCONDITIONAL. Both former inputs are deliberately ignored:
//   - the fl_ab cookie, because ~90 days of sticky a/b cookies are still in the
//     wild and those visitors must not be sent to a retired arm;
//   - the ?lp_variant= QA override, because an inbound URL must not be able to
//     divert live paid traffic off the page.
//
// The cookie is still SET to c. wf/fl-ab-tracking.v1.js resolves the variant as
// `qs.get('lp_variant') || cookie('fl_ab') || ''`, so dropping it would make
// paramless repeat views log as untagged. A future test must therefore use a
// NEW cookie name (fl_ab2), or it will inherit this sticky population.

const DESTINATION = 'https://www.tutero.com/us/lp/florida-sufs';

// Still stamped on the outbound URL so page tracking keeps tagging events —
// Mixpanel board 11393388 filters lp_variant != "".
const VARIANT = 'c';

const COOKIE = 'fl_ab';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

module.exports = function handler(req, res) {
  const params = new URLSearchParams(req.url.split('?')[1] || '');
  params.delete('lp_variant'); // drop any inbound value, however many
  params.set('lp_variant', VARIANT);

  res.setHeader('Set-Cookie',
    `${COOKIE}=${VARIANT}; Max-Age=${MAX_AGE}; Domain=.tutero.com; Path=/; Secure; SameSite=Lax`);
  res.setHeader('Cache-Control', 'no-store'); // never let the CDN cache the hop
  res.statusCode = 302;
  res.setHeader('Location', `${DESTINATION}?${params.toString()}`);
  res.end();
};
