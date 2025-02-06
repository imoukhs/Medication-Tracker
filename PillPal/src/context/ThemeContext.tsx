import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { ThemeColors, ThemeMode } from '../theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isSystemTheme: boolean;
  setIsSystemTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  colors: theme.light,
  toggleTheme: () => {},
  setThemeMode: () => {},
  isSystemTheme: true,
  setIsSystemTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_STORAGE_KEY = '@theme_mode';
const SYSTEM_THEME_STORAGE_KEY = '@use_system_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() as ThemeMode;
  const [themeMode, setThemeMode] = useState<ThemeMode>(systemColorScheme || 'light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  useEffect(() => {
    loadThemePreference();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (isSystemTheme && colorScheme) {
        setThemeMode(colorScheme as ThemeMode);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const [savedTheme, savedSystemTheme] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(SYSTEM_THEME_STORAGE_KEY),
      ]);

      const useSystemTheme = savedSystemTheme ? JSON.parse(savedSystemTheme) : true;
      setIsSystemTheme(useSystemTheme);

      if (useSystemTheme) {
        setThemeMode(systemColorScheme || 'light');
      } else if (savedTheme) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: ThemeMode, useSystem: boolean) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(THEME_STORAGE_KEY, mode),
        AsyncStorage.setItem(SYSTEM_THEME_STORAGE_KEY, JSON.stringify(useSystem)),
      ]);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setIsSystemTheme(false);
    saveThemePreference(newMode, false);
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsSystemTheme(false);
    saveThemePreference(mode, false);
  };

  const handleSetIsSystemTheme = (value: boolean) => {
    setIsSystemTheme(value);
    if (value) {
      const currentSystemTheme = Appearance.getColorScheme() as ThemeMode;
      setThemeMode(currentSystemTheme || 'light');
      saveThemePreference(currentSystemTheme || 'light', true);
    }
  };

  const value = {
    themeMode,
    colors: theme[themeMode],
    toggleTheme,
    setThemeMode: handleSetThemeMode,
    isSystemTheme,
    setIsSystemTheme: handleSetIsSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 