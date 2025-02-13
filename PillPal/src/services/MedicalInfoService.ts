import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabaseConfig';

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
  private getMedicalInfoKey(userId: string): string {
    return `medical_info_${userId}`;
  }

  async saveMedicalInfo(info: MedicalInfo): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('medical_info')
        .upsert({
          user_id: user.id,
          ...info,
        })
        .select()
        .single();

      if (error) throw error;
    } catch (error) {
      console.error('Error saving medical info:', error);
      throw new Error('Failed to save medical information');
    }
  }

  async getMedicalInfo(): Promise<MedicalInfo | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('medical_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No data found
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return {
        bloodType: data.bloodType || '',
        allergies: data.allergies || '',
        conditions: data.conditions || '',
        medications: data.medications || '',
        weight: data.weight || '',
        height: data.height || '',
        notes: data.notes || '',
      };
    } catch (error) {
      console.error('Error getting medical info:', error);
      return null;
    }
  }

  async updateMedicalInfo(updates: Partial<MedicalInfo>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('medical_info')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating medical info:', error);
      throw new Error('Failed to update medical information');
    }
  }

  async clearMedicalInfo(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('medical_info')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing medical info:', error);
      throw new Error('Failed to clear medical information');
    }
  }
}

export default new MedicalInfoService(); 