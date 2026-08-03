import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'px-8 py-3.5 rounded-[45px] text-[11px] uppercase tracking-[2.5px] font-semibold transition-all duration-300 ease-out outline-none border-none shadow-[0px_8px_15px_rgba(0,0,0,0.08)] active:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-[7px] hover:shadow-[0px_15px_20px_rgba(194,65,12,0.4)]',
    secondary: 'bg-white text-neutral-textPrimary border border-neutral-border hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-[7px] hover:shadow-[0px_15px_20px_rgba(194,65,12,0.4)]',
    outline: 'bg-transparent text-neutral-textSecondary border border-neutral-border hover:bg-slate-50 hover:-translate-y-[5px] hover:shadow-[0px_10px_15px_rgba(0,0,0,0.08)]',
    danger: 'bg-semantic-danger text-white hover:bg-red-700 hover:-translate-y-[7px] hover:shadow-[0px_15px_20px_rgba(220,38,38,0.4)]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="loading loading-infinity loading-sm mr-2 text-current"></span>
      ) : null}
      {children}
    </button>
  );
};