// ═══════════════════════════════════════════════════════════════
// Tutero Quiz Funnel — Variant A (Lead Generation + Plan on TY Page)
// Screens: s0 Welcome | s1 Who | s2 Name | s3 Year | s4 Situation
//          s5 Grades | s6 Confidence | s7 Subject | s8 Mirror
//          s9 Struggle | s10 Urgency | s11 State | s12 Thinking
//          s13 Phone | s14 Email | s15 Name + Submit
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
// Screen Navigation (16 screens: s0-s15)
// ═══════════════════════════════════════════════════════════════
var TOTAL_SCREENS = 15;
var screens = [];
var cur = 0;
var header = document.getElementById('qzHeader');
var backBtn = document.getElementById('backBtn');
var progressFill = document.getElementById('progressFill');
var stepLabel = document.getElementById('stepLabel');
var PROGRESS = [0, 5, 11, 17, 23, 30, 37, 44, 48, 53, 58, 65, 72, 80, 87, 95];

function initScreens() {
  for (var i = 0; i <= TOTAL_SCREENS; i++) screens.push(document.getElementById('s' + i));
}

function updateChrome(n) {
  // Dark header on welcome + thinking screens
  if (n === 0 || n === 12) {
    header.classList.remove('light');
  } else {
    header.classList.add('light');
  }
  // Back button — hide on welcome and thinking screen
  backBtn.style.visibility = (n > 0 && n !== 12) ? 'visible' : 'hidden';
  // Progress bar
  progressFill.style.width = (PROGRESS[n] || 0) + '%';
  // Step text
  if (n >= 4 && n <= 7) stepLabel.textContent = (n - 3) + ' of 6';
  else if (n >= 9 && n <= 10) stepLabel.textContent = (n - 4) + ' of 6';
  else if (n >= 13 && n <= 15) stepLabel.textContent = 'Almost there';
  else stepLabel.textContent = '';
}

function goTo(n) {
  if (n === cur || n < 0 || n > TOTAL_SCREENS) return;
  var fwd = n > cur;
  var old = screens[cur];
  var next = screens[n];

  // Stop particle canvas when leaving thinking screen
  if (cur === 12) stopParticleCanvas();

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
  if (n === 8) {
    populateMirrorMoment();
  }
  if (n === 12) {
    runThinkingSequence();
  }
  if (n === 13) {
    setTimeout(function() { fPH.focus(); }, 450);
  }
  if (n === 14) {
    setTimeout(function() { fEM.focus(); }, 450);
  }
  if (n === 15 && !S.isForSelf) {
    setTimeout(function() { fPN.focus(); }, 450);
  }
}

function reanimate(el) {
  el.querySelectorAll('.qz-card, .qz-pill, .year-pill, .mirror-initial, .mirror-heading, .mirror-summary, .mirror-insight, .mirror-cta, .mirror-subtext').forEach(function(c) {
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
    document.getElementById('stateBadge').textContent = 'Your location';
    document.getElementById('stateHeading').textContent = 'Which state are you in?';
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
    document.getElementById('stateBadge').textContent = 'Their location';
    document.getElementById('stateHeading').textContent = 'Which state is your child in?';
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
    document.getElementById('stateHeading').textContent = 'Which state are you in?';
    document.getElementById('stateBadge').textContent = 'Your location';
  } else {
    document.getElementById('yearBadge').textContent = 'About ' + name;
    document.getElementById('yearHeading').textContent = 'What year level is ' + name + ' in?';
    document.getElementById('sitHeading').textContent = 'What best describes ' + name + ' right now?';
    document.getElementById('gradeHeading').textContent = 'How is ' + name + ' going in school right now?';
    document.getElementById('confHeading').textContent = 'How confident is ' + name + ' about learning?';
    document.getElementById('subjectHeading').textContent = 'What subject does ' + name + ' need most help with?';
    document.getElementById('urgencyHeading').textContent = 'When would you like ' + name + ' to start?';
    document.getElementById('stateHeading').textContent = 'Which state is ' + name + ' in?';
    document.getElementById('stateBadge').textContent = name + '\u2019s location';
  }
}

// ═══════════════════════════════════════════════════════════════
// Mirror Moment (s8) — Reflect back what we know
// ═══════════════════════════════════════════════════════════════
function populateMirrorMoment() {
  var name = S.studentName;
  var initial = name.charAt(0).toUpperCase();

  // Student initial
  document.getElementById('mirrorInitial').textContent = initial;

  // Headline — child vs self
  document.getElementById('mirrorHeading').textContent = S.isForSelf
    ? 'Got it, ' + name + '.'
    : 'Got it \u2014 this is for ' + name + '.';

  // Human-readable situation
  var sitMap = {
    'falling-behind': 'finding it tough',
    'keeping-up': 'keeping up',
    'get-ahead': 'aiming higher',
    'exam-prep': 'preparing for exams'
  };
  var sitText = sitMap[S.situation] || 'working on it';

  // Summary line
  document.getElementById('mirrorSummary').textContent =
    S.yearLevel + ' \u00B7 ' + S.subject + ' \u00B7 ' + sitText;

  // Insight card — adapts to situation
  var insights = {
    'falling-behind': 'Most ' + S.yearLevel + ' students who are finding it tough just haven\u2019t found the right teacher yet.',
    'keeping-up': S.yearLevel + ' is when the right teacher turns \u2018okay\u2019 into exceptional.',
    'get-ahead': 'The best students accelerate fastest with a teacher who truly challenges them.',
    'exam-prep': 'Exam results come down to strategy as much as knowledge \u2014 the right tutor gives you both.'
  };
  document.getElementById('mirrorInsight').textContent =
    insights[S.situation] || insights['keeping-up'];

  // CTA — child vs self
  document.getElementById('mirrorCta').innerHTML = S.isForSelf
    ? 'Help us find your teacher \u2192'
    : 'Help us find ' + escHtml(name) + '\u2019s teacher \u2192';
}

// ═══════════════════════════════════════════════════════════════
// Data Mapping — Thinking Screen Text Generation
// ═══════════════════════════════════════════════════════════════
function getStruggleLabel(val) {
  for (var subject in STRUGGLE_OPTIONS) {
    var opts = STRUGGLE_OPTIONS[subject];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].val === val) return opts[i].label.toLowerCase();
    }
  }
  return val ? val.replace(/-/g, ' ') : '';
}

function getConfidenceStyle(val) {
  var map = {
    'good': 'challenging and goal-oriented',
    'mixed': 'structured and patient',
    'low': 'patient and encouraging'
  };
  return map[val] || 'supportive and adaptive';
}

function getSituationGoal(val) {
  var map = {
    'falling-behind': 'catch up and build a strong foundation',
    'consistent-practice': 'build consistency and confidence',
    'get-ahead': 'accelerate and reach their potential',
    'exam-prep': 'achieve their best possible exam results'
  };
  return map[val] || 'reach their learning goals';
}

function getSituationDesc(val) {
  var map = {
    'falling-behind': 'students rebuilding their confidence',
    'consistent-practice': 'students building strong habits',
    'get-ahead': 'high-achieving students pushing further',
    'exam-prep': 'students in intensive exam preparation'
  };
  return map[val] || 'students with similar goals';
}

function getUrgencyText(val) {
  var map = {
    'asap': 'immediate',
    'this-term': 'this-term',
    'next-term': 'flexible'
  };
  return map[val] || 'flexible';
}

function getGradeReadable(val) {
  var map = {
    'above': 'above average \u2014 aiming higher',
    'average': 'about average \u2014 room to grow',
    'below': 'below expected \u2014 needs support'
  };
  return map[val] || val;
}

function getStateFullName(val) {
  var map = {
    'NSW': 'New South Wales',
    'VIC': 'Victoria',
    'QLD': 'Queensland',
    'SA': 'South Australia',
    'WA': 'Western Australia',
    'TAS': 'Tasmania',
    'NT': 'Northern Territory',
    'ACT': 'Australian Capital Territory'
  };
  return map[val] || val;
}

// ═══════════════════════════════════════════════════════════════
// Particle Canvas Background (s12 Thinking Screen)
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
    // Connections
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(120,90,220,' + (0.07 * (1 - dist / connectionDist)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    // Particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,160,255,0.15)';
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

// ═══════════════════════════════════════════════════════════════
// Thinking Screen (s12) — Deep Personalised Matching Animation
// ═══════════════════════════════════════════════════════════════
function buildThinkingPhases() {
  var namePos = S.isForSelf ? 'your' : S.studentName + '\u2019s';
  var nameSubject = S.isForSelf ? 'You' : S.studentName;
  var struggleLabel = getStruggleLabel(S.struggleArea);
  var showStruggle = S.struggleArea && S.struggleArea !== 'not-sure';

  return [
    {
      label: 'Understanding',
      duration: 5000,
      steps: [
        { text: 'Analysing ' + namePos + ' learning profile', icon: '\uD83E\uDDE0' },
        { text: S.yearLevel + ' ' + S.subject + ' \u2014 mapping curriculum requirements', icon: '\uD83D\uDCD8' },
        showStruggle
          ? { text: 'Noting focus area: ' + struggleLabel, icon: '\uD83C\uDFAF' }
          : null,
        { text: 'Current performance: ' + getGradeReadable(S.currentGrade), icon: '\uD83D\uDCCA' }
      ].filter(Boolean)
    },
    {
      label: 'Searching',
      duration: 6000,
      steps: [
        { text: 'Scanning 200+ verified tutors across Australia', icon: '\uD83D\uDD0D' },
        { text: 'Filtering for tutors in ' + getStateFullName(S.state), icon: '\uD83D\uDDFA\uFE0F' },
        { text: 'Matching ' + getUrgencyText(S.urgency) + ' availability windows', icon: '\uD83D\uDD52' },
        { text: 'Prioritising tutors experienced with ' + S.yearLevel + ' students', icon: '\u2B50' }
      ]
    },
    {
      label: 'Matching',
      duration: 6500,
      steps: [
        { text: 'Evaluating teaching style compatibility', icon: '\u2764\uFE0F' },
        { text: nameSubject + ' would benefit from someone ' + getConfidenceStyle(S.confidence), icon: '\u2728' },
        { text: 'Cross-referencing success rates for ' + getSituationDesc(S.situation), icon: '\uD83D\uDCC8' },
        { text: 'Considering ' + namePos + ' goal: ' + getSituationGoal(S.situation), icon: '\uD83C\uDFC1' }
      ]
    },
    {
      label: 'Building Plan',
      duration: 5000,
      steps: [
        { text: 'Designing a personalised ' + S.subject + ' pathway', icon: '\uD83D\uDEE4\uFE0F' },
        { text: 'Structuring progression for ' + S.yearLevel + ' curriculum', icon: '\uD83D\uDCDA' },
        { text: 'Preparing tutor recommendations for ' + nameSubject, icon: '\u2705' }
      ]
    }
  ];
}

function runThinkingSequence() {
  initParticleCanvas();

  var namePos = S.isForSelf ? 'your' : S.studentName + '\u2019s';
  var nameSubject = S.isForSelf ? 'you' : S.studentName;

  // Headline + subtitle
  document.getElementById('thinkingHeadline').textContent =
    'Finding the perfect tutor for ' + nameSubject;
  document.getElementById('thinkingSubtitle').textContent =
    S.yearLevel + ' ' + S.subject + ' \u00B7 ' + getStateFullName(S.state);

  // Completion card text
  document.getElementById('completeHeading').textContent =
    'We found great tutors for ' + nameSubject + '. Let\u2019s get you connected.';
  var ctaBtn = document.getElementById('thinkingCta');
  ctaBtn.textContent = 'See ' + namePos + ' matches \u2192';

  // Build phases
  var phases = buildThinkingPhases();
  var feed = document.getElementById('thinkingFeed');
  feed.innerHTML = '';

  // Progress ring setup
  var circumference = 2 * Math.PI * 52; // ~326.73
  var ring = document.getElementById('progressRingFg');
  var pctEl = document.getElementById('progressPct');
  var phaseEl = document.getElementById('phaseLabel');
  var complete = document.getElementById('thinkingComplete');
  complete.classList.remove('visible');
  ring.style.strokeDashoffset = circumference;
  pctEl.textContent = '0%';

  // Flatten steps with timing
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
  var thinkingTimeouts = [];

  function updateProgress(fraction) {
    var clamped = Math.min(Math.max(fraction, 0), 1);
    ring.style.strokeDashoffset = circumference * (1 - clamped);
    pctEl.textContent = Math.round(clamped * 100) + '%';
  }

  function runStep(index) {
    if (index >= allSteps.length) {
      // All done — completion
      updateProgress(1);
      phaseEl.textContent = 'All done!';
      // Mark last step as done
      if (stepEls.length > 0) {
        var last = stepEls[stepEls.length - 1];
        last.classList.remove('active');
        last.classList.add('done');
        var lastStatus = last.querySelector('.tf-step-status');
        if (lastStatus) lastStatus.innerHTML = '\u2713';
      }
      thinkingTimeouts.push(setTimeout(function() {
        complete.classList.add('visible');
      }, 800));
      return;
    }

    var step = allSteps[index];
    phaseEl.textContent = step.phaseLabel;

    // Mark previous step as done
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

    // Fade in
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

    // Update progress
    elapsed += step.delay;
    updateProgress(elapsed / totalTime);

    // Next step
    thinkingTimeouts.push(setTimeout(function() { runStep(index + 1); }, step.delay));
  }

  // Calculate tutor count
  var range = TUTOR_COUNTS[S.subject] || TUTOR_COUNTS['Other'];
  S.tutorCount = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));

  // Begin sequence after short delay
  updateProgress(0);
  thinkingTimeouts.push(setTimeout(function() { runStep(0); }, 600));

  // Store timeouts for cleanup
  window._thinkingTimeouts = thinkingTimeouts;
}

// ═══════════════════════════════════════════════════════════════
// Contact Screen Personalisation (s13 Phone, s14 Email, s15 Final)
// ═══════════════════════════════════════════════════════════════
function personaliseContactScreens() {
  var name = S.isForSelf ? 'you' : S.studentName;
  var namePos = S.isForSelf ? 'your' : S.studentName + '\u2019s';
  var NamePos = S.isForSelf ? 'Your' : S.studentName + '\u2019s';

  // Results banner text (same on all 3 screens)
  var bannerText = 'We\u2019ve found ' + S.yearLevel + ' ' + S.subject +
    ' tutors for ' + name + ' in ' + getStateFullName(S.state);
  ['13','14','15'].forEach(function(n) {
    var el = document.getElementById('resultsBannerText' + n);
    if (el) el.textContent = bannerText;
  });

  // Screen 13 — Phone
  document.getElementById('phoneSub').textContent = S.isForSelf
    ? 'What\u2019s the best number to reach you on?'
    : 'What\u2019s the best number to reach you about ' + S.studentName + '\u2019s tutors?';
  document.getElementById('phoneHint').style.display = 'none';

  // Screen 14 — Email
  document.getElementById('emailSub').textContent = S.isForSelf
    ? 'Drop your email and we\u2019ll send your learning plan straight over.'
    : 'Drop your email and we\u2019ll send ' + S.studentName + '\u2019s learning plan straight over.';
  document.getElementById('emailHint').style.display = 'none';

  // Screen 15 — Name + Submit
  if (S.isForSelf) {
    document.getElementById('parentNameWrap').style.display = 'none';
    document.getElementById('finalHeading').textContent = 'You\u2019re all set';
    document.getElementById('finalSub').textContent =
      'Hit the button below to see your matched tutors and learning plan.';
    document.getElementById('finalHint').style.display = 'none';
    document.getElementById('submitBtn').textContent = 'Show me my plan \u2192';
    // Enable button immediately for self mode (no fields)
    toggleBtn(document.getElementById('submitBtn'), true);
  } else {
    document.getElementById('parentNameWrap').style.display = '';
    document.getElementById('finalHeading').textContent = 'Last step';
    document.getElementById('finalSub').textContent =
      'Just your name so ' + S.studentName + '\u2019s tutor can say hi properly.';
    document.getElementById('finalHint').style.display = 'none';
    document.getElementById('submitBtn').innerHTML =
      'Show me ' + escHtml(S.studentName) + '\u2019s plan \u2192';
  }
}

// ═══════════════════════════════════════════════════════════════
// Background Plan Generation (fires when state screen advances)
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
      setTimeout(function() { goTo(10); }, 320);
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
// Screen 13: Phone (Continue to Screen 14)
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
  goTo(14);
});

fPH.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); phoneBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// Screen 14: Email (Continue to Screen 15)
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
  goTo(15);
});

fEM.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); emailBtn.click(); }
});

// ═══════════════════════════════════════════════════════════════
// Screen 15: Parent Name (or direct submit for self) + Submit
// ═══════════════════════════════════════════════════════════════
var fPN = document.getElementById('fParentName');
var subBtn = document.getElementById('submitBtn');

function checkFinal() {
  if (S.isForSelf) {
    // Self mode: no fields needed, button always enabled
    toggleBtn(subBtn, true);
  } else {
    toggleBtn(subBtn, !!fPN.value.trim());
  }
}

fPN.addEventListener('input', function() {
  checkFinal();
  if (fPN.value.trim()) clearErr(fPN);
});

subBtn.addEventListener('click', function() {
  if (subBtn.classList.contains('disabled')) {
    if (!S.isForSelf && !fPN.value.trim()) showErr(fPN); else clearErr(fPN);
    return;
  }

  S.parentName = S.isForSelf ? S.studentName : fPN.value.trim();

  submitLeadData({
    source: 'quiz_funnel',
    is_for_self: S.isForSelf,
    student_name: S.studentName,
    year_level: S.yearLevel,
    state: S.state,
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

// Header back button — skip thinking + state when going back, skip mirror from struggle
backBtn.addEventListener('click', function() {
  if (cur === 13) goTo(10);        // Skip thinking + state when going back from phone
  else if (cur === 9) goTo(7);     // Skip mirror when going back from struggle
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
// s9 (struggle) is handled by initStruggleScreen() called from populateStruggleCards()
initCardScreen('s10', 'urgency', 11);

// Screen 11: State selection (auto-advance to thinking screen)
initCardScreen('s11', 'state', 12, function() {
  fireBackgroundPlanGeneration();
});

// Thinking screen CTA button
document.getElementById('thinkingCta').addEventListener('click', function() {
  personaliseContactScreens();
  goTo(13);
});

// Mirror moment CTA button
document.getElementById('mirrorCta').addEventListener('click', function() {
  goTo(9);
});
