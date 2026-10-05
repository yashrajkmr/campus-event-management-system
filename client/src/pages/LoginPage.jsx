import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/login' ? '/events' : from);
      }
    } else {
      setError(res.message);
      showToast(res.message, 'error');
    }
  };

  // Quick 1-click Demo Fill & Login
  const handleQuickDemo = async (role) => {
    const creds =
      role === 'admin'
        ? { email: 'admin@campus.edu', password: 'Admin@123' }
        : { email: 'student1@campus.edu', password: 'Student@123' };

    setFormData(creds);
    setLoading(true);
    setError('');

    const res = await login(creds.email, creds.password);
    setLoading(false);

    if (res.success) {
      showToast(`Logged in as ${role === 'admin' ? 'Campus Admin' : 'Student (Aarav)'}!`, 'success');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/events');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Member Access</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">
            Sign In to CampusHub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Access your workshop passes, event dashboard, or organizer portal.
          </p>
        </div>

        {/* Quick Demo Logins Card */}
        <div className="glass-card p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
            <span>⚡ Instant Demo Accounts</span>
            <span className="text-[10px] text-slate-400">Click to autofill & sign in</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-emerald-500/50 transition-all"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-purple-500/50 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Campus Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@campus.edu"
                value={formData.email}
                onChange={handleChange}
                className="glass-input w-full pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 !text-sm mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Register Link */}
          <div className="pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don't have a campus account yet?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
