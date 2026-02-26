import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// GAME INTERFACES
// ==========================================

export interface IGame extends Document {
    title: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    
    // Game content and code
    code: {
        blockly?: string; // Blockly XML
        javascript?: string;
        python?: string;
        scratch?: string;
        html?: string;
        css?: string;
    };
    
    // Game configuration
    gameType: 'puzzle' | 'platformer' | 'arcade' | 'educational' | 'creative' | 'simulation' | 'adventure' | 'quiz' | 'art' | 'music';
    codeType: 'block-based' | 'text-based' | 'hybrid' | 'visual';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    ageGroups: string[];
    estimatedPlayTime: number; // in minutes
    
    // Creator and ownership
    creatorId: Schema.Types.ObjectId;
    creatorName: string; // Cached for performance
    isRemix: boolean;
    originalGameId?: Schema.Types.ObjectId;
    remixChain: Schema.Types.ObjectId[]; // Track remix history
    
    // Educational content
    learningObjectives: string[];
    skills: string[];
    educationalValue: {
        concepts: string[];
        subjects: string[];
        cognitiveSkills: string[];
    };
    
    // Game assets
    assets: {
        images: string[];
        sounds: string[];
        sprites: string[];
        backgrounds: string[];
        music: string[];
        customAssets: {
            name: string;
            url: string;
            type: 'image' | 'sound' | 'sprite' | 'font' | 'data';
            size: number;
        }[];
    };
    
    // Game mechanics and features
    features: {
        hasSound: boolean;
        hasAnimation: boolean;
        isMultiplayer: boolean;
        hasScoring: boolean;
        hasLevels: boolean;
        isInteractive: boolean;
        hasPhysics: boolean;
        hasAI: boolean;
    };
    
    // Controls and input
    controls: {
        keyboard: string[];
        mouse: boolean;
        touch: boolean;
        gamepad: boolean;
        customControls: {
            action: string;
            key: string;
            description: string;
        }[];
    };
    
    // Metrics and engagement
    metrics: {
        plays: number;
        likes: number;
        shares: number;
        remixes: number;
        comments: number;
        averagePlayTime: number;
        completionRate: number;
        ratings: {
            fun: number;
            difficulty: number;
            creativity: number;
            educational: number;
            totalRatings: number;
        };
        weeklyPlays: number;
        monthlyPlays: number;
    };
    
    // Social and community
    social: {
        isPublic: boolean;
        allowComments: boolean;
        allowRemixing: boolean;
        allowSharing: boolean;
        featuredInGallery: boolean;
        communityTags: string[];
        sharedWithClasses: string[]; // Class IDs
    };
    
    // Moderation and safety
    moderation: {
        status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'archived';
        moderatedBy?: string;
        moderatedAt?: Date;
        moderationNotes?: string;
        contentFlags: {
            type: 'inappropriate' | 'violence' | 'language' | 'copyright' | 'spam' | 'other';
            reason: string;
            reportedBy: string;
            reportedAt: Date;
            resolved: boolean;
        }[];
        autoModeration: {
            textAnalysis: {
                inappropriateContent: boolean;
                languageScore: number;
                topics: string[];
            };
            imageAnalysis: {
                inappropriateImages: boolean;
                safetyScore: number;
            };
            codeAnalysis: {
                maliciousCode: boolean;
                performanceIssues: boolean;
                securityIssues: boolean;
            };
        };
    };
    
    // Publication and status
    status: 'draft' | 'private' | 'unlisted' | 'published' | 'archived' | 'deleted';
    visibility: 'private' | 'friends' | 'class' | 'public';
    publishedAt?: Date;
    lastPlayedAt?: Date;
    
    // Technical metadata
    technical: {
        version: number;
        codeSize: number; // in bytes
        assetSize: number; // in bytes
        complexity: number; // calculated complexity score
        performance: {
            averageLoadTime: number;
            averageFPS: number;
            memoryUsage: number;
        };
        compatibility: {
            browsers: string[];
            devices: string[];
            minRequirements: {
                ram: number;
                browser: string;
                javascript: boolean;
            };
        };
    };
    
    // Accessibility
    accessibility: {
        hasAudioDescriptions: boolean;
        hasSubtitles: boolean;
        keyboardAccessible: boolean;
        screenReaderFriendly: boolean;
        colorBlindFriendly: boolean;
        hasHighContrast: boolean;
        textSize: 'small' | 'medium' | 'large';
        reducedMotion: boolean;
    };
    
    // Analytics and insights
    analytics: {
        playerBehavior: {
            averageSessionTime: number;
            bounceRate: number;
            returnPlayerRate: number;
            peakConcurrentPlayers: number;
        };
        engagement: {
            likesToPlaysRatio: number;
            sharesToPlaysRatio: number;
            remixesToPlaysRatio: number;
            commentEngagementRate: number;
        };
        educational: {
            learningGoalsAchieved: number;
            skillsImproved: string[];
            knowledgeRetentionScore: number;
        };
    };
    
    // Localization
    localization: {
        [languageCode: string]: {
            title: string;
            description: string;
            shortDescription: string;
            instructions?: string[];
        };
    };
    
    // Competition and challenges
    competitions: {
        isCompetitionEntry: boolean;
        competitionId?: string;
        competitionRank?: number;
        awards: {
            type: 'winner' | 'runner_up' | 'participant' | 'featured' | 'creative' | 'technical';
            title: string;
            awardedAt: Date;
        }[];
    };
    
    // Version control and backups
    versions: {
        major: number;
        minor: number;
        patch: number;
        backups: {
            version: string;
            code: Record<string, unknown>;
            createdAt: Date;
            description?: string;
        }[];
    };
    
    createdAt: Date;
    updatedAt: Date;
    
    // Virtual properties
    isPublished: boolean;
    averageRating: number;
    popularityScore: number;
    engagementRate: number;
    totalSize: number;
}

// ==========================================
// GAME SCHEMA
// ==========================================

const gameSchema = new Schema<IGame>({
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
        maxlength: 1000
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    thumbnail: {
        type: String,
        validate: {
            validator: function(v: string) {
                return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(v);
            },
            message: 'Thumbnail must be a valid image URL'
        }
    },
    
    // Game content
    code: {
        blockly: { type: String },
        javascript: { type: String },
        python: { type: String },
        scratch: { type: String },
        html: { type: String },
        css: { type: String }
    },
    
    // Game configuration
    gameType: {
        type: String,
        required: true,
        enum: ['puzzle', 'platformer', 'arcade', 'educational', 'creative', 'simulation', 'adventure', 'quiz', 'art', 'music'],
        index: true
    },
    codeType: {
        type: String,
        required: true,
        enum: ['block-based', 'text-based', 'hybrid', 'visual'],
        default: 'block-based',
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
    estimatedPlayTime: {
        type: Number,
        required: true,
        min: 1,
        max: 240 // max 4 hours
    },
    
    // Creator info
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    creatorName: {
        type: String,
        required: true,
        trim: true
    },
    isRemix: {
        type: Boolean,
        default: false,
        index: true
    },
    originalGameId: {
        type: Schema.Types.ObjectId,
        ref: 'Game'
    },
    remixChain: [{
        type: Schema.Types.ObjectId,
        ref: 'Game'
    }],
    
    // Educational content
    learningObjectives: [{
        type: String,
        trim: true,
        maxlength: 200
    }],
    skills: [{
        type: String,
        trim: true,
        index: true
    }],
    educationalValue: {
        concepts: [String],
        subjects: [String],
        cognitiveSkills: [String]
    },
    
    // Assets
    assets: {
        images: [String],
        sounds: [String],
        sprites: [String],
        backgrounds: [String],
        music: [String],
        customAssets: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true,
                enum: ['image', 'sound', 'sprite', 'font', 'data']
            },
            size: {
                type: Number,
                required: true,
                min: 0
            }
        }]
    },
    
    // Features
    features: {
        hasSound: { type: Boolean, default: false },
        hasAnimation: { type: Boolean, default: false },
        isMultiplayer: { type: Boolean, default: false },
        hasScoring: { type: Boolean, default: false },
        hasLevels: { type: Boolean, default: false },
        isInteractive: { type: Boolean, default: true },
        hasPhysics: { type: Boolean, default: false },
        hasAI: { type: Boolean, default: false }
    },
    
    // Controls
    controls: {
        keyboard: [String],
        mouse: { type: Boolean, default: true },
        touch: { type: Boolean, default: true },
        gamepad: { type: Boolean, default: false },
        customControls: [{
            action: String,
            key: String,
            description: String
        }]
    },
    
    // Metrics
    metrics: {
        plays: { type: Number, default: 0, min: 0 },
        likes: { type: Number, default: 0, min: 0 },
        shares: { type: Number, default: 0, min: 0 },
        remixes: { type: Number, default: 0, min: 0 },
        comments: { type: Number, default: 0, min: 0 },
        averagePlayTime: { type: Number, default: 0, min: 0 },
        completionRate: { type: Number, default: 0, min: 0, max: 100 },
        ratings: {
            fun: { type: Number, default: 0, min: 0, max: 5 },
            difficulty: { type: Number, default: 0, min: 0, max: 5 },
            creativity: { type: Number, default: 0, min: 0, max: 5 },
            educational: { type: Number, default: 0, min: 0, max: 5 },
            totalRatings: { type: Number, default: 0, min: 0 }
        },
        weeklyPlays: { type: Number, default: 0, min: 0 },
        monthlyPlays: { type: Number, default: 0, min: 0 }
    },
    
    // Social features
    social: {
        isPublic: { type: Boolean, default: false },
        allowComments: { type: Boolean, default: true },
        allowRemixing: { type: Boolean, default: true },
        allowSharing: { type: Boolean, default: true },
        featuredInGallery: { type: Boolean, default: false, index: true },
        communityTags: [String],
        sharedWithClasses: [String]
    },
    
    // Moderation
    moderation: {
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'rejected', 'flagged', 'archived'],
            default: 'pending',
            index: true
        },
        moderatedBy: String,
        moderatedAt: Date,
        moderationNotes: String,
        contentFlags: [{
            type: {
                type: String,
                required: true,
                enum: ['inappropriate', 'violence', 'language', 'copyright', 'spam', 'other']
            },
            reason: {
                type: String,
                required: true
            },
            reportedBy: {
                type: String,
                required: true
            },
            reportedAt: {
                type: Date,
                required: true,
                default: Date.now
            },
            resolved: {
                type: Boolean,
                default: false
            }
        }],
        autoModeration: {
            textAnalysis: {
                inappropriateContent: { type: Boolean, default: false },
                languageScore: { type: Number, default: 0, min: 0, max: 100 },
                topics: [String]
            },
            imageAnalysis: {
                inappropriateImages: { type: Boolean, default: false },
                safetyScore: { type: Number, default: 100, min: 0, max: 100 }
            },
            codeAnalysis: {
                maliciousCode: { type: Boolean, default: false },
                performanceIssues: { type: Boolean, default: false },
                securityIssues: { type: Boolean, default: false }
            }
        }
    },
    
    // Status and visibility
    status: {
        type: String,
        required: true,
        enum: ['draft', 'private', 'unlisted', 'published', 'archived', 'deleted'],
        default: 'draft',
        index: true
    },
    visibility: {
        type: String,
        required: true,
        enum: ['private', 'friends', 'class', 'public'],
        default: 'private',
        index: true
    },
    publishedAt: Date,
    lastPlayedAt: Date,
    
    // Technical metadata
    technical: {
        version: { type: Number, default: 1, min: 1 },
        codeSize: { type: Number, default: 0, min: 0 },
        assetSize: { type: Number, default: 0, min: 0 },
        complexity: { type: Number, default: 0, min: 0, max: 100 },
        performance: {
            averageLoadTime: { type: Number, default: 0, min: 0 },
            averageFPS: { type: Number, default: 0, min: 0 },
            memoryUsage: { type: Number, default: 0, min: 0 }
        },
        compatibility: {
            browsers: [String],
            devices: [String],
            minRequirements: {
                ram: { type: Number, default: 512 },
                browser: { type: String, default: 'modern' },
                javascript: { type: Boolean, default: true }
            }
        }
    },
    
    // Accessibility
    accessibility: {
        hasAudioDescriptions: { type: Boolean, default: false },
        hasSubtitles: { type: Boolean, default: false },
        keyboardAccessible: { type: Boolean, default: false },
        screenReaderFriendly: { type: Boolean, default: false },
        colorBlindFriendly: { type: Boolean, default: false },
        hasHighContrast: { type: Boolean, default: false },
        textSize: {
            type: String,
            enum: ['small', 'medium', 'large'],
            default: 'medium'
        },
        reducedMotion: { type: Boolean, default: false }
    },
    
    // Analytics
    analytics: {
        playerBehavior: {
            averageSessionTime: { type: Number, default: 0, min: 0 },
            bounceRate: { type: Number, default: 0, min: 0, max: 100 },
            returnPlayerRate: { type: Number, default: 0, min: 0, max: 100 },
            peakConcurrentPlayers: { type: Number, default: 0, min: 0 }
        },
        engagement: {
            likesToPlaysRatio: { type: Number, default: 0, min: 0 },
            sharesToPlaysRatio: { type: Number, default: 0, min: 0 },
            remixesToPlaysRatio: { type: Number, default: 0, min: 0 },
            commentEngagementRate: { type: Number, default: 0, min: 0 }
        },
        educational: {
            learningGoalsAchieved: { type: Number, default: 0, min: 0 },
            skillsImproved: [String],
            knowledgeRetentionScore: { type: Number, default: 0, min: 0, max: 100 }
        }
    },
    
    // Localization
    localization: {
        type: Map,
        of: {
            title: String,
            description: String,
            shortDescription: String,
            instructions: [String]
        }
    },
    
    // Competitions
    competitions: {
        isCompetitionEntry: { type: Boolean, default: false },
        competitionId: String,
        competitionRank: Number,
        awards: [{
            type: {
                type: String,
                enum: ['winner', 'runner_up', 'participant', 'featured', 'creative', 'technical']
            },
            title: String,
            awardedAt: Date
        }]
    },
    
    // Version control
    versions: {
        major: { type: Number, default: 1 },
        minor: { type: Number, default: 0 },
        patch: { type: Number, default: 0 },
        backups: [{
            version: String,
            code: Schema.Types.Mixed,
            createdAt: Date,
            description: String
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

gameSchema.index({ creatorId: 1, status: 1 });
gameSchema.index({ gameType: 1, difficulty: 1, ageGroups: 1 });
gameSchema.index({ status: 1, visibility: 1, 'social.isPublic': 1 });
gameSchema.index({ 'social.featuredInGallery': 1, publishedAt: -1 });
gameSchema.index({ 'metrics.plays': -1, 'metrics.likes': -1 });
gameSchema.index({ 'moderation.status': 1, createdAt: -1 });
gameSchema.index({ skills: 1 });
gameSchema.index({ 'social.communityTags': 1 });
gameSchema.index({ isRemix: 1, originalGameId: 1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

gameSchema.virtual('isPublished').get(function() {
    return this.status === 'published' && this.moderation.status === 'approved';
});

gameSchema.virtual('averageRating').get(function() {
    if (this.metrics.ratings.totalRatings === 0) return 0;
    return (
        this.metrics.ratings.fun +
        this.metrics.ratings.difficulty +
        this.metrics.ratings.creativity +
        this.metrics.ratings.educational
    ) / 4;
});

gameSchema.virtual('popularityScore').get(function() {
    return (
        this.metrics.plays * 1 +
        this.metrics.likes * 5 +
        this.metrics.shares * 10 +
        this.metrics.remixes * 15 +
        this.averageRating * 20
    );
});

gameSchema.virtual('engagementRate').get(function() {
    if (this.metrics.plays === 0) return 0;
    return ((this.metrics.likes + this.metrics.comments) / this.metrics.plays) * 100;
});

gameSchema.virtual('totalSize').get(function() {
    return this.technical.codeSize + this.technical.assetSize;
});

// ==========================================
// STATIC METHODS
// ==========================================

gameSchema.statics.findPublicGames = function(filters: Record<string, unknown> = {}) {
    const query = {
        status: 'published',
        'moderation.status': 'approved',
        'social.isPublic': true,
        ...filters
    };
    
    return this.find(query).sort({ 'metrics.plays': -1, publishedAt: -1 });
};

gameSchema.statics.findFeaturedGames = function(limit = 10) {
    return this.find({
        status: 'published',
        'moderation.status': 'approved',
        'social.featuredInGallery': true,
        'social.isPublic': true
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

gameSchema.statics.findByCreator = function(creatorId: string, includePrivate = false) {
    const query: Record<string, unknown> = { creatorId };
    
    if (!includePrivate) {
        query.status = { $in: ['published', 'unlisted'] };
    }
    
    return this.find(query).sort({ updatedAt: -1 });
};

gameSchema.statics.findSimilarGames = function(gameId: string, limit = 5) {
    return this.findById(gameId).then((game: IGame | null) => {
        if (!game) return [];
        
        return this.find({
            _id: { $ne: gameId },
            status: 'published',
            'moderation.status': 'approved',
            'social.isPublic': true,
            $or: [
                { gameType: game.gameType },
                { skills: { $in: game.skills } },
                { ageGroups: { $in: game.ageGroups } }
            ]
        })
        .sort({ 'metrics.plays': -1 })
        .limit(limit);
    });
};

gameSchema.statics.searchGames = function(searchTerm: string, filters: Record<string, unknown> = {}) {
    const query = {
        status: 'published',
        'moderation.status': 'approved',
        'social.isPublic': true,
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { skills: { $regex: searchTerm, $options: 'i' } },
            { 'social.communityTags': { $regex: searchTerm, $options: 'i' } }
        ],
        ...filters
    };
    
    return this.find(query).sort({ 'metrics.plays': -1 });
};

// ==========================================
// INSTANCE METHODS
// ==========================================

gameSchema.methods.incrementPlays = function() {
    this.metrics.plays += 1;
    this.metrics.weeklyPlays += 1;
    this.metrics.monthlyPlays += 1;
    this.lastPlayedAt = new Date();
    
    // Update analytics
    this.analytics.engagement.likesToPlaysRatio = this.metrics.likes / this.metrics.plays;
    this.analytics.engagement.sharesToPlaysRatio = this.metrics.shares / this.metrics.plays;
    this.analytics.engagement.remixesToPlaysRatio = this.metrics.remixes / this.metrics.plays;
    
    return this.save();
};

gameSchema.methods.addRating = function(rating: { fun: number; difficulty: number; creativity: number; educational: number }) {
    const totalRatings = this.metrics.ratings.totalRatings;
    
    // Calculate new averages
    this.metrics.ratings.fun = ((this.metrics.ratings.fun * totalRatings) + rating.fun) / (totalRatings + 1);
    this.metrics.ratings.difficulty = ((this.metrics.ratings.difficulty * totalRatings) + rating.difficulty) / (totalRatings + 1);
    this.metrics.ratings.creativity = ((this.metrics.ratings.creativity * totalRatings) + rating.creativity) / (totalRatings + 1);
    this.metrics.ratings.educational = ((this.metrics.ratings.educational * totalRatings) + rating.educational) / (totalRatings + 1);
    
    this.metrics.ratings.totalRatings += 1;
    
    return this.save();
};

gameSchema.methods.createRemix = function(remixData: Partial<IGame>) {
    const remixChain = [...this.remixChain, this._id];
    
    return new (this.constructor as typeof Game)({
        ...remixData,
        isRemix: true,
        originalGameId: this.originalGameId || this._id,
        remixChain,
        createdAt: new Date()
    });
};

gameSchema.methods.getLocalizedContent = function(language = 'en') {
    const localized = this.localization?.get(language);
    return {
        title: localized?.title || this.title,
        description: localized?.description || this.description,
        shortDescription: localized?.shortDescription || this.shortDescription,
        instructions: localized?.instructions || []
    };
};

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

gameSchema.pre('save', function(next) {
    // Calculate code and asset sizes
    if (this.code) {
        this.technical.codeSize = JSON.stringify(this.code).length;
    }
    
    // Set published date when status changes to published
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Auto-moderate content
    if (this.isModified('title') || this.isModified('description')) {
        // Simple content filtering (expand with actual AI/ML moderation)
        const inappropriateWords = ['inappropriate', 'bad', 'violent']; // Placeholder
        const content = (this.title + ' ' + this.description).toLowerCase();
        
        this.moderation.autoModeration.textAnalysis.inappropriateContent = 
            inappropriateWords.some(word => content.includes(word));
    }
    
    // Update version when content changes
    if (this.isModified('code') && !this.isNew) {
        this.technical.version += 1;
        this.versions.patch += 1;
    }
    
    next();
});

// ==========================================
// EXPORT MODEL
// ==========================================

export const Game = mongoose.model<IGame>('Game', gameSchema);
export default Game;
