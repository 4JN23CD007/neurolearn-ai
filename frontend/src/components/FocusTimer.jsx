import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { cx } from '../utils/helpers';

export default function FocusTimer() {
  const { timeLabel, progress, start, pause, reset, timerRunning } = useFocusTimer();

  // SVG circle ring
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="card">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Focus timer</p>

      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <svg width="56" height="56" className="-rotate-90">
            <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor"
              className="text-gray-100 dark:text-white/10" strokeWidth="3" />
            <circle cx="28" cy="28" r={radius} fill="none"
              stroke={timerRunning ? '#7F77DD' : '#d3d1c7'}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-gray-700 dark:text-gray-200">
            {timeLabel}
          </span>
        </div>

        {/* Info + controls */}
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {timerRunning
              ? `${progress}% complete`
              : progress > 0
              ? `Paused — ${progress}% done`
              : 'Ready to start'}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={timerRunning ? pause : start}
              className={cx(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                timerRunning
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'
                  : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700'
              )}
            >
              {timerRunning ? <Pause size={11} /> : <Play size={11} />}
              {timerRunning ? 'Pause' : progress > 0 ? 'Resume' : 'Start'}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-purple-400 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
