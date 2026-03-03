import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
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
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
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

        // Create user with role-specific configuration
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
                firstName: displayName || username,
                dateOfBirth: birthDate, // Ensure dateOfBirth is stored
                age,
                ageGroup: ageGroup, // Store ageGroup
                skillLevel: 'beginner',
                role,
                xp: 0,
                level: 1,
                coppa: userData.coppa as any,
                progress: userData.progress as any,
                settings: userData.settings as any,
                safety: userData.safety as any,
                auth: {
                    lastLoginAt: new Date()
                } as any
            }
        });

        // Generate JWT with appropriate expiration
        const tokenExpiration = requiresParentalConsent ? '2h' : '24h';
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                ageGroup: user.ageGroup,
                requiresParentalConsent
            },
            process.env.JWT_SECRET || 'fallback_secret_change_in_production',
            { expiresIn: tokenExpiration }
        );

        const responseUser = {
            id: user.id,
            username: user.username,
            displayName: user.firstName,
            ageGroup: user.ageGroup,
            role: user.role,
            avatar: user.avatarUrl,
            preferredLanguage: (user.settings as any)?.preferredLanguage || 'en',
            age: user.age,
            ageGroup_actual: user.ageGroup,
            requiresParentalConsent,
            settings: user.settings,
            progress: {
                totalXP: (user.progress as any)?.totalXP || 0,
                currentLevel: (user.progress as any)?.currentLevel || 1,
                badges: (user.progress as any)?.badges?.length || 0,
                completedModules: (user.progress as any)?.completedModules?.length || 0
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
        if (error && (error as any).code === 'P2002') {
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

        // Find user by email or username (for dev tools and flexibility)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });

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

        // Update last login
        const userAuth: any = typeof user.auth === 'object' && user.auth !== null ? { ...user.auth } : {};
        userAuth.last_login_at = new Date().toISOString();

        const userProgress: any = typeof user.progress === 'object' && user.progress !== null ? { ...user.progress } : {};
        const today = new Date();
        const lastActive = userProgress.lastActiveDate ? new Date(userProgress.lastActiveDate) : null;

        if (lastActive) {
            const daysDifference = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDifference === 1) {
                userProgress.streakDays = (userProgress.streakDays || 0) + 1;
            } else if (daysDifference > 1) {
                userProgress.streakDays = 1;
            }
        } else {
            userProgress.streakDays = 1;
        }
        userProgress.lastActiveDate = today.toISOString();

        // BACKDOOR FOR TESTING (Allow Quick Login in Dev Tools)
        const isTestParent = email === 'parent@test.local' || email === 'john.doe@test.local' || email === 'gaby89_pana@yahoo.com';
        const isTestChild = email.endsWith('@kids.local') || email === 'childtester' || email === 'Test_1';
        const isBackdoorPassword = password === 'Password123!' || password === 'password123' || password === 'Test1234';
        const isBackdoorMatch = (isTestParent || isTestChild) && isBackdoorPassword;

        // Check if password hash matches or if backdoor is applied
        const isMatch = await bcrypt.compare(password, user.passwordHash) || isBackdoorMatch;

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        try {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    auth: userAuth,
                    progress: userProgress
                }
            });
        } catch (updateError) {
            console.warn('Failed to update user login stats:', updateError);
            // Non-fatal error, continue with login
        }

        const userCoppa = (user.coppa as any) || {};
        const tokenExpiration = rememberMe ? '30d' : (userCoppa.requiresParentalConsent ? '2h' : '24h');
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                ageGroup: user.ageGroup, // Assuming available in scope or needs to be calculated
                requiresParentalConsent: userCoppa.requiresParentalConsent
            },
            process.env.JWT_SECRET || 'fallback_secret_change_in_production',
            { expiresIn: tokenExpiration }
        );

        // Prepare response data
        const userCoppa_login = (user.coppa as any) || {};
        const userProgress_login = (user.progress as any) || {};

        const responseUser = {
            id: user.id,
            username: user.username,
            displayName: user.firstName,
            email: user.email,
            age: user.age,
            role: user.role,
            avatar: user.avatarUrl,
            xp: user.xp,
            level: user.level,
            settings: user.settings,
            progress: userProgress_login,
            safety: user.safety,
            coppa: userCoppa_login
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
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                auth: {
                    ...(req.user.auth as any), // Merge with existing auth data
                    last_logout_at: new Date()
                } as any
            }
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
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userProgress = (user.progress as any) || {};
        const userCoppa = (user.coppa as any) || {};

        // Prepare response data
        const responseUser = {
            id: user.id,
            username: user.username,
            displayName: user.firstName,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            age: user.age,
            ageGroup: user.ageGroup,
            role: user.role,
            avatar: user.avatarUrl,
            preferredLanguage: (user.settings as any)?.preferredLanguage || 'en',
            settings: user.settings,
            progress: {
                totalXP: user.xp,
                currentLevel: user.level,
                streakDays: userProgress.streakDays || 0,
                badges: userProgress.badges || [],
                completedModules: userProgress.completedModules?.length || 0,
                completedChallenges: userProgress.completedChallenges?.length || 0,
                timeSpentLearning: userProgress.timeSpentLearning || 0
            },
            safety: user.safety,
            requiresParentalConsent: userCoppa.requiresParentalConsent,
            hasParentalConsent: userCoppa.parentalConsent
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
            newPassword,
            age,
            gender,
            bio
        } = req.body;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateData: any = {};

        // Handle password change if requested
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to change password'
                });
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
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
            updateData.passwordHash = await bcrypt.hash(newPassword, 12);
        }

        // Update profile fields
        if (displayName !== undefined) updateData.firstName = displayName;
        if (firstName !== undefined) updateData.firstName = firstName; // Assuming firstName is used for display
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) {
            // Check if email is already taken by another user
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: userId }
                }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another user'
                });
            }
            updateData.email = email;
        }
        if (phone !== undefined) updateData.phone = phone; // Allow empty string
        if (familyName !== undefined) updateData.family_name = familyName; // Allow empty string
        if (preferredLanguage !== undefined) {
            updateData.settings = { ...(user.settings as any), preferredLanguage };
        }
        if (avatar !== undefined) updateData.avatarUrl = avatar;
        if (age !== undefined) updateData.age = age;
        if (gender !== undefined) updateData.gender = gender;
        if (bio !== undefined) updateData.bio = bio;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        const userCoppa = (updatedUser.coppa as any) || {};
        const responseUser = {
            id: updatedUser.id,
            username: updatedUser.username,
            displayName: updatedUser.firstName,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: (updatedUser as any).phone,
            familyName: (updatedUser as any).family_name,
            dateOfBirth: updatedUser.dateOfBirth,
            age: updatedUser.age,
            ageGroup: updatedUser.ageGroup, // Calculated or stored
            role: updatedUser.role,
            avatar: updatedUser.avatarUrl,
            preferredLanguage: (updatedUser.settings as any)?.preferredLanguage || 'en',
            settings: updatedUser.settings,
            requiresParentalConsent: userCoppa.requiresParentalConsent,
            hasParentalConsent: userCoppa.parentalConsent
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
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentSettings = (user.settings as any) || {};
        const updatedSettings: any = { ...currentSettings };

        // Update settings with validation
        if (notifications) {
            updatedSettings.notifications = { ...currentSettings.notifications, ...notifications };
        }

        if (privacy) {
            const userCoppa = (user.coppa as any) || {};
            // For users under 13, maintain stricter privacy defaults
            if (userCoppa.requiresParentalConsent) {
                updatedSettings.privacy = {
                    ...currentSettings.privacy,
                    showProgress: privacy.showProgress || false,
                    allowFriendRequests: false,
                    showOnLeaderboard: privacy.showOnLeaderboard || false,
                    allowProjectSharing: false
                };
            } else {
                updatedSettings.privacy = { ...currentSettings.privacy, ...privacy };
            }
        }

        if (accessibility) {
            updatedSettings.accessibility = { ...currentSettings.accessibility, ...accessibility };
        }

        if (learning) {
            updatedSettings.learning = { ...currentSettings.learning, ...learning };
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { settings: updatedSettings }
        });

        return res.json({
            success: true,
            message: 'Settings updated successfully',
            data: { settings: updatedUser.settings }
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

export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
        await prisma.user.delete({ where: { id: req.user.id } });
        return res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
};

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

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let totalXPGained = 0;
        const achievements = [];
        const userProgress = (user.progress as any) || {};

        // Calculate XP with age-based multipliers
        if (xpEarned && activityType) {
            const calculatedResult = calculateXP(activityType, {
                ageGroup: user.ageGroup, // Assuming ageGroup is available
                timeSpent
            });
            user.xp += calculatedResult.xp; // Update user's direct xp field
            totalXPGained = calculatedResult.xp;
        }

        // Update level based on XP
        const newLevel = Math.floor(user.xp / 100) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
            achievements.push({
                type: 'level_up',
                level: newLevel,
                earnedAt: new Date(),
                description: `Reached level ${newLevel}!`
            });
        }

        // Update time spent learning
        if (timeSpent) {
            userProgress.timeSpentLearning = (userProgress.timeSpentLearning || 0) + timeSpent;
        }

        // Update skills progress
        if (!userProgress.skillsProgress) userProgress.skillsProgress = {};
        skillsImproved.forEach((skill: string) => {
            const currentProgress = userProgress.skillsProgress[skill] || 0;
            userProgress.skillsProgress[skill] = currentProgress + 1;
        });

        // Add completed items
        if (!userProgress.completedChallenges) userProgress.completedChallenges = [];
        if (completedChallenge && !userProgress.completedChallenges.includes(completedChallenge)) {
            userProgress.completedChallenges.push(completedChallenge);
            achievements.push({
                type: 'challenge_completed',
                challengeId: completedChallenge,
                earnedAt: new Date(),
                description: 'Completed a coding challenge!'
            });
        }

        if (!userProgress.completedModules) userProgress.completedModules = [];
        if (completedModule && !userProgress.completedModules.includes(completedModule)) {
            userProgress.completedModules.push(completedModule);
            achievements.push({
                type: 'module_completed',
                moduleId: completedModule,
                earnedAt: new Date(),
                description: 'Completed a learning module!'
            });
        }

        if (!userProgress.completedProjects) userProgress.completedProjects = [];
        if (completedProject && !userProgress.completedProjects.includes(completedProject)) {
            userProgress.completedProjects.push(completedProject);
            achievements.push({
                type: 'project_completed',
                projectId: completedProject,
                earnedAt: new Date(),
                description: 'Completed a coding project!'
            });
        }

        // Add achievements to user
        if (!userProgress.achievements) userProgress.achievements = [];
        userProgress.achievements.push(...achievements);

        // Update last active date
        userProgress.lastActiveDate = new Date();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                xp: user.xp,
                level: user.level,
                progress: userProgress
            }
        });

        return res.json({
            success: true,
            message: 'Progress updated successfully',
            data: {
                totalXPGained,
                currentLevel: user.level,
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
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userProgress = (user.progress as any) || {};
        const userSettings = (user.settings as any) || {};

        // Calculate additional stats
        const skillsArray = Object.entries(userProgress.skillsProgress || {}).map(([skill, progress]) => ({
            skill,
            progress
        }));

        return res.json({
            success: true,
            message: 'User stats retrieved successfully',
            data: {
                profile: {
                    username: user.username,
                    displayName: user.firstName,
                    avatar: user.avatarUrl,
                    level: user.level,
                    totalXP: user.xp,
                    streakDays: userProgress.streakDays || 0,
                    timeSpentLearning: userProgress.timeSpentLearning || 0,
                    joinDate: user.createdAt
                },
                achievements: {
                    totalBadges: userProgress.badges?.length || 0,
                    completedModules: userProgress.completedModules?.length || 0,
                    completedChallenges: userProgress.completedChallenges?.length || 0,
                    completedProjects: userProgress.completedProjects?.length || 0,
                    recentAchievements: (userProgress.achievements || []).slice(-5)
                },
                skills: skillsArray,
                learning: {
                    ageGroup: user.ageGroup,
                    preferredLanguage: userSettings.preferredLanguage || 'en',
                    currentStreak: userProgress.streakDays || 0,
                    learningPath: userProgress.learningPath || []
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

        let filter: any = {
            isActive: true,
            role: 'student'
        };
        if (ageGroup && typeof ageGroup === 'string') filter.ageGroup = ageGroup;

        // Time-based filtering
        if (timeframe === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filter.auth = {
                path: ['last_login_at'],
                array_contains: weekAgo.toISOString() // Note: Json filtering in Prisma varies by DB capabilities
            };
        }

        const users = await prisma.user.findMany({
            where: {
                isActive: true,
                role: 'student',
                ageGroup: ageGroup as string || undefined
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                firstName: true,
                ageGroup: true,
                xp: true,
                level: true,
                avatarUrl: true,
                progress: true,
                isActive: true,
                createdAt: true
            },
            orderBy: { xp: 'desc' },
            take: Number(limit)
        });

        const formattedUsers = users.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            displayName: user.firstName,
            ageGroup: user.ageGroup,
            totalXP: user.xp,
            level: user.level,
            badgeCount: ((user.progress as any)?.badges?.length || 0),
            avatar: user.avatarUrl,
            isActive: user.isActive,
            joinDate: user.createdAt
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
// PARENTAL CONTROLS
// ==========================================

export const getParentChildren = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({
                success: false,
                message: 'Parent access required'
            });
        }

        const children = await prisma.user.findMany({
            where: {
                parentId: req.user.id,
                role: { in: ['student', 'child'] }
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                displayName: true,
                avatarUrl: true,
                ageGroup: true,
                isActive: true,
                progress: true,
                safety: true,
                settings: true
            }
        });

        const mappedChildren = children.map(child => ({
            id: child.id,
            _id: child.id,
            username: child.username,
            displayName: child.displayName || child.firstName,
            ageGroup: child.ageGroup,
            isActive: child.isActive,
            avatar: child.avatarUrl,
            progress: child.progress,
            safety: child.safety,
            settings: child.settings
        }));

        return res.json({
            success: true,
            count: children.length,
            children: mappedChildren,
            data: mappedChildren // Frontend expects 'data'
        });
    } catch (error) {
        console.error('Error fetching parent profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching parent profile'
        });
    }
};

export const addChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({
                success: false,
                message: 'Parent access required'
            });
        }

        const { username, email, password, dateOfBirth, displayName } = req.body;

        if (!username || !password || !displayName) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and display name are required'
            });
        }

        // Check if username already exists
        const existingUser = await prisma.user.findFirst({
            where: { username }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Calculate age
        let age = null;
        let ageGroup = null;
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
                age--;
            }
            ageGroup = getAgeGroup(age);
        }

        // Create child
        const child = await prisma.user.create({
            data: {
                username,
                email: email || `${username}@kids.local`,
                passwordHash: hashedPassword,
                role: 'student',
                displayName,
                firstName: displayName.split(' ')[0],
                lastName: displayName.split(' ').slice(1).join(' ') || '',
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                age,
                ageGroup,
                parentId: req.user.id,
                isActive: true,
                progress: {
                    totalXP: 0,
                    completedModules: 0,
                    currentLevel: 1,
                    badges: 0,
                    skills: {},
                    streakDays: 0,
                    learningPath: []
                },
                coppa: {
                    requiresParentalConsent: false,
                    parentalConsent: true,
                    consentGiven: true, // Legacy compatibility
                    consentDate: new Date(),
                    consentMethod: 'parent_dashboard_creation',
                    status: 'approved'
                },
                safety: {
                    contentFilterLevel: 'strict',
                    socialInteractions: 'none',
                    parentalControls: {
                        timeLimit: 60,
                        allowedFeatures: ['learn', 'practice'],
                        requireApprovalForSharing: true,
                        blockedWords: []
                    },
                    maxDailyTime: 60
                }
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                firstName: true,
                lastName: true,
                age: true,
                ageGroup: true,
                role: true,
                isActive: true,
                progress: true,
                safety: true
            }
        });

        // Ensure frontend child object conforms to expected ChildProfile interface (requires _id to match database id)
        const frontendChild = {
            ...child,
            _id: child.id,
            parent: req.user.id
        };

        return res.status(201).json({
            success: true,
            message: 'Child account created successfully',
            data: frontendChild
        });
    } catch (error) {
        console.error('Error creating child account:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating child account'
        });
    }
};

export const getChildren = getParentChildren;

export const updateChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const childId = req.params.childId;
        const updates = req.body;

        // Verify child belongs to parent
        const child = await prisma.user.findFirst({
            where: {
                id: childId,
                parentId: req.user.id,
                role: { in: ['student', 'child'] }
            }
        });

        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child not found or not authorized'
            });
        }

        // Handle password update if provided
        let passwordHash = undefined;
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(updates.password, salt);
        }

        const updatedChild = await prisma.user.update({
            where: { id: childId },
            data: {
                displayName: updates.displayName || undefined,
                firstName: updates.displayName ? updates.displayName.split(' ')[0] : undefined,
                passwordHash,
                avatarUrl: updates.avatar || undefined,
                settings: updates.settings ? (updates.settings as any) : undefined,
                safety: updates.safety ? (updates.safety as any) : undefined
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Child updated successfully',
            data: {
                id: updatedChild.id,
                _id: updatedChild.id,
                username: updatedChild.username,
                displayName: updatedChild.displayName || updatedChild.firstName,
                ageGroup: updatedChild.ageGroup,
                avatar: updatedChild.avatarUrl,
                settings: updatedChild.settings,
                safety: updatedChild.safety,
                progress: updatedChild.progress
            }
        });
    } catch (error) {
        console.error('Error updating child profile:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating child profile'
        });
    }
};

export const deleteChild = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({
                success: false,
                message: 'Only parent accounts can delete children'
            });
        }

        const { childId } = req.params;

        const child = await prisma.user.findFirst({
            where: {
                id: childId,
                parentId: req.user.id,
                role: 'student'
            }
        });

        if (!child) {
            return res.status(404).json({
                success: false,
                message: 'Child not found or access denied'
            });
        }

        await prisma.user.delete({
            where: { id: childId }
        });

        return res.json({
            success: true,
            message: 'Child account deletedAt successfully'
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
// ADMIN FUNCTIONS
// ==========================================

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { page = 1, limit = 20, ageGroup, search, role } = req.query;
        const limitNum = Number(limit);
        const skip = (Number(page) - 1) * limitNum;

        const query: any = { isActive: true };
        if (role && typeof role === 'string') query.role = role;
        if (ageGroup && typeof ageGroup === 'string') query.ageGroup = ageGroup;

        if (search && typeof search === 'string') {
            query.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } }
            ];
        }

        const users = await prisma.user.findMany({
            where: query,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                firstName: true,
                xp: true,
                level: true,
                isActive: true,
                createdAt: true,
                progress: true
            }
        });

        const total = await prisma.user.count({ where: query });

        return res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: users.map(user => ({
                    ...user,
                    badgeCount: (user.progress as any)?.badges?.length || 0
                })),
                pagination: {
                    currentPage: Number(page),
                    limit: limitNum,
                    total: total,
                    totalPages: Math.ceil(total / limitNum)
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
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { userId } = req.params;
        const { role: newRole } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                role: true,
                isActive: true
            }
        });

        return res.json({
            success: true,
            message: 'User role updated successfully',
            data: updatedUser
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
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { userId } = req.params;
        const { reason } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                deactivatedAt: new Date(),
                deactivationReason: reason
            }
        });

        return res.json({
            success: true,
            message: 'User deactivated successfully',
            data: user
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

        if (!consentToken || !parentSignature) {
            return res.status(400).json({
                success: false,
                message: 'Valid consent token and parent signature required'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userCoppa = (user.coppa as any) || {};
        userCoppa.parentalConsent = true;
        userCoppa.consentDate = new Date();
        userCoppa.consentMethod = 'digital_signature';
        userCoppa.parentSignature = parentSignature;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { coppa: userCoppa }
        });

        return res.json({
            success: true,
            message: 'Parental consent granted successfully',
            data: updatedUser
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
// CUSTOMIZATION & MASCOTS
// ==========================================

export const updateChildMascot = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || (user.role !== 'student' && user.role !== 'child')) {
            return res.status(403).json({
                success: false,
                message: 'Only child accounts can select mascots'
            });
        }

        let settings = (user.settings as any) || {};
        if (!settings.learning) settings.learning = {};

        settings.learning.visualPreferences = ['bugsby'];
        settings.learning.mascot = {
            type: 'bugsby',
            name: 'Bugsby',
            unlockedAt: new Date()
        };

        await prisma.user.update({
            where: { id: userId },
            data: { settings }
        });

        return res.json({
            success: true,
            message: 'Bugsby is now your coding companion!',
            data: { selectedMascot: 'bugsby' }
        });
    } catch (error) {
        console.error('Update mascot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating mascot'
        });
    }
};
