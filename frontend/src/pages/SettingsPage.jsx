import React from 'react';
import { Moon, Sun, Save } from 'lucide-react';
import { useAppStore } from '../context/store';
import { userAPI } from '../services/api';
import { cx } from '../utils/helpers';
import toast from 'react-hot-toast';

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cx(
        'relative w-10 h-5 rounded-full transition-colors',
        value ? 'bg-purple-400' : 'bg-gray-200 dark:bg-white/20'
      )}
    >
      <span className={cx(
        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
        value && 'translate-x-5'
      )} />
    </button>
  );
}

export default function SettingsPage() {
  const { preferences, setPref, setPreferences } = useAppStore();

  async function saveToServer() {
    try {
      await userAPI.updatePrefs(preferences);
      toast.success('Preferences saved');
    } catch {
      toast.error('Could not save to server — saved locally');
    }
  }

  return (
    <div className="p-5 max-w-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-xs text-gray-400">Personalise your learning experience</p>
        </div>
        <button onClick={saveToServer} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700">
          <Save size={12} /> Save
        </button>
      </div>

      {/* Appearance */}
      <div className="card mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Appearance</p>
        <Row label="Dark mode" desc="Switch to dark background">
          <Toggle value={preferences.darkMode} onChange={v => setPref('darkMode', v)} />
        </Row>
        <Row label="Font size" desc={`Currently ${preferences.fontSize}px`}>
          <div className="flex items-center gap-2">
            <input type="range" min="12" max="22" step="1" value={preferences.fontSize}
              onChange={e => setPref('fontSize', Number(e.target.value))}
              className="w-24 accent-purple-500" />
            <span className="text-xs text-gray-500 w-8">{preferences.fontSize}px</span>
          </div>
        </Row>
      </div>

      {/* TTS & Voice */}
      <div className="card mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Voice & TTS</p>
        <Row label="TTS reading speed" desc={`${preferences.ttsSpeed.toFixed(1)}x speed`}>
          <div className="flex items-center gap-2">
            <input type="range" min="0.5" max="2" step="0.1" value={preferences.ttsSpeed}
              onChange={e => setPref('ttsSpeed', parseFloat(e.target.value))}
              className="w-24 accent-purple-500" />
            <span className="text-xs text-gray-500 w-8">{preferences.ttsSpeed.toFixed(1)}x</span>
          </div>
        </Row>
      </div>

      {/* Focus session */}
      <div className="card mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Focus session</p>
        <Row label="Session length" desc={`${preferences.sessionLengthMinutes} minutes per session`}>
          <div className="flex items-center gap-2">
            <input type="range" min="5" max="60" step="5" value={preferences.sessionLengthMinutes}
              onChange={e => setPref('sessionLengthMinutes', Number(e.target.value))}
              className="w-24 accent-purple-500" />
            <span className="text-xs text-gray-500 w-8">{preferences.sessionLengthMinutes}m</span>
          </div>
        </Row>
        <Row label="Auto-simplify on inactivity" desc="Suggest simplification when you stop interacting">
          <Toggle value={preferences.autoSimplifyOnInactivity} onChange={v => setPref('autoSimplifyOnInactivity', v)} />
        </Row>
        <Row label="Break reminders" desc="Nudge when focus session ends">
          <Toggle value={preferences.breakReminderEnabled} onChange={v => setPref('breakReminderEnabled', v)} />
        </Row>
      </div>

      {/* Profile defaults */}
      <div className="card mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">Defaults</p>
        <Row label="Default profile">
          <select
            value={preferences.profile}
            onChange={e => setPref('profile', e.target.value)}
            className="text-xs border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-2 py-1.5 bg-white dark:bg-[#1c1c1a] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="default">Standard</option>
            <option value="dyslexia">Dyslexia</option>
            <option value="adhd">ADHD Focus</option>
          </select>
        </Row>
        <Row label="Default reading level">
          <select
            value={preferences.readingLevel}
            onChange={e => setPref('readingLevel', e.target.value)}
            className="text-xs border border-black/[0.1] dark:border-white/[0.1] rounded-lg px-2 py-1.5 bg-white dark:bg-[#1c1c1a] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="easy">Easy (Grade 5)</option>
            <option value="medium">Medium (Grade 9)</option>
            <option value="advanced">Advanced (University)</option>
          </select>
        </Row>
      </div>

      <p className="text-[11px] text-gray-400 text-center">Settings are saved locally and synced when online.</p>
    </div>
  );
}
