import React, { useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';

type PrivacyAndSecurityScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrivacyAndSecurity'>;

const PrivacyAndSecurityScreen = () => {
  const navigation = useNavigation<PrivacyAndSecurityScreenNavigationProp>();
  const { colors } = useTheme();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const renderSettingItem = (
    icon: string,
    label: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: colors.primary }}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy Settings</Text>
          {renderSettingItem(
            'location',
            'Location Services',
            'Allow app to access your location',
            locationEnabled,
            setLocationEnabled
          )}
          {renderSettingItem(
            'share-social',
            'Data Sharing',
            'Share anonymous usage data to improve our services',
            dataSharing,
            setDataSharing
          )}
          {renderSettingItem(
            'analytics',
            'Analytics',
            'Help us improve by sending anonymous analytics',
            analyticsEnabled,
            setAnalyticsEnabled
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('ChangePassword', { modal: true })}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="key" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Change Password</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Update your account password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Privacy</Text>
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="download" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Download My Data</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get a copy of your personal data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="trash" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Delete Account</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Permanently delete your account and data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
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
});

export default PrivacyAndSecurityScreen; 