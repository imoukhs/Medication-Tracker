import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Medication } from '../types';
import MedicationService from '../services/MedicationService';
import NotificationService from '../services/NotificationService';

type EditMedicationScreenProps = {
  route: RouteProp<RootStackParamList, 'EditMedication'>;
};

type EditMedicationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditMedication'
>;

const EditMedicationScreen: React.FC<EditMedicationScreenProps> = ({ route }) => {
  const navigation = useNavigation<EditMedicationScreenNavigationProp>();
  const { colors } = useTheme();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');
  const [supply, setSupply] = useState('');
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
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
        setName(med.name);
        setDosage(med.dosage);
        setFrequency(med.frequency);
        setInstructions(med.instructions);
        setSupply(med.supply.toString());
        setLowSupplyThreshold(med.lowSupplyThreshold.toString());
        setScheduledTime(new Date(med.scheduledTime));
      }
    } catch (error) {
      console.error('Error loading medication:', error);
      Alert.alert('Error', 'Failed to load medication details');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  const validateForm = () => {
    if (!name || !dosage || !frequency || !supply || !lowSupplyThreshold) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !medication) return;

    try {
      const updatedMedication: Medication = {
        ...medication,
        name,
        dosage,
        frequency,
        instructions,
        scheduledTime,
        supply: parseInt(supply),
        lowSupplyThreshold: parseInt(lowSupplyThreshold),
      };

      await MedicationService.updateMedication(medication.id, updatedMedication);
      await NotificationService.updateNotification(medication.id, {
        title: `Time to take ${name}`,
        body: `${dosage} - ${instructions}`,
        scheduledTime,
      });

      Alert.alert('Success', 'Medication updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Medication</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Medication Name *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter medication name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Dosage *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={dosage}
              onChangeText={setDosage}
              placeholder="Enter dosage (e.g., 100mg)"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Frequency *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="Enter frequency (e.g., Daily)"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Instructions</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
                height: 100,
              }]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Enter special instructions"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Supply Count *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={supply}
              onChangeText={setSupply}
              placeholder="Enter number of doses"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Low Supply Alert *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={lowSupplyThreshold}
              onChangeText={setLowSupplyThreshold}
              placeholder="Enter low supply threshold"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Scheduled Time *</Text>
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.timeButtonText, { color: colors.text }]}>
                {scheduledTime.toLocaleTimeString()}
              </Text>
              <Ionicons name="time" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={scheduledTime}
              mode="time"
              is24Hour={false}
              onChange={handleTimeChange}
            />
          )}
        </View>
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
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  timeButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButtonText: {
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EditMedicationScreen; 