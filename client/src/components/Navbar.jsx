import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Menu, X, User, Shield, Home, Upload, MessageSquare, Search, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const isLanding = location.pathname === '/';

  const appNavLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: BookOpen },
    { path: '/resources', label: 'Resources', icon: Search },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/chat', label: 'Discussion', icon: MessageSquare },
  ];

  const adminNav = { path: '/admin', label: 'Admin', icon: Shield };

  const landingNavLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/login', label: 'Login', icon: ArrowRight },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isLanding ? 'bg-white/60 backdrop-blur-xl border-b border-white/20' : 'bg-white/80 backdrop-blur-md border-b border-slate-200/80'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/30 group-hover:scale-105 transition-all duration-300 overflow-hidden">
              <img src="/vite.svg" alt="BPSMV Hub" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 hidden sm:block tracking-tight">BPSMV Hub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {appNavLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive(link.path)
                          ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-[1.02]'
                      }`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </button>
                  );
                })}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive('/admin')
                        ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-[1.02]'
                    }`}
                  >
                    <Shield size={16} />
                    Admin
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/')
                      ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:scale-[1.02]'
                  }`}
                >
                  <Home size={16} />
                  Home
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary text-sm py-2 px-4 shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ArrowRight size={16} />
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Right side - Authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 hover:bg-slate-100/80 px-3 py-1.5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=c17a5c&color=fff`}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              </button>
              <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105 hover:rotate-6">
                <LogOut size={18} />
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md overflow-hidden transition-all duration-500 ease-in-out ${menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => { navigate(link.path); setMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </button>
                );
              })}
              {user?.role === 'admin' && (
                <button
                  onClick={() => { navigate('/admin'); setMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/admin')
                      ? 'bg-brand-50 text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield size={18} />
                  Admin
                </button>
              )}
              <button
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300"
              >
                <User size={18} />
                Profile
              </button>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-300"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('/'); setMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive('/') ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home size={18} />
                Home
              </button>
              <button
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-all duration-300"
              >
                <ArrowRight size={18} />
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
