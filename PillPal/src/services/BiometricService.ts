import * as LocalAuthentication from 'expo-local-authentication';
import SecureStorageService from './SecureStorageService';

class BiometricService {
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  async authenticateWithBiometrics(promptMessage: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });
      return result.success;
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      return false;
    }
  }

  async getBiometricType(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return [];
    }
  }

  async enableBiometrics(email: string, password: string): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) return false;

      const authenticated = await this.authenticateWithBiometrics(
        'Authenticate to enable biometric login'
      );
      if (!authenticated) return false;

      await SecureStorageService.storeBiometricCredentials(email, password);
      return true;
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return false;
    }
  }

  async disableBiometrics(): Promise<boolean> {
    try {
      const authenticated = await this.authenticateWithBiometrics(
        'Authenticate to disable biometric login'
      );
      if (!authenticated) return false;

      await SecureStorageService.removeBiometricCredentials();
      return true;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      return false;
    }
  }
}

export default new BiometricService(); 