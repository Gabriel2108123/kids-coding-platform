import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../types/express';

export const createModule = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
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

        if (!title || !category || !difficulty) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);

        const module = await prisma.module.create({
            data: {
                title,
                slug,
                description,
                difficulty,
                category,
                targetAgeGroup: targetAgeGroup,
                estimatedDuration: estimatedDuration,
                orderIndex: order || 0,
                isActive: isPublished,
                prerequisites: prerequisites || [],
                learningObjectives: learningObjectives || [],
                quizzes: quizzes as any,
                projects: projects as any,
                tags: tags || []
            }
        });

        // If lessons are provided, create them
        if (lessons && Array.isArray(lessons)) {
            for (const lesson of lessons) {
                await prisma.lesson.create({
                    data: {
                        moduleId: module.id,
                        title: lesson.title,
                        description: lesson.description,
                        content: lesson.content,
                        orderIndex: lesson.order || 0,
                        xpReward: lesson.xpReward || 50,
                        estimatedDuration: lesson.duration || 10
                    }
                });
            }
        }

        return res.status(201).json({ success: true, message: 'Module created successfully', data: module });
    } catch (error) {
        console.error('Create module error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create module' });
    }
};

export const getModules = async (req: Request, res: Response) => {
    try {
        const {
            category,
            difficulty,
            ageGroup,
            search,
            tags
        } = req.query;

        const where: any = { isActive: true };
        if (category) where.category = category as string;
        if (difficulty) where.difficulty = difficulty as string;
        if (ageGroup) where.targetAgeGroup = { in: [ageGroup as string, 'all'] };
        if (tags) where.tags = { hasSome: Array.isArray(tags) ? tags : [tags] };

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const modules = await prisma.module.findMany({
            where,
            orderBy: { orderIndex: 'asc' },
            include: { lessons: true }
        });

        return res.json({ success: true, count: modules.length, data: modules });
    } catch (error) {
        console.error('Get modules error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve modules' });
    }
};

export const getModuleById = async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params;
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { lessons: { orderBy: { orderIndex: 'asc' } } }
        });

        if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

        return res.json({ success: true, data: module });
    } catch (error) {
        console.error('Get module error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve module' });
    }
};

export const updateModule = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moduleId } = req.params;
        const updates = req.body;

        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const module = await prisma.module.update({
            where: { id: moduleId },
            data: {
                title: updates.title,
                description: updates.description,
                difficulty: updates.difficulty,
                category: updates.category,
                targetAgeGroup: updates.targetAgeGroup,
                estimatedDuration: updates.estimatedDuration,
                orderIndex: updates.order,
                isActive: updates.isPublished,
                prerequisites: updates.prerequisites,
                learningObjectives: updates.learningObjectives,
                quizzes: updates.quizzes as any,
                projects: updates.projects as any,
                tags: updates.tags,
                updatedAt: new Date()
            }
        });

        return res.json({ success: true, message: 'Module updated successfully', data: module });
    } catch (error) {
        console.error('Update module error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update module' });
    }
};

export const deleteModule = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moduleId } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.module.update({
            where: { id: moduleId },
            data: { isActive: false }
        });

        return res.json({ success: true, message: 'Module deactivated successfully' });
    } catch (error) {
        console.error('Delete module error:', error);
        return res.status(500).json({ success: false, message: 'Failed to deactivate module' });
    }
};

export const getLessonContent = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });

        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

        return res.json({ success: true, data: lesson });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve lesson content' });
    }
};

export const completeLessonProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.id;

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });

        if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Update progress in JSON
        const progress = (user.progress as any) || {};
        const completedLessons = progress.completedLessons || [];

        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
            progress.completedLessons = completedLessons;

            // Award XP
            const xpGained = lesson.xpReward || 50;
            const newXP = (user.xp || 0) + xpGained;
            const newLevel = Math.floor(newXP / 100) + 1;

            await prisma.user.update({
                where: { id: userId },
                data: {
                    progress: progress as any,
                    xp: newXP,
                    level: newLevel
                }
            });

            return res.json({ success: true, message: 'Lesson completed', xpGained });
        }

        return res.json({ success: true, message: 'Lesson already completed', xpGained: 0 });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update progress' });
    }
};

export const getModuleProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { lessons: true }
        });
        if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

        const progress = (user.progress as any) || {};
        const completedLessons = progress.completedLessons || [];
        const moduleLessons = module.lessons.map(l => l.id);
        const completedCount = moduleLessons.filter(id => completedLessons.includes(id)).length;

        return res.json({
            success: true,
            data: {
                moduleId,
                totalLessons: moduleLessons.length,
                completedLessons: completedCount,
                percentComplete: moduleLessons.length > 0 ? (completedCount / moduleLessons.length) * 100 : 0
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get progress' });
    }
};

export const getModulesByCategory = getModules;
export const getModulesByDifficulty = getModules;
export const getRecommendedModules = getModules;
export const getLearningPath = async (_req: any, res: any) => res.json({ success: true, data: [] });
export const getModuleAnalytics = async (_req: any, res: any) => res.json({ success: true, data: {} });

export default {
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
};