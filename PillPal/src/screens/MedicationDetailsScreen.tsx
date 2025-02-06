import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Medication, HistoryEntry } from '../types';
import StorageService from '../services/StorageService';
import HistoryService from '../services/HistoryService';
import MedicationStatsService from '../services/MedicationStatsService';
import { useTheme } from '../context/ThemeContext';

type MedicationDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'MedicationDetails'>;
};

type MedicationDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MedicationDetails'
>;

const MedicationDetailsScreen: React.FC<MedicationDetailsScreenProps> = ({ route }) => {
  const navigation = useNavigation<MedicationDetailsNavigationProp>();
  const { colors } = useTheme();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adherenceRate, setAdherenceRate] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [missedDoses, setMissedDoses] = useState<number>(0);
  const [timeStats, setTimeStats] = useState<{ morning: number; afternoon: number; evening: number; night: number }>({
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  });

  useEffect(() => {
    loadMedicationDetails();
  }, []);

  const loadMedicationDetails = async () => {
    try {
      const medications = await StorageService.getMedications();
      const found = medications.find(med => med.id === route.params?.medicationId);
      if (found) {
        setMedication(found);
        const medicationHistory = await HistoryService.getMedicationHistory(found.id);
        setHistory(medicationHistory);
        
        // Load statistics
        const rate = await MedicationStatsService.getAdherenceRate(found.id);
        const currentStreak = await MedicationStatsService.getCurrentStreak(found.id);
        const missed = await MedicationStatsService.getMissedDoses(found.id);
        const todStats = await MedicationStatsService.getTimeOfDayStats(found.id);
        
        setAdherenceRate(rate);
        setStreak(currentStreak);
        setMissedDoses(missed);
        setTimeStats(todStats);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load medication details');
      console.error('Error loading medication:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDose = async () => {
    if (!medication) return;

    try {
      const updatedMedication = {
        ...medication,
        supply: medication.supply - 1,
      };

      await StorageService.updateMedication(medication.id, updatedMedication);
      await HistoryService.addHistoryEntry({
        medicationId: medication.id,
        timestamp: Date.now(),
        taken: true,
      });

      // Check if supply is low
      if (updatedMedication.supply <= updatedMedication.lowSupplyThreshold) {
        Alert.alert(
          'Low Supply',
          `Your ${medication.name} supply is running low. Please refill soon.`
        );
      }

      setMedication(updatedMedication);
      loadMedicationDetails(); // Refresh history
    } catch (error) {
      Alert.alert('Error', 'Failed to record dose');
      console.error('Error recording dose:', error);
    }
  };

  const renderHistoryItem = (entry: HistoryEntry) => (
    <View
      key={entry.id}
      style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.historyIcon}>
        <Ionicons
          name={entry.taken ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={entry.taken ? colors.success : colors.error}
        />
      </View>
      <View style={styles.historyContent}>
        <Text style={[styles.historyText, { color: colors.text }]}>
          {entry.taken ? 'Taken' : 'Missed'}
        </Text>
        <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
          {new Date(entry.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (!medication) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Medication not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{medication.name}</Text>
          <Text style={styles.subtitle}>{medication.dosage}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {adherenceRate.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Adherence</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.error }]}>{missedDoses}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Missed</Text>
          </View>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructions</Text>
          <Text style={[styles.text, { color: colors.text }]}>
            {medication.instructions || 'No specific instructions'}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Schedule</Text>
          <Text style={[styles.text, { color: colors.text }]}>
            Frequency: {medication.frequency}
          </Text>
          <Text style={[styles.text, { color: colors.text }]}>
            Next dose: {new Date(medication.scheduledTime).toLocaleTimeString()}
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Supply</Text>
          <Text style={[styles.text, { color: colors.text }]}>
            Remaining: {medication.supply} doses
          </Text>
          <Text style={[styles.text, { color: colors.text }]}>
            Low supply alert at: {medication.lowSupplyThreshold} doses
          </Text>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Time of Day Analysis</Text>
          <View style={styles.timeStats}>
            <View style={styles.timeStatItem}>
              <Ionicons name="sunny" size={24} color={colors.primary} />
              <Text style={[styles.timeStatValue, { color: colors.text }]}>{timeStats.morning}</Text>
              <Text style={[styles.timeStatLabel, { color: colors.textSecondary }]}>Morning</Text>
            </View>
            <View style={styles.timeStatItem}>
              <Ionicons name="partly-sunny" size={24} color={colors.primary} />
              <Text style={[styles.timeStatValue, { color: colors.text }]}>{timeStats.afternoon}</Text>
              <Text style={[styles.timeStatLabel, { color: colors.textSecondary }]}>Afternoon</Text>
            </View>
            <View style={styles.timeStatItem}>
              <Ionicons name="moon" size={24} color={colors.primary} />
              <Text style={[styles.timeStatValue, { color: colors.text }]}>{timeStats.evening}</Text>
              <Text style={[styles.timeStatLabel, { color: colors.textSecondary }]}>Evening</Text>
            </View>
            <View style={styles.timeStatItem}>
              <Ionicons name="moon" size={24} color={colors.primary} />
              <Text style={[styles.timeStatValue, { color: colors.text }]}>{timeStats.night}</Text>
              <Text style={[styles.timeStatLabel, { color: colors.textSecondary }]}>Night</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>History</Text>
          {history.length > 0 ? (
            history.map(renderHistoryItem)
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No history recorded yet
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.takeButton, { backgroundColor: colors.primary }]}
        onPress={handleTakeDose}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.takeButtonText}>Take Dose</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  historyIcon: {
    marginRight: 15,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 16,
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
  takeButton: {
    flexDirection: 'row',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 15,
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  timeStatItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 15,
  },
  timeStatValue: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 4,
  },
  timeStatLabel: {
    fontSize: 12,
  },
});

export default MedicationDetailsScreen; 