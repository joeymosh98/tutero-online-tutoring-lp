/**
 * Image Repositioner — reusable module
 *
 * Provides drag-to-reposition for images with object-fit: cover.
 * Used by the ads dashboard "Photo" button. Can also be imported
 * standalone on any page.
 *
 * API:
 *   ImageRepositioner.enable(doc)  — activate on all cover-fit images in `doc`
 *   ImageRepositioner.disable(doc) — deactivate and clean up
 *   ImageRepositioner.getPositions(doc) — returns { imgSrc: "x% y%" } map
 */
(function () {
  var activeStates = new WeakMap();

  function getOverflow(img, doc) {
    var rect = img.getBoundingClientRect();
    var natW = img.naturalWidth;
    var natH = img.naturalHeight;
    if (!natW || !natH) return { x: 0, y: 0 };
    var scaleX = rect.width / natW;
    var scaleY = rect.height / natH;
    var scale = Math.max(scaleX, scaleY);
    return {
      x: natW * scale - rect.width,
      y: natH * scale - rect.height,
    };
  }

  function parsePos(img, doc) {
    var raw = (doc || document).defaultView.getComputedStyle(img).objectPosition || '50% 50%';
    var parts = raw.split(/\s+/);
    return { x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 50 };
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function enable(doc) {
    doc = doc || document;
    var imgs = doc.querySelectorAll('img');
    var targets = [];
    for (var i = 0; i < imgs.length; i++) {
      var cs = doc.defaultView.getComputedStyle(imgs[i]);
      if (cs.objectFit === 'cover') targets.push(imgs[i]);
    }

    var handlers = [];
    targets.forEach(function (img) {
      img.style.cursor = 'grab';
      img.setAttribute('draggable', 'false');

      var state = { isDragging: false, startX: 0, startY: 0, startPosX: 50, startPosY: 50 };

      function onDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        state.isDragging = true;
        var pos = parsePos(img, doc);
        state.startPosX = pos.x;
        state.startPosY = pos.y;
        state.startX = e.clientX;
        state.startY = e.clientY;
        img.style.cursor = 'grabbing';
        doc.addEventListener('mousemove', onMove);
        doc.addEventListener('mouseup', onUp);
      }

      function onMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();
        var dx = e.clientX - state.startX;
        var dy = e.clientY - state.startY;
        var overflow = getOverflow(img, doc);
        var newX = overflow.x > 0 ? clamp(state.startPosX - (dx / overflow.x) * 100, 0, 100) : state.startPosX;
        var newY = overflow.y > 0 ? clamp(state.startPosY - (dy / overflow.y) * 100, 0, 100) : state.startPosY;
        img.style.objectPosition = newX.toFixed(1) + '% ' + newY.toFixed(1) + '%';
      }

      function onUp() {
        state.isDragging = false;
        img.style.cursor = 'grab';
        doc.removeEventListener('mousemove', onMove);
        doc.removeEventListener('mouseup', onUp);
      }

      img.addEventListener('mousedown', onDown);
      handlers.push({ img: img, down: onDown });
    });

    activeStates.set(doc, { targets: targets, handlers: handlers });
  }

  function disable(doc) {
    doc = doc || document;
    var s = activeStates.get(doc);
    if (!s) return;
    s.handlers.forEach(function (h) {
      h.img.removeEventListener('mousedown', h.down);
      h.img.style.cursor = '';
      h.img.removeAttribute('draggable');
    });
    activeStates.delete(doc);
  }

  function getPositions(doc) {
    doc = doc || document;
    var s = activeStates.get(doc);
    if (!s) return {};
    var map = {};
    s.targets.forEach(function (img) {
      var pos = parsePos(img, doc);
      map[img.src] = pos.x.toFixed(1) + '% ' + pos.y.toFixed(1) + '%';
    });
    return map;
  }

  window.ImageRepositioner = { enable: enable, disable: disable, getPositions: getPositions };
})();
