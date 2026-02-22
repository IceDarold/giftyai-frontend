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
    primary: "bg-gradient-to-r from-brand-main to-brand-accent text-white shadow-[0_10px_25px_rgba(255,142,158,0.3)] hover:shadow-[0_15px_35px_rgba(255,142,158,0.4)] hover:brightness-110 border-none",
    secondary: "bg-white text-brand-main shadow-lg hover:bg-rose-50 border border-rose-100",
    ghost: "bg-transparent text-brand-dark/60 hover:text-brand-dark border border-transparent hover:bg-brand-main/5"
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