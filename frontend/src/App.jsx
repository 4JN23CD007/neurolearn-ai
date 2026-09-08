import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './context/store';
import LoginPage from './pages/LoginPage';
import LearningPage from './pages/LearningPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

export default function App() {
  const preferences = useAppStore(s => s.preferences);

  // Apply dark mode class globally
  useEffect(() => {
    if (preferences?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences?.darkMode]);

  return (
    <Routes>
      {/* Layer 1: Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* Layer 2 & 3: Main App Shell */}
      <Route path="/" element={<Layout />}>
        {/* Layer 2: Main Learning Interface */}
        <Route index element={<LearningPage />} />
        {/* Layer 3: Dedicated Quizzes & Assessment Hub */}
        <Route path="quiz" element={<QuizPage />} />
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />
        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
