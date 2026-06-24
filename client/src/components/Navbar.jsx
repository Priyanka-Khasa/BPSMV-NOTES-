import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Menu, X, User, Shield, Home, Upload, MessageSquare, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: BookOpen },
    { path: '/resources', label: 'Resources', icon: Search },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/chat', label: 'Discussion', icon: MessageSquare },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img
              src="/vite.svg"
              alt="BPSMV Hub"
              className="w-9 h-9 drop-shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300"
            />
            <span className="font-display font-bold text-lg text-slate-900 hidden sm:block tracking-tight">BPSMV Hub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
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
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-3">
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
          </div>

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
          {navLinks.map((link) => {
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
