// @ts-nocheck
import { Request, Response } from 'express';
import { Project, User } from '../models';
import { AuthenticatedRequest } from '../types/express';
import { calculateXP } from '../services/xpCalculator';
import { BaseController } from './BaseController';

export class ProjectController extends BaseController {
    // Basic project controller with placeholder methods
    
    public createProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Project creation not fully implemented', 501);
    };

    public getProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get projects not fully implemented', 501);
    };

    public getProjectById = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get project by ID not fully implemented', 501);
    };

    public updateProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Update project not fully implemented', 501);
    };

    public deleteProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Delete project not fully implemented', 501);
    };

    public likeProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Like project not fully implemented', 501);
    };

    public unlikeProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Unlike project not fully implemented', 501);
    };

    public remixProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Remix project not fully implemented', 501);
    };

    public shareProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Share project not fully implemented', 501);
    };

    public getFeaturedProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get featured projects not fully implemented', 501);
    };

    public getTrendingProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get trending projects not fully implemented', 501);
    };

    public getProjectsByCategory = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get projects by category not fully implemented', 501);
    };

    public getProjectsByUser = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get projects by user not fully implemented', 501);
    };

    public searchProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Search projects not fully implemented', 501);
    };

    public forkProject = async (req: AuthenticatedRequest, res: Response) => {
        return this.sendError(res, 'Fork project not fully implemented', 501);
    };

    public getProjectVersions = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get project versions not fully implemented', 501);
    };

    public getSharedProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get shared projects not fully implemented', 501);
    };

    public getProjectsByDifficulty = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get projects by difficulty not fully implemented', 501);
    };

    public getRecommendedProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get recommended projects not fully implemented', 501);
    };

    public getProjectAnalytics = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get project analytics not fully implemented', 501);
    };

    public getUserProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get user projects not fully implemented', 501);
    };

    public getPopularProjects = async (req: Request, res: Response) => {
        return this.sendError(res, 'Get popular projects not fully implemented', 501);
    };

    // Override required methods from BaseController
    override protected applyContentFilter(content: any): any {
        return content;
    }

    override protected validateFileUploads(files: any): any {
        return files;
    }

    override protected sanitizeInput(input: any): any {
        return input;
    }
}

const controller = new ProjectController();

export const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    likeProject,
    unlikeProject,
    remixProject,
    shareProject,
    getFeaturedProjects,
    getTrendingProjects,
    getProjectsByCategory,
    getProjectsByUser,
    searchProjects,
    forkProject,
    getProjectVersions,
    getSharedProjects,
    getProjectsByDifficulty,
    getRecommendedProjects,
    getProjectAnalytics,
    getUserProjects,
    getPopularProjects
} = controller;

export default controller;

class ProjectController extends BaseController {

    // ==========================================
    // CORE PROJECT OPERATIONS
    // ==========================================

    public createProject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const {
                title,
                description,
                category,
                difficulty,
                targetAgeGroup,
                code,
                assets,
                tags,
                isPublished = false,
                allowRemixing = true,
                collaborators
            } = req.body;

            // Validate required fields
            if (!this.validateRequiredFields(req, res, ['title', 'description', 'category', 'difficulty'])) {
                return;
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Check safety settings for sharing/publishing
            if (!this.checkUserSafety(req, res, 'create')) {
                return;
            }

            // For users under 13, require parental approval for publishing
            if (isPublished && user.coppa?.requiresParentalConsent && 
                user.safety?.parentalControls?.requireApprovalForSharing) {
                return this.sendError(res, 'Parental approval required for publishing projects', 403);
            }

            // Sanitize inputs
            const sanitizedTitle = this.sanitizeInput(title);
            const sanitizedDescription = this.sanitizeInput(description);

            // Check for duplicate project titles by the same user
            const existingProject = await Project.findOne({ 
                title: sanitizedTitle, 
                createdBy: req.user._id 
            });
            
            if (existingProject) {
                return this.sendError(res, 'You already have a project with this title', 400);
            }

            const project = new Project({
                title: sanitizedTitle,
                description: sanitizedDescription,
                category,
                difficulty,
                targetAgeGroup: targetAgeGroup || user.ageGroup,
                code: this.sanitizeProjectCode(code),
                assets: this.validateAssets(assets),
                tags: tags?.map((tag: string) => this.sanitizeInput(tag)),
                isPublished: isPublished && this.canUserPublish(user),
                allowRemixing,
                collaborators: collaborators || [],
                createdBy: req.user._id,
                slug: this.generateSlug(sanitizedTitle),
                metrics: {
                    views: 0,
                    likes: 0,
                    remixes: 0,
                    shares: 0
                },
                moderation: {
                    status: 'pending',
                    reviewedBy: null,
                    reviewedAt: null,
                    flags: []
                }
            });

            await project.save();

            // Award XP for project creation
            const xpResult = calculateXP('project_creation', { 
                difficulty: difficulty,
                ageGroup: user.ageGroup 
            });
            user.progress.totalXP += xpResult.xp;
            user.progress.currentLevel = Math.floor(user.progress.totalXP / 100) + 1;

            // Add achievement
            user.progress.achievements.push({
                type: 'project_created',
                projectId: project._id,
                earnedAt: new Date(),
                description: `Created project: ${project.title}`
            });

            await user.save();

            return this.sendSuccess(res, {
                project,
                xpGained: xpResult.xp
            }, 'Project created successfully', 201);

        } catch (error) {
            return this.handleError(error, res, 'createProject', 'Failed to create project');
        }
    };

    public getProjects = async (req: Request, res: Response) => {
        try {
            const {
                category,
                difficulty,
                ageGroup,
                search,
                tags,
                isPublished = true,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                featured,
                userId
            } = req.query;

            const { page, limit, skip } = this.parsePaginationParams(req);
            const sort = this.parseSortParams(req, sortBy as string);

            // Build filter
            let filter: any = { 
                isPublished: isPublished === 'true',
                'moderation.status': 'approved' // Only show approved content
            };

            if (category) filter.category = category;
            if (difficulty) filter.difficulty = difficulty;
            if (ageGroup) filter.targetAgeGroup = { $in: [ageGroup, 'all'] };
            if (userId) filter.createdBy = userId;
            if (featured === 'true') filter.isFeatured = true;
            
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

            const projects = await Project.find(filter)
                .populate('createdBy', 'username displayName avatar ageGroup')
                .populate('collaborators', 'username displayName avatar')
                .sort(sort)
                .limit(limit)
                .skip(skip)
                .select('-code'); // Don't include full code in list view

            const total = await Project.countDocuments(filter);

            return this.sendPaginatedResponse(res, projects, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getProjects', 'Failed to retrieve projects');
        }
    };

    public getProjectById = async (req: Request, res: Response) => {
        try {
            const { projectId } = req.params;

            const project = await Project.findById(projectId)
                .populate('createdBy', 'username displayName avatar ageGroup')
                .populate('collaborators', 'username displayName avatar')
                .populate('remixedFrom', 'title createdBy');

            if (!project) {
                return this.sendError(res, 'Project not found', 404);
            }

            // Check if project is published or user has access
            if (!project.social.isPublic) {
                if (!req.user || 
                    (req.user._id.toString() !== project.creatorId.toString() && 
                     !['admin', 'instructor'].includes(req.user.role))) {
                    return this.sendError(res, 'Project not available', 403);
                }
            }

            // Increment view count (but not for the creator)
            if (!req.user || req.user._id.toString() !== project.creatorId.toString()) {
                project.metrics.views += 1;
                await project.save();
            }

            // Check if user has liked this project (simplified - would need separate collection in real app)
            let hasLiked = false;
            // TODO: Implement proper like tracking with separate collection

            return this.sendSuccess(res, {
                ...project.toObject(),
                hasLiked,
                canEdit: req.user ? this.canUserEditProject(req.user, project) : false,
                canRemix: project.social.allowRemixing
            }, 'Project retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getProjectById', 'Failed to retrieve project');
        }
    };

    public updateProject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { projectId } = req.params;
            const updates = req.body;

            const project = await Project.findById(projectId);
            if (!project) {
                return this.sendError(res, 'Project not found', 404);
            }

            // Check if user can edit this project
            if (!this.canUserEditProject(req.user, project)) {
                return this.sendError(res, 'You do not have permission to edit this project', 403);
            }

            // Allowed fields to update
            const allowedUpdates = [
                'title', 'description', 'category', 'difficulty', 'targetAgeGroup',
                'code', 'assets', 'tags', 'isPublished', 'allowRemixing', 'collaborators'
            ];

            // Check publishing permissions
            if (updates.isPublished && !this.canUserPublish(req.user)) {
                return this.sendError(res, 'Publishing not allowed for your account', 403);
            }

            // Apply updates with sanitization
            Object.keys(updates).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    if (key === 'title' || key === 'description') {
                        project[key] = this.sanitizeInput(updates[key]);
                    } else if (key === 'code') {
                        project[key] = this.sanitizeProjectCode(updates[key]);
                    } else if (key === 'assets') {
                        project[key] = this.validateAssets(updates[key]);
                    } else {
                        project[key] = updates[key];
                    }
                }
            });

            // Update slug if title changed
            if (updates.title) {
                project.slug = this.generateSlug(updates.title);
            }

            // Reset moderation status if content changed
            if (updates.code || updates.title || updates.description) {
                project.moderation.status = 'pending';
                project.moderation.reviewedBy = null;
                project.moderation.reviewedAt = null;
            }

            project.updatedAt = new Date();
            await project.save();

            return this.sendSuccess(res, project, 'Project updated successfully');

        } catch (error) {
            return this.handleError(error, res, 'updateProject', 'Failed to update project');
        }
    };

    public deleteProject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { projectId } = req.params;

            const project = await Project.findById(projectId);
            if (!project) {
                return this.sendError(res, 'Project not found', 404);
            }

            // Check permissions (owner or admin)
            if (!this.canUserEditProject(req.user, project) && req.user.role !== 'admin') {
                return this.sendError(res, 'You do not have permission to delete this project', 403);
            }

            // Soft delete - mark as deleted but keep for data integrity
            project.isPublished = false;
            project.deletedAt = new Date();
            project.moderation.status = 'deleted';
            await project.save();

            return this.sendSuccess(res, { id: projectId }, 'Project deleted successfully');

        } catch (error) {
            return this.handleError(error, res, 'deleteProject', 'Failed to delete project');
        }
    };

    // ==========================================
    // PROJECT INTERACTIONS
    // ==========================================

    public likeProject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { projectId } = req.params;

            const project = await Project.findById(projectId);
            if (!project) {
                return this.sendError(res, 'Project not found', 404);
            }

            // Check if user already liked this project
            const existingLike = project.likes.find(like => 
                like.userId.toString() === req.user._id.toString()
            );

            if (existingLike) {
                return this.sendError(res, 'Project already liked', 400);
            }

            // Add like
            project.likes.push({
                userId: req.user._id,
                likedAt: new Date()
            });

            project.metrics.likes += 1;
            await project.save();

            // Award XP to project creator
            const creator = await User.findById(project.createdBy);
            if (creator) {
                const xpGained = calculateXP(5, creator.age, 'project_liked');
                creator.progress.totalXP += xpGained;
                creator.progress.currentLevel = Math.floor(creator.progress.totalXP / 100) + 1;
                await creator.save();
            }

            return this.sendSuccess(res, {
                projectId,
                totalLikes: project.metrics.likes
            }, 'Project liked successfully');

        } catch (error) {
            return this.handleError(error, res, 'likeProject', 'Failed to like project');
        }
    };

    public unlikeProject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { projectId } = req.params;

            const project = await Project.findById(projectId);
            if (!project) {
                return this.sendError(res, 'Project not found', 404);
            }

            // Find and remove like
            const likeIndex = project.likes.findIndex(like => 
                like.userId.toString() === req.user._id.toString()
            );

            if (likeIndex === -1) {
                return this.sendError(res, 'Project not liked', 400);
            }

            project.likes.splice(likeIndex, 1);
            project.metrics.likes = Math.max(0, project.metrics.likes - 1);
            await project.save();

            return this.sendSuccess(res, {
                projectId,
                totalLikes: project.metrics.likes
            }, 'Project unliked successfully');

        } catch (error) {
            return this.handleError(error, res, 'unlikeProject', 'Failed to unlike project');
        }
    };

    public remixProject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { projectId } = req.params;
            const { title, description } = req.body;

            const originalProject = await Project.findById(projectId);
            if (!originalProject) {
                return this.sendError(res, 'Project not found', 404);
            }

            if (!originalProject.allowRemixing) {
                return this.sendError(res, 'This project does not allow remixing', 403);
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Check safety settings
            if (!this.checkUserSafety(req, res, 'create')) {
                return;
            }

            // Create remix
            const remixedProject = new Project({
                title: this.sanitizeInput(title || `${originalProject.title} Remix`),
                description: this.sanitizeInput(description || `Remixed from ${originalProject.title}`),
                category: originalProject.category,
                difficulty: originalProject.difficulty,
                targetAgeGroup: user.ageGroup,
                code: originalProject.code, // Copy original code
                assets: originalProject.assets, // Copy assets
                tags: [...originalProject.tags, 'remix'],
                isPublished: false, // Remixes start as drafts
                allowRemixing: true,
                remixedFrom: originalProject._id,
                createdBy: req.user._id,
                slug: this.generateSlug(title || `${originalProject.title} Remix`),
                metrics: {
                    views: 0,
                    likes: 0,
                    remixes: 0,
                    shares: 0
                },
                moderation: {
                    status: 'pending',
                    reviewedBy: null,
                    reviewedAt: null,
                    flags: []
                }
            });

            await remixedProject.save();

            // Update original project remix count
            originalProject.metrics.remixes += 1;
            await originalProject.save();

            // Award XP
            const xpGained = calculateXP(15, user.age, 'project_remix');
            user.progress.totalXP += xpGained;
            user.progress.currentLevel = Math.floor(user.progress.totalXP / 100) + 1;

            // Add achievement
            user.progress.achievements.push({
                type: 'project_remixed',
                projectId: remixedProject._id,
                earnedAt: new Date(),
                description: `Remixed project: ${originalProject.title}`
            });

            await user.save();

            return this.sendSuccess(res, {
                project: remixedProject,
                xpGained
            }, 'Project remixed successfully', 201);

        } catch (error) {
            return this.handleError(error, res, 'remixProject', 'Failed to remix project');
        }
    };

    public shareProject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { projectId } = req.params;
            const { platform, message } = req.body;

            const project = await Project.findById(projectId);
            if (!project) {
                return this.sendError(res, 'Project not found', 404);
            }

            if (!project.isPublished) {
                return this.sendError(res, 'Only published projects can be shared', 400);
            }

            // Check user permissions for sharing
            const user = await User.findById(req.user._id);
            if (user?.coppa?.requiresParentalConsent && 
                user.safety?.parentalControls?.requireApprovalForSharing) {
                return this.sendError(res, 'Parental approval required for sharing', 403);
            }

            // Log the share
            project.shares.push({
                userId: req.user._id,
                platform: platform || 'direct',
                sharedAt: new Date(),
                message: this.sanitizeInput(message || '')
            });

            project.metrics.shares += 1;
            await project.save();

            return this.sendSuccess(res, {
                projectId,
                shareUrl: `${process.env.FRONTEND_URL}/project/${project.slug}`,
                totalShares: project.metrics.shares
            }, 'Project shared successfully');

        } catch (error) {
            return this.handleError(error, res, 'shareProject', 'Failed to share project');
        }
    };

    // ==========================================
    // PROJECT DISCOVERY AND FEATURES
    // ==========================================

    public getFeaturedProjects = async (req: Request, res: Response) => {
        try {
            const { limit = 12, ageGroup } = req.query;

            let filter: any = {
                isPublished: true,
                isFeatured: true,
                'moderation.status': 'approved'
            };

            if (ageGroup) {
                filter.targetAgeGroup = { $in: [ageGroup, 'all'] };
            }

            const projects = await Project.find(filter)
                .populate('createdBy', 'username displayName avatar')
                .sort({ 'metrics.likes': -1, createdAt: -1 })
                .limit(Number(limit))
                .select('-code');

            return this.sendSuccess(res, projects, 'Featured projects retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getFeaturedProjects', 'Failed to get featured projects');
        }
    };

    public getTrendingProjects = async (req: Request, res: Response) => {
        try {
            const { limit = 12, ageGroup } = req.query;

            let filter: any = {
                isPublished: true,
                'moderation.status': 'approved',
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
            };

            if (ageGroup) {
                filter.targetAgeGroup = { $in: [ageGroup, 'all'] };
            }

            const projects = await Project.find(filter)
                .populate('createdBy', 'username displayName avatar')
                .sort({ 
                    'metrics.views': -1, 
                    'metrics.likes': -1, 
                    'metrics.remixes': -1 
                })
                .limit(Number(limit))
                .select('-code');

            return this.sendSuccess(res, projects, 'Trending projects retrieved successfully');

        } catch (error) {
            return this.handleError(error, res, 'getTrendingProjects', 'Failed to get trending projects');
        }
    };

    public getProjectsByCategory = async (req: Request, res: Response) => {
        try {
            const { category } = req.params;
            const { page, limit, skip } = this.parsePaginationParams(req);

            const filter = {
                category,
                isPublished: true,
                'moderation.status': 'approved'
            };

            const projects = await Project.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate('createdBy', 'username displayName avatar')
                .select('-code')
                .lean();

            const total = await Project.countDocuments(filter);

            return this.sendPaginatedResponse(res, projects, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getProjectsByCategory', 'Failed to get projects by category');
        }
    };

    public getProjectsByUser = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { includeUnpublished = false } = req.query;
            const { page, limit, skip } = this.parsePaginationParams(req);

            let filter: any = { createdBy: userId };

            // Only include unpublished if user is viewing their own projects or is admin
            if (!includeUnpublished || 
                (!req.user || 
                 (req.user._id.toString() !== userId && req.user.role !== 'admin'))) {
                filter.isPublished = true;
                filter['moderation.status'] = 'approved';
            }

            const projects = await Project.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate('createdBy', 'username displayName avatar')
                .select('-code')
                .lean();

            const total = await Project.countDocuments(filter);

            return this.sendPaginatedResponse(res, projects, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'getProjectsByUser', 'Failed to get user projects');
        }
    };

    public searchProjects = async (req: Request, res: Response) => {
        try {
            const { q: query, category, difficulty, ageGroup, tags } = req.query;
            const { page, limit, skip } = this.parsePaginationParams(req);

            if (!query) {
                return this.sendError(res, 'Search query is required', 400);
            }

            let filter: any = {
                isPublished: true,
                'moderation.status': 'approved',
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } }
                ]
            };

            // Apply additional filters
            if (category) filter.category = category;
            if (difficulty) filter.difficulty = difficulty;
            if (ageGroup) filter.targetAgeGroup = { $in: [ageGroup, 'all'] };
            
            if (tags) {
                const tagArray = Array.isArray(tags) ? tags : [tags];
                filter.tags = { $in: tagArray };
            }

            const projects = await Project.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ 'metrics.views': -1, createdAt: -1 })
                .populate('createdBy', 'username displayName avatar')
                .select('-code')
                .lean();

            const total = await Project.countDocuments(filter);

            return this.sendPaginatedResponse(res, projects, total, page, limit);

        } catch (error) {
            return this.handleError(error, res, 'searchProjects', 'Failed to search projects');
        }
    };

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private canUserEditProject(user: any, project: any): boolean {
        return user._id.toString() === project.createdBy.toString() || 
               ['admin', 'instructor'].includes(user.role) ||
               project.collaborators.some((collab: any) => 
                   collab.toString() === user._id.toString()
               );
    }

    private canUserPublish(user: any): boolean {
        // Check user permissions and safety settings
        if (user.coppa?.requiresParentalConsent && 
            user.safety?.parentalControls?.requireApprovalForSharing) {
            return false;
        }
        return true;
    }

    private sanitizeProjectCode(code: any): any {
        // Implement code sanitization logic
        // Remove potentially harmful scripts, validate structure
        if (typeof code === 'string') {
            return code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        return code;
    }

    private validateAssets(assets: any[]): any[] {
        if (!Array.isArray(assets)) return [];
        
        return assets.filter(asset => {
            // Validate asset format and safety
            return asset && 
                   typeof asset.url === 'string' && 
                   typeof asset.type === 'string' &&
                   ['image', 'audio', 'data'].includes(asset.type);
        });
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    private applyContentFilter(ageGroup: string): any {
        // Apply age-appropriate content filtering
        const filters: any = {};
        
        switch (ageGroup) {
            case '4-6':
                filters.difficulty = { $in: ['beginner'] };
                break;
            case '7-9':
                filters.difficulty = { $in: ['beginner', 'easy'] };
                break;
            case '10-12':
                filters.difficulty = { $in: ['beginner', 'easy', 'intermediate'] };
                break;
            case '13-15':
                // No restrictions
                break;
            default:
                break;
        }
        
        return filters;
    }

    private checkUserSafety(req: any, res: Response, action: string): boolean {
        const user = req.user;
        
        if (!user) {
            this.sendError(res, 'Authentication required', 401);
            return false;
        }

        // Check if user account is active
        if (!user.isActive) {
            this.sendError(res, 'Account is inactive', 403);
            return false;
        }

        // Check COPPA compliance for actions
        if (user.coppa?.requiresParentalConsent) {
            const safetySettings = user.safety?.parentalControls;
            
            if (action === 'create' && safetySettings?.restrictContentCreation) {
                this.sendError(res, 'Content creation restricted by parental controls', 403);
                return false;
            }
        }

        return true;
    }
}

export default new ProjectController();

// Export individual methods for route binding
export const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    shareProject,
    forkProject,
    getProjectVersions,
    getSharedProjects,
    getProjectsByCategory,
    getProjectsByDifficulty,
    getRecommendedProjects,
    getProjectAnalytics,
    getUserProjects,
    getPopularProjects,
    getFeaturedProjects,
    searchProjects
} = new ProjectController();

