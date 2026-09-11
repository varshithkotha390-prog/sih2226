import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'normal' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlTheme = params.get('theme') as ThemeMode;
        if (urlTheme === 'normal' || urlTheme === 'light' || urlTheme === 'dark') {
          localStorage.setItem('kabadiconnect_theme', urlTheme);
          return urlTheme;
        }
      }
      const saved = localStorage.getItem('kabadiconnect_theme') as ThemeMode;
      if (saved === 'normal' || saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Ignore localStorage access errors
    }
    return 'normal';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('kabadiconnect_theme', newTheme);
    } catch {
      // Ignore localStorage errors
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
