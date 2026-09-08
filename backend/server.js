require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const transformRoutes = require('./routes/transform');
const userRoutes = require('./routes/user');
const sessionRoutes = require('./routes/session');
const nudgeRoutes = require('./routes/nudge');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/transform', transformRoutes);
app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/nudge', nudgeRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve Frontend Production Static Build ──────────────────────────────────
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🧠 NeuroLearn AI Application Running Successfully!`);
  console.log(`=======================================================`);
  console.log(`👉 Main Web App URL : http://localhost:${PORT}`);
  console.log(`👉 API Endpoint     : http://localhost:${PORT}/api/health`);
  console.log(`   Anthropic API   : ${process.env.ANTHROPIC_API_KEY ? '✓ Key Loaded' : '⚡ Offline Local NLP Active'}`);
  console.log(`=======================================================\n`);
});

module.exports = app;
