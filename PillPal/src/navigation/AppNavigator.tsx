import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import CustomTabBar from '../components/CustomTabBar';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MedicationDetailsScreen from '../screens/MedicationDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import EditMedicationScreen from '../screens/EditMedicationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EmergencyContactScreen from '../screens/EmergencyContactScreen';
import PersonalInformationScreen from '../screens/PersonalInformationScreen';
import MedicalInformationScreen from '../screens/MedicalInformationScreen';
import NotificationPreferencesScreen from '../screens/NotificationPreferencesScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SharedAccessScreen from '../screens/SharedAccessScreen';

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  const { colors, themeMode } = useTheme();
  const currentTheme = theme[themeMode];

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? currentTheme.primary : colors.text}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              size={24}
              color={focused ? currentTheme.primary : colors.text}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={focused ? currentTheme.primary : colors.text}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={focused ? currentTheme.primary : colors.text}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { colors, themeMode } = useTheme();
  const currentTheme = theme[themeMode];

  return (
    <NavigationContainer
      theme={{
        dark: themeMode === 'dark',
        colors: {
          primary: currentTheme.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: currentTheme.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: currentTheme.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MedicationDetails"
          component={MedicationDetailsScreen}
          options={{ title: 'Medication Details' }}
        />
        <Stack.Screen
          name="AddMedication"
          component={AddMedicationScreen}
          options={{ title: 'Add Medication' }}
        />
        <Stack.Screen
          name="EditMedication"
          component={EditMedicationScreen}
          options={{ title: 'Edit Medication' }}
        />
        <Stack.Screen
          name="EmergencyContact"
          component={EmergencyContactScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="PersonalInformation"
          component={PersonalInformationScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="MedicalInformation"
          component={MedicalInformationScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="NotificationPreferences"
          component={NotificationPreferencesScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="SharedAccess"
          component={SharedAccessScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 