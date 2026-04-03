// /shared/social-proof.js — Periodic counter increment for social proof
(function() {
  'use strict';
  var el = document.getElementById('proofCount');
  if (!el) return;
  var count = parseInt(el.textContent, 10);
  var ticks = 0;
  var timer = setInterval(function() {
    ticks++;
    count++;
    el.textContent = count;
    if (ticks >= 2) clearInterval(timer);
  }, 20000);
})();
