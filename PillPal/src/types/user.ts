export type UserRole = 'caregiver' | 'healthcare_provider' | 'family_member';


export interface UserPreferences {
  theme: 'light' | 'dark';
  isSystemTheme: boolean;
  notifications: boolean;
  biometricEnabled: boolean;
  emergencyContact: {
    id: string;
    name: string;
    phone: string;
    relationship: string;
  } | null;
}

export interface UserRelationship {
  id: string;
  type: 'caregiver' | 'dependent';
  userId: string;
  status: 'pending' | 'active' | 'rejected';
}

export interface UserPermissions {
  can_view_medications: boolean;
  can_edit_medications: boolean;
  can_view_medical_info: boolean;
  can_edit_medical_info: boolean;
  can_receive_alerts: boolean;
}

export interface SharedAccessItem {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  permissions?: UserPermissions;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferences: UserPreferences;
  relationships: UserRelationship[];
  profile_image: string | null;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  created_at: string;
  updated_at: string;
} 