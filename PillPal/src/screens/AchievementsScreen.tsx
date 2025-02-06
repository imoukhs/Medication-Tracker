import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Achievement } from '../types/';
import AchievementService from '../services/AchievementService';

type AchievementsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AchievementsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<AchievementsScreenNavigationProp>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await AchievementService.getAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Achievements</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              { 
                backgroundColor: colors.surface,
                borderColor: achievement.completed ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.achievementIcon}>
              <Ionicons
                name={achievement.icon as any}
                size={32}
                color={achievement.completed ? colors.primary : colors.textSecondary}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={[styles.achievementName, { color: colors.text }]}>
                {achievement.name}
              </Text>
              <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
                {achievement.description}
              </Text>
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { backgroundColor: `${colors.primary}20` },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(achievement.progress / achievement.target) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {achievement.progress}/{achievement.target}
                </Text>
              </View>
            </View>
            {achievement.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    marginLeft: 12,
  },
});

export default AchievementsScreen; 