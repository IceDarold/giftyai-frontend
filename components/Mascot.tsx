
import React, { useState, useEffect } from 'react';

interface MascotProps {
  className?: string;
  emotion?: 'happy' | 'thinking' | 'surprised' | 'excited' | 'cool';
  eyesX?: number; // -1 to 1
  eyesY?: number; // -1 to 1
  accessory?: 'none' | 'glasses' | 'scarf' | 'santa-hat' | 'cupid';
  floating?: boolean;
  variant?: 'default' | 'cupid';
}

export const Mascot: React.FC<MascotProps> = ({ 
  className = "w-32 h-32", 
  emotion = 'happy',
  eyesX = 0,
  eyesY = 0,
  accessory = 'none',
  floating = true,
  variant = 'default' 
}) => {
  // Eye tracking movement calculation (clamped for the SVG coordinate system)
  const pupilX = Math.max(-1, Math.min(1, eyesX)) * 5;
  const pupilY = Math.max(-1, Math.min(1, eyesY)) * 5;

  // Blinking Logic
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150); 
      const nextBlink = Math.random() * 4000 + 2000; 
      setTimeout(blinkLoop, nextBlink);
    };
    
    const timer = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Cyber-Gift Colors (Tech & Fun)
  const isCupid = variant === 'cupid';
  const headGradientId = isCupid ? "headGradientLove" : "headGradientCyber";
  
  const colors = {
      headDark: isCupid ? "#DB2777" : "#86C8BC", // Pink-600 or Soft Mint Green
      headMain: `url(#${headGradientId})`,
      snout: isCupid ? "#FDE047" : "#F9D949", // Yellow or Soft Yellow
      cheek: isCupid ? "#FCA5A5" : "#A0C3D2", // Pink or Soft Sky Blue
      nose: isCupid ? "#9F1239" : "#3A4750",  // Dark Rose or Soft Slate
      stroke: isCupid ? "#881337" : "#3A4750" // Deep Red or Soft Slate
  };

  return (
    <div className={`${className} relative select-none pointer-events-none`}>
      <div className={`w-full h-full ${floating ? 'animate-[float_6s_ease-in-out_infinite]' : ''}`}>
        
        <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
                {/* Fresh Gifty Gradient (Yellow -> Green) */}
                <linearGradient id="headGradientCyber" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9D949" /> {/* Yellow */}
                    <stop offset="100%" stopColor="#86C8BC" /> {/* Mint Green */}
                </linearGradient>

                {/* Love Gradient (Pink -> Red) */}
                <linearGradient id="headGradientLove" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F472B6" /> 
                    <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                
                <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* --- CUPID WINGS (Conditional) --- */}
            {isCupid && (
                <g transform="translate(0, 10)">
                    <path d="M20 90 Q -20 40 10 20 Q 30 10 50 60" fill="white" stroke={colors.headDark} strokeWidth="2" opacity="0.8" />
                    <path d="M180 90 Q 220 40 190 20 Q 170 10 150 60" fill="white" stroke={colors.headDark} strokeWidth="2" opacity="0.8" />
                </g>
            )}

            {/* --- EARS --- */}
            <g transform="translate(0, 10)">
                <path d="M40 70 Q 20 40 30 20 Q 50 10 70 50" fill={colors.headMain} stroke={colors.headDark} strokeWidth="2" />
                <path d="M160 70 Q 180 40 170 20 Q 150 10 130 50" fill={colors.headMain} stroke={colors.headDark} strokeWidth="2" />
            </g>

            {/* --- HEAD --- */}
            <rect x="30" y="50" width="140" height="130" rx="70" fill={colors.headMain} />
            
            {/* Snout Area */}
            <ellipse cx="100" cy="145" rx="40" ry="30" fill={colors.snout} opacity="0.3" />

            {/* --- FACE DETAILS --- */}
            <ellipse cx="50" cy="140" rx="15" ry="10" fill={colors.cheek} opacity="0.8" />
            <ellipse cx="150" cy="140" rx="15" ry="10" fill={colors.cheek} opacity="0.8" />

            {/* Nose */}
            <ellipse cx="100" cy="138" rx="8" ry="6" fill={colors.nose} />
            <ellipse cx="102" cy="136" rx="2" ry="1.5" fill="white" opacity="0.6" />

            {/* Mouth */}
            <path 
                d={emotion === 'surprised' ? "M90 155 Q100 165 110 155" : (emotion === 'cool' ? "M90 155 Q100 158 110 155" : "M82 152 Q100 170 118 152")} 
                fill="none" 
                stroke={colors.stroke} 
                strokeWidth="3" 
                strokeLinecap="round" 
            />

            {/* --- EYES (Friendly & Sparkly) --- */}
            {emotion !== 'cool' && accessory !== 'glasses' && (
                <g transform="translate(0, 10)">
                     {/* Left Eye */}
                     <g transform="translate(72, 98)">
                        <circle cx="0" cy="0" r="18" fill="white" stroke={colors.snout} strokeWidth="1.5"/>
                        {isBlinking ? (
                            <line x1="-14" y1="0" x2="14" y2="0" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" />
                        ) : (
                            <g transform={`translate(${pupilX}, ${pupilY})`}>
                                <circle cx="0" cy="0" r="8" fill={colors.stroke} />
                                <circle cx="2" cy="-2" r="2.5" fill="white" />
                                <circle cx="-2" cy="2" r="1" fill="white" opacity="0.5" />
                            </g>
                        )}
                     </g>

                     {/* Right Eye */}
                     <g transform="translate(128, 98)">
                        <circle cx="0" cy="0" r="18" fill="white" stroke={colors.snout} strokeWidth="1.5"/>
                        {isBlinking ? (
                            <line x1="-14" y1="0" x2="14" y2="0" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" />
                        ) : (
                            <g transform={`translate(${pupilX}, ${pupilY})`}>
                                <circle cx="0" cy="0" r="8" fill={colors.stroke} />
                                <circle cx="2" cy="-2" r="2.5" fill="white" />
                                <circle cx="-2" cy="2" r="1" fill="white" opacity="0.5" />
                            </g>
                        )}
                     </g>
                </g>
            )}

            {/* --- ACCESSORIES --- */}

            {/* Glasses (Cool mode) */}
            {(accessory === 'glasses' || emotion === 'cool') && (
                 <g transform="translate(0, 5)">
                    {/* Frame */}
                    <path d="M40 95 Q 70 95 100 90 Q 130 95 160 95" fill="none" stroke="#111" strokeWidth="4" />
                    {/* Lenses */}
                    <path d="M45 95 Q 45 125 70 125 Q 95 125 95 95 Z" fill="black" stroke="#FF4D6D" strokeWidth="2" /> {/* Pink rim */}
                    <path d="M105 95 Q 105 125 130 125 Q 155 125 155 95 Z" fill="black" stroke="#FF4D6D" strokeWidth="2" />
                    {/* Reflections */}
                    <path d="M55 100 L 85 115" stroke="white" strokeWidth="2" opacity="0.3" />
                    <path d="M115 100 L 145 115" stroke="white" strokeWidth="2" opacity="0.3" />
                 </g>
            )}
        </svg>
      </div>
    </div>
  );
};
