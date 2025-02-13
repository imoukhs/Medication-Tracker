export interface HelpTip {
  id: string;
  title: string;
  content: string;
  screenId: string;
  elementId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  order: number;
}

export interface HelpGuide {
  id: string;
  title: string;
  description: string;
  steps: HelpStep[];
  category: 'getting_started' | 'medications' | 'tracking' | 'sharing' | 'settings';
}

export interface HelpStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  videoUrl?: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
}

export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface UserHelpPreferences {
  showTips: boolean;
  completedGuides: string[];
  dismissedTips: string[];
  lastSeenGuide?: string;
} 