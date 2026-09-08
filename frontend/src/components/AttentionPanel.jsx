import React from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { useAppStore } from '../context/store';
import { useAttention } from '../hooks/useAttention';
import { cx } from '../utils/helpers';

export default function AttentionPanel() {
  const { camActive, attentionScore } = useAppStore();
  const { start, stop } = useAttention();

  function toggle() {
    camActive ? stop() : start();
  }

  const barColor =
    attentionScore >= 70 ? 'bg-teal-400' :
    attentionScore >= 40 ? 'bg-amber-400' :
    'bg-red-400';

  const label =
    attentionScore >= 70 ? 'Focused' :
    attentionScore >= 40 ? 'Drifting' :
    attentionScore > 0   ? 'Low attention' :
    '—';

  return (
    <div className="card">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Attention detection</p>

      {/* Camera preview (simulated) */}
      <div className="flex flex-col items-center gap-2 mb-3">
        <div className="w-20 h-14 rounded-lg bg-gray-900 dark:bg-black flex items-center justify-center relative overflow-hidden">
          {camActive ? (
            <>
              {/* Simulated face silhouette */}
              <div className="w-7 h-7 rounded-full bg-gray-500 absolute top-2" />
              <div className="w-12 h-6 rounded-t-full bg-gray-600 absolute bottom-0" />
              {/* Scanning line animation */}
              <div className="absolute inset-0 border border-teal-500/40 rounded-lg animate-pulse" />
            </>
          ) : (
            <CameraOff size={16} className="text-gray-600" />
          )}
        </div>
        <p className="text-[11px] text-gray-400">
          {camActive ? 'Camera active (simulated)' : 'Camera inactive'}
        </p>
      </div>

      {/* Attention bar */}
      {camActive && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-gray-400">Attention</span>
            <span className={cx(
              'text-[11px] font-medium',
              attentionScore >= 70 ? 'text-teal-600 dark:text-teal-400' :
              attentionScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-500'
            )}>
              {attentionScore}% — {label}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <div
              className={cx('h-full rounded-full transition-all duration-700', barColor)}
              style={{ width: `${attentionScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggle}
        className={cx(
          'flex items-center gap-2 w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all',
          camActive
            ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-300 dark:border-white/10'
        )}
      >
        <Camera size={14} />
        {camActive ? 'Disable camera' : 'Enable camera'}
      </button>
    </div>
  );
}
