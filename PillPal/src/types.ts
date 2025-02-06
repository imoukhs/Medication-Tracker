export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  Home: undefined;
  MedicationDetails: { medicationId: string } | undefined;
  AddMedication: undefined;
  EditMedication: { medicationId: string };
  EmergencyContact: { modal?: boolean };
  Progress: undefined;
  PersonalInformation: { modal?: boolean };
  MedicalInformation: { modal?: boolean };
  NotificationPreferences: { modal?: boolean };
  PrivacyAndSecurity: { modal?: boolean };
  ChangePassword: { modal?: boolean };
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