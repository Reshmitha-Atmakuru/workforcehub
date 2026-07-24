import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building2, ShieldCheck, UserCheck, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState(() => (location.state?.registeredRole === 'ROLE_ADMIN' ? 'admin' : 'employee'));
  const [username, setUsername] = useState(() => location.state?.registeredUsername || 'admin');
  const [password, setPassword] = useState(() => (location.state?.registeredUsername ? '' : 'admin123'));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(() => location.state?.successMessage || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.registeredUsername) {
      setUsername(location.state.registeredUsername);
      setPassword('');
      if (location.state.registeredRole === 'ROLE_ADMIN') {
        setActiveTab('admin');
      } else {
        setActiveTab('employee');
      }
    }
  }, [location.state]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('employee');
      setPassword('');
    }
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuick = (userType) => {
    switch (userType) {
      case 'admin':
        setActiveTab('admin');
        setUsername('admin');
        setPassword('admin123');
        break;
      case 'manager':
        setActiveTab('admin');
        setUsername('manager');
        setPassword('');
        break;
      case 'hr_lead':
        setActiveTab('admin');
        setUsername('hr_lead');
        setPassword('');
        break;
      case 'finance':
        setActiveTab('admin');
        setUsername('finance');
        setPassword('');
        break;
      default:
        setActiveTab('employee');
        setUsername('employee');
        setPassword('');
        break;
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-3">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Workforce<span className="text-blue-500">Hub</span>
          <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">INDIA</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">WorkforceHub India Pvt. Ltd. — Employee Portal</p>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Toggle Tabs */}
        <div className="grid grid-cols-2 bg-[#131d38] p-1.5 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('employee')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'employee'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Employee Portal</span>
          </button>
        </div>

        {/* Tab Header Detail */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {activeTab === 'admin' ? 'System Admin Authentication' : 'Employee Access Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'admin'
                ? 'Full administrative rights to manage workforce, budgets, and security roles'
                : 'Access assigned tasks, project progress, and personal employee profile'}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
              activeTab === 'admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {activeTab === 'admin' ? 'ROLE_ADMIN' : 'ROLE_EMPLOYEE'}
          </span>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Username or Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeTab === 'admin' ? 'admin' : 'employee'}
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#131d38] border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <span>{submitting ? 'Authenticating...' : activeTab === 'admin' ? 'Sign In as Administrator' : 'Sign In as Employee'}</span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Fill — Admin only */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2.5">
            QUICK FILL — ADMIN ACCESS
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            <button
              type="button"
              onClick={() => fillQuick('admin')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono text-blue-300 border border-blue-500/30 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-blue-400 hover:underline font-semibold">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}
