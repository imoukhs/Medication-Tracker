export const theme = {
  light: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    error: '#B00020',
  },
  dark: {
    primary: '#69F0AE',
    secondary: '#64B5F6',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#CF6679',
  },
};

export type Theme = typeof theme.light;
export type ThemeMode = keyof typeof theme;

export default theme; 