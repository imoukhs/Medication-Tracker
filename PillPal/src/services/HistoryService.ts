import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry } from '../types';

const HISTORY_STORAGE_KEY = 'medication_history';

class HistoryService {
  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  async addHistoryEntry(entry: Omit<HistoryEntry, 'id'>): Promise<void> {
    try {
      const history = await this.getHistory();
      const newEntry: HistoryEntry = {
        ...entry,
        id: Date.now().toString(),
      };
      
      history.push(newEntry);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding history entry:', error);
      throw error;
    }
  }

  async getMedicationHistory(medicationId: string): Promise<HistoryEntry[]> {
    try {
      const history = await this.getHistory();
      return history.filter(entry => entry.medicationId === medicationId);
    } catch (error) {
      console.error('Error getting medication history:', error);
      return [];
    }
  }

  async getRecentHistory(days: number = 7): Promise<HistoryEntry[]> {
    try {
      const history = await this.getHistory();
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      return history.filter(entry => entry.timestamp >= cutoffTime);
    } catch (error) {
      console.error('Error getting recent history:', error);
      return [];
    }
  }

  async calculateAdherenceRate(days: number = 30): Promise<number> {
    try {
      const recentHistory = await this.getRecentHistory(days);
      const takenCount = recentHistory.filter(entry => entry.taken).length;
      return (takenCount / days) * 100;
    } catch (error) {
      console.error('Error calculating adherence rate:', error);
      return 0;
    }
  }

  async calculateCurrentStreak(): Promise<number> {
    try {
      const history = await this.getHistory();
      let streak = 0;
      const sortedHistory = history
        .filter(entry => entry.taken)
        .sort((a, b) => b.timestamp - a.timestamp);

      if (sortedHistory.length === 0) return 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentDate = new Date(sortedHistory[0].timestamp);
      currentDate.setHours(0, 0, 0, 0);

      if (currentDate.getTime() !== today.getTime()) return 0;

      for (let i = 0; i < sortedHistory.length - 1; i++) {
        const currentDay = new Date(sortedHistory[i].timestamp);
        const previousDay = new Date(sortedHistory[i + 1].timestamp);
        
        currentDay.setHours(0, 0, 0, 0);
        previousDay.setHours(0, 0, 0, 0);

        const diffDays = (currentDay.getTime() - previousDay.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }

      return streak + 1; // Add 1 for today
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }
}

export default new HistoryService(); 