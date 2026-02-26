// ==========================================
// MODEL EXPORTS
// ==========================================

// Core Models
export * from './User';
export * from './Game';
export * from './Badge';
export * from './Challenge';
export * from './Module';
export * from './Project';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

// Re-export interfaces for convenience
export type { IUser } from './User';
export type { IGame } from './Game';
export type { IBadge } from './Badge';
export type { IChallenge } from './Challenge';
export type { IModule } from './Module';
export type { IProject } from './Project';

// ==========================================
// MODEL COLLECTIONS
// ==========================================

// Import all models for centralized access
import { User } from './User';
import { Game } from './Game';
import { Badge } from './Badge';
import { Challenge } from './Challenge';
import { Module } from './Module';
import { Project } from './Project';

// Export models collection for easy access
export const Models = {
    User,
    Game,
    Badge,
    Challenge,
    Module,
    Project
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get all model names
 */
export const getModelNames = (): string[] => {
    return Object.keys(Models);
};

/**
 * Get model by name
 */
export const getModel = (name: string) => {
    return Models[name as keyof typeof Models];
};

/**
 * Check if a model exists
 */
export const hasModel = (name: string): boolean => {
    return name in Models;
};

// ==========================================
// DATABASE UTILITIES
// ==========================================

/**
 * Initialize all models (useful for testing and seeding)
 */
export const initializeModels = async () => {
    try {
        // This ensures all models are registered with Mongoose
        await Promise.all([
            User.init(),
            Game.init(),
            Badge.init(),
            Challenge.init(),
            Module.init(),
            Project.init()
        ]);
        
        console.log('All models initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing models:', error);
        return false;
    }
};

/**
 * Get collection statistics for all models
 */
export const getCollectionStats = async () => {
    try {
        const stats = await Promise.all([
            User.countDocuments(),
            Game.countDocuments(),
            Badge.countDocuments(),
            Challenge.countDocuments(),
            Module.countDocuments(),
            Project.countDocuments()
        ]);

        return {
            users: stats[0],
            games: stats[1],
            badges: stats[2],
            challenges: stats[3],
            modules: stats[4],
            projects: stats[5],
            total: stats.reduce((sum, count) => sum + count, 0)
        };
    } catch (error) {
        console.error('Error getting collection stats:', error);
        return null;
    }
};

// ==========================================
// VALIDATION UTILITIES
// ==========================================

/**
 * Common age group validation
 */
export const AgeGroups = {
    YOUNG_LEARNERS: 'young_learners',    // ages 4-6
    ELEMENTARY: 'elementary',            // ages 7-10 
    ADVANCED: 'advanced'                 // ages 11-15
} as const;

export type AgeGroup = typeof AgeGroups[keyof typeof AgeGroups];

/**
 * Common difficulty levels
 */
export const DifficultyLevels = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert'
} as const;

export type DifficultyLevel = typeof DifficultyLevels[keyof typeof DifficultyLevels];

/**
 * Common status types
 */
export const StatusTypes = {
    DRAFT: 'draft',
    REVIEW: 'review',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
} as const;

export type StatusType = typeof StatusTypes[keyof typeof StatusTypes];

/**
 * Validate age group
 */
export const isValidAgeGroup = (ageGroup: string): ageGroup is AgeGroup => {
    return Object.values(AgeGroups).includes(ageGroup as AgeGroup);
};

/**
 * Validate difficulty level
 */
export const isValidDifficulty = (difficulty: string): difficulty is DifficultyLevel => {
    return Object.values(DifficultyLevels).includes(difficulty as DifficultyLevel);
};

/**
 * Validate status type
 */
export const isValidStatus = (status: string): status is StatusType => {
    return Object.values(StatusTypes).includes(status as StatusType);
};

// ==========================================
// SEARCH AND FILTER UTILITIES
// ==========================================

/**
 * Common filter interface for educational content
 */
export interface EducationalContentFilter {
    ageGroup?: AgeGroup;
    difficulty?: DifficultyLevel;
    skills?: string[];
    category?: string;
    status?: StatusType;
    isActive?: boolean;
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Build MongoDB query from educational content filter
 */
export const buildEducationalContentQuery = (filter: EducationalContentFilter) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    if (filter.ageGroup) {
        query.ageGroups = filter.ageGroup;
    }
    
    if (filter.difficulty) {
        query.difficulty = filter.difficulty;
    }
    
    if (filter.skills && filter.skills.length > 0) {
        query.skills = { $in: filter.skills };
    }
    
    if (filter.category) {
        query.category = filter.category;
    }
    
    if (filter.status) {
        query.status = filter.status;
    }
    
    if (filter.isActive !== undefined) {
        query.isActive = filter.isActive;
    }
    
    return query;
};

/**
 * Build sort options from filter
 */
export const buildSortOptions = (filter: EducationalContentFilter) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = {};
    
    if (filter.sortBy) {
        sort[filter.sortBy] = filter.sortOrder === 'desc' ? -1 : 1;
    } else {
        // Default sort
        sort.createdAt = -1;
    }
    
    return sort;
};

// ==========================================
// AGGREGATION PIPELINES
// ==========================================

/**
 * Common aggregation pipeline for user progress
 */
export const getUserProgressPipeline = (userId: string) => [
    { $match: { _id: userId } },
    {
        $lookup: {
            from: 'badges',
            localField: 'progress.badges',
            foreignField: '_id',
            as: 'badgeDetails'
        }
    },
    {
        $lookup: {
            from: 'modules',
            localField: 'progress.completedModules',
            foreignField: '_id',
            as: 'moduleDetails'
        }
    },
    {
        $lookup: {
            from: 'challenges',
            localField: 'progress.completedChallenges',
            foreignField: '_id',
            as: 'challengeDetails'
        }
    },
    {
        $lookup: {
            from: 'projects',
            localField: 'progress.completedProjects',
            foreignField: '_id',
            as: 'projectDetails'
        }
    }
];

/**
 * Common aggregation pipeline for leaderboard
 */
export const getLeaderboardPipeline = (ageGroup?: string, limit = 50) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
        { $match: { isActive: true } }
    ];
    
    if (ageGroup) {
        pipeline[0].$match.ageGroup = ageGroup;
    }
    
    pipeline.push(
        {
            $project: {
                username: 1,
                displayName: 1,
                ageGroup: 1,
                'progress.totalXP': 1,
                'progress.currentLevel': 1,
                'progress.badges': 1,
                avatar: 1
            }
        },
        { $sort: { 'progress.totalXP': -1 } },
        { $limit: limit }
    );
    
    return pipeline;
};

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Common database error types
 */
export const DatabaseErrors = {
    VALIDATION_ERROR: 'ValidationError',
    DUPLICATE_KEY_ERROR: 'DuplicateKeyError',
    CAST_ERROR: 'CastError',
    CONNECTION_ERROR: 'ConnectionError'
} as const;

/**
 * Handle common database errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleDatabaseError = (error: any) => {
    if (error.name === 'ValidationError') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messages = Object.values(error.errors).map((err: any) => err.message);
        return {
            type: DatabaseErrors.VALIDATION_ERROR,
            message: 'Validation failed',
            details: messages
        };
    }
    
    if (error.code === 11000) {
        return {
            type: DatabaseErrors.DUPLICATE_KEY_ERROR,
            message: 'Duplicate entry found',
            details: Object.keys(error.keyPattern || {})
        };
    }
    
    if (error.name === 'CastError') {
        return {
            type: DatabaseErrors.CAST_ERROR,
            message: 'Invalid data type',
            details: [error.message]
        };
    }
    
    return {
        type: 'UnknownError',
        message: error.message || 'An unknown database error occurred',
        details: []
    };
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default Models;
