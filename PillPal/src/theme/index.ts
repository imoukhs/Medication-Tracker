export const theme = {
  light: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A1A',
    textSecondary: '#757575',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    card: '#FFFFFF',
    border: 'rgba(0,0,0,0.1)',
    icon: '#1A1A1A',
    statusBar: 'dark',
    elevation: '#000',
  },
  dark: {
    primary: '#00E676',
    secondary: '#448AFF',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    error: '#FF5252',
    success: '#69F0AE',
    warning: '#FFD740',
    card: '#2C2C2C',
    border: 'rgba(255,255,255,0.1)',
    icon: '#FFFFFF',
    statusBar: 'light',
    elevation: '#000',
  },
};

export type ThemeColors = typeof theme.light;
export type ThemeMode = keyof typeof theme;

export default theme; 