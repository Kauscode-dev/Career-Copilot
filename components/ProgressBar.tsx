import React, { useEffect, useState } from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color = '#FFD700',
  className = ''
}) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger the stroke animation slightly after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate the number counter
    const duration = 1500; // ms
    const startTime = Date.now();
    const endValue = percentage;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      // Cubic ease out for smooth number counting
      const ease = 1 - Math.pow(1 - progress, 3);
      
      setDisplayPercentage(Math.round(endValue * ease));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use 0 offset if not mounted to animate from empty
  const targetPercentage = mounted ? percentage : 0;
  const offset = circumference - (targetPercentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]">
        {/* Track Circle */}
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className="transition-all duration-[1500ms] ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white tracking-tighter">
          {displayPercentage}
        </span>
      </div>
    </div>
  );
};