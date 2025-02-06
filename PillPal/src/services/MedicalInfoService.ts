import AsyncStorage from '@react-native-async-storage/async-storage';

const MEDICAL_INFO_KEY = '@medical_info';

export interface MedicalInfo {
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
  weight: string;
  height: string;
  notes: string;
}

class MedicalInfoService {
  async saveMedicalInfo(info: MedicalInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(MEDICAL_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Error saving medical info:', error);
      throw new Error('Failed to save medical information');
    }
  }

  async getMedicalInfo(): Promise<MedicalInfo | null> {
    try {
      const data = await AsyncStorage.getItem(MEDICAL_INFO_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting medical info:', error);
      return null;
    }
  }

  async updateMedicalInfo(updates: Partial<MedicalInfo>): Promise<void> {
    try {
      const currentInfo = await this.getMedicalInfo();
      const updatedInfo = { ...currentInfo, ...updates };
      await this.saveMedicalInfo(updatedInfo as MedicalInfo);
    } catch (error) {
      console.error('Error updating medical info:', error);
      throw new Error('Failed to update medical information');
    }
  }

  async clearMedicalInfo(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MEDICAL_INFO_KEY);
    } catch (error) {
      console.error('Error clearing medical info:', error);
      throw new Error('Failed to clear medical information');
    }
  }
}

export default new MedicalInfoService(); 