import { HistoryEntry } from '../types';
import HistoryService from './HistoryService';

class AdherenceService {
  async calculateDailyAdherence(date: Date = new Date()): Promise<number> {
    try {
      const history = await HistoryService.getHistory();
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dailyEntries = history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startOfDay && entryDate <= endOfDay;
      });

      if (dailyEntries.length === 0) return 0;
      const takenCount = dailyEntries.filter(entry => entry.taken).length;
      return (takenCount / dailyEntries.length) * 100;
    } catch (error) {
      console.error('Error calculating daily adherence:', error);
      return 0;
    }
  }

  async calculateWeeklyAdherence(): Promise<number> {
    try {
      const history = await HistoryService.getHistory();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyEntries = history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= oneWeekAgo;
      });

      if (weeklyEntries.length === 0) return 0;
      const takenCount = weeklyEntries.filter(entry => entry.taken).length;
      return (takenCount / weeklyEntries.length) * 100;
    } catch (error) {
      console.error('Error calculating weekly adherence:', error);
      return 0;
    }
  }

  async calculateMonthlyAdherence(): Promise<number> {
    try {
      const history = await HistoryService.getHistory();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const monthlyEntries = history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= oneMonthAgo;
      });

      if (monthlyEntries.length === 0) return 0;
      const takenCount = monthlyEntries.filter(entry => entry.taken).length;
      return (takenCount / monthlyEntries.length) * 100;
    } catch (error) {
      console.error('Error calculating monthly adherence:', error);
      return 0;
    }
  }

  async getMissedDoses(days: number = 7): Promise<HistoryEntry[]> {
    try {
      const history = await HistoryService.getHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return history.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return !entry.taken && entryDate >= cutoffDate;
      });
    } catch (error) {
      console.error('Error getting missed doses:', error);
      return [];
    }
  }

  async getAdherenceStreak(): Promise<number> {
    try {
      const history = await HistoryService.getHistory();
      let streak = 0;
      const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);

      for (let i = 0; i < sortedHistory.length; i++) {
        if (!sortedHistory[i].taken) break;
        streak++;
      }

      return streak;
    } catch (error) {
      console.error('Error calculating adherence streak:', error);
      return 0;
    }
  }

  async generateAdherenceReport(days: number = 30): Promise<{
    adherenceRate: number;
    streak: number;
    missedDoses: number;
    totalDoses: number;
  }> {
    try {
      const history = await HistoryService.getHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentHistory = history.filter(entry => new Date(entry.timestamp) >= cutoffDate);
      const takenCount = recentHistory.filter(entry => entry.taken).length;
      const missedCount = recentHistory.filter(entry => !entry.taken).length;

      const adherenceRate = recentHistory.length > 0 
        ? (takenCount / recentHistory.length) * 100 
        : 0;

      const streak = await this.getAdherenceStreak();

      return {
        adherenceRate: Math.round(adherenceRate),
        streak,
        missedDoses: missedCount,
        totalDoses: recentHistory.length,
      };
    } catch (error) {
      console.error('Error generating adherence report:', error);
      return {
        adherenceRate: 0,
        streak: 0,
        missedDoses: 0,
        totalDoses: 0,
      };
    }
  }
}

export default new AdherenceService(); 