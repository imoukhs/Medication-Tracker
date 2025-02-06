import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import AuthService from '../services/AuthService';
import SecureStorageService from '../services/SecureStorageService';
import BiometricService from '../services/BiometricService';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const isAvailable = await BiometricService.isBiometricAvailable();
      setIsBiometricSupported(isAvailable);
      
      if (isAvailable) {
        const types = await BiometricService.getBiometricType();
        if (Platform.OS === 'ios' && types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
        
        // Check if user has enabled biometric login
        const isEnabled = await SecureStorageService.isBiometricEnabled();
        if (isEnabled) {
          handleBiometricAuth();
        }
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const authenticated = await BiometricService.authenticateWithBiometrics(
        biometricType === 'facial' ? 'Login with Face ID' : 'Login with Fingerprint'
      );

      if (authenticated) {
        const credentials = await SecureStorageService.getBiometricCredentials();
        if (credentials) {
          setLoading(true);
          try {
            await AuthService.login(credentials.email, credentials.password);
            navigation.replace('MainTabs');
          } catch (error) {
            Alert.alert('Error', 'Failed to login. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await AuthService.login(email, password);
      // Store credentials if biometric is supported
      if (isBiometricSupported) {
        await SecureStorageService.storeBiometricCredentials(email, password);
      }
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setLoading(true);
    try {
      await AuthService.enableGuestMode();
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to enable guest mode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Ionicons name="medical" size={80} color={colors.primary} />
          <Text style={[styles.appName, { color: colors.text }]}>PillPal</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your Medication Management Companion
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {isBiometricSupported && (
            <TouchableOpacity
              style={[styles.biometricButton, { borderColor: colors.primary }]}
              onPress={handleBiometricAuth}
            >
              <Ionicons 
                name={biometricType === 'facial' ? 'scan-outline' : 'finger-print'} 
                size={24} 
                color={colors.primary} 
              />
              <Text style={[styles.biometricButtonText, { color: colors.primary }]}>
                Login with {biometricType === 'facial' ? 'Face ID' : 'Fingerprint'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestButton, { borderColor: colors.primary }]}
            onPress={handleGuestMode}
            disabled={loading}
          >
            <Text style={[styles.guestButtonText, { color: colors.primary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    flexDirection: 'row',
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  guestButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen; 