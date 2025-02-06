import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MedicationDetailsScreen from './src/screens/MedicationDetailsScreen';
import AddMedicationScreen from './src/screens/AddMedicationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import EmergencyContactScreen from './src/screens/EmergencyContactScreen';
import PersonalInformationScreen from './src/screens/PersonalInformationScreen';
import MedicalInformationScreen from './src/screens/MedicalInformationScreen';
import NotificationPreferencesScreen from './src/screens/NotificationPreferencesScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SplashScreen from './src/screens/SplashScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import { RootStackParamList } from './src/types';
import CustomTabBar from './src/components/CustomTabBar';
import AuthService from './src/services/AuthService';
import AppNavigator from './src/navigation/AppNavigator';
import { linking } from './src/utils/linking';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await AuthService.initialize();
      setIsAuthenticated(AuthService.isAuthenticated());
      setIsLoading(false);
      setTimeout(() => {
        setShowSplash(false);
      }, 2000);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
      setShowSplash(false);
    }
  };

  if (showSplash || isLoading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return (
    <ThemeProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
