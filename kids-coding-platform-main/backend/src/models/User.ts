import mongoose, { Document, Schema } from 'mongoose';

// ==========================================
// USER INTERFACES
// ==========================================

export interface IUser extends Document {
    // Basic user information
    username: string;
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    familyName?: string;
    avatar?: string;
    dateOfBirth: Date;
    age: number;
    ageGroup: 'young_learners' | 'elementary' | 'advanced';
    
    // User roles and permissions
    role: 'student' | 'instructor' | 'admin' | 'parent';
    permissions: string[];
    
    // Language and localization
    preferredLanguage: string;
    timezone: string;
    
    // COPPA compliance and parental controls
    coppa: {
        requiresParentalConsent: boolean;
        parentEmail?: string;
        parentalConsent: boolean;
        consentDate?: Date;
        consentMethod?: 'digital_signature' | 'phone_verification' | 'mail';
        parentSignature?: string;
    };
    
    // Progress tracking
    progress: {
        totalXP: number;
        currentLevel: number;
        badges: Schema.Types.ObjectId[];
        completedModules: Schema.Types.ObjectId[];
        completedChallenges: Schema.Types.ObjectId[];
        completedProjects: Schema.Types.ObjectId[];
        achievements: {
            type: string;
            earnedAt: Date;
            description: string;
            moduleId?: string;
            challengeId?: string;
            projectId?: string;
        }[];
        streakDays: number;
        lastActiveDate: Date;
        timeSpentLearning: number; // in milliseconds
        skillsProgress: Map<string, number>;
        learningPath: string[];
        moduleProgress: Map<string, {
            completedLessons: string[];
            lessonScores: Map<string, number>;
            lessonTimes: Map<string, number>;
            startedAt: Date;
            completedAt?: Date;
        } | {
            startedAt: Date;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            completedLessons: any[];
            currentLesson: number;
            timeSpent: number;
            completed: boolean;
        }>;
    };
    
    // User settings and preferences
    settings: {
        notifications: {
            email: boolean;
            push: boolean;
            achievements: boolean;
            reminders: boolean;
            weeklyReports: boolean;
        };
        privacy: {
            showProgress: boolean;
            allowFriendRequests: boolean;
            showOnLeaderboard: boolean;
            allowProjectSharing: boolean;
        };
        accessibility: {
            fontSize: 'small' | 'medium' | 'large';
            highContrast: boolean;
            screenReader: boolean;
            keyboardNavigation: boolean;
            audioDescriptions: boolean;
        };
        learning: {
            difficultyPreference: 'easy' | 'adaptive' | 'challenging';
            pacePreference: 'slow' | 'self_paced' | 'fast';
            visualPreferences: string[];
            reminderTime: string; // HH:MM format
        };
    };
    
    // Safety and moderation
    safety: {
        contentFilter: 'strict' | 'moderate' | 'minimal';
        blockedUsers: string[];
        reportedContent: {
            contentId: string;
            contentType: 'user' | 'project' | 'comment' | 'message';
            reason: string;
            reportedAt: Date;
        }[];
        isSuspended?: boolean;
        suspensionEnd?: Date;
        suspensionReason?: string;
        parentalControls: {
            timeLimit: number; // minutes per day
            allowedFeatures: string[];
            requireApprovalForSharing: boolean;
            blockedWords: string[];
        };
    };
    
    // Social and collaboration
    social: {
        friends: {
            userId: Schema.Types.ObjectId;
            username: string;
            friendSince: Date;
            status: 'pending' | 'accepted' | 'blocked';
        }[];
        groups: {
            groupId: string;
            groupName: string;
            role: 'member' | 'moderator' | 'admin';
            joinedAt: Date;
        }[];
        mentors: Schema.Types.ObjectId[];
        mentees: Schema.Types.ObjectId[];
    };
    
    // Learning analytics
    analytics: {
        learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
        strengths: string[];
        improvementAreas: string[];
        engagementPatterns: {
            preferredTimeOfDay: string;
            averageSessionLength: number;
            mostActiveTopics: string[];
        };
        performanceMetrics: {
            accuracyRate: number;
            completionRate: number;
            helpSeekingBehavior: number;
            persistenceScore: number;
        };
    };
    
    // Gamification
    gamification: {
        currentTitle: string;
        availableTitles: string[];
        mascot: {
            type: string;
            name: string;
            level: number;
            accessories: string[];
        };
        collectibles: {
            stickers: string[];
            themes: string[];
            avatarItems: string[];
        };
    };
    
    // Classroom integration
    classroom: {
        classroomIds: string[];
        currentClassroom?: string;
        instructors: Schema.Types.ObjectId[];
        assignments: {
            assignmentId: string;
            status: 'assigned' | 'in_progress' | 'submitted' | 'graded';
            assignedAt: Date;
            dueDate?: Date;
            submittedAt?: Date;
            grade?: {
                score: number;
                maxScore: number;
                feedback: string;
                gradedAt: Date;
            };
        }[];
    };
    
    // Subscription and billing (for premium features)
    subscription: {
        plan: 'free' | 'premium' | 'family' | 'classroom';
        status: 'active' | 'inactive' | 'cancelled' | 'trial';
        startDate?: Date;
        endDate?: Date;
        features: string[];
        billing: {
            customerId?: string;
            subscriptionId?: string;
            lastPayment?: Date;
            nextPayment?: Date;
        };
    };
    
    // Authentication and security
    auth: {
        lastLoginAt?: Date;
        lastLogoutAt?: Date;
        loginStreak: number;
        passwordChangedAt?: Date;
        emailVerified: boolean;
        emailVerificationToken?: string;
        passwordResetToken?: string;
        passwordResetExpires?: Date;
        twoFactorEnabled: boolean;
        twoFactorSecret?: string;
    };
    
    // Account status and metadata
    isActive: boolean;
    isEmailVerified: boolean;
    deletedAt?: Date;
    deactivatedAt?: Date;
    deactivationReason?: string;
    
    // Audit trail
    auditLog: {
        action: string;
        timestamp: Date;
        details: Record<string, unknown>;
        ipAddress?: string;
        userAgent?: string;
    }[];
    
    // Terms and privacy
    legal: {
        termsAccepted: boolean;
        termsAcceptedAt?: Date;
        privacyPolicyAccepted: boolean;
        privacyPolicyAcceptedAt?: Date;
        marketingConsent: boolean;
        dataProcessingConsent: boolean;
    };
    
    createdAt: Date;
    updatedAt: Date;
    
    // Virtual properties
    level: number;
    nextLevelXP: number;
    xpToNextLevel: number;
}

// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new Schema<IUser>({
    // Basic information
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        match: /^[a-zA-Z0-9_]+$/,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        index: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't include in queries by default
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 20,
        validate: {
            validator: function(v: string) {
                return !v || /^[+]?[\s\-()]*([0-9][\s\-()]*){10,}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    familyName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    avatar: {
        type: String,
        // Temporarily disabled validation to allow base64 data URLs
        // TODO: Implement proper image upload service
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function(this: IUser, v: Date) {
                // Skip age validation for parent accounts
                if (this.role === 'parent') {
                    return true;
                }
                const age = new Date().getFullYear() - v.getFullYear();
                return age >= 4 && age <= 15;
            },
            message: 'Age must be between 4 and 15 years for student accounts'
        }
    },
    age: {
        type: Number,
        required: true,
        validate: {
            validator: function(this: IUser, v: number) {
                // Skip age validation for parent accounts
                if (this.role === 'parent') {
                    return true;
                }
                return v >= 4 && v <= 15;
            },
            message: 'Age must be between 4 and 15 years for student accounts'
        },
        index: true
    },
    ageGroup: {
        type: String,
        required: true,
        enum: ['young_learners', 'elementary', 'advanced'],
        index: true
    },
    
    // Role and permissions
    role: {
        type: String,
        required: true,
        enum: ['student', 'instructor', 'admin', 'parent'],
        default: 'student',
        index: true
    },
    permissions: [{
        type: String,
        trim: true
    }],
    
    // Localization
    preferredLanguage: {
        type: String,
        required: true,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko']
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    
    // COPPA compliance
    coppa: {
        requiresParentalConsent: {
            type: Boolean,
            required: true,
            index: true
        },
        parentEmail: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function(v: string) {
                    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: 'Parent email must be valid'
            }
        },
        parentalConsent: {
            type: Boolean,
            required: true,
            default: false
        },
        consentDate: Date,
        consentMethod: {
            type: String,
            enum: ['digital_signature', 'phone_verification', 'mail']
        },
        parentSignature: String
    },
    
    // Progress tracking
    progress: {
        totalXP: {
            type: Number,
            default: 0,
            min: 0,
            index: true
        },
        currentLevel: {
            type: Number,
            default: 1,
            min: 1,
            index: true
        },
        badges: [{
            type: Schema.Types.ObjectId,
            ref: 'Badge'
        }],
        completedModules: [{
            type: Schema.Types.ObjectId,
            ref: 'Module'
        }],
        completedChallenges: [{
            type: Schema.Types.ObjectId,
            ref: 'Challenge'
        }],
        completedProjects: [{
            type: Schema.Types.ObjectId,
            ref: 'Project'
        }],
        achievements: [{
            type: {
                type: String,
                required: true
            },
            earnedAt: {
                type: Date,
                required: true,
                default: Date.now
            },
            description: {
                type: String,
                required: true
            },
            moduleId: String,
            challengeId: String,
            projectId: String
        }],
        streakDays: {
            type: Number,
            default: 0,
            min: 0
        },
        lastActiveDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        timeSpentLearning: {
            type: Number,
            default: 0,
            min: 0
        },
        skillsProgress: {
            type: Map,
            of: Number,
            default: new Map()
        },
        learningPath: [String],
        moduleProgress: {
            type: Map,
            of: {
                completedLessons: [String],
                lessonScores: {
                    type: Map,
                    of: Number
                },
                lessonTimes: {
                    type: Map,
                    of: Number
                },
                startedAt: {
                    type: Date,
                    default: Date.now
                },
                completedAt: Date
            }
        }
    },
    
    // Settings
    settings: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            achievements: {
                type: Boolean,
                default: true
            },
            reminders: {
                type: Boolean,
                default: true
            },
            weeklyReports: {
                type: Boolean,
                default: true
            }
        },
        privacy: {
            showProgress: {
                type: Boolean,
                default: false
            },
            allowFriendRequests: {
                type: Boolean,
                default: true
            },
            showOnLeaderboard: {
                type: Boolean,
                default: false
            },
            allowProjectSharing: {
                type: Boolean,
                default: true
            }
        },
        accessibility: {
            fontSize: {
                type: String,
                enum: ['small', 'medium', 'large'],
                default: 'medium'
            },
            highContrast: {
                type: Boolean,
                default: false
            },
            screenReader: {
                type: Boolean,
                default: false
            },
            keyboardNavigation: {
                type: Boolean,
                default: false
            },
            audioDescriptions: {
                type: Boolean,
                default: false
            }
        },
        learning: {
            difficultyPreference: {
                type: String,
                enum: ['easy', 'adaptive', 'challenging'],
                default: 'adaptive'
            },
            pacePreference: {
                type: String,
                enum: ['slow', 'self_paced', 'fast'],
                default: 'self_paced'
            },
            visualPreferences: [String],
            reminderTime: {
                type: String,
                default: '16:00',
                match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
            }
        }
    },
    
    // Safety
    safety: {
        contentFilter: {
            type: String,
            required: true,
            enum: ['strict', 'moderate', 'minimal'],
            default: 'moderate'
        },
        blockedUsers: [String],
        reportedContent: [{
            contentId: {
                type: String,
                required: true
            },
            contentType: {
                type: String,
                required: true,
                enum: ['user', 'project', 'comment', 'message']
            },
            reason: {
                type: String,
                required: true
            },
            reportedAt: {
                type: Date,
                required: true,
                default: Date.now
            }
        }],
        isSuspended: {
            type: Boolean,
            default: false,
            index: true
        },
        suspensionEnd: Date,
        suspensionReason: String,
        parentalControls: {
            timeLimit: {
                type: Number,
                default: 120, // 2 hours default
                min: 15,
                max: 480
            },
            allowedFeatures: [{
                type: String,
                enum: ['learn', 'practice', 'create', 'share', 'collaborate', 'compete']
            }],
            requireApprovalForSharing: {
                type: Boolean,
                default: false
            },
            blockedWords: [String]
        }
    },
    
    // Social features
    social: {
        friends: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            username: {
                type: String,
                required: true
            },
            friendSince: {
                type: Date,
                required: true,
                default: Date.now
            },
            status: {
                type: String,
                required: true,
                enum: ['pending', 'accepted', 'blocked'],
                default: 'pending'
            }
        }],
        groups: [{
            groupId: {
                type: String,
                required: true
            },
            groupName: {
                type: String,
                required: true
            },
            role: {
                type: String,
                required: true,
                enum: ['member', 'moderator', 'admin']
            },
            joinedAt: {
                type: Date,
                required: true,
                default: Date.now
            }
        }],
        mentors: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        mentees: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    
    // Analytics
    analytics: {
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
            default: 'mixed'
        },
        strengths: [String],
        improvementAreas: [String],
        engagementPatterns: {
            preferredTimeOfDay: String,
            averageSessionLength: {
                type: Number,
                default: 0,
                min: 0
            },
            mostActiveTopics: [String]
        },
        performanceMetrics: {
            accuracyRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            completionRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            helpSeekingBehavior: {
                type: Number,
                default: 0,
                min: 0
            },
            persistenceScore: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        }
    },
    
    // Gamification
    gamification: {
        currentTitle: {
            type: String,
            default: 'Beginner Coder'
        },
        availableTitles: [String],
        mascot: {
            type: {
                type: String,
                default: 'robot'
            },
            name: {
                type: String,
                default: 'Codey'
            },
            level: {
                type: Number,
                default: 1,
                min: 1
            },
            accessories: [String]
        },
        collectibles: {
            stickers: [String],
            themes: [String],
            avatarItems: [String]
        }
    },
    
    // Classroom
    classroom: {
        classroomIds: [String],
        currentClassroom: String,
        instructors: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        assignments: [{
            assignmentId: {
                type: String,
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ['assigned', 'in_progress', 'submitted', 'graded'],
                default: 'assigned'
            },
            assignedAt: {
                type: Date,
                required: true,
                default: Date.now
            },
            dueDate: Date,
            submittedAt: Date,
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
                gradedAt: Date
            }
        }]
    },
    
    // Subscription
    subscription: {
        plan: {
            type: String,
            required: true,
            enum: ['free', 'premium', 'family', 'classroom'],
            default: 'free'
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'inactive', 'cancelled', 'trial'],
            default: 'active'
        },
        startDate: Date,
        endDate: Date,
        features: [String],
        billing: {
            customerId: String,
            subscriptionId: String,
            lastPayment: Date,
            nextPayment: Date
        }
    },
    
    // Authentication
    auth: {
        lastLoginAt: Date,
        lastLogoutAt: Date,
        loginStreak: {
            type: Number,
            default: 0,
            min: 0
        },
        passwordChangedAt: Date,
        emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: String
    },
    
    // Account status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deactivatedAt: Date,
    deactivationReason: String,
    
    // Audit trail
    auditLog: [{
        action: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        },
        details: Schema.Types.Mixed,
        ipAddress: String,
        userAgent: String
    }],
    
    // Legal compliance
    legal: {
        termsAccepted: {
            type: Boolean,
            required: true,
            default: false
        },
        termsAcceptedAt: Date,
        privacyPolicyAccepted: {
            type: Boolean,
            required: true,
            default: false
        },
        privacyPolicyAcceptedAt: Date,
        marketingConsent: {
            type: Boolean,
            default: false
        },
        dataProcessingConsent: {
            type: Boolean,
            required: true,
            default: false
        }
    }
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ username: 1, isActive: 1 });
userSchema.index({ ageGroup: 1, role: 1 });
userSchema.index({ 'progress.totalXP': -1 });
userSchema.index({ 'progress.lastActiveDate': -1 });
userSchema.index({ 'coppa.requiresParentalConsent': 1 });
userSchema.index({ 'classroom.classroomIds': 1 });
userSchema.index({ createdAt: -1 });

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

userSchema.virtual('level').get(function() {
    return Math.floor(this.progress.totalXP / 100) + 1;
});

userSchema.virtual('nextLevelXP').get(function() {
    const currentLevel = this.level;
    return currentLevel * 100;
});

userSchema.virtual('xpToNextLevel').get(function() {
    return this.nextLevelXP - this.progress.totalXP;
});

userSchema.virtual('completionStats').get(function() {
    return {
        modules: this.progress.completedModules.length,
        challenges: this.progress.completedChallenges.length,
        projects: this.progress.completedProjects.length,
        badges: this.progress.badges.length
    };
});

userSchema.virtual('isChild').get(function() {
    return this.age < 13;
});

userSchema.virtual('needsParentalConsent').get(function() {
    return this.coppa.requiresParentalConsent && !this.coppa.parentalConsent;
});

// ==========================================
// STATIC METHODS
// ==========================================

userSchema.statics.findByAgeGroup = function(ageGroup: string) {
    return this.find({ ageGroup, isActive: true });
};

userSchema.statics.getLeaderboard = function(ageGroup?: string, limit = 50) {
    const query: Record<string, unknown> = { isActive: true, 'settings.privacy.showOnLeaderboard': true };
    if (ageGroup) query.ageGroup = ageGroup;
    
    return this.find(query)
        .select('username displayName ageGroup progress.totalXP progress.currentLevel progress.badges avatar')
        .sort({ 'progress.totalXP': -1 })
        .limit(limit);
};

userSchema.statics.findActiveUsers = function(timeframe = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);
    
    return this.find({
        isActive: true,
        'progress.lastActiveDate': { $gte: cutoffDate }
    });
};

userSchema.statics.findByRole = function(role: string) {
    return this.find({ role, isActive: true });
};

// ==========================================
// INSTANCE METHODS
// ==========================================

userSchema.methods.addXP = function(amount: number, source?: string) {
    this.progress.totalXP += amount;
    
    // Level up check
    const newLevel = Math.floor(this.progress.totalXP / 100) + 1;
    if (newLevel > this.progress.currentLevel) {
        this.progress.currentLevel = newLevel;
        
        // Add level up achievement
        this.progress.achievements.push({
            type: 'level_up',
            earnedAt: new Date(),
            description: `Reached level ${newLevel}!`
        });
    }
    
    // Add audit log
    this.auditLog.push({
        action: 'xp_gained',
        timestamp: new Date(),
        details: { amount, source, newTotal: this.progress.totalXP }
    });
    
    return this.save();
};

userSchema.methods.awardBadge = function(badgeId: string) {
    if (!this.progress.badges.includes(badgeId)) {
        this.progress.badges.push(badgeId);
        
        this.progress.achievements.push({
            type: 'badge_earned',
            earnedAt: new Date(),
            description: `Earned a new badge!`
        });
        
        this.auditLog.push({
            action: 'badge_awarded',
            timestamp: new Date(),
            details: { badgeId }
        });
    }
    
    return this.save();
};

userSchema.methods.completeModule = function(moduleId: string) {
    if (!this.progress.completedModules.includes(moduleId)) {
        this.progress.completedModules.push(moduleId);
        
        this.progress.achievements.push({
            type: 'module_completed',
            earnedAt: new Date(),
            description: 'Completed a learning module!',
            moduleId
        });
        
        this.auditLog.push({
            action: 'module_completed',
            timestamp: new Date(),
            details: { moduleId }
        });
    }
    
    return this.save();
};

userSchema.methods.updateStreak = function() {
    const today = new Date();
    const lastActive = this.progress.lastActiveDate;
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
        // Consecutive day
        this.progress.streakDays += 1;
    } else if (daysDiff > 1) {
        // Streak broken
        this.progress.streakDays = 1;
    }
    // If daysDiff === 0, same day, don't change streak
    
    this.progress.lastActiveDate = today;
    return this.save();
};

userSchema.methods.canAccessFeature = function(feature: string) {
    // Check parental controls
    if (this.coppa.requiresParentalConsent) {
        if (!this.coppa.parentalConsent) {
            return false;
        }
        
        const allowedFeatures = this.safety.parentalControls.allowedFeatures;
        if (allowedFeatures.length > 0 && !allowedFeatures.includes(feature)) {
            return false;
        }
    }
    
    // Check subscription features
    if (this.subscription.features.length > 0 && !this.subscription.features.includes(feature)) {
        return false;
    }
    
    return true;
};

userSchema.methods.logAction = function(action: string, details?: Record<string, unknown>, req?: { ip?: string; get: (header: string) => string | undefined }) {
    this.auditLog.push({
        action,
        timestamp: new Date(),
        details,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent')
    });
    
    return this.save();
};

// ==========================================
// MIDDLEWARE
// ==========================================

userSchema.pre('save', function(next) {
    // Calculate age from date of birth
    if (this.isModified('dateOfBirth')) {
        const today = new Date();
        const birthDate = this.dateOfBirth;
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        this.age = age;
        
        // Determine age group based on new 3-category system
        if (age >= 4 && age <= 6) this.ageGroup = 'young_learners';
        else if (age >= 7 && age <= 10) this.ageGroup = 'elementary';
        else this.ageGroup = 'advanced'; // ages 11-15 and above
        
        // Set COPPA requirements
        this.coppa.requiresParentalConsent = age < 13;
    }
    
    // Set display name if not provided
    if (!this.displayName) {
        this.displayName = this.username;
    }
    
    // Initialize default settings for new users
    if (this.isNew) {
        // Set privacy defaults based on age
        if (this.coppa.requiresParentalConsent) {
            this.settings.privacy.showProgress = false;
            this.settings.privacy.allowFriendRequests = false;
            this.settings.privacy.showOnLeaderboard = false;
            this.settings.privacy.allowProjectSharing = false;
            this.settings.notifications.email = false;
            this.settings.notifications.weeklyReports = false;
            this.safety.contentFilter = 'strict';
            this.safety.parentalControls.timeLimit = 60;
            this.safety.parentalControls.allowedFeatures = ['learn', 'practice'];
            this.safety.parentalControls.requireApprovalForSharing = true;
        }
    }
    
    next();
});

// ==========================================
// EXPORT MODEL
// ==========================================

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
