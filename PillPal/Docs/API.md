# PillPal API Documentation

## Services

### 1. NotificationService

Handles all notification-related functionality.

```typescript
interface NotificationService {
  // Schedule a medication reminder
  scheduleMedicationReminder(medication: Medication): Promise<string>;
  
  // Cancel a specific notification
  cancelNotification(notificationId: string): Promise<void>;
  
  // Update an existing notification
  updateNotification(notificationId: string, updates: NotificationUpdate): Promise<void>;
  
  // Get all scheduled notifications
  getScheduledNotifications(): Promise<Notification[]>;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  scheduledTime: Date;
  supply: number;
  lowSupplyThreshold: number;
}

interface NotificationUpdate {
  title?: string;
  body?: string;
  scheduledTime?: Date;
  data?: object;
}
```

### 2. AuthenticationService

Manages user authentication and security.

```typescript
interface AuthenticationService {
  // Initialize biometric authentication
  initializeBiometric(): Promise<boolean>;
  
  // Authenticate user with biometrics
  authenticateWithBiometric(): Promise<AuthResult>;
  
  // Sign in with email/password
  signIn(email: string, password: string): Promise<AuthResult>;
  
  // Sign out current user
  signOut(): Promise<void>;
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
}
```

### 3. StorageService

Handles local data persistence.

```typescript
interface StorageService {
  // Medication Management
  saveMedication(medication: Medication): Promise<void>;
  getMedications(): Promise<Medication[]>;
  updateMedication(id: string, updates: Partial<Medication>): Promise<void>;
  deleteMedication(id: string): Promise<void>;
  
  // User Preferences
  savePreferences(preferences: UserPreferences): Promise<void>;
  getPreferences(): Promise<UserPreferences>;
  
  // History Management
  saveHistoryEntry(entry: HistoryEntry): Promise<void>;
  getHistory(): Promise<HistoryEntry[]>;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  emergencyContact: EmergencyContact;
  biometricEnabled: boolean;
}

interface HistoryEntry {
  id: string;
  medicationId: string;
  timestamp: Date;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
}
```

### 4. GamificationService

Manages streaks, badges, and achievements.

```typescript
interface GamificationService {
  // Streak Management
  calculateStreak(userId: string): Promise<number>;
  updateStreak(userId: string, action: 'increment' | 'reset'): Promise<void>;
  
  // Badge Management
  checkAndAwardBadges(userId: string): Promise<Badge[]>;
  getBadges(userId: string): Promise<Badge[]>;
  
  // Achievement Progress
  trackAchievementProgress(userId: string, achievement: Achievement): Promise<void>;
  getAchievements(userId: string): Promise<Achievement[]>;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateAwarded: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}
```

### 5. EmergencyService

Handles emergency contact notifications.

```typescript
interface EmergencyService {
  // Contact Management
  addEmergencyContact(contact: EmergencyContact): Promise<void>;
  updateEmergencyContact(contact: EmergencyContact): Promise<void>;
  removeEmergencyContact(contactId: string): Promise<void>;
  
  // Notification Methods
  sendEmergencySMS(contactId: string, message: string): Promise<boolean>;
  sendEmergencyEmail(contactId: string, message: string): Promise<boolean>;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  notificationPreference: 'sms' | 'email' | 'both';
}
```

## State Management

### 1. Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  medications: MedicationsState;
  notifications: NotificationsState;
  gamification: GamificationState;
  settings: SettingsState;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface MedicationsState {
  items: Medication[];
  loading: boolean;
  error: string | null;
}

interface NotificationsState {
  scheduled: Notification[];
  history: NotificationHistory[];
  permissions: boolean;
}

interface GamificationState {
  streak: number;
  badges: Badge[];
  achievements: Achievement[];
}

interface SettingsState {
  theme: 'light' | 'dark';
  notifications: boolean;
  biometricEnabled: boolean;
  emergencyContacts: EmergencyContact[];
}
```

## Error Handling

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const ErrorCodes = {
  NOTIFICATION_FAILED: 'NOTIFICATION_FAILED',
  AUTH_FAILED: 'AUTH_FAILED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;
```

## Events

```typescript
interface AppEvents {
  // Medication Events
  'medication:added': (medication: Medication) => void;
  'medication:updated': (medication: Medication) => void;
  'medication:deleted': (medicationId: string) => void;
  
  // Notification Events
  'notification:triggered': (notification: Notification) => void;
  'notification:responded': (response: NotificationResponse) => void;
  
  // Achievement Events
  'achievement:unlocked': (achievement: Achievement) => void;
  'streak:updated': (newStreak: number) => void;
  
  // Auth Events
  'auth:stateChanged': (user: User | null) => void;
  'auth:error': (error: APIError) => void;
}
```

## Constants

```typescript
const APP_CONSTANTS = {
  // Notification Types
  NOTIFICATION_TYPES: {
    MEDICATION_REMINDER: 'MEDICATION_REMINDER',
    LOW_SUPPLY_ALERT: 'LOW_SUPPLY_ALERT',
    ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
    EMERGENCY_ALERT: 'EMERGENCY_ALERT',
  },
  
  // Achievement Thresholds
  ACHIEVEMENT_THRESHOLDS: {
    WEEK_STREAK: 7,
    MONTH_STREAK: 30,
    PERFECT_MONTH: 30,
    SUPPLY_MASTER: 10,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    USER_PREFERENCES: 'user_preferences',
    MEDICATIONS: 'medications',
    HISTORY: 'history',
    ACHIEVEMENTS: 'achievements',
  },
  
  // API Endpoints
  API_ENDPOINTS: {
    AUTH: '/api/auth',
    MEDICATIONS: '/api/medications',
    NOTIFICATIONS: '/api/notifications',
    EMERGENCY: '/api/emergency',
  },
} as const;
```

## Usage Examples

### 1. Scheduling a Medication Reminder

```typescript
const scheduleMedication = async (medication: Medication) => {
  try {
    // Save medication to storage
    await StorageService.saveMedication(medication);
    
    // Schedule notification
    const notificationId = await NotificationService.scheduleMedicationReminder(medication);
    
    // Update medication with notification ID
    await StorageService.updateMedication(medication.id, { notificationId });
    
    return true;
  } catch (error) {
    throw new APIError(
      'Failed to schedule medication',
      ErrorCodes.NOTIFICATION_FAILED,
      500
    );
  }
};
```

### 2. Handling Notification Response

```typescript
const handleNotificationResponse = async (response: NotificationResponse) => {
  const { medicationId, action } = response.data;
  
  if (action === 'TAKEN') {
    // Update medication history
    await StorageService.saveHistoryEntry({
      medicationId,
      status: 'taken',
      timestamp: new Date(),
    });
    
    // Update streak
    await GamificationService.updateStreak(userId, 'increment');
    
    // Check for achievements
    await GamificationService.checkAndAwardBadges(userId);
  }
};
```

For more detailed information about specific components and their implementation, refer to the individual component documentation in the `docs/components` directory. 