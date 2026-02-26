// New Family Account Structure for Kids Coding Platform
// Parent creates family account -> adds children -> children can login

export interface ParentAccount {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  role: 'parent';
  emailVerified: boolean;
  
  // Family management
  family: {
    children: ChildProfile[];
    subscriptionPlan: 'free' | 'premium' | 'family';
    subscriptionStatus: 'active' | 'inactive' | 'trial';
  };
  
  // Parent preferences
  preferences: {
    notifications: {
      emailReports: boolean;
      progressUpdates: boolean;
      achievements: boolean;
    };
    privacy: {
      allowChildDataSharing: boolean;
      allowThirdPartyAnalytics: boolean;
    };
  };
  
  // Account metadata
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export interface ChildProfile {
  _id: string;
  username: string; // Child's login username
  password: string; // Simple password for child
  displayName: string;
  dateOfBirth: Date;
  ageGroup: 'young_learners' | 'elementary' | 'advanced';
  avatar?: string;
  parentId: string; // Reference to parent account
  
  // COPPA compliance
  coppa: {
    parentalConsentGiven: boolean;
    consentDate: Date;
    consentMethod: 'parent_registration';
    requiresParentalSupervision: boolean;
  };
  
  // Learning progress
  progress: {
    level: number;
    xp: number;
    badges: string[];
    completedModules: string[];
    completedChallenges: string[];
    currentModule?: string;
    skills: { [skillName: string]: number };
    totalTimeSpent: number; // in minutes
    streakDays: number;
    lastActiveDate: Date;
  };
  
  // User settings (matches backend structure)
  settings?: {
    notifications?: {
      email: boolean;
      push: boolean;
      achievements: boolean;
      reminders: boolean;
      weeklyReports: boolean;
    };
    privacy?: {
      showProgress: boolean;
      allowFriendRequests: boolean;
      showOnLeaderboard: boolean;
      allowProjectSharing: boolean;
    };
    accessibility?: {
      fontSize: string;
      highContrast: boolean;
      screenReader: boolean;
      keyboardNavigation: boolean;
      audioDescriptions: boolean;
    };
    learning?: {
      difficultyPreference: string;
      pacePreference: string;
      visualPreferences: string[]; // Mascot stored in visualPreferences[0]
      reminderTime: string;
    };
  };

  // Child preferences (legacy - keeping for compatibility, but mascot moved to settings.learning.visualPreferences)
  preferences?: {
    theme?: 'colorful' | 'space' | 'ocean' | 'forest';
    difficulty?: 'easy' | 'normal' | 'challenge';
    interests?: string[];
  };
  
  // Safety settings
  safety: {
    maxDailyTime: number; // in minutes
    allowedDays: string[]; // ['monday', 'tuesday', ...]
    contentFilter: 'strict';
    blockedFeatures: string[];
  };
  
  // Account metadata
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

// Authentication responses
export interface ParentAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: ParentAccount;
    family?: {
      children: ChildProfile[];
      familyStats?: {
        totalXP: number;
        totalModulesCompleted: number;
        totalTimeSpent: number;
      };
    };
  };
}

export interface ChildAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: ChildProfile;
    parent?: {
      email: string;
      firstName: string;
      lastName: string;
    };
    permissions?: {
      canCreateProjects: boolean;
      canShareProjects: boolean;
      maxDailyTime: number;
      allowedFeatures: string[];
    };
  };
}

// Registration flows
export interface ParentRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  familyName: string;
  agreeToTerms: boolean;
  agreeToPrivacyPolicy: boolean;
}

export interface ChildRegistrationData {
  username: string;
  password: string;
  displayName: string;
  dateOfBirth: string;
  avatar?: string;
  interests?: string[];
  parentId: string; // Only parents can add children
}

const familyTypes = {};
export default familyTypes;
