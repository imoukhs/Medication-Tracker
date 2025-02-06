import * as Notifications from 'expo-notifications';
import { Medication, NotificationUpdate } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    // Request permissions on initialization
    this.requestPermissions();
  }

  private async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleMedicationReminder(medication: Medication): Promise<string> {
    try {
      const notification = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to take ${medication.name}`,
          body: `${medication.dosage} - ${medication.instructions}`,
          data: { medicationId: medication.id },
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  }

  async updateNotification(
    notificationId: string,
    updates: NotificationUpdate
  ): Promise<void> {
    try {
      await this.cancelNotification(notificationId);
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: updates.title,
          body: updates.body,
          data: updates.data,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export default new NotificationService(); 