export type UserRole = 'patient' | 'caregiver' | 'family_member' | 'healthcare_provider';

export interface UserPreferences {
  theme: 'light' | 'dark';
  isSystemTheme: boolean;
  notifications: boolean;
  biometricEnabled: boolean;
  emergencyContact: EmergencyContact | null;
  [key: string]: any;
}

export interface UserRelationship {
  id: string;
  type: 'caregiver' | 'dependent';
  userId: string;
  status: 'pending' | 'active' | 'rejected';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferences: UserPreferences;
  relationships: UserRelationship[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  scheduledTime: Date;
  supply: number;
  lowSupplyThreshold: number;
  owner_id: string;
  shared_with: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface HistoryEntry {
  id: string;
  medicationId: string;
  timestamp: number;
  taken: boolean;
  notes?: string;
}

export interface NotificationUpdate {
  title?: string;
  body?: string;
  scheduled_time?: Date;
  data?: object;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateAwarded: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  completed: boolean;
}

export interface NotificationResponse {
  data: {
    medicationId: string;
    action: 'TAKEN' | 'SNOOZE';
  };
}

export interface MedicationDetailsScreenProps {
  route: {
    params: {
      medicationId: string;
    };
  };
  navigation: any;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  MedicationDetails: { medicationId: string } | undefined;
  AddMedication: undefined;
  EditMedication: { medicationId: string };
  EmergencyContact: { modal?: boolean };
  PersonalInformation: { modal?: boolean };
  MedicalInformation: { modal?: boolean };
  NotificationPreferences: { modal?: boolean };
  SharedAccess: { modal?: boolean };
  PrivacyAndSecurity: { modal?: boolean };
  ChangePassword: { modal?: boolean };
  Achievements: { modal?: boolean };
  HomeTab: undefined;
  Settings: undefined;
  Profile: undefined;
  Progress: undefined;
};

export interface UserPermissions {
  canViewMedications: boolean;
  canEditMedications: boolean;
  canViewAdherence: boolean;
  canViewMedicalInfo: boolean;
  canEditMedicalInfo: boolean;
  canManageEmergencyContacts: boolean;
  canReceiveAlerts: boolean;
}