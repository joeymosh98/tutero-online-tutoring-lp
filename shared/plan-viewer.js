// /shared/plan-viewer.js — Learning plan overlay with book navigation, swipe, keyboard,
//                          API fetch, and 5 render functions
(function() {
  'use strict';

  function init() {
    var params = new URLSearchParams(window.location.search);

    var quizData = {
      studentName: params.get('studentName') || '',
      subject: params.get('subject') || '',
      yearLevel: params.get('yearLevel') || '',
      situation: params.get('situation') || '',
      currentGrade: params.get('currentGrade') || '',
      confidence: params.get('confidence') || '',
      struggleArea: params.get('struggleArea') || '',
      urgency: params.get('urgency') || ''
    };

    // Only show CTA if we have quiz data
    if (!quizData.studentName || !quizData.subject) return;

    var ctaSection = document.getElementById('planCtaSection');
    ctaSection.style.display = '';
    document.getElementById('planCtaHeading').textContent =
      'View ' + quizData.studentName + '\u2019s Personalised ' + quizData.subject + ' Learning Plan';

    // Check localStorage for existing plan
    var storedPlan = null;
    try {
      var stored = JSON.parse(localStorage.getItem('tutero_learning_plan'));
      if (stored && stored.plan) storedPlan = stored.plan;
    } catch (e) {}

    // ── Overlay & Book Navigation ──
    var overlay = document.getElementById('planOverlay');
    var bookViewport = document.getElementById('bookViewport');
    var bookContainer = document.getElementById('bookContainer');
    var bookPrev = document.getElementById('bookPrev');
    var bookNext = document.getElementById('bookNext');
    var bookDots = document.getElementById('bookDots');
    var planLoading = document.getElementById('planLoading');
    var planError = document.getElementById('planError');
    var bookPage = 0;
    var totalPages = 5;
    var planRendered = false;

    // Build dots
    for (var i = 0; i < totalPages; i++) {
      var dot = document.createElement('span');
      dot.className = 'book-dot' + (i === 0 ? ' active' : '');
      bookDots.appendChild(dot);
    }

    function updateBookNav() {
      var dots = bookDots.querySelectorAll('.book-dot');
      for (var i = 0; i < dots.length; i++) {
        if (i === bookPage) dots[i].classList.add('active');
        else dots[i].classList.remove('active');
      }
      if (bookPage === 0) bookPrev.classList.add('hidden');
      else bookPrev.classList.remove('hidden');
      if (bookPage === totalPages - 1) bookNext.classList.add('hidden');
      else bookNext.classList.remove('hidden');
      bookViewport.style.transform = 'translateX(-' + (bookPage * 100) + '%)';
    }

    bookPrev.addEventListener('click', function() {
      if (bookPage > 0) { bookPage--; updateBookNav(); }
    });
    bookNext.addEventListener('click', function() {
      if (bookPage < totalPages - 1) { bookPage++; updateBookNav(); }
    });

    // Swipe support
    var touchStartX = 0;
    var touchStartY = 0;
    bookViewport.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    bookViewport.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0 && bookPage < totalPages - 1) { bookPage++; updateBookNav(); }
        else if (dx > 0 && bookPage > 0) { bookPage--; updateBookNav(); }
      }
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeOverlay();
      else if (e.key === 'ArrowLeft' && bookPage > 0) { bookPage--; updateBookNav(); }
      else if (e.key === 'ArrowRight' && bookPage < totalPages - 1) { bookPage++; updateBookNav(); }
    });

    // ── Open Overlay ──
    document.getElementById('openPlanBtn').addEventListener('click', function() {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.getElementById('planOverlayTitle').textContent =
        quizData.studentName + '\u2019s Learning Plan';

      if (storedPlan && planRendered) {
        return;
      }

      if (storedPlan) {
        bookContainer.style.display = '';
        planLoading.style.display = 'none';
        planError.style.display = 'none';
        renderPlan(storedPlan);
        return;
      }

      // No stored plan — fetch from API
      bookContainer.style.display = 'none';
      planLoading.style.display = 'flex';
      planError.style.display = 'none';

      fetch('/api/generate-plan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      })
      .then(function(res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function(data) {
        if (data.error) throw new Error(data.error);
        storedPlan = data.plan;
        try {
          localStorage.setItem('tutero_learning_plan', JSON.stringify({
            plan: data.plan, quizData: quizData, timestamp: new Date().toISOString()
          }));
        } catch (e) {}
        planLoading.style.display = 'none';
        bookContainer.style.display = '';
        renderPlan(storedPlan);
      })
      .catch(function() {
        planLoading.style.display = 'none';
        planError.style.display = 'flex';
      });
    });

    // ── Close Overlay ──
    document.getElementById('closePlanBtn').addEventListener('click', closeOverlay);
    document.getElementById('closePlanError').addEventListener('click', closeOverlay);

    function closeOverlay() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      bookPage = 0;
      updateBookNav();
      planError.style.display = 'none';
    }

    // ── Render Plan ──
    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    function getSkillColor(score) {
      if (score >= 70) return '#4CB092';
      if (score >= 50) return '#F8B200';
      if (score >= 35) return '#FF8412';
      return '#ef4444';
    }

    function renderPlan(plan) {
      renderCover(plan);
      renderTutors(plan);
      renderSkills(plan);
      renderRoadmap(plan);
      renderWeekly(plan);
      planRendered = true;
      setTimeout(animateSkillBars, 600);
    }

    function renderCover(plan) {
      var el = document.getElementById('planCover');
      var offset = 408 * (1 - plan.currentLevel / 100);
      var targetPct = Math.min(95, plan.targetLevel || plan.currentLevel + 25);

      el.innerHTML =
        '<div class="book-page-label">Profile Overview</div>' +
        '<div class="report-profile">' +
          '<div class="report-profile-label">Personalised Learning Plan</div>' +
          '<h2 class="report-profile-name">' + esc(quizData.studentName) + '</h2>' +
          '<div class="report-tags">' +
            '<span class="report-tag">' + esc(quizData.yearLevel) + '</span>' +
            '<span class="report-tag">' + esc(quizData.subject) + '</span>' +
            '<span class="report-tag">' + esc(plan.levelLabel) + '</span>' +
          '</div>' +
          '<div class="gauge-wrap">' +
            '<svg viewBox="0 0 160 160">' +
              '<circle class="gauge-bg" cx="80" cy="80" r="65"/>' +
              '<circle class="gauge-fill" cx="80" cy="80" r="65" data-offset="' + offset + '"/>' +
            '</svg>' +
            '<div class="gauge-label">' +
              '<span class="gauge-pct">' + plan.currentLevel + '%</span>' +
              '<span class="gauge-sub">Current Level</span>' +
            '</div>' +
          '</div>' +
          '<div class="spectrum-bar">' +
            '<span class="spectrum-label">Behind</span>' +
            '<div class="spectrum-track">' +
              '<div class="spectrum-marker" data-target="' + plan.currentLevel + '"></div>' +
              '<div class="spectrum-target" data-target="' + targetPct + '">\uD83C\uDFAF</div>' +
            '</div>' +
            '<span class="spectrum-label">Ahead</span>' +
          '</div>' +
          '<p class="report-disclaimer">Based on quiz responses &middot; Not a formal assessment</p>' +
        '</div>';

      setTimeout(function() {
        var g = el.querySelector('.gauge-fill');
        if (g) g.style.strokeDashoffset = g.dataset.offset;
        var m = el.querySelector('.spectrum-marker');
        if (m) m.style.left = m.dataset.target + '%';
        var t = el.querySelector('.spectrum-target');
        if (t) t.style.left = t.dataset.target + '%';
      }, 100);
    }

    function renderTutors(plan) {
      var el = document.getElementById('planTutors');
      var tm = plan.tutorMatch || {};

      el.innerHTML =
        '<div class="book-page-label">Tutor Match</div>' +
        '<h3 class="tutor-intro">Your ideal ' + esc(quizData.subject) + ' tutor for ' + esc(quizData.studentName) + '</h3>' +
        '<p class="tutor-intro-sub">Based on ' + esc(quizData.studentName) + '\u2019s learning needs and goals</p>' +
        '<div class="tutor-match-card">' +
          '<div class="tutor-match-header">' +
            '<div class="tutor-match-icon">\uD83C\uDF93</div>' +
            '<div>' +
              '<div class="tutor-match-label">Specialisation</div>' +
              '<div class="tutor-match-value">' + esc(tm.specialisation || quizData.yearLevel + ' ' + quizData.subject) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="tutor-match-badges">' +
            '<span class="tutor-match-badge"><span class="check">\u2713</span> WWCC Verified</span>' +
            '<span class="tutor-match-badge"><span class="check">\u2713</span> Qualified</span>' +
          '</div>' +
        '</div>' +
        '<div class="tutor-match-card">' +
          '<div class="tutor-match-header">' +
            '<div class="tutor-match-icon">\uD83D\uDCA1</div>' +
            '<div>' +
              '<div class="tutor-match-label">Teaching Style</div>' +
              '<div class="tutor-match-value">' + esc(tm.style || 'Supportive & structured') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tutor-match-card">' +
          '<div class="tutor-match-header">' +
            '<div class="tutor-match-icon">\u2B50</div>' +
            '<div>' +
              '<div class="tutor-match-label">Experience</div>' +
              '<div class="tutor-match-value">' + esc(tm.experience || 'Experienced educator') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    function renderSkills(plan) {
      var el = document.getElementById('planSkills');
      var skills = plan.skills || [];
      var html = '<div class="book-page-label">Skills Assessment</div>' +
        '<div class="report-section">' +
          '<div class="report-section-title"><span>\uD83D\uDCCA</span> ' + esc(quizData.subject) + ' Skills Breakdown</div>';

      for (var i = 0; i < skills.length; i++) {
        var s = skills[i];
        var c = getSkillColor(s.score);
        html += '<div class="skill-row">' +
          '<div class="skill-header">' +
            '<span class="skill-name">' + esc(s.name) + '</span>' +
            '<span class="skill-pct" style="color:' + c + '">' + s.score + '%</span>' +
          '</div>' +
          '<div class="skill-track">' +
            '<div class="skill-fill" data-width="' + s.score + '" style="background:' + c + '"></div>' +
          '</div>' +
          '<div class="skill-status">' + esc(s.status) + '</div>' +
        '</div>';
      }

      html += '</div>';
      el.innerHTML = html;
    }

    function renderRoadmap(plan) {
      var el = document.getElementById('planRoadmap');
      var roadmap = plan.roadmap || [];
      var dotCls = ['dot-orange', 'dot-yellow', 'dot-green'];
      var perCls = ['text-orange', 'text-yellow', 'text-green'];

      var html = '<div class="book-page-label">12-Week Roadmap</div>' +
        '<div class="report-section">' +
          '<div class="report-section-title"><span>\uD83D\uDDFA\uFE0F</span> ' + esc(quizData.studentName) + '\u2019s Learning Path</div>' +
          '<div class="roadmap-list"><div class="roadmap-line"></div>';

      for (var i = 0; i < roadmap.length; i++) {
        var n = roadmap[i];
        html += '<div class="roadmap-node">' +
          '<div class="roadmap-dot ' + (dotCls[i] || 'dot-green') + '">' + (i + 1) + '</div>' +
          '<div class="roadmap-period ' + (perCls[i] || 'text-green') + '">' + esc(n.period) + '</div>' +
          '<div class="roadmap-title">' + esc(n.title) + '</div>' +
          '<div class="roadmap-detail">' + esc(n.detail) + '</div>' +
        '</div>';
      }

      html += '<div class="roadmap-target">' +
        '<span class="roadmap-target-icon">\uD83C\uDFAF</span>' +
        '<span class="roadmap-target-text">Target: ' + esc(plan.targetLabel || 'Improved performance') + '</span>' +
      '</div></div></div>';

      el.innerHTML = html;
    }

    function renderWeekly(plan) {
      var el = document.getElementById('planWeekly');
      var sched = plan.schedule || {};
      var tm = plan.tutorMatch || {};

      el.innerHTML = '<div class="book-page-label">Your Plan</div>' +
        '<div class="report-section">' +
          '<div class="report-section-title"><span>\uD83D\uDCC5</span> Recommended Schedule</div>' +
          '<div class="stat-pair">' +
            '<div class="stat-box"><div class="stat-num">' + (sched.sessionsPerWeek || 2) + '</div><div class="stat-label">Sessions<br>per week</div></div>' +
            '<div class="stat-box"><div class="stat-num">' + (sched.minutesPerSession || 55) + '</div><div class="stat-label">Minutes<br>per session</div></div>' +
          '</div>' +
          '<div class="tutor-card">' +
            '<div class="tutor-card-title">Your Ideal Tutor</div>' +
            '<div class="tutor-trait"><span class="tutor-check">\u2713</span> ' + esc(tm.specialisation || quizData.subject + ' specialist') + '</div>' +
            '<div class="tutor-trait"><span class="tutor-check">\u2713</span> ' + esc(tm.style || 'Supportive & structured') + '</div>' +
            '<div class="tutor-trait"><span class="tutor-check">\u2713</span> ' + esc(tm.experience || 'Experienced educator') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="outcome-card">' +
          '<div class="outcome-statement">' + esc(plan.outcomeStatement || '') + '</div>' +
          '<div class="outcome-proof">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4CB092" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
            'Love it or your first lesson is free' +
          '</div>' +
        '</div>';
    }

    function animateSkillBars() {
      var bars = document.querySelectorAll('.skill-fill[data-width]');
      for (var i = 0; i < bars.length; i++) {
        bars[i].style.width = bars[i].dataset.width + '%';
      }
    }
  }

  window.TuteroPlanViewer = { init: init };
})();
