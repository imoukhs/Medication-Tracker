# PillPal Technical Documentation

## Implementation Details

### 1. Notification System

#### Persistent Notifications
```javascript
// Using Expo Notifications
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create a persistent notification
async function schedulePersistentNotification(medication) {
  const trigger = {
    seconds: 1,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to take " + medication.name,
      body: `${medication.dosage} - ${medication.instructions}`,
      data: { medicationId: medication.id },
      sticky: true,
      autoDismiss: false,
      actions: [
        { identifier: 'TAKEN', buttonTitle: 'Taken' },
        { identifier: 'SNOOZE', buttonTitle: 'Snooze' },
      ],
    },
    trigger,
  });
}
```

### 2. Progress Tracking

#### Circular Progress Bar
```javascript
// Using react-native-svg
import Svg, { Circle, Text } from 'react-native-svg';

const CircularProgress = ({ progress, size = 200 }) => {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      {/* Background Circle */}
      <Circle
        stroke="#e6e6e6"
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      {/* Progress Circle */}
      <Circle
        stroke="#4CAF50"
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
      />
      <Text
        x={size / 2}
        y={size / 2}
        fontSize="24"
        fill="#333"
        textAnchor="middle"
        dy=".3em"
      >
        {`${progress}%`}
      </Text>
    </Svg>
  );
};
```

### 3. Authentication

#### Biometric Authentication
```javascript
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateUser() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access PillPal',
        fallbackLabel: 'Use passcode',
      });

      return result.success;
    }
    return false;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}
```

### 4. Data Storage

#### AsyncStorage Implementation
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageService = {
  // Save medication data
  saveMedication: async (medication) => {
    try {
      const existingData = await AsyncStorage.getItem('medications');
      const medications = existingData ? JSON.parse(existingData) : [];
      medications.push(medication);
      await AsyncStorage.setItem('medications', JSON.stringify(medications));
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  },

  // Get all medications
  getMedications: async () => {
    try {
      const data = await AsyncStorage.getItem('medications');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  },
};
```

### 5. Gamification System

#### Streak Tracking
```javascript
const GamificationService = {
  calculateStreak: (medicationHistory) => {
    let currentStreak = 0;
    let lastDate = null;

    for (const entry of medicationHistory.reverse()) {
      const entryDate = new Date(entry.date);
      
      if (!lastDate) {
        lastDate = entryDate;
        currentStreak = 1;
        continue;
      }

      const dayDifference = Math.floor(
        (lastDate - entryDate) / (1000 * 60 * 60 * 24)
      );

      if (dayDifference === 1) {
        currentStreak++;
        lastDate = entryDate;
      } else {
        break;
      }
    }

    return currentStreak;
  },

  getBadges: (streak) => {
    const badges = [];
    if (streak >= 7) badges.push('week-warrior');
    if (streak >= 30) badges.push('monthly-master');
    if (streak >= 100) badges.push('centurion');
    return badges;
  },
};
```

### 6. Emergency Contact System

#### SMS Notification
```javascript
import * as SMS from 'expo-sms';

const EmergencyService = {
  sendEmergencySMS: async (contact, medication) => {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync(
          [contact.phoneNumber],
          `ALERT: ${medication.patientName} has missed their ${medication.name} dose at ${medication.scheduledTime}.`
        );
        return result === 'sent';
      }
      return false;
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
      return false;
    }
  },
};
```

## Theme Configuration

```javascript
const theme = {
  light: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    error: '#B00020',
  },
  dark: {
    primary: '#69F0AE',
    secondary: '#64B5F6',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#CF6679',
  },
};
```

## Best Practices

1. **Performance Optimization**
   - Use `useCallback` and `useMemo` for expensive computations
   - Implement proper list rendering with `FlatList`
   - Optimize images and assets

2. **Security**
   - Never store sensitive data in plain text
   - Implement proper error handling
   - Use secure storage for credentials

3. **Code Organization**
   - Follow component-based architecture
   - Implement proper state management
   - Use TypeScript for better type safety

4. **Testing**
   - Write unit tests for critical functions
   - Implement integration tests
   - Perform regular UI testing

## Troubleshooting

Common issues and their solutions:

1. **Notification not showing**
   - Check notification permissions
   - Verify trigger timing
   - Ensure proper configuration

2. **Biometric authentication fails**
   - Check device compatibility
   - Verify enrollment status
   - Handle fallback authentication

3. **Data persistence issues**
   - Clear AsyncStorage
   - Check storage quota
   - Verify data structure

---

For more detailed information, refer to the individual component documentation in the `docs/components` directory. 