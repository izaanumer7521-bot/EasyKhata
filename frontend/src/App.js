import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RecoveryManDetail from './pages/RecoveryManDetail';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { LanguageProvider } from './i18n/LanguageContext';
import './styles/App.css';

function AppInner() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('ek_token'));

  useEffect(() => {
    const out = () => setAuthed(false);
    window.addEventListener('ek-logout', out);
    return () => window.removeEventListener('ek-logout', out);
  }, []);

  const logout = () => {
    localStorage.removeItem('ek_token');
    setAuthed(false);
  };

  if (!authed) return <Login onLoggedIn={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recovery-man/:id" element={<RecoveryManDetail />} />
            <Route path="/settings" element={<Settings onLogout={logout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const App = () => (
  <LanguageProvider>
    <AppInner />
  </LanguageProvider>
);

export default App;
