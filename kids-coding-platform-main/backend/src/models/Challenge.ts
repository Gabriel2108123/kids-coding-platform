import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// CHALLENGE INTERFACES
// ==========================================

export interface IChallenge extends Document {
    title: string;
    description: string;
    shortDescription: string;
    instructions: string[];
    category: 'logic' | 'loops' | 'conditionals' | 'functions' | 'variables' | 'arrays' | 'objects' | 'algorithms' | 'debugging' | 'creative' | 'math' | 'games';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    ageGroups: string[];
    targetAgeGroup: string; // Legacy compatibility
    estimatedTime: number; // in minutes
    timeLimit?: number; // Legacy compatibility
    maxAttempts?: number; // Legacy compatibility
    xpReward?: number; // Legacy compatibility
    slug?: string; // Legacy compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdBy?: any; // Legacy compatibility
    deletedAt?: Date; // Legacy compatibility
    
    // Learning objectives
    learningObjectives: string[];
    skills: string[];
    prerequisites: string[];
    
    // Challenge content
    starterCode: {
        blockly?: string; // Blockly XML
        javascript?: string;
        python?: string;
        scratch?: string;
    };
    startingCode?: string; // Legacy compatibility
    
    // Legacy tracking arrays for controller compatibility
    attempts?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: any;
        startedAt: Date;
        submittedAt?: Date;
        code: string;
        status: string;
        score?: number;
        timeSpent?: number;
        hints_used: number[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        testResults?: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _id?: any;
    }[];
    
    completions?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: any;
        completedAt: Date;
        timeSpent: number;
        hintsUsed: number;
    }[];
    
    leaderboard?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: any;
        score: number;
        timeSpent: number;
        completedAt: Date;
    }[];
    
    solution: {
        blockly?: string;
        javascript?: string;
        python?: string;
        description: string;
        explanation: string[];
    };
    
    // Test cases and validation
    testCases: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectedOutput: any;
        description: string;
        isHidden: boolean; // Hidden test cases for validation
        weight: number; // Scoring weight
    }[];
    
    hints: {
        text: string;
        unlockAfterAttempts: number;
        penaltyXP: number;
        difficulty: 'easy' | 'medium' | 'hard';
    }[];
    
    // Scoring and rewards
    scoring: {
        baseXP: number;
        bonusXP: {
            perfectSolution: number;
            noHints: number;
            fastCompletion: number; // bonus for completing under estimated time
            firstTry: number;
        };
        penalties: {
            hintsUsed: number;
            attemptsOver: number; // penalty after X attempts
            timeOverEstimate: number;
        };
    };
    
    // Media and assets
    assets: {
        images: string[];
        videos: string[];
        animations: string[];
        sounds: string[];
        examples: {
            title: string;
            url: string;
            type: 'video' | 'image' | 'interactive';
        }[];
    };
    
    // Accessibility
    accessibility: {
        audioDescription: string;
        screenReaderText: string;
        keyboardShortcuts: {
            action: string;
            shortcut: string;
        }[];
        colorBlindFriendly: boolean;
        highContrastVersion: boolean;
    };
    
    // Social and sharing
    social: {
        allowSharing: boolean;
        allowRemixing: boolean;
        shareableAchievements: string[];
        leaderboardEligible: boolean;
    };
    
    // Statistics
    statistics: {
        totalAttempts: number;
        totalCompletions: number;
        averageAttempts: number;
        averageTime: number;
        successRate: number;
        popularityScore: number;
        difficultyRating: number; // user-rated difficulty
        funRating: number; // user-rated fun factor
    };
    
    // Versioning and metadata
    metadata: {
        version: number;
        createdBy: string;
        lastUpdatedBy: string;
        tags: string[];
        isOfficial: boolean;
        isFeatured: boolean;
        seasonalEvent?: string;
        relatedChallenges: string[]; // ObjectIds of related challenges
    };
    
    // Localization
    localization: {
        [languageCode: string]: {
            title: string;
            description: string;
            shortDescription: string;
            instructions: string[];
            learningObjectives: string[];
            hints: {
                text: string;
            }[];
        };
    };
    
    // Status and availability
    status: 'draft' | 'review' | 'published' | 'archived';
    isActive: boolean;
    publishedAt?: Date;
    archivedAt?: Date;
    
    // Progression and sequencing
    progression: {
        isSequential: boolean;
        order: number;
        moduleId?: string;
        nextChallengeId?: string;
        previousChallengeId?: string;
        unlockRequirements: {
            type: 'challenge' | 'module' | 'xp' | 'badge';
            value: string | number;
        }[];
    };
    
    createdAt: Date;
    updatedAt: Date;
}

// ==========================================
// CHALLENGE SCHEMA
// ==========================================

const challengeSchema = new Schema<IChallenge>({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    instructions: [{
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }],
    category: {
        type: String,
        required: true,
        enum: ['logic', 'loops', 'conditionals', 'functions', 'variables', 'arrays', 'objects', 'algorithms', 'debugging', 'creative', 'math', 'games'],
        index: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        index: true
    },
    ageGroups: [{
        type: String,
        required: true,
        enum: ['young_learners', 'elementary', 'advanced']
    }],
    estimatedTime: {
        type: Number,
        required: true,
        min: 1,
        max: 120 // max 2 hours
    },
    
    // Learning content
    learningObjectives: [{
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    }],
    skills: [{
        type: String,
        required: true,
        trim: true,
        index: true
    }],
    prerequisites: [{
        type: String,
        trim: true
    }],
    
    // Code content
    starterCode: {
        blockly: { type: String, trim: true },
        javascript: { type: String, trim: true },
        python: { type: String, trim: true },
        scratch: { type: String, trim: true }
    },
    
    // Legacy compatibility fields
    targetAgeGroup: { type: String },
    timeLimit: { type: Number },
    maxAttempts: { type: Number, default: 10 },
    xpReward: { type: Number, default: 20 },
    slug: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
    startingCode: { type: String },
    
    attempts: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        startedAt: { type: Date, default: Date.now },
        submittedAt: { type: Date },
        code: { type: String, default: '' },
        status: { type: String, default: 'in_progress' },
        score: { type: Number },
        timeSpent: { type: Number, default: 0 },
        hints_used: [{ type: Number }],
        testResults: { type: Schema.Types.Mixed }
    }],
    
    completions: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        completedAt: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 },
        hintsUsed: { type: Number, default: 0 }
    }],
    
    leaderboard: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        completedAt: { type: Date, default: Date.now }
    }],
    
    solution: {
        blockly: { type: String, trim: true },
        javascript: { type: String, trim: true },
        python: { type: String, trim: true },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        explanation: [{
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        }]
    },
    
    // Testing and validation
    testCases: [{
        input: {
            type: Schema.Types.Mixed,
            required: true
        },
        expectedOutput: {
            type: Schema.Types.Mixed,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        isHidden: {
            type: Boolean,
            default: false
        },
        weight: {
            type: Number,
            default: 1,
            min: 0.1,
            max: 10
        }
    }],
    
    hints: [{
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        unlockAfterAttempts: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        penaltyXP: {
            type: Number,
            default: 0,
            min: 0
        },
        difficulty: {
            type: String,
            required: true,
            enum: ['easy', 'medium', 'hard']
        }
    }],
    
    // Scoring system
    scoring: {
        baseXP: {
            type: Number,
            required: true,
            min: 10,
            max: 1000
        },
        bonusXP: {
            perfectSolution: { type: Number, default: 0, min: 0 },
            noHints: { type: Number, default: 0, min: 0 },
            fastCompletion: { type: Number, default: 0, min: 0 },
            firstTry: { type: Number, default: 0, min: 0 }
        },
        penalties: {
            hintsUsed: { type: Number, default: 0, min: 0 },
            attemptsOver: { type: Number, default: 0, min: 0 },
            timeOverEstimate: { type: Number, default: 0, min: 0 }
        }
    },
    
    // Media assets
    assets: {
        images: [String],
        videos: [String],
        animations: [String],
        sounds: [String],
        examples: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String,
                required: true,
                enum: ['video', 'image', 'interactive']
            }
        }]
    },
    
    // Accessibility features
    accessibility: {
        audioDescription: {
            type: String,
            trim: true
        },
        screenReaderText: {
            type: String,
            trim: true
        },
        keyboardShortcuts: [{
            action: {
                type: String,
                required: true,
                trim: true
            },
            shortcut: {
                type: String,
                required: true,
                trim: true
            }
        }],
        colorBlindFriendly: {
            type: Boolean,
            default: true
        },
        highContrastVersion: {
            type: Boolean,
            default: false
        }
    },
    
    // Social features
    social: {
        allowSharing: {
            type: Boolean,
            default: true
        },
        allowRemixing: {
            type: Boolean,
            default: true
        },
        shareableAchievements: [String],
        leaderboardEligible: {
            type: Boolean,
            default: true
        }
    },
    
    // Analytics
    statistics: {
        totalAttempts: { type: Number, default: 0, min: 0 },
        totalCompletions: { type: Number, default: 0, min: 0 },
        averageAttempts: { type: Number, default: 0, min: 0 },
        averageTime: { type: Number, default: 0, min: 0 },
        successRate: { type: Number, default: 0, min: 0, max: 100 },
        popularityScore: { type: Number, default: 0, min: 0 },
        difficultyRating: { type: Number, default: 0, min: 1, max: 5 },
        funRating: { type: Number, default: 0, min: 1, max: 5 }
    },
    
    // Metadata
    metadata: {
        version: {
            type: Number,
            default: 1,
            min: 1
        },
        createdBy: {
            type: String,
            required: true,
            trim: true
        },
        lastUpdatedBy: {
            type: String,
            trim: true
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        isOfficial: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true
        },
        seasonalEvent: {
            type: String,
            trim: true
        },
        relatedChallenges: [{
            type: Schema.Types.ObjectId,
            ref: 'Challenge'
        }]
    },
    
    // Localization
    localization: {
        type: Map,
        of: {
            title: String,
            description: String,
            shortDescription: String,
            instructions: [String],
            learningObjectives: [String],
            hints: [{
                text: String
            }]
        }
    },
    
    // Status
    status: {
        type: String,
        required: true,
        enum: ['draft', 'review', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    publishedAt: Date,
    archivedAt: Date,
    
    // Progression
    progression: {
        isSequential: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0,
            index: true
        },
        moduleId: {
            type: Schema.Types.ObjectId,
            ref: 'Module'
        },
        nextChallengeId: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge'
        },
        previousChallengeId: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge'
        },
        unlockRequirements: [{
            type: {
                type: String,
                required: true,
                enum: ['challenge', 'module', 'xp', 'badge']
            },
            value: {
                type: Schema.Types.Mixed,
                required: true
            }
        }]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

challengeSchema.index({ category: 1, difficulty: 1, ageGroups: 1 });
challengeSchema.index({ status: 1, isActive: 1 });
challengeSchema.index({ 'metadata.isFeatured': 1, publishedAt: -1 });
challengeSchema.index({ 'statistics.popularityScore': -1 });
challengeSchema.index({ 'progression.moduleId': 1, 'progression.order': 1 });
challengeSchema.index({ skills: 1 });
challengeSchema.index({ 'metadata.tags': 1 });
challengeSchema.index({ estimatedTime: 1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

challengeSchema.virtual('isPublished').get(function() {
    return this.status === 'published' && this.isActive;
});

challengeSchema.virtual('completionRate').get(function() {
    if (this.statistics.totalAttempts === 0) return 0;
    return (this.statistics.totalCompletions / this.statistics.totalAttempts) * 100;
});

challengeSchema.virtual('averageRating').get(function() {
    return (this.statistics.difficultyRating + this.statistics.funRating) / 2;
});

challengeSchema.virtual('estimatedXP').get(function() {
    let totalXP = this.scoring.baseXP;
    totalXP += this.scoring.bonusXP.perfectSolution;
    totalXP += this.scoring.bonusXP.noHints;
    totalXP += this.scoring.bonusXP.fastCompletion;
    totalXP += this.scoring.bonusXP.firstTry;
    return totalXP;
});

// ==========================================
// STATIC METHODS
// ==========================================

challengeSchema.statics.findForUser = function(ageGroup: string, difficulty?: string, category?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
        ageGroups: ageGroup,
        status: 'published',
        isActive: true
    };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    
    return this.find(query).sort({ 'progression.order': 1, 'metadata.isFeatured': -1, 'statistics.popularityScore': -1 });
};

challengeSchema.statics.findFeatured = function(limit = 10) {
    return this.find({
        'metadata.isFeatured': true,
        status: 'published',
        isActive: true
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

challengeSchema.statics.findByDifficulty = function(difficulty: string, ageGroup?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
        difficulty,
        status: 'published',
        isActive: true
    };
    
    if (ageGroup) query.ageGroups = ageGroup;
    
    return this.find(query).sort({ 'statistics.popularityScore': -1 });
};

challengeSchema.statics.findByCategory = function(category: string, ageGroup?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
        category,
        status: 'published',
        isActive: true
    };
    
    if (ageGroup) query.ageGroups = ageGroup;
    
    return this.find(query).sort({ difficulty: 1, 'progression.order': 1 });
};

challengeSchema.statics.findBySkill = function(skill: string, ageGroup?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
        skills: skill,
        status: 'published',
        isActive: true
    };
    
    if (ageGroup) query.ageGroups = ageGroup;
    
    return this.find(query).sort({ difficulty: 1 });
};

challengeSchema.statics.getPopular = function(limit = 20) {
    return this.find({
        status: 'published',
        isActive: true
    })
    .sort({ 'statistics.popularityScore': -1, 'statistics.totalCompletions': -1 })
    .limit(limit);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
challengeSchema.statics.searchChallenges = function(searchTerm: string, filters: any = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
        status: 'published',
        isActive: true,
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { skills: { $regex: searchTerm, $options: 'i' } },
            { 'metadata.tags': { $regex: searchTerm, $options: 'i' } }
        ]
    };
    
    // Apply additional filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            query[key] = filters[key];
        }
    });
    
    return this.find(query).sort({ 'statistics.popularityScore': -1 });
};

// ==========================================
// INSTANCE METHODS
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
challengeSchema.methods.checkUnlockRequirements = function(userProgress: any) {
    if (!this.progression.unlockRequirements || this.progression.unlockRequirements.length === 0) {
        return { unlocked: true };
    }
    
    for (const requirement of this.progression.unlockRequirements) {
        switch (requirement.type) {
            case 'challenge':
                if (!userProgress.completedChallenges?.includes(requirement.value)) {
                    return { 
                        unlocked: false, 
                        reason: `Complete challenge: ${requirement.value}`,
                        type: 'challenge'
                    };
                }
                break;
            case 'module':
                if (!userProgress.completedModules?.includes(requirement.value)) {
                    return { 
                        unlocked: false, 
                        reason: `Complete module: ${requirement.value}`,
                        type: 'module'
                    };
                }
                break;
            case 'xp':
                if ((userProgress.totalXP || 0) < requirement.value) {
                    return { 
                        unlocked: false, 
                        reason: `Reach ${requirement.value} XP`,
                        type: 'xp',
                        current: userProgress.totalXP || 0,
                        required: requirement.value
                    };
                }
                break;
            case 'badge':
                if (!userProgress.badges?.includes(requirement.value)) {
                    return { 
                        unlocked: false, 
                        reason: `Earn badge: ${requirement.value}`,
                        type: 'badge'
                    };
                }
                break;
        }
    }
    
    return { unlocked: true };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
challengeSchema.methods.calculateScore = function(submission: any) {
    let score = this.scoring.baseXP;
    
    // Apply bonuses
    if (submission.isPerfectSolution) {
        score += this.scoring.bonusXP.perfectSolution;
    }
    
    if (submission.hintsUsed === 0) {
        score += this.scoring.bonusXP.noHints;
    }
    
    if (submission.attempts === 1) {
        score += this.scoring.bonusXP.firstTry;
    }
    
    if (submission.timeSpent < this.estimatedTime * 60 * 1000) {
        score += this.scoring.bonusXP.fastCompletion;
    }
    
    // Apply penalties
    score -= (submission.hintsUsed || 0) * this.scoring.penalties.hintsUsed;
    
    if (submission.attempts > 3) {
        score -= (submission.attempts - 3) * this.scoring.penalties.attemptsOver;
    }
    
    if (submission.timeSpent > this.estimatedTime * 60 * 1000 * 2) {
        score -= this.scoring.penalties.timeOverEstimate;
    }
    
    return Math.max(0, Math.floor(score));
};

challengeSchema.methods.getLocalizedContent = function(language = 'en') {
    const localized = this.localization?.get(language);
    return {
        title: localized?.title || this.title,
        description: localized?.description || this.description,
        shortDescription: localized?.shortDescription || this.shortDescription,
        instructions: localized?.instructions || this.instructions,
        learningObjectives: localized?.learningObjectives || this.learningObjectives,
        hints: localized?.hints || this.hints
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
challengeSchema.methods.updateStatistics = function(submission: any) {
    this.statistics.totalAttempts += 1;
    
    if (submission.isCompleted) {
        this.statistics.totalCompletions += 1;
    }
    
    // Update averages
    if (this.statistics.totalCompletions > 0) {
        this.statistics.averageAttempts = this.statistics.totalAttempts / this.statistics.totalCompletions;
        this.statistics.successRate = (this.statistics.totalCompletions / this.statistics.totalAttempts) * 100;
    }
    
    // Update popularity score based on recent activity
    this.statistics.popularityScore = Math.min(100, 
        (this.statistics.totalCompletions * 0.7) + 
        (this.statistics.successRate * 0.2) + 
        (this.statistics.funRating * 5 * 0.1)
    );
    
    return this.save();
};

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

challengeSchema.pre('save', function(next) {
    // Ensure at least one age group
    if (!this.ageGroups || this.ageGroups.length === 0) {
        this.ageGroups = ['late_elementary', 'middle_school'];
    }
    
    // Ensure at least one test case
    if (!this.testCases || this.testCases.length === 0) {
        return next(new Error('At least one test case is required'));
    }
    
    // Set published date when status changes to published
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Set archived date when status changes to archived
    if (this.status === 'archived' && !this.archivedAt) {
        this.archivedAt = new Date();
    }
    
    // Update version when content changes
    if (this.isModified() && !this.isNew) {
        this.metadata.version += 1;
    }
    
    next();
});

// ==========================================
// EXPORT MODEL
// ==========================================

export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);
export default Challenge;