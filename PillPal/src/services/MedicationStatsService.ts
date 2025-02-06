import { HistoryEntry } from '../types';
import HistoryService from './HistoryService';

class MedicationStatsService {
  static async getAdherenceRate(medicationId: string, days: number = 30): Promise<number> {
    try {
      const history = await HistoryService.getMedicationHistory(medicationId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const relevantEntries = history.filter(entry => 
        entry.timestamp >= startDate.getTime()
      );

      if (relevantEntries.length === 0) return 0;

      const takenCount = relevantEntries.filter(entry => entry.taken).length;
      return (takenCount / relevantEntries.length) * 100;
    } catch (error) {
      console.error('Error calculating adherence rate:', error);
      return 0;
    }
  }

  static async getCurrentStreak(medicationId: string): Promise<number> {
    try {
      const history = await HistoryService.getMedicationHistory(medicationId);
      let streak = 0;
      const sortedEntries = history.sort((a, b) => b.timestamp - a.timestamp);

      for (const entry of sortedEntries) {
        if (!entry.taken) break;
        streak++;
      }

      return streak;
    } catch (error) {
      console.error('Error calculating current streak:', error);
      return 0;
    }
  }

  static async getMissedDoses(medicationId: string, days: number = 30): Promise<number> {
    try {
      const history = await HistoryService.getMedicationHistory(medicationId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const relevantEntries = history.filter(entry => 
        entry.timestamp >= startDate.getTime()
      );

      return relevantEntries.filter(entry => !entry.taken).length;
    } catch (error) {
      console.error('Error calculating missed doses:', error);
      return 0;
    }
  }

  static async getWeeklyAdherenceStats(medicationId: string): Promise<{ [key: string]: number }> {
    try {
      const history = await HistoryService.getMedicationHistory(medicationId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const weeklyStats: { [key: string]: number } = {};
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      days.forEach(day => weeklyStats[day] = 0);

      history.forEach(entry => {
        const entryDate = new Date(entry.timestamp);
        if (entryDate >= startDate && entry.taken) {
          const dayName = days[entryDate.getDay()];
          weeklyStats[dayName]++;
        }
      });

      return weeklyStats;
    } catch (error) {
      console.error('Error calculating weekly adherence stats:', error);
      return {};
    }
  }

  static async getTimeOfDayStats(medicationId: string): Promise<{ morning: number; afternoon: number; evening: number; night: number }> {
    try {
      const history = await HistoryService.getMedicationHistory(medicationId);
      const stats = {
        morning: 0,   // 6 AM - 12 PM
        afternoon: 0, // 12 PM - 6 PM
        evening: 0,   // 6 PM - 12 AM
        night: 0      // 12 AM - 6 AM
      };

      history.forEach(entry => {
        if (!entry.taken) return;
        
        const hour = new Date(entry.timestamp).getHours();
        
        if (hour >= 6 && hour < 12) stats.morning++;
        else if (hour >= 12 && hour < 18) stats.afternoon++;
        else if (hour >= 18) stats.evening++;
        else stats.night++;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating time of day stats:', error);
      return { morning: 0, afternoon: 0, evening: 0, night: 0 };
    }
  }
}

export default MedicationStatsService; 