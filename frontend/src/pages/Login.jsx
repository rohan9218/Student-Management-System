import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, AlertCircle, Loader } from 'lucide-react';
import Toast from '../components/Toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('sms_remember_user', username);
      } else {
        localStorage.removeItem('sms_remember_user');
      }
      setToastType('success');
      setToastMessage('Logged in successfully!');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setToastType('error');
      setToastMessage(result.message);
      setError(result.message);
    }
  };

  // Pre-fill username if remember me was checked previously
  React.useEffect(() => {
    const saved = localStorage.getItem('sms_remember_user');
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg p-4 transition-colors">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}

      <div className="w-full max-w-md overflow-hidden bg-white border border-slate-100 dark:bg-darkCard dark:border-darkBorder rounded-3xl shadow-2xl">
        <div className="p-8">
          {/* Logo Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white shadow-xl shadow-primary-500/20 mb-3">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Welcome Back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your administration dashboard</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 text-sm border rounded-2xl bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Username / Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:bg-slate-900/30 dark:border-darkBorder dark:text-white dark:focus:bg-darkCard transition-all outline-none text-sm"
                  placeholder="admin or staff"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:bg-slate-900/30 dark:border-darkBorder dark:text-white dark:focus:bg-darkCard transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1 text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500 dark:bg-slate-900 dark:border-darkBorder"
                />
                Remember login session
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-darkBorder text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            For Demo use credentials: <code className="dark:bg-slate-800">admin / admin123</code> or <code className="dark:bg-slate-800">staff / staff123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
