import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { RootStackParamList } from '../types';
import StorageService from '../services/StorageService';
import NotificationService from '../services/NotificationService';

type AddMedicationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddMedication'
>;

const AddMedicationScreen = () => {
  const navigation = useNavigation<AddMedicationScreenNavigationProp>();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');
  const [supply, setSupply] = useState('');
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      Alert.alert('Error', 'Please enter frequency');
      return false;
    }
    if (!supply || isNaN(Number(supply))) {
      Alert.alert('Error', 'Please enter a valid supply amount');
      return false;
    }
    if (!lowSupplyThreshold || isNaN(Number(lowSupplyThreshold))) {
      Alert.alert('Error', 'Please enter a valid low supply threshold');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const newMedication = {
        id: Date.now().toString(),
        name,
        dosage,
        frequency,
        instructions,
        scheduledTime,
        supply: Number(supply),
        lowSupplyThreshold: Number(lowSupplyThreshold),
      };

      await StorageService.saveMedication(newMedication);
      await NotificationService.scheduleMedicationReminder(newMedication);
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save medication');
      console.error('Error saving medication:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Medication Name*</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter medication name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dosage*</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="Enter dosage (e.g., 100mg)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Frequency*</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="Enter frequency (e.g., Daily)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {scheduledTime.toLocaleTimeString()}
            </Text>
            <Ionicons name="time-outline" size={24} color={theme.light.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Supply Count*</Text>
          <TextInput
            style={styles.input}
            value={supply}
            onChangeText={setSupply}
            placeholder="Enter current supply"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Low Supply Alert Threshold*</Text>
          <TextInput
            style={styles.input}
            value={lowSupplyThreshold}
            onChangeText={setLowSupplyThreshold}
            placeholder="Enter low supply threshold"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Enter instructions"
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Add Medication</Text>
        </TouchableOpacity>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={scheduledTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setScheduledTime(selectedDate);
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: theme.light.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  timeButtonText: {
    fontSize: 16,
    color: theme.light.text,
  },
  button: {
    backgroundColor: theme.light.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMedicationScreen; 