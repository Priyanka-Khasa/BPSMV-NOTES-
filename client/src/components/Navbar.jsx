import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BriefcaseBusiness, LogOut, Menu, X, User, Shield, Home, Upload, MessageSquare, Search, ArrowRight, Gift } from 'lucide-react';
import BrandLogo from './BrandLogo';

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
    { path: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/chat', label: 'Discussion', icon: MessageSquare },
    { path: '/gift', label: 'Gift', icon: Gift, colorful: true },
  ];

  const adminNav = { path: '/admin', label: 'Admin', icon: Shield };

  const landingNavLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/login', label: 'Login', icon: ArrowRight },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 shadow-sm shadow-brand-500/5 ${isLanding ? 'bg-white/58 backdrop-blur-2xl border-b border-white/50' : 'bg-white/78 backdrop-blur-2xl border-b border-white/60'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="group">
            <BrandLogo size="md" className="transition-transform duration-300 group-hover:scale-[1.02]" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {appNavLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <button
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        active
                          ? 'bg-white/90 text-brand-700 shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 hover:scale-[1.02] hover:shadow-sm'
                      }`}
                    >
                      {link.colorful ? (
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
                          active
                            ? 'bg-gradient-to-br from-amber-300 via-pink-300 to-emerald-300 text-white shadow-amber-200/70'
                            : 'bg-gradient-to-br from-amber-100 via-pink-100 to-emerald-100 text-amber-600 group-hover:scale-105'
                        }`}>
                          <Icon size={15} fill="currentColor" strokeWidth={2.4} />
                        </span>
                      ) : (
                        <Icon size={16} />
                      )}
                      {link.label}
                    </button>
                  );
                })}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive('/admin')
                        ? 'bg-white/90 text-brand-700 shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 hover:scale-[1.02] hover:shadow-sm'
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
                      ? 'bg-white/90 text-brand-700 shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 hover:scale-[1.02] hover:shadow-sm'
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
                const active = isActive(link.path);
                return (
                  <button
                    key={link.path}
                    onClick={() => { navigate(link.path); setMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.colorful ? (
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${
                        active
                          ? 'bg-gradient-to-br from-amber-300 via-pink-300 to-emerald-300 text-white'
                          : 'bg-gradient-to-br from-amber-100 via-pink-100 to-emerald-100 text-amber-600'
                      }`}>
                        <Icon size={16} fill="currentColor" strokeWidth={2.4} />
                      </span>
                    ) : (
                      <Icon size={18} />
                    )}
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
