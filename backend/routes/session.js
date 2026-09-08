// routes/session.js
const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { SessionModel } = require('../models/store');

const router = express.Router();
router.use(optionalAuth);

// POST /api/session/start
router.post('/start', (req, res) => {
  const userId = req.user ? req.user.id : 'guest';
  const { lengthMinutes = 20 } = req.body;
  const session = SessionModel.create(userId, { lengthMinutes });
  res.status(201).json(session);
});

// GET /api/session/:id
router.get('/:id', (req, res) => {
  const session = SessionModel.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// PUT /api/session/:id
router.put('/:id', (req, res) => {
  const session = SessionModel.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const { wordsRead, focusScore, transformsUsed, nudgesTriggered } = req.body;
  const updates = {};
  if (wordsRead !== undefined) updates.wordsRead = wordsRead;
  if (focusScore !== undefined) updates.focusScore = focusScore;
  if (transformsUsed !== undefined) updates.transformsUsed = transformsUsed;
  if (nudgesTriggered !== undefined) updates.nudgesTriggered = nudgesTriggered;
  res.json(SessionModel.update(req.params.id, updates));
});

// POST /api/session/:id/end
router.post('/:id/end', (req, res) => {
  const session = SessionModel.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(SessionModel.end(req.params.id));
});

// POST /api/session/feedback
router.post('/feedback', (req, res) => {
  const { sessionId, readabilityRating, focusRating, helpfulnessRating, comments } = req.body;
  const feedbackRecord = {
    id: 'fb_' + Date.now(),
    sessionId,
    userId: req.user ? req.user.id : 'guest',
    readabilityRating,
    focusRating,
    helpfulnessRating,
    comments,
    timestamp: new Date().toISOString(),
  };
  res.status(201).json({ status: 'success', feedback: feedbackRecord });
});

// GET /api/session (list user sessions)
router.get('/', (req, res) => {
  const userId = req.user ? req.user.id : 'guest';
  res.json(SessionModel.getUserSessions(userId));
});

module.exports = router;
