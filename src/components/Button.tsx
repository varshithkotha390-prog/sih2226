import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-2.5 px-4 text-sm font-bold rounded-xl min-h-[44px]',
    md: 'py-3 px-5 text-base font-bold rounded-2xl min-h-[48px]',
    lg: 'py-3.5 px-6 text-base sm:text-lg font-bold rounded-2xl min-h-[54px] shadow-sm tracking-wide',
    xl: 'py-4 px-6 sm:px-8 text-lg sm:text-xl font-black rounded-2xl min-h-[60px] shadow-md tracking-wide'
  };

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white active:bg-emerald-800 shadow-sm shadow-emerald-900/10 active:scale-[0.99] transition-all font-bold',
    secondary:
      'bg-slate-900 hover:bg-slate-950 text-white active:bg-slate-800 shadow-sm active:scale-[0.99] transition-all font-bold',
    accent:
      'bg-amber-500 hover:bg-amber-600 text-slate-950 active:bg-amber-700 shadow-sm active:scale-[0.99] transition-all font-bold',
    outline:
      'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 active:bg-slate-100 transition-all font-bold shadow-xs',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white active:bg-rose-800 shadow-sm active:scale-[0.99] transition-all font-bold',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200 border-none shadow-none font-bold'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`inline-flex items-center justify-center gap-2.5 select-none text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-current" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>
          )}
          <span className="inline-flex items-center justify-center leading-tight">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
