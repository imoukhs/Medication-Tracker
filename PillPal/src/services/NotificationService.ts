import * as Notifications from 'expo-notifications';
import { Medication, NotificationUpdate } from '../types';
import HistoryService from './HistoryService';

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
    this.requestPermissions();
    this.setupNotificationListener();
  }

  private async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  private setupNotificationListener() {
    Notifications.addNotificationResponseReceivedListener(response => {
      const { medicationId, action } = response.notification.request.content.data;
      if (action === 'TAKE') {
        this.handleMedicationTaken(medicationId);
      }
    });
  }

  private async handleMedicationTaken(medicationId: string) {
    try {
      await HistoryService.addHistoryEntry({
        medicationId,
        timestamp: Date.now(),
        taken: true,
      });
    } catch (error) {
      console.error('Error recording medication taken:', error);
    }
  }

  async scheduleMedicationReminder(medication: Medication): Promise<string> {
    try {
      const scheduledTime = new Date(medication.scheduledTime);
      const now = new Date();
      
      if (scheduledTime < now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const trigger = {
        hour: scheduledTime.getHours(),
        minute: scheduledTime.getMinutes(),
        type: 'daily',
      } as Notifications.NotificationTriggerInput;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to take ${medication.name}`,
          body: `${medication.dosage} - ${medication.instructions}`,
          data: { medicationId: medication.id, action: 'TAKE' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      if (medication.supply <= medication.lowSupplyThreshold) {
        await this.scheduleLowSupplyAlert(medication);
      }

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async scheduleLowSupplyAlert(medication: Medication): Promise<string> {
    const trigger = {
      hour: 9, // Schedule low supply alerts for 9 AM
      minute: 0,
      type: 'daily',
    } as Notifications.NotificationTriggerInput;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Low Supply Alert: ${medication.name}`,
        body: `You have ${medication.supply} doses remaining. Please refill soon.`,
        data: { medicationId: medication.id, type: 'LOW_SUPPLY' },
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
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
      
      const trigger = updates.scheduledTime ? {
        hour: updates.scheduledTime.getHours(),
        minute: updates.scheduledTime.getMinutes(),
        type: 'daily',
      } as Notifications.NotificationTriggerInput : null;

      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: updates.title,
          body: updates.body,
          data: updates.data,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
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