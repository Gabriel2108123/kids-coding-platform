import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// PROJECT INTERFACES
// ==========================================

export interface IProject extends Document {
    title: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    
    // Project content and code
    code: {
        blockly?: string; // Blockly XML
        javascript?: string;
        python?: string;
        scratch?: string;
        html?: string;
        css?: string;
        assets?: {
            images: string[];
            sounds: string[];
            sprites: string[];
            data: string[];
        };
    };
    
    // Project classification
    type: 'guided' | 'freeform' | 'challenge' | 'template' | 'showcase' | 'assignment';
    category: 'game' | 'animation' | 'story' | 'art' | 'music' | 'simulation' | 'tool' | 'website' | 'app' | 'experiment';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    ageGroups: string[];
    estimatedTime: number; // in minutes
    
    // Creator and collaboration
    creatorId: Schema.Types.ObjectId;
    creatorName: string; // Cached for performance
    collaborators: {
        userId: Schema.Types.ObjectId;
        username: string;
        role: 'editor' | 'viewer' | 'mentor';
        invitedAt: Date;
        acceptedAt?: Date;
        permissions: string[];
    }[];
    
    // Remix and inspiration
    isRemix: boolean;
    originalProjectId?: Schema.Types.ObjectId;
    remixChain: Schema.Types.ObjectId[]; // Track full remix lineage
    inspirationSources: {
        type: 'project' | 'tutorial' | 'example' | 'external';
        sourceId?: string;
        url?: string;
        title: string;
        description?: string;
    }[];
    
    // Educational content
    learningObjectives: string[];
    skills: string[];
    concepts: string[];
    curriculum: {
        subject: string;
        gradeLevel: string;
        standards: string[];
        assessmentCriteria: {
            criterion: string;
            weight: number;
            rubric: string[];
        }[];
    };
    
    // Project structure and guidance
    instructions: {
        step: number;
        title: string;
        description: string;
        hints: string[];
        expectedOutcome: string;
        resources: {
            type: 'video' | 'image' | 'link' | 'code' | 'reference';
            url: string;
            title: string;
            description?: string;
        }[];
        checkpoints: {
            description: string;
            validationCode?: string;
            autoCheck: boolean;
        }[];
    }[];
    
    // Assessment and rubrics
    assessment: {
        hasRubric: boolean;
        rubric: {
            criteria: {
                name: string;
                description: string;
                levels: {
                    level: number;
                    label: string;
                    description: string;
                    points: number;
                }[];
                weight: number;
            }[];
            maxScore: number;
        };
        peerReview: {
            enabled: boolean;
            required: boolean;
            minimumReviews: number;
            anonymousReviews: boolean;
            reviewQuestions: {
                question: string;
                type: 'rating' | 'text' | 'checkbox' | 'multiple_choice';
                options?: string[];
                required: boolean;
            }[];
        };
        selfAssessment: {
            enabled: boolean;
            questions: {
                question: string;
                type: 'reflection' | 'rating' | 'goal_setting';
                prompt: string;
            }[];
        };
    };
    
    // Social and sharing
    social: {
        isPublic: boolean;
        allowComments: boolean;
        allowRemixing: boolean;
        allowCollaboration: boolean;
        shareWithClasses: string[]; // Class IDs
        featuredInGallery: boolean;
        communityTags: string[];
        hashtags: string[];
    };
    
    // Metrics and engagement
    metrics: {
        views: number;
        likes: number;
        favorites: number;
        comments: number;
        remixes: number;
        forks: number; // Different from remixes - for collaborative development
        downloads: number;
        ratings: {
            creativity: number;
            technical: number;
            educational: number;
            fun: number;
            totalRatings: number;
        };
        engagement: {
            averageViewTime: number;
            completionRate: number;
            returnVisitors: number;
            shareRate: number;
        };
    };
    
    // Version control and history
    versions: {
        major: number;
        minor: number;
        patch: number;
        history: {
            version: string;
            timestamp: Date;
            author: string;
            description: string;
            changes: {
                type: 'added' | 'modified' | 'removed';
                component: string;
                description: string;
            }[];
            snapshot: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code: any;
                assets: string[];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                metadata: any;
            };
        }[];
        branches: {
            name: string;
            createdBy: string;
            createdAt: Date;
            description: string;
            isActive: boolean;
        }[];
    };
    
    // Technical specifications
    technical: {
        complexity: number; // Calculated complexity score
        performance: {
            loadTime: number;
            memoryUsage: number;
            codeSize: number;
            assetSize: number;
        };
        compatibility: {
            browsers: string[];
            devices: string[];
            platforms: string[];
            requirements: {
                javascript: boolean;
                webgl: boolean;
                audio: boolean;
                camera: boolean;
                microphone: boolean;
            };
        };
        dependencies: {
            libraries: string[];
            apis: string[];
            services: string[];
        };
    };
    
    // Accessibility features
    accessibility: {
        keyboardAccessible: boolean;
        screenReaderFriendly: boolean;
        colorBlindSupport: boolean;
        audioDescriptions: boolean;
        subtitles: boolean;
        alternativeInputs: string[];
        accessibilityNotes: string;
    };
    
    // Safety and moderation
    moderation: {
        status: 'pending' | 'approved' | 'flagged' | 'rejected' | 'archived';
        moderatedBy?: string;
        moderatedAt?: Date;
        flags: {
            type: 'inappropriate' | 'copyright' | 'spam' | 'malicious' | 'quality' | 'safety';
            reason: string;
            reportedBy: string;
            reportedAt: Date;
            severity: 'low' | 'medium' | 'high' | 'critical';
            resolved: boolean;
            resolution?: string;
        }[];
        autoModeration: {
            contentSafety: {
                textAnalysis: boolean;
                imageAnalysis: boolean;
                codeAnalysis: boolean;
                safetyScore: number;
            };
            qualityCheck: {
                codeQuality: number;
                completeness: number;
                functionality: number;
                documentation: number;
            };
        };
    };
    
    // Competition and showcases
    competitions: {
        isCompetitionEntry: boolean;
        competitionId?: string;
        competitionCategory?: string;
        submissionDate?: Date;
        ranking?: number;
        awards: {
            type: 'winner' | 'finalist' | 'honorable_mention' | 'participant' | 'special_recognition';
            title: string;
            description: string;
            awardedBy: string;
            awardedAt: Date;
            certificate?: string;
        }[];
    };
    
    // Analytics and insights
    analytics: {
        creationProcess: {
            totalEditTime: number;
            editingSessions: number;
            averageSessionLength: number;
            codeRevisions: number;
            testRuns: number;
            errorsEncountered: number;
            helpRequested: number;
        };
        userBehavior: {
            mostEditedSections: string[];
            commonErrors: string[];
            successPatterns: string[];
            strugglingAreas: string[];
        };
        educational: {
            conceptsMastered: string[];
            skillsImproved: string[];
            learningGoalsAchieved: string[];
            timeToMastery: { [skill: string]: number };
        };
    };
    
    // Portfolio and showcase
    portfolio: {
        isPortfolioItem: boolean;
        portfolioCategory: string;
        showcaseOrder: number;
        reflection: {
            challenges: string;
            learnings: string;
            improvements: string;
            proudMoments: string;
            nextSteps: string;
        };
        presentation: {
            demoVideo?: string;
            screenshots: string[];
            walkthrough: string;
            techTalk?: string;
        };
    };
    
    // Localization
    localization: {
        [languageCode: string]: {
            title: string;
            description: string;
            shortDescription: string;
            instructions: {
                step: number;
                title: string;
                description: string;
                hints: string[];
            }[];
        };
    };
    
    // Status and lifecycle
    status: 'draft' | 'in_progress' | 'completed' | 'published' | 'archived' | 'deleted';
    visibility: 'private' | 'shared' | 'class' | 'public';
    lifecycle: {
        createdAt: Date;
        firstEditAt?: Date;
        lastEditAt?: Date;
        completedAt?: Date;
        publishedAt?: Date;
        archivedAt?: Date;
        milestones: {
            type: 'first_run' | 'first_share' | 'first_remix' | 'completion' | 'publication';
            achievedAt: Date;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata?: any;
        }[];
    };
    
    // Assignment and classroom integration
    assignment: {
        isAssignment: boolean;
        assignedBy?: string;
        assignedTo: string[]; // User IDs
        classId?: string;
        dueDate?: Date;
        submissionDate?: Date;
        grade?: {
            score: number;
            maxScore: number;
            feedback: string;
            rubricScores: { [criterion: string]: number };
            gradedBy: string;
            gradedAt: Date;
        };
        requirements: {
            mustUseSkills: string[];
            mustIncludeFeatures: string[];
            minimumComplexity: number;
            timeLimit?: number;
        };
    };
    
    createdAt: Date;
    updatedAt: Date;
    
    // Method signatures
    calculateComplexity(): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addRating(rating: any): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createRemix(remixData: any): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveVersion(description: string, changes: any[]): void;
}

// ==========================================
// PROJECT SCHEMA
// ==========================================

const projectSchema = new Schema<IProject>({
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
    
    // Project code and assets
    code: {
        blockly: String,
        javascript: String,
        python: String,
        scratch: String,
        html: String,
        css: String,
        assets: {
            images: [String],
            sounds: [String],
            sprites: [String],
            data: [String]
        }
    },
    
    // Classification
    type: {
        type: String,
        required: true,
        enum: ['guided', 'freeform', 'challenge', 'template', 'showcase', 'assignment'],
        index: true
    },
    category: {
        type: String,
        required: true,
        enum: ['game', 'animation', 'story', 'art', 'music', 'simulation', 'tool', 'website', 'app', 'experiment'],
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
        max: 480 // max 8 hours
    },
    
    // Creator and collaboration
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
    collaborators: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ['editor', 'viewer', 'mentor']
        },
        invitedAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        acceptedAt: Date,
        permissions: [String]
    }],
    
    // Remix and inspiration
    isRemix: {
        type: Boolean,
        default: false,
        index: true
    },
    originalProjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    remixChain: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    inspirationSources: [{
        type: {
            type: String,
            required: true,
            enum: ['project', 'tutorial', 'example', 'external']
        },
        sourceId: String,
        url: String,
        title: {
            type: String,
            required: true
        },
        description: String
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
    concepts: [{
        type: String,
        trim: true
    }],
    curriculum: {
        subject: String,
        gradeLevel: String,
        standards: [String],
        assessmentCriteria: [{
            criterion: {
                type: String,
                required: true
            },
            weight: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            },
            rubric: [String]
        }]
    },
    
    // Instructions and guidance
    instructions: [{
        step: {
            type: Number,
            required: true,
            min: 1
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        hints: [String],
        expectedOutcome: String,
        resources: [{
            type: {
                type: String,
                required: true,
                enum: ['video', 'image', 'link', 'code', 'reference']
            },
            url: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: String
        }],
        checkpoints: [{
            description: {
                type: String,
                required: true
            },
            validationCode: String,
            autoCheck: {
                type: Boolean,
                default: false
            }
        }]
    }],
    
    // Assessment
    assessment: {
        hasRubric: {
            type: Boolean,
            default: false
        },
        rubric: {
            criteria: [{
                name: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                levels: [{
                    level: {
                        type: Number,
                        required: true
                    },
                    label: {
                        type: String,
                        required: true
                    },
                    description: {
                        type: String,
                        required: true
                    },
                    points: {
                        type: Number,
                        required: true
                    }
                }],
                weight: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 1
                }
            }],
            maxScore: {
                type: Number,
                default: 100
            }
        },
        peerReview: {
            enabled: {
                type: Boolean,
                default: false
            },
            required: {
                type: Boolean,
                default: false
            },
            minimumReviews: {
                type: Number,
                default: 3,
                min: 1
            },
            anonymousReviews: {
                type: Boolean,
                default: true
            },
            reviewQuestions: [{
                question: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    required: true,
                    enum: ['rating', 'text', 'checkbox', 'multiple_choice']
                },
                options: [String],
                required: {
                    type: Boolean,
                    default: false
                }
            }]
        },
        selfAssessment: {
            enabled: {
                type: Boolean,
                default: false
            },
            questions: [{
                question: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    required: true,
                    enum: ['reflection', 'rating', 'goal_setting']
                },
                prompt: {
                    type: String,
                    required: true
                }
            }]
        }
    },
    
    // Social features
    social: {
        isPublic: {
            type: Boolean,
            default: false,
            index: true
        },
        allowComments: {
            type: Boolean,
            default: true
        },
        allowRemixing: {
            type: Boolean,
            default: true
        },
        allowCollaboration: {
            type: Boolean,
            default: false
        },
        shareWithClasses: [String],
        featuredInGallery: {
            type: Boolean,
            default: false,
            index: true
        },
        communityTags: [String],
        hashtags: [String]
    },
    
    // Metrics
    metrics: {
        views: { type: Number, default: 0, min: 0 },
        likes: { type: Number, default: 0, min: 0 },
        favorites: { type: Number, default: 0, min: 0 },
        comments: { type: Number, default: 0, min: 0 },
        remixes: { type: Number, default: 0, min: 0 },
        forks: { type: Number, default: 0, min: 0 },
        downloads: { type: Number, default: 0, min: 0 },
        ratings: {
            creativity: { type: Number, default: 0, min: 0, max: 5 },
            technical: { type: Number, default: 0, min: 0, max: 5 },
            educational: { type: Number, default: 0, min: 0, max: 5 },
            fun: { type: Number, default: 0, min: 0, max: 5 },
            totalRatings: { type: Number, default: 0, min: 0 }
        },
        engagement: {
            averageViewTime: { type: Number, default: 0, min: 0 },
            completionRate: { type: Number, default: 0, min: 0, max: 100 },
            returnVisitors: { type: Number, default: 0, min: 0 },
            shareRate: { type: Number, default: 0, min: 0, max: 100 }
        }
    },
    
    // Version control
    versions: {
        major: { type: Number, default: 1 },
        minor: { type: Number, default: 0 },
        patch: { type: Number, default: 0 },
        history: [{
            version: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                required: true,
                default: Date.now
            },
            author: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            changes: [{
                type: {
                    type: String,
                    required: true,
                    enum: ['added', 'modified', 'removed']
                },
                component: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                }
            }],
            snapshot: {
                code: Schema.Types.Mixed,
                assets: [String],
                metadata: Schema.Types.Mixed
            }
        }],
        branches: [{
            name: {
                type: String,
                required: true
            },
            createdBy: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                required: true,
                default: Date.now
            },
            description: String,
            isActive: {
                type: Boolean,
                default: true
            }
        }]
    },
    
    // Technical specs
    technical: {
        complexity: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        performance: {
            loadTime: { type: Number, default: 0, min: 0 },
            memoryUsage: { type: Number, default: 0, min: 0 },
            codeSize: { type: Number, default: 0, min: 0 },
            assetSize: { type: Number, default: 0, min: 0 }
        },
        compatibility: {
            browsers: [String],
            devices: [String],
            platforms: [String],
            requirements: {
                javascript: { type: Boolean, default: true },
                webgl: { type: Boolean, default: false },
                audio: { type: Boolean, default: false },
                camera: { type: Boolean, default: false },
                microphone: { type: Boolean, default: false }
            }
        },
        dependencies: {
            libraries: [String],
            apis: [String],
            services: [String]
        }
    },
    
    // Accessibility
    accessibility: {
        keyboardAccessible: { type: Boolean, default: false },
        screenReaderFriendly: { type: Boolean, default: false },
        colorBlindSupport: { type: Boolean, default: false },
        audioDescriptions: { type: Boolean, default: false },
        subtitles: { type: Boolean, default: false },
        alternativeInputs: [String],
        accessibilityNotes: String
    },
    
    // Moderation
    moderation: {
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'flagged', 'rejected', 'archived'],
            default: 'pending',
            index: true
        },
        moderatedBy: String,
        moderatedAt: Date,
        flags: [{
            type: {
                type: String,
                required: true,
                enum: ['inappropriate', 'copyright', 'spam', 'malicious', 'quality', 'safety']
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
            severity: {
                type: String,
                required: true,
                enum: ['low', 'medium', 'high', 'critical']
            },
            resolved: {
                type: Boolean,
                default: false
            },
            resolution: String
        }],
        autoModeration: {
            contentSafety: {
                textAnalysis: { type: Boolean, default: false },
                imageAnalysis: { type: Boolean, default: false },
                codeAnalysis: { type: Boolean, default: false },
                safetyScore: { type: Number, default: 100, min: 0, max: 100 }
            },
            qualityCheck: {
                codeQuality: { type: Number, default: 0, min: 0, max: 100 },
                completeness: { type: Number, default: 0, min: 0, max: 100 },
                functionality: { type: Number, default: 0, min: 0, max: 100 },
                documentation: { type: Number, default: 0, min: 0, max: 100 }
            }
        }
    },
    
    // Competitions
    competitions: {
        isCompetitionEntry: {
            type: Boolean,
            default: false
        },
        competitionId: String,
        competitionCategory: String,
        submissionDate: Date,
        ranking: Number,
        awards: [{
            type: {
                type: String,
                enum: ['winner', 'finalist', 'honorable_mention', 'participant', 'special_recognition']
            },
            title: String,
            description: String,
            awardedBy: String,
            awardedAt: Date,
            certificate: String
        }]
    },
    
    // Analytics
    analytics: {
        creationProcess: {
            totalEditTime: { type: Number, default: 0, min: 0 },
            editingSessions: { type: Number, default: 0, min: 0 },
            averageSessionLength: { type: Number, default: 0, min: 0 },
            codeRevisions: { type: Number, default: 0, min: 0 },
            testRuns: { type: Number, default: 0, min: 0 },
            errorsEncountered: { type: Number, default: 0, min: 0 },
            helpRequested: { type: Number, default: 0, min: 0 }
        },
        userBehavior: {
            mostEditedSections: [String],
            commonErrors: [String],
            successPatterns: [String],
            strugglingAreas: [String]
        },
        educational: {
            conceptsMastered: [String],
            skillsImproved: [String],
            learningGoalsAchieved: [String],
            timeToMastery: {
                type: Map,
                of: Number
            }
        }
    },
    
    // Portfolio
    portfolio: {
        isPortfolioItem: {
            type: Boolean,
            default: false
        },
        portfolioCategory: String,
        showcaseOrder: Number,
        reflection: {
            challenges: String,
            learnings: String,
            improvements: String,
            proudMoments: String,
            nextSteps: String
        },
        presentation: {
            demoVideo: String,
            screenshots: [String],
            walkthrough: String,
            techTalk: String
        }
    },
    
    // Localization
    localization: {
        type: Map,
        of: {
            title: String,
            description: String,
            shortDescription: String,
            instructions: [{
                step: Number,
                title: String,
                description: String,
                hints: [String]
            }]
        }
    },
    
    // Status and lifecycle
    status: {
        type: String,
        required: true,
        enum: ['draft', 'in_progress', 'completed', 'published', 'archived', 'deleted'],
        default: 'draft',
        index: true
    },
    visibility: {
        type: String,
        required: true,
        enum: ['private', 'shared', 'class', 'public'],
        default: 'private',
        index: true
    },
    lifecycle: {
        createdAt: {
            type: Date,
            default: Date.now
        },
        firstEditAt: Date,
        lastEditAt: Date,
        completedAt: Date,
        publishedAt: Date,
        archivedAt: Date,
        milestones: [{
            type: {
                type: String,
                required: true,
                enum: ['first_run', 'first_share', 'first_remix', 'completion', 'publication']
            },
            achievedAt: {
                type: Date,
                required: true,
                default: Date.now
            },
            metadata: Schema.Types.Mixed
        }]
    },
    
    // Assignment integration
    assignment: {
        isAssignment: {
            type: Boolean,
            default: false
        },
        assignedBy: String,
        assignedTo: [String],
        classId: String,
        dueDate: Date,
        submissionDate: Date,
        grade: {
            score: {
                type: Number,
                min: 0
            },
            maxScore: {
                type: Number,
                min: 1
            },
            feedback: String,
            rubricScores: {
                type: Map,
                of: Number
            },
            gradedBy: String,
            gradedAt: Date
        },
        requirements: {
            mustUseSkills: [String],
            mustIncludeFeatures: [String],
            minimumComplexity: {
                type: Number,
                min: 0,
                max: 100
            },
            timeLimit: Number
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

projectSchema.index({ creatorId: 1, status: 1 });
projectSchema.index({ type: 1, category: 1, difficulty: 1 });
projectSchema.index({ 'social.isPublic': 1, 'moderation.status': 1 });
projectSchema.index({ 'social.featuredInGallery': 1, 'lifecycle.publishedAt': -1 });
projectSchema.index({ 'metrics.views': -1, 'metrics.likes': -1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ ageGroups: 1 });
projectSchema.index({ 'social.communityTags': 1 });
projectSchema.index({ isRemix: 1, originalProjectId: 1 });
projectSchema.index({ 'assignment.isAssignment': 1, 'assignment.classId': 1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

projectSchema.virtual('isPublished').get(function() {
    return this.status === 'published' && this.moderation.status === 'approved';
});

projectSchema.virtual('averageRating').get(function() {
    if (this.metrics.ratings.totalRatings === 0) return 0;
    return (
        this.metrics.ratings.creativity +
        this.metrics.ratings.technical +
        this.metrics.ratings.educational +
        this.metrics.ratings.fun
    ) / 4;
});

projectSchema.virtual('popularityScore').get(function() {
    const avgRating = this.metrics.ratings.totalRatings === 0 ? 0 : (
        this.metrics.ratings.creativity +
        this.metrics.ratings.technical +
        this.metrics.ratings.educational +
        this.metrics.ratings.fun
    ) / 4;
    
    return (
        this.metrics.views * 1 +
        this.metrics.likes * 5 +
        this.metrics.favorites * 8 +
        this.metrics.remixes * 10 +
        this.metrics.comments * 3 +
        avgRating * 20
    );
});

projectSchema.virtual('currentVersion').get(function() {
    return `${this.versions.major}.${this.versions.minor}.${this.versions.patch}`;
});

projectSchema.virtual('totalSize').get(function() {
    return this.technical.performance.codeSize + this.technical.performance.assetSize;
});

projectSchema.virtual('engagementRate').get(function() {
    if (this.metrics.views === 0) return 0;
    return ((this.metrics.likes + this.metrics.comments + this.metrics.favorites) / this.metrics.views) * 100;
});

// ==========================================
// STATIC METHODS
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
projectSchema.statics.findPublicProjects = function(filters: any = {}) {
    const query = {
        'social.isPublic': true,
        'moderation.status': 'approved',
        status: 'published',
        ...filters
    };
    
    return this.find(query).sort({ 'metrics.views': -1, 'lifecycle.publishedAt': -1 });
};

projectSchema.statics.findFeaturedProjects = function(limit = 10) {
    return this.find({
        'social.featuredInGallery': true,
        'social.isPublic': true,
        'moderation.status': 'approved',
        status: 'published'
    })
    .sort({ 'lifecycle.publishedAt': -1 })
    .limit(limit);
};

projectSchema.statics.findByCreator = function(creatorId: string, includePrivate = false) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { creatorId };
    
    if (!includePrivate) {
        query.visibility = { $in: ['public', 'shared'] };
        query.status = { $in: ['completed', 'published'] };
    }
    
    return this.find(query).sort({ 'lifecycle.lastEditAt': -1 });
};

projectSchema.statics.findSimilarProjects = function(projectId: string, limit = 5) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.findById(projectId).then((project: any) => {
        if (!project) return [];
        
        return this.find({
            _id: { $ne: projectId },
            'social.isPublic': true,
            'moderation.status': 'approved',
            status: 'published',
            $or: [
                { category: project.category },
                { skills: { $in: project.skills } },
                { ageGroups: { $in: project.ageGroups } }
            ]
        })
        .sort({ 'metrics.views': -1 })
        .limit(limit);
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
projectSchema.statics.searchProjects = function(searchTerm: string, filters: any = {}) {
    const query = {
        'social.isPublic': true,
        'moderation.status': 'approved',
        status: 'published',
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { skills: { $regex: searchTerm, $options: 'i' } },
            { 'social.communityTags': { $regex: searchTerm, $options: 'i' } },
            { 'social.hashtags': { $regex: searchTerm, $options: 'i' } }
        ],
        ...filters
    };
    
    return this.find(query).sort({ 'metrics.views': -1 });
};

projectSchema.statics.findRemixesOf = function(originalProjectId: string) {
    return this.find({
        $or: [
            { originalProjectId },
            { remixChain: originalProjectId }
        ],
        'social.isPublic': true,
        'moderation.status': 'approved'
    }).sort({ 'lifecycle.createdAt': -1 });
};

// ==========================================
// INSTANCE METHODS
// ==========================================

projectSchema.methods.incrementViews = function() {
    this.metrics.views += 1;
    this.lifecycle.lastEditAt = new Date();
    
    // Update engagement metrics
    this.metrics.engagement.averageViewTime = 
        (this.metrics.engagement.averageViewTime * (this.metrics.views - 1) + 300) / this.metrics.views; // Assume 5 min average
    
    return this.save();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
projectSchema.methods.addRating = function(rating: any) {
    const totalRatings = this.metrics.ratings.totalRatings;
    
    // Calculate new averages
    this.metrics.ratings.creativity = ((this.metrics.ratings.creativity * totalRatings) + rating.creativity) / (totalRatings + 1);
    this.metrics.ratings.technical = ((this.metrics.ratings.technical * totalRatings) + rating.technical) / (totalRatings + 1);
    this.metrics.ratings.educational = ((this.metrics.ratings.educational * totalRatings) + rating.educational) / (totalRatings + 1);
    this.metrics.ratings.fun = ((this.metrics.ratings.fun * totalRatings) + rating.fun) / (totalRatings + 1);
    
    this.metrics.ratings.totalRatings += 1;
    
    return this.save();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
projectSchema.methods.createRemix = function(remixData: any) {
    const remixChain = [...this.remixChain, this._id];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (this.constructor as any)({
        ...remixData,
        isRemix: true,
        originalProjectId: this.originalProjectId || this._id,
        remixChain,
        'lifecycle.createdAt': new Date()
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
projectSchema.methods.saveVersion = function(description: string, changes: any[]) {
    const version = `${this.versions.major}.${this.versions.minor}.${this.versions.patch}`;
    
    this.versions.history.push({
        version,
        timestamp: new Date(),
        author: this.creatorName,
        description,
        changes,
        snapshot: {
            code: this.code,
            assets: this.code.assets,
            metadata: {
                title: this.title,
                description: this.description,
                category: this.category
            }
        }
    });
    
    // Increment patch version
    this.versions.patch += 1;
    this.lifecycle.lastEditAt = new Date();
    
    return this.save();
};

projectSchema.methods.calculateComplexity = function() {
    let complexity = 0;
    
    // Code complexity factors
    if (this.code.javascript) {
        complexity += Math.min(30, this.code.javascript.length / 100);
    }
    if (this.code.blockly) {
        complexity += Math.min(25, this.code.blockly.length / 200);
    }
    if (this.code.html) {
        complexity += Math.min(15, this.code.html.length / 150);
    }
    if (this.code.css) {
        complexity += Math.min(10, this.code.css.length / 100);
    }
    
    // Feature complexity
    if (this.code.assets) {
        complexity += Math.min(10, Object.values(this.code.assets).flat().length * 2);
    }
    
    // Skills complexity
    complexity += Math.min(10, this.skills.length * 2);
    
    this.technical.complexity = Math.min(100, complexity);
    return this.technical.complexity;
};

projectSchema.methods.getLocalizedContent = function(language = 'en') {
    const localized = this.localization?.get(language);
    return {
        title: localized?.title || this.title,
        description: localized?.description || this.description,
        shortDescription: localized?.shortDescription || this.shortDescription,
        instructions: localized?.instructions || this.instructions
    };
};

projectSchema.methods.checkCollaboratorPermissions = function(userId: string, action: string) {
    if (this.creatorId.toString() === userId) {
        return { allowed: true, role: 'owner' };
    }
    
    const collaborator = this.collaborators.find(c => c.userId.toString() === userId);
    if (!collaborator || !collaborator.acceptedAt) {
        return { allowed: false, reason: 'Not a collaborator' };
    }
    
    const hasPermission = collaborator.permissions.includes(action) || 
                         collaborator.permissions.includes('all');
    
    return { 
        allowed: hasPermission, 
        role: collaborator.role,
        permissions: collaborator.permissions 
    };
};

// ==========================================
// PRE-SAVE MIDDLEWARE
// ==========================================

projectSchema.pre('save', function(next) {
    // Ensure at least one age group
    if (!this.ageGroups || this.ageGroups.length === 0) {
        this.ageGroups = ['elementary']; // Default to elementary (ages 7-10)
    }
    
    // Calculate technical metrics
    if (this.code) {
        this.technical.performance.codeSize = JSON.stringify(this.code).length;
        this.calculateComplexity();
    }
    
    // Set lifecycle dates
    if (this.isModified('code') && !this.lifecycle.firstEditAt) {
        this.lifecycle.firstEditAt = new Date();
    }
    
    if (this.isModified('code')) {
        this.lifecycle.lastEditAt = new Date();
    }
    
    if (this.status === 'completed' && !this.lifecycle.completedAt) {
        this.lifecycle.completedAt = new Date();
    }
    
    if (this.status === 'published' && !this.lifecycle.publishedAt) {
        this.lifecycle.publishedAt = new Date();
    }
    
    next();
});

// ==========================================
// EXPORT MODEL
// ==========================================

export const Project = mongoose.model<IProject>('Project', projectSchema);
export default Project;