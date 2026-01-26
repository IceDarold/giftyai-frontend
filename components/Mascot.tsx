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
  variant = 'cupid' // Default to Cupid for Valentine's
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

  // Colors based on variant
  const isCupid = variant === 'cupid';
  const headGradientId = isCupid ? "headGradientPink" : "headGradientBlue";
  
  const colors = {
      headDark: isCupid ? "#E01E37" : "#1D4ED8", // Dark outline/ears
      headMain: isCupid ? `url(#${headGradientId})` : `url(#${headGradientId})`,
      snout: isCupid ? "#FFC2D1" : "#BFDBFE",
      cheek: isCupid ? "#FF8FA3" : "#F472B6",
      nose: isCupid ? "#A01138" : "#1E3A8A",
      stroke: isCupid ? "#A01138" : "#1E3A8A"
  };

  return (
    <div className={`${className} relative select-none pointer-events-none`}>
      <div className={`w-full h-full ${floating ? 'animate-[float_6s_ease-in-out_infinite]' : ''}`}>
        
        <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
                {/* Default Blue Gradient */}
                <linearGradient id="headGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" /> 
                    <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>

                {/* Cupid Pink Gradient */}
                <linearGradient id="headGradientPink" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF8FA3" /> 
                    <stop offset="100%" stopColor="#FF4D6D" />
                </linearGradient>
                
                <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* --- CUPID WINGS (Behind) --- */}
            {isCupid && (
                <g transform="translate(0, 10)">
                    {/* Left Wing */}
                    <path d="M20 90 Q -20 40 10 20 Q 30 10 50 60" fill="white" stroke={colors.headDark} strokeWidth="2" opacity="0.8" />
                    {/* Right Wing */}
                    <path d="M180 90 Q 220 40 190 20 Q 170 10 150 60" fill="white" stroke={colors.headDark} strokeWidth="2" opacity="0.8" />
                </g>
            )}

            {/* --- EARS --- */}
            <g transform="translate(0, 10)">
                <path d="M40 70 Q 20 40 30 20 Q 50 10 70 50" fill={colors.headMain} stroke={colors.headDark} strokeWidth="2" />
                <path d="M160 70 Q 180 40 170 20 Q 150 10 130 50" fill={colors.headMain} stroke={colors.headDark} strokeWidth="2" />
            </g>

            {/* --- HEAD --- */}
            <rect x="30" y="50" width="140" height="130" rx="60" fill={colors.headMain} />
            
            {/* Snout Area */}
            <ellipse cx="100" cy="145" rx="45" ry="35" fill={colors.snout} opacity="0.4" />

            {/* --- FACE DETAILS --- */}
            <ellipse cx="55" cy="135" rx="12" ry="8" fill={colors.cheek} opacity="0.6" />
            <ellipse cx="145" cy="135" rx="12" ry="8" fill={colors.cheek} opacity="0.6" />

            {/* Nose */}
            <ellipse cx="100" cy="135" rx="10" ry="7" fill={colors.nose} />
            <ellipse cx="103" cy="133" rx="3" ry="2" fill="white" opacity="0.5" />

            {/* Mouth */}
            <path 
                d={emotion === 'surprised' ? "M90 155 Q100 165 110 155" : "M85 152 Q100 165 115 152"} 
                fill="none" 
                stroke={colors.stroke} 
                strokeWidth="4" 
                strokeLinecap="round" 
            />

            {/* --- EYES --- */}
            <g transform="translate(0, 10)">
                 {/* Left Eye */}
                 <g transform="translate(70, 95)">
                    <circle cx="0" cy="0" r="22" fill="white" stroke={colors.snout} strokeWidth="2"/>
                    {isBlinking ? (
                        <line x1="-18" y1="0" x2="18" y2="0" stroke={colors.stroke} strokeWidth="4" strokeLinecap="round" />
                    ) : (
                        <g transform={`translate(${pupilX}, ${pupilY})`}>
                            <circle cx="0" cy="0" r="10" fill={colors.stroke} />
                            <circle cx="3" cy="-3" r="3" fill="white" />
                        </g>
                    )}
                 </g>

                 {/* Right Eye */}
                 <g transform="translate(130, 95)">
                    <circle cx="0" cy="0" r="22" fill="white" stroke={colors.snout} strokeWidth="2"/>
                    {isBlinking ? (
                        <line x1="-18" y1="0" x2="18" y2="0" stroke={colors.stroke} strokeWidth="4" strokeLinecap="round" />
                    ) : (
                        <g transform={`translate(${pupilX}, ${pupilY})`}>
                            <circle cx="0" cy="0" r="10" fill={colors.stroke} />
                            <circle cx="3" cy="-3" r="3" fill="white" />
                        </g>
                    )}
                 </g>
            </g>

            {/* --- ACCESSORIES --- */}

            {/* Replace Santa Hat with Heart Headband if Cupid or requested */}
            {accessory === 'santa-hat' && (
                <g transform="translate(0, 0)">
                    {/* Headband Arch */}
                    <path d="M50 70 Q 100 30 150 70" fill="none" stroke="#FF4D6D" strokeWidth="4" strokeLinecap="round" />
                    {/* Heart Antennas */}
                    <g transform="translate(50, 60) rotate(-20)">
                        <path d="M0 0 L0 -20" stroke="#FF4D6D" strokeWidth="2" />
                        <path d="M0 -20 M-10 -30 Q-10 -40 0 -40 Q 10 -40 10 -30 L0 -20" fill="#FF4D6D" />
                    </g>
                    <g transform="translate(150, 60) rotate(20)">
                        <path d="M0 0 L0 -20" stroke="#FF4D6D" strokeWidth="2" />
                        <path d="M0 -20 M-10 -30 Q-10 -40 0 -40 Q 10 -40 10 -30 L0 -20" fill="#FF4D6D" />
                    </g>
                </g>
            )}

            {accessory === 'glasses' && (
                 <g transform="translate(0, 10)">
                    <circle cx="70" cy="95" r="26" fill="none" stroke="#1F2937" strokeWidth="3" />
                    <circle cx="130" cy="95" r="26" fill="none" stroke="#1F2937" strokeWidth="3" />
                    <line x1="96" y1="95" x2="104" y2="95" stroke="#1F2937" strokeWidth="3" />
                 </g>
            )}
        </svg>
      </div>
    </div>
  );
};