import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import { getMe } from './api/index';

function Footer() {
  return (
    <footer className="fixed bottom-0 w-full z-50 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-2.5">
      <div className="flex items-center justify-center gap-6 text-sm flex-wrap px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center font-bold text-xs">TB</div>
          <span className="font-semibold text-white">Bembade Tejas Baban</span>
        </div>
        <div className="h-4 w-px bg-indigo-400"></div>
        <div className="flex items-center gap-1.5 text-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Information Technology</span>
        </div>
        <div className="h-4 w-px bg-indigo-400"></div>
        <div className="flex items-center gap-1.5 text-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          <span>Roll No: <span className="text-white font-medium">123103035</span></span>
        </div>
        <div className="h-4 w-px bg-indigo-400"></div>
        <div className="flex items-center gap-1.5 text-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-white font-medium">NIT Kurukshetra</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(res => setRole(res.data.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userRole) => setRole(userRole);
  const handleLogout = () => setRole(null);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
      <Footer />
    </div>
  );

  return (
    <div className="pb-12">
      {!role && <Login onLogin={handleLogin} />}
      {role === 'admin' && <AdminDashboard onLogout={handleLogout} />}
      {role === 'instructor' && <InstructorDashboard onLogout={handleLogout} />}
      <Footer />
    </div>
  );
}