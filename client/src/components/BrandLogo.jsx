import React from 'react';

const BrandLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: {
      mark: 'w-8 h-8 rounded-xl',
      image: 'w-7 h-7',
      text: 'text-sm',
      gap: 'gap-2'
    },
    md: {
      mark: 'w-10 h-10 rounded-2xl',
      image: 'w-9 h-9',
      text: 'text-lg',
      gap: 'gap-2.5'
    }
  };

  const current = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${current.gap} ${className}`}>
      <div className={`${current.mark} bg-white border border-brand-100 shadow-sm shadow-brand-500/10 flex items-center justify-center overflow-hidden`}>
        <img
          src="/vite.svg"
          alt="BPSMV Hub logo"
          className={`${current.image} object-contain`}
        />
      </div>
      {showText && (
        <span className={`font-display font-bold ${current.text} text-slate-900 tracking-tight whitespace-nowrap`}>
          BPSMV Hub
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
