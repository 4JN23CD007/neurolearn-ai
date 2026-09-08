import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { useAppStore } from '../context/store';
import { transformAPI } from '../services/api';
import { userAPI } from '../services/api';
import { cx } from '../utils/helpers';
import toast from 'react-hot-toast';

const LEVELS = [
  { id: 'easy',     label: 'Easy',     desc: 'Grade 5' },
  { id: 'medium',   label: 'Medium',   desc: 'Grade 9' },
  { id: 'advanced', label: 'Advanced', desc: 'University' },
];

const COLORS = {
  easy:     'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700',
  medium:   'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
  advanced: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
};

export default function ReadingLevelSelector() {
  const { preferences, setPref, originalText, setTransformedContent, transformType } = useAppStore();
  const [loading, setLoading] = useState(false);

  async function selectLevel(level) {
    setPref('readingLevel', level);
    try { await userAPI.updatePrefs({ readingLevel: level }); } catch {}

    // If text is loaded and a transform is active, re-adapt to new level
    if (originalText && transformType !== 'raw') {
      setLoading(true);
      try {
        const { data } = await transformAPI.level(originalText, level);
        setTransformedContent(data, 'adapted');
        toast.success(`Adapted to ${level} level`);
      } catch {
        toast.error('Could not adapt level right now.');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-2">Reading level</p>
      <div className="flex gap-1.5">
        {LEVELS.map(({ id, label, desc }) => {
          const isActive = preferences.readingLevel === id;
          return (
            <button
              key={id}
              onClick={() => selectLevel(id)}
              disabled={loading}
              className={cx(
                'flex-1 py-2 rounded-lg border text-center text-xs font-medium transition-all',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                  ? COLORS[id]
                  : 'border-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              )}
            >
              {loading && isActive
                ? <Loader size={11} className="animate-spin mx-auto" />
                : <>
                    <div>{label}</div>
                    <div className="text-[10px] opacity-70">{desc}</div>
                  </>
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}
