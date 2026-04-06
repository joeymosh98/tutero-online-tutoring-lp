// ═══════════════════════════════════════════════════════════════
// Tutero Tutor Matching — QA Variant (no thinking/contact screens)
// Screens: match | checkout
// ═══════════════════════════════════════════════════════════════

var State = {
  student: {
    name: 'Emma',
    yearLevel: 'Year 8',
    subject: 'Maths',
    parentName: 'Sarah'
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
  pricing: {
    full: 79.00,
    discountPct: 60,
    get due() { return +(this.full * (1 - this.discountPct / 100)).toFixed(2); },
    get saving() { return +(this.full - this.due).toFixed(2); }
  },
  slots: [
    { day: 'Tue', date: '8 Apr', time: '4:00 PM' },
    { day: 'Tue', date: '8 Apr', time: '4:30 PM' },
    { day: 'Tue', date: '8 Apr', time: '5:30 PM' },
    { day: 'Wed', date: '9 Apr', time: '4:00 PM' },
    { day: 'Wed', date: '9 Apr', time: '5:30 PM' },
    { day: 'Thu', date: '10 Apr', time: '3:30 PM' }
  ],
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
  document.getElementById('tutor2Pct').textContent = t2.suitability;
  document.getElementById('tutor2Stats').textContent =
    t2.stats.years + ' yrs \u00B7 ' + t2.stats.students + ' students \u00B7 ' +
    t2.stats.gradeImprovement + ' avg grade jump';

  // Offer + CTA
  document.getElementById('offerText').textContent = n + '\u2019s first lesson';
  document.getElementById('bookBtn').textContent =
    'Book ' + t1.name.split(' ')[0] + '\u2019s first lesson \u2014 60% off \u2192';

  // Checkout — still uses tutor #1
  document.getElementById('miniTutorName').textContent = t1.name;
  document.getElementById('miniInitials').textContent = t1.initials;
  document.getElementById('miniMatch').textContent = t1.suitability + '% match \u00B7 #1 pick';

  var stats = t1.stats;
  document.getElementById('statYears').textContent = stats.years;
  document.getElementById('statStudents').textContent = stats.students;
  document.getElementById('statImprove').textContent = stats.gradeImprovement;
  document.getElementById('detailEducation').textContent = stats.education;
  document.getElementById('detailResponse').textContent = stats.responseTime;

  document.getElementById('slotPickerTitle').textContent =
    'Pick a time for ' + n + '\u2019s first lesson';
  document.getElementById('priceFull').textContent = '$' + State.pricing.full.toFixed(2);
  document.getElementById('priceSaving').textContent = '\u2212$' + State.pricing.saving.toFixed(2);
  document.getElementById('priceDue').textContent = '$' + State.pricing.due.toFixed(2);
  document.getElementById('payBtnText').textContent = 'Confirm & pay $' + State.pricing.due.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// Match Reveal
// ═══════════════════════════════════════════════════════════════
document.getElementById('bookBtn').addEventListener('click', function() { goTo(1); });
document.getElementById('otherMatchesLink').addEventListener('click', function() {
  alert('More matches coming soon! For now, we\u2019ve selected the #1 best fit.');
});

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

  ['countdownTimer', 'checkoutTimer'].forEach(function(id) {
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
}

function selectSlot(index) {
  State.selectedSlot = State.slots[index];
  var slotPicker = document.getElementById('slotPicker');
  var paymentView = document.getElementById('paymentView');
  var s = State.selectedSlot;
  document.getElementById('selectedSlotText').textContent =
    s.day + ' ' + s.date + ', ' + s.time + ' \u2014 1 hour lesson with ' + State.tutors[0].name;

  slotPicker.classList.add('fade-out');
  setTimeout(function() {
    slotPicker.style.display = 'none';
    slotPicker.classList.remove('fade-out');
    paymentView.style.display = 'block';
    paymentView.classList.add('fade-in');
  }, 250);

}

document.getElementById('changeSlotBtn').addEventListener('click', function() {
  State.selectedSlot = null;
  var paymentView = document.getElementById('paymentView');
  var slotPicker = document.getElementById('slotPicker');
  paymentView.classList.add('fade-out');
  setTimeout(function() {
    paymentView.style.display = 'none';
    paymentView.classList.remove('fade-out', 'fade-in');
    slotPicker.style.display = 'block';
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
  State.clientSecret = null;
  var pv = document.getElementById('paymentView');
  var sp = document.getElementById('slotPicker');
  pv.style.display = 'none';
  pv.classList.remove('fade-in', 'fade-out');
  sp.style.display = 'block';
  sp.classList.remove('fade-in', 'fade-out');
  document.getElementById('payBtnText').style.display = '';
  document.getElementById('payBtnSpinner').style.display = 'none';
  document.getElementById('payBtn').disabled = true;

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
// Enable pay button immediately (no Stripe validation needed in prototype)
document.getElementById('payBtn').disabled = false;
startCountdown();

// Support ?screen=1 to jump directly to checkout
if (window._startScreen === 1) {
  window.devGoTo(1);
}
