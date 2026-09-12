import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLanguageToggle?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showLanguageToggle = true,
  rightAction
}) => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label={t('back')}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="w-9 h-9 bg-[#0F3D2E] rounded-xl flex items-center justify-center shadow-md shadow-emerald-950/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-[#121820] tracking-tight truncate">
              {title || t('appName')}
            </h1>
            {subtitle && (
              <p className="text-xs font-bold text-[#0F3D2E] tracking-wide truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {rightAction}

          {/* Laptop & Mobile Quick Theme Mode Switcher */}
          <ThemeToggle variant="compact" />

          {showLanguageToggle && <LanguageSelector variant="compact" />}
        </div>
      </div>
    </header>
  );
};
