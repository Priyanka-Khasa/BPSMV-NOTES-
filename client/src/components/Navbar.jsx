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
  ];

  const secondaryAction = { path: '/gift', label: 'Gift', icon: Gift };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 shadow-sm shadow-brand-500/5 ${isLanding ? 'bg-white/58 backdrop-blur-2xl border-b border-white/50' : 'bg-white/78 backdrop-blur-2xl border-b border-white/60'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="group">
            <BrandLogo size="md" className="transition-transform duration-300 group-hover:scale-[1.02]" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {isAuthenticated ? (
              <>
                {appNavLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => navigate(link.path)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                        active
                          ? 'bg-white/90 text-brand-700 shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/60'
                          : 'text-slate-600 hover:scale-[1.02] hover:bg-white/70 hover:text-slate-900 hover:shadow-sm'
                      }`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </button>
                  );
                })}
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive('/admin')
                        ? 'bg-white/90 text-brand-700 shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/60'
                        : 'text-slate-600 hover:scale-[1.02] hover:bg-white/70 hover:text-slate-900 hover:shadow-sm'
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
                  type="button"
                  onClick={() => navigate('/')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive('/')
                      ? 'bg-white/90 text-brand-700 shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/60'
                      : 'text-slate-600 hover:scale-[1.02] hover:bg-white/70 hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <Home size={16} />
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn btn-primary px-4 py-2 text-sm shadow-brand-500/20 hover:-translate-y-0.5 hover:shadow-brand-500/30"
                >
                  <ArrowRight size={16} />
                  Get Started
                </button>
              </>
            )}
          </div>

          {isAuthenticated && (
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => navigate('/gift')}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/80 text-amber-600 shadow-sm transition-all hover:bg-white hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
                aria-label="Gift"
                title="Gift"
              >
                <Gift size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-100/80"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=c17a5c&color=fff`}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              </button>
              <button type="button" onClick={logout} className="rounded-xl p-2 text-slate-500 transition-all duration-300 hover:rotate-6 hover:scale-105 hover:bg-red-50 hover:text-red-600">
                <LogOut size={18} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="rounded-xl p-2 text-slate-600 transition-all duration-300 hover:scale-105 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`overflow-hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-500 ease-in-out md:hidden ${menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-1 px-4 py-3">
          {isAuthenticated ? (
            <>
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => { navigate(link.path); setMenuOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                      active ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </button>
                );
              })}
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => { navigate('/admin'); setMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive('/admin') ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Shield size={18} />
                  Admin
                </button>
              )}
              <button
                type="button"
                onClick={() => { navigate('/gift'); setMenuOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <Gift size={18} />
                Gift
              </button>
              <button
                type="button"
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-900"
              >
                <User size={18} />
                Profile
              </button>
              <button
                type="button"
                onClick={() => { logout(); setMenuOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-300 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { navigate('/'); setMenuOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive('/') ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Home size={18} />
                Home
              </button>
              <button
                type="button"
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-brand-700"
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
