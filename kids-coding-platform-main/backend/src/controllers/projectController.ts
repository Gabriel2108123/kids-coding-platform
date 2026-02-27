import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../types/express';
import { calculateXP } from '../services/xpCalculator';

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
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
            isPublished = false
        } = req.body;

        if (!title || !category || !difficulty) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);

        const project = await prisma.project.create({
            data: {
                title,
                slug,
                description,
                category,
                difficulty,
                creatorId: req.user.id,
                creatorName: user.username,
                code,
                assets: assets as any,
                isPublished: isPublished,
                tags: tags || [],
                ageGroups: targetAgeGroup ? [targetAgeGroup] : (user.ageGroup ? [user.ageGroup] : [])
            }
        });

        // Award XP
        const xpResult = calculateXP('project_creation', {
            difficulty: difficulty,
            ageGroup: user.ageGroup || 'beginner'
        });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                xp: { increment: xpResult.xp },
                level: Math.floor(((user.xp || 0) + xpResult.xp) / 100) + 1
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project, xpGained: xpResult.xp }
        });
    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create project' });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        const {
            category,
            difficulty,
            ageGroup,
            search,
            userId,
            featured
        } = req.query;

        const where: any = { isPublished: true, deletedAt: null };
        if (category) where.category = category as string;
        if (difficulty) where.difficulty = difficulty as string;
        if (ageGroup) where.ageGroups = { has: ageGroup as string };
        if (userId) where.creatorId = userId as string;
        if (featured === 'true') where.isFeatured = true;

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const projects = await prisma.project.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        avatarUrl: true
                    }
                }
            }
        });

        return res.json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve projects' });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        avatarUrl: true
                    }
                },
                remixParent: {
                    select: { id: true, title: true }
                }
            }
        });

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        // Increment views
        await prisma.project.update({
            where: { id: projectId },
            data: { viewsCount: { increment: 1 } }
        });

        return res.json({ success: true, data: project });
    } catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve project' });
    }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const updates = req.body;

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (project.creatorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title: updates.title,
                description: updates.description,
                category: updates.category,
                difficulty: updates.difficulty,
                code: updates.code,
                assets: updates.assets ? (updates.assets as any) : undefined,
                isPublished: updates.isPublished,
                tags: updates.tags,
                updatedAt: new Date()
            }
        });

        return res.json({ success: true, message: 'Project updated successfully', data: updatedProject });
    } catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update project' });
    }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        if (project.creatorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: new Date(), isPublished: false }
        });

        return res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
};

export const likeProject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        await prisma.project.update({
            where: { id: projectId },
            data: { likesCount: { increment: 1 } }
        });
        return res.json({ success: true, message: 'Project liked' });
    } catch (error) {
        console.error('Like error:', error);
        return res.status(500).json({ success: false, message: 'Error liking project' });
    }
};

export const unlikeProject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        await prisma.project.update({
            where: { id: projectId },
            data: { likesCount: { decrement: 1 } }
        });
        return res.json({ success: true, message: 'Project unliked' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error unliking project' });
    }
};

export const remixProject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const { title } = req.body;

        const original = await prisma.project.findUnique({ where: { id: projectId } });
        if (!original) return res.status(404).json({ success: false, message: 'Original project not found' });

        const slug = (title || original.title + ' remix').toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);

        const remix = await prisma.project.create({
            data: {
                title: title || original.title + ' (Remix)',
                slug,
                description: `Remix of ${original.title}`,
                category: original.category,
                difficulty: original.difficulty,
                creatorId: req.user.id,
                code: original.code,
                assets: original.assets as any,
                remixParentId: original.id,
                isPublished: false
            }
        });

        await prisma.project.update({
            where: { id: projectId },
            data: { remixCount: { increment: 1 } }
        });

        return res.status(201).json({ success: true, message: 'Project remixed', data: remix });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error remixing project' });
    }
};

export const getFeaturedProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            where: { isFeatured: true, isPublished: true, deletedAt: null },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { creator: { select: { username: true, avatarUrl: true } } }
        });
        return res.json({ success: true, data: projects });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching featured projects' });
    }
};

// Add placeholders for remaining routes to avoid crashes
export const getTrendingProjects = getFeaturedProjects;
export const getProjectsByCategory = getProjects;
export const getProjectsByUser = getProjects;
export const searchProjects = getProjects;
export const forkProject = remixProject;
export const getProjectVersions = async (_req: any, res: any) => res.json({ success: true, data: [] });
export const getSharedProjects = getProjects;
export const getProjectsByDifficulty = getProjects;
export const getRecommendedProjects = getFeaturedProjects;
export const getProjectAnalytics = async (_req: any, res: any) => res.json({ success: true, data: {} });
export const getUserProjects = getProjects;
export const getPopularProjects = getFeaturedProjects;
export const shareProject = async (req: any, res: any) => res.json({ success: true, message: 'Project shared' });

export default {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    likeProject,
    unlikeProject,
    remixProject,
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
    getPopularProjects,
    shareProject
};
