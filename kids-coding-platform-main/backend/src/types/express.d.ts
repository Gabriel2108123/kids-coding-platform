import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { IUser } from '../models/User';
import { IBadge } from '../models/Badge';
import { IChallenge } from '../models/Challenge';
import { IModule } from '../models/Module';
import { IProject } from '../models/Project';

declare global {
    namespace Express {
        interface Request {
            // User authentication
            user?: IUser;
            userId?: string;
            
            // Pagination parameters (commonly used across controllers)
            pagination?: {
                page: number;
                limit: number;
                skip: number;
            };
            
            // Search and filtering parameters
            filters?: {
                difficulty?: 'beginner' | 'intermediate' | 'advanced';
                ageGroup?: '4-7' | '8-10' | '11-15';
                category?: string;
                tags?: string[];
                dateRange?: {
                    start: Date;
                    end: Date;
                };
            };
            
            // File upload information (for project assets, profile pictures, etc.)
            files?: {
                [fieldname: string]: Express.Multer.File[] | Express.Multer.File;
            };
            
            // Request context for analytics and logging
            context?: {
                requestId: string;
                userAgent: string;
                ipAddress: string;
                timestamp: Date;
                route: string;
                method: string;
            };
            
            // Validation results
            validationErrors?: Array<{
                field: string;
                message: string;
                value?: any;
            }>;

            // Rate limiting information
            rateLimit?: {
                remaining: number;
                resetTime: Date;
                limit: number;
            };
            
            // Feature flags for A/B testing or gradual rollouts
            features?: {
                [key: string]: boolean;
            };
            
            // Cached data to avoid repeated database queries
            cache?: {
                user?: IUser;
                userBadges?: IBadge[];
                userProjects?: IProject[];
                enrolledModules?: IModule[];
                completedChallenges?: IChallenge[];
            };
        }
        
        interface Response {
            // Standard API response format
            apiResponse?: (data: any, message?: string, statusCode?: number) => ExpressResponse;
            
            // Error response format
            apiError?: (error: string | Error, statusCode?: number, details?: any) => ExpressResponse;
            
            // Pagination response helper
            paginatedResponse?: (
                data: any[], 
                total: number, 
                page: number, 
                limit: number,
                message?: string
            ) => ExpressResponse;
            
            // XP calculation response helper
            xpResponse?: (
                xpData: {
                    xp: number;
                    breakdown: string[];
                    level?: number;
                    levelProgress?: number;
                },
                message?: string
            ) => ExpressResponse;
        }
    }
}

// Additional type definitions for common request/response patterns
export interface AuthenticatedRequest extends ExpressRequest {
    user: IUser; // Non-optional user for authenticated routes
    userId: string;
}

export interface PaginatedRequest extends ExpressRequest {
    pagination: {
        page: number;
        limit: number;
        skip: number;
    };
}

export interface FilteredRequest extends ExpressRequest {
    filters: {
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        ageGroup?: '4-7' | '8-10' | '11-15';
        category?: string;
        tags?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
    };
}

// API Response types for consistency
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
    requestId?: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface ErrorResponse extends ApiResponse {
    error: {
        message: string;
        code?: string;
        details?: any;
        stack?: string; // Only in development
    };
}

export interface XPResponse extends ApiResponse {
    data: {
        xp: number;
        breakdown: string[];
        level?: number;
        levelProgress?: number;
        totalXP?: number;
        nextLevelXP?: number;
    };
}

// Challenge-specific response types
export interface ChallengeResponse extends ApiResponse {
    data: {
        challenge: IChallenge;
        userProgress?: {
            attempts: number;
            bestScore: number;
            completionTime?: number;
            completed: boolean;
        };
        leaderboard?: Array<{
            userId: string;
            username: string;
            score: number;
            completionTime: number;
            rank: number;
        }>;
    };
}

// Project-specific response types
export interface ProjectResponse extends ApiResponse {
    data: {
        project: IProject;
        permissions?: {
            canEdit: boolean;
            canDelete: boolean;
            canFork: boolean;
            canModerate: boolean;
        };
        metrics?: {
            views: number;
            likes: number;
            forks: number;
            comments: number;
        };
    };
}

// Module-specific response types
export interface ModuleResponse extends ApiResponse {
    data: {
        module: IModule;
        progress?: {
            lessonsCompleted: number;
            totalLessons: number;
            percentComplete: number;
            estimatedTimeRemaining: number;
        };
        nextLesson?: {
            id: string;
            title: string;
            difficulty: string;
        };
    };
}

// Badge-specific response types
export interface BadgeResponse extends ApiResponse {
    data: {
        badge: IBadge;
        progress?: {
            current: number;
            required: number;
            percentComplete: number;
        };
        earnedAt?: Date;
        nextBadges?: IBadge[];
    };
}
