import { supabase } from '../config/supabaseConfig';

export interface MedicationHistory {
  id: string;
  medication_id: string;
  user_id: string;
  taken_at: string;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
  created_at?: string;
}

class MedicationHistoryService {
  async logMedicationIntake(
    medicationId: string,
    userId: string,
    status: MedicationHistory['status'],
    notes?: string
  ): Promise<{ history: MedicationHistory | null; error: Error | null }> {
    try {
      const historyEntry = {
        medication_id: medicationId,
        user_id: userId,
        taken_at: new Date().toISOString(),
        status,
        notes,
      };

      const { data, error } = await supabase
        .from('medication_history')
        .insert([historyEntry])
        .select()
        .single();

      if (error) throw error;

      return { history: data, error: null };
    } catch (error) {
      console.error('Error logging medication intake:', error);
      return { history: null, error: error as Error };
    }
  }

  async getMedicationHistory(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ history: MedicationHistory[]; error: Error | null }> {
    try {
      let query = supabase
        .from('medication_history')
        .select('*')
        .eq('user_id', userId);

      if (startDate) {
        query = query.gte('taken_at', startDate);
      }
      if (endDate) {
        query = query.lte('taken_at', endDate);
      }

      const { data, error } = await query.order('taken_at', { ascending: false });

      if (error) throw error;

      return { history: data || [], error: null };
    } catch (error) {
      console.error('Error fetching medication history:', error);
      return { history: [], error: error as Error };
    }
  }

  async getMedicationHistoryByMedication(
    medicationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ history: MedicationHistory[]; error: Error | null }> {
    try {
      let query = supabase
        .from('medication_history')
        .select('*')
        .eq('medication_id', medicationId);

      if (startDate) {
        query = query.gte('taken_at', startDate);
      }
      if (endDate) {
        query = query.lte('taken_at', endDate);
      }

      const { data, error } = await query.order('taken_at', { ascending: false });

      if (error) throw error;

      return { history: data || [], error: null };
    } catch (error) {
      console.error('Error fetching medication history:', error);
      return { history: [], error: error as Error };
    }
  }

  async getAdherenceRate(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ adherenceRate: number; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('medication_history')
        .select('*')
        .eq('user_id', userId)
        .gte('taken_at', startDate)
        .lte('taken_at', endDate);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { adherenceRate: 0, error: null };
      }

      const takenCount = data.filter(entry => entry.status === 'taken').length;
      const adherenceRate = (takenCount / data.length) * 100;

      return { adherenceRate, error: null };
    } catch (error) {
      console.error('Error calculating adherence rate:', error);
      return { adherenceRate: 0, error: error as Error };
    }
  }
}

export default new MedicationHistoryService(); 