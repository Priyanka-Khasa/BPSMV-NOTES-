import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment-light via-parchment to-parchment/80">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;