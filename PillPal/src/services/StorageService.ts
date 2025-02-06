import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, UserPreferences, HistoryEntry } from '../types';

class StorageService {
  // Medication Management
  async saveMedication(medication: Medication): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem('medications');
      const medications = existingData ? JSON.parse(existingData) : [];
      medications.push(medication);
      await AsyncStorage.setItem('medications', JSON.stringify(medications));
    } catch (error) {
      console.error('Error saving medication:', error);
      throw error;
    }
  }

  async getMedications(): Promise<Medication[]> {
    try {
      const data = await AsyncStorage.getItem('medications');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
    try {
      const medications = await this.getMedications();
      const index = medications.findIndex(med => med.id === id);
      if (index !== -1) {
        medications[index] = { ...medications[index], ...updates };
        await AsyncStorage.setItem('medications', JSON.stringify(medications));
      }
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  async deleteMedication(id: string): Promise<void> {
    try {
      const medications = await this.getMedications();
      const filtered = medications.filter(med => med.id !== id);
      await AsyncStorage.setItem('medications', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  // User Preferences
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem('user_preferences');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  // History Management
  async saveHistoryEntry(entry: HistoryEntry): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem('history');
      const history = existingData ? JSON.parse(existingData) : [];
      history.push(entry);
      await AsyncStorage.setItem('history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history entry:', error);
      throw error;
    }
  }

  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const data = await AsyncStorage.getItem('history');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }
}

export default new StorageService(); 