import React, { useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useHelp } from '../context/HelpContext';
import { RootStackParamList } from '../types';
import AuthService from '../services/AuthService';
import BiometricService from '../services/BiometricService';
import supabaseSharedAccessService from '../services/SupabaseSharedAccessService';
import SettingItem from '../components/SettingItem';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, themeMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { signOut } = useAuth();
  const { showHelpModal } = useHelp();
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
              await signOut();
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

  const handleClearData = async () => {
    Alert.alert(
      'Clear Account Data',
      'This will permanently delete all your medications, emergency contacts, achievements, and notification preferences. This action cannot be undone. Your account will remain active.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              const { error } = await supabaseSharedAccessService.clearAccountData();
              if (error) {
                throw error;
              }
              Alert.alert('Success', 'Your account data has been cleared successfully.');
              navigation.navigate('MainTabs');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear account data. Please try again.');
              console.error('Error clearing account data:', error);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const { error } = await supabaseSharedAccessService.deleteAccount();
              if (error) {
                throw error;
              }
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
              console.error('Error deleting account:', error);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    label: string,
    description: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    isDestructive: boolean = false
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: isDestructive ? `${colors.error}20` : `${colors.primary}20` }]}>
          <Ionicons 
            name={icon as any} 
            size={22} 
            color={isDestructive ? colors.error : colors.primary} 
          />
        </View>
      </View>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingLabel, 
          { color: isDestructive ? colors.error : colors.text }
        ]}>
          {label}
        </Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          {renderSettingItem(
            themeMode === 'dark' ? 'moon' : 'sunny',
            'Dark Mode',
            'Switch between light and dark theme',
            undefined,
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: `${colors.primary}80` }}
              thumbColor={themeMode === 'dark' ? colors.primary : '#f4f3f4'}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
          {renderSettingItem(
            'notifications',
            'Push Notifications',
            'Get reminders for your medications',
            undefined,
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: `${colors.primary}80` }}
              thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
          {renderSettingItem(
            'finger-print',
            'Biometric Lock',
            'Secure app with fingerprint or face ID',
            undefined,
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#767577', true: `${colors.primary}80` }}
              thumbColor={biometricEnabled ? colors.primary : '#f4f3f4'}
            />
          )}
          {renderSettingItem(
            'shield-checkmark',
            'Privacy Settings',
            'Manage your privacy preferences',
            () => navigation.navigate('PrivacyAndSecurity', { modal: true })
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>General</Text>
          {renderSettingItem(
            'people',
            'Emergency Contacts',
            'Manage your emergency contacts',
            handleEmergencyContactPress
          )}
          {renderSettingItem(
            'help-circle',
            'Help & Support',
            'Get help using the app',
            showHelpModal
          )}
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Management</Text>
          <SettingItem
            icon="trash-outline"
            label="Clear Account Data"
            description="Delete all your data while keeping your account"
            onPress={handleClearData}
            isDestructive
            rightElement={isClearing ? <ActivityIndicator size="small" color={colors.error} /> : undefined}
          />
          <SettingItem
            icon="close-circle-outline"
            label="Delete Account"
            description="Permanently delete your account and all data"
            onPress={handleDeleteAccount}
            isDestructive
            rightElement={isDeleting ? <ActivityIndicator size="small" color={colors.error} /> : undefined}
          />
        </View>

        <View style={[styles.section, styles.logoutSection]}>
          {renderSettingItem(
            'log-out',
            'Sign Out',
            'Sign out of your account',
            handleLogout,
            undefined,
            true
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  logoutSection: {
    marginBottom: 24,
  },
});

export default SettingsScreen; 