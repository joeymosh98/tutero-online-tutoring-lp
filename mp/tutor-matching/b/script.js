// ═══════════════════════════════════════════════════════════════
// Tutero Tutor Matching — QA Variant (no thinking/contact screens)
// Screens: match | checkout
// ═══════════════════════════════════════════════════════════════

var State = {
  student: {
    name: 'Emma',
    yearLevel: 'Year 8',
    subject: 'Maths',
    parentName: 'Sarah',
    struggle: 'Falling behind in algebra, losing confidence in class',
    goal: 'Catch up to class level before mid-year exams',
    learningStyle: 'Needs patience \u2014 shuts down when rushed',
    availability: 'After school, Tue\u2013Thu'
  },
  contact: {
    phone: '0412 345 678',
    email: 'sarah@test.com',
    parentName: 'Sarah'
  },
  tutors: [
    {
      name: 'Sarah R.',
      initials: 'SR',
      suitability: 97,
      tagline: 'Year 7–12 Maths specialist · 6 years experience',
      photo: '/lp/special-needs-tutoring/a/images/hero-tutor-profile.png',
      whyStatements: [
        'Specialises in building confidence for students who are falling behind',
        'Experienced with Year 8 curriculum and algebra foundations',
        'Patient, encouraging teaching style — perfect for {name}'
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
      tagline: 'Year 7–10 Maths specialist · 5 years experience',
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

// ── URL param overrides ──
(function() {
  var p = new URLSearchParams(window.location.search);
  if (p.get('name')) State.student.name = p.get('name');
  if (p.get('year')) State.student.yearLevel = p.get('year');
  if (p.get('subject')) State.student.subject = p.get('subject');
  if (p.get('screen')) window._startScreen = parseInt(p.get('screen'), 10) || 0;
})();

// ═══════════════════════════════════════════════════════════════
// Screen Navigation (only 2 screens: match=0, checkout=1)
// ═══════════════════════════════════════════════════════════════
var SCREEN_IDS = ['screen-match', 'screen-checkout'];
var screens = [];
var cur = 0;

function initScreens() {
  SCREEN_IDS.forEach(function(id) { screens.push(document.getElementById(id)); });
}

function goTo(n) {
  if (n === cur || n < 0 || n >= screens.length) return;
  var fwd = n > cur;
  screens[cur].classList.remove('active');
  screens[cur].classList.add(fwd ? 'exit-left' : 'exit-right');
  screens[n].classList.remove('exit-left', 'exit-right');
  screens[n].classList.add('active');
  screens[n].scrollTop = 0;
  cur = n;
  if (n === 1) initCheckout();
  updateDevBar();
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ═══════════════════════════════════════════════════════════════
// Personalise
// ═══════════════════════════════════════════════════════════════
function personalise() {
  var n = State.student.name;
  var s = State.student;
  var t1 = State.tutors[0];
  var t2 = State.tutors[1];

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

  // Tutor #2 — silver card (full layout)
  document.getElementById('tutor2Photo').src = t2.photo;
  document.getElementById('tutor2Photo').alt = t2.name;
  document.getElementById('tutor2Name').textContent = t2.name;
  document.getElementById('tutor2Tagline').textContent = t2.tagline;
  document.getElementById('tutor2Pct').textContent = t2.suitability + '%';
  document.getElementById('tutor2Years').textContent = t2.stats.years;
  document.getElementById('tutor2Students').textContent = t2.stats.students;
  document.getElementById('tutor2Grade').textContent = t2.stats.gradeImprovement;

  // Animate silver suitability bar
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

  // What happens next — personalise with student name
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
// Preview Panel — desktop hover interactions
// ═══════════════════════════════════════════════════════════════

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
      // Highlight active card
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

    // Keyboard focus
    card.addEventListener('focus', function() { showPreview(idx); });
    card.addEventListener('blur', function() {
      previewHideTimer = setTimeout(function() {
        hidePreview();
        card.classList.remove('reco-card--active');
      }, 200);
    });
  });

  // Keep panel open while mouse is over it
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

  // Populate content
  document.getElementById('previewThumb').src = tutor.photo;
  document.getElementById('previewThumb').alt = tutor.name;
  document.getElementById('previewName').textContent = tutor.name;
  document.getElementById('previewSuit').textContent = tutor.suitability + '% match';
  document.getElementById('previewTagline').textContent = tutor.tagline;
  document.getElementById('previewYears').textContent = tutor.stats.years;
  document.getElementById('previewStudents').textContent = tutor.stats.students;
  document.getElementById('previewGrade').textContent = tutor.stats.gradeImprovement;

  // Why statements
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

  // Offer strip + CTA use student name
  document.getElementById('previewOfferText').textContent =
    State.student.name + '\u2019s first lesson';
  document.getElementById('previewBookBtn').textContent =
    'Book ' + State.student.name + '\u2019s first lesson \u2014 60% off \u2192';

  // Gold/silver variant styling
  panel.classList.toggle('preview-panel--gold', tutorIndex === 0);
  panel.classList.toggle('preview-panel--silver', tutorIndex === 1);

  // Slide panel to align with hovered card
  var hoveredCard = document.querySelector('.reco-card[data-tutor-index="' + tutorIndex + '"]');
  var firstCard = document.querySelector('.reco-card[data-tutor-index="0"]');
  if (hoveredCard && firstCard) {
    var offset = hoveredCard.getBoundingClientRect().top - firstCard.getBoundingClientRect().top;
    panel.style.transform = 'translateY(' + offset + 'px)';
  }

  // Show panel + focus overlay
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

// Preview CTA clicks through to checkout
var previewBookBtn = document.getElementById('previewBookBtn');
if (previewBookBtn) {
  previewBookBtn.addEventListener('click', function() {
    hidePreview();
    document.querySelectorAll('.reco-card--active').forEach(function(c) {
      c.classList.remove('reco-card--active');
    });
    goTo(1);
  });
}

// ═══════════════════════════════════════════════════════════════
// Mobile Tap Expand
// ═══════════════════════════════════════════════════════════════

function initMobileTapExpand() {
  var cards = document.querySelectorAll('.reco-card[data-tutor-index]');

  cards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      // Don't expand if tapping a button/link inside
      if (e.target.closest('button, a')) return;

      var wasExpanded = card.classList.contains('expanded');

      // Collapse all cards
      cards.forEach(function(c) { c.classList.remove('expanded'); });

      // Toggle tapped card
      if (!wasExpanded) {
        card.classList.add('expanded');
      }
    });
  });

  // Mobile expand CTA → checkout
  document.querySelectorAll('.expand-book-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      goTo(1);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Desktop card click → checkout
// ═══════════════════════════════════════════════════════════════
if (supportsHover) {
  document.querySelectorAll('.reco-card[data-tutor-index]').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('button, a')) return;
      hidePreview();
      document.querySelectorAll('.reco-card--active').forEach(function(c) {
        c.classList.remove('reco-card--active');
      });
      goTo(1);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Countdown
// ═══════════════════════════════════════════════════════════════
function startCountdown() {
  State.countdownStart = Date.now();
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

  ['countdownTimer', 'checkoutTimer', 'previewTimer'].forEach(function(id) {
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
// Checkout
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
  // Update week button states
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

// None of these work — show options modal
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

// Pay button — prototype demo (simulates payment)
document.getElementById('payBtn').addEventListener('click', function() {
  var payBtn = document.getElementById('payBtn');
  var btnText = document.getElementById('payBtnText');
  var btnSpinner = document.getElementById('payBtnSpinner');

  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline-flex';
  payBtn.disabled = true;

  console.log('[QA] Simulating payment success');
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
  btns[0].className = 'dev-btn' + (cur === 0 ? ' active' : '');
  btns[1].className = 'dev-btn' + (cur === 1 ? ' active' : '');
}

window.devGoTo = function(n) {
  if (n === cur) return;
  hidePreview();
  document.querySelectorAll('.reco-card--active').forEach(function(c) {
    c.classList.remove('reco-card--active');
  });
  // Direct jump — bypass transition for speed
  screens[cur].classList.remove('active', 'exit-left', 'exit-right');
  screens[cur].style.transform = 'translateX(100%)';
  screens[n].classList.remove('exit-left', 'exit-right');
  screens[n].classList.add('active');
  screens[n].style.transform = '';
  screens[n].scrollTop = 0;
  cur = n;
  if (n === 1) initCheckout();
  updateDevBar();
};

window.devReset = function() {
  // Reset checkout state
  checkoutInited = false;
  State.selectedSlot = null;
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

  // Reset success overlay
  document.getElementById('bookingSuccess').classList.remove('visible');

  // Reset countdown
  if (State.countdownInterval) clearInterval(State.countdownInterval);
  startCountdown();

  // Jump to match
  window.devGoTo(0);
  console.log('[QA] State reset');
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
personalise();
initScreens();
initPreviewPanel();
// Enable pay button immediately (no Stripe validation needed in prototype)
document.getElementById('payBtn').disabled = false;
startCountdown();

// Support ?screen=1 to jump directly to checkout
if (window._startScreen === 1) {
  window.devGoTo(1);
}
