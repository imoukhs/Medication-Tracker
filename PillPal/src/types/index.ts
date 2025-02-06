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
  scheduledTime: Date;
  supply: number;
  lowSupplyThreshold: number;
  ownerId: string;
  sharedWith: string[];
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
  scheduledTime?: Date;
  data?: object;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
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
  EmergencyContact: { modal: boolean };
  PersonalInformation: { modal: boolean };
  MedicalInformation: { modal: boolean };
  NotificationPreferences: { modal: boolean };
  PrivacyAndSecurity: { modal: boolean };
  SharedAccess: { modal: boolean };
  MedicationDetails: { medicationId: string };
  AddMedication: undefined;
  EditMedication: { medicationId: string };
  Progress: undefined;
  Profile: undefined;
};

export type UserRole = 'patient' | 'caregiver' | 'healthcare_provider' | 'family_member';

export interface UserRelationship {
  id: string;
  userId: string;
  relatedUserId: string;
  role: UserRole;
  permissions: UserPermissions;
  status: 'pending' | 'active' | 'rejected';
  createdAt: Date;
}

export interface UserPermissions {
  canViewMedications: boolean;
  canEditMedications: boolean;
  canViewAdherence: boolean;
  canViewMedicalInfo: boolean;
  canEditMedicalInfo: boolean;
  canManageEmergencyContacts: boolean;
  canReceiveAlerts: boolean;
}