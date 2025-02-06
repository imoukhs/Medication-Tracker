import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFERENCES_KEY = '@notification_preferences';

export interface NotificationPreferences {
  medicationReminders: boolean;
  refillAlerts: boolean;
  missedDoseAlerts: boolean;
  emergencyContactAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  dailySummary: boolean;
  reminderTime: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  medicationReminders: true,
  refillAlerts: true,
  missedDoseAlerts: true,
  emergencyContactAlerts: true,
  soundEnabled: true,
  vibrationEnabled: true,
  dailySummary: false,
  reminderTime: '09:00',
};

class NotificationPreferencesService {
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      return data ? JSON.parse(data) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  async savePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      throw new Error('Failed to save notification preferences');
    }
  }

  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<void> {
    try {
      const currentPreferences = await this.getPreferences();
      const updatedPreferences = { ...currentPreferences, ...updates };
      await this.savePreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  async resetToDefaults(): Promise<void> {
    try {
      await this.savePreferences(DEFAULT_PREFERENCES);
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
      throw new Error('Failed to reset notification preferences');
    }
  }
}

export default new NotificationPreferencesService(); 