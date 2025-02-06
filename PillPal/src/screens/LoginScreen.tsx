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
  ActivityIndicator,
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
import SupabaseAuthService from '../services/SupabaseAuthService';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const isSupported = await BiometricService.isBiometricAvailable();
      const isEnabled = await SecureStorageService.isBiometricEnabled();
      setIsBiometricSupported(isSupported && isEnabled);
      
      if (isSupported) {
        const types = await BiometricService.getBiometricType();
        if (Platform.OS === 'ios' && types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        }
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const credentials = await SecureStorageService.getBiometricCredentials();
      if (!credentials) {
        Alert.alert('Error', 'No stored credentials found');
        return;
      }

      const authenticated = await BiometricService.authenticateWithBiometrics(
        'Login to PillPal'
      );

      if (authenticated) {
        setIsLoading(true);
        const result = await SupabaseAuthService.signIn(
          credentials.email,
          credentials.password
        );

        if (result.success && result.user) {
          navigation.replace('MainTabs');
        } else {
          Alert.alert('Error', result.error || 'Failed to login');
        }
      }
    } catch (error) {
      console.error('Error with biometric auth:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await SupabaseAuthService.signIn(email, password);

      if (result.success && result.user) {
        navigation.replace('MainTabs');
      } else {
        if (result.error?.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Verified',
            'Please check your email for a verification link. Would you like us to send another verification email?',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Resend',
                onPress: async () => {
                  try {
                    const { error } = await SupabaseAuthService.resendConfirmationEmail(email);
                    if (error) {
                      Alert.alert('Error', error.message);
                    } else {
                      Alert.alert('Success', 'Verification email has been resent. Please check your inbox.');
                    }
                  } catch (error) {
                    Alert.alert('Error', 'Failed to resend verification email');
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', result.error || 'Failed to login');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      SupabaseAuthService.enableGuestMode();
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error enabling guest mode:', error);
      Alert.alert('Error', 'Failed to enable guest mode');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={24} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {isBiometricSupported && (
            <TouchableOpacity
              style={[styles.biometricButton, { borderColor: colors.primary }]}
              onPress={handleBiometricAuth}
            >
              <Ionicons name="finger-print" size={24} color={colors.primary} />
              <Text style={[styles.biometricButtonText, { color: colors.primary }]}>
                Login with Biometrics
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.guestButton, { borderColor: colors.primary }]}
            onPress={handleGuestMode}
          >
            <Text style={[styles.guestButtonText, { color: colors.primary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={[styles.signupLink, { color: colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  loginButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  guestButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default LoginScreen; 