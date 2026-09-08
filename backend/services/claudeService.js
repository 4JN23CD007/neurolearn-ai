const Anthropic = require('@anthropic-ai/sdk');
const { analyzeTextMetrics, compareReadability } = require('./readabilityEngine');
const {
  fallbackSummarize, fallbackSimplify, fallbackBullets,
  fallbackChunk, fallbackKeywords, fallbackQuiz, fallbackDictionary,
} = require('./fallbackNLP');

let client = null;
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_api_key_here') {
  try {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  } catch (err) {
    console.warn('⚠️ Anthropic SDK initialization failed. Falling back to local NLP engine.', err.message);
  }
}

const MODEL = 'claude-sonnet-4-20250514';

const LEVEL_DESCRIPTIONS = {
  easy: 'Grade 5 reading level. Very short sentences (under 12 words). Simple everyday words. Active voice. No complex jargon.',
  medium: 'Grade 9 reading level. Standard academic text. Clear structure. Moderate sentence length.',
  advanced: 'University level. Complex vocabulary, technical academic tone, and full sentence depth.',
};

async function callClaude(prompt, maxTokens = 1500) {
  if (!client) {
    throw new Error('ANTHROPIC_API_KEY_UNAVAILABLE');
  }
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return message.content[0].text;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transformations with Readability Metrics & Fallbacks
// ─────────────────────────────────────────────────────────────────────────────

async function summarizeText(text, level = 'medium') {
  try {
    const prompt = `
You are an educational text simplifier for neurodivergent learners.
Reading level target: ${LEVEL_DESCRIPTIONS[level]}

Summarize the following text into 3-5 clear, concise sentences.
Return ONLY the summary text.

TEXT:
${text}
`.trim();

    const result = await callClaude(prompt, 500);
    const summary = result.trim();
    const metrics = compareReadability(text, summary);

    return {
      type: 'summary',
      content: summary,
      level,
      readability: metrics,
      source: 'claude-ai',
    };
  } catch (err) {
    const fallback = fallbackSummarize(text, level);
    fallback.readability = compareReadability(text, fallback.content);
    return fallback;
  }
}

async function simplifyText(text, level = 'medium') {
  try {
    const prompt = `
You are an educational text simplifier for neurodivergent learners (ADHD, Dyslexia).
Target reading level: ${LEVEL_DESCRIPTIONS[level]}

Rewrite the text below. Keep all facts intact, but:
1. Break long complex sentences into short, direct sentences.
2. Use active voice and plain vocabulary.
3. Add paragraph breaks for visual breathing room.
Return ONLY the simplified text.

TEXT:
${text}
`.trim();

    const result = await callClaude(prompt, 1500);
    const simplified = result.trim();
    const metrics = compareReadability(text, simplified);

    return {
      type: 'simplified',
      content: simplified,
      level,
      readability: metrics,
      source: 'claude-ai',
    };
  } catch (err) {
    const fallback = fallbackSimplify(text, level);
    fallback.readability = compareReadability(text, fallback.content);
    return fallback;
  }
}

async function convertToBullets(text, level = 'medium') {
  try {
    const prompt = `
You are an educational content formatter for neurodivergent learners.
Target reading level: ${LEVEL_DESCRIPTIONS[level]}

Convert the following text into a clear bullet-point list of 6-10 key ideas.
Each bullet point should be ONE concise sentence.
Return ONLY bullets formatted as:
• [bullet point]
• [bullet point]

TEXT:
${text}
`.trim();

    const raw = await callClaude(prompt, 800);
    const bullets = raw.trim().split('\n')
      .filter(l => l.trim().startsWith('•') || l.trim().startsWith('-'))
      .map(l => l.replace(/^[•\-]\s*/, '').trim())
      .filter(Boolean);

    const bulletText = bullets.join('. ');
    const metrics = compareReadability(text, bulletText);

    return {
      type: 'bullets',
      bullets,
      level,
      readability: metrics,
      source: 'claude-ai',
    };
  } catch (err) {
    const fallback = fallbackBullets(text, level);
    fallback.readability = compareReadability(text, fallback.bullets.join('. '));
    return fallback;
  }
}

async function chunkText(text, level = 'medium') {
  try {
    const prompt = `
You are an educational content organizer for neurodivergent learners.
Target level: ${LEVEL_DESCRIPTIONS[level]}

Break the text into 3-5 clearly titled sections/chunks.
Return ONLY valid JSON in this format:
{
  "chunks": [
    { "title": "Clear Section Title", "content": "Short 2-3 sentence explanation." }
  ]
}

TEXT:
${text}
`.trim();

    const raw = await callClaude(prompt, 1200);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);
    const chunkCombinedText = parsed.chunks.map(c => c.content).join(' ');
    const metrics = compareReadability(text, chunkCombinedText);

    return {
      type: 'chunks',
      chunks: parsed.chunks,
      level,
      readability: metrics,
      source: 'claude-ai',
    };
  } catch (err) {
    const fallback = fallbackChunk(text, level);
    const combined = fallback.chunks.map(c => c.content).join(' ');
    fallback.readability = compareReadability(text, combined);
    return fallback;
  }
}

async function extractKeywords(text) {
  try {
    const prompt = `
Extract up to 8 important academic keywords, 4 action steps, and plain-English definitions from this text.
Return ONLY valid JSON:
{
  "keywords": ["word1", "word2"],
  "actions": ["action phrase 1"],
  "definitions": { "word1": "simple definition" }
}

TEXT:
${text}
`.trim();

    const raw = await callClaude(prompt, 600);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { type: 'keywords', ...parsed, source: 'claude-ai' };
  } catch (err) {
    return fallbackKeywords(text);
  }
}

async function adaptReadingLevel(text, level) {
  return simplifyText(text, level);
}

async function answerQuestion(text, question) {
  try {
    const prompt = `
You are a patient AI tutor for neurodivergent students.
Read this context:
"${text}"

Student Question: "${question}"

Answer in 2-3 short, clear sentences at Grade 7 level.
`.trim();

    const answer = await callClaude(prompt, 300);
    return { type: 'answer', answer: answer.trim(), question, source: 'claude-ai' };
  } catch (err) {
    return {
      type: 'answer',
      answer: `This passage explains key concepts. Regarding "${question}", try focusing on the main bullet points or simplified summary.`,
      question,
      source: 'offline-nlp',
    };
  }
}

async function processVoiceCommand(text, command) {
  try {
    const prompt = `
The student gave voice command: "${command}".
Map it to one of these intents: summarize, simplify, bullets, chunk, keywords, read, pause, easy, medium, advanced, quiz, bionic, dyslexia, adhd, help.
Return ONLY valid JSON:
{
  "intent": "summarize|simplify|bullets|chunk|keywords|read|pause|easy|medium|advanced|quiz|bionic|dyslexia|adhd|help|unknown",
  "response": "Short 1-sentence confirmation message",
  "action": "action description"
}
`.trim();

    const raw = await callClaude(prompt, 200);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    const cmd = command.toLowerCase();
    let intent = 'unknown';
    if (cmd.includes('summary') || cmd.includes('summarize')) intent = 'summarize';
    else if (cmd.includes('simplify') || cmd.includes('easier')) intent = 'simplify';
    else if (cmd.includes('bullet') || cmd.includes('points')) intent = 'bullets';
    else if (cmd.includes('chunk') || cmd.includes('break')) intent = 'chunk';
    else if (cmd.includes('easy')) intent = 'easy';
    else if (cmd.includes('medium')) intent = 'medium';
    else if (cmd.includes('advanced')) intent = 'advanced';
    else if (cmd.includes('dyslexia')) intent = 'dyslexia';
    else if (cmd.includes('adhd')) intent = 'adhd';
    else if (cmd.includes('quiz') || cmd.includes('test')) intent = 'quiz';
    else if (cmd.includes('bionic')) intent = 'bionic';
    else if (cmd.includes('read') || cmd.includes('speak')) intent = 'read';

    return {
      intent,
      response: `Processing your voice request for ${intent}...`,
      action: intent,
      source: 'offline-nlp',
    };
  }
}

async function generateQuiz(text) {
  try {
    const prompt = `
Create an interactive 10-question comprehension assessment based on this reading text for neurodivergent learners.
Include 8 multiple choice questions and 2 true/false questions.
Return ONLY valid JSON in this exact structure:
{
  "title": "Comprehension & Neuro-Focus Assessment (10 Questions)",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Short clear explanation why Option A is correct."
    }
  ]
}

TEXT:
${text}
`.trim();

    const raw = await callClaude(prompt, 2000);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (parsed && parsed.questions && parsed.questions.length >= 10) {
      return parsed;
    }
    return fallbackQuiz(text);
  } catch (err) {
    return fallbackQuiz(text);
  }
}

async function lookupDictionary(word, contextText = '') {
  try {
    const prompt = `
Define the academic word "${word}" in the context of this passage:
"${contextText.slice(0, 500)}"

Return ONLY valid JSON:
{
  "word": "${word}",
  "phonetic": "/pronunciation/",
  "definition": "Standard 1-sentence dictionary definition.",
  "simplified": "Super simple plain-English explanation for an 8-year-old.",
  "contextMeaning": "Specific explanation of how this word is used in this reading context.",
  "example": "Sample sentence using ${word}."
}
`.trim();

    const raw = await callClaude(prompt, 400);
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    return fallbackDictionary(word, contextText);
  }
}

module.exports = {
  summarizeText,
  simplifyText,
  convertToBullets,
  chunkText,
  extractKeywords,
  adaptReadingLevel,
  answerQuestion,
  processVoiceCommand,
  generateQuiz,
  lookupDictionary,
};
