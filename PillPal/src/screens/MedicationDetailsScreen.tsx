import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Text } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Medication, HistoryEntry } from '../types';
import { useTheme } from '../context/ThemeContext';
import CircularProgress from '../components/CircularProgress';
import MedicationService from '../services/MedicationService';
import HistoryService from '../services/HistoryService';
import MedicationStatsService from '../services/MedicationStatsService';

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
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicationDetails();
  }, [route.params?.medicationId]);

  const loadMedicationDetails = async () => {
    if (!route.params?.medicationId) return;

    try {
      const med = await MedicationService.getMedicationById(route.params.medicationId);
      if (med) {
        setMedication(med);
        const [rate, streak, medicationHistory] = await Promise.all([
          MedicationStatsService.getAdherenceRate(med.id),
          MedicationStatsService.getCurrentStreak(med.id),
          HistoryService.getMedicationHistory(med.id),
        ]);
        setAdherenceRate(rate);
        setCurrentStreak(streak);
        setHistory(medicationHistory);
      }
    } catch (error) {
      console.error('Error loading medication details:', error);
      Alert.alert('Error', 'Failed to load medication details');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDose = async () => {
    if (!medication) return;

    try {
      // Record the dose
      await HistoryService.addHistoryEntry({
        medicationId: medication.id,
        timestamp: Date.now(),
        taken: true,
      });

      // Update supply
      const newSupply = medication.supply - 1;
      await MedicationService.updateSupply(medication.id, newSupply);

      // Refresh data
      loadMedicationDetails();

      Alert.alert('Success', 'Dose recorded successfully');
    } catch (error) {
      console.error('Error recording dose:', error);
      Alert.alert('Error', 'Failed to record dose');
    }
  };

  const handleEdit = () => {
    if (!medication) return;
    navigation.navigate('EditMedication', { medicationId: medication.id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (medication) {
                await MedicationService.deleteMedication(medication.id);
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          },
        },
      ]
    );
  };

  if (!medication) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Medication not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.dosage}>{medication.dosage}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
              <Ionicons name="pencil" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
              <Ionicons name="trash" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <CircularProgress
                progress={adherenceRate}
                size={100}
                strokeWidth={8}
                progressColor={colors.primary}
                backgroundColor={`${colors.primary}20`}
                textColor={colors.text}
              />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Adherence</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={24} color={colors.primary} />
                <Text style={[styles.streakText, { color: colors.text }]}>{currentStreak}</Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.supplyContainer}>
                <Text 
                  style={[
                    styles.supplyText, 
                    { color: medication.supply <= medication.lowSupplyThreshold ? colors.error : colors.text }
                  ]}
                >
                  {medication.supply}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Schedule</Text>
          <Text style={[styles.scheduleText, { color: colors.text }]}>
            {medication.frequency} at {new Date(medication.scheduledTime).toLocaleTimeString()}
          </Text>
          <Text style={[styles.instructions, { color: colors.textSecondary }]}>
            {medication.instructions}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.takeButton, { backgroundColor: colors.primary }]}
          onPress={handleTakeDose}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.takeButtonText}>Take Dose</Text>
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>History</Text>
          {history.slice(0, 5).map((entry, index) => (
            <View key={entry.id} style={styles.historyItem}>
              <Ionicons
                name={entry.taken ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={entry.taken ? colors.success : colors.error}
              />
              <View style={styles.historyContent}>
                <Text style={[styles.historyText, { color: colors.text }]}>
                  {entry.taken ? 'Taken' : 'Missed'}
                </Text>
                <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  supplyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplyText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 16,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  takeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyContent: {
    marginLeft: 12,
  },
  historyText: {
    fontSize: 16,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MedicationDetailsScreen; 