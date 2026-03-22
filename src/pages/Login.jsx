import { useState } from 'react';
import { login } from '../api/index';

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 py-3 px-6 text-center z-50">
      <p className="text-xs text-gray-400">
        Created by{' '}<span className="text-gray-200 font-medium">Tejas Bembade</span>
        <span className="text-gray-600 mx-2">|</span>
        Branch:{' '}<span className="text-gray-200 font-medium">Information Technology</span>
        <span className="text-gray-600 mx-2">|</span>
        Roll No:{' '}<span className="text-gray-200 font-medium">123103035</span>
        <span className="text-gray-600 mx-2">|</span>
        <span className="text-gray-200 font-medium">NIT Kurukshetra</span>
      </p>
    </footer>
  );
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login({ email, password });
      onLogin(res.data.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">College Scheduler</h2>
        <p className="text-gray-400 mb-6">Sign in to continue</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}