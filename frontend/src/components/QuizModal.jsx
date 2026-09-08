import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, X } from 'lucide-react';
import { transformAPI } from '../services/api';
import { useAppStore } from '../context/store';
import toast from 'react-hot-toast';

export default function QuizModal({ isOpen, onClose, text }) {
  const { progress, setProgress } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  React.useEffect(() => {
    if (isOpen && text && !quizData) {
      loadQuiz();
    }
  }, [isOpen, text]);

  async function loadQuiz() {
    setLoading(true);
    setCompleted(false);
    setScore(0);
    setCurrentIdx(0);
    setSelectedOption(null);
    setSubmitted(false);
    try {
      const { data } = await transformAPI.quiz(text);
      setQuizData(data);
    } catch (err) {
      toast.error('Failed to load comprehension quiz');
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
    if (selectedOption === q.correctAnswer) {
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
      // Log completed quiz stats
      if (progress) {
        setProgress({
          ...progress,
          passagesCompleted: (progress.passagesCompleted || 0) + 1,
        });
      }
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full border border-purple-500/20 shadow-2xl p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
            <HelpCircle size={20} />
            <span>Neuro-Friendly Comprehension Quiz</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span>Generating personalized questions from your simplified text...</span>
          </div>
        ) : completed ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Award size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Completed!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You scored <span className="font-bold text-purple-600 dark:text-purple-400">{score}</span> out of{' '}
              <span className="font-bold">{quizData?.questions?.length}</span>!
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={loadQuiz}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-200 flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Retake Quiz
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700"
              >
                Back to Reading
              </button>
            </div>
          </div>
        ) : quizData && quizData.questions ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
              <span>Question {currentIdx + 1} of {quizData.questions.length}</span>
              <span>Score: {score}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / quizData.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            {(() => {
              const q = quizData.questions[currentIdx];
              return (
                <div className="space-y-4 pt-1">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
                    {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = i === q.correctAnswer;

                      let btnStyle = 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 hover:border-purple-300';
                      if (isSelected) {
                        btnStyle = 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-medium';
                      }
                      if (submitted) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-medium';
                        }
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswerSelect(i)}
                          disabled={submitted}
                          className={`w-full text-left p-3 text-xs sm:text-sm rounded-xl border transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {submitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />}
                          {submitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {submitted && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-purple-700 dark:text-purple-300">Explanation</p>
                      <p className="text-gray-700 dark:text-gray-300">{q.explanation}</p>
                    </div>
                  )}

                  {/* Action button */}
                  <div className="pt-2">
                    {!submitted ? (
                      <button
                        onClick={handleCheckAnswer}
                        disabled={selectedOption === null}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-xl transition-all"
                      >
                        {currentIdx + 1 < quizData.questions.length ? 'Next Question →' : 'See Final Results'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
