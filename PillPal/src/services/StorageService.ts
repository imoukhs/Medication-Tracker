import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, UserPreferences, EmergencyContact } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: '@preferences',
  MEDICATIONS: '@medications',
  EMERGENCY_CONTACTS: '@emergency_contacts',
};

class StorageService {
  static async getPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  static async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  static async getMedications(): Promise<Medication[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  }

  static async saveMedication(medication: Medication): Promise<void> {
    try {
      const medications = await this.getMedications();
      medications.push(medication);
      await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
    } catch (error) {
      console.error('Error saving medication:', error);
      throw error;
    }
  }

  static async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
    try {
      const medications = await this.getMedications();
      const index = medications.findIndex(med => med.id === id);
      if (index !== -1) {
        medications[index] = { ...medications[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
      }
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  static async deleteMedication(id: string): Promise<void> {
    try {
      const medications = await this.getMedications();
      const filtered = medications.filter(med => med.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  static async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  }

  static async saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving emergency contacts:', error);
      throw error;
    }
  }
}

export default StorageService; 