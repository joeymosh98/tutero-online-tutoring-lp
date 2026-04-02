// Vercel Serverless Function — Generate Personalised Visual Learning Plan via Claude API

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate input
  var body = req.body || {};
  var studentName = body.studentName;
  var yearLevel = body.yearLevel;
  var situation = body.situation;
  var currentGrade = body.currentGrade;
  var confidence = body.confidence;
  var subject = body.subject;
  var struggleArea = body.struggleArea;

  if (!studentName || !yearLevel || !situation || !currentGrade || !confidence || !subject || !struggleArea) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Sanitise inputs
  function sanitise(s) {
    return String(s).slice(0, 100).replace(/[<>{}\[\]\\]/g, '');
  }
  var s = {
    studentName: sanitise(studentName),
    yearLevel: sanitise(yearLevel),
    situation: sanitise(situation),
    currentGrade: sanitise(currentGrade),
    confidence: sanitise(confidence),
    subject: sanitise(subject),
    struggleArea: sanitise(struggleArea)
  };

  // Map situation to description
  var situationLabels = {
    'falling-behind': 'falling behind in class and struggling to keep up',
    'consistent-practice': 'doing okay but needs consistent practice and reinforcement',
    'get-ahead': 'a capable student who wants to get ahead and aim higher',
    'exam-prep': 'preparing for important exams (HSC, ATAR, or key assessments)'
  };
  var situationDesc = situationLabels[s.situation] || s.situation;

  // Map current grade to level range
  var gradeLevels = {
    'well-below': { range: '30-40', label: 'Well Below Expected', targetLabel: 'Average' },
    'below': { range: '42-52', label: 'Below Expected', targetLabel: 'Above Average' },
    'average': { range: '58-68', label: 'Average', targetLabel: 'High Achiever' },
    'above': { range: '72-82', label: 'Above Average', targetLabel: 'Top of Class' }
  };
  var gradeInfo = gradeLevels[s.currentGrade] || gradeLevels['average'];

  // Map confidence to tutor style guidance
  var confidenceStyles = {
    'very-low': 'Patient, gentle & encouraging — builds trust before pushing',
    'low': 'Patient & encouraging — celebrates small wins',
    'mixed': 'Supportive but structured — balances encouragement with challenge',
    'good': 'Challenging & ambitious — pushes for excellence'
  };
  var tutorStyle = confidenceStyles[s.confidence] || confidenceStyles['mixed'];

  // Map struggle area to readable label
  var struggleLabel = s.struggleArea.replace(/-/g, ' ');

  var systemPrompt = 'You are an experienced Australian education consultant at Tutero, creating a personalised learning plan for a parent. Write in a warm, professional tone using Australian English spelling. Your output must be valid JSON matching the exact schema provided. Do not include any text outside the JSON object.';

  var userPrompt = 'Create a personalised visual learning plan for:\n' +
    '- Student: ' + s.studentName + '\n' +
    '- Year Level: ' + s.yearLevel + '\n' +
    '- Current Situation: ' + s.studentName + ' is ' + situationDesc + '\n' +
    '- Current Grade Level: ' + gradeInfo.label + ' (pick a currentLevel number between ' + gradeInfo.range + ')\n' +
    '- Confidence: ' + s.confidence + '\n' +
    '- Subject: ' + s.subject + '\n' +
    '- Biggest Struggle: ' + struggleLabel + '\n\n' +
    'Return a JSON object with this exact structure:\n' +
    '{\n' +
    '  "currentLevel": <number between ' + gradeInfo.range + ' — represents current performance percentage>,\n' +
    '  "targetLevel": <currentLevel + 25 to 35, capped at 95>,\n' +
    '  "levelLabel": "' + gradeInfo.label + '",\n' +
    '  "targetLabel": "' + gradeInfo.targetLabel + '",\n' +
    '  "skills": [\n' +
    '    {\n' +
    '      "name": "<specific ' + s.subject + ' skill at ' + s.yearLevel + ' level related to their struggle: ' + struggleLabel + '>",\n' +
    '      "score": <number 25-50 — this MUST be the lowest score since it is their main struggle>,\n' +
    '      "status": "Needs attention"\n' +
    '    },\n' +
    '    {\n' +
    '      "name": "<second specific ' + s.subject + ' skill at ' + s.yearLevel + ' level>",\n' +
    '      "score": <number 45-70>,\n' +
    '      "status": "<Developing or On track>"\n' +
    '    },\n' +
    '    {\n' +
    '      "name": "<third specific ' + s.subject + ' skill at ' + s.yearLevel + ' level — their relative strength>",\n' +
    '      "score": <number 60-85>,\n' +
    '      "status": "<On track or Strong>"\n' +
    '    }\n' +
    '  ],\n' +
    '  "roadmap": [\n' +
    '    {\n' +
    '      "period": "Week 1-2",\n' +
    '      "title": "<max 6 words — what happens first for ' + s.studentName + '>",\n' +
    '      "detail": "<max 10 words — specific action related to ' + struggleLabel + '>"\n' +
    '    },\n' +
    '    {\n' +
    '      "period": "Week 3-6",\n' +
    '      "title": "<max 6 words>",\n' +
    '      "detail": "<max 10 words>"\n' +
    '    },\n' +
    '    {\n' +
    '      "period": "Week 7-12",\n' +
    '      "title": "<max 6 words>",\n' +
    '      "detail": "<max 10 words>"\n' +
    '    }\n' +
    '  ],\n' +
    '  "schedule": {\n' +
    '    "sessionsPerWeek": 2,\n' +
    '    "minutesPerSession": 55\n' +
    '  },\n' +
    '  "tutorMatch": {\n' +
    '    "specialisation": "<' + s.yearLevel + ' ' + s.subject + ' specialist>",\n' +
    '    "style": "' + tutorStyle + '",\n' +
    '    "experience": "<relevant experience, e.g. HSC & NAPLAN experienced>"\n' +
    '  },\n' +
    '  "outcomeStatement": "In 12 weeks, ' + s.studentName + ' could move from ' + gradeInfo.label + ' to ' + gradeInfo.targetLabel + ' in ' + s.subject + '."\n' +
    '}\n\n' +
    'IMPORTANT RULES:\n' +
    '- All 3 skill names MUST be specific to ' + s.subject + ' at ' + s.yearLevel + ' level in the Australian curriculum\n' +
    '- The first skill MUST relate to their struggle area: ' + struggleLabel + '\n' +
    '- Skills should be ordered from lowest to highest score\n' +
    '- Roadmap titles must be max 6 words, details max 10 words\n' +
    '- The outcomeStatement must be exactly one sentence, max 25 words\n' +
    '- Do not use markdown in values\n' +
    '- Return ONLY the JSON object';

  // Call Claude API
  var ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 20000);

    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      var errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    var data = await response.json();
    var text = data.content[0].text;

    // Parse JSON response (handle possible code block wrapping)
    var plan;
    try {
      var cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      plan = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message, 'Raw:', text.slice(0, 500));
      return res.status(502).json({ error: 'Invalid response from AI' });
    }

    // Validate required fields
    var required = ['currentLevel', 'targetLevel', 'levelLabel', 'targetLabel', 'skills', 'roadmap', 'schedule', 'tutorMatch', 'outcomeStatement'];
    for (var i = 0; i < required.length; i++) {
      if (!plan[required[i]]) {
        console.error('Missing field:', required[i]);
        return res.status(502).json({ error: 'Incomplete plan generated' });
      }
    }

    return res.status(200).json({ plan: plan });

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error('Anthropic API timeout');
      return res.status(504).json({ error: 'AI service timeout' });
    }
    console.error('Serverless function error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
