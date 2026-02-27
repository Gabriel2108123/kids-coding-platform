// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

interface DecodedToken {
    userId: string;
    role: string;
    ageGroup: string;
    requiresParentalConsent: boolean;
    iat?: number;
    exp?: number;
}

// ==========================================
// CORE AUTHENTICATION MIDDLEWARE
// ==========================================

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header or cookie
        let token = req.header('Authorization')?.replace('Bearer ', '');

        // Fallback to cookie for browser requests
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_change_in_production'
        ) as DecodedToken;

        // Check if user exists and is active
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        const userCoppa = (user.coppa as any) || {};
        const userSafety = (user.safety as any) || {};
        const userProgress = (user.progress as any) || {};

        // COPPA compliance checks for users under 13
        if (userCoppa.requiresParentalConsent && !userCoppa.parentalConsent) {
            // Allow access only to consent-related endpoints
            const allowedPaths = [
                '/api/users/parental-consent',
                '/api/users/profile',
                '/api/auth/logout'
            ];

            if (!allowedPaths.some(path => req.path.includes(path))) {
                return res.status(403).json({
                    success: false,
                    message: 'Parental consent required to access this feature',
                    code: 'PARENTAL_CONSENT_REQUIRED',
                    data: {
                        requiresParentalConsent: true,
                        parentEmail: userCoppa.parentEmail
                    }
                });
            }
        }

        // Check for suspended/banned users
        if (userSafety.isSuspended) {
            const suspensionEnd = userSafety.suspensionEnd;
            if (!suspensionEnd || suspensionEnd > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is temporarily suspended',
                    code: 'ACCOUNT_SUSPENDED',
                    data: {
                        suspensionEnd: suspensionEnd,
                        reason: userSafety.suspensionReason
                    }
                });
            } else {
                // Suspension expired, clear it
                userSafety.isSuspended = false;
                userSafety.suspensionEnd = undefined;
                userSafety.suspensionReason = undefined;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { safety: userSafety }
                });
            }
        }

        // Update last activity for active users
        const now = new Date();
        const lastActivity = userProgress.lastActiveDate ? new Date(userProgress.lastActiveDate) : new Date(0);
        const timeDiff = now.getTime() - lastActivity.getTime();

        // Update if more than 5 minutes have passed
        if (timeDiff > 5 * 60 * 1000) {
            userProgress.lastActiveDate = now;
            await prisma.user.update({
                where: { id: user.id },
                data: { progress: userProgress }
            });
        }

        // Add user and decoded token info to request
        // @ts-ignore - Express type augmentation will handle this
        req.user = user;
        // @ts-ignore - Express type augmentation will handle this  
        req.token = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
                code: 'INVALID_TOKEN'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            code: 'AUTH_ERROR'
        });
    }
};

// ==========================================
// ROLE-BASED ACCESS CONTROL
// ==========================================

export const requireRole = (roles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                data: {
                    requiredRoles: allowedRoles,
                    userRole: req.user.role
                }
            });
        }

        next();
    };
};

// ==========================================
// AGE-BASED ACCESS CONTROL
// ==========================================

export const requireAgeGroup = (ageGroups: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const allowedAgeGroups = Array.isArray(ageGroups) ? ageGroups : [ageGroups];

        if (!allowedAgeGroups.includes(req.user.ageGroup)) {
            return res.status(403).json({
                success: false,
                message: 'This feature is not available for your age group',
                code: 'AGE_RESTRICTED',
                data: {
                    requiredAgeGroups: allowedAgeGroups,
                    userAgeGroup: req.user.ageGroup
                }
            });
        }

        next();
    };
};

// ==========================================
// PARENTAL CONSENT MIDDLEWARE
// ==========================================

export const requireParentalConsent = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }

    const userCoppa = (req.user.coppa as any) || {};
    if (userCoppa.requiresParentalConsent && !userCoppa.parentalConsent) {
        return res.status(403).json({
            success: false,
            message: 'Parental consent required for this action',
            code: 'PARENTAL_CONSENT_REQUIRED',
            data: {
                parentEmail: userCoppa.parentEmail
            }
        });
    }

    next();
};

// ==========================================
// FEATURE ACCESS CONTROL
// ==========================================

export const requireFeatureAccess = (feature: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const userSafety = (req.user.safety as any) || {};
        const allowedFeatures = userSafety.parentalControls?.allowedFeatures || [];

        if (!allowedFeatures.includes(feature)) {
            return res.status(403).json({
                success: false,
                message: `Access to ${feature} feature is restricted`,
                code: 'FEATURE_RESTRICTED',
                data: {
                    requestedFeature: feature,
                    allowedFeatures
                }
            });
        }

        next();
    };
};

// ==========================================
// TIME LIMIT ENFORCEMENT
// ==========================================

export const checkTimeLimit = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }

    const userSafety = (req.user.safety as any) || {};
    const timeLimit = userSafety.parentalControls?.timeLimit;
    if (!timeLimit) {
        return next();
    }

    // Calculate time spent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userProgress = (req.user.progress as any) || {};
    const timeSpentToday = userProgress.timeSpentLearning || 0;
    const timeLimitMinutes = timeLimit * 60 * 1000; // Convert to milliseconds

    if (timeSpentToday >= timeLimitMinutes) {
        return res.status(429).json({
            success: false,
            message: 'Daily time limit reached',
            code: 'TIME_LIMIT_EXCEEDED',
            data: {
                timeLimit: timeLimit,
                timeSpentToday: Math.floor(timeSpentToday / (60 * 1000)),
                resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });
    }

    next();
};

// ==========================================
// OPTIONAL AUTHENTICATION (for public endpoints)
// ==========================================

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;

        if (token) {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'fallback_secret_change_in_production'
            ) as DecodedToken;

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (user && user.isActive) {
                // @ts-ignore - Express type augmentation will handle this
                req.user = user;
                // @ts-ignore - Express type augmentation will handle this
                req.token = decoded;
            }
        }

        next();
    } catch (error) {
        // Silently continue without authentication for optional auth
        next();
    }
};

// ==========================================
// ADMIN ONLY ACCESS
// ==========================================

export const requireAdmin = [
    authMiddleware,
    requireRole('admin')
];

// ==========================================
// INSTRUCTOR OR ADMIN ACCESS
// ==========================================

export const requireInstructorOrAdmin = [
    authMiddleware,
    requireRole(['instructor', 'admin'])
];

// ==========================================
// SAFE CONTENT ACCESS (age-appropriate)
// ==========================================

export const requireSafeContentAccess = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }

    // Check content filter level
    const userSafety = (req.user.safety as any) || {};
    const contentFilter = userSafety.contentFilter || 'moderate';

    // Add content filter info to request for use by controllers
    // @ts-ignore - Express type augmentation will handle this
    req.contentFilter = contentFilter;
    // @ts-ignore - Express type augmentation will handle this
    req.isChildUser = ((req.user.coppa as any) || {}).requiresParentalConsent;

    next();
};
