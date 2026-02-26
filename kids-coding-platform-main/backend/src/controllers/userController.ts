import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthenticatedRequest } from '../types/express';
import { calculateXP } from '../services/xpCalculator';
import { getAgeGroup } from '../constants/coppa';

// ==========================================
// AUTHENTICATION & REGISTRATION
// ==========================================

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { 
            username, 
            email, 
            password, 
            dateOfBirth,
            parentEmail,
            displayName,
            preferredLanguage = 'en',
            role = 'student' // Allow role to be specified, default to student
        } = req.body;

        // Validate required fields
        if (!username || !email || !password || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, password, and date of birth are required'
            });
        }

        // Calculate age and determine if COPPA applies
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Determine COPPA compliance for all accounts
        const requiresParentalConsent = role !== 'parent' && age < 13;

        // Skip age validation for parent accounts
        if (role !== 'parent') {
            // COPPA compliance - require parent email for users under 13
            if (requiresParentalConsent && !parentEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent email is required for users under 13'
                });
            }

            // Validate age range (4-15) for children only
            if (age < 4 || age > 15) {
                return res.status(400).json({
                    success: false,
                    message: 'This platform is designed for children ages 4-15'
                });
            }
        }

        // Determine age group (only for children)
        let ageGroup: string = 'young_learners';
        if (role !== 'parent') {
            ageGroup = getAgeGroup(age); // Use the updated COPPA function
        }

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with role-specific configuration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData: any = {
            username,
            email,
            password: hashedPassword,
            displayName: displayName || username,
            dateOfBirth: birthDate,
            age,
            ageGroup,
            role: role, // Use the role from request instead of hardcoded 'student'
            preferredLanguage,
            timezone: 'UTC',
            
            // COPPA compliance
            coppa: {
                requiresParentalConsent,
                parentEmail: requiresParentalConsent ? parentEmail : undefined,
                parentalConsent: false,
                consentDate: requiresParentalConsent ? undefined : new Date()
            }
        };

        // Add role-specific default values
        if (role === 'parent') {
            // Simplified config for parents
            userData.progress = {
                totalXP: 0,
                currentLevel: 1,
                badges: [],
                completedModules: [],
                completedChallenges: [],
                completedProjects: [],
                achievements: [],
                streakDays: 0,
                lastActiveDate: new Date(),
                timeSpentLearning: 0,
                skillsProgress: {},
                learningPath: [],
                moduleProgress: {}
            };
            
            userData.settings = {
                notifications: {
                    email: true,
                    push: false,
                    achievements: false,
                    reminders: false,
                    weeklyReports: true
                },
                privacy: {
                    showProgress: false,
                    allowFriendRequests: false,
                    showOnLeaderboard: false,
                    allowProjectSharing: false
                },
                accessibility: {
                    fontSize: 'medium',
                    highContrast: false,
                    screenReader: false,
                    keyboardNavigation: false,
                    audioDescriptions: false
                },
                learning: {
                    difficultyPreference: 'adaptive',
                    pacePreference: 'self_paced',
                    visualPreferences: [],
                    reminderTime: '09:00'
                }
            };
            
            userData.safety = {
                contentFilter: 'moderate',
                blockedUsers: [],
                reportedContent: [],
                parentalControls: {
                    timeLimit: 480, // 8 hours max for parents
                    allowedFeatures: ['learn', 'practice', 'create', 'share', 'collaborate', 'compete'], // All features for parents
                    requireApprovalForSharing: false
                }
            };
        } else {
            // Student configuration (existing logic)
            userData.progress = {
                totalXP: 0,
                currentLevel: 1,
                badges: [],
                completedModules: [],
                completedChallenges: [],
                completedProjects: [],
                achievements: [],
                streakDays: 0,
                lastActiveDate: new Date(),
                timeSpentLearning: 0,
                skillsProgress: {},
                moduleProgress: {}
            };
            
            userData.settings = {
                notifications: {
                    email: !requiresParentalConsent,
                    push: false,
                    achievements: true,
                    reminders: !requiresParentalConsent,
                    weeklyReports: !requiresParentalConsent
                },
                privacy: {
                    showProgress: !requiresParentalConsent,
                    allowFriendRequests: requiresParentalConsent ? false : true,
                    showOnLeaderboard: !requiresParentalConsent,
                    allowProjectSharing: requiresParentalConsent ? false : true
                },
                accessibility: {
                    fontSize: 'medium',
                    highContrast: false,
                    screenReader: false,
                    keyboardNavigation: false,
                    audioDescriptions: false
                },
                learning: {
                    difficultyPreference: 'adaptive',
                    pacePreference: 'self_paced',
                    visualPreferences: ['colorful', 'animated'],
                    reminderTime: '16:00'
                }
            };
            
            userData.safety = {
                contentFilter: requiresParentalConsent ? 'strict' : 'moderate',
                blockedUsers: [],
                reportedContent: [],
                parentalControls: {
                    timeLimit: requiresParentalConsent ? 60 : 120, // minutes per day
                    allowedFeatures: requiresParentalConsent ? ['learn', 'practice'] : ['learn', 'practice', 'create', 'share'],
                    requireApprovalForSharing: requiresParentalConsent
                }
            };
        }

        const user = new User(userData);

        await user.save();

        // Generate JWT with appropriate expiration
        const tokenExpiration = requiresParentalConsent ? '2h' : '24h';
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role,
                ageGroup: user.ageGroup,
                requiresParentalConsent 
            },
            process.env.JWT_SECRET || 'fallback_secret_change_in_production',
            { expiresIn: tokenExpiration }
        );

        // Response data (filtered for safety)
        const responseUser = {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            ageGroup: user.ageGroup,
            role: user.role,
            preferredLanguage: user.preferredLanguage,
            requiresParentalConsent,
            settings: user.settings,
            progress: {
                totalXP: user.progress.totalXP,
                currentLevel: user.progress.currentLevel,
                badges: user.progress.badges.length,
                completedModules: user.progress.completedModules.length
            }
        };

        return res.status(201).json({
            success: true,
            message: requiresParentalConsent 
                ? 'Account created! Parental consent required to continue.' 
                : 'Account created successfully!',
            data: {
                token,
                user: responseUser,
                requiresParentalConsent
            }
        });

    } catch (error) {
        console.error('Registration error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : 'Unknown',
            requestData: {
                username: req.body.username,
                email: req.body.email,
                role: req.body.role || 'student',
                hasDateOfBirth: !!req.body.dateOfBirth
            }
        });
        
        // More specific error messages based on error type
        if (error instanceof Error && error.name === 'ValidationError') {
            const validationError = error as unknown as { errors: Record<string, unknown> };
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + error.message,
                errors: validationError.errors
            });
        }
        
        const mongoError = error as { code?: number };
        if (error instanceof Error && mongoError.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Server error during registration: ' + (error instanceof Error ? error.message : String(error))
        });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password, rememberMe = false } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user and populate necessary fields
        const user = await User.findOne({ email })
            .populate('progress.badges', 'name iconUrl category rarity')
            .select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.auth.lastLoginAt = new Date();
        
        // Update streak if appropriate
        const today = new Date();
        const lastActive = user.progress.lastActiveDate;
        
        if (lastActive) {
            const daysDifference = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDifference === 1) {
                // Consecutive day - increment streak
                user.progress.streakDays += 1;
            } else if (daysDifference > 1) {
                // Streak broken - reset
                user.progress.streakDays = 1;
            }
            // If daysDifference === 0, same day login, don't change streak
        } else {
            // First time login or no previous active date - start streak
            user.progress.streakDays = 1;
        }
        
        user.progress.lastActiveDate = today;
        await user.save();

        // Generate JWT
        const tokenExpiration = rememberMe ? '30d' : (user.coppa.requiresParentalConsent ? '2h' : '24h');
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role,
                ageGroup: user.ageGroup,
                requiresParentalConsent: user.coppa.requiresParentalConsent
            },
            process.env.JWT_SECRET || 'fallback_secret_change_in_production',
            { expiresIn: tokenExpiration }
        );

        // Prepare response data
        const responseUser = {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            ageGroup: user.ageGroup,
            role: user.role,
            avatar: user.avatar,
            preferredLanguage: user.preferredLanguage,
            settings: user.settings,
            progress: {
                totalXP: user.progress.totalXP,
                currentLevel: user.progress.currentLevel,
                streakDays: user.progress.streakDays,
                badges: user.progress.badges,
                completedModules: user.progress.completedModules.length,
                completedChallenges: user.progress.completedChallenges.length,
                timeSpentLearning: user.progress.timeSpentLearning
            },
            safety: user.safety,
            requiresParentalConsent: user.coppa.requiresParentalConsent,
            hasParentalConsent: user.coppa.parentalConsent
        };

        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: responseUser
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        const errorDetails = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : { message: String(error) };
        console.error('Error details:', errorDetails);
        return res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? errorDetails.message : undefined
        });
    }
};

export const logoutUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Update last logout time
        await User.findByIdAndUpdate(req.user._id, {
            lastLogoutAt: new Date()
        });

        return res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('progress.badges', 'name description iconUrl category rarity')
            .populate('progress.completedModules', 'title difficulty category')
            .populate('progress.completedChallenges', 'title difficulty category')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare response data
        const responseUser = {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            age: user.age,
            ageGroup: user.ageGroup,
            role: user.role,
            avatar: user.avatar,
            preferredLanguage: user.preferredLanguage,
            settings: user.settings,
            progress: {
                totalXP: user.progress.totalXP,
                currentLevel: user.progress.currentLevel,
                streakDays: user.progress.streakDays,
                badges: user.progress.badges,
                completedModules: user.progress.completedModules.length,
                completedChallenges: user.progress.completedChallenges.length,
                timeSpentLearning: user.progress.timeSpentLearning
            },
            safety: user.safety,
            requiresParentalConsent: user.coppa.requiresParentalConsent,
            hasParentalConsent: user.coppa.parentalConsent
        };

        return res.json({
            success: true,
            message: 'User profile retrieved successfully',
            data: responseUser
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching user profile'
        });
    }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { 
            displayName, 
            firstName, 
            lastName, 
            email, 
            phone, 
            familyName, 
            preferredLanguage, 
            avatar,
            currentPassword,
            newPassword 
        } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Handle password change if requested
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to change password'
                });
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Validate new password
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update profile fields
        if (displayName) user.displayName = displayName;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another user'
                });
            }
            user.email = email;
        }
        if (phone !== undefined) user.phone = phone; // Allow empty string
        if (familyName !== undefined) user.familyName = familyName; // Allow empty string
        if (preferredLanguage) user.preferredLanguage = preferredLanguage;
        if (avatar) user.avatar = avatar;

        await user.save();

        // Return updated user data (same format as getUserProfile)
        const responseUser = {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            familyName: user.familyName,
            dateOfBirth: user.dateOfBirth,
            age: user.age,
            ageGroup: user.ageGroup,
            role: user.role,
            avatar: user.avatar,
            preferredLanguage: user.preferredLanguage,
            settings: user.settings,
            requiresParentalConsent: user.coppa?.requiresParentalConsent,
            hasParentalConsent: user.coppa?.parentalConsent
        };

        return res.json({
            success: true,
            message: 'Profile updated successfully',
            data: responseUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

export const updateUserSettings = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { notifications, privacy, accessibility, learning } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update settings with validation
        if (notifications) {
            user.settings.notifications = { ...user.settings.notifications, ...notifications };
        }
        
        if (privacy) {
            // For users under 13, maintain stricter privacy defaults
            if (user.coppa.requiresParentalConsent) {
                user.settings.privacy = {
                    ...user.settings.privacy,
                    showProgress: privacy.showProgress || false,
                    allowFriendRequests: false,
                    showOnLeaderboard: privacy.showOnLeaderboard || false,
                    allowProjectSharing: false
                };
            } else {
                user.settings.privacy = { ...user.settings.privacy, ...privacy };
            }
        }
        
        if (accessibility) {
            user.settings.accessibility = { ...user.settings.accessibility, ...accessibility };
        }
        
        if (learning) {
            user.settings.learning = { ...user.settings.learning, ...learning };
        }

        await user.save();

        return res.json({
            success: true,
            message: 'Settings updated successfully',
            data: { settings: user.settings }
        });
    } catch (error) {
        console.error('Update settings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating settings'
        });
    }
};

// ==========================================
// PROGRESS TRACKING AND XP MANAGEMENT
// ==========================================

export const updateUserProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { 
            xpEarned, 
            activityType, 
            activityId: _activityId, 
            timeSpent, 
            skillsImproved = [],
            completedChallenge,
            completedModule,
            completedProject 
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let totalXPGained = 0;
        const achievements = [];

        // Calculate XP with age-based multipliers
        if (xpEarned && activityType) {
            const calculatedResult = calculateXP(activityType, {
                ageGroup: user.ageGroup,
                timeSpent
            });
            user.progress.totalXP += calculatedResult.xp;
            totalXPGained = calculatedResult.xp;
        }

        // Update level based on XP
        const newLevel = Math.floor(user.progress.totalXP / 100) + 1;
        if (newLevel > user.progress.currentLevel) {
            user.progress.currentLevel = newLevel;
            achievements.push({
                type: 'level_up',
                level: newLevel,
                earnedAt: new Date(),
                description: `Reached level ${newLevel}!`
            });
        }

        // Update time spent learning
        if (timeSpent) {
            user.progress.timeSpentLearning += timeSpent;
        }

        // Update skills progress
        skillsImproved.forEach((skill: string) => {
            const currentProgress = user.progress.skillsProgress.get(skill) || 0;
            user.progress.skillsProgress.set(skill, currentProgress + 1);
        });

        // Add completed items
        if (completedChallenge && !user.progress.completedChallenges.includes(completedChallenge)) {
            user.progress.completedChallenges.push(completedChallenge);
            achievements.push({
                type: 'challenge_completed',
                challengeId: completedChallenge,
                earnedAt: new Date(),
                description: 'Completed a coding challenge!'
            });
        }

        if (completedModule && !user.progress.completedModules.includes(completedModule)) {
            user.progress.completedModules.push(completedModule);
            achievements.push({
                type: 'module_completed',
                moduleId: completedModule,
                earnedAt: new Date(),
                description: 'Completed a learning module!'
            });
        }

        if (completedProject && !user.progress.completedProjects.includes(completedProject)) {
            user.progress.completedProjects.push(completedProject);
            achievements.push({
                type: 'project_completed',
                projectId: completedProject,
                earnedAt: new Date(),
                description: 'Completed a coding project!'
            });
        }

        // Add achievements to user
        user.progress.achievements.push(...achievements);

        // Update last active date
        user.progress.lastActiveDate = new Date();

        await user.save();

        return res.json({
            success: true,
            message: 'Progress updated successfully',
            data: {
                totalXPGained,
                currentLevel: user.progress.currentLevel,
                achievements
            }
        });
    } catch (error) {
        console.error('Update progress error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating progress'
        });
    }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('progress.badges', 'name category rarity')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate additional stats
        const skillsArray = Array.from(user.progress.skillsProgress.entries()).map(([skill, progress]) => ({
            skill,
            progress
        }));

        return res.json({
            success: true,
            message: 'User stats retrieved successfully',
            data: {
                profile: {
                    username: user.username,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    level: user.progress.currentLevel,
                    totalXP: user.progress.totalXP,
                    streakDays: user.progress.streakDays,
                    timeSpentLearning: user.progress.timeSpentLearning,
                    joinDate: user.createdAt
                },
                achievements: {
                    totalBadges: user.progress.badges.length,
                    completedModules: user.progress.completedModules.length,
                    completedChallenges: user.progress.completedChallenges.length,
                    completedProjects: user.progress.completedProjects.length,
                    recentAchievements: user.progress.achievements.slice(-5)
                },
                skills: skillsArray,
                learning: {
                    ageGroup: user.ageGroup,
                    preferredLanguage: user.preferredLanguage,
                    currentStreak: user.progress.streakDays,
                    learningPath: user.progress.learningPath
                }
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching user stats'
        });
    }
};

// ==========================================
// SOCIAL FEATURES
// ==========================================

export const getUserLeaderboard = async (req: Request, res: Response) => {
    try {
        const { ageGroup, timeframe = 'all', limit = 50 } = req.query;

        interface FilterQuery {
            isActive: boolean;
            ageGroup?: string;
            lastLoginAt?: { $gte: Date };
        }
        
        let filter: FilterQuery = { isActive: true };
        if (ageGroup && typeof ageGroup === 'string') filter.ageGroup = ageGroup;

        // Time-based filtering
        if (timeframe === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filter.lastLoginAt = { $gte: weekAgo };
        } else if (timeframe === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filter.lastLoginAt = { $gte: monthAgo };
        }

        const users = await User.find(filter)
            .select('username displayName ageGroup progress.totalXP progress.currentLevel progress.badges avatar')
            .sort({ 'progress.totalXP': -1 })
            .limit(Number(limit));

        const formattedUsers = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            displayName: user.displayName,
            ageGroup: user.ageGroup,
            totalXP: user.progress.totalXP,
            level: user.progress.currentLevel,
            badgeCount: user.progress.badges.length,
            avatar: user.avatar
        }));

        return res.json({
            success: true,
            message: 'Leaderboard retrieved successfully',
            data: {
                users: formattedUsers,
                pagination: {
                    page: 1,
                    limit: Number(limit),
                    total: users.length
                },
                filters: {
                    ageGroup,
                    timeframe
                }
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching leaderboard'
        });
    }
};

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Only admins can access this
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { page = 1, limit = 20, ageGroup, search } = req.query;

        interface UserFilterQuery {
            ageGroup?: string;
            $or?: Array<{
                username?: { $regex: string; $options: string };
                email?: { $regex: string; $options: string };
                displayName?: { $regex: string; $options: string };
            }>;
        }

        let filter: UserFilterQuery = {};
        if (ageGroup && typeof ageGroup === 'string') filter.ageGroup = ageGroup;
        if (search && typeof search === 'string') {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .populate('progress.badges', 'name category')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await User.countDocuments(filter);

        return res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    currentPage: Number(page),
                    limit: Number(limit),
                    total: total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching users'
        });
    }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Only admins can update roles
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { userId } = req.params;
        const { role } = req.body;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            message: 'User role updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating user role'
        });
    }
};

export const deactivateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Only admins can deactivate users
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                isActive: false,
                deactivatedAt: new Date(),
                deactivationReason: reason
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Deactivate user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error deactivating user'
        });
    }
};

// ==========================================
// COPPA COMPLIANCE
// ==========================================

export const grantParentalConsent = async (req: Request, res: Response) => {
    try {
        const { userId, consentToken, parentSignature } = req.body;

        // Validate consent token (implement your consent verification logic)
        if (!consentToken || !parentSignature) {
            return res.status(400).json({
                success: false,
                message: 'Valid consent token and parent signature required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.coppa.requiresParentalConsent) {
            return res.status(400).json({
                success: false,
                message: 'User does not require parental consent'
            });
        }

        // Grant consent
        user.coppa.parentalConsent = true;
        user.coppa.consentDate = new Date();
        user.coppa.consentMethod = 'digital_signature';
        user.coppa.parentSignature = parentSignature;

        await user.save();

        return res.json({
            success: true,
            message: 'Parental consent granted successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Grant parental consent error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error granting parental consent'
        });
    }
};

// ==========================================
// PASSWORD MANAGEMENT
// ==========================================

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.auth.passwordChangedAt = new Date();
        await user.save();

        return res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
};

// ==========================================
// USER DELETION (COPPA Compliance)
// ==========================================

export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { password, reason } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // For COPPA compliance, completely remove data for users under 13
        if (user.coppa.requiresParentalConsent) {
            await User.findByIdAndDelete(userId);
        } else {
            // For older users, soft delete with data retention
            user.isActive = false;
            user.deletedAt = new Date();
            user.deactivationReason = reason;
            // Clear sensitive data but keep learning analytics (anonymized)
            user.email = `deleted_${userId}@deleted.local`;
            user.username = `deleted_user_${userId}`;
            user.displayName = 'Deleted User';
            await user.save();
        }

        return res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error deleting account'
        });
    }
};

// ==========================================
// CHILD MANAGEMENT (PARENT FUNCTIONALITY)
// ==========================================

export const addChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Only parents can add children
        if (req.user.role !== 'parent') {
            return res.status(403).json({
                success: false,
                message: 'Only parent accounts can add children'
            });
        }

        const { 
            username, 
            email, 
            password, 
            dateOfBirth,
            displayName,
            preferredLanguage = 'en'
        } = req.body;

        // Validate required fields
        if (!username || !email || !password || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, password, and date of birth are required'
            });
        }

        // Calculate age and determine if COPPA applies
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Validate age range for children
        if (age < 4 || age > 15) {
            return res.status(400).json({
                success: false,
                message: 'This platform is designed for children ages 4-15'
            });
        }

        // Determine COPPA compliance and age group
        const requiresParentalConsent = age < 13;
        const ageGroup = getAgeGroup(age); // Use the updated COPPA function

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create child user data
        const userData = {
            username,
            email,
            password: hashedPassword,
            displayName: displayName || username,
            dateOfBirth: birthDate,
            age,
            ageGroup,
            role: 'student',
            preferredLanguage,
            timezone: 'UTC',
            
            // COPPA compliance - link to parent
            coppa: {
                requiresParentalConsent,
                parentEmail: req.user.email, // Link to parent who is adding the child
                parentalConsent: true, // Parent is adding the child, so consent is given
                consentDate: new Date(),
                consentMethod: 'digital_signature' // Parent digitally consented by adding the child
            },

            // Student configuration
            progress: {
                totalXP: 0,
                currentLevel: 1,
                badges: [],
                completedModules: [],
                completedChallenges: [],
                completedProjects: [],
                achievements: [],
                streakDays: 0,
                lastActiveDate: new Date(),
                timeSpentLearning: 0,
                skillsProgress: {},
                moduleProgress: {}
            },
            
            settings: {
                notifications: {
                    email: !requiresParentalConsent,
                    push: false,
                    achievements: true,
                    reminders: !requiresParentalConsent,
                    weeklyReports: !requiresParentalConsent
                },
                privacy: {
                    showProgress: !requiresParentalConsent,
                    allowFriendRequests: requiresParentalConsent ? false : true,
                    showOnLeaderboard: !requiresParentalConsent,
                    allowProjectSharing: requiresParentalConsent ? false : true
                },
                accessibility: {
                    fontSize: 'medium',
                    highContrast: false,
                    screenReader: false,
                    keyboardNavigation: false,
                    audioDescriptions: false
                },
                learning: {
                    difficultyPreference: 'adaptive',
                    pacePreference: 'self_paced',
                    visualPreferences: ['colorful', 'animated'],
                    reminderTime: '16:00'
                }
            },
            
            safety: {
                contentFilter: requiresParentalConsent ? 'strict' : 'moderate',
                blockedUsers: [],
                reportedContent: [],
                parentalControls: {
                    timeLimit: requiresParentalConsent ? 60 : 120, // minutes per day
                    allowedFeatures: requiresParentalConsent ? ['learn', 'practice'] : ['learn', 'practice', 'create', 'share'],
                    requireApprovalForSharing: requiresParentalConsent
                }
            }
        };

        const child = new User(userData);
        await child.save();

        // Response data (filtered for safety)
        const responseChild = {
            id: child._id,
            username: child.username,
            displayName: child.displayName,
            ageGroup: child.ageGroup,
            role: child.role,
            preferredLanguage: child.preferredLanguage,
            age: child.age,
            settings: child.settings,
            safety: child.safety,
            requiresParentalConsent: child.coppa.requiresParentalConsent,
            hasParentalConsent: child.coppa.parentalConsent,
            progress: {
                totalXP: child.progress.totalXP,
                currentLevel: child.progress.currentLevel,
                badges: child.progress.badges.length,
                completedModules: child.progress.completedModules.length
            }
        };

        return res.status(201).json({
            success: true,
            message: 'Child account created successfully!',
            data: responseChild
        });

    } catch (error) {
        console.error('Add child error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : 'Unknown',
            parentId: req.user._id
        });
        
        // More specific error messages based on error type
        if (error instanceof Error && error.name === 'ValidationError') {
            const validationError = error as unknown as { errors: Record<string, unknown> };
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + error.message,
                errors: validationError.errors
            });
        }
        
        const mongoError = error as { code?: number };
        if (error instanceof Error && mongoError.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Child account already exists with this email or username'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Server error creating child account: ' + (error instanceof Error ? error.message : String(error))
        });
    }
};

export const getChildren = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Only parents can get their children
        if (req.user.role !== 'parent') {
            return res.status(403).json({
                success: false,
                message: 'Only parent accounts can access children'
            });
        }

        // Find all children linked to this parent
        const children = await User.find({ 
            'coppa.parentEmail': req.user.email,
            role: 'student'
        }).select('-password');

        const formattedChildren = children.map(child => ({
            id: child._id,
            username: child.username,
            displayName: child.displayName,
            dateOfBirth: child.dateOfBirth,
            ageGroup: child.ageGroup,
            age: child.age,
            avatar: child.avatar,
            preferredLanguage: child.preferredLanguage,
            requiresParentalConsent: child.coppa.requiresParentalConsent,
            hasParentalConsent: child.coppa.parentalConsent,
            settings: child.settings,
            safety: child.safety,
            progress: {
                totalXP: child.progress.totalXP,
                currentLevel: child.progress.currentLevel,
                badges: child.progress.badges.length,
                completedModules: child.progress.completedModules.length,
                completedChallenges: child.progress.completedChallenges.length,
                streakDays: child.progress.streakDays,
                timeSpentLearning: child.progress.timeSpentLearning,
                lastActiveDate: child.progress.lastActiveDate
            }
        }));

        return res.json({
            success: true,
            message: 'Children retrieved successfully',
            data: formattedChildren
        });

    } catch (error) {
        console.error('Get children error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching children'
        });
    }
};

export const updateChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        console.log('UpdateChild: Starting request');
        console.log('UpdateChild: User ID:', req.user._id);
        console.log('UpdateChild: User email:', req.user.email);
        console.log('UpdateChild: Child ID:', req.params.childId);
        console.log('UpdateChild: Request body:', req.body);

        // Only parents can update their children
        if (req.user.role !== 'parent') {
            console.log('UpdateChild: Unauthorized - user is not parent');
            return res.status(403).json({
                success: false,
                message: 'Only parent accounts can update children'
            });
        }

        const { childId } = req.params;
        const updates = req.body;

        // Find the child and verify it belongs to this parent
        const child = await User.findOne({
            _id: childId,
            'coppa.parentEmail': req.user.email,
            role: 'student'
        });

        console.log('UpdateChild: Found child:', child ? child._id : 'NOT FOUND');

        if (!child) {
            console.log('UpdateChild: Child not found or access denied');
            return res.status(404).json({
                success: false,
                message: 'Child not found or access denied'
            });
        }

        // Update allowed fields only
        const allowedUpdates = ['displayName', 'preferredLanguage', 'avatar', 'settings', 'safety'];
        const filteredUpdates: Record<string, unknown> = {};
        
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                console.log(`UpdateChild: Processing field ${field}:`, updates[field]);
                if (field === 'settings' || field === 'safety') {
                    filteredUpdates[field] = { ...child[field as keyof typeof child], ...updates[field] };
                } else {
                    filteredUpdates[field] = updates[field];
                }
            }
        });

        console.log('UpdateChild: Filtered updates:', filteredUpdates);

        const updatedChild = await User.findByIdAndUpdate(
            childId,
            filteredUpdates,
            { new: true }
        ).select('-password');

        if (!updatedChild) {
            console.log('UpdateChild: Failed to update child');
            return res.status(404).json({
                success: false,
                message: 'Failed to update child'
            });
        }

        console.log('UpdateChild: Successfully updated child');

        return res.json({
            success: true,
            message: 'Child updated successfully',
            data: {
                id: updatedChild._id,
                username: updatedChild.username,
                displayName: updatedChild.displayName,
                ageGroup: updatedChild.ageGroup,
                avatar: updatedChild.avatar,
                settings: updatedChild.settings,
                safety: updatedChild.safety
            }
        });

    } catch (error) {
        console.error('UpdateChild: Error occurred:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating child',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deleteChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Only parents can delete their children
        if (req.user.role !== 'parent') {
            return res.status(403).json({
                success: false,
                message: 'Only parent accounts can delete children'
            });
        }

        const { childId } = req.params;

        // Find the child and verify it belongs to this parent
        const child = await User.findOne({
            _id: childId,
            'coppa.parentEmail': req.user.email,
            role: 'student'
        });

        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child not found or access denied'
            });
        }

        // For COPPA compliance, completely remove child data
        await User.findByIdAndDelete(childId);

        return res.json({
            success: true,
            message: 'Child account deleted successfully'
        });

    } catch (error) {
        console.error('Delete child error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error deleting child'
        });
    }
};

// ==========================================
// CHILD PROFILE CUSTOMIZATION
// ==========================================

/**
 * Update child's mascot selection (now always Bugsby)
 */
export const updateChildMascot = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user._id;

        console.log('updateChildMascot called - setting Bugsby as mascot for user:', userId);

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Found user:', { id: user._id, role: user.role, hasSettings: !!user.settings });

        // Only children can update their mascot
        if (user.role !== 'student') {
            console.log('Access denied - user role is not student:', user.role);
            return res.status(403).json({
                success: false,
                message: 'Only child accounts can select mascots'
            });
        }

        // Initialize settings.learning if it doesn't exist
        if (!user.settings) {
            console.log('Initializing user settings for user:', userId);
            user.settings = {
                notifications: {
                    email: true,
                    push: true,
                    achievements: true,
                    reminders: true,
                    weeklyReports: true
                },
                privacy: {
                    showProgress: true,
                    allowFriendRequests: true,
                    showOnLeaderboard: true,
                    allowProjectSharing: true
                },
                accessibility: {
                    fontSize: 'medium',
                    highContrast: false,
                    screenReader: false,
                    keyboardNavigation: false,
                    audioDescriptions: false
                },
                learning: {
                    difficultyPreference: 'adaptive',
                    pacePreference: 'self_paced',
                    visualPreferences: [],
                    reminderTime: '16:00'
                }
            };
        }

        if (!user.settings.learning) {
            console.log('Initializing learning settings for user:', userId);
            user.settings.learning = {
                difficultyPreference: 'adaptive',
                pacePreference: 'self_paced',
                visualPreferences: [],
                reminderTime: '16:00'
            };
        }

        console.log('Before mascot update - current visual preferences:', user.settings.learning.visualPreferences);

        // Set Bugsby as the only mascot companion
        user.settings.learning.visualPreferences = ['bugsby'];
        
        console.log('After mascot update - new visual preferences:', user.settings.learning.visualPreferences);
        
        // Mark the settings as modified for Mongoose
        user.markModified('settings');
        
        console.log('Saving user with Bugsby as mascot...');
        await user.save();
        
        console.log('User saved successfully with mascot: bugsby');

        return res.json({
            success: true,
            message: 'Bugsby is now your coding companion!',
            data: {
                selectedMascot: 'bugsby',
                mascotName: 'Bugsby'
            }
        });

    } catch (error) {
        console.error('Update mascot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating mascot'
        });
    }
};

/**
 * Get available mascots for selection
 * @deprecated - Settings interface removed, keeping for potential future use
 */
/* 
export const getAvailableMascots = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const mascots = [
            {
                id: 'cody-cat',
                name: 'Cody Cat',
                description: 'A curious coding cat who loves to explore',
                personality: 'Playful and inquisitive',
                avatar: '/images/mascots/cody-cat.png'
            },
            {
                id: 'ruby-robot',
                name: 'Ruby Robot',
                description: 'A logical, step-by-step coding companion',
                personality: 'Analytical and methodical',
                avatar: '/images/mascots/ruby-robot.png'
            },
            {
                id: 'luna-wizard',
                name: 'Luna Wizard',
                description: 'A magical coding wizard with endless creativity',
                personality: 'Creative and inspiring',
                avatar: '/images/mascots/luna-wizard.png'
            },
            {
                id: 'pixel-panda',
                name: 'Pixel Panda',
                description: 'A friendly coding panda who makes learning fun',
                personality: 'Gentle and encouraging',
                avatar: '/images/mascots/pixel-panda.png'
            },
            {
                id: 'byte-bear',
                name: 'Byte Bear',
                description: 'A space-exploring coding companion',
                personality: 'Adventurous and futuristic',
                avatar: '/images/mascots/byte-bear.png'
            }
        ];

        return res.json({
            success: true,
            data: mascots
        });

    } catch (error) {
        console.error('Get mascots error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching mascots'
        });
    }
};
*/

/**
 * Get child's current mascot selection
 * @deprecated - Settings interface removed, keeping for potential future use
 */
/* 
export const getChildMascot = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('settings role');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Only child accounts have mascot selections'
            });
        }

        const selectedMascot = user.settings?.learning?.visualPreferences?.[0] || null;

        return res.json({
            success: true,
            data: {
                selectedMascot,
                mascotName: selectedMascot ? getMascotName(selectedMascot) : null
            }
        });

    } catch (error) {
        console.error('Get child mascot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching mascot'
        });
    }
};
*/

// Helper function to get mascot display name (now only Bugsby)
function _getMascotName(_mascotId: string): string {
    // Only one mascot companion - Bugsby
    return 'Bugsby';
}
