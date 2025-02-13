import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseConfig';
import type { User, UserPreferences, UserRole, Profile } from '../types/user';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const defaultUserPreferences: UserPreferences = {
  theme: 'light',
  isSystemTheme: true,
  notifications: true,
  biometricEnabled: false,
  emergencyContact: null,
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Monitor network connectivity
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!isConnected) {
          throw new Error('No internet connection');
        }

        // Get initial session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          setSession(sessionData.session);
          if (sessionData.session?.user) {
            await fetchUserProfile(sessionData.session.user.id);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred during authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isConnected]);

  const fetchUserProfile = async (userId: string) => {
    try {
      if (!isConnected) {
        throw new Error('No internet connection');
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If error code is PGRST116, it means no profile exists yet
        if (error.code === 'PGRST116') {
          // Create a new profile for the user
          const newProfile: Profile = {
            id: userId,
            name: '',
            email: session?.user?.email || '',
            role: 'patient',
            preferences: defaultUserPreferences,
            relationships: [],
            profile_image: null,
            phone: '',
            date_of_birth: '',
            gender: '',
            address: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);

          if (insertError) throw insertError;

          // Set the user with default values
          const userData: User = {
            id: userId,
            email: session?.user?.email || '',
            name: '',
            role: 'patient',
            preferences: defaultUserPreferences,
            relationships: [],
          };
          setUser(userData);
          setError(null);
          return;
        }
        throw error;
      }

      if (profile) {
        const userRole: UserRole = profile.role || 'patient';
        const userData: User = {
          id: userId,
          email: session?.user?.email || '',
          name: profile.name || '',
          role: userRole,
          preferences: profile.preferences || defaultUserPreferences,
          relationships: profile.relationships || [],
        };
        setUser(userData);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user profile');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setLoading(true);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}; 