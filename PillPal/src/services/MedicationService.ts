import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication } from '../types';
import NotificationService from './NotificationService';

const MEDICATIONS_KEY = '@medications';

class MedicationService {
  async getMedications(): Promise<Medication[]> {
    try {
      const data = await AsyncStorage.getItem(MEDICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  }

  async getMedicationById(id: string): Promise<Medication | null> {
    try {
      const medications = await this.getMedications();
      return medications.find(med => med.id === id) || null;
    } catch (error) {
      console.error('Error getting medication by id:', error);
      return null;
    }
  }

  async addMedication(medication: Omit<Medication, 'id'>): Promise<Medication> {
    try {
      const medications = await this.getMedications();
      const newMedication: Medication = {
        ...medication,
        id: Date.now().toString(),
      };

      medications.push(newMedication);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));

      // Schedule notification for the new medication
      await NotificationService.scheduleMedicationReminder(newMedication);

      return newMedication;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw new Error('Failed to add medication');
    }
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    try {
      const medications = await this.getMedications();
      const index = medications.findIndex(med => med.id === id);
      
      if (index === -1) {
        throw new Error('Medication not found');
      }

      const updatedMedication = {
        ...medications[index],
        ...updates,
      };

      medications[index] = updatedMedication;
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));

      // Update notification if schedule changed
      if (updates.scheduledTime) {
        await NotificationService.updateNotification(id, {
          scheduledTime: new Date(updates.scheduledTime),
        });
      }

      return updatedMedication;
    } catch (error) {
      console.error('Error updating medication:', error);
      throw new Error('Failed to update medication');
    }
  }

  async deleteMedication(id: string): Promise<void> {
    try {
      const medications = await this.getMedications();
      const filteredMedications = medications.filter(med => med.id !== id);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(filteredMedications));

      // Cancel notifications for the deleted medication
      await NotificationService.cancelNotification(id);
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw new Error('Failed to delete medication');
    }
  }

  async updateSupply(id: string, newSupply: number): Promise<void> {
    try {
      const medications = await this.getMedications();
      const index = medications.findIndex(med => med.id === id);
      
      if (index === -1) {
        throw new Error('Medication not found');
      }

      medications[index].supply = newSupply;
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));

      // Check if supply is low and schedule alert if needed
      if (newSupply <= medications[index].lowSupplyThreshold) {
        await NotificationService.scheduleLowSupplyAlert(medications[index]);
      }
    } catch (error) {
      console.error('Error updating medication supply:', error);
      throw new Error('Failed to update medication supply');
    }
  }

  async checkLowSupplyMedications(): Promise<Medication[]> {
    try {
      const medications = await this.getMedications();
      return medications.filter(med => med.supply <= med.lowSupplyThreshold);
    } catch (error) {
      console.error('Error checking low supply medications:', error);
      return [];
    }
  }
}

export default new MedicationService(); 