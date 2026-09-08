import React, { useState, useCallback } from 'react';
import { FileText, RefreshCw, Loader, Coffee, HelpCircle, BookOpen, LogOut, Award } from 'lucide-react';
import { useAppStore } from '../context/store';
import { transformAPI, sessionAPI, nudgeAPI } from '../services/api';
import { SAMPLE_TEXTS } from '../utils/sampleTexts';
import { countWords, cx } from '../utils/helpers';
import ProfileSelector from '../components/ProfileSelector';
import ReadingLevelSelector from '../components/ReadingLevelSelector';
import Toolbar from '../components/Toolbar';
import ContentArea from '../components/ContentArea';
import VoicePanel from '../components/VoicePanel';
import FocusTimer from '../components/FocusTimer';
import AttentionPanel from '../components/AttentionPanel';
import NudgePanel from '../components/NudgePanel';
import QABar from '../components/QABar';
import PDFUploader from '../components/PDFUploader';
import QuizModal from '../components/QuizModal';
import DictionaryModal from '../components/DictionaryModal';
import ExitFeedbackModal from '../components/ExitFeedbackModal';
import toast from 'react-hot-toast';

export default function LearningPage() {
  const {
    originalText, preferences, transformType, sessionId,
    setOriginalText, setTransformedContent, resetTransform,
    setSessionId, addNudge, updateSessionStats, setFocusRulerLine, setPref,
  } = useAppStore();

  const [loading, setLoading]         = useState(false);
  const [loadingType, setLoadingType] = useState('');
  const [textInput, setTextInput]     = useState('');
  const [ttsActive, setTtsActive]     = useState(false);
  const [focusRuler, setFocusRuler]   = useState(false);

  // Modals state
  const [isQuizOpen, setIsQuizOpen]             = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [dictWord, setDictWord]                 = useState('');
  const [isExitFeedbackOpen, setIsExitFeedbackOpen] = useState(false);

  function loadSample500() {
    const t = SAMPLE_TEXTS.academic500;
    setTextInput(t);
    setOriginalText(t);
    startSession();
    toast.success('Loaded 500+ word academic neuroscience passage!');
  }

  function submitText() {
    if (textInput.trim().length < 50) return;
    setOriginalText(textInput.trim());
    resetTransform();
    startSession();
  }

  async function startSession() {
    try {
      const { data } = await sessionAPI.start({ lengthMinutes: preferences.sessionLengthMinutes });
      setSessionId(data.id);
    } catch {}
  }

  const handleTransform = useCallback(async (type) => {
    if (!originalText) return;
    if (type === transformType) { resetTransform(); return; }
    setLoading(true);
    setLoadingType(type);
    const level = preferences.readingLevel;
    try {
      let data;
      switch (type) {
        case 'summarize': ({ data } = await transformAPI.summarize(originalText, level)); break;
        case 'simplify':  ({ data } = await transformAPI.simplify(originalText, level));  break;
        case 'bullets':   ({ data } = await transformAPI.bullets(originalText, level));   break;
        case 'chunk':     ({ data } = await transformAPI.chunk(originalText, level));     break;
        case 'keywords':  ({ data } = await transformAPI.keywords(originalText));         break;
        default: return;
      }
      setTransformedContent(data, type);
      updateSessionStats({ transformsUsed: { [type]: 1 }, wordsRead: countWords(originalText) });
      if (sessionId) sessionAPI.update(sessionId, { wordsRead: countWords(originalText) }).catch(() => {});
    } catch (err) {
      console.error('Transform error:', err);
    } finally {
      setLoading(false);
      setLoadingType('');
    }
  }, [originalText, transformType, preferences.readingLevel, sessionId, resetTransform, setTransformedContent, updateSessionStats]);

  function handleVoiceCommand(intent) {
    const transforms = ['summarize', 'simplify', 'bullets', 'chunk', 'keywords'];
    if (transforms.includes(intent)) { handleTransform(intent); return; }
    if (intent === 'quiz') { setIsQuizOpen(true); return; }
    if (intent === 'dyslexia') { setPref('profile', 'dyslexia'); toast.success('Switched to Dyslexia mode'); return; }
    if (intent === 'adhd') { setPref('profile', 'adhd'); toast.success('Switched to ADHD mode'); return; }
    if (intent === 'bionic') { setPref('bionicReadingEnabled', !preferences.bionicReadingEnabled); return; }
    if (intent === 'next') {
      const levels = ['easy', 'medium', 'advanced'];
      const cur = levels.indexOf(preferences.readingLevel);
      setPref('readingLevel', levels[(cur + 1) % 3]);
      return;
    }
    if (['easy', 'medium', 'advanced'].includes(intent)) setPref('readingLevel', intent);
    if (intent === 'pause' || intent === 'stop') setTtsActive(false);
  }

  function toggleFocusRuler() {
    const next = !focusRuler;
    setFocusRuler(next);
    setPref('focusRulerEnabled', next);
    setFocusRulerLine(0);
  }

  function handleWordDoubleClick(word) {
    setDictWord(word);
    setIsDictionaryOpen(true);
  }

  async function takeBreak() {
    try {
      const { data } = await nudgeAPI.trigger('breakTime');
      addNudge(data);
    } catch {
      addNudge({ id: Date.now(), type: 'break', message: 'Great — take a 5-minute break!', trigger: 'manual', createdAt: new Date().toISOString() });
    }
  }

  function confirmExitSession() {
    setOriginalText('');
    setTextInput('');
    resetTransform();
    setIsExitFeedbackOpen(false);
    toast.success('Learning session completed!');
  }

  const wordCount = countWords(originalText);

  return (
    <div className="p-4 h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 bg-white/60 dark:bg-black/40 p-3 rounded-2xl border border-black/5 dark:border-white/5">
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🧠 NeuroLearn Learning Space
            {wordCount >= 500 && (
              <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-300/40">
                500+ Word Academic Passage Active
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {wordCount > 0 ? `${wordCount} words loaded · Multi-metric accuracy analysis active` : 'Paste text, load 500+ word academic sample, or upload PDF to begin'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {originalText && (
            <button
              onClick={() => setIsExitFeedbackOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300 transition-all shadow-xs"
            >
              <LogOut size={13} /> Complete Session
            </button>
          )}
          <button onClick={takeBreak} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 transition-all shadow-xs">
            <Coffee size={13} /> Take Break
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[210px_1fr_200px] gap-3.5 h-[calc(100vh-115px)]">

        {/* Left Sidebar */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-0.5">
          <div className="card"><ProfileSelector /></div>
          <div className="card"><ReadingLevelSelector /></div>
          <div className="card">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-2">Font size</p>
            <div className="flex items-center gap-2">
              <input type="range" min="12" max="24" step="1" value={preferences.fontSize}
                onChange={e => setPref('fontSize', Number(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 w-8 text-right">{preferences.fontSize}px</span>
            </div>
          </div>
          <FocusTimer />
          <NudgePanel />
        </div>

        {/* Main Content Workspace */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {!originalText ? (
            <div className="card flex-1 flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Input Academic Text or Upload PDF</h3>
                  <p className="text-xs text-gray-400">Transform complex reading materials into accessible, neuro-friendly layouts.</p>
                </div>
                <div className="flex items-center gap-2">
                  <PDFUploader onTextLoaded={() => startSession()} />
                  <button
                    onClick={loadSample500}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 transition-all"
                  >
                    <FileText size={13} /> Load 500+ Word Sample
                  </button>
                </div>
              </div>

              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Paste any academic text (minimum 500 words) here to transform sentence length, reading grade levels, bullet points, and attention highlights..."
                className="flex-1 resize-none text-sm p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ minHeight: '280px' }}
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-gray-400">
                  Word Count: <strong className={countWords(textInput) >= 500 ? 'text-emerald-600 font-bold' : 'text-purple-600'}>{countWords(textInput)}</strong> words
                </span>
                <button
                  onClick={submitText}
                  disabled={textInput.trim().length < 50}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white shadow-md hover:bg-purple-700 disabled:opacity-40 transition-all"
                >
                  Start Neuro-Learning Session →
                </button>
              </div>
            </div>
          ) : (
            <>
              <Toolbar
                activeTransform={transformType}
                onTransform={handleTransform}
                onToggleTTS={() => setTtsActive(v => !v)}
                onToggleFocusRuler={toggleFocusRuler}
                onOpenQuiz={() => setIsQuizOpen(true)}
                onOpenDictionary={() => setIsDictionaryOpen(true)}
                ttsActive={ttsActive}
                focusRulerActive={focusRuler}
                loading={loading}
              />

              {loading && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-sm text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 animate-fadeIn">
                  <Loader size={15} className="animate-spin text-purple-600" />
                  <span>Applying AI transformation ({loadingType}) with accuracy verification metrics...</span>
                </div>
              )}

              <div className="card flex-1 overflow-y-auto">
                <ContentArea onWordDoubleClick={handleWordDoubleClick} />
              </div>

              <QABar />

              <div className="flex justify-between items-center px-1">
                <button
                  onClick={() => { setOriginalText(''); setTextInput(''); resetTransform(); }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
                >
                  <RefreshCw size={12} /> Load New Academic Text
                </button>
                {transformType !== 'raw' && (
                  <button
                    onClick={resetTransform}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                  >
                    ↩ View Original Passage
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-0.5">
          <VoicePanel onCommand={handleVoiceCommand} />
          <AttentionPanel />
        </div>
      </div>

      {/* Modals */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        text={transformedContent?.content || originalText}
      />

      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        selectedWord={dictWord}
      />

      <ExitFeedbackModal
        isOpen={isExitFeedbackOpen}
        onClose={() => setIsExitFeedbackOpen(false)}
        onConfirmExit={confirmExitSession}
        sessionId={sessionId}
      />
    </div>
  );
}
