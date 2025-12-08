import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accent?: 'gold' | 'turquoise' | 'white' | 'none';
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, accent = 'white' }) => {
  const accentStyles = {
    gold: 'border-l-2 border-[#FFD700] shadow-[0_0_15px_-5px_rgba(255,215,0,0.3)]',
    turquoise: 'border-l-2 border-[#00E3FF] shadow-[0_0_15px_-5px_rgba(0,227,255,0.3)]',
    white: 'border-l-2 border-white/20',
    none: ''
  };

  return (
    <div className={`glass-panel rounded-3xl p-8 hover:bg-white/5 transition-all duration-300 relative overflow-hidden group ${accentStyles[accent]} ${className}`}>
      {/* Subtle shine effect on hover */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {title && (
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
          {title}
        </h3>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};