import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { supabase } from '../config/supabaseConfig';

const PROFILE_DATA_KEY = 'profile_data';
const PROFILE_IMAGE_KEY = 'profile_image_url';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  profileImageUrl?: string;
}

class ProfileService {
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');
    return user.id;
  }

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
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (!imageUri) {
          throw new Error('No image URI received');
        }
        const imageUrl = await this.uploadProfileImage(imageUri);
        return imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw new Error('Failed to pick image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async uploadProfileImage(uri: string): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Validate URI
      if (!uri || typeof uri !== 'string') {
        throw new Error('Invalid image URI');
      }

      // Fetch the image with error handling
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to fetch image data');
      }
      
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Invalid image data');
      }
      
      // Generate a unique file name with timestamp to avoid caching issues
      const timestamp = new Date().getTime();
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/profile_${timestamp}.${fileExtension}`;
      
      // Upload to Supabase Storage in user_profiles bucket
      const { data, error } = await supabase.storage
        .from('user_profiles')
        .upload(fileName, blob, {
          upsert: true,
          contentType: blob.type || 'image/jpeg',
          cacheControl: '3600',
        });
      
      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user_profiles')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      try {
        // Delete old profile image if it exists
        const oldImageUrl = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
        if (oldImageUrl) {
          const oldFileName = oldImageUrl.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('user_profiles')
              .remove([`${userId}/${oldFileName}`]);
          }
        }
      } catch (deleteError) {
        console.warn('Error deleting old profile image:', deleteError);
        // Continue execution even if old image deletion fails
      }

      // Update profile with the new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Save URL to local storage
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error('Failed to upload profile image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getProfileImage(): Promise<string | null> {
    try {
      // Try getting from local storage first
      const localImageUrl = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (localImageUrl) return localImageUrl;

      // If not in local storage, try Supabase
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_image')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data?.profile_image) {
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, data.profile_image);
        return data.profile_image;
      }

      return null;
    } catch (error) {
      console.error('Error getting profile image:', error);
      return null;
    }
  }

  async saveProfileData(data: ProfileData): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      // Save to Supabase
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (supabaseError) throw supabaseError;

      // Save to local storage
      await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw error;
    }
  }

  async getProfileData(): Promise<ProfileData | null> {
    try {
      // Try getting from local storage first
      const localData = await AsyncStorage.getItem(PROFILE_DATA_KEY);
      if (localData) return JSON.parse(localData);

      // If not in local storage, try Supabase
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        const profileData: ProfileData = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || '',
          profileImageUrl: data.profile_image,
        };
        await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profileData));
        return profileData;
      }

      return null;
    } catch (error) {
      console.error('Error getting profile data:', error);
      return null;
    }
  }

  async updateProfileData(updates: Partial<ProfileData>): Promise<ProfileData> {
    try {
      const userId = await this.getCurrentUserId();
      const currentData = await this.getProfileData() || {
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
      };

      const updatedData = { ...currentData, ...updates } as ProfileData;

      // Update in Supabase
      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({
          name: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phone,
          date_of_birth: updatedData.dateOfBirth,
          gender: updatedData.gender,
          address: updatedData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (supabaseError) throw supabaseError;

      // Update in local storage
      await AsyncStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(updatedData));
      return updatedData;
    } catch (error) {
      console.error('Error updating profile data:', error);
      throw error;
    }
  }
}

export default new ProfileService(); 