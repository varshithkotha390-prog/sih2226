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
    emerald: 'bg-emerald-950/10 text-[#0F3D2E] border border-emerald-800/20 font-mono font-bold',
    blue: 'bg-blue-100/90 text-blue-800 border border-blue-200 font-mono font-bold',
    amber: 'bg-amber-100 text-[#D97706] border border-amber-300/60 font-mono font-bold',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200/90 font-mono font-bold',
    rose: 'bg-rose-100 text-rose-700 border border-rose-200 font-mono font-bold',
    purple: 'bg-purple-100 text-purple-700 border border-purple-200 font-mono font-bold'
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
