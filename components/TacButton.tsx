
import React from 'react';

interface TacButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'danger' | 'warning';
  className?: string;
  disabled?: boolean;
}

const TacButton: React.FC<TacButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  className = '',
  disabled = false
}) => {
  const baseStyle = "relative px-4 py-2 font-bold uppercase tracking-widest text-sm transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-emerald-800 text-emerald-500 hover:bg-emerald-500/10 active:bg-emerald-500/20",
    danger: "border-red-800 text-red-500 hover:bg-red-500/10 active:bg-red-500/20",
    warning: "border-amber-800 text-amber-500 hover:bg-amber-500/10 active:bg-amber-500/20"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-inherit"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-inherit"></div>
      {children}
    </button>
  );
};

export default TacButton;
