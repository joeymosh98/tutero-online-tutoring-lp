// ═══════════════════════════════════════════════════════════════
// Tutero Tutor Matching Funnel — Internal Demo
// Screens: thinking | contact | match | checkout
// ═══════════════════════════════════════════════════════════════

// ── State ──
var State = {
  student: {
    name: 'Emma',
    yearLevel: 'Year 8',
    subject: 'Maths',
    situation: 'falling-behind',
    currentGrade: 'below',
    confidence: 'low',
    struggleArea: 'algebra-equations',
    state: 'NSW'
  },
  contact: {
    phone: '',
    digits: '',
    email: '',
    parentName: ''
  },
  tutor: {
    name: 'Sarah R.',
    initials: 'SR',
    matchPct: 96,
    tagline: 'Year 7–12 Maths specialist · 6 years experience',
    whyStatements: [
      'Specialises in building confidence for students who are falling behind',
      'Experienced with Year 8 curriculum and algebra foundations',
      'Patient, encouraging teaching style — perfect for {name}'
    ],
    nextSlot: 'Tomorrow, 4:30pm',
    spotsLeft: 2,
    stats: {
      years: 6,
      students: 84,
      gradeImprovement: '1.5',
      education: 'B.Ed (Mathematics), University of Sydney',
      responseTime: 'Typically responds within 2 hours'
    }
  },
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

// ═══════════════════════════════════════════════════════════════
// URL Param Overrides (for demo flexibility)
// ═══════════════════════════════════════════════════════════════
function loadFromUrlParams() {
  var p = new URLSearchParams(window.location.search);
  if (p.get('name')) State.student.name = p.get('name');
  if (p.get('year')) State.student.yearLevel = p.get('year');
  if (p.get('subject')) State.student.subject = p.get('subject');
  if (p.get('situation')) State.student.situation = p.get('situation');
  if (p.get('state')) State.student.state = p.get('state');
  if (p.get('struggle')) State.student.struggleArea = p.get('struggle');
}

// ═══════════════════════════════════════════════════════════════
// Screen Navigation
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
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function escHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

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

function getStateFullName(val) {
  var map = {
    'NSW': 'New South Wales', 'VIC': 'Victoria', 'QLD': 'Queensland',
    'SA': 'South Australia', 'WA': 'Western Australia', 'TAS': 'Tasmania',
    'NT': 'Northern Territory', 'ACT': 'Australian Capital Territory'
  };
  return map[val] || val;
}

// ═══════════════════════════════════════════════════════════════
// Personalisation — inject student name into all dynamic text
// ═══════════════════════════════════════════════════════════════
function personalise() {
  var n = State.student.name;
  var s = State.student;

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

  // Match screen
  document.getElementById('matchHeadline').textContent = 'We found ' + n + '\u2019s teacher.';
  document.getElementById('offerText').textContent = n + '\u2019s first lesson';
  document.getElementById('bookBtn').textContent = 'Book ' + n + '\u2019s first lesson \u2014 60% off \u2192';

  // Why statements
  var why = State.tutor.whyStatements;
  document.getElementById('why1').textContent = why[0];
  document.getElementById('why2').textContent = why[1];
  document.getElementById('why3').textContent = why[2].replace('{name}', n);

  // Availability
  document.getElementById('availSlot').textContent = State.tutor.nextSlot;
  document.getElementById('scarcityTag').textContent =
    State.tutor.spotsLeft + ' evening slots left this week';

  // Tutor data
  document.getElementById('tutorName').textContent = State.tutor.name;
  document.getElementById('tutorTagline').textContent = State.tutor.tagline;
  document.getElementById('tutorInitials').textContent = State.tutor.initials;
  document.getElementById('miniTutorName').textContent = State.tutor.name;
  document.getElementById('miniInitials').textContent = State.tutor.initials;
  document.getElementById('miniMatch').textContent =
    State.tutor.matchPct + '% match \u00B7 #1 pick';

  // Tutor stats
  var stats = State.tutor.stats;
  document.getElementById('statYears').textContent = stats.years;
  document.getElementById('statStudents').textContent = stats.students;
  document.getElementById('statImprove').textContent = stats.gradeImprovement;
  document.getElementById('detailEducation').textContent = stats.education;
  document.getElementById('detailResponse').textContent = stats.responseTime;

  // Checkout
  document.getElementById('slotPickerTitle').textContent =
    'Pick a time for ' + n + '\u2019s first lesson';

  // Pricing
  document.getElementById('priceFull').textContent = '$' + State.pricing.full.toFixed(2);
  document.getElementById('priceSaving').textContent = '\u2212$' + State.pricing.saving.toFixed(2);
  document.getElementById('priceDue').textContent = '$' + State.pricing.due.toFixed(2);
  document.getElementById('payBtnText').textContent = 'Confirm & pay $' + State.pricing.due.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 1: Thinking / AI Matching Animation
// ═══════════════════════════════════════════════════════════════
var particleAnimId = null;

function initParticleCanvas() {
  stopParticleCanvas();
  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  var w = canvas.offsetWidth;
  var h = canvas.offsetHeight;
  var count = 50;
  var connectionDist = 110;
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
          ctx.strokeStyle = 'rgba(59,155,98,' + (0.07 * (1 - dist / connectionDist)) + ')';
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
      ctx.fillStyle = 'rgba(59,155,98,0.15)';
      ctx.fill();
    }
    particleAnimId = requestAnimationFrame(tick);
  }
  tick();
}

function stopParticleCanvas() {
  if (particleAnimId) {
    cancelAnimationFrame(particleAnimId);
    particleAnimId = null;
  }
}

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

  var phases = buildThinkingPhases();
  var feed = document.getElementById('thinkingFeed');
  feed.innerHTML = '';

  var circumference = 2 * Math.PI * 52;
  var ring = document.getElementById('progressRingFg');
  var pctEl = document.getElementById('progressPct');
  var phaseEl = document.getElementById('phaseLabel');
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
  var maxVisible = 5;
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
      phaseEl.textContent = 'Complete';
      if (stepEls.length > 0) {
        var last = stepEls[stepEls.length - 1];
        last.classList.remove('active');
        last.classList.add('done');
        var lastStatus = last.querySelector('.tf-step-status');
        if (lastStatus) lastStatus.innerHTML = '\u2713';
      }
      // Auto-advance after 1.2s
      timeouts.push(setTimeout(function() { goTo(1); }, 1200));
      return;
    }

    var step = allSteps[index];
    phaseEl.textContent = step.phaseLabel;

    // Mark previous done
    if (index > 0 && stepEls[index - 1]) {
      stepEls[index - 1].classList.remove('active');
      stepEls[index - 1].classList.add('done');
      var prev = stepEls[index - 1].querySelector('.tf-step-status');
      if (prev) prev.innerHTML = '\u2713';
    }

    // Create step element
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

    // Fade out old steps
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
  timeouts.push(setTimeout(function() { runStep(0); }, 600));
  window._thinkingTimeouts = timeouts;
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
    goTo(2);
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
// SCREEN 3: Match Reveal
// ═══════════════════════════════════════════════════════════════
var matchAnimated = false;

function initMatchReveal() {
  if (!matchAnimated) {
    animateMatchPercent();
    startCountdown();
    matchAnimated = true;
  }
}

function animateMatchPercent() {
  var el = document.getElementById('matchPct');
  var target = State.tutor.matchPct;
  var start = null;
  var duration = 1500;

  function tick(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    // Ease out cubic
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Book button
document.getElementById('bookBtn').addEventListener('click', function() {
  goTo(3);
});

// Other matches link
document.getElementById('otherMatchesLink').addEventListener('click', function() {
  alert('More matches coming soon! For now, we\u2019ve selected the #1 best fit.');
});

// ═══════════════════════════════════════════════════════════════
// Countdown Timer (shared between Screens 3 & 4)
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

  var timerEls = [
    document.getElementById('countdownTimer'),
    document.getElementById('checkoutTimer')
  ];

  timerEls.forEach(function(el) {
    if (!el) return;
    if (remaining <= 0) {
      el.textContent = 'Expired';
      var parent = el.closest('.timer-text') || el.closest('.offer-bar-text');
      if (parent) parent.classList.remove('timer-urgent');
    } else {
      el.textContent = text;
      // Under 5 min — amber urgency
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
}

function selectSlot(index) {
  State.selectedSlot = State.slots[index];

  var slotPicker = document.getElementById('slotPicker');
  var paymentView = document.getElementById('paymentView');

  // Selected slot text
  var s = State.selectedSlot;
  document.getElementById('selectedSlotText').textContent =
    s.day + ' ' + s.date + ', ' + s.time + ' \u2014 1 hour lesson with ' + State.tutor.name;

  // Smooth fade transition
  slotPicker.classList.add('fade-out');
  setTimeout(function() {
    slotPicker.style.display = 'none';
    slotPicker.classList.remove('fade-out');
    paymentView.style.display = 'block';
    paymentView.classList.add('fade-in');
  }, 250);

}

// Change slot — go back to picker
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

  console.log('[Demo] Simulating payment success');
  setTimeout(showBookingSuccess, 1500);
});

function showBookingSuccess() {
  if (State.countdownInterval) clearInterval(State.countdownInterval);

  var overlay = document.getElementById('bookingSuccess');
  overlay.classList.add('visible');

  document.getElementById('successHeading').textContent = 'You\u2019re booked!';
  document.getElementById('successSub').textContent =
    State.student.name + '\u2019s first lesson with ' + State.tutor.name + ' is confirmed.';

  var slot = State.selectedSlot;
  if (slot) {
    document.getElementById('successDetails').textContent =
      slot.day + ' ' + slot.date + ', ' + slot.time + ' \u2014 1 hour lesson';
  }

  // Fire confetti
  if (typeof TuteroConfetti !== 'undefined') {
    TuteroConfetti.launch({ canvasId: 'confettiCanvas' });
  }
}

// ═══════════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════════
loadFromUrlParams();
try { personalise(); } catch(e) { console.error('personalise() failed:', e); }
initScreens();
// Enable pay button immediately (no Stripe validation needed in prototype)
document.getElementById('payBtn').disabled = false;
runThinkingSequence();
