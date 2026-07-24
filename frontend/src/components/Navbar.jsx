import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Building2, Sun, Moon, LogOut, User, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout, userRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return { label: 'System Admin', style: 'bg-blue-600/20 border-blue-500/30 text-blue-300' };
      case 'ROLE_MANAGER':
        return { label: 'Project Manager', style: 'bg-purple-600/20 border-purple-500/30 text-purple-300' };
      case 'ROLE_HR':
        return { label: 'HR Lead', style: 'bg-teal-600/20 border-teal-500/30 text-teal-300' };
      case 'ROLE_FINANCE':
        return { label: 'Finance Specialist', style: 'bg-amber-600/20 border-amber-500/30 text-amber-300' };
      default:
        return { label: 'Employee', style: 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300' };
    }
  };

  const roleInfo = getRoleBadge(userRole);
  const avatarUrl = user?.profileImageUrl
    ? (user.profileImageUrl.startsWith('data:') || user.profileImageUrl.startsWith('http')
        ? user.profileImageUrl
        : `http://localhost:8080${user.profileImageUrl}`)
    : null;

  return (
    <header className="h-16 bg-[#0f172a] dark:bg-[#0f172a] border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md transition-colors duration-200">
      {/* Left Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg text-white tracking-tight">Workforce<span className="text-blue-400">Hub</span></span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded uppercase tracking-wider">INDIA</span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">Enterprise Resource & Project Management</p>
        </div>
      </div>

      {/* Center Role Badge */}
      <div className="hidden md:flex items-center gap-2">
        <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-sm ${roleInfo.style}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Role: {roleInfo.label}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle (Enhanced Light/Dark Switcher) */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all border border-slate-700/50 flex items-center gap-2 text-xs font-semibold cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline text-amber-300 font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-200" />
              <span className="hidden sm:inline text-slate-200 font-medium">Dark Mode</span>
            </>
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-400/40 flex items-center justify-center font-bold text-white text-xs shadow-inner overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.firstName ? user.firstName[0].toUpperCase() : (user?.username ? user.username[0].toUpperCase() : 'U')
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200">{user?.username || 'User'}</p>
              <p className="text-[10px] text-slate-400">{user?.department || 'Department'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#131c35] border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-semibold text-sm text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Secure Session Active</span>
                </div>
              </div>

              <button
                onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>User Profile & Account Settings</span>
              </button>

              <div className="my-1 border-t border-slate-800"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
