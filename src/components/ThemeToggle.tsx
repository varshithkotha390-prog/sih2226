import React from 'react';
import { Sun, Sparkles, Moon } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

export interface ThemeToggleProps {
  variant?: 'compact' | 'expanded';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'expanded',
  className = ''
}) => {
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();

  const options: { id: ThemeMode; labelEn: string; labelHi: string; icon: React.ReactNode }[] = [
    {
      id: 'light',
      labelEn: 'Light',
      labelHi: 'उजाला',
      icon: <Sun className="w-3.5 h-3.5" />
    },
    {
      id: 'normal',
      labelEn: 'Normal',
      labelHi: 'सामान्य',
      icon: <Sparkles className="w-3.5 h-3.5" />
    },
    {
      id: 'dark',
      labelEn: 'Dark',
      labelHi: 'गहरा',
      icon: <Moon className="w-3.5 h-3.5" />
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 theme-surface-subtle ${className}`}>
        {options.map((opt) => {
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              title={language === 'hi' ? `${opt.labelHi} मोड` : `${opt.labelEn} Mode`}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#0F3D2E] shadow-xs font-bold theme-toggle-active'
                  : 'text-slate-500 hover:text-slate-900 theme-text-muted'
              }`}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 theme-text-muted">
          {language === 'hi' ? 'लैपटॉप डिस्प्ले मोड' : 'Display Mode'}
        </span>
        <span className="text-[10px] font-mono font-bold text-[#0F3D2E] theme-text-primary capitalize bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
          {theme}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 theme-surface-subtle">
        {options.map((opt) => {
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#0F3D2E] shadow-xs font-black theme-toggle-active'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 theme-text-secondary'
              }`}
            >
              {opt.icon}
              <span className="truncate">{language === 'hi' ? opt.labelHi : opt.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
