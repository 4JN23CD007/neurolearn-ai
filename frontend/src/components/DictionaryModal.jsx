import React, { useState } from 'react';
import { BookOpen, Volume2, X, Search, Sparkles } from 'lucide-react';
import { transformAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function DictionaryModal({ isOpen, onClose, selectedWord = '' }) {
  const [word, setWord] = useState(selectedWord);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    if (selectedWord) {
      setWord(selectedWord);
      handleLookup(selectedWord);
    }
  }, [selectedWord]);

  async function handleLookup(termToSearch) {
    const term = (termToSearch || word).trim();
    if (!term) return;
    setLoading(true);
    try {
      const { data } = await transformAPI.dictionary(term);
      setResult(data);
    } catch (err) {
      toast.error('Could not fetch dictionary entry');
    } finally {
      setLoading(false);
    }
  }

  function speakWord() {
    if (!result?.word) return;
    const utterance = new SpeechSynthesisUtterance(result.word);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border border-purple-500/20 shadow-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold">
            <BookOpen size={18} />
            <span>Interactive Neuro-Dictionary</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Type or select a word..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg transition-all flex items-center gap-1.5"
          >
            <Search size={14} />
            Lookup
          </button>
        </div>

        {/* Result */}
        {loading ? (
          <div className="py-8 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span>Fetching plain-English definition...</span>
          </div>
        ) : result ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{result.word}</h3>
                <span className="text-xs text-purple-500 font-mono">{result.phonetic}</span>
              </div>
              <button
                onClick={speakWord}
                className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-all"
                title="Pronounce Word"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div className="bg-purple-50/50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide flex items-center gap-1 mb-1">
                <Sparkles size={12} /> Neuro-Friendly Explanation
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                {result.simplified || result.definition}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase mb-1">Standard Definition</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {result.definition}
              </p>
            </div>

            {result.example && (
              <div className="border-l-2 border-teal-400 pl-3 py-1">
                <p className="text-[11px] text-gray-400 font-medium">Example Usage</p>
                <p className="text-xs italic text-gray-700 dark:text-gray-300">"{result.example}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-gray-400">
            Double click any word in the text or type a word above to see its simplified definition.
          </div>
        )}
      </div>
    </div>
  );
}
