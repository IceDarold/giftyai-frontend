import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative py-3.5 px-6 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide overflow-visible";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-[0_4px_14px_0_rgba(0,111,255,0.39)] hover:shadow-[0_6px_20px_rgba(174,0,255,0.23)] hover:brightness-110 border-none",
    secondary: "bg-white text-brand-blue shadow-lg hover:bg-blue-50",
    ghost: "bg-transparent text-white/80 hover:text-white border border-transparent hover:bg-white/10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <span className="relative z-20">{children}</span>
    </button>
  );
};