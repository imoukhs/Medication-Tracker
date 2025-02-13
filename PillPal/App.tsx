import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { HelpProvider } from './src/context/HelpContext';
import AppNavigator from './src/navigation/AppNavigator';
import { linking } from './src/utils/linking';
import SplashScreen from './src/screens/SplashScreen';
import { useAuth } from './src/context/AuthContext';
import { useTheme } from './src/context/ThemeContext';
import HelpModal from './src/components/HelpModal';

function AppContent() {
  const { loading } = useAuth();
  const { colors, themeMode } = useTheme();

  const paperTheme = themeMode === 'dark' ? {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      error: colors.error,
    },
  } : {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      error: colors.error,
    },
  };

  if (loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
      <HelpModal />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HelpProvider>
          <AppContent />
        </HelpProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
