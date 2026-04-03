// /shared/scroll-reveal.js — Scroll-triggered element reveal via IntersectionObserver
(function() {
  'use strict';

  function init(opts) {
    opts = opts || {};
    var selectors = opts.selectors || '.reveal, .reveal-left, .reveal-right, .reveal-scale';
    var threshold = opts.threshold || 0.15;
    var els = document.querySelectorAll(selectors);
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: threshold });
    els.forEach(function(el) { observer.observe(el); });
  }

  window.TuteroReveal = { init: init };
})();
