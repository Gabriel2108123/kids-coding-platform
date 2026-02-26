// @ts-nocheck
import { Router } from 'express';
import {
    // Core module operations
    createModule,
    getModules,
    getModuleById,
    updateModule,
    deleteModule,
    
    // Module progress
    getModuleProgress,
    completeLessonProgress,
    getLessonContent,
    
    // Module discovery
    getModulesByCategory,
    getModulesByDifficulty,
    getRecommendedModules,
    getLearningPath,
    
    // Module analytics
    getModuleAnalytics
} from '../controllers/moduleController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get modules with filtering and pagination
router.get('/', getModules);
router.get('/category/:category', getModulesByCategory);
router.get('/difficulty/:difficulty', getModulesByDifficulty);
router.get('/:moduleId', getModuleById);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

// Module management (admin/instructor only)
router.post('/', authMiddleware, createModule);
router.put('/:moduleId', authMiddleware, updateModule);
router.delete('/:moduleId', authMiddleware, deleteModule);

// Module progress and learning
router.get('/:moduleId/progress', authMiddleware, getModuleProgress);
router.get('/:moduleId/lessons/:lessonId', authMiddleware, getLessonContent);
router.post('/:moduleId/lessons/:lessonId/complete', authMiddleware, completeLessonProgress);

// Personalized learning
router.get('/recommendations/me', authMiddleware, getRecommendedModules);
router.get('/learning-path/me', authMiddleware, getLearningPath);

// Module analytics (admin only)
router.get('/:moduleId/analytics', authMiddleware, getModuleAnalytics);

export default router;
