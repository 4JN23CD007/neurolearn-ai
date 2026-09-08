import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../context/store';
import { nudgeAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useFocusTimer() {
  const {
    timerRunning, timerSeconds, timerMaxSeconds,
    preferences, sessionId,
    setTimerRunning, setTimerSeconds, setTimerMax,
    addNudge,
  } = useAppStore();

  const intervalRef   = useRef(null);
  const inactivityRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const inactivityCountRef = useRef(0);

  // Reset inactivity on any user interaction
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown',   resetActivity);
    window.addEventListener('click',     resetActivity);
    return () => {
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown',   resetActivity);
      window.removeEventListener('click',     resetActivity);
    };
  }, [resetActivity]);

  // Main countdown tick
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            toast.success('Focus session complete! Great work.');
            fireNudge('breakTime');
            return 0;
          }
          // Mid-session nudge
          if (prev === Math.floor(timerMaxSeconds / 2)) {
            fireNudge('progress');
          }
          return prev - 1;
        });
      }, 1000);

      // Inactivity checker every 10s
      inactivityRef.current = setInterval(() => {
        const idle = Date.now() - lastActivityRef.current;
        if (idle > 30000 && preferences.autoSimplifyOnInactivity) {
          inactivityCountRef.current += 1;
          fireNudge('inactivity');
        }
      }, 10000);
    }

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(inactivityRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning]);

  async function fireNudge(trigger) {
    try {
      const { data } = await nudgeAPI.trigger(trigger);
      addNudge(data);
      if (trigger === 'breakTime') {
        toast(data.message, { icon: '☕' });
      } else if (trigger === 'inactivity') {
        toast(data.message, { icon: '💡' });
      } else if (trigger === 'progress') {
        toast.success(data.message);
      }
    } catch {
      // Fallback nudge without API
      const fallback = {
        id: Date.now(),
        type: 'info',
        message: trigger === 'breakTime'
          ? 'Session complete! Time for a break.'
          : 'You seem inactive. Need a simplification?',
        trigger,
        createdAt: new Date().toISOString(),
      };
      addNudge(fallback);
    }
  }

  function start() {
    if (timerSeconds === 0) reset();
    setTimerRunning(true);
    resetActivity();
  }

  function pause() {
    setTimerRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(inactivityRef.current);
  }

  function reset() {
    pause();
    const secs = preferences.sessionLengthMinutes * 60;
    setTimerSeconds(secs);
    setTimerMax(secs);
  }

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = timerMaxSeconds > 0
    ? Math.round(((timerMaxSeconds - timerSeconds) / timerMaxSeconds) * 100)
    : 0;

  return { timeLabel, progress, start, pause, reset, timerRunning, timerSeconds };
}
