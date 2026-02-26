import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Badge from '../models/Badge';
import User from '../models/User';
import { AuthenticatedRequest } from '../types/express';

// ==========================================
// BADGE MANAGEMENT (ADMIN/INSTRUCTOR)
// ==========================================

export const createBadge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Only admins and instructors can create badges
        if (!['admin', 'instructor'].includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions to create badges'
            });
            return;
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

        // Validation
        if (!name || !description || !category || !rarity) {
            res.status(400).json({
                success: false,
                message: 'Name, description, category, and rarity are required'
            });
            return;
        }

        // Check if badge with same name exists
        const existingBadge = await Badge.findOne({ name });
        if (existingBadge) {
            res.status(400).json({
                success: false,
                message: 'Badge with this name already exists'
            });
            return;
        }

        const badge = new Badge({
            name,
            description,
            iconUrl,
            category,
            rarity,
            requirements,
            rewards,
            ageGroups,
            isActive,
            createdBy: req.user._id
        });

        await badge.save();

        res.status(201).json({
            success: true,
            message: 'Badge created successfully',
            data: badge
        });
    } catch (error) {
        console.error('Create badge error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating badge'
        });
    }
};

export const getBadges = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            category,
            rarity,
            ageGroup,
            search,
            isActive = true,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter
        const filter: Record<string, unknown> = { isActive };
        
        if (category) filter.category = category;
        if (rarity) filter.rarity = rarity;
        if (ageGroup) filter.ageGroups = { $in: [ageGroup, 'all'] };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort
        const sort: Record<string, 1 | -1> = {};
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        const badges = await Badge.find(filter)
            .sort(sort)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('createdBy', 'username');

        const total = await Badge.countDocuments(filter);

        res.json({
            success: true,
            data: badges,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving badges'
        });
    }
};

export const checkBadgeEligibility = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { badgeId } = req.params;

        const badge = await Badge.findById(badgeId);
        if (!badge) {
            res.status(404).json({
                success: false,
                message: 'Badge not found'
            });
            return;
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Check if user already has this badge
        if (user.progress.badges.some(b => b.toString() === badgeId)) {
            res.json({
                success: true,
                data: {
                    eligible: false,
                    reason: 'Badge already earned',
                    progress: { current: 1, required: 1 }
                }
            });
            return;
        }

        // Check age group eligibility
        if (!badge.ageGroups.includes('all') && !badge.ageGroups.includes(user.ageGroup)) {
            res.json({
                success: true,
                data: {
                    eligible: false,
                    reason: 'Age group not eligible',
                    progress: { current: 0, required: 1 }
                }
            });
            return;
        }

        // Check requirements
        let eligible = true;
        let progress = { current: 0, required: 1 };

        switch (badge.requirements.type) {
            case 'xp':
                eligible = user.progress.totalXP >= badge.requirements.value;
                progress = {
                    current: user.progress.totalXP,
                    required: badge.requirements.value
                };
                break;
            case 'modules_completed':
                eligible = user.progress.completedModules.length >= badge.requirements.value;
                progress = {
                    current: user.progress.completedModules.length,
                    required: badge.requirements.value
                };
                break;
            case 'challenges_completed':
                eligible = user.progress.completedChallenges.length >= badge.requirements.value;
                progress = {
                    current: user.progress.completedChallenges.length,
                    required: badge.requirements.value
                };
                break;
            case 'streak_days':
                eligible = user.progress.streakDays >= badge.requirements.value;
                progress = {
                    current: user.progress.streakDays,
                    required: badge.requirements.value
                };
                break;
            default:
                eligible = false;
        }

        res.json({
            success: true,
            data: {
                eligible,
                reason: eligible ? 'Requirements met' : 'Requirements not met',
                progress
            }
        });
    } catch (error) {
        console.error('Check badge eligibility error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error checking badge eligibility'
        });
    }
};

export const claimBadge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { badgeId } = req.params;

        const badge = await Badge.findById(badgeId);
        if (!badge) {
            res.status(404).json({
                success: false,
                message: 'Badge not found'
            });
            return;
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Check if user already has this badge
        if (user.progress.badges.some(b => b.toString() === badgeId)) {
            res.status(400).json({
                success: false,
                message: 'Badge already earned'
            });
            return;
        }

        // Award the badge
        user.progress.badges.push(badgeId as unknown as mongoose.Schema.Types.ObjectId);
        
        // Add achievement record
        user.progress.achievements.push({
            type: 'badge',
            earnedAt: new Date(),
            description: `Earned ${badge.name} badge`
        });

        // Award XP if specified
        if (badge.rewards?.xpBonus) {
            user.progress.totalXP += badge.rewards.xpBonus;
            user.progress.currentLevel = Math.floor(user.progress.totalXP / 100) + 1;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Badge claimed successfully',
            data: {
                badge,
                xpAwarded: badge.rewards?.xpBonus || 0,
                newLevel: user.progress.currentLevel
            }
        });
    } catch (error) {
        console.error('Claim badge error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error claiming badge'
        });
    }
};

export const getUserBadges = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id)
            .populate('progress.badges', 'name description iconUrl category rarity rewards');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            data: {
                earnedBadges: user.progress.badges,
                totalBadges: user.progress.badges.length
            }
        });
    } catch (error) {
        console.error('Get user badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving user badges'
        });
    }
};

export const getUserEarnedBadges = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id)
            .populate('progress.badges');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            data: user.progress.badges
        });
    } catch (error) {
        console.error('Get earned badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving earned badges'
        });
    }
};

export const getUserAvailableBadges = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        const earnedBadgeIds = user.progress.badges.map(badge => badge.toString());
        
        const availableBadges = await Badge.find({
            isActive: true,
            _id: { $nin: earnedBadgeIds },
            ageGroups: { $in: [user.ageGroup, 'all'] }
        });

        res.json({
            success: true,
            data: availableBadges
        });
    } catch (error) {
        console.error('Get available badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving available badges'
        });
    }
};

export const getUserBadgeProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        const earnedBadgeIds = user.progress.badges.map(badge => badge.toString());
        
        const allBadges = await Badge.find({
            isActive: true,
            ageGroups: { $in: [user.ageGroup, 'all'] }
        });

        const badgeProgress = allBadges.map(badge => {
            const isEarned = earnedBadgeIds.includes(badge._id.toString());
            
            let progress = { current: 0, required: 1 };
            
            if (!isEarned) {
                switch (badge.requirements.type) {
                    case 'xp':
                        progress = {
                            current: user.progress.totalXP,
                            required: badge.requirements.value
                        };
                        break;
                    case 'modules_completed':
                        progress = {
                            current: user.progress.completedModules.length,
                            required: badge.requirements.value
                        };
                        break;
                    case 'challenges_completed':
                        progress = {
                            current: user.progress.completedChallenges.length,
                            required: badge.requirements.value
                        };
                        break;
                    case 'streak_days':
                        progress = {
                            current: user.progress.streakDays,
                            required: badge.requirements.value
                        };
                        break;
                }
            }

            return {
                badge,
                isEarned,
                progress,
                progressPercentage: Math.min(100, (progress.current / progress.required) * 100)
            };
        });

        res.json({
            success: true,
            data: badgeProgress
        });
    } catch (error) {
        console.error('Get badge progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving badge progress'
        });
    }
};
