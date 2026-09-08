/**
 * Bionic Reading Formatter
 * Bolds the initial 40-50% of letters in every word to anchor visual fixation points.
 */

export function bionicFormat(text) {
  if (!text || typeof text !== 'string') return '';

  return text.split(/(\s+)/).map(token => {
    // If white space or non-alphanumeric, return as is
    if (/^\s+$/.test(token) || !/[a-zA-Z0-9]/.test(token)) {
      return escapeHtml(token);
    }

    const letters = token.split('');
    const len = letters.length;
    // Calculate fixation length (approx 40-50%)
    const boldLen = len <= 3 ? 1 : Math.ceil(len * 0.45);

    const boldPart = escapeHtml(token.slice(0, boldLen));
    const restPart = escapeHtml(token.slice(boldLen));

    return `<b class="font-extrabold text-gray-900 dark:text-white tracking-normal">${boldPart}</b><span>${restPart}</span>`;
  }).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
