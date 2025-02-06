export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  emergencyContact: EmergencyContact | null;
  biometricEnabled: boolean;
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
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  notificationPreference: 'sms' | 'email' | 'both';
}

export interface HistoryEntry {
  id: string;
  medicationId: string;
  timestamp: Date;
  status: 'taken' | 'missed' | 'skipped';
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
  Home: undefined;
  MedicationDetails: { medicationId: string } | undefined;
  Settings: undefined;
  AddMedication: undefined;
  Profile: undefined;
}; 