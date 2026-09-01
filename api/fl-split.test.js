// Plain-node tests for the Florida LP router. No framework, no deps:
//   node api/fl-split.test.js
// This function is the front door for all Florida paid traffic, so the
// behaviours asserted here are the ones that lose money if they regress.
const assert = require('assert');
const handler = require('./fl-split.js');

const DEST = 'https://www.tutero.com/us/lp/florida-sufs';

function call(url, cookie) {
  const headers = {};
  const res = {
    statusCode: 0,
    setHeader(k, v) { headers[k.toLowerCase()] = v; },
    end() { this.ended = true; }
  };
  handler({ url, headers: cookie ? { cookie } : {} }, res);
  const loc = new URL(headers.location);
  return { res, headers, loc, params: loc.searchParams };
}

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('  ok  ' + name);
}

console.log('fl-split router');

test('always redirects to page c with a 302', () => {
  const { res, loc } = call('/fl/');
  assert.strictEqual(res.statusCode, 302);
  assert.strictEqual(loc.origin + loc.pathname, DEST);
});

test('a retired sticky cookie cannot send a visitor to a dead arm', () => {
  for (const c of ['fl_ab=a', 'fl_ab=b', 'fl_ab=c', 'fl_ab=garbage', 'other=1; fl_ab=a']) {
    const { loc } = call('/fl/', c);
    assert.strictEqual(loc.origin + loc.pathname, DEST, 'cookie: ' + c);
  }
});

test('an inbound ?lp_variant= cannot divert paid traffic off the page', () => {
  for (const q of ['?lp_variant=a', '?lp_variant=b', '?lp_variant=zzz']) {
    const { loc, params } = call('/fl/' + q);
    assert.strictEqual(loc.origin + loc.pathname, DEST, 'query: ' + q);
    assert.deepStrictEqual(params.getAll('lp_variant'), ['c']);
  }
});

test('lp_variant=c is stamped exactly once, even from repeated inbound values', () => {
  const { params } = call('/fl/?lp_variant=a&lp_variant=b');
  assert.deepStrictEqual(params.getAll('lp_variant'), ['c']);
});

test('attribution params survive the hop', () => {
  const { params } = call('/fl/?utm_source=fb&utm_medium=paid&utm_campaign=FL_Leads' +
    '&utm_content=Ad%20Name%20With%20Spaces&fbclid=ABC.123_xyz-456');
  assert.strictEqual(params.get('utm_source'), 'fb');
  assert.strictEqual(params.get('utm_medium'), 'paid');
  assert.strictEqual(params.get('utm_campaign'), 'FL_Leads');
  assert.strictEqual(params.get('utm_content'), 'Ad Name With Spaces');
  assert.strictEqual(params.get('fbclid'), 'ABC.123_xyz-456');
  assert.strictEqual(params.get('lp_variant'), 'c');
});

test('a bare /fl with no query still gets tagged', () => {
  const { params } = call('/fl');
  assert.deepStrictEqual(params.getAll('lp_variant'), ['c']);
});

test('the tracking-fallback cookie is still set to c', () => {
  // wf/fl-ab-tracking.v1.js reads qs.get('lp_variant') || cookie('fl_ab') || '',
  // so dropping this would make paramless repeat views log untagged.
  const { headers } = call('/fl/');
  assert.match(headers['set-cookie'], /^fl_ab=c;/);
  assert.match(headers['set-cookie'], /Domain=\.tutero\.com/);
  assert.match(headers['set-cookie'], /Path=\//);
  assert.match(headers['set-cookie'], /Secure/);
  assert.match(headers['set-cookie'], /SameSite=Lax/);
});

test('the hop is never cached by the CDN', () => {
  const { headers } = call('/fl/');
  assert.strictEqual(headers['cache-control'], 'no-store');
});

test('the response is actually ended', () => {
  const { res } = call('/fl/');
  assert.strictEqual(res.ended, true);
});

console.log('\n' + passed + ' passing');
