import { supabase } from '../config/supabaseConfig';
import { SharedAccessItem, UserRole, UserPermissions } from '../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DatabaseSharedAccess {
  id: string;
  owner_id: string;
  owner_email: string;
  invitee_email: string;
  role: UserRole;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  updated_at: string;
}

const DEFAULT_PAGE_SIZE = 10;

const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'healthcare_provider':
      return {
        can_view_medications: true,
        can_edit_medications: true,
        can_view_medical_info: true,
        can_edit_medical_info: true,
        can_receive_alerts: true,
      };
    case 'caregiver':
      return {
        can_view_medications: true,
        can_edit_medications: true,
        can_view_medical_info: true,
        can_edit_medical_info: false,
        can_receive_alerts: true,
      };
    case 'family_member':
      return {
        can_view_medications: true,
        can_edit_medications: false,
        can_view_medical_info: true,
        can_edit_medical_info: false,
        can_receive_alerts: true,
      };
    default:
      return {
        can_view_medications: false,
        can_edit_medications: false,
        can_view_medical_info: false,
        can_edit_medical_info: false,
        can_receive_alerts: false,
      };
  }
};

class SupabaseSharedAccessService {
  private async initializeDatabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to insert a temporary row to check if tables exist
      const { error: testError } = await supabase
        .from('shared_access')
        .insert([
          {
            id: '00000000-0000-0000-0000-000000000000',
            owner_id: user.id,
            owner_email: user.email,
            invitee_email: 'test@test.com',
            role: 'caregiver',
            status: 'pending'
          }
        ]);

      if (testError && testError.code === '42P01') {
        // Tables don't exist, create them
        await supabase.rpc('initialize_database', {
          create_tables_query: `
            -- Create shared_access table
            CREATE TABLE IF NOT EXISTS public.shared_access (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              owner_email TEXT NOT NULL,
              invitee_email TEXT NOT NULL,
              role TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              CONSTRAINT role_check CHECK (role IN ('caregiver', 'healthcare_provider', 'family_member')),
              CONSTRAINT status_check CHECK (status IN ('pending', 'active', 'rejected'))
            );

            -- Create emergency_contacts table
            CREATE TABLE IF NOT EXISTS public.emergency_contacts (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              phone TEXT NOT NULL,
              relationship TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );

            -- Set up RLS policies for shared_access
            ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can view their own shared access records"
              ON public.shared_access FOR SELECT
              USING (auth.uid() = owner_id OR auth.email() = invitee_email);

            CREATE POLICY "Users can insert their own shared access records"
              ON public.shared_access FOR INSERT
              WITH CHECK (auth.uid() = owner_id);

            CREATE POLICY "Users can update their own shared access records"
              ON public.shared_access FOR UPDATE
              USING (auth.uid() = owner_id OR auth.email() = invitee_email);

            CREATE POLICY "Users can delete their own shared access records"
              ON public.shared_access FOR DELETE
              USING (auth.uid() = owner_id);

            -- Set up RLS policies for emergency_contacts
            ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can view their own emergency contacts"
              ON public.emergency_contacts FOR SELECT
              USING (auth.uid() = user_id);

            CREATE POLICY "Users can insert their own emergency contacts"
              ON public.emergency_contacts FOR INSERT
              WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can update their own emergency contacts"
              ON public.emergency_contacts FOR UPDATE
              USING (auth.uid() = user_id);

            CREATE POLICY "Users can delete their own emergency contacts"
              ON public.emergency_contacts FOR DELETE
              USING (auth.uid() = user_id);
          `
        });
      } else {
        // Clean up the temporary row
        await supabase
          .from('shared_access')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  constructor() {
    this.initializeDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }

  private async checkAuthentication() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No authenticated user found');
    }
    return session.user;
  }

  async getActiveConnections(page = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('shared_access')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(page * DEFAULT_PAGE_SIZE, (page + 1) * DEFAULT_PAGE_SIZE - 1);

      if (error) throw error;

      return {
        data: (data as DatabaseSharedAccess[]).map((item): SharedAccessItem => ({
          id: item.id,
          email: item.invitee_email,
          role: item.role,
          status: item.status,
          created_at: item.created_at,
          permissions: getRolePermissions(item.role),
        })),
        error: null,
      };
    } catch (error) {
      console.error('Error getting active connections:', error);
      return { data: null, error };
    }
  }

  async getReceivedInvites() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('shared_access')
        .select('*')
        .eq('invitee_email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: (data as DatabaseSharedAccess[]).map((item): SharedAccessItem => ({
          id: item.id,
          email: item.owner_email,
          role: item.role,
          status: item.status,
          created_at: item.created_at,
          permissions: getRolePermissions(item.role),
        })),
        error: null,
      };
    } catch (error) {
      console.error('Error getting received invites:', error);
      return { data: null, error };
    }
  }

  async sendInvite(inviteeEmail: string, role: UserRole): Promise<{ data: SharedAccessItem | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Check for existing invites or connections
      const { data: existingInvites } = await supabase
        .from('shared_access')
        .select('*')
        .eq('invitee_email', inviteeEmail)
        .eq('owner_id', user.id);

      if (existingInvites && existingInvites.length > 0) {
        const activeOrPending = existingInvites.find(
          invite => invite.status === 'active' || invite.status === 'pending'
        );

        if (activeOrPending) {
          if (activeOrPending.status === 'active') {
            throw new Error('An active connection already exists with this email');
          } else {
            // Update existing pending invite instead of creating a new one
            const { data, error } = await supabase
              .from('shared_access')
              .update({ role, updated_at: new Date().toISOString() })
              .eq('id', activeOrPending.id)
              .select()
              .single();

            if (error) throw error;
            return {
              data: data ? {
                id: data.id,
                email: data.invitee_email,
                role: data.role,
                status: data.status,
                created_at: data.created_at,
                permissions: getRolePermissions(data.role)
              } : null,
              error: null
            };
          }
        }
      }

      // Create new invite
      const { data, error } = await supabase
        .from('shared_access')
        .insert([{
          owner_id: user.id,
          owner_email: user.email,
          invitee_email: inviteeEmail,
          role,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        data: data ? {
          id: data.id,
          email: data.invitee_email,
          role: data.role,
          status: data.status,
          created_at: data.created_at,
          permissions: getRolePermissions(data.role)
        } : null,
        error: null
      };
    } catch (error) {
      console.error('Error sending invite:', error);
      return { data: null, error: error as Error };
    }
  }

  async respondToInvite(inviteId: string, accept: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('shared_access')
        .update({
          status: accept ? 'active' : 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', inviteId)
        .eq('invitee_email', user.email)
        .eq('status', 'pending');

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error responding to invite:', error);
      return { error };
    }
  }

  async removeConnection(connectionId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('shared_access')
        .delete()
        .eq('id', connectionId)
        .eq('owner_id', user.id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error removing connection:', error);
      return { error };
    }
  }

  async clearUserData(userId: string) {
    try {
      const { error } = await supabase
        .from('shared_access')
        .delete()
        .or(`owner_id.eq.${userId},invitee_id.eq.${userId}`);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error clearing user data:', error);
      return { error };
    }
  }

  async getSentInvites(): Promise<{ data: SharedAccessItem[]; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('shared_access')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;
      return { data: data.map((item): SharedAccessItem => ({
        id: item.id,
        email: item.invitee_email,
        role: item.role,
        status: item.status,
        created_at: item.created_at,
        permissions: getRolePermissions(item.role),
      })), error: null };
    } catch (error) {
      console.error('Error getting sent invites:', error);
      return { data: [], error: error as Error };
    }
  }

  async clearAccountData(): Promise<{ error: Error | null }> {
    try {
      const user = await this.checkAuthentication();

      // Delete all medications
      const { error: medError } = await supabase
        .from('medications')
        .delete()
        .match({ owner_id: user.id });
      if (medError) throw medError;

      // Delete all emergency contacts
      const { error: contactError } = await supabase
        .from('emergency_contacts')
        .delete()
        .match({ user_id: user.id });
      if (contactError) throw contactError;

      // Delete all achievements
      const { error: achieveError } = await supabase
        .from('achievements')
        .delete()
        .match({ user_id: user.id });
      if (achieveError) throw achieveError;

      // Delete all notification preferences
      const { error: notifError } = await supabase
        .from('notification_preferences')
        .delete()
        .match({ user_id: user.id });
      if (notifError) throw notifError;

      // Delete all shared access invites
      const { error: inviteError1 } = await supabase
        .from('shared_access_invites')
        .delete()
        .match({ inviter_id: user.id });
      if (inviteError1) throw inviteError1;

      const { error: inviteError2 } = await supabase
        .from('shared_access_invites')
        .delete()
        .match({ invitee_email: user.email });
      if (inviteError2) throw inviteError2;

      // Reset profile to default values without deleting it
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: '',
          profile_image: null,
          medical_info: null,
          emergency_info: null,
          preferences: null,
          updated_at: new Date().toISOString()
        })
        .match({ id: user.id });
      if (profileError) throw profileError;

      // Clear local storage
      await AsyncStorage.clear();

      return { error: null };
    } catch (error) {
      console.error('Error clearing account data:', error);
      return { error: error as Error };
    }
  }

  async deleteAccount(): Promise<{ error: Error | null }> {
    try {
      const user = await this.checkAuthentication();

      // First clear all user data
      const { error: clearError } = await this.clearAccountData();
      if (clearError) throw clearError;

      // Delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .match({ id: user.id });
      if (profileError) throw profileError;

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error: error as Error };
    }
  }
}

export default new SupabaseSharedAccessService(); 