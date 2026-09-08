import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth (defaults to guest learner so app opens instantly) ─────────
      token: 'guest_token_default',
      user: { id: 'guest', name: 'Guest Learner', email: 'guest@neurolearn.ai' },
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({
        token: 'guest_token_default',
        user: { id: 'guest', name: 'Guest Learner', email: 'guest@neurolearn.ai' },
        sessionId: null,
      }),

      // ── Preferences (synced to backend) ───────────────────────────────────
      preferences: {
        profile: 'default',        // default | dyslexia | adhd
        readingLevel: 'medium',    // easy | medium | advanced
        fontSize: 15,
        ttsSpeed: 1.0,
        sessionLengthMinutes: 20,
        highlightColor: 'purple',
        focusRulerEnabled: false,
        autoSimplifyOnInactivity: true,
        breakReminderEnabled: true,
        darkMode: false,
        bionicReadingEnabled: false,
        sensoryTint: null,
      },
      setPreferences: (prefs) =>
        set(s => ({ preferences: { ...s.preferences, ...prefs } })),
      setPref: (key, val) =>
        set(s => ({ preferences: { ...s.preferences, [key]: val } })),

      // ── Active Learning Session ───────────────────────────────────────────
      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }),

      // ── Text Content ─────────────────────────────────────────────────────
      originalText: '',
      currentText: '',
      transformedContent: null,   // { type, content | bullets | chunks, keywords, actions }
      transformType: 'raw',       // raw | summarize | simplify | bullets | chunk | keywords
      setOriginalText: (t) => set({ originalText: t, currentText: t, transformedContent: null, transformType: 'raw' }),
      setTransformedContent: (content, type) =>
        set({ transformedContent: content, transformType: type }),
      resetTransform: () =>
        set(s => ({ transformedContent: null, transformType: 'raw', currentText: s.originalText })),

      // ── Focus & Timer ─────────────────────────────────────────────────────
      timerRunning: false,
      timerSeconds: 20 * 60,
      timerMaxSeconds: 20 * 60,
      setTimerRunning: (v) => set({ timerRunning: v }),
      setTimerSeconds: (v) => set({ timerSeconds: v }),
      setTimerMax: (v) => set({ timerMaxSeconds: v }),

      focusRulerLine: 0,
      setFocusRulerLine: (n) => set({ focusRulerLine: n }),

      // ── Attention & Webcam ────────────────────────────────────────────────
      camActive: false,
      attentionScore: 0,
      setCamActive: (v) => set({ camActive: v }),
      setAttentionScore: (v) => set({ attentionScore: v }),

      // ── TTS / Mic ─────────────────────────────────────────────────────────
      ttsActive: false,
      micActive: false,
      setTtsActive: (v) => set({ ttsActive: v }),
      setMicActive: (v) => set({ micActive: v }),
      lastVoiceCommand: '',
      setLastVoiceCommand: (cmd) => set({ lastVoiceCommand: cmd }),

      // ── Nudges ────────────────────────────────────────────────────────────
      nudges: [],
      addNudge: (nudge) =>
        set(s => ({ nudges: [nudge, ...s.nudges].slice(0, 20) })),
      clearNudges: () => set({ nudges: [] }),

      // ── Progress (local, synced periodically) ────────────────────────────
      progress: {
        totalSessions: 0,
        totalWordsRead: 0,
        totalFocusMinutes: 0,
        averageFocusScore: 0,
        currentStreak: 0,
        passagesCompleted: 0,
        transformsUsed: {},
      },
      setProgress: (p) => set({ progress: p }),

      // ── Session Stats (current session) ───────────────────────────────────
      sessionStats: {
        wordsRead: 0,
        focusScore: 0,
        transformsUsed: {},
      },
      updateSessionStats: (updates) =>
        set(s => ({ sessionStats: { ...s.sessionStats, ...updates } })),
      resetSessionStats: () =>
        set({ sessionStats: { wordsRead: 0, focusScore: 0, transformsUsed: {} } }),
    }),
    {
      name: 'neurolearn-storage',
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        preferences: s.preferences,
        progress: s.progress,
      }),
    }
  )
);
