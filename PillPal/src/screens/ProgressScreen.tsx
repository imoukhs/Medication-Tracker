import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AdherenceStats from '../components/AdherenceStats';
import { HistoryEntry } from '../types';
import HistoryService from '../services/HistoryService';
import { Achievement } from '../types/achievements';
import AchievementService from '../services/AchievementService';
import Svg, { Circle } from 'react-native-svg';

const ProgressScreen = () => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    weeklyAdherence: 0,
    monthlyAdherence: 0,
    totalDoses: 0,
    streak: 0
  });

  useEffect(() => {
    loadProgressData();
    loadAchievements();
  }, []);

  const loadProgressData = async () => {
    try {
      const recentHistory = await HistoryService.getRecentHistory(7);
      setHistory(recentHistory);
      
      // Calculate stats
      const weeklyAdherence = await HistoryService.calculateAdherenceRate(7);
      const monthlyAdherence = await HistoryService.calculateAdherenceRate(30);
      const streak = await HistoryService.calculateCurrentStreak();
      
      setStats({
        weeklyAdherence,
        monthlyAdherence,
        totalDoses: recentHistory.length,
        streak
      });
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const loadAchievements = async () => {
    const data = await AchievementService.getAchievements();
    setAchievements(data.slice(0, 3)); // Show only the 3 most recent achievements
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProgressData(), loadAchievements()]);
    setRefreshing(false);
  };

  const CircularProgress = ({ 
    progress, 
    size = 80, 
    strokeWidth = 10 
  }: { 
    progress: number; 
    size?: number; 
    strokeWidth?: number; 
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progressOffset = circumference - (progress * circumference);

    return (
      <Svg width={size} height={size}>
        <Circle
          stroke={`${colors.primary}20`}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
        />
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Your Progress</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <AdherenceStats />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: `${colors.primary}10` }]}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Math.round(stats.weeklyAdherence)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Weekly Adherence
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: `${colors.primary}10` }]}>
              <Ionicons name="trending-up" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Math.round(stats.monthlyAdherence)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Monthly Adherence
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: `${colors.primary}10` }]}>
              <Ionicons name="flame" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.streak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: `${colors.primary}10` }]}>
              <Ionicons name="medical" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalDoses}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Doses
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.achievementsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Achievements</Text>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { 
                    backgroundColor: `${colors.primary}10`,
                    borderColor: achievement.completed ? colors.primary : colors.border 
                  }
                ]}
              >
                <View style={styles.achievementIcon}>
                  <Ionicons
                    name={achievement.icon as any}
                    size={32}
                    color={achievement.completed ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={[styles.achievementName, { color: colors.text }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementProgress, { color: colors.textSecondary }]}>
                  {achievement.progress}/{achievement.target}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAll: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  achievementIcon: {
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementProgress: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProgressScreen; 