// /shared/lead.js — Lead submission webhook + thank-you URL construction
(function() {
  'use strict';

  var WEBHOOK_URL = 'https://hook.eu1.make.com/46pou90x59vasab9ljivd78sfazjgztv';

  function submit(data, config) {
    data.landing_page = config.landingPage || '';
    data.variant = config.variant || '';
    data.page = window.location.href;
    data.timestamp = new Date().toISOString();
    data.referrer = document.referrer || '';
    var utm = window.TuteroUTM ? window.TuteroUTM.get() : {};
    data.utm_source = utm.utm_source || '';
    data.utm_medium = utm.utm_medium || '';
    data.utm_campaign = utm.utm_campaign || '';
    data.utm_term = utm.utm_term || '';
    data.utm_content = utm.utm_content || '';
    data.gclid = utm.gclid || '';
    if (WEBHOOK_URL) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function() {});
    }
    console.log('[Lead]', data);
  }

  function buildThankYouUrl(base, params) {
    var p = new URLSearchParams();
    Object.keys(params).forEach(function(key) {
      if (params[key]) p.set(key, params[key]);
    });
    var utm = window.TuteroUTM ? window.TuteroUTM.get() : {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function(key) {
      if (utm[key]) p.set(key, utm[key]);
    });
    var qs = p.toString();
    return base + (qs ? '?' + qs : '');
  }

  function updateThankYouLinks(base, params) {
    var url = buildThankYouUrl(base, params);
    document.querySelectorAll('.success-cta-btn').forEach(function(a) { a.href = url; });
  }

  window.TuteroLead = {
    submit: submit,
    buildThankYouUrl: buildThankYouUrl,
    updateThankYouLinks: updateThankYouLinks
  };
})();
