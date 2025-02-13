# PillPal - Your Smart Medication Management Companion

## Overview
PillPal is a comprehensive medication management mobile application built with React Native Expo, designed to help users track their medications, receive timely reminders, and maintain their health journey with engaging gamification features.

## Features

### 1. 💊 Medication Scheduling with Custom Reminders
- Custom medication profiles with names, dosages, and frequencies
- Persistent notifications until medication is taken
- Full-screen notifications for critical reminders
- Flexible scheduling options

### 2. 📦 Refill Tracking and Supply Management
- Real-time medication supply tracking
- Low-supply alerts and notifications
- Automated refill reminders

### 3. 📊 Daily Progress Tracking
- Visual circular progress bar for daily adherence
- Detailed calendar view for medication history
- Comprehensive dose management logging

### 4. 🏆 Gamification
- Streak tracking for consistent medication adherence
- Achievement badges for milestones:
  - 7-day streak badge
  - 30-day streak badge
  - Perfect month badge
  - And more!

### 5. 🚨 Emergency Contact System
- Trusted contact notification system
- Automated alerts for missed critical doses
- SMS/Email integration for emergency contacts

### 6. 🔐 Security Features
- Biometric authentication (Face ID/Touch ID)
- Secure local data storage
- Privacy-focused design

### 7. 🎨 User Experience
- Dark and Light theme support
- Cross-platform compatibility (iOS and Android)
- Clean, modern, and accessible UI

## Technical Stack

### Core Technologies
- **Framework**: React Native with Expo
- **Authentication**: Supabase + Expo Local Authentication
- **Navigation**: React Navigation
- **UI Components**: React Native Paper/NativeBase
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications

### Key Dependencies
- react-native-svg (Progress bar visualization)
- expo-local-authentication (Biometric authentication)
- expo-notifications (Reminder system)
- expo-calendar (Calendar integration)
- expo-sms (Emergency contact messaging)
- @react-navigation/native (Navigation system)
- @supabase/supabase-js (Authentication and data management)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pillpal.git
```

2. Install dependencies:
```bash
cd pillpal
npm install
```

3. Start the development server:
```bash
npx expo start
```

## Project Structure

```
pillpal/
├── App.js
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── MedicationDetailsScreen.js
│   │   └── SettingsScreen.js
│   ├── components/
│   │   ├── CircularProgress.js
│   │   ├── MedicationCard.js
│   │   └── NotificationManager.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── services/
│   │   ├── NotificationService.js
│   │   ├── StorageService.js
│   │   └── AuthService.js
│   ├── theme/
│   │   └── index.js
│   └── utils/
│       ├── gamification.js
│       └── helpers.js
```

## Contributing
We welcome contributions to PillPal! Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For support or queries, please open an issue in the GitHub repository.

---

Made with ❤️ by the PillPal Team
# Medication-Tracking
