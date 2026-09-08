/**
 * Readability Metric Calculation Engine
 * Calculates deterministic readability metrics:
 * - Flesch Reading Ease (FRE)
 * - Flesch-Kincaid Grade Level (FKGL)
 * - Gunning Fog Index
 * - Automated Readability Index (ARI)
 */

function countSyllables(word) {
  word = word.toLowerCase().trim().replace(/(?:[^laeiouy]|ed|es|e)$/i, '');
  word = word.replace(/^y/i, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function analyzeTextMetrics(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      syllablesCount: 0,
      complexWordsCount: 0,
      characterCount: 0,
      fleschReadingEase: 100,
      fleschKincaidGrade: 0,
      gunningFog: 0,
      ari: 0,
      difficultyLabel: 'Unknown',
    };
  }

  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = rawWords.length;
  if (wordCount === 0) {
    return analyzeTextMetrics('');
  }

  // Count sentences
  const sentenceMatches = text.match(/[^.!?]+[.!?]+/g) || [text];
  const sentenceCount = Math.max(1, sentenceMatches.length);

  let syllablesCount = 0;
  let complexWordsCount = 0;
  let characterCount = 0;

  for (const rawWord of rawWords) {
    const cleanWord = rawWord.replace(/[^a-zA-Z]/g, '');
    characterCount += cleanWord.length;
    if (cleanWord.length === 0) continue;

    const syl = countSyllables(cleanWord);
    syllablesCount += syl;
    if (syl >= 3) {
      complexWordsCount++;
    }
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllablesCount / wordCount;
  const charsPerWord = characterCount / wordCount;

  // Flesch Reading Ease
  let fre = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  fre = Math.max(0, Math.min(100, Math.round(fre * 10) / 10));

  // Flesch-Kincaid Grade Level
  let fkgl = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
  fkgl = Math.max(1, Math.round(fkgl * 10) / 10);

  // Gunning Fog
  let fog = 0.4 * (wordsPerSentence + (100 * (complexWordsCount / wordCount)));
  fog = Math.max(1, Math.round(fog * 10) / 10);

  // ARI
  let ari = (4.71 * charsPerWord) + (0.5 * wordsPerSentence) - 21.43;
  ari = Math.max(1, Math.round(ari * 10) / 10);

  // Label
  let label = 'Easy (Elementary)';
  if (fkgl >= 13) label = 'Advanced (University)';
  else if (fkgl >= 9) label = 'Medium (High School)';
  else if (fkgl >= 6) label = 'Easy-Medium (Middle School)';

  return {
    wordCount,
    sentenceCount,
    syllablesCount,
    complexWordsCount,
    characterCount,
    fleschReadingEase: fre,
    fleschKincaidGrade: fkgl,
    gunningFog: fog,
    ari,
    difficultyLabel: label,
  };
}

function compareReadability(originalText, transformedText) {
  const orig = analyzeTextMetrics(originalText);
  const trans = analyzeTextMetrics(transformedText);

  const gradeDiff = Math.round((orig.fleschKincaidGrade - trans.fleschKincaidGrade) * 10) / 10;
  const easeDiff = Math.round((trans.fleschReadingEase - orig.fleschReadingEase) * 10) / 10;
  const pctReduction = orig.fleschKincaidGrade > 0
    ? Math.max(0, Math.round(((orig.fleschKincaidGrade - trans.fleschKincaidGrade) / orig.fleschKincaidGrade) * 100))
    : 0;

  return {
    original: orig,
    transformed: trans,
    gradeLevelReduction: gradeDiff,
    readingEaseIncrease: easeDiff,
    complexityReductionPct: pctReduction,
  };
}

module.exports = {
  countSyllables,
  analyzeTextMetrics,
  compareReadability,
};
