// Vercel Serverless Function — Generate Personalised Visual Learning Plan via Claude API
const setCors = require('./_cors');

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentName, yearLevel, situation, currentGrade, confidence, subject, struggleArea } = req.body || {};

  if (!studentName || !yearLevel || !situation || !currentGrade || !confidence || !subject || !struggleArea) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sanitise = (s) => String(s).slice(0, 100).replace(/[<>{}\[\]\\]/g, '');
  const s = {
    studentName: sanitise(studentName),
    yearLevel: sanitise(yearLevel),
    situation: sanitise(situation),
    currentGrade: sanitise(currentGrade),
    confidence: sanitise(confidence),
    subject: sanitise(subject),
    struggleArea: sanitise(struggleArea)
  };

  const situationLabels = {
    'falling-behind': 'falling behind in class and struggling to keep up',
    'consistent-practice': 'doing okay but needs consistent practice and reinforcement',
    'get-ahead': 'a capable student who wants to get ahead and aim higher',
    'exam-prep': 'preparing for important exams (HSC, ATAR, or key assessments)'
  };
  const situationDesc = situationLabels[s.situation] || s.situation;

  const gradeLevels = {
    'well-below': { range: '30-40', label: 'Well Below Expected', targetLabel: 'Average' },
    'below': { range: '42-52', label: 'Below Expected', targetLabel: 'Above Average' },
    'average': { range: '58-68', label: 'Average', targetLabel: 'High Achiever' },
    'above': { range: '72-82', label: 'Above Average', targetLabel: 'Top of Class' }
  };
  const gradeInfo = gradeLevels[s.currentGrade] || gradeLevels['average'];

  const confidenceStyles = {
    'very-low': 'Patient, gentle & encouraging — builds trust before pushing',
    'low': 'Patient & encouraging — celebrates small wins',
    'mixed': 'Supportive but structured — balances encouragement with challenge',
    'good': 'Challenging & ambitious — pushes for excellence'
  };
  const tutorStyle = confidenceStyles[s.confidence] || confidenceStyles['mixed'];

  const struggleLabel = s.struggleArea.replace(/-/g, ' ');

  const systemPrompt = 'You are an experienced Australian education consultant at Tutero, creating a personalised learning plan for a parent. Write in a warm, professional tone using Australian English spelling. Your output must be valid JSON matching the exact schema provided. Do not include any text outside the JSON object.';

  const userPrompt = 'Create a personalised visual learning plan for:\n' +
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

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  let timeout;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => { controller.abort(); }, 20000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await response.json();
    const text = data.content[0].text;

    let plan;
    try {
      const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      plan = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message, 'Raw:', text.slice(0, 500));
      return res.status(502).json({ error: 'Invalid response from AI' });
    }

    const required = ['currentLevel', 'targetLevel', 'levelLabel', 'targetLabel', 'skills', 'roadmap', 'schedule', 'tutorMatch', 'outcomeStatement'];
    for (const field of required) {
      if (!plan[field]) {
        console.error('Missing field:', field);
        return res.status(502).json({ error: 'Incomplete plan generated' });
      }
    }

    return res.status(200).json({ plan });

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
