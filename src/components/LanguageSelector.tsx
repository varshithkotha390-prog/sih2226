import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../i18n';
import { Language } from '../types';

export interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  direction?: 'up' | 'down';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  direction = 'down',
  className = ''
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((item) => {
          const isActive = item.code === language;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelect(item.code)}
              className={`flex items-center justify-between p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-[#0F3D2E] bg-emerald-950/5 text-[#0F3D2E] font-extrabold shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div>
                <span className="block text-sm font-bold">{item.nativeName}</span>
                <span className="block text-xs text-slate-400 font-medium">{item.name}</span>
              </div>
              {isActive && <Check className="w-4 h-4 text-[#0F3D2E] stroke-[3]" />}
            </button>
          );
        })}
      </div>
    );
  }

  const dropdownPositionClass =
    direction === 'up'
      ? 'absolute right-0 bottom-full mb-2'
      : 'absolute right-0 mt-2';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        id="language-selector-btn"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all cursor-pointer select-none font-bold ${
          variant === 'compact'
            ? 'px-2.5 py-1.5 bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 text-xs border border-slate-200/90'
            : 'px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm shadow-xs'
        }`}
      >
        <Globe className="w-4 h-4 text-[#0F3D2E] stroke-[2.2]" />
        <span className="font-extrabold tracking-tight">{currentOption.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t('selectLanguage')}
          className={`${dropdownPositionClass} w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#0F3D2E]" />
              {t('selectLanguage')}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
            {SUPPORTED_LANGUAGES.map((item) => {
              const isActive = item.code === language;
              return (
                <button
                  key={item.code}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950/5 text-[#0F3D2E] font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-snug">{item.nativeName}</span>
                    <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                      {item.name}
                    </span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[#0F3D2E] stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
