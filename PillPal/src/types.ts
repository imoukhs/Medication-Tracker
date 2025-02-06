export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  MedicationDetails: { medicationId: string };
  AddMedication: undefined;
  EmergencyContact: { modal: true } | undefined;
  Progress: undefined;
  PersonalInformation: { modal: true } | undefined;
  MedicalInformation: { modal: true } | undefined;
  NotificationPreferences: { modal: true } | undefined;
  PrivacyAndSecurity: { modal: true } | undefined;
  HomeTab: undefined;
  Settings: undefined;
  Profile: undefined;
};

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
  phone: string;
  relationship: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  isSystemTheme: boolean;
  notifications: boolean;
  biometricEnabled: boolean;
  emergencyContact: EmergencyContact | null;
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

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
} 