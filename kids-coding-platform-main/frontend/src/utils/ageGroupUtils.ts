// Age group type definitions and utilities

// Backend age group format (used in database/API) - Updated to 3 categories
export type BackendAgeGroup = 'young_learners' | 'elementary' | 'advanced';

// Frontend age group format (used in UI components) - Updated to match new ranges
export type FrontendAgeGroup = '4-6' | '7-10' | '11-15';

// Combined age group format for components that need both
export type AgeGroup = BackendAgeGroup | FrontendAgeGroup;

// Age group mapping between formats
export const AGE_GROUP_MAPPING = {
  // Backend to Frontend
  'young_learners': '4-6' as FrontendAgeGroup,
  'elementary': '7-10' as FrontendAgeGroup,
  'advanced': '11-15' as FrontendAgeGroup,
  
  // Frontend to Backend
  '4-6': 'young_learners' as BackendAgeGroup,
  '7-10': 'elementary' as BackendAgeGroup,
  '11-15': 'advanced' as BackendAgeGroup,
} as const;

// Utility functions for age group conversion
export const convertAgeGroupToFrontend = (backendAgeGroup: BackendAgeGroup): FrontendAgeGroup => {
  return AGE_GROUP_MAPPING[backendAgeGroup];
};

export const convertAgeGroupToBackend = (frontendAgeGroup: FrontendAgeGroup): BackendAgeGroup => {
  return AGE_GROUP_MAPPING[frontendAgeGroup];
};

// Type guard functions
export const isBackendAgeGroup = (ageGroup: string): ageGroup is BackendAgeGroup => {
  return ['young_learners', 'elementary', 'advanced'].includes(ageGroup);
};

export const isFrontendAgeGroup = (ageGroup: string): ageGroup is FrontendAgeGroup => {
  return ['4-6', '7-10', '11-15'].includes(ageGroup);
};

// Safe conversion function that handles both formats
export const normalizeAgeGroup = (ageGroup: string | undefined): {
  backend: BackendAgeGroup;
  frontend: FrontendAgeGroup;
} => {
  if (!ageGroup) {
    return {
      backend: 'elementary',
      frontend: '7-10'
    };
  }

  if (isBackendAgeGroup(ageGroup)) {
    return {
      backend: ageGroup,
      frontend: convertAgeGroupToFrontend(ageGroup)
    };
  }

  if (isFrontendAgeGroup(ageGroup)) {
    return {
      backend: convertAgeGroupToBackend(ageGroup),
      frontend: ageGroup
    };
  }

  // Fallback for unknown formats
  return {
    backend: 'elementary',
    frontend: '7-10'
  };
};

// Age group display names
export const AGE_GROUP_LABELS = {
  'young_learners': '4-6 years old',
  'elementary': '7-10 years old', 
  'advanced': '11-15 years old',
  '4-6': '4-6 years old',
  '7-10': '7-10 years old',
  '11-15': '11-15 years old',
} as const;

// Get display label for any age group format
export const getAgeGroupLabel = (ageGroup: string | undefined): string => {
  if (!ageGroup) return '7-10 years old';
  
  if (ageGroup in AGE_GROUP_LABELS) {
    return AGE_GROUP_LABELS[ageGroup as keyof typeof AGE_GROUP_LABELS];
  }
  
  return ageGroup;
};

// Get numeric age from age group
export const getAgeFromAgeGroup = (ageGroup: string | undefined): number => {
  const normalized = normalizeAgeGroup(ageGroup);
  
  switch (normalized.frontend) {
    case '4-6': return 5;
    case '7-10': return 8;
    case '11-15': return 13;
    default: return 8;
  }
};
