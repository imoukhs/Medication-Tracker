import React, { useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import AuthService from '../services/AuthService';
import BiometricService from '../services/BiometricService';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, themeMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleEmergencyContactPress = () => {
    navigation.navigate('EmergencyContact', { modal: true });
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        const isAvailable = await BiometricService.isBiometricAvailable();
        if (!isAvailable) {
          Alert.alert('Error', 'Biometric authentication is not available on your device');
          return;
        }
        const success = await BiometricService.authenticateWithBiometrics('Enable biometric login');
        if (success) {
          setBiometricEnabled(true);
        }
      } else {
        const success = await BiometricService.disableBiometrics();
        if (success) {
          setBiometricEnabled(false);
        }
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to toggle biometric authentication');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderSettingItem = (
    icon: string,
    label: string,
    description: string,
    onPress: () => void,
    showArrow = true
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="moon" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {themeMode === 'dark' ? 'On' : 'Off'}
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get reminders for your medications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="finger-print" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Biometric Lock</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Secure app with fingerprint or face ID
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>

          {renderSettingItem(
            'shield-checkmark',
            'Privacy Settings',
            'Manage your privacy preferences',
            () => navigation.navigate('PrivacyAndSecurity', { modal: true })
          )}

          {renderSettingItem(
            'people',
            'Emergency Contacts',
            'Manage emergency contacts',
            handleEmergencyContactPress
          )}
        </View>

        <View style={[styles.section, styles.logoutSection]}>
          {renderSettingItem(
            'log-out',
            'Sign Out',
            'Sign out of your account',
            handleLogout,
            false
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  logoutSection: {
    marginTop: 20,
  },
});

export default SettingsScreen; 