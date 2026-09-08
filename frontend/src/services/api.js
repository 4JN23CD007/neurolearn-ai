import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 35000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage automatically
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('neurolearn-storage');
    if (raw) {
      const data = JSON.parse(raw);
      const token = data?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Graceful error handling without hard page redirects if 401 on optional auth
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  guest:    ()     => api.post('/auth/guest'),
};

// ── Transform ────────────────────────────────────────────────────────────────
export const transformAPI = {
  summarize:    (text, level)     => api.post('/transform/summarize', { text, level }),
  simplify:     (text, level)     => api.post('/transform/simplify',  { text, level }),
  bullets:      (text, level)     => api.post('/transform/bullets',   { text, level }),
  chunk:        (text, level)     => api.post('/transform/chunk',     { text, level }),
  keywords:     (text)            => api.post('/transform/keywords',  { text }),
  level:        (text, level)     => api.post('/transform/level',     { text, level }),
  qa:           (text, question)  => api.post('/transform/qa',        { text, question }),
  voiceCommand: (text, command)   => api.post('/transform/voice-command', { text, command }),
  quiz:         (text)            => api.post('/transform/quiz',      { text }),
  dictionary:   (word)            => api.post('/transform/dictionary', { word }),
  metrics:      (text)            => api.post('/transform/metrics',   { text }),
  uploadPDF:    (formData)        => api.post('/transform/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  me:              ()       => api.get('/user/me'),
  getPreferences:  ()       => api.get('/user/preferences'),
  updatePrefs:     (data)   => api.put('/user/preferences', data),
  getProgress:     ()       => api.get('/user/progress'),
  recordSession:   (data)   => api.post('/user/progress/record', data),
};

// ── Sessions ─────────────────────────────────────────────────────────────────
export const sessionAPI = {
  start:          (data)     => api.post('/session/start', data),
  get:            (id)       => api.get(`/session/${id}`),
  update:         (id, data) => api.put(`/session/${id}`, data),
  end:            (id)       => api.post(`/session/${id}/end`),
  list:           ()         => api.get('/session'),
  submitFeedback: (data)     => api.post('/session/feedback', data),
};

// ── Nudges ───────────────────────────────────────────────────────────────────
export const nudgeAPI = {
  trigger: (trigger) => api.post('/nudge', { trigger }),
  list:    (limit)   => api.get(`/nudge?limit=${limit || 10}`),
};

export default api;
