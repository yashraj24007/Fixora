import React from 'react';

interface FixoraLogoProps {
  className?: string;
  size?: number;
}

const FixoraLogo: React.FC<FixoraLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer gear/circle representing automotive */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.3"
      />
      
      {/* Gear teeth */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x="48"
          y="3"
          width="4"
          height="8"
          fill="currentColor"
          opacity="0.4"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}

      {/* Wrench - main body */}
      <path
        d="M35 65 L35 45 L32 45 L32 35 L38 35 L38 45 L35 45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Wrench - adjustable jaw */}
      <path
        d="M32 35 L28 31 L30 29 L34 33"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* AI Circuit Pattern - right side */}
      <circle cx="60" cy="35" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="70" cy="35" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="65" cy="45" r="3" fill="currentColor" opacity="0.8" />
      
      {/* Circuit connections */}
      <line x1="60" y1="35" x2="70" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="63" y1="35" x2="65" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="67" y1="35" x2="65" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />

      {/* AI Brain symbol */}
      <path
        d="M58 55 Q60 52 62 55 Q64 52 66 55 Q68 52 70 55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M58 60 Q60 63 62 60 Q64 63 66 60 Q68 63 70 60"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Connecting line between wrench and AI elements */}
      <line 
        x1="40" 
        y1="50" 
        x2="57" 
        y2="50" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeDasharray="3 2"
        opacity="0.5"
      />

      {/* Center glow/sparkle */}
      <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="50" r="2" fill="currentColor" />
    </svg>
  );
};

export default FixoraLogo;