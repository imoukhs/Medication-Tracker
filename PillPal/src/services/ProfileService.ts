import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const PROFILE_DATA_KEY = 'profile_data';
const PROFILE_IMAGE_KEY = 'profile_image';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  profileImage?: string;
}

class ProfileService {
  async requestMediaLibraryPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
    return true;
  }

  async pickImage(): Promise<string | null> {
    try {
      const permissionGranted = await this.requestMediaLibraryPermission();
      if (!permissionGranted) {
        throw new Error('Permission to access media library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await this.saveProfileImage(base64Image);
        return base64Image;
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  async saveProfileImage(base64Image: string): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, base64Image);
    } catch (error) {
      console.error('Error saving profile image:', error);
      throw error;
    }
  }

  async getProfileImage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
    } catch (error) {
      console.error('Error getting profile image:', error);
      return null;
    }
  }

  async saveProfileData(data: ProfileData): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw error;
    }
  }

  async getProfileData(): Promise<ProfileData | null> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting profile data:', error);
      return null;
    }
  }

  async updateProfileData(updates: Partial<ProfileData>): Promise<ProfileData> {
    try {
      const currentData = await this.getProfileData() || {
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
      };
      const updatedData = { ...currentData, ...updates } as ProfileData;
      await this.saveProfileData(updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error updating profile data:', error);
      throw error;
    }
  }
}

export default new ProfileService(); 