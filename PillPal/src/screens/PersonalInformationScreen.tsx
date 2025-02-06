import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import ProfileService, { ProfileData } from '../services/ProfileService';

type PersonalInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PersonalInformationScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<PersonalInformationScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const data = await ProfileService.getProfileData();
      const image = await ProfileService.getProfileImage();
      if (data) {
        setProfileData(data);
      }
      if (image) {
        setProfileImage(image);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};
    let isValid = true;
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\+?[\d\s-]{10,}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }
    
    if (profileData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(profileData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please use YYYY-MM-DD format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImagePick = async () => {
    try {
      const result = await ProfileService.pickImage();
      if (result) {
        setProfileImage(result);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const errorFields = Object.keys(errors).map(key => 
        key.charAt(0).toUpperCase() + key.slice(1)
      ).join(', ');
      Alert.alert(
        'Validation Error',
        `Please correct the following fields:\n${errorFields}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSaving(true);
    try {
      await ProfileService.updateProfileData(profileData);
      Alert.alert('Success', 'Profile information updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderInput = (
    field: keyof ProfileData,
    label: string,
    placeholder: string,
    options: {
      required?: boolean;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      multiline?: boolean;
      numberOfLines?: number;
      autoCapitalize?: 'none' | 'sentences';
    } = {}
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {options.required && <Text style={styles.requiredStar}>*</Text>}
      </View>
      <TextInput
        style={[
          styles.input,
          { color: colors.text },
          errors[field] && styles.inputError,
          options.multiline && { height: 100, textAlignVertical: 'top' }
        ]}
        value={profileData[field]}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines}
        autoCapitalize={options.autoCapitalize}
      />
      {errors[field] && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#ff3b30" />
          <Text style={styles.errorText}>{errors[field]}</Text>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { backgroundColor: colors.primary },
            isSaving && styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
            )}
            <View style={[styles.cameraButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
            Tap to change profile photo
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {renderInput('name', 'Full Name', 'Enter your full name', { required: true })}
            {renderInput('email', 'Email', 'Enter your email', { 
              required: true, 
              keyboardType: 'email-address',
              autoCapitalize: 'none'
            })}
            {renderInput('phone', 'Phone', 'Enter your phone number', { 
              required: true,
              keyboardType: 'phone-pad'
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {renderInput('dateOfBirth', 'Date of Birth', 'YYYY-MM-DD')}
            {renderInput('gender', 'Gender', 'Enter your gender')}
            {renderInput('address', 'Address', 'Enter your address', { 
              multiline: true,
              numberOfLines: 4
            })}
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoHint: {
    marginTop: 8,
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  requiredStar: {
    color: '#ff3b30',
    marginLeft: 4,
    fontSize: 14,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginLeft: 4,
  },
  inputError: {
    borderBottomWidth: 1,
    borderBottomColor: '#ff3b30',
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
});

export default PersonalInformationScreen; 