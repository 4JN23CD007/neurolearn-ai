const express = require('express');
const multer = require('multer');
const { optionalAuth } = require('../middleware/auth');
const {
  summarizeText, simplifyText, convertToBullets,
  chunkText, extractKeywords, adaptReadingLevel,
  answerQuestion, processVoiceCommand, generateQuiz,
  lookupDictionary,
} = require('../services/claudeService');
const { extractTextFromPDFBuffer } = require('../services/pdfService');
const { analyzeTextMetrics } = require('../services/readabilityEngine');

const router = express.Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

router.use(optionalAuth);

function validate(req, res, fields) {
  for (const f of fields) {
    if (!req.body[f]) {
      res.status(400).json({ error: `${f} is required` });
      return false;
    }
  }
  return true;
}

// POST /api/transform/summarize
router.post('/summarize', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text'])) return;
    const { text, level = 'medium' } = req.body;
    const result = await summarizeText(text, level);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/simplify
router.post('/simplify', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text'])) return;
    const { text, level = 'medium' } = req.body;
    const result = await simplifyText(text, level);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/bullets
router.post('/bullets', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text'])) return;
    const { text, level = 'medium' } = req.body;
    const result = await convertToBullets(text, level);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/chunk
router.post('/chunk', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text'])) return;
    const { text, level = 'medium' } = req.body;
    const result = await chunkText(text, level);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/keywords
router.post('/keywords', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text'])) return;
    const { text } = req.body;
    const result = await extractKeywords(text);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/level
router.post('/level', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text', 'level'])) return;
    const { text, level } = req.body;
    if (!['easy', 'medium', 'advanced'].includes(level))
      return res.status(400).json({ error: 'level must be easy, medium, or advanced' });
    const result = await adaptReadingLevel(text, level);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/qa
router.post('/qa', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text', 'question'])) return;
    const { text, question } = req.body;
    const result = await answerQuestion(text, question);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/voice-command
router.post('/voice-command', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text', 'command'])) return;
    const { text, command } = req.body;
    const result = await processVoiceCommand(text, command);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/quiz
router.post('/quiz', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text'])) return;
    const { text } = req.body;
    const result = await generateQuiz(text);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/dictionary
router.post('/dictionary', async (req, res, next) => {
  try {
    if (!validate(req, res, ['word'])) return;
    const { word } = req.body;
    const result = await lookupDictionary(word);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/transform/metrics
router.post('/metrics', async (req, res, next) => {
  try {
    if (!validate(req, res, ['text'])) return;
    const { text } = req.body;
    const metrics = analyzeTextMetrics(text);
    res.json(metrics);
  } catch (err) { next(err); }
});

// POST /api/transform/upload-pdf
router.post('/upload-pdf', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    const result = await extractTextFromPDFBuffer(req.file.buffer);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
