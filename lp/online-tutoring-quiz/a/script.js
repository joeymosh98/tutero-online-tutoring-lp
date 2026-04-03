// ═══════════════════════════════════════════════════════════════
// Tutero Quiz Funnel — Variant A (Lead Generation + Plan on TY Page)
// Screens: s0 Welcome | s1 Who | s2 Name | s3 Year | s4 Situation
//          s5 Grades | s6 Confidence | s7 Subject | s8 Struggle
//          s9 Urgency | s10 Thinking | s11 Phone | s12 Email
//          s13 Name+State (or State-only) + Submit
// ═══════════════════════════════════════════════════════════════

// ── Webhook + API ──
var WEBHOOK_URL = 'https://hook.eu1.make.com/46pou90x59vasab9ljivd78sfazjgztv';
var API_URL = '/api/generate-plan/';

function submitLeadData(data) {
  data.landing_page = 'Online Tutoring Quiz';
  data.variant = 'a';
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
  var base = '/tp/online-tutoring-quiz/a/';
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
  isForSelf: false,
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
  state: '',
  tutorCount: 0
};

// ═══════════════════════════════════════════════════════════════
// Screen Navigation (14 screens: s0-s13)
// ═══════════════════════════════════════════════════════════════
var TOTAL_SCREENS = 13;
var screens = [];
var cur = 0;
var header = document.getElementById('qzHeader');
var backBtn = document.getElementById('backBtn');
var progressFill = document.getElementById('progressFill');
var stepLabel = document.getElementById('stepLabel');
var PROGRESS = [0, 5, 12, 19, 26, 34, 42, 50, 58, 66, 74, 82, 89, 95];

function initScreens() {
  for (var i = 0; i <= TOTAL_SCREENS; i++) screens.push(document.getElementById('s' + i));
}

function updateChrome(n) {
  if (n === 0) {
    header.classList.remove('light');
  } else {
    header.classList.add('light');
  }
  // Back button — hide on welcome and thinking screen
  backBtn.style.visibility = (n > 0 && n !== 10) ? 'visible' : 'hidden';
  // Progress bar
  progressFill.style.width = (PROGRESS[n] || 0) + '%';
  // Step text
  if (n >= 4 && n <= 9) stepLabel.textContent = (n - 3) + ' of 6';
  else if (n === 10) stepLabel.textContent = '';
  else if (n >= 11 && n <= 13) stepLabel.textContent = 'Almost there';
  else stepLabel.textContent = '';
}

function goTo(n) {
  if (n === cur || n < 0 || n > TOTAL_SCREENS) return;
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

  if (n === 2) {
    setTimeout(function() { document.getElementById('fStudentName').focus(); }, 450);
  }
  if (n === 10) {
    runThinkingSequence();
  }
  if (n === 11) {
    setTimeout(function() { fPH.focus(); }, 450);
  }
  if (n === 12) {
    setTimeout(function() { fEM.focus(); }, 450);
  }
  if (n === 13 && !S.isForSelf) {
    setTimeout(function() { fPN.focus(); }, 450);
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
var TUTOR_COUNTS = {
  'Maths': [14, 22], 'English': [12, 18], 'Science': [8, 14],
  'Chemistry': [6, 10], 'Physics': [5, 9], 'Biology': [5, 8],
  'History': [4, 7], 'Geography': [3, 6], 'Other': [6, 10]
};

// Called after "who is this for?" selection
function personaliseForMode() {
  if (S.isForSelf) {
    document.getElementById('nameBadge').textContent = 'About you';
    document.getElementById('nameHeading').textContent = 'What\u2019s your first name?';
    // Situation cards — first person
    document.getElementById('sitLabel1').textContent = 'Falling behind';
    document.getElementById('sitSub1').textContent = 'Struggling to keep up in class';
    document.getElementById('sitLabel2').textContent = 'Need consistent practice';
    document.getElementById('sitSub2').textContent = 'Doing okay but need more practice';
    document.getElementById('sitLabel3').textContent = 'Want to get ahead';
    document.getElementById('sitSub3').textContent = 'Doing well and aiming higher';
    document.getElementById('sitLabel4').textContent = 'Preparing for exams';
    document.getElementById('sitSub4').textContent = 'HSC, ATAR, or key assessments coming up';
  } else {
    document.getElementById('nameBadge').textContent = 'About your child';
    document.getElementById('nameHeading').textContent = 'What\u2019s your child\u2019s first name?';
    // Situation cards — third person (default)
    document.getElementById('sitLabel1').textContent = 'Falling behind';
    document.getElementById('sitSub1').textContent = 'Struggling to keep up in class';
    document.getElementById('sitLabel2').textContent = 'Needs consistent practice';
    document.getElementById('sitSub2').textContent = 'Good but needs regular reinforcement';
    document.getElementById('sitLabel3').textContent = 'Wants to get ahead';
    document.getElementById('sitSub3').textContent = 'Capable student aiming higher';
    document.getElementById('sitLabel4').textContent = 'Preparing for exams';
    document.getElementById('sitSub4').textContent = 'HSC, ATAR, or key assessments coming up';
  }
}

// Called after name is entered
function personaliseWithName(name) {
  if (S.isForSelf) {
    document.getElementById('yearBadge').textContent = 'About you';
    document.getElementById('yearHeading').textContent = 'What level are you studying at?';
    document.getElementById('sitHeading').textContent = 'What best describes you right now?';
    document.getElementById('gradeHeading').textContent = 'How are you going right now?';
    document.getElementById('confHeading').textContent = 'How confident are you about learning?';
    document.getElementById('subjectHeading').textContent = 'What subject do you need most help with?';
    document.getElementById('urgencyHeading').textContent = 'When would you like to start?';
  } else {
    document.getElementById('yearBadge').textContent = 'About ' + name;
    document.getElementById('yearHeading').textContent = 'What year level is ' + name + ' in?';
    document.getElementById('sitHeading').textContent = 'What best describes ' + name + ' right now?';
    document.getElementById('gradeHeading').textContent = 'How is ' + name + ' going in school right now?';
    document.getElementById('confHeading').textContent = 'How confident is ' + name + ' about learning?';
    document.getElementById('subjectHeading').textContent = 'What subject does ' + name + ' need most help with?';
    document.getElementById('urgencyHeading').textContent = 'When would you like ' + name + ' to start?';
  }
}

// ═══════════════════════════════════════════════════════════════
// Thinking Screen (s10) — Animated Sequence + Auto-advance
// ═══════════════════════════════════════════════════════════════
function runThinkingSequence() {
  var step1 = document.getElementById('thinkStep1');
  var step2 = document.getElementById('thinkStep2');
  var step3 = document.getElementById('thinkStep3');
  var result = document.getElementById('thinkingResult');

  // Reset state
  [step1, step2, step3].forEach(function(s) {
    s.classList.remove('visible', 'done');
  });
  result.classList.remove('visible');

  // Personalise text
  document.getElementById('thinkText1').textContent = 'Reviewing your preferences\u2026';
  document.getElementById('thinkText2').textContent = 'Searching for ' + S.subject + ' tutors\u2026';
  document.getElementById('thinkText3').textContent = S.isForSelf
    ? 'Preparing your personalised plan\u2026'
    : 'Preparing ' + S.studentName + '\u2019s personalised plan\u2026';

  // Calculate tutor count
  var range = TUTOR_COUNTS[S.subject] || TUTOR_COUNTS['Other'];
  S.tutorCount = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

  // Sequence: appear → done, appear → done, appear → done, result
  setTimeout(function() { step1.classList.add('visible'); }, 200);
  setTimeout(function() { step1.classList.add('done'); }, 1000);

  setTimeout(function() { step2.classList.add('visible'); }, 1200);
  setTimeout(function() { step2.classList.add('done'); }, 2200);

  setTimeout(function() { step3.classList.add('visible'); }, 2400);
  setTimeout(function() { step3.classList.add('done'); }, 3400);

  setTimeout(function() {
    document.getElementById('thinkResultCount').textContent =
      S.tutorCount + ' ' + S.subject + ' tutors available';
    document.getElementById('thinkResultSub').textContent =
      'for ' + S.yearLevel + ' students in your area';
    result.classList.add('visible');
  }, 3600);

  // Auto-advance to phone screen
  setTimeout(function() {
    personaliseContactScreens();
    goTo(11);
  }, 4600);
}

// ═══════════════════════════════════════════════════════════════
// Contact Screen Personalisation (s11 Phone, s12 Email, s13 Final)
// ═══════════════════════════════════════════════════════════════
function personaliseContactScreens() {
  // Final screen — adapt for self vs child
  if (S.isForSelf) {
    // Self mode: hide parent name, just show state
    document.getElementById('parentNameWrap').style.display = 'none';
    document.getElementById('finalHeading').textContent = 'Which state are you in?';
    document.getElementById('submitBtn').textContent = 'Find my tutor \u2192';
  } else {
    document.getElementById('parentNameWrap').style.display = '';
    document.getElementById('finalHeading').textContent = 'And your name?';
    document.getElementById('submitBtn').innerHTML =
      'Find ' + escHtml(S.studentName) + '\u2019s tutor \u2192';
  }
}

// ═══════════════════════════════════════════════════════════════
// Background Plan Generation (fires when thinking screen loads)
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
    { val: 'understanding-concepts', label: 'Concepts', emoji: '\u{1F9E9}' },
    { val: 'word-problems', label: 'Word problems', emoji: '\u{1F4D6}' },
    { val: 'algebra-equations', label: 'Algebra', emoji: '\u270F\uFE0F' }
  ],
  'English': [
    { val: 'reading-comprehension', label: 'Reading', emoji: '\u{1F4D6}' },
    { val: 'essay-writing', label: 'Essays', emoji: '\u270D\uFE0F' },
    { val: 'grammar-punctuation', label: 'Grammar', emoji: '\u{1F4DD}' }
  ],
  'Science': [
    { val: 'understanding-theory', label: 'Theory', emoji: '\u{1F52C}' },
    { val: 'applying-formulas', label: 'Formulas', emoji: '\u{1F9EE}' },
    { val: 'linking-concepts', label: 'Concepts', emoji: '\u{1F517}' }
  ],
  'Chemistry': [
    { val: 'balancing-equations', label: 'Equations', emoji: '\u2696\uFE0F' },
    { val: 'mole-calculations', label: 'Calculations', emoji: '\u{1F9EE}' },
    { val: 'organic-chemistry', label: 'Organic', emoji: '\u{1F9EA}' }
  ],
  'Physics': [
    { val: 'problem-solving', label: 'Problem solving', emoji: '\u{1F3AF}' },
    { val: 'understanding-formulas', label: 'Formulas', emoji: '\u{1F4D0}' },
    { val: 'motion-forces', label: 'Forces', emoji: '\u{1F680}' }
  ],
  'Biology': [
    { val: 'cell-biology', label: 'Cells', emoji: '\u{1F52C}' },
    { val: 'genetics', label: 'Genetics', emoji: '\u{1F9EC}' },
    { val: 'human-body', label: 'Body systems', emoji: '\u{1FAC0}' }
  ],
  'History': [
    { val: 'essay-structure', label: 'Essays', emoji: '\u270D\uFE0F' },
    { val: 'source-analysis', label: 'Sources', emoji: '\u{1F4DC}' },
    { val: 'cause-effect', label: 'Cause & effect', emoji: '\u{1F504}' }
  ],
  'Geography': [
    { val: 'map-skills', label: 'Maps', emoji: '\u{1F5FA}\uFE0F' },
    { val: 'data-interpretation', label: 'Data', emoji: '\u{1F4CA}' },
    { val: 'essay-writing', label: 'Essays', emoji: '\u270D\uFE0F' }
  ],
  'Other': [
    { val: 'understanding-concepts', label: 'Concepts', emoji: '\u{1F9E9}' },
    { val: 'homework-completion', label: 'Homework', emoji: '\u{1F4D3}' },
    { val: 'test-preparation', label: 'Tests', emoji: '\u{1F4DD}' }
  ]
};

function populateStruggleCards(subject) {
  var container = document.getElementById('strugglePills');
  var options = STRUGGLE_OPTIONS[subject] || STRUGGLE_OPTIONS['Other'];
  container.innerHTML = '';
  // "Not sure" first
  var notSure = document.createElement('button');
  notSure.className = 'qz-card';
  notSure.dataset.val = 'not-sure';
  notSure.innerHTML =
    '<span class="qz-emoji">&#x1F937;</span>' +
    '<div class="qz-text"><strong>Not sure</strong><span>Skip this question</span></div>';
  container.appendChild(notSure);
  options.forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'qz-card';
    btn.dataset.val = opt.val;
    btn.innerHTML =
      '<span class="qz-emoji">' + opt.emoji + '</span>' +
      '<div class="qz-text"><strong>' + opt.label + '</strong></div>';
    container.appendChild(btn);
  });
  // Update heading
  document.getElementById('struggleHeading').textContent = S.isForSelf
    ? 'Where do you struggle most in ' + subject + '?'
    : 'Where does ' + S.studentName + ' struggle most in ' + subject + '?';
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
      setTimeout(function() { goTo(9); }, 320);
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
// Screen 2: Student Name
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
  goTo(3);
});

fSN.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); nameBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// Screen 3: Year Level (pill grid, auto-advance)
// ═══════════════════════════════════════════════════════════════
var yearPills = document.querySelectorAll('#s3 .year-pill');
yearPills.forEach(function(pill) {
  pill.addEventListener('click', function() {
    yearPills.forEach(function(p) { p.classList.remove('selected'); });
    pill.classList.add('selected');
    S.yearLevel = pill.dataset.val;
    setTimeout(function() { goTo(4); }, 320);
  });
});

// ═══════════════════════════════════════════════════════════════
// Screen 11: Phone (Continue to Screen 12)
// ═══════════════════════════════════════════════════════════════
var fPH = document.getElementById('fPhone');
var phoneBtn = document.getElementById('phoneBtn');

function checkPhone() {
  toggleBtn(phoneBtn, S.phoneDigits.length >= 10);
}

fPH.addEventListener('input', function() {
  formatPhone(fPH);
  checkPhone();
  if (S.phoneDigits.length >= 10) clearErr(fPH);
});

phoneBtn.addEventListener('click', function() {
  if (phoneBtn.classList.contains('disabled')) {
    if (S.phoneDigits.length < 10) showErr(fPH); else clearErr(fPH);
    return;
  }
  S.phone = fPH.value.trim();
  goTo(12);
});

fPH.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); phoneBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// Screen 12: Email (Continue to Screen 13)
// ═══════════════════════════════════════════════════════════════
var fEM = document.getElementById('fEmail');
var emailBtn = document.getElementById('emailBtn');

function checkEmail() {
  toggleBtn(emailBtn, isValidEmail(fEM.value.trim()));
}

fEM.addEventListener('input', function() {
  checkEmail();
  if (isValidEmail(fEM.value.trim())) clearErr(fEM);
});

emailBtn.addEventListener('click', function() {
  if (emailBtn.classList.contains('disabled')) {
    if (!isValidEmail(fEM.value.trim())) showErr(fEM); else clearErr(fEM);
    return;
  }
  S.email = fEM.value.trim();
  goTo(13);
});

fEM.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); emailBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// Screen 13: Parent Name + State (or State-only) + Submit
// ═══════════════════════════════════════════════════════════════
var fPN = document.getElementById('fParentName');
var fST = document.getElementById('fState');
var subBtn = document.getElementById('submitBtn');

function checkFinal() {
  if (S.isForSelf) {
    toggleBtn(subBtn, !!fST.value);
  } else {
    toggleBtn(subBtn, fPN.value.trim() && fST.value);
  }
}

fPN.addEventListener('input', function() {
  checkFinal();
  if (fPN.value.trim()) clearErr(fPN);
});
fST.addEventListener('change', function() {
  checkFinal();
  if (fST.value) { clearErr(fST); fST.classList.remove('is-placeholder'); }
});

subBtn.addEventListener('click', function() {
  if (subBtn.classList.contains('disabled')) {
    if (!S.isForSelf && !fPN.value.trim()) showErr(fPN); else clearErr(fPN);
    if (!fST.value) showErr(fST); else clearErr(fST);
    return;
  }

  S.parentName = S.isForSelf ? S.studentName : fPN.value.trim();
  S.state = fST.value;

  submitLeadData({
    source: 'quiz_funnel',
    is_for_self: S.isForSelf,
    student_name: S.studentName,
    year_level: S.yearLevel,
    state: fST.value,
    subject: S.subject,
    situation: S.situation,
    current_grade: S.currentGrade,
    confidence: S.confidence,
    struggle_area: S.struggleArea,
    urgency: S.urgency,
    parent_name: S.parentName,
    email: S.email,
    phone: S.phone
  });

  // Show success state
  document.getElementById('formFinal').style.display = 'none';
  document.getElementById('successName').textContent = S.studentName;
  document.getElementById('successWrap').classList.add('active');
  progressFill.style.width = '100%';
  backBtn.style.visibility = 'hidden';
  launchConfetti();
  document.getElementById('tyLink').href = buildThankYouUrl();
});

// Enter key on final fields
fPN.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); subBtn.click(); }
});

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

// Header back button — skip thinking screen when going back
backBtn.addEventListener('click', function() {
  if (cur === 11) goTo(9);       // Skip thinking screen when going back from phone
  else if (cur > 0) goTo(cur - 1);
});

// Screen 0 -> 1
document.getElementById('startBtn').addEventListener('click', function() { goTo(1); });

// Screen 1: Who is this for? (auto-advance)
initCardScreen('s1', 'isForSelf', 2, function() {
  // Convert to boolean — initCardScreen stores the data-val string
  S.isForSelf = (S.isForSelf === 'self');
  personaliseForMode();
});

// Quiz card screens with auto-advance
initCardScreen('s4', 'situation', 5);
initCardScreen('s5', 'currentGrade', 6);
initCardScreen('s6', 'confidence', 7);
initCardScreen('s7', 'subject', 8, function() {
  populateStruggleCards(S.subject);
});
// s8 (struggle) is handled by initStruggleScreen() called from populateStruggleCards()
initCardScreen('s9', 'urgency', 10, function() {
  fireBackgroundPlanGeneration();
});
