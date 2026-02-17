"use client";

import { motion } from "framer-motion";

export function CircuitBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      {/* Dark vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10" />
      
      <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D32F2F" stopOpacity="0" />
            <stop offset="50%" stopColor="#D32F2F" stopOpacity="1" />
            <stop offset="100%" stopColor="#D32F2F" stopOpacity="0" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic Circuit Lines - Top Left to Center */}
        <motion.path
          d="M 50 100 L 150 100 L 250 250 L 400 250"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="1000"
          animate={{ strokeDashoffset: [1000, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          filter="url(#glow)"
        />

        {/* Top Right to Center */}
        <motion.path
          d="M 1800 100 L 1700 100 L 1600 250 L 1450 250"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="1000"
          animate={{ strokeDashoffset: [1000, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          filter="url(#glow)"
        />

        {/* Bottom Left to Center */}
        <motion.path
          d="M 50 900 L 200 900 L 350 750 L 450 750"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="1000"
          animate={{ strokeDashoffset: [1000, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          filter="url(#glow)"
        />

        {/* Bottom Right to Center */}
        <motion.path
          d="M 1800 900 L 1650 900 L 1500 750 L 1400 750"
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="1000"
          animate={{ strokeDashoffset: [1000, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          filter="url(#glow)"
        />

        {/* Corner Nodes - Top Left */}
        <rect x="30" y="80" width="40" height="40" rx="4" fill="#121212" stroke="#D32F2F" strokeOpacity="0.5" />
        <circle cx="70" cy="100" r="3" fill="#D32F2F">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Corner Nodes - Top Right */}
        <rect x="1780" y="80" width="40" height="40" rx="4" fill="#121212" stroke="#D32F2F" strokeOpacity="0.5" />
        <circle cx="1780" cy="100" r="3" fill="#D32F2F">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Corner Nodes - Bottom Left */}
        <rect x="30" y="880" width="40" height="40" rx="4" fill="#121212" stroke="#D32F2F" strokeOpacity="0.5" />
        <circle cx="70" cy="900" r="3" fill="#D32F2F">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Corner Nodes - Bottom Right */}
        <rect x="1780" y="880" width="40" height="40" rx="4" fill="#121212" stroke="#D32F2F" strokeOpacity="0.5" />
        <circle cx="1780" cy="900" r="3" fill="#D32F2F">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
