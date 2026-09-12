import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, TranslationKey, SUPPORTED_LANGUAGES } from './index';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'kabadiconnect_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && ['en', 'hi', 'te', 'ta', 'kn', 'ml'].includes(saved)) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    // Cycle between en -> hi or through languages
    setLanguageState((prev) => {
      const next: Language = prev === 'en' ? 'hi' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = translations[language] || translations.en;
      let text = (dict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || String(key);

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }
      return text;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
