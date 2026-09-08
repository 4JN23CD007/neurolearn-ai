/**
 * Client-Side Readability Calculator
 */

export function countSyllablesClient(word) {
  word = word.toLowerCase().trim().replace(/(?:[^laeiouy]|ed|es|e)$/i, '');
  word = word.replace(/^y/i, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function calcReadabilityMetrics(text) {
  if (!text || !text.trim()) {
    return { wordCount: 0, fkgl: 0, fre: 100, label: 'N/A' };
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = Math.max(1, (text.match(/[^.!?]+[.!?]+/g) || [text]).length);

  let totalSyllables = 0;
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z]/g, '');
    if (clean) totalSyllables += countSyllablesClient(clean);
  }

  const wps = wordCount / sentences;
  const spw = totalSyllables / Math.max(1, wordCount);

  let fkgl = (0.39 * wps) + (11.8 * spw) - 15.59;
  fkgl = Math.max(1, Math.round(fkgl * 10) / 10);

  let fre = 206.835 - (1.015 * wps) - (84.6 * spw);
  fre = Math.max(0, Math.min(100, Math.round(fre * 10) / 10));

  let label = 'Easy';
  if (fkgl >= 12) label = 'Advanced (College)';
  else if (fkgl >= 8) label = 'Medium (High School)';
  else if (fkgl >= 5) label = 'Easy (Middle School)';

  return {
    wordCount,
    sentenceCount: sentences,
    fkgl,
    fre,
    label,
  };
}
