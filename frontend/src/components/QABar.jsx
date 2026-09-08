import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { transformAPI } from '../services/api';
import { useAppStore } from '../context/store';
import { cx } from '../utils/helpers';

export default function QABar() {
  const { originalText } = useAppStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!question.trim() || !originalText) return;
    setLoading(true);
    setAnswer('');
    try {
      const { data } = await transformAPI.qa(originalText, question.trim());
      setAnswer(data.answer);
    } catch {
      setAnswer('Sorry, I couldn\'t answer that right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={onKey}
          placeholder='Ask a question or type a command: "summarize", "what is neuroplasticity?"…'
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#1c1c1a] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700"
        />
        <button
          onClick={submit}
          disabled={loading || !question.trim()}
          className={cx(
            'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
            'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
            'disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-100 dark:hover:bg-purple-900/30'
          )}
        >
          {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>

      {answer && (
        <div className="mt-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed animate-slide-up">
          <span className="text-[11px] font-medium text-purple-500 dark:text-purple-400 block mb-1">AI Answer</span>
          {answer}
        </div>
      )}
    </div>
  );
}
