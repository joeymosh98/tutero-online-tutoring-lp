// ═══════════════════════════════════════════════════════════════
// Tutero Quiz Funnel — Variant C (Lead Generation + Plan on TY Page)
// Screens: s0 Welcome | s1 Name | s2 Year | s3 Situation | s4 Grades
//          s5 Confidence | s6 Subject | s7 Struggle | s8 Urgency
//          s9 Name+Email | s10 Phone+State+Submit + Success
// ═══════════════════════════════════════════════════════════════

// ── Webhook + API ──
var WEBHOOK_URL = 'https://hook.eu1.make.com/46pou90x59vasab9ljivd78sfazjgztv';
var API_URL = '/api/generate-plan/';

function submitLeadData(data) {
  data.landing_page = 'Online Tutoring Australia - Quiz Funnel';
  data.variant = 'c';
  data.page = window.location.href;
  data.timestamp = new Date().toISOString();
  data.referrer = document.referrer || '';
  var utm = window.TuteroUTM ? window.TuteroUTM.get() : {};
  data.utm_source = utm.utm_source || '';
  data.utm_medium = utm.utm_medium || '';
  data.utm_campaign = utm.utm_campaign || '';
  data.utm_term = utm.utm_term || '';
  data.utm_content = utm.utm_content || '';
  data.gclid = utm.gclid || '';
  console.log('[Lead]', data);
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(function() {});
}

function buildThankYouUrl() {
  var base = '/tp/online-tutoring/a/';
  var p = new URLSearchParams();
  if (S.studentName) p.set('studentName', S.studentName);
  if (S.subject) p.set('subject', S.subject);
  if (S.yearLevel) p.set('yearLevel', S.yearLevel);
  if (S.situation) p.set('situation', S.situation);
  if (S.currentGrade) p.set('currentGrade', S.currentGrade);
  if (S.confidence) p.set('confidence', S.confidence);
  if (S.struggleArea) p.set('struggleArea', S.struggleArea);
  if (S.urgency) p.set('urgency', S.urgency);
  var utm = window.TuteroUTM ? window.TuteroUTM.get() : {};
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid'].forEach(function(k) {
    if (utm[k]) p.set(k, utm[k]);
  });
  var qs = p.toString();
  return base + (qs ? '?' + qs : '');
}

// ═══════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════
var S = {
  studentName: '',
  yearLevel: '',
  situation: '',
  currentGrade: '',
  confidence: '',
  subject: '',
  struggleArea: '',
  urgency: '',
  parentName: '',
  email: '',
  phone: '',
  phoneDigits: '',
  state: ''
};

// ═══════════════════════════════════════════════════════════════
// Screen Navigation (11 screens: s0-s10)
// ═══════════════════════════════════════════════════════════════
var screens = [];
var cur = 0;
var header = document.getElementById('qzHeader');
var backBtn = document.getElementById('backBtn');
var progressFill = document.getElementById('progressFill');
var stepLabel = document.getElementById('stepLabel');
var PROGRESS = [0, 10, 18, 28, 38, 48, 58, 68, 78, 86, 93];

function initScreens() {
  for (var i = 0; i <= 10; i++) screens.push(document.getElementById('s' + i));
}

function updateChrome(n) {
  if (n === 0) {
    header.classList.remove('light');
  } else {
    header.classList.add('light');
  }
  // Back button — hide on welcome
  backBtn.style.visibility = (n > 0) ? 'visible' : 'hidden';
  // Progress bar
  progressFill.style.width = (PROGRESS[n] || 0) + '%';
  // Step text
  if (n >= 3 && n <= 8) stepLabel.textContent = (n - 2) + ' of 6';
  else if (n === 9 || n === 10) stepLabel.textContent = 'Details';
  else stepLabel.textContent = '';
}

function goTo(n) {
  if (n === cur || n < 0 || n > 10) return;
  var fwd = n > cur;
  var old = screens[cur];
  var next = screens[n];

  old.classList.remove('active');
  old.classList.add(fwd ? 'exit-left' : 'exit-right');

  next.classList.remove('exit-left', 'exit-right');
  next.classList.add('active');
  next.scrollTop = 0;

  cur = n;
  updateChrome(n);
  reanimate(next);

  if (n === 1) {
    setTimeout(function() { document.getElementById('fStudentName').focus(); }, 450);
  }
  if (n === 9) {
    setTimeout(function() { fPN.focus(); }, 450);
  }
  if (n === 10) {
    setTimeout(function() { fPH.focus(); }, 450);
  }
}

function reanimate(el) {
  el.querySelectorAll('.qz-card, .qz-pill, .year-pill').forEach(function(c) {
    c.style.animation = 'none';
    c.offsetHeight;
    c.style.animation = '';
  });
}

// ═══════════════════════════════════════════════════════════════
// Personalisation Engine
// ═══════════════════════════════════════════════════════════════
var SIT_TESTIMONIALS = {
  'falling-behind': '\u201CMy son\u2019s grades went up 30% in 6 months.\u201D \u2014 <strong>Deb S., NSW</strong>',
  'consistent-practice': '\u201CShe finishes homework independently and smiles doing it!\u201D \u2014 <strong>Rachel S.</strong>',
  'get-ahead': '\u201CHe exceeded his ATAR target by 5 points.\u201D \u2014 <strong>Andrew P.</strong>',
  'exam-prep': '\u201CThe difference is night and day. Oliver\u2019s tutor gets him.\u201D \u2014 <strong>Karen M.</strong>'
};

var SITUATION_LABELS = {
  'falling-behind': 'Falling behind',
  'consistent-practice': 'Needs practice',
  'get-ahead': 'Wants to get ahead',
  'exam-prep': 'Exam prep'
};

var GRADE_LABELS = {
  'above': 'Above average',
  'average': 'About average',
  'below': 'Below expected',
  'well-below': 'Well below expected'
};

var CONFIDENCE_LABELS = {
  'good': 'Generally confident',
  'mixed': 'Confidence varies',
  'low': 'Not very confident'
};

var URGENCY_HELPER_TEXT = {
  'asap': 'We prioritise urgent requests \u2014 expect a call within hours.',
  'this-term': 'We\u2019ll have a tutor matched and ready this week.',
  'next-term': 'Great planning! We\u2019ll lock in the perfect tutor ahead of time.'
};

var TUTOR_COUNTS = {
  'Maths': [14, 22], 'English': [12, 18], 'Science': [8, 14],
  'Chemistry': [6, 10], 'Physics': [5, 9], 'Biology': [5, 8],
  'History': [4, 7], 'Geography': [3, 6], 'Other': [6, 10]
};

function personaliseWithName(name) {
  document.getElementById('yearBadge').textContent = 'About ' + name;
  document.getElementById('yearHeading').textContent = 'What year level is ' + name + ' in?';
  document.getElementById('sitHeading').textContent = 'What best describes ' + name + ' right now?';
  document.getElementById('gradeHeading').textContent = 'How is ' + name + ' going in school right now?';
  document.getElementById('confHeading').textContent = 'How confident is ' + name + ' about learning?';
  document.getElementById('subjectHeading').textContent = 'What subject does ' + name + ' need most help with?';
  document.getElementById('urgencyHeading').textContent = 'When would you like ' + name + ' to start?';
}

// Personalise Screen 9 (name + email step)
function personaliseScreen9() {
  // Dynamic heading
  document.getElementById('formHeading').textContent =
    'Almost done! Where should we send ' + S.studentName + '\u2019s tutor match?';
  document.getElementById('formSub').textContent =
    'We\u2019ll be in touch today to discuss ' + S.studentName + '\u2019s learning plan.';

  // Quiz summary tags
  var tags = [
    S.yearLevel,
    S.subject,
    SITUATION_LABELS[S.situation] || '',
    GRADE_LABELS[S.currentGrade] || '',
    CONFIDENCE_LABELS[S.confidence] || ''
  ].filter(Boolean);
  document.getElementById('summaryTags').innerHTML = tags.map(function(t) {
    return '<span class="ptag"><span class="check">&#10003;</span> ' + escHtml(t) + '</span>';
  }).join('');
  document.getElementById('summaryTitle').textContent = 'Summary for ' + S.studentName;

  // Tutor matching message
  var range = TUTOR_COUNTS[S.subject] || TUTOR_COUNTS['Other'];
  var count = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
  document.getElementById('tutorMatchText').innerHTML =
    'We found <strong>' + count + ' ' + escHtml(S.subject) + ' tutors</strong> available for ' +
    escHtml(S.yearLevel) + ' students';
}

// Personalise Screen 10 (phone + state step)
function personaliseScreen10() {
  // Heading
  document.getElementById('formHeading2').textContent =
    'Best number to reach you on?';
  document.getElementById('formSub2').textContent =
    'We\u2019ll call to discuss ' + S.studentName + '\u2019s ' + S.subject + ' tutor match.';

  // Submit button
  document.getElementById('submitBtn').innerHTML =
    'Find ' + escHtml(S.studentName) + '\u2019s tutor <span>&rarr;</span>';

  // Urgency helper
  document.getElementById('urgencyHelper').textContent =
    URGENCY_HELPER_TEXT[S.urgency] || '';

  // Testimonial
  var tHtml = SIT_TESTIMONIALS[S.situation] || SIT_TESTIMONIALS['falling-behind'];
  document.getElementById('formTestimonial').innerHTML = tHtml;
}

// ═══════════════════════════════════════════════════════════════
// Background Plan Generation (fires when form screen loads)
// ═══════════════════════════════════════════════════════════════
function fireBackgroundPlanGeneration() {
  var controller = new AbortController();
  var fetchTimeout = setTimeout(function() { controller.abort(); }, 15000);

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: S.studentName,
      yearLevel: S.yearLevel,
      situation: S.situation,
      currentGrade: S.currentGrade,
      confidence: S.confidence,
      subject: S.subject,
      struggleArea: S.struggleArea,
      urgency: S.urgency
    }),
    signal: controller.signal
  })
  .then(function(res) {
    clearTimeout(fetchTimeout);
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
  })
  .then(function(data) {
    if (data.error) throw new Error(data.error);
    // Store plan in localStorage for thank you page
    try {
      localStorage.setItem('tutero_learning_plan', JSON.stringify({
        plan: data.plan,
        quizData: {
          studentName: S.studentName,
          yearLevel: S.yearLevel,
          situation: S.situation,
          currentGrade: S.currentGrade,
          confidence: S.confidence,
          subject: S.subject,
          struggleArea: S.struggleArea,
          urgency: S.urgency
        },
        timestamp: new Date().toISOString()
      }));
    } catch (e) {}
  })
  .catch(function(err) {
    console.error('Background plan generation failed:', err);
  });
}

// ═══════════════════════════════════════════════════════════════
// Struggle Area — Dynamic Cards per Subject
// ═══════════════════════════════════════════════════════════════
var STRUGGLE_OPTIONS = {
  'Maths': [
    { val: 'understanding-concepts', label: 'Understanding concepts' },
    { val: 'word-problems', label: 'Word problems' },
    { val: 'algebra-equations', label: 'Algebra & equations' }
  ],
  'English': [
    { val: 'reading-comprehension', label: 'Reading comprehension' },
    { val: 'essay-writing', label: 'Essay writing' },
    { val: 'grammar-punctuation', label: 'Grammar & punctuation' }
  ],
  'Science': [
    { val: 'understanding-theory', label: 'Understanding theory' },
    { val: 'applying-formulas', label: 'Applying formulas' },
    { val: 'linking-concepts', label: 'Linking concepts' }
  ],
  'Chemistry': [
    { val: 'balancing-equations', label: 'Balancing equations' },
    { val: 'mole-calculations', label: 'Mole calculations' },
    { val: 'organic-chemistry', label: 'Organic chemistry' }
  ],
  'Physics': [
    { val: 'problem-solving', label: 'Problem solving' },
    { val: 'understanding-formulas', label: 'Understanding formulas' },
    { val: 'motion-forces', label: 'Motion & forces' }
  ],
  'Biology': [
    { val: 'cell-biology', label: 'Cell biology' },
    { val: 'genetics', label: 'Genetics' },
    { val: 'human-body', label: 'Human body systems' }
  ],
  'History': [
    { val: 'essay-structure', label: 'Essay structure' },
    { val: 'source-analysis', label: 'Source analysis' },
    { val: 'cause-effect', label: 'Cause & effect' }
  ],
  'Other': [
    { val: 'understanding-concepts', label: 'Understanding concepts' },
    { val: 'homework-completion', label: 'Homework completion' },
    { val: 'test-preparation', label: 'Test preparation' }
  ]
};

STRUGGLE_OPTIONS['Geography'] = [
  { val: 'map-skills', label: 'Map skills' },
  { val: 'data-interpretation', label: 'Data interpretation' },
  { val: 'essay-writing', label: 'Essay writing' }
];

function populateStruggleCards(subject) {
  var container = document.getElementById('strugglePills');
  var options = STRUGGLE_OPTIONS[subject] || STRUGGLE_OPTIONS['Other'];
  container.innerHTML = '';
  options.forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'qz-card';
    btn.dataset.val = opt.val;
    btn.innerHTML =
      '<span class="qz-emoji">&#x1F4A1;</span>' +
      '<div class="qz-text"><strong>' + opt.label + '</strong></div>';
    container.appendChild(btn);
  });
  // Always add "Not sure" option
  var notSure = document.createElement('button');
  notSure.className = 'qz-card';
  notSure.dataset.val = 'not-sure';
  notSure.innerHTML =
    '<span class="qz-emoji">&#x1F937;</span>' +
    '<div class="qz-text"><strong>Not sure</strong><span>Skip this question</span></div>';
  container.appendChild(notSure);
  // Update heading
  document.getElementById('struggleHeading').textContent =
    'Where does ' + S.studentName + ' struggle most in ' + subject + '?';
  // Bind click handlers
  initStruggleScreen();
}

function initStruggleScreen() {
  var cards = document.querySelectorAll('#strugglePills .qz-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      cards.forEach(function(c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      S.struggleArea = card.dataset.val;
      setTimeout(function() { goTo(8); }, 320);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Card / Pill Selection
// ═══════════════════════════════════════════════════════════════
function initCardScreen(id, key, nextScreen, onSelect) {
  var el = document.getElementById(id);
  var cards = el.querySelectorAll('.qz-card, .qz-pill');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      cards.forEach(function(c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      S[key] = card.dataset.val;
      if (onSelect) onSelect();
      setTimeout(function() { goTo(nextScreen); }, 320);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Validation Helpers
// ═══════════════════════════════════════════════════════════════
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

function formatPhone(input) {
  var raw = input.value;
  var hasPlus = raw.trimStart().startsWith('+');
  var d = raw.replace(/\D/g, '');
  if (hasPlus && d.startsWith('61')) d = '0' + d.slice(2);
  else if (d.startsWith('61') && d.length > 10) d = '0' + d.slice(2);
  if (d.length > 10) d = d.slice(0, 10);
  S.phoneDigits = d;
  var f = d;
  if (d.length > 4 && d.length <= 7) f = d.slice(0,4) + ' ' + d.slice(4);
  else if (d.length > 7) f = d.slice(0,4) + ' ' + d.slice(4,7) + ' ' + d.slice(7);
  if (input.value !== f) {
    var pos = input.selectionStart;
    var diff = f.length - input.value.length;
    input.value = f;
    input.setSelectionRange(pos + diff, pos + diff);
  }
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function showErr(el) {
  var w = el.closest('.field-wrap');
  if (w) w.classList.add('has-error');
}
function clearErr(el) {
  var w = el.closest('.field-wrap');
  if (w) w.classList.remove('has-error');
}
function toggleBtn(btn, ok) {
  if (ok) btn.classList.remove('disabled'); else btn.classList.add('disabled');
}

function escHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════
// Screen 1: Student Name
// ═══════════════════════════════════════════════════════════════
var fSN = document.getElementById('fStudentName');
var nameBtn = document.getElementById('nameBtn');

fSN.addEventListener('input', function() {
  toggleBtn(nameBtn, fSN.value.trim().length > 0);
});

nameBtn.addEventListener('click', function() {
  if (nameBtn.classList.contains('disabled')) return;
  S.studentName = cap(fSN.value.trim());
  fSN.value = S.studentName;
  personaliseWithName(S.studentName);
  goTo(2);
});

fSN.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); nameBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// Screen 2: Year Level (pill grid, auto-advance)
// ═══════════════════════════════════════════════════════════════
var yearPills = document.querySelectorAll('#s2 .year-pill');
yearPills.forEach(function(pill) {
  pill.addEventListener('click', function() {
    yearPills.forEach(function(p) { p.classList.remove('selected'); });
    pill.classList.add('selected');
    S.yearLevel = pill.dataset.val;
    setTimeout(function() { goTo(3); }, 320);
  });
});

// ═══════════════════════════════════════════════════════════════
// Screen 9: Name + Email (Continue to Screen 10)
// ═══════════════════════════════════════════════════════════════
var fPN = document.getElementById('fParentName');
var fEM = document.getElementById('fEmail');
var contBtn = document.getElementById('continueBtn');

function checkStep1() {
  toggleBtn(contBtn, fPN.value.trim() && isValidEmail(fEM.value.trim()));
}

[fPN, fEM].forEach(function(i) {
  i.addEventListener('input', function() {
    checkStep1();
    if (i === fPN && fPN.value.trim()) clearErr(fPN);
    if (i === fEM && isValidEmail(fEM.value.trim())) clearErr(fEM);
  });
});

contBtn.addEventListener('click', function() {
  if (contBtn.classList.contains('disabled')) {
    // Validate and show errors
    if (!fPN.value.trim()) showErr(fPN); else clearErr(fPN);
    if (!isValidEmail(fEM.value.trim())) showErr(fEM); else clearErr(fEM);
    return;
  }
  S.parentName = fPN.value.trim();
  S.email = fEM.value.trim();
  personaliseScreen10();
  goTo(10);
});

// Enter key on step 1 fields
[fPN, fEM].forEach(function(el) {
  el.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); contBtn.click(); }
  });
});

// ═══════════════════════════════════════════════════════════════
// Screen 10: Phone + State + Submit
// ═══════════════════════════════════════════════════════════════
var fPH = document.getElementById('fPhone');
var fST = document.getElementById('fState');
var subBtn = document.getElementById('submitBtn');

function checkStep2() {
  toggleBtn(subBtn, S.phoneDigits.length >= 10 && fST.value);
}

fPH.addEventListener('input', function() {
  formatPhone(fPH);
  checkStep2();
  if (S.phoneDigits.length >= 10) clearErr(fPH);
});
fST.addEventListener('change', function() {
  checkStep2();
  if (fST.value) { clearErr(fST); fST.classList.remove('is-placeholder'); }
});

subBtn.addEventListener('click', function() {
  if (subBtn.classList.contains('disabled')) {
    // Validate and show errors
    if (S.phoneDigits.length < 10) showErr(fPH); else clearErr(fPH);
    if (!fST.value) showErr(fST); else clearErr(fST);
    return;
  }

  submitLeadData({
    source: 'quiz_funnel',
    student_name: S.studentName,
    year_level: S.yearLevel,
    state: fST.value,
    subject: S.subject,
    situation: S.situation,
    current_grade: S.currentGrade,
    confidence: S.confidence,
    struggle_area: S.struggleArea,
    urgency: S.urgency,
    parent_name: fPN.value.trim(),
    email: fEM.value.trim(),
    phone: fPH.value.trim()
  });

  // Show success state
  document.getElementById('formStep2').style.display = 'none';
  document.getElementById('successName').textContent = S.studentName;
  document.getElementById('successWrap').classList.add('active');
  progressFill.style.width = '100%';
  backBtn.style.visibility = 'hidden';
  launchConfetti();
  document.getElementById('tyLink').href = buildThankYouUrl();
});

// Enter key on step 2 fields
fPH.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); subBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// Social Proof Counter
// ═══════════════════════════════════════════════════════════════
(function() {
  var el = document.getElementById('proofCount');
  if (!el) return;
  var n = parseInt(el.textContent, 10);
  var t = 0;
  var timer = setInterval(function() {
    t++; n++;
    el.textContent = n;
    if (t >= 2) clearInterval(timer);
  }, 20000);
})();

// ═══════════════════════════════════════════════════════════════
// Confetti
// ═══════════════════════════════════════════════════════════════
function launchConfetti() {
  var c = document.getElementById('confettiCanvas');
  var ctx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  var cols = ['#FF8412','#F8B200','#4CB092','#00A3FF','#1D49E3','#FF6B6B'];
  var ps = [];
  for (var i = 0; i < 130; i++) {
    ps.push({
      x: c.width / 2 + (Math.random() - 0.5) * 260,
      y: c.height * 0.45,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -20 - 5,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: cols[Math.floor(Math.random() * cols.length)],
      rot: Math.random() * 360,
      rs: (Math.random() - 0.5) * 14,
      g: 0.3 + Math.random() * 0.2,
      o: 1
    });
  }
  var f = 0;
  function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    var alive = false;
    ps.forEach(function(p) {
      p.x += p.vx; p.vy += p.g; p.y += p.vy;
      p.rot += p.rs; p.vx *= 0.99;
      if (f > 45) p.o -= 0.014;
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
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, c.width, c.height);
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════════
initScreens();
updateChrome(0);

// Header back button
backBtn.addEventListener('click', function() {
  if (cur > 0) goTo(cur - 1);
});

// Screen 0 -> 1
document.getElementById('startBtn').addEventListener('click', function() { goTo(1); });

// Quiz card screens with auto-advance
initCardScreen('s3', 'situation', 4);
initCardScreen('s4', 'currentGrade', 5);
initCardScreen('s5', 'confidence', 6);
initCardScreen('s6', 'subject', 7, function() {
  populateStruggleCards(S.subject);
});
// s7 (struggle) is handled by initStruggleScreen() called from populateStruggleCards()
initCardScreen('s8', 'urgency', 9, function() {
  personaliseScreen9();
  fireBackgroundPlanGeneration();
});
