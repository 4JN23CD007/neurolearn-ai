import React from 'react';
import { useAppStore } from '../context/store';
import { userAPI } from '../services/api';
import { cx } from '../utils/helpers';

const PROFILES = [
  {
    id: 'default',
    label: 'Standard',
    desc: 'Default layout',
    dot: 'bg-blue-400',
    active: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  },
  {
    id: 'dyslexia',
    label: 'Dyslexia',
    desc: 'OpenDyslexic font, wide spacing',
    dot: 'bg-purple-400',
    active: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  },
  {
    id: 'adhd',
    label: 'ADHD Focus',
    desc: 'Chunked, distraction-free',
    dot: 'bg-teal-400',
    active: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
  },
];

export default function ProfileSelector() {
  const { preferences, setPref } = useAppStore();

  async function handleSelect(id) {
    setPref('profile', id);
    try { await userAPI.updatePrefs({ profile: id }); } catch {}
  }

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-2">
        Learning profile
      </p>
      <div className="flex flex-col gap-1.5">
        {PROFILES.map(p => {
          const isActive = preferences.profile === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={cx(
                'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left border transition-all text-sm',
                isActive
                  ? p.active
                  : 'border-transparent text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'
              )}
            >
              <span className={cx('w-2 h-2 rounded-full flex-shrink-0', p.dot)} />
              <span className="font-medium">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
