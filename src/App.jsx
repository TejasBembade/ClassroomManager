import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import { getMe } from './api/index';

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(res => setRole(res.data.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  const handleLogout = () => {
    setRole(null);
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  if (!role) return <Login onLogin={handleLogin} />;

  if (role === 'admin') return <AdminDashboard onLogout={handleLogout} />;

  if (role === 'instructor') return <InstructorDashboard onLogout={handleLogout} />;
}