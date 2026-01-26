import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'color', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-baseline leading-none select-none cursor-pointer group hover:scale-105 transition-transform duration-300 ${className}`}
    >
      {variant === 'color' ? (
        <>
            <span className="font-sans font-[900] text-[1.8rem] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#E01E37] to-[#FF4D6D] drop-shadow-sm">
                Gifty
            </span>
            <span className="font-sans font-[900] text-[1.8rem] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#C9184A] to-[#FF8FA3] ml-[2px]">
                AI
            </span>
        </>
      ) : (
        <>
            <span className="font-sans font-[900] text-[1.8rem] tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                Gifty
            </span>
            <span className="font-sans font-[900] text-[1.8rem] tracking-tighter text-white/90 ml-[2px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                AI
            </span>
        </>
      )}
    </div>
  );
};