import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CircularProgress from './CircularProgress';
import AdherenceService from '../services/AdherenceService';
import { useTheme } from '../context/ThemeContext';

interface AdherenceReport {
  adherenceRate: number;
  streak: number;
  missedDoses: number;
  totalDoses: number;
}

const AdherenceStats: React.FC = () => {
  const { colors } = useTheme();
  const [report, setReport] = useState<AdherenceReport>({
    adherenceRate: 0,
    streak: 0,
    missedDoses: 0,
    totalDoses: 0,
  });

  useEffect(() => {
    loadAdherenceData();
  }, []);

  const loadAdherenceData = async () => {
    try {
      const data = await AdherenceService.generateAdherenceReport();
      setReport(data);
    } catch (error) {
      console.error('Error loading adherence data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Medication Adherence</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Last 30 Days</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.progressContainer}>
            <CircularProgress
              progress={report.adherenceRate}
              size={120}
              strokeWidth={12}
              progressColor={colors.primary}
              backgroundColor={`${colors.primary}20`}
              textColor={colors.text}
            />
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              Adherence Rate
            </Text>
          </View>

          <View style={styles.statsDetails}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color={colors.primary} />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: colors.text }]}>{report.streak}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="alert-circle" size={24} color={colors.error} />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: colors.text }]}>{report.missedDoses}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Missed Doses</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <View style={styles.statText}>
                <Text style={[styles.statValue, { color: colors.text }]}>{report.totalDoses}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Doses</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  statsDetails: {
    flex: 1,
    marginLeft: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statText: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
});

export default AdherenceStats; 