/**
 * Theme configuration for the Kids Coding Platform
 */

import { FrontendAgeGroup } from '../utils/ageGroupUtils';

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    hero: string;
    card: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export const themes: Record<string, Theme> = {
  light: {
    name: 'light',
    displayName: 'Bright & Cheerful',
    colors: {
      primary: '#4F46E5', // Indigo
      secondary: '#06B6D4', // Cyan
      accent: '#F59E0B', // Amber
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        accent: '#4F46E5',
      },
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
      secondary: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
      hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      card: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
    },
    shadows: {
      small: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  },

  colorful: {
    name: 'colorful',
    displayName: 'Rainbow Fun',
    colors: {
      primary: '#EC4899', // Pink
      secondary: '#8B5CF6', // Violet
      accent: '#F97316', // Orange
      background: '#FEF7FF',
      surface: '#FEFBFF',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        accent: '#EC4899',
      },
      success: '#22C55E',
      warning: '#FACC15',
      error: '#F87171',
      info: '#60A5FA',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%)',
      secondary: 'linear-gradient(135deg, #F97316 0%, #FACC15 100%)',
      hero: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      card: 'linear-gradient(145deg, #ffffff 0%, #fdf4ff 100%)',
    },
    shadows: {
      small: '0 1px 3px 0 rgba(236, 72, 153, 0.1)',
      medium: '0 4px 6px -1px rgba(236, 72, 153, 0.1)',
      large: '0 10px 15px -3px rgba(236, 72, 153, 0.1)',
    },
  },

  dark: {
    name: 'dark',
    displayName: 'Night Mode',
    colors: {
      primary: '#6366F1', // Indigo
      secondary: '#14B8A6', // Teal
      accent: '#FBBF24', // Amber
      background: '#111827',
      surface: '#1F2937',
      text: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
        accent: '#6366F1',
      },
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      secondary: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
      hero: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)',
      card: 'linear-gradient(145deg, #1F2937 0%, #111827 100%)',
    },
    shadows: {
      small: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      large: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    },
  },

  ocean: {
    name: 'ocean',
    displayName: 'Ocean Adventure',
    colors: {
      primary: '#0EA5E9', // Sky Blue
      secondary: '#06B6D4', // Cyan
      accent: '#F59E0B', // Amber
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: {
        primary: '#0C4A6E',
        secondary: '#075985',
        accent: '#0EA5E9',
      },
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0284C7',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
      secondary: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
      hero: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
      card: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
    },
    shadows: {
      small: '0 1px 3px 0 rgba(14, 165, 233, 0.1)',
      medium: '0 4px 6px -1px rgba(14, 165, 233, 0.1)',
      large: '0 10px 15px -3px rgba(14, 165, 233, 0.1)',
    },
  },

  forest: {
    name: 'forest',
    displayName: 'Forest Explorer',
    colors: {
      primary: '#059669', // Emerald
      secondary: '#84CC16', // Lime
      accent: '#F59E0B', // Amber
      background: '#F0FDF4',
      surface: '#DCFCE7',
      text: {
        primary: '#14532D',
        secondary: '#166534',
        accent: '#059669',
      },
      success: '#22C55E',
      warning: '#EAB308',
      error: '#DC2626',
      info: '#0284C7',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #84CC16 100%)',
      secondary: 'linear-gradient(135deg, #16A34A 0%, #65A30D 100%)',
      hero: 'linear-gradient(135deg, #059669 0%, #16a34a 50%, #22c55e 100%)',
      card: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
    },
    shadows: {
      small: '0 1px 3px 0 rgba(5, 150, 105, 0.1)',
      medium: '0 4px 6px -1px rgba(5, 150, 105, 0.1)',
      large: '0 10px 15px -3px rgba(5, 150, 105, 0.1)',
    },
  },

  sunset: {
    name: 'sunset',
    displayName: 'Sunset Dreams',
    colors: {
      primary: '#F97316', // Orange
      secondary: '#EC4899', // Pink
      accent: '#FACC15', // Yellow
      background: '#FFF7ED',
      surface: '#FFEDD5',
      text: {
        primary: '#9A3412',
        secondary: '#C2410C',
        accent: '#F97316',
      },
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
      secondary: 'linear-gradient(135deg, #FACC15 0%, #F59E0B 100%)',
      hero: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
      card: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)',
    },
    shadows: {
      small: '0 1px 3px 0 rgba(249, 115, 22, 0.1)',
      medium: '0 4px 6px -1px rgba(249, 115, 22, 0.1)',
      large: '0 10px 15px -3px rgba(249, 115, 22, 0.1)',
    },
  },
};

export const defaultTheme = themes.light;

/**
 * Get theme by name
 */
export const getTheme = (themeName: string): Theme => {
  return themes[themeName] || defaultTheme;
};

/**
 * Get all available theme names
 */
export const getThemeNames = (): string[] => {
  return Object.keys(themes);
};

/**
 * Apply theme to CSS custom properties
 */
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-text-primary', theme.colors.text.primary);
  root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
  root.style.setProperty('--color-text-accent', theme.colors.text.accent);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-error', theme.colors.error);
  root.style.setProperty('--color-info', theme.colors.info);
  
  // Apply gradients
  root.style.setProperty('--gradient-primary', theme.gradients.primary);
  root.style.setProperty('--gradient-secondary', theme.gradients.secondary);
  root.style.setProperty('--gradient-hero', theme.gradients.hero);
  root.style.setProperty('--gradient-card', theme.gradients.card);
  
  // Apply shadows
  root.style.setProperty('--shadow-small', theme.shadows.small);
  root.style.setProperty('--shadow-medium', theme.shadows.medium);
  root.style.setProperty('--shadow-large', theme.shadows.large);
};

/**
 * Age-appropriate theme recommendations
 */
export const getRecommendedThemes = (ageGroup: FrontendAgeGroup): string[] => {
  switch (ageGroup) {
    case '4-6':
      return ['colorful', 'forest', 'ocean'];
    case '7-10':
      return ['light', 'colorful', 'sunset', 'forest'];
    case '11-15':
      return ['light', 'dark', 'ocean', 'sunset'];
    default:
      return ['light', 'colorful'];
  }
};
