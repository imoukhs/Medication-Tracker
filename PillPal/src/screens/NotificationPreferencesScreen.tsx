import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import NotificationPreferencesService, { NotificationPreferences } from '../services/NotificationPreferencesService';

type NotificationPreferencesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NotificationPreferencesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NotificationPreferencesScreenNavigationProp>();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    medicationReminders: true,
    refillAlerts: true,
    missedDoseAlerts: true,
    emergencyContactAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true,
    dailySummary: false,
    reminderTime: '09:00',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await NotificationPreferencesService.getPreferences();
      setPreferences(savedPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await NotificationPreferencesService.savePreferences(preferences);
      Alert.alert('Success', 'Notification preferences updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification preferences');
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notification Preferences</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          
          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Medication Reminders
              </Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Get notified when it's time to take your medication
              </Text>
            </View>
            <Switch
              value={preferences.medicationReminders}
              onValueChange={() => togglePreference('medicationReminders')}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Refill Alerts
              </Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Get notified when medication supply is running low
              </Text>
            </View>
            <Switch
              value={preferences.refillAlerts}
              onValueChange={() => togglePreference('refillAlerts')}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Missed Dose Alerts
              </Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Get notified if you miss taking your medication
              </Text>
            </View>
            <Switch
              value={preferences.missedDoseAlerts}
              onValueChange={() => togglePreference('missedDoseAlerts')}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Emergency Contact Alerts
              </Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Notify emergency contacts for critical events
              </Text>
            </View>
            <Switch
              value={preferences.emergencyContactAlerts}
              onValueChange={() => togglePreference('emergencyContactAlerts')}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alert Style</Text>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Sound
              </Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Play sound with notifications
              </Text>
            </View>
            <Switch
              value={preferences.soundEnabled}
              onValueChange={() => togglePreference('soundEnabled')}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Vibration
              </Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Vibrate with notifications
              </Text>
            </View>
            <Switch
              value={preferences.vibrationEnabled}
              onValueChange={() => togglePreference('vibrationEnabled')}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>

          <View style={[styles.preferenceItem, { borderBottomColor: colors.border }]}>
            <View style={styles.preferenceContent}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Daily Summary
              </Text>
              <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                Receive a daily summary of your medication schedule
              </Text>
            </View>
            <Switch
              value={preferences.dailySummary}
              onValueChange={() => togglePreference('dailySummary')}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceContent: {
    flex: 1,
    marginRight: 10,
  },
  preferenceLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default NotificationPreferencesScreen; 