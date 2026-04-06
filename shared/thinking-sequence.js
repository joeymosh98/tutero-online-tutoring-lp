// /shared/thinking-sequence.js — Particle canvas + progress ring + step feed animation
// Requires: shared/data.js (TuteroData.escHtml)
(function() {
  'use strict';

  var animId = null;

  /**
   * Initialize the particle canvas background animation.
   * @param {string} canvasId - ID of the canvas element
   * @param {Object} [opts]
   * @param {string} [opts.lineColor='120,90,220'] - RGB for connection lines
   * @param {string} [opts.dotColor='rgba(180,160,255,0.15)'] - Particle fill color
   * @param {number} [opts.count=50] - Number of particles
   * @param {number} [opts.connectionDist=110] - Max distance for connections
   */
  function initParticleCanvas(canvasId, opts) {
    stopParticleCanvas();
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    var w = canvas.offsetWidth;
    var h = canvas.offsetHeight;

    var count = opts.count || 50;
    var connectionDist = opts.connectionDist || 110;
    var lineColor = opts.lineColor || '120,90,220';
    var dotColor = opts.dotColor || 'rgba(180,160,255,0.15)';
    var particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5
      });
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(' + lineColor + ',' + (0.07 * (1 - dist / connectionDist)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      }
      animId = requestAnimationFrame(tick);
    }
    tick();
  }

  function stopParticleCanvas() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  /**
   * Run a thinking/matching animation with progress ring + step feed.
   * @param {Object} config
   * @param {Array} config.phases - Array of {label, duration, steps: [{icon, text}]}
   * @param {Object} config.elements - DOM element IDs:
   *   {feed, ring, pct, phaseLabel, headline, subtitle, complete}
   * @param {Object} [config.text] - Optional text overrides:
   *   {headline, subtitle, completeHeading, completeCta, completionLabel}
   * @param {Function} [config.onComplete] - Called when sequence finishes (receives complete element)
   * @param {number} [config.maxVisible=5] - Max visible steps before fade-out
   * @param {number} [config.startDelay=600] - Delay before first step
   */
  function runSequence(config) {
    var els = config.elements;
    var escHtml = (window.TuteroData && window.TuteroData.escHtml) || function(s) { return s; };

    // Set headline/subtitle if provided
    if (config.text) {
      var headlineEl = document.getElementById(els.headline);
      var subtitleEl = document.getElementById(els.subtitle);
      if (headlineEl && config.text.headline) headlineEl.textContent = config.text.headline;
      if (subtitleEl && config.text.subtitle) subtitleEl.textContent = config.text.subtitle;
      // Completion card
      var completeHeadingEl = document.getElementById(els.completeHeading);
      if (completeHeadingEl && config.text.completeHeading) completeHeadingEl.textContent = config.text.completeHeading;
      var ctaBtn = document.getElementById(els.completeCta);
      if (ctaBtn && config.text.completeCta) ctaBtn.textContent = config.text.completeCta;
    }

    var phases = config.phases;
    var feed = document.getElementById(els.feed);
    feed.innerHTML = '';

    // Progress ring
    var circumference = 2 * Math.PI * 52; // ~326.73
    var ring = document.getElementById(els.ring);
    var pctEl = document.getElementById(els.pct);
    var phaseEl = document.getElementById(els.phaseLabel);
    var complete = els.complete ? document.getElementById(els.complete) : null;
    if (complete) complete.classList.remove('visible');
    ring.style.strokeDashoffset = circumference;
    pctEl.textContent = '0%';

    // Flatten steps
    var allSteps = [];
    phases.forEach(function(phase) {
      var stepTime = phase.duration / phase.steps.length;
      phase.steps.forEach(function(step) {
        allSteps.push({
          text: step.text,
          icon: step.icon,
          phaseLabel: phase.label,
          delay: stepTime
        });
      });
    });

    var totalTime = allSteps.reduce(function(sum, s) { return sum + s.delay; }, 0);
    var elapsed = 0;
    var maxVisible = config.maxVisible || 5;
    var stepEls = [];
    var timeouts = [];

    function updateProgress(fraction) {
      var clamped = Math.min(Math.max(fraction, 0), 1);
      ring.style.strokeDashoffset = circumference * (1 - clamped);
      pctEl.textContent = Math.round(clamped * 100) + '%';
    }

    function runStep(index) {
      if (index >= allSteps.length) {
        updateProgress(1);
        phaseEl.textContent = (config.text && config.text.completionLabel) || 'All done!';
        if (stepEls.length > 0) {
          var last = stepEls[stepEls.length - 1];
          last.classList.remove('active');
          last.classList.add('done');
          var lastStatus = last.querySelector('.tf-step-status');
          if (lastStatus) lastStatus.innerHTML = '\u2713';
        }
        timeouts.push(setTimeout(function() {
          if (complete) complete.classList.add('visible');
          if (config.onComplete) config.onComplete(complete);
        }, 800));
        return;
      }

      var step = allSteps[index];
      phaseEl.textContent = step.phaseLabel;

      if (index > 0 && stepEls[index - 1]) {
        stepEls[index - 1].classList.remove('active');
        stepEls[index - 1].classList.add('done');
        var prev = stepEls[index - 1].querySelector('.tf-step-status');
        if (prev) prev.innerHTML = '\u2713';
      }

      var el = document.createElement('div');
      el.className = 'tf-step';
      el.innerHTML =
        '<span class="tf-step-icon">' + step.icon + '</span>' +
        '<span class="tf-step-text">' + escHtml(step.text) + '</span>' +
        '<span class="tf-step-status"><span class="tf-dot"></span></span>';
      feed.appendChild(el);
      stepEls.push(el);

      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          el.classList.add('visible', 'active');
        });
      });

      if (stepEls.length > maxVisible) {
        var old = stepEls[stepEls.length - maxVisible - 1];
        old.style.opacity = '0';
        old.style.maxHeight = '0';
        old.style.padding = '0';
        old.style.marginBottom = '0';
        old.style.overflow = 'hidden';
      }

      elapsed += step.delay;
      updateProgress(elapsed / totalTime);
      timeouts.push(setTimeout(function() { runStep(index + 1); }, step.delay));
    }

    updateProgress(0);
    timeouts.push(setTimeout(function() { runStep(0); }, config.startDelay || 600));
    window._thinkingTimeouts = timeouts;
  }

  /** Clean up any running thinking sequence timeouts. */
  function cleanup() {
    if (window._thinkingTimeouts) {
      window._thinkingTimeouts.forEach(function(t) { clearTimeout(t); });
      window._thinkingTimeouts = null;
    }
  }

  window.TuteroThinking = {
    initParticleCanvas: initParticleCanvas,
    stopParticleCanvas: stopParticleCanvas,
    runSequence: runSequence,
    cleanup: cleanup
  };
})();
