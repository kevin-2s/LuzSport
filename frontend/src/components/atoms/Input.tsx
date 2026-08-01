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
          ? 'border-semantic-danger focus:border-semantic-danger focus:ring-red-200 placeholder-red-300 bg-red-50/10' 
          : 'border-neutral-border focus:border-primary focus:ring-primary/20 placeholder-neutral-textDisabled bg-white'
        } ${className}`}
      {...props}
    />
  );
};
