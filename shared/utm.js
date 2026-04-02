// /shared/utm.js — Centralized UTM capture & persistence
(function() {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  var STORAGE_KEY = 'tutero_utm';

  // Parse UTMs from current URL
  var params = new URLSearchParams(window.location.search);
  var fromUrl = {};
  var hasAny = false;
  UTM_KEYS.forEach(function(key) {
    var val = params.get(key);
    if (val) { fromUrl[key] = val; hasAny = true; }
  });

  // If URL has UTMs, store them (overwrite previous — last-touch attribution)
  if (hasAny) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl)); } catch(e) {}
  }

  // Public API: get stored UTMs (merges URL > storage > empty)
  window.TuteroUTM = {
    get: function() {
      var stored = {};
      try { stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch(e) {}
      var result = {};
      UTM_KEYS.forEach(function(key) {
        result[key] = fromUrl[key] || stored[key] || '';
      });
      return result;
    }
  };
})();
