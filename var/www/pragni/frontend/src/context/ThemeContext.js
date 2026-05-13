import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();
const THEME_KEY = 'pragni-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

const getPreferredTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === THEME_LIGHT || saved === THEME_DARK) return saved;
  } catch {}
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return THEME_LIGHT;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return THEME_DARK;
  return THEME_DARK;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === THEME_DARK ? THEME_LIGHT : THEME_DARK));
  const value = useMemo(() => ({ theme, setTheme, toggleTheme, isDark: theme === THEME_DARK }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
