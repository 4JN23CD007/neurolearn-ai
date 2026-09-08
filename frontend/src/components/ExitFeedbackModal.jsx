import React, { useState } from 'react';
import { Star, Heart, Check, X, MessageSquare } from 'lucide-react';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ExitFeedbackModal({ isOpen, onClose, onConfirmExit, sessionId }) {
  const [readabilityRating, setReadabilityRating] = useState(5);
  const [focusRating, setFocusRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await sessionAPI.submitFeedback({
        sessionId,
        readabilityRating,
        focusRating,
        comments,
      });
      setSubmitted(true);
      toast.success('Thank you for your learning feedback!');
      setTimeout(() => {
        onConfirmExit();
      }, 1000);
    } catch (err) {
      onConfirmExit();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border border-purple-500/20 shadow-2xl p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
            <Heart size={20} className="text-rose-500" />
            <span>Before You Leave...</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check size={24} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Feedback Saved!</h4>
            <p className="text-xs text-gray-500">Your inputs help us adapt your learning preferences automatically.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              How did this simplified learning experience feel for your brain today?
            </p>

            {/* Readability rating */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Text Readability & Ease (1-5 stars):
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReadabilityRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={20}
                      className={star <= readabilityRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Focus retention rating */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Focus Retention & Distraction Reduction (1-5 stars):
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFocusRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={20}
                      className={star <= focusRating ? 'text-purple-500 fill-purple-500' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <MessageSquare size={12} /> Suggestions or Comments:
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What could make your reading experience even better?"
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onConfirmExit}
                className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Skip & Leave
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-xl transition-all shadow-md"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
