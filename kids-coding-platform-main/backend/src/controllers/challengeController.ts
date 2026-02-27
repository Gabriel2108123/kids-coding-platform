import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../types/express';

export const createChallenge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const {
            title,
            description,
            difficulty,
            category,
            targetAgeGroup,
            xpReward,
            isActive = true,
            tags,
            requirements
        } = req.body;

        if (!title || !category || !difficulty) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const challenge = await prisma.challenge.create({
            data: {
                title,
                description,
                difficultyLevel: difficulty,
                category,
                xpReward: xpReward || 100,
                isActive: isActive,
                ageGroups: targetAgeGroup ? [targetAgeGroup] : ['all'],
                tags: tags || [],
                requirements: requirements as any
            }
        });

        return res.status(201).json({ success: true, message: 'Challenge created successfully', data: challenge });
    } catch (error) {
        console.error('Create challenge error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create challenge' });
    }
};

export const getChallenges = async (req: Request, res: Response) => {
    try {
        const {
            category,
            difficulty,
            ageGroup,
            search,
            isActive = 'true'
        } = req.query;

        const where: any = { isActive: isActive === 'true' };
        if (category) where.category = category as string;
        if (difficulty) where.difficultyLevel = difficulty as string;
        if (ageGroup) where.ageGroups = { hasSome: [ageGroup as string, 'all'] };

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const challenges = await prisma.challenge.findMany({
            where,
            orderBy: { orderIndex: 'asc' }
        });

        return res.json({ success: true, count: challenges.length, data: challenges });
    } catch (error) {
        console.error('Get challenges error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve challenges' });
    }
};

export const getChallengeById = async (req: Request, res: Response) => {
    try {
        const { challengeId } = req.params;
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId }
        });

        if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

        return res.json({ success: true, data: challenge });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve challenge' });
    }
};

export const updateChallenge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { challengeId } = req.params;
        const updates = req.body;

        if (!['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const challenge = await prisma.challenge.update({
            where: { id: challengeId },
            data: {
                title: updates.title,
                description: updates.description,
                difficultyLevel: updates.difficulty,
                category: updates.category,
                xpReward: updates.xpReward,
                isActive: updates.isActive,
                ageGroups: updates.ageGroups,
                tags: updates.tags,
                requirements: updates.requirements as any,
                updatedAt: new Date()
            }
        });

        return res.json({ success: true, message: 'Challenge updated successfully', data: challenge });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update challenge' });
    }
};

export const deleteChallenge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { challengeId } = req.params;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.challenge.update({
            where: { id: challengeId },
            data: { isActive: false }
        });

        return res.json({ success: true, message: 'Challenge deactivated' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to deactivate challenge' });
    }
};

export const submitChallengeAttempt = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user.id;

        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Update progress JSON
        const progress = (user.progress as any) || {};
        const completedChallenges = progress.completedChallenges || [];

        if (!completedChallenges.includes(challengeId)) {
            completedChallenges.push(challengeId);
            progress.completedChallenges = completedChallenges;

            const xpGained = challenge.xpReward || 100;
            const newXP = (user.xp || 0) + xpGained;

            await prisma.user.update({
                where: { id: userId },
                data: {
                    progress: progress as any,
                    xp: newXP,
                    level: Math.floor(newXP / 100) + 1
                }
            });

            return res.json({ success: true, message: 'Challenge completed!', xpGained });
        }

        return res.json({ success: true, message: 'Challenge already completed', xpGained: 0 });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to submit' });
    }
};

// Placeholders
export const startChallengeAttempt = async (req: any, res: any) => res.json({ success: true, message: 'Attempt started' });
export const getChallengeHint = async (req: any, res: any) => res.json({ success: true, hint: 'Try harder!' });
export const getChallengeLeaderboard = async (req: any, res: any) => res.json({ success: true, data: [] });
export const getUserChallengeProgress = async (req: any, res: any) => res.json({ success: true, data: {} });
export const getChallengesByCategory = getChallenges;
export const getChallengesByDifficulty = getChallenges;
export const getRecommendedChallenges = getChallenges;

export default {
    createChallenge,
    getChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge,
    startChallengeAttempt,
    submitChallengeAttempt,
    getChallengeHint,
    getChallengeLeaderboard,
    getUserChallengeProgress,
    getChallengesByCategory,
    getChallengesByDifficulty,
    getRecommendedChallenges
};