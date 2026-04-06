// /shared/hero-carousel.js — Hero image carousel with dots + badge
(function() {
  'use strict';

  /**
   * Initialize a hero image carousel.
   * Expects: .image-wrapper img elements, .hero-dot elements with data-slide,
   * and optionally a .live-badge element for badge text.
   *
   * @param {Object} [opts]
   * @param {number} [opts.interval=5500] - Auto-advance interval in ms
   * @param {string} [opts.imageSelector='.image-wrapper img']
   * @param {string} [opts.dotSelector='.hero-dot']
   * @param {string} [opts.badgeSelector='.live-badge']
   */
  function init(opts) {
    opts = opts || {};
    var imgs = document.querySelectorAll(opts.imageSelector || '.image-wrapper img');
    var dots = document.querySelectorAll(opts.dotSelector || '.hero-dot');
    var badgeLabel = document.querySelector(opts.badgeSelector || '.live-badge');
    if (!imgs.length) return;

    var current = 0;
    function goTo(n) {
      imgs[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = n;
      imgs[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
      if (badgeLabel && imgs[current].dataset.badge) {
        badgeLabel.lastChild.textContent = ' ' + imgs[current].dataset.badge;
      }
    }
    dots.forEach(function(d) {
      d.addEventListener('click', function() { goTo(parseInt(d.dataset.slide)); });
    });
    setInterval(function() { goTo((current + 1) % imgs.length); }, opts.interval || 5500);
  }

  window.TuteroCarousel = { init: init };
})();
