import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Medication } from '../types';

interface MedicationReminderProps {
  medication: Medication;
  onTakeDose: () => void;
  onSnooze: () => void;
  onViewDetails: () => void;
}

const MedicationReminder: React.FC<MedicationReminderProps> = ({
  medication,
  onTakeDose,
  onSnooze,
  onViewDetails,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.contentContainer} onPress={onViewDetails}>
        <View style={styles.medicationInfo}>
          <Text style={[styles.medicationName, { color: colors.text }]}>
            {medication.name}
          </Text>
          <Text style={[styles.medicationDetails, { color: colors.textSecondary }]}>
            {medication.dosage} - {medication.instructions}
          </Text>
          <Text style={[styles.scheduledTime, { color: colors.textSecondary }]}>
            Scheduled for: {new Date(medication.scheduledTime).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.supplyContainer}>
          <Text style={[styles.supplyCount, { 
            color: medication.supply <= medication.lowSupplyThreshold ? colors.error : colors.text 
          }]}>
            {medication.supply}
          </Text>
          <Text style={[styles.supplyLabel, { color: colors.textSecondary }]}>remaining</Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.actionsContainer, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onTakeDose}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Take</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={onSnooze}
        >
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Snooze</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 14,
  },
  supplyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16,
  },
  supplyCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  supplyLabel: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default MedicationReminder; 