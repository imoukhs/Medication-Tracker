import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Modal, Platform } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types/';
import AuthService from '../services/AuthService';
import ProfileService, { ProfileData } from '../services/ProfileService';
import SupabaseSharedAccessService from '../services/SupabaseSharedAccessService';
import SettingItem from '../components/SettingItem';
import { useAuth } from '../context/AuthContext';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData | null>(null);
  const [pendingInvites, setPendingInvites] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadProfileData();
      checkPendingInvites();
    }
  }, [user]);

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

  const checkPendingInvites = async () => {
    try {
      const { data } = await SupabaseSharedAccessService.getReceivedInvites();
      setPendingInvites(data?.length ?? 0);
    } catch (error) {
      console.error('Error checking pending invites:', error);
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
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
    destructive: boolean = false,
    notificationCount: number = 0
  ) => (
    <View style={styles.optionWrapper}>
      <SettingItem
        icon={icon}
        label={label}
        description=""
        onPress={onPress}
        isDestructive={destructive}
        notificationCount={notificationCount}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
          shadowColor: colors.elevation
        }]}>
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
              <View style={[styles.editButton, { 
                backgroundColor: colors.primary,
                borderColor: colors.surface 
              }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {profileData?.name || 'Your Name'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {profileData?.email || user?.email || 'your.email@example.com'}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
        <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
          {renderProfileOption(
            'person',
            'Personal Information',
            () => navigation.navigate('PersonalInformation', { modal: true })
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {renderProfileOption(
            'medical',
            'Medical Information',
            () => navigation.navigate('MedicalInformation', { modal: true })
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {renderProfileOption(
            'notifications',
            'Notification Preferences',
            () => navigation.navigate('NotificationPreferences', { modal: true })
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {renderProfileOption(
            'people',
            'Shared Access',
            () => navigation.navigate('SharedAccess', { modal: true }),
            true,
            false,
            pendingInvites
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {renderProfileOption(
            'trophy',
            'Achievements',
            () => navigation.navigate('Achievements', { modal: true })
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
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
    borderWidth: 2,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  optionsContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionWrapper: {
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '90%',
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalForm: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});

export default ProfileScreen; 