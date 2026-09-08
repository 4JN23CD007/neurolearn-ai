// ─────────────────────────────────────────────────────────────────────────────
// In-memory store — replace with MongoDB/PostgreSQL for production
// ─────────────────────────────────────────────────────────────────────────────
const { v4: uuidv4 } = require('uuid');

const store = {
  users: new Map(),         // userId -> user object
  sessions: new Map(),      // sessionId -> session object
  preferences: new Map(),   // userId -> preferences object
  progress: new Map(),      // userId -> progress object
  nudges: new Map(),        // userId -> [nudge, ...]
};

// ── User Model ────────────────────────────────────────────────────────────────
const UserModel = {
  create({ name, email, passwordHash }) {
    const id = uuidv4();
    const user = {
      id,
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    store.users.set(id, user);
    // init defaults
    PreferencesModel.init(id);
    ProgressModel.init(id);
    return user;
  },

  findByEmail(email) {
    for (const user of store.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  findById(id) {
    return store.users.get(id) || null;
  },

  toPublic(user) {
    const { passwordHash, ...pub } = user;
    return pub;
  }
};

// ── Preferences Model ─────────────────────────────────────────────────────────
const PreferencesModel = {
  init(userId) {
    store.preferences.set(userId, {
      userId,
      profile: 'default',         // default | dyslexia | adhd
      readingLevel: 'medium',     // easy | medium | advanced
      fontSize: 15,
      ttsSpeed: 1.0,
      sessionLengthMinutes: 20,
      highlightColor: 'purple',
      focusRulerEnabled: false,
      autoSimplifyOnInactivity: true,
      breakReminderEnabled: true,
      updatedAt: new Date().toISOString(),
    });
  },

  get(userId) {
    return store.preferences.get(userId) || null;
  },

  update(userId, updates) {
    const existing = store.preferences.get(userId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    store.preferences.set(userId, updated);
    return updated;
  }
};

// ── Progress Model ────────────────────────────────────────────────────────────
const ProgressModel = {
  init(userId) {
    store.progress.set(userId, {
      userId,
      totalSessions: 0,
      totalWordsRead: 0,
      totalFocusMinutes: 0,
      averageFocusScore: 0,
      currentStreak: 0,
      lastSessionDate: null,
      passagesCompleted: 0,
      transformsUsed: {},
      updatedAt: new Date().toISOString(),
    });
  },

  get(userId) {
    return store.progress.get(userId) || null;
  },

  update(userId, updates) {
    const existing = store.progress.get(userId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    store.progress.set(userId, updated);
    return updated;
  },

  recordSession(userId, { wordsRead, focusMinutes, focusScore, transformsUsed = {} }) {
    const p = store.progress.get(userId);
    if (!p) return null;
    const today = new Date().toDateString();
    const streak = p.lastSessionDate === new Date(Date.now() - 86400000).toDateString()
      ? p.currentStreak + 1
      : p.lastSessionDate === today ? p.currentStreak : 1;
    const totalSessions = p.totalSessions + 1;
    const avgFocus = Math.round((p.averageFocusScore * p.totalSessions + focusScore) / totalSessions);
    const allTransforms = { ...p.transformsUsed };
    for (const [k, v] of Object.entries(transformsUsed)) {
      allTransforms[k] = (allTransforms[k] || 0) + v;
    }
    return ProgressModel.update(userId, {
      totalSessions,
      totalWordsRead: p.totalWordsRead + wordsRead,
      totalFocusMinutes: p.totalFocusMinutes + focusMinutes,
      averageFocusScore: avgFocus,
      currentStreak: streak,
      lastSessionDate: today,
      passagesCompleted: p.passagesCompleted + 1,
      transformsUsed: allTransforms,
    });
  }
};

// ── Session Model ─────────────────────────────────────────────────────────────
const SessionModel = {
  create(userId, { lengthMinutes }) {
    const id = uuidv4();
    const session = {
      id,
      userId,
      lengthMinutes,
      startedAt: new Date().toISOString(),
      endedAt: null,
      wordsRead: 0,
      focusScore: 0,
      transformsUsed: {},
      nudgesTriggered: [],
      active: true,
    };
    store.sessions.set(id, session);
    return session;
  },

  get(sessionId) {
    return store.sessions.get(sessionId) || null;
  },

  update(sessionId, updates) {
    const existing = store.sessions.get(sessionId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    store.sessions.set(sessionId, updated);
    return updated;
  },

  end(sessionId) {
    return SessionModel.update(sessionId, {
      endedAt: new Date().toISOString(),
      active: false,
    });
  },

  getUserSessions(userId) {
    const results = [];
    for (const s of store.sessions.values()) {
      if (s.userId === userId) results.push(s);
    }
    return results.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  }
};

// ── Nudge Model ───────────────────────────────────────────────────────────────
const NudgeModel = {
  add(userId, { type, message, trigger }) {
    const existing = store.nudges.get(userId) || [];
    const nudge = {
      id: uuidv4(),
      type,         // warning | info | success | break
      message,
      trigger,      // inactivity | low-attention | timer | manual
      createdAt: new Date().toISOString(),
    };
    store.nudges.set(userId, [nudge, ...existing].slice(0, 50));
    return nudge;
  },

  getRecent(userId, limit = 10) {
    return (store.nudges.get(userId) || []).slice(0, limit);
  }
};

module.exports = { UserModel, PreferencesModel, ProgressModel, SessionModel, NudgeModel };
