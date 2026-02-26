// @ts-nocheck
import { Router } from 'express';
import {
    // Core challenge operations
    createChallenge,
    getChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge,
    
    // Challenge participation
    startChallengeAttempt,
    submitChallengeAttempt,
    getChallengeHint,
    
    // Challenge analytics
    getChallengeLeaderboard,
    getUserChallengeProgress,
    
    // Challenge discovery
    getChallengesByCategory,
    getChallengesByDifficulty,
    getRecommendedChallenges
} from '../controllers/challengeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get challenges with filtering and pagination
router.get('/', getChallenges);
router.get('/category/:category', getChallengesByCategory);
router.get('/difficulty/:difficulty', getChallengesByDifficulty);
router.get('/:challengeId', getChallengeById);
router.get('/:challengeId/leaderboard', getChallengeLeaderboard);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

// Challenge management (admin/instructor only)
router.post('/', authMiddleware, createChallenge);
router.put('/:challengeId', authMiddleware, updateChallenge);
router.delete('/:challengeId', authMiddleware, deleteChallenge);

// Challenge participation
router.post('/:challengeId/start', authMiddleware, startChallengeAttempt);
router.post('/:challengeId/attempts/:attemptId/submit', authMiddleware, submitChallengeAttempt);
router.post('/:challengeId/attempts/:attemptId/hint', authMiddleware, getChallengeHint);

// User progress and analytics
router.get('/:challengeId/progress', authMiddleware, getUserChallengeProgress);
router.get('/recommendations/me', authMiddleware, getRecommendedChallenges);

export default router;
