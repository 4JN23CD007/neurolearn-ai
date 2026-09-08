const express = require('express');
const { authenticate } = require('../middleware/auth');
const { NudgeModel } = require('../models/store');

const router = express.Router();
router.use(authenticate);

const NUDGE_TEMPLATES = {
  inactivity: [
    { type: 'warning', message: "You've been still for a while. Want me to simplify this section?" },
    { type: 'warning', message: 'Try the chunked view to make reading easier.' },
    { type: 'info',    message: 'Use the focus ruler (arrow keys) to read one line at a time.' },
    { type: 'info',    message: 'Need help? Try asking the voice assistant to summarize.' },
  ],
  lowAttention: [
    { type: 'warning', message: 'Your attention seems to have drifted. Ready to continue?' },
    { type: 'info',    message: 'Try switching to ADHD mode for a cleaner layout.' },
    { type: 'warning', message: 'Want to simplify this passage to make it easier?' },
  ],
  breakTime: [
    { type: 'break', message: 'Great work! Time for a 5-minute break to recharge.' },
    { type: 'break', message: "You've been focused for a while. A short break will help memory retention." },
  ],
  progress: [
    { type: 'success', message: 'Excellent focus! You\'re really in the zone.' },
    { type: 'success', message: 'Well done — you\'ve completed another passage!' },
  ],
};

// POST /api/nudge — log and return a nudge
router.post('/', (req, res) => {
  const { trigger = 'manual', type, message } = req.body;
  if (type && message) {
    const nudge = NudgeModel.add(req.user.id, { type, message, trigger });
    return res.json(nudge);
  }
  const templates = NUDGE_TEMPLATES[trigger] || NUDGE_TEMPLATES.inactivity;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const nudge = NudgeModel.add(req.user.id, { ...template, trigger });
  res.json(nudge);
});

// GET /api/nudge — get recent nudges
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(NudgeModel.getRecent(req.user.id, limit));
});

module.exports = router;
