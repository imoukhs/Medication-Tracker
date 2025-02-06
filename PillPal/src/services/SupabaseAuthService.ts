import { supabase } from '../config/supabaseConfig';
import { User, AuthResponse } from '@supabase/supabase-js';
import { AuthResult, UserRole } from '../types/';

class SupabaseAuthService {
  private isGuest: boolean = false;

  async signUp(
    email: string, 
    password: string, 
    name: string
  ): Promise<AuthResult> {
    try {
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'patient',
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        const defaultProfile = {
          id: data.user.id,
          email,
          name,
          role: 'patient' as UserRole,
          preferences: {
            theme: 'light' as const,
            isSystemTheme: true,
            notifications: true,
            biometricEnabled: false,
            emergencyContact: null
          },
          relationships: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          // Use upsert instead of insert to handle potential duplicates
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([defaultProfile], {
              onConflict: 'id',
              ignoreDuplicates: false
            });

          if (profileError) throw profileError;

          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email!,
              name,
              role: 'patient',
              preferences: defaultProfile.preferences,
              relationships: defaultProfile.relationships,
            },
          };
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Even if profile creation fails, return basic user data
          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email!,
              name,
              role: 'patient',
              preferences: defaultProfile.preferences,
              relationships: [],
            },
          };
        }
      }

      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error signing up:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during signup',
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        // Create default profile data
        const defaultProfile = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: 'patient' as UserRole,
          preferences: {
            theme: 'light' as const,
            isSystemTheme: true,
            notifications: true,
            biometricEnabled: false,
            emergencyContact: null
          },
          relationships: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        try {
          // Try to create/update the profile
          const { data: profileData, error: upsertError } = await supabase
            .from('profiles')
            .upsert([defaultProfile], {
              onConflict: 'id',
              ignoreDuplicates: false
            })
            .select('*')
            .single();

          if (upsertError) throw upsertError;

          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email!,
              name: profileData?.name || defaultProfile.name,
              role: (profileData?.role || defaultProfile.role) as UserRole,
              preferences: profileData?.preferences || defaultProfile.preferences,
              relationships: profileData?.relationships || defaultProfile.relationships,
            },
          };
        } catch (profileError) {
          console.error('Error handling profile:', profileError);
          // If there's any error with the profile, return the default user data
          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email!,
              name: defaultProfile.name,
              role: defaultProfile.role,
              preferences: defaultProfile.preferences,
              relationships: defaultProfile.relationships,
            },
          };
        }
      }

      throw new Error('Failed to sign in');
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during sign in',
      };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.isGuest = false;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as Error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return {
        ...user,
        ...profile,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
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

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error: error as Error };
    }
  }

  async updateProfile(updates: {
    name?: string;
    email?: string;
    role?: UserRole;
    preferences?: any;
  }): Promise<{ error: Error | null }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch full user profile when auth state changes
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && profile) {
          callback({ ...session.user, ...profile });
        } else {
          callback(session.user);
        }
      } else {
        callback(null);
      }
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null || this.isGuest;
  }

  enableGuestMode(): void {
    this.isGuest = true;
  }

  disableGuestMode(): void {
    this.isGuest = false;
  }

  isGuestMode(): boolean {
    return this.isGuest;
  }

  async resendConfirmationEmail(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      return { error: error as Error };
    }
  }
}

export default new SupabaseAuthService(); 