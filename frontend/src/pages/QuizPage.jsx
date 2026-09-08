import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Brain, BookOpen } from 'lucide-react';
import { transformAPI } from '../services/api';
import { useAppStore } from '../context/store';
import { SAMPLE_TEXTS } from '../utils/sampleTexts';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { originalText, progress, setProgress } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const activeText = originalText || SAMPLE_TEXTS.academic500;

  useEffect(() => {
    loadQuiz();
  }, [originalText]);

  async function loadQuiz() {
    setLoading(true);
    setCompleted(false);
    setScore(0);
    setCurrentIdx(0);
    setSelectedOption(null);
    setSubmitted(false);
    setUserAnswers({});
    try {
      const { data } = await transformAPI.quiz(activeText);
      setQuizData(data);
    } catch (err) {
      toast.error('Could not load quiz questions');
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerSelect(idx) {
    if (submitted) return;
    setSelectedOption(idx);
  }

  function handleCheckAnswer() {
    if (selectedOption === null) return;
    setSubmitted(true);
    const q = quizData.questions[currentIdx];
    const isCorrect = selectedOption === q.correctAnswer;
    setUserAnswers(prev => ({ ...prev, [currentIdx]: { selected: selectedOption, isCorrect } }));
    if (isCorrect) {
      setScore(s => s + 1);
    }
  }

  function handleNextQuestion() {
    if (currentIdx + 1 < quizData.questions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setCompleted(true);
      if (progress) {
        setProgress({
          ...progress,
          passagesCompleted: (progress.passagesCompleted || 0) + 1,
        });
      }
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Title Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-lg">
            <HelpCircle size={22} />
            <span>Layer 3: Dedicated Neuro-Focus Assessment Hub</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            10-Question Interactive Assessment derived from your active academic text or PDF upload.
          </p>
        </div>
        <button
          onClick={loadQuiz}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-all"
        >
          <RotateCcw size={13} /> Regenerate 10 Questions
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center card space-y-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Generating 10 Comprehensive Quiz Questions...</p>
          <p className="text-xs text-gray-400">Extracting core concepts from academic passage...</p>
        </div>
      ) : completed ? (
        <div className="card py-10 text-center space-y-5 animate-fadeIn">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award size={44} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Assessment Complete!</h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
              You scored <span className="font-extrabold text-purple-600 dark:text-purple-400 text-lg">{score}</span> / <span className="font-bold text-lg">{quizData?.questions?.length || 10}</span> ({Math.round((score / (quizData?.questions?.length || 10)) * 100)}%)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-lg mx-auto pt-2">
            {quizData?.questions?.map((q, idx) => {
              const res = userAnswers[idx];
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-xs text-center font-bold ${
                    res?.isCorrect
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
                >
                  Q{idx + 1}: {res?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={loadQuiz}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <RotateCcw size={15} /> Retake Assessment
            </button>
          </div>
        </div>
      ) : quizData && quizData.questions ? (
        <div className="card p-6 space-y-6">
          {/* Question Navigator */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            {quizData.questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIdx(idx); setSelectedOption(null); setSubmitted(false); }}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                  idx === currentIdx
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                    : userAnswers[idx]
                    ? userAnswers[idx].isCorrect
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Progress Info */}
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>Question {currentIdx + 1} of {quizData.questions.length}</span>
            <span>Current Score: {score}</span>
          </div>

          {/* Active Question */}
          {(() => {
            const q = quizData.questions[currentIdx];
            return (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {q.question}
                </h3>

                <div className="space-y-2.5">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === q.correctAnswer;

                    let btnStyle = 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 hover:border-purple-300';
                    if (isSelected) {
                      btnStyle = 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold';
                    }
                    if (submitted) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerSelect(i)}
                        disabled={submitted}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {submitted && isCorrect && <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />}
                        {submitted && isSelected && !isCorrect && <XCircle size={18} className="text-rose-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-purple-700 dark:text-purple-300">Explanation Rationale</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{q.explanation}</p>
                  </div>
                )}

                <div className="pt-3">
                  {!submitted ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedOption === null}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md"
                    >
                      Confirm & Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {currentIdx + 1 < quizData.questions.length ? 'Next Question' : 'View Final Quiz Summary'}
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}
