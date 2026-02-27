import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../types/express';

export const createBadge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!['admin', 'instructor'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const {
            name,
            description,
            iconUrl,
            category,
            rarity,
            requirements,
            rewards,
            ageGroups,
            isActive = true
        } = req.body;

        if (!name || !category || !rarity) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const badge = await prisma.badge.create({
            data: {
                name,
                description,
                iconUrl: iconUrl,
                category,
                rarity,
                requirements: requirements as any,
                rewards: rewards as any,
                ageGroups: ageGroups || ['all'],
                isActive: isActive,
                createdBy: req.user.id
            }
        });

        return res.status(201).json({ success: true, message: 'Badge created successfully', data: badge });
    } catch (error) {
        console.error('Create badge error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create badge' });
    }
};

export const getBadges = async (req: Request, res: Response) => {
    try {
        const {
            category,
            rarity,
            ageGroup,
            search,
            isActive = 'true'
        } = req.query;

        const where: any = { isActive: isActive === 'true' };
        if (category) where.category = category as string;
        if (rarity) where.rarity = rarity as string;
        if (ageGroup) where.ageGroups = { hasSome: [ageGroup as string, 'all'] };

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const badges = await prisma.badge.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return res.json({ success: true, count: badges.length, data: badges });
    } catch (error) {
        console.error('Get badges error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve badges' });
    }
};

export const claimBadge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { badgeId } = req.params;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
        if (!badge) return res.status(404).json({ success: false, message: 'Badge not found' });

        // Update progress JSON
        const progress = (user.progress as any) || {};
        const badges = progress.badges || [];

        if (!badges.includes(badgeId)) {
            badges.push(badgeId);
            progress.badges = badges;

            // Award XP if defined in rewards
            const rewards = (badge.rewards as any) || {};
            const xpBonus = rewards.xpBonus || 0;
            const newXP = (user.xp || 0) + xpBonus;

            await prisma.user.update({
                where: { id: userId },
                data: {
                    progress: progress as any,
                    xp: newXP,
                    level: Math.floor(newXP / 100) + 1
                }
            });

            return res.json({ success: true, message: 'Badge claimed', xpAwarded: xpBonus });
        }

        return res.json({ success: true, message: 'Badge already claimed' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to claim badge' });
    }
};

export const getUserBadges = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const progress = (user.progress as any) || {};
        const earnedBadgeIds = progress.badges || [];

        const earnedBadges = await prisma.badge.findMany({
            where: { id: { in: earnedBadgeIds } }
        });

        return res.json({ success: true, data: { earnedBadges, totalBadges: earnedBadges.length } });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve user badges' });
    }
};

export const getBadgeById = async (req: Request, res: Response) => res.json({ success: true, data: { id: req.params.badgeId } });
export const updateBadge = async (req: AuthenticatedRequest, res: Response) => res.json({ success: true });
export const deleteBadge = async (req: AuthenticatedRequest, res: Response) => res.json({ success: true });
export const awardBadge = async (req: AuthenticatedRequest, res: Response) => res.json({ success: true });
export const revokeBadge = async (req: AuthenticatedRequest, res: Response) => res.json({ success: true });
export const getBadgesByCategory = async (req: Request, res: Response) => res.json({ success: true, data: [] });
export const getBadgesByRarity = async (req: Request, res: Response) => res.json({ success: true, data: [] });
export const getBadgeStats = async (req: Request, res: Response) => res.json({ success: true, data: {} });
export const getBadgeLeaderboard = async (req: Request, res: Response) => res.json({ success: true, data: [] });

// Placeholders for secondary routes
export const checkBadgeEligibility = async (req: any, res: any) => res.json({ success: true, data: { eligible: true } });
export const getUserEarnedBadges = getUserBadges;
export const getUserAvailableBadges = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const progress = (user.progress as any) || {};
        const earnedBadgeIds = progress.badges || [];

        const availableBadges = await prisma.badge.findMany({
            where: {
                id: { notIn: earnedBadgeIds },
                isActive: true
            }
        });

        return res.json({ success: true, data: availableBadges });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error' });
    }
};
export const getUserBadgeProgress = async (req: any, res: any) => res.json({ success: true, data: [] });

export default {
    createBadge,
    getBadges,
    getBadgeById,
    updateBadge,
    deleteBadge,
    awardBadge,
    revokeBadge,
    getBadgesByCategory,
    getBadgesByRarity,
    getBadgeStats,
    getBadgeLeaderboard,
    checkBadgeEligibility,
    claimBadge,
    getUserBadges,
    getUserEarnedBadges,
    getUserAvailableBadges,
    getUserBadgeProgress
};
