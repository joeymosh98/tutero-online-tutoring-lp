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
  var currentPageType = 'lp'; // 'lp' or 'tp'
  var filters = { status: 'all', builtWith: 'all', grade: 'all' };
  var currentSort = 'name-asc';
  var currentSearch = '';
  var isAuthenticated = !!sessionStorage.getItem('cms_token');
  var editingPage = null; // page object currently being edited
  var editingDivision = null; // division containing the page being edited

  function getCurrentPages(division) {
    if (!division) return [];
    if (currentPageType === 'tp') return division.thankYouPages || [];
    if (currentPageType === 'mp') return division.marketplacePages || [];
    return division.pages;
  }

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
  var lockBtn = document.getElementById('lockBtn');
  var pageTypeSelect = document.getElementById('pageTypeSelect');

  // Login screen refs
  var loginScreen = document.getElementById('loginScreen');
  var dashboardContent = document.getElementById('dashboardContent');
  var authPasswordInput = document.getElementById('authPasswordInput');
  var authError = document.getElementById('authError');
  var authSubmitBtn = document.getElementById('authSubmitBtn');

  // Edit modal refs
  var editModal = document.getElementById('editModal');
  var editModalTitle = document.getElementById('editModalTitle');
  var editModalBody = document.getElementById('editModalBody');
  var editError = document.getElementById('editError');
  var editSuccess = document.getElementById('editSuccess');
  var editSaveBtn = document.getElementById('editSaveBtn');
  var editCancelBtn = document.getElementById('editCancelBtn');
  var editCloseBtn = document.getElementById('editCloseBtn');

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

  // ── Auth State ──

  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardContent.style.display = '';
    lockBtn.title = 'Sign out';
  }

  // If already authenticated from sessionStorage, show dashboard immediately
  if (isAuthenticated) {
    showDashboard();
  }

  // ── Fetch registry (Blob first, then static JSON fallback) ──

  function loadConfig() {
    fetch('/api/cms-content?key=landing-pages&v=' + Date.now())
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.divisions && data.divisions.length > 0) {
          divisions = data.divisions;
          renderTabs();
          handleRoute();
        } else {
          // Blob empty — fall back to static JSON
          return loadStaticJson();
        }
      })
      .catch(function() {
        // API error — fall back to static JSON
        return loadStaticJson();
      });
  }

  function loadStaticJson() {
    return fetch('./landing-pages.json?v=' + Date.now())
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
  }

  // Only load config if already authenticated
  if (isAuthenticated) {
    loadConfig();
  }

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
      var count = getCurrentPages(div).length;
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
    var pages = getCurrentPages(currentDivision).slice();

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
    if (getCurrentPages(currentDivision).length === 0) {
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

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
        'Variant ' + v.id.toUpperCase() + (v.label ? ' &mdash; ' + escapeHtml(v.label) : '') +
        '</a>';
    }).join('');

    var splitterBadge = '';
    if (page.hasSplitter && page.splitterPath) {
      splitterBadge = '<a href="' + page.splitterPath + '" target="_blank" class="lp-variant-badge lp-splitter-badge" title="Open A/B Splitter">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>' +
        'A/B Splitter' +
        '</a>';
    }

    // Linkage badge (LP ↔ TP)
    var linkedBadge = '';
    if (currentPageType === 'lp' && page.thankYouPageId && currentDivision.thankYouPages) {
      var linkedTp = currentDivision.thankYouPages.find(function(tp) { return tp.id === page.thankYouPageId; });
      if (linkedTp) {
        linkedBadge = '<a href="' + linkedTp.variants[0].path + '" target="_blank" class="lp-variant-badge lp-linked-badge" title="Thank You Page">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,11 12,14 15,11"/><line x1="12" y1="14" x2="12" y2="4"/><path d="M20 21H4a2 2 0 01-2-2v-2h20v2a2 2 0 01-2 2z"/></svg>' +
          '&rarr; Thank You Page' +
        '</a>';
      }
    }
    if (currentPageType === 'tp' && page.linkedLandingPageId && currentDivision.pages) {
      var linkedLp = currentDivision.pages.find(function(lp) { return lp.id === page.linkedLandingPageId; });
      if (linkedLp) {
        linkedBadge = '<a href="' + linkedLp.variants[0].path + '" target="_blank" class="lp-variant-badge lp-linked-badge" title="Landing Page">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,13 12,10 9,13"/><line x1="12" y1="10" x2="12" y2="20"/><path d="M20 3H4a2 2 0 00-2 2v2h20V5a2 2 0 00-2-2z"/></svg>' +
          '&larr; Landing Page' +
        '</a>';
      }
    }

    var tags = (page.tags || []).map(function(t) {
      return '<span class="lp-tag">' + escapeHtml(t) + '</span>';
    }).join('');

    // Notes preview (if exists)
    var notesHtml = '';
    if (page.notes) {
      notesHtml = '<p class="lp-card-notes">' + escapeHtml(page.notes) + '</p>';
    }

    // Actions — edit button shown when authenticated
    var editBtn = '';
    if (isAuthenticated) {
      editBtn = '<button class="lp-action-btn lp-action-btn--edit" data-action="edit-page" data-page="' + page.id + '" title="Edit properties">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
        'Edit' +
      '</button>';
    }

    var actions = '<div class="lp-card-actions">' +
      '<button class="lp-action-btn" data-action="copy-link" data-page="' + page.id + '" title="Copy live URL">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
        'Copy Link' +
      '</button>' +
      editBtn +
      '</div>';

    var previewPath = page.variants[0].path;
    var variantsJson = JSON.stringify(page.variants).replace(/"/g, '&quot;');

    // Variant switcher (only for 2+ variants)
    var variantSwitcher = '';
    if (page.variants.length > 1) {
      var tabs = page.variants.map(function(v, i) {
        return '<button class="lp-variant-tab' + (i === 0 ? ' active' : '') + '" data-variant-index="' + i + '" title="' + escapeHtml(v.label || 'Variant ' + v.id.toUpperCase()) + '">' +
          v.id.toUpperCase() + ' &mdash; ' + escapeHtml(v.label || '') +
        '</button>';
      }).join('');
      variantSwitcher = '<div class="lp-variant-switcher">' + tabs + '</div>';
    }

    return '<div class="' + cardClass + '" data-page-id="' + page.id + '">' +
      '<div class="lp-card-preview" data-preview-src="' + previewPath + '" data-variants="' + variantsJson + '" data-current-variant="0">' +
        '<div class="lp-card-preview-loading">Loading preview&hellip;</div>' +
        '<span class="lp-card-status ' + statusClass + '">' + page.status + '</span>' +
        '<div class="lp-card-preview-panels">' +
          '<div class="lp-preview-panel lp-preview-panel--desktop">' +
            '<span class="lp-preview-label">Desktop</span>' +
            '<div class="lp-preview-frame lp-preview-frame--desktop"></div>' +
          '</div>' +
          '<div class="lp-preview-panel lp-preview-panel--mobile">' +
            '<span class="lp-preview-label">Mobile</span>' +
            '<div class="lp-preview-frame lp-preview-frame--mobile"></div>' +
          '</div>' +
        '</div>' +
        variantSwitcher +
      '</div>' +
      '<div class="lp-card-body">' +
        '<h3 class="lp-card-name">' + escapeHtml(page.name) + '</h3>' +
        '<p class="lp-card-desc">' + escapeHtml(page.description) + '</p>' +
        notesHtml +
        propsRow +
        '<div class="lp-card-meta">' + variantBadges + splitterBadge + linkedBadge + tags + '</div>' +
        actions +
      '</div>' +
    '</div>';
  }

  function updateCount() {
    if (!currentDivision) return;
    var pages = getCurrentPages(currentDivision);
    var total = pages.length;
    var active = pages.filter(function(p) { return p.status === 'active'; }).length;
    pageCount.textContent = active + ' active / ' + total + ' total';
  }

  // ── Division Empty State ──

  function showDivisionEmpty() {
    hideDivisionEmpty();

    var colors = divisionColors[currentDivision.color] || divisionColors['orange'];
    var icon = divisionIcons[currentDivision.icon] || divisionIcons['graduation-cap'];

    var el = document.createElement('div');
    el.id = 'divisionEmpty';
    el.className = 'dash-empty-division';
    var pageTypeLabels = { lp: 'landing pages', tp: 'thank you pages', mp: 'marketplace pages' };
    var pageTypeLabel = pageTypeLabels[currentPageType] || 'pages';
    var pageTypeCaps = { lp: 'Landing pages', tp: 'Thank you pages', mp: 'Marketplace pages' };
    var pageTypeCap = pageTypeCaps[currentPageType] || 'Pages';
    el.innerHTML =
      '<div class="dash-empty-division-icon" style="background:' + colors.bg + ';color:' + colors.solid + ';">' + icon + '</div>' +
      '<h3>No ' + currentDivision.name.toLowerCase() + ' ' + pageTypeLabel + ' yet</h3>' +
      '<p>' + pageTypeCap + ' for the ' + currentDivision.name + ' division will appear here once they are created.</p>';

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

    var desktopFrame = container.querySelector('.lp-preview-frame--desktop');
    var mobileFrame = container.querySelector('.lp-preview-frame--mobile');
    var loadingEl = container.querySelector('.lp-card-preview-loading');
    var loadCount = 0;

    function onIframeLoad() {
      loadCount++;
      if (loadCount >= 2 && loadingEl) {
        loadingEl.classList.add('hidden');
      }
    }

    // Desktop iframe
    if (desktopFrame) {
      var desktopIframe = document.createElement('iframe');
      desktopIframe.src = src;
      desktopIframe.setAttribute('loading', 'lazy');
      desktopIframe.setAttribute('sandbox', 'allow-same-origin');
      desktopIframe.setAttribute('tabindex', '-1');
      desktopIframe.setAttribute('aria-hidden', 'true');
      desktopIframe.addEventListener('load', onIframeLoad);
      var frameWidth = desktopFrame.offsetWidth || 232;
      desktopIframe.style.transform = 'scale(' + (frameWidth / 1440) + ')';
      desktopFrame.appendChild(desktopIframe);
    }

    // Mobile iframe
    if (mobileFrame) {
      var mobileIframe = document.createElement('iframe');
      mobileIframe.src = src;
      mobileIframe.setAttribute('loading', 'lazy');
      mobileIframe.setAttribute('sandbox', 'allow-same-origin');
      mobileIframe.setAttribute('tabindex', '-1');
      mobileIframe.setAttribute('aria-hidden', 'true');
      mobileIframe.addEventListener('load', onIframeLoad);
      mobileIframe.style.transform = 'scale(0.197)';
      mobileFrame.appendChild(mobileIframe);
    }

    setTimeout(function() {
      if (loadingEl) loadingEl.classList.add('hidden');
    }, 5000);
  }

  // ── Variant Switching ──

  function switchVariant(container, index) {
    var variants = JSON.parse(container.getAttribute('data-variants') || '[]');
    if (index < 0 || index >= variants.length) return;
    var currentIndex = parseInt(container.getAttribute('data-current-variant') || '0', 10);
    if (index === currentIndex) return;

    container.setAttribute('data-current-variant', index);
    var newSrc = variants[index].path;

    // Update active tab
    container.querySelectorAll('.lp-variant-tab').forEach(function(tab) {
      tab.classList.toggle('active', parseInt(tab.getAttribute('data-variant-index'), 10) === index);
    });

    // Show loading state
    var loadingEl = container.querySelector('.lp-card-preview-loading');
    if (loadingEl) loadingEl.classList.remove('hidden');

    var loadCount = 0;
    function onLoad() {
      loadCount++;
      if (loadCount >= 2 && loadingEl) loadingEl.classList.add('hidden');
    }

    // Replace desktop iframe
    var desktopFrame = container.querySelector('.lp-preview-frame--desktop');
    if (desktopFrame) {
      desktopFrame.innerHTML = '';
      var desktopIframe = document.createElement('iframe');
      desktopIframe.src = newSrc;
      desktopIframe.setAttribute('loading', 'lazy');
      desktopIframe.setAttribute('sandbox', 'allow-same-origin');
      desktopIframe.setAttribute('tabindex', '-1');
      desktopIframe.setAttribute('aria-hidden', 'true');
      desktopIframe.addEventListener('load', onLoad);
      var frameWidth = desktopFrame.offsetWidth || 232;
      desktopIframe.style.transform = 'scale(' + (frameWidth / 1440) + ')';
      desktopFrame.appendChild(desktopIframe);
    }

    // Replace mobile iframe
    var mobileFrame = container.querySelector('.lp-preview-frame--mobile');
    if (mobileFrame) {
      mobileFrame.innerHTML = '';
      var mobileIframe = document.createElement('iframe');
      mobileIframe.src = newSrc;
      mobileIframe.setAttribute('loading', 'lazy');
      mobileIframe.setAttribute('sandbox', 'allow-same-origin');
      mobileIframe.setAttribute('tabindex', '-1');
      mobileIframe.setAttribute('aria-hidden', 'true');
      mobileIframe.addEventListener('load', onLoad);
      mobileIframe.style.transform = 'scale(0.197)';
      mobileFrame.appendChild(mobileIframe);
    }

    // Fallback timeout
    setTimeout(function() {
      if (loadingEl) loadingEl.classList.add('hidden');
    }, 5000);
  }

  // ── Login ──

  function submitAuth() {
    var pw = authPasswordInput.value;
    if (!pw) return;
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Signing in...';

    fetch('/api/cms-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = 'Sign In';
        if (data.valid) {
          sessionStorage.setItem('cms_token', pw);
          isAuthenticated = true;
          showDashboard();
          loadConfig();
        } else {
          authError.style.display = 'block';
        }
      })
      .catch(function() {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = 'Sign In';
        authError.textContent = 'Connection error. Try again.';
        authError.style.display = 'block';
      });
  }

  // Logout button
  lockBtn.addEventListener('click', function() {
    sessionStorage.removeItem('cms_token');
    window.location.reload();
  });

  authSubmitBtn.addEventListener('click', submitAuth);
  authPasswordInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') submitAuth();
  });

  // ── Edit Modal ──

  function findPageInDivisions(pageId) {
    for (var i = 0; i < divisions.length; i++) {
      var div = divisions[i];
      var pages = getCurrentPages(div);
      for (var j = 0; j < pages.length; j++) {
        if (pages[j].id === pageId) {
          return { division: div, page: pages[j], index: j };
        }
      }
    }
    return null;
  }

  function openEditModal(pageId) {
    var found = findPageInDivisions(pageId);
    if (!found) return;
    editingPage = found.page;
    editingDivision = found.division;

    editModalTitle.textContent = 'Edit: ' + editingPage.name;
    editError.style.display = 'none';
    editSuccess.style.display = 'none';
    editSaveBtn.disabled = false;
    editSaveBtn.textContent = 'Save Changes';

    // Build form
    var html = '';

    // Page Details section
    html += '<div class="cms-section-label">Page Details</div>';

    html += '<div class="cms-field">' +
      '<label class="cms-label" for="editName">Name</label>' +
      '<input type="text" id="editName" class="cms-input" value="' + escapeHtml(editingPage.name) + '">' +
    '</div>';

    html += '<div class="cms-field">' +
      '<label class="cms-label" for="editDesc">Description</label>' +
      '<input type="text" id="editDesc" class="cms-input" value="' + escapeHtml(editingPage.description) + '">' +
    '</div>';

    html += '<div class="cms-field">' +
      '<label class="cms-label" for="editStatus">Status</label>' +
      '<select id="editStatus" class="cms-select">' +
        '<option value="active"' + (editingPage.status === 'active' ? ' selected' : '') + '>Active</option>' +
        '<option value="draft"' + (editingPage.status === 'draft' ? ' selected' : '') + '>Draft</option>' +
        '<option value="paused"' + (editingPage.status === 'paused' ? ' selected' : '') + '>Paused</option>' +
        '<option value="archived"' + (editingPage.status === 'archived' ? ' selected' : '') + '>Archived</option>' +
      '</select>' +
    '</div>';

    html += '<div class="cms-field">' +
      '<label class="cms-label" for="editGrade">Grade</label>' +
      '<select id="editGrade" class="cms-select">' +
        '<option value=""' + (!editingPage.grade ? ' selected' : '') + '>Ungraded</option>' +
        '<option value="green"' + (editingPage.grade === 'green' ? ' selected' : '') + '>Green</option>' +
        '<option value="amber"' + (editingPage.grade === 'amber' ? ' selected' : '') + '>Amber</option>' +
        '<option value="red"' + (editingPage.grade === 'red' ? ' selected' : '') + '>Red</option>' +
      '</select>' +
    '</div>';

    // Tags
    var currentTags = editingPage.tags || [];
    html += '<div class="cms-field">' +
      '<label class="cms-label">Tags</label>' +
      '<div class="cms-tag-list" id="editTagList">' +
        currentTags.map(function(t) {
          return '<span class="cms-tag-pill" data-tag="' + escapeHtml(t) + '">' +
            escapeHtml(t) +
            '<button class="cms-tag-remove" data-remove-tag="' + escapeHtml(t) + '">&times;</button>' +
          '</span>';
        }).join('') +
      '</div>' +
      '<input type="text" id="editTagInput" class="cms-input" placeholder="Add tag and press Enter">' +
    '</div>';

    // Notes
    html += '<div class="cms-field">' +
      '<label class="cms-label" for="editNotes">Notes</label>' +
      '<textarea id="editNotes" class="cms-textarea" placeholder="Internal notes...">' + escapeHtml(editingPage.notes || '') + '</textarea>' +
    '</div>';

    // Variant Labels section
    if (editingPage.variants && editingPage.variants.length > 0) {
      html += '<div class="cms-section-label">Variant Labels</div>';
      editingPage.variants.forEach(function(v, i) {
        html += '<div class="cms-field">' +
          '<label class="cms-label" for="editVariant' + i + '">Variant ' + v.id.toUpperCase() + ' Label</label>' +
          '<input type="text" id="editVariant' + i + '" class="cms-input" data-variant-index="' + i + '" value="' + escapeHtml(v.label || '') + '">' +
        '</div>';
      });
    }

    editModalBody.innerHTML = html;
    editModal.style.display = 'flex';

    // Focus first field
    var firstInput = editModalBody.querySelector('.cms-input');
    if (firstInput) firstInput.focus();

    // Tag input handler
    var tagInput = document.getElementById('editTagInput');
    tagInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = tagInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (!val) return;
        addTag(val);
        tagInput.value = '';
      }
    });
  }

  function addTag(tag) {
    var tagList = document.getElementById('editTagList');
    // Check if already exists
    var existing = tagList.querySelector('[data-tag="' + tag + '"]');
    if (existing) return;

    var pill = document.createElement('span');
    pill.className = 'cms-tag-pill';
    pill.setAttribute('data-tag', tag);
    pill.innerHTML = escapeHtml(tag) + '<button class="cms-tag-remove" data-remove-tag="' + escapeHtml(tag) + '">&times;</button>';
    tagList.appendChild(pill);
  }

  function removeTag(tag) {
    var tagList = document.getElementById('editTagList');
    var pill = tagList.querySelector('[data-tag="' + tag + '"]');
    if (pill) pill.remove();
  }

  function hideEditModal() {
    editModal.style.display = 'none';
    editingPage = null;
    editingDivision = null;
  }

  function getEditedTags() {
    var tagList = document.getElementById('editTagList');
    var pills = tagList.querySelectorAll('.cms-tag-pill');
    var tags = [];
    pills.forEach(function(pill) {
      tags.push(pill.getAttribute('data-tag'));
    });
    return tags;
  }

  function saveEdit() {
    if (!editingPage || !editingDivision) return;

    // Read form values
    var newName = document.getElementById('editName').value.trim();
    var newDesc = document.getElementById('editDesc').value.trim();
    var newStatus = document.getElementById('editStatus').value;
    var newGrade = document.getElementById('editGrade').value || null;
    var newNotes = document.getElementById('editNotes').value.trim() || null;
    var newTags = getEditedTags();

    if (!newName) {
      editError.textContent = 'Name is required.';
      editError.style.display = 'block';
      return;
    }

    // Read variant labels
    var variantInputs = editModalBody.querySelectorAll('[data-variant-index]');
    var newVariantLabels = {};
    variantInputs.forEach(function(input) {
      var idx = parseInt(input.getAttribute('data-variant-index'), 10);
      newVariantLabels[idx] = input.value.trim();
    });

    // Apply changes to the in-memory page object
    editingPage.name = newName;
    editingPage.description = newDesc;
    editingPage.status = newStatus;
    editingPage.grade = newGrade;
    editingPage.tags = newTags;
    editingPage.notes = newNotes;

    // Update variant labels
    if (editingPage.variants) {
      editingPage.variants.forEach(function(v, i) {
        if (newVariantLabels[i] !== undefined) {
          v.label = newVariantLabels[i];
        }
      });
    }

    // Save to API
    editSaveBtn.disabled = true;
    editSaveBtn.textContent = 'Saving...';
    editError.style.display = 'none';
    editSuccess.style.display = 'none';

    var token = sessionStorage.getItem('cms_token');
    fetch('/api/cms-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ config: { divisions: divisions } })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        editSaveBtn.disabled = false;
        editSaveBtn.textContent = 'Save Changes';
        if (data.success) {
          editSuccess.style.display = 'block';
          setTimeout(function() {
            hideEditModal();
            renderTabs();
            render();
          }, 800);
        } else {
          editError.textContent = data.error || 'Failed to save. Try again.';
          editError.style.display = 'block';
        }
      })
      .catch(function() {
        editSaveBtn.disabled = false;
        editSaveBtn.textContent = 'Save Changes';
        editError.textContent = 'Connection error. Try again.';
        editError.style.display = 'block';
      });
  }

  editCancelBtn.addEventListener('click', hideEditModal);
  editCloseBtn.addEventListener('click', hideEditModal);
  editSaveBtn.addEventListener('click', saveEdit);

  // Close edit modal on overlay click
  editModal.addEventListener('click', function(e) {
    if (e.target === editModal) hideEditModal();
  });

  // ── Event Listeners ──

  pageTypeSelect.addEventListener('change', function() {
    var newType = this.value;
    if (newType !== currentPageType) {
      currentPageType = newType;
      filters = { status: 'all', builtWith: 'all', grade: 'all' };
      currentSort = 'name-asc';
      currentSearch = '';
      searchInput.value = '';
      filterStatus.value = 'all';
      filterBuiltWith.value = 'all';
      filterGrade.value = 'all';
      sortBy.value = 'name-asc';
      var placeholders = { lp: 'Search landing pages...', tp: 'Search thank you pages...', mp: 'Search marketplace pages...' };
      searchInput.placeholder = placeholders[currentPageType] || 'Search pages...';
      renderTabs();
      render();
    }
  });

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
    // Tag remove button
    var removeBtn = e.target.closest('.cms-tag-remove');
    if (removeBtn) {
      var tag = removeBtn.getAttribute('data-remove-tag');
      if (tag) removeTag(tag);
      return;
    }

    // Variant switcher
    var variantTab = e.target.closest('.lp-variant-tab');
    if (variantTab) {
      var container = variantTab.closest('.lp-card-preview');
      var index = parseInt(variantTab.getAttribute('data-variant-index'), 10);
      if (container && !isNaN(index)) switchVariant(container, index);
      return;
    }

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
    var page = getCurrentPages(currentDivision).find(function(p) { return p.id === pageId; });
    if (!page) return;

    if (action === 'copy-link') {
      var url = window.location.origin + (page.hasSplitter ? page.splitterPath : page.variants[0].path);
      navigator.clipboard.writeText(url).then(function() {
        var original = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg> Copied!';
        setTimeout(function() { btn.innerHTML = original; }, 2000);
      });
    }

    if (action === 'edit-page') {
      openEditModal(pageId);
    }
  });

})();
