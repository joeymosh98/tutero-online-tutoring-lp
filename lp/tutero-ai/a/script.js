// ═══════════════════════════════════════════════════════════════
// Tutero AI — Teacher Onboarding Funnel (9 Screens: S0–S8)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════
var S = {
  resourceType: '',
  subject: '',
  yearLevel: '',
  topic: '',
  curriculumFramework: '',
  curriculumCodes: [],
  theme: '',
  teacherName: '',
  email: '',
  school: ''
};

// ═══════════════════════════════════════════════════════════════
// Screen Navigation (9 screens: S0–S8)
// ═══════════════════════════════════════════════════════════════
var screens = [];
var cur = 0;
var header = document.getElementById('qzHeader');
var backBtn = document.getElementById('backBtn');
var progressFill = document.getElementById('progressFill');
var stepLabel = document.getElementById('stepLabel');
var PROGRESS = [0, 12, 24, 36, 48, 60, 72, 84, 96];

function initScreens() {
  for (var i = 0; i <= 8; i++) screens.push(document.getElementById('s' + i));
}

function updateChrome(n) {
  if (n === 0) header.classList.remove('light');
  else header.classList.add('light');
  // Hide back on welcome (0), generation (7)
  backBtn.style.visibility = (n > 0 && n !== 7) ? 'visible' : 'hidden';
  progressFill.style.width = (PROGRESS[n] || 0) + '%';
  if (n >= 1 && n <= 2) stepLabel.textContent = n + ' of 5';
  else if (n === 3) stepLabel.textContent = 'Curriculum';
  else if (n >= 4 && n <= 5) stepLabel.textContent = n + ' of 5';
  else if (n === 6) stepLabel.textContent = 'Theme';
  else if (n === 7) stepLabel.textContent = 'Generating';
  else if (n === 8) stepLabel.textContent = 'Almost done';
  else stepLabel.textContent = '';
}

function goTo(n) {
  if (n === cur || n < 0 || n > 8) return;
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

  // Start placeholder animation when arriving at topic screen (S5)
  if (n === 5 && !topicInput.value.length) {
    phCharIdx = 0; phDirection = 1;
    setTimeout(animatePlaceholder, 400);
  }
}

function reanimate(el) {
  el.querySelectorAll('.qz-card, .qz-pill, .custom-pill, .theme-card, .cur-picker-card').forEach(function(c) {
    c.style.animation = 'none';
    c.offsetHeight;
    c.style.animation = '';
  });
}

// ═══════════════════════════════════════════════════════════════
// Card / Pill Selection (Auto-advance)
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
// Subject-Specific Placeholders (Typewriter cycling)
// ═══════════════════════════════════════════════════════════════
var SUBJECT_PLACEHOLDERS = {
  'Maths': [
    'Solving two-step linear equations...',
    'Fractions, decimals and percentages...',
    'Area and perimeter of shapes...',
    'Introduction to algebra...'
  ],
  'English': [
    'Persuasive writing techniques...',
    'Analysing Shakespeare\'s Macbeth...',
    'Narrative writing: building tension...',
    'Reading comprehension strategies...'
  ],
  'Science': [
    'The water cycle and evaporation...',
    'Photosynthesis and plant biology...',
    'Forces and motion...',
    'Chemical reactions...'
  ],
  'History': [
    'World War II: causes and key events...',
    'Ancient Egypt civilisation...',
    'The Gold Rush in Australia...',
    'Industrial Revolution impacts...'
  ],
  'Geography': [
    'Natural disasters and their causes...',
    'Urbanisation and city planning...',
    'Climate zones around the world...',
    'Water resources and sustainability...'
  ],
  'HASS': [
    'Rights and responsibilities of citizens...',
    'Sustainability and environmental stewardship...',
    'Diverse communities and cultures...',
    'Government and democracy...'
  ],
  'The Arts': [
    'Elements of visual art: line, shape, colour...',
    'Music composition: rhythm and melody...',
    'Drama: exploring character and role...',
    'Dance: movement and choreography...'
  ],
  'default': [
    'Solving two-step linear equations...',
    'Introduction to persuasive writing techniques...',
    'The water cycle and evaporation...',
    'World War II: causes and key events...',
    'Fractions, decimals and percentages...',
    'Photosynthesis and plant biology...'
  ]
};

var placeholders = SUBJECT_PLACEHOLDERS['default'];
var phIdx = 0;
var phCharIdx = 0;
var phDirection = 1;
var phTimer = null;
var topicInput = document.getElementById('topicInput');

function animatePlaceholder() {
  if (document.activeElement === topicInput || topicInput.value.length > 0) return;
  var text = placeholders[phIdx];
  if (phDirection === 1) {
    phCharIdx++;
    if (phCharIdx > text.length) {
      phDirection = 0;
      phTimer = setTimeout(function() { phDirection = -1; animatePlaceholder(); }, 1800);
      return;
    }
  } else if (phDirection === -1) {
    phCharIdx--;
    if (phCharIdx < 0) {
      phCharIdx = 0;
      phIdx = (phIdx + 1) % placeholders.length;
      phDirection = 1;
    }
  }
  topicInput.setAttribute('placeholder', text.slice(0, phCharIdx));
  var speed = phDirection === 1 ? 45 : 25;
  phTimer = setTimeout(animatePlaceholder, speed);
}

topicInput.addEventListener('focus', function() {
  if (phTimer) clearTimeout(phTimer);
  topicInput.setAttribute('placeholder', 'Describe the topic or concept...');
});
topicInput.addEventListener('blur', function() {
  if (!topicInput.value.length) {
    phCharIdx = 0; phDirection = 1;
    phTimer = setTimeout(animatePlaceholder, 600);
  }
});

// ═══════════════════════════════════════════════════════════════
// Dynamic Topic Suggestions (keyed by resource type + year bucket + subject)
// ═══════════════════════════════════════════════════════════════
var TOPIC_SUGGESTIONS = {
  'Lesson Plan': {
    primary: {
      'Maths': ['Introduction to fractions using visual models', 'Times tables strategies for 6, 7, 8', 'Place value: hundreds, tens and ones', 'Measuring length in centimetres and metres'],
      'English': ['Persuasive writing: structuring an argument', 'Reading comprehension: finding the main idea', 'Narrative writing: character development', 'How-to writing: procedural texts'],
      'Science': ['The life cycle of a butterfly', 'Australian animals and their habitats', 'States of matter: solids, liquids, gases', 'The water cycle and evaporation'],
      'History': ['Australian Indigenous history and culture', 'First Fleet and early settlement', 'Famous Australians and their contributions', 'Community celebrations past and present'],
      'Geography': ['Maps and directions: reading grid references', 'Australian landscapes and natural features', 'Weather patterns and seasons', 'Where people live and why'],
      'default': ['Introduction to fractions using visual models', 'Persuasive writing: structuring an argument', 'The life cycle of a butterfly', 'Australian Indigenous history and culture']
    },
    secondary: {
      'Maths': ['Solving simultaneous equations algebraically', 'Trigonometry: sin, cos, tan', 'Probability and statistics: data analysis', 'Linear and quadratic functions'],
      'English': ['Analysing Shakespeare\'s use of dramatic irony', 'Essay writing: thesis and evidence', 'Analysing language features in media texts', 'Comparative text study'],
      'Science': ['Rates of chemical reactions and catalysts', 'Evolution by natural selection', 'Forces and motion: Newton\'s laws', 'Electricity and circuits'],
      'History': ['The causes and consequences of World War I', 'The Cold War: key events and impacts', 'Civil rights movements globally', 'Industrial Revolution and social change'],
      'Geography': ['Urbanisation and city planning', 'Climate change: causes and responses', 'Natural disasters and risk management', 'Globalisation and interconnection'],
      'default': ['Solving simultaneous equations algebraically', 'Analysing Shakespeare\'s use of dramatic irony', 'Rates of chemical reactions and catalysts', 'The causes and consequences of World War I']
    }
  },
  'Worksheet': {
    primary: {
      'Maths': ['Times tables practice (6, 7, 8)', 'Place value: hundreds, tens and ones', 'Addition and subtraction word problems', 'Telling time to the quarter hour'],
      'English': ['Reading comprehension: finding the main idea', 'Spelling patterns: vowel digraphs', 'Sentence types: statements and questions', 'Handwriting practice: cursive letters'],
      'Science': ['Australian animals and their habitats', 'Parts of a plant labelling', 'Day and night: Earth\'s rotation', 'Forces: push and pull'],
      'History': ['Community changes over time', 'Timeline activity: key events', 'Famous Australians matching', 'Then and now: comparing past and present'],
      'Geography': ['Map skills: compass directions', 'Natural vs human features', 'Where does our food come from?', 'Weather observation diary'],
      'default': ['Times tables practice (6, 7, 8)', 'Reading comprehension: finding the main idea', 'Australian animals and their habitats', 'Place value: hundreds, tens and ones']
    },
    secondary: {
      'Maths': ['Expanding and simplifying algebraic expressions', 'Pythagoras\' theorem problems', 'Percentage increase and decrease', 'Graphing linear equations'],
      'English': ['Analysing language features in media texts', 'Vocabulary in context exercises', 'Grammar: complex and compound sentences', 'Persuasive techniques identification'],
      'Science': ['Balancing chemical equations practice', 'Genetics: Punnett squares', 'Energy transformations worksheet', 'Cell structure and function'],
      'History': ['Source analysis: primary vs secondary sources', 'Timeline: key events of World War II', 'Cause and effect: Industrial Revolution', 'Historical empathy activity'],
      'Geography': ['Population data analysis', 'Climate graph interpretation', 'Map skills: topographic maps', 'Sustainability case study'],
      'default': ['Expanding and simplifying algebraic expressions', 'Analysing language features in media texts', 'Balancing chemical equations practice', 'Source analysis: primary vs secondary sources']
    }
  },
  'Assessment': {
    primary: {
      'Maths': ['End of unit: addition and subtraction strategies', 'Multiplication facts quiz', 'Fractions and decimals test', 'Measurement and geometry assessment'],
      'English': ['Narrative writing assessment task', 'Reading comprehension test', 'Spelling and grammar quiz', 'Oral presentation rubric'],
      'Science': ['Science quiz: states of matter', 'Living things classification test', 'Earth and space assessment', 'Investigating scientifically: skills test'],
      'History': ['History quiz: early settlement', 'Source analysis assessment', 'Timeline sequencing test', 'Community history project'],
      'Geography': ['Geography: maps and directions test', 'Place and space assessment', 'Environment sustainability quiz', 'Fieldwork investigation task'],
      'default': ['End of unit: addition and subtraction strategies', 'Narrative writing assessment task', 'Science quiz: states of matter', 'Geography: maps and directions test']
    },
    secondary: {
      'Maths': ['Trigonometry unit test: sin, cos, tan', 'Algebra exam: equations and inequalities', 'Statistics and probability assessment', 'Functions and graphs test'],
      'English': ['Essay exam: themes in To Kill a Mockingbird', 'Persuasive writing assessment', 'Language analysis under timed conditions', 'Comparative text response'],
      'Science': ['Chemistry assessment: atomic structure', 'Biology test: ecosystems and biodiversity', 'Physics exam: forces and energy', 'Scientific investigation report'],
      'History': ['Modern history source-based assessment', 'Essay: causes of World War I', 'Document analysis exam', 'Historical investigation task'],
      'Geography': ['Fieldwork report assessment', 'Climate and environment exam', 'Geographical investigation', 'Urbanisation case study test'],
      'default': ['Trigonometry unit test: sin, cos, tan', 'Essay exam: themes in To Kill a Mockingbird', 'Chemistry assessment: atomic structure', 'Modern history source-based assessment']
    }
  },
  'Document': {
    primary: {
      'Maths': ['Study guide: multiplication strategies', 'Reference sheet: 2D and 3D shapes', 'Quick notes: place value chart', 'Formula cheat sheet for measurement'],
      'English': ['How-to guide: writing a recount', 'Reference sheet: parts of speech', 'Vocabulary list: descriptive words', 'Writing checklist for narratives'],
      'Science': ['Quick notes: the solar system', 'Study guide: living things', 'Reference sheet: science safety rules', 'Diagram: the water cycle'],
      'History': ['Timeline: Australian history milestones', 'Study guide: First Peoples of Australia', 'Key terms glossary: colonial era', 'Famous Australians fact cards'],
      'Geography': ['Reference sheet: map symbols', 'Study guide: Australian landforms', 'Quick notes: natural resources', 'Glossary: geographical vocabulary'],
      'default': ['Study guide: multiplication strategies', 'How-to guide: writing a recount', 'Reference sheet: parts of speech', 'Quick notes: the solar system']
    },
    secondary: {
      'Maths': ['Study guide: quadratic equations', 'Formula sheet: trigonometry', 'Quick reference: index laws', 'Worked examples: simultaneous equations'],
      'English': ['Essay writing scaffold and checklist', 'Language features glossary', 'Text response structure guide', 'Literary techniques reference sheet'],
      'Science': ['Periodic table reference with key properties', 'Study guide: chemical bonding', 'Lab report template', 'Biology glossary: key terms'],
      'History': ['Timeline: key events of the Cold War', 'Study guide: World War II', 'Source analysis framework', 'Historical essay structure guide'],
      'Geography': ['Study guide: climate zones', 'Data interpretation cheat sheet', 'Fieldwork methodology guide', 'Geographic inquiry framework'],
      'default': ['Study guide: quadratic equations', 'Essay writing scaffold and checklist', 'Periodic table reference with key properties', 'Timeline: key events of the Cold War']
    }
  }
};

function getYearBucket() {
  var y = S.yearLevel;
  if (!y || y === 'Foundation') return 'primary';
  var match = y.match(/\d+/);
  if (!match) return 'primary';
  return parseInt(match[0]) <= 6 ? 'primary' : 'secondary';
}

function updateTopicSuggestions() {
  var container = document.getElementById('topicSuggestions');
  var type = S.resourceType || 'Lesson Plan';
  var bucket = getYearBucket();
  var typeData = TOPIC_SUGGESTIONS[type] || TOPIC_SUGGESTIONS['Lesson Plan'];
  var bucketData = typeData[bucket] || typeData['primary'];
  var suggestions = bucketData[S.subject] || bucketData['default'] || bucketData['Maths'];

  // Fade out, swap, fade in
  container.classList.add('updating');
  setTimeout(function() {
    container.innerHTML = '';
    suggestions.forEach(function(text) {
      var btn = document.createElement('button');
      btn.className = 'topic-chip';
      btn.dataset.topic = text;
      btn.textContent = text;
      btn.addEventListener('click', function() {
        topicInput.value = text;
        topicCount.textContent = topicInput.value.length;
        toggleBtn(topicBtn, true);
        topicInput.focus();
      });
      container.appendChild(btn);
    });
    container.classList.remove('updating');
  }, 200);
}

// ═══════════════════════════════════════════════════════════════
// Topic Input Handling
// ═══════════════════════════════════════════════════════════════
var topicBtn = document.getElementById('topicBtn');
var topicCount = document.getElementById('topicCount');

topicInput.addEventListener('input', function() {
  topicCount.textContent = topicInput.value.length;
  toggleBtn(topicBtn, topicInput.value.trim().length >= 3);
});

// Initial topic suggestion chips (static fallback, replaced dynamically)
document.querySelectorAll('.topic-chip').forEach(function(chip) {
  chip.addEventListener('click', function() {
    topicInput.value = chip.dataset.topic;
    topicCount.textContent = topicInput.value.length;
    toggleBtn(topicBtn, true);
    topicInput.focus();
  });
});

topicBtn.addEventListener('click', function() {
  if (topicBtn.classList.contains('disabled')) return;
  S.topic = topicInput.value.trim();
  personaliseS6();
  goTo(6);
});

topicInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    topicBtn.click();
  }
});

// ═══════════════════════════════════════════════════════════════
// Curriculum Code Selector
// ═══════════════════════════════════════════════════════════════
var CURRICULUM_DATA = {
  ac: [
    { code: 'ACMNA123', desc: 'Solve problems involving addition and subtraction of fractions' },
    { code: 'ACMNA152', desc: 'Investigate and calculate "best buys" with or without digital technologies' },
    { code: 'ACMNA179', desc: 'Solve problems involving direct proportion' },
    { code: 'ACMNA215', desc: 'Apply index laws to numerical expressions with integer indices' },
    { code: 'ACMNA241', desc: 'Solve problems involving linear equations' },
    { code: 'ACMNA270', desc: 'Factorise algebraic expressions by identifying numerical factors' },
    { code: 'ACMSP169', desc: 'Identify and investigate issues involving numerical data' },
    { code: 'ACMSP284', desc: 'Calculate mean, median, mode and range for sets of data' },
    { code: 'ACSSU043', desc: 'Science understanding: Earth and space sciences' },
    { code: 'ACSSU044', desc: 'Living things have structural features and adaptations' },
    { code: 'ACSSU176', desc: 'Chemical change involves substances reacting to form new substances' },
    { code: 'ACSSU186', desc: 'Energy conservation in a system' },
    { code: 'ACSSU190', desc: 'The theory of evolution by natural selection' },
    { code: 'ACELY1721', desc: 'Plan, draft and publish imaginative, informative and persuasive texts' },
    { code: 'ACELY1756', desc: 'Analyse and evaluate the ways that text structures and language features vary' },
    { code: 'ACELA1564', desc: 'Understand how modality is achieved through discriminating choices in modal verbs' },
    { code: 'ACHHS170', desc: 'Use chronological sequencing to demonstrate the relationship between events' },
    { code: 'ACHHS171', desc: 'Use historical terms and concepts' },
    { code: 'ACHHS205', desc: 'Identify and locate relevant sources using ICT and other methods' },
    { code: 'ACHGS048', desc: 'Develop geographical questions to investigate and plan an inquiry' }
  ],
  cc: [
    { code: 'CCSS.MATH.6.EE.A.2', desc: 'Write, read, and evaluate expressions in which letters stand for numbers' },
    { code: 'CCSS.MATH.7.RP.A.1', desc: 'Compute unit rates associated with ratios of fractions' },
    { code: 'CCSS.MATH.8.EE.C.7', desc: 'Solve linear equations in one variable' },
    { code: 'CCSS.ELA.W.6.1', desc: 'Write arguments to support claims with clear reasons and relevant evidence' },
    { code: 'CCSS.ELA.RI.8.2', desc: 'Determine a central idea of a text and analyze its development' },
    { code: 'NGSS.MS-LS1-5', desc: 'Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms' },
    { code: 'NGSS.MS-PS1-2', desc: 'Analyze and interpret data on the properties of substances before and after interactions' }
  ],
  ib: [
    { code: 'MYP.MATH.4.1', desc: 'Algebra: Solve linear equations and inequalities' },
    { code: 'MYP.LANG.3.2', desc: 'Producing text: Organise opinions and ideas in a sustained, coherent way' },
    { code: 'MYP.SCI.4.3', desc: 'Processing and evaluating: Interpret data and outline results using scientific reasoning' }
  ],
  uk: [
    { code: 'KS3.MA.A.1', desc: 'Use and interpret algebraic notation' },
    { code: 'KS3.EN.W.1', desc: 'Write accurately, fluently, effectively and at length for pleasure and information' },
    { code: 'KS3.SC.B.1', desc: 'Structure and function of living organisms: cells and organisation' }
  ],
  nz: [
    { code: 'NZC.MA.L4.NA', desc: 'Number and Algebra: Use a range of multiplicative strategies' },
    { code: 'NZC.EN.L4.W', desc: 'Writing: Integrate sources of information, processes, and strategies purposefully' },
    { code: 'NZC.SC.L4.LW', desc: 'Living World: Recognise that there are life processes common to all living things' }
  ]
};

var RECOMMENDED_CODES = {
  'Maths': {
    primary: ['ACMNA123', 'ACMNA152', 'ACMNA179'],
    secondary: ['ACMNA215', 'ACMNA241', 'ACMNA270', 'ACMSP284']
  },
  'English': {
    primary: ['ACELY1721'],
    secondary: ['ACELY1721', 'ACELY1756', 'ACELA1564']
  },
  'Science': {
    primary: ['ACSSU043', 'ACSSU044'],
    secondary: ['ACSSU176', 'ACSSU186', 'ACSSU190']
  },
  'History': {
    primary: ['ACHHS170'],
    secondary: ['ACHHS170', 'ACHHS171', 'ACHHS205']
  },
  'Geography': {
    primary: ['ACHGS048'],
    secondary: ['ACHGS048']
  }
};

function preSelectRecommendedCodes() {
  var bucket = getYearBucket();
  var recs = (RECOMMENDED_CODES[S.subject] || {})[bucket] || [];
  S.curriculumCodes = recs.slice();
}

// ═══════════════════════════════════════════════════════════════
// Curriculum Picker (S5 simplified)
// ═══════════════════════════════════════════════════════════════
var curPickerBtn = document.getElementById('curPickerBtn');
var curPickerSkip = document.getElementById('curPickerSkip');

document.querySelectorAll('.cur-picker-card').forEach(function(card) {
  card.addEventListener('click', function() {
    document.querySelectorAll('.cur-picker-card').forEach(function(c) {
      c.classList.remove('selected');
    });
    card.classList.add('selected');
    S.curriculumFramework = card.dataset.fw;
    preSelectRecommendedCodes();
    toggleBtn(curPickerBtn, true);
  });
});

curPickerBtn.addEventListener('click', function() {
  if (curPickerBtn.classList.contains('disabled')) return;
  personaliseS4();
  goTo(4);
});

curPickerSkip.addEventListener('click', function() {
  S.curriculumCodes = [];
  S.curriculumFramework = '';
  personaliseS4();
  goTo(4);
});

// ═══════════════════════════════════════════════════════════════
// Deep Personalisation Functions
// ═══════════════════════════════════════════════════════════════
function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '\u2026' : str;
}

function personaliseS2() {
  document.getElementById('s2Badge').textContent = 'About your ' + S.resourceType;
  document.getElementById('subjectHeading').innerHTML = 'What subject is this<br>' + S.resourceType + ' for?';
}

// ── Year Level Data (per curriculum) ──
var YEAR_LEVELS = {
  ac: ['Foundation', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Multi-year'],
  cc: ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Multi-grade'],
  ib: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Multi-year'],
  uk: ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Multi-year'],
  nz: ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Multi-year']
};

function renderYearLevels(framework) {
  var grid = document.getElementById('yearPillGrid');
  var levels = YEAR_LEVELS[framework] || YEAR_LEVELS.ac;
  grid.innerHTML = '';
  levels.forEach(function(level, i) {
    var btn = document.createElement('button');
    btn.className = 'qz-pill';
    btn.dataset.val = level;
    btn.textContent = level;
    btn.style.animationDelay = (i * 0.03) + 's';
    grid.appendChild(btn);
  });
}

function getLocalSubject(subject, framework) {
  if (framework === 'cc') {
    if (subject === 'Maths') return 'Math';
    if (subject === 'English') return 'ELA';
    if (subject === 'HASS') return 'Social Studies';
    if (subject === 'The Arts') return 'Arts';
  }
  return subject;
}

function personaliseS3() {
  // Reset curriculum picker state
  S.curriculumCodes = [];
  S.curriculumFramework = '';
  document.querySelectorAll('.cur-picker-card').forEach(function(c) {
    c.classList.remove('selected');
  });
  toggleBtn(curPickerBtn, false);
}

function personaliseS4() {
  var fw = S.curriculumFramework;
  var localSubject = getLocalSubject(S.subject, fw);
  var isGrade = (fw === 'cc');
  var levelWord = isGrade ? 'grade' : 'year level';
  document.getElementById('s4Badge').textContent = 'About your ' + localSubject + ' ' + S.resourceType;
  document.getElementById('yearHeading').innerHTML = 'What <strong>' + levelWord + '</strong> is this<br>' + localSubject + ' ' + S.resourceType + ' for?';
  renderYearLevels(fw);
}

function personaliseS5() {
  var fw = S.curriculumFramework;
  var localSubject = getLocalSubject(S.subject, fw);
  document.getElementById('s5Badge').textContent = 'About your ' + S.yearLevel + ' ' + localSubject + ' ' + S.resourceType;
  document.getElementById('topicHeading').innerHTML = 'Describe your <strong>' + S.yearLevel + ' ' + localSubject + '</strong><br>topic';
}

function personaliseS6() {
  document.getElementById('p6Type').textContent = S.resourceType;
  document.getElementById('p6Subject').textContent = S.subject;
  document.getElementById('p6Year').textContent = S.yearLevel;
  var topicShort = S.topic.length > 25 ? S.topic.slice(0, 25) + '\u2026' : S.topic;
  document.getElementById('p6Topic').textContent = topicShort;
  document.getElementById('themeType').textContent = S.resourceType;
  document.getElementById('themeBtnType').textContent = S.resourceType;
}

function personaliseS7() {
  document.getElementById('genHeading').textContent = 'Creating your ' + S.subject + ' ' + S.resourceType + '...';
  document.getElementById('genStep1Text').textContent = 'Structuring your ' + S.resourceType.toLowerCase();
  document.getElementById('genCompleteH').textContent = 'Your ' + S.resourceType + ' is ready!';
  document.getElementById('overlayTitle').textContent = 'Creating your ' + S.resourceType.toLowerCase() + '...';
}

// ═══════════════════════════════════════════════════════════════
// Theme Engine (S6)
// ═══════════════════════════════════════════════════════════════
var THEMES = {
  basketball: {
    id: 'basketball', name: 'Basketball', emoji: '\uD83C\uDFC0',
    bg: '#FFF5EB', card: '#ffffff', accent: '#E85D04', accentHover: '#CC4D00',
    accentLight: 'rgba(232,93,4,0.08)', border: '#F4A261', text: '#2B2D2F',
    textSub: '#6D5D4B', docBg: '#FFF0E0', btnText: '#ffffff'
  },
  soccer: {
    id: 'soccer', name: 'Soccer', emoji: '\u26BD',
    bg: '#F0F5EB', card: '#ffffff', accent: '#2D8B4E', accentHover: '#236E3D',
    accentLight: 'rgba(45,139,78,0.08)', border: '#A8D5BA', text: '#1A1A1A',
    textSub: '#4A7C52', docBg: '#EBF5E6', btnText: '#ffffff'
  },
  dancing: {
    id: 'dancing', name: 'Dancing', emoji: '\uD83D\uDC83',
    bg: '#FCE4FF', card: '#ffffff', accent: '#9B2FD0', accentHover: '#7B22A8',
    accentLight: 'rgba(155,47,208,0.08)', border: '#E1BEE7', text: '#2E0A3A',
    textSub: '#7B4A8E', docBg: '#F8E8FC', btnText: '#ffffff'
  },
  music: {
    id: 'music', name: 'Music', emoji: '\uD83C\uDFB5',
    bg: '#E8EAF6', card: '#ffffff', accent: '#1A237E', accentHover: '#0D1557',
    accentLight: 'rgba(26,35,126,0.08)', border: '#C5CAE9', text: '#1A1A2E',
    textSub: '#5C5C8A', docBg: '#E0E3F5', btnText: '#ffffff'
  },
  surfing: {
    id: 'surfing', name: 'Surfing', emoji: '\uD83C\uDFC4',
    bg: '#E0F7FA', card: '#ffffff', accent: '#00ACC1', accentHover: '#00838F',
    accentLight: 'rgba(0,172,193,0.08)', border: '#B2EBF2', text: '#0A3D44',
    textSub: '#4A8A90', docBg: '#E0F4F4', btnText: '#ffffff'
  },
  gaming: {
    id: 'gaming', name: 'Gaming', emoji: '\uD83C\uDFAE',
    bg: '#0D0D1A', card: '#1B1B2F', accent: '#00E676', accentHover: '#00C853',
    accentLight: 'rgba(0,230,118,0.12)', border: '#2A2A4A', text: '#E0E0E0',
    textSub: '#8A8AAF', docBg: '#121225', btnText: '#0D0D1A'
  }
};

function applyTheme(themeId) {
  var theme = THEMES[themeId];
  if (!theme) return;
  S.theme = themeId;
  var r = document.documentElement.style;
  r.setProperty('--theme-bg', theme.bg);
  r.setProperty('--theme-card', theme.card);
  r.setProperty('--theme-accent', theme.accent);
  r.setProperty('--theme-accent-hover', theme.accentHover);
  r.setProperty('--theme-accent-light', theme.accentLight);
  r.setProperty('--theme-border', theme.border);
  r.setProperty('--theme-text', theme.text);
  r.setProperty('--theme-text-sub', theme.textSub);
  r.setProperty('--theme-doc-bg', theme.docBg);
  r.setProperty('--theme-btn-text', theme.btnText);
}

// Theme card click handlers
var themeCards = document.querySelectorAll('.theme-card');
themeCards.forEach(function(card) {
  card.addEventListener('click', function() {
    themeCards.forEach(function(c) { c.classList.remove('selected'); });
    card.classList.add('selected');
    applyTheme(card.dataset.theme);
  });
});

// Theme CTA buttons
document.getElementById('themeBtn').addEventListener('click', function() {
  personaliseS7();
  resetGeneration();
  goTo(7);
  startGeneration();
});

document.getElementById('themeSkip').addEventListener('click', function() {
  S.theme = '';
  personaliseS7();
  resetGeneration();
  goTo(7);
  startGeneration();
});

// ═══════════════════════════════════════════════════════════════
// Generation Animation (S7)
// ═══════════════════════════════════════════════════════════════
var GEN_STEP_DELAYS = [1200, 1400, 2200, 1400, 800];
var genRunning = false;

function resetGeneration() {
  genRunning = false;
  // Reset all gen step states
  var steps = document.querySelectorAll('#genSteps .gen-step');
  steps.forEach(function(step) {
    step.classList.remove('active', 'done');
    step.querySelector('.gen-step-static').innerHTML = '&#x2022;';
  });
  // Reset document preview
  var doc = document.getElementById('genDoc');
  doc.classList.remove('visible', 'typing');
  document.getElementById('genDocBody').textContent = '';
  // Reset completion
  document.getElementById('genComplete').classList.remove('visible');
  // Reset background icon
  var icon = document.getElementById('genIcon');
  icon.classList.remove('done-glow');
  icon.classList.add('generating');
  icon.innerHTML = '&#x2728;';
  // Reset heading/sub
  document.getElementById('genSub').style.display = '';
  // Reset overlay
  var overlay = document.getElementById('s7Overlay');
  overlay.classList.remove('hidden');
  var overlayIcon = document.getElementById('overlayIcon');
  overlayIcon.className = 's7-overlay-icon generating';
  overlayIcon.innerHTML = '&#x2728;';
  document.getElementById('overlayTitle').textContent = 'Creating your resource...';
  // Reset background blur
  document.getElementById('s7DocBg').classList.add('blurred');
}

function startGeneration() {
  genRunning = true;
  var steps = document.querySelectorAll('#genSteps .gen-step');
  var idx = 0;

  function activateStep() {
    if (!genRunning) return;
    if (idx >= steps.length) {
      showDocument();
      return;
    }
    steps[idx].classList.add('active');
    setTimeout(function() {
      if (!genRunning) return;
      steps[idx].classList.remove('active');
      steps[idx].classList.add('done');
      steps[idx].querySelector('.gen-step-static').innerHTML = '&#10003;';
      idx++;
      activateStep();
    }, GEN_STEP_DELAYS[idx]);
  }

  activateStep();
}

function showDocument() {
  var docEl = document.getElementById('genDoc');
  var titleEl = document.getElementById('genDocTitle');
  var metaEl = document.getElementById('genDocMeta');
  var bodyEl = document.getElementById('genDocBody');
  var genIcon = document.getElementById('genIcon');

  var content = generateMockContent();
  titleEl.textContent = content.title;
  metaEl.textContent = content.meta;
  docEl.classList.add('visible', 'typing');

  // Hide the sub text, show document
  document.getElementById('genSub').style.display = 'none';

  // Variable-speed typewriter
  typewriterSmart(bodyEl, content.body, function() {
    docEl.classList.remove('typing');

    // Update overlay icon to done
    var overlayIcon = document.getElementById('overlayIcon');
    overlayIcon.className = 's7-overlay-icon done-glow';
    overlayIcon.innerHTML = '&#x2705;';
    document.getElementById('overlayTitle').textContent = 'Resource ready!';

    // Switch background icon to success
    genIcon.classList.remove('generating');
    genIcon.classList.add('done-glow');
    genIcon.innerHTML = '&#x2705;';

    // Brief pause, then dismiss overlay
    setTimeout(function() {
      document.getElementById('s7Overlay').classList.add('hidden');
      document.getElementById('s7DocBg').classList.remove('blurred');

      setTimeout(function() {
        document.getElementById('genComplete').classList.add('visible');
        TuteroConfetti.launch();
        progressFill.style.width = '92%';
      }, 300);
    }, 800);
  });
}

// Smart typewriter: pauses on newlines, faster on spaces, slower on section headers
function typewriterSmart(el, text, cb) {
  var i = 0;
  el.textContent = '';
  function tick() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      var ch = text.charAt(i);
      var next = text.charAt(i + 1);
      i++;
      var delay;
      if (ch === '\n' && next === '\n') delay = 120;     // Pause on section break
      else if (ch === '\n') delay = 60;                    // Slight pause on newline
      else if (ch === ' ') delay = 12;                     // Fast through spaces
      else delay = 18 + Math.random() * 10;                // Natural variation
      setTimeout(tick, delay);
    } else if (cb) {
      cb();
    }
  }
  tick();
}

// ═══════════════════════════════════════════════════════════════
// Mock Content Generator
// ═══════════════════════════════════════════════════════════════
function generateMockContent() {
  var type = S.resourceType;
  var topic = S.topic || 'the selected topic';
  var year = S.yearLevel || 'Year 8';
  var subject = S.subject || 'Maths';
  var codes = S.curriculumCodes.length ? S.curriculumCodes.join(', ') : 'Curriculum-aligned';

  var templates = {
    'Lesson Plan': {
      title: 'Lesson Plan: ' + subject + ' \u2014 ' + topic,
      meta: year + ' \u00b7 ' + subject + ' \u00b7 ' + codes,
      body: 'LEARNING OBJECTIVES\n' +
        'By the end of this ' + subject.toLowerCase() + ' lesson, students will be able to:\n' +
        '\u2022 Understand and explain key concepts of ' + topic.toLowerCase() + '\n' +
        '\u2022 Apply ' + subject.toLowerCase() + ' knowledge through guided and independent practice\n' +
        '\u2022 Demonstrate understanding through formative assessment\n\n' +
        'LESSON STRUCTURE\n\n' +
        '1. Introduction & Hook (5 min)\n' +
        'Begin with a real-world connection to ' + topic.toLowerCase() + '. Display a visual prompt on the board and ask students to share what they already know. Use a think-pair-share to activate prior knowledge.\n\n' +
        '2. Explicit Teaching (10 min)\n' +
        'Walk through the core ' + subject.toLowerCase() + ' concepts using worked examples. Model thinking aloud as you solve problems step by step. Check for understanding with targeted questions.\n\n' +
        '3. Guided Practice (10 min)\n' +
        'Students work in pairs on scaffolded ' + subject.toLowerCase() + ' problems. Circulate and provide targeted feedback. Use mini-whiteboards for quick checks.\n\n' +
        '4. Independent Practice (10 min)\n' +
        'Students complete differentiated tasks individually. Extension: open-ended challenge. Support: simplified problems with sentence starters.\n\n' +
        '5. Reflection & Exit Ticket (5 min)\n' +
        'Students write one thing they learned about ' + topic.toLowerCase() + ' and one question they still have.'
    },
    'Worksheet': {
      title: 'Worksheet: ' + subject + ' \u2014 ' + topic,
      meta: year + ' \u00b7 ' + subject + ' \u00b7 ' + codes,
      body: 'Name: ________________________  Date: ___________\n\n' +
        'SECTION A: Recall & Understanding (10 marks)\n\n' +
        '1. Define the key term(s) related to ' + topic.toLowerCase() + '. (2 marks)\n' +
        '   _______________________________________________\n' +
        '   _______________________________________________\n\n' +
        '2. Explain in your own words why this ' + subject.toLowerCase() + ' concept is important. (3 marks)\n' +
        '   _______________________________________________\n' +
        '   _______________________________________________\n\n' +
        '3. List three examples that demonstrate this concept in ' + subject.toLowerCase() + '. (3 marks)\n' +
        '   a) _____________________________________________\n' +
        '   b) _____________________________________________\n' +
        '   c) _____________________________________________\n\n' +
        'SECTION B: Application (10 marks)\n\n' +
        '4. Solve the following ' + subject.toLowerCase() + ' problems. Show your working. (5 marks each)\n' +
        '   a) [Problem based on ' + topic.toLowerCase() + ']\n\n' +
        '   b) [Multi-step problem requiring analysis]'
    },
    'Assessment': {
      title: 'Assessment: ' + subject + ' \u2014 ' + topic,
      meta: year + ' \u00b7 ' + subject + ' \u00b7 Total: 30 marks \u00b7 ' + codes,
      body: 'INSTRUCTIONS\n' +
        '\u2022 Answer all questions in the spaces provided\n' +
        '\u2022 Show all working for full marks\n' +
        '\u2022 Time allowed: 30 minutes\n\n' +
        'PART A: Multiple Choice (10 marks)\n' +
        'Circle the correct answer for each question.\n\n' +
        '1. Which of the following best describes ' + topic.toLowerCase() + ' in ' + subject.toLowerCase() + '? (2 marks)\n' +
        '   a) [Option A]\n' +
        '   b) [Option B]\n' +
        '   c) [Option C]\n' +
        '   d) [Option D]\n\n' +
        '2. [Knowledge-based ' + subject.toLowerCase() + ' question about ' + topic.toLowerCase() + '] (2 marks)\n' +
        '   a) [Option A]\n' +
        '   b) [Option B]\n' +
        '   c) [Option C]\n' +
        '   d) [Option D]\n\n' +
        'PART B: Short Answer (10 marks)\n\n' +
        '3. Explain the relationship between the key ' + subject.toLowerCase() + ' concepts. (4 marks)\n' +
        '   _______________________________________________\n' +
        '   _______________________________________________'
    },
    'Document': {
      title: 'Study Guide: ' + subject + ' \u2014 ' + topic,
      meta: year + ' \u00b7 ' + subject + ' \u00b7 Reference Material \u00b7 ' + codes,
      body: 'OVERVIEW\n' +
        topic + ' is a key concept in the ' + year + ' ' + subject + ' curriculum. This study guide covers the essential knowledge and skills you need to master.\n\n' +
        'KEY CONCEPTS\n\n' +
        '1. Core Principles\n' +
        'The foundation of ' + topic.toLowerCase() + ' in ' + subject.toLowerCase() + ' rests on several key ideas that build on prior learning. Understanding these fundamentals is essential before moving to more complex applications.\n\n' +
        '2. Important Terminology\n' +
        '\u2022 Term 1: Definition and context in ' + subject.toLowerCase() + '\n' +
        '\u2022 Term 2: Definition and context\n' +
        '\u2022 Term 3: Definition and context\n\n' +
        '3. Worked Examples\n' +
        'Example 1: [Step-by-step solution demonstrating the ' + subject.toLowerCase() + ' concept]\n' +
        'Example 2: [Application in a different context]\n\n' +
        'REVISION CHECKLIST\n' +
        '\u25a1 I can define the key ' + subject.toLowerCase() + ' terms\n' +
        '\u25a1 I can explain the core concepts in my own words\n' +
        '\u25a1 I can solve problems using the methods shown'
    }
  };

  return templates[type] || templates['Lesson Plan'];
}

// ═══════════════════════════════════════════════════════════════
// Screen 8: Sign Up Form
// ═══════════════════════════════════════════════════════════════
var fName = document.getElementById('fName');
var fEmail = document.getElementById('fEmail');
var fSchool = document.getElementById('fSchool');
var subBtn = document.getElementById('submitBtn');

// ═══════════════════════════════════════════════════════════════
// Sign-up Modal (overlay on S7)
// ═══════════════════════════════════════════════════════════════
function openSignupModal() {
  var content = generateMockContent();
  document.getElementById('previewTitle').textContent = content.title;
  document.getElementById('previewText').textContent = content.body.slice(0, 200) + '...';

  document.getElementById('signupBackdrop').classList.add('visible');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.getElementById('signupModal').classList.add('visible');
    });
  });
  progressFill.style.width = '96%';
  stepLabel.textContent = 'Almost done';
}

function closeSignupModal() {
  document.getElementById('signupModal').classList.remove('visible');
  document.getElementById('signupBackdrop').classList.remove('visible');
}

document.getElementById('toSignupBtn').addEventListener('click', function() {
  openSignupModal();
});

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

function checkS8() {
  toggleBtn(subBtn, fName.value.trim() && TuteroForms.isValidEmail(fEmail.value.trim()));
}

[fName, fEmail].forEach(function(i) {
  i.addEventListener('input', function() {
    checkS8();
    if (i === fName && fName.value.trim()) clearErr(fName);
    if (i === fEmail && TuteroForms.isValidEmail(fEmail.value.trim())) clearErr(fEmail);
  });
});

function validateS8() {
  var ok = true;
  if (!fName.value.trim()) { showErr(fName); ok = false; } else clearErr(fName);
  if (!TuteroForms.isValidEmail(fEmail.value.trim())) { showErr(fEmail); ok = false; } else clearErr(fEmail);
  return ok;
}

subBtn.addEventListener('click', function() {
  if (subBtn.classList.contains('disabled')) { validateS8(); return; }

  TuteroLead.submit({
    source: 'onboarding_funnel',
    resource_type: S.resourceType,
    subject: S.subject,
    year_level: S.yearLevel,
    topic: S.topic,
    curriculum_framework: S.curriculumFramework,
    curriculum_codes: S.curriculumCodes.join(', '),
    theme: S.theme,
    teacher_name: fName.value.trim(),
    email: fEmail.value.trim(),
    school: fSchool.value.trim()
  }, { landingPage: 'Tutero AI - Teacher Onboarding', variant: 'a' });

  document.getElementById('signupModalForm').style.display = 'none';
  document.getElementById('successWrap').classList.add('active');
  progressFill.style.width = '100%';
  backBtn.style.visibility = 'hidden';
  TuteroConfetti.launch();
});

// Enter key
[fName, fEmail, fSchool].forEach(function(el) {
  el.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); subBtn.click(); }
  });
});

// Download button
document.getElementById('downloadBtn').addEventListener('click', function() {
  alert('PDF download will be available soon! Create a free account to save your resource now.');
});

// ═══════════════════════════════════════════════════════════════
// Floating Particles (Welcome Screen)
// ═══════════════════════════════════════════════════════════════
function initParticles() {
  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var s0 = document.getElementById('s0');

  function resize() {
    canvas.width = s0.offsetWidth;
    canvas.height = s0.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var particles = [];
  var count = 40;
  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.3 + 0.05
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + p.o + ')';
      ctx.fill();
    });

    // Draw faint connections
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.04 * (1 - dist / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ═══════════════════════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════════════════════
initScreens();
updateChrome(0);
initParticles();

// Header back button — smart navigation
backBtn.addEventListener('click', function() {
  if (cur > 0 && cur !== 7) goTo(cur - 1);
  // Don't allow back from generation screen (it's locked)
});

// S0 -> S1
document.getElementById('startBtn').addEventListener('click', function() { goTo(1); });

// S1: Resource Type (auto-advance -> S2)
initCardScreen('s1', 'resourceType', 2, function() {
  personaliseS2();
});

// S2: Subject (auto-advance -> S3)
initCardScreen('s2', 'subject', 3, function() {
  personaliseS3();
  // Update placeholders based on selected subject
  placeholders = SUBJECT_PLACEHOLDERS[S.subject] || SUBJECT_PLACEHOLDERS['default'];
  phIdx = 0; phCharIdx = 0; phDirection = 1;
});

// S4: Year Level (delegated click handler for dynamic pills)
document.getElementById('yearPillGrid').addEventListener('click', function(e) {
  var pill = e.target.closest('.qz-pill');
  if (!pill) return;
  document.querySelectorAll('#yearPillGrid .qz-pill').forEach(function(c) {
    c.classList.remove('selected');
  });
  pill.classList.add('selected');
  S.yearLevel = pill.dataset.val;
  personaliseS5();
  updateTopicSuggestions();
  setTimeout(function() { goTo(5); }, 320);
});
