const express = require('express');
const { authenticate } = require('../middleware/auth');
const { PreferencesModel, ProgressModel } = require('../models/store');

const router = express.Router();
router.use(authenticate);

// GET /api/user/me
router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

// GET /api/user/preferences
router.get('/preferences', (req, res) => {
  const prefs = PreferencesModel.get(req.user.id);
  if (!prefs) return res.status(404).json({ error: 'Preferences not found' });
  res.json(prefs);
});

// PUT /api/user/preferences
router.put('/preferences', (req, res) => {
  const allowed = [
    'profile', 'readingLevel', 'fontSize', 'ttsSpeed',
    'sessionLengthMinutes', 'highlightColor', 'focusRulerEnabled',
    'autoSimplifyOnInactivity', 'breakReminderEnabled',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const updated = PreferencesModel.update(req.user.id, updates);
  if (!updated) return res.status(404).json({ error: 'Preferences not found' });
  res.json(updated);
});

// GET /api/user/progress
router.get('/progress', (req, res) => {
  const progress = ProgressModel.get(req.user.id);
  if (!progress) return res.status(404).json({ error: 'Progress not found' });
  res.json(progress);
});

// POST /api/user/progress/record
router.post('/progress/record', (req, res) => {
  const { wordsRead = 0, focusMinutes = 0, focusScore = 0, transformsUsed = {} } = req.body;
  const updated = ProgressModel.recordSession(req.user.id, { wordsRead, focusMinutes, focusScore, transformsUsed });
  if (!updated) return res.status(404).json({ error: 'Progress not found' });
  res.json(updated);
});

module.exports = router;
