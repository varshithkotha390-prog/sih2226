import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'slate' | 'rose' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  icon,
  className = ''
}) => {
  const variantClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 font-bold',
    blue: 'bg-blue-100 text-blue-700 font-bold',
    amber: 'bg-amber-100 text-amber-700 font-bold',
    slate: 'bg-slate-100 text-slate-700 font-bold',
    rose: 'bg-rose-100 text-rose-700 font-bold',
    purple: 'bg-purple-100 text-purple-700 font-bold'
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide',
    md: 'text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider',
    lg: 'text-xs sm:text-sm px-4 py-1.5 rounded-full font-bold uppercase tracking-wider'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap select-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0 text-current">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
