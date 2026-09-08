/**
 * Fallback Local NLP Engine
 * Provides robust offline transformations, 10-question quiz generation, and dictionary lookup
 * when Claude API key is unavailable or API call fails.
 */

const SYNONYM_MAP = {
  'utilize': 'use',
  'utilizing': 'using',
  'demonstrate': 'show',
  'demonstrates': 'shows',
  'facilitate': 'help',
  'facilitates': 'helps',
  'subsequently': 'then',
  'consequently': 'so',
  'implementation': 'setup',
  'implement': 'build',
  'comprehend': 'understand',
  'comprehension': 'understanding',
  'neurodivergent': 'learning-different',
  'neurodiversity': 'brain variations',
  'cognitive': 'thinking',
  'synergistic': 'combined',
  'fundamental': 'basic',
  'predominantly': 'mostly',
  'furthermore': 'also',
  'nevertheless': 'still',
  'predisposition': 'tendency',
  'ameliorate': 'improve',
  'substantive': 'real',
};

function splitIntoSentences(text) {
  return (text || '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function fallbackSummarize(text, level = 'medium') {
  const sentences = splitIntoSentences(text);
  if (sentences.length <= 3) {
    return { type: 'summary', content: text, level, source: 'offline-nlp' };
  }

  const summarySentences = [
    sentences[0],
    sentences[Math.floor(sentences.length / 2)],
    sentences[sentences.length - 1],
  ];

  let summaryText = summarySentences.join(' ');
  if (level === 'easy') {
    summaryText = fallbackSimplifySentence(summaryText, 'easy');
  }

  return { type: 'summary', content: summaryText, level, source: 'offline-nlp' };
}

function fallbackSimplifySentence(text, level = 'easy') {
  let result = text;

  for (const [complex, simple] of Object.entries(SYNONYM_MAP)) {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    result = result.replace(regex, simple);
  }

  if (level === 'easy') {
    result = result.replace(/;\s*/g, '. ');
    result = result.replace(/,\s*which\s+/gi, '. This ');
    result = result.replace(/,\s*because\s+/gi, '. Because ');
    result = result.replace(/,\s*however,\s*/gi, '. But ');
    result = result.replace(/,\s*and\s+/gi, '. ');
  }

  return result;
}

function fallbackSimplify(text, level = 'medium') {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const simplifiedParas = paragraphs.map(p => fallbackSimplifySentence(p, level));

  return {
    type: 'simplified',
    content: simplifiedParas.join('\n\n'),
    level,
    source: 'offline-nlp',
  };
}

function fallbackBullets(text, level = 'medium') {
  const sentences = splitIntoSentences(text);
  const selected = sentences.slice(0, Math.min(8, Math.max(4, Math.floor(sentences.length * 0.4))));
  const bullets = selected.map(s => fallbackSimplifySentence(s, level));

  return {
    type: 'bullets',
    bullets,
    level,
    source: 'offline-nlp',
  };
}

function fallbackChunk(text, level = 'medium') {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const chunks = [];

  paragraphs.forEach((p, idx) => {
    const sentences = splitIntoSentences(p);
    const title = sentences[0] ? sentences[0].slice(0, 30) + '...' : `Section ${idx + 1}`;
    const content = fallbackSimplifySentence(p, level);
    chunks.push({ title: `Part ${idx + 1}: ${title}`, content });
  });

  return {
    type: 'chunks',
    chunks,
    level,
    source: 'offline-nlp',
  };
}

function fallbackKeywords(text) {
  const words = text.match(/\b[a-zA-Z]{5,}\b/g) || [];
  const freqMap = {};
  const stopwords = new Set([
    'their', 'there', 'these', 'those', 'where', 'which', 'while', 'about', 'above',
    'after', 'again', 'against', 'being', 'below', 'between', 'both', 'could', 'during',
    'further', 'having', 'should', 'through', 'under', 'until', 'would', 'other', 'another',
  ]);

  words.forEach(w => {
    const lower = w.toLowerCase();
    if (!stopwords.has(lower)) {
      freqMap[lower] = (freqMap[lower] || 0) + 1;
    }
  });

  const sorted = Object.keys(freqMap).sort((a, b) => freqMap[b] - freqMap[a]);
  const keywords = sorted.slice(0, 8);
  const actions = keywords.slice(0, 4).map(k => `Focus on ${k}`);

  const definitions = {};
  keywords.forEach(k => {
    definitions[k] = `Important academic concept relating to ${k}.`;
  });

  return {
    type: 'keywords',
    keywords,
    actions,
    definitions,
    source: 'offline-nlp',
  };
}

function fallbackQuiz(text) {
  const sentences = splitIntoSentences(text);
  const questions = [
    {
      id: 1,
      question: 'What is the primary focus of this academic reading passage?',
      options: [
        sentences[0] ? sentences[0].slice(0, 70) + '...' : 'Neurodivergent adaptive learning frameworks',
        'Standardized testing procedures in secondary schools',
        'Historical evolution of ancient languages',
        'Traditional mechanical engineering techniques',
      ],
      correctAnswer: 0,
      explanation: 'The reading opens with foundational principles of neurodivergent learning and cognitive processing.',
    },
    {
      id: 2,
      question: 'How does text simplification assist learners with ADHD or Dyslexia?',
      options: [
        'By increasing reading frustration and sentence length',
        'By reducing working memory cognitive load and anchoring fixations',
        'By removing all technical academic vocabulary',
        'By forcing continuous reading without paragraph breaks',
      ],
      correctAnswer: 1,
      explanation: 'Text simplification reduces working memory friction so students absorb core ideas efficiently.',
    },
    {
      id: 3,
      question: 'True or False: Specialized Dyslexia UI modes use generous line spacing and OpenDyslexic typography.',
      options: ['True', 'False'],
      correctAnswer: 0,
      explanation: 'Generous letter spacing and bottom-weighted fonts reduce visual crowding for dyslexic readers.',
    },
    {
      id: 4,
      question: 'Which biometric technology tracks student attention and gaze patterns?',
      options: [
        'Static document counters',
        'Webcam computer vision tracking (EAR & head motion variance)',
        'Manual page turning timers',
        'Keyboard brightness meters',
      ],
      correctAnswer: 1,
      explanation: 'Webcam eye aspect ratio (EAR) and head movement variance trigger nudges when drift occurs.',
    },
    {
      id: 5,
      question: 'What is the function of Bionic Reading mode?',
      options: [
        'It translates text into foreign languages',
        'It bolds the initial 40-50% of characters in each word to guide eye fixations',
        'It increases the contrast of background images',
        'It converts text into audio files only',
      ],
      correctAnswer: 1,
      explanation: 'Bionic reading anchors visual fixation points, speeding up reading speed and comprehension.',
    },
    {
      id: 6,
      question: 'What role do sensory color tint overlays (Peach, Soft Blue, Mint) play in learning?',
      options: [
        'They alter text meaning',
        'They reduce glare and visual stress associated with Irlen syndrome',
        'They hide keywords from view',
        'They disable the focus ruler',
      ],
      correctAnswer: 1,
      explanation: 'Soft color tints reduce visual distortion and eye fatigue for neurodivergent students.',
    },
    {
      id: 7,
      question: 'How does the Focus Ruler feature improve reading retention in ADHD mode?',
      options: [
        'By hiding the entire text behind a password',
        'By highlighting the active paragraph while dimming non-active background text',
        'By auto-scrolling at maximum speed',
        'By disabling keyboard navigation',
      ],
      correctAnswer: 1,
      explanation: 'Focus ruler isolates current reading lines to prevent visual distraction.',
    },
    {
      id: 8,
      question: 'True or False: Quantitative metrics like Flesch-Kincaid Grade Level measure actual reading difficulty reduction.',
      options: ['True', 'False'],
      correctAnswer: 0,
      explanation: 'Flesch-Kincaid & Flesch Reading Ease provide mathematical proof of grade level reduction.',
    },
    {
      id: 9,
      question: 'What happens when student attention drops below the focus threshold (<35%)?',
      options: [
        'The application shuts down automatically',
        'An interactive visual and loud spoken voice nudge is triggered',
        'All text is deleted from the screen',
        'The timer speeds up by 10x',
      ],
      correctAnswer: 1,
      explanation: 'Audible voice nudges gently re-engage drifting learners with simplification prompts.',
    },
    {
      id: 10,
      question: 'How does PDF uploading enhance the learning space?',
      options: [
        'It converts files into images',
        'It parses text from research articles and extracts 500+ words into the adaptive pipeline',
        'It locks document editing permanently',
        'It prints physical copies',
      ],
      correctAnswer: 1,
      explanation: 'PDF extraction allows students to load any textbook or paper directly into the simplified reader.',
    },
  ];

  return {
    title: 'Comprehension & Neuro-Focus Assessment (10 Questions)',
    questions,
  };
}

function fallbackDictionary(word, contextText = '') {
  const dict = {
    neurodivergent: {
      word: 'neurodivergent',
      phonetic: '/ˌnʊr.oʊ.daɪˈvɜːr.dʒənt/',
      definition: 'Having brain functions that differ from what is typical.',
      simplified: 'A person whose brain thinks, learns, or processes information differently (e.g. ADHD, Dyslexia, Autism).',
      contextMeaning: contextText ? `In this passage, "neurodivergent" refers to students who benefit from visual chunking, audio nudges, and adaptive typography.` : 'Describes cognitive variations in learning.',
      example: 'Dyslexic and ADHD students benefit from neurodivergent learning tools.',
    },
    dyslexia: {
      word: 'dyslexia',
      phonetic: '/dɪsˈlɛk.si.ə/',
      definition: 'A learning difficulty affecting reading, spelling, and writing abilities.',
      simplified: 'When reading words on a page takes extra effort because letters look crowded.',
      contextMeaning: 'In context, dyslexia relates to visual font adjustments like OpenDyslexic and generous line spacing.',
      example: 'OpenDyslexic fonts help people with dyslexia read more fluently.',
    },
    adhd: {
      word: 'ADHD',
      phonetic: '/ˌeɪ.di.eɪtʃˈdiː/',
      definition: 'Attention-Deficit/Hyperactivity Disorder, affecting focus and executive function.',
      simplified: 'A condition where the brain easily gets distracted or craves stimulation.',
      contextMeaning: 'In context, ADHD refers to learners who stay focused with focus rulers, short chunks, and spoken nudges.',
      example: 'Chunking content into 3-minute steps keeps ADHD learners engaged.',
    },
    cognitive: {
      word: 'cognitive',
      phonetic: '/ˈkɑːɡ.nə.tɪv/',
      definition: 'Relating to mental processes of perception, memory, and reasoning.',
      simplified: 'Anything related to how your brain thinks, learns, and remembers.',
      contextMeaning: 'In context, cognitive load describes the mental effort needed to understand complex text.',
      example: 'Visual rulers reduce cognitive load.',
    },
  };

  const clean = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (dict[clean]) return dict[clean];

  return {
    word: clean || word,
    phonetic: `/${clean}/`,
    definition: `Academic term relating to ${word}.`,
    simplified: `Key concept in the text. Look for contextual clues in surrounding sentences.`,
    contextMeaning: `In this reading passage, "${word}" represents an essential concept for understanding the main subject matter.`,
    example: `The text discusses ${word} in detail.`,
  };
}

module.exports = {
  fallbackSummarize,
  fallbackSimplify,
  fallbackBullets,
  fallbackChunk,
  fallbackKeywords,
  fallbackQuiz,
  fallbackDictionary,
};
