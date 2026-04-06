// /shared/submit-animation.js — Cinematic form submit animation + redirect
(function() {
  'use strict';

  /**
   * Animate a submit button through 4 phases:
   * 1. Loading spinner
   * 2. Green success checkmark
   * 3. Fade out sibling fields, show reassurance message
   * 4. Redirect to URL
   *
   * @param {HTMLElement} btn - The submit button element
   * @param {string} redirectUrl - Where to redirect after animation
   */
  function animateSubmit(btn, redirectUrl) {
    var step = btn.closest('.modal-form-step') || btn.closest('[id^="ctaStep"]');
    // Phase 1: Loading spinner
    btn.classList.add('is-loading');
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="animation:spin .7s linear infinite"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.35)" stroke-width="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg> Submitting\u2026</span>';
    setTimeout(function() {
      // Phase 2: Green success button
      btn.classList.remove('is-loading');
      btn.classList.add('is-success');
      btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="rgba(255,255,255,.2)"/><path d="M7 13l3 3 7-7" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> All set!</span>';
      btn.style.animation = 'submit-pulse 1.2s ease-in-out infinite';
      // Phase 3: Fade out form fields, show reassuring message
      setTimeout(function() {
        if (step) {
          Array.prototype.forEach.call(step.children, function(child) {
            if (child !== btn) { child.style.transition = 'opacity .4s, transform .4s'; child.style.opacity = '0'; child.style.transform = 'translateY(-8px)'; }
          });
        }
        setTimeout(function() {
          if (step) {
            Array.prototype.forEach.call(step.children, function(child) {
              if (child !== btn) child.style.display = 'none';
            });
          }
          var msg = document.createElement('div');
          msg.className = 'submit-reassure';
          msg.innerHTML = '<p class="submit-reassure-text">Our team is already on it \u2014 we\u2019re finding the perfect tutor match for your child.</p><p class="submit-reassure-redirect">Redirecting you to our website\u2026</p>';
          btn.parentNode.insertBefore(msg, btn);
          // Phase 4: Redirect
          setTimeout(function() { window.location.href = redirectUrl; }, 2400);
        }, 400);
      }, 900);
    }, 1200);
  }

  window.TuteroSubmit = { animateSubmit: animateSubmit };
})();
