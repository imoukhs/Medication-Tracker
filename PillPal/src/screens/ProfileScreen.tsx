import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Modal } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types/';
import AuthService from '../services/AuthService';
import ProfileService, { ProfileData } from '../services/ProfileService';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [data, image] = await Promise.all([
        ProfileService.getProfileData(),
        ProfileService.getProfileImage(),
      ]);
      setProfileData(data);
      setProfileImage(image);
      setEditedData(data);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const image = await ProfileService.pickImage();
      if (image) {
        setProfileImage(image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleSaveProfile = async () => {
    if (!editedData) return;

    try {
      await ProfileService.updateProfileData(editedData);
      setProfileData(editedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditing(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            {editedData && Object.entries(editedData).map(([key, value]) => {
              if (key !== 'profileImage') {
                return (
                  <View key={key} style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderColor: colors.border
                      }]}
                      value={value}
                      onChangeText={(text) => 
                        setEditedData({ ...editedData, [key]: text })
                      }
                      placeholder={`Enter ${key}`}
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                );
              }
              return null;
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderProfileOption = (
    icon: string,
    label: string,
    onPress: () => void,
    showArrow: boolean = true,
    destructive: boolean = false
  ) => (
    <TouchableOpacity
      style={[styles.optionItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.optionIconContainer}>
        <Ionicons name={icon as any} size={24} color={destructive ? colors.error : colors.primary} />
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, { color: destructive ? colors.error : colors.text }]}>
          {label}
        </Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePick}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.placeholderImage,
                    { backgroundColor: `${colors.primary}20` },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={40}
                    color={colors.primary}
                  />
                </View>
              )}
              <View style={[styles.editButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {profileData?.name || 'Your Name'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {profileData?.email || 'your.email@example.com'}
            </Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {renderProfileOption(
            'person',
            'Personal Information',
            () => navigation.navigate('PersonalInformation', { modal: true })
          )}
          {renderProfileOption(
            'medical',
            'Medical Information',
            () => navigation.navigate('MedicalInformation', { modal: true })
          )}
          {renderProfileOption(
            'notifications',
            'Notification Preferences',
            () => navigation.navigate('NotificationPreferences', { modal: true })
          )}
          {renderProfileOption(
            'shield-checkmark',
            'Privacy & Security',
            () => navigation.navigate('PrivacyAndSecurity', { modal: true })
          )}
          {renderProfileOption(
            'people',
            'Shared Access',
            () => navigation.navigate('SharedAccess', { modal: true })
          )}
          {renderProfileOption(
            'trophy',
            'Achievements',
            () => navigation.navigate('Achievements', { modal: true })
          )}
        </View>

        <View style={[styles.logoutSection]}>
          {renderProfileOption(
            'log-out',
            'Sign Out',
            handleLogout,
            false,
            true
          )}
        </View>
      </ScrollView>
      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  profileCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  optionsContainer: {
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#000',
  },
  logoutSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalForm: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
});

export default ProfileScreen; 