import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// MODULE INTERFACES
// ==========================================

export interface IUnlockRequirement {
    type: 'lesson' | 'quiz_score' | 'time_spent' | 'interaction';
    value: string | number;
}

export interface ILessonContent {
    text?: string;
    videoUrl?: string;
    interactiveUrl?: string;
    codeExamples?: {
        language: string;
        code: string;
        explanation: string;
    }[];
    quiz?: {
        questions: {
            id: string;
            question: string;
            type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'coding' | 'drag_drop';
            options?: string[];
            correctAnswer: string | string[];
            explanation: string;
            points: number;
        }[];
        passingScore: number;
    };
    assets: {
        images: string[];
        videos: string[];
        audio: string[];
        downloads: string[];
    };
}

export interface IUserProgress {
    moduleProgress?: {
        [moduleId: string]: {
            completedLessons?: string[];
            lessonScores?: { [lessonId: string]: number };
            lessonTimes?: { [lessonId: string]: number };
        };
    };
    completedModules?: string[];
    skillsProgress?: { [skill: string]: number };
    currentLevel?: number;
}

export interface IEnrollmentData {
    type: 'enrollment' | 'completion';
    completionTime?: number;
    score?: number;
}

export interface IMongoQuery {
    [key: string]: string | number | boolean | object | RegExp | { $regex: string; $options?: string } | { $in?: unknown[] } | { $ne?: unknown };
}

export interface IModuleProgress {
    completedLessons?: string[];
    lessonScores?: { [lessonId: string]: number };
    lessonTimes?: { [lessonId: string]: number };
}

export interface ILocalizedLessonContent {
    id: string;
    title: string;
    description: string;
    content: ILessonContent;
}

export interface ILesson {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'interactive' | 'reading' | 'quiz' | 'coding' | 'game' | 'project';
    duration: number;
    order: number;
    isRequired: boolean;
    content: ILessonContent;
    unlockRequirements: IUnlockRequirement[];
}

export interface IModule extends Document {
    title: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    
    // Module structure and content
    category: 'basics' | 'programming' | 'logic' | 'creativity' | 'math' | 'science' | 'art' | 'games' | 'robotics' | 'web' | 'mobile';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    ageGroups: string[];
    estimatedDuration: number; // in minutes
    
    // Learning content
    learningObjectives: string[];
    skills: string[];
    prerequisites: string[];
    outcomes: string[];
    
    // Module structure
    lessons: {
        id: string;
        title: string;
        description: string;
        type: 'video' | 'interactive' | 'reading' | 'quiz' | 'coding' | 'game' | 'project';
        duration: number; // in minutes
        order: number;
        isRequired: boolean;
        content: {
            text?: string;
            videoUrl?: string;
            interactiveUrl?: string;
            codeExamples?: {
                language: string;
                code: string;
                explanation: string;
            }[];
            quiz?: {
                questions: {
                    id: string;
                    question: string;
                    type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'coding' | 'drag_drop';
                    options?: string[];
                    correctAnswer: string | string[];
                    explanation: string;
                    points: number;
                }[];
                passingScore: number;
            };
            assets: {
                images: string[];
                videos: string[];
                audio: string[];
                downloads: string[];
            };
        };
        unlockRequirements: {
            type: 'lesson' | 'quiz_score' | 'time_spent' | 'interaction';
            value: string | number;
        }[];
    }[];
    
    // Assessment and progression
    assessment: {
        hasQuiz: boolean;
        hasCodingChallenge: boolean;
        hasProject: boolean;
        passingCriteria: {
            minimumScore: number;
            requiredLessons: string[];
            timeRequirement: number;
            skillDemonstration: string[];
        };
        certificate: {
            isAvailable: boolean;
            template: string;
            badgeAwarded?: string;
        };
    };
    
    // Gamification
    rewards: {
        xpReward: number;
        badgesAwarded: string[];
        unlockFeatures: string[];
        achievements: {
            name: string;
            description: string;
            condition: string;
            xpBonus: number;
        }[];
    };
    
    // Social and collaboration
    social: {
        allowDiscussion: boolean;
        hasStudyGroups: boolean;
        peerReview: boolean;
        shareableProjects: boolean;
        mentorSupport: boolean;
    };
    
    // Accessibility and support
    accessibility: {
        hasAudioNarration: boolean;
        hasSubtitles: boolean;
        hasSignLanguage: boolean;
        keyboardNavigation: boolean;
        screenReaderFriendly: boolean;
        alternativeFormats: string[];
        languageSupport: string[];
    };
    
    // Adaptive learning
    adaptiveLearning: {
        isAdaptive: boolean;
        difficultyAdjustment: boolean;
        personalizedPath: boolean;
        remediation: {
            isAvailable: boolean;
            triggerConditions: string[];
            resources: {
                type: 'video' | 'reading' | 'practice' | 'tutor';
                url: string;
                description: string;
            }[];
        };
        enrichment: {
            isAvailable: boolean;
            triggerConditions: string[];
            activities: {
                type: 'challenge' | 'project' | 'research' | 'creation';
                title: string;
                description: string;
                difficulty: string;
            }[];
        };
    };
    
    // Statistics and analytics
    statistics: {
        totalEnrollments: number;
        totalCompletions: number;
        averageCompletionTime: number;
        completionRate: number;
        averageScore: number;
        popularityScore: number;
        satisfaction: {
            averageRating: number;
            totalRatings: number;
            feedback: {
                userId: string;
                rating: number;
                comment: string;
                helpful: number;
                createdAt: Date;
            }[];
        };
        learningAnalytics: {
            mostDifficultLessons: string[];
            commonMistakes: string[];
            dropoffPoints: string[];
            engagementMetrics: {
                averageTimePerLesson: number;
                interactionRate: number;
                returnRate: number;
            };
        };
    };
    
    // Content management
    content: {
        version: number;
        lastUpdated: Date;
        updatedBy: string;
        changeLog: {
            version: number;
            changes: string[];
            date: Date;
            updatedBy: string;
        }[];
        reviewStatus: 'draft' | 'review' | 'approved' | 'needs_revision';
        reviewers: string[];
        approvedBy?: string;
        approvedAt?: Date;
    };
    
    // Technical specifications
    technical: {
        supportedPlatforms: string[];
        browserRequirements: string[];
        minimumSpecs: {
            ram: number;
            processor: string;
            graphics: string;
            internet: string;
        };
        integrations: {
            blockly: boolean;
            scratch: boolean;
            codeEditor: boolean;
            virtualEnvironment: boolean;
            simulator: boolean;
        };
    };
    
    // Sequencing and pathways
    sequencing: {
        isSequential: boolean;
        order: number;
        pathway: string;
        prerequisites: {
            moduleIds: string[];
            skillsRequired: string[];
            minimumLevel: number;
        };
        nextModules: string[];
        alternativePaths: {
            condition: string;
            moduleId: string;
            description: string;
        }[];
    };
    
    // Localization
    localization: {
        [languageCode: string]: {
            title: string;
            description: string;
            shortDescription: string;
            learningObjectives: string[];
            lessons: {
                id: string;
                title: string;
                description: string;
                content: ILessonContent;
            }[];
        };
    };
    
    // Moderation and safety
    moderation: {
        contentRating: 'everyone' | 'guidance' | 'teen';
        safetyFeatures: string[];
        parentalGuidance: string[];
        reportedIssues: {
            type: string;
            description: string;
            reportedBy: string;
            status: 'open' | 'investigating' | 'resolved' | 'dismissed';
            reportedAt: Date;
        }[];
    };
    
    // Metadata
    metadata: {
        tags: string[];
        keywords: string[];
        educationalStandards: string[];
        copyrightInfo: string;
        attribution: string[];
        license: string;
        isOfficial: boolean;
        isFeatured: boolean;
        seasonalContent?: {
            season: string;
            availableFrom: Date;
            availableUntil: Date;
        };
    };
    
    // Status and availability
    status: 'draft' | 'review' | 'published' | 'archived' | 'maintenance';
    isActive: boolean;
    isPublic: boolean;
    publishedAt?: Date;
    archivedAt?: Date;
    
    // Legacy compatibility fields for controller
    isPublished?: boolean;
    slug?: string;
    createdBy?: string;
    deletedAt?: Date;
    targetAgeGroup?: string;
    xpReward?: number;
    
    createdAt: Date;
    updatedAt: Date;
}

// ==========================================
// MODULE SCHEMA
// ==========================================

const moduleSchema = new Schema<IModule>({
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
        maxlength: 300
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
    
    // Basic info
    category: {
        type: String,
        required: true,
        enum: ['basics', 'programming', 'logic', 'creativity', 'math', 'science', 'art', 'games', 'robotics', 'web', 'mobile'],
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
    estimatedDuration: {
        type: Number,
        required: true,
        min: 1,
        max: 600 // max 10 hours
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
    outcomes: [{
        type: String,
        trim: true,
        maxlength: 200
    }],
    
    // Lessons
    lessons: [{
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        type: {
            type: String,
            required: true,
            enum: ['video', 'interactive', 'reading', 'quiz', 'coding', 'game', 'project']
        },
        duration: {
            type: Number,
            required: true,
            min: 1
        },
        order: {
            type: Number,
            required: true,
            min: 1
        },
        isRequired: {
            type: Boolean,
            default: true
        },
        content: {
            text: String,
            videoUrl: String,
            interactiveUrl: String,
            codeExamples: [{
                language: {
                    type: String,
                    required: true
                },
                code: {
                    type: String,
                    required: true
                },
                explanation: {
                    type: String,
                    required: true
                }
            }],
            quiz: {
                questions: [{
                    id: {
                        type: String,
                        required: true
                    },
                    question: {
                        type: String,
                        required: true
                    },
                    type: {
                        type: String,
                        required: true,
                        enum: ['multiple_choice', 'true_false', 'fill_blank', 'coding', 'drag_drop']
                    },
                    options: [String],
                    correctAnswer: Schema.Types.Mixed,
                    explanation: {
                        type: String,
                        required: true
                    },
                    points: {
                        type: Number,
                        default: 1,
                        min: 1
                    }
                }],
                passingScore: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100
                }
            },
            assets: {
                images: [String],
                videos: [String],
                audio: [String],
                downloads: [String]
            }
        },
        unlockRequirements: [{
            type: {
                type: String,
                required: true,
                enum: ['lesson', 'quiz_score', 'time_spent', 'interaction']
            },
            value: {
                type: Schema.Types.Mixed,
                required: true
            }
        }]
    }],
    
    // Assessment
    assessment: {
        hasQuiz: {
            type: Boolean,
            default: false
        },
        hasCodingChallenge: {
            type: Boolean,
            default: false
        },
        hasProject: {
            type: Boolean,
            default: false
        },
        passingCriteria: {
            minimumScore: {
                type: Number,
                default: 70,
                min: 0,
                max: 100
            },
            requiredLessons: [String],
            timeRequirement: {
                type: Number,
                default: 0,
                min: 0
            },
            skillDemonstration: [String]
        },
        certificate: {
            isAvailable: {
                type: Boolean,
                default: false
            },
            template: String,
            badgeAwarded: String
        }
    },
    
    // Rewards
    rewards: {
        xpReward: {
            type: Number,
            required: true,
            min: 0,
            default: 100
        },
        badgesAwarded: [String],
        unlockFeatures: [String],
        achievements: [{
            name: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            condition: {
                type: String,
                required: true
            },
            xpBonus: {
                type: Number,
                default: 0,
                min: 0
            }
        }]
    },
    
    // Social features
    social: {
        allowDiscussion: {
            type: Boolean,
            default: true
        },
        hasStudyGroups: {
            type: Boolean,
            default: false
        },
        peerReview: {
            type: Boolean,
            default: false
        },
        shareableProjects: {
            type: Boolean,
            default: true
        },
        mentorSupport: {
            type: Boolean,
            default: false
        }
    },
    
    // Accessibility
    accessibility: {
        hasAudioNarration: {
            type: Boolean,
            default: false
        },
        hasSubtitles: {
            type: Boolean,
            default: false
        },
        hasSignLanguage: {
            type: Boolean,
            default: false
        },
        keyboardNavigation: {
            type: Boolean,
            default: false
        },
        screenReaderFriendly: {
            type: Boolean,
            default: false
        },
        alternativeFormats: [String],
        languageSupport: [String]
    },
    
    // Adaptive learning
    adaptiveLearning: {
        isAdaptive: {
            type: Boolean,
            default: false
        },
        difficultyAdjustment: {
            type: Boolean,
            default: false
        },
        personalizedPath: {
            type: Boolean,
            default: false
        },
        remediation: {
            isAvailable: {
                type: Boolean,
                default: false
            },
            triggerConditions: [String],
            resources: [{
                type: {
                    type: String,
                    enum: ['video', 'reading', 'practice', 'tutor']
                },
                url: String,
                description: String
            }]
        },
        enrichment: {
            isAvailable: {
                type: Boolean,
                default: false
            },
            triggerConditions: [String],
            activities: [{
                type: {
                    type: String,
                    enum: ['challenge', 'project', 'research', 'creation']
                },
                title: String,
                description: String,
                difficulty: String
            }]
        }
    },
    
    // Statistics
    statistics: {
        totalEnrollments: {
            type: Number,
            default: 0,
            min: 0
        },
        totalCompletions: {
            type: Number,
            default: 0,
            min: 0
        },
        averageCompletionTime: {
            type: Number,
            default: 0,
            min: 0
        },
        completionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        averageScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        popularityScore: {
            type: Number,
            default: 0,
            min: 0
        },
        satisfaction: {
            averageRating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            totalRatings: {
                type: Number,
                default: 0,
                min: 0
            },
            feedback: [{
                userId: {
                    type: String,
                    required: true
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5
                },
                comment: {
                    type: String,
                    maxlength: 500
                },
                helpful: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }]
        },
        learningAnalytics: {
            mostDifficultLessons: [String],
            commonMistakes: [String],
            dropoffPoints: [String],
            engagementMetrics: {
                averageTimePerLesson: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                interactionRate: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 100
                },
                returnRate: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 100
                }
            }
        }
    },
    
    // Content management
    content: {
        version: {
            type: Number,
            default: 1,
            min: 1
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: String,
            required: true
        },
        changeLog: [{
            version: {
                type: Number,
                required: true
            },
            changes: [{
                type: String,
                required: true
            }],
            date: {
                type: Date,
                required: true,
                default: Date.now
            },
            updatedBy: {
                type: String,
                required: true
            }
        }],
        reviewStatus: {
            type: String,
            required: true,
            enum: ['draft', 'review', 'approved', 'needs_revision'],
            default: 'draft',
            index: true
        },
        reviewers: [String],
        approvedBy: String,
        approvedAt: Date
    },
    
    // Technical specs
    technical: {
        supportedPlatforms: [String],
        browserRequirements: [String],
        minimumSpecs: {
            ram: {
                type: Number,
                default: 512
            },
            processor: {
                type: String,
                default: 'modern'
            },
            graphics: {
                type: String,
                default: 'basic'
            },
            internet: {
                type: String,
                default: 'broadband'
            }
        },
        integrations: {
            blockly: {
                type: Boolean,
                default: false
            },
            scratch: {
                type: Boolean,
                default: false
            },
            codeEditor: {
                type: Boolean,
                default: false
            },
            virtualEnvironment: {
                type: Boolean,
                default: false
            },
            simulator: {
                type: Boolean,
                default: false
            }
        }
    },
    
    // Sequencing
    sequencing: {
        isSequential: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0,
            index: true
        },
        pathway: {
            type: String,
            trim: true,
            index: true
        },
        prerequisites: {
            moduleIds: [String],
            skillsRequired: [String],
            minimumLevel: {
                type: Number,
                default: 1,
                min: 1
            }
        },
        nextModules: [String],
        alternativePaths: [{
            condition: {
                type: String,
                required: true
            },
            moduleId: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }]
    },
    
    // Localization
    localization: {
        type: Map,
        of: {
            title: String,
            description: String,
            shortDescription: String,
            learningObjectives: [String],
            lessons: [{
                id: String,
                title: String,
                description: String,
                content: Schema.Types.Mixed
            }]
        }
    },
    
    // Moderation
    moderation: {
        contentRating: {
            type: String,
            required: true,
            enum: ['everyone', 'guidance', 'teen'],
            default: 'everyone'
        },
        safetyFeatures: [String],
        parentalGuidance: [String],
        reportedIssues: [{
            type: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            reportedBy: {
                type: String,
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ['open', 'investigating', 'resolved', 'dismissed'],
                default: 'open'
            },
            reportedAt: {
                type: Date,
                required: true,
                default: Date.now
            }
        }]
    },
    
    // Metadata
    metadata: {
        tags: [String],
        keywords: [String],
        educationalStandards: [String],
        copyrightInfo: String,
        attribution: [String],
        license: {
            type: String,
            default: 'Educational Use'
        },
        isOfficial: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true
        },
        seasonalContent: {
            season: String,
            availableFrom: Date,
            availableUntil: Date
        }
    },
    
    // Status
    status: {
        type: String,
        required: true,
        enum: ['draft', 'review', 'published', 'archived', 'maintenance'],
        default: 'draft',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isPublic: {
        type: Boolean,
        default: false,
        index: true
    },
    publishedAt: Date,
    archivedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

moduleSchema.index({ category: 1, difficulty: 1, ageGroups: 1 });
moduleSchema.index({ status: 1, isActive: 1, isPublic: 1 });
moduleSchema.index({ 'metadata.isFeatured': 1, publishedAt: -1 });
moduleSchema.index({ 'statistics.popularityScore': -1 });
moduleSchema.index({ 'sequencing.pathway': 1, 'sequencing.order': 1 });
moduleSchema.index({ skills: 1 });
moduleSchema.index({ 'metadata.tags': 1 });
moduleSchema.index({ 'content.reviewStatus': 1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

moduleSchema.virtual('isPublished').get(function() {
    return this.status === 'published' && this.isActive && this.content.reviewStatus === 'approved';
});

moduleSchema.virtual('totalLessons').get(function() {
    return this.lessons.length;
});

moduleSchema.virtual('requiredLessons').get(function() {
    return this.lessons.filter(lesson => lesson.isRequired).length;
});

moduleSchema.virtual('optionalLessons').get(function() {
    return this.lessons.filter(lesson => !lesson.isRequired).length;
});

moduleSchema.virtual('completionRate').get(function() {
    if (this.statistics.totalEnrollments === 0) return 0;
    return (this.statistics.totalCompletions / this.statistics.totalEnrollments) * 100;
});

moduleSchema.virtual('averageRating').get(function() {
    return this.statistics.satisfaction.averageRating;
});

// ==========================================
// STATIC METHODS
// ==========================================

moduleSchema.statics.findForUser = function(ageGroup: string, difficulty?: string, category?: string) {
    const query: IMongoQuery = {
        ageGroups: ageGroup,
        status: 'published',
        isActive: true,
        isPublic: true,
        'content.reviewStatus': 'approved'
    };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    
    return this.find(query).sort({ 'sequencing.order': 1, 'metadata.isFeatured': -1 });
};

moduleSchema.statics.findByPathway = function(pathway: string, ageGroup?: string) {
    const query: IMongoQuery = {
        'sequencing.pathway': pathway,
        status: 'published',
        isActive: true,
        isPublic: true
    };
    
    if (ageGroup) query.ageGroups = ageGroup;
    
    return this.find(query).sort({ 'sequencing.order': 1 });
};

moduleSchema.statics.findFeatured = function(limit = 10) {
    return this.find({
        'metadata.isFeatured': true,
        status: 'published',
        isActive: true,
        isPublic: true
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

moduleSchema.statics.findBySkill = function(skill: string, ageGroup?: string) {
    const query: IMongoQuery = {
        skills: skill,
        status: 'published',
        isActive: true,
        isPublic: true
    };
    
    if (ageGroup) query.ageGroups = ageGroup;
    
    return this.find(query).sort({ difficulty: 1, 'sequencing.order': 1 });
};

moduleSchema.statics.searchModules = function(searchTerm: string, filters: Partial<IMongoQuery> = {}) {
    const query: IMongoQuery = {
        status: 'published',
        isActive: true,
        isPublic: true,
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { skills: { $regex: searchTerm, $options: 'i' } },
            { 'metadata.tags': { $regex: searchTerm, $options: 'i' } }
        ]
    };
    
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

moduleSchema.methods.checkPrerequisites = function(userProgress: IUserProgress) {
    const prereqs = this.sequencing.prerequisites;
    
    // Check completed modules
    if (prereqs.moduleIds && prereqs.moduleIds.length > 0) {
        const completedModules = userProgress.completedModules || [];
        const missingModules = prereqs.moduleIds.filter((id: string) => !completedModules.includes(id));
        
        if (missingModules.length > 0) {
            return {
                met: false,
                reason: 'Missing required modules',
                missing: missingModules
            };
        }
    }
    
    // Check required skills
    if (prereqs.skillsRequired && prereqs.skillsRequired.length > 0) {
        const userSkills = Object.keys(userProgress.skillsProgress || {});
        const missingSkills = prereqs.skillsRequired.filter((skill: string) => !userSkills.includes(skill));
        
        if (missingSkills.length > 0) {
            return {
                met: false,
                reason: 'Missing required skills',
                missing: missingSkills
            };
        }
    }
    
    // Check minimum level
    if (prereqs.minimumLevel && (userProgress.currentLevel || 1) < prereqs.minimumLevel) {
        return {
            met: false,
            reason: 'Insufficient level',
            required: prereqs.minimumLevel,
            current: userProgress.currentLevel || 1
        };
    }
    
    return { met: true };
};

moduleSchema.methods.getLessonProgress = function(userProgress: IUserProgress) {
    const moduleProgress = userProgress.moduleProgress?.[this._id] || {};
    
    return this.lessons.map((lesson: ILesson) => ({
        ...lesson,
        isCompleted: moduleProgress.completedLessons?.includes(lesson.id) || false,
        score: moduleProgress.lessonScores?.[lesson.id] || 0,
        timeSpent: moduleProgress.lessonTimes?.[lesson.id] || 0,
        isUnlocked: this.isLessonUnlocked(lesson, moduleProgress)
    }));
};

moduleSchema.methods.isLessonUnlocked = function(lesson: ILesson, moduleProgress: IModuleProgress) {
    if (lesson.order === 1) return true; // First lesson is always unlocked
    
    // Check unlock requirements
    for (const requirement of lesson.unlockRequirements || []) {
        switch (requirement.type) {
            case 'lesson':
                if (typeof requirement.value === 'string' && !moduleProgress.completedLessons?.includes(requirement.value)) {
                    return false;
                }
                break;
            case 'quiz_score': {
                const score = moduleProgress.lessonScores?.[lesson.id] || 0;
                if (typeof requirement.value === 'number' && score < requirement.value) {
                    return false;
                }
                break;
            }
            case 'time_spent': {
                const timeSpent = moduleProgress.lessonTimes?.[lesson.id] || 0;
                if (typeof requirement.value === 'number' && timeSpent < requirement.value * 60 * 1000) { // Convert minutes to ms
                    return false;
                }
                break;
            }
        }
    }
    
    return true;
};

moduleSchema.methods.calculateProgress = function(userProgress: IUserProgress) {
    const moduleProgress = userProgress.moduleProgress?.[this._id] || {};
    const completedLessons = moduleProgress.completedLessons || [];
    const requiredLessons = this.lessons.filter((l: ILesson) => l.isRequired);
    
    const progress = {
        totalLessons: this.lessons.length,
        completedLessons: completedLessons.length,
        requiredLessons: requiredLessons.length,
        completedRequired: completedLessons.filter((id: string) => 
            requiredLessons.some((l: ILesson) => l.id === id)
        ).length,
        percentageComplete: 0,
        isComplete: false,
        averageScore: 0,
        totalTimeSpent: 0
    };
    
    // Calculate percentage
    if (progress.requiredLessons > 0) {
        progress.percentageComplete = (progress.completedRequired / progress.requiredLessons) * 100;
        progress.isComplete = progress.completedRequired === progress.requiredLessons;
    }
    
    // Calculate average score
    const scores = Object.values(moduleProgress.lessonScores || {}) as number[];
    if (scores.length > 0) {
        progress.averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
    
    // Calculate total time spent
    const times = Object.values(moduleProgress.lessonTimes || {}) as number[];
    progress.totalTimeSpent = times.reduce((sum, time) => sum + time, 0);
    
    return progress;
};

moduleSchema.methods.getLocalizedContent = function(language = 'en') {
    const localized = this.localization?.get(language);
    return {
        title: localized?.title || this.title,
        description: localized?.description || this.description,
        shortDescription: localized?.shortDescription || this.shortDescription,
        learningObjectives: localized?.learningObjectives || this.learningObjectives,
        lessons: localized?.lessons || this.lessons
    };
};

moduleSchema.methods.updateStatistics = function(enrollmentData: IEnrollmentData) {
    if (enrollmentData.type === 'enrollment') {
        this.statistics.totalEnrollments += 1;
    } else if (enrollmentData.type === 'completion') {
        this.statistics.totalCompletions += 1;
        
        // Update completion rate
        this.statistics.completionRate = (this.statistics.totalCompletions / this.statistics.totalEnrollments) * 100;
        
        // Update average completion time
        if (enrollmentData.completionTime) {
            const totalTime = this.statistics.averageCompletionTime * (this.statistics.totalCompletions - 1);
            this.statistics.averageCompletionTime = (totalTime + enrollmentData.completionTime) / this.statistics.totalCompletions;
        }
        
        // Update average score
        if (enrollmentData.score) {
            const totalScore = this.statistics.averageScore * (this.statistics.totalCompletions - 1);
            this.statistics.averageScore = (totalScore + enrollmentData.score) / this.statistics.totalCompletions;
        }
    }
    
    // Update popularity score
    this.statistics.popularityScore = Math.min(100,
        (this.statistics.totalEnrollments * 0.3) +
        (this.statistics.completionRate * 0.4) +
        (this.statistics.averageScore * 0.2) +
        (this.statistics.satisfaction.averageRating * 10 * 0.1)
    );
    
    return this.save();
};

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

moduleSchema.pre('save', function(next) {
    // Ensure at least one age group
    if (!this.ageGroups || this.ageGroups.length === 0) {
        this.ageGroups = ['late_elementary', 'middle_school'];
    }
    
    // Ensure at least one lesson
    if (!this.lessons || this.lessons.length === 0) {
        return next(new Error('At least one lesson is required'));
    }
    
    // Sort lessons by order
    this.lessons.sort((a, b) => a.order - b.order);
    
    // Set published date when status changes to published
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    // Set archived date when status changes to archived
    if (this.status === 'archived' && !this.archivedAt) {
        this.archivedAt = new Date();
    }
    
    // Update version when content changes
    if (this.isModified('lessons') && !this.isNew) {
        this.content.version += 1;
        this.content.lastUpdated = new Date();
    }
    
    next();
});

// ==========================================
// EXPORT MODEL
// ==========================================

export const Module = mongoose.model<IModule>('Module', moduleSchema);
export default Module;