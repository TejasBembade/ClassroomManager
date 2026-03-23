import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import PublicTimetable from './pages/PublicTimetable';
import { getMe } from './api/index';
import AppFooter from './components/AppFooter';

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPublicTimetable, setShowPublicTimetable] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(res => setRole(res.data.role))
      .catch(() => {
        localStorage.removeItem('token'); // Clear invalid/expired token
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userRole) => {
    setShowPublicTimetable(false);
    setRole(userRole);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setRole(null);
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-backdrop" />
        <main className="app-main relative z-10 flex items-center justify-center px-4 py-10">
          <div className="glass-panel flex w-full max-w-md flex-col items-center gap-5 rounded-[32px] px-8 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50/80">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
            <div className="space-y-1">
              <p className="section-kicker">Preparing workspace</p>
              <h1 className="display-font text-2xl text-slate-900">ClassManager</h1>
              <p className="text-sm text-slate-500">Checking your session and loading the right dashboard.</p>
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <main className="app-main relative z-10">
        {!role && !showPublicTimetable && (
          <Login
            onLogin={handleLogin}
            onShowPublicTimetable={() => setShowPublicTimetable(true)}
          />
        )}
        {!role && showPublicTimetable && (
          <PublicTimetable onBack={() => setShowPublicTimetable(false)} />
        )}
        {role === 'admin' && <AdminDashboard onLogout={handleLogout} />}
        {role === 'instructor' && <InstructorDashboard onLogout={handleLogout} />}
      </main>
      <AppFooter />
    </div>
  );
}
