import React, { useState } from 'react';
import { Brain, Loader } from 'lucide-react';
import { useAppStore } from '../context/store';
import { authAPI } from '../services/api';
import { cx } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const setAuth = useAppStore(s => s.setAuth);
  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await authAPI.register(form);
      } else {
        res = await authAPI.login({ email: form.email, password: form.password });
      }
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome${mode === 'register' ? ', ' + res.data.user.name : ' back'}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function continueAsGuest() {
    setLoading(true);
    try {
      const res = await authAPI.guest();
      setAuth(res.data.token, res.data.user);
      toast.success('Continuing as guest');
    } catch {
      toast.error('Could not create guest session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-purple-400 flex items-center justify-center">
            <Brain size={18} color="white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Neuro<span className="text-purple-400">Learn</span>
          </span>
        </div>

        <div className="card">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-gray-50 rounded-lg mb-5">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={cx(
                  'flex-1 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
                  mode === m
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                )}>
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Your name" required
                  className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white dark:bg-white text-gray-800" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" required
                className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-gray-800" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••" required minLength={6}
                className="w-full px-3 py-2 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-gray-800" />
            </div>
            <button type="submit" disabled={loading}
              className="mt-1 w-full py-2.5 rounded-lg text-sm font-medium bg-purple-400 text-white border border-purple-600 hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading && <Loader size={14} className="animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-3 text-center">
            <button onClick={continueAsGuest} disabled={loading}
              className="text-xs text-gray-400 hover:text-purple-600 underline underline-offset-2">
              Continue as guest
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Adaptive learning for every kind of mind.
        </p>
      </div>
    </div>
  );
}
