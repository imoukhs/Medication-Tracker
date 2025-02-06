import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onPress }) => {
  const { colors } = useTheme();
  const isLowSupply = medication.supply <= medication.lowSupplyThreshold;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.leftContent}>
          <Text style={[styles.name, { color: colors.text }]}>{medication.name}</Text>
          <Text style={[styles.dosage, { color: colors.textSecondary }]}>
            {medication.dosage} - {medication.frequency}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            Next: {new Date(medication.scheduledTime).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={[styles.supply, { color: isLowSupply ? colors.error : colors.text }]}>
            {medication.supply}
          </Text>
          <Text style={[styles.supplyLabel, { color: colors.textSecondary }]}>remaining</Text>
          {isLowSupply && (
            <Ionicons name="warning" size={20} color={colors.error} style={styles.warningIcon} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
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
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
  },
  supply: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  supplyLabel: {
    fontSize: 12,
  },
  warningIcon: {
    marginTop: 5,
  },
});

export default MedicationCard; 