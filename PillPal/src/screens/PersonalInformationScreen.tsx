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
  KeyboardAvoidingView,
  Modal,
  Pressable,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import ProfileService, { ProfileData } from '../services/ProfileService';
import { supabase } from '../config/supabaseConfig';

type PersonalInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PersonalInformationScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<PersonalInformationScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
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

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non-binary' },
    { label: 'Prefer not to say', value: 'not-specified' },
  ];

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get user's profile from Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no data found
        throw error;
      }

      // Get profile image if exists
      const image = await ProfileService.getProfileImage();
      if (image) {
        setProfileImage(image);
      }

      // Combine auth data with profile data
      const combinedData: ProfileData = {
        name: profile?.name || user.user_metadata?.name || '',
        email: user.email || '',
        phone: profile?.phone || '',
        dateOfBirth: profile?.date_of_birth || '',
        gender: profile?.gender || '',
        address: profile?.address || '',
      };

      setProfileData(combinedData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Prepare profile data
      const profileUpdateData = {
        id: user.id,
        email: user.email,
        name: profileData.name,
        phone: profileData.phone || null,
        date_of_birth: profileData.dateOfBirth || null,
        gender: profileData.gender || null,
        address: profileData.address || null,
        updated_at: new Date().toISOString(),
      };

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(profileUpdateData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Update user metadata in auth
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name: profileData.name }
      });

      if (metadataError) throw metadataError;

      Alert.alert('Success', 'Profile updated successfully', [
        { 
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error saving profile data:', error);
      Alert.alert('Error', 'Failed to save profile data. Please try again.');
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

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && event.type === 'set') {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('dateOfBirth', formattedDate);
    }
  };

  const handleGenderSelect = (value: string) => {
    handleInputChange('gender', value);
    setShowGenderPicker(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderDatePicker = () => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Date of Birth</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.input,
          styles.dateInput,
          { borderColor: colors.border },
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.dateText, { color: profileData.dateOfBirth ? colors.text : colors.textSecondary }]}>
          {profileData.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'Select Date of Birth'}
        </Text>
        <Ionicons name="calendar" size={20} color={colors.primary} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );

  const renderGenderPicker = () => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.input,
          styles.dateInput,
          { borderColor: colors.border },
        ]}
        onPress={() => setShowGenderPicker(true)}
      >
        <Text style={[styles.dateText, { color: profileData.gender ? colors.text : colors.textSecondary }]}>
          {profileData.gender ? 
            genderOptions.find(option => option.value === profileData.gender)?.label || profileData.gender 
            : 'Select Gender'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={showGenderPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    { borderBottomColor: colors.border },
                    profileData.gender === option.value && {
                      backgroundColor: `${colors.primary}20`,
                    },
                  ]}
                  onPress={() => handleGenderSelect(option.value)}
                >
                  <Text style={[styles.genderOptionText, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  {profileData.gender === option.value && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );

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
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={profileData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={profileData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={profileData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          {renderDatePicker()}
          {renderGenderPicker()}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={profileData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your address"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  requiredStar: {
    color: '#ff3b30',
    marginLeft: 4,
    fontSize: 14,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
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
  multilineInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  dateText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  genderOptionText: {
    fontSize: 16,
  },
});

export default PersonalInformationScreen; 