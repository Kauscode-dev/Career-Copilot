import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accent?: 'gold' | 'turquoise' | 'white';
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, accent = 'white' }) => {
  const accentColors = {
    gold: 'border-l-4 border-[#FFD700]',
    turquoise: 'border-l-4 border-[#00E3FF]',
    white: ''
  };

  return (
    <div className={`bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors duration-300 ${accentColors[accent]} ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};