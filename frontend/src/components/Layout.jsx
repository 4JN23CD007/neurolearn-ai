import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, HelpCircle, LayoutDashboard, Settings, LogOut, Brain } from 'lucide-react';
import { useAppStore } from '../context/store';
import { cx } from '../utils/helpers';

const NAV = [
  { to: '/',          icon: BookOpen,        label: 'Layer 2: Learning' },
  { to: '/quiz',      icon: HelpCircle,      label: 'Layer 3: Quizzes' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Layout() {
  const { user, logout, preferences } = useAppStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={cx('flex h-screen overflow-hidden', preferences.darkMode && 'dark')}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#161614] py-4 px-3">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm">
            <Brain size={18} color="white" />
          </div>
          <span className="font-bold text-base text-gray-900 dark:text-gray-100 tracking-tight">
            Neuro<span className="text-purple-600 dark:text-purple-400">Learn AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                isActive
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 shadow-xs border border-purple-200/50 dark:border-purple-800/40'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Layer 1 Switcher link + User Info */}
        <div className="border-t border-black/[0.07] dark:border-white/[0.07] pt-3 mt-3 space-y-2">
          <NavLink
            to="/login"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            🔒 Layer 1: Auth & Login Page
          </NavLink>
          <div className="px-2">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
              {user?.name || 'Guest Learner'}
            </div>
            <div className="text-[11px] text-gray-400 truncate">{user?.email || 'guest@neurolearn.ai'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#f8f7f4] dark:bg-[#111110]">
        <Outlet />
      </main>
    </div>
  );
}
