import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

class SecureStorageService {
  async storeBiometricCredentials(email: string, password: string): Promise<void> {
    try {
      const credentials = { email, password };
      await SecureStore.setItemAsync(
        BIOMETRIC_CREDENTIALS_KEY,
        JSON.stringify(credentials),
        {
          keychainAccessible: Platform.OS === 'ios' 
            ? SecureStore.WHEN_UNLOCKED 
            : undefined
        }
      );
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    } catch (error) {
      console.error('Error storing biometric credentials:', error);
      throw new Error('Failed to store biometric credentials');
    }
  }

  async getBiometricCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      const credentialsString = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      if (!credentialsString) return null;
      return JSON.parse(credentialsString);
    } catch (error) {
      console.error('Error getting biometric credentials:', error);
      return null;
    }
  }

  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  async removeBiometricCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    } catch (error) {
      console.error('Error removing biometric credentials:', error);
      throw new Error('Failed to remove biometric credentials');
    }
  }
}

export default new SecureStorageService(); 