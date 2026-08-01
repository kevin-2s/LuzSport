import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  error,
  className = '',
  ...props
}) => {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2
        ${error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200 placeholder-red-300 bg-red-50/10' 
          : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100 placeholder-slate-400 bg-white'
        } ${className}`}
      {...props}
    />
  );
};
