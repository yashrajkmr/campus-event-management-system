import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Ticket,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Menu,
  X,
  Zap,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout, quickDemoLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleRoleSwitch = async (role) => {
    setMobileMenuOpen(false);
    const result = await quickDemoLogin(role);
    if (result.success) {
      if (role === 'admin') {
        showToast('Switched to Faculty Admin: Dr. Tegil', 'success');
        navigate('/admin');
      } else {
        showToast('Switched to Student: Yashraj Kumar', 'success');
        navigate('/events');
      }
    } else {
      showToast(result.message || 'Login switch failed', 'error');
    }
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#30363D] bg-[#0A0C10]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo & Concurrency Pill */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform border border-indigo-400/30">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-display tracking-tight text-white">
                    Campus<span className="text-indigo-400">Hub</span>
                  </span>
                  <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#161B22] border border-[#30363D] text-emerald-400">
                    v2026.1
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono hidden sm:inline-block">
                  High-Concurrency Event Engine
                </span>
              </div>
            </Link>

            {/* Live Atomic Guard Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161B22] border border-[#30363D] text-[10px] font-mono text-emerald-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ATOMIC CONCURRENCY GUARD: ACTIVE</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <NavLink to="/events" className={navLinkClasses}>
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Discover Events</span>
            </NavLink>

            {isAuthenticated && isStudent && (
              <NavLink to="/my-passes" className={navLinkClasses}>
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>My Passes</span>
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin" className={navLinkClasses}>
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  <span>Admin Console</span>
                </NavLink>
                <NavLink to="/admin/create-event" className={navLinkClasses}>
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span>Create Event</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Role Switcher & User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Direct 1-Click Role Switcher Pill (Interview Showcase) */}
            <div className="flex items-center p-1 rounded-xl bg-[#161B22] border border-[#30363D] shadow-inner text-xs font-mono">
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isAuthenticated && isStudent
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#21262D]'
                }`}
                title="Switch to Student: Yashraj Kumar"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student: Yashraj</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isAuthenticated && isAdmin
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#21262D]'
                }`}
                title="Switch to Faculty Admin: Dr. Tegil"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Faculty: Dr. Tegil</span>
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* Active User Badge */}
                <div className="flex items-center gap-2 pl-2.5 pr-3 py-1 rounded-full bg-[#161B22] border border-[#30363D]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-[#21262D] transition-colors border border-transparent hover:border-[#30363D]"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#21262D] border border-transparent hover:border-[#30363D] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary !px-3.5 !py-1.5 !text-xs font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#161B22] border border-[#30363D] text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#30363D] bg-[#0A0C10]/95 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Discover Events</span>
            </NavLink>

            {isAuthenticated && isStudent && (
              <NavLink
                to="/my-passes"
                onClick={() => setMobileMenuOpen(false)}
                className={navLinkClasses}
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>My Passes</span>
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClasses}
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  <span>Admin Console</span>
                </NavLink>
                <NavLink
                  to="/admin/create-event"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClasses}
                >
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span>Create Event</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile Role Switcher */}
          <div className="pt-2 border-t border-[#30363D]">
            <div className="text-xs font-semibold text-slate-400 mb-2 font-mono">
              Switch Interview Demo Profile
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRoleSwitch('student')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium ${
                  isAuthenticated && isStudent
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#161B22] border-[#30363D] text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student: Yashraj</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium ${
                  isAuthenticated && isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-[#161B22] border-[#30363D] text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Faculty: Dr. Tegil</span>
              </button>
            </div>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-3 border-t border-[#30363D]">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{user?.name}</div>
                    <div className="text-xs text-slate-400 font-mono capitalize">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-danger !py-1.5 !px-3 !text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary !py-2 !text-sm text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary !py-2 !text-sm text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
