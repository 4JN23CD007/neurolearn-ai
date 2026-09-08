import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Zap, Flame, BarChart2, Target } from 'lucide-react';
import { useAppStore } from '../context/store';
import { userAPI, sessionAPI } from '../services/api';
import { formatDuration, relativeTime, cx } from '../utils/helpers';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={cx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { progress, setProgress, preferences, user } = useAppStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [progRes, sessRes] = await Promise.all([
          userAPI.getProgress(),
          sessionAPI.list(),
        ]);
        setProgress(progRes.data);
        setSessions(sessRes.data.slice(0, 8));
      } catch { } finally { setLoading(false); }
    }
    load();
  }, [setProgress]);

  const topTransform = Object.entries(progress.transformsUsed || {}).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-5 max-w-3xl">
      <div className="mb-5">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Welcome back, {user?.name || 'Learner'}</h1>
        <p className="text-xs text-gray-400 mt-0.5">Your personalized learning progress</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-3">
        <StatCard icon={BookOpen}  label="Total sessions"  value={progress.totalSessions}  color="bg-purple-400" />
        <StatCard icon={Clock}     label="Focus time"      value={formatDuration(progress.totalFocusMinutes || 0)} color="bg-teal-400" />
        <StatCard icon={Target}    label="Avg focus score" value={`${progress.averageFocusScore || 0}%`} color="bg-blue-400" />
        <StatCard icon={Flame}     label="Day streak"      value={`${progress.currentStreak || 0} days`} color="bg-amber-400" />
        <StatCard icon={BarChart2} label="Words read"      value={(progress.totalWordsRead || 0).toLocaleString()} color="bg-pink-400" />
        <StatCard icon={Zap}       label="Passages done"   value={progress.passagesCompleted || 0} color="bg-indigo-400" />
      </div>

      <div className="card mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Saved preferences</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {[
            ['Profile', preferences.profile],
            ['Reading level', preferences.readingLevel],
            ['Font size', `${preferences.fontSize}px`],
            ['TTS speed', `${preferences.ttsSpeed}x`],
            ['Session length', `${preferences.sessionLengthMinutes} min`],
            ['Favourite tool', topTransform ? topTransform[0] : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center pr-4">
              <span className="text-gray-400 text-xs">{k}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300 text-xs capitalize">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(progress.transformsUsed || {}).length > 0 && (
        <div className="card mb-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Transform usage</p>
          <div className="space-y-2">
            {Object.entries(progress.transformsUsed).map(([name, count]) => {
              const max = Math.max(...Object.values(progress.transformsUsed));
              const pct = Math.round((count / max) * 100);
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{name}</span>
                    <span className="text-gray-400">{count}x</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="card">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-3">Recent sessions</p>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{s.active ? 'Active' : `${s.lengthMinutes}-min session`}</p>
                  <p className="text-xs text-gray-400">{relativeTime(s.startedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{s.wordsRead || 0} words</p>
                  {s.focusScore > 0 && <p className="text-[11px] text-teal-500">{s.focusScore}% focus</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-xs text-gray-400 text-center mt-4">Loading your data…</p>}
    </div>
  );
}
