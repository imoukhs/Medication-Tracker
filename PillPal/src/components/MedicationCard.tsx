import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Medication } from '../types';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="medical" size={24} color={theme.light.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{medication.name}</Text>
        <Text style={styles.dosage}>{medication.dosage}</Text>
        <Text style={styles.time}>
          Next dose: {new Date(medication.scheduledTime).toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={24} color={theme.light.text} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.light.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.light.text,
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: theme.light.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: theme.light.primary,
  },
  arrow: {
    marginLeft: 10,
  },
});

export default MedicationCard; 