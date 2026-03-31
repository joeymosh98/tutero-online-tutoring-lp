(function() {
  'use strict';

  // ── Constants ──

  var PLATFORMS = {
    'custom-html': 'Custom HTML',
    'webflow': 'Webflow'
  };

  var GRADE_ORDER = ['green', 'amber', 'red'];

  var GRADE_LABELS = {
    'green': 'Green',
    'amber': 'Amber',
    'red': 'Red'
  };

  var GRADE_CLASSES = {
    'green': 'lp-grade-green',
    'amber': 'lp-grade-amber',
    'red':   'lp-grade-red'
  };

  // ── State ──

  var divisions = [];
  var currentDivision = null;
  var filters = { status: 'all', builtWith: 'all', grade: 'all' };
  var currentSort = 'name-asc';
  var currentSearch = '';

  // ── DOM refs ──

  var grid = document.getElementById('pageGrid');
  var emptyState = document.getElementById('emptyState');
  var pageCount = document.getElementById('pageCount');
  var searchInput = document.getElementById('searchInput');
  var tabsNav = document.getElementById('divisionTabs');
  var filterStatus = document.getElementById('filterStatus');
  var filterBuiltWith = document.getElementById('filterBuiltWith');
  var filterGrade = document.getElementById('filterGrade');
  var sortBy = document.getElementById('sortBy');

  // ── Icons & Colors ──

  var divisionIcons = {
    'graduation-cap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>',
    'building': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>'
  };

  var divisionColors = {
    'orange': { solid: 'var(--color-orange)', bg: 'rgba(255, 132, 18, 0.1)' },
    'dark-blue': { solid: 'var(--color-dark-blue)', bg: 'rgba(29, 73, 227, 0.1)' },
    'green': { solid: 'var(--color-green)', bg: 'rgba(76, 176, 146, 0.1)' },
    'blue': { solid: 'var(--color-blue)', bg: 'rgba(0, 163, 255, 0.1)' }
  };

  // ── Fetch registry ──

  fetch('./landing-pages.json')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      divisions = data.divisions;
      renderTabs();
      handleRoute();
    })
    .catch(function(err) {
      console.error('Failed to load landing pages registry:', err);
      grid.innerHTML = '<p style="padding:40px;color:#888;">Failed to load landing pages. Check that landing-pages.json exists.</p>';
    });

  // ── Routing ──

  function handleRoute() {
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      var div = divisions.find(function(d) { return d.id === hash; });
      if (div) { selectDivision(div); return; }
    }
    if (divisions.length > 0) selectDivision(divisions[0]);
  }

  window.addEventListener('hashchange', handleRoute);

  // ── Tabs ──

  function renderTabs() {
    var inner = '<div class="dash-tabs-inner">';
    inner += divisions.map(function(div) {
      var colors = divisionColors[div.color] || divisionColors['orange'];
      var icon = divisionIcons[div.icon] || '';
      var count = div.pages.length;
      return '<button class="dash-tab" data-division="' + div.id + '" ' +
        'style="--tab-color:' + colors.solid + ';--tab-color-bg:' + colors.bg + ';">' +
        '<span class="dash-tab-icon">' + icon + '</span>' +
        div.name +
        '<span class="dash-tab-count">' + count + '</span>' +
      '</button>';
    }).join('');
    inner += '</div>';
    tabsNav.innerHTML = inner;
  }

  function selectDivision(div) {
    currentDivision = div;

    // Reset filters and sort
    filters = { status: 'all', builtWith: 'all', grade: 'all' };
    currentSort = 'name-asc';
    currentSearch = '';
    searchInput.value = '';
    filterStatus.value = 'all';
    filterBuiltWith.value = 'all';
    filterGrade.value = 'all';
    sortBy.value = 'name-asc';

    // Theme body
    document.body.className = 'division-' + div.id;

    // Update active tab
    document.querySelectorAll('.dash-tab').forEach(function(t) { t.classList.remove('active'); });
    var activeTab = document.querySelector('.dash-tab[data-division="' + div.id + '"]');
    if (activeTab) activeTab.classList.add('active');

    // Update hash
    if (window.location.hash !== '#' + div.id) {
      history.replaceState(null, '', '#' + div.id);
    }

    render();
  }

  // ── Filtering & Sorting ──

  function getFilteredAndSorted() {
    if (!currentDivision) return [];
    var pages = currentDivision.pages.slice();

    // Filter
    pages = pages.filter(function(page) {
      if (filters.status !== 'all' && page.status !== filters.status) return false;
      if (filters.builtWith !== 'all' && page.builtWith !== filters.builtWith) return false;
      if (filters.grade !== 'all') {
        if (filters.grade === 'ungraded') {
          if (page.grade !== null && page.grade !== undefined) return false;
        } else {
          if (page.grade !== filters.grade) return false;
        }
      }
      if (currentSearch) {
        var q = currentSearch.toLowerCase();
        var haystack = (page.name + ' ' + page.description + ' ' + (page.tags || []).join(' ')).toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });

    // Sort
    pages.sort(function(a, b) {
      switch (currentSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        case 'oldest':
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        case 'grade-desc':
          return gradeRank(a.grade) - gradeRank(b.grade);
        case 'grade-asc':
          return gradeRank(b.grade) - gradeRank(a.grade);
        default:
          return 0;
      }
    });

    return pages;
  }

  function gradeRank(grade) {
    if (!grade) return GRADE_ORDER.length + 1; // ungraded sorts last for desc, first for asc
    var idx = GRADE_ORDER.indexOf(grade);
    return idx === -1 ? GRADE_ORDER.length : idx;
  }

  // ── Render ──

  function render() {
    if (!currentDivision) return;

    // Division with zero pages
    if (currentDivision.pages.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'none';
      showDivisionEmpty();
      updateCount();
      return;
    }

    hideDivisionEmpty();

    var filtered = getFilteredAndSorted();

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      grid.innerHTML = filtered.map(renderCard).join('');
      initPreviews();
    }
    updateCount();
  }

  function renderCard(page) {
    var statusClass = 'lp-card-status--' + page.status;
    var cardClass = page.status === 'archived' ? 'lp-card archived' : 'lp-card';

    // Property pills
    var platformLabel = PLATFORMS[page.builtWith] || page.builtWith || 'Unknown';
    var gradeHtml = '';
    if (page.grade && GRADE_LABELS[page.grade]) {
      var gradeClass = GRADE_CLASSES[page.grade] || 'lp-grade-none';
      gradeHtml = '<span class="lp-prop lp-prop--grade ' + gradeClass + '"><span class="lp-grade-dot"></span>' + GRADE_LABELS[page.grade] + '</span>';
    } else {
      gradeHtml = '<span class="lp-prop lp-prop--grade lp-grade-none">Ungraded</span>';
    }

    var propsRow = '<div class="lp-card-props">' +
      '<span class="lp-prop lp-prop--platform">' + platformLabel + '</span>' +
      gradeHtml +
    '</div>';

    // Variant badges
    var variantBadges = page.variants.map(function(v) {
      return '<a href="' + v.path + '" target="_blank" class="lp-variant-badge" title="Open Variant ' + v.id.toUpperCase() + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
        'Variant ' + v.id.toUpperCase() + (v.label ? ' &mdash; ' + v.label : '') +
        '</a>';
    }).join('');

    var splitterBadge = '';
    if (page.hasSplitter && page.splitterPath) {
      splitterBadge = '<a href="' + page.splitterPath + '" target="_blank" class="lp-variant-badge lp-splitter-badge" title="Open A/B Splitter">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>' +
        'A/B Splitter' +
        '</a>';
    }

    var tags = (page.tags || []).map(function(t) {
      return '<span class="lp-tag">' + t + '</span>';
    }).join('');

    var actions = '<div class="lp-card-actions">' +
      '<button class="lp-action-btn" data-action="copy-link" data-page="' + page.id + '" title="Copy live URL">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
        'Copy Link' +
      '</button>' +
      '</div>';

    var previewPath = page.variants[0].path;

    return '<div class="' + cardClass + '" data-page-id="' + page.id + '">' +
      '<div class="lp-card-preview" data-preview-src="' + previewPath + '">' +
        '<div class="lp-card-preview-loading">Loading preview&hellip;</div>' +
        '<span class="lp-card-status ' + statusClass + '">' + page.status + '</span>' +
      '</div>' +
      '<div class="lp-card-body">' +
        '<h3 class="lp-card-name">' + page.name + '</h3>' +
        '<p class="lp-card-desc">' + page.description + '</p>' +
        propsRow +
        '<div class="lp-card-meta">' + variantBadges + splitterBadge + tags + '</div>' +
        actions +
      '</div>' +
    '</div>';
  }

  function updateCount() {
    if (!currentDivision) return;
    var total = currentDivision.pages.length;
    var active = currentDivision.pages.filter(function(p) { return p.status === 'active'; }).length;
    pageCount.textContent = active + ' active / ' + total + ' total';
  }

  // ── Division Empty State ──

  function showDivisionEmpty() {
    var existing = document.getElementById('divisionEmpty');
    if (existing) { existing.style.display = ''; return; }

    var colors = divisionColors[currentDivision.color] || divisionColors['orange'];
    var icon = divisionIcons[currentDivision.icon] || divisionIcons['graduation-cap'];

    var el = document.createElement('div');
    el.id = 'divisionEmpty';
    el.className = 'dash-empty-division';
    el.innerHTML =
      '<div class="dash-empty-division-icon" style="background:' + colors.bg + ';color:' + colors.solid + ';">' + icon + '</div>' +
      '<h3>No ' + currentDivision.name.toLowerCase() + ' landing pages yet</h3>' +
      '<p>Landing pages for the ' + currentDivision.name + ' division will appear here once they are created.</p>';

    grid.parentNode.appendChild(el);
  }

  function hideDivisionEmpty() {
    var existing = document.getElementById('divisionEmpty');
    if (existing) existing.remove();
  }

  // ── Preview Thumbnails (lazy iframe loading) ──

  function initPreviews() {
    var previewEls = document.querySelectorAll('.lp-card-preview[data-preview-src]');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            loadPreview(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px' });
      previewEls.forEach(function(el) { observer.observe(el); });
    } else {
      previewEls.forEach(loadPreview);
    }
  }

  function loadPreview(container) {
    var src = container.getAttribute('data-preview-src');
    if (!src) return;
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('sandbox', 'allow-same-origin');
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.addEventListener('load', function() {
      var loading = container.querySelector('.lp-card-preview-loading');
      if (loading) loading.classList.add('hidden');
    });
    setTimeout(function() {
      var loading = container.querySelector('.lp-card-preview-loading');
      if (loading) loading.classList.add('hidden');
    }, 5000);
    container.insertBefore(iframe, container.firstChild);
  }

  // ── Event Listeners ──

  searchInput.addEventListener('input', function() {
    currentSearch = this.value.trim();
    render();
  });

  filterStatus.addEventListener('change', function() {
    filters.status = this.value;
    render();
  });

  filterBuiltWith.addEventListener('change', function() {
    filters.builtWith = this.value;
    render();
  });

  filterGrade.addEventListener('change', function() {
    filters.grade = this.value;
    render();
  });

  sortBy.addEventListener('change', function() {
    currentSort = this.value;
    render();
  });

  // ── Action handlers (delegated) ──

  document.addEventListener('click', function(e) {
    // Tab click
    var tab = e.target.closest('.dash-tab');
    if (tab) {
      var divId = tab.getAttribute('data-division');
      var div = divisions.find(function(d) { return d.id === divId; });
      if (div) selectDivision(div);
      return;
    }

    // Action button click
    var btn = e.target.closest('.lp-action-btn');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var pageId = btn.getAttribute('data-page');
    if (!currentDivision) return;
    var page = currentDivision.pages.find(function(p) { return p.id === pageId; });
    if (!page) return;

    if (action === 'copy-link') {
      var url = window.location.origin + (page.hasSplitter ? page.splitterPath : page.variants[0].path);
      navigator.clipboard.writeText(url).then(function() {
        var original = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg> Copied!';
        setTimeout(function() { btn.innerHTML = original; }, 2000);
      });
    }
  });

})();
