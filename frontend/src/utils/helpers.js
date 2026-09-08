// ── Text utilities ────────────────────────────────────────────────────────────

export function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(text, wpm = 200) {
  const words = countWords(text);
  const minutes = Math.ceil(words / wpm);
  return minutes;
}

/**
 * Inject keyword and action HTML highlights into plain text.
 * Returns a string of HTML (safe for dangerouslySetInnerHTML).
 */
export function applyHighlights(text, keywords = [], actions = []) {
  let html = escapeHtml(text);
  // Actions first (longer phrases)
  actions.forEach(a => {
    const re = new RegExp(`(${escapeRegex(a)})`, 'gi');
    html = html.replace(re, '<span class="action-highlight">$1</span>');
  });
  keywords.forEach(k => {
    const re = new RegExp(`\\b(${escapeRegex(k)})\\b`, 'gi');
    html = html.replace(re, '<span class="kw-highlight">$1</span>');
  });
  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Class helpers ─────────────────────────────────────────────────────────────
export function cx(...args) {
  return args.filter(Boolean).join(' ');
}

// ── Level colors ──────────────────────────────────────────────────────────────
export const LEVEL_COLORS = {
  easy:     'bg-teal-50 text-teal-600 border-teal-200',
  medium:   'bg-purple-50 text-purple-600 border-purple-200',
  advanced: 'bg-amber-50 text-amber-600 border-amber-200',
};

export const PROFILE_COLORS = {
  default:  'bg-blue-50 text-blue-600',
  dyslexia: 'bg-purple-50 text-purple-600',
  adhd:     'bg-teal-50 text-teal-600',
};
