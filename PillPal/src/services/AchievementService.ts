import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '../types/achievements';

const ACHIEVEMENTS_KEY = 'achievements';

const AVAILABLE_ACHIEVEMENTS = [
  {
    id: 'first_medication',
    name: 'First Steps',
    description: 'Add your first medication',
    icon: 'medal-outline',
    progress: 0,
    target: 1,
    completed: false,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Take all medications for 7 days straight',
    icon: 'star-outline',
    progress: 0,
    target: 7,
    completed: false,
  },
  {
    id: 'medication_master',
    name: 'Medication Master',
    description: 'Achieve 100% adherence for 30 days',
    icon: 'trophy-outline',
    progress: 0,
    target: 30,
    completed: false,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Take all morning medications on time for 5 days',
    icon: 'sunny-outline',
    progress: 0,
    target: 5,
    completed: false,
  },
  {
    id: 'sharing_care',
    name: 'Sharing Care',
    description: 'Connect with a caregiver or family member',
    icon: 'people-outline',
    progress: 0,
    target: 1,
    completed: false,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Take evening medications on time for 5 days',
    icon: 'moon-outline',
    progress: 0,
    target: 5,
    completed: false,
  },
  {
    id: 'organized_planner',
    name: 'Organized Planner',
    description: 'Set up 5 different medication schedules',
    icon: 'calendar-outline',
    progress: 0,
    target: 5,
    completed: false,
  },
  {
    id: 'supply_manager',
    name: 'Supply Manager',
    description: 'Maintain adequate supply for all medications for 2 weeks',
    icon: 'file-tray-full-outline',
    progress: 0,
    target: 14,
    completed: false,
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    description: 'Complete a month with 100% medication adherence',
    icon: 'ribbon-outline',
    progress: 0,
    target: 30,
    completed: false,
  },
  {
    id: 'quick_responder',
    name: 'Quick Responder',
    description: 'Respond to medication reminders within 5 minutes for 10 times',
    icon: 'flash-outline',
    progress: 0,
    target: 10,
    completed: false,
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Share medication schedules with 3 healthcare providers',
    icon: 'people-circle-outline',
    progress: 0,
    target: 3,
    completed: false,
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 50-day streak of medication adherence',
    icon: 'crown-outline',
    progress: 0,
    target: 50,
    completed: false,
  },
  {
    id: 'emergency_ready',
    name: 'Emergency Ready',
    description: 'Set up emergency contacts and medical information',
    icon: 'shield-checkmark-outline',
    progress: 0,
    target: 1,
    completed: false,
  },
  {
    id: 'feedback_hero',
    name: 'Feedback Hero',
    description: 'Record medication side effects or notes 10 times',
    icon: 'create-outline',
    progress: 0,
    target: 10,
    completed: false,
  },
  {
    id: 'schedule_master',
    name: 'Schedule Master',
    description: 'Update medication schedules for optimal timing 5 times',
    icon: 'time-outline',
    progress: 0,
    target: 5,
    completed: false,
  }
];

class AchievementService {
  async initializeAchievements(): Promise<void> {
    try {
      const existing = await this.getAchievements();
      if (!existing) {
        await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(AVAILABLE_ACHIEVEMENTS));
      }
    } catch (error) {
      console.error('Error initializing achievements:', error);
    }
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      return data ? JSON.parse(data) : AVAILABLE_ACHIEVEMENTS;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return AVAILABLE_ACHIEVEMENTS;
    }
  }

  async updateAchievement(id: string, progress: number): Promise<Achievement | null> {
    try {
      const achievements = await this.getAchievements();
      const index = achievements.findIndex(a => a.id === id);
      
      if (index === -1) return null;
      
      const achievement = achievements[index];
      achievement.progress = Math.min(progress, achievement.target);
      achievement.completed = achievement.progress >= achievement.target;
      
      achievements[index] = achievement;
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      
      return achievement;
    } catch (error) {
      console.error('Error updating achievement:', error);
      return null;
    }
  }

  async checkFirstMedication(): Promise<void> {
    const medications = await AsyncStorage.getItem('@medications');
    if (medications && JSON.parse(medications).length === 1) {
      await this.updateAchievement('first_medication', 1);
    }
  }

  async checkPerfectWeek(adherenceRate: number): Promise<void> {
    if (adherenceRate === 100) {
      const achievement = await this.updateAchievement('perfect_week', 7);
      if (achievement && !achievement.completed) {
        await this.updateAchievement('perfect_week', achievement.progress + 1);
      }
    }
  }

  async checkMedicationMaster(monthlyAdherence: number): Promise<void> {
    if (monthlyAdherence === 100) {
      await this.updateAchievement('medication_master', 30);
    }
  }
}

export default new AchievementService(); 