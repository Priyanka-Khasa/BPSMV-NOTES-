import React from 'react';
import Navbar from './Navbar';
import { Heart, Github, Twitter, Mail } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-white/60 backdrop-blur-md border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> for BPSMV students
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-300 hover:scale-110">
              <Mail size={16} />
            </a>
            <a href="#" className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-300 hover:scale-110">
              <Twitter size={16} />
            </a>
            <a href="#" className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-300 hover:scale-110">
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,214,153,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(94,214,172,0.16),transparent_32%),linear-gradient(135deg,#faf8f2,#f5f1e8_55%,#fffdf8)] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
