import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const themes = [
  { id: 'light', name: 'Light', description: 'Cozy & warm' },
  { id: 'dark', name: 'Dark', description: 'Classic dark' },
  { id: 'neon-blue', name: 'Neon Blue', description: 'Cyberpunk cyan' },
  { id: 'neon-pink', name: 'Neon Pink', description: 'Cyberpunk magenta' },
  { id: 'neon-purple', name: 'Neon Purple', description: 'Cyberpunk violet' },
];

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('bl_theme');
    return saved || 'dark';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('bl_theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  const isNeon = theme.startsWith('neon-');

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      cycleTheme,
      themes,
      isNeon,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
