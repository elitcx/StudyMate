import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../../utils/theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(null); // null = follow system

  const isDark = override !== null ? override === 'dark' : systemScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => setOverride(isDark ? 'light' : 'dark');
  const setTheme = (scheme) => setOverride(scheme); // 'light' | 'dark' | null

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
