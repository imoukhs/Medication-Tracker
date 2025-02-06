export const linking = {
  prefixes: ['pillpal://', 'https://pillpal.app'],
  config: {
    screens: {
      Login: 'login',
      SignUp: 'signup',
      ResetPassword: 'reset-password',
      MainTabs: {
        screens: {
          HomeTab: 'home',
          Progress: 'progress',
          Profile: 'profile',
          Settings: 'settings',
        },
      },
      MedicationDetails: 'medication/:medicationId',
      AddMedication: 'add-medication',
      EditMedication: 'edit-medication/:medicationId',
      EmergencyContact: 'emergency-contact',
      PersonalInformation: 'personal-information',
      MedicalInformation: 'medical-information',
      NotificationPreferences: 'notification-preferences',
      PrivacyAndSecurity: 'privacy-security',
      SharedAccess: 'shared-access',
      Achievements: 'achievements',
      ChangePassword: 'change-password',
    },
  },
}; 