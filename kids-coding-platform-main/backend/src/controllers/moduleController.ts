import { Request, Response } from 'express';
import { Module, User, IModule, IUser, ILesson } from '../models';
import { AuthenticatedRequest } from '../types/express';
import { calculateXP } from '../services/xpCalculator';
import BaseController from './BaseController';

class ModuleController extends BaseController {

    // ==========================================
    // CORE MODULE OPERATIONS
    // ==========================================

    public createModule = async (req: AuthenticatedRequest, res: Response) => {
        try {
            // Only admins and instructors can create modules
            if (!this.validatePermissions(req, res, ['admin', 'instructor'])) {
                return;
            }

            const {
                title,
                description,
                difficulty,
                category,
                targetAgeGroup,
                estimatedDuration,
                prerequisites,
                learningObjectives,
                lessons,
                quizzes,
                projects,
                tags,
                isPublished = false,
                order
            } = req.body;

            // Validate required fields
            if (!this.validateRequiredFields(req, res, ['title', 'description', 'difficulty', 'category', 'targetAgeGroup'])) {
                return;
            }

            // Sanitize inputs
            const sanitizedTitle = this.sanitizeInput(title);
            const sanitizedDescription = this.sanitizeInput(description);

            // Check for duplicate module titles
            const existingModule = await Module.findOne({ title: sanitizedTitle });
            if (existingModule) {
                return this.sendError(res, 'Module with this title already exists', 400);
            }

            // Validate and sanitize lessons
            const sanitizedLessons = lessons?.map((lesson: ILesson) => ({
                ...lesson,
                title: this.sanitizeInput(lesson.title),
                content: lesson.content,
                description: this.sanitizeInput(lesson.description)
            }));

            const module = new Module({
                title: sanitizedTitle,
                description: sanitizedDescription,
                difficulty,
                category,
                targetAgeGroup,
                estimatedDuration,
                prerequisites,
                learningObjectives: learningObjectives?.map((obj: string) => this.sanitizeInput(obj)),
                lessons: sanitizedLessons,
                quizzes,
                projects,
                tags: tags?.map((tag: string) => this.sanitizeInput(tag)),
                isPublished,
                order,
                createdBy: req.user._id,
                slug: this.generateSlug(sanitizedTitle)
            });

            await module.save();

            return this.sendSuccess(res, module, 'Module created successfully', 201);

        } catch (error) {
            return this.handleError(error, res, 'createModule', 'Failed to create module');
        }
    };

    public getModules = async (req: Request, res: Response) => {
        try {
            const {
                category,
                difficulty,
                ageGroup,
                search,
                tags,
                isPublished = true,
                sortBy = 'order',
                sortOrder = 'asc'
            } = req.query;

            const { page, limit, skip } = this.parsePaginationParams(req);
            const sort = this.parseSortParams(req, sortBy as string);

            // Override sort order for modules to respect order field
            if (sortBy === 'order') {
                sort.order = sortOrder === 'desc' ? -1 : 1;
            }

            // Build filter
            let filter: Record<string, unknown> = { isPublished };

            if (category) filter.category = category;
            if (difficulty) filter.difficulty = difficulty;
            if (ageGroup) filter.targetAgeGroup = { $in: [ageGroup, 'all'] };
            if (tags) {
                const tagArray = Array.isArray(tags) ? tags : [tags];
                filter.tags = { $in: tagArray };
            }
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ];
            }

            // Apply content filters for safety
            if (req.query.ageGroup) {
                const contentFilter = this.applyContentFilter(ageGroup as string);
                filter = { ...filter, ...contentFilter };
            }

            const modules = await Module.find(filter)
                .populate('createdBy', 'username displayName')
                .populate('prerequisites', 'title difficulty order')
                .sort(sort)
                .limit(limit)
                .skip(skip);

            const total = await Module.countDocuments(filter);

            return this.sendPaginatedResponse(res, modules, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getModules', 'Failed to retrieve modules');
        }
    };

    public getModuleById = async (req: Request, res: Response) => {
        try {
            const { moduleId } = req.params;

            const module = await Module.findById(moduleId)
                .populate('createdBy', 'username displayName')
                .populate('prerequisites', 'title difficulty order')
                .populate('projects', 'title description difficulty');

            if (!module) {
                return this.sendError(res, 'Module not found', 404);
            }

            // Check if module is published or user has access
            if (!module.isPublished && req.user) {
                if (!['admin', 'instructor'].includes(req.user.role)) {
                    return this.sendError(res, 'Module not available', 403);
                }
            }

            // Get module statistics
            const stats = await this.getModuleStats(moduleId);

            // Get user progress if authenticated
            let userProgress = null;
            if (req.user) {
                userProgress = await this.getUserModuleProgress(req.user._id, moduleId);
            }

            return this.sendSuccess(res, {
                ...module.toObject(),
                stats,
                userProgress
            }, 'Module retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getModuleById', 'Failed to retrieve module');
        }
    };

    public updateModule = async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!this.validatePermissions(req, res, ['admin', 'instructor'])) {
                return;
            }

            const { moduleId } = req.params;
            const updates = req.body;

            const module = await Module.findById(moduleId);
            if (!module) {
                return this.sendError(res, 'Module not found', 404);
            }

            // Check ownership or admin privileges
            if (!this.checkResourceOwnership(req, module.createdBy.toString(), res)) {
                return;
            }

            // Allowed fields to update
            const allowedUpdates = [
                'title', 'description', 'difficulty', 'category', 'targetAgeGroup',
                'estimatedDuration', 'prerequisites', 'learningObjectives', 'lessons',
                'quizzes', 'projects', 'tags', 'isPublished', 'order'
            ];

            // Apply updates with sanitization
            Object.keys(updates).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    if (key === 'lessons' && Array.isArray(updates[key])) {
                        module[key] = updates[key].map((lesson: ILesson) => ({
                            ...lesson,
                            title: this.sanitizeInput(lesson.title),
                            content: lesson.content,
                            description: this.sanitizeInput(lesson.description)
                        }));
                    } else if (typeof updates[key] === 'string') {
                        module[key] = this.sanitizeInput(updates[key]);
                    } else {
                        module[key] = updates[key];
                    }
                }
            });

            // Update slug if title changed
            if (updates.title) {
                module.slug = this.generateSlug(updates.title);
            }

            module.updatedAt = new Date();
            await module.save();

            return this.sendSuccess(res, module, 'Module updated successfully');

        } catch (error) {
            return this.handleError(error, res, 'updateModule', 'Failed to update module');
        }
    };

    public deleteModule = async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!this.validatePermissions(req, res, ['admin'])) {
                return;
            }

            const { moduleId } = req.params;

            const module = await Module.findById(moduleId);
            if (!module) {
                return this.sendError(res, 'Module not found', 404);
            }

            // Check if module is being used as prerequisite
            const dependentModules = await Module.find({ prerequisites: moduleId });
            if (dependentModules.length > 0) {
                return this.sendError(res, 'Cannot delete module that is a prerequisite for other modules', 400);
            }

            // Soft delete - unpublish instead of removing
            module.isPublished = false;
            module.deletedAt = new Date();
            await module.save();

            return this.sendSuccess(res, { id: moduleId }, 'Module deleted successfully');

        } catch (error) {
            return this.handleError(error, res, 'deleteModule', 'Failed to delete module');
        }
    };

    // ==========================================
    // MODULE LESSONS AND CONTENT
    // ==========================================

    public getLessonContent = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { moduleId, lessonId } = req.params;

            const module = await Module.findById(moduleId);
            if (!module || !module.isPublished) {
                return this.sendError(res, 'Module not found or not available', 404);
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Check age group compatibility
            if (!this.validateAgeGroupAccess(user.ageGroup, module.targetAgeGroup, res)) {
                return;
            }

            // Check prerequisites
            if (module.prerequisites && module.prerequisites.length > 0) {
                const hasPrerequisites = module.prerequisites.every(prereq =>
                    user.progress.completedModules.some(moduleId => moduleId.toString() === prereq)
                );
                
                if (!hasPrerequisites) {
                    return this.sendError(res, 'Prerequisites not met for this module', 403);
                }
            }

            const lesson = module.lessons.find(l => l.id === lessonId);
            if (!lesson) {
                return this.sendError(res, 'Lesson not found', 404);
            }

            // Track lesson access
            await this.trackLessonAccess(req.user._id, moduleId, lessonId);

            return this.sendSuccess(res, lesson, 'Lesson content retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getLessonContent', 'Failed to retrieve lesson content');
        }
    };

    public completeLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { moduleId, lessonId } = req.params;
            const { timeSpent } = req.body;

            const module = await Module.findById(moduleId);
            if (!module) {
                return this.sendError(res, 'Module not found', 404);
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            const lesson = module.lessons.find(l => l.id === lessonId);
            if (!lesson) {
                return this.sendError(res, 'Lesson not found', 404);
            }

            // Update user progress  
            const userProgress: any = user.progress.moduleProgress.get(moduleId) || {
                startedAt: new Date(),
                completedLessons: [],
                currentLesson: 0,
                timeSpent: 0,
                completed: false
            };

            // Mark lesson as completed if not already
            if (!userProgress.completedLessons.includes(lessonId)) {
                userProgress.completedLessons.push(lessonId);
                
                // Award XP for lesson completion
                const xpResult = calculateXP('lesson_completion', { user, lesson });
                user.progress.totalXP += xpResult.xp;
                user.progress.currentLevel = Math.floor(user.progress.totalXP / 100) + 1;

                // Add achievement
                user.progress.achievements.push({
                    type: 'lesson_completed',
                    moduleId: moduleId,
                    earnedAt: new Date(),
                    description: `Completed lesson: ${lesson.title}`
                });
            }

            // Update time spent
            userProgress.timeSpent = (userProgress.timeSpent || 0) + (timeSpent || 0);

            // Check if module is completed
            const totalLessons = module.lessons.length;
            const completedLessons = userProgress.completedLessons.length;
            
            if (completedLessons >= totalLessons && !userProgress.completed) {
                userProgress.completed = true;
                userProgress.completedAt = new Date();

                // Add module to completed modules
                if (!user.progress.completedModules.some(id => id.toString() === moduleId)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    user.progress.completedModules.push(moduleId as any);
                }

                // Award module completion XP
                const moduleXPResult = calculateXP('module_completion', { user, module });
                user.progress.totalXP += moduleXPResult.xp;
                user.progress.currentLevel = Math.floor(user.progress.totalXP / 100) + 1;

                // Add module completion achievement
                user.progress.achievements.push({
                    type: 'module_completed',
                    moduleId: moduleId,
                    earnedAt: new Date(),
                    description: `Completed module: ${module.title}`
                });
            }

            // Update current lesson index
            userProgress.currentLesson = Math.max(userProgress.currentLesson, lesson.order || 0);

            // Save progress
            user.progress.moduleProgress.set(moduleId, userProgress);
            user.progress.lastActiveDate = new Date();
            await user.save();

            return this.sendSuccess(res, {
                moduleProgress: userProgress,
                xpGained: 10, // Base lesson XP
                totalXP: user.progress.totalXP,
                currentLevel: user.progress.currentLevel,
                moduleCompleted: userProgress.completed
            }, 'Lesson progress updated successfully');

        } catch (error) {
            return this.handleError(error, res, 'completeLessonProgress', 'Failed to update lesson progress');
        }
    };

    public getModuleProgress = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { moduleId } = req.params;

            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            const module = await Module.findById(moduleId);
            if (!module) {
                return this.sendError(res, 'Module not found', 404);
            }

            const userProgress: any = user.progress.moduleProgress.get(moduleId) || {
                startedAt: new Date(),
                completedLessons: [],
                currentLesson: 0,
                timeSpent: 0,
                completed: false
            };

            const progressPercentage = module.lessons.length > 0 ? 
                (userProgress.completedLessons.length / module.lessons.length) * 100 : 0;

            const detailedProgress = {
                moduleId,
                moduleTitle: module.title,
                ...userProgress,
                totalLessons: module.lessons.length,
                progressPercentage: Math.round(progressPercentage),
                estimatedTimeRemaining: module.estimatedDuration ? 
                    Math.max(0, module.estimatedDuration - (userProgress.timeSpent || 0)) : null,
                nextLesson: module.lessons.find(lesson => 
                    !userProgress.completedLessons.includes(lesson.id)
                ),
                canStart: this.canUserStartModule(user, module)
            };

            return this.sendSuccess(res, detailedProgress, 'Module progress retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getModuleProgress', 'Failed to get module progress');
        }
    };

    // ==========================================
    // MODULE DISCOVERY AND RECOMMENDATIONS
    // ==========================================

    public getModulesByCategory = async (req: Request, res: Response) => {
        try {
            const { category } = req.params;
            const { page, limit, skip } = this.parsePaginationParams(req);

            const filter = {
                category,
                isPublished: true
            };

            const modules = await Module.find(filter)
                .populate('createdBy', 'username displayName')
                .sort({ order: 1, createdAt: 1 })
                .limit(limit)
                .skip(skip);

            const total = await Module.countDocuments(filter);

            return this.sendPaginatedResponse(res, modules, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getModulesByCategory', 'Failed to get modules by category');
        }
    };

    public getModulesByDifficulty = async (req: Request, res: Response) => {
        try {
            const { difficulty } = req.params;
            const { page, limit, skip } = this.parsePaginationParams(req);

            const filter = {
                difficulty,
                isPublished: true
            };

            const modules = await Module.find(filter)
                .populate('createdBy', 'username displayName')
                .sort({ order: 1, createdAt: 1 })
                .limit(limit)
                .skip(skip);

            const total = await Module.countDocuments(filter);

            return this.sendPaginatedResponse(res, modules, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getModulesByDifficulty', 'Failed to get modules by difficulty');
        }
    };

    public getRecommendedModules = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Algorithm for recommendations based on:
            // 1. User's age group
            // 2. Completed modules
            // 3. Current skill level
            // 4. Prerequisites met

            const filter: Record<string, unknown> = {
                isPublished: true,
                targetAgeGroup: { $in: [user.ageGroup, 'all'] },
                _id: { $nin: user.progress.completedModules }
            };

            // Add difficulty filter based on user level
            const userLevel = user.progress.currentLevel;
            if (userLevel <= 3) filter.difficulty = 'beginner';
            else if (userLevel <= 7) filter.difficulty = { $in: ['beginner', 'intermediate'] };
            // Advanced users can see all difficulties

            const modules = await Module.find(filter)
                .populate('createdBy', 'username displayName')
                .populate('prerequisites', 'title')
                .sort({ order: 1 })
                .limit(10);

            // Filter modules where prerequisites are met
            const recommendedModules = modules.filter(module => 
                this.canUserStartModule(user, module)
            );

            return this.sendSuccess(res, recommendedModules, 'Recommended modules retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getRecommendedModules', 'Failed to get recommended modules');
        }
    };

    public getLearningPath = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { targetSkill } = req.query;
            
            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Build learning path based on user's current progress and target skill
            const filter: Record<string, unknown> = {
                isPublished: true,
                targetAgeGroup: { $in: [user.ageGroup, 'all'] }
            };

            if (targetSkill) {
                filter.category = targetSkill;
            }

            const allModules = await Module.find(filter)
                .populate('prerequisites', 'title order')
                .sort({ order: 1 });

            // Create learning path
            const learningPath = this.generateLearningPath(allModules, user);

            return this.sendSuccess(res, learningPath, 'Learning path generated successfully');

        } catch (error) {
            return this.handleError(error, res, 'getLearningPath', 'Failed to generate learning path');
        }
    };

    // ==========================================
    // MODULE ANALYTICS AND STATS
    // ==========================================

    public getModuleAnalytics = async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!this.validatePermissions(req, res, ['admin', 'instructor'])) {
                return;
            }

            const { moduleId } = req.params;

            const module = await Module.findById(moduleId);
            if (!module) {
                return this.sendError(res, 'Module not found', 404);
            }

            // Get comprehensive analytics
            const analytics = await this.getModuleAnalyticsData(moduleId);

            return this.sendSuccess(res, analytics, 'Module analytics retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getModuleAnalytics', 'Failed to get module analytics');
        }
    };

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private async getModuleStats(moduleId: string) {
        const enrollments = await User.countDocuments({
            [`progress.moduleProgress.${moduleId}`]: { $exists: true }
        });

        const completions = await User.countDocuments({
            'progress.completedModules': moduleId
        });

        return {
            totalEnrollments: enrollments,
            totalCompletions: completions,
            completionRate: enrollments > 0 ? (completions / enrollments) * 100 : 0
        };
    }

    private async getUserModuleProgress(userId: string, moduleId: string) {
        const user = await User.findById(userId);
        if (!user) return null;

        return user.progress.moduleProgress.get(moduleId) || {
            startedAt: null,
            completedLessons: [],
            currentLesson: 0,
            timeSpent: 0,
            completed: false
        };
    }

    private async trackLessonAccess(userId: string, moduleId: string, _lessonId: string) {
        // Track lesson access for analytics
        const user = await User.findById(userId);
        if (!user) return;

        let moduleProgress = user.progress.moduleProgress.get(moduleId) || {
            startedAt: new Date(),
            completedLessons: [],
            currentLesson: 0,
            timeSpent: 0,
            completed: false
        };

        if (!moduleProgress.startedAt) {
            moduleProgress.startedAt = new Date();
        }

        user.progress.moduleProgress.set(moduleId, moduleProgress);
        user.progress.lastActiveDate = new Date();
        await user.save();
    }

    private canUserStartModule(user: IUser, module: IModule): boolean {
        if (!module.prerequisites || module.prerequisites.length === 0) {
            return true;
        }

        return module.prerequisites.every((prereq: string) => {
            const prereqId = prereq;
            return user.progress.completedModules.some(id => id.toString() === prereqId);
        });
    }

    private generateLearningPath(modules: IModule[], user: IUser) {
        const completed = user.progress.completedModules.map((id: { toString(): string }) => id.toString());
        const available = [];
        const locked = [];

        for (const module of modules) {
            if (completed.includes(module._id.toString())) {
                continue; // Skip completed modules
            }

            if (this.canUserStartModule(user, module)) {
                available.push({
                    ...module.toObject(),
                    status: 'available',
                    canStart: true
                });
            } else {
                locked.push({
                    ...module.toObject(),
                    status: 'locked',
                    canStart: false,
                    missingPrerequisites: module.prerequisites.filter((prereq: string) =>
                        !completed.includes(prereq)
                    )
                });
            }
        }

        return {
            completedCount: completed.length,
            availableModules: available,
            lockedModules: locked,
            totalModules: modules.length,
            progressPercentage: modules.length > 0 ? 
                (completed.length / modules.length) * 100 : 0
        };
    }

    private async getModuleAnalyticsData(moduleId: string) {
        // This would include comprehensive analytics
        // For now, returning basic structure
        return {
            moduleId,
            enrollments: {
                total: 0,
                thisWeek: 0,
                thisMonth: 0
            },
            completions: {
                total: 0,
                averageTime: 0,
                completionRate: 0
            },
            engagement: {
                averageTimePerLesson: 0,
                dropOffPoints: [],
                mostPopularLessons: []
            },
            userFeedback: {
                averageRating: 0,
                totalReviews: 0,
                feedbackSummary: []
            }
        };
    }
}

// Export controller instance
export default new ModuleController();

// Export individual methods for route binding
export const {
    createModule,
    getModules,
    getModuleById,
    updateModule,
    deleteModule,
    getLessonContent,
    completeLessonProgress,
    getModuleProgress,
    getModulesByCategory,
    getModulesByDifficulty,
    getRecommendedModules,
    getLearningPath,
    getModuleAnalytics
} = new ModuleController();