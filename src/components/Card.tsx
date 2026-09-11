import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'highlight' | 'accent' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3.5 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6'
  };

  const variantClasses = {
    default: 'bg-white border border-slate-200/90 shadow-xs rounded-2xl',
    elevated: 'bg-white border border-slate-200 shadow-sm rounded-2xl',
    highlight: 'bg-[#0F3D2E]/5 border-2 border-[#0F3D2E]/40 rounded-2xl shadow-xs',
    accent: 'bg-amber-50/80 border-2 border-amber-300 rounded-2xl shadow-xs',
    outlined: 'bg-transparent border-2 border-slate-200 rounded-2xl'
  };

  return (
    <div
      className={`transition-all duration-150 ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
