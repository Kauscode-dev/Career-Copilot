import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  className?: string;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 relative overflow-hidden";
  
  const variants = {
    primary: "bg-[#FFD700] text-black hover:bg-[#FFE033] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] border border-[#FFD700]",
    secondary: "bg-[#00E3FF] text-black hover:bg-[#33EAFF] hover:shadow-[0_0_30px_rgba(0,227,255,0.5)] border border-[#00E3FF]",
    outline: "border border-white/30 text-white hover:bg-white/10 hover:border-white",
    glass: "glass-panel text-white hover:bg-white/10 border border-white/20 hover:border-white/40"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};