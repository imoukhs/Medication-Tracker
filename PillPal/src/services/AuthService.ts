import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const AUTH_STORAGE_KEY = '@auth_data';
const GUEST_MODE_KEY = '@guest_mode';

class AuthService {
  private currentUser: User | null = null;
  private isGuest: boolean = false;

  async initialize(): Promise<void> {
    try {
      const [authData, guestMode] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(GUEST_MODE_KEY),
      ]);

      if (authData) {
        this.currentUser = JSON.parse(authData);
      } else if (guestMode === 'true') {
        this.isGuest = true;
      }
    } catch (error) {
      console.error('Error initializing auth service:', error);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      // In a real app, you would validate credentials against a backend
      // For now, we'll simulate a successful login
      const user: User = {
        id: Math.random().toString(),
        email,
        name: email.split('@')[0],
        preferences: {
          theme: 'light',
          isSystemTheme: true,
          notifications: true,
          biometricEnabled: false,
          emergencyContact: null,
        },
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error('Failed to login');
    }
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    try {
      // In a real app, you would create a new user in the backend
      // For now, we'll simulate a successful signup
      const user: User = {
        id: Math.random().toString(),
        email,
        name,
        preferences: {
          theme: 'light',
          isSystemTheme: true,
          notifications: true,
          biometricEnabled: false,
          emergencyContact: null,
        },
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw new Error('Failed to sign up');
    }
  }

  async enableGuestMode(): Promise<void> {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      this.isGuest = true;
    } catch (error) {
      console.error('Error enabling guest mode:', error);
      throw new Error('Failed to enable guest mode');
    }
  }

  async logout(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEY),
        AsyncStorage.removeItem(GUEST_MODE_KEY),
      ]);
      this.currentUser = null;
      this.isGuest = false;
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error('Failed to logout');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isGuestMode(): boolean {
    return this.isGuest;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null || this.isGuest;
  }
}

export default new AuthService(); 