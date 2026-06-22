import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Menu, X, User, Shield, Home, Upload, MessageSquare, Search, DoorOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, guestLogin } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BookOpen, protected: true },
    { path: '/resources', label: 'Resources', icon: Search },
    { path: '/upload', label: 'Upload', icon: Upload, protected: true },
    { path: '/chat', label: 'Discussion', icon: MessageSquare, protected: true },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="font-display font-bold text-lg text-slate-900 hidden sm:block">BPSMV Hub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </button>
                <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/login')} className="btn btn-secondary text-sm py-2 px-4">
                  Log in
                </button>
                <button onClick={() => navigate('/login?mode=signup')} className="btn btn-primary text-sm py-2 px-4">
                  Sign up
                </button>
                <button onClick={async () => { await guestLogin(); navigate('/dashboard'); }} className="btn btn-secondary text-sm py-2 px-4 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  <DoorOpen size={16} /> Guest
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </button>
              );
            })}
            {user && (
              <>
                <button
                  onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
            {!user && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="btn btn-secondary flex-1 text-sm py-2">
                  Log in
                </button>
                <button onClick={() => { navigate('/login?mode=signup'); setMenuOpen(false); }} className="btn btn-primary flex-1 text-sm py-2">
                  Sign up
                </button>
                <button onClick={async () => { await guestLogin(); navigate('/dashboard'); setMenuOpen(false); }} className="btn btn-secondary flex-1 text-sm py-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                  Guest
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
