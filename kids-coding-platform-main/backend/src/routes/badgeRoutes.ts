// @ts-nocheck
import { Router } from 'express';
import {
    // Core badge operations
    createBadge,
    getBadges,
    getBadgeById,
    updateBadge,
    deleteBadge,
    
    // Badge awarding
    awardBadge,
    revokeBadge,
    checkBadgeEligibility,
    
    // User badge management
    getUserBadges,
    getUserBadgeProgress,
    
    // Badge discovery
    getBadgesByCategory,
    getBadgesByRarity,
    getUserAvailableBadges,
    
    // Badge analytics
    getBadgeStats,
    getBadgeLeaderboard
} from '../controllers/badgeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get available badges
router.get('/', getBadges);
router.get('/category/:category', getBadgesByCategory);
router.get('/rarity/:rarity', getBadgesByRarity);
router.get('/:badgeId', getBadgeById);
router.get('/:badgeId/stats', getBadgeStats);
router.get('/:badgeId/leaderboard', getBadgeLeaderboard);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

// Badge management (admin/instructor only)
router.post('/', authMiddleware, createBadge);
router.put('/:badgeId', authMiddleware, updateBadge);
router.delete('/:badgeId', authMiddleware, deleteBadge);

// Badge awarding (admin/instructor only)
router.post('/:badgeId/award/:userId', authMiddleware, awardBadge);
router.delete('/:badgeId/revoke/:userId', authMiddleware, revokeBadge);

// User badge operations
router.get('/user/me', authMiddleware, getUserBadges);
router.get('/user/me/available', authMiddleware, getUserAvailableBadges);
router.get('/:badgeId/progress', authMiddleware, getUserBadgeProgress);
router.get('/:badgeId/eligibility', authMiddleware, checkBadgeEligibility);

export default router;
