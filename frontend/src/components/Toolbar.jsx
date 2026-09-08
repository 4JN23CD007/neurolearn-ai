import React from 'react';
import {
  AlignLeft, List, Zap, Scissors, Tag, Volume2, Focus,
  Eye, BookOpen, HelpCircle, Palette
} from 'lucide-react';
import { cx } from '../utils/helpers';
import PDFUploader from './PDFUploader';
import { useAppStore } from '../context/store';

const TOOLS = [
  { id: 'summarize', icon: AlignLeft,  label: 'Summarize' },
  { id: 'simplify',  icon: Scissors,   label: 'Simplify'  },
  { id: 'bullets',   icon: List,       label: 'Bullets'   },
  { id: 'chunk',     icon: Zap,        label: 'Chunk'     },
  { id: 'keywords',  icon: Tag,        label: 'Keywords'  },
];

export default function Toolbar({
  activeTransform,
  onTransform,
  onToggleTTS,
  onToggleFocusRuler,
  onOpenQuiz,
  onOpenDictionary,
  ttsActive,
  focusRulerActive,
  loading,
}) {
  const { preferences, setPref } = useAppStore();

  function handleBionicToggle() {
    setPref('bionicReadingEnabled', !preferences.bionicReadingEnabled);
  }

  function handleSensoryTintChange(e) {
    const val = e.target.value;
    setPref('sensoryTint', val === 'none' ? null : val);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white dark:bg-[#1c1c1a] rounded-xl border border-black/[0.07] dark:border-white/[0.07] shadow-xs">
      {TOOLS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTransform(id)}
          disabled={loading}
          className={cx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            activeTransform === id
              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 font-semibold'
              : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5'
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}

      <div className="w-px h-5 bg-black/[0.07] dark:bg-white/[0.07] mx-0.5 hidden sm:block" />

      {/* PDF Upload */}
      <PDFUploader />

      {/* Bionic Reading Toggle */}
      <button
        onClick={handleBionicToggle}
        className={cx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all',
          preferences.bionicReadingEnabled
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700 font-semibold'
            : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
        )}
        title="Bold initial letters of words to anchor fixations for faster reading"
      >
        <Eye size={13} />
        Bionic {preferences.bionicReadingEnabled ? 'On' : 'Off'}
      </button>

      {/* Sensory Tint Selection */}
      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
        <Palette size={12} className="text-gray-400" />
        <select
          value={preferences.sensoryTint || 'none'}
          onChange={handleSensoryTintChange}
          className="bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
        >
          <option value="none">No Tint</option>
          <option value="peach">Peach Tint</option>
          <option value="softBlue">Soft Blue Tint</option>
          <option value="mint">Mint Tint</option>
          <option value="solarized">Solarized Tint</option>
        </select>
      </div>

      <div className="w-px h-5 bg-black/[0.07] dark:bg-white/[0.07] mx-0.5 hidden sm:block" />

      {/* Interactive Quiz Trigger */}
      <button
        onClick={onOpenQuiz}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 transition-all"
      >
        <HelpCircle size={13} />
        Take Quiz
      </button>

      {/* Dictionary Lookup */}
      <button
        onClick={onOpenDictionary}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700 transition-all"
      >
        <BookOpen size={13} />
        Dictionary
      </button>

      {/* TTS Read Aloud */}
      <button
        onClick={onToggleTTS}
        className={cx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all',
          ttsActive
            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 font-semibold'
            : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
        )}
      >
        <Volume2 size={13} />
        {ttsActive ? 'Stop Reading' : 'Read Aloud'}
      </button>

      {/* Focus Ruler */}
      <button
        onClick={onToggleFocusRuler}
        className={cx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all',
          focusRulerActive
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 font-semibold'
            : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
        )}
      >
        <Focus size={13} />
        Focus Ruler
      </button>
    </div>
  );
}
