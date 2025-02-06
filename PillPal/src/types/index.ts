export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  role: UserRole;
  relationships: UserRelationship[];
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  isSystemTheme: boolean;
  notifications: boolean;
  biometricEnabled: boolean;
  emergencyContact: EmergencyContact | null;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  scheduled_time: Date;
  supply: number;
  low_supply_threshold: number;
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

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  HomeTab: undefined;
  Settings: undefined;
  Profile: undefined;
  Progress: undefined;
  MedicationDetails: { medicationId: string };
  AddMedication: undefined;
  EditMedication: { medicationId: string };
  EmergencyContact: { modal?: boolean };
  PersonalInformation: { modal?: boolean };
  MedicalInformation: { modal?: boolean };
  NotificationPreferences: { modal?: boolean };
  PrivacyAndSecurity: { modal?: boolean };
  SharedAccess: { modal?: boolean };
  Achievements: { modal?: boolean };
  ChangePassword: { modal?: boolean };
};

export type UserRole = 'patient' | 'caregiver' | 'healthcare_provider' | 'family_member';

export interface UserPermissions {
  canViewMedications: boolean;
  canEditMedications: boolean;
  canViewAdherence: boolean;
  canViewMedicalInfo: boolean;
  canEditMedicalInfo: boolean;
  canManageEmergencyContacts: boolean;
  canReceiveAlerts: boolean;
}

export interface UserRelationship {
  id: string;
  userId: string;
  relatedUserId: string;
  role: UserRole;
  permissions: UserPermissions;
  status: 'pending' | 'active' | 'rejected';
  createdAt: Date;
}