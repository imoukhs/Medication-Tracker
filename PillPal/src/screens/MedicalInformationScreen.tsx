import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import MedicalInfoService, { MedicalInfo } from '../services/MedicalInfoService';

type MedicalInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MedicalInformationScreen = () => {
  const navigation = useNavigation<MedicalInformationScreenNavigationProp>();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: '',
    allergies: '',
    conditions: '',
    medications: '',
    weight: '',
    height: '',
    notes: '',
  });

  useEffect(() => {
    loadMedicalInfo();
  }, []);

  const loadMedicalInfo = async () => {
    setIsLoading(true);
    try {
      const info = await MedicalInfoService.getMedicalInfo();
      if (info) {
        setMedicalInfo(info);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load medical information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await MedicalInfoService.saveMedicalInfo(medicalInfo);
      Alert.alert('Success', 'Medical information saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save medical information');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          { 
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderBloodTypePicker = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Blood Type</Text>
      <TouchableOpacity
        style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setShowBloodTypePicker(true)}
      >
        <Text style={[styles.pickerText, { color: medicalInfo.bloodType ? colors.text : colors.textSecondary }]}>
          {medicalInfo.bloodType || 'Select Blood Type'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={colors.primary} />
      </TouchableOpacity>
      {showBloodTypePicker && (
        <View style={[styles.bloodTypeOptions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {BLOOD_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.bloodTypeOption,
                { borderBottomColor: colors.border }
              ]}
              onPress={() => {
                setMedicalInfo({ ...medicalInfo, bloodType: type });
                setShowBloodTypePicker(false);
              }}
            >
              <Text style={[styles.bloodTypeText, { 
                color: colors.text,
                fontWeight: medicalInfo.bloodType === type ? 'bold' : 'normal'
              }]}>
                {type}
              </Text>
              {medicalInfo.bloodType === type && (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderBloodTypePicker()}
        
        <View style={styles.measurementsContainer}>
          {renderInput('Weight (kg)', medicalInfo.weight, 
            (text) => setMedicalInfo({ ...medicalInfo, weight: text }), 
            'Enter weight', false, 'numeric'
          )}
          {renderInput('Height (cm)', medicalInfo.height, 
            (text) => setMedicalInfo({ ...medicalInfo, height: text }), 
            'Enter height', false, 'numeric'
          )}
        </View>

        {renderInput('Allergies', medicalInfo.allergies, 
          (text) => setMedicalInfo({ ...medicalInfo, allergies: text }), 
          'List any allergies', true
        )}
        
        {renderInput('Medical Conditions', medicalInfo.conditions, 
          (text) => setMedicalInfo({ ...medicalInfo, conditions: text }), 
          'List any medical conditions', true
        )}
        
        {renderInput('Current Medications', medicalInfo.medications, 
          (text) => setMedicalInfo({ ...medicalInfo, medications: text }), 
          'List current medications', true
        )}
        
        {renderInput('Additional Notes', medicalInfo.notes, 
          (text) => setMedicalInfo({ ...medicalInfo, notes: text }), 
          'Add any additional notes or information', true
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            isSaving && styles.disabledButton
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Information</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 16,
  },
  bloodTypeOptions: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bloodTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  bloodTypeText: {
    fontSize: 16,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MedicalInformationScreen; 