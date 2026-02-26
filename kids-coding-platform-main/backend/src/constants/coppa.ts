/**
 * COPPA (Children's Online Privacy Protection Act) Compliance Constants
 * 
 * This file contains all constants and configurations related to COPPA compliance
 * for the Kids Coding Platform, ensuring proper handling of children's data
 * and privacy protection.
 */

// ==========================================
// AGE THRESHOLDS AND COMPLIANCE
// ==========================================

/**
 * COPPA age threshold - users under this age require parental consent
 */
export const COPPA_AGE_THRESHOLD = 13;

/**
 * Minimum age allowed on the platform
 */
export const MINIMUM_AGE = 4;

/**
 * Maximum age for the kids platform
 */
export const MAXIMUM_AGE = 15;

/**
 * Age groups for educational content categorization
 */
export const AGE_GROUPS = {
    YOUNG_LEARNERS: {
        key: 'young_learners',
        display: '4-6 years',
        minAge: 4,
        maxAge: 6,
        description: 'Young Learners (Ages 4-6)'
    },
    ELEMENTARY: {
        key: 'elementary',
        display: '7-10 years',
        minAge: 7,
        maxAge: 10,
        description: 'Elementary (Ages 7-10)'
    },
    ADVANCED: {
        key: 'advanced',
        display: '11-15 years',
        minAge: 11,
        maxAge: 15,
        description: 'Advanced (Ages 11-15)'
    }
} as const;

// ==========================================
// PARENTAL CONSENT REQUIREMENTS
// ==========================================

/**
 * Required parental consent methods for COPPA compliance
 */
export const CONSENT_METHODS = {
    EMAIL_PLUS_ADDITIONAL: 'email_plus_additional',
    DIGITAL_SIGNATURE: 'digital_signature',
    CREDIT_CARD: 'credit_card',
    TOLL_FREE_NUMBER: 'toll_free_number',
    VIDEO_CONFERENCE: 'video_conference'
} as const;

/**
 * Consent verification requirements
 */
export const CONSENT_VERIFICATION = {
    EMAIL_CONFIRMATION_REQUIRED: true,
    ADDITIONAL_VERIFICATION_REQUIRED: true,
    CONSENT_DOCUMENT_REQUIRED: true,
    PARENT_ID_VERIFICATION: true,
    CONSENT_EXPIRY_DAYS: 365 // Consent valid for 1 year
} as const;

/**
 * Required information for parental consent
 */
export const REQUIRED_PARENT_INFO = [
    'parentEmail',
    'parentName',
    'parentPhone',
    'parentAddress',
    'relationshipToChild',
    'parentDateOfBirth'
] as const;

// ==========================================
// DATA COLLECTION RESTRICTIONS
// ==========================================

/**
 * Data that can be collected from children under 13 without parental consent
 */
export const PERMITTED_DATA_WITHOUT_CONSENT = [
    'firstName',
    'username',
    'ageGroup', // Instead of exact age
    'learningProgress',
    'basicPreferences'
] as const;

/**
 * Data that requires parental consent for children under 13
 */
export const RESTRICTED_DATA = [
    'email',
    'fullName',
    'exactAge',
    'dateOfBirth',
    'location',
    'profilePicture',
    'socialConnections',
    'publicProfiles',
    'communicationWithOthers'
] as const;

/**
 * Features that require parental consent
 */
export const RESTRICTED_FEATURES = [
    'publicProfiles',
    'socialInteraction',
    'contentSharing',
    'emailNotifications',
    'externalSharing',
    'thirdPartyIntegrations'
] as const;

// ==========================================
// SAFETY AND MODERATION
// ==========================================

/**
 * Content filtering levels for different age groups
 */
export const CONTENT_FILTER_LEVELS = {
    STRICT: {
        level: 'strict',
        description: 'Maximum safety for youngest users',
        ageGroups: ['young_learners'],
        restrictions: [
            'noSocialFeatures',
            'preApprovedContentOnly',
            'noExternalLinks',
            'supervisedMode'
        ]
    },
    MODERATE: {
        level: 'moderate',
        description: 'Balanced safety with more features',
        ageGroups: ['elementary'],
        restrictions: [
            'limitedSocialFeatures',
            'moderatedContent',
            'restrictedSharing'
        ]
    },
    STANDARD: {
        level: 'standard',
        description: 'Standard safety for teens',
        ageGroups: ['advanced'],
        restrictions: [
            'basicModeration',
            'reportingTools'
        ]
    }
} as const;

/**
 * Time limits for different age groups (in minutes per day)
 */
export const DEFAULT_TIME_LIMITS = {
    'young_learners': 30,
    'elementary': 60,
    'advanced': 90
} as const;

/**
 * Features available by age group without parental consent
 */
export const AGE_APPROPRIATE_FEATURES = {
    'young_learners': [
        'basicLearning',
        'guidedTutorials',
        'simpleGames',
        'offlineMode'
    ],
    'elementary': [
        'basicLearning',
        'guidedTutorials',
        'simpleGames',
        'basicCoding',
        'complexGames',
        'advancedCoding',
        'projectCreation',
        'limitedSharing',
        'offlineMode'
    ],
    'advanced': [
        'fullLearning',
        'allTutorials',
        'allGames',
        'fullCoding',
        'projectCreation',
        'socialFeatures',
        'contentSharing'
    ]
} as const;

// ==========================================
// DATA RETENTION AND DELETION
// ==========================================

/**
 * Data retention policies for COPPA compliance
 */
export const DATA_RETENTION = {
    COPPA_USER_DATA_RETENTION_DAYS: 0, // Immediate deletion upon request
    NON_COPPA_USER_RETENTION_DAYS: 365, // 1 year for users 13+
    ANONYMOUS_ANALYTICS_RETENTION_DAYS: 730, // 2 years for anonymized data
    CONSENT_RECORD_RETENTION_DAYS: 1095, // 3 years for consent records
    AUDIT_LOG_RETENTION_DAYS: 2555 // 7 years for audit logs
} as const;

/**
 * Data that must be immediately deleted when COPPA user requests deletion
 */
export const IMMEDIATE_DELETION_DATA = [
    'personalInformation',
    'profileData',
    'userGeneratedContent',
    'socialConnections',
    'communicationRecords',
    'locationData',
    'deviceInformation'
] as const;

/**
 * Data that can be retained in anonymized form for analytics
 */
export const ANONYMIZABLE_DATA = [
    'learningProgress',
    'platformUsage',
    'performanceMetrics',
    'generalPreferences'
] as const;

// ==========================================
// NOTIFICATION AND COMMUNICATION
// ==========================================

/**
 * Required notifications for parents of COPPA users
 */
export const PARENT_NOTIFICATIONS = {
    ACCOUNT_CREATION: 'account_creation',
    DATA_COLLECTION_CHANGES: 'data_collection_changes',
    FEATURE_UPDATES: 'feature_updates',
    SECURITY_INCIDENTS: 'security_incidents',
    POLICY_CHANGES: 'policy_changes',
    DELETION_REQUESTS: 'deletion_requests'
} as const;

/**
 * Communication restrictions for COPPA users
 */
export const COMMUNICATION_RESTRICTIONS = {
    NO_DIRECT_MESSAGING: true,
    NO_EMAIL_COLLECTION: true,
    NO_PHONE_COLLECTION: true,
    NO_SOCIAL_SHARING: true,
    SUPERVISED_COMMUNICATION_ONLY: true,
    PARENT_NOTIFICATION_REQUIRED: true
} as const;

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Helper function to determine if user requires COPPA protection
 */
export const requiresCoppaProtection = (age: number): boolean => {
    return age < COPPA_AGE_THRESHOLD;
};

/**
 * Helper function to get age group from age
 */
export const getAgeGroup = (age: number): string => {
    if (age >= 4 && age <= 6) return AGE_GROUPS.YOUNG_LEARNERS.key;
    if (age >= 7 && age <= 10) return AGE_GROUPS.ELEMENTARY.key;
    if (age >= 11 && age <= 15) return AGE_GROUPS.ADVANCED.key;
    throw new Error(`Age ${age} is outside the supported range (${MINIMUM_AGE}-${MAXIMUM_AGE})`);
};

/**
 * Helper function to get content filter level for age group
 */
export const getContentFilterLevel = (ageGroup: string): string => {
    const youngLearners = AGE_GROUPS.YOUNG_LEARNERS.key;
    const elementary = AGE_GROUPS.ELEMENTARY.key;
    const advanced = AGE_GROUPS.ADVANCED.key;

    if (ageGroup === youngLearners) return CONTENT_FILTER_LEVELS.STRICT.level;
    if (ageGroup === elementary) return CONTENT_FILTER_LEVELS.MODERATE.level;
    if (ageGroup === advanced) return CONTENT_FILTER_LEVELS.STANDARD.level;
    
    return CONTENT_FILTER_LEVELS.STRICT.level; // Default to strictest
};

/**
 * Helper function to check if a feature is allowed for an age group
 */
export const isFeatureAllowed = (feature: string, ageGroup: string): boolean => {
    const allowedFeatures = AGE_APPROPRIATE_FEATURES[ageGroup as keyof typeof AGE_APPROPRIATE_FEATURES];
    return allowedFeatures ? (allowedFeatures as readonly string[]).includes(feature) : false;
};