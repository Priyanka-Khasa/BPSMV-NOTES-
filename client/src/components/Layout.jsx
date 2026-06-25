import React from 'react';
import Navbar from './Navbar';
import { BookOpen, Heart, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/60 backdrop-blur-md border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm text-slate-900">BPSMV Hub</span>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-parchment-light via-parchment to-parchment/80 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
