import React from 'react';
import { X, Info, AlertTriangle, CheckCircle, Coffee } from 'lucide-react';
import { useAppStore } from '../context/store';
import { relativeTime, cx } from '../utils/helpers';

const ICONS = {
  info:    { Icon: Info,          cls: 'text-blue-500' },
  warning: { Icon: AlertTriangle, cls: 'text-amber-500' },
  success: { Icon: CheckCircle,   cls: 'text-teal-500' },
  break:   { Icon: Coffee,        cls: 'text-amber-600' },
};

const BG = {
  info:    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700',
  success: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700',
  break:   'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700',
};

export default function NudgePanel() {
  const { nudges, clearNudges } = useAppStore();

  if (nudges.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Smart nudges</p>
        <button
          onClick={clearNudges}
          className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
        {nudges.slice(0, 6).map(n => {
          const { Icon, cls } = ICONS[n.type] || ICONS.info;
          return (
            <div
              key={n.id}
              className={cx(
                'flex gap-2.5 p-2.5 rounded-lg border text-xs leading-relaxed animate-slide-up',
                BG[n.type] || BG.info
              )}
            >
              <Icon size={13} className={cx('mt-0.5 flex-shrink-0', cls)} />
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
                <p className="text-gray-400 mt-0.5">{relativeTime(n.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
