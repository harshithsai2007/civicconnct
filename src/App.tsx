import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Megaphone,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';
import { IssueReportForm } from './components/IssueReportForm';
import { IssueList } from './components/IssueList';
import { IssueDetail } from './components/IssueDetail';
import { AdminDashboard } from './components/AdminDashboard';

import { motion, AnimatePresence } from 'motion/react';

type View = 'landing' | 'feed' | 'report' | 'admin' | 'user-login' | 'admin-login';
type Theme = 'landing' | 'user' | 'admin';

// ─── Nav Item ──────────────────────────────────────────────────────────────---
const NavItem = ({ icon: Icon, label, active, onClick, theme }: any) => {
  const activeClass =
    theme === 'user'
      ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]'
      : theme === 'admin'
        ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
        : 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]';
  const hoverClass =
    theme === 'user'
      ? 'hover:text-yellow-400 hover:bg-white/5'
      : theme === 'admin'
        ? 'hover:text-red-400 hover:bg-white/5'
        : 'hover:text-green-400 hover:bg-white/5';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 ${active ? activeClass : `text-slate-400 ${hoverClass}`
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

// ─── Landing Page (Green + Black) ─────────────────────────────────────────--
const LandingPage = ({ setView }: { setView: (v: View) => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
  >
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full -z-10" />
    <div className="absolute top-20 left-20 w-64 h-64 bg-green-700/5 blur-[80px] rounded-full -z-10" />

    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-6 max-w-4xl"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
        <Megaphone className="w-4 h-4" /> Empowering Your Voice
      </div>
      <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-none">
        Your Voice, <br />
        <span style={{ color: '#4ade80', textShadow: '0 0 40px rgba(74,222,128,0.4)' }}>Our Action.</span>
      </h2>
      <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
        A silent problem is a persistent one. Speak up, report issues, and let's build a better community together.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
        <button
          onClick={() => setView('user-login')}
          className="w-full sm:w-auto px-10 py-5 bg-green-500 text-black rounded-[2rem] font-bold text-lg hover:bg-green-400 transition-all shadow-[0_0_40px_rgba(34,197,94,0.25)] flex items-center justify-center gap-3 group"
        >
          Enter as Citizen <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => setView('admin-login')}
          className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white border border-white/10 rounded-[2rem] font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3"
        >
          <Shield className="w-6 h-6 text-red-400" /> Admin Portal
        </button>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">Scroll to explore</p>
      <div className="w-px h-12 bg-gradient-to-b from-green-500/50 to-transparent" />
    </motion.div>
  </motion.div>
);

// ─── Login Form ──────────────────────────────────────────────────────────────
const LoginForm = ({
  role,
  onAuth,
}: {
  role: 'user' | 'admin';
  onAuth: (e: React.FormEvent, role: 'user' | 'admin', data: any, isSignUp: boolean) => void;
}) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const isAdmin = role === 'admin';
  const accentColor = isAdmin ? 'red' : 'green';
  const accentBorder = isAdmin ? 'border-red-500/30' : 'border-green-500/20';
  const accentGlow = isAdmin
    ? '0 0 60px rgba(239,68,68,0.12)'
    : '0 0 60px rgba(34,197,94,0.10)';
  const activeTabClass = isAdmin
    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
    : 'bg-green-500 text-black shadow-lg shadow-green-500/30';
  const submitClass = isAdmin
    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.35)]'
    : 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_30px_rgba(34,197,94,0.25)] hover:shadow-[0_0_40px_rgba(34,197,94,0.35)]';
  const iconColor = isAdmin ? 'text-red-400' : 'text-green-400';
  const iconBg = isAdmin ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-12">
      <div
        className={`bg-[#0d0d0d] border ${accentBorder} rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden`}
        style={{ boxShadow: accentGlow }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-[2.5rem]" />

        {/* Icon + Title */}
        <div className="relative text-center mb-8">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ${iconBg} border`}>
            {isAdmin ? <Shield className={`w-10 h-10 ${iconColor}`} /> : <User className={`w-10 h-10 ${iconColor}`} />}
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {isAdmin ? 'Admin Gateway' : 'Citizen Portal'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {isAdmin ? 'Access the command center with admin credentials' : 'Join the community or sign in to your account'}
          </p>
        </div>

        {/* Tab Toggle — only for user portal */}
        {!isAdmin && (
          <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/8 mb-8">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${!isSignUp ? activeTabClass : 'text-slate-500 hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isSignUp ? activeTabClass : 'text-slate-500 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Sub-label for tab context */}
        {!isAdmin && (
          <p className="text-xs text-slate-600 text-center -mt-4 mb-6">
            {isSignUp ? '✦ Create a new account to start reporting issues' : '✦ Welcome back — sign in to continue'}
          </p>
        )}

        <form onSubmit={(e) => onAuth(e, role, loginData, isSignUp)} className="space-y-5 relative">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                required
                type="email"
                className="w-full bg-black/50 border border-white/8 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all text-white placeholder:text-slate-700 text-sm"
                placeholder={isAdmin ? 'admin@civicconnect.com' : 'you@example.com'}
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-black/50 border border-white/8 pl-12 pr-12 py-4 rounded-2xl outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all text-white placeholder:text-slate-700 text-sm"
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group ${submitClass}`}
            >
              {isAdmin ? 'Access Portal' : isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center relative">
          <p className="text-xs text-slate-600 leading-relaxed">
            {isAdmin
              ? 'Use your admin credentials to access the portal.'
              : isSignUp ? 'Already have an account? Switch to Sign In above.'
                : "New here? Switch to Sign Up above to get started!"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────--
export default function App() {
  const [view, setView] = useState<View>('landing');
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [adminSubView, setAdminSubView] = useState<'feed' | 'dashboard'>('feed');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Derive current theme
  const theme: Theme = user?.role === 'admin' ? 'admin' : user?.role === 'user' ? 'user' : 'landing';

  useEffect(() => {
    if (!user && (view === 'feed' || view === 'report' || view === 'admin')) {
      setView('landing');
    } else if (user && view === 'landing') {
      setView(user.role === 'admin' ? 'admin' : 'feed');
    }
  }, [user, view]);

  const handleAuth = async (e: React.FormEvent, role: 'user' | 'admin', data: any, isSignUp: boolean) => {
    e.preventDefault();
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const bodyPayload = isSignUp
        ? { email: data.email, password: data.password, role }
        : { email: data.email, password: data.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        if (isSignUp) {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: data.password }),
          });
          if (loginRes.ok) {
            const result = await loginRes.json();
            setUser(result.user);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('token', result.token);
            setView(result.user.role === 'admin' ? 'admin' : 'feed');
          }
        } else {
          const result = await res.json();

          // Emergency Override: Grant immediate admin access to the provided credentials
          // This ensures the user can login even if server-side seeding hasn't triggered yet on Vercel
          if (result.user.email === 'harshithsai597@gmail.com') {
            result.user.role = 'admin';
          }

          // Ensure role matches what was requested at login page
          if (result.user.role !== role) {
            alert(`Access Denied: This account is registered as ${result.user.role.toUpperCase()}, not ${role.toUpperCase()}.`);
            return;
          }
          setUser(result.user);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('token', result.token);
          setView(result.user.role === 'admin' ? 'admin' : 'feed');
        }
      } else {
        const err = await res.json();
        alert(err.error || (isSignUp ? 'Registration failed. Email may already be in use.' : 'Invalid credentials. Try signing up first!'));
      }
    } catch (error) {
      console.error(error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setView('landing');
  };

  // Colors per theme
  const logoGlow =
    theme === 'admin'
      ? 'bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
      : theme === 'user'
        ? 'bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
        : 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]';

  const accentText =
    theme === 'admin' ? 'text-red-500' : theme === 'user' ? 'text-yellow-400' : 'text-green-400';

  const roleTextColor =
    theme === 'admin' ? 'text-red-500' : 'text-yellow-500';


  const avatarBg =
    theme === 'admin'
      ? 'bg-red-500/10 border-red-500/20 text-red-500'
      : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';

  const headerBg =
    theme === 'admin'
      ? 'bg-[#080000]/95 border-red-900/30 shadow-[0_1px_30px_rgba(180,0,0,0.18)]'
      : 'bg-[#0a0a00]/95 border-yellow-500/10 shadow-[0_1px_20px_rgba(180,180,0,0.05)]';


  const rootBg =
    theme === 'admin' ? 'bg-[#020000]' : 'bg-[#050505]';

  return (
    <div className={`min-h-screen ${rootBg} theme-${theme} flex flex-col selection:bg-white/20`}>
      {/* ── Header ── */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-40 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView(user ? (user.role === 'admin' ? 'admin' : 'feed') : 'landing')}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform ${logoGlow}`}>
              <Megaphone className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Civic<span className={accentText}>Connect</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <NavItem icon={LayoutDashboard} label="Command Center" active={view === 'admin'} onClick={() => setView('admin')} theme={theme} />
                ) : (
                  <NavItem icon={LayoutDashboard} label="Feed" active={view === 'feed'} onClick={() => setView('feed')} theme={theme} />
                )}
                {user.role === 'user' && (
                  <NavItem icon={PlusCircle} label="Report" active={view === 'report'} onClick={() => setView('report')} theme={theme} />
                )}
                <div className="w-px h-8 bg-white/10 mx-3" />
                <div className="flex items-center gap-4 pl-2">
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-bold text-white leading-tight">{user.email.split('@')[0]}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${roleTextColor}`}>{user.role}</p>
                  </div>
                  <div className="relative group/profile">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${avatarBg}`}>
                      {user.email[0].toUpperCase()}
                    </div>
                    <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-[#111] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all z-50">
                      <div className="px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-xs text-slate-500 font-medium">Logged in as</p>
                        <p className="text-sm text-white font-bold truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView('user-login')}
                  className="px-6 py-2.5 text-slate-400 font-bold hover:text-green-400 transition-all"
                >
                  Citizen Login
                </button>
                <button
                  onClick={() => setView('admin-login')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  <Shield className="w-4 h-4 text-red-400" /> Admin
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-3 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden p-6 bg-black/90 border-t border-white/5 space-y-3 overflow-hidden"
            >
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <NavItem icon={LayoutDashboard} label="Command Center" active={view === 'admin'} onClick={() => { setView('admin'); setIsMenuOpen(false); }} theme={theme} />
                  ) : (
                    <NavItem icon={LayoutDashboard} label="Feed" active={view === 'feed'} onClick={() => { setView('feed'); setIsMenuOpen(false); }} theme={theme} />
                  )}
                  {user.role === 'user' && (
                    <NavItem icon={PlusCircle} label="Report" active={view === 'report'} onClick={() => { setView('report'); setIsMenuOpen(false); }} theme={theme} />
                  )}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-5 py-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${avatarBg}`}>
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.email.split('@')[0]}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${roleTextColor}`}>{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold rounded-2xl"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavItem icon={User} label="Citizen Login" active={view === 'user-login'} onClick={() => { setView('user-login'); setIsMenuOpen(false); }} theme="landing" />
                  <NavItem icon={Shield} label="Admin Login" active={view === 'admin-login'} onClick={() => { setView('admin-login'); setIsMenuOpen(false); }} theme="admin" />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        {view === 'landing' && <LandingPage setView={setView} />}

        {/* User Feed (yellow theme) */}
        {view === 'feed' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-bold text-white tracking-tighter">
                  Community <span className="text-yellow-400" style={{ textShadow: '0 0 30px rgba(234,179,8,0.4)' }}>Pulse</span>
                </h2>
                <p className="text-slate-400 mt-4 text-lg">Real-time civic reporting and resolution tracking. Your voice, amplified.</p>
              </div>
              {user?.role === 'user' && (
                <button
                  onClick={() => setView('report')}
                  className="px-8 py-4 bg-yellow-500 text-black rounded-[2rem] font-bold hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(234,179,8,0.25)] flex items-center justify-center gap-3 group"
                >
                  <PlusCircle className="w-6 h-6" />
                  <span>Report Issue</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
            <IssueList onSelect={(id) => setSelectedIssueId(id)} />
          </div>
        )}

        {/* Report Form */}
        {view === 'report' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <IssueReportForm onSuccess={() => setView('feed')} />
          </motion.div>
        )}

        {/* Admin View (red theme) */}
        {view === 'admin' && (
          <div className="space-y-12">
            {/* Admin Header Panel */}
            <div
              className="relative p-8 rounded-[2.5rem] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(30,0,0,0.92) 0%, rgba(8,0,0,0.96) 100%)',
                border: '1px solid rgba(239,68,68,0.22)',
                boxShadow: '0 0 60px rgba(180,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900/10 blur-[80px] rounded-full -ml-32 -mb-32 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    GVMC Admin Panel — Live
                  </div>
                  <h2 className="text-5xl font-bold text-white tracking-tighter">
                    Command <span style={{ color: '#ff2020', textShadow: '0 0 30px rgba(255,50,50,0.55)' }}>Center</span>
                  </h2>
                  <p className="text-slate-400 mt-3 text-lg">Monitor, prioritize and resolve community issues across Vizag.</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    <button
                      onClick={() => setAdminSubView('feed')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminSubView === 'feed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      Issue Feed
                    </button>
                    <button
                      onClick={() => setAdminSubView('dashboard')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${adminSubView === 'dashboard' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                      Workload Analytics
                    </button>
                  </div>
                  <div
                    className="text-center px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Administrator</p>
                  </div>
                </div>
              </div>
            </div>

            {adminSubView === 'feed' ? (
              <IssueList onSelect={(id) => setSelectedIssueId(id)} isAdmin={true} />
            ) : (
              <AdminDashboard />
            )}

          </div>
        )}

        {/* Login pages */}
        {view === 'user-login' && <LoginForm role="user" onAuth={handleAuth} />}
        {view === 'admin-login' && <LoginForm role="admin" onAuth={handleAuth} />}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-black py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${logoGlow}`}>
              <Megaphone className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold tracking-tight">CivicConnect</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 CivicConnect • Empowering Citizens for a Better Tomorrow</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── Issue Detail Modal ── */}
      <AnimatePresence>
        {selectedIssueId && (
          <IssueDetail
            issueId={selectedIssueId}
            onClose={() => setSelectedIssueId(null)}
            isAdmin={user?.role === 'admin'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
