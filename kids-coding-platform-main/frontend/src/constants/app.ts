/**
 * Application-wide constants for Bugsby Coding World
 */

// Application Branding
export const APP_NAME = 'Bugsby';
export const PLATFORM_NAME = 'Bugsby Coding World';
export const MASCOT_NAME = 'Bugsby';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 10000; // 10 seconds

// Authentication
export const TOKEN_STORAGE_KEY = 'authToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const TOKEN_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24 hours

// COPPA Compliance
export const COPPA_AGE_LIMIT = 13;
export const PARENTAL_CONSENT_REQUIRED_AGE = 13;

// Session Management
export const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
export const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes of inactivity

// Gamification
export const XP_REWARDS = {
  LESSON_COMPLETION: 50,
  MODULE_COMPLETION: 200,
  QUIZ_PERFECT_SCORE: 100,
  DAILY_LOGIN: 25,
  FIRST_PROJECT: 150,
  HELPING_FRIEND: 75,
  STREAK_BONUS: 10, // per day
} as const;

export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  400,   // Level 3
  900,   // Level 4
  1600,  // Level 5
  2500,  // Level 6
  3600,  // Level 7
  4900,  // Level 8
  6400,  // Level 9
  8100,  // Level 10
  10000, // Level 11
  12100, // Level 12
  14400, // Level 13
  16900, // Level 14
  19600, // Level 15
  22500, // Level 16+
] as const;

// UI Constants
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  LAPTOP: 1024,
  DESKTOP: 1280,
} as const;

// Content Limits
export const MAX_USERNAME_LENGTH = 20;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_PROJECT_TITLE_LENGTH = 50;
export const MAX_PROJECT_DESCRIPTION_LENGTH = 200;
export const MAX_CODE_LENGTH = 10000;

// Age Groups
export const AGE_GROUPS = {
  EARLY_KIDS: '4-7',
  MIDDLE_KIDS: '8-10',
  TEENS: '11-15',
} as const;

// Learning Difficulty
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// Content Categories
export const CONTENT_CATEGORIES = {
  FUNDAMENTALS: 'fundamentals',
  GAMES: 'games',
  STORYTELLING: 'storytelling',
  ART: 'art',
  MUSIC: 'music',
  MATH: 'math',
  SCIENCE: 'science',
} as const;

// Safety and Moderation
export const CONTENT_FILTER_LEVELS = {
  STRICT: 'strict',
  MODERATE: 'moderate',
  BASIC: 'basic',
} as const;

export const REPORT_REASONS = [
  'Inappropriate content',
  'Bullying or harassment',
  'Spam',
  'Copyright violation',
  'Technical issue',
  'Other',
] as const;

// Time Limits (in minutes)
export const DEFAULT_TIME_LIMITS = {
  '4-7': 30,
  '8-10': 60,
  '11-15': 120,
} as const;

// Supported Programming Languages
export const PROGRAMMING_LANGUAGES = {
  SCRATCH: 'scratch',
  BLOCKLY: 'blockly',
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  MAX_FILES: 10,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  DRAFT_PROJECT: 'draftProject',
  TUTORIAL_PROGRESS: 'tutorialProgress',
  ACCESSIBILITY_SETTINGS: 'accessibilitySettings',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_TAKEN: 'This username is already taken.',
  PARENTAL_CONSENT_REQUIRED: 'Parental consent is required for this action.',
  AGE_VERIFICATION_FAILED: 'Age verification failed. Please contact support.',
  CODE_EXECUTION_ERROR: 'There was an error running your code.',
  PROJECT_SAVE_ERROR: 'Failed to save your project. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully! Welcome to the coding adventure!',
  LOGIN_SUCCESS: 'Welcome back! Ready to continue coding?',
  PROJECT_SAVED: 'Your project has been saved successfully!',
  PROFILE_UPDATED: 'Your profile has been updated!',
  PASSWORD_CHANGED: 'Your password has been changed successfully!',
  EMAIL_VERIFIED: 'Your email has been verified!',
  PARENTAL_CONSENT_SENT: 'Parental consent request has been sent!',
} as const;

// App Metadata
export const APP_INFO = {
  NAME: 'CodeKids',
  VERSION: '1.0.0',
  DESCRIPTION: 'A fun and safe coding platform for kids',
  SUPPORT_EMAIL: 'support@codekids.com',
  PRIVACY_POLICY_URL: '/privacy',
  TERMS_OF_SERVICE_URL: '/terms',
} as const;

// Feature Flags (for development)
export const FEATURE_FLAGS = {
  ENABLE_VOICE_RECOGNITION: false,
  ENABLE_AI_ASSISTANT: false,
  ENABLE_MULTIPLAYER: false,
  ENABLE_VIDEO_CHAT: false,
  ENABLE_ADVANCED_ANALYTICS: false,
} as const;

// External URLs
export const EXTERNAL_URLS = {
  DOCUMENTATION: 'https://docs.codekids.com',
  COMMUNITY: 'https://community.codekids.com',
  PARENT_GUIDE: 'https://codekids.com/parent-guide',
  EDUCATOR_RESOURCES: 'https://codekids.com/educators',
} as const;
