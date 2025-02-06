import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import MedicalInfoService, { MedicalInfo } from '../services/MedicalInfoService';

type MedicalInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MedicalInformationScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<MedicalInformationScreenNavigationProp>();
  const [info, setInfo] = useState<MedicalInfo>({
    bloodType: '',
    allergies: '',
    conditions: '',
    medications: '',
    weight: '',
    height: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicalInfo();
  }, []);

  const loadMedicalInfo = async () => {
    try {
      const savedInfo = await MedicalInfoService.getMedicalInfo();
      if (savedInfo) {
        setInfo(savedInfo);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load medical information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await MedicalInfoService.saveMedicalInfo(info);
      Alert.alert('Success', 'Medical information updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save medical information');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Medical Information</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Blood Type</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={info.bloodType}
            onChangeText={(text) => setInfo({ ...info, bloodType: text })}
            placeholder="Enter blood type"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Allergies</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              height: 100,
            }]}
            value={info.allergies}
            onChangeText={(text) => setInfo({ ...info, allergies: text })}
            placeholder="List any allergies"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Medical Conditions</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              height: 100,
            }]}
            value={info.conditions}
            onChangeText={(text) => setInfo({ ...info, conditions: text })}
            placeholder="List any medical conditions"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Current Medications</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              height: 100,
            }]}
            value={info.medications}
            onChangeText={(text) => setInfo({ ...info, medications: text })}
            placeholder="List medications not tracked in the app"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={info.weight}
              onChangeText={(text) => setInfo({ ...info, weight: text })}
              placeholder="Enter weight"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Height (cm)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={info.height}
              onChangeText={(text) => setInfo({ ...info, height: text })}
              placeholder="Enter height"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Additional Notes</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              height: 100,
            }]}
            value={info.notes}
            onChangeText={(text) => setInfo({ ...info, notes: text })}
            placeholder="Any additional medical information"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
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
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
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
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MedicalInformationScreen; 