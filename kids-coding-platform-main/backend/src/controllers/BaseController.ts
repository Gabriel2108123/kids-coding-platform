import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';

// Base response interface for consistent API responses
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    pagination?: PaginationInfo;
    meta?: Record<string, unknown>;
}

// Pagination interface
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Base controller class with common functionality
export abstract class BaseController {
    
    // ==========================================
    // RESPONSE HELPERS
    // ==========================================
    
    /**
     * Send successful response
     */
    protected sendSuccess<T>(
        res: Response, 
        data: T, 
        message: string = 'Success', 
        statusCode: number = 200,
        meta?: Record<string, unknown>
    ): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
            ...(meta && { meta })
        };
        return res.status(statusCode).json(response);
    }
    
    /**
     * Send error response
     */
    protected sendError(
        res: Response, 
        message: string, 
        statusCode: number = 500, 
        error?: string
    ): Response {
        const response: ApiResponse = {
            success: false,
            message,
            ...(error && { error })
        };
        return res.status(statusCode).json(response);
    }
    
    /**
     * Send paginated response
     */
    protected sendPaginatedResponse<T>(
        res: Response,
        data: T[],
        total: number,
        page: number,
        limit: number,
        message: string = 'Data retrieved successfully'
    ): Response {
        const totalPages = Math.ceil(total / limit);
        const pagination: PaginationInfo = {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
        
        const response: ApiResponse<T[]> = {
            success: true,
            message,
            data,
            pagination
        };
        
        return res.status(200).json(response);
    }
    
    // ==========================================
    // VALIDATION HELPERS
    // ==========================================
    
    /**
     * Validate required fields in request body
     */
    protected validateRequiredFields(
        req: Request, 
        res: Response, 
        fields: string[]
    ): boolean {
        const missingFields = fields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            this.sendError(
                res, 
                `Missing required fields: ${missingFields.join(', ')}`, 
                400
            );
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate user permissions
     */
    protected validatePermissions(
        req: AuthenticatedRequest,
        res: Response,
        allowedRoles: string[]
    ): boolean {
        if (!allowedRoles.includes(req.user.role)) {
            this.sendError(
                res,
                'Insufficient permissions to access this resource',
                403
            );
            return false;
        }
        return true;
    }
    
    /**
     * Validate age group access for educational content
     */
    protected validateAgeGroupAccess(
        userAgeGroup: string,
        contentAgeGroup: string | string[],
        res: Response
    ): boolean {
        const allowedAgeGroups = Array.isArray(contentAgeGroup) 
            ? contentAgeGroup 
            : [contentAgeGroup];
            
        if (!allowedAgeGroups.includes(userAgeGroup) && !allowedAgeGroups.includes('all')) {
            this.sendError(
                res,
                'Content not appropriate for your age group',
                403
            );
            return false;
        }
        return true;
    }
    
    /**
     * Validate COPPA compliance for users under 13
     */
    protected validateCoppaCompliance(
        req: AuthenticatedRequest,
        res: Response,
        requiresParentalConsent: boolean = false
    ): boolean {
        const user = req.user;
        
        if (user.coppa?.requiresParentalConsent && !user.coppa?.parentalConsent) {
            if (requiresParentalConsent) {
                this.sendError(
                    res,
                    'Parental consent required for this action',
                    403
                );
                return false;
            }
        }
        
        return true;
    }
    
    // ==========================================
    // PAGINATION HELPERS
    // ==========================================
    
    /**
     * Parse pagination parameters from request
     */
    protected parsePaginationParams(req: Request): { page: number; limit: number; skip: number } {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const skip = (page - 1) * limit;
        
        return { page, limit, skip };
    }
    
    /**
     * Parse sorting parameters from request
     */
    protected parseSortParams(req: Request, defaultSort: string = 'createdAt'): Record<string, 1 | -1> {
        const sortBy = (req.query.sortBy as string) || defaultSort;
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        
        const sort: Record<string, 1 | -1> = {};
        sort[sortBy] = sortOrder;
        
        return sort;
    }
    
    // ==========================================
    // SAFETY AND MODERATION HELPERS
    // ==========================================
    
    /**
     * Apply content filter based on user settings
     */
    protected applyContentFilter(
        userAgeGroup: string,
        contentFilterLevel: string = 'moderate'
    ): Record<string, unknown> {
        const filters: Record<string, unknown> = {};
        
        // Base safety filters
        filters.isApproved = true;
        filters.isActive = true;
        
        // Age-appropriate content filtering
        if (userAgeGroup === 'early_elementary') {
            filters.contentRating = { $in: ['G', 'safe'] };
        } else if (userAgeGroup === 'late_elementary') {
            filters.contentRating = { $in: ['G', 'safe', 'educational'] };
        }
        
        // Additional filters based on content filter level
        if (contentFilterLevel === 'strict') {
            filters.moderationStatus = 'approved';
            filters.reportCount = { $lt: 1 };
        }
        
        return filters;
    }
    
    /**
     * Check user safety settings
     */
    protected checkUserSafety(
        req: AuthenticatedRequest,
        res: Response,
        action: string
    ): boolean {
        const user = req.user;
        const safetySettings = user.safety;
        
        // Check time limits for younger users
        if (user.coppa?.requiresParentalConsent && safetySettings?.parentalControls) {
            const _timeLimit = safetySettings.parentalControls.timeLimit || 60; // minutes
            const allowedFeatures = safetySettings.parentalControls.allowedFeatures || [];
            
            if (!allowedFeatures.includes(action)) {
                this.sendError(
                    res,
                    'This feature is restricted by parental controls',
                    403
                );
                return false;
            }
        }
        
        return true;
    }
    
    // ==========================================
    // ERROR HANDLING HELPERS
    // ==========================================
    
    /**
     * Handle async errors in controllers
     */
    protected asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>) {
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
    
    /**
     * Log and handle errors consistently
     */
    protected handleError(
        error: Error | unknown,
        res: Response,
        action: string,
        customMessage?: string
    ): Response {
        console.error(`Error in ${action}:`, error);
        
        // Don't expose internal errors in production
        const message = process.env.NODE_ENV === 'production' 
            ? customMessage || 'An error occurred processing your request'
            : error instanceof Error ? error.message : String(error);
            
        return this.sendError(res, message, 500);
    }
    
    // ==========================================
    // UTILITY HELPERS
    // ==========================================
    
    /**
     * Sanitize user input to prevent XSS and injection attacks
     */
    protected sanitizeInput(input: string): string {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>'"&]/g, (match) => {
                const map: Record<string, string> = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;'
                };
                return map[match];
            });
    }
    
    /**
     * Generate unique slugs for content
     */
    protected generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    
    /**
     * Check if user owns resource or has admin privileges
     */
    protected checkResourceOwnership(
        req: AuthenticatedRequest,
        resourceOwnerId: string,
        res: Response
    ): boolean {
        const isOwner = req.user._id.toString() === resourceOwnerId.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            this.sendError(
                res,
                'You do not have permission to access this resource',
                403
            );
            return false;
        }
        
        return true;
    }
    
    /**
     * Apply privacy filters based on user settings
     */
    protected applyPrivacyFilter(
        currentUserId: string,
        targetUserId: string,
        privacySettings: { showProgress?: boolean } | null
    ): boolean {
        // If viewing own content, always allow
        if (currentUserId === targetUserId) {
            return true;
        }
        
        // Check privacy settings
        return privacySettings?.showProgress !== false;
    }
    
    /**
     * Calculate age from date of birth
     */
    protected calculateAge(dateOfBirth: Date): number {
        const today = new Date();
        let age = today.getFullYear() - dateOfBirth.getFullYear();
        const monthDifference = today.getMonth() - dateOfBirth.getMonth();
        
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
            age--;
        }
        
        return age;
    }
    
    /**
     * Determine age group from age
     */
    protected determineAgeGroup(age: number): string {
        if (age >= 4 && age <= 6) return 'early_elementary';
        else if (age >= 7 && age <= 9) return 'late_elementary';
        else if (age >= 10 && age <= 12) return 'middle_school';
        else if (age >= 13 && age <= 15) return 'early_teen';
        else return 'unknown';
    }
    
    // ==========================================
    // EDUCATIONAL PLATFORM SPECIFIC HELPERS
    // ==========================================
    
    /**
     * Check if content is appropriate for user's learning level
     */
    protected checkLearningLevel(
        userLevel: number,
        contentDifficulty: string,
        res: Response
    ): boolean {
        const difficultyMap = {
            'beginner': 1,
            'intermediate': 3,
            'advanced': 6
        };
        
        const requiredLevel = difficultyMap[contentDifficulty as keyof typeof difficultyMap] || 1;
        
        if (userLevel < requiredLevel) {
            this.sendError(
                res,
                'Your current level is too low for this content. Keep learning to unlock it!',
                403
            );
            return false;
        }
        
        return true;
    }
    
    /**
     * Apply gamification rewards
     */
    protected calculateRewards(
        action: string,
        difficulty: string,
        userAge: number
    ): { xp: number; badges?: string[] } {
        const baseXP = {
            'complete_lesson': 10,
            'complete_challenge': 20,
            'complete_project': 30,
            'help_peer': 15,
            'create_content': 25
        };
        
        const difficultyMultiplier = {
            'beginner': 1,
            'intermediate': 1.5,
            'advanced': 2
        };
        
        // Age-based XP bonus for encouragement
        const ageBonus = userAge <= 8 ? 1.2 : 1;
        
        const xp = Math.round(
            (baseXP[action as keyof typeof baseXP] || 5) * 
            (difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1) * 
            ageBonus
        );
        
        return { xp };
    }
    
    /**
     * Filter content by educational standards
     */
    protected applyEducationalStandards(userAgeGroup: string): Record<string, unknown> {
        const standards: Record<string, unknown> = {};
        
        switch (userAgeGroup) {
            case 'early_elementary':
                standards.concepts = { $in: ['basic_logic', 'sequences', 'patterns'] };
                break;
            case 'late_elementary':
                standards.concepts = { $in: ['loops', 'conditionals', 'basic_functions'] };
                break;
            case 'middle_school':
                standards.concepts = { $in: ['variables', 'algorithms', 'data_structures'] };
                break;
            case 'early_teen':
                standards.concepts = { $in: ['object_oriented', 'web_development', 'databases'] };
                break;
        }
        
        return standards;
    }
}

// Export default base controller
export default BaseController;