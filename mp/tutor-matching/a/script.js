// ═══════════════════════════════════════════════════════════════
// Tutero Tutor Matching — Combined Flow
// Screens: thinking | contact | match | checkout
// ═══════════════════════════════════════════════════════════════

var State = {
  student: {
    name: 'Emma',
    yearLevel: 'Year 8',
    subject: 'Maths',
    parentName: 'Sarah',
    situation: 'falling-behind',
    currentGrade: 'below',
    confidence: 'low',
    struggleArea: 'algebra-equations',
    state: 'NSW',
    struggle: 'Falling behind in algebra, losing confidence in class',
    goal: 'Catch up to class level before mid-year exams',
    learningStyle: 'Needs patience \u2014 shuts down when rushed',
    availability: 'After school, Tue\u2013Thu'
  },
  contact: {
    phone: '',
    digits: '',
    email: '',
    parentName: ''
  },
  tutors: [
    {
      name: 'Sarah R.',
      initials: 'SR',
      suitability: 97,
      tagline: 'Year 7\u201312 Maths specialist \u00B7 6 years experience',
      photo: '/lp/special-needs-tutoring/a/images/hero-tutor-profile.png',
      whyStatements: [
        'Specialises in building confidence for students who are falling behind',
        'Experienced with Year 8 curriculum and algebra foundations',
        'Patient, encouraging teaching style \u2014 perfect for {name}'
      ],
      bio: 'I believe every student can love maths \u2014 they just need someone who explains it the right way for them. I specialise in making abstract concepts click through real-world examples and lots of patience.',
      stats: {
        years: 6,
        students: 84,
        gradeImprovement: '1.5',
        education: 'B.Ed (Mathematics), University of Sydney',
        responseTime: 'Typically responds within 2 hours'
      }
    },
    {
      name: 'Emily K.',
      initials: 'EK',
      suitability: 91,
      tagline: 'Year 7\u201310 Maths specialist \u00B7 5 years experience',
      photo: '/shared/images/teacher-photo.jpg',
      stats: {
        years: 5,
        students: 62,
        gradeImprovement: '1.2',
        education: 'B.Sc (Mathematics), University of Melbourne',
        responseTime: 'Typically responds within 3 hours'
      }
    }
  ],
  reviews: [
    { text: 'Within two weeks, my daughter went from dreading Maths homework to actually asking to do extra practice. Her tutor just gets her.', author: 'Karen M.', context: 'Parent of Year 8 student' },
    { text: 'Jake went from a C to an A- in one term. His tutor made the lessons feel like conversations, not lectures.', author: 'Lisa T.', context: 'Parent of Year 9 student' },
    { text: 'I was nervous about online tutoring but our tutor made my son feel so comfortable from the very first session.', author: 'David H.', context: 'Parent of Year 7 student' }
  ],
  pricing: {
    full: 79.00,
    discountPct: 60,
    get due() { return +(this.full * (1 - this.discountPct / 100)).toFixed(2); },
    get saving() { return +(this.full - this.due).toFixed(2); }
  },
  slotWeeks: [
    [
      { day: 'Tue', date: '8 Apr', time: '4:00 PM' },
      { day: 'Tue', date: '8 Apr', time: '4:30 PM' },
      { day: 'Tue', date: '8 Apr', time: '5:30 PM' },
      { day: 'Wed', date: '9 Apr', time: '4:00 PM' },
      { day: 'Wed', date: '9 Apr', time: '5:30 PM' },
      { day: 'Thu', date: '10 Apr', time: '3:30 PM' }
    ],
    [
      { day: 'Mon', date: '14 Apr', time: '4:00 PM' },
      { day: 'Tue', date: '15 Apr', time: '4:00 PM' },
      { day: 'Tue', date: '15 Apr', time: '5:00 PM' },
      { day: 'Wed', date: '16 Apr', time: '3:30 PM' },
      { day: 'Wed', date: '16 Apr', time: '5:30 PM' },
      { day: 'Thu', date: '17 Apr', time: '4:00 PM' }
    ]
  ],
  activeWeek: 0,
  get slots() { return this.slotWeeks[this.activeWeek]; },
  selectedSlot: null,
  countdownStart: null,
  countdownDuration: 14 * 60 * 1000,
  countdownInterval: null,
  paymentSimulated: false
};

// ═══════════════════════════════════════════════════════════════
// URL Param Overrides
// ═══════════════════════════════════════════════════════════════
function loadFromUrlParams() {
  var p = new URLSearchParams(window.location.search);
  if (p.get('name')) State.student.name = p.get('name');
  if (p.get('year')) State.student.yearLevel = p.get('year');
  if (p.get('subject')) State.student.subject = p.get('subject');
  if (p.get('situation')) State.student.situation = p.get('situation');
  if (p.get('state')) State.student.state = p.get('state');
  if (p.get('struggle')) State.student.struggleArea = p.get('struggle');
  if (p.get('screen')) window._startScreen = parseInt(p.get('screen'), 10) || 0;
}

// ═══════════════════════════════════════════════════════════════
// Screen Navigation (4 screens: thinking=0, contact=1, match=2, checkout=3)
// ═══════════════════════════════════════════════════════════════
var SCREEN_IDS = ['screen-thinking', 'screen-contact', 'screen-match', 'screen-checkout'];
var screens = [];
var cur = 0;

function initScreens() {
  SCREEN_IDS.forEach(function(id) { screens.push(document.getElementById(id)); });
}

function goTo(n) {
  if (n === cur || n < 0 || n >= screens.length) return;
  var fwd = n > cur;
  var old = screens[cur];
  var next = screens[n];

  if (cur === 0) stopParticleCanvas();

  old.classList.remove('active');
  old.classList.add(fwd ? 'exit-left' : 'exit-right');

  next.classList.remove('exit-left', 'exit-right');
  next.classList.add('active');
  next.scrollTop = 0;

  cur = n;

  // Screen-specific init
  if (n === 0) runThinkingSequence();
  if (n === 2) initMatchReveal();
  if (n === 3) initCheckout();
  updateDevBar();
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
var escHtml = TuteroData.escHtml;

function getStruggleLabel(val) {
  var map = {
    'understanding-concepts': 'understanding core concepts',
    'word-problems': 'word problems',
    'algebra-equations': 'algebra and equations',
    'reading-comprehension': 'reading comprehension',
    'essay-writing': 'essay writing',
    'grammar-punctuation': 'grammar and punctuation',
    'understanding-theory': 'theory comprehension',
    'applying-formulas': 'applying formulas',
    'not-sure': 'general support'
  };
  return map[val] || val.replace(/-/g, ' ');
}

var getStateFullName = TuteroData.getStateFullName;

// ═══════════════════════════════════════════════════════════════
// Personalisation
// ═══════════════════════════════════════════════════════════════
function personalise() {
  var n = State.student.name;
  var s = State.student;
  var t1 = State.tutors[0];
  var t2 = State.tutors[1];

  // Thinking screen
  document.getElementById('thinkingHeadline').textContent = 'Finding the perfect tutor for ' + n;
  document.getElementById('thinkingSubtitle').textContent = s.yearLevel + ' ' + s.subject;

  // Contact screen
  document.getElementById('contactBannerText').textContent =
    'We\u2019ve found ' + s.yearLevel + ' ' + s.subject + ' tutors for ' + n;
  document.getElementById('phoneHeading').textContent =
    'Where should we send ' + n + '\u2019s teacher matches?';
  document.getElementById('emailHeading').textContent =
    'Drop your email for ' + n + '\u2019s full report';
  document.getElementById('nameSub').textContent =
    'So ' + n + '\u2019s tutor can say hi properly.';
  document.getElementById('nameBtn').textContent = 'See ' + n + '\u2019s match';

  // Match screen header
  document.getElementById('matchHeadline').textContent = 'The best tutors for ' + n;
  document.getElementById('matchSubtitle').textContent =
    'Based on ' + s.yearLevel + ' ' + s.subject + ' \u00B7 200+ reviewed';
  document.getElementById('matchContext').textContent =
    s.struggle + ' \u00B7 ' + s.learningStyle.toLowerCase();

  // Tutor #1 — gold card
  document.getElementById('tutor1Photo').src = t1.photo;
  document.getElementById('tutor1Photo').alt = t1.name;
  document.getElementById('tutor1Name').textContent = t1.name;
  document.getElementById('tutor1Tagline').textContent = t1.tagline;
  document.getElementById('tutor1Pct').textContent = t1.suitability + '%';
  document.getElementById('tutor1Years').textContent = t1.stats.years;
  document.getElementById('tutor1Students').textContent = t1.stats.students;
  document.getElementById('tutor1Grade').textContent = t1.stats.gradeImprovement;

  // Animate suitability bar after short delay
  setTimeout(function() {
    document.getElementById('tutor1Bar').style.width = t1.suitability + '%';
  }, 300);

  // Why statements
  var why = t1.whyStatements;
  document.getElementById('why1').textContent = why[0];
  document.getElementById('why2').textContent = why[1];
  document.getElementById('why3').textContent = why[2].replace('{name}', n);

  // Tutor #2 — silver card
  document.getElementById('tutor2Photo').src = t2.photo;
  document.getElementById('tutor2Photo').alt = t2.name;
  document.getElementById('tutor2Name').textContent = t2.name;
  document.getElementById('tutor2Tagline').textContent = t2.tagline;
  document.getElementById('tutor2Pct').textContent = t2.suitability + '%';
  document.getElementById('tutor2Years').textContent = t2.stats.years;
  document.getElementById('tutor2Students').textContent = t2.stats.students;
  document.getElementById('tutor2Grade').textContent = t2.stats.gradeImprovement;

  setTimeout(function() {
    document.getElementById('tutor2Bar').style.width = t2.suitability + '%';
  }, 500);

  // Medal score badges
  document.getElementById('tutor1PctBadge').textContent = t1.suitability + '% match';
  document.getElementById('tutor2PctBadge').textContent = t2.suitability + '% match';

  // Trust row education
  document.getElementById('tutor1Education').textContent = t1.stats.education;
  document.getElementById('tutor2Education').textContent = t2.stats.education;

  // Mobile expand thumbs + CTA text
  var expandThumb1 = document.getElementById('expandThumb1');
  var expandThumb2 = document.getElementById('expandThumb2');
  if (expandThumb1) expandThumb1.src = t1.photo;
  if (expandThumb2) expandThumb2.src = t2.photo;
  var expandBook1 = document.getElementById('expandBook1');
  var expandBook2 = document.getElementById('expandBook2');
  if (expandBook1) expandBook1.textContent = 'Book ' + n + '\u2019s first lesson \u2014 60% off';
  if (expandBook2) expandBook2.textContent = 'Book ' + n + '\u2019s first lesson \u2014 60% off';

  // Checkout — tutor #1
  document.getElementById('checkoutTutorPhoto').src = t1.photo;
  document.getElementById('checkoutTutorPhoto').alt = t1.name;
  document.getElementById('miniTutorName').textContent = t1.name;
  document.getElementById('miniMatch').textContent = t1.suitability + '% match \u00B7 #1 pick';

  var stats = t1.stats;
  document.getElementById('statYears').textContent = stats.years;
  document.getElementById('statStudents').textContent = stats.students;
  document.getElementById('statImprove').textContent = stats.gradeImprovement;
  document.getElementById('detailEducation').textContent = stats.education;
  document.getElementById('detailResponse').textContent = stats.responseTime;

  // Tutor bio
  if (t1.bio) {
    document.getElementById('tutorBio').textContent = '\u201C' + t1.bio + '\u201D';
  }

  // Reviews
  var reviewsBlock = document.getElementById('reviewsBlock');
  if (reviewsBlock && State.reviews) {
    reviewsBlock.innerHTML = '';
    State.reviews.forEach(function(r) {
      var card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML =
        '<div class="review-stars">\u2605\u2605\u2605\u2605\u2605</div>' +
        '<p class="review-text">\u201C' + escHtml(r.text) + '\u201D</p>' +
        '<div class="review-author"><strong>' + escHtml(r.author) + '</strong>' +
        '<span>' + escHtml(r.context) + '</span></div>';
      reviewsBlock.appendChild(card);
    });
  }

  // What happens next
  document.getElementById('nextStep1').textContent =
    'Tutor prepares a personalised session for ' + n;
  document.getElementById('nextStep2').textContent =
    n + ' joins a 1-on-1 video call';
  document.getElementById('nextStep4').textContent =
    'Lesson targets exactly where she needs help';

  document.getElementById('slotPickerTitle').textContent =
    'Pick a time for ' + n + '\u2019s first lesson';
  document.getElementById('priceFull').textContent = '$' + State.pricing.full.toFixed(2);
  document.getElementById('priceSaving').textContent = '\u2212$' + State.pricing.saving.toFixed(2);
  document.getElementById('priceDue').textContent = '$' + State.pricing.due.toFixed(2);
  document.getElementById('payBtnText').textContent = 'Confirm & pay $' + State.pricing.due.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: Thinking / AI Matching Animation
// ═══════════════════════════════════════════════════════════════
function initParticleCanvas() {
  TuteroThinking.initParticleCanvas('particleCanvas', {
    lineColor: '59,155,98',
    dotColor: 'rgba(59,155,98,0.15)'
  });
}

var stopParticleCanvas = TuteroThinking.stopParticleCanvas;

function buildThinkingPhases() {
  var name = State.student.name;
  var s = State.student;
  var struggleLabel = getStruggleLabel(s.struggleArea);

  return [
    {
      label: 'Understanding',
      duration: 5000,
      steps: [
        { text: 'Analysing ' + name + '\u2019s learning profile', icon: '\uD83E\uDDE0' },
        { text: s.yearLevel + ' ' + s.subject + ' \u2014 mapping curriculum gaps', icon: '\uD83D\uDCD8' },
        { text: 'Noting focus area: ' + struggleLabel, icon: '\uD83C\uDFAF' },
        { text: 'Confidence level: needs patient, encouraging approach', icon: '\uD83D\uDC9B' }
      ]
    },
    {
      label: 'Searching',
      duration: 6000,
      steps: [
        { text: 'Scanning 200+ verified tutors across Australia', icon: '\uD83D\uDD0D' },
        { text: 'Filtering for ' + s.subject + ' specialists in ' + getStateFullName(s.state), icon: '\uD83D\uDDFA\uFE0F' },
        { text: 'Checking availability for this week', icon: '\uD83D\uDD52' },
        { text: 'Prioritising tutors experienced with ' + s.yearLevel, icon: '\u2B50' }
      ]
    },
    {
      label: 'Matching',
      duration: 6500,
      steps: [
        { text: 'Evaluating teaching style compatibility', icon: '\u2764\uFE0F' },
        { text: 'Cross-referencing success rates for similar students', icon: '\uD83D\uDCC8' },
        { text: 'Scoring personality and learning style fit', icon: '\u2728' }
      ]
    },
    {
      label: 'Building Plan',
      duration: 3500,
      steps: [
        { text: 'Designing ' + name + '\u2019s personalised pathway', icon: '\uD83D\uDEE4\uFE0F' },
        { text: 'Preparing tutor recommendations', icon: '\u2705' },
        { text: 'Your #1 match is ready', icon: '\uD83C\uDF89' }
      ]
    }
  ];
}

function runThinkingSequence() {
  initParticleCanvas();

  TuteroThinking.runSequence({
    phases: buildThinkingPhases(),
    elements: {
      feed: 'thinkingFeed',
      ring: 'progressRingFg',
      pct: 'progressPct',
      phaseLabel: 'phaseLabel',
      headline: 'thinkingHeadline',
      subtitle: 'thinkingSubtitle'
    },
    text: {
      headline: 'Finding ' + State.student.name + '\u2019s perfect tutor',
      subtitle: State.student.yearLevel + ' ' + State.student.subject + ' \u00B7 ' + getStateFullName(State.student.state),
      completionLabel: 'Complete'
    },
    onComplete: function() {
      goTo(1);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2: Contact Capture
// ═══════════════════════════════════════════════════════════════
var contactStep = 0;

function advanceContactStep() {
  document.getElementById('contactStep' + (contactStep + 1)).classList.remove('active');
  contactStep++;

  for (var i = 1; i <= Math.min(contactStep + 1, 3); i++) {
    document.getElementById('cpSeg' + i).classList.add('active');
  }

  if (contactStep >= 3) {
    submitContactData();
    goTo(2); // → match screen
    return;
  }

  var next = document.getElementById('contactStep' + (contactStep + 1));
  next.classList.add('active');
  var input = next.querySelector('input');
  if (input) setTimeout(function() { input.focus(); }, 300);
}

function submitContactData() {
  State.student.parentName = State.contact.parentName;
  console.log('[Demo] Lead submitted:', {
    phone: State.contact.phone,
    email: State.contact.email,
    parentName: State.contact.parentName,
    student: State.student
  });
}

// Phone validation
var fPH = document.getElementById('fPhone');
var phoneBtn = document.getElementById('phoneBtn');

fPH.addEventListener('input', function() {
  TuteroForms.formatPhone(fPH, State.contact);
  var ok = State.contact.digits.length >= 10;
  TuteroForms.toggleBtn(phoneBtn, ok);
  if (ok) TuteroForms.clearFieldError(fPH);
});

phoneBtn.addEventListener('click', function() {
  if (phoneBtn.classList.contains('btn-disabled')) {
    if (State.contact.digits.length < 10) TuteroForms.showFieldError(fPH);
    return;
  }
  State.contact.phone = fPH.value.trim();
  advanceContactStep();
});

fPH.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); phoneBtn.click(); }
});

// Email validation
var fEM = document.getElementById('fEmail');
var emailBtn = document.getElementById('emailBtn');

fEM.addEventListener('input', function() {
  var ok = TuteroForms.isValidEmail(fEM.value.trim());
  TuteroForms.toggleBtn(emailBtn, ok);
  if (ok) TuteroForms.clearFieldError(fEM);
});

emailBtn.addEventListener('click', function() {
  if (emailBtn.classList.contains('btn-disabled')) {
    if (!TuteroForms.isValidEmail(fEM.value.trim())) TuteroForms.showFieldError(fEM);
    return;
  }
  State.contact.email = fEM.value.trim();
  advanceContactStep();
});

fEM.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); emailBtn.click(); }
});

// Parent name validation
var fPN = document.getElementById('fParentName');
var nameBtn = document.getElementById('nameBtn');

fPN.addEventListener('input', function() {
  var ok = fPN.value.trim().length >= 2;
  TuteroForms.toggleBtn(nameBtn, ok);
  if (ok) TuteroForms.clearFieldError(fPN);
});

nameBtn.addEventListener('click', function() {
  if (nameBtn.classList.contains('btn-disabled')) {
    if (fPN.value.trim().length < 2) TuteroForms.showFieldError(fPN);
    return;
  }
  State.contact.parentName = TuteroForms.capitalise(fPN.value.trim());
  advanceContactStep();
});

fPN.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); nameBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// SCREEN 3: Match — Preview Panel + Hover Interactions
// ═══════════════════════════════════════════════════════════════
var matchAnimated = false;

function initMatchReveal() {
  if (!matchAnimated) {
    startCountdown();
    matchAnimated = true;
  }
}

var supportsHover = window.matchMedia('(hover: hover)').matches;
var previewActiveIndex = -1;
var previewHideTimer = null;

function initPreviewPanel() {
  if (supportsHover) {
    initDesktopPreview();
  } else {
    initMobileTapExpand();
  }
}

function initDesktopPreview() {
  var cards = document.querySelectorAll('.reco-card[data-tutor-index]');
  var panel = document.getElementById('previewPanel');
  if (!panel) return;

  cards.forEach(function(card) {
    var idx = parseInt(card.getAttribute('data-tutor-index'), 10);

    card.addEventListener('mouseenter', function() {
      clearTimeout(previewHideTimer);
      showPreview(idx);
      cards.forEach(function(c) { c.classList.remove('reco-card--active'); });
      card.classList.add('reco-card--active');
    });

    card.addEventListener('mouseleave', function() {
      previewHideTimer = setTimeout(function() {
        if (previewActiveIndex === idx) {
          hidePreview();
          card.classList.remove('reco-card--active');
        }
      }, 350);
    });

    card.addEventListener('focus', function() { showPreview(idx); });
    card.addEventListener('blur', function() {
      previewHideTimer = setTimeout(function() {
        hidePreview();
        card.classList.remove('reco-card--active');
      }, 200);
    });
  });

  panel.addEventListener('mouseenter', function() {
    clearTimeout(previewHideTimer);
  });
  panel.addEventListener('mouseleave', function() {
    previewHideTimer = setTimeout(function() {
      hidePreview();
      document.querySelectorAll('.reco-card--active').forEach(function(c) {
        c.classList.remove('reco-card--active');
      });
    }, 250);
  });
}

function showPreview(tutorIndex) {
  var tutor = State.tutors[tutorIndex];
  if (!tutor) return;
  previewActiveIndex = tutorIndex;

  var panel = document.getElementById('previewPanel');

  document.getElementById('previewThumb').src = tutor.photo;
  document.getElementById('previewThumb').alt = tutor.name;
  document.getElementById('previewName').textContent = tutor.name;
  document.getElementById('previewSuit').textContent = tutor.suitability + '% match';
  document.getElementById('previewTagline').textContent = tutor.tagline;
  document.getElementById('previewYears').textContent = tutor.stats.years;
  document.getElementById('previewStudents').textContent = tutor.stats.students;
  document.getElementById('previewGrade').textContent = tutor.stats.gradeImprovement;

  var why = document.getElementById('previewWhy');
  why.innerHTML = '';
  if (tutor.whyStatements) {
    tutor.whyStatements.forEach(function(stmt) {
      var text = stmt.replace('{name}', State.student.name);
      var item = document.createElement('div');
      item.className = 'preview-why-item';
      item.innerHTML =
        '<span class="preview-why-check">\u2713</span>' +
        '<span>' + escHtml(text) + '</span>';
      why.appendChild(item);
    });
  }

  document.getElementById('previewOfferText').textContent =
    State.student.name + '\u2019s first lesson';
  document.getElementById('previewBookBtn').textContent =
    'Book ' + State.student.name + '\u2019s first lesson \u2014 60% off \u2192';

  panel.classList.toggle('preview-panel--gold', tutorIndex === 0);
  panel.classList.toggle('preview-panel--silver', tutorIndex === 1);

  // Slide panel to align with hovered card
  var hoveredCard = document.querySelector('.reco-card[data-tutor-index="' + tutorIndex + '"]');
  var firstCard = document.querySelector('.reco-card[data-tutor-index="0"]');
  if (hoveredCard && firstCard) {
    var offset = hoveredCard.getBoundingClientRect().top - firstCard.getBoundingClientRect().top;
    panel.style.transform = 'translateY(' + offset + 'px)';
  }

  panel.classList.add('has-content');
  panel.setAttribute('aria-hidden', 'false');
  var layout = document.querySelector('.match-layout');
  if (layout) layout.classList.add('has-focus');
}

function hidePreview() {
  previewActiveIndex = -1;
  var panel = document.getElementById('previewPanel');
  if (panel) {
    panel.classList.remove('has-content', 'preview-panel--gold', 'preview-panel--silver');
    panel.style.transform = '';
    panel.setAttribute('aria-hidden', 'true');
    var layout = document.querySelector('.match-layout');
    if (layout) layout.classList.remove('has-focus');
  }
}

// Preview CTA → checkout (screen 3)
var previewBookBtn = document.getElementById('previewBookBtn');
if (previewBookBtn) {
  previewBookBtn.addEventListener('click', function() {
    hidePreview();
    document.querySelectorAll('.reco-card--active').forEach(function(c) {
      c.classList.remove('reco-card--active');
    });
    goTo(3); // checkout
  });
}

// Mobile Tap Expand
function initMobileTapExpand() {
  var cards = document.querySelectorAll('.reco-card[data-tutor-index]');

  cards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('button, a')) return;
      var wasExpanded = card.classList.contains('expanded');
      cards.forEach(function(c) { c.classList.remove('expanded'); });
      if (!wasExpanded) {
        card.classList.add('expanded');
      }
    });
  });

  // Mobile expand CTA → checkout
  document.querySelectorAll('.expand-book-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      goTo(3); // checkout
    });
  });
}

// Desktop card click → checkout
if (supportsHover) {
  document.querySelectorAll('.reco-card[data-tutor-index]').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('button, a')) return;
      hidePreview();
      document.querySelectorAll('.reco-card--active').forEach(function(c) {
        c.classList.remove('reco-card--active');
      });
      goTo(3); // checkout
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Countdown (sessionStorage-backed)
// ═══════════════════════════════════════════════════════════════
function startCountdown() {
  var stored = sessionStorage.getItem('tm_countdown_start');
  if (stored) {
    State.countdownStart = parseInt(stored, 10);
  } else {
    State.countdownStart = Date.now();
    sessionStorage.setItem('tm_countdown_start', String(State.countdownStart));
  }
  if (State.countdownInterval) clearInterval(State.countdownInterval);
  updateCountdown();
  State.countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  var elapsed = Date.now() - State.countdownStart;
  var remaining = Math.max(0, State.countdownDuration - elapsed);
  var mins = Math.floor(remaining / 60000);
  var secs = Math.floor((remaining % 60000) / 1000);
  var text = mins + ':' + (secs < 10 ? '0' : '') + secs;

  ['checkoutTimer', 'previewTimer'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (remaining <= 0) {
      el.textContent = 'Expired';
    } else {
      el.textContent = text;
      var parent = el.closest('.timer-text') || el.closest('.offer-bar-text');
      if (parent) {
        if (remaining <= 5 * 60 * 1000) parent.classList.add('timer-urgent');
        else parent.classList.remove('timer-urgent');
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 4: Checkout
// ═══════════════════════════════════════════════════════════════
var checkoutInited = false;

function initCheckout() {
  if (checkoutInited) return;
  checkoutInited = true;
  renderSlotGrid();
}

function renderSlotGrid() {
  var grid = document.getElementById('slotGrid');
  grid.innerHTML = '';
  State.slots.forEach(function(slot, i) {
    var btn = document.createElement('button');
    btn.className = 'slot-btn';
    btn.innerHTML =
      '<span class="slot-day">' + escHtml(slot.day) + ' ' + escHtml(slot.date) + '</span>' +
      '<span class="slot-time">' + escHtml(slot.time) + '</span>';
    btn.addEventListener('click', function() { selectSlot(i); });
    grid.appendChild(btn);
  });
  document.getElementById('weekBtn0').classList.toggle('slot-week-btn--active', State.activeWeek === 0);
  document.getElementById('weekBtn1').classList.toggle('slot-week-btn--active', State.activeWeek === 1);
}

// Week navigation
document.getElementById('weekBtn0').addEventListener('click', function() {
  State.activeWeek = 0;
  renderSlotGrid();
});
document.getElementById('weekBtn1').addEventListener('click', function() {
  State.activeWeek = 1;
  renderSlotGrid();
});

// None of these work — modal
document.getElementById('slotNoneBtn').addEventListener('click', function() {
  var modal = document.getElementById('slotNoneModal');
  if (modal) modal.classList.add('visible');
});
function closeSlotNoneModal() {
  var modal = document.getElementById('slotNoneModal');
  if (modal) modal.classList.remove('visible');
}

function selectSlot(index) {
  State.selectedSlot = State.slots[index];
  var slotPicker = document.getElementById('slotPicker');
  var paymentView = document.getElementById('paymentView');
  var s = State.selectedSlot;
  document.getElementById('selectedSlotText').textContent =
    s.day + ' ' + s.date + ', ' + s.time + ' \u2014 1 hour lesson with ' + State.tutors[0].name;

  var guarantee = document.getElementById('checkoutGuarantee');
  var grid = document.querySelector('.checkout-grid');
  slotPicker.classList.add('fade-out');
  setTimeout(function() {
    slotPicker.style.display = 'none';
    if (guarantee) guarantee.style.display = 'none';
    slotPicker.classList.remove('fade-out');
    paymentView.style.display = 'block';
    paymentView.classList.add('fade-in');
    if (grid) grid.classList.add('payment-focus');
  }, 250);
}

document.getElementById('changeSlotBtn').addEventListener('click', function() {
  State.selectedSlot = null;
  var paymentView = document.getElementById('paymentView');
  var slotPicker = document.getElementById('slotPicker');
  var guarantee = document.getElementById('checkoutGuarantee');
  var grid = document.querySelector('.checkout-grid');
  paymentView.classList.add('fade-out');
  setTimeout(function() {
    paymentView.style.display = 'none';
    paymentView.classList.remove('fade-out', 'fade-in');
    slotPicker.style.display = 'block';
    if (guarantee) guarantee.style.display = '';
    if (grid) grid.classList.remove('payment-focus');
    slotPicker.classList.add('fade-in');
  }, 250);
});

// Pay button — prototype demo
document.getElementById('payBtn').addEventListener('click', function() {
  var payBtn = document.getElementById('payBtn');
  var btnText = document.getElementById('payBtnText');
  var btnSpinner = document.getElementById('payBtnSpinner');

  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline-flex';
  payBtn.disabled = true;

  console.log('[Demo] Simulating payment success');
  setTimeout(showBookingSuccess, 1500);
});

function showBookingSuccess() {
  if (State.countdownInterval) clearInterval(State.countdownInterval);
  var overlay = document.getElementById('bookingSuccess');
  overlay.classList.add('visible');
  document.getElementById('successHeading').textContent = 'You\u2019re booked!';
  document.getElementById('successSub').textContent =
    State.student.name + '\u2019s first lesson with ' + State.tutors[0].name + ' is confirmed.';
  var slot = State.selectedSlot;
  if (slot) {
    document.getElementById('successDetails').textContent =
      slot.day + ' ' + slot.date + ', ' + slot.time + ' \u2014 1 hour lesson';
  }
  if (typeof TuteroConfetti !== 'undefined') {
    TuteroConfetti.launch({ canvasId: 'confettiCanvas' });
  }
}

// ═══════════════════════════════════════════════════════════════
// Dev toolbar
// ═══════════════════════════════════════════════════════════════
function updateDevBar() {
  var btns = document.querySelectorAll('.dev-btn');
  for (var i = 0; i < 4; i++) {
    btns[i].className = 'dev-btn' + (cur === i ? ' active' : '');
  }
}

window.devGoTo = function(n) {
  if (n === cur) return;
  hidePreview();
  document.querySelectorAll('.reco-card--active').forEach(function(c) {
    c.classList.remove('reco-card--active');
  });
  if (cur === 0) stopParticleCanvas();
  screens[cur].classList.remove('active', 'exit-left', 'exit-right');
  screens[cur].style.transform = 'translateX(100%)';
  screens[n].classList.remove('exit-left', 'exit-right');
  screens[n].classList.add('active');
  screens[n].style.transform = '';
  screens[n].scrollTop = 0;
  cur = n;
  if (n === 0) runThinkingSequence();
  if (n === 2) initMatchReveal();
  if (n === 3) initCheckout();
  updateDevBar();
};

window.devReset = function() {
  checkoutInited = false;
  matchAnimated = false;
  contactStep = 0;
  State.selectedSlot = null;
  State.activeWeek = 0;

  var pv = document.getElementById('paymentView');
  var sp = document.getElementById('slotPicker');
  pv.style.display = 'none';
  pv.classList.remove('fade-in', 'fade-out');
  sp.style.display = 'block';
  sp.classList.remove('fade-in', 'fade-out');
  document.getElementById('payBtnText').style.display = '';
  document.getElementById('payBtnSpinner').style.display = 'none';
  document.getElementById('payBtn').disabled = true;

  // Restore guarantee + remove payment focus
  var guarantee = document.getElementById('checkoutGuarantee');
  if (guarantee) guarantee.style.display = '';
  var grid = document.querySelector('.checkout-grid');
  if (grid) grid.classList.remove('payment-focus');

  // Reset contact steps
  document.querySelectorAll('.contact-step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('contactStep1').classList.add('active');
  document.querySelectorAll('.cp-seg').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('cpSeg1').classList.add('active');
  document.getElementById('fPhone').value = '';
  document.getElementById('fEmail').value = '';
  document.getElementById('fParentName').value = '';
  State.contact = { phone: '', digits: '', email: '', parentName: '' };

  // Reset success overlay
  document.getElementById('bookingSuccess').classList.remove('visible');

  // Reset countdown
  if (State.countdownInterval) clearInterval(State.countdownInterval);
  sessionStorage.removeItem('tm_countdown_start');

  // Jump to thinking
  window.devGoTo(0);
  console.log('[Demo] State reset');
};

// Animation toggle
document.getElementById('devAnimToggle').addEventListener('change', function() {
  if (this.checked) {
    document.body.style.setProperty('--ease', 'cubic-bezier(0.4, 0, 0.2, 1)');
    document.querySelectorAll('.screen').forEach(function(s) { s.style.transition = ''; });
  } else {
    document.body.style.setProperty('--ease', 'linear');
    document.querySelectorAll('.screen').forEach(function(s) { s.style.transition = 'none'; });
    document.querySelectorAll('.checkout-card').forEach(function(c) { c.style.transition = 'none'; });
  }
});

// ═══════════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════════
loadFromUrlParams();
try { personalise(); } catch(e) { console.error('personalise() failed:', e); }
initScreens();
initPreviewPanel();
document.getElementById('payBtn').disabled = false;
runThinkingSequence();

// Support ?screen=N to jump directly
if (window._startScreen && window._startScreen > 0) {
  window.devGoTo(window._startScreen);
}
