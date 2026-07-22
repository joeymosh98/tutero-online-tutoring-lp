/* Tutero Florida LP A/B — Mixpanel tracking (applied to BOTH arms via Webflow)
 * a = /us/meta-lp/sufs-tutoring   b = /us/lp/florida-tutoring
 * Events: "FL LP Viewed", "FL LP CTA Clicked".
 * Stitching: stable fl_uid → mixpanel.identify() AND appended to every
 * Typeform link as mp_id (+ lp_variant) so the server-side
 * "FL Lead Submitted" (fired from Make) joins the same funnel.
 */
(function () {
  // Only run on the two Florida A/B arms — this script is applied to the
  // meta-lp CMS TEMPLATE (all /us/meta-lp/* pages share it), so gate hard.
  var path = location.pathname.replace(/\/$/, '');
  if (path !== '/us/meta-lp/sufs-tutoring' && path !== '/us/lp/florida-tutoring') return;
  var TOKEN = '80ffa3180bb438ec04211a8a4b3f4a67'; // Tutoring project 3186135 (public ingestion token)

  function cookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function uuid() {
    try {
      var b = new Uint8Array(16); crypto.getRandomValues(b);
      b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      var h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
    } catch (e) { return 'fl-' + Date.now() + '-' + Math.random().toString(36).slice(2); }
  }

  // --- identity + variant ------------------------------------------------
  var uid;
  try { uid = localStorage.getItem('fl_uid'); } catch (e) {}
  if (!uid) { uid = uuid(); try { localStorage.setItem('fl_uid', uid); } catch (e) {} }

  var qs = new URLSearchParams(location.search);
  var variant = qs.get('lp_variant') || cookie('fl_ab') || '';
  if (variant !== 'a' && variant !== 'b') variant = '';   // unassigned traffic: logged, excludable
  var slug = location.pathname.replace(/\/$/, '');

  // --- queue until mixpanel lib loads ------------------------------------
  var pending = [];
  var ready = false;
  function track(ev, props, opts) {
    if (ready) { window.mixpanel.track(ev, props, opts); }
    else { pending.push([ev, props, opts]); }
  }

  var s = document.createElement('script');
  s.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
  s.async = true;
  s.onload = function () {
    window.mixpanel.init(TOKEN, { persistence: 'localStorage', batch_requests: true });
    window.mixpanel.identify(uid);
    window.mixpanel.register({ lp_variant: variant, lp_slug: slug, fl_uid: uid });
    ready = true;
    for (var i = 0; i < pending.length; i++) window.mixpanel.track.apply(window.mixpanel, pending[i]);
    pending = [];
  };
  document.head.appendChild(s);

  track('FL LP Viewed', { page: slug });

  // --- CTA capture: stamp params onto Typeform links at click time -------
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href*="typeform.com"]');
    if (!a) return;
    try {
      var u = new URL(a.href);
      u.searchParams.set('lp_variant', variant);
      u.searchParams.set('mp_id', uid);
      a.href = u.toString();
    } catch (err) {}
    track('FL LP CTA Clicked', {
      cta_href: a.href,
      cta_text: (a.textContent || '').trim().slice(0, 80)
    }, { transport: 'sendBeacon' });
  }, true); // capture phase — runs before the page's own href-rewriting handlers
})();
