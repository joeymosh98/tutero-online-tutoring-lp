// /shared/confetti.js — Canvas confetti animation
(function() {
  'use strict';

  function launch(opts) {
    opts = opts || {};
    var canvasId = opts.canvasId || 'confettiCanvas';
    var c = document.getElementById(canvasId);
    if (!c) return;
    var ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    var cols = ['#FF8412', '#F8B200', '#4CB092', '#00A3FF', '#1D49E3', '#FF6B6B'];
    var count = opts.count || 120;
    var spread = opts.spread || 200;
    var originX = opts.originX != null ? opts.originX : c.width / 2;
    var originY = opts.originY != null ? opts.originY : c.height / 2;
    var fadeStart = opts.fadeStart || 40;
    var fadeRate = opts.fadeRate || 0.015;
    var ps = [];
    for (var i = 0; i < count; i++) {
      ps.push({
        x: originX + (Math.random() - 0.5) * spread,
        y: originY,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -18 - 4,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 3,
        color: cols[Math.floor(Math.random() * cols.length)],
        rot: Math.random() * 360,
        rs: (Math.random() - 0.5) * 12,
        g: 0.3 + Math.random() * 0.2,
        o: 1
      });
    }
    var f = 0;
    function animate() {
      ctx.clearRect(0, 0, c.width, c.height);
      var alive = false;
      ps.forEach(function(p) {
        p.x += p.vx;
        p.vy += p.g;
        p.y += p.vy;
        p.rot += p.rs;
        p.vx *= 0.99;
        if (f > fadeStart) p.o -= fadeRate;
        if (p.o <= 0) return;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.o);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      f++;
      if (alive) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, c.width, c.height);
    }
    animate();
  }

  window.TuteroConfetti = { launch: launch };
})();
