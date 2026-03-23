import { useState } from 'react';
import { login } from '../api/index';

export default function Login({ onLogin, onShowPublicTimetable }) {
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
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto grid w-full max-w-5xl gap-8 overflow-hidden rounded-[36px] p-4 lg:grid-cols-[1.15fr_0.85fr] lg:p-5">
        <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.22),transparent_34%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <span className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.32em] text-emerald-200">
                Classroom Manager
              </span>
              <div className="space-y-4">
                <h1 className="display-font max-w-xl text-4xl leading-tight sm:text-5xl">College Scheduler</h1>
                <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-base">Sign in to continue or open the overall timetable.</p>
              </div>
            </div>

            <button type="button" onClick={onShowPublicTimetable} className="ghost-dark-button w-fit">
              View Overall Timetable
            </button>
          </div>
        </section>

        <section className="flex items-center rounded-[28px] bg-white/70 px-4 py-6 sm:px-6">
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <p className="section-kicker">Welcome back</p>
              <h2 className="display-font text-3xl text-slate-900">Sign in</h2>
              <p className="text-sm text-slate-500">Use your account credentials to open your dashboard.</p>
            </div>

            {error && <div className="status-banner border-rose-200/80 bg-rose-50/90 text-rose-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="muted-label">Email address</label>
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="premium-input"
                />
              </div>

              <div className="space-y-2">
                <label className="muted-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="premium-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Enter Dashboard'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
