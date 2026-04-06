// /shared/lead.js — Lead submission webhook + thank-you URL construction
(function() {
  'use strict';

  var SUBMIT_URL = '/api/submit-lead/';

  function doFetch(payload) {
    return fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    }).then(function(res) {
      if (!res.ok) throw new Error('Server error: ' + res.status);
      return { success: true };
    });
  }

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

    var payload = JSON.stringify(data);

    return doFetch(payload).then(function(result) {
      if (window.TuteroAnalytics) window.TuteroAnalytics.trackLead(data);
      return result;
    }).catch(function() {
      // Retry once after 2 seconds
      return new Promise(function(resolve) {
        setTimeout(function() {
          doFetch(payload).then(function(result) {
            if (window.TuteroAnalytics) window.TuteroAnalytics.trackLead(data);
            resolve(result);
          }).catch(function(err) {
            resolve({ success: false, error: err.message });
          });
        }, 2000);
      });
    });
  }

  function showError(el) {
    var parent = el.parentNode;
    if (parent.querySelector('.lead-error')) return;
    var msg = document.createElement('div');
    msg.className = 'lead-error';
    msg.textContent = 'Something went wrong. Please try again or call us on 1300 888 937.';
    parent.insertBefore(msg, el.nextSibling);
    setTimeout(function() { if (msg.parentNode) msg.remove(); }, 8000);
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
    showError: showError,
    buildThankYouUrl: buildThankYouUrl,
    updateThankYouLinks: updateThankYouLinks
  };
})();
