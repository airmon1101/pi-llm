'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

type ThemeContextType = {
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSetting, loaded } = useSettings();

  useEffect(() => {
    if (!loaded) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme, loaded]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, setTheme: (t) => updateSetting('theme', t) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
