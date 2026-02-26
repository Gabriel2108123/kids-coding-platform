/**
 * Central export for all application constants
 */

export * from './app';
export * from './themes';
export * from './ui';

// Re-export commonly used constants for convenience
export {
  API_BASE_URL,
  COPPA_AGE_LIMIT,
  XP_REWARDS,
  LEVEL_THRESHOLDS,
  AGE_GROUPS,
  DIFFICULTY_LEVELS,
  CONTENT_CATEGORIES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './app';

export {
  themes,
  defaultTheme,
  getTheme,
  applyTheme,
  getRecommendedThemes,
} from './themes';

export {
  SIZES,
  Z_INDEX,
  ANIMATIONS,
  BREAKPOINTS,
  BUTTON_VARIANTS,
  ALERT_VARIANTS,
  NOTIFICATION_TYPES,
  MODAL_SIZES,
} from './ui';
