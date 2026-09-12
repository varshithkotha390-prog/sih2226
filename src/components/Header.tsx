import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

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
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, updateLanguage } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

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

          {showLanguageToggle && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-xs transition-colors"
                title="Select Language / भाषा चुनें"
              >
                <span className="text-xs">{currentLang?.flag || '🌐'}</span>
                <span className="font-bold">{currentLang?.native || 'English'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLangMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Language / भाषा
                    </div>
                    {SUPPORTED_LANGUAGES.map((langOpt) => {
                      const isSelected = language === langOpt.code;
                      return (
                        <button
                          key={langOpt.code}
                          type="button"
                          onClick={async () => {
                            setShowLangMenu(false);
                            if (langOpt.code === language) return;
                            if (isAuthenticated && updateLanguage) {
                              await updateLanguage(langOpt.code);
                            } else {
                              setLanguage(langOpt.code);
                            }
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#0F3D2E]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{langOpt.flag}</span>
                            <span className="font-bold">{langOpt.native}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({langOpt.label})</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#0F3D2E] stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
