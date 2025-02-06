import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CircularProgress from '../components/CircularProgress';
import MedicationCard from '../components/MedicationCard';
import { theme } from '../theme';
import { RootStackParamList, Medication } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  // Temporary mock data - will be replaced with actual data from storage
  const [medications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Aspirin',
      dosage: '100mg',
      frequency: 'Daily',
      instructions: 'Take with food',
      scheduledTime: new Date(),
      supply: 30,
      lowSupplyThreshold: 5,
    },
    {
      id: '2',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Daily',
      instructions: 'Take in the morning',
      scheduledTime: new Date(),
      supply: 60,
      lowSupplyThreshold: 10,
    },
  ]);

  const handleAddMedication = () => {
    navigation.navigate('AddMedication');
  };

  const handleMedicationPress = (medicationId: string) => {
    navigation.navigate('MedicationDetails', { medicationId });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Progress</Text>
          <CircularProgress progress={75} />
        </View>
        <View style={styles.content}>
          <Text style={styles.subtitle}>Upcoming Medications</Text>
          {medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onPress={() => handleMedicationPress(medication.id)}
            />
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={handleAddMedication}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.light.text,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.light.text,
    marginBottom: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default HomeScreen; 