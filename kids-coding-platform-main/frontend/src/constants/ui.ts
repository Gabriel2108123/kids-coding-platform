/**
 * UI Constants and configurations for the Kids Coding Platform
 */

// Component Sizes
export const SIZES = {
  BUTTON: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
  },
  AVATAR: {
    TINY: 24,
    SMALL: 32,
    MEDIUM: 48,
    LARGE: 64,
    XLARGE: 96,
  },
  ICON: {
    TINY: 12,
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 24,
    XLARGE: 32,
  },
} as const;

// Z-Index Layers
export const Z_INDEX = {
  BASE: 0,
  ABOVE: 10,
  DROPDOWN: 100,
  STICKY: 200,
  MODAL_BACKDROP: 500,
  MODAL: 600,
  POPOVER: 700,
  TOOLTIP: 800,
  NOTIFICATION: 900,
  LOADING: 1000,
} as const;

// Animation Configurations
export const ANIMATIONS = {
  DURATION: {
    INSTANT: 0,
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  SPRING: {
    GENTLE: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    BOUNCY: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    WOBBLY: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// Layout Breakpoints (matches Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Spacing Scale (in pixels)
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
  '3XL': 64,
  '4XL': 96,
} as const;

// Border Radius Scale
export const BORDER_RADIUS = {
  NONE: 0,
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  '2XL': 24,
  FULL: 9999,
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  FONT_SIZE: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
    '5XL': '3rem',    // 48px
    '6XL': '3.75rem', // 60px
  },
  FONT_WEIGHT: {
    THIN: 100,
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
    BLACK: 900,
  },
  LINE_HEIGHT: {
    TIGHT: 1.25,
    SNUG: 1.375,
    NORMAL: 1.5,
    RELAXED: 1.625,
    LOOSE: 2,
  },
} as const;

// Component Variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  DESTRUCTIVE: 'destructive',
  SUCCESS: 'success',
} as const;

export const ALERT_VARIANTS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  OUTLINE: 'outline',
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Modal Sizes
export const MODAL_SIZES = {
  SM: 'sm',    // 384px
  MD: 'md',    // 512px
  LG: 'lg',    // 768px
  XL: 'xl',    // 1024px
  FULL: 'full', // Full screen
} as const;

// Form Field States
export const FIELD_STATES = {
  DEFAULT: 'default',
  FOCUSED: 'focused',
  ERROR: 'error',
  SUCCESS: 'success',
  DISABLED: 'disabled',
} as const;

// Progress Bar Types
export const PROGRESS_TYPES = {
  LINEAR: 'linear',
  CIRCULAR: 'circular',
  STEPPED: 'stepped',
} as const;

// Card Variants
export const CARD_VARIANTS = {
  DEFAULT: 'default',
  ELEVATED: 'elevated',
  OUTLINED: 'outlined',
  FILLED: 'filled',
} as const;

// Navigation States
export const NAV_STATES = {
  DEFAULT: 'default',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  LOADING: 'loading',
} as const;

// Table Density
export const TABLE_DENSITY = {
  COMPACT: 'compact',
  NORMAL: 'normal',
  COMFORTABLE: 'comfortable',
} as const;

// Image Placeholder Colors
export const PLACEHOLDER_COLORS = [
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
] as const;

// Accessibility Constants
export const ACCESSIBILITY = {
  FOCUS_VISIBLE_OUTLINE: '2px solid #3B82F6',
  MIN_TOUCH_TARGET: 44, // pixels
  MIN_CONTRAST_RATIO: 4.5,
  REDUCED_MOTION_QUERY: '(prefers-reduced-motion: reduce)',
  HIGH_CONTRAST_QUERY: '(prefers-contrast: high)',
} as const;

// Keyboard Navigation
export const KEYBOARD = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Media Queries (for JavaScript usage)
export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.SM - 1}px)`,
  TABLET: `(min-width: ${BREAKPOINTS.SM}px) and (max-width: ${BREAKPOINTS.LG - 1}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.LG}px)`,
  LARGE_DESKTOP: `(min-width: ${BREAKPOINTS.XL}px)`,
  TOUCH: '(pointer: coarse)',
  HOVER: '(hover: hover)',
  REDUCED_MOTION: '(prefers-reduced-motion: reduce)',
  HIGH_CONTRAST: '(prefers-contrast: high)',
  DARK_MODE: '(prefers-color-scheme: dark)',
} as const;

// Component Default Props
export const COMPONENT_DEFAULTS = {
  BUTTON: {
    variant: BUTTON_VARIANTS.PRIMARY,
    size: SIZES.BUTTON.MEDIUM,
  },
  MODAL: {
    size: MODAL_SIZES.MD,
    closeOnOverlayClick: true,
    closeOnEsc: true,
  },
  NOTIFICATION: {
    duration: 5000,
    position: 'top-right',
  },
  TOOLTIP: {
    placement: 'top',
    delay: 500,
  },
} as const;
