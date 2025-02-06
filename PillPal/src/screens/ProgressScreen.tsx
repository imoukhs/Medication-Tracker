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

  useEffect(() => {
    loadProgressData();
    loadAchievements();
  }, []);

  const loadProgressData = async () => {
    try {
      const recentHistory = await HistoryService.getRecentHistory(7);
      setHistory(recentHistory);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const loadAchievements = async () => {
    const data = await AchievementService.getAchievements();
    setAchievements(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
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
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Your Progress</Text>
      </View>

      <View style={styles.content}>
        <AdherenceStats />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          {history.length > 0 ? (
            history.map(entry => (
              <View
                key={entry.id}
                style={[styles.activityItem, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }]}
              >
                <Ionicons
                  name={entry.taken ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={entry.taken ? colors.success : colors.error}
                />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, { color: colors.text }]}>
                    {entry.taken ? 'Medication taken' : 'Medication missed'}
                  </Text>
                  <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No activity recorded yet
              </Text>
            </View>
          )}
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: colors.surface, borderColor: colors.border }
                ]}
              >
                <View style={styles.progressCircle}>
                  <CircularProgress progress={achievement.progress / achievement.target} />
                  <View style={styles.achievementIcon}>
                    <Ionicons
                      name={achievement.icon as any}
                      size={24}
                      color={achievement.completed ? colors.primary : colors.textSecondary}
                    />
                  </View>
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
      </View>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  activityContent: {
    marginLeft: 15,
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
  achievementsContainer: {
    padding: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  progressCircle: {
    position: 'relative',
    marginBottom: 12,
  },
  achievementIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  achievementName: {
    fontSize: 14,
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