import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AdherenceStats from '../components/AdherenceStats';
import { HistoryEntry } from '../types';
import HistoryService from '../services/HistoryService';

const ProgressScreen = () => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const recentHistory = await HistoryService.getRecentHistory(7);
      setHistory(recentHistory);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
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
});

export default ProgressScreen; 