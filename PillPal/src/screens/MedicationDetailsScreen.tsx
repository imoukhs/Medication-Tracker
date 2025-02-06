import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native';
import { theme } from '../theme';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type MedicationDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'MedicationDetails'>;
};

const MedicationDetailsScreen: React.FC<MedicationDetailsScreenProps> = ({ route }) => {
  // We'll implement fetching medication details later
  const medicationId = route.params?.medicationId;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Name</Text>
        <Text style={styles.subtitle}>Dosage</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.text}>
          Instructions will be displayed here
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <Text style={styles.text}>
          Schedule information will be displayed here
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supply</Text>
        <Text style={styles.text}>
          Supply information will be displayed here
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.light.primary,
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.light.text,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: theme.light.text,
    lineHeight: 24,
  },
});

export default MedicationDetailsScreen; 