// @ts-nocheck
import { Router } from 'express';
import {
    // Authentication
    registerUser,
    loginUser,
    logoutUser,
    
    // Profile management
    getUserProfile,
    updateUserProfile,
    updateUserSettings,
    deleteUserAccount,
    
    // Progress tracking
    updateUserProgress,
    getUserStats,
    
    // Leaderboard
    getUserLeaderboard,
    
    // Child management (for parents)
    addChild,
    getChildren,
    updateChild,
    deleteChild,
    
    // Child profile customization
    updateChildMascot,
    
    // Administration (for admin users)
    getAllUsers
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// Authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

// Authentication
router.post('/logout', authMiddleware, logoutUser);

// Profile management
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/settings', authMiddleware, updateUserSettings);
router.delete('/account', authMiddleware, deleteUserAccount);

// Progress tracking
router.put('/progress', authMiddleware, updateUserProgress);
router.get('/stats', authMiddleware, getUserStats);

// Child management (for parents)
router.post('/children', authMiddleware, addChild);
router.get('/children', authMiddleware, getChildren);
router.put('/children/:childId', authMiddleware, updateChild);
router.delete('/children/:childId', authMiddleware, deleteChild);

// Child profile customization (for children) - removed settings interface
router.get('/test-mascot', (req, res) => {
    res.json({ success: true, message: 'Mascot routes are working!' });
});
// Keep PUT for initial mascot assignment on first login
router.put('/mascot', authMiddleware, updateChildMascot);

// Leaderboard
router.get('/leaderboard', getUserLeaderboard);

// Administration routes (for admin users)
router.get('/admin/all', authMiddleware, getAllUsers);

export default router;
