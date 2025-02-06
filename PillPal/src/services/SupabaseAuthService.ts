import { supabase } from '../config/supabaseConfig';
import { User } from '@supabase/supabase-js';
import ProfileService from './ProfileService';

class SupabaseAuthService {
  private isGuest: boolean = false;

  async signUp(email: string, password: string, name: string): Promise<{ user: User | null; error: Error | null; needsEmailConfirmation?: boolean }> {
    try {
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      // Sign up with email confirmation enabled
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: 'pillpal://', // Add your app's URL scheme
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Check if email confirmation is needed
      const needsEmailConfirmation = !authData.user.email_confirmed_at && !authData.user.confirmed_at;

      if (!needsEmailConfirmation) {
        // Create profile immediately if email is already confirmed
        const { profile, error: profileError } = await ProfileService.createProfile(authData.user, name);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          await supabase.auth.signOut();
          throw profileError;
        }
      }

      // Disable guest mode on successful signup
      this.isGuest = false;

      return { 
        user: authData.user, 
        error: null,
        needsEmailConfirmation
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { user: null, error: error as Error };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at && !data.user.confirmed_at) {
        throw new Error('Please confirm your email before signing in');
      }

      // Disable guest mode on successful sign in
      this.isGuest = false;

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, error: error as Error };
    }
  }

  async enableGuestMode(): Promise<void> {
    this.isGuest = true;
  }

  async disableGuestMode(): Promise<void> {
    this.isGuest = false;
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset guest mode on sign out
      this.isGuest = false;
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as Error };
    }
  }

  isGuestMode(): boolean {
    return this.isGuest;
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pillpal://reset-password',
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: error as Error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null || this.isGuest;
  }
}

export default new SupabaseAuthService(); 