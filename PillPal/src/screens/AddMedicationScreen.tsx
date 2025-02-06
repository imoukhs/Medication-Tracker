import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import MedicationService from '../services/MedicationService';
import NotificationService from '../services/NotificationService';
import FrequencyPicker from '../components/FrequencyPicker';

type AddMedicationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMedication'>;

const FREQUENCIES = ['Daily', 'Twice Daily', 'Weekly', 'Monthly', 'As Needed'];

const AddMedicationScreen = () => {
  const navigation = useNavigation<AddMedicationScreenNavigationProp>();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');
  const [supply, setSupply] = useState('');
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter medication name');
      return false;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return false;
    }
    if (!frequency.trim()) {
      Alert.alert('Error', 'Please select frequency');
      return false;
    }
    if (!supply.trim() || isNaN(Number(supply))) {
      Alert.alert('Error', 'Please enter a valid supply count');
      return false;
    }
    if (!lowSupplyThreshold.trim() || isNaN(Number(lowSupplyThreshold))) {
      Alert.alert('Error', 'Please enter a valid low supply threshold');
      return false;
    }
    if (Number(lowSupplyThreshold) >= Number(supply)) {
      Alert.alert('Error', 'Low supply threshold must be less than total supply');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newMedication = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        instructions: instructions.trim(),
        scheduledTime,
        supply: parseInt(supply),
        lowSupplyThreshold: parseInt(lowSupplyThreshold),
      };

      await MedicationService.addMedication(newMedication);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Medication</Text>
      </View>

      <ScrollView style={styles.form}>
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
          <TouchableOpacity
            style={[styles.input, { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              justifyContent: 'center'
            }]}
            onPress={() => setShowFrequencyModal(true)}
          >
            <Text style={{ color: frequency ? colors.text : colors.textSecondary }}>
              {frequency || 'Select frequency'}
            </Text>
          </TouchableOpacity>
          <FrequencyPicker
            visible={showFrequencyModal}
            onClose={() => setShowFrequencyModal(false)}
            onSelect={setFrequency}
            frequencies={FREQUENCIES}
            selectedFrequency={frequency}
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

        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: colors.primary,
            opacity: isSubmitting ? 0.7 : 1
          }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Medication'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddMedicationScreen; 