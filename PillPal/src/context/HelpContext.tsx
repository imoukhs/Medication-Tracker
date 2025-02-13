import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HelpTip, HelpGuide, UserHelpPreferences, HelpArticle } from '../types/help';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabaseConfig';

interface HelpContextType {
  showTips: boolean;
  toggleTips: () => void;
  currentTip: HelpTip | null;
  currentGuide: HelpGuide | null;
  dismissTip: (tipId: string) => void;
  startGuide: (guideId: string) => void;
  completeGuide: (guideId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  currentStepIndex: number;
  searchHelp: (query: string) => Promise<HelpArticle[]>;
  isHelpModalVisible: boolean;
  showHelpModal: () => void;
  hideHelpModal: () => void;
}

const defaultHelpPreferences: UserHelpPreferences = {
  showTips: true,
  completedGuides: [],
  dismissedTips: [],
};

const HELP_PREFERENCES_KEY = '@help_preferences';

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserHelpPreferences>(defaultHelpPreferences);
  const [currentTip, setCurrentTip] = useState<HelpTip | null>(null);
  const [currentGuide, setCurrentGuide] = useState<HelpGuide | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      // Try to get preferences from local storage first
      const storedPrefs = await AsyncStorage.getItem(HELP_PREFERENCES_KEY);
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
        return;
      }

      // If no stored preferences, use defaults
      setPreferences(defaultHelpPreferences);
    } catch (error) {
      console.error('Error loading help preferences:', error);
      setPreferences(defaultHelpPreferences);
    }
  };

  const savePreferences = async (newPreferences: UserHelpPreferences) => {
    try {
      await AsyncStorage.setItem(HELP_PREFERENCES_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving help preferences:', error);
    }
  };

  const toggleTips = () => {
    const newPreferences = {
      ...preferences,
      showTips: !preferences.showTips,
    };
    savePreferences(newPreferences);
  };

  const dismissTip = (tipId: string) => {
    const newPreferences = {
      ...preferences,
      dismissedTips: [...preferences.dismissedTips, tipId],
    };
    savePreferences(newPreferences);
    setCurrentTip(null);
  };

  const startGuide = async (guideId: string) => {
    try {
      const { data, error } = await supabase
        .from('help_guides')
        .select('*')
        .eq('id', guideId)
        .single();

      if (error) throw error;
      setCurrentGuide(data);
      setCurrentStepIndex(0);
      setIsHelpModalVisible(true);
    } catch (error) {
      console.error('Error starting guide:', error);
    }
  };

  const completeGuide = (guideId: string) => {
    const newPreferences = {
      ...preferences,
      completedGuides: [...preferences.completedGuides, guideId],
      lastSeenGuide: guideId,
    };
    savePreferences(newPreferences);
    setCurrentGuide(null);
    setCurrentStepIndex(0);
    setIsHelpModalVisible(false);
  };

  const nextStep = () => {
    if (currentGuide && currentStepIndex < currentGuide.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const searchHelp = async (query: string): Promise<HelpArticle[]> => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .textSearch('content', query);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching help articles:', error);
      return [];
    }
  };

  const showHelpModal = () => setIsHelpModalVisible(true);
  const hideHelpModal = () => setIsHelpModalVisible(false);

  return (
    <HelpContext.Provider
      value={{
        showTips: preferences.showTips,
        toggleTips,
        currentTip,
        currentGuide,
        dismissTip,
        startGuide,
        completeGuide,
        nextStep,
        previousStep,
        currentStepIndex,
        searchHelp,
        isHelpModalVisible,
        showHelpModal,
        hideHelpModal,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
}; 