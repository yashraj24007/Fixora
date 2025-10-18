import React from 'react';

interface FixoraLogoProps {
  className?: string;
  size?: number;
}

const FixoraLogo: React.FC<FixoraLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="toolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* Main hexagon */}
        <path
          d="M50 5 L82 25 L82 65 L50 85 L18 65 L18 25 Z"
          fill="url(#hexGradient)"
          filter="url(#shadow)"
        />

        {/* Inner hexagon for depth */}
        <path
          d="M50 12 L75 28 L75 62 L50 78 L25 62 L25 28 Z"
          fill="none"
          stroke="white"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Tool symbol - simplified wrench with two prongs */}
        <g transform="translate(50, 50)">
          {/* Main vertical body */}
          <rect
            x="-3"
            y="-20"
            width="6"
            height="25"
            fill="url(#toolGradient)"
            rx="3"
          />
          
          {/* Left prong */}
          <rect
            x="-12"
            y="-20"
            width="6"
            height="15"
            fill="url(#toolGradient)"
            rx="3"
          />
          
          {/* Right prong */}
          <rect
            x="6"
            y="-20"
            width="6"
            height="15"
            fill="url(#toolGradient)"
            rx="3"
          />
          
          {/* Bottom handle extension */}
          <rect
            x="-2"
            y="5"
            width="4"
            height="12"
            fill="url(#toolGradient)"
            rx="2"
          />
          
          {/* Cross connection between the two prongs */}
          <rect
            x="-9"
            y="-8"
            width="18"
            height="3"
            fill="url(#toolGradient)"
            rx="1.5"
          />
          
          {/* Center detail circle */}
          <circle
            cx="0"
            cy="-2"
            r="4"
            fill="none"
            stroke="url(#toolGradient)"
            strokeWidth="1.5"
          />
          
          {/* Small accent dots for modern touch */}
          <circle cx="-6" cy="10" r="1" fill="white" opacity="0.8" />
          <circle cx="6" cy="10" r="1" fill="white" opacity="0.8" />
        </g>

        {/* Subtle corner accents */}
        <circle cx="25" cy="25" r="1.5" fill="white" opacity="0.6" />
        <circle cx="75" cy="25" r="1.5" fill="white" opacity="0.6" />
        <circle cx="25" cy="75" r="1.5" fill="white" opacity="0.6" />
        <circle cx="75" cy="75" r="1.5" fill="white" opacity="0.6" />

        {/* Inner glow effect */}
        <path
          d="M50 15 L72 30 L72 60 L50 75 L28 60 L28 30 Z"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};

export default FixoraLogo;