import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    secondary: '#2196F3',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    error: '#B00020',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#69F0AE',
    secondary: '#64B5F6',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#CF6679',
    success: '#69F0AE',
    warning: '#FFD54F',
    info: '#64B5F6',
  },
};

export type AppTheme = typeof lightTheme; 