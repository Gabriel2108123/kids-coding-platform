import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// BADGE INTERFACES
// ==========================================

interface UserProgress {
    totalXP?: number;
    completedChallenges?: unknown[];
    completedModules?: unknown[];
    completedProjects?: unknown[];
    streakDays?: number;
    timeSpentLearning?: number;
    skillsProgress?: Map<string, number>;
}

export interface IBadge extends Document {
    name: string;
    description: string;
    iconUrl: string;
    category: 'learning' | 'achievement' | 'social' | 'creative' | 'challenge' | 'streak' | 'milestone' | 'special';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    requirements: {
        type: 'xp' | 'challenges_completed' | 'modules_completed' | 'projects_created' | 'streak_days' | 'skill_mastery' | 'social_interaction' | 'time_spent' | 'custom';
        value: number;
        additionalCriteria?: {
            ageGroup?: string[];
            skillType?: string;
            difficulty?: string;
            timeframe?: number; // days
            specificItems?: string[]; // specific module/challenge IDs
        };
    };
    rewards: {
        xpBonus: number;
        title?: string;
        unlockFeatures?: string[];
        cosmetics?: {
            avatarItems?: string[];
            themes?: string[];
            effects?: string[];
        };
    };
    ageGroups: string[]; // Which age groups can earn this badge
    isActive: boolean;
    isVisible: boolean;
    sortOrder: number;
    seasonalInfo?: {
        isSeasonalBadge: boolean;
        availableFrom?: Date;
        availableUntil?: Date;
        season?: string;
    };
    statistics: {
        totalAwarded: number;
        awardedThisWeek: number;
        awardedThisMonth: number;
        averageTimeToEarn?: number; // in days
        rarityScore: number; // calculated based on how many users have it
    };
    metadata: {
        createdBy: string;
        version: number;
        tags: string[];
        difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        estimatedTimeToEarn: string; // "1 day", "1 week", etc.
    };
    localization: Map<string, {
        name: string;
        description: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

// ==========================================
// BADGE SCHEMA
// ==========================================

const badgeSchema = new Schema<IBadge>({
    name: {
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
        maxlength: 500
    },
    iconUrl: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i.test(v);
            },
            message: 'Icon URL must be a valid image URL'
        }
    },
    category: {
        type: String,
        required: true,
        enum: ['learning', 'achievement', 'social', 'creative', 'challenge', 'streak', 'milestone', 'special'],
        index: true
    },
    rarity: {
        type: String,
        required: true,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        index: true
    },
    requirements: {
        type: {
            type: String,
            required: true,
            enum: ['xp', 'challenges_completed', 'modules_completed', 'projects_created', 'streak_days', 'skill_mastery', 'social_interaction', 'time_spent', 'custom']
        },
        value: {
            type: Number,
            required: true,
            min: 1
        },
        additionalCriteria: {
            ageGroup: [{
                type: String,
                enum: ['young_learners', 'elementary', 'advanced']
            }],
            skillType: {
                type: String,
                trim: true
            },
            difficulty: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced', 'expert']
            },
            timeframe: {
                type: Number,
                min: 1,
                max: 365
            },
            specificItems: [String]
        }
    },
    rewards: {
        xpBonus: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        title: {
            type: String,
            trim: true,
            maxlength: 50
        },
        unlockFeatures: [{
            type: String,
            trim: true
        }],
        cosmetics: {
            avatarItems: [String],
            themes: [String],
            effects: [String]
        }
    },
    ageGroups: [{
        type: String,
        required: true,
        enum: ['young_learners', 'elementary', 'advanced']
    }],
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isVisible: {
        type: Boolean,
        default: true,
        index: true
    },
    sortOrder: {
        type: Number,
        default: 0,
        index: true
    },
    seasonalInfo: {
        isSeasonalBadge: {
            type: Boolean,
            default: false
        },
        availableFrom: Date,
        availableUntil: Date,
        season: {
            type: String,
            enum: ['spring', 'summer', 'fall', 'winter', 'holiday', 'special_event'],
            trim: true
        }
    },
    statistics: {
        totalAwarded: {
            type: Number,
            default: 0,
            min: 0
        },
        awardedThisWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        awardedThisMonth: {
            type: Number,
            default: 0,
            min: 0
        },
        averageTimeToEarn: {
            type: Number,
            min: 0
        },
        rarityScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    metadata: {
        createdBy: {
            type: String,
            required: true,
            trim: true
        },
        version: {
            type: Number,
            default: 1,
            min: 1
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        difficulty: {
            type: String,
            required: true,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            index: true
        },
        estimatedTimeToEarn: {
            type: String,
            required: true,
            trim: true
        }
    },
    localization: {
        type: Map,
        of: {
            name: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                required: true,
                trim: true
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

badgeSchema.index({ category: 1, rarity: 1 });
badgeSchema.index({ ageGroups: 1, isActive: 1, isVisible: 1 });
badgeSchema.index({ 'requirements.type': 1, 'requirements.value': 1 });
badgeSchema.index({ 'seasonalInfo.isSeasonalBadge': 1, 'seasonalInfo.availableFrom': 1, 'seasonalInfo.availableUntil': 1 });
badgeSchema.index({ sortOrder: 1, category: 1 });
badgeSchema.index({ 'metadata.tags': 1 });
badgeSchema.index({ 'statistics.totalAwarded': -1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

badgeSchema.virtual('isCurrentlyAvailable').get(function() {
    if (!this.seasonalInfo?.isSeasonalBadge) {
        return this.isActive && this.isVisible;
    }
    
    const now = new Date();
    const availableFrom = this.seasonalInfo.availableFrom;
    const availableUntil = this.seasonalInfo.availableUntil;
    
    if (availableFrom && now < availableFrom) return false;
    if (availableUntil && now > availableUntil) return false;
    
    return this.isActive && this.isVisible;
});

badgeSchema.virtual('rarityWeight').get(function() {
    const rarityWeights = {
        common: 1,
        uncommon: 2,
        rare: 4,
        epic: 8,
        legendary: 16
    };
    return rarityWeights[this.rarity] || 1;
});

badgeSchema.virtual('displayName').get(function() {
    // Default to English, fallback to base name
    return this.localization?.get('en')?.name || this.name;
});

badgeSchema.virtual('displayDescription').get(function() {
    // Default to English, fallback to base description
    return this.localization?.get('en')?.description || this.description;
});

// ==========================================
// STATIC METHODS
// ==========================================

badgeSchema.statics.findAvailableForUser = function(ageGroup: string, _language = 'en') {
    const now = new Date();
    
    return this.find({
        ageGroups: ageGroup,
        isActive: true,
        isVisible: true,
        $or: [
            { 'seasonalInfo.isSeasonalBadge': false },
            { 'seasonalInfo.isSeasonalBadge': { $exists: false } },
            {
                'seasonalInfo.isSeasonalBadge': true,
                $and: [
                    {
                        $or: [
                            { 'seasonalInfo.availableFrom': { $exists: false } },
                            { 'seasonalInfo.availableFrom': { $lte: now } }
                        ]
                    },
                    {
                        $or: [
                            { 'seasonalInfo.availableUntil': { $exists: false } },
                            { 'seasonalInfo.availableUntil': { $gte: now } }
                        ]
                    }
                ]
            }
        ]
    }).sort({ sortOrder: 1, rarity: 1, name: 1 });
};

badgeSchema.statics.findByCategory = function(category: string, ageGroup?: string) {
    const query: Record<string, unknown> = { 
        category,
        isActive: true,
        isVisible: true 
    };
    
    if (ageGroup) {
        query.ageGroups = ageGroup;
    }
    
    return this.find(query).sort({ rarity: 1, sortOrder: 1 });
};

badgeSchema.statics.findByRarity = function(rarity: string, ageGroup?: string) {
    const query: Record<string, unknown> = { 
        rarity,
        isActive: true,
        isVisible: true 
    };
    
    if (ageGroup) {
        query.ageGroups = ageGroup;
    }
    
    return this.find(query).sort({ sortOrder: 1, name: 1 });
};

badgeSchema.statics.getPopularBadges = function(limit = 10) {
    return this.find({
        isActive: true,
        isVisible: true
    })
    .sort({ 'statistics.totalAwarded': -1 })
    .limit(limit);
};

badgeSchema.statics.getRareBadges = function(limit = 10) {
    return this.find({
        isActive: true,
        isVisible: true,
        'statistics.rarityScore': { $gte: 80 }
    })
    .sort({ 'statistics.rarityScore': -1 })
    .limit(limit);
};

// ==========================================
// INSTANCE METHODS
// ==========================================

badgeSchema.methods.checkEligibility = function(userProgress: UserProgress, userAge: number, userAgeGroup: string) {
    // Check if badge is available for user's age group
    if (!this.ageGroups.includes(userAgeGroup)) {
        return { eligible: false, reason: 'Age group not eligible' };
    }

    // Check if badge is currently available
    if (!this.isCurrentlyAvailable) {
        return { eligible: false, reason: 'Badge not currently available' };
    }

    // Check specific requirements
    const req = this.requirements;
    let eligible = false;
    let progress = 0;
    let target = req.value;

    switch (req.type) {
        case 'xp':
            progress = userProgress.totalXP || 0;
            eligible = progress >= target;
            break;
        case 'challenges_completed':
            progress = userProgress.completedChallenges?.length || 0;
            eligible = progress >= target;
            break;
        case 'modules_completed':
            progress = userProgress.completedModules?.length || 0;
            eligible = progress >= target;
            break;
        case 'projects_created':
            progress = userProgress.completedProjects?.length || 0;
            eligible = progress >= target;
            break;
        case 'streak_days':
            progress = userProgress.streakDays || 0;
            eligible = progress >= target;
            break;
        case 'time_spent':
            progress = userProgress.timeSpentLearning || 0;
            target = target * 60 * 1000; // Convert minutes to milliseconds
            eligible = progress >= target;
            break;
        case 'skill_mastery':
            if (req.additionalCriteria?.skillType) {
                progress = userProgress.skillsProgress?.get(req.additionalCriteria.skillType) || 0;
                eligible = progress >= target;
            }
            break;
        default:
            eligible = false;
    }

    return {
        eligible,
        progress,
        target,
        progressPercentage: Math.min(100, Math.round((progress / target) * 100))
    };
};

badgeSchema.methods.getLocalizedContent = function(language = 'en') {
    const localized = this.localization?.get(language);
    return {
        name: localized?.name || this.name,
        description: localized?.description || this.description
    };
};

badgeSchema.methods.incrementStatistics = function() {
    this.statistics.totalAwarded += 1;
    this.statistics.awardedThisWeek += 1;
    this.statistics.awardedThisMonth += 1;
    
    // Update rarity score based on total awarded
    // More awarded = less rare (inverse relationship)
    const maxUsers = 10000; // Assume max user base for calculation
    this.statistics.rarityScore = Math.max(0, 100 - (this.statistics.totalAwarded / maxUsers * 100));
    
    return this.save();
};

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

badgeSchema.pre('save', function(next) {
    // Ensure at least one age group is specified
    if (!this.ageGroups || this.ageGroups.length === 0) {
        this.ageGroups = ['young_learners', 'elementary', 'advanced'];
    }

    // Set default localization if not provided
    if (!this.localization || this.localization.size === 0) {
        this.localization = new Map([
            ['en', {
                name: this.name,
                description: this.description
            }]
        ]);
    }

    // Validate seasonal badge dates
    if (this.seasonalInfo?.isSeasonalBadge) {
        const from = this.seasonalInfo.availableFrom;
        const until = this.seasonalInfo.availableUntil;
        
        if (from && until && from >= until) {
            return next(new Error('Available from date must be before available until date'));
        }
    }

    next();
});

// ==========================================
// EXPORT MODEL
// ==========================================

export const Badge = mongoose.model<IBadge>('Badge', badgeSchema);
export default Badge;